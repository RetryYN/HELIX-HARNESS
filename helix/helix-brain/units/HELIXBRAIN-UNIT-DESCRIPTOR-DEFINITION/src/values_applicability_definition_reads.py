"""F03 original field-definition read orchestration."""

from __future__ import annotations

import copy
from typing import Any

from descriptor_definitions import (
    _binding_same,
    _copy_refs_in_source_order,
    _owner_body_equal,
    _presence,
    _ref_same,
    _ref_shape_ok,
    _source_usable,
)
from values_applicability_reads import (
    _JUDGMENT_CAUSE_TABLE,
    _f03_stop,
    _read_f03_fact_meaning,
    _read_f03_field_descriptor_target,
    _read_f03_field_owner_record,
)


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
