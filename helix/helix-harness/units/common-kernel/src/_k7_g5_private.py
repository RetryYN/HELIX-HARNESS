"""Private comparisons over existing K1/K2/K5 values only.

No K7/G5 domain record, owner port, public API, or effect is implemented here.
"""

from __future__ import annotations

from typing import Iterable

from common_kernel import SubjectRef
from journal import SegmentHead


__all__: tuple[str, ...] = ()


def _same_head(expected: SegmentHead, current: SegmentHead) -> bool:
    """Compare two already-resolved K5 heads; does not perform a CAS."""
    return expected == current


def _same_target_identity(expected: str, current: str) -> bool:
    """Compare supplied identity strings without resolving an owner source."""
    return expected == current


def _same_subject_ref(expected: SubjectRef, current: SubjectRef) -> bool:
    """Compare existing full K2 refs without adapting or selecting either ref."""
    return expected == current


def _identity_class_pairs(values: Iterable[tuple[str, str]]) -> frozenset[tuple[str, str]]:
    """Retain explicitly supplied identity/class pairs as built-in values."""
    return frozenset(values)
