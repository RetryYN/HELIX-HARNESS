"""FN0 public validation assembly over the carrier and source-check modules."""

from __future__ import annotations

import copy
from typing import Any

from application_input_schema import _shape_issues
from application_source_checks import _source_results


def validate_application_input(raw: Any) -> dict[str, Any]:
    """Decode one RawValue and return the L5 ValidatedApplication projection."""
    shape_issues = _shape_issues(raw)
    if shape_issues:
        return {"input": None, "input_issues": shape_issues, "unusable_source_refs": []}
    original = copy.deepcopy(raw)
    issues, unusable = _source_results(original)
    return {"input": original, "input_issues": issues, "unusable_source_refs": unusable}
