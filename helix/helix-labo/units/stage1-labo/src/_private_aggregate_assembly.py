"""Private assembler for the existing LABO AggregateObservation shape.

This combines already typed source fields/refs and an existing K1 observation.
It does not read an owner source, resolve currentness, create a K1 result, or
implement a public LABO API.
"""

from __future__ import annotations

from dataclasses import dataclass as _dataclass
from typing import Mapping as _Mapping

from common_kernel import Observed as _Observed
from common_kernel import SubjectRef as _SubjectRef
from projection import (
    _Missing,
    _Present,
    _project_aggregate_fields,
)

__all__: tuple[str, ...] = ()


@_dataclass(frozen=True)
class _AggregateObservation:
    """Private Python shape matching the five existing L5 output fields."""

    source_observation_ref: _SubjectRef
    exact_source: _SubjectRef
    source_status: object
    field_presence: _Mapping[str, _Present | _Missing]
    lab_processing: _Observed[object]


def _assemble_aggregate_observation(
    *,
    source_observation_ref: _SubjectRef,
    exact_source: _SubjectRef,
    source_fields: _Mapping[str, object],
    source_status: object,
    lab_processing: _Observed[object],
) -> _AggregateObservation:
    """Assemble the existing L5 shape without interpreting supplied values.

    The caller supplies both refs and the existing K1 value. Field presence is
    delegated to the existing projection helper; no source/default/result is
    inferred here.
    """

    fields = _project_aggregate_fields(source_fields, source_status)
    return _AggregateObservation(
        source_observation_ref=source_observation_ref,
        exact_source=exact_source,
        source_status=fields.source_status,
        field_presence=fields.field_presence,
        lab_processing=lab_processing,
    )
