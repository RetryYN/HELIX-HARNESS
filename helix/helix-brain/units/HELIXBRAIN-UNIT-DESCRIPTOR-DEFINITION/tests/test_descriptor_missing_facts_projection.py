"""L5 event_rules[1]: all missing-facts presences retain their public projection.

Expected fields come from the event/serializer contract and original Binding;
the walk's returned assessment is not used to invent the expected AxisResult.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import validate_supply_input


class TestDescriptorMissingFactsProjection(unittest.TestCase):
    def test_absent_null_empty_keep_axis_without_slot_missing_finding_and_exact_cause(
        self,
    ):
        for presence in ("absent", "null", "empty"):
            with self.subTest(presence=presence):
                raw = descriptor_claim_input("positive")
                slot = raw["descriptors"][0]
                binding = copy.deepcopy(slot["binding"])
                if presence == "absent":
                    del slot["facts"]
                else:
                    slot["facts"] = None if presence == "null" else []
                before = copy.deepcopy(raw)
                validated = validate_supply_input(raw)
                self.assertEqual(validated["input"], before)
                self.assertEqual(validated["input_issues"], [])
                self.assertEqual(validated["unusable_source_refs"], [])
                validated_before = copy.deepcopy(validated)
                walk = evaluate_descriptor_definition_walk({"validated": validated})
                comparison = walk["evaluation"]["comparison"]
                expected_axis = {
                    "subject_ref": binding["knowledge_ref"],
                    "binding": binding,
                    "axis": "template identity.definition",
                    "state": "missing",
                    "original_refs": [],
                    "reason": "原descriptor slotの意味factsが不足している。元presenceと所在を保持する。",
                    "backflow_owner": binding["knowledge_ref"]["owner"],
                }
                positions = [
                    i
                    for i, axis in enumerate(comparison["axes"])
                    if axis["axis"] == "template identity.definition"
                ]
                self.assertEqual(len(positions), 1)
                self.assertEqual(comparison["axes"][positions[0]], expected_axis)
                self.assertFalse(
                    any(
                        finding["rule_ref"]
                        == "HELIXBRAIN-L5-032-R-descriptor_01_missing"
                        for finding in comparison["findings"]
                    )
                )
                rows = [
                    (i, row)
                    for i, row in enumerate(walk["evaluation"]["assessments"])
                    if row["origin_branch"] == "facts_missing"
                ]
                self.assertEqual(len(rows), 1)
                ordinal, assessment = rows[0]
                self.assertEqual(assessment["comparison_axis_indices"], positions)
                self.assertEqual(assessment["original_axes"], [expected_axis])
                self.assertEqual(assessment["comparison_finding_indices"], [])
                origin = walk["native_material"]["judgment_origins"][ordinal]
                self.assertEqual(origin["ordinal"], ordinal)
                self.assertEqual(origin["branch"], "facts_missing")
                self.assertEqual(origin["cause"], "facts_absent_or_null_or_empty")
                self.assertEqual(origin["finding_rule_indices"], [])
                self.assertEqual(origin["slot_locators"], ["/descriptors/0"])
                self.assertEqual(origin["fact_locators"], [])
                self.assertEqual(raw, before)
                self.assertEqual(validated, validated_before)


if __name__ == "__main__":
    unittest.main()
