"""Actual FN0-FN6 Claim route fixtures for FN7 finite projection tests.

The raw input is derived from the repository's finite-carry fixture and keeps
existing qualification/provenance synchronized. These helpers do not create
Comparison, walk, frame, or ClaimUse values.
"""
from __future__ import annotations

import copy

from identity_input_fixtures import _same_ref_without_digest, _write_source_content
from test_oracle_finite_carry import _finite_input


OTHER_EMPTY_COLLECTIONS = (
    "meaning_comparisons", "section_fields", "values", "applicability_records",
    "relations", "oracle_bindings", "compatibility_records", "handoff_records",
)


def _same_ref(left, right):
    return _same_ref_without_digest(left, right)


def _owner_source_and_target(raw):
    binding = raw["binding"]
    records = [
        row for row in raw.get("knowledge_records", [])
        if isinstance(row, dict) and _same_ref(row.get("ref"), binding.get("knowledge_ref"))
    ]
    if len(records) != 1:
        raise AssertionError("fixture requires the unique original KnowledgeRecord")
    record = records[0]
    linked = [
        source for source in raw["sources"]
        if source.get("role") == "semantic_json"
        and any(_same_ref(source.get("ref"), ref) for ref in record.get("provenance_refs", []))
    ]
    for source in linked:
        for slot in raw.get("descriptors", []):
            for fact in slot.get("facts", []):
                if _same_ref(fact.get("source_ref"), source.get("ref")):
                    return record, source, slot, fact
    raise AssertionError("fixture has no provenance-linked semantic source/root fact")


def finite_claim_input(route: str, proposed_values=(None,)):
    """Construct one of the L4 finite raw branches without synthesizing a fact."""
    if route not in {"none", "unresolved", "rule87"}:
        raise ValueError(f"unsupported route fixture: {route}")
    raw = _finite_input("empty")
    record, source, original_slot, original_fact = _owner_source_and_target(raw)

    binding = copy.deepcopy(raw["binding"])
    target_ref = copy.deepcopy(original_fact["ref"])
    slot_identity = copy.deepcopy(original_slot["slot_identity"])
    descriptor_kind = original_slot["descriptor_kind"]
    required_kinds = copy.deepcopy(raw["required_descriptor_kinds"])
    if descriptor_kind not in required_kinds:
        raise AssertionError("original target kind must be in the retained required-kind population")
    old_source_ref = copy.deepcopy(source["ref"])

    # Empty caller descriptors avoid adding relation/fact metadata. Keep the
    # original 15 required kinds and save the independently declared owner target.
    raw["descriptors"] = []
    raw["candidates"] = []
    raw["required_descriptor_kinds"] = required_kinds
    for name in OTHER_EMPTY_COLLECTIONS:
        raw[name] = []
    raw.pop("dependencies", None)

    declaration = {
        "target_ref": copy.deepcopy(target_ref),
        "slot_identity": copy.deepcopy(slot_identity),
        "descriptor_kind": descriptor_kind,
    }
    content = {
        "binding": copy.deepcopy(binding),
        "descriptor_targets": [copy.deepcopy(declaration)],
        "definition_meaning_operations": [],
    }
    if route == "unresolved":
        other_kind = next(kind for kind in required_kinds if kind != descriptor_kind)
        conflicting = copy.deepcopy(declaration)
        conflicting["descriptor_kind"] = other_kind
        content["descriptor_targets"].append(conflicting)
    _write_source_content(raw, source, content)
    new_source_ref = copy.deepcopy(source["ref"])

    provenance = [
        copy.deepcopy(new_source_ref) if _same_ref(ref, old_source_ref) else copy.deepcopy(ref)
        for ref in record.get("provenance_refs", [])
    ]
    raw["knowledge_records"] = [{
        "ref": copy.deepcopy(record["ref"]),
        "provenance_refs": provenance,
    }]

    basis_refs = []
    if route == "rule87":
        # Use an existing source row, preserving its Ref; role and qualification
        # remain separate inputs and FN0 must still accept the whole source set.
        reference_sources = [
            source for source in raw["sources"]
            if source.get("role") == "reference_only"
        ]
        if not reference_sources:
            raw["sources"][1]["role"] = "reference_only"
            reference_sources = [raw["sources"][1]]
        reference_source = reference_sources[0]
        basis_refs = [
            copy.deepcopy(reference_source["ref"]),
            copy.deepcopy(reference_source["ref"]),
        ]

    raw["claims"] = [
        {
            "subject_ref": copy.deepcopy(target_ref),
            "binding": copy.deepcopy(binding),
            "actor": "BRAIN",
            "kind": "fill_definition",
            "proposed_value": copy.deepcopy(value),
            "basis_refs": copy.deepcopy(basis_refs),
        }
        for value in proposed_values
    ]
    return raw


if __name__ == "__main__":
    raise SystemExit("fixture module is imported by focused tests; it is not a runner")

