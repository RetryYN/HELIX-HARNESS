"""Template applicability comparison (HARNESS-L5-009-compare_applicability / FN3)."""

import copy

from application_input_schema import _json_equal, _valid
from application_applicability_condition_evaluation import (
    _condition_binding_locally_qualified,
    _evaluate_condition_occurrence,
    _has_valid_non_applicable_basis,
    condition_meaning_lookup_miss_writer,
)
from application_applicability_na_records import (
    _build_row_condition_pairs,
    _build_row_na_attributes,
    _evaluate_na_records,
)
from application_applicability_ref_qualification import (
    _REF_FIELDS,
    _is_formed_ref,
    _record_qualification_info,
    _same_full_ref,
    _same_ref_ignoring_sha,
)


def compare_applicability(context):
    """Compare template applicability (HARNESS-L5-009-compare_applicability)."""
    validated = context["validated"]
    raw = validated.get("input")
    if not isinstance(raw, dict):
        return {
            "producer_symbol": "compare_applicability",
            "input_binding": {},
            "original_axes": [],
            "findings": [],
            "material": {
                "template_refs": [],
                "disposition": "unresolved",
                "original_condition_refs": [],
                "original_condition_values": [],
                "unfinished_obligation_refs": [],
                "na_candidate_records": [],
            },
        }

    binding = copy.deepcopy(raw.get("binding", {}))
    product_scope = binding.get("product_scope")
    req_ref = binding.get("requirement_ref")
    expected_revision = req_ref.get("revision") if isinstance(req_ref, dict) else None
    unusable_source_refs = validated.get("unusable_source_refs", [])

    has_policies_array = "application_policies" in raw and isinstance(
        raw["application_policies"], list
    )
    policies = raw["application_policies"] if has_policies_array else []

    policy_template_refs = [
        p.get("template_ref")
        for p in policies
        if isinstance(p, dict) and isinstance(p.get("template_ref"), dict)
    ]
    na_findings, valid_na_records = _evaluate_na_records(
        raw,
        policy_template_refs,
        unusable_source_refs,
        binding,
        product_scope,
        expected_revision,
    )

    findings = list(na_findings)
    lookup_miss_findings = []
    template_refs = []
    original_condition_refs = []
    original_condition_values = []
    unfinished_obligation_refs = []
    na_candidate_records = []
    policy_decisions = []
    source_projection_rows = []

    raw_conditions = raw.get("conditions")
    raw_na_records = raw.get("na_records")
    any_unknown_condition = False
    any_conditional_unfulfilled = False

    for policy_idx, policy in enumerate(policies):
        if not isinstance(policy, dict):
            continue
        t_ref = policy.get("template_ref")
        if isinstance(t_ref, dict) and not any(
            _same_full_ref(t_ref, existing) for existing in template_refs
        ):
            template_refs.append(copy.deepcopy(t_ref))

        for obl_ref in policy.get("obligation_refs", []) or []:
            if isinstance(obl_ref, dict) and not any(
                _same_full_ref(obl_ref, existing)
                for existing in unfinished_obligation_refs
            ):
                unfinished_obligation_refs.append(copy.deepcopy(obl_ref))

        cond_refs = policy.get("condition_refs")
        cond_states = []
        if isinstance(cond_refs, list):
            for cond_ref in cond_refs:
                if isinstance(cond_ref, dict):
                    original_condition_refs.append(copy.deepcopy(cond_ref))
                state, sem_val = _evaluate_condition_occurrence(
                    raw,
                    policy,
                    cond_ref,
                    unusable_source_refs,
                    binding,
                    product_scope,
                    expected_revision,
                )
                cond_states.append(state)
                if state in ("true", "false", "unknown") and (
                    isinstance(sem_val, bool)
                    or (
                        state == "unknown"
                        and "semantic_comparison_ref"
                        in (
                            next(
                                (
                                    cb
                                    for cb in (raw_conditions or [])
                                    if isinstance(cb, dict)
                                    and _same_full_ref(cb.get("ref"), cond_ref)
                                ),
                                {},
                            )
                        )
                        and (
                            next(
                                (
                                    cb
                                    for cb in (raw_conditions or [])
                                    if isinstance(cb, dict)
                                    and _same_full_ref(cb.get("ref"), cond_ref)
                                ),
                                {},
                            ).get("semantic_comparison_ref")
                            is not None
                        )
                    )
                ):
                    original_condition_values.append(sem_val)

                lookup_miss_findings.extend(
                    condition_meaning_lookup_miss_writer(
                        raw,
                        policy,
                        cond_ref,
                        unusable_source_refs,
                    )
                )

        requiredness = policy.get("requiredness")
        policy_valid_nas = [
            na
            for na in valid_na_records
            if _same_full_ref(na.get("template_ref"), t_ref)
            and _json_equal(na.get("binding"), policy.get("binding"))
        ]
        if (
            isinstance(cond_refs, list)
            and len(cond_refs) > 0
            and all(s == "true" for s in cond_states)
        ):
            if requiredness == "required":
                policy_disp = "required"
            elif requiredness == "conditional":
                policy_disp = "conditional"
            else:
                policy_disp = "unresolved"
        elif (
            isinstance(cond_refs, list)
            and len(cond_refs) > 0
            and all(s in ("true", "false") for s in cond_states)
            and any(s == "false" for s in cond_states)
        ):
            if (
                _has_valid_non_applicable_basis(
                    raw,
                    policy,
                    unusable_source_refs,
                    binding,
                    product_scope,
                    expected_revision,
                )
                and len(policy_valid_nas) == 1
            ):
                policy_disp = "na"
                na_candidate_records.append(copy.deepcopy(policy_valid_nas[0]))
            elif requiredness == "conditional":
                policy_disp = "conditional"
                any_conditional_unfulfilled = True
            else:
                policy_disp = "unresolved"
        else:
            policy_disp = "unresolved"
            if any(s in ("unknown", "unresolved") for s in cond_states):
                any_unknown_condition = True

        policy_decisions.append(
            {
                "policy_occurrence_index": policy_idx,
                "policy_ref": copy.deepcopy(policy.get("ref")),
                "disposition": policy_disp,
            }
        )

        row = {}
        if "ref" in policy:
            row["application_policy_ref"] = copy.deepcopy(policy["ref"])
        if "template_ref" in policy:
            row["template_ref"] = copy.deepcopy(policy["template_ref"])
        if "binding" in policy:
            row["binding"] = copy.deepcopy(policy["binding"])
        row["disposition"] = policy_disp
        cp_present, cp_val = _build_row_condition_pairs(policy, raw_conditions)
        if cp_present:
            row["condition_pairs"] = cp_val
        if "obligation_refs" in policy:
            row["obligation_refs"] = copy.deepcopy(policy["obligation_refs"])
        na_present, na_val = _build_row_na_attributes(policy, raw_na_records)
        if na_present:
            row["na_attributes"] = na_val
        source_projection_rows.append(row)

    claims = raw.get("claims")
    if isinstance(claims, list):
        for claim in claims:
            if not isinstance(claim, dict):
                continue
            kind = claim.get("kind")
            if (
                kind in ("template_na", "na", "not_applicable", "template-na")
                and any_unknown_condition
            ):
                c_refs = []
                if isinstance(claim.get("ref"), dict):
                    c_refs.append(copy.deepcopy(claim["ref"]))
                for b_ref in claim.get("basis_refs", []) or []:
                    if isinstance(b_ref, dict):
                        c_refs.append(copy.deepcopy(b_ref))
                for p in policies:
                    if isinstance(p, dict) and isinstance(p.get("ref"), dict):
                        c_refs.append(copy.deepcopy(p["ref"]))
                findings.append(
                    {
                        "code": "unknown_as_na",
                        "rule_ref": "HARNESS-L5-009-R-unknown_as_na",
                        "subject_ref": copy.deepcopy(
                            claim.get("subject_ref") or binding.get("template_ref")
                        ),
                        "binding": copy.deepcopy(binding),
                        "axis": "applicability",
                        "state": "unknown",
                        "source_refs": c_refs,
                        "reason": "Unknown or unresolved condition meaning cannot be converted into template N/A.",
                        "backflow_owner": "core_owner",
                    }
                )
            elif (
                kind
                in (
                    "conditional-obligation-completed",
                    "obligation_discharged",
                    "obligation-discharged",
                    "conditional_obligation_completed",
                )
                and any_conditional_unfulfilled
            ):
                c_refs = []
                if isinstance(claim.get("ref"), dict):
                    c_refs.append(copy.deepcopy(claim["ref"]))
                for b_ref in claim.get("basis_refs", []) or []:
                    if isinstance(b_ref, dict):
                        c_refs.append(copy.deepcopy(b_ref))
                for p in policies:
                    if isinstance(p, dict) and isinstance(p.get("ref"), dict):
                        c_refs.append(copy.deepcopy(p["ref"]))
                findings.append(
                    {
                        "code": "conditional_unfulfilled_closed",
                        "rule_ref": "HARNESS-L5-009-R-conditional_unfulfilled_closed",
                        "subject_ref": copy.deepcopy(
                            claim.get("subject_ref") or binding.get("template_ref")
                        ),
                        "binding": copy.deepcopy(binding),
                        "axis": "condition",
                        "state": "unknown",
                        "source_refs": c_refs,
                        "reason": "Conditional obligation with unfulfilled condition cannot be closed or discharged.",
                        "backflow_owner": "core_owner",
                    }
                )

    findings.extend(lookup_miss_findings)

    if not policy_decisions:
        agg_disposition = "unresolved"
    else:
        disps = [d["disposition"] for d in policy_decisions]
        if "unresolved" in disps:
            agg_disposition = "unresolved"
        elif len(set(disps)) == 1:
            agg_disposition = disps[0]
        elif "conditional" in disps:
            agg_disposition = "conditional"
        else:
            agg_disposition = "required"

    material = {
        "template_refs": template_refs,
        "disposition": agg_disposition,
        "original_condition_refs": original_condition_refs,
        "original_condition_values": original_condition_values,
        "unfinished_obligation_refs": unfinished_obligation_refs,
        "na_candidate_records": na_candidate_records,
    }
    if has_policies_array:
        material["policy_decisions"] = policy_decisions
        material["source_projection_rows"] = source_projection_rows

    return {
        "producer_symbol": "compare_applicability",
        "input_binding": binding,
        "original_axes": [],
        "findings": findings,
        "material": material,
    }
