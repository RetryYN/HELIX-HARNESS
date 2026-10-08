"""Single-change receipt oracle tests derived from local-CI L7."""
from __future__ import annotations

import os
import sys
import tempfile
import unittest
from pathlib import Path

_LOCAL_CI = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_LOCAL_CI))

from common import CHECK_IDS, Diagnostic, canonical_bytes  # noqa: E402
from receipt import verify_receipt, write_receipt  # noqa: E402


_HEX = "a" * 40
_RAW_SHA = "b" * 64
_TYPED_DIGEST = "sha256:" + _RAW_SHA


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
    return {
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


def receipt() -> dict:
    current = target()
    commands = [command(check_id, index == 3) for index, check_id in enumerate(CHECK_IDS)]
    return {
        "schema_version": 1,
        "target": current,
        "contract_ref": ref(),
        "config_digest": _RAW_SHA,
        "design_manifest_digest": _RAW_SHA,
        "checker_refs": [ref("scfctl"), ref("govcheck"), ref("gen_rulebook")],
        "runtime_identity": {"name": "CPython", "version": "3.11"},
        "plan": {
            "target": current,
            "contract_id": "OS-LOCAL-CI-001",
            "contract_version": "1",
            "selected_check_ids": list(CHECK_IDS),
            "selection_basis": "fixed_local_ci_contract",
            "config_digest": _RAW_SHA,
            "design_manifest_digest": _RAW_SHA,
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
        structure_complete=complete,
    )


class VerifyReceiptTests(unittest.TestCase):
    def test_ut_lci_30_canonical_baseline_is_verified(self):
        body = receipt()
        result = verify_receipt(
            canonical_bytes(body), body["target"], config_digest=_RAW_SHA,
            design_manifest_digest=_RAW_SHA, checker_refs=body["checker_refs"],
            contract_ref=body["contract_ref"], structure_complete=True,
        )
        self.assertEqual(result["status"], "verified")
        self.assertEqual(result["aggregate_state"], "success")

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


if __name__ == "__main__":
    unittest.main()
