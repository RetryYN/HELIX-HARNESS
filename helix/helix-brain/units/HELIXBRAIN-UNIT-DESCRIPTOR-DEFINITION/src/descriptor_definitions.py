"""BRAIN032の局所入力検証と同snapshot比較。"""

from __future__ import annotations

import copy
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
_SUPPLY_INPUT_MEMBERS = frozenset((
    "binding", "required_descriptor_kinds", "sources", "qualification_roots",
    "qualifications", "descriptors", "meaning_comparisons", "section_fields",
    "values", "applicability_records", "relations", "oracle_bindings",
    "compatibility_records", "knowledge_records", "dependencies", "handoff_records",
    "claims", "candidates",
))
_ARRAY_MEMBERS = _INPUT_ARRAYS
_F03_AXIS_MEMBERS = (
    "subject_ref", "binding", "axis", "state", "original_refs", "reason", "backflow_owner",
)
_F03_FINDING_MEMBERS = (
    "code", "rule_ref", "subject_ref", "binding", "axis", "state", "source_refs",
    "reason", "backflow_owner",
)


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
        return all(isinstance(key, str) and _is_json_value(item) for key, item in value.items())
    return False


def _ref_shape_ok(value: Any) -> bool:
    fields = {"identity", "revision", "scope", "owner", "source_locator", "sha256"}
    if not isinstance(value, dict) or set(value) != fields:
        return False
    string_or_null = (str, type(None))
    return (
        all(key not in value or isinstance(value[key], string_or_null) for key in ("identity", "revision", "owner", "source_locator", "sha256"))
        and ("scope" not in value or _is_json_value(value["scope"]))
    )


def _binding_shape_ok(value: Any) -> bool:
    fields = {
        "template_ref", "knowledge_ref", "requirement_ref", "oracle_ref", "pack_ref",
        "pack_contract_version", "pack_artifact_version", "pack_dependency_versions", "version_target",
    }
    if not isinstance(value, dict) or set(value) != fields:
        return False
    for key in ("template_ref", "knowledge_ref", "requirement_ref", "oracle_ref", "pack_ref"):
        if key in value and not _ref_shape_ok(value[key]):
            return False
    for key in ("pack_contract_version", "pack_artifact_version", "version_target"):
        if key in value and not isinstance(value[key], (str, type(None))):
            return False
    return "pack_dependency_versions" not in value or (
        isinstance(value["pack_dependency_versions"], list)
        and all(_ref_shape_ok(row) for row in value["pack_dependency_versions"])
    )


def _source_shape_ok(source: Any) -> bool:
    return (
        isinstance(source, dict)
        and set(source) == {"ref", "content", "content_bytes", "qualification_ref", "role"}
        and _ref_shape_ok(source.get("ref"))
        and isinstance(source.get("content_bytes"), str)
        and (source.get("qualification_ref") is None or _ref_shape_ok(source.get("qualification_ref")))
        and source.get("role") in {"semantic_json", "derived_view", "explanation", "reference_only"}
    )


def _qualification_shape_ok(qualification: Any) -> bool:
    return (
        isinstance(qualification, dict)
        and set(qualification) == {"ref", "subject_ref", "subject_sha256", "applicable_scope", "qualification_body", "root_ref"}
        and _ref_shape_ok(qualification.get("ref"))
        and _ref_shape_ok(qualification.get("subject_ref"))
        and isinstance(qualification.get("subject_sha256"), (str, type(None)))
        and _ref_shape_ok(qualification.get("root_ref"))
    )


def _ref_same(left: Any, right: Any) -> bool:
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    for key in ("identity", "revision", "scope", "owner"):
        if key not in left or key not in right or left[key] is None or right[key] is None:
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
        key in left and key in right
        and left[key] is not None and right[key] is not None
        and _json_equal(left[key], right[key])
        for key in ("identity", "revision", "scope", "owner")
    )


def _binding_same(left: Any, right: Any) -> bool:
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    if not all(_ref_same(left.get(key), right.get(key)) for key in _BINDING_REFS):
        return False
    for key in ("pack_contract_version", "pack_artifact_version", "version_target"):
        if key not in left or key not in right or not _json_equal(left[key], right[key]):
            return False
    a, b = left.get("pack_dependency_versions"), right.get("pack_dependency_versions")
    return isinstance(a, list) and isinstance(b, list) and all(
        any(_ref_same(x, y) for y in b) for x in a
    ) and all(any(_ref_same(y, x) for x in a) for y in b)


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
        raise NotImplementedError("non-Ref original reference: Backflow HELIXBRAIN-L6-032-N03-PATH")
    return copy.deepcopy(refs)


def _input_issue(locator: str, reason: str, source_ref: Any = None) -> dict[str, Any]:
    return {
        "locator": locator,
        "reason": reason,
        "source_ref": copy.deepcopy(source_ref) if isinstance(source_ref, dict) else None,
    }


def _source_qualification_ok(raw: dict[str, Any], source: Any) -> bool:
    if (
        not isinstance(source, dict)
        or set(source) != {"ref", "content", "content_bytes", "qualification_ref", "role"}
        or not isinstance(source.get("ref"), dict)
        or not _ref_shape_ok(source.get("ref"))
        or not isinstance(source.get("content_bytes"), str)
        or (source.get("qualification_ref") is not None and not _ref_shape_ok(source.get("qualification_ref")))
        or source.get("role") not in {"semantic_json", "derived_view", "explanation", "reference_only"}
    ):
        return False
    source_ref = source["ref"]
    content_bytes = source.get("content_bytes")
    if not isinstance(content_bytes, str) or not isinstance(source_ref.get("sha256"), str):
        return False
    try:
        encoded = content_bytes.encode("utf-8", errors="strict")
    except UnicodeEncodeError:
        return False
    digest = hashlib.sha256(encoded).hexdigest()
    if digest != source_ref["sha256"]:
        return False
    try:
        decoded = json.loads(
            content_bytes,
            object_pairs_hook=_unique_object_pairs,
            parse_constant=_reject_non_json_constant,
        )
    except (json.JSONDecodeError, UnicodeDecodeError, ValueError):
        return False
    if not _is_json_value(decoded) or not _json_equal(decoded, source.get("content")):
        return False

    qualification_ref = source.get("qualification_ref")
    if not isinstance(qualification_ref, dict):
        return False
    qualifications = raw.get("qualifications")
    roots = raw.get("qualification_roots")
    if not isinstance(qualifications, list) or not isinstance(roots, list):
        return False
    matches = [
        row for row in qualifications
        if isinstance(row, dict) and _ref_same(row.get("ref"), qualification_ref)
    ]
    if len(matches) != 1:
        return False
    qualification = matches[0]
    if (
        set(qualification) != {"ref", "subject_ref", "subject_sha256", "applicable_scope", "qualification_body", "root_ref"}
        or not _ref_shape_ok(qualification.get("ref"))
        or not _ref_shape_ok(qualification.get("subject_ref"))
        or not isinstance(qualification.get("subject_sha256"), (str, type(None)))
        or not _ref_shape_ok(qualification.get("root_ref"))
    ):
        return False
    root_ref = qualification.get("root_ref")
    root_matches = [root for root in roots if _ref_shape_ok(root) and _ref_same(root, root_ref)]
    if not root_matches:
        return False
    subject_sha = qualification.get("subject_sha256")
    return (
        _ref_same(qualification.get("subject_ref"), source_ref)
        and subject_sha == digest
        and _json_equal(qualification.get("applicable_scope"), source_ref.get("scope"))
        # qualification_body is opaque here.  The local L6 slice does not
        # implement a trust/custody resolver for its contents.
        and "qualification_body" in qualification
    )


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
            "input_issues": [_input_issue("", "SupplyInput contains a non-JSON value or non-finite number.")],
            "unusable_source_refs": [],
        }
    unknown = [key for key in raw if key not in _SUPPLY_INPUT_MEMBERS]
    if unknown:
        return {
            "input": None,
            "input_issues": [_input_issue("/" + unknown[0], "SupplyInput member is outside the declared input shape.")],
            "unusable_source_refs": [],
        }
    bad_arrays = [key for key in _ARRAY_MEMBERS if key in raw and not isinstance(raw.get(key), list)]
    if (
        bad_arrays
        or ("descriptors" in raw and raw["descriptors"] is not None and not isinstance(raw["descriptors"], list))
        or ("binding" in raw and not _binding_shape_ok(raw["binding"]))
        or ("dependencies" in raw and not isinstance(raw["dependencies"], dict))
    ):
        field = bad_arrays[0] if bad_arrays else next(
            key for key in ("descriptors", "binding", "dependencies")
            if key in raw and (
                (key == "descriptors" and raw[key] is not None and not isinstance(raw[key], list))
                or (key == "binding" and not _binding_shape_ok(raw[key]))
                or (key == "dependencies" and not isinstance(raw[key], dict))
            )
        )
        return {
            "input": None,
            "input_issues": [_input_issue("/" + field, "SupplyInput member has an invalid container shape.")],
            "unusable_source_refs": [],
        }

    for member, checker in (
        ("sources", _source_shape_ok),
        ("qualifications", _qualification_shape_ok),
        ("qualification_roots", _ref_shape_ok),
    ):
        rows = raw.get(member)
        if rows is not None:
            if not isinstance(rows, list):
                continue  # The array-container diagnostic above handles this.
            malformed = next((index for index, row in enumerate(rows) if not checker(row)), None)
            if malformed is not None:
                return {
                    "input": None,
                    "input_issues": [_input_issue(f"/{member}/{malformed}", "SupplyInput record has an invalid closed shape.")],
                    "unusable_source_refs": [],
                }

    snapshot = copy.deepcopy(raw)
    unusable: list[dict[str, Any]] = []
    issues: list[dict[str, Any]] = []
    for index, source in enumerate(snapshot.get("sources", [])):
        if not _source_qualification_ok(snapshot, source):
            ref = source.get("ref") if isinstance(source, dict) else None
            if isinstance(ref, dict):
                unusable.append(copy.deepcopy(ref))
            issues.append(_input_issue(f"/sources/{index}", "source bytes/body/digest or independent qualification is unresolved.", ref))
    return {"input": snapshot, "input_issues": issues, "unusable_source_refs": unusable}


def _source_usable(validated: dict[str, Any], source_ref: Any) -> bool:
    raw = validated.get("input")
    if not isinstance(raw, dict) or not isinstance(source_ref, dict):
        return False
    if any(_ref_same(bad, source_ref) for bad in validated.get("unusable_source_refs", [])):
        return False
    return any(
        isinstance(source, dict)
        and source.get("role") == "semantic_json"
        and _ref_same(source.get("ref"), source_ref)
        for source in raw.get("sources", [])
    )


def _owner_body_equal(left: Any, right: Any) -> bool:
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    left_body = {key: value for key, value in left.items() if key != "source_ref"}
    right_body = {key: value for key, value in right.items() if key != "source_ref"}
    return _json_equal(left_body, right_body)


def _attribution_axis(validated: dict[str, Any], slot: dict[str, Any], fact: dict[str, Any]) -> dict[str, Any]:
    raw = validated["input"]
    refs = _copy_refs_in_source_order([fact["source_ref"]] if isinstance(fact.get("source_ref"), dict) else [])
    binding = slot.get("binding")
    knowledge_ref = binding.get("knowledge_ref") if isinstance(binding, dict) else None
    backflow = knowledge_ref.get("owner") if isinstance(knowledge_ref, dict) else None
    state = "unknown"
    reason = "caller factをqualified semantic_json sourceのowner原factへ結べない。"
    matches: list[str] = []
    unresolved_kind = False
    if _source_usable(validated, fact.get("source_ref")):
        for source in raw.get("sources", []):
            if not isinstance(source, dict) or source.get("role") != "semantic_json":
                continue
            if not _ref_same(source.get("ref"), fact.get("source_ref")):
                continue
            content = source.get("content")
            if not isinstance(content, dict) or not _binding_same(content.get("binding"), binding):
                continue
            groups = content.get("descriptor_facts", [])
            if not isinstance(groups, list):
                raise NotImplementedError("descriptor_facts null/type branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
            for group in groups:
                if not isinstance(group, dict) or group.get("slot_identity") != slot.get("slot_identity"):
                    continue
                original_facts = group.get("facts", [])
                if not isinstance(original_facts, list):
                    raise NotImplementedError("descriptor_facts[].facts null/type branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
                for original in original_facts:
                    if (
                        isinstance(original, dict)
                        and _ref_same(original.get("ref"), fact.get("ref"))
                        and _owner_body_equal(original, fact)
                        and _binding_same(original.get("binding"), binding)
                    ):
                        kind = group.get("descriptor_kind")
                        if isinstance(kind, str) and kind in _APPROVED_KINDS:
                            matches.append(kind)
                        else:
                            unresolved_kind = True
        distinct_kinds = set(matches)
        if unresolved_kind:
            reason = "owner原groupのdescriptor_kindが未供給又は固定15 kind外。"
        elif distinct_kinds == {slot.get("descriptor_kind")}:
            state = "known"
            backflow = None
            reason = "owner source内の同一slot・full Binding・fact Ref/body・固定kindが一致する。帰属一致は意味完成を示さない。"
        elif distinct_kinds:
            state = "conflict"
            reason = "同一owner identity/binding/factにcaller kindと異なる既知kindが明示される。"
        else:
            reason = "sourceは資格照合済みだがowner原factまたはslot kindの完全対応が未解決。"
    return {
        "subject_ref": copy.deepcopy(fact.get("ref")),
        "binding": copy.deepcopy(binding),
        "axis": "descriptor.attribution",
        "state": state,
        "original_refs": refs,
        "reason": reason,
        "backflow_owner": backflow,
    }


def _meaning_resolution(validated: dict[str, Any], slot: dict[str, Any], fact: dict[str, Any]) -> tuple[str, list[Any], str]:
    """同一fact→KnowledgeRecord provenance→実sourceを直接解決する。"""
    raw = validated["input"]
    binding = slot.get("binding")
    refs: list[Any] = [fact.get("source_ref"), fact.get("ref")]
    source_ref = fact.get("source_ref")
    if "meaning" not in fact:
        raise NotImplementedError("meaning RawValue absent branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    if fact.get("meaning") is None:
        raise NotImplementedError("meaning null/undefined branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    if not isinstance(source_ref, dict):
        return "source_unresolved", refs, "当該MeaningFactの原source Refが未供給のためsource_unresolved。"

    source_rows = [
        (index, source) for index, source in enumerate(raw.get("sources", []))
        if isinstance(source, dict) and _ref_same(source.get("ref"), source_ref)
    ]
    usable_sources = [
        (index, source) for index, source in source_rows
        if _source_usable(validated, source_ref) and source.get("role") == "semantic_json"
    ]
    if not usable_sources:
        refs.extend(source.get("ref") for _, source in source_rows)
        return "source_unresolved", refs, "当該MeaningFactのsourceは同snapshotでqualified semantic_json sourceへ解決できない。"

    knowledge_ref = binding.get("knowledge_ref") if isinstance(binding, dict) else None
    records = [
        record for record in raw.get("knowledge_records", [])
        if isinstance(record, dict) and _ref_same(record.get("ref"), knowledge_ref)
    ]
    if not records:
        return "source_unresolved", refs, "同じBindingの原KnowledgeRecordが未供給のためprovenanceを解決できない。"

    saw_matching_provenance = False
    for record in records:
        provenance = record.get("provenance_refs")
        if not isinstance(provenance, list):
            raise NotImplementedError("KnowledgeRecord provenance shape: Backflow HELIXBRAIN-L6-032-N03-PATH")
        for provenance_ref in provenance:
            if not _ref_identity_same(provenance_ref, source_ref):
                continue
            saw_matching_provenance = True
            refs.append(provenance_ref)
            direct_sources = [
                (index, source) for index, source in enumerate(raw.get("sources", []))
                if isinstance(source, dict) and _ref_identity_same(source.get("ref"), provenance_ref)
            ]
            for index, source in direct_sources:
                actual_ref = source.get("ref")
                refs.append(actual_ref)
                expected_digest = provenance_ref.get("sha256")
                actual_digest = actual_ref.get("sha256") if isinstance(actual_ref, dict) else None
                if expected_digest is not None and actual_digest is not None and expected_digest != actual_digest:
                    return (
                        "source_unresolved", refs,
                        f"KnowledgeRecord provenance digestと実source digestが一致しない（source index {index}）。",
                    )
                if not _ref_same(provenance_ref, actual_ref) or not _source_usable(validated, actual_ref):
                    continue
                content = source.get("content")
                if not isinstance(content, dict) or "definition_meaning_operations" not in content:
                    return "container_absent", refs, "資格済み原sourceにdefinition_meaning_operations carrierが未供給。"
                operations = content.get("definition_meaning_operations")
                if not isinstance(operations, list):
                    raise NotImplementedError("definition_meaning_operations null/type branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
                raise NotImplementedError("typed definition meaning operation success path is outside HELIXBRAIN-L6-032-N03-PATH")
    if not saw_matching_provenance:
        return "source_unresolved", refs, "同じBindingのKnowledgeRecordに当該原source provenanceが無い。"
    return "source_unresolved", refs, "原provenanceからqualified sourceへの直接対応が未成立。"


def _unknown_axis(subject: Any, binding: Any, axis: str, refs: list[Any], reason: str, owner: Any) -> dict[str, Any]:
    return {
        "subject_ref": copy.deepcopy(subject),
        "binding": copy.deepcopy(binding),
        "axis": axis,
        "state": "unknown",
        "original_refs": _copy_refs_in_source_order([ref for ref in refs if ref is not None]),
        "reason": reason,
        "backflow_owner": owner if isinstance(owner, str) else None,
    }


def _comparison(axes: list[dict[str, Any]], findings: list[dict[str, Any]], producer: str, binding: Any) -> dict[str, Any]:
    return {
        "axes": axes,
        "findings": findings,
        "producer_symbol": producer,
        "input_binding": copy.deepcopy(binding) if isinstance(binding, dict) else None,
    }


_F03_PROBLEM_REASONS = {
    "container_absent": "owner原sourceにdescriptor_targets memberが供給されていない。targetを生成しない。",
    "field_owner_not_found": "当該原fieldに対応する独立ownerのsection_field_recordsを取得できない。",
    "lookup_unresolved": "原requestに対応するroot又はowner source recordを解決できない。",
    "field_owner_unresolved": "同field/subject/full Binding/bodyの独立owner宣言を取得できない。",
    "frame_differs": "原subject又はfull Bindingが当該requestと既知に異なる。",
    "null_or_type": "原request又はcontainerのnull又は型外を保持する。",
}
_F03_BRANCH_REASONS = {
    "definition_unknown": "同原fieldの選択factに対応する元意味判定を取得できない。",
    "value_unknown": "原案件値はunknownである。元理由とknowledge版を保持する。",
    "applicability_unknown": "原field適用判断はunknownであり非適用へ変換しない。",
    "field_unknown": "field固有の適用判断は未決である。",
}


def _presence(value: Any = None, *, present: bool) -> dict[str, Any]:
    return {"presence": "supplied", "value": copy.deepcopy(value)} if present else {"presence": "absent"}


def _record_problem(
    cause: str,
    locator: str,
    original_value: dict[str, Any],
    source_ref: Any = None,
    source_index: int | None = None,
) -> dict[str, Any]:
    reason = _F03_PROBLEM_REASONS.get(cause)
    if reason is None:
        raise NotImplementedError("F03Problem cause outside fixed absence branches: Backflow HELIXBRAIN-L6-032-N03-PATH")
    return {
        "cause": cause,
        "locator": locator,
        "original_value": copy.deepcopy(original_value),
        "source_ref": _presence(source_ref, present=isinstance(source_ref, dict)),
        "source_index": source_index,
        "relevance": "target",
        "reason": reason,
    }


def _f03_request(kind: str, field_locator: str, subject_ref: Any, binding: Any, request_locator: str, requested_ref: Any) -> dict[str, Any]:
    return {
        "kind": kind,
        "field_locator": field_locator,
        "subject_ref": _presence(subject_ref, present=subject_ref is not None),
        "binding": _presence(binding, present=binding is not None),
        "request_locator": request_locator,
        "requested_ref": _presence(requested_ref, present=requested_ref is not None),
    }


def _root_occurrences(raw: dict[str, Any], collection: str, requested_ref: Any) -> list[dict[str, Any]]:
    occurrences = []
    rows = raw.get(collection, [])
    if not isinstance(rows, list):
        raise NotImplementedError(f"{collection} shape branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    if any(not isinstance(row, dict) for row in rows):
        raise NotImplementedError(f"{collection} record decode branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    for index, row in enumerate(rows):
        if _ref_same(row.get("ref"), requested_ref):
            occurrences.append({
                "index": index,
                "locator": f"/{collection}/{index}",
                "original_value": copy.deepcopy(row),
            })
    return occurrences


def _matching_semantic_sources(validated: dict[str, Any], binding: Any, source_ref: Any = None) -> list[tuple[int, dict[str, Any]]]:
    raw = validated.get("input")
    if not isinstance(raw, dict):
        raise NotImplementedError("semantic source selection requires the same ValidatedSupply: Backflow HELIXBRAIN-L6-032-N03-PATH")
    matches = []
    sources = raw.get("sources", [])
    if not isinstance(sources, list):
        raise NotImplementedError("sources shape branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    for index, source in enumerate(sources):
        if not isinstance(source, dict) or source.get("role") != "semantic_json":
            continue
        content = source.get("content")
        if not isinstance(content, dict):
            continue
        if source_ref is not None:
            if not _ref_same(source.get("ref"), source_ref):
                continue
        elif not _binding_same(content.get("binding"), binding):
            continue
        if not _source_usable(validated, source.get("ref")):
            raise NotImplementedError(
                f"matching semantic source is unusable at /sources/{index}: Backflow HELIXBRAIN-L6-032-N03-PATH"
            )
        matches.append((index, source))
    return matches


def _read_missing_record(
    validated: dict[str, Any], kind: str, field_locator: str, field: dict[str, Any],
    request_locator: str, requested_ref: Any, source_ref: Any = None, subject_ref: Any = None,
) -> dict[str, Any]:
    raw = validated.get("input")
    if not isinstance(raw, dict):
        raise NotImplementedError("record read requires the same ValidatedSupply: Backflow HELIXBRAIN-L6-032-N03-PATH")
    collection = {
        "field": "section_fields", "value": "values", "field_applicability": "applicability_records",
        "value_applicability": "applicability_records", "parent_section": "applicability_records",
    }.get(kind)
    if collection is None:
        raise NotImplementedError("record read kind outside frozen N03 path: Backflow HELIXBRAIN-L6-032-N03-PATH")
    request = _f03_request(
        kind, field_locator,
        field.get("ref") if subject_ref is None else subject_ref,
        field.get("binding", raw.get("binding")), request_locator, requested_ref,
    )
    roots = _root_occurrences(raw, collection, requested_ref)
    source_candidates = _matching_semantic_sources(validated, field.get("binding", raw.get("binding")), source_ref)
    problems = []
    source_occurrences = []
    for source_index, source in source_candidates:
        content = source["content"]
        member = {
            "field": "section_field_records", "value": "value_facts",
            "field_applicability": "field_applicability_records",
            "value_applicability": "field_applicability_records",
            "parent_section": "field_applicability_records",
        }[kind]
        locator = f"/sources/{source_index}/content/{member}"
        if "binding" not in content:
            problems.append(_record_problem("lookup_unresolved", f"/sources/{source_index}/content/binding", _presence(present=False), source.get("ref"), source_index))
            continue
        if content.get("binding") is None or not isinstance(content.get("binding"), dict):
            problems.append(_record_problem("null_or_type", f"/sources/{source_index}/content/binding", _presence(content.get("binding"), present=True), source.get("ref"), source_index))
            continue
        if not _binding_same(content.get("binding"), field.get("binding", raw.get("binding"))):
            problems.append(_record_problem("frame_differs", f"/sources/{source_index}/content/binding", _presence(content.get("binding"), present=True), source.get("ref"), source_index))
            continue
        if member not in content:
            cause = "field_owner_not_found" if kind == "field" else "container_absent"
            problems.append(_record_problem(cause, locator, _presence(present=False), source.get("ref"), source_index))
        elif content[member] is None:
            raise NotImplementedError(f"{member}=null branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
        elif not isinstance(content[member], list):
            raise NotImplementedError(f"{member} wrong type branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
        elif content[member]:
            raise NotImplementedError(f"{member} record decode branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
        else:
            problems.append(_record_problem("lookup_unresolved", locator, _presence(content[member], present=True), source.get("ref"), source_index))
    if not roots and not source_candidates:
        problems.append(_record_problem("lookup_unresolved", request_locator, _presence(requested_ref, present=requested_ref is not None)))
    if roots and not source_candidates:
        cause = "field_owner_not_found" if kind == "field" else "lookup_unresolved"
        problems.append(_record_problem(cause, request_locator, _presence(requested_ref, present=requested_ref is not None)))
    if not problems and not roots:
        problems.append(_record_problem("lookup_unresolved", request_locator, _presence(requested_ref, present=requested_ref is not None)))
    return {
        "request": request,
        "state": "unknown" if problems or not roots else "resolved",
        "root_occurrences": roots,
        "source_occurrences": source_occurrences,
        "supports": [],
        "problems": problems,
    }


def _read_missing_target(validated: dict[str, Any], field_locator: str, field: dict[str, Any]) -> dict[str, Any]:
    raw = validated.get("input")
    if not isinstance(raw, dict):
        raise NotImplementedError("target read requires the same ValidatedSupply: Backflow HELIXBRAIN-L6-032-N03-PATH")
    binding = field.get("binding", raw.get("binding"))
    request = {
        "binding": _presence(binding, present=binding is not None),
        "descriptor_slot_ref": _presence(field.get("descriptor_slot_ref"), present="descriptor_slot_ref" in field),
    }
    problems = []
    sources = _matching_semantic_sources(validated, binding)
    for source_index, source in sources:
        locator = f"/sources/{source_index}/content/descriptor_targets"
        if "descriptor_targets" not in source["content"]:
            problems.append(_record_problem("container_absent", locator, _presence(present=False), source.get("ref"), source_index))
        elif source["content"]["descriptor_targets"] is None or not isinstance(source["content"]["descriptor_targets"], list):
            raise NotImplementedError("descriptor_targets null/type branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
        elif source["content"]["descriptor_targets"]:
            raise NotImplementedError("descriptor_targets record decode branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
        else:
            problems.append(_record_problem("lookup_unresolved", locator, _presence(source["content"]["descriptor_targets"], present=True), source.get("ref"), source_index))
    if not sources:
        problems.append(_record_problem("lookup_unresolved", field_locator + "/descriptor_slot_ref", _presence(field.get("descriptor_slot_ref"), present="descriptor_slot_ref" in field)))
    return {
        "field_locator": field_locator,
        "request": request,
        "state": "unknown",
        "occurrences": [],
        "matches": [],
        "problems": problems,
    }


def _build_f03_row(validated: dict[str, Any], index: int, field: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]]]:
    raw = validated.get("input")
    if not isinstance(raw, dict):
        raise NotImplementedError("F03 row requires the same ValidatedSupply: Backflow HELIXBRAIN-L6-032-N03-PATH")
    field_locator = f"/section_fields/{index}"
    binding = field.get("binding", raw.get("binding"))
    field_ref = field.get("ref")
    field_members = {
        "ref", "descriptor_slot_ref", "parent_section_ref", "meaning_fact_refs",
        "requiredness_fact_refs", "normative_rule_refs", "oracle_refs", "value_fact_refs",
        "applicability_ref",
    }
    if set(field) != field_members:
        raise NotImplementedError("SectionField closed shape branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    if not isinstance(field_ref, dict) or not isinstance(binding, dict):
        raise NotImplementedError("F03 field/ref/binding shape branch: Backflow HELIXBRAIN-L6-032-N03-PATH")

    request = {
        "field_locator": field_locator,
        "field": _presence(field, present=True),
        "binding": _presence(binding, present=True),
    }
    owner_read = _read_missing_record(validated, "field", field_locator, field, field_locator + "/ref", field_ref)
    target_read = _read_missing_target(validated, field_locator, field)
    judgment = {
        "branch": "definition_unknown",
        "cause": "field_owner_unresolved",
        "state": "unknown",
        "request_ref_index": None,
        "fact_read_indices": [],
        "meaning_support_indices": [],
        "pair_read_indices": [],
        "original_refs": _copy_refs_in_source_order([field_ref, field.get("descriptor_slot_ref")]),
        "original_reason": _presence(present=False),
        "original_semantic_basis": _presence(present=False),
        "reason": "同field/subject/full Binding/bodyの独立owner宣言を取得できない。",
    }
    definition_read = {
        "request": request,
        "owner_read": owner_read,
        "target_read": target_read,
        "fact_reads": [],
        "pair_reads": [],
        "judgments": [judgment],
        "problems": copy.deepcopy(owner_read["problems"]) + copy.deepcopy(target_read["problems"]),
    }

    applicability_ref_present = "applicability_ref" in field
    applicability_ref = field.get("applicability_ref")
    if not applicability_ref_present or applicability_ref is None:
        raise NotImplementedError("field applicability absent/null branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    if not isinstance(applicability_ref, dict):
        raise NotImplementedError("field applicability Ref type branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    applicability_request_locator = field_locator + "/applicability_ref"
    applicability_read = _read_missing_record(
        validated, "field_applicability", field_locator, field,
        applicability_request_locator, applicability_ref,
    )

    value_reads = []
    values = raw.get("values", [])
    value_refs = field.get("value_fact_refs", [])
    if not isinstance(value_refs, list):
        raise NotImplementedError("SectionField.value_fact_refs absence/null/type branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    for value_index, value_ref in enumerate(value_refs):
        if not isinstance(value_ref, dict):
            raise NotImplementedError("SectionField.value_fact_refs non-Ref branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
        matching_values = [row for row in values if _ref_same(row.get("ref"), value_ref)]
        if len(matching_values) > 1:
            raise NotImplementedError("duplicate same-ref ValueFact body branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
        if matching_values and (
            not _ref_same(matching_values[0].get("subject_ref"), field_ref)
            or not _binding_same(matching_values[0].get("binding"), binding)
        ):
            raise NotImplementedError("ValueFact subject/full Binding mismatch branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
        source_ref = matching_values[0].get("source_ref") if matching_values else None
        value_read = _read_missing_record(
            validated, "value", field_locator, field,
            f"{field_locator}/value_fact_refs/{value_index}", value_ref, source_ref,
        )
        value_reads.append(value_read)
        if matching_values and "applicability_ref" in matching_values[0]:
            value_app_ref = matching_values[0]["applicability_ref"]
            if value_app_ref is not None:
                if not isinstance(value_app_ref, dict):
                    raise NotImplementedError("ValueFact.applicability_ref type branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
                value_reads.append(_read_missing_record(
                    validated, "value_applicability", field_locator, field,
                    f"/values/{_root_occurrences(raw, 'values', value_ref)[0]['index']}/applicability_ref",
                    value_app_ref, subject_ref=matching_values[0].get("subject_ref"),
                ))

    parent_reads = []
    parent_ref = field.get("parent_section_ref")
    if parent_ref is not None:
        if not isinstance(parent_ref, dict):
            raise NotImplementedError("SectionField.parent_section_ref type branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
        parent_reads.append(_read_missing_record(
            validated, "parent_section", field_locator, field,
            field_locator + "/parent_section_ref", parent_ref, subject_ref=parent_ref,
        ))

    knowledge_ref = binding.get("knowledge_ref")
    if not isinstance(knowledge_ref, dict):
        raise NotImplementedError("F03 reason knowledge_ref branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    events: list[dict[str, Any]] = []
    public_axes: list[dict[str, Any]] = []
    owner = knowledge_ref.get("owner") if isinstance(knowledge_ref.get("owner"), str) else None

    def add_event(branch: str, axis_name: str, state: str, original_refs: list[Any], request_locator: str,
                  roots: list[dict[str, Any]], sources: list[dict[str, Any]], raw_presence: dict[str, Any],
                  original_reason: dict[str, Any], cause: dict[str, Any], judgment_indices: list[int]) -> None:
        axis = {
            "subject_ref": copy.deepcopy(field_ref),
            "binding": copy.deepcopy(binding),
            "axis": axis_name,
            "state": state,
            "original_refs": _copy_refs_in_source_order([ref for ref in original_refs if ref is not None]),
            "reason": "",
            "backflow_owner": owner,
        }
        material = _reason_material(
            branch, field_locator, request_locator,
            [row["locator"] for row in roots], [row["locator"] for row in sources],
            raw_presence, original_reason, cause, knowledge_ref,
        )
        event = _event_from_axis(axis, material, judgment_indices)
        axis["reason"] = event["reason"]
        events.append(event)
        public_axes.append(axis)

    add_event(
        "definition_unknown", "field.definition", "unknown",
        [field_ref, field.get("descriptor_slot_ref")], field_locator + "/meaning_fact_refs",
        owner_read["root_occurrences"], owner_read["source_occurrences"],
        _presence(field.get("meaning_fact_refs"), present="meaning_fact_refs" in field),
        _presence(present=False), _presence("field_owner_unresolved", present=True), [0],
    )
    for read in value_reads:
        if read["request"]["kind"] != "value":
            continue
        value_occurrences = read["root_occurrences"]
        value = value_occurrences[0]["original_value"] if value_occurrences else None
        value_original_refs = []
        if isinstance(value, dict):
            value_original_refs = [value.get("ref"), value.get("source_ref")]
        add_event(
            "value_unknown", "field.value", "unknown", value_original_refs,
            read["request"]["request_locator"], value_occurrences, read["source_occurrences"],
            _presence(value.get("value"), present="value" in value) if isinstance(value, dict) else _presence(present=False),
            _presence(value.get("reason"), present="reason" in value) if isinstance(value, dict) else _presence(present=False),
            _presence(present=False), [],
        )
    if applicability_ref_present:
        app_original = [applicability_ref] if isinstance(applicability_ref, dict) else []
        add_event(
            "applicability_unknown", "applicability.evaluation", "unknown", app_original,
            applicability_request_locator, applicability_read["root_occurrences"], applicability_read["source_occurrences"],
            _presence(applicability_ref, present=True), _presence(present=False), _presence(present=False), [],
        )
        add_event(
            "field_unknown", "field.applicability", "unknown", app_original,
            applicability_request_locator, applicability_read["root_occurrences"], applicability_read["source_occurrences"],
            _presence(applicability_ref, present=True), _presence(present=False), _presence(present=False), [],
        )

    event_order = {
        "definition_unknown": 0,
        "applicability_unknown": 1,
        "value_unknown": 2,
        "field_unknown": 3,
    }
    paired = list(zip(events, public_axes))
    paired.sort(key=lambda pair: event_order[pair[0]["branch"]])
    events = [event for event, _ in paired]
    public_axes = [axis for _, axis in paired]

    row = {
        "field_locator": field_locator,
        "field": copy.deepcopy(field),
        "definition_read": definition_read,
        "value_reads": value_reads,
        "applicability_read": applicability_read,
        "parent_reads": parent_reads,
        "events": events,
        "axis_indices": [],
        "finding_indices": [],
    }
    all_problems = (
        definition_read["problems"]
        + [problem for read in value_reads for problem in read["problems"]]
        + applicability_read["problems"]
        + [problem for read in parent_reads for problem in read["problems"]]
    )
    return row, public_axes, all_problems


def _reason_material(branch: str, field_locator: str, request_locator: str, root_locators: list[str], source_locators: list[str], original_presence: dict[str, Any], original_reason: dict[str, Any], definition_cause: dict[str, Any], knowledge_ref: Any) -> dict[str, Any]:
    return {
        "branch": branch,
        "field_locator": field_locator,
        "request_locator": request_locator,
        "root_locators": root_locators,
        "source_locators": source_locators,
        "original_presence": copy.deepcopy(original_presence),
        "original_reason": copy.deepcopy(original_reason),
        "original_owner": _presence(present=False),
        "original_decision": _presence(present=False),
        "original_reentry": _presence(present=False),
        "knowledge_ref": copy.deepcopy(knowledge_ref),
        "definition_cause": copy.deepcopy(definition_cause),
    }


def _event_from_axis(axis: dict[str, Any], material: dict[str, Any], judgment_indices: list[int]) -> dict[str, Any]:
    branch = material["branch"]
    reason = _F03_BRANCH_REASONS[branch] + "\n" + _ordered(material)
    return {
        "branch": branch,
        "subject_ref": _presence(axis.get("subject_ref"), present=axis.get("subject_ref") is not None),
        "binding": _presence(axis.get("binding"), present=axis.get("binding") is not None),
        "axis": axis["axis"],
        "state": axis["state"],
        "original_refs": copy.deepcopy(axis["original_refs"]),
        "reason_material": material,
        "reason": reason,
        "backflow_owner": axis["backflow_owner"],
        "definition_judgment_indices": judgment_indices,
    }


def _component_key(present: bool, value: Any = None) -> tuple[int, str]:
    # L5 exact_sort_contract.component_key. Explicit null is supplied and sorts
    # as canonical JSON; only an absent member has the lower rank.
    return (1, _ordered(value)) if present else (0, "")


def _public_axis_sort_key(axis: dict[str, Any], slot: dict[str, Any], source_refs: list[Any], source_refs_present: bool, ordinal: int) -> tuple[Any, ...]:
    binding = axis.get("binding")
    binding = binding if isinstance(binding, dict) else {}
    template = binding.get("template_ref")
    template = template if isinstance(template, dict) else {}
    knowledge = binding.get("knowledge_ref")
    knowledge = knowledge if isinstance(knowledge, dict) else {}
    sort_refs = _copy_refs_in_source_order([ref for ref in source_refs if ref is not None])
    sort_refs = sorted(sort_refs, key=_ordered)  # L5 sorted_values retains repeated refs.
    slot_present = "slot_identity" in slot
    return (
        _component_key(isinstance(binding.get("template_ref"), dict) and "identity" in template, template.get("identity")),
        _component_key(isinstance(binding.get("template_ref"), dict) and "revision" in template, template.get("revision")),
        _component_key(isinstance(binding.get("knowledge_ref"), dict) and "identity" in knowledge, knowledge.get("identity")),
        _component_key(isinstance(binding.get("knowledge_ref"), dict) and "revision" in knowledge, knowledge.get("revision")),
        _component_key(slot_present, slot.get("slot_identity")),
        _component_key(source_refs_present, sort_refs if source_refs_present else None),
        _component_key("axis" in axis, axis.get("axis")),
        ordinal,
    )


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


def compare_descriptor_definitions(context: dict[str, object]) -> dict[str, object]:
    """fn1: N03同一snapshot経路の定義・owner帰属・明示NAを別軸で返す。"""
    validated = context.get("validated") if isinstance(context, dict) else None
    if not isinstance(validated, dict) or not isinstance(validated.get("input"), dict):
        raise NotImplementedError("compare_descriptor_definitions requires a decoded SupplyInput")
    raw = validated["input"]
    binding = raw.get("binding")
    if not isinstance(binding, dict):
        raise NotImplementedError("fn1 Binding absent/null/type branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    descriptors = raw.get("descriptors")
    if not isinstance(descriptors, list):
        raise NotImplementedError("descriptor array absent/null/type branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    emissions: list[tuple[dict[str, Any], dict[str, Any], list[Any], bool]] = []
    for slot in descriptors:
        if not isinstance(slot, dict) or slot.get("descriptor_kind") not in _APPROVED_KINDS:
            raise NotImplementedError("descriptor kind/shape outside HELIXBRAIN-L6-032-N03-PATH")
        facts = slot.get("facts")
        if not isinstance(facts, list):
            raise NotImplementedError("descriptor facts absent/null/type branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
        if not facts:
            raise NotImplementedError("empty descriptor facts branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
        for fact in facts:
            if not isinstance(fact, dict):
                raise NotImplementedError("malformed descriptor fact: Backflow HELIXBRAIN-L6-032-N03-PATH")
            owner = None
            knowledge_ref = binding.get("knowledge_ref") if isinstance(binding, dict) else None
            if isinstance(knowledge_ref, dict):
                owner = knowledge_ref.get("owner")
            cause, refs, reason = _meaning_resolution(validated, slot, fact)
            definition_axis = _unknown_axis(
                fact.get("ref"), slot.get("binding"), slot["descriptor_kind"] + ".definition",
                refs, f"{cause}: {reason}", owner,
            )
            definition_sources = [fact.get("source_ref")]
            knowledge_ref = binding.get("knowledge_ref") if isinstance(binding, dict) else None
            for record in raw.get("knowledge_records", []):
                if not isinstance(record, dict) or not _ref_same(record.get("ref"), knowledge_ref):
                    continue
                for provenance_ref in record.get("provenance_refs", []):
                    if _ref_identity_same(provenance_ref, fact.get("source_ref")):
                        for source in raw.get("sources", []):
                            if isinstance(source, dict) and _ref_identity_same(source.get("ref"), provenance_ref):
                                definition_sources.append(source.get("ref"))
            emissions.append((definition_axis, slot, definition_sources, any(ref is not None for ref in definition_sources)))
            attribution_axis = _attribution_axis(validated, slot, fact)
            attribution_refs = [fact.get("source_ref")]
            emissions.append((attribution_axis, slot, attribution_refs, isinstance(fact.get("source_ref"), dict)))
        # Presence of an explicit null definition applicability request emits its own unknown axis.
        if "definition_applicability_ref" in slot and slot["definition_applicability_ref"] is None:
            emissions.append((_unknown_axis(
                slot.get("binding", {}).get("template_ref") if isinstance(slot.get("binding"), dict) else None,
                slot.get("binding"), slot["descriptor_kind"] + ".definition_applicability", [],
                "原定義適用判断Refが明示nullであり、定義NA要求を解決できない。", owner,
            ), slot, [], isinstance(raw.get("sources"), list)))
        elif "definition_applicability_ref" in slot:
            raise NotImplementedError("definition applicability supplied-ref branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    decorated = [
        (axis, _public_axis_sort_key(axis, slot, source_refs, source_refs_present, ordinal))
        for ordinal, (axis, slot, source_refs, source_refs_present) in enumerate(emissions)
    ]
    axes = [axis for axis, _ in sorted(decorated, key=lambda pair: pair[1])]
    return _comparison(axes, [], "compare_descriptor_definitions", binding)


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
    if set(context) != {"snapshot", "definitions"}:
        raise NotImplementedError("F03BasicContext closed shape: Backflow HELIXBRAIN-L6-032-N03-PATH")
    validated = context["snapshot"]
    definitions = context["definitions"]
    if not isinstance(validated, dict) or not isinstance(validated.get("input"), dict):
        raise NotImplementedError("F03 snapshot alias is not the validated input: Backflow HELIXBRAIN-L6-032-N03-PATH")
    if (
        not isinstance(definitions, dict)
        or set(definitions) != {"axes", "findings", "producer_symbol", "input_binding"}
        or not isinstance(definitions.get("axes"), list)
        or not isinstance(definitions.get("findings"), list)
    ):
        raise NotImplementedError("F03 definitions is not a closed projected Comparison: Backflow HELIXBRAIN-L6-032-N03-PATH")
    raw = validated["input"]
    binding = raw.get("binding")
    axes: list[dict[str, Any]] = []
    findings: list[dict[str, Any]] = []
    rows: list[dict[str, Any]] = []
    problems: list[dict[str, Any]] = []
    if not isinstance(binding, dict) or "values" not in raw or "section_fields" not in raw or "claims" not in raw:
        raise NotImplementedError("fn2 required input presence branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    values = raw["values"]
    if not isinstance(values, list) or not isinstance(raw["claims"], list):
        raise NotImplementedError("fn2 values/claims container branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    if any(not isinstance(value, dict) for value in values):
        raise NotImplementedError("ValueFact decode branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    fields = raw["section_fields"]
    if not isinstance(fields, list):
        raise NotImplementedError("section_fields absence/null/type branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
    for field_index, field in enumerate(fields):
        if not isinstance(field, dict):
            raise NotImplementedError("F03 section_field decode branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
        row, row_axes, row_problems = _build_f03_row(validated, field_index, field)
        row["axis_indices"] = list(range(len(axes), len(axes) + len(row_axes)))
        axes.extend(row_axes)
        rows.append(row)
        problems.extend(row_problems)

    for claim in raw.get("claims", []):
        if not isinstance(claim, dict):
            raise NotImplementedError("Claim record type branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
        matching_values = [value_fact for value_fact in values if _same_claim_target(claim, value_fact)]
        if len(matching_values) != 1:
            raise NotImplementedError("Claim target must resolve to one same-frame ValueFact: Backflow HELIXBRAIN-L6-032-N03-PATH")
        value_fact = matching_values[0]
        rule = _n03_rule(claim, value_fact)
        if rule:
            rule_ref, axis_name, owner, reason = rule
            finding = {
                "code": rule_ref.rsplit("-", 1)[-1],
                "rule_ref": rule_ref,
                "subject_ref": copy.deepcopy(claim["subject_ref"]),
                "binding": copy.deepcopy(claim["binding"]),
                "axis": axis_name,
                "state": "unknown",
                "source_refs": _copy_refs_in_source_order(
                    [ref for ref in [value_fact.get("ref"), claim.get("subject_ref"), *claim.get("basis_refs", [])] if ref is not None]
                ),
                "reason": reason,
                "backflow_owner": owner,
            }
            findings.append(finding)
            axes.append({
                "subject_ref": copy.deepcopy(claim["subject_ref"]),
                "binding": copy.deepcopy(claim["binding"]),
                "axis": axis_name,
                "state": "unknown",
                "original_refs": _copy_refs_in_source_order(
                    [ref for ref in [value_fact.get("ref"), claim.get("subject_ref"), *claim.get("basis_refs", [])] if ref is not None]
                ),
                "reason": reason,
                "backflow_owner": owner,
            })
    # L4 carries only required section.definition/required field.definition axes
    # from the actual same-call fn1 result. Other fn1 axes belong to fn1 only.
    carried = [
        copy.deepcopy(axis) for axis in definitions["axes"]
        if isinstance(axis, dict) and axis.get("axis") in {"required section.definition", "required field.definition"}
    ]
    if carried:
        for row in rows:
            row["axis_indices"] = [index + len(carried) for index in row["axis_indices"]]
    public = _comparison(carried + axes, findings, "compare_values_and_applicability", binding)
    f03_comparison = _write_f03b_comparison_from_existing_comparison(public)
    return {"comparison": f03_comparison, "rows": rows, "problems": problems}


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
