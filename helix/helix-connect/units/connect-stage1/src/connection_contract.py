"""Private source-only observation-slot projection for CONNECT Stage 1.

This module does not implement a public L5 API, resolve owner sources, build a
K2 key, compare endpoint semantics, query K3, or perform a transport/effect.
It only retains already-typed K1 observations beside their supplied refs.
"""

from __future__ import annotations

from collections.abc import Sequence
from typing import TypeAlias

from common_kernel import (
    NotApplicable as _NotApplicable,
    Stale as _Stale,
    SubjectRef as _SubjectRef,
    Unknown as _Unknown,
    Unobserved as _Unobserved,
    Value as _Value,
)


__all__: tuple[str, ...] = ()

_Observed: TypeAlias = _Value[object] | _Unknown | _Unobserved | _Stale[object] | _NotApplicable
_ObservationSlot: TypeAlias = tuple[str, _SubjectRef, _Observed]
_OBSERVED_TYPES = (_Value, _Unknown, _Unobserved, _Stale, _NotApplicable)


def _retain_observation_slots(
    slots: Sequence[_ObservationSlot],
) -> tuple[_ObservationSlot, ...]:
    """Retain ordered ``(slot name, existing SubjectRef, K1 Observed)`` rows.

    Slot names and refs are opaque here. This helper deliberately does not
    deduplicate, reorder, compare, infer required fields, or select a K1 class.
    A ``TypeError`` indicates only misuse of this private Python helper; it is
    not a CONNECT/K1 diagnostic or a product result.
    """

    if isinstance(slots, (str, bytes)) or not isinstance(slots, Sequence):
        raise TypeError("slots must be an ordered sequence of typed observation rows")

    retained: list[_ObservationSlot] = []
    for row in slots:
        if not isinstance(row, tuple) or len(row) != 3:
            raise TypeError("each observation row must be a 3-tuple")
        slot_name, source_ref, observation = row
        if not isinstance(slot_name, str) or not isinstance(source_ref, _SubjectRef):
            raise TypeError("each row must carry a text slot name and existing SubjectRef")
        if not isinstance(observation, _OBSERVED_TYPES):
            raise TypeError("each row must retain an existing K1 Observed value")
        retained.append(row)
    return tuple(retained)
