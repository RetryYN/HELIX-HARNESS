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
    return {**copy.deepcopy(base_ref), "identity": identity, "owner": base_ref["owner"] if owner == "_KEEP_" else owner, "source_locator": None, "sha256": sha256}
def _refs_in_order(refs: list[dict | None]) -> list[dict]: return [copy.deepcopy(ref) for ref in refs if isinstance(ref, dict)]
def _pres(val: object = None, *, present: bool = True) -> dict: return {"presence": "supplied", "value": copy.deepcopy(val)} if present else {"presence": "absent"}
def _ev(branch: str, axis: str, state: str, owner: str | None, refs: list[dict | None], *, cause: str | None = None) -> dict: return {"branch": branch, "axis": axis, "state": state, "backflow_owner": owner, "original_refs": refs, "cause": cause}
def _fnd(code: str, rule_ref: str, subject_ref: dict, axis: str, state: str, refs: list[dict | None], owner: str) -> dict: return {"code": code, "rule_ref": rule_ref, "subject_ref": subject_ref, "axis": axis, "state": state, "source_refs": refs, "backflow_owner": owner}

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
    return { "operation_ref": op_ref, "arguments": {"binding": copy.deepcopy(raw["binding"]), "slot_identity": slot["slot_identity"], "descriptor_kind": "required field", "fact_ref": copy.deepcopy(fact["ref"]), "fact_body": copy.deepcopy(fact["meaning"]), "normative_argument": _required_field_normative_frame(l4_doc)}, "decision": {"relation": "defines_descriptor", "reason": {"presence": "supplied", "value": msg}, "raw_semantic_basis": {"presence": "supplied", "value": {"original_owner_observation": msg, "comparison_subject": "同じ原fact bodyと独立固定規範の当該descriptor意味", "scope": "synthetic-only"}}, "basis_refs": []}, }

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
        cls.l5_rules_by_id = {r["id"]: r for r in cls.l5_doc["failure_rules"] if isinstance(r, dict) and "id" in r}

    def _expected_members(self, type_name: str) -> list[str]:
        spec = self.closed_types[type_name]
        return list(spec.get("required_fields") or spec["required"])

    def _assert_exact_members(self, obj: dict, type_name: str) -> None:
        self.assertIsInstance(obj, dict, f"{type_name} must be a dict")
        self.assertEqual(set(obj.keys()), set(self._expected_members(type_name)), f"{type_name} keys mismatch")

    def _assert_presence_shape(self, obj: dict) -> None:
        self.assertIsInstance(obj, dict)
        self.assertIn(obj.get("presence"), ("absent", "supplied"))
        self.assertEqual(set(obj.keys()), {"presence"} if obj["presence"] == "absent" else {"presence", "value"})

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
        self.assertEqual(set(evaluation["comparison"].keys()), set(self.l5_types["Comparison"]["fields"].keys()))
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

    def _expected_reason_material_from_l4(self, raw: dict, row_index: int, exp_ev: dict) -> dict:
        """R2-M4: L4 reason_writer.branch_source_table から 12 member の期待を test 側で独立に組み立てる。"""
        branch = exp_ev["branch"]
        field_loc = f"/section_fields/{row_index}"
        field = raw["section_fields"][row_index]
        k_ref = copy.deepcopy(raw["binding"]["knowledge_ref"])
        abs_p = _pres(present=False)
        if branch in ("definition_empty", "definition_known", "definition_unknown", "definition_conflict"):
            root_locs = [f"/section_fields/{i}" for i, f in enumerate(raw["section_fields"]) if f.get("ref") == field["ref"]]
            src_locs = [
                f"/sources/{si}/content/section_field_records/{ri}"
                for si, s in enumerate(raw["sources"])
                if isinstance(s, dict) and s.get("role") == "semantic_json" and isinstance(s.get("content"), dict) and s["content"].get("binding") == raw["binding"]
                for ri, e in enumerate(s["content"].get("section_field_records", []))
                if isinstance(e, dict) and isinstance(e.get("record"), dict) and e["record"].get("ref") == field["ref"]
            ]
            default_causes = {"definition_empty": "meaning_refs_empty", "definition_known": "meaning_positive", "definition_unknown": "field_owner_unresolved"}
            cause = exp_ev.get("cause") or default_causes[branch]
            orig_reason = _pres("これは節内の欄の意味と要否条件を定め、節のN/Aから全欄N/Aを一律生成していない。") if branch == "definition_known" else abs_p
            return { "branch": branch, "field_locator": field_loc, "request_locator": f"{field_loc}/meaning_fact_refs", "root_locators": root_locs, "source_locators": src_locs, "original_presence": _pres(field.get("meaning_fact_refs"), present="meaning_fact_refs" in field), "original_reason": orig_reason, "original_owner": abs_p, "original_decision": abs_p, "original_reentry": abs_p, "knowledge_ref": k_ref, "definition_cause": _pres(cause), }
        if branch in ("value_supplied", "value_unknown"):
            v_ref = field["value_fact_refs"][0]
            v_rec = next(v for v in raw["values"] if v.get("ref") == v_ref)
            v_src_owner = v_rec.get("source_ref", {}).get("owner") if isinstance(v_rec.get("source_ref"), dict) else None
            root_locs = [f"/values/{i}" for i, v in enumerate(raw["values"]) if v.get("ref") == v_ref]
            src_locs = [
                f"/sources/{si}/content/value_facts/{ri}"
                for si, s in enumerate(raw["sources"])
                if v_src_owner is not None and isinstance(s, dict) and s.get("role") == "semantic_json" and isinstance(s.get("content"), dict) and s["content"].get("binding") == raw["binding"] and s.get("ref", {}).get("owner") == v_src_owner
                for ri, v in enumerate(s["content"].get("value_facts", []))
                if isinstance(v, dict) and v.get("ref") == v_ref
            ]
            return { "branch": branch, "field_locator": field_loc, "request_locator": f"{field_loc}/value_fact_refs/0", "root_locators": root_locs, "source_locators": src_locs, "original_presence": _pres(v_rec.get("value"), present="value" in v_rec), "original_reason": _pres(v_rec.get("reason"), present="reason" in v_rec), "original_owner": abs_p, "original_decision": abs_p, "original_reentry": abs_p, "knowledge_ref": k_ref, "definition_cause": abs_p, }
        app_ref = field.get("applicability_ref")
        req_loc = f"{field_loc}/applicability_ref"
        if app_ref is None:
            p_ref = field.get("parent_section_ref")
            p_roots = [f"/applicability_records/{i}" for i, a in enumerate(raw["applicability_records"]) if p_ref is not None and a.get("subject_ref") == p_ref]
            p_srcs = [
                f"/sources/{si}/content/field_applicability_records/{ri}"
                for si, s in enumerate(raw["sources"])
                if isinstance(s, dict) and s.get("role") == "semantic_json" and isinstance(s.get("content"), dict) and s["content"].get("binding") == raw["binding"]
                for ri, a in enumerate(s["content"].get("field_applicability_records", []))
                if isinstance(a, dict) and p_ref is not None and a.get("subject_ref") == p_ref
            ]
            if p_roots and p_srcs:
                p_rec = next(a for a in raw["applicability_records"] if a.get("subject_ref") == p_ref)
                return { "branch": branch, "field_locator": field_loc, "request_locator": req_loc, "root_locators": p_roots, "source_locators": p_srcs, "original_presence": _pres(None), "original_reason": _pres(p_rec["reason"]), "original_owner": _pres(p_rec["owner"]), "original_decision": _pres(p_rec["decision"]), "original_reentry": _pres(p_rec["reentry_condition"]), "knowledge_ref": k_ref, "definition_cause": abs_p, }
            return { "branch": branch, "field_locator": field_loc, "request_locator": req_loc, "root_locators": [], "source_locators": [], "original_presence": _pres(None), "original_reason": abs_p, "original_owner": abs_p, "original_decision": abs_p, "original_reentry": abs_p, "knowledge_ref": k_ref, "definition_cause": abs_p, }
        a_roots = [f"/applicability_records/{i}" for i, a in enumerate(raw["applicability_records"]) if a.get("ref") == app_ref]
        a_srcs = [
            f"/sources/{si}/content/field_applicability_records/{ri}"
            for si, s in enumerate(raw["sources"])
            if isinstance(s, dict) and s.get("role") == "semantic_json" and isinstance(s.get("content"), dict) and s["content"].get("binding") == raw["binding"]
            for ri, a in enumerate(s["content"].get("field_applicability_records", []))
            if isinstance(a, dict) and a.get("ref") == app_ref
        ]
        if a_roots and a_srcs:
            a_rec = next(a for a in raw["applicability_records"] if a.get("ref") == app_ref)
            return { "branch": branch, "field_locator": field_loc, "request_locator": req_loc, "root_locators": a_roots, "source_locators": a_srcs, "original_presence": _pres(a_rec["decision"]), "original_reason": _pres(a_rec["reason"]), "original_owner": _pres(a_rec["owner"]), "original_decision": _pres(a_rec["decision"]), "original_reentry": _pres(a_rec["reentry_condition"]), "knowledge_ref": k_ref, "definition_cause": abs_p, }
        return { "branch": branch, "field_locator": field_loc, "request_locator": req_loc, "root_locators": a_roots, "source_locators": a_srcs, "original_presence": _pres(app_ref), "original_reason": abs_p, "original_owner": abs_p, "original_decision": abs_p, "original_reentry": abs_p, "knowledge_ref": k_ref, "definition_cause": abs_p, }

    def _assert_row_and_public_oracle(
        self, raw: dict, definitions: dict, detail: dict, public: dict,
        *, row_index: int = 0, expected_events: list[dict], expected_findings: list[dict] | None = None,
    ) -> None:
        self.assertEqual(detail["comparison"], public)
        self.assertEqual(public["producer_symbol"], "compare_values_and_applicability")
        self.assertEqual(public["input_binding"], raw["binding"])
        self.assertEqual(detail["comparison"]["input_binding"], raw["binding"])
        expected_carried = [a for a in definitions["axes"] if a["axis"] in {"required section.definition", "required field.definition"}]
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
            expected_mat = self._expected_reason_material_from_l4(raw, row_index, exp_ev)
            self.assertEqual(event["reason_material"], expected_mat)
            expected_reason = self.reason_prefix_table[event["branch"]] + "\n" + canonical_json_bytes(expected_mat).decode("utf-8")
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
        self, raw: dict, fields: list[dict], *, value_facts: list[dict] | None = None,
        app_records: list[dict] | None = None, core_owner: str | None = "synthetic-core-owner",
        core_id: str = "SYNTHETIC-F03-CORE-SOURCE", map_id: str = "SYNTHETIC-F03-MAPPING-SOURCE",
        extra_ops: list[dict] | None = None,
    ) -> tuple[dict, dict]:
        slot7 = next(s for s in raw["descriptors"] if s["descriptor_kind"] == "required field")
        core_content: dict = {"binding": copy.deepcopy(raw["binding"])}
        if value_facts is not None:
            core_content["value_facts"] = copy.deepcopy(value_facts)
        if app_records is not None:
            core_content["field_applicability_records"] = copy.deepcopy(app_records)
        if value_facts is not None or app_records is not None:
            _add_qualified_semantic_source(raw, identity=core_id, owner=core_owner, content=core_content, add_to_knowledge_provenance=False)
        op = _positive_field_meaning_operation(raw, self.l4_doc)
        ops = [op] + (copy.deepcopy(extra_ops) if extra_ops else [])
        map_src_ref = _add_qualified_semantic_source( raw, identity=map_id, owner="synthetic-knowledge-owner", content={ "binding": copy.deepcopy(raw["binding"]), "descriptor_targets": [{"target_ref": copy.deepcopy(fields[0]["descriptor_slot_ref"]), "slot_identity": slot7["slot_identity"], "descriptor_kind": "required field"}], "section_field_records": [{"record": copy.deepcopy(f)} for f in fields], "definition_meaning_operations": ops, }, add_to_knowledge_provenance=True, )
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
        return [field["ref"], field["descriptor_slot_ref"], raw["binding"]["knowledge_ref"], mapping_source_ref, fact0["ref"], fact0["source_ref"], mapping_source_ref, op["operation_ref"]]

    def test_f03_owner_empty_missing_and_neg02_definition_as_value_gap(self) -> None:
        raw = base_input(self.document)
        field = raw["section_fields"][0]
        for k in ("meaning_fact_refs", "requiredness_fact_refs", "normative_rule_refs", "oracle_refs", "value_fact_refs"):
            field[k] = []
        field["parent_section_ref"] = None
        field["applicability_ref"] = None
        raw["values"] = []
        raw["applicability_records"] = []
        mapping_source_ref = _add_qualified_semantic_source( raw, identity="SYNTHETIC-F03-MAPPING-SOURCE", owner="synthetic-knowledge-owner", content={ "binding": copy.deepcopy(raw["binding"]), "descriptor_targets": [{"target_ref": copy.deepcopy(field["descriptor_slot_ref"]), "slot_identity": "synthetic-descriptor-7", "descriptor_kind": "required field"}], "section_field_records": [{"record": copy.deepcopy(field)}], }, add_to_knowledge_provenance=True, )
        expected_refs = [field["ref"], field["descriptor_slot_ref"], raw["binding"]["knowledge_ref"], mapping_source_ref]
        expected_ev = [_ev("definition_empty", "field.definition", "missing", "synthetic-knowledge-owner", expected_refs)]
        with self.subTest(case="F03-L9-OWNER-EMPTY-MISSING"):
            _, definitions, detail, public = self._run_fn0_fn1_fn2(raw)
            self._assert_row_and_public_oracle(raw, definitions, detail, public, expected_events=expected_ev, expected_findings=[])
            row0 = detail["rows"][0]
            self.assertEqual(row0["definition_read"]["owner_read"]["state"], "resolved")
            self.assertEqual(row0["definition_read"]["target_read"]["state"], "resolved")
            self.assertEqual(row0["definition_read"]["judgments"][0]["cause"], "meaning_refs_empty")
            # R2-m2: resolved target_read problems (including source_unattributed) are preserved in definition_read.problems
            self.assertGreaterEqual(len(row0["definition_read"]["target_read"]["problems"]), 1)
            self.assertTrue(any(p["relevance"] == "source_unattributed" for p in row0["definition_read"]["target_read"]["problems"]))
            self.assertEqual( row0["definition_read"]["problems"], row0["definition_read"]["owner_read"]["problems"] + row0["definition_read"]["target_read"]["problems"], )
        with self.subTest(case="HELIXBRAIN-L8-032-F03-NEG-02"):
            raw_neg02 = copy.deepcopy(raw)
            basis_ref = _ref_from(raw["binding"]["template_ref"], "SYNTHETIC-F03-NEG02-BASIS", owner="synthetic-knowledge-owner")
            raw_neg02["claims"] = [_claim(field["ref"], raw["binding"], "value_only_gap", "unknown", [basis_ref])]
            _, definitions_neg02, detail_neg02, public_neg02 = self._run_fn0_fn1_fn2(raw_neg02)
            self._assert_row_and_public_oracle( raw_neg02, definitions_neg02, detail_neg02, public_neg02, expected_events=expected_ev, expected_findings=[_fnd("definition_as_value_gap", "HELIXBRAIN-L5-032-R-definition_as_value_gap", field["ref"], "field.definition", "missing", [*expected_refs, field["ref"], basis_ref], "knowledge_owner")], )
            self.assertEqual(detail_neg02["rows"][0]["finding_indices"], [0])
        with self.subTest(case="R3-m6_rule55_neg_proposed_not_value_only_on_definition_empty"):
            raw_r55_neg = copy.deepcopy(raw)
            raw_r55_neg["claims"] = [_claim(field["ref"], raw["binding"], "value_only_gap", "not_value_only")]
            _, defs_r55_neg, detail_r55_neg, pub_r55_neg = self._run_fn0_fn1_fn2(raw_r55_neg)
            self._assert_row_and_public_oracle(raw_r55_neg, defs_r55_neg, detail_r55_neg, pub_r55_neg, expected_events=expected_ev, expected_findings=[])
            self.assertEqual(detail_r55_neg["rows"][0]["finding_indices"], [])
        with self.subTest(case="m3_other_source_owner_problems_preserved_when_resolved"):
            raw_multi = copy.deepcopy(raw)
            other_field = copy.deepcopy(field)
            other_field["ref"] = _ref_from(field["ref"], "SYNTHETIC-FIELD-UNRELATED", owner="synthetic-knowledge-owner")
            _add_qualified_semantic_source( raw_multi, identity="SYNTHETIC-F03-UNRELATED-FIELD-SOURCE", owner="synthetic-knowledge-owner", content={"binding": copy.deepcopy(raw_multi["binding"]), "section_field_records": [{"record": other_field}]}, add_to_knowledge_provenance=True, )
            _, _, detail_multi, _ = self._run_fn0_fn1_fn2(raw_multi)
            owner_read = detail_multi["rows"][0]["definition_read"]["owner_read"]
            self.assertEqual(owner_read["state"], "resolved")
            self.assertEqual(len(owner_read["supports"]), 1)
            self.assertEqual([p["cause"] for p in owner_read["problems"]], ["field_owner_not_found", "lookup_unresolved"])
        # R2-m1: owner resolved with meaning_fact_refs = None, "x", [None], [{}] -> definition_unknown (meaning_refs_null / meaning_refs_type)
        for bad_refs, expected_cause in ((None, "meaning_refs_null"), ("x", "meaning_refs_type"), ([None], "meaning_refs_type"), ([{}], "meaning_refs_type")):
            with self.subTest(case="R2-m1_owner_resolved_invalid_meaning_fact_refs", bad_refs=bad_refs):
                raw_m1 = copy.deepcopy(raw)
                val_m1 = validate_supply_input(raw_m1)
                defs_m1 = compare_descriptor_definitions({"validated": val_m1})
                val_m1["input"]["section_fields"][0]["meaning_fact_refs"] = copy.deepcopy(bad_refs)
                val_m1["input"]["sources"][-1]["content"]["section_field_records"][0]["record"]["meaning_fact_refs"] = copy.deepcopy(bad_refs)
                _resync_last_semantic_source(val_m1["input"])
                expected_refs_m1 = [field["ref"], field["descriptor_slot_ref"], raw["binding"]["knowledge_ref"], val_m1["input"]["sources"][-1]["ref"]]
                detail_m1 = _evaluate_field_values_detail({"snapshot": val_m1, "definitions": defs_m1})
                pub_m1 = compare_values_and_applicability({"validated": val_m1, "definitions": defs_m1})
                self._assert_row_and_public_oracle( val_m1["input"], defs_m1, detail_m1, pub_m1, expected_events=[_ev("definition_unknown", "field.definition", "unknown", "synthetic-knowledge-owner", expected_refs_m1, cause=expected_cause)], expected_findings=[], )
                self.assertEqual(detail_m1["rows"][0]["definition_read"]["judgments"][0]["cause"], expected_cause)

    def test_f03_owner_unobtained_unknown_and_add11_add12_unmaterialized_source_locality(self) -> None:
        with self.subTest(case="HELIXBRAIN-L8-032-NORMAL-compare_values_and_applicability"):
            raw = base_input(self.document)
            field = raw["section_fields"][0]
            val_rec = raw["values"][0]
            _, definitions, detail, public = self._run_fn0_fn1_fn2(raw)
            self._assert_row_and_public_oracle( raw, definitions, detail, public, expected_events=[ _ev("definition_unknown", "field.definition", "unknown", "synthetic-knowledge-owner", [field["ref"], field["descriptor_slot_ref"]]), _ev("applicability_unknown", "applicability.evaluation", "unknown", "synthetic-knowledge-owner", [field["applicability_ref"]]), _ev("value_unknown", "field.value", "unknown", "synthetic-knowledge-owner", [val_rec["ref"], val_rec["source_ref"]]), _ev("field_unknown", "field.applicability", "unknown", "synthetic-knowledge-owner", [field["applicability_ref"]]), ], expected_findings=[], )
            self.assertEqual(detail["rows"][0]["definition_read"]["owner_read"]["state"], "unknown")
            self.assertEqual(detail["rows"][0]["definition_read"]["judgments"][0]["cause"], "field_owner_unresolved")
        with self.subTest(case="HELIXBRAIN-L8-032-ADD-11"):
            raw_add11 = base_input(self.document)
            app_rec11 = raw_add11["applicability_records"][0]
            app_rec11.update({"owner": "synthetic-core-owner", "decision": "not_applicable", "reason": "CORE計画上のN/A理由（原source未形成）", "reentry_condition": {"when": "原source形成後に再評価"}})
            _, defs11, detail11, public11 = self._run_fn0_fn1_fn2(raw_add11)
            f11 = raw_add11["section_fields"][0]
            v11 = raw_add11["values"][0]
            self._assert_row_and_public_oracle( raw_add11, defs11, detail11, public11, expected_events=[ _ev("definition_unknown", "field.definition", "unknown", "synthetic-knowledge-owner", [f11["ref"], f11["descriptor_slot_ref"]]), _ev("applicability_unknown", "applicability.evaluation", "unknown", "synthetic-knowledge-owner", [f11["applicability_ref"]]), _ev("value_unknown", "field.value", "unknown", "synthetic-knowledge-owner", [v11["ref"], v11["source_ref"]]), _ev("field_unknown", "field.applicability", "unknown", "synthetic-knowledge-owner", [f11["applicability_ref"]]), ], expected_findings=[], )
            self.assertEqual(detail11["rows"][0]["applicability_read"]["root_occurrences"][0]["original_value"]["decision"], "not_applicable")
        with self.subTest(case="HELIXBRAIN-L8-032-ADD-12"):
            raw_add12 = base_input(self.document)
            raw_add12["values"][0].update({"value": None, "origin": "absent", "reason": "案件値null化（原source未形成）"})
            _, defs12, detail12, public12 = self._run_fn0_fn1_fn2(raw_add12)
            f12 = raw_add12["section_fields"][0]
            v12 = raw_add12["values"][0]
            self._assert_row_and_public_oracle( raw_add12, defs12, detail12, public12, expected_events=[ _ev("definition_unknown", "field.definition", "unknown", "synthetic-knowledge-owner", [f12["ref"], f12["descriptor_slot_ref"]]), _ev("applicability_unknown", "applicability.evaluation", "unknown", "synthetic-knowledge-owner", [f12["applicability_ref"]]), _ev("value_unknown", "field.value", "unknown", "synthetic-knowledge-owner", [v12["ref"], v12["source_ref"]]), _ev("field_unknown", "field.applicability", "unknown", "synthetic-knowledge-owner", [f12["applicability_ref"]]), ], expected_findings=[], )
        with self.subTest(case="F03-L9-OWNER-UNOBTAINED-UNKNOWN_and_R2-m1_owner_unresolved_meaning_fact_refs"):
            raw_f03 = base_input(self.document)
            field0 = raw_f03["section_fields"][0]
            for k in ("meaning_fact_refs", "requiredness_fact_refs", "normative_rule_refs", "oracle_refs", "value_fact_refs"):
                field0[k] = []
            field0["parent_section_ref"] = None
            field0["applicability_ref"] = None
            raw_f03["values"] = []
            raw_f03["applicability_records"] = []
            _, definitions_f03, detail_f03, public_f03 = self._run_fn0_fn1_fn2(raw_f03)
            self._assert_row_and_public_oracle( raw_f03, definitions_f03, detail_f03, public_f03, expected_events=[_ev("definition_unknown", "field.definition", "unknown", "synthetic-knowledge-owner", [field0["ref"], field0["descriptor_slot_ref"], raw_f03["binding"]["knowledge_ref"]])], expected_findings=[], )
            self.assertEqual(detail_f03["rows"][0]["definition_read"]["owner_read"]["problems"][0]["cause"], "field_owner_not_found")
            for bad_refs in (None, "x", [None], [{}]):
                with self.subTest(owner_unresolved_bad_refs=bad_refs):
                    validated_m7 = validate_supply_input(raw_f03)
                    definitions_m7 = compare_descriptor_definitions({"validated": validated_m7})
                    validated_m7["input"]["section_fields"][0]["meaning_fact_refs"] = copy.deepcopy(bad_refs)
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
        # R2-M1: L4 enum F03BValueFact.origin uses "project_owner" for supplied values
        val1 = {"ref": copy.deepcopy(val1_ref), "subject_ref": copy.deepcopy(field1["ref"]), "binding": copy.deepcopy(raw["binding"]), "value": "7 years", "source_ref": copy.deepcopy(core_src_placeholder), "reason": "7年保持供給済み", "origin": "project_owner", "applicability_ref": None}
        app1 = {"ref": copy.deepcopy(app1_ref), "subject_ref": copy.deepcopy(field1["ref"]), "binding": copy.deepcopy(raw["binding"]), "owner": "synthetic-core-owner", "decision": "applicable", "reason": "法務要件により適用", "reentry_condition": {"when": "法改正時"}, "source_ref": copy.deepcopy(core_src_placeholder)}
        raw["section_fields"].append(field1)
        raw["values"].append(val1)
        raw["applicability_records"].append(app1)
        # R2-m3: include an operation for another fact in definition_meaning_operations; it stays in occurrences without stopping
        other_op = _positive_field_meaning_operation(raw, self.l4_doc)
        other_op["operation_ref"] = _ref_from(raw["binding"]["template_ref"], "SYNTHETIC-F03-MEANING-OP-OTHER", owner="synthetic-knowledge-owner")
        other_op["arguments"]["fact_ref"] = _ref_from(fact_ref, "SYNTHETIC-FACT-OTHER-99", owner="synthetic-knowledge-owner")
        op, mapping_source_ref = self._add_f03_core_and_mapping_sources( raw, [field0, field1], value_facts=[val0, val1], app_records=[app0, app1], extra_ops=[other_op] )
        k_ref = raw["binding"]["knowledge_ref"]
        def_refs_0 = self._def_known_refs(raw, field0, mapping_source_ref, op)
        def_refs_1 = self._def_known_refs(raw, field1, mapping_source_ref, op)
        app0_refs = [app0["ref"], k_ref, core_src_placeholder]
        val0_refs = [val0["ref"], k_ref, core_src_placeholder]
        app1_refs = [app1["ref"], k_ref, core_src_placeholder]
        val1_refs = [val1["ref"], k_ref, core_src_placeholder]
        ev_row0 = [ _ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", def_refs_0), _ev("applicability_applicable", "applicability.evaluation", "applicable", "synthetic-core-owner", app0_refs), _ev("value_unknown", "field.value", "unknown", "synthetic-core-owner", val0_refs), _ev("field_applicable", "field.applicability", "applicable", "synthetic-core-owner", app0_refs), ]
        ev_row1 = [ _ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", def_refs_1), _ev("applicability_applicable", "applicability.evaluation", "applicable", "synthetic-core-owner", app1_refs), _ev("value_supplied", "field.value", "supplied", "synthetic-core-owner", val1_refs), _ev("field_applicable", "field.applicability", "applicable", "synthetic-core-owner", app1_refs), ]
        with self.subTest(case="two_field_locality_claims_empty_and_R2-m3_other_fact_op_ignored"):
            _, definitions, detail, public = self._run_fn0_fn1_fn2(raw)
            self._assert_row_and_public_oracle(raw, definitions, detail, public, row_index=0, expected_events=ev_row0, expected_findings=[])
            self._assert_row_and_public_oracle(raw, definitions, detail, public, row_index=1, expected_events=ev_row1, expected_findings=[])
            mread0 = detail["rows"][0]["definition_read"]["fact_reads"][0]["meaning_read"]["value"]
            self.assertEqual(len(mread0["occurrences"]), 2)
            self.assertEqual(len(mread0["supports"]), 1)
            self.assertTrue(any(p["cause"] == "fact_differs" for p in mread0["problems"]))
        with self.subTest(case="HELIXBRAIN-L8-032-F03-NEG-01"):
            raw_neg01 = copy.deepcopy(raw)
            raw_neg01["claims"] = [_claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable")]
            _, definitions_neg01, detail_neg01, public_neg01 = self._run_fn0_fn1_fn2(raw_neg01)
            self._assert_row_and_public_oracle( raw_neg01, definitions_neg01, detail_neg01, public_neg01, row_index=0, expected_events=ev_row0, expected_findings=[_fnd("unknown_as_na", "HELIXBRAIN-L5-032-R-unknown_as_na", field0["ref"], "field.value", "unknown", [*val0_refs, field0["ref"]], "core_owner")], )
            self.assertEqual(detail_neg01["rows"][0]["finding_indices"], [0])
            self.assertEqual(detail_neg01["rows"][1]["finding_indices"], [])
        with self.subTest(case="F03-L9-DEFINED-VALUE-UNKNOWN_and_M5_R2-i1_no_hardcoded_core_owner"):
            # R2-i1: L4 /field_value_applicability_contract/projection_order/public「public original_refs/ownerは実読取原値だけ」に従い、
            # resolved ValueFact の source_ref.owner が None の場合は fallback せず backflow_owner=None とする。
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
                op_m5, map_src_ref = self._add_f03_core_and_mapping_sources( raw_m5, [f0], value_facts=[v0], core_owner=eff_owner, core_id="SYNTHETIC-F03-CORE-SOURCE-M5", map_id="SYNTHETIC-F03-MAPPING-SOURCE-M5", )
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
                self._assert_row_and_public_oracle( raw_m5, defs_m5, detail_m5, pub_m5, row_index=0, expected_events=[ _ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", self._def_known_refs(raw_m5, f0, map_src_ref, op_m5)), _ev("applicability_null", "applicability.evaluation", "unknown", custom_owner, [raw_m5["binding"]["knowledge_ref"]]), _ev("value_unknown", "field.value", "unknown", custom_owner if custom_owner is not None else "synthetic-knowledge-owner", [v0["ref"], raw_m5["binding"]["knowledge_ref"], v_src_placeholder] if custom_owner is not None else [v0["ref"], v_src_placeholder]), _ev("field_unknown", "field.applicability", "unknown", custom_owner, [raw_m5["binding"]["knowledge_ref"]]), ], expected_findings=[], )
            with self.subTest(case="R3-m5_resolved_app_read_with_null_owner_is_none"):
                raw_r5 = base_input(self.document)
                _, f0_r5 = self._prep_f03_field0(raw_r5, with_meaning=True, clear_values=True)
                core_ref_r5 = _ref_from(raw_r5["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE-R5", owner="synthetic-core-owner")
                app0_r5 = raw_r5["applicability_records"][0]
                app0_r5.update({"owner": None, "decision": "unknown", "reason": "未決", "reentry_condition": {"when": "変更時"}, "source_ref": copy.deepcopy(core_ref_r5)})
                op_r5, map_ref_r5 = self._add_f03_core_and_mapping_sources(raw_r5, [f0_r5], app_records=[app0_r5], core_owner="synthetic-core-owner", core_id="SYNTHETIC-F03-CORE-SOURCE-R5", map_id="SYNTHETIC-F03-MAPPING-SOURCE-R5")
                _, defs_r5, detail_r5, pub_r5 = self._run_fn0_fn1_fn2(raw_r5)
                app_refs_r5 = [app0_r5["ref"], raw_r5["binding"]["knowledge_ref"], core_ref_r5]
                self._assert_row_and_public_oracle(raw_r5, defs_r5, detail_r5, pub_r5, row_index=0, expected_events=[_ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", self._def_known_refs(raw_r5, f0_r5, map_ref_r5, op_r5)), _ev("applicability_unknown", "applicability.evaluation", "unknown", None, app_refs_r5), _ev("field_unknown", "field.applicability", "unknown", None, app_refs_r5)], expected_findings=[])

    def test_f03_explicit_applicability_unknown_and_neg03_applicability_unknown_as_na(self) -> None:
        raw = base_input(self.document)
        slot7, field0 = self._prep_f03_field0(raw, with_meaning=True, clear_values=True)
        core_src_placeholder = _ref_from(raw["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE", owner="synthetic-core-owner")
        app0 = raw["applicability_records"][0]
        app0.update({"owner": "synthetic-core-owner", "decision": "unknown", "reason": "適用条件未決", "reentry_condition": {"when": "独立evidence取得後"}, "source_ref": copy.deepcopy(core_src_placeholder)})
        op, mapping_source_ref = self._add_f03_core_and_mapping_sources(raw, [field0], app_records=[app0])
        app_refs = [app0["ref"], raw["binding"]["knowledge_ref"], core_src_placeholder]
        expected_ev = [ _ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", self._def_known_refs(raw, field0, mapping_source_ref, op)), _ev("applicability_unknown", "applicability.evaluation", "unknown", "synthetic-core-owner", app_refs), _ev("field_unknown", "field.applicability", "unknown", "synthetic-core-owner", app_refs), ]
        with self.subTest(case="F03-L9-EXPLICIT-APPLICABILITY-UNKNOWN"):
            _, definitions, detail, public = self._run_fn0_fn1_fn2(raw)
            self._assert_row_and_public_oracle(raw, definitions, detail, public, expected_events=expected_ev, expected_findings=[])
        with self.subTest(case="HELIXBRAIN-L8-032-F03-NEG-03"):
            raw_neg03 = copy.deepcopy(raw)
            raw_neg03["claims"] = [_claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable")]
            _, definitions_neg03, detail_neg03, public_neg03 = self._run_fn0_fn1_fn2(raw_neg03)
            self._assert_row_and_public_oracle( raw_neg03, definitions_neg03, detail_neg03, public_neg03, expected_events=expected_ev, expected_findings=[_fnd("applicability_unknown_as_na", "HELIXBRAIN-L5-032-R-applicability_unknown_as_na", field0["ref"], "applicability.evaluation", "unknown", [*app_refs, field0["ref"]], "core_owner")], )
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
        parent_app.update({ "ref": _ref_from(parent_app["ref"], "SYNTHETIC-F03-PARENT-APPLICABILITY", owner="synthetic-core-owner"), "subject_ref": copy.deepcopy(section_ref), "owner": "synthetic-core-owner", "decision": "not_applicable", "reason": "親sectionに限り対象外である。", "reentry_condition": {"when": "親section条件変更時"}, "source_ref": copy.deepcopy(core_src_placeholder), })
        op, mapping_source_ref = self._add_f03_core_and_mapping_sources(raw, [field0], app_records=[parent_app])
        parent_refs = [parent_app["ref"], raw["binding"]["knowledge_ref"], core_src_placeholder]
        expected_ev = [ _ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", self._def_known_refs(raw, field0, mapping_source_ref, op)), _ev("applicability_null", "applicability.evaluation", "unknown", "synthetic-core-owner", [raw["binding"]["knowledge_ref"]]), _ev("parent_na_no_transfer", "field.applicability", "unknown", "synthetic-core-owner", parent_refs), ]
        with self.subTest(case="F03-L9-PARENT-NA-NO-PROPAGATION"):
            _, definitions, detail, public = self._run_fn0_fn1_fn2(raw)
            self._assert_row_and_public_oracle(raw, definitions, detail, public, expected_events=expected_ev, expected_findings=[])
            self.assertEqual(detail["rows"][0]["parent_reads"][0]["state"], "resolved")
        with self.subTest(case="HELIXBRAIN-L8-032-F03-NEG-04"):
            raw_neg04 = copy.deepcopy(raw)
            raw_neg04["claims"] = [_claim(field0["ref"], raw["binding"], "all_section_fields_not_applicable", "not_applicable")]
            _, definitions_neg04, detail_neg04, public_neg04 = self._run_fn0_fn1_fn2(raw_neg04)
            self._assert_row_and_public_oracle( raw_neg04, definitions_neg04, detail_neg04, public_neg04, expected_events=expected_ev, expected_findings=[_fnd("section_na_all_fields", "HELIXBRAIN-L5-032-R-section_na_all_fields", field0["ref"], "field.applicability", "unknown", [*parent_refs, field0["ref"]], "core_owner")], )
            self.assertEqual(detail_neg04["rows"][0]["finding_indices"], [0])
        with self.subTest(case="R3-m6_rule57_neg_proposed_applicable_on_parent_na_no_transfer"):
            raw_r57_neg = copy.deepcopy(raw)
            raw_r57_neg["claims"] = [_claim(field0["ref"], raw["binding"], "all_section_fields_not_applicable", "applicable")]
            _, defs_r57_neg, detail_r57_neg, pub_r57_neg = self._run_fn0_fn1_fn2(raw_r57_neg)
            self._assert_row_and_public_oracle(raw_r57_neg, defs_r57_neg, detail_r57_neg, pub_r57_neg, expected_events=expected_ev, expected_findings=[])
            self.assertEqual(detail_r57_neg["rows"][0]["finding_indices"], [])

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
            self._assert_row_and_public_oracle( raw_na, definitions_na, detail_na, public_na, expected_events=[ _ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", self._def_known_refs(raw_na, field0, mapping_source_ref, op)), _ev("applicability_na", "applicability.evaluation", "not_applicable", "synthetic-core-owner", app_refs), _ev("field_na", "field.applicability", "not_applicable", "synthetic-core-owner", app_refs), ], expected_findings=[], )
            self.assertEqual(detail_na["rows"][0]["value_reads"], [])
        for supplied_val in (False, 0, ""):
            with self.subTest(case="F03-L9-SUPPLIED-FALSE-APPLICABLE", supplied_val=supplied_val):
                raw_sup = base_input(self.document)
                slot7, field0 = self._prep_f03_field0(raw_sup, with_meaning=True, clear_values=False)
                core_src_placeholder = _ref_from(raw_sup["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE", owner="synthetic-core-owner")
                val0 = raw_sup["values"][0]
                # R2-M1: origin="project_owner"
                val0.update({"value": supplied_val, "origin": "project_owner", "reason": "明示供給値", "source_ref": copy.deepcopy(core_src_placeholder), "applicability_ref": None})
                app0 = raw_sup["applicability_records"][0]
                app0.update({"owner": "synthetic-core-owner", "decision": "applicable", "reason": "適用", "reentry_condition": {"when": "条件変更時"}, "source_ref": copy.deepcopy(core_src_placeholder)})
                op, mapping_source_ref = self._add_f03_core_and_mapping_sources(raw_sup, [field0], value_facts=[val0], app_records=[app0])
                _, definitions_sup, detail_sup, public_sup = self._run_fn0_fn1_fn2(raw_sup)
                app_refs = [app0["ref"], raw_sup["binding"]["knowledge_ref"], core_src_placeholder]
                val_refs = [val0["ref"], raw_sup["binding"]["knowledge_ref"], core_src_placeholder]
                self._assert_row_and_public_oracle( raw_sup, definitions_sup, detail_sup, public_sup, expected_events=[ _ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", self._def_known_refs(raw_sup, field0, mapping_source_ref, op)), _ev("applicability_applicable", "applicability.evaluation", "applicable", "synthetic-core-owner", app_refs), _ev("value_supplied", "field.value", "supplied", "synthetic-core-owner", val_refs), _ev("field_applicable", "field.applicability", "applicable", "synthetic-core-owner", app_refs), ], expected_findings=[], )
                self.assertEqual(detail_sup["rows"][0]["events"][2]["reason_material"]["original_presence"], {"presence": "supplied", "value": supplied_val})
        for unk_origin in ("absent", "reference_fixture"):
            with self.subTest(case="R3-m3_non_null_value_with_non_operational_origin_is_value_unknown", origin=unk_origin):
                raw_m3 = base_input(self.document)
                _, f0_m3 = self._prep_f03_field0(raw_m3, with_meaning=True, clear_values=False)
                core_ref_m3 = _ref_from(raw_m3["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE", owner="synthetic-core-owner")
                val_m3 = raw_m3["values"][0]
                val_m3.update({"value": "7 years", "origin": unk_origin, "reason": "参照fixture又は未供給origin", "source_ref": copy.deepcopy(core_ref_m3), "applicability_ref": None})
                app_m3 = raw_m3["applicability_records"][0]
                app_m3.update({"owner": "synthetic-core-owner", "decision": "applicable", "reason": "適用", "reentry_condition": {"when": "条件変更時"}, "source_ref": copy.deepcopy(core_ref_m3)})
                op_m3, map_ref_m3 = self._add_f03_core_and_mapping_sources(raw_m3, [f0_m3], value_facts=[val_m3], app_records=[app_m3])
                _, defs_m3, detail_m3, pub_m3 = self._run_fn0_fn1_fn2(raw_m3)
                app_refs_m3 = [app_m3["ref"], raw_m3["binding"]["knowledge_ref"], core_ref_m3]
                val_refs_m3 = [val_m3["ref"], raw_m3["binding"]["knowledge_ref"], core_ref_m3]
                self._assert_row_and_public_oracle(raw_m3, defs_m3, detail_m3, pub_m3, expected_events=[_ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", self._def_known_refs(raw_m3, f0_m3, map_ref_m3, op_m3)), _ev("applicability_applicable", "applicability.evaluation", "applicable", "synthetic-core-owner", app_refs_m3), _ev("value_unknown", "field.value", "unknown", "synthetic-core-owner", val_refs_m3), _ev("field_applicable", "field.applicability", "applicable", "synthetic-core-owner", app_refs_m3)], expected_findings=[])
                self.assertEqual(detail_m3["rows"][0]["events"][2]["reason_material"]["original_presence"], {"presence": "supplied", "value": "7 years"})
        # R3-m4: target_unknown, selected_fact_unresolved, attribution_unknown, meaning_read_unresolved -> definition_unknown
        for m4_cause, mut_m4 in (
            ("target_unknown", lambda r: r["sources"][-1]["content"].__setitem__("descriptor_targets", [])),
            ("selected_fact_unresolved", lambda r: next(s for s in r["descriptors"] if s["descriptor_kind"] == "required field").__setitem__("facts", [])),
            ("attribution_unknown", lambda r: next(g for g in r["sources"][0]["content"]["descriptor_facts"] if g["slot_identity"] == "synthetic-descriptor-7").__setitem__("facts", [])),
            ("meaning_read_unresolved", lambda r: r["sources"][-1]["content"].__setitem__("definition_meaning_operations", [])),
        ):
            with self.subTest(case="R3-m4_definition_unknown_causes", cause=m4_cause):
                raw_m4 = base_input(self.document)
                slot7_m4, f0_m4 = self._prep_f03_field0(raw_m4, with_meaning=True, clear_values=True)
                f0_m4["applicability_ref"] = None
                raw_m4["applicability_records"] = []
                fact0_m4 = copy.deepcopy(slot7_m4["facts"][0])
                _, map_ref_m4 = self._add_f03_core_and_mapping_sources(raw_m4, [f0_m4])
                val_m4 = validate_supply_input(raw_m4)
                defs_m4 = compare_descriptor_definitions({"validated": val_m4})
                mut_m4(val_m4["input"])
                if m4_cause in ("target_unknown", "meaning_read_unresolved"):
                    _resync_last_semantic_source(val_m4["input"])
                map_ref_m4_after = copy.deepcopy(val_m4["input"]["sources"][-1]["ref"])
                exp_refs_m4 = [f0_m4["ref"], f0_m4["descriptor_slot_ref"], raw_m4["binding"]["knowledge_ref"], map_ref_m4_after, fact0_m4["ref"]] if m4_cause in ("target_unknown", "selected_fact_unresolved") else [f0_m4["ref"], f0_m4["descriptor_slot_ref"], raw_m4["binding"]["knowledge_ref"], map_ref_m4_after, fact0_m4["ref"], fact0_m4["source_ref"]]
                detail_m4 = _evaluate_field_values_detail({"snapshot": val_m4, "definitions": defs_m4})
                pub_m4 = compare_values_and_applicability({"validated": val_m4, "definitions": defs_m4})
                self._assert_row_and_public_oracle(val_m4["input"], defs_m4, detail_m4, pub_m4, expected_events=[_ev("definition_unknown", "field.definition", "unknown", "synthetic-knowledge-owner", exp_refs_m4, cause=m4_cause)], expected_findings=[])
                self.assertEqual(detail_m4["rows"][0]["definition_read"]["judgments"][0]["cause"], m4_cause)

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
        expected_events = [ _ev("definition_known", "field.definition", "known", "synthetic-knowledge-owner", self._def_known_refs(raw, field0, mapping_source_ref, op)), _ev("applicability_unknown", "applicability.evaluation", "unknown", "synthetic-core-owner", app_refs), _ev("value_unknown", "field.value", "unknown", "synthetic-core-owner", val_refs), _ev("field_unknown", "field.applicability", "unknown", "synthetic-core-owner", app_refs), ]
        # R2-m6: L8 /additional_unit_cases/35 exact configuration (A, B = field_not_applicable/not_applicable, C = value_only_gap/unknown)
        with self.subTest(case="HELIXBRAIN-L8-032-VF3-F03-CLAIMS_duplicate_claims_not_deduplicated"):
            raw_vf3 = copy.deepcopy(raw)
            raw_vf3["claims"] = [ _claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable"), _claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable"), _claim(field0["ref"], raw["binding"], "value_only_gap", "unknown"), ]
            expected_f56 = _fnd( "applicability_unknown_as_na", "HELIXBRAIN-L5-032-R-applicability_unknown_as_na", field0["ref"], "applicability.evaluation", "unknown", [*app_refs, field0["ref"]], "core_owner", )
            validated_vf3, definitions_vf3, detail_vf3, public_vf3 = self._run_fn0_fn1_fn2(raw_vf3)
            self._assert_row_and_public_oracle(raw_vf3, definitions_vf3, detail_vf3, public_vf3, expected_events=expected_events, expected_findings=[expected_f56, expected_f56])
            self.assertEqual(len(public_vf3["findings"]), 2)
            self.assertEqual(detail_vf3["rows"][0]["finding_indices"], [0, 1])
            self.assertEqual(public_vf3["axes"], public_no_claims["axes"])
            self.assertEqual(len(validated_vf3["input"]["claims"]), 3)
        # R2-m6: A and B distinguished by basis_refs to verify exact claim ordering [0, 1]
        with self.subTest(case="HELIXBRAIN-L8-032-VF3-F03-CLAIMS_distinct_basis_refs_order"):
            raw_ord = copy.deepcopy(raw)
            basis_a = _ref_from(raw["binding"]["template_ref"], "SYNTHETIC-BASIS-A", owner="synthetic-core-owner")
            basis_b = _ref_from(raw["binding"]["template_ref"], "SYNTHETIC-BASIS-B", owner="synthetic-core-owner")
            raw_ord["claims"] = [ _claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable", [basis_a]), _claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable", [basis_b]), _claim(field0["ref"], raw["binding"], "field_not_applicable", "applicable"), ]
            _, _, detail_ord, public_ord = self._run_fn0_fn1_fn2(raw_ord)
            self.assertEqual(detail_ord["rows"][0]["finding_indices"], [0, 1])
            self.assertEqual(public_ord["findings"][0]["source_refs"][-1], basis_a)
            self.assertEqual(public_ord["findings"][1]["source_refs"][-1], basis_b)
        other_binding = copy.deepcopy(raw["binding"])
        other_binding["template_ref"] = _ref_from(raw["binding"]["template_ref"], "SYNTHETIC-OTHER-TEMPLATE-99")
        other_subject = _ref_from(field0["ref"], "SYNTHETIC-OTHER-FIELD-99")
        non_firing_claim_cases = [ ("rule55_contrast_definition_known_not_missing", [_claim(field0["ref"], raw["binding"], "value_only_gap", "unknown")]), ("rule55_contrast_negative_proposed_value", [_claim(field0["ref"], raw["binding"], "value_only_gap", "not_value_only")]), ("rule56_contrast_negative_proposed_value", [_claim(field0["ref"], raw["binding"], "field_not_applicable", "applicable")]), ("rule57_contrast_not_parent_na_branch", [_claim(field0["ref"], raw["binding"], "all_section_fields_not_applicable", "not_applicable")]), ("m2_unrecognized_f03_claim_kind", [_claim(field0["ref"], raw["binding"], "unrecognized_f03_kind", "unknown")]), ("m2_unrecognized_f03_proposed_value_literal", [_claim(field0["ref"], raw["binding"], "field_not_applicable", "invalid_literal")]), ("m2_null_f03_proposed_value", [_claim(field0["ref"], raw["binding"], "value_only_gap", None)]), ("R2-M5_claim_frame_binding_mismatch_preserved_0_findings", [_claim(field0["ref"], other_binding, "field_not_applicable", "not_applicable")]), ("R2-M5_claim_subject_mismatch_preserved_0_findings", [_claim(other_subject, raw["binding"], "field_not_applicable", "not_applicable")]), ("R3-M2_claim_basis_refs_empty_dict_elem", [_claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable", [{}])]), ("R3-M2_claim_basis_refs_none_elem", [_claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable", [None])]), ("R3-m1_claim_extra_key_preserved_0_findings", [{**_claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable"), "extra": 1}]), ("R3-m1_claim_actor_other_preserved_0_findings", [{**_claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable"), "actor": "OTHER"}]), ("R3-m1_claim_basis_refs_not_list_preserved_0_findings", [{**_claim(field0["ref"], raw["binding"], "field_not_applicable", "not_applicable"), "basis_refs": "bad"}]), ("R3-m1_other_frame_malformed_claim_preserved_0_findings", [{**_claim(other_subject, other_binding, "field_not_applicable", "not_applicable"), "actor": "OTHER", "basis_refs": "bad", "extra": 1}]), ]
        for label, claims_list in non_firing_claim_cases:
            with self.subTest(case=label):
                raw_nf = copy.deepcopy(raw)
                raw_nf["claims"] = copy.deepcopy(claims_list)
                validated_nf, definitions_nf, detail_nf, public_nf = self._run_fn0_fn1_fn2(raw_nf)
                self._assert_row_and_public_oracle(raw_nf, definitions_nf, detail_nf, public_nf, expected_events=expected_events, expected_findings=[])
                self.assertEqual(detail_nf["rows"][0]["finding_indices"], [])
                self.assertEqual(public_nf["axes"], public_no_claims["axes"])
                self.assertEqual(validated_nf["input"]["claims"], claims_list)
        with self.subTest(case="rule54_rule56_contrast_when_value_supplied_and_applicable"):
            raw_contrast = copy.deepcopy(raw)
            raw_contrast["values"][0]["value"] = "supplied-value"
            raw_contrast["values"][0]["origin"] = "project_owner"
            raw_contrast["applicability_records"][0]["decision"] = "applicable"
            raw_contrast["sources"] = raw_contrast["sources"][:5]
            raw_contrast["qualifications"] = raw_contrast["qualifications"][:5]
            raw_contrast["knowledge_records"][0]["provenance_refs"] = raw_contrast["knowledge_records"][0]["provenance_refs"][:1]
            self._add_f03_core_and_mapping_sources(raw_contrast, [field0], value_facts=[raw_contrast["values"][0]], app_records=[raw_contrast["applicability_records"][0]])
            _, _, _, pub_contrast_no_claims = self._run_fn0_fn1_fn2(raw_contrast)
            raw_contrast["claims"] = [ _claim(field0["ref"], raw_contrast["binding"], "field_not_applicable", "not_applicable"), _claim(field0["ref"], raw_contrast["binding"], "all_section_fields_not_applicable", "not_applicable"), ]
            _, _, detail_contrast, public_contrast = self._run_fn0_fn1_fn2(raw_contrast)
            self.assertEqual(public_contrast["findings"], [])
            self.assertEqual(detail_contrast["rows"][0]["finding_indices"], [])
            self.assertEqual(public_contrast["axes"], pub_contrast_no_claims["axes"])
        # R2-M3: independent negative precondition subTests for rule54 (applicability not applicable / definition not known), rule56 (applicability_null), rule55 (definition_unknown)
        with self.subTest(case="R2-M3_rule56_and_rule54_neg_when_applicability_null"):
            raw_app_null = base_input(self.document)
            _, f0_an = self._prep_f03_field0(raw_app_null, with_meaning=True, clear_values=False)
            f0_an["applicability_ref"] = None
            raw_app_null["applicability_records"] = []
            raw_app_null["values"][0].update({"value": None, "origin": "absent", "reason": "未決", "source_ref": copy.deepcopy(core_src_placeholder), "applicability_ref": None})
            self._add_f03_core_and_mapping_sources(raw_app_null, [f0_an], value_facts=[raw_app_null["values"][0]])
            _, _, _, pub_an_base = self._run_fn0_fn1_fn2(raw_app_null)
            raw_app_null["claims"] = [_claim(f0_an["ref"], raw_app_null["binding"], "field_not_applicable", "not_applicable")]
            _, _, detail_an, pub_an = self._run_fn0_fn1_fn2(raw_app_null)
            self.assertEqual(pub_an["findings"], [])
            self.assertEqual(detail_an["rows"][0]["finding_indices"], [])
            self.assertEqual(pub_an["axes"], pub_an_base["axes"])
        with self.subTest(case="R2-M3_rule54_neg_when_definition_not_known_and_rule55_neg_when_definition_unknown"):
            raw_def_unk = base_input(self.document)
            f0_du = raw_def_unk["section_fields"][0]
            f0_du["parent_section_ref"] = None
            raw_def_unk["values"][0].update({"value": None, "origin": "absent", "reason": "未決", "source_ref": copy.deepcopy(core_src_placeholder), "applicability_ref": None})
            raw_def_unk["applicability_records"][0].update({"owner": "synthetic-core-owner", "decision": "applicable", "reason": "適用", "reentry_condition": {"when": "常時"}, "source_ref": copy.deepcopy(core_src_placeholder)})
            _add_qualified_semantic_source( raw_def_unk, identity="SYNTHETIC-F03-CORE-SOURCE", owner="synthetic-core-owner", content={"binding": copy.deepcopy(raw_def_unk["binding"]), "value_facts": [copy.deepcopy(raw_def_unk["values"][0])], "field_applicability_records": [copy.deepcopy(raw_def_unk["applicability_records"][0])]}, add_to_knowledge_provenance=False, )
            _, _, _, pub_du_base = self._run_fn0_fn1_fn2(raw_def_unk)
            raw_def_unk["claims"] = [ _claim(f0_du["ref"], raw_def_unk["binding"], "field_not_applicable", "not_applicable"), _claim(f0_du["ref"], raw_def_unk["binding"], "value_only_gap", "unknown"), ]
            _, _, detail_du, pub_du = self._run_fn0_fn1_fn2(raw_def_unk)
            self.assertEqual(pub_du["findings"], [])
            self.assertEqual(detail_du["rows"][0]["finding_indices"], [])
            self.assertEqual(pub_du["axes"], pub_du_base["axes"])

    def test_f03_unclosed_branches_stop_with_tagged_not_implemented_error(self) -> None:
        def make_f03_base(*, with_meaning: bool = False) -> dict:
            raw = base_input(self.document)
            slot7 = next(s for s in raw["descriptors"] if s["descriptor_kind"] == "required field")
            field = raw["section_fields"][0]
            for k in ("requiredness_fact_refs", "normative_rule_refs", "oracle_refs", "value_fact_refs"):
                field[k] = []
            field["meaning_fact_refs"] = [copy.deepcopy(slot7["facts"][0]["ref"])] if with_meaning else []
            field["parent_section_ref"] = None
            field["applicability_ref"] = None
            raw["values"] = []
            raw["applicability_records"] = []
            content: dict = { "binding": copy.deepcopy(raw["binding"]), "descriptor_targets": [{"target_ref": copy.deepcopy(field["descriptor_slot_ref"]), "slot_identity": "synthetic-descriptor-7", "descriptor_kind": "required field"}], "section_field_records": [{"record": copy.deepcopy(field)}], }
            if with_meaning:
                content["definition_meaning_operations"] = [_positive_field_meaning_operation(raw, self.l4_doc)]
            _add_qualified_semantic_source(raw, identity="SYNTHETIC-F03-MAPPING-SOURCE", owner="synthetic-knowledge-owner", content=content, add_to_knowledge_provenance=True)
            return raw

        def assert_stops(raw: dict, expected_branch_tag: str, *, mutate_validated_fn=None, call_detail_ctx=None) -> None:
            raw_before = copy.deepcopy(raw)
            validated = validate_supply_input(raw)
            definitions = compare_descriptor_definitions({"validated": validated})
            if mutate_validated_fn is not None:
                mutate_validated_fn(validated)
            validated_before = copy.deepcopy(validated)
            definitions_before = copy.deepcopy(definitions)
            with self.assertRaises(NotImplementedError) as caught:
                if call_detail_ctx is not None:
                    _evaluate_field_values_detail(call_detail_ctx(validated, definitions))
                else:
                    compare_values_and_applicability({"validated": validated, "definitions": definitions})
            msg = str(caught.exception)
            self.assertIn(expected_branch_tag, msg)
            self.assertIn(F03_BACKFLOW_ID, msg)
            self.assertEqual(raw, raw_before)
            self.assertEqual(validated, validated_before)
            self.assertEqual(definitions, definitions_before)

        expected_l7_tags = [entry.split(":", 1)[0].strip() for entry in self.l7_doc["partial_oracle_and_stop_boundary"]["unclosed_stop_branches"]]
        impl_tags = {f"F03/{m}" for py_file in sorted(SRC_DIR.glob("values_applicability*.py")) for m in re.findall(r'_f03_stop\(\s*"([^"]+)"', py_file.read_text(encoding="utf-8"))}
        with self.subTest(check="impl_stop_tags_match_l7"):
            self.assertEqual(sorted(impl_tags), sorted(expected_l7_tags))
        tested_tags: set[str] = set()

        # 0) F03/context_or_input_shape
        tag0 = "F03/context_or_input_shape"
        tested_tags.add(tag0)
        for label, ctx_fn in (
            ("bad_ctx_keys", lambda v, d: {"snapshot": v}),
            ("bad_snapshot", lambda v, d: {"snapshot": {}, "definitions": d}),
            ("bad_definitions", lambda v, d: {"snapshot": v, "definitions": {}}),
        ):
            with self.subTest(branch=tag0, case=label):
                assert_stops(make_f03_base(), tag0, call_detail_ctx=ctx_fn)
        for missing_key in ("values", "section_fields", "claims"):
            with self.subTest(branch=tag0, missing=missing_key):
                assert_stops(make_f03_base(), tag0, mutate_validated_fn=lambda v, k=missing_key: v["input"].pop(k, None))
                assert_stops(make_f03_base(), tag0, mutate_validated_fn=lambda v, k=missing_key: v["input"].__setitem__(k, "not-a-list"))

        # 1) F03/applicability_records_absent_or_shape
        tag1 = "F03/applicability_records_absent_or_shape"
        tested_tags.add(tag1)
        with self.subTest(branch=tag1):
            assert_stops(make_f03_base(), tag1, mutate_validated_fn=lambda v: v["input"].pop("applicability_records", None))
            assert_stops(make_f03_base(), tag1, mutate_validated_fn=lambda v: v["input"].__setitem__("applicability_records", "not-a-list"))

        # 2) F03/carrier_or_source_record_shape (including R2-M1, R2-M2, R2-M5, R2-m2)
        tag2 = "F03/carrier_or_source_record_shape"
        tested_tags.add(tag2)
        with self.subTest(branch=tag2, case="section_field_records_not_list"):
            raw2 = make_f03_base()
            raw2["sources"][-1]["content"]["section_field_records"] = "not-a-list"
            _resync_last_semantic_source(raw2)
            assert_stops(raw2, tag2)
        for container_key in ("sources", "knowledge_records", "descriptors", "meaning_comparisons"):
            with self.subTest(branch=tag2, container_absent_or_type=container_key):
                assert_stops(make_f03_base(with_meaning=True), tag2, mutate_validated_fn=lambda v, k=container_key: v["input"].pop(k, None))
                assert_stops(make_f03_base(with_meaning=True), tag2, mutate_validated_fn=lambda v, k=container_key: v["input"].__setitem__(k, "not-a-list"))
        for sub_case, mut_fn in (
            ("provenance_refs_absent", lambda v: v["input"]["knowledge_records"][0].pop("provenance_refs", None)),
            ("provenance_refs_type", lambda v: v["input"]["knowledge_records"][0].__setitem__("provenance_refs", "bad")),
            ("slot_facts_absent", lambda v: next(s for s in v["input"]["descriptors"] if s["descriptor_kind"] == "required field").pop("facts", None)),
            ("slot_facts_type", lambda v: next(s for s in v["input"]["descriptors"] if s["descriptor_kind"] == "required field").__setitem__("facts", "bad")),
            ("source_descriptor_facts_absent", lambda v: v["input"]["sources"][0]["content"].pop("descriptor_facts", None)),
            ("source_descriptor_facts_type", lambda v: v["input"]["sources"][0]["content"].__setitem__("descriptor_facts", "bad")),
            ("source_group_facts_absent", lambda v: next(g for g in v["input"]["sources"][0]["content"]["descriptor_facts"] if g["slot_identity"] == "synthetic-descriptor-7").pop("facts", None)),
            ("source_group_facts_type", lambda v: next(g for g in v["input"]["sources"][0]["content"]["descriptor_facts"] if g["slot_identity"] == "synthetic-descriptor-7").__setitem__("facts", "bad")),
            ("non_dict_source", lambda v: v["input"]["sources"].append("not-a-dict")),
            ("unusable_matching_source", lambda v: v["unusable_source_refs"].append(copy.deepcopy(v["input"]["sources"][-1]["ref"]))),
            ("section_field_extra_key", lambda v: v["input"]["section_fields"][0].__setitem__("extra", 1)),
            ("section_field_not_dict", lambda v: v["input"]["section_fields"].append("not-a-dict")),
            ("value_fact_not_dict", lambda v: v["input"]["values"].append("not-a-dict")),
            ("applicability_ref_not_dict", lambda v: (v["input"]["section_fields"][0].__setitem__("applicability_ref", "bad-ref"), v["input"]["sources"][-1]["content"]["section_field_records"][0]["record"].__setitem__("applicability_ref", "bad-ref"))),
            ("value_fact_refs_not_list", lambda v: (v["input"]["section_fields"][0].__setitem__("value_fact_refs", "bad"), v["input"]["sources"][-1]["content"]["section_field_records"][0]["record"].__setitem__("value_fact_refs", "bad"))),
            ("value_fact_refs_non_ref_elem", lambda v: (v["input"]["section_fields"][0].__setitem__("value_fact_refs", ["bad"]), v["input"]["sources"][-1]["content"]["section_field_records"][0]["record"].__setitem__("value_fact_refs", ["bad"]))),
            ("parent_section_ref_not_dict", lambda v: (v["input"]["section_fields"][0].__setitem__("parent_section_ref", "bad"), v["input"]["sources"][-1]["content"]["section_field_records"][0]["record"].__setitem__("parent_section_ref", "bad"))),
            ("R3-M1_descriptor_slot_ref_not_ref", lambda v: (v["input"]["section_fields"][0].__setitem__("descriptor_slot_ref", "bad-slot-ref"), v["input"]["sources"][-1]["content"]["section_field_records"][0]["record"].__setitem__("descriptor_slot_ref", "bad-slot-ref"))),
            ("R3-m2_meaning_comparisons_elem_not_dict", lambda v: v["input"]["meaning_comparisons"].append("not-a-dict")),
            ("R3-m2_parent_applicability_elem_not_dict", lambda v: (v["input"]["section_fields"][0].__setitem__("parent_section_ref", _ref_from(v["input"]["binding"]["template_ref"], "SYNTHETIC-PARENT-SEC")), v["input"]["sources"][-1]["content"]["section_field_records"][0]["record"].__setitem__("parent_section_ref", _ref_from(v["input"]["binding"]["template_ref"], "SYNTHETIC-PARENT-SEC")), _resync_last_semantic_source(v["input"]), v["input"]["applicability_records"].append("not-a-dict"))),
            ("R3-m1_claim_not_dict", lambda v: (v["input"]["section_fields"][0].__setitem__("meaning_fact_refs", []), v["input"]["sources"][-1]["content"]["section_field_records"][0]["record"].__setitem__("meaning_fact_refs", []), _resync_last_semantic_source(v["input"]), v["input"]["claims"].append("not-a-dict"))),
        ):
            with self.subTest(branch=tag2, case=sub_case):
                assert_stops(make_f03_base(with_meaning=True), tag2, mutate_validated_fn=mut_fn)
        # R2-M1 & R2-M5: ValueFact unclosed value/origin combinations (origin="product_input" and value=None, origin="project_owner")
        for bad_val, bad_origin in (("7 years", "product_input"), (None, "project_owner")):
            with self.subTest(branch=tag2, bad_value_origin=(bad_val, bad_origin)):
                raw_vo = make_f03_base()
                v_ref = _ref_from(raw_vo["binding"]["template_ref"], "SYNTHETIC-F03-VAL-BAD-ORIGIN", owner="synthetic-core-owner")
                src_ref_placeholder = _ref_from(raw_vo["sources"][-1]["ref"], raw_vo["sources"][-1]["ref"]["identity"], sha256=None)
                raw_vo["section_fields"][0]["value_fact_refs"] = [copy.deepcopy(v_ref)]
                raw_vo["sources"][-1]["content"]["section_field_records"][0]["record"]["value_fact_refs"] = [copy.deepcopy(v_ref)]
                v_rec = {"ref": copy.deepcopy(v_ref), "subject_ref": copy.deepcopy(raw_vo["section_fields"][0]["ref"]), "binding": copy.deepcopy(raw_vo["binding"]), "value": bad_val, "source_ref": copy.deepcopy(src_ref_placeholder), "reason": "r", "origin": "project_owner", "applicability_ref": None}
                raw_vo["values"] = [copy.deepcopy(v_rec)]
                raw_vo["sources"][-1]["content"]["value_facts"] = [copy.deepcopy(v_rec)]
                _resync_last_semantic_source(raw_vo)
                assert_stops(raw_vo, tag2, mutate_validated_fn=lambda v, bv=bad_val, bo=bad_origin: (v["input"]["values"][0].update({"value": bv, "origin": bo}), v["input"]["sources"][-1]["content"]["value_facts"][0].update({"value": bv, "origin": bo})))

        # 3) F03/duplicate_conflicting_carrier_records (including R2-M5 multiple section_fields matching claim)
        tag3 = "F03/duplicate_conflicting_carrier_records"
        tested_tags.add(tag3)
        with self.subTest(branch=tag3, case="conflicting_section_field_mirror"):
            raw3 = make_f03_base()
            conflicting_mirror = copy.deepcopy(raw3["section_fields"][0])
            conflicting_mirror["parent_section_ref"] = _ref_from(raw3["binding"]["template_ref"], "SYNTHETIC-SECTION-CONFLICT")
            raw3["sources"][-1]["content"]["section_field_records"] = [{"record": conflicting_mirror}]
            _resync_last_semantic_source(raw3)
            assert_stops(raw3, tag3)
        with self.subTest(branch=tag3, case="R2-M5_claim_matches_multiple_section_fields"):
            raw3_dup = make_f03_base()
            f_dup = copy.deepcopy(raw3_dup["section_fields"][0])
            raw3_dup["section_fields"].append(copy.deepcopy(f_dup))
            raw3_dup["claims"] = [_claim(f_dup["ref"], raw3_dup["binding"], "value_only_gap", "unknown")]
            assert_stops(raw3_dup, tag3)

        # 4) F03/meaning_comparison_pair_read
        tag5 = "F03/meaning_comparison_pair_read"
        tested_tags.add(tag5)
        with self.subTest(branch=tag5):
            raw5 = make_f03_base(with_meaning=True)
            slot7 = next(s for s in raw5["descriptors"] if s["descriptor_kind"] == "required field")
            fact_ref = copy.deepcopy(slot7["facts"][0]["ref"])
            assert_stops(raw5, tag5, mutate_validated_fn=lambda v: v["input"].update({"meaning_comparisons": [{"left_fact_ref": copy.deepcopy(fact_ref), "right_fact_ref": copy.deepcopy(fact_ref), "relation": "equivalent"}]}))

        # 5) F03/meaning_operation_shape (including R2-m3 basis_refs={}, [{}], raw_semantic_basis, same-fact arg mismatch)
        tag6 = "F03/meaning_operation_shape"
        tested_tags.add(tag6)
        for op_case, mut_op in (
            ("reason_non_string", lambda op: op["decision"].__setitem__("reason", {"presence": "supplied", "value": 12345})),
            ("basis_refs_dict", lambda op: op["decision"].__setitem__("basis_refs", {})),
            ("basis_refs_empty_dict_elem", lambda op: op["decision"].__setitem__("basis_refs", [{}])),
            ("raw_semantic_basis_not_dict", lambda op: op["decision"].__setitem__("raw_semantic_basis", "bad")),
            ("raw_semantic_basis_null_val", lambda op: op["decision"].__setitem__("raw_semantic_basis", {"presence": "supplied", "value": None})),
            ("same_fact_normative_mismatch", lambda op: op["arguments"]["normative_argument"].__setitem__("entry_pointer", "/descriptor_meanings/0")),
            ("non_positive_relation", lambda op: op["decision"].__setitem__("relation", "undetermined")),
        ):
            with self.subTest(branch=tag6, case=op_case):
                raw6 = make_f03_base(with_meaning=True)
                bad_op = _positive_field_meaning_operation(raw6, self.l4_doc)
                mut_op(bad_op)
                raw6["sources"][-1]["content"]["definition_meaning_operations"] = [bad_op]
                _resync_last_semantic_source(raw6)
                assert_stops(raw6, tag6)

        # 6) F03/na_incomplete_branch (including R2-M5 rows.py:307 invalid decision)
        tag7 = "F03/na_incomplete_branch"
        tested_tags.add(tag7)
        for dec_val, reason_val in (("not_applicable", None), ("invalid_decision_literal", "理由あり")):
            with self.subTest(branch=tag7, decision=dec_val):
                raw7 = make_f03_base()
                app_ref = _ref_from(raw7["binding"]["template_ref"], "SYNTHETIC-F03-APP-INCOMPLETE", owner="synthetic-core-owner")
                core_ref = _ref_from(raw7["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE", owner="synthetic-core-owner")
                raw7["section_fields"][0]["applicability_ref"] = copy.deepcopy(app_ref)
                raw7["sources"][-1]["content"]["section_field_records"][0]["record"]["applicability_ref"] = copy.deepcopy(app_ref)
                _resync_last_semantic_source(raw7)
                inc_app = {"ref": copy.deepcopy(app_ref), "subject_ref": copy.deepcopy(raw7["section_fields"][0]["ref"]), "binding": copy.deepcopy(raw7["binding"]), "owner": "synthetic-core-owner", "decision": dec_val, "reason": reason_val, "reentry_condition": {"when": "later"}, "source_ref": copy.deepcopy(core_ref)}
                raw7["applicability_records"] = [copy.deepcopy(inc_app)]
                _add_qualified_semantic_source(raw7, identity="SYNTHETIC-F03-CORE-SOURCE", owner="synthetic-core-owner", content={"binding": copy.deepcopy(raw7["binding"]), "field_applicability_records": [copy.deepcopy(inc_app)]}, add_to_knowledge_provenance=False)
                assert_stops(raw7, tag7)
        for missing_parent_key in ("owner", "reason", "reentry_condition"):
            with self.subTest(branch=tag7, parent_na_null_key=missing_parent_key):
                raw7p = make_f03_base(with_meaning=True)
                p_sec_ref = _ref_from(raw7p["binding"]["template_ref"], "SYNTHETIC-F03-PARENT-SEC", owner="synthetic-knowledge-owner")
                p_app_ref = _ref_from(raw7p["binding"]["template_ref"], "SYNTHETIC-F03-PARENT-APP-INC", owner="synthetic-core-owner")
                core_ref7p = _ref_from(raw7p["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE-7P", owner="synthetic-core-owner")
                raw7p["section_fields"][0]["parent_section_ref"] = copy.deepcopy(p_sec_ref)
                raw7p["sources"][-1]["content"]["section_field_records"][0]["record"]["parent_section_ref"] = copy.deepcopy(p_sec_ref)
                _resync_last_semantic_source(raw7p)
                p_inc_rec = {"ref": copy.deepcopy(p_app_ref), "subject_ref": copy.deepcopy(p_sec_ref), "binding": copy.deepcopy(raw7p["binding"]), "owner": "synthetic-core-owner", "decision": "not_applicable", "reason": "親N/A理由", "reentry_condition": {"when": "later"}, "source_ref": copy.deepcopy(core_ref7p)}
                p_inc_rec[missing_parent_key] = None
                raw7p["applicability_records"] = [copy.deepcopy(p_inc_rec)]
                _add_qualified_semantic_source(raw7p, identity="SYNTHETIC-F03-CORE-SOURCE-7P", owner="synthetic-core-owner", content={"binding": copy.deepcopy(raw7p["binding"]), "field_applicability_records": [copy.deepcopy(p_inc_rec)]}, add_to_knowledge_provenance=False)
                assert_stops(raw7p, tag7)

        # 7) F03/value_applicability_supplied
        tag8 = "F03/value_applicability_supplied"
        tested_tags.add(tag8)
        with self.subTest(branch=tag8):
            raw8 = make_f03_base()
            v_ref = _ref_from(raw8["binding"]["template_ref"], "SYNTHETIC-F03-VAL-WITH-APP", owner="synthetic-knowledge-owner")
            v_app_ref = _ref_from(raw8["binding"]["template_ref"], "SYNTHETIC-F03-VAL-APP-REC", owner="synthetic-core-owner")
            core_ref8 = _ref_from(raw8["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE-8", owner="synthetic-core-owner")
            raw8["section_fields"][0]["value_fact_refs"] = [copy.deepcopy(v_ref)]
            raw8["sources"][-1]["content"]["section_field_records"][0]["record"]["value_fact_refs"] = [copy.deepcopy(v_ref)]
            val_rec8 = {"ref": copy.deepcopy(v_ref), "subject_ref": copy.deepcopy(raw8["section_fields"][0]["ref"]), "binding": copy.deepcopy(raw8["binding"]), "value": "some-val", "source_ref": copy.deepcopy(raw8["sources"][-1]["ref"]), "reason": "supplied value", "origin": "project_owner", "applicability_ref": copy.deepcopy(v_app_ref)}
            raw8["values"] = [copy.deepcopy(val_rec8)]
            raw8["sources"][-1]["content"]["value_facts"] = [copy.deepcopy(val_rec8)]
            _resync_last_semantic_source(raw8)
            val_app_rec8 = {"ref": copy.deepcopy(v_app_ref), "subject_ref": copy.deepcopy(raw8["section_fields"][0]["ref"]), "binding": copy.deepcopy(raw8["binding"]), "owner": "synthetic-core-owner", "decision": "applicable", "reason": "value applicability", "reentry_condition": {"when": "always"}, "source_ref": copy.deepcopy(core_ref8)}
            raw8["applicability_records"] = [copy.deepcopy(val_app_rec8)]
            _add_qualified_semantic_source(raw8, identity="SYNTHETIC-F03-CORE-SOURCE-8", owner="synthetic-core-owner", content={"binding": copy.deepcopy(raw8["binding"]), "field_applicability_records": [copy.deepcopy(val_app_rec8)]}, add_to_knowledge_provenance=False)
            assert_stops(raw8, tag8)

        # 8) F03/empty_value_fact_refs_non_empty_owner (including R2-M5 rows.py:218 applicable with empty value_fact_refs)
        tag9 = "F03/empty_value_fact_refs_non_empty_owner"
        tested_tags.add(tag9)
        with self.subTest(branch=tag9, case="definition_known_without_values_or_na"):
            assert_stops(make_f03_base(with_meaning=True), tag9)
        with self.subTest(branch=tag9, case="R2-M5_applicable_with_empty_value_fact_refs"):
            raw9_app = make_f03_base(with_meaning=True)
            app_ref9 = _ref_from(raw9_app["binding"]["template_ref"], "SYNTHETIC-F03-APP-9", owner="synthetic-core-owner")
            core_ref9 = _ref_from(raw9_app["binding"]["template_ref"], "SYNTHETIC-F03-CORE-SOURCE-9", owner="synthetic-core-owner")
            raw9_app["section_fields"][0]["applicability_ref"] = copy.deepcopy(app_ref9)
            raw9_app["sources"][-1]["content"]["section_field_records"][0]["record"]["applicability_ref"] = copy.deepcopy(app_ref9)
            _resync_last_semantic_source(raw9_app)
            app_rec9 = {"ref": copy.deepcopy(app_ref9), "subject_ref": copy.deepcopy(raw9_app["section_fields"][0]["ref"]), "binding": copy.deepcopy(raw9_app["binding"]), "owner": "synthetic-core-owner", "decision": "applicable", "reason": "適用", "reentry_condition": {"when": "常時"}, "source_ref": copy.deepcopy(core_ref9)}
            raw9_app["applicability_records"] = [copy.deepcopy(app_rec9)]
            _add_qualified_semantic_source(raw9_app, identity="SYNTHETIC-F03-CORE-SOURCE-9", owner="synthetic-core-owner", content={"binding": copy.deepcopy(raw9_app["binding"]), "field_applicability_records": [copy.deepcopy(app_rec9)]}, add_to_knowledge_provenance=False)
            assert_stops(raw9_app, tag9)


        self.assertEqual(sorted(tested_tags), sorted(expected_l7_tags))


if __name__ == "__main__":
    unittest.main()
