"""fn3 bilateral endpoint owner/source reads."""

from __future__ import annotations

import copy
from typing import Any

from descriptor_definitions import (
    _ref_same,
    _wire_ref_shape_ok,
)
from identity_trace_support import (
    _fn3_left_owner_body_formed,
    _fn3_qualification_rows,
    _fn3_qualified_owner_source,
    _fn3_range_declaration_formed,
    _fn3_root_rows,
    _fn3_scope_relation,
    _fn3_source_rows,
    _fn3_valid_source,
    _fn3_wire_full_ref,
)


def _fn3_owner_source(
    raw: dict[str, Any], candidate_ref: Any, unusable: list[Any], record_ref: Any
) -> list[tuple[int, dict[str, Any], dict[str, Any]]]:
    found = []
    for index, source in enumerate(raw.get("sources", [])):
        if (
            not isinstance(source, dict)
            or source.get("role") != "semantic_json"
            or not _fn3_qualified_owner_source(raw, source, unusable)
        ):
            continue
        body = source.get("content")
        if not isinstance(body, dict):
            continue
        if record_ref is not None and not _ref_same(
            body.get("compatibility_record_ref"), record_ref
        ):
            continue
        found.append((index, source, body))
    return found


def _fn3_endpoint_owner_reads(
    raw: dict[str, Any],
    record: dict[str, Any],
    unusable: list[Any],
    endpoint: str,
    direct_sources: list[tuple[int, dict[str, Any]]] | None = None,
) -> list[dict[str, Any]]:
    """Construct the closed endpoint read from original source occurrences."""
    target = record.get("left_ref" if endpoint == "left" else "right_ref")
    if direct_sources is None:
        if endpoint == "right":
            direct_sources = _fn3_source_rows(raw, record.get("source_ref"))
        else:
            direct_sources = [
                (i, s)
                for i, s, _body in _fn3_owner_source(
                    raw, target, unusable, record.get("ref")
                )
            ]
    rows = []
    for source_index, source in direct_sources:
        body = source.get("content") if isinstance(source, dict) else None
        source_ref = source.get("ref") if isinstance(source, dict) else None
        scope = source_ref.get("scope") if isinstance(source_ref, dict) else None
        target_scope = raw.get("binding", {}).get("template_ref", {}).get("scope")
        relation = _fn3_scope_relation(scope, target_scope)
        container = body.get("compatible_refs") if isinstance(body, dict) else None
        endpoint_formed = _fn3_wire_full_ref(target)
        occurrences = []
        matches = []
        unresolved_member = False
        if isinstance(container, list):
            for ref_index, ref in enumerate(container):
                ref_shape_ok = _wire_ref_shape_ok(ref)
                full_tuple_observed = _fn3_wire_full_ref(ref)
                relation_to_target = (
                    "corresponding"
                    if endpoint_formed
                    and full_tuple_observed
                    and _ref_same(ref, target)
                    else "different"
                    if endpoint_formed and full_tuple_observed
                    else "unestablished"
                )
                if relation_to_target == "corresponding":
                    matches.append(ref_index)
                elif relation_to_target == "unestablished":
                    unresolved_member = True
                occurrences.append(
                    {
                        "ref_index": ref_index,
                        "locator": f"/sources/{source_index}/content/compatible_refs/{ref_index}",
                        "original_read": {
                            "presence": "supplied",
                            "value": copy.deepcopy(ref),
                        },
                        "read_classification": (
                            "null"
                            if ref is None
                            else "supplied"
                            if ref_shape_ok
                            else "out_of_type"
                        ),
                        "full_ref_relation": relation_to_target,
                    }
                )
            if not endpoint_formed:
                member_cause, member_state = "endpoint_unresolved", "unknown"
            elif matches:
                member_cause, member_state = "matching_refs", "resolved"
            elif unresolved_member:
                member_cause, member_state = "member_unresolved", "unknown"
            else:
                member_cause, member_state = "member_no_match", "unknown"
        else:
            member_state = "unknown"
            if not endpoint_formed:
                member_cause = "endpoint_unresolved"
                container_read = (
                    {"presence": "supplied", "value": copy.deepcopy(container)}
                    if isinstance(body, dict) and "compatible_refs" in body
                    else {"presence": "absent"}
                )
            elif "compatible_refs" not in body if isinstance(body, dict) else True:
                member_cause = "container_absent"
                container_read = {"presence": "absent"}
            elif container is None:
                member_cause = "container_null"
                container_read = {"presence": "supplied", "value": None}
            else:
                member_cause = "container_type"
                container_read = {
                    "presence": "supplied",
                    "value": copy.deepcopy(container),
                }
        if isinstance(container, list):
            container_read = {"presence": "supplied", "value": copy.deepcopy(container)}
        body_read = (
            {"presence": "supplied", "value": copy.deepcopy(body)}
            if isinstance(body, dict)
            else {"presence": "absent"}
        )
        declaration = (
            body.get("endpoint_owner_declaration") if isinstance(body, dict) else None
        )
        qualified = _fn3_valid_source(raw, source, unusable)
        if endpoint == "left":
            declaration_ok = (
                _fn3_left_owner_body_formed(body)
                and isinstance(declaration, dict)
                and declaration.get("endpoint") == "left"
                and _ref_same(declaration.get("endpoint_ref"), target)
                and declaration.get("owner")
                == (target.get("owner") if isinstance(target, dict) else None)
                and _ref_same(body.get("compatibility_record_ref"), record.get("ref"))
            )
            counterpart_rows = _fn3_source_rows(raw, record.get("source_ref"))
            counterpart_qualified = any(
                _fn3_valid_source(raw, row, unusable)
                for _index, row in counterpart_rows
            )
            counterpart_linked = (
                _ref_same(body.get("counterpart_source_ref"), record.get("source_ref"))
                and counterpart_qualified
            )
            if not qualified:
                owner_state, owner_cause = "unknown", "owner_qualification_unresolved"
            elif not declaration_ok:
                owner_state, owner_cause = "unknown", "owner_subject_unresolved"
            elif not counterpart_rows:
                owner_state, owner_cause = "unknown", "owner_counterpart_unresolved"
            elif not counterpart_qualified:
                owner_state, owner_cause = "unknown", "owner_qualification_unresolved"
            elif not counterpart_linked:
                owner_state, owner_cause = "unknown", "owner_counterpart_unresolved"
            elif relation == "different":
                owner_state, owner_cause = "conflict", "owner_scope_differs"
            elif relation == "unobserved":
                owner_state, owner_cause = "unknown", "owner_subject_unresolved"
            elif (
                type(record.get("compatible")) is not bool
                or type(declaration.get("compatible")) is not bool
            ):
                owner_state, owner_cause = "unknown", "owner_decision_unresolved"
            elif record.get("compatible") is not declaration.get("compatible"):
                owner_state, owner_cause = "conflict", "owner_decision_differs"
            elif relation == "same":
                owner_state, owner_cause = "resolved", "owner_body_corresponding"
            else:
                owner_state, owner_cause = "unknown", "owner_subject_unresolved"
        else:
            range_declaration = (
                body.get("compatibility_range_declaration")
                if isinstance(body, dict)
                else None
            )
            range_owner_support = (
                _fn3_range_declaration_formed(range_declaration)
                and _ref_same(range_declaration.get("left_ref"), record.get("left_ref"))
                and _ref_same(range_declaration.get("right_ref"), target)
                and _ref_same(
                    range_declaration.get("actual_pack_ref"),
                    raw.get("binding", {}).get("pack_ref"),
                )
                and any(
                    _ref_same(owner.get("endpoint_ref"), target)
                    and owner.get("owner") == source_ref.get("owner")
                    for owner in range_declaration.get("owner_declarations", [])
                    if isinstance(owner, dict)
                )
            )
            source_owner_matches = (
                _fn3_wire_full_ref(source_ref)
                and endpoint_formed
                and source_ref.get("owner") == target.get("owner")
            )
            subject_candidate = source_owner_matches and (
                member_state == "resolved" or range_owner_support
            )
            record_decision = record.get("compatible")
            body_decision = body.get("compatible") if isinstance(body, dict) else None
            if not endpoint_formed or not source_owner_matches:
                owner_state, owner_cause = "unknown", "owner_subject_unresolved"
            elif not qualified:
                owner_state, owner_cause = "unknown", "owner_qualification_unresolved"
            elif not subject_candidate:
                owner_state, owner_cause = "unknown", "owner_subject_unresolved"
            elif relation == "different":
                owner_state, owner_cause = "conflict", "owner_scope_differs"
            elif relation != "same":
                owner_state, owner_cause = "unknown", "owner_subject_unresolved"
            elif type(record_decision) is not bool or type(body_decision) is not bool:
                owner_state, owner_cause = "unknown", "owner_decision_unresolved"
            elif record_decision != body_decision:
                owner_state, owner_cause = "conflict", "owner_decision_differs"
            elif record_decision is True and member_state == "resolved":
                owner_state, owner_cause = "resolved", "owner_body_corresponding"
            elif record_decision is False and range_owner_support:
                owner_state, owner_cause = "resolved", "owner_body_corresponding"
            elif record_decision is False:
                owner_state, owner_cause = "unknown", "owner_decision_unresolved"
            else:
                owner_state, owner_cause = "unknown", "owner_subject_unresolved"
        membership = {
            "source_index": source_index,
            "endpoint_locator": "/binding/"
            + ("template_ref" if endpoint == "left" else "pack_ref"),
            "endpoint_read": {"presence": "supplied", "value": copy.deepcopy(target)},
            "container_read": container_read,
            "occurrences": occurrences,
            "matching_ref_indices": matches,
            "state": member_state,
            "cause": member_cause,
            "meaning_limit": "raw_endpoint_ref_membership_only",
        }
        record_ref_read = (
            {
                "presence": "supplied",
                "value": copy.deepcopy(body["compatibility_record_ref"]),
            }
            if isinstance(body, dict) and "compatibility_record_ref" in body
            else {"presence": "absent"}
        )
        counterpart_read = (
            {
                "presence": "supplied",
                "value": copy.deepcopy(body["counterpart_source_ref"]),
            }
            if isinstance(body, dict) and "counterpart_source_ref" in body
            else {"presence": "absent"}
        )
        rows.append(
            {
                "endpoint": endpoint,
                "source_index": source_index,
                "membership": membership,
                "body_read": body_read,
                "record_ref_read": record_ref_read,
                "counterpart_source_ref_read": counterpart_read,
                "target_scope_relation": relation,
                "state": owner_state,
                "cause": owner_cause,
            }
        )
    return rows


def _fn3_source_reference_block(
    raw: dict[str, Any], refs: list[Any]
) -> tuple[list[int], list[dict[str, Any]]]:
    indices = sorted(
        {
            index
            for ref in refs
            if isinstance(ref, dict)
            for index, _ in _fn3_source_rows(raw, ref)
        }
    )
    projected: list[dict[str, Any]] = []
    for index in indices:
        source = raw["sources"][index]
        projected.append(source["ref"])
        if isinstance(source.get("qualification_ref"), dict):
            projected.append(source["qualification_ref"])
        for _qi, qualification in _fn3_qualification_rows(
            raw, source.get("qualification_ref")
        ):
            if isinstance(qualification.get("ref"), dict):
                projected.append(qualification["ref"])
            projected.extend(
                root for _ri, root in _fn3_root_rows(raw, qualification.get("root_ref"))
            )
    return indices, projected
