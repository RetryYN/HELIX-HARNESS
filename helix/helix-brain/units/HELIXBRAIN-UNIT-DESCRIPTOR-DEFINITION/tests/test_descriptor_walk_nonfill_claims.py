"""Tests for the FN7B canonical-walk nonfill boundary.

Independent expectation basis: L5
/source_return_contract/descriptor_target_dataflow/definition_meaning_core/event_and_field_contract/single_walk_algorithm_candidate/4
and /source_return_contract/descriptor_target_dataflow/consumer/reads. The walk reads the original
fill_definition Claim occurrences and does not require a target read for nonfill Claim occurrences.
These checks cover only read populations, original locators, and snapshot preservation. They do not
infer nonfill intent, target, ClaimUse, route, finding, or FN7 meaning.
"""

from __future__ import annotations

import copy
import hashlib
import json
import unittest

from claim_boundary_input_fixtures import finite_claim_input
from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import validate_supply_input


# Provenance only: manifest entry for the frozen F07-NEG-02 templateRef material,
# canonical JSON SHA-256. The test builds its own raw input from the existing helper.
_I05_F07_TEMPLATE_REF_CANONICAL_SHA256 = (
    "bcfcec04ae67e55dc87df2f24742d582e2f40e8b1254516c76438643aa15583a"
)


class TestDescriptorWalkNonfillClaims(unittest.TestCase):
    def _actual_walk(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(
            validated["input"],
            "setup: expected the real FN0 decoder to retain this raw fixture",
        )
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["unusable_source_refs"], [])
        validated_before = copy.deepcopy(validated)

        result = evaluate_descriptor_definition_walk({"validated": validated})

        self.assertEqual(raw, raw_before, "walk must not mutate raw input")
        self.assertEqual(validated, validated_before, "walk must not mutate FN0 output")
        self.assertEqual(
            validated["input"]["claims"],
            raw_before["claims"],
            "all original Claim occurrences remain in the full raw snapshot",
        )
        self.assertEqual(
            set(result),
            {"evaluation", "native_material", "target_reads", "intent_reads"},
        )
        return result

    @staticmethod
    def _with_nonfill_kind(raw, template_claim, kind, proposed_value):
        claim = copy.deepcopy(template_claim)
        claim["subject_ref"] = copy.deepcopy(raw["binding"]["template_ref"])
        claim["binding"] = copy.deepcopy(raw["binding"])
        claim["actor"] = "BRAIN"
        claim["kind"] = kind
        claim["proposed_value"] = copy.deepcopy(proposed_value)
        return claim

    @staticmethod
    def _canonical_sha256(raw):
        payload = json.dumps(
            raw, ensure_ascii=False, sort_keys=True, separators=(",", ":")
        ).encode("utf-8")
        return hashlib.sha256(payload).hexdigest()

    def test_i05_nonfill_only_claim_is_retained_without_target_or_intent_read(self):
        raw = descriptor_claim_input("positive")
        original_template = copy.deepcopy(raw["claims"][0])
        self.assertTrue(
            raw["candidates"], "setup: candidate-A resolves to an existing Ref"
        )
        claim = self._with_nonfill_kind(
            raw,
            original_template,
            "product_template_adoption",
            raw["candidates"][0],
        )
        claim["basis_refs"] = []
        raw["claims"] = [claim]
        raw_before = copy.deepcopy(raw)

        # This ties the input builder to the frozen raw-input provenance only;
        # no producer output or expected FN7 meaning is loaded from the manifest.
        self.assertEqual(
            self._canonical_sha256(raw), _I05_F07_TEMPLATE_REF_CANONICAL_SHA256
        )
        result = self._actual_walk(raw)

        self.assertEqual(raw, raw_before)
        self.assertEqual(raw["claims"], [claim])
        self.assertEqual(result["target_reads"], [])
        self.assertEqual(result["intent_reads"], [])

    def test_mixed_claims_read_fill_occurrences_by_original_locator_and_order(self):
        raw = finite_claim_input("none")
        fill = copy.deepcopy(raw["claims"][0])
        nonfill_before = self._with_nonfill_kind(
            raw, fill, "requirements_agreement", True
        )
        nonfill_after = self._with_nonfill_kind(raw, fill, "design_completion", True)
        raw["claims"] = [
            nonfill_before,
            copy.deepcopy(fill),
            nonfill_after,
            copy.deepcopy(fill),
        ]
        raw_before = copy.deepcopy(raw)

        result = self._actual_walk(raw)

        self.assertEqual(raw, raw_before)
        self.assertEqual(len(result["target_reads"]), 2)
        self.assertEqual(len(result["intent_reads"]), 2)
        expected_indices = [1, 3]
        self.assertEqual(
            [row["claim_locator"] for row in result["target_reads"]],
            [f"/claims/{index}" for index in expected_indices],
        )
        self.assertEqual(
            [row["claim_locator"] for row in result["intent_reads"]],
            [f"/claims/{index}" for index in expected_indices],
        )
        for target, intent, index in zip(
            result["target_reads"], result["intent_reads"], expected_indices
        ):
            original_claim = raw_before["claims"][index]
            self.assertEqual(target["claim"], original_claim)
            self.assertEqual(intent["claim"], original_claim)
            self.assertEqual(target["state"], "resolved")
            self.assertEqual(intent["intent"], "positive")
            self.assertEqual(
                target["matches"][0]["target_ref"], original_claim["subject_ref"]
            )

    def test_existing_fill_only_control_keeps_its_read_population(self):
        raw = descriptor_claim_input("positive")
        raw_before = copy.deepcopy(raw)
        claim = raw["claims"][0]

        result = self._actual_walk(raw)

        self.assertEqual(raw, raw_before)
        self.assertEqual(
            [row["claim_locator"] for row in result["target_reads"]], ["/claims/0"]
        )
        self.assertEqual(
            [row["claim_locator"] for row in result["intent_reads"]], ["/claims/0"]
        )
        target = result["target_reads"][0]
        self.assertEqual(target["claim"], claim)
        self.assertEqual(target["state"], "resolved")
        self.assertEqual(target["problems"], [])
        self.assertEqual(len(target["matches"]), 1)
        declaration = raw["sources"][0]["content"]["descriptor_targets"][0]
        self.assertEqual(target["matches"][0]["target_ref"], declaration["target_ref"])
        self.assertEqual(
            target["matches"][0]["slot_identity"], declaration["slot_identity"]
        )
        self.assertEqual(
            target["matches"][0]["descriptor_kind"], declaration["descriptor_kind"]
        )
        intent = result["intent_reads"][0]
        self.assertEqual(intent["claim"], claim)
        self.assertEqual(
            intent["kind"], {"presence": "supplied", "value": "fill_definition"}
        )
        self.assertEqual(
            intent["proposed_value"], {"presence": "supplied", "value": None}
        )
        self.assertEqual(intent["intent"], "positive")


if __name__ == "__main__":
    unittest.main()
