"""BRAIN032の局所入力検証と同snapshot比較（公開関数委譲ファサード）。"""

from __future__ import annotations

import copy
from typing import Any

from supply_validation import (
    _APPROVED_KINDS,
    _BACKFLOW_ID,
    _BINDING_REFS,
    _INPUT_ARRAYS,
    _SUPPLY_INPUT_MEMBERS,
    _auxiliary_array_record_issue,
    _binding_same,
    _binding_shape_ok,
    _comparison,
    _copy_refs_in_source_order,
    _input_issue,
    _is_json_value,
    _json_equal,
    _ordered,
    _owner_body_equal,
    _presence,
    _qualification_shape_ok,
    _ref_identity_same,
    _ref_same,
    _ref_shape_ok,
    _reject_non_json_constant,
    _source_qualification_ok,
    _source_shape_ok,
    _source_usable,
    _tag_unsupported,
    _unique_object_pairs,
    _unsupported,
    _wire_binding_shape_ok,
    _wire_ref_shape_ok,
)

_F03_AXIS_MEMBERS = (
    "subject_ref", "binding", "axis", "state", "original_refs", "reason", "backflow_owner",
)
_F03_FINDING_MEMBERS = (
    "code", "rule_ref", "subject_ref", "binding", "axis", "state", "source_refs",
    "reason", "backflow_owner",
)


def validate_supply_input(raw: object) -> dict[str, object]:
    """JSON objectを保持し、固定N03経路に必要なbytes/qualificationを照合する。"""
    from supply_validation import validate_supply_input as _fn0

    return _fn0(raw)


def compare_descriptor_definitions(context: dict[str, object]) -> dict[str, object]:
    """fn1: N03同一snapshot経路の定義・owner帰属・明示NAを別軸で返す。"""
    from definition_comparison import compare_descriptor_definitions as _fn1

    return _fn1(context)


def _copy_axis_to_f03(axis: dict[str, Any]) -> dict[str, Any]:
    if set(axis) != set(_F03_AXIS_MEMBERS):
        raise NotImplementedError("AxisResult does not match the closed F03B axis type: Backflow HELIXBRAIN-L6-032-N03-PATH")
    if not isinstance(axis.get("original_refs"), list):
        raise NotImplementedError("AxisResult.original_refs is not an array: Backflow HELIXBRAIN-L6-032-N03-PATH")
    return {member: copy.deepcopy(axis[member]) for member in _F03_AXIS_MEMBERS}


def _copy_finding_to_f03(finding: dict[str, Any]) -> dict[str, Any]:
    if set(finding) != set(_F03_FINDING_MEMBERS):
        raise NotImplementedError("Finding does not match the closed F03B finding type: Backflow HELIXBRAIN-L6-032-N03-PATH")
    if not isinstance(finding.get("source_refs"), list):
        raise NotImplementedError("Finding.source_refs is not an array: Backflow HELIXBRAIN-L6-032-N03-PATH")
    return {member: copy.deepcopy(finding[member]) for member in _F03_FINDING_MEMBERS}


def _copy_axis_from_f03(axis: dict[str, Any]) -> dict[str, Any]:
    if set(axis) != set(_F03_AXIS_MEMBERS) or not isinstance(axis.get("original_refs"), list):
        raise NotImplementedError("F03BAxisResult does not match the closed public AxisResult: Backflow HELIXBRAIN-L6-032-N03-PATH")
    return {
        "subject_ref": copy.deepcopy(axis["subject_ref"]),
        "binding": copy.deepcopy(axis["binding"]),
        "axis": copy.deepcopy(axis["axis"]),
        "state": copy.deepcopy(axis["state"]),
        "original_refs": copy.deepcopy(axis["original_refs"]),
        "reason": copy.deepcopy(axis["reason"]),
        "backflow_owner": copy.deepcopy(axis["backflow_owner"]),
    }


def _copy_finding_from_f03(finding: dict[str, Any]) -> dict[str, Any]:
    if set(finding) != set(_F03_FINDING_MEMBERS) or not isinstance(finding.get("source_refs"), list):
        raise NotImplementedError("F03BFinding does not match the closed public Finding: Backflow HELIXBRAIN-L6-032-N03-PATH")
    return {
        "code": copy.deepcopy(finding["code"]),
        "rule_ref": copy.deepcopy(finding["rule_ref"]),
        "subject_ref": copy.deepcopy(finding["subject_ref"]),
        "binding": copy.deepcopy(finding["binding"]),
        "axis": copy.deepcopy(finding["axis"]),
        "state": copy.deepcopy(finding["state"]),
        "source_refs": copy.deepcopy(finding["source_refs"]),
        "reason": copy.deepcopy(finding["reason"]),
        "backflow_owner": copy.deepcopy(finding["backflow_owner"]),
    }


def _write_f03b_comparison_from_existing_comparison(comparison: dict[str, Any]) -> dict[str, Any]:
    """Closed fieldwise writer; this is not a type cast or a recomputation."""
    if set(comparison) != {"axes", "findings", "producer_symbol", "input_binding"}:
        raise NotImplementedError("Comparison has an unsupported closed shape: Backflow HELIXBRAIN-L6-032-N03-PATH")
    if not isinstance(comparison["axes"], list) or not isinstance(comparison["findings"], list):
        raise NotImplementedError("Comparison arrays have an unsupported shape: Backflow HELIXBRAIN-L6-032-N03-PATH")
    return {
        "axes": [_copy_axis_to_f03(axis) if isinstance(axis, dict) else _invalid_axis() for axis in comparison["axes"]],
        "findings": [_copy_finding_to_f03(row) if isinstance(row, dict) else _invalid_finding() for row in comparison["findings"]],
        "producer_symbol": copy.deepcopy(comparison["producer_symbol"]),
        "input_binding": copy.deepcopy(comparison["input_binding"]),
    }


def _invalid_axis() -> Any:
    raise NotImplementedError("non-object AxisResult: Backflow HELIXBRAIN-L6-032-N03-PATH")


def _invalid_finding() -> Any:
    raise NotImplementedError("non-object Finding: Backflow HELIXBRAIN-L6-032-N03-PATH")


def _write_existing_comparison_from_f03(comparison: dict[str, Any]) -> dict[str, Any]:
    """Project the private closed F03BComparison back to the public shape."""
    if set(comparison) != {"axes", "findings", "producer_symbol", "input_binding"}:
        raise NotImplementedError("F03BComparison has an unsupported closed shape: Backflow HELIXBRAIN-L6-032-N03-PATH")
    if not isinstance(comparison["axes"], list) or not isinstance(comparison["findings"], list):
        raise NotImplementedError("F03BComparison arrays have an unsupported shape: Backflow HELIXBRAIN-L6-032-N03-PATH")
    return {
        "axes": [_copy_axis_from_f03(axis) if isinstance(axis, dict) else _invalid_axis() for axis in comparison["axes"]],
        "findings": [_copy_finding_from_f03(row) if isinstance(row, dict) else _invalid_finding() for row in comparison["findings"]],
        "producer_symbol": copy.deepcopy(comparison["producer_symbol"]),
        "input_binding": copy.deepcopy(comparison["input_binding"]),
    }



def _same_claim_target(claim: Any, value_fact: Any) -> bool:
    return (
        isinstance(claim, dict)
        and isinstance(value_fact, dict)
        and _ref_same(claim.get("subject_ref"), value_fact.get("subject_ref"))
        and _binding_same(claim.get("binding"), value_fact.get("binding"))
    )


def _n03_rule(claim: dict[str, Any], value_fact: dict[str, Any]) -> tuple[str, str, str, str]:
    """L5 rules 102–104の限定predicate。fixture宣言だけでは発火させない。"""
    required_claim_members = {"subject_ref", "binding", "actor", "kind", "proposed_value", "basis_refs"}
    required_value_members = {"subject_ref", "binding", "value", "source_ref", "reason", "origin", "applicability_ref", "ref"}
    if set(claim) != required_claim_members or set(value_fact) != required_value_members:
        raise NotImplementedError("Claim/ValueFact closed shape branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    if claim.get("actor") != "BRAIN" or not isinstance(claim.get("basis_refs"), list):
        raise NotImplementedError("Claim actor/basis branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    if claim["basis_refs"]:
        raise NotImplementedError("N03 Claim with supplied basis refs needs its existing predicate reader: Backflow HELIXBRAIN-L6-032-N03-PATH")
    if not _same_claim_target(claim, value_fact):
        raise NotImplementedError("Claim-to-ValueFact relation branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    if (
        value_fact.get("value", object()) is not None
        or value_fact.get("origin") != "absent"
        or value_fact.get("source_ref", object()) is not None
        or value_fact.get("applicability_ref", object()) is not None
    ):
        raise NotImplementedError("Claim value/origin branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    proposed = claim.get("proposed_value")
    if not isinstance(proposed, dict) or set(proposed) != {"intended_value", "basis_origin"} or proposed.get("basis_origin") != "reference_fixture":
        raise NotImplementedError("Claim proposed-value basis branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    intended = proposed.get("intended_value")
    if not isinstance(claim["kind"], str) or not isinstance(intended, str):
        raise _unsupported("F03/N03", "claim_kind_or_intended_value_type", "the implemented fixture tuple requires string kind and intended value")
    tuples = {
        ("operation_deadline", "90 seconds"): (
            "HELIXBRAIN-L5-032-R-fixture_timeout_default", "operation_value", "core_owner",
            "対象operationの期限根拠が未供給。参照fixture90秒を一般期限へ転用しても原operation値unknown。",
        ),
        ("resource_capacity", "1 CPU"): (
            "HELIXBRAIN-L5-032-R-fixture_cpu_default", "resource_value", "infrastructure_owner",
            "対象operation/実環境のINFRA根拠が未供給。fixture1CPUでは実資源値を供給できない。",
        ),
        ("resource_capacity", "256 MiB"): (
            "HELIXBRAIN-L5-032-R-fixture_memory_default", "resource_value", "infrastructure_owner",
            "対象operation/実環境のINFRA根拠が未供給。fixture256MiBでは実容量値を供給できない。",
        ),
    }
    rule = tuples.get((claim.get("kind"), intended))
    if rule is None:
        raise NotImplementedError("Claim kind/value outside frozen N03 path: Backflow HELIXBRAIN-L6-032-N03-PATH")
    return rule


def _evaluate_field_values_detail(context: dict[str, Any]) -> dict[str, Any]:
    """L4 F03BasicContextを受け、閉じたF03Evaluationを返す。"""
    from values_applicability import evaluate_field_values_detail as _eval_f03

    return _eval_f03(context)

@_tag_unsupported("F03/N03")
def compare_values_and_applicability(context: dict[str, object]) -> dict[str, object]:
    """fn2: 同じValidatedSupplyとfn1 Comparisonを使うF03 private detail一回。"""
    if not isinstance(context, dict):
        raise NotImplementedError("ValueContext must be an object")
    validated = context.get("validated")
    definitions = context.get("definitions")
    if not isinstance(validated, dict) or not isinstance(validated.get("input"), dict):
        raise NotImplementedError("compare_values_and_applicability requires a decoded SupplyInput")
    if (
        not isinstance(definitions, dict)
        or set(definitions) != {"axes", "findings", "producer_symbol", "input_binding"}
        or definitions.get("producer_symbol") != "compare_descriptor_definitions"
        or not isinstance(definitions.get("axes"), list)
        or not isinstance(definitions.get("findings"), list)
        or not _binding_same(definitions.get("input_binding"), validated["input"].get("binding"))
    ):
        raise NotImplementedError("fn2 requires the same-snapshot public fn1 Comparison shape/Binding")
    f03_context = {
        "snapshot": validated,
        "definitions": _write_f03b_comparison_from_existing_comparison(definitions),
    }
    evaluation = _evaluate_field_values_detail(f03_context)
    if set(evaluation) != {"comparison", "rows", "problems"}:
        raise NotImplementedError("F03Evaluation closed shape: Backflow HELIXBRAIN-L6-032-N03-PATH")
    return _write_existing_comparison_from_f03(evaluation["comparison"])


def compare_dependencies_and_handoff(context: dict[str, object]) -> dict[str, object]:
    from dependencies_handoff import compare_dependencies_and_handoff as _fn6

    return _fn6(context)


def compare_identity_versions_and_trace(context: dict[str, object]) -> dict[str, object]:
    from identity_trace import compare_identity_versions_and_trace as _fn3

    return _fn3(context)


def compare_oracle_and_view_boundary(context: dict[str, object]) -> dict[str, object]:
    from oracle_view_boundary import compare_oracle_and_view_boundary as _fn4

    return _fn4(context)


def compare_knowledge_promotion(context: dict[str, object]) -> dict[str, object]:
    from knowledge_promotion import compare_knowledge_promotion as _fn5

    return _fn5(context)


def compare_claim_boundaries(context: dict[str, object]) -> dict[str, object]:
    from claim_boundaries import compare_claim_boundaries as _fn7

    return _fn7(context)
