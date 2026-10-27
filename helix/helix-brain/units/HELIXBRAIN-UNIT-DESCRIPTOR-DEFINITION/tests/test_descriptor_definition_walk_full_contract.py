"""R3-M4: FN1 walk/native/indexの独立期待と到達可能な固定stopを確認する。

保存済みwhole output、private patch、mock readerを使わない。既存fn1の
descriptor.attribution返却だけは未変更helperの7-field値として期待へ採用し、
それ以外のnative material/event/sort/indexはL4/L5と原入力から構成する。
現readerで未到達のpositive MeaningOperation/Pair/support枝は、偽のhelper返却を
組まず、このbounded testでは静的未到達として扱う。
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import (
    compare_descriptor_definitions,
    validate_supply_input,
)
from descriptor_walk_contract_expectations import (
    ASSESSMENT_FIELDS,
    NATIVE_FIELDS,
    ORIGIN_FIELDS,
    expected_walk,
)
from identity_input_fixtures import _write_source_content, trace_input
from supply_input_fixtures import base_input, load_document


BACKFLOW = "HELIXBRAIN-L6-032-N03-PATH"
WALK_STOP_PREFIX = "F01/F02/unclosed/definition_meaning_walk/"

# Current reader branch limits, documented as static scope rather than supplied
# fake helper returns: meaning_pair_nonempty_unimplemented is behind the
# multifact_pair_scope stop; acquisition_state=resolved, nonempty MeaningSupport,
# and support problem causes other than source_unresolved/container_absent require
# typed operation carriers that are not yet implemented in the current reader.
STATICALLY_UNREACHED_NATIVE_BRANCHES = {
    "meaning_pair_nonempty_unimplemented": "multifact_pair_scope precedes pair calculation",
    "meaning_acquisition_resolved": "no currently supported typed operation carrier",
    "meaning_support_nonempty": "no currently supported typed operation carrier",
    "meaning_problem_non_source_cause": "no currently supported typed operation carrier",
}


class TestDescriptorDefinitionWalkFullContract(unittest.TestCase):
    def _run_full_walk(self, raw, problem_specs):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsInstance(validated["input"], dict, "setup: raw input decodes")
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["unusable_source_refs"], [])
        validated_before = copy.deepcopy(validated)

        # Only the unmodified FN1 public attribution axis is an allowed helper
        # oracle. The complete Comparison is never used as the walk expectation.
        fn1 = compare_descriptor_definitions({"validated": validated})
        self.assertEqual(fn1["producer_symbol"], "compare_descriptor_definitions")
        self.assertEqual(fn1["input_binding"], raw_before["binding"])
        fn1_before = copy.deepcopy(fn1)
        expectation = expected_walk(raw_before, fn1, problem_specs)

        walk = evaluate_descriptor_definition_walk({"validated": validated})
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(fn1, fn1_before)
        self._assert_expected_walk(walk, expectation)
        return raw_before, validated_before, walk, expectation

    def _assert_expected_walk(self, actual, expected):
        self.assertEqual(set(actual), {"evaluation", "native_material", "target_reads", "intent_reads"})
        evaluation = actual["evaluation"]
        self.assertEqual(set(evaluation), {"comparison", "assessments"})
        self.assertEqual(set(evaluation["comparison"]), {
            "axes", "findings", "producer_symbol", "input_binding",
        })
        self.assertEqual(evaluation["comparison"]["axes"], expected["comparison"]["axes"])
        self.assertEqual(evaluation["comparison"]["findings"], expected["comparison"]["findings"])
        self.assertEqual(evaluation["comparison"]["producer_symbol"], expected["comparison"]["producer_symbol"])
        self.assertEqual(evaluation["comparison"]["input_binding"], expected["comparison"]["input_binding"])

        assessments = evaluation["assessments"]
        expected_assessments = expected["assessments"]
        self.assertEqual(len(assessments), len(expected_assessments))
        for actual_row, expected_row in zip(assessments, expected_assessments):
            self.assertEqual(set(actual_row), ASSESSMENT_FIELDS)
            self.assertEqual(set(actual_row["key"]), {"binding", "slot_identity", "descriptor_kind"})
            self.assertEqual(actual_row, expected_row)

        native = actual["native_material"]
        expected_native = expected["native_material"]
        self.assertEqual(set(native), NATIVE_FIELDS)
        self.assertEqual(set(expected_native), NATIVE_FIELDS)
        for member in (
            "meaning_reads", "applicability_reads", "special_reads", "pair_reads",
            "applicability_judgment_batches", "meaning_read_origins",
        ):
            self.assertEqual(native[member], expected_native[member], member)
        self.assertEqual(len(native["judgment_origins"]), len(expected_native["judgment_origins"]))
        for actual_origin, expected_origin in zip(
            native["judgment_origins"], expected_native["judgment_origins"]
        ):
            self.assertEqual(set(actual_origin), ORIGIN_FIELDS)
            self.assertEqual(actual_origin, expected_origin)

        # The independent expected builder uses event handles/ordinal order to
        # map sorted axis indices, preserving equal AxisResult values as repeats.
        self.assertEqual(actual["target_reads"], expected["target_reads"])
        self.assertEqual(actual["intent_reads"], expected["intent_reads"])
        self.assertEqual(len(assessments), len(native["judgment_origins"]))
        for ordinal, (assessment, origin) in enumerate(zip(assessments, native["judgment_origins"])):
            self.assertEqual(origin["ordinal"], ordinal)
            self.assertEqual(origin["assessment_key"], assessment["key"])
            self.assertEqual(origin["axis_name"], assessment["axis_name"])
            self.assertEqual(
                assessment["original_axes"],
                [evaluation["comparison"]["axes"][i] for i in assessment["comparison_axis_indices"]],
            )

    @staticmethod
    def _all_source_unresolved_specs(raw):
        return {
            (slot_index, fact_index): ((0, "source_unresolved"),)
            for slot_index, slot in enumerate(raw["descriptors"])
            for fact_index, _fact in enumerate(slot["facts"])
        }

    def test_l7_normal_full_walk_has_independent_native_and_sort_expectations(self):
        """Normal digest mismatch remains per-target source_unresolved with pinned frames."""
        raw = base_input(load_document())
        specs = self._all_source_unresolved_specs(raw)
        _raw, _validated, walk, expectation = self._run_full_walk(raw, specs)
        self.assertEqual(len(walk["native_material"]["meaning_reads"]), 15)
        self.assertTrue(all(
            read["normative_frame"]["catalog_pointer"] == "/descriptor_meanings"
            for read in walk["native_material"]["meaning_reads"]
        ))
        self.assertTrue(all(
            origin["cause"] == "required_source_or_interpretation_unresolved"
            for origin in walk["native_material"]["judgment_origins"]
            if origin["axis_name"].endswith(".definition")
        ))
        self.assertEqual(len(expectation["comparison"]["axes"]), len(walk["evaluation"]["comparison"]["axes"]))

    def test_independent_trace_input_full_walk_preserves_container_absence(self):
        """The separately qualified trace input reaches source0 carrier absence, not digest mismatch."""
        raw = trace_input()
        specs = {
            (slot_index, fact_index): ((0, "container_absent"),)
            for slot_index, slot in enumerate(raw["descriptors"])
            for fact_index, _fact in enumerate(slot["facts"])
        }
        _raw, _validated, walk, _expectation = self._run_full_walk(raw, specs)
        self.assertTrue(all(
            read["problems"][0]["locator"] == "/sources/0/content/definition_meaning_operations"
            for read in walk["native_material"]["meaning_reads"]
        ))

    def test_permuted_raw_slot_array_keeps_contract_kind_and_original_locator_order(self):
        """Outer events follow the fixed L4 kind order while locators retain raw indices."""
        raw = base_input(load_document())
        raw["descriptors"].reverse()
        specs = self._all_source_unresolved_specs(raw)
        _raw, _validated, walk, expectation = self._run_full_walk(raw, specs)
        expected_slots = []
        for assessment in expectation["assessments"]:
            if assessment["axis_name"] == "descriptor.attribution":
                expected_slots.append(assessment["slot_locators"][0])
        self.assertEqual(
            expected_slots,
            [f"/descriptors/{index}" for index in reversed(range(len(raw["descriptors"])))],
        )
        self.assertTrue(walk["evaluation"]["assessments"])

    def test_duplicate_physical_source_occurrence_keeps_two_problem_events_and_equal_axis_handles(self):
        """One fact read keeps both target problem occurrences and distinct stable handles."""
        raw = base_input(load_document())
        self.assertEqual(len(raw["sources"]), 5)
        provenance = raw["knowledge_records"][0]["provenance_refs"]
        self.assertEqual(len(provenance), 1)
        self.assertEqual(provenance[0]["identity"], raw["sources"][0]["ref"]["identity"])
        self.assertNotEqual(provenance[0]["sha256"], raw["sources"][0]["ref"]["sha256"])
        raw["sources"].append(copy.deepcopy(raw["sources"][0]))
        self.assertEqual(raw["sources"][0], raw["sources"][5])
        specs = {
            (slot_index, fact_index): ((0, "source_unresolved"), (5, "source_unresolved"))
            for slot_index, slot in enumerate(raw["descriptors"])
            for fact_index, _fact in enumerate(slot["facts"])
        }
        _raw, _validated, walk, _expectation = self._run_full_walk(raw, specs)
        native = walk["native_material"]
        for read in native["meaning_reads"]:
            self.assertEqual([problem["source_index"] for problem in read["problems"]], [0, 5])
        for assessment, origin in zip(walk["evaluation"]["assessments"], native["judgment_origins"]):
            if origin["axis_name"].endswith(".definition"):
                self.assertEqual(len(origin["meaning_problem_links"]), 1)
                self.assertEqual(len(assessment["comparison_axis_indices"]), 1)
        # Identical public axes remain two occurrences with distinct origin handles.
        by_read = {}
        links_by_read = {}
        for assessment, origin in zip(walk["evaluation"]["assessments"], native["judgment_origins"]):
            if origin["axis_name"].endswith(".definition"):
                read_index = origin["meaning_read_indices"][0]
                by_read.setdefault(read_index, []).append(assessment)
                links_by_read.setdefault(read_index, []).append(
                    origin["meaning_problem_links"][0]["problem_index"]
                )
        for rows in by_read.values():
            self.assertEqual(len(rows), 2)
            self.assertEqual(rows[0]["original_axes"], rows[1]["original_axes"])
            self.assertNotEqual(rows[0]["comparison_axis_indices"], rows[1]["comparison_axis_indices"])
        self.assertTrue(all(indices == [0, 1] for indices in links_by_read.values()))

    def _assert_stop(self, raw, expected_prefix):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["unusable_source_refs"], [])
        validated_before = copy.deepcopy(validated)
        with self.assertRaises(NotImplementedError) as caught:
            evaluate_descriptor_definition_walk({"validated": validated})
        message = str(caught.exception)
        self.assertTrue(message.startswith(expected_prefix), message)
        self.assertIn("Backflow " + BACKFLOW, message)
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)

    def test_supplied_typed_claim_stops_at_current_claim_port(self):
        """A closed Claim whose subject is template_ref reaches the current supplied-claim boundary."""
        raw = base_input(load_document())
        raw["claims"] = [{
            "subject_ref": copy.deepcopy(raw["binding"]["template_ref"]),
            "binding": copy.deepcopy(raw["binding"]),
            "actor": "BRAIN",
            "kind": "fill_definition",
            "proposed_value": None,
            "basis_refs": [],
        }]
        self._assert_stop(raw, WALK_STOP_PREFIX + "supplied_claim_ports;")

    def test_multifact_slot_stops_at_current_pair_scope(self):
        """A second closed fact occurrence reaches the bounded one-fact pair path guard."""
        raw = base_input(load_document())
        slot = raw["descriptors"][0]
        slot["facts"].append(copy.deepcopy(slot["facts"][0]))
        self._assert_stop(raw, WALK_STOP_PREFIX + "multifact_pair_scope;")

    def test_explicit_nonnull_applicability_ref_stops_at_reader_id(self):
        """A supplied native applicability Ref is not treated as an empty/absent read."""
        raw = base_input(load_document())
        raw["descriptors"][0]["definition_applicability_ref"] = copy.deepcopy(
            raw["binding"]["knowledge_ref"]
        )
        self._assert_stop(raw, "F01/F02/unclosed/applicability_supplied_ref:")

    def test_supplied_meaning_operation_carrier_stops_at_reader_id(self):
        """A typed carrier array remains an unclosed reader branch, not empty support."""
        raw = trace_input()
        source = raw["sources"][0]
        original_ref = copy.deepcopy(source["ref"])
        content = copy.deepcopy(source["content"])
        content["definition_meaning_operations"] = []
        _write_source_content(raw, source, content)
        updated_ref = copy.deepcopy(source["ref"])
        for slot in raw["descriptors"]:
            for fact in slot["facts"]:
                if fact["source_ref"] == original_ref:
                    fact["source_ref"] = copy.deepcopy(updated_ref)
        for record in raw["knowledge_records"]:
            record["provenance_refs"] = [
                copy.deepcopy(updated_ref) if ref == original_ref else ref
                for ref in record["provenance_refs"]
            ]
        self._assert_stop(raw, "F01/F02/unclosed/definition_meaning_operations_unclosed:")


if __name__ == "__main__":
    unittest.main()
