"""Fixed-policy bwrap runner for the provisional local-CI driver."""
from __future__ import annotations

import ctypes
import base64
import errno
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import selectors
import signal
import socket
import stat
import subprocess
import sys
import tempfile
import threading
import time
from datetime import datetime, timezone

try:
    from .common import CHECK_IDS, Diagnostic, canonical_bytes, sha256, strict_json
except ImportError:  # pragma: no cover - direct script entrypoint
    from common import CHECK_IDS, Diagnostic, canonical_bytes, sha256, strict_json


TIMEOUT_SECONDS = 300
TERM_GRACE_SECONDS = 5
SUPERVISOR_TIMEOUT_SECONDS = 330
SUITE_STDOUT_CAPTURE_LIMIT = 90515
SUPERVISOR_FRAME_MAX_BYTES = 122000
_HEX = frozenset("0123456789abcdef")
_HOST_KEYS = frozenset({"python", "git", "bwrap", "mounts"})
_EXEC_KEYS = frozenset({"python", "git", "bwrap"})
_SANDBOX_KEYS = frozenset({
    "network", "process_tree", "bytecode_cache", "host_home", "credentials",
    "receipt_mount", "timeout_seconds", "term_grace_seconds", "mounts", "symlinks",
    "profile_digest",
})
_FIXED_ENV = {
    "PATH": "/usr/bin",
    "LANG": "C",
    "LC_ALL": "C",
    "PYTHONDONTWRITEBYTECODE": "1",
    "GIT_CONFIG_NOSYSTEM": "1",
    "GIT_CONFIG_GLOBAL": "/dev/null",
    "GIT_TERMINAL_PROMPT": "0",
    "GIT_OPTIONAL_LOCKS": "0",
}
_ENV = dict(_FIXED_ENV)
_RESERVED_MOUNT_ROOTS = ("/work", "/tmp", "/proc", "/dev")
_ALLOWED_RUNTIME_PREFIXES = ("/usr/", "/lib/", "/lib64/", "/opt/helix/runtime/")


def _now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _invalid(detail: str) -> None:
    raise Diagnostic("Rejected", "invalid_input", detail)


def _safe_path(value: object, *, absolute: bool) -> str:
    if not isinstance(value, str) or not value or "\x00" in value or "\\" in value:
        _invalid("path must be a non-empty path string")
    path = PurePosixPath(value)
    if absolute != path.is_absolute() or any(part in (".", "..") for part in value.split("/")):
        _invalid("path is not canonical")
    return value


def _canonical_digest(value: object, label: str) -> str:
    if not isinstance(value, str) or len(value) != 64 or any(c not in _HEX for c in value):
        _invalid(f"{label} must be lowercase SHA-256 hex")
    return value


def _validate_fixed_environment() -> None:
    if _ENV != _FIXED_ENV:
        _invalid("fixed child environment differs from the local-CI contract")


def tree_digest(root: Path) -> str:
    """Hash a directory as canonical {relative_file_path: file_sha256}; reject links."""
    root = Path(root)
    if not root.is_dir() or root.is_symlink():
        raise Diagnostic("Unknown", "unreadable", "runtime tree is unavailable")
    files: dict[str, str] = {}
    try:
        for current, dirs, names in os.walk(root, followlinks=False):
            base = Path(current)
            dirs.sort()
            names.sort()
            for name in dirs:
                if (base / name).is_symlink():
                    raise Diagnostic("Unknown", "conflict", "runtime tree contains an undeclared symlink")
            for name in names:
                path = base / name
                if path.is_symlink() or not path.is_file():
                    raise Diagnostic("Unknown", "conflict", "runtime tree contains a non-regular file")
                relative = path.relative_to(root).as_posix()
                files[relative] = sha256(path.read_bytes())
    except Diagnostic:
        raise
    except OSError as exc:
        raise Diagnostic("Unknown", "unreadable", "runtime tree could not be read") from exc
    return sha256(canonical_bytes(dict(sorted(files.items()))))


def _read_source(path: Path, kind: str) -> str:
    try:
        resolved = path.resolve(strict=True)
        if kind == "file":
            if not resolved.is_file():
                raise Diagnostic("Unknown", "unreadable", "runtime file is unavailable")
            return sha256(resolved.read_bytes())
        if kind == "tree":
            return tree_digest(resolved)
    except Diagnostic:
        raise
    except OSError as exc:
        raise Diagnostic("Unknown", "unreadable", "runtime mount is unavailable") from exc
    _invalid("runtime mount kind must be file or tree")


def _validate_command(spec: object) -> tuple[list[str], str]:
    if not isinstance(spec, dict):
        _invalid("command spec must be an object")
    required = {"check_id", "argv", "cwd_rel", "selection", "timeout_seconds"}
    if set(spec) != required:
        _invalid("command spec fields differ from the fixed contract")
    check_id = spec["check_id"]
    if check_id not in CHECK_IDS:
        _invalid("unknown local-CI check id")
    index = CHECK_IDS.index(check_id)
    argv = spec["argv"]
    if not isinstance(argv, list) or not argv or any(not isinstance(arg, str) or "\x00" in arg for arg in argv):
        _invalid("fixed argv is malformed")
    if spec["cwd_rel"] != "." or spec["timeout_seconds"] != TIMEOUT_SECONDS:
        _invalid("fixed cwd or timeout was changed")
    selection = spec["selection"]
    if (not isinstance(selection, dict)
            or any(type(selection.get(key)) is not bool for key in ("required", "local", "merge_unit"))):
        _invalid("fixed required/local/merge-unit selection must use booleans")
    if selection != {"required": True, "local": True, "merge_unit": index == 3}:
        _invalid("fixed required/local/merge-unit selection was changed")

    fixed = {
        CHECK_IDS[0]: ["python3", "-B", "scaffold/tools/scfctl.py", "validate"],
        CHECK_IDS[1]: ["python3", "-B", "scaffold/tools/scfctl.py", "stale"],
        CHECK_IDS[2]: ["python3", "-B", "scaffold/governance/tools/govcheck.py"],
        CHECK_IDS[4]: ["python3", "-B", "scaffold/local-ci/design_check.py"],
        CHECK_IDS[5]: ["python3", "-B", "scaffold/local-ci/source_l7_runner.py", "--suite", "common-kernel-k1-k2-k3-k5-k6"],
    }
    if index == 3:
        if (len(argv) != 8 or argv[:4] != ["git", "diff", "--check", "--no-ext-diff"]
                or argv[4] != "--no-textconv" or argv[7] != "--"
                or any(len(oid) != 40 or any(ch not in _HEX for ch in oid) for oid in argv[5:7])):
            _invalid("LC-DIFF-001 argv differs from the fixed exact-target command")
    elif argv != fixed[check_id]:
        _invalid("checker argv differs from the fixed command")
    return list(argv), "python" if argv[0] == "python3" else "git"


def _validate_config(host: object, portable: object) -> tuple[dict, dict, list[dict], list[dict]]:
    _validate_fixed_environment()
    if not isinstance(host, dict) or set(host) != _HOST_KEYS:
        _invalid("host config must contain only python/git/bwrap and mount paths")
    if not isinstance(portable, dict) or set(portable) != {"executables", "sandbox"}:
        _invalid("portable config must contain executables and sandbox profile")
    executables = portable["executables"]
    sandbox = portable["sandbox"]
    if not isinstance(executables, dict) or set(executables) != _EXEC_KEYS | {"provider_git"}:
        _invalid("portable executable identity set is incomplete")
    provider_identity = executables["provider_git"]
    if provider_identity is not None:
        if (not isinstance(provider_identity, dict) or set(provider_identity) != {"name", "version", "sha256"}
                or provider_identity["name"] != "git" or not isinstance(provider_identity["version"], str)
                or not provider_identity["version"]):
            _invalid("provider Git identity must be an exact identity or null")
        _canonical_digest(provider_identity["sha256"], "executables.provider_git.sha256")
    if not isinstance(sandbox, dict) or set(sandbox) != _SANDBOX_KEYS:
        _invalid("sandbox profile fields differ from the fixed contract")
    mounts, symlinks = sandbox.get("mounts"), sandbox.get("symlinks")
    if not isinstance(mounts, list) or not isinstance(symlinks, list):
        _invalid("sandbox runtime mounts or symlinks are missing")
    profile_digest = _canonical_digest(sandbox.get("profile_digest"), "sandbox.profile_digest")
    profile_body = {key: value for key, value in sandbox.items() if key != "profile_digest"}
    if sha256(canonical_bytes(profile_body)) != profile_digest:
        _invalid("sandbox profile digest does not bind its fixed fields")
    if (sandbox.get("network") != "connectivity_disabled_in_private_namespace"
            or sandbox.get("process_tree") != "monitored"
            or sandbox.get("bytecode_cache") != "disabled"
            or sandbox.get("host_home") != "absent"
            or sandbox.get("credentials") != "absent"
            or sandbox.get("receipt_mount") != "absent"
            or sandbox.get("timeout_seconds") != TIMEOUT_SECONDS
            or sandbox.get("term_grace_seconds") != TERM_GRACE_SECONDS):
        _invalid("sandbox profile differs from the fixed L5 contract")

    for name in _EXEC_KEYS:
        local_path = host.get(name)
        if not isinstance(local_path, str) or not os.path.isabs(local_path) or "\x00" in local_path:
            _invalid("host executable config must contain absolute paths only")
        identity = executables[name]
        if (not isinstance(identity, dict) or set(identity) != {"name", "version", "sha256"}
                or not isinstance(identity["name"], str) or not identity["name"]
                or not isinstance(identity["version"], str) or not identity["version"]):
            _invalid("portable executable identity is malformed")
        _canonical_digest(identity["sha256"], f"executables.{name}.sha256")

    host_mounts = host.get("mounts")
    if not isinstance(host_mounts, dict) or any(not isinstance(path, str) or not os.path.isabs(path)
                                                 or "\x00" in path for path in host_mounts.values()):
        _invalid("host runtime mount config must map keys to absolute paths")
    seen_targets: set[str] = set()
    normalized_mounts = []
    for row in mounts:
        if not isinstance(row, dict) or set(row) != {"host_key", "target", "sha256", "kind"}:
            _invalid("runtime mount row is malformed")
        key = row["host_key"]
        target = _safe_path(row["target"], absolute=True)
        digest = _canonical_digest(row["sha256"], "runtime mount sha256")
        kind = row["kind"]
        if (not isinstance(key, str) or kind not in ("file", "tree")
                or key not in host_mounts or target in seen_targets):
            _invalid("runtime mount kind, source key, or target is invalid")
        if any(target == root or target.startswith(root + "/") or root.startswith(target + "/")
               for root in _RESERVED_MOUNT_ROOTS):
            raise Diagnostic("denied", "sandbox_preflight_failed",
                             "runtime mount would expose a reserved sandbox path")
        if not target.startswith(_ALLOWED_RUNTIME_PREFIXES):
            _invalid("runtime mount target is outside the fixed runtime roots")
        seen_targets.add(target)
        normalized_mounts.append({"host_key": key, "target": target, "sha256": digest, "kind": kind})
    normalized_mounts.sort(key=lambda row: (row["target"].count("/"), row["target"]))

    seen_links: set[str] = set()
    normalized_links = []
    for row in symlinks:
        if not isinstance(row, dict) or set(row) != {"target", "link"}:
            _invalid("sandbox symlink row is malformed")
        target = _safe_path(row["target"], absolute=True)
        link = _safe_path(row["link"], absolute=False)
        if (target in seen_links or "/" in link
                or not target.startswith(_ALLOWED_RUNTIME_PREFIXES)):
            _invalid("sandbox symlink target or link name is invalid")
        seen_links.add(target)
        normalized_links.append({"target": target, "link": link})
    if not normalized_mounts:
        _invalid("at least one verified runtime mount is required")
    for row in normalized_mounts:
        source_path = Path(host_mounts[row["host_key"]])
        try:
            resolved_source = source_path.resolve(strict=False)
        except OSError:
            resolved_source = source_path
        if ".git" in source_path.parts or ".git" in resolved_source.parts:
            raise Diagnostic("denied", "sandbox_preflight_failed",
                             "runtime mount would expose repository Git metadata")
    return host, portable, normalized_mounts, normalized_links


def validate_runtime_config(host: object, portable: object) -> None:
    """Validate runtime configuration shape before any target Git probes run."""
    _validate_config(host, portable)


def _verify_executable(path: str, identity: dict, name: str) -> None:
    try:
        resolved = Path(path).resolve(strict=True)
        info = resolved.stat()
        if not stat.S_ISREG(info.st_mode) or not os.access(resolved, os.X_OK):
            raise OSError("not executable")
        digest = sha256(resolved.read_bytes())
        if digest != identity["sha256"]:
            raise Diagnostic("denied", "executable_identity_mismatch", f"{name} bytes differ from portable identity")
        probe = subprocess.run([str(resolved), "--version"], stdin=subprocess.DEVNULL,
                               stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                               env={"PATH": "/usr/bin:/bin", "LANG": "C", "LC_ALL": "C"},
                               timeout=10, check=False, shell=False)
    except Diagnostic:
        raise
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise Diagnostic("denied", "executable_unavailable", f"{name} version preflight failed") from exc
    output = (probe.stdout or probe.stderr).decode("utf-8", "replace").strip()
    if name == "python":
        reported_version = output.removeprefix("Python ")
    elif name == "git":
        reported_version = output.removeprefix("git version ")
    else:
        reported_version = output
    if probe.returncode != 0 or reported_version != identity["version"]:
        raise Diagnostic("denied", "executable_identity_mismatch", f"{name} version differs from portable identity")
    if name == "git":
        # Reject versions below the current reader contract without parsing arbitrary suffixes.
        parts = reported_version.split(".")
        try:
            version = tuple(int(part) for part in parts)
        except ValueError as exc:
            raise Diagnostic("denied", "unsupported_git", "Git version is not parseable") from exc
        if len(version) != 3 or version < (2, 35, 2):
            raise Diagnostic("denied", "unsupported_git", "Git version is below 2.35.2")


def _runtime_mount_args(host: dict, mounts: list[dict], symlinks: list[dict]) -> list[str]:
    dirs = {"/usr", "/lib", "/lib64"}
    for row in mounts:
        parent = PurePosixPath(row["target"]).parent
        while str(parent) not in ("/", "."):
            dirs.add(str(parent))
            parent = parent.parent
    for row in symlinks:
        parent = PurePosixPath(row["target"]).parent
        while str(parent) not in ("/", "."):
            dirs.add(str(parent))
            parent = parent.parent
    args: list[str] = []
    for path in sorted(dirs, key=lambda item: (item.count("/"), item)):
        args.extend(("--dir", path))
    for row in mounts:
        source = str(Path(host["mounts"][row["host_key"]]).resolve(strict=True))
        args.extend(("--ro-bind", source, row["target"]))
    for row in symlinks:
        args.extend(("--symlink", row["link"], row["target"]))
    return args


def _bwrap_base(host: dict, portable: dict, mounts: list[dict], symlinks: list[dict],
                snapshot_root: Path, command: list[str]) -> list[str]:
    sandbox = portable["sandbox"]
    args = [
        str(Path(host["bwrap"]).resolve(strict=True)),
        "--unshare-all", "--die-with-parent", "--new-session", "--clearenv",
        *_runtime_mount_args(host, mounts, symlinks),
        "--dir", "/work",
        "--ro-bind", str(snapshot_root.resolve(strict=True)), "/work",
        "--dir", "/root",
        "--tmpfs", "/tmp",
        "--proc", "/proc",
        "--dev", "/dev",
        "--remount-ro", "/",
        "--setenv", "PATH", _ENV["PATH"],
        "--setenv", "LANG", _ENV["LANG"],
        "--setenv", "LC_ALL", _ENV["LC_ALL"],
        "--setenv", "PYTHONDONTWRITEBYTECODE", _ENV["PYTHONDONTWRITEBYTECODE"],
        "--setenv", "GIT_CONFIG_NOSYSTEM", _ENV["GIT_CONFIG_NOSYSTEM"],
        "--setenv", "GIT_CONFIG_GLOBAL", _ENV["GIT_CONFIG_GLOBAL"],
        "--setenv", "GIT_TERMINAL_PROMPT", _ENV["GIT_TERMINAL_PROMPT"],
        "--setenv", "GIT_OPTIONAL_LOCKS", _ENV["GIT_OPTIONAL_LOCKS"],
        "--chdir", "/work",
        "--",
        *command,
    ]
    # Keep the semantic reference live: this function is the sole fixed-profile builder.
    if sandbox["network"] != "connectivity_disabled_in_private_namespace":
        _invalid("network profile changed")
    return args


def _synthetic_probe_command(expected_net_inode: int) -> list[str]:
    code = f"""import argparse, collections, datetime, glob, hashlib, json, os, pathlib, re, shlex, stat, subprocess, sys, tempfile
from pathlib import Path
p = Path('/work/.local-ci-probe-sentinel')
original = p.read_bytes()
try:
    p.write_bytes(original + b'probe')
except OSError:
    pass
else:
    raise SystemExit('snapshot mount is writable')
for root in ('/usr', '/root'):
    try:
        (Path(root) / '.local-ci-root-write-probe').write_bytes(b'forbidden')
    except OSError:
        pass
    else:
        raise SystemExit('sandbox root path is writable: ' + root)
t = Path('/tmp/.local-ci-scratch-probe')
t.write_bytes(b'ok')
assert t.read_bytes() == b'ok'
t.unlink()
assert Path('/proc/self').exists() and Path('/dev/null').exists()
assert os.stat('/proc/self/ns/net').st_ino != {expected_net_inode}
"""
    return ["/usr/bin/python3", "-B", "-c", code]


def _enable_subreaper() -> None:
    if not sys.platform.startswith("linux"):
        raise Diagnostic("denied", "process_monitor_unavailable", "Linux subreaper is unavailable")
    try:
        libc = ctypes.CDLL(None, use_errno=True)
        if libc.prctl(36, 1, 0, 0, 0) != 0:  # PR_SET_CHILD_SUBREAPER
            raise OSError(ctypes.get_errno(), "prctl failed")
    except (AttributeError, OSError) as exc:
        raise Diagnostic("denied", "process_monitor_unavailable", "could not enable child subreaper") from exc


def _descendants(root_pid: int) -> set[int]:
    found: set[int] = set()
    todo = [root_pid]
    while todo:
        pid = todo.pop()
        child_file = Path(f"/proc/{pid}/task/{pid}/children")
        try:
            children = [int(value) for value in child_file.read_text().split()]
        except (OSError, ValueError):
            continue
        for child in children:
            if child not in found:
                found.add(child)
                todo.append(child)
    return found


def _signal_tree(root_pid: int, signum: int) -> None:
    pids = _descendants(os.getpid()) | _descendants(root_pid)
    for pid in sorted(pids, reverse=True):
        try:
            os.kill(pid, signum)
        except ProcessLookupError:
            pass
        except PermissionError:
            continue
    try:
        os.killpg(root_pid, signum)
    except ProcessLookupError:
        pass


def _reap_adopted() -> tuple[bool, set[int]]:
    live: set[int] = set()
    while True:
        try:
            pid, _ = os.waitpid(-1, os.WNOHANG)
        except ChildProcessError:
            return True, live
        except OSError:
            return False, live
        if pid == 0:
            break
        # A just-reaped child can have descendants, so rescan once the caller knows its root.
    try:
        children = Path(f"/proc/{os.getpid()}/task/{os.getpid()}/children").read_text().split()
        live.update(int(child) for child in children)
    except (OSError, ValueError):
        return False, live
    return not live, live


def _settle_descendants(root_pid: int, *, grace: float, signal_leftovers: bool) -> bool:
    deadline = time.monotonic() + grace
    while True:
        reaped, _ = _reap_adopted()
        live = _descendants(os.getpid())
        if reaped and not live:
            return True
        if time.monotonic() >= deadline:
            break
        time.sleep(0.02)
    if signal_leftovers:
        _signal_tree(root_pid, signal.SIGKILL)
        deadline = time.monotonic() + TERM_GRACE_SECONDS
        while time.monotonic() < deadline:
            reaped, _ = _reap_adopted()
            if reaped and not _descendants(os.getpid()):
                return True
            time.sleep(0.02)
    reaped, _ = _reap_adopted()
    return reaped and not _descendants(os.getpid())


def _drain_pipes(process: subprocess.Popen, timeout: int, cancel_event: threading.Event,
                 control: socket.socket | None = None,
                 capture_stdout_limit: int = 0) -> tuple[int | None, str, str, str | None, bool, bytes, bool]:
    assert process.stdout is not None and process.stderr is not None
    selector = selectors.DefaultSelector()
    stdout_fd, stderr_fd = process.stdout.fileno(), process.stderr.fileno()
    hashes = {stdout_fd: hashlib.sha256(), stderr_fd: hashlib.sha256()}
    captured_stdout = bytearray()
    stdout_overflow = False
    for stream in (process.stdout, process.stderr):
        os.set_blocking(stream.fileno(), False)
        selector.register(stream, selectors.EVENT_READ)
    if control is not None:
        control.setblocking(False)
        selector.register(control, selectors.EVENT_READ, "control")
    start = time.monotonic()
    interrupted: str | None = None
    while True:
        if cancel_event.is_set():
            interrupted = "cancelled"
            break
        if time.monotonic() - start >= timeout:
            interrupted = "timeout"
            break
        if process.poll() is not None:
            # Continue draining until both pipes are closed so the digests cover all bytes.
            if not any(key.data != "control" for key in selector.get_map().values()):
                safe = process.returncode is not None and _settle_descendants(
                    process.pid, grace=0.25, signal_leftovers=True)
                selector.close()
                base = (process.returncode, hashes[stdout_fd].hexdigest(), hashes[stderr_fd].hexdigest(), None, safe)
                if capture_stdout_limit:
                    return base + (bytes(captured_stdout), stdout_overflow)
                return base
        for key, _ in selector.select(0.05):
            if key.data == "control":
                try:
                    data = control.recv(64) if control is not None else b""
                except BlockingIOError:
                    continue
                if b"CANCEL" in data:
                    cancel_event.set()
                    interrupted = "cancelled"
                    break
                if not data:
                    selector.unregister(control)
                continue
            stream = key.fileobj
            try:
                chunk = os.read(stream.fileno(), 65536)
            except BlockingIOError:
                continue
            if chunk:
                hashes[stream.fileno()].update(chunk)
                if stream.fileno() == stdout_fd and capture_stdout_limit:
                    remaining = capture_stdout_limit - len(captured_stdout)
                    if remaining > 0:
                        captured_stdout.extend(chunk[:remaining])
                    if len(chunk) > remaining:
                        stdout_overflow = True
            else:
                selector.unregister(stream)
                stream.close()
        if interrupted:
            break

    _signal_tree(process.pid, signal.SIGTERM)
    grace_deadline = time.monotonic() + TERM_GRACE_SECONDS
    while time.monotonic() < grace_deadline:
        if process.poll() is not None and not _descendants(os.getpid()):
            break
        selector.select(min(0.05, max(0.0, grace_deadline - time.monotonic())))
    # --new-session separates the in-namespace process group; kill the outer wrapper and
    # recursively known descendants, then rely on --die-with-parent/PID namespace teardown.
    if process.poll() is None or _descendants(os.getpid()):
        _signal_tree(process.pid, signal.SIGKILL)
    try:
        process.wait(timeout=TERM_GRACE_SECONDS)
    except subprocess.TimeoutExpired:
        _signal_tree(process.pid, signal.SIGKILL)
        try:
            process.wait(timeout=TERM_GRACE_SECONDS)
        except subprocess.TimeoutExpired:
            pass
    for key in list(selector.get_map().values()):
        if key.data == "control":
            try:
                selector.unregister(key.fileobj)
            except Exception:
                pass
            continue
        stream = key.fileobj
        try:
            while True:
                chunk = os.read(stream.fileno(), 65536)
                if not chunk:
                    break
                hashes[stream.fileno()].update(chunk)
        except (OSError, ValueError):
            pass
        try:
            selector.unregister(stream)
        except Exception:
            pass
        try:
            stream.close()
        except Exception:
            pass
    selector.close()
    safe = process.poll() is not None and _settle_descendants(
        process.pid, grace=TERM_GRACE_SECONDS, signal_leftovers=True)
    base = (process.returncode, hashes[stdout_fd].hexdigest(), hashes[stderr_fd].hexdigest(), interrupted, safe)
    if capture_stdout_limit:
        return base + (bytes(captured_stdout), stdout_overflow)
    return base


def _preflight(host: dict, portable: dict, mounts: list[dict], symlinks: list[dict],
               control: socket.socket | None = None) -> None:
    for name in ("python", "git", "bwrap"):
        _verify_executable(host[name], portable["executables"][name], name)
    for row in mounts:
        actual = _read_source(Path(host["mounts"][row["host_key"]]), row["kind"])
        if actual != row["sha256"]:
            raise Diagnostic("denied", "runtime_mount_mismatch", "runtime mount bytes differ from profile")

    expected_net = os.stat("/proc/self/ns/net").st_ino
    with tempfile.TemporaryDirectory(prefix="helix-local-ci-preflight-") as temporary:
        probe_root = Path(temporary)
        (probe_root / ".local-ci-probe-sentinel").write_bytes(b"readonly-probe")
        command = _synthetic_probe_command(expected_net)
        argv = _bwrap_base(host, portable, mounts, symlinks, probe_root, command)
        try:
            process = subprocess.Popen(argv, shell=False, start_new_session=True,
                                       close_fds=True, stdin=subprocess.DEVNULL,
                                       stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                       text=False, env={"PATH": "/usr/bin:/bin", "LANG": "C", "LC_ALL": "C"})
        except OSError as exc:
            raise Diagnostic("denied", "sandbox_preflight_failed", "bwrap could not start") from exc
        cancel_event = threading.Event()
        code, out_hash, err_hash, interrupted, safe = _drain_pipes(
            process, 15, cancel_event, control=control)
        if interrupted == "cancelled":
            raise Diagnostic("denied", "sandbox_preflight_cancelled", "cancelled during synthetic sandbox preflight")
        if not safe:
            raise Diagnostic("denied", "sandbox_preflight_unreaped", "synthetic sandbox process tree was not reaped")
        if code != 0 or interrupted is not None:
            raise Diagnostic("denied", "sandbox_preflight_failed", "synthetic namespace/mount probe failed")
        del out_hash, err_hash
        if not probe_root.exists():
            raise Diagnostic("denied", "sandbox_preflight_failed", "synthetic preflight directory disappeared")


def _execution(spec: dict, identity: dict, state: str, exit_code: int | None,
               started: str | None, finished: str | None, profile_digest: str,
               stdout_digest: str | None = None, stderr_digest: str | None = None,
               reason: str | None = None) -> dict:
    result = {
        "check_id": spec["check_id"],
        "portable_executable_identity": dict(identity),
        "state": state,
        "exit_code": exit_code,
        "argv": list(spec["argv"]),
        "cwd_rel": ".",
        "started_at": started,
        "finished_at": finished,
        "timeout_seconds": TIMEOUT_SECONDS,
        "sandbox_profile_digest": profile_digest,
        "stdout_sha256": stdout_digest,
        "stderr_sha256": stderr_digest,
    }
    if reason is not None:
        result["reason"] = reason
    return result


def _supervisor(payload: dict, control: socket.socket) -> dict:
    _enable_subreaper()
    host, portable, mounts, symlinks = _validate_config(payload["host_config"], payload["portable_config"])
    spec = payload["spec"]
    argv, executable_key = _validate_command(spec)
    profile_digest = portable["sandbox"]["profile_digest"]
    identity = portable["executables"][executable_key]
    try:
        _preflight(host, portable, mounts, symlinks, control=control)
    except Diagnostic as exc:
        if exc.reason == "sandbox_preflight_cancelled":
            return {
                "execution": _execution(spec, identity, "interrupted", None, None, None,
                                         profile_digest, reason="cancelled"),
                "safe_to_continue": True,
                "diagnostic": None,
            }
        return {
            "execution": _execution(spec, identity, "denied", None, None, None, profile_digest),
            "safe_to_continue": False,
            "diagnostic": exc.as_dict(),
        }

    snapshot_root = Path(payload["snapshot_root"])
    try:
        resolved_snapshot = snapshot_root.resolve(strict=True)
        if not resolved_snapshot.is_dir() or resolved_snapshot.is_symlink():
            raise OSError("snapshot is not a directory")
    except OSError as exc:
        diagnostic = Diagnostic("denied", "snapshot_unavailable", "verified private snapshot unavailable")
        return {"execution": _execution(spec, identity, "denied", None, None, None, profile_digest),
                "safe_to_continue": False, "diagnostic": diagnostic.as_dict()}
    for row in mounts:
        mount_source = Path(host["mounts"][row["host_key"]]).resolve(strict=True)
        if mount_source == resolved_snapshot or resolved_snapshot in mount_source.parents:
            diagnostic = Diagnostic("denied", "runtime_mount_overlap", "runtime mount overlaps the private source snapshot")
            return {"execution": _execution(spec, identity, "denied", None, None, None, profile_digest),
                    "safe_to_continue": False, "diagnostic": diagnostic.as_dict()}

    command = list(argv)
    if command[0] == "python3":
        command[0] = "/usr/bin/python3"
    else:
        command[0] = "/usr/bin/git"
    bwrap_argv = _bwrap_base(host, portable, mounts, symlinks, resolved_snapshot, command)
    try:
        process = subprocess.Popen(bwrap_argv, shell=False, start_new_session=True,
                                   close_fds=True, stdin=subprocess.DEVNULL,
                                   stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                   text=False, env={"PATH": "/usr/bin:/bin", "LANG": "C", "LC_ALL": "C"})
    except OSError:
        diagnostic = Diagnostic("denied", "sandbox_spawn_failed", "bwrap checker launch failed")
        return {"execution": _execution(spec, identity, "denied", None, None, None, profile_digest),
                "safe_to_continue": False, "diagnostic": diagnostic.as_dict()}
    start = _now()
    cancel_event = threading.Event()
    def request_cancel(_signum, _frame):
        cancel_event.set()
    previous = signal.signal(signal.SIGUSR1, request_cancel)
    try:
        is_suite = spec["check_id"] == "LC-STAGE1-L7-001"
        drained = _drain_pipes(process, TIMEOUT_SECONDS, cancel_event, control=control,
                                capture_stdout_limit=SUITE_STDOUT_CAPTURE_LIMIT if is_suite else 0)
        code, stdout_digest, stderr_digest, interrupted, safe = drained[:5]
        captured_stdout, stdout_overflow = drained[5:] if is_suite else (b"", False)
    finally:
        signal.signal(signal.SIGUSR1, previous)
    if not safe:
        diagnostic = Diagnostic("denied", "process_tree_unreaped", "checker descendants could not be confirmed stopped and reaped")
        return {"execution": _execution(spec, identity, "denied", None, start, _now(), profile_digest,
                                        stdout_digest, stderr_digest),
                "safe_to_continue": False, "diagnostic": diagnostic.as_dict()}
    if interrupted is not None:
        execution = _execution(spec, identity, "interrupted", None, start, _now(), profile_digest,
                               stdout_digest, stderr_digest, interrupted)
        return {"execution": execution, "safe_to_continue": True, "diagnostic": None}
    state = "success" if code == 0 else "fail"
    result = {"execution": _execution(spec, identity, state, code, start, _now(), profile_digest,
                                       stdout_digest, stderr_digest),
              "safe_to_continue": True, "diagnostic": None}
    if is_suite:
        result["suite_stdout_b64"] = base64.b64encode(captured_stdout).decode("ascii")
        result["suite_stdout_overflow"] = stdout_overflow
    return result


def _child_main(control_fd: int) -> int:
    control = socket.socket(fileno=control_fd)
    control.settimeout(10)
    try:
        chunks = bytearray()
        while b"\n" not in chunks:
            part = control.recv(65536)
            if not part:
                raise ValueError("missing supervisor request")
            chunks.extend(part)
            if len(chunks) > 1_000_000:
                raise ValueError("supervisor request too large")
        raw, _, remainder = chunks.partition(b"\n")
        if remainder:
            raise ValueError("unexpected supervisor request suffix")
        payload = strict_json(raw)
        control.settimeout(None)
        control.sendall(b"READY\n")
        result = _supervisor(payload, control)
    except Diagnostic as exc:
        result = {"execution": None, "safe_to_continue": False, "diagnostic": exc.as_dict()}
    except Exception:
        result = {"execution": None, "safe_to_continue": False,
                  "diagnostic": Diagnostic("denied", "supervisor_failure", "supervisor failed closed").as_dict()}
    try:
        control.sendall(canonical_bytes(result) + b"\n")
    except OSError:
        return 2
    return 0


def run_step(snapshot_root: Path, spec: dict, host_config: dict, portable_config: dict,
             cancel: threading.Event | None = None) -> dict:
    """Run one fixed checker; internal safety fields are not part of receipt execution."""
    argv, executable_key = _validate_command(spec)
    try:
        host, portable, _mounts, _symlinks = _validate_config(host_config, portable_config)
    except Diagnostic as exc:
        if exc.classification != "denied":
            raise
        identity = portable_config["executables"][executable_key]
        profile_digest = portable_config["sandbox"]["profile_digest"]
        return {
            "execution": _execution(spec, identity, "denied", None, None, None, profile_digest),
            "safe_to_continue": False,
            "diagnostic": exc.as_dict(),
        }
    identity = portable["executables"][executable_key]
    profile_digest = portable["sandbox"]["profile_digest"]
    if not isinstance(snapshot_root, (str, os.PathLike)):
        _invalid("snapshot_root must be a path")
    snapshot = Path(snapshot_root)
    if not snapshot.is_absolute():
        _invalid("snapshot_root must be an absolute private path")
    try:
        resolved = snapshot.resolve(strict=True)
        if not resolved.is_dir() or resolved.is_symlink():
            raise OSError("not a directory")
    except OSError as exc:
        raise Diagnostic("Unknown", "unreadable", "private snapshot is unavailable") from exc
    payload = {
        "snapshot_root": str(resolved),
        "spec": spec,
        "host_config": host,
        "portable_config": portable,
    }
    payload_bytes = canonical_bytes(payload)
    if len(payload_bytes) + 1 > 1_000_000:
        _invalid("supervisor request exceeds its fixed bound")
    # The interpreter used for the dedicated subreaper supervisor must be verified
    # before it executes runner code; the sandbox child repeats this with all tools.
    try:
        _verify_executable(host["python"], portable["executables"]["python"], "python")
    except Diagnostic as exc:
        return {
            "execution": _execution(spec, identity, "denied", None, None, None, profile_digest),
            "safe_to_continue": False,
            "diagnostic": exc.as_dict(),
        }
    left, right = socket.socketpair()
    helper = Path(__file__).resolve()
    python_path = str(Path(host["python"]).resolve(strict=True))
    child: subprocess.Popen | None = None
    protocol_error: Diagnostic | None = None
    response: dict | None = None
    helper_reaped = False
    result_obj: dict | None = None
    try:
        child = subprocess.Popen(
            [python_path, "-B", str(helper), "--supervisor-child", str(right.fileno())],
            shell=False, start_new_session=True, close_fds=True, pass_fds=(right.fileno(),),
            stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            env={"PATH": "/usr/bin:/bin", "LANG": "C", "LC_ALL": "C",
                 "PYTHONDONTWRITEBYTECODE": "1"}, text=False,
        )
        right.close()
        left.settimeout(10)
        left.sendall(payload_bytes + b"\n")
        left.setblocking(False)
        selector = selectors.DefaultSelector()
        selector.register(left, selectors.EVENT_READ)
        deadline = time.monotonic() + SUPERVISOR_TIMEOUT_SECONDS
        frames = bytearray()
        ready = False
        eof = False
        cancel_sent = False
        while response is None or child.poll() is None:
            if cancel is not None and cancel.is_set() and not cancel_sent:
                try:
                    left.sendall(b"CANCEL\n")
                except OSError:
                    pass
                cancel_sent = True
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                protocol_error = Diagnostic("denied", "supervisor_timeout", "supervisor exceeded its absolute deadline")
                break
            if child.poll() is not None and response is None and eof:
                protocol_error = Diagnostic("denied", "supervisor_failed", "supervisor exited without a complete response")
                break
            for key, _ in selector.select(min(0.05, remaining)):
                try:
                    part = key.fileobj.recv(65536)
                except BlockingIOError:
                    continue
                if not part:
                    eof = True
                    try:
                        selector.unregister(key.fileobj)
                    except Exception:
                        pass
                    continue
                frames.extend(part)
                if len(frames) > SUPERVISOR_FRAME_MAX_BYTES:
                    protocol_error = Diagnostic("denied", "supervisor_protocol_invalid", "supervisor response exceeded bound")
                    break
                while b"\n" in frames:
                    frame, _, remainder = frames.partition(b"\n")
                    frames = bytearray(remainder)
                    if not ready:
                        if frame != b"READY":
                            protocol_error = Diagnostic("denied", "supervisor_protocol_invalid", "supervisor readiness frame is invalid")
                            break
                        ready = True
                        continue
                    try:
                        decoded = strict_json(frame)
                    except Diagnostic:
                        protocol_error = Diagnostic("denied", "supervisor_protocol_invalid", "supervisor result frame is invalid")
                        break
                    required_keys = {"execution", "safe_to_continue", "diagnostic"}
                    allowed_keys = set(required_keys)
                    if spec["check_id"] == "LC-STAGE1-L7-001":
                        allowed_keys |= {"suite_stdout_b64", "suite_stdout_overflow"}
                    if (not isinstance(decoded, dict)
                            or not required_keys <= decoded.keys()
                            or decoded.keys() - allowed_keys
                            or ("suite_stdout_b64" in decoded) != ("suite_stdout_overflow" in decoded)
                            or not isinstance(decoded["safe_to_continue"], bool)):
                        protocol_error = Diagnostic("denied", "supervisor_protocol_invalid", "supervisor response shape is invalid")
                        break
                    response = decoded
                    if frames:
                        protocol_error = Diagnostic("denied", "supervisor_protocol_invalid", "supervisor sent trailing response bytes")
                    break
                if protocol_error is not None:
                    break
            if protocol_error is not None:
                break
            if eof and response is None and child.poll() is not None:
                protocol_error = Diagnostic("denied", "supervisor_failed", "supervisor exited without a complete response")
                break
        selector.close()
        if child.poll() is not None:
            child.wait()
            helper_reaped = True
        if protocol_error is None and child.returncode != 0:
            protocol_error = Diagnostic("denied", "supervisor_failed", "supervisor did not complete cleanly")
        if protocol_error is not None or response is None:
            failure = protocol_error or Diagnostic("denied", "supervisor_failed", "supervisor result is unavailable")
            result_obj = {
                "execution": _execution(spec, identity, "denied", None, None, None, profile_digest),
                "safe_to_continue": False,
                "diagnostic": failure.as_dict(),
            }
        elif response["execution"] is None:
            diag = response.get("diagnostic") or {}
            diagnostic = Diagnostic("denied", diag.get("reason", "supervisor_failed"),
                                   diag.get("detail", "supervisor failed closed"))
            result_obj = {
                "execution": _execution(spec, identity, "denied", None, None, None, profile_digest),
                "safe_to_continue": False,
                "diagnostic": diagnostic.as_dict(),
            }
        else:
            result_obj = response
            if spec["check_id"] == "LC-STAGE1-L7-001" and "suite_stdout_b64" in response:
                try:
                    result_obj["suite_runner_stdout"] = base64.b64decode(
                        response["suite_stdout_b64"], validate=True)
                except (ValueError, TypeError) as exc:
                    raise Diagnostic("denied", "supervisor_protocol_invalid", "suite output frame is malformed") from exc
                if not isinstance(response["suite_stdout_overflow"], bool):
                    raise Diagnostic("denied", "supervisor_protocol_invalid", "suite output overflow marker is malformed")
                result_obj["suite_runner_stdout_overflow"] = response["suite_stdout_overflow"]
    except (OSError, ValueError, subprocess.SubprocessError) as exc:
        diagnostic = Diagnostic("denied", "supervisor_failed", "supervisor process failed closed")
        result_obj = {
            "execution": _execution(spec, identity, "denied", None, None, None, profile_digest),
            "safe_to_continue": False,
            "diagnostic": diagnostic.as_dict(),
        }
    finally:
        if child is not None and child.poll() is None:
            try:
                os.killpg(child.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
            try:
                child.wait(timeout=TERM_GRACE_SECONDS)
            except subprocess.TimeoutExpired:
                try:
                    os.killpg(child.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                try:
                    child.wait(timeout=TERM_GRACE_SECONDS)
                except subprocess.TimeoutExpired:
                    pass
        if child is not None and child.poll() is not None:
            try:
                child.wait()
                helper_reaped = True
            except OSError:
                helper_reaped = False
        if child is not None and not helper_reaped and result_obj is not None:
            result_obj["safe_to_continue"] = False
            result_obj["diagnostic"] = Diagnostic(
                "denied", "supervisor_unreaped", "supervisor process could not be confirmed reaped"
            ).as_dict()
            execution = result_obj.get("execution")
            if isinstance(execution, dict):
                execution["state"] = "denied"
                execution["exit_code"] = None
        left.close()
        try:
            right.close()
        except OSError:
            pass
    assert result_obj is not None
    return result_obj


if __name__ == "__main__" and len(sys.argv) == 3 and sys.argv[1] == "--supervisor-child":
    raise SystemExit(_child_main(int(sys.argv[2])))
