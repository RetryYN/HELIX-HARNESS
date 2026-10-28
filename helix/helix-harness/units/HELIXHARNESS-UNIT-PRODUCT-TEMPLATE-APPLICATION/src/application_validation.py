"""FN0 public validation projection over the private detailed entry."""

from __future__ import annotations

from typing import Any

from application_validation_detail import validate_application_input_detail


def validate_application_input(raw: Any) -> dict[str, Any]:
    """Return the existing L5 ValidatedApplication projection from one detail call."""
    return validate_application_input_detail({"tag": "native", "raw": raw})["validated"]
