"""N/A record validation and applicability row projection helpers for FN3."""

import copy

from application_input_schema import _json_equal
from application_applicability_ref_qualification import (
    _same_full_ref,
    _same_ref_ignoring_sha,
)


def _evaluate_na_records(
    raw,
    policy_template_refs,
    unusable_source_refs,
    binding,
    product_scope,
    expected_revision,
):
    findings = []
    valid_na_by_template = []
    na_records = raw.get("na_records")
    if not isinstance(na_records, list):
        return findings, valid_na_by_template

    for na in na_records:
        if not isinstance(na, dict):
            continue
        na_ref = na.get("ref")
        na_source_ref = na.get("source_ref")
        na_template_ref = na.get("template_ref")
        na_binding = na.get("binding")
        source_refs = []
        if isinstance(na_ref, dict):
            source_refs.append(copy.deepcopy(na_ref))
        if isinstance(na_source_ref, dict):
            source_refs.append(copy.deepcopy(na_source_ref))

        na_scope = (
            na_binding.get("product_scope") if isinstance(na_binding, dict) else None
        )
        if not _json_equal(na_scope, product_scope) or (
            isinstance(na_ref, dict)
            and not _json_equal(na_ref.get("scope"), product_scope)
        ):
            findings.append(
                {
                    "code": "na_scope_mismatch",
                    "rule_ref": "HARNESS-L5-009-R-na_scope_mismatch",
                    "subject_ref": copy.deepcopy(na_ref),
                    "binding": copy.deepcopy(binding),
                    "axis": "na.binding",
                    "state": "conflict",
                    "source_refs": source_refs,
                    "reason": "NARecord product_scope does not match target application binding product_scope.",
                    "backflow_owner": "core_owner",
                }
            )
            continue

        if not any(
            _same_full_ref(na_template_ref, t_ref) for t_ref in policy_template_refs
        ):
            cross_refs = [copy.deepcopy(na_ref)]
            if isinstance(na_template_ref, dict):
                cross_refs.append(copy.deepcopy(na_template_ref))
            if isinstance(na_source_ref, dict):
                cross_refs.append(copy.deepcopy(na_source_ref))
            findings.append(
                {
                    "code": "limited_na_cross_template",
                    "rule_ref": "HARNESS-L5-009-R-limited_na_cross_template",
                    "subject_ref": copy.deepcopy(na_ref),
                    "binding": copy.deepcopy(binding),
                    "axis": "na.binding",
                    "state": "conflict",
                    "source_refs": cross_refs,
                    "reason": "Limited context NARecord template_ref does not match target application template_ref.",
                    "backflow_owner": "core_owner",
                }
            )
            continue

        missing_attr = False
        reason_val = na.get("reason")
        if not isinstance(reason_val, str) or not reason_val.strip():
            findings.append(
                {
                    "code": "na_reason_missing",
                    "rule_ref": "HARNESS-L5-009-R-na_reason_missing",
                    "subject_ref": copy.deepcopy(na_template_ref),
                    "binding": copy.deepcopy(binding),
                    "axis": "na.reason",
                    "state": "missing",
                    "source_refs": copy.deepcopy(source_refs),
                    "reason": "NARecord is missing required non-empty reason attribute.",
                    "backflow_owner": "core_owner",
                }
            )
            missing_attr = True

        decider_val = na.get("decider")
        if not isinstance(decider_val, str) or not decider_val.strip():
            findings.append(
                {
                    "code": "na_decider_missing",
                    "rule_ref": "HARNESS-L5-009-R-na_decider_missing",
                    "subject_ref": copy.deepcopy(na_template_ref),
                    "binding": copy.deepcopy(binding),
                    "axis": "na.decider",
                    "state": "missing",
                    "source_refs": copy.deepcopy(source_refs),
                    "reason": "NARecord is missing required non-empty decider attribute.",
                    "backflow_owner": "core_owner",
                }
            )
            missing_attr = True

        rev_val = na.get("target_revision")
        if (
            not isinstance(rev_val, str)
            or not rev_val.strip()
            or rev_val != expected_revision
        ):
            findings.append(
                {
                    "code": "na_revision_missing",
                    "rule_ref": "HARNESS-L5-009-R-na_revision_missing",
                    "subject_ref": copy.deepcopy(na_template_ref),
                    "binding": copy.deepcopy(binding),
                    "axis": "na.revision",
                    "state": "missing",
                    "source_refs": copy.deepcopy(source_refs),
                    "reason": "NARecord is missing required target_revision matching target requirement revision.",
                    "backflow_owner": "core_owner",
                }
            )
            missing_attr = True

        reentry_val = na.get("reentry_condition")
        if reentry_val is None or (
            isinstance(reentry_val, str) and not reentry_val.strip()
        ):
            findings.append(
                {
                    "code": "na_reentry_missing",
                    "rule_ref": "HARNESS-L5-009-R-na_reentry_missing",
                    "subject_ref": copy.deepcopy(na_template_ref),
                    "binding": copy.deepcopy(binding),
                    "axis": "na.reentry_condition",
                    "state": "missing",
                    "source_refs": copy.deepcopy(source_refs),
                    "reason": "NARecord is missing required reentry_condition attribute.",
                    "backflow_owner": "core_owner",
                }
            )
            missing_attr = True

        if missing_attr:
            continue

        na_source_usable = not (
            isinstance(na_source_ref, dict)
            and any(
                _same_ref_ignoring_sha(na_source_ref, u) for u in unusable_source_refs
            )
        )
        if na_source_usable and _json_equal(na_binding, binding):
            valid_na_by_template.append(na)

    return findings, valid_na_by_template


def _build_row_condition_pairs(policy, raw_conditions):
    if "condition_refs" not in policy:
        return False, None
    cond_refs = policy["condition_refs"]
    if not isinstance(cond_refs, list):
        return False, None
    if len(cond_refs) == 0:
        return True, []
    if not isinstance(raw_conditions, list):
        return False, None
    pairs = []
    for cond_ref in cond_refs:
        matches = [
            cb
            for cb in raw_conditions
            if isinstance(cb, dict) and _same_full_ref(cb.get("ref"), cond_ref)
        ]
        if len(matches) != 1:
            return False, None
        cb = matches[0]
        pair = {"condition_ref": copy.deepcopy(cb["ref"])}
        if "condition_value" in cb:
            pair["condition_value"] = copy.deepcopy(cb["condition_value"])
        pairs.append(pair)
    return True, pairs


def _build_row_na_attributes(policy, raw_na_records):
    if not isinstance(raw_na_records, list):
        return False, None
    matches = [
        na
        for na in raw_na_records
        if isinstance(na, dict)
        and _same_full_ref(na.get("template_ref"), policy.get("template_ref"))
        and _json_equal(na.get("binding"), policy.get("binding"))
    ]
    if len(matches) == 1:
        return True, copy.deepcopy(matches[0])
    return False, None
