#!/usr/bin/env python3
"""bounded_exec — 専用process group・期限・資源上限付きsubprocess実行ラッパー（scaffold仮組み）。

status: scaffold
authority_effect: none
issue: #3510 (comment 6386473748 / 6386507513 / 6405275048)

旧HELIXとの対応（AGENTS.md「再構築の原則」）：
- 旧source:
  - LEGACY-ASSET-378CB2CCCD11F9A49502（旧 src/runtime/provider-process-lifecycle.ts:11-15,118-160,173-400,
    sha256=a071f8437b7de6afc1d69f8dae3b37946aaa882adec1d7640db83bf0a222755d）
  - LEGACY-ASSET-15D88CCE539AA79ED788（旧 docs/design/helix/L6-function-design/worker-budget-lifecycle.md:11-55,
    sha256=dc366afb9d17229d3d963b4323bb3dad98a39ea0df268847f930cd9385acc8a2）
  - LEGACY-ASSET-504B2BF06DD84DBD7D97（旧 docs/design/helix/L3-requirements/worker-context-boundary-compiler.md:61-78,
    sha256=fd16ae604427dc7e64b34718ffc263a5993b34fe70e2806f8442a8688f57036c）
- 保持する点（意味の再導出）：
  - 対象argvをPOSIX専用process group（setsid）で起動し、無制限（<=0）のbudgetを拒否する。
  - timeout到達時および親プロセスが SIGINT/SIGTERM/SIGHUP を受けた時に、process group全体へ killpg(SIGTERM) を送り、
    grace期間後に生存していれば killpg(SIGKILL) を送り、ESRCH でgroup消滅を確かめる（呼出元が SIG_IGN にしているシグナルは上書きしない）。
  - direct childが期限内に終了した後も子孫プロセスがgroupに残る場合は tree_lingered として回収する。
  - 出力capture上限（max_output_bytes）を強制しつつ実観測byte数（stdout_bytes/stderr_bytes）とtruncatedを保持する。
  - 終了分類（timeout / signal / tree_lingered / reap_unconfirmed / spawn_failed / exit_nonzero / ok）を返し、
    exit 0単独ではtimeout・tree_lingered・signal・reap_unconfirmedを成功へ昇格しない。
- 変更する点と変更理由：
  - 旧HELIXはNode/TSのprovider CLI wrapper専用であり、メモリ上限（LEGACY-ASSET-A6C0C0BA3581CE8CF874）も終了後の事後照合のみだった。
    現行4 GUIレーン運用で直接起動される一時解析 python3 スクリプト等の孤児化・実行中メモリ膨張（#3510 comment 6386473748）を防ぐため、
    Python標準ライブラリのみで汎用argvを起動できる共通補助具とし、Linuxでは PR_SET_CHILD_SUBREAPER と waitpid(-pgid, WNOHANG) を併用して
    孤児化した孫ゾンビも自プロセスで回収し ESRCH を確実に確認する。さらに Linux では direct child に PR_SET_PDEATHSIG(SIGKILL) を設定し、
    ラッパー自身が SIGKILL 等で突然死した場合でも direct child が残らないように緩和する。
- 新規案1（旧HELIXに根拠なし）：
  - RLIMIT_AS（仮想メモリ上限）と RLIMIT_CPU（CPU時間上限）を既定値と引数で子プロセス起動時に設定する（HELIXSECURITY-L2-007 resource limitの仮組み）。
    既定値は仮組みの運転値であり、製品のgateや合格条件ではない。
- 仮組みとしての構造上の限界（明記）：
  - ラッパー自身が SIGKILL で強制終了された場合、Linux の PR_SET_PDEATHSIG(SIGKILL) により direct child は即座に SIGKILL されるが、
    direct child が既に生んでいた孫プロセスには PR_SET_PDEATHSIG が継承されないためラッパーからの回収は行えない。
  - 子孫プロセスが自ら setsid() / setpgid() を呼んで別セッション・別 process group へ逃避した場合は、killpg(pgid) と tree_lingered 検知の対象外となる。
  - RLIMIT_AS / RLIMIT_CPU はカーネルの per-process 制限（子孫へ継承）であり、cgroup のようなプロセスツリー全体の合算上限ではない。
"""
import argparse
import atexit
import ctypes
import errno
import fcntl
import json
import os
import resource
import selectors
import signal
import subprocess
import sys
import time

DEFAULT_TIMEOUT_MS = 120_000
DEFAULT_GRACE_MS = 100
DEFAULT_REAP_MS = 2_000
REAP_POLL_MS = 5
DEFAULT_MAX_OUTPUT_BYTES = 1_048_576  # 1 MiB
# 新規案1: L2-007 resource limitの仮組み既定値（gateや受入合格条件ではない）
DEFAULT_RLIMIT_AS_BYTES = 2 * 1024 * 1024 * 1024  # 2 GiB
DEFAULT_RLIMIT_CPU_SECONDS = 120  # 120 CPU seconds

FORWARDED_SIGNALS = (signal.SIGINT, signal.SIGTERM, signal.SIGHUP)
SIGNAL_EXIT_CODES = {
    "SIGHUP": 129,
    "SIGINT": 130,
    "SIGTERM": 143,
}
PR_SET_PDEATHSIG = 1
PR_SET_CHILD_SUBREAPER = 36
PR_GET_CHILD_SUBREAPER = 37


def _get_linux_libc():
    if not sys.platform.startswith("linux"):
        return None
    try:
        libc = ctypes.CDLL(None)
        libc.prctl.argtypes = [
            ctypes.c_int,
            ctypes.c_ulong,
            ctypes.c_ulong,
            ctypes.c_ulong,
            ctypes.c_ulong,
        ]
        libc.prctl.restype = ctypes.c_int
        return libc
    except Exception:
        return None


def assert_supported_platform(platform_name=None, has_killpg=None):
    name = os.name if platform_name is None else platform_name
    killpg_ok = hasattr(os, "killpg") if has_killpg is None else bool(has_killpg)
    if name != "posix" or not killpg_ok:
        raise RuntimeError(f"bounded_exec_process_group_unsupported:{name}")


def _require_positive_int(value, name):
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise ValueError(f"{name} must be a positive integer")
    return value


def _require_non_negative_int(value, name):
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise ValueError(f"{name} must be a non-negative integer")
    return value


def validate_bounds(
    argv,
    timeout_ms=DEFAULT_TIMEOUT_MS,
    grace_ms=DEFAULT_GRACE_MS,
    reap_ms=DEFAULT_REAP_MS,
    max_output_bytes=DEFAULT_MAX_OUTPUT_BYTES,
    rlimit_as_bytes=DEFAULT_RLIMIT_AS_BYTES,
    rlimit_cpu_seconds=DEFAULT_RLIMIT_CPU_SECONDS,
):
    if not isinstance(argv, (list, tuple)) or not argv or any(not isinstance(x, str) or not x for x in argv):
        raise ValueError("argv must be a non-empty sequence of non-empty strings")
    _require_positive_int(timeout_ms, "timeout_ms")
    _require_positive_int(grace_ms, "grace_ms")
    _require_positive_int(reap_ms, "reap_ms")
    _require_non_negative_int(max_output_bytes, "max_output_bytes")
    _require_positive_int(rlimit_as_bytes, "rlimit_as_bytes")
    _require_positive_int(rlimit_cpu_seconds, "rlimit_cpu_seconds")


def _configure_subreaper(enable):
    libc = _get_linux_libc()
    if libc is None:
        return None
    try:
        prev = ctypes.c_int(0)
        ptr = ctypes.cast(ctypes.byref(prev), ctypes.c_void_p).value or 0
        if libc.prctl(PR_GET_CHILD_SUBREAPER, ptr, 0, 0, 0) != 0:
            return None
        if libc.prctl(PR_SET_CHILD_SUBREAPER, 1 if enable else 0, 0, 0, 0) != 0:
            return None
        return int(prev.value)
    except Exception:
        return None


def reap_process_group_zombies(pgid):
    if pgid is None or pgid <= 0:
        return
    while True:
        try:
            wpid, _ = os.waitpid(-pgid, os.WNOHANG)
            if wpid <= 0:
                break
        except (ChildProcessError, PermissionError, OSError):
            break


def process_group_alive(pgid, killpg_fn=os.killpg):
    if pgid is None or pgid <= 0:
        return False
    reap_process_group_zombies(pgid)
    try:
        killpg_fn(pgid, 0)
        return True
    except ProcessLookupError:
        return False
    except OSError as err:
        return err.errno != errno.ESRCH


def signal_process_group(pgid, sig, killpg_fn=os.killpg):
    if pgid is None or pgid <= 0:
        return f"process_group_unavailable:{sig}"
    try:
        killpg_fn(pgid, sig)
        return None
    except ProcessLookupError:
        return None
    except OSError as err:
        if err.errno == errno.ESRCH:
            return None
        return str(err)


def _clamp_rlimit(res_kind, requested):
    try:
        _, hard = resource.getrlimit(res_kind)
    except (OSError, ValueError):
        return requested
    if hard != resource.RLIM_INFINITY and hard > 0:
        return min(requested, hard)
    return requested


def effective_rlimits(rlimit_as_bytes, rlimit_cpu_seconds):
    return (
        _clamp_rlimit(resource.RLIMIT_AS, rlimit_as_bytes),
        _clamp_rlimit(resource.RLIMIT_CPU, rlimit_cpu_seconds),
    )


def _make_preexec(as_bytes, cpu_seconds, parent_pid):
    libc = _get_linux_libc()

    def _apply():
        os.setsid()
        if libc is not None:
            try:
                libc.prctl(PR_SET_PDEATHSIG, signal.SIGKILL, 0, 0, 0)
                if os.getppid() != parent_pid:
                    os.kill(os.getpid(), signal.SIGKILL)
            except Exception:
                pass
        resource.setrlimit(resource.RLIMIT_AS, (as_bytes, as_bytes))
        resource.setrlimit(resource.RLIMIT_CPU, (cpu_seconds, cpu_seconds))

    return _apply


class _BoundedOutput:
    def __init__(self, limit_bytes):
        self.limit_bytes = limit_bytes
        self.stdout_chunks = []
        self.stderr_chunks = []
        self.stdout_bytes = 0
        self.stderr_bytes = 0
        self.captured_bytes = 0
        self.output_truncated = False

    def feed(self, stream_name, data):
        if not data:
            return
        n = len(data)
        if stream_name == "stdout":
            self.stdout_bytes += n
        else:
            self.stderr_bytes += n
        remaining = self.limit_bytes - self.captured_bytes
        if remaining > 0:
            accepted = data[:remaining]
            if stream_name == "stdout":
                self.stdout_chunks.append(accepted)
            else:
                self.stderr_chunks.append(accepted)
            self.captured_bytes += len(accepted)
        if n > remaining:
            self.output_truncated = True

    def snapshot(self):
        return {
            "stdout": b"".join(self.stdout_chunks).decode("utf-8", "replace"),
            "stderr": b"".join(self.stderr_chunks).decode("utf-8", "replace"),
            "stdout_bytes": self.stdout_bytes,
            "stderr_bytes": self.stderr_bytes,
            "output_truncated": self.output_truncated,
        }


def classify_terminal(outcome):
    """終了分類（timeout / signal / tree_lingered / reap_unconfirmed / spawn_failed / exit_nonzero / ok）。

    exit 0単独では、timeout・残存tree・signal・reap未確認を成功へ昇格しない。
    """
    if not outcome.get("reaped", False):
        return {"ok": False, "classification": "reap_unconfirmed", "failure": "reap_unconfirmed"}
    if outcome.get("timed_out"):
        return {"ok": False, "classification": "timeout", "failure": "timeout"}
    if outcome.get("tree_lingered"):
        return {"ok": False, "classification": "tree_lingered", "failure": "tree_lingered"}
    if outcome.get("interrupted_by") is not None or outcome.get("signal") is not None:
        return {"ok": False, "classification": "signal", "failure": "signal"}
    if outcome.get("error") is not None:
        return {"ok": False, "classification": "spawn_failed", "failure": "spawn_failed"}
    if outcome.get("status") != 0:
        return {"ok": False, "classification": "exit_nonzero", "failure": "exit_nonzero"}
    return {"ok": True, "classification": "ok", "failure": None}


def exit_code_for_outcome(outcome):
    terminal = classify_terminal(outcome)
    if terminal["ok"]:
        return 0
    interrupted = outcome.get("interrupted_by")
    if interrupted in SIGNAL_EXIT_CODES:
        return SIGNAL_EXIT_CODES[interrupted]
    if terminal["classification"] == "timeout":
        return 124
    status = outcome.get("status")
    if isinstance(status, int) and status > 0 and terminal["classification"] == "exit_nonzero":
        return status
    return 1


def run_bounded(
    argv,
    *,
    timeout_ms=DEFAULT_TIMEOUT_MS,
    grace_ms=DEFAULT_GRACE_MS,
    reap_ms=DEFAULT_REAP_MS,
    max_output_bytes=DEFAULT_MAX_OUTPUT_BYTES,
    rlimit_as_bytes=DEFAULT_RLIMIT_AS_BYTES,
    rlimit_cpu_seconds=DEFAULT_RLIMIT_CPU_SECONDS,
    cwd=None,
    env=None,
    stdin_data=None,
    killpg_fn=os.killpg,
    platform_name=None,
):
    validate_bounds(
        argv,
        timeout_ms=timeout_ms,
        grace_ms=grace_ms,
        reap_ms=reap_ms,
        max_output_bytes=max_output_bytes,
        rlimit_as_bytes=rlimit_as_bytes,
        rlimit_cpu_seconds=rlimit_cpu_seconds,
    )
    started_ns = time.monotonic_ns()
    applied_as, applied_cpu = effective_rlimits(rlimit_as_bytes, rlimit_cpu_seconds)
    output = _BoundedOutput(max_output_bytes)

    def _elapsed_ms():
        return int((time.monotonic_ns() - started_ns) // 1_000_000)

    def _finalize(
        status,
        sig_name,
        timed_out,
        tree_lingered,
        interrupted_by,
        termination_stage,
        reaped,
        pgid,
        errors,
    ):
        err_text = "; ".join(e for e in errors if e) if any(errors) else None
        base = {
            "schema": "helix-bounded-exec-outcome.v1",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "status": status,
            "signal": sig_name,
            **output.snapshot(),
            "timed_out": bool(timed_out),
            "tree_lingered": bool(tree_lingered),
            "interrupted_by": interrupted_by,
            "deadline_ms": timeout_ms,
            "grace_ms": grace_ms,
            "reap_ms": reap_ms,
            "rlimit_as_bytes": applied_as,
            "rlimit_cpu_seconds": applied_cpu,
            "max_output_bytes": max_output_bytes,
            "termination_stage": termination_stage,
            "duration_ms": _elapsed_ms(),
            "reaped": bool(reaped),
            "pgid": pgid,
            "error": err_text,
        }
        terminal = classify_terminal(base)
        base["ok"] = terminal["ok"]
        base["classification"] = terminal["classification"]
        base["failure"] = terminal["failure"]
        return base

    try:
        assert_supported_platform(platform_name=platform_name)
    except Exception as exc:
        return _finalize(None, None, False, False, None, "none", True, None, [str(exc)])

    errors = []
    interrupted = [None]
    previous_handlers = {}

    def _on_signal(signum, _frame):
        if interrupted[0] is None:
            try:
                interrupted[0] = signal.Signals(signum).name
            except ValueError:
                interrupted[0] = f"SIG{signum}"

    # m1 / m3: Popenより前にシグナルハンドラを登録してPopen直後の窓を塞ぎ、呼出元のSIG_IGNは上書きしない。
    for sig in FORWARDED_SIGNALS:
        try:
            old_handler = signal.getsignal(sig)
            if old_handler == signal.SIG_IGN:
                continue
            signal.signal(sig, _on_signal)
            previous_handlers[sig] = old_handler
        except (ValueError, OSError) as err:
            errors.append(f"signal_handler_registration_failed:{sig.name}:{err}")

    def _restore_signal_handlers():
        for sig, old_handler in previous_handlers.items():
            try:
                signal.signal(sig, old_handler)
            except (ValueError, OSError) as err:
                errors.append(f"signal_handler_restore_failed:{sig.name}:{err}")
        previous_handlers.clear()

    if errors or interrupted[0] is not None:
        _restore_signal_handlers()
        return _finalize(None, None, False, False, interrupted[0], "none", True, None, errors)

    prev_subreaper = _configure_subreaper(True)
    parent_pid = os.getpid()
    raw_in = None
    if stdin_data is not None:
        raw_in = memoryview(stdin_data.encode("utf-8") if isinstance(stdin_data, str) else bytes(stdin_data))

    pgid = None
    reaped = False
    atexit_active = [False]

    def _exit_fence():
        if atexit_active[0] and pgid is not None:
            signal_process_group(pgid, signal.SIGKILL, killpg_fn=killpg_fn)

    selector = None
    stream_map = {}
    stdin_state = {"fd": None, "pipe": None, "offset": 0}

    def _close_stdin():
        fd = stdin_state["fd"]
        pipe_obj = stdin_state["pipe"]
        stdin_state["fd"] = None
        stdin_state["pipe"] = None
        if fd is not None and selector is not None:
            try:
                selector.unregister(fd)
            except Exception:
                pass
        if pipe_obj is not None:
            try:
                pipe_obj.close()
            except OSError:
                pass

    def _close_pipes():
        _close_stdin()
        if selector is None:
            return
        for fd in list(stream_map):
            while True:
                try:
                    chunk = os.read(fd, 65536)
                except (BlockingIOError, OSError):
                    break
                if not chunk:
                    break
                output.feed(stream_map[fd][0], chunk)
            try:
                selector.unregister(fd)
            except Exception:
                pass
            _, pipe_obj = stream_map.pop(fd, (None, None))
            if pipe_obj is not None:
                try:
                    pipe_obj.close()
                except OSError:
                    pass
        try:
            selector.close()
        except Exception:
            pass

    def _release_handlers(is_reaped):
        _restore_signal_handlers()
        if is_reaped:
            atexit_active[0] = False
            try:
                atexit.unregister(_exit_fence)
            except Exception:
                pass
            if prev_subreaper is not None:
                _configure_subreaper(bool(prev_subreaper))

    try:
        try:
            child = subprocess.Popen(
                [str(x) for x in argv],
                cwd=cwd,
                env=env,
                stdin=subprocess.PIPE if raw_in is not None else subprocess.DEVNULL,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                shell=False,
                preexec_fn=_make_preexec(applied_as, applied_cpu, parent_pid),
            )
        except Exception as exc:
            reaped = True
            if prev_subreaper is not None:
                _configure_subreaper(bool(prev_subreaper))
            _restore_signal_handlers()
            return _finalize(None, None, False, False, interrupted[0], "none", True, None, [str(exc)])

        pgid = child.pid
        atexit_active[0] = True
        atexit.register(_exit_fence)

        selector = selectors.DefaultSelector()
        for name, pipe in (("stdout", child.stdout), ("stderr", child.stderr)):
            if pipe is not None:
                fd = pipe.fileno()
                fl = fcntl.fcntl(fd, fcntl.F_GETFL)
                fcntl.fcntl(fd, fcntl.F_SETFL, fl | os.O_NONBLOCK)
                selector.register(fd, selectors.EVENT_READ, name)
                stream_map[fd] = (name, pipe)

        # M1: stdin_dataはO_NONBLOCK + EVENT_WRITEでselectorループ内（deadline/interrupt管理下）で書き込む。
        if raw_in is not None and child.stdin is not None:
            if len(raw_in) == 0:
                try:
                    child.stdin.close()
                except OSError:
                    pass
            else:
                sfd = child.stdin.fileno()
                fl = fcntl.fcntl(sfd, fcntl.F_GETFL)
                fcntl.fcntl(sfd, fcntl.F_SETFL, fl | os.O_NONBLOCK)
                stdin_state["fd"] = sfd
                stdin_state["pipe"] = child.stdin
                stdin_state["offset"] = 0
                selector.register(sfd, selectors.EVENT_WRITE, "stdin")

        def _drain_pipes(wait_sec=0.0):
            if not stream_map and stdin_state["fd"] is None:
                if wait_sec > 0:
                    time.sleep(wait_sec)
                return
            events = selector.select(timeout=max(0.0, wait_sec))
            for key, _ in events:
                fd = key.fd
                stream_name = key.data
                if stream_name == "stdin":
                    while stdin_state["fd"] is not None:
                        off = stdin_state["offset"]
                        rem = len(raw_in) - off
                        if rem <= 0:
                            _close_stdin()
                            break
                        try:
                            written = os.write(fd, raw_in[off : off + min(65536, rem)])
                        except BlockingIOError:
                            break
                        except OSError:
                            _close_stdin()
                            break
                        if written <= 0:
                            _close_stdin()
                            break
                        stdin_state["offset"] = off + written
                        if stdin_state["offset"] >= len(raw_in):
                            _close_stdin()
                            break
                    continue

                while True:
                    try:
                        chunk = os.read(fd, 65536)
                    except BlockingIOError:
                        break
                    except OSError:
                        chunk = b""
                    if not chunk:
                        try:
                            selector.unregister(fd)
                        except Exception:
                            pass
                        _, pipe_obj = stream_map.pop(fd, (None, None))
                        if pipe_obj is not None:
                            try:
                                pipe_obj.close()
                            except OSError:
                                pass
                        break
                    output.feed(stream_name, chunk)

        child_rc = [None]

        def _poll_child():
            if child_rc[0] is None:
                rc = child.poll()
                if rc is not None:
                    child_rc[0] = rc
                    _close_stdin()
            return child_rc[0] is not None

        def _child_and_group_reaped(check_group):
            if not _poll_child():
                return False
            if not check_group:
                return True
            return not process_group_alive(pgid, killpg_fn=killpg_fn)

        def _wait_until(check_group, deadline_ns, stop_on_interrupt=False):
            while not _child_and_group_reaped(check_group):
                if stop_on_interrupt and interrupted[0] is not None:
                    return "interrupted"
                remaining_ns = deadline_ns - time.monotonic_ns()
                if remaining_ns <= 0:
                    return False
                step_sec = min(REAP_POLL_MS / 1000.0, remaining_ns / 1_000_000_000.0)
                _drain_pipes(wait_sec=max(0.001, step_sec))
            _drain_pipes(wait_sec=0.0)
            return True

        def _decode_rc():
            rc = child_rc[0]
            if rc is None:
                return None, None
            if rc < 0:
                try:
                    return None, signal.Signals(-rc).name
                except ValueError:
                    return None, f"SIG{-rc}"
            return int(rc), None

        execution_deadline_ns = started_ns + timeout_ms * 1_000_000
        first = _wait_until(check_group=False, deadline_ns=execution_deadline_ns, stop_on_interrupt=True)

        if first is True and interrupted[0] is None:
            grace_deadline_ns = time.monotonic_ns() + grace_ms * 1_000_000
            grace_res = _wait_until(check_group=True, deadline_ns=grace_deadline_ns, stop_on_interrupt=True)
            reaped = grace_res is True
            # m2: grace待ち中に親がシグナルを受けた場合もinterrupted[0]を結果に反映し、未回収なら段階停止へ進む。
            if reaped:
                _close_pipes()
                _release_handlers(True)
                status, sig_name = _decode_rc()
                return _finalize(status, sig_name, False, False, interrupted[0], "none", True, pgid, errors)

            if interrupted[0] is None:
                # Direct child exited within deadline, but descendant processes lingered in the process group.
                termination_stage = "term_sent"
                errors.append(signal_process_group(pgid, signal.SIGTERM, killpg_fn=killpg_fn))
                grace_deadline_ns = time.monotonic_ns() + grace_ms * 1_000_000
                reaped = _wait_until(check_group=True, deadline_ns=grace_deadline_ns, stop_on_interrupt=False) is True
                if not reaped and process_group_alive(pgid, killpg_fn=killpg_fn):
                    termination_stage = "kill_sent"
                    errors.append(signal_process_group(pgid, signal.SIGKILL, killpg_fn=killpg_fn))
                if not reaped:
                    reap_deadline_ns = time.monotonic_ns() + reap_ms * 1_000_000
                    reaped = _wait_until(check_group=True, deadline_ns=reap_deadline_ns, stop_on_interrupt=False) is True
                if not reaped:
                    errors.append("process_group_reap_timeout")
                _close_pipes()
                _release_handlers(reaped)
                status, sig_name = _decode_rc()
                return _finalize(status, sig_name, False, True, interrupted[0], termination_stage, reaped, pgid, errors)

        timed_out = first is False and interrupted[0] is None
        interrupted_by = interrupted[0]
        _close_stdin()
        termination_stage = "term_sent"
        errors.append(signal_process_group(pgid, signal.SIGTERM, killpg_fn=killpg_fn))
        grace_deadline_ns = time.monotonic_ns() + grace_ms * 1_000_000
        reaped = _wait_until(check_group=True, deadline_ns=grace_deadline_ns, stop_on_interrupt=False) is True
        if not reaped and process_group_alive(pgid, killpg_fn=killpg_fn):
            termination_stage = "kill_sent"
            errors.append(signal_process_group(pgid, signal.SIGKILL, killpg_fn=killpg_fn))
        if not reaped:
            reap_deadline_ns = time.monotonic_ns() + reap_ms * 1_000_000
            reaped = _wait_until(check_group=True, deadline_ns=reap_deadline_ns, stop_on_interrupt=False) is True
        if not reaped:
            errors.append("process_group_reap_timeout")
        _close_pipes()
        _release_handlers(reaped)
        status, sig_name = _decode_rc()
        return _finalize(status, sig_name, timed_out, False, interrupted_by, termination_stage, reaped, pgid, errors)
    finally:
        # m1: 予期しない例外で抜ける場合でもprocess groupをSIGKILLし、ハンドラ・pipeを片付ける。
        if pgid is not None and not reaped:
            signal_process_group(pgid, signal.SIGKILL, killpg_fn=killpg_fn)
            reap_process_group_zombies(pgid)
        _close_pipes()
        _restore_signal_handlers()


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--timeout-ms", type=int, default=DEFAULT_TIMEOUT_MS)
    parser.add_argument("--grace-ms", type=int, default=DEFAULT_GRACE_MS)
    parser.add_argument("--reap-ms", type=int, default=DEFAULT_REAP_MS)
    parser.add_argument("--max-output-bytes", type=int, default=DEFAULT_MAX_OUTPUT_BYTES)
    parser.add_argument("--rlimit-as-bytes", type=int, default=DEFAULT_RLIMIT_AS_BYTES)
    parser.add_argument("--rlimit-cpu-seconds", type=int, default=DEFAULT_RLIMIT_CPU_SECONDS)
    parser.add_argument("--cwd", default=None)
    parser.add_argument("command", nargs=argparse.REMAINDER, help="実行するコマンドと引数（先頭の -- は除く）")
    args = parser.parse_args(argv)
    cmd = list(args.command)
    if cmd and cmd[0] == "--":
        cmd = cmd[1:]
    if not cmd:
        parser.error("実行するコマンドが必要（例: bounded_exec.py -- python3 script.py）")
    try:
        outcome = run_bounded(
            cmd,
            timeout_ms=args.timeout_ms,
            grace_ms=args.grace_ms,
            reap_ms=args.reap_ms,
            max_output_bytes=args.max_output_bytes,
            rlimit_as_bytes=args.rlimit_as_bytes,
            rlimit_cpu_seconds=args.rlimit_cpu_seconds,
            cwd=args.cwd,
        )
    except ValueError as err:
        parser.exit(2, f"scaffold bounded_exec: 入力不正: {err}\n")
    json.dump(outcome, sys.stdout, ensure_ascii=False, sort_keys=True)
    sys.stdout.write("\n")
    sys.stdout.flush()
    return exit_code_for_outcome(outcome)


if __name__ == "__main__":
    raise SystemExit(main())
