"""G5: FN6 preserves zero handoff occurrences alongside a non-firing fill claim.

Contract basis:
- L4 /oracle_view_boundary_contract/nonfire_read_plan/raw_domain/handoff_records
  distinguishes absent from [] while both have zero original occurrences.
- L4 /dependency_semantic_ports/public_projection/order places original handoff
  before Claim occurrences; a zero-occurrence handoff contributes no axis.
- L5 /logical_input_structure/schema/$defs/SupplyInput/properties/handoff_records
  makes the array optional while retaining its supplied array shape.
- L5 /source_return_contract/descriptor_target_dataflow/consumer/support_sets/
  route_order keeps a source_unresolved primary assessment out of rule 87/93
  support; the positive fill fixture's route is none.

These tests use the public FN0 -> FN1 -> FN6 path. The empty-claims comparison
is a same-input metamorphic control for FN6's dependency/handoff prefix, not a
copied expected Comparison.
"""

from __future__ import annotations

import copy
import unittest

from dependencies_handoff import compare_dependencies_and_handoff
from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definitions import compare_descriptor_definitions, validate_supply_input


RULE87 = "HELIXBRAIN-L5-032-R-reference_as_required_definition"
RULE93 = "HELIXBRAIN-L5-032-R-unknown_fallback"


def _call_fn0_fn1_fn6(raw: dict) -> tuple[dict, dict, dict]:
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    definitions = compare_descriptor_definitions({"validated": validated})
    validated_before = copy.deepcopy(validated)
    definitions_before = copy.deepcopy(definitions)
    result = compare_dependencies_and_handoff({
        "validated": validated,
        "definitions": definitions,
    })
    if raw != raw_before:
        raise AssertionError("FN0/FN1/FN6 changed the supplied raw input")
    if validated != validated_before or definitions != definitions_before:
        raise AssertionError("FN6 changed its same-call FN0/FN1 inputs")
    return validated, definitions, result


class TestDescriptorFillHandoffAbsent(unittest.TestCase):
    def _assert_case(self, *, handoff_presence: str, dependencies_presence: str) -> None:
        raw = descriptor_claim_input("positive")
        if handoff_presence == "absent":
            raw.pop("handoff_records", None)
        elif handoff_presence == "empty":
            raw["handoff_records"] = []
        else:
            self.fail(f"unexpected handoff presence: {handoff_presence}")

        if dependencies_presence == "absent":
            raw.pop("dependencies", None)
        elif dependencies_presence != "supplied":
            self.fail(f"unexpected dependencies presence: {dependencies_presence}")

        raw_before = copy.deepcopy(raw)
        self.assertEqual(len(raw["claims"]), 1)
        self.assertEqual(raw["claims"][0]["kind"], "fill_definition")
        self.assertEqual(raw["claims"][0]["basis_refs"], [])
        self.assertEqual("handoff_records" in raw, handoff_presence == "empty")
        self.assertEqual("dependencies" in raw, dependencies_presence == "supplied")

        validated, definitions, result = _call_fn0_fn1_fn6(raw)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(definitions["producer_symbol"], "compare_descriptor_definitions")
        self.assertEqual(result["producer_symbol"], "compare_dependencies_and_handoff")
        self.assertEqual(result["input_binding"], raw_before["binding"])
        self.assertEqual([axis for axis in result["axes"] if axis["axis"] == "handoff"], [])
        self.assertNotIn(RULE87, [finding.get("rule_ref") for finding in result["findings"]])
        self.assertNotIn(RULE93, [finding.get("rule_ref") for finding in result["findings"]])

        # The same raw snapshot with no Claim must retain the same FN6
        # dependency/handoff result. This checks route=none through its public
        # consequence without reading or constructing a private ClaimUse.
        no_claim_raw = copy.deepcopy(raw_before)
        no_claim_raw["claims"] = []
        no_claim_validated, no_claim_definitions, no_claim_result = _call_fn0_fn1_fn6(
            no_claim_raw
        )
        self.assertEqual(no_claim_validated["input"], no_claim_raw)
        self.assertEqual(
            result["axes"],
            no_claim_result["axes"],
            "a source_unresolved primary assessment with no rule87/93 support adds no FN6 axis",
        )
        self.assertEqual(
            result["findings"],
            no_claim_result["findings"],
            "route=none adds no rule87/93 Finding or other FN6 Finding",
        )
        self.assertEqual(no_claim_definitions["producer_symbol"], "compare_descriptor_definitions")
        self.assertEqual(raw, raw_before)

    def test_absent_handoff_with_supplied_dependencies_has_zero_rows(self) -> None:
        self._assert_case(handoff_presence="absent", dependencies_presence="supplied")

    def test_absent_handoff_with_absent_dependencies_has_zero_rows(self) -> None:
        self._assert_case(handoff_presence="absent", dependencies_presence="absent")

    def test_empty_handoff_with_supplied_dependencies_has_zero_rows(self) -> None:
        self._assert_case(handoff_presence="empty", dependencies_presence="supplied")

    def test_empty_handoff_with_absent_dependencies_has_zero_rows(self) -> None:
        self._assert_case(handoff_presence="empty", dependencies_presence="absent")

