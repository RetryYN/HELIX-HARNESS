"""Single-change runner oracles for the local-CI L7 contract."""
from __future__ import annotations

import hashlib
import os
import signal
import socket
import sys
import tempfile
import threading
import unittest
from pathlib import Path
from unittest.mock import patch

_LOCAL_CI = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_LOCAL_CI))

import runner  # noqa: E402
from common import CHECK_IDS, Diagnostic, canonical_bytes, sha256  # noqa: E402


_HEX = "a" * 40


def _tree_digest(root: Path) -> str:
    entries = {}
    for path in sorted(item for item in root.rglob("*") if item.is_file()):
        entries[path.relative_to(root).as_posix()] = sha256(path.read_bytes())
    return sha256(canonical_bytes(entries))


def _fixture(temp: Path) -> tuple[dict, dict, Path]:
    runtime = temp / "runtime"
    runtime.mkdir()
    paths = {}
    mounts = []
    for key, target, body in (
        ("python", "/usr/bin/python3.12", b"python-bytes"),
        ("git", "/usr/bin/git", b"git-bytes"),
        ("loader", "/lib64/ld-linux-x86-64.so.2", b"loader-bytes"),
    ):
        source = runtime / key
        source.write_bytes(body)
        paths[key] = str(source)
        mounts.append({"host_key": key, "target": target, "sha256": sha256(body), "kind": "file"})
    stdlib = runtime / "stdlib"
    stdlib.mkdir()
    (stdlib / "module.py").write_bytes(b"value = 1\n")
    paths["stdlib"] = str(stdlib)
    mounts.append({"host_key": "stdlib", "target": "/usr/lib/python3.12", "sha256": _tree_digest(stdlib), "kind": "tree"})
    bwrap = runtime / "bwrap"
    bwrap.write_bytes(b"bwrap-bytes")
    paths["bwrap"] = str(bwrap)
    host = {"python": paths["python"], "git": paths["git"], "bwrap": paths["bwrap"], "mounts": paths}
    sandbox = {
        "network": "connectivity_disabled_in_private_namespace",
        "process_tree": "monitored",
        "bytecode_cache": "disabled",
        "host_home": "absent",
        "credentials": "absent",
        "receipt_mount": "absent",
        "timeout_seconds": 300,
        "term_grace_seconds": 5,
        "mounts": mounts,
        "symlinks": [{"target": "/usr/bin/python3", "link": "python3.12"}],
    }
    sandbox["profile_digest"] = sha256(canonical_bytes(sandbox))
    portable = {
        "executables": {
            "python": {"name": "python3", "version": "3.12.3", "sha256": sha256(b"python-bytes")},
            "git": {"name": "git", "version": "2.43.0", "sha256": sha256(b"git-bytes")},
            "bwrap": {"name": "bwrap", "version": "bubblewrap", "sha256": sha256(b"bwrap-bytes")},
        },
        "sandbox": sandbox,
    }
    snapshot = temp / "snapshot"
    snapshot.mkdir()
    return host, portable, snapshot


def _spec(check_id: str = CHECK_IDS[0]) -> dict:
    index = CHECK_IDS.index(check_id)
    if index == 0:
        argv = ["python3", "-B", "scaffold/tools/scfctl.py", "validate"]
    elif index == 1:
        argv = ["python3", "-B", "scaffold/tools/scfctl.py", "stale"]
    elif index == 2:
        argv = ["python3", "-B", "scaffold/governance/tools/govcheck.py"]
    elif index == 3:
        argv = ["git", "diff", "--check", "--no-ext-diff", "--no-textconv", _HEX, "b" * 40, "--"]
    else:
        argv = ["python3", "-B", "scaffold/local-ci/design_check.py"]
    return {
        "check_id": check_id,
        "argv": argv,
        "cwd_rel": ".",
        "selection": {"required": True, "local": True, "merge_unit": index == 3},
        "timeout_seconds": 300,
    }


class _StubProcess:
    def __init__(self, stdout: bytes = b"out", stderr: bytes = b"err", returncode: int | None = 0):
        out_r, out_w = os.pipe()
        err_r, err_w = os.pipe()
        self.stdout = os.fdopen(out_r, "rb", buffering=0)
        self.stderr = os.fdopen(err_r, "rb", buffering=0)
        os.write(out_w, stdout)
        os.write(err_w, stderr)
        if returncode is not None:
            os.close(out_w)
            os.close(err_w)
        self._out_w, self._err_w = out_w, err_w
        self.returncode = returncode
        self.pid = 987654
        self.waited = False

    def poll(self):
        return self.returncode

    def wait(self, timeout=None):
        self.waited = True
        return self.returncode

    def stop(self, signum):
        if self.returncode is None:
            self.returncode = -signum
            os.close(self._out_w)
            os.close(self._err_w)


class RunnerTests(unittest.TestCase):
    def test_fixed_commands_cover_the_five_required_checks(self):
        for check_id in CHECK_IDS:
            argv, executable = runner._validate_command(_spec(check_id))
            self.assertEqual(argv[0], "python3" if executable == "python" else "git")

    def test_mutated_command_and_selection_are_rejected_before_spawn(self):
        spec = _spec()
        spec["argv"][-1] = "other.py"
        with self.assertRaises(Diagnostic) as raised:
            runner._validate_command(spec)
        self.assertEqual((raised.exception.classification, raised.exception.reason), ("Rejected", "invalid_input"))

        spec = _spec(CHECK_IDS[3])
        spec["selection"]["required"] = False
        with self.assertRaises(Diagnostic):
            runner._validate_command(spec)
        spec["selection"]["required"] = 1
        with self.assertRaises(Diagnostic):
            runner._validate_command(spec)

    def test_runtime_tree_digest_is_order_independent_and_rejects_symlinks(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "b").write_bytes(b"b")
            (root / "a").write_bytes(b"a")
            expected = sha256(canonical_bytes({"a": sha256(b"a"), "b": sha256(b"b")}))
            self.assertEqual(runner.tree_digest(root), expected)
            (root / "link").symlink_to(root / "a")
            with self.assertRaises(Diagnostic) as raised:
                runner.tree_digest(root)
            self.assertEqual(raised.exception.reason, "conflict")

    def test_profile_digest_binds_mounts_and_bwrap_argv_has_no_host_receipt_mount(self):
        with tempfile.TemporaryDirectory() as directory:
            temp = Path(directory)
            host, portable, snapshot = _fixture(temp)
            _, _, mounts, symlinks = runner._validate_config(host, portable)
            command = ["python3", "-B", "scaffold/tools/scfctl.py", "validate"]
            argv = runner._bwrap_base(host, portable, mounts, symlinks, snapshot, command)
            self.assertIn("--unshare-all", argv)
            self.assertIn("--die-with-parent", argv)
            self.assertIn("--new-session", argv)
            self.assertIn("--clearenv", argv)
            self.assertIn("--tmpfs", argv)
            self.assertIn("/tmp", argv)
            self.assertIn("--proc", argv)
            self.assertIn("--dev", argv)
            self.assertIn("--remount-ro", argv)
            self.assertIn("/", argv)
            self.assertIn("GIT_CONFIG_NOSYSTEM", argv)
            self.assertIn("GIT_CONFIG_GLOBAL", argv)
            self.assertIn("GIT_TERMINAL_PROMPT", argv)
            self.assertIn("GIT_OPTIONAL_LOCKS", argv)
            self.assertIn("--ro-bind", argv)
            self.assertNotIn("/home", argv)
            self.assertNotIn("receipt", " ".join(argv))
            self.assertEqual(argv[-5], "--")
            self.assertEqual(argv[-4:], ["python3", "-B", "scaffold/tools/scfctl.py", "validate"])
            probe = runner._synthetic_probe_command(123)[-1]
            self.assertIn("/root", probe)
            self.assertIn("/usr", probe)
            self.assertIn("/tmp", probe)

    def test_unstarted_execution_keeps_output_hashes_null(self):
        with tempfile.TemporaryDirectory() as directory:
            host, portable, _snapshot = _fixture(Path(directory))
            _ = host
            execution = runner._execution(
                _spec(), portable["executables"]["python"], "denied", None, None, None,
                portable["sandbox"]["profile_digest"],
            )
        self.assertIsNone(execution["started_at"])
        self.assertIsNone(execution["finished_at"])
        self.assertIsNone(execution["stdout_sha256"])
        self.assertIsNone(execution["stderr_sha256"])

    def test_supervisor_can_return_ready_and_result_in_one_socket_read(self):
        class FakeProcess:
            def __init__(self, args, **kwargs):
                self.pid = 12345
                self.returncode = None
                fd = os.dup(kwargs["pass_fds"][0])

                def serve():
                    channel = socket.socket(fileno=fd)
                    request = bytearray()
                    while b"\n" not in request:
                        request.extend(channel.recv(65536))
                    response = {
                        "execution": runner._execution(
                            _spec(), {"name": "python3", "version": "3.12.3", "sha256": "c" * 64},
                            "success", 0, "2026-10-09T00:00:00Z", "2026-10-09T00:00:01Z",
                            "d" * 64, "e" * 64, "f" * 64,
                        ),
                        "safe_to_continue": True,
                        "diagnostic": None,
                    }
                    channel.sendall(b"READY\n" + canonical_bytes(response) + b"\n")
                    channel.close()
                    self.returncode = 0

                self.thread = threading.Thread(target=serve)
                self.thread.start()

            def poll(self):
                return self.returncode

            def wait(self, timeout=None):
                self.thread.join(timeout)
                return self.returncode

        with tempfile.TemporaryDirectory() as directory:
            host, portable, snapshot = _fixture(Path(directory))
            with patch.object(runner, "_verify_executable"), patch.object(runner.subprocess, "Popen", FakeProcess):
                result = runner.run_step(snapshot, _spec(), host, portable)
        self.assertEqual(result["execution"]["state"], "success")
        self.assertTrue(result["safe_to_continue"])

    def test_profile_digest_or_mount_byte_change_is_denied_by_validation(self):
        with tempfile.TemporaryDirectory() as directory:
            host, portable, _ = _fixture(Path(directory))
            python_mount = next(row for row in portable["sandbox"]["mounts"] if row["host_key"] == "python")
            python_mount["sha256"] = "0" * 64
            portable["sandbox"]["profile_digest"] = sha256(canonical_bytes({
                key: value for key, value in portable["sandbox"].items() if key != "profile_digest"
            }))
            _, _, mounts, _ = runner._validate_config(host, portable)
            python_mount = next(row for row in mounts if row["host_key"] == "python")
            with self.assertRaises(Diagnostic) as raised:
                actual = runner._read_source(Path(host["mounts"][python_mount["host_key"]]), python_mount["kind"])
                if actual != python_mount["sha256"]:
                    raise Diagnostic("denied", "runtime_mount_mismatch", "runtime mount bytes differ from profile")
            self.assertEqual(raised.exception.reason, "runtime_mount_mismatch")

    def test_public_config_validation_checks_shape_without_binary_preflight(self):
        with tempfile.TemporaryDirectory() as directory:
            host, portable, _snapshot = _fixture(Path(directory))
            runner.validate_runtime_config(host, portable)
            extra = dict(portable)
            extra["unexpected"] = True
            with self.assertRaises(Diagnostic) as raised:
                runner.validate_runtime_config(host, extra)
        self.assertEqual(raised.exception.reason, "invalid_input")

    def test_monitor_hashes_pipes_without_retaining_output_and_accepts_reaped_exit(self):
        process = _StubProcess(b"secret-looking stdout", b"private stderr", 0)
        with patch.object(runner, "_reap_adopted", return_value=(True, set())), \
                patch.object(runner, "_descendants", return_value=set()):
            code, out_hash, err_hash, reason, safe = runner._drain_pipes(
                process, 5, __import__("threading").Event())
        self.assertEqual(code, 0)
        self.assertEqual(out_hash, hashlib.sha256(b"secret-looking stdout").hexdigest())
        self.assertEqual(err_hash, hashlib.sha256(b"private stderr").hexdigest())
        self.assertIsNone(reason)
        self.assertTrue(safe)

    def test_timeout_stops_wrapper_and_requires_reap_before_safe_continue(self):
        process = _StubProcess(b"partial", b"", None)
        with patch.object(runner, "_signal_tree", side_effect=lambda _pid, sig: process.stop(sig)), \
                patch.object(runner, "_descendants", return_value=set()), \
                patch.object(runner, "_reap_adopted", return_value=(True, set())):
            code, out_hash, _err_hash, reason, safe = runner._drain_pipes(
                process, 0, __import__("threading").Event())
        self.assertEqual(code, -signal.SIGTERM)
        self.assertEqual(out_hash, hashlib.sha256(b"partial").hexdigest())
        self.assertEqual(reason, "timeout")
        self.assertTrue(safe)
        self.assertTrue(process.waited)

    def test_unreaped_descendant_blocks_safe_continuation(self):
        process = _StubProcess(b"", b"", 0)
        with patch.object(runner, "_reap_adopted", return_value=(False, {12345})), \
                patch.object(runner, "_descendants", return_value=set()), \
                patch.object(runner, "_signal_tree"):
            _code, _out_hash, _err_hash, _reason, safe = runner._drain_pipes(
                process, 5, __import__("threading").Event())
        self.assertFalse(safe)


if __name__ == "__main__":
    unittest.main()
