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


def _attribution_axis(validated: dict[str, Any], slot: dict[str, Any], fact: dict[str, Any]) -> dict[str, Any]:
    raw = validated["input"]
    sources = raw["sources"]
    refs = _copy_refs_in_source_order([fact["source_ref"]] if isinstance(fact.get("source_ref"), dict) else [])
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
            if not isinstance(content, dict) or not _binding_same(content.get("binding"), binding):
                continue
            if "descriptor_facts" not in content:
                continue
            groups = content["descriptor_facts"]
            if not isinstance(groups, list):
                raise _unsupported("F01", "descriptor_facts_container", "descriptor_facts is null or not an array")
            for group in groups:
                if not isinstance(group, dict) or group.get("slot_identity") != slot.get("slot_identity"):
                    continue
                if "facts" not in group:
                    raise _unsupported("F01", "descriptor_facts_member_absent", "matching descriptor_facts group lacks facts")
                original_facts = group["facts"]
                if not isinstance(original_facts, list):
                    raise _unsupported("F01", "descriptor_facts_member_type", "matching descriptor_facts[].facts is not an array")
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
            reason = "sourceは資格照合済みだがowner原factまたはslot kindの完全対応が未解決。"
    return {
        "subject_ref": copy.deepcopy(fact.get("ref")),
        "binding": copy.deepcopy(binding),
        "axis": "descriptor.attribution",
        "state": state,
        "original_refs": refs,
        "reason": reason,
        "backflow_owner": backflow,
    }


def _meaning_resolution(validated: dict[str, Any], slot: dict[str, Any], fact: dict[str, Any]) -> tuple[str, list[Any], str, list[Any]]:
    """同一fact→KnowledgeRecord provenance→実sourceを直接解決する。"""
    raw = validated["input"]
    binding = slot["binding"]
    refs: list[Any] = [fact.get("source_ref"), fact.get("ref")]
    source_ref = fact.get("source_ref")
    if "meaning" not in fact:
        raise _unsupported("F01/F02", "meaning_body_absent", "MeaningFact.meaning is not supplied")
    if fact.get("meaning") is None:
        raise _unsupported("F01/F02", "meaning_body_null", "MeaningFact.meaning is null")
    if not isinstance(source_ref, dict):
        return "source_unresolved", refs, "当該MeaningFactの原source Refが未供給のためsource_unresolved。", [source_ref]

    sources = raw["sources"]
    source_rows = [
        (index, source) for index, source in enumerate(sources)
        if isinstance(source, dict) and _ref_same(source.get("ref"), source_ref)
    ]
    usable_sources = [
        (index, source) for index, source in source_rows
        if _source_usable(validated, source_ref) and source.get("role") == "semantic_json"
    ]
    if not usable_sources:
        refs.extend(source.get("ref") for _, source in source_rows)
        return "source_unresolved", refs, "当該MeaningFactのsourceは同snapshotでqualified semantic_json sourceへ解決できない。", [source_ref]

    knowledge_ref = binding["knowledge_ref"]
    knowledge_records = raw["knowledge_records"]
    records = [
        record for record in knowledge_records
        if isinstance(record, dict) and _ref_same(record.get("ref"), knowledge_ref)
    ]
    if not records:
        return "source_unresolved", refs, "同じBindingの原KnowledgeRecordが未供給のためprovenanceを解決できない。", [source_ref]

    saw_matching_provenance = False
    definition_source_refs: list[Any] = [source_ref]
    first_unresolved: tuple[str, str] | None = None
    for record in records:
        if "provenance_refs" not in record:
            raise _unsupported("F01/F02", "knowledge_provenance_absent", "matching KnowledgeRecord lacks provenance_refs")
        provenance = record["provenance_refs"]
        if not isinstance(provenance, list):
            raise _unsupported("F01/F02", "knowledge_provenance_type", "KnowledgeRecord.provenance_refs is not an array")
        for provenance_ref in provenance:
            if not _ref_identity_same(provenance_ref, source_ref):
                continue
            saw_matching_provenance = True
            if first_unresolved is None:
                refs.append(provenance_ref)
            direct_sources = [
                (index, source) for index, source in enumerate(sources)
                if isinstance(source, dict) and _ref_identity_same(source.get("ref"), provenance_ref)
            ]
            for index, source in direct_sources:
                actual_ref = source.get("ref")
                definition_source_refs.append(actual_ref)
                if first_unresolved is not None:
                    continue
                refs.append(actual_ref)
                expected_digest = provenance_ref.get("sha256")
                actual_digest = actual_ref.get("sha256") if isinstance(actual_ref, dict) else None
                if expected_digest is not None and actual_digest is not None and expected_digest != actual_digest:
                    first_unresolved = (
                        "source_unresolved",
                        f"KnowledgeRecord provenance digestと実source digestが一致しない（source index {index}）。",
                    )
                    continue
                if not _ref_same(provenance_ref, actual_ref) or not _source_usable(validated, actual_ref):
                    continue
                content = source.get("content")
                if not isinstance(content, dict) or "definition_meaning_operations" not in content:
                    first_unresolved = ("container_absent", "資格済み原sourceにdefinition_meaning_operations carrierが未供給。")
                    continue
                operations = content.get("definition_meaning_operations")
                if not isinstance(operations, list):
                    raise _unsupported("F01/F02", "definition_meaning_operations_container", "definition_meaning_operations is null or not an array")
                raise _unsupported("F01/F02", "typed_definition_meaning_operation", "meaning-operation success evaluation is outside the implemented path")
    if not saw_matching_provenance:
        return "source_unresolved", refs, "同じBindingのKnowledgeRecordに当該原source provenanceが無い。", definition_source_refs
    if first_unresolved is not None:
        return first_unresolved[0], refs, first_unresolved[1], definition_source_refs
    return "source_unresolved", refs, "原provenanceからqualified sourceへの直接対応が未成立。", definition_source_refs


def _unknown_axis(subject: Any, binding: Any, axis: str, refs: list[Any], reason: str, owner: Any) -> dict[str, Any]:
    return {
        "subject_ref": copy.deepcopy(subject),
        "binding": copy.deepcopy(binding),
        "axis": axis,
        "state": "unknown",
        "original_refs": _copy_refs_in_source_order([ref for ref in refs if ref is not None]),
        "reason": reason,
        "backflow_owner": owner if isinstance(owner, str) else None,
    }



def _fn1_scope_guard(raw: dict[str, Any], binding: dict[str, Any]) -> None:
    """Keep fn1 inside the frozen 15-kind path; do not evaluate F01/F02 failures here."""
    for member in ("sources", "knowledge_records"):
        if member not in raw or not isinstance(raw[member], list):
            raise _unsupported("F01/F02", f"{member}_required_array", f"{member} is absent or not an array in the fixed fn1 path")
    if "required_descriptor_kinds" not in raw:
        raise _unsupported("F02", "required_kinds_absent", "required_descriptor_kinds is not supplied")
    required = raw["required_descriptor_kinds"]
    if not isinstance(required, list) or any(kind not in _APPROVED_KINDS for kind in required):
        raise _unsupported("F02", "required_kinds_shape_or_value", "required_descriptor_kinds is outside the fixed descriptor domain")
    if len(required) != len(set(required)) or set(required) != set(_APPROVED_KINDS):
        raise _unsupported("F02", "required_kinds_outside_frozen_path", "this fn1 path requires one member of each fixed descriptor meaning")
    if "descriptors" not in raw or not isinstance(raw["descriptors"], list):
        raise _unsupported("F02", "descriptor_slots_absent_or_wrong_type", "descriptor slots are not supplied as an array")
    slots = raw["descriptors"]
    slots_by_kind: dict[str, list[dict[str, Any]]] = {}
    slot_identities: set[str] = set()
    fact_refs: list[dict[str, Any]] = []
    comparison_refs: list[dict[str, Any]] = []
    slot_members = {"slot_identity", "descriptor_kind", "binding", "facts", "comparison_refs", "definition_applicability_ref"}
    fact_members = {"source_ref", "owner", "binding", "meaning", "condition", "reason", "oracle_ref", "ref"}
    for index, slot in enumerate(slots):
        if not isinstance(slot, dict) or set(slot) != slot_members:
            raise _unsupported("F02", "descriptor_slot_closed_shape", f"descriptors[{index}] is outside the fixed DescriptorSlot shape")
        kind = slot["descriptor_kind"]
        identity = slot["slot_identity"]
        if not isinstance(kind, str) or kind not in _APPROVED_KINDS:
            raise _unsupported("F02", "descriptor_kind_unrecognized", f"descriptors[{index}].descriptor_kind is outside the fixed domain")
        if not isinstance(identity, str) or not identity or identity in slot_identities:
            raise _unsupported("F02", "slot_identity_missing_or_duplicate", f"descriptors[{index}].slot_identity is missing or duplicated")
        slot_identities.add(identity)
        if not _binding_shape_ok(slot["binding"]) or not _binding_same(slot["binding"], binding):
            raise _unsupported("F02", "descriptor_slot_binding_unresolved", f"descriptors[{index}] does not have the current full Binding")
        facts = slot["facts"]
        if not isinstance(facts, list) or not facts:
            raise _unsupported("F02", "descriptor_facts_absent_empty_or_wrong_type", f"descriptors[{index}].facts is outside the frozen path")
        for fact_index, fact in enumerate(facts):
            if not isinstance(fact, dict) or set(fact) != fact_members:
                raise _unsupported("F02", "meaning_fact_closed_shape", f"descriptors[{index}].facts[{fact_index}] is outside the fixed MeaningFact shape")
            if not _binding_shape_ok(fact["binding"]) or not _binding_same(fact["binding"], slot["binding"]):
                raise _unsupported("F02", "meaning_fact_binding_unresolved", f"descriptors[{index}].facts[{fact_index}] does not match its slot Binding")
            if not _ref_shape_ok(fact["ref"]) or not _is_json_value(fact["meaning"]) or not _is_json_value(fact["condition"]):
                raise _unsupported("F02", "meaning_fact_member_shape", f"descriptors[{index}].facts[{fact_index}] contains an unsupported member")
            if fact["source_ref"] is not None and not _ref_shape_ok(fact["source_ref"]):
                raise _unsupported("F02", "meaning_fact_source_ref_shape", f"descriptors[{index}].facts[{fact_index}].source_ref is not a Ref or null")
            if fact["oracle_ref"] is not None and not _ref_shape_ok(fact["oracle_ref"]):
                raise _unsupported("F02", "meaning_fact_oracle_ref_shape", f"descriptors[{index}].facts[{fact_index}].oracle_ref is not a Ref or null")
            if fact["owner"] is not None and not isinstance(fact["owner"], str):
                raise _unsupported("F02", "meaning_fact_owner_shape", f"descriptors[{index}].facts[{fact_index}].owner is not string or null")
            if fact["reason"] is not None and not isinstance(fact["reason"], str):
                raise _unsupported("F02", "meaning_fact_reason_shape", f"descriptors[{index}].facts[{fact_index}].reason is not string or null")
            fact_refs.append(fact["ref"])
        if not isinstance(slot["comparison_refs"], list) or any(not _ref_shape_ok(ref) for ref in slot["comparison_refs"]):
            raise _unsupported("F02", "comparison_refs_shape", f"descriptors[{index}].comparison_refs is not a Ref array")
        comparison_refs.extend(slot["comparison_refs"])
        applicability_ref = slot["definition_applicability_ref"]
        if applicability_ref is not None and not _ref_shape_ok(applicability_ref):
            raise _unsupported("F02", "definition_applicability_ref_shape", f"descriptors[{index}].definition_applicability_ref is not a Ref or null")
        slots_by_kind.setdefault(kind, []).append(slot)

    if set(slots_by_kind) != set(required):
        raise _unsupported("F02", "required_kind_slot_mismatch", "required descriptor kinds and supplied slot kinds differ")
    duplicated = [kind for kind, kind_slots in slots_by_kind.items() if len(kind_slots) != 1]
    if duplicated:
        raise _unsupported("F02", "descriptor_kind_duplicate_slot", f"multiple slots for fixed kind(s): {', '.join(duplicated)}")

    if "relations" not in raw or not isinstance(raw["relations"], list):
        raise _unsupported("F01", "relation_input_absent_or_wrong_type", "relation descriptor path has no typed relation array")
    relation_members = {"ref", "binding", "kind", "from_ref", "to_ref", "direction", "source_ref"}
    related_relation_count = 0
    for index, relation in enumerate(raw["relations"]):
        if not isinstance(relation, dict) or set(relation) != relation_members:
            raise _unsupported("F01", "relation_record_closed_shape", f"relations[{index}] is outside the fixed RelationRecord shape")
        if not _ref_shape_ok(relation["ref"]) or not _binding_shape_ok(relation["binding"]):
            raise _unsupported("F01", "relation_record_ref_or_binding_shape", f"relations[{index}] has an invalid Ref or Binding")
        for member in ("from_ref", "to_ref"):
            endpoint = relation[member]
            if endpoint is not None and not _ref_shape_ok(endpoint):
                raise _unsupported("F01", "relation_endpoint_ref_shape", f"relations[{index}].{member} is not a Ref or null")
        if relation["kind"] is not None and not isinstance(relation["kind"], str):
            raise _unsupported("F01", "relation_kind_shape", f"relations[{index}].kind is not string or null")
        if relation["direction"] is not None and not isinstance(relation["direction"], str):
            raise _unsupported("F01", "relation_direction_shape", f"relations[{index}].direction is not string or null")
        if _binding_same(relation["binding"], binding):
            related_relation_count += 1
            if relation["from_ref"] is None or relation["to_ref"] is None:
                raise _unsupported("F01", "relation_endpoint_missing", f"related relations[{index}] lacks an endpoint")
            if relation["direction"] is None or relation["direction"] == "":
                raise _unsupported("F01", "relation_direction_missing", f"related relations[{index}] lacks direction")
    if related_relation_count == 0:
        raise _unsupported("F01", "related_relation_unresolved", "the fixed relation descriptor has no same-Binding relation occurrence")

    # Foreign record meanings are not evaluated here. fn0 already checks the
    # declared record shapes; retain this guard for callers with a hand-built
    # ValidatedSupply that bypassed fn0, without cardinality/domain predicates.
    malformed_auxiliary = _auxiliary_array_record_issue(raw)
    if malformed_auxiliary is not None:
        member, index = malformed_auxiliary
        raise _unsupported(
            "N03", f"{member}_record_decoder",
            f"{member}{'' if index < 0 else f'[{index}]'} is outside its fixed logical record type",
        )

    if "meaning_comparisons" not in raw or not isinstance(raw["meaning_comparisons"], list):
        raise _unsupported("F01/F02", "meaning_comparisons_absent_or_wrong_type", "meaning_comparisons is absent or not an array")
    for index, comparison in enumerate(raw["meaning_comparisons"]):
        if not isinstance(comparison, dict):
            raise _unsupported("F01/F02", "meaning_comparison_record_type", f"meaning_comparisons[{index}] is not an object")
        left = comparison.get("left_fact_ref")
        right = comparison.get("right_fact_ref")
        source = comparison.get("comparison_source_ref")
        if set(comparison) != {"left_fact_ref", "right_fact_ref", "comparison_source_ref", "equivalent", "reason"}:
            raise _unsupported("F01/F02", "meaning_comparison_closed_shape", f"meaning_comparisons[{index}] is outside its fixed logical type")
        if (
            not _ref_shape_ok(left) or not _ref_shape_ok(right) or not _ref_shape_ok(source)
            or (comparison["equivalent"] is not None and not isinstance(comparison["equivalent"], bool))
            or (comparison["reason"] is not None and not isinstance(comparison["reason"], str))
        ):
            raise _unsupported("F01/F02", "meaning_comparison_member_shape", f"meaning_comparisons[{index}] has an invalid typed member")
        relevant = any(
            isinstance(candidate, dict) and _ref_same(candidate, ref)
            for candidate in fact_refs + comparison_refs
            for ref in (left, right, source)
        )
        if relevant:
            raise _unsupported("F01/F02", "meaning_comparison_unimplemented", f"meaning_comparisons[{index}] participates in the current descriptor scope")

    if "claims" not in raw or not isinstance(raw["claims"], list):
        raise _unsupported("F01", "claim_array_absent_or_wrong_type", "claims is absent or not an array")
    for index, claim in enumerate(raw["claims"]):
        if isinstance(claim, dict) and _binding_same(claim.get("binding"), binding) and any(
            _ref_same(claim.get("subject_ref"), fact_ref) for fact_ref in fact_refs
        ):
            raise _unsupported("F01", "descriptor_claim_unimplemented", f"claims[{index}] participates in descriptor meaning comparison")



def _component_key(present: bool, value: Any = None) -> tuple[int, str]:
    # L5 exact_sort_contract.component_key. Explicit null is supplied and sorts
    # as canonical JSON; only an absent member has the lower rank.
    return (1, _ordered(value)) if present else (0, "")


def _public_axis_sort_key(axis: dict[str, Any], slot: dict[str, Any], source_refs: list[Any], source_refs_present: bool, ordinal: int) -> tuple[Any, ...]:
    binding = axis.get("binding")
    binding = binding if isinstance(binding, dict) else {}
    template = binding.get("template_ref")
    template = template if isinstance(template, dict) else {}
    knowledge = binding.get("knowledge_ref")
    knowledge = knowledge if isinstance(knowledge, dict) else {}
    sort_refs = _copy_refs_in_source_order([ref for ref in source_refs if ref is not None])
    sort_refs = sorted(sort_refs, key=_ordered)  # L5 sorted_values retains repeated refs.
    slot_present = "slot_identity" in slot
    return (
        _component_key(isinstance(binding.get("template_ref"), dict) and "identity" in template, template.get("identity")),
        _component_key(isinstance(binding.get("template_ref"), dict) and "revision" in template, template.get("revision")),
        _component_key(isinstance(binding.get("knowledge_ref"), dict) and "identity" in knowledge, knowledge.get("identity")),
        _component_key(isinstance(binding.get("knowledge_ref"), dict) and "revision" in knowledge, knowledge.get("revision")),
        _component_key(slot_present, slot.get("slot_identity")),
        _component_key(source_refs_present, sort_refs if source_refs_present else None),
        _component_key("axis" in axis, axis.get("axis")),
        ordinal,
    )



@_tag_unsupported("F01/F02")
def compare_descriptor_definitions(context: dict[str, object]) -> dict[str, object]:
    """fn1: N03同一snapshot経路の定義・owner帰属・明示NAを別軸で返す。"""
    validated = context.get("validated") if isinstance(context, dict) else None
    if not isinstance(validated, dict) or not isinstance(validated.get("input"), dict):
        raise NotImplementedError("compare_descriptor_definitions requires a decoded SupplyInput")
    raw = validated["input"]
    binding = raw.get("binding")
    if not isinstance(binding, dict):
        raise NotImplementedError("fn1 Binding absent/null/type branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    descriptors = raw.get("descriptors")
    if not isinstance(descriptors, list):
        raise NotImplementedError("descriptor array absent/null/type branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    _fn1_scope_guard(raw, binding)
    emissions: list[tuple[dict[str, Any], dict[str, Any], list[Any], bool]] = []
    owner = binding["knowledge_ref"]["owner"]
    for slot in descriptors:
        for fact in slot["facts"]:
            cause, refs, reason, definition_sources = _meaning_resolution(validated, slot, fact)
            definition_axis = _unknown_axis(
                fact["ref"], slot["binding"], slot["descriptor_kind"] + ".definition",
                refs, f"{cause}: {reason}", owner,
            )
            emissions.append((definition_axis, slot, definition_sources, any(ref is not None for ref in definition_sources)))
            attribution_axis = _attribution_axis(validated, slot, fact)
            attribution_refs = [fact.get("source_ref")]
            emissions.append((attribution_axis, slot, attribution_refs, isinstance(fact.get("source_ref"), dict)))
        # Presence of an explicit null definition applicability request emits its own unknown axis.
        if slot["definition_applicability_ref"] is None:
            emissions.append((_unknown_axis(
                slot["binding"]["template_ref"],
                slot["binding"], slot["descriptor_kind"] + ".definition_applicability", [],
                "原定義適用判断Refが明示nullであり、定義NA要求を解決できない。", owner,
            ), slot, [], True))
        else:
            raise NotImplementedError("definition applicability supplied-ref branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    decorated = [
        (axis, _public_axis_sort_key(axis, slot, source_refs, source_refs_present, ordinal))
        for ordinal, (axis, slot, source_refs, source_refs_present) in enumerate(emissions)
    ]
    axes = [axis for axis, _ in sorted(decorated, key=lambda pair: pair[1])]
    return _comparison(axes, [], "compare_descriptor_definitions", binding)

