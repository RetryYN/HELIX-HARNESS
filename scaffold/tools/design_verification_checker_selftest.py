#!/usr/bin/env python3
"""Unit tests (PASS and mutation FAIL) for scaffold/tools/design_verification_checker.py."""

from __future__ import annotations

import copy
import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import design_verification_checker as dvc  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parents[2]


class DesignVerificationCheckerSelfTest(unittest.TestCase):
    def test_derivation_map_and_legacy_basis_recorded(self) -> None:
        for check_id in (
            "CHK-PIN-SHA256",
            "CHK-JSON-POINTER",
            "CHK-PAIR-BIDIR-ID",
            "CHK-NEG-4WAY-MATCH",
            "CHK-PUBLIC-FN-FREEZE",
            "CHK-L3-OBLIGATION-MAP",
            "CHK-OWNERSHIP-CAP-L8L9",
            "CHK-OWNERSHIP-CAP-L3L6",
            "TICKET-CI-PROFILE-DEFERRAL",
        ):
            self.assertIn(check_id, dvc.DERIVATION_MAP)
            entry = dvc.DERIVATION_MAP[check_id]
            self.assertTrue(len(entry["l3_pointers"]) >= 1)
            self.assertTrue(len(entry["l10_pointers"]) >= 1)
            self.assertTrue(len(entry["decision_records"]) >= 1)
        self.assertEqual(len(dvc.LEGACY_BASIS), 5)

    def test_chk_pin_sha256_pass_and_mutation_fail(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            target = root / "docs" / "sample.json"
            target.parent.mkdir(parents=True)
            obj = {"b": 1, "a": [2, 3]}
            raw = (json.dumps(obj, indent=2) + "\n").encode("utf-8")
            target.write_bytes(raw)
            raw_sha = hashlib.sha256(raw).hexdigest()
            canon_sha = dvc._canonical_json_sha256(obj)

            rec = {
                "path_aliases": {"S": "docs/sample.json"},
                "pins": {"S_sha256": raw_sha},
                "source_pins": {
                    "S": {
                        "path": "docs/sample.json",
                        "sha256": raw_sha,
                        "canonical_json_sha256": canon_sha,
                    }
                },
            }
            res_pass = dvc.check_pin_sha256(root, "freeze.json", rec)
            self.assertTrue(res_pass["passed"])
            self.assertEqual(res_pass["checked_count"], 3)
            self.assertEqual(res_pass["failures"], [])

            # Mutation 1: corrupt raw SHA-256
            mut1 = copy.deepcopy(rec)
            mut1["pins"]["S_sha256"] = "0" * 64
            res_fail1 = dvc.check_pin_sha256(root, "freeze.json", mut1)
            self.assertFalse(res_fail1["passed"])
            self.assertEqual(len(res_fail1["failures"]), 1)
            self.assertEqual(res_fail1["failures"][0]["check"], "CHK-PIN-SHA256")
            self.assertEqual(res_fail1["failures"][0]["pointer"], "/pins/S_sha256")
            self.assertEqual(res_fail1["failures"][0]["actual_sha256"], raw_sha)

            # Mutation 2: corrupt canonical_json_sha256
            mut2 = copy.deepcopy(rec)
            mut2["source_pins"]["S"]["canonical_json_sha256"] = "f" * 64
            res_fail2 = dvc.check_pin_sha256(root, "freeze.json", mut2)
            self.assertFalse(res_fail2["passed"])
            self.assertEqual(
                res_fail2["failures"][0]["pointer"],
                "/source_pins/S/canonical_json_sha256",
            )

    def test_chk_json_pointer_pass_and_mutation_fail(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            tfile = root / "docs" / "target.json"
            tfile.parent.mkdir(parents=True)
            tfile.write_text(
                json.dumps(
                    {
                        "items": [{"id": "A"}, {"id": "B"}, {"id": "C"}],
                        "nested": {"key": "val"},
                    }
                ),
                encoding="utf-8",
            )
            doc = {
                "path_aliases": {"T": "docs/target.json"},
                "local_Section": {"x": 42},
                "refs": [
                    "#/local_Section/x",
                    "T#/items/0..2/id",
                    "T#/items/*/id",
                    {"path": "T", "pointer": "/nested/key"},
                ],
            }
            res_pass = dvc.check_json_pointer(
                root, "docs/source.json", doc, removed_paths={"docs/removed.json"}
            )
            self.assertTrue(res_pass["passed"])
            self.assertEqual(res_pass["checked_count"], 4)
            self.assertEqual(res_pass["expanded_target_count"], 6)

            # Mutation 1: out-of-range index in 0..N
            mut1 = copy.deepcopy(doc)
            mut1["refs"][1] = "T#/items/0..3/id"
            res_fail1 = dvc.check_json_pointer(
                root, "docs/source.json", mut1, removed_paths={"docs/removed.json"}
            )
            self.assertFalse(res_fail1["passed"])
            self.assertEqual(res_fail1["failures"][0]["check"], "CHK-JSON-POINTER")
            self.assertEqual(res_fail1["failures"][0]["target_pointer"], "/items/3/id")
            self.assertEqual(
                res_fail1["failures"][0]["error"],
                "unresolved_pointer_or_unpinned_removed_file",
            )

            # Mutation 2: unpinned reference to removed sidecar file
            mut2 = copy.deepcopy(doc)
            mut2["refs"].append({"path": "docs/removed.json", "pointer": "/items/0"})
            res_fail2 = dvc.check_json_pointer(
                root, "docs/source.json", mut2, removed_paths={"docs/removed.json"}
            )
            self.assertFalse(res_fail2["passed"])
            self.assertTrue(
                any(
                    f["target_file"] == "docs/removed.json"
                    for f in res_fail2["failures"]
                )
            )

    def test_chk_pair_bidir_id_pass_and_mutation_fail(self) -> None:
        left = {
            "contracts": [
                {"id": "L5-C1", "oracle_ref": "L8-C1"},
                {"id": "L5-C2", "oracle_ref": "L8-C2"},
            ]
        }
        right = {
            "cases": [
                {
                    "id": "L8-C1",
                    "design_ref": "L5-C1",
                    "negative_case_count": 2,
                    "negative_cases": [{"id": "N1"}, {"id": "N2"}],
                },
                {
                    "id": "L8-C2",
                    "design_ref": "L5-C2",
                    "negative_case_count": 1,
                    "negative_cases": [{"id": "N3"}],
                },
            ],
            "completion": {"unit_case_count": 2, "negative_case_count": 3},
        }
        res_pass = dvc.check_pair_bidir_id(
            REPO_ROOT, "L5.json", "L8.json", left_data=left, right_data=right
        )
        self.assertTrue(res_pass["passed"])

        # Mutation 1: break reverse link
        mut_r1 = copy.deepcopy(right)
        mut_r1["cases"][1]["design_ref"] = "L5-WRONG"
        res_fail1 = dvc.check_pair_bidir_id(
            REPO_ROOT, "L5.json", "L8.json", left_data=left, right_data=mut_r1
        )
        self.assertFalse(res_fail1["passed"])
        self.assertEqual(res_fail1["failures"][0]["error"], "missing_reverse_link")

        # Mutation 2: duplicate ID
        mut_l2 = copy.deepcopy(left)
        mut_l2["contracts"][1]["id"] = "L5-C1"
        res_fail2 = dvc.check_pair_bidir_id(
            REPO_ROOT, "L5.json", "L8.json", left_data=mut_l2, right_data=right
        )
        self.assertFalse(res_fail2["passed"])
        self.assertTrue(
            any(f["error"] == "duplicate_id" for f in res_fail2["failures"])
        )

        # Mutation 3: /completion/negative_case_count mismatch (#3759 R1-i2)
        mut_r3 = copy.deepcopy(right)
        mut_r3["completion"]["negative_case_count"] = 99
        res_fail3 = dvc.check_pair_bidir_id(
            REPO_ROOT, "L5.json", "L8.json", left_data=left, right_data=mut_r3
        )
        self.assertFalse(res_fail3["passed"])
        self.assertTrue(
            any(
                f["pointer"] == "/completion/negative_case_count"
                and f["error"] == "count_mismatch"
                for f in res_fail3["failures"]
            )
        )

    def test_chk_ownership_cap_l8l9_and_l3l6_pass_and_mutation_fail(self) -> None:
        clean_l8 = {
            "source_pins": {"L5": {"path": "docs/L5.json", "sha256": "a" * 64}},
            "cases": [
                {
                    "id": "U1",
                    "counterexample": "invalid input",
                    "expected": "rejected",
                }
            ],
        }
        res_l8_pass = dvc.check_ownership_cap(
            REPO_ROOT, "docs/helix-os/L8-unit-verification/x.json", clean_l8
        )
        self.assertTrue(res_l8_pass["passed"])
        self.assertEqual(res_l8_pass["check"], "CHK-OWNERSHIP-CAP-L8L9")

        # Mutation 1: add forbidden key `fixture_patch` and unpinned `expected_output_sha256` to L8
        dirty_l8 = copy.deepcopy(clean_l8)
        dirty_l8["cases"][0]["fixture_patch"] = [{"op": "replace"}]
        dirty_l8["cases"][0]["expected_output_sha256"] = "b" * 64
        res_l8_fail = dvc.check_ownership_cap(
            REPO_ROOT, "docs/helix-os/L8-unit-verification/x.json", dirty_l8
        )
        self.assertFalse(res_l8_fail["passed"])
        keys_caught = {f["key"] for f in res_l8_fail["failures"]}
        self.assertIn("fixture_patch", keys_caught)
        self.assertIn("expected_output_sha256", keys_caught)

        # Mutation 2: L5 with forbidden `full_return` / `rfc6902_copy_ops`
        clean_l5 = {
            "type_contract": {
                "types": {"Envelope": {"fields": {"source_sha256": "string"}}}
            },
            "functions": [{"id": "F1", "symbol": "fn1"}],
        }
        res_l5_pass = dvc.check_ownership_cap(
            REPO_ROOT, "docs/helix-os/L5-detail-design/x.json", clean_l5
        )
        self.assertTrue(res_l5_pass["passed"])
        self.assertEqual(res_l5_pass["check"], "CHK-OWNERSHIP-CAP-L3L6")

        dirty_l5 = copy.deepcopy(clean_l5)
        dirty_l5["functions"][0]["full_return"] = {"huge": "payload"}
        res_l5_fail = dvc.check_ownership_cap(
            REPO_ROOT, "docs/helix-os/L5-detail-design/x.json", dirty_l5
        )
        self.assertFalse(res_l5_fail["passed"])
        self.assertEqual(res_l5_fail["failures"][0]["key"], "full_return")

    def test_chk_neg_4way_match_pass_and_mutation_fail(self) -> None:
        l4 = {
            "contracts": [
                {
                    "id": "L4-01",
                    "negative_classifications": [
                        {
                            "code": "err_a",
                            "change": "bad input A",
                            "axis": "input",
                            "state": "conflict",
                            "expected": "reject A",
                            "expected_preserved": {"obs": "keep"},
                            "backflow_owner": "CORE",
                        }
                    ],
                }
            ]
        }
        l9 = {
            "cases": [
                {
                    "id": "L9-01",
                    "negative_cases": [
                        {
                            "id": "L9-01-N1",
                            "code": "err_a",
                            "change": "bad input A",
                            "axis": "input",
                            "state": "conflict",
                            "expected": "reject A",
                            "expected_preserved": {"obs": "keep"},
                            "backflow_owner": "CORE",
                            "expected_side_effect_count": 0,
                        }
                    ],
                }
            ]
        }
        l8 = {
            "cases": [
                {
                    "id": "L8-01",
                    "negative_cases": [
                        {
                            "id": "L8-01-N1",
                            "rule_ref": "L5-R-err_a",
                            "function_ref": "L5-fn1",
                            "code": "err_a",
                            "change": "bad input A",
                            "axis": "input",
                            "state": "conflict",
                            "expected": "reject A",
                            "expected_preserved": {"obs": "keep"},
                            "backflow_owner": "CORE",
                            "expected_side_effect_count": 0,
                        }
                    ],
                }
            ]
        }
        l5 = {
            "contracts": [{"id": "L5-01"}],
            "failure_rules": [
                {
                    "id": "L5-R-err_a",
                    "contract_ref": "L5-01",
                    "function_ref": "L5-fn1",
                    "code": "err_a",
                    "condition": "bad input A",
                    "expected_axis": "input",
                    "expected_state": "conflict",
                    "expected": "reject A",
                    "expected_preserved": {"obs": "keep"},
                    "backflow_owner": "CORE",
                    "side_effect_count": 0,
                }
            ],
        }
        res_pass = dvc.check_neg_4way_match(
            REPO_ROOT, "L4", "L9", "L8", "L5", l4, l9, l8, l5
        )
        self.assertTrue(res_pass["passed"])
        self.assertEqual(res_pass["matched_case_count"], 1)

        # Mutation 1: change backflow_owner on L8
        mut_l8 = copy.deepcopy(l8)
        mut_l8["cases"][0]["negative_cases"][0]["backflow_owner"] = "WRONG_OWNER"
        res_fail1 = dvc.check_neg_4way_match(
            REPO_ROOT, "L4", "L9", "L8", "L5", l4, l9, mut_l8, l5
        )
        self.assertFalse(res_fail1["passed"])
        self.assertEqual(res_fail1["failures"][0]["attribute"], "backflow_owner")

        # Mutation 2: non-zero side_effect_count on L9
        mut_l9 = copy.deepcopy(l9)
        mut_l9["cases"][0]["negative_cases"][0]["expected_side_effect_count"] = 1
        res_fail2 = dvc.check_neg_4way_match(
            REPO_ROOT, "L4", "L9", "L8", "L5", l4, mut_l9, l8, l5
        )
        self.assertFalse(res_fail2["passed"])
        self.assertEqual(res_fail2["failures"][0]["attribute"], "side_effect_count")

    def test_chk_public_fn_freeze_pass_and_mutation_fail(self) -> None:
        l5 = {
            "functions": [
                {
                    "id": "L5-FN-0",
                    "symbol": "pub_fn",
                    "visibility": "public",
                    "input_type": "In",
                    "output_type": "Out",
                    "oracle_ref": "L8-NORM-0",
                    "unit_case_refs": ["L8-U-1"],
                },
                {
                    "id": "L5-FN-1",
                    "symbol": "_priv_fn",
                    "visibility": "private",
                    "oracle_ref": "L8-NORM-1",
                    "unit_case_refs": [],
                },
            ]
        }
        l8 = {
            "normal_function_oracles": [{"id": "L8-NORM-0"}],
            "additional_unit_cases": [{"id": "L8-U-1"}],
        }
        rec = {
            "function_freeze_rows": [
                {
                    "entry_kind": "public_function",
                    "symbol": "pub_fn",
                    "l5_function_pointer": "L5#/functions/0",
                }
            ],
            "private_detail_bindings": [
                {
                    "detail_pointer": "L5#/some_detail",
                    "symbol": "_helper",
                    "bound_public_functions": ["pub_fn"],
                }
            ],
        }
        res_pass = dvc.check_public_fn_freeze(rec, l5, l8)
        self.assertTrue(res_pass["passed"])
        self.assertEqual(len(res_pass["resolved_function_rows"]), 2)
        self.assertEqual(len(res_pass["human_judgment_pending"]), 2)

        # Mutation 1: freeze private function as public (#3763 R1-m1)
        mut1 = copy.deepcopy(rec)
        mut1["function_freeze_rows"][0]["l5_function_pointer"] = "L5#/functions/1"
        res_fail1 = dvc.check_public_fn_freeze(mut1, l5, l8)
        self.assertFalse(res_fail1["passed"])
        self.assertEqual(
            res_fail1["failures"][0]["error"],
            "private_or_non_function_frozen_as_public",
        )

        # Mutation 2: unresolved unit_case_ref in L8
        mut_l5 = copy.deepcopy(l5)
        mut_l5["functions"][0]["unit_case_refs"].append("L8-MISSING-999")
        res_fail2 = dvc.check_public_fn_freeze(rec, mut_l5, l8)
        self.assertFalse(res_fail2["passed"])
        self.assertEqual(res_fail2["failures"][0]["error"], "unresolved_unit_case_ref")

        # Mutation 3: private_detail_binding missing owner/caller disposition
        mut3 = copy.deepcopy(rec)
        mut3["private_detail_bindings"][0] = {
            "detail_pointer": "L5#/some_detail",
            "symbol": "_orphan_helper",
        }
        res_fail3 = dvc.check_public_fn_freeze(mut3, l5, l8)
        self.assertFalse(res_fail3["passed"])
        self.assertEqual(res_fail3["failures"][0]["error"], "missing_reentry_owner")

    def test_chk_l3_obligation_map_pass_and_mutation_fail(self) -> None:
        rec = {
            "l3_obligation_decomposition": [
                {
                    "obligation_id": "O1",
                    "l5_pointers": ["L5#/functions/0"],
                    "l8_pointers": ["L8#/cases/0"],
                }
            ],
            "verification": {"blocking_a_count": 0},
            "branch_coverage_check": {"unreferenced_branch_count": 0},
        }
        res_pass = dvc.check_l3_obligation_map(rec, {}, {})
        self.assertTrue(res_pass["passed"])
        self.assertEqual(res_pass["obligation_count"], 1)
        self.assertEqual(len(res_pass["human_judgment_pending"]), 1)

        # Mutation 1: empty l8_pointers
        mut1 = copy.deepcopy(rec)
        mut1["l3_obligation_decomposition"][0]["l8_pointers"] = []
        res_fail1 = dvc.check_l3_obligation_map(mut1, {}, {})
        self.assertFalse(res_fail1["passed"])
        self.assertEqual(res_fail1["failures"][0]["error"], "empty_l5_or_l8_pointers")

        # Mutation 2: non-zero blocking_a_count
        mut2 = copy.deepcopy(rec)
        mut2["verification"]["blocking_a_count"] = 2
        res_fail2 = dvc.check_l3_obligation_map(mut2, {}, {})
        self.assertFalse(res_fail2["passed"])
        self.assertEqual(res_fail2["failures"][0]["error"], "non_zero_blocking_a")

        # Mutation 3: unreferenced L9 branch
        mut3 = copy.deepcopy(rec)
        mut3["branch_coverage_check"]["unreferenced_branch_count"] = 1
        res_fail3 = dvc.check_l3_obligation_map(mut3, {}, {})
        self.assertFalse(res_fail3["passed"])
        self.assertEqual(res_fail3["failures"][0]["error"], "unreferenced_l9_branch")

    def test_existing_four_freeze_records_audit_and_generate(self) -> None:
        records = [
            "docs/governance/audits/tdd/os002-t2a-f04-projection-member-freeze-2026-10-28.json",
            "docs/governance/audits/tdd/h009-f02a-function-pair-freeze-2026-10-28.json",
            "docs/governance/audits/tdd/os002-t1c-f02-proposal-receiving-freeze-2026-10-28.json",
            "docs/governance/audits/tdd/os002-t2b-f04-original-correspondence-freeze-2026-10-28.json",
        ]
        for rpath in records:
            audit = dvc.audit_freeze_record(REPO_ROOT, rpath, use_creation_commit=True)
            self.assertTrue(
                audit["mechanical_match"],
                msg=f"Expected mechanical_match=True for {rpath}, got {audit['comparison_with_existing_record']}",
            )
            cmp_sec = audit["comparison_with_existing_record"]
            self.assertTrue(cmp_sec["pins_match"])
            self.assertTrue(cmp_sec["pointers_resolved_match"])
            self.assertTrue(cmp_sec["head_entity_counts_match"])
            self.assertTrue(cmp_sec["verification_fields_match"])

        # Also test generate_freeze_record on a minimal declaration skeleton
        h009_rec = json.loads(
            (
                REPO_ROOT
                / "docs/governance/audits/tdd/h009-f02a-function-pair-freeze-2026-10-28.json"
            ).read_text(encoding="utf-8")
        )
        skeleton = {
            "record_id": h009_rec["record_id"],
            "slice_id": h009_rec["slice_id"],
            "request_id": h009_rec["request_id"],
            "source_main": h009_rec["source_main"],
            "request_base_sha": h009_rec["source_main"],
            "path_aliases": h009_rec["path_aliases"],
            "independent_expectation_derivation": h009_rec[
                "independent_expectation_derivation"
            ],
            "function_freeze_rows": h009_rec["function_freeze_rows"],
            "head_entity_counts": {k: 0 for k in h009_rec["head_entity_counts"]},
        }
        rec_commit = dvc._file_last_commit(
            REPO_ROOT,
            "docs/governance/audits/tdd/h009-f02a-function-pair-freeze-2026-10-28.json",
        )
        generated = dvc.generate_freeze_record(
            REPO_ROOT,
            skeleton,
            base_rev=h009_rec["source_main"],
            head_rev=rec_commit,
        )
        self.assertEqual(generated["pins"], h009_rec["pins"])
        self.assertEqual(
            generated["head_entity_counts"], h009_rec["head_entity_counts"]
        )
        self.assertTrue(generated["pointer_resolution_summary"]["passed"])
        self.assertTrue(generated["negative_case_4way_verification"]["passed"])


if __name__ == "__main__":
    unittest.main()
