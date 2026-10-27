"""Mixed usable/unusable source qualification for one Claim basis Ref.

The input is passed through real FN0, the canonical G2a walk, and the public
ClaimUse builder. Expectations follow L5 consumer/basis_resolution and
basis_class_precedence/known_unusable_mixed; no validated result is fabricated.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definitions import validate_supply_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_target_frame import build_descriptor_claim_uses
from identity_input_fixtures import _append_qualified_source


class TestDescriptorClaimUseMixedQualification(unittest.TestCase):
    def test_unusable_join_does_not_turn_mixed_nonsemantic_basis_into_empty(self):
        raw = descriptor_claim_input("positive")
        usable_source_index = 1
        unusable_source_index = len(raw["sources"])
        usable_source = raw["sources"][usable_source_index]
        usable_source["role"] = "derived_view"

        # A second physical source has the same identity/revision/scope/owner,
        # but its distinct, independently qualified body gives it a distinct
        # digest. The basis Ref below omits only that optional digest, so both
        # source occurrences correspond to the same original basis occurrence.
        duplicate_content = copy.deepcopy(usable_source["content"])
        duplicate_content["synthetic_body_variant"] = "unusable duplicate"
        unusable_source = _append_qualified_source(
            raw,
            identity=usable_source["ref"]["identity"],
            owner=usable_source["ref"]["owner"],
            scope=copy.deepcopy(usable_source["ref"]["scope"]),
            content=duplicate_content,
            qualification_identity="SYNTHETIC-G2B-MIXED-QUALIFICATION",
            root_identity="SYNTHETIC-G2B-MIXED-ROOT",
            revision=usable_source["ref"]["revision"],
        )
        unusable_source["role"] = "derived_view"
        unusable_source["content_bytes"] += " "

        basis_ref = copy.deepcopy(usable_source["ref"])
        basis_ref["sha256"] = None
        raw["claims"][0]["basis_refs"] = [basis_ref]

        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsInstance(validated["input"], dict)
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [
            {
                "locator": f"/sources/{unusable_source_index}",
                "reason": "source bytes/body/digest or independent qualification is unresolved.",
                "source_ref": copy.deepcopy(unusable_source["ref"]),
            },
        ])
        self.assertNotIn(usable_source["ref"], validated["unusable_source_refs"])
        self.assertIn(unusable_source["ref"], validated["unusable_source_refs"])
        self.assertNotIn(raw["sources"][0]["ref"], validated["unusable_source_refs"])

        validated_before = copy.deepcopy(validated)
        walk = evaluate_descriptor_definition_walk({"validated": validated})
        walk_before = copy.deepcopy(walk)
        uses = build_descriptor_claim_uses(
            validated,
            walk["evaluation"],
            walk["target_reads"],
            walk["intent_reads"],
        )

        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(walk, walk_before)
        self.assertEqual(len(uses), 1)
        use = uses[0]
        self.assertEqual(use["target_read"]["state"], "resolved")
        self.assertEqual(use["basis_source_indices"], [usable_source_index, unusable_source_index])
        self.assertEqual(use["unresolved_basis_ref_indices"], [0])
        self.assertEqual(use["basis_class"], "unresolved")


if __name__ == "__main__":
    unittest.main()
