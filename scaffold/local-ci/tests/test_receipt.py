"""Single-change receipt oracle tests derived from local-CI L7."""
from __future__ import annotations

import os
import copy
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

_LOCAL_CI = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_LOCAL_CI))

from common import CHECK_IDS, Diagnostic, canonical_bytes, sha256  # noqa: E402
from receipt import (_validate_suite_evidence, verify_receipt, write_private_artifact,
                     write_receipt)
from plan import compile_plan  # noqa: E402
from source_l7_runner import (CURRENT_DESIGN_PATHS, SUPPLEMENTAL_DESIGN_PATHS,
                              HELPER_DESIGN_PATHS, SUPPLEMENTAL_SOURCE_SHA256,
                              HELPER_SOURCE_SHA256, EXPECTED_DISCOVERY_COUNT,
                              EXPECTED_DISCOVERY_IDS_SHA256, CORE_EXPECTED_DISCOVERY_COUNT,
                              CORE_EXPECTED_DISCOVERY_IDS_SHA256, SUPPLEMENTAL_IDS_SHA256,
                              SUPPLEMENTAL_EXPECTED_DISCOVERY_IDS,
                              MECHANISM_HELPER_EXPECTED_DISCOVERY_IDS,
                              MECHANISM_HELPER_EXPECTED_DISCOVERY_IDS_SHA256, FORMAL_MAPPING_SHA256,
                              SOURCE_SHA256, SUITE_ID, inventory_digest)  # noqa: E402


_HEX = "a" * 40
_RAW_SHA = "b" * 64
_TYPED_DIGEST = "sha256:" + _RAW_SHA
_RUNTIME = {key: {"name": "python3", "version": "3.11", "sha256": _RAW_SHA}
            for key in ("python", "git", "bwrap")}
_PORTABLE = {"executables": _RUNTIME, "sandbox": {"profile_digest": _RAW_SHA}}


def target() -> dict:
    return {
        "repository_id": "helix-harness",
        "base_commit": _HEX,
        "merge_base": "c" * 40,
        "head_commit": "d" * 40,
        "head_tree": "e" * 40,
        "worktree_clean": True,
    }


def ref(identity: str = "local-ci-contract", digest: str = _TYPED_DIGEST) -> dict:
    return {"kind": "source", "identity": identity, "revision": "1", "digest": digest}


def command(check_id: str, merge_unit: bool) -> dict:
    return {
        "check_id": check_id,
        "argv": ["python3", "-B", "checker.py", check_id],
        "cwd_rel": ".",
        "selection": {"required": True, "local": True, "merge_unit": merge_unit},
        "timeout_seconds": 300,
    }


def execution(check_id: str) -> dict:
    result = {
        "check_id": check_id,
        "portable_executable_identity": {"name": "python3", "version": "3.11", "sha256": _RAW_SHA},
        "state": "success",
        "exit_code": 0,
        "argv": ["python3", "-B", "checker.py", check_id],
        "cwd_rel": ".",
        "started_at": "2026-10-09T00:00:00Z",
        "finished_at": "2026-10-09T00:00:01Z",
        "timeout_seconds": 300,
        "sandbox_profile_digest": _RAW_SHA,
        "stdout_sha256": _RAW_SHA,
        "stderr_sha256": _RAW_SHA,
    }
    if check_id == "LC-STAGE1-L7-001":
        current = target()
        refs = suite_source_refs(current)
        result["result_complete"] = True
        result["suite_evidence"] = {
            "suite_id": SUITE_ID, "artifact_sha256": _RAW_SHA,
            "artifact_bytes": 100, "mapping_sha256": FORMAL_MAPPING_SHA256,
            "discovered_count": EXPECTED_DISCOVERY_COUNT, "discovered_ids_sha256": EXPECTED_DISCOVERY_IDS_SHA256,
            "executed_count": EXPECTED_DISCOVERY_COUNT, "executed_ids_sha256": EXPECTED_DISCOVERY_IDS_SHA256,
            "partition_evidence": {
                "core": {"discovered_count": CORE_EXPECTED_DISCOVERY_COUNT,
                         "discovered_ids_sha256": CORE_EXPECTED_DISCOVERY_IDS_SHA256,
                         "executed_count": CORE_EXPECTED_DISCOVERY_COUNT,
                         "executed_ids_sha256": CORE_EXPECTED_DISCOVERY_IDS_SHA256},
                "product_supplemental": {"discovered_count": len(SUPPLEMENTAL_EXPECTED_DISCOVERY_IDS),
                                         "discovered_ids_sha256": SUPPLEMENTAL_IDS_SHA256,
                                         "executed_count": len(SUPPLEMENTAL_EXPECTED_DISCOVERY_IDS),
                                         "executed_ids_sha256": SUPPLEMENTAL_IDS_SHA256},
                "mechanism_helper": {"discovered_count": len(MECHANISM_HELPER_EXPECTED_DISCOVERY_IDS),
                                     "discovered_ids_sha256": MECHANISM_HELPER_EXPECTED_DISCOVERY_IDS_SHA256,
                                     "executed_count": len(MECHANISM_HELPER_EXPECTED_DISCOVERY_IDS),
                                     "executed_ids_sha256": MECHANISM_HELPER_EXPECTED_DISCOVERY_IDS_SHA256},
            },
            "failure_count": 0, "error_count": 0, "skip_count": 0,
            "expected_failure_count": 0, "unexpected_success_count": 0,
            "source_refs": refs, "target": current,
        }
    return result


def suite_source_refs(current: dict) -> list[dict]:
    refs = [{"kind": "source", "identity": path, "revision": current["head_commit"],
             "digest": "sha256:" + digest}
            for path, digest in {**SOURCE_SHA256, **SUPPLEMENTAL_SOURCE_SHA256,
                                 **HELPER_SOURCE_SHA256}.items()]
    all_design_paths = sorted(set((
        *CURRENT_DESIGN_PATHS, *SUPPLEMENTAL_DESIGN_PATHS, *HELPER_DESIGN_PATHS)))
    refs.extend({"kind": "source", "identity": path, "revision": current["head_commit"],
                 "digest": _TYPED_DIGEST} for path in all_design_paths)
    return sorted(refs, key=lambda item: item["identity"])


def receipt() -> dict:
    current = target()
    commands = [command(check_id, index == 3) for index, check_id in enumerate(CHECK_IDS)]
    return {
        "schema_version": 1,
        "target": current,
        "contract_ref": ref(),
        "config_digest": _RAW_SHA,
        "design_manifest_digest": _RAW_SHA,
        "source_l7_inventory_digest": inventory_digest(),
        "checker_refs": [ref("scfctl"), ref("govcheck"), ref("gen_rulebook")],
        "runtime_identity": {key: dict(value) for key, value in _RUNTIME.items()},
        "plan": {
            "target": current,
            "contract_id": "OS-LOCAL-CI-001",
            "contract_version": "1",
            "selected_check_ids": list(CHECK_IDS),
            "selection_basis": "fixed_local_ci_contract",
            "config_digest": _RAW_SHA,
            "design_manifest_digest": _RAW_SHA,
            "source_l7_inventory_digest": inventory_digest(),
            "commands": commands,
            "state": "success",
        },
        "executions": [execution(check_id) for check_id in CHECK_IDS],
        "aggregate_state": "success",
        "created_at": "2026-10-09T00:00:02Z",
    }


def verify(data: bytes | str, *, current: dict | None = None, refs=None,
           complete: bool = True):
    body = receipt()
    return verify_receipt(
        data,
        current or body["target"],
        config_digest=_RAW_SHA,
        design_manifest_digest=_RAW_SHA,
        checker_refs=refs if refs is not None else body["checker_refs"],
        contract_ref=body["contract_ref"],
        structure_complete=complete, portable_config=_PORTABLE,
        source_l7_refs=[ref for ref in suite_source_refs(current or body["target"])
                        if ref["identity"] in (*CURRENT_DESIGN_PATHS, *SUPPLEMENTAL_DESIGN_PATHS,
                                                *HELPER_DESIGN_PATHS)],
    )


class VerifyReceiptTests(unittest.TestCase):
    def test_suite_evidence_guards_reject_one_field_mutation_each(self):
        valid = execution("LC-STAGE1-L7-001")["suite_evidence"]
        self.assertEqual(len({**SOURCE_SHA256, **SUPPLEMENTAL_SOURCE_SHA256,
                              **HELPER_SOURCE_SHA256}), 37)
        self.assertEqual(len(set((*CURRENT_DESIGN_PATHS, *SUPPLEMENTAL_DESIGN_PATHS,
                                  *HELPER_DESIGN_PATHS))), 14)
        self.assertEqual(len(valid["source_refs"]), 51)
        self.assertEqual(len({row["identity"] for row in valid["source_refs"]}), 51)
        mutations = (
            ("suite_id", "other-suite", "Rejected", "invalid_input"),
            ("mapping_sha256", "0" * 64, "Unknown", "conflict"),
            ("executed_count", 418, "Rejected", "invalid_input"),
        )
        for field, replacement, classification, reason in mutations:
            with self.subTest(field=field):
                changed = copy.deepcopy(valid)
                changed[field] = replacement
                with self.assertRaises(Diagnostic) as caught:
                    _validate_suite_evidence(changed)
                self.assertEqual((caught.exception.classification, caught.exception.reason),
                                 (classification, reason))

        changed_refs = copy.deepcopy(valid)
        changed_refs["source_refs"].pop()
        with self.assertRaises(Diagnostic) as caught:
            _validate_suite_evidence(changed_refs)
        self.assertEqual((caught.exception.classification, caught.exception.reason),
                         ("Rejected", "invalid_input"))

        duplicate_ref = copy.deepcopy(valid)
        duplicate_ref["source_refs"][-1] = copy.deepcopy(duplicate_ref["source_refs"][0])
        with self.assertRaises(Diagnostic) as caught:
            _validate_suite_evidence(duplicate_ref)
        self.assertEqual((caught.exception.classification, caught.exception.reason),
                         ("Rejected", "invalid_input"))

        changed_partition_digest = copy.deepcopy(valid)
        changed_partition_digest["partition_evidence"]["mechanism_helper"]["executed_ids_sha256"] = "0" * 64
        with self.assertRaises(Diagnostic) as caught:
            _validate_suite_evidence(changed_partition_digest)
        self.assertEqual((caught.exception.classification, caught.exception.reason),
                         ("Unknown", "conflict"))

        changed_partition = copy.deepcopy(valid)
        changed_partition["partition_evidence"]["product_supplemental"]["executed_count"] = 26
        with self.assertRaises(Diagnostic) as caught:
            _validate_suite_evidence(changed_partition)
        self.assertEqual((caught.exception.classification, caught.exception.reason),
                         ("Rejected", "invalid_input"))

    def test_legacy_k1_k2_suite_and_inventory_receipts_are_not_current_evidence(self):
        valid = execution("LC-STAGE1-L7-001")["suite_evidence"]
        for old_suite_id in ("common-kernel-k1-k2", "common-kernel-k1-k2-k3"):
            with self.subTest(old_suite_id=old_suite_id):
                legacy_suite = copy.deepcopy(valid)
                legacy_suite["suite_id"] = old_suite_id
                with self.assertRaises(Diagnostic) as caught:
                    _validate_suite_evidence(legacy_suite)
                self.assertEqual((caught.exception.classification, caught.exception.reason),
                                 ("Rejected", "invalid_input"))

        legacy_mapping = copy.deepcopy(receipt())
        old_inventory_digest = "9d8cb22dc211a572a67ac493df44436752e27c5e62633ae50ecd9f967b756ba0"
        legacy_mapping["source_l7_inventory_digest"] = old_inventory_digest
        legacy_mapping["plan"]["source_l7_inventory_digest"] = old_inventory_digest
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(legacy_mapping))
        self.assertEqual((caught.exception.classification, caught.exception.reason),
                         ("Unknown", "conflict"))

    def test_ut_lci_76_80_shared_role_pins_bind_config_and_invalidate_old_receipt(self):
        portable = copy.deepcopy(_PORTABLE)
        portable["executables"]["provider_git"] = {"name": "git", "version": "2.55.0", "sha256": "f" * 64}
        body = receipt()
        original_plan = compile_plan(body["target"], portable, _RAW_SHA, "1")
        body["plan"] = original_plan
        body["config_digest"] = original_plan["config_digest"]
        for row, spec in zip(body["executions"], original_plan["commands"]):
            row["argv"] = spec["argv"]
        kwargs = dict(design_manifest_digest=_RAW_SHA, checker_refs=body["checker_refs"],
                      contract_ref=body["contract_ref"], structure_complete=True, portable_config=portable,
                      source_l7_refs=[ref for ref in suite_source_refs(body["target"])
                                      if ref["identity"] in (*CURRENT_DESIGN_PATHS, *SUPPLEMENTAL_DESIGN_PATHS,
                                                              *HELPER_DESIGN_PATHS)])
        checked = verify_receipt(canonical_bytes(body), body["target"],
                                 config_digest=original_plan["config_digest"], plan_expected=original_plan, **kwargs)
        self.assertEqual(checked["status"], "verified")
        self.assertEqual(set(body["runtime_identity"]), {"python", "git", "bwrap"})
        portable["executables"]["provider_git"]["sha256"] = "e" * 64
        new_plan = compile_plan(body["target"], portable, _RAW_SHA, "1")
        self.assertNotEqual(original_plan["config_digest"], new_plan["config_digest"])
        self.assertEqual(original_plan["commands"], new_plan["commands"])
        with self.assertRaises(Diagnostic) as raised:
            verify_receipt(canonical_bytes(body), body["target"],
                           config_digest=new_plan["config_digest"], plan_expected=new_plan, **kwargs)
        self.assertEqual((raised.exception.classification, raised.exception.reason), ("Unknown", "conflict"))


    def test_ut_lci_30_canonical_baseline_is_verified(self):
        body = receipt()
        result = verify_receipt(
            canonical_bytes(body), body["target"], config_digest=_RAW_SHA,
            design_manifest_digest=_RAW_SHA, checker_refs=body["checker_refs"],
            contract_ref=body["contract_ref"], structure_complete=True, portable_config=_PORTABLE,
            source_l7_refs=[ref for ref in suite_source_refs(body["target"])
                            if ref["identity"] in (*CURRENT_DESIGN_PATHS, *SUPPLEMENTAL_DESIGN_PATHS,
                                                    *HELPER_DESIGN_PATHS)],
        )
        self.assertEqual(result["status"], "verified")
        self.assertEqual(result["aggregate_state"], "success")

    def test_runtime_identity_extra_path_is_rejected(self):
        body = receipt()
        body["runtime_identity"]["git"]["path"] = "/synthetic/private/git"
        with self.assertRaises(Diagnostic) as raised:
            verify(canonical_bytes(body))
        self.assertEqual(raised.exception.classification, "Rejected")

    def test_execution_identity_and_profile_are_bound_to_trusted_config(self):
        for field in ("portable_executable_identity", "sandbox_profile_digest"):
            body = receipt()
            if field == "portable_executable_identity":
                body["executions"][0][field]["sha256"] = "f"*64
            else:
                body["executions"][0][field] = "f"*64
            with self.subTest(field=field), self.assertRaises(Diagnostic) as raised:
                verify(canonical_bytes(body))
            self.assertEqual((raised.exception.classification, raised.exception.reason),
                             ("Unknown", "conflict"))

    def test_float_schema_and_timeout_are_rejected(self):
        for location in ("schema", "plan", "execution"):
            body = receipt()
            if location == "schema": body["schema_version"] = 1.0
            elif location == "plan": body["plan"]["commands"][0]["timeout_seconds"] = 300.0
            else: body["executions"][0]["timeout_seconds"] = 300.0
            with self.subTest(location=location), self.assertRaises(Diagnostic) as raised:
                verify(canonical_bytes(body))
            self.assertEqual(raised.exception.classification, "Rejected")

    def test_selection_integer_is_not_boolean_true(self):
        body = receipt()
        body["plan"]["commands"][0]["selection"]["required"] = 1
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(body))
        self.assertEqual((caught.exception.classification, caught.exception.reason),
                         ("Rejected", "invalid_input"))

    def test_ut_lci_14_duplicate_json_key_is_rejected(self):
        with self.assertRaises(Diagnostic) as caught:
            verify(b'{"schema_version":1,"schema_version":1}')
        self.assertEqual((caught.exception.classification, caught.exception.reason), ("Rejected", "invalid_input"))

    def test_ut_lci_15_head_tree_change_is_stale(self):
        current = target()
        current["head_tree"] = "f" * 40
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(receipt()), current=current)
        self.assertEqual(caught.exception.classification, "Stale")

    def test_ut_lci_16_same_target_checker_digest_change_is_conflict(self):
        current_refs = [ref("scfctl"), ref("govcheck", "sha256:" + "c" * 64), ref("gen_rulebook")]
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(receipt()), refs=current_refs)
        self.assertEqual((caught.exception.classification, caught.exception.reason), ("Unknown", "conflict"))

    def test_ut_lci_38_plan_state_is_not_execution_state(self):
        body = receipt()
        body["plan"]["state"] = "fail"
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(body))
        self.assertEqual((caught.exception.classification, caught.exception.reason), ("Rejected", "invalid_input"))

    def test_ut_lci_39_required_skipped_row_is_rejected_before_fold(self):
        body = receipt()
        body["executions"][0]["state"] = "skipped"
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(body))
        self.assertEqual((caught.exception.classification, caught.exception.reason), ("Rejected", "invalid_input"))

    def test_ut_lci_54_design_success_with_incomplete_manifest_is_rejected(self):
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(receipt()), complete=False)
        self.assertEqual((caught.exception.classification, caught.exception.reason), ("Rejected", "invalid_input"))

    def test_ut_lci_55_base_change_is_stale_even_when_head_is_same(self):
        current = target()
        current["base_commit"] = "f" * 40
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(receipt()), current=current)
        self.assertEqual(caught.exception.classification, "Stale")

    def test_ut_lci_59_missing_current_target_key_is_rejected_missing_key(self):
        current = target()
        del current["base_commit"]
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(receipt()), current=current)
        self.assertEqual((caught.exception.classification, caught.exception.reason), ("Rejected", "missing_key"))

    def test_ut_lci_60_malformed_current_oid_is_rejected_invalid_input(self):
        current = target()
        current["head_commit"] = "not-an-oid"
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(receipt()), current=current)
        self.assertEqual((caught.exception.classification, caught.exception.reason), ("Rejected", "invalid_input"))

    def test_missing_current_checker_ref_key_is_rejected_missing_key(self):
        current_refs = [ref("scfctl"), {"kind": "source", "identity": "govcheck", "revision": "1"}, ref("gen_rulebook")]
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(receipt()), refs=current_refs)
        self.assertEqual((caught.exception.classification, caught.exception.reason), ("Rejected", "missing_key"))

    def test_aggregate_must_equal_fixed_execution_fold(self):
        body = receipt()
        body["executions"][0]["state"] = "fail"
        body["executions"][0]["exit_code"] = 1
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(body))
        self.assertEqual((caught.exception.classification, caught.exception.reason), ("Rejected", "invalid_input"))

    def test_unknown_schema_field_is_rejected(self):
        body = receipt()
        body["extra"] = "not part of schema"
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(body))
        self.assertEqual(caught.exception.reason, "invalid_input")

    def test_sha256_fields_use_raw_hex_while_subject_refs_use_typed_digest(self):
        body = receipt()
        body["config_digest"] = _TYPED_DIGEST
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(body))
        self.assertEqual(caught.exception.reason, "invalid_input")

    def test_subject_ref_digest_requires_typed_digest_prefix(self):
        body = receipt()
        body["contract_ref"]["digest"] = _RAW_SHA
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(body))
        self.assertEqual(caught.exception.reason, "invalid_input")

    def test_execution_argv_must_match_its_plan_command(self):
        body = receipt()
        body["executions"][0]["argv"] = ["python3", "-B", "other.py"]
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(body))
        self.assertEqual(caught.exception.reason, "invalid_input")

    def test_suite_result_complete_and_partial_diagnostic_are_disjoint_states(self):
        incomplete = receipt()
        row = incomplete["executions"][-1]
        row["result_complete"] = False
        row.pop("suite_evidence")
        row["partial_diagnostic_sha256"] = _RAW_SHA
        row["state"] = "fail"
        row["exit_code"] = 2
        incomplete["aggregate_state"] = "fail"
        verify(canonical_bytes(incomplete))

        unstarted = receipt()
        row = unstarted["executions"][-1]
        row["result_complete"] = False
        row.pop("suite_evidence")
        row.update(state="denied", exit_code=None, started_at=None, finished_at=None,
                   stdout_sha256=None, stderr_sha256=None)
        unstarted["aggregate_state"] = "denied"
        verify(canonical_bytes(unstarted))

        mutations = []
        success_without_result = copy.deepcopy(incomplete)
        success_without_result["executions"][-1].update(state="success", exit_code=0)
        mutations.append(success_without_result)
        evidence_on_partial = copy.deepcopy(incomplete)
        evidence_on_partial["executions"][-1]["suite_evidence"] = execution("LC-STAGE1-L7-001")["suite_evidence"]
        mutations.append(evidence_on_partial)
        partial_on_complete = receipt()
        partial_on_complete["executions"][-1]["partial_diagnostic_sha256"] = _RAW_SHA
        mutations.append(partial_on_complete)
        for body in mutations:
            with self.subTest(body=body), self.assertRaises(Diagnostic) as caught:
                verify(canonical_bytes(body))
            self.assertEqual(caught.exception.reason, "invalid_input")

    def test_suite_compact_evidence_rejects_outcome_counts_or_identity_digest_drift(self):
        mutations = []
        count_overflow = receipt()
        count_overflow["executions"][-1]["suite_evidence"].update(failure_count=EXPECTED_DISCOVERY_COUNT, error_count=1)
        count_overflow["executions"][-1].update(state="fail", exit_code=1)
        count_overflow["aggregate_state"] = "fail"
        mutations.append(count_overflow)

        success_with_failure = receipt()
        success_with_failure["executions"][-1]["suite_evidence"]["failure_count"] = 1
        mutations.append(success_with_failure)

        failed_without_outcome = receipt()
        failed_without_outcome["executions"][-1].update(state="fail", exit_code=1)
        failed_without_outcome["aggregate_state"] = "fail"
        mutations.append(failed_without_outcome)

        identity_digest_drift = receipt()
        identity_digest_drift["executions"][-1]["suite_evidence"]["executed_ids_sha256"] = "f" * 64
        mutations.append(identity_digest_drift)

        success_with_expected_failure = receipt()
        success_with_expected_failure["executions"][-1]["suite_evidence"]["expected_failure_count"] = 1
        mutations.append(success_with_expected_failure)

        success_with_unexpected_success = receipt()
        success_with_unexpected_success["executions"][-1]["suite_evidence"]["unexpected_success_count"] = 1
        mutations.append(success_with_unexpected_success)

        expected_failure_count_overflow = receipt()
        expected_failure_count_overflow["executions"][-1]["suite_evidence"].update(
            executed_count=EXPECTED_DISCOVERY_COUNT, expected_failure_count=EXPECTED_DISCOVERY_COUNT,
            unexpected_success_count=1)
        expected_failure_count_overflow["executions"][-1].update(state="fail", exit_code=1)
        expected_failure_count_overflow["aggregate_state"] = "fail"
        mutations.append(expected_failure_count_overflow)

        for body in mutations:
            with self.subTest(body=body), self.assertRaises(Diagnostic):
                verify(canonical_bytes(body))

    def test_success_execution_requires_timestamps_and_output_digests(self):
        body = receipt()
        body["executions"][0]["stdout_sha256"] = None
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(body))
        self.assertEqual(caught.exception.reason, "invalid_input")

    def test_unstarted_stale_execution_requires_null_time_and_exit(self):
        body = receipt()
        row = body["executions"][0]
        row.update({"state": "stale", "started_at": None, "finished_at": None, "exit_code": None})
        body["aggregate_state"] = "stale"
        row["started_at"] = "2026-10-09T00:00:00Z"
        with self.assertRaises(Diagnostic) as caught:
            verify(canonical_bytes(body))
        self.assertEqual(caught.exception.reason, "invalid_input")

    def test_receipt_input_must_be_utf8_and_within_character_bound(self):
        with self.assertRaises(Diagnostic) as invalid_utf8:
            verify(b"\xff")
        self.assertEqual(invalid_utf8.exception.reason, "invalid_input")
        with self.assertRaises(Diagnostic) as oversized:
            verify(" " * 65536)
        self.assertEqual(oversized.exception.reason, "invalid_input")


class WriteReceiptTests(unittest.TestCase):
    def test_writes_atomic_external_file_with_private_mode(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "repo"
            root.mkdir()
            outside = Path(tmp) / "cache" / "receipt.json"
            result = write_receipt(receipt(), outside, root)
            self.assertEqual(result, outside.resolve())
            self.assertEqual(outside.read_bytes(), canonical_bytes(receipt()) + b"\n")
            self.assertEqual(os.stat(outside).st_mode & 0o777, 0o600)

    def test_rejects_path_inside_repository(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "repo"
            root.mkdir()
            with self.assertRaises(Diagnostic) as caught:
                write_receipt(receipt(), root / "receipt.json", root)
            self.assertEqual((caught.exception.classification, caught.exception.reason), ("Rejected", "invalid_input"))

    def test_rejects_existing_destination_without_overwriting(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "repo"
            root.mkdir()
            outside = Path(tmp) / "receipt.json"
            outside.write_text("existing", encoding="utf-8")
            with self.assertRaises(Diagnostic) as caught:
                write_receipt(receipt(), outside, root)
            self.assertEqual((caught.exception.classification, caught.exception.reason), ("Rejected", "invalid_input"))
            self.assertEqual(outside.read_text(encoding="utf-8"), "existing")

    def test_rejects_new_path_through_external_symlink_into_repository(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "repo"
            inside = root / "receipts"
            inside.mkdir(parents=True)
            alias = Path(tmp) / "external-alias"
            alias.symlink_to(inside, target_is_directory=True)
            with self.assertRaises(Diagnostic) as caught:
                write_receipt(receipt(), alias / "new.json", root)
            self.assertEqual((caught.exception.classification, caught.exception.reason), ("Rejected", "invalid_input"))

    def test_private_artifact_content_address_reuses_exact_bytes_only(self):
        with tempfile.TemporaryDirectory() as tmp:
            cache = Path(tmp) / "cache"
            cache.mkdir(mode=0o700)
            repo = Path(tmp) / "repo"
            repo.mkdir()
            value = {"artifact_kind": "fixture", "ids": ["a", "b"]}
            with patch.dict(os.environ, {"XDG_CACHE_HOME": str(cache)}):
                path, digest, size = write_private_artifact(value, repo)
                same_path, same_digest, same_size = write_private_artifact(value, repo)
            self.assertEqual((same_path, same_digest, same_size), (path, digest, size))
            self.assertEqual(path.read_bytes(), canonical_bytes(value) + b"\n")
            self.assertEqual(os.stat(path).st_mode & 0o777, 0o600)

    def test_private_artifact_raced_destination_rechecks_no_follow_private_file(self):
        import hashlib
        with tempfile.TemporaryDirectory() as tmp:
            cache = Path(tmp) / "cache"
            cache.mkdir(mode=0o700)
            repo = Path(tmp) / "repo"
            repo.mkdir()
            outside = Path(tmp) / "outside"
            outside.write_bytes(b"not an artifact")
            value = {"artifact_kind": "race"}
            payload = canonical_bytes(value) + b"\n"
            destination = cache / "helix/local-ci/artifacts" / (hashlib.sha256(payload).hexdigest() + ".json")
            destination.parent.mkdir(parents=True, mode=0o700)

            def race_link(_source, target, **_kwargs):
                Path(target).symlink_to(outside)
                raise FileExistsError("simulated concurrent destination")

            with patch.dict(os.environ, {"XDG_CACHE_HOME": str(cache)}), \
                    patch("receipt.os.link", side_effect=race_link):
                with self.assertRaises(Diagnostic) as caught:
                    write_private_artifact(value, repo)
            self.assertEqual((caught.exception.classification, caught.exception.reason),
                             ("Rejected", "invalid_input"))

    def test_unset_xdg_uses_deterministic_uid_private_root(self):
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp) / "repo"
            repo.mkdir()
            cache_tmp = Path(tmp) / "system-tmp"
            cache_tmp.mkdir(mode=0o700)
            expected_root = cache_tmp / f"helix-local-ci-artifacts-{os.getuid()}"
            with patch.dict(os.environ, {}, clear=True), patch("receipt.tempfile.gettempdir", return_value=str(cache_tmp)):
                first = write_private_artifact({"artifact_kind": "deterministic"}, repo)
                second = write_private_artifact({"artifact_kind": "deterministic"}, repo)
            self.assertEqual(first, second)
            self.assertEqual(first[0].parent, expected_root)
            self.assertEqual(os.stat(expected_root).st_mode & 0o777, 0o700)

    def test_private_artifact_rejects_insecure_root_and_repository_aliases(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            repo = root / "repo"
            repo.mkdir()
            value = {"artifact_kind": "negative"}

            insecure = root / "insecure"
            (insecure / "helix" / "local-ci").mkdir(parents=True)
            (insecure / "helix" / "local-ci" / "artifacts").mkdir(mode=0o755)
            with patch.dict(os.environ, {"XDG_CACHE_HOME": str(insecure)}), self.assertRaises(Diagnostic) as bad_mode:
                write_private_artifact(value, repo)
            self.assertEqual((bad_mode.exception.classification, bad_mode.exception.reason),
                             ("Rejected", "invalid_input"))

            symlink_base = root / "cache-link"
            real_cache = root / "real-cache"
            real_cache.mkdir(mode=0o700)
            symlink_base.symlink_to(real_cache, target_is_directory=True)
            with patch.dict(os.environ, {"XDG_CACHE_HOME": str(symlink_base)}), self.assertRaises(Diagnostic) as symlink:
                write_private_artifact(value, repo)
            self.assertEqual((symlink.exception.classification, symlink.exception.reason),
                             ("Rejected", "invalid_input"))

            with patch.dict(os.environ, {"XDG_CACHE_HOME": str(repo)}), self.assertRaises(Diagnostic) as inside_repo:
                write_private_artifact(value, repo)
            self.assertEqual((inside_repo.exception.classification, inside_repo.exception.reason),
                             ("Rejected", "invalid_input"))
            self.assertFalse((repo / "helix").exists(), "repository-contained rejection must precede directory creation")

    def test_private_artifact_rejects_conflicting_bytes_and_link_failure(self):
        with tempfile.TemporaryDirectory() as tmp:
            cache = Path(tmp) / "cache"
            cache.mkdir(mode=0o700)
            repo = Path(tmp) / "repo"
            repo.mkdir()
            value = {"artifact_kind": "conflict"}
            payload = canonical_bytes(value) + b"\n"
            import hashlib
            digest = hashlib.sha256(payload).hexdigest()
            destination = cache / "helix/local-ci/artifacts" / (digest + ".json")
            destination.parent.mkdir(parents=True, mode=0o700)
            destination.write_bytes(b"different bytes")
            destination.chmod(0o600)
            with patch.dict(os.environ, {"XDG_CACHE_HOME": str(cache)}), self.assertRaises(Diagnostic) as conflict:
                write_private_artifact(value, repo)
            self.assertEqual((conflict.exception.classification, conflict.exception.reason),
                             ("Unknown", "conflict"))

            destination.unlink()
            with patch.dict(os.environ, {"XDG_CACHE_HOME": str(cache)}), \
                    patch("receipt.os.link", side_effect=OSError("synthetic link failure")), \
                    self.assertRaises(Diagnostic) as link_failure:
                write_private_artifact(value, repo)
            self.assertEqual((link_failure.exception.classification, link_failure.exception.reason),
                             ("Unknown", "unreadable"))


if __name__ == "__main__":
    unittest.main()
