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

from knowledge_promotion_reads import (
    F08_BACKFLOW_ID,
    _CARRIER_REQUIRED_KEYS,
    _KNOWN_ROLES,
    _NONLIMITED_RECORD_MEMBERS,
    _OTHER_EMPTY_COLLECTIONS,
    _REFERENCE_ONLY_ALLOWLIST,
    _RECORD_MEMBERS,
    _SEMANTIC_JSON_ALLOWLIST,
    _STAGE_REF_MEMBERS,
    _build_observations,
    _complete_ref_ok,
    _f08_stop,
    _is_nonneg_int,
    _knowledge_trace_axes,
    _member_presence_token,
    _read_basis_cores,
    _record_member_matches_for_carrier,
    _record_original_refs,
    _selected_bindings,
    _sorted_values,
    _target_join_ok,
    _unique_sorted,
    _validate_candidate_empty_domain,
    _validate_claim_witness_formation,
    _validate_context_and_input,
)


_ROLE_TO_STAGE_MEMBER = {
    "evaluation": "evaluation_ref",
    "independent_verification": "independent_verification_ref",
    "adoption_basis": "adoption_ref",
}
_RULE_SPECS = {
    80: (
        "generation_as_promotion",
        "HELIXBRAIN-L5-032-R-generation_as_promotion",
        "promotion",
        "unknown",
    ),
    81: (
        "evaluation_scope_missing",
        "HELIXBRAIN-L5-032-R-evaluation_scope_missing",
        "promotion",
        "unknown",
    ),
    82: (
        "independent_verification_missing",
        "HELIXBRAIN-L5-032-R-independent_verification_missing",
        "promotion",
        "unknown",
    ),
    83: (
        "limited_content_as_promotion",
        "HELIXBRAIN-L5-032-R-limited_content_as_promotion",
        "promotion_claim",
        "conflict",
    ),
}


def _eval_rule80(
    claim_kind: str,
    assoc_known: bool,
    unique_rec: dict[str, Any] | None,
    basis_reads: dict[str, Any],
    joined_carriers_per_basis: list[list[dict[str, Any]]],
) -> str:
    if claim_kind == "fill_definition":
        return "false"
    if (
        claim_kind not in ("knowledge_accepted", "knowledge_promoted")
        or not assoc_known
        or unique_rec is None
    ):
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
        if (
            not isinstance(ev_set, list)
            or not ev_set
            or any(not isinstance(r, str) or r not in _KNOWN_ROLES for r in ev_set)
        ):
            return "unknown"
    for c in all_carriers:
        ev_set = c["original_evidence_set"]
        r_mem = c["record_member"]
        for role_lit, target_mem in _ROLE_TO_STAGE_MEMBER.items():
            if (
                role_lit in ev_set
                and r_mem == target_mem
                and _ref_shape_ok(unique_rec.get(target_mem))
            ):
                return "false"
    if all(
        all(r == "AI_generated" for r in c["original_evidence_set"])
        and c["record_member"] == "provenance_refs"
        for c in all_carriers
    ) and all(
        unique_rec.get(m) is None
        for m in ("evaluation_ref", "independent_verification_ref", "adoption_ref")
    ):
        return "true"
    return "unknown"


def _eval_rule81(
    claim_kind: str, assoc_known: bool, unique_rec: dict[str, Any] | None
) -> str:
    if claim_kind == "fill_definition":
        return "false"
    if (
        claim_kind not in ("knowledge_accepted", "knowledge_promoted")
        or not assoc_known
        or unique_rec is None
    ):
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


def _eval_rule82(
    claim_kind: str, assoc_known: bool, unique_rec: dict[str, Any] | None
) -> str:
    if claim_kind == "fill_definition":
        return "false"
    if (
        claim_kind not in ("knowledge_accepted", "knowledge_promoted")
        or not assoc_known
        or unique_rec is None
    ):
        return "unknown"
    if (
        "independent_verification_ref" not in unique_rec
        or unique_rec["independent_verification_ref"] is None
    ):
        return "true"
    return "unknown"


def _eval_rule83(
    claim: dict[str, Any],
    claim_kind: str,
    assoc_known: bool,
    unique_rec: dict[str, Any] | None,
    basis_reads: dict[str, Any],
    joined_carriers_per_basis: list[list[dict[str, Any]]],
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
    if (
        not basis_refs
        or not all_carriers
        or any(not _complete_ref_ok(b) for b in basis_refs)
    ):
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
        if _complete_ref_ok(lim_ref) and all(
            b["identity"] != lim_ref["identity"] for b in basis_refs
        ):
            return "false"
    return "unknown"


def compare_knowledge_promotion(context: dict[str, object]) -> dict[str, object]:
    validated, raw = _validate_context_and_input(context)
    binding = copy.deepcopy(raw["binding"])
    if not raw["candidates"]:
        _validate_candidate_empty_domain(raw)
        return {
            "axes": [],
            "findings": [],
            "producer_symbol": "compare_knowledge_promotion",
            "input_binding": binding,
        }

    selected = _selected_bindings(raw)
    axes = _knowledge_trace_axes(raw, selected)
    claims = raw.get("claims", [])
    if not claims:
        return {
            "axes": axes,
            "findings": [],
            "producer_symbol": "compare_knowledge_promotion",
            "input_binding": binding,
        }

    records = raw.get("knowledge_records", [])
    findings: list[dict[str, Any]] = []

    for c_idx, claim in enumerate(claims):
        _validate_claim_witness_formation(claim, c_idx)
        c_subj, c_bind, c_kind = claim["subject_ref"], claim["binding"], claim["kind"]
        matched_records = [
            (r_idx, rec)
            for r_idx, rec in enumerate(records)
            if _ref_same(rec.get("ref"), c_subj)
        ]
        distinct_recs = _unique_sorted([rec for _, rec in matched_records])
        assoc_known = (
            _ref_same(c_subj, c_bind["knowledge_ref"])
            and any(_json_equal(c_bind, sb) for sb in selected)
            and len(distinct_recs) == 1
            and all(
                _ref_same(rec["ref"], c_bind["knowledge_ref"])
                for _, rec in matched_records
            )
        )
        unique_rec = distinct_recs[0] if assoc_known else None
        record_locators = [
            f"/knowledge_records/{r_idx}" for r_idx, _ in matched_records
        ]
        observations = _build_observations(matched_records)
        base_orig_refs = [
            *(copy.deepcopy(b) for b in claim.get("basis_refs", [])),
            *(ref for _, rec in matched_records for ref in _record_original_refs(rec)),
        ]

        r80_req = assoc_known and c_kind in ("knowledge_accepted", "knowledge_promoted")
        b_reads_80, obs_srcs_80, joined_srcs_80, carriers_80 = _read_basis_cores(
            validated, raw, c_idx, claim, matched_records, required=r80_req
        )
        b_reads_not_req, _, _, _ = _read_basis_cores(
            validated, raw, c_idx, claim, matched_records, required=False
        )
        r83_req = assoc_known and c_kind == "knowledge_accepted"
        b_reads_83, obs_srcs_83, joined_srcs_83, carriers_83 = (
            (b_reads_80, obs_srcs_80, joined_srcs_80, carriers_80)
            if r83_req
            else (b_reads_not_req, [], [], [])
        )

        outcomes = {
            80: (
                _eval_rule80(c_kind, assoc_known, unique_rec, b_reads_80, carriers_80),
                b_reads_80,
                _sorted_values([*base_orig_refs, *obs_srcs_80])
                if r80_req
                else _sorted_values(base_orig_refs),
                joined_srcs_80,
            ),
            81: (
                _eval_rule81(c_kind, assoc_known, unique_rec),
                b_reads_not_req,
                _sorted_values(base_orig_refs),
                [],
            ),
            82: (
                _eval_rule82(c_kind, assoc_known, unique_rec),
                b_reads_not_req,
                _sorted_values(base_orig_refs),
                [],
            ),
            83: (
                _eval_rule83(
                    claim, c_kind, assoc_known, unique_rec, b_reads_83, carriers_83
                ),
                b_reads_83,
                _sorted_values([*base_orig_refs, *obs_srcs_83])
                if r83_req
                else _sorted_values(base_orig_refs),
                joined_srcs_83,
            ),
        }

        for rule_num in (80, 81, 82, 83):
            pred, b_reads, orig_refs, f_src_refs = outcomes[rule_num]
            if pred == "false":
                continue
            code, rule_ref, axis_name, true_state = _RULE_SPECS[rule_num]
            reason_str = _ordered(
                {
                    "code": code,
                    "predicate": "condition_true"
                    if pred == "true"
                    else "predicate_unknown",
                    "claim_locator": f"/claims/{c_idx}",
                    "record_locators": record_locators,
                    "observations": observations,
                    "basis_reads": b_reads,
                }
            )
            row_state = true_state if pred == "true" else "unknown"
            axes.append(
                {
                    "subject_ref": copy.deepcopy(c_subj),
                    "binding": copy.deepcopy(c_bind),
                    "axis": axis_name,
                    "state": row_state,
                    "original_refs": orig_refs,
                    "reason": reason_str,
                    "backflow_owner": "knowledge_owner",
                }
            )
            if pred == "true":
                findings.append(
                    {
                        "code": code,
                        "rule_ref": rule_ref,
                        "subject_ref": copy.deepcopy(c_subj),
                        "binding": copy.deepcopy(c_bind),
                        "axis": axis_name,
                        "state": true_state,
                        "source_refs": copy.deepcopy(f_src_refs),
                        "reason": reason_str,
                        "backflow_owner": "knowledge_owner",
                    }
                )

    return {
        "axes": axes,
        "findings": findings,
        "producer_symbol": "compare_knowledge_promotion",
        "input_binding": binding,
    }
