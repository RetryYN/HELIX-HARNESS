"""Owner source acquisition for the staged descriptor target reader."""

from __future__ import annotations

import copy

from supply_validation import _ref_same, _source_usable


def _collect_owner_target_material(validated, claim):
    """Collect the original KB/provenance/source material without interpreting targets."""
    raw = validated.get("input") if isinstance(validated, dict) else None
    records = raw.get("knowledge_records") if isinstance(raw, dict) else None
    raw_sources = raw.get("sources") if isinstance(raw, dict) else None
    sources_present = isinstance(raw_sources, list)
    sources = raw_sources if sources_present else []
    if not isinstance(records, list):
        records = []

    material = {
        "knowledge_record_indices": [],
        "provenance": [],
        "sources": [],
        "boundaries": [],
    }
    semantic_source_unresolved_by_index = {}
    failed_source_boundaries = set()

    def boundary(locator):
        material["boundaries"].append({
            "locator": locator,
            "cause": "owner_source_unresolved",
        })

    for source_index, source in enumerate(sources):
        source_ref = source.get("ref") if isinstance(source, dict) else None
        semantic_source = isinstance(source, dict) and source.get("role") == "semantic_json"
        source_usable = semantic_source and _source_usable(validated, source_ref)
        semantic_source_unresolved_by_index[source_index] = semantic_source and not source_usable
        material["sources"].append({
            "source_index": source_index,
            "source": copy.deepcopy(source),
            "usable": source_usable,
        })

    binding = claim.get("binding") if isinstance(claim, dict) else None
    knowledge_ref = binding.get("knowledge_ref") if isinstance(binding, dict) else None
    if not isinstance(knowledge_ref, dict):
        boundary("/binding/knowledge_ref")
        return material

    matching_records = [
        (record_index, record)
        for record_index, record in enumerate(records)
        if isinstance(record, dict) and _ref_same(record.get("ref"), knowledge_ref)
    ]
    material["knowledge_record_indices"] = [index for index, _record in matching_records]
    if not matching_records:
        boundary("/knowledge_records")
        return material
    if len(matching_records) > 1:
        boundary("/knowledge_records")

    for record_index, record in matching_records:
        provenance_refs = record.get("provenance_refs")
        locator = f"/knowledge_records/{record_index}/provenance_refs"
        if not isinstance(provenance_refs, list) or not provenance_refs:
            boundary(locator)
            continue
        if not sources_present:
            boundary("/sources")
        for provenance_index, provenance_ref in enumerate(provenance_refs):
            source_indices = [
                source_index
                for source_index, source in enumerate(sources)
                if isinstance(source, dict)
                and _ref_same(source.get("ref"), provenance_ref)
            ]
            material["provenance"].append({
                "knowledge_record_index": record_index,
                "provenance_index": provenance_index,
                "ref": copy.deepcopy(provenance_ref),
                "source_indices": source_indices,
            })
            if not source_indices:
                if sources_present:
                    boundary(f"{locator}/{provenance_index}")
            for source_index in source_indices:
                if (
                    semantic_source_unresolved_by_index.get(source_index, False)
                    and source_index not in failed_source_boundaries
                ):
                    boundary(f"/sources/{source_index}")
                    failed_source_boundaries.add(source_index)

    return material


def read_descriptor_replacement_target(validated: dict, claim: dict, claim_locator: str) -> dict:
    """L5 private target port declaration; implementation follows frozen tests."""
    raise NotImplementedError(
        "F01/F02/descriptor_target_read_unimplemented: target address reader is not implemented; "
        "Backflow HELIXBRAIN-L6-032-N03-PATH"
    )
