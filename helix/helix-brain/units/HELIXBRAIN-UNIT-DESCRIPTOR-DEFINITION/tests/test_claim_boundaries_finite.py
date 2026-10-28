"""FN7 finite none/unresolved/rule87 routes from real same-call producers.

Expectations are read from the L4 finite-domain/route projection and the L5
ClaimUse/public-output contracts. FN0, FN1-FN6, the definition walk and ClaimUse
builder are called on the same raw input. No Comparison/frame is fabricated.
"""

from __future__ import annotations

import copy
import unittest

from claim_boundary_input_fixtures import finite_claim_input
from descriptor_definitions import (
    compare_claim_boundaries,
    compare_dependencies_and_handoff,
    compare_descriptor_definitions,
    compare_identity_versions_and_trace,
    compare_knowledge_promotion,
    compare_oracle_and_view_boundary,
    compare_values_and_applicability,
    validate_supply_input,
)
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_target_frame import build_descriptor_claim_uses


ROUTE_REASON = {
    "none": "既存rule87及びrule93のpredicateに明確に該当しない。原target・意図・各定義状態は同呼出し観測へ保持する。",
    "unresolved": "既存rule87又はrule93の判定に必要な原target・意図・根拠対応が未確定である。元不成立を成功又は意味未定義へ変換しない。",
    "rule87": "同呼出しの原targetに対応するdefinition missingとreference_only根拠が、既存rule87の全predicateを満たす。",
}
FN6_RULE87 = "HELIXBRAIN-L5-032-R-reference_as_required_definition"


def _actual_same_call(raw):
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    if validated["input"] != raw_before:
        raise AssertionError("FN0 must preserve the original raw snapshot")
    if validated["input_issues"] != [] or validated["unusable_source_refs"] != []:
        raise AssertionError("setup requires a FN0-clean finite-domain input")
    validated_before = copy.deepcopy(validated)

    definitions = compare_descriptor_definitions({"validated": validated})
    values = compare_values_and_applicability(
        {
            "validated": validated,
            "definitions": definitions,
        }
    )
    identity = compare_identity_versions_and_trace({"validated": validated})
    oracle = compare_oracle_and_view_boundary(
        {
            "validated": validated,
            "definitions": definitions,
            "identity_trace": identity,
        }
    )
    promotion = compare_knowledge_promotion({"validated": validated})
    dependencies = compare_dependencies_and_handoff(
        {
            "validated": validated,
            "definitions": definitions,
        }
    )
    comparisons = {
        "definitions": definitions,
        "values_applicability": values,
        "identity_trace": identity,
        "oracle_view": oracle,
        "promotion": promotion,
        "dependencies_handoff": dependencies,
    }
    comparisons_before = copy.deepcopy(comparisons)

    walk = evaluate_descriptor_definition_walk({"validated": validated})
    walk_before = copy.deepcopy(walk)
    uses = build_descriptor_claim_uses(
        validated,
        walk["evaluation"],
        walk["target_reads"],
        walk["intent_reads"],
    )
    uses_before = copy.deepcopy(uses)
    context = {
        "validated": validated,
        **comparisons,
    }
    context_before = copy.deepcopy(context)
    if raw != raw_before:
        raise AssertionError("FN0-FN6 or same-call reads mutated raw input")
    if validated != validated_before:
        raise AssertionError("FN0-FN6 or same-call reads mutated ValidatedSupply")
    if walk != walk_before or uses != uses_before:
        raise AssertionError("ClaimUse construction mutated its same-call walk")
    if context != context_before:
        raise AssertionError("same-call context changed before FN7")
    return {
        "raw": raw,
        "raw_before": raw_before,
        "validated": validated,
        "validated_before": validated_before,
        "comparisons": comparisons,
        "comparisons_before": comparisons_before,
        "walk": walk,
        "walk_before": walk_before,
        "uses": uses,
        "uses_before": uses_before,
        "context": context,
        "context_before": context_before,
    }


def _assert_fn7_projection(testcase, call):
    try:
        result = compare_claim_boundaries(call["context"])
    finally:
        testcase.assertEqual(call["raw"], call["raw_before"])
        testcase.assertEqual(call["validated"], call["validated_before"])
        testcase.assertEqual(call["comparisons"], call["comparisons_before"])
        testcase.assertEqual(call["walk"], call["walk_before"])
        testcase.assertEqual(call["uses"], call["uses_before"])
        testcase.assertEqual(call["context"], call["context_before"])
    expected_binding = call["validated"]["input"]["binding"]
    testcase.assertEqual(
        set(result),
        {"axes", "findings", "producer_symbol", "input_binding"},
    )
    testcase.assertEqual(result["axes"], [])
    testcase.assertEqual(result["findings"], [])
    testcase.assertEqual(result["producer_symbol"], "compare_claim_boundaries")
    testcase.assertEqual(result["input_binding"], expected_binding)

    return result


class TestClaimBoundariesFiniteRoutes(unittest.TestCase):
    def _assert_all_required_definitions_remain_missing(self, call):
        raw = call["validated"]["input"]
        rows = call["comparisons"]["definitions"]["axes"]
        expected = {f"{kind}.definition" for kind in raw["required_descriptor_kinds"]}
        missing = {row["axis"] for row in rows if row["state"] == "missing"}
        self.assertTrue(expected <= missing)

    def test_none_route_keeps_null_and_string_claim_occurrences(self):
        """A supplied null is positive intent; repeated target reads stay in Claim order."""
        raw = finite_claim_input("none", proposed_values=(None, "proposed label"))
        call = _actual_same_call(raw)
        self._assert_all_required_definitions_remain_missing(call)

        self.assertEqual(
            [use["claim_locator"] for use in call["uses"]],
            ["/claims/0", "/claims/1"],
        )
        self.assertEqual(
            [use["claim"] for use in call["uses"]],
            raw["claims"],
        )
        self.assertEqual(
            [use["route"] for use in call["uses"]],
            ["none", "none"],
        )
        self.assertTrue(
            all(
                use["route_reason"] == ROUTE_REASON["none"]
                and use["intent_read"]["intent"] == "positive"
                and use["target_read"]["state"] == "resolved"
                for use in call["uses"]
            )
        )
        self.assertEqual(len(call["walk"]["target_reads"]), 2)
        self.assertEqual(len(call["walk"]["intent_reads"]), 2)
        _assert_fn7_projection(self, call)

    def test_unresolved_route_keeps_conflicting_target_and_each_claim(self):
        """A declared same-slot kind conflict stays unresolved; neither claim is discarded."""
        raw = finite_claim_input("unresolved", proposed_values=(None, None))
        call = _actual_same_call(raw)
        self._assert_all_required_definitions_remain_missing(call)

        self.assertEqual(
            [use["claim_locator"] for use in call["uses"]],
            ["/claims/0", "/claims/1"],
        )
        self.assertEqual([use["claim"] for use in call["uses"]], raw["claims"])
        self.assertEqual(
            [use["route"] for use in call["uses"]],
            ["unresolved", "unresolved"],
        )
        self.assertTrue(
            all(
                use["route_reason"] == ROUTE_REASON["unresolved"]
                and use["intent_read"]["intent"] == "positive"
                and use["target_read"]["state"] == "conflict"
                for use in call["uses"]
            )
        )
        self.assertTrue(all(use["assessment_indices"] == [] for use in call["uses"]))
        self.assertEqual(len(call["walk"]["target_reads"]), 2)
        _assert_fn7_projection(self, call)

    def test_rule87_route_remains_owned_by_fn6_without_fn7_duplicate(self):
        """FN6 emits its one original rule87 finding; FN7 keeps its empty prefix rows."""
        raw = finite_claim_input("rule87", proposed_values=(None,))
        call = _actual_same_call(raw)
        self._assert_all_required_definitions_remain_missing(call)

        use = call["uses"][0]
        self.assertEqual(use["claim_locator"], "/claims/0")
        self.assertEqual(use["claim"], raw["claims"][0])
        self.assertEqual(use["target_read"]["state"], "resolved")
        self.assertEqual(use["intent_read"]["intent"], "positive")
        self.assertEqual(use["basis_class"], "reference_only_only")
        ref_source_indices = [
            source_index
            for basis_ref in raw["claims"][0]["basis_refs"]
            for source_index, source in enumerate(raw["sources"])
            if source.get("ref") == basis_ref
        ]
        self.assertEqual(use["basis_source_indices"], ref_source_indices)
        self.assertEqual(use["route"], "rule87")
        self.assertEqual(use["route_reason"], ROUTE_REASON["rule87"])

        fn6_rule87 = [
            finding
            for finding in call["comparisons"]["dependencies_handoff"]["findings"]
            if finding.get("rule_ref") == FN6_RULE87
        ]
        self.assertEqual(len(fn6_rule87), 1)
        self.assertEqual(fn6_rule87[0]["source_refs"], raw["claims"][0]["basis_refs"])
        _assert_fn7_projection(self, call)


if __name__ == "__main__":
    unittest.main()
