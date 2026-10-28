"""FN0 input carrier declarations and local shape validation.

This module owns the declared JSON carrier shapes and preserves supplied
member presence; it does not perform source qualification checks.
"""

from __future__ import annotations

import copy
import math
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from typing import Any


@dataclass(frozen=True)
class _ParsedJsonNumber:
    token: str
    exact_value: Decimal


_REF = {
    "identity": "string|null",
    "revision": "string|null",
    "scope": "raw",
    "owner": "string|null",
    "source_locator": "string|null",
    "sha256": "string|null",
}
_BINDING = {
    "requirement_ref": "ref",
    "product_scope": "raw",
    "process_contract_ref": "ref",
    "application_contract_ref": "ref",
    "template_ref": "ref|null",
    "knowledge_ref": "ref|null",
    "oracle_ref": "ref|null",
}
_CARRIERS: dict[str, dict[str, str]] = {
    "ApplicationInput": {
        "binding": "binding",
        "operations": "OperationSelection",
        "sources": "SourceEnvelope[]",
        "qualification_roots": "Ref[]",
        "qualifications": "Qualification[]",
        "axis_requirements": "AxisRequirement[]",
        "axis_facts": "AxisFact[]|null",
        "universes": "CandidateUniverse[]|null",
        "templates": "TemplateSnapshot[]",
        "conditions": "ConditionBinding[]",
        "semantic_comparisons": "SemanticComparison[]",
        "application_policies": "ApplicationPolicy[]",
        "na_records": "NARecord[]",
        "obligations": "KindObligation[]",
        "required_trace_refs": "Ref[]",
        "trace_edges": "TraceEdge[]",
        "field_inputs": "FieldInput[]",
        "gap_proposals": "GapProposal[]",
        "knowledge_records": "KnowledgeUseRecord[]",
        "consumers": "ConsumerSnapshot[]",
        "meaning_deltas": "MeaningDelta[]",
        "impact_evidence": "ImpactEvidence[]",
        "claims": "Claim[]",
        "nonsemantic_metadata": "raw",
        "semantic_records": "SemanticRecord[]",
        "trace_requirements": "TraceRequirement[]",
        "input_ref": "ref",
    },
    "OperationSelection": {
        "forward_requested": "bool",
        "backflow_requested": "bool",
        "impact_requested": "bool",
        "selected_knowledge_refs": "Ref[]",
        "unselected_knowledge_refs": "Ref[]",
    },
    "SourceEnvelope": {
        "ref": "ref",
        "body": "raw",
        "content_bytes": "string",
        "qualification_ref": "ref|null",
        "role": "enum:semantic_source|derived_view|explanation|reference_only",
    },
    "Qualification": {
        "ref": "ref",
        "root_ref": "ref",
        "subject_ref": "ref",
        "subject_sha256": "string|null",
        "owner": "string|null",
        "scope": "raw",
        "body": "raw",
    },
    "AxisFact": {
        "ref": "ref",
        "binding": "binding",
        "axis": "string",
        "value": "raw",
        "source_ref": "ref|null",
        "reason": "string|null",
    },
    "AxisRequirement": {
        "ref": "ref",
        "axis": "string",
        "operation": "enum:forward|backflow|impact|selected_knowledge|always",
        "subject_ref": "ref",
        "source_ref": "ref|null",
        "reason": "string|null",
    },
    "CandidateUniverse": {
        "ref": "ref",
        "binding": "binding",
        "members": "Ref[]|null",
        "boundary_refs": "Ref[]",
        "source_ref": "ref|null",
    },
    "TemplateSnapshot": {
        "ref": "ref",
        "binding": "binding",
        "meaning_contract_ref": "ref|null",
        "knowledge_ref": "ref|null",
        "source_ref": "ref|null",
        "usability": "raw",
        "condition_refs": "Ref[]",
        "required_input_refs": "Ref[]",
        "obligation_refs": "Ref[]",
    },
    "ConditionBinding": {
        "ref": "ref",
        "template_ref": "ref",
        "axis_fact_ref": "ref|null",
        "declared_meaning_ref": "ref|null",
        "semantic_comparison_ref": "ref|null",
        "source_ref": "ref|null",
        "condition_value": "raw",
    },
    "SemanticComparison": {
        "ref": "ref",
        "left_ref": "ref",
        "right_ref": "ref",
        "same_meaning": "bool|null",
        "source_ref": "ref|null",
        "reason": "string|null",
    },
    "ApplicationPolicy": {
        "ref": "ref",
        "template_ref": "ref",
        "binding": "binding",
        "condition_refs": "Ref[]",
        "obligation_refs": "Ref[]",
        "requiredness": "enum:required|conditional|unspecified",
        "source_ref": "ref|null",
        "non_applicable_basis_ref": "ref|null",
    },
    "NARecord": {
        "ref": "ref",
        "template_ref": "ref",
        "binding": "binding",
        "reason": "string|null",
        "decider": "string|null",
        "target_revision": "string|null",
        "reentry_condition": "raw",
        "source_ref": "ref|null",
    },
    "KindObligation": {
        "ref": "ref",
        "template_ref": "ref",
        "binding": "binding",
        "kind": "enum:unit|connection|composite",
        "meaning": "raw",
        "source_ref": "ref|null",
        "condition_refs": "Ref[]",
        "reentry_ref": "ref|null",
    },
    "TraceEdge": {
        "ref": "ref",
        "from_ref": "ref|null",
        "to_ref": "ref|null",
        "kind": "string|null",
        "direction": "string|null",
        "binding": "binding",
        "source_ref": "ref|null",
    },
    "FieldInput": {
        "ref": "ref",
        "template_ref": "ref",
        "binding": "binding",
        "definition_refs": "Ref[]|null",
        "value_fact_refs": "Ref[]|null",
        "source_ref": "ref|null",
    },
    "GapProposal": {
        "ref": "ref",
        "subject_ref": "ref",
        "binding": "binding",
        "kind": "enum:question|contradiction|derived_requirement_candidate|na_candidate|unresolved",
        "reason": "string|null",
        "source_refs": "Ref[]",
        "unfinished_obligation_refs": "Ref[]",
        "backflow_owner": "string|null",
    },
    "KnowledgeUseRecord": {
        "ref": "ref",
        "template_ref": "ref",
        "binding": "binding",
        "source_ref": "ref|null",
        "required_field_refs": "Ref[]|null",
        "operational_state": "raw",
        "authority_ref": "ref|null",
        "compatibility_ref": "ref|null",
        "limitations": "raw",
    },
    "ConsumerSnapshot": {
        "ref": "ref",
        "binding": "binding",
        "used_template_ref": "ref|null",
        "obligation_refs": "Ref[]",
        "artifact_refs": "Ref[]",
        "pair_refs": "Ref[]",
        "state": "raw",
        "source_ref": "ref|null",
    },
    "MeaningDelta": {
        "ref": "ref",
        "old_template_ref": "ref",
        "new_template_ref": "ref",
        "facet": "enum:applicability|required_field|negative_oracle|completion|view_only",
        "old_meaning_ref": "ref|null",
        "new_meaning_ref": "ref|null",
        "comparison_ref": "ref|null",
        "source_ref": "ref|null",
    },
    "ImpactEvidence": {
        "ref": "ref",
        "delta_ref": "ref",
        "consumer_ref": "ref",
        "binding": "binding",
        "affected": "bool|null",
        "reason": "string|null",
        "source_ref": "ref|null",
    },
    "Claim": {
        "ref": "ref",
        "subject_ref": "ref",
        "binding": "binding",
        "actor": "string|null",
        "kind": "string",
        "proposed_value": "raw",
        "basis_refs": "Ref[]",
    },
    "SemanticRecord": {
        "ref": "ref",
        "binding": "binding",
        "kind": "string",
        "meaning": "raw",
        "source_ref": "ref|null",
    },
    "TraceRequirement": {
        "ref": "ref",
        "binding": "binding",
        "from_ref": "ref",
        "to_ref": "ref",
        "kind": "string",
        "direction": "string",
        "source_ref": "ref|null",
    },
}
_CARRIERS["Ref"] = _REF
_CARRIERS["ref"] = _REF
_CARRIERS["ApplicationBinding"] = _BINDING
_CARRIERS["binding"] = _BINDING


def _is_raw(value: Any) -> bool:
    if value is None or isinstance(value, (str, bool, int)):
        return True
    if isinstance(value, float):
        return math.isfinite(value)
    if isinstance(value, list):
        return all(_is_raw(item) for item in value)
    if isinstance(value, dict):
        return all(
            isinstance(key, str) and _is_raw(item) for key, item in value.items()
        )
    return False


def _number(value: Any) -> Decimal | None:
    if isinstance(value, _ParsedJsonNumber):
        return value.exact_value
    if isinstance(value, bool) or not isinstance(value, (int, float, Decimal)):
        return None
    try:
        result = Decimal(str(value))
    except InvalidOperation:
        return None
    return result if result.is_finite() else None


def _json_equal(left: Any, right: Any) -> bool:
    """JSON equality keeps booleans separate and compares finite numbers exactly."""
    if isinstance(left, bool) or isinstance(right, bool):
        return type(left) is type(right) and left == right
    left_number, right_number = _number(left), _number(right)
    if left_number is not None or right_number is not None:
        return (
            left_number is not None
            and right_number is not None
            and left_number == right_number
        )
    if type(left) is not type(right):
        return False
    if isinstance(left, dict):
        return left.keys() == right.keys() and all(
            _json_equal(left[key], right[key]) for key in left
        )
    if isinstance(left, list):
        return len(left) == len(right) and all(
            _json_equal(a, b) for a, b in zip(left, right)
        )
    return left == right


def _validation_errors(value: Any, spec: str, pointer: str) -> list[str]:
    if spec.endswith("|null"):
        return [] if value is None else _validation_errors(value, spec[:-5], pointer)
    if spec.endswith("[]"):
        if not isinstance(value, list):
            return [pointer]
        errors: list[str] = []
        for index, item in enumerate(value):
            errors.extend(_validation_errors(item, spec[:-2], f"{pointer}/{index}"))
        return errors
    if spec.startswith("enum:"):
        return (
            [] if isinstance(value, str) and value in spec[5:].split("|") else [pointer]
        )
    if spec == "raw":
        return [] if _is_raw(value) else [pointer]
    if spec == "string":
        return [] if isinstance(value, str) else [pointer]
    if spec == "bool":
        return [] if isinstance(value, bool) else [pointer]
    if spec in _CARRIERS:
        if not isinstance(value, dict):
            return [pointer]
        return _validate_carrier(value, spec, pointer)
    return [pointer]


def _valid(value: Any, spec: str) -> bool:
    return _validation_errors(value, spec, "") == []


def _validate_carrier(value: Any, name: str, pointer: str = "") -> list[str]:
    fields = _CARRIERS[name]
    errors: list[str] = []
    for key in value:
        if not isinstance(key, str):
            # JSON object keys are strings; there is no JSON Pointer token for
            # this malformed in-memory key, so locate the containing object.
            errors.append(pointer)
            continue
        child = f"{pointer}/{_escape(key)}"
        if key not in fields:
            errors.append(child)
        else:
            errors.extend(_validation_errors(value[key], fields[key], child))
    return errors


def _escape(token: str) -> str:
    return token.replace("~", "~0").replace("/", "~1")


def _shape_issues(raw: Any) -> list[dict[str, Any]]:
    if not isinstance(raw, dict):
        return [
            {
                "locator": "",
                "reason": "ApplicationInputはJSON objectでなければならない。",
                "source_ref": None,
            }
        ]
    paths = _validate_carrier(raw, "ApplicationInput")
    issues: list[dict[str, Any]] = []
    for path in paths:
        source_ref = None
        pieces = path.split("/")
        if len(pieces) > 2 and pieces[1] == "sources" and pieces[2].isdigit():
            index = int(pieces[2])
            if index < len(raw.get("sources", [])):
                envelope = raw["sources"][index]
                if isinstance(envelope, dict) and isinstance(envelope.get("ref"), dict):
                    source_ref = envelope["ref"]
        issues.append(
            {
                "locator": path,
                "reason": "入力carrierの供給shapeが宣言型に適合しない。",
                "source_ref": copy.deepcopy(source_ref),
            }
        )
    return issues
