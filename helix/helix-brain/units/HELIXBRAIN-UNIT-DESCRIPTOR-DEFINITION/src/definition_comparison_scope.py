"""FN1 scope population and fixed-path validation helpers."""

from __future__ import annotations

import copy
from typing import Any

from supply_validation import (
    _APPROVED_KINDS,
    _auxiliary_array_record_issue,
    _binding_same,
    _binding_shape_ok,
    _is_json_value,
    _json_equal,
    _ref_same,
    _ref_shape_ok,
    _unsupported,
)


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
