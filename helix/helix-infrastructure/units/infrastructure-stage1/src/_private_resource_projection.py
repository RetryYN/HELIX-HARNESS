"""Private source-qualified resource-field projection candidate.

This module retains only caller-supplied K1 observations. It does not read
sources, resolve owners, encode domain absence, or implement a public L5 API.
"""

from __future__ import annotations

from dataclasses import dataclass
from types import MappingProxyType
from typing import Mapping

from common_kernel import ResultKey, SubjectRef
from infrastructure import SourceObservation, _observations


@dataclass(frozen=True)
class _ResourceProjection:
    """Identity plus supplied fields; the input ResultKey is not output."""

    identity: SubjectRef
    fields: Mapping[str, SourceObservation]


def _project_resource_observation(
    key: ResultKey, source_observations: Mapping[str, SourceObservation]
) -> _ResourceProjection:
    """Copy the field mapping while retaining each exact source observation."""

    if not isinstance(key, ResultKey):
        raise TypeError("key must be an existing K2 ResultKey")
    fields = _observations(source_observations)
    return _ResourceProjection(key.subject, MappingProxyType(fields))
