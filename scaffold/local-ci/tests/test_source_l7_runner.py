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
    def _fixed_ast_test_sources(self):
        source_root = _LOCAL_CI.parent.parent
        return {path: (source_root / path).read_bytes()
                for _alias, path in suite_runner.FIXED_TEST_MODULES}

    def test_trusted_ast_inventory_resolves_all_seventeen_aliases_without_loading_modules(self):
        source_bytes = self._fixed_ast_test_sources()
        with patch.object(suite_runner.importlib.util, "spec_from_file_location",
                          side_effect=AssertionError("trusted AST preflight imported a test module")):
            suite_runner.validate_fixed_test_ast_inventory(source_bytes)
        self.assertEqual(len(suite_runner.FIXED_TEST_MODULES), 17)
        self.assertEqual(len(suite_runner.EXPECTED_DISCOVERY_IDS), 716)

    def test_projection_binding_restores_only_the_fixed_entry_even_after_exception(self):
        key = "projection"
        unrelated_key = "_local_ci_unrelated_module_sentinel"
        prior = sys.modules.get(key)
        had_prior = key in sys.modules
        unrelated = object()
        sys.modules[unrelated_key] = unrelated
        self.addCleanup(sys.modules.pop, unrelated_key, None)
        sentinel = object()
        replacement = object()
        sys.modules[key] = sentinel
        try:
            with suite_runner._temporary_projection_binding(replacement):
                self.assertIs(sys.modules[key], replacement)
                self.assertIs(sys.modules[unrelated_key], unrelated)
            self.assertIs(sys.modules[key], sentinel)
            with self.assertRaisesRegex(RuntimeError, "synthetic execution failure"):
                with suite_runner._temporary_projection_binding(replacement):
                    raise RuntimeError("synthetic execution failure")
            self.assertIs(sys.modules[key], sentinel)
            self.assertIs(sys.modules[unrelated_key], unrelated)
            del sys.modules[key]
            with suite_runner._temporary_projection_binding(replacement):
                self.assertIs(sys.modules[key], replacement)
            self.assertNotIn(key, sys.modules)
        finally:
            if had_prior:
                sys.modules[key] = prior
            else:
                sys.modules.pop(key, None)

    def test_trusted_ast_inventory_rejects_single_missing_extra_duplicate_and_unreadable_mutations(self):
        baseline = self._fixed_ast_test_sources()
        brain_path = "helix/helix-brain/units/stage1-brain/tests/test_brain.py"
        brain = baseline[brain_path]
        method = b"test_trace_source_projects_each_declared_field_and_keeps_owner_roles"
        self.assertIn(method, brain)
        cases = (
            ("missing method", brain.replace(method, b"test_removed_source_method", 1),
             "conflict"),
            ("extra method", brain.replace(
                b"class BrainProjectionTests(unittest.TestCase):",
                b"class BrainProjectionTests(unittest.TestCase):\n"
                b"    def test_unlisted_method(self):\n        pass", 1), "conflict"),
            ("duplicate method", brain.replace(
                b"test_trace_source_projects_each_declared_field_and_keeps_owner_roles",
                b"test_trace_source_preserves_k1_variants_without_reclassifying_other_fields", 1),
             "conflict"),
            ("duplicate class", brain.replace(
                b"class BrainKnowledgeLookupTests(unittest.TestCase):",
                b"class BrainProjectionTests(unittest.TestCase):", 1), "conflict"),
            ("extra class", brain + b"\nclass UnlistedTestCase(unittest.TestCase):\n"
             b"    def test_unlisted(self):\n        pass\n", "conflict"),
            ("syntax error", b"class broken(:\n", "unreadable"),
        )
        for label, changed, reason in cases:
            with self.subTest(mutation=label):
                candidate = dict(baseline)
                candidate[brain_path] = changed
                with self.assertRaises(Diagnostic) as raised:
                    suite_runner.validate_fixed_test_ast_inventory(candidate)
                self.assertEqual((raised.exception.classification, raised.exception.reason),
                                 ("Unknown", reason))

        duplicate_function = dict(baseline)
        duplicate_function[brain_path] = brain + b"\ndef _duplicated_helper():\n    pass\n\ndef _duplicated_helper():\n    pass\n"
        with self.assertRaises(Diagnostic) as raised:
            suite_runner.validate_fixed_test_ast_inventory(duplicate_function)
        self.assertEqual((raised.exception.classification, raised.exception.reason),
                         ("Unknown", "conflict"))

        missing = dict(baseline)
        missing.pop(brain_path)
        with self.assertRaises(Diagnostic) as raised:
            suite_runner.validate_fixed_test_ast_inventory(missing)
        self.assertEqual((raised.exception.classification, raised.exception.reason),
                         ("Unknown", "missing_input"))

    def test_trusted_ast_inventory_rejects_dynamic_range_inventory_mutation(self):
        baseline = self._fixed_ast_test_sources()
        path = "helix/helix-harness/units/common-kernel/tests/test_k6.py"
        source = baseline[path]
        self.assertIn(b"*range(1, 10)", source)
        changed = dict(baseline)
        changed[path] = source.replace(b"*range(1, 10)", b"*range(1, 9)", 1)
        with self.assertRaises(Diagnostic) as raised:
            suite_runner.validate_fixed_test_ast_inventory(changed)
        self.assertEqual((raised.exception.classification, raised.exception.reason),
                         ("Unknown", "conflict"))

    def test_inventory_digest_keeps_core_586_product_27_and_helper_103_partitions(self):
        value = suite_runner.inventory_value()
        self.assertEqual(len(value["formal_mapping"]), 495)
        self.assertEqual(len({row["formal_l7_id"] for row in value["formal_mapping"]}), 495)
        self.assertEqual(sum(row["coverage_kind"] == "primary_callable" for row in value["formal_mapping"]), 441)
        self.assertEqual(sum(row["coverage_kind"] == "owner_or_fixture_stub" for row in value["formal_mapping"]), 52)
        self.assertEqual(sum(row["coverage_kind"] == "partial_callable" for row in value["formal_mapping"]), 2)
        self.assertEqual(value["formal_inventory_count"], 505)
        self.assertEqual(len(value["formal_id_closure"]), 505)
        self.assertEqual(len(value["k6_unexecuted_dispositions"]), 10)
        self.assertEqual(value["expected_discovery_count"], 716)
        self.assertEqual(len(value["expected_discovery_ids"]), 716)
        self.assertEqual(len(suite_runner.CORE_EXPECTED_DISCOVERY_IDS), 586)
        self.assertEqual(len(suite_runner.SUPPLEMENTAL_EXPECTED_DISCOVERY_IDS), 27)
        self.assertEqual(len(suite_runner.MECHANISM_HELPER_EXPECTED_DISCOVERY_IDS), 103)
        self.assertEqual(suite_runner.MECHANISM_HELPER_EXPECTED_DISCOVERY_IDS_SHA256,
                         "017eaa7ad0ed602e16d4c0a11678337d0100b55b97bcc17ecba93a3ef72ce39a")
        self.assertFalse(set(suite_runner.CORE_EXPECTED_DISCOVERY_IDS)
                         & set(suite_runner.SUPPLEMENTAL_EXPECTED_DISCOVERY_IDS))
        self.assertFalse(set(suite_runner.CORE_EXPECTED_DISCOVERY_IDS)
                         & set(suite_runner.MECHANISM_HELPER_EXPECTED_DISCOVERY_IDS))
        self.assertFalse(set(suite_runner.SUPPLEMENTAL_EXPECTED_DISCOVERY_IDS)
                         & set(suite_runner.MECHANISM_HELPER_EXPECTED_DISCOVERY_IDS))
        self.assertEqual(value["core_suite_id"], "common-kernel-k1-k2-k3-k5-k6")
        self.assertEqual(value["fixed_test_modules"], [list(row) for row in suite_runner.FIXED_TEST_MODULES])
        self.assertEqual(len(value["fixed_test_modules"]), 17)
        self.assertEqual(set(value["core_partition"]), {
            "source_sha256", "design_paths", "test_modules", "discovery_count",
            "discovery_ids_sha256"})
        self.assertEqual(value["core_partition"]["discovery_count"], 586)
        self.assertEqual(value["product_supplemental_partition"]["discovery_count"], 27)
        self.assertEqual(value["mechanism_helper_partition"]["discovery_count"], 103)
        self.assertEqual(len(value["mechanism_helper_partition"]["design_paths"]), 4)
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
                all_source_hashes = {**suite_runner.SOURCE_SHA256,
                                     **suite_runner.SUPPLEMENTAL_SOURCE_SHA256,
                                     **suite_runner.HELPER_SOURCE_SHA256}
                for relative in all_source_hashes:
                    destination = root / relative
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copyfile(source_root / relative, destination)
                for relative in (*suite_runner.CURRENT_DESIGN_PATHS,
                                 *suite_runner.SUPPLEMENTAL_DESIGN_PATHS,
                                 *suite_runner.HELPER_DESIGN_PATHS):
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

    def test_current_fixed_suite_runs_all_716_identities_on_actual_tree_and_stdout_stays_closed(self):
        key = "projection"
        previous = sys.modules.get(key)
        existed = key in sys.modules
        sentinel = object()
        sys.modules[key] = sentinel
        try:
            payload, code = suite_runner.run_suite(_LOCAL_CI.parent.parent)
            self.assertIs(sys.modules.get(key), sentinel)
        finally:
            if existed:
                sys.modules[key] = previous
            else:
                sys.modules.pop(key, None)
        self.assertEqual(code, 0)
        self.assertTrue(payload["complete"])
        self.assertEqual(payload["test_count"], 716)
        self.assertEqual(set(payload["discovered_test_ids"]), set(suite_runner.EXPECTED_DISCOVERY_IDS))
        self.assertEqual(set(payload["executed_test_ids"]), set(suite_runner.EXPECTED_DISCOVERY_IDS))
        self.assertEqual(len(payload["discovered_test_ids"]), len(set(payload["discovered_test_ids"])))
        self.assertEqual(len(payload["executed_test_ids"]), len(set(payload["executed_test_ids"])))
        self.assertEqual(set(payload), {"schema_version", "suite_id", "complete", "discovered_test_ids",
                                        "executed_test_ids", "test_count", "failure_count", "failed_ids",
                                        "error_count", "error_ids", "skip_count", "skipped_ids",
                                        "expected_failure_count", "expected_failure_ids",
                                        "unexpected_success_count", "unexpected_success_ids",
                                        "exit_code", "state"})

    def test_source_trace_keeps_formal_reuse_oracle_status_and_owner_sets_separate(self):
        source_bytes = {path: (_LOCAL_CI.parent.parent / path).read_bytes()
                        for path, *_ in suite_runner.SUPPLEMENTAL_SOURCE_REFS.values()}
        trace = suite_runner.collect_mechanism_l7_trace(source_bytes)
        formal = trace["formal_locators"]
        reuse_indexes = trace["nfr_reuse_indexes"]
        oracle_indexes = trace["oracle_index_rows"]
        self.assertEqual({m: sum(row["mechanism"] == m for row in formal)
                          for m in suite_runner.SUPPLEMENTAL_SOURCE_REFS},
                         {"BRAIN": 104, "LABO": 83, "HARNESS": 269, "INFRA": 40})
        self.assertEqual([row["source_id"] for row in reuse_indexes],
                         [f"LABO-UT-{number:03d}" for number in range(75, 80)])
        self.assertEqual(len(oracle_indexes), 5)
        self.assertEqual({row["source_id"] for row in oracle_indexes}, {
            "IV-LABO-NFR-001-01", "IV-LABO-NFR-001-02", "IV-LABO-NFR-001-03",
            "IV-LABO-NFR-011-01", "IV-LABO-NFR-011-02"})
        self.assertTrue({f"LABO-UT-{number:03d}" for number in range(84, 89)}
                        <= {row["source_id"] for row in formal})
        infra_nfr = [row for row in formal if row["mechanism"] == "INFRA"
                     and row["source_id"].startswith("INFRA-L7-NFR-")]
        self.assertEqual(len(infra_nfr), 6)
        self.assertTrue(all(row["source_kind"] == "formal_locator" for row in formal))
        self.assertTrue(all(row["source_kind"] == "nfr_reuse_index" for row in reuse_indexes))
        self.assertEqual(sum(row["mechanism"] == "INFRA" for row in trace["source_status_cells"]),
                         526)  # §5 disposition rows (278) + §9.1 coverage rows (248)
        self.assertEqual(sum(row["mechanism"] == "HARNESS" for row in trace["source_status_cells"]), 3)
        self.assertEqual(len(trace["owner_return_cells"]), 278)
        self.assertEqual({m: sum(row["mechanism"] == m for row in trace["owner_boundary_cells"])
                          for m in ("LABO", "HARNESS")}, {"LABO": 88, "HARNESS": 269})
        self.assertEqual({row["mechanism"] for row in trace["owner_return_not_declared"]},
                         {"BRAIN", "LABO", "HARNESS"})
        self.assertEqual({row["mechanism"] for row in trace["status_not_declared"]},
                         {"BRAIN", "LABO"})
        self.assertEqual(len(trace["source_context_sections"]), 11)
        self.assertTrue(all(row["start_line"] <= row["end_line"] and row["byte_count"] > 0
                            and len(row["section_sha256"]) == 64
                            for row in trace["source_context_sections"]))
        self.assertTrue(all(row["header_cells"] and row["raw_cells"]
                            for row in formal))
        self.assertTrue(all(isinstance(row["raw_row"], str) and row["source_row_locator"].endswith(tuple(
            f"#L{number}" for number in range(1, 10000))) for row in formal))

    def test_source_trace_rejects_missing_formal_and_reuse_rows_or_schema_drift(self):
        source_bytes = {path: (_LOCAL_CI.parent.parent / path).read_bytes()
                        for path, *_ in suite_runner.SUPPLEMENTAL_SOURCE_REFS.values()}
        labo_path = suite_runner.SUPPLEMENTAL_SOURCE_REFS["LABO"][0]
        original = source_bytes[labo_path]
        with self.subTest("formal missing"), self.assertRaises(Diagnostic) as caught:
            suite_runner.collect_mechanism_l7_trace({**source_bytes,
                labo_path: original.replace(b"`LABO-UT-001`", b"`LABO-UT-001-REMOVED`", 1)})
        self.assertEqual((caught.exception.classification, caught.exception.reason),
                         ("Unknown", "missing_input"))

    def test_source_trace_fixed_identity_keys_and_context_headings_reject_one_mutations(self):
        source_bytes = {path: (_LOCAL_CI.parent.parent / path).read_bytes()
                        for path, *_ in suite_runner.SUPPLEMENTAL_SOURCE_REFS.values()}
        labo_path = suite_runner.SUPPLEMENTAL_SOURCE_REFS["LABO"][0]
        labo = source_bytes[labo_path]
        original = labo
        width_lines = labo.decode("utf-8").splitlines(keepends=True)
        for index, line in enumerate(width_lines):
            if "`LABO-UT-088`" in line:
                width_lines[index] = line.rstrip("\n")[:-1] + " | EXTRA |\n"
                break
        width_mutation = "".join(width_lines).encode("utf-8")
        cases = (
            ("same-count unknown formal ID", labo.replace(b"`LABO-UT-088`", b"`LABO-UT-089`", 1),
             "conflict"),
            ("formal row width", width_mutation, "conflict"),
            ("owner boundary duplicate key", labo.replace(b"`LABO-UT-088`", b"`LABO-UT-087`", 1),
             "conflict"),
        )
        for label, changed, expected_reason in cases:
            with self.subTest(label=label), self.assertRaises(Diagnostic) as caught:
                suite_runner.collect_mechanism_l7_trace({**source_bytes, labo_path: changed})
            self.assertEqual((caught.exception.classification, caught.exception.reason),
                             ("Unknown", expected_reason))

        harness_path = suite_runner.SUPPLEMENTAL_SOURCE_REFS["HARNESS"][0]
        harness = source_bytes[harness_path]
        lines = harness.decode("utf-8").splitlines(keepends=True)
        removed = False
        section = 0
        for index, line in enumerate(lines):
            if line.startswith("## "):
                section = 7 if line.startswith("## 7.") else 0
            if section == 7 and "UT-HARNESS-SUP-001" in line:
                del lines[index]
                removed = True
                break
        self.assertTrue(removed)
        with self.subTest(label="HARNESS fixed status row missing"), self.assertRaises(Diagnostic) as caught:
            suite_runner.collect_mechanism_l7_trace({**source_bytes,
                harness_path: "".join(lines).encode("utf-8")})
        self.assertEqual((caught.exception.classification, caught.exception.reason),
                         ("Unknown", "missing_input"))

        infra_path = suite_runner.SUPPLEMENTAL_SOURCE_REFS["INFRA"][0]
        infra = source_bytes[infra_path]
        duplicate_key = infra.replace(b"`L8-INFRA-001-01-MISSING-role`",
                                       b"`L8-INFRA-001-01-BASE`", 1)
        with self.subTest(label="INFRA duplicate composite status key"), self.assertRaises(Diagnostic) as caught:
            suite_runner.collect_mechanism_l7_trace({**source_bytes, infra_path: duplicate_key})
        self.assertEqual((caught.exception.classification, caught.exception.reason),
                         ("Unknown", "conflict"))

        brain_path = suite_runner.SUPPLEMENTAL_SOURCE_REFS["BRAIN"][0]
        with self.subTest(label="duplicate fixed context heading"), self.assertRaises(Diagnostic) as caught:
            suite_runner._collect_source_context_sections({**source_bytes,
                brain_path: source_bytes[brain_path] + b"\n## 3. Duplicate context\n"})
        self.assertEqual((caught.exception.classification, caught.exception.reason),
                         ("Unknown", "conflict"))
        with self.subTest("reuse index missing"), self.assertRaises(Diagnostic) as caught:
            suite_runner.collect_mechanism_l7_trace({**source_bytes,
                labo_path: original.replace(b"`LABO-UT-075`", b"`LABO-UT-075-REMOVED`", 1)})
        self.assertEqual((caught.exception.classification, caught.exception.reason),
                         ("Unknown", "missing_input"))
        with self.subTest("wrong index kind moves a formal ID out of formal set"), self.assertRaises(Diagnostic) as caught:
            suite_runner.collect_mechanism_l7_trace({**source_bytes,
                labo_path: original.replace(b"`input_api_case` | `aggregate_observations`",
                                            b"`nfr_reuse_index` | `aggregate_observations`", 1)})
        self.assertEqual((caught.exception.classification, caught.exception.reason),
                         ("Unknown", "missing_input"))
        with self.subTest("fixed index header changed"), self.assertRaises(Diagnostic) as caught:
            suite_runner.collect_mechanism_l7_trace({**source_bytes,
                labo_path: original.replace("| L7 ID | L8定義ID | 索引種別 |".encode(),
                                            "| L7 ID | L8定義ID | category |".encode(), 1)})
        self.assertEqual((caught.exception.classification, caught.exception.reason),
                         ("Unknown", "conflict"))
        infra_path = suite_runner.SUPPLEMENTAL_SOURCE_REFS["INFRA"][0]
        infra = source_bytes[infra_path]
        with self.subTest("infra nfr formal locator missing"), self.assertRaises(Diagnostic) as caught:
            suite_runner.collect_mechanism_l7_trace({**source_bytes,
                infra_path: infra.replace(b"`INFRA-L7-NFR-001-01`", b"`INFRA-L7-NFR-001-01-REMOVED`", 1)})
        self.assertEqual((caught.exception.classification, caught.exception.reason),
                         ("Unknown", "missing_input"))
        with self.subTest("infra status table header changed"), self.assertRaises(Diagnostic) as caught:
            suite_runner.collect_mechanism_l7_trace({**source_bytes,
                infra_path: infra.replace("実装候補区分（未実行）".encode(), "実装区分".encode(), 1)})
        self.assertEqual((caught.exception.classification, caught.exception.reason),
                         ("Unknown", "conflict"))
        lines = infra.decode("utf-8").splitlines(keepends=True)
        section = 0
        removed = False
        for index, line in enumerate(lines):
            if line.startswith("## "):
                section = 9 if line.startswith("## 9.") else 0
            if section == 9 and "`L8-INFRA-001-01-BASE`" in line:
                del lines[index]
                removed = True
                break
        self.assertTrue(removed)
        with self.subTest("infra status row missing"), self.assertRaises(Diagnostic) as caught:
            suite_runner.collect_mechanism_l7_trace({**source_bytes,
                infra_path: "".join(lines).encode("utf-8")})
        self.assertEqual((caught.exception.classification, caught.exception.reason),
                         ("Unknown", "missing_input"))

    def test_labo_nfr_reuse_and_oracle_indexes_have_fixed_closed_id_sets(self):
        source_bytes = {path: (_LOCAL_CI.parent.parent / path).read_bytes()
                        for path, *_ in suite_runner.SUPPLEMENTAL_SOURCE_REFS.values()}
        labo_path = suite_runner.SUPPLEMENTAL_SOURCE_REFS["LABO"][0]
        baseline = source_bytes[labo_path]
        mutations = (
            ("reuse index ID", b"`LABO-UT-079`", b"`LABO-UT-074`"),
            ("NFR oracle ID", b"`IV-LABO-NFR-011-02`", b"`IV-LABO-NFR-012-02`"),
        )
        for label, before, after in mutations:
            with self.subTest(label=label), self.assertRaises(Diagnostic) as caught:
                suite_runner.collect_mechanism_l7_trace(
                    {**source_bytes, labo_path: baseline.replace(before, after, 1)})
            self.assertEqual((caught.exception.classification, caught.exception.reason),
                             ("Unknown", "conflict"))


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
        # outcome family. Exercise one-, three-, and five-family shapes; the
        # last has five nonempty arrays and three-digit counts (716 total).
        measured = {}
        for label, sizes in (("one", (716, 0, 0, 0, 0)),
                             ("three", (238, 239, 239, 0, 0)),
                             ("five", (144, 143, 143, 143, 143))):
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
        self.assertEqual((len(measured["five"][1]) - 1, len(measured["five"][1])), (134755, 134756))
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
        self.assertEqual(len(helper_frames["five"]), 180450)
        helper_frame = helper_frames["five"]
        response = {"execution": execution,
                    "safe_to_continue": True, "diagnostic": None,
                    "suite_stdout_b64": base64.b64encode(frame).decode("ascii"),
                    "suite_stdout_overflow": False}
        self.assertLessEqual(len(helper_frame), runner.SUPERVISOR_FRAME_MAX_BYTES)
        self.assertEqual(runner.SUITE_STDOUT_CAPTURE_LIMIT, 134756)
        self.assertEqual(suite_runner.RESULT_MAX_BYTES, 134755)
        self.assertEqual(runner.SUPERVISOR_FRAME_MAX_BYTES, 180580)
        max_capture_response = dict(response,
                                    suite_stdout_b64=base64.b64encode(b"x" * 134756).decode("ascii"))
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
        self.assertEqual(suite_runner.RESULT_MAX_BYTES, 134755)
        exact = {"padding": ""}
        padding_len = suite_runner.RESULT_MAX_BYTES - len(canonical_bytes(exact))
        exact["padding"] = "x" * padding_len
        self.assertEqual(len(canonical_bytes(exact)), 134755)

        for body_size in (134755, 134756):
            with self.subTest(body_size=body_size):
                payload = dict(exact)
                if body_size == 134756:
                    payload["padding"] += "x"
                output = io.BytesIO()
                with patch.object(suite_runner, "run_suite", return_value=(payload, 0)), \
                     patch.object(suite_runner.sys, "stdout", SimpleNamespace(buffer=output)):
                    code = suite_runner.main(["--suite", suite_runner.SUITE_ID])
                raw = output.getvalue()
                self.assertTrue(raw.endswith(b"\n"))
                self.assertLessEqual(len(raw), 134756)
                if body_size == 134755:
                    self.assertEqual(code, 0)
                    self.assertEqual(len(raw), 134756)
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
