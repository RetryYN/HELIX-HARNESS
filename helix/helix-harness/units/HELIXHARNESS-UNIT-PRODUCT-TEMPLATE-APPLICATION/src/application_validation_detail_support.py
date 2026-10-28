"""Read, check, and cause writers shared by native FN0 validation detail."""

from __future__ import annotations

import copy
from typing import Any

from application_source_checks import (
    _MISSING,
    _digest_relation,
    _pointer,
    _ref_relation,
    _source_body_relation,
)

_CHECK_RULES = {
    "content_bytes_body": (
        0,
        "source_body_mismatch",
        "body_unformed",
        "CORE sourceの原content_bytesとbodyが対応しない。",
        "CORE sourceの原content_bytesとbodyの照合が未成立である。",
    ),
    "source_digest": (
        1,
        "source_unusable",
        "source_unresolved",
        "CORE sourceの供給digestが原content_bytesに対応しない。",
        "CORE sourceの供給digestと原content_bytesの照合が未成立である。",
    ),
    "source_role": (
        2,
        "source_unusable",
        "source_unresolved",
        "CORE sourceはsemantic_sourceとして使う原roleではない。",
        "CORE sourceの意味根拠としての原roleが未成立である。",
    ),
    "qualification_ref": (
        3,
        "target_mismatch",
        "source_unresolved",
        "CORE sourceの資格参照と原Qualificationが対応しない。",
        "CORE sourceの資格参照と原Qualificationの対応が未成立である。",
    ),
    "qualification_subject": (
        4,
        "target_mismatch",
        "target_unformed",
        "CORE Qualificationの原subjectがsourceの対象版又はscopeへ対応しない。",
        "CORE Qualificationとsourceの原subject対応が未成立である。",
    ),
    "qualification_digest": (
        5,
        "source_unusable",
        "source_unresolved",
        "CORE Qualificationの供給subject digestが原source bytesに対応しない。",
        "CORE Qualificationの供給subject digest照合が未成立である。",
    ),
    "qualification_owner": (
        6,
        "owner_mismatch",
        "owner_binding_unestablished",
        "CORE Qualificationとsourceの原ownerが対応しない。",
        "CORE Qualificationとsourceの原owner対応が未成立である。",
    ),
    "qualification_scope": (
        7,
        "target_mismatch",
        "target_unformed",
        "CORE Qualificationとsourceの原scopeが対応しない。",
        "CORE Qualificationとsourceの原scope対応が未成立である。",
    ),
    "qualification_root_ref": (
        8,
        "target_mismatch",
        "source_unresolved",
        "CORE Qualificationの原root参照と供給独立rootが対応しない。",
        "CORE Qualificationの原root参照と供給独立rootの対応が未成立である。",
    ),
    "root_owner": (
        9,
        "owner_mismatch",
        "owner_binding_unestablished",
        "COREの供給独立rootと資格又はsourceの原ownerが対応しない。",
        "COREの供給独立rootの原owner対応が未成立である。",
    ),
    "root_subject_revision_scope": (
        10,
        "target_mismatch",
        "target_unformed",
        "COREの原root参照又は資格scopeが供給独立rootへ対応しない。",
        "COREの原root参照又は資格scopeと供給独立rootの対応が未成立である。",
    ),
}


def _location(root: str, pointer: str) -> dict[str, Any]:
    return {"root": root, "pointer": pointer}


def _read(root: str, value: Any, pointer: str) -> dict[str, Any]:
    return {
        "tag": "present",
        "location": _location(root, pointer),
        "value": copy.deepcopy(value),
    }


def _read_path(raw: Any, pointer: str) -> dict[str, Any]:
    current = raw
    parent = raw
    parent_pointer = ""
    for part in pointer.split("/")[1:]:
        part = part.replace("~1", "/").replace("~0", "~")
        if isinstance(current, dict) and part in current:
            parent, parent_pointer = current, _pointer_from(parent_pointer, part)
            current = current[part]
        elif isinstance(current, list) and part.isdigit() and int(part) < len(current):
            parent, parent_pointer = current, _pointer_from(parent_pointer, part)
            current = current[int(part)]
        else:
            requested = _location("validation_input", pointer)
            parent_loc = _location("validation_input", parent_pointer)
            return {
                "tag": "absent",
                "requested": requested,
                "parent": parent_loc,
                "parent_value": copy.deepcopy(parent),
            }
    return _read("validation_input", current, pointer)


def _pointer_from(parent: str, part: str) -> str:
    escaped = part.replace("~", "~0").replace("/", "~1")
    return f"{parent}/{escaped}"


def _original(read: dict[str, Any]) -> dict[str, Any]:
    return {"tag": "original", "read": copy.deepcopy(read)}


def _literal(value: Any, pointer: str) -> dict[str, Any]:
    return {"tag": "normative_literal", "value": value, "rule_pointer": pointer}


def _relation(left: Any, right: Any) -> str:
    if left is _MISSING or right is _MISSING:
        return "unestablished"
    from application_input_schema import _json_equal

    return "corresponding" if _json_equal(left, right) else "different"


def _check_cause(
    kind: str,
    result: str,
    left: dict[str, Any],
    right: dict[str, Any],
    rule_pointer: str,
) -> list[dict[str, Any]]:
    if result not in {"different", "unestablished"}:
        return []
    _, different_kind, unknown_kind, different_reason, unknown_reason = _CHECK_RULES[
        kind
    ]
    cause_kind = different_kind if result == "different" else unknown_kind
    left_read = left["read"]
    right_read = right.get("read") if right.get("tag") == "original" else None
    if result == "different":
        target = left_read.get("location", left_read.get("requested"))
    elif left_read["tag"] in {"absent", "unreached"}:
        target = left_read["requested"]
    elif right_read is not None and right_read["tag"] in {"absent", "unreached"}:
        target = right_read["requested"]
    else:
        target = left_read.get("location", left_read.get("requested"))
    return [
        {
            "kind": cause_kind,
            "target": copy.deepcopy(target),
            "left": copy.deepcopy(left),
            "right": copy.deepcopy(right),
            "rule_pointer": rule_pointer,
        }
    ]


def _check(
    kind: str,
    result: str,
    left: dict[str, Any],
    right: dict[str, Any],
    rule_pointer: str | None = None,
) -> dict[str, Any]:
    ordinal = _CHECK_RULES[kind][0]
    pointer = (
        rule_pointer
        or f"/f05_detail_contract/source_observation_contract/checks/{ordinal}"
    )
    left_operand = _original(left)
    check_right = copy.deepcopy(right)
    return {
        "kind": kind,
        "result": result,
        "left": left_operand,
        "right": check_right,
        "rule_pointer": pointer,
        "causes": _check_cause(kind, result, left_operand, check_right, pointer),
    }


def _check_result(checks: list[dict[str, Any]]) -> str:
    states = [row["result"] for row in checks]
    if "different" in states:
        return "different"
    if "unestablished" in states:
        return "unestablished"
    return "corresponding"


def _aggregate_causes(checks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [copy.deepcopy(cause) for row in checks for cause in row["causes"]]


def _issue_for_check(check: dict[str, Any], source_ref: Any) -> dict[str, Any]:
    cause = check["causes"][0]
    rule_index, _, _, different_reason, unknown_reason = _CHECK_RULES[check["kind"]]
    del rule_index
    return {
        "locator": cause["target"]["pointer"],
        "reason": (
            different_reason if check["result"] == "different" else unknown_reason
        ),
        "source_ref": copy.deepcopy(source_ref),
    }


_LOOKUP_REASONS = {
    "source_qualification_ref_unformed": "CORE sourceの資格参照を原資料へ解決できない。",
    "qualification_lookup_unresolved": "CORE sourceの資格参照に対応する原Qualificationを取得できない。",
    "qualification_root_ref_unformed": "CORE Qualificationの独立root参照を原資料へ解決できない。",
    "root_lookup_unresolved": "CORE Qualificationの参照に対応する原独立rootを取得できない。",
}


def _issue_for_lookup(cause: dict[str, Any], reason: str, source_ref: Any):
    return {
        "locator": cause["target"]["pointer"],
        "reason": reason,
        "source_ref": copy.deepcopy(source_ref),
    }


def _source_checks(raw: dict[str, Any], source_index: int, source: dict[str, Any]):
    prefix = f"/sources/{source_index}"
    content = source.get("content_bytes", _MISSING)
    body_result, _ = _source_body_relation(source, source_index)
    body_check = _check(
        "content_bytes_body",
        body_result,
        _read_path(raw, f"{prefix}/content_bytes"),
        _original(_read_path(raw, f"{prefix}/body")),
    )
    digest = (
        source.get("ref", {}).get("sha256", _MISSING)
        if isinstance(source.get("ref"), dict)
        else _MISSING
    )
    digest_result = _digest_relation(source, digest, content)
    digest_check = _check(
        "source_digest",
        digest_result,
        _read_path(raw, f"{prefix}/content_bytes"),
        _original(_read_path(raw, f"{prefix}/ref/sha256")),
    )
    role = source.get("role", _MISSING)
    role_result = _relation(role, "semantic_source")
    role_check = _check(
        "source_role",
        role_result,
        _read_path(raw, f"{prefix}/role"),
        _literal(
            "semantic_source",
            "/f05_detail_contract/source_observation_contract/checks/2",
        ),
    )
    return [body_check, digest_check, role_check]


def _field_value(record: Any, key: str):
    return record.get(key, _MISSING) if isinstance(record, dict) else _MISSING


def _qualification_checks(
    raw, source_index, qualification_index, source, qualification
):
    sp = f"/sources/{source_index}"
    qp = f"/qualifications/{qualification_index}"
    checks = []
    qref_path = f"{sp}/qualification_ref"
    qref = _field_value(source, "qualification_ref")
    qrecord_ref = _field_value(qualification, "ref")
    checks.append(
        _check(
            "qualification_ref",
            _ref_relation(qref, qrecord_ref),
            _read_path(raw, qref_path),
            _original(_read_path(raw, f"{qp}/ref")),
        )
    )
    subject = _field_value(qualification, "subject_ref")
    source_ref = _field_value(source, "ref")
    checks.append(
        _check(
            "qualification_subject",
            _ref_relation(subject, source_ref),
            _read_path(raw, f"{qp}/subject_ref"),
            _original(_read_path(raw, f"{sp}/ref")),
        )
    )
    content = _field_value(source, "content_bytes")
    for suffix, digest_value in (
        ("subject_sha256", _field_value(qualification, "subject_sha256")),
        ("subject_ref/sha256", _field_value(subject, "sha256")),
    ):
        relation = _digest_relation(source, digest_value, content)
        if relation != "not_applicable":
            checks.append(
                _check(
                    "qualification_digest",
                    relation,
                    _read_path(raw, f"{sp}/content_bytes"),
                    _original(_read_path(raw, f"{qp}/{suffix}")),
                )
            )
    source_owner = _field_value(source_ref, "owner")
    for suffix, owner in (
        ("owner", _field_value(qualification, "owner")),
        ("ref/owner", _field_value(qrecord_ref, "owner")),
    ):
        checks.append(
            _check(
                "qualification_owner",
                _relation(owner, source_owner),
                _read_path(raw, f"{qp}/{suffix}"),
                _original(_read_path(raw, f"{sp}/ref/owner")),
            )
        )
    source_scope = _field_value(source_ref, "scope")
    for suffix, scope in (
        ("scope", _field_value(qualification, "scope")),
        ("subject_ref/scope", _field_value(subject, "scope")),
    ):
        checks.append(
            _check(
                "qualification_scope",
                _relation(scope, source_scope),
                _read_path(raw, f"{qp}/{suffix}"),
                _original(_read_path(raw, f"{sp}/ref/scope")),
            )
        )
    return checks


def _root_checks(
    raw, source_index, qualification_index, root_index, source, qualification, root
):
    sp = f"/sources/{source_index}"
    qp = f"/qualifications/{qualification_index}"
    rp = f"/qualification_roots/{root_index}"
    root_ref = _field_value(qualification, "root_ref")
    checks = [
        _check(
            "qualification_root_ref",
            _ref_relation(root_ref, root),
            _read_path(raw, f"{qp}/root_ref"),
            _original(_read_path(raw, rp)),
        )
    ]
    source_ref = _field_value(source, "ref")
    for right_path, other_owner in (
        (f"{qp}/owner", _field_value(qualification, "owner")),
        (f"{sp}/ref/owner", _field_value(source_ref, "owner")),
    ):
        checks.append(
            _check(
                "root_owner",
                _relation(_field_value(root, "owner"), other_owner),
                _read_path(raw, f"{rp}/owner"),
                _original(_read_path(raw, right_path)),
            )
        )
    for field in ("identity", "revision", "scope", "owner"):
        checks.append(
            _check(
                "root_subject_revision_scope",
                _relation(_field_value(root_ref, field), _field_value(root, field)),
                _read_path(raw, f"{qp}/root_ref/{field}"),
                _original(_read_path(raw, f"{rp}/{field}")),
                f"/f05_detail_contract/source_observation_contract/checks/10/ordered_pairs/{len(checks) - 3}",
            )
        )
    checks.append(
        _check(
            "root_subject_revision_scope",
            _relation(
                _field_value(qualification, "scope"), _field_value(root, "scope")
            ),
            _read_path(raw, f"{qp}/scope"),
            _original(_read_path(raw, f"{rp}/scope")),
            "/f05_detail_contract/source_observation_contract/checks/10/ordered_pairs/4",
        )
    )
    return checks


def _unreached_read(pointer: str, raw: Any):
    return {
        "tag": "unreached",
        "requested": _location("validation_input", pointer),
        "reached": _location("validation_raw", ""),
        "reached_value": copy.deepcopy(raw),
    }


def _input_unobserved_cause(raw):
    rule = "/f05_detail_contract/validation_cause_diagnostic_contract/input_unobserved_pattern"
    left = _original(_read("validation_raw", raw, ""))
    right = _literal(
        "CoreApplicationInput",
        "/f05_detail_contract/validation_cause_diagnostic_contract/input_unobserved_pattern/right_literal",
    )
    return {
        "kind": "input_unobserved",
        "target": _location("validation_raw", ""),
        "left": left,
        "right": right,
        "rule_pointer": rule,
    }


def _shape_failure(raw, validation_input, issues):
    observations = {
        name: _unreached_read(f"/{member}", raw)
        for name, member in (
            ("sources_read", "sources"),
            ("qualifications_read", "qualifications"),
            ("roots_read", "qualification_roots"),
        )
    }
    return {
        "original_raw_input": copy.deepcopy(validation_input),
        "validated": {
            "input": None,
            "input_issues": issues,
            "unusable_source_refs": [],
        },
        "source_observations": {
            **observations,
            "source_occurrences": [],
            "causes": [_input_unobserved_cause(raw)],
        },
    }


def _lookup_cause(identifier: str, left: dict[str, Any], right: dict[str, Any]):
    pointer_index = {
        "source_qualification_ref_unformed": 0,
        "qualification_lookup_unresolved": 1,
        "qualification_root_ref_unformed": 2,
        "root_lookup_unresolved": 3,
    }[identifier]
    rule_pointer = f"/f05_detail_contract/validation_cause_diagnostic_contract/lookup_patterns/{pointer_index}"
    read = left["read"] if left["tag"] == "original" else left
    target = (
        read.get("requested")
        if read["tag"] in {"absent", "unreached"}
        else read["location"]
    )
    return {
        "kind": "source_unresolved",
        "target": copy.deepcopy(target),
        "left": copy.deepcopy(left),
        "right": copy.deepcopy(right),
        "rule_pointer": rule_pointer,
    }
