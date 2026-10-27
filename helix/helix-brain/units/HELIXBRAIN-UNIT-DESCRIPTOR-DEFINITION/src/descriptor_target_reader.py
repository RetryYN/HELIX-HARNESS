"""FN1の原Claim descriptor target住所reader。"""

from __future__ import annotations

import copy
from typing import Any

from supply_validation import (
    _binding_same,
    _binding_shape_ok,
    _json_equal,
    _ref_same,
    _ref_shape_ok,
    _source_usable,
)

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
    return {"presence": "supplied", "value": copy.deepcopy(value)} if _ref_shape_ok(value) else {"presence": "absent"}


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
    if _ref_same(claim_ref, target_ref):
        return "exact", True
    required = ("revision", "scope", "owner")
    if all(k in claim_ref and k in target_ref and claim_ref[k] is not None and target_ref[k] is not None for k in required):
        # Existing ref comparison treats a supplied digest disagreement as a known frame conflict.
        return "conflict", True
    return "unresolved", True


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
    binding = claim.get("binding")
    knowledge_ref = binding.get("knowledge_ref") if isinstance(binding, dict) else None
    records = raw.get("knowledge_records")
    if not _ref_shape_ok(knowledge_ref) or not isinstance(records, list):
        result["problems"].append(_problem("owner_source_unresolved", "/binding/knowledge_ref" if not _ref_shape_ok(knowledge_ref) else "/knowledge_records", None))
        return result
    records_found = [
        (i, row) for i, row in enumerate(records)
        if isinstance(row, dict) and _ref_same(row.get("ref"), knowledge_ref)
    ]
    if len(records_found) != 1:
        result["problems"].append(_problem("owner_source_unresolved", "/knowledge_records", None))
        return result
    record_index, record = records_found[0]
    provenance = record.get("provenance_refs")
    if not isinstance(provenance, list) or not provenance:
        result["problems"].append(_problem("owner_source_unresolved", f"/knowledge_records/{record_index}/provenance_refs", None))
        return result
    sources = raw.get("sources")
    if not isinstance(sources, list):
        result["problems"].append(_problem("owner_source_unresolved", "/sources", None))
        return result

    provenance_rows: list[tuple[int, Any, list[int]]] = []
    unresolved_provenance: list[tuple[int, Any]] = []
    for pindex, pref in enumerate(provenance):
        indices = [i for i, source in enumerate(sources)
                   if isinstance(source, dict) and _ref_same(source.get("ref"), pref)]
        if not indices:
            unresolved_provenance.append((pindex, pref))
        else:
            provenance_rows.append((pindex, pref, indices))
    for pindex, pref in unresolved_provenance:
        result["problems"].append(_problem("owner_source_unresolved", f"/knowledge_records/{record_index}/provenance_refs/{pindex}", None))

    source_indices = sorted({i for _, _, indices in provenance_rows for i in indices})
    if not source_indices:
        if not result["problems"]:
            result["problems"].append(_problem("owner_source_unresolved", "/knowledge_records", None))
        return result

    claim_ref = claim.get("subject_ref")
    candidate_template = binding.get("template_ref") if isinstance(binding, dict) else None
    matching_decls: list[dict[str, Any]] = []
    current_unknown = False
    current_conflict = False
    independent_frame_conflict = False
    has_unassociated_issue = False
    saw_empty_array = False

    for source_index in source_indices:
        source = sources[source_index]
        source_ref = source.get("ref") if isinstance(source, dict) else None
        source_locator = f"/sources/{source_index}"
        source_usable = _source_usable(validated, source_ref)
        if not source_usable:
            result["problems"].append(_problem("owner_source_unresolved", source_locator, source_ref))
        content = source.get("content")
        if not isinstance(content, dict):
            result["problems"].append(_problem("owner_source_unresolved", source_locator, source_ref))
            continue
        container_locator = f"{source_locator}/content/descriptor_targets"
        if "descriptor_targets" not in content:
            result["problems"].append(_problem("target_container_absent", container_locator, source_ref))
            continue
        declarations = content["descriptor_targets"]
        if declarations is None:
            result["problems"].append(_problem("target_container_null", container_locator, source_ref))
            continue
        if not isinstance(declarations, list):
            result["problems"].append(_problem("target_container_type", container_locator, source_ref))
            continue
        if not declarations:
            saw_empty_array = True
        source_binding_raw = content.get("binding")
        source_binding_ok = _binding_shape_ok(source_binding_raw)
        source_binding = copy.deepcopy(source_binding_raw) if source_binding_ok else None
        for declaration_index, declaration in enumerate(declarations):
            declaration_locator = f"{container_locator}/{declaration_index}"
            result["occurrences"].append({
                "source_ref": _presence_ref(source_ref),
                "source_locator": source_locator,
                "declaration_locator": declaration_locator,
                "declaration": copy.deepcopy(declaration),
                "source_binding": ({"presence": "supplied", "value": source_binding}
                                   if source_binding_ok else {"presence": "absent"}),
            })
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
                if not source_binding_ok:
                    result["problems"].append(_problem("binding_unresolved", f"{source_locator}/content/binding", source_ref))
                continue
            if relation == "unresolved":
                result["problems"].append(_problem("target_ref_unresolved", f"{declaration_locator}/target_ref", source_ref))
                if identity_matches:
                    current_unknown = True
                else:
                    has_unassociated_issue = True
                continue
            if relation == "conflict":
                result["problems"].append(_problem("target_ref_conflict", f"{declaration_locator}/target_ref", source_ref))
                if source_usable:
                    independent_frame_conflict = True
                continue

            if not source_usable:
                current_unknown = True
                continue

            if not source_binding_ok:
                result["problems"].append(_problem("binding_unresolved", f"{source_locator}/content/binding", source_ref))
                current_unknown = True
                continue
            if not _binding_same(source_binding_raw, binding):
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

    if saw_empty_array and not matching_decls and any(
        isinstance(sources[i], dict)
        and _source_usable(validated, sources[i].get("ref"))
        and isinstance(sources[i].get("content"), dict)
        and sources[i]["content"].get("descriptor_targets") == []
        for i in source_indices
    ):
        first = next((i for i in source_indices
                      if isinstance(sources[i], dict)
                      and isinstance(sources[i].get("content"), dict)
                      and sources[i]["content"].get("descriptor_targets") == []), source_indices[0])
        result["problems"].append(_problem(
            "target_not_declared", f"/sources/{first}/content/descriptor_targets", sources[first].get("ref")
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
        if (not matching_decls and not current_unknown and not independent_frame_conflict and not has_unassociated_issue
                and not any(p["kind"] in {"target_container_absent", "target_container_null", "target_container_type", "target_not_declared", "owner_source_unresolved"} for p in result["problems"])):
            first = source_indices[0]
            result["problems"].append(_problem("target_not_declared", f"/sources/{first}/content/descriptor_targets", sources[first].get("ref")))
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
