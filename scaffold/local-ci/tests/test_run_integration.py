"""Run orchestration oracles; no checker or archive executable is started."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import Mock, patch
from types import SimpleNamespace

_LOCAL_CI = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_LOCAL_CI))
import driver
import plan
from common import CHECK_IDS, Diagnostic, canonical_bytes, sha256
from snapshot import CHECKER_PATHS, LEDGER_PATH, MANIFEST_PATH
from plan import compile_plan, COMMAND_TEMPLATES
from source_l7_runner import (CURRENT_DESIGN_PATHS, EXPECTED_DISCOVERY_IDS,
                              FORMAL_MAPPING, SOURCE_SHA256, SUITE_ID)

TARGET = {"repository_id": "RetryYN/HELIX-HARNESS", "base_commit": "a"*40,
          "merge_base": "a"*40, "head_commit": "b"*40, "head_tree": "c"*40,
          "worktree_clean": True}

class RunIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.portable_bytes = Path(driver.__file__).with_name("config.json").read_bytes()
        self.portable = json.loads(self.portable_bytes)
        self.host = {"python": "/synthetic/python", "git": "/synthetic/git",
                     "bwrap": "/synthetic/bwrap", "mounts": {}}
        sources = {p: b"synthetic source" for p in CHECKER_PATHS}
        sources["scaffold/local-ci/config.json"] = self.portable_bytes
        sources[MANIFEST_PATH] = b'{"version":"1"}'
        sources[LEDGER_PATH] = b"synthetic ledger"
        sources["docs/helix-os/L4-basic-design/local-ci.md"] = b"synthetic contract"
        self.snapshot = SimpleNamespace(root=self.root, sources=sources, source_refs=[], close=Mock())
        self.reader = None
        self.calls = []
        replacements = {"validate_runtime_config": Mock(), "GitReader": Mock(),
                        "resolve_target": Mock(return_value=TARGET),
                        "read_fixed_snapshot": Mock(return_value=self.snapshot),
                        "verify_design_manifest": Mock(return_value={"structure_complete": True}),
                        "check_clean_checkout": Mock(), "run_step": Mock(side_effect=self.success),
                        "write_receipt": Mock(),
                        "write_private_artifact": Mock(return_value=(self.root.parent / "artifact.json", "f" * 64, 100))}
        self.mocks = replacements
        for name, replacement in replacements.items():
            active = patch.object(driver, name, replacement)
            active.start(); self.addCleanup(active.stop)
        self.reader = self.mocks["GitReader"].return_value
        self.reader.entries.return_value = {}
        def target_blob(_entries, path, _expected=None):
            if path == CURRENT_DESIGN_PATHS[1]:
                return "\n".join("`" + row["formal_l7_id"] + "`" for row in FORMAL_MAPPING).encode()
            if path in SOURCE_SHA256:
                return subprocess.check_output(
                    ["git", "show", "f0ba62ce833463eb5f747ac4b95659ecea49928a:" + path],
                    cwd=_LOCAL_CI.parent.parent)
            return Path(_LOCAL_CI.parent.parent, path).read_bytes()
        self.reader.blob.side_effect = target_blob

    def success(self, root, spec, host, portable, cancel):
        self.calls.append(spec["check_id"])
        key = "git" if spec["check_id"] == CHECK_IDS[3] else "python"
        row = driver.unstarted(spec, "success", portable["executables"][key],
                               portable["sandbox"]["profile_digest"])
        row.update(exit_code=0, started_at="2026-10-09T00:00:00Z",
                   finished_at="2026-10-09T00:00:01Z", stdout_sha256=sha256(b"out"),
                   stderr_sha256=sha256(b"err"))
        result = {"execution": row, "safe_to_continue": True, "diagnostic": None}
        if spec["check_id"] == "LC-STAGE1-L7-001":
            ids = list(EXPECTED_DISCOVERY_IDS)
            payload = {"schema_version": 1, "suite_id": SUITE_ID, "complete": True,
                       "discovered_test_ids": ids, "executed_test_ids": ids,
                       "test_count": len(ids), "failure_count": 0, "failed_ids": [],
                       "error_count": 0, "error_ids": [], "skip_count": 0,
                       "skipped_ids": [], "exit_code": 0, "state": "success"}
            result["suite_runner_stdout"] = canonical_bytes(payload)
            result["suite_runner_stdout_overflow"] = False
        return result

    def run_ci(self):
        return driver.run_local_ci(self.root, TARGET["base_commit"], TARGET["head_commit"],
                                   self.host, self.root.parent / "unused-receipt.json")

    def test_missing_required_plan_step_is_unknown_missing_input(self):
        commands = COMMAND_TEMPLATES[:2] + COMMAND_TEMPLATES[3:]
        with patch.object(plan, "COMMAND_TEMPLATES", commands):
            with self.assertRaises(Diagnostic) as raised:
                compile_plan(TARGET, self.portable, "d"*64, "1")
        self.assertEqual((raised.exception.classification, raised.exception.reason),
                         ("Unknown", "missing_input"))

    def test_fixed_plan_command_override_is_rejected(self):
        commands = (("python3", "-B", "other.py"),) + COMMAND_TEMPLATES[1:]
        with patch.object(plan, "COMMAND_TEMPLATES", commands):
            with self.assertRaises(Diagnostic) as raised:
                compile_plan(TARGET, self.portable, "d"*64, "1")
        self.assertEqual((raised.exception.classification, raised.exception.reason),
                         ("Rejected", "invalid_input"))

    def test_full_run_constructs_and_validates_all_six_rows_before_write(self):
        receipt = self.run_ci()
        self.assertEqual(self.calls, list(CHECK_IDS))
        self.assertEqual(receipt["aggregate_state"], "success")
        self.assertEqual(receipt["plan"]["state"], "success")
        self.assertEqual(receipt["plan"]["selected_check_ids"], list(CHECK_IDS))
        for i, command in enumerate(receipt["plan"]["commands"]):
            self.assertEqual(command["argv"], [part.format(**TARGET) for part in COMMAND_TEMPLATES[i]])
            self.assertEqual(command["selection"], {"required": True, "local": True, "merge_unit": i==3})
        self.mocks["write_receipt"].assert_called_once()
        self.snapshot.close.assert_called_once()

    def test_stale_binding_failure_keeps_all_six_attempts_and_nonpositive_receipt(self):
        def stale_step(root, spec, host, portable, cancel):
            result = self.success(root, spec, host, portable, cancel)
            if spec["check_id"] == "LC-SCF-002":
                result["execution"].update(state="fail", exit_code=1)
                result["execution"]["stdout_sha256"] = sha256(b"stale=1")
            return result
        self.mocks["run_step"].side_effect = stale_step
        receipt = self.run_ci()
        self.assertEqual(self.calls, list(CHECK_IDS))
        self.assertEqual(receipt["executions"][1]["state"], "fail")
        self.assertEqual(receipt["aggregate_state"], "fail")
        self.mocks["write_receipt"].assert_called_once()

    def test_final_drift_keeps_six_evidence_rows_without_receipt(self):
        def recheck(*args):
            if len(self.calls) == 6:
                raise Diagnostic("Stale", "target_changed")
        self.mocks["check_clean_checkout"].side_effect = recheck
        with self.assertRaises(Diagnostic) as raised:
            self.run_ci()
        self.assertEqual(raised.exception.classification, "Stale")
        self.assertEqual(len(raised.exception.evidence), 6)
        self.mocks["write_receipt"].assert_not_called()
        self.snapshot.close.assert_called_once()

    def test_structural_missing_edge_and_duplicate_stop_before_any_step_or_receipt(self):
        for reason in ("missing_input", "conflict"):
            with self.subTest(reason=reason):
                self.mocks["verify_design_manifest"].side_effect = Diagnostic("Unknown", reason)
                with self.assertRaises(Diagnostic) as raised:
                    self.run_ci()
                self.assertEqual((raised.exception.classification, raised.exception.reason), ("Unknown", reason))
                self.assertFalse(hasattr(raised.exception, "evidence"))
                self.mocks["run_step"].assert_not_called()
                self.mocks["write_receipt"].assert_not_called()

    def test_invalid_or_missing_target_key_stops_before_snapshot_or_execution(self):
        for reason in ("missing_key", "invalid_input"):
            with self.subTest(reason=reason):
                self.mocks["resolve_target"].side_effect = Diagnostic("Rejected", reason)
                with self.assertRaises(Diagnostic) as raised:
                    self.run_ci()
                self.assertEqual(raised.exception.reason, reason)
                self.mocks["read_fixed_snapshot"].assert_not_called()
                self.mocks["run_step"].assert_not_called()
                self.mocks["write_receipt"].assert_not_called()

    def test_transitive_checker_checkout_drift_is_stale_before_execution(self):
        self.snapshot.source_refs = [{"path": "scaffold/governance/tools/gen_rulebook.py",
                                      "sha256": sha256(b"fixed child bytes")}]
        self.mocks["check_clean_checkout"].side_effect = Diagnostic("Stale", "target_changed")
        with self.assertRaises(Diagnostic) as raised:
            self.run_ci()
        self.assertEqual(raised.exception.classification, "Stale")
        self.mocks["run_step"].assert_not_called()
        self.mocks["write_receipt"].assert_not_called()

    def test_transitive_checker_blob_binding_conflict_stops_before_step(self):
        path = "scaffold/governance/tools/gen_rulebook.py"
        self.snapshot.source_refs = [{"path": path, "sha256": sha256(b"fixed child bytes")}]
        reader = self.mocks["GitReader"].return_value
        reader.blob.side_effect = Diagnostic("Unknown", "conflict", "declared source digest mismatch")
        with self.assertRaises(Diagnostic) as raised:
            self.run_ci()
        self.assertEqual((raised.exception.classification, raised.exception.reason), ("Unknown", "conflict"))
        reader.blob.assert_called_once()
        self.mocks["run_step"].assert_not_called()
        self.mocks["write_receipt"].assert_not_called()

if __name__ == "__main__":
    unittest.main()
