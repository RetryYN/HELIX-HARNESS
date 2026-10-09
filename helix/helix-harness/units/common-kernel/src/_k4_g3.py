"""Private, pure K4/G3 comparisons over already-resolved L4 values.

This module does not expose the K4/G3 APIs or resolve owner inputs. Its helpers
only compare fields supplied by a caller that already crossed those boundaries.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import AbstractSet, TypeVar

Id = TypeVar("Id", bound=str)
DigestPair = tuple[str, str]


def _obligation_id_delta(
    expected_ids: AbstractSet[Id], actual_ids: AbstractSet[Id]
) -> tuple[frozenset[Id], frozenset[Id]]:
    """Return missing and extra IDs for a view/set comparison (K4-I1)."""
    return (
        frozenset(expected_ids - actual_ids),
        frozenset(actual_ids - expected_ids),
    )


def _not_applicable_fields_complete(
    reason: object, authority: object, reentry_trigger: object
) -> bool:
    """Check only the three existing L4 NotApplicable fields (K4-I3)."""
    return reason is not None and authority is not None and reentry_trigger is not None


def _deferred_fields_complete(
    target_point: object, owner: object, discharge_condition: object
) -> bool:
    """Check only the three existing L4 Deferred fields (K4-I3)."""
    return target_point is not None and owner is not None and discharge_condition is not None


def _handoff_delta(
    expected_records: Mapping[Id, DigestPair],
    unfinished_ids: Sequence[Id],
    inherited_records: Mapping[Id, DigestPair],
) -> tuple[
    frozenset[Id],
    frozenset[Id],
    frozenset[Id],
    frozenset[Id],
]:
    """Compare K4-I5 ID and K2 digest pairs without interpreting their result.

    The expected mapping is derived from ``from_view`` by the caller. Values
    are the existing K2 ``(key_digest, result_digest)`` pair. This helper does
    not read a Handoff or invent the surrounding API projection.
    """
    expected_ids = frozenset(expected_records)
    actual_unfinished = frozenset(unfinished_ids)
    missing_unfinished = expected_ids - actual_unfinished
    extra_unfinished = actual_unfinished - expected_ids

    required_inherited = expected_ids & actual_unfinished
    actual_inherited = frozenset(inherited_records)
    missing_inherited = required_inherited - actual_inherited
    mismatched_inherited = frozenset(
        identity
        for identity in required_inherited & actual_inherited
        if expected_records[identity] != inherited_records[identity]
    )
    return (
        frozenset(missing_unfinished),
        frozenset(extra_unfinished),
        frozenset(missing_inherited),
        mismatched_inherited,
    )
