"""L4 nonfire_read_planの対象意味operandがない有限枝。"""
from __future__ import annotations


_TARGET_KINDS = {"measurement", "completion", "negative oracle"}
_SOURCE_KEYS = {
    "semantic_json": {
        "binding", "descriptor_facts", "descriptor_targets",
        "definition_meaning_operations",
    },
    "reference_only": {"binding", "reference_target", "reference_context"},
}


def is_zero_operand_carry(raw, target_reads=None):
    """Observe only structural absence; do not infer qualification or meaning.

    The sole supplied-Claim case is the L4 finite fill_definition branch: explicit
    null needs only its same-call target read, while non-null needs a resolved
    non-target address. Nonempty meaning carriers remain outside this partial
    implementation. Missing descriptor definitions are carried from original fn1.
    """
    from descriptor_definitions import _APPROVED_KINDS
    from supply_validation import _json_equal

    claims = raw.get("claims", [])
    if not isinstance(claims, list):
        return False
    if claims:
        if not isinstance(target_reads, list) or len(target_reads) != len(claims):
            return False
        for index, (claim, target_read) in enumerate(zip(claims, target_reads)):
            if (not isinstance(claim, dict) or claim.get("kind") != "fill_definition"
                    or "proposed_value" not in claim):
                return False
            if (not isinstance(target_read, dict)
                    or target_read.get("claim_locator") != f"/claims/{index}"
                    or not _json_equal(target_read.get("claim"), claim)):
                return False
            if claim["proposed_value"] is not None:
                matches = target_read.get("matches")
                if (target_read.get("state") != "resolved"
                        or not isinstance(matches, list) or not matches
                        or any(
                            not isinstance(match, dict)
                            or not isinstance(match.get("descriptor_kind"), str)
                            or match["descriptor_kind"] not in _APPROVED_KINDS
                            or match["descriptor_kind"] in _TARGET_KINDS
                            for match in matches
                        )):
                    return False
    elif target_reads not in (None, []):
        return False
    for member in ("oracle_bindings", "values", "handoff_records"):
        if member in raw and raw[member] != []:
            return False
    slots = raw.get("descriptors")
    if not isinstance(slots, list) or any(
        not isinstance(slot, dict) or slot.get("descriptor_kind") in _TARGET_KINDS
        for slot in slots
    ):
        return False
    sources = raw.get("sources")
    if not isinstance(sources, list):
        return False
    for source in sources:
        if not isinstance(source, dict) or source.get("role") not in _SOURCE_KEYS:
            return False
        content = source.get("content")
        if (not isinstance(content, dict)
                or not set(content) <= _SOURCE_KEYS[source["role"]]):
            return False
        if source["role"] == "semantic_json":
            for carrier in ("descriptor_facts", "definition_meaning_operations"):
                if carrier in content and content[carrier] != []:
                    return False
    return True
