"""L4 nonfire_read_planのClaim/meaning carrier原出現0件の有限枝。"""
from __future__ import annotations


_TARGET_KINDS = {"measurement", "completion", "negative oracle"}
_SOURCE_KEYS = {
    "semantic_json": {
        "binding", "descriptor_facts", "descriptor_targets",
        "definition_meaning_operations",
    },
    "reference_only": {"binding", "reference_target", "reference_context"},
}


def is_zero_operand_carry(raw):
    """Observe only structural absence; do not infer qualification or meaning.

    Supplied Claim and nonempty meaning carriers remain outside this partial
    implementation. Their typed readers cannot be replaced by kind-key scans.
    Missing descriptor definitions are carried from the original fn1 result.
    """
    for member in ("claims", "oracle_bindings", "values", "handoff_records"):
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
