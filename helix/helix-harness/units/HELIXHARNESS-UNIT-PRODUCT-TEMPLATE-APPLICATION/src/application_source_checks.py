"""FN0 source, qualification, and root occurrence checks.

Each raw Qualification and root occurrence is observed in source order.
Qualification-level causes are emitted once; root-level causes are emitted
for each corresponding root occurrence.
"""

from __future__ import annotations

import copy
import hashlib
import json
from decimal import Decimal
from typing import Any

from application_input_schema import _ParsedJsonNumber, _escape, _json_equal

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


def _read(obj: Any, key: str) -> tuple[bool, Any]:
    if not isinstance(obj, dict) or key not in obj:
        return False, None
    return True, obj[key]


def _pointer(*parts: Any) -> str:
    return "".join("/" + _escape(str(part)) for part in parts)


def _operand_relation(left: Any, right: Any) -> str:
    """Presence-aware scalar/RawValue equality for already-read operands."""
    if left is _MISSING or right is _MISSING:
        return "unestablished"
    return "corresponding" if _json_equal(left, right) else "different"


def _problem_target(
    relation: str, left: Any, left_path: str, right: Any, right_path: str
) -> str:
    if relation == "different":
        return left_path
    if left is _MISSING:
        return left_path
    if right is _MISSING:
        return right_path
    return left_path


_MISSING = object()


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
        if not _json_equal(a, b):
            saw_difference = True
    if saw_difference:
        return "different"
    if any(member not in left or member not in right for member in _REF_CORE):
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

    route_results: list[str] = []
    content = source.get("content_bytes", _MISSING)
    for qindex, qualification in matches:
        qprefix = ("qualifications", qindex)
        qualification_checks: list[tuple[str, str, str]] = []
        qsubject = qualification.get("subject_ref", _MISSING)
        subject_relation = _ref_relation(qsubject, source_ref)
        subject_locator = _problem_target(
            subject_relation,
            qsubject,
            _pointer(*qprefix, "subject_ref"),
            source_ref,
            _pointer("sources", source_index, "ref"),
        )
        qualification_checks.append(
            ("qualification_subject", subject_relation, subject_locator)
        )
        for digest_value in (
            qualification.get("subject_sha256", _MISSING),
            (
                qsubject.get("sha256", _MISSING)
                if isinstance(qsubject, dict)
                else _MISSING
            ),
        ):
            relation = _digest_relation(source, digest_value, content)
            if relation != "not_applicable":
                qualification_checks.append(
                    (
                        "qualification_digest",
                        relation,
                        _pointer("sources", source_index, "content_bytes"),
                    )
                )

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
            q_owner_path = (
                _pointer(*qprefix, "owner")
                if owner_key == "owner"
                else _pointer(*qprefix, "ref", "owner")
            )
            relation = _operand_relation(owner_value, source_owner)
            qualification_checks.append(
                (
                    "qualification_owner",
                    relation,
                    _problem_target(
                        relation,
                        owner_value,
                        q_owner_path,
                        source_owner,
                        _pointer("sources", source_index, "ref", "owner"),
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
            q_scope_path = (
                _pointer(*qprefix, "scope")
                if scope_key == "scope"
                else _pointer(*qprefix, "subject_ref", "scope")
            )
            relation = _operand_relation(scope_value, source_scope)
            qualification_checks.append(
                (
                    "qualification_scope",
                    relation,
                    _problem_target(
                        relation,
                        scope_value,
                        q_scope_path,
                        source_scope,
                        _pointer("sources", source_index, "ref", "scope"),
                    ),
                )
            )

        def emit(checks: list[tuple[str, str, str]]) -> None:
            for kind, relation, locator in checks:
                if relation in ("different", "unestablished"):
                    local_issues.append(
                        _issue(
                            locator,
                            _CHECK_REASONS[kind][relation],
                            source_ref if isinstance(source_ref, dict) else None,
                        )
                    )

        # Qualification checks belong to the qualification occurrence, not to
        # each alternative root route. Store/report each original check once.
        emit(qualification_checks)
        qualification_result = _checks_result(qualification_checks)

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
        if not root_matches:
            lookup_reason = (
                "CORE Qualificationの独立root参照を原資料へ解決できない。"
                if root_ref is _MISSING
                else "CORE Qualificationの参照に対応する原独立rootを取得できない。"
            )
            # A missing/unmatched root is one unestablished lookup event, not
            # a synthetic comparison against unrelated roots or a root check
            # repeated in both qualification and lookup groups.
            local_issues.append(
                _issue(
                    _pointer(*qprefix, "root_ref"),
                    lookup_reason,
                    source_ref if isinstance(source_ref, dict) else None,
                )
            )
            route_results.append(
                _combine_relations(qualification_result, "unestablished")
            )
            continue

        for root_index, root in root_matches:
            root_checks: list[tuple[str, str, str]] = [
                (
                    "qualification_root_ref",
                    "corresponding",
                    _pointer(*qprefix, "root_ref"),
                )
            ]
            q_owner = qualification.get("owner", _MISSING)
            root_owner = root.get("owner", _MISSING)
            root_owner_path = _pointer("qualification_roots", root_index, "owner")
            for other_owner, other_owner_path in (
                (q_owner, _pointer(*qprefix, "owner")),
                (source_owner, _pointer("sources", source_index, "ref", "owner")),
            ):
                relation = _operand_relation(root_owner, other_owner)
                root_checks.append(
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
                root_checks.append(
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
            relation = _operand_relation(q_scope, root_scope)
            root_checks.append(
                (
                    "root_subject_revision_scope",
                    relation,
                    _problem_target(
                        relation,
                        q_scope,
                        _pointer(*qprefix, "scope"),
                        root_scope,
                        _pointer("qualification_roots", root_index, "scope"),
                    ),
                )
            )
            emit(root_checks)
            route_results.append(
                _combine_relations(qualification_result, _checks_result(root_checks))
            )

    if "corresponding" in route_results:
        return "corresponding", local_issues
    if "unestablished" in route_results:
        return "unestablished", local_issues
    return "different", local_issues


def _checks_result(checks: list[tuple[str, str, str]]) -> str:
    return _combine_relations(*(relation for _, relation, _ in checks))


def _combine_relations(*relations: str) -> str:
    if "different" in relations:
        return "different"
    if "unestablished" in relations:
        return "unestablished"
    return "corresponding"


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
