"""Run orchestration oracles; no checker or archive executable is started."""
import json
import os
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
import runner
from common import CHECK_IDS, Diagnostic, canonical_bytes, sha256
from snapshot import CHECKER_PATHS, LEDGER_PATH, MANIFEST_PATH
from plan import compile_plan, COMMAND_TEMPLATES
from source_l7_runner import (CURRENT_DESIGN_PATHS, EXPECTED_DISCOVERY_IDS,
                              FORMAL_ID_CLOSURE, FORMAL_MAPPING, SOURCE_SHA256,
                              SUPPLEMENTAL_SOURCE_REFS, SUPPLEMENTAL_SOURCE_SHA256, SUITE_ID)

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
                return "\n".join("`" + ident + "`" for ident in FORMAL_ID_CLOSURE).encode()
            if path in SOURCE_SHA256:
                return subprocess.check_output(
                    ["git", "show", "79013543184a6e47f99bc2ded1bb7a2e7f85737e:" + path],
                    cwd=_LOCAL_CI.parent.parent)
            return Path(_LOCAL_CI.parent.parent, path).read_bytes()
        self._target_blob = target_blob
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
                       "skipped_ids": [], "expected_failure_count": 0, "expected_failure_ids": [],
                       "unexpected_success_count": 0, "unexpected_success_ids": [],
                       "exit_code": 0, "state": "success"}
            result["suite_runner_stdout"] = canonical_bytes(payload)
            result["suite_runner_stdout_overflow"] = False
        return result

    def run_ci(self):
        return driver.run_local_ci(self.root, TARGET["base_commit"], TARGET["head_commit"],
                                   self.host, self.root.parent / "unused-receipt.json")

    def restore_snapshot_permissions(self):
        for parent, _dirs, files in os.walk(self.snapshot.root):
            Path(parent).chmod(0o700)
            for name in files:
                (Path(parent) / name).chmod(0o600)

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

    def test_stage1_l7_suite_plan_literal_matches_supervisor_command_and_rejects_legacy_id(self):
        expected = ("python3", "-B", "scaffold/local-ci/source_l7_runner.py",
                    "--suite", "stage1-l7-source")
        self.assertEqual(COMMAND_TEMPLATES[5], expected)
        compiled = compile_plan(TARGET, self.portable, "d" * 64, "1")
        suite_spec = compiled["commands"][5]
        self.assertEqual(tuple(suite_spec["argv"]), expected)
        self.assertEqual(runner._validate_command(suite_spec)[0], list(expected))

        for legacy_id in ("common-kernel-k1-k2", "common-kernel-k1-k2-k3-k5-k6"):
            legacy_spec = dict(suite_spec, argv=[*suite_spec["argv"][:-1], legacy_id])
            with self.subTest(legacy_id=legacy_id), self.assertRaises(Diagnostic) as caught:
                runner._validate_command(legacy_spec)
            self.assertEqual((caught.exception.classification, caught.exception.reason),
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

    def test_suite_expected_failure_is_preserved_in_full_and_compact_evidence(self):
        test_id = EXPECTED_DISCOVERY_IDS[0]

        def expected_failure_step(root, spec, host, portable, cancel):
            result = self.success(root, spec, host, portable, cancel)
            if spec["check_id"] == "LC-STAGE1-L7-001":
                row = result["execution"]
                row.update(state="fail", exit_code=1)
                payload = {"schema_version": 1, "suite_id": SUITE_ID, "complete": True,
                           "discovered_test_ids": list(EXPECTED_DISCOVERY_IDS),
                           "executed_test_ids": list(EXPECTED_DISCOVERY_IDS),
                           "test_count": len(EXPECTED_DISCOVERY_IDS),
                           "failure_count": 0, "failed_ids": [], "error_count": 0, "error_ids": [],
                           "skip_count": 0, "skipped_ids": [],
                           "expected_failure_count": 1, "expected_failure_ids": [test_id],
                           "unexpected_success_count": 0, "unexpected_success_ids": [],
                           "exit_code": 1, "state": "fail"}
                result["suite_runner_stdout"] = canonical_bytes(payload)
            return result

        self.mocks["run_step"].side_effect = expected_failure_step
        result = self.run_ci()
        self.assertEqual(result["aggregate_state"], "fail")
        evidence = result["executions"][-1]["suite_evidence"]
        self.assertEqual(evidence["expected_failure_count"], 1)
        artifact = self.mocks["write_private_artifact"].call_args.args[0]
        self.assertEqual(artifact["expected_failure_ids"], [test_id])
        self.assertEqual(artifact["unexpected_success_ids"], [])

    def test_failure_error_skip_and_unexpected_success_reach_full_and_compact_evidence(self):
        ids = list(EXPECTED_DISCOVERY_IDS)
        cases = (("failure_count", "failed_ids"), ("error_count", "error_ids"),
                 ("skip_count", "skipped_ids"), ("unexpected_success_count", "unexpected_success_ids"))
        for count_key, ids_key in cases:
            with self.subTest(outcome=count_key):
                self.restore_snapshot_permissions()
                def outcome_step(root, spec, host, portable, cancel):
                    result = self.success(root, spec, host, portable, cancel)
                    if spec["check_id"] == "LC-STAGE1-L7-001":
                        result["execution"].update(state="fail", exit_code=1)
                        payload = {"schema_version": 1, "suite_id": SUITE_ID, "complete": True,
                                   "discovered_test_ids": ids, "executed_test_ids": ids,
                                   "test_count": len(ids), "failure_count": 0, "failed_ids": [],
                                   "error_count": 0, "error_ids": [], "skip_count": 0, "skipped_ids": [],
                                   "expected_failure_count": 0, "expected_failure_ids": [],
                                   "unexpected_success_count": 0, "unexpected_success_ids": [],
                                   "exit_code": 1, "state": "fail"}
                        payload[count_key] = 1
                        payload[ids_key] = [ids[0]]
                        result["suite_runner_stdout"] = canonical_bytes(payload)
                    return result

                self.calls = []
                self.mocks["run_step"].side_effect = outcome_step
                self.mocks["write_private_artifact"].reset_mock(return_value=True)
                self.mocks["write_private_artifact"].return_value = (
                    self.root.parent / "artifact.json", "f" * 64, 100)
                result = self.run_ci()
                self.assertEqual(result["aggregate_state"], "fail")
                compact = result["executions"][-1]["suite_evidence"]
                self.assertEqual(compact[count_key], 1)
                full = self.mocks["write_private_artifact"].call_args.args[0]
                self.assertEqual(full[count_key], 1)
                self.assertEqual(full[ids_key], [ids[0]])

    def test_complete_five_family_failure_keeps_every_full_id_and_compact_count(self):
        ids = list(EXPECTED_DISCOVERY_IDS)
        families = (("failure_count", "failed_ids"), ("error_count", "error_ids"),
                    ("skip_count", "skipped_ids"),
                    ("expected_failure_count", "expected_failure_ids"),
                    ("unexpected_success_count", "unexpected_success_ids"))

        def all_outcomes_step(root, spec, host, portable, cancel):
            result = self.success(root, spec, host, portable, cancel)
            if spec["check_id"] == "LC-STAGE1-L7-001":
                result["execution"].update(state="fail", exit_code=1)
                payload = {"schema_version": 1, "suite_id": SUITE_ID, "complete": True,
                           "discovered_test_ids": ids, "executed_test_ids": ids,
                           "test_count": len(ids), "exit_code": 1, "state": "fail"}
                for (count_key, ids_key), ident in zip(families, ids):
                    payload[count_key], payload[ids_key] = 1, [ident]
                result["suite_runner_stdout"] = canonical_bytes(payload)
            return result

        self.mocks["run_step"].side_effect = all_outcomes_step
        result = self.run_ci()
        self.assertEqual(result["aggregate_state"], "fail")
        compact = result["executions"][-1]["suite_evidence"]
        full = self.mocks["write_private_artifact"].call_args.args[0]
        for (count_key, ids_key), ident in zip(families, ids):
            self.assertEqual(compact[count_key], 1)
            self.assertEqual(full[count_key], 1)
            self.assertEqual(full[ids_key], [ident])

    def test_l7_artifact_write_failure_never_emits_positive_receipt(self):
        self.mocks["write_private_artifact"].side_effect = Diagnostic(
            "Unknown", "unreadable", "synthetic artifact storage failure")
        with self.assertRaises(Diagnostic) as raised:
            self.run_ci()
        self.assertEqual((raised.exception.classification, raised.exception.reason),
                         ("Unknown", "unreadable"))
        self.mocks["write_receipt"].assert_not_called()
        self.assertEqual(len(raised.exception.evidence), 6)
        self.assertEqual(raised.exception.evidence[-1]["check_id"], CHECK_IDS[-1])
        self.assertEqual(raised.exception.evidence[-1]["state"], "fail")
        self.assertFalse(raised.exception.evidence[-1]["result_complete"])

    def test_bad_supervisor_frames_overflow_and_json_create_partial_not_complete_evidence(self):
        ids = list(EXPECTED_DISCOVERY_IDS)
        base = {"schema_version": 1, "suite_id": SUITE_ID, "complete": True,
                "discovered_test_ids": ids, "executed_test_ids": ids, "test_count": len(ids),
                "failure_count": 0, "failed_ids": [], "error_count": 0, "error_ids": [],
                "skip_count": 0, "skipped_ids": [], "expected_failure_count": 0,
                "expected_failure_ids": [], "unexpected_success_count": 0,
                "unexpected_success_ids": [], "exit_code": 0, "state": "success"}
        variants = {
            "extra_field": (dict(base, extra=True), False),
            "bool_count": (dict(base, failure_count=True), False),
            "count_id_mismatch": (dict(base, failure_count=1), False),
            "incomplete": (dict(base, complete=False), False),
            "exit_state_mismatch": (dict(base, failure_count=1, failed_ids=[ids[0]],
                                          exit_code=1, state="fail"), False),
            "overflow": (canonical_bytes(base), True),
            "bad_json": (b"{bad json", False),
        }
        for label, (payload, overflow) in variants.items():
            with self.subTest(frame=label):
                self.restore_snapshot_permissions()
                def malformed_step(root, spec, host, portable, cancel):
                    result = self.success(root, spec, host, portable, cancel)
                    if spec["check_id"] == "LC-STAGE1-L7-001":
                        result["suite_runner_stdout"] = payload if isinstance(payload, bytes) else canonical_bytes(payload)
                        result["suite_runner_stdout_overflow"] = overflow
                    return result
                self.calls = []
                self.mocks["run_step"].side_effect = malformed_step
                self.mocks["write_private_artifact"].reset_mock(return_value=True)
                self.mocks["write_private_artifact"].return_value = (
                    self.root.parent / "artifact.json", "f" * 64, 100)
                result = self.run_ci()
                row = result["executions"][-1]
                self.assertEqual(result["aggregate_state"], "fail")
                self.assertFalse(row["result_complete"])
                self.assertNotIn("suite_evidence", row)
                self.assertIn("partial_diagnostic_sha256", row)
                partial = self.mocks["write_private_artifact"].call_args.args[0]
                self.assertEqual(partial["artifact_kind"], "partial_l7_suite_diagnostic")

    def test_unstarted_denied_l7_has_no_suite_artifact_or_partial_reference(self):
        def deny_first(root, spec, host, portable, cancel):
            row = driver.unstarted(spec, "denied", portable["executables"]["python"],
                                   portable["sandbox"]["profile_digest"])
            return {"execution": row, "safe_to_continue": False, "diagnostic": None}
        self.mocks["run_step"].side_effect = deny_first
        result = self.run_ci()
        l7 = result["executions"][-1]
        self.assertEqual(result["aggregate_state"], "denied")
        self.assertFalse(l7["result_complete"])
        self.assertIsNone(l7["started_at"])
        self.assertNotIn("suite_evidence", l7)
        self.assertNotIn("partial_diagnostic_sha256", l7)
        self.mocks["write_private_artifact"].assert_not_called()
        self.mocks["write_receipt"].assert_called_once()

    def test_suite_result_rejects_empty_nonzero_and_inconsistent_outcome_frames(self):
        ids = list(EXPECTED_DISCOVERY_IDS)
        payload = {"schema_version": 1, "suite_id": SUITE_ID, "complete": True,
                   "discovered_test_ids": ids, "executed_test_ids": ids,
                   "test_count": len(ids), "failure_count": 0, "failed_ids": [],
                   "error_count": 0, "error_ids": [], "skip_count": 0, "skipped_ids": [],
                   "expected_failure_count": 0, "expected_failure_ids": [],
                   "unexpected_success_count": 0, "unexpected_success_ids": [],
                   "exit_code": 0, "state": "success"}
        row = {"exit_code": 0, "state": "success"}
        source_refs = [{"identity": path} for path, *_ in SUPPLEMENTAL_SOURCE_REFS.values()]
        source_bytes = {path: Path(_LOCAL_CI.parent.parent, path).read_bytes()
                        for path, *_ in SUPPLEMENTAL_SOURCE_REFS.values()}
        valid = driver._validate_suite_result(payload, TARGET, source_refs, row, source_bytes)
        self.assertEqual(valid["state"], "success")
        self.assertIn("expected_failure_ids", valid)

        mutations = []
        nonzero_empty = dict(payload, exit_code=1, state="fail")
        mutations.append(nonzero_empty)
        zero_with_outcome = dict(payload, expected_failure_count=1,
                                 expected_failure_ids=[ids[0]], state="fail")
        mutations.append(zero_with_outcome)
        bool_count = dict(payload, unexpected_success_count=True)
        mutations.append(bool_count)
        overlap = dict(payload, failure_count=1, failed_ids=[ids[0]],
                       unexpected_success_count=1, unexpected_success_ids=[ids[0]],
                       exit_code=1, state="fail")
        mutations.append(overlap)
        for frame in mutations:
            with self.subTest(frame=frame):
                execution = {"exit_code": frame["exit_code"], "state": frame["state"]}
                with self.assertRaises(Diagnostic) as raised:
                    driver._validate_suite_result(frame, TARGET, source_refs, execution, source_bytes)
                self.assertEqual((raised.exception.classification, raised.exception.reason),
                                 ("Unknown", "conflict"))

    def test_l7_prepare_missing_and_conflict_write_partial_artifact_with_prior_five_rows(self):
        for reason in ("missing_input", "conflict"):
            with self.subTest(reason=reason):
                self.mocks["write_private_artifact"].reset_mock(return_value=True)
                self.mocks["write_private_artifact"].return_value = (
                    self.root.parent / "artifact.json", "f" * 64, 100)
                reader = self.mocks["GitReader"].return_value
                if reason == "missing_input":
                    def missing(_entries, path, _expected=None):
                        if path == CURRENT_DESIGN_PATHS[1]:
                            raise Diagnostic("Unknown", "missing_input", "synthetic absent L7 source")
                        return self._target_blob(_entries, path, _expected)
                    reader.blob.side_effect = missing
                else:
                    def conflict(_entries, path, _expected=None):
                        if path == CURRENT_DESIGN_PATHS[1]:
                            return b"\n".join(
                                ("`" + row["formal_l7_id"] + "`").encode()
                                for row in FORMAL_MAPPING
                                if row["formal_l7_id"] != "CK-K3-UT-001")
                        return self._target_blob(_entries, path, _expected)
                    reader.blob.side_effect = conflict
                with self.assertRaises(Diagnostic) as raised:
                    self.run_ci()
                self.assertEqual((raised.exception.classification, raised.exception.reason),
                                 ("Unknown", reason))
                self.assertTrue(hasattr(raised.exception, "partial_diagnostic_sha256"))
                partial = self.mocks["write_private_artifact"].call_args.args[0]
                self.assertEqual(partial["artifact_kind"], "partial_local_ci_diagnostic")
                self.assertEqual(len(partial["completed_executions"]), 5)
                self.mocks["write_receipt"].assert_not_called()
                self.mocks["read_fixed_snapshot"].return_value.close.assert_called()
                self.mocks["run_step"].reset_mock()
                self.mocks["write_receipt"].reset_mock()
                self.mocks["read_fixed_snapshot"].reset_mock()
                reader.blob.side_effect = self._target_blob

    def test_runner_fixed_mapping_conflict_is_started_fail_with_partial_only(self):
        diagnostic_frame = canonical_bytes({
            "schema_version": 1, "suite_id": SUITE_ID, "complete": False,
            "diagnostic": {"classification": "Unknown", "reason": "conflict"},
        })

        def mapping_conflict_step(root, spec, host, portable, cancel):
            result = self.success(root, spec, host, portable, cancel)
            if spec["check_id"] == "LC-STAGE1-L7-001":
                row = result["execution"]
                row.update(state="fail", exit_code=2)
                result["suite_runner_stdout"] = diagnostic_frame
            return result

        self.mocks["run_step"].side_effect = mapping_conflict_step
        result = self.run_ci()
        row = result["executions"][-1]
        self.assertEqual(result["aggregate_state"], "fail")
        self.assertEqual(row["state"], "fail")
        self.assertIsNotNone(row["started_at"])
        self.assertFalse(row["result_complete"])
        self.assertNotIn("suite_evidence", row)
        self.assertIn("partial_diagnostic_sha256", row)
        artifact = self.mocks["write_private_artifact"].call_args.args[0]
        self.assertEqual(artifact["artifact_kind"], "partial_l7_suite_diagnostic")
        self.assertEqual((artifact["classification"], artifact["reason"]), ("Unknown", "conflict"))
        self.assertEqual(artifact["reported"], {"classification": "Unknown", "overflow": False})
        self.mocks["write_receipt"].assert_called_once()

    def test_each_k3_source_blob_missing_preserves_five_prior_rows_before_spawn(self):
        reader = self.mocks["GitReader"].return_value
        for missing_path in (
                "helix/helix-harness/units/common-kernel/src/permission.py",
                "helix/helix-harness/units/common-kernel/tests/test_k3.py"):
            with self.subTest(path=missing_path):
                self.calls = []
                self.mocks["write_private_artifact"].reset_mock(return_value=True)
                self.mocks["write_private_artifact"].return_value = (
                    self.root.parent / "artifact.json", "f" * 64, 100)
                self.mocks["write_receipt"].reset_mock()

                def missing(_entries, path, _expected=None):
                    if path == missing_path:
                        raise Diagnostic("Unknown", "missing_input", "synthetic missing target blob")
                    return self._target_blob(_entries, path, _expected)

                reader.blob.side_effect = missing
                with self.assertRaises(Diagnostic) as raised:
                    self.run_ci()
                self.assertEqual((raised.exception.classification, raised.exception.reason),
                                 ("Unknown", "missing_input"))
                self.assertEqual(self.calls, list(CHECK_IDS[:5]))
                self.assertTrue(hasattr(raised.exception, "partial_diagnostic_sha256"))
                partial = self.mocks["write_private_artifact"].call_args.args[0]
                self.assertEqual(partial["artifact_kind"], "partial_local_ci_diagnostic")
                self.assertEqual(len(partial["completed_executions"]), 5)
                self.assertNotIn(CHECK_IDS[5], [row["check_id"] for row in partial["completed_executions"]])
                self.mocks["write_receipt"].assert_not_called()
                reader.blob.side_effect = self._target_blob

    def test_ast_identity_mismatch_stops_before_suite_spawn_and_keeps_prior_diagnostics(self):
        path = "helix/helix-brain/units/stage1-brain/tests/test_brain.py"
        original = self._target_blob({}, path)
        old_name = b"test_trace_source_projects_each_declared_field_and_keeps_owner_roles"
        changed = original.replace(old_name, b"test_removed_source_method", 1)
        self.assertNotEqual(changed, original)
        expected = dict(SUPPLEMENTAL_SOURCE_SHA256)
        expected[path] = sha256(changed)

        def mutated_target_blob(_entries, source_path, _expected=None):
            if source_path == path:
                return changed
            return self._target_blob(_entries, source_path, _expected)

        reader = self.mocks["GitReader"].return_value
        reader.blob.side_effect = mutated_target_blob
        with patch.object(driver, "SUPPLEMENTAL_SOURCE_SHA256", expected):
            with self.assertRaises(Diagnostic) as raised:
                self.run_ci()
        self.assertEqual((raised.exception.classification, raised.exception.reason),
                         ("Unknown", "conflict"))
        self.assertEqual(self.calls, list(CHECK_IDS[:5]))
        partial = self.mocks["write_private_artifact"].call_args.args[0]
        self.assertEqual(partial["artifact_kind"], "partial_local_ci_diagnostic")
        self.assertEqual(len(partial["completed_executions"]), 5)
        self.assertNotIn(CHECK_IDS[5], [row["check_id"] for row in partial["completed_executions"]])
        self.mocks["write_receipt"].assert_not_called()
        reader.blob.side_effect = self._target_blob

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
