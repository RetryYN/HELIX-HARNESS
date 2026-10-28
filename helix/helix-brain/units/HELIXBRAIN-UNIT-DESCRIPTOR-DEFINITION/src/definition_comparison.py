"""BRAIN032 fn1 compare_descriptor_definitions と F01/F02 定義・帰属比較。"""

from __future__ import annotations

import copy
from typing import Any

from supply_validation import (
    _APPROVED_KINDS,
    _auxiliary_array_record_issue,
    _BINDING_REFS,
    _binding_same,
    _binding_shape_ok,
    _comparison,
    _copy_refs_in_source_order,
    _is_json_value,
    _json_equal,
    _ordered,
    _owner_body_equal,
    _ref_identity_same,
    _ref_same,
    _ref_shape_ok,
    _source_usable,
    _tag_unsupported,
    _unsupported,
)


def _attribution_axis(
    validated: dict[str, Any], slot: dict[str, Any], fact: dict[str, Any]
) -> dict[str, Any]:
    raw = validated["input"]
    sources = raw["sources"]
    refs = _copy_refs_in_source_order(
        [fact["source_ref"]] if isinstance(fact.get("source_ref"), dict) else []
    )
    binding = slot["binding"]
    knowledge_ref = binding.get("knowledge_ref") if isinstance(binding, dict) else None
    backflow = knowledge_ref.get("owner") if isinstance(knowledge_ref, dict) else None
    state = "unknown"
    reason = "caller factをqualified semantic_json sourceのowner原factへ結べない。"
    matches: list[str] = []
    unresolved_kind = False
    if _source_usable(validated, fact.get("source_ref")):
        for source in sources:
            if not isinstance(source, dict) or source.get("role") != "semantic_json":
                continue
            if not _ref_same(source.get("ref"), fact.get("source_ref")):
                continue
            content = source.get("content")
            if not isinstance(content, dict) or not _binding_same(
                content.get("binding"), binding
            ):
                continue
            if "descriptor_facts" not in content:
                continue
            groups = content["descriptor_facts"]
            if not isinstance(groups, list):
                raise _unsupported(
                    "F01",
                    "descriptor_facts_container",
                    "descriptor_facts is null or not an array",
                )
            for group in groups:
                if not isinstance(group, dict) or group.get(
                    "slot_identity"
                ) != slot.get("slot_identity"):
                    continue
                if "facts" not in group:
                    raise _unsupported(
                        "F01",
                        "descriptor_facts_member_absent",
                        "matching descriptor_facts group lacks facts",
                    )
                original_facts = group["facts"]
                if not isinstance(original_facts, list):
                    raise _unsupported(
                        "F01",
                        "descriptor_facts_member_type",
                        "matching descriptor_facts[].facts is not an array",
                    )
                for original in original_facts:
                    if (
                        isinstance(original, dict)
                        and _ref_same(original.get("ref"), fact.get("ref"))
                        and _owner_body_equal(original, fact)
                        and _binding_same(original.get("binding"), binding)
                    ):
                        kind = group.get("descriptor_kind")
                        if isinstance(kind, str) and kind in _APPROVED_KINDS:
                            matches.append(kind)
                        else:
                            unresolved_kind = True
        distinct_kinds = set(matches)
        if unresolved_kind:
            reason = "owner原groupのdescriptor_kindが未供給又は固定15 kind外。"
        elif distinct_kinds == {slot.get("descriptor_kind")}:
            state = "known"
            backflow = None
            reason = "owner source内の同一slot・full Binding・fact Ref/body・固定kindが一致する。帰属一致は意味完成を示さない。"
        elif distinct_kinds:
            state = "conflict"
            reason = "同一owner identity/binding/factにcaller kindと異なる既知kindが明示される。"
        else:
            reason = (
                "sourceは資格照合済みだがowner原factまたはslot kindの完全対応が未解決。"
            )
    return {
        "subject_ref": copy.deepcopy(fact.get("ref")),
        "binding": copy.deepcopy(binding),
        "axis": "descriptor.attribution",
        "state": state,
        "original_refs": refs,
        "reason": reason,
        "backflow_owner": backflow,
    }


def _meaning_resolution(
    validated: dict[str, Any], slot: dict[str, Any], fact: dict[str, Any]
) -> tuple[str, list[Any], str, list[Any]]:
    """同一fact→KnowledgeRecord provenance→実sourceを直接解決する。"""
    raw = validated["input"]
    binding = slot["binding"]
    refs: list[Any] = [fact.get("source_ref"), fact.get("ref")]
    source_ref = fact.get("source_ref")
    if "meaning" not in fact:
        raise _unsupported(
            "F01/F02", "meaning_body_absent", "MeaningFact.meaning is not supplied"
        )
    if fact.get("meaning") is None:
        raise _unsupported(
            "F01/F02", "meaning_body_null", "MeaningFact.meaning is null"
        )
    if not isinstance(source_ref, dict):
        return (
            "source_unresolved",
            refs,
            "当該MeaningFactの原source Refが未供給のためsource_unresolved。",
            [source_ref],
        )

    sources = raw["sources"]
    source_rows = [
        (index, source)
        for index, source in enumerate(sources)
        if isinstance(source, dict) and _ref_same(source.get("ref"), source_ref)
    ]
    usable_sources = [
        (index, source)
        for index, source in source_rows
        if _source_usable(validated, source_ref)
        and source.get("role") == "semantic_json"
    ]
    if not usable_sources:
        refs.extend(source.get("ref") for _, source in source_rows)
        return (
            "source_unresolved",
            refs,
            "当該MeaningFactのsourceは同snapshotでqualified semantic_json sourceへ解決できない。",
            [source_ref],
        )

    knowledge_ref = binding["knowledge_ref"]
    knowledge_records = raw["knowledge_records"]
    records = [
        record
        for record in knowledge_records
        if isinstance(record, dict) and _ref_same(record.get("ref"), knowledge_ref)
    ]
    if not records:
        return (
            "source_unresolved",
            refs,
            "同じBindingの原KnowledgeRecordが未供給のためprovenanceを解決できない。",
            [source_ref],
        )

    saw_matching_provenance = False
    definition_source_refs: list[Any] = [source_ref]
    first_unresolved: tuple[str, str] | None = None
    for record in records:
        if "provenance_refs" not in record:
            raise _unsupported(
                "F01/F02",
                "knowledge_provenance_absent",
                "matching KnowledgeRecord lacks provenance_refs",
            )
        provenance = record["provenance_refs"]
        if not isinstance(provenance, list):
            raise _unsupported(
                "F01/F02",
                "knowledge_provenance_type",
                "KnowledgeRecord.provenance_refs is not an array",
            )
        for provenance_ref in provenance:
            if not _ref_identity_same(provenance_ref, source_ref):
                continue
            saw_matching_provenance = True
            if first_unresolved is None:
                refs.append(provenance_ref)
            direct_sources = [
                (index, source)
                for index, source in enumerate(sources)
                if isinstance(source, dict)
                and _ref_identity_same(source.get("ref"), provenance_ref)
            ]
            for index, source in direct_sources:
                actual_ref = source.get("ref")
                definition_source_refs.append(actual_ref)
                if first_unresolved is not None:
                    continue
                refs.append(actual_ref)
                expected_digest = provenance_ref.get("sha256")
                actual_digest = (
                    actual_ref.get("sha256") if isinstance(actual_ref, dict) else None
                )
                if (
                    expected_digest is not None
                    and actual_digest is not None
                    and expected_digest != actual_digest
                ):
                    first_unresolved = (
                        "source_unresolved",
                        f"KnowledgeRecord provenance digestと実source digestが一致しない（source index {index}）。",
                    )
                    continue
                if not _ref_same(provenance_ref, actual_ref) or not _source_usable(
                    validated, actual_ref
                ):
                    continue
                content = source.get("content")
                if (
                    not isinstance(content, dict)
                    or "definition_meaning_operations" not in content
                ):
                    first_unresolved = (
                        "container_absent",
                        "資格済み原sourceにdefinition_meaning_operations carrierが未供給。",
                    )
                    continue
                operations = content.get("definition_meaning_operations")
                if not isinstance(operations, list):
                    raise _unsupported(
                        "F01/F02",
                        "definition_meaning_operations_container",
                        "definition_meaning_operations is null or not an array",
                    )
                raise _unsupported(
                    "F01/F02",
                    "typed_definition_meaning_operation",
                    "meaning-operation success evaluation is outside the implemented path",
                )
    if not saw_matching_provenance:
        return (
            "source_unresolved",
            refs,
            "同じBindingのKnowledgeRecordに当該原source provenanceが無い。",
            definition_source_refs,
        )
    if first_unresolved is not None:
        return first_unresolved[0], refs, first_unresolved[1], definition_source_refs
    return (
        "source_unresolved",
        refs,
        "原provenanceからqualified sourceへの直接対応が未成立。",
        definition_source_refs,
    )


def _unknown_axis(
    subject: Any, binding: Any, axis: str, refs: list[Any], reason: str, owner: Any
) -> dict[str, Any]:
    return {
        "subject_ref": copy.deepcopy(subject),
        "binding": copy.deepcopy(binding),
        "axis": axis,
        "state": "unknown",
        "original_refs": _copy_refs_in_source_order(
            [ref for ref in refs if ref is not None]
        ),
        "reason": reason,
        "backflow_owner": owner if isinstance(owner, str) else None,
    }


def _fn1_frame_population(
    raw: dict[str, Any], root_binding: dict[str, Any]
) -> dict[str, Any]:
    """Keep root and raw Binding frames while selecting only existing candidate frames."""
    frames: list[dict[str, Any]] = [
        {
            "binding": copy.deepcopy(root_binding),
            "slot_indices": [],
            "slots_by_kind": {},
            "target": True,
        }
    ]
    for index, slot in enumerate(raw["descriptors"]):
        slot_binding = slot["binding"]
        frame_index = next(
            (
                i
                for i, frame in enumerate(frames)
                if _json_equal(frame["binding"], slot_binding)
            ),
            None,
        )
        if frame_index is None:
            frame_index = len(frames)
            frames.append(
                {
                    "binding": copy.deepcopy(slot_binding),
                    "slot_indices": [],
                    "slots_by_kind": {},
                    "target": False,
                }
            )
        frame = frames[frame_index]
        frame["slot_indices"].append(index)
        frame["slots_by_kind"].setdefault(slot["descriptor_kind"], []).append(
            (index, slot)
        )

    candidates = raw.get("candidates", [])
    if isinstance(candidates, list):
        for candidate in candidates:
            for frame in frames[1:]:
                if any(
                    _ref_same(
                        candidate,
                        raw["descriptors"][index]["binding"].get("template_ref"),
                    )
                    for index in frame["slot_indices"]
                ):
                    frame["target"] = True
    legacy_root_scope = all(
        _binding_same(slot["binding"], root_binding) for slot in raw["descriptors"]
    )
    return {"frames": frames, "legacy_root_scope": legacy_root_scope}


def _fn1_scope_guard(
    raw: dict[str, Any],
    binding: dict[str, Any],
    *,
    allow_missing_facts: bool = False,
) -> dict[str, Any]:
    """Keep fn1 inside the frozen 15-kind path; do not evaluate F01/F02 failures here."""
    for member in ("sources", "knowledge_records"):
        if member not in raw or not isinstance(raw[member], list):
            raise _unsupported(
                "F01/F02",
                f"{member}_required_array",
                f"{member} is absent or not an array in the fixed fn1 path",
            )
    if "required_descriptor_kinds" not in raw:
        raise _unsupported(
            "F02", "required_kinds_absent", "required_descriptor_kinds is not supplied"
        )
    required = raw["required_descriptor_kinds"]
    if not isinstance(required, list) or any(
        kind not in _APPROVED_KINDS for kind in required
    ):
        raise _unsupported(
            "F02",
            "required_kinds_shape_or_value",
            "required_descriptor_kinds is outside the fixed descriptor domain",
        )
    if len(required) != len(set(required)):
        raise _unsupported(
            "F02",
            "required_kinds_outside_frozen_path",
            "required_descriptor_kinds contains duplicate descriptor kinds",
        )
    if "descriptors" not in raw or not isinstance(raw["descriptors"], list):
        raise _unsupported(
            "F02",
            "descriptor_slots_absent_or_wrong_type",
            "descriptor slots are not supplied as an array",
        )
    slots = raw["descriptors"]
    fact_refs: list[dict[str, Any]] = []
    comparison_refs: list[dict[str, Any]] = []
    slot_members = {
        "slot_identity",
        "descriptor_kind",
        "binding",
        "facts",
        "comparison_refs",
        "definition_applicability_ref",
    }
    fact_members = {
        "source_ref",
        "owner",
        "binding",
        "meaning",
        "condition",
        "reason",
        "oracle_ref",
        "ref",
    }
    # Self-comparison preserves the existing Ref-comparability admission.
    root_binding_comparable = _binding_same(binding, binding)
    for index, slot in enumerate(slots):
        expected_slot_members = slot_members
        if allow_missing_facts and isinstance(slot, dict) and "facts" not in slot:
            expected_slot_members = slot_members - {"facts"}
        if not isinstance(slot, dict) or set(slot) != expected_slot_members:
            raise _unsupported(
                "F02",
                "descriptor_slot_closed_shape",
                f"descriptors[{index}] is outside the fixed DescriptorSlot shape",
            )
        kind = slot["descriptor_kind"]
        identity = slot["slot_identity"]
        if not isinstance(kind, str) or kind not in _APPROVED_KINDS:
            raise _unsupported(
                "F02",
                "descriptor_kind_unrecognized",
                f"descriptors[{index}].descriptor_kind is outside the fixed domain",
            )
        if (
            not isinstance(identity, str)
            or not identity
            or any(
                previous.get("slot_identity") == identity
                and _binding_same(previous.get("binding"), slot["binding"])
                for previous in slots[:index]
            )
        ):
            raise _unsupported(
                "F02",
                "slot_identity_missing_or_duplicate",
                f"descriptors[{index}].slot_identity is missing or duplicated",
            )
        if (
            not _binding_shape_ok(slot["binding"])
            or not _binding_same(slot["binding"], slot["binding"])
            or not root_binding_comparable
        ):
            raise _unsupported(
                "F02",
                "descriptor_slot_binding_unresolved",
                f"descriptors[{index}] does not have the current full Binding",
            )
        facts = slot.get("facts")
        if allow_missing_facts and (
            "facts" not in slot or facts is None or facts == []
        ):
            facts = []
        elif not isinstance(facts, list) or not facts:
            raise _unsupported(
                "F02",
                "descriptor_facts_absent_empty_or_wrong_type",
                f"descriptors[{index}].facts is outside the frozen path",
            )
        for fact_index, fact in enumerate(facts):
            if not isinstance(fact, dict) or set(fact) != fact_members:
                raise _unsupported(
                    "F02",
                    "meaning_fact_closed_shape",
                    f"descriptors[{index}].facts[{fact_index}] is outside the fixed MeaningFact shape",
                )
            if not _binding_shape_ok(fact["binding"]) or not _binding_same(
                fact["binding"], slot["binding"]
            ):
                raise _unsupported(
                    "F02",
                    "meaning_fact_binding_unresolved",
                    f"descriptors[{index}].facts[{fact_index}] does not match its slot Binding",
                )
            if (
                not _ref_shape_ok(fact["ref"])
                or not _is_json_value(fact["meaning"])
                or not _is_json_value(fact["condition"])
            ):
                raise _unsupported(
                    "F02",
                    "meaning_fact_member_shape",
                    f"descriptors[{index}].facts[{fact_index}] contains an unsupported member",
                )
            if fact["source_ref"] is not None and not _ref_shape_ok(fact["source_ref"]):
                raise _unsupported(
                    "F02",
                    "meaning_fact_source_ref_shape",
                    f"descriptors[{index}].facts[{fact_index}].source_ref is not a Ref or null",
                )
            if fact["oracle_ref"] is not None and not _ref_shape_ok(fact["oracle_ref"]):
                raise _unsupported(
                    "F02",
                    "meaning_fact_oracle_ref_shape",
                    f"descriptors[{index}].facts[{fact_index}].oracle_ref is not a Ref or null",
                )
            if fact["owner"] is not None and not isinstance(fact["owner"], str):
                raise _unsupported(
                    "F02",
                    "meaning_fact_owner_shape",
                    f"descriptors[{index}].facts[{fact_index}].owner is not string or null",
                )
            if fact["reason"] is not None and not isinstance(fact["reason"], str):
                raise _unsupported(
                    "F02",
                    "meaning_fact_reason_shape",
                    f"descriptors[{index}].facts[{fact_index}].reason is not string or null",
                )
            fact_refs.append(fact["ref"])
        if not isinstance(slot["comparison_refs"], list) or any(
            not _ref_shape_ok(ref) for ref in slot["comparison_refs"]
        ):
            raise _unsupported(
                "F02",
                "comparison_refs_shape",
                f"descriptors[{index}].comparison_refs is not a Ref array",
            )
        comparison_refs.extend(slot["comparison_refs"])
        applicability_ref = slot["definition_applicability_ref"]
        if applicability_ref is not None and not _ref_shape_ok(applicability_ref):
            raise _unsupported(
                "F02",
                "definition_applicability_ref_shape",
                f"descriptors[{index}].definition_applicability_ref is not a Ref or null",
            )
    population = _fn1_frame_population(raw, binding)
    scope_frames: list[list[dict[str, Any]]] = []
    for frame in population["frames"]:
        scope = next(
            (
                items
                for items in scope_frames
                if _binding_same(items[0]["binding"], frame["binding"])
            ),
            None,
        )
        if scope is None:
            scope = []
            scope_frames.append(scope)
        scope.append(frame)
    for scope in scope_frames:
        kind_counts: dict[str, int] = {}
        for frame in scope:
            for kind, kind_slots in frame["slots_by_kind"].items():
                kind_counts[kind] = kind_counts.get(kind, 0) + len(kind_slots)
        duplicated = [kind for kind, count in kind_counts.items() if count != 1]
        if duplicated:
            raise _unsupported(
                "F02",
                "descriptor_kind_duplicate_slot",
                f"multiple slots for fixed kind(s): {', '.join(duplicated)}",
            )
    if "relations" not in raw or not isinstance(raw["relations"], list):
        raise _unsupported(
            "F01",
            "relation_input_absent_or_wrong_type",
            "relation descriptor path has no typed relation array",
        )
    relation_members = {
        "ref",
        "binding",
        "kind",
        "from_ref",
        "to_ref",
        "direction",
        "source_ref",
    }
    related_relation_counts = [0] * len(population["frames"])
    for index, relation in enumerate(raw["relations"]):
        if not isinstance(relation, dict) or set(relation) != relation_members:
            raise _unsupported(
                "F01",
                "relation_record_closed_shape",
                f"relations[{index}] is outside the fixed RelationRecord shape",
            )
        if not _ref_shape_ok(relation["ref"]) or not _binding_shape_ok(
            relation["binding"]
        ):
            raise _unsupported(
                "F01",
                "relation_record_ref_or_binding_shape",
                f"relations[{index}] has an invalid Ref or Binding",
            )
        for member in ("from_ref", "to_ref"):
            endpoint = relation[member]
            if endpoint is not None and not _ref_shape_ok(endpoint):
                raise _unsupported(
                    "F01",
                    "relation_endpoint_ref_shape",
                    f"relations[{index}].{member} is not a Ref or null",
                )
        if relation["kind"] is not None and not isinstance(relation["kind"], str):
            raise _unsupported(
                "F01",
                "relation_kind_shape",
                f"relations[{index}].kind is not string or null",
            )
        if relation["direction"] is not None and not isinstance(
            relation["direction"], str
        ):
            raise _unsupported(
                "F01",
                "relation_direction_shape",
                f"relations[{index}].direction is not string or null",
            )
        for frame_index, frame in enumerate(population["frames"]):
            if not frame["target"] or not _binding_same(
                relation["binding"], frame["binding"]
            ):
                continue
            related_relation_counts[frame_index] += 1
            if relation["from_ref"] is None or relation["to_ref"] is None:
                raise _unsupported(
                    "F01",
                    "relation_endpoint_missing",
                    f"related relations[{index}] lacks an endpoint",
                )
            if relation["direction"] is None or relation["direction"] == "":
                raise _unsupported(
                    "F01",
                    "relation_direction_missing",
                    f"related relations[{index}] lacks direction",
                )
    for scope in scope_frames:
        target_frames = [frame for frame in scope if frame["target"]]
        if not target_frames:
            continue
        has_relation_slot = any("relation" in frame["slots_by_kind"] for frame in scope)
        relation_count = sum(
            related_relation_counts[population["frames"].index(frame)]
            for frame in scope
        )
        if has_relation_slot and relation_count == 0:
            raise _unsupported(
                "F01",
                "related_relation_unresolved",
                "the fixed relation descriptor has no same-Binding relation occurrence",
            )

    # Foreign record meanings are not evaluated here. fn0 already checks the
    # declared record shapes; retain this guard for callers with a hand-built
    # ValidatedSupply that bypassed fn0, without cardinality/domain predicates.
    malformed_auxiliary = _auxiliary_array_record_issue(raw)
    if malformed_auxiliary is not None:
        member, index = malformed_auxiliary
        raise _unsupported(
            "N03",
            f"{member}_record_decoder",
            f"{member}{'' if index < 0 else f'[{index}]'} is outside its fixed logical record type",
        )

    if "meaning_comparisons" not in raw or not isinstance(
        raw["meaning_comparisons"], list
    ):
        raise _unsupported(
            "F01/F02",
            "meaning_comparisons_absent_or_wrong_type",
            "meaning_comparisons is absent or not an array",
        )
    for index, comparison in enumerate(raw["meaning_comparisons"]):
        if not isinstance(comparison, dict):
            raise _unsupported(
                "F01/F02",
                "meaning_comparison_record_type",
                f"meaning_comparisons[{index}] is not an object",
            )
        left = comparison.get("left_fact_ref")
        right = comparison.get("right_fact_ref")
        source = comparison.get("comparison_source_ref")
        if set(comparison) != {
            "left_fact_ref",
            "right_fact_ref",
            "comparison_source_ref",
            "equivalent",
            "reason",
        }:
            raise _unsupported(
                "F01/F02",
                "meaning_comparison_closed_shape",
                f"meaning_comparisons[{index}] is outside its fixed logical type",
            )
        if (
            not _ref_shape_ok(left)
            or not _ref_shape_ok(right)
            or not _ref_shape_ok(source)
            or (
                comparison["equivalent"] is not None
                and not isinstance(comparison["equivalent"], bool)
            )
            or (
                comparison["reason"] is not None
                and not isinstance(comparison["reason"], str)
            )
        ):
            raise _unsupported(
                "F01/F02",
                "meaning_comparison_member_shape",
                f"meaning_comparisons[{index}] has an invalid typed member",
            )
        relevant = any(
            isinstance(candidate, dict) and _ref_same(candidate, ref)
            for candidate in fact_refs + comparison_refs
            for ref in (left, right, source)
        )
        if relevant:
            raise _unsupported(
                "F01/F02",
                "meaning_comparison_unimplemented",
                f"meaning_comparisons[{index}] participates in the current descriptor scope",
            )

    if "claims" not in raw or not isinstance(raw["claims"], list):
        raise _unsupported(
            "F01",
            "claim_array_absent_or_wrong_type",
            "claims is absent or not an array",
        )
    target_bindings = [
        frame["binding"] for frame in population["frames"] if frame["target"]
    ]
    for index, claim in enumerate(raw["claims"]):
        if not isinstance(claim, dict) or not any(
            _binding_same(claim.get("binding"), target_binding)
            for target_binding in target_bindings
        ):
            continue
        if claim.get("kind") == "harness_layer_pair_override":
            raise _unsupported(
                "F01",
                "harness_claim_unimplemented",
                f"claims[{index}] is a harness_layer_pair_override claim",
            )
    return population


def _component_key(present: bool, value: Any = None) -> tuple[int, str]:
    # L5 exact_sort_contract.component_key. Explicit null is supplied and sorts
    # as canonical JSON; only an absent member has the lower rank.
    return (1, _ordered(value)) if present else (0, "")


def _origin_prefix_key(
    binding: Any,
    slot: dict[str, Any],
    source_refs: list[Any],
    source_refs_present: bool,
) -> tuple[Any, ...]:
    binding_obj = binding if isinstance(binding, dict) else {}
    template = binding_obj.get("template_ref")
    template = template if isinstance(template, dict) else {}
    knowledge = binding_obj.get("knowledge_ref")
    knowledge = knowledge if isinstance(knowledge, dict) else {}
    sort_refs = _copy_refs_in_source_order(
        [ref for ref in source_refs if ref is not None]
    )
    sort_refs = sorted(
        sort_refs, key=_ordered
    )  # L5 sorted_values retains repeated refs.
    slot_present = "slot_identity" in slot
    return (
        _component_key(
            isinstance(binding_obj.get("template_ref"), dict)
            and "identity" in template,
            template.get("identity"),
        ),
        _component_key(
            isinstance(binding_obj.get("template_ref"), dict)
            and "revision" in template,
            template.get("revision"),
        ),
        _component_key(
            isinstance(binding_obj.get("knowledge_ref"), dict)
            and "identity" in knowledge,
            knowledge.get("identity"),
        ),
        _component_key(
            isinstance(binding_obj.get("knowledge_ref"), dict)
            and "revision" in knowledge,
            knowledge.get("revision"),
        ),
        _component_key(slot_present, slot.get("slot_identity")),
        _component_key(source_refs_present, sort_refs if source_refs_present else None),
    )


def _public_axis_sort_key(
    axis: dict[str, Any],
    slot: dict[str, Any],
    source_refs: list[Any],
    source_refs_present: bool,
    ordinal: int,
) -> tuple[Any, ...]:
    return (
        *_origin_prefix_key(
            axis.get("binding"), slot, source_refs, source_refs_present
        ),
        _component_key("axis" in axis, axis.get("axis")),
        ordinal,
    )


def _public_finding_sort_key(
    finding: dict[str, Any],
    slot: dict[str, Any],
    source_refs: list[Any],
    source_refs_present: bool,
    ordinal: int,
) -> tuple[Any, ...]:
    return (
        *_origin_prefix_key(
            finding.get("binding"), slot, source_refs, source_refs_present
        ),
        _component_key("axis" in finding, finding.get("axis")),
        _component_key("rule_ref" in finding, finding.get("rule_ref")),
        ordinal,
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


@_tag_unsupported("F01/F02")
def compare_descriptor_definitions(context: dict[str, object]) -> dict[str, object]:
    """fn1: N03同一snapshot経路の定義・owner帰属・明示NAを別軸で返す。"""
    validated = context.get("validated") if isinstance(context, dict) else None
    if not isinstance(validated, dict) or not isinstance(validated.get("input"), dict):
        raise NotImplementedError(
            "compare_descriptor_definitions requires a decoded SupplyInput"
        )
    raw = validated["input"]
    binding = raw.get("binding")
    if not isinstance(binding, dict):
        raise NotImplementedError(
            "fn1 Binding absent/null/type branch: Backflow HELIXBRAIN-L6-032-N03-PATH"
        )
    descriptors = raw.get("descriptors")
    if not isinstance(descriptors, list):
        raise NotImplementedError(
            "descriptor array absent/null/type branch: Backflow HELIXBRAIN-L6-032-N03-PATH"
        )
    population = _fn1_scope_guard(raw, binding)
    emissions: list[tuple[dict[str, Any], dict[str, Any], list[Any], bool]] = []
    finding_emissions: list[tuple[dict[str, Any], dict[str, Any], list[Any], bool]] = []
    for slot in descriptors:
        slot_binding = slot["binding"]
        owner = slot_binding["knowledge_ref"]["owner"]
        for fact in slot["facts"]:
            cause, refs, reason, definition_sources = _meaning_resolution(
                validated, slot, fact
            )
            definition_axis = _unknown_axis(
                fact["ref"],
                slot["binding"],
                slot["descriptor_kind"] + ".definition",
                refs,
                f"{cause}: {reason}",
                owner,
            )
            emissions.append(
                (
                    definition_axis,
                    slot,
                    definition_sources,
                    any(ref is not None for ref in definition_sources),
                )
            )
            attribution_axis = _attribution_axis(validated, slot, fact)
            attribution_refs = [fact.get("source_ref")]
            emissions.append(
                (
                    attribution_axis,
                    slot,
                    attribution_refs,
                    isinstance(fact.get("source_ref"), dict),
                )
            )
        # Presence of an explicit null definition applicability request emits its own unknown axis.
        if slot["definition_applicability_ref"] is None:
            emissions.append(
                (
                    _unknown_axis(
                        slot["binding"]["template_ref"],
                        slot["binding"],
                        slot["descriptor_kind"] + ".definition_applicability",
                        [],
                        "原定義適用判断Refが明示nullであり、定義NA要求を解決できない。",
                        owner,
                    ),
                    slot,
                    [],
                    True,
                )
            )
        else:
            raise NotImplementedError(
                "definition applicability supplied-ref branch: Backflow HELIXBRAIN-L6-032-N03-PATH"
            )

    required_set = set(raw["required_descriptor_kinds"])
    slot_missing_reason = "必要なdescriptor slotが当該原Bindingに供給されていない。"

    def emit_missing(
        kind_idx: int, kind_name: str, frame_binding: dict[str, Any]
    ) -> None:
        subject = frame_binding.get("knowledge_ref")
        if not isinstance(subject, dict):
            subject = frame_binding.get("template_ref")
        if not isinstance(subject, dict):
            return
        finding_code = f"descriptor_{kind_idx:02d}_missing"
        axis = {
            "subject_ref": copy.deepcopy(subject),
            "binding": copy.deepcopy(frame_binding),
            "axis": f"{kind_name}.definition",
            "state": "missing",
            "original_refs": [],
            "reason": slot_missing_reason,
            "backflow_owner": "knowledge_owner",
        }
        emissions.append((axis, {}, [], True))
        finding = {
            "code": finding_code,
            "rule_ref": f"HELIXBRAIN-L5-032-R-{finding_code}",
            "subject_ref": copy.deepcopy(subject),
            "binding": copy.deepcopy(frame_binding),
            "axis": f"{kind_name}.definition",
            "state": "missing",
            "source_refs": [],
            "reason": slot_missing_reason,
            "backflow_owner": "knowledge_owner",
        }
        finding_emissions.append((finding, {}, [], True))

    if population["legacy_root_scope"]:
        supplied_kinds = {slot["descriptor_kind"] for slot in descriptors}
        missing_kinds: set[str] = set()
        for kind_idx, kind_name in enumerate(_APPROVED_KINDS, start=1):
            if kind_name in required_set and kind_name not in supplied_kinds:
                missing_kinds.add(kind_name)
                emit_missing(kind_idx, kind_name, binding)
        _evaluate_replacement_claims(
            validated, binding, missing_kinds, emissions, finding_emissions
        )
    else:
        for frame in population["frames"]:
            if not frame["target"]:
                continue
            frame_binding = frame["binding"]
            supplied_kinds = set(frame["slots_by_kind"])
            missing_kinds: set[str] = set()
            for kind_idx, kind_name in enumerate(_APPROVED_KINDS, start=1):
                if kind_name in required_set and kind_name not in supplied_kinds:
                    missing_kinds.add(kind_name)
                    emit_missing(kind_idx, kind_name, frame_binding)
            _evaluate_replacement_claims(
                validated, frame_binding, missing_kinds, emissions, finding_emissions
            )

    decorated = [
        (
            axis,
            _public_axis_sort_key(
                axis, slot, source_refs, source_refs_present, ordinal
            ),
        )
        for ordinal, (axis, slot, source_refs, source_refs_present) in enumerate(
            emissions
        )
    ]
    axes = [axis for axis, _ in sorted(decorated, key=lambda pair: pair[1])]
    decorated_findings = [
        (
            finding,
            _public_finding_sort_key(
                finding, slot, source_refs, source_refs_present, ordinal
            ),
        )
        for ordinal, (finding, slot, source_refs, source_refs_present) in enumerate(
            finding_emissions
        )
    ]
    findings = [
        finding for finding, _ in sorted(decorated_findings, key=lambda pair: pair[1])
    ]
    return _comparison(axes, findings, "compare_descriptor_definitions", binding)
