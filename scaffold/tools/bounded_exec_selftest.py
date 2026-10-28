#!/usr/bin/env python3
"""Selftest for scaffold/tools/bounded_exec.py (evidence_kind: scaffold, authority_effect: none)."""

import errno
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import threading
import time
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bounded_exec as b


def process_alive(pid):
    """m4: /proc/<pid>/stat の状態 Z (zombie) を除外して生存判定する。"""
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        pass
    stat_path = Path("/proc") / str(pid) / "stat"
    try:
        raw = stat_path.read_text(encoding="utf-8", errors="replace")
        close_paren = raw.rfind(")")
        if close_paren > 0:
            state_code = raw[close_paren + 1 :].split()[0]
            if state_code == "Z":
                return False
    except OSError:
        pass
    return True


class BoundedExecSelftest(unittest.TestCase):
    def test_classify_terminal_never_promotes_exit_zero_with_lifecycle_failure(self):
        base = {
            "status": 0,
            "signal": None,
            "timed_out": False,
            "tree_lingered": False,
            "interrupted_by": None,
            "reaped": True,
            "error": None,
        }
        self.assertEqual(
            b.classify_terminal(base),
            {"ok": True, "classification": "ok", "failure": None},
        )
        self.assertEqual(
            b.classify_terminal({**base, "timed_out": True}),
            {"ok": False, "classification": "timeout", "failure": "timeout"},
        )
        self.assertEqual(
            b.classify_terminal({**base, "tree_lingered": True}),
            {
                "ok": False,
                "classification": "tree_lingered",
                "failure": "tree_lingered",
            },
        )
        self.assertEqual(
            b.classify_terminal({**base, "interrupted_by": "SIGINT"}),
            {"ok": False, "classification": "signal", "failure": "signal"},
        )
        self.assertEqual(
            b.classify_terminal({**base, "signal": "SIGKILL", "status": None}),
            {"ok": False, "classification": "signal", "failure": "signal"},
        )
        self.assertEqual(
            b.classify_terminal({**base, "reaped": False}),
            {
                "ok": False,
                "classification": "reap_unconfirmed",
                "failure": "reap_unconfirmed",
            },
        )
        self.assertEqual(
            b.classify_terminal({**base, "error": "spawn_error", "status": None}),
            {"ok": False, "classification": "spawn_failed", "failure": "spawn_failed"},
        )
        self.assertEqual(
            b.classify_terminal({**base, "status": 3}),
            {"ok": False, "classification": "exit_nonzero", "failure": "exit_nonzero"},
        )

    def test_invalid_bounds_and_unsupported_platform_rejected(self):
        for bad_kwargs in (
            {"argv": []},
            {"argv": [""]},
            {"argv": ["true"], "timeout_ms": 0},
            {"argv": ["true"], "timeout_ms": -1},
            {"argv": ["true"], "grace_ms": 0},
            {"argv": ["true"], "reap_ms": 0},
            {"argv": ["true"], "max_output_bytes": -1},
            {"argv": ["true"], "rlimit_as_bytes": 0},
            {"argv": ["true"], "rlimit_cpu_seconds": 0},
        ):
            with self.subTest(bad_kwargs=bad_kwargs):
                with self.assertRaises(ValueError):
                    b.validate_bounds(**bad_kwargs)

        outcome = b.run_bounded([sys.executable, "-c", "pass"], platform_name="nt")
        self.assertFalse(outcome["ok"])
        self.assertEqual(outcome["classification"], "spawn_failed")
        self.assertIn("bounded_exec_process_group_unsupported:nt", outcome["error"])

    def test_normal_completion_and_bounded_output_truncation(self):
        outcome = b.run_bounded(
            [
                sys.executable,
                "-c",
                "import sys; data = sys.stdin.read(); sys.stdout.write(data + '123456'); sys.stderr.write('abcdef')",
            ],
            timeout_ms=2_000,
            max_output_bytes=10,
            stdin_data="hi:",
        )
        self.assertTrue(outcome["ok"])
        self.assertEqual(outcome["classification"], "ok")
        self.assertEqual(outcome["status"], 0)
        self.assertIsNone(outcome["signal"])
        self.assertFalse(outcome["timed_out"])
        self.assertFalse(outcome["tree_lingered"])
        self.assertTrue(outcome["reaped"])
        self.assertEqual(outcome["stdout_bytes"], 9)
        self.assertEqual(outcome["stderr_bytes"], 6)
        self.assertTrue(outcome["output_truncated"])
        self.assertEqual(
            len(outcome["stdout"].encode("utf-8"))
            + len(outcome["stderr"].encode("utf-8")),
            10,
        )

    def test_large_stdin_nonblocking_delivery_and_timeout_when_unread(self):
        # M1: 64KiB超（300KiB）のstdinを完全に非同期書込できることと、childがstdinを読まない場合でもtimeoutが効くことを確認する。
        large_payload = b"A" * (300 * 1024)
        read_outcome = b.run_bounded(
            [
                sys.executable,
                "-c",
                "import sys; sys.stdout.write(str(len(sys.stdin.buffer.read())))",
            ],
            timeout_ms=3_000,
            stdin_data=large_payload,
        )
        self.assertTrue(read_outcome["ok"])
        self.assertEqual(read_outcome["stdout"], str(len(large_payload)))

        t0 = time.monotonic()
        unread_outcome = b.run_bounded(
            [sys.executable, "-c", "import time; time.sleep(5)"],
            timeout_ms=200,
            grace_ms=40,
            reap_ms=1_000,
            stdin_data=large_payload,
        )
        elapsed = time.monotonic() - t0
        self.assertFalse(unread_outcome["ok"])
        self.assertTrue(unread_outcome["timed_out"])
        self.assertEqual(unread_outcome["classification"], "timeout")
        self.assertTrue(unread_outcome["reaped"])
        self.assertLess(elapsed, 2.5)

    def test_timeout_kills_process_group_and_confirms_esrch(self):
        with tempfile.TemporaryDirectory() as tmp:
            ready_file = Path(tmp) / "g_ready.txt"
            pid_file = Path(tmp) / "pids.json"
            late_marker = Path(tmp) / "late.txt"
            child_code = (
                "import json, os, pathlib, signal, subprocess, sys, time\n"
                "signal.signal(signal.SIGTERM, signal.SIG_IGN)\n"
                "g = subprocess.Popen([sys.executable, '-c', "
                '"import pathlib, signal, sys, time; signal.signal(signal.SIGTERM, signal.SIG_IGN); '
                "pathlib.Path(sys.argv[1]).write_text('ready'); "
                "time.sleep(1.2); pathlib.Path(sys.argv[2]).write_text('late')\", "
                "sys.argv[1], sys.argv[3]])\n"
                "while not pathlib.Path(sys.argv[1]).exists():\n"
                "    time.sleep(0.005)\n"
                "with open(sys.argv[2], 'w') as f:\n"
                "    json.dump({'parent_pid': os.getpid(), 'child_pid': g.pid, 'pgid': os.getpgrp()}, f)\n"
                "time.sleep(30)\n"
            )
            outcome = b.run_bounded(
                [
                    sys.executable,
                    "-c",
                    child_code,
                    str(ready_file),
                    str(pid_file),
                    str(late_marker),
                ],
                timeout_ms=400,
                grace_ms=60,
                reap_ms=1_500,
            )
            pids = json.loads(pid_file.read_text(encoding="utf-8"))
            self.assertFalse(outcome["ok"])
            self.assertEqual(outcome["classification"], "timeout")
            self.assertTrue(outcome["timed_out"])
            self.assertFalse(outcome["tree_lingered"])
            self.assertEqual(outcome["termination_stage"], "kill_sent")
            self.assertTrue(outcome["reaped"])
            self.assertEqual(b.exit_code_for_outcome(outcome), 124)
            self.assertFalse(process_alive(pids["parent_pid"]))
            self.assertFalse(process_alive(pids["child_pid"]))
            with self.assertRaises(ProcessLookupError) as ctx:
                os.killpg(pids["pgid"], 0)
            self.assertEqual(ctx.exception.errno, errno.ESRCH)
            time.sleep(0.2)
            self.assertFalse(late_marker.exists())

    def test_tree_lingered_reaps_grandchild_after_direct_child_exits_zero(self):
        with tempfile.TemporaryDirectory() as tmp:
            ready_file = Path(tmp) / "g_ready.txt"
            pid_file = Path(tmp) / "lingering.json"
            child_code = (
                "import json, os, pathlib, signal, subprocess, sys, time\n"
                "g = subprocess.Popen([sys.executable, '-c', "
                '"import pathlib, signal, sys, time; signal.signal(signal.SIGTERM, signal.SIG_IGN); '
                "pathlib.Path(sys.argv[1]).write_text('ready'); time.sleep(30)\", sys.argv[1]], "
                "stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)\n"
                "while not pathlib.Path(sys.argv[1]).exists():\n"
                "    time.sleep(0.005)\n"
                "with open(sys.argv[2], 'w') as f:\n"
                "    json.dump({'parent_pid': os.getpid(), 'child_pid': g.pid, 'pgid': os.getpgrp()}, f)\n"
                "sys.stdout.write('direct-done')\n"
            )
            t0 = time.monotonic()
            outcome = b.run_bounded(
                [sys.executable, "-c", child_code, str(ready_file), str(pid_file)],
                timeout_ms=5_000,
                grace_ms=60,
                reap_ms=1_500,
            )
            elapsed = time.monotonic() - t0
            pids = json.loads(pid_file.read_text(encoding="utf-8"))
            self.assertFalse(outcome["ok"])
            self.assertEqual(outcome["classification"], "tree_lingered")
            self.assertEqual(outcome["status"], 0)
            self.assertEqual(outcome["stdout"], "direct-done")
            self.assertFalse(outcome["timed_out"])
            self.assertTrue(outcome["tree_lingered"])
            self.assertEqual(outcome["termination_stage"], "kill_sent")
            self.assertTrue(outcome["reaped"])
            self.assertLess(elapsed, 4.0)
            self.assertFalse(process_alive(pids["child_pid"]))
            with self.assertRaises(ProcessLookupError):
                os.killpg(pids["pgid"], 0)

    def test_parent_signal_forwarded_to_process_group_and_reaped(self):
        for sig_name, expected_code in (
            ("SIGINT", 130),
            ("SIGTERM", 143),
            ("SIGHUP", 129),
        ):
            with self.subTest(signal=sig_name):
                with tempfile.TemporaryDirectory() as tmp:
                    ready_file = Path(tmp) / "g_ready.txt"
                    pid_file = Path(tmp) / "sig_pids.json"
                    out_file = Path(tmp) / "outcome.json"
                    child_code = (
                        "import json, os, pathlib, signal, subprocess, sys, time\n"
                        "signal.signal(signal.SIGTERM, signal.SIG_IGN)\n"
                        "g = subprocess.Popen([sys.executable, '-c', "
                        '"import pathlib, signal, sys, time; signal.signal(signal.SIGTERM, signal.SIG_IGN); '
                        "pathlib.Path(sys.argv[1]).write_text('ready'); time.sleep(30)\", sys.argv[1]])\n"
                        "while not pathlib.Path(sys.argv[1]).exists():\n"
                        "    time.sleep(0.005)\n"
                        "with open(sys.argv[2], 'w') as f:\n"
                        "    json.dump({'parent_pid': os.getpid(), 'child_pid': g.pid, 'pgid': os.getpgrp()}, f)\n"
                        "time.sleep(30)\n"
                    )
                    wrapper_code = (
                        "import json, pathlib, signal, sys\n"
                        "for _s in (signal.SIGINT, signal.SIGTERM, signal.SIGHUP):\n"
                        "    signal.signal(_s, signal.SIG_DFL)\n"
                        f"sys.path.insert(0, {json.dumps(str(Path(__file__).resolve().parent))})\n"
                        "import bounded_exec as b\n"
                        "outcome = b.run_bounded([sys.executable, '-c', sys.argv[1], sys.argv[2], sys.argv[3]], "
                        "timeout_ms=10000, grace_ms=60, reap_ms=1500)\n"
                        "pathlib.Path(sys.argv[4]).write_text(json.dumps(outcome))\n"
                        "raise SystemExit(b.exit_code_for_outcome(outcome))\n"
                    )
                    wrapper = subprocess.Popen(
                        [
                            sys.executable,
                            "-c",
                            wrapper_code,
                            child_code,
                            str(ready_file),
                            str(pid_file),
                            str(out_file),
                        ],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                    )
                    try:
                        deadline = time.monotonic() + 8.0
                        while not pid_file.exists():
                            if time.monotonic() >= deadline:
                                self.fail("pid_file was not created in time")
                            time.sleep(0.01)
                        sig_num = getattr(signal, sig_name)
                        wrapper.send_signal(sig_num)
                        # Send a second signal while wrapper is in grace/reap to confirm idempotence.
                        try:
                            wrapper.send_signal(sig_num)
                        except ProcessLookupError:
                            pass
                        rc = wrapper.wait(timeout=8.0)
                    finally:
                        if wrapper.poll() is None:
                            wrapper.kill()
                            wrapper.wait()
                    self.assertEqual(rc, expected_code)
                    pids = json.loads(pid_file.read_text(encoding="utf-8"))
                    outcome = json.loads(out_file.read_text(encoding="utf-8"))
                    self.assertFalse(outcome["ok"])
                    self.assertEqual(outcome["classification"], "signal")
                    self.assertEqual(outcome["interrupted_by"], sig_name)
                    self.assertTrue(outcome["reaped"])
                    self.assertFalse(process_alive(pids["parent_pid"]))
                    self.assertFalse(process_alive(pids["child_pid"]))

    def test_signal_handler_failure_and_sig_ign_preservation_and_grace_interrupt(self):
        # m1: 非メインスレッド等でのsignal.signal登録失敗（ValueError）を黙殺せずoutcome["error"]へ記録する。
        holder = {}

        def _in_worker_thread():
            holder["outcome"] = b.run_bounded(
                [sys.executable, "-c", "pass"], timeout_ms=1_000
            )

        t = threading.Thread(target=_in_worker_thread)
        t.start()
        t.join(timeout=5.0)
        self.assertFalse(holder["outcome"]["ok"])
        self.assertEqual(holder["outcome"]["classification"], "spawn_failed")
        self.assertIn("signal_handler_registration_failed", holder["outcome"]["error"])

        # m3: 呼出元がSIG_IGNにしているシグナル（例: nohup下のSIGHUP）を上書きしない。
        old_hup = signal.getsignal(signal.SIGHUP)
        try:
            signal.signal(signal.SIGHUP, signal.SIG_IGN)
            hup_outcome = b.run_bounded(
                [
                    sys.executable,
                    "-c",
                    f"import os, signal; os.kill({os.getpid()}, signal.SIGHUP)",
                ],
                timeout_ms=2_000,
            )
            self.assertTrue(hup_outcome["ok"])
            self.assertEqual(hup_outcome["classification"], "ok")
            self.assertIsNone(hup_outcome["interrupted_by"])
            self.assertEqual(signal.getsignal(signal.SIGHUP), signal.SIG_IGN)
        finally:
            signal.signal(signal.SIGHUP, old_hup)

        # n1: signal.getsignalがNoneを返すシグナル（C側ハンドラ等）は登録・上書きせず、復元時にTypeErrorを出さない。
        real_getsignal = signal.getsignal
        real_signal_fn = signal.signal
        registered_signals = []

        def fake_getsignal(sig):
            if sig == signal.SIGHUP:
                return None
            return real_getsignal(sig)

        def tracking_signal(sig, handler):
            registered_signals.append((sig, handler))
            return real_signal_fn(sig, handler)

        with (
            patch.object(b.signal, "getsignal", side_effect=fake_getsignal),
            patch.object(b.signal, "signal", side_effect=tracking_signal),
        ):
            n1_outcome = b.run_bounded(
                [sys.executable, "-c", "print('n1-ok')"], timeout_ms=2_000
            )
        self.assertTrue(n1_outcome["ok"])
        self.assertEqual(n1_outcome["classification"], "ok")
        self.assertEqual(n1_outcome["stdout"], "n1-ok\n")
        self.assertNotIn(signal.SIGHUP, [sig for sig, _ in registered_signals])
        self.assertTrue(all(handler is not None for _, handler in registered_signals))

        # m2: direct child終了後のgrace待ち中に親がシグナルを受けた場合もsignalとして分類する。
        with tempfile.TemporaryDirectory() as tmp:
            ready_file = Path(tmp) / "grace_ready.txt"
            out_file = Path(tmp) / "grace_outcome.json"
            child_code = (
                "import pathlib, subprocess, sys\n"
                "subprocess.Popen([sys.executable, '-c', 'import time; time.sleep(0.25)'], "
                "stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)\n"
                "pathlib.Path(sys.argv[1]).write_text('exiting')\n"
            )
            wrapper_code = (
                "import json, pathlib, sys\n"
                f"sys.path.insert(0, {json.dumps(str(Path(__file__).resolve().parent))})\n"
                "import bounded_exec as b\n"
                "outcome = b.run_bounded([sys.executable, '-c', sys.argv[1], sys.argv[2]], "
                "timeout_ms=5000, grace_ms=1500, reap_ms=1500)\n"
                "pathlib.Path(sys.argv[3]).write_text(json.dumps(outcome))\n"
                "raise SystemExit(b.exit_code_for_outcome(outcome))\n"
            )
            wrapper = subprocess.Popen(
                [
                    sys.executable,
                    "-c",
                    wrapper_code,
                    child_code,
                    str(ready_file),
                    str(out_file),
                ],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            deadline = time.monotonic() + 8.0
            while not ready_file.exists():
                if time.monotonic() >= deadline:
                    wrapper.kill()
                    wrapper.wait()
                    self.fail("ready_file was not created in time")
                time.sleep(0.01)
            time.sleep(0.03)
            wrapper.send_signal(signal.SIGTERM)
            rc = wrapper.wait(timeout=8.0)
            self.assertEqual(rc, 143)
            grace_outcome = json.loads(out_file.read_text(encoding="utf-8"))
            self.assertFalse(grace_outcome["ok"])
            self.assertEqual(grace_outcome["classification"], "signal")
            self.assertEqual(grace_outcome["interrupted_by"], "SIGTERM")

    def test_reap_unconfirmed_when_group_never_reaches_esrch(self):
        real_killpg = os.killpg

        def fake_killpg(pgid, sig):
            if sig == 0:
                return None
            return real_killpg(pgid, sig)

        outcome = b.run_bounded(
            [sys.executable, "-c", "import time; time.sleep(5)"],
            timeout_ms=50,
            grace_ms=30,
            reap_ms=60,
            killpg_fn=fake_killpg,
        )
        if outcome["pgid"]:
            try:
                real_killpg(outcome["pgid"], signal.SIGKILL)
            except ProcessLookupError:
                pass
            b.reap_process_group_zombies(outcome["pgid"])
        self.assertFalse(outcome["ok"])
        self.assertFalse(outcome["reaped"])
        self.assertEqual(outcome["classification"], "reap_unconfirmed")
        self.assertEqual(outcome["failure"], "reap_unconfirmed")
        self.assertIn("process_group_reap_timeout", outcome["error"])

    def test_rlimit_as_and_rlimit_cpu_enforced(self):
        mem_outcome = b.run_bounded(
            [sys.executable, "-c", "x = bytearray(256 * 1024 * 1024)"],
            timeout_ms=5_000,
            rlimit_as_bytes=128 * 1024 * 1024,
            rlimit_cpu_seconds=10,
        )
        self.assertFalse(mem_outcome["ok"])
        self.assertEqual(mem_outcome["classification"], "exit_nonzero")
        self.assertIn("MemoryError", mem_outcome["stderr"])
        self.assertTrue(mem_outcome["reaped"])

        cpu_outcome = b.run_bounded(
            [sys.executable, "-c", "while True: pass"],
            timeout_ms=5_000,
            rlimit_as_bytes=512 * 1024 * 1024,
            rlimit_cpu_seconds=1,
        )
        self.assertFalse(cpu_outcome["ok"])
        self.assertFalse(cpu_outcome["timed_out"])
        self.assertEqual(cpu_outcome["classification"], "signal")
        self.assertIn(cpu_outcome["signal"], ("SIGKILL", "SIGXCPU"))
        self.assertTrue(cpu_outcome["reaped"])

    def test_cli_entrypoint_and_invalid_args(self):
        proc = subprocess.run(
            [
                sys.executable,
                "-B",
                str(Path(__file__).resolve().parent / "bounded_exec.py"),
                "--timeout-ms",
                "1000",
                "--rlimit-as-bytes",
                str(512 * 1024 * 1024),
                "--rlimit-cpu-seconds",
                "10",
                "--max-output-bytes",
                "64",
                "--",
                sys.executable,
                "-c",
                "print('cli-ok')",
            ],
            capture_output=True,
            text=True,
        )
        self.assertEqual(proc.returncode, 0)
        payload = json.loads(proc.stdout)
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["classification"], "ok")
        self.assertEqual(payload["stdout"], "cli-ok\n")

        bad = subprocess.run(
            [
                sys.executable,
                "-B",
                str(Path(__file__).resolve().parent / "bounded_exec.py"),
                "--timeout-ms",
                "0",
                "--",
                sys.executable,
                "-c",
                "pass",
            ],
            capture_output=True,
            text=True,
        )
        self.assertEqual(bad.returncode, 2)
        self.assertIn("入力不正", bad.stderr)


if __name__ == "__main__":
    unittest.main()
