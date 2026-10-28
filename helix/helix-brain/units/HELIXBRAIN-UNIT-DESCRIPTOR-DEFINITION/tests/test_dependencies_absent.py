"""FN6のdependencies全member absent時に既存missing/selector所見を保つ。

独立期待の根拠:
- L4 /dependency_semantic_ports/canonical_ordered_branches/2..3
- L4 /dependency_semantic_ports/diagnostic_return_contract/canonical_diagnostic_mapping/2..3
- L4 /dependency_semantic_ports/public_projection/axis_mapping,/order
- L5 /functions/6/algorithm/0..1
- L5 /failure_rules/105..106
- L5 /canonical_dependency_detail/fn6_integration
- L5 /canonical_dependency_detail/required_dependency_missing_axis_trace_writer
- L5 /conditional_dependency_detail/reason_rules
- L5 /conditional_dependency_detail/public_projection_writers

入力は既存normal rawからdependencies memberだけを除く。期待値はL4/L5から
組み立て、全Comparisonをoracleとして複写しない。実行はbounded_exec経由で行う。
"""

from __future__ import annotations

import copy
import json
import unittest

from dependencies_handoff import compare_dependencies_and_handoff
from descriptor_definitions import compare_descriptor_definitions, validate_supply_input
from supply_input_fixtures import base_input, load_document


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


def _call_fn0_fn1_fn6(raw: dict) -> tuple[dict, dict, dict]:
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    definitions = compare_descriptor_definitions({"validated": validated})
    validated_before = copy.deepcopy(validated)
    definitions_before = copy.deepcopy(definitions)
    result = compare_dependencies_and_handoff(
        {
            "validated": validated,
            "definitions": definitions,
        }
    )
    if raw != raw_before:
        raise AssertionError("FN0/FN1/FN6 changed the supplied raw input")
    if validated != validated_before or definitions != definitions_before:
        raise AssertionError("FN6 changed its same-call validated/FN1 inputs")
    return validated, definitions, result


class TestDependenciesAbsent(unittest.TestCase):
    def test_absent_dependencies_preserves_missing_selectors_handoff_and_empty_claim_scope(
        self,
    ) -> None:
        document = load_document()
        normal_raw = base_input(document)
        self.assertEqual(normal_raw["claims"], [])

        absent_raw = copy.deepcopy(normal_raw)
        del absent_raw["dependencies"]
        absent_before = copy.deepcopy(absent_raw)
        validated, definitions, result = _call_fn0_fn1_fn6(absent_raw)

        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], absent_before)
        self.assertEqual(
            definitions["producer_symbol"], "compare_descriptor_definitions"
        )
        self.assertEqual(definitions["input_binding"], absent_before["binding"])
        self.assertEqual(result["producer_symbol"], "compare_dependencies_and_handoff")
        self.assertEqual(
            list(result), ["axes", "findings", "producer_symbol", "input_binding"]
        )
        self.assertEqual(result["input_binding"], absent_before["binding"])
        self.assertEqual(absent_raw, absent_before)

        # R105: every absent always_refs identity is missing. The required-axis
        # trace does not invent a category array or a missing Ref; all five
        # source occurrences remain separate even though the trace omits ID.
        missing_axes = [
            row
            for row in result["axes"]
            if row["axis"] == "dependency_reference" and row["state"] == "missing"
        ]
        self.assertEqual(len(missing_axes), len(ALWAYS_IDENTITIES))
        for axis in missing_axes:
            self.assertEqual(
                list(axis),
                [
                    "subject_ref",
                    "binding",
                    "axis",
                    "state",
                    "original_refs",
                    "reason",
                    "backflow_owner",
                ],
            )
            self.assertEqual(
                axis["subject_ref"], absent_before["binding"]["knowledge_ref"]
            )
            self.assertEqual(axis["binding"], absent_before["binding"])
            self.assertEqual(axis["original_refs"], [])
            self.assertEqual(axis["backflow_owner"], "knowledge_owner")
            prefix, trace_text = axis["reason"].split("\nTRACE=", 1)
            self.assertEqual(
                prefix,
                "必要identityに対応する原Refは当該categoryに未供給。他bodyで補償しない。",
            )
            trace = json.loads(trace_text)
            self.assertEqual(
                list(trace),
                [
                    "format",
                    "producer_symbol",
                    "axis",
                    "state",
                    "subject_ref",
                    "binding",
                    "original_refs",
                    "backflow_owner",
                    "request_locator",
                    "source_category_locator",
                    "cause",
                    "canonical_body_support",
                    "handoff_record",
                    "selection_observation",
                ],
            )
            self.assertEqual(trace["format"], "BRAIN032-F09-axis-reason-trace-v1")
            self.assertEqual(
                trace["producer_symbol"], "compare_dependencies_and_handoff"
            )
            self.assertEqual(trace["axis"], "dependency_reference")
            self.assertEqual(trace["state"], "missing")
            self.assertEqual(
                trace["subject_ref"], absent_before["binding"]["knowledge_ref"]
            )
            self.assertEqual(trace["binding"], absent_before["binding"])
            self.assertEqual(trace["original_refs"], [])
            self.assertEqual(trace["backflow_owner"], "knowledge_owner")
            self.assertIsNone(trace["request_locator"])
            self.assertIsNone(trace["source_category_locator"])
            self.assertIsNone(trace["cause"])
            self.assertEqual(trace["canonical_body_support"], [])
            self.assertIsNone(trace["handoff_record"])
            self.assertIsNone(trace["selection_observation"])

        # L5 R105 carries the complete missing-identity sequence and source
        # category in its own reason. It is distinct from the TRACE14 Axis.
        missing_findings = [
            row for row in result["findings"] if row.get("rule_ref") == R105
        ]
        self.assertEqual(len(missing_findings), len(ALWAYS_IDENTITIES))
        self.assertEqual(
            [row["reason"] for row in missing_findings],
            [
                "HELIXBRAIN-L3-032-F09で必要なidentity "
                f"{identity} が入力 /dependencies/always_refs にない。"
                "欠落Refのrevision/scope/owner/source_locator/digestは生成しない。"
                for identity in ALWAYS_IDENTITIES
            ],
        )
        for row in missing_findings:
            self.assertEqual(
                list(row),
                [
                    "code",
                    "rule_ref",
                    "subject_ref",
                    "binding",
                    "axis",
                    "state",
                    "source_refs",
                    "reason",
                    "backflow_owner",
                ],
            )
            self.assertEqual(row["code"], "required_dependency_missing")
            self.assertEqual(
                row["subject_ref"], absent_before["binding"]["knowledge_ref"]
            )
            self.assertEqual(row["binding"], absent_before["binding"])
            self.assertEqual(row["axis"], "dependency_reference")
            self.assertEqual(row["state"], "missing")
            self.assertEqual(row["source_refs"], [])
            self.assertEqual(row["backflow_owner"], "knowledge_owner")

        # All three absent selectors emit one old R106 Axis and Finding, in
        # the fixed selector order. No conditional ref set is evaluated.
        selector_axes = [
            row for row in result["axes"] if row["axis"] == "dependency_selection"
        ]
        selector_findings = [
            row for row in result["findings"] if row.get("rule_ref") == R106
        ]
        self.assertEqual(len(selector_axes), 3)
        self.assertEqual(len(selector_findings), 3)
        expected_selector_reasons = [
            "条件selector "
            + selector
            + " が /dependencies/"
            + selector
            + " にない。falseを既定せず、その条件のref集合を評価しない。"
            for selector in SELECTORS
        ]
        self.assertEqual(
            [row["reason"] for row in selector_axes], expected_selector_reasons
        )
        self.assertEqual(
            [row["reason"] for row in selector_findings], expected_selector_reasons
        )
        for axis, finding in zip(selector_axes, selector_findings):
            self.assertEqual(
                list(axis),
                [
                    "subject_ref",
                    "binding",
                    "axis",
                    "state",
                    "original_refs",
                    "reason",
                    "backflow_owner",
                ],
            )
            self.assertEqual(
                axis["subject_ref"], absent_before["binding"]["knowledge_ref"]
            )
            self.assertEqual(axis["binding"], absent_before["binding"])
            self.assertEqual(axis["state"], "unknown")
            self.assertEqual(axis["original_refs"], [])
            self.assertIsNone(axis["backflow_owner"])
            self.assertEqual(
                list(finding),
                [
                    "code",
                    "rule_ref",
                    "subject_ref",
                    "binding",
                    "axis",
                    "state",
                    "source_refs",
                    "reason",
                    "backflow_owner",
                ],
            )
            self.assertEqual(finding["code"], "dependency_selector_unknown")
            self.assertEqual(finding["rule_ref"], R106)
            self.assertEqual(finding["subject_ref"], axis["subject_ref"])
            self.assertEqual(finding["binding"], axis["binding"])
            self.assertEqual(finding["axis"], axis["axis"])
            self.assertEqual(finding["state"], axis["state"])
            self.assertEqual(finding["source_refs"], [])
            self.assertEqual(finding["reason"], axis["reason"])
            self.assertIsNone(finding["backflow_owner"])

        # Removing only dependencies must not erase the independent handoff
        # result or create a claim-origin finding for claims=[]. Compare only
        # this unchanged responsibility against the real normal call.
        _, _, normal_result = _call_fn0_fn1_fn6(normal_raw)
        normal_handoff = [
            row for row in normal_result["axes"] if row["axis"] == "handoff"
        ]
        absent_handoff = [row for row in result["axes"] if row["axis"] == "handoff"]
        self.assertEqual(absent_handoff, normal_handoff)
        self.assertEqual(len(absent_handoff), len(absent_before["handoff_records"]))
        self.assertEqual(result["axes"], missing_axes + selector_axes + absent_handoff)
        normal_other_findings = [
            row
            for row in normal_result["findings"]
            if row.get("rule_ref") not in {R105, R106}
        ]
        absent_other_findings = [
            row for row in result["findings"] if row.get("rule_ref") not in {R105, R106}
        ]
        self.assertEqual(absent_other_findings, normal_other_findings)
        self.assertEqual(
            result["findings"],
            missing_findings + selector_findings + absent_other_findings,
        )
        self.assertFalse(
            any(
                row.get("code")
                in {
                    "receipt_as_product_discharge",
                    "receipt_as_na",
                }
                for row in result["findings"]
            )
        )
