"""Draft FN6 rule87 occurrence test; kept separate from the frozen G2b ClaimUse test.

Expectation follows L4 claim_routes and L5 failure_rule 87/output mapping. Calls use
real FN0, public FN1, and public FN6; no Comparison or frame is constructed by hand.
"""
from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definitions import (
    compare_dependencies_and_handoff, compare_descriptor_definitions, validate_supply_input,
)


def _raw_reference_claims(count=2):
    raw = descriptor_claim_input("positive")
    del raw["descriptors"][0]
    raw["sources"][1]["role"] = "reference_only"
    ref = raw["sources"][1]["ref"]
    raw["claims"][0]["basis_refs"] = [copy.deepcopy(ref), copy.deepcopy(ref)]
    for _ in range(count - 1):
        raw["claims"].append(copy.deepcopy(raw["claims"][0]))
    return raw


def _validated(raw):
    validated = validate_supply_input(raw)
    if validated["input"] != raw or validated["input_issues"] or validated["unusable_source_refs"]:
        raise AssertionError("setup: original raw must be clean and preserved by FN0")
    return validated


class TestDescriptorFn6Rule87Occurrences(unittest.TestCase):
    def test_fn6_emits_one_rule87_tuple_per_original_claim_after_unchanged_prefix(self):
        raw = _raw_reference_claims(count=2)
        raw_before = copy.deepcopy(raw)
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
        context_before = copy.deepcopy(context)
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
        self.assertEqual(set(result), {"axes", "findings", "producer_symbol", "input_binding"})
        self.assertEqual(result["producer_symbol"], "compare_dependencies_and_handoff")
        self.assertEqual(result["input_binding"], raw["binding"])
        self.assertEqual(raw, raw_before)
        self.assertEqual(context, context_before)


if __name__ == "__main__":
    unittest.main()
