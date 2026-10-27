"""FN1の同call意味読取・判定・公開索引を一度のwalkで組み立てる。"""

from __future__ import annotations

import copy
from typing import Any


_PRODUCER = "compare_descriptor_definitions"
_BACKFLOW = "HELIXBRAIN-L6-032-N03-PATH"
_UNRESOLVED_REASON = "当該原意味のsource又は規範に対するowner原解釈を解決できない。元原因と所在を保持する。"
_MISSING_REASON = "必要なdescriptor slotが当該原Bindingに供給されていない。"
_FACTS_MISSING_REASON = "原descriptor slotの意味factsが不足している。元presenceと所在を保持する。"
_MISSING_RULE_FAILURE_INDICES = {
    "template identity": 9,
    "version": 12,
    "layer/pair": 15,
    "applicability": 18,
    "required input": 21,
    "required section": 24,
    "required field": 27,
    "relation": 30,
    "意味owner": 33,
    "trace": 36,
    "negative oracle": 39,
    "measurement": 42,
    "completion": 45,
    "downstream kind": 48,
    "supersession": 51,
}


def _stop(branch: str) -> None:
    raise NotImplementedError(
        f"F01/F02/unclosed/definition_meaning_walk/{branch}; Backflow {_BACKFLOW}"
    )


def _presence(value: Any, present: bool = True) -> dict[str, Any]:
    if not present:
        return {"presence": "absent"}
    return {"presence": "supplied", "value": copy.deepcopy(value)}


def _closed_empty_result(binding: Any) -> dict[str, Any]:
    from descriptor_definitions import _comparison

    return {
        "evaluation": {"comparison": _comparison([], [], _PRODUCER, binding), "assessments": []},
        "native_material": {
            "meaning_reads": [],
            "applicability_reads": [],
            "special_reads": [],
            "judgment_origins": [],
            "pair_reads": [],
            "applicability_judgment_batches": [],
            "meaning_read_origins": [],
        },
        "target_reads": [],
        "intent_reads": [],
    }


def _key_for_slot(slot: dict[str, Any]) -> dict[str, Any]:
    return {
        "binding": _presence(slot.get("binding"), "binding" in slot),
        "slot_identity": _presence(slot.get("slot_identity"), "slot_identity" in slot),
        "descriptor_kind": copy.deepcopy(slot.get("descriptor_kind")),
    }


def _object_refs(values: Any) -> list[dict[str, Any]]:
    if not isinstance(values, list):
        return []
    return [copy.deepcopy(value) for value in values if isinstance(value, dict)]


def _axis_event(
    *,
    axis: dict[str, Any],
    slot: dict[str, Any],
    slot_locator: str | None,
    fact_locators: list[str],
    cause: str,
    branch: str,
    subject_ref: dict[str, Any],
    binding: dict[str, Any],
    meaning_read_indices: list[int] | None = None,
    applicability_read_indices: list[int] | None = None,
    pair_origin_links: list[dict[str, int]] | None = None,
    applicability_judgment_links: list[dict[str, int]] | None = None,
    meaning_problem_links: list[dict[str, int]] | None = None,
    meaning_support_links: list[dict[str, int]] | None = None,
    sort_source_refs: list[Any] | None = None,
    assessment_key: dict[str, Any] | None = None,
) -> dict[str, Any]:
    from descriptor_definitions import _ordered

    source_refs = sorted(_object_refs(sort_source_refs), key=_ordered) if sort_source_refs is not None else []
    key = copy.deepcopy(assessment_key) if assessment_key is not None else _key_for_slot(slot)
    slot_locators = [slot_locator] if isinstance(slot_locator, str) else []
    return {
        "axis": copy.deepcopy(axis),
        "slot": slot,
        "findings": [],
        "sort_source_refs": source_refs,
        "sort_source_refs_present": sort_source_refs is not None,
        "assessment": {
            "key": copy.deepcopy(key),
            "state": copy.deepcopy(axis["state"]),
            "origin_branch": branch,
            "slot_locators": copy.deepcopy(slot_locators),
            "fact_locators": copy.deepcopy(fact_locators),
            "comparison_axis_indices": [],
            "comparison_finding_indices": [],
            "original_axes": [],
            "axis_name": copy.deepcopy(axis["axis"]),
        },
        "origin": {
            "ordinal": -1,
            "assessment_key": copy.deepcopy(key),
            "branch": branch,
            "state": copy.deepcopy(axis["state"]),
            "cause": cause,
            "slot_locators": copy.deepcopy(slot_locators),
            "fact_locators": copy.deepcopy(fact_locators),
            "meaning_read_indices": copy.deepcopy(meaning_read_indices or []),
            "applicability_read_indices": copy.deepcopy(applicability_read_indices or []),
            "subject_ref": _presence(subject_ref),
            "binding": _presence(binding),
            "axis_name": copy.deepcopy(axis["axis"]),
            "original_refs": copy.deepcopy(axis["original_refs"]),
            "reason": copy.deepcopy(axis["reason"]),
            "backflow_owner": copy.deepcopy(axis["backflow_owner"]),
            "finding_rule_indices": [],
            "sort_source_refs": _presence(source_refs) if sort_source_refs is not None else {"presence": "absent"},
            "special_read_indices": [],
            "pair_origin_links": copy.deepcopy(pair_origin_links or []),
            "applicability_judgment_links": copy.deepcopy(applicability_judgment_links or []),
            "meaning_support_links": copy.deepcopy(meaning_support_links or []),
            "meaning_problem_links": copy.deepcopy(meaning_problem_links or []),
            "special_support_links": [],
        },
}


def evaluate_descriptor_definition_walk(context: dict[str, object]) -> dict[str, object]:
    """Build FN1 comparison and all native/index material from one validated input."""
    if not isinstance(context, dict) or set(context) != {"validated"}:
        _stop("context_shape")
    validated = context["validated"]
    if not isinstance(validated, dict) or set(validated) != {"input", "input_issues", "unusable_source_refs"}:
        _stop("validated_shape")
    raw = validated["input"]
    if raw is None:
        return _closed_empty_result(None)
    if not isinstance(raw, dict):
        _stop("input_shape")
    claims = raw["claims"] if "claims" in raw else []
    if not isinstance(claims, list) or any(
        not isinstance(claim, dict) or claim.get("kind") != "fill_definition"
        for claim in claims
    ):
        _stop("supplied_claim_ports")
    raw_binding = raw.get("binding")
    if not isinstance(raw_binding, dict):
        _stop("input_binding_shape")
    from definition_comparison import _fn1_scope_guard

    # L4 shares zero occurrences for absent/[] while keeping the real snapshot
    # unchanged. The existing structural guard receives only a local view;
    # every native reader and returned observation still uses the original raw.
    structural_view = raw if "claims" in raw else {**raw, "claims": []}
    _fn1_scope_guard(structural_view, raw_binding, allow_missing_facts=True)
    from supply_validation import _json_equal

    # Nullable Ref digests may compare equal while the original frames differ.
    # This walk implements one raw root frame; retain other populations as an
    # explicit unclosed branch instead of silently coalescing them.
    if any(not _json_equal(slot["binding"], raw_binding) for slot in raw["descriptors"]):
        _stop("raw_distinct_binding_frames")
    # These declared producer carriers need native special readers. Their
    # discovery precedes qualification; unknown candidates cannot become an
    # empty successful special-read population.
    for source in raw["sources"]:
        if not isinstance(source, dict) or source.get("role") != "semantic_json":
            continue
        content = source.get("content")
        if not isinstance(content, dict):
            continue
        if "descriptor_display_groups" in content:
            _stop("display_special_ports")
        if "required_relations" in content and content["required_relations"] != []:
            _stop("required_relation_special_ports")
    descriptors = raw.get("descriptors")
    if not isinstance(descriptors, list):
        _stop("descriptor_population")

    from definition_comparison import (
        _attribution_axis,
        _public_axis_sort_key,
        _public_finding_sort_key,
    )
    from descriptor_definitions import _comparison
    from descriptor_definition_normative import definition_meaning_normative_frame
    from descriptor_definition_reads import (
        project_definition_applicability,
        read_original_definition_applicability,
        read_original_definition_meaning_bundle,
    )
    from descriptor_definition_pairs import meaning_pair_axes_with_origins
    from supply_validation import _APPROVED_KINDS

    native: dict[str, list[Any]] = {
        "meaning_reads": [],
        "applicability_reads": [],
        "special_reads": [],
        "judgment_origins": [],
        "pair_reads": [],
        "applicability_judgment_batches": [],
        "meaning_read_origins": [],
    }
    events: list[dict[str, Any]] = []
    slots_by_kind: dict[str, list[tuple[int, dict[str, Any]]]] = {}
    for original_index, original_slot in enumerate(descriptors):
        slots_by_kind.setdefault(original_slot["descriptor_kind"], []).append((original_index, original_slot))
    required_kinds = set(raw["required_descriptor_kinds"])
    ordered_entries: list[tuple[int | None, dict[str, Any] | None, str | None]] = []
    for approved_kind in _APPROVED_KINDS:
        kind_slots = slots_by_kind.get(approved_kind, [])
        if approved_kind in required_kinds and not kind_slots:
            ordered_entries.append((None, None, approved_kind))
        ordered_entries.extend((index, slot, None) for index, slot in kind_slots)

    for slot_index, slot, missing_kind in ordered_entries:
        if slot is None:
            kind = missing_kind
            subject = raw_binding.get("knowledge_ref")
            if not isinstance(subject, dict):
                subject = raw_binding.get("template_ref")
            if not isinstance(subject, dict):
                _stop("input_binding_shape")
            axis_name = f"{kind}.definition"
            axis = {
                "subject_ref": copy.deepcopy(subject),
                "binding": copy.deepcopy(raw_binding),
                "axis": axis_name,
                "state": "missing",
                "original_refs": [],
                "reason": _MISSING_REASON,
                "backflow_owner": "knowledge_owner",
            }
            event = _axis_event(
                axis=axis,
                slot={},
                slot_locator=None,
                fact_locators=[],
                cause="required_slot_absent",
                branch="required_slot_absent",
                subject_ref=subject,
                binding=raw_binding,
                sort_source_refs=[],
                assessment_key={
                    "binding": _presence(raw_binding),
                    "slot_identity": {"presence": "absent"},
                    "descriptor_kind": kind,
                },
            )
            missing_code = f"descriptor_{_APPROVED_KINDS.index(kind) + 1:02d}_missing"
            event["findings"] = [{
                "code": missing_code,
                "rule_ref": f"HELIXBRAIN-L5-032-R-{missing_code}",
                "subject_ref": copy.deepcopy(subject),
                "binding": copy.deepcopy(raw_binding),
                "axis": axis_name,
                "state": "missing",
                "source_refs": [],
                "reason": _MISSING_REASON,
                "backflow_owner": "knowledge_owner",
            }]
            event["origin"]["finding_rule_indices"] = [
                _MISSING_RULE_FAILURE_INDICES[kind]
            ]
            events.append(event)
            continue
        if not isinstance(slot, dict):
            _stop("descriptor_slot_shape")
        slot_locator = f"/descriptors/{slot_index}"
        kind = slot.get("descriptor_kind")
        if not isinstance(kind, str):
            _stop("descriptor_kind")
        original_facts = slot.get("facts")
        if "facts" not in slot or original_facts is None or original_facts == []:
            facts: list[Any] = []
            binding = slot.get("binding")
            subject = binding.get("knowledge_ref") if isinstance(binding, dict) else None
            if not isinstance(subject, dict) and isinstance(binding, dict):
                subject = binding.get("template_ref")
            if not isinstance(subject, dict):
                _stop("input_binding_shape")
            knowledge_ref = binding.get("knowledge_ref") if isinstance(binding, dict) else None
            owner = knowledge_ref.get("owner") if isinstance(knowledge_ref, dict) else None
            axis = {
                "subject_ref": copy.deepcopy(subject),
                "binding": copy.deepcopy(binding),
                "axis": f"{kind}.definition",
                "state": "missing",
                "original_refs": [],
                "reason": _FACTS_MISSING_REASON,
                "backflow_owner": owner if isinstance(owner, str) else None,
            }
            events.append(_axis_event(
                axis=axis,
                slot=slot,
                slot_locator=slot_locator,
                fact_locators=[],
                cause="facts_absent_or_null_or_empty",
                branch="facts_missing",
                subject_ref=subject,
                binding=binding,
                sort_source_refs=[],
            ))
        elif isinstance(original_facts, list):
            facts = original_facts
        else:
            _stop("fact_population")

        # Attribution event(s) are formed from the existing same-call helper once per fact.
        for fact_index, fact in enumerate(facts):
            if not isinstance(fact, dict):
                _stop("fact_shape")
            fact_locator = f"{slot_locator}/facts/{fact_index}"
            attribution = _attribution_axis(validated, slot, fact)
            events.append(_axis_event(
                axis=attribution,
                slot=slot,
                slot_locator=slot_locator,
                fact_locators=[fact_locator],
                cause="owner_descriptor_attribution",
                branch="existing_definition_result",
                subject_ref=attribution["subject_ref"],
                binding=attribution["binding"],
                sort_source_refs=[fact["source_ref"]] if isinstance(fact.get("source_ref"), dict) else [],
            ))

        # The current native path retains unknown reads and their target-scoped
        # problems. A read is still acquired only once per raw fact; each
        # unattached target problem becomes its own origin/event handle below.
        for fact_index, fact in enumerate(facts):
            fact_locator = f"{slot_locator}/facts/{fact_index}"
            frame = definition_meaning_normative_frame(kind)
            request = {
                "slot_locator": slot_locator,
                "fact_locator": fact_locator,
                "normative_entry_pointer": frame["entry_pointer"],
            }
            bundle = read_original_definition_meaning_bundle(validated, request)
            if not isinstance(bundle, dict) or set(bundle) != {"read", "problem_scopes", "support_origins"}:
                _stop("meaning_bundle_shape")
            read = bundle["read"]
            if not isinstance(read, dict) or set(read) != {
                "slot_locator", "fact_locator", "binding", "normative_frame", "acquisition_state",
                "occurrences", "supports", "problems",
            }:
                _stop("meaning_read_shape")
            problem_scopes = bundle["problem_scopes"]
            support_origins = bundle["support_origins"]
            if (read["acquisition_state"] != "unknown"
                    or read["supports"]
                    or not isinstance(read["problems"], list)
                    or not isinstance(problem_scopes, list)
                    or not isinstance(support_origins, list)
                    or support_origins):
                _stop("meaning_read_branch")
            for problem in read["problems"]:
                cause = problem.get("cause") if isinstance(problem, dict) else None
                if cause not in {"source_unresolved", "container_absent"}:
                    _stop("meaning_problem_branch")
            meaning_index = len(native["meaning_reads"])
            native["meaning_reads"].append(copy.deepcopy(read))
            native["meaning_read_origins"].append({
                "meaning_read_index": meaning_index,
                "problem_scopes": copy.deepcopy(problem_scopes),
                "support_origins": copy.deepcopy(support_origins),
            })
            original_refs = _object_refs([fact.get("ref"), fact.get("source_ref")])
            reason = _UNRESOLVED_REASON
            owner = None
            binding = slot.get("binding")
            if isinstance(binding, dict) and isinstance(binding.get("knowledge_ref"), dict):
                owner = binding["knowledge_ref"].get("owner")
            axis = {
                "subject_ref": copy.deepcopy(fact.get("ref")),
                "binding": copy.deepcopy(binding),
                "axis": f"{kind}.definition",
                "state": "unknown",
                "original_refs": original_refs,
                "reason": reason,
                "backflow_owner": owner if isinstance(owner, str) else None,
            }
            sort_sources = _object_refs([fact.get("source_ref")])
            sort_sources.extend(
                copy.deepcopy(occurrence["source_ref"])
                for occurrence in read["occurrences"]
                if isinstance(occurrence, dict) and isinstance(occurrence.get("source_ref"), dict)
            )
            target_problem_indices = sorted([
                scope["problem_index"]
                for scope in problem_scopes
                if isinstance(scope, dict) and scope.get("relevance") == "target"
            ])
            if target_problem_indices:
                for problem_index in target_problem_indices:
                    events.append(_axis_event(
                        axis=axis,
                        slot=slot,
                        slot_locator=slot_locator,
                        fact_locators=[fact_locator],
                        cause="required_source_or_interpretation_unresolved",
                        branch="source_unresolved",
                        subject_ref=fact.get("ref"),
                        binding=binding,
                        meaning_read_indices=[meaning_index],
                        meaning_problem_links=[{
                            "meaning_read_index": meaning_index,
                            "problem_index": problem_index,
                        }],
                        sort_source_refs=sort_sources,
                    ))
            else:
                # No supports and no target problem is the existing unresolved
                # read fallback. Unattributed source problems remain only in
                # the same native read and are not promoted to this target.
                events.append(_axis_event(
                    axis=axis,
                    slot=slot,
                    slot_locator=slot_locator,
                    fact_locators=[fact_locator],
                    cause="required_source_or_interpretation_unresolved",
                    branch="source_unresolved",
                    subject_ref=fact.get("ref"),
                    binding=binding,
                    meaning_read_indices=[meaning_index],
                    sort_source_refs=sort_sources,
                ))

        # A single-fact slot has no pair candidates; retain the annotated producer result.
        if facts and len(facts) != 1:
            _stop("multifact_pair_scope")
        pair_result = meaning_pair_axes_with_origins(validated, slot)
        if not isinstance(pair_result, dict) or set(pair_result) != {"axes", "origins"}:
            _stop("pair_result_shape")
        pair_index = len(native["pair_reads"])
        native["pair_reads"].append({"slot_locator": slot_locator, "result": copy.deepcopy(pair_result)})
        if pair_result["axes"] or pair_result["origins"]:
            _stop("meaning_pair_nonempty_unimplemented")

        app_request = {"slot_locator": slot_locator}
        app_read = read_original_definition_applicability(validated, app_request)
        app_index = len(native["applicability_reads"])
        native["applicability_reads"].append(copy.deepcopy(app_read))
        judgments = project_definition_applicability(app_read, slot, slot_locator)
        if not isinstance(judgments, list):
            _stop("applicability_projection_shape")
        batch_index = len(native["applicability_judgment_batches"])
        native["applicability_judgment_batches"].append({
            "applicability_read_index": app_index,
            "slot_locator": slot_locator,
            "judgments": copy.deepcopy(judgments),
        })
        for judgment_index, judgment in enumerate(judgments):
            if not isinstance(judgment, dict) or set(judgment) != {
                "state", "origin_branch", "cause", "axis", "reason", "source_refs",
                "subject_ref", "binding", "backflow_owner", "slot_locator", "record_locator",
            }:
                _stop("applicability_judgment_shape")
            na_axis = {
                "subject_ref": copy.deepcopy(judgment["subject_ref"].get("value"))
                    if judgment["subject_ref"].get("presence") == "supplied" else None,
                "binding": copy.deepcopy(judgment["binding"].get("value"))
                    if judgment["binding"].get("presence") == "supplied" else None,
                "axis": judgment["axis"],
                "state": judgment["state"],
                "original_refs": copy.deepcopy(judgment["source_refs"]),
                "reason": judgment["reason"],
                "backflow_owner": judgment["backflow_owner"],
            }
            events.append(_axis_event(
                axis=na_axis,
                slot=slot,
                slot_locator=slot_locator,
                fact_locators=[],
                cause=judgment["cause"],
                branch=judgment["origin_branch"],
                subject_ref=na_axis["subject_ref"],
                binding=na_axis["binding"],
                applicability_read_indices=[app_index],
                applicability_judgment_links=[{"batch_index": batch_index, "judgment_index": judgment_index}],
                sort_source_refs=judgment["source_refs"],
            ))

    ordered = sorted(
        enumerate(events),
        key=lambda item: _public_axis_sort_key(
            item[1]["axis"], item[1]["slot"], item[1]["sort_source_refs"],
            item[1]["sort_source_refs_present"], item[0],
        ),
    )
    axes: list[dict[str, Any]] = []
    for axis_index, (_event_index, event) in enumerate(ordered):
        axes.append(copy.deepcopy(event["axis"]))
        event["assessment"]["comparison_axis_indices"] = [axis_index]
        event["assessment"]["original_axes"] = [copy.deepcopy(axes[axis_index])]

    finding_events: list[tuple[int, dict[str, Any], tuple[Any, ...]]] = []
    finding_ordinal = 0
    for event_index, event in enumerate(events):
        for finding in event["findings"]:
            finding_events.append((
                event_index,
                finding,
                _public_finding_sort_key(
                    finding,
                    event["slot"],
                    event["sort_source_refs"],
                    event["sort_source_refs_present"],
                    finding_ordinal,
                ),
            ))
            finding_ordinal += 1
    findings: list[dict[str, Any]] = []
    for finding_index, (event_index, finding, _sort_key) in enumerate(
        sorted(finding_events, key=lambda item: item[2])
    ):
        findings.append(copy.deepcopy(finding))
        events[event_index]["assessment"]["comparison_finding_indices"].append(finding_index)

    assessments = []
    for ordinal, event in enumerate(events):
        event["origin"]["ordinal"] = ordinal
        assessments.append(event["assessment"])
        native["judgment_origins"].append(event["origin"])

    target_reads: list[dict[str, Any]] = []
    intent_reads: list[dict[str, Any]] = []
    if claims:
        from dependencies_handoff_ports import read_claim_intent
        from descriptor_target_reader import read_descriptor_replacement_target

        for claim_index, claim in enumerate(claims):
            claim_locator = f"/claims/{claim_index}"
            target_reads.append(
                read_descriptor_replacement_target(validated, claim, claim_locator)
            )
            intent_reads.append(read_claim_intent(claim, claim_locator))

    return {
        "evaluation": {
            "comparison": _comparison(axes, findings, _PRODUCER, raw_binding),
            "assessments": assessments,
        },
        "native_material": native,
        "target_reads": target_reads,
        "intent_reads": intent_reads,
    }
