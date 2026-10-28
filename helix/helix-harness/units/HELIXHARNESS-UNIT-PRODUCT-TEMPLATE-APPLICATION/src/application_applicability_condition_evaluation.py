"""Qualified condition evaluation and condition finding writers for FN3."""

import copy

from application_applicability_ref_qualification import (
    _is_formed_ref,
    _json_equal,
    _record_qualification_info,
    _same_full_ref,
    _same_ref_ignoring_sha,
)


def _condition_binding_locally_qualified(
    raw,
    policy,
    cb,
    unusable_source_refs,
    binding,
    product_scope,
    expected_revision,
):
    if not isinstance(cb, dict) or not _is_formed_ref(cb.get("ref")):
        return False, []
    if not _same_full_ref(cb.get("template_ref"), policy.get("template_ref")):
        return False, []
    if not _json_equal(policy.get("binding"), binding):
        return False, []
    if not _json_equal(cb["ref"].get("scope"), product_scope):
        return False, []
    if cb["ref"].get("revision") != expected_revision:
        return False, []

    af_ref = cb.get("axis_fact_ref")
    dm_ref = cb.get("declared_meaning_ref")
    if not _is_formed_ref(af_ref) or not _is_formed_ref(dm_ref):
        return False, []

    axis_facts = raw.get("axis_facts")
    semantic_records = raw.get("semantic_records")
    if not isinstance(axis_facts, list) or not isinstance(semantic_records, list):
        return False, []

    matching_afs = [
        af
        for af in axis_facts
        if isinstance(af, dict) and _same_full_ref(af.get("ref"), af_ref)
    ]
    if len(matching_afs) != 1:
        return False, []
    af = matching_afs[0]
    if not _json_equal(af.get("binding"), binding):
        return False, []
    af_qual, _ = _record_qualification_info(
        raw,
        "axis_facts",
        af,
        unusable_source_refs,
        product_scope,
        expected_revision,
    )
    if not af_qual:
        return False, []

    matching_srs = [
        sr
        for sr in semantic_records
        if isinstance(sr, dict) and _same_full_ref(sr.get("ref"), dm_ref)
    ]
    if len(matching_srs) != 1:
        return False, []
    sr = matching_srs[0]
    if not _json_equal(sr.get("binding"), binding):
        return False, []
    sr_qual, _ = _record_qualification_info(
        raw,
        "semantic_records",
        sr,
        unusable_source_refs,
        product_scope,
        expected_revision,
    )
    if not sr_qual:
        return False, []

    return _record_qualification_info(
        raw,
        "conditions",
        cb,
        unusable_source_refs,
        product_scope,
        expected_revision,
    )


def condition_meaning_lookup_miss_writer(
    raw,
    policy,
    cond_ref,
    unusable_source_refs,
):
    """Private writer for HARNESS-L5-009-R-condition_meaning_unresolved."""
    if not isinstance(raw, dict) or not isinstance(policy, dict):
        return []
    binding = raw.get("binding")
    if not isinstance(binding, dict):
        return []
    product_scope = binding.get("product_scope")
    req_ref = binding.get("requirement_ref")
    expected_revision = req_ref.get("revision") if isinstance(req_ref, dict) else None

    if not _is_formed_ref(cond_ref):
        return []
    conditions = raw.get("conditions")
    if not isinstance(conditions, list):
        return []
    matching_cbs = [
        cb
        for cb in conditions
        if isinstance(cb, dict) and _same_full_ref(cb.get("ref"), cond_ref)
    ]
    if len(matching_cbs) != 1:
        return []
    cb = matching_cbs[0]

    cb_qual, qual_root_refs = _condition_binding_locally_qualified(
        raw,
        policy,
        cb,
        unusable_source_refs,
        binding,
        product_scope,
        expected_revision,
    )
    if not cb_qual:
        return []

    if "semantic_comparison_ref" not in cb:
        return []
    sc_ref = cb["semantic_comparison_ref"]
    if sc_ref is None or not _is_formed_ref(sc_ref):
        return []
    if not _json_equal(sc_ref.get("scope"), product_scope):
        return []
    if sc_ref.get("revision") != expected_revision:
        return []

    semantic_comparisons = raw.get("semantic_comparisons")
    if not isinstance(semantic_comparisons, list):
        return []
    matching_scs = [
        sc
        for sc in semantic_comparisons
        if isinstance(sc, dict) and _same_full_ref(sc.get("ref"), sc_ref)
    ]
    if len(matching_scs) != 0:
        return []

    return [
        {
            "code": "condition_meaning_unresolved",
            "rule_ref": "HARNESS-L5-009-R-condition_meaning_unresolved",
            "subject_ref": copy.deepcopy(cb["ref"]),
            "binding": copy.deepcopy(binding),
            "axis": "condition",
            "state": "unknown",
            "source_refs": [
                copy.deepcopy(policy["ref"]),
                copy.deepcopy(cond_ref),
                copy.deepcopy(cb["source_ref"]),
                copy.deepcopy(sc_ref),
                *copy.deepcopy(qual_root_refs),
            ],
            "reason": "このcondition出現が要求するSemanticComparison Refは同一inputのsemantic_comparisonsに存在せず、比較意味を確定できない。",
            "backflow_owner": "core_owner",
        }
    ]


def _evaluate_condition_occurrence(
    raw,
    policy,
    cond_ref,
    unusable_source_refs,
    binding,
    product_scope,
    expected_revision,
):
    conditions = raw.get("conditions")
    if not isinstance(conditions, list) or not _is_formed_ref(cond_ref):
        return "unresolved", None
    matching_cbs = [
        cb
        for cb in conditions
        if isinstance(cb, dict) and _same_full_ref(cb.get("ref"), cond_ref)
    ]
    if len(matching_cbs) != 1:
        return "unresolved", None
    cb = matching_cbs[0]

    cb_qual, _ = _condition_binding_locally_qualified(
        raw,
        policy,
        cb,
        unusable_source_refs,
        binding,
        product_scope,
        expected_revision,
    )
    if not cb_qual:
        return "unresolved", None

    sc_ref = cb.get("semantic_comparison_ref")
    if sc_ref is None or not _is_formed_ref(sc_ref):
        return "unknown", None
    if (
        not _json_equal(sc_ref.get("scope"), product_scope)
        or sc_ref.get("revision") != expected_revision
    ):
        return "unresolved", None

    semantic_comparisons = raw.get("semantic_comparisons")
    if not isinstance(semantic_comparisons, list):
        return "unresolved", None
    matching_scs = [
        sc
        for sc in semantic_comparisons
        if isinstance(sc, dict) and _same_full_ref(sc.get("ref"), sc_ref)
    ]
    if len(matching_scs) != 1:
        return "unresolved", None
    sc = matching_scs[0]

    if not (
        _same_full_ref(sc.get("left_ref"), cb.get("axis_fact_ref"))
        and _same_full_ref(sc.get("right_ref"), cb.get("declared_meaning_ref"))
    ):
        return "unresolved", None

    sc_qual, _ = _record_qualification_info(
        raw,
        "semantic_comparisons",
        sc,
        unusable_source_refs,
        product_scope,
        expected_revision,
    )
    if not sc_qual:
        return "unresolved", None

    same_meaning = sc.get("same_meaning")
    if same_meaning is True:
        return "true", True
    if same_meaning is False:
        return "false", False
    if same_meaning is None:
        return "unknown", None
    return "unresolved", None


def _has_valid_non_applicable_basis(
    raw,
    policy,
    unusable_source_refs,
    binding,
    product_scope,
    expected_revision,
):
    basis_ref = policy.get("non_applicable_basis_ref")
    if not _is_formed_ref(basis_ref):
        return False
    semantic_records = raw.get("semantic_records")
    if not isinstance(semantic_records, list):
        return False
    matching_srs = [
        sr
        for sr in semantic_records
        if isinstance(sr, dict) and _same_full_ref(sr.get("ref"), basis_ref)
    ]
    if len(matching_srs) != 1:
        return False
    sr = matching_srs[0]
    if not _json_equal(sr.get("binding"), binding):
        return False
    sr_qual, _ = _record_qualification_info(
        raw,
        "semantic_records",
        sr,
        unusable_source_refs,
        product_scope,
        expected_revision,
    )
    return sr_qual
