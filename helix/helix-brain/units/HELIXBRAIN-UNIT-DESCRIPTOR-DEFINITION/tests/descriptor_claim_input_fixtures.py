"""正規fn0入力からFN1 descriptor target reader用のrawを組み立てる。"""

from __future__ import annotations

import copy

from identity_input_fixtures import _same_ref_without_digest, _write_source_content, trace_input


def descriptor_claim_input(mode="positive"):
    """既存qualified sourceに原target declarationを置いた独立rawを返す。"""
    supported = {
        "positive", "absent", "null", "type", "empty", "owner_source_unresolved",
        "declaration_shape", "same_slot_kind_conflict", "distinct_slot",
        "unrelated_target", "duplicate_declaration", "candidate_scope",
    }
    if mode not in supported:
        raise ValueError(f"unknown descriptor claim fixture mode: {mode}")

    raw = trace_input()
    source = raw["sources"][0]
    old_source_ref = copy.deepcopy(source["ref"])
    slot = raw["descriptors"][0]
    target_ref = copy.deepcopy(slot["facts"][0]["ref"])
    declaration = {
        "target_ref": copy.deepcopy(target_ref),
        "slot_identity": slot["slot_identity"],
        "descriptor_kind": slot["descriptor_kind"],
    }
    declarations = [copy.deepcopy(declaration)]
    if mode == "absent":
        declarations = None
    elif mode == "null":
        declarations = None
    elif mode == "type":
        declarations = "not-an-array"
    elif mode == "empty":
        declarations = []
    elif mode == "declaration_shape":
        declarations = [None]
    elif mode == "same_slot_kind_conflict":
        conflicting = copy.deepcopy(declaration)
        conflicting["descriptor_kind"] = "version"
        declarations.append(conflicting)
    elif mode == "distinct_slot":
        conflicting = copy.deepcopy(declaration)
        conflicting["slot_identity"] = f"{slot['slot_identity']}-other"
        declarations.append(conflicting)
    elif mode == "unrelated_target":
        unrelated = copy.deepcopy(declaration)
        unrelated["target_ref"]["identity"] += "-unrelated"
        unrelated["descriptor_kind"] = "unrecognized-kind"
        declarations.append(unrelated)
    elif mode == "duplicate_declaration":
        declarations.append(copy.deepcopy(declaration))

    content = copy.deepcopy(source["content"])
    if mode == "absent":
        content.pop("descriptor_targets", None)
    else:
        content["descriptor_targets"] = copy.deepcopy(declarations)
    _write_source_content(raw, source, content)
    new_source_ref = copy.deepcopy(source["ref"])

    # Keep source lookup on the existing KnowledgeRecord provenance and keep
    # the raw descriptor facts' source links synchronized with the source digest.
    for record in raw["knowledge_records"]:
        record["provenance_refs"] = [
            copy.deepcopy(new_source_ref)
            if _same_ref_without_digest(ref, old_source_ref)
            else copy.deepcopy(ref)
            for ref in record.get("provenance_refs", [])
        ]
    for descriptor in raw["descriptors"]:
        for fact in descriptor.get("facts", []):
            if _same_ref_without_digest(fact.get("source_ref"), old_source_ref):
                fact["source_ref"] = copy.deepcopy(new_source_ref)

    if mode == "owner_source_unresolved":
        # Preserve an otherwise well-formed claim and source; only the KB
        # provenance route is absent, so fn0 can still decode the raw snapshot.
        raw["knowledge_records"] = []
    if mode == "candidate_scope":
        raw["candidates"] = [
            copy.deepcopy(raw["binding"]["template_ref"]),
            copy.deepcopy(raw["binding"]["requirement_ref"]),
            copy.deepcopy(raw["binding"]["template_ref"]),
        ]

    raw["claims"] = [{
        "subject_ref": copy.deepcopy(target_ref),
        "binding": copy.deepcopy(raw["binding"]),
        "actor": "BRAIN",
        "kind": "fill_definition",
        "proposed_value": None,
        "basis_refs": [],
    }]
    return raw
