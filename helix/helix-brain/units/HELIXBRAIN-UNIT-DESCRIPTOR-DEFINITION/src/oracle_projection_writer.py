"""FN4の原carry軸と既存predicate軸を合流する未実装writer境界。"""

from __future__ import annotations

from typing import Any


def write_oracle_axes(
    original_axes: list[dict[str, Any]], predicate_axes: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    """Preserve matched original axes and append deduplicated rule axes in order."""
    raise NotImplementedError(
        "F05/F06/unclosed/axis_projection_writer; "
        "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
    )

