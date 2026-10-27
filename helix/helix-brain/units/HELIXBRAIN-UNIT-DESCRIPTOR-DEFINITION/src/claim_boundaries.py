"""fn7公開入口の型境界。Claim投影と同call前段接続は未閉包。"""

from __future__ import annotations


def _stop(branch: str) -> None:
    raise NotImplementedError(
        f"FN7/unclosed/{branch}; Backflow HELIXBRAIN-L6-032-FN7-CLAIM"
    )


def compare_claim_boundaries(context: dict[str, object]) -> dict[str, object]:
    """L5のClaimContext→Comparison公開署名を保つFN7入口。"""
    members = {
        "validated", "definitions", "values_applicability", "identity_trace",
        "oracle_view", "promotion", "dependencies_handoff",
    }
    if not isinstance(context, dict) or set(context) != members:
        _stop("claim_context_shape")
    validated = context["validated"]
    if (not isinstance(validated, dict)
            or set(validated) != {"input", "input_issues", "unusable_source_refs"}
            or not isinstance(validated["input_issues"], list)
            or not isinstance(validated["unusable_source_refs"], list)):
        _stop("validated_supply_shape")
    if not isinstance(validated["input"], dict):
        _stop("validated_input_unclosed")
    _stop("formed_context")
