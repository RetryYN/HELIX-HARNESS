"""FN12 baseline 24 cases (27 rows) derived from L5/L8 source_result_reference_projection rules."""

import copy

from fn12_projection_case_support import (
    add_single_row_case,
    build_four_dispositions_packet,
    make_expected_row,
)


def build_baseline_cases(fixture):
    """Build all 24 baseline cases (27 rows) for project_source_result_references."""
    cases = []

    # 0: CORE009-F03-SOURCE-FOUR-DISPOSITIONS (4 rows)
    four_pkt = build_four_dispositions_packet(fixture)
    four_rows = [
        make_expected_row(
            four_pkt,
            idx,
            [four_pkt["source_envelopes"][idx]],
            "content_corresponding",
            "all_declared_fields_equal",
            owner="not_required",
        )
        for idx in range(4)
    ]
    cases.append(
        (
            "CORE009-F03-SOURCE-FOUR-DISPOSITIONS",
            four_pkt,
            {"rows": four_rows, "input_findings": []},
        )
    )

    # 1..4: Single-disposition corresponding cases
    for idx, cid in enumerate(
        (
            "CORE009-F03-SOURCE-REQUIRED",
            "CORE009-F03-SOURCE-CONDITIONAL",
            "CORE009-F03-SOURCE-NOT-APPLICABLE",
            "CORE009-F03-SOURCE-UNRESOLVED",
        )
    ):
        add_single_row_case(
            cases,
            fixture,
            cid,
            idx,
            None,
            lambda p: p["source_envelopes"],
            "content_corresponding",
            "all_declared_fields_equal",
            owner="not_required",
        )

    # 5: CORE009-F03-SOURCE-ENVELOPES-ABSENT
    add_single_row_case(
        cases,
        fixture,
        "CORE009-F03-SOURCE-ENVELOPES-ABSENT",
        0,
        lambda p: p.pop("source_envelopes"),
        [],
        "unprovided",
        "source_envelopes_absent",
        owner="unknown",
    )

    # 6: CORE009-F03-SOURCE-ENVELOPES-NULL
    add_single_row_case(
        cases,
        fixture,
        "CORE009-F03-SOURCE-ENVELOPES-NULL",
        0,
        lambda p: p.update(source_envelopes=None),
        [],
        "unresolved",
        "source_envelopes_explicit_null_or_non_array",
        owner="unknown",
    )

    # 7: CORE009-F03-SOURCE-ENVELOPES-EMPTY
    add_single_row_case(
        cases,
        fixture,
        "CORE009-F03-SOURCE-ENVELOPES-EMPTY",
        0,
        lambda p: p.update(source_envelopes=[]),
        [],
        "unprovided",
        "source_envelopes_empty",
        owner="unknown",
    )

    # 8: CORE009-F03-SOURCE-RESULT-REF-ONLY
    def _result_ref_only(p):
        env = p["source_envelopes"][0]
        p["source_envelopes"] = [
            {
                "result_ref": copy.deepcopy(env["result_ref"]),
                "role": env["role"],
            }
        ]

    add_single_row_case(
        cases,
        fixture,
        "CORE009-F03-SOURCE-RESULT-REF-ONLY",
        0,
        _result_ref_only,
        [],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=[
            "/row_binding/application_policy_ref/identity",
            "/row_binding/template_ref/identity",
        ],
        owner="unknown",
    )

    # 9: CORE009-F03-SOURCE-REVISION-MISMATCH
    add_single_row_case(
        cases,
        fixture,
        "CORE009-F03-SOURCE-REVISION-MISMATCH",
        0,
        lambda p: p["source_envelopes"][0]["row_binding"]["binding"][
            "requirement_ref"
        ].update(revision="rev-B"),
        lambda p: p["source_envelopes"],
        "content_conflict",
        "declared_fields_differ",
        diff_paths=["/row_binding/binding/requirement_ref/revision"],
        owner="HARNESS008",
    )

    # 10: CORE009-F03-SOURCE-SCOPE-MISMATCH
    add_single_row_case(
        cases,
        fixture,
        "CORE009-F03-SOURCE-SCOPE-MISMATCH",
        0,
        lambda p: p["source_envelopes"][0]["row_binding"]["binding"][
            "product_scope"
        ].update(product="SYNTHETIC-Q"),
        lambda p: p["source_envelopes"],
        "content_conflict",
        "declared_fields_differ",
        diff_paths=["/row_binding/binding/product_scope/product"],
        owner="HARNESS008",
    )

    # 11: CORE009-F03-SOURCE-OWNER-MISMATCH
    add_single_row_case(
        cases,
        fixture,
        "CORE009-F03-SOURCE-OWNER-MISMATCH",
        0,
        lambda p: p["source_envelopes"][0]["qualification_claim"].update(
            subject_owner="foreign-owner"
        ),
        lambda p: p["source_envelopes"],
        "content_conflict",
        "declared_fields_differ",
        diff_paths=["/qualification_claim/subject_owner"],
        owner="unknown",
    )

    # 12: CORE009-F03-SOURCE-MATERIAL-MISMATCH
    add_single_row_case(
        cases,
        fixture,
        "CORE009-F03-SOURCE-MATERIAL-MISMATCH",
        0,
        lambda p: p["source_envelopes"][0]["material"].update(
            disposition="conditional"
        ),
        lambda p: p["source_envelopes"],
        "content_conflict",
        "declared_fields_differ",
        diff_paths=["/material/disposition"],
        owner="HARNESS",
    )

    # 13: CORE009-F03-SOURCE-DUPLICATE-ENVELOPES
    def _duplicate_envelopes(p):
        dup = copy.deepcopy(p["source_envelopes"][0])
        dup["source_envelope_ref"]["identity"] = "envelope-duplicate"
        dup["result_ref"]["identity"] = "result-duplicate"
        p["source_envelopes"].append(dup)

    add_single_row_case(
        cases,
        fixture,
        "CORE009-F03-SOURCE-DUPLICATE-ENVELOPES",
        0,
        _duplicate_envelopes,
        lambda p: p["source_envelopes"],
        "ambiguous_duplicate",
        "multiple_candidate_envelopes",
        owner="unknown",
    )

    # 14: CORE009-F03-SOURCE-OPTIONAL-NA-PRESENCE-NON-NA
    def _optional_na_non_na(p):
        p["computed_rows"][0]["application_policy_ref"]["identity"] = (
            "policy-required-optional-na"
        )
        p["computed_rows"][0]["na_attributes"] = {"reason": None}
        env = p["source_envelopes"][0]
        env["source_envelope_ref"]["identity"] = "envelope-optional-na"
        env["result_ref"]["identity"] = "result-optional-na"
        env["row_binding"]["application_policy_ref"]["identity"] = (
            "policy-required-optional-na"
        )
        env["material"]["na_attributes"] = {"reason": None}

    add_single_row_case(
        cases,
        fixture,
        "CORE009-F03-SOURCE-OPTIONAL-NA-PRESENCE-NON-NA",
        0,
        _optional_na_non_na,
        lambda p: p["source_envelopes"],
        "content_corresponding",
        "all_declared_fields_equal",
        owner="not_required",
    )

    # 15: CORE009-F03-SOURCE-CONDITION-VALUE-MISMATCH
    add_single_row_case(
        cases,
        fixture,
        "CORE009-F03-SOURCE-CONDITION-VALUE-MISMATCH",
        3,
        lambda p: p["source_envelopes"][0]["material"]["condition_pairs"][0].update(
            condition_value="different-condition-value"
        ),
        lambda p: p["source_envelopes"],
        "content_conflict",
        "declared_fields_differ",
        diff_paths=["/material/condition_pairs/0/condition_value"],
        owner="HARNESS",
    )

    # 16: CORE009-F03-SOURCE-RESULT-REF-ABSENT
    add_single_row_case(
        cases,
        fixture,
        "CORE009-F03-SOURCE-RESULT-REF-ABSENT",
        0,
        lambda p: p["source_envelopes"][0].pop("result_ref"),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_result_ref_missing",
        miss_paths=["/result_ref"],
        owner="unknown",
    )

    # 17..18, 23: non-semantic roles
    for cid, role_val in (
        ("CORE009-F03-SOURCE-ROLE-DERIVED-VIEW", "derived_view"),
        ("CORE009-F03-SOURCE-ROLE-EXPLANATION", "explanation"),
    ):
        add_single_row_case(
            cases,
            fixture,
            cid,
            0,
            lambda p, rv=role_val: p["source_envelopes"][0].update(role=rv),
            lambda p: p["source_envelopes"],
            "unresolved",
            "source_role_not_semantic",
            owner="unknown",
        )

    # 19: CORE009-F03-SOURCE-RESULT-IDENTITY-NULL
    add_single_row_case(
        cases,
        fixture,
        "CORE009-F03-SOURCE-RESULT-IDENTITY-NULL",
        0,
        lambda p: p["source_envelopes"][0]["result_ref"].update(identity=None),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_result_ref_identity_null",
        miss_paths=["/result_ref/identity"],
        owner="unknown",
    )

    # 20: CORE009-F03-SOURCE-RESULT-IDENTITY-ABSENT
    add_single_row_case(
        cases,
        fixture,
        "CORE009-F03-SOURCE-RESULT-IDENTITY-ABSENT",
        0,
        lambda p: p["source_envelopes"][0]["result_ref"].pop("identity"),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_result_ref_identity_absent",
        miss_paths=["/result_ref/identity"],
        owner="unknown",
    )

    # 21: CORE009-F03-SOURCE-RESULT-IDENTITY-INVALID-KIND
    add_single_row_case(
        cases,
        fixture,
        "CORE009-F03-SOURCE-RESULT-IDENTITY-INVALID-KIND",
        0,
        lambda p: p["source_envelopes"][0]["result_ref"].update(identity=7),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_result_ref_identity_invalid",
        diff_paths=["/result_ref/identity"],
        owner="unknown",
    )

    # 22: CORE009-F03-SOURCE-RESULT-REF-NULL
    add_single_row_case(
        cases,
        fixture,
        "CORE009-F03-SOURCE-RESULT-REF-NULL",
        0,
        lambda p: p["source_envelopes"][0].update(result_ref=None),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_result_ref_null",
        miss_paths=["/result_ref"],
        owner="unknown",
    )

    # 23: CORE009-F03-SOURCE-ROLE-REFERENCE-ONLY
    add_single_row_case(
        cases,
        fixture,
        "CORE009-F03-SOURCE-ROLE-REFERENCE-ONLY",
        0,
        lambda p: p["source_envelopes"][0].update(role="reference_only"),
        lambda p: p["source_envelopes"],
        "unresolved",
        "source_role_not_semantic",
        owner="unknown",
    )

    return cases
