"""fn3 actual/version predicates の読取を担う。"""
from __future__ import annotations
import copy
from typing import Any
from descriptor_definitions import (
    _binding_same,
    _json_equal,
    _ref_same,
)
from identity_trace_support import (
    _IDENTITY_ACTUAL_AXES,
    _fn3_axis,
    _fn3_diag,
    _fn3_finding,
    _fn3_predicate_finding_reason,
    _fn3_presence,
    _fn3_qualification_rows,
    _fn3_qualified_owner_source,
    _fn3_range_declaration_formed,
    _fn3_resolve_pointer,
    _fn3_root_rows,
    _fn3_scope_same,
    _fn3_stop,
)

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
