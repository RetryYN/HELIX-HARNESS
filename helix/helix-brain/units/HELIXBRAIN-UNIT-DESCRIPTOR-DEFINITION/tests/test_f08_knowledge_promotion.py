"""BRAIN032 F08（知識stateとpromotion）の fn5 compare_knowledge_promotion 単体検証（L7）。"""

from __future__ import annotations

import copy, hashlib, json, unittest
from pathlib import Path
from descriptor_definitions import _ordered, compare_knowledge_promotion, validate_supply_input
from knowledge_promotion import F08_BACKFLOW_ID
from supply_input_fixtures import base_input, load_document

def _load_json(path: Path) -> dict: return json.loads(path.read_text(encoding="utf-8"))
def _sorted_vals(items: list[dict]) -> list[dict]: return [copy.deepcopy(x) for x in sorted(items, key=_ordered)]

def _ref_from(base_ref: dict, identity: str | None, *, revision: str | None = "_KEEP_", owner: str | None = "_KEEP_", sha256: str | None = None, source_locator: str | None = None, scope: object = "_KEEP_") -> dict:
    return {
        **copy.deepcopy(base_ref),
        "identity": identity,
        "revision": base_ref["revision"] if revision == "_KEEP_" else revision,
        "owner": base_ref["owner"] if owner == "_KEEP_" else owner,
        "scope": copy.deepcopy(base_ref["scope"]) if scope == "_KEEP_" else copy.deepcopy(scope),
        "source_locator": source_locator,
        "sha256": sha256,
    }

def _make_claim(subject_ref: dict, binding: dict, kind: object, *, proposed_value: object = "accepted", basis_refs: object = "_OMIT_", actor: str = "BRAIN") -> dict:
    claim: dict[str, object] = {"subject_ref": copy.deepcopy(subject_ref), "binding": copy.deepcopy(binding), "kind": kind, "proposed_value": copy.deepcopy(proposed_value), "actor": actor}
    if basis_refs != "_OMIT_":
        claim["basis_refs"] = copy.deepcopy(basis_refs)
    return claim

def _add_promotion_semantic_source(raw: dict, *, identity: str, owner: str = "synthetic-knowledge-owner", promotion_evidence: object = None, binding: object = "_DEFAULT_", qualify: bool = True, role: str = "semantic_json", extra_content: dict | None = None, raw_content_override: object = "_NONE_") -> dict:
    if raw_content_override != "_NONE_":
        content = copy.deepcopy(raw_content_override)
    else:
        content = {}
        if binding != "_OMIT_":
            content["binding"] = copy.deepcopy(raw["binding"] if binding == "_DEFAULT_" else binding)
        if promotion_evidence != "_OMIT_":
            content["promotion_evidence"] = copy.deepcopy([] if promotion_evidence is None else promotion_evidence)
        if extra_content:
            content.update(copy.deepcopy(extra_content))
    raw_bytes_str = _ordered(content) if isinstance(content, (dict, list)) else "{}"
    digest = hashlib.sha256(raw_bytes_str.encode("utf-8")).hexdigest()
    src_ref = _ref_from(raw["binding"]["knowledge_ref"], identity, owner=owner, sha256=digest, source_locator=f"synthetic://{identity.lower()}.json")
    q_ref = _ref_from(raw["binding"]["knowledge_ref"], f"{identity}-QUAL", owner=owner) if qualify else None
    raw["sources"].append({"ref": copy.deepcopy(src_ref), "role": role, "content_bytes": raw_bytes_str, "content": content, "qualification_ref": copy.deepcopy(q_ref)})
    if qualify and q_ref is not None:
        raw["qualifications"].append({"ref": copy.deepcopy(q_ref), "subject_ref": copy.deepcopy(src_ref), "subject_sha256": digest, "applicable_scope": copy.deepcopy(src_ref["scope"]), "qualification_body": {"owner": owner, "subject": identity, "authority_effect": "fixture assumption only"}, "root_ref": copy.deepcopy(raw["qualification_roots"][0])})
    return src_ref

def _carrier_entry(claim_index: object, claim: object, basis_index: object, basis_ref: object, knowledge_ref: object, record_member: object, *, original_evidence_set: object = "_ABSENT_", original_stages: object = "_ABSENT_", target_override: object = "_NONE_", omit_key: str | None = None) -> dict:
    target = copy.deepcopy(target_override) if target_override != "_NONE_" else {"identity": claim["subject_ref"]["identity"], "revision": claim["subject_ref"]["revision"], "scope": copy.deepcopy(claim["subject_ref"]["scope"])}
    entry: dict[str, object] = {"claim_index": claim_index, "claim": copy.deepcopy(claim), "basis_index": basis_index, "basis_ref": copy.deepcopy(basis_ref), "knowledge_ref": copy.deepcopy(knowledge_ref), "original_target": target, "record_member": record_member}
    if original_evidence_set != "_ABSENT_":
        entry["original_evidence_set"] = copy.deepcopy(original_evidence_set)
    if original_stages != "_ABSENT_":
        entry["original_stages"] = copy.deepcopy(original_stages)
    if omit_key is not None:
        entry.pop(omit_key, None)
    return entry

def _expected_reason(code: str, predicate: str, claim_index: int, record_locators: list[str], observations: list[dict], basis_reads: dict) -> str:
    return _ordered({"code": code, "predicate": predicate, "claim_locator": f"/claims/{claim_index}", "record_locators": record_locators, "observations": observations, "basis_reads": basis_reads})

def _obs(record_locator: str, *, evaluation_scope: str = "supplied", evaluation_ref: str = "null", independent_verification_ref: str = "null", limited_adoption_ref: str = "null", adoption_ref: str = "null") -> dict:
    return {"adoption_ref": adoption_ref, "evaluation_ref": evaluation_ref, "evaluation_scope": evaluation_scope, "independent_verification_ref": independent_verification_ref, "limited_adoption_ref": limited_adoption_ref, "record_locator": record_locator}

def _record_refs_from(rec: dict) -> list[dict]:
    refs = [rec["ref"], *rec.get("provenance_refs", [])]
    for k in ("limited_adoption_ref", "evaluation_ref", "os_registration_ref", "independent_verification_ref", "adoption_ref"):
        if isinstance(rec.get(k), dict):
            refs.append(rec[k])
    return _sorted_vals(refs)

def _not_req_reads(count: int = 1) -> dict:
    return {"presence": "supplied", "occurrences": [{"basis_index": i, "source_indices": [], "carrier_locations": [], "record_member_matches": [], "outcome": "not_required"} for i in range(count)]}

def _make_valid_candidate_empty(doc: dict) -> dict:
    raw = base_input(doc)
    raw["candidates"] = []
    raw.pop("dependencies", None)
    for col in ("meaning_comparisons", "section_fields", "values", "applicability_records", "relations", "oracle_bindings", "compatibility_records", "handoff_records"):
        raw[col] = []
    raw["knowledge_records"] = [{"ref": copy.deepcopy(raw["knowledge_records"][0]["ref"]), "provenance_refs": copy.deepcopy(raw["knowledge_records"][0]["provenance_refs"])}]
    t_ref0 = _ref_from(raw["binding"]["template_ref"], "SYNTHETIC-F08-EMPTY-TARGET-01")
    s0_content = {"binding": copy.deepcopy(raw["binding"]), "descriptor_targets": [{"target_ref": copy.deepcopy(t_ref0), "slot_identity": "synthetic-descriptor-1", "descriptor_kind": "template identity"}]}
    s0_bytes = _ordered(s0_content)
    s0_sha = hashlib.sha256(s0_bytes.encode("utf-8")).hexdigest()
    raw["sources"] = [{**copy.deepcopy(raw["sources"][0]), "content": s0_content, "content_bytes": s0_bytes}]
    raw["sources"][0]["ref"]["sha256"] = s0_sha
    raw["qualifications"][0]["subject_ref"]["sha256"] = s0_sha
    raw["qualifications"][0]["subject_sha256"] = s0_sha
    return raw


class TestF08KnowledgePromotion(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.document = load_document()
        cls.repo_root = Path(__file__).resolve().parents[5]
        cls.l7_doc = _load_json(cls.repo_root / "docs/helix-brain/L7-function-verification/f08-fn5-knowledge-promotion.json")

    def _run_fn0_fn5(self, raw: dict) -> tuple[dict, dict]:
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(raw, raw_before)
        context = {"validated": validated}
        context_before = copy.deepcopy(context)
        result = compare_knowledge_promotion(context)
        self.assertEqual(context, context_before)
        self.assertEqual(list(result.keys()), ["axes", "findings", "producer_symbol", "input_binding"])
        self.assertEqual(result["producer_symbol"], "compare_knowledge_promotion")
        self.assertEqual(result["input_binding"], raw["binding"])
        self.assertIsNot(result["input_binding"], validated["input"]["binding"])
        for ax in result["axes"]:
            self.assertEqual(list(ax.keys()), ["subject_ref", "binding", "axis", "state", "original_refs", "reason", "backflow_owner"])
        for fnd in result["findings"]:
            self.assertEqual(list(fnd.keys()), ["code", "rule_ref", "subject_ref", "binding", "axis", "state", "source_refs", "reason", "backflow_owner"])
        return validated, result

    def _assert_axis_7(self, ax: dict, *, subject_ref: dict, binding: dict, axis: str, state: str, original_refs: list[dict], reason: str, backflow_owner: str | None) -> None:
        self.assertEqual(ax, {"subject_ref": subject_ref, "binding": binding, "axis": axis, "state": state, "original_refs": original_refs, "reason": reason, "backflow_owner": backflow_owner})

    def _assert_finding_9(self, fnd: dict, *, code: str, rule_ref: str, subject_ref: dict, binding: dict, axis: str, state: str, source_refs: list[dict], reason: str, backflow_owner: str) -> None:
        self.assertEqual(fnd, {"code": code, "rule_ref": rule_ref, "subject_ref": subject_ref, "binding": binding, "axis": axis, "state": state, "source_refs": source_refs, "reason": reason, "backflow_owner": backflow_owner})

    def test_f08_normal_control_and_add16_and_p3a_nonempty_candidate_trace(self) -> None:
        with self.subTest(case="HELIXBRAIN-L8-032-NORMAL-compare_knowledge_promotion"):
            raw = base_input(self.document)
            _, res = self._run_fn0_fn5(raw)
            rec0 = raw["knowledge_records"][0]
            self.assertEqual(res["findings"], [])
            self.assertEqual(len(res["axes"]), 1)
            self._assert_axis_7(
                res["axes"][0],
                subject_ref=raw["binding"]["knowledge_ref"],
                binding=raw["binding"],
                axis="knowledge_record_trace",
                state="resolved",
                original_refs=_sorted_vals([rec0["ref"], *rec0["provenance_refs"]]),
                reason="同一immutable snapshotの原KnowledgeRecordを一意に辿れる。運用成立を意味しない。",
                backflow_owner=None,
            )

        with self.subTest(case="HELIXBRAIN-L8-032-ADD-16_limited_adoption_no_operational_claim"):
            raw16 = base_input(self.document)
            lim_ref = _ref_from(raw16["binding"]["knowledge_ref"], "SYNTHETIC-F08-LIMITED-ADOPTION-01", owner="synthetic-knowledge-owner")
            raw16["knowledge_records"][0]["limited_adoption_ref"] = copy.deepcopy(lim_ref)
            _, res16 = self._run_fn0_fn5(raw16)
            rec16 = raw16["knowledge_records"][0]
            self.assertEqual(res16["findings"], [])
            self.assertEqual(len(res16["axes"]), 1)
            self._assert_axis_7(
                res16["axes"][0],
                subject_ref=raw16["binding"]["knowledge_ref"],
                binding=raw16["binding"],
                axis="knowledge_record_trace",
                state="resolved",
                original_refs=_sorted_vals([rec16["ref"], *rec16["provenance_refs"], lim_ref]),
                reason="同一immutable snapshotの原KnowledgeRecordを一意に辿れる。運用成立を意味しない。",
                backflow_owner=None,
            )
            self.assertEqual(raw16["knowledge_records"][0]["operational_state"], {"source_state": "synthetic-candidate"})

        with self.subTest(case="P3a_claims_absent_and_falsy_nonnull_states_resolved"):
            for falsy_state in (False, 0, "", [], {}):
                raw_falsy = base_input(self.document)
                raw_falsy.pop("claims", None)
                raw_falsy["knowledge_records"][0]["operational_state"] = copy.deepcopy(falsy_state)
                stage_refs = []
                for idx, key in enumerate(("limited_adoption_ref", "evaluation_ref", "os_registration_ref", "independent_verification_ref", "adoption_ref")):
                    sref = _ref_from(raw_falsy["binding"]["knowledge_ref"], f"SYNTHETIC-F08-STAGE-REF-{idx}")
                    raw_falsy["knowledge_records"][0][key] = copy.deepcopy(sref)
                    stage_refs.append(sref)
                _, res_falsy = self._run_fn0_fn5(raw_falsy)
                self.assertEqual(res_falsy["findings"], [])
                rec_f = raw_falsy["knowledge_records"][0]
                self._assert_axis_7(
                    res_falsy["axes"][0],
                    subject_ref=raw_falsy["binding"]["knowledge_ref"],
                    binding=raw_falsy["binding"],
                    axis="knowledge_record_trace",
                    state="resolved",
                    original_refs=_sorted_vals([rec_f["ref"], *rec_f["provenance_refs"], *stage_refs]),
                    reason="同一immutable snapshotの原KnowledgeRecordを一意に辿れる。運用成立を意味しない。",
                    backflow_owner=None,
                )

        with self.subTest(case="P3a_operational_state_null_or_absent_is_unknown"):
            for mode in ("null", "absent"):
                raw_u = base_input(self.document)
                if mode == "null":
                    raw_u["knowledge_records"][0]["operational_state"] = None
                else:
                    raw_u["knowledge_records"][0].pop("operational_state", None)
                _, res_u = self._run_fn0_fn5(raw_u)
                rec_u = raw_u["knowledge_records"][0]
                self._assert_axis_7(
                    res_u["axes"][0],
                    subject_ref=raw_u["binding"]["knowledge_ref"],
                    binding=raw_u["binding"],
                    axis="knowledge_record_trace",
                    state="unknown",
                    original_refs=_sorted_vals([rec_u["ref"], *rec_u["provenance_refs"]]),
                    reason="原KnowledgeRecordのoperational_stateが未供給またはnull。",
                    backflow_owner=raw_u["binding"]["knowledge_ref"]["owner"],
                )

        with self.subTest(case="P3a_duplicate_identical_records_vs_conflicting_records_and_slot_selection"):
            raw_dup = base_input(self.document)
            rec0 = copy.deepcopy(raw_dup["knowledge_records"][0])
            raw_dup["knowledge_records"].append(copy.deepcopy(rec0))
            _, res_dup = self._run_fn0_fn5(raw_dup)
            self._assert_axis_7(
                res_dup["axes"][0],
                subject_ref=raw_dup["binding"]["knowledge_ref"],
                binding=raw_dup["binding"],
                axis="knowledge_record_trace",
                state="resolved",
                original_refs=_sorted_vals([rec0["ref"], *rec0["provenance_refs"], rec0["ref"], *rec0["provenance_refs"]]),
                reason="同一immutable snapshotの原KnowledgeRecordを一意に辿れる。運用成立を意味しない。",
                backflow_owner=None,
            )
            raw_amb = base_input(self.document)
            rec_diff = copy.deepcopy(rec0)
            rec_diff["operational_state"] = {"source_state": "different-state"}
            raw_amb["knowledge_records"].append(rec_diff)
            _, res_amb = self._run_fn0_fn5(raw_amb)
            self._assert_axis_7(
                res_amb["axes"][0],
                subject_ref=raw_amb["binding"]["knowledge_ref"],
                binding=raw_amb["binding"],
                axis="knowledge_record_trace",
                state="unknown",
                original_refs=_sorted_vals([rec0["ref"], *rec0["provenance_refs"], rec_diff["ref"], *rec_diff["provenance_refs"]]),
                reason="同一knowledge Refの原KnowledgeRecordが未供給または一意でない。",
                backflow_owner=raw_amb["binding"]["knowledge_ref"]["owner"],
            )
            raw_slot = base_input(self.document)
            slot_cand = _ref_from(raw_slot["binding"]["template_ref"], "SYNTHETIC-SLOT-TEMPLATE-ONLY")
            raw_slot["candidates"] = [copy.deepcopy(slot_cand)]
            slot_b = copy.deepcopy(raw_slot["binding"])
            slot_b["template_ref"] = copy.deepcopy(slot_cand)
            slot_b["knowledge_ref"] = _ref_from(raw_slot["binding"]["knowledge_ref"], "SYNTHETIC-SLOT-KNOWLEDGE-UNMATCHED", owner="slot-knowledge-owner")
            raw_slot["descriptors"][0]["binding"] = copy.deepcopy(slot_b)
            _, res_slot = self._run_fn0_fn5(raw_slot)
            self.assertEqual(len(res_slot["axes"]), 1)
            self._assert_axis_7(
                res_slot["axes"][0],
                subject_ref=slot_b["knowledge_ref"],
                binding=slot_b,
                axis="knowledge_record_trace",
                state="unknown",
                original_refs=[],
                reason="同一knowledge Refの原KnowledgeRecordが未供給または一意でない。",
                backflow_owner="slot-knowledge-owner",
            )

    def test_f08_candidate_empty_finite_branch(self) -> None:
        raw = _make_valid_candidate_empty(self.document)
        with self.subTest(case="candidate_empty_claims_empty_and_absent"):
            _, res = self._run_fn0_fn5(raw)
            self.assertEqual((res["axes"], res["findings"]), ([], []))
            raw_no_cl = copy.deepcopy(raw)
            raw_no_cl.pop("claims", None)
            _, res_no_cl = self._run_fn0_fn5(raw_no_cl)
            self.assertEqual((res_no_cl["axes"], res_no_cl["findings"]), ([], []))

        with self.subTest(case="candidate_empty_with_declared_fill_definition_claim_and_ref_only_source"):
            raw_fill = copy.deepcopy(raw)
            target_ref = copy.deepcopy(raw_fill["sources"][0]["content"]["descriptor_targets"][0]["target_ref"])
            raw_fill["claims"] = [_make_claim(target_ref, raw_fill["sources"][0]["content"]["binding"], "fill_definition", proposed_value="supplied", basis_refs=[])]
            _add_promotion_semantic_source(
                raw_fill,
                identity="SYNTHETIC-F08-REF-ONLY-SRC",
                role="reference_only",
                raw_content_override={"binding": copy.deepcopy(raw_fill["binding"]), "reference_target": "t", "reference_context": "c"},
            )
            _, res_fill = self._run_fn0_fn5(raw_fill)
            self.assertEqual((res_fill["axes"], res_fill["findings"]), ([], []))

    def test_f08_neg01_rule80_generation_as_promotion_and_role_stage_contrasts(self) -> None:
        with self.subTest(case="HELIXBRAIN-L8-032-F08-NEG-01_and_P2-01_independent_7_and_9_fields"):
            raw = base_input(self.document)
            k_ref = raw["binding"]["knowledge_ref"]
            rec0 = raw["knowledge_records"][0]
            rec0["evaluation_scope"] = False
            rec0["evaluation_ref"] = None
            rec0["independent_verification_ref"] = None
            rec0["adoption_ref"] = None
            basis_ref = _ref_from(k_ref, "SYNTHETIC-F08-AI-GEN-SOURCE", sha256=None, source_locator="synthetic://synthetic-f08-ai-gen-source.json")
            claim0 = _make_claim(k_ref, raw["binding"], "knowledge_accepted", basis_refs=[basis_ref])
            rec0["provenance_refs"].append(copy.deepcopy(basis_ref))
            raw["claims"] = [copy.deepcopy(claim0)]
            carrier0 = _carrier_entry(0, claim0, 0, basis_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated"])
            src_ref = _add_promotion_semantic_source(raw, identity="SYNTHETIC-F08-AI-GEN-SOURCE", promotion_evidence=[carrier0])
            _, res = self._run_fn0_fn5(raw)

            expected_b_reads_joined = {
                "presence": "supplied",
                "occurrences": [{"basis_index": 0, "source_indices": [5], "carrier_locations": [{"source_index": 5, "carrier_index": 0}], "record_member_matches": [{"source_index": 5, "carrier_index": 0, "record_index": 0, "member": "provenance_refs", "member_index": 1}], "outcome": "joined"}],
            }
            expected_obs = [_obs("/knowledge_records/0", evaluation_scope="supplied", independent_verification_ref="null")]
            reason80 = _expected_reason("generation_as_promotion", "condition_true", 0, ["/knowledge_records/0"], expected_obs, expected_b_reads_joined)
            reason81 = _expected_reason("evaluation_scope_missing", "predicate_unknown", 0, ["/knowledge_records/0"], expected_obs, _not_req_reads(1))
            reason82 = _expected_reason("independent_verification_missing", "condition_true", 0, ["/knowledge_records/0"], expected_obs, _not_req_reads(1))

            rec_refs = _record_refs_from(rec0)
            orig_with_src = _sorted_vals([basis_ref, *rec_refs, src_ref])
            orig_no_src = _sorted_vals([basis_ref, *rec_refs])

            self.assertEqual(len(res["findings"]), 2)
            self._assert_finding_9(res["findings"][0], code="generation_as_promotion", rule_ref="HELIXBRAIN-L5-032-R-generation_as_promotion", subject_ref=k_ref, binding=raw["binding"], axis="promotion", state="unknown", source_refs=[src_ref], reason=reason80, backflow_owner="knowledge_owner")
            self._assert_finding_9(res["findings"][1], code="independent_verification_missing", rule_ref="HELIXBRAIN-L5-032-R-independent_verification_missing", subject_ref=k_ref, binding=raw["binding"], axis="promotion", state="unknown", source_refs=[], reason=reason82, backflow_owner="knowledge_owner")

            self.assertEqual(len(res["axes"]), 4)
            self._assert_axis_7(res["axes"][0], subject_ref=k_ref, binding=raw["binding"], axis="knowledge_record_trace", state="resolved", original_refs=rec_refs, reason="同一immutable snapshotの原KnowledgeRecordを一意に辿れる。運用成立を意味しない。", backflow_owner=None)
            self._assert_axis_7(res["axes"][1], subject_ref=k_ref, binding=raw["binding"], axis="promotion", state="unknown", original_refs=orig_with_src, reason=reason80, backflow_owner="knowledge_owner")
            self._assert_axis_7(res["axes"][2], subject_ref=k_ref, binding=raw["binding"], axis="promotion", state="unknown", original_refs=orig_no_src, reason=reason81, backflow_owner="knowledge_owner")
            self._assert_axis_7(res["axes"][3], subject_ref=k_ref, binding=raw["binding"], axis="promotion", state="unknown", original_refs=orig_no_src, reason=reason82, backflow_owner="knowledge_owner")

        with self.subTest(case="Rule80_false_for_all_three_role_to_stage_pairs_and_unknown_when_mismatched"):
            for role_lit, stage_mem in (("evaluation", "evaluation_ref"), ("independent_verification", "independent_verification_ref"), ("adoption_basis", "adoption_ref")):
                raw_f = base_input(self.document)
                k_ref = raw_f["binding"]["knowledge_ref"]
                s_ref = _ref_from(k_ref, f"SYNTHETIC-F08-STAGE-{role_lit}", sha256=None, source_locator=f"synthetic://synthetic-f08-stage-{role_lit.lower()}.json")
                raw_f["knowledge_records"][0][stage_mem] = copy.deepcopy(s_ref)
                raw_f["knowledge_records"][0]["evaluation_scope"] = {"covered": ["unit"]}
                cl_f = _make_claim(k_ref, raw_f["binding"], "knowledge_promoted", basis_refs=[s_ref])
                raw_f["claims"] = [copy.deepcopy(cl_f)]
                c_ent = _carrier_entry(0, cl_f, 0, s_ref, k_ref, stage_mem, original_evidence_set=[role_lit])
                _add_promotion_semantic_source(raw_f, identity=f"SYNTHETIC-F08-STAGE-{role_lit}", promotion_evidence=[c_ent])
                _, res_f = self._run_fn0_fn5(raw_f)
                self.assertEqual([json.loads(a["reason"])["code"] for a in res_f["axes"] if a["axis"] == "promotion"], ["independent_verification_missing"])

                raw_m = base_input(self.document)
                raw_m["knowledge_records"][0]["provenance_refs"].append(copy.deepcopy(s_ref))
                raw_m["knowledge_records"][0][stage_mem] = copy.deepcopy(s_ref)
                cl_m = _make_claim(k_ref, raw_m["binding"], "knowledge_promoted", basis_refs=[s_ref])
                raw_m["claims"] = [copy.deepcopy(cl_m)]
                c_m = _carrier_entry(0, cl_m, 0, s_ref, k_ref, "provenance_refs", original_evidence_set=[role_lit])
                _add_promotion_semantic_source(raw_m, identity=f"SYNTHETIC-F08-STAGE-{role_lit}", promotion_evidence=[c_m])
                _, res_m = self._run_fn0_fn5(raw_m)
                r80_m = next(a for a in res_m["axes"] if a["axis"] == "promotion" and json.loads(a["reason"])["code"] == "generation_as_promotion")
                self.assertEqual(json.loads(r80_m["reason"])["predicate"], "predicate_unknown")
                exp_findings = [] if stage_mem == "independent_verification_ref" else ["independent_verification_missing"]
                self.assertEqual([f["code"] for f in res_f["findings"]], exp_findings)
                self.assertEqual([a["axis"] for a in res_f["axes"]], ["knowledge_record_trace", "promotion", "promotion_claim"])

        with self.subTest(case="R2-M2_and_R2-m3_slot_binding_distinct_from_root_and_second_claim_locator"):
            raw_sb = base_input(self.document)
            k_ref = raw_sb["binding"]["knowledge_ref"]
            slot_bind = copy.deepcopy(raw_sb["descriptors"][0]["binding"])
            slot_bind["version_target"] = "slot-specific-version-target"
            raw_sb["descriptors"][0]["binding"] = copy.deepcopy(slot_bind)
            ai_ref = _ref_from(k_ref, "SYNTHETIC-F08-SLOT-BIND-AI", sha256=None, source_locator="synthetic://slot-bind-ai.json")
            raw_sb["knowledge_records"][0]["provenance_refs"].append(copy.deepcopy(ai_ref))
            cl0 = _make_claim(k_ref, raw_sb["binding"], "fill_definition", basis_refs=[raw_sb["sources"][0]["ref"]])
            cl1 = _make_claim(k_ref, slot_bind, "knowledge_accepted", basis_refs=[ai_ref])
            raw_sb["claims"] = [copy.deepcopy(cl0), copy.deepcopy(cl1)]
            c_sb = _carrier_entry(1, cl1, 0, ai_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated"])
            src_sb = _add_promotion_semantic_source(raw_sb, identity="SYNTHETIC-F08-SLOT-BIND-AI", promotion_evidence=[c_sb], binding=slot_bind)
            _, res_sb = self._run_fn0_fn5(raw_sb)
            self.assertEqual(res_sb["input_binding"], raw_sb["binding"])
            exp_b_sb = {"presence": "supplied", "occurrences": [{"basis_index": 0, "source_indices": [5], "carrier_locations": [{"source_index": 5, "carrier_index": 0}], "record_member_matches": [{"source_index": 5, "carrier_index": 0, "record_index": 0, "member": "provenance_refs", "member_index": 1}], "outcome": "joined"}]}
            exp_obs_sb = [_obs("/knowledge_records/0", evaluation_scope="null", independent_verification_ref="null")]
            exp_r80_sb = _expected_reason("generation_as_promotion", "condition_true", 1, ["/knowledge_records/0"], exp_obs_sb, exp_b_sb)
            rec_refs_sb = _record_refs_from(raw_sb["knowledge_records"][0])
            orig_refs_sb = _sorted_vals([ai_ref, *rec_refs_sb, src_sb])
            f80_sb = next(f for f in res_sb["findings"] if f["code"] == "generation_as_promotion")
            self._assert_finding_9(f80_sb, code="generation_as_promotion", rule_ref="HELIXBRAIN-L5-032-R-generation_as_promotion", subject_ref=k_ref, binding=slot_bind, axis="promotion", state="unknown", source_refs=[src_sb], reason=exp_r80_sb, backflow_owner="knowledge_owner")
            ax80_sb = next(a for a in res_sb["axes"] if a["axis"] == "promotion" and json.loads(a["reason"])["code"] == "generation_as_promotion")
            self._assert_axis_7(ax80_sb, subject_ref=k_ref, binding=slot_bind, axis="promotion", state="unknown", original_refs=orig_refs_sb, reason=exp_r80_sb, backflow_owner="knowledge_owner")

        with self.subTest(case="Rule80_true_blocked_when_any_stage_ref_nonnull_or_record_member_not_provenance"):
            for stage_mem in ("evaluation_ref", "independent_verification_ref", "adoption_ref"):
                raw_blk = base_input(self.document)
                k_ref = raw_blk["binding"]["knowledge_ref"]
                b_ref = _ref_from(k_ref, f"SYNTHETIC-F08-AI-BLK-{stage_mem}", sha256=None, source_locator=f"synthetic://synthetic-f08-ai-blk-{stage_mem.lower()}.json")
                raw_blk["knowledge_records"][0]["provenance_refs"].append(copy.deepcopy(b_ref))
                raw_blk["knowledge_records"][0][stage_mem] = _ref_from(k_ref, f"SYNTHETIC-STAGE-NONNULL-{stage_mem}")
                cl_b = _make_claim(k_ref, raw_blk["binding"], "knowledge_accepted", basis_refs=[b_ref])
                raw_blk["claims"] = [copy.deepcopy(cl_b)]
                _add_promotion_semantic_source(raw_blk, identity=f"SYNTHETIC-F08-AI-BLK-{stage_mem}", promotion_evidence=[_carrier_entry(0, cl_b, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated"])])
                _, res_blk = self._run_fn0_fn5(raw_blk)
                self.assertNotIn("generation_as_promotion", [f["code"] for f in res_blk["findings"]])
                r80_blk = next(a for a in res_blk["axes"] if a["axis"] == "promotion" and json.loads(a["reason"])["code"] == "generation_as_promotion")
                self.assertEqual(json.loads(r80_blk["reason"])["predicate"], "predicate_unknown")

            raw_lim_mem = base_input(self.document)
            k_ref = raw_lim_mem["binding"]["knowledge_ref"]
            b_lim = _ref_from(k_ref, "SYNTHETIC-F08-AI-ON-LIM", sha256=None, source_locator="synthetic://synthetic-f08-ai-on-lim.json")
            raw_lim_mem["knowledge_records"][0]["limited_adoption_ref"] = copy.deepcopy(b_lim)
            cl_lim = _make_claim(k_ref, raw_lim_mem["binding"], "knowledge_accepted", basis_refs=[b_lim])
            raw_lim_mem["claims"] = [copy.deepcopy(cl_lim)]
            _add_promotion_semantic_source(raw_lim_mem, identity="SYNTHETIC-F08-AI-ON-LIM", promotion_evidence=[_carrier_entry(0, cl_lim, 0, b_lim, k_ref, "limited_adoption_ref", original_evidence_set=["AI_generated"])])
            _, res_lim_mem = self._run_fn0_fn5(raw_lim_mem)
            self.assertNotIn("generation_as_promotion", [f["code"] for f in res_lim_mem["findings"]])

        with self.subTest(case="Rule80_core_join_and_role_array_and_multi_basis_negative_boundaries"):
            for mode in (
                "stages_supplied", "mixed_roles", "carrier_conflict", "unusable_source",
                "evset_absent", "evset_empty", "evset_not_list", "evset_non_str_elem", "evset_unknown_role",
                "claim_body_diff", "basis_ref_diff", "kref_not_ref", "kref_diff", "target_not_dict", "target_id_diff", "target_rev_diff", "target_scope_diff", "target_key_absent", "target_key_null",
                "record_member_unknown", "record_member_not_str", "carrier_missing_req_key", "carrier_not_dict",
                "source_role_ref_only", "source_content_binding_diff", "source_content_binding_not_dict", "promotion_evidence_not_list",
                "no_matching_carrier_entry", "basis_index_mismatch", "no_matching_source", "record_member_ref_not_in_record", "multi_basis_partial_join",
                "claim_index_bool", "basis_index_bool",
                "stages_supplied_with_eval_role", "evset_non_str_with_eval_role", "evset_unknown_role_with_eval_role",
            ):
                raw_u = base_input(self.document)
                k_ref = raw_u["binding"]["knowledge_ref"]
                ident = f"SYNTHETIC-F08-C-{mode}"
                b_ref = _ref_from(k_ref, ident, sha256=None, source_locator=f"synthetic://{ident.lower()}.json")
                if mode != "record_member_ref_not_in_record":
                    raw_u["knowledge_records"][0]["provenance_refs"].append(copy.deepcopy(b_ref))
                b_ref2 = _ref_from(k_ref, f"{ident}-2", sha256=None)
                b_list = [b_ref, b_ref2] if mode == "multi_basis_partial_join" else [b_ref]
                cl = _make_claim(k_ref, raw_u["binding"], "knowledge_accepted", basis_refs=b_list)
                raw_u["claims"] = [copy.deepcopy(cl)]
                base_c = _carrier_entry(0, cl, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated"])
                qualify_flag = (mode != "unusable_source")
                role_val = "reference_only" if mode == "source_role_ref_only" else "semantic_json"
                src_bind: object = "_DEFAULT_"
                pe_val: object = [base_c]

                if mode == "stages_supplied": pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated"], original_stages=None)]
                elif mode == "mixed_roles": pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated", "document_exists"])]
                elif mode == "carrier_conflict": pe_val = [base_c, _carrier_entry(0, cl, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=["proposal"])]
                elif mode == "evset_absent": pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "provenance_refs")]
                elif mode == "evset_empty": pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=[])]
                elif mode == "evset_not_list": pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "provenance_refs", original_evidence_set="AI_generated")]
                elif mode == "evset_non_str_elem": pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=[123])]
                elif mode == "evset_unknown_role": pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=["unknown_role"])]
                elif mode == "claim_body_diff":
                    cl_diff = copy.deepcopy(cl); cl_diff["proposed_value"] = "other"
                    pe_val = [_carrier_entry(0, cl_diff, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated"])]
                elif mode == "basis_ref_diff":
                    b_diff = copy.deepcopy(b_ref); b_diff["source_locator"] = "diff"
                    pe_val = [_carrier_entry(0, cl, 0, b_diff, k_ref, "provenance_refs", original_evidence_set=["AI_generated"])]
                elif mode == "kref_not_ref": pe_val = [_carrier_entry(0, cl, 0, b_ref, "not-a-ref", "provenance_refs", original_evidence_set=["AI_generated"])]
                elif mode == "kref_diff": pe_val = [_carrier_entry(0, cl, 0, b_ref, _ref_from(k_ref, "OTHER-K"), "provenance_refs", original_evidence_set=["AI_generated"])]
                elif mode == "target_not_dict": pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated"], target_override="bad")]
                elif mode == "target_id_diff": pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated"], target_override={"identity": "diff", "revision": k_ref["revision"], "scope": k_ref["scope"]})]
                elif mode == "target_rev_diff": pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated"], target_override={"identity": k_ref["identity"], "revision": "diff", "scope": k_ref["scope"]})]
                elif mode == "target_scope_diff": pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated"], target_override={"identity": k_ref["identity"], "revision": k_ref["revision"], "scope": {}})]
                elif mode == "target_key_absent": pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated"], target_override={"identity": k_ref["identity"], "revision": k_ref["revision"]})]
                elif mode == "target_key_null": pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated"], target_override={"identity": k_ref["identity"], "revision": None, "scope": k_ref["scope"]})]
                elif mode == "record_member_unknown": pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "unknown_member", original_evidence_set=["AI_generated"])]
                elif mode == "record_member_not_str": pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, 123, original_evidence_set=["AI_generated"])]
                elif mode == "carrier_missing_req_key": pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated"], omit_key="original_target")]
                elif mode == "carrier_not_dict": pe_val = ["not-a-dict", base_c]
                elif mode == "source_content_binding_diff":
                    b_diff2 = copy.deepcopy(raw_u["binding"]); b_diff2["version_target"] = "other-ver"
                    src_bind = b_diff2
                elif mode == "source_content_binding_not_dict": src_bind = "not-a-dict"
                elif mode == "promotion_evidence_not_list": pe_val = "not-a-list"
                elif mode == "no_matching_carrier_entry": pe_val = [_carrier_entry(99, cl, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated"])]
                elif mode == "basis_index_mismatch": pe_val = [_carrier_entry(0, cl, 99, b_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated"])]
                elif mode == "claim_index_bool": pe_val = [_carrier_entry(False, cl, 0, b_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated"])]
                elif mode == "basis_index_bool": pe_val = [_carrier_entry(0, cl, False, b_ref, k_ref, "provenance_refs", original_evidence_set=["AI_generated"])]
                elif mode == "stages_supplied_with_eval_role":
                    raw_u["knowledge_records"][0]["evaluation_ref"] = copy.deepcopy(b_ref)
                    pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "evaluation_ref", original_evidence_set=["evaluation"], original_stages=None)]
                elif mode == "evset_non_str_with_eval_role":
                    raw_u["knowledge_records"][0]["evaluation_ref"] = copy.deepcopy(b_ref)
                    pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "evaluation_ref", original_evidence_set=["evaluation", 123])]
                elif mode == "evset_unknown_role_with_eval_role":
                    raw_u["knowledge_records"][0]["evaluation_ref"] = copy.deepcopy(b_ref)
                    pe_val = [_carrier_entry(0, cl, 0, b_ref, k_ref, "evaluation_ref", original_evidence_set=["evaluation", "unknown_role"])]

                if mode != "no_matching_source":
                    _add_promotion_semantic_source(raw_u, identity=ident, promotion_evidence=pe_val, binding=src_bind, qualify=qualify_flag, role=role_val)
                _, res_u = self._run_fn0_fn5(raw_u)
                self.assertNotIn("generation_as_promotion", [f["code"] for f in res_u["findings"]], f"mode={mode}")
                r80_reason = json.loads(res_u["axes"][1]["reason"])
                self.assertEqual(r80_reason["code"], "generation_as_promotion")
                self.assertEqual(r80_reason["predicate"], "predicate_unknown", f"mode={mode}")
                if mode == "carrier_conflict":
                    self.assertEqual(r80_reason["basis_reads"]["occurrences"][0]["outcome"], "conflict")
                elif mode == "multi_basis_partial_join":
                    self.assertEqual([o["outcome"] for o in r80_reason["basis_reads"]["occurrences"]], ["joined", "unresolved"])
                elif mode in ("unusable_source", "claim_body_diff", "basis_ref_diff", "kref_not_ref", "kref_diff", "target_not_dict", "target_id_diff", "target_rev_diff", "target_scope_diff", "target_key_absent", "target_key_null", "record_member_unknown", "record_member_not_str", "carrier_missing_req_key", "carrier_not_dict", "source_role_ref_only", "source_content_binding_diff", "source_content_binding_not_dict", "promotion_evidence_not_list", "no_matching_carrier_entry", "basis_index_mismatch", "no_matching_source", "record_member_ref_not_in_record", "claim_index_bool", "basis_index_bool"):
                    self.assertEqual(r80_reason["basis_reads"]["occurrences"][0]["outcome"], "unresolved", f"mode={mode}")
                    if mode == "unusable_source":
                        self.assertEqual(r80_reason["basis_reads"]["occurrences"][0]["carrier_locations"], [{"source_index": 5, "carrier_index": 0}])

        with self.subTest(case="Association_unknown_and_multi_record_observations_and_unknown_claim_kind"):
            for assoc_mode in ("subject_binding_kref_mismatch", "binding_not_in_selected", "no_matching_record", "conflicting_records_and_observations", "duplicate_identical_records_observations", "unknown_claim_kind"):
                raw_a = base_input(self.document)
                k_ref = raw_a["binding"]["knowledge_ref"]
                b_ref = _ref_from(k_ref, f"SYNTHETIC-F08-ASSOC-{assoc_mode}")
                c_subj = copy.deepcopy(k_ref)
                c_bind = copy.deepcopy(raw_a["binding"])
                c_kind = "knowledge_accepted"
                if assoc_mode == "subject_binding_kref_mismatch":
                    c_subj = _ref_from(k_ref, "SYNTHETIC-OTHER-SUBJECT")
                    raw_a["knowledge_records"][0]["ref"] = copy.deepcopy(c_subj)
                elif assoc_mode == "binding_not_in_selected":
                    c_bind["version_target"] = "unselected-version"
                elif assoc_mode == "no_matching_record":
                    raw_a["knowledge_records"] = []
                elif assoc_mode == "conflicting_records_and_observations":
                    rec0 = raw_a["knowledge_records"][0]
                    rec0.pop("evaluation_scope", None)
                    rec0["evaluation_ref"] = None
                    rec0["independent_verification_ref"] = _ref_from(k_ref, "IND-1")
                    rec0.pop("limited_adoption_ref", None)
                    rec0["adoption_ref"] = _ref_from(k_ref, "ADOPT-1")
                    rec1 = copy.deepcopy(rec0)
                    rec1["evaluation_scope"] = "supplied-scope"
                    rec1.pop("evaluation_ref", None)
                    rec1["independent_verification_ref"] = None
                    rec1["limited_adoption_ref"] = _ref_from(k_ref, "LIM-1")
                    rec1["adoption_ref"] = None
                    raw_a["knowledge_records"].append(rec1)
                elif assoc_mode == "duplicate_identical_records_observations":
                    rec0 = raw_a["knowledge_records"][0]
                    rec0["limited_adoption_ref"] = _ref_from(k_ref, "LIM-DUP")
                    rec0["adoption_ref"] = _ref_from(k_ref, "ADOPT-DUP")
                    raw_a["knowledge_records"].append(copy.deepcopy(rec0))
                elif assoc_mode == "unknown_claim_kind":
                    c_kind = "unsupported_promotion_kind"

                cl_a = _make_claim(c_subj, c_bind, c_kind, basis_refs=[b_ref])
                raw_a["claims"] = [copy.deepcopy(cl_a)]
                _, res_a = self._run_fn0_fn5(raw_a)
                if assoc_mode == "duplicate_identical_records_observations":
                    r81_a = next(a for a in res_a["axes"] if a["axis"] == "promotion" and json.loads(a["reason"])["code"] == "evaluation_scope_missing")
                    parsed = json.loads(r81_a["reason"])
                    self.assertEqual(parsed["predicate"], "condition_true")
                    self.assertEqual(parsed["record_locators"], ["/knowledge_records/0", "/knowledge_records/1"])
                    self.assertEqual(len(parsed["observations"]), 2)
                    self.assertEqual(parsed["observations"][0]["limited_adoption_ref"], "supplied")
                    self.assertEqual(parsed["observations"][0]["adoption_ref"], "supplied")
                    r80_a = next(a for a in res_a["axes"] if a["axis"] == "promotion" and json.loads(a["reason"])["code"] == "generation_as_promotion")
                    self.assertEqual(json.loads(r80_a["reason"])["basis_reads"]["presence"], "supplied")
                else:
                    self.assertEqual(res_a["findings"], [], f"assoc_mode={assoc_mode}")
                    rule_axes = [a for a in res_a["axes"] if a["axis"] in ("promotion", "promotion_claim")]
                    self.assertEqual([json.loads(a["reason"])["code"] for a in rule_axes], ["generation_as_promotion", "evaluation_scope_missing", "independent_verification_missing", "limited_content_as_promotion"])
                    for ax in rule_axes:
                        parsed = json.loads(ax["reason"])
                        self.assertEqual(parsed["predicate"], "predicate_unknown")
                        self.assertEqual(parsed["basis_reads"], _not_req_reads(1))
                        if assoc_mode == "conflicting_records_and_observations":
                            self.assertEqual(parsed["record_locators"], ["/knowledge_records/0", "/knowledge_records/1"])
                            self.assertEqual(
                                parsed["observations"],
                                [
                                    _obs("/knowledge_records/0", evaluation_scope="absent", evaluation_ref="null", independent_verification_ref="supplied", limited_adoption_ref="absent", adoption_ref="supplied"),
                                    _obs("/knowledge_records/1", evaluation_scope="supplied", evaluation_ref="absent", independent_verification_ref="null", limited_adoption_ref="supplied", adoption_ref="null"),
                                ],
                            )

    def test_f08_neg02_rule81_and_neg03_rule82_and_scope_type_boundaries(self) -> None:
        with self.subTest(case="HELIXBRAIN-L8-032-F08-NEG-02_and_NEG-03_null_and_absent"):
            for pres_mode in ("null", "absent"):
                raw = base_input(self.document)
                k_ref = raw["binding"]["knowledge_ref"]
                rec0 = raw["knowledge_records"][0]
                if pres_mode == "null":
                    rec0["evaluation_scope"] = None
                    rec0["independent_verification_ref"] = None
                    cl_in = _make_claim(k_ref, raw["binding"], "knowledge_promoted", basis_refs=[])
                    b_reads_exp = {"presence": "empty", "occurrences": []}
                else:
                    rec0.pop("evaluation_scope", None)
                    rec0.pop("independent_verification_ref", None)
                    cl_in = _make_claim(k_ref, raw["binding"], "knowledge_promoted")
                    b_reads_exp = {"presence": "absent", "occurrences": []}
                raw["claims"] = [copy.deepcopy(cl_in)]
                _, res = self._run_fn0_fn5(raw)
                obs_exp = [_obs("/knowledge_records/0", evaluation_scope=pres_mode, independent_verification_ref=pres_mode)]
                r80_exp = _expected_reason("generation_as_promotion", "predicate_unknown", 0, ["/knowledge_records/0"], obs_exp, b_reads_exp)
                r81_exp = _expected_reason("evaluation_scope_missing", "condition_true", 0, ["/knowledge_records/0"], obs_exp, b_reads_exp)
                r82_exp = _expected_reason("independent_verification_missing", "condition_true", 0, ["/knowledge_records/0"], obs_exp, b_reads_exp)
                r83_exp = _expected_reason("limited_content_as_promotion", "predicate_unknown", 0, ["/knowledge_records/0"], obs_exp, b_reads_exp)
                rec_refs = _record_refs_from(rec0)

                self.assertEqual(len(res["findings"]), 2)
                self._assert_finding_9(res["findings"][0], code="evaluation_scope_missing", rule_ref="HELIXBRAIN-L5-032-R-evaluation_scope_missing", subject_ref=k_ref, binding=raw["binding"], axis="promotion", state="unknown", source_refs=[], reason=r81_exp, backflow_owner="knowledge_owner")
                self._assert_finding_9(res["findings"][1], code="independent_verification_missing", rule_ref="HELIXBRAIN-L5-032-R-independent_verification_missing", subject_ref=k_ref, binding=raw["binding"], axis="promotion", state="unknown", source_refs=[], reason=r82_exp, backflow_owner="knowledge_owner")

                self.assertEqual(len(res["axes"]), 5)
                self._assert_axis_7(res["axes"][1], subject_ref=k_ref, binding=raw["binding"], axis="promotion", state="unknown", original_refs=rec_refs, reason=r80_exp, backflow_owner="knowledge_owner")
                self._assert_axis_7(res["axes"][2], subject_ref=k_ref, binding=raw["binding"], axis="promotion", state="unknown", original_refs=rec_refs, reason=r81_exp, backflow_owner="knowledge_owner")
                self._assert_axis_7(res["axes"][3], subject_ref=k_ref, binding=raw["binding"], axis="promotion", state="unknown", original_refs=rec_refs, reason=r82_exp, backflow_owner="knowledge_owner")
                self._assert_axis_7(res["axes"][4], subject_ref=k_ref, binding=raw["binding"], axis="promotion_claim", state="unknown", original_refs=rec_refs, reason=r83_exp, backflow_owner="knowledge_owner")

        with self.subTest(case="Rule81_empty_falsy_scopes_are_unknown_and_nonempty_true_one_are_false_and_Rule82_nonnull_is_unknown"):
            for unknown_scope in ("", False, 0, 0.0, [], {}):
                raw_unk = base_input(self.document)
                k_ref = raw_unk["binding"]["knowledge_ref"]
                raw_unk["knowledge_records"][0]["evaluation_scope"] = copy.deepcopy(unknown_scope)
                raw_unk["knowledge_records"][0]["independent_verification_ref"] = _ref_from(k_ref, "SYNTHETIC-IND-SUPPLIED")
                raw_unk["claims"] = [_make_claim(k_ref, raw_unk["binding"], "knowledge_promoted")]
                _, res_unk = self._run_fn0_fn5(raw_unk)
                self.assertEqual(res_unk["findings"], [])
                obs_u = [_obs("/knowledge_records/0", evaluation_scope="supplied", independent_verification_ref="supplied")]
                b_abs = {"presence": "absent", "occurrences": []}
                r81_u_exp = _expected_reason("evaluation_scope_missing", "predicate_unknown", 0, ["/knowledge_records/0"], obs_u, b_abs)
                r82_u_exp = _expected_reason("independent_verification_missing", "predicate_unknown", 0, ["/knowledge_records/0"], obs_u, b_abs)
                rec_refs_u = _record_refs_from(raw_unk["knowledge_records"][0])
                self._assert_axis_7(res_unk["axes"][2], subject_ref=k_ref, binding=raw_unk["binding"], axis="promotion", state="unknown", original_refs=rec_refs_u, reason=r81_u_exp, backflow_owner="knowledge_owner")
                self._assert_axis_7(res_unk["axes"][3], subject_ref=k_ref, binding=raw_unk["binding"], axis="promotion", state="unknown", original_refs=rec_refs_u, reason=r82_u_exp, backflow_owner="knowledge_owner")

            for false_scope in ("scope-v1", " ", True, 1, 1.0, -1, ["x"], {"k": 1}):
                raw_fls = base_input(self.document)
                k_ref = raw_fls["binding"]["knowledge_ref"]
                raw_fls["knowledge_records"][0]["evaluation_scope"] = copy.deepcopy(false_scope)
                raw_fls["claims"] = [_make_claim(k_ref, raw_fls["binding"], "knowledge_promoted")]
                _, res_fls = self._run_fn0_fn5(raw_fls)
                self.assertEqual([a for a in res_fls["axes"] if a["axis"] == "promotion" and json.loads(a["reason"])["code"] == "evaluation_scope_missing"], [])

    def test_f08_neg04_rule83_limited_content_as_promotion_and_pr1_vocabulary_alignment(self) -> None:
        with self.subTest(case="HELIXBRAIN-L8-032-F08-NEG-04_limited_content_as_promotion_conflict_independent_fields"):
            for adopt_mode in ("null", "absent"):
                raw = base_input(self.document)
                k_ref = raw["binding"]["knowledge_ref"]
                lim_ref = _ref_from(k_ref, "SYNTHETIC-F08-MSGCONTENT-LIMITED-01", sha256=None, source_locator="synthetic://synthetic-f08-msgcontent-limited-01.json")
                raw["knowledge_records"][0]["limited_adoption_ref"] = copy.deepcopy(lim_ref)
                if adopt_mode == "null":
                    raw["knowledge_records"][0]["adoption_ref"] = None
                else:
                    raw["knowledge_records"][0].pop("adoption_ref", None)
                claim83 = _make_claim(k_ref, raw["binding"], "knowledge_accepted", basis_refs=[lim_ref])
                raw["claims"] = [copy.deepcopy(claim83)]
                c83 = _carrier_entry(0, claim83, 0, lim_ref, k_ref, "limited_adoption_ref", original_evidence_set=["proposal"])
                src_ref = _add_promotion_semantic_source(raw, identity="SYNTHETIC-F08-MSGCONTENT-LIMITED-01", promotion_evidence=[c83])
                _, res = self._run_fn0_fn5(raw)

                exp_b_reads83 = {
                    "presence": "supplied",
                    "occurrences": [{"basis_index": 0, "source_indices": [5], "carrier_locations": [{"source_index": 5, "carrier_index": 0}], "record_member_matches": [{"source_index": 5, "carrier_index": 0, "record_index": 0, "member": "limited_adoption_ref", "member_index": None}], "outcome": "joined"}],
                }
                exp_obs83 = [_obs("/knowledge_records/0", evaluation_scope="null", independent_verification_ref="null", limited_adoption_ref="supplied", adoption_ref=adopt_mode)]
                exp_reason83 = _expected_reason("limited_content_as_promotion", "condition_true", 0, ["/knowledge_records/0"], exp_obs83, exp_b_reads83)
                rec_refs83 = _record_refs_from(raw["knowledge_records"][0])
                orig_refs83 = _sorted_vals([lim_ref, *rec_refs83, src_ref])

                r83_findings = [f for f in res["findings"] if f["code"] == "limited_content_as_promotion"]
                self.assertEqual(len(r83_findings), 1)
                self._assert_finding_9(r83_findings[0], code="limited_content_as_promotion", rule_ref="HELIXBRAIN-L5-032-R-limited_content_as_promotion", subject_ref=k_ref, binding=raw["binding"], axis="promotion_claim", state="conflict", source_refs=[src_ref], reason=exp_reason83, backflow_owner="knowledge_owner")
                ax83 = [a for a in res["axes"] if a["axis"] == "promotion_claim"]
                self.assertEqual(len(ax83), 1)
                self._assert_axis_7(ax83[0], subject_ref=k_ref, binding=raw["binding"], axis="promotion_claim", state="conflict", original_refs=orig_refs83, reason=exp_reason83, backflow_owner="knowledge_owner")

        with self.subTest(case="HELIXBRAIN-L8-032-F08-PR1-VOCABULARY-ALIGNMENT_and_fill_definition"):
            raw_prom = base_input(self.document)
            k_ref = raw_prom["binding"]["knowledge_ref"]
            lim_ref = _ref_from(k_ref, "SYNTHETIC-F08-LIM-PROM", sha256=None, source_locator="synthetic://synthetic-f08-lim-prom.json")
            raw_prom["knowledge_records"][0]["limited_adoption_ref"] = copy.deepcopy(lim_ref)
            cl_prom = _make_claim(k_ref, raw_prom["binding"], "knowledge_promoted", basis_refs=[lim_ref])
            raw_prom["claims"] = [copy.deepcopy(cl_prom)]
            _add_promotion_semantic_source(raw_prom, identity="SYNTHETIC-F08-LIM-PROM", promotion_evidence=[_carrier_entry(0, cl_prom, 0, lim_ref, k_ref, "limited_adoption_ref", original_evidence_set=["proposal"])])
            _, res_prom = self._run_fn0_fn5(raw_prom)
            self.assertNotIn("limited_content_as_promotion", [f["code"] for f in res_prom["findings"]])
            ax_prom83 = [a for a in res_prom["axes"] if a["axis"] == "promotion_claim"]
            self.assertEqual(len(ax_prom83), 1)
            exp_obs_p = [_obs("/knowledge_records/0", evaluation_scope="null", independent_verification_ref="null", limited_adoption_ref="supplied")]
            exp_r_prom83 = _expected_reason("limited_content_as_promotion", "predicate_unknown", 0, ["/knowledge_records/0"], exp_obs_p, _not_req_reads(1))
            rec_refs_p = _record_refs_from(raw_prom["knowledge_records"][0])
            self._assert_axis_7(ax_prom83[0], subject_ref=k_ref, binding=raw_prom["binding"], axis="promotion_claim", state="unknown", original_refs=_sorted_vals([lim_ref, *rec_refs_p]), reason=exp_r_prom83, backflow_owner="knowledge_owner")

            raw_fill = base_input(self.document)
            raw_fill["claims"] = [_make_claim(raw_fill["binding"]["knowledge_ref"], raw_fill["binding"], "fill_definition", basis_refs=[raw_fill["sources"][0]["ref"]])]
            _, res_fill = self._run_fn0_fn5(raw_fill)
            self.assertEqual(len(res_fill["axes"]), 1)
            self.assertEqual(res_fill["axes"][0]["axis"], "knowledge_record_trace")
            self.assertEqual(res_fill["findings"], [])

        with self.subTest(case="Rule83_false_when_nonlimited_and_lim_null_or_absent_or_distinct_identity"):
            for false_mode in ("lim_null", "lim_absent", "lim_distinct_id_multi_basis"):
                raw_fls = base_input(self.document)
                k_ref = raw_fls["binding"]["knowledge_ref"]
                if false_mode == "lim_null":
                    raw_fls["knowledge_records"][0]["limited_adoption_ref"] = None
                elif false_mode == "lim_absent":
                    raw_fls["knowledge_records"][0].pop("limited_adoption_ref", None)
                else:
                    raw_fls["knowledge_records"][0]["limited_adoption_ref"] = _ref_from(k_ref, "SYNTHETIC-F08-LIM-ID-A", sha256=None)
                b1 = _ref_from(k_ref, "SYNTHETIC-F08-PROV-ID-B1", sha256=None, source_locator="synthetic://synthetic-f08-prov-id-b1.json")
                b2 = _ref_from(k_ref, "SYNTHETIC-F08-PROV-ID-B2", sha256=None, source_locator="synthetic://synthetic-f08-prov-id-b2.json")
                raw_fls["knowledge_records"][0]["provenance_refs"].extend([copy.deepcopy(b1), copy.deepcopy(b2)])
                cl_fls = _make_claim(k_ref, raw_fls["binding"], "knowledge_accepted", basis_refs=[b1, b2])
                raw_fls["claims"] = [copy.deepcopy(cl_fls)]
                _add_promotion_semantic_source(raw_fls, identity="SYNTHETIC-F08-PROV-ID-B1", promotion_evidence=[_carrier_entry(0, cl_fls, 0, b1, k_ref, "provenance_refs", original_evidence_set=["proposal"])])
                _add_promotion_semantic_source(raw_fls, identity="SYNTHETIC-F08-PROV-ID-B2", promotion_evidence=[_carrier_entry(0, cl_fls, 1, b2, k_ref, "provenance_refs", original_evidence_set=["proposal"])])
                _, res_fls = self._run_fn0_fn5(raw_fls)
                self.assertEqual([a for a in res_fls["axes"] if a["axis"] == "promotion_claim"], [], f"false_mode={false_mode}")

        with self.subTest(case="Rule83_unknown_boundaries_adoption_nonnull_dual_membership_partial_ref_same_id_diff_rev_scope_owner_sha_multi_basis"):
            for u83_mode in (
                "adoption_ref_nonnull_blocks_true",
                "dual_membership_nonlimited_carrier",
                "same_id_diff_revision",
                "same_id_diff_scope",
                "same_id_diff_owner",
                "same_id_diff_sha256",
                "partial_limited_ref_owner_null",
                "partial_basis_ref_owner_null",
                "multi_basis_one_equal_one_distinct_lim",
                "multi_basis_mixed_limited_and_nonlimited_carrier",
                "multi_basis_partial_join",
                "basis_empty",
            ):
                raw_u83 = base_input(self.document)
                k_ref = raw_u83["binding"]["knowledge_ref"]
                rec = raw_u83["knowledge_records"][0]
                b1 = _ref_from(k_ref, f"SYNTHETIC-F08-U83-{u83_mode}-1", sha256=None, source_locator=f"synthetic://u83-{u83_mode.lower()}-1.json")
                b2 = _ref_from(k_ref, f"SYNTHETIC-F08-U83-{u83_mode}-2", sha256=None, source_locator=f"synthetic://u83-{u83_mode.lower()}-2.json")

                if u83_mode == "basis_empty":
                    cl_u = _make_claim(k_ref, raw_u83["binding"], "knowledge_accepted", basis_refs=[])
                    raw_u83["claims"] = [copy.deepcopy(cl_u)]
                elif u83_mode == "adoption_ref_nonnull_blocks_true":
                    rec["limited_adoption_ref"] = copy.deepcopy(b1)
                    rec["adoption_ref"] = _ref_from(k_ref, "ADOPT-NONNULL")
                    cl_u = _make_claim(k_ref, raw_u83["binding"], "knowledge_accepted", basis_refs=[b1])
                    raw_u83["claims"] = [copy.deepcopy(cl_u)]
                    _add_promotion_semantic_source(raw_u83, identity=b1["identity"], promotion_evidence=[_carrier_entry(0, cl_u, 0, b1, k_ref, "limited_adoption_ref", original_evidence_set=["proposal"])])
                elif u83_mode == "dual_membership_nonlimited_carrier":
                    rec["limited_adoption_ref"] = copy.deepcopy(b1)
                    rec["provenance_refs"].append(copy.deepcopy(b1))
                    cl_u = _make_claim(k_ref, raw_u83["binding"], "knowledge_accepted", basis_refs=[b1])
                    raw_u83["claims"] = [copy.deepcopy(cl_u)]
                    _add_promotion_semantic_source(raw_u83, identity=b1["identity"], promotion_evidence=[_carrier_entry(0, cl_u, 0, b1, k_ref, "provenance_refs", original_evidence_set=["proposal"])])
                elif u83_mode in ("same_id_diff_revision", "same_id_diff_scope", "same_id_diff_owner", "same_id_diff_sha256"):
                    if u83_mode == "same_id_diff_revision":
                        rec["limited_adoption_ref"] = _ref_from(b1, b1["identity"], revision="other-rev")
                    elif u83_mode == "same_id_diff_scope":
                        rec["limited_adoption_ref"] = _ref_from(b1, b1["identity"], scope={"env": "other"})
                    elif u83_mode == "same_id_diff_owner":
                        rec["limited_adoption_ref"] = _ref_from(b1, b1["identity"], owner="other-owner")
                    else:
                        rec["limited_adoption_ref"] = _ref_from(b1, b1["identity"], sha256="0" * 64)
                    rec["provenance_refs"].append(copy.deepcopy(b1))
                    cl_u = _make_claim(k_ref, raw_u83["binding"], "knowledge_accepted", basis_refs=[b1])
                    raw_u83["claims"] = [copy.deepcopy(cl_u)]
                    _add_promotion_semantic_source(raw_u83, identity=b1["identity"], promotion_evidence=[_carrier_entry(0, cl_u, 0, b1, k_ref, "provenance_refs", original_evidence_set=["proposal"])])
                elif u83_mode == "partial_limited_ref_owner_null":
                    rec["limited_adoption_ref"] = _ref_from(k_ref, "SYNTHETIC-PARTIAL-LIM", owner=None)
                    rec["provenance_refs"].append(copy.deepcopy(b1))
                    cl_u = _make_claim(k_ref, raw_u83["binding"], "knowledge_accepted", basis_refs=[b1])
                    raw_u83["claims"] = [copy.deepcopy(cl_u)]
                    _add_promotion_semantic_source(raw_u83, identity=b1["identity"], promotion_evidence=[_carrier_entry(0, cl_u, 0, b1, k_ref, "provenance_refs", original_evidence_set=["proposal"])])
                elif u83_mode == "partial_basis_ref_owner_null":
                    b_part = _ref_from(k_ref, b1["identity"], owner=None)
                    rec["limited_adoption_ref"] = _ref_from(k_ref, "SYNTHETIC-OTHER-LIM")
                    rec["provenance_refs"].append(copy.deepcopy(b1))
                    cl_u = _make_claim(k_ref, raw_u83["binding"], "knowledge_accepted", basis_refs=[b_part])
                    raw_u83["claims"] = [copy.deepcopy(cl_u)]
                    _add_promotion_semantic_source(raw_u83, identity=b1["identity"], promotion_evidence=[_carrier_entry(0, cl_u, 0, b_part, k_ref, "provenance_refs", original_evidence_set=["proposal"])])
                elif u83_mode == "multi_basis_one_equal_one_distinct_lim":
                    rec["limited_adoption_ref"] = copy.deepcopy(b1)
                    rec["provenance_refs"].extend([copy.deepcopy(b1), copy.deepcopy(b2)])
                    cl_u = _make_claim(k_ref, raw_u83["binding"], "knowledge_accepted", basis_refs=[b1, b2])
                    raw_u83["claims"] = [copy.deepcopy(cl_u)]
                    _add_promotion_semantic_source(raw_u83, identity=b1["identity"], promotion_evidence=[_carrier_entry(0, cl_u, 0, b1, k_ref, "provenance_refs", original_evidence_set=["proposal"])])
                    _add_promotion_semantic_source(raw_u83, identity=b2["identity"], promotion_evidence=[_carrier_entry(0, cl_u, 1, b2, k_ref, "provenance_refs", original_evidence_set=["proposal"])])
                elif u83_mode == "multi_basis_mixed_limited_and_nonlimited_carrier":
                    rec["limited_adoption_ref"] = copy.deepcopy(b1)
                    rec["provenance_refs"].append(copy.deepcopy(b1))
                    cl_u = _make_claim(k_ref, raw_u83["binding"], "knowledge_accepted", basis_refs=[b1, b1])
                    raw_u83["claims"] = [copy.deepcopy(cl_u)]
                    _add_promotion_semantic_source(
                        raw_u83,
                        identity=b1["identity"],
                        promotion_evidence=[
                            _carrier_entry(0, cl_u, 0, b1, k_ref, "limited_adoption_ref", original_evidence_set=["proposal"]),
                            _carrier_entry(0, cl_u, 1, b1, k_ref, "provenance_refs", original_evidence_set=["proposal"]),
                        ],
                    )
                elif u83_mode == "multi_basis_partial_join":
                    rec["limited_adoption_ref"] = copy.deepcopy(b1)
                    rec["adoption_ref"] = None
                    cl_u = _make_claim(k_ref, raw_u83["binding"], "knowledge_accepted", basis_refs=[b1, b1])
                    raw_u83["claims"] = [copy.deepcopy(cl_u)]
                    _add_promotion_semantic_source(
                        raw_u83,
                        identity=b1["identity"],
                        promotion_evidence=[
                            _carrier_entry(0, cl_u, 0, b1, k_ref, "limited_adoption_ref", original_evidence_set=["proposal"]),
                        ],
                    )

                _, res_u83 = self._run_fn0_fn5(raw_u83)
                self.assertNotIn("limited_content_as_promotion", [f["code"] for f in res_u83["findings"]], f"u83_mode={u83_mode}")
                ax_u83 = [a for a in res_u83["axes"] if a["axis"] == "promotion_claim"]
                self.assertEqual(len(ax_u83), 1, f"u83_mode={u83_mode}")
                self.assertEqual(ax_u83[0]["state"], "unknown", f"u83_mode={u83_mode}")
                self.assertEqual(json.loads(ax_u83[0]["reason"])["predicate"], "predicate_unknown", f"u83_mode={u83_mode}")

    def test_f08_unclosed_branches_stop_with_tagged_not_implemented_error(self) -> None:
        expected_l7_tags = {entry.split(":", 1)[0] for entry in self.l7_doc["partial_oracle_and_stop_boundary"]["unclosed_stop_branches"]}
        tested_tags: set[str] = set()

        def assert_stops(raw_in: dict, expected_tag: str, mutate_validated_fn=None) -> None:
            tested_tags.add(expected_tag)
            validated = validate_supply_input(raw_in)
            if mutate_validated_fn is not None:
                mutate_validated_fn(validated)
            snap = copy.deepcopy(validated)
            with self.assertRaises(NotImplementedError) as cm:
                compare_knowledge_promotion({"validated": validated})
            self.assertEqual(validated, snap)
            msg = str(cm.exception)
            self.assertIn(expected_tag, msg)
            self.assertIn(F08_BACKFLOW_ID, msg)

        tag_ctx = "F08/context_or_input_shape"
        tested_tags.add(tag_ctx)
        for bad_ctx in (
            "not-a-dict",
            {},
            {"validated": None},
            {"validated": {}, "extra": 1},
            {"validated": {"input": {}, "input_issues": []}},
            {"validated": {"input": "bad", "input_issues": [], "unusable_source_refs": []}},
            {"validated": {"input": {}, "input_issues": "bad", "unusable_source_refs": []}},
            {"validated": {"input": {}, "input_issues": [], "unusable_source_refs": "bad"}},
        ):
            with self.subTest(branch=tag_ctx, bad_ctx=str(bad_ctx)):
                with self.assertRaises(NotImplementedError) as cm:
                    compare_knowledge_promotion(bad_ctx)  # type: ignore[arg-type]
                self.assertIn(tag_ctx, str(cm.exception))
                self.assertIn(F08_BACKFLOW_ID, str(cm.exception))

        for case_name, mut_fn in (
            ("candidates_absent", lambda v: v["input"].pop("candidates", None)),
            ("candidates_null", lambda v: v["input"].__setitem__("candidates", None)),
            ("candidates_not_list", lambda v: v["input"].__setitem__("candidates", 123)),
            ("candidate_elem_not_ref", lambda v: v["input"]["candidates"].append("not-a-ref")),
            ("binding_absent", lambda v: v["input"].pop("binding", None)),
            ("binding_not_shape", lambda v: v["input"].__setitem__("binding", {})),
            ("claims_not_list", lambda v: v["input"].__setitem__("claims", 123)),
            ("R1-M1_sources_none", lambda v: v["input"].__setitem__("sources", None)),
            ("R1-M1_sources_str", lambda v: v["input"].__setitem__("sources", "not-a-list")),
            ("R1-M1_sources_int", lambda v: v["input"].__setitem__("sources", 123)),
            ("R1-M1_sources_str_when_candidates_empty", lambda v: (v["input"].__setitem__("candidates", []), v["input"].__setitem__("sources", "not-a-list"))),
        ):
            with self.subTest(branch=tag_ctx, case=case_name):
                assert_stops(base_input(self.document), tag_ctx, mutate_validated_fn=mut_fn)

        tag_rec = "F08/record_or_descriptor_carrier_shape"
        for case_name, mut_fn in (
            ("descriptors_not_list_int", lambda v: v["input"].__setitem__("descriptors", 123)),
            ("descriptor_slot_not_dict", lambda v: v["input"]["descriptors"].append("bad-slot")),
            ("descriptor_slot_binding_invalid", lambda v: v["input"]["descriptors"][0].__setitem__("binding", {})),
            ("knowledge_records_not_list_int", lambda v: v["input"].__setitem__("knowledge_records", 123)),
            ("record_not_dict", lambda v: v["input"]["knowledge_records"].append("bad")),
            ("record_ref_absent", lambda v: v["input"]["knowledge_records"][0].pop("ref", None)),
            ("record_ref_null", lambda v: v["input"]["knowledge_records"][0].__setitem__("ref", None)),
            ("provenance_refs_not_list_int", lambda v: v["input"]["knowledge_records"][0].__setitem__("provenance_refs", 123)),
            ("provenance_refs_elem_not_ref", lambda v: v["input"]["knowledge_records"][0]["provenance_refs"].append("bad-ref")),
            ("evaluation_ref_not_ref", lambda v: v["input"]["knowledge_records"][0].__setitem__("evaluation_ref", "bad-ref")),
            ("independent_verification_ref_not_ref", lambda v: v["input"]["knowledge_records"][0].__setitem__("independent_verification_ref", 123)),
            ("limited_adoption_ref_not_ref", lambda v: v["input"]["knowledge_records"][0].__setitem__("limited_adoption_ref", "bad-ref")),
            ("adoption_ref_not_ref", lambda v: v["input"]["knowledge_records"][0].__setitem__("adoption_ref", 123)),
            ("os_registration_ref_not_ref", lambda v: v["input"]["knowledge_records"][0].__setitem__("os_registration_ref", "bad-ref")),
        ):
            with self.subTest(branch=tag_rec, case=case_name):
                assert_stops(base_input(self.document), tag_rec, mutate_validated_fn=mut_fn)

        tag_empty = "F08/candidate_empty_outside_finite_domain"
        for case_name, mut_fn in (
            ("R1-M3_dependencies_none", lambda v: v["input"].__setitem__("dependencies", None)),
            ("R1-M3_dependencies_empty_dict", lambda v: v["input"].__setitem__("dependencies", {})),
            ("dependencies_nonempty", lambda v: v["input"].__setitem__("dependencies", copy.deepcopy(base_input(self.document)["dependencies"]))),
            ("other_collection_nonempty", lambda v: v["input"].__setitem__("relations", [{}])),
            ("other_collection_null", lambda v: v["input"].__setitem__("values", None)),
            ("knowledge_record_stage_key_present", lambda v: v["input"]["knowledge_records"][0].__setitem__("operational_state", None)),
            ("descriptor_slot_unknown_kind", lambda v: v["input"]["descriptors"][0].__setitem__("descriptor_kind", "unknown-kind")),
            ("descriptor_slot_missing_kind", lambda v: v["input"]["descriptors"][0].pop("descriptor_kind", None)),
            ("source_not_dict", lambda v: v["input"]["sources"].append("bad-source")),
            ("source_content_not_dict", lambda v: v["input"]["sources"][0].__setitem__("content", "bad")),
            ("source_role_derived_view", lambda v: v["input"]["sources"][0].__setitem__("role", "derived_view")),
            ("semantic_json_disallowed_key", lambda v: v["input"]["sources"][0]["content"].__setitem__("extra_key", 1)),
            ("reference_only_disallowed_key", lambda v: (v["input"]["sources"][0].__setitem__("role", "reference_only"), v["input"]["sources"][0].__setitem__("content", {"binding": v["input"]["binding"], "extra": 1}))),
            ("R1-M2_descriptor_facts_null", lambda v: v["input"]["sources"][0]["content"].__setitem__("descriptor_facts", None)),
            ("R1-M2_descriptor_facts_int", lambda v: v["input"]["sources"][0]["content"].__setitem__("descriptor_facts", 123)),
            ("descriptor_facts_elem_not_dict", lambda v: v["input"]["sources"][0]["content"].__setitem__("descriptor_facts", ["bad"])),
            ("descriptor_facts_elem_bad_kind", lambda v: v["input"]["sources"][0]["content"].__setitem__("descriptor_facts", [{"descriptor_kind": "bad"}])),
            ("R1-M2_definition_meaning_ops_null", lambda v: v["input"]["sources"][0]["content"].__setitem__("definition_meaning_operations", None)),
            ("R1-M2_definition_meaning_ops_int", lambda v: v["input"]["sources"][0]["content"].__setitem__("definition_meaning_operations", 123)),
            ("definition_meaning_ops_elem_not_dict", lambda v: v["input"]["sources"][0]["content"].__setitem__("definition_meaning_operations", ["bad"])),
            ("definition_meaning_ops_args_none", lambda v: v["input"]["sources"][0]["content"].__setitem__("definition_meaning_operations", [{"arguments": None}])),
            ("definition_meaning_ops_args_int", lambda v: v["input"]["sources"][0]["content"].__setitem__("definition_meaning_operations", [{"arguments": 1}])),
            ("definition_meaning_ops_elem_bad_kind", lambda v: v["input"]["sources"][0]["content"].__setitem__("definition_meaning_operations", [{"arguments": {"descriptor_kind": "bad"}}])),
            ("R1-M2_descriptor_targets_null", lambda v: v["input"]["sources"][0]["content"].__setitem__("descriptor_targets", None)),
            ("R1-M2_descriptor_targets_int", lambda v: v["input"]["sources"][0]["content"].__setitem__("descriptor_targets", 123)),
            ("descriptor_targets_elem_not_dict", lambda v: v["input"]["sources"][0]["content"].__setitem__("descriptor_targets", ["bad"])),
            ("descriptor_targets_elem_bad_kind", lambda v: v["input"]["sources"][0]["content"].__setitem__("descriptor_targets", [{"descriptor_kind": "bad"}])),
            ("claim_not_fill_definition_with_declared_target", lambda v: v["input"].__setitem__("claims", [_make_claim(v["input"]["sources"][0]["content"]["descriptor_targets"][0]["target_ref"], v["input"]["sources"][0]["content"]["binding"], "knowledge_accepted")])),
            ("fill_definition_subject_undeclared", lambda v: v["input"].__setitem__("claims", [_make_claim(v["input"]["binding"]["knowledge_ref"], v["input"]["binding"], "fill_definition")])),
            ("fill_definition_binding_mismatch", lambda v: v["input"].__setitem__("claims", [_make_claim(v["input"]["sources"][0]["content"]["descriptor_targets"][0]["target_ref"], {**copy.deepcopy(v["input"]["binding"]), "version_target": "diff"}, "fill_definition")])),
        ):
            with self.subTest(branch=tag_empty, case=case_name):
                assert_stops(_make_valid_candidate_empty(self.document), tag_empty, mutate_validated_fn=mut_fn)

        tag_claim = "F08/claim_witness_formation"
        for case_name, mut_fn in (
            ("claim_not_dict", lambda v: v["input"].__setitem__("claims", ["bad"])),
            ("subject_ref_not_ref", lambda v: v["input"].__setitem__("claims", [_make_claim("bad", v["input"]["binding"], "knowledge_accepted")])),  # type: ignore[arg-type]
            ("subject_ref_identity_null", lambda v: v["input"].__setitem__("claims", [_make_claim(_ref_from(v["input"]["binding"]["knowledge_ref"], None), v["input"]["binding"], "knowledge_accepted")])),
            ("subject_ref_revision_null", lambda v: v["input"].__setitem__("claims", [_make_claim(_ref_from(v["input"]["binding"]["knowledge_ref"], "ID-1", revision=None), v["input"]["binding"], "knowledge_accepted")])),
            ("subject_ref_owner_null", lambda v: v["input"].__setitem__("claims", [_make_claim(_ref_from(v["input"]["binding"]["knowledge_ref"], "ID-1", owner=None), v["input"]["binding"], "knowledge_accepted")])),
            ("subject_ref_scope_null", lambda v: v["input"].__setitem__("claims", [_make_claim(_ref_from(v["input"]["binding"]["knowledge_ref"], "ID-1", scope=None), v["input"]["binding"], "knowledge_accepted")])),
            ("claim_binding_incomplete", lambda v: v["input"].__setitem__("claims", [{"subject_ref": copy.deepcopy(v["input"]["binding"]["knowledge_ref"]), "binding": {"template_ref": copy.deepcopy(v["input"]["binding"]["template_ref"])}, "kind": "knowledge_accepted", "proposed_value": "accepted", "actor": "BRAIN"}])),
            ("claim_kind_not_str_int", lambda v: v["input"].__setitem__("claims", [_make_claim(v["input"]["binding"]["knowledge_ref"], v["input"]["binding"], 123)])),
            ("claim_basis_refs_not_list_int", lambda v: v["input"].__setitem__("claims", [_make_claim(v["input"]["binding"]["knowledge_ref"], v["input"]["binding"], "knowledge_accepted", basis_refs=123)])),
            ("claim_basis_refs_elem_not_ref", lambda v: v["input"].__setitem__("claims", [_make_claim(v["input"]["binding"]["knowledge_ref"], v["input"]["binding"], "knowledge_accepted", basis_refs=["bad-ref"])])),
        ):
            with self.subTest(branch=tag_claim, case=case_name):
                assert_stops(base_input(self.document), tag_claim, mutate_validated_fn=mut_fn)

        self.assertEqual(sorted(tested_tags), sorted(expected_l7_tags))


if __name__ == "__main__":
    unittest.main()
