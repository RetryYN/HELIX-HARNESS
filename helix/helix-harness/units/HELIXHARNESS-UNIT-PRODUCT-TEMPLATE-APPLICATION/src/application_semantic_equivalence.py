"""Semantic-equivalence comparison (HARNESS-L5-009 / FN8)."""

from __future__ import annotations

import copy
import math
from typing import Any


_REF_FIELDS = {"identity", "revision", "scope", "owner", "source_locator", "sha256"}
_REF_TEXT_FIELDS = {"identity", "revision", "owner", "source_locator", "sha256"}


def _is_raw_value(value: Any) -> bool:
    if value is None or isinstance(value, (str, bool, int)):
        return True
    if isinstance(value, float):
        return math.isfinite(value)
    if isinstance(value, list):
        return all(_is_raw_value(item) for item in value)
    if isinstance(value, dict):
        return all(
            isinstance(key, str) and _is_raw_value(item)
            for key, item in value.items()
        )
    return False


def _ref_shape_error(ref: Any) -> str | None:
    if not isinstance(ref, dict):
        return "expected Ref object"
    if any(not isinstance(key, str) or key not in _REF_FIELDS for key in ref):
        return "Ref contains an undeclared member"
    if any(
        key in ref and ref[key] is not None and not isinstance(ref[key], str)
        for key in _REF_TEXT_FIELDS
    ):
        return "Ref text member has invalid type"
    if "scope" in ref and not _is_raw_value(ref["scope"]):
        return "Ref scope is not RawValue"
    return None


def compare_semantic_equivalence(context: Any) -> dict[str, Any]:
    """Preserve one snapshot as not evaluated until whole-obligation evidence exists.

    The frozen baseline has a single ApplicationInput and no comparison material
    for a second obligation set. Producer material and claims cannot manufacture
    that missing comparison evidence.
    """
    # B02-NEG-01..04 provide Claims, but no paired obligation Ref set, foreign
    # binding/candidate set, or observed equal-count second set. Keep those
    # subassertions stopped; never promote Claim.kind/basis into source facts.
    validated = context.get("validated") if isinstance(context, dict) else None
    raw = validated.get("input") if isinstance(validated, dict) else None
    if not isinstance(raw, dict) or not isinstance(raw.get("binding"), dict):
        raise NotImplementedError(
            "HARNESS-L5-009-compare_semantic_equivalence: validated input binding unavailable"
        )

    binding = copy.deepcopy(raw["binding"])
    obligations = raw.get("obligations")
    if not isinstance(obligations, list):
        raise NotImplementedError(
            "HARNESS-L5-009-compare_semantic_equivalence: typed obligation list unavailable"
        )
    obligation_refs = []
    for index, obligation in enumerate(obligations):
        pointer = f"/obligations/{index}"
        if not isinstance(obligation, dict):
            raise NotImplementedError(
                "HARNESS-L5-009-compare_semantic_equivalence: "
                f"{pointer} is not a KindObligation object"
            )
        if "ref" not in obligation:
            raise NotImplementedError(
                "HARNESS-L5-009-compare_semantic_equivalence: "
                f"{pointer}/ref is missing"
            )
        ref_error = _ref_shape_error(obligation["ref"])
        if ref_error is not None:
            raise NotImplementedError(
                "HARNESS-L5-009-compare_semantic_equivalence: "
                f"{pointer}/ref {ref_error}"
            )
        obligation_refs.append(copy.deepcopy(obligation["ref"]))

    # L5 comparison_material_contract/rules/3: empty differences do not prove
    # equivalence. Preserve the source Ref sequence, including duplicate rows.
    return {
        "producer_symbol": "compare_semantic_equivalence",
        "input_binding": binding,
        "original_axes": [],
        "findings": [],
        "material": {
            "comparison_state": "not_evaluated",
            "obligation_refs": copy.deepcopy(obligation_refs),
            "comparison_basis_refs": [],
            "missing_obligation_refs": [],
            "extra_obligation_refs": [],
            "not_evaluated_refs": copy.deepcopy(obligation_refs),
        },
    }
