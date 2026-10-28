"""FN6 public wrapper uses one same-ValidatedSupply canonical walk.

Independent expectations:
- L4 /definition_meaning_resolution_contract/evaluation_populations and
  /dependency_semantic_ports/public_projection/order
- L5 /source_return_contract/descriptor_target_dataflow/direct_wrappers/fn6,
  /transport_types/DescriptorTargetCallFrame, and /consumer/use_order
- L5 /functions/6, /failure_rules/105..106, and the existing B02 rule87/receipt
  output contracts.

The public Comparison assertions below are assembled from those contracts and
original input occurrences. A runtime spy observes only the walk call and the
identity of its ValidatedSupply argument; it does not provide an output oracle.
In the nonfill test, a zero-Claim public call is used only as a metamorphic
prefix-preservation comparison; it is not claimed as an independent oracle for
the whole FN6 output.
"""

from __future__ import annotations

import copy
import unittest
from unittest.mock import patch

import descriptor_definition_walk
from dependencies_handoff import compare_dependencies_and_handoff
from descriptor_definitions import compare_descriptor_definitions, validate_supply_input
from supply_input_fixtures import base_input, load_document
from test_fn6_fill_use_alignment import _nonfill_rows, _raw_and_claims


ALWAYS_IDENTITIES = (
    "HELIXBRAIN-L2-003",
    "HELIXBRAIN-L2-005",
    "HELIXBRAIN-L2-007",
    "HELIXBRAIN-L2-008",
    "HELIXBRAIN-L2-028",
)
SELECTORS = (
    "core_return_requested",
    "core_source_selected",
    "labo_evaluation_selected",
)
R105 = "HELIXBRAIN-L5-032-R-required_dependency_missing"
R106 = "HELIXBRAIN-L5-032-R-dependency_selector_unknown"
RULE87 = "HELIXBRAIN-L5-032-R-reference_as_required_definition"


def _run_public_fn0_fn1_fn6(testcase, raw):
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    testcase.assertEqual(validated["input"], raw_before)
    testcase.assertEqual(validated["input_issues"], [])
    testcase.assertEqual(validated["unusable_source_refs"], [])
    definitions = compare_descriptor_definitions({"validated": validated})
    validated_before = copy.deepcopy(validated)
    definitions_before = copy.deepcopy(definitions)

    with patch(
        "descriptor_definition_walk.evaluate_descriptor_definition_walk",
        wraps=descriptor_definition_walk.evaluate_descriptor_definition_walk,
    ) as walk_spy:
        result = compare_dependencies_and_handoff(
            {"validated": validated, "definitions": definitions}
        )

    testcase.assertEqual(
        raw, raw_before, "public FN0/FN1/FN6 must preserve the original input"
    )
    testcase.assertEqual(validated, validated_before)
    testcase.assertEqual(definitions, definitions_before)
    testcase.assertEqual(result["producer_symbol"], "compare_dependencies_and_handoff")
    testcase.assertEqual(result["input_binding"], raw_before["binding"])
    return raw_before, validated, result, walk_spy.call_args_list


class TestFN6WrapperWalkCoverage(unittest.TestCase):
    def test_zero_claims_still_uses_one_walk_and_keeps_absent_dependency_rows(self):
        raw = base_input(load_document())
        self.assertEqual(raw["claims"], [])
        del raw["dependencies"]
        raw_before, validated, result, calls = _run_public_fn0_fn1_fn6(self, raw)

        missing_axes = [
            row
            for row in result["axes"]
            if row["axis"] == "dependency_reference" and row["state"] == "missing"
        ]
        selector_axes = [
            row for row in result["axes"] if row["axis"] == "dependency_selection"
        ]
        handoff_axes = [row for row in result["axes"] if row["axis"] == "handoff"]
        self.assertEqual(len(missing_axes), len(ALWAYS_IDENTITIES))
        self.assertEqual(len(selector_axes), len(SELECTORS))
        self.assertEqual(len(handoff_axes), len(raw_before["handoff_records"]))
        for axis, record in zip(handoff_axes, raw_before["handoff_records"]):
            self.assertEqual(axis["subject_ref"], record["subject_ref"])
            self.assertEqual(axis["binding"], record["binding"])
            self.assertEqual(axis["axis"], "handoff")
            self.assertEqual(axis["state"], record["state"])
            self.assertEqual(axis["original_refs"], [record["source_ref"]])
            self.assertEqual(axis["backflow_owner"], "os_owner")
            self.assertTrue(
                axis["reason"].startswith("受渡しstateを原recordから保持。")
            )
        self.assertEqual(result["axes"], missing_axes + selector_axes + handoff_axes)
        self.assertEqual(
            [
                finding["reason"]
                for finding in result["findings"]
                if finding["rule_ref"] == R105
            ],
            [
                "HELIXBRAIN-L3-032-F09で必要なidentity "
                f"{identity} が入力 /dependencies/always_refs にない。"
                "欠落Refのrevision/scope/owner/source_locator/digestは生成しない。"
                for identity in ALWAYS_IDENTITIES
            ],
        )
        self.assertEqual(
            [row["reason"] for row in selector_axes],
            [
                "条件selector "
                + selector
                + " が /dependencies/"
                + selector
                + " にない。falseを既定せず、その条件のref集合を評価しない。"
                for selector in SELECTORS
            ],
        )
        self.assertEqual(
            [row["rule_ref"] for row in result["findings"]],
            [R105] * len(ALWAYS_IDENTITIES) + [R106] * len(SELECTORS),
        )
        self.assertEqual(len(calls), 1)
        self.assertIs(calls[0].args[0]["validated"], validated)

    def test_nonfill_only_claim_still_uses_one_walk_and_keeps_b02_row(self):
        raw, nonfill, _fill = _raw_and_claims()
        raw["claims"] = [copy.deepcopy(nonfill)]
        raw_before = copy.deepcopy(raw)
        prefix_raw = copy.deepcopy(raw)
        prefix_raw["claims"] = []

        prefix_validated = validate_supply_input(prefix_raw)
        prefix_definitions = compare_descriptor_definitions(
            {"validated": prefix_validated}
        )
        prefix = compare_dependencies_and_handoff(
            {"validated": prefix_validated, "definitions": prefix_definitions}
        )
        raw_before, validated, result, calls = _run_public_fn0_fn1_fn6(self, raw)

        expected_axis, expected_finding = _nonfill_rows(nonfill)
        self.assertEqual(result["axes"], prefix["axes"] + [expected_axis])
        self.assertEqual(result["findings"], prefix["findings"] + [expected_finding])
        self.assertEqual(result["producer_symbol"], "compare_dependencies_and_handoff")
        self.assertEqual(raw, raw_before)
        self.assertEqual(len(calls), 1)
        self.assertIs(calls[0].args[0]["validated"], validated)

    def test_fill_claim_control_uses_one_walk_and_preserves_rule87(self):
        raw, _nonfill, fill = _raw_and_claims()
        raw["claims"] = [copy.deepcopy(fill)]
        _raw_before, validated, result, calls = _run_public_fn0_fn1_fn6(self, raw)

        self.assertEqual(len(calls), 1)
        self.assertIs(calls[0].args[0]["validated"], validated)
        self.assertEqual(
            [
                finding["rule_ref"]
                for finding in result["findings"]
                if finding.get("rule_ref") == RULE87
            ],
            [RULE87],
        )


if __name__ == "__main__":
    unittest.main()
