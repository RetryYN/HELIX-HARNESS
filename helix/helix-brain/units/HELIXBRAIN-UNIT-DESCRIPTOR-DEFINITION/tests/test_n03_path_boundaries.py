"""N03 fixed-path carry and unsupported-input boundaries.

Partial oracle basis: L4 /field_value_applicability_contract/projection_order/carry;
L5 /functions/1, /functions/2, and
/field_value_applicability_detail/claim_protocol; L8 F02 NEG-21, N03 NEG-01,
and the existing normal fn1/fn2 oracles. This file exercises only the same-call
path and explicit unimplemented branches; it does not define a complete
Comparison oracle or qualify fixture values as product facts.
"""

import copy
import unittest

from descriptor_definitions import (
    compare_descriptor_definitions,
    compare_values_and_applicability,
    validate_supply_input,
)
from supply_input_fixtures import base_input, load_document
from test_n03_values_and_applicability import N03_CASES, _n03_input


N03_PATH_ID = "HELIXBRAIN-L6-032-N03-PATH"
DEFINITION_AXES = (
    "required section.definition",
    "required field.definition",
)


class TestN03PathBoundaries(unittest.TestCase):
    def setUp(self):
        self.document = load_document()

    def _validate(self, raw):
        before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], before)
        self.assertEqual(raw, before)
        return validated, before

    def _assert_f02_path_stop(self, raw):
        validated, before = self._validate(raw)
        with self.assertRaises(NotImplementedError) as caught:
            compare_descriptor_definitions({"validated": validated})
        message = str(caught.exception)
        self.assertIn("F02", message)
        self.assertIn(N03_PATH_ID, message)
        self.assertEqual(validated["input"], before)
        self.assertEqual(raw, before)

    def test_fn2_carries_the_two_fn1_definition_axes_first_in_original_order(self):
        raw = base_input(self.document)
        validated, before = self._validate(raw)

        # The producer result is the source of the carried rows. Do not build
        # substitute axes or inject a cached Comparison.
        definitions = compare_descriptor_definitions({"validated": validated})
        definitions_before = copy.deepcopy(definitions)
        carried = [
            copy.deepcopy(axis)
            for axis in definitions["axes"]
            if axis["axis"] in DEFINITION_AXES
        ]
        self.assertEqual(len(carried), 2)
        self.assertEqual({axis["axis"] for axis in carried}, set(DEFINITION_AXES))

        result = compare_values_and_applicability({
            "validated": validated,
            "definitions": definitions,
        })

        self.assertEqual(result["axes"][:2], carried)
        self.assertEqual(
            [axis["axis"] for axis in result["axes"][:2]],
            [axis["axis"] for axis in carried],
        )
        self.assertEqual(
            [list(axis) for axis in result["axes"][:2]],
            [list(axis) for axis in carried],
        )
        self.assertEqual(definitions, definitions_before)
        self.assertEqual(validated["input"], before)
        self.assertEqual(raw, before)

    def test_missing_required_field_slot_emits_descriptor_07_missing_and_carries_to_fn2(self):
        raw = base_input(self.document)
        matching = [
            index for index, slot in enumerate(raw["descriptors"])
            if slot["descriptor_kind"] == "required field"
        ]
        self.assertEqual(len(matching), 1)
        self.assertIn("required field", raw["required_descriptor_kinds"])
        raw["descriptors"].pop(matching[0])
        validated, before = self._validate(raw)
        definitions = compare_descriptor_definitions({"validated": validated})
        self.assertEqual([f["code"] for f in definitions["findings"]], ["descriptor_07_missing"])
        carried = [
            copy.deepcopy(axis)
            for axis in definitions["axes"]
            if axis["axis"] in DEFINITION_AXES
        ]
        self.assertEqual(len(carried), 2)
        self.assertEqual(
            {axis["axis"]: axis["state"] for axis in carried},
            {"required section.definition": "unknown", "required field.definition": "missing"},
        )
        result = compare_values_and_applicability({
            "validated": validated,
            "definitions": definitions,
        })
        self.assertEqual(result["axes"][:2], carried)
        self.assertEqual(validated["input"], before)
        self.assertEqual(raw, before)

    def test_duplicate_required_field_kind_stops_as_f02_n03_path(self):
        raw = base_input(self.document)
        slots = [
            slot for slot in raw["descriptors"]
            if slot["descriptor_kind"] == "required field"
        ]
        self.assertEqual(len(slots), 1)
        raw["descriptors"].append(copy.deepcopy(slots[0]))
        self._assert_f02_path_stop(raw)

    def test_required_descriptor_kinds_surplus_slot_is_read_and_duplicate_required_stops(self):
        raw = base_input(self.document)
        self.assertIn("required field", raw["required_descriptor_kinds"])
        self.assertTrue(any(
            slot["descriptor_kind"] == "required field"
            for slot in raw["descriptors"]
        ))
        raw["required_descriptor_kinds"] = [
            kind for kind in raw["required_descriptor_kinds"]
            if kind != "required field"
        ]
        validated, before = self._validate(raw)
        definitions = compare_descriptor_definitions({"validated": validated})
        self.assertEqual(definitions["findings"], [])
        carried = [
            copy.deepcopy(axis)
            for axis in definitions["axes"]
            if axis["axis"] in DEFINITION_AXES
        ]
        self.assertEqual(len(carried), 2)
        self.assertEqual(validated["input"], before)
        self.assertEqual(raw, before)

        raw_dup_required = base_input(self.document)
        raw_dup_required["required_descriptor_kinds"].append("required field")
        self._assert_f02_path_stop(raw_dup_required)

    def _assert_n03_not_implemented_without_result(self, mutate):
        raw, _value_fact, claim = _n03_input(self.document, N03_CASES[0])
        mutate(raw, claim)
        raw_before = copy.deepcopy(raw)
        validated, _ = self._validate(raw)
        definitions = compare_descriptor_definitions({"validated": validated})
        definitions_before = copy.deepcopy(definitions)
        outcome = None

        with self.assertRaises(NotImplementedError) as caught:
            outcome = compare_values_and_applicability({
                "validated": validated,
                "definitions": definitions,
            })

        self.assertIn(N03_PATH_ID, str(caught.exception))
        self.assertIsNone(outcome, "unsupported input returns no Comparison/Finding")
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(definitions, definitions_before)

    def test_n03_nonempty_basis_refs_stops_without_finding_or_input_change(self):
        def mutate(raw, claim):
            claim["basis_refs"].append(copy.deepcopy(claim["subject_ref"]))

        self._assert_n03_not_implemented_without_result(mutate)

    def test_n03_value_fact_with_supplied_value_stops_without_finding_or_input_change(self):
        def mutate(raw, _claim):
            raw["values"][-1]["value"] = "supplied-value"

        self._assert_n03_not_implemented_without_result(mutate)

    def test_n03_changed_basis_origin_stops_without_finding_or_input_change(self):
        def mutate(_raw, claim):
            claim["proposed_value"]["basis_origin"] = "owner_assertion"

        self._assert_n03_not_implemented_without_result(mutate)

    def test_n03_extra_claim_member_stops_without_finding_or_input_change(self):
        def mutate(_raw, claim):
            claim["extra_member"] = "preserved raw input"

        self._assert_n03_not_implemented_without_result(mutate)


if __name__ == "__main__":
    unittest.main()
