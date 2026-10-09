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
    def test_inventory_digest_binds_callable_mapping_and_all_586_exact_identities(self):
        value = suite_runner.inventory_value()
        self.assertEqual(len(value["formal_mapping"]), 495)
        self.assertEqual(len({row["formal_l7_id"] for row in value["formal_mapping"]}), 495)
        self.assertEqual(sum(row["coverage_kind"] == "primary_callable" for row in value["formal_mapping"]), 441)
        self.assertEqual(sum(row["coverage_kind"] == "owner_or_fixture_stub" for row in value["formal_mapping"]), 52)
        self.assertEqual(sum(row["coverage_kind"] == "partial_callable" for row in value["formal_mapping"]), 2)
        self.assertEqual(value["formal_inventory_count"], 505)
        self.assertEqual(len(value["formal_id_closure"]), 505)
        self.assertEqual(len(value["k6_unexecuted_dispositions"]), 10)
        self.assertEqual(len(value["expected_discovery_ids"]), 586)
        self.assertEqual(value["expected_discovery_ids_sha256"],
                         sha256(("\n".join(value["expected_discovery_ids"]) + "\n").encode()))
        self.assertEqual(suite_runner.inventory_digest(), sha256(canonical_bytes(value)))

    def test_k6_callable_partial_and_unexecuted_inventories_stay_distinct(self):
        rows = suite_runner.K6_FORMAL_MAPPING
        self.assertEqual(len(rows), 45)
        self.assertEqual(sum(row["coverage_kind"] == "primary_callable" for row in rows), 43)
        self.assertEqual(sum(row["coverage_kind"] == "partial_callable" for row in rows), 2)
        self.assertEqual({int(row["formal_l7_id"].rsplit("-", 1)[1]) for row in rows
                          if row["coverage_kind"] == "partial_callable"}, {35, 36})
        self.assertEqual(len(suite_runner.K6_UNEXECUTED_DISPOSITIONS), 10)
        self.assertEqual({row["formal_l7_id"] for row in suite_runner.K6_UNEXECUTED_DISPOSITIONS},
                         {f"CK-K6-UT-{number:03d}" for number in (10, 11, 12, 13, 18, 19, 50, 51, 52, 54)})
        self.assertTrue({"partial_design", "owner_unconnected"} >=
                        {row["disposition"] for row in suite_runner.K6_UNEXECUTED_DISPOSITIONS})
        self.assertFalse({row["unittest_identity"] for row in rows} & set(suite_runner.K6_REGRESSION_IDS))

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

    def test_k5_mapping_preserves_local_and_uncovered_fixture_boundaries(self):
        rows = suite_runner.K5_FORMAL_MAPPING
        self.assertEqual(len(rows), 91)
        self.assertEqual(sum(row["coverage_kind"] == "primary_callable" for row in rows), 67)
        stubs = {int(row["formal_l7_id"].rsplit("-", 1)[1]) for row in rows
                 if row["coverage_kind"] == "owner_or_fixture_stub"}
        self.assertEqual(stubs, {18, 19, *range(21, 33), *range(77, 84), 46, 85, 86})
        self.assertEqual(len(suite_runner.K5_DISCOVERY_IDS), 115)
        self.assertEqual(suite_runner.K5_DISCOVERY_IDS_SHA256,
                         sha256(("\n".join(suite_runner.K5_DISCOVERY_IDS) + "\n").encode()))
        self.assertEqual(sum(row["unittest_identity"] in suite_runner.K5_DISCOVERY_IDS for row in rows), 91)
        self.assertEqual(sha256(canonical_bytes(list(suite_runner.FORMAL_MAPPING[:165]))),
                         suite_runner.K1_K2_FORMAL_MAPPING_SHA256)
        self.assertEqual(sha256(canonical_bytes(list(suite_runner.K3_FORMAL_MAPPING))),
                         suite_runner.K3_FORMAL_MAPPING_SHA256)

    def test_fixed_suite_source_missing_or_mutated_is_rejected_before_test_loading(self):
        cases = (("missing", "helix/helix-harness/units/common-kernel/src/permission.py"),
                 ("mutated", "helix/helix-harness/units/common-kernel/src/permission.py"),
                 ("missing", "helix/helix-harness/units/common-kernel/src/journal.py"),
                 ("missing", "helix/helix-harness/units/common-kernel/tests/test_k5.py"),
                 ("mutated", "helix/helix-harness/units/common-kernel/tests/test_k5.py"),
                 ("missing", "helix/helix-harness/units/common-kernel/src/verification.py"),
                 ("mutated", "helix/helix-harness/units/common-kernel/src/verification.py"),
                 ("missing", "helix/helix-harness/units/common-kernel/tests/test_k6.py"),
                 ("mutated", "helix/helix-harness/units/common-kernel/tests/test_k6.py"))
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

    def test_k6_map_disposition_and_closure_mutations_conflict_before_test_loading(self):
        mutations = ("partial_promoted", "missing_disposition", "duplicate_disposition", "closure_missing")
        for mutation in mutations:
            with self.subTest(mutation=mutation), patch.object(suite_runner, "_load_fixed_suite") as load_suite:
                changes = {}
                if mutation == "partial_promoted":
                    rows = [dict(row) for row in suite_runner.K6_FORMAL_MAPPING]
                    index = next(index for index, row in enumerate(rows)
                                 if row["formal_l7_id"] == "CK-K6-UT-035")
                    rows[index]["coverage_kind"] = "primary_callable"
                    changes.update(K6_FORMAL_MAPPING=tuple(rows),
                                   K6_FORMAL_MAPPING_SHA256=sha256(canonical_bytes(rows)))
                elif mutation == "missing_disposition":
                    rows = suite_runner.K6_UNEXECUTED_DISPOSITIONS[:-1]
                    changes.update(K6_UNEXECUTED_DISPOSITIONS=rows,
                                   K6_DISPOSITION_SHA256=sha256(canonical_bytes(list(rows))))
                elif mutation == "duplicate_disposition":
                    rows = list(suite_runner.K6_UNEXECUTED_DISPOSITIONS)
                    rows[-1] = dict(rows[0])
                    changes.update(K6_UNEXECUTED_DISPOSITIONS=tuple(rows),
                                   K6_DISPOSITION_SHA256=sha256(canonical_bytes(rows)))
                else:
                    closure = tuple(ident for ident in suite_runner.K6_FORMAL_ID_CLOSURE
                                    if ident != "CK-K6-UT-010")
                    changes.update(K6_FORMAL_ID_CLOSURE=closure,
                                   K6_FORMAL_CLOSURE_SHA256=sha256(canonical_bytes(list(closure))))
                with patch.multiple(suite_runner, **changes):
                    with self.assertRaises(Diagnostic) as caught:
                        suite_runner.run_suite(_LOCAL_CI.parent.parent)
                self.assertEqual((caught.exception.classification, caught.exception.reason),
                                 ("Unknown", "conflict"))
                load_suite.assert_not_called()

    def test_current_fixed_suite_runs_all_586_identities_on_actual_tree(self):
        payload, code = suite_runner.run_suite(_LOCAL_CI.parent.parent)
        self.assertEqual(code, 0)
        self.assertTrue(payload["complete"])
        self.assertEqual(payload["test_count"], 586)
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
                full_mapping = (suite_runner.FORMAL_MAPPING[:suite_runner.K1_K2_FORMAL_MAPPING_COUNT]
                                + tuple(rows) + suite_runner.K5_FORMAL_MAPPING)
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

    def test_k5_mapping_identity_or_formal_id_mutation_conflicts_before_discovery(self):
        for mutation in ("unknown_identity", "duplicate_formal_id", "coverage_kind"):
            with self.subTest(mutation=mutation):
                rows = [dict(row) for row in suite_runner.K5_FORMAL_MAPPING]
                if mutation == "unknown_identity":
                    rows[0]["unittest_identity"] = "test_k5.K5Fixtures.test_UNREGISTERED"
                elif mutation == "duplicate_formal_id":
                    rows[1]["formal_l7_id"] = rows[0]["formal_l7_id"]
                else:
                    rows[0]["coverage_kind"] = "owner_or_fixture_stub"
                full_mapping = (suite_runner.FORMAL_MAPPING[:165]
                                + suite_runner.K3_FORMAL_MAPPING + tuple(rows))
                k5_digest = sha256(canonical_bytes(rows))
                full_digest = sha256(canonical_bytes(list(full_mapping)))
                output = io.BytesIO()
                with patch.object(suite_runner, "K5_FORMAL_MAPPING", tuple(rows)), \
                     patch.object(suite_runner, "FORMAL_MAPPING", tuple(full_mapping)), \
                     patch.object(suite_runner, "K5_FORMAL_MAPPING_SHA256", k5_digest), \
                     patch.object(suite_runner, "FORMAL_MAPPING_SHA256", full_digest), \
                     patch.object(suite_runner, "_load_fixed_suite") as load_suite, \
                     patch.object(suite_runner.sys, "stdout", SimpleNamespace(buffer=output)):
                    code = suite_runner.main(["--suite", suite_runner.SUITE_ID])
                self.assertEqual(code, 2)
                result = suite_runner.json.loads(output.getvalue())
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
        # A valid complete result assigns each executed identity to exactly one
        # outcome family.  Exercise the one-, three-, and five-family shapes;
        # the last is maximal because five nonempty arrays minimize separators
        # and five three-digit counts maximize count digits (586 total).
        measured = {}
        for label, sizes in (("one", (586, 0, 0, 0, 0)),
                             ("three", (195, 196, 195, 0, 0)),
                             ("five", (118, 117, 117, 117, 117))):
            self.assertEqual(sum(sizes), len(ids))
            self.assertEqual(sum(size > 0 for size in sizes),
                             {"one": 1, "three": 3, "five": 5}[label])
            if label == "five":
                self.assertTrue(all(100 <= size <= 199 for size in sizes))
                self.assertEqual(sum(len(str(size)) for size in sizes), 15)
            cursor = 0
            outcome_fields = {}
            for (count_key, ids_key), size in zip(families, sizes):
                members = ids[cursor:cursor + size]
                cursor += size
                outcome_fields[count_key] = len(members)
                outcome_fields[ids_key] = members
            self.assertEqual(cursor, len(ids))
            partitioned = [ident for _, ids_key in families for ident in outcome_fields[ids_key]]
            self.assertEqual(len(partitioned), len(set(partitioned)))
            self.assertEqual(set(partitioned), set(ids))
            candidate = {"schema_version": 1, "suite_id": suite_runner.SUITE_ID,
                         "complete": True, "discovered_test_ids": ids,
                         "executed_test_ids": ids, "test_count": len(ids),
                         **outcome_fields, "exit_code": 1, "state": "fail"}
            candidate_frame = canonical_bytes(candidate) + b"\n"
            measured[label] = (candidate, candidate_frame)
        self.assertEqual((len(measured["one"][1]) - 1, len(measured["one"][1])), (90510, 90511))
        self.assertEqual((len(measured["three"][1]) - 1, len(measured["three"][1])), (90512, 90513))
        self.assertEqual((len(measured["five"][1]) - 1, len(measured["five"][1])), (90514, 90515))
        worst, frame = measured["five"]
        self.assertGreater(len(frame), 32768)
        self.assertLess(len(measured["one"][1]), len(measured["three"][1]))
        self.assertLess(len(measured["three"][1]), len(frame))
        self.assertLessEqual(len(frame) - 1, suite_runner.RESULT_MAX_BYTES)
        self.assertLessEqual(len(frame), runner.SUITE_STDOUT_CAPTURE_LIMIT)

        # The helper response embeds the full captured LF-terminated suite
        # frame; it must fit without truncating a legal complete result.
        spec = {"check_id": "LC-STAGE1-L7-001",
                "argv": ["python3", "-B", "scaffold/local-ci/source_l7_runner.py",
                         "--suite", suite_runner.SUITE_ID]}
        execution = runner._execution(
            spec, {"name": "python3", "version": "3.12.3", "sha256": "a" * 64},
            "fail", 1, "2026-10-09T00:00:00Z", "2026-10-09T00:00:01Z",
            "b" * 64, "c" * 64, "d" * 64)
        helper_frames = {}
        for label, (_, candidate_frame) in measured.items():
            response = {"execution": execution,
                        "safe_to_continue": True, "diagnostic": None,
                        "suite_stdout_b64": base64.b64encode(candidate_frame).decode("ascii"),
                        "suite_stdout_overflow": False}
            helper_frames[label] = canonical_bytes(response) + b"\n"
        self.assertEqual(tuple(len(helper_frames[key]) for key in ("one", "three", "five")),
                         (121470, 121470, 121474))
        helper_frame = helper_frames["five"]
        response = {"execution": execution,
                    "safe_to_continue": True, "diagnostic": None,
                    "suite_stdout_b64": base64.b64encode(frame).decode("ascii"),
                    "suite_stdout_overflow": False}
        self.assertLessEqual(len(helper_frame), runner.SUPERVISOR_FRAME_MAX_BYTES)
        self.assertEqual(runner.SUITE_STDOUT_CAPTURE_LIMIT, 90515)
        self.assertEqual(suite_runner.RESULT_MAX_BYTES, 90514)
        self.assertEqual(runner.SUPERVISOR_FRAME_MAX_BYTES, 122000)
        max_capture_response = dict(response,
                                    suite_stdout_b64=base64.b64encode(b"x" * 90515).decode("ascii"))
        self.assertLessEqual(len(canonical_bytes(max_capture_response) + b"\n"),
                             runner.SUPERVISOR_FRAME_MAX_BYTES)

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
        self.assertEqual(suite_runner.RESULT_MAX_BYTES, 90514)
        exact = {"padding": ""}
        padding_len = suite_runner.RESULT_MAX_BYTES - len(canonical_bytes(exact))
        exact["padding"] = "x" * padding_len
        self.assertEqual(len(canonical_bytes(exact)), 90514)

        for body_size in (90514, 90515):
            with self.subTest(body_size=body_size):
                payload = dict(exact)
                if body_size == 90515:
                    payload["padding"] += "x"
                output = io.BytesIO()
                with patch.object(suite_runner, "run_suite", return_value=(payload, 0)), \
                     patch.object(suite_runner.sys, "stdout", SimpleNamespace(buffer=output)):
                    code = suite_runner.main(["--suite", suite_runner.SUITE_ID])
                raw = output.getvalue()
                self.assertTrue(raw.endswith(b"\n"))
                self.assertLessEqual(len(raw), 90515)
                if body_size == 90514:
                    self.assertEqual(code, 0)
                    self.assertEqual(len(raw), 90515)
                    self.assertEqual(suite_runner.json.loads(raw), payload)
                else:
                    self.assertEqual(code, 2)
                    decoded = suite_runner.json.loads(raw)
                    self.assertFalse(decoded["complete"])
                    self.assertEqual(decoded["diagnostic"],
                                     {"classification": "Unknown", "reason": "conflict"})

    def test_l7_row_expansions_bind_all_fixed_formal_ids(self):
        source = "\n".join("`" + ident + "`" for ident in suite_runner.FORMAL_ID_CLOSURE).encode()
        self.assertTrue(suite_runner.l7_formal_ids_present(source))
        missing_one = source.replace(b"`CK-K1-UT-001`", b"`CK-K1-UT-001-REMOVED`")
        self.assertFalse(suite_runner.l7_formal_ids_present(missing_one))

    def test_target_l7_missing_formal_id_is_not_completed_from_neighboring_ids(self):
        source = "\n".join("`" + ident + "`" for ident in suite_runner.FORMAL_ID_CLOSURE).encode()
        self.assertTrue(suite_runner.l7_formal_ids_present(source))
        missing = source.replace(b"`CK-K5-UT-001`", b"`CK-K5-UT-001-MISSING`")
        self.assertFalse(suite_runner.l7_formal_ids_present(missing))

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
                    suite_runner, "FORMAL_ID_CLOSURE", (permitted,)
            ):
                self.assertTrue(suite_runner.l7_formal_ids_present(raw))
            with self.subTest(template=template, value=forbidden), patch.object(
                    suite_runner, "FORMAL_ID_CLOSURE", (forbidden,)
            ):
                self.assertFalse(suite_runner.l7_formal_ids_present(raw))

    def test_expected_failure_and_unexpected_success_are_failed_outcomes(self):
        class FakeTest:
            def id(self):
                return suite_runner.EXPECTED_DISCOVERY_IDS[0]

        ids = list(suite_runner.EXPECTED_DISCOVERY_IDS)
        for field in ("expectedFailures", "unexpectedSuccesses"):
            result = SimpleNamespace(
                testsRun=suite_runner.EXPECTED_DISCOVERY_COUNT, executed_ids=ids, failures=[], errors=[], skipped=[],
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
            testsRun = suite_runner.EXPECTED_DISCOVERY_COUNT
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
