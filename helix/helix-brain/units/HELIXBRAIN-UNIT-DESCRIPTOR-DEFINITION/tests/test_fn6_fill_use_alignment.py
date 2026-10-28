"""WR68 FN6 fill ClaimUse/raw-locator alignment test draft (LOCAL ONLY).

Independent contract anchors:
- L4 /source_return_contract/descriptor_target_dataflow/consumer/use_order:
  fill ClaimUses retain original Claim order, and equal Claims at distinct raw
  locators remain distinct occurrences.
- L5 /source_return_contract/descriptor_target_dataflow/consumer/reads and
  /use_order: only fill_definition claims have target/use reads; their ClaimUse
  sequence is compact, while each claim_locator remains the original /claims/i.
- L5 /transport_types/DescriptorTargetCallFrame: closed same-call frame carries
  validated, definition_evaluation, target_reads, and claim_uses.
- L5 /public_output/reason_templates and /reason_interpolation: rule87 reason
  names both raw /claims/i and packed /frame/claim_uses/j independently.
- L5 /public_output/axis_fields, /finding_fields, /one_finding: one rule87 row
  per original Claim occurrence; raw subject/binding/basis refs remain intact.

The five mixed observations in root-wr68-fn6-mixed-input-probe-R1 are reachability
evidence only. They are not used as a saved whole-output oracle. All calls here
use real FN0, public FN1, and public FN6; the malformed detail cases begin with
the real private same-call frame and corrupt only cloned protocol arrays.
"""

from __future__ import annotations

import copy
import unittest

from claim_boundary_input_fixtures import finite_claim_input
from descriptor_definitions import (
    compare_dependencies_and_handoff,
    compare_descriptor_definitions,
    validate_supply_input,
)
from dependencies_handoff import (
    _build_claim_call_frame,
    compare_dependencies_and_handoff_detail,
)
from supply_input_fixtures import base_input, load_document
from test_b02_dependencies_and_handoff import (
    _append_qualified_semantic_source,
    _build_receipt_carrier_content,
)


RULE87 = "HELIXBRAIN-L5-032-R-reference_as_required_definition"
B02_DISCHARGE = "HELIXBRAIN-L5-032-R-receipt_as_product_discharge"
FN6_FRAME_STOP = "B02/F09/claim_call_frame_shape:"
FN6_BACKFLOW = "HELIXBRAIN-L6-032-B02-FN6-PATH"


def _raw_and_claims():
    """Reuse the observed native fixtures; do not synthesize a Comparison/frame."""
    raw = finite_claim_input("rule87")
    b02 = base_input(load_document())
    if raw["binding"] != b02["binding"]:
        raise AssertionError(
            "the existing finite and B02 fixtures must share the exact Binding"
        )
    raw["dependencies"] = copy.deepcopy(b02["dependencies"])

    subject = copy.deepcopy(raw["binding"]["requirement_ref"])
    receipt_content = _build_receipt_carrier_content(
        subject,
        raw["binding"],
        [copy.deepcopy(raw["sources"][0]["ref"])],
    )
    _, receipt_ref = _append_qualified_semantic_source(
        raw, "knowledge-receipt", receipt_content
    )
    nonfill = {
        "subject_ref": subject,
        "binding": copy.deepcopy(raw["binding"]),
        "actor": "BRAIN",
        "kind": "project_obligation_discharge",
        "proposed_value": True,
        "basis_refs": [copy.deepcopy(receipt_ref)],
    }
    fill = copy.deepcopy(raw["claims"][0])
    return raw, nonfill, fill


def _public_call(testcase, raw):
    """Run the real public path and turn product errors into semantic failures."""
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    validated_before = copy.deepcopy(validated)
    testcase.assertEqual(validated["input"], raw_before)
    testcase.assertEqual(validated["input_issues"], [])
    testcase.assertEqual(validated["unusable_source_refs"], [])

    definitions = compare_descriptor_definitions({"validated": validated})
    definitions_before = copy.deepcopy(definitions)
    context = {"validated": validated, "definitions": definitions}
    context_before = copy.deepcopy(context)
    result = None
    caught = None
    try:
        result = compare_dependencies_and_handoff(context)
    except (
        Exception
    ) as exc:  # a source regression is an assertion failure, not a test error
        caught = exc
    finally:
        testcase.assertEqual(raw, raw_before)
        testcase.assertEqual(validated, validated_before)
        testcase.assertEqual(definitions, definitions_before)
        testcase.assertEqual(context, context_before)
    testcase.assertIsNone(caught, f"public FN6 raised unexpectedly: {caught!r}")
    return result


def _raw_fill_row(claim, raw_index, use_index):
    reason = (
        f"Claim /claims/{raw_index} は、元targetの意味定義missingをreference_only資料で置換する主張である。"
        f"原missingを保持し、全支持記録は同呼出し観測/frame/claim_uses/{use_index}に残す。"
    )
    common = {
        "subject_ref": copy.deepcopy(claim["subject_ref"]),
        "binding": copy.deepcopy(claim["binding"]),
        "axis": "descriptor.definition",
        "state": "missing",
        "reason": reason,
        "backflow_owner": "knowledge_owner",
    }
    return (
        {**common, "original_refs": copy.deepcopy(claim["basis_refs"])},
        {
            "code": "reference_as_required_definition",
            "rule_ref": RULE87,
            **common,
            "source_refs": copy.deepcopy(claim["basis_refs"]),
        },
    )


def _nonfill_rows(claim):
    reason = "030受領主張は案件義務成立の根拠にならない。OSの案件義務達成根拠が未供給のため義務状態はunknown。"
    common = {
        "subject_ref": copy.deepcopy(claim["subject_ref"]),
        "binding": copy.deepcopy(claim["binding"]),
        "axis": "obligation_discharge_claim",
        "state": "unknown",
        "reason": reason,
        "backflow_owner": "os_owner",
    }
    return (
        {**common, "original_refs": copy.deepcopy(claim["basis_refs"])},
        {
            "code": "receipt_as_product_discharge",
            "rule_ref": B02_DISCHARGE,
            **common,
            "source_refs": copy.deepcopy(claim["basis_refs"]),
        },
    )


def _claim_rows_in_raw_order(claims):
    axes, findings = [], []
    use_index = 0
    for raw_index, claim in enumerate(claims):
        if claim["kind"] == "fill_definition":
            axis, finding = _raw_fill_row(claim, raw_index, use_index)
            use_index += 1
        else:
            axis, finding = _nonfill_rows(claim)
        axes.append(axis)
        findings.append(finding)
    return axes, findings


class TestWr68Fn6FillUseAlignment(unittest.TestCase):
    def test_fill_only_and_nonfill_only_controls_keep_their_existing_rows(self):
        _, nonfill, fill = _raw_and_claims()
        for label, claims, expected_rule in (
            ("fill-only", [fill], RULE87),
            ("nonfill-only", [nonfill], B02_DISCHARGE),
        ):
            with self.subTest(label=label):
                raw, _, _ = _raw_and_claims()
                raw["claims"] = copy.deepcopy(claims)
                result = _public_call(self, raw)
                matches = [
                    row
                    for row in result["findings"]
                    if row.get("rule_ref") == expected_rule
                ]
                self.assertEqual(len(matches), 1)
                self.assertEqual(matches[0]["subject_ref"], claims[0]["subject_ref"])
                self.assertEqual(matches[0]["binding"], claims[0]["binding"])
                self.assertEqual(matches[0]["source_refs"], claims[0]["basis_refs"])
                if expected_rule == RULE87:
                    axis, finding = _raw_fill_row(claims[0], 0, 0)
                    self.assertIn(axis, result["axes"])
                    self.assertIn(finding, result["findings"])
                else:
                    axis, finding = _nonfill_rows(claims[0])
                    self.assertIn(axis, result["axes"])
                    self.assertIn(finding, result["findings"])

    def test_mixed_claim_rows_follow_raw_order_and_preserve_existing_prefix(self):
        _, nonfill, fill = _raw_and_claims()
        for label, claims in (
            ("nonfill-fill", [nonfill, fill]),
            ("fill-nonfill", [fill, nonfill]),
            ("nonfill-fill-nonfill", [nonfill, fill, nonfill]),
        ):
            with self.subTest(label=label):
                raw, _, _ = _raw_and_claims()
                raw["claims"] = copy.deepcopy(claims)
                prefix_raw = copy.deepcopy(raw)
                prefix_raw["claims"] = []
                prefix = _public_call(self, prefix_raw)
                result = _public_call(self, raw)
                expected_axes, expected_findings = _claim_rows_in_raw_order(claims)

                # L5 preserves the existing FN6 producer prefix, then appends
                # each original Claim occurrence in its raw order.
                self.assertEqual(result["axes"], prefix["axes"] + expected_axes)
                self.assertEqual(
                    result["findings"], prefix["findings"] + expected_findings
                )
                self.assertEqual(
                    result["producer_symbol"], "compare_dependencies_and_handoff"
                )
                self.assertEqual(result["input_binding"], raw["binding"])

    def test_rule87_reason_uses_raw_claim_and_packed_use_locators_separately(self):
        _, nonfill, fill = _raw_and_claims()
        claims = [nonfill, fill, nonfill, fill, nonfill]
        raw, _, _ = _raw_and_claims()
        raw["claims"] = copy.deepcopy(claims)
        result = _public_call(self, raw)

        rule87_findings = [
            row for row in result["findings"] if row.get("rule_ref") == RULE87
        ]
        self.assertEqual(len(rule87_findings), 2)
        for finding, raw_index, packed_index in zip(rule87_findings, (1, 3), (0, 1)):
            expected_axis, expected_finding = _raw_fill_row(
                claims[raw_index], raw_index, packed_index
            )
            self.assertEqual(finding, expected_finding)
            matching_axes = [
                row
                for row in result["axes"]
                if row.get("axis") == "descriptor.definition"
                and row.get("subject_ref") == claims[raw_index]["subject_ref"]
                and row.get("binding") == claims[raw_index]["binding"]
                and row.get("reason") == expected_axis["reason"]
            ]
            self.assertEqual(matching_axes, [expected_axis])
            self.assertIn(f"Claim /claims/{raw_index} ", finding["reason"])
            self.assertIn(f"/frame/claim_uses/{packed_index}", finding["reason"])
        self.assertEqual(
            [
                row["rule_ref"]
                for row in result["findings"]
                if row.get("rule_ref") in {RULE87, B02_DISCHARGE}
            ],
            [B02_DISCHARGE, RULE87, B02_DISCHARGE, RULE87, B02_DISCHARGE],
        )

    def test_detail_rejects_malformed_clones_of_the_real_call_frame(self):
        _, nonfill, fill = _raw_and_claims()
        raw, _, _ = _raw_and_claims()
        raw["claims"] = [
            copy.deepcopy(nonfill),
            copy.deepcopy(fill),
            copy.deepcopy(nonfill),
        ]
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["unusable_source_refs"], [])
        validated_before = copy.deepcopy(validated)
        definitions = compare_descriptor_definitions({"validated": validated})
        definitions_before = copy.deepcopy(definitions)
        context = {"validated": validated, "definitions": definitions}
        context_before = copy.deepcopy(context)
        frame = _build_claim_call_frame(validated)
        frame_before = copy.deepcopy(frame)
        self.assertEqual(len(frame["target_reads"]), 1)
        self.assertEqual(len(frame["claim_uses"]), 1)

        def mutate(frame_clone, case):
            if case == "target-read-short":
                frame_clone["target_reads"].clear()
            elif case == "target-read-extra":
                frame_clone["target_reads"].append(
                    copy.deepcopy(frame_clone["target_reads"][0])
                )
            elif case == "claim-use-short":
                frame_clone["claim_uses"].clear()
            elif case == "claim-use-extra":
                frame_clone["claim_uses"].append(
                    copy.deepcopy(frame_clone["claim_uses"][0])
                )
            elif case == "use-locator":
                frame_clone["claim_uses"][0]["claim_locator"] = "/claims/0"
            else:
                frame_clone["claim_uses"][0]["claim"]["proposed_value"] = (
                    "changed only in clone"
                )

        for case in (
            "target-read-short",
            "target-read-extra",
            "claim-use-short",
            "claim-use-extra",
            "use-locator",
            "use-claim",
        ):
            with self.subTest(case=case):
                # Preserve the same-call ValidatedSupply identity. Deep-copying
                # the whole frame changes frame_clone["validated"] and can make
                # the outer-context identity guard the false-positive stop.
                frame_clone = dict(frame)
                frame_clone["target_reads"] = copy.deepcopy(frame["target_reads"])
                frame_clone["claim_uses"] = copy.deepcopy(frame["claim_uses"])
                self.assertIs(frame_clone["validated"], validated)
                mutate(frame_clone, case)
                bad_frame_before = copy.deepcopy(frame_clone)
                caught = None
                try:
                    compare_dependencies_and_handoff_detail(context, frame_clone)
                except Exception as exc:
                    caught = exc
                finally:
                    self.assertEqual(raw, raw_before)
                    self.assertEqual(validated, validated_before)
                    self.assertEqual(definitions, definitions_before)
                    self.assertEqual(context, context_before)
                    self.assertEqual(frame, frame_before)
                    self.assertEqual(frame_clone, bad_frame_before)
                self.assertIsInstance(caught, NotImplementedError)
                self.assertTrue(str(caught).startswith(FN6_FRAME_STOP), str(caught))
                self.assertIn(FN6_BACKFLOW, str(caught))


if __name__ == "__main__":
    unittest.main()
