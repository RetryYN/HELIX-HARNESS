"""Private source-only observation subsets for the INFRASTRUCTURE candidate.

No formal public L5 API is implemented by this module. These helpers retain
already typed observations but do not resolve owner declarations, choose K2
keys, classify INFRA operations, read sources, or cause effects.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping, Sequence

from common_kernel import (
    NotApplicable,
    ResultKey,
    Stale,
    SubjectRef,
    Unknown,
    Unobserved,
    Value,
)


Observed = Value[object] | Unknown | Unobserved | Stale[object] | NotApplicable


@dataclass(frozen=True)
class SourceObservation:
    """One existing K1 observation and the separately observed owner ref."""

    subject: SubjectRef
    value: Observed
    owner_ref: Observed


@dataclass(frozen=True)
class _ResourceProjectionSubset:
    """K2 key and source-qualified fields, with each K1 value preserved."""

    key: ResultKey
    identity: SubjectRef
    fields: Mapping[str, SourceObservation]


@dataclass(frozen=True)
class _NfrSummary:
    """Private aggregation of explicitly supplied existing K1 observations."""

    denominator: int
    value_count: int
    unknown_count: int
    unobserved_count: int
    stale_count: int
    not_applicable_count: int
    unresolved_count: int
    observations: Mapping[str, Observed]


def _is_observed(value: object) -> bool:
    return isinstance(value, (Value, Unknown, Unobserved, Stale, NotApplicable))


def _observations(source_observations: Mapping[str, SourceObservation]) -> dict[str, SourceObservation]:
    if not isinstance(source_observations, Mapping):
        raise TypeError("source_observations must be an already resolved mapping")
    copied: dict[str, SourceObservation] = {}
    for name, observation in source_observations.items():
        if not isinstance(name, str) or not isinstance(observation, SourceObservation):
            raise TypeError("source observation entries must use text field names and SourceObservation")
        if not isinstance(observation.subject, SubjectRef):
            raise TypeError("source observation subject must be an existing SubjectRef")
        if not _is_observed(observation.value) or not _is_observed(observation.owner_ref):
            raise TypeError("source values and owner refs must retain existing K1 Observed values")
        copied[name] = observation
    return copied


def _project_resource_observation_subset(
    key: ResultKey, source_observations: Mapping[str, SourceObservation]
) -> _ResourceProjectionSubset:
    """Project fields already read by K6 without changing their K1 states."""

    if not isinstance(key, ResultKey):
        raise TypeError("key must be an existing K2 ResultKey")
    return _ResourceProjectionSubset(key, key.subject, _observations(source_observations))


def _pair_source_observations(
    left: _ResourceProjectionSubset | Mapping[str, SourceObservation],
    right: _ResourceProjectionSubset | Mapping[str, SourceObservation],
) -> Mapping[str, tuple[SourceObservation | None, SourceObservation | None]]:
    """Pair corresponding supplied fields; do not infer equality/polarity.

    A missing side remains `None` as a projection-structure fact, not as a K1
    result. Each present SourceObservation retains its existing K1 value,
    source identity, and owner observation.
    """

    left_fields = _observations(left.fields if isinstance(left, _ResourceProjectionSubset) else left)
    right_fields = _observations(right.fields if isinstance(right, _ResourceProjectionSubset) else right)
    names = tuple(dict.fromkeys((*left_fields.keys(), *right_fields.keys())))
    return {name: (left_fields.get(name), right_fields.get(name)) for name in names}


def _retain_path_storage_observations(
    scope: SubjectRef, source_observations: Mapping[str, SourceObservation]
) -> Mapping[str, SourceObservation]:
    """Retain supplied path/storage fields without guessing role prefixes."""

    if not isinstance(scope, SubjectRef):
        raise TypeError("scope must be an existing SubjectRef")
    # `scope` is validated as an existing identity but is not used to infer
    # source roles or to create an INFRA result record.
    return _observations(source_observations)


def _summarize_nfr_observations(
    declared_items: Sequence[str], observations: Mapping[str, Observed]
) -> _NfrSummary:
    """Private L6 FN-07 helper; aggregate only the inputs actually supplied."""

    items = tuple(declared_items)
    if any(not isinstance(item, str) for item in items):
        raise TypeError("declared_items must contain text identities")
    if len(set(items)) != len(items):
        raise ValueError("declared_items must not contain duplicate identities")
    if not isinstance(observations, Mapping):
        raise TypeError("observations must be an already resolved mapping")
    if any(not isinstance(item, str) or not _is_observed(value) for item, value in observations.items()):
        raise TypeError("observation entries must contain text identities and existing K1 Observed values")
    selected = {item: observations[item] for item in items if item in observations}
    values = sum(isinstance(value, Value) for value in selected.values())
    unknowns = sum(isinstance(value, Unknown) for value in selected.values())
    unobserved = sum(isinstance(value, Unobserved) for value in selected.values())
    stale = sum(isinstance(value, Stale) for value in selected.values())
    not_applicable = sum(isinstance(value, NotApplicable) for value in selected.values())
    return _NfrSummary(
        denominator=len(items),
        value_count=values,
        unknown_count=unknowns,
        unobserved_count=unobserved,
        stale_count=stale,
        not_applicable_count=not_applicable,
        unresolved_count=len(items) - len(selected),
        observations=selected,
    )
