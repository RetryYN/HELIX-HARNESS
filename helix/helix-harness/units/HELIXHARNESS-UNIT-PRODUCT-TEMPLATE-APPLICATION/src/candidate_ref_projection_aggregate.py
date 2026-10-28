"""Universe-to-link aggregation and finite return-owner candidate ordering for FN11."""

from __future__ import annotations

import copy
from typing import Any

from candidate_ref_projection_json import COMPARE_FIELDS, CollectionSlot
from candidate_ref_projection_occurrences import project_universe


_OWNER = {
    "knowledge_definition_or_version": {
        "responsibility_source": "knowledge_definition_or_version",
        "recipient": "BRAIN",
        "qualification": "not_established_by_projection",
    },
}


def _dedupe(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    result = []
    seen = set()
    for row in rows:
        key = (row["responsibility_source"], row["recipient"], row["qualification"])
        if key not in seen:
            seen.add(key)
            result.append(row)
    return result


def _field_union(results: list[dict[str, Any]], key: str) -> list[str]:
    fields = {field for row in results for field in row[key]}
    return [field for field in COMPARE_FIELDS if field in fields]


def _link_state(
    universes_slot: CollectionSlot, results: list[dict[str, Any]]
) -> tuple[str, str]:
    outer = {
        "absent": ("not_compared_universes_absent", "not_compared"),
        "null": ("not_compared_universes_null", "not_compared"),
        "empty": ("no_universe_entries", "not_compared"),
        "invalid_type": ("not_compared_universes_invalid_type", "not_compared"),
    }
    if universes_slot.presence in outer:
        return outer[universes_slot.presence]
    classifications = {row["aggregate_classification"] for row in results}
    if "corresponding" in classifications:
        return "corresponding_in_fixture", "corresponding"
    if "unknown" in classifications:
        return "unknown_ref_fields", "unknown"
    return "not_corresponding", "known_noncorresponding"


def project_link(
    candidate: Any,
    candidate_index: int,
    universes_slot: CollectionSlot,
    templates_slot: CollectionSlot,
) -> dict[str, Any]:
    universe_results = []
    if universes_slot.presence == "value":
        universe_results = [
            project_universe(candidate, candidate_index, raw, index, templates_slot)
            for index, raw in enumerate(universes_slot.value)
        ]
    state, classification = _link_state(universes_slot, universe_results)
    owners = (
        []
        if classification == "corresponding"
        else _dedupe(
            [
                owner
                for result in universe_results
                for owner in result["return_owner_candidates"]
            ]
        )
    )
    return {
        "candidate_index": candidate_index,
        "candidate_ref": copy.deepcopy(candidate),
        "universe_results": universe_results,
        "different_fields": _field_union(universe_results, "different_fields"),
        "unresolved_fields": _field_union(universe_results, "unresolved_fields"),
        "projection_state": state,
        "aggregate_classification": classification,
        "return_owner_candidates": owners,
    }


def input_presence_owners(presence: str) -> list[dict[str, str]]:
    if presence in {"absent", "null", "invalid_type"}:
        return [copy.deepcopy(_OWNER["knowledge_definition_or_version"])]
    return []
