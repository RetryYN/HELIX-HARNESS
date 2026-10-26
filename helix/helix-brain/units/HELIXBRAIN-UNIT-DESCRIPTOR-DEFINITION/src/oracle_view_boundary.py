"""fn4のContext境界と一回walkからのprivate detail委譲。"""
from __future__ import annotations


def compare_oracle_and_view_boundary(context: dict[str, object]) -> dict[str, object]:
    from descriptor_definitions import _binding_same, _wire_binding_shape_ok

    context_members = {"validated", "definitions", "identity_trace"}
    if not isinstance(context, dict) or set(context) != context_members:
        raise NotImplementedError(
            "F05/F06/unclosed/oracle_context_shape; Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
        )

    validated = context["validated"]
    if (not isinstance(validated, dict)
            or set(validated) != {"input", "input_issues", "unusable_source_refs"}
            or not isinstance(validated.get("input_issues"), list)
            or not isinstance(validated.get("unusable_source_refs"), list)):
        raise NotImplementedError(
            "F05/F06/unclosed/validated_supply_shape; Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
        )
    raw = validated["input"]
    if raw is not None and not isinstance(raw, dict):
        raise NotImplementedError(
            "F05/F06/unclosed/validated_input_type; Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
        )

    comparison_members = {"axes", "findings", "producer_symbol", "input_binding"}
    for name in ("definitions", "identity_trace"):
        comparison = context[name]
        if (not isinstance(comparison, dict)
                or set(comparison) != comparison_members
                or not isinstance(comparison.get("axes"), list)
                or not isinstance(comparison.get("findings"), list)
                or not isinstance(comparison.get("producer_symbol"), str)
                or (comparison.get("input_binding") is not None
                    and not isinstance(comparison.get("input_binding"), dict))):
            raise NotImplementedError(
                f"F05/F06/unclosed/{name}_comparison_shape; "
                "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
            )

    binding = raw.get("binding") if raw is not None else None
    if raw is not None and "binding" in raw and not _wire_binding_shape_ok(binding):
        raise NotImplementedError(
            "F05/F06/unclosed/input_binding_shape; Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
        )

    definitions = context["definitions"]
    identity_trace = context["identity_trace"]
    partial_context_branches = () if raw is None else (
        (definitions["producer_symbol"] != "compare_descriptor_definitions",
         "definitions_producer"),
        (identity_trace["producer_symbol"] != "compare_identity_versions_and_trace",
         "identity_trace_producer"),
        (not _binding_same(definitions["input_binding"], binding),
         "definitions_binding"),
        (not _binding_same(identity_trace["input_binding"], binding),
         "identity_trace_binding"),
    )
    for mismatch, branch in partial_context_branches:
        if mismatch:
            raise NotImplementedError(
                f"F05/F06/partial/{branch}; owner=knowledge_owner; "
                "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
            )

    from descriptor_definition_walk import evaluate_descriptor_definition_walk
    from descriptor_target_frame import build_descriptor_claim_uses
    from oracle_binding_rules import compare_oracle_and_view_boundary_detail

    walk = evaluate_descriptor_definition_walk({"validated": validated})
    uses = build_descriptor_claim_uses(
        validated, walk["evaluation"], walk["target_reads"], walk["intent_reads"]
    )
    frame = {"validated": validated, "definition_evaluation": walk["evaluation"],
             "target_reads": walk["target_reads"], "claim_uses": uses}
    return compare_oracle_and_view_boundary_detail(context, frame)
