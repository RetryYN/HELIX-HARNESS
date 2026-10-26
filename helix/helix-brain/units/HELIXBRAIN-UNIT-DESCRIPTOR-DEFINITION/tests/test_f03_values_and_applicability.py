"""F03 の fn0→fn1→fn2 経路に対する局所test（縦切りTDD）。

対象L8行（L7 f03-fn2-values-applicability.json に記録）:
- HELIXBRAIN-L8-032-NORMAL-compare_values_and_applicability (/function_oracles/2)
- HELIXBRAIN-L8-032-F03-NEG-01 (/cases/4/negative_cases/0, rule 54 unknown_as_na)
- HELIXBRAIN-L8-032-F03-NEG-02 (/cases/4/negative_cases/1, rule 55 definition_as_value_gap)
- HELIXBRAIN-L8-032-F03-NEG-03 (/cases/4/negative_cases/2, rule 56 applicability_unknown_as_na)
- HELIXBRAIN-L8-032-F03-NEG-04 (/cases/4/negative_cases/3, rule 57 section_na_all_fields)
- HELIXBRAIN-L8-032-ADD-11 (/additional_unit_cases/10, field-na-grounded)
- HELIXBRAIN-L8-032-ADD-12 (/additional_unit_cases/11, unknown-value-locality)
- HELIXBRAIN-L8-032-VF3-F03-CLAIMS (/additional_unit_cases/35, vf3-f03-claim-local-rule-selection)
- HELIXBRAIN-L8-032-F03-DETAIL-SAME-WALK (/field_value_applicability_detail_verification)

期待値は L4 /field_value_applicability_contract・/definition_meaning_resolution_contract、
L5 /functions/2・/failure_rules/54..57・/field_value_applicability_detail/claim_protocol の
閉じた型と契約から導出し、実装の出力から写さない。
"""

from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path
import unittest

from descriptor_definitions import (
    _evaluate_field_values_detail,
    compare_descriptor_definitions,
    compare_values_and_applicability,
    validate_supply_input,
)
from supply_input_fixtures import base_input, load_document


def canonical_json_bytes(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


REPO_ROOT = Path(__file__).resolve().parents[5]
L4_PATH = REPO_ROOT / "docs/helix-brain/L4-basic-design/template-semantic-supply.json"
L5_PATH = REPO_ROOT / "docs/helix-brain/L5-detail-design/template-semantic-supply.json"
F03_BACKFLOW_ID = "HELIXBRAIN-L6-032-F03-FN2-PATH"


def _load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _ref_from(base_ref: dict, identity: str, *, owner: str | None = None, sha256: str | None = None) -> dict:
    ref = copy.deepcopy(base_ref)
    ref["identity"] = identity
    if owner is not None:
        ref["owner"] = owner
    ref["source_locator"] = None
    ref["sha256"] = sha256
    return ref


def _add_qualified_semantic_source(
    raw: dict,
    *,
    identity: str,
    owner: str,
    content: dict,
    add_to_knowledge_provenance: bool = False,
) -> dict:
    body_bytes = canonical_json_bytes(content)
    digest = hashlib.sha256(body_bytes).hexdigest()
    template_ref = raw["binding"]["template_ref"]
    source_ref = _ref_from(template_ref, identity, owner=owner, sha256=digest)
    root_ref = _ref_from(template_ref, f"SYNTHETIC-F03-{owner}-ROOT", owner=owner)
    qual_ref = _ref_from(template_ref, f"{identity}-QUALIFICATION", owner=owner)
    raw["sources"].append(
        {
            "ref": copy.deepcopy(source_ref),
            "content": copy.deepcopy(content),
            "content_bytes": body_bytes.decode("utf-8"),
            "qualification_ref": copy.deepcopy(qual_ref),
            "role": "semantic_json",
        }
    )
    if not any(r.get("identity") == root_ref["identity"] and r.get("owner") == owner for r in raw["qualification_roots"]):
        raw["qualification_roots"].append(copy.deepcopy(root_ref))
    raw["qualifications"].append(
        {
            "ref": qual_ref,
            "subject_ref": copy.deepcopy(source_ref),
            "subject_sha256": digest,
            "applicable_scope": copy.deepcopy(template_ref["scope"]),
            "qualification_body": {
                "owner": owner,
                "subject": identity,
                "logical_fixture_assumption": "独立owner resolverの合成元資料。実資格の証明ではない。",
            },
            "root_ref": copy.deepcopy(root_ref),
        }
    )
    if add_to_knowledge_provenance:
        raw["knowledge_records"][0]["provenance_refs"].append(copy.deepcopy(source_ref))
    return source_ref


def _required_field_normative_frame(l4_doc: dict) -> dict:
    snap = l4_doc["definition_meaning_resolution_contract"]["normative_basis_snapshot"]
    entry = snap["entries"][6]
    return {
        "revision": snap["revision"],
        "path": snap["path"],
        "file_sha256": snap["file_sha256"],
        "catalog_pointer": snap["pointer"],
        "catalog_canonical_sha256": snap["canonical_sha256"],
        "scope": copy.deepcopy(snap["scope"]),
        "entry_pointer": entry["pointer"],
        "entry_canonical_sha256": entry["canonical_sha256"],
        "entry_value": copy.deepcopy(entry["value"]),
    }


def _positive_field_meaning_operation(raw: dict, l4_doc: dict) -> dict:
    slot = next(s for s in raw["descriptors"] if s["descriptor_kind"] == "required field")
    fact = slot["facts"][0]
    op_ref = _ref_from(raw["binding"]["template_ref"], "SYNTHETIC-F03-MEANING-OP-07", owner="synthetic-knowledge-owner")
    return {
        "operation_ref": op_ref,
        "arguments": {
            "binding": copy.deepcopy(raw["binding"]),
            "slot_identity": slot["slot_identity"],
            "descriptor_kind": "required field",
            "fact_ref": copy.deepcopy(fact["ref"]),
            "fact_body": copy.deepcopy(fact["meaning"]),
            "normative_argument": _required_field_normative_frame(l4_doc),
        },
        "decision": {
            "relation": "defines_descriptor",
            "reason": {
                "presence": "supplied",
                "value": "これは節内の欄の意味と要否条件を定め、節のN/Aから全欄N/Aを一律生成していない。",
            },
            "raw_semantic_basis": {
                "presence": "supplied",
                "value": {
                    "original_owner_observation": "これは節内の欄の意味と要否条件を定め、節のN/Aから全欄N/Aを一律生成していない。",
                    "comparison_subject": "同じ原fact bodyと独立固定規範の当該descriptor意味",
                    "scope": "synthetic-only",
                },
            },
            "basis_refs": [],
        },
    }


def _claim(subject_ref: dict, binding: dict, kind: str, proposed_value: object, basis_refs: list | None = None) -> dict:
    return {
        "subject_ref": copy.deepcopy(subject_ref),
        "binding": copy.deepcopy(binding),
        "actor": "BRAIN",
        "kind": kind,
        "proposed_value": copy.deepcopy(proposed_value),
        "basis_refs": [] if basis_refs is None else copy.deepcopy(basis_refs),
    }


class TestF03ValuesAndApplicability(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.document = load_document()
        cls.l4_doc = _load_json(L4_PATH)
        cls.l5_doc = _load_json(L5_PATH)
        cls.closed_types = cls.l4_doc["field_value_applicability_contract"]["closed_types"]
        cls.l5_types = cls.l5_doc["type_contract"]["types"]

    def _expected_members(self, type_name: str) -> list[str]:
        spec = self.closed_types[type_name]
        if "required_fields" in spec:
            return list(spec["required_fields"])
        if "required" in spec:
            return list(spec["required"])
        raise AssertionError(f"No required fields in {type_name}")

    def _assert_exact_members(self, obj: dict, type_name: str) -> None:
        self.assertIsInstance(obj, dict, f"{type_name} must be a dict")
        expected = self._expected_members(type_name)
        self.assertEqual(
            set(obj.keys()),
            set(expected),
            f"{type_name} keys mismatch: got {sorted(obj.keys())}, expected {sorted(expected)}",
        )

    def _assert_presence_shape(self, obj: dict) -> None:
        self.assertIsInstance(obj, dict)
        self.assertIn(obj.get("presence"), ("absent", "supplied"))
        if obj["presence"] == "absent":
            self.assertEqual(set(obj.keys()), {"presence"})
        else:
            self.assertEqual(set(obj.keys()), {"presence", "value"})

    def _assert_record_read_schema(self, read_obj: dict) -> None:
        self._assert_exact_members(read_obj, "F03RecordRead")
        self._assert_exact_members(read_obj["request"], "F03RecordRequest")
        self.assertIn(read_obj["state"], ("resolved", "unknown", "conflict", "not_requested"))
        for occ in read_obj["root_occurrences"]:
            self._assert_exact_members(occ, "F03RootOccurrence")
        for occ in read_obj["source_occurrences"]:
            self._assert_exact_members(occ, "F03SourceOccurrence")
        for sup in read_obj["supports"]:
            self._assert_exact_members(sup, "F03RecordSupport")
        for prob in read_obj["problems"]:
            self._assert_exact_members(prob, "F03Problem")

    def _assert_f03_evaluation_schema(self, evaluation: dict) -> None:
        self._assert_exact_members(evaluation, "F03Evaluation")
        self._assert_exact_members(evaluation["comparison"], "F03BComparison")
        for axis in evaluation["comparison"]["axes"]:
            self._assert_exact_members(axis, "F03BAxisResult")
            self.assertEqual(set(axis.keys()), set(self.l5_types["AxisResult"]["fields"].keys()))
        for finding in evaluation["comparison"]["findings"]:
            self._assert_exact_members(finding, "F03BFinding")
            self.assertEqual(set(finding.keys()), set(self.l5_types["Finding"]["fields"].keys()))
        for prob in evaluation["problems"]:
            self._assert_exact_members(prob, "F03Problem")
        for row in evaluation["rows"]:
            self._assert_exact_members(row, "F03Row")
            dread = row["definition_read"]
            self._assert_exact_members(dread, "F03FieldDefinitionRead")
            self._assert_exact_members(dread["request"], "F03FieldDefinitionRequest")
            self._assert_record_read_schema(dread["owner_read"])
            tread = dread["target_read"]
            self._assert_exact_members(tread, "F03FieldTargetRead")
            self._assert_exact_members(tread["request"], "F03FieldTargetRequest")
            for tocc in tread["occurrences"]:
                self._assert_exact_members(tocc, "F03FieldTargetOccurrence")
                self._assert_presence_shape(tocc["typed_declaration"])
                if tocc["typed_declaration"]["presence"] == "supplied":
                    self._assert_exact_members(tocc["typed_declaration"]["value"], "F03BOwnerDescriptorTarget")
            for tmatch in tread["matches"]:
                self._assert_exact_members(tmatch, "F03FieldTargetMatch")
            for tprob in tread["problems"]:
                self._assert_exact_members(tprob, "F03Problem")
            for fread in dread["fact_reads"]:
                self._assert_exact_members(fread, "F03FieldFactRead")
                self._assert_presence_shape(fread["fact"])
                aread = fread["attribution_read"]
                self._assert_exact_members(aread, "F03AttributionRead")
                for asup in aread["supports"]:
                    self._assert_exact_members(asup, "F03AttributionSupport")
                for aprob in aread["problems"]:
                    self._assert_exact_members(aprob, "F03Problem")
                mread_pres = fread["meaning_read"]
                self._assert_presence_shape(mread_pres)
                if mread_pres["presence"] == "supplied":
                    mread = mread_pres["value"]
                    self._assert_exact_members(mread, "F03BDefinitionMeaningRead")
                    self._assert_exact_members(mread["normative_frame"], "F03BDefinitionNormativeFrame")
                    self._assert_exact_members(mread["normative_frame"]["scope"], "F03BDefinitionNormativeScope")
                    for mocc in mread["occurrences"]:
                        self._assert_exact_members(mocc, "F03BDefinitionMeaningOccurrence")
                        self._assert_presence_shape(mocc["decoded_record"])
                        if mocc["decoded_record"]["presence"] == "supplied":
                            self._assert_exact_members(mocc["decoded_record"]["value"], "F03BDefinitionMeaningOperation")
                    for msup in mread["supports"]:
                        self._assert_exact_members(msup, "F03BDefinitionMeaningSupport")
                        self._assert_exact_members(msup["operation"], "F03BDefinitionMeaningOperation")
                        self._assert_exact_members(msup["operation"]["arguments"], "F03BDefinitionMeaningArguments")
                        self._assert_exact_members(msup["operation"]["decision"], "F03BDefinitionMeaningDecision")
                        self._assert_exact_members(msup["normative_frame"], "F03BDefinitionNormativeFrame")
                    for mprob in mread["problems"]:
                        self._assert_exact_members(mprob, "F03BDefinitionMeaningProblem")
                for fprob in fread["problems"]:
                    self._assert_exact_members(fprob, "F03Problem")
            for judgment in dread["judgments"]:
                self._assert_exact_members(judgment, "F03FieldDefinitionJudgment")
            for dprob in dread["problems"]:
                self._assert_exact_members(dprob, "F03Problem")
            self._assert_record_read_schema(row["applicability_read"])
            for vread in row["value_reads"]:
                self._assert_record_read_schema(vread)
            for pread in row["parent_reads"]:
                self._assert_record_read_schema(pread)
            for event in row["events"]:
                self._assert_exact_members(event, "F03Event")
                self._assert_exact_members(event["reason_material"], "F03ReasonMaterial")

    def _run_fn0_fn1_fn2(self, raw: dict) -> tuple[dict, dict, dict, dict]:
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(raw, raw_before)
        validated_before = copy.deepcopy(validated)
        definitions = compare_descriptor_definitions({"validated": validated})
        definitions_before = copy.deepcopy(definitions)
        detail = _evaluate_field_values_detail(
            {
                "snapshot": validated,
                "definitions": definitions,
            }
        )
        public = compare_values_and_applicability(
            {
                "validated": validated,
                "definitions": definitions,
            }
        )
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(definitions, definitions_before)
        self._assert_f03_evaluation_schema(detail)
        return validated, definitions, detail, public

    def test_f03_owner_empty_missing_and_neg02_definition_as_value_gap(self) -> None:
        raw = base_input(self.document)
        field = raw["section_fields"][0]
        field["parent_section_ref"] = None
        field["meaning_fact_refs"] = []
        field["requiredness_fact_refs"] = []
        field["normative_rule_refs"] = []
        field["oracle_refs"] = []
        field["value_fact_refs"] = []
        field["applicability_ref"] = None
        raw["values"] = []
        raw["applicability_records"] = []

        mapping_content = {
            "binding": copy.deepcopy(raw["binding"]),
            "descriptor_targets": [
                {
                    "target_ref": copy.deepcopy(field["descriptor_slot_ref"]),
                    "slot_identity": "synthetic-descriptor-7",
                    "descriptor_kind": "required field",
                }
            ],
            "section_field_records": [{"record": copy.deepcopy(field)}],
        }
        mapping_source_ref = _add_qualified_semantic_source(
            raw,
            identity="SYNTHETIC-F03-MAPPING-SOURCE",
            owner="synthetic-knowledge-owner",
            content=mapping_content,
            add_to_knowledge_provenance=True,
        )

        # 1) Claims=[] (F03-L9-OWNER-EMPTY-MISSING contrast)
        _, _, detail, public = self._run_fn0_fn1_fn2(raw)
        self.assertEqual(public["findings"], [])
        f03_axes = public["axes"][2:]
        self.assertEqual(len(f03_axes), 1)
        self.assertEqual(f03_axes[0]["axis"], "field.definition")
        self.assertEqual(f03_axes[0]["state"], "missing")
        self.assertEqual(f03_axes[0]["backflow_owner"], "synthetic-knowledge-owner")
        self.assertEqual(
            f03_axes[0]["original_refs"],
            [
                field["ref"],
                field["descriptor_slot_ref"],
                raw["binding"]["knowledge_ref"],
                mapping_source_ref,
            ],
        )
        row0 = detail["rows"][0]
        self.assertEqual(row0["definition_read"]["owner_read"]["state"], "resolved")
        self.assertEqual(row0["definition_read"]["target_read"]["state"], "resolved")
        self.assertEqual(row0["definition_read"]["judgments"][0]["branch"], "definition_empty")
        self.assertEqual(row0["definition_read"]["judgments"][0]["cause"], "meaning_refs_empty")
        self.assertEqual(row0["events"][0]["branch"], "definition_empty")

        # 2) HELIXBRAIN-L8-032-F03-NEG-02 (rule 55: definition_as_value_gap)
        raw_neg02 = copy.deepcopy(raw)
        raw_neg02["claims"] = [_claim(field["ref"], raw["binding"], "value_only_gap", "unknown")]
        _, _, detail_neg02, public_neg02 = self._run_fn0_fn1_fn2(raw_neg02)
        self.assertEqual(len(public_neg02["findings"]), 1)
        finding = public_neg02["findings"][0]
        self.assertEqual(finding["code"], "definition_as_value_gap")
        self.assertEqual(finding["rule_ref"], "HELIXBRAIN-L5-032-R-definition_as_value_gap")
        self.assertEqual(finding["subject_ref"], field["ref"])
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertEqual(finding["axis"], "field.definition")
        self.assertEqual(finding["state"], "missing")
        self.assertEqual(finding["backflow_owner"], "knowledge_owner")
        self.assertEqual(detail_neg02["rows"][0]["finding_indices"], [0])
        self.assertEqual(public_neg02["axes"][2]["axis"], "field.definition")
        self.assertEqual(public_neg02["axes"][2]["state"], "missing")

    def test_f03_owner_unobtained_unknown_contrast(self) -> None:
        raw = base_input(self.document)
        field = raw["section_fields"][0]
        field["parent_section_ref"] = None
        field["meaning_fact_refs"] = []
        field["requiredness_fact_refs"] = []
        field["normative_rule_refs"] = []
        field["oracle_refs"] = []
        field["value_fact_refs"] = []
        field["applicability_ref"] = None
        raw["values"] = []
        raw["applicability_records"] = []

        mapping_content = {
            "binding": copy.deepcopy(raw["binding"]),
            "descriptor_targets": [
                {
                    "target_ref": copy.deepcopy(field["descriptor_slot_ref"]),
                    "slot_identity": "synthetic-descriptor-7",
                    "descriptor_kind": "required field",
                }
            ],
            "section_field_records": [],
        }
        _add_qualified_semantic_source(
            raw,
            identity="SYNTHETIC-F03-MAPPING-SOURCE",
            owner="synthetic-knowledge-owner",
            content=mapping_content,
            add_to_knowledge_provenance=True,
        )

        _, _, detail, public = self._run_fn0_fn1_fn2(raw)
        self.assertEqual(public["findings"], [])
        f03_axes = public["axes"][2:]
        self.assertEqual(len(f03_axes), 1)
        self.assertEqual(f03_axes[0]["axis"], "field.definition")
        self.assertEqual(f03_axes[0]["state"], "unknown")
        self.assertEqual(f03_axes[0]["backflow_owner"], "synthetic-knowledge-owner")
        self.assertEqual(
            f03_axes[0]["original_refs"],
            [
                field["ref"],
                field["descriptor_slot_ref"],
                raw["binding"]["knowledge_ref"],
            ],
        )
        row0 = detail["rows"][0]
        self.assertEqual(row0["definition_read"]["owner_read"]["state"], "unknown")
        self.assertEqual(row0["definition_read"]["target_read"]["state"], "resolved")
        self.assertEqual(row0["definition_read"]["judgments"][0]["branch"], "definition_unknown")
        self.assertEqual(row0["definition_read"]["judgments"][0]["cause"], "field_owner_unresolved")
        self.assertEqual(row0["events"][0]["branch"], "definition_unknown")

    def test_f03_defined_value_unknown_locality_and_neg01_unknown_as_na(self) -> None:
        raw = base_input(self.document)
        slot7 = next(s for s in raw["descriptors"] if s["descriptor_kind"] == "required field")
        fact_ref = copy.deepcopy(slot7["facts"][0]["ref"])

        field0 = raw["section_fields"][0]
        field0["parent_section_ref"] = None
        field0["meaning_fact_refs"] = [copy.deepcopy(fact_ref)]
        field0["requiredness_fact_refs"] = []
        field0["normative_rule_refs"] = []
        field0["oracle_refs"] = []

        core_source_ref_placeholder = _ref_from(
            raw["binding"]["template_ref"],
            "SYNTHETIC-F03-CORE-SOURCE",
            owner="synthetic-core-owner",
        )
        val0 = raw["values"][0]
        val0["value"] = None
        val0["origin"] = "absent"
        val0["reason"] = "案件固有の監査保持期間がCOREから未供給"
        val0["applicability_ref"] = None

        app0 = raw["applicability_records"][0]
        app0["owner"] = "synthetic-core-owner"
        app0["decision"] = "applicable"
        app0["reason"] = "原ownerは当該fieldをこの案件scopeへ適用すると明示する。"
        app0["reentry_condition"] = {"when": "案件scope又は原条件が変わった場合に再評価する"}

        # Second field for ADD-12 (unknown-value-locality: field0 is unknown, field1 is supplied)
        field1_ref = _ref_from(field0["ref"], "synthetic-field-B", owner="synthetic-knowledge-owner")
        val1_ref = _ref_from(val0["ref"], "synthetic-field-B-value", owner="synthetic-core-owner")
        app1_ref = _ref_from(app0["ref"], "synthetic-field-B-applicability", owner="synthetic-core-owner")
        field1 = {
            "ref": copy.deepcopy(field1_ref),
            "descriptor_slot_ref": copy.deepcopy(field0["descriptor_slot_ref"]),
            "parent_section_ref": None,
            "meaning_fact_refs": [copy.deepcopy(fact_ref)],
            "requiredness_fact_refs": [],
            "normative_rule_refs": [],
            "oracle_refs": [],
            "value_fact_refs": [copy.deepcopy(val1_ref)],
            "applicability_ref": copy.deepcopy(app1_ref),
        }
        val1 = {
            "subject_ref": copy.deepcopy(field1_ref),
            "binding": copy.deepcopy(raw["binding"]),
            "value": "7 years",
            "source_ref": None,
            "reason": "製品ownerが保持期間を供給した。",
            "origin": "product_input",
            "applicability_ref": None,
            "ref": copy.deepcopy(val1_ref),
        }
        app1 = {
            "ref": copy.deepcopy(app1_ref),
            "subject_ref": copy.deepcopy(field1_ref),
            "binding": copy.deepcopy(raw["binding"]),
            "owner": "synthetic-core-owner",
            "decision": "applicable",
            "reason": "原ownerはfield Bも適用と明示する。",
            "reentry_condition": {"when": "案件scope変更時"},
            "source_ref": None,
        }
        raw["section_fields"].append(field1)
        raw["values"].append(val1)
        raw["applicability_records"].append(app1)

        # Build CORE source so val0/val1/app0/app1 carry its qualified Ref
        # Compute core source ref with two-pass so source_ref inside records matches source["ref"]
        val0["source_ref"] = copy.deepcopy(core_source_ref_placeholder)
        val1["source_ref"] = copy.deepcopy(core_source_ref_placeholder)
        app0["source_ref"] = copy.deepcopy(core_source_ref_placeholder)
        app1["source_ref"] = copy.deepcopy(core_source_ref_placeholder)
        core_content = {
            "binding": copy.deepcopy(raw["binding"]),
            "value_facts": [copy.deepcopy(val0), copy.deepcopy(val1)],
            "field_applicability_records": [copy.deepcopy(app0), copy.deepcopy(app1)],
        }
        _add_qualified_semantic_source(
            raw,
            identity="SYNTHETIC-F03-CORE-SOURCE",
            owner="synthetic-core-owner",
            content=core_content,
            add_to_knowledge_provenance=False,
        )

        mapping_content = {
            "binding": copy.deepcopy(raw["binding"]),
            "descriptor_targets": [
                {
                    "target_ref": copy.deepcopy(field0["descriptor_slot_ref"]),
                    "slot_identity": slot7["slot_identity"],
                    "descriptor_kind": "required field",
                }
            ],
            "section_field_records": [
                {"record": copy.deepcopy(field0)},
                {"record": copy.deepcopy(field1)},
            ],
            "definition_meaning_operations": [_positive_field_meaning_operation(raw, self.l4_doc)],
        }
        _add_qualified_semantic_source(
            raw,
            identity="SYNTHETIC-F03-MAPPING-SOURCE",
            owner="synthetic-knowledge-owner",
            content=mapping_content,
            add_to_knowledge_provenance=True,
        )

        # 1) ADD-12 unknown-value-locality with claims=[]
        _, _, detail, public = self._run_fn0_fn1_fn2(raw)
        self.assertEqual(public["findings"], [])
        row0, row1 = detail["rows"][0], detail["rows"][1]
        self.assertEqual([e["branch"] for e in row0["events"]], [
            "definition_known",
            "applicability_applicable",
            "value_unknown",
            "field_applicable",
        ])
        self.assertEqual([e["branch"] for e in row1["events"]], [
            "definition_known",
            "applicability_applicable",
            "value_supplied",
            "field_applicable",
        ])
        val0_event = row0["events"][2]
        self.assertEqual(val0_event["axis"], "field.value")
        self.assertEqual(val0_event["state"], "unknown")
        self.assertEqual(val0_event["backflow_owner"], "synthetic-core-owner")
        self.assertEqual(
            val0_event["reason_material"]["original_reason"],
            {"presence": "supplied", "value": "案件固有の監査保持期間がCOREから未供給"},
        )
        self.assertEqual(val0_event["reason_material"]["knowledge_ref"], raw["binding"]["knowledge_ref"])
        val1_event = row1["events"][2]
        self.assertEqual(val1_event["axis"], "field.value")
        self.assertEqual(val1_event["state"], "supplied")

        # 2) HELIXBRAIN-L8-032-F03-NEG-01 (rule 54: unknown_as_na when definition=known, applicability=applicable, value=unknown)
        raw_neg01 = copy.deepcopy(raw)
        raw_neg01["claims"] = [_claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable")]
        _, _, detail_neg01, public_neg01 = self._run_fn0_fn1_fn2(raw_neg01)
        self.assertEqual(len(public_neg01["findings"]), 1)
        finding = public_neg01["findings"][0]
        self.assertEqual(finding["code"], "unknown_as_na")
        self.assertEqual(finding["rule_ref"], "HELIXBRAIN-L5-032-R-unknown_as_na")
        self.assertEqual(finding["subject_ref"], field0["ref"])
        self.assertEqual(finding["axis"], "field.value")
        self.assertEqual(finding["state"], "unknown")
        self.assertEqual(finding["backflow_owner"], "core_owner")
        self.assertEqual(detail_neg01["rows"][0]["finding_indices"], [0])
        self.assertEqual(detail_neg01["rows"][1]["finding_indices"], [])

    def test_f03_explicit_applicability_unknown_and_neg03_applicability_unknown_as_na(self) -> None:
        raw = base_input(self.document)
        slot7 = next(s for s in raw["descriptors"] if s["descriptor_kind"] == "required field")
        fact_ref = copy.deepcopy(slot7["facts"][0]["ref"])

        field0 = raw["section_fields"][0]
        field0["parent_section_ref"] = None
        field0["meaning_fact_refs"] = [copy.deepcopy(fact_ref)]
        field0["requiredness_fact_refs"] = []
        field0["normative_rule_refs"] = []
        field0["oracle_refs"] = []
        field0["value_fact_refs"] = []
        raw["values"] = []

        core_source_ref_placeholder = _ref_from(
            raw["binding"]["template_ref"],
            "SYNTHETIC-F03-CORE-SOURCE",
            owner="synthetic-core-owner",
        )
        app0 = raw["applicability_records"][0]
        app0["owner"] = "synthetic-core-owner"
        app0["decision"] = "unknown"
        app0["reason"] = "原ownerは当該fieldの適用条件を未決と明示する。"
        app0["reentry_condition"] = {"when": "原条件を確認できる独立owner evidenceを取得した後に再評価する"}
        app0["source_ref"] = copy.deepcopy(core_source_ref_placeholder)

        _add_qualified_semantic_source(
            raw,
            identity="SYNTHETIC-F03-CORE-SOURCE",
            owner="synthetic-core-owner",
            content={
                "binding": copy.deepcopy(raw["binding"]),
                "field_applicability_records": [copy.deepcopy(app0)],
            },
            add_to_knowledge_provenance=False,
        )
        _add_qualified_semantic_source(
            raw,
            identity="SYNTHETIC-F03-MAPPING-SOURCE",
            owner="synthetic-knowledge-owner",
            content={
                "binding": copy.deepcopy(raw["binding"]),
                "descriptor_targets": [
                    {
                        "target_ref": copy.deepcopy(field0["descriptor_slot_ref"]),
                        "slot_identity": slot7["slot_identity"],
                        "descriptor_kind": "required field",
                    }
                ],
                "section_field_records": [{"record": copy.deepcopy(field0)}],
                "definition_meaning_operations": [_positive_field_meaning_operation(raw, self.l4_doc)],
            },
            add_to_knowledge_provenance=True,
        )

        # 1) F03-L9-EXPLICIT-APPLICABILITY-UNKNOWN with claims=[]
        _, _, detail, public = self._run_fn0_fn1_fn2(raw)
        self.assertEqual(public["findings"], [])
        row0 = detail["rows"][0]
        self.assertEqual([e["branch"] for e in row0["events"]], [
            "definition_known",
            "applicability_unknown",
            "field_unknown",
        ])
        app_event = row0["events"][1]
        self.assertEqual(app_event["axis"], "applicability.evaluation")
        self.assertEqual(app_event["state"], "unknown")
        self.assertEqual(app_event["backflow_owner"], "synthetic-core-owner")
        self.assertEqual(
            app_event["reason_material"]["original_decision"],
            {"presence": "supplied", "value": "unknown"},
        )

        # 2) HELIXBRAIN-L8-032-F03-NEG-03 (rule 56: applicability_unknown_as_na)
        raw_neg03 = copy.deepcopy(raw)
        raw_neg03["claims"] = [_claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable")]
        _, _, detail_neg03, public_neg03 = self._run_fn0_fn1_fn2(raw_neg03)
        self.assertEqual(len(public_neg03["findings"]), 1)
        finding = public_neg03["findings"][0]
        self.assertEqual(finding["code"], "applicability_unknown_as_na")
        self.assertEqual(finding["rule_ref"], "HELIXBRAIN-L5-032-R-applicability_unknown_as_na")
        self.assertEqual(finding["subject_ref"], field0["ref"])
        self.assertEqual(finding["axis"], "applicability.evaluation")
        self.assertEqual(finding["state"], "unknown")
        self.assertEqual(finding["backflow_owner"], "core_owner")
        self.assertEqual(detail_neg03["rows"][0]["finding_indices"], [0])

    def test_f03_parent_na_no_propagation_and_neg04_section_na_all_fields(self) -> None:
        raw = base_input(self.document)
        slot7 = next(s for s in raw["descriptors"] if s["descriptor_kind"] == "required field")
        fact_ref = copy.deepcopy(slot7["facts"][0]["ref"])

        field0 = raw["section_fields"][0]
        section_ref = copy.deepcopy(field0["parent_section_ref"])
        field0["meaning_fact_refs"] = [copy.deepcopy(fact_ref)]
        field0["requiredness_fact_refs"] = []
        field0["normative_rule_refs"] = []
        field0["oracle_refs"] = []
        field0["value_fact_refs"] = []
        field0["applicability_ref"] = None
        raw["values"] = []

        core_source_ref_placeholder = _ref_from(
            raw["binding"]["template_ref"],
            "SYNTHETIC-F03-CORE-SOURCE",
            owner="synthetic-core-owner",
        )
        parent_app = raw["applicability_records"][0]
        parent_app["ref"] = _ref_from(parent_app["ref"], "SYNTHETIC-F03-PARENT-APPLICABILITY", owner="synthetic-core-owner")
        parent_app["subject_ref"] = copy.deepcopy(section_ref)
        parent_app["owner"] = "synthetic-core-owner"
        parent_app["decision"] = "not_applicable"
        parent_app["reason"] = "親sectionに限り対象外である。"
        parent_app["reentry_condition"] = {"when": "親sectionの条件が変わったとき再評価する"}
        parent_app["source_ref"] = copy.deepcopy(core_source_ref_placeholder)

        _add_qualified_semantic_source(
            raw,
            identity="SYNTHETIC-F03-CORE-SOURCE",
            owner="synthetic-core-owner",
            content={
                "binding": copy.deepcopy(raw["binding"]),
                "field_applicability_records": [copy.deepcopy(parent_app)],
            },
            add_to_knowledge_provenance=False,
        )
        _add_qualified_semantic_source(
            raw,
            identity="SYNTHETIC-F03-MAPPING-SOURCE",
            owner="synthetic-knowledge-owner",
            content={
                "binding": copy.deepcopy(raw["binding"]),
                "descriptor_targets": [
                    {
                        "target_ref": copy.deepcopy(field0["descriptor_slot_ref"]),
                        "slot_identity": slot7["slot_identity"],
                        "descriptor_kind": "required field",
                    }
                ],
                "section_field_records": [{"record": copy.deepcopy(field0)}],
                "definition_meaning_operations": [_positive_field_meaning_operation(raw, self.l4_doc)],
            },
            add_to_knowledge_provenance=True,
        )

        # 1) F03-L9-PARENT-NA-NO-PROPAGATION with claims=[]
        _, _, detail, public = self._run_fn0_fn1_fn2(raw)
        self.assertEqual(public["findings"], [])
        row0 = detail["rows"][0]
        self.assertEqual(len(row0["parent_reads"]), 1)
        self.assertEqual(row0["parent_reads"][0]["state"], "resolved")
        self.assertEqual([e["branch"] for e in row0["events"]], [
            "definition_known",
            "applicability_null",
            "parent_na_no_transfer",
        ])
        parent_event = row0["events"][2]
        self.assertEqual(parent_event["axis"], "field.applicability")
        self.assertEqual(parent_event["state"], "unknown")
        self.assertEqual(parent_event["backflow_owner"], "synthetic-core-owner")
        self.assertEqual(parent_event["reason_material"]["original_presence"], {"presence": "supplied", "value": None})
        self.assertEqual(
            parent_event["reason_material"]["original_decision"],
            {"presence": "supplied", "value": "not_applicable"},
        )

        # 2) HELIXBRAIN-L8-032-F03-NEG-04 (rule 57: section_na_all_fields)
        raw_neg04 = copy.deepcopy(raw)
        raw_neg04["claims"] = [
            _claim(field0["ref"], raw["binding"], "all_section_fields_not_applicable", "not_applicable")
        ]
        _, _, detail_neg04, public_neg04 = self._run_fn0_fn1_fn2(raw_neg04)
        self.assertEqual(len(public_neg04["findings"]), 1)
        finding = public_neg04["findings"][0]
        self.assertEqual(finding["code"], "section_na_all_fields")
        self.assertEqual(finding["rule_ref"], "HELIXBRAIN-L5-032-R-section_na_all_fields")
        self.assertEqual(finding["subject_ref"], field0["ref"])
        self.assertEqual(finding["axis"], "field.applicability")
        self.assertEqual(finding["state"], "unknown")
        self.assertEqual(finding["backflow_owner"], "core_owner")
        self.assertEqual(detail_neg04["rows"][0]["finding_indices"], [0])

    def test_f03_add11_justified_field_na_and_supplied_false_applicable(self) -> None:
        # 1) HELIXBRAIN-L8-032-ADD-11 (F03-L9-JUSTIFIED-FIELD-NA)
        raw_na = base_input(self.document)
        slot7 = next(s for s in raw_na["descriptors"] if s["descriptor_kind"] == "required field")
        fact_ref = copy.deepcopy(slot7["facts"][0]["ref"])
        field0 = raw_na["section_fields"][0]
        field0["parent_section_ref"] = None
        field0["meaning_fact_refs"] = [copy.deepcopy(fact_ref)]
        field0["requiredness_fact_refs"] = []
        field0["normative_rule_refs"] = []
        field0["oracle_refs"] = []
        field0["value_fact_refs"] = []
        raw_na["values"] = []

        core_source_ref_placeholder = _ref_from(
            raw_na["binding"]["template_ref"],
            "SYNTHETIC-F03-CORE-SOURCE",
            owner="synthetic-core-owner",
        )
        app0 = raw_na["applicability_records"][0]
        app0["owner"] = "synthetic-core-owner"
        app0["decision"] = "not_applicable"
        app0["reason"] = "この原fieldは当該案件scopeでは対象外である。"
        app0["reentry_condition"] = {"when": "当該案件scopeの条件が変わったとき再評価する"}
        app0["source_ref"] = copy.deepcopy(core_source_ref_placeholder)

        _add_qualified_semantic_source(
            raw_na,
            identity="SYNTHETIC-F03-CORE-SOURCE",
            owner="synthetic-core-owner",
            content={
                "binding": copy.deepcopy(raw_na["binding"]),
                "field_applicability_records": [copy.deepcopy(app0)],
            },
            add_to_knowledge_provenance=False,
        )
        _add_qualified_semantic_source(
            raw_na,
            identity="SYNTHETIC-F03-MAPPING-SOURCE",
            owner="synthetic-knowledge-owner",
            content={
                "binding": copy.deepcopy(raw_na["binding"]),
                "descriptor_targets": [
                    {
                        "target_ref": copy.deepcopy(field0["descriptor_slot_ref"]),
                        "slot_identity": slot7["slot_identity"],
                        "descriptor_kind": "required field",
                    }
                ],
                "section_field_records": [{"record": copy.deepcopy(field0)}],
                "definition_meaning_operations": [_positive_field_meaning_operation(raw_na, self.l4_doc)],
            },
            add_to_knowledge_provenance=True,
        )

        _, _, detail_na, public_na = self._run_fn0_fn1_fn2(raw_na)
        self.assertEqual(public_na["findings"], [])
        row_na = detail_na["rows"][0]
        self.assertEqual([e["branch"] for e in row_na["events"]], [
            "definition_known",
            "applicability_na",
            "field_na",
        ])
        self.assertEqual(row_na["events"][1]["state"], "not_applicable")
        self.assertEqual(row_na["events"][2]["state"], "not_applicable")

        # 2) F03-L9-SUPPLIED-FALSE-APPLICABLE
        raw_false = base_input(self.document)
        field_f = raw_false["section_fields"][0]
        field_f["parent_section_ref"] = None
        field_f["meaning_fact_refs"] = [copy.deepcopy(fact_ref)]
        field_f["requiredness_fact_refs"] = []
        field_f["normative_rule_refs"] = []
        field_f["oracle_refs"] = []

        val_f = raw_false["values"][0]
        val_f["value"] = False
        val_f["origin"] = "product_input"
        val_f["reason"] = "製品ownerがfalseを供給した。"
        val_f["applicability_ref"] = None
        val_f["source_ref"] = copy.deepcopy(core_source_ref_placeholder)

        app_f = raw_false["applicability_records"][0]
        app_f["owner"] = "synthetic-core-owner"
        app_f["decision"] = "applicable"
        app_f["reason"] = "原ownerは当該fieldをこの案件scopeへ適用すると明示する。"
        app_f["reentry_condition"] = {"when": "案件scope又は原条件が変わった場合に再評価する"}
        app_f["source_ref"] = copy.deepcopy(core_source_ref_placeholder)

        _add_qualified_semantic_source(
            raw_false,
            identity="SYNTHETIC-F03-CORE-SOURCE",
            owner="synthetic-core-owner",
            content={
                "binding": copy.deepcopy(raw_false["binding"]),
                "value_facts": [copy.deepcopy(val_f)],
                "field_applicability_records": [copy.deepcopy(app_f)],
            },
            add_to_knowledge_provenance=False,
        )
        _add_qualified_semantic_source(
            raw_false,
            identity="SYNTHETIC-F03-MAPPING-SOURCE",
            owner="synthetic-knowledge-owner",
            content={
                "binding": copy.deepcopy(raw_false["binding"]),
                "descriptor_targets": [
                    {
                        "target_ref": copy.deepcopy(field_f["descriptor_slot_ref"]),
                        "slot_identity": slot7["slot_identity"],
                        "descriptor_kind": "required field",
                    }
                ],
                "section_field_records": [{"record": copy.deepcopy(field_f)}],
                "definition_meaning_operations": [_positive_field_meaning_operation(raw_false, self.l4_doc)],
            },
            add_to_knowledge_provenance=True,
        )

        _, _, detail_false, public_false = self._run_fn0_fn1_fn2(raw_false)
        self.assertEqual(public_false["findings"], [])
        row_false = detail_false["rows"][0]
        self.assertEqual([e["branch"] for e in row_false["events"]], [
            "definition_known",
            "applicability_applicable",
            "value_supplied",
            "field_applicable",
        ])
        self.assertEqual(
            row_false["events"][2]["reason_material"]["original_presence"],
            {"presence": "supplied", "value": False},
        )

    def test_vf3_f03_claim_local_rule_selection_and_non_firing_contrasts(self) -> None:
        # HELIXBRAIN-L8-032-VF3-F03-CLAIMS (/additional_unit_cases/35):
        # Same field has field.definition=known, applicability.evaluation=unknown,
        # field.value=unknown, field.applicability=unknown.
        raw = base_input(self.document)
        slot7 = next(s for s in raw["descriptors"] if s["descriptor_kind"] == "required field")
        fact_ref = copy.deepcopy(slot7["facts"][0]["ref"])
        field0 = raw["section_fields"][0]
        field0["parent_section_ref"] = None
        field0["meaning_fact_refs"] = [copy.deepcopy(fact_ref)]
        field0["requiredness_fact_refs"] = []
        field0["normative_rule_refs"] = []
        field0["oracle_refs"] = []

        core_source_ref_placeholder = _ref_from(
            raw["binding"]["template_ref"],
            "SYNTHETIC-F03-CORE-SOURCE",
            owner="synthetic-core-owner",
        )
        val0 = raw["values"][0]
        val0["value"] = None
        val0["origin"] = "absent"
        val0["reason"] = "案件値が未供給"
        val0["applicability_ref"] = None
        val0["source_ref"] = copy.deepcopy(core_source_ref_placeholder)

        app0 = raw["applicability_records"][0]
        app0["owner"] = "synthetic-core-owner"
        app0["decision"] = "unknown"
        app0["reason"] = "適用条件がunknown"
        app0["reentry_condition"] = {"when": "原条件判明後に再評価"}
        app0["source_ref"] = copy.deepcopy(core_source_ref_placeholder)

        _add_qualified_semantic_source(
            raw,
            identity="SYNTHETIC-F03-CORE-SOURCE",
            owner="synthetic-core-owner",
            content={
                "binding": copy.deepcopy(raw["binding"]),
                "value_facts": [copy.deepcopy(val0)],
                "field_applicability_records": [copy.deepcopy(app0)],
            },
            add_to_knowledge_provenance=False,
        )
        _add_qualified_semantic_source(
            raw,
            identity="SYNTHETIC-F03-MAPPING-SOURCE",
            owner="synthetic-knowledge-owner",
            content={
                "binding": copy.deepcopy(raw["binding"]),
                "descriptor_targets": [
                    {
                        "target_ref": copy.deepcopy(field0["descriptor_slot_ref"]),
                        "slot_identity": slot7["slot_identity"],
                        "descriptor_kind": "required field",
                    }
                ],
                "section_field_records": [{"record": copy.deepcopy(field0)}],
                "definition_meaning_operations": [_positive_field_meaning_operation(raw, self.l4_doc)],
            },
            add_to_knowledge_provenance=True,
        )

        # Claim A: field_not_applicable / "not_applicable" -> matches rule 56 first (55->56->54->57)
        # Claim B: field_not_applicable / "applicable" -> negative literal, 0 findings, does not cancel Claim A
        # Claim C: value_only_gap / "unknown" -> requires field.definition=missing, 0 findings on known definition
        raw["claims"] = [
            _claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable"),
            _claim(field0["ref"], raw["binding"], "field_not_applicable", "applicable"),
            _claim(field0["ref"], raw["binding"], "value_only_gap", "unknown"),
        ]
        _, _, detail, public = self._run_fn0_fn1_fn2(raw)
        self.assertEqual(len(public["findings"]), 1)
        finding = public["findings"][0]
        self.assertEqual(finding["code"], "applicability_unknown_as_na")
        self.assertEqual(finding["rule_ref"], "HELIXBRAIN-L5-032-R-applicability_unknown_as_na")
        self.assertEqual(finding["axis"], "applicability.evaluation")
        self.assertEqual(finding["state"], "unknown")
        self.assertEqual(finding["backflow_owner"], "core_owner")
        self.assertEqual(detail["rows"][0]["finding_indices"], [0])

        # Non-firing contrast for rule 54 & rule 57 when value is supplied and applicability is applicable:
        raw_contrast = copy.deepcopy(raw)
        raw_contrast["values"][0]["value"] = "supplied-value"
        raw_contrast["values"][0]["origin"] = "product_input"
        raw_contrast["applicability_records"][0]["decision"] = "applicable"
        # Update CORE source to mirror supplied value & applicable decision
        raw_contrast["sources"] = raw_contrast["sources"][:5]
        raw_contrast["qualifications"] = raw_contrast["qualifications"][:5]
        raw_contrast["knowledge_records"][0]["provenance_refs"] = raw_contrast["knowledge_records"][0]["provenance_refs"][:1]
        _add_qualified_semantic_source(
            raw_contrast,
            identity="SYNTHETIC-F03-CORE-SOURCE",
            owner="synthetic-core-owner",
            content={
                "binding": copy.deepcopy(raw_contrast["binding"]),
                "value_facts": [copy.deepcopy(raw_contrast["values"][0])],
                "field_applicability_records": [copy.deepcopy(raw_contrast["applicability_records"][0])],
            },
            add_to_knowledge_provenance=False,
        )
        _add_qualified_semantic_source(
            raw_contrast,
            identity="SYNTHETIC-F03-MAPPING-SOURCE",
            owner="synthetic-knowledge-owner",
            content={
                "binding": copy.deepcopy(raw_contrast["binding"]),
                "descriptor_targets": [
                    {
                        "target_ref": copy.deepcopy(field0["descriptor_slot_ref"]),
                        "slot_identity": slot7["slot_identity"],
                        "descriptor_kind": "required field",
                    }
                ],
                "section_field_records": [{"record": copy.deepcopy(field0)}],
                "definition_meaning_operations": [_positive_field_meaning_operation(raw_contrast, self.l4_doc)],
            },
            add_to_knowledge_provenance=True,
        )
        raw_contrast["claims"] = [
            _claim(field0["ref"], raw_contrast["binding"], "field_not_applicable", "not_applicable"),
            _claim(field0["ref"], raw_contrast["binding"], "all_section_fields_not_applicable", "not_applicable"),
        ]
        _, _, detail_contrast, public_contrast = self._run_fn0_fn1_fn2(raw_contrast)
        self.assertEqual(public_contrast["findings"], [])
        self.assertEqual(detail_contrast["rows"][0]["finding_indices"], [])

    def test_f03_unclosed_branches_stop_with_tagged_not_implemented_error(self) -> None:
        def make_f03_base() -> dict:
            raw = base_input(self.document)
            field = raw["section_fields"][0]
            field["parent_section_ref"] = None
            field["meaning_fact_refs"] = []
            field["requiredness_fact_refs"] = []
            field["normative_rule_refs"] = []
            field["oracle_refs"] = []
            field["value_fact_refs"] = []
            field["applicability_ref"] = None
            raw["values"] = []
            raw["applicability_records"] = []
            _add_qualified_semantic_source(
                raw,
                identity="SYNTHETIC-F03-MAPPING-SOURCE",
                owner="synthetic-knowledge-owner",
                content={
                    "binding": copy.deepcopy(raw["binding"]),
                    "descriptor_targets": [
                        {
                            "target_ref": copy.deepcopy(field["descriptor_slot_ref"]),
                            "slot_identity": "synthetic-descriptor-7",
                            "descriptor_kind": "required field",
                        }
                    ],
                    "section_field_records": [{"record": copy.deepcopy(field)}],
                },
                add_to_knowledge_provenance=True,
            )
            return raw

        def assert_stops(raw: dict, expected_branch_tag: str) -> None:
            raw_before = copy.deepcopy(raw)
            validated = validate_supply_input(raw)
            definitions = compare_descriptor_definitions({"validated": validated})
            definitions_before = copy.deepcopy(definitions)
            with self.assertRaises(NotImplementedError) as caught:
                compare_values_and_applicability(
                    {
                        "validated": validated,
                        "definitions": definitions,
                    }
                )
            msg = str(caught.exception)
            self.assertIn(expected_branch_tag, msg)
            self.assertIn(F03_BACKFLOW_ID, msg)
            self.assertEqual(raw, raw_before)
            self.assertEqual(definitions, definitions_before)

        # 1) Unrecognized Claim.kind on F03 field
        raw1 = make_f03_base()
        raw1["claims"] = [_claim(raw1["section_fields"][0]["ref"], raw1["binding"], "unrecognized_f03_kind", "unknown")]
        assert_stops(raw1, "F03/claim_kind_unrecognized")

        # 2) Invalid proposed_value literal for F03 Claim.kind
        raw2 = make_f03_base()
        raw2["claims"] = [
            _claim(raw2["section_fields"][0]["ref"], raw2["binding"], "field_not_applicable", "invalid_literal")
        ]
        assert_stops(raw2, "F03/claim_proposed_value_invalid")

        # 3) Incomplete N/A record (decision=not_applicable with reason=None)
        raw3 = make_f03_base()
        app_ref = _ref_from(raw3["binding"]["template_ref"], "SYNTHETIC-F03-APP-INCOMPLETE", owner="synthetic-core-owner")
        core_ref = _ref_from(raw3["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE", owner="synthetic-core-owner")
        raw3["section_fields"][0]["applicability_ref"] = copy.deepcopy(app_ref)
        raw3["sources"][-1]["content"]["section_field_records"][0]["record"]["applicability_ref"] = copy.deepcopy(app_ref)
        raw3["sources"][-1]["content_bytes"] = canonical_json_bytes(raw3["sources"][-1]["content"]).decode("utf-8")
        digest = hashlib.sha256(raw3["sources"][-1]["content_bytes"].encode("utf-8")).hexdigest()
        raw3["sources"][-1]["ref"]["sha256"] = digest
        raw3["qualifications"][-1]["subject_ref"]["sha256"] = digest
        raw3["qualifications"][-1]["subject_sha256"] = digest
        raw3["knowledge_records"][0]["provenance_refs"][-1]["sha256"] = digest
        inc_app = {
            "ref": copy.deepcopy(app_ref),
            "subject_ref": copy.deepcopy(raw3["section_fields"][0]["ref"]),
            "binding": copy.deepcopy(raw3["binding"]),
            "owner": "synthetic-core-owner",
            "decision": "not_applicable",
            "reason": None,
            "reentry_condition": {"when": "later"},
            "source_ref": copy.deepcopy(core_ref),
        }
        raw3["applicability_records"] = [copy.deepcopy(inc_app)]
        _add_qualified_semantic_source(
            raw3,
            identity="SYNTHETIC-F03-CORE-SOURCE",
            owner="synthetic-core-owner",
            content={
                "binding": copy.deepcopy(raw3["binding"]),
                "field_applicability_records": [copy.deepcopy(inc_app)],
            },
            add_to_knowledge_provenance=False,
        )
        assert_stops(raw3, "F03/na_incomplete_branch")

        # 4) ValueFact.applicability_ref non-null with supplied applicability record
        raw4 = make_f03_base()
        v_ref = _ref_from(raw4["binding"]["template_ref"], "SYNTHETIC-F03-VAL-WITH-APP", owner="synthetic-knowledge-owner")
        v_app_ref = _ref_from(raw4["binding"]["template_ref"], "SYNTHETIC-F03-VAL-APP-REC", owner="synthetic-core-owner")
        core_ref4 = _ref_from(raw4["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE-4", owner="synthetic-core-owner")
        raw4["section_fields"][0]["value_fact_refs"] = [copy.deepcopy(v_ref)]
        raw4["sources"][-1]["content"]["section_field_records"][0]["record"]["value_fact_refs"] = [copy.deepcopy(v_ref)]
        val_rec4 = {
            "ref": copy.deepcopy(v_ref),
            "subject_ref": copy.deepcopy(raw4["section_fields"][0]["ref"]),
            "binding": copy.deepcopy(raw4["binding"]),
            "value": "some-val",
            "source_ref": copy.deepcopy(raw4["sources"][-1]["ref"]),
            "reason": "supplied value",
            "origin": "supplied",
            "applicability_ref": copy.deepcopy(v_app_ref),
        }
        raw4["values"] = [copy.deepcopy(val_rec4)]
        raw4["sources"][-1]["content"]["value_facts"] = [copy.deepcopy(val_rec4)]
        raw4["sources"][-1]["content_bytes"] = canonical_json_bytes(raw4["sources"][-1]["content"]).decode("utf-8")
        digest4 = hashlib.sha256(raw4["sources"][-1]["content_bytes"].encode("utf-8")).hexdigest()
        raw4["sources"][-1]["ref"]["sha256"] = digest4
        raw4["qualifications"][-1]["subject_ref"]["sha256"] = digest4
        raw4["qualifications"][-1]["subject_sha256"] = digest4
        raw4["knowledge_records"][0]["provenance_refs"][-1]["sha256"] = digest4
        val_app_rec4 = {
            "ref": copy.deepcopy(v_app_ref),
            "subject_ref": copy.deepcopy(raw4["section_fields"][0]["ref"]),
            "binding": copy.deepcopy(raw4["binding"]),
            "owner": "synthetic-core-owner",
            "decision": "applicable",
            "reason": "value applicability",
            "reentry_condition": {"when": "always"},
            "source_ref": copy.deepcopy(core_ref4),
        }
        raw4["applicability_records"] = [copy.deepcopy(val_app_rec4)]
        _add_qualified_semantic_source(
            raw4,
            identity="SYNTHETIC-F03-CORE-SOURCE-4",
            owner="synthetic-core-owner",
            content={
                "binding": copy.deepcopy(raw4["binding"]),
                "field_applicability_records": [copy.deepcopy(val_app_rec4)],
            },
            add_to_knowledge_provenance=False,
        )
        assert_stops(raw4, "F03/value_applicability_supplied")


if __name__ == "__main__":
    unittest.main()
