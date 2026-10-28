"""FN12 r1 21 cases derived from L5/L8 source_result_reference_projection rules."""

import copy

from fn12_projection_case_support import (
    add_single_row_case,
    build_four_dispositions_packet,
    build_single_row_packet,
    make_expected_row,
    presence_of,
)


def build_r1_cases(fixture):
    """Build all 21 r1 cases for project_source_result_references."""
    cases = []

    # 0 (24): CORE009-R1-NULL-POLICY-IDENTITY-BOTH-SIDES
    def _null_policy_id_both(p):
        p["computed_rows"][0]["application_policy_ref"]["identity"] = None
        p["source_envelopes"][0]["row_binding"]["application_policy_ref"][
            "identity"
        ] = None

    add_single_row_case(
        cases,
        fixture,
        "CORE009-R1-NULL-POLICY-IDENTITY-BOTH-SIDES",
        0,
        _null_policy_id_both,
        [],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=[
            "/row_binding/application_policy_ref/identity",
            "/computed_row/application_policy_ref/identity",
        ],
        owner="HARNESS",
    )

    # 1 (25): CORE009-R1-TEMPLATE-REVISION-NULL-BOTH-SIDES
    def _tpl_rev_null_both(p):
        p["computed_rows"][0]["template_ref"]["revision"] = None
        p["computed_rows"][0]["binding"]["template_ref"]["revision"] = None
        p["source_envelopes"][0]["row_binding"]["template_ref"]["revision"] = None

    add_single_row_case(
        cases,
        fixture,
        "CORE009-R1-TEMPLATE-REVISION-NULL-BOTH-SIDES",
        0,
        _tpl_rev_null_both,
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=[
            "/row_binding/template_ref/revision",
            "/computed_row/template_ref/revision",
        ],
        owner="BRAIN",
    )

    # 2 (26): CORE009-R1-SUBJECT-REVISION-NULL-BOTH-SIDES
    def _subject_rev_null_both(p):
        p["application_input"]["input_ref"]["revision"] = None
        p["source_envelopes"][0]["qualification_claim"]["subject_revision"] = None

    add_single_row_case(
        cases,
        fixture,
        "CORE009-R1-SUBJECT-REVISION-NULL-BOTH-SIDES",
        0,
        _subject_rev_null_both,
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=[
            "/application_input/input_ref/revision",
            "/qualification_claim/subject_revision",
        ],
        owner="unknown",
    )

    # 3 (27): CORE009-R1-UNSELECTED-UNKNOWN-SELECTOR-NONINTERFERENCE
    def _unselected_unknown_selector(p):
        four = build_four_dispositions_packet(fixture)
        unselected = copy.deepcopy(four["source_envelopes"][0])
        unselected["source_envelope_ref"]["identity"] = "envelope-unselected"
        unselected["row_binding"]["application_policy_ref"]["identity"] = None
        unselected["row_binding"]["template_ref"]["identity"] = (
            "template-clearly-different"
        )
        p["source_envelopes"] = four["source_envelopes"] + [unselected]

    add_single_row_case(
        cases,
        fixture,
        "CORE009-R1-UNSELECTED-UNKNOWN-SELECTOR-NONINTERFERENCE",
        0,
        _unselected_unknown_selector,
        lambda p: [p["source_envelopes"][0]],
        "content_corresponding",
        "all_declared_fields_equal",
        owner="not_required",
    )

    # 4 (28): CORE009-R1-LEAF-AND-ARRAY-LENGTH-DIAGNOSTICS
    def _leaf_and_array_len(p):
        ob_b = copy.deepcopy(p["computed_rows"][0]["obligation_refs"][0])
        ob_b["identity"] = "obligation-B"
        p["computed_rows"][0]["obligation_refs"] = [ob_b, copy.deepcopy(ob_b)]
        p["source_envelopes"][0]["material"]["condition_pairs"][0]["condition_value"][
            "unit"
        ] = "widgets"

    add_single_row_case(
        cases,
        fixture,
        "CORE009-R1-LEAF-AND-ARRAY-LENGTH-DIAGNOSTICS",
        1,
        _leaf_and_array_len,
        lambda p: p["source_envelopes"],
        "content_conflict",
        "declared_fields_differ",
        diff_paths=["/material/condition_pairs/0/condition_value/unit"],
        miss_paths=["/material/obligation_refs/1"],
        owner="HARNESS",
    )

    # 5 (29): CORE009-R1-APPLICATION-INPUT-ABSENT
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R1-APPLICATION-INPUT-ABSENT",
        0,
        lambda p: p.pop("application_input"),
        [],
        "unresolved",
        "application_input_absent",
        miss_paths=["/application_input"],
        owner="unknown",
    )

    # 6 (30): CORE009-R1-APPLICATION-INPUT-NULL
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R1-APPLICATION-INPUT-NULL",
        0,
        lambda p: p.update(application_input=None),
        [],
        "unresolved",
        "application_input_null",
        miss_paths=["/application_input"],
        owner="unknown",
    )

    # 7 (31): CORE009-R1-APPLICATION-INPUT-NONOBJECT
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R1-APPLICATION-INPUT-NONOBJECT",
        0,
        lambda p: p.update(application_input=17),
        [],
        "unresolved",
        "application_input_invalid_kind",
        diff_paths=["/application_input"],
        owner="unknown",
    )

    # 8 (32): CORE009-R1-COMPUTED-ROWS-ABSENT
    pkt_cr_absent = build_single_row_packet(fixture, 0)
    pkt_cr_absent.pop("computed_rows")
    cases.append(
        (
            "CORE009-R1-COMPUTED-ROWS-ABSENT",
            pkt_cr_absent,
            {
                "rows": [],
                "input_findings": [
                    {
                        "field": "/computed_rows",
                        "state": "absent",
                        "reason": "computed_rows_absent",
                        "raw_value": {"presence": "absent"},
                    }
                ],
            },
        )
    )

    # 9 (33): CORE009-R1-COMPUTED-ROWS-NONARRAY
    pkt_cr_nonarr = build_single_row_packet(fixture, 0)
    pkt_cr_nonarr["computed_rows"] = "not-an-array"
    cases.append(
        (
            "CORE009-R1-COMPUTED-ROWS-NONARRAY",
            pkt_cr_nonarr,
            {
                "rows": [],
                "input_findings": [
                    {
                        "field": "/computed_rows",
                        "state": "invalid_kind",
                        "reason": "computed_rows_invalid_kind",
                        "raw_value": {
                            "presence": "present",
                            "value": "not-an-array",
                        },
                    }
                ],
            },
        )
    )

    # 10 (34): CORE009-R1-COMPUTED-ROW-NULL-ELEMENT
    pkt_cr_null_elem = build_single_row_packet(fixture, 0)
    pkt_cr_null_elem["computed_rows"] = [None]
    cases.append(
        (
            "CORE009-R1-COMPUTED-ROW-NULL-ELEMENT",
            pkt_cr_null_elem,
            {
                "rows": [
                    {
                        "row_index": 0,
                        "computed_row": {"presence": "present", "value": None},
                        "source_envelopes_input": presence_of(
                            pkt_cr_null_elem, "source_envelopes"
                        ),
                        "source_relation": "unresolved",
                        "source_relation_reason": "computed_row_invalid_kind",
                        "logical_backflow_owner": "unknown",
                        "actual_source_qualification": "not_established",
                        "actual_recipient_qualification": "not_established",
                        "decision_impact": "none",
                    }
                ],
                "input_findings": [],
            },
        )
    )

    # 11 (35): CORE009-R1-KNOWN-SELECTOR-MISMATCH
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R1-KNOWN-SELECTOR-MISMATCH",
        0,
        lambda p: p["source_envelopes"][0]["row_binding"][
            "application_policy_ref"
        ].update(identity="OTHER-POLICY"),
        [],
        "unresolved",
        "candidate_not_found",
        owner="unknown",
    )

    # 12 (36): CORE009-R1-ROLE-MISSING
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R1-ROLE-MISSING",
        0,
        lambda p: p["source_envelopes"][0].pop("role"),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_source_members_missing",
        miss_paths=["/role"],
        owner="unknown",
    )

    # 13 (37): CORE009-R1-ROOT-INVALID-BEFORE-ROW-INPUT
    pkt_root_before = build_single_row_packet(fixture, 0)
    pkt_root_before.pop("application_input")
    pkt_root_before["computed_rows"] = None
    cases.append(
        (
            "CORE009-R1-ROOT-INVALID-BEFORE-ROW-INPUT",
            pkt_root_before,
            {
                "rows": [],
                "input_findings": [
                    {
                        "field": "/computed_rows",
                        "state": "explicit_null",
                        "reason": "computed_rows_null",
                        "raw_value": {"presence": "present", "value": None},
                    }
                ],
            },
        )
    )

    # 14 (38): CORE009-R1-ROW-INPUT-BEFORE-SOURCE-COLLECTION
    def _row_before_src(p):
        p.pop("application_input")
        p["source_envelopes"] = None

    add_single_row_case(
        cases,
        fixture,
        "CORE009-R1-ROW-INPUT-BEFORE-SOURCE-COLLECTION",
        0,
        _row_before_src,
        [],
        "unresolved",
        "application_input_absent",
        miss_paths=["/application_input"],
        owner="unknown",
    )

    # 15 (39): CORE009-R1-ROLE-THEN-RESULT-REF-ORDER
    def _role_then_res_ref(p):
        p["source_envelopes"][0]["role"] = "derived_view"
        p["source_envelopes"][0]["result_ref"] = 9

    add_single_row_case(
        cases,
        fixture,
        "CORE009-R1-ROLE-THEN-RESULT-REF-ORDER",
        0,
        _role_then_res_ref,
        lambda p: p["source_envelopes"],
        "unresolved",
        "source_role_not_semantic",
        owner="unknown",
    )

    # 16 (40): CORE009-R1-RESULT-REF-SCALAR
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R1-RESULT-REF-SCALAR",
        0,
        lambda p: p["source_envelopes"][0].update(result_ref="opaque-ref"),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_result_ref_invalid_kind",
        diff_paths=["/result_ref"],
        owner="unknown",
    )

    # 17 (41): CORE009-R1-OBJECT-KEY-ORDER-IGNORED (4 rows with reversed dict key order in source_envelopes)
    pkt_key_order = build_four_dispositions_packet(fixture)
    pkt_key_order["source_envelopes"][0]["qualification_claim"]["subject_scope"] = {
        "environment": "SYNTHETIC-E",
        "tenant": "SYNTHETIC-T",
        "product": "SYNTHETIC-P",
    }
    cases.append(
        (
            "CORE009-R1-OBJECT-KEY-ORDER-IGNORED",
            pkt_key_order,
            {
                "rows": [
                    make_expected_row(
                        pkt_key_order,
                        idx,
                        [pkt_key_order["source_envelopes"][idx]],
                        "content_corresponding",
                        "all_declared_fields_equal",
                        owner="not_required",
                    )
                    for idx in range(4)
                ],
                "input_findings": [],
            },
        )
    )

    # 18 (42): CORE009-R1-ARRAY-INDEX-ORDER (4 rows, row 1 has 2 condition_pairs with differing minimum)
    pkt_arr_order = build_four_dispositions_packet(fixture)
    cp_base = copy.deepcopy(pkt_arr_order["computed_rows"][1]["condition_pairs"][0])
    cp_second = copy.deepcopy(cp_base)
    cp_second["condition_ref"]["identity"] = "condition-2"
    cp_cmp_0 = copy.deepcopy(cp_base)
    cp_cmp_0["condition_value"] = {"minimum": 3, "unit": "items"}
    cp_cmp_1 = copy.deepcopy(cp_second)
    cp_cmp_1["condition_value"] = {"minimum": 5, "unit": "items"}
    cp_src_0 = copy.deepcopy(cp_base)
    cp_src_0["condition_value"] = {"minimum": 2, "unit": "items"}
    cp_src_1 = copy.deepcopy(cp_second)
    cp_src_1["condition_value"] = {"minimum": 4, "unit": "items"}
    pkt_arr_order["computed_rows"][1]["condition_pairs"] = [cp_cmp_0, cp_cmp_1]
    pkt_arr_order["source_envelopes"][1]["material"]["condition_pairs"] = [
        cp_src_0,
        cp_src_1,
    ]
    cases.append(
        (
            "CORE009-R1-ARRAY-INDEX-ORDER",
            pkt_arr_order,
            {
                "rows": [
                    make_expected_row(
                        pkt_arr_order,
                        0,
                        [pkt_arr_order["source_envelopes"][0]],
                        "content_corresponding",
                        "all_declared_fields_equal",
                        owner="not_required",
                    ),
                    make_expected_row(
                        pkt_arr_order,
                        1,
                        [pkt_arr_order["source_envelopes"][1]],
                        "content_conflict",
                        "declared_fields_differ",
                        diff_paths=[
                            "/material/condition_pairs/0/condition_value/minimum",
                            "/material/condition_pairs/1/condition_value/minimum",
                        ],
                        owner="HARNESS",
                    ),
                    make_expected_row(
                        pkt_arr_order,
                        2,
                        [pkt_arr_order["source_envelopes"][2]],
                        "content_corresponding",
                        "all_declared_fields_equal",
                        owner="not_required",
                    ),
                    make_expected_row(
                        pkt_arr_order,
                        3,
                        [pkt_arr_order["source_envelopes"][3]],
                        "content_corresponding",
                        "all_declared_fields_equal",
                        owner="not_required",
                    ),
                ],
                "input_findings": [],
            },
        )
    )

    # 19 (43): CORE009-R1-OPERATION-PROCESS-CONTRACT-REF-ABSENT-BOTH-BINDING-SIDES
    pkt_op_proc = build_four_dispositions_packet(fixture)
    pkt_op_proc["computed_rows"][0]["binding"].pop("process_contract_ref")
    pkt_op_proc["source_envelopes"][0]["row_binding"]["binding"].pop(
        "process_contract_ref"
    )
    cases.append(
        (
            "CORE009-R1-OPERATION-PROCESS-CONTRACT-REF-ABSENT-BOTH-BINDING-SIDES",
            pkt_op_proc,
            {
                "rows": [
                    make_expected_row(
                        pkt_op_proc,
                        0,
                        [pkt_op_proc["source_envelopes"][0]],
                        "unresolved",
                        "candidate_source_members_missing",
                        miss_paths=[
                            "/row_binding/binding/process_contract_ref",
                            "/computed_row/binding/process_contract_ref",
                        ],
                        owner="HARNESS",
                    ),
                    make_expected_row(
                        pkt_op_proc,
                        1,
                        [pkt_op_proc["source_envelopes"][1]],
                        "content_corresponding",
                        "all_declared_fields_equal",
                        owner="not_required",
                    ),
                    make_expected_row(
                        pkt_op_proc,
                        2,
                        [pkt_op_proc["source_envelopes"][2]],
                        "content_corresponding",
                        "all_declared_fields_equal",
                        owner="not_required",
                    ),
                    make_expected_row(
                        pkt_op_proc,
                        3,
                        [pkt_op_proc["source_envelopes"][3]],
                        "content_corresponding",
                        "all_declared_fields_equal",
                        owner="not_required",
                    ),
                ],
                "input_findings": [],
            },
        )
    )

    # 20 (44): CORE009-R1-OPERATION-PRODUCT-SCOPE-STRING-RAWVALUE
    pkt_scope_str = build_four_dispositions_packet(fixture)
    pkt_scope_str["application_input"]["binding"]["product_scope"] = (
        "SYNTHETIC-SCOPE-OPAQUE-STRING"
    )
    for idx in range(4):
        pkt_scope_str["computed_rows"][idx]["binding"]["product_scope"] = (
            "SYNTHETIC-SCOPE-OPAQUE-STRING"
        )
        pkt_scope_str["source_envelopes"][idx]["row_binding"]["binding"][
            "product_scope"
        ] = "SYNTHETIC-SCOPE-OPAQUE-STRING"
    cases.append(
        (
            "CORE009-R1-OPERATION-PRODUCT-SCOPE-STRING-RAWVALUE",
            pkt_scope_str,
            {
                "rows": [
                    make_expected_row(
                        pkt_scope_str,
                        idx,
                        [pkt_scope_str["source_envelopes"][idx]],
                        "content_corresponding",
                        "all_declared_fields_equal",
                        owner="not_required",
                    )
                    for idx in range(4)
                ],
                "input_findings": [],
            },
        )
    )

    return cases
