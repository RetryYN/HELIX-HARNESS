"""Occurrence-preserving DescriptorClaimUse reads from one real FN0 walk."""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definitions import validate_supply_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_target_frame import build_descriptor_claim_uses
from identity_input_fixtures import _same_ref_without_digest, _write_source_content


USE_FIELDS = {
    "claim_locator",
    "claim",
    "target_read",
    "intent_read",
    "assessment_indices",
    "unmatched_match_indices",
    "basis_source_indices",
    "unresolved_basis_ref_indices",
    "basis_class",
    "missing_support_indices",
    "undefined_support_indices",
    "route",
    "route_reason",
    "primary_definition_assessment_indices",
}


def _rewrite_source(raw, source_index, content):
    source = raw["sources"][source_index]
    old_ref = copy.deepcopy(source["ref"])
    _write_source_content(raw, source, content)
    new_ref = copy.deepcopy(source["ref"])
    for record in raw.get("knowledge_records", []):
        record["provenance_refs"] = [
            copy.deepcopy(new_ref)
            if _same_ref_without_digest(ref, old_ref)
            else copy.deepcopy(ref)
            for ref in record.get("provenance_refs", [])
        ]
    for slot in raw.get("descriptors", []):
        for fact in slot.get("facts", []):
            if _same_ref_without_digest(fact.get("source_ref"), old_ref):
                fact["source_ref"] = copy.deepcopy(new_ref)


def _walk_and_build(raw, *, expected_input_issue_sources=()):
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    if validated["input"] is None or validated["input"] != raw_before:
        raise AssertionError("setup: FN0 must decode and preserve the raw snapshot")
    issue_sources = [issue["source_ref"] for issue in validated["input_issues"]]
    if issue_sources != list(expected_input_issue_sources):
        raise AssertionError(
            "setup: FN0 qualification issues must match the constructed source state"
        )
    validated_before = copy.deepcopy(validated)
    walk = evaluate_descriptor_definition_walk({"validated": validated})
    walk_before = copy.deepcopy(walk)
    uses = build_descriptor_claim_uses(
        validated,
        walk["evaluation"],
        walk["target_reads"],
        walk["intent_reads"],
    )
    for index, use in enumerate(uses):
        if use["target_read"] != walk["target_reads"][index]:
            raise AssertionError(
                "each use must preserve its same-call target read in full"
            )
        if use["intent_read"] != walk["intent_reads"][index]:
            raise AssertionError(
                "each use must preserve its same-call intent read in full"
            )
    if raw != raw_before or validated != validated_before or walk != walk_before:
        raise AssertionError(
            "walk/use construction must preserve raw, v, and same-walk outputs"
        )
    return validated, walk, uses


def _expected_related_indices(raw, evaluation, slot_index=0):
    """Apply L5 assessment lookup in original evaluation order for a real slot match."""
    slot = raw["descriptors"][slot_index]
    indices = []
    for index, assessment in enumerate(evaluation["assessments"]):
        key = assessment["key"]
        binding = key["binding"]
        slot_identity = key["slot_identity"]
        if (
            key["descriptor_kind"] == slot["descriptor_kind"]
            and binding == {"presence": "supplied", "value": slot["binding"]}
            and slot_identity
            == {"presence": "supplied", "value": slot["slot_identity"]}
            and f"/descriptors/{slot_index}" in assessment["slot_locators"]
        ):
            indices.append(index)
    return indices


def _expected_primary_indices(evaluation, related):
    return [
        index
        for index in related
        if evaluation["assessments"][index]["axis_name"]
        == evaluation["assessments"][index]["key"]["descriptor_kind"] + ".definition"
    ]


class TestDescriptorClaimUseOccurrences(unittest.TestCase):
    def test_same_ref_with_optional_locator_difference_keeps_two_matches_but_one_assessment_occurrence(
        self,
    ):
        """Two raw Ref values remain two matches; their shared E assessment is indexed once."""
        raw = descriptor_claim_input("positive")
        source = raw["sources"][0]
        content = copy.deepcopy(source["content"])
        first = content["descriptor_targets"][0]
        second = copy.deepcopy(first)
        second["target_ref"]["source_locator"] = "/owner/another-original-location"
        content["descriptor_targets"].append(second)
        _rewrite_source(raw, 0, content)

        _validated, walk, uses = _walk_and_build(raw)
        self.assertEqual(len(walk["target_reads"]), 1)
        target = walk["target_reads"][0]
        self.assertEqual(target["state"], "resolved")
        self.assertEqual(len(target["matches"]), 2)
        self.assertNotEqual(
            target["matches"][0]["target_ref"], target["matches"][1]["target_ref"]
        )
        self.assertEqual(uses[0]["target_read"], target)
        self.assertEqual(set(uses[0]), USE_FIELDS)

        expected_related = _expected_related_indices(raw, walk["evaluation"])
        expected_primary = _expected_primary_indices(
            walk["evaluation"], expected_related
        )
        self.assertTrue(expected_related)
        self.assertEqual(uses[0]["assessment_indices"], expected_related)
        self.assertEqual(len(uses[0]["assessment_indices"]), len(set(expected_related)))
        self.assertEqual(
            uses[0]["primary_definition_assessment_indices"], expected_primary
        )
        self.assertEqual(uses[0]["unmatched_match_indices"], [])

    def test_owner_target_slot_absent_from_input_keeps_match_unmatched(self):
        """A resolved address without its declared slot borrows no same-kind slot state."""
        raw = descriptor_claim_input("positive")
        source = raw["sources"][0]
        content = copy.deepcopy(source["content"])
        content["descriptor_targets"][0]["slot_identity"] = (
            "owner-declared-slot-not-in-input"
        )
        _rewrite_source(raw, 0, content)

        _validated, walk, uses = _walk_and_build(raw)
        target = walk["target_reads"][0]
        use = uses[0]
        self.assertEqual(target["state"], "resolved")
        self.assertEqual(target["matches"][0]["slot_locators"], [])
        self.assertEqual(use["unmatched_match_indices"], [0])
        self.assertEqual(use["assessment_indices"], [])
        self.assertEqual(use["primary_definition_assessment_indices"], [])
        self.assertEqual(use["missing_support_indices"], [])
        self.assertEqual(use["route"], "unresolved")
        kind = raw["descriptors"][0]["descriptor_kind"]
        self.assertFalse(
            any(
                row["key"]["descriptor_kind"] == kind
                and row["key"]["binding"]
                == {"presence": "supplied", "value": raw["binding"]}
                and row["key"]["slot_identity"] == {"presence": "absent"}
                and row["slot_locators"] == []
                for row in walk["evaluation"]["assessments"]
            )
        )

    def test_absent_proposed_value_keeps_raw_presence_and_unresolved_intent(self):
        """FN0 retains a Claim with proposed_value absent; intent reader does not default it."""
        raw = descriptor_claim_input("positive")
        raw["claims"][0].pop("proposed_value")

        _validated, walk, uses = _walk_and_build(raw)
        intent = walk["intent_reads"][0]
        use = uses[0]
        self.assertEqual(intent["claim"], raw["claims"][0])
        self.assertEqual(intent["proposed_value"], {"presence": "absent"})
        self.assertEqual(intent["intent"], "unresolved")
        self.assertEqual(use["intent_read"], intent)
        self.assertEqual(use["route"], "unresolved")

    def test_basis_role_and_repetition_preserve_every_source_index(self):
        """Qualified source roles remain distinct and basis/source occurrence order repeats."""
        cases = (
            ("reference_only", [1, 1], "reference_only_only", []),
            ("derived_view", [1], "nonsemantic_or_empty", []),
            ("explanation", [1], "nonsemantic_or_empty", []),
            ("semantic_json", [0], "semantic_or_mixed", []),
        )
        for role, basis_source_indices, expected_class, unresolved_indices in cases:
            with self.subTest(role=role):
                raw = descriptor_claim_input("positive")
                source = raw["sources"][1]
                source["role"] = role
                raw["claims"][0]["basis_refs"] = (
                    [copy.deepcopy(source["ref"]), copy.deepcopy(source["ref"])]
                    if role == "reference_only"
                    else [copy.deepcopy(raw["sources"][0]["ref"])]
                    if role == "semantic_json"
                    else [copy.deepcopy(source["ref"])]
                )
                validated, _walk, uses = _walk_and_build(raw)
                self.assertEqual(validated["input_issues"], [])
                self.assertEqual(validated["unusable_source_refs"], [])
                self.assertEqual(uses[0]["basis_source_indices"], basis_source_indices)
                self.assertEqual(uses[0]["basis_class"], expected_class)
                self.assertEqual(
                    uses[0]["unresolved_basis_ref_indices"], unresolved_indices
                )

    def test_unusable_basis_source_is_unresolved_without_disqualifying_owner_source(
        self,
    ):
        """A source with failed FN0 qualification stays unresolved, not semantic basis success."""
        raw = descriptor_claim_input("positive")
        basis_source = raw["sources"][1]
        basis_source["role"] = "semantic_json"
        raw["claims"][0]["basis_refs"] = [copy.deepcopy(basis_source["ref"])]
        basis_source["content_bytes"] += " "
        expected_issue_ref = copy.deepcopy(basis_source["ref"])

        validated, _walk, uses = _walk_and_build(
            raw,
            expected_input_issue_sources=[expected_issue_ref],
        )
        owner_ref = raw["sources"][0]["ref"]
        self.assertNotIn(owner_ref, validated["unusable_source_refs"])
        self.assertEqual(uses[0]["target_read"]["state"], "resolved")
        self.assertTrue(uses[0]["target_read"]["matches"])
        self.assertEqual(uses[0]["basis_source_indices"], [1])
        self.assertEqual(uses[0]["unresolved_basis_ref_indices"], [0])
        self.assertEqual(uses[0]["basis_class"], "unresolved")
        self.assertNotEqual(uses[0]["basis_class"], "semantic_or_mixed")


if __name__ == "__main__":
    unittest.main()
