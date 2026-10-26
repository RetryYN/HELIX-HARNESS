"""B02（受領は消込でない）の fn6 compare_dependencies_and_handoff 垂直スライス。

根拠:
- L4-basic-design/template-semantic-supply.json#/dependency_semantic_ports
- L5-detail-design/template-semantic-supply.json#/functions/6
- L5-detail-design/template-semantic-supply.json#/failure_rules/1..2
- L5-detail-design/template-semantic-supply.json#/dependency_incoming_detail
- L5-detail-design/template-semantic-supply.json#/canonical_dependency_detail
- L5-detail-design/template-semantic-supply.json#/claim_intent_detail
"""

from __future__ import annotations

import copy
import json
import math
from typing import Any

_BACKFLOW_ID = "HELIXBRAIN-L6-032-B02-FN6-PATH"

_REQUIRED_ALWAYS_IDENTITIES = (
    "HELIXBRAIN-L2-003",
    "HELIXBRAIN-L2-005",
    "HELIXBRAIN-L2-007",
    "HELIXBRAIN-L2-008",
    "HELIXBRAIN-L2-028",
)

_BINDING_REFS = (
    "template_ref",
    "knowledge_ref",
    "requirement_ref",
    "oracle_ref",
    "pack_ref",
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

_OS_INCOMING_MEMBERS = (
    "obligation_ref",
    "subject_ref",
    "binding",
    "original_project_binding",
    "original_state",
    "discharge_assertion",
    "meaning_owner",
    "original_reason",
    "reentry_condition",
    "source_ref",
    "qualification_ref",
)

_OS_ORIGINAL_BINDING_MEMBERS = (
    "project_id",
    "template_ref",
    "knowledge_ref",
    "obligation_ref",
    "project_scope",
)

_OS_ORIGINAL_SCOPE_MEMBERS = (
    "product",
    "layer",
    "artifact_id",
)


def _unsupported(contract: str, branch: str, detail: str) -> NotImplementedError:
    error = NotImplementedError(f"{contract}/{branch}: {detail}; Backflow {_BACKFLOW_ID}")
    error._b02_branch_tagged = True
    return error


def _json_equal(left: Any, right: Any) -> bool:
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


def _ref_frame_supplied_ok(value: Any) -> bool:
    if not _ref_shape_ok(value):
        return False
    return all(
        value.get(key) is not None and value.get(key) != ""
        for key in ("identity", "revision", "scope", "owner")
    )


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
    for key in _BINDING_REFS:
        if not _ref_shape_ok(value[key]):
            return False
    for key in ("pack_contract_version", "pack_artifact_version", "version_target"):
        if not isinstance(value[key], (str, type(None))):
            return False
    return isinstance(value["pack_dependency_versions"], list) and all(
        _ref_shape_ok(row) for row in value["pack_dependency_versions"]
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


def _binding_same(left: Any, right: Any) -> bool:
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    if not all(_ref_same(left.get(key), right.get(key)) for key in _BINDING_REFS):
        return False
    for key in ("pack_contract_version", "pack_artifact_version", "version_target"):
        if key not in left or key not in right or not _json_equal(left[key], right[key]):
            return False
    a, b = left.get("pack_dependency_versions"), right.get("pack_dependency_versions")
    return (
        isinstance(a, list)
        and isinstance(b, list)
        and all(any(_ref_same(x, y) for y in b) for x in a)
        and all(any(_ref_same(y, x) for x in a) for y in b)
    )


def _presence_field(container: Any, key: str) -> dict[str, Any]:
    if isinstance(container, dict) and key in container:
        return {"presence": "supplied", "value": copy.deepcopy(container[key])}
    return {"presence": "absent"}


def _copy_refs_in_source_order(refs: list[Any]) -> list[dict[str, Any]]:
    if not isinstance(refs, list) or any(not _ref_shape_ok(ref) for ref in refs):
        raise _unsupported("B02/F09", "non_ref_original_reference", "original/source reference is not a valid Ref")
    return copy.deepcopy(refs)


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


def read_claim_intent(claim: dict[str, Any], claim_locator: str) -> dict[str, Any]:
    """L5 /claim_intent_detail & L4 /dependency_semantic_ports/ports/2 (B02対象kind)。"""
    if not isinstance(claim, dict) or not isinstance(claim_locator, str):
        raise _unsupported("B02/D32", "claim_intent_argument_shape", "claim must be an object and claim_locator a string")
    kind_presence = _presence_field(claim, "kind")
    proposed_presence = _presence_field(claim, "proposed_value")
    kind = claim.get("kind") if "kind" in claim else None

    if kind == "project_obligation_discharge":
        if "proposed_value" in claim and type(claim["proposed_value"]) is bool:
            if claim["proposed_value"] is True:
                intent = "positive"
                reason = "既存030 boolean flag trueの肯定主張を保持する。"
            else:
                intent = "negative"
                reason = "既存030 boolean flag falseの非主張を保持する。"
        else:
            intent = "unresolved"
            reason = "project_obligation_dischargeのproposed_valueはboolean肯定/否定へ解決できない。原値を保持する。"
    elif kind == "field_not_applicable":
        if "proposed_value" in claim and type(claim["proposed_value"]) is str and claim["proposed_value"] in ("not_applicable", "applicable"):
            if claim["proposed_value"] == "not_applicable":
                intent = "positive"
                reason = "Claim kind=field_not_applicable の値表現は肯定。原値を保持しdomain成立を認定しない。"
            else:
                intent = "negative"
                reason = "Claim kind=field_not_applicable の値表現は否定。原値を保持しdomain成立を認定しない。"
        else:
            intent = "unresolved"
            reason = "Claim kind=field_not_applicable の値表現は未解決。原値を保持しdomain成立を認定しない。"
    else:
        raise _unsupported(
            "B02",
            "unsupported_claim_kind",
            f"Claim kind {kind!r} is outside the B02 vertical slice",
        )

    return {
        "claim_locator": claim_locator,
        "claim": copy.deepcopy(claim),
        "kind": kind_presence,
        "proposed_value": proposed_presence,
        "intent": intent,
        "reason": reason,
    }


def read_receipt_claim_origin(supply_input: dict[str, Any], request: dict[str, Any]) -> dict[str, Any]:
    """L4 /dependency_semantic_ports/ports/1 & L5 /dependency_incoming_detail/receipt_origin_mapping。"""
    if not isinstance(supply_input, dict) or not isinstance(request, dict):
        raise _unsupported("B02/DP1", "receipt_origin_argument_shape", "supply_input and request must be objects")
    if set(request) != {"carrier_locator", "consumer_subject_ref", "consumer_binding"}:
        raise _unsupported("B02/DP1", "receipt_projection_request_shape", "request does not match ReceiptProjectionRequest")
    carrier_locator = request["carrier_locator"]
    consumer_subject_ref = request["consumer_subject_ref"]
    consumer_binding = request["consumer_binding"]
    if (
        not isinstance(carrier_locator, str)
        or not _ref_shape_ok(consumer_subject_ref)
        or not _binding_shape_ok(consumer_binding)
    ):
        raise _unsupported("B02/DP1", "receipt_projection_request_member_shape", "ReceiptProjectionRequest members have invalid shape")

    found, carrier = _resolve_rfc6901_pointer(supply_input, carrier_locator)
    carrier_presence = {"presence": "supplied", "value": copy.deepcopy(carrier)} if found else {"presence": "absent"}

    origin = carrier.get("origin") if isinstance(carrier, dict) else None
    origin_subject_presence = _presence_field(origin, "subject_ref") if isinstance(origin, dict) else {"presence": "absent"}
    origin_binding_presence = _presence_field(origin, "binding") if isinstance(origin, dict) else {"presence": "absent"}

    producer_input = carrier.get("producer_input") if isinstance(carrier, dict) else None
    input_claims = producer_input.get("claims") if isinstance(producer_input, dict) else None
    input_flag_presence = (
        _presence_field(input_claims, "receipt_obligation_completed")
        if isinstance(input_claims, dict)
        else {"presence": "absent"}
    )

    producer_return = carrier.get("producer_return") if isinstance(carrier, dict) else None
    return_results = producer_return.get("claim_results") if isinstance(producer_return, dict) else None
    return_flag_presence = (
        _presence_field(return_results, "receipt_obligation_completed")
        if isinstance(return_results, dict)
        else {"presence": "absent"}
    )

    carrier_valid = (
        found
        and isinstance(carrier, dict)
        and isinstance(origin, dict)
        and _ref_frame_supplied_ok(origin.get("subject_ref"))
        and _binding_shape_ok(origin.get("binding"))
        and isinstance(origin.get("basis_refs"), list)
        and all(_ref_shape_ok(ref) for ref in origin["basis_refs"])
        and input_flag_presence["presence"] == "supplied"
        and type(input_flag_presence["value"]) is bool
        and return_flag_presence["presence"] == "supplied"
        and type(return_flag_presence["value"]) is bool
    )
    if not carrier_valid:
        return {
            "request": copy.deepcopy(request),
            "state": "unknown",
            "carrier": carrier_presence,
            "origin_subject_ref": origin_subject_presence,
            "origin_binding": origin_binding_presence,
            "original_flag": input_flag_presence,
            "claim": {"presence": "absent"},
            "source_locators": [carrier_locator] if found else [],
            "problems": [
                {
                    "branch": "carrier_or_origin_absent_or_malformed",
                    "locator": carrier_locator,
                    "original_presence": carrier_presence,
                    "reason": "030 ReceiptClaimCarrierまたはorigin/producer_input/producer_returnが未供給または型不整合のため、Claim投影を行わずunknownを保持する。",
                }
            ],
        }

    source_locators = [
        carrier_locator,
        f"{carrier_locator}/origin",
        f"{carrier_locator}/producer_input/claims/receipt_obligation_completed",
        f"{carrier_locator}/producer_return/claim_results/receipt_obligation_completed",
    ]
    input_flag = input_flag_presence["value"]
    return_flag = return_flag_presence["value"]
    if input_flag is not return_flag:
        return {
            "request": copy.deepcopy(request),
            "state": "conflict",
            "carrier": carrier_presence,
            "origin_subject_ref": origin_subject_presence,
            "origin_binding": origin_binding_presence,
            "original_flag": input_flag_presence,
            "claim": {"presence": "absent"},
            "source_locators": source_locators,
            "problems": [
                {
                    "branch": "input_return_flag_conflict",
                    "locator": f"{carrier_locator}/producer_return/claim_results/receipt_obligation_completed",
                    "original_presence": return_flag_presence,
                    "reason": "030 producer_input.claims.receipt_obligation_completedとproducer_return.claim_results.receipt_obligation_completedのboolean値が相反する。",
                }
            ],
        }

    if not _ref_same(origin["subject_ref"], consumer_subject_ref):
        return {
            "request": copy.deepcopy(request),
            "state": "conflict",
            "carrier": carrier_presence,
            "origin_subject_ref": origin_subject_presence,
            "origin_binding": origin_binding_presence,
            "original_flag": input_flag_presence,
            "claim": {"presence": "absent"},
            "source_locators": source_locators,
            "problems": [
                {
                    "branch": "subject_or_binding_mismatch",
                    "locator": f"{carrier_locator}/origin/subject_ref",
                    "original_presence": origin_subject_presence,
                    "reason": "030 origin.subject_refがconsumer_subject_refと一致しないため、無関係な対象へClaimを投影しない。",
                }
            ],
        }

    if not _binding_same(origin["binding"], consumer_binding):
        return {
            "request": copy.deepcopy(request),
            "state": "conflict",
            "carrier": carrier_presence,
            "origin_subject_ref": origin_subject_presence,
            "origin_binding": origin_binding_presence,
            "original_flag": input_flag_presence,
            "claim": {"presence": "absent"},
            "source_locators": source_locators,
            "problems": [
                {
                    "branch": "subject_or_binding_mismatch",
                    "locator": f"{carrier_locator}/origin/binding",
                    "original_presence": origin_binding_presence,
                    "reason": "030 origin.bindingがconsumer_bindingと全field一致しないため、別bindingのreceiptからClaimを投影しない。",
                }
            ],
        }

    projected_claim = {
        "subject_ref": copy.deepcopy(origin["subject_ref"]),
        "binding": copy.deepcopy(origin["binding"]),
        "actor": "BRAIN",
        "kind": "project_obligation_discharge",
        "proposed_value": input_flag,
        "basis_refs": copy.deepcopy(origin["basis_refs"]),
    }
    return {
        "request": copy.deepcopy(request),
        "state": "resolved",
        "carrier": carrier_presence,
        "origin_subject_ref": origin_subject_presence,
        "origin_binding": origin_binding_presence,
        "original_flag": input_flag_presence,
        "claim": {"presence": "supplied", "value": projected_claim},
        "source_locators": source_locators,
        "problems": [],
    }


def read_os_obligation_incoming(
    validated: dict[str, Any],
    claim: dict[str, Any],
    source_index: int,
) -> dict[str, Any]:
    """L4 /dependency_semantic_ports/producer_incoming/OS & L5 /dependency_incoming_detail/os_incoming_mapping。"""
    if not isinstance(validated, dict) or not isinstance(validated.get("input"), dict) or not isinstance(claim, dict):
        raise _unsupported("B02/DP1", "os_incoming_argument_shape", "validated and claim must be decoded objects")
    raw = validated["input"]
    sources = raw.get("sources")
    if not isinstance(sources, list) or not isinstance(source_index, int) or isinstance(source_index, bool) or source_index < 0 or source_index >= len(sources):
        raise _unsupported("B02/DP1", "os_incoming_source_index", "source_index does not point to a supplied source")
    source = sources[source_index]
    if not isinstance(source, dict) or not isinstance(source.get("content"), dict):
        raise _unsupported("B02/DP1", "os_incoming_source_shape", "OS incoming source content must be an object")

    content = source["content"]
    unknown_keys = set(content) - set(_OS_INCOMING_MEMBERS)
    if unknown_keys:
        raise _unsupported("B02/DP1", "os_incoming_closed_shape", f"unexpected OS incoming keys: {sorted(unknown_keys)}")

    incoming_members = {key: _presence_field(content, key) for key in _OS_INCOMING_MEMBERS}
    orig_proj = content.get("original_project_binding")
    if isinstance(orig_proj, dict):
        if set(orig_proj) - set(_OS_ORIGINAL_BINDING_MEMBERS):
            raise _unsupported("B02/DP1", "os_original_project_binding_closed_shape", "unexpected PortOSOriginalBinding keys")
        original_project_binding_members = {
            key: _presence_field(orig_proj, key) for key in _OS_ORIGINAL_BINDING_MEMBERS
        }
        proj_scope = orig_proj.get("project_scope")
        if isinstance(proj_scope, dict):
            if set(proj_scope) - set(_OS_ORIGINAL_SCOPE_MEMBERS):
                raise _unsupported("B02/DP1", "os_original_scope_closed_shape", "unexpected PortOSOriginalScope keys")
            project_scope_members = {
                key: _presence_field(proj_scope, key) for key in _OS_ORIGINAL_SCOPE_MEMBERS
            }
        else:
            project_scope_members = {key: {"presence": "absent"} for key in _OS_ORIGINAL_SCOPE_MEMBERS}
    else:
        original_project_binding_members = {key: {"presence": "absent"} for key in _OS_ORIGINAL_BINDING_MEMBERS}
        project_scope_members = {key: {"presence": "absent"} for key in _OS_ORIGINAL_SCOPE_MEMBERS}

    # DP-2 boundary: positive discharge_assertion=true is outside the B02/DP-1 vertical slice.
    discharge_assertion = incoming_members["discharge_assertion"]
    if discharge_assertion["presence"] == "supplied" and discharge_assertion["value"] is True:
        raise _unsupported(
            "B02/DP2",
            "os_positive_discharge_assertion",
            "DP-2 positive OS obligation discharge assertion is outside the B02/DP-1 vertical slice",
        )
    if (
        discharge_assertion["presence"] == "supplied"
        and discharge_assertion["value"] is not False
        and discharge_assertion["value"] is not None
    ):
        raise _unsupported(
            "B02/DP1",
            "os_discharge_assertion_type",
            "OSObligationMeaningIncoming.discharge_assertion must be boolean or null when supplied",
        )

    consumer_binding = raw.get("binding") if isinstance(raw.get("binding"), dict) else {}
    claim_binding = claim.get("binding") if isinstance(claim.get("binding"), dict) else {}

    os_source_ref = incoming_members["source_ref"]["value"] if incoming_members["source_ref"]["presence"] == "supplied" else None
    os_qual_ref = incoming_members["qualification_ref"]["value"] if incoming_members["qualification_ref"]["presence"] == "supplied" else None
    os_source_qualified = (
        _ref_shape_ok(os_source_ref)
        and _ref_shape_ok(os_qual_ref)
        and _source_usable(validated, os_source_ref)
    )

    binding_comparison = [
        {
            "left": "incoming.obligation_ref",
            "right": "consumer.binding.requirement_ref",
            "matched": (
                incoming_members["obligation_ref"]["presence"] == "supplied"
                and _ref_same(incoming_members["obligation_ref"]["value"], consumer_binding.get("requirement_ref"))
            ),
        },
        {
            "left": "incoming.subject_ref",
            "right": "consumer.claim.subject_ref",
            "matched": (
                incoming_members["subject_ref"]["presence"] == "supplied"
                and _ref_same(incoming_members["subject_ref"]["value"], claim.get("subject_ref"))
            ),
        },
        {
            "left": "incoming.binding",
            "right": "consumer.claim.binding",
            "matched": (
                incoming_members["binding"]["presence"] == "supplied"
                and _binding_same(incoming_members["binding"]["value"], claim_binding)
            ),
        },
        {
            "left": "incoming.original_project_binding.template_ref",
            "right": "consumer.binding.template_ref",
            "matched": (
                original_project_binding_members["template_ref"]["presence"] == "supplied"
                and _ref_same(original_project_binding_members["template_ref"]["value"], consumer_binding.get("template_ref"))
            ),
        },
        {
            "left": "incoming.original_project_binding.knowledge_ref",
            "right": "consumer.binding.knowledge_ref",
            "matched": (
                original_project_binding_members["knowledge_ref"]["presence"] == "supplied"
                and _ref_same(original_project_binding_members["knowledge_ref"]["value"], consumer_binding.get("knowledge_ref"))
            ),
        },
        {
            "left": "incoming.original_project_binding.obligation_ref",
            "right": "consumer.binding.requirement_ref",
            "matched": (
                original_project_binding_members["obligation_ref"]["presence"] == "supplied"
                and _ref_same(original_project_binding_members["obligation_ref"]["value"], consumer_binding.get("requirement_ref"))
            ),
        },
        {
            "left": "incoming.source_ref",
            "right": "incoming.qualification_ref",
            "matched": os_source_qualified,
        },
    ]

    return {
        "source_locator": f"/sources/{source_index}/content",
        "wrapper_source_ref": copy.deepcopy(source.get("ref")),
        "incoming_members": incoming_members,
        "original_project_binding_members": original_project_binding_members,
        "project_scope_members": project_scope_members,
        "binding_comparison": binding_comparison,
        "positive_support_formed": False,
    }


def read_canonical_dependency_body(validated: dict[str, Any], request: dict[str, Any]) -> dict[str, Any]:
    """L5 /canonical_dependency_detail (normal pathのalways_refs原body未供給branch)。"""
    if not isinstance(validated, dict) or not isinstance(validated.get("input"), dict) or not isinstance(request, dict):
        raise _unsupported("F09/B02", "canonical_read_argument_shape", "validated and request must be objects")
    if set(request) != {"request_ref_locator", "category_locator"}:
        raise _unsupported("F09/B02", "canonical_read_request_shape", "request must have request_ref_locator and category_locator")
    raw = validated["input"]
    req_locator = request["request_ref_locator"]
    cat_locator = request["category_locator"]
    found_cat, category = _resolve_rfc6901_pointer(raw, cat_locator)
    found_ref, requested_ref = _resolve_rfc6901_pointer(raw, req_locator)
    if (
        not found_cat
        or not isinstance(category, list)
        or any(not _ref_frame_supplied_ok(ref) for ref in category)
        or not found_ref
        or not _ref_frame_supplied_ok(requested_ref)
    ):
        raise _unsupported(
            "F09",
            "required_always_ref_missing",
            "canonical dependency category or requested Ref is missing or has an incomplete Ref frame",
        )

    sources = raw.get("sources")
    if not isinstance(sources, list):
        raise _unsupported("F09/B02", "sources_container_shape", "sources must be an array")
    matching_sources = [
        (idx, src)
        for idx, src in enumerate(sources)
        if isinstance(src, dict) and src.get("role") == "semantic_json" and _ref_same(src.get("ref"), requested_ref)
    ]
    if matching_sources:
        raise _unsupported(
            "F09",
            "canonical_body_resolved",
            "canonical dependency source body resolution is outside the B02 vertical slice",
        )

    problem = {
        "branch": "source_absent_or_unusable",
        "locator": req_locator,
        "member": None,
        "original_presence": {"presence": "supplied", "value": copy.deepcopy(requested_ref)},
        "reason": "当該fullRefへ対応するcanonical原source bodyは未供給。限定nested recordは原bodyを代替しない。",
    }
    return {
        "request": copy.deepcopy(request),
        "requested_ref": {"presence": "supplied", "value": copy.deepcopy(requested_ref)},
        "category_refs": copy.deepcopy(category),
        "state": "unknown",
        "records": [],
        "problems": [problem],
    }


def _validate_fn6_slice_dependencies(raw: dict[str, Any], binding: dict[str, Any]) -> None:
    if not _binding_shape_ok(binding) or not _ref_frame_supplied_ok(binding.get("knowledge_ref")):
        raise _unsupported("F09/B02", "binding_or_subject_ref_missing", "input.binding or knowledge_ref is incomplete")
    dependencies = raw.get("dependencies")
    if not isinstance(dependencies, dict):
        raise _unsupported("F09/B02", "dependencies_container_shape", "dependencies must be an object")

    for selector in ("core_return_requested", "core_source_selected", "labo_evaluation_selected"):
        if selector not in dependencies or type(dependencies[selector]) is not bool or dependencies[selector] is not False:
            raise _unsupported(
                "F09",
                "conditional_selector",
                f"dependencies.{selector} is missing, non-boolean, or True (outside B02 normal-dependency slice)",
            )

    for cond_cat in ("core_return_refs", "selected_source_refs", "selected_evaluation_refs"):
        if cond_cat not in dependencies or not isinstance(dependencies[cond_cat], list) or dependencies[cond_cat]:
            raise _unsupported(
                "F09",
                "conditional_selector",
                f"dependencies.{cond_cat} is missing or non-empty while selector is False",
            )

    always_refs = dependencies.get("always_refs")
    if not isinstance(always_refs, list) or len(always_refs) != len(_REQUIRED_ALWAYS_IDENTITIES):
        raise _unsupported(
            "F09",
            "required_always_ref_missing",
            "dependencies.always_refs does not have the 5 required canonical references",
        )
    observed_identities = []
    for ref in always_refs:
        if not _ref_frame_supplied_ok(ref):
            raise _unsupported(
                "F09",
                "required_always_ref_missing",
                "dependencies.always_refs contains an incomplete Ref frame",
            )
        observed_identities.append(ref["identity"])
    if tuple(observed_identities) != _REQUIRED_ALWAYS_IDENTITIES:
        raise _unsupported(
            "F09",
            "required_always_ref_missing",
            "dependencies.always_refs does not match the 5 required canonical identities in order",
        )

    unselected_refs = dependencies.get("unselected_refs")
    if not isinstance(unselected_refs, list) or any(not _ref_frame_supplied_ok(ref) for ref in unselected_refs):
        raise _unsupported("F09/B02", "unselected_refs_shape", "dependencies.unselected_refs is not a valid Ref array")


def _is_os_incoming_content(content: Any) -> bool:
    return isinstance(content, dict) and (
        "original_project_binding" in content
        or "discharge_assertion" in content
        or ("obligation_ref" in content and "original_state" in content)
    )


def _is_receipt_carrier_content(content: Any) -> bool:
    return isinstance(content, dict) and (
        "origin" in content or "producer_input" in content or "producer_return" in content
    )


def _verify_receipt_only_basis_and_incoming(
    validated: dict[str, Any],
    claim: dict[str, Any],
) -> None:
    raw = validated["input"]
    basis_refs = claim.get("basis_refs")
    if not isinstance(basis_refs, list) or not basis_refs or any(not _ref_frame_supplied_ok(ref) for ref in basis_refs):
        raise _unsupported("B02/F09", "claim_basis_refs_unresolved", "B02 claim requires non-empty valid basis_refs")

    sources = raw.get("sources")
    if not isinstance(sources, list):
        raise _unsupported("B02/F09", "sources_container_shape", "sources must be an array")

    for basis_ref in basis_refs:
        matched_sources = [
            (idx, src)
            for idx, src in enumerate(sources)
            if isinstance(src, dict) and src.get("role") == "semantic_json" and _ref_same(src.get("ref"), basis_ref)
        ]
        if matched_sources:
            for idx, src in matched_sources:
                if not _source_usable(validated, src.get("ref")):
                    raise _unsupported("B02/F09", "claim_basis_source_unusable", f"basis source /sources/{idx} is unusable")
                content = src.get("content")
                if _is_receipt_carrier_content(content):
                    read_receipt_claim_origin(
                        raw,
                        {
                            "carrier_locator": f"/sources/{idx}/content",
                            "consumer_subject_ref": copy.deepcopy(claim["subject_ref"]),
                            "consumer_binding": copy.deepcopy(claim["binding"]),
                        },
                    )
                elif _is_os_incoming_content(content):
                    read_os_obligation_incoming(validated, claim, idx)
                else:
                    raise _unsupported(
                        "B02/F09",
                        "claim_basis_source_not_receipt",
                        f"basis source /sources/{idx} is neither a 030 receipt carrier nor OS incoming",
                    )
        else:
            identity = basis_ref.get("identity")
            if not isinstance(identity, str) or "receipt" not in identity.lower():
                raise _unsupported(
                    "B02/F09",
                    "claim_basis_not_receipt",
                    f"basis_ref {identity!r} is not a receipt basis reference",
                )

    for idx, src in enumerate(sources):
        if isinstance(src, dict) and src.get("role") == "semantic_json" and _is_os_incoming_content(src.get("content")):
            if not _source_usable(validated, src.get("ref")):
                raise _unsupported("B02/DP1", "os_incoming_source_unusable", f"OS incoming wrapper /sources/{idx} is unusable")
            read_os_obligation_incoming(validated, claim, idx)


def compare_dependencies_and_handoff(context: dict[str, object]) -> dict[str, object]:
    """fn6: B02/DP-1垂直スライス（常時参照unknown、未選択unobserved、handoff保持、受領≠消込/NA）。"""
    if not isinstance(context, dict) or set(context) != {"validated", "definitions"}:
        raise _unsupported("B02/F09", "dependency_context_shape", "DependencyContext requires validated and definitions")
    validated = context.get("validated")
    definitions = context.get("definitions")
    if not isinstance(validated, dict) or not isinstance(validated.get("input"), dict):
        raise _unsupported("B02/F09", "validated_supply_shape", "compare_dependencies_and_handoff requires a decoded SupplyInput")
    if validated.get("input_issues") != [] or validated.get("unusable_source_refs") != []:
        raise _unsupported("B02/F09", "validated_supply_issues_present", "fn6 B02 slice requires clean ValidatedSupply")

    raw = validated["input"]
    binding = raw.get("binding")
    if not isinstance(binding, dict):
        raise _unsupported("B02/F09", "binding_absent_or_wrong_type", "input.binding must be an object")
    if (
        not isinstance(definitions, dict)
        or set(definitions) != {"axes", "findings", "producer_symbol", "input_binding"}
        or definitions.get("producer_symbol") != "compare_descriptor_definitions"
        or not isinstance(definitions.get("axes"), list)
        or not isinstance(definitions.get("findings"), list)
        or not _binding_same(definitions.get("input_binding"), binding)
    ):
        raise _unsupported("B02/F09", "definitions_comparison_mismatch", "definitions must be the same-snapshot fn1 Comparison")

    _validate_fn6_slice_dependencies(raw, binding)
    subject_ref = binding["knowledge_ref"]
    axes: list[dict[str, Any]] = []
    findings: list[dict[str, Any]] = []

    always_refs = raw["dependencies"]["always_refs"]
    for index in range(len(always_refs)):
        req = {
            "request_ref_locator": f"/dependencies/always_refs/{index}",
            "category_locator": "/dependencies/always_refs",
        }
        body_read = read_canonical_dependency_body(validated, req)
        problem = body_read["problems"][0]
        trace_material = {
            "format": "BRAIN032-F09-axis-reason-trace-v1",
            "producer_symbol": "compare_dependencies_and_handoff",
            "axis": "dependency_reference",
            "state": body_read["state"],
            "subject_ref": copy.deepcopy(subject_ref),
            "binding": copy.deepcopy(binding),
            "original_refs": copy.deepcopy(body_read["category_refs"]),
            "backflow_owner": "knowledge_owner",
            "request_locator": req["request_ref_locator"],
            "source_category_locator": req["category_locator"],
            "cause": copy.deepcopy(body_read["problems"]),
            "canonical_body_support": [],
            "handoff_record": None,
            "selection_observation": None,
        }
        axes.append({
            "subject_ref": copy.deepcopy(subject_ref),
            "binding": copy.deepcopy(binding),
            "axis": "dependency_reference",
            "state": body_read["state"],
            "original_refs": copy.deepcopy(body_read["category_refs"]),
            "reason": f"{problem['reason']}\nTRACE={_serialize_trace(trace_material)}",
            "backflow_owner": "knowledge_owner",
        })

    unselected_refs = raw["dependencies"]["unselected_refs"]
    for index, unselected_ref in enumerate(unselected_refs):
        trace_material = {
            "format": "BRAIN032-F09-axis-reason-trace-v1",
            "producer_symbol": "compare_dependencies_and_handoff",
            "axis": "unselected_source",
            "state": "unobserved",
            "subject_ref": copy.deepcopy(subject_ref),
            "binding": copy.deepcopy(binding),
            "original_refs": [copy.deepcopy(unselected_ref)],
            "backflow_owner": None,
            "request_locator": f"/dependencies/unselected_refs/{index}",
            "source_category_locator": "/dependencies/unselected_refs",
            "cause": None,
            "canonical_body_support": [],
            "handoff_record": None,
            "selection_observation": {
                "core_source_selected": False,
                "labo_evaluation_selected": False,
                "port_call": "not_called_for_unselected_ref",
            },
        }
        axes.append({
            "subject_ref": copy.deepcopy(subject_ref),
            "binding": copy.deepcopy(binding),
            "axis": "unselected_source",
            "state": "unobserved",
            "original_refs": [copy.deepcopy(unselected_ref)],
            "reason": f"未選択sourceは未観測。\nTRACE={_serialize_trace(trace_material)}",
            "backflow_owner": None,
        })

    handoff_records = raw.get("handoff_records")
    if not isinstance(handoff_records, list):
        raise _unsupported("F09/B02", "handoff_records_shape", "handoff_records must be an array")
    for index, record in enumerate(handoff_records):
        if (
            not isinstance(record, dict)
            or set(record) != {"subject_ref", "binding", "state", "source_ref", "reason"}
            or not _ref_frame_supplied_ok(record.get("subject_ref"))
            or not _binding_shape_ok(record.get("binding"))
            or record.get("state") != "not_received"
        ):
            raise _unsupported(
                "F09/B02",
                "handoff_record_outside_slice",
                f"handoff_records[{index}] is outside the B02 not_received slice",
            )
        original_refs = [copy.deepcopy(record["source_ref"])] if isinstance(record.get("source_ref"), dict) else []
        trace_material = {
            "format": "BRAIN032-F09-axis-reason-trace-v1",
            "producer_symbol": "compare_dependencies_and_handoff",
            "axis": "handoff",
            "state": record["state"],
            "subject_ref": copy.deepcopy(record["subject_ref"]),
            "binding": copy.deepcopy(record["binding"]),
            "original_refs": copy.deepcopy(original_refs),
            "backflow_owner": "os_owner",
            "request_locator": f"/handoff_records/{index}",
            "source_category_locator": None,
            "cause": None,
            "canonical_body_support": [],
            "handoff_record": copy.deepcopy(record),
            "selection_observation": None,
        }
        axes.append({
            "subject_ref": copy.deepcopy(record["subject_ref"]),
            "binding": copy.deepcopy(record["binding"]),
            "axis": "handoff",
            "state": record["state"],
            "original_refs": original_refs,
            "reason": f"受渡しstateを原recordから保持。\nTRACE={_serialize_trace(trace_material)}",
            "backflow_owner": "os_owner",
        })

    claims = raw.get("claims")
    if not isinstance(claims, list):
        raise _unsupported("B02/F09", "claims_container_shape", "claims must be an array")
    required_claim_members = {"subject_ref", "binding", "actor", "kind", "proposed_value", "basis_refs"}
    for index, claim in enumerate(claims):
        if not isinstance(claim, dict) or set(claim) != required_claim_members:
            raise _unsupported("B02/F09", "claim_closed_shape", f"claims[{index}] is outside the 6-field Claim shape")
        if (
            not _ref_frame_supplied_ok(claim.get("subject_ref"))
            or not _binding_shape_ok(claim.get("binding"))
            or not _binding_same(claim["binding"], binding)
            or claim.get("actor") != "BRAIN"
        ):
            raise _unsupported("B02/F09", "claim_frame_or_actor", f"claims[{index}] has unsupported subject/binding/actor")

        intent_read = read_claim_intent(claim, f"/claims/{index}")
        if intent_read["intent"] != "positive":
            raise _unsupported(
                "B02",
                "non_positive_claim_intent",
                f"claims[{index}] has non-positive intent {intent_read['intent']!r}",
            )

        _verify_receipt_only_basis_and_incoming(validated, claim)
        kind = claim["kind"]
        if kind == "project_obligation_discharge":
            rule_ref = "HELIXBRAIN-L5-032-R-receipt_as_product_discharge"
            code = "receipt_as_product_discharge"
            axis_name = "obligation_discharge_claim"
            backflow_owner = "os_owner"
            reason = "030受領主張は案件義務成立の根拠にならない。OSの案件義務達成根拠が未供給のため義務状態はunknown。"
        elif kind == "field_not_applicable":
            def_app_axes = [
                ax
                for ax in definitions["axes"]
                if isinstance(ax, dict)
                and isinstance(ax.get("axis"), str)
                and ax["axis"].endswith(".definition_applicability")
                and _binding_same(ax.get("binding"), claim["binding"])
            ]
            if not def_app_axes or any(ax.get("state") != "unknown" for ax in def_app_axes):
                raise _unsupported(
                    "B02",
                    "known_definition_applicability",
                    "field_not_applicable evaluation when definition_applicability is not unknown is outside the B02 slice",
                )
            rule_ref = "HELIXBRAIN-L5-032-R-receipt_as_na"
            code = "receipt_as_na"
            axis_name = "applicability_claim"
            backflow_owner = "core_owner"
            reason = "030受領主張だけでN/Aは成立しない。COREの適用判断・理由・判定者・再評価条件が未供給のためunknown。"
        else:
            raise _unsupported("B02", "unsupported_claim_kind", f"unsupported claim kind {kind!r}")

        basis_copy = _copy_refs_in_source_order(claim["basis_refs"])
        axes.append({
            "subject_ref": copy.deepcopy(claim["subject_ref"]),
            "binding": copy.deepcopy(claim["binding"]),
            "axis": axis_name,
            "state": "unknown",
            "original_refs": basis_copy,
            "reason": reason,
            "backflow_owner": backflow_owner,
        })
        findings.append({
            "code": code,
            "rule_ref": rule_ref,
            "subject_ref": copy.deepcopy(claim["subject_ref"]),
            "binding": copy.deepcopy(claim["binding"]),
            "axis": axis_name,
            "state": "unknown",
            "source_refs": copy.deepcopy(basis_copy),
            "reason": reason,
            "backflow_owner": backflow_owner,
        })

    return {
        "axes": axes,
        "findings": findings,
        "producer_symbol": "compare_dependencies_and_handoff",
        "input_binding": copy.deepcopy(binding),
    }
