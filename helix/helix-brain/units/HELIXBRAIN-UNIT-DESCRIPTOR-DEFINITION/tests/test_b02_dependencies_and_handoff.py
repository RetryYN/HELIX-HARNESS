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


def _synthetic_ref_from(template_ref: dict, identity: str, *, owner: str | None = None, locator: str | None = None) -> dict:
    ref = copy.deepcopy(template_ref)
    ref["identity"] = identity
    if owner is not None:
        ref["owner"] = owner
    if locator is not None:
        ref["source_locator"] = locator
    return ref


def _append_qualified_semantic_source(raw: dict, identity: str, content: dict, *, owner: str = "brain_owner") -> tuple[int, dict]:
    content_bytes = json.dumps(content, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
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
) -> dict:
    return {
        "origin": {
            "subject_ref": copy.deepcopy(subject_ref),
            "binding": copy.deepcopy(binding),
            "basis_refs": copy.deepcopy(basis_refs),
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
    binding = raw["binding"]
    os_source_ref = _synthetic_ref_from(
        binding["requirement_ref"],
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
    orig_template_ref = copy.deepcopy(binding["template_ref"])
    orig_template_ref["source_locator"] = "/os/project/template_ref"
    orig_knowledge_ref = copy.deepcopy(binding["knowledge_ref"])
    orig_knowledge_ref["source_locator"] = "/os/project/knowledge_ref"
    orig_obligation_ref = copy.deepcopy(binding["requirement_ref"])
    orig_obligation_ref["source_locator"] = "/os/project/obligation_ref"

    incoming = {
        "obligation_ref": copy.deepcopy(binding["requirement_ref"]),
        "subject_ref": copy.deepcopy(subject_ref),
        "binding": copy.deepcopy(binding),
        "original_project_binding": {
            "project_id": "SYNTHETIC-PROJECT-01",
            "template_ref": orig_template_ref,
            "knowledge_ref": orig_knowledge_ref,
            "obligation_ref": orig_obligation_ref,
            "project_scope": {
                "product": "HELIX-OS",
                "layer": "L5",
                "artifact_id": "project-template-trace",
            },
        },
        "original_state": original_state,
        "meaning_owner": "os_owner",
        "original_reason": "OS案件義務の原状態記録であり消込命題ではない",
        "reentry_condition": "DP-2でOS ownerが対象義務の意味命題とqualificationを供給した後に再評価",
        "source_ref": os_source_ref,
        "qualification_ref": os_qual_ref,
    }
    if supply_discharge_assertion:
        incoming["discharge_assertion"] = discharge_assertion_value
    return incoming


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
        self.assertEqual(definitions["producer_symbol"], "compare_descriptor_definitions")
        self.assertEqual(set(definitions), {"axes", "findings", "producer_symbol", "input_binding"})
        self.assertEqual(definitions["input_binding"], raw_before["binding"])
        definitions_before = copy.deepcopy(definitions)
        self.assertEqual(validated, validated_before)

        result = compare_dependencies_and_handoff({
            "validated": validated,
            "definitions": definitions,
        })
        self.assertEqual(result["producer_symbol"], "compare_dependencies_and_handoff")
        self.assertEqual(set(result), {"axes", "findings", "producer_symbol", "input_binding"})
        self.assertEqual(result["input_binding"], raw_before["binding"])
        self.assertEqual(definitions, definitions_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(raw, raw_before)
        return validated, definitions, result

    def test_normal_path_observes_always_unknown_unselected_and_handoff_not_received(self) -> None:
        raw = base_input(self.document)
        raw_before = copy.deepcopy(raw)
        validated, definitions, result = self._run_same_snapshot_fn6(raw)

        self.assertEqual(result["findings"], [])
        dep_axes = [
            axis for axis in result["axes"]
            if axis["axis"] == "dependency_reference"
            and axis["binding"] == raw_before["binding"]
        ]
        self.assertEqual(len(dep_axes), 5)
        for index, expected_identity in enumerate(REQUIRED_ALWAYS_IDENTITIES):
            with self.subTest(always_ref=expected_identity):
                axis = dep_axes[index]
                self.assertEqual(axis["subject_ref"], raw_before["binding"]["knowledge_ref"])
                self.assertEqual(axis["state"], "unknown")
                self.assertEqual(axis["original_refs"], raw_before["dependencies"]["always_refs"])
                self.assertEqual(axis["backflow_owner"], "knowledge_owner")
                self.assertIn(f'"request_locator":"/dependencies/always_refs/{index}"', axis["reason"])

                body_read = read_canonical_dependency_body(
                    validated,
                    {
                        "request_ref_locator": f"/dependencies/always_refs/{index}",
                        "category_locator": "/dependencies/always_refs",
                    },
                )
                self.assertEqual(body_read["state"], "unknown")
                self.assertEqual(body_read["records"], [])
                self.assertEqual(len(body_read["problems"]), 1)
                self.assertEqual(body_read["requested_ref"]["value"]["identity"], expected_identity)

        unselected_axes = [
            axis for axis in result["axes"]
            if axis["axis"] == "unselected_source"
            and axis["binding"] == raw_before["binding"]
        ]
        self.assertEqual(len(unselected_axes), len(raw_before["dependencies"]["unselected_refs"]))
        self.assertEqual(unselected_axes[0]["subject_ref"], raw_before["binding"]["knowledge_ref"])
        self.assertEqual(unselected_axes[0]["state"], "unobserved")
        self.assertEqual(unselected_axes[0]["original_refs"], [raw_before["dependencies"]["unselected_refs"][0]])
        self.assertIsNone(unselected_axes[0]["backflow_owner"])

        handoff_axes = [
            axis for axis in result["axes"]
            if axis["axis"] == "handoff"
            and axis["subject_ref"] == raw_before["handoff_records"][0]["subject_ref"]
            and axis["binding"] == raw_before["handoff_records"][0]["binding"]
        ]
        self.assertEqual(len(handoff_axes), 1)
        self.assertEqual(handoff_axes[0]["state"], raw_before["handoff_records"][0]["state"])
        self.assertEqual(handoff_axes[0]["original_refs"], [raw_before["handoff_records"][0]["source_ref"]])
        self.assertEqual(handoff_axes[0]["backflow_owner"], "os_owner")

        selection_axes = [axis for axis in result["axes"] if axis["axis"] == "dependency_selection"]
        self.assertEqual(selection_axes, [])
        self.assertTrue(any(axis["state"] == "unknown" for axis in definitions["axes"]))

    def test_b02_neg01_receipt_does_not_discharge_project_obligation(self) -> None:
        raw = base_input(self.document)
        receipt_ref = _synthetic_ref_from(raw["sources"][0]["ref"], "knowledge-receipt")
        claim = {
            "subject_ref": copy.deepcopy(raw["binding"]["requirement_ref"]),
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
            finding for finding in result["findings"]
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
            axis for axis in result["axes"]
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
        receipt_ref = _synthetic_ref_from(raw["sources"][0]["ref"], "knowledge-receipt")
        claim = {
            "subject_ref": copy.deepcopy(raw["section_fields"][0]["ref"]),
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
            finding for finding in result["findings"]
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
            axis for axis in result["axes"]
            if axis["axis"] == "applicability_claim"
            and axis["subject_ref"] == claim["subject_ref"]
            and axis["binding"] == claim["binding"]
        ]
        self.assertEqual(len(matching_axes), 1)
        self.assertEqual(matching_axes[0]["state"], "unknown")
        self.assertEqual(matching_axes[0]["original_refs"], claim["basis_refs"])
        self.assertEqual(matching_axes[0]["backflow_owner"], "core_owner")

    def test_dp1_receipt_origin_preserved_without_discharge_and_mismatch_keeps_raw_predicate(self) -> None:
        raw = base_input(self.document)
        subject_ref = copy.deepcopy(raw["binding"]["requirement_ref"])
        binding = copy.deepcopy(raw["binding"])
        origin_basis_ref = _synthetic_ref_from(raw["sources"][0]["ref"], "SYNTHETIC-030-BASIS")
        carrier_content = _build_receipt_carrier_content(subject_ref, binding, [origin_basis_ref])
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
            "consumer_subject_ref": copy.deepcopy(subject_ref),
            "consumer_binding": copy.deepcopy(binding),
        }
        projection = read_receipt_claim_origin(raw, request)
        self.assertEqual(
            list(projection.keys()),
            [
                "request",
                "state",
                "carrier",
                "origin_subject_ref",
                "origin_binding",
                "original_flag",
                "claim",
                "source_locators",
                "problems",
            ],
        )
        self.assertEqual(projection["state"], "resolved")
        self.assertEqual(projection["carrier"], {"presence": "supplied", "value": carrier_content})
        self.assertEqual(projection["origin_subject_ref"], {"presence": "supplied", "value": subject_ref})
        self.assertEqual(projection["origin_binding"], {"presence": "supplied", "value": binding})
        self.assertEqual(projection["original_flag"], {"presence": "supplied", "value": True})
        self.assertEqual(projection["claim"]["presence"], "supplied")
        self.assertEqual(projection["claim"]["value"]["kind"], "project_obligation_discharge")
        self.assertIs(projection["claim"]["value"]["proposed_value"], True)
        self.assertEqual(
            projection["source_locators"],
            [
                carrier_locator,
                f"{carrier_locator}/origin",
                f"{carrier_locator}/producer_input/claims/receipt_obligation_completed",
                f"{carrier_locator}/producer_return/claim_results/receipt_obligation_completed",
            ],
        )
        self.assertEqual(projection["problems"], [])

        derived_intent = read_claim_intent(
            projection["claim"]["value"],
            f"{carrier_locator}/producer_input/claims/receipt_obligation_completed",
        )
        self.assertEqual(derived_intent["intent"], "positive")

        _, _, result = self._run_same_snapshot_fn6(raw)
        self.assertEqual(raw, raw_before)
        findings = [
            f for f in result["findings"]
            if f["rule_ref"] == "HELIXBRAIN-L5-032-R-receipt_as_product_discharge"
        ]
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0]["state"], "unknown")
        self.assertEqual(findings[0]["backflow_owner"], "os_owner")

        # Origin subject mismatch is recorded on the projection read without suppressing raw Claim evaluation.
        mismatched_raw = base_input(self.document)
        other_subject = _synthetic_ref_from(subject_ref, "OTHER-UNRELATED-SUBJECT")
        bad_carrier = _build_receipt_carrier_content(other_subject, binding, [origin_basis_ref])
        bad_idx, bad_source_ref = _append_qualified_semantic_source(
            mismatched_raw, "SYNTHETIC-030-MISMATCH-CARRIER", bad_carrier
        )
        mismatched_raw["claims"].append({
            "subject_ref": copy.deepcopy(subject_ref),
            "binding": copy.deepcopy(binding),
            "actor": "BRAIN",
            "kind": "project_obligation_discharge",
            "proposed_value": True,
            "basis_refs": [copy.deepcopy(bad_source_ref)],
        })
        bad_projection = read_receipt_claim_origin(
            mismatched_raw,
            {
                "carrier_locator": f"/sources/{bad_idx}/content",
                "consumer_subject_ref": copy.deepcopy(subject_ref),
                "consumer_binding": copy.deepcopy(binding),
            },
        )
        self.assertEqual(bad_projection["state"], "conflict")
        self.assertEqual(bad_projection["claim"], {"presence": "absent"})
        self.assertEqual(bad_projection["problems"][0]["branch"], "subject_or_binding_mismatch")

        _, _, mismatch_result = self._run_same_snapshot_fn6(mismatched_raw)
        mismatch_findings = [
            f for f in mismatch_result["findings"]
            if f["rule_ref"] == "HELIXBRAIN-L5-032-R-receipt_as_product_discharge"
        ]
        self.assertEqual(len(mismatch_findings), 1)

    def test_dp1_os_incoming_binding_and_original_state_separated_for_both_variants(self) -> None:
        # Variant 1: B02-NEG-01 (project_obligation_discharge=True) + OS incoming with original_state="completed"
        raw_v1 = base_input(self.document)
        subject_ref_v1 = copy.deepcopy(raw_v1["binding"]["requirement_ref"])
        binding_v1 = copy.deepcopy(raw_v1["binding"])
        carrier_v1 = _build_receipt_carrier_content(
            subject_ref_v1, binding_v1, [_synthetic_ref_from(raw_v1["sources"][0]["ref"], "SYNTHETIC-030-BASIS")]
        )
        _, receipt_ref_v1 = _append_qualified_semantic_source(
            raw_v1, "SYNTHETIC-030-CARRIER-V1", carrier_v1
        )
        os_incoming_v1 = _build_os_incoming_content(raw_v1, subject_ref_v1, original_state="completed")
        os_idx_v1, _ = _append_qualified_semantic_source(
            raw_v1, "SYNTHETIC-OS-INCOMING-WRAPPER-V1", os_incoming_v1, owner="os_owner"
        )
        claim_v1 = {
            "subject_ref": copy.deepcopy(subject_ref_v1),
            "binding": copy.deepcopy(binding_v1),
            "actor": "BRAIN",
            "kind": "project_obligation_discharge",
            "proposed_value": True,
            "basis_refs": [copy.deepcopy(receipt_ref_v1)],
        }
        raw_v1["claims"].append(claim_v1)

        validated_v1, _, result_v1 = self._run_same_snapshot_fn6(raw_v1)
        os_read_v1 = read_os_obligation_incoming(validated_v1, claim_v1, os_idx_v1)
        self.assertEqual(
            set(os_read_v1["incoming_members"].keys()),
            {
                "obligation_ref",
                "subject_ref",
                "binding",
                "original_project_binding",
                "original_state",
                "discharge_assertion",
                "meaning_owner",
                "original_reason",
                "reentry_condition",
                "source_ref",
                "qualification_ref",
            },
        )
        self.assertEqual(
            set(os_read_v1["original_project_binding_members"].keys()),
            {"project_id", "template_ref", "knowledge_ref", "obligation_ref", "project_scope"},
        )
        self.assertEqual(
            set(os_read_v1["project_scope_members"].keys()),
            {"product", "layer", "artifact_id"},
        )
        self.assertEqual(os_read_v1["incoming_members"]["original_state"], {"presence": "supplied", "value": "completed"})
        self.assertEqual(os_read_v1["incoming_members"]["discharge_assertion"], {"presence": "absent"})
        self.assertEqual(len(os_read_v1["binding_comparison"]), 7)
        self.assertFalse(os_read_v1["positive_support_formed"])
        self.assertNotEqual(
            os_read_v1["incoming_members"]["source_ref"]["value"]["identity"],
            raw_v1["sources"][os_idx_v1]["ref"]["identity"],
        )

        findings_v1 = [
            f for f in result_v1["findings"]
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
            subject_ref_v2, binding_v2, [_synthetic_ref_from(raw_v2["sources"][0]["ref"], "SYNTHETIC-030-BASIS-V2")]
        )
        _, receipt_ref_v2 = _append_qualified_semantic_source(
            raw_v2, "SYNTHETIC-030-CARRIER-V2", carrier_v2
        )
        os_incoming_v2 = _build_os_incoming_content(raw_v2, subject_ref_v2, original_state="completed")
        _append_qualified_semantic_source(
            raw_v2, "SYNTHETIC-OS-INCOMING-WRAPPER-V2", os_incoming_v2, owner="os_owner"
        )
        claim_v2 = {
            "subject_ref": copy.deepcopy(subject_ref_v2),
            "binding": copy.deepcopy(binding_v2),
            "actor": "BRAIN",
            "kind": "field_not_applicable",
            "proposed_value": "not_applicable",
            "basis_refs": [copy.deepcopy(receipt_ref_v2)],
        }
        raw_v2["claims"].append(claim_v2)

        _, _, result_v2 = self._run_same_snapshot_fn6(raw_v2)
        findings_v2 = [
            f for f in result_v2["findings"]
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
        self.assertEqual(pos_discharge["kind"], {"presence": "supplied", "value": "project_obligation_discharge"})
        self.assertEqual(pos_discharge["proposed_value"], {"presence": "supplied", "value": True})

        neg_claim = copy.deepcopy(base_claim)
        neg_claim["proposed_value"] = False
        self.assertEqual(read_claim_intent(neg_claim, "/claims/0")["intent"], "negative")

        null_claim = copy.deepcopy(base_claim)
        null_claim["proposed_value"] = None
        null_read = read_claim_intent(null_claim, "/claims/0")
        self.assertEqual(null_read["intent"], "unresolved")
        self.assertEqual(null_read["proposed_value"], {"presence": "supplied", "value": None})

        absent_claim = copy.deepcopy(base_claim)
        del absent_claim["proposed_value"]
        absent_read = read_claim_intent(absent_claim, "/claims/0")
        self.assertEqual(absent_read["intent"], "unresolved")
        self.assertEqual(absent_read["proposed_value"], {"presence": "absent"})

        na_pos = copy.deepcopy(base_claim)
        na_pos["kind"] = "field_not_applicable"
        na_pos["proposed_value"] = "not_applicable"
        self.assertEqual(read_claim_intent(na_pos, "/claims/1")["intent"], "positive")

        na_neg = copy.deepcopy(na_pos)
        na_neg["proposed_value"] = "applicable"
        self.assertEqual(read_claim_intent(na_neg, "/claims/1")["intent"], "negative")

        na_unres = copy.deepcopy(na_pos)
        na_unres["proposed_value"] = True
        self.assertEqual(read_claim_intent(na_unres, "/claims/1")["intent"], "unresolved")

    def _assert_fn6_stop(self, raw: dict, expected_tag: str, *, definitions_override: dict | None = None) -> None:
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
            compare_dependencies_and_handoff({
                "validated": validated,
                "definitions": definitions,
            })
        message = str(caught.exception)
        self.assertIn(expected_tag, message)
        self.assertIn(B02_PATH_ID, message)
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(definitions, definitions_before)

    def test_dp2_positive_os_discharge_assertion_stops_with_not_implemented(self) -> None:
        raw = base_input(self.document)
        subject_ref = copy.deepcopy(raw["binding"]["requirement_ref"])
        os_incoming = _build_os_incoming_content(
            raw,
            subject_ref,
            original_state="completed",
            supply_discharge_assertion=True,
            discharge_assertion_value=True,
        )
        _append_qualified_semantic_source(raw, "SYNTHETIC-OS-DP2-POSITIVE", os_incoming, owner="os_owner")
        raw["claims"].append({
            "subject_ref": subject_ref,
            "binding": copy.deepcopy(raw["binding"]),
            "actor": "BRAIN",
            "kind": "project_obligation_discharge",
            "proposed_value": True,
            "basis_refs": [_synthetic_ref_from(raw["sources"][0]["ref"], "knowledge-receipt")],
        })
        self._assert_fn6_stop(raw, "B02/DP2/os_positive_discharge_assertion")

    def test_conditional_selector_true_or_missing_stops_with_not_implemented(self) -> None:
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

    def test_canonical_body_resolved_source_present_stops_with_not_implemented(self) -> None:
        raw = base_input(self.document)
        always_ref_0 = copy.deepcopy(raw["dependencies"]["always_refs"][0])
        content = {"canonical_identity": always_ref_0["identity"]}
        content_bytes = json.dumps(content, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
        digest = hashlib.sha256(content_bytes.encode("utf-8")).hexdigest()
        always_ref_0["sha256"] = digest
        raw["dependencies"]["always_refs"][0] = copy.deepcopy(always_ref_0)
        _append_qualified_semantic_source(raw, always_ref_0["identity"], content, owner=always_ref_0["owner"])
        raw["sources"][-1]["ref"] = copy.deepcopy(always_ref_0)
        raw["qualifications"][-1]["subject_ref"] = copy.deepcopy(always_ref_0)
        raw["qualifications"][-1]["applicable_scope"] = copy.deepcopy(always_ref_0["scope"])
        self._assert_fn6_stop(raw, "F09/canonical_body_resolved")

    def test_unsupported_claim_kind_stops_with_not_implemented(self) -> None:
        raw = base_input(self.document)
        raw["claims"].append({
            "subject_ref": copy.deepcopy(raw["binding"]["requirement_ref"]),
            "binding": copy.deepcopy(raw["binding"]),
            "actor": "BRAIN",
            "kind": "upstream_authority",
            "proposed_value": True,
            "basis_refs": [_synthetic_ref_from(raw["sources"][0]["ref"], "knowledge-receipt")],
        })
        self._assert_fn6_stop(raw, "B02/unsupported_claim_kind")

    def test_non_positive_b02_claim_intent_stops_with_not_implemented(self) -> None:
        raw = base_input(self.document)
        raw["claims"].append({
            "subject_ref": copy.deepcopy(raw["binding"]["requirement_ref"]),
            "binding": copy.deepcopy(raw["binding"]),
            "actor": "BRAIN",
            "kind": "project_obligation_discharge",
            "proposed_value": False,
            "basis_refs": [_synthetic_ref_from(raw["sources"][0]["ref"], "knowledge-receipt")],
        })
        self._assert_fn6_stop(raw, "B02/non_positive_claim_intent")

    def test_known_definition_applicability_stops_with_not_implemented(self) -> None:
        raw = base_input(self.document)
        raw["claims"].append({
            "subject_ref": copy.deepcopy(raw["section_fields"][0]["ref"]),
            "binding": copy.deepcopy(raw["binding"]),
            "actor": "BRAIN",
            "kind": "field_not_applicable",
            "proposed_value": "not_applicable",
            "basis_refs": [_synthetic_ref_from(raw["sources"][0]["ref"], "knowledge-receipt")],
        })
        validated = validate_supply_input(raw)
        definitions = compare_descriptor_definitions({"validated": validated})
        for axis in definitions["axes"]:
            if axis["axis"].endswith(".definition_applicability"):
                axis["state"] = "known"
                break
        self._assert_fn6_stop(raw, "B02/known_definition_applicability", definitions_override=definitions)


if __name__ == "__main__":
    unittest.main()
