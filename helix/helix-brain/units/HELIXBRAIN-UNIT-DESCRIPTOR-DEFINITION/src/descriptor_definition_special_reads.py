"""FN1 replacement-Claim support reader, preserving raw source occurrences."""

from __future__ import annotations

import copy
from typing import Any


_USE_MEMBERS = {
    "claim",
    "basis_ref",
    "basis_binding",
    "slot_identity",
    "descriptor_kind",
    "fact",
}


def _problem(
    cause: str,
    source: Any,
    source_index: int | None,
    locator: str,
    container: Any,
    member: str | None,
) -> dict[str, object]:
    from descriptor_definition_reads import _presence

    reasons = {
        "source_unresolved": "当該原source又はその既存owner資格を解決できない。",
        "container_absent": "当該原sourceの要求されたcarrier memberが供給されていない。",
        "container_null": "当該原sourceの要求されたcarrier memberが明示nullである。",
        "container_type": "当該原sourceの要求されたcarrier memberが要求配列型でない。",
        "record_decode_failed": "原recordを当該closed logical recordへdecodeできない。原値を保持する。",
        "binding_unresolved": "原recordと現在の対象のfull Binding対応を確定できない。",
        "binding_differs": "原recordのfull Bindingが現在の対象と既知に相違する。",
        "slot_differs": "原recordのslot identityが現在の原slotと既知に相違する。",
        "kind_unresolved": "原recordのdescriptor kindを固定15分類へ解決できない。",
        "kind_differs": "原recordのdescriptor kindが現在の原slotと既知に相違する。",
    }
    return {
        "cause": cause,
        "source_ref": _presence(source, "ref")
        if isinstance(source, dict)
        else {"presence": "absent"},
        "source_index": source_index,
        "locator": locator,
        "original_value": _presence(container, member)
        if member is not None
        else {"presence": "supplied", "value": copy.deepcopy(container)},
        "reason": reasons[cause],
    }


def _wire_claim_shape_ok(value: Any) -> bool:
    from descriptor_definitions import (
        _is_json_value,
        _wire_binding_shape_ok,
        _wire_ref_shape_ok,
    )

    if not isinstance(value, dict) or not set(value) <= {
        "subject_ref",
        "binding",
        "actor",
        "kind",
        "proposed_value",
        "basis_refs",
    }:
        return False
    if "subject_ref" in value and not _wire_ref_shape_ok(value["subject_ref"]):
        return False
    if "binding" in value and not _wire_binding_shape_ok(value["binding"]):
        return False
    if (
        "actor" in value
        and value["actor"] is not None
        and not isinstance(value["actor"], str)
    ):
        return False
    if "kind" in value and not isinstance(value["kind"], str):
        return False
    if "proposed_value" in value and not _is_json_value(value["proposed_value"]):
        return False
    if "basis_refs" in value and (
        not isinstance(value["basis_refs"], list)
        or any(not _wire_ref_shape_ok(ref) for ref in value["basis_refs"])
    ):
        return False
    return True


def _wire_fact_shape_ok(value: Any) -> bool:
    from descriptor_definitions import (
        _is_json_value,
        _wire_binding_shape_ok,
        _wire_ref_shape_ok,
    )

    if not isinstance(value, dict) or not set(value) <= {
        "source_ref",
        "owner",
        "binding",
        "meaning",
        "condition",
        "reason",
        "oracle_ref",
        "ref",
    }:
        return False
    for name in ("source_ref", "ref"):
        if name in value and not _wire_ref_shape_ok(value[name]):
            return False
    if (
        "oracle_ref" in value
        and value["oracle_ref"] is not None
        and not _wire_ref_shape_ok(value["oracle_ref"])
    ):
        return False
    if "binding" in value and not _wire_binding_shape_ok(value["binding"]):
        return False
    for name in ("owner", "reason"):
        if (
            name in value
            and value[name] is not None
            and not isinstance(value[name], str)
        ):
            return False
    for name in ("meaning", "condition"):
        if name in value and not _is_json_value(value[name]):
            return False
    return True


def _wire_use_shape_ok(value: Any) -> bool:
    from descriptor_definitions import _wire_binding_shape_ok, _wire_ref_shape_ok

    return (
        isinstance(value, dict)
        and set(value) == _USE_MEMBERS
        and _wire_claim_shape_ok(value.get("claim"))
        and _wire_ref_shape_ok(value.get("basis_ref"))
        and _wire_binding_shape_ok(value.get("basis_binding"))
        and isinstance(value.get("slot_identity"), str)
        and isinstance(value.get("descriptor_kind"), str)
        and _wire_fact_shape_ok(value.get("fact"))
    )


def _usable_owner_groups(
    content: dict[str, Any], basis_binding: Any, fact: Any
) -> list[dict[str, Any]]:
    from descriptor_definitions import _owner_body_equal, _ref_same, _binding_same

    groups = content.get("descriptor_facts")
    if not isinstance(groups, list) or not isinstance(fact, dict):
        return []
    matching = []
    for group in groups:
        if not isinstance(group, dict) or not isinstance(group.get("facts"), list):
            continue
        for owner_fact in group["facts"]:
            if (
                isinstance(owner_fact, dict)
                and _binding_same(owner_fact.get("binding"), basis_binding)
                and _ref_same(owner_fact.get("ref"), fact.get("ref"))
                and _owner_body_equal(owner_fact, fact)
            ):
                matching.append(group)
                break
    return matching


def _read_definition_special_support(
    validated: dict[str, Any], request: dict[str, Any]
) -> dict[str, object]:
    """Read the original Claim's typed support from every matching source occurrence."""
    from descriptor_definitions import (
        _APPROVED_KINDS,
        _binding_shape_ok,
        _json_equal,
        _ref_same,
        _source_usable,
        _wire_binding_shape_ok,
        _wire_ref_shape_ok,
    )
    from descriptor_definition_reads import _presence, _resolve_pointer, _stop

    if (
        not isinstance(validated, dict)
        or not isinstance(validated.get("input"), dict)
        or not isinstance(request, dict)
        or set(request) != {"request_kind", "request_locator"}
        or request.get("request_kind") != "replacement_claim"
        or not isinstance(request.get("request_locator"), str)
    ):
        raise _stop("special_request_shape", "unsupported special-read request")
    raw = validated["input"]
    locator = request["request_locator"]
    claim = _resolve_pointer(raw, locator)
    if not isinstance(claim, dict) or claim.get("kind") != "fill_definition":
        raise _stop(
            "special_request_target",
            "request does not identify a fill_definition Claim",
        )

    result: dict[str, object] = {
        "request": copy.deepcopy(request),
        "acquisition_state": "unknown",
        "source_occurrences": [],
        "supports": [],
        "problems": [],
    }
    occurrences: list[dict[str, object]] = result["source_occurrences"]  # type: ignore[assignment]
    supports: list[dict[str, object]] = result["supports"]  # type: ignore[assignment]
    problems: list[dict[str, object]] = result["problems"]  # type: ignore[assignment]
    basis_refs = (
        claim.get("basis_refs") if isinstance(claim.get("basis_refs"), list) else []
    )
    sources = raw.get("sources")
    if not isinstance(sources, list):
        raise _stop("special_source_population", "sources is not a decoded array")

    for source_index, source in enumerate(sources):
        if not isinstance(source, dict) or source.get("role") != "semantic_json":
            continue
        source_ref = source.get("ref")
        direct_source = any(
            _ref_same(source_ref, basis_ref) for basis_ref in basis_refs
        )
        source_locator = f"/sources/{source_index}"
        if not _source_usable(validated, source_ref):
            if direct_source:
                problems.append(
                    _problem(
                        "source_unresolved",
                        source,
                        source_index,
                        source_locator,
                        source,
                        None,
                    )
                )
            continue
        if not _wire_ref_shape_ok(source_ref):
            # The source remains in the immutable input; it cannot form the
            # typed Ref column required by DefinitionSpecialRead.
            continue
        content = source.get("content")
        if not isinstance(content, dict):
            if direct_source:
                problems.append(
                    _problem(
                        "source_unresolved",
                        source,
                        source_index,
                        source_locator,
                        source,
                        None,
                    )
                )
            continue
        carrier_locator = f"{source_locator}/content/replacement_basis_uses"
        if "replacement_basis_uses" not in content:
            if direct_source:
                problems.append(
                    _problem(
                        "container_absent",
                        source,
                        source_index,
                        carrier_locator,
                        content,
                        "replacement_basis_uses",
                    )
                )
            continue
        uses = content["replacement_basis_uses"]
        if uses is None:
            if direct_source:
                problems.append(
                    _problem(
                        "container_null",
                        source,
                        source_index,
                        carrier_locator,
                        content,
                        "replacement_basis_uses",
                    )
                )
            continue
        if not isinstance(uses, list):
            if direct_source:
                problems.append(
                    _problem(
                        "container_type",
                        source,
                        source_index,
                        carrier_locator,
                        content,
                        "replacement_basis_uses",
                    )
                )
            continue

        for record_index, use in enumerate(uses):
            use_locator = f"{carrier_locator}/{record_index}"
            occurrence = {
                "source_ref": copy.deepcopy(source_ref),
                "source_index": source_index,
                "record_index": record_index,
                "locator": use_locator,
                "original_record": copy.deepcopy(use),
            }
            occurrences.append(occurrence)
            if not _wire_use_shape_ok(use):
                problems.append(
                    _problem(
                        "record_decode_failed",
                        source,
                        source_index,
                        use_locator,
                        use,
                        None,
                    )
                )
                continue

            if not _json_equal(use.get("claim"), claim) or not any(
                _ref_same(use.get("basis_ref"), basis_ref) for basis_ref in basis_refs
            ):
                continue

            source_binding = content.get("binding")
            record_binding = use.get("basis_binding")
            if not _wire_binding_shape_ok(source_binding):
                problems.append(
                    _problem(
                        "binding_unresolved",
                        source,
                        source_index,
                        f"{source_locator}/content/binding",
                        content,
                        "binding",
                    )
                )
                continue
            if not _binding_shape_ok(source_binding):
                problems.append(
                    _problem(
                        "binding_unresolved",
                        source,
                        source_index,
                        f"{source_locator}/content/binding",
                        content,
                        "binding",
                    )
                )
                continue
            if not _binding_shape_ok(record_binding):
                problems.append(
                    _problem(
                        "binding_unresolved",
                        source,
                        source_index,
                        f"{use_locator}/basis_binding",
                        use,
                        "basis_binding",
                    )
                )
                continue
            from descriptor_definitions import _binding_same

            if not _binding_same(source_binding, record_binding):
                problems.append(
                    _problem(
                        "binding_differs",
                        source,
                        source_index,
                        f"{use_locator}/basis_binding",
                        use,
                        "basis_binding",
                    )
                )
                continue

            fact = use.get("fact")
            owner_groups = _usable_owner_groups(content, record_binding, fact)
            if not owner_groups:
                continue

            group_tuples = [
                (group.get("slot_identity"), group.get("descriptor_kind"))
                for group in owner_groups
            ]
            diagnostic_tuple = group_tuples[0]
            diagnostic_owner_is_unambiguous = all(
                isinstance(slot_identity, str)
                and bool(slot_identity)
                and isinstance(kind, str)
                and kind in _APPROVED_KINDS
                for slot_identity, kind in group_tuples
            ) and all(value == diagnostic_tuple for value in group_tuples)
            raw_slot = use.get("slot_identity")
            raw_kind = use.get("descriptor_kind")
            if diagnostic_owner_is_unambiguous:
                owner_slot, owner_kind = diagnostic_tuple
                if raw_slot != owner_slot:
                    problems.append(
                        _problem(
                            "slot_differs",
                            source,
                            source_index,
                            f"{use_locator}/slot_identity",
                            use,
                            "slot_identity",
                        )
                    )
                    continue
                if not isinstance(raw_kind, str) or raw_kind not in _APPROVED_KINDS:
                    problems.append(
                        _problem(
                            "kind_unresolved",
                            source,
                            source_index,
                            f"{use_locator}/descriptor_kind",
                            use,
                            "descriptor_kind",
                        )
                    )
                    continue
                if raw_kind != owner_kind:
                    problems.append(
                        _problem(
                            "kind_differs",
                            source,
                            source_index,
                            f"{use_locator}/descriptor_kind",
                            use,
                            "descriptor_kind",
                        )
                    )
                    continue

            support_matches_owner = any(
                isinstance(group.get("slot_identity"), str)
                and bool(group.get("slot_identity"))
                and group.get("descriptor_kind") in _APPROVED_KINDS
                and raw_slot == group.get("slot_identity")
                and raw_kind == group.get("descriptor_kind")
                for group in owner_groups
            )
            if not support_matches_owner:
                continue
            supports.append(
                {
                    "source_ref": copy.deepcopy(source_ref),
                    "source_index": source_index,
                    "record_index": record_index,
                    "locator": use_locator,
                    "support_kind": "replacement_claim",
                    "record": copy.deepcopy(use),
                }
            )

    if supports:
        result["acquisition_state"] = "resolved"
    return result
