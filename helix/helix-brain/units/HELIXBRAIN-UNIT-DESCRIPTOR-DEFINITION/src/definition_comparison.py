"""BRAIN032 fn1 compare_descriptor_definitions と F01/F02 定義・帰属比較。"""

from __future__ import annotations

from definition_comparison_scope import (
    _fn1_frame_population,
    _fn1_scope_guard,
)
from definition_replacement_claims import (
    _evaluate_replacement_claims,
    _resolve_fill_definition_target,
)

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
