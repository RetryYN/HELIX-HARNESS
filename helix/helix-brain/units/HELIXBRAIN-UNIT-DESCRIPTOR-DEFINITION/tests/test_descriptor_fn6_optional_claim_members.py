"""FN6 preserves optional Claim-member absence without a new rule tuple.

L4 Claim intent and L5 consumer/route contracts independently determine the
expected ClaimUse: missing proposed_value yields unresolved intent; missing
basis_refs stays unresolved basis. In this fixture the real primary support is
source_unresolved (neither missing nor meaning_undefined), so the latter routes
none before basis classification. Public FN6 must preserve its same-input prefix.
"""
from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import compare_descriptor_definitions, validate_supply_input
from descriptor_target_frame import build_descriptor_claim_uses
from test_descriptor_fill_dependencies_connection import _call


RULE87 = "HELIXBRAIN-L5-032-R-reference_as_required_definition"
RULE93 = "HELIXBRAIN-L5-032-R-unknown_fallback"


class TestDescriptorFn6OptionalClaimMembers(unittest.TestCase):
    def test_absent_proposed_value_and_basis_refs_keep_prefix_without_rule_tuple(self):
        cases = (
            ("proposed_value", "unresolved", "unresolved"),
            ("basis_refs", "positive", "none"),
        )
        for omitted_member, expected_intent, expected_route in cases:
            with self.subTest(omitted_member=omitted_member):
                raw = descriptor_claim_input("positive")
                self.assertEqual(len(raw["claims"]), 1)
                self.assertEqual(raw["claims"][0]["kind"], "fill_definition")
                raw["claims"][0].pop(omitted_member)
                raw_before = copy.deepcopy(raw)
                self.assertNotIn(omitted_member, raw["claims"][0])

                # Derive the route expectation through real FN0→FN1→walk inputs;
                # FN6 below independently exercises its public same-call wrapper.
                validated = validate_supply_input(raw)
                self.assertEqual(validated["input"], raw_before)
                self.assertEqual(validated["input_issues"], [])
                self.assertEqual(validated["unusable_source_refs"], [])
                definitions = compare_descriptor_definitions({"validated": validated})
                validated_before = copy.deepcopy(validated)
                definitions_before = copy.deepcopy(definitions)
                walk = evaluate_descriptor_definition_walk({"validated": validated})
                walk_before = copy.deepcopy(walk)
                uses = build_descriptor_claim_uses(
                    validated, walk["evaluation"], walk["target_reads"], walk["intent_reads"]
                )
                self.assertEqual(validated, validated_before)
                self.assertEqual(definitions, definitions_before)
                self.assertEqual(walk, walk_before)
                self.assertEqual(len(uses), 1)
                self.assertEqual(walk["intent_reads"][0]["intent"], expected_intent)
                self.assertEqual(uses[0]["route"], expected_route)
                if omitted_member == "basis_refs":
                    primary = uses[0]["primary_definition_assessment_indices"]
                    assessments = walk["evaluation"]["assessments"]
                    self.assertTrue(primary)
                    self.assertTrue(all(assessments[i]["state"] == "unknown" for i in primary))
                    self.assertTrue(all(
                        assessments[i]["origin_branch"] == "source_unresolved" for i in primary
                    ))
                    self.assertEqual(uses[0]["basis_class"], "unresolved")
                    self.assertEqual(uses[0]["missing_support_indices"], [])
                    self.assertEqual(uses[0]["undefined_support_indices"], [])

                baseline_raw = copy.deepcopy(raw)
                baseline_raw["claims"] = []
                prefix = _call(baseline_raw)
                result = _call(raw)

                self.assertEqual(set(result), {"axes", "findings", "producer_symbol", "input_binding"})
                self.assertEqual(result["producer_symbol"], "compare_dependencies_and_handoff")
                self.assertEqual(result["input_binding"], raw["binding"])
                self.assertEqual(result["axes"], prefix["axes"])
                self.assertEqual(result["findings"], prefix["findings"])
                self.assertNotIn(RULE87, [finding.get("rule_ref") for finding in result["findings"]])
                self.assertNotIn(RULE93, [finding.get("rule_ref") for finding in result["findings"]])
                self.assertNotIn(omitted_member, raw["claims"][0])
                self.assertEqual(raw, raw_before)


if __name__ == "__main__":
    unittest.main()
