"""H009 L5#/functions/5: compare_requirement_gaps."""

import copy

from application_input_schema import _json_equal


def _same_ref_ignoring_sha(left, right):
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    return (
        left.get("identity") == right.get("identity")
        and left.get("revision") == right.get("revision")
        and _json_equal(left.get("scope"), right.get("scope"))
        and left.get("owner") == right.get("owner")
    )


def _is_source_unusable(source_ref, unusable_refs):
    if not isinstance(source_ref, dict):
        return True
    for u_ref in unusable_refs:
        if _same_ref_ignoring_sha(source_ref, u_ref):
            return True
    return False


def _find_qualified_semantic_records(raw, target_refs, unusable_refs, binding):
    if not isinstance(target_refs, list) or not target_refs:
        return []
    sem_records = raw.get("semantic_records")
    if not isinstance(sem_records, list):
        return []
    expected_scope = binding.get("product_scope")
    expected_rev = (binding.get("requirement_ref") or {}).get("revision")
    matched = []
    for t_ref in target_refs:
        if not isinstance(t_ref, dict):
            continue
        for sr in sem_records:
            if not isinstance(sr, dict):
                continue
            sr_ref = sr.get("ref")
            if not _same_ref_ignoring_sha(sr_ref, t_ref):
                continue
            if not _json_equal(sr_ref.get("scope"), expected_scope):
                continue
            if sr_ref.get("revision") != expected_rev:
                continue
            if _is_source_unusable(sr.get("source_ref"), unusable_refs):
                continue
            matched.append(sr)
    return matched


def _evaluate_field_input(field, raw, unusable_refs, binding):
    field_ref = copy.deepcopy(field.get("ref") or {})
    field_binding = copy.deepcopy(field.get("binding") or binding)
    def_refs = field.get("definition_refs")
    val_refs = field.get("value_fact_refs")

    # 1. Evaluate field.definition axis
    if def_refs is None or (isinstance(def_refs, list) and len(def_refs) == 0):
        def_state = "missing"
        def_orig_refs = []
        def_reason = (
            "Field definition reference is missing; route definition gap to BRAIN."
        )
        def_owner = "brain_owner"
    else:
        def_records = _find_qualified_semantic_records(
            raw, def_refs, unusable_refs, binding
        )
        def_orig_refs = copy.deepcopy(def_refs)
        if not def_records:
            def_state = "unknown"
            def_reason = "Field definition semantic record is unresolved."
            def_owner = "brain_owner"
        else:
            meanings = []
            for sr in def_records:
                m = sr.get("meaning")
                if (
                    isinstance(m, dict)
                    and isinstance(m.get("meaning"), str)
                    and m["meaning"]
                ):
                    meanings.append(m["meaning"])
            if not meanings:
                def_state = "missing"
                def_reason = "Field definition meaning is missing."
                def_owner = "brain_owner"
            elif len(set(meanings)) > 1:
                def_state = "conflict"
                def_reason = "Conflicting field definition meanings."
                def_owner = "brain_owner"
            else:
                def_state = "known"
                def_reason = meanings[0]
                def_owner = None

    # 2. Evaluate field.value axis
    if val_refs is None or (isinstance(val_refs, list) and len(val_refs) == 0):
        val_state = "unknown"
        val_orig_refs = []
        val_reason = "Project field value reference is not supplied; route value gap to HARNESS008."
        val_owner = "requirement_008_owner"
    else:
        val_records = _find_qualified_semantic_records(
            raw, val_refs, unusable_refs, binding
        )
        val_orig_refs = copy.deepcopy(val_refs)
        if not val_records:
            val_state = "unknown"
            val_reason = "Project field value semantic record is unresolved."
            val_owner = "requirement_008_owner"
        else:
            values = []
            null_reasons = []
            for sr in val_records:
                m = sr.get("meaning")
                if isinstance(m, dict):
                    if m.get("value") is not None:
                        values.append(m["value"])
                    elif isinstance(m.get("reason"), str) and m["reason"]:
                        null_reasons.append(m["reason"])
            if values:
                val_state = "known"
                val_reason = str(values[0])
                val_owner = None
            else:
                val_state = "unknown"
                val_reason = (
                    null_reasons[0]
                    if null_reasons
                    else "Project field value is unknown."
                )
                val_owner = "requirement_008_owner"

    field_check = {
        "field_ref": field_ref,
        "definition_refs": copy.deepcopy(def_refs),
        "value_refs": copy.deepcopy(val_refs),
        "definition_state": def_state,
        "value_state": val_state,
    }
    def_axis = {
        "subject_ref": copy.deepcopy(field_ref),
        "binding": copy.deepcopy(field_binding),
        "axis": "field.definition",
        "state": def_state,
        "original_refs": def_orig_refs,
        "reason": def_reason,
        "backflow_owner": def_owner,
    }
    val_axis = {
        "subject_ref": copy.deepcopy(field_ref),
        "binding": copy.deepcopy(field_binding),
        "axis": "field.value",
        "state": val_state,
        "original_refs": val_orig_refs,
        "reason": val_reason,
        "backflow_owner": val_owner,
    }
    return field_check, [def_axis, val_axis]


def _verify_gap_proposal_kind(proposal, raw, unusable_refs, binding):
    proposed_kind = proposal.get("kind")
    if proposed_kind not in (
        "question",
        "contradiction",
        "derived_requirement_candidate",
        "na_candidate",
    ):
        return "unresolved"

    source_refs = proposal.get("source_refs")
    if not isinstance(source_refs, list) or not source_refs:
        return "unresolved"

    records = _find_qualified_semantic_records(raw, source_refs, unusable_refs, binding)
    if not records:
        return "unresolved"

    subject_id = (proposal.get("subject_ref") or {}).get("identity")
    expected_rev = (binding.get("requirement_ref") or {}).get("revision")

    for sr in records:
        m = sr.get("meaning")
        if not isinstance(m, dict):
            continue
        if proposed_kind == "question":
            if (
                m.get("field") == subject_id
                and "observed_project_value" in m
                and m.get("observed_project_value") is None
                and isinstance(m.get("request"), str)
                and bool(m["request"])
            ):
                return "question"
        elif proposed_kind == "contradiction":
            if (
                isinstance(m.get("original_A"), str)
                and bool(m["original_A"])
                and isinstance(m.get("original_B"), str)
                and bool(m["original_B"])
                and m["original_A"] != m["original_B"]
                and m.get("unresolved") is True
            ):
                return "contradiction"
        elif proposed_kind == "derived_requirement_candidate":
            if (
                isinstance(m.get("original_constraint"), str)
                and bool(m["original_constraint"])
                and isinstance(m.get("proposed_requirement"), str)
                and bool(m["proposed_requirement"])
                and m.get("adopted") is False
            ):
                return "derived_requirement_candidate"
        elif proposed_kind == "na_candidate":
            if (
                isinstance(m.get("non_applicable_basis"), str)
                and bool(m["non_applicable_basis"])
                and isinstance(m.get("reason"), str)
                and bool(m["reason"])
                and isinstance(m.get("decider"), str)
                and bool(m["decider"])
                and m.get("target_revision") == expected_rev
                and isinstance(m.get("reentry_condition"), str)
                and bool(m["reentry_condition"])
                and m.get("accepted") is False
            ):
                return "na_candidate"

    return "unresolved"


def _is_knowledge_or_definition_gap(proposal, field_checks, raw, binding):
    k_ref = binding.get("knowledge_ref") if isinstance(binding, dict) else None
    brain_owner = k_ref.get("owner") if isinstance(k_ref, dict) else None
    knowledge_or_def_refs = []
    if isinstance(k_ref, dict):
        knowledge_or_def_refs.append(k_ref)
    for fi in raw.get("field_inputs") or []:
        if isinstance(fi, dict):
            for dr in fi.get("definition_refs") or []:
                if isinstance(dr, dict):
                    knowledge_or_def_refs.append(dr)
    for ku in raw.get("knowledge_uses") or []:
        if isinstance(ku, dict):
            if isinstance(ku.get("knowledge_ref"), dict):
                knowledge_or_def_refs.append(ku["knowledge_ref"])
            if isinstance(ku.get("ref"), dict):
                knowledge_or_def_refs.append(ku["ref"])
    for fc in field_checks:
        if (
            isinstance(fc, dict)
            and fc.get("definition_state") != "known"
            and isinstance(fc.get("field_ref"), dict)
        ):
            knowledge_or_def_refs.append(fc["field_ref"])

    subj = proposal.get("subject_ref")
    if isinstance(subj, dict):
        if (brain_owner and subj.get("owner") == brain_owner) or any(
            _same_ref_ignoring_sha(subj, kr) for kr in knowledge_or_def_refs
        ):
            return True
    for sr in proposal.get("source_refs") or []:
        if isinstance(sr, dict):
            if (brain_owner and sr.get("owner") == brain_owner) or any(
                _same_ref_ignoring_sha(sr, kr) for kr in knowledge_or_def_refs
            ):
                return True
    return False


def compare_requirement_gaps(context):
    """Compare field definition/value gaps and 4 gap candidate classifications."""
    empty_material = {
        "field_checks": [],
        "candidate_proposals": [],
        "unfinished_obligation_refs": [],
    }
    if not isinstance(context, dict):
        return {
            "producer_symbol": "compare_requirement_gaps",
            "input_binding": {},
            "original_axes": [],
            "findings": [],
            "material": copy.deepcopy(empty_material),
        }

    validated = context.get("validated")
    if not isinstance(validated, dict):
        return {
            "producer_symbol": "compare_requirement_gaps",
            "input_binding": {},
            "original_axes": [],
            "findings": [],
            "material": copy.deepcopy(empty_material),
        }

    raw = validated.get("input")
    if not isinstance(raw, dict):
        return {
            "producer_symbol": "compare_requirement_gaps",
            "input_binding": {},
            "original_axes": [],
            "findings": [],
            "material": copy.deepcopy(empty_material),
        }

    binding = copy.deepcopy(raw.get("binding") or {})
    app_comp = context.get("compare_applicability")
    trace_comp = context.get("compare_kind_obligation_trace")
    if (
        not isinstance(app_comp, dict)
        or app_comp.get("producer_symbol") != "compare_applicability"
        or not _json_equal(app_comp.get("input_binding"), binding)
        or not isinstance(trace_comp, dict)
        or trace_comp.get("producer_symbol") != "compare_kind_obligation_trace"
        or not _json_equal(trace_comp.get("input_binding"), binding)
    ):
        return {
            "producer_symbol": "compare_requirement_gaps",
            "input_binding": binding,
            "original_axes": [],
            "findings": [],
            "material": copy.deepcopy(empty_material),
        }

    unusable_refs = validated.get("unusable_source_refs") or []
    field_checks = []
    original_axes = []
    findings = []

    for field in raw.get("field_inputs") or []:
        if not isinstance(field, dict):
            continue
        fc, axes = _evaluate_field_input(field, raw, unusable_refs, binding)
        field_checks.append(fc)
        original_axes.extend(axes)

    candidate_proposals = []
    unfinished_obligation_refs = []

    for prop in raw.get("gap_proposals") or []:
        if not isinstance(prop, dict):
            continue
        prop_copy = copy.deepcopy(prop)
        source_refs = prop.get("source_refs")
        unfinished_refs = prop.get("unfinished_obligation_refs")

        for u_ref in unfinished_refs or []:
            if isinstance(u_ref, dict) and not any(
                _same_ref_ignoring_sha(u_ref, existing)
                for existing in unfinished_obligation_refs
            ):
                unfinished_obligation_refs.append(copy.deepcopy(u_ref))

        if (
            not isinstance(source_refs, list)
            or len(source_refs) == 0
            or not isinstance(unfinished_refs, list)
            or len(unfinished_refs) == 0
        ):
            prop_copy["kind"] = "unresolved"
            findings.append(
                {
                    "code": "oral_only_gap",
                    "rule_ref": "HARNESS-L5-009-R-oral_only_gap",
                    "subject_ref": copy.deepcopy(prop.get("ref") or {}),
                    "binding": copy.deepcopy(binding),
                    "axis": "gap.trace",
                    "state": "missing",
                    "source_refs": [
                        copy.deepcopy(r)
                        for r in (prop.get("ref"), prop.get("subject_ref"))
                        if isinstance(r, dict)
                    ],
                    "reason": (
                        "Gap proposal lacks source_refs or unfinished_obligation_refs trace; "
                        "oral return cannot establish Backflow input."
                    ),
                    "backflow_owner": "core_owner",
                }
            )
        else:
            prop_copy["kind"] = _verify_gap_proposal_kind(
                prop, raw, unusable_refs, binding
            )

        k_ref_owner = (binding.get("knowledge_ref") or {}).get("owner")
        expected_brain_owners = {"BRAIN", "brain_owner"}
        if isinstance(k_ref_owner, str) and k_ref_owner:
            expected_brain_owners.add(k_ref_owner)
        if _is_knowledge_or_definition_gap(prop, field_checks, raw, binding):
            if prop.get("backflow_owner") not in expected_brain_owners:
                findings.append(
                    {
                        "code": "wrong_gap_owner",
                        "rule_ref": "HARNESS-L5-009-R-wrong_gap_owner",
                        "subject_ref": copy.deepcopy(prop.get("ref") or {}),
                        "binding": copy.deepcopy(binding),
                        "axis": "gap.owner",
                        "state": "conflict",
                        "source_refs": [
                            copy.deepcopy(prop.get("ref") or {}),
                            *[
                                copy.deepcopy(sr)
                                for sr in (source_refs or [])
                                if isinstance(sr, dict)
                            ],
                        ],
                        "reason": (
                            "Knowledge definition or revision gap must be returned to BRAIN "
                            "(brain_owner), not a product value owner."
                        ),
                        "backflow_owner": "brain_owner",
                    }
                )

        candidate_proposals.append(prop_copy)

    trace_mat = trace_comp.get("material")
    if isinstance(trace_mat, dict):
        for ob in trace_mat.get("obligations") or []:
            if isinstance(ob, dict) and isinstance(ob.get("ref"), dict):
                ob_ref = ob["ref"]
                if not any(
                    _same_ref_ignoring_sha(ob_ref, existing)
                    for existing in unfinished_obligation_refs
                ):
                    unfinished_obligation_refs.append(copy.deepcopy(ob_ref))

    t_ref = binding.get("template_ref") if isinstance(binding, dict) else {}
    if not isinstance(t_ref, dict):
        t_ref = {}
    other_template_refs = []
    for tmpl in raw.get("templates") or []:
        if isinstance(tmpl, dict) and isinstance(tmpl.get("ref"), dict):
            if not _same_ref_ignoring_sha(tmpl["ref"], t_ref):
                other_template_refs.append(tmpl["ref"])
    for univ in raw.get("universes") or []:
        if isinstance(univ, dict):
            for tr in (univ.get("members") or []) + (univ.get("template_refs") or []):
                if isinstance(tr, dict) and not _same_ref_ignoring_sha(tr, t_ref):
                    other_template_refs.append(tr)

    for claim in raw.get("claims") or []:
        if not isinstance(claim, dict):
            continue
        ckind = claim.get("kind")
        c_ref = claim.get("ref") or {}
        c_subj = claim.get("subject_ref") or {}
        c_basis = [
            copy.deepcopy(r)
            for r in (claim.get("basis_refs") or [])
            if isinstance(r, dict)
        ]

        if ckind == "value_only_gap":
            for fc in field_checks:
                if fc["definition_state"] == "missing":
                    findings.append(
                        {
                            "code": "definition_as_value_gap",
                            "rule_ref": "HARNESS-L5-009-R-definition_as_value_gap",
                            "subject_ref": copy.deepcopy(fc["field_ref"]),
                            "binding": copy.deepcopy(binding),
                            "axis": "field.definition",
                            "state": "missing",
                            "source_refs": [
                                copy.deepcopy(c_ref),
                                copy.deepcopy(fc["field_ref"]),
                            ],
                            "reason": (
                                "Missing field definition cannot be replaced by a project "
                                "value-only gap claim."
                            ),
                            "backflow_owner": "brain_owner",
                        }
                    )

        elif ckind == "definition_gap":
            for fc in field_checks:
                if fc["definition_state"] == "known" and fc["value_state"] == "unknown":
                    findings.append(
                        {
                            "code": "value_as_definition_gap",
                            "rule_ref": "HARNESS-L5-009-R-value_as_definition_gap",
                            "subject_ref": copy.deepcopy(fc["field_ref"]),
                            "binding": copy.deepcopy(binding),
                            "axis": "field.value",
                            "state": "unknown",
                            "source_refs": [
                                copy.deepcopy(c_ref),
                                copy.deepcopy(fc["field_ref"]),
                                *c_basis,
                            ],
                            "reason": (
                                "Known field definition with unknown project value cannot be "
                                "replaced by a knowledge definition gap claim."
                            ),
                            "backflow_owner": "requirement_008_owner",
                        }
                    )

        elif ckind in ("gap_resolved", "classification_complete"):
            foreign_template_basis = any(
                any(_same_ref_ignoring_sha(b, otr) for otr in other_template_refs)
                for b in c_basis
            )
            has_gaps = bool(candidate_proposals) or any(
                fc["definition_state"] != "known" or fc["value_state"] != "known"
                for fc in field_checks
            )
            if foreign_template_basis and has_gaps:
                findings.append(
                    {
                        "code": "other_template_compensation",
                        "rule_ref": "HARNESS-L5-009-R-other_template_compensation",
                        "subject_ref": copy.deepcopy(c_subj),
                        "binding": copy.deepcopy(binding),
                        "axis": "gap.coverage",
                        "state": "unknown",
                        "source_refs": [copy.deepcopy(c_ref), *c_basis],
                        "reason": (
                            "Unresolved requirement gaps on the target template cannot be "
                            "compensated by another template's local success."
                        ),
                        "backflow_owner": "core_owner",
                    }
                )
            elif any(cp.get("kind") == "unresolved" for cp in candidate_proposals):
                findings.append(
                    {
                        "code": "classification_fabricated",
                        "rule_ref": "HARNESS-L5-009-R-classification_fabricated",
                        "subject_ref": copy.deepcopy(c_subj),
                        "binding": copy.deepcopy(binding),
                        "axis": "gap.classification",
                        "state": "unknown",
                        "source_refs": [copy.deepcopy(c_ref), *c_basis],
                        "reason": (
                            "Unresolved gap classification cannot be closed by arbitrary "
                            "completion without qualified source evidence."
                        ),
                        "backflow_owner": "core_owner",
                    }
                )

        elif ckind == "requirements_agreement":
            derived_refs = []
            for cp in candidate_proposals:
                if (
                    isinstance(cp, dict)
                    and cp.get("kind") == "derived_requirement_candidate"
                ):
                    if isinstance(cp.get("ref"), dict):
                        derived_refs.append(cp["ref"])
                    for sr in cp.get("source_refs") or []:
                        if isinstance(sr, dict):
                            derived_refs.append(sr)
            is_derived_promotion = any(
                _same_ref_ignoring_sha(c_subj, dr) for dr in derived_refs
            ) or any(
                _same_ref_ignoring_sha(b, dr) for b in c_basis for dr in derived_refs
            )
            if is_derived_promotion:
                findings.append(
                    {
                        "code": "candidate_as_requirements_agreement",
                        "rule_ref": "HARNESS-L5-009-R-candidate_as_requirements_agreement",
                        "subject_ref": copy.deepcopy(c_subj),
                        "binding": copy.deepcopy(binding),
                        "axis": "requirements_agreement_claim",
                        "state": "conflict",
                        "source_refs": [copy.deepcopy(c_ref), *c_basis],
                        "reason": (
                            "Derived requirement candidate cannot be promoted to human "
                            "requirements agreement authority."
                        ),
                        "backflow_owner": "requirement_owner",
                    }
                )

    return {
        "producer_symbol": "compare_requirement_gaps",
        "input_binding": binding,
        "original_axes": original_axes,
        "findings": findings,
        "material": {
            "field_checks": field_checks,
            "candidate_proposals": candidate_proposals,
            "unfinished_obligation_refs": unfinished_obligation_refs,
        },
    }


compare_requirement_gaps_detail = compare_requirement_gaps
