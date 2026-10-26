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
import time
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bounded_exec as b


def process_alive(pid):
    try:
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
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
        self.assertEqual(b.classify_terminal(base), {"ok": True, "classification": "ok", "failure": None})
        self.assertEqual(
            b.classify_terminal({**base, "timed_out": True}),
            {"ok": False, "classification": "timeout", "failure": "timeout"},
        )
        self.assertEqual(
            b.classify_terminal({**base, "tree_lingered": True}),
            {"ok": False, "classification": "tree_lingered", "failure": "tree_lingered"},
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
            {"ok": False, "classification": "reap_unconfirmed", "failure": "reap_unconfirmed"},
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
            len(outcome["stdout"].encode("utf-8")) + len(outcome["stderr"].encode("utf-8")),
            10,
        )

    def test_timeout_kills_process_group_and_confirms_esrch(self):
        with tempfile.TemporaryDirectory() as tmp:
            pid_file = Path(tmp) / "pids.json"
            late_marker = Path(tmp) / "late.txt"
            child_code = (
                "import json, os, signal, subprocess, sys, time\n"
                "signal.signal(signal.SIGTERM, signal.SIG_IGN)\n"
                "g = subprocess.Popen([sys.executable, '-c', "
                "\"import pathlib, signal, sys, time; signal.signal(signal.SIGTERM, signal.SIG_IGN); "
                "time.sleep(0.4); pathlib.Path(sys.argv[1]).write_text('late')\", sys.argv[2]])\n"
                "with open(sys.argv[1], 'w') as f:\n"
                "    json.dump({'parent_pid': os.getpid(), 'child_pid': g.pid, 'pgid': os.getpgrp()}, f)\n"
                "time.sleep(30)\n"
            )
            outcome = b.run_bounded(
                [sys.executable, "-c", child_code, str(pid_file), str(late_marker)],
                timeout_ms=150,
                grace_ms=50,
                reap_ms=1_000,
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
            time.sleep(0.35)
            self.assertFalse(late_marker.exists())

    def test_tree_lingered_reaps_grandchild_after_direct_child_exits_zero(self):
        with tempfile.TemporaryDirectory() as tmp:
            pid_file = Path(tmp) / "lingering.json"
            child_code = (
                "import json, os, signal, subprocess, sys\n"
                "g = subprocess.Popen([sys.executable, '-c', "
                "\"import signal, time; signal.signal(signal.SIGTERM, signal.SIG_IGN); time.sleep(30)\"], "
                "stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)\n"
                "with open(sys.argv[1], 'w') as f:\n"
                "    json.dump({'parent_pid': os.getpid(), 'child_pid': g.pid, 'pgid': os.getpgrp()}, f)\n"
                "sys.stdout.write('direct-done')\n"
            )
            t0 = time.monotonic()
            outcome = b.run_bounded(
                [sys.executable, "-c", child_code, str(pid_file)],
                timeout_ms=2_000,
                grace_ms=60,
                reap_ms=1_000,
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
            self.assertLess(elapsed, 1.2)
            self.assertFalse(process_alive(pids["child_pid"]))
            with self.assertRaises(ProcessLookupError):
                os.killpg(pids["pgid"], 0)

    def test_parent_signal_forwarded_to_process_group_and_reaped(self):
        for sig_name, expected_code in (("SIGINT", 130), ("SIGTERM", 143), ("SIGHUP", 129)):
            with self.subTest(signal=sig_name):
                with tempfile.TemporaryDirectory() as tmp:
                    pid_file = Path(tmp) / "sig_pids.json"
                    out_file = Path(tmp) / "outcome.json"
                    child_code = (
                        "import json, os, signal, subprocess, sys, time\n"
                        "signal.signal(signal.SIGTERM, signal.SIG_IGN)\n"
                        "g = subprocess.Popen([sys.executable, '-c', "
                        "\"import signal, time; signal.signal(signal.SIGTERM, signal.SIG_IGN); time.sleep(30)\"])\n"
                        "with open(sys.argv[1], 'w') as f:\n"
                        "    json.dump({'parent_pid': os.getpid(), 'child_pid': g.pid, 'pgid': os.getpgrp()}, f)\n"
                        "time.sleep(30)\n"
                    )
                    wrapper_code = (
                        "import json, pathlib, sys\n"
                        f"sys.path.insert(0, {json.dumps(str(Path(__file__).resolve().parent))})\n"
                        "import bounded_exec as b\n"
                        "outcome = b.run_bounded([sys.executable, '-c', sys.argv[1], sys.argv[2]], "
                        "timeout_ms=10000, grace_ms=50, reap_ms=1000)\n"
                        "pathlib.Path(sys.argv[3]).write_text(json.dumps(outcome))\n"
                        "raise SystemExit(b.exit_code_for_outcome(outcome))\n"
                    )
                    wrapper = subprocess.Popen(
                        [sys.executable, "-c", wrapper_code, child_code, str(pid_file), str(out_file)],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                    )
                    deadline = time.monotonic() + 5.0
                    while not pid_file.exists():
                        if time.monotonic() >= deadline:
                            wrapper.kill()
                            self.fail("pid_file was not created in time")
                        time.sleep(0.01)
                    sig_num = getattr(signal, sig_name)
                    wrapper.send_signal(sig_num)
                    time.sleep(0.02)
                    # Repeated signal during cleanup must not abort cleanup early.
                    try:
                        wrapper.send_signal(sig_num)
                    except ProcessLookupError:
                        pass
                    rc = wrapper.wait(timeout=5.0)
                    self.assertEqual(rc, expected_code)
                    pids = json.loads(pid_file.read_text(encoding="utf-8"))
                    outcome = json.loads(out_file.read_text(encoding="utf-8"))
                    self.assertFalse(outcome["ok"])
                    self.assertEqual(outcome["classification"], "signal")
                    self.assertEqual(outcome["interrupted_by"], sig_name)
                    self.assertTrue(outcome["reaped"])
                    self.assertFalse(process_alive(pids["parent_pid"]))
                    self.assertFalse(process_alive(pids["child_pid"]))

    def test_reap_unconfirmed_when_group_never_reaches_esrch(self):
        real_killpg = os.killpg

        def fake_killpg(pgid, sig):
            if sig == 0:
                # Simulate a process group that never disappears (never raises ESRCH).
                return None
            return real_killpg(pgid, sig)

        outcome = b.run_bounded(
            [sys.executable, "-c", "import time; time.sleep(5)"],
            timeout_ms=50,
            grace_ms=30,
            reap_ms=60,
            killpg_fn=fake_killpg,
        )
        # Ensure the real group is cleaned up.
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
        # 1. RLIMIT_AS: allocating 256 MiB under a 128 MiB virtual memory limit fails with MemoryError.
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

        # 2. RLIMIT_CPU: spinning CPU for >1s under rlimit_cpu_seconds=1 is killed by signal before 5s timeout.
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
