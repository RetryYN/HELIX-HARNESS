"""fn3 actual/version predicates の読取を担う。"""

from __future__ import annotations
import copy
from typing import Any
from descriptor_definitions import (
    _binding_same,
    _json_equal,
    _ref_same,
    _wire_binding_shape_ok,
    _wire_ref_shape_ok,
)
from identity_trace_support import (
    _IDENTITY_ACTUAL_AXES,
    _fn3_axis,
    _fn3_combine_scope_relations,
    _fn3_diag,
    _fn3_finding,
    _fn3_predicate_finding_reason,
    _fn3_presence,
    _fn3_qualification_rows,
    _fn3_qualified_owner_source,
    _fn3_range_declaration_formed,
    _fn3_resolve_pointer,
    _fn3_root_rows,
    _fn3_scope_relation,
    _fn3_stop,
    _fn3_wire_full_ref,
)


def _fn3_actual_subject_ref_same(left: Any, right: Any) -> bool:
    """Compare the declared endpoint identity without folding scope into subject."""
    if not _wire_ref_shape_ok(left) or not _wire_ref_shape_ok(right):
        return False
    if not all(
        left.get(key) is not None
        and right.get(key) is not None
        and _json_equal(left[key], right[key])
        for key in ("identity", "revision", "owner")
    ):
        return False
    left_sha, right_sha = left.get("sha256"), right.get("sha256")
    return left_sha is None or right_sha is None or _json_equal(left_sha, right_sha)


def _fn3_range_rows(
    raw: dict[str, Any], binding: dict[str, Any], unusable: list[Any]
) -> list[dict[str, Any]]:
    """Select only explicit RangeDeclaration bodies tied to the input pack identity."""
    found = []
    for index, source in enumerate(raw.get("sources", [])):
        if not isinstance(source, dict) or source.get("role") != "semantic_json":
            continue
        body = source.get("content")
        decl = (
            body.get("compatibility_range_declaration")
            if isinstance(body, dict)
            else None
        )
        if not _fn3_range_declaration_formed(decl):
            continue
        actual_pack = decl.get("actual_pack_ref")
        target_pack = binding.get("pack_ref")
        subject_same = _fn3_actual_subject_ref_same(
            decl.get("right_ref"), target_pack
        ) and _fn3_actual_subject_ref_same(
            decl.get("left_ref"), binding.get("template_ref")
        )
        if not subject_same:
            continue
        owner_declarations = decl.get("owner_declarations")
        found.append(
            {
                "source_index": index,
                "source": source,
                "body": body,
                "declaration": decl,
                "owner_declarations": owner_declarations
                if isinstance(owner_declarations, list)
                else [],
                "qualified": _fn3_qualified_owner_source(raw, source, unusable),
                "scope_relation": _fn3_combine_scope_relations(
                    (
                        _fn3_scope_relation(
                            actual_pack.get("scope"), target_pack.get("scope")
                        ),
                        _fn3_scope_relation(
                            source.get("ref", {}).get("scope"), target_pack.get("scope")
                        ),
                        _fn3_scope_relation(
                            decl.get("right_ref", {}).get("scope"),
                            target_pack.get("scope"),
                        ),
                        _fn3_scope_relation(
                            decl.get("left_ref", {}).get("scope"),
                            binding.get("template_ref", {}).get("scope"),
                        ),
                    )
                ),
                "subject_same": subject_same,
            }
        )
    return found


def _fn3_actual_axes(
    raw: dict[str, Any],
    binding: dict[str, Any],
    unusable: list[Any],
    axes: list[dict[str, Any]],
    findings: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Read the eleven fixed actual operands without inferring an owner from a carrier."""
    reads: list[dict[str, Any]] = []
    range_rows = _fn3_range_rows(raw, binding, unusable)
    if len(range_rows) > 1:
        raise _fn3_stop(
            "unclosed/multiple_actual_range_sources",
            "multiple physical RangeDeclaration source occurrences match the input Binding",
        )
    records = raw.get("knowledge_records", [])
    matched_records = [
        (i, row)
        for i, row in enumerate(records)
        if isinstance(row, dict)
        and _ref_same(row.get("ref"), binding.get("knowledge_ref"))
    ]
    axis_sources = {
        "pack.identity": "actual_pack_ref",
        "pack.revision": "actual_pack_ref/revision",
        "pack.contract_version": "actual_contract_version",
        "pack.artifact_version": "actual_artifact_version",
    }
    for axis_name, role, member_pointer, subject_pointer in _IDENTITY_ACTUAL_AXES:
        if axis_name == "knowledge.operational_state":
            member_pointer = (
                f"/knowledge_records/{matched_records[0][0]}/operational_state"
                if len(matched_records) == 1
                else "/knowledge_records"
            )
            original_read = _fn3_presence(raw, member_pointer)
            subject = binding.get("knowledge_ref")
        else:
            original_read = _fn3_presence(raw, member_pointer)
            _, subject = _fn3_resolve_pointer(raw, subject_pointer)
        subject_formed = _wire_ref_shape_ok(subject)
        ref_axes = {
            "template.identity",
            "knowledge.identity",
            "requirement.identity",
            "oracle.identity",
            "pack.identity",
        }
        if original_read.get("presence") == "absent":
            classification = "absent"
        elif original_read.get("value") is None:
            classification = "null"
        elif axis_name in ref_axes and not isinstance(original_read.get("value"), dict):
            classification = "out_of_type"
        elif (
            axis_name not in ref_axes
            and axis_name != "knowledge.operational_state"
            and not isinstance(original_read.get("value"), (str, dict))
        ):
            classification = "out_of_type"
        else:
            classification = "supplied"

        observations = []
        actual_cause = None
        if axis_name in axis_sources:
            for selected in range_rows if subject_formed else []:
                decl = selected["declaration"]
                declaration_locator = f"/sources/{selected['source_index']}/content/compatibility_range_declaration"
                body_locator = declaration_locator + "/" + axis_sources[axis_name]
                actual = _fn3_presence(raw, body_locator)
                owner_rows = selected["owner_declarations"]
                owner_match = next(
                    (
                        (oi, r)
                        for oi, r in enumerate(owner_rows)
                        if _ref_same(r.get("endpoint_ref"), decl.get("right_ref"))
                    ),
                    None,
                )
                owner_index, owner = (
                    owner_match if owner_match is not None else (None, None)
                )
                target = (
                    binding.get("pack_ref")
                    if axis_name == "pack.identity"
                    else binding.get("pack_ref", {}).get("revision")
                    if axis_name == "pack.revision"
                    else binding.get("pack_contract_version")
                    if axis_name == "pack.contract_version"
                    else binding.get("pack_artifact_version")
                )
                if not selected["qualified"]:
                    relation, obs_state, actual_cause = (
                        "unestablished",
                        "unknown",
                        "actual_qualification_unresolved",
                    )
                elif selected["scope_relation"] == "different":
                    relation, obs_state, actual_cause = (
                        "different",
                        "conflict",
                        "actual_scope_differs",
                    )
                elif selected["scope_relation"] == "unobserved":
                    relation, obs_state, actual_cause = (
                        "unestablished",
                        "unknown",
                        "actual_scope_unresolved",
                    )
                elif not selected["subject_same"] or owner is None:
                    relation, obs_state, actual_cause = (
                        "unestablished",
                        "unknown",
                        "actual_owner_body_unresolved",
                    )
                elif actual.get("presence") == "absent":
                    relation, obs_state, actual_cause = (
                        "unestablished",
                        "unknown",
                        "actual_owner_body_unresolved",
                    )
                elif axis_name == "pack.identity" and not _fn3_wire_full_ref(
                    actual.get("value")
                ):
                    relation, obs_state, actual_cause = (
                        "unestablished",
                        "unknown",
                        "actual_owner_body_unresolved",
                    )
                elif axis_name in {
                    "pack.revision",
                    "pack.contract_version",
                    "pack.artifact_version",
                } and not isinstance(actual.get("value"), str):
                    relation, obs_state, actual_cause = (
                        "unestablished",
                        "unknown",
                        "actual_owner_body_unresolved",
                    )
                elif actual.get("presence") == "supplied" and not (
                    _ref_same(actual.get("value"), target)
                    if axis_name == "pack.identity"
                    else _json_equal(actual.get("value"), target)
                ):
                    relation, obs_state, actual_cause = (
                        "different",
                        "conflict",
                        "actual_owner_body_differs",
                    )
                else:
                    relation, obs_state, actual_cause = (
                        "corresponding",
                        "resolved",
                        "actual_owner_body_corresponding",
                    )
                observations.append(
                    {
                        "source_index": selected["source_index"],
                        "body_locator": body_locator,
                        "actual_read": actual,
                        "owner_declaration_locator": declaration_locator
                        + f"/owner_declarations/{owner_index}"
                        if owner_index is not None
                        else declaration_locator + "/owner_declarations",
                        "owner_declaration_read": (
                            {"presence": "supplied", "value": copy.deepcopy(owner)}
                            if owner is not None
                            else {"presence": "absent"}
                        ),
                        "relation": relation,
                        "state": obs_state,
                    }
                )
        # No KnowledgeRecord or claim is an actual owner declaration. Only the
        # qualified RangeDeclaration is a candidate right operand for these pack axes.
        states = [row["state"] for row in observations]
        if not subject_formed:
            state, cause, prefix = (
                "unknown",
                "subject_unformed",
                "原subject Refを形成できず、public軸は生成せずprivateへ保持。",
            )
        elif classification == "absent":
            state, cause, prefix = (
                "unknown",
                "input_member_absent",
                "原memberが欠落。原Read absent。",
            )
        elif classification == "null":
            state, cause, prefix = (
                "unknown",
                "input_member_null",
                "原memberは明示null。原Read supplied(null)。",
            )
        elif classification == "out_of_type":
            state, cause, prefix = (
                "unknown",
                "input_member_out_of_type",
                "原member型外。原Read supplied原値。",
            )
        elif "conflict" in states and "resolved" in states:
            state, cause = "conflict", "actual_owner_body_multiple_opposing"
            prefix = "同subject/fullframeへの資格済みactual複数判断が既知相反。"
        elif actual_cause is not None:
            state = (
                "conflict"
                if actual_cause in {"actual_scope_differs", "actual_owner_body_differs"}
                else "resolved"
                if actual_cause == "actual_owner_body_corresponding"
                else "unknown"
            )
            cause = actual_cause
            prefix = {
                "actual_qualification_unresolved": "原source/Q/root/owner資格未成立。",
                "actual_scope_unresolved": "対象frame又はsource frame未観測。",
                "actual_scope_differs": "原actual宣言が当該subject候補を指すが要求frameと既知差。別subjectの原宣言はactual対応候補を生成しない。",
                "actual_owner_body_unresolved": "上記以外の原値/operand/対応が未成立。",
                "actual_owner_body_differs": "同subject/fullframeの独立actual本文と原値が既知差。",
                "actual_owner_body_corresponding": "原値とqualified実owner本文の明示actual operandが対応する。互換適合又は実利用許可を意味しない。",
            }[cause]
        else:
            state, cause = "unknown", "actual_owner_body_unprovided"
            prefix = "原値は供給されているが独立した実owner本文のactual operandが未供給であり、当該照合はunknownに保持する。"
        pointers = []
        for row in observations:
            pointers.append(row["body_locator"])
        material = {
            "actual_source_pointers": pointers,
            "cause": cause,
            "knowledge_ref": copy.deepcopy(binding.get("knowledge_ref")),
            "member_pointer": member_pointer,
            "original_read": copy.deepcopy(original_read),
        }
        refs = [subject] if isinstance(subject, dict) else []
        if axis_name.startswith("knowledge."):
            for record_index, record in matched_records:
                if axis_name != "knowledge.operational_state" and isinstance(
                    record.get("ref"), dict
                ):
                    refs.append(record["ref"])
                if axis_name == "knowledge.operational_state":
                    provenance = record.get("provenance_refs")
                    if isinstance(provenance, list):
                        refs.extend(
                            ref for ref in provenance if _wire_ref_shape_ok(ref)
                        )
        if axis_name in axis_sources and observations:
            for row in observations:
                src = raw["sources"][row["source_index"]]
                refs.extend([src.get("ref"), src.get("qualification_ref")])
                for _, q in _fn3_qualification_rows(raw, src.get("qualification_ref")):
                    refs.append(q.get("ref"))
                    refs.extend(
                        root for _, root in _fn3_root_rows(raw, q.get("root_ref"))
                    )
                owner_value = row.get("owner_declaration_read", {}).get("value")
                if isinstance(owner_value, dict) and isinstance(
                    owner_value.get("endpoint_ref"), dict
                ):
                    refs.append(owner_value["endpoint_ref"])
        reason = _fn3_diag(prefix, material)
        public_state = state
        binding_formed = _wire_binding_shape_ok(binding)
        if (
            axis_name == "template.version"
            and subject_formed
            and binding_formed
            and classification in {"absent", "null"}
        ):
            public_state = "missing"
            findings.append(
                _fn3_finding(
                    "version_missing",
                    subject,
                    binding,
                    axis_name,
                    "missing",
                    [],
                    _fn3_predicate_finding_reason(
                        raw,
                        "version_missing",
                        [("/binding/template_ref/revision", "template revision")],
                    ),
                )
            )
        if subject_formed and binding_formed:
            axes.append(
                _fn3_axis(subject, binding, axis_name, public_state, refs, reason)
            )
        reads.append(
            {
                "request": {"member_locator": member_pointer, "actual_role": role},
                "original_read": copy.deepcopy(original_read),
                "read_classification": classification,
                "observations": observations,
                "state": state,
                "cause": cause,
            }
        )

    _fn3_oracle_revision_findings(raw, binding, findings)
    return reads


def _fn3_oracle_revision_findings(
    raw: dict[str, Any], binding: dict[str, Any], findings: list[dict[str, Any]]
) -> None:
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
                value_binding = (
                    value.get("binding") if isinstance(value, dict) else None
                )
                if (
                    isinstance(value, dict)
                    and _ref_same(row.get("subject_ref"), value.get("subject_ref"))
                    and _binding_same(value_binding, binding)
                    and _ref_same(
                        row.get("obligation_ref"), binding.get("requirement_ref")
                    )
                    and isinstance(value_binding, dict)
                    and _ref_same(
                        value_binding.get("requirement_ref"), row.get("obligation_ref")
                    )
                ):
                    target_values.append((value_index, value))
        same_oracle_target = all(
            oracle.get(k) is not None
            and target.get(k) is not None
            and _json_equal(oracle.get(k), target.get(k))
            for k in ("identity", "scope", "owner")
        ) and (
            oracle.get("sha256") is None
            or target.get("sha256") is None
            or _json_equal(oracle.get("sha256"), target.get("sha256"))
        )
        if (
            target_values
            and same_oracle_target
            and isinstance(oracle.get("revision"), str)
            and isinstance(target.get("revision"), str)
            and oracle.get("revision") != target.get("revision")
        ):
            subject = row.get("subject_ref")
            refs = (
                [row.get("source_ref")]
                if isinstance(row.get("source_ref"), dict)
                else []
            )
            rule_ref = "HELIXBRAIN-L5-032-R-oracle_revision_mismatch"
            observations = [
                {
                    "locator": f"/oracle_bindings/{index}",
                    "original_read": {
                        "presence": "supplied",
                        "value": copy.deepcopy(row),
                    },
                },
                {
                    "locator": "/binding",
                    "original_read": {
                        "presence": "supplied",
                        "value": copy.deepcopy(binding),
                    },
                },
            ]
            observations.extend(
                {
                    "locator": f"/values/{value_index}",
                    "original_read": {
                        "presence": "supplied",
                        "value": copy.deepcopy(value),
                    },
                }
                for value_index, value in target_values
            )
            reason = _fn3_diag(
                "同subject/要求scopeへ束縛されたoracleの版が当該bindingのoracle版と異なる。",
                {
                    "code": "oracle_revision_mismatch",
                    "rule_ref": rule_ref,
                    "predicate_observations": observations,
                },
            )
            findings.append(
                _fn3_finding(
                    "oracle_revision_mismatch",
                    subject,
                    binding,
                    "oracle.binding",
                    "conflict",
                    refs,
                    reason,
                )
            )
