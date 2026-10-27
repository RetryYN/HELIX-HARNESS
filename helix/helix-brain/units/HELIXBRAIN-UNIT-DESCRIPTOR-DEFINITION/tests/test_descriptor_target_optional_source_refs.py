"""Optional Ref members are not new descriptor-target join gates.

Independent expectation follows L4
``/dependency_semantic_ports/descriptor_target_contract/ordered_branches/5``
and ``return_field_mapping``: Ref comparison uses identity/revision/scope/owner,
compares digests only when both are supplied, and preserves each original Ref.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definitions import validate_supply_input
from descriptor_target_reader import read_descriptor_replacement_target


class TestDescriptorTargetOptionalSourceRefs(unittest.TestCase):
    def test_partial_claim_knowledge_ref_still_joins_original_qualified_owner(self):
        raw = descriptor_claim_input("positive")
        owner_source = raw["sources"][0]
        source_index = next(
            index for index, source in enumerate(raw["sources"])
            if source is owner_source
        )
        original_owner_binding = copy.deepcopy(owner_source["content"]["binding"])
        original_source_ref = copy.deepcopy(owner_source["ref"])
        claim_knowledge_ref = raw["claims"][0]["binding"]["knowledge_ref"]
        claim_knowledge_ref.pop("source_locator")
        claim_knowledge_ref.pop("sha256")
        partial_claim_ref = copy.deepcopy(claim_knowledge_ref)
        raw_before = copy.deepcopy(raw)

        validated = validate_supply_input(raw)
        self.assertIsInstance(
            validated["input"], dict,
            "setup: FN0 must retain the raw Claim snapshot; no ValidatedSupply is synthesized",
        )
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["unusable_source_refs"], [])
        validated_before = copy.deepcopy(validated)

        actual = read_descriptor_replacement_target(
            validated, raw["claims"][0], "/claims/0"
        )

        self.assertEqual(raw, raw_before, "target reading must not mutate the original Claim")
        self.assertEqual(validated, validated_before, "target reading must not mutate FN0 output")
        self.assertEqual(actual["claim"], raw["claims"][0])
        self.assertEqual(
            actual["claim"]["binding"]["knowledge_ref"],
            partial_claim_ref,
            "the original partial Ref remains in the Claim read",
        )
        self.assertEqual(actual["state"], "resolved")
        self.assertEqual(actual["problems"], [])
        self.assertEqual(len(actual["matches"]), 1)
        match = actual["matches"][0]
        self.assertEqual(match["target_ref"], raw["claims"][0]["subject_ref"])
        self.assertEqual(
            match["binding"], original_owner_binding,
            "the match keeps the owner source's original full Binding, not a repaired Claim Binding",
        )
        self.assertEqual(match["source_refs"], [original_source_ref])
        self.assertEqual(match["declaration_locators"], [
            f"/sources/{source_index}/content/descriptor_targets/0",
        ])
        self.assertEqual(len(actual["occurrences"]), 1)
        self.assertEqual(actual["occurrences"][0]["source_ref"], {
            "presence": "supplied",
            "value": original_source_ref,
        })


if __name__ == "__main__":
    unittest.main()
