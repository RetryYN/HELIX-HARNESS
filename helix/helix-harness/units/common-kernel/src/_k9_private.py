"""Private, pure K9 projections over already-resolved current values.

This module deliberately does not implement either public K9 API, owner source
readers, current-head resolution, producer-closure construction, K5/K6 access,
or result persistence. It only represents the existing L4 K9 shapes and
compares fully supplied values.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal, Sequence

import common_kernel as k1

__all__: tuple[str, ...] = ()

Role = Literal[
    "producer",
    "original_worker",
    "helper",
    "test_author",
    "consultant",
    "subagent",
    "reviewer",
]
SelectionState = Literal["selected", "not_selected", "unknown"]
Axis = Literal["identity", "context", "authority", "route"]
Side = Literal["creator", "reviewer"]
Relation = Literal["same", "distinct"]


@dataclass(frozen=True)
class _ParticipantSlot:
    slot: str
    role: Role
    actor: k1.SubjectRef
    origin: k1.SubjectRef
    context: k1.SubjectRef | None
    authority: k1.SubjectRef | None
    route: k1.SubjectRef | None


@dataclass(frozen=True)
class _RoleSelection:
    role: Role
    state: SelectionState
    source: k1.SubjectRef


@dataclass(frozen=True)
class _ReviewTarget:
    artifact: k1.SubjectRef
    base: k1.SubjectRef
    task_scope: k1.SubjectRef
    oracle: k1.SubjectRef
    current_result: k1.SubjectRef
    case: k1.SubjectRef


@dataclass(frozen=True)
class _ContentProducerGraph:
    assignment: k1.SubjectRef
    candidate: k1.SubjectRef
    target: _ReviewTarget
    selections: tuple[_RoleSelection, ...]
    slots: tuple[_ParticipantSlot, ...]
    source_closure: k1.SubjectRef
    closure_evidence: tuple[k1.SubjectRef, ...]


@dataclass(frozen=True)
class _ComparisonSource:
    slot: str
    role: Role
    axis: Axis
    side: Side
    source_ref: k1.SubjectRef | None


@dataclass(frozen=True)
class _ParticipantBindingSet:
    creator_slots: tuple[_ParticipantSlot, ...]
    reviewer_slot: _ParticipantSlot
    role_selection_digest: str
    comparison_sources: tuple[_ComparisonSource, ...]


@dataclass(frozen=True)
class _ReviewAxisCheck:
    creator_slot: str
    creator_role: Role
    axis: Axis
    creator_ref: k1.SubjectRef | None
    reviewer_ref: k1.SubjectRef | None
    comparison_contract: k1.SubjectRef | None
    creator_axis_identity: str | None
    reviewer_axis_identity: str | None
    relation: k1.Observed[Relation]


@dataclass(frozen=True)
class _Independent:
    pass


@dataclass(frozen=True)
class _NotIndependent:
    failed_axes: tuple[Axis, ...]
    reason_codes: tuple[str, ...]


@dataclass(frozen=True)
class _ReviewIndependence:
    target: _ReviewTarget
    binding_set: _ParticipantBindingSet
    checks: tuple[_ReviewAxisCheck, ...]
    outcome: _Independent | _NotIndependent


@dataclass(frozen=True)
class _AxisRelationFact:
    slot: str
    axis: Axis
    relation: Relation


@dataclass(frozen=True)
class _RosterCompletenessFact:
    complete: bool


@dataclass(frozen=True)
class _CreatorSetNonemptyFact:
    nonempty: bool


_K9IndependenceComponent = (
    _AxisRelationFact | _RosterCompletenessFact | _CreatorSetNonemptyFact
)


@dataclass(frozen=True)
class _ReviewIndependenceCheck:
    result: k1.Observed[_ReviewIndependence]
    components: tuple[k1.Observed[_K9IndependenceComponent], ...]
    combined: k1.Combined[_K9IndependenceComponent]
    assurance: Any
    authority_effect: Literal["none"]


@dataclass(frozen=True)
class _AxisComparisonInput:
    creator_slot: str
    creator_role: Role
    axis: Axis
    creator_ref: k1.SubjectRef | None
    reviewer_ref: k1.SubjectRef | None
    comparison_contract: k1.SubjectRef | None
    creator_axis_identity: str | None
    reviewer_axis_identity: str | None
    comparison_key: k1.ResultKey | None
    evidence: Any
    unresolved_relation: k1.Observed[Relation] | None = None


def _role_bound_source_ref(
    slot: str,
    role: Role,
    axis: Axis,
    side: Side,
    source_ref: k1.SubjectRef,
) -> k1.SubjectRef:
    """Build the exact K9 source-content alias from the existing L4 rule."""
    alias_identity = k1._canonical_json_bytes(
        {
            "slot": slot,
            "role": role,
            "axis": axis,
            "side": side,
            "source_kind": source_ref.kind,
            "source_identity": source_ref.identity,
        }
    ).decode("utf-8")
    return k1.SubjectRef(
        kind="k9_role_bound_source",
        identity=alias_identity,
        revision=source_ref.revision,
        digest=source_ref.digest,
    )


def _bind_role_bound_source_aliases(
    sources: Sequence[_ComparisonSource],
    *,
    binding_kind: str,
    binding_identity: str,
    owner_revision: str | None = None,
) -> k1.AliasBinding | k1.Rejected:
    """Delegate alias dedup/conflict and canonical binding to the K2 helper.

    ``binding_kind``/``binding_identity``/``owner_revision`` are supplied by an
    already-resolved owner binding. This helper does not infer current owner
    truth or construct the K9 ParticipantBindingSet fixed ref.
    """
    aliases: list[tuple[Any, str, k1.SubjectRef, k1.SubjectRef]] = []
    for source in sources:
        if source.source_ref is None:
            # Absence stays absence; no placeholder SubjectRef is fabricated.
            continue
        raw_ref = source.source_ref
        alias_ref = _role_bound_source_ref(
            source.slot, source.role, source.axis, source.side, raw_ref
        )
        context = {"slot": source.slot, "axis": source.axis, "side": source.side}
        aliases.append((context, source.role, raw_ref, alias_ref))
    return k1._bind_alias_inputs(
        aliases,
        binding_kind=binding_kind,
        binding_identity=binding_identity,
        owner_revision=owner_revision,
    )


def _review_target_mismatches(
    expected: _ReviewTarget, actual: _ReviewTarget
) -> tuple[str, ...]:
    """Return exact mismatching L4 target fields, in their declared order.

    This is a comparison locator only. It does not create a K9 result class or
    project target mismatch into components/combined.
    """
    fields = (
        "artifact",
        "base",
        "task_scope",
        "oracle",
        "current_result",
        "case",
    )
    return tuple(field for field in fields if getattr(expected, field) != getattr(actual, field))


def _compare_resolved_axes(
    rows: Sequence[_AxisComparisonInput],
) -> tuple[_ReviewAxisCheck, ...]:
    """Compare supplied owner-resolved identities and retain every axis check.

    When both identities exist, ``comparison_key`` is required and is used as
    the existing K1 Value key. When an identity is unresolved, the caller must
    supply the already-keyed non-Value relation; this helper preserves it and
    never invents an Unknown reason.
    """
    checks: list[_ReviewAxisCheck] = []
    for row in rows:
        if row.axis not in ("identity", "context", "authority", "route"):
            raise TypeError("axis must be an existing K9 axis")
        if row.creator_axis_identity is not None and row.reviewer_axis_identity is not None:
            if row.comparison_key is None:
                raise TypeError("resolved K9 axis comparison requires its complete existing ResultKey")
            if row.unresolved_relation is not None:
                raise TypeError("resolved axis identities cannot also carry an unresolved relation")
            relation: k1.Observed[Relation] = k1.Value(
                "same"
                if row.creator_axis_identity == row.reviewer_axis_identity
                else "distinct",
                row.comparison_key,
                row.evidence,
            )
        else:
            unresolved = row.unresolved_relation
            if unresolved is None or isinstance(unresolved, k1.Value):
                raise TypeError("unresolved owner identity requires its existing keyed non-Value relation")
            relation = unresolved
        checks.append(
            _ReviewAxisCheck(
                creator_slot=row.creator_slot,
                creator_role=row.creator_role,
                axis=row.axis,
                creator_ref=row.creator_ref,
                reviewer_ref=row.reviewer_ref,
                comparison_contract=row.comparison_contract,
                creator_axis_identity=row.creator_axis_identity,
                reviewer_axis_identity=row.reviewer_axis_identity,
                relation=relation,
            )
        )
    return tuple(checks)


def _compare_axes_after_inventory_value(
    creator_inventory: k1.Observed[Any],
    rows: Sequence[_AxisComparisonInput],
) -> tuple[_ReviewAxisCheck, ...] | None:
    """Do not enter axis comparison when the inventory observation is non-Value.

    ``None`` is a private control-flow marker meaning no axis checks were run;
    the caller retains the original inventory observation. This does not map
    it to the public K9 result/component shape.
    """
    if not isinstance(creator_inventory, k1.Value):
        return None
    return _compare_resolved_axes(rows)


def _k9_independence_polarity(value: _K9IndependenceComponent) -> k1.Polarity:
    """Apply the HARNESS-owned K9 mapping already stated in L4 §17.3."""
    if isinstance(value, _AxisRelationFact):
        if value.relation == "same":
            return k1.Polarity.NEGATIVE
        if value.relation == "distinct":
            return k1.Polarity.POSITIVE
    elif isinstance(value, _RosterCompletenessFact) and value.complete is True:
        return k1.Polarity.POSITIVE
    elif isinstance(value, _CreatorSetNonemptyFact) and value.nonempty is True:
        return k1.Polarity.POSITIVE
    raise TypeError(
        "only resolved same/distinct and affirmative complete/nonempty facts are Values; "
        "preserve other states as existing keyed non-Values"
    )


def _combine_review_components(
    components: Sequence[k1.Observed[_K9IndependenceComponent]],
    *,
    resolved_rule_version: str,
) -> k1.Combined[_K9IndependenceComponent] | k1.Rejected:
    """Fold with the already-resolved current K9 rule version.

    This helper neither chooses a default version nor reads the owner source
    that resolves it.
    """
    mapping = k1.PolarityMapping(
        identity="k9_independence_polarity",
        version=resolved_rule_version,
        classify=_k9_independence_polarity,
    )
    return k1.combine(
        [(component, mapping) for component in components]
    )
