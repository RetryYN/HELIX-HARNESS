"""BRAIN032 F03/N03 値と適用（fn2 compare_values_and_applicability / _evaluate_field_values_detail）実装。"""

from __future__ import annotations

import copy
from typing import Any

from descriptor_definitions import (
    _binding_same,
    _comparison,
    _copy_refs_in_source_order,
    _n03_rule,
    _owner_body_equal,
    _presence,
    _ref_same,
    _ref_shape_ok,
    _same_claim_target,
    _source_usable,
    _write_f03b_comparison_from_existing_comparison,
)
from values_applicability_reads import (
    N03_BACKFLOW_ID,
    _JUDGMENT_CAUSE_TABLE,
    _f03_stop,
    _has_f03_carriers_or_null_applicability,
    _read_f03_fact_meaning,
    _read_f03_field_descriptor_target,
    _read_f03_field_owner_record,
)
from values_applicability_rows import (
    _build_f03_row,
    _validate_f03_row_preconditions,
)

_F03_RULE_SPECS: dict[int, tuple[str, str, str, str, str]] = {
    54: (
        "unknown_as_na",
        "HELIXBRAIN-L5-032-R-unknown_as_na",
        "field.value",
        "core_owner",
        "field定義は既知で案件値のみ未供給。field固有のqualified CORE判断がなくN/A claimを支えない。原値unknownを保存。",
    ),
    55: (
        "definition_as_value_gap",
        "HELIXBRAIN-L5-032-R-definition_as_value_gap",
        "field.definition",
        "knowledge_owner",
        "field固有の意味定義が欠落。返却claimが案件値の未決だけとしても原定義missingを消せない。",
    ),
    56: (
        "applicability_unknown_as_na",
        "HELIXBRAIN-L5-032-R-applicability_unknown_as_na",
        "applicability.evaluation",
        "core_owner",
        "元適用判断がunknownで、同fieldの非適用の原判断/理由/再評価根拠が未供給。",
    ),
    57: (
        "section_na_all_fields",
        "HELIXBRAIN-L5-032-R-section_na_all_fields",
        "field.applicability",
        "core_owner",
        "sectionへの根拠付きN/Aのみ存在し、field固有条件/理由/判定根拠が未供給。節の判断を全fieldへ転写しない。",
    ),
}

_REQUIRED_CLAIM_MEMBERS = {
    "subject_ref",
    "binding",
    "actor",
    "kind",
    "proposed_value",
    "basis_refs",
}


def _read_f03_original_field_definition(
    validated: dict[str, Any],
    field_locator: str,
    field: dict[str, Any],
    *,
    has_f03_mode: bool,
) -> dict[str, Any]:
    raw = validated["input"]
    binding = raw["binding"]
    field_ref = field["ref"]
    knowledge_ref = binding["knowledge_ref"]

    request = {
        "field_locator": field_locator,
        "field": _presence(field, present=True),
        "binding": _presence(binding, present=True),
    }
    owner_read = _read_f03_field_owner_record(
        validated, "field", field_locator, field, field_locator + "/ref", field_ref
    )
    target_read = _read_f03_field_descriptor_target(
        validated, field_locator, field, has_f03_mode=has_f03_mode
    )

    fact_reads: list[dict[str, Any]] = []
    pair_reads: list[dict[str, Any]] = []
    judgments: list[dict[str, Any]] = []
    meaning_refs = field.get("meaning_fact_refs")

    if owner_read["state"] != "resolved":
        orig_refs = [field_ref, field.get("descriptor_slot_ref")]
        if has_f03_mode:
            orig_refs.append(knowledge_ref)
        branch, state, reason = _JUDGMENT_CAUSE_TABLE["field_owner_unresolved"]
        judgments.append(
            {
                "branch": branch,
                "cause": "field_owner_unresolved",
                "state": state,
                "request_ref_index": None,
                "fact_read_indices": [],
                "meaning_support_indices": [],
                "pair_read_indices": [],
                "original_refs": _copy_refs_in_source_order(orig_refs),
                "original_reason": _presence(present=False),
                "original_semantic_basis": _presence(present=False),
                "reason": reason,
            }
        )
    else:
        owner_src_ref = owner_read["source_occurrences"][
            owner_read["supports"][0]["source_occurrence_index"]
        ]["source_ref"]
        invalid_refs_cause: str | None = None
        if "meaning_fact_refs" not in field:
            invalid_refs_cause = "meaning_refs_absent"
        elif meaning_refs is None:
            invalid_refs_cause = "meaning_refs_null"
        elif not isinstance(meaning_refs, list) or any(
            not _ref_shape_ok(r) for r in meaning_refs
        ):
            invalid_refs_cause = "meaning_refs_type"

        if invalid_refs_cause is not None:
            branch, state, reason = _JUDGMENT_CAUSE_TABLE[invalid_refs_cause]
            judgments.append(
                {
                    "branch": branch,
                    "cause": invalid_refs_cause,
                    "state": state,
                    "request_ref_index": None,
                    "fact_read_indices": [],
                    "meaning_support_indices": [],
                    "pair_read_indices": [],
                    "original_refs": _copy_refs_in_source_order(
                        [
                            field_ref,
                            field.get("descriptor_slot_ref"),
                            knowledge_ref,
                            owner_src_ref,
                        ]
                    ),
                    "original_reason": _presence(present=False),
                    "original_semantic_basis": _presence(present=False),
                    "reason": reason,
                }
            )
        else:
            if "meaning_comparisons" not in raw or not isinstance(
                raw["meaning_comparisons"], list
            ):
                raise _f03_stop(
                    "carrier_or_source_record_shape",
                    "meaning_comparisons is absent or not an array",
                )
            for comp_idx, comp in enumerate(raw["meaning_comparisons"]):
                if not isinstance(comp, dict):
                    raise _f03_stop(
                        "carrier_or_source_record_shape",
                        f"/meaning_comparisons/{comp_idx} is not an object",
                    )
                if any(
                    _ref_same(comp.get(side), mref)
                    for mref in meaning_refs
                    for side in ("left_fact_ref", "right_fact_ref")
                ):
                    raise _f03_stop(
                        "meaning_comparison_pair_read",
                        "F03 pair_reads with participating meaning_comparisons is outside this slice",
                    )
            if len(meaning_refs) == 0:
                branch, state, reason = _JUDGMENT_CAUSE_TABLE["meaning_refs_empty"]
                judgments.append(
                    {
                        "branch": branch,
                        "cause": "meaning_refs_empty",
                        "state": state,
                        "request_ref_index": None,
                        "fact_read_indices": [],
                        "meaning_support_indices": [],
                        "pair_read_indices": [],
                        "original_refs": _copy_refs_in_source_order(
                            [
                                field_ref,
                                field.get("descriptor_slot_ref"),
                                knowledge_ref,
                                owner_src_ref,
                            ]
                        ),
                        "original_reason": _presence(present=False),
                        "original_semantic_basis": _presence(present=False),
                        "reason": reason,
                    }
                )
            elif (
                target_read["state"] != "resolved"
                or not target_read["matches"][0]["slot_locators"]
            ):
                branch, state, reason = _JUDGMENT_CAUSE_TABLE["target_unknown"]
                for ref_idx, req_ref in enumerate(meaning_refs):
                    judgments.append(
                        {
                            "branch": branch,
                            "cause": "target_unknown",
                            "state": state,
                            "request_ref_index": ref_idx,
                            "fact_read_indices": [],
                            "meaning_support_indices": [],
                            "pair_read_indices": [],
                            "original_refs": _copy_refs_in_source_order(
                                [
                                    field_ref,
                                    field.get("descriptor_slot_ref"),
                                    knowledge_ref,
                                    owner_src_ref,
                                    req_ref,
                                ]
                            ),
                            "original_reason": _presence(present=False),
                            "original_semantic_basis": _presence(present=False),
                            "reason": reason,
                        }
                    )
            else:
                slot_locator = target_read["matches"][0]["slot_locators"][0]
                slot_idx = int(slot_locator.rsplit("/", 1)[-1])
                slot = raw["descriptors"][slot_idx]
                if (
                    not isinstance(slot, dict)
                    or "facts" not in slot
                    or not isinstance(slot["facts"], list)
                ):
                    raise _f03_stop(
                        "carrier_or_source_record_shape",
                        f"{slot_locator}/facts is absent or not an array",
                    )

                for ref_idx, req_ref in enumerate(meaning_refs):
                    req_loc = f"{field_locator}/meaning_fact_refs/{ref_idx}"
                    matched_fact_idx: int | None = None
                    matched_fact: dict[str, Any] | None = None
                    for f_idx, cand_fact in enumerate(slot["facts"]):
                        if isinstance(cand_fact, dict) and _ref_same(
                            cand_fact.get("ref"), req_ref
                        ):
                            matched_fact_idx = f_idx
                            matched_fact = cand_fact
                            break
                    if matched_fact is None or matched_fact_idx is None:
                        fact_read_idx = len(fact_reads)
                        fact_reads.append(
                            {
                                "request_locator": req_loc,
                                "requested_ref": _presence(req_ref, present=True),
                                "slot_locator": slot_locator,
                                "fact_locator": None,
                                "fact": _presence(present=False),
                                "attribution_read": {
                                    "state": "unknown",
                                    "supports": [],
                                    "problems": [],
                                },
                                "meaning_read": _presence(present=False),
                                "problems": [],
                            }
                        )
                        branch, state, reason = _JUDGMENT_CAUSE_TABLE[
                            "selected_fact_unresolved"
                        ]
                        judgments.append(
                            {
                                "branch": branch,
                                "cause": "selected_fact_unresolved",
                                "state": state,
                                "request_ref_index": ref_idx,
                                "fact_read_indices": [fact_read_idx],
                                "meaning_support_indices": [],
                                "pair_read_indices": [],
                                "original_refs": _copy_refs_in_source_order(
                                    [
                                        field_ref,
                                        field.get("descriptor_slot_ref"),
                                        knowledge_ref,
                                        owner_src_ref,
                                        req_ref,
                                    ]
                                ),
                                "original_reason": _presence(present=False),
                                "original_semantic_basis": _presence(present=False),
                                "reason": reason,
                            }
                        )
                        continue
                    fact_locator = f"{slot_locator}/facts/{matched_fact_idx}"

                    attr_supports: list[dict[str, Any]] = []
                    for s_idx, source in enumerate(raw["sources"]):
                        if (
                            not isinstance(source, dict)
                            or source.get("role") != "semantic_json"
                            or not _ref_same(
                                source.get("ref"), matched_fact.get("source_ref")
                            )
                            or not _source_usable(validated, source.get("ref"))
                        ):
                            continue
                        content = source.get("content")
                        if not isinstance(content, dict) or not _binding_same(
                            content.get("binding"), binding
                        ):
                            continue
                        if "descriptor_facts" not in content or not isinstance(
                            content["descriptor_facts"], list
                        ):
                            raise _f03_stop(
                                "carrier_or_source_record_shape",
                                f"/sources/{s_idx}/content/descriptor_facts is absent or not an array",
                            )
                        for g_idx, group in enumerate(content["descriptor_facts"]):
                            if not isinstance(group, dict):
                                raise _f03_stop(
                                    "carrier_or_source_record_shape",
                                    f"/sources/{s_idx}/content/descriptor_facts/{g_idx} is not an object",
                                )
                            if group.get("slot_identity") != slot.get("slot_identity"):
                                continue
                            if group.get("descriptor_kind") != slot.get(
                                "descriptor_kind"
                            ):
                                raise _f03_stop(
                                    "duplicate_conflicting_carrier_records",
                                    "descriptor_kind conflict in attribution_read",
                                )
                            if "facts" not in group or not isinstance(
                                group["facts"], list
                            ):
                                raise _f03_stop(
                                    "carrier_or_source_record_shape",
                                    f"/sources/{s_idx}/content/descriptor_facts/{g_idx}/facts is absent or not an array",
                                )
                            for gf_idx, orig_fact in enumerate(group["facts"]):
                                if (
                                    isinstance(orig_fact, dict)
                                    and _ref_same(
                                        orig_fact.get("ref"), matched_fact.get("ref")
                                    )
                                    and _owner_body_equal(orig_fact, matched_fact)
                                    and _binding_same(orig_fact.get("binding"), binding)
                                ):
                                    attr_supports.append(
                                        {
                                            "source_ref": copy.deepcopy(source["ref"]),
                                            "source_index": s_idx,
                                            "group_index": g_idx,
                                            "fact_index": gf_idx,
                                            "group_locator": f"/sources/{s_idx}/content/descriptor_facts/{g_idx}",
                                            "fact_locator": f"/sources/{s_idx}/content/descriptor_facts/{g_idx}/facts/{gf_idx}",
                                            "original_group": copy.deepcopy(group),
                                            "original_fact": copy.deepcopy(orig_fact),
                                        }
                                    )
                    if not attr_supports:
                        fact_read_idx = len(fact_reads)
                        fact_reads.append(
                            {
                                "request_locator": req_loc,
                                "requested_ref": _presence(req_ref, present=True),
                                "slot_locator": slot_locator,
                                "fact_locator": fact_locator,
                                "fact": _presence(matched_fact, present=True),
                                "attribution_read": {
                                    "state": "unknown",
                                    "supports": [],
                                    "problems": [],
                                },
                                "meaning_read": _presence(present=False),
                                "problems": [],
                            }
                        )
                        branch, state, reason = _JUDGMENT_CAUSE_TABLE[
                            "attribution_unknown"
                        ]
                        judgments.append(
                            {
                                "branch": branch,
                                "cause": "attribution_unknown",
                                "state": state,
                                "request_ref_index": ref_idx,
                                "fact_read_indices": [fact_read_idx],
                                "meaning_support_indices": [],
                                "pair_read_indices": [],
                                "original_refs": _copy_refs_in_source_order(
                                    [
                                        field_ref,
                                        field.get("descriptor_slot_ref"),
                                        knowledge_ref,
                                        owner_src_ref,
                                        matched_fact["ref"],
                                        matched_fact["source_ref"],
                                    ]
                                ),
                                "original_reason": _presence(present=False),
                                "original_semantic_basis": _presence(present=False),
                                "reason": reason,
                            }
                        )
                        continue
                    attribution_read = {
                        "state": "known",
                        "supports": attr_supports,
                        "problems": [],
                    }
                    meaning_read_val = _read_f03_fact_meaning(
                        validated, slot_locator, fact_locator, slot, matched_fact
                    )
                    if not meaning_read_val["supports"]:
                        fact_read_idx = len(fact_reads)
                        fact_reads.append(
                            {
                                "request_locator": req_loc,
                                "requested_ref": _presence(req_ref, present=True),
                                "slot_locator": slot_locator,
                                "fact_locator": fact_locator,
                                "fact": _presence(matched_fact, present=True),
                                "attribution_read": attribution_read,
                                "meaning_read": _presence(
                                    meaning_read_val, present=True
                                ),
                                "problems": [],
                            }
                        )
                        branch, state, reason = _JUDGMENT_CAUSE_TABLE[
                            "meaning_read_unresolved"
                        ]
                        judgments.append(
                            {
                                "branch": branch,
                                "cause": "meaning_read_unresolved",
                                "state": state,
                                "request_ref_index": ref_idx,
                                "fact_read_indices": [fact_read_idx],
                                "meaning_support_indices": [],
                                "pair_read_indices": [],
                                "original_refs": _copy_refs_in_source_order(
                                    [
                                        field_ref,
                                        field.get("descriptor_slot_ref"),
                                        knowledge_ref,
                                        owner_src_ref,
                                        matched_fact["ref"],
                                        matched_fact["source_ref"],
                                    ]
                                ),
                                "original_reason": _presence(present=False),
                                "original_semantic_basis": _presence(present=False),
                                "reason": reason,
                            }
                        )
                        continue

                    fact_read_idx = len(fact_reads)
                    fact_reads.append(
                        {
                            "request_locator": req_loc,
                            "requested_ref": _presence(req_ref, present=True),
                            "slot_locator": slot_locator,
                            "fact_locator": fact_locator,
                            "fact": _presence(matched_fact, present=True),
                            "attribution_read": attribution_read,
                            "meaning_read": _presence(meaning_read_val, present=True),
                            "problems": [],
                        }
                    )

                    for m_sup_idx, m_sup in enumerate(meaning_read_val["supports"]):
                        dec = m_sup["operation"]["decision"]
                        if (
                            dec.get("relation") != "defines_descriptor"
                            or dec["reason"].get("presence") != "supplied"
                            or not isinstance(dec["reason"].get("value"), str)
                            or dec["raw_semantic_basis"].get("presence") != "supplied"
                            or dec["raw_semantic_basis"].get("value") is None
                        ):
                            raise _f03_stop(
                                "meaning_operation_shape",
                                "non-positive or incomplete meaning decision",
                            )
                        branch, state, reason = _JUDGMENT_CAUSE_TABLE[
                            "meaning_positive"
                        ]
                        orig_refs = [
                            field_ref,
                            field.get("descriptor_slot_ref"),
                            knowledge_ref,
                            owner_src_ref,
                            matched_fact["ref"],
                            matched_fact["source_ref"],
                            m_sup["source_ref"],
                            m_sup["operation"]["operation_ref"],
                            *dec["basis_refs"],
                        ]
                        judgments.append(
                            {
                                "branch": branch,
                                "cause": "meaning_positive",
                                "state": state,
                                "request_ref_index": ref_idx,
                                "fact_read_indices": [fact_read_idx],
                                "meaning_support_indices": [m_sup_idx],
                                "pair_read_indices": [],
                                "original_refs": _copy_refs_in_source_order(orig_refs),
                                "original_reason": copy.deepcopy(dec["reason"]),
                                "original_semantic_basis": copy.deepcopy(
                                    dec["raw_semantic_basis"]
                                ),
                                "reason": reason,
                            }
                        )

    problems = (
        copy.deepcopy(owner_read["problems"])
        + copy.deepcopy(target_read["problems"])
        + [p for fr in fact_reads for p in fr["problems"]]
    )
    return {
        "request": request,
        "owner_read": owner_read,
        "target_read": target_read,
        "fact_reads": fact_reads,
        "pair_reads": pair_reads,
        "judgments": judgments,
        "problems": problems,
    }


def _evaluate_f03_claim_on_row(
    claim: dict[str, Any],
    row: dict[str, Any],
) -> tuple[int, dict[str, Any]] | None:
    if (
        set(claim.keys()) != _REQUIRED_CLAIM_MEMBERS
        or claim.get("actor") != "BRAIN"
        or not isinstance(claim.get("basis_refs"), list)
        or any(not _ref_shape_ok(r) for r in claim["basis_refs"])
    ):
        return None

    kind = claim.get("kind")
    proposed = claim.get("proposed_value")
    if kind == "value_only_gap":
        if proposed != "unknown":
            return None
        candidates = [55]
    elif kind == "field_not_applicable":
        if proposed != "not_applicable":
            return None
        candidates = [56, 54]
    elif kind == "all_section_fields_not_applicable":
        if proposed != "not_applicable":
            return None
        candidates = [57]
    else:
        return None

    events_by_axis: dict[str, list[dict[str, Any]]] = {}
    for ev in row["events"]:
        events_by_axis.setdefault(ev["axis"], []).append(ev)

    for rule_num in (55, 56, 54, 57):
        if rule_num not in candidates:
            continue
        if rule_num == 55:
            for ev in events_by_axis.get("field.definition", []):
                if ev["state"] == "missing" and ev["branch"] == "definition_empty":
                    return 55, ev
        elif rule_num == 56:
            for ev in events_by_axis.get("applicability.evaluation", []):
                if ev["state"] == "unknown" and ev["branch"] == "applicability_unknown":
                    return 56, ev
        elif rule_num == 54:
            def_known = (
                any(e["state"] == "known" for e in events_by_axis["field.definition"])
                if "field.definition" in events_by_axis
                else False
            )
            app_ok = (
                any(
                    e["state"] == "applicable"
                    for e in events_by_axis["applicability.evaluation"]
                )
                if "applicability.evaluation" in events_by_axis
                else False
            )
            if def_known and app_ok:
                for ev in events_by_axis.get("field.value", []):
                    if ev["state"] == "unknown":
                        return 54, ev
        elif rule_num == 57:
            for ev in events_by_axis.get("field.applicability", []):
                if ev["state"] == "unknown" and ev["branch"] == "parent_na_no_transfer":
                    return 57, ev

    return None


def evaluate_field_values_detail(context: dict[str, Any]) -> dict[str, Any]:
    """L4 F03BasicContextを受け、閉じたF03Evaluationを返す。"""
    if set(context) != {"snapshot", "definitions"}:
        raise _f03_stop("context_or_input_shape", "F03BasicContext closed shape")
    validated = context["snapshot"]
    definitions = context["definitions"]
    if not isinstance(validated, dict) or not isinstance(validated.get("input"), dict):
        raise _f03_stop(
            "context_or_input_shape", "F03 snapshot alias is not the validated input"
        )
    if (
        not isinstance(definitions, dict)
        or set(definitions) != {"axes", "findings", "producer_symbol", "input_binding"}
        or not isinstance(definitions.get("axes"), list)
        or not isinstance(definitions.get("findings"), list)
    ):
        raise _f03_stop(
            "context_or_input_shape",
            "F03 definitions is not a closed projected Comparison",
        )
    raw = validated["input"]
    binding = raw.get("binding")
    axes: list[dict[str, Any]] = []
    findings: list[dict[str, Any]] = []
    rows: list[dict[str, Any]] = []
    problems: list[dict[str, Any]] = []
    if (
        not isinstance(binding, dict)
        or "values" not in raw
        or "section_fields" not in raw
        or "claims" not in raw
    ):
        raise _f03_stop("context_or_input_shape", "fn2 required input presence branch")
    values = raw["values"]
    if not isinstance(values, list) or not isinstance(raw["claims"], list):
        raise _f03_stop("context_or_input_shape", "fn2 values/claims container branch")
    if any(not isinstance(value, dict) for value in values):
        raise _f03_stop("carrier_or_source_record_shape", "ValueFact decode branch")
    fields = raw["section_fields"]
    if not isinstance(fields, list):
        raise _f03_stop(
            "context_or_input_shape", "section_fields absence/null/type branch"
        )

    has_f03_mode = _has_f03_carriers_or_null_applicability(raw)

    for field_index, field in enumerate(fields):
        if not isinstance(field, dict):
            raise _f03_stop(
                "carrier_or_source_record_shape", "F03 section_field decode branch"
            )
        _validate_f03_row_preconditions(raw, field)
        field_locator = f"/section_fields/{field_index}"
        definition_read = _read_f03_original_field_definition(
            validated, field_locator, field, has_f03_mode=has_f03_mode
        )
        row, row_axes, row_problems = _build_f03_row(
            validated, field_index, field, definition_read, has_f03_mode=has_f03_mode
        )
        row["axis_indices"] = list(range(len(axes), len(axes) + len(row_axes)))
        axes.extend(row_axes)
        rows.append(row)
        problems.extend(row_problems)

    for claim in raw["claims"]:
        if not isinstance(claim, dict):
            raise _f03_stop(
                "carrier_or_source_record_shape", "Claim record is not an object"
            )
        matching_rows = [
            r
            for r in rows
            if _ref_same(claim.get("subject_ref"), r["field"].get("ref"))
        ]
        is_n03_claim_kind = claim.get("kind") in (
            "operation_deadline",
            "resource_capacity",
        )
        if not is_n03_claim_kind:
            if not _binding_same(claim.get("binding"), binding) or not matching_rows:
                continue
            if len(matching_rows) != 1:
                raise _f03_stop(
                    "duplicate_conflicting_carrier_records",
                    "Claim subject_ref matches multiple section_fields",
                )
            target_row = matching_rows[0]
            matched = _evaluate_f03_claim_on_row(claim, target_row)
            if matched is not None:
                rule_num, matched_event = matched
                code, rule_ref, axis_name, backflow_owner, reason = _F03_RULE_SPECS[
                    rule_num
                ]
                participating_refs = [
                    *matched_event["original_refs"],
                    claim["subject_ref"],
                    *claim["basis_refs"],
                ]
                finding_idx = len(findings)
                findings.append(
                    {
                        "code": code,
                        "rule_ref": rule_ref,
                        "subject_ref": copy.deepcopy(claim["subject_ref"]),
                        "binding": copy.deepcopy(claim["binding"]),
                        "axis": axis_name,
                        "state": matched_event["state"],
                        "source_refs": _copy_refs_in_source_order(participating_refs),
                        "reason": reason,
                        "backflow_owner": backflow_owner,
                    }
                )
                target_row["finding_indices"].append(finding_idx)
            continue

        matching_values = [
            value_fact for value_fact in values if _same_claim_target(claim, value_fact)
        ]
        if len(matching_values) != 1:
            raise NotImplementedError(
                f"Claim target must resolve to one same-frame ValueFact: Backflow {N03_BACKFLOW_ID}"
            )
        value_fact = matching_values[0]
        rule = _n03_rule(claim, value_fact)
        rule_ref, axis_name, owner, reason = rule
        participating_refs = [
            ref
            for ref in [
                value_fact.get("ref"),
                claim.get("subject_ref"),
                *claim["basis_refs"],
            ]
            if ref is not None
        ]
        finding = {
            "code": rule_ref.rsplit("-", 1)[-1],
            "rule_ref": rule_ref,
            "subject_ref": copy.deepcopy(claim["subject_ref"]),
            "binding": copy.deepcopy(claim["binding"]),
            "axis": axis_name,
            "state": "unknown",
            "source_refs": _copy_refs_in_source_order(participating_refs),
            "reason": reason,
            "backflow_owner": owner,
        }
        findings.append(finding)
        axes.append(
            {
                "subject_ref": copy.deepcopy(claim["subject_ref"]),
                "binding": copy.deepcopy(claim["binding"]),
                "axis": axis_name,
                "state": "unknown",
                "original_refs": _copy_refs_in_source_order(participating_refs),
                "reason": reason,
                "backflow_owner": owner,
            }
        )

    carried = [
        copy.deepcopy(axis)
        for axis in definitions["axes"]
        if isinstance(axis, dict)
        and axis.get("axis")
        in {"required section.definition", "required field.definition"}
    ]
    if carried:
        for row in rows:
            row["axis_indices"] = [
                index + len(carried) for index in row["axis_indices"]
            ]
    public = _comparison(
        carried + axes, findings, "compare_values_and_applicability", binding
    )
    f03_comparison = _write_f03b_comparison_from_existing_comparison(public)
    return {"comparison": f03_comparison, "rows": rows, "problems": problems}
