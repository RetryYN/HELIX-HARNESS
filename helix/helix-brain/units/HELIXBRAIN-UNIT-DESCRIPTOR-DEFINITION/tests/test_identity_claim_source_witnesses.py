"""ClaimのGenericRefをSourceRefへ昇格せず、実sourceの原index順を保つ。"""

import copy
import unittest

from descriptor_definitions import compare_identity_versions_and_trace, validate_supply_input
from identity_input_fixtures import normal_input


class TestIdentityClaimSourceWitnesses(unittest.TestCase):
    def _claim(self, raw, basis):
        claim = {
            "actor": "BRAIN", "kind": "template_identity",
            "subject_ref": copy.deepcopy(raw["descriptors"][0]["facts"][0]["ref"]),
            "binding": copy.deepcopy(raw["binding"]),
            "proposed_value": {"basis_role": "image_only"},
            "basis_refs": copy.deepcopy(basis),
        }
        raw["claims"].append(claim)
        return claim

    def _call(self, raw, *, unusable=None):
        before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input"], before)
        self.assertEqual(validated["unusable_source_refs"], unusable or [])
        self.assertEqual(len(validated["input_issues"]), 1 if unusable else 0)
        validated_before = copy.deepcopy(validated)
        try:
            return compare_identity_versions_and_trace({"validated": validated})
        finally:
            self.assertEqual(raw, before)
            self.assertEqual(validated, validated_before)

    def test_generic_knowledge_or_qualification_basis_is_not_published_as_source(self):
        """L4 R64は原Claimをunknown Findingへ投影し、GenericRefをsource_refsにしない。"""
        for role in ("knowledge", "qualification"):
            with self.subTest(role=role):
                raw = normal_input()
                basis = raw["knowledge_records"][0]["ref"] if role == "knowledge" else raw["qualifications"][0]["ref"]
                claim = self._claim(raw, [basis])
                result = self._call(raw)
                rows = [r for r in result["findings"] if r["code"] == "image_identity_inference"]
                self.assertEqual(len(rows), 1)
                self.assertEqual(rows[0]["rule_ref"], "HELIXBRAIN-L5-032-R-image_identity_inference")
                self.assertEqual(rows[0]["subject_ref"], claim["subject_ref"])
                self.assertEqual(rows[0]["binding"], claim["binding"])
                self.assertEqual(rows[0]["state"], "unknown")
                self.assertEqual(rows[0]["source_refs"], [])

    def test_image_claim_source_witnesses_follow_source_indices_not_basis_order(self):
        raw = normal_input()
        expected = [copy.deepcopy(raw["sources"][0]["ref"]), copy.deepcopy(raw["sources"][1]["ref"])]
        claim = self._claim(raw, list(reversed(expected)))
        result = self._call(raw)
        rows = [r for r in result["findings"] if r["code"] == "image_identity_inference"]
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["subject_ref"], claim["subject_ref"])
        self.assertEqual(rows[0]["binding"], claim["binding"])
        self.assertEqual(rows[0]["state"], "unknown")
        self.assertEqual(rows[0]["source_refs"], expected)

    def test_unusable_source_can_be_a_raw_claim_witness_without_becoming_qualified(self):
        raw = normal_input()
        source = raw["sources"][0]
        qualification = next(q for q in raw["qualifications"] if q["ref"] == source["qualification_ref"])
        qualification["subject_sha256"] = "0" * 64
        original_ref = copy.deepcopy(source["ref"])
        self._claim(raw, [original_ref])
        result = self._call(raw, unusable=[original_ref])
        rows = [r for r in result["findings"] if r["code"] == "image_identity_inference"]
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["state"], "unknown")
        self.assertEqual(rows[0]["source_refs"], [original_ref])


if __name__ == "__main__":
    unittest.main()
