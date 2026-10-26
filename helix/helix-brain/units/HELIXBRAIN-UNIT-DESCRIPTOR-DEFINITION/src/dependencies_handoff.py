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
from typing import Any

from descriptor_definitions import (
    _binding_same,
    _binding_shape_ok,
    _is_json_value,
    _json_equal,
    _ref_same,
    _ref_shape_ok,
    _source_usable,
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
    error = NotImplementedError(f"{contract}/{branch}: {detail}; Backflow {_BACKFLOW_ID}")
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
        for key in ("requirement_ref", "HARNESS_contract_ref", "template_ref", "semantic_contract_ref")
    )


def _os_incoming_shape_ok(content: Any) -> bool:
    if not isinstance(content, dict) or set(content) != set(_OS_INCOMING_MEMBERS):
        return False
    return (
        _port_presence_shape_ok(content["obligation_ref"], _ref_shape_ok)
        and _port_presence_shape_ok(content["original_state"], lambda v: isinstance(v, str))
        and _ref_shape_ok(content["state_contract_ref"])
        and _is_json_value(content["meaning_body"])
        and _port_presence_shape_ok(content["discharge_assertion"], lambda v: type(v) is bool)
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
        raise _unsupported("B02/F09", "non_ref_original_reference", "original/source reference is not a valid Ref")
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


def read_claim_intent(claim: dict[str, Any], claim_locator: str) -> dict[str, Any]:
    """L5#/claim_intent_detail & L4#/dependency_semantic_ports/ports/2。"""
    if not isinstance(claim, dict) or not isinstance(claim_locator, str) or not _is_json_value(claim):
        raise _unsupported("B02/D32", "claim_intent_argument_shape", "claim must be a JSON object and claim_locator a string")
    kind_presence = _presence_field(claim, "kind")
    proposed_presence = _presence_field(claim, "proposed_value")
    kind = claim.get("kind") if "kind" in claim and isinstance(claim.get("kind"), str) else None
    has_val = "proposed_value" in claim
    val = claim.get("proposed_value") if has_val else None

    if kind == "project_obligation_discharge":
        if has_val and type(val) is bool:
            if val is True:
                intent = "positive"
                reason = "既存030 boolean flag trueの肯定主張を保持する。"
            else:
                intent = "negative"
                reason = "既存030 boolean flag falseの非主張を保持する。"
        else:
            intent = "unresolved"
            reason = "project_obligation_dischargeのproposed_valueはboolean肯定/否定へ解決できない。原値を保持する。"
    elif kind == "field_not_applicable":
        if has_val and type(val) is str and val in ("not_applicable", "applicable"):
            if val == "not_applicable":
                intent = "positive"
                reason = "Claim kind=field_not_applicable の値表現は肯定。原値を保持しdomain成立を認定しない。"
            else:
                intent = "negative"
                reason = "Claim kind=field_not_applicable の値表現は否定。原値を保持しdomain成立を認定しない。"
        else:
            intent = "unresolved"
            reason = "Claim kind=field_not_applicable の値表現は未解決。原値を保持しdomain成立を認定しない。"
    elif kind == "definition_missing_from_receipt":
        if has_val and type(val) is str and val in ("missing", "known"):
            if val == "missing":
                intent = "positive"
                reason = "Claim kind=definition_missing_from_receipt の値表現は肯定。原値を保持しdomain成立を認定しない。"
            else:
                intent = "negative"
                reason = "Claim kind=definition_missing_from_receipt の値表現は否定。原値を保持しdomain成立を認定しない。"
        else:
            intent = "unresolved"
            reason = "Claim kind=definition_missing_from_receipt の値表現は未解決。原値を保持しdomain成立を認定しない。"
    elif kind == "upstream_authority":
        if has_val and type(val) is bool:
            if val is True:
                intent = "positive"
                reason = "Claim kind=upstream_authority の値表現は肯定。原値を保持しdomain成立を認定しない。"
            else:
                intent = "negative"
                reason = "Claim kind=upstream_authority の値表現は否定。原値を保持しdomain成立を認定しない。"
        else:
            intent = "unresolved"
            reason = "Claim kind=upstream_authority の値表現は未解決。原値を保持しdomain成立を認定しない。"
    elif kind == "fill_definition":
        if has_val:
            intent = "positive"
            reason = "供給済みRawValueをnullも含めreplacement内容として保持する。"
        else:
            intent = "unresolved"
            reason = "proposed_valueキー未供給。kindからreplacementを補完しない。"
    elif kind == "require_before_supply":
        if has_val and type(val) is str and val == "future-receiver-completion-receipt":
            intent = "positive"
            reason = "Claim kind=require_before_supply の値表現は肯定。原値を保持しdomain成立を認定しない。"
        elif has_val and type(val) is bool and val is False:
            intent = "negative"
            reason = "Claim kind=require_before_supply の値表現は否定。原値を保持しdomain成立を認定しない。"
        else:
            intent = "unresolved"
            reason = "Claim kind=require_before_supply の値表現は未解決。原値を保持しdomain成立を認定しない。"
    elif kind == "labo_evaluated":
        if has_val and type(val) is bool:
            if val is True:
                intent = "positive"
                reason = "Claim kind=labo_evaluated の値表現は肯定。原値を保持しdomain成立を認定しない。"
            else:
                intent = "negative"
                reason = "Claim kind=labo_evaluated の値表現は否定。原値を保持しdomain成立を認定しない。"
        else:
            intent = "unresolved"
            reason = "Claim kind=labo_evaluated の値表現は未解決。原値を保持しdomain成立を認定しない。"
    else:
        intent = "unresolved"
        reason = "Claim kindを認識できない。原Claim/RawValueを保持し意図を補完しない。"

    return {
        "claim_locator": claim_locator,
        "claim": copy.deepcopy(claim),
        "kind": kind_presence,
        "proposed_value": proposed_presence,
        "intent": intent,
        "reason": reason,
    }


def _binding_frame_supplied_ok(binding: Any) -> bool:
    if not _binding_shape_ok(binding):
        return False
    return all(
        _ref_frame_supplied_ok(binding.get(key))
        for key in ("template_ref", "knowledge_ref", "requirement_ref", "oracle_ref", "pack_ref")
    ) and all(_ref_frame_supplied_ok(r) for r in binding.get("pack_dependency_versions", []))


def read_receipt_claim_origin(supply_input: dict[str, Any], request: dict[str, Any]) -> dict[str, Any]:
    """L4#/dependency_semantic_ports/ports/1 & L5#/dependency_incoming_detail/receipt_origin_mapping。"""
    if not isinstance(supply_input, dict) or not isinstance(request, dict):
        raise _unsupported("B02/DP1", "receipt_origin_argument_shape", "supply_input and request must be objects")
    if set(request) != {"carrier_locator", "consumer_subject_ref_locator", "consumer_binding_locator"}:
        raise _unsupported("B02/DP1", "receipt_projection_request_shape", "request does not match ReceiptProjectionRequest")
    carrier_locator = request["carrier_locator"]
    subj_locator = request["consumer_subject_ref_locator"]
    bind_locator = request["consumer_binding_locator"]
    if (
        not isinstance(carrier_locator, str)
        or not isinstance(subj_locator, str)
        or not isinstance(bind_locator, str)
    ):
        raise _unsupported("B02/DP1", "receipt_projection_request_member_shape", "ReceiptProjectionRequest locators must be strings")

    found_carrier, carrier = _resolve_rfc6901_pointer(supply_input, carrier_locator)
    origin = carrier.get("origin") if found_carrier and isinstance(carrier, dict) else None
    if isinstance(origin, dict) and "origin_ref" in origin and _ref_shape_ok(origin["origin_ref"]):
        origin_ref_presence = {"presence": "supplied", "value": copy.deepcopy(origin["origin_ref"])}
    else:
        origin_ref_presence = {"presence": "absent"}

    producer_input = carrier.get("producer_input") if isinstance(carrier, dict) else None
    input_claims = producer_input.get("claims") if isinstance(producer_input, dict) else None
    input_flag_ok = (
        isinstance(input_claims, dict)
        and "receipt_obligation_completed" in input_claims
        and type(input_claims["receipt_obligation_completed"]) is bool
    )
    producer_return = carrier.get("producer_return") if isinstance(carrier, dict) else None
    return_results = producer_return.get("claim_results") if isinstance(producer_return, dict) else None
    return_flag_ok = (
        isinstance(producer_return, dict)
        and _is_json_value(producer_return)
        and (
            not isinstance(return_results, dict)
            or "receipt_obligation_completed" not in return_results
            or (
                type(return_results["receipt_obligation_completed"]) is bool
                and input_flag_ok
                and return_results["receipt_obligation_completed"] is input_claims["receipt_obligation_completed"]
            )
        )
    )

    carrier_valid = (
        found_carrier
        and isinstance(carrier, dict)
        and set(carrier) == {"origin", "producer_input", "producer_return"}
        and isinstance(origin, dict)
        and set(origin) == set(_RECEIPT_ORIGIN_MEMBERS)
        and _ref_frame_supplied_ok(origin.get("origin_ref"))
        and _ref_frame_supplied_ok(origin.get("subject_ref"))
        and _binding_frame_supplied_ok(origin.get("binding"))
        and isinstance(origin.get("actor"), (str, type(None)))
        and isinstance(origin.get("basis_refs"), list)
        and all(_ref_shape_ok(ref) for ref in origin["basis_refs"])
        and _ref_frame_supplied_ok(origin.get("producer_contract_ref"))
        and input_flag_ok
        and return_flag_ok
    )
    if not carrier_valid:
        return {
            "origin_ref": origin_ref_presence,
            "claim": {"presence": "absent"},
            "state": "unknown",
            "reason": "元carrierのrequired origin/frame/input/returnが未供給又は型不成立。Claimを補完しない。",
            "source_locators": [carrier_locator],
        }

    found_subj, consumer_subject_ref = _resolve_rfc6901_pointer(supply_input, subj_locator)
    found_bind, consumer_binding = _resolve_rfc6901_pointer(supply_input, bind_locator)
    if (
        not found_subj
        or not _ref_frame_supplied_ok(consumer_subject_ref)
        or not found_bind
        or not _binding_frame_supplied_ok(consumer_binding)
    ):
        return {
            "origin_ref": origin_ref_presence,
            "claim": {"presence": "absent"},
            "state": "unknown",
            "reason": "consumer target又はbindingの比較必須memberが未供給又はnull。Claim frameを補完しない。",
            "source_locators": [carrier_locator],
        }

    if not _ref_same(origin["subject_ref"], consumer_subject_ref):
        return {
            "origin_ref": origin_ref_presence,
            "claim": {"presence": "absent"},
            "state": "conflict",
            "reason": "元carrierのsubject_refと同callerのconsumer subject_refがfullRef不一致。030 flagを別targetへ投影しない。",
            "source_locators": [carrier_locator],
        }

    if not _binding_same(origin["binding"], consumer_binding):
        return {
            "origin_ref": origin_ref_presence,
            "claim": {"presence": "absent"},
            "state": "conflict",
            "reason": "元carrierのbindingと同callerのconsumer bindingが既知不一致。030 flagを別bindingへ投影しない。",
            "source_locators": [carrier_locator],
        }

    input_flag = input_claims["receipt_obligation_completed"]
    projected_claim = {
        "subject_ref": copy.deepcopy(origin["subject_ref"]),
        "binding": copy.deepcopy(origin["binding"]),
        "actor": origin["actor"],
        "kind": "project_obligation_discharge",
        "proposed_value": input_flag,
        "basis_refs": copy.deepcopy(origin["basis_refs"]),
    }
    return {
        "origin_ref": origin_ref_presence,
        "claim": {"presence": "supplied", "value": projected_claim},
        "state": "resolved",
        "reason": "同元生成recordのtargetとfull Bindingを保持し、030 boolean flagを原値でClaimへ投影した。実義務成立を認定しない。",
        "source_locators": [carrier_locator],
    }


def _scope_string_same(consumer_scope: Any, os_proj_scope: Any, key: str) -> bool:
    if not isinstance(consumer_scope, dict) or not isinstance(os_proj_scope, dict):
        return False
    left = consumer_scope.get(key)
    right_field = os_proj_scope.get(key)
    if not isinstance(left, str) or not isinstance(right_field, dict):
        return False
    if right_field.get("presence") != "supplied" or not isinstance(right_field.get("value"), str):
        return False
    return left == right_field["value"]


def read_os_obligation_incoming(
    validated: dict[str, Any],
    claim: dict[str, Any],
    source_index: int,
    *,
    claim_index: int = 0,
    basis_index: int = 0,
    claim_intent: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """L4#/dependency_semantic_ports/producer_incoming/OS & L5#/dependency_incoming_detail。"""
    if not isinstance(validated, dict) or not isinstance(validated.get("input"), dict) or not isinstance(claim, dict):
        raise _unsupported("B02/DP1", "os_incoming_argument_shape", "validated and claim must be decoded objects")
    raw = validated["input"]
    sources = raw.get("sources")
    if (
        not isinstance(sources, list)
        or not isinstance(source_index, int)
        or isinstance(source_index, bool)
        or source_index < 0
        or source_index >= len(sources)
    ):
        raise _unsupported("B02/DP1", "os_incoming_source_index", "source_index does not point to a supplied source")
    source = sources[source_index]
    if not isinstance(source, dict) or not isinstance(source.get("content"), dict):
        raise _unsupported("B02/DP1", "os_incoming_source_shape", "OS incoming source content must be an object")

    content = source["content"]
    if not _os_incoming_shape_ok(content):
        raise _unsupported(
            "B02/DP1",
            "os_incoming_closed_shape",
            "source.content does not match L4 OSObligationMeaningIncoming closed schema",
        )

    discharge_assertion = content["discharge_assertion"]
    if discharge_assertion.get("presence") == "supplied" and discharge_assertion.get("value") is True:
        raise _unsupported(
            "B02/DP2",
            "os_positive_discharge_assertion",
            "DP-2 positive OS obligation discharge assertion is outside the B02/DP-1 vertical slice",
        )

    consumer_binding = raw.get("binding") if isinstance(raw.get("binding"), dict) else {}
    req_ref = consumer_binding.get("requirement_ref") if isinstance(consumer_binding.get("requirement_ref"), dict) else {}
    consumer_req_scope = req_ref.get("scope") if isinstance(req_ref.get("scope"), dict) else {}

    orig_proj = content["original_project_binding"]
    proj_scope_field = orig_proj["project_scope"]
    proj_scope_val = proj_scope_field.get("value") if proj_scope_field.get("presence") == "supplied" else None

    obligation_ref_field = content["obligation_ref"]
    obligation_subject_matched = (
        True
        if claim.get("kind") != "project_obligation_discharge"
        else (
            obligation_ref_field.get("presence") == "supplied"
            and _ref_same(claim.get("subject_ref"), obligation_ref_field.get("value"))
        )
    )

    os_binding_comparison = [
        {
            "consumer_locator": "/binding",
            "os_locator": "/binding",
            "matched": _binding_same(consumer_binding, content["binding"]),
        },
        {
            "consumer_locator": f"/claims/{claim_index}/subject_ref",
            "os_locator": "/obligation_ref/value",
            "matched": obligation_subject_matched,
        },
        {
            "consumer_locator": "/binding/requirement_ref",
            "os_locator": "/original_project_binding/requirement_ref/value",
            "matched": (
                orig_proj["requirement_ref"].get("presence") == "supplied"
                and _ref_same(consumer_binding.get("requirement_ref"), orig_proj["requirement_ref"].get("value"))
            ),
        },
        {
            "consumer_locator": "/binding/template_ref",
            "os_locator": "/original_project_binding/template_ref/value",
            "matched": (
                orig_proj["template_ref"].get("presence") == "supplied"
                and _ref_same(consumer_binding.get("template_ref"), orig_proj["template_ref"].get("value"))
            ),
        },
        {
            "consumer_locator": "/binding/requirement_ref/scope/project",
            "os_locator": "/original_project_binding/project_scope/value/project/value",
            "matched": _scope_string_same(consumer_req_scope, proj_scope_val, "project"),
        },
        {
            "consumer_locator": "/binding/requirement_ref/scope/tenant",
            "os_locator": "/original_project_binding/project_scope/value/tenant/value",
            "matched": _scope_string_same(consumer_req_scope, proj_scope_val, "tenant"),
        },
        {
            "consumer_locator": "/binding/requirement_ref/scope/environment",
            "os_locator": "/original_project_binding/project_scope/value/environment/value",
            "matched": _scope_string_same(consumer_req_scope, proj_scope_val, "environment"),
        },
    ]

    os_source_ref = content["source_ref"]
    os_qual_field = content["qualification_ref"]
    os_source_qualified = (
        _ref_frame_supplied_ok(os_source_ref)
        and os_qual_field.get("presence") == "supplied"
        and _ref_frame_supplied_ok(os_qual_field.get("value"))
        and _source_usable(validated, os_source_ref)
    )

    support_components = {
        "meaning_owner_proposition": False,
        "target_correspondence": all(row["matched"] for row in os_binding_comparison),
        "existing_source_qualification": os_source_qualified,
    }

    claim_locator = f"/claims/{claim_index}"
    resolved_intent = (
        copy.deepcopy(claim_intent)
        if isinstance(claim_intent, dict)
        else read_claim_intent(claim, claim_locator)
    )
    basis_refs = claim.get("basis_refs")
    basis_ref = (
        copy.deepcopy(basis_refs[basis_index])
        if isinstance(basis_refs, list) and 0 <= basis_index < len(basis_refs)
        else copy.deepcopy(source.get("ref"))
    )

    assessment = {
        "claim_locator": claim_locator,
        "claim_index": claim_index,
        "raw_claim": copy.deepcopy(claim),
        "claim_intent": resolved_intent,
        "basis_index": basis_index,
        "basis_ref": basis_ref,
        "source_index": source_index,
        "raw_body": copy.deepcopy(content),
        "typed_body": copy.deepcopy(content),
        "request": None,
        "projection_read": None,
        "os_binding_comparison": os_binding_comparison,
        "support_components": support_components,
    }
    return {key: assessment[key] for key in _DP1_ASSESSMENT_MEMBER_ORDER}


def read_canonical_dependency_body(validated: dict[str, Any], request: dict[str, Any]) -> dict[str, Any]:
    """L4#/dependency_semantic_ports/ports/0 & L5#/canonical_dependency_detail。"""
    if not isinstance(validated, dict) or not isinstance(validated.get("input"), dict) or not isinstance(request, dict):
        raise _unsupported("F09/B02", "canonical_read_argument_shape", "validated and request must be objects")
    if set(request) != {"request_ref_locator", "category_locator"}:
        raise _unsupported("F09/B02", "canonical_read_request_shape", "request must have request_ref_locator and category_locator")
    raw = validated["input"]
    binding = raw.get("binding")
    if not _binding_shape_ok(binding):
        raise _unsupported("F09/B02", "binding_or_subject_ref_missing", "input.binding is absent or malformed")
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
        "state": "unknown",
        "request_locator": req_locator,
        "source_locators": [],
        "member": "canonical_source",
        "original_presence": {"presence": "absent"},
        "reason": "当該fullRefへ対応するcanonical原source bodyは未供給。限定nested recordは原bodyを代替しない。",
    }
    return {
        "target_ref": {"presence": "supplied", "value": copy.deepcopy(requested_ref)},
        "binding": {"presence": "supplied", "value": copy.deepcopy(binding)},
        "state": "unknown",
        "records": [],
        "problems": [problem],
        "category_refs": copy.deepcopy(category),
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


def _assess_b02_claim_basis(
    validated: dict[str, Any],
    claim: dict[str, Any],
    claim_index: int,
    claim_intent: dict[str, Any],
) -> list[dict[str, Any]]:
    """L5#/dependency_incoming_detail: claim.basis_refsに対応するsourceのみを原順で検査しDP1IncomingAssessment[]を返す。"""
    raw = validated["input"]
    basis_refs = claim.get("basis_refs")
    if not isinstance(basis_refs, list) or not basis_refs or any(not _ref_frame_supplied_ok(ref) for ref in basis_refs):
        raise _unsupported("B02/F09", "claim_basis_refs_unresolved", "B02 claim requires non-empty valid basis_refs")

    sources = raw.get("sources")
    if not isinstance(sources, list):
        raise _unsupported("B02/F09", "sources_container_shape", "sources must be an array")

    claim_locator = f"/claims/{claim_index}"
    assessments: list[dict[str, Any]] = []

    for basis_index, basis_ref in enumerate(basis_refs):
        matched_sources = [
            (source_index, src)
            for source_index, src in enumerate(sources)
            if isinstance(src, dict) and src.get("role") == "semantic_json" and _ref_same(src.get("ref"), basis_ref)
        ]
        if not matched_sources:
            raise _unsupported(
                "B02",
                "claim_basis_not_receipt",
                f"claims[{claim_index}].basis_refs[{basis_index}] does not resolve to any qualified receipt source",
            )
        for source_index, src in matched_sources:
            if not _source_usable(validated, src.get("ref")):
                raise _unsupported(
                    "B02/F09",
                    "claim_basis_source_unusable",
                    f"basis source /sources/{source_index} is unusable",
                )
            content = src.get("content")
            if _is_receipt_carrier_content(content):
                request = {
                    "carrier_locator": f"/sources/{source_index}/content",
                    "consumer_subject_ref_locator": f"/claims/{claim_index}/subject_ref",
                    "consumer_binding_locator": f"/claims/{claim_index}/binding",
                }
                projection_read = read_receipt_claim_origin(raw, request)
                if projection_read["state"] == "unknown":
                    raise _unsupported(
                        "B02/DP1",
                        "receipt_carrier_unresolved",
                        f"receipt carrier at /sources/{source_index}/content is malformed or unresolved",
                    )
                assessment = {
                    "claim_locator": claim_locator,
                    "claim_index": claim_index,
                    "raw_claim": copy.deepcopy(claim),
                    "claim_intent": copy.deepcopy(claim_intent),
                    "basis_index": basis_index,
                    "basis_ref": copy.deepcopy(basis_ref),
                    "source_index": source_index,
                    "raw_body": copy.deepcopy(content),
                    "typed_body": copy.deepcopy(content),
                    "request": request,
                    "projection_read": projection_read,
                    "os_binding_comparison": None,
                    "support_components": None,
                }
                assessments.append({key: assessment[key] for key in _DP1_ASSESSMENT_MEMBER_ORDER})
            elif _is_os_incoming_content(content):
                assessments.append(
                    read_os_obligation_incoming(
                        validated,
                        claim,
                        source_index,
                        claim_index=claim_index,
                        basis_index=basis_index,
                        claim_intent=claim_intent,
                    )
                )
            else:
                raise _unsupported(
                    "B02",
                    "claim_basis_not_receipt",
                    f"basis source /sources/{source_index} is neither a 030 receipt carrier nor OS incoming",
                )

    has_receipt_basis = any(a["projection_read"] is not None for a in assessments)
    if not has_receipt_basis:
        raise _unsupported(
            "B02",
            "claim_basis_not_receipt",
            f"claims[{claim_index}] has no 030 ReceiptClaimCarrier in basis_refs",
        )

    has_positive_os_support = any(
        isinstance(a["support_components"], dict) and all(a["support_components"].values())
        for a in assessments
    )
    if has_positive_os_support:
        raise _unsupported(
            "B02/DP2",
            "os_positive_discharge_assertion",
            "positive OS obligation discharge support is outside the B02/DP-1 vertical slice",
        )

    return assessments


def _verify_na_claim_subject_applicability_unknown(
    raw: dict[str, Any],
    definitions: dict[str, Any],
    claim: dict[str, Any],
    claim_index: int,
) -> None:
    section_fields = raw.get("section_fields")
    descriptors = raw.get("descriptors")
    if not isinstance(section_fields, list) or not isinstance(descriptors, list):
        raise _unsupported("B02", "subject_field_not_found", "section_fields or descriptors is not an array")

    matched_fields = [
        sf
        for sf in section_fields
        if isinstance(sf, dict) and _ref_same(sf.get("ref"), claim["subject_ref"])
    ]
    if not matched_fields:
        raise _unsupported(
            "B02",
            "subject_field_not_found",
            f"claims[{claim_index}].subject_ref does not match any section_fields[].ref in the same binding",
        )

    matched_slots = [
        slot
        for sf in matched_fields
        if _ref_frame_supplied_ok(sf.get("descriptor_slot_ref"))
        for slot in descriptors
        if isinstance(slot, dict)
        and slot.get("slot_identity") == sf["descriptor_slot_ref"].get("identity")
        and _binding_same(slot.get("binding"), claim["binding"])
    ]
    if not matched_slots:
        raise _unsupported(
            "B02",
            "subject_field_not_found",
            f"claims[{claim_index}].subject_ref descriptor_slot_ref does not resolve to any descriptor slot",
        )

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
        problems = body_read["problems"]
        cause_value: Any
        if not problems:
            cause_value = None
        elif len(problems) == 1:
            cause_value = copy.deepcopy(problems[0])
        else:
            cause_value = copy.deepcopy(problems)
        prefix = problems[0]["reason"]
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
            "cause": cause_value,
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
            "reason": f"{prefix}\nTRACE={_serialize_trace(trace_material)}",
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
        if not _ref_frame_supplied_ok(record.get("source_ref")):
            raise _unsupported(
                "F09/B02",
                "handoff_source_ref_absent",
                f"handoff_records[{index}].source_ref is null or incomplete",
            )
        original_refs = [copy.deepcopy(record["source_ref"])]
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
        if not _ref_frame_supplied_ok(claim.get("subject_ref")) or not _binding_shape_ok(claim.get("binding")) or claim.get("actor") != "BRAIN":
            raise _unsupported("B02/F09", "claim_frame_or_actor", f"claims[{index}] has unsupported subject/binding/actor")
        if not _binding_same(claim["binding"], binding):
            raise _unsupported("B02", "claim_binding_mismatch", f"claims[{index}].binding does not match input.binding")

        kind = claim.get("kind")
        if kind not in {"project_obligation_discharge", "field_not_applicable"}:
            raise _unsupported(
                "B02",
                "unsupported_claim_kind",
                f"Claim kind {kind!r} is outside the B02 vertical slice",
            )

        intent_read = read_claim_intent(claim, f"/claims/{index}")
        if intent_read["intent"] != "positive":
            raise _unsupported(
                "B02",
                "non_positive_claim_intent",
                f"claims[{index}] has non-positive intent {intent_read['intent']!r}",
            )

        assessments = _assess_b02_claim_basis(validated, claim, index, intent_read)
        if not assessments:
            raise _unsupported("B02", "claim_basis_not_receipt", f"claims[{index}] produced no basis assessments")

        if kind == "project_obligation_discharge":
            rule_ref = "HELIXBRAIN-L5-032-R-receipt_as_product_discharge"
            code = "receipt_as_product_discharge"
            axis_name = "obligation_discharge_claim"
            backflow_owner = "os_owner"
            reason = "030受領主張は案件義務成立の根拠にならない。OSの案件義務達成根拠が未供給のため義務状態はunknown。"
        else:
            _verify_na_claim_subject_applicability_unknown(raw, definitions, claim, index)
            rule_ref = "HELIXBRAIN-L5-032-R-receipt_as_na"
            code = "receipt_as_na"
            axis_name = "applicability_claim"
            backflow_owner = "core_owner"
            reason = "030受領主張だけでN/Aは成立しない。COREの適用判断・理由・判定者・再評価条件が未供給のためunknown。"

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
