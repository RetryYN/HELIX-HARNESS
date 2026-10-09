"""Private SECURITY Stage 1 projection helpers.

This source-only candidate preserves already-produced result objects in the
existing L5 projection slots. It does not resolve owners or call K3/K6/G5/K8.
"""
from __future__ import annotations

from dataclasses import dataclass, replace
from typing import Any


@dataclass(frozen=True)
class _SecurityInputSlots:
    """Private shape matching the existing L5 SecurityInputProjection slots."""

    case_ref: Any
    input_refs: tuple[Any, ...]
    permission: Any
    label: Any
    effect: Any
    verification: Any
    propagation: Any
    source_refs: tuple[Any, ...]


def _project_existing_slots(projection: _SecurityInputSlots) -> _SecurityInputSlots:
    """Copy the projection container while preserving every slot value as-is."""
    return replace(projection)


def _same_subject_ref(left: Any, right: Any) -> bool:
    """Compare the four explicit SubjectRef fields; no current ref is resolved."""
    return (
        left.kind == right.kind
        and left.identity == right.identity
        and left.revision == right.revision
        and left.digest == right.digest
    )


def _same_fixed_ref(left: Any, right: Any) -> bool:
    """Compare the three explicit FixedRef fields; no bytes are read."""
    return (
        left.store == right.store
        and left.locator == right.locator
        and left.digest == right.digest
    )
