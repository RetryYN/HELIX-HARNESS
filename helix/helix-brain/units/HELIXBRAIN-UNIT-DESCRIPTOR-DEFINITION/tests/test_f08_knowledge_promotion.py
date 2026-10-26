"""BRAIN032 F08（知識stateとpromotion）の fn5 compare_knowledge_promotion 単体検証（L7）。

根拠:
- docs/helix-brain/L7-function-verification/f08-fn5-knowledge-promotion.json
- docs/helix-brain/L4-basic-design/template-semantic-supply.json#/knowledge_promotion_contract
- docs/helix-brain/L5-detail-design/template-semantic-supply.json#/functions/5
- docs/helix-brain/L5-detail-design/template-semantic-supply.json#/failure_rules/80..83
- docs/helix-brain/L5-detail-design/template-semantic-supply.json#/knowledge_promotion_detail
- docs/helix-brain/L5-detail-design/template-semantic-supply.json#/knowledge_promotion_claim_detail
- docs/helix-brain/L8-unit-verification/template-semantic-supply.json#/function_oracles/5
- docs/helix-brain/L8-unit-verification/template-semantic-supply.json#/cases/9/negative_cases/0..3
"""

from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path
import unittest

from descriptor_definitions import _ordered, compare_knowledge_promotion, validate_supply_input
from knowledge_promotion import F08_BACKFLOW_ID
from supply_input_fixtures import base_input, load_document


def _load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _sorted_vals(items: list[dict]) -> list[dict]:
    return [copy.deepcopy(x) for x in sorted(items, key=_ordered)]


def _ref_from(base_ref: dict, identity: str, *, revision: str | None = "_KEEP_", owner: str | None = "_KEEP_", sha256: str | None = None, source_locator: str | None = None) -> dict:
    return {**copy.deepcopy(base_ref), "identity": identity, "revision": base_ref["revision"] if revision == "_KEEP_" else revision, "owner": base_ref["owner"] if owner == "_KEEP_" else owner, "source_locator": source_locator, "sha256": sha256}


def _make_claim(subject_ref: dict, binding: dict, kind: str, *, proposed_value: object = "accepted", basis_refs: list[dict] | None = None, actor: str = "BRAIN") -> dict:
    claim: dict[str, object] = {"subject_ref": copy.deepcopy(subject_ref), "binding": copy.deepcopy(binding), "kind": kind, "proposed_value": copy.deepcopy(proposed_value), "actor": actor}
    if basis_refs is not None:
        claim["basis_refs"] = copy.deepcopy(basis_refs)
    return claim


def _add_promotion_semantic_source(
    raw: dict,
    *,
    identity: str,
    owner: str = "synthetic-knowledge-owner",
    promotion_evidence: list[dict],
    binding: dict | None = None,
    qualify: bool = True,
    role: str = "semantic_json",
) -> dict:
    content = {
        "binding": copy.deepcopy(raw["binding"] if binding is None else binding),
        "promotion_evidence": copy.deepcopy(promotion_evidence),
    }
    raw_bytes_str = _ordered(content)
    digest = hashlib.sha256(raw_bytes_str.encode("utf-8")).hexdigest()
    src_ref = _ref_from(
        raw["binding"]["knowledge_ref"],
        identity,
        owner=owner,
        sha256=digest,
        source_locator=f"synthetic://{identity.lower()}.json",
    )
    q_ref = _ref_from(raw["binding"]["knowledge_ref"], f"{identity}-QUAL", owner=owner) if qualify else None
    raw["sources"].append(
        {
            "ref": copy.deepcopy(src_ref),
            "role": role,
            "content_bytes": raw_bytes_str,
            "content": content,
            "qualification_ref": copy.deepcopy(q_ref),
        }
    )
    if qualify and q_ref is not None:
        raw["qualifications"].append(
            {
                "ref": copy.deepcopy(q_ref),
                "subject_ref": copy.deepcopy(src_ref),
                "subject_sha256": digest,
                "applicable_scope": copy.deepcopy(src_ref["scope"]),
                "qualification_body": {"owner": owner, "subject": identity, "authority_effect": "fixture assumption only"},
                "root_ref": copy.deepcopy(raw["qualification_roots"][0]),
            }
        )
    return src_ref


def _carrier_entry(
    claim_index: int,
    claim: dict,
    basis_index: int,
    basis_ref: dict,
    knowledge_ref: dict,
    record_member: str,
    *,
    original_evidence_set: list[str] | None = None,
    original_stages: object = "_ABSENT_",
    extra: dict | None = None,
) -> dict:
    entry: dict[str, object] = {
        "claim_index": claim_index,
        "claim": copy.deepcopy(claim),
        "basis_index": basis_index,
        "basis_ref": copy.deepcopy(basis_ref),
        "knowledge_ref": copy.deepcopy(knowledge_ref),
        "original_target": {
            "identity": claim["subject_ref"]["identity"],
            "revision": claim["subject_ref"]["revision"],
            "scope": copy.deepcopy(claim["subject_ref"]["scope"]),
        },
        "record_member": record_member,
    }
    if original_evidence_set is not None:
        entry["original_evidence_set"] = copy.deepcopy(original_evidence_set)
    if original_stages != "_ABSENT_":
        entry["original_stages"] = copy.deepcopy(original_stages)
    if extra:
        entry.update(copy.deepcopy(extra))
    return entry


def _expected_reason(code: str, predicate: str, claim_index: int, record_locators: list[str], observations: list[dict], basis_reads: dict) -> str:
    return _ordered({"code": code, "predicate": predicate, "claim_locator": f"/claims/{claim_index}", "record_locators": record_locators, "observations": observations, "basis_reads": basis_reads})


def _obs(record_locator: str, *, evaluation_scope: str = "supplied", evaluation_ref: str = "null", independent_verification_ref: str = "null", limited_adoption_ref: str = "null", adoption_ref: str = "null") -> dict:
    return {"adoption_ref": adoption_ref, "evaluation_ref": evaluation_ref, "evaluation_scope": evaluation_scope, "independent_verification_ref": independent_verification_ref, "limited_adoption_ref": limited_adoption_ref, "record_locator": record_locator}


class TestF08KnowledgePromotion(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.document = load_document()
        cls.repo_root = Path(__file__).resolve().parents[5]
        cls.l7_doc = _load_json(
            cls.repo_root
            / "docs/helix-brain/L7-function-verification/f08-fn5-knowledge-promotion.json"
        )

    def _run_fn0_fn5(self, raw: dict) -> tuple[dict, dict]:
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(raw, raw_before)
        context = {"validated": validated}
        context_before = copy.deepcopy(context)
        result = compare_knowledge_promotion(context)
        self.assertEqual(context, context_before)
        self.assertEqual(
            list(result.keys()),
            ["axes", "findings", "producer_symbol", "input_binding"],
        )
        self.assertEqual(result["producer_symbol"], "compare_knowledge_promotion")
        self.assertEqual(result["input_binding"], raw["binding"])
        self.assertIsNot(result["input_binding"], validated["input"]["binding"])
        for ax in result["axes"]:
            self.assertEqual(list(ax.keys()), ["subject_ref", "binding", "axis", "state", "original_refs", "reason", "backflow_owner"])
        for fnd in result["findings"]:
            self.assertEqual(list(fnd.keys()), ["code", "rule_ref", "subject_ref", "binding", "axis", "state", "source_refs", "reason", "backflow_owner"])
        return validated, result

    def test_f08_normal_control_and_add16_and_p3a_nonempty_candidate_trace(self) -> None:
        with self.subTest(case="HELIXBRAIN-L8-032-NORMAL-compare_knowledge_promotion"):
            raw = base_input(self.document)
            _, res = self._run_fn0_fn5(raw)
            rec0 = raw["knowledge_records"][0]
            expected_refs = _sorted_vals([rec0["ref"], *rec0["provenance_refs"]])
            self.assertEqual(res["findings"], [])
            self.assertEqual(
                res["axes"],
                [
                    {
                        "subject_ref": raw["binding"]["knowledge_ref"],
                        "binding": raw["binding"],
                        "axis": "knowledge_record_trace",
                        "state": "resolved",
                        "original_refs": expected_refs,
                        "reason": "同一immutable snapshotの原KnowledgeRecordを一意に辿れる。運用成立を意味しない。",
                        "backflow_owner": None,
                    }
                ],
            )

        with self.subTest(case="HELIXBRAIN-L8-032-ADD-16_limited_adoption_no_operational_claim"):
            raw16 = base_input(self.document)
            lim_ref = _ref_from(
                raw16["binding"]["knowledge_ref"],
                "SYNTHETIC-F08-LIMITED-ADOPTION-01",
                owner="synthetic-knowledge-owner",
            )
            raw16["knowledge_records"][0]["limited_adoption_ref"] = copy.deepcopy(lim_ref)
            _, res16 = self._run_fn0_fn5(raw16)
            rec16 = raw16["knowledge_records"][0]
            self.assertEqual(res16["findings"], [])
            self.assertEqual(len(res16["axes"]), 1)
            self.assertEqual(res16["axes"][0]["axis"], "knowledge_record_trace")
            self.assertEqual(res16["axes"][0]["state"], "resolved")
            self.assertEqual(
                res16["axes"][0]["original_refs"],
                _sorted_vals([rec16["ref"], *rec16["provenance_refs"], lim_ref]),
            )
            self.assertEqual(
                raw16["knowledge_records"][0]["operational_state"],
                {"source_state": "synthetic-candidate"},
            )

        with self.subTest(case="P3a_claims_absent_and_falsy_nonnull_states_resolved"):
            for falsy_state in (False, 0, "", [], {}):
                raw_falsy = base_input(self.document)
                raw_falsy.pop("claims", None)
                raw_falsy["knowledge_records"][0]["operational_state"] = copy.deepcopy(falsy_state)
                stage_refs = []
                for idx, key in enumerate(
                    (
                        "limited_adoption_ref",
                        "evaluation_ref",
                        "os_registration_ref",
                        "independent_verification_ref",
                        "adoption_ref",
                    )
                ):
                    sref = _ref_from(
                        raw_falsy["binding"]["knowledge_ref"],
                        f"SYNTHETIC-F08-STAGE-REF-{idx}",
                    )
                    raw_falsy["knowledge_records"][0][key] = copy.deepcopy(sref)
                    stage_refs.append(sref)
                _, res_falsy = self._run_fn0_fn5(raw_falsy)
                self.assertEqual(res_falsy["findings"], [])
                self.assertEqual(res_falsy["axes"][0]["state"], "resolved")
                self.assertIsNone(res_falsy["axes"][0]["backflow_owner"])
                rec_f = raw_falsy["knowledge_records"][0]
                self.assertEqual(
                    res_falsy["axes"][0]["original_refs"],
                    _sorted_vals([rec_f["ref"], *rec_f["provenance_refs"], *stage_refs]),
                )

        with self.subTest(case="P3a_operational_state_null_or_absent_is_unknown"):
            for mode in ("null", "absent"):
                raw_u = base_input(self.document)
                if mode == "null":
                    raw_u["knowledge_records"][0]["operational_state"] = None
                else:
                    raw_u["knowledge_records"][0].pop("operational_state", None)
                _, res_u = self._run_fn0_fn5(raw_u)
                self.assertEqual(res_u["axes"][0]["state"], "unknown")
                self.assertEqual(
                    res_u["axes"][0]["reason"],
                    "原KnowledgeRecordのoperational_stateが未供給またはnull。",
                )
                self.assertEqual(
                    res_u["axes"][0]["backflow_owner"],
                    raw_u["binding"]["knowledge_ref"]["owner"],
                )

        with self.subTest(case="P3a_duplicate_identical_records_vs_conflicting_records_and_slot_selection"):
            raw_dup = base_input(self.document)
            rec0 = copy.deepcopy(raw_dup["knowledge_records"][0])
            raw_dup["knowledge_records"].append(copy.deepcopy(rec0))
            _, res_dup = self._run_fn0_fn5(raw_dup)
            self.assertEqual(res_dup["axes"][0]["state"], "resolved")
            self.assertEqual(
                res_dup["axes"][0]["original_refs"],
                _sorted_vals(
                    [rec0["ref"], *rec0["provenance_refs"], rec0["ref"], *rec0["provenance_refs"]]
                ),
            )
            raw_amb = base_input(self.document)
            rec_diff = copy.deepcopy(rec0)
            rec_diff["operational_state"] = {"source_state": "different-state"}
            raw_amb["knowledge_records"].append(rec_diff)
            _, res_amb = self._run_fn0_fn5(raw_amb)
            self.assertEqual(res_amb["axes"][0]["state"], "unknown")
            self.assertEqual(
                res_amb["axes"][0]["reason"],
                "同一knowledge Refの原KnowledgeRecordが未供給または一意でない。",
            )
            raw_slot = base_input(self.document)
            slot_cand = _ref_from(raw_slot["binding"]["template_ref"], "SYNTHETIC-SLOT-TEMPLATE-ONLY")
            raw_slot["candidates"] = [copy.deepcopy(slot_cand)]
            slot_b = copy.deepcopy(raw_slot["binding"])
            slot_b["template_ref"] = copy.deepcopy(slot_cand)
            slot_b["knowledge_ref"] = _ref_from(
                raw_slot["binding"]["knowledge_ref"],
                "SYNTHETIC-SLOT-KNOWLEDGE-UNMATCHED",
                owner="slot-knowledge-owner",
            )
            raw_slot["descriptors"][0]["binding"] = copy.deepcopy(slot_b)
            _, res_slot = self._run_fn0_fn5(raw_slot)
            self.assertEqual(len(res_slot["axes"]), 1)
            self.assertEqual(res_slot["axes"][0]["subject_ref"], slot_b["knowledge_ref"])
            self.assertEqual(res_slot["axes"][0]["state"], "unknown")
            self.assertEqual(res_slot["axes"][0]["original_refs"], [])
            self.assertEqual(res_slot["axes"][0]["backflow_owner"], "slot-knowledge-owner")

    def test_f08_candidate_empty_finite_branch(self) -> None:
        raw = base_input(self.document)
        raw["candidates"] = []
        raw.pop("dependencies", None)
        for col in (
            "meaning_comparisons",
            "section_fields",
            "values",
            "applicability_records",
            "relations",
            "oracle_bindings",
            "compatibility_records",
            "handoff_records",
        ):
            raw[col] = []
        raw["knowledge_records"] = [
            {
                "ref": copy.deepcopy(raw["knowledge_records"][0]["ref"]),
                "provenance_refs": copy.deepcopy(raw["knowledge_records"][0]["provenance_refs"]),
            }
        ]
        t_ref0 = _ref_from(raw["binding"]["template_ref"], "SYNTHETIC-F08-EMPTY-TARGET-01")
        s0_content = {"binding": copy.deepcopy(raw["binding"]), "descriptor_targets": [{"target_ref": copy.deepcopy(t_ref0), "slot_identity": "synthetic-descriptor-1", "descriptor_kind": "template identity"}]}
        s0_bytes = _ordered(s0_content)
        s0_sha = hashlib.sha256(s0_bytes.encode("utf-8")).hexdigest()
        raw["sources"] = [{**copy.deepcopy(raw["sources"][0]), "content": s0_content, "content_bytes": s0_bytes}]
        raw["sources"][0]["ref"]["sha256"] = s0_sha
        raw["qualifications"][0]["subject_ref"]["sha256"] = s0_sha
        raw["qualifications"][0]["subject_sha256"] = s0_sha
        with self.subTest(case="candidate_empty_claims_empty"):
            _, res = self._run_fn0_fn5(raw)
            self.assertEqual(res["axes"], [])
            self.assertEqual(res["findings"], [])

        with self.subTest(case="candidate_empty_with_declared_fill_definition_claim"):
            raw_fill = copy.deepcopy(raw)
            target_ref = copy.deepcopy(
                raw_fill["sources"][0]["content"]["descriptor_targets"][0]["target_ref"]
            )
            raw_fill["claims"] = [
                _make_claim(
                    target_ref,
                    raw_fill["sources"][0]["content"]["binding"],
                    "fill_definition",
                    proposed_value="supplied",
                    basis_refs=[],
                )
            ]
            _, res_fill = self._run_fn0_fn5(raw_fill)
            self.assertEqual(res_fill["axes"], [])
            self.assertEqual(res_fill["findings"], [])

    def test_f08_neg01_rule80_generation_as_promotion_and_role_stage_contrasts(self) -> None:
        with self.subTest(case="HELIXBRAIN-L8-032-F08-NEG-01_and_P2-01"):
            raw = base_input(self.document)
            k_ref = raw["binding"]["knowledge_ref"]
            rec0 = raw["knowledge_records"][0]
            rec0["evaluation_scope"] = False
            rec0["evaluation_ref"] = None
            rec0["independent_verification_ref"] = None
            rec0["adoption_ref"] = None
            basis_ref = _ref_from(
                k_ref,
                "SYNTHETIC-F08-AI-GEN-SOURCE",
                sha256=None,
                source_locator="synthetic://synthetic-f08-ai-gen-source.json",
            )
            claim0 = _make_claim(
                k_ref,
                raw["binding"],
                "knowledge_accepted",
                basis_refs=[basis_ref],
            )
            rec0["provenance_refs"].append(copy.deepcopy(basis_ref))
            raw["claims"] = [copy.deepcopy(claim0)]
            carrier0 = _carrier_entry(
                0,
                claim0,
                0,
                basis_ref,
                k_ref,
                "provenance_refs",
                original_evidence_set=["AI_generated"],
            )
            src_ref = _add_promotion_semantic_source(
                raw,
                identity="SYNTHETIC-F08-AI-GEN-SOURCE",
                promotion_evidence=[carrier0],
            )
            _, res = self._run_fn0_fn5(raw)
            self.assertEqual([f["code"] for f in res["findings"]], ["generation_as_promotion", "independent_verification_missing"])
            fnd0 = res["findings"][0]
            self.assertEqual(fnd0["code"], "generation_as_promotion")
            self.assertEqual(fnd0["rule_ref"], "HELIXBRAIN-L5-032-R-generation_as_promotion")
            self.assertEqual(fnd0["axis"], "promotion")
            self.assertEqual(fnd0["state"], "unknown")
            self.assertEqual(fnd0["backflow_owner"], "knowledge_owner")
            self.assertEqual(fnd0["source_refs"], [src_ref])

            expected_b_reads = {
                "presence": "supplied",
                "occurrences": [
                    {
                        "basis_index": 0,
                        "source_indices": [5],
                        "carrier_locations": [{"source_index": 5, "carrier_index": 0}],
                        "record_member_matches": [
                            {
                                "source_index": 5,
                                "carrier_index": 0,
                                "record_index": 0,
                                "member": "provenance_refs",
                                "member_index": 1,
                            }
                        ],
                        "outcome": "joined",
                    }
                ],
            }
            expected_obs = [
                _obs(
                    "/knowledge_records/0",
                    evaluation_scope="supplied",
                    independent_verification_ref="null",
                )
            ]
            self.assertEqual(
                fnd0["reason"],
                _expected_reason(
                    "generation_as_promotion",
                    "condition_true",
                    0,
                    ["/knowledge_records/0"],
                    expected_obs,
                    expected_b_reads,
                ),
            )
            self.assertEqual(len(res["axes"]), 4)
            self.assertEqual(
                [a["axis"] for a in res["axes"]],
                ["knowledge_record_trace", "promotion", "promotion", "promotion"],
            )
            self.assertEqual(res["axes"][1]["reason"], fnd0["reason"])

        with self.subTest(case="Rule80_false_when_evaluation_ref_joined_and_nonempty_scope"):
            raw_false = base_input(self.document)
            k_ref = raw_false["binding"]["knowledge_ref"]
            eval_ref = _ref_from(
                k_ref,
                "SYNTHETIC-F08-EVAL-SOURCE",
                sha256=None,
                source_locator="synthetic://synthetic-f08-eval-source.json",
            )
            raw_false["knowledge_records"][0]["evaluation_ref"] = copy.deepcopy(eval_ref)
            raw_false["knowledge_records"][0]["evaluation_scope"] = {"covered": ["unit"]}
            claim_f = _make_claim(k_ref, raw_false["binding"], "knowledge_promoted", basis_refs=[eval_ref])
            raw_false["claims"] = [copy.deepcopy(claim_f)]
            c_entry = _carrier_entry(
                0,
                claim_f,
                0,
                eval_ref,
                k_ref,
                "evaluation_ref",
                original_evidence_set=["evaluation"],
            )
            _add_promotion_semantic_source(
                raw_false,
                identity="SYNTHETIC-F08-EVAL-SOURCE",
                promotion_evidence=[c_entry],
            )
            _, res_f = self._run_fn0_fn5(raw_false)
            self.assertEqual([f["code"] for f in res_f["findings"]], ["independent_verification_missing"])
            self.assertEqual(
                [a["axis"] for a in res_f["axes"]],
                ["knowledge_record_trace", "promotion", "promotion_claim"],
            )

        with self.subTest(case="Rule80_unknown_on_original_stages_or_mixed_roles_or_conflict"):
            for sub_mode in ("stages_supplied", "mixed_roles", "carrier_conflict", "unusable_source"):
                raw_u = base_input(self.document)
                k_ref = raw_u["binding"]["knowledge_ref"]
                ident = f"SYNTHETIC-F08-U-{sub_mode}"
                b_ref = _ref_from(
                    k_ref,
                    ident,
                    sha256=None,
                    source_locator=f"synthetic://{ident.lower()}.json",
                )
                raw_u["knowledge_records"][0]["provenance_refs"].append(copy.deepcopy(b_ref))
                cl = _make_claim(k_ref, raw_u["binding"], "knowledge_accepted", basis_refs=[b_ref])
                raw_u["claims"] = [copy.deepcopy(cl)]
                if sub_mode == "stages_supplied":
                    entries = [
                        _carrier_entry(
                            0,
                            cl,
                            0,
                            b_ref,
                            k_ref,
                            "provenance_refs",
                            original_evidence_set=["AI_generated"],
                            original_stages=None,
                        )
                    ]
                elif sub_mode == "mixed_roles":
                    entries = [
                        _carrier_entry(
                            0,
                            cl,
                            0,
                            b_ref,
                            k_ref,
                            "provenance_refs",
                            original_evidence_set=["AI_generated", "document_exists"],
                        )
                    ]
                elif sub_mode == "carrier_conflict":
                    entries = [
                        _carrier_entry(
                            0,
                            cl,
                            0,
                            b_ref,
                            k_ref,
                            "provenance_refs",
                            original_evidence_set=["AI_generated"],
                        ),
                        _carrier_entry(
                            0,
                            cl,
                            0,
                            b_ref,
                            k_ref,
                            "provenance_refs",
                            original_evidence_set=["proposal"],
                        ),
                    ]
                else:
                    entries = [
                        _carrier_entry(
                            0,
                            cl,
                            0,
                            b_ref,
                            k_ref,
                            "provenance_refs",
                            original_evidence_set=["AI_generated"],
                        )
                    ]
                _add_promotion_semantic_source(
                    raw_u,
                    identity=ident,
                    promotion_evidence=entries,
                    qualify=(sub_mode != "unusable_source"),
                )
                _, res_u = self._run_fn0_fn5(raw_u)
                r80_reason = json.loads(res_u["axes"][1]["reason"])
                self.assertEqual(r80_reason["code"], "generation_as_promotion")
                self.assertEqual(r80_reason["predicate"], "predicate_unknown")
                if sub_mode == "carrier_conflict":
                    self.assertEqual(
                        r80_reason["basis_reads"]["occurrences"][0]["outcome"], "conflict"
                    )
                elif sub_mode == "unusable_source":
                    self.assertEqual(
                        r80_reason["basis_reads"]["occurrences"][0]["outcome"], "unresolved"
                    )
                    self.assertEqual(
                        r80_reason["basis_reads"]["occurrences"][0]["carrier_locations"],
                        [{"source_index": 5, "carrier_index": 0}],
                    )

    def test_f08_neg02_rule81_and_neg03_rule82_and_scope_type_boundaries(self) -> None:
        with self.subTest(case="HELIXBRAIN-L8-032-F08-NEG-02_and_NEG-03"):
            raw = base_input(self.document)
            k_ref = raw["binding"]["knowledge_ref"]
            raw["knowledge_records"][0]["evaluation_scope"] = None
            raw["knowledge_records"][0]["independent_verification_ref"] = None
            raw["claims"] = [
                _make_claim(k_ref, raw["binding"], "knowledge_promoted", basis_refs=[])
            ]
            _, res = self._run_fn0_fn5(raw)
            self.assertEqual(
                [f["code"] for f in res["findings"]],
                ["evaluation_scope_missing", "independent_verification_missing"],
            )
            for fnd in res["findings"]:
                self.assertEqual(fnd["axis"], "promotion")
                self.assertEqual(fnd["state"], "unknown")
                self.assertEqual(fnd["backflow_owner"], "knowledge_owner")
                self.assertEqual(fnd["source_refs"], [])
                parsed = json.loads(fnd["reason"])
                self.assertEqual(parsed["predicate"], "condition_true")
                self.assertEqual(
                    parsed["basis_reads"], {"presence": "empty", "occurrences": []}
                )

        with self.subTest(case="Rule81_empty_falsy_scopes_are_unknown_and_nonempty_true_one_are_false"):
            for unknown_scope in ("", False, 0, 0.0, [], {}):
                raw_unk = base_input(self.document)
                k_ref = raw_unk["binding"]["knowledge_ref"]
                raw_unk["knowledge_records"][0]["evaluation_scope"] = copy.deepcopy(unknown_scope)
                raw_unk["claims"] = [_make_claim(k_ref, raw_unk["binding"], "knowledge_promoted")]
                _, res_unk = self._run_fn0_fn5(raw_unk)
                self.assertNotIn(
                    "evaluation_scope_missing", [f["code"] for f in res_unk["findings"]]
                )
                r81_ax = [
                    a
                    for a in res_unk["axes"]
                    if a["axis"] == "promotion"
                    and json.loads(a["reason"])["code"] == "evaluation_scope_missing"
                ]
                self.assertEqual(len(r81_ax), 1)
                self.assertEqual(json.loads(r81_ax[0]["reason"])["predicate"], "predicate_unknown")

            for false_scope in ("scope-v1", " ", True, 1, 1.0, -1, ["x"], {"k": 1}):
                raw_fls = base_input(self.document)
                k_ref = raw_fls["binding"]["knowledge_ref"]
                raw_fls["knowledge_records"][0]["evaluation_scope"] = copy.deepcopy(false_scope)
                raw_fls["claims"] = [_make_claim(k_ref, raw_fls["binding"], "knowledge_promoted")]
                _, res_fls = self._run_fn0_fn5(raw_fls)
                r81_ax = [
                    a
                    for a in res_fls["axes"]
                    if a["axis"] == "promotion"
                    and json.loads(a["reason"])["code"] == "evaluation_scope_missing"
                ]
                self.assertEqual(r81_ax, [])

    def test_f08_neg04_rule83_limited_content_as_promotion_and_pr1_vocabulary_alignment(self) -> None:
        with self.subTest(case="HELIXBRAIN-L8-032-F08-NEG-04_limited_content_as_promotion_conflict"):
            raw = base_input(self.document)
            k_ref = raw["binding"]["knowledge_ref"]
            lim_ref = _ref_from(
                k_ref,
                "SYNTHETIC-F08-MSGCONTENT-LIMITED-01",
                sha256=None,
                source_locator="synthetic://synthetic-f08-msgcontent-limited-01.json",
            )
            raw["knowledge_records"][0]["limited_adoption_ref"] = copy.deepcopy(lim_ref)
            raw["knowledge_records"][0]["adoption_ref"] = None
            claim83 = _make_claim(
                k_ref, raw["binding"], "knowledge_accepted", basis_refs=[lim_ref]
            )
            raw["claims"] = [copy.deepcopy(claim83)]
            c83 = _carrier_entry(
                0,
                claim83,
                0,
                lim_ref,
                k_ref,
                "limited_adoption_ref",
                original_evidence_set=["proposal"],
            )
            src_ref = _add_promotion_semantic_source(
                raw,
                identity="SYNTHETIC-F08-MSGCONTENT-LIMITED-01",
                promotion_evidence=[c83],
            )
            _, res = self._run_fn0_fn5(raw)
            r83_findings = [
                f for f in res["findings"] if f["code"] == "limited_content_as_promotion"
            ]
            self.assertEqual(len(r83_findings), 1)
            fnd83 = r83_findings[0]
            self.assertEqual(
                fnd83["rule_ref"], "HELIXBRAIN-L5-032-R-limited_content_as_promotion"
            )
            self.assertEqual(fnd83["axis"], "promotion_claim")
            self.assertEqual(fnd83["state"], "conflict")
            self.assertEqual(fnd83["backflow_owner"], "knowledge_owner")
            self.assertEqual(fnd83["source_refs"], [src_ref])
            ax83 = [a for a in res["axes"] if a["axis"] == "promotion_claim"]
            self.assertEqual(len(ax83), 1)
            self.assertEqual(ax83[0]["state"], "conflict")
            self.assertEqual(ax83[0]["reason"], fnd83["reason"])

        with self.subTest(case="HELIXBRAIN-L8-032-F08-PR1-VOCABULARY-ALIGNMENT"):
            raw_prom = base_input(self.document)
            k_ref = raw_prom["binding"]["knowledge_ref"]
            lim_ref = _ref_from(
                k_ref,
                "SYNTHETIC-F08-LIM-PROM",
                sha256=None,
                source_locator="synthetic://synthetic-f08-lim-prom.json",
            )
            raw_prom["knowledge_records"][0]["limited_adoption_ref"] = copy.deepcopy(lim_ref)
            cl_prom = _make_claim(
                k_ref, raw_prom["binding"], "knowledge_promoted", basis_refs=[lim_ref]
            )
            raw_prom["claims"] = [copy.deepcopy(cl_prom)]
            _add_promotion_semantic_source(
                raw_prom,
                identity="SYNTHETIC-F08-LIM-PROM",
                promotion_evidence=[
                    _carrier_entry(
                        0,
                        cl_prom,
                        0,
                        lim_ref,
                        k_ref,
                        "limited_adoption_ref",
                        original_evidence_set=["proposal"],
                    )
                ],
            )
            _, res_prom = self._run_fn0_fn5(raw_prom)
            self.assertNotIn(
                "limited_content_as_promotion", [f["code"] for f in res_prom["findings"]]
            )
            ax_prom83 = [a for a in res_prom["axes"] if a["axis"] == "promotion_claim"]
            self.assertEqual(len(ax_prom83), 1)
            self.assertEqual(ax_prom83[0]["state"], "unknown")
            r_prom83 = json.loads(ax_prom83[0]["reason"])
            self.assertEqual(r_prom83["predicate"], "predicate_unknown")
            self.assertEqual(
                r_prom83["basis_reads"]["occurrences"][0]["outcome"], "not_required"
            )

            raw_distinct = base_input(self.document)
            k_ref = raw_distinct["binding"]["knowledge_ref"]
            lim_ref_d = _ref_from(k_ref, "SYNTHETIC-F08-LIM-ID-A", sha256=None)
            prov_ref_d = _ref_from(
                k_ref,
                "SYNTHETIC-F08-PROV-ID-B",
                sha256=None,
                source_locator="synthetic://synthetic-f08-prov-id-b.json",
            )
            raw_distinct["knowledge_records"][0]["limited_adoption_ref"] = copy.deepcopy(lim_ref_d)
            raw_distinct["knowledge_records"][0]["provenance_refs"].append(copy.deepcopy(prov_ref_d))
            cl_dist = _make_claim(
                k_ref, raw_distinct["binding"], "knowledge_accepted", basis_refs=[prov_ref_d]
            )
            raw_distinct["claims"] = [copy.deepcopy(cl_dist)]
            _add_promotion_semantic_source(
                raw_distinct,
                identity="SYNTHETIC-F08-PROV-ID-B",
                promotion_evidence=[
                    _carrier_entry(
                        0,
                        cl_dist,
                        0,
                        prov_ref_d,
                        k_ref,
                        "provenance_refs",
                        original_evidence_set=["proposal"],
                    )
                ],
            )
            _, res_dist = self._run_fn0_fn5(raw_distinct)
            self.assertEqual(
                [a for a in res_dist["axes"] if a["axis"] == "promotion_claim"], []
            )

            raw_fill = base_input(self.document)
            raw_fill["claims"] = [
                _make_claim(
                    raw_fill["binding"]["knowledge_ref"],
                    raw_fill["binding"],
                    "fill_definition",
                    basis_refs=[raw_fill["sources"][0]["ref"]],
                )
            ]
            _, res_fill = self._run_fn0_fn5(raw_fill)
            self.assertEqual(len(res_fill["axes"]), 1)
            self.assertEqual(res_fill["axes"][0]["axis"], "knowledge_record_trace")
            self.assertEqual(res_fill["findings"], [])

        with self.subTest(case="P2b_dual_membership_and_same_identity_revision_or_sha_mismatch"):
            raw_dual = base_input(self.document)
            k_ref = raw_dual["binding"]["knowledge_ref"]
            shared_ref = _ref_from(
                k_ref,
                "SYNTHETIC-F08-SHARED-REF",
                sha256=None,
                source_locator="synthetic://synthetic-f08-shared-ref.json",
            )
            raw_dual["knowledge_records"][0]["limited_adoption_ref"] = copy.deepcopy(shared_ref)
            raw_dual["knowledge_records"][0]["provenance_refs"].append(copy.deepcopy(shared_ref))
            cl_dual = _make_claim(
                k_ref, raw_dual["binding"], "knowledge_accepted", basis_refs=[shared_ref]
            )
            raw_dual["claims"] = [copy.deepcopy(cl_dual)]
            _add_promotion_semantic_source(
                raw_dual,
                identity="SYNTHETIC-F08-SHARED-REF",
                promotion_evidence=[
                    _carrier_entry(
                        0,
                        cl_dual,
                        0,
                        shared_ref,
                        k_ref,
                        "provenance_refs",
                        original_evidence_set=["proposal"],
                    )
                ],
            )
            _, res_dual = self._run_fn0_fn5(raw_dual)
            ax_dual83 = [a for a in res_dual["axes"] if a["axis"] == "promotion_claim"]
            self.assertEqual(len(ax_dual83), 1)
            self.assertEqual(ax_dual83[0]["state"], "unknown")

    def test_f08_unclosed_branches_stop_with_tagged_not_implemented_error(self) -> None:
        expected_l7_tags = {
            entry.split(":", 1)[0]
            for entry in self.l7_doc["partial_oracle_and_stop_boundary"]["unclosed_stop_branches"]
        }
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
            {},
            {"validated": None},
            {"validated": {}, "extra": 1},
            {"validated": {"input": "bad", "input_issues": [], "unusable_source_refs": []}},
        ):
            with self.subTest(branch=tag_ctx, bad_ctx=str(bad_ctx)):
                with self.assertRaises(NotImplementedError) as cm:
                    compare_knowledge_promotion(bad_ctx)  # type: ignore[arg-type]
                self.assertIn(tag_ctx, str(cm.exception))
                self.assertIn(F08_BACKFLOW_ID, str(cm.exception))

        for case_name, mut_fn in (
            ("candidates_absent", lambda v: v["input"].pop("candidates", None)),
            ("candidates_not_list", lambda v: v["input"].__setitem__("candidates", "bad")),
            ("candidate_elem_not_ref", lambda v: v["input"]["candidates"].append("not-a-ref")),
            ("binding_not_shape", lambda v: v["input"].__setitem__("binding", {})),
            ("claims_not_list", lambda v: v["input"].__setitem__("claims", "bad")),
        ):
            with self.subTest(branch=tag_ctx, case=case_name):
                assert_stops(base_input(self.document), tag_ctx, mutate_validated_fn=mut_fn)

        tag_rec = "F08/record_or_descriptor_carrier_shape"
        for case_name, mut_fn in (
            ("record_not_dict", lambda v: v["input"]["knowledge_records"].append("bad")),
            ("record_ref_null", lambda v: v["input"]["knowledge_records"][0].__setitem__("ref", None)),
            ("provenance_refs_not_list", lambda v: v["input"]["knowledge_records"][0].__setitem__("provenance_refs", "bad")),
            ("stage_ref_not_ref", lambda v: v["input"]["knowledge_records"][0].__setitem__("evaluation_ref", "bad-ref")),
            ("descriptor_slot_not_dict", lambda v: v["input"]["descriptors"].append("bad-slot")),
        ):
            with self.subTest(branch=tag_rec, case=case_name):
                assert_stops(base_input(self.document), tag_rec, mutate_validated_fn=mut_fn)

        tag_empty = "F08/candidate_empty_outside_finite_domain"
        for case_name, mut_fn in (
            ("dependencies_supplied_when_candidates_empty", lambda v: v["input"].__setitem__("candidates", [])),
            (
                "undeclared_fill_definition_claim",
                lambda v: (
                    v["input"].__setitem__("candidates", []),
                    v["input"].pop("dependencies", None),
                    [
                        v["input"].__setitem__(c, [])
                        for c in (
                            "meaning_comparisons",
                            "section_fields",
                            "values",
                            "applicability_records",
                            "relations",
                            "oracle_bindings",
                            "compatibility_records",
                            "handoff_records",
                        )
                    ],
                    v["input"].__setitem__(
                        "knowledge_records",
                        [{"ref": v["input"]["knowledge_records"][0]["ref"]}],
                    ),
                    v["input"].__setitem__(
                        "claims",
                        [
                            _make_claim(
                                v["input"]["binding"]["knowledge_ref"],
                                v["input"]["binding"],
                                "fill_definition",
                            )
                        ],
                    ),
                ),
            ),
        ):
            with self.subTest(branch=tag_empty, case=case_name):
                assert_stops(base_input(self.document), tag_empty, mutate_validated_fn=mut_fn)

        tag_claim = "F08/claim_witness_formation"
        for case_name, mut_fn in (
            ("claim_not_dict", lambda v: v["input"].__setitem__("claims", ["bad"])),
            (
                "subject_ref_owner_null",
                lambda v: v["input"].__setitem__(
                    "claims",
                    [
                        _make_claim(
                            _ref_from(v["input"]["binding"]["knowledge_ref"], "ID-1", owner=None),
                            v["input"]["binding"],
                            "knowledge_accepted",
                        )
                    ],
                ),
            ),
            (
                "claim_binding_incomplete",
                lambda v: v["input"].__setitem__(
                    "claims",
                    [
                        {
                            "subject_ref": copy.deepcopy(v["input"]["binding"]["knowledge_ref"]),
                            "binding": {"template_ref": copy.deepcopy(v["input"]["binding"]["template_ref"])},
                            "kind": "knowledge_accepted",
                            "proposed_value": "accepted",
                            "actor": "BRAIN",
                        }
                    ],
                ),
            ),
            (
                "claim_basis_refs_not_list",
                lambda v: v["input"].__setitem__(
                    "claims",
                    [
                        {
                            **_make_claim(
                                v["input"]["binding"]["knowledge_ref"],
                                v["input"]["binding"],
                                "knowledge_accepted",
                            ),
                            "basis_refs": "not-a-list",
                        }
                    ],
                ),
            ),
        ):
            with self.subTest(branch=tag_claim, case=case_name):
                assert_stops(base_input(self.document), tag_claim, mutate_validated_fn=mut_fn)

        self.assertEqual(sorted(tested_tags), sorted(expected_l7_tags))


if __name__ == "__main__":
    unittest.main()
