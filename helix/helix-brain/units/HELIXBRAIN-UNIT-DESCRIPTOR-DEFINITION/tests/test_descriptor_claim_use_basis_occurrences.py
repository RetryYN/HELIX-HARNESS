"""L5 consumer.basis_resolution retains every joined physical source index."""

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import validate_supply_input
from descriptor_target_frame import build_descriptor_claim_uses


class TestDescriptorClaimUseBasisOccurrences(unittest.TestCase):
    def test_repeated_basis_retains_all_equal_physical_sources_in_original_order(self):
        raw = descriptor_claim_input("positive")
        source = raw["sources"][1]
        source["role"] = "reference_only"
        duplicate_index = len(raw["sources"])
        raw["sources"].append(copy.deepcopy(source))
        raw["claims"][0]["basis_refs"] = [copy.deepcopy(source["ref"])] * 2
        before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input"], before)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["unusable_source_refs"], [])
        validated_before = copy.deepcopy(validated)
        walk = evaluate_descriptor_definition_walk({"validated": validated})
        walk_before = copy.deepcopy(walk)
        uses = build_descriptor_claim_uses(
            validated, walk["evaluation"], walk["target_reads"], walk["intent_reads"]
        )
        self.assertEqual(len(uses), 1)
        self.assertEqual(uses[0]["basis_source_indices"], [1, duplicate_index, 1, duplicate_index])
        self.assertEqual(uses[0]["basis_class"], "reference_only_only")
        self.assertEqual(uses[0]["unresolved_basis_ref_indices"], [])
        self.assertEqual(uses[0]["target_read"], walk["target_reads"][0])
        self.assertEqual(uses[0]["intent_read"], walk["intent_reads"][0])
        self.assertEqual(uses[0]["missing_support_indices"], [])
        self.assertEqual(uses[0]["undefined_support_indices"], [])
        self.assertEqual(uses[0]["route"], "none")
        self.assertEqual(raw, before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(walk, walk_before)
