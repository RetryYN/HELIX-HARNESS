"""Occurrence-level Ref and per-Universe projection rules for FN11."""

from __future__ import annotations

import copy
from typing import Any

from candidate_ref_projection_json import (
    ABSENT,
    COMPARE_FIELDS,
    CollectionSlot,
    collection_sha256,
    json_equal,
    read_member,
    record_presence,
    ref_presence,
)


_OWNER_CATALOG = {
    "knowledge_definition_or_version": {
        "responsibility_source": "knowledge_definition_or_version",
        "recipient": "BRAIN",
        "qualification": "not_established_by_projection",
    },
    "product_requirement_value": {
        "responsibility_source": "product_requirement_value",
        "recipient": "HARNESS008",
        "qualification": "not_established_by_projection",
    },
    "application_contract_inconsistency": {
        "responsibility_source": "application_contract",
        "recipient": "HARNESS",
        "qualification": "not_established_by_projection",
    },
    "classification_unresolved": {
        "responsibility_source": "product_requirement_or_application_contract_unresolved",
        "recipient": "unresolved",
        "qualification": "not_established_by_projection",
    },
    "design_or_oracle_owner_unresolved": {
        "responsibility_source": "relevant_design_or_oracle_owner",
        "recipient": "unresolved",
        "qualification": "not_established_by_projection",
    },
}


def _owner(key: str) -> dict[str, str]:
    return copy.deepcopy(_OWNER_CATALOG[key])


def _field_state(record: Any, field: str) -> tuple[str, Any]:
    if not isinstance(record, dict) or field not in record:
        return "absent", ABSENT
    value = record[field]
    if value is None:
        return "null", None
    return "value", value


def _field_presence(record: Any) -> list[dict[str, Any]]:
    result = []
    for field in COMPARE_FIELDS:
        presence, value = _field_state(record, field)
        row = {"field": field, "presence": presence}
        if presence == "value":
            row["value"] = copy.deepcopy(value)
        result.append(row)
    return result


def _known_values(record: Any) -> list[dict[str, Any]]:
    result = []
    for field in COMPARE_FIELDS:
        presence, value = _field_state(record, field)
        if presence == "value":
            result.append({"field": field, "value": copy.deepcopy(value)})
    return result


def _occurrence_owner(
    relation: str, candidate_presence: list[dict[str, Any]], different: list[str]
) -> list[dict[str, str]]:
    if relation == "exact_ref" or relation == "unrelated_known_ref":
        return []
    if relation == "target_field_unresolved":
        return [_owner("classification_unresolved")]
    if relation == "candidate_field_unresolved":
        missing_identity_or_revision = any(
            row["field"] in {"identity", "revision"}
            and row["presence"] in {"absent", "null"}
            for row in candidate_presence
        )
        return [
            _owner(
                "knowledge_definition_or_version"
                if missing_identity_or_revision
                else "classification_unresolved"
            )
        ]
    if relation == "same_identity_revision_or_scope_mismatch":
        return [
            _owner(
                "knowledge_definition_or_version"
                if "revision" in different
                else "classification_unresolved"
            )
        ]
    return []


def compare_occurrence(
    candidate: Any, target: Any, side: str, target_index: int
) -> dict[str, Any]:
    candidate_presence = _field_presence(candidate)
    target_presence = _field_presence(target)
    different = []
    unresolved = []
    for field in COMPARE_FIELDS:
        left_state, left = _field_state(candidate, field)
        right_state, right = _field_state(target, field)
        if left_state != "value" or right_state != "value":
            unresolved.append(field)
        elif not json_equal(left, right):
            different.append(field)

    if not unresolved and not different:
        relation = "exact_ref"
    elif unresolved:
        candidate_missing = any(
            row["presence"] in {"absent", "null"} for row in candidate_presence
        )
        relation = (
            "candidate_field_unresolved"
            if candidate_missing
            else "target_field_unresolved"
        )
    else:
        left_identity_state, left_identity = _field_state(candidate, "identity")
        _, right_identity = _field_state(target, "identity")
        if (
            left_identity_state == "value"
            and right_identity is not ABSENT
            and json_equal(left_identity, right_identity)
            and ({"revision", "scope"} & set(different))
        ):
            relation = "same_identity_revision_or_scope_mismatch"
        else:
            relation = "unrelated_known_ref"

    return {
        "side": side,
        "target_index": target_index,
        "relation": relation,
        "candidate_record_presence": record_presence(candidate),
        "target_record_presence": record_presence(
            target, absent_allowed=target is ABSENT
        ),
        "candidate_field_presence": candidate_presence,
        "target_field_presence": target_presence,
        "different_fields": different,
        "unresolved_fields": unresolved,
        "candidate_values": _known_values(candidate),
        "target_values": _known_values(target),
        "return_owner_candidates": _occurrence_owner(
            relation, candidate_presence, different
        ),
    }


def _relation_state(comparisons: list[dict[str, Any]], target_count: int) -> str:
    if any(row["relation"] == "exact_ref" for row in comparisons):
        return "exact"
    if any(
        row["relation"] in {"candidate_field_unresolved", "target_field_unresolved"}
        for row in comparisons
    ):
        return "unknown"
    if any(
        row["relation"] == "same_identity_revision_or_scope_mismatch"
        for row in comparisons
    ):
        return "mismatch"
    if target_count == 0:
        return "empty"
    return "unrelated"


def _unique_fields(comparisons: list[dict[str, Any]], key: str) -> list[str]:
    present = {field for row in comparisons for field in row[key]}
    return [field for field in COMPARE_FIELDS if field in present]


def _context_state(universe: Any, candidate: Any, snapshot: Any) -> str:
    universe_ref = read_member(universe, "ref")
    universe_binding = read_member(universe, "binding")
    snapshot_ref = read_member(snapshot, "ref")
    snapshot_binding = read_member(snapshot, "binding")
    values = [
        read_member(universe_ref, "scope"),
        read_member(universe_binding, "product_scope"),
        read_member(candidate, "scope"),
        read_member(snapshot_ref, "scope"),
        read_member(snapshot_binding, "product_scope"),
    ]
    if any(value is ABSENT or value is None for value in values):
        return "unknown"
    first = values[0]
    return (
        "coherent"
        if all(json_equal(first, value) for value in values[1:])
        else "incoherent"
    )


def _state_owner(state: str) -> list[dict[str, str]]:
    mapping = {
        "corresponding_in_fixture": [],
        "not_corresponding": ["design_or_oracle_owner_unresolved"],
        "same_identity_revision_or_scope_mismatch": [],
        "unknown_ref_fields": [],
        "not_compared_snapshots_absent": ["classification_unresolved"],
        "not_compared_snapshots_null": ["classification_unresolved"],
        "not_compared_snapshots_invalid_type": ["classification_unresolved"],
        "no_universe_member": ["design_or_oracle_owner_unresolved"],
        "unresolved_universe_members_absent": ["classification_unresolved"],
        "unresolved_universe_members_null": ["classification_unresolved"],
        "unresolved_universe_members_invalid_type": ["classification_unresolved"],
        "universe_scope_unresolved": ["classification_unresolved"],
    }
    return [_owner(key) for key in mapping.get(state, [])]


def _dedupe_owners(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    output = []
    seen = set()
    for row in rows:
        key = (row["responsibility_source"], row["recipient"], row["qualification"])
        if key not in seen:
            seen.add(key)
            output.append(row)
    return output


def _universe_result(
    candidate: Any,
    candidate_index: int,
    universe: Any,
    universe_index: int,
    templates_slot: CollectionSlot,
) -> dict[str, Any]:
    if not isinstance(universe, dict):
        return {
            "universe_index": universe_index,
            "universe_ref_presence": "invalid_type",
            "universe_ref": copy.deepcopy(universe),
            "universe_members_presence": "invalid_type",
            "universe_members_sha256": None,
            "matching_universe_member_indices": [],
            "matching_template_snapshot_indices": [],
            "member_comparison_occurrences": [],
            "snapshot_comparison_occurrences": [],
            "different_fields": [],
            "unresolved_fields": [],
            "context_state": "not_evaluated",
            "projection_state": "unresolved_universe_members_invalid_type",
            "aggregate_classification": "unknown",
            "return_owner_candidates": _state_owner(
                "unresolved_universe_members_invalid_type"
            ),
            "context_return_owner_candidates": [],
        }

    universe_ref = read_member(universe, "ref")
    members_value = read_member(universe, "members")
    members_slot = (
        CollectionSlot("absent")
        if members_value is ABSENT
        else CollectionSlot(
            "null"
            if members_value is None
            else "invalid_type"
            if not isinstance(members_value, list)
            else "empty"
            if not members_value
            else "value",
            members_value,
        )
    )
    result = {
        "universe_index": universe_index,
        "universe_ref_presence": ref_presence(universe_ref),
        "universe_members_presence": members_slot.presence,
        "universe_members_sha256": collection_sha256(members_slot),
        "matching_universe_member_indices": [],
        "matching_template_snapshot_indices": [],
        "member_comparison_occurrences": [],
        "snapshot_comparison_occurrences": [],
        "different_fields": [],
        "unresolved_fields": [],
        "context_state": "not_evaluated",
        "projection_state": "not_corresponding",
        "aggregate_classification": "known_noncorresponding",
        "return_owner_candidates": [],
        "context_return_owner_candidates": [],
    }
    if universe_ref is not ABSENT:
        result["universe_ref"] = copy.deepcopy(universe_ref)

    member_comparisons = []
    member_relation = "empty"
    if members_slot.presence in {"empty", "value"}:
        member_comparisons = [
            compare_occurrence(candidate, raw_member, "universe_member_ref", index)
            for index, raw_member in enumerate(members_slot.value)
        ]
        result["member_comparison_occurrences"] = member_comparisons
        result["matching_universe_member_indices"] = [
            row["target_index"]
            for row in member_comparisons
            if row["relation"] == "exact_ref"
        ]
        member_relation = _relation_state(member_comparisons, len(members_slot.value))
    result["different_fields"] = _unique_fields(member_comparisons, "different_fields")
    result["unresolved_fields"] = _unique_fields(
        member_comparisons, "unresolved_fields"
    )

    state = None
    snapshot_comparisons = []
    context_states = []
    if any(
        _field_state(candidate, field)[0] in {"absent", "null"}
        for field in COMPARE_FIELDS
    ):
        state = "unknown_ref_fields"
    elif members_slot.presence == "absent":
        state = "unresolved_universe_members_absent"
    elif members_slot.presence == "null":
        state = "unresolved_universe_members_null"
    elif members_slot.presence == "invalid_type":
        state = "unresolved_universe_members_invalid_type"
    elif members_slot.presence == "empty":
        state = "no_universe_member"
    elif member_relation == "unknown":
        state = "unknown_ref_fields"
    elif member_relation == "mismatch":
        state = "same_identity_revision_or_scope_mismatch"
    elif member_relation != "exact":
        state = "not_corresponding"
    else:
        if templates_slot.presence == "absent":
            state = "not_compared_snapshots_absent"
        elif templates_slot.presence == "null":
            state = "not_compared_snapshots_null"
        elif templates_slot.presence == "invalid_type":
            state = "not_compared_snapshots_invalid_type"
        elif templates_slot.presence == "empty":
            state = "not_corresponding"
        else:
            snapshot_comparisons = [
                compare_occurrence(
                    candidate,
                    read_member(snapshot, "ref")
                    if isinstance(snapshot, dict)
                    else snapshot,
                    "template_snapshot_ref",
                    index,
                )
                for index, snapshot in enumerate(templates_slot.value)
            ]
            result["snapshot_comparison_occurrences"] = snapshot_comparisons
            result["matching_template_snapshot_indices"] = [
                row["target_index"]
                for row in snapshot_comparisons
                if row["relation"] == "exact_ref"
            ]
            snapshot_relation = _relation_state(
                snapshot_comparisons, len(templates_slot.value)
            )
            if snapshot_relation == "unknown":
                state = "unknown_ref_fields"
            elif snapshot_relation == "mismatch":
                state = "same_identity_revision_or_scope_mismatch"
            elif snapshot_relation != "exact":
                state = "not_corresponding"
            else:
                for index in result["matching_template_snapshot_indices"]:
                    context_states.append(
                        _context_state(universe, candidate, templates_slot.value[index])
                    )
                if any(value == "unknown" for value in context_states):
                    result["context_state"] = "unknown"
                    state = "universe_scope_unresolved"
                elif any(value == "incoherent" for value in context_states):
                    result["context_state"] = "incoherent"
                    state = "universe_scope_unresolved"
                else:
                    result["context_state"] = "coherent"
                    state = "corresponding_in_fixture"

    result["snapshot_comparison_occurrences"] = snapshot_comparisons
    result["different_fields"] = _unique_fields(
        member_comparisons + snapshot_comparisons, "different_fields"
    )
    result["unresolved_fields"] = _unique_fields(
        member_comparisons + snapshot_comparisons, "unresolved_fields"
    )
    result["projection_state"] = state
    classes = {
        "corresponding_in_fixture": "corresponding",
        "not_corresponding": "known_noncorresponding",
        "no_universe_member": "known_noncorresponding",
        "same_identity_revision_or_scope_mismatch": "unknown",
    }
    result["aggregate_classification"] = classes.get(state, "unknown")

    if state == "universe_scope_unresolved":
        result["context_return_owner_candidates"] = [
            _owner("classification_unresolved")
        ]
    if state == "corresponding_in_fixture":
        owners = []
    else:
        member_exact = member_relation == "exact"
        snapshot_exact = (
            _relation_state(snapshot_comparisons, len(snapshot_comparisons)) == "exact"
        )
        occurrence_owners = []
        if not member_exact:
            occurrence_owners.extend(
                owner
                for row in member_comparisons
                for owner in row["return_owner_candidates"]
            )
        if member_exact and not snapshot_exact:
            occurrence_owners.extend(
                owner
                for row in snapshot_comparisons
                for owner in row["return_owner_candidates"]
            )
        owners = occurrence_owners + _state_owner(state)
    result["return_owner_candidates"] = _dedupe_owners(owners)
    return result


def project_universe(
    candidate: Any,
    candidate_index: int,
    universe: Any,
    universe_index: int,
    templates_slot: CollectionSlot,
) -> dict[str, Any]:
    return _universe_result(
        candidate, candidate_index, universe, universe_index, templates_slot
    )
