"""Same-call descriptor Claim reads and preservation at the FN1 walk boundary.

Raw inputs come from ``descriptor_claim_input`` and are validated through the
public FN0 entry. Expectations are derived from L4
``/dependency_semantic_ports/descriptor_target_contract`` and
``/dependency_semantic_ports/claim_intent_protocol/rules`` plus L5
``/source_return_contract/descriptor_target_dataflow``. No target reader or
private frame is used as an oracle.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definitions import validate_supply_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_claim_input_fixtures import descriptor_claim_input


WALK_FIELDS = {"evaluation", "native_material", "target_reads", "intent_reads"}
NATIVE_FIELDS = {
    "meaning_reads",
    "applicability_reads",
    "special_reads",
    "judgment_origins",
    "pair_reads",
    "applicability_judgment_batches",
    "meaning_read_origins",
}
TARGET_READ_FIELDS = {
    "claim_locator",
    "claim",
    "candidate_indices",
    "candidate_refs",
    "occurrences",
    "matches",
    "state",
    "problems",
}
TARGET_OCCURRENCE_FIELDS = {
    "source_ref",
    "source_locator",
    "declaration_locator",
    "declaration",
    "source_binding",
}
TARGET_MATCH_FIELDS = {
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
INTENT_READ_FIELDS = {
    "claim_locator",
    "claim",
    "kind",
    "proposed_value",
    "intent",
    "reason",
}


def _walk(raw):
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    if validated["input"] is None or validated["input_issues"] or validated["unusable_source_refs"]:
        raise AssertionError("setup: FN0 must accept this qualified fixture")
    if validated["input"] != raw_before:
        raise AssertionError("setup: FN0 must retain the raw input value")
    validated_before = copy.deepcopy(validated)
    try:
        result = evaluate_descriptor_definition_walk({"validated": validated})
    finally:
        if raw != raw_before:
            raise AssertionError("walk mutated the caller raw input")
        if validated != validated_before:
            raise AssertionError("walk mutated the validated snapshot")
    return result


def _without_claim_occurrences(raw):
    baseline = copy.deepcopy(raw)
    baseline["claims"] = []
    return baseline


def _expected_positive_occurrence(raw, declaration_index):
    source = raw["sources"][0]
    return {
        "source_ref": {"presence": "supplied", "value": copy.deepcopy(source["ref"])},
        "source_locator": "/sources/0",
        "declaration_locator": f"/sources/0/content/descriptor_targets/{declaration_index}",
        "declaration": copy.deepcopy(source["content"]["descriptor_targets"][declaration_index]),
        "source_binding": {"presence": "supplied", "value": copy.deepcopy(source["content"]["binding"])},
    }


class TestDescriptorClaimWalk(unittest.TestCase):
    def _assert_read_shapes(self, result):
        self.assertEqual(len(result["target_reads"]), len(result["intent_reads"]))
        for target in result["target_reads"]:
            self.assertEqual(set(target), TARGET_READ_FIELDS)
            self.assertTrue(all(set(row) == TARGET_OCCURRENCE_FIELDS for row in target["occurrences"]))
            self.assertTrue(all(set(row) == TARGET_MATCH_FIELDS for row in target["matches"]))
        for intent in result["intent_reads"]:
            self.assertEqual(set(intent), INTENT_READ_FIELDS)

    def _assert_original_fn1_payload_preserved(self, raw, result):
        """L4 target/intent reads do not rewrite the existing FN1 evaluation."""
        baseline = _walk(_without_claim_occurrences(raw))
        self.assertEqual(set(result), WALK_FIELDS)
        self.assertEqual(set(result["native_material"]), NATIVE_FIELDS)
        self.assertEqual(result["evaluation"], baseline["evaluation"])
        self.assertEqual(result["native_material"], baseline["native_material"])

    def test_positive_explicit_null_claim_reads_target_and_intent_once(self):
        """A supplied null replacement is positive intent and remains raw data."""
        raw = descriptor_claim_input("positive")
        raw_before = copy.deepcopy(raw)
        result = _walk(raw)
        self._assert_read_shapes(result)
        claim = raw["claims"][0]

        self._assert_original_fn1_payload_preserved(raw, result)
        self.assertEqual(raw, raw_before)
        self.assertEqual(len(result["target_reads"]), 1)
        self.assertEqual(len(result["intent_reads"]), 1)

        target = result["target_reads"][0]
        self.assertEqual(set(target), TARGET_READ_FIELDS)
        self.assertEqual(target["claim_locator"], "/claims/0")
        self.assertEqual(target["claim"], claim)
        self.assertEqual(target["candidate_indices"], [0])
        self.assertEqual(target["candidate_refs"], raw["candidates"])
        self.assertEqual(target["state"], "resolved")
        self.assertEqual(target["problems"], [])
        self.assertEqual(len(target["occurrences"]), 1)
        occurrence = target["occurrences"][0]
        self.assertEqual(set(occurrence), TARGET_OCCURRENCE_FIELDS)
        self.assertEqual(occurrence, _expected_positive_occurrence(raw, 0))

        self.assertEqual(len(target["matches"]), 1)
        match = target["matches"][0]
        self.assertEqual(set(match), TARGET_MATCH_FIELDS)
        declaration = raw["sources"][0]["content"]["descriptor_targets"][0]
        self.assertEqual(match["target_ref"], declaration["target_ref"])
        self.assertEqual(match["binding"], raw["binding"])
        self.assertEqual(match["slot_identity"], declaration["slot_identity"])
        self.assertEqual(match["descriptor_kind"], declaration["descriptor_kind"])
        self.assertEqual(match["source_refs"], [raw["sources"][0]["ref"]])
        self.assertEqual(match["declaration_locators"], ["/sources/0/content/descriptor_targets/0"])
        self.assertEqual(match["slot_locators"], ["/descriptors/0"])
        self.assertEqual(match["candidate_indices"], [0])
        self.assertEqual(match["candidate_refs"], raw["candidates"])

        intent = result["intent_reads"][0]
        self.assertEqual(set(intent), INTENT_READ_FIELDS)
        self.assertEqual(intent["claim_locator"], "/claims/0")
        self.assertEqual(intent["claim"], claim)
        self.assertEqual(intent["kind"], {"presence": "supplied", "value": "fill_definition"})
        self.assertEqual(intent["proposed_value"], {"presence": "supplied", "value": None})
        self.assertEqual(intent["intent"], "positive")
        self.assertEqual(intent["reason"], "供給済みRawValueをnullも含めreplacement内容として保持する。")

    def test_distinct_target_slots_remain_unknown_without_partial_match(self):
        """Two owner slots for one target do not collapse to the first address."""
        raw = descriptor_claim_input("distinct_slot")
        raw_before = copy.deepcopy(raw)
        result = _walk(raw)
        self._assert_read_shapes(result)
        self._assert_original_fn1_payload_preserved(raw, result)
        self.assertEqual(raw, raw_before)

        target = result["target_reads"][0]
        declarations = raw["sources"][0]["content"]["descriptor_targets"]
        self.assertEqual(target["claim_locator"], "/claims/0")
        self.assertEqual(target["state"], "unknown")
        self.assertEqual(target["matches"], [])
        self.assertEqual(
            [occurrence["declaration"] for occurrence in target["occurrences"]],
            declarations,
        )
        self.assertTrue(any(problem["kind"] == "target_ambiguous" for problem in target["problems"]))

    def test_unrelated_target_declaration_does_not_block_exact_claim_target(self):
        """A declaration for another identity remains an occurrence, not a blocker."""
        raw = descriptor_claim_input("unrelated_target")
        raw_before = copy.deepcopy(raw)
        result = _walk(raw)
        self._assert_read_shapes(result)
        self._assert_original_fn1_payload_preserved(raw, result)
        self.assertEqual(raw, raw_before)

        target = result["target_reads"][0]
        declarations = raw["sources"][0]["content"]["descriptor_targets"]
        self.assertEqual(target["state"], "resolved")
        self.assertEqual(len(target["occurrences"]), len(declarations))
        self.assertEqual(
            [occurrence["declaration"] for occurrence in target["occurrences"]],
            declarations,
        )
        self.assertEqual(len(target["matches"]), 1)
        self.assertEqual(target["matches"][0]["target_ref"], raw["claims"][0]["subject_ref"])
        self.assertEqual(target["matches"][0]["slot_locators"], ["/descriptors/0"])

    def test_identical_claim_values_keep_each_original_locator_and_read(self):
        """Equal Claim values are separate source occurrences in source order."""
        raw = descriptor_claim_input("positive")
        raw["claims"].append(copy.deepcopy(raw["claims"][0]))
        raw_before = copy.deepcopy(raw)
        result = _walk(raw)
        self._assert_read_shapes(result)
        self._assert_original_fn1_payload_preserved(raw, result)
        self.assertEqual(raw, raw_before)

        self.assertEqual([read["claim_locator"] for read in result["target_reads"]], ["/claims/0", "/claims/1"])
        self.assertEqual([read["claim"] for read in result["target_reads"]], raw["claims"])
        self.assertEqual([read["claim_locator"] for read in result["intent_reads"]], ["/claims/0", "/claims/1"])
        self.assertEqual([read["claim"] for read in result["intent_reads"]], raw["claims"])
        self.assertTrue(all(read["intent"] == "positive" for read in result["intent_reads"]))
        self.assertTrue(all(read["proposed_value"] == {"presence": "supplied", "value": None} for read in result["intent_reads"]))


if __name__ == "__main__":
    unittest.main()
