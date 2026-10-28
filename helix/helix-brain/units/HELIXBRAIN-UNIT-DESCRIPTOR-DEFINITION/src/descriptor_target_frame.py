"""同walkの読取・assessmentだけからDescriptorClaimUseを構成する。"""

from __future__ import annotations

import copy
from typing import Any

from supply_validation import _binding_same, _json_equal, _ref_same


_BACKFLOW = "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
_STOP = "F05/F06/unclosed/descriptor_claim_uses; owner=knowledge_owner;"
_TARGET_READ_FIELDS = {
    "claim_locator",
    "claim",
    "candidate_indices",
    "candidate_refs",
    "occurrences",
    "matches",
    "state",
    "problems",
}
_INTENT_READ_FIELDS = {
    "claim_locator",
    "claim",
    "kind",
    "proposed_value",
    "intent",
    "reason",
}
_ASSESSMENT_FIELDS = {
    "key",
    "state",
    "origin_branch",
    "slot_locators",
    "fact_locators",
    "comparison_axis_indices",
    "comparison_finding_indices",
    "original_axes",
    "axis_name",
}
_ROUTE_REASONS = {
    "rule87": "同呼出しの原targetに対応するdefinition missingとreference_only根拠が、既存rule87の全predicateを満たす。",
    "rule93": "同呼出しの原targetに対応する限定meaning_undefinedと独立定義根拠のないfallbackが、既存rule93の全predicateを満たす。rule87は成立しない。",
    "none": "既存rule87及びrule93のpredicateに明確に該当しない。原target・意図・各定義状態は同呼出し観測へ保持する。",
    "unresolved": "既存rule87又はrule93の判定に必要な原target・意図・根拠対応が未確定である。元不成立を成功又は意味未定義へ変換しない。",
}


def _source_qualification_available(
    validated: dict[str, Any], source: dict[str, Any]
) -> bool:
    """FN0資格結果を原Refで読む。roleはここで意味付けしない。"""
    unusable = validated.get("unusable_source_refs")
    source_ref = source.get("ref")
    return isinstance(unusable, list) and not any(
        _ref_same(source_ref, unusable_ref) for unusable_ref in unusable
    )


def _stop(branch: str) -> None:
    raise NotImplementedError(f"{_STOP} {branch}; {_BACKFLOW}")


def _key_port_value(key: Any, name: str) -> tuple[bool, Any]:
    """DescriptorDefinitionKeyのPortPresence memberを読む。"""
    if not isinstance(key, dict) or name not in key:
        return False, None
    port = key[name]
    if not isinstance(port, dict):
        return False, None
    if port == {"presence": "absent"}:
        return False, None
    if set(port) == {"presence", "value"} and port["presence"] == "supplied":
        return True, port["value"]
    return False, None


def _assessment_matches(assessment: dict[str, Any], match: dict[str, Any]) -> bool:
    key = assessment.get("key")
    binding_present, binding = _key_port_value(key, "binding")
    slot_present, slot_identity = _key_port_value(key, "slot_identity")
    kind = key.get("descriptor_kind") if isinstance(key, dict) else None
    if kind != match.get("descriptor_kind"):
        return False
    if match.get("slot_locators"):
        return (
            binding_present
            and slot_present
            and _binding_same(binding, match.get("binding"))
            and _json_equal(slot_identity, match.get("slot_identity"))
            and bool(
                set(assessment.get("slot_locators", [])) & set(match["slot_locators"])
            )
        )
    # A resolved owner target without caller slots can consume only an original
    # required_slot_absent assessment for the same full Binding and kind. It
    # cannot borrow another Binding's state or infer a caller slot identity.
    return (
        binding_present
        and _binding_same(binding, match.get("binding"))
        and not slot_present
        and assessment.get("origin_branch") == "required_slot_absent"
        and assessment.get("slot_locators") == []
    )


def _basis_class(
    validated: dict[str, Any], claim: dict[str, Any]
) -> tuple[str, list[int], list[int]]:
    raw = validated["input"]
    if "basis_refs" not in claim:
        return "unresolved", [], []
    refs = claim["basis_refs"]
    if not isinstance(refs, list):
        _stop("basis_refs_shape")
    if not refs:
        return "nonsemantic_or_empty", [], []
    sources = raw.get("sources", [])
    if not isinstance(sources, list):
        _stop("basis_source_shape")

    source_indices: list[int] = []
    unresolved_indices: list[int] = []
    all_joined_sources_usable = True
    all_usable_reference_only = True
    has_usable_semantic = False
    for basis_index, basis_ref in enumerate(refs):
        joined = [
            source_index
            for source_index, source in enumerate(sources)
            if isinstance(source, dict) and _ref_same(source.get("ref"), basis_ref)
        ]
        source_indices.extend(joined)
        usable = [
            source_index
            for source_index in joined
            if _source_qualification_available(validated, sources[source_index])
        ]
        # A known-unusable duplicate does not erase a usable correspondence;
        # a Ref with no usable source remains unresolved for this basis member.
        if not joined or not usable:
            unresolved_indices.append(basis_index)
        for source_index in joined:
            source = sources[source_index]
            if source_index not in usable:
                all_joined_sources_usable = False
            elif source.get("role") != "reference_only":
                all_usable_reference_only = False
            if source_index in usable and source.get("role") == "semantic_json":
                has_usable_semantic = True

    if unresolved_indices:
        result = "unresolved"
    elif all_usable_reference_only:
        result = "reference_only_only"
    elif all_joined_sources_usable and not has_usable_semantic:
        result = "nonsemantic_or_empty"
    elif has_usable_semantic:
        result = "semantic_or_mixed"
    else:
        # Roles outside the known usable classes do not form a fallback route.
        result = "unresolved"
        unresolved_indices = list(range(len(refs)))
    return result, source_indices, unresolved_indices


def _route(
    claim: dict[str, Any],
    target: dict[str, Any],
    intent: dict[str, Any],
    assessment_indices: list[int],
    unmatched_match_indices: list[int],
    primary_indices: list[int],
    missing_indices: list[int],
    undefined_indices: list[int],
    basis_class: str,
) -> str:
    # A known negative or non-applicable intent does not request either rule.
    if intent.get("intent") == "negative":
        return "none"
    if intent.get("intent") != "positive":
        return "unresolved"
    if target.get("state") != "resolved":
        return "unresolved"
    if unmatched_match_indices or not assessment_indices or not primary_indices:
        return "unresolved"
    # With a complete primary assessment cohort, no matching support is a
    # definite non-trigger and does not depend on the basis classification.
    if not missing_indices and not undefined_indices:
        return "none"
    rule87 = (
        claim.get("kind") == "fill_definition"
        and intent.get("intent") == "positive"
        and target.get("state") == "resolved"
        and not unmatched_match_indices
        and bool(missing_indices)
        and basis_class == "reference_only_only"
    )
    rule93 = (
        claim.get("kind") == "fill_definition"
        and intent.get("intent") == "positive"
        and target.get("state") == "resolved"
        and not unmatched_match_indices
        and bool(undefined_indices)
        and basis_class in {"nonsemantic_or_empty", "reference_only_only"}
        and not rule87
    )
    if rule87:
        return "rule87"
    if rule93:
        return "rule93"
    if basis_class in {"unresolved", "semantic_or_mixed"}:
        return "unresolved"
    return "none"


def build_descriptor_claim_uses(validated, evaluation, reads, intents):
    """L5の同walk consumer。未対応のClaim経路は空usesへ丸めない。"""
    if (
        not isinstance(validated, dict)
        or set(validated) != {"input", "input_issues", "unusable_source_refs"}
        or not isinstance(validated["input_issues"], list)
        or not isinstance(validated["unusable_source_refs"], list)
    ):
        _stop("validated_supply_shape")
    if (
        not isinstance(evaluation, dict)
        or set(evaluation) != {"comparison", "assessments"}
        or not isinstance(evaluation["assessments"], list)
    ):
        _stop("evaluation_shape")
    if not isinstance(reads, list) or not isinstance(intents, list):
        _stop("same_walk_reads_shape")

    raw = validated["input"]
    if raw is None:
        if reads == [] and intents == [] and evaluation["assessments"] == []:
            return []
        _stop("null_input_has_claim_material")
    if not isinstance(raw, dict):
        _stop("validated_input_shape")
    claims = raw.get("claims", [])
    if not isinstance(claims, list):
        _stop("claims_shape")
    if not claims:
        if reads == [] and intents == []:
            return []
        _stop("zero_claim_has_read_material")
    if any(not isinstance(claim, dict) for claim in claims):
        _stop("unsupported_claim_kind")
    fill_claim_count = sum(claim.get("kind") == "fill_definition" for claim in claims)
    if len(reads) != fill_claim_count or len(intents) != fill_claim_count:
        _stop("same_walk_claim_count")

    assessments = evaluation["assessments"]
    for row in assessments:
        if (
            not isinstance(row, dict)
            or set(row) != _ASSESSMENT_FIELDS
            or not isinstance(row.get("key"), dict)
            or set(row["key"]) != {"binding", "slot_identity", "descriptor_kind"}
            or not isinstance(row.get("slot_locators"), list)
            or any(not isinstance(locator, str) for locator in row["slot_locators"])
        ):
            _stop("assessment_shape")
    uses: list[dict[str, Any]] = []
    fill_read_index = 0
    for claim_index, claim in enumerate(claims):
        if claim.get("kind") != "fill_definition":
            continue
        locator = f"/claims/{claim_index}"
        target = reads[fill_read_index]
        intent = intents[fill_read_index]
        if (
            not isinstance(target, dict)
            or set(target) != _TARGET_READ_FIELDS
            or not isinstance(intent, dict)
            or set(intent) != _INTENT_READ_FIELDS
            or target.get("claim_locator") != locator
            or intent.get("claim_locator") != locator
            or not _json_equal(target.get("claim"), claim)
            or not _json_equal(intent.get("claim"), claim)
        ):
            _stop("same_walk_read_mismatch")
        if not isinstance(target.get("matches"), list) or target.get("state") not in {
            "resolved",
            "unknown",
            "conflict",
        }:
            _stop("target_matches_shape")

        related: list[int] = []
        unmatched: list[int] = []
        if target.get("state") == "resolved":
            related_set: set[int] = set()
            for match_index, match in enumerate(target["matches"]):
                if not isinstance(match, dict):
                    _stop("target_match_shape")
                if not isinstance(match.get("slot_locators"), list) or any(
                    not isinstance(locator, str) for locator in match["slot_locators"]
                ):
                    _stop("target_match_shape")
                found = [
                    index
                    for index, assessment in enumerate(assessments)
                    if _assessment_matches(assessment, match)
                ]
                if found:
                    related_set.update(found)
                else:
                    unmatched.append(match_index)
            # Optional Ref differences may produce distinct matches for one
            # original slot. Preserve that assessment occurrence once, in E order.
            related = [
                index for index in range(len(assessments)) if index in related_set
            ]

        primary: list[int] = []
        for index in related:
            assessment = assessments[index]
            kind = assessment["key"].get("descriptor_kind")
            if (
                isinstance(kind, str)
                and isinstance(assessment.get("axis_name"), str)
                and assessment["axis_name"] == kind + ".definition"
            ):
                primary.append(index)
        missing = [
            index for index in primary if assessments[index].get("state") == "missing"
        ]
        undefined = [
            index
            for index in primary
            if assessments[index].get("state") == "unknown"
            and assessments[index].get("origin_branch") == "meaning_undefined"
        ]
        basis_class, basis_indices, unresolved_basis = _basis_class(validated, claim)
        route = _route(
            claim,
            target,
            intent,
            related,
            unmatched,
            primary,
            missing,
            undefined,
            basis_class,
        )
        uses.append(
            {
                "claim_locator": locator,
                "claim": copy.deepcopy(claim),
                "target_read": copy.deepcopy(target),
                "intent_read": copy.deepcopy(intent),
                "assessment_indices": related,
                "unmatched_match_indices": unmatched,
                "basis_source_indices": basis_indices,
                "unresolved_basis_ref_indices": unresolved_basis,
                "basis_class": basis_class,
                "missing_support_indices": missing,
                "undefined_support_indices": undefined,
                "route": route,
                "route_reason": _ROUTE_REASONS[route],
                "primary_definition_assessment_indices": primary,
            }
        )
        fill_read_index += 1
    return uses
