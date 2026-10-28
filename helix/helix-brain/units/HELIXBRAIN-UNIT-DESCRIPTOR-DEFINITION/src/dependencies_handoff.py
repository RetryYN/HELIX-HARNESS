"""B02（受領は消込でない）の fn6 compare_dependencies_and_handoff 垂直スライス。

根拠:
- L4-basic-design/template-semantic-supply.json#/dependency_semantic_ports
- L5-detail-design/template-semantic-supply.json#/functions/6
- L5-detail-design/template-semantic-supply.json#/failure_rules/1..2
- L5-detail-design/template-semantic-supply.json#/dependency_incoming_detail
- L5-detail-design/template-semantic-supply.json#/canonical_dependency_detail
- L5-detail-design/template-semantic-supply.json#/claim_intent_detail
"""

from __future__ import annotations

import copy
from typing import Any

from dependencies_handoff_ports import (
    _BACKFLOW_ID,
    _OS_INCOMING_MEMBERS,
    _OS_ORIGINAL_BINDING_MEMBERS,
    _OS_ORIGINAL_SCOPE_MEMBERS,
    _RECEIPT_ORIGIN_MEMBERS,
    _REQUIRED_ALWAYS_IDENTITIES,
    _TRACE_MEMBER_ORDER,
    _copy_refs_in_source_order,
    _ref_frame_supplied_ok,
    _serialize_trace,
    _unsupported,
)
from dependencies_handoff_claim_assessment import (
    _assess_b02_claim_basis,
    _is_os_incoming_content,
    _is_receipt_carrier_content,
    _verify_na_claim_subject_applicability_unknown,
)
from descriptor_definitions import (
    _binding_same,
    _binding_shape_ok,
    _json_equal,
    _ref_same,
    _ref_shape_ok,
    _source_usable,
)


def read_claim_intent(claim: dict[str, Any], claim_locator: str) -> dict[str, Any]:
    """L5#/claim_intent_detail & L4#/dependency_semantic_ports/ports/2。"""
    from dependencies_handoff_ports import read_claim_intent as _read

    return _read(claim, claim_locator)


def read_receipt_claim_origin(
    supply_input: dict[str, Any], request: dict[str, Any]
) -> dict[str, Any]:
    """L4#/dependency_semantic_ports/ports/1 & L5#/dependency_incoming_detail/receipt_origin_mapping。"""
    from dependencies_handoff_ports import read_receipt_claim_origin as _read

    return _read(supply_input, request)


def read_os_obligation_incoming(
    validated: dict[str, Any],
    claim: dict[str, Any],
    source_index: int,
    *,
    claim_index: int = 0,
    basis_index: int = 0,
    claim_intent: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """L4#/dependency_semantic_ports/ports/2 & L5#/dependency_incoming_detail/os_incoming_mapping。"""
    from dependencies_handoff_ports import read_os_obligation_incoming as _read

    return _read(
        validated,
        claim,
        source_index,
        claim_index=claim_index,
        basis_index=basis_index,
        claim_intent=claim_intent,
    )


def read_canonical_dependency_body(
    validated: dict[str, Any], request: dict[str, Any]
) -> dict[str, Any]:
    """L4#/dependency_semantic_ports/ports/0 & L5#/canonical_dependency_detail。"""
    from dependencies_handoff_ports import read_canonical_dependency_body as _read

    return _read(validated, request)


def _validate_fn6_slice_dependencies(
    raw: dict[str, Any], binding: dict[str, Any]
) -> None:
    if not _binding_shape_ok(binding) or not _ref_frame_supplied_ok(
        binding.get("knowledge_ref")
    ):
        raise _unsupported(
            "F09/B02",
            "binding_or_subject_ref_missing",
            "input.binding or knowledge_ref is incomplete",
        )
    dependencies = raw.get("dependencies")
    if not isinstance(dependencies, dict):
        raise _unsupported(
            "F09/B02", "dependencies_container_shape", "dependencies must be an object"
        )

    for selector in (
        "core_return_requested",
        "core_source_selected",
        "labo_evaluation_selected",
    ):
        if (
            selector not in dependencies
            or type(dependencies[selector]) is not bool
            or dependencies[selector] is not False
        ):
            raise _unsupported(
                "F09",
                "conditional_selector",
                f"dependencies.{selector} is missing, non-boolean, or True (outside B02 normal-dependency slice)",
            )

    for cond_cat in (
        "core_return_refs",
        "selected_source_refs",
        "selected_evaluation_refs",
    ):
        if (
            cond_cat not in dependencies
            or not isinstance(dependencies[cond_cat], list)
            or dependencies[cond_cat]
        ):
            raise _unsupported(
                "F09",
                "conditional_selector",
                f"dependencies.{cond_cat} is missing or non-empty while selector is False",
            )

    always_refs = dependencies.get("always_refs")
    if not isinstance(always_refs, list) or len(always_refs) != len(
        _REQUIRED_ALWAYS_IDENTITIES
    ):
        raise _unsupported(
            "F09",
            "required_always_ref_missing",
            "dependencies.always_refs does not have the 5 required canonical references",
        )
    observed_identities = []
    for ref in always_refs:
        if not _ref_frame_supplied_ok(ref):
            raise _unsupported(
                "F09",
                "required_always_ref_missing",
                "dependencies.always_refs contains an incomplete Ref frame",
            )
        observed_identities.append(ref["identity"])
    if tuple(observed_identities) != _REQUIRED_ALWAYS_IDENTITIES:
        raise _unsupported(
            "F09",
            "required_always_ref_missing",
            "dependencies.always_refs does not match the 5 required canonical identities in order",
        )

    unselected_refs = dependencies.get("unselected_refs")
    if not isinstance(unselected_refs, list) or any(
        not _ref_frame_supplied_ok(ref) for ref in unselected_refs
    ):
        raise _unsupported(
            "F09/B02",
            "unselected_refs_shape",
            "dependencies.unselected_refs is not a valid Ref array",
        )


def _build_claim_call_frame(validated):
    from descriptor_definition_walk import evaluate_descriptor_definition_walk
    from descriptor_target_frame import build_descriptor_claim_uses

    walk = evaluate_descriptor_definition_walk({"validated": validated})
    uses = build_descriptor_claim_uses(
        validated, walk["evaluation"], walk["target_reads"], walk["intent_reads"]
    )
    return {
        "validated": validated,
        "definition_evaluation": walk["evaluation"],
        "target_reads": walk["target_reads"],
        "claim_uses": uses,
    }


def compare_dependencies_and_handoff(context: dict[str, object]) -> dict[str, object]:
    """FN6 public wrapper; every decoded input uses one same-call frame."""
    if (
        isinstance(context, dict)
        and set(context) == {"validated", "definitions"}
        and isinstance(context.get("validated"), dict)
        and isinstance(context["validated"].get("input"), dict)
    ):
        frame = _build_claim_call_frame(context["validated"])
        return compare_dependencies_and_handoff_detail(context, frame)
    return _compare_dependencies_and_claims(context)


def compare_dependencies_and_handoff_detail(context, frame):
    """L5 same-call FN6 consumer for the existing closed DescriptorTargetCallFrame."""
    validated = context.get("validated") if isinstance(context, dict) else None
    if (
        not isinstance(context, dict)
        or set(context) != {"validated", "definitions"}
        or not isinstance(frame, dict)
        or set(frame)
        != {"validated", "definition_evaluation", "target_reads", "claim_uses"}
        or frame.get("validated") is not validated
        or not isinstance(frame.get("definition_evaluation"), dict)
        or set(frame["definition_evaluation"]) != {"comparison", "assessments"}
        or not isinstance(frame.get("target_reads"), list)
        or not isinstance(frame.get("claim_uses"), list)
    ):
        raise _unsupported(
            "B02/F09",
            "claim_call_frame_shape",
            "FN6 requires its same-call DescriptorTargetCallFrame",
        )
    return _compare_dependencies_and_claims(context, frame)


def _compare_dependencies_and_claims(
    context: dict[str, object], frame=None
) -> dict[str, object]:
    """Same-call detail with the existing B02 prefix and FN4 ClaimUse frame."""
    if not isinstance(context, dict) or set(context) != {"validated", "definitions"}:
        raise _unsupported(
            "B02/F09",
            "dependency_context_shape",
            "DependencyContext requires validated and definitions",
        )
    validated = context.get("validated")
    definitions = context.get("definitions")
    if not isinstance(validated, dict) or not isinstance(validated.get("input"), dict):
        raise _unsupported(
            "B02/F09",
            "validated_supply_shape",
            "compare_dependencies_and_handoff requires a decoded SupplyInput",
        )
    if (
        validated.get("input_issues") != []
        or validated.get("unusable_source_refs") != []
    ):
        raise _unsupported(
            "B02/F09",
            "validated_supply_issues_present",
            "fn6 B02 slice requires clean ValidatedSupply",
        )

    raw = validated["input"]
    binding = raw.get("binding")
    if not isinstance(binding, dict):
        raise _unsupported(
            "B02/F09", "binding_absent_or_wrong_type", "input.binding must be an object"
        )
    comparison_binding = (
        definitions.get("input_binding") if isinstance(definitions, dict) else None
    )
    comparison_binding_matches = _binding_same(comparison_binding, binding)
    if (
        not comparison_binding_matches
        and "dependencies" not in raw
        and not _binding_shape_ok(binding)
        and _json_equal(comparison_binding, binding)
    ):
        comparison_binding_matches = True
    if (
        not isinstance(definitions, dict)
        or set(definitions) != {"axes", "findings", "producer_symbol", "input_binding"}
        or definitions.get("producer_symbol") != "compare_descriptor_definitions"
        or not isinstance(definitions.get("axes"), list)
        or not isinstance(definitions.get("findings"), list)
        or not comparison_binding_matches
    ):
        raise _unsupported(
            "B02/F09",
            "definitions_comparison_mismatch",
            "definitions must be the same-snapshot fn1 Comparison",
        )

    axes: list[dict[str, Any]] = []
    findings: list[dict[str, Any]] = []
    if "dependencies" not in raw:
        from dependency_missing_projection import (
            project_absent_dependency_selector,
            project_required_dependency_missing_axis,
            project_required_dependency_missing_finding,
        )

        for required_identity in _REQUIRED_ALWAYS_IDENTITIES:
            axes.extend(
                project_required_dependency_missing_axis(
                    validated, "always_refs", required_identity
                )
            )
            findings.extend(
                project_required_dependency_missing_finding(
                    validated, "always_refs", required_identity
                )
            )
        for selector in (
            "core_return_requested",
            "core_source_selected",
            "labo_evaluation_selected",
        ):
            selector_axes, selector_findings = project_absent_dependency_selector(
                validated, selector
            )
            axes.extend(selector_axes)
            findings.extend(selector_findings)
    else:
        _validate_fn6_slice_dependencies(raw, binding)
        subject_ref = binding["knowledge_ref"]

        always_refs = raw["dependencies"]["always_refs"]
        for index in range(len(always_refs)):
            req = {
                "request_ref_locator": f"/dependencies/always_refs/{index}",
                "category_locator": "/dependencies/always_refs",
            }
            body_read = read_canonical_dependency_body(validated, req)
            problems = body_read["problems"]
            cause_value: Any
            if not problems:
                cause_value = None
            elif len(problems) == 1:
                cause_value = copy.deepcopy(problems[0])
            else:
                cause_value = copy.deepcopy(problems)
            prefix = problems[0]["reason"]
            trace_material = {
                "format": "BRAIN032-F09-axis-reason-trace-v1",
                "producer_symbol": "compare_dependencies_and_handoff",
                "axis": "dependency_reference",
                "state": body_read["state"],
                "subject_ref": copy.deepcopy(subject_ref),
                "binding": copy.deepcopy(binding),
                "original_refs": copy.deepcopy(body_read["category_refs"]),
                "backflow_owner": "knowledge_owner",
                "request_locator": req["request_ref_locator"],
                "source_category_locator": req["category_locator"],
                "cause": cause_value,
                "canonical_body_support": [],
                "handoff_record": None,
                "selection_observation": None,
            }
            axes.append(
                {
                    "subject_ref": copy.deepcopy(subject_ref),
                    "binding": copy.deepcopy(binding),
                    "axis": "dependency_reference",
                    "state": body_read["state"],
                    "original_refs": copy.deepcopy(body_read["category_refs"]),
                    "reason": f"{prefix}\nTRACE={_serialize_trace(trace_material)}",
                    "backflow_owner": "knowledge_owner",
                }
            )

        unselected_refs = raw["dependencies"]["unselected_refs"]
        for index, unselected_ref in enumerate(unselected_refs):
            trace_material = {
                "format": "BRAIN032-F09-axis-reason-trace-v1",
                "producer_symbol": "compare_dependencies_and_handoff",
                "axis": "unselected_source",
                "state": "unobserved",
                "subject_ref": copy.deepcopy(subject_ref),
                "binding": copy.deepcopy(binding),
                "original_refs": [copy.deepcopy(unselected_ref)],
                "backflow_owner": None,
                "request_locator": f"/dependencies/unselected_refs/{index}",
                "source_category_locator": "/dependencies/unselected_refs",
                "cause": None,
                "canonical_body_support": [],
                "handoff_record": None,
                "selection_observation": {
                    "core_source_selected": False,
                    "labo_evaluation_selected": False,
                    "port_call": "not_called_for_unselected_ref",
                },
            }
            axes.append(
                {
                    "subject_ref": copy.deepcopy(subject_ref),
                    "binding": copy.deepcopy(binding),
                    "axis": "unselected_source",
                    "state": "unobserved",
                    "original_refs": [copy.deepcopy(unselected_ref)],
                    "reason": f"未選択sourceは未観測。\nTRACE={_serialize_trace(trace_material)}",
                    "backflow_owner": None,
                }
            )

    handoff_records = raw["handoff_records"] if "handoff_records" in raw else []
    if not isinstance(handoff_records, list):
        raise _unsupported(
            "F09/B02", "handoff_records_shape", "handoff_records must be an array"
        )
    for index, record in enumerate(handoff_records):
        if (
            not isinstance(record, dict)
            or set(record)
            != {"subject_ref", "binding", "state", "source_ref", "reason"}
            or not _ref_frame_supplied_ok(record.get("subject_ref"))
            or not _binding_shape_ok(record.get("binding"))
            or record.get("state") != "not_received"
        ):
            raise _unsupported(
                "F09/B02",
                "handoff_record_outside_slice",
                f"handoff_records[{index}] is outside the B02 not_received slice",
            )
        if not _ref_frame_supplied_ok(record.get("source_ref")):
            raise _unsupported(
                "F09/B02",
                "handoff_source_ref_absent",
                f"handoff_records[{index}].source_ref is null or incomplete",
            )
        original_refs = [copy.deepcopy(record["source_ref"])]
        trace_material = {
            "format": "BRAIN032-F09-axis-reason-trace-v1",
            "producer_symbol": "compare_dependencies_and_handoff",
            "axis": "handoff",
            "state": record["state"],
            "subject_ref": copy.deepcopy(record["subject_ref"]),
            "binding": copy.deepcopy(record["binding"]),
            "original_refs": copy.deepcopy(original_refs),
            "backflow_owner": "os_owner",
            "request_locator": f"/handoff_records/{index}",
            "source_category_locator": None,
            "cause": None,
            "canonical_body_support": [],
            "handoff_record": copy.deepcopy(record),
            "selection_observation": None,
        }
        axes.append(
            {
                "subject_ref": copy.deepcopy(record["subject_ref"]),
                "binding": copy.deepcopy(record["binding"]),
                "axis": "handoff",
                "state": record["state"],
                "original_refs": original_refs,
                "reason": f"受渡しstateを原recordから保持。\nTRACE={_serialize_trace(trace_material)}",
                "backflow_owner": "os_owner",
            }
        )

    claims = raw.get("claims")
    if not isinstance(claims, list):
        raise _unsupported(
            "B02/F09", "claims_container_shape", "claims must be an array"
        )
    required_claim_members = {
        "subject_ref",
        "binding",
        "actor",
        "kind",
        "proposed_value",
        "basis_refs",
    }
    fill_claim_count = sum(
        isinstance(claim, dict) and claim.get("kind") == "fill_definition"
        for claim in claims
    )
    fill_use_index = 0
    for index, claim in enumerate(claims):
        if isinstance(claim, dict) and claim.get("kind") == "fill_definition":
            fill_required_members = {"subject_ref", "binding", "actor", "kind"}
            if (
                not fill_required_members <= set(claim)
                or not set(claim) <= required_claim_members
            ):
                raise _unsupported(
                    "B02/F09",
                    "claim_closed_shape",
                    f"claims[{index}] is outside the 6-field Claim shape",
                )
            if (
                not _ref_frame_supplied_ok(claim.get("subject_ref"))
                or not _binding_shape_ok(claim.get("binding"))
                or claim.get("actor") != "BRAIN"
            ):
                raise _unsupported(
                    "B02/F09",
                    "claim_frame_or_actor",
                    f"claims[{index}] has unsupported subject/binding/actor",
                )
            if not _binding_same(claim["binding"], binding):
                raise _unsupported(
                    "B02",
                    "claim_binding_mismatch",
                    f"claims[{index}].binding does not match input.binding",
                )
            if (
                not isinstance(frame, dict)
                or len(frame["target_reads"]) != fill_claim_count
                or len(frame["claim_uses"]) != fill_claim_count
            ):
                raise _unsupported(
                    "B02/F09",
                    "claim_call_frame_shape",
                    "FN6 requires original fill ClaimUse occurrences",
                )
            claim_locator = f"/claims/{index}"
            use_locator = f"/frame/claim_uses/{fill_use_index}"
            use = frame["claim_uses"][fill_use_index]
            if (
                not isinstance(use, dict)
                or use.get("claim_locator") != claim_locator
                or not _json_equal(use.get("claim"), claim)
            ):
                raise _unsupported(
                    "B02/F09",
                    "claim_call_frame_shape",
                    f"ClaimUse does not match {claim_locator}",
                )
            fill_use_index += 1
            route = use.get("route")
            if route == "rule87":
                reason = (
                    f"Claim {claim_locator} は、元targetの意味定義missingをreference_only資料で置換する主張である。"
                    f"原missingを保持し、全支持記録は同呼出し観測{use_locator}に残す。"
                )
                common = {
                    "subject_ref": copy.deepcopy(claim["subject_ref"]),
                    "binding": copy.deepcopy(claim["binding"]),
                    "axis": "descriptor.definition",
                    "state": "missing",
                    "reason": reason,
                    "backflow_owner": "knowledge_owner",
                }
                basis_refs = _copy_refs_in_source_order(claim["basis_refs"])
                axes.append({**common, "original_refs": basis_refs})
                findings.append(
                    {
                        "code": "reference_as_required_definition",
                        "rule_ref": "HELIXBRAIN-L5-032-R-reference_as_required_definition",
                        **common,
                        "source_refs": copy.deepcopy(basis_refs),
                    }
                )
            elif route not in {"none", "unresolved", "rule93"}:
                raise _unsupported(
                    "B02",
                    "unsupported_claim_kind",
                    f"unsupported ClaimUse route {route!r}",
                )
            continue
        if not isinstance(claim, dict) or set(claim) != required_claim_members:
            raise _unsupported(
                "B02/F09",
                "claim_closed_shape",
                f"claims[{index}] is outside the 6-field Claim shape",
            )
        if (
            not _ref_frame_supplied_ok(claim.get("subject_ref"))
            or not _binding_shape_ok(claim.get("binding"))
            or claim.get("actor") != "BRAIN"
        ):
            raise _unsupported(
                "B02/F09",
                "claim_frame_or_actor",
                f"claims[{index}] has unsupported subject/binding/actor",
            )
        if not _binding_same(claim["binding"], binding):
            raise _unsupported(
                "B02",
                "claim_binding_mismatch",
                f"claims[{index}].binding does not match input.binding",
            )

        kind = claim.get("kind")
        if kind not in {"project_obligation_discharge", "field_not_applicable"}:
            raise _unsupported(
                "B02",
                "unsupported_claim_kind",
                f"Claim kind {kind!r} is outside the B02 vertical slice",
            )

        intent_read = read_claim_intent(claim, f"/claims/{index}")
        if intent_read["intent"] != "positive":
            raise _unsupported(
                "B02",
                "non_positive_claim_intent",
                f"claims[{index}] has non-positive intent {intent_read['intent']!r}",
            )

        assessments = _assess_b02_claim_basis(validated, claim, index, intent_read)
        if not assessments:
            raise _unsupported(
                "B02",
                "claim_basis_not_receipt",
                f"claims[{index}] produced no basis assessments",
            )

        if kind == "project_obligation_discharge":
            rule_ref = "HELIXBRAIN-L5-032-R-receipt_as_product_discharge"
            code = "receipt_as_product_discharge"
            axis_name = "obligation_discharge_claim"
            backflow_owner = "os_owner"
            reason = "030受領主張は案件義務成立の根拠にならない。OSの案件義務達成根拠が未供給のため義務状態はunknown。"
        else:
            _verify_na_claim_subject_applicability_unknown(
                raw, definitions, claim, index
            )
            rule_ref = "HELIXBRAIN-L5-032-R-receipt_as_na"
            code = "receipt_as_na"
            axis_name = "applicability_claim"
            backflow_owner = "core_owner"
            reason = "030受領主張だけでN/Aは成立しない。COREの適用判断・理由・判定者・再評価条件が未供給のためunknown。"

        basis_copy = _copy_refs_in_source_order(claim["basis_refs"])
        axes.append(
            {
                "subject_ref": copy.deepcopy(claim["subject_ref"]),
                "binding": copy.deepcopy(claim["binding"]),
                "axis": axis_name,
                "state": "unknown",
                "original_refs": basis_copy,
                "reason": reason,
                "backflow_owner": backflow_owner,
            }
        )
        findings.append(
            {
                "code": code,
                "rule_ref": rule_ref,
                "subject_ref": copy.deepcopy(claim["subject_ref"]),
                "binding": copy.deepcopy(claim["binding"]),
                "axis": axis_name,
                "state": "unknown",
                "source_refs": copy.deepcopy(basis_copy),
                "reason": reason,
                "backflow_owner": backflow_owner,
            }
        )

    return {
        "axes": axes,
        "findings": findings,
        "producer_symbol": "compare_dependencies_and_handoff",
        "input_binding": copy.deepcopy(binding),
    }
