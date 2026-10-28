"""FN1 native definition readers for the bounded same-call walk."""

from __future__ import annotations

import copy
from typing import Any


_BACKFLOW = "HELIXBRAIN-L6-032-N03-PATH"


def _stop(branch: str, detail: str) -> NotImplementedError:
    return NotImplementedError(
        f"F01/F02/unclosed/{branch}: {detail}; Backflow {_BACKFLOW}"
    )


def _presence(container: Any, member: str) -> dict[str, object]:
    if isinstance(container, dict) and member in container:
        return {"presence": "supplied", "value": copy.deepcopy(container[member])}
    return {"presence": "absent"}


def _resolve_pointer(value: Any, pointer: str) -> Any:
    if not isinstance(pointer, str) or not pointer.startswith("/"):
        raise _stop(
            "meaning_request_locator", "request locator is not an absolute JSON Pointer"
        )
    current = value
    for encoded in pointer[1:].split("/"):
        if any(
            encoded[index] == "~"
            and (index + 1 == len(encoded) or encoded[index + 1] not in "01")
            for index in range(len(encoded))
        ):
            raise _stop(
                "meaning_request_locator",
                f"request locator has invalid RFC6901 escaping: {pointer}",
            )
        part = encoded.replace("~1", "/").replace("~0", "~")
        if isinstance(current, list):
            if not part.isdecimal() or str(int(part)) != part:
                raise _stop(
                    "meaning_request_locator",
                    f"request locator does not resolve: {pointer}",
                )
            index = int(part)
            if index >= len(current):
                raise _stop(
                    "meaning_request_locator",
                    f"request locator does not resolve: {pointer}",
                )
            current = current[index]
        elif isinstance(current, dict) and part in current:
            current = current[part]
        else:
            raise _stop(
                "meaning_request_locator",
                f"request locator does not resolve: {pointer}",
            )
    return current


def _validate_fact_is_slot_child(
    raw: dict[str, Any], slot: dict[str, Any], slot_locator: str, fact_locator: str
) -> None:
    prefix = slot_locator + "/facts/"
    if not fact_locator.startswith(prefix):
        raise _stop(
            "meaning_request_fact_not_slot_child",
            "fact locator is not a direct child of the requested slot",
        )
    token = fact_locator[len(prefix) :]
    if not token.isdecimal() or str(int(token)) != token:
        raise _stop(
            "meaning_request_fact_locator_index",
            "fact locator array index is not canonical and nonnegative",
        )
    facts = slot.get("facts")
    index = int(token)
    if not isinstance(facts, list) or index >= len(facts):
        raise _stop(
            "meaning_request_fact_not_slot_child",
            "fact locator does not resolve within the requested slot",
        )
    if _resolve_pointer(raw, fact_locator) is not facts[index]:
        raise _stop(
            "meaning_request_fact_not_slot_child",
            "fact locator is not the indexed original fact of the requested slot",
        )


def _ref_same(left: Any, right: Any) -> bool:
    from descriptor_definitions import _ref_same as compare

    return compare(left, right)


def _ref_identity_same(left: Any, right: Any) -> bool:
    from descriptor_definitions import _ref_identity_same as compare

    return compare(left, right)


def _source_usable(validated: dict[str, Any], source_ref: Any) -> bool:
    from descriptor_definitions import _source_usable as check

    return check(validated, source_ref)


def _binding_same(left: Any, right: Any) -> bool:
    from descriptor_definitions import _binding_same as compare

    return compare(left, right)


def _problem(
    cause: str,
    source: Any,
    source_index: int | None,
    locator: str,
    raw_container: Any,
    raw_member: str | None,
    reason: str,
) -> dict[str, object]:
    return {
        "cause": cause,
        "source_ref": _presence(source, "ref")
        if source is not None
        else {"presence": "absent"},
        "source_index": source_index,
        "locator": locator,
        "original_value": (
            _presence(raw_container, raw_member)
            if raw_member is not None
            else {"presence": "supplied", "value": copy.deepcopy(raw_container)}
        ),
        "reason": reason,
    }


def _meaning_read(
    validated: dict[str, Any], request: dict[str, Any]
) -> tuple[dict[str, object], list[dict[str, object]], list[dict[str, object]]]:
    from descriptor_definition_normative import definition_meaning_normative_frame

    if not isinstance(validated, dict) or not isinstance(validated.get("input"), dict):
        raise _stop(
            "meaning_validated_input",
            "meaning reader requires the same decoded ValidatedSupply",
        )
    if not isinstance(request, dict) or set(request) != {
        "slot_locator",
        "fact_locator",
        "normative_entry_pointer",
    }:
        raise _stop(
            "meaning_request_shape", "DefinitionMeaningRequest has an unsupported shape"
        )
    if not all(isinstance(request.get(name), str) for name in request):
        raise _stop(
            "meaning_request_shape", "DefinitionMeaningRequest fields must be strings"
        )

    raw = validated["input"]
    slot = _resolve_pointer(raw, request["slot_locator"])
    fact = _resolve_pointer(raw, request["fact_locator"])
    if not isinstance(slot, dict) or not isinstance(fact, dict):
        raise _stop(
            "meaning_request_target_shape",
            "request must resolve to one slot and one MeaningFact",
        )
    _validate_fact_is_slot_child(
        raw, slot, request["slot_locator"], request["fact_locator"]
    )
    frame = definition_meaning_normative_frame(slot.get("descriptor_kind"))
    if request["normative_entry_pointer"] != frame["entry_pointer"]:
        raise _stop(
            "meaning_request_normative_pointer",
            "request pointer does not identify the fixed L4 entry",
        )

    binding = slot.get("binding")
    result: dict[str, object] = {
        "slot_locator": request["slot_locator"],
        "fact_locator": request["fact_locator"],
        "binding": _presence(slot, "binding"),
        "normative_frame": frame,
        "acquisition_state": "unknown",
        "occurrences": [],
        "supports": [],
        "problems": [],
    }
    scopes: list[dict[str, object]] = []
    support_origins: list[dict[str, object]] = []
    problems: list[dict[str, object]] = result["problems"]  # type: ignore[assignment]

    fact_source_ref = fact.get("source_ref")
    if not isinstance(fact_source_ref, dict):
        problems.append(
            _problem(
                "source_unresolved",
                None,
                None,
                request["fact_locator"] + "/source_ref",
                fact,
                "source_ref",
                "当該原source又はその既存owner資格を解決できない。",
            )
        )
        scopes.append({"problem_index": 0, "relevance": "target"})
        return result, scopes, support_origins

    sources = raw.get("sources")
    records = raw.get("knowledge_records")
    if not isinstance(sources, list) or not isinstance(records, list):
        raise _stop(
            "meaning_population_shape",
            "sources and knowledge_records must retain decoded arrays",
        )
    knowledge_ref = binding.get("knowledge_ref") if isinstance(binding, dict) else None
    matching_records = [
        record
        for record in records
        if isinstance(record, dict) and _ref_same(record.get("ref"), knowledge_ref)
    ]
    if not matching_records:
        problems.append(
            _problem(
                "source_unresolved",
                None,
                None,
                request["fact_locator"] + "/source_ref",
                fact,
                "source_ref",
                "当該原source又はその既存owner資格を解決できない。",
            )
        )
        scopes.append({"problem_index": 0, "relevance": "target"})
        return result, scopes, support_origins

    provenance_occurrences: list[tuple[Any, int, Any]] = []
    for record in matching_records:
        if "provenance_refs" not in record:
            raise _stop(
                "knowledge_provenance_absent",
                "matching KnowledgeRecord lacks provenance_refs",
            )
        provenance = record["provenance_refs"]
        if not isinstance(provenance, list):
            raise _stop(
                "knowledge_provenance_type",
                "matching KnowledgeRecord provenance_refs is not an array",
            )
        for provenance_index, provenance_ref in enumerate(provenance):
            if _ref_identity_same(provenance_ref, fact_source_ref):
                provenance_occurrences.append(
                    (record, provenance_index, provenance_ref)
                )

    if not provenance_occurrences:
        problems.append(
            _problem(
                "source_unresolved",
                None,
                None,
                request["fact_locator"] + "/source_ref",
                fact,
                "source_ref",
                "当該原source又はその既存owner資格を解決できない。",
            )
        )
        scopes.append({"problem_index": 0, "relevance": "target"})
        return result, scopes, support_origins

    found_source = False
    for _record, _provenance_index, provenance_ref in provenance_occurrences:
        source_rows = [
            (index, source)
            for index, source in enumerate(sources)
            if isinstance(source, dict)
            and _ref_identity_same(source.get("ref"), provenance_ref)
        ]
        if not source_rows:
            problems.append(
                _problem(
                    "source_unresolved",
                    None,
                    None,
                    request["fact_locator"] + "/source_ref",
                    fact,
                    "source_ref",
                    "当該原source又はその既存owner資格を解決できない。",
                )
            )
            scopes.append({"problem_index": len(problems) - 1, "relevance": "target"})
            continue
        found_source = True
        for source_index, source in source_rows:
            source_ref = source.get("ref")
            expected_digest = (
                provenance_ref.get("sha256")
                if isinstance(provenance_ref, dict)
                else None
            )
            actual_digest = (
                source_ref.get("sha256") if isinstance(source_ref, dict) else None
            )
            if (
                expected_digest is not None
                and actual_digest is not None
                and expected_digest != actual_digest
            ):
                problems.append(
                    _problem(
                        "source_unresolved",
                        source,
                        source_index,
                        f"/sources/{source_index}",
                        source,
                        None,
                        "当該原source又はその既存owner資格を解決できない。",
                    )
                )
                scopes.append(
                    {"problem_index": len(problems) - 1, "relevance": "target"}
                )
                continue
            if (
                not _ref_same(provenance_ref, source_ref)
                or not _ref_same(fact_source_ref, source_ref)
                or not _source_usable(validated, source_ref)
                or source.get("role") != "semantic_json"
            ):
                problems.append(
                    _problem(
                        "source_unresolved",
                        source,
                        source_index,
                        f"/sources/{source_index}",
                        source,
                        None,
                        "当該原source又はその既存owner資格を解決できない。",
                    )
                )
                scopes.append(
                    {"problem_index": len(problems) - 1, "relevance": "target"}
                )
                continue

            content = source.get("content")
            if not isinstance(content, dict):
                raise _stop(
                    "meaning_source_content_shape",
                    "qualified semantic_json content is not an object",
                )
            if not _binding_same(content.get("binding"), binding):
                raise _stop(
                    "meaning_source_binding_differs",
                    "qualified source content Binding does not match the requested slot",
                )
            if not _binding_same(fact.get("binding"), binding):
                raise _stop(
                    "meaning_fact_binding_differs",
                    "MeaningFact Binding does not match the requested slot",
                )
            if "definition_meaning_operations" not in content:
                problems.append(
                    _problem(
                        "container_absent",
                        source,
                        source_index,
                        f"/sources/{source_index}/content/definition_meaning_operations",
                        content,
                        "definition_meaning_operations",
                        "当該原sourceの要求されたcarrier memberが供給されていない。",
                    )
                )
                scopes.append(
                    {"problem_index": len(problems) - 1, "relevance": "target"}
                )
                continue
            if content["definition_meaning_operations"] == []:
                continue
            raise _stop(
                "definition_meaning_operations_unclosed",
                "a supplied definition_meaning_operations carrier is outside the implemented reader path",
            )

    if not found_source and not problems:
        problems.append(
            _problem(
                "source_unresolved",
                None,
                None,
                request["fact_locator"] + "/source_ref",
                fact,
                "source_ref",
                "当該原source又はその既存owner資格を解決できない。",
            )
        )
        scopes.append({"problem_index": 0, "relevance": "target"})
    return result, scopes, support_origins


def read_original_definition_meaning_bundle(
    validated: dict[str, Any], request: dict[str, Any]
) -> dict[str, object]:
    read, problem_scopes, support_origins = _meaning_read(validated, request)
    return {
        "read": read,
        "problem_scopes": problem_scopes,
        "support_origins": support_origins,
    }


def read_original_definition_meaning(
    validated: dict[str, Any], request: dict[str, Any]
) -> dict[str, object]:
    return read_original_definition_meaning_bundle(validated, request)["read"]  # type: ignore[return-value]


def read_definition_special_support(
    validated: dict[str, Any], request: dict[str, Any]
) -> dict[str, object]:
    """Read one original replacement Claim's basis support without projecting it."""
    from descriptor_definition_special_reads import (
        _read_definition_special_support as read,
    )

    return read(validated, request)


def read_original_definition_applicability(
    validated: dict[str, Any], request: dict[str, Any]
) -> dict[str, object]:
    if (
        not isinstance(request, dict)
        or set(request) != {"slot_locator"}
        or not isinstance(request["slot_locator"], str)
    ):
        raise _stop(
            "applicability_request_shape",
            "DefinitionApplicabilityRequest has an unsupported shape",
        )
    if not isinstance(validated, dict) or not isinstance(validated.get("input"), dict):
        raise _stop(
            "applicability_validated_input",
            "applicability reader requires the same decoded ValidatedSupply",
        )
    slot = _resolve_pointer(validated["input"], request["slot_locator"])
    if not isinstance(slot, dict):
        raise _stop(
            "applicability_request_target_shape",
            "request must resolve to one descriptor slot",
        )
    request_value = _presence(slot, "definition_applicability_ref")
    result: dict[str, object] = {
        "slot_locator": request["slot_locator"],
        "request": request_value,
        "acquisition_state": "not_requested"
        if request_value["presence"] == "absent"
        else "unknown",
        "source_occurrences": [],
        "supports": [],
        "problems": [],
    }
    if request_value["presence"] == "absent":
        return result
    if request_value.get("value") is None:
        result["problems"] = [
            {
                "cause": "applicability_request_null",
                "source_ref": {"presence": "absent"},
                "source_index": None,
                "locator": request["slot_locator"] + "/definition_applicability_ref",
                "original_value": copy.deepcopy(request_value),
                "reason": "定義非適用の原参照が明示nullであり、当該原判断を解決できない。",
            }
        ]
        return result
    raise _stop(
        "applicability_supplied_ref",
        "supplied applicability Ref reader is outside this finite path",
    )


def project_definition_applicability(
    read: dict[str, Any], slot: dict[str, Any], slot_locator: str
) -> list[dict[str, object]]:
    if not isinstance(read, dict) or not isinstance(slot, dict):
        raise _stop(
            "applicability_projection_shape",
            "projection requires one typed read and its original slot",
        )
    if read.get("acquisition_state") == "not_requested":
        return []
    if read.get("request") != {"presence": "supplied", "value": None}:
        raise _stop(
            "applicability_projection_unclosed",
            "only the explicit-null request projection is closed",
        )
    binding = slot.get("binding")
    template_ref = binding.get("template_ref") if isinstance(binding, dict) else None
    knowledge_ref = binding.get("knowledge_ref") if isinstance(binding, dict) else None
    knowledge_owner = (
        knowledge_ref.get("owner") if isinstance(knowledge_ref, dict) else None
    )
    if isinstance(knowledge_ref, dict):
        subject_member = "knowledge_ref"
    elif isinstance(template_ref, dict):
        subject_member = "template_ref"
    else:
        subject_member = None
    subject_ref = (
        _presence(binding, subject_member)
        if subject_member is not None
        else {"presence": "absent"}
    )
    return [
        {
            "state": "unknown",
            "origin_branch": "source_unresolved",
            "cause": "applicability_request_null",
            "axis": f"{slot.get('descriptor_kind')}.definition_applicability",
            "reason": "定義非適用の原参照が明示nullであり、当該原判断を解決できない。",
            "source_refs": [],
            "subject_ref": subject_ref,
            "binding": _presence(slot, "binding"),
            "backflow_owner": knowledge_owner
            if isinstance(knowledge_owner, str)
            else None,
            "slot_locator": slot_locator,
            "record_locator": None,
        }
    ]
