"""FN4の原carry軸とpredicate軸を順序を保って合流するwriter。"""

from __future__ import annotations

import copy
from typing import Any


def write_oracle_axes(
    original_axes: list[dict[str, Any]], predicate_axes: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    """Keep carry/matching original rows, then first predicate rows by axis key."""
    from descriptor_definitions import _binding_same, _ref_same

    carry_axes = {
        "measurement.definition",
        "completion.definition",
        "negative oracle.definition",
    }

    def matches(left: dict[str, Any], right: dict[str, Any]) -> bool:
        return (
            left.get("axis") == right.get("axis")
            and _ref_same(left.get("subject_ref"), right.get("subject_ref"))
            and _binding_same(left.get("binding"), right.get("binding"))
        )

    retained = [
        row for row in original_axes
        if row.get("axis") in carry_axes
        or any(matches(row, predicate) for predicate in predicate_axes)
    ]
    result = [copy.deepcopy(row) for row in retained]
    appended: list[dict[str, Any]] = []
    for predicate in predicate_axes:
        if any(matches(row, predicate) for row in retained):
            continue
        if any(matches(row, predicate) for row in appended):
            continue
        appended.append(predicate)
        result.append(copy.deepcopy(predicate))
    return result

