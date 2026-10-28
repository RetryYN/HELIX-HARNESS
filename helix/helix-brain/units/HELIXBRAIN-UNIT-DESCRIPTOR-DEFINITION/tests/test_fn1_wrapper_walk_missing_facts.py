"""Public FN1 projects the canonical walk's zero-fact branch.

Independent expectations:
- L4 /definition_meaning_resolution_contract/evaluation_populations and
  /consumer_branch_table distinguish required-slot absence from a supplied
  slot whose facts member is absent, null, or empty.
- L5 /source_return_contract/descriptor_target_dataflow/direct_wrappers/fn1,
  /definition_meaning_core/event_and_field_contract/event_rules, and
  /public_field_serializer specify the public Comparison projection.

The expected AxisResult is assembled from the original slot Binding and the
fixed L4/L5 branch; the canonical walk's own returned value is never used as
the expected public result.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definitions import compare_descriptor_definitions, validate_supply_input


class TestFN1WrapperWalkMissingFacts(unittest.TestCase):
    def test_absent_null_and_empty_facts_are_projected_by_public_fn1(self):
        stops = []
        for presence in ("absent", "null", "empty"):
            with self.subTest(presence=presence):
                raw = descriptor_claim_input("positive")
                slot = raw["descriptors"][0]
                binding = copy.deepcopy(slot["binding"])
                if presence == "absent":
                    del slot["facts"]
                else:
                    slot["facts"] = None if presence == "null" else []

                raw_before = copy.deepcopy(raw)
                validated = validate_supply_input(raw)
                self.assertEqual(validated["input"], raw_before)
                self.assertEqual(validated["input_issues"], [])
                self.assertEqual(validated["unusable_source_refs"], [])
                validated_before = copy.deepcopy(validated)

                try:
                    comparison = compare_descriptor_definitions(
                        {"validated": validated}
                    )
                except NotImplementedError as exc:
                    stops.append((presence, str(exc)))
                    self.assertEqual(raw, raw_before)
                    self.assertEqual(validated, validated_before)
                    continue

                expected_axis = {
                    "subject_ref": binding["knowledge_ref"],
                    "binding": binding,
                    "axis": "template identity.definition",
                    "state": "missing",
                    "original_refs": [],
                    "reason": "原descriptor slotの意味factsが不足している。元presenceと所在を保持する。",
                    "backflow_owner": binding["knowledge_ref"]["owner"],
                }
                self.assertEqual(
                    list(comparison),
                    ["axes", "findings", "producer_symbol", "input_binding"],
                )
                self.assertEqual(
                    comparison["producer_symbol"], "compare_descriptor_definitions"
                )
                self.assertEqual(comparison["input_binding"], raw_before["binding"])
                matching = [
                    axis
                    for axis in comparison["axes"]
                    if axis.get("axis") == "template identity.definition"
                ]
                self.assertEqual(matching, [expected_axis])
                self.assertFalse(
                    any(
                        finding.get("rule_ref")
                        == "HELIXBRAIN-L5-032-R-descriptor_01_missing"
                        for finding in comparison["findings"]
                    )
                )
                self.assertEqual(raw, raw_before)
                self.assertEqual(validated, validated_before)

        self.assertEqual(
            stops,
            [],
            "public FN1 must return the L4/L5 facts-missing event instead of stopping",
        )


if __name__ == "__main__":
    unittest.main()
