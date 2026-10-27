"""FN1の原Claim descriptor target住所reader。"""

from __future__ import annotations

import copy
from typing import Any

from supply_validation import (
    _binding_same,
    _is_json_value,
    _json_equal,
    _ref_same,
    _source_usable,
    _wire_binding_shape_ok,
)


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


_KINDS = (
    "template identity", "version", "layer/pair", "applicability", "required input",
    "required section", "required field", "relation", "意味owner", "trace",
    "negative oracle", "measurement", "completion", "downstream kind", "supersession",
)

_REASONS = {
    "owner_source_unresolved": "同knowledge原record/provenanceから既存資格を満たすowner sourceへ解決できない。原所在と不足を保持する。",
    "target_container_absent": "owner原sourceにdescriptor_targets memberが供給されていない。targetを生成しない。",
    "target_container_null": "owner原sourceのdescriptor_targetsは明示nullである。targetを生成しない。",
    "target_container_type": "owner原sourceのdescriptor_targetsが配列型でない。原値を保持しtargetを生成しない。",
    "target_not_declared": "原Claimが指すtargetの明示owner対応を当該原scopeに得られない。欠落definitionからtargetを推定しない。",
    "declaration_shape": "owner原target宣言の構造を型付きviewへ対応できない。原宣言を保持する。",
    "target_ref_unresolved": "owner原target Refの比較必須memberが未供給/null/型外である。対応するtargetを補完しない。",
    "target_ref_conflict": "原Claimとowner宣言のtarget identityは同じだがrevision/scope/owner等の既存比較frameが既知に異なる。",
    "binding_unresolved": "owner原target宣言のfull Bindingを原Claim.bindingへ比較できない。原値を保持する。",
    "binding_conflict": "owner原target宣言のfull Bindingと原Claim.bindingが既知に異なる。原scopeを保持する。",
    "kind_unresolved": "owner原target宣言のdescriptor_kindが既決15名へ結べない。原値を保持する。",
    "target_ambiguous": "同じ原target Refに複数の異なるslot対応が宣言されている。先頭又は全scopeへの適用を推定せず全候補を保持する。",
    "target_mapping_conflict": "同target/slotの既知kind対応又はcaller slotの既知kind対応が相反する。原宣言と元slotを保持する。",
}


def _pointer(base: str, member: str) -> str:
    return f"{base}/{member.replace('~', '~0').replace('/', '~1')}"


def _presence_ref(value: Any) -> dict[str, Any]:
    return {"presence": "supplied", "value": copy.deepcopy(value)} if _typed_ref_shape(value) else {"presence": "absent"}


def _problem(kind: str, locator: str, source_ref: Any) -> dict[str, Any]:
    return {
        "kind": kind,
        "locator": locator,
        "reason": _REASONS[kind],
        "source_ref": _presence_ref(source_ref),
    }


def _json_equal_all(left: Any, right: Any) -> bool:
    return _json_equal(left, right)


def _full_ref_equal(left: Any, right: Any) -> bool:
    return _json_equal_all(left, right)


def _valid_decl(value: Any) -> bool:
    return (
        isinstance(value, dict)
        and "target_ref" in value
        and "slot_identity" in value
        and "descriptor_kind" in value
    )


def _ref_related(claim_ref: Any, target_ref: Any) -> tuple[str, bool]:
    """Return exact/unrelated/frame-conflict/unresolved and whether identity matches."""
    if not isinstance(target_ref, dict):
        return "unresolved", False
    identity = target_ref.get("identity")
    claim_identity = claim_ref.get("identity") if isinstance(claim_ref, dict) else None
    if not isinstance(identity, str) or not isinstance(claim_identity, str):
        return "unresolved", False
    if identity != claim_identity:
        return "unrelated", False
    if not _typed_ref_shape(target_ref) or not _typed_ref_shape(claim_ref):
        return "unresolved", True
    required = ("identity", "revision", "scope", "owner")
    if any(k not in claim_ref or k not in target_ref or claim_ref[k] is None or target_ref[k] is None for k in required):
        return "unresolved", True
    return ("exact", True) if _ref_same(claim_ref, target_ref) else ("conflict", True)


def _typed_ref_shape(value: Any) -> bool:
    if not isinstance(value, dict) or not set(value).issubset(
        {"identity", "revision", "scope", "owner", "source_locator", "sha256"}
    ):
        return False
    if any(key in value and not isinstance(value[key], (str, type(None)))
           for key in ("identity", "revision", "owner", "source_locator", "sha256")):
        return False
    return "scope" not in value or _is_json_value(value["scope"])


def _typed_binding_shape(value: Any) -> bool:
    members = {
        "template_ref", "knowledge_ref", "requirement_ref", "oracle_ref", "pack_ref",
        "pack_contract_version", "pack_artifact_version", "pack_dependency_versions", "version_target",
    }
    if not isinstance(value, dict) or set(value) != members:
        return False
    for name in ("template_ref", "knowledge_ref", "requirement_ref", "oracle_ref", "pack_ref"):
        if not _typed_ref_shape(value[name]):
            return False
    for name in ("pack_contract_version", "pack_artifact_version", "version_target"):
        if not isinstance(value[name], (str, type(None))):
            return False
    dependencies = value["pack_dependency_versions"]
    return isinstance(dependencies, list) and all(_typed_ref_shape(ref) for ref in dependencies)


def _binding_relation(left: Any, right: Any) -> str:
    """Compare full Bindings without turning missing required Ref data into conflict."""
    if not _typed_binding_shape(left) or not _typed_binding_shape(right):
        return "unresolved"
    ref_fields = ("template_ref", "knowledge_ref", "requirement_ref", "oracle_ref", "pack_ref")
    known_mismatch = False
    unresolved = False
    for name in ref_fields:
        relation, _ = _ref_related(left[name], right[name])
        if relation == "unresolved":
            unresolved = True
        elif relation in {"unrelated", "conflict"}:
            known_mismatch = True
    for name in ("pack_contract_version", "pack_artifact_version", "version_target"):
        if not _json_equal(left[name], right[name]):
            known_mismatch = True
    left_dependencies = left["pack_dependency_versions"]
    right_dependencies = right["pack_dependency_versions"]
    dependency_frames_complete = all(
        all(ref.get(name) is not None for name in ("identity", "revision", "scope", "owner"))
        for ref in left_dependencies + right_dependencies
    )
    if dependency_frames_complete:
        dependency_sets_same = (
            all(any(_ref_same(left_ref, right_ref) for right_ref in right_dependencies)
                for left_ref in left_dependencies)
            and all(any(_ref_same(right_ref, left_ref) for left_ref in left_dependencies)
                    for right_ref in right_dependencies)
        )
        if not dependency_sets_same:
            known_mismatch = True
    else:
        unresolved = True
    if known_mismatch:
        return "different"
    if unresolved:
        return "unresolved"
    return "same" if _binding_same(left, right) else "different"


def _slot_locators(raw: dict[str, Any], binding: Any, slot_identity: Any, kind: Any) -> list[str]:
    descriptors = raw.get("descriptors")
    if not isinstance(descriptors, list):
        return []
    found: list[str] = []
    for index, descriptor in enumerate(descriptors):
        if not isinstance(descriptor, dict):
            continue
        if (descriptor.get("slot_identity") == slot_identity
                and descriptor.get("descriptor_kind") == kind
                and _binding_same(descriptor.get("binding"), binding)):
            found.append(f"/descriptors/{index}")
    return found


def read_descriptor_replacement_target(validated, claim, claim_locator):
    """Read ownerの供給target住所を、slot/fact補完なしで返す。"""
    raw = validated.get("input") if isinstance(validated, dict) else None
    if (not isinstance(raw, dict) or not isinstance(claim_locator, str)
            or not isinstance(claim, dict) or claim.get("kind") != "fill_definition"):
        raise NotImplementedError("F01/F02/unclosed/descriptor_target_reader; Backflow HELIXBRAIN-L6-032-N03-PATH")
    claim_copy = copy.deepcopy(claim)
    raw_candidates = raw.get("candidates")
    candidates = raw_candidates if isinstance(raw_candidates, list) else []
    result = {
        "claim_locator": claim_locator,
        "claim": claim_copy,
        "candidate_indices": list(range(len(candidates))),
        "candidate_refs": copy.deepcopy(candidates),
        "occurrences": [],
        "matches": [],
        "state": "unknown",
        "problems": [],
    }
    owner_material = _collect_owner_target_material(validated, claim)
    material_sources = owner_material["sources"]
    material_provenance = owner_material["provenance"]
    material_record_indices = owner_material["knowledge_record_indices"]
    material_boundaries = owner_material["boundaries"]
    sources_by_index = {
        row.get("source_index"): row
        for row in material_sources
        if isinstance(row, dict) and isinstance(row.get("source_index"), int)
    }
    record_index_set = set(material_record_indices)
    source_indices = sorted({
        source_index
        for provenance_row in material_provenance
        if (isinstance(provenance_row, dict)
            and provenance_row.get("knowledge_record_index") in record_index_set
            and isinstance(provenance_row.get("source_indices"), list))
        for source_index in provenance_row["source_indices"]
        if isinstance(source_index, int)
    })
    for boundary in material_boundaries:
        locator = boundary["locator"]
        source_ref = None
        if locator.startswith("/sources/"):
            try:
                source_index = int(locator.split("/", 2)[2])
            except (IndexError, ValueError):
                source_index = None
            source_row = sources_by_index.get(source_index)
            source = source_row.get("source") if isinstance(source_row, dict) else None
            source_ref = source.get("ref") if isinstance(source, dict) else None
        result["problems"].append(_problem("owner_source_unresolved", locator, source_ref))

    binding = claim.get("binding")
    claim_ref = claim.get("subject_ref")
    candidate_template = binding.get("template_ref") if isinstance(binding, dict) else None
    matching_decls: list[dict[str, Any]] = []
    current_unknown = False
    current_conflict = False
    independent_frame_conflict = False
    has_unassociated_issue = False
    saw_empty_array = False
    first_empty_source_index = None

    for source_index in source_indices:
        source_row = sources_by_index.get(source_index)
        source = source_row["source"]
        source_ref = source.get("ref") if isinstance(source, dict) else None
        source_locator = f"/sources/{source_index}"
        source_usable = source_row["usable"]
        content = source.get("content")
        if not isinstance(content, dict):
            if source_usable:
                result["problems"].append(_problem("owner_source_unresolved", source_locator, source_ref))
            continue
        container_locator = f"{source_locator}/content/descriptor_targets"
        if "descriptor_targets" not in content:
            if source_usable:
                result["problems"].append(_problem("target_container_absent", container_locator, source_ref))
            continue
        declarations = content["descriptor_targets"]
        if declarations is None:
            if source_usable:
                result["problems"].append(_problem("target_container_null", container_locator, source_ref))
            continue
        if not isinstance(declarations, list):
            if source_usable:
                result["problems"].append(_problem("target_container_type", container_locator, source_ref))
            continue
        if source_usable and not declarations:
            saw_empty_array = True
            if first_empty_source_index is None:
                first_empty_source_index = source_index
        source_binding_raw = content.get("binding")
        source_binding_typed = _wire_binding_shape_ok(source_binding_raw)
        source_binding_ok = _typed_binding_shape(source_binding_raw)
        source_binding = copy.deepcopy(source_binding_raw) if source_binding_typed else None
        for declaration_index, declaration in enumerate(declarations):
            declaration_locator = f"{container_locator}/{declaration_index}"
            result["occurrences"].append({
                "source_ref": _presence_ref(source_ref),
                "source_locator": source_locator,
                "declaration_locator": declaration_locator,
                "declaration": copy.deepcopy(declaration),
                "source_binding": ({"presence": "supplied", "value": source_binding}
                                   if source_binding_typed else {"presence": "absent"}),
            })
            if not source_usable:
                continue
            if not _valid_decl(declaration):
                result["problems"].append(_problem("declaration_shape", declaration_locator, source_ref))
                has_unassociated_issue = True
                continue

            target_ref = declaration.get("target_ref")
            kind = declaration.get("descriptor_kind")
            slot_identity = declaration.get("slot_identity")
            kind_ok = isinstance(kind, str) and kind in _KINDS
            slot_ok = isinstance(slot_identity, str)
            if not kind_ok:
                result["problems"].append(_problem("kind_unresolved", f"{declaration_locator}/descriptor_kind", source_ref))
            if not slot_ok:
                result["problems"].append(_problem("declaration_shape", declaration_locator, source_ref))
            relation, identity_matches = _ref_related(claim_ref, target_ref)
            if relation == "unrelated":
                if (not _typed_ref_shape(target_ref)
                        or any(target_ref.get(member) is None
                               for member in ("identity", "revision", "scope", "owner"))):
                    result["problems"].append(_problem(
                        "target_ref_unresolved", f"{declaration_locator}/target_ref", source_ref
                    ))
                if not source_binding_ok:
                    result["problems"].append(_problem("binding_unresolved", f"{source_locator}/content/binding", source_ref))
                continue
            if relation == "unresolved":
                result["problems"].append(_problem("target_ref_unresolved", f"{declaration_locator}/target_ref", source_ref))
                if identity_matches:
                    if source_binding_ok and _binding_relation(source_binding_raw, binding) == "different":
                        result["problems"].append(_problem("binding_conflict", f"{source_locator}/content/binding", source_ref))
                        independent_frame_conflict = True
                    elif not source_binding_ok or _binding_relation(source_binding_raw, binding) == "unresolved":
                        result["problems"].append(_problem("binding_unresolved", f"{source_locator}/content/binding", source_ref))
                        current_unknown = True
                    else:
                        current_unknown = True
                else:
                    has_unassociated_issue = True
                continue
            if relation == "conflict":
                result["problems"].append(_problem("target_ref_conflict", f"{declaration_locator}/target_ref", source_ref))
                independent_frame_conflict = True
                continue

            if not source_binding_ok:
                result["problems"].append(_problem("binding_unresolved", f"{source_locator}/content/binding", source_ref))
                current_unknown = True
                continue
            binding_relation = _binding_relation(source_binding_raw, binding)
            if binding_relation == "unresolved":
                result["problems"].append(_problem("binding_unresolved", f"{source_locator}/content/binding", source_ref))
                current_unknown = True
                continue
            if binding_relation == "different":
                result["problems"].append(_problem("binding_conflict", f"{source_locator}/content/binding", source_ref))
                independent_frame_conflict = True
                continue

            if not kind_ok or not slot_ok:
                current_unknown = True
                continue
            matching_decls.append({
                "target_ref": copy.deepcopy(target_ref),
                "binding": copy.deepcopy(source_binding_raw),
                "slot_identity": slot_identity,
                "descriptor_kind": kind,
                "source_ref": copy.deepcopy(source_ref),
                "declaration_locator": declaration_locator,
                "source_index": source_index,
                "declaration_index": declaration_index,
            })

    if saw_empty_array and not matching_decls and first_empty_source_index is not None:
        source_row = sources_by_index[first_empty_source_index]
        first_empty_source = source_row["source"]
        result["problems"].append(_problem(
            "target_not_declared",
            f"/sources/{first_empty_source_index}/content/descriptor_targets",
            first_empty_source.get("ref") if isinstance(first_empty_source, dict) else None,
        ))
        current_unknown = True

    # Owner declarations with the same target/Binding/slot are one mapping
    # group, even when the group contains a caller-slot conflict as well.
    conflict_groups: list[list[dict[str, Any]]] = []
    for row in matching_decls:
        group = next((g for g in conflict_groups
                      if _ref_same(g[0]["target_ref"], row["target_ref"])
                      and _binding_same(g[0]["binding"], row["binding"])
                      and _json_equal_all(g[0]["slot_identity"], row["slot_identity"])), None)
        if group is None:
            conflict_groups.append([row])
        else:
            group.append(row)
    conflicting_owner_groups = [group for group in conflict_groups
                                if len({row["descriptor_kind"] for row in group}) > 1]
    for group in conflicting_owner_groups:
        first = group[0]
        current_conflict = True
        result["problems"].append(_problem(
            "target_mapping_conflict",
            f"/sources/{first['source_index']}/content/descriptor_targets",
            first["source_ref"],
        ))

    # A malformed/unknown declaration on another target is local. Only same-frame exact declarations join this cohort.
    for row in matching_decls:
        for slot_index, descriptor in enumerate(raw.get("descriptors", []) if isinstance(raw.get("descriptors"), list) else []):
            if not isinstance(descriptor, dict) or descriptor.get("slot_identity") != row["slot_identity"]:
                continue
            if not _binding_same(descriptor.get("binding"), row["binding"]):
                continue
            other_kind = descriptor.get("descriptor_kind")
            if other_kind != row["descriptor_kind"]:
                current_conflict = True
                owner_group_already_reports = any(
                    len({candidate["descriptor_kind"] for candidate in group}) > 1
                    and any(candidate is row for candidate in group)
                    for group in conflicting_owner_groups
                )
                if not owner_group_already_reports:
                    result["problems"].append(_problem("target_mapping_conflict", f"/descriptors/{slot_index}/descriptor_kind", row["source_ref"]))

    unique_slots: list[Any] = []
    for row in matching_decls:
        if not any(_json_equal_all(row["slot_identity"], slot) for slot in unique_slots):
            unique_slots.append(row["slot_identity"])
    if len(unique_slots) > 1:
        first = matching_decls[0]
        result["problems"].append(_problem("target_ambiguous", f"/sources/{first['source_index']}/content/descriptor_targets", first["source_ref"]))
        current_unknown = True

    # Same-target/current-frame unresolved members must suppress a partial match.
    if current_conflict or (not matching_decls and independent_frame_conflict):
        result["state"] = "conflict"
    elif current_unknown or not matching_decls:
        result["state"] = "unknown"
        if (source_indices and not matching_decls and not current_unknown and not independent_frame_conflict and not has_unassociated_issue
                and not any(p["kind"] in {"target_container_absent", "target_container_null", "target_container_type", "target_not_declared", "owner_source_unresolved"} for p in result["problems"])):
            first = source_indices[0]
            first_source_row = sources_by_index[first]
            first_source = first_source_row["source"]
            result["problems"].append(_problem(
                "target_not_declared",
                f"/sources/{first}/content/descriptor_targets",
                first_source.get("ref") if isinstance(first_source, dict) else None,
            ))
    else:
        result["state"] = "resolved"

    # Keep same-value repeats in one match, but keep optional-ref differences as separate rows.
    if result["state"] == "resolved":
        groups: list[list[dict[str, Any]]] = []
        for row in matching_decls:
            group = next((g for g in groups if _full_ref_equal(g[0]["target_ref"], row["target_ref"])
                          and _full_ref_equal(g[0]["binding"], row["binding"])
                          and _json_equal_all(g[0]["slot_identity"], row["slot_identity"])
                          and g[0]["descriptor_kind"] == row["descriptor_kind"]), None)
            if group is None:
                groups.append([row])
            else:
                group.append(row)
        for group in groups:
            first = group[0]
            candidate_pairs = [(i, ref) for i, ref in enumerate(candidates)
                               if _ref_same(candidate_template, ref)]
            result["matches"].append({
                "target_ref": copy.deepcopy(first["target_ref"]),
                "binding": copy.deepcopy(first["binding"]),
                "slot_identity": first["slot_identity"],
                "descriptor_kind": first["descriptor_kind"],
                "source_refs": [copy.deepcopy(row["source_ref"]) for row in group],
                "declaration_locators": [row["declaration_locator"] for row in group],
                "slot_locators": _slot_locators(raw, first["binding"], first["slot_identity"], first["descriptor_kind"]),
                "candidate_indices": [i for i, _ in candidate_pairs],
                "candidate_refs": [copy.deepcopy(ref) for _, ref in candidate_pairs],
            })

    # Deduplicate group-level issues while preserving source/declaration traversal order.
    compact: list[dict[str, Any]] = []
    seen: set[tuple[Any, ...]] = set()
    for problem in result["problems"]:
        key = (problem["kind"], problem["locator"], repr(problem["source_ref"]))
        if key not in seen:
            compact.append(problem)
            seen.add(key)
    result["problems"] = compact
    return result
