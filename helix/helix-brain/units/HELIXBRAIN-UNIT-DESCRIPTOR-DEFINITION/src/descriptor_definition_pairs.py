"""Narrow one-fact pair-reader result used by the same-call FN1 walk."""

from __future__ import annotations

from typing import Any


def meaning_pair_axes_with_origins(validated: dict[str, Any], slot: dict[str, Any]) -> dict[str, object]:
    """Return the typed empty pair result when a slot has fewer than two facts.

    A comparison pair requires two original facts. This bounded reader has no
    pair predicate to evaluate for one fact and does not synthesize one. Multi-
    fact populations remain outside this implementation and stop explicitly.
    """
    if not isinstance(validated, dict) or not isinstance(validated.get("input"), dict):
        raise NotImplementedError(
            "F01/F02/unclosed/meaning_pair_validated_input; "
            "Backflow HELIXBRAIN-L6-032-N03-PATH"
        )
    if not isinstance(slot, dict):
        raise NotImplementedError(
            "F01/F02/unclosed/meaning_pair_slot_shape; "
            "Backflow HELIXBRAIN-L6-032-N03-PATH"
        )
    facts = slot.get("facts")
    if facts is None:
        return {"axes": None, "origins": []}
    if not isinstance(facts, list):
        raise NotImplementedError(
            "F01/F02/unclosed/meaning_pair_facts_type; "
            "Backflow HELIXBRAIN-L6-032-N03-PATH"
        )
    if len(facts) > 1:
        raise NotImplementedError(
            "F01/F02/unclosed/meaning_pair_multifact; "
            "Backflow HELIXBRAIN-L6-032-N03-PATH"
        )
    return {"axes": [], "origins": []}
