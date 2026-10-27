"""DescriptorClaimUse construction from one real FN0/FN1 walk.

Inputs come from the qualified ``descriptor_claim_input`` helper. The test
passes the actual evaluation, target reads, and intent reads from one walk to
``build_descriptor_claim_uses``. Expected indices and route classes are
derived from L5 ``descriptor_target_dataflow/consumer`` and its closed
``DescriptorClaimUse`` type; no reader result is used to decide those values.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definitions import validate_supply_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_target_frame import build_descriptor_claim_uses


USE_FIELDS = {
    "claim_locator",
    "claim",
    "target_read",
    "intent_read",
    "assessment_indices",
    "unmatched_match_indices",
    "basis_source_indices",
    "unresolved_basis_ref_indices",
    "basis_class",
    "missing_support_indices",
    "undefined_support_indices",
    "route",
    "route_reason",
    "primary_definition_assessment_indices",
}

ROUTE_REASONS = {
    "rule87": "同呼出しの原targetに対応するdefinition missingとreference_only根拠が、既存rule87の全predicateを満たす。",
    "rule93": "同呼出しの原targetに対応する限定meaning_undefinedと独立定義根拠のないfallbackが、既存rule93の全predicateを満たす。rule87は成立しない。",
    "none": "既存rule87及びrule93のpredicateに明確に該当しない。原target・意図・各定義状態は同呼出し観測へ保持する。",
    "unresolved": "既存rule87又はrule93の判定に必要な原target・意図・根拠対応が未確定である。元不成立を成功又は意味未定義へ変換しない。",
}


def _walk_and_build_uses(raw):
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    if validated["input"] is None or validated["input_issues"] or validated["unusable_source_refs"]:
        raise AssertionError("setup: FN0 must accept the qualified Claim fixture")
    if validated["input"] != raw_before:
        raise AssertionError("setup: FN0 must preserve the input snapshot")
    validated_before = copy.deepcopy(validated)

    walk = None
    walk_before = None
    evaluation_before = None
    try:
        walk = evaluate_descriptor_definition_walk({"validated": validated})
        walk_before = copy.deepcopy(walk)
        evaluation_before = copy.deepcopy(walk["evaluation"])
        uses = build_descriptor_claim_uses(
            validated,
            walk["evaluation"],
            walk["target_reads"],
            walk["intent_reads"],
        )
        return validated, walk, uses
    finally:
        if raw != raw_before:
            raise AssertionError("walk/use builder mutated the raw input")
        if validated != validated_before:
            raise AssertionError("walk/use builder mutated ValidatedSupply")
        if walk is not None and walk != walk_before:
            raise AssertionError("use builder mutated the same-call walk result")
        if walk is not None and walk["evaluation"] != evaluation_before:
            raise AssertionError("use builder mutated the same-call evaluation")


def _expected_related_assessment_indices(raw, evaluation, descriptor_index=0):
    """Select all same-slot/full-Binding/kind assessments in original E order."""
    slot = raw["descriptors"][descriptor_index]
    expected_key = {
        "binding": {"presence": "supplied", "value": slot["binding"]},
        "slot_identity": {"presence": "supplied", "value": slot["slot_identity"]},
        "descriptor_kind": slot["descriptor_kind"],
    }
    return [
        index
        for index, assessment in enumerate(evaluation["assessments"])
        if assessment["key"] == expected_key
    ]


def _expected_primary_indices(evaluation, related_indices):
    return [
        index
        for index in related_indices
        if evaluation["assessments"][index]["axis_name"]
        == evaluation["assessments"][index]["key"]["descriptor_kind"] + ".definition"
    ]


def _assert_use_partition(testcase, raw, evaluation, use, expected_related):
    expected_primary = _expected_primary_indices(evaluation, expected_related)
    expected_missing = [
        index for index in expected_primary
        if evaluation["assessments"][index]["state"] == "missing"
    ]
    expected_undefined = [
        index for index in expected_primary
        if evaluation["assessments"][index]["state"] == "unknown"
        and evaluation["assessments"][index]["origin_branch"] == "meaning_undefined"
    ]
    testcase.assertEqual(use["assessment_indices"], expected_related)
    testcase.assertEqual(use["primary_definition_assessment_indices"], expected_primary)
    testcase.assertEqual(use["missing_support_indices"], expected_missing)
    testcase.assertEqual(use["undefined_support_indices"], expected_undefined)


class TestDescriptorClaimUses(unittest.TestCase):
    def _assert_uses(self, raw, expected_count):
        validated, walk, uses = _walk_and_build_uses(raw)
        self.assertEqual(walk["evaluation"]["comparison"]["input_binding"], validated["input"]["binding"])
        self.assertEqual(len(uses), expected_count)
        for index, use in enumerate(uses):
            self.assertEqual(set(use), USE_FIELDS)
            claim = raw["claims"][index]
            locator = f"/claims/{index}"
            self.assertEqual(use["claim_locator"], locator)
            self.assertEqual(use["claim"], claim)
            self.assertEqual(use["target_read"], walk["target_reads"][index])
            self.assertEqual(use["intent_read"], walk["intent_reads"][index])
            self.assertEqual(use["target_read"]["claim_locator"], locator)
            self.assertEqual(use["target_read"]["claim"], claim)
            self.assertEqual(use["intent_read"]["claim_locator"], locator)
            self.assertEqual(use["intent_read"]["claim"], claim)
            self.assertIn(use["basis_class"], {
                "reference_only_only", "nonsemantic_or_empty", "semantic_or_mixed", "unresolved"
            })
            self.assertIn(use["route"], {"rule87", "rule93", "none", "unresolved"})
            self.assertEqual(use["route_reason"], ROUTE_REASONS[use["route"]])
        return validated, walk, uses

    def test_positive_claim_keeps_all_related_and_only_primary_assessments(self):
        """Only kind.definition rows are primary; auxiliary rows remain related."""
        raw = descriptor_claim_input("positive")
        validated, walk, uses = self._assert_uses(raw, 1)
        evaluation = walk["evaluation"]
        related = _expected_related_assessment_indices(raw, evaluation)
        primary = _expected_primary_indices(evaluation, related)
        self.assertTrue(related)
        self.assertTrue(primary)
        _assert_use_partition(self, raw, evaluation, uses[0], related)

        # This L7 fixture has no primary missing or meaning_undefined support.
        # The existing source_unresolved assessment is not reclassified as either.
        self.assertTrue(all(evaluation["assessments"][i]["state"] == "unknown" for i in primary))
        self.assertTrue(all(evaluation["assessments"][i]["origin_branch"] == "source_unresolved" for i in primary))
        self.assertEqual(uses[0]["missing_support_indices"], [])
        self.assertEqual(uses[0]["undefined_support_indices"], [])
        self.assertEqual(uses[0]["basis_class"], "nonsemantic_or_empty")
        self.assertEqual(uses[0]["basis_source_indices"], [])
        self.assertEqual(uses[0]["unresolved_basis_ref_indices"], [])
        self.assertEqual(uses[0]["route"], "none")
        self.assertEqual(uses[0]["route_reason"], ROUTE_REASONS["none"])

    def test_distinct_target_slots_have_no_assessment_match_and_unresolved_route(self):
        """The nonresolved target cohort does not borrow a partial slot assessment."""
        raw = descriptor_claim_input("distinct_slot")
        _validated, _walk, uses = self._assert_uses(raw, 1)
        use = uses[0]
        self.assertEqual(use["assessment_indices"], [])
        self.assertEqual(use["primary_definition_assessment_indices"], [])
        self.assertEqual(use["missing_support_indices"], [])
        self.assertEqual(use["undefined_support_indices"], [])
        self.assertEqual(use["unmatched_match_indices"], [])
        self.assertEqual(use["route"], "unresolved")
        self.assertEqual(use["route_reason"], ROUTE_REASONS["unresolved"])

    def test_unrelated_target_occurrence_keeps_exact_slot_assessments(self):
        """A differently identified declaration does not remove the exact target link."""
        raw = descriptor_claim_input("unrelated_target")
        _validated, walk, uses = self._assert_uses(raw, 1)
        related = _expected_related_assessment_indices(raw, walk["evaluation"])
        _assert_use_partition(self, raw, walk["evaluation"], uses[0], related)
        self.assertEqual(uses[0]["route"], "none")
        self.assertEqual(uses[0]["route_reason"], ROUTE_REASONS["none"])

    def test_equal_claim_values_remain_separate_uses_in_claim_order(self):
        """Equal Claim values at two locators are two same-call occurrences."""
        raw = descriptor_claim_input("positive")
        raw["claims"].append(copy.deepcopy(raw["claims"][0]))
        _validated, walk, uses = self._assert_uses(raw, 2)
        related = _expected_related_assessment_indices(raw, walk["evaluation"])
        for use in uses:
            _assert_use_partition(self, raw, walk["evaluation"], use, related)
            self.assertEqual(use["route"], "none")
        self.assertEqual([use["claim_locator"] for use in uses], ["/claims/0", "/claims/1"])
        self.assertEqual([use["claim"] for use in uses], raw["claims"])

    def test_basis_presence_role_and_unresolved_occurrence_indices(self):
        """Basis classes preserve original refs and indices without creating qualifications."""
        def make_case(mode):
            raw = descriptor_claim_input("positive")
            claim = raw["claims"][0]
            if mode == "absent":
                claim.pop("basis_refs")
            elif mode == "empty":
                claim["basis_refs"] = []
            elif mode == "reference_only":
                raw["sources"][1]["role"] = "reference_only"
                claim["basis_refs"] = [copy.deepcopy(raw["sources"][1]["ref"])]
            elif mode == "semantic":
                claim["basis_refs"] = [copy.deepcopy(raw["sources"][0]["ref"])]
            elif mode == "missing_ref":
                missing = copy.deepcopy(raw["sources"][0]["ref"])
                missing["identity"] += "-unjoined"
                claim["basis_refs"] = [missing]
            elif mode == "repeated_and_missing":
                missing = copy.deepcopy(raw["sources"][0]["ref"])
                missing["identity"] += "-unjoined"
                source_ref = copy.deepcopy(raw["sources"][0]["ref"])
                claim["basis_refs"] = [source_ref, copy.deepcopy(missing), copy.deepcopy(source_ref)]
            return raw

        expected = {
            "absent": ("unresolved", [], []),
            "empty": ("nonsemantic_or_empty", [], []),
            "reference_only": ("reference_only_only", [1], []),
            "semantic": ("semantic_or_mixed", [0], []),
            "missing_ref": ("unresolved", [], [0]),
            "repeated_and_missing": ("unresolved", [0, 0], [1]),
        }
        for mode, (basis_class, source_indices, unresolved_indices) in expected.items():
            with self.subTest(basis=mode):
                raw = make_case(mode)
                _validated, _walk, uses = self._assert_uses(raw, 1)
                use = uses[0]
                self.assertEqual(use["basis_class"], basis_class)
                self.assertEqual(use["basis_source_indices"], source_indices)
                self.assertEqual(use["unresolved_basis_ref_indices"], unresolved_indices)
                self.assertEqual(use["missing_support_indices"], [])
                self.assertEqual(use["undefined_support_indices"], [])
                self.assertEqual(use["route"], "none")
                self.assertEqual(use["route_reason"], ROUTE_REASONS["none"])


if __name__ == "__main__":
    unittest.main()
