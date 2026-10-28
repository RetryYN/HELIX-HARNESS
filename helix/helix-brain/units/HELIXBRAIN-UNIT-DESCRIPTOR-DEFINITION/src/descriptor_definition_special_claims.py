"""FN1 replacement claim special reads and same-call events."""

from __future__ import annotations

import copy
from typing import Any, Callable

from descriptor_definitions import _APPROVED_KINDS
from supply_validation import _json_equal


def _presence(value: Any, present: bool = True) -> dict[str, Any]:
    if not present:
        return {"presence": "absent"}
    return {"presence": "supplied", "value": copy.deepcopy(value)}


def _replacement_predicate_unresolved(
    support: Any, claim_binding: dict[str, Any]
) -> bool:
    if not isinstance(support, dict) or not isinstance(support.get("record"), dict):
        return True
    record = support["record"]
    kind = record.get("descriptor_kind")
    if kind not in _APPROVED_KINDS:
        return True
    if kind != "required input":
        return False
    basis_binding = record.get("basis_binding")
    basis_template = (
        basis_binding.get("template_ref") if isinstance(basis_binding, dict) else None
    )
    claim_template = claim_binding.get("template_ref")
    return not (
        isinstance(basis_template, dict)
        and isinstance(basis_template.get("identity"), str)
        and isinstance(claim_template, dict)
        and isinstance(claim_template.get("identity"), str)
    )


def project_replacement_claims(
    validated: dict[str, Any],
    claims: list[dict[str, Any]],
    target_reads: list[dict[str, Any]],
    intent_reads: list[dict[str, Any]],
    events: list[dict[str, Any]],
    event_factory: Callable[..., dict[str, Any]],
    stop: Callable[[str], None],
) -> list[dict[str, Any]]:
    """Read and project each raw fill Claim once in source order."""
    native: dict[str, list[Any]] = {"special_reads": []}
    # L5 schedules replacement support reads after every same-call target and
    # intent read. Each original fill Claim gets its own read, regardless of
    # intent, target outcome, basis presence, or support availability.
    special_claim_rows: list[tuple[int, dict[str, Any], int]] = []
    if claims:
        from descriptor_definition_reads import read_definition_special_support

        fill_ordinal = 0
        for claim_index, claim in enumerate(claims):
            if claim.get("kind") != "fill_definition":
                continue
            claim_locator = f"/claims/{claim_index}"
            request = {
                "request_kind": "replacement_claim",
                "request_locator": claim_locator,
            }
            read = read_definition_special_support(validated, request)
            if not isinstance(read, dict) or list(read) != [
                "request",
                "acquisition_state",
                "source_occurrences",
                "supports",
                "problems",
            ]:
                stop("special_read_shape")
            if (
                read["request"] != request
                or read["acquisition_state"] not in {"resolved", "unknown"}
                or not isinstance(read["source_occurrences"], list)
                or not isinstance(read["supports"], list)
                or not isinstance(read["problems"], list)
            ):
                stop("special_read_members")
            special_read_index = len(native["special_reads"])
            native["special_reads"].append(copy.deepcopy(read))
            special_claim_rows.append((fill_ordinal, claim, special_read_index))
            fill_ordinal += 1

    for fill_ordinal, claim, special_read_index in special_claim_rows:
        target = target_reads[fill_ordinal]
        intent = intent_reads[fill_ordinal]
        special_read = native["special_reads"][special_read_index]
        if intent.get("intent") != "positive" or target.get("state") != "resolved":
            continue
        claim_binding = claim.get("binding")
        claim_subject = claim.get("subject_ref")
        if not isinstance(claim_binding, dict) or not isinstance(claim_subject, dict):
            continue
        target_matches = target.get("matches")
        if not isinstance(target_matches, list):
            stop("special_target_matches")
        for target_match in target_matches:
            if not isinstance(target_match, dict):
                stop("special_target_match_shape")
            kind = target_match.get("descriptor_kind")
            slot_identity = target_match.get("slot_identity")
            if (
                kind not in {"required section", "required field"}
                or not isinstance(slot_identity, str)
                or not slot_identity
            ):
                continue
            target_slot_locators = target_match.get("slot_locators")
            if not isinstance(target_slot_locators, list) or not all(
                isinstance(item, str) for item in target_slot_locators
            ):
                stop("special_target_slot_locators")
            target_slot_identity = target_match.get("slot_identity")
            missing_causes = (
                {"required_slot_absent"}
                if not target_slot_locators
                else {"facts_absent_or_null_or_empty"}
            )
            missing_slot_identity = (
                {"presence": "absent"}
                if not target_slot_locators
                else _presence(target_slot_identity)
            )

            def primary_missing_matches(event: dict[str, Any]) -> bool:
                origin = event.get("origin")
                axis = event.get("axis")
                if not isinstance(origin, dict) or not isinstance(axis, dict):
                    return False
                if origin.get("cause") not in missing_causes:
                    return False
                event_locators = origin.get("slot_locators")
                locator_match = (
                    event_locators == []
                    if not target_slot_locators
                    else isinstance(event_locators, list)
                    and bool(event_locators)
                    and all(
                        isinstance(item, str) and item in target_slot_locators
                        for item in event_locators
                    )
                )
                key = origin.get("assessment_key")
                return (
                    locator_match
                    and axis.get("axis") == f"{kind}.definition"
                    and _json_equal(axis.get("binding"), claim_binding)
                    and isinstance(key, dict)
                    and _json_equal(key.get("slot_identity"), missing_slot_identity)
                )

            missing_events = [
                event for event in events if primary_missing_matches(event)
            ]
            if not missing_events:
                continue

            basis_refs = claim.get("basis_refs")
            basis_refs = basis_refs if isinstance(basis_refs, list) else []
            support_rows = special_read["supports"]
            cross_supports: list[tuple[int, dict[str, Any]]] = []
            for support_index, support in enumerate(support_rows):
                if (
                    not isinstance(support, dict)
                    or support.get("support_kind") != "replacement_claim"
                ):
                    continue
                use = support.get("record")
                if not isinstance(use, dict):
                    stop("special_support_record_shape")
                basis_binding = use.get("basis_binding")
                basis_template = (
                    basis_binding.get("template_ref")
                    if isinstance(basis_binding, dict)
                    else None
                )
                claim_template = claim_binding.get("template_ref")
                basis_identity = (
                    basis_template.get("identity")
                    if isinstance(basis_template, dict)
                    else None
                )
                claim_identity = (
                    claim_template.get("identity")
                    if isinstance(claim_template, dict)
                    else None
                )
                if (
                    use.get("descriptor_kind") == "required input"
                    and isinstance(basis_identity, str)
                    and isinstance(claim_identity, str)
                    and basis_identity != claim_identity
                ):
                    cross_supports.append((support_index, support))

            if cross_supports:
                for support_index, support in cross_supports:
                    use = support["record"]
                    ref_values = [ref for ref in basis_refs if isinstance(ref, dict)]
                    ref_values.append(target_match.get("target_ref"))
                    ref_values.extend(target_match.get("source_refs", []))
                    ref_values.extend(
                        [
                            support.get("source_ref"),
                            use.get("basis_ref"),
                            use.get("fact", {}).get("ref")
                            if isinstance(use.get("fact"), dict)
                            else None,
                            use.get("fact", {}).get("source_ref")
                            if isinstance(use.get("fact"), dict)
                            else None,
                        ]
                    )
                    original_refs = [
                        copy.deepcopy(ref)
                        for ref in ref_values
                        if isinstance(ref, dict)
                    ]
                    code = (
                        "cross_pattern_section_substitution"
                        if kind == "required section"
                        else "cross_pattern_field_substitution"
                    )
                    reason = (
                        "当該required sectionの定義不足を別Patternのrequired inputで補うことはできない。"
                        if kind == "required section"
                        else "当該required fieldの定義不足を別Patternのrequired inputで補うことはできない。"
                    )
                    axis = {
                        "subject_ref": copy.deepcopy(claim_subject),
                        "binding": copy.deepcopy(claim_binding),
                        "axis": f"{kind}.definition",
                        "state": "missing",
                        "original_refs": original_refs,
                        "reason": reason,
                        "backflow_owner": "knowledge_owner",
                    }
                    finding = {
                        "code": code,
                        "rule_ref": f"HELIXBRAIN-L5-032-R-{code}",
                        "subject_ref": copy.deepcopy(claim_subject),
                        "binding": copy.deepcopy(claim_binding),
                        "axis": f"{kind}.definition",
                        "state": "missing",
                        "source_refs": copy.deepcopy(original_refs),
                        "reason": reason,
                        "backflow_owner": "knowledge_owner",
                    }
                    source_refs = [
                        occurrence["source_ref"]
                        for occurrence in special_read["source_occurrences"]
                        if isinstance(occurrence, dict)
                        and isinstance(occurrence.get("source_ref"), dict)
                    ]
                    event = event_factory(
                        axis=axis,
                        slot={
                            "slot_identity": slot_identity,
                            "descriptor_kind": kind,
                            "binding": copy.deepcopy(claim_binding),
                        },
                        slot_locator=None,
                        slot_locators=copy.deepcopy(target_slot_locators),
                        fact_locators=[],
                        cause=code,
                        branch="existing_definition_result",
                        subject_ref=claim_subject,
                        binding=claim_binding,
                        special_read_indices=[special_read_index],
                        special_support_links=[
                            {
                                "special_read_index": special_read_index,
                                "support_index": support_index,
                            }
                        ],
                        sort_source_refs=source_refs,
                        assessment_key={
                            "binding": _presence(claim_binding),
                            "slot_identity": _presence(slot_identity),
                            "descriptor_kind": kind,
                        },
                    )
                    event["origin"]["finding_rule_indices"] = [
                        7 if kind == "required section" else 8
                    ]
                    event["findings"].append(finding)
                    events.append(event)
            elif not support_rows or any(
                _replacement_predicate_unresolved(support, claim_binding)
                for support in support_rows
            ):
                if not cross_supports:
                    reason = "当該原targetの不足と置換根拠の原分類・template対応を解決できない。"
                    axis = {
                        "subject_ref": copy.deepcopy(claim_subject),
                        "binding": copy.deepcopy(claim_binding),
                        "axis": f"{kind}.definition",
                        "state": "unknown",
                        "original_refs": [
                            copy.deepcopy(ref)
                            for ref in basis_refs
                            if isinstance(ref, dict)
                        ]
                        + [
                            copy.deepcopy(ref)
                            for ref in [
                                target_match.get("target_ref"),
                                *target_match.get("source_refs", []),
                            ]
                            if isinstance(ref, dict)
                        ],
                        "reason": reason,
                        "backflow_owner": "knowledge_owner",
                    }
                    events.append(
                        event_factory(
                            axis=axis,
                            slot={
                                "slot_identity": slot_identity,
                                "descriptor_kind": kind,
                                "binding": copy.deepcopy(claim_binding),
                            },
                            slot_locator=None,
                            slot_locators=copy.deepcopy(target_slot_locators),
                            fact_locators=[],
                            cause="replacement_basis_unresolved",
                            branch="source_unresolved",
                            subject_ref=claim_subject,
                            binding=claim_binding,
                            special_read_indices=[special_read_index],
                            sort_source_refs=[
                                occurrence["source_ref"]
                                for occurrence in special_read["source_occurrences"]
                                if isinstance(occurrence, dict)
                                and isinstance(occurrence.get("source_ref"), dict)
                            ],
                            assessment_key={
                                "binding": _presence(claim_binding),
                                "slot_identity": _presence(slot_identity),
                                "descriptor_kind": kind,
                            },
                        )
                    )

    return native["special_reads"]
