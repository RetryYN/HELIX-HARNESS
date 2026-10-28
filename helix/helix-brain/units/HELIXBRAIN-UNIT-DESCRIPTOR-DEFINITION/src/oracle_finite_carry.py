"""L4 nonfire_read_planの対象意味operandがない有限枝。"""

from __future__ import annotations


_TARGET_KINDS = {"measurement", "completion", "negative oracle"}
_SOURCE_KEYS = {
    "semantic_json": {
        "binding",
        "descriptor_facts",
        "descriptor_targets",
        "definition_meaning_operations",
    },
    "reference_only": {"binding", "reference_target", "reference_context"},
}
_OTHER_PRODUCER_CLAIM_KINDS = {
    "absolute_product_choice",
    "design_completion",
    "no_gaps",
    "os_obligation_discharge",
    "product_template_adoption",
    "requirements_agreement",
    "return_definition_known",
    "return_field_applicable",
    "return_received",
    "return_source_observed",
    "return_value_supplied",
    "same_template_identity",
    "project_obligation_discharge",
    "field_not_applicable",
    "definition_missing_from_receipt",
    "upstream_authority",
    "require_before_supply",
    "labo_evaluated",
}
_CLOSED_CLAIM_FIELDS = {
    "subject_ref",
    "binding",
    "actor",
    "kind",
    "proposed_value",
    "basis_refs",
}


def _valid_other_producer_claim(claim, binding):
    from descriptor_definitions import _binding_same, _ref_same

    return (
        isinstance(claim, dict)
        and set(claim) <= _CLOSED_CLAIM_FIELDS
        and "proposed_value" in claim
        and isinstance(claim.get("basis_refs"), list)
        and _ref_same(claim.get("subject_ref"), claim.get("subject_ref"))
        and _binding_same(claim.get("binding"), binding)
    )


def is_zero_operand_carry(raw, target_reads=None):
    """Observe only structural absence; do not infer qualification or meaning.

    Supplied Claims in the finite carry branch are either eligible fill_definition
    claims (explicit null or resolved non-target address) or closed other-producer
    claims from L4 claim_dispatch/3 (which form no FN4 Claim operand and consume
    no target_read). Nonempty meaning carriers remain outside this partial
    implementation. Missing descriptor definitions are carried from original fn1.
    """
    from descriptor_definitions import _APPROVED_KINDS
    from supply_validation import _json_equal

    claims = raw.get("claims", [])
    if not isinstance(claims, list):
        return False
    binding = raw.get("binding")
    if claims:
        if not isinstance(target_reads, list):
            return False
        fill_claims = []
        for index, claim in enumerate(claims):
            if not isinstance(claim, dict):
                return False
            kind = claim.get("kind")
            if kind == "fill_definition":
                if "proposed_value" not in claim:
                    return False
                fill_claims.append((index, claim))
            elif kind in _OTHER_PRODUCER_CLAIM_KINDS:
                if not _valid_other_producer_claim(claim, binding):
                    return False
            else:
                return False
        if len(target_reads) != len(fill_claims):
            return False
        for (index, claim), target_read in zip(fill_claims, target_reads):
            if (
                not isinstance(target_read, dict)
                or target_read.get("claim_locator") != f"/claims/{index}"
                or not _json_equal(target_read.get("claim"), claim)
            ):
                return False
            if claim["proposed_value"] is not None:
                matches = target_read.get("matches")
                if (
                    target_read.get("state") != "resolved"
                    or not isinstance(matches, list)
                    or not matches
                    or any(
                        not isinstance(match, dict)
                        or not isinstance(match.get("descriptor_kind"), str)
                        or match["descriptor_kind"] not in _APPROVED_KINDS
                        or match["descriptor_kind"] in _TARGET_KINDS
                        for match in matches
                    )
                ):
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
        if (
            not isinstance(content, dict)
            or not set(content) <= _SOURCE_KEYS[source["role"]]
        ):
            return False
        if source["role"] == "semantic_json":
            for carrier in ("descriptor_facts", "definition_meaning_operations"):
                if carrier in content and content[carrier] != []:
                    return False
    return True
