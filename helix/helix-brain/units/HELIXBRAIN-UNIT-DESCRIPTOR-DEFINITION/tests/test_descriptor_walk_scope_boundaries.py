"""G2a walk boundaries for independent required populations and Claim kinds.

Expectations are derived from L5 failure_rules/9 and the canonical evaluation
population contract. These cases use a real FN0 snapshot and do not treat the
owner target declaration as a new required-kind source.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import validate_supply_input


PRODUCER = "compare_descriptor_definitions"
MISSING_KINDS = (
    ("template identity", "descriptor_01_missing", 9),
    ("version", "descriptor_02_missing", 12),
    ("layer/pair", "descriptor_03_missing", 15),
    ("applicability", "descriptor_04_missing", 18),
    ("required input", "descriptor_05_missing", 21),
    ("required section", "descriptor_06_missing", 24),
    ("required field", "descriptor_07_missing", 27),
    ("relation", "descriptor_08_missing", 30),
    ("意味owner", "descriptor_09_missing", 33),
    ("trace", "descriptor_10_missing", 36),
    ("negative oracle", "descriptor_11_missing", 39),
    ("measurement", "descriptor_12_missing", 42),
    ("completion", "descriptor_13_missing", 45),
    ("downstream kind", "descriptor_14_missing", 48),
    ("supersession", "descriptor_15_missing", 51),
)


def _validate(raw: dict) -> dict:
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    if validated["input"] is None or validated["input"] != raw_before:
        raise AssertionError("setup: FN0 must retain this typed raw input")
    if validated["input_issues"] or validated["unusable_source_refs"]:
        raise AssertionError("setup: FN0 must accept the fixture without source issues")
    return validated


class TestDescriptorWalkScopeBoundaries(unittest.TestCase):
    def test_unrequired_absent_kind_does_not_create_missing_event_or_finding(self):
        """An owner target cannot add template identity to the root's required set."""
        raw = descriptor_claim_input("positive")
        self.assertEqual(raw["descriptors"][0]["descriptor_kind"], "template identity")
        raw["required_descriptor_kinds"].remove("template identity")
        retained_slots = copy.deepcopy(raw["descriptors"][1:])
        del raw["descriptors"][0]
        raw_before = copy.deepcopy(raw)
        required_kinds = copy.deepcopy(raw["required_descriptor_kinds"])
        other_rows = [row for row in MISSING_KINDS if row[0] != "template identity"]
        self.assertEqual(required_kinds, [row[0] for row in other_rows])

        validated = _validate(raw)
        validated_before = copy.deepcopy(validated)
        walk = evaluate_descriptor_definition_walk({"validated": validated})

        comparison = walk["evaluation"]["comparison"]
        self.assertEqual(comparison["producer_symbol"], PRODUCER)
        self.assertEqual(comparison["input_binding"], raw["binding"])
        self.assertEqual(raw["required_descriptor_kinds"], required_kinds)
        self.assertEqual(
            validated["input"]["required_descriptor_kinds"], required_kinds
        )
        self.assertEqual(raw["descriptors"], retained_slots)
        self.assertEqual(validated["input"]["descriptors"], retained_slots)
        self.assertEqual(comparison["findings"], [])
        self.assertFalse(
            any(
                row["axis"].startswith("template identity")
                for row in comparison["axes"]
            )
        )

        assessments = walk["evaluation"]["assessments"]
        origins = walk["native_material"]["judgment_origins"]
        self.assertFalse(
            any(
                row["key"]["descriptor_kind"] == "template identity"
                for row in assessments
            )
        )
        self.assertFalse(
            any(
                row["assessment_key"]["descriptor_kind"] == "template identity"
                for row in origins
            )
        )
        self.assertFalse(
            any(row["branch"] == "required_slot_absent" for row in origins)
        )

        # The other 14 raw slots still exist. Their primary definition results
        # are source_unresolved/unknown, not missing-slot events.
        self.assertCountEqual(
            [slot["descriptor_kind"] for slot in retained_slots], required_kinds
        )
        self.assertEqual(len(retained_slots), 14)
        for slot_index, slot in enumerate(retained_slots):
            kind = slot["descriptor_kind"]
            axis_name = f"{kind}.definition"
            slot_locator = f"/descriptors/{slot_index}"
            axis_positions = [
                i
                for i, row in enumerate(comparison["axes"])
                if row["axis"] == axis_name and row["state"] == "unknown"
            ]
            self.assertEqual(len(axis_positions), len(slot["facts"]))
            matching_assessments = [
                row
                for row in assessments
                if row["axis_name"] == axis_name
                and row["key"]["descriptor_kind"] == kind
                and row["key"]["slot_identity"]
                == {
                    "presence": "supplied",
                    "value": slot["slot_identity"],
                }
            ]
            self.assertEqual(len(matching_assessments), len(slot["facts"]))
            for fact_index, _fact in enumerate(slot["facts"]):
                fact_locator = f"{slot_locator}/facts/{fact_index}"
                fact_assessments = [
                    row
                    for row in matching_assessments
                    if row["fact_locators"] == [fact_locator]
                ]
                self.assertEqual(len(fact_assessments), 1)
                assessment = fact_assessments[0]
                self.assertEqual(len(assessment["comparison_axis_indices"]), 1)
                axis_index = assessment["comparison_axis_indices"][0]
                axis = comparison["axes"][axis_index]
                self.assertEqual(assessment["state"], "unknown")
                self.assertEqual(assessment["origin_branch"], "source_unresolved")
                self.assertEqual(assessment["slot_locators"], [slot_locator])
                self.assertEqual(assessment["comparison_finding_indices"], [])
                self.assertEqual(assessment["original_axes"], [axis])
                self.assertEqual(axis["state"], "unknown")
                self.assertEqual(axis["axis"], axis_name)

                matching_origins = [
                    row
                    for row in origins
                    if row["axis_name"] == axis_name
                    and row["assessment_key"] == assessment["key"]
                    and row["fact_locators"] == [fact_locator]
                    and row["branch"] == "source_unresolved"
                ]
                self.assertEqual(len(matching_origins), 1)
                origin = matching_origins[0]
                self.assertEqual(origin["state"], "unknown")
                self.assertEqual(origin["slot_locators"], [slot_locator])
                self.assertEqual(origin["fact_locators"], [fact_locator])

        # The raw owner declaration still resolves the retained Claim address,
        # but the absent/non-required input slot stays absent from the match.
        self.assertEqual(len(walk["target_reads"]), 1)
        target = walk["target_reads"][0]
        self.assertEqual(target["claim"], raw["claims"][0])
        self.assertEqual(target["state"], "resolved")
        self.assertEqual(target["matches"][0]["slot_locators"], [])
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)

    def test_valid_non_fill_claim_preserves_definition_after_fn0(self):
        """A fact-subject non-fill Claim preserves the original definition walk."""
        raw = descriptor_claim_input("positive")
        claim = raw["claims"][0]
        claim["kind"] = "project_obligation_discharge"
        claim["proposed_value"] = True
        self.assertEqual(
            set(claim),
            {
                "subject_ref",
                "binding",
                "actor",
                "kind",
                "proposed_value",
                "basis_refs",
            },
        )
        raw_before = copy.deepcopy(raw)
        validated = _validate(raw)
        validated_before = copy.deepcopy(validated)

        control_raw = copy.deepcopy(raw)
        control_raw["claims"] = []
        control_walk = evaluate_descriptor_definition_walk(
            {"validated": _validate(control_raw)}
        )
        try:
            walk = evaluate_descriptor_definition_walk({"validated": validated})
            self.assertEqual(walk, control_walk)
            self.assertEqual(walk["target_reads"], [])
            self.assertEqual(walk["intent_reads"], [])
        finally:
            self.assertEqual(raw, raw_before)
            self.assertEqual(validated, validated_before)


if __name__ == "__main__":
    unittest.main()
