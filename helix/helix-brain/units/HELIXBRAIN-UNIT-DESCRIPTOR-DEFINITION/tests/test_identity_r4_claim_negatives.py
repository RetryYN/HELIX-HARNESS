"""R4 identity-claim branch negatives derived from the existing L4/L5 contract."""

from __future__ import annotations

import copy
import unittest

from descriptor_definitions import compare_identity_versions_and_trace, validate_supply_input
from identity_input_fixtures import normal_input
from test_identity_filename_claim import _filename_identity_claim_input


FN3_BACKFLOW = "HELIXBRAIN-L6-032-FN3-IDENTITY"


class TestIdentityR4ClaimNegatives(unittest.TestCase):
    def _call(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"])
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        validated_before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        return result

    def _fn0_ok_stop(self, raw, branch_id):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"], "malformed claim branch must pass fn0 decode")
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        validated_before = copy.deepcopy(validated)
        with self.assertRaises(NotImplementedError) as caught:
            compare_identity_versions_and_trace({"validated": validated})
        message = str(caught.exception)
        self.assertIn(f"F04/N01/unclosed/identity_claim/{branch_id}", message)
        self.assertIn(FN3_BACKFLOW, message)
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)

    def test_non_object_claim_has_its_own_stop_id(self):
        raw = normal_input()
        raw["claims"] = [17]
        self._fn0_ok_stop(raw, "claim_not_object")

    def test_r66_non_array_basis_refs_have_one_exact_stop(self):
        for malformed in (None, {"basis": "not an array"}):
            with self.subTest(value_type=type(malformed).__name__):
                raw, _source_a, _source_b, claim, _template_a, _template_b = _filename_identity_claim_input()
                claim["basis_refs"] = copy.deepcopy(malformed)
                self._fn0_ok_stop(raw, "filename_basis_refs_type")

    def test_r66_same_filename_claim_false_does_not_join_distinct_candidates(self):
        raw, source_a, source_b, claim, template_a, template_b = _filename_identity_claim_input()
        claim["proposed_value"]["same_filename"] = False
        self.assertEqual(source_a["ref"]["source_locator"], source_b["ref"]["source_locator"])
        self.assertNotEqual(template_a["identity"], template_b["identity"])

        result = self._call(raw)

        self.assertFalse(any(row["code"] == "filename_identity_join" for row in result["findings"]))
        self.assertFalse(any(row["axis"] == "identity_claim" for row in result["axes"]))


if __name__ == "__main__":
    unittest.main()
