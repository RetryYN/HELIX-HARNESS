"""WR66 S4: retain non-fill fact-subject Claims outside FN1 definition reads.

L4 /definition_meaning_resolution_contract/consumer_branch_table/8 and
L5 /source_return_contract/descriptor_target_dataflow/definition_meaning_core/
event_and_field_contract/single_walk_algorithm_candidate/4 define the boundary.
No FN7 context, rule row, or borrowed Comparison is constructed here.
"""
from __future__ import annotations

import copy
import hashlib
import json
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definitions import compare_descriptor_definitions, validate_supply_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk


# Exact canonical raw snapshots from the existing 17-input manifest.
CASES = (
    ("I04", "product_template_adoption", "candidate_A",
     "3c9c91ff6f9bf3859b872f25dc2d587679750020054db0fef1f57281f5bf0700"),
    ("I06", "requirements_agreement", True,
     "68d0aa824c01a8bd203fd206c896e07f8c97b5c2f73ed93a61a2ffef615dc7d4"),
    ("I08", "design_completion", True,
     "02b27a6bba24e2003ab199af6f6dad013e36b8babfc342d4630b711e0f4e7016"),
    ("I10", "os_obligation_discharge", True,
     "c864b1a6940ad9516eaead4a00afdccc715708b551eda1dd7517584e33426ed1"),
)
NATIVE_FIELDS = {
    "meaning_reads", "applicability_reads", "special_reads", "judgment_origins",
    "pair_reads", "applicability_judgment_batches", "meaning_read_origins",
}


def _case_raw(testcase, case):
    _input_id, kind, proposed, expected_sha = case
    raw = descriptor_claim_input("positive")
    claim = raw["claims"][0]
    claim["kind"] = kind
    claim["proposed_value"] = (
        copy.deepcopy(raw["candidates"][0]) if proposed == "candidate_A" else proposed
    )
    encoded = json.dumps(raw, ensure_ascii=False, sort_keys=True,
                         separators=(",", ":"), allow_nan=False).encode("utf-8")
    testcase.assertEqual(hashlib.sha256(encoded).hexdigest(), expected_sha)
    testcase.assertEqual(claim["binding"], raw["binding"])
    testcase.assertTrue(any(
        fact["ref"] == claim["subject_ref"]
        for slot in raw["descriptors"] for fact in slot["facts"]
    ))
    return raw


def _call(testcase, raw, producer):
    before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    testcase.assertEqual(raw, before)
    testcase.assertEqual(validated["input"], before)
    testcase.assertEqual(validated["input_issues"], [])
    testcase.assertEqual(validated["unusable_source_refs"], [])
    validated_before = copy.deepcopy(validated)
    result, caught = None, None
    try:
        result = producer({"validated": validated})
    except Exception as error:
        caught = error
    finally:
        testcase.assertEqual(raw, before)
        testcase.assertEqual(validated, validated_before)
    testcase.assertIsNone(caught, f"unexpected FN1 stop: {caught!r}")
    return result


class TestNonfillFactSubject(unittest.TestCase):
    def test_public_fn1_retains_original_definition_results_for_four_saved_inputs(self):
        for case in CASES:
            with self.subTest(input_id=case[0]):
                raw = _case_raw(self, case)
                # Separate differential control only: never inserted in another call.
                control = copy.deepcopy(raw)
                control["claims"] = []
                expected = _call(self, control, compare_descriptor_definitions)
                actual = _call(self, raw, compare_descriptor_definitions)
                self.assertEqual(actual, expected)
                self.assertEqual(actual["producer_symbol"], "compare_descriptor_definitions")
                self.assertEqual(actual["input_binding"], raw["binding"])

    def test_walk_retains_all_definition_and_native_material_without_nonfill_reads(self):
        for case in CASES:
            with self.subTest(input_id=case[0]):
                raw = _case_raw(self, case)
                control = copy.deepcopy(raw)
                control["claims"] = []
                expected = _call(self, control, evaluate_descriptor_definition_walk)
                actual = _call(self, raw, evaluate_descriptor_definition_walk)
                self.assertEqual(set(actual), {
                    "evaluation", "native_material", "target_reads", "intent_reads",
                })
                self.assertEqual(set(actual["native_material"]), NATIVE_FIELDS)
                self.assertEqual(actual, expected)
                self.assertEqual(actual["target_reads"], [])
                self.assertEqual(actual["intent_reads"], [])

    def test_fill_and_mixed_controls_preserve_original_fill_read(self):
        fill_raw = descriptor_claim_input("positive")
        expected = _call(self, fill_raw, evaluate_descriptor_definition_walk)
        self.assertEqual(len(expected["target_reads"]), 1)
        self.assertEqual(len(expected["intent_reads"]), 1)
        mixed = copy.deepcopy(fill_raw)
        mixed["claims"].append(copy.deepcopy(_case_raw(self, CASES[0])["claims"][0]))
        actual = _call(self, mixed, evaluate_descriptor_definition_walk)
        self.assertEqual(actual, expected)
        self.assertEqual(actual["target_reads"][0]["claim_locator"], "/claims/0")
        self.assertEqual(actual["target_reads"][0]["claim"], mixed["claims"][0])
        self.assertEqual(actual["intent_reads"][0]["claim"], mixed["claims"][0])

    def test_named_harness_stop_preserves_raw_and_validated(self):
        raw = descriptor_claim_input("positive")
        raw["claims"][0]["kind"] = "harness_layer_pair_override"
        raw["claims"][0]["subject_ref"] = copy.deepcopy(raw["binding"]["template_ref"])
        before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input"], before)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["unusable_source_refs"], [])
        validated_before = copy.deepcopy(validated)
        for producer in (compare_descriptor_definitions, evaluate_descriptor_definition_walk):
            with self.subTest(producer=producer.__name__):
                caught = None
                try:
                    producer({"validated": validated})
                except Exception as error:
                    caught = error
                finally:
                    self.assertEqual(raw, before)
                    self.assertEqual(validated, validated_before)
                self.assertIsInstance(caught, NotImplementedError)
                self.assertEqual(str(caught),
                    "F01/harness_claim_unimplemented: claims[0] is a "
                    "harness_layer_pair_override claim; Backflow HELIXBRAIN-L6-032-N03-PATH")


if __name__ == "__main__":
    unittest.main()
