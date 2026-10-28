"""FN0 decode and same-input source-material checks.

The declarations below are the input-carrier portion of L5's logical schema.
They intentionally have no required-member lists: input presence is preserved,
and only supplied members are type checked.
"""

from __future__ import annotations

import copy
import hashlib
import json
import math
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from typing import Any


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

_REF_CORE = ("identity", "revision", "scope", "owner")
_CHECK_REASONS = {
    "content_bytes_body": {
        "different": "CORE sourceの原content_bytesとbodyが対応しない。",
        "unestablished": "CORE sourceの原content_bytesとbodyの照合が未成立である。",
    },
    "source_digest": {
        "different": "CORE sourceの供給digestが原content_bytesに対応しない。",
        "unestablished": "CORE sourceの供給digestと原content_bytesの照合が未成立である。",
    },
    "qualification_ref": {
        "different": "CORE sourceの資格参照と原Qualificationが対応しない。",
        "unestablished": "CORE sourceの資格参照を原資料へ解決できない。",
    },
    "qualification_subject": {
        "different": "CORE Qualificationの原subjectがsourceの対象版又はscopeへ対応しない。",
        "unestablished": "CORE Qualificationとsourceの原subject対応が未成立である。",
    },
    "qualification_digest": {
        "different": "CORE Qualificationの供給subject digestが原source bytesに対応しない。",
        "unestablished": "CORE Qualificationの供給subject digest照合が未成立である。",
    },
    "qualification_owner": {
        "different": "CORE Qualificationとsourceの原ownerが対応しない。",
        "unestablished": "CORE Qualificationとsourceの原owner対応が未成立である。",
    },
    "qualification_scope": {
        "different": "CORE Qualificationとsourceの原scopeが対応しない。",
        "unestablished": "CORE Qualificationとsourceの原scope対応が未成立である。",
    },
    "qualification_root_ref": {
        "different": "CORE Qualificationの原root参照と供給独立rootが対応しない。",
        "unestablished": "CORE Qualificationの独立root参照が未成立である。",
    },
    "root_owner": {
        "different": "CORE Qualificationの原root ownerがQualificationと対応しない。",
        "unestablished": "CORE Qualificationの原root owner対応が未成立である。",
    },
    "root_subject_revision_scope": {
        "different": "CORE Qualificationと独立rootの原参照が対応しない。",
        "unestablished": "CORE Qualificationと独立rootの原参照対応が未成立である。",
    },
}


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
            _issue(path, "入力carrierの供給shapeが宣言型に適合しない。", source_ref)
        )
    return issues


def _read(obj: Any, key: str) -> tuple[bool, Any]:
    if not isinstance(obj, dict) or key not in obj:
        return False, None
    return True, obj[key]


def _pointer(*parts: Any) -> str:
    return "".join("/" + _escape(str(part)) for part in parts)


def _operand_relation(left: Any, right: Any) -> str:
    """Presence-aware scalar/RawValue equality for already-read operands."""
    if left is _MISSING or right is _MISSING or left is None or right is None:
        return "unestablished"
    return "corresponding" if _json_equal(left, right) else "different"


def _problem_target(
    relation: str, left: Any, left_path: str, right: Any, right_path: str
) -> str:
    if relation == "different":
        return left_path
    if left is _MISSING or left is None:
        return left_path
    if right is _MISSING or right is None:
        return right_path
    return left_path


_MISSING = object()


@dataclass(frozen=True)
class _ParsedJsonNumber:
    token: str
    exact_value: Decimal


def _parse_json_number(token: str) -> _ParsedJsonNumber:
    return _ParsedJsonNumber(token, Decimal(token))


def _reject_non_json_constant(token: str) -> None:
    raise ValueError(f"not a JSON number token: {token}")


def _ref_relation(left: Any, right: Any) -> str:
    if not isinstance(left, dict) or not isinstance(right, dict):
        return "unestablished"
    saw_difference = False
    for member in _REF_CORE:
        if member not in left or member not in right:
            continue
        a, b = left[member], right[member]
        if a is None or b is None:
            continue
        if not _json_equal(a, b):
            saw_difference = True
    if saw_difference:
        return "different"
    if any(
        member not in left
        or member not in right
        or left[member] is None
        or right[member] is None
        for member in _REF_CORE
    ):
        return "unestablished"
    return "corresponding"


def _issue(locator: str, reason: str, source_ref: Any = None) -> dict[str, Any]:
    return {
        "locator": locator,
        "reason": reason,
        "source_ref": copy.deepcopy(source_ref),
    }


def _source_body_relation(source: dict[str, Any], index: int) -> tuple[str, str]:
    present, content = _read(source, "content_bytes")
    body_present, body = _read(source, "body")
    content_path = _pointer("sources", index, "content_bytes")
    body_path = _pointer("sources", index, "body")
    if not present or not body_present:
        return "unestablished", content_path if not present else body_path
    if not isinstance(content, str):
        return "unestablished", content_path
    try:
        content.encode("utf-8")
        parsed = json.loads(
            content,
            parse_float=_parse_json_number,
            parse_int=_parse_json_number,
            parse_constant=_reject_non_json_constant,
        )
    except (UnicodeEncodeError, json.JSONDecodeError, ValueError, RecursionError):
        return "unestablished", content_path
    return ("corresponding" if _json_equal(parsed, body) else "different"), content_path


def _digest_relation(source: dict[str, Any], digest: Any, content: Any) -> str:
    if digest is _MISSING or digest is None:
        return "not_applicable"
    if not isinstance(content, str):
        return "unestablished"
    try:
        actual = hashlib.sha256(content.encode("utf-8")).hexdigest()
    except UnicodeEncodeError:
        return "unestablished"
    return "corresponding" if actual == digest else "different"


def _source_qualification_route(
    source: dict[str, Any], raw: dict[str, Any], source_index: int
) -> tuple[str, list[dict[str, Any]]]:
    qref = source.get("qualification_ref", _MISSING)
    source_ref = source.get("ref", _MISSING)
    quals = raw.get("qualifications", _MISSING)
    roots = raw.get("qualification_roots", _MISSING)
    local_issues: list[dict[str, Any]] = []
    if qref is _MISSING or qref is None:
        return "unestablished", [
            _issue(
                _pointer("sources", source_index, "qualification_ref"),
                _CHECK_REASONS["qualification_ref"]["unestablished"],
                source_ref if isinstance(source_ref, dict) else None,
            )
        ]
    if not isinstance(quals, list):
        return "unestablished", [
            _issue(
                _pointer("sources", source_index, "qualification_ref"),
                "CORE sourceの資格参照に対応する原Qualificationを取得できない。",
                source_ref if isinstance(source_ref, dict) else None,
            )
        ]
    matches = [
        (i, q)
        for i, q in enumerate(quals)
        if isinstance(q, dict)
        and _ref_relation(qref, q.get("ref", _MISSING)) == "corresponding"
    ]
    if not matches:
        return "unestablished", [
            _issue(
                _pointer("sources", source_index, "qualification_ref"),
                "CORE sourceの資格参照に対応する原Qualificationを取得できない。",
                source_ref if isinstance(source_ref, dict) else None,
            )
        ]
    routes: list[str] = []
    content = source.get("content_bytes", _MISSING)
    for qindex, qualification in matches:
        qprefix = ("qualifications", qindex)
        checks: list[tuple[str, str, str]] = []
        qsubject = qualification.get("subject_ref", _MISSING)
        subject_relation = _ref_relation(qsubject, source_ref)
        subject_locator = _problem_target(
            subject_relation,
            qsubject,
            _pointer(*qprefix, "subject_ref"),
            source_ref,
            _pointer("sources", source_index, "ref"),
        )
        checks.append(
            (
                "qualification_subject",
                subject_relation,
                subject_locator,
            )
        )
        for _, digest_value in (
            ("subject_sha256", qualification.get("subject_sha256", _MISSING)),
            (
                "subject_ref.sha256",
                qsubject.get("sha256", _MISSING)
                if isinstance(qsubject, dict)
                else _MISSING,
            ),
        ):
            relation = _digest_relation(source, digest_value, content)
            if relation != "not_applicable":
                locator = _pointer("sources", source_index, "content_bytes")
                checks.append(("qualification_digest", relation, locator))
        source_owner = (
            source_ref.get("owner", _MISSING)
            if isinstance(source_ref, dict)
            else _MISSING
        )
        for owner_key, owner_value in (
            ("owner", qualification.get("owner", _MISSING)),
            (
                "ref.owner",
                qualification.get("ref", {}).get("owner", _MISSING)
                if isinstance(qualification.get("ref"), dict)
                else _MISSING,
            ),
        ):
            relation = _operand_relation(owner_value, source_owner)
            qualification_owner_path = (
                _pointer(*qprefix, "owner")
                if owner_key == "owner"
                else _pointer(*qprefix, "ref", "owner")
            )
            source_owner_path = _pointer("sources", source_index, "ref", "owner")
            checks.append(
                (
                    "qualification_owner",
                    relation,
                    _problem_target(
                        relation,
                        owner_value,
                        qualification_owner_path,
                        source_owner,
                        source_owner_path,
                    ),
                )
            )
        source_scope = (
            source_ref.get("scope", _MISSING)
            if isinstance(source_ref, dict)
            else _MISSING
        )
        for scope_key, scope_value in (
            ("scope", qualification.get("scope", _MISSING)),
            (
                "subject_ref.scope",
                qsubject.get("scope", _MISSING)
                if isinstance(qsubject, dict)
                else _MISSING,
            ),
        ):
            relation = _operand_relation(scope_value, source_scope)
            qualification_scope_path = (
                _pointer(*qprefix, "scope")
                if scope_key == "scope"
                else _pointer(*qprefix, "subject_ref", "scope")
            )
            source_scope_path = _pointer("sources", source_index, "ref", "scope")
            checks.append(
                (
                    "qualification_scope",
                    relation,
                    _problem_target(
                        relation,
                        scope_value,
                        qualification_scope_path,
                        source_scope,
                        source_scope_path,
                    ),
                )
            )
        root_ref = qualification.get("root_ref", _MISSING)
        root_rows = roots if isinstance(roots, list) else []
        root_relations = [
            (ri, root, _ref_relation(root_ref, root))
            for ri, root in enumerate(root_rows)
            if isinstance(root, dict)
        ]
        root_matches = [
            (ri, root)
            for ri, root, relation in root_relations
            if relation == "corresponding"
        ]
        if roots is _MISSING or not isinstance(roots, list) or not root_matches:
            root_relation = "unestablished"
            if (
                isinstance(roots, list)
                and roots
                and root_relations
                and all(relation == "different" for _, _, relation in root_relations)
            ):
                root_relation = "different"
            checks.append(
                (
                    "qualification_root_ref",
                    root_relation,
                    _pointer(*qprefix, "root_ref"),
                )
            )
        for root_index, root in root_matches:
            route_checks = list(checks)
            route_checks.append(
                (
                    "qualification_root_ref",
                    "corresponding",
                    _pointer(*qprefix, "root_ref"),
                )
            )
            q_owner = qualification.get("owner", _MISSING)
            root_owner = root.get("owner", _MISSING)
            source_owner = (
                source_ref.get("owner", _MISSING)
                if isinstance(source_ref, dict)
                else _MISSING
            )
            root_owner_path = _pointer("qualification_roots", root_index, "owner")
            qualification_owner_path = _pointer(*qprefix, "owner")
            source_owner_path = _pointer("sources", source_index, "ref", "owner")
            for other_owner, other_owner_path in (
                (q_owner, qualification_owner_path),
                (source_owner, source_owner_path),
            ):
                relation = _operand_relation(root_owner, other_owner)
                route_checks.append(
                    (
                        "root_owner",
                        relation,
                        _problem_target(
                            relation,
                            root_owner,
                            root_owner_path,
                            other_owner,
                            other_owner_path,
                        ),
                    )
                )
            for field in ("identity", "revision", "scope", "owner"):
                left_value = (
                    root_ref.get(field, _MISSING)
                    if isinstance(root_ref, dict)
                    else _MISSING
                )
                right_value = root.get(field, _MISSING)
                relation = _operand_relation(left_value, right_value)
                route_checks.append(
                    (
                        "root_subject_revision_scope",
                        relation,
                        _problem_target(
                            relation,
                            left_value,
                            _pointer(*qprefix, "root_ref", field),
                            right_value,
                            _pointer("qualification_roots", root_index, field),
                        ),
                    )
                )
            q_scope = qualification.get("scope", _MISSING)
            root_scope = root.get("scope", _MISSING)
            scope_relation = _operand_relation(q_scope, root_scope)
            route_checks.append(
                (
                    "root_subject_revision_scope",
                    scope_relation,
                    _problem_target(
                        scope_relation,
                        q_scope,
                        _pointer(*qprefix, "scope"),
                        root_scope,
                        _pointer("qualification_roots", root_index, "scope"),
                    ),
                )
            )
            result = "corresponding"
            for _, relation, _ in route_checks:
                if relation == "different":
                    result = "different"
                    break
                if relation == "unestablished":
                    result = "unestablished"
            routes.append(result)
            for kind, relation, locator in route_checks:
                if relation in ("different", "unestablished"):
                    local_issues.append(
                        _issue(
                            locator,
                            _CHECK_REASONS[kind][relation],
                            source_ref if isinstance(source_ref, dict) else None,
                        )
                    )
        if not root_matches and checks:
            lookup_checks = checks + [
                (
                    "qualification_root_ref",
                    root_relation,
                    _pointer(*qprefix, "root_ref"),
                )
            ]
            result = (
                "different"
                if any(relation == "different" for _, relation, _ in lookup_checks)
                else "unestablished"
            )
            routes.append(result)
            for kind, relation, locator in lookup_checks:
                if relation in ("different", "unestablished"):
                    local_issues.append(
                        _issue(
                            locator,
                            _CHECK_REASONS[kind][relation],
                            source_ref if isinstance(source_ref, dict) else None,
                        )
                    )
    if "corresponding" in routes:
        return "corresponding", local_issues
    if "unestablished" in routes:
        return "unestablished", local_issues
    return "different", local_issues


def _source_results(
    raw: dict[str, Any],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    issues: list[dict[str, Any]] = []
    unusable: list[dict[str, Any]] = []
    sources = raw.get("sources", _MISSING)
    if not isinstance(sources, list):
        return issues, unusable
    for index, source in enumerate(sources):
        if not isinstance(source, dict):
            continue
        source_ref = source.get("ref", _MISSING)
        typed_ref = copy.deepcopy(source_ref) if isinstance(source_ref, dict) else None
        body_result, body_locator = _source_body_relation(source, index)
        if body_result in ("different", "unestablished"):
            issues.append(
                _issue(
                    body_locator,
                    _CHECK_REASONS["content_bytes_body"][body_result],
                    typed_ref,
                )
            )
        content = source.get("content_bytes", _MISSING)
        digest = (
            source_ref.get("sha256", _MISSING)
            if isinstance(source_ref, dict)
            else _MISSING
        )
        digest_result = _digest_relation(source, digest, content)
        if digest_result in ("different", "unestablished"):
            issues.append(
                _issue(
                    _pointer("sources", index, "content_bytes"),
                    _CHECK_REASONS["source_digest"][digest_result],
                    typed_ref,
                )
            )
        route_result, route_issues = _source_qualification_route(source, raw, index)
        issues.extend(route_issues)
        # Public membership is deliberately independent of source_role.
        if (
            body_result in ("different", "unestablished")
            or digest_result in ("different", "unestablished")
            or route_result in ("different", "unestablished")
        ):
            if typed_ref is not None:
                unusable.append(typed_ref)
    return issues, unusable


def validate_application_input(raw: Any) -> dict[str, Any]:
    """Decode one RawValue and return the L5 ValidatedApplication projection."""
    shape_issues = _shape_issues(raw)
    if shape_issues:
        return {"input": None, "input_issues": shape_issues, "unusable_source_refs": []}
    original = copy.deepcopy(raw)
    issues, unusable = _source_results(original)
    return {"input": original, "input_issues": issues, "unusable_source_refs": unusable}
