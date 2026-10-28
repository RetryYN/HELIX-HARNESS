"""Shared structural support for B02 dependency semantic ports."""

from __future__ import annotations

import copy
import json
from typing import Any

from descriptor_definitions import (
    _binding_shape_ok,
    _is_json_value,
    _ref_shape_ok,
)


_BACKFLOW_ID = "HELIXBRAIN-L6-032-B02-FN6-PATH"


_REQUIRED_ALWAYS_IDENTITIES = (
    "HELIXBRAIN-L2-003",
    "HELIXBRAIN-L2-005",
    "HELIXBRAIN-L2-007",
    "HELIXBRAIN-L2-008",
    "HELIXBRAIN-L2-028",
)


_TRACE_MEMBER_ORDER = (
    "format",
    "producer_symbol",
    "axis",
    "state",
    "subject_ref",
    "binding",
    "original_refs",
    "backflow_owner",
    "request_locator",
    "source_category_locator",
    "cause",
    "canonical_body_support",
    "handoff_record",
    "selection_observation",
)


_RECEIPT_ORIGIN_MEMBERS = (
    "origin_ref",
    "subject_ref",
    "binding",
    "actor",
    "basis_refs",
    "producer_contract_ref",
)


_OS_INCOMING_MEMBERS = (
    "obligation_ref",
    "original_state",
    "state_contract_ref",
    "meaning_body",
    "discharge_assertion",
    "binding",
    "source_ref",
    "qualification_ref",
    "source_locator",
    "basis_refs",
    "original_project_binding",
)


_OS_ORIGINAL_BINDING_MEMBERS = (
    "project_scope",
    "requirement_ref",
    "HARNESS_contract_ref",
    "template_ref",
    "semantic_contract_ref",
)


_OS_ORIGINAL_SCOPE_MEMBERS = (
    "project",
    "tenant",
    "environment",
)


_DP1_ASSESSMENT_MEMBER_ORDER = (
    "claim_locator",
    "claim_index",
    "raw_claim",
    "claim_intent",
    "basis_index",
    "basis_ref",
    "source_index",
    "raw_body",
    "typed_body",
    "request",
    "projection_read",
    "os_binding_comparison",
    "support_components",
)


def _unsupported(contract: str, branch: str, detail: str) -> NotImplementedError:
    error = NotImplementedError(
        f"{contract}/{branch}: {detail}; Backflow {_BACKFLOW_ID}"
    )
    error._b02_branch_tagged = True
    return error


def _ref_frame_supplied_ok(value: Any) -> bool:
    if not _ref_shape_ok(value):
        return False
    return all(
        value.get(key) is not None and value.get(key) != ""
        for key in ("identity", "revision", "scope", "owner")
    )


def _presence_field(container: Any, key: str) -> dict[str, Any]:
    if isinstance(container, dict) and key in container:
        return {"presence": "supplied", "value": copy.deepcopy(container[key])}
    return {"presence": "absent"}


def _port_presence_shape_ok(value: Any, inner_validator) -> bool:
    if not isinstance(value, dict):
        return False
    presence = value.get("presence")
    if presence == "absent":
        return set(value) == {"presence"}
    if presence == "supplied":
        return set(value) == {"presence", "value"} and (
            value["value"] is None or inner_validator(value["value"])
        )
    return False


def _os_original_scope_shape_ok(value: Any) -> bool:
    if not isinstance(value, dict) or set(value) != set(_OS_ORIGINAL_SCOPE_MEMBERS):
        return False
    return all(
        _port_presence_shape_ok(value[key], lambda v: isinstance(v, str))
        for key in _OS_ORIGINAL_SCOPE_MEMBERS
    )


def _os_original_binding_shape_ok(value: Any) -> bool:
    if not isinstance(value, dict) or set(value) != set(_OS_ORIGINAL_BINDING_MEMBERS):
        return False
    if not _port_presence_shape_ok(value["project_scope"], _os_original_scope_shape_ok):
        return False
    return all(
        _port_presence_shape_ok(value[key], _ref_shape_ok)
        for key in (
            "requirement_ref",
            "HARNESS_contract_ref",
            "template_ref",
            "semantic_contract_ref",
        )
    )


def _os_incoming_shape_ok(content: Any) -> bool:
    if not isinstance(content, dict) or set(content) != set(_OS_INCOMING_MEMBERS):
        return False
    return (
        _port_presence_shape_ok(content["obligation_ref"], _ref_shape_ok)
        and _port_presence_shape_ok(
            content["original_state"], lambda v: isinstance(v, str)
        )
        and _ref_shape_ok(content["state_contract_ref"])
        and _is_json_value(content["meaning_body"])
        and _port_presence_shape_ok(
            content["discharge_assertion"], lambda v: type(v) is bool
        )
        and _binding_shape_ok(content["binding"])
        and _ref_shape_ok(content["source_ref"])
        and _port_presence_shape_ok(content["qualification_ref"], _ref_shape_ok)
        and isinstance(content["source_locator"], str)
        and isinstance(content["basis_refs"], list)
        and all(_ref_shape_ok(ref) for ref in content["basis_refs"])
        and _os_original_binding_shape_ok(content["original_project_binding"])
    )


def _copy_refs_in_source_order(refs: list[Any]) -> list[dict[str, Any]]:
    if not isinstance(refs, list) or any(not _ref_shape_ok(ref) for ref in refs):
        raise _unsupported(
            "B02/F09",
            "non_ref_original_reference",
            "original/source reference is not a valid Ref",
        )
    return copy.deepcopy(refs)


def _resolve_rfc6901_pointer(root: Any, pointer: str) -> tuple[bool, Any]:
    if not isinstance(pointer, str):
        return False, None
    if pointer == "":
        return True, root
    if not pointer.startswith("/"):
        return False, None
    current = root
    for raw_token in pointer.split("/")[1:]:
        token = raw_token.replace("~1", "/").replace("~0", "~")
        if isinstance(current, dict):
            if token not in current:
                return False, None
            current = current[token]
        elif isinstance(current, list):
            if not token.isdigit() or (len(token) > 1 and token.startswith("0")):
                return False, None
            index = int(token)
            if index < 0 or index >= len(current):
                return False, None
            current = current[index]
        else:
            return False, None
    return True, current


def _serialize_trace(material: dict[str, Any]) -> str:
    ordered = {key: material[key] for key in _TRACE_MEMBER_ORDER}
    return json.dumps(ordered, ensure_ascii=False, separators=(",", ":"))


def _binding_frame_supplied_ok(binding: Any) -> bool:
    if not _binding_shape_ok(binding):
        return False
    return all(
        _ref_frame_supplied_ok(binding.get(key))
        for key in (
            "template_ref",
            "knowledge_ref",
            "requirement_ref",
            "oracle_ref",
            "pack_ref",
        )
    ) and all(
        _ref_frame_supplied_ok(r) for r in binding.get("pack_dependency_versions", [])
    )


def _scope_string_same(consumer_scope: Any, os_proj_scope: Any, key: str) -> bool:
    if not isinstance(consumer_scope, dict) or not isinstance(os_proj_scope, dict):
        return False
    left = consumer_scope.get(key)
    right_field = os_proj_scope.get(key)
    if not isinstance(left, str) or not isinstance(right_field, dict):
        return False
    if right_field.get("presence") != "supplied" or not isinstance(
        right_field.get("value"), str
    ):
        return False
    return left == right_field["value"]
