"""L5 rule87/none routing from actual missing definition producers.

FN0, canonical walk and the ClaimUse constructor are real calls. FN6 uses
the public FN1 output for its context; no Comparison or frame is fabricated.
"""
from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_target_frame import build_descriptor_claim_uses
from descriptor_definitions import (
    compare_dependencies_and_handoff, compare_descriptor_definitions, validate_supply_input,
)


def _raw(basis, claim_count=1):
    raw = descriptor_claim_input("positive")
    del raw["descriptors"][0]
    raw["sources"][1]["role"] = "reference_only"
    if basis == "reference":
        ref = raw["sources"][1]["ref"]
        raw["claims"][0]["basis_refs"] = [copy.deepcopy(ref), copy.deepcopy(ref)]
    elif basis == "semantic":
        raw["claims"][0]["basis_refs"] = [copy.deepcopy(raw["sources"][0]["ref"])]
    elif basis == "absent":
        del raw["claims"][0]["basis_refs"]
    for _ in range(claim_count - 1):
        raw["claims"].append(copy.deepcopy(raw["claims"][0]))
    return raw


def _validated(raw):
    validated = validate_supply_input(raw)
    if validated["input"] != raw or validated["input_issues"] or validated["unusable_source_refs"]:
        raise AssertionError("setup: original raw must be clean and preserved by FN0")
    return validated


class TestDescriptorMissingClaimRoutes(unittest.TestCase):
    def test_no_slot_assessment_keeps_original_binding_and_routes_by_actual_basis(self):
        expected_routes = {
            "reference": ("reference_only_only", "rule87"),
            "empty": ("nonsemantic_or_empty", "none"),
            "semantic": ("semantic_or_mixed", "unresolved"),
            "absent": ("unresolved", "unresolved"),
        }
        for basis, (basis_class, route) in expected_routes.items():
            with self.subTest(basis=basis):
                raw = _raw(basis)
                validated = _validated(raw)
                before = copy.deepcopy(validated)
                walk = evaluate_descriptor_definition_walk({"validated": validated})
                walk_before = copy.deepcopy(walk)
                uses = build_descriptor_claim_uses(
                    validated, walk["evaluation"], walk["target_reads"], walk["intent_reads"]
                )
                self.assertEqual(len(uses), 1)
                use = uses[0]
                self.assertEqual(use["target_read"]["state"], "resolved")
                self.assertEqual(use["target_read"]["matches"][0]["slot_locators"], [])
                self.assertEqual(use["unmatched_match_indices"], [])
                # The absent template identity event is the first canonical-kind event.
                self.assertEqual(use["assessment_indices"], [0])
                self.assertEqual(use["primary_definition_assessment_indices"], [0])
                self.assertEqual(use["missing_support_indices"], [0])
                self.assertEqual(use["undefined_support_indices"], [])
                self.assertEqual(use["basis_class"], basis_class)
                self.assertEqual(use["route"], route)
                self.assertEqual(validated, before)
                self.assertEqual(walk, walk_before)

    def test_fn6_emits_one_rule87_tuple_per_original_claim_after_unchanged_prefix(self):
        raw = _raw("reference", claim_count=2)
        baseline = copy.deepcopy(raw)
        baseline["claims"] = []
        baseline_v = _validated(baseline)
        prefix = compare_dependencies_and_handoff({
            "validated": baseline_v,
            "definitions": compare_descriptor_definitions({"validated": baseline_v}),
        })
        validated = _validated(raw)
        context = {
            "validated": validated,
            "definitions": compare_descriptor_definitions({"validated": validated}),
        }
        before = copy.deepcopy(context)
        result = compare_dependencies_and_handoff(context)
        expected_axes, expected_findings = [], []
        for index, claim in enumerate(raw["claims"]):
            reason = (
                f"Claim /claims/{index} は、元targetの意味定義missingをreference_only資料で置換する主張である。"
                f"原missingを保持し、全支持記録は同呼出し観測/frame/claim_uses/{index}に残す。"
            )
            common = {
                "subject_ref": claim["subject_ref"], "binding": claim["binding"],
                "axis": "descriptor.definition", "state": "missing",
                "reason": reason, "backflow_owner": "knowledge_owner",
            }
            expected_axes.append({**common, "original_refs": claim["basis_refs"]})
            expected_findings.append({
                "code": "reference_as_required_definition",
                "rule_ref": "HELIXBRAIN-L5-032-R-reference_as_required_definition",
                **common, "source_refs": claim["basis_refs"],
            })
        self.assertEqual(result["axes"], prefix["axes"] + expected_axes)
        self.assertEqual(result["findings"], prefix["findings"] + expected_findings)
        self.assertEqual(result["producer_symbol"], "compare_dependencies_and_handoff")
        self.assertEqual(result["input_binding"], raw["binding"])
        self.assertEqual(context, before)


if __name__ == "__main__":
    unittest.main()
