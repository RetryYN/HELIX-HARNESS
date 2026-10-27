"""Same-snapshot descriptor target and Claim intent read projection.

Target expectations come from L4 ``descriptor_target_contract`` and intent
expectations from ``claim_intent_protocol``. Walk/native closure is limited to
the L5 ``DefinitionMeaningWalkResult`` and ``DefinitionNativeMaterial`` shapes.
The no-Claim comparison below is only a metamorphic check that existing FN1
evaluation/native data is unchanged; it is not an oracle for target or intent.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import validate_supply_input


_WALK_FIELDS = {"evaluation", "native_material", "target_reads", "intent_reads"}
_NATIVE_FIELDS = {
    "meaning_reads",
    "applicability_reads",
    "special_reads",
    "judgment_origins",
    "pair_reads",
    "applicability_judgment_batches",
    "meaning_read_origins",
}
_TARGET_READ_FIELDS = {
    "claim_locator",
    "claim",
    "candidate_indices",
    "candidate_refs",
    "occurrences",
    "matches",
    "state",
    "problems",
}
_TARGET_OCCURRENCE_FIELDS = {
    "source_ref",
    "source_locator",
    "declaration_locator",
    "declaration",
    "source_binding",
}
_TARGET_MATCH_FIELDS = {
    "target_ref",
    "binding",
    "slot_identity",
    "descriptor_kind",
    "source_refs",
    "declaration_locators",
    "slot_locators",
    "candidate_indices",
    "candidate_refs",
}
_INTENT_READ_FIELDS = {
    "claim_locator",
    "claim",
    "kind",
    "proposed_value",
    "intent",
    "reason",
}
_FILL_NULL_REASON = "供給済みRawValueをnullも含めreplacement内容として保持する。"
_TARGET_NOT_DECLARED_REASON = "原Claimが指すtargetの明示owner対応を当該原scopeに得られない。欠落definitionからtargetを推定しない。"


class TestDescriptorClaimWalk(unittest.TestCase):
    def _walk(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(
            validated["input"],
            "setup: FN0 must retain the raw claim/source snapshot; do not synthesize ValidatedSupply",
        )
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["unusable_source_refs"], [])
        validated_before = copy.deepcopy(validated)
        result = evaluate_descriptor_definition_walk({"validated": validated})
        self.assertEqual(raw, raw_before, "walk must not mutate caller raw input")
        self.assertEqual(validated, validated_before, "walk must not mutate FN0 output")
        self.assertEqual(set(result), _WALK_FIELDS)
        self.assertEqual(set(result["native_material"]), _NATIVE_FIELDS)
        self.assertEqual(len(result["target_reads"]), len(raw["claims"]))
        self.assertEqual(len(result["intent_reads"]), len(raw["claims"]))
        for target in result["target_reads"]:
            self.assertEqual(set(target), _TARGET_READ_FIELDS)
            self.assertTrue(all(
                set(occurrence) == _TARGET_OCCURRENCE_FIELDS
                for occurrence in target["occurrences"]
            ))
            self.assertTrue(all(
                set(match) == _TARGET_MATCH_FIELDS
                for match in target["matches"]
            ))
        for intent in result["intent_reads"]:
            self.assertEqual(set(intent), _INTENT_READ_FIELDS)
        return result

    def _assert_existing_evaluation_unchanged(self, raw, result):
        """No-Claim output is only the metamorphic baseline for preexisting data."""
        baseline_raw = copy.deepcopy(raw)
        baseline_raw["claims"] = []
        baseline = self._walk(baseline_raw)
        self.assertEqual(result["evaluation"], baseline["evaluation"])
        self.assertEqual(result["native_material"], baseline["native_material"])

    def test_fill_definition_with_explicit_null_keeps_supplied_intent_and_target(self):
        raw = descriptor_claim_input("positive")
        raw_before = copy.deepcopy(raw)

        result = self._walk(raw)
        self._assert_existing_evaluation_unchanged(raw, result)
        self.assertEqual(raw, raw_before)

        claim = raw["claims"][0]
        target = result["target_reads"][0]
        self.assertEqual(target["claim_locator"], "/claims/0")
        self.assertEqual(target["claim"], claim)
        self.assertEqual(target["state"], "resolved")
        self.assertEqual(target["problems"], [])
        self.assertEqual(len(target["matches"]), 1)
        declaration = raw["sources"][0]["content"]["descriptor_targets"][0]
        self.assertEqual(target["matches"][0]["target_ref"], declaration["target_ref"])
        self.assertEqual(target["matches"][0]["slot_identity"], declaration["slot_identity"])
        self.assertEqual(target["matches"][0]["descriptor_kind"], declaration["descriptor_kind"])
        self.assertEqual(target["matches"][0]["source_refs"], [raw["sources"][0]["ref"]])

        intent = result["intent_reads"][0]
        self.assertEqual(intent["claim_locator"], "/claims/0")
        self.assertEqual(intent["claim"], claim)
        self.assertEqual(intent["kind"], {"presence": "supplied", "value": "fill_definition"})
        self.assertEqual(intent["proposed_value"], {"presence": "supplied", "value": None})
        self.assertEqual(intent["intent"], "positive")
        self.assertEqual(intent["reason"], _FILL_NULL_REASON)

    def test_equal_claim_values_keep_distinct_original_locators_and_reads(self):
        raw = descriptor_claim_input("positive")
        raw["claims"].append(copy.deepcopy(raw["claims"][0]))
        raw_before = copy.deepcopy(raw)

        result = self._walk(raw)
        self._assert_existing_evaluation_unchanged(raw, result)
        self.assertEqual(raw, raw_before)

        self.assertEqual([row["claim_locator"] for row in result["target_reads"]], [
            "/claims/0", "/claims/1",
        ])
        self.assertEqual([row["claim"] for row in result["target_reads"]], raw["claims"])
        self.assertEqual([row["claim_locator"] for row in result["intent_reads"]], [
            "/claims/0", "/claims/1",
        ])
        self.assertEqual([row["claim"] for row in result["intent_reads"]], raw["claims"])
        self.assertTrue(all(row["intent"] == "positive" for row in result["intent_reads"]))
        self.assertTrue(all(
            row["proposed_value"] == {"presence": "supplied", "value": None}
            for row in result["intent_reads"]
        ))

    def test_unknown_target_does_not_block_an_independent_explicit_target(self):
        raw = descriptor_claim_input("positive")
        exact_claim = copy.deepcopy(raw["claims"][0])
        unknown_claim = copy.deepcopy(exact_claim)
        unknown_claim["subject_ref"]["identity"] += "-not-declared"
        raw["claims"] = [unknown_claim, exact_claim]
        raw_before = copy.deepcopy(raw)

        result = self._walk(raw)
        self._assert_existing_evaluation_unchanged(raw, result)
        self.assertEqual(raw, raw_before)

        self.assertEqual([row["claim_locator"] for row in result["target_reads"]], [
            "/claims/0", "/claims/1",
        ])
        unknown_read, exact_read = result["target_reads"]
        self.assertEqual(unknown_read["claim"], unknown_claim)
        self.assertEqual(unknown_read["state"], "unknown")
        self.assertEqual(unknown_read["matches"], [])
        self.assertEqual(unknown_read["problems"], [{
            "kind": "target_not_declared",
            "locator": "/sources/0/content/descriptor_targets",
            "reason": _TARGET_NOT_DECLARED_REASON,
            "source_ref": {"presence": "supplied", "value": raw["sources"][0]["ref"]},
        }])
        self.assertEqual(exact_read["claim"], exact_claim)
        self.assertEqual(exact_read["state"], "resolved")
        self.assertEqual(len(exact_read["matches"]), 1)
        self.assertEqual(exact_read["matches"][0]["target_ref"], exact_claim["subject_ref"])
        self.assertEqual([row["claim_locator"] for row in result["intent_reads"]], [
            "/claims/0", "/claims/1",
        ])
        self.assertTrue(all(row["intent"] == "positive" for row in result["intent_reads"]))


if __name__ == "__main__":
    unittest.main()
