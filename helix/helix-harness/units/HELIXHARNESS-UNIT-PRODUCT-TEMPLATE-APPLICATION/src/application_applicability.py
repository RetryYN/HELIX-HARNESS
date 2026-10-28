"""Template applicability comparison (HARNESS-L5-009-compare_applicability / FN3)."""

import copy

from application_input_schema import _json_equal, _valid

_REF_FIELDS = (
    "identity",
    "revision",
    "scope",
    "owner",
    "source_locator",
    "sha256",
)


def _same_full_ref(left, right):
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    return all(_json_equal(left.get(field), right.get(field)) for field in _REF_FIELDS)


def _same_ref_ignoring_sha(left, right):
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    for field in ("identity", "revision", "scope", "owner", "source_locator"):
        if not _json_equal(left.get(field), right.get(field)):
            return False
    left_sha = left.get("sha256")
    right_sha = right.get("sha256")
    if left_sha is not None and right_sha is not None:
        return left_sha == right_sha
    return True


def _is_formed_ref(ref):
    if not isinstance(ref, dict):
        return False
    if set(ref.keys()) != set(_REF_FIELDS):
        return False
    if not _valid(ref, "Ref"):
        return False
    if not isinstance(ref.get("identity"), str) or not ref["identity"]:
        return False
    if not isinstance(ref.get("revision"), str) or not ref["revision"]:
        return False
    if not isinstance(ref.get("owner"), str) or not ref["owner"]:
        return False
    return isinstance(ref.get("scope"), dict)


def _record_qualification_info(
    raw,
    collection,
    record,
    unusable_source_refs,
    product_scope,
    expected_revision,
):
    if not isinstance(record, dict):
        return False, []
    source_ref = record.get("source_ref")
    if not _is_formed_ref(source_ref):
        return False, []
    if not _json_equal(source_ref.get("scope"), product_scope):
        return False, []
    if source_ref.get("revision") != expected_revision:
        return False, []
    if any(_same_ref_ignoring_sha(source_ref, u) for u in unusable_source_refs):
        return False, []

    sources = raw.get("sources")
    qualifications = raw.get("qualifications")
    roots = raw.get("qualification_roots")
    if (
        not isinstance(sources, list)
        or not isinstance(qualifications, list)
        or not isinstance(roots, list)
    ):
        return False, []

    expected_payload = {k: v for k, v in record.items() if k != "source_ref"}
    observed_refs = []
    qualified = False

    for source in sources:
        if not isinstance(source, dict):
            continue
        s_ref = source.get("ref")
        if not _same_ref_ignoring_sha(s_ref, source_ref):
            continue
        if any(_same_full_ref(s_ref, u) for u in unusable_source_refs):
            continue
        body = source.get("body")
        if not isinstance(body, dict) or not isinstance(body.get("records"), list):
            continue
        has_record = any(
            isinstance(entry, dict)
            and entry.get("collection") == collection
            and _same_full_ref(entry.get("ref"), record.get("ref"))
            and _json_equal(entry.get("payload"), expected_payload)
            for entry in body["records"]
        )
        if not has_record:
            continue
        q_ref = source.get("qualification_ref")
        if not _is_formed_ref(q_ref):
            continue
        for qual in qualifications:
            if not isinstance(qual, dict):
                continue
            if not _same_full_ref(qual.get("ref"), q_ref):
                continue
            if not _json_equal(qual.get("scope"), product_scope):
                continue
            if qual.get("owner") != source_ref.get("owner"):
                continue
            if qual.get("subject_sha256") != s_ref.get("sha256"):
                continue
            root_ref = qual.get("root_ref")
            if not _is_formed_ref(root_ref):
                continue
            for root in roots:
                if not isinstance(root, dict):
                    continue
                if not _same_full_ref(root, root_ref):
                    continue
                if not _json_equal(root.get("scope"), product_scope):
                    continue
                if root.get("owner") != qual.get("owner"):
                    continue
                observed_refs.append(copy.deepcopy(qual["ref"]))
                observed_refs.append(copy.deepcopy(root))
                qualified = True

    return qualified, observed_refs


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
