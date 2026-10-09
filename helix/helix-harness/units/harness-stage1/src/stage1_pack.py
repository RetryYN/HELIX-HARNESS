"""HARNESS Stage 1 private comparison primitives.

The L5 candidate APIs require K1 Observed results, but their signatures do not
bind a ResultKey operation/version/scope or a PolarityMapping. Until those
bindings are supplied by an existing owner contract, this module deliberately
implements only private payload-level comparisons. It has no reader, registry,
owner adapter, permission, dispatch, persistence, or effect path.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Sequence, TypeAlias

from common_kernel import SubjectRef


Comparison = Literal["match", "mismatch"]


@dataclass(frozen=True)
class _FieldComparisonFact:
    """L6 private representation of an existing L5 field comparison."""

    field_ref: SubjectRef
    left_ref: SubjectRef
    right_ref: SubjectRef
    comparison: Comparison


@dataclass(frozen=True)
class _DeclaredFieldFact:
    """A read declaration state supplied by the caller, never inferred here."""

    field_ref: SubjectRef
    state: Literal["missing", "multiple"]
    candidate_refs: tuple[SubjectRef, ...]


FieldFact: TypeAlias = _FieldComparisonFact | _DeclaredFieldFact


@dataclass(frozen=True)
class _DomainEvaluation:
    """L6 private comparison facts plus unchanged upstream observations."""

    facts: tuple[FieldFact, ...]
    source_results: tuple[object, ...]


def _compare_field_refs(
    field_ref: SubjectRef,
    left_ref: SubjectRef,
    right_ref: SubjectRef,
) -> _FieldComparisonFact:
    """Compare already-observed refs without assigning K1/K2 meaning."""
    return _FieldComparisonFact(
        field_ref=field_ref,
        left_ref=left_ref,
        right_ref=right_ref,
        comparison="match" if left_ref == right_ref else "mismatch",
    )


def _compare_declared_fields(
    fields: Sequence[FieldFact],
    source_results: Sequence[object] = (),
) -> _DomainEvaluation:
    """Project explicit facts, retaining existing non-Value owner results."""
    facts: list[FieldFact] = []
    for item in fields:
        if isinstance(item, (_FieldComparisonFact, _DeclaredFieldFact)):
            facts.append(item)
        else:
            raise TypeError("field facts must already be explicit L5 comparison/declaration facts")
    return _DomainEvaluation(tuple(facts), tuple(source_results))
