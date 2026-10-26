"""fn3 private returnの閉型検証を担う。"""
from __future__ import annotations
from typing import Any
from identity_trace_support import (
    _fn3_stop,
)

def _fn3_validate_private_return(value: dict[str, Any]) -> None:
    """Keep the internal read return aligned to the L4 closed private types."""
    def exact_object(row: Any, members: set[str]) -> bool:
        return isinstance(row, dict) and set(row) == members

    def presence_raw(row: Any) -> bool:
        return ((exact_object(row, {"presence"}) and row.get("presence") == "absent")
                or (exact_object(row, {"presence", "value"}) and row.get("presence") == "supplied"))

    def occurrence(row: Any) -> bool:
        return (exact_object(row, {"index", "locator", "original_read"})
                and type(row.get("index")) is int and row["index"] >= 0
                and isinstance(row.get("locator"), str) and presence_raw(row.get("original_read")))

    def source_state(value: Any) -> bool:
        return isinstance(value, str) and value in {"resolved", "missing", "unknown", "conflict", "unobserved"}

    expected = {"comparison", "source_qualifications", "actual_operands", "descriptor_traces", "bilateral_pairs"}
    if set(value) != expected:
        raise _fn3_stop("F04/N01/private_return_shape", "IdentityTraceReturn closed keys differ")
    actual_causes = {"actual_owner_body_unprovided", "actual_owner_body_corresponding", "actual_owner_body_differs",
                     "actual_owner_body_unresolved", "actual_owner_body_multiple_opposing", "input_member_absent",
                     "input_member_null", "input_member_out_of_type", "subject_unformed", "actual_scope_unresolved",
                     "actual_scope_differs", "actual_qualification_unresolved"}
    actual_roles = {"template_actual_ref", "knowledge_actual_ref", "requirement_actual_ref", "oracle_actual_ref",
                    "pack_actual_ref", "template_actual_revision", "knowledge_actual_revision", "pack_actual_revision",
                    "pack_actual_contract_version", "pack_actual_artifact_version", "knowledge_actual_operational_state",
                    "pack_actual_dependency_version"}
    if any(not exact_object(row, {"request", "original_read", "read_classification", "observations", "state", "cause"})
           or not exact_object(row.get("request"), {"member_locator", "actual_role"})
           or not isinstance(row["request"].get("member_locator"), str)
           or row["request"].get("actual_role") not in actual_roles
           or not presence_raw(row.get("original_read"))
           or row["read_classification"] not in {"absent", "null", "out_of_type", "supplied"}
           or not isinstance(row.get("observations"), list)
           or any(not exact_object(obs, {"source_index", "body_locator", "actual_read", "owner_declaration_locator",
                                        "owner_declaration_read", "relation", "state"})
                  or type(obs.get("source_index")) is not int or obs["source_index"] < 0
                  or not isinstance(obs.get("body_locator"), str)
                  or not isinstance(obs.get("owner_declaration_locator"), str)
                  or not presence_raw(obs.get("actual_read"))
                  or not presence_raw(obs.get("owner_declaration_read"))
                  or obs.get("relation") not in {"corresponding", "different", "unestablished", "not_applicable"}
                  or not source_state(obs.get("state")) for obs in row.get("observations", []))
           or not source_state(row.get("state")) or row.get("cause") not in actual_causes
           for row in value["actual_operands"]):
        raise _fn3_stop("F04/N01/private_actual_shape", "ActualOperandRead is outside its closed shape")
    trace_causes = {"original_trace_corresponding", "source_unresolved", "qualification_unresolved", "body_unresolved",
                    "knowledge_unresolved", "mixed_knowledge_revision", "scope_unresolved", "scope_differs"}
    if any(not exact_object(row, {"request", "slot_read", "fact_read", "knowledge_records", "provenance_refs", "source_indices",
                                  "body_groups", "state", "cause"})
           or not exact_object(row.get("request"), {"slot_locator", "fact_locator"})
           or not all(isinstance(row["request"].get(k), str) for k in ("slot_locator", "fact_locator"))
           or not presence_raw(row.get("slot_read")) or not presence_raw(row.get("fact_read"))
           or not isinstance(row.get("knowledge_records"), list) or any(not occurrence(x) for x in row["knowledge_records"])
           or not isinstance(row.get("body_groups"), list) or any(not occurrence(x) for x in row["body_groups"])
           or not isinstance(row.get("source_indices"), list)
           or any(type(i) is not int or i < 0 for i in row.get("source_indices", []))
           or not isinstance(row.get("provenance_refs"), list)
           or any(not exact_object(p, {"knowledge_record_index", "provenance_index", "locator", "original_read", "relation"})
                  or type(p.get("knowledge_record_index")) is not int or p["knowledge_record_index"] < 0
                  or type(p.get("provenance_index")) is not int or p["provenance_index"] < 0
                  or not isinstance(p.get("locator"), str) or not presence_raw(p.get("original_read"))
                  or p.get("relation") not in {"corresponding", "different", "unestablished", "not_applicable"}
                  for p in row.get("provenance_refs", []))
           or not source_state(row.get("state")) or row.get("cause") not in trace_causes
           for row in value["descriptor_traces"]):
        raise _fn3_stop("F04/N01/private_trace_shape", "DescriptorTraceRead is outside its closed shape")
    bilateral_causes = {"positive", "null", "scope", "outside", "opposing", "source_ref_absent", "source_unresolved",
                        "source_unusable", "qualification_unresolved", "endpoint_unresolved", "endpoint_differs",
                        "scope_unresolved", "body_record_differs", "compatible_null", "range_unresolved",
                        "left_owner_unprovided", "right_owner_unprovided", "bilateral_owner_unresolved",
                        "bilateral_decisions_opposing"}
    membership_causes = {"matching_refs", "container_absent", "container_null", "container_type", "endpoint_unresolved",
                         "member_no_match", "member_unresolved"}
    owner_causes = {"owner_body_corresponding", "owner_scope_differs", "owner_qualification_unresolved",
                    "owner_subject_unresolved", "owner_decision_unresolved", "owner_decision_differs",
                    "owner_counterpart_unresolved"}
    if any(not exact_object(row, {"request", "record_read", "owner_reads", "state", "cause"})
           or not exact_object(row.get("request"), {"record_locator"})
           or not isinstance(row["request"].get("record_locator"), str)
           or not presence_raw(row.get("record_read"))
           or not isinstance(row.get("owner_reads"), list)
           or any(not exact_object(owner, {"endpoint", "source_index", "membership", "body_read", "record_ref_read",
                                           "counterpart_source_ref_read", "target_scope_relation", "state", "cause"})
                  or owner.get("endpoint") not in {"left", "right"}
                  or type(owner.get("source_index")) is not int or owner["source_index"] < 0
                  or not presence_raw(owner.get("body_read")) or not presence_raw(owner.get("record_ref_read"))
                  or not presence_raw(owner.get("counterpart_source_ref_read"))
                  or owner.get("target_scope_relation") not in {"same", "different", "unobserved"}
                  or not source_state(owner.get("state")) or owner.get("cause") not in owner_causes
                  or not exact_object(owner.get("membership"), {"source_index", "endpoint_locator", "endpoint_read",
                                                                 "container_read", "occurrences", "matching_ref_indices",
                                                                 "state", "cause", "meaning_limit"})
                  or type(owner["membership"].get("source_index")) is not int
                  or not isinstance(owner["membership"].get("endpoint_locator"), str)
                  or not presence_raw(owner["membership"].get("endpoint_read"))
                  or not presence_raw(owner["membership"].get("container_read"))
                  or not isinstance(owner["membership"].get("occurrences"), list)
                  or any(not exact_object(o, {"ref_index", "locator", "original_read", "read_classification", "full_ref_relation"})
                         or type(o.get("ref_index")) is not int or o["ref_index"] < 0
                         or not isinstance(o.get("locator"), str) or not presence_raw(o.get("original_read"))
                         or o.get("read_classification") not in {"null", "out_of_type", "supplied"}
                         or o.get("full_ref_relation") not in {"corresponding", "different", "unestablished", "not_applicable"}
                         for o in owner["membership"].get("occurrences", []))
                  or not isinstance(owner["membership"].get("matching_ref_indices"), list)
                  or any(type(i) is not int or i < 0 for i in owner["membership"].get("matching_ref_indices", []))
                  or owner["membership"].get("state") not in {"resolved", "unknown"}
                  or owner["membership"].get("cause") not in membership_causes
                  or owner["membership"].get("meaning_limit") != "raw_endpoint_ref_membership_only"
                  for owner in row.get("owner_reads", []))
           or not source_state(row.get("state")) or row.get("cause") not in bilateral_causes
           for row in value["bilateral_pairs"]):
        raise _fn3_stop("F04/N01/private_bilateral_shape", "BilateralCompatibilityRead is outside its closed shape")
    if any(not exact_object(row, {"source_index", "source", "qualifications", "roots", "fn0_disposition", "state"})
           or type(row.get("source_index")) is not int or row["source_index"] < 0
           or not occurrence(row.get("source"))
           or not isinstance(row.get("qualifications"), list) or any(not occurrence(x) for x in row.get("qualifications", []))
           or not isinstance(row.get("roots"), list) or any(not occurrence(x) for x in row.get("roots", []))
           or row["fn0_disposition"] not in {"usable", "unusable", "unobserved"}
           or not source_state(row.get("state"))
           for row in value["source_qualifications"]):
        raise _fn3_stop("F04/N01/private_source_qualification_shape", "SourceQualificationRead is outside its closed shape")
