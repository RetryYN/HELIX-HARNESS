"""G2b ClaimUse routing for an owner address without a raw slot.

This draft ends at DescriptorClaimUse. It intentionally does not call FN6 or
assert a public tuple/prefix. Inputs use real FN0 and the same-call canonical
FN1 walk; expectations follow L4 target/intent rules and L5 consumer/support
predicates, not a constructed Comparison or the implementation result.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_target_frame import build_descriptor_claim_uses
from descriptor_definitions import validate_supply_input


_ROUTES = {
    "reference": ("reference_only_only", "rule87"),
    "empty": ("nonsemantic_or_empty", "none"),
    "semantic": ("semantic_or_mixed", "unresolved"),
    "absent": ("unresolved", "unresolved"),
}

_ROUTE_REASONS = {
    "rule87": "同呼出しの原targetに対応するdefinition missingとreference_only根拠が、既存rule87の全predicateを満たす。",
    "rule93": "同呼出しの原targetに対応する限定meaning_undefinedと独立定義根拠のないfallbackが、既存rule93の全predicateを満たす。rule87は成立しない。",
    "none": "既存rule87及びrule93のpredicateに明確に該当しない。原target・意図・各定義状態は同呼出し観測へ保持する。",
    "unresolved": "既存rule87又はrule93の判定に必要な原target・意図・根拠対応が未確定である。元不成立を成功又は意味未定義へ変換しない。",
}


def _raw(basis: str) -> dict:
    raw = descriptor_claim_input("positive")
    # Keep the owner declaration and Claim while removing the original input
    # slot. Its root-required assessment is therefore a real no-slot event.
    del raw["descriptors"][0]
    raw["sources"][1]["role"] = "reference_only"
    if basis == "reference":
        ref = raw["sources"][1]["ref"]
        raw["claims"][0]["basis_refs"] = [copy.deepcopy(ref), copy.deepcopy(ref)]
    elif basis == "empty":
        raw["claims"][0]["basis_refs"] = []
    elif basis == "semantic":
        raw["claims"][0]["basis_refs"] = [copy.deepcopy(raw["sources"][0]["ref"])]
    elif basis == "absent":
        raw["claims"][0].pop("basis_refs", None)
    else:
        raise ValueError(f"unsupported draft basis case: {basis}")
    return raw


class TestDescriptorMissingClaimRoutes(unittest.TestCase):
    def test_no_slot_assessment_keeps_original_binding_and_routes_by_actual_basis(self):
        """The matched target may relate only to the actual absent-slot assessment."""
        for basis, (expected_class, expected_route) in _ROUTES.items():
            with self.subTest(basis=basis):
                raw = _raw(basis)
                raw_before = copy.deepcopy(raw)
                validated = validate_supply_input(raw)
                self.assertEqual(validated["input"], raw_before)
                self.assertEqual(validated["input_issues"], [])
                self.assertEqual(validated["unusable_source_refs"], [])
                validated_before = copy.deepcopy(validated)

                walk = evaluate_descriptor_definition_walk({"validated": validated})
                walk_before = copy.deepcopy(walk)
                uses = build_descriptor_claim_uses(
                    validated,
                    walk["evaluation"],
                    walk["target_reads"],
                    walk["intent_reads"],
                )

                self.assertEqual(len(uses), 1)
                use = uses[0]
                self.assertEqual(set(use), {
                    "claim_locator", "claim", "target_read", "intent_read",
                    "assessment_indices", "unmatched_match_indices", "basis_source_indices",
                    "unresolved_basis_ref_indices", "basis_class", "missing_support_indices",
                    "undefined_support_indices", "route", "route_reason",
                    "primary_definition_assessment_indices",
                })
                claim = raw["claims"][0]
                self.assertEqual(use["claim_locator"], "/claims/0")
                self.assertEqual(use["claim"], claim)
                self.assertEqual(use["target_read"], walk["target_reads"][0])
                self.assertEqual(use["intent_read"], walk["intent_reads"][0])
                self.assertEqual(use["target_read"]["state"], "resolved")
                self.assertEqual(use["target_read"]["matches"][0]["slot_locators"], [])
                self.assertEqual(use["unmatched_match_indices"], [])

                # Root's first approved kind has an original required-slot-absent
                # assessment at index zero; its logical owner is knowledge_owner.
                self.assertEqual(use["assessment_indices"], [0])
                self.assertEqual(use["primary_definition_assessment_indices"], [0])
                self.assertEqual(use["missing_support_indices"], [0])
                self.assertEqual(use["undefined_support_indices"], [])
                assessment = walk["evaluation"]["assessments"][0]
                self.assertEqual(assessment["origin_branch"], "required_slot_absent")
                self.assertEqual(assessment["state"], "missing")
                self.assertEqual(assessment["key"]["binding"], {
                    "presence": "supplied", "value": raw["binding"],
                })
                self.assertEqual(assessment["key"]["slot_identity"], {"presence": "absent"})
                self.assertEqual(assessment["key"]["descriptor_kind"], "template identity")
                self.assertEqual(assessment["axis_name"], "template identity.definition")
                self.assertEqual(use["basis_class"], expected_class)
                self.assertEqual(use["route"], expected_route)
                self.assertEqual(use["route_reason"], _ROUTE_REASONS[expected_route])

                self.assertEqual(raw, raw_before)
                self.assertEqual(validated, validated_before)
                self.assertEqual(walk, walk_before)


if __name__ == "__main__":
    unittest.main()
