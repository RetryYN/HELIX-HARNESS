"""BRAIN032 fn0 validate_supply_input と共通入力・参照・資格検証ヘルパ。"""

from __future__ import annotations

import copy
import functools
import hashlib
import json
import math
from typing import Any


_INPUT_ARRAYS = (
    "required_descriptor_kinds",
    "sources",
    "qualification_roots",
    "qualifications",
    "meaning_comparisons",
    "section_fields",
    "values",
    "applicability_records",
    "relations",
    "oracle_bindings",
    "compatibility_records",
    "knowledge_records",
    "handoff_records",
    "claims",
    "candidates",
)
_BINDING_REFS = (
    "template_ref",
    "knowledge_ref",
    "requirement_ref",
    "oracle_ref",
    "pack_ref",
)
_APPROVED_KINDS = (
    "template identity",
    "version",
    "layer/pair",
    "applicability",
    "required input",
    "required section",
    "required field",
    "relation",
    "意味owner",
    "trace",
    "negative oracle",
    "measurement",
    "completion",
    "downstream kind",
    "supersession",
)
_SUPPLY_INPUT_MEMBERS = frozenset(
    (
        "binding",
        "required_descriptor_kinds",
        "sources",
        "qualification_roots",
        "qualifications",
        "descriptors",
        "meaning_comparisons",
        "section_fields",
        "values",
        "applicability_records",
        "relations",
        "oracle_bindings",
        "compatibility_records",
        "knowledge_records",
        "dependencies",
        "handoff_records",
        "claims",
        "candidates",
    )
)
_BACKFLOW_ID = "HELIXBRAIN-L6-032-N03-PATH"


def _unsupported(contract: str, branch: str, detail: str) -> NotImplementedError:
    error = NotImplementedError(
        f"{contract}/{branch}: {detail}; Backflow {_BACKFLOW_ID}"
    )
    error._n03_branch_tagged = True
    return error


def _tag_unsupported(contract: str):
    def decorate(function):
        @functools.wraps(function)
        def wrapped(*args, **kwargs):
            try:
                return function(*args, **kwargs)
            except NotImplementedError as exc:
                message = str(exc)
                if getattr(exc, "_n03_branch_tagged", False):
                    raise
                branch = (
                    message.partition(":")[0].strip().replace(" ", "_")
                    or "unsupported_branch"
                )
                raise _unsupported(contract, branch, message) from exc

        return wrapped

    return decorate


def _json_equal(left: Any, right: Any) -> bool:
    """JSON型を保った比較（Python bool/intの同値扱いを避ける）。"""
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


def _is_json_value(value: Any) -> bool:
    if value is None or isinstance(value, (str, bool, int)):
        return True
    if isinstance(value, float):
        return math.isfinite(value)
    if isinstance(value, list):
        return all(_is_json_value(item) for item in value)
    if isinstance(value, dict):
        return all(
            isinstance(key, str) and _is_json_value(item) for key, item in value.items()
        )
    return False


def _ref_shape_ok(value: Any) -> bool:
    fields = {"identity", "revision", "scope", "owner", "source_locator", "sha256"}
    if not isinstance(value, dict) or set(value) != fields:
        return False
    string_or_null = (str, type(None))
    return all(
        isinstance(value[key], string_or_null)
        for key in ("identity", "revision", "owner", "source_locator", "sha256")
    ) and _is_json_value(value["scope"])


def _binding_shape_ok(value: Any) -> bool:
    fields = {
        "template_ref",
        "knowledge_ref",
        "requirement_ref",
        "oracle_ref",
        "pack_ref",
        "pack_contract_version",
        "pack_artifact_version",
        "pack_dependency_versions",
        "version_target",
    }
    if not isinstance(value, dict) or set(value) != fields:
        return False
    for key in (
        "template_ref",
        "knowledge_ref",
        "requirement_ref",
        "oracle_ref",
        "pack_ref",
    ):
        if not _ref_shape_ok(value[key]):
            return False
    for key in ("pack_contract_version", "pack_artifact_version", "version_target"):
        if not isinstance(value[key], (str, type(None))):
            return False
    return isinstance(value["pack_dependency_versions"], list) and all(
        _ref_shape_ok(row) for row in value["pack_dependency_versions"]
    )


def _wire_ref_shape_ok(value: Any) -> bool:
    """fn0 wire decoder: L4 Ref members are optional; keep supplied presence raw."""
    if not isinstance(value, dict):
        return False
    fields = {"identity", "revision", "scope", "owner", "source_locator", "sha256"}
    if not set(value) <= fields:
        return False
    for key in ("identity", "revision", "owner", "source_locator", "sha256"):
        if key in value and value[key] is not None and not isinstance(value[key], str):
            return False
    return "scope" not in value or _is_json_value(value["scope"])


def _wire_binding_shape_ok(value: Any) -> bool:
    """fn0-only optional-member wire shape; strict downstream readers stay unchanged."""
    if not isinstance(value, dict):
        return False
    ref_fields = {
        "template_ref",
        "knowledge_ref",
        "requirement_ref",
        "oracle_ref",
        "pack_ref",
    }
    scalar_fields = {"pack_contract_version", "pack_artifact_version", "version_target"}
    fields = ref_fields | scalar_fields | {"pack_dependency_versions"}
    if not set(value) <= fields:
        return False
    if any(key in value and not _wire_ref_shape_ok(value[key]) for key in ref_fields):
        return False
    if any(
        key in value and value[key] is not None and not isinstance(value[key], str)
        for key in scalar_fields
    ):
        return False
    if "pack_dependency_versions" in value and (
        not isinstance(value["pack_dependency_versions"], list)
        or any(not _wire_ref_shape_ok(ref) for ref in value["pack_dependency_versions"])
    ):
        return False
    return True


def _source_shape_ok(source: Any) -> bool:
    return (
        isinstance(source, dict)
        and set(source)
        == {"ref", "content", "content_bytes", "qualification_ref", "role"}
        and _ref_shape_ok(source.get("ref"))
        and isinstance(source.get("content_bytes"), str)
        and (
            source.get("qualification_ref") is None
            or _ref_shape_ok(source.get("qualification_ref"))
        )
        and isinstance(source.get("role"), str)
        and source["role"]
        in {"semantic_json", "derived_view", "explanation", "reference_only"}
    )


def _qualification_shape_ok(qualification: Any) -> bool:
    return (
        isinstance(qualification, dict)
        and set(qualification)
        == {
            "ref",
            "subject_ref",
            "subject_sha256",
            "applicable_scope",
            "qualification_body",
            "root_ref",
        }
        and _ref_shape_ok(qualification.get("ref"))
        and _ref_shape_ok(qualification.get("subject_ref"))
        and isinstance(qualification.get("subject_sha256"), (str, type(None)))
        and _ref_shape_ok(qualification.get("root_ref"))
    )


def _auxiliary_array_record_issue(raw: dict[str, Any]) -> tuple[str, int] | None:
    """Decode only the supplied logical record shapes; leave their meanings untouched."""
    typed_members = {
        "candidates": "Ref[]",
        "oracle_bindings": "OracleBinding",
        "compatibility_records": "CompatibilityRecord",
        "handoff_records": "HandoffRecord",
    }
    for member, record_kind in typed_members.items():
        if member not in raw:
            continue
        rows = raw[member]
        if not isinstance(rows, list):
            return member, -1
        for index, row in enumerate(rows):
            if record_kind == "Ref[]":
                valid = _ref_shape_ok(row)
            elif record_kind == "OracleBinding":
                keys = {
                    "ref",
                    "subject_ref",
                    "obligation_ref",
                    "oracle_ref",
                    "viewpoint",
                    "evidence_refs",
                    "source_ref",
                }
                valid = (
                    isinstance(row, dict)
                    and set(row) == keys
                    and all(
                        _ref_shape_ok(row[key])
                        for key in ("ref", "subject_ref", "obligation_ref")
                    )
                    and (row["oracle_ref"] is None or _ref_shape_ok(row["oracle_ref"]))
                    and _is_json_value(row["viewpoint"])
                    and isinstance(row["evidence_refs"], list)
                    and all(_ref_shape_ok(ref) for ref in row["evidence_refs"])
                    and (row["source_ref"] is None or _ref_shape_ok(row["source_ref"]))
                )
            elif record_kind == "CompatibilityRecord":
                keys = {
                    "ref",
                    "left_ref",
                    "right_ref",
                    "source_ref",
                    "compatible",
                    "reason",
                }
                valid = (
                    isinstance(row, dict)
                    and set(row) == keys
                    and _ref_shape_ok(row["ref"])
                    and _ref_shape_ok(row["left_ref"])
                    and _ref_shape_ok(row["right_ref"])
                    and (row["source_ref"] is None or _ref_shape_ok(row["source_ref"]))
                    and (
                        row["compatible"] is None or isinstance(row["compatible"], bool)
                    )
                    and (row["reason"] is None or isinstance(row["reason"], str))
                )
            else:
                keys = {"subject_ref", "binding", "state", "source_ref", "reason"}
                valid = (
                    isinstance(row, dict)
                    and set(row) == keys
                    and _ref_shape_ok(row["subject_ref"])
                    and _binding_shape_ok(row["binding"])
                    and isinstance(row["state"], str)
                    and row["state"]
                    in {
                        "not_requested",
                        "not_received",
                        "received",
                        "unknown",
                        "conflict",
                    }
                    and (row["source_ref"] is None or _ref_shape_ok(row["source_ref"]))
                    and (row["reason"] is None or isinstance(row["reason"], str))
                )
            if not valid:
                return member, index
    return None


def _ref_same(left: Any, right: Any) -> bool:
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    for key in ("identity", "revision", "scope", "owner"):
        if (
            key not in left
            or key not in right
            or left[key] is None
            or right[key] is None
        ):
            return False
        if not _json_equal(left[key], right[key]):
            return False
    left_sha, right_sha = left.get("sha256"), right.get("sha256")
    return left_sha is None or right_sha is None or _json_equal(left_sha, right_sha)


def _ref_identity_same(left: Any, right: Any) -> bool:
    """Digestを含めずsource出現候補を特定し、digestはその後に直接比較する。"""
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    return all(
        key in left
        and key in right
        and left[key] is not None
        and right[key] is not None
        and _json_equal(left[key], right[key])
        for key in ("identity", "revision", "scope", "owner")
    )


def _binding_same(left: Any, right: Any) -> bool:
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    if not all(_ref_same(left.get(key), right.get(key)) for key in _BINDING_REFS):
        return False
    for key in ("pack_contract_version", "pack_artifact_version", "version_target"):
        if (
            key not in left
            or key not in right
            or not _json_equal(left[key], right[key])
        ):
            return False
    a, b = left.get("pack_dependency_versions"), right.get("pack_dependency_versions")
    return (
        isinstance(a, list)
        and isinstance(b, list)
        and all(any(_ref_same(x, y) for y in b) for x in a)
        and all(any(_ref_same(y, x) for x in a) for y in b)
    )


def _ordered(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def _reject_non_json_constant(value: str) -> None:
    raise ValueError(f"non-JSON numeric constant: {value}")


def _unique_object_pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON object member: {key}")
        result[key] = value
    return result


def _copy_refs_in_source_order(refs: list[Any]) -> list[dict[str, Any]]:
    """L5のoriginal_ref_columns: 元Refのみを元順/反復のまま保つ。"""
    if any(not isinstance(ref, dict) for ref in refs):
        raise NotImplementedError(
            "non-Ref original reference: Backflow HELIXBRAIN-L6-032-N03-PATH"
        )
    return copy.deepcopy(refs)


def _input_issue(locator: str, reason: str, source_ref: Any = None) -> dict[str, Any]:
    return {
        "locator": locator,
        "reason": reason,
        "source_ref": copy.deepcopy(source_ref)
        if isinstance(source_ref, dict)
        else None,
    }


def _qualification_same(left: Any, right: Any) -> bool:
    """Compare Qualification values with L5 Ref identity semantics."""
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    if left.keys() != right.keys():
        return False
    ref_fields = {"ref", "subject_ref", "root_ref"}
    return all(
        (
            _ref_same(left[key], right[key])
            if key in ref_fields
            else _json_equal(left[key], right[key])
        )
        for key in left
    )


def _source_qualification_check(
    raw: dict[str, Any], source: Any
) -> tuple[bool, dict[str, Any] | None]:
    if not isinstance(source, dict):
        return False, None
    source_ref = source["ref"]
    content_bytes = source["content_bytes"]
    if not isinstance(content_bytes, str) or not isinstance(
        source_ref.get("sha256"), str
    ):
        return False, None
    try:
        encoded = content_bytes.encode("utf-8", errors="strict")
    except UnicodeEncodeError:
        return False, None
    digest = hashlib.sha256(encoded).hexdigest()
    if digest != source_ref["sha256"]:
        return False, None
    try:
        decoded = json.loads(
            content_bytes,
            object_pairs_hook=_unique_object_pairs,
            parse_constant=_reject_non_json_constant,
        )
    except (json.JSONDecodeError, UnicodeDecodeError, ValueError):
        return False, None
    if not _is_json_value(decoded) or not _json_equal(decoded, source["content"]):
        return False, None

    qualification_ref = source["qualification_ref"]
    if not isinstance(qualification_ref, dict):
        return False, None
    qualifications = raw.get("qualifications")
    roots = raw.get("qualification_roots")
    if not isinstance(qualifications, list) or not isinstance(roots, list):
        return False, None
    matches = [
        (index, row)
        for index, row in enumerate(qualifications)
        if isinstance(row, dict) and _ref_same(row.get("ref"), qualification_ref)
    ]
    if not matches:
        return False, None
    # Preserve every supplied occurrence, but compare embedded Refs by identity rather
    # than location. Other Qualification fields still have to agree exactly.
    first = matches[0][1]
    if any(not _qualification_same(row, first) for _, row in matches[1:]):
        return False, None
    for qualification_index, qualification in matches:
        root_ref = qualification.get("root_ref")
        root_matches = [
            root for root in roots if _ref_shape_ok(root) and _ref_same(root, root_ref)
        ]
        if not root_matches:
            return False, None
        subject_sha = qualification.get("subject_sha256")
        if not (
            _ref_same(qualification.get("subject_ref"), source_ref)
            and subject_sha == digest
        ):
            return False, None
        if not _json_equal(
            qualification.get("applicable_scope"), source_ref.get("scope")
        ):
            return False, _input_issue(
                f"/qualifications/{qualification_index}/applicable_scope",
                "原資格の適用scopeが当該sourceのscopeに対応しない。",
                source_ref,
            )
        # qualification_body is opaque here; no trust resolver is implied.
        if "qualification_body" not in qualification:
            return False, None
    return True, None


def _source_qualification_ok(raw: dict[str, Any], source: Any) -> bool:
    """Compatibility predicate retained for existing same-unit consumers."""
    return _source_qualification_check(raw, source)[0]


def validate_supply_input(raw: object) -> dict[str, object]:
    """JSON objectを保持し、固定N03経路に必要なbytes/qualificationを照合する。"""
    if not isinstance(raw, dict):
        return {
            "input": None,
            "input_issues": [_input_issue("", "SupplyInput root must be an object.")],
            "unusable_source_refs": [],
        }
    if not _is_json_value(raw):
        return {
            "input": None,
            "input_issues": [
                _input_issue(
                    "", "SupplyInput contains a non-JSON value or non-finite number."
                )
            ],
            "unusable_source_refs": [],
        }
    unknown = [key for key in raw if key not in _SUPPLY_INPUT_MEMBERS]
    if unknown:
        return {
            "input": None,
            "input_issues": [
                _input_issue(
                    "/" + unknown[0],
                    "SupplyInput member is outside the declared input shape.",
                )
            ],
            "unusable_source_refs": [],
        }
    bad_arrays = [
        key for key in _INPUT_ARRAYS if key in raw and not isinstance(raw[key], list)
    ]
    if (
        bad_arrays
        or (
            "descriptors" in raw
            and raw["descriptors"] is not None
            and not isinstance(raw["descriptors"], list)
        )
        or ("binding" in raw and not _wire_binding_shape_ok(raw["binding"]))
        or ("dependencies" in raw and not isinstance(raw["dependencies"], dict))
    ):
        field = (
            bad_arrays[0]
            if bad_arrays
            else next(
                key
                for key in ("descriptors", "binding", "dependencies")
                if key in raw
                and (
                    (
                        key == "descriptors"
                        and raw[key] is not None
                        and not isinstance(raw[key], list)
                    )
                    or (key == "binding" and not _wire_binding_shape_ok(raw[key]))
                    or (key == "dependencies" and not isinstance(raw[key], dict))
                )
            )
        )
        return {
            "input": None,
            "input_issues": [
                _input_issue(
                    "/" + field, "SupplyInput member has an invalid container shape."
                )
            ],
            "unusable_source_refs": [],
        }

    malformed_auxiliary = _auxiliary_array_record_issue(raw)
    if malformed_auxiliary is not None:
        member, index = malformed_auxiliary
        locator = f"/{member}" if index < 0 else f"/{member}/{index}"
        return {
            "input": None,
            "input_issues": [
                _input_issue(
                    locator, "SupplyInput record has an unsupported typed shape."
                )
            ],
            "unusable_source_refs": [],
        }

    for member, checker in (
        ("sources", _source_shape_ok),
        ("qualifications", _qualification_shape_ok),
        ("qualification_roots", _ref_shape_ok),
    ):
        rows = raw[member] if member in raw else None
        if rows is not None:
            if not isinstance(rows, list):
                continue  # The array-container diagnostic above handles this.
            malformed = next(
                (index for index, row in enumerate(rows) if not checker(row)), None
            )
            if malformed is not None:
                return {
                    "input": None,
                    "input_issues": [
                        _input_issue(
                            f"/{member}/{malformed}",
                            "SupplyInput record has an invalid closed shape.",
                        )
                    ],
                    "unusable_source_refs": [],
                }

    snapshot = copy.deepcopy(raw)
    unusable: list[dict[str, Any]] = []
    issues: list[dict[str, Any]] = []
    if "sources" in snapshot:
        for index, source in enumerate(snapshot["sources"]):
            source_ok, specific_issue = _source_qualification_check(snapshot, source)
            if not source_ok:
                ref = source["ref"] if isinstance(source, dict) else None
                if isinstance(ref, dict):
                    unusable.append(copy.deepcopy(ref))
                issues.append(
                    specific_issue
                    or _input_issue(
                        f"/sources/{index}",
                        "source bytes/body/digest or independent qualification is unresolved.",
                        ref,
                    )
                )
    return {"input": snapshot, "input_issues": issues, "unusable_source_refs": unusable}


def _source_usable(validated: dict[str, Any], source_ref: Any) -> bool:
    raw = validated.get("input")
    if not isinstance(raw, dict) or not isinstance(source_ref, dict):
        return False
    unusable_source_refs = validated.get("unusable_source_refs")
    if not isinstance(unusable_source_refs, list):
        return False
    if any(_ref_same(bad, source_ref) for bad in unusable_source_refs):
        return False
    sources = raw.get("sources")
    if not isinstance(sources, list):
        return False
    return any(
        isinstance(source, dict)
        and source.get("role") == "semantic_json"
        and _ref_same(source.get("ref"), source_ref)
        for source in sources
    )


def _owner_body_equal(left: Any, right: Any) -> bool:
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    left_body = {key: value for key, value in left.items() if key != "source_ref"}
    right_body = {key: value for key, value in right.items() if key != "source_ref"}
    return _json_equal(left_body, right_body)


def _comparison(
    axes: list[dict[str, Any]],
    findings: list[dict[str, Any]],
    producer: str,
    binding: Any,
) -> dict[str, Any]:
    return {
        "axes": axes,
        "findings": findings,
        "producer_symbol": producer,
        "input_binding": copy.deepcopy(binding) if isinstance(binding, dict) else None,
    }


def _presence(value: Any = None, *, present: bool) -> dict[str, Any]:
    return (
        {"presence": "supplied", "value": copy.deepcopy(value)}
        if present
        else {"presence": "absent"}
    )
