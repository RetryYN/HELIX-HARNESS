"""Private, lossless HARNESS pack-revision payload projection.

This module only stores already-resolved references, facts, and the supplied
domain relation. It has no reader, owner binding, K1 wrapper, or public API.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Sequence

from common_kernel import SubjectRef
from stage1_pack import FieldFact, _DeclaredFieldFact, _FieldComparisonFact


__all__: tuple[str, ...] = ()


RevisionRelation = Literal["current", "stale"]


@dataclass(frozen=True)
class _PackRevisionComparison:
    """Private representation of the existing L5 PackRevisionComparison."""

    declared_pack_refs: tuple[SubjectRef, ...]
    current_pack_refs: tuple[SubjectRef, ...]
    declared_contract_refs: tuple[SubjectRef, ...]
    current_contract_refs: tuple[SubjectRef, ...]
    declared_dependency_refs: tuple[SubjectRef, ...]
    current_dependency_refs: tuple[SubjectRef, ...]
    cause_dependency_refs: tuple[SubjectRef, ...]
    cause_pack_refs: tuple[SubjectRef, ...]
    facts: tuple[FieldFact, ...]
    revision_relation: RevisionRelation

    @property
    def field_comparisons(self) -> tuple[_FieldComparisonFact, ...]:
        """Read-only projection in the order of the complete facts tuple."""
        return tuple(fact for fact in self.facts if isinstance(fact, _FieldComparisonFact))

    @property
    def declared_field_facts(self) -> tuple[_DeclaredFieldFact, ...]:
        """Read-only projection in the order of the complete facts tuple."""
        return tuple(fact for fact in self.facts if isinstance(fact, _DeclaredFieldFact))


def _pack_revision_comparison_candidate(
    *,
    declared_pack_refs: Sequence[SubjectRef],
    current_pack_refs: Sequence[SubjectRef],
    declared_contract_refs: Sequence[SubjectRef],
    current_contract_refs: Sequence[SubjectRef],
    declared_dependency_refs: Sequence[SubjectRef],
    current_dependency_refs: Sequence[SubjectRef],
    cause_dependency_refs: Sequence[SubjectRef],
    cause_pack_refs: Sequence[SubjectRef],
    facts: Sequence[FieldFact],
    revision_relation: RevisionRelation,
) -> _PackRevisionComparison:
    """Retain fully resolved inputs without lookup or semantic inference.

    In particular, cause references and ``revision_relation`` are caller-owned
    observations. This constructor does not infer them from ref equality or
    field comparisons. Non-Value source results must remain at their existing
    boundary and are intentionally not accepted by this payload constructor.
    """
    return _PackRevisionComparison(
        declared_pack_refs=tuple(declared_pack_refs),
        current_pack_refs=tuple(current_pack_refs),
        declared_contract_refs=tuple(declared_contract_refs),
        current_contract_refs=tuple(current_contract_refs),
        declared_dependency_refs=tuple(declared_dependency_refs),
        current_dependency_refs=tuple(current_dependency_refs),
        cause_dependency_refs=tuple(cause_dependency_refs),
        cause_pack_refs=tuple(cause_pack_refs),
        facts=tuple(facts),
        revision_relation=revision_relation,
    )
