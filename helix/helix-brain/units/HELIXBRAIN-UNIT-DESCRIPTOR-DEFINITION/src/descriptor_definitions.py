"""BRAIN032の局所入力検証と同snapshot比較。"""

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
_SUPPLY_INPUT_MEMBERS = frozenset((
    "binding", "required_descriptor_kinds", "sources", "qualification_roots",
    "qualifications", "descriptors", "meaning_comparisons", "section_fields",
    "values", "applicability_records", "relations", "oracle_bindings",
    "compatibility_records", "knowledge_records", "dependencies", "handoff_records",
    "claims", "candidates",
))
_F03_AXIS_MEMBERS = (
    "subject_ref", "binding", "axis", "state", "original_refs", "reason", "backflow_owner",
)
_F03_FINDING_MEMBERS = (
    "code", "rule_ref", "subject_ref", "binding", "axis", "state", "source_refs",
    "reason", "backflow_owner",
)
_BACKFLOW_ID = "HELIXBRAIN-L6-032-N03-PATH"


def _unsupported(contract: str, branch: str, detail: str) -> NotImplementedError:
    error = NotImplementedError(f"{contract}/{branch}: {detail}; Backflow {_BACKFLOW_ID}")
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
                branch = message.partition(":")[0].strip().replace(" ", "_") or "unsupported_branch"
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
        return all(isinstance(key, str) and _is_json_value(item) for key, item in value.items())
    return False


def _ref_shape_ok(value: Any) -> bool:
    fields = {"identity", "revision", "scope", "owner", "source_locator", "sha256"}
    if not isinstance(value, dict) or set(value) != fields:
        return False
    string_or_null = (str, type(None))
    return (
        all(isinstance(value[key], string_or_null) for key in ("identity", "revision", "owner", "source_locator", "sha256"))
        and _is_json_value(value["scope"])
    )


def _binding_shape_ok(value: Any) -> bool:
    fields = {
        "template_ref", "knowledge_ref", "requirement_ref", "oracle_ref", "pack_ref",
        "pack_contract_version", "pack_artifact_version", "pack_dependency_versions", "version_target",
    }
    if not isinstance(value, dict) or set(value) != fields:
        return False
    for key in ("template_ref", "knowledge_ref", "requirement_ref", "oracle_ref", "pack_ref"):
        if not _ref_shape_ok(value[key]):
            return False
    for key in ("pack_contract_version", "pack_artifact_version", "version_target"):
        if not isinstance(value[key], (str, type(None))):
            return False
    return isinstance(value["pack_dependency_versions"], list) and all(
        _ref_shape_ok(row) for row in value["pack_dependency_versions"]
    )


def _fn3_r59_binding_shape_ok(value: Any) -> bool:
    """Keep the closed Binding/Ref shape while permitting only template.revision absence."""
    fields = {
        "template_ref", "knowledge_ref", "requirement_ref", "oracle_ref", "pack_ref",
        "pack_contract_version", "pack_artifact_version", "pack_dependency_versions", "version_target",
    }
    if not isinstance(value, dict) or set(value) != fields:
        return False
    template_ref = value.get("template_ref")
    ref_fields = {"identity", "revision", "scope", "owner", "source_locator", "sha256"}
    if not isinstance(template_ref, dict) or "revision" in template_ref or set(template_ref) != ref_fields - {"revision"}:
        return False
    if not all(isinstance(template_ref[key], (str, type(None)))
               for key in ("identity", "owner", "source_locator", "sha256")) or not _is_json_value(template_ref["scope"]):
        return False
    if any(not _ref_shape_ok(value[key]) for key in ("knowledge_ref", "requirement_ref", "oracle_ref", "pack_ref")):
        return False
    if any(not isinstance(value[key], (str, type(None)))
           for key in ("pack_contract_version", "pack_artifact_version", "version_target")):
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
    ref_fields = {"template_ref", "knowledge_ref", "requirement_ref", "oracle_ref", "pack_ref"}
    scalar_fields = {"pack_contract_version", "pack_artifact_version", "version_target"}
    fields = ref_fields | scalar_fields | {"pack_dependency_versions"}
    if not set(value) <= fields:
        return False
    if any(key in value and not _wire_ref_shape_ok(value[key]) for key in ref_fields):
        return False
    if any(key in value and value[key] is not None and not isinstance(value[key], str) for key in scalar_fields):
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
        and set(source) == {"ref", "content", "content_bytes", "qualification_ref", "role"}
        and _ref_shape_ok(source.get("ref"))
        and isinstance(source.get("content_bytes"), str)
        and (source.get("qualification_ref") is None or _ref_shape_ok(source.get("qualification_ref")))
        and isinstance(source.get("role"), str)
        and source["role"] in {"semantic_json", "derived_view", "explanation", "reference_only"}
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
                keys = {"ref", "subject_ref", "obligation_ref", "oracle_ref", "viewpoint", "evidence_refs", "source_ref"}
                valid = (
                    isinstance(row, dict) and set(row) == keys
                    and all(_ref_shape_ok(row[key]) for key in ("ref", "subject_ref", "obligation_ref"))
                    and (row["oracle_ref"] is None or _ref_shape_ok(row["oracle_ref"]))
                    and _is_json_value(row["viewpoint"])
                    and isinstance(row["evidence_refs"], list)
                    and all(_ref_shape_ok(ref) for ref in row["evidence_refs"])
                    and (row["source_ref"] is None or _ref_shape_ok(row["source_ref"]))
                )
            elif record_kind == "CompatibilityRecord":
                keys = {"ref", "left_ref", "right_ref", "source_ref", "compatible", "reason"}
                valid = (
                    isinstance(row, dict) and set(row) == keys
                    and _ref_shape_ok(row["ref"])
                    and _ref_shape_ok(row["left_ref"])
                    and _ref_shape_ok(row["right_ref"])
                    and (row["source_ref"] is None or _ref_shape_ok(row["source_ref"]))
                    and (row["compatible"] is None or isinstance(row["compatible"], bool))
                    and (row["reason"] is None or isinstance(row["reason"], str))
                )
            else:
                keys = {"subject_ref", "binding", "state", "source_ref", "reason"}
                valid = (
                    isinstance(row, dict) and set(row) == keys
                    and _ref_shape_ok(row["subject_ref"])
                    and _binding_shape_ok(row["binding"])
                    and isinstance(row["state"], str)
                    and row["state"] in {"not_requested", "not_received", "received", "unknown", "conflict"}
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
    if not isinstance(source, dict):
        return False
    source_ref = source["ref"]
    content_bytes = source["content_bytes"]
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
    if not _is_json_value(decoded) or not _json_equal(decoded, source["content"]):
        return False

    qualification_ref = source["qualification_ref"]
    if not isinstance(qualification_ref, dict):
        return False
    qualifications = raw.get("qualifications")
    roots = raw.get("qualification_roots")
    if not isinstance(qualifications, list) or not isinstance(roots, list):
        return False
    matches = [
        (index, row) for index, row in enumerate(qualifications)
        if isinstance(row, dict) and _ref_same(row.get("ref"), qualification_ref)
    ]
    if not matches:
        return False
    # The sole repeated-Q branch implemented here is whole-equal occurrences;
    # distinct candidates remain unresolved instead of selecting a winner.
    first = matches[0][1]
    if any(not _json_equal(row, first) for _, row in matches[1:]):
        return False
    for _index, qualification in matches:
        root_ref = qualification.get("root_ref")
        root_matches = [root for root in roots if _ref_shape_ok(root) and _ref_same(root, root_ref)]
        if not root_matches:
            return False
        subject_sha = qualification.get("subject_sha256")
        if not (
            _ref_same(qualification.get("subject_ref"), source_ref)
            and subject_sha == digest
            and _json_equal(qualification.get("applicable_scope"), source_ref.get("scope"))
            # qualification_body is opaque here; no trust resolver is implied.
            and "qualification_body" in qualification
        ):
            return False
    return True


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
    bad_arrays = [key for key in _INPUT_ARRAYS if key in raw and not isinstance(raw[key], list)]
    if (
        bad_arrays
        or ("descriptors" in raw and raw["descriptors"] is not None and not isinstance(raw["descriptors"], list))
        or ("binding" in raw and not _wire_binding_shape_ok(raw["binding"]))
        or ("dependencies" in raw and not isinstance(raw["dependencies"], dict))
    ):
        field = bad_arrays[0] if bad_arrays else next(
            key for key in ("descriptors", "binding", "dependencies")
            if key in raw and (
                (key == "descriptors" and raw[key] is not None and not isinstance(raw[key], list))
                or (key == "binding" and not _wire_binding_shape_ok(raw[key]))
                or (key == "dependencies" and not isinstance(raw[key], dict))
            )
        )
        return {
            "input": None,
            "input_issues": [_input_issue("/" + field, "SupplyInput member has an invalid container shape.")],
            "unusable_source_refs": [],
        }

    malformed_auxiliary = _auxiliary_array_record_issue(raw)
    if malformed_auxiliary is not None:
        member, index = malformed_auxiliary
        locator = f"/{member}" if index < 0 else f"/{member}/{index}"
        return {
            "input": None,
            "input_issues": [_input_issue(locator, "SupplyInput record has an unsupported typed shape.")],
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
    if "sources" in snapshot:
        for index, source in enumerate(snapshot["sources"]):
            if not _source_qualification_ok(snapshot, source):
                ref = source["ref"] if isinstance(source, dict) else None
                if isinstance(ref, dict):
                    unusable.append(copy.deepcopy(ref))
                issues.append(_input_issue(f"/sources/{index}", "source bytes/body/digest or independent qualification is unresolved.", ref))
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


def _attribution_axis(validated: dict[str, Any], slot: dict[str, Any], fact: dict[str, Any]) -> dict[str, Any]:
    raw = validated["input"]
    sources = raw["sources"]
    refs = _copy_refs_in_source_order([fact["source_ref"]] if isinstance(fact.get("source_ref"), dict) else [])
    binding = slot["binding"]
    knowledge_ref = binding.get("knowledge_ref") if isinstance(binding, dict) else None
    backflow = knowledge_ref.get("owner") if isinstance(knowledge_ref, dict) else None
    state = "unknown"
    reason = "caller factをqualified semantic_json sourceのowner原factへ結べない。"
    matches: list[str] = []
    unresolved_kind = False
    if _source_usable(validated, fact.get("source_ref")):
        for source in sources:
            if not isinstance(source, dict) or source.get("role") != "semantic_json":
                continue
            if not _ref_same(source.get("ref"), fact.get("source_ref")):
                continue
            content = source.get("content")
            if not isinstance(content, dict) or not _binding_same(content.get("binding"), binding):
                continue
            if "descriptor_facts" not in content:
                continue
            groups = content["descriptor_facts"]
            if not isinstance(groups, list):
                raise _unsupported("F01", "descriptor_facts_container", "descriptor_facts is null or not an array")
            for group in groups:
                if not isinstance(group, dict) or group.get("slot_identity") != slot.get("slot_identity"):
                    continue
                if "facts" not in group:
                    raise _unsupported("F01", "descriptor_facts_member_absent", "matching descriptor_facts group lacks facts")
                original_facts = group["facts"]
                if not isinstance(original_facts, list):
                    raise _unsupported("F01", "descriptor_facts_member_type", "matching descriptor_facts[].facts is not an array")
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


def _meaning_resolution(validated: dict[str, Any], slot: dict[str, Any], fact: dict[str, Any]) -> tuple[str, list[Any], str, list[Any]]:
    """同一fact→KnowledgeRecord provenance→実sourceを直接解決する。"""
    raw = validated["input"]
    binding = slot["binding"]
    refs: list[Any] = [fact.get("source_ref"), fact.get("ref")]
    source_ref = fact.get("source_ref")
    if "meaning" not in fact:
        raise _unsupported("F01/F02", "meaning_body_absent", "MeaningFact.meaning is not supplied")
    if fact.get("meaning") is None:
        raise _unsupported("F01/F02", "meaning_body_null", "MeaningFact.meaning is null")
    if not isinstance(source_ref, dict):
        return "source_unresolved", refs, "当該MeaningFactの原source Refが未供給のためsource_unresolved。", [source_ref]

    sources = raw["sources"]
    source_rows = [
        (index, source) for index, source in enumerate(sources)
        if isinstance(source, dict) and _ref_same(source.get("ref"), source_ref)
    ]
    usable_sources = [
        (index, source) for index, source in source_rows
        if _source_usable(validated, source_ref) and source.get("role") == "semantic_json"
    ]
    if not usable_sources:
        refs.extend(source.get("ref") for _, source in source_rows)
        return "source_unresolved", refs, "当該MeaningFactのsourceは同snapshotでqualified semantic_json sourceへ解決できない。", [source_ref]

    knowledge_ref = binding["knowledge_ref"]
    knowledge_records = raw["knowledge_records"]
    records = [
        record for record in knowledge_records
        if isinstance(record, dict) and _ref_same(record.get("ref"), knowledge_ref)
    ]
    if not records:
        return "source_unresolved", refs, "同じBindingの原KnowledgeRecordが未供給のためprovenanceを解決できない。", [source_ref]

    saw_matching_provenance = False
    definition_source_refs: list[Any] = [source_ref]
    first_unresolved: tuple[str, str] | None = None
    for record in records:
        if "provenance_refs" not in record:
            raise _unsupported("F01/F02", "knowledge_provenance_absent", "matching KnowledgeRecord lacks provenance_refs")
        provenance = record["provenance_refs"]
        if not isinstance(provenance, list):
            raise _unsupported("F01/F02", "knowledge_provenance_type", "KnowledgeRecord.provenance_refs is not an array")
        for provenance_ref in provenance:
            if not _ref_identity_same(provenance_ref, source_ref):
                continue
            saw_matching_provenance = True
            if first_unresolved is None:
                refs.append(provenance_ref)
            direct_sources = [
                (index, source) for index, source in enumerate(sources)
                if isinstance(source, dict) and _ref_identity_same(source.get("ref"), provenance_ref)
            ]
            for index, source in direct_sources:
                actual_ref = source.get("ref")
                definition_source_refs.append(actual_ref)
                if first_unresolved is not None:
                    continue
                refs.append(actual_ref)
                expected_digest = provenance_ref.get("sha256")
                actual_digest = actual_ref.get("sha256") if isinstance(actual_ref, dict) else None
                if expected_digest is not None and actual_digest is not None and expected_digest != actual_digest:
                    first_unresolved = (
                        "source_unresolved",
                        f"KnowledgeRecord provenance digestと実source digestが一致しない（source index {index}）。",
                    )
                    continue
                if not _ref_same(provenance_ref, actual_ref) or not _source_usable(validated, actual_ref):
                    continue
                content = source.get("content")
                if not isinstance(content, dict) or "definition_meaning_operations" not in content:
                    first_unresolved = ("container_absent", "資格済み原sourceにdefinition_meaning_operations carrierが未供給。")
                    continue
                operations = content.get("definition_meaning_operations")
                if not isinstance(operations, list):
                    raise _unsupported("F01/F02", "definition_meaning_operations_container", "definition_meaning_operations is null or not an array")
                raise _unsupported("F01/F02", "typed_definition_meaning_operation", "meaning-operation success evaluation is outside the implemented path")
    if not saw_matching_provenance:
        return "source_unresolved", refs, "同じBindingのKnowledgeRecordに当該原source provenanceが無い。", definition_source_refs
    if first_unresolved is not None:
        return first_unresolved[0], refs, first_unresolved[1], definition_source_refs
    return "source_unresolved", refs, "原provenanceからqualified sourceへの直接対応が未成立。", definition_source_refs


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


def _fn1_scope_guard(raw: dict[str, Any], binding: dict[str, Any]) -> None:
    """Keep fn1 inside the frozen 15-kind path; do not evaluate F01/F02 failures here."""
    for member in ("sources", "knowledge_records"):
        if member not in raw or not isinstance(raw[member], list):
            raise _unsupported("F01/F02", f"{member}_required_array", f"{member} is absent or not an array in the fixed fn1 path")
    if "required_descriptor_kinds" not in raw:
        raise _unsupported("F02", "required_kinds_absent", "required_descriptor_kinds is not supplied")
    required = raw["required_descriptor_kinds"]
    if not isinstance(required, list) or any(kind not in _APPROVED_KINDS for kind in required):
        raise _unsupported("F02", "required_kinds_shape_or_value", "required_descriptor_kinds is outside the fixed descriptor domain")
    if len(required) != len(set(required)) or set(required) != set(_APPROVED_KINDS):
        raise _unsupported("F02", "required_kinds_outside_frozen_path", "this fn1 path requires one member of each fixed descriptor meaning")
    if "descriptors" not in raw or not isinstance(raw["descriptors"], list):
        raise _unsupported("F02", "descriptor_slots_absent_or_wrong_type", "descriptor slots are not supplied as an array")
    slots = raw["descriptors"]
    slots_by_kind: dict[str, list[dict[str, Any]]] = {}
    slot_identities: set[str] = set()
    fact_refs: list[dict[str, Any]] = []
    comparison_refs: list[dict[str, Any]] = []
    slot_members = {"slot_identity", "descriptor_kind", "binding", "facts", "comparison_refs", "definition_applicability_ref"}
    fact_members = {"source_ref", "owner", "binding", "meaning", "condition", "reason", "oracle_ref", "ref"}
    for index, slot in enumerate(slots):
        if not isinstance(slot, dict) or set(slot) != slot_members:
            raise _unsupported("F02", "descriptor_slot_closed_shape", f"descriptors[{index}] is outside the fixed DescriptorSlot shape")
        kind = slot["descriptor_kind"]
        identity = slot["slot_identity"]
        if not isinstance(kind, str) or kind not in _APPROVED_KINDS:
            raise _unsupported("F02", "descriptor_kind_unrecognized", f"descriptors[{index}].descriptor_kind is outside the fixed domain")
        if not isinstance(identity, str) or not identity or identity in slot_identities:
            raise _unsupported("F02", "slot_identity_missing_or_duplicate", f"descriptors[{index}].slot_identity is missing or duplicated")
        slot_identities.add(identity)
        if not _binding_shape_ok(slot["binding"]) or not _binding_same(slot["binding"], binding):
            raise _unsupported("F02", "descriptor_slot_binding_unresolved", f"descriptors[{index}] does not have the current full Binding")
        facts = slot["facts"]
        if not isinstance(facts, list) or not facts:
            raise _unsupported("F02", "descriptor_facts_absent_empty_or_wrong_type", f"descriptors[{index}].facts is outside the frozen path")
        for fact_index, fact in enumerate(facts):
            if not isinstance(fact, dict) or set(fact) != fact_members:
                raise _unsupported("F02", "meaning_fact_closed_shape", f"descriptors[{index}].facts[{fact_index}] is outside the fixed MeaningFact shape")
            if not _binding_shape_ok(fact["binding"]) or not _binding_same(fact["binding"], slot["binding"]):
                raise _unsupported("F02", "meaning_fact_binding_unresolved", f"descriptors[{index}].facts[{fact_index}] does not match its slot Binding")
            if not _ref_shape_ok(fact["ref"]) or not _is_json_value(fact["meaning"]) or not _is_json_value(fact["condition"]):
                raise _unsupported("F02", "meaning_fact_member_shape", f"descriptors[{index}].facts[{fact_index}] contains an unsupported member")
            if fact["source_ref"] is not None and not _ref_shape_ok(fact["source_ref"]):
                raise _unsupported("F02", "meaning_fact_source_ref_shape", f"descriptors[{index}].facts[{fact_index}].source_ref is not a Ref or null")
            if fact["oracle_ref"] is not None and not _ref_shape_ok(fact["oracle_ref"]):
                raise _unsupported("F02", "meaning_fact_oracle_ref_shape", f"descriptors[{index}].facts[{fact_index}].oracle_ref is not a Ref or null")
            if fact["owner"] is not None and not isinstance(fact["owner"], str):
                raise _unsupported("F02", "meaning_fact_owner_shape", f"descriptors[{index}].facts[{fact_index}].owner is not string or null")
            if fact["reason"] is not None and not isinstance(fact["reason"], str):
                raise _unsupported("F02", "meaning_fact_reason_shape", f"descriptors[{index}].facts[{fact_index}].reason is not string or null")
            fact_refs.append(fact["ref"])
        if not isinstance(slot["comparison_refs"], list) or any(not _ref_shape_ok(ref) for ref in slot["comparison_refs"]):
            raise _unsupported("F02", "comparison_refs_shape", f"descriptors[{index}].comparison_refs is not a Ref array")
        comparison_refs.extend(slot["comparison_refs"])
        applicability_ref = slot["definition_applicability_ref"]
        if applicability_ref is not None and not _ref_shape_ok(applicability_ref):
            raise _unsupported("F02", "definition_applicability_ref_shape", f"descriptors[{index}].definition_applicability_ref is not a Ref or null")
        slots_by_kind.setdefault(kind, []).append(slot)

    if set(slots_by_kind) != set(required):
        raise _unsupported("F02", "required_kind_slot_mismatch", "required descriptor kinds and supplied slot kinds differ")
    duplicated = [kind for kind, kind_slots in slots_by_kind.items() if len(kind_slots) != 1]
    if duplicated:
        raise _unsupported("F02", "descriptor_kind_duplicate_slot", f"multiple slots for fixed kind(s): {', '.join(duplicated)}")

    if "relations" not in raw or not isinstance(raw["relations"], list):
        raise _unsupported("F01", "relation_input_absent_or_wrong_type", "relation descriptor path has no typed relation array")
    relation_members = {"ref", "binding", "kind", "from_ref", "to_ref", "direction", "source_ref"}
    related_relation_count = 0
    for index, relation in enumerate(raw["relations"]):
        if not isinstance(relation, dict) or set(relation) != relation_members:
            raise _unsupported("F01", "relation_record_closed_shape", f"relations[{index}] is outside the fixed RelationRecord shape")
        if not _ref_shape_ok(relation["ref"]) or not _binding_shape_ok(relation["binding"]):
            raise _unsupported("F01", "relation_record_ref_or_binding_shape", f"relations[{index}] has an invalid Ref or Binding")
        for member in ("from_ref", "to_ref"):
            endpoint = relation[member]
            if endpoint is not None and not _ref_shape_ok(endpoint):
                raise _unsupported("F01", "relation_endpoint_ref_shape", f"relations[{index}].{member} is not a Ref or null")
        if relation["kind"] is not None and not isinstance(relation["kind"], str):
            raise _unsupported("F01", "relation_kind_shape", f"relations[{index}].kind is not string or null")
        if relation["direction"] is not None and not isinstance(relation["direction"], str):
            raise _unsupported("F01", "relation_direction_shape", f"relations[{index}].direction is not string or null")
        if _binding_same(relation["binding"], binding):
            related_relation_count += 1
            if relation["from_ref"] is None or relation["to_ref"] is None:
                raise _unsupported("F01", "relation_endpoint_missing", f"related relations[{index}] lacks an endpoint")
            if relation["direction"] is None or relation["direction"] == "":
                raise _unsupported("F01", "relation_direction_missing", f"related relations[{index}] lacks direction")
    if related_relation_count == 0:
        raise _unsupported("F01", "related_relation_unresolved", "the fixed relation descriptor has no same-Binding relation occurrence")

    # Foreign record meanings are not evaluated here. fn0 already checks the
    # declared record shapes; retain this guard for callers with a hand-built
    # ValidatedSupply that bypassed fn0, without cardinality/domain predicates.
    malformed_auxiliary = _auxiliary_array_record_issue(raw)
    if malformed_auxiliary is not None:
        member, index = malformed_auxiliary
        raise _unsupported(
            "N03", f"{member}_record_decoder",
            f"{member}{'' if index < 0 else f'[{index}]'} is outside its fixed logical record type",
        )

    if "meaning_comparisons" not in raw or not isinstance(raw["meaning_comparisons"], list):
        raise _unsupported("F01/F02", "meaning_comparisons_absent_or_wrong_type", "meaning_comparisons is absent or not an array")
    for index, comparison in enumerate(raw["meaning_comparisons"]):
        if not isinstance(comparison, dict):
            raise _unsupported("F01/F02", "meaning_comparison_record_type", f"meaning_comparisons[{index}] is not an object")
        left = comparison.get("left_fact_ref")
        right = comparison.get("right_fact_ref")
        source = comparison.get("comparison_source_ref")
        if set(comparison) != {"left_fact_ref", "right_fact_ref", "comparison_source_ref", "equivalent", "reason"}:
            raise _unsupported("F01/F02", "meaning_comparison_closed_shape", f"meaning_comparisons[{index}] is outside its fixed logical type")
        if (
            not _ref_shape_ok(left) or not _ref_shape_ok(right) or not _ref_shape_ok(source)
            or (comparison["equivalent"] is not None and not isinstance(comparison["equivalent"], bool))
            or (comparison["reason"] is not None and not isinstance(comparison["reason"], str))
        ):
            raise _unsupported("F01/F02", "meaning_comparison_member_shape", f"meaning_comparisons[{index}] has an invalid typed member")
        relevant = any(
            isinstance(candidate, dict) and _ref_same(candidate, ref)
            for candidate in fact_refs + comparison_refs
            for ref in (left, right, source)
        )
        if relevant:
            raise _unsupported("F01/F02", "meaning_comparison_unimplemented", f"meaning_comparisons[{index}] participates in the current descriptor scope")

    if "claims" not in raw or not isinstance(raw["claims"], list):
        raise _unsupported("F01", "claim_array_absent_or_wrong_type", "claims is absent or not an array")
    for index, claim in enumerate(raw["claims"]):
        if isinstance(claim, dict) and _binding_same(claim.get("binding"), binding) and any(
            _ref_same(claim.get("subject_ref"), fact_ref) for fact_ref in fact_refs
        ):
            raise _unsupported("F01", "descriptor_claim_unimplemented", f"claims[{index}] participates in descriptor meaning comparison")


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
    if collection not in raw:
        raise _unsupported("F03", f"{collection}_absent", f"{collection} is not supplied in the same snapshot")
    rows = raw[collection]
    if not isinstance(rows, list):
        raise _unsupported("F03", f"{collection}_shape", f"{collection} is not an array")
    if any(not isinstance(row, dict) for row in rows):
        raise _unsupported("F03", f"{collection}_record_decoder", f"{collection} contains an unsupported record shape")
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
    if "sources" not in raw:
        raise _unsupported("F03", "sources_absent", "sources is not supplied in the same snapshot")
    sources = raw["sources"]
    if not isinstance(sources, list):
        raise _unsupported("F03", "sources_shape", "sources is not an array")
    for index, source in enumerate(sources):
        if not isinstance(source, dict):
            raise _unsupported("F03", "source_record_decoder", f"sources[{index}] is not an object")
        if source.get("role") != "semantic_json":
            continue
        if not _source_shape_ok(source):
            raise _unsupported("F03", "semantic_source_record_decoder", f"sources[{index}] is outside the typed Source shape")
        content = source.get("content")
        if not isinstance(content, dict):
            raise _unsupported("F03", "semantic_source_content_decoder", f"sources[{index}].content is not an object")
        if source_ref is not None:
            if not _ref_same(source.get("ref"), source_ref):
                continue
        elif not _binding_same(content.get("binding"), binding):
            continue
        if not _source_usable(validated, source.get("ref")):
            raise _unsupported("F03", "matching_source_unusable", f"matching semantic source is unusable at /sources/{index}")
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
        raw["binding"], request_locator, requested_ref,
    )
    roots = _root_occurrences(raw, collection, requested_ref)
    source_candidates = _matching_semantic_sources(validated, raw["binding"], source_ref)
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
        if not _binding_same(content.get("binding"), raw["binding"]):
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
    return {
        "request": request,
        "state": "unknown",
        "root_occurrences": roots,
        "source_occurrences": source_occurrences,
        "supports": [],
        "problems": problems,
    }


def _read_missing_target(validated: dict[str, Any], field_locator: str, field: dict[str, Any]) -> dict[str, Any]:
    raw = validated.get("input")
    if not isinstance(raw, dict):
        raise NotImplementedError("target read requires the same ValidatedSupply: Backflow HELIXBRAIN-L6-032-N03-PATH")
    binding = raw["binding"]
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
    binding = raw["binding"]
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
    if "values" not in raw:
        raise _unsupported("F03", "values_absent", "values is not supplied in the same snapshot")
    values = raw["values"]
    if "value_fact_refs" not in field:
        raise _unsupported("F03", "value_fact_refs_absent", "SectionField.value_fact_refs is not supplied")
    value_refs = field["value_fact_refs"]
    if not isinstance(values, list):
        raise _unsupported("F03", "values_shape", "values is not an array")
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


@_tag_unsupported("F01/F02")
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
    _fn1_scope_guard(raw, binding)
    emissions: list[tuple[dict[str, Any], dict[str, Any], list[Any], bool]] = []
    owner = binding["knowledge_ref"]["owner"]
    for slot in descriptors:
        for fact in slot["facts"]:
            cause, refs, reason, definition_sources = _meaning_resolution(validated, slot, fact)
            definition_axis = _unknown_axis(
                fact["ref"], slot["binding"], slot["descriptor_kind"] + ".definition",
                refs, f"{cause}: {reason}", owner,
            )
            emissions.append((definition_axis, slot, definition_sources, any(ref is not None for ref in definition_sources)))
            attribution_axis = _attribution_axis(validated, slot, fact)
            attribution_refs = [fact.get("source_ref")]
            emissions.append((attribution_axis, slot, attribution_refs, isinstance(fact.get("source_ref"), dict)))
        # Presence of an explicit null definition applicability request emits its own unknown axis.
        if slot["definition_applicability_ref"] is None:
            emissions.append((_unknown_axis(
                slot["binding"]["template_ref"],
                slot["binding"], slot["descriptor_kind"] + ".definition_applicability", [],
                "原定義適用判断Refが明示nullであり、定義NA要求を解決できない。", owner,
            ), slot, [], True))
        else:
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

    for claim in raw["claims"]:
        if not isinstance(claim, dict):
            raise NotImplementedError("Claim record type branch: Backflow HELIXBRAIN-L6-032-N03-PATH")
        matching_values = [value_fact for value_fact in values if _same_claim_target(claim, value_fact)]
        if len(matching_values) != 1:
            raise NotImplementedError("Claim target must resolve to one same-frame ValueFact: Backflow HELIXBRAIN-L6-032-N03-PATH")
        value_fact = matching_values[0]
        rule = _n03_rule(claim, value_fact)
        rule_ref, axis_name, owner, reason = rule
        # This local diagnostic writer retains the refs participating in the
        # implemented predicate in source order. It is an implementation
        # choice under L5-detail-design/template-semantic-supply.json pointers
        # /functions/2, /failure_rules/102..104, /type_contract/types/Finding,
        # /type_contract/types/Claim and
        # /field_value_applicability_detail/claim_protocol/n03_reference_fixture.
        # Those contracts fix predicate/target/fields, not this local ref order;
        # this is not a declared global source_refs formula or an origin proof.
        participating_refs = [
            ref for ref in [value_fact.get("ref"), claim.get("subject_ref"), *claim["basis_refs"]]
            if ref is not None
        ]
        finding = {
            "code": rule_ref.rsplit("-", 1)[-1],
            "rule_ref": rule_ref,
            "subject_ref": copy.deepcopy(claim["subject_ref"]),
            "binding": copy.deepcopy(claim["binding"]),
            "axis": axis_name,
            "state": "unknown",
            "source_refs": _copy_refs_in_source_order(participating_refs),
            "reason": reason,
            "backflow_owner": owner,
        }
        findings.append(finding)
        axes.append({
            "subject_ref": copy.deepcopy(claim["subject_ref"]),
            "binding": copy.deepcopy(claim["binding"]),
            "axis": axis_name,
            "state": "unknown",
            "original_refs": _copy_refs_in_source_order(participating_refs),
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


_FN3_BACKFLOW = "HELIXBRAIN-L6-032-FN3-IDENTITY"
_IDENTITY_ACTUAL_AXES = (
    ("template.identity", "template_actual_ref", "/binding/template_ref", "/binding/template_ref"),
    ("knowledge.identity", "knowledge_actual_ref", "/binding/knowledge_ref", "/binding/knowledge_ref"),
    ("requirement.identity", "requirement_actual_ref", "/binding/requirement_ref", "/binding/requirement_ref"),
    ("oracle.identity", "oracle_actual_ref", "/binding/oracle_ref", "/binding/oracle_ref"),
    ("pack.identity", "pack_actual_ref", "/binding/pack_ref", "/binding/pack_ref"),
    ("template.version", "template_actual_revision", "/binding/template_ref/revision", "/binding/template_ref"),
    ("knowledge.revision", "knowledge_actual_revision", "/binding/knowledge_ref/revision", "/binding/knowledge_ref"),
    ("pack.revision", "pack_actual_revision", "/binding/pack_ref/revision", "/binding/pack_ref"),
    ("pack.contract_version", "pack_actual_contract_version", "/binding/pack_contract_version", "/binding/pack_ref"),
    ("pack.artifact_version", "pack_actual_artifact_version", "/binding/pack_artifact_version", "/binding/pack_ref"),
    ("knowledge.operational_state", "knowledge_actual_operational_state", "knowledge_state_selection", "/binding/knowledge_ref"),
)


def _fn3_stop(case_id: str, detail: str) -> NotImplementedError:
    return NotImplementedError(f"F04/N01/{case_id}: {detail}; Backflow {_FN3_BACKFLOW}")


def _fn3_axis(subject: Any, binding: Any, name: str, state: str, refs: list[Any], reason: str,
              owner: Any = None) -> dict[str, Any]:
    return {
        "subject_ref": copy.deepcopy(subject), "binding": copy.deepcopy(binding), "axis": name,
        "state": state, "original_refs": _copy_refs_in_source_order([r for r in refs if isinstance(r, dict)]),
        "reason": reason, "backflow_owner": owner,
    }


def _fn3_finding(code: str, subject: Any, binding: Any, axis: str, state: str,
                 source_refs: list[Any], reason: str, owner: str = "knowledge_owner") -> dict[str, Any]:
    return {
        "code": code, "rule_ref": f"HELIXBRAIN-L5-032-R-{code}",
        "subject_ref": copy.deepcopy(subject), "binding": copy.deepcopy(binding), "axis": axis,
        "state": state, "source_refs": _copy_refs_in_source_order([r for r in source_refs if isinstance(r, dict)]),
        "reason": reason, "backflow_owner": owner,
    }


def _fn3_write_predicate_axes(findings: list[dict[str, Any]], axes: list[dict[str, Any]]) -> None:
    """Append only predicate rows with no same-subject/Binding/axis read row."""
    read_axes = tuple(axes)
    for finding in findings:
        subject = finding.get("subject_ref")
        binding = finding.get("binding")
        if not isinstance(subject, dict) or not isinstance(binding, dict):
            continue
        matching_read = any(
            row.get("axis") == finding.get("axis")
            and (_json_equal(row.get("subject_ref"), subject) or _ref_same(row.get("subject_ref"), subject))
            and (_json_equal(row.get("binding"), binding) or _binding_same(row.get("binding"), binding))
            for row in read_axes
        )
        if matching_read:
            continue
        refs = [subject]
        refs.extend(ref for ref in finding.get("source_refs", []) if _wire_ref_shape_ok(ref))
        axes.append(_fn3_axis(subject, binding, finding["axis"], finding["state"], refs,
                              finding["reason"], finding.get("backflow_owner")))


def _fn3_source_rows(raw: dict[str, Any], ref: Any) -> list[tuple[int, dict[str, Any]]]:
    sources = raw.get("sources")
    if not isinstance(sources, list) or not isinstance(ref, dict):
        return []
    return [(i, s) for i, s in enumerate(sources)
            if isinstance(s, dict) and _ref_same(s.get("ref"), ref)]


def _fn3_qualification_rows(raw: dict[str, Any], ref: Any) -> list[tuple[int, dict[str, Any]]]:
    rows = raw.get("qualifications")
    if not isinstance(rows, list) or not isinstance(ref, dict):
        return []
    return [(i, q) for i, q in enumerate(rows)
            if isinstance(q, dict) and _ref_same(q.get("ref"), ref)]


def _fn3_root_rows(raw: dict[str, Any], ref: Any) -> list[tuple[int, dict[str, Any]]]:
    rows = raw.get("qualification_roots")
    if not isinstance(rows, list) or not isinstance(ref, dict):
        return []
    return [(i, root) for i, root in enumerate(rows) if isinstance(root, dict) and _ref_same(root, ref)]


def _fn3_valid_source(raw: dict[str, Any], source: dict[str, Any], unusable: list[Any]) -> bool:
    if source.get("role") != "semantic_json" or any(_json_equal(source.get("ref"), u) for u in unusable):
        return False
    return _source_qualification_ok(raw, source)


def _fn3_diag(prefix: str, material: dict[str, Any]) -> str:
    return prefix + "\n" + json.dumps(material, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


_FN3_FINDING_PREFIXES = {
    "version_missing": "当該templateの実内容版が未供給。knowledge/pack/version_targetがあってもtemplate実版ではない。",
    "source_missing": "candidate-Aのbindingで参照されたsemantic sourceが供給されていない。他候補sourceは当該sourceではない。",
    "scope_missing": "候補の適用scopeが未供給で、同名または他scopeの供給で補えない。",
    "mixed_knowledge_revision": "一項目の根拠だけが同templateのexact knowledge bindingと異なるrevisionへ結ばれている。",
    "silent_supersession": "原旧knowledge参照を異版へ付け替えたが、その旧新を結ぶ明示supersession原関係がない。",
    "oracle_revision_mismatch": "同subject/要求scopeへ束縛されたoracleの版が当該bindingのoracle版と異なる。",
    "image_identity_inference": "template意味identityのowner原根拠が未供給で、画像だけの推定claimがある。",
    "tool_node_identity_inference": "実template版のowner原根拠が未供給で、tool node IDだけの推定claimがある。",
    "filename_identity_join": "qualified原記録で異identityの二候補に、filename一致だけでsame identity claimを付けている。",
}


def _fn3_predicate_finding_reason(raw: dict[str, Any], code: str,
                                 observations: list[tuple[str, str]]) -> str:
    rule_ref = f"HELIXBRAIN-L5-032-R-{code}"
    reads = [{"locator": pointer, "original_read": _fn3_presence(raw, pointer)}
             for pointer, _role in observations]
    return _fn3_diag(_FN3_FINDING_PREFIXES[code],
                     {"code": code, "rule_ref": rule_ref, "predicate_observations": reads})


def _fn3_scope_same(left: Any, right: Any) -> bool:
    return isinstance(left, dict) and isinstance(right, dict) and _json_equal(left, right)


def _fn3_range_declaration_formed(value: Any) -> bool:
    """Project only a locally well-formed L4 RangeDeclaration carrier."""
    members = {"left_ref", "right_ref", "actual_pack_ref", "actual_contract_version",
               "actual_artifact_version", "declared_range", "relation", "reason", "owner_declarations"}
    if not isinstance(value, dict) or set(value) != members:
        return False
    if not all(_wire_ref_shape_ok(value.get(key)) for key in ("left_ref", "right_ref", "actual_pack_ref")):
        return False
    if (not isinstance(value.get("actual_contract_version"), str)
            or not isinstance(value.get("actual_artifact_version"), str)
            or value.get("relation") != "outside" or not isinstance(value.get("reason"), str)):
        return False
    declared = value.get("declared_range")
    if (not isinstance(declared, dict) or set(declared) != {"pack_contract_versions", "pack_artifact_versions"}
            or any(not isinstance(declared.get(key), list)
                   or any(not isinstance(item, str) for item in declared[key])
                   for key in ("pack_contract_versions", "pack_artifact_versions"))):
        return False
    owners = value.get("owner_declarations")
    if not isinstance(owners, list) or len(owners) != 2:
        return False
    if not all(isinstance(row, dict) and set(row) == {"endpoint_ref", "owner", "relation"}
               and _wire_ref_shape_ok(row.get("endpoint_ref"))
               and isinstance(row.get("owner"), str)
               and row["owner"] == row["endpoint_ref"].get("owner")
               and row.get("relation") == "outside" for row in owners):
        return False
    return (sum(_ref_same(row["endpoint_ref"], value["left_ref"]) for row in owners) == 1
            and sum(_ref_same(row["endpoint_ref"], value["right_ref"]) for row in owners) == 1)


def _fn3_left_owner_body_formed(value: Any) -> bool:
    """Project only one of the two closed L4 LeftOwnerSourceBody branches."""
    common = {"compatible_refs", "compatible", "compatibility_record_ref",
              "counterpart_source_ref", "endpoint_owner_declaration"}
    if not isinstance(value, dict) or type(value.get("compatible")) is not bool:
        return False
    expected = common if value["compatible"] else common | {"declared_range"}
    if set(value) != expected:
        return False
    if (not isinstance(value.get("compatible_refs"), list)
            or any(not _wire_ref_shape_ok(ref) for ref in value["compatible_refs"])
            or not _wire_ref_shape_ok(value.get("compatibility_record_ref"))
            or not _wire_ref_shape_ok(value.get("counterpart_source_ref"))):
        return False
    declaration = value.get("endpoint_owner_declaration")
    declaration_fields = {"endpoint", "endpoint_ref", "owner", "compatible",
                          "range_relation", "range_reason"}
    if (not isinstance(declaration, dict) or set(declaration) != declaration_fields
            or declaration.get("endpoint") != "left"
            or not _wire_ref_shape_ok(declaration.get("endpoint_ref"))
            or not isinstance(declaration.get("owner"), str)
            or type(declaration.get("compatible")) is not bool
            or not isinstance(declaration.get("range_relation"), str)
            or declaration.get("range_relation") not in {"outside", "not_supplied"}
            or (declaration.get("range_reason") is not None
                and not isinstance(declaration.get("range_reason"), str))):
        return False
    if not value["compatible"]:
        declared = value.get("declared_range")
        if (not isinstance(declared, dict)
                or set(declared) != {"pack_contract_versions", "pack_artifact_versions"}
                or any(not isinstance(declared.get(key), list)
                       or any(not isinstance(item, str) for item in declared[key])
                       for key in ("pack_contract_versions", "pack_artifact_versions"))):
            return False
    return True


def _fn3_resolve_pointer(root: Any, pointer: str) -> tuple[bool, Any]:
    if pointer in {"", "/"}:
        return True, root
    if not isinstance(pointer, str) or not pointer.startswith("/"):
        return False, None
    current = root
    for raw_part in pointer[1:].split("/"):
        part = raw_part.replace("~1", "/").replace("~0", "~")
        if isinstance(current, dict) and part in current:
            current = current[part]
        elif isinstance(current, list) and part.isdigit() and int(part) < len(current):
            current = current[int(part)]
        else:
            return False, None
    return True, current


def _fn3_presence(root: Any, pointer: str) -> dict[str, Any]:
    present, value = _fn3_resolve_pointer(root, pointer)
    return {"presence": "supplied", "value": copy.deepcopy(value)} if present else {"presence": "absent"}


def _fn3_qualified_owner_source(raw: dict[str, Any], index: int, source: dict[str, Any],
                                unusable: list[Any]) -> bool:
    if not _fn3_valid_source(raw, source, unusable):
        return False
    qrows = _fn3_qualification_rows(raw, source.get("qualification_ref"))
    if not qrows or any(not _json_equal(q, qrows[0][1]) for _, q in qrows[1:]):
        return False
    q = qrows[0][1]
    body = q.get("qualification_body")
    roots = _fn3_root_rows(raw, q.get("root_ref"))
    return (isinstance(body, dict) and body.get("owner") == source.get("ref", {}).get("owner")
            and bool(roots) and all(root.get("owner") == source.get("ref", {}).get("owner") for _, root in roots))


def _fn3_range_rows(raw: dict[str, Any], binding: dict[str, Any], unusable: list[Any]) -> list[dict[str, Any]]:
    """Select only explicit RangeDeclaration bodies tied to the input pack identity."""
    found = []
    for index, source in enumerate(raw.get("sources", [])):
        if not isinstance(source, dict) or source.get("role") != "semantic_json":
            continue
        body = source.get("content")
        decl = body.get("compatibility_range_declaration") if isinstance(body, dict) else None
        if not _fn3_range_declaration_formed(decl):
            continue
        actual_pack = decl.get("actual_pack_ref")
        target_pack = binding.get("pack_ref")
        if not _ref_same(actual_pack, target_pack):
            continue
        owner_declarations = decl.get("owner_declarations")
        found.append({"source_index": index, "source": source, "body": body, "declaration": decl,
                      "owner_declarations": owner_declarations if isinstance(owner_declarations, list) else [],
                      "qualified": _fn3_qualified_owner_source(raw, index, source, unusable),
                      "scope_same": (_fn3_scope_same(actual_pack.get("scope"), target_pack.get("scope"))
                                     and _fn3_scope_same(source.get("ref", {}).get("scope"), target_pack.get("scope"))
                                     and _fn3_scope_same(decl.get("right_ref", {}).get("scope"), target_pack.get("scope"))),
                      "subject_same": (_ref_same(decl.get("right_ref"), target_pack)
                                       and _ref_same(decl.get("left_ref"), binding.get("template_ref")))} )
    return found

def _fn3_actual_axes(raw: dict[str, Any], binding: dict[str, Any], unusable: list[Any],
                     axes: list[dict[str, Any]], findings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Read the eleven fixed actual operands without inferring an owner from a carrier."""
    reads: list[dict[str, Any]] = []
    range_rows = _fn3_range_rows(raw, binding, unusable)
    if len(range_rows) > 1:
        raise _fn3_stop("unclosed/multiple_actual_range_sources",
                        "unclosed/multiple_finding_range_sources: multiple physical RangeDeclaration source occurrences match the input Binding")
    records = raw.get("knowledge_records")
    if not isinstance(records, list):
        records = []
    matched_records = [(i, row) for i, row in enumerate(records)
                       if isinstance(row, dict) and _ref_same(row.get("ref"), binding.get("knowledge_ref"))]
    axis_sources = {
        "pack.identity": "actual_pack_ref", "pack.revision": "actual_pack_ref/revision",
        "pack.contract_version": "actual_contract_version", "pack.artifact_version": "actual_artifact_version",
    }
    for axis_name, role, member_pointer, subject_pointer in _IDENTITY_ACTUAL_AXES:
        if axis_name == "knowledge.operational_state":
            member_pointer = (f"/knowledge_records/{matched_records[0][0]}/operational_state"
                              if len(matched_records) == 1 else "/knowledge_records")
            original_read = _fn3_presence(raw, member_pointer)
            subject = binding.get("knowledge_ref")
        else:
            original_read = _fn3_presence(raw, member_pointer)
            _, subject = _fn3_resolve_pointer(raw, subject_pointer)
        ref_axes = {"template.identity", "knowledge.identity", "requirement.identity", "oracle.identity", "pack.identity"}
        if original_read.get("presence") == "absent":
            classification = "absent"
        elif original_read.get("value") is None:
            classification = "null"
        elif axis_name in ref_axes and not isinstance(original_read.get("value"), dict):
            classification = "out_of_type"
        elif axis_name not in ref_axes and axis_name != "knowledge.operational_state" and not isinstance(original_read.get("value"), (str, dict)):
            classification = "out_of_type"
        else:
            classification = "supplied"

        observations = []
        actual_cause = None
        if axis_name in axis_sources:
            for selected in range_rows:
                decl = selected["declaration"]
                declaration_locator = f"/sources/{selected['source_index']}/content/compatibility_range_declaration"
                body_locator = declaration_locator + "/" + axis_sources[axis_name]
                actual = _fn3_presence(raw, body_locator)
                owner_rows = selected["owner_declarations"]
                owner_match = next(((oi, r) for oi, r in enumerate(owner_rows)
                                    if _ref_same(r.get("endpoint_ref"), decl.get("right_ref"))), None)
                owner_index, owner = owner_match if owner_match is not None else (None, None)
                target = (binding.get("pack_ref") if axis_name == "pack.identity"
                          else binding.get("pack_ref", {}).get("revision") if axis_name == "pack.revision"
                          else binding.get("pack_contract_version") if axis_name == "pack.contract_version"
                          else binding.get("pack_artifact_version"))
                if not selected["qualified"]:
                    relation, obs_state, actual_cause = "unestablished", "unknown", "actual_qualification_unresolved"
                elif not selected["scope_same"]:
                    relation, obs_state, actual_cause = "different", "conflict", "actual_scope_differs"
                elif not selected["subject_same"] or owner is None:
                    relation, obs_state, actual_cause = "unestablished", "unknown", "actual_owner_body_unresolved"
                elif actual.get("presence") == "absent":
                    relation, obs_state, actual_cause = "unestablished", "unknown", "actual_owner_body_unresolved"
                elif (actual.get("presence") == "supplied"
                      and not (_ref_same(actual.get("value"), target) if axis_name == "pack.identity"
                               else _json_equal(actual.get("value"), target))):
                    relation, obs_state, actual_cause = "different", "conflict", "actual_owner_body_differs"
                else:
                    relation, obs_state, actual_cause = "corresponding", "resolved", "actual_owner_body_corresponding"
                observations.append({"source_index": selected["source_index"], "body_locator": body_locator,
                                    "actual_read": actual,
                                    "owner_declaration_locator": declaration_locator + f"/owner_declarations/{owner_index}" if owner_index is not None else declaration_locator + "/owner_declarations",
                                    "owner_declaration_read": ({"presence": "supplied", "value": copy.deepcopy(owner)}
                                                                if owner is not None else {"presence": "absent"}),
                                    "relation": relation, "state": obs_state})
        # No KnowledgeRecord or claim is an actual owner declaration. Only the
        # qualified RangeDeclaration is a candidate right operand for these pack axes.
        states = [row["state"] for row in observations]
        if classification == "absent":
            state, cause, prefix = "unknown", "input_member_absent", "原値memberがabsentである。"
        elif classification == "null":
            state, cause, prefix = "unknown", "input_member_null", "原値memberが明示nullである。"
        elif classification == "out_of_type":
            state, cause, prefix = "unknown", "input_member_out_of_type", "原値memberがdeclared型外である。"
        elif "conflict" in states and "resolved" in states:
            state, cause = "conflict", "actual_owner_body_multiple_opposing"
            prefix = "同subject/fullframeへの資格済みactual本文が相反し、原出現を保持する。"
        elif actual_cause is not None:
            state = ("conflict" if actual_cause in {"actual_scope_differs", "actual_owner_body_differs"}
                     else "resolved" if actual_cause == "actual_owner_body_corresponding" else "unknown")
            cause = actual_cause
            prefix = {
                "actual_qualification_unresolved": "原actual sourceのQualification/root/owner資格が未解決である。",
                "actual_scope_differs": "原actual宣言のscopeが対象frameと異なる。",
                "actual_owner_body_unresolved": "原actual owner operandの対応が未解決である。",
                "actual_owner_body_differs": "原actual owner operandと原値が異なる。",
                "actual_owner_body_corresponding": "原値とqualified実owner本文の明示actual operandが対応する。互換適合又は実利用許可を意味しない。",
            }[cause]
        else:
            state, cause = "unknown", "actual_owner_body_unprovided"
            prefix = "原値は供給されているが独立した実owner本文のactual operandが未供給であり、当該照合はunknownに保持する。"
        pointers = []
        for row in observations:
            pointers.append(row["body_locator"])
        material = {"actual_source_pointers": pointers, "cause": cause,
                    "knowledge_ref": copy.deepcopy(binding.get("knowledge_ref")),
                    "member_pointer": member_pointer, "original_read": copy.deepcopy(original_read)}
        refs = [subject] if isinstance(subject, dict) else []
        if axis_name.startswith("knowledge."):
            for record_index, record in matched_records:
                if axis_name != "knowledge.operational_state" and isinstance(record.get("ref"), dict):
                    refs.append(record["ref"])
                if axis_name == "knowledge.operational_state":
                    if "provenance_refs" not in record:
                        raise _fn3_stop("unclosed/knowledge_provenance_absent",
                                        f"/knowledge_records/{record_index}/provenance_refs is absent")
                    provenance = record["provenance_refs"]
                    if provenance is None:
                        raise _fn3_stop("unclosed/knowledge_provenance_null",
                                        f"/knowledge_records/{record_index}/provenance_refs is null")
                    if not isinstance(provenance, list):
                        raise _fn3_stop("unclosed/knowledge_provenance_type",
                                        f"/knowledge_records/{record_index}/provenance_refs is not an array")
                    refs.extend(ref for ref in provenance if isinstance(ref, dict))
        if axis_name in axis_sources and observations:
            for row in observations:
                src = raw["sources"][row["source_index"]]
                refs.extend([src.get("ref"), src.get("qualification_ref")])
                for _, q in _fn3_qualification_rows(raw, src.get("qualification_ref")):
                    refs.append(q.get("ref"))
                    refs.extend(root for _, root in _fn3_root_rows(raw, q.get("root_ref")))
                owner_value = row.get("owner_declaration_read", {}).get("value")
                if isinstance(owner_value, dict) and isinstance(owner_value.get("endpoint_ref"), dict):
                    refs.append(owner_value["endpoint_ref"])
        reason = _fn3_diag(prefix, material)
        public_state = state
        if (axis_name == "template.version" and isinstance(subject, dict)
                and isinstance(binding, dict) and classification in {"absent", "null"}):
            public_state = "missing"
            findings.append(_fn3_finding(
                "version_missing", subject, binding, axis_name, "missing", [],
                _fn3_predicate_finding_reason(
                    raw, "version_missing", [("/binding/template_ref/revision", "template revision")]))
            )
        if not isinstance(subject, dict):
            raise _fn3_stop("unclosed/actual_subject_unformed", f"{subject_pointer} does not form a typed subject Ref")
        axes.append(_fn3_axis(subject, binding, axis_name, public_state, refs, reason))
        reads.append({"request": {"member_locator": member_pointer, "actual_role": role},
                      "original_read": copy.deepcopy(original_read), "read_classification": classification,
                      "observations": observations, "state": state, "cause": cause})

    _fn3_oracle_revision_findings(raw, binding, findings)
    return reads


def _fn3_oracle_revision_findings(raw: dict[str, Any], binding: dict[str, Any], findings: list[dict[str, Any]]) -> None:
    rows = raw.get("oracle_bindings")
    if not isinstance(rows, list):
        return
    for index, row in enumerate(rows):
        if not isinstance(row, dict):
            continue
        oracle = row.get("oracle_ref")
        target = binding.get("oracle_ref")
        if not isinstance(oracle, dict) or not isinstance(target, dict):
            continue
        target_values = []
        if isinstance(raw.get("values"), list):
            for value_index, value in enumerate(raw["values"]):
                value_binding = value.get("binding") if isinstance(value, dict) else None
                if (isinstance(value, dict) and _ref_same(row.get("subject_ref"), value.get("subject_ref"))
                        and _binding_same(value_binding, binding)
                        and _ref_same(row.get("obligation_ref"), binding.get("requirement_ref"))
                        and isinstance(value_binding, dict)
                        and _ref_same(value_binding.get("requirement_ref"), row.get("obligation_ref"))):
                    target_values.append((value_index, value))
        same_oracle_target = (
            all(oracle.get(k) is not None and target.get(k) is not None
                and _json_equal(oracle.get(k), target.get(k)) for k in ("identity", "scope", "owner"))
            and (oracle.get("sha256") is None or target.get("sha256") is None
                 or _json_equal(oracle.get("sha256"), target.get("sha256")))
        )
        if (target_values and same_oracle_target
                and isinstance(oracle.get("revision"), str) and isinstance(target.get("revision"), str)
                and oracle.get("revision") != target.get("revision")):
            subject = row.get("subject_ref")
            refs = [row.get("source_ref")] if isinstance(row.get("source_ref"), dict) else []
            rule_ref = "HELIXBRAIN-L5-032-R-oracle_revision_mismatch"
            observations = [
                {"locator": f"/oracle_bindings/{index}",
                 "original_read": {"presence": "supplied", "value": copy.deepcopy(row)}},
                {"locator": "/binding", "original_read": {"presence": "supplied", "value": copy.deepcopy(binding)}},
            ]
            observations.extend(
                {"locator": f"/values/{value_index}",
                 "original_read": {"presence": "supplied", "value": copy.deepcopy(value)}}
                for value_index, value in target_values
            )
            reason = _fn3_diag("同subject/要求scopeへ束縛されたoracleの版が当該bindingのoracle版と異なる。",
                               {"code": "oracle_revision_mismatch", "rule_ref": rule_ref,
                                "predicate_observations": observations})
            findings.append(_fn3_finding("oracle_revision_mismatch", subject, binding, "oracle.binding",
                                         "conflict", refs, reason))


def _fn3_identity_claim_candidate(raw: dict[str, Any], source_index: int, source: dict[str, Any],
                                  trace_reads: list[dict[str, Any]], unusable: list[Any]) -> dict[str, Any] | None:
    """Return a candidate only from its qualified source and same-call native trace."""
    content = source.get("content")
    source_ref = source.get("ref")
    source_binding = content.get("binding") if isinstance(content, dict) else None
    template_ref = source_binding.get("template_ref") if isinstance(source_binding, dict) else None
    if (not isinstance(source_ref, dict) or not isinstance(source_binding, dict) or not _binding_shape_ok(source_binding)
            or not isinstance(template_ref, dict) or not _fn3_valid_source(raw, source, unusable)):
        return None

    # The same private DescriptorTraceRead must show this body, its record/provenance,
    # and a fact from this qualified source under the body's own Binding.
    for read in trace_reads:
        slot_read = read.get("slot_read", {})
        fact_read = read.get("fact_read", {})
        slot = slot_read.get("value") if slot_read.get("presence") == "supplied" else None
        fact = fact_read.get("value") if fact_read.get("presence") == "supplied" else None
        slot_binding = slot.get("binding") if isinstance(slot, dict) else None
        if (read.get("state") != "resolved" or source_index not in read.get("source_indices", [])
                or not isinstance(slot_binding, dict) or not _binding_same(slot_binding, source_binding)
                or not isinstance(fact, dict) or not _ref_same(fact.get("source_ref"), source_ref)
                or not isinstance(fact.get("binding"), dict) or not _binding_same(fact["binding"], source_binding)):
            continue

        # A resolved chain must include this source's own KnowledgeRecord provenance,
        # not just an unrelated resolved source elsewhere in the same snapshot.
        record_by_index = {}
        for row in read.get("knowledge_records", []):
            if not isinstance(row, dict) or not isinstance(row.get("index"), int):
                continue
            original = row.get("original_read", {}).get("value")
            if isinstance(original, dict) and _ref_same(original.get("ref"), source_binding.get("knowledge_ref")):
                record_by_index[row["index"]] = original
        provenance_linked = any(
            isinstance(row, dict) and row.get("relation") == "corresponding"
            and row.get("knowledge_record_index") in record_by_index
            and _ref_same(row.get("original_read", {}).get("value"), source_ref)
            for row in read.get("provenance_refs", [])
        )
        if not provenance_linked:
            continue

        # Tie the public fact back to a fact inside this source's native descriptor group.
        groups = content.get("descriptor_facts")
        if not isinstance(groups, list):
            continue
        for group_index, group in enumerate(groups):
            if not isinstance(group, dict) or not isinstance(group.get("facts"), list):
                continue
            group_locator = f"/sources/{source_index}/content/descriptor_facts/{group_index}"
            if not any(row.get("locator") == group_locator for row in read.get("body_groups", []) if isinstance(row, dict)):
                continue
            for fact_index, original_fact in enumerate(group["facts"]):
                if not isinstance(original_fact, dict):
                    continue
                public_fact_body = copy.deepcopy(fact)
                owner_fact_body = copy.deepcopy(original_fact)
                public_fact_body.pop("source_ref", None)
                owner_fact_body.pop("source_ref", None)
                if (_ref_same(original_fact.get("ref"), fact.get("ref"))
                        and _ref_same(original_fact.get("source_ref"), source_ref)
                        and isinstance(original_fact.get("binding"), dict)
                        and _binding_same(original_fact["binding"], source_binding)
                        and _json_equal(owner_fact_body, public_fact_body)):
                    qualification_ref = source.get("qualification_ref")
                    qualification_rows = _fn3_qualification_rows(raw, qualification_ref)
                    root_rows = []
                    for _qi, qualification in qualification_rows:
                        if _ref_same(qualification.get("subject_ref"), source_ref):
                            root_rows.extend(_fn3_root_rows(raw, qualification.get("root_ref")))
                    if not qualification_rows or not root_rows:
                        continue
                    return {
                        "source_index": source_index, "source": source, "template_ref": template_ref,
                        "binding": source_binding, "trace_read": read,
                        "fact_locator": f"{group_locator}/facts/{fact_index}",
                        "qualification_indices": [i for i, _ in qualification_rows],
                        "root_indices": [i for i, _ in root_rows],
                        "record_indices": sorted(record_by_index),
                    }
    return None


def _fn3_identity_claim_findings(raw: dict[str, Any], binding: dict[str, Any], unusable: list[Any],
                                 findings: list[dict[str, Any]], trace_reads: list[dict[str, Any]]) -> None:
    claims, slots = raw.get("claims"), raw.get("descriptors")
    if not isinstance(claims, list) or not isinstance(slots, list):
        return
    for ci, claim in enumerate(claims):
        if not isinstance(claim, dict):
            raise _fn3_stop("unclosed/identity_claim", f"/claims/{ci} is not a decoded Claim")
        if claim.get("kind") not in {"same_template_identity", "template_identity", "template_version"}:
            raise _fn3_stop("unclosed/identity_claim", f"/claims/{ci}/kind is outside the fixed identity-claim branches")
        claim_subject = claim.get("subject_ref")
        claim_binding = claim.get("binding")
        if not _ref_shape_ok(claim_subject) or not _binding_shape_ok(claim_binding):
            raise _fn3_stop("unclosed/identity_claim", f"/claims/{ci} lacks a typed subject Ref or complete original Binding")
        proposed = claim.get("proposed_value")
        if (claim.get("kind") == "template_version"
                and _json_equal(proposed, binding.get("version_target"))):
            raise _fn3_stop("F04-NEG-10/unclosed/version_target_as_actual",
                            f"F04-NEG-10/unclosed/version_target_as_actual at /claims/{ci}")
        if not isinstance(proposed, dict):
            raise _fn3_stop("unclosed/identity_claim", f"/claims/{ci}/proposed_value is not an object")

        # R66 is a single frozen predicate: a root-A claim uses two original
        # qualified candidates, one from the root Binding and one from an explicit slot.
        # Filename is only the raw source locator; candidate identity comes from each
        # candidate's own Binding.template_ref.
        basis = claim.get("basis_refs")
        if claim.get("kind") == "same_template_identity" and proposed.get("same_filename") is not True:
            continue
        if (claim.get("kind") == "same_template_identity" and proposed.get("same_filename") is True
                and isinstance(basis, list) and len(basis) == 2
                and isinstance(claim_binding, dict)):
            candidates = []
            complete = True
            for basis_index, basis_ref in enumerate(basis):
                matching = _fn3_source_rows(raw, basis_ref)
                # A nullable digest cannot pick a winning physical source occurrence.
                if len(matching) != 1:
                    complete = False
                    break
                source_index, source = matching[0]
                candidate = _fn3_identity_claim_candidate(raw, source_index, source, trace_reads, unusable)
                if candidate is None or not isinstance(source.get("ref", {}).get("source_locator"), str):
                    complete = False
                    break
                candidate["basis_index"] = basis_index
                candidates.append(candidate)
            if complete and len({c["source_index"] for c in candidates}) == 2:
                candidates.sort(key=lambda c: c["source_index"])
                first, second = candidates
                same_filename = (first["source"]["ref"].get("source_locator")
                                 == second["source"]["ref"].get("source_locator"))
                distinct_identity = (first["template_ref"].get("identity") is not None
                                     and second["template_ref"].get("identity") is not None
                                     and not _json_equal(first["template_ref"].get("identity"),
                                                         second["template_ref"].get("identity")))
                if same_filename and distinct_identity:
                    observations = [
                        {"locator": f"/claims/{ci}/kind", "original_read": _fn3_presence(raw, f"/claims/{ci}/kind")},
                        {"locator": f"/claims/{ci}/proposed_value/same_filename",
                         "original_read": _fn3_presence(raw, f"/claims/{ci}/proposed_value/same_filename")},
                        {"locator": f"/claims/{ci}/subject_ref",
                         "original_read": _fn3_presence(raw, f"/claims/{ci}/subject_ref")},
                    ]
                    for candidate in candidates:
                        si = candidate["source_index"]
                        observations.extend([
                            {"locator": f"/claims/{ci}/basis_refs/{candidate['basis_index']}",
                             "original_read": _fn3_presence(raw, f"/claims/{ci}/basis_refs/{candidate['basis_index']}")},
                            {"locator": f"/sources/{si}/ref/source_locator",
                             "original_read": _fn3_presence(raw, f"/sources/{si}/ref/source_locator")},
                            {"locator": f"/sources/{si}/content/binding/template_ref",
                             "original_read": _fn3_presence(raw, f"/sources/{si}/content/binding/template_ref")},
                            {"locator": candidate["fact_locator"],
                             "original_read": _fn3_presence(raw, candidate["fact_locator"])},
                        ])
                        for qi in candidate["qualification_indices"]:
                            observations.append({"locator": f"/qualifications/{qi}",
                                                 "original_read": _fn3_presence(raw, f"/qualifications/{qi}")})
                        for ri in candidate["root_indices"]:
                            observations.append({"locator": f"/qualification_roots/{ri}",
                                                 "original_read": _fn3_presence(raw, f"/qualification_roots/{ri}")})
                        for ri in candidate["record_indices"]:
                            observations.append({"locator": f"/knowledge_records/{ri}/provenance_refs",
                                                 "original_read": _fn3_presence(raw, f"/knowledge_records/{ri}/provenance_refs")})
                    rule_ref = "HELIXBRAIN-L5-032-R-filename_identity_join"
                    reason = _fn3_diag(_FN3_FINDING_PREFIXES["filename_identity_join"],
                                       {"code": "filename_identity_join", "rule_ref": rule_ref,
                                        "predicate_observations": observations})
                    findings.append(_fn3_finding("filename_identity_join", claim["subject_ref"], claim_binding,
                                                 "identity_claim", "conflict",
                                                 [c["source"]["ref"] for c in candidates], reason))

        if claim.get("kind") == "same_template_identity":
            continue
        basis_role = proposed.get("basis_role")
        mapping = {"image_only": ("template_identity", "image_identity_inference", "template.identity"),
                   "tool_node_only": ("template_version", "tool_node_identity_inference", "template.version")}
        if basis_role == "semantic_json" and claim.get("kind") == "template_identity":
            continue
        if basis_role not in mapping:
            raise _fn3_stop("unclosed/identity_claim", f"/claims/{ci}/proposed_value/basis_role is outside the fixed identity predicates")
        if claim.get("kind") != mapping[basis_role][0]:
            raise _fn3_stop("unclosed/identity_claim", f"/claims/{ci}/kind and basis_role do not form a fixed identity predicate")
        basis = claim.get("basis_refs")
        if not isinstance(basis, list) or not basis:
            raise _fn3_stop("unclosed/identity_claim", f"/claims/{ci}/basis_refs is absent, null, or empty")
        if any(not _ref_shape_ok(ref) for ref in basis):
            raise _fn3_stop("unclosed/identity_claim", f"/claims/{ci}/basis_refs contains an unformed Ref")
        participating = []
        sources = raw.get("sources")
        if not isinstance(sources, list):
            raise _fn3_stop("unclosed/identity_claim", f"/claims/{ci} source witness collection is not an array")
        for source in sources:
            if not isinstance(source, dict) or not _ref_shape_ok(source.get("ref")):
                continue
            if any(_ref_same(source["ref"], basis_ref) for basis_ref in basis):
                participating.append(copy.deepcopy(source["ref"]))
        predicate_observations = [
            (f"/claims/{ci}/kind", "claim kind"),
            (f"/claims/{ci}/proposed_value/basis_role", "claim basis role"),
            (f"/claims/{ci}/subject_ref", "claim subject"),
            (f"/claims/{ci}/binding", "claim Binding"),
        ]
        for basis_index, ref in enumerate(basis):
            predicate_observations.append((f"/claims/{ci}/basis_refs/{basis_index}", "claim basis Ref"))
            matches = _fn3_source_rows(raw, ref)
            for source_index, source in matches:
                if not isinstance(source.get("ref"), dict):
                    continue
                predicate_observations.append((f"/sources/{source_index}/ref", "basis source Ref occurrence"))
        _kind, code, axis = mapping[basis_role]
        reason = _fn3_predicate_finding_reason(raw, code, predicate_observations)
        findings.append(_fn3_finding(code, claim_subject, claim_binding, axis, "unknown", participating, reason))

def _fn3_trace(raw: dict[str, Any], binding: dict[str, Any], unusable: list[Any],
               axes: list[dict[str, Any]], findings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Resolve only direct slot/fact/record/provenance/source/body/Q/root links."""
    reads: list[dict[str, Any]] = []
    slots = raw.get("descriptors")
    records = raw.get("knowledge_records")
    if not isinstance(slots, list):
        raise _fn3_stop("unclosed/descriptor_slots_absent", "descriptor slot collection is absent or not an array")
    if not isinstance(records, list):
        raise _fn3_stop("unclosed/knowledge_records_absent", "knowledge_records collection is absent or not an array")
    if not isinstance(raw.get("claims", []), list):
        raise _fn3_stop("unclosed/identity_claim", "claims is not an array")
    sources = raw.get("sources") if isinstance(raw.get("sources"), list) else []
    for si, slot in enumerate(slots):
        if not isinstance(slot, dict) or not isinstance(slot.get("facts"), list):
            continue
        slot_binding = slot.get("binding")
        if "binding" not in slot:
            raise _fn3_stop("unclosed/slot_binding_absent", f"/descriptors/{si}/binding is absent or not an object")
        if not _wire_binding_shape_ok(slot_binding):
            raise _fn3_stop("unclosed/slot_binding_unformed", f"/descriptors/{si}/binding is outside the closed wire Binding shape")
        for fi, fact in enumerate(slot["facts"]):
            if not isinstance(fact, dict):
                continue
            locator = f"/descriptors/{si}/facts/{fi}"
            if not _wire_ref_shape_ok(fact.get("ref")):
                raise _fn3_stop("unclosed/fact_subject_unformed", f"{locator}/ref does not form a wire Ref")
            if ("source_ref" in fact and fact["source_ref"] is not None
                    and not _wire_ref_shape_ok(fact["source_ref"])):
                raise _fn3_stop("unclosed/fact_source_ref_unformed", f"{locator}/source_ref does not form a wire Ref")
            slot_locator = f"/descriptors/{si}"
            slot_kref = slot_binding.get("knowledge_ref")
            fact_binding = fact.get("binding") if isinstance(fact.get("binding"), dict) else {}
            fact_kref = fact_binding.get("knowledge_ref")
            fact_source_ref = fact.get("source_ref")
            source_ref_joinable = (
                _wire_ref_shape_ok(fact_source_ref)
                and all(fact_source_ref.get(key) is not None for key in ("identity", "revision", "scope", "owner"))
            )
            if not isinstance(slot_kref, dict) or slot_kref.get("revision") is None:
                raise _fn3_stop("F04-NEG-02/revision_absent", "trace slot knowledge Ref lacks a supplied revision")
            record_candidates = [(ri, rec) for ri, rec in enumerate(records)
                                 if isinstance(rec, dict) and _ref_same(rec.get("ref"), slot_kref)]
            if len(record_candidates) > 1 and any(
                    not _json_equal(record_candidates[0][1], candidate[1])
                    for candidate in record_candidates[1:]):
                raise _fn3_stop("unclosed/distinct_knowledge_records",
                                f"multiple distinct KnowledgeRecords match {slot_locator}/binding/knowledge_ref")
            record_reads = [{"index": ri, "locator": f"/knowledge_records/{ri}",
                             "original_read": {"presence": "supplied", "value": copy.deepcopy(rec)}}
                            for ri, rec in record_candidates]
            prov_rows: list[dict[str, Any]] = []
            source_indices: list[int] = []
            body_groups: list[dict[str, Any]] = []
            chains: list[dict[str, Any]] = []
            any_source = False
            any_qualified = False
            any_body = False
            for ri, rec in record_candidates:
                if "provenance_refs" not in rec:
                    raise _fn3_stop("unclosed/knowledge_provenance_absent",
                                    f"/knowledge_records/{ri}/provenance_refs is absent")
                provs = rec["provenance_refs"]
                if provs is None:
                    raise _fn3_stop("unclosed/knowledge_provenance_null",
                                    f"/knowledge_records/{ri}/provenance_refs is null")
                if not isinstance(provs, list):
                    raise _fn3_stop("unclosed/knowledge_provenance_type",
                                    f"/knowledge_records/{ri}/provenance_refs is not an array")
                for pi, pref in enumerate(provs):
                    matching_sources = [(idx, src) for idx, src in enumerate(sources)
                                        if isinstance(src, dict) and _ref_same(src.get("ref"), pref)]
                    provrow = {"knowledge_record_index": ri, "provenance_index": pi,
                               "locator": f"/knowledge_records/{ri}/provenance_refs/{pi}",
                               "original_read": {"presence": "supplied", "value": copy.deepcopy(pref)},
                               "relation": "corresponding" if matching_sources else "unestablished"}
                    prov_rows.append(provrow)
                    for source_index, source in matching_sources:
                        any_source = True
                        if source_index not in source_indices:
                            source_indices.append(source_index)
                        content = source.get("content")
                        if not _fn3_qualified_owner_source(raw, source_index, source, unusable):
                            continue
                        any_qualified = True
                        if not isinstance(content, dict) or not _binding_same(content.get("binding"), slot_binding):
                            continue
                        groups = content.get("descriptor_facts")
                        if not isinstance(groups, list):
                            continue
                        for gi, group in enumerate(groups):
                            if not isinstance(group, dict) or not isinstance(group.get("facts"), list):
                                continue
                            gloc = f"/sources/{source_index}/content/descriptor_facts/{gi}"
                            if not any(x.get("locator") == gloc for x in body_groups):
                                body_groups.append({"index": source_index, "locator": gloc,
                                                    "original_read": {"presence": "supplied", "value": copy.deepcopy(group)}})
                            for inner_index, inner_fact in enumerate(group["facts"]):
                                if not isinstance(inner_fact, dict):
                                    continue
                                if not _ref_same(inner_fact.get("ref"), fact.get("ref")):
                                    continue
                                any_body = True
                                # Each relation is a direct comparison; no null-digest intermediary is reused.
                                if not _ref_same(inner_fact.get("source_ref"), source.get("ref")):
                                    continue
                                if not _ref_same(fact.get("source_ref"), source.get("ref")):
                                    continue
                                if not _binding_same(fact_binding, slot_binding):
                                    continue
                                if not _binding_same(inner_fact.get("binding"), slot_binding):
                                    continue
                                if not _ref_same(fact_kref, rec.get("ref")):
                                    continue
                                qref = source.get("qualification_ref")
                                for qi, qual in _fn3_qualification_rows(raw, qref):
                                    if not _ref_same(qual.get("subject_ref"), source.get("ref")):
                                        continue
                                    if not _fn3_valid_source(raw, source, unusable):
                                        continue
                                    roots = _fn3_root_rows(raw, qual.get("root_ref"))
                                    for root_index, root in roots:
                                        chains.append({"knowledge_record_index": ri, "provenance_index": pi,
                                                       "source_index": source_index, "qualification_index": qi,
                                                       "root_index": root_index, "record": rec, "provenance": pref,
                                                       "source": source, "qualification": qual, "root": root,
                                                       "body_group_index": gi, "inner_fact_index": inner_index})
            fact_mixed = (isinstance(fact_kref, dict) and isinstance(slot_kref, dict)
                          and all(fact_kref.get(k) is not None and slot_kref.get(k) is not None
                                  and _json_equal(fact_kref.get(k), slot_kref.get(k)) for k in ("identity", "scope", "owner"))
                          and not _json_equal(fact_kref.get("revision"), slot_kref.get("revision")))
            # Preserve all physically distinct chain rows in source order; repeated Qs remain
            # occurrences, while a shared physical source/root is listed once in its read column.
            slot_scope = slot_binding.get("template_ref", {}).get("scope") if isinstance(slot_binding.get("template_ref"), dict) else None
            for chain in chains:
                if not _fn3_scope_same(chain["source"].get("ref", {}).get("scope"), slot_scope):
                    chain["scope_mismatch"] = True
            state = "resolved" if chains else "unknown"
            cause = "original_trace_corresponding" if chains else (
                "knowledge_unresolved" if not record_candidates else
                "source_unresolved" if not source_ref_joinable or not any_source else "qualification_unresolved" if not any_qualified
                else "body_unresolved" if not any_body else "knowledge_unresolved")
            if fact_mixed:
                state, cause = "conflict", "mixed_knowledge_revision"
                mixed_observations = [
                    (locator + "/binding/knowledge_ref", "fact knowledge Ref"),
                    (slot_locator + "/binding/knowledge_ref", "slot knowledge Ref"),
                ]
                findings.append(_fn3_finding("mixed_knowledge_revision", fact.get("ref"), slot_binding,
                                             "descriptor.trace", "conflict", [fact.get("source_ref")] if isinstance(fact.get("source_ref"), dict) else [],
                                             _fn3_predicate_finding_reason(raw, "mixed_knowledge_revision",
                                                                           mixed_observations)))
            if (source_ref_joinable and not any(_ref_same(src.get("ref"), fact_source_ref)
                                                for src in sources if isinstance(src, dict))):
                source_observations = [("/sources", "source collection presence"),
                                       (locator + "/source_ref", "fact source Ref")]
                source_observations.extend((f"/sources/{source_index}/ref", "supplied source Ref")
                                           for source_index, source in enumerate(sources)
                                           if isinstance(source, dict) and isinstance(source.get("ref"), dict))
                findings.append(_fn3_finding("source_missing", binding.get("template_ref"), binding, "source", "missing",
                                             [fact_source_ref],
                                             _fn3_predicate_finding_reason(raw, "source_missing", source_observations)))
            if isinstance(fact_kref, dict) and isinstance(slot_kref, dict) and not _ref_same(fact_kref, slot_kref):
                current = binding.get("knowledge_ref")
                old_records = [(idx, rec) for idx, rec in record_candidates if _ref_same(rec.get("ref"), slot_kref)]
                superseded = any(isinstance(rel, dict) and rel.get("kind") == "supersedes"
                                 and any(_ref_same(rel.get("from_ref"), rec.get("ref")) for _, rec in old_records)
                                 and _ref_same(rel.get("to_ref"), fact_kref)
                                 for rel in raw.get("relations", []) if isinstance(raw.get("relations"), list))
                if old_records and not superseded:
                    state, cause = "conflict", "mixed_knowledge_revision"
                    silent_observations = [
                        (locator + "/binding/knowledge_ref", "new fact knowledge Ref"),
                        (slot_locator + "/binding/knowledge_ref", "original slot knowledge Ref"),
                    ]
                    silent_observations.extend((f"/knowledge_records/{old_index}/ref", "original KnowledgeRecord Ref")
                                               for old_index, _old_record in old_records)
                    relations = raw.get("relations")
                    if isinstance(relations, list) and relations:
                        silent_observations.extend((f"/relations/{relation_index}", "original relation occurrence")
                                                   for relation_index, _relation in enumerate(relations))
                    else:
                        silent_observations.append(("/relations", "relation collection presence"))
                    findings.append(_fn3_finding("silent_supersession", fact.get("ref"), slot_binding,
                                                 "descriptor.trace", "conflict", [fact.get("source_ref")] if isinstance(fact.get("source_ref"), dict) else [],
                                                 _fn3_predicate_finding_reason(raw, "silent_supersession",
                                                                               silent_observations)))
            if any(c.get("scope_mismatch") for c in chains):
                state, cause = "conflict", "scope_differs"
            # Build the fixed 9-key per-chain trace material.
            chain_material = [{"descriptor_kind": slot.get("descriptor_kind"), "fact_locator": locator,
                               "knowledge_record_index": c["knowledge_record_index"],
                               "provenance_index": c["provenance_index"],
                               "qualification_index": c["qualification_index"], "root_index": c["root_index"],
                               "slot_identity": slot.get("slot_identity"), "slot_locator": slot_locator,
                               "source_index": c["source_index"]} for c in chains]
            if len(chain_material) == 1:
                material = chain_material[0]
            elif chain_material:
                material = {"trace_occurrences": chain_material}
            else:
                material = {"cause": cause, "request": {"slot_locator": slot_locator, "fact_locator": locator},
                            "state": state, "slot_presence": "supplied", "slot_is_null": False,
                            "fact_presence": "supplied", "fact_is_null": False,
                            "knowledge_record_indices": [i for i, _ in record_candidates],
                            "provenance_indices": [{"knowledge_record_index": p["knowledge_record_index"],
                                                     "provenance_index": p["provenance_index"]} for p in prov_rows],
                            "source_indices": sorted(source_indices),
                            "body_group_locators": [g["locator"] for g in body_groups]}
            reason_prefix = ("原slot/fact/source/provenance/資格frameの対応を保持する。意味完成又は利用許可ではない。"
                             if chains else cause)
            reason = _fn3_diag(reason_prefix, material)
            refs = [fact.get("ref"), fact.get("source_ref"), slot_kref]
            for c in chains:
                refs.extend([c["record"].get("ref"), c["provenance"], c["source"].get("ref"),
                             c["source"].get("qualification_ref"), c["qualification"].get("ref"), c["root"]])
            axis_refs = [r for r in refs if isinstance(r, dict)]
            axes.append(_fn3_axis(fact.get("ref"), slot_binding, "descriptor.trace", state, axis_refs, reason, None))
            reads.append({"request": {"slot_locator": slot_locator, "fact_locator": locator},
                          "slot_read": {"presence": "supplied", "value": copy.deepcopy(slot)},
                          "fact_read": {"presence": "supplied", "value": copy.deepcopy(fact)},
                          "knowledge_records": record_reads, "provenance_refs": prov_rows,
                          "source_indices": sorted(source_indices), "body_groups": body_groups,
                          "state": state, "cause": cause})
    return reads

def _fn3_owner_source(raw: dict[str, Any], candidate_ref: Any, unusable: list[Any], record_ref: Any,
                      counterpart: Any = None) -> list[tuple[int, dict[str, Any], dict[str, Any]]]:
    found = []
    for index, source in enumerate(raw.get("sources", [])):
        if not isinstance(source, dict) or source.get("role") != "semantic_json" or not _fn3_qualified_owner_source(raw, index, source, unusable):
            continue
        body = source.get("content")
        if not isinstance(body, dict):
            continue
        if record_ref is not None and not _ref_same(body.get("compatibility_record_ref"), record_ref):
            continue
        if counterpart is not None and not _ref_same(body.get("counterpart_source_ref"), counterpart):
            continue
        found.append((index, source, body))
    return found


def _fn3_endpoint_owner_reads(raw: dict[str, Any], record: dict[str, Any], unusable: list[Any],
                              endpoint: str, direct_sources: list[tuple[int, dict[str, Any]]] | None = None) -> list[dict[str, Any]]:
    """Construct the closed endpoint read from original source occurrences."""
    target = record.get("left_ref" if endpoint == "left" else "right_ref")
    if direct_sources is None:
        if endpoint == "right":
            direct_sources = _fn3_source_rows(raw, record.get("source_ref"))
        else:
            direct_sources = [(i, s) for i, s, _body in _fn3_owner_source(
                raw, target, unusable, record.get("ref"), record.get("source_ref"))]
    rows = []
    for source_index, source in direct_sources:
        body = source.get("content") if isinstance(source, dict) else None
        source_ref = source.get("ref") if isinstance(source, dict) else None
        scope = source_ref.get("scope") if isinstance(source_ref, dict) else None
        target_scope = raw.get("binding", {}).get("template_ref", {}).get("scope")
        relation = "same" if _fn3_scope_same(scope, target_scope) else ("different" if scope is not None and target_scope is not None else "unobserved")
        container = body.get("compatible_refs") if isinstance(body, dict) else None
        occurrences = []
        matches = []
        if isinstance(container, list):
            for ref_index, ref in enumerate(container):
                relation_to_target = "corresponding" if _ref_same(ref, target) else "different"
                if relation_to_target == "corresponding":
                    matches.append(ref_index)
                occurrences.append({
                    "ref_index": ref_index,
                    "locator": f"/sources/{source_index}/content/compatible_refs/{ref_index}",
                    "original_read": {"presence": "supplied", "value": copy.deepcopy(ref)},
                    "read_classification": "supplied" if isinstance(ref, dict) else "out_of_type",
                    "full_ref_relation": relation_to_target if isinstance(ref, dict) else "unestablished",
                })
            member_cause = "matching_refs" if matches else "member_no_match"
            member_state = "resolved" if matches else "unknown"
        else:
            member_state = "unknown"
            if "compatible_refs" not in body if isinstance(body, dict) else True:
                member_cause = "container_absent"
                container_read = {"presence": "absent"}
            elif container is None:
                member_cause = "container_null"
                container_read = {"presence": "supplied", "value": None}
            else:
                member_cause = "container_type"
                container_read = {"presence": "supplied", "value": copy.deepcopy(container)}
        if isinstance(container, list):
            container_read = {"presence": "supplied", "value": copy.deepcopy(container)}
        body_read = {"presence": "supplied", "value": copy.deepcopy(body)} if isinstance(body, dict) else {"presence": "absent"}
        declaration = body.get("endpoint_owner_declaration") if isinstance(body, dict) else None
        if endpoint == "left":
            declaration_ok = (_fn3_left_owner_body_formed(body)
                              and isinstance(declaration, dict) and declaration.get("endpoint") == "left"
                              and _ref_same(declaration.get("endpoint_ref"), target)
                              and declaration.get("owner") == (target.get("owner") if isinstance(target, dict) else None)
                              and _ref_same(body.get("compatibility_record_ref"), record.get("ref"))
                              and _ref_same(body.get("counterpart_source_ref"), record.get("source_ref")))
        else:
            declaration = body.get("compatibility_range_declaration") if isinstance(body, dict) else None
            declaration_ok = (_fn3_range_declaration_formed(declaration)
                              and _ref_same(declaration.get("right_ref"), target)
                              and _ref_same(declaration.get("actual_pack_ref"), target))
        membership = {
            "source_index": source_index,
            "endpoint_locator": "/binding/" + ("template_ref" if endpoint == "left" else "pack_ref"),
            "endpoint_read": {"presence": "supplied", "value": copy.deepcopy(target)},
            "container_read": container_read,
            "occurrences": occurrences, "matching_ref_indices": matches,
            "state": member_state, "cause": member_cause,
            "meaning_limit": "raw_endpoint_ref_membership_only",
        }
        record_ref_read = ({"presence": "supplied", "value": copy.deepcopy(body["compatibility_record_ref"])}
                           if isinstance(body, dict) and "compatibility_record_ref" in body
                           else {"presence": "absent"})
        counterpart_read = ({"presence": "supplied", "value": copy.deepcopy(body["counterpart_source_ref"])}
                             if isinstance(body, dict) and "counterpart_source_ref" in body
                             else {"presence": "absent"})
        rows.append({
            "endpoint": endpoint, "source_index": source_index, "membership": membership,
            "body_read": body_read, "record_ref_read": record_ref_read,
            "counterpart_source_ref_read": counterpart_read,
            "target_scope_relation": relation,
            "state": "resolved" if declaration_ok and _fn3_valid_source(raw, source, unusable) else "unknown",
            "cause": "owner_body_corresponding" if declaration_ok and _fn3_valid_source(raw, source, unusable)
                    else "owner_decision_unresolved" if _fn3_valid_source(raw, source, unusable)
                    else "owner_qualification_unresolved",
        })
    return rows



def _fn3_source_reference_block(raw: dict[str, Any], refs: list[Any]) -> tuple[list[int], list[dict[str, Any]]]:
    indices = sorted({index for ref in refs if isinstance(ref, dict) for index, _ in _fn3_source_rows(raw, ref)})
    projected: list[dict[str, Any]] = []
    for index in indices:
        source = raw["sources"][index]
        projected.append(source["ref"])
        if isinstance(source.get("qualification_ref"), dict):
            projected.append(source["qualification_ref"])
        for _qi, qualification in _fn3_qualification_rows(raw, source.get("qualification_ref")):
            if isinstance(qualification.get("ref"), dict):
                projected.append(qualification["ref"])
            projected.extend(root for _ri, root in _fn3_root_rows(raw, qualification.get("root_ref")))
    return indices, projected


def _fn3_compatibility_finding_reason(raw: dict[str, Any], binding: dict[str, Any],
                                     outcome: dict[str, Any], record_index: int,
                                     code: str) -> str:
    record = outcome["record"]
    used_refs = outcome.get("sources", [])
    used_sources = [(i, source) for i, source in enumerate(raw.get("sources", []))
                    if isinstance(source, dict)
                    and any(_ref_same(source.get("ref"), ref) for ref in used_refs)]
    left_indices = [i for i, source in used_sources
                    if isinstance(source.get("content"), dict)
                    and _ref_same(source["content"].get("compatibility_record_ref"), record.get("ref"))
                    and _ref_same(source["content"].get("counterpart_source_ref"), record.get("source_ref"))]
    source_matches = _fn3_source_rows(raw, record.get("source_ref"))
    right_indices = [i for i, source in source_matches
                     if any(_ref_same(source.get("ref"), ref) for ref in used_refs)]
    right_source = next((source for _i, source in source_matches
                         if any(_ref_same(source.get("ref"), ref) for ref in used_refs)), None)
    range_relation = "not_supplied"
    if isinstance(right_source, dict) and isinstance(right_source.get("content"), dict):
        declaration = right_source["content"].get("compatibility_range_declaration")
        if isinstance(declaration, dict) and "relation" in declaration:
            range_relation = declaration["relation"]
    if outcome.get("cause") == "outside":
        prefix = "同scope明示pairについて独立template-owner本文とpack-owner本文が当該実版範囲外を明示する。"
    elif outcome.get("cause") == "opposing":
        prefix = "同scope同明示pairのqualified原宣言が相反する。両原宣言を保持する。"
    elif outcome.get("cause") == "null":
        prefix = "明示pairのsource_refは明示nullでowner互換根拠を解決できない。"
    else:
        prefix = "右pack-owner原宣言は存在するが独立template-owner本文が未供給であり当該pair互換照合はunknownに保持する。"
    material = {
        "bilateral_read_index": record_index,
        "left_owner_source_indices": left_indices,
        "original_record_reason": record.get("reason"),
        "range_relation": range_relation,
        "record_compatible": record.get("compatible"),
        "record_index": record_index,
        "right_owner_source_indices": right_indices,
        "source_ref": copy.deepcopy(record.get("source_ref")),
        "source_scope": copy.deepcopy(right_source.get("ref", {}).get("scope")) if right_source else None,
        "target_scope": copy.deepcopy(binding.get("template_ref", {}).get("scope")),
    }
    return _fn3_diag(prefix, material)

def _fn3_compatibility(raw: dict[str, Any], binding: dict[str, Any], unusable: list[Any],
                       axes: list[dict[str, Any]], findings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    result_reads = []
    records = raw.get("compatibility_records", [])
    if not isinstance(records, list):
        return result_reads
    outcomes: list[dict[str, Any]] = []
    for index, record in enumerate(records):
        if not isinstance(record, dict):
            raise _fn3_stop("unclosed/cause_to_finding_mapping", "compatibility record is not a decoded object")
        if record.get("compatible") is None:
            raise _fn3_stop("unclosed/cause_to_finding_mapping", "compatibility cause has no frozen Finding mapping")
        if record.get("source_ref", object()) is None:
            reason = _fn3_diag("明示pairのsource_refは明示nullでowner互換根拠を解決できない。", {
                "cause": "null", "record_index": index, "record_state": "unknown", "original_record_reason": record.get("reason")})
            outcomes.append({"record": record, "state": "unknown", "cause": "null", "reason": reason,
                             "refs": [record.get("ref"), record.get("left_ref"), record.get("right_ref")], "sources": []})
            continue
        right_rows = _fn3_source_rows(raw, record.get("source_ref"))
        if len(right_rows) > 1:
            raise _fn3_stop("unclosed/multiple_finding_range_sources", "multiple physical source occurrences match a Finding range record")
        right = right_rows[0] if right_rows else None
        lefts = _fn3_owner_source(raw, record.get("left_ref"), unusable, record.get("ref"),
                                 record.get("source_ref"))
        if len(lefts) > 1:
            raise _fn3_stop("unclosed/multiple_finding_range_sources", "multiple left owner source occurrences match the record")
        if right is None or not _fn3_valid_source(raw, right[1], unusable):
            raise _fn3_stop("unclosed/right_owner_unprovided",
                            "right pack-owner source is absent or unusable")
        if not lefts:
            outcomes.append({"record": record, "state": "unknown", "cause": "left_owner_unprovided",
                             "reason": "left_owner_unprovided: 両端の独立qualified owner本文が揃わない。",
                             "refs": [record.get("ref"), record.get("left_ref"), record.get("right_ref"), record.get("source_ref")],
                             "sources": [right[1]["ref"]] if right and _fn3_valid_source(raw, right[1], unusable) else []})
            continue
        li, left_source, left_body = lefts[0]
        ri, right_source = right
        right_body = right_source.get("content")
        if not isinstance(right_body, dict):
            outcomes.append({"record": record, "state": "unknown", "cause": "owner_decision_unresolved",
                             "reason": "owner_decision_unresolved: right owner body is not a JSON object.",
                             "refs": [record.get("ref"), record.get("left_ref"), record.get("right_ref"), record.get("source_ref")],
                             "sources": []})
            continue
        left_scope = left_source["ref"].get("scope")
        right_scope = right_source["ref"].get("scope")
        target_scope = binding.get("template_ref", {}).get("scope")
        owner_decl = left_body.get("endpoint_owner_declaration")
        range_decl = right_body.get("compatibility_range_declaration")
        if not _fn3_scope_same(left_scope, target_scope) or not _fn3_scope_same(right_scope, target_scope):
            outcomes.append({"record": record, "state": "conflict", "cause": "scope",
                             "reason": "scope: qualified owner source scope differs from the target pair scope.",
                             "refs": [record["ref"], record["left_ref"], record["right_ref"], record["source_ref"], left_source["ref"]],
                             "sources": [left_source["ref"], right_source["ref"]]})
            continue
        left_decl_valid = (_fn3_left_owner_body_formed(left_body)
                           and isinstance(owner_decl, dict)
                           and owner_decl.get("endpoint") == "left"
                           and _ref_same(owner_decl.get("endpoint_ref"), record.get("left_ref"))
                           and owner_decl.get("owner") == record.get("left_ref", {}).get("owner")
                           and _ref_same(left_body.get("compatibility_record_ref"), record.get("ref"))
                           and _ref_same(left_body.get("counterpart_source_ref"), record.get("source_ref")))
        range_valid = (_fn3_range_declaration_formed(range_decl)
                       and _ref_same(range_decl.get("left_ref"), record.get("left_ref"))
                       and _ref_same(range_decl.get("right_ref"), record.get("right_ref"))
                       and _ref_same(range_decl.get("actual_pack_ref"), binding.get("pack_ref")))
        left_owner = left_decl_valid and owner_decl.get("owner") == left_source.get("ref", {}).get("owner")
        range_owners = range_decl.get("owner_declarations") if range_valid else None
        right_owner = (isinstance(range_owners, list) and len(range_owners) == 2
                       and any(_ref_same(r.get("endpoint_ref"), record.get("right_ref"))
                               and r.get("owner") == right_source.get("ref", {}).get("owner")
                               for r in range_owners if isinstance(r, dict)))
        outside = (left_owner and owner_decl.get("range_relation") == "outside"
                   and range_valid and range_decl.get("relation") == "outside" and right_owner
                   and all(r.get("relation") == "outside" for r in range_owners if isinstance(r, dict)))
        both_true = (record.get("compatible") is True and left_body.get("compatible") is True
                     and right_body.get("compatible") is True and left_owner
                     and owner_decl.get("compatible") is True)
        if (isinstance(owner_decl, dict) and (owner_decl.get("endpoint") != "left"
                or not _ref_same(owner_decl.get("endpoint_ref"), record.get("left_ref")))):
            outcomes.append({"record": record, "state": "unknown", "cause": "left_owner_unprovided",
                             "reason": "left_owner_unprovided: left owner declaration does not name the original left endpoint.",
                             "refs": [record.get("ref"), record.get("left_ref"), record.get("right_ref"), record.get("source_ref")],
                             "sources": [left_source.get("ref")]})
            continue
        if outside:
            outcomes.append({"record": record, "state": "conflict", "cause": "outside",
                             "reason": "同scope明示pairについて独立template-owner本文とpack-owner本文が当該実版範囲外を明示する。",
                             "refs": [record["ref"], record["left_ref"], record["right_ref"], record["source_ref"],
                                      left_source["ref"], left_source["qualification_ref"], lefts[0][2].get("compatibility_record_ref"),
                                      right_source["ref"], right_source["qualification_ref"]],
                             "sources": [left_source["ref"], right_source["ref"]]})
        elif both_true:
            outcomes.append({"record": record, "state": "resolved", "cause": "positive",
                             "reason": "同scope明示pairについて独立template-owner本文とpack-owner本文が共にtrueを明示する。実利用許可ではない。",
                             "refs": [record["ref"], record["left_ref"], record["right_ref"], record["source_ref"],
                                      left_source["ref"], left_source["qualification_ref"], right_source["ref"], right_source["qualification_ref"]],
                             "sources": [left_source["ref"], right_source["ref"]]})
        else:
            raise _fn3_stop("unclosed/owner_decision_unresolved",
                            "qualified owner decision does not form a fixed positive or bilateral-outside cause")
    for outcome in outcomes:
        record = outcome["record"]
        base_refs = [record.get("ref"), record.get("left_ref"), record.get("right_ref")]
        if isinstance(record.get("source_ref"), dict):
            base_refs.append(record["source_ref"])
        used_indices, source_refs = _fn3_source_reference_block(raw, outcome.get("sources", []))
        outcome["source_indices"] = used_indices
        outcome["refs"] = [*base_refs, *source_refs]
        outcome["sources"] = [raw["sources"][i]["ref"] for i in used_indices]
    if len(outcomes) > 1:
        same_pair = all(_ref_same(row["record"].get("left_ref"), outcomes[0]["record"].get("left_ref"))
                        and _ref_same(row["record"].get("right_ref"), outcomes[0]["record"].get("right_ref"))
                        for row in outcomes[1:])
        if not same_pair:
            raise _fn3_stop("unclosed/general_group_outside_pair", "compatibility records do not resolve to one explicit pair")
        if (len(outcomes) == 2 and outcomes[0]["state"] == "resolved"
                and outcomes[1]["state"] == "conflict" and outcomes[1]["cause"] == "outside"):
            states = ["resolved", "conflict"]
            reasons = [o["record"].get("reason") for o in outcomes]
            material = {"original_record_reasons": reasons, "pair_group_index": 0,
                        "record_indices": [0, 1], "record_states": states}
            reason = _fn3_diag("同scope同明示pairのqualified原宣言が相反する。両原宣言を保持する。", material)
            refs = [ref for outcome in outcomes for ref in outcome["refs"] if isinstance(ref, dict)]
            axes.append(_fn3_axis(outcomes[0]["record"].get("left_ref"), binding, "compatibility", "conflict", refs, reason, "knowledge_owner"))
            finding_outcome = outcomes[1]
            finding_index = next(i for i, source in enumerate(records)
                                 if source is finding_outcome["record"])
            findings.append(_fn3_finding("compatibility_mismatch", finding_outcome["record"].get("left_ref"), binding,
                                         "compatibility", "conflict", finding_outcome["sources"],
                                         _fn3_compatibility_finding_reason(raw, binding, finding_outcome,
                                                                           finding_index, "compatibility_mismatch")))
            result_reads.extend(outcomes)
        else:
            # Do not choose a winner or impose a count cutoff. This exact cause
            # combination has no frozen aggregation rule, so preserve the raw read at Backflow.
            raise _fn3_stop("unclosed/cause_to_finding_mapping", "the same-pair cause combination has no fixed public aggregation")
    if len(outcomes) == 1:
        outcome = outcomes[0]
        reason_prefixes = {
            "positive": "同scope明示pairについて独立template-owner本文とpack-owner本文が共にtrueを明示する。実利用許可ではない。",
            "outside": "同scope明示pairについて独立template-owner本文とpack-owner本文が当該実版範囲外を明示する。",
            "scope": "原source自身の資格scopeは対応するが対象pairのscopeと既知に異なる。",
            "null": "明示pairのsource_refは明示nullでowner互換根拠を解決できない。",
            "left_owner_unprovided": "右pack-owner原宣言は存在するが独立template-owner本文が未供給であり当該pair互換照合はunknownに保持する。",
        }
        prefix = reason_prefixes.get(outcome["cause"])
        if prefix is None:
            raise _fn3_stop("unclosed/unexercised_compatibility",
                            f"compatibility cause {outcome['cause']} has no fixed reason serialization")
        outcome["reason"] = _fn3_diag(prefix, {
            "original_record_reasons": [outcome["record"].get("reason")],
            "pair_group_index": 0, "record_indices": [index],
            "record_states": [outcome["state"]],
        })
        axes.append(_fn3_axis(outcome["record"].get("left_ref"), binding, "compatibility", outcome["state"],
                              outcome["refs"], outcome["reason"], "knowledge_owner" if outcome["state"] != "resolved" else None))
        if outcome["cause"] in {"null", "left_owner_unprovided"}:
            findings.append(_fn3_finding("compatibility_unknown", outcome["record"].get("left_ref"), binding,
                                         "compatibility", "unknown", outcome["sources"],
                                         _fn3_compatibility_finding_reason(raw, binding, outcome, index,
                                                                           "compatibility_unknown")))
        elif outcome["cause"] == "outside":
            findings.append(_fn3_finding("compatibility_mismatch", outcome["record"].get("left_ref"), binding,
                                         "compatibility", "conflict", outcome["sources"],
                                         _fn3_compatibility_finding_reason(raw, binding, outcome, index,
                                                                           "compatibility_mismatch")))
        result_reads.append(outcome)
    return result_reads


def _fn3_validate_private_return(value: dict[str, Any]) -> None:
    """Keep the internal read return aligned to the L4 closed private types."""
    def exact_object(row: Any, members: set[str]) -> bool:
        return isinstance(row, dict) and set(row) == members

    def presence_raw(row: Any) -> bool:
        return ((exact_object(row, {"presence"}) and row.get("presence") == "absent")
                or (exact_object(row, {"presence", "value"}) and row.get("presence") == "supplied"))

    def occurrence(row: Any) -> bool:
        return (exact_object(row, {"index", "locator", "original_read"})
                and type(row.get("index")) is int and row["index"] >= 0
                and isinstance(row.get("locator"), str) and presence_raw(row.get("original_read")))

    def source_state(value: Any) -> bool:
        return isinstance(value, str) and value in {"resolved", "missing", "unknown", "conflict", "unobserved"}

    expected = {"comparison", "source_qualifications", "actual_operands", "descriptor_traces", "bilateral_pairs"}
    if set(value) != expected:
        raise _fn3_stop("F04/N01/private_return_shape", "IdentityTraceReturn closed keys differ")
    actual_causes = {"actual_owner_body_unprovided", "actual_owner_body_corresponding", "actual_owner_body_differs",
                     "actual_owner_body_unresolved", "actual_owner_body_multiple_opposing", "input_member_absent",
                     "input_member_null", "input_member_out_of_type", "subject_unformed", "actual_scope_unresolved",
                     "actual_scope_differs", "actual_qualification_unresolved"}
    actual_roles = {"template_actual_ref", "knowledge_actual_ref", "requirement_actual_ref", "oracle_actual_ref",
                    "pack_actual_ref", "template_actual_revision", "knowledge_actual_revision", "pack_actual_revision",
                    "pack_actual_contract_version", "pack_actual_artifact_version", "knowledge_actual_operational_state",
                    "pack_actual_dependency_version"}
    if any(not exact_object(row, {"request", "original_read", "read_classification", "observations", "state", "cause"})
           or not exact_object(row.get("request"), {"member_locator", "actual_role"})
           or not isinstance(row["request"].get("member_locator"), str)
           or row["request"].get("actual_role") not in actual_roles
           or not presence_raw(row.get("original_read"))
           or row["read_classification"] not in {"absent", "null", "out_of_type", "supplied"}
           or not isinstance(row.get("observations"), list)
           or any(not exact_object(obs, {"source_index", "body_locator", "actual_read", "owner_declaration_locator",
                                        "owner_declaration_read", "relation", "state"})
                  or type(obs.get("source_index")) is not int or obs["source_index"] < 0
                  or not isinstance(obs.get("body_locator"), str)
                  or not isinstance(obs.get("owner_declaration_locator"), str)
                  or not presence_raw(obs.get("actual_read"))
                  or not presence_raw(obs.get("owner_declaration_read"))
                  or obs.get("relation") not in {"corresponding", "different", "unestablished", "not_applicable"}
                  or not source_state(obs.get("state")) for obs in row.get("observations", []))
           or not source_state(row.get("state")) or row.get("cause") not in actual_causes
           for row in value["actual_operands"]):
        raise _fn3_stop("F04/N01/private_actual_shape", "ActualOperandRead is outside its closed shape")
    trace_causes = {"original_trace_corresponding", "source_unresolved", "qualification_unresolved", "body_unresolved",
                    "knowledge_unresolved", "mixed_knowledge_revision", "scope_unresolved", "scope_differs"}
    if any(not exact_object(row, {"request", "slot_read", "fact_read", "knowledge_records", "provenance_refs", "source_indices",
                                  "body_groups", "state", "cause"})
           or not exact_object(row.get("request"), {"slot_locator", "fact_locator"})
           or not all(isinstance(row["request"].get(k), str) for k in ("slot_locator", "fact_locator"))
           or not presence_raw(row.get("slot_read")) or not presence_raw(row.get("fact_read"))
           or not isinstance(row.get("knowledge_records"), list) or any(not occurrence(x) for x in row["knowledge_records"])
           or not isinstance(row.get("body_groups"), list) or any(not occurrence(x) for x in row["body_groups"])
           or not isinstance(row.get("source_indices"), list)
           or any(type(i) is not int or i < 0 for i in row.get("source_indices", []))
           or not isinstance(row.get("provenance_refs"), list)
           or any(not exact_object(p, {"knowledge_record_index", "provenance_index", "locator", "original_read", "relation"})
                  or type(p.get("knowledge_record_index")) is not int or p["knowledge_record_index"] < 0
                  or type(p.get("provenance_index")) is not int or p["provenance_index"] < 0
                  or not isinstance(p.get("locator"), str) or not presence_raw(p.get("original_read"))
                  or p.get("relation") not in {"corresponding", "different", "unestablished", "not_applicable"}
                  for p in row.get("provenance_refs", []))
           or not source_state(row.get("state")) or row.get("cause") not in trace_causes
           for row in value["descriptor_traces"]):
        raise _fn3_stop("F04/N01/private_trace_shape", "DescriptorTraceRead is outside its closed shape")
    bilateral_causes = {"positive", "null", "scope", "outside", "opposing", "source_ref_absent", "source_unresolved",
                        "source_unusable", "qualification_unresolved", "endpoint_unresolved", "endpoint_differs",
                        "scope_unresolved", "body_record_differs", "compatible_null", "range_unresolved",
                        "left_owner_unprovided", "right_owner_unprovided", "bilateral_owner_unresolved",
                        "bilateral_decisions_opposing"}
    membership_causes = {"matching_refs", "container_absent", "container_null", "container_type", "endpoint_unresolved",
                         "member_no_match", "member_unresolved"}
    owner_causes = {"owner_body_corresponding", "owner_scope_differs", "owner_qualification_unresolved",
                    "owner_subject_unresolved", "owner_decision_unresolved", "owner_decision_differs",
                    "owner_counterpart_unresolved"}
    if any(not exact_object(row, {"request", "record_read", "owner_reads", "state", "cause"})
           or not exact_object(row.get("request"), {"record_locator"})
           or not isinstance(row["request"].get("record_locator"), str)
           or not presence_raw(row.get("record_read"))
           or not isinstance(row.get("owner_reads"), list)
           or any(not exact_object(owner, {"endpoint", "source_index", "membership", "body_read", "record_ref_read",
                                           "counterpart_source_ref_read", "target_scope_relation", "state", "cause"})
                  or owner.get("endpoint") not in {"left", "right"}
                  or type(owner.get("source_index")) is not int or owner["source_index"] < 0
                  or not presence_raw(owner.get("body_read")) or not presence_raw(owner.get("record_ref_read"))
                  or not presence_raw(owner.get("counterpart_source_ref_read"))
                  or owner.get("target_scope_relation") not in {"same", "different", "unobserved"}
                  or not source_state(owner.get("state")) or owner.get("cause") not in owner_causes
                  or not exact_object(owner.get("membership"), {"source_index", "endpoint_locator", "endpoint_read",
                                                                 "container_read", "occurrences", "matching_ref_indices",
                                                                 "state", "cause", "meaning_limit"})
                  or type(owner["membership"].get("source_index")) is not int
                  or not isinstance(owner["membership"].get("endpoint_locator"), str)
                  or not presence_raw(owner["membership"].get("endpoint_read"))
                  or not presence_raw(owner["membership"].get("container_read"))
                  or not isinstance(owner["membership"].get("occurrences"), list)
                  or any(not exact_object(o, {"ref_index", "locator", "original_read", "read_classification", "full_ref_relation"})
                         or type(o.get("ref_index")) is not int or o["ref_index"] < 0
                         or not isinstance(o.get("locator"), str) or not presence_raw(o.get("original_read"))
                         or o.get("read_classification") not in {"null", "out_of_type", "supplied"}
                         or o.get("full_ref_relation") not in {"corresponding", "different", "unestablished", "not_applicable"}
                         for o in owner["membership"].get("occurrences", []))
                  or not isinstance(owner["membership"].get("matching_ref_indices"), list)
                  or any(type(i) is not int or i < 0 for i in owner["membership"].get("matching_ref_indices", []))
                  or owner["membership"].get("state") not in {"resolved", "unknown"}
                  or owner["membership"].get("cause") not in membership_causes
                  or owner["membership"].get("meaning_limit") != "raw_endpoint_ref_membership_only"
                  for owner in row.get("owner_reads", []))
           or not source_state(row.get("state")) or row.get("cause") not in bilateral_causes
           for row in value["bilateral_pairs"]):
        raise _fn3_stop("F04/N01/private_bilateral_shape", "BilateralCompatibilityRead is outside its closed shape")
    if any(not exact_object(row, {"source_index", "source", "qualifications", "roots", "fn0_disposition", "state"})
           or type(row.get("source_index")) is not int or row["source_index"] < 0
           or not occurrence(row.get("source"))
           or not isinstance(row.get("qualifications"), list) or any(not occurrence(x) for x in row.get("qualifications", []))
           or not isinstance(row.get("roots"), list) or any(not occurrence(x) for x in row.get("roots", []))
           or row["fn0_disposition"] not in {"usable", "unusable", "unobserved"}
           or not source_state(row.get("state"))
           for row in value["source_qualifications"]):
        raise _fn3_stop("F04/N01/private_source_qualification_shape", "SourceQualificationRead is outside its closed shape")

def compare_identity_versions_and_trace(context: dict[str, object]) -> dict[str, object]:
    """fn3: 同じfn0 ValidatedSupplyから有限actual/trace/bilateral readを射影する。"""
    if not isinstance(context, dict):
        raise _fn3_stop("F04/N01/validated_context", "IdentityContext is not an object")
    validated = context.get("validated")
    if not isinstance(validated, dict) or "input" not in validated:
        raise _fn3_stop("F04/N01/validated_context", "IdentityContext.validated is absent")
    if "unusable_source_refs" not in validated or not isinstance(validated.get("unusable_source_refs"), list):
        raise _fn3_stop("F04/N01/unusable_source_refs", "fn0 source disposition is absent or not an array")
    raw = validated.get("input")
    if raw is None:
        raise _fn3_stop("F04/N01/validated_input_null", "ValidatedSupply.input is explicitly null and the identity read is unexercised")
    if not isinstance(raw, dict):
        raise _fn3_stop("F04/N01/validated_input", "ValidatedSupply.input is not an object or null")
    before = copy.deepcopy(raw)
    binding = raw.get("binding")
    if not isinstance(binding, dict):
        raise _fn3_stop("F04/N01/binding_absent", "IdentitySnapshot.binding is absent or null")
    template_ref = binding.get("template_ref")
    binding_shape_ok = (_fn3_r59_binding_shape_ok(binding)
                        if isinstance(binding.get("template_ref"), dict)
                        and "revision" not in binding["template_ref"]
                        else _binding_shape_ok(binding))
    if not binding_shape_ok:
        raise _fn3_stop("F04/N01/binding_shape", "IdentitySnapshot binding is not a complete typed Binding")
    dependencies = binding.get("pack_dependency_versions", [])
    if dependencies:
        raise _fn3_stop(f"unclosed/nonempty_dependency/{len(dependencies)}", "pack dependency version observations are outside the fixed branch")
    slots = raw.get("descriptors")
    if not isinstance(slots, list):
        raise _fn3_stop("F04/N01/descriptor_slots", "IdentitySnapshot descriptors are absent or not an array")
    if any(not isinstance(slot, dict) or not isinstance(slot.get("facts"), list) for slot in slots):
        raise _fn3_stop("F04/N01/descriptor_facts", "descriptor/fact structure is outside the fixed trace read")
    for si, slot in enumerate(slots):
        for fi, fact in enumerate(slot["facts"]):
            if not isinstance(fact, dict) or not isinstance(fact.get("binding"), dict):
                raise _fn3_stop(f"unclosed/fact_binding/{si}/{fi}", "fact binding is outside the fixed trace read")
    unusable = validated.get("unusable_source_refs", [])
    if not isinstance(unusable, list):
        raise _fn3_stop("F04/N01/unusable_source_refs", "ValidatedSupply unusable_source_refs is not an array")
    axes: list[dict[str, Any]] = []
    findings: list[dict[str, Any]] = []
    actual_reads = _fn3_actual_axes(raw, binding, unusable, axes, findings)
    trace_reads = _fn3_trace(raw, binding, unusable, axes, findings)
    _fn3_identity_claim_findings(raw, binding, unusable, findings, trace_reads)
    bilateral_reads = _fn3_compatibility(raw, binding, unusable, axes, findings)
    template_ref = binding.get("template_ref")
    if isinstance(template_ref, dict) and template_ref.get("scope") is None:
        findings.append(_fn3_finding(
            "scope_missing", template_ref, binding, "scope", "missing", [],
            _fn3_predicate_finding_reason(raw, "scope_missing",
                                          [("/binding/template_ref/scope", "scope")]))
        )
    rule_order = {
        "source_missing": 0, "version_missing": 1, "scope_missing": 2,
        "compatibility_unknown": 3, "compatibility_mismatch": 4,
        "oracle_revision_mismatch": 5, "image_identity_inference": 6,
        "tool_node_identity_inference": 7, "filename_identity_join": 8,
        "version_target_as_actual": 9, "mixed_knowledge_revision": 10,
        "silent_supersession": 11,
    }
    findings.sort(key=lambda row: rule_order.get(row.get("code"), len(rule_order)))
    _fn3_write_predicate_axes(findings, axes)
    if not _json_equal(raw, before):
        raise AssertionError("fn3 mutated the supplied immutable snapshot")
    # Keep the private reader result closed and local; only its Comparison is public.
    observed_source_indices = {i for read in trace_reads for i in read.get("source_indices", [])}
    for read in actual_reads:
        observed_source_indices.update(row["source_index"] for row in read.get("observations", [])
                                       if isinstance(row, dict) and isinstance(row.get("source_index"), int))
    for read in bilateral_reads:
        for ref in read.get("sources", []):
            observed_source_indices.update(i for i, _source in _fn3_source_rows(raw, ref))
    source_qualification_reads = []
    for source_index, source in enumerate(raw.get("sources", [])):
        if source_index not in observed_source_indices:
            continue
        if not isinstance(source, dict):
            continue
        qrows = _fn3_qualification_rows(raw, source.get("qualification_ref"))
        qualification_occurrences = [
            {"index": qi, "locator": f"/qualifications/{qi}",
             "original_read": {"presence": "supplied", "value": copy.deepcopy(q)}}
            for qi, q in qrows
        ]
        root_occurrences = []
        seen_root_indices = set()
        for _qi, q in qrows:
            root_ref = q.get("root_ref")
            for ri, root in _fn3_root_rows(raw, root_ref):
                if ri not in seen_root_indices:
                    seen_root_indices.add(ri)
                    root_occurrences.append({"index": ri, "locator": f"/qualification_roots/{ri}",
                                             "original_read": {"presence": "supplied", "value": copy.deepcopy(root)}})
        usable = _fn3_valid_source(raw, source, unusable)
        source_qualification_reads.append({
            "source_index": source_index,
            "source": {"index": source_index, "locator": f"/sources/{source_index}",
                       "original_read": {"presence": "supplied", "value": copy.deepcopy(source)}},
            "qualifications": qualification_occurrences, "roots": root_occurrences,
            "fn0_disposition": "usable" if usable else "unusable",
            "state": "resolved" if usable else "unknown",
        })
    private_bilateral_reads = []
    for index, read in enumerate(bilateral_reads):
        record = read.get("record")
        owner_reads = []
        if isinstance(record, dict):
            owner_reads.extend(_fn3_endpoint_owner_reads(raw, record, unusable, "left"))
            owner_reads.extend(_fn3_endpoint_owner_reads(raw, record, unusable, "right"))
        private_bilateral_reads.append({
            "request": {"record_locator": f"/compatibility_records/{index}"},
            "record_read": {"presence": "supplied", "value": copy.deepcopy(record)},
            "owner_reads": owner_reads, "state": read["state"],
            "cause": ("bilateral_owner_unresolved" if read["cause"] == "owner_decision_unresolved" else read["cause"]),
        })
    private_return = {
        "comparison": _comparison(axes, findings, "compare_identity_versions_and_trace", binding),
        "source_qualifications": source_qualification_reads, "actual_operands": actual_reads,
        "descriptor_traces": trace_reads, "bilateral_pairs": private_bilateral_reads,
    }
    _fn3_validate_private_return(private_return)
    return copy.deepcopy(private_return["comparison"])
