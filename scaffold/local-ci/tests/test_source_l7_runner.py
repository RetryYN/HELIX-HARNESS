from __future__ import annotations

import ast
import base64
import io
import shutil
import sys
import tempfile
import unittest
from types import SimpleNamespace
from pathlib import Path
from unittest.mock import patch

_LOCAL_CI = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_LOCAL_CI))

import source_l7_runner as suite_runner  # noqa: E402
import runner  # noqa: E402
from common import Diagnostic, canonical_bytes, sha256  # noqa: E402


class SourceL7RunnerTests(unittest.TestCase):
    def test_inventory_digest_binds_359_formal_rows_and_419_exact_identities(self):
        value = suite_runner.inventory_value()
        self.assertEqual(len(value["formal_mapping"]), 359)
        self.assertEqual(len({row["formal_l7_id"] for row in value["formal_mapping"]}), 359)
        self.assertEqual(sum(row["coverage_kind"] == "primary_callable" for row in value["formal_mapping"]), 331)
        self.assertEqual(sum(row["coverage_kind"] == "owner_or_fixture_stub" for row in value["formal_mapping"]), 28)
        self.assertEqual(len(value["expected_discovery_ids"]), 419)
        self.assertEqual(value["expected_discovery_ids_sha256"],
                         sha256(("\n".join(value["expected_discovery_ids"]) + "\n").encode()))
        self.assertEqual(suite_runner.inventory_digest(), sha256(canonical_bytes(value)))

    def test_k1_k2_mapping_and_identity_pins_are_preserved(self):
        prefix = suite_runner.FORMAL_MAPPING[:suite_runner.K1_K2_FORMAL_MAPPING_COUNT]
        self.assertEqual(len(prefix), 165)
        self.assertEqual(sha256(canonical_bytes(list(prefix))),
                         suite_runner.K1_K2_FORMAL_MAPPING_SHA256)
        self.assertEqual(len(suite_runner.K1_K2_DISCOVERY_IDS), 199)
        self.assertEqual(sha256(("\n".join(suite_runner.K1_K2_DISCOVERY_IDS) + "\n").encode()),
                         suite_runner.K1_K2_DISCOVERY_IDS_SHA256)
        self.assertTrue(set(suite_runner.K1_K2_DISCOVERY_IDS) <= set(suite_runner.EXPECTED_DISCOVERY_IDS))

    def test_k3_formal_mapping_keeps_only_two_non_callable_boundary_rows(self):
        rows = suite_runner.K3_FORMAL_MAPPING
        self.assertEqual(len(rows), 194)
        self.assertEqual(sum(row["coverage_kind"] == "primary_callable" for row in rows), 192)
        stubs = {row["formal_l7_id"]: row["unittest_identity"]
                 for row in rows if row["coverage_kind"] == "owner_or_fixture_stub"}
        self.assertEqual(stubs, {
            "CK-K3-UT-189": "test_k3.K3FormalFixtures.test_CK_K3_UT_189",
            "CK-K3-UT-190": "test_k3.K3FormalFixtures.test_CK_K3_UT_190",
        })
        self.assertEqual(len(suite_runner.K3_DISCOVERY_IDS), 220)
        self.assertEqual(sum(ident in suite_runner.K3_DISCOVERY_IDS
                             for ident in (row["unittest_identity"] for row in rows)), 194)

    def test_fixed_suite_source_missing_or_mutated_is_rejected_before_test_loading(self):
        cases = (("missing", "helix/helix-harness/units/common-kernel/src/permission.py"),
                 ("mutated", "helix/helix-harness/units/common-kernel/src/permission.py"))
        source_root = _LOCAL_CI.parent.parent
        for mutation, changed_path in cases:
            with self.subTest(mutation=mutation), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                for relative in suite_runner.SOURCE_SHA256:
                    destination = root / relative
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copyfile(source_root / relative, destination)
                changed = root / changed_path
                if mutation == "missing":
                    changed.unlink()
                    expected = ("Unknown", "missing_input")
                else:
                    original = changed.read_bytes()
                    changed.write_bytes(original[:-1] + bytes((original[-1] ^ 1,)))
                    expected = ("Unknown", "conflict")
                with patch.object(suite_runner, "_load_fixed_suite") as load_suite:
                    with self.assertRaises(Diagnostic) as caught:
                        suite_runner.run_suite(root)
                self.assertEqual((caught.exception.classification, caught.exception.reason), expected)
                load_suite.assert_not_called()

    def test_current_fixed_suite_runs_all_419_identities_on_actual_tree(self):
        payload, code = suite_runner.run_suite(_LOCAL_CI.parent.parent)
        self.assertEqual(code, 0)
        self.assertTrue(payload["complete"])
        self.assertEqual(payload["test_count"], 419)
        self.assertEqual(payload["discovered_test_ids"], list(suite_runner.EXPECTED_DISCOVERY_IDS))
        self.assertEqual(payload["executed_test_ids"], list(suite_runner.EXPECTED_DISCOVERY_IDS))

    def test_mapping_unknown_identity_and_duplicate_formal_id_conflict_before_discovery(self):
        cases = ("unknown_identity", "duplicate_formal_id")
        for mutation in cases:
            with self.subTest(mutation=mutation):
                rows = [dict(row) for row in suite_runner.K3_FORMAL_MAPPING]
                if mutation == "unknown_identity":
                    rows[0]["unittest_identity"] = "test_k3.K3FormalFixtures.test_UNREGISTERED"
                else:
                    rows[1]["formal_l7_id"] = rows[0]["formal_l7_id"]
                full_mapping = suite_runner.FORMAL_MAPPING[:suite_runner.K1_K2_FORMAL_MAPPING_COUNT] + tuple(rows)
                k3_digest = sha256(canonical_bytes(rows))
                full_digest = sha256(canonical_bytes(list(full_mapping)))
                output = io.BytesIO()
                with patch.object(suite_runner, "K3_FORMAL_MAPPING", tuple(rows)), \
                     patch.object(suite_runner, "FORMAL_MAPPING", tuple(full_mapping)), \
                     patch.object(suite_runner, "K3_FORMAL_MAPPING_SHA256", k3_digest), \
                     patch.object(suite_runner, "FORMAL_MAPPING_SHA256", full_digest), \
                     patch.object(suite_runner, "_load_fixed_suite") as load_suite, \
                     patch.object(suite_runner.sys, "stdout", SimpleNamespace(buffer=output)):
                    code = suite_runner.main(["--suite", suite_runner.SUITE_ID])
                self.assertEqual(code, 2)
                result = suite_runner.json.loads(output.getvalue())
                self.assertFalse(result["complete"])
                self.assertEqual((result["diagnostic"]["classification"],
                                  result["diagnostic"]["reason"]), ("Unknown", "conflict"))
                load_suite.assert_not_called()

    def test_remaining_192_k3_rows_map_to_direct_test_callables(self):
        source = (_LOCAL_CI.parent.parent /
                  "helix/helix-harness/units/common-kernel/tests/test_k3.py").read_bytes()
        module = ast.parse(source)
        fixture = next(node for node in module.body
                       if isinstance(node, ast.ClassDef) and node.name == "K3FormalFixtures")
        methods = {node.name for node in fixture.body if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
        primary = [row for row in suite_runner.K3_FORMAL_MAPPING
                   if row["coverage_kind"] == "primary_callable"]
        self.assertEqual(len(primary), 192)
        for row in primary:
            class_name, method_name = row["callable_qualname"].split(".", 1)
            with self.subTest(formal_id=row["formal_l7_id"]):
                self.assertEqual(class_name, "K3FormalFixtures")
                self.assertEqual(row["module_path"],
                                 "helix/helix-harness/units/common-kernel/tests/test_k3.py")
                self.assertIn(method_name, methods)

    def test_maximum_complete_failure_frame_fits_the_bounded_supervisor_capture(self):
        ids = list(suite_runner.EXPECTED_DISCOVERY_IDS)
        families = (("failure_count", "failed_ids"), ("error_count", "error_ids"),
                    ("skip_count", "skipped_ids"),
                    ("expected_failure_count", "expected_failure_ids"),
                    ("unexpected_success_count", "unexpected_success_ids"))
        partitions = [ids[index::len(families)] for index in range(len(families))]
        outcome_fields = {}
        for (count_key, ids_key), members in zip(families, partitions):
            outcome_fields[count_key] = len(members)
            outcome_fields[ids_key] = members
        all_outcomes = [ident for _count_key, ids_key in families for ident in outcome_fields[ids_key]]
        self.assertEqual(set(all_outcomes), set(ids))
        self.assertEqual(len(all_outcomes), len(set(all_outcomes)))
        worst = {"schema_version": 1, "suite_id": suite_runner.SUITE_ID, "complete": True,
                 "discovered_test_ids": ids, "executed_test_ids": ids,
                 "test_count": len(ids), **outcome_fields, "exit_code": 1, "state": "fail"}
        frame = canonical_bytes(worst) + b"\n"
        self.assertGreater(len(frame), 32768)
        self.assertLessEqual(len(frame) - 1, 70000)
        self.assertLessEqual(len(frame), 70001)

        spec = {"check_id": "LC-STAGE1-L7-001",
                "argv": ["python3", "-B", "scaffold/local-ci/source_l7_runner.py",
                         "--suite", suite_runner.SUITE_ID]}
        execution = runner._execution(
            spec, {"name": "python3", "version": "3.12.3", "sha256": "a" * 64},
            "fail", 1, "2026-10-09T00:00:00Z", "2026-10-09T00:00:01Z",
            "b" * 64, "c" * 64, "d" * 64)
        response = {"execution": execution,
                    "safe_to_continue": True, "diagnostic": None,
                    "suite_stdout_b64": base64.b64encode(frame).decode("ascii"),
                    "suite_stdout_overflow": False}
        self.assertLess(len(canonical_bytes(response) + b"\n"), 100_000)
        max_capture_response = dict(response,
                                    suite_stdout_b64=base64.b64encode(b"x" * 70001).decode("ascii"))
        self.assertLess(len(canonical_bytes(max_capture_response) + b"\n"), 100_000)

    def test_over_result_limit_returns_noncomplete_conflict_frame(self):
        output = io.BytesIO()
        oversized = {"schema_version": 1, "suite_id": suite_runner.SUITE_ID,
                     "complete": True, "padding": "x" * suite_runner.RESULT_MAX_BYTES}
        with patch.object(suite_runner, "run_suite", return_value=(oversized, 1)), \
             patch.object(suite_runner.sys, "stdout", SimpleNamespace(buffer=output)):
            code = suite_runner.main(["--suite", suite_runner.SUITE_ID])
        self.assertEqual(code, 2)
        raw = output.getvalue()
        self.assertLessEqual(len(raw), suite_runner.RESULT_MAX_BYTES + 1)
        self.assertTrue(raw.endswith(b"\n"))
        result = suite_runner.json.loads(raw)
        self.assertFalse(result["complete"])
        self.assertEqual(result["diagnostic"],
                         {"classification": "Unknown", "reason": "conflict"})

    def test_result_body_limit_accepts_exact_body_and_rejects_plus_one(self):
        self.assertEqual(suite_runner.RESULT_MAX_BYTES, 70000)
        exact = {"padding": ""}
        padding_len = 70000 - len(canonical_bytes(exact))
        exact["padding"] = "x" * padding_len
        self.assertEqual(len(canonical_bytes(exact)), 70000)

        for body_size in (70000, 70001):
            with self.subTest(body_size=body_size):
                payload = dict(exact)
                if body_size == 70001:
                    payload["padding"] += "x"
                output = io.BytesIO()
                with patch.object(suite_runner, "run_suite", return_value=(payload, 0)), \
                     patch.object(suite_runner.sys, "stdout", SimpleNamespace(buffer=output)):
                    code = suite_runner.main(["--suite", suite_runner.SUITE_ID])
                raw = output.getvalue()
                self.assertTrue(raw.endswith(b"\n"))
                self.assertLessEqual(len(raw), 70001)
                if body_size == 70000:
                    self.assertEqual(code, 0)
                    self.assertEqual(len(raw), 70001)
                    self.assertEqual(suite_runner.json.loads(raw), payload)
                else:
                    self.assertEqual(code, 2)
                    decoded = suite_runner.json.loads(raw)
                    self.assertFalse(decoded["complete"])
                    self.assertEqual(decoded["diagnostic"],
                                     {"classification": "Unknown", "reason": "conflict"})

    def test_l7_row_expansions_bind_all_fixed_formal_ids(self):
        source = "\n".join("`" + row["formal_l7_id"] + "`" for row in suite_runner.FORMAL_MAPPING).encode()
        self.assertTrue(suite_runner.l7_formal_ids_present(source))
        missing_one = source.replace(b"`CK-K1-UT-001`", b"`CK-K1-UT-001-REMOVED`")
        self.assertFalse(suite_runner.l7_formal_ids_present(missing_one))

    def test_expansion_templates_accept_only_fixed_values(self):
        cases = (
            ("CK-K1-UT-009-ACCEPT-COMBINE-{CLASS}", "CK-K1-UT-009-ACCEPT-COMBINE-Value", "CK-K1-UT-009-ACCEPT-COMBINE-Evil"),
            ("CK-K1-UT-009-ACCEPT-RECORD-{CLASS}", "CK-K1-UT-009-ACCEPT-RECORD-Value", "CK-K1-UT-009-ACCEPT-RECORD-Stale"),
            ("CK-K1-UT-009-LOOKUP-{CLASS}", "CK-K1-UT-009-LOOKUP-Unknown", "CK-K1-UT-009-LOOKUP-Stale"),
            ("CK-K1-UT-009-KEY-COMBINE-{CLASS}", "CK-K1-UT-009-KEY-COMBINE-Stale", "CK-K1-UT-009-KEY-COMBINE-Evil"),
            ("CK-K1-UT-012-MAP-{WORD}", "CK-K1-UT-012-MAP-conflict", "CK-K1-UT-012-MAP-invented"),
            ("CK-K1-UT-013-{FIELD}-{BOUNDARY}", "CK-K1-UT-013-operation-record-key", "CK-K1-UT-013-operation-shell-boundary"),
            ("CK-K1-UT-014-KEY-{FIELD}", "CK-K1-UT-014-KEY-input.digest", "CK-K1-UT-014-KEY-shell"),
        )
        for template, permitted, forbidden in cases:
            raw = f"`{template}`".encode()
            with self.subTest(template=template, value=permitted), patch.object(
                    suite_runner, "FORMAL_MAPPING", [{"formal_l7_id": permitted}]
            ):
                self.assertTrue(suite_runner.l7_formal_ids_present(raw))
            with self.subTest(template=template, value=forbidden), patch.object(
                    suite_runner, "FORMAL_MAPPING", [{"formal_l7_id": forbidden}]
            ):
                self.assertFalse(suite_runner.l7_formal_ids_present(raw))

    def test_expected_failure_and_unexpected_success_are_failed_outcomes(self):
        class FakeTest:
            def id(self):
                return suite_runner.EXPECTED_DISCOVERY_IDS[0]

        ids = list(suite_runner.EXPECTED_DISCOVERY_IDS)
        for field in ("expectedFailures", "unexpectedSuccesses"):
            result = SimpleNamespace(
                testsRun=419, executed_ids=ids, failures=[], errors=[], skipped=[],
                expectedFailures=[(FakeTest(), "expected")] if field == "expectedFailures" else [],
                unexpectedSuccesses=[FakeTest()] if field == "unexpectedSuccesses" else [],
            )
            payload = suite_runner._result_payload(ids, result, 1)
            self.assertEqual(payload["state"], "fail")
            self.assertEqual(payload["exit_code"], 1)
            if field == "expectedFailures":
                self.assertEqual(payload["expected_failure_ids"], [ids[0]])
                self.assertEqual(payload["expected_failure_count"], 1)
            else:
                self.assertEqual(payload["unexpected_success_ids"], [ids[0]])
                self.assertEqual(payload["unexpected_success_count"], 1)

    def test_discovered_runner_returns_nonzero_for_expected_failure_and_unexpected_success(self):
        ids = list(suite_runner.EXPECTED_DISCOVERY_IDS)

        class FakeCase:
            def __init__(self, ident):
                self.ident = ident

            def id(self):
                return self.ident

        class FakeSuite:
            def __iter__(self):
                return iter(FakeCase(ident) for ident in ids)

        class Result:
            testsRun = 419
            executed_ids = ids
            failures = []
            errors = []
            skipped = []

            def wasSuccessful(self):
                return True

        for outcome in ("expectedFailures", "unexpectedSuccesses"):
            fake_result = Result()
            setattr(fake_result, "expectedFailures", [(FakeCase(ids[0]), "expected")]
                    if outcome == "expectedFailures" else [])
            setattr(fake_result, "unexpectedSuccesses", [FakeCase(ids[0])]
                    if outcome == "unexpectedSuccesses" else [])
            with self.subTest(outcome=outcome), patch.object(suite_runner.unittest, "TextTestRunner") as factory:
                factory.return_value.run.return_value = fake_result
                payload, status = suite_runner._run_discovered_suite(FakeSuite())
            self.assertEqual(status, 1)
            self.assertEqual(payload["exit_code"], 1)
            self.assertEqual(payload["state"], "fail")

    def test_actual_unittest_outcomes_are_counted_through_discovered_runner(self):
        ids = list(suite_runner.EXPECTED_DISCOVERY_IDS)

        class SyntheticCase(unittest.TestCase):
            def __init__(self, ident, outcome):
                super().__init__("runTest")
                self.ident = ident
                self.outcome = outcome
                if outcome in ("expected_failure", "unexpected_success"):
                    self.__unittest_expecting_failure__ = True

            def id(self):
                return self.ident

            def runTest(self):
                if self.outcome == "failure":
                    self.fail("synthetic assertion failure")
                if self.outcome == "error":
                    raise RuntimeError("synthetic test error")
                if self.outcome == "skip":
                    self.skipTest("synthetic skip")
                if self.outcome == "expected_failure":
                    self.fail("synthetic expected failure")

        outcome_fields = {
            "failure": ("failure_count", "failed_ids"),
            "error": ("error_count", "error_ids"),
            "skip": ("skip_count", "skipped_ids"),
            "expected_failure": ("expected_failure_count", "expected_failure_ids"),
            "unexpected_success": ("unexpected_success_count", "unexpected_success_ids"),
        }
        for outcome, (count_field, ids_field) in outcome_fields.items():
            with self.subTest(outcome=outcome):
                cases = [SyntheticCase(ident, outcome if index == 0 else "pass")
                         for index, ident in enumerate(ids)]
                payload, status = suite_runner._run_discovered_suite(unittest.TestSuite(cases))
                self.assertEqual(status, 1)
                self.assertTrue(payload["complete"])
                self.assertEqual(payload["state"], "fail")
                self.assertEqual(payload[count_field], 1)
                self.assertEqual(payload[ids_field], [ids[0]])

    def test_truncated_actual_unittest_run_is_incomplete_not_success(self):
        ids = list(suite_runner.EXPECTED_DISCOVERY_IDS)

        class Case(unittest.TestCase):
            def __init__(self, ident):
                super().__init__("runTest")
                self.ident = ident

            def id(self):
                return self.ident

            def runTest(self):
                pass

        class TruncatedSuite(unittest.TestSuite):
            def run(self, result, debug=False):
                self._tests[0](result)
                return result

        payload, status = suite_runner._run_discovered_suite(
            TruncatedSuite([Case(ident) for ident in ids]))
        self.assertEqual(status, 1)
        self.assertFalse(payload["complete"])
        self.assertEqual(payload["test_count"], 1)
        self.assertEqual(len(payload["executed_test_ids"]), 1)
        self.assertEqual(payload["state"], "fail")

    def test_discovery_mismatch_stops_before_any_test_execution(self):
        class FakeCase:
            def id(self): return suite_runner.EXPECTED_DISCOVERY_IDS[0]
        class FakeSuite:
            def __iter__(self): return iter([FakeCase()])
        with patch.object(suite_runner.unittest, "TextTestRunner") as invoked:
            result, code = suite_runner._run_discovered_suite(FakeSuite())
        self.assertEqual(code, 2)
        self.assertEqual(result["diagnostic"], {"classification": "Unknown", "reason": "conflict"})
        invoked.assert_not_called()


if __name__ == "__main__":
    unittest.main()
