"""Private, source-only projection candidates for LABO Stage 1.

These helpers consume already-typed values. They do not read owner sources,
produce K1 results, or implement the public LABO APIs.
"""

from dataclasses import dataclass as _dataclass
from typing import Mapping as _Mapping
from typing import Sequence as _Sequence

__all__: tuple[str, ...] = ()

_OBSERVATION_FIELDS = (
    "episode_id",
    "requirement_revision",
    "ticket_id",
    "responsibility_id",
    "product",
    "mechanism",
    "worker",
    "provider",
    "model",
    "configuration",
    "artifact",
    "CI/test",
    "release",
    "deployment",
    "runtime",
    "failure",
    "rework",
    "cost",
    "time",
    "result",
)


@_dataclass(frozen=True)
class _Present:
    """Private representation of the existing Present(value) shape."""

    value: object


@_dataclass(frozen=True)
class _Missing:
    """Private representation of the existing Missing shape."""


_MISSING = _Missing()


@_dataclass(frozen=True)
class _AggregateFieldProjection:
    """Only the source-status and field-presence portion of AggregateObservation.

    lab_processing and the source/reference fields are intentionally absent:
    their owner-bound inputs are not produced by this local helper.
    """

    source_status: object
    field_presence: _Mapping[str, _Present | _Missing]


def _project_aggregate_fields(
    source_fields: _Mapping[str, object], source_status: object
) -> _AggregateFieldProjection:
    """Project the L5 field inventory without interpreting any field value.

    source_fields is assumed to be the already-typed fields mapping from a
    SourceObservation. This private helper is not a source parser or validator.
    Membership, not value truthiness, determines Present versus Missing.
    """

    presence = {
        field: _Present(source_fields[field]) if field in source_fields else _MISSING
        for field in _OBSERVATION_FIELDS
    }
    return _AggregateFieldProjection(
        source_status=source_status,
        field_presence=presence,
    )


@_dataclass(frozen=True)
class _EpisodeCandidateShapeProjection:
    """Private retention-only view of the existing EpisodeCandidate fields."""

    candidate_ref: object
    observation_refs: object
    source_refs: object
    source_contract_refs: object
    schema_refs: object
    provenance_refs: object
    relation: object
    causal_assertion: bool


def _project_episode_candidate_shape(
    *,
    candidate_ref: object,
    observation_refs: _Sequence[object],
    source_refs: _Sequence[object],
    source_contract_refs: _Sequence[object],
    schema_refs: _Sequence[object],
    provenance_refs: _Sequence[object],
    relation: object,
) -> _EpisodeCandidateShapeProjection:
    """Retain already-resolved refs and relation; do not correlate or infer."""

    return _EpisodeCandidateShapeProjection(
        candidate_ref=candidate_ref,
        observation_refs=observation_refs,
        source_refs=source_refs,
        source_contract_refs=source_contract_refs,
        schema_refs=schema_refs,
        provenance_refs=provenance_refs,
        relation=relation,
        causal_assertion=False,
    )
