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


def is_zero_operand_carry(raw, target_reads=()):
    """Observe only structural absence; do not infer qualification or meaning.

    Null fill claims need no target address here. Nonnull proposals consume
    the same walk's resolved outside-kind address; they do not re-read it.
    Nonempty meaning carriers remain outside this partial implementation.
    """
    from supply_validation import _APPROVED_KINDS, _json_equal

    claims = raw["claims"] if "claims" in raw else []
    if not isinstance(claims, list):
        return False
    for claim_index, claim in enumerate(claims):
        if (not isinstance(claim, dict) or claim.get("kind") != "fill_definition"
                or "proposed_value" not in claim):
            return False
        if claim["proposed_value"] is None:
            continue
        reads = [read for read in target_reads
                 if isinstance(read, dict) and read.get("claim_locator") == f"/claims/{claim_index}"
                 and _json_equal(read.get("claim"), claim)]
        if len(reads) != 1:
            return False
        read = reads[0]
        matches = read.get("matches")
        if (read.get("state") != "resolved" or not isinstance(matches, list) or not matches
                or any(not isinstance(match, dict)
                       or match.get("descriptor_kind") not in _APPROVED_KINDS
                       or match["descriptor_kind"] in _TARGET_KINDS for match in matches)):
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
