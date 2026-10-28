#!/usr/bin/env python3
"""Unit tests for scaffold/tools/pre_review_check.py (pass/fail per check + #3829 R1 reproduction)."""

from __future__ import annotations

import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

TOOLS_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(TOOLS_DIR))

from pre_review_check import (  # noqa: E402
    check_commit_sha_and_red_green,
    check_doc_ids_exist,
    check_json_pointers_resolve,
    check_no_closing_keyword_3510,
    check_no_removed_materials_keys,
    check_tests_and_fixtures_unchanged_after_red,
    check_tooling_summary,
    run_all_checks,
)


class TestPreReviewCheck(unittest.TestCase):
    """Test each of the 7 pre-review checks with passing and failing examples."""

    def test_1_commit_sha_and_red_green_pass_and_fail(self) -> None:
        commits = [
            {
                "sha": "6aea6198f320d11223344556677889900aabbccd",
                "subject": "test(h009): add Red tests for compare_applicability (Refs #3510)",
                "files": ["tests/test_app.py"],
            },
            {
                "sha": "04d6f85ee5a2416f1de7fd35d91ceaa974434b34",
                "subject": "feat(h009): implement compare_applicability (Refs #3510)",
                "files": ["src/app.py"],
            },
        ]
        good_body = (
            "- Red commit: `6aea6198f320d11223344556677889900aabbccd`\n"
            "- Green commit: `04d6f85ee5a2416f1de7fd35d91ceaa974434b34`\n"
        )
        res_pass = check_commit_sha_and_red_green(good_body, commits)
        self.assertTrue(res_pass["passed"])
        self.assertEqual(res_pass["status"], "pass")

        # Fail case: wrong 40-char SHA (#3829 R1 error) and reversed Red/Green
        bad_body = (
            "- Red commit: `04d6f85ee5a2416f1de7fd35d91ceaa974434b34`\n"
            "- Green commit: `04d6f85ee5ef3885094270be088078671de552c8`\n"
        )
        res_fail = check_commit_sha_and_red_green(bad_body, commits)
        self.assertFalse(res_fail["passed"])
        self.assertIn(
            "04d6f85ee5ef3885094270be088078671de552c8",
            res_fail["missing_shas"],
        )

    def test_2_json_pointers_resolve_pass_and_fail(self) -> None:
        docs = {
            "docs/l5.json": {
                "functions": [{}, {}, {}, {"id": "fn3"}],
                "failure_rules": [{"id": f"r{i}"} for i in range(110)],
                "source_result_reference_projection": {
                    "producer_row_materialization": {
                        "row_members": ["a", "b"],
                        "collection_presence_rule": "present",
                    }
                },
            },
            "docs/l8.json": {
                "normal_function_oracles": [
                    {},
                    {},
                    {},
                    {"id": "HARNESS-L8-009-NORMAL-compare_applicability"},
                ]
            },
        }
        pmap = {"L5": "docs/l5.json", "L8": "docs/l8.json"}
        good_body = (
            " Uses `L5#/functions/3`, `L5#/failure_rules/60..67`, "
            "`L5#/source_result_reference_projection/producer_row_materialization/row_members`, "
            "and `L8#/normal_function_oracles/3`."
        )
        res_pass = check_json_pointers_resolve(
            good_body, pmap, json_loader=lambda p: docs[p]
        )
        self.assertTrue(res_pass["passed"])
        self.assertEqual(res_pass["resolved_count"], 4)

        # Fail case: #3829 R1 & R3 unresolved pointers
        bad_body = (
            "Bad pointers `L5#/failure_taxonomy/rules/22..29`, "
            "`L5#/source_result_reference_projection/producer_condition_presence_invariants/rules/1`, "
            "and `L5#/source_result_reference_projection/producer_row_materialization/table/1`."
        )
        res_fail = check_json_pointers_resolve(
            bad_body, pmap, json_loader=lambda p: docs[p]
        )
        self.assertFalse(res_fail["passed"])
        self.assertEqual(len(res_fail["unresolved_pointers"]), 3)

    def test_3_doc_ids_exist_pass_and_fail(self) -> None:
        known = {
            "HARNESS-L3-009-F03",
            "HARNESS-L5-009-F03",
            "HARNESS-L8-009-NORMAL-compare_applicability",
        }
        good_body = "Verified `HARNESS-L3-009-F03` and `HARNESS-L8-009-NORMAL-compare_applicability`."
        res_pass = check_doc_ids_exist(good_body, id_exists_fn=lambda i: i in known)
        self.assertTrue(res_pass["passed"])

        # Fail case: #3829 R1 nonexistent IDs
        bad_body = (
            "Mutated `HARNESS-E-TEMPLATE-APPLICABILITY-001` and "
            "checked `HARNESS-L8-009-NORM-04`."
        )
        res_fail = check_doc_ids_exist(bad_body, id_exists_fn=lambda i: i in known)
        self.assertFalse(res_fail["passed"])
        self.assertEqual(
            res_fail["missing_ids"],
            [
                "HARNESS-E-TEMPLATE-APPLICABILITY-001",
                "HARNESS-L8-009-NORM-04",
            ],
        )

    def test_4_no_closing_keyword_3510_pass_and_fail(self) -> None:
        res_pass = check_no_closing_keyword_3510("Refs #3510\nRelated to #3510")
        self.assertTrue(res_pass["passed"])

        for kw in ("Closes #3510", "fixes #3510", "Resolves: #3510"):
            res_fail = check_no_closing_keyword_3510(f"Summary\n{kw}")
            self.assertFalse(res_fail["passed"])
            self.assertTrue(res_fail["forbidden_matches"])

    def test_5_tests_and_fixtures_unchanged_after_red_pass_and_fail(self) -> None:
        good_commits = [
            {
                "sha": "aaaa111",
                "subject": "test(h009): add Red tests",
                "files": [
                    "helix/unit/tests/test_fn.py",
                    "helix/unit/tests/fixtures/application_input.json",
                ],
            },
            {
                "sha": "bbbb222",
                "subject": "feat(h009): implement Green",
                "files": ["helix/unit/src/fn.py"],
            },
        ]
        res_pass = check_tests_and_fixtures_unchanged_after_red(good_commits)
        self.assertTrue(res_pass["passed"])

        bad_commits = [
            *good_commits,
            {
                "sha": "cccc333",
                "subject": "feat(h009): tweak fixture during Green",
                "files": [
                    "helix/unit/src/fn.py",
                    "helix/unit/tests/fixtures/application_input.json",
                ],
            },
        ]
        res_fail = check_tests_and_fixtures_unchanged_after_red(bad_commits)
        self.assertFalse(res_fail["passed"])
        self.assertEqual(len(res_fail["violations"]), 1)
        self.assertEqual(res_fail["violations"][0]["sha"], "cccc333")

    def test_6_no_removed_materials_keys_pass_and_fail(self) -> None:
        l8_doc = {
            "removed_materials": [
                {"key": "expected_output"},
                {"key": "input_preparation"},
                {"key": "expected_material_type"},
            ]
        }
        with tempfile.TemporaryDirectory() as tmp:
            unit_dir = Path(tmp)
            fixtures_dir = unit_dir / "tests" / "fixtures"
            fixtures_dir.mkdir(parents=True)
            f_json = fixtures_dir / "application_input.json"
            f_py = unit_dir / "tests" / "test_sample.py"

            f_json.write_text(
                json.dumps({"normal_input": {"claims": []}}), encoding="utf-8"
            )
            f_py.write_text(
                "assert result['producer_symbol'] == 'fn'\n", encoding="utf-8"
            )

            res_pass = check_no_removed_materials_keys(unit_dir, l8_doc=l8_doc)
            self.assertTrue(res_pass["passed"])

            # Inject forbidden removed_materials key into fixture JSON
            f_json.write_text(
                json.dumps({"expected_output": {"findings": []}}),
                encoding="utf-8",
            )
            res_fail = check_no_removed_materials_keys(unit_dir, l8_doc=l8_doc)
            self.assertFalse(res_fail["passed"])
            self.assertEqual(
                res_fail["violations"][0]["forbidden_keys"],
                ["expected_output"],
            )

    def test_7_tooling_summary_pass_and_fail(self) -> None:
        def ok_runner(cmd: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
            out = "stale=0\nbindings=158 fail=0\nOK"
            return subprocess.CompletedProcess(cmd, 0, stdout=out, stderr="")

        res_pass = check_tooling_summary(runner=ok_runner)
        self.assertTrue(res_pass["passed"])

        def fail_runner(cmd: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
            if "unittest" in cmd:
                return subprocess.CompletedProcess(
                    cmd, 1, stdout="", stderr="FAILED (failures=2)"
                )
            return subprocess.CompletedProcess(
                cmd, 0, stdout="stale=0\nbindings=158 fail=0", stderr=""
            )

        res_fail = check_tooling_summary(runner=fail_runner)
        self.assertFalse(res_fail["passed"])
        self.assertFalse(res_fail["results"]["unittest"]["passed"])

    def test_reproduce_pr_3829_r1_body_discrepancies(self) -> None:
        """Reproduce PR #3829 R1 body errors and verify run_all_checks catches them."""
        pr_3829_r1_body = """
## Summary
Refs #3510
- Red commit: `6aea6198f320d11223344556677889900aabbccd`
- Green commit: `04d6f85ee5ef3885094270be088078671de552c8`
- Pointers: `L5#/failure_taxonomy/rules/22..29`, `L5#/source_result_reference_projection/producer_row_materialization/table/1`
- Oracle ID: `HARNESS-L8-009-NORM-04`
- Mutation M02: `"HARNESS-E-TEMPLATE-APPLICABILITY-001"` -> `"HARNESS-E-TEMPLATE-APPLICABILITY-002"`
"""
        commits = [
            {
                "sha": "6aea6198f320d11223344556677889900aabbccd",
                "subject": "test(h009): add Red tests for fn3 compare_applicability (Refs #3510)",
                "files": ["tests/test_compare_applicability.py"],
            },
            {
                "sha": "04d6f85ee5a2416f1de7fd35d91ceaa974434b34",
                "subject": "feat(h009): implement fn3 compare_applicability (Refs #3510)",
                "files": ["src/application_applicability.py"],
            },
        ]
        docs = {
            "docs/l5.json": {
                "failure_rules": [{"id": f"r{i}"} for i in range(110)],
                "source_result_reference_projection": {
                    "producer_row_materialization": {"row_members": []}
                },
            }
        }
        report = run_all_checks(
            pr_body=pr_3829_r1_body,
            base_sha="1899c1708908d025b5740ba5f0546a543d697b32",
            head_sha="04d6f85ee5a2416f1de7fd35d91ceaa974434b34",
            pointer_map={"L5": "docs/l5.json"},
            commits=commits,
            commit_exists_fn=lambda s: False,
            json_loader=lambda p: docs[p],
            id_exists_fn=lambda i: False,
            tooling_runner=lambda cmd, cwd: subprocess.CompletedProcess(
                cmd, 0, stdout="stale=0\nfail=0", stderr=""
            ),
        )
        self.assertEqual(report["authority_effect"], "none")
        self.assertEqual(report["overall_status"], "fail")
        c1 = report["checks"]["1_commit_sha_and_red_green"]
        c2 = report["checks"]["2_json_pointers_resolve"]
        c3 = report["checks"]["3_doc_ids_exist"]
        self.assertFalse(c1["passed"])
        self.assertIn("04d6f85ee5ef3885094270be088078671de552c8", c1["missing_shas"])
        self.assertFalse(c2["passed"])
        self.assertEqual(len(c2["unresolved_pointers"]), 2)
        self.assertFalse(c3["passed"])
        self.assertIn("HARNESS-E-TEMPLATE-APPLICABILITY-001", c3["missing_ids"])
        self.assertIn("HARNESS-L8-009-NORM-04", c3["missing_ids"])

    def test_pr_3833_body_and_full_path_json_pointers_and_l7_alias(self) -> None:
        """Verify full-path docs/...json#/... pointers, L6/L7 real directory names, and #3833 body pass."""
        unit_path = Path(
            "helix/helix-harness/units/HELIXHARNESS-UNIT-PRODUCT-TEMPLATE-APPLICATION"
        )
        pr_3833_body = (
            "## Summary\n"
            "Refs #3510\n"
            "- Red commit (`096236d9a305c659094fea4fe08ec45b9cbe0248`)\n"
            "- Green commit (`ae62c56abf2e4872bff65aad1d0c4cfc7c7a259b`)\n"
            "- R2 Red commit (`4d0715da52b9fa2e108fc78f58dfd08d39080de2`)\n"
            "- R2 Green commit (`98ec841cc6f5519e19d3db41dd77289a12e359de`)\n"
            "- L3/L10: `docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/26`, "
            "`docs/helix-harness/L10-verification/functional-verification.json#/cases/26`\n"
            "- L4/L9: `docs/helix-harness/L4-basic-design/product-template-application.json#/contracts/5`, "
            "`docs/helix-harness/L9-integration-verification/product-template-application.json#/cases/5`, "
            "`L9#/cases/5/negative_cases/0..6`\n"
            "- L5/L8: `docs/helix-harness/L5-detail-design/product-template-application.json#/contracts/5`, "
            "`L5#/functions/4`, `L5#/failure_rules/68..74`, `L5#/type_contract/types/Claim`, "
            "`docs/helix-harness/L8-unit-verification/product-template-application.json#/cases/5`, "
            "`L8#/cases/5/negative_cases/0..6`, `L8#/normal_function_oracles/4`, `L8#/additional_unit_cases/13`\n"
            "- L6/L7: `L6#/document_id`, `L7#/reconstruction`, "
            "`docs/helix-harness/L7-function-verification/product-template-application.json#/reconstruction`\n"
        )
        commits = [
            {
                "sha": "096236d9a305c659094fea4fe08ec45b9cbe0248",
                "subject": "test(h009): add Red unit tests for fn4 compare_kind_obligation_trace (Refs #3510)",
                "files": [
                    "helix/helix-harness/units/HELIXHARNESS-UNIT-PRODUCT-TEMPLATE-APPLICATION/tests/test_compare_kind_obligation_trace.py"
                ],
            },
            {
                "sha": "ae62c56abf2e4872bff65aad1d0c4cfc7c7a259b",
                "subject": "feat(h009): implement fn4 compare_kind_obligation_trace (Refs #3510)",
                "files": [
                    "helix/helix-harness/units/HELIXHARNESS-UNIT-PRODUCT-TEMPLATE-APPLICATION/src/application_kind_obligation_trace.py"
                ],
            },
            {
                "sha": "4d0715da52b9fa2e108fc78f58dfd08d39080de2",
                "subject": "test(h009): add Red tests for structural design endpoint and completion claim (Refs #3510)",
                "files": [
                    "helix/helix-harness/units/HELIXHARNESS-UNIT-PRODUCT-TEMPLATE-APPLICATION/tests/test_compare_kind_obligation_trace.py"
                ],
            },
            {
                "sha": "98ec841cc6f5519e19d3db41dd77289a12e359de",
                "subject": "fix(h009): resolve design endpoint and completion claim structurally (Refs #3510)",
                "files": [
                    "helix/helix-harness/units/HELIXHARNESS-UNIT-PRODUCT-TEMPLATE-APPLICATION/src/application_kind_obligation_trace.py"
                ],
            },
            {
                "sha": "f1472cab1a7be560ca6a802c9077bc4ffcb9906e",
                "subject": "test(h009): compact recipes[15]/[16] fixture overrides to base ref + diff (Refs #3510)",
                "files": [
                    "helix/helix-harness/units/HELIXHARNESS-UNIT-PRODUCT-TEMPLATE-APPLICATION/tests/fixtures/application_input.json"
                ],
            },
            {
                "sha": "4856a2682e89102c9c178b0bb640df319cdc92be",
                "subject": "test(h009): preserve recipe rebuild order in _resolve_recipe_raw (Refs #3510)",
                "files": [
                    "helix/helix-harness/units/HELIXHARNESS-UNIT-PRODUCT-TEMPLATE-APPLICATION/tests/test_compare_kind_obligation_trace.py"
                ],
            },
        ]
        report = run_all_checks(
            pr_body=pr_3833_body,
            base_sha="97bfea3462bf53ab96994d9135336ba265424570",
            head_sha="4856a2682e89102c9c178b0bb640df319cdc92be",
            unit_path=unit_path,
            commits=commits,
            commit_exists_fn=lambda s: True,
            tooling_runner=lambda cmd, cwd: subprocess.CompletedProcess(
                cmd, 0, stdout="stale=0\nfail=0", stderr=""
            ),
        )
        self.assertEqual(
            report["overall_status"],
            "pass",
            json.dumps(report["checks"], ensure_ascii=False, indent=2),
        )
        self.assertEqual(
            report["checks"]["2_json_pointers_resolve"]["resolved_count"], 16
        )

    def test_5_feat_with_required_substring_fails_when_touching_fixtures(self) -> None:
        """Verify 'feat: add required axes check' is NOT treated as a Red commit despite containing 'red'."""
        commits = [
            {
                "sha": "aaaa111",
                "subject": "test(h009): add Red tests",
                "files": ["helix/unit/tests/test_fn.py"],
            },
            {
                "sha": "bbbb222",
                "subject": "feat: add required axes check",
                "files": [
                    "helix/unit/src/fn.py",
                    "helix/unit/tests/fixtures/application_input.json",
                ],
            },
        ]
        res = check_tests_and_fixtures_unchanged_after_red(commits)
        self.assertFalse(res["passed"])
        self.assertEqual(len(res["violations"]), 1)
        self.assertEqual(res["violations"][0]["sha"], "bbbb222")


if __name__ == "__main__":
    unittest.main()
