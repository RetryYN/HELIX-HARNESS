"""B02（受領は消込でない）の fn0→fn1→fn6 経路に対する垂直スライス検証。

期待の根拠:
- L4-basic-design/template-semantic-supply.json#/dependency_semantic_ports
- L5-detail-design/template-semantic-supply.json#/functions/6
- L5-detail-design/template-semantic-supply.json#/failure_rules/1..2
- L5-detail-design/template-semantic-supply.json#/dependency_incoming_detail
- L5-detail-design/template-semantic-supply.json#/canonical_dependency_detail
- L5-detail-design/template-semantic-supply.json#/claim_intent_detail
- L8-unit-verification/template-semantic-supply.json#/function_oracles/6
- L8-unit-verification/template-semantic-supply.json#/cases/1/negative_cases/0..1
- L8-unit-verification/template-semantic-supply.json#/additional_unit_cases/37..38

各caseが指定する部分観測のみをassertし、Comparison全体一致比較は行わない。
対象外・未行使分岐（DP-2実供給、条件依存selector true/欠落、常時必須Ref欠落、
canonical body resolved、B02以外のClaim kind等）は契約/分岐ID付きNotImplementedErrorで停止する。
"""

from __future__ import annotations

import copy
import hashlib
import json
import unittest

from dependencies_handoff import (
    compare_dependencies_and_handoff,
    read_canonical_dependency_body,
    read_claim_intent,
    read_os_obligation_incoming,
    read_receipt_claim_origin,
)
from descriptor_definitions import (
    compare_descriptor_definitions,
    validate_supply_input,
)
from supply_input_fixtures import base_input, load_document

B02_PATH_ID = "HELIXBRAIN-L6-032-B02-FN6-PATH"

REQUIRED_ALWAYS_IDENTITIES = (
    "HELIXBRAIN-L2-003",
    "HELIXBRAIN-L2-005",
    "HELIXBRAIN-L2-007",
    "HELIXBRAIN-L2-008",
    "HELIXBRAIN-L2-028",
)

TARGET_FN6_RULE_REFS = {
    "HELIXBRAIN-L5-032-R-required_dependency_missing",
    "HELIXBRAIN-L5-032-R-dependency_selector_unknown",
    "HELIXBRAIN-L5-032-R-receipt_as_product_discharge",
    "HELIXBRAIN-L5-032-R-receipt_as_na",
}


def _synthetic_ref_from(
    template_ref: dict,
    identity: str,
    *,
    owner: str | None = None,
    locator: str | None = None,
) -> dict:
    ref = copy.deepcopy(template_ref)
    ref["identity"] = identity
    if owner is not None:
        ref["owner"] = owner
    if locator is not None:
        ref["source_locator"] = locator
    return ref


def _append_qualified_semantic_source(
    raw: dict,
    identity: str,
    content: dict,
    *,
    owner: str = "brain_owner",
) -> tuple[int, dict]:
    content_bytes = json.dumps(
        content, ensure_ascii=False, separators=(",", ":"), sort_keys=True
    )
    digest = hashlib.sha256(content_bytes.encode("utf-8")).hexdigest()
    base_source = raw["sources"][0]
    base_qual = raw["qualifications"][0]

    source_index = len(raw["sources"])
    qual_index = len(raw["qualifications"])
    source_ref = {
        "identity": identity,
        "revision": base_source["ref"]["revision"],
        "scope": copy.deepcopy(base_source["ref"]["scope"]),
        "owner": owner,
        "source_locator": f"/sources/{source_index}",
        "sha256": digest,
    }
    qual_ref = {
        "identity": f"{identity}-qualification",
        "revision": base_qual["ref"]["revision"],
        "scope": copy.deepcopy(base_qual["ref"]["scope"]),
        "owner": base_qual["ref"]["owner"],
        "source_locator": f"/qualifications/{qual_index}",
        "sha256": base_qual["ref"]["sha256"],
    }
    qualification = {
        "ref": copy.deepcopy(qual_ref),
        "subject_ref": copy.deepcopy(source_ref),
        "subject_sha256": digest,
        "applicable_scope": copy.deepcopy(source_ref["scope"]),
        "qualification_body": copy.deepcopy(base_qual["qualification_body"]),
        "root_ref": copy.deepcopy(base_qual["root_ref"]),
    }
    source = {
        "ref": copy.deepcopy(source_ref),
        "content": copy.deepcopy(content),
        "content_bytes": content_bytes,
        "qualification_ref": copy.deepcopy(qual_ref),
        "role": "semantic_json",
    }
    raw["qualifications"].append(qualification)
    raw["sources"].append(source)
    return source_index, source_ref


def _build_receipt_carrier_content(
    subject_ref: dict,
    binding: dict,
    basis_refs: list[dict],
    *,
    input_flag: bool = True,
    return_flag: bool = True,
    actor: str | None = "BRAIN",
) -> dict:
    """L4#/dependency_semantic_ports/schema/new_defs/ReceiptClaimCarrier & ReceiptInvocationOrigin."""
    origin_ref = _synthetic_ref_from(
        subject_ref,
        "SYNTHETIC-030-INVOCATION-ORIGIN",
        owner="brain_owner",
        locator="/receipt/origins/0",
    )
    producer_contract_ref = _synthetic_ref_from(
        subject_ref,
        "HELIXBRAIN-L5-030-B01",
        owner="brain_owner",
        locator="/receipt/contracts/0",
    )
    return {
        "origin": {
            "origin_ref": origin_ref,
            "subject_ref": copy.deepcopy(subject_ref),
            "binding": copy.deepcopy(binding),
            "actor": actor,
            "basis_refs": copy.deepcopy(basis_refs),
            "producer_contract_ref": producer_contract_ref,
        },
        "producer_input": {
            "claims": {
                "receipt_obligation_completed": input_flag,
            },
        },
        "producer_return": {
            "claim_results": {
                "receipt_obligation_completed": return_flag,
            },
        },
    }


def _build_os_incoming_content(
    raw: dict,
    subject_ref: dict,
    *,
    original_state: str = "completed",
    supply_discharge_assertion: bool = False,
    discharge_assertion_value: object = None,
) -> dict:
    """L4#/dependency_semantic_ports/schema/new_defs/OSObligationMeaningIncoming (11 members)."""
    binding = raw["binding"]
    req_ref = binding["requirement_ref"]
    req_scope = req_ref["scope"] if isinstance(req_ref.get("scope"), dict) else {}

    os_source_ref = _synthetic_ref_from(
        req_ref,
        "SYNTHETIC-OS-OBLIGATION-SOURCE",
        owner="os_owner",
        locator="/os/obligations/0",
    )
    os_qual_ref = _synthetic_ref_from(
        raw["qualifications"][0]["ref"],
        "SYNTHETIC-OS-OBLIGATION-QUAL",
        owner="os_owner",
        locator="/os/qualifications/0",
    )
    state_contract_ref = _synthetic_ref_from(
        req_ref,
        "SYNTHETIC-OS-STATE-CONTRACT",
        owner="os_owner",
        locator="/os/state_contracts/0",
    )
    orig_requirement_ref = copy.deepcopy(req_ref)
    orig_requirement_ref["source_locator"] = "/os/project/requirement_ref"
    orig_template_ref = copy.deepcopy(binding["template_ref"])
    orig_template_ref["source_locator"] = "/os/project/template_ref"

    discharge_assertion = (
        {"presence": "supplied", "value": discharge_assertion_value}
        if supply_discharge_assertion
        else {"presence": "absent"}
    )

    return {
        "obligation_ref": {"presence": "supplied", "value": copy.deepcopy(subject_ref)},
        "original_state": {"presence": "supplied", "value": original_state},
        "state_contract_ref": state_contract_ref,
        "meaning_body": {"summary": "OS案件義務の原状態記録であり消込命題ではない"},
        "discharge_assertion": discharge_assertion,
        "binding": copy.deepcopy(binding),
        "source_ref": os_source_ref,
        "qualification_ref": {"presence": "supplied", "value": os_qual_ref},
        "source_locator": "/os/obligations/0",
        "basis_refs": [copy.deepcopy(os_source_ref)],
        "original_project_binding": {
            "project_scope": {
                "presence": "supplied",
                "value": {
                    "project": {
                        "presence": "supplied",
                        "value": req_scope.get("project"),
                    },
                    "tenant": {
                        "presence": "supplied",
                        "value": req_scope.get("tenant"),
                    },
                    "environment": {
                        "presence": "supplied",
                        "value": req_scope.get("environment"),
                    },
                },
            },
            "requirement_ref": {"presence": "supplied", "value": orig_requirement_ref},
            "HARNESS_contract_ref": {"presence": "absent"},
            "template_ref": {"presence": "supplied", "value": orig_template_ref},
            "semantic_contract_ref": {"presence": "absent"},
        },
    }


class TestB02DependenciesAndHandoff(unittest.TestCase):
    def setUp(self) -> None:
        self.document = load_document()

    def _run_same_snapshot_fn6(self, raw: dict) -> tuple[dict, dict, dict]:
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], raw_before)
        validated_before = copy.deepcopy(validated)

        definitions = compare_descriptor_definitions({"validated": validated})
        self.assertEqual(
            definitions["producer_symbol"], "compare_descriptor_definitions"
        )
        self.assertEqual(
            set(definitions), {"axes", "findings", "producer_symbol", "input_binding"}
        )
        self.assertEqual(definitions["input_binding"], raw_before["binding"])
        definitions_before = copy.deepcopy(definitions)
        self.assertEqual(validated, validated_before)

        result = compare_dependencies_and_handoff(
            {
                "validated": validated,
                "definitions": definitions,
            }
        )
        self.assertEqual(result["producer_symbol"], "compare_dependencies_and_handoff")
        self.assertEqual(
            set(result), {"axes", "findings", "producer_symbol", "input_binding"}
        )
        self.assertEqual(result["input_binding"], raw_before["binding"])
        self.assertEqual(definitions, definitions_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(raw, raw_before)
        return validated, definitions, result

    def test_normal_path_observes_always_unknown_unselected_and_handoff_not_received(
        self,
    ) -> None:
        """L8#/function_oracles/6: 常時5参照unknown、unselected unobserved、handoff not_received（L4#/failure_classifications/84によりos_owner）、原definition known併存。"""
        raw = base_input(self.document)
        raw_before = copy.deepcopy(raw)
        validated, definitions, result = self._run_same_snapshot_fn6(raw)

        target_findings = [
            f for f in result["findings"] if f.get("rule_ref") in TARGET_FN6_RULE_REFS
        ]
        self.assertEqual(target_findings, [])

        dep_axes = [
            axis
            for axis in result["axes"]
            if axis["axis"] == "dependency_reference"
            and axis["binding"] == raw_before["binding"]
        ]
        self.assertEqual(len(dep_axes), 5)
        for index, expected_identity in enumerate(REQUIRED_ALWAYS_IDENTITIES):
            with self.subTest(always_ref=expected_identity):
                axis = dep_axes[index]
                self.assertEqual(
                    axis["subject_ref"], raw_before["binding"]["knowledge_ref"]
                )
                self.assertEqual(axis["state"], "unknown")
                self.assertEqual(
                    axis["original_refs"], raw_before["dependencies"]["always_refs"]
                )
                self.assertEqual(axis["backflow_owner"], "knowledge_owner")
                self.assertIn(
                    f'"request_locator":"/dependencies/always_refs/{index}"',
                    axis["reason"],
                )

                body_read = read_canonical_dependency_body(
                    validated,
                    {
                        "request_ref_locator": f"/dependencies/always_refs/{index}",
                        "category_locator": "/dependencies/always_refs",
                    },
                )
                self.assertEqual(
                    list(body_read.keys()),
                    [
                        "target_ref",
                        "binding",
                        "state",
                        "records",
                        "problems",
                        "category_refs",
                    ],
                )
                self.assertEqual(body_read["state"], "unknown")
                self.assertEqual(body_read["records"], [])
                self.assertEqual(len(body_read["problems"]), 1)
                self.assertEqual(
                    body_read["target_ref"]["value"]["identity"], expected_identity
                )
                self.assertEqual(
                    body_read["binding"],
                    {"presence": "supplied", "value": raw_before["binding"]},
                )
                self.assertEqual(
                    list(body_read["problems"][0].keys()),
                    [
                        "state",
                        "request_locator",
                        "source_locators",
                        "member",
                        "original_presence",
                        "reason",
                    ],
                )
                self.assertEqual(body_read["problems"][0]["state"], "unknown")
                self.assertEqual(
                    body_read["problems"][0]["request_locator"],
                    f"/dependencies/always_refs/{index}",
                )
                self.assertEqual(body_read["problems"][0]["source_locators"], [])
                self.assertEqual(body_read["problems"][0]["member"], "canonical_source")

        unselected_axes = [
            axis
            for axis in result["axes"]
            if axis["axis"] == "unselected_source"
            and axis["binding"] == raw_before["binding"]
        ]
        self.assertEqual(
            len(unselected_axes), len(raw_before["dependencies"]["unselected_refs"])
        )
        self.assertEqual(
            unselected_axes[0]["subject_ref"], raw_before["binding"]["knowledge_ref"]
        )
        self.assertEqual(unselected_axes[0]["state"], "unobserved")
        self.assertEqual(
            unselected_axes[0]["original_refs"],
            [raw_before["dependencies"]["unselected_refs"][0]],
        )
        self.assertIsNone(unselected_axes[0]["backflow_owner"])

        handoff_axes = [
            axis
            for axis in result["axes"]
            if axis["axis"] == "handoff"
            and axis["subject_ref"] == raw_before["handoff_records"][0]["subject_ref"]
            and axis["binding"] == raw_before["handoff_records"][0]["binding"]
        ]
        self.assertEqual(len(handoff_axes), 1)
        self.assertEqual(
            handoff_axes[0]["state"], raw_before["handoff_records"][0]["state"]
        )
        self.assertEqual(
            handoff_axes[0]["original_refs"],
            [raw_before["handoff_records"][0]["source_ref"]],
        )
        # L4#/dependency_semantic_ports/public_projection/axis_reason_writer/axis_root/writers/backflow_owner
        # and L4#/failure_classifications/84: 明示not_receivedのhandoffはclassification/84に従いos_owner。
        self.assertEqual(handoff_axes[0]["backflow_owner"], "os_owner")

        selection_axes = [
            axis for axis in result["axes"] if axis["axis"] == "dependency_selection"
        ]
        self.assertEqual(selection_axes, [])
        self.assertTrue(
            any(
                axis["axis"] == "descriptor.attribution" and axis["state"] == "known"
                for axis in definitions["axes"]
            )
        )

    def test_b02_neg01_receipt_does_not_discharge_project_obligation(self) -> None:
        raw = base_input(self.document)
        subject_ref = copy.deepcopy(raw["binding"]["requirement_ref"])
        carrier_content = _build_receipt_carrier_content(
            subject_ref,
            raw["binding"],
            [copy.deepcopy(raw["sources"][0]["ref"])],
        )
        _, receipt_ref = _append_qualified_semantic_source(
            raw, "knowledge-receipt", carrier_content
        )
        claim = {
            "subject_ref": subject_ref,
            "binding": copy.deepcopy(raw["binding"]),
            "actor": "BRAIN",
            "kind": "project_obligation_discharge",
            "proposed_value": True,
            "basis_refs": [receipt_ref],
        }
        raw["claims"].append(claim)
        raw_before = copy.deepcopy(raw)

        validated, _, result = self._run_same_snapshot_fn6(raw)
        self.assertEqual(validated["input"], raw_before)

        matching_findings = [
            finding
            for finding in result["findings"]
            if finding["rule_ref"] == "HELIXBRAIN-L5-032-R-receipt_as_product_discharge"
        ]
        self.assertEqual(len(matching_findings), 1)
        finding = matching_findings[0]
        self.assertEqual(finding["code"], "receipt_as_product_discharge")
        self.assertEqual(finding["subject_ref"], claim["subject_ref"])
        self.assertEqual(finding["binding"], claim["binding"])
        self.assertEqual(finding["axis"], "obligation_discharge_claim")
        self.assertEqual(finding["state"], "unknown")
        self.assertEqual(finding["source_refs"], claim["basis_refs"])
        self.assertEqual(finding["backflow_owner"], "os_owner")

        matching_axes = [
            axis
            for axis in result["axes"]
            if axis["axis"] == "obligation_discharge_claim"
            and axis["subject_ref"] == claim["subject_ref"]
            and axis["binding"] == claim["binding"]
        ]
        self.assertEqual(len(matching_axes), 1)
        self.assertEqual(matching_axes[0]["state"], "unknown")
        self.assertEqual(matching_axes[0]["original_refs"], claim["basis_refs"])
        self.assertEqual(matching_axes[0]["backflow_owner"], "os_owner")

    def test_b02_neg02_receipt_does_not_establish_field_not_applicable(self) -> None:
        raw = base_input(self.document)
        subject_ref = copy.deepcopy(raw["section_fields"][0]["ref"])
        carrier_content = _build_receipt_carrier_content(
            subject_ref,
            raw["binding"],
            [copy.deepcopy(raw["sources"][0]["ref"])],
        )
        _, receipt_ref = _append_qualified_semantic_source(
            raw, "knowledge-receipt", carrier_content
        )
        claim = {
            "subject_ref": subject_ref,
            "binding": copy.deepcopy(raw["binding"]),
            "actor": "BRAIN",
            "kind": "field_not_applicable",
            "proposed_value": "not_applicable",
            "basis_refs": [receipt_ref],
        }
        raw["claims"].append(claim)
        raw_before = copy.deepcopy(raw)

        validated, _, result = self._run_same_snapshot_fn6(raw)
        self.assertEqual(validated["input"], raw_before)

        matching_findings = [
            finding
            for finding in result["findings"]
            if finding["rule_ref"] == "HELIXBRAIN-L5-032-R-receipt_as_na"
        ]
        self.assertEqual(len(matching_findings), 1)
        finding = matching_findings[0]
        self.assertEqual(finding["code"], "receipt_as_na")
        self.assertEqual(finding["subject_ref"], claim["subject_ref"])
        self.assertEqual(finding["binding"], claim["binding"])
        self.assertEqual(finding["axis"], "applicability_claim")
        self.assertEqual(finding["state"], "unknown")
        self.assertEqual(finding["source_refs"], claim["basis_refs"])
        self.assertEqual(finding["backflow_owner"], "core_owner")

        matching_axes = [
            axis
            for axis in result["axes"]
            if axis["axis"] == "applicability_claim"
            and axis["subject_ref"] == claim["subject_ref"]
            and axis["binding"] == claim["binding"]
        ]
        self.assertEqual(len(matching_axes), 1)
        self.assertEqual(matching_axes[0]["state"], "unknown")
        self.assertEqual(matching_axes[0]["original_refs"], claim["basis_refs"])
        self.assertEqual(matching_axes[0]["backflow_owner"], "core_owner")

    def test_dp1_receipt_origin_preserved_without_discharge_and_mismatch_keeps_raw_predicate(
        self,
    ) -> None:
        raw = base_input(self.document)
        subject_ref = copy.deepcopy(raw["binding"]["requirement_ref"])
        binding = copy.deepcopy(raw["binding"])
        origin_basis_ref = _synthetic_ref_from(
            raw["sources"][0]["ref"], "SYNTHETIC-030-BASIS"
        )
        carrier_content = _build_receipt_carrier_content(
            subject_ref, binding, [origin_basis_ref]
        )
        carrier_idx, carrier_source_ref = _append_qualified_semantic_source(
            raw, "SYNTHETIC-030-RECEIPT-CARRIER", carrier_content
        )
        claim = {
            "subject_ref": copy.deepcopy(subject_ref),
            "binding": copy.deepcopy(binding),
            "actor": "BRAIN",
            "kind": "project_obligation_discharge",
            "proposed_value": True,
            "basis_refs": [copy.deepcopy(carrier_source_ref)],
        }
        raw["claims"].append(claim)
        raw_before = copy.deepcopy(raw)

        carrier_locator = f"/sources/{carrier_idx}/content"
        request = {
            "carrier_locator": carrier_locator,
            "consumer_subject_ref_locator": "/claims/0/subject_ref",
            "consumer_binding_locator": "/claims/0/binding",
        }
        projection = read_receipt_claim_origin(raw, request)
        self.assertEqual(
            list(projection.keys()),
            ["origin_ref", "claim", "state", "reason", "source_locators"],
        )
        self.assertEqual(
            projection["origin_ref"],
            {"presence": "supplied", "value": carrier_content["origin"]["origin_ref"]},
        )
        self.assertEqual(projection["state"], "resolved")
        self.assertEqual(projection["claim"]["presence"], "supplied")
        self.assertEqual(
            projection["claim"]["value"]["kind"], "project_obligation_discharge"
        )
        self.assertIs(projection["claim"]["value"]["proposed_value"], True)
        self.assertEqual(projection["claim"]["value"]["actor"], "BRAIN")
        self.assertEqual(projection["claim"]["value"]["basis_refs"], [origin_basis_ref])
        self.assertEqual(
            projection["reason"],
            "同元生成recordのtargetとfull Bindingを保持し、030 boolean flagを原値でClaimへ投影した。実義務成立を認定しない。",
        )
        self.assertEqual(projection["source_locators"], [carrier_locator])

        derived_intent = read_claim_intent(
            projection["claim"]["value"],
            f"{carrier_locator}/producer_input/claims/receipt_obligation_completed",
        )
        self.assertEqual(derived_intent["intent"], "positive")
        self.assertEqual(
            derived_intent["reason"],
            "既存030 boolean flag trueの肯定主張を保持する。",
        )

        _, _, result = self._run_same_snapshot_fn6(raw)
        self.assertEqual(raw, raw_before)
        findings = [
            f
            for f in result["findings"]
            if f["rule_ref"] == "HELIXBRAIN-L5-032-R-receipt_as_product_discharge"
        ]
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0]["state"], "unknown")
        self.assertEqual(findings[0]["backflow_owner"], "os_owner")

        # Origin subject mismatch is recorded on the projection read without suppressing raw Claim evaluation.
        mismatched_raw = base_input(self.document)
        other_subject = _synthetic_ref_from(subject_ref, "OTHER-UNRELATED-SUBJECT")
        bad_carrier = _build_receipt_carrier_content(
            other_subject, binding, [origin_basis_ref]
        )
        bad_idx, bad_source_ref = _append_qualified_semantic_source(
            mismatched_raw, "SYNTHETIC-030-MISMATCH-CARRIER", bad_carrier
        )
        mismatched_raw["claims"].append(
            {
                "subject_ref": copy.deepcopy(subject_ref),
                "binding": copy.deepcopy(binding),
                "actor": "BRAIN",
                "kind": "project_obligation_discharge",
                "proposed_value": True,
                "basis_refs": [copy.deepcopy(bad_source_ref)],
            }
        )
        bad_projection = read_receipt_claim_origin(
            mismatched_raw,
            {
                "carrier_locator": f"/sources/{bad_idx}/content",
                "consumer_subject_ref_locator": "/claims/0/subject_ref",
                "consumer_binding_locator": "/claims/0/binding",
            },
        )
        self.assertEqual(
            list(bad_projection.keys()),
            ["origin_ref", "claim", "state", "reason", "source_locators"],
        )
        self.assertEqual(bad_projection["state"], "conflict")
        self.assertEqual(bad_projection["claim"], {"presence": "absent"})
        self.assertEqual(
            bad_projection["reason"],
            "元carrierのsubject_refと同callerのconsumer subject_refがfullRef不一致。030 flagを別targetへ投影しない。",
        )
        self.assertEqual(
            bad_projection["source_locators"], [f"/sources/{bad_idx}/content"]
        )

        _, _, mismatch_result = self._run_same_snapshot_fn6(mismatched_raw)
        mismatch_findings = [
            f
            for f in mismatch_result["findings"]
            if f["rule_ref"] == "HELIXBRAIN-L5-032-R-receipt_as_product_discharge"
        ]
        self.assertEqual(len(mismatch_findings), 1)

    def test_dp1_os_incoming_binding_and_original_state_separated_for_both_variants(
        self,
    ) -> None:
        # Variant 1: B02-NEG-01 (project_obligation_discharge=True) + OS incoming with original_state="completed"
        raw_v1 = base_input(self.document)
        subject_ref_v1 = copy.deepcopy(raw_v1["binding"]["requirement_ref"])
        binding_v1 = copy.deepcopy(raw_v1["binding"])
        carrier_v1 = _build_receipt_carrier_content(
            subject_ref_v1,
            binding_v1,
            [_synthetic_ref_from(raw_v1["sources"][0]["ref"], "SYNTHETIC-030-BASIS")],
        )
        _, receipt_ref_v1 = _append_qualified_semantic_source(
            raw_v1, "SYNTHETIC-030-CARRIER-V1", carrier_v1
        )
        os_incoming_v1 = _build_os_incoming_content(
            raw_v1, subject_ref_v1, original_state="completed"
        )
        os_idx_v1, os_wrapper_ref_v1 = _append_qualified_semantic_source(
            raw_v1, "SYNTHETIC-OS-INCOMING-WRAPPER-V1", os_incoming_v1, owner="os_owner"
        )
        # Also append an unreferenced DP-2 OS incoming source to verify M3 (unreferenced sources are not scanned).
        unrelated_dp2 = _build_os_incoming_content(
            raw_v1,
            subject_ref_v1,
            original_state="completed",
            supply_discharge_assertion=True,
            discharge_assertion_value=True,
        )
        _append_qualified_semantic_source(
            raw_v1, "UNREFERENCED-DP2-SOURCE", unrelated_dp2, owner="os_owner"
        )
        claim_v1 = {
            "subject_ref": copy.deepcopy(subject_ref_v1),
            "binding": copy.deepcopy(binding_v1),
            "actor": "BRAIN",
            "kind": "project_obligation_discharge",
            "proposed_value": True,
            "basis_refs": [
                copy.deepcopy(receipt_ref_v1),
                copy.deepcopy(os_wrapper_ref_v1),
            ],
        }
        raw_v1["claims"].append(claim_v1)

        validated_v1, _, result_v1 = self._run_same_snapshot_fn6(raw_v1)
        os_read_v1 = read_os_obligation_incoming(
            validated_v1, claim_v1, os_idx_v1, claim_index=0, basis_index=1
        )
        self.assertEqual(
            list(os_read_v1.keys()),
            [
                "claim_locator",
                "claim_index",
                "raw_claim",
                "claim_intent",
                "basis_index",
                "basis_ref",
                "source_index",
                "raw_body",
                "typed_body",
                "request",
                "projection_read",
                "os_binding_comparison",
                "support_components",
            ],
        )
        typed_body = os_read_v1["typed_body"]
        self.assertEqual(
            set(typed_body.keys()),
            {
                "obligation_ref",
                "original_state",
                "state_contract_ref",
                "meaning_body",
                "discharge_assertion",
                "binding",
                "source_ref",
                "qualification_ref",
                "source_locator",
                "basis_refs",
                "original_project_binding",
            },
        )
        self.assertEqual(
            set(typed_body["original_project_binding"].keys()),
            {
                "project_scope",
                "requirement_ref",
                "HARNESS_contract_ref",
                "template_ref",
                "semantic_contract_ref",
            },
        )
        self.assertEqual(
            set(
                typed_body["original_project_binding"]["project_scope"]["value"].keys()
            ),
            {"project", "tenant", "environment"},
        )
        self.assertEqual(
            typed_body["original_state"], {"presence": "supplied", "value": "completed"}
        )
        self.assertEqual(typed_body["discharge_assertion"], {"presence": "absent"})
        self.assertEqual(len(os_read_v1["os_binding_comparison"]), 7)
        self.assertTrue(
            all(row["matched"] for row in os_read_v1["os_binding_comparison"])
        )
        self.assertEqual(
            os_read_v1["support_components"],
            {
                "meaning_owner_proposition": False,
                "target_correspondence": True,
                "existing_source_qualification": False,
            },
        )
        self.assertNotEqual(
            typed_body["source_ref"]["identity"],
            raw_v1["sources"][os_idx_v1]["ref"]["identity"],
        )

        findings_v1 = [
            f
            for f in result_v1["findings"]
            if f["rule_ref"] == "HELIXBRAIN-L5-032-R-receipt_as_product_discharge"
        ]
        self.assertEqual(len(findings_v1), 1)
        self.assertEqual(findings_v1[0]["axis"], "obligation_discharge_claim")
        self.assertEqual(findings_v1[0]["state"], "unknown")
        self.assertEqual(findings_v1[0]["backflow_owner"], "os_owner")

        # Variant 2: B02-NEG-02 (field_not_applicable="not_applicable") + OS incoming
        raw_v2 = base_input(self.document)
        subject_ref_v2 = copy.deepcopy(raw_v2["section_fields"][0]["ref"])
        binding_v2 = copy.deepcopy(raw_v2["binding"])
        carrier_v2 = _build_receipt_carrier_content(
            subject_ref_v2,
            binding_v2,
            [
                _synthetic_ref_from(
                    raw_v2["sources"][0]["ref"], "SYNTHETIC-030-BASIS-V2"
                )
            ],
        )
        _, receipt_ref_v2 = _append_qualified_semantic_source(
            raw_v2, "SYNTHETIC-030-CARRIER-V2", carrier_v2
        )
        os_incoming_v2 = _build_os_incoming_content(
            raw_v2, subject_ref_v2, original_state="completed"
        )
        _, os_wrapper_ref_v2 = _append_qualified_semantic_source(
            raw_v2, "SYNTHETIC-OS-INCOMING-WRAPPER-V2", os_incoming_v2, owner="os_owner"
        )
        claim_v2 = {
            "subject_ref": copy.deepcopy(subject_ref_v2),
            "binding": copy.deepcopy(binding_v2),
            "actor": "BRAIN",
            "kind": "field_not_applicable",
            "proposed_value": "not_applicable",
            "basis_refs": [
                copy.deepcopy(receipt_ref_v2),
                copy.deepcopy(os_wrapper_ref_v2),
            ],
        }
        raw_v2["claims"].append(claim_v2)

        _, _, result_v2 = self._run_same_snapshot_fn6(raw_v2)
        findings_v2 = [
            f
            for f in result_v2["findings"]
            if f["rule_ref"] == "HELIXBRAIN-L5-032-R-receipt_as_na"
        ]
        self.assertEqual(len(findings_v2), 1)
        self.assertEqual(findings_v2[0]["axis"], "applicability_claim")
        self.assertEqual(findings_v2[0]["state"], "unknown")
        self.assertEqual(findings_v2[0]["backflow_owner"], "core_owner")

    def test_claim_intent_reader_b02_kinds_and_presence(self) -> None:
        raw = base_input(self.document)
        base_claim = {
            "subject_ref": copy.deepcopy(raw["binding"]["requirement_ref"]),
            "binding": copy.deepcopy(raw["binding"]),
            "actor": "BRAIN",
            "kind": "project_obligation_discharge",
            "proposed_value": True,
            "basis_refs": [],
        }
        pos_discharge = read_claim_intent(base_claim, "/claims/0")
        self.assertEqual(
            list(pos_discharge.keys()),
            ["claim_locator", "claim", "kind", "proposed_value", "intent", "reason"],
        )
        self.assertEqual(pos_discharge["intent"], "positive")
        self.assertEqual(
            pos_discharge["kind"],
            {"presence": "supplied", "value": "project_obligation_discharge"},
        )
        self.assertEqual(
            pos_discharge["proposed_value"], {"presence": "supplied", "value": True}
        )
        self.assertEqual(
            pos_discharge["reason"], "既存030 boolean flag trueの肯定主張を保持する。"
        )

        neg_claim = copy.deepcopy(base_claim)
        neg_claim["proposed_value"] = False
        neg_read = read_claim_intent(neg_claim, "/claims/0")
        self.assertEqual(neg_read["intent"], "negative")
        self.assertEqual(
            neg_read["reason"], "既存030 boolean flag falseの非主張を保持する。"
        )

        null_claim = copy.deepcopy(base_claim)
        null_claim["proposed_value"] = None
        null_read = read_claim_intent(null_claim, "/claims/0")
        self.assertEqual(null_read["intent"], "unresolved")
        self.assertEqual(
            null_read["proposed_value"], {"presence": "supplied", "value": None}
        )
        self.assertEqual(
            null_read["reason"],
            "project_obligation_dischargeのproposed_valueはboolean肯定/否定へ解決できない。原値を保持する。",
        )

        absent_claim = copy.deepcopy(base_claim)
        del absent_claim["proposed_value"]
        absent_read = read_claim_intent(absent_claim, "/claims/0")
        self.assertEqual(absent_read["intent"], "unresolved")
        self.assertEqual(absent_read["proposed_value"], {"presence": "absent"})
        self.assertEqual(
            absent_read["reason"],
            "project_obligation_dischargeのproposed_valueはboolean肯定/否定へ解決できない。原値を保持する。",
        )

        na_pos = copy.deepcopy(base_claim)
        na_pos["kind"] = "field_not_applicable"
        na_pos["proposed_value"] = "not_applicable"
        na_pos_read = read_claim_intent(na_pos, "/claims/1")
        self.assertEqual(na_pos_read["intent"], "positive")
        self.assertEqual(
            na_pos_read["reason"],
            "Claim kind=field_not_applicable の値表現は肯定。原値を保持しdomain成立を認定しない。",
        )

        na_neg = copy.deepcopy(na_pos)
        na_neg["proposed_value"] = "applicable"
        na_neg_read = read_claim_intent(na_neg, "/claims/1")
        self.assertEqual(na_neg_read["intent"], "negative")
        self.assertEqual(
            na_neg_read["reason"],
            "Claim kind=field_not_applicable の値表現は否定。原値を保持しdomain成立を認定しない。",
        )

        na_unres = copy.deepcopy(na_pos)
        na_unres["proposed_value"] = True
        na_unres_read = read_claim_intent(na_unres, "/claims/1")
        self.assertEqual(na_unres_read["intent"], "unresolved")
        self.assertEqual(
            na_unres_read["reason"],
            "Claim kind=field_not_applicable の値表現は未解決。原値を保持しdomain成立を認定しない。",
        )

        unknown_kind_claim = copy.deepcopy(base_claim)
        unknown_kind_claim["kind"] = "unrecognized_future_kind"
        unknown_kind_read = read_claim_intent(unknown_kind_claim, "/claims/2")
        self.assertEqual(unknown_kind_read["intent"], "unresolved")
        self.assertEqual(
            unknown_kind_read["reason"],
            "Claim kindを認識できない。原Claim/RawValueを保持し意図を補完しない。",
        )

        absent_kind_claim = copy.deepcopy(base_claim)
        del absent_kind_claim["kind"]
        absent_kind_read = read_claim_intent(absent_kind_claim, "/claims/3")
        self.assertEqual(absent_kind_read["intent"], "unresolved")
        self.assertEqual(absent_kind_read["kind"], {"presence": "absent"})
        self.assertEqual(
            absent_kind_read["reason"],
            "Claim kindを認識できない。原Claim/RawValueを保持し意図を補完しない。",
        )

    def _assert_fn6_stop(
        self, raw: dict, expected_tag: str, *, definitions_override: dict | None = None
    ) -> None:
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input_issues"], [])
        definitions = (
            definitions_override
            if definitions_override is not None
            else compare_descriptor_definitions({"validated": validated})
        )
        definitions_before = copy.deepcopy(definitions)
        validated_before = copy.deepcopy(validated)

        with self.assertRaises(NotImplementedError) as caught:
            compare_dependencies_and_handoff(
                {
                    "validated": validated,
                    "definitions": definitions,
                }
            )
        message = str(caught.exception)
        self.assertIn(expected_tag, message)
        self.assertIn(B02_PATH_ID, message)
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(definitions, definitions_before)

    def test_dp2_positive_os_discharge_assertion_stops_with_not_implemented(
        self,
    ) -> None:
        raw = base_input(self.document)
        subject_ref = copy.deepcopy(raw["binding"]["requirement_ref"])
        carrier = _build_receipt_carrier_content(
            subject_ref, raw["binding"], [copy.deepcopy(raw["sources"][0]["ref"])]
        )
        _, receipt_ref = _append_qualified_semantic_source(
            raw, "knowledge-receipt", carrier
        )
        os_incoming = _build_os_incoming_content(
            raw,
            subject_ref,
            original_state="completed",
            supply_discharge_assertion=True,
            discharge_assertion_value=True,
        )
        _, dp2_ref = _append_qualified_semantic_source(
            raw, "SYNTHETIC-OS-DP2-POSITIVE", os_incoming, owner="os_owner"
        )
        raw["claims"].append(
            {
                "subject_ref": subject_ref,
                "binding": copy.deepcopy(raw["binding"]),
                "actor": "BRAIN",
                "kind": "project_obligation_discharge",
                "proposed_value": True,
                "basis_refs": [receipt_ref, dp2_ref],
            }
        )
        self._assert_fn6_stop(raw, "B02/DP2/os_positive_discharge_assertion")

    def test_os_only_or_unresolvable_basis_without_receipt_stops_with_not_implemented(
        self,
    ) -> None:
        # OS-incoming-only basis without any 030 receipt carrier must NOT emit receipt_as_product_discharge.
        raw_os_only = base_input(self.document)
        subject_ref = copy.deepcopy(raw_os_only["binding"]["requirement_ref"])
        os_incoming = _build_os_incoming_content(
            raw_os_only, subject_ref, original_state="completed"
        )
        _, os_wrapper_ref = _append_qualified_semantic_source(
            raw_os_only, "SYNTHETIC-OS-ONLY-BASIS", os_incoming, owner="os_owner"
        )
        raw_os_only["claims"].append(
            {
                "subject_ref": subject_ref,
                "binding": copy.deepcopy(raw_os_only["binding"]),
                "actor": "BRAIN",
                "kind": "project_obligation_discharge",
                "proposed_value": True,
                "basis_refs": [os_wrapper_ref],
            }
        )
        self._assert_fn6_stop(raw_os_only, "B02/claim_basis_not_receipt")

        # Unresolvable basis_ref with no matching source in raw["sources"] must stop even if identity contains "receipt".
        raw_unresolved = base_input(self.document)
        raw_unresolved["claims"].append(
            {
                "subject_ref": copy.deepcopy(
                    raw_unresolved["binding"]["requirement_ref"]
                ),
                "binding": copy.deepcopy(raw_unresolved["binding"]),
                "actor": "BRAIN",
                "kind": "project_obligation_discharge",
                "proposed_value": True,
                "basis_refs": [
                    _synthetic_ref_from(
                        raw_unresolved["sources"][0]["ref"], "knowledge-receipt"
                    )
                ],
            }
        )
        self._assert_fn6_stop(raw_unresolved, "B02/claim_basis_not_receipt")

    def test_conditional_selector_true_or_missing_stops_with_not_implemented(
        self,
    ) -> None:
        raw_true = base_input(self.document)
        raw_true["dependencies"]["core_source_selected"] = True
        self._assert_fn6_stop(raw_true, "F09/conditional_selector")

        raw_missing = base_input(self.document)
        del raw_missing["dependencies"]["labo_evaluation_selected"]
        self._assert_fn6_stop(raw_missing, "F09/conditional_selector")

    def test_missing_required_always_ref_stops_with_not_implemented(self) -> None:
        raw = base_input(self.document)
        raw["dependencies"]["always_refs"].pop(0)
        self._assert_fn6_stop(raw, "F09/required_always_ref_missing")

    def test_canonical_body_resolved_source_present_stops_with_not_implemented(
        self,
    ) -> None:
        raw = base_input(self.document)
        always_ref_0 = copy.deepcopy(raw["dependencies"]["always_refs"][0])
        content = {"canonical_identity": always_ref_0["identity"]}
        content_bytes = json.dumps(
            content, ensure_ascii=False, separators=(",", ":"), sort_keys=True
        )
        digest = hashlib.sha256(content_bytes.encode("utf-8")).hexdigest()
        always_ref_0["sha256"] = digest
        raw["dependencies"]["always_refs"][0] = copy.deepcopy(always_ref_0)
        _append_qualified_semantic_source(
            raw, always_ref_0["identity"], content, owner=always_ref_0["owner"]
        )
        raw["sources"][-1]["ref"] = copy.deepcopy(always_ref_0)
        raw["qualifications"][-1]["subject_ref"] = copy.deepcopy(always_ref_0)
        raw["qualifications"][-1]["applicable_scope"] = copy.deepcopy(
            always_ref_0["scope"]
        )
        self._assert_fn6_stop(raw, "F09/canonical_body_resolved")

    def test_unsupported_claim_kind_stops_with_not_implemented(self) -> None:
        raw = base_input(self.document)
        raw["claims"].append(
            {
                "subject_ref": copy.deepcopy(raw["binding"]["requirement_ref"]),
                "binding": copy.deepcopy(raw["binding"]),
                "actor": "BRAIN",
                "kind": "upstream_authority",
                "proposed_value": True,
                "basis_refs": [
                    _synthetic_ref_from(raw["sources"][0]["ref"], "knowledge-receipt")
                ],
            }
        )
        self._assert_fn6_stop(raw, "B02/unsupported_claim_kind")

    def test_non_positive_b02_claim_intent_stops_with_not_implemented(self) -> None:
        raw = base_input(self.document)
        raw["claims"].append(
            {
                "subject_ref": copy.deepcopy(raw["binding"]["requirement_ref"]),
                "binding": copy.deepcopy(raw["binding"]),
                "actor": "BRAIN",
                "kind": "project_obligation_discharge",
                "proposed_value": False,
                "basis_refs": [
                    _synthetic_ref_from(raw["sources"][0]["ref"], "knowledge-receipt")
                ],
            }
        )
        self._assert_fn6_stop(raw, "B02/non_positive_claim_intent")

        # Swapped kind/proposed_value (project_obligation_discharge with "not_applicable") -> unresolved -> stop.
        raw_swap1 = base_input(self.document)
        raw_swap1["claims"].append(
            {
                "subject_ref": copy.deepcopy(raw_swap1["binding"]["requirement_ref"]),
                "binding": copy.deepcopy(raw_swap1["binding"]),
                "actor": "BRAIN",
                "kind": "project_obligation_discharge",
                "proposed_value": "not_applicable",
                "basis_refs": [
                    _synthetic_ref_from(
                        raw_swap1["sources"][0]["ref"], "knowledge-receipt"
                    )
                ],
            }
        )
        self._assert_fn6_stop(raw_swap1, "B02/non_positive_claim_intent")

        # Swapped kind/proposed_value (field_not_applicable with True) -> unresolved -> stop.
        raw_swap2 = base_input(self.document)
        raw_swap2["claims"].append(
            {
                "subject_ref": copy.deepcopy(raw_swap2["section_fields"][0]["ref"]),
                "binding": copy.deepcopy(raw_swap2["binding"]),
                "actor": "BRAIN",
                "kind": "field_not_applicable",
                "proposed_value": True,
                "basis_refs": [
                    _synthetic_ref_from(
                        raw_swap2["sources"][0]["ref"], "knowledge-receipt"
                    )
                ],
            }
        )
        self._assert_fn6_stop(raw_swap2, "B02/non_positive_claim_intent")

    def test_known_definition_applicability_and_handoff_or_subject_stops(self) -> None:
        raw = base_input(self.document)
        subject_ref = copy.deepcopy(raw["section_fields"][0]["ref"])
        carrier = _build_receipt_carrier_content(
            subject_ref, raw["binding"], [copy.deepcopy(raw["sources"][0]["ref"])]
        )
        _, receipt_ref = _append_qualified_semantic_source(
            raw, "knowledge-receipt", carrier
        )
        raw["claims"].append(
            {
                "subject_ref": subject_ref,
                "binding": copy.deepcopy(raw["binding"]),
                "actor": "BRAIN",
                "kind": "field_not_applicable",
                "proposed_value": "not_applicable",
                "basis_refs": [receipt_ref],
            }
        )
        validated = validate_supply_input(raw)
        definitions = compare_descriptor_definitions({"validated": validated})
        for axis in definitions["axes"]:
            if axis["axis"].endswith(".definition_applicability"):
                axis["state"] = "known"
                break
        self._assert_fn6_stop(
            raw, "B02/known_definition_applicability", definitions_override=definitions
        )

        # Unrelated subject_ref not in section_fields stops with B02/subject_field_not_found.
        raw_unmatched_field = base_input(self.document)
        unmatched_ref = _synthetic_ref_from(
            raw_unmatched_field["section_fields"][0]["ref"], "UNMATCHED-FIELD-REF"
        )
        carrier_unmatched = _build_receipt_carrier_content(
            unmatched_ref,
            raw_unmatched_field["binding"],
            [copy.deepcopy(raw_unmatched_field["sources"][0]["ref"])],
        )
        _, receipt_unmatched = _append_qualified_semantic_source(
            raw_unmatched_field, "knowledge-receipt-unmatched", carrier_unmatched
        )
        raw_unmatched_field["claims"].append(
            {
                "subject_ref": unmatched_ref,
                "binding": copy.deepcopy(raw_unmatched_field["binding"]),
                "actor": "BRAIN",
                "kind": "field_not_applicable",
                "proposed_value": "not_applicable",
                "basis_refs": [receipt_unmatched],
            }
        )
        self._assert_fn6_stop(raw_unmatched_field, "B02/subject_field_not_found")

        # Handoff record with source_ref=None stops with F09/B02/handoff_source_ref_absent.
        raw_handoff_none = base_input(self.document)
        raw_handoff_none["handoff_records"][0]["source_ref"] = None
        self._assert_fn6_stop(raw_handoff_none, "F09/B02/handoff_source_ref_absent")


if __name__ == "__main__":
    unittest.main()
