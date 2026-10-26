"""BRAIN032 F03（値と適用：Claim値表現・排他選択 rule 54..57）fn0→fn1→fn2 単体検証テスト。"""

from __future__ import annotations
import copy, hashlib, json, re, unittest
from pathlib import Path
from descriptor_definitions import _evaluate_field_values_detail, compare_descriptor_definitions, compare_values_and_applicability, validate_supply_input
from supply_input_fixtures import base_input, load_document

def canonical_json_bytes(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")

REPO_ROOT = Path(__file__).resolve().parents[5]
L4_PATH = REPO_ROOT / "docs/helix-brain/L4-basic-design/template-semantic-supply.json"
L5_PATH = REPO_ROOT / "docs/helix-brain/L5-detail-design/template-semantic-supply.json"
L7_PATH = REPO_ROOT / "docs/helix-brain/L7-function-verification/f03-fn2-values-applicability.json"
SRC_DIR = REPO_ROOT / "helix/helix-brain/units/HELIXBRAIN-UNIT-DESCRIPTOR-DEFINITION/src"
F03_BACKFLOW_ID = "HELIXBRAIN-L6-032-F03-FN2-PATH"

def _load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))

def _ref_from(base_ref: dict, identity: str, *, owner: str | None = "_KEEP_", sha256: str | None = None) -> dict:
    ref = copy.deepcopy(base_ref)
    ref["identity"] = identity
    if owner != "_KEEP_":
        ref["owner"] = owner
    ref["source_locator"] = None
    ref["sha256"] = sha256
    return ref

def _refs_in_order(refs: list[dict | None]) -> list[dict]:
    return [copy.deepcopy(ref) for ref in refs if isinstance(ref, dict)]

def _ev(branch: str, axis: str, state: str, owner: str | None, refs: list[dict | None]) -> dict:
    return {"branch": branch, "axis": axis, "state": state, "backflow_owner": owner, "original_refs": refs}

def _fnd(code: str, rule_ref: str, subject_ref: dict, axis: str, state: str, refs: list[dict | None], owner: str) -> dict:
    return {"code": code, "rule_ref": rule_ref, "subject_ref": subject_ref, "axis": axis, "state": state, "source_refs": refs, "backflow_owner": owner}

def _add_qualified_semantic_source(raw: dict, *, identity: str, owner: str | None, content: dict, add_to_knowledge_provenance: bool = False) -> dict:
    body_bytes = canonical_json_bytes(content)
    digest = hashlib.sha256(body_bytes).hexdigest()
    template_ref = raw["binding"]["template_ref"]
    source_ref = _ref_from(template_ref, identity, owner=owner, sha256=digest)
    qual_owner = owner if isinstance(owner, str) else "synthetic-knowledge-owner"
    root_ref = _ref_from(template_ref, f"SYNTHETIC-F03-{qual_owner}-ROOT", owner=qual_owner)
    qual_ref = _ref_from(template_ref, f"{identity}-QUALIFICATION", owner=qual_owner)
    raw["sources"].append({"ref": copy.deepcopy(source_ref), "content": copy.deepcopy(content), "content_bytes": body_bytes.decode("utf-8"), "qualification_ref": copy.deepcopy(qual_ref), "role": "semantic_json"})
    if not any(r.get("identity") == root_ref["identity"] and r.get("owner") == qual_owner for r in raw["qualification_roots"]):
        raw["qualification_roots"].append(copy.deepcopy(root_ref))
    raw["qualifications"].append({"ref": qual_ref, "subject_ref": copy.deepcopy(source_ref), "subject_sha256": digest, "applicable_scope": copy.deepcopy(template_ref["scope"]), "qualification_body": {"owner": qual_owner, "subject": identity, "logical_fixture_assumption": "独立owner resolverの合成元資料。実資格の証明ではない。"}, "root_ref": copy.deepcopy(root_ref)})
    if add_to_knowledge_provenance:
        raw["knowledge_records"][0]["provenance_refs"].append(copy.deepcopy(source_ref))
    return source_ref

def _resync_last_semantic_source(raw: dict, *, update_knowledge_provenance: bool = True) -> None:
    src = raw["sources"][-1]
    src["content_bytes"] = canonical_json_bytes(src["content"]).decode("utf-8")
    digest = hashlib.sha256(src["content_bytes"].encode("utf-8")).hexdigest()
    src["ref"]["sha256"] = digest
    raw["qualifications"][-1]["subject_ref"]["sha256"] = digest
    raw["qualifications"][-1]["subject_sha256"] = digest
    if update_knowledge_provenance:
        raw["knowledge_records"][0]["provenance_refs"][-1]["sha256"] = digest

def _required_field_normative_frame(l4_doc: dict) -> dict:
    snap = l4_doc["definition_meaning_resolution_contract"]["normative_basis_snapshot"]
    entry = snap["entries"][6]
    return {"revision": snap["revision"], "path": snap["path"], "file_sha256": snap["file_sha256"], "catalog_pointer": snap["pointer"], "catalog_canonical_sha256": snap["canonical_sha256"], "scope": copy.deepcopy(snap["scope"]), "entry_pointer": entry["pointer"], "entry_canonical_sha256": entry["canonical_sha256"], "entry_value": copy.deepcopy(entry["value"])}

def _positive_field_meaning_operation(raw: dict, l4_doc: dict) -> dict:
    slot = next(s for s in raw["descriptors"] if s["descriptor_kind"] == "required field")
    fact = slot["facts"][0]
    op_ref = _ref_from(raw["binding"]["template_ref"], "SYNTHETIC-F03-MEANING-OP-07", owner="synthetic-knowledge-owner")
    msg = "これは節内の欄の意味と要否条件を定め、節のN/Aから全欄N/Aを一律生成していない。"
    return {
        "operation_ref": op_ref,
        "arguments": {"binding": copy.deepcopy(raw["binding"]), "slot_identity": slot["slot_identity"], "descriptor_kind": "required field", "fact_ref": copy.deepcopy(fact["ref"]), "fact_body": copy.deepcopy(fact["meaning"]), "normative_argument": _required_field_normative_frame(l4_doc)},
        "decision": {"relation": "defines_descriptor", "reason": {"presence": "supplied", "value": msg}, "raw_semantic_basis": {"presence": "supplied", "value": {"original_owner_observation": msg, "comparison_subject": "同じ原fact bodyと独立固定規範の当該descriptor意味", "scope": "synthetic-only"}}, "basis_refs": []},
    }

def _claim(subject_ref: dict, binding: dict, kind: str, proposed_value: object, basis_refs: list | None = None) -> dict:
    return {"subject_ref": copy.deepcopy(subject_ref), "binding": copy.deepcopy(binding), "actor": "BRAIN", "kind": kind, "proposed_value": copy.deepcopy(proposed_value), "basis_refs": [] if basis_refs is None else copy.deepcopy(basis_refs)}

class TestF03ValuesAndApplicability(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.document = load_document()
        cls.l4_doc = _load_json(L4_PATH)
        cls.l5_doc = _load_json(L5_PATH)
        cls.l7_doc = _load_json(L7_PATH)
        cls.closed_types = cls.l4_doc["field_value_applicability_contract"]["closed_types"]
        cls.l5_types = cls.l5_doc["type_contract"]["types"]
        cls.reason_prefix_table = cls.l4_doc["field_value_applicability_contract"]["problem_reason_table"]
        cls.l5_rules_by_id = {
            r["id"]: r for r in cls.l5_doc["failure_rules"] if isinstance(r, dict) and "id" in r
        }

    def _expected_members(self, type_name: str) -> list[str]:
        spec = self.closed_types[type_name]
        return list(spec.get("required_fields") or spec["required"])

    def _assert_exact_members(self, obj: dict, type_name: str) -> None:
        self.assertIsInstance(obj, dict, f"{type_name} must be a dict")
        expected = self._expected_members(type_name)
        self.assertEqual(set(obj.keys()), set(expected), f"{type_name} keys mismatch")

    def _assert_presence_shape(self, obj: dict) -> None:
        self.assertIsInstance(obj, dict)
        self.assertIn(obj.get("presence"), ("absent", "supplied"))
        expected = {"presence"} if obj["presence"] == "absent" else {"presence", "value"}
        self.assertEqual(set(obj.keys()), expected)

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
        detail = _evaluate_field_values_detail({"snapshot": validated, "definitions": definitions})
        public = compare_values_and_applicability({"validated": validated, "definitions": definitions})
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(definitions, definitions_before)
        self._assert_f03_evaluation_schema(detail)
        return validated, definitions, detail, public

    def _assert_row_and_public_oracle(
        self,
        raw: dict,
        definitions: dict,
        detail: dict,
        public: dict,
        *,
        row_index: int = 0,
        expected_events: list[dict],
        expected_findings: list[dict] | None = None,
    ) -> None:
        self.assertEqual(detail["comparison"], public)
        self.assertEqual(public["producer_symbol"], "compare_values_and_applicability")
        self.assertEqual(public["input_binding"], raw["binding"])
        self.assertEqual(detail["comparison"]["input_binding"], raw["binding"])
        expected_carried = [
            a for a in definitions["axes"]
            if a["axis"] in {"required section.definition", "required field.definition"}
        ]
        self.assertEqual(len(expected_carried), 2)
        self.assertEqual(public["axes"][:2], expected_carried)
        offset = 2 + sum(len(detail["rows"][k]["events"]) for k in range(row_index))
        row = detail["rows"][row_index]
        self.assertEqual(row["axis_indices"], list(range(offset, offset + len(row["events"]))))
        self.assertEqual(len(row["events"]), len(expected_events))
        for ev_idx, (event, exp_ev) in enumerate(zip(row["events"], expected_events)):
            axis = public["axes"][row["axis_indices"][ev_idx]]
            self.assertEqual(event["branch"], exp_ev["branch"])
            self.assertEqual(event["axis"], exp_ev["axis"])
            self.assertEqual(event["state"], exp_ev["state"])
            self.assertEqual(event["backflow_owner"], exp_ev["backflow_owner"])
            self.assertEqual(event["original_refs"], _refs_in_order(exp_ev["original_refs"]))
            self.assertEqual(event["subject_ref"], {"presence": "supplied", "value": row["field"]["ref"]})
            self.assertEqual(event["binding"], {"presence": "supplied", "value": raw["binding"]})
            expected_reason = (
                self.reason_prefix_table[event["branch"]]
                + "\n"
                + canonical_json_bytes(event["reason_material"]).decode("utf-8")
            )
            self.assertEqual(event["reason"], expected_reason)
            self.assertEqual(axis["subject_ref"], row["field"]["ref"])
            self.assertEqual(axis["binding"], raw["binding"])
            self.assertEqual(axis["axis"], exp_ev["axis"])
            self.assertEqual(axis["state"], exp_ev["state"])
            self.assertEqual(axis["original_refs"], event["original_refs"])
            self.assertGreaterEqual(len(axis["original_refs"]), 1)
            self.assertEqual(axis["reason"], expected_reason)
            self.assertEqual(axis["backflow_owner"], exp_ev["backflow_owner"])
        if expected_findings is not None:
            self.assertEqual(len(public["findings"]), len(expected_findings))
            for finding, exp_f in zip(public["findings"], expected_findings):
                rule_spec = self.l5_rules_by_id[exp_f["rule_ref"]]
                self.assertEqual(finding["code"], exp_f["code"])
                self.assertEqual(finding["rule_ref"], exp_f["rule_ref"])
                self.assertEqual(finding["subject_ref"], exp_f["subject_ref"])
                self.assertEqual(finding["binding"], raw["binding"])
                self.assertEqual(finding["axis"], exp_f["axis"])
                self.assertEqual(finding["state"], exp_f["state"])
                self.assertEqual(finding["source_refs"], _refs_in_order(exp_f["source_refs"]))
                self.assertGreaterEqual(len(finding["source_refs"]), 1)
                self.assertEqual(finding["reason"], rule_spec["predicate"])
                self.assertEqual(finding["backflow_owner"], exp_f["backflow_owner"])

    def _add_f03_core_and_mapping_sources(
        self,
        raw: dict,
        fields: list[dict],
        *,
        value_facts: list[dict] | None = None,
        app_records: list[dict] | None = None,
        core_owner: str | None = "synthetic-core-owner",
        core_id: str = "SYNTHETIC-F03-CORE-SOURCE",
        map_id: str = "SYNTHETIC-F03-MAPPING-SOURCE",
    ) -> tuple[dict, dict]:
        slot7 = next(s for s in raw["descriptors"] if s["descriptor_kind"] == "required field")
        core_content: dict = {"binding": copy.deepcopy(raw["binding"])}
        if value_facts is not None:
            core_content["value_facts"] = copy.deepcopy(value_facts)
        if app_records is not None:
            core_content["field_applicability_records"] = copy.deepcopy(app_records)
        if value_facts is not None or app_records is not None:
            _add_qualified_semantic_source(
                raw, identity=core_id, owner=core_owner, content=core_content, add_to_knowledge_provenance=False
            )
        op = _positive_field_meaning_operation(raw, self.l4_doc)
        map_src_ref = _add_qualified_semantic_source(
            raw,
            identity=map_id,
            owner="synthetic-knowledge-owner",
            content={
                "binding": copy.deepcopy(raw["binding"]),
                "descriptor_targets": [
                    {
                        "target_ref": copy.deepcopy(fields[0]["descriptor_slot_ref"]),
                        "slot_identity": slot7["slot_identity"],
                        "descriptor_kind": "required field",
                    }
                ],
                "section_field_records": [{"record": copy.deepcopy(f)} for f in fields],
                "definition_meaning_operations": [op],
            },
            add_to_knowledge_provenance=True,
        )
        return op, map_src_ref

    def _prep_f03_field0(self, raw: dict, *, with_meaning: bool = True, clear_values: bool = False) -> tuple[dict, dict]:
        slot7 = next(s for s in raw["descriptors"] if s["descriptor_kind"] == "required field")
        field0 = raw["section_fields"][0]
        field0["parent_section_ref"] = None
        field0["meaning_fact_refs"] = [copy.deepcopy(slot7["facts"][0]["ref"])] if with_meaning else []
        for k in ("requiredness_fact_refs", "normative_rule_refs", "oracle_refs"):
            field0[k] = []
        if clear_values:
            field0["value_fact_refs"] = []
            raw["values"] = []
        return slot7, field0

    def _def_known_refs(self, raw: dict, field: dict, mapping_source_ref: dict, op: dict) -> list[dict]:
        slot7 = next(s for s in raw["descriptors"] if s["descriptor_kind"] == "required field")
        fact0 = slot7["facts"][0]
        return [
            field["ref"],
            field["descriptor_slot_ref"],
            raw["binding"]["knowledge_ref"],
            mapping_source_ref,
            fact0["ref"],
            fact0["source_ref"],
            mapping_source_ref,
            op["operation_ref"],
        ]

    def test_f03_owner_empty_missing_and_neg02_definition_as_value_gap(self) -> None:
        raw = base_input(self.document)
        field = raw["section_fields"][0]
        for k in ("meaning_fact_refs", "requiredness_fact_refs", "normative_rule_refs", "oracle_refs", "value_fact_refs"):
            field[k] = []
        field["parent_section_ref"] = None
        field["applicability_ref"] = None
        raw["values"] = []
        raw["applicability_records"] = []
        mapping_source_ref = _add_qualified_semantic_source(
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
        expected_refs = [field["ref"], field["descriptor_slot_ref"], raw["binding"]["knowledge_ref"], mapping_source_ref]
        expected_ev = [_ev("definition_empty", "field.definition", "missing", "synthetic-knowledge-owner", expected_refs)]
        with self.subTest(case="F03-L9-OWNER-EMPTY-MISSING"):
            _, definitions, detail, public = self._run_fn0_fn1_fn2(raw)
            self._assert_row_and_public_oracle(
                raw, definitions, detail, public, expected_events=expected_ev, expected_findings=[]
            )
            row0 = detail["rows"][0]
            self.assertEqual(row0["definition_read"]["owner_read"]["state"], "resolved")
            self.assertEqual(row0["definition_read"]["target_read"]["state"], "resolved")
            self.assertEqual(row0["definition_read"]["judgments"][0]["cause"], "meaning_refs_empty")
        with self.subTest(case="HELIXBRAIN-L8-032-F03-NEG-02"):
            raw_neg02 = copy.deepcopy(raw)
            basis_ref = _ref_from(raw["binding"]["template_ref"], "SYNTHETIC-F03-NEG02-BASIS", owner="synthetic-knowledge-owner")
            raw_neg02["claims"] = [_claim(field["ref"], raw["binding"], "value_only_gap", "unknown", [basis_ref])]
            _, definitions_neg02, detail_neg02, public_neg02 = self._run_fn0_fn1_fn2(raw_neg02)
            self._assert_row_and_public_oracle(raw_neg02, definitions_neg02, detail_neg02, public_neg02, expected_events=expected_ev, expected_findings=[ _fnd(
                        "definition_as_value_gap",
                        "HELIXBRAIN-L5-032-R-definition_as_value_gap",
                        field["ref"],
                        "field.definition",
                        "missing",
                        [*expected_refs, field["ref"], basis_ref],
                        "knowledge_owner",
                    )
                ],
            )
            self.assertEqual(detail_neg02["rows"][0]["finding_indices"], [0])
        with self.subTest(case="m3_other_source_owner_problems_preserved_when_resolved"):
            raw_multi = copy.deepcopy(raw)
            other_field = copy.deepcopy(field)
            other_field["ref"] = _ref_from(field["ref"], "SYNTHETIC-FIELD-UNRELATED", owner="synthetic-knowledge-owner")
            _add_qualified_semantic_source(
                raw_multi,
                identity="SYNTHETIC-F03-UNRELATED-FIELD-SOURCE",
                owner="synthetic-knowledge-owner",
                content={"binding": copy.deepcopy(raw_multi["binding"]), "section_field_records": [{"record": other_field}]},
                add_to_knowledge_provenance=True,
            )
            _, _, detail_multi, _ = self._run_fn0_fn1_fn2(raw_multi)
            owner_read = detail_multi["rows"][0]["definition_read"]["owner_read"]
            self.assertEqual(owner_read["state"], "resolved")
            self.assertEqual(len(owner_read["supports"]), 1)
            self.assertEqual([p["cause"] for p in owner_read["problems"]], ["field_owner_not_found", "lookup_unresolved"])

    def test_f03_owner_unobtained_unknown_and_add11_add12_unmaterialized_source_locality(self) -> None:
        with self.subTest(case="HELIXBRAIN-L8-032-NORMAL-compare_values_and_applicability"):
            raw = base_input(self.document)
            field = raw["section_fields"][0]
            val_rec = raw["values"][0]
            _, definitions, detail, public = self._run_fn0_fn1_fn2(raw)
            self._assert_row_and_public_oracle(raw, definitions, detail, public, expected_events=[ _ev("definition_unknown", "field.definition", "unknown", "synthetic-knowledge-owner", [field["ref"], field["descriptor_slot_ref"]]),
                    _ev("applicability_unknown", "applicability.evaluation", "unknown", "synthetic-knowledge-owner", [field["applicability_ref"]]),
                    _ev("value_unknown", "field.value", "unknown", "synthetic-knowledge-owner", [val_rec["ref"], val_rec["source_ref"]]),
                    _ev("field_unknown", "field.applicability", "unknown", "synthetic-knowledge-owner", [field["applicability_ref"]]),
                ],
                expected_findings=[],
            )
            self.assertEqual(detail["rows"][0]["definition_read"]["owner_read"]["state"], "unknown")
            self.assertEqual(detail["rows"][0]["definition_read"]["judgments"][0]["cause"], "field_owner_unresolved")
        with self.subTest(case="HELIXBRAIN-L8-032-ADD-11"):
            raw_add11 = base_input(self.document)
            app_rec11 = raw_add11["applicability_records"][0]
            app_rec11["owner"] = "synthetic-core-owner"
            app_rec11["decision"] = "not_applicable"
            app_rec11["reason"] = "CORE計画上のN/A理由（原source未形成）"
            app_rec11["reentry_condition"] = {"when": "原source形成後に再評価"}
            _, _, detail11, public11 = self._run_fn0_fn1_fn2(raw_add11)
            row11 = detail11["rows"][0]
            self.assertEqual(
                [(e["axis"], e["branch"], e["state"]) for e in row11["events"]],
                [
                    ("field.definition", "definition_unknown", "unknown"),
                    ("applicability.evaluation", "applicability_unknown", "unknown"),
                    ("field.value", "value_unknown", "unknown"),
                    ("field.applicability", "field_unknown", "unknown"),
                ],
            )
            self.assertEqual(row11["events"][1]["reason_material"]["original_decision"], {"presence": "absent"})
            self.assertEqual(
                row11["events"][1]["reason_material"]["original_presence"],
                {"presence": "supplied", "value": raw_add11["section_fields"][0]["applicability_ref"]},
            )
            self.assertEqual(row11["applicability_read"]["root_occurrences"][0]["original_value"]["decision"], "not_applicable")
            self.assertEqual(public11["findings"], [])
        with self.subTest(case="HELIXBRAIN-L8-032-ADD-12"):
            raw_add12 = base_input(self.document)
            raw_add12["values"][0]["value"] = None
            raw_add12["values"][0]["origin"] = "absent"
            raw_add12["values"][0]["reason"] = "案件値null化（原source未形成）"
            _, _, detail12, public12 = self._run_fn0_fn1_fn2(raw_add12)
            row12 = detail12["rows"][0]
            self.assertEqual(
                [(e["axis"], e["branch"], e["state"]) for e in row12["events"]],
                [
                    ("field.definition", "definition_unknown", "unknown"),
                    ("applicability.evaluation", "applicability_unknown", "unknown"),
                    ("field.value", "value_unknown", "unknown"),
                    ("field.applicability", "field_unknown", "unknown"),
                ],
            )
            self.assertEqual(row12["events"][2]["reason_material"]["original_presence"], {"presence": "supplied", "value": None})
            self.assertEqual(public12["findings"], [])
        with self.subTest(case="F03-L9-OWNER-UNOBTAINED-UNKNOWN_and_M7_meaning_fact_refs_null_precedence"):
            raw_f03 = base_input(self.document)
            field0 = raw_f03["section_fields"][0]
            for k in ("meaning_fact_refs", "requiredness_fact_refs", "normative_rule_refs", "oracle_refs", "value_fact_refs"):
                field0[k] = []
            field0["parent_section_ref"] = None
            field0["applicability_ref"] = None
            raw_f03["values"] = []
            raw_f03["applicability_records"] = []
            _, definitions_f03, detail_f03, public_f03 = self._run_fn0_fn1_fn2(raw_f03)
            self._assert_row_and_public_oracle(raw_f03, definitions_f03, detail_f03, public_f03, expected_events=[ _ev(
                        "definition_unknown",
                        "field.definition",
                        "unknown",
                        "synthetic-knowledge-owner",
                        [field0["ref"], field0["descriptor_slot_ref"], raw_f03["binding"]["knowledge_ref"]],
                    )
                ],
                expected_findings=[],
            )
            self.assertEqual(detail_f03["rows"][0]["definition_read"]["owner_read"]["problems"][0]["cause"], "field_owner_not_found")
            validated_m7 = validate_supply_input(raw_f03)
            definitions_m7 = compare_descriptor_definitions({"validated": validated_m7})
            validated_m7["input"]["section_fields"][0]["meaning_fact_refs"] = None
            detail_m7 = _evaluate_field_values_detail({"snapshot": validated_m7, "definitions": definitions_m7})
            self.assertEqual([e["branch"] for e in detail_m7["rows"][0]["events"]], ["definition_unknown"])
            self.assertEqual(detail_m7["rows"][0]["definition_read"]["judgments"][0]["cause"], "field_owner_unresolved")

    def test_f03_l9_defined_value_unknown_two_field_locality_and_neg01_unknown_as_na(self) -> None:
        raw = base_input(self.document)
        slot7, field0 = self._prep_f03_field0(raw, with_meaning=True, clear_values=False)
        fact_ref = copy.deepcopy(slot7["facts"][0]["ref"])
        core_src_placeholder = _ref_from(raw["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE", owner="synthetic-core-owner")
        val0 = raw["values"][0]
        val0.update({"value": None, "origin": "absent", "reason": "案件固有の監査保持期間がCOREから未供給", "source_ref": copy.deepcopy(core_src_placeholder), "applicability_ref": None})
        app0 = raw["applicability_records"][0]
        app0.update({"owner": "synthetic-core-owner", "decision": "applicable", "reason": "監査対象のため適用", "reentry_condition": {"when": "監査対象区分変更時"}, "source_ref": copy.deepcopy(core_src_placeholder)})
        field1 = copy.deepcopy(field0)
        field1["ref"] = _ref_from(field0["ref"], "SYNTHETIC-FIELD-02", owner="synthetic-knowledge-owner")
        val1_ref = _ref_from(val0["ref"], "SYNTHETIC-VALUE-02", owner="synthetic-core-owner")
        app1_ref = _ref_from(app0["ref"], "SYNTHETIC-APPLICABILITY-02", owner="synthetic-core-owner")
        field1["value_fact_refs"] = [copy.deepcopy(val1_ref)]
        field1["applicability_ref"] = copy.deepcopy(app1_ref)
        val1 = {"ref": copy.deepcopy(val1_ref), "subject_ref": copy.deepcopy(field1["ref"]), "binding": copy.deepcopy(raw["binding"]), "value": "7 years", "source_ref": copy.deepcopy(core_src_placeholder), "reason": "7年保持供給済み", "origin": "product_input", "applicability_ref": None}
        app1 = {"ref": copy.deepcopy(app1_ref), "subject_ref": copy.deepcopy(field1["ref"]), "binding": copy.deepcopy(raw["binding"]), "owner": "synthetic-core-owner", "decision": "applicable", "reason": "法務要件により適用", "reentry_condition": {"when": "法改正時"}, "source_ref": copy.deepcopy(core_src_placeholder)}
        raw["section_fields"].append(field1)
        raw["values"].append(val1)
        raw["applicability_records"].append(app1)
        op, mapping_source_ref = self._add_f03_core_and_mapping_sources(
            raw, [field0, field1], value_facts=[val0, val1], app_records=[app0, app1]
        )
        k_ref = raw["binding"]["knowledge_ref"]
        def_refs_0 = self._def_known_refs(raw, field0, mapping_source_ref, op)
        def_refs_1 = self._def_known_refs(raw, field1, mapping_source_ref, op)
        app0_refs = [app0["ref"], k_ref, core_src_placeholder]
        val0_refs = [val0["ref"], k_ref, core_src_placeholder]
        app1_refs = [app1["ref"], k_ref, core_src_placeholder]
        val1_refs = [val1["ref"], k_ref, core_src_placeholder]
        ev_row0 = [
            _ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", def_refs_0),
            _ev("applicability_applicable", "applicability.evaluation", "applicable", "synthetic-core-owner", app0_refs),
            _ev("value_unknown", "field.value", "unknown", "synthetic-core-owner", val0_refs),
            _ev("field_applicable", "field.applicability", "applicable", "synthetic-core-owner", app0_refs),
        ]
        ev_row1 = [
            _ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", def_refs_1),
            _ev("applicability_applicable", "applicability.evaluation", "applicable", "synthetic-core-owner", app1_refs),
            _ev("value_supplied", "field.value", "supplied", "synthetic-core-owner", val1_refs),
            _ev("field_applicable", "field.applicability", "applicable", "synthetic-core-owner", app1_refs),
        ]
        with self.subTest(case="two_field_locality_claims_empty"):
            _, definitions, detail, public = self._run_fn0_fn1_fn2(raw)
            self._assert_row_and_public_oracle(raw, definitions, detail, public, row_index=0, expected_events=ev_row0, expected_findings=[])
            self._assert_row_and_public_oracle(raw, definitions, detail, public, row_index=1, expected_events=ev_row1, expected_findings=[])
        with self.subTest(case="HELIXBRAIN-L8-032-F03-NEG-01"):
            raw_neg01 = copy.deepcopy(raw)
            raw_neg01["claims"] = [_claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable")]
            _, definitions_neg01, detail_neg01, public_neg01 = self._run_fn0_fn1_fn2(raw_neg01)
            self._assert_row_and_public_oracle(raw_neg01, definitions_neg01, detail_neg01, public_neg01, row_index=0, expected_events=ev_row0, expected_findings=[_fnd("unknown_as_na", "HELIXBRAIN-L5-032-R-unknown_as_na", field0["ref"], "field.value", "unknown", [*val0_refs, field0["ref"]], "core_owner")],
            )
            self.assertEqual(detail_neg01["rows"][0]["finding_indices"], [0])
            self.assertEqual(detail_neg01["rows"][1]["finding_indices"], [])
        with self.subTest(case="F03-L9-DEFINED-VALUE-UNKNOWN_and_M5_no_hardcoded_core_owner"):
            for custom_owner in ("custom-core-owner-42", None):
                raw_m5 = base_input(self.document)
                f0 = raw_m5["section_fields"][0]
                f0["parent_section_ref"] = None
                f0["meaning_fact_refs"] = [copy.deepcopy(fact_ref)]
                for k in ("requiredness_fact_refs", "normative_rule_refs", "oracle_refs"):
                    f0[k] = []
                f0["applicability_ref"] = None
                raw_m5["applicability_records"] = []
                eff_owner = custom_owner or "custom-core-owner-42"
                v_src_placeholder = _ref_from(raw_m5["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE-M5", owner=eff_owner)
                v0 = raw_m5["values"][0]
                v0.update({"value": None, "origin": "absent", "reason": "未決", "source_ref": copy.deepcopy(v_src_placeholder), "applicability_ref": None})
                op_m5, map_src_ref = self._add_f03_core_and_mapping_sources(
                    raw_m5, [f0], value_facts=[v0], core_owner=eff_owner,
                    core_id="SYNTHETIC-F03-CORE-SOURCE-M5", map_id="SYNTHETIC-F03-MAPPING-SOURCE-M5",
                )
                if custom_owner is None:
                    v_src_placeholder = copy.deepcopy(v_src_placeholder)
                    v_src_placeholder["owner"] = None
                    val_m5 = validate_supply_input(raw_m5)
                    defs_m5 = compare_descriptor_definitions({"validated": val_m5})
                    val_m5["input"]["values"][0]["source_ref"]["owner"] = None
                    for s_m5 in val_m5["input"]["sources"]:
                        if s_m5["ref"]["identity"] == "SYNTHETIC-F03-CORE-SOURCE-M5":
                            s_m5["content"]["value_facts"][0]["source_ref"]["owner"] = None
                    detail_m5 = _evaluate_field_values_detail({"snapshot": val_m5, "definitions": defs_m5})
                    pub_m5 = compare_values_and_applicability({"validated": val_m5, "definitions": defs_m5})
                    raw_m5["values"][0]["source_ref"]["owner"] = None
                else:
                    _, defs_m5, detail_m5, pub_m5 = self._run_fn0_fn1_fn2(raw_m5)
                self._assert_row_and_public_oracle(
                    raw_m5, defs_m5, detail_m5, pub_m5, row_index=0,
                    expected_events=[
                        _ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", self._def_known_refs(raw_m5, f0, map_src_ref, op_m5)),
                        _ev("applicability_null", "applicability.evaluation", "unknown", custom_owner, [raw_m5["binding"]["knowledge_ref"]]),
                        _ev("value_unknown", "field.value", "unknown", custom_owner if custom_owner is not None else "synthetic-knowledge-owner", [v0["ref"], raw_m5["binding"]["knowledge_ref"], v_src_placeholder] if custom_owner is not None else [v0["ref"], v_src_placeholder]),
                        _ev("field_unknown", "field.applicability", "unknown", custom_owner, [raw_m5["binding"]["knowledge_ref"]]),
                    ],
                    expected_findings=[],
                )

    def test_f03_explicit_applicability_unknown_and_neg03_applicability_unknown_as_na(self) -> None:
        raw = base_input(self.document)
        slot7, field0 = self._prep_f03_field0(raw, with_meaning=True, clear_values=True)
        core_src_placeholder = _ref_from(raw["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE", owner="synthetic-core-owner")
        app0 = raw["applicability_records"][0]
        app0.update({"owner": "synthetic-core-owner", "decision": "unknown", "reason": "適用条件未決", "reentry_condition": {"when": "独立evidence取得後"}, "source_ref": copy.deepcopy(core_src_placeholder)})
        op, mapping_source_ref = self._add_f03_core_and_mapping_sources(raw, [field0], app_records=[app0])
        app_refs = [app0["ref"], raw["binding"]["knowledge_ref"], core_src_placeholder]
        expected_ev = [
            _ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", self._def_known_refs(raw, field0, mapping_source_ref, op)),
            _ev("applicability_unknown", "applicability.evaluation", "unknown", "synthetic-core-owner", app_refs),
            _ev("field_unknown", "field.applicability", "unknown", "synthetic-core-owner", app_refs),
        ]
        with self.subTest(case="F03-L9-EXPLICIT-APPLICABILITY-UNKNOWN"):
            _, definitions, detail, public = self._run_fn0_fn1_fn2(raw)
            self._assert_row_and_public_oracle(raw, definitions, detail, public, expected_events=expected_ev, expected_findings=[])
        with self.subTest(case="HELIXBRAIN-L8-032-F03-NEG-03"):
            raw_neg03 = copy.deepcopy(raw)
            raw_neg03["claims"] = [_claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable")]
            _, definitions_neg03, detail_neg03, public_neg03 = self._run_fn0_fn1_fn2(raw_neg03)
            self._assert_row_and_public_oracle(
                raw_neg03, definitions_neg03, detail_neg03, public_neg03, expected_events=expected_ev,
                expected_findings=[_fnd("applicability_unknown_as_na", "HELIXBRAIN-L5-032-R-applicability_unknown_as_na", field0["ref"], "applicability.evaluation", "unknown", [*app_refs, field0["ref"]], "core_owner")],
            )
            self.assertEqual(detail_neg03["rows"][0]["finding_indices"], [0])

    def test_f03_parent_na_no_propagation_and_neg04_section_na_all_fields(self) -> None:
        raw = base_input(self.document)
        slot7 = next(s for s in raw["descriptors"] if s["descriptor_kind"] == "required field")
        field0 = raw["section_fields"][0]
        section_ref = copy.deepcopy(field0["parent_section_ref"])
        field0["meaning_fact_refs"] = [copy.deepcopy(slot7["facts"][0]["ref"])]
        for k in ("requiredness_fact_refs", "normative_rule_refs", "oracle_refs", "value_fact_refs"):
            field0[k] = []
        field0["applicability_ref"] = None
        raw["values"] = []
        core_src_placeholder = _ref_from(raw["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE", owner="synthetic-core-owner")
        parent_app = raw["applicability_records"][0]
        parent_app.update({
            "ref": _ref_from(parent_app["ref"], "SYNTHETIC-F03-PARENT-APPLICABILITY", owner="synthetic-core-owner"),
            "subject_ref": copy.deepcopy(section_ref),
            "owner": "synthetic-core-owner",
            "decision": "not_applicable",
            "reason": "親sectionに限り対象外である。",
            "reentry_condition": {"when": "親section条件変更時"},
            "source_ref": copy.deepcopy(core_src_placeholder),
        })
        op, mapping_source_ref = self._add_f03_core_and_mapping_sources(raw, [field0], app_records=[parent_app])
        parent_refs = [parent_app["ref"], raw["binding"]["knowledge_ref"], core_src_placeholder]
        expected_ev = [
            _ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", self._def_known_refs(raw, field0, mapping_source_ref, op)),
            _ev("applicability_null", "applicability.evaluation", "unknown", "synthetic-core-owner", [raw["binding"]["knowledge_ref"]]),
            _ev("parent_na_no_transfer", "field.applicability", "unknown", "synthetic-core-owner", parent_refs),
        ]
        with self.subTest(case="F03-L9-PARENT-NA-NO-PROPAGATION"):
            _, definitions, detail, public = self._run_fn0_fn1_fn2(raw)
            self._assert_row_and_public_oracle(raw, definitions, detail, public, expected_events=expected_ev, expected_findings=[])
            self.assertEqual(detail["rows"][0]["parent_reads"][0]["state"], "resolved")
        with self.subTest(case="HELIXBRAIN-L8-032-F03-NEG-04"):
            raw_neg04 = copy.deepcopy(raw)
            raw_neg04["claims"] = [_claim(field0["ref"], raw["binding"], "all_section_fields_not_applicable", "not_applicable")]
            _, definitions_neg04, detail_neg04, public_neg04 = self._run_fn0_fn1_fn2(raw_neg04)
            self._assert_row_and_public_oracle(
                raw_neg04, definitions_neg04, detail_neg04, public_neg04, expected_events=expected_ev,
                expected_findings=[_fnd("section_na_all_fields", "HELIXBRAIN-L5-032-R-section_na_all_fields", field0["ref"], "field.applicability", "unknown", [*parent_refs, field0["ref"]], "core_owner")],
            )
            self.assertEqual(detail_neg04["rows"][0]["finding_indices"], [0])

    def test_f03_l9_justified_field_na_and_supplied_false_zero_empty_applicable(self) -> None:
        with self.subTest(case="F03-L9-JUSTIFIED-FIELD-NA"):
            raw_na = base_input(self.document)
            slot7, field0 = self._prep_f03_field0(raw_na, with_meaning=True, clear_values=True)
            core_src_placeholder = _ref_from(raw_na["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE", owner="synthetic-core-owner")
            app0 = raw_na["applicability_records"][0]
            app0.update({"owner": "synthetic-core-owner", "decision": "not_applicable", "reason": "対象外", "reentry_condition": {"when": "条件変更時"}, "source_ref": copy.deepcopy(core_src_placeholder)})
            op, mapping_source_ref = self._add_f03_core_and_mapping_sources(raw_na, [field0], app_records=[app0])
            raw_na["claims"] = [_claim(field0["ref"], raw_na["binding"], "field_not_applicable", "not_applicable")]
            _, definitions_na, detail_na, public_na = self._run_fn0_fn1_fn2(raw_na)
            app_refs = [app0["ref"], raw_na["binding"]["knowledge_ref"], core_src_placeholder]
            self._assert_row_and_public_oracle(raw_na, definitions_na, detail_na, public_na, expected_events=[ _ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", self._def_known_refs(raw_na, field0, mapping_source_ref, op)),
                    _ev("applicability_na", "applicability.evaluation", "not_applicable", "synthetic-core-owner", app_refs),
                    _ev("field_na", "field.applicability", "not_applicable", "synthetic-core-owner", app_refs),
                ],
                expected_findings=[],
            )
            self.assertEqual(detail_na["rows"][0]["value_reads"], [])
        for supplied_val in (False, 0, ""):
            with self.subTest(case="F03-L9-SUPPLIED-FALSE-APPLICABLE", supplied_val=supplied_val):
                raw_sup = base_input(self.document)
                slot7, field0 = self._prep_f03_field0(raw_sup, with_meaning=True, clear_values=False)
                core_src_placeholder = _ref_from(raw_sup["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE", owner="synthetic-core-owner")
                val0 = raw_sup["values"][0]
                val0.update({"value": supplied_val, "origin": "product_input", "reason": "明示供給値", "source_ref": copy.deepcopy(core_src_placeholder), "applicability_ref": None})
                app0 = raw_sup["applicability_records"][0]
                app0.update({"owner": "synthetic-core-owner", "decision": "applicable", "reason": "適用", "reentry_condition": {"when": "条件変更時"}, "source_ref": copy.deepcopy(core_src_placeholder)})
                op, mapping_source_ref = self._add_f03_core_and_mapping_sources(raw_sup, [field0], value_facts=[val0], app_records=[app0])
                _, definitions_sup, detail_sup, public_sup = self._run_fn0_fn1_fn2(raw_sup)
                app_refs = [app0["ref"], raw_sup["binding"]["knowledge_ref"], core_src_placeholder]
                val_refs = [val0["ref"], raw_sup["binding"]["knowledge_ref"], core_src_placeholder]
                self._assert_row_and_public_oracle(raw_sup, definitions_sup, detail_sup, public_sup, expected_events=[ _ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", self._def_known_refs(raw_sup, field0, mapping_source_ref, op)),
                        _ev("applicability_applicable", "applicability.evaluation", "applicable", "synthetic-core-owner", app_refs),
                        _ev("value_supplied", "field.value", "supplied", "synthetic-core-owner", val_refs),
                        _ev("field_applicable", "field.applicability", "applicable", "synthetic-core-owner", app_refs),
                    ],
                    expected_findings=[],
                )
                self.assertEqual(detail_sup["rows"][0]["events"][2]["reason_material"]["original_presence"], {"presence": "supplied", "value": supplied_val})

    def test_f03_vf3_claim_selection_and_non_firing_contrasts(self) -> None:
        raw = base_input(self.document)
        slot7, field0 = self._prep_f03_field0(raw, with_meaning=True, clear_values=False)
        core_src_placeholder = _ref_from(raw["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE", owner="synthetic-core-owner")
        val0 = raw["values"][0]
        val0.update({"value": None, "origin": "absent", "reason": "案件値未決", "source_ref": copy.deepcopy(core_src_placeholder), "applicability_ref": None})
        app0 = raw["applicability_records"][0]
        app0.update({"owner": "synthetic-core-owner", "decision": "unknown", "reason": "適用性未決", "reentry_condition": {"when": "再確認時"}, "source_ref": copy.deepcopy(core_src_placeholder)})
        op, mapping_source_ref = self._add_f03_core_and_mapping_sources(raw, [field0], value_facts=[val0], app_records=[app0])
        _, _, _, public_no_claims = self._run_fn0_fn1_fn2(raw)
        app_refs = [app0["ref"], raw["binding"]["knowledge_ref"], core_src_placeholder]
        val_refs = [val0["ref"], raw["binding"]["knowledge_ref"], core_src_placeholder]
        expected_events = [
            _ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", self._def_known_refs(raw, field0, mapping_source_ref, op)),
            _ev("applicability_unknown", "applicability.evaluation", "unknown", "synthetic-core-owner", app_refs),
            _ev("value_unknown", "field.value", "unknown", "synthetic-core-owner", val_refs),
            _ev("field_unknown", "field.applicability", "unknown", "synthetic-core-owner", app_refs),
        ]
        with self.subTest(case="HELIXBRAIN-L8-032-VF3-F03-CLAIMS_duplicate_claims_not_deduplicated"):
            raw_vf3 = copy.deepcopy(raw)
            raw_vf3["claims"] = [
                _claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable"),
                _claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable"),
                _claim(field0["ref"], raw["binding"], "field_not_applicable", "applicable"),
            ]
            expected_f56 = _fnd(
                "applicability_unknown_as_na", "HELIXBRAIN-L5-032-R-applicability_unknown_as_na",
                field0["ref"], "applicability.evaluation", "unknown", [*app_refs, field0["ref"]], "core_owner",
            )
            validated_vf3, definitions_vf3, detail_vf3, public_vf3 = self._run_fn0_fn1_fn2(raw_vf3)
            self._assert_row_and_public_oracle(raw_vf3, definitions_vf3, detail_vf3, public_vf3, expected_events=expected_events, expected_findings=[expected_f56, expected_f56],  )
            self.assertEqual(len(public_vf3["findings"]), 2)
            self.assertEqual(public_vf3["findings"][0], public_vf3["findings"][1])
            self.assertEqual(detail_vf3["rows"][0]["finding_indices"], [0, 1])
            self.assertEqual(public_vf3["axes"], public_no_claims["axes"])
            self.assertEqual(len(validated_vf3["input"]["claims"]), 3)
        non_firing_claim_cases = [
            ("rule55_contrast_definition_known_not_missing", [_claim(field0["ref"], raw["binding"], "value_only_gap", "unknown")]),
            ("rule55_contrast_negative_proposed_value", [_claim(field0["ref"], raw["binding"], "value_only_gap", "not_value_only")]),
            ("rule56_contrast_negative_proposed_value", [_claim(field0["ref"], raw["binding"], "field_not_applicable", "applicable")]),
            ("rule57_contrast_not_parent_na_branch", [_claim(field0["ref"], raw["binding"], "all_section_fields_not_applicable", "not_applicable")]),
            ("m2_unrecognized_f03_claim_kind", [_claim(field0["ref"], raw["binding"], "unrecognized_f03_kind", "unknown")]),
            ("m2_unrecognized_f03_proposed_value_literal", [_claim(field0["ref"], raw["binding"], "field_not_applicable", "invalid_literal")]),
            ("m2_null_f03_proposed_value", [_claim(field0["ref"], raw["binding"], "value_only_gap", None)]),
        ]
        for label, claims_list in non_firing_claim_cases:
            with self.subTest(case=label):
                raw_nf = copy.deepcopy(raw)
                raw_nf["claims"] = copy.deepcopy(claims_list)
                validated_nf, definitions_nf, detail_nf, public_nf = self._run_fn0_fn1_fn2(raw_nf)
                self._assert_row_and_public_oracle(
                    raw_nf, definitions_nf, detail_nf, public_nf, expected_events=expected_events, expected_findings=[],
                )
                self.assertEqual(detail_nf["rows"][0]["finding_indices"], [])
                self.assertEqual(public_nf["axes"], public_no_claims["axes"])
                self.assertEqual(validated_nf["input"]["claims"], claims_list)
        with self.subTest(case="rule54_rule56_contrast_when_value_supplied_and_applicable"):
            raw_contrast = copy.deepcopy(raw)
            raw_contrast["values"][0]["value"] = "supplied-value"
            raw_contrast["values"][0]["origin"] = "product_input"
            raw_contrast["applicability_records"][0]["decision"] = "applicable"
            raw_contrast["sources"] = raw_contrast["sources"][:5]
            raw_contrast["qualifications"] = raw_contrast["qualifications"][:5]
            raw_contrast["knowledge_records"][0]["provenance_refs"] = raw_contrast["knowledge_records"][0]["provenance_refs"][:1]
            self._add_f03_core_and_mapping_sources(
                raw_contrast, [field0], value_facts=[raw_contrast["values"][0]], app_records=[raw_contrast["applicability_records"][0]]
            )
            _, _, _, pub_contrast_no_claims = self._run_fn0_fn1_fn2(raw_contrast)
            raw_contrast["claims"] = [
                _claim(field0["ref"], raw_contrast["binding"], "field_not_applicable", "not_applicable"),
                _claim(field0["ref"], raw_contrast["binding"], "all_section_fields_not_applicable", "not_applicable"),
            ]
            _, _, detail_contrast, public_contrast = self._run_fn0_fn1_fn2(raw_contrast)
            self.assertEqual(public_contrast["findings"], [])
            self.assertEqual(detail_contrast["rows"][0]["finding_indices"], [])
            self.assertEqual(public_contrast["axes"], pub_contrast_no_claims["axes"])

    def test_f03_unclosed_branches_stop_with_tagged_not_implemented_error(self) -> None:
        def make_f03_base() -> dict:
            raw = base_input(self.document)
            field = raw["section_fields"][0]
            for k in ("meaning_fact_refs", "requiredness_fact_refs", "normative_rule_refs", "oracle_refs", "value_fact_refs"):
                field[k] = []
            field["parent_section_ref"] = None
            field["applicability_ref"] = None
            raw["values"] = []
            raw["applicability_records"] = []
            _add_qualified_semantic_source(
                raw, identity="SYNTHETIC-F03-MAPPING-SOURCE", owner="synthetic-knowledge-owner",
                content={
                    "binding": copy.deepcopy(raw["binding"]),
                    "descriptor_targets": [{"target_ref": copy.deepcopy(field["descriptor_slot_ref"]), "slot_identity": "synthetic-descriptor-7", "descriptor_kind": "required field"}],
                    "section_field_records": [{"record": copy.deepcopy(field)}],
                },
                add_to_knowledge_provenance=True,
            )
            return raw

        def assert_stops(raw: dict, expected_branch_tag: str, *, mutate_validated_fn=None) -> None:
            raw_before = copy.deepcopy(raw)
            validated = validate_supply_input(raw)
            definitions = compare_descriptor_definitions({"validated": validated})
            if mutate_validated_fn is not None:
                mutate_validated_fn(validated)
            validated_before = copy.deepcopy(validated)
            definitions_before = copy.deepcopy(definitions)
            with self.assertRaises(NotImplementedError) as caught:
                compare_values_and_applicability({"validated": validated, "definitions": definitions})
            msg = str(caught.exception)
            self.assertIn(expected_branch_tag, msg)
            self.assertIn(F03_BACKFLOW_ID, msg)
            self.assertEqual(raw, raw_before)
            self.assertEqual(validated, validated_before)
            self.assertEqual(definitions, definitions_before)
        expected_l7_tags = [
            entry.split(":", 1)[0].strip()
            for entry in self.l7_doc["partial_oracle_and_stop_boundary"]["unclosed_stop_branches"]
        ]
        impl_tags = {
            f"F03/{m}"
            for py_file in sorted(SRC_DIR.glob("values_applicability*.py"))
            for m in re.findall(r'_f03_stop\(\s*"([^"]+)"', py_file.read_text(encoding="utf-8"))
        }
        with self.subTest(check="impl_stop_tags_match_l7"):
            self.assertEqual(sorted(impl_tags), sorted(expected_l7_tags))
        tested_tags: list[str] = []
        # 1) F03/applicability_records_absent_or_shape
        tag1 = "F03/applicability_records_absent_or_shape"
        tested_tags.append(tag1)
        with self.subTest(branch=tag1):
            assert_stops(make_f03_base(), tag1, mutate_validated_fn=lambda v: v["input"].pop("applicability_records", None))
        # 2) F03/carrier_or_source_record_shape
        tag2 = "F03/carrier_or_source_record_shape"
        tested_tags.append(tag2)
        with self.subTest(branch=tag2):
            raw2 = make_f03_base()
            raw2["sources"][-1]["content"]["section_field_records"] = "not-a-list"
            _resync_last_semantic_source(raw2)
            assert_stops(raw2, tag2)
        # 3) F03/duplicate_conflicting_carrier_records
        tag3 = "F03/duplicate_conflicting_carrier_records"
        tested_tags.append(tag3)
        with self.subTest(branch=tag3):
            raw3 = make_f03_base()
            conflicting_mirror = copy.deepcopy(raw3["section_fields"][0])
            conflicting_mirror["parent_section_ref"] = _ref_from(raw3["binding"]["template_ref"], "SYNTHETIC-SECTION-CONFLICT")
            raw3["sources"][-1]["content"]["section_field_records"] = [{"record": conflicting_mirror}]
            _resync_last_semantic_source(raw3)
            assert_stops(raw3, tag3)
        # 4) F03/meaning_fact_refs_shape
        tag4 = "F03/meaning_fact_refs_shape"
        tested_tags.append(tag4)
        with self.subTest(branch=tag4):
            def _mutate_meaning_refs_null(v: dict) -> None:
                v["input"]["section_fields"][0]["meaning_fact_refs"] = None
                v["input"]["sources"][-1]["content"]["section_field_records"][0]["record"]["meaning_fact_refs"] = None
                _resync_last_semantic_source(v["input"])
            assert_stops(make_f03_base(), tag4, mutate_validated_fn=_mutate_meaning_refs_null)
        # 5) F03/meaning_comparison_pair_read
        tag5 = "F03/meaning_comparison_pair_read"
        tested_tags.append(tag5)
        with self.subTest(branch=tag5):
            raw5 = make_f03_base()
            slot7 = next(s for s in raw5["descriptors"] if s["descriptor_kind"] == "required field")
            fact_ref = copy.deepcopy(slot7["facts"][0]["ref"])
            raw5["section_fields"][0]["meaning_fact_refs"] = [copy.deepcopy(fact_ref)]
            raw5["sources"][-1]["content"]["section_field_records"][0]["record"]["meaning_fact_refs"] = [copy.deepcopy(fact_ref)]
            _resync_last_semantic_source(raw5)
            assert_stops(
                raw5, tag5,
                mutate_validated_fn=lambda v: v["input"].update({"meaning_comparisons": [{"left_fact_ref": copy.deepcopy(fact_ref), "right_fact_ref": copy.deepcopy(fact_ref), "relation": "equivalent"}]}),
            )
        # 6) F03/meaning_operation_shape
        tag6 = "F03/meaning_operation_shape"
        tested_tags.append(tag6)
        with self.subTest(branch=tag6):
            raw6 = make_f03_base()
            slot7 = next(s for s in raw6["descriptors"] if s["descriptor_kind"] == "required field")
            fact_ref = copy.deepcopy(slot7["facts"][0]["ref"])
            raw6["section_fields"][0]["meaning_fact_refs"] = [copy.deepcopy(fact_ref)]
            raw6["sources"][-1]["content"]["section_field_records"][0]["record"]["meaning_fact_refs"] = [copy.deepcopy(fact_ref)]
            bad_op = _positive_field_meaning_operation(raw6, self.l4_doc)
            bad_op["decision"]["reason"] = {"presence": "supplied", "value": 12345}
            raw6["sources"][-1]["content"]["definition_meaning_operations"] = [bad_op]
            _resync_last_semantic_source(raw6)
            assert_stops(raw6, tag6)
        # 7) F03/na_incomplete_branch
        tag7 = "F03/na_incomplete_branch"
        tested_tags.append(tag7)
        with self.subTest(branch=tag7):
            raw7 = make_f03_base()
            app_ref = _ref_from(raw7["binding"]["template_ref"], "SYNTHETIC-F03-APP-INCOMPLETE", owner="synthetic-core-owner")
            core_ref = _ref_from(raw7["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE", owner="synthetic-core-owner")
            raw7["section_fields"][0]["applicability_ref"] = copy.deepcopy(app_ref)
            raw7["sources"][-1]["content"]["section_field_records"][0]["record"]["applicability_ref"] = copy.deepcopy(app_ref)
            _resync_last_semantic_source(raw7)
            inc_app = {"ref": copy.deepcopy(app_ref), "subject_ref": copy.deepcopy(raw7["section_fields"][0]["ref"]), "binding": copy.deepcopy(raw7["binding"]), "owner": "synthetic-core-owner", "decision": "not_applicable", "reason": None, "reentry_condition": {"when": "later"}, "source_ref": copy.deepcopy(core_ref)}
            raw7["applicability_records"] = [copy.deepcopy(inc_app)]
            _add_qualified_semantic_source(raw7, identity="SYNTHETIC-F03-CORE-SOURCE", owner="synthetic-core-owner", content={"binding": copy.deepcopy(raw7["binding"]), "field_applicability_records": [copy.deepcopy(inc_app)]}, add_to_knowledge_provenance=False)
            assert_stops(raw7, tag7)
        # 8) F03/value_applicability_supplied
        tag8 = "F03/value_applicability_supplied"
        tested_tags.append(tag8)
        with self.subTest(branch=tag8):
            raw8 = make_f03_base()
            v_ref = _ref_from(raw8["binding"]["template_ref"], "SYNTHETIC-F03-VAL-WITH-APP", owner="synthetic-knowledge-owner")
            v_app_ref = _ref_from(raw8["binding"]["template_ref"], "SYNTHETIC-F03-VAL-APP-REC", owner="synthetic-core-owner")
            core_ref8 = _ref_from(raw8["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE-8", owner="synthetic-core-owner")
            raw8["section_fields"][0]["value_fact_refs"] = [copy.deepcopy(v_ref)]
            raw8["sources"][-1]["content"]["section_field_records"][0]["record"]["value_fact_refs"] = [copy.deepcopy(v_ref)]
            val_rec8 = {"ref": copy.deepcopy(v_ref), "subject_ref": copy.deepcopy(raw8["section_fields"][0]["ref"]), "binding": copy.deepcopy(raw8["binding"]), "value": "some-val", "source_ref": copy.deepcopy(raw8["sources"][-1]["ref"]), "reason": "supplied value", "origin": "product_input", "applicability_ref": copy.deepcopy(v_app_ref)}
            raw8["values"] = [copy.deepcopy(val_rec8)]
            raw8["sources"][-1]["content"]["value_facts"] = [copy.deepcopy(val_rec8)]
            _resync_last_semantic_source(raw8)
            val_app_rec8 = {"ref": copy.deepcopy(v_app_ref), "subject_ref": copy.deepcopy(raw8["section_fields"][0]["ref"]), "binding": copy.deepcopy(raw8["binding"]), "owner": "synthetic-core-owner", "decision": "applicable", "reason": "value applicability", "reentry_condition": {"when": "always"}, "source_ref": copy.deepcopy(core_ref8)}
            raw8["applicability_records"] = [copy.deepcopy(val_app_rec8)]
            _add_qualified_semantic_source(raw8, identity="SYNTHETIC-F03-CORE-SOURCE-8", owner="synthetic-core-owner", content={"binding": copy.deepcopy(raw8["binding"]), "field_applicability_records": [copy.deepcopy(val_app_rec8)]}, add_to_knowledge_provenance=False)
            assert_stops(raw8, tag8)
        # 9) F03/empty_value_fact_refs_non_empty_owner
        tag9 = "F03/empty_value_fact_refs_non_empty_owner"
        tested_tags.append(tag9)
        with self.subTest(branch=tag9):
            raw9 = make_f03_base()
            slot7 = next(s for s in raw9["descriptors"] if s["descriptor_kind"] == "required field")
            fact_ref = copy.deepcopy(slot7["facts"][0]["ref"])
            raw9["section_fields"][0]["meaning_fact_refs"] = [copy.deepcopy(fact_ref)]
            raw9["sources"][-1]["content"]["section_field_records"][0]["record"]["meaning_fact_refs"] = [copy.deepcopy(fact_ref)]
            raw9["sources"][-1]["content"]["definition_meaning_operations"] = [_positive_field_meaning_operation(raw9, self.l4_doc)]
            _resync_last_semantic_source(raw9)
            assert_stops(raw9, tag9)
        self.assertEqual(sorted(tested_tags), sorted(expected_l7_tags))

if __name__ == "__main__":
    unittest.main()
