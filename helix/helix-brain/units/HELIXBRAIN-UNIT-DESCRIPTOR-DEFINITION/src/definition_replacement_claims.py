"""Finite fill replacement-claim target and projection helpers for FN1."""

from __future__ import annotations

import copy
from typing import Any

from supply_validation import (
    _APPROVED_KINDS,
    _binding_same,
    _binding_shape_ok,
    _copy_refs_in_source_order,
    _json_equal,
    _owner_body_equal,
    _ref_same,
    _ref_shape_ok,
    _source_usable,
)


def _resolve_fill_definition_target(
    validated: dict[str, Any],
    binding: dict[str, Any],
    subject_ref: Any,
    slots: list[dict[str, Any]],
) -> list[dict[str, Any]] | None:
    if not _ref_shape_ok(subject_ref):
        return None
    raw = validated["input"]
    knowledge_ref = binding["knowledge_ref"]
    provenance_refs = [
        prov_ref
        for record in raw["knowledge_records"]
        if isinstance(record, dict)
        and _ref_same(record.get("ref"), knowledge_ref)
        and isinstance(record.get("provenance_refs"), list)
        for prov_ref in record["provenance_refs"]
        if _ref_shape_ok(prov_ref)
    ]
    matches: list[dict[str, Any]] = []
    for source in raw["sources"]:
        if not isinstance(source, dict) or source.get("role") != "semantic_json":
            continue
        s_ref = source.get("ref")
        if not _source_usable(validated, s_ref) or not any(
            _ref_same(p_ref, s_ref) for p_ref in provenance_refs
        ):
            continue
        content = source.get("content")
        if not isinstance(content, dict) or not _binding_same(
            content.get("binding"), binding
        ):
            continue
        targets = content.get("descriptor_targets")
        if not isinstance(targets, list):
            continue
        for target in targets:
            if not isinstance(target, dict) or not _ref_shape_ok(
                target.get("target_ref")
            ):
                continue
            if not _ref_same(target["target_ref"], subject_ref):
                continue
            slot_id = target.get("slot_identity")
            kind = target.get("descriptor_kind")
            if (
                not isinstance(slot_id, str)
                or not slot_id
                or kind not in _APPROVED_KINDS
            ):
                return None
            if any(
                s.get("slot_identity") == slot_id and s.get("descriptor_kind") != kind
                for s in slots
            ):
                return None
            matches.append(
                {
                    "target_ref": copy.deepcopy(target["target_ref"]),
                    "slot_identity": slot_id,
                    "descriptor_kind": kind,
                    "source_refs": [copy.deepcopy(s_ref)],
                }
            )
    if (
        not matches
        or len({(m["slot_identity"], m["descriptor_kind"]) for m in matches}) != 1
    ):
        return None
    return matches


def _evaluate_replacement_claims(
    validated: dict[str, Any],
    binding: dict[str, Any],
    missing_kinds: set[str],
    emissions: list[tuple[dict[str, Any], dict[str, Any], list[Any], bool]],
    finding_emissions: list[tuple[dict[str, Any], dict[str, Any], list[Any], bool]],
) -> None:
    raw = validated["input"]
    slots = raw["descriptors"]
    for claim in raw["claims"]:
        if (
            not isinstance(claim, dict)
            or claim.get("kind") != "fill_definition"
            or not _binding_same(claim.get("binding"), binding)
        ):
            continue
        if "proposed_value" not in claim:
            continue
        if "basis_refs" not in claim:
            basis_refs: list[Any] = []
        else:
            basis_refs_raw = claim.get("basis_refs")
            if not isinstance(basis_refs_raw, list):
                continue
            basis_refs = basis_refs_raw
        target_matches = _resolve_fill_definition_target(
            validated, binding, claim.get("subject_ref"), slots
        )
        if not target_matches:
            continue
        target_slot_id = target_matches[0]["slot_identity"]
        target_kind = target_matches[0]["descriptor_kind"]
        if (
            target_kind not in ("required section", "required field")
            or target_kind not in missing_kinds
        ):
            continue
        slot_meta = {"slot_identity": target_slot_id}
        axis_name = f"{target_kind}.definition"
        special_source_refs: list[Any] = []
        supports: list[tuple[dict[str, Any], dict[str, Any]]] = []
        unresolved_basis = len(basis_refs) == 0
        for basis_ref in basis_refs:
            sem_sources = [
                s
                for s in raw["sources"]
                if isinstance(s, dict)
                and s.get("role") == "semantic_json"
                and _ref_same(s.get("ref"), basis_ref)
            ]
            if not sem_sources:
                unresolved_basis = True
                continue
            for b_source in sem_sources:
                b_ref = b_source.get("ref")
                if not _source_usable(validated, b_ref):
                    unresolved_basis = True
                    continue
                content = b_source.get("content")
                uses = (
                    content.get("replacement_basis_uses")
                    if isinstance(content, dict)
                    else None
                )
                groups = (
                    content.get("descriptor_facts")
                    if isinstance(content, dict)
                    else None
                )
                if not isinstance(uses, list) or not isinstance(groups, list):
                    unresolved_basis = True
                    continue
                matched_for_source = False
                for use in uses:
                    special_source_refs.append(b_ref)
                    if not isinstance(use, dict) or set(use) != {
                        "claim",
                        "basis_ref",
                        "basis_binding",
                        "slot_identity",
                        "descriptor_kind",
                        "fact",
                    }:
                        continue
                    b_binding = use.get("basis_binding")
                    u_fact = use.get("fact")
                    if (
                        not _json_equal(use.get("claim"), claim)
                        or not _ref_same(use.get("basis_ref"), basis_ref)
                        or not _ref_same(use.get("basis_ref"), b_ref)
                        or not _binding_shape_ok(b_binding)
                        or not _binding_same(b_binding, content.get("binding"))
                        or not isinstance(use.get("slot_identity"), str)
                        or not use["slot_identity"]
                        or use.get("descriptor_kind") not in _APPROVED_KINDS
                        or not isinstance(u_fact, dict)
                        or not _binding_same(u_fact.get("binding"), b_binding)
                    ):
                        continue
                    fact_matched = any(
                        isinstance(grp, dict)
                        and grp.get("slot_identity") == use["slot_identity"]
                        and grp.get("descriptor_kind") == use["descriptor_kind"]
                        and isinstance(grp.get("facts"), list)
                        and any(
                            isinstance(orig, dict)
                            and _ref_same(orig.get("ref"), u_fact.get("ref"))
                            and _owner_body_equal(orig, u_fact)
                            for orig in grp["facts"]
                        )
                        for grp in groups
                    )
                    if fact_matched:
                        supports.append((b_source, use))
                        matched_for_source = True
                if not matched_for_source:
                    unresolved_basis = True

        emitted_cross = False
        for b_source, use in supports:
            basis_template_id = use["basis_binding"]["template_ref"].get("identity")
            if (
                use["descriptor_kind"] == "required input"
                and binding["template_ref"].get("identity") != basis_template_id
            ):
                emitted_cross = True
                if target_kind == "required section":
                    code = "cross_pattern_section_substitution"
                    reason = "当該required sectionの定義不足を別Patternのrequired inputで補うことはできない。"
                else:
                    code = "cross_pattern_field_substitution"
                    reason = "当該required fieldの定義不足を別Patternのrequired inputで補うことはできない。"
                ref_col: list[Any] = [r for r in basis_refs if isinstance(r, dict)]
                for m in target_matches:
                    ref_col.append(m["target_ref"])
                    ref_col.extend(m["source_refs"])
                ref_col.extend(
                    [
                        b_source.get("ref"),
                        use.get("basis_ref"),
                        use["fact"].get("ref"),
                        use["fact"].get("source_ref"),
                    ]
                )
                orig_refs = _copy_refs_in_source_order(
                    [r for r in ref_col if isinstance(r, dict)]
                )
                emissions.append(
                    (
                        {
                            "subject_ref": copy.deepcopy(claim["subject_ref"]),
                            "binding": copy.deepcopy(binding),
                            "axis": axis_name,
                            "state": "missing",
                            "original_refs": orig_refs,
                            "reason": reason,
                            "backflow_owner": "knowledge_owner",
                        },
                        slot_meta,
                        special_source_refs,
                        True,
                    )
                )
                finding_emissions.append(
                    (
                        {
                            "code": code,
                            "rule_ref": f"HELIXBRAIN-L5-032-R-{code}",
                            "subject_ref": copy.deepcopy(claim["subject_ref"]),
                            "binding": copy.deepcopy(binding),
                            "axis": axis_name,
                            "state": "missing",
                            "source_refs": copy.deepcopy(orig_refs),
                            "reason": reason,
                            "backflow_owner": "knowledge_owner",
                        },
                        slot_meta,
                        special_source_refs,
                        True,
                    )
                )
        if not emitted_cross and unresolved_basis:
            ref_col = [r for r in basis_refs if isinstance(r, dict)]
            for m in target_matches:
                ref_col.append(m["target_ref"])
                ref_col.extend(m["source_refs"])
            orig_refs = _copy_refs_in_source_order(
                [r for r in ref_col if isinstance(r, dict)]
            )
            emissions.append(
                (
                    {
                        "subject_ref": copy.deepcopy(claim["subject_ref"]),
                        "binding": copy.deepcopy(binding),
                        "axis": axis_name,
                        "state": "unknown",
                        "original_refs": orig_refs,
                        "reason": "当該原targetの不足と置換根拠の原分類・template対応を解決できない。",
                        "backflow_owner": "knowledge_owner",
                    },
                    slot_meta,
                    special_source_refs,
                    True,
                )
            )
