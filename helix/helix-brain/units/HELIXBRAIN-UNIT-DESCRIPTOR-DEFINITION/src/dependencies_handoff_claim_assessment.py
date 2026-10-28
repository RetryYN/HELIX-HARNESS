"""FN6 B02 incoming-claim assessment and applicability checks."""

from __future__ import annotations

import copy
from typing import Any

from dependencies_handoff_ports import (
    _DP1_ASSESSMENT_MEMBER_ORDER,
    _ref_frame_supplied_ok,
    read_os_obligation_incoming,
    read_receipt_claim_origin,
)
from descriptor_definitions import _binding_same, _ref_same, _source_usable
from dependencies_handoff_port_support import _unsupported


def _is_os_incoming_content(content: Any) -> bool:
    return isinstance(content, dict) and (
        "original_project_binding" in content
        or "discharge_assertion" in content
        or ("obligation_ref" in content and "original_state" in content)
    )


def _is_receipt_carrier_content(content: Any) -> bool:
    return isinstance(content, dict) and (
        "origin" in content
        or "producer_input" in content
        or "producer_return" in content
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
    if (
        not isinstance(basis_refs, list)
        or not basis_refs
        or any(not _ref_frame_supplied_ok(ref) for ref in basis_refs)
    ):
        raise _unsupported(
            "B02/F09",
            "claim_basis_refs_unresolved",
            "B02 claim requires non-empty valid basis_refs",
        )

    sources = raw.get("sources")
    if not isinstance(sources, list):
        raise _unsupported(
            "B02/F09", "sources_container_shape", "sources must be an array"
        )

    claim_locator = f"/claims/{claim_index}"
    assessments: list[dict[str, Any]] = []

    for basis_index, basis_ref in enumerate(basis_refs):
        matched_sources = [
            (source_index, src)
            for source_index, src in enumerate(sources)
            if isinstance(src, dict)
            and src.get("role") == "semantic_json"
            and _ref_same(src.get("ref"), basis_ref)
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
                assessments.append(
                    {key: assessment[key] for key in _DP1_ASSESSMENT_MEMBER_ORDER}
                )
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
        isinstance(a["support_components"], dict)
        and all(a["support_components"].values())
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
        raise _unsupported(
            "B02",
            "subject_field_not_found",
            "section_fields or descriptors is not an array",
        )

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
