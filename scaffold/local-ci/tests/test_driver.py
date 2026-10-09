"""Run-level state boundaries using fixed synthetic execution outcomes."""
from pathlib import Path
import sys
import threading
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import CHECK_IDS, Diagnostic
from driver import execute_plan, unstarted
from plan import compile_plan


IDENTITY = {"name": "synthetic", "version": "1", "sha256": "a" * 64}
PORTABLE = {"executables": {"python": IDENTITY, "git": IDENTITY},
            "sandbox": {"profile_digest": "b" * 64}}
TARGET = {"repository_id": "synthetic", "base_commit": "c" * 40,
          "merge_base": "c" * 40, "head_commit": "d" * 40,
          "head_tree": "e" * 40, "worktree_clean": True}


class DriverTests(unittest.TestCase):
    def setUp(self):
        self.plan = compile_plan(TARGET, PORTABLE, "f" * 64, "1")
        self.calls = []

    def success(self, spec):
        self.calls.append(spec["check_id"])
        row = unstarted(spec, "success", IDENTITY, "b" * 64)
        row.update(exit_code=0, started_at="start", finished_at="finish",
                   stdout_sha256="c" * 64, stderr_sha256="d" * 64)
        return {"execution": row, "safe_to_continue": True, "diagnostic": None}

    def test_UT_LCI_27_29_fixed_plan_success(self):
        rows, aggregate = execute_plan(self.plan, PORTABLE, self.success, lambda: None)
        self.assertEqual(self.calls, list(CHECK_IDS))
        self.assertEqual(aggregate, "success")
        self.assertEqual(len(rows), 6)
        self.assertEqual([c["selection"]["merge_unit"] for c in self.plan["commands"]],
                         [False, False, False, True, False, False])

    def test_UT_LCI_12_failed_step_still_runs_remaining(self):
        def step(spec):
            result = self.success(spec)
            if spec["check_id"] == CHECK_IDS[0]:
                result["execution"].update(state="fail", exit_code=1)
            return result
        rows, aggregate = execute_plan(self.plan, PORTABLE, step, lambda: None)
        self.assertEqual(self.calls, list(CHECK_IDS))
        self.assertEqual(aggregate, "fail")
        self.assertEqual(rows[-1]["state"], "success")

    def test_UT_LCI_13_final_drift_keeps_evidence_without_fold(self):
        def recheck():
            if len(self.calls) == len(CHECK_IDS):
                raise Diagnostic("Stale", "target_changed")
        with self.assertRaises(Diagnostic) as raised:
            execute_plan(self.plan, PORTABLE, self.success, recheck)
        self.assertEqual(len(raised.exception.evidence), 6)
        self.assertTrue(all(row["state"] == "success" for row in raised.exception.evidence))

    def test_midrun_drift_preserves_done_rows_and_marks_only_unstarted(self):
        def recheck():
            if len(self.calls) == 1:
                raise Diagnostic("Stale", "target_changed")
        rows, aggregate = execute_plan(self.plan, PORTABLE, self.success, recheck)
        self.assertEqual(self.calls, [CHECK_IDS[0]])
        self.assertEqual([r["state"] for r in rows], ["success"] + ["stale"] * 5)
        self.assertEqual(aggregate, "stale")
        self.assertTrue(all(r["started_at"] is None for r in rows[1:]))

    def test_prestart_drift_does_not_start_any_checker(self):
        def recheck():
            raise Diagnostic("Stale", "target_changed")
        with self.assertRaises(Diagnostic):
            execute_plan(self.plan, PORTABLE, self.success, recheck)
        self.assertEqual(self.calls, [])

    def test_timeout_reaped_continues_but_cancel_reaped_stops(self):
        for reason in ("timeout", "cancelled"):
            with self.subTest(reason=reason):
                self.calls = []
                def step(spec):
                    result = self.success(spec)
                    if len(self.calls) == 1:
                        result["execution"].update(state="interrupted", reason=reason, exit_code=-15)
                    return result
                rows, aggregate = execute_plan(self.plan, PORTABLE, step, lambda: None)
                self.assertEqual(len(self.calls), len(CHECK_IDS) if reason == "timeout" else 1)
                self.assertEqual(aggregate, "interrupted")
                if reason == "cancelled":
                    self.assertTrue(all(r.get("reason") == "cancelled" for r in rows))

    def test_UT_LCI_44_unreaped_process_denies_remaining_without_launch(self):
        def step(spec):
            result = self.success(spec)
            result["execution"].update(state="denied", exit_code=None)
            result["safe_to_continue"] = False
            return result
        rows, aggregate = execute_plan(self.plan, PORTABLE, step, lambda: None)
        self.assertEqual(len(self.calls), 1)
        self.assertEqual([r["state"] for r in rows], ["denied"] * len(CHECK_IDS))
        self.assertEqual(aggregate, "denied")

    def test_required_skip_and_unknown_state_are_rejected_before_fold(self):
        for state in ("skipped", "invented"):
            with self.subTest(state=state):
                def step(spec):
                    result = self.success(spec)
                    result["execution"]["state"] = state
                    return result
                with self.assertRaises(Diagnostic) as raised:
                    execute_plan(self.plan, PORTABLE, step, lambda: None)
                self.assertEqual((raised.exception.classification, raised.exception.reason),
                                 ("Rejected", "invalid_input"))

    def test_malformed_supervisor_execution_is_rejected_without_followup_launch(self):
        for row in (None, [], {}, {"check_id": CHECK_IDS[0], "state": "skipped"}):
            with self.subTest(row=row):
                self.calls = []
                def step(spec):
                    self.calls.append(spec["check_id"])
                    return {"execution": row, "safe_to_continue": True}
                with self.assertRaises(Diagnostic) as raised:
                    execute_plan(self.plan, PORTABLE, step, lambda: None)
                self.assertEqual(raised.exception.classification, "Rejected")
                self.assertEqual(self.calls, [CHECK_IDS[0]])

    def test_external_cancel_before_first_launch(self):
        cancel = threading.Event()
        cancel.set()
        rows, aggregate = execute_plan(self.plan, PORTABLE, self.success, lambda: None, cancel)
        self.assertEqual(self.calls, [])
        self.assertEqual(aggregate, "interrupted")
        self.assertTrue(all(r["started_at"] is None and r["reason"] == "cancelled" for r in rows))


if __name__ == "__main__":
    unittest.main()
