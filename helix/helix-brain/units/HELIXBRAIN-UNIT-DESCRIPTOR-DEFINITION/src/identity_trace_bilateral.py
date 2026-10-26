"""fn3 bilateral compatibility とendpoint ownerの読取を担う。"""
from __future__ import annotations
import copy
from typing import Any
from descriptor_definitions import (
    _binding_same,
    _json_equal,
    _ref_same,
    _wire_ref_shape_ok,
)
from identity_trace_support import (
    _fn3_axis,
    _fn3_diag,
    _fn3_finding,
    _fn3_left_owner_body_formed,
    _fn3_qualification_rows,
    _fn3_qualified_owner_source,
    _fn3_range_declaration_formed,
    _fn3_root_rows,
    _fn3_scope_relation,
    _fn3_source_rows,
    _fn3_stop,
    _fn3_valid_source,
    _fn3_wire_full_ref,
)

def _fn3_owner_source(raw: dict[str, Any], candidate_ref: Any, unusable: list[Any],
                      record_ref: Any) -> list[tuple[int, dict[str, Any], dict[str, Any]]]:
    found = []
    for index, source in enumerate(raw.get("sources", [])):
        if not isinstance(source, dict) or source.get("role") != "semantic_json" or not _fn3_qualified_owner_source(raw, source, unusable):
            continue
        body = source.get("content")
        if not isinstance(body, dict):
            continue
        if record_ref is not None and not _ref_same(body.get("compatibility_record_ref"), record_ref):
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
                raw, target, unusable, record.get("ref"))]
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
                    "corresponding" if endpoint_formed and full_tuple_observed and _ref_same(ref, target)
                    else "different" if endpoint_formed and full_tuple_observed
                    else "unestablished"
                )
                if relation_to_target == "corresponding":
                    matches.append(ref_index)
                elif relation_to_target == "unestablished":
                    unresolved_member = True
                occurrences.append({
                    "ref_index": ref_index,
                    "locator": f"/sources/{source_index}/content/compatible_refs/{ref_index}",
                    "original_read": {"presence": "supplied", "value": copy.deepcopy(ref)},
                    "read_classification": ("null" if ref is None else
                                            "supplied" if ref_shape_ok else "out_of_type"),
                    "full_ref_relation": relation_to_target,
                })
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
                container_read = ({"presence": "supplied", "value": copy.deepcopy(container)}
                                  if isinstance(body, dict) and "compatible_refs" in body
                                  else {"presence": "absent"})
            elif "compatible_refs" not in body if isinstance(body, dict) else True:
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
        qualified = _fn3_valid_source(raw, source, unusable)
        if endpoint == "left":
            declaration_ok = (_fn3_left_owner_body_formed(body)
                              and isinstance(declaration, dict) and declaration.get("endpoint") == "left"
                              and _ref_same(declaration.get("endpoint_ref"), target)
                              and declaration.get("owner") == (target.get("owner") if isinstance(target, dict) else None)
                              and _ref_same(body.get("compatibility_record_ref"), record.get("ref")))
            counterpart_rows = _fn3_source_rows(raw, record.get("source_ref"))
            counterpart_qualified = any(_fn3_valid_source(raw, row, unusable)
                                        for _index, row in counterpart_rows)
            counterpart_linked = (_ref_same(body.get("counterpart_source_ref"), record.get("source_ref"))
                                  and counterpart_qualified)
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
            elif type(record.get("compatible")) is not bool or type(declaration.get("compatible")) is not bool:
                owner_state, owner_cause = "unknown", "owner_decision_unresolved"
            elif record.get("compatible") is not declaration.get("compatible"):
                owner_state, owner_cause = "conflict", "owner_decision_differs"
            elif relation == "same":
                owner_state, owner_cause = "resolved", "owner_body_corresponding"
            else:
                owner_state, owner_cause = "unknown", "owner_subject_unresolved"
        else:
            range_declaration = body.get("compatibility_range_declaration") if isinstance(body, dict) else None
            range_owner_support = (
                _fn3_range_declaration_formed(range_declaration)
                and _ref_same(range_declaration.get("left_ref"), record.get("left_ref"))
                and _ref_same(range_declaration.get("right_ref"), target)
                and _ref_same(range_declaration.get("actual_pack_ref"), raw.get("binding", {}).get("pack_ref"))
                and any(_ref_same(owner.get("endpoint_ref"), target)
                        and owner.get("owner") == source_ref.get("owner")
                        for owner in range_declaration.get("owner_declarations", [])
                        if isinstance(owner, dict))
            )
            source_owner_matches = (
                _fn3_wire_full_ref(source_ref) and endpoint_formed
                and source_ref.get("owner") == target.get("owner")
            )
            subject_candidate = source_owner_matches and (member_state == "resolved" or range_owner_support)
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
            "state": owner_state, "cause": owner_cause,
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

def _fn3_compatibility_group_frame(binding: dict[str, Any], outcome: dict[str, Any]) -> bool:
    """Return whether this original read has a complete Binding frame for grouping."""
    record = outcome.get("record")
    # Optional wire Refs may be partial. This self-comparison checks that the
    # existing full-Ref links are formed; it is false for e.g. oracle_ref={}.
    if not isinstance(record, dict) or not _binding_same(binding, binding):
        return False
    template_ref = binding.get("template_ref")
    pack_ref = binding.get("pack_ref")
    left_ref = record.get("left_ref")
    right_ref = record.get("right_ref")
    return (
        _fn3_wire_full_ref(left_ref) and _fn3_wire_full_ref(right_ref)
        and _json_equal(left_ref.get("scope"), template_ref.get("scope"))
        and _json_equal(right_ref.get("scope"), pack_ref.get("scope"))
    )

def _fn3_compatibility_group_same_pair(binding: dict[str, Any], left: dict[str, Any],
                                       right: dict[str, Any]) -> bool:
    if not (_fn3_compatibility_group_frame(binding, left)
            and _fn3_compatibility_group_frame(binding, right)):
        return False
    left_record, right_record = left["record"], right["record"]
    return (_ref_same(left_record.get("left_ref"), right_record.get("left_ref"))
            and _ref_same(left_record.get("right_ref"), right_record.get("right_ref")))

def _fn3_emit_single_compatibility_axis(binding: dict[str, Any], outcome: dict[str, Any],
                                        axes: list[dict[str, Any]]) -> None:
    reason_prefixes = {
        "positive": "同scope明示pairについて独立template-owner本文とpack-owner本文が共にtrueを明示する。実利用許可ではない。",
        "outside": "同scope明示pairについて独立template-owner本文とpack-owner本文が当該実版範囲外を明示する。",
        "scope": "原source自身の資格scopeは対応するが対象pairのscopeと既知に異なる。",
        "null": "明示pairのsource_refは明示nullでowner互換根拠を解決できない。",
        "left_owner_unprovided": "右pack-owner原宣言は存在するが独立template-owner本文が未供給であり当該pair互換照合はunknownに保持する。",
    }
    prefix = reason_prefixes.get(outcome["cause"])
    if prefix is None:
        outcome["reason"] = _fn3_diag(outcome["cause"], {
            "cause": outcome["cause"],
            "request": {"record_locator": f"/compatibility_records/{outcome['record_index']}"},
            "state": outcome["state"], "record_presence": "supplied", "record_is_null": False,
            "owner_observations": outcome["owner_observations"],
        })
    else:
        outcome["reason"] = _fn3_diag(prefix, {
            "original_record_reasons": [outcome["record"].get("reason")],
            "pair_group_index": 0, "record_indices": [outcome["record_index"]],
            "record_states": [outcome["state"]],
        })
    axes.append(_fn3_axis(outcome["record"].get("left_ref"), binding, "compatibility", outcome["state"],
                          outcome["refs"], outcome["reason"],
                          "knowledge_owner" if outcome["state"] != "resolved" else None))

def _fn3_emit_compatibility_finding(raw: dict[str, Any], binding: dict[str, Any],
                                    outcome: dict[str, Any], findings: list[dict[str, Any]]) -> None:
    if outcome["cause"] in {"null", "left_owner_unprovided"}:
        findings.append(_fn3_finding("compatibility_unknown", outcome["record"].get("left_ref"), binding,
                                     "compatibility", "unknown", outcome["sources"],
                                     _fn3_compatibility_finding_reason(raw, binding, outcome,
                                                                       outcome["record_index"],
                                                                       "compatibility_unknown")))
    elif outcome["cause"] == "outside":
        findings.append(_fn3_finding("compatibility_mismatch", outcome["record"].get("left_ref"), binding,
                                     "compatibility", "conflict", outcome["sources"],
                                     _fn3_compatibility_finding_reason(raw, binding, outcome,
                                                                       outcome["record_index"],
                                                                       "compatibility_mismatch")))

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
        if record.get("source_ref", object()) is None:
            lefts = _fn3_owner_source(raw, record.get("left_ref"), unusable, record.get("ref"))
            if len(lefts) > 1:
                raise _fn3_stop("unclosed/multiple_finding_range_sources/left_null",
                                "multiple left owner source occurrences match the record")
            outcomes.append({"record": record, "record_index": index, "state": "unknown", "cause": "null",
                             "reason": "null", "refs": [record.get("ref"), record.get("left_ref"), record.get("right_ref")],
                             "sources": [lefts[0][1]["ref"]] if lefts else []})
            continue
        right_rows = _fn3_source_rows(raw, record.get("source_ref"))
        if len(right_rows) > 1:
            raise _fn3_stop("unclosed/multiple_finding_range_sources/right", "multiple physical source occurrences match a Finding range record")
        right = right_rows[0] if right_rows else None
        lefts = _fn3_owner_source(raw, record.get("left_ref"), unusable, record.get("ref"))
        if len(lefts) > 1:
            raise _fn3_stop("unclosed/multiple_finding_range_sources/left", "multiple left owner source occurrences match the record")
        if right is None or not _fn3_valid_source(raw, right[1], unusable):
            outcomes.append({"record": record, "record_index": index, "state": "unknown",
                             "cause": "right_owner_unprovided", "reason": "right_owner_unprovided",
                             "refs": [record.get("ref"), record.get("left_ref"), record.get("right_ref"), record.get("source_ref")],
                             "sources": [lefts[0][1]["ref"]] if lefts else []})
            continue
        if not lefts:
            outcomes.append({"record": record, "record_index": index, "state": "unknown", "cause": "left_owner_unprovided",
                             "reason": "left_owner_unprovided: 両端の独立qualified owner本文が揃わない。",
                             "refs": [record.get("ref"), record.get("left_ref"), record.get("right_ref"), record.get("source_ref")],
                             "sources": [right[1]["ref"]] if right and _fn3_valid_source(raw, right[1], unusable) else []})
            continue
        left_source, left_body = lefts[0][1:]
        ri, right_source = right
        right_body = right_source.get("content")
        if not isinstance(right_body, dict):
            outcomes.append({"record": record, "record_index": index, "state": "unknown", "cause": "bilateral_owner_unresolved",
                             "reason": "owner_decision_unresolved: right owner body is not a JSON object.",
                             "refs": [record.get("ref"), record.get("left_ref"), record.get("right_ref"), record.get("source_ref")],
                             "sources": []})
            continue
        left_scope = left_source["ref"].get("scope")
        right_scope = right_source["ref"].get("scope")
        target_scope = binding.get("template_ref", {}).get("scope")
        owner_decl = left_body.get("endpoint_owner_declaration")
        range_decl = right_body.get("compatibility_range_declaration")
        right_endpoint_reads = _fn3_endpoint_owner_reads(
            raw, record, unusable, "right", direct_sources=[(ri, right_source)])
        right_endpoint_corresponding = (
            len(right_endpoint_reads) == 1
            and right_endpoint_reads[0]["state"] == "resolved"
            and right_endpoint_reads[0]["cause"] == "owner_body_corresponding"
        )
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
        right_range_owner = (isinstance(range_owners, list) and len(range_owners) == 2
                             and any(_ref_same(r.get("endpoint_ref"), record.get("right_ref"))
                                     and r.get("owner") == right_source.get("ref", {}).get("owner")
                                     for r in range_owners if isinstance(r, dict)))
        left_subject_candidate = (left_decl_valid
                                  and owner_decl.get("owner") == left_source.get("ref", {}).get("owner"))
        right_scope_candidate = (len(right_endpoint_reads) == 1
                                 and right_endpoint_reads[0]["cause"] == "owner_scope_differs")
        left_scope_relation = _fn3_scope_relation(left_scope, target_scope)
        right_scope_relation = _fn3_scope_relation(right_scope, target_scope)
        if ((left_scope_relation == "different" and left_subject_candidate)
                or (right_scope_relation == "different" and right_scope_candidate)):
            outcomes.append({"record": record, "record_index": index, "state": "conflict", "cause": "scope",
                             "reason": "scope: qualified owner source scope differs from the target pair scope.",
                             "refs": [record["ref"], record["left_ref"], record["right_ref"], record["source_ref"], left_source["ref"]],
                             "sources": [left_source["ref"], right_source["ref"]]})
            continue
        if ((left_scope_relation == "unobserved" and left_subject_candidate)
                or (right_scope_relation == "unobserved" and right_scope_candidate)):
            outcomes.append({"record": record, "record_index": index, "state": "unknown", "cause": "scope_unresolved",
                             "reason": "scope_unresolved: target or qualified source scope is unobserved.",
                             "refs": [record["ref"], record["left_ref"], record["right_ref"], record["source_ref"],
                                      left_source["ref"], right_source["ref"]],
                             "sources": [left_source["ref"], right_source["ref"]]})
            continue
        outside = (left_owner and owner_decl.get("range_relation") == "outside"
                   and range_valid and range_decl.get("relation") == "outside" and right_range_owner
                   and all(r.get("relation") == "outside" for r in range_owners if isinstance(r, dict)))
        both_true = (record.get("compatible") is True and left_body.get("compatible") is True
                     and right_body.get("compatible") is True and left_owner
                     and owner_decl.get("compatible") is True and right_endpoint_corresponding)
        if (isinstance(owner_decl, dict) and (owner_decl.get("endpoint") != "left"
                or not _ref_same(owner_decl.get("endpoint_ref"), record.get("left_ref")))):
            outcomes.append({"record": record, "record_index": index, "state": "unknown", "cause": "left_owner_unprovided",
                             "reason": "left_owner_unprovided: left owner declaration does not name the original left endpoint.",
                             "refs": [record.get("ref"), record.get("left_ref"), record.get("right_ref"), record.get("source_ref")],
                             "sources": [left_source.get("ref")]})
            continue
        if outside:
            outcomes.append({"record": record, "record_index": index, "state": "conflict", "cause": "outside",
                             "reason": "同scope明示pairについて独立template-owner本文とpack-owner本文が当該実版範囲外を明示する。",
                             "refs": [record["ref"], record["left_ref"], record["right_ref"], record["source_ref"],
                                      left_source["ref"], left_source["qualification_ref"], lefts[0][2].get("compatibility_record_ref"),
                                      right_source["ref"], right_source["qualification_ref"]],
                             "sources": [left_source["ref"], right_source["ref"]]})
        elif both_true:
            outcomes.append({"record": record, "record_index": index, "state": "resolved", "cause": "positive",
                             "reason": "同scope明示pairについて独立template-owner本文とpack-owner本文が共にtrueを明示する。実利用許可ではない。",
                             "refs": [record["ref"], record["left_ref"], record["right_ref"], record["source_ref"],
                                      left_source["ref"], left_source["qualification_ref"], right_source["ref"], right_source["qualification_ref"]],
                             "sources": [left_source["ref"], right_source["ref"]]})
        else:
            left_decision = owner_decl.get("compatible") if isinstance(owner_decl, dict) else None
            right_decision = right_body.get("compatible")
            record_decision = record.get("compatible")
            if type(record_decision) is not bool:
                unresolved_cause, unresolved_state = "compatible_null", "unknown"
            elif type(left_decision) is not bool or type(right_decision) is not bool:
                unresolved_cause, unresolved_state = "bilateral_owner_unresolved", "unknown"
            elif left_decision is not right_decision:
                unresolved_cause, unresolved_state = "bilateral_decisions_opposing", "conflict"
            elif record_decision is not left_decision:
                unresolved_cause, unresolved_state = "body_record_differs", "conflict"
            else:
                unresolved_cause, unresolved_state = "bilateral_owner_unresolved", "unknown"
            outcomes.append({"record": record, "record_index": index, "state": unresolved_state, "cause": unresolved_cause,
                             "reason": unresolved_cause,
                             "refs": [record["ref"], record["left_ref"], record["right_ref"], record["source_ref"],
                                      left_source["ref"], right_source["ref"]],
                             "sources": [left_source["ref"], right_source["ref"]]})
    for outcome in outcomes:
        record = outcome["record"]
        base_refs = [record.get("ref"), record.get("left_ref"), record.get("right_ref")]
        if isinstance(record.get("source_ref"), dict):
            base_refs.append(record["source_ref"])
        used_indices, source_refs = _fn3_source_reference_block(raw, outcome.get("sources", []))
        outcome["source_indices"] = used_indices
        outcome["refs"] = [*base_refs, *source_refs]
        outcome["sources"] = [raw["sources"][i]["ref"] for i in used_indices]
        left_sources = [(i, source) for i, source, _body in _fn3_owner_source(
            raw, record.get("left_ref"), unusable, record.get("ref"))]
        right_sources = _fn3_source_rows(raw, record.get("source_ref"))
        owner_reads = _fn3_endpoint_owner_reads(raw, record, unusable, "left", left_sources)
        owner_reads.extend(_fn3_endpoint_owner_reads(raw, record, unusable, "right", right_sources))
        outcome["owner_observations"] = [
            {"endpoint": row["endpoint"], "source_index": row["source_index"],
             "target_scope_relation": row["target_scope_relation"], "state": row["state"],
             "cause": row["cause"]}
            for row in owner_reads
        ]
    groups: list[list[dict[str, Any]]] = []
    for outcome in outcomes:
        for group in groups:
            if _fn3_compatibility_group_same_pair(binding, group[0], outcome):
                group.append(outcome)
                break
        else:
            groups.append([outcome])

    finite_opposing_group = None
    if (len(outcomes) == 2 and len(groups) == 1 and len(groups[0]) == 2
            and outcomes[0]["state"] == "resolved"
            and outcomes[1]["state"] == "conflict"
            and outcomes[1]["cause"] == "outside"):
        finite_opposing_group = groups[0]

    aggregate_groups: dict[int, list[dict[str, Any]]] = {}
    individual_indices = set()
    if finite_opposing_group is not None:
        aggregate_groups[finite_opposing_group[0]["record_index"]] = finite_opposing_group
    else:
        for group in groups:
            causes = []
            for outcome in group:
                if not any(_json_equal(outcome["cause"], seen) for seen in causes):
                    causes.append(outcome["cause"])
            if len(group) > 1 and len(causes) > 1:
                aggregate_groups[group[0]["record_index"]] = group
            else:
                individual_indices.update(outcome["record_index"] for outcome in group)

    for outcome in outcomes:
        _fn3_emit_compatibility_finding(raw, binding, outcome, findings)

    for outcome in outcomes:
        record_index = outcome["record_index"]
        if record_index in aggregate_groups:
            group = aggregate_groups.pop(record_index)
            if group is finite_opposing_group:
                material = {
                    "original_record_reasons": [row["record"].get("reason") for row in group],
                    "pair_group_index": 0,
                    "record_indices": [row["record_index"] for row in group],
                    "record_states": [row["state"] for row in group],
                }
                reason = _fn3_diag("同scope同明示pairのqualified原宣言が相反する。両原宣言を保持する。", material)
                refs = [ref for row in group for ref in row["refs"] if isinstance(ref, dict)]
                axes.append(_fn3_axis(group[0]["record"].get("left_ref"), binding, "compatibility",
                                      "conflict", refs, reason, "knowledge_owner"))
            else:
                material = {"cause_occurrences": [
                    {"cause": row["cause"], "record_index": row["record_index"],
                     "state": row["state"]}
                    for row in group
                ]}
                reason = _fn3_diag(
                    "両端契約のowner宣言へ解決する互換根拠が未供給で適合/不適合を評価できない。",
                    material,
                )
                refs = [ref for row in group for ref in row["refs"] if isinstance(ref, dict)]
                axes.append(_fn3_axis(group[0]["record"].get("left_ref"), binding, "compatibility",
                                      "unknown", refs, reason, "knowledge_owner"))
        elif record_index in individual_indices:
            _fn3_emit_single_compatibility_axis(binding, outcome, axes)
    result_reads.extend(outcomes)
    return result_reads
