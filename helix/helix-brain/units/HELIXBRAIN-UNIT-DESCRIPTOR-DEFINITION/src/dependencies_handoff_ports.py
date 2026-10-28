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
from dependencies_handoff_port_support import (
    _BACKFLOW_ID as _BACKFLOW_ID,
    _DP1_ASSESSMENT_MEMBER_ORDER as _DP1_ASSESSMENT_MEMBER_ORDER,
    _OS_INCOMING_MEMBERS as _OS_INCOMING_MEMBERS,
    _OS_ORIGINAL_BINDING_MEMBERS as _OS_ORIGINAL_BINDING_MEMBERS,
    _OS_ORIGINAL_SCOPE_MEMBERS as _OS_ORIGINAL_SCOPE_MEMBERS,
    _RECEIPT_ORIGIN_MEMBERS as _RECEIPT_ORIGIN_MEMBERS,
    _REQUIRED_ALWAYS_IDENTITIES as _REQUIRED_ALWAYS_IDENTITIES,
    _TRACE_MEMBER_ORDER as _TRACE_MEMBER_ORDER,
    _binding_frame_supplied_ok as _binding_frame_supplied_ok,
    _copy_refs_in_source_order as _copy_refs_in_source_order,
    _os_incoming_shape_ok as _os_incoming_shape_ok,
    _os_original_binding_shape_ok as _os_original_binding_shape_ok,
    _os_original_scope_shape_ok as _os_original_scope_shape_ok,
    _port_presence_shape_ok as _port_presence_shape_ok,
    _presence_field as _presence_field,
    _ref_frame_supplied_ok as _ref_frame_supplied_ok,
    _resolve_rfc6901_pointer as _resolve_rfc6901_pointer,
    _scope_string_same as _scope_string_same,
    _serialize_trace as _serialize_trace,
    _unsupported as _unsupported,
)


def read_claim_intent(claim: dict[str, Any], claim_locator: str) -> dict[str, Any]:
    """L5#/claim_intent_detail & L4#/dependency_semantic_ports/ports/2。"""
    if (
        not isinstance(claim, dict)
        or not isinstance(claim_locator, str)
        or not _is_json_value(claim)
    ):
        raise _unsupported(
            "B02/D32",
            "claim_intent_argument_shape",
            "claim must be a JSON object and claim_locator a string",
        )
    kind_presence = _presence_field(claim, "kind")
    proposed_presence = _presence_field(claim, "proposed_value")
    kind = (
        claim.get("kind")
        if "kind" in claim and isinstance(claim.get("kind"), str)
        else None
    )
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


def read_receipt_claim_origin(
    supply_input: dict[str, Any], request: dict[str, Any]
) -> dict[str, Any]:
    """L4#/dependency_semantic_ports/ports/1 & L5#/dependency_incoming_detail/receipt_origin_mapping。"""
    if not isinstance(supply_input, dict) or not isinstance(request, dict):
        raise _unsupported(
            "B02/DP1",
            "receipt_origin_argument_shape",
            "supply_input and request must be objects",
        )
    if set(request) != {
        "carrier_locator",
        "consumer_subject_ref_locator",
        "consumer_binding_locator",
    }:
        raise _unsupported(
            "B02/DP1",
            "receipt_projection_request_shape",
            "request does not match ReceiptProjectionRequest",
        )
    carrier_locator = request["carrier_locator"]
    subj_locator = request["consumer_subject_ref_locator"]
    bind_locator = request["consumer_binding_locator"]
    if (
        not isinstance(carrier_locator, str)
        or not isinstance(subj_locator, str)
        or not isinstance(bind_locator, str)
    ):
        raise _unsupported(
            "B02/DP1",
            "receipt_projection_request_member_shape",
            "ReceiptProjectionRequest locators must be strings",
        )

    found_carrier, carrier = _resolve_rfc6901_pointer(supply_input, carrier_locator)
    origin = (
        carrier.get("origin") if found_carrier and isinstance(carrier, dict) else None
    )
    if (
        isinstance(origin, dict)
        and "origin_ref" in origin
        and _ref_shape_ok(origin["origin_ref"])
    ):
        origin_ref_presence = {
            "presence": "supplied",
            "value": copy.deepcopy(origin["origin_ref"]),
        }
    else:
        origin_ref_presence = {"presence": "absent"}

    producer_input = (
        carrier.get("producer_input") if isinstance(carrier, dict) else None
    )
    input_claims = (
        producer_input.get("claims") if isinstance(producer_input, dict) else None
    )
    input_flag_ok = (
        isinstance(input_claims, dict)
        and "receipt_obligation_completed" in input_claims
        and type(input_claims["receipt_obligation_completed"]) is bool
    )
    producer_return = (
        carrier.get("producer_return") if isinstance(carrier, dict) else None
    )
    return_results = (
        producer_return.get("claim_results")
        if isinstance(producer_return, dict)
        else None
    )
    return_flag_ok = (
        isinstance(producer_return, dict)
        and _is_json_value(producer_return)
        and (
            not isinstance(return_results, dict)
            or "receipt_obligation_completed" not in return_results
            or (
                type(return_results["receipt_obligation_completed"]) is bool
                and input_flag_ok
                and return_results["receipt_obligation_completed"]
                is input_claims["receipt_obligation_completed"]
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

    found_subj, consumer_subject_ref = _resolve_rfc6901_pointer(
        supply_input, subj_locator
    )
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
    if (
        not isinstance(validated, dict)
        or not isinstance(validated.get("input"), dict)
        or not isinstance(claim, dict)
    ):
        raise _unsupported(
            "B02/DP1",
            "os_incoming_argument_shape",
            "validated and claim must be decoded objects",
        )
    raw = validated["input"]
    sources = raw.get("sources")
    if (
        not isinstance(sources, list)
        or not isinstance(source_index, int)
        or isinstance(source_index, bool)
        or source_index < 0
        or source_index >= len(sources)
    ):
        raise _unsupported(
            "B02/DP1",
            "os_incoming_source_index",
            "source_index does not point to a supplied source",
        )
    source = sources[source_index]
    if not isinstance(source, dict) or not isinstance(source.get("content"), dict):
        raise _unsupported(
            "B02/DP1",
            "os_incoming_source_shape",
            "OS incoming source content must be an object",
        )

    content = source["content"]
    if not _os_incoming_shape_ok(content):
        raise _unsupported(
            "B02/DP1",
            "os_incoming_closed_shape",
            "source.content does not match L4 OSObligationMeaningIncoming closed schema",
        )

    discharge_assertion = content["discharge_assertion"]
    if (
        discharge_assertion.get("presence") == "supplied"
        and discharge_assertion.get("value") is True
    ):
        raise _unsupported(
            "B02/DP2",
            "os_positive_discharge_assertion",
            "DP-2 positive OS obligation discharge assertion is outside the B02/DP-1 vertical slice",
        )

    consumer_binding = (
        raw.get("binding") if isinstance(raw.get("binding"), dict) else {}
    )
    req_ref = (
        consumer_binding.get("requirement_ref")
        if isinstance(consumer_binding.get("requirement_ref"), dict)
        else {}
    )
    consumer_req_scope = (
        req_ref.get("scope") if isinstance(req_ref.get("scope"), dict) else {}
    )

    orig_proj = content["original_project_binding"]
    proj_scope_field = orig_proj["project_scope"]
    proj_scope_val = (
        proj_scope_field.get("value")
        if proj_scope_field.get("presence") == "supplied"
        else None
    )

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
                and _ref_same(
                    consumer_binding.get("requirement_ref"),
                    orig_proj["requirement_ref"].get("value"),
                )
            ),
        },
        {
            "consumer_locator": "/binding/template_ref",
            "os_locator": "/original_project_binding/template_ref/value",
            "matched": (
                orig_proj["template_ref"].get("presence") == "supplied"
                and _ref_same(
                    consumer_binding.get("template_ref"),
                    orig_proj["template_ref"].get("value"),
                )
            ),
        },
        {
            "consumer_locator": "/binding/requirement_ref/scope/project",
            "os_locator": "/original_project_binding/project_scope/value/project/value",
            "matched": _scope_string_same(
                consumer_req_scope, proj_scope_val, "project"
            ),
        },
        {
            "consumer_locator": "/binding/requirement_ref/scope/tenant",
            "os_locator": "/original_project_binding/project_scope/value/tenant/value",
            "matched": _scope_string_same(consumer_req_scope, proj_scope_val, "tenant"),
        },
        {
            "consumer_locator": "/binding/requirement_ref/scope/environment",
            "os_locator": "/original_project_binding/project_scope/value/environment/value",
            "matched": _scope_string_same(
                consumer_req_scope, proj_scope_val, "environment"
            ),
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


def read_canonical_dependency_body(
    validated: dict[str, Any], request: dict[str, Any]
) -> dict[str, Any]:
    """L4#/dependency_semantic_ports/ports/0 & L5#/canonical_dependency_detail。"""
    if (
        not isinstance(validated, dict)
        or not isinstance(validated.get("input"), dict)
        or not isinstance(request, dict)
    ):
        raise _unsupported(
            "F09/B02",
            "canonical_read_argument_shape",
            "validated and request must be objects",
        )
    if set(request) != {"request_ref_locator", "category_locator"}:
        raise _unsupported(
            "F09/B02",
            "canonical_read_request_shape",
            "request must have request_ref_locator and category_locator",
        )
    raw = validated["input"]
    binding = raw.get("binding")
    if not _binding_shape_ok(binding):
        raise _unsupported(
            "F09/B02",
            "binding_or_subject_ref_missing",
            "input.binding is absent or malformed",
        )
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
        raise _unsupported(
            "F09/B02", "sources_container_shape", "sources must be an array"
        )
    matching_sources = [
        (idx, src)
        for idx, src in enumerate(sources)
        if isinstance(src, dict)
        and src.get("role") == "semantic_json"
        and _ref_same(src.get("ref"), requested_ref)
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
