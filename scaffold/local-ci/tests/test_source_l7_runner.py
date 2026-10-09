from __future__ import annotations

import sys
import unittest
from types import SimpleNamespace
from pathlib import Path
from unittest.mock import patch

_LOCAL_CI = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_LOCAL_CI))

import source_l7_runner as suite_runner  # noqa: E402
from common import canonical_bytes, sha256  # noqa: E402


class SourceL7RunnerTests(unittest.TestCase):
    def test_inventory_digest_binds_165_formal_rows_and_199_exact_identities(self):
        value = suite_runner.inventory_value()
        self.assertEqual(len(value["formal_mapping"]), 165)
        self.assertEqual(len({row["formal_l7_id"] for row in value["formal_mapping"]}), 165)
        self.assertEqual(sum(row["coverage_kind"] == "primary_callable" for row in value["formal_mapping"]), 139)
        self.assertEqual(sum(row["coverage_kind"] == "owner_or_fixture_stub" for row in value["formal_mapping"]), 26)
        self.assertEqual(len(value["expected_discovery_ids"]), 199)
        self.assertEqual(value["expected_discovery_ids_sha256"],
                         sha256(("\n".join(value["expected_discovery_ids"]) + "\n").encode()))
        self.assertEqual(suite_runner.inventory_digest(), sha256(canonical_bytes(value)))

    def test_maximum_complete_failure_frame_fits_the_bounded_supervisor_capture(self):
        ids = list(suite_runner.EXPECTED_DISCOVERY_IDS)
        frames = []
        families = (("failure_count", "failed_ids"), ("error_count", "error_ids"),
                    ("skip_count", "skipped_ids"),
                    ("expected_failure_count", "expected_failure_ids"),
                    ("unexpected_success_count", "unexpected_success_ids"))
        for count_key, ids_key in families:
            result = {key: [] if key.endswith("ids") else 0
                      for family in families for key in family}
            result[count_key] = 199
            result[ids_key] = ids
            worst = {"schema_version": 1, "suite_id": suite_runner.SUITE_ID, "complete": True,
                     "discovered_test_ids": ids, "executed_test_ids": ids,
                     "test_count": 199, **result, "exit_code": 1, "state": "fail"}
            frames.append(canonical_bytes(worst) + b"\n")
        self.assertGreater(max(map(len, frames)), 32768)
        self.assertLessEqual(max(map(len, frames)), suite_runner.RESULT_MAX_BYTES)

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
                testsRun=199, executed_ids=ids, failures=[], errors=[], skipped=[],
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
            testsRun = 199
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
