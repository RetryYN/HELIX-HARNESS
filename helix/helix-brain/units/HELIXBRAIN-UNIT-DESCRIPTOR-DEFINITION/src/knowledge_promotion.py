"""BRAIN032 F08（知識stateとpromotion）の fn5 compare_knowledge_promotion 実装。"""

from __future__ import annotations

import copy
from typing import Any

from descriptor_definitions import (
    _APPROVED_KINDS,
    _binding_shape_ok,
    _is_json_value,
    _json_equal,
    _ordered,
    _ref_same,
    _ref_shape_ok,
    _source_usable,
)

F08_BACKFLOW_ID = "HELIXBRAIN-L6-032-F08-FN5-PATH"

_STAGE_REF_MEMBERS = (
    "limited_adoption_ref",
    "evaluation_ref",
    "os_registration_ref",
    "independent_verification_ref",
    "adoption_ref",
)
_RECORD_MEMBERS = ("provenance_refs", *_STAGE_REF_MEMBERS)
_NONLIMITED_RECORD_MEMBERS = frozenset(_RECORD_MEMBERS) - {"limited_adoption_ref"}
_KNOWN_ROLES = frozenset((
    "AI_generated", "single_success", "LABO_result", "OS_ticket", "document_exists",
    "proposal", "evaluation", "registration", "independent_verification", "adoption_basis",
))
_ROLE_TO_STAGE_MEMBER = {
    "evaluation": "evaluation_ref",
    "independent_verification": "independent_verification_ref",
    "adoption_basis": "adoption_ref",
}
_CARRIER_REQUIRED_KEYS = frozenset((
    "claim_index", "claim", "basis_index", "basis_ref", "knowledge_ref", "original_target", "record_member",
))
_OTHER_EMPTY_COLLECTIONS = (
    "meaning_comparisons", "section_fields", "values", "applicability_records",
    "relations", "oracle_bindings", "compatibility_records", "handoff_records",
)
_SEMANTIC_JSON_ALLOWLIST = frozenset((
    "binding", "descriptor_facts", "descriptor_targets", "definition_meaning_operations",
))
_REFERENCE_ONLY_ALLOWLIST = frozenset(("binding", "reference_target", "reference_context"))
_RULE_SPECS = {
    80: ("generation_as_promotion", "HELIXBRAIN-L5-032-R-generation_as_promotion", "promotion", "unknown"),
    81: ("evaluation_scope_missing", "HELIXBRAIN-L5-032-R-evaluation_scope_missing", "promotion", "unknown"),
    82: ("independent_verification_missing", "HELIXBRAIN-L5-032-R-independent_verification_missing", "promotion", "unknown"),
    83: ("limited_content_as_promotion", "HELIXBRAIN-L5-032-R-limited_content_as_promotion", "promotion_claim", "conflict"),
}


def _f08_stop(branch: str, detail: str) -> NotImplementedError:
    error = NotImplementedError(f"F08/{branch}: {detail}; Backflow {F08_BACKFLOW_ID}")
    error._n03_branch_tagged = True
    return error


def _is_nonneg_int(val: Any) -> bool:
    return isinstance(val, int) and not isinstance(val, bool) and val >= 0


def _sorted_values(items: list[Any]) -> list[Any]:
    return [copy.deepcopy(x) for x in sorted(items, key=_ordered)]


def _unique_sorted(items: list[Any]) -> list[Any]:
    result: list[Any] = []
    for item in _sorted_values(items):
        if not result or not _json_equal(result[-1], item):
            result.append(item)
    return result


def _complete_ref_ok(ref: Any) -> bool:
    return (
        _ref_shape_ok(ref)
        and all(isinstance(ref.get(k), str) for k in ("identity", "revision", "owner"))
        and ref.get("scope") is not None
        and _is_json_value(ref.get("scope"))
    )


def _validate_context_and_input(context: Any) -> tuple[dict[str, Any], dict[str, Any]]:
    if not isinstance(context, dict) or set(context.keys()) != {"validated"}:
        raise _f08_stop("context_or_input_shape", "PromotionContext must have exact key {validated}")
    validated = context.get("validated")
    if (
        not isinstance(validated, dict)
        or set(validated.keys()) != {"input", "input_issues", "unusable_source_refs"}
        or not isinstance(validated.get("input"), dict)
        or not isinstance(validated.get("input_issues"), list)
        or not isinstance(validated.get("unusable_source_refs"), list)
    ):
        raise _f08_stop("context_or_input_shape", "validated must be a decoded ValidatedSupply")
    raw = validated["input"]
    if not _binding_shape_ok(raw.get("binding")):
        raise _f08_stop("context_or_input_shape", "input.binding must be a valid Binding")
    if "candidates" not in raw or not isinstance(raw["candidates"], list):
        raise _f08_stop("context_or_input_shape", "input.candidates must be a supplied list")
    if any(not _ref_shape_ok(c) for c in raw["candidates"]):
        raise _f08_stop("context_or_input_shape", "input.candidates elements must be Ref objects")
    if "claims" in raw and not isinstance(raw["claims"], list):
        raise _f08_stop("context_or_input_shape", "input.claims must be a list when present")
    if "sources" in raw and not isinstance(raw["sources"], list):
        raise _f08_stop("context_or_input_shape", "input.sources must be a list when present")
    if "descriptors" in raw and not isinstance(raw["descriptors"], list):
        raise _f08_stop("record_or_descriptor_carrier_shape", "input.descriptors must be a list when present")
    for idx, slot in enumerate(raw.get("descriptors", [])):
        if not isinstance(slot, dict) or not _binding_shape_ok(slot.get("binding")):
            raise _f08_stop("record_or_descriptor_carrier_shape", f"/descriptors/{idx} is not a valid DescriptorSlot")
    if "knowledge_records" in raw and not isinstance(raw["knowledge_records"], list):
        raise _f08_stop("record_or_descriptor_carrier_shape", "input.knowledge_records must be a list when present")
    for idx, rec in enumerate(raw.get("knowledge_records", [])):
        if not isinstance(rec, dict) or not _ref_shape_ok(rec.get("ref")):
            raise _f08_stop("record_or_descriptor_carrier_shape", f"/knowledge_records/{idx} is not a valid KnowledgeRecord")
        if "provenance_refs" in rec:
            prefs = rec["provenance_refs"]
            if not isinstance(prefs, list) or any(not _ref_shape_ok(p) for p in prefs):
                raise _f08_stop("record_or_descriptor_carrier_shape", f"/knowledge_records/{idx}/provenance_refs invalid")
        for s_key in _STAGE_REF_MEMBERS:
            if s_key in rec and rec[s_key] is not None and not _ref_shape_ok(rec[s_key]):
                raise _f08_stop("record_or_descriptor_carrier_shape", f"/knowledge_records/{idx}/{s_key} is not a Ref or null")
    return validated, raw


def _validate_candidate_empty_domain(raw: dict[str, Any]) -> None:
    if "dependencies" in raw:
        raise _f08_stop("candidate_empty_outside_finite_domain", "dependencies supplied when candidates is empty")
    for col in _OTHER_EMPTY_COLLECTIONS:
        if col in raw and (not isinstance(raw[col], list) or len(raw[col]) > 0):
            raise _f08_stop("candidate_empty_outside_finite_domain", f"{col} is non-empty when candidates is empty")
    for rec in raw.get("knowledge_records", []):
        if not set(rec.keys()).issubset({"ref", "provenance_refs"}):
            raise _f08_stop("candidate_empty_outside_finite_domain", "knowledge_records has stage/state keys in candidate-empty branch")
    for slot in raw.get("descriptors", []):
        if slot.get("descriptor_kind") not in _APPROVED_KINDS:
            raise _f08_stop("candidate_empty_outside_finite_domain", "descriptor_kind outside approved 15 kinds")
    declared_targets: list[tuple[Any, Any]] = []
    for src in raw.get("sources", []):
        if not isinstance(src, dict):
            raise _f08_stop("candidate_empty_outside_finite_domain", "source is not an object")
        role = src.get("role")
        content = src.get("content")
        if not isinstance(content, dict):
            raise _f08_stop("candidate_empty_outside_finite_domain", "source.content is not an object")
        if role == "semantic_json":
            if not set(content.keys()).issubset(_SEMANTIC_JSON_ALLOWLIST):
                raise _f08_stop("candidate_empty_outside_finite_domain", "semantic_json content key outside allowlist")
            for c_key in ("descriptor_facts", "definition_meaning_operations", "descriptor_targets"):
                if c_key in content and not isinstance(content[c_key], list):
                    raise _f08_stop("candidate_empty_outside_finite_domain", f"{c_key} must be a list when present")
            for grp in content.get("descriptor_facts", []):
                if not isinstance(grp, dict) or grp.get("descriptor_kind") not in _APPROVED_KINDS:
                    raise _f08_stop("candidate_empty_outside_finite_domain", "descriptor_facts group kind invalid")
            for op in content.get("definition_meaning_operations", []):
                if not isinstance(op, dict) or not isinstance(op.get("arguments"), dict) or op["arguments"].get("descriptor_kind") not in _APPROVED_KINDS:
                    raise _f08_stop("candidate_empty_outside_finite_domain", "definition_meaning_operations kind invalid")
            for tgt in content.get("descriptor_targets", []):
                if not isinstance(tgt, dict) or tgt.get("descriptor_kind") not in _APPROVED_KINDS:
                    raise _f08_stop("candidate_empty_outside_finite_domain", "descriptor_targets kind invalid")
                declared_targets.append((tgt.get("target_ref"), content.get("binding")))
        elif role == "reference_only":
            if not set(content.keys()).issubset(_REFERENCE_ONLY_ALLOWLIST):
                raise _f08_stop("candidate_empty_outside_finite_domain", "reference_only content key outside allowlist")
        else:
            raise _f08_stop("candidate_empty_outside_finite_domain", f"unsupported source role in candidate-empty branch: {role}")
    for clm in raw.get("claims", []):
        if not isinstance(clm, dict) or clm.get("kind") != "fill_definition":
            raise _f08_stop("candidate_empty_outside_finite_domain", "non-fill_definition claim in candidate-empty branch")
        if not any(_json_equal(t_ref, clm.get("subject_ref")) and _json_equal(t_bind, clm.get("binding")) for t_ref, t_bind in declared_targets):
            raise _f08_stop("candidate_empty_outside_finite_domain", "fill_definition claim lacks matching descriptor_target declaration")


def _selected_bindings(raw: dict[str, Any]) -> list[dict[str, Any]]:
    candidates = raw["candidates"]
    population = [raw["binding"], *(slot["binding"] for slot in raw.get("descriptors", []))]
    matched = [
        b for b in population
        if isinstance(b.get("knowledge_ref"), dict) and any(_ref_same(b.get("template_ref"), cand) for cand in candidates)
    ]
    return _unique_sorted(matched)


def _record_original_refs(rec: dict[str, Any]) -> list[dict[str, Any]]:
    refs: list[dict[str, Any]] = []
    if isinstance(rec.get("ref"), dict):
        refs.append(copy.deepcopy(rec["ref"]))
    for pref in rec.get("provenance_refs", []):
        if isinstance(pref, dict):
            refs.append(copy.deepcopy(pref))
    for s_key in _STAGE_REF_MEMBERS:
        s_val = rec.get(s_key)
        if isinstance(s_val, dict):
            refs.append(copy.deepcopy(s_val))
    return _sorted_values(refs)


def _knowledge_trace_axes(raw: dict[str, Any], selected_bindings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    records = raw.get("knowledge_records", [])
    rows: list[dict[str, Any]] = []
    for binding in selected_bindings:
        k_ref = binding["knowledge_ref"]
        matches = [rec for rec in records if _ref_same(rec.get("ref"), k_ref)]
        distinct_records = _unique_sorted(matches)
        orig_refs = _sorted_values([ref for rec in matches for ref in _record_original_refs(rec)])
        if len(distinct_records) == 1:
            rec0 = distinct_records[0]
            if "operational_state" in rec0 and rec0["operational_state"] is not None:
                state, reason, owner = "resolved", "同一immutable snapshotの原KnowledgeRecordを一意に辿れる。運用成立を意味しない。", None
            else:
                state, reason, owner = "unknown", "原KnowledgeRecordのoperational_stateが未供給またはnull。", k_ref.get("owner")
        else:
            state, reason, owner = "unknown", "同一knowledge Refの原KnowledgeRecordが未供給または一意でない。", k_ref.get("owner")
        rows.append({
            "subject_ref": copy.deepcopy(k_ref), "binding": copy.deepcopy(binding), "axis": "knowledge_record_trace",
            "state": state, "original_refs": orig_refs, "reason": reason, "backflow_owner": owner,
        })
    return _sorted_values(rows)


def _validate_claim_witness_formation(claim: Any, idx: int) -> None:
    if not isinstance(claim, dict):
        raise _f08_stop("claim_witness_formation", f"/claims/{idx} is not an object")
    if not _complete_ref_ok(claim.get("subject_ref")):
        raise _f08_stop("claim_witness_formation", f"/claims/{idx}/subject_ref is incomplete or not a Ref")
    if not _binding_shape_ok(claim.get("binding")):
        raise _f08_stop("claim_witness_formation", f"/claims/{idx}/binding is not a full Binding")
    if not isinstance(claim.get("kind"), str):
        raise _f08_stop("claim_witness_formation", f"/claims/{idx}/kind is not a string")
    if "basis_refs" in claim:
        b_refs = claim["basis_refs"]
        if not isinstance(b_refs, list) or any(not _ref_shape_ok(r) for r in b_refs):
            raise _f08_stop("claim_witness_formation", f"/claims/{idx}/basis_refs must be a Ref array when present")


def _member_presence_token(rec: dict[str, Any], key: str) -> str:
    if key not in rec:
        return "absent"
    return "null" if rec[key] is None else "supplied"


def _build_observations(matched_records: list[tuple[int, dict[str, Any]]]) -> list[dict[str, str]]:
    return [
        {
            "record_locator": f"/knowledge_records/{r_idx}",
            "evaluation_scope": _member_presence_token(rec, "evaluation_scope"),
            "evaluation_ref": _member_presence_token(rec, "evaluation_ref"),
            "independent_verification_ref": _member_presence_token(rec, "independent_verification_ref"),
            "limited_adoption_ref": _member_presence_token(rec, "limited_adoption_ref"),
            "adoption_ref": _member_presence_token(rec, "adoption_ref"),
        }
        for r_idx, rec in matched_records
    ]


def _target_join_ok(target: Any, subject_ref: dict[str, Any]) -> bool:
    if not isinstance(target, dict):
        return False
    return all(k in target and target[k] is not None and _json_equal(target[k], subject_ref.get(k)) for k in ("identity", "revision", "scope"))


def _record_member_matches_for_carrier(
    matched_records: list[tuple[int, dict[str, Any]]],
    record_member: str,
    basis_ref: dict[str, Any],
    source_ref: dict[str, Any],
    source_index: int,
    carrier_index: int,
) -> list[dict[str, Any]]:
    matches: list[dict[str, Any]] = []
    for r_idx, rec in matched_records:
        if record_member == "provenance_refs":
            prefs = rec.get("provenance_refs", [])
            if isinstance(prefs, list):
                for m_idx, m_ref in enumerate(prefs):
                    if _ref_same(m_ref, basis_ref) and _ref_same(m_ref, source_ref):
                        matches.append({
                            "source_index": source_index, "carrier_index": carrier_index,
                            "record_index": r_idx, "member": "provenance_refs", "member_index": m_idx,
                        })
        elif record_member in _STAGE_REF_MEMBERS:
            m_ref = rec.get(record_member)
            if isinstance(m_ref, dict) and _ref_same(m_ref, basis_ref) and _ref_same(m_ref, source_ref):
                matches.append({
                    "source_index": source_index, "carrier_index": carrier_index,
                    "record_index": r_idx, "member": record_member, "member_index": None,
                })
    return matches


def _read_basis_cores(
    validated: dict[str, Any],
    raw: dict[str, Any],
    claim_index: int,
    claim: dict[str, Any],
    matched_records: list[tuple[int, dict[str, Any]]],
    *,
    required: bool,
) -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]], list[list[dict[str, Any]]]]:
    if "basis_refs" not in claim:
        return {"presence": "absent", "occurrences": []}, [], [], []
    basis_refs = claim["basis_refs"]
    if not basis_refs:
        return {"presence": "empty", "occurrences": []}, [], [], []
    if not required:
        return (
            {
                "presence": "supplied",
                "occurrences": [
                    {"basis_index": b_idx, "source_indices": [], "carrier_locations": [], "record_member_matches": [], "outcome": "not_required"}
                    for b_idx in range(len(basis_refs))
                ],
            },
            [], [], [],
        )

    sources = raw.get("sources", [])
    observed_src_indices: set[int] = set()
    joined_src_indices: set[int] = set()
    occurrences: list[dict[str, Any]] = []
    joined_carriers_per_basis: list[list[dict[str, Any]]] = []

    for b_idx, b_ref in enumerate(basis_refs):
        src_indices: list[int] = []
        carrier_locs: list[dict[str, int]] = []
        rec_member_matches: list[dict[str, Any]] = []
        valid_carriers: list[dict[str, Any]] = []
        any_failed_source_or_entry = False

        for s_idx, src in enumerate(sources):
            if not isinstance(src, dict) or not _ref_same(src.get("ref"), b_ref):
                continue
            src_indices.append(s_idx)
            observed_src_indices.add(s_idx)
            role = src.get("role")
            content = src.get("content")
            usable = _source_usable(validated, src.get("ref"))

            if role == "semantic_json" and isinstance(content, dict) and isinstance(content.get("promotion_evidence"), list):
                ev_list = content["promotion_evidence"]
                matching_entries: list[tuple[int, dict[str, Any]]] = []
                for c_idx, entry in enumerate(ev_list):
                    if not isinstance(entry, dict):
                        any_failed_source_or_entry = True
                        continue
                    if _json_equal(entry.get("claim_index"), claim_index) and _json_equal(entry.get("basis_index"), b_idx):
                        carrier_locs.append({"source_index": s_idx, "carrier_index": c_idx})
                        matching_entries.append((c_idx, entry))
                if not matching_entries or not usable or not isinstance(content.get("binding"), dict) or not _json_equal(content.get("binding"), claim["binding"]):
                    any_failed_source_or_entry = True
                    continue
                for c_idx, entry in matching_entries:
                    k_ref = entry.get("knowledge_ref")
                    r_mem = entry.get("record_member")
                    core_ok = (
                        _CARRIER_REQUIRED_KEYS.issubset(entry.keys())
                        and _is_nonneg_int(entry.get("claim_index"))
                        and _is_nonneg_int(entry.get("basis_index"))
                        and _json_equal(entry.get("claim"), claim)
                        and _json_equal(entry.get("basis_ref"), b_ref)
                        and _ref_shape_ok(k_ref)
                        and _ref_same(k_ref, claim["subject_ref"])
                        and _ref_same(k_ref, claim["binding"]["knowledge_ref"])
                        and all(_ref_same(k_ref, r["ref"]) for _, r in matched_records)
                        and _target_join_ok(entry.get("original_target"), claim["subject_ref"])
                        and isinstance(r_mem, str)
                        and r_mem in _RECORD_MEMBERS
                    )
                    if not core_ok:
                        any_failed_source_or_entry = True
                        continue
                    m_matches = _record_member_matches_for_carrier(matched_records, r_mem, b_ref, src["ref"], s_idx, c_idx)
                    if not m_matches:
                        any_failed_source_or_entry = True
                        continue
                    rec_member_matches.extend(m_matches)
                    valid_carriers.append(entry)
                    joined_src_indices.add(s_idx)
            else:
                any_failed_source_or_entry = True

        if not src_indices or any_failed_source_or_entry or not valid_carriers:
            outcome = "unresolved"
        else:
            outcome = "joined" if len(_unique_sorted(valid_carriers)) == 1 else "conflict"

        occurrences.append({
            "basis_index": b_idx, "source_indices": src_indices, "carrier_locations": carrier_locs,
            "record_member_matches": rec_member_matches, "outcome": outcome,
        })
        joined_carriers_per_basis.append(valid_carriers if outcome == "joined" else [])

    observed_source_refs = [copy.deepcopy(sources[i]["ref"]) for i in sorted(observed_src_indices)]
    joined_source_refs = [copy.deepcopy(sources[i]["ref"]) for i in sorted(joined_src_indices)]
    return {"presence": "supplied", "occurrences": occurrences}, observed_source_refs, joined_source_refs, joined_carriers_per_basis


def _eval_rule80(
    claim_kind: str, assoc_known: bool, unique_rec: dict[str, Any] | None,
    basis_reads: dict[str, Any], joined_carriers_per_basis: list[list[dict[str, Any]]],
) -> str:
    if claim_kind == "fill_definition":
        return "false"
    if claim_kind not in ("knowledge_accepted", "knowledge_promoted") or not assoc_known or unique_rec is None:
        return "unknown"
    occs = basis_reads["occurrences"]
    if not occs or any(o["outcome"] != "joined" for o in occs):
        return "unknown"
    all_carriers = [c for grp in joined_carriers_per_basis for c in grp]
    if not all_carriers:
        return "unknown"
    for c in all_carriers:
        if "original_stages" in c:
            return "unknown"
        ev_set = c.get("original_evidence_set")
        if not isinstance(ev_set, list) or not ev_set or any(not isinstance(r, str) or r not in _KNOWN_ROLES for r in ev_set):
            return "unknown"
    for c in all_carriers:
        ev_set = c["original_evidence_set"]
        r_mem = c["record_member"]
        for role_lit, target_mem in _ROLE_TO_STAGE_MEMBER.items():
            if role_lit in ev_set and r_mem == target_mem and _ref_shape_ok(unique_rec.get(target_mem)):
                return "false"
    if (
        all(all(r == "AI_generated" for r in c["original_evidence_set"]) and c["record_member"] == "provenance_refs" for c in all_carriers)
        and all(unique_rec.get(m) is None for m in ("evaluation_ref", "independent_verification_ref", "adoption_ref"))
    ):
        return "true"
    return "unknown"


def _eval_rule81(claim_kind: str, assoc_known: bool, unique_rec: dict[str, Any] | None) -> str:
    if claim_kind == "fill_definition":
        return "false"
    if claim_kind not in ("knowledge_accepted", "knowledge_promoted") or not assoc_known or unique_rec is None:
        return "unknown"
    if "evaluation_scope" not in unique_rec or unique_rec["evaluation_scope"] is None:
        return "true"
    scope = unique_rec["evaluation_scope"]
    if isinstance(scope, bool):
        return "false" if scope is True else "unknown"
    if isinstance(scope, (int, float)):
        return "false" if scope != 0 else "unknown"
    if isinstance(scope, (str, list, dict)):
        return "false" if len(scope) > 0 else "unknown"
    return "unknown"


def _eval_rule82(claim_kind: str, assoc_known: bool, unique_rec: dict[str, Any] | None) -> str:
    if claim_kind == "fill_definition":
        return "false"
    if claim_kind not in ("knowledge_accepted", "knowledge_promoted") or not assoc_known or unique_rec is None:
        return "unknown"
    if "independent_verification_ref" not in unique_rec or unique_rec["independent_verification_ref"] is None:
        return "true"
    return "unknown"


def _eval_rule83(
    claim: dict[str, Any], claim_kind: str, assoc_known: bool, unique_rec: dict[str, Any] | None,
    basis_reads: dict[str, Any], joined_carriers_per_basis: list[list[dict[str, Any]]],
) -> str:
    if claim_kind == "fill_definition":
        return "false"
    if claim_kind != "knowledge_accepted" or not assoc_known or unique_rec is None:
        return "unknown"
    occs = basis_reads["occurrences"]
    if not occs or any(o["outcome"] != "joined" for o in occs):
        return "unknown"
    basis_refs = claim.get("basis_refs", [])
    all_carriers = [c for grp in joined_carriers_per_basis for c in grp]
    if not basis_refs or not all_carriers or any(not _complete_ref_ok(b) for b in basis_refs):
        return "unknown"
    lim_ref = unique_rec.get("limited_adoption_ref")
    if (
        _complete_ref_ok(lim_ref)
        and all(_ref_same(b, lim_ref) for b in basis_refs)
        and all(c.get("record_member") == "limited_adoption_ref" for c in all_carriers)
        and unique_rec.get("adoption_ref") is None
    ):
        return "true"
    if all(c.get("record_member") in _NONLIMITED_RECORD_MEMBERS for c in all_carriers):
        if lim_ref is None:
            return "false"
        if _complete_ref_ok(lim_ref) and all(b["identity"] != lim_ref["identity"] for b in basis_refs):
            return "false"
    return "unknown"


def compare_knowledge_promotion(context: dict[str, object]) -> dict[str, object]:
    validated, raw = _validate_context_and_input(context)
    binding = copy.deepcopy(raw["binding"])
    if not raw["candidates"]:
        _validate_candidate_empty_domain(raw)
        return {"axes": [], "findings": [], "producer_symbol": "compare_knowledge_promotion", "input_binding": binding}

    selected = _selected_bindings(raw)
    axes = _knowledge_trace_axes(raw, selected)
    claims = raw.get("claims", [])
    if not claims:
        return {"axes": axes, "findings": [], "producer_symbol": "compare_knowledge_promotion", "input_binding": binding}

    records = raw.get("knowledge_records", [])
    findings: list[dict[str, Any]] = []

    for c_idx, claim in enumerate(claims):
        _validate_claim_witness_formation(claim, c_idx)
        c_subj, c_bind, c_kind = claim["subject_ref"], claim["binding"], claim["kind"]
        matched_records = [(r_idx, rec) for r_idx, rec in enumerate(records) if _ref_same(rec.get("ref"), c_subj)]
        distinct_recs = _unique_sorted([rec for _, rec in matched_records])
        assoc_known = (
            _ref_same(c_subj, c_bind["knowledge_ref"])
            and any(_json_equal(c_bind, sb) for sb in selected)
            and len(distinct_recs) == 1
            and all(_ref_same(rec["ref"], c_bind["knowledge_ref"]) for _, rec in matched_records)
        )
        unique_rec = distinct_recs[0] if assoc_known else None
        record_locators = [f"/knowledge_records/{r_idx}" for r_idx, _ in matched_records]
        observations = _build_observations(matched_records)
        base_orig_refs = [
            *(copy.deepcopy(b) for b in claim.get("basis_refs", [])),
            *(ref for _, rec in matched_records for ref in _record_original_refs(rec)),
        ]

        r80_req = assoc_known and c_kind in ("knowledge_accepted", "knowledge_promoted")
        b_reads_80, obs_srcs_80, joined_srcs_80, carriers_80 = _read_basis_cores(
            validated, raw, c_idx, claim, matched_records, required=r80_req
        )
        b_reads_not_req, _, _, _ = _read_basis_cores(validated, raw, c_idx, claim, matched_records, required=False)
        r83_req = assoc_known and c_kind == "knowledge_accepted"
        b_reads_83, obs_srcs_83, joined_srcs_83, carriers_83 = (
            (b_reads_80, obs_srcs_80, joined_srcs_80, carriers_80) if r83_req else (b_reads_not_req, [], [], [])
        )

        outcomes = {
            80: (_eval_rule80(c_kind, assoc_known, unique_rec, b_reads_80, carriers_80), b_reads_80, _sorted_values([*base_orig_refs, *obs_srcs_80]) if r80_req else _sorted_values(base_orig_refs), joined_srcs_80),
            81: (_eval_rule81(c_kind, assoc_known, unique_rec), b_reads_not_req, _sorted_values(base_orig_refs), []),
            82: (_eval_rule82(c_kind, assoc_known, unique_rec), b_reads_not_req, _sorted_values(base_orig_refs), []),
            83: (_eval_rule83(claim, c_kind, assoc_known, unique_rec, b_reads_83, carriers_83), b_reads_83, _sorted_values([*base_orig_refs, *obs_srcs_83]) if r83_req else _sorted_values(base_orig_refs), joined_srcs_83),
        }

        for rule_num in (80, 81, 82, 83):
            pred, b_reads, orig_refs, f_src_refs = outcomes[rule_num]
            if pred == "false":
                continue
            code, rule_ref, axis_name, true_state = _RULE_SPECS[rule_num]
            reason_str = _ordered({
                "code": code,
                "predicate": "condition_true" if pred == "true" else "predicate_unknown",
                "claim_locator": f"/claims/{c_idx}",
                "record_locators": record_locators,
                "observations": observations,
                "basis_reads": b_reads,
            })
            row_state = true_state if pred == "true" else "unknown"
            axes.append({
                "subject_ref": copy.deepcopy(c_subj), "binding": copy.deepcopy(c_bind), "axis": axis_name,
                "state": row_state, "original_refs": orig_refs, "reason": reason_str, "backflow_owner": "knowledge_owner",
            })
            if pred == "true":
                findings.append({
                    "code": code, "rule_ref": rule_ref, "subject_ref": copy.deepcopy(c_subj), "binding": copy.deepcopy(c_bind),
                    "axis": axis_name, "state": true_state, "source_refs": copy.deepcopy(f_src_refs),
                    "reason": reason_str, "backflow_owner": "knowledge_owner",
                })

    return {"axes": axes, "findings": findings, "producer_symbol": "compare_knowledge_promotion", "input_binding": binding}
