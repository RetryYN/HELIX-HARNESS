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

    def test_partial_owner_source_binding_is_supplied_and_unresolved(self):
        from test_descriptor_target_cohorts import _rewrite_source_body_and_links

        raw = descriptor_claim_input("positive")
        source = raw["sources"][0]
        source_index = next(
            index for index, candidate in enumerate(raw["sources"])
            if candidate is source
        )
        content = copy.deepcopy(source["content"])
        partial_binding = content["binding"]
        partial_binding.pop("knowledge_ref")
        source_ref = _rewrite_source_body_and_links(raw, source_index, content)
        raw_before = copy.deepcopy(raw)
        declaration = copy.deepcopy(source["content"]["descriptor_targets"][0])

        validated = validate_supply_input(raw)
        self.assertIsInstance(
            validated["input"], dict,
            "setup: FN0 must qualify the synchronized source with its supplied partial Binding",
        )
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["unusable_source_refs"], [])
        validated_before = copy.deepcopy(validated)

        actual = read_descriptor_replacement_target(
            validated, raw["claims"][0], "/claims/0"
        )

        self.assertEqual(raw, raw_before, "target reading must not mutate the raw snapshot")
        self.assertEqual(validated, validated_before, "target reading must not mutate FN0 output")
        self.assertEqual(actual["state"], "unknown")
        self.assertEqual(actual["matches"], [])
        self.assertEqual(actual["occurrences"], [{
            "source_ref": {"presence": "supplied", "value": source_ref},
            "source_locator": f"/sources/{source_index}",
            "declaration_locator": f"/sources/{source_index}/content/descriptor_targets/0",
            "declaration": declaration,
            "source_binding": {"presence": "supplied", "value": partial_binding},
        }])
        self.assertEqual(actual["problems"], [{
            "kind": "binding_unresolved",
            "locator": f"/sources/{source_index}/content/binding",
            "reason": "owner原target宣言のfull Bindingを原Claim.bindingへ比較できない。原値を保持する。",
            "source_ref": {"presence": "supplied", "value": source_ref},
        }])

    def test_partial_binding_with_known_difference_does_not_block_exact_cohort(self):
        from test_descriptor_target_cohorts import _rewrite_source_body_and_links

        raw = descriptor_claim_input("positive")
        current_source = raw["sources"][0]
        other_source = raw["sources"][3]
        other_index = next(
            index for index, source in enumerate(raw["sources"])
            if source is other_source
        )
        content = copy.deepcopy(other_source["content"])
        # This existing physical source has no binding. Supply the original root
        # Binding explicitly before making a known, local difference.
        content["binding"] = copy.deepcopy(raw["binding"])
        content["binding"].pop("knowledge_ref")
        original_artifact_version = content["binding"]["pack_artifact_version"]
        self.assertIsInstance(original_artifact_version, str)
        content["binding"]["pack_artifact_version"] = original_artifact_version + "-different"
        content["descriptor_targets"] = [copy.deepcopy(
            current_source["content"]["descriptor_targets"][0]
        )]
        other_source_ref = _rewrite_source_body_and_links(raw, other_index, content)
        knowledge_ref = raw["claims"][0]["binding"]["knowledge_ref"]
        matching_records = [
            record for record in raw["knowledge_records"]
            if record.get("ref") == knowledge_ref
        ]
        self.assertEqual(len(matching_records), 1)
        matching_records[0]["provenance_refs"].append(copy.deepcopy(other_source_ref))
        partial_binding = copy.deepcopy(other_source["content"]["binding"])
        current_source_ref = copy.deepcopy(current_source["ref"])
        raw_before = copy.deepcopy(raw)

        validated = validate_supply_input(raw)
        self.assertIsInstance(
            validated["input"], dict,
            "setup: FN0 must qualify both synchronized sources; do not synthesize ValidatedSupply",
        )
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["unusable_source_refs"], [])
        validated_before = copy.deepcopy(validated)

        actual = read_descriptor_replacement_target(
            validated, raw["claims"][0], "/claims/0"
        )

        self.assertEqual(raw, raw_before, "target reading must not mutate the raw snapshot")
        self.assertEqual(validated, validated_before, "target reading must not mutate FN0 output")
        self.assertEqual(actual["state"], "resolved")
        self.assertEqual(len(actual["matches"]), 1)
        self.assertEqual(actual["matches"][0]["source_refs"], [current_source_ref])
        self.assertEqual(actual["matches"][0]["declaration_locators"], [
            "/sources/0/content/descriptor_targets/0",
        ])
        self.assertEqual(
            [row["source_locator"] for row in actual["occurrences"]],
            ["/sources/0", f"/sources/{other_index}"],
        )
        self.assertEqual(actual["occurrences"][1]["source_binding"], {
            "presence": "supplied",
            "value": partial_binding,
        })
        self.assertEqual(actual["problems"], [{
            "kind": "binding_conflict",
            "locator": f"/sources/{other_index}/content/binding",
            "reason": "owner原target宣言のfull Bindingと原Claim.bindingが既知に異なる。原scopeを保持する。",
            "source_ref": {"presence": "supplied", "value": other_source_ref},
        }])


if __name__ == "__main__":
    unittest.main()
