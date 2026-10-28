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


if __name__ == "__main__":
    unittest.main()
