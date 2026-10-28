"""FN12 project_source_result_references implementation (HARNESS-L5-009-PROGRAM-SOURCE-RESULT-REFERENCE-PROJECTION)."""

import copy

from source_result_reference_support import (
    REQUIRED_AXES,
    SOURCE_COMPARISON_PAIRS,
    SOURCE_ENVELOPE_REQUIRED_MEMBERS_EXCEPT_RESULT_REF,
    build_result_row,
    compare_values_recursive,
    eval_selector_side,
    get_path,
    is_obj,
    presence_of,
)

_SLOT_CHECKS = (
    ("cand", "/source_envelope_ref", "/source_envelope_ref"),
    ("cand", "/qualification_claim/subject_ref", "/qualification_claim/subject_ref"),
    (
        "cand",
        "/row_binding/application_policy_ref",
        "/row_binding/application_policy_ref",
    ),
    ("cand", "/row_binding/template_ref", "/row_binding/template_ref"),
    ("app", "/input_ref", "/application_input/input_ref"),
    ("row", "/application_policy_ref", "/computed_row/application_policy_ref"),
    ("row", "/template_ref", "/computed_row/template_ref"),
    ("cand", "/row_binding/binding/template_ref", "/row_binding/binding/template_ref"),
    ("row", "/binding/template_ref", "/computed_row/binding/template_ref"),
)

_GROUP1_REFS = (
    ("cand", "/source_envelope_ref", "/source_envelope_ref"),
    ("cand", "/qualification_claim/subject_ref", "/qualification_claim/subject_ref"),
    (
        "cand",
        "/row_binding/application_policy_ref",
        "/row_binding/application_policy_ref",
    ),
    ("cand", "/row_binding/template_ref", "/row_binding/template_ref"),
    ("app", "/input_ref", "/application_input/input_ref"),
    ("row", "/application_policy_ref", "/computed_row/application_policy_ref"),
    ("row", "/template_ref", "/computed_row/template_ref"),
)

_GROUP2_REFS = (
    (
        "cand",
        "/row_binding/binding/requirement_ref",
        "/row_binding/binding/requirement_ref",
    ),
    (
        "cand",
        "/row_binding/binding/process_contract_ref",
        "/row_binding/binding/process_contract_ref",
    ),
    (
        "cand",
        "/row_binding/binding/application_contract_ref",
        "/row_binding/binding/application_contract_ref",
    ),
    ("cand", "/row_binding/binding/template_ref", "/row_binding/binding/template_ref"),
    ("app", "/binding/requirement_ref", "/application_input/binding/requirement_ref"),
    (
        "app",
        "/binding/process_contract_ref",
        "/application_input/binding/process_contract_ref",
    ),
    (
        "app",
        "/binding/application_contract_ref",
        "/application_input/binding/application_contract_ref",
    ),
    ("app", "/binding/template_ref", "/application_input/binding/template_ref"),
    ("row", "/binding/requirement_ref", "/computed_row/binding/requirement_ref"),
    (
        "row",
        "/binding/process_contract_ref",
        "/computed_row/binding/process_contract_ref",
    ),
    (
        "row",
        "/binding/application_contract_ref",
        "/computed_row/binding/application_contract_ref",
    ),
    ("row", "/binding/template_ref", "/computed_row/binding/template_ref"),
)


def _check_ref_axes(roots, ref_specs):
    missing = []
    for root_key, r_ptr, diag_r_ptr in ref_specs:
        ok_r, r_val = get_path(roots[root_key], r_ptr)
        if ok_r and is_obj(r_val):
            for ax in REQUIRED_AXES:
                if ax not in r_val or r_val[ax] is None:
                    missing.append(f"{diag_r_ptr}/{ax}")
    return missing


def _evaluate_candidate(computed_row, app_input, source_envelopes_input, candidates):
    cand = candidates[0]
    roots = {"cand": cand, "app": app_input, "row": computed_row}

    def _row(rel, reason, diff=(), miss=()):
        return build_result_row(
            computed_row, source_envelopes_input, candidates, rel, reason, diff, miss
        )

    missing_req_src = [
        member
        for member in SOURCE_ENVELOPE_REQUIRED_MEMBERS_EXCEPT_RESULT_REF
        if not get_path(cand, member)[0]
    ]
    if missing_req_src:
        return _row(
            "unresolved", "candidate_source_members_missing", (), missing_req_src
        )

    _, role_val = get_path(cand, "/role")
    if role_val != "semantic_source":
        return _row("unresolved", "source_role_not_semantic")

    has_res_ref, res_ref_val = get_path(cand, "/result_ref")
    if not has_res_ref:
        return _row("unresolved", "candidate_result_ref_missing", (), ["/result_ref"])
    if res_ref_val is None:
        return _row("unresolved", "candidate_result_ref_null", (), ["/result_ref"])
    if not is_obj(res_ref_val):
        return _row("unresolved", "candidate_result_ref_invalid_kind", ["/result_ref"])
    if "identity" not in res_ref_val:
        return _row(
            "unresolved",
            "candidate_result_ref_identity_absent",
            (),
            ["/result_ref/identity"],
        )
    if res_ref_val["identity"] is None:
        return _row(
            "unresolved",
            "candidate_result_ref_identity_null",
            (),
            ["/result_ref/identity"],
        )
    if not isinstance(res_ref_val["identity"], str):
        return _row(
            "unresolved",
            "candidate_result_ref_identity_invalid",
            ["/result_ref/identity"],
        )
    res_ref_missing_axes = [
        f"/result_ref/{ax}"
        for ax in ("revision", "scope", "owner")
        if ax not in res_ref_val or res_ref_val[ax] is None
    ]
    if res_ref_missing_axes:
        return _row(
            "unresolved", "candidate_relation_unresolved", (), res_ref_missing_axes
        )

    _, src_cp = get_path(cand, "/material/condition_pairs")
    has_cmp_cp, cmp_cp = get_path(computed_row, "/condition_pairs")
    non_array_cp_paths = []
    if not isinstance(src_cp, list):
        non_array_cp_paths.append("/material/condition_pairs")
    if has_cmp_cp and not isinstance(cmp_cp, list):
        non_array_cp_paths.append("/computed_row/condition_pairs")
    if non_array_cp_paths:
        return _row(
            "unresolved", "candidate_relation_unresolved", (), non_array_cp_paths
        )

    missing_slots = []
    for root_key, p_in, p_diag in _SLOT_CHECKS:
        ok_s, val_s = get_path(roots[root_key], p_in)
        if not ok_s or val_s is None or not is_obj(val_s):
            missing_slots.append(p_diag)
    s_list = src_cp if isinstance(src_cp, list) else []
    c_list = cmp_cp if (has_cmp_cp and isinstance(cmp_cp, list)) else []
    for idx in range(max(len(s_list), len(c_list))):
        if idx < len(s_list) and is_obj(s_list[idx]):
            if not is_obj(s_list[idx].get("condition_ref")):
                missing_slots.append(f"/material/condition_pairs/{idx}/condition_ref")
        if idx < len(c_list) and is_obj(c_list[idx]):
            if not is_obj(c_list[idx].get("condition_ref")):
                missing_slots.append(
                    f"/computed_row/condition_pairs/{idx}/condition_ref"
                )
    if missing_slots:
        return _row("unresolved", "candidate_relation_unresolved", (), missing_slots)

    op_binding_missing = []
    for root_key, b_ptr, diag_b_ptr in (
        ("app", "/binding", "/application_input/binding"),
        ("cand", "/row_binding/binding", "/row_binding/binding"),
        ("row", "/binding", "/computed_row/binding"),
    ):
        ok_b, b_val = get_path(roots[root_key], b_ptr)
        if not ok_b or b_val is None or not is_obj(b_val):
            op_binding_missing.append(diag_b_ptr)
            continue
        for m_name, m_kind in (
            ("requirement_ref", "object"),
            ("product_scope", "RawValue"),
            ("process_contract_ref", "object"),
            ("application_contract_ref", "object"),
        ):
            if m_name not in b_val or b_val[m_name] is None:
                op_binding_missing.append(f"{diag_b_ptr}/{m_name}")
            elif m_kind == "object" and not is_obj(b_val[m_name]):
                op_binding_missing.append(f"{diag_b_ptr}/{m_name}")
    if op_binding_missing:
        return _row(
            "unresolved", "candidate_source_members_missing", (), op_binding_missing
        )

    g1_missing = _check_ref_axes(roots, _GROUP1_REFS)
    for s_scalar in (
        "/qualification_claim/subject_revision",
        "/qualification_claim/subject_scope",
        "/qualification_claim/subject_owner",
    ):
        ok_sc, sc_val = get_path(cand, s_scalar)
        if not ok_sc or sc_val is None:
            g1_missing.append(s_scalar)
    if g1_missing:
        return _row("unresolved", "candidate_relation_unresolved", (), g1_missing)

    g2_missing = _check_ref_axes(roots, _GROUP2_REFS)
    if g2_missing:
        return _row("unresolved", "candidate_relation_unresolved", (), g2_missing)

    g3_missing = []
    for idx, item in enumerate(s_list):
        if is_obj(item) and is_obj(item.get("condition_ref")):
            for ax in REQUIRED_AXES:
                if ax not in item["condition_ref"] or item["condition_ref"][ax] is None:
                    g3_missing.append(
                        f"/material/condition_pairs/{idx}/condition_ref/{ax}"
                    )
    for idx, item in enumerate(c_list):
        if is_obj(item) and is_obj(item.get("condition_ref")):
            for ax in REQUIRED_AXES:
                if ax not in item["condition_ref"] or item["condition_ref"][ax] is None:
                    g3_missing.append(
                        f"/computed_row/condition_pairs/{idx}/condition_ref/{ax}"
                    )
    if g3_missing:
        return _row("unresolved", "candidate_relation_unresolved", (), g3_missing)

    if isinstance(src_cp, list) and has_cmp_cp and isinstance(cmp_cp, list):
        cp_member_missing = []
        for idx, item in enumerate(src_cp):
            if not is_obj(item):
                cp_member_missing.append(f"/material/condition_pairs/{idx}")
            elif "condition_value" not in item:
                cp_member_missing.append(
                    f"/material/condition_pairs/{idx}/condition_value"
                )
        for idx, item in enumerate(cmp_cp):
            if not is_obj(item):
                cp_member_missing.append(f"/computed_row/condition_pairs/{idx}")
            elif "condition_value" not in item:
                cp_member_missing.append(
                    f"/computed_row/condition_pairs/{idx}/condition_value"
                )
        if cp_member_missing:
            return _row(
                "unresolved", "candidate_source_members_missing", (), cp_member_missing
            )

    is_na = computed_row.get("disposition") == "na"
    if is_na:
        na_missing = []
        for root_key, na_ptr, diag_na_ptr in (
            ("cand", "/material/na_attributes", "/material/na_attributes"),
            ("row", "/na_attributes", "/computed_row/na_attributes"),
        ):
            ok_na, na_val = get_path(roots[root_key], na_ptr)
            if not ok_na or na_val is None or not is_obj(na_val):
                na_missing.append(diag_na_ptr)
            else:
                for attr in (
                    "reason",
                    "decider",
                    "target_revision",
                    "reentry_condition",
                ):
                    if attr not in na_val or na_val[attr] is None:
                        na_missing.append(f"{diag_na_ptr}/{attr}")
        if na_missing:
            return _row(
                "unresolved", "candidate_source_members_missing", (), na_missing
            )

    diff_paths = []
    miss_paths = []
    for src_p, cmp_p in SOURCE_COMPARISON_PAIRS:
        ok_s, val_s = get_path(cand, src_p)
        if cmp_p.startswith("/application_input/"):
            ok_c, val_c = get_path(app_input, cmp_p[len("/application_input") :])
        else:
            ok_c, val_c = get_path(computed_row, cmp_p[len("/computed_row") :])

        if src_p == "/material/na_attributes" and not is_na and not ok_s and not ok_c:
            continue
        if not ok_s and not ok_c:
            miss_paths.append(src_p)
            miss_paths.append(cmp_p)
        elif not ok_s:
            miss_paths.append(src_p)
        elif not ok_c:
            miss_paths.append(cmp_p)
        else:
            compare_values_recursive(val_s, val_c, src_p, cmp_p, diff_paths, miss_paths)

    if diff_paths:
        return _row(
            "content_conflict", "declared_fields_differ", diff_paths, miss_paths
        )
    if miss_paths:
        return _row("unresolved", "candidate_source_members_missing", (), miss_paths)
    return _row("content_corresponding", "all_declared_fields_equal")


def project_source_result_references(input):  # noqa: A002
    """Project source result reference correspondence and logical backflow owner per L5 F03."""
    if not isinstance(input, dict) or "computed_rows" not in input:
        return {
            "rows": [],
            "input_findings": [
                {
                    "field": "/computed_rows",
                    "state": "absent",
                    "reason": "computed_rows_absent",
                    "raw_value": {"presence": "absent"},
                }
            ],
        }
    computed_rows = input["computed_rows"]
    if computed_rows is None:
        return {
            "rows": [],
            "input_findings": [
                {
                    "field": "/computed_rows",
                    "state": "explicit_null",
                    "reason": "computed_rows_null",
                    "raw_value": {"presence": "present", "value": None},
                }
            ],
        }
    if not isinstance(computed_rows, list):
        return {
            "rows": [],
            "input_findings": [
                {
                    "field": "/computed_rows",
                    "state": "invalid_kind",
                    "reason": "computed_rows_invalid_kind",
                    "raw_value": {
                        "presence": "present",
                        "value": copy.deepcopy(computed_rows),
                    },
                }
            ],
        }

    source_envelopes_input = presence_of(input, "source_envelopes")
    rows_out = []
    for row_index, computed_row in enumerate(computed_rows):
        if not is_obj(computed_row):
            rows_out.append(
                {
                    "row_index": row_index,
                    "computed_row": {
                        "presence": "present",
                        "value": copy.deepcopy(computed_row),
                    },
                    "source_envelopes_input": copy.deepcopy(source_envelopes_input),
                    "source_relation": "unresolved",
                    "source_relation_reason": "computed_row_invalid_kind",
                    "logical_backflow_owner": "unknown",
                    "actual_source_qualification": "not_established",
                    "actual_recipient_qualification": "not_established",
                    "decision_impact": "none",
                }
            )
            continue

        if "application_input" not in input:
            rows_out.append(
                build_result_row(
                    computed_row,
                    source_envelopes_input,
                    [],
                    "unresolved",
                    "application_input_absent",
                    [],
                    ["/application_input"],
                )
            )
            continue
        app_input = input["application_input"]
        if app_input is None:
            rows_out.append(
                build_result_row(
                    computed_row,
                    source_envelopes_input,
                    [],
                    "unresolved",
                    "application_input_null",
                    [],
                    ["/application_input"],
                )
            )
            continue
        if not is_obj(app_input):
            rows_out.append(
                build_result_row(
                    computed_row,
                    source_envelopes_input,
                    [],
                    "unresolved",
                    "application_input_invalid_kind",
                    ["/application_input"],
                    [],
                )
            )
            continue

        if "source_envelopes" not in input:
            rows_out.append(
                build_result_row(
                    computed_row,
                    source_envelopes_input,
                    [],
                    "unprovided",
                    "source_envelopes_absent",
                    [],
                    [],
                )
            )
            continue
        src_envs = input["source_envelopes"]
        if src_envs is None or not isinstance(src_envs, list):
            rows_out.append(
                build_result_row(
                    computed_row,
                    source_envelopes_input,
                    [],
                    "unresolved",
                    "source_envelopes_explicit_null_or_non_array",
                    [],
                    [],
                )
            )
            continue
        if len(src_envs) == 0:
            rows_out.append(
                build_result_row(
                    computed_row,
                    source_envelopes_input,
                    [],
                    "unprovided",
                    "source_envelopes_empty",
                    [],
                    [],
                )
            )
            continue

        c_pol_ok, c_pol_id, c_pol_unk = eval_selector_side(
            computed_row,
            "/application_policy_ref",
            "/computed_row/application_policy_ref",
            "/computed_row/application_policy_ref/identity",
        )
        c_tpl_ok, c_tpl_id, c_tpl_unk = eval_selector_side(
            computed_row,
            "/template_ref",
            "/computed_row/template_ref",
            "/computed_row/template_ref/identity",
        )

        candidates = []
        unresolved_selector_envs = []
        for env in src_envs:
            s_pol_ok, s_pol_id, s_pol_unk = eval_selector_side(
                env,
                "/row_binding/application_policy_ref",
                "/row_binding/application_policy_ref",
                "/row_binding/application_policy_ref/identity",
            )
            s_tpl_ok, s_tpl_id, s_tpl_unk = eval_selector_side(
                env,
                "/row_binding/template_ref",
                "/row_binding/template_ref",
                "/row_binding/template_ref/identity",
            )
            if (s_pol_ok and c_pol_ok and s_pol_id != c_pol_id) or (
                s_tpl_ok and c_tpl_ok and s_tpl_id != c_tpl_id
            ):
                continue
            if s_pol_ok and c_pol_ok and s_tpl_ok and c_tpl_ok:
                candidates.append(env)
            else:
                unresolved_selector_envs.append(
                    (s_pol_unk, c_pol_unk, s_tpl_unk, c_tpl_unk)
                )

        if unresolved_selector_envs:
            unk_paths = []
            for s_pol_u, c_pol_u, _, _ in unresolved_selector_envs:
                if s_pol_u:
                    unk_paths.append(s_pol_u)
                if c_pol_u:
                    unk_paths.append(c_pol_u)
            for _, _, s_tpl_u, c_tpl_u in unresolved_selector_envs:
                if s_tpl_u:
                    unk_paths.append(s_tpl_u)
                if c_tpl_u:
                    unk_paths.append(c_tpl_u)
            rows_out.append(
                build_result_row(
                    computed_row,
                    source_envelopes_input,
                    candidates,
                    "unresolved",
                    "candidate_relation_unresolved",
                    [],
                    unk_paths,
                )
            )
            continue

        if len(candidates) == 0:
            rows_out.append(
                build_result_row(
                    computed_row,
                    source_envelopes_input,
                    [],
                    "unresolved",
                    "candidate_not_found",
                    [],
                    [],
                )
            )
            continue
        if len(candidates) > 1:
            rows_out.append(
                build_result_row(
                    computed_row,
                    source_envelopes_input,
                    candidates,
                    "ambiguous_duplicate",
                    "multiple_candidate_envelopes",
                    [],
                    [],
                )
            )
            continue

        rows_out.append(
            _evaluate_candidate(
                computed_row, app_input, source_envelopes_input, candidates
            )
        )

    return {
        "rows": rows_out,
        "input_findings": [],
    }
