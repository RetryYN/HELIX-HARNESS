"""fn7公開入口の型境界。Claim投影と同call前段接続は未閉包。"""

from __future__ import annotations


def _stop(branch: str) -> None:
    raise NotImplementedError(
        f"FN7/unclosed/{branch}; Backflow HELIXBRAIN-L6-032-FN7-CLAIM"
    )


# L4 /claim_boundary_projection_contract/finite_domain/meaning_carrier_predicate/meaning_object_literals/0
# 固定契約定数。PR3732 comment6453521166の解釈に従い、有限適用条件だけに使う。
_FINITE_MEANING_LITERAL = {'template_identity': 'SYNTHETIC-D26-TEMPLATE-A',
 'functional_role': '設計原子の同一性を担う汎用テンプレートA。所在filenameをidentityにしない。'}


def _meaning_value_in_finite_domain(value: object) -> bool:
    """L4意味値predicateの宣言。実装前は固有IDで停止する。"""
    _stop("meaning_value_unimplemented")


def _validate_finite_domain(raw: dict[str, object]) -> None:
    """L4有限raw条件の宣言。実装前は固有IDで停止する。"""
    _stop("finite_domain_unimplemented")


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
