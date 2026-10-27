"""FN7 descriptor-fill finite-domain writer over one same-call FN1 walk."""

from __future__ import annotations

from typing import Any

from supply_validation import (
    _APPROVED_KINDS,
    _binding_same,
    _binding_shape_ok,
    _comparison,
    _is_json_value,
    _json_equal,
    _ref_same,
    _source_shape_ok,
    _wire_binding_shape_ok,
    _wire_ref_shape_ok,
)


_BACKFLOW = "Backflow HELIXBRAIN-L6-032-FN7-CLAIM"
_CONTEXT_MEMBERS = {
    "validated", "definitions", "values_applicability", "identity_trace",
    "oracle_view", "promotion", "dependencies_handoff",
}
_COMPARISON_MEMBERS = {"axes", "findings", "producer_symbol", "input_binding"}
_COMPARISON_PRODUCERS = {
    "definitions": "compare_descriptor_definitions",
    "values_applicability": "compare_values_and_applicability",
    "identity_trace": "compare_identity_versions_and_trace",
    "oracle_view": "compare_oracle_and_view_boundary",
    "promotion": "compare_knowledge_promotion",
    "dependencies_handoff": "compare_dependencies_and_handoff",
}
_SUPPLY_MEMBERS = {
    "binding", "required_descriptor_kinds", "sources", "qualification_roots",
    "qualifications", "descriptors", "meaning_comparisons", "section_fields",
    "values", "applicability_records", "relations", "oracle_bindings",
    "compatibility_records", "knowledge_records", "dependencies",
    "handoff_records", "claims", "candidates",
}
_EMPTY_COLLECTIONS = (
    "meaning_comparisons", "section_fields", "values", "applicability_records",
    "relations", "oracle_bindings", "compatibility_records", "handoff_records",
)
_MEANING_FACT_MEMBERS = {
    "source_ref", "owner", "binding", "meaning", "condition", "reason", "ref",
}
_SLOT_MEMBERS = {
    "slot_identity", "descriptor_kind", "binding", "facts", "comparison_refs",
    "definition_applicability_ref",
}
_SEMANTIC_CONTENT_MEMBERS = {
    "binding", "descriptor_facts", "descriptor_targets", "definition_meaning_operations",
}
_REFERENCE_CONTENT_MEMBERS = {"binding", "reference_target", "reference_context"}
_FINITE_MEANING_MEMBERS = {"template_identity", "functional_role"}
_FINITE_CLAIM_MEMBERS = {
    "subject_ref", "binding", "actor", "kind", "proposed_value", "basis_refs",
}

def _stop(branch: str) -> None:
    raise NotImplementedError(
        f"FN7/unclosed/{branch}; {_BACKFLOW}"
    )


# L4 /claim_boundary_projection_contract/finite_domain/meaning_carrier_predicate/meaning_object_literals/0
# 固定契約定数。PR3732 comment6453521166の解釈に従い、有限適用条件だけに使う。
_FINITE_MEANING_LITERAL = {'template_identity': 'SYNTHETIC-D26-TEMPLATE-A',
 'functional_role': '設計原子の同一性を担う汎用テンプレートA。所在filenameをidentityにしない。'}


def _meaning_value_in_finite_domain(value: object) -> bool:
    """Whether a supplied meaning value is inside the exact L4 finite domain."""
    if value is None:
        return True
    return (
        isinstance(value, dict)
        and set(value) == _FINITE_MEANING_MEMBERS
        and type(value.get("template_identity")) is str
        and type(value.get("functional_role")) is str
        and _json_equal(value, _FINITE_MEANING_LITERAL)
    )


def _finite_meaning(value: Any) -> None:
    if not _meaning_value_in_finite_domain(value):
        _stop("finite_meaning_value")


def _finite_fact(fact: Any) -> None:
    if not isinstance(fact, dict) or not set(fact) <= _MEANING_FACT_MEMBERS or "meaning" not in fact:
        _stop("finite_meaning_value")
    if "source_ref" in fact and fact["source_ref"] is not None and not _wire_ref_shape_ok(fact["source_ref"]):
        _stop("finite_domain")
    if "ref" in fact and not _wire_ref_shape_ok(fact["ref"]):
        _stop("finite_domain")
    if "binding" in fact and not _wire_binding_shape_ok(fact["binding"]):
        _stop("finite_domain")
    if "owner" in fact and fact["owner"] is not None and type(fact["owner"]) is not str:
        _stop("finite_domain")
    if "reason" in fact and fact["reason"] is not None and type(fact["reason"]) is not str:
        _stop("finite_domain")
    if "condition" in fact and not _is_json_value(fact["condition"]):
        _stop("finite_domain")
    _finite_meaning(fact["meaning"])


def _finite_facts(value: Any) -> None:
    if not isinstance(value, list):
        _stop("finite_domain")
    for fact in value:
        _finite_fact(fact)


def _finite_targets(value: Any) -> None:
    if not isinstance(value, list):
        _stop("finite_domain")
    for target in value:
        if (not isinstance(target, dict)
                or set(target) != {"target_ref", "slot_identity", "descriptor_kind"}
                or not _wire_ref_shape_ok(target["target_ref"])
                or type(target["slot_identity"]) is not str
                or type(target["descriptor_kind"]) is not str
                or target["descriptor_kind"] not in _APPROVED_KINDS):
            _stop("finite_domain")


def _finite_operations(value: Any) -> None:
    if not isinstance(value, list):
        _stop("finite_domain")
    for operation in value:
        if (not isinstance(operation, dict)
                or set(operation) != {"operation_ref", "arguments", "decision"}
                or not _wire_ref_shape_ok(operation["operation_ref"])):
            _stop("finite_domain")
        arguments = operation["arguments"]
        if (not isinstance(arguments, dict)
                or set(arguments) != {"binding", "slot_identity", "descriptor_kind", "fact_ref", "fact_body", "normative_argument"}
                or not _wire_binding_shape_ok(arguments["binding"])
                or type(arguments["slot_identity"]) is not str
                or type(arguments["descriptor_kind"]) is not str
                or arguments["descriptor_kind"] not in _APPROVED_KINDS
                or not _wire_ref_shape_ok(arguments["fact_ref"])):
            _stop("finite_domain")
        _finite_meaning(arguments["fact_body"])
        _finite_normative_frame(arguments["normative_argument"])
        decision = operation["decision"]
        if (not isinstance(decision, dict)
                or set(decision) != {"relation", "reason", "raw_semantic_basis", "basis_refs"}
                or type(decision["relation"]) is not str
                or decision["relation"] not in {"defines_descriptor", "does_not_define_descriptor", "undetermined"}
                or not _presence_string(decision["reason"])
                or not _presence_raw(decision["raw_semantic_basis"])
                or not isinstance(decision["basis_refs"], list)
                or any(not _wire_ref_shape_ok(ref) for ref in decision["basis_refs"])):
            _stop("finite_domain")


def _presence_string(value: Any) -> bool:
    return (
        isinstance(value, dict)
        and (
            (set(value) == {"presence"} and value["presence"] == "absent")
            or (set(value) == {"presence", "value"} and value["presence"] == "supplied"
                and (value["value"] is None or type(value["value"]) is str))
        )
    )


def _presence_raw(value: Any) -> bool:
    return (
        isinstance(value, dict)
        and (
            (set(value) == {"presence"} and value["presence"] == "absent")
            or (set(value) == {"presence", "value"} and value["presence"] == "supplied"
                and _is_json_value(value["value"]))
        )
    )


def _finite_normative_frame(value: Any) -> None:
    required = {
        "revision", "path", "file_sha256", "catalog_pointer", "catalog_canonical_sha256",
        "scope", "entry_pointer", "entry_canonical_sha256", "entry_value",
    }
    if not isinstance(value, dict) or set(value) != required:
        _stop("finite_domain")
    if any(type(value[key]) is not str for key in required - {"scope", "entry_value"}):
        _stop("finite_domain")
    scope = value["scope"]
    if (not isinstance(scope, dict)
            or set(scope) != {"parent_requirement", "functional_requirement", "scope_kind"}
            or scope != {
                "parent_requirement": "HELIXBRAIN-L2-032",
                "functional_requirement": "HELIXBRAIN-L3-032-F01",
                "scope_kind": "generic_design_template_descriptor",
            }):
        _stop("finite_domain")
    entry = value["entry_value"]
    if (not isinstance(entry, dict) or set(entry) != {"descriptor", "meaning"}
            or type(entry["descriptor"]) is not str or type(entry["meaning"]) is not str):
        _stop("finite_domain")


def _finite_source(source: Any) -> None:
    if not _source_shape_ok(source) or source.get("role") not in {"semantic_json", "reference_only"}:
        _stop("finite_domain")
    content = source.get("content")
    if not isinstance(content, dict):
        _stop("finite_domain")
    allowed = _SEMANTIC_CONTENT_MEMBERS if source["role"] == "semantic_json" else _REFERENCE_CONTENT_MEMBERS
    if not set(content) <= allowed:
        _stop("finite_domain")
    if "binding" in content and not _wire_binding_shape_ok(content["binding"]):
        _stop("finite_domain")
    if source["role"] != "semantic_json":
        return
    if "descriptor_facts" in content:
        groups = content["descriptor_facts"]
        if not isinstance(groups, list):
            _stop("finite_domain")
        for group in groups:
            if (not isinstance(group, dict)
                    or "descriptor_kind" not in group or "facts" not in group
                    or type(group["descriptor_kind"]) is not str
                    or group["descriptor_kind"] not in _APPROVED_KINDS
                    or ("slot_identity" in group and type(group["slot_identity"]) is not str)):
                _stop("finite_domain")
            _finite_facts(group["facts"])
    if "descriptor_targets" in content:
        _finite_targets(content["descriptor_targets"])
    if "definition_meaning_operations" in content:
        _finite_operations(content["definition_meaning_operations"])


def _validate_finite_domain(raw: dict[str, object]) -> None:
    """Classify the L4 descriptor-fill finite raw shape without normalizing it."""
    if not isinstance(raw, dict) or not set(raw) <= _SUPPLY_MEMBERS:
        _stop("finite_domain")
    if "candidates" not in raw or not isinstance(raw["candidates"], list) or raw["candidates"] != []:
        _stop("finite_candidates")
    if "dependencies" in raw:
        _stop("finite_domain")
    for member in _EMPTY_COLLECTIONS:
        if member in raw and (not isinstance(raw[member], list) or raw[member] != []):
            _stop("finite_domain")

    binding = raw.get("binding")
    if not _wire_binding_shape_ok(binding):
        _stop("finite_domain")
    required = raw.get("required_descriptor_kinds")
    if (not isinstance(required, list)
            or any(type(kind) is not str or kind not in _APPROVED_KINDS for kind in required)):
        _stop("finite_domain")

    descriptors = raw.get("descriptors")
    sources = raw.get("sources")
    knowledge_records = raw.get("knowledge_records")
    claims = raw.get("claims")
    if (not isinstance(descriptors, list) or not isinstance(sources, list)
            or not isinstance(knowledge_records, list) or len(knowledge_records) != 1
            or not isinstance(claims, list) or not claims):
        _stop("finite_domain")
    for member in ("qualification_roots", "qualifications"):
        if member in raw and not isinstance(raw[member], list):
            _stop("finite_domain")

    for slot in descriptors:
        if (not isinstance(slot, dict) or not set(slot) <= _SLOT_MEMBERS
                or not {"descriptor_kind", "facts"} <= set(slot)
                or ("slot_identity" in slot and type(slot["slot_identity"]) is not str)
                or type(slot.get("descriptor_kind")) is not str
                or slot.get("descriptor_kind") not in _APPROVED_KINDS
                or ("binding" in slot and not _wire_binding_shape_ok(slot["binding"]))
                or ("comparison_refs" in slot and (not isinstance(slot["comparison_refs"], list)
                    or any(not _wire_ref_shape_ok(ref) for ref in slot["comparison_refs"])))
                or ("definition_applicability_ref" in slot
                    and slot["definition_applicability_ref"] is not None
                    and not _wire_ref_shape_ok(slot["definition_applicability_ref"]))):
            _stop("finite_domain")
        _finite_facts(slot["facts"])

    for source in sources:
        _finite_source(source)

    for claim in claims:
        if (not isinstance(claim, dict) or not set(claim) <= _FINITE_CLAIM_MEMBERS
                or not {"subject_ref", "binding", "kind", "proposed_value"} <= set(claim)
                or claim.get("kind") != "fill_definition"
                or not _wire_ref_shape_ok(claim.get("subject_ref"))
                or not _wire_binding_shape_ok(claim.get("binding"))
                or ("actor" in claim and claim["actor"] is not None and type(claim["actor"]) is not str)
                or ("proposed_value" in claim and claim["proposed_value"] is not None
                    and type(claim["proposed_value"]) is not str)):
            _stop("finite_domain")
        if "basis_refs" in claim and (
            not isinstance(claim["basis_refs"], list)
            or any(not _wire_ref_shape_ok(ref) for ref in claim["basis_refs"])
        ):
            _stop("finite_domain")

    for claim in claims:
        declared = False
        for source in sources:
            if not isinstance(source, dict) or source.get("role") != "semantic_json":
                continue
            content = source.get("content")
            if not isinstance(content, dict) or not isinstance(content.get("descriptor_targets"), list):
                continue
            if not _binding_same(content.get("binding"), claim["binding"]):
                continue
            for target in content["descriptor_targets"]:
                if isinstance(target, dict) and _ref_same(target.get("target_ref"), claim["subject_ref"]):
                    declared = True
        if not declared:
            _stop("finite_domain")

    record = knowledge_records[0]
    if (not isinstance(record, dict) or set(record) != {"ref", "provenance_refs"}
            or not _wire_ref_shape_ok(record.get("ref"))
            or not isinstance(record.get("provenance_refs"), list)
            or any(not _wire_ref_shape_ok(ref) for ref in record["provenance_refs"])):
        _stop("finite_domain")


def _comparison_input_binding_matches(value: Any, binding: dict[str, Any], raw: dict[str, Any]) -> bool:
    if not isinstance(value, dict):
        return False
    if _binding_same(value, binding):
        return True
    return (
        "dependencies" not in raw
        and not _binding_shape_ok(binding)
        and _json_equal(value, binding)
    )


def compare_claim_boundaries_detail(
    context: dict[str, object], frame: dict[str, object]
) -> dict[str, object]:
    validated = context["validated"]
    if (not isinstance(frame, dict)
            or set(frame) != {"validated", "definition_evaluation", "target_reads", "claim_uses"}
            or frame.get("validated") is not validated
            or not isinstance(frame.get("definition_evaluation"), dict)
            or set(frame["definition_evaluation"]) != {"comparison", "assessments"}
            or not isinstance(frame.get("target_reads"), list)
            or not isinstance(frame.get("claim_uses"), list)):
        _stop("claim_call_frame_shape")
    raw = validated["input"]
    binding = raw["binding"]
    uses = frame["claim_uses"]
    if len(uses) != len(raw["claims"]):
        _stop("claim_use_count")
    for index, use in enumerate(uses):
        if (not isinstance(use, dict)
                or use.get("claim_locator") != f"/claims/{index}"
                or not _json_equal(use.get("claim"), raw["claims"][index])):
            _stop("claim_use_mismatch")
        route = use.get("route")
        if route == "rule93":
            _stop("rule93_positive_unimplemented")
        if route not in {"none", "unresolved", "rule87"}:
            _stop("claim_route_unrecognized")
    return _comparison([], [], "compare_claim_boundaries", binding)


def compare_claim_boundaries(context: dict[str, object]) -> dict[str, object]:
    """L4 finite FN7 branch over the supplied same-call Context and one walk."""
    if not isinstance(context, dict) or set(context) != _CONTEXT_MEMBERS:
        _stop("claim_context_shape")
    validated = context["validated"]
    if (not isinstance(validated, dict)
            or set(validated) != {"input", "input_issues", "unusable_source_refs"}
            or not isinstance(validated["input_issues"], list)
            or not isinstance(validated["unusable_source_refs"], list)):
        _stop("validated_supply_shape")
    if not isinstance(validated["input"], dict):
        _stop("validated_input_unclosed")
    raw = validated["input"]
    _validate_finite_domain(raw)
    binding = raw.get("binding")
    for name, expected_producer in _COMPARISON_PRODUCERS.items():
        comparison = context[name]
        if (not isinstance(comparison, dict) or set(comparison) != _COMPARISON_MEMBERS
                or not isinstance(comparison.get("axes"), list)
                or not isinstance(comparison.get("findings"), list)
                or type(comparison.get("producer_symbol")) is not str):
            _stop("comparison_shape")
        if comparison["producer_symbol"] != expected_producer:
            _stop("comparison_producer")
        if not _comparison_input_binding_matches(comparison.get("input_binding"), binding, raw):
            _stop("comparison_binding")

    from descriptor_definition_walk import evaluate_descriptor_definition_walk
    from descriptor_target_frame import build_descriptor_claim_uses

    walk = evaluate_descriptor_definition_walk({"validated": validated})
    if (not isinstance(walk, dict)
            or set(walk) != {"evaluation", "target_reads", "intent_reads", "native_material"}):
        _stop("definition_walk_shape")
    uses = build_descriptor_claim_uses(
        validated, walk["evaluation"], walk["target_reads"], walk["intent_reads"]
    )
    frame = {
        "validated": validated,
        "definition_evaluation": walk["evaluation"],
        "target_reads": walk["target_reads"],
        "claim_uses": uses,
    }
    return compare_claim_boundaries_detail(context, frame)
