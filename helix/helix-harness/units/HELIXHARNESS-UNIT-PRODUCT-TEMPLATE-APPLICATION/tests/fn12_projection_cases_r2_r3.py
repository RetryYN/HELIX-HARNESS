"""FN12 r2 (15 cases) and r3 (13 cases) derived from L5/L8 source_result_reference_projection rules."""

import copy

from fn12_projection_case_support import add_single_row_case


def build_r2_cases(fixture):
    """Build all 15 r2 cases for project_source_result_references."""
    cases = []

    # 0 (45): CORE009-R2-CONDITION-REF-NULL-BOTH-SIDES
    def _cond_ref_null_both(p):
        p["computed_rows"][0]["condition_pairs"][0]["condition_ref"] = None
        p["source_envelopes"][0]["material"]["condition_pairs"][0]["condition_ref"] = (
            None
        )

    add_single_row_case(
        cases,
        fixture,
        "CORE009-R2-CONDITION-REF-NULL-BOTH-SIDES",
        1,
        _cond_ref_null_both,
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=[
            "/material/condition_pairs/0/condition_ref",
            "/computed_row/condition_pairs/0/condition_ref",
        ],
        owner="HARNESS",
    )

    # 1 (46): CORE009-R2-CONDITION-REF-NULL-SOURCE-SIDE
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R2-CONDITION-REF-NULL-SOURCE-SIDE",
        1,
        lambda p: p["source_envelopes"][0]["material"]["condition_pairs"][0].update(
            condition_ref=None
        ),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=["/material/condition_pairs/0/condition_ref"],
        owner="HARNESS",
    )

    # 2 (47): CORE009-R2-CONDITION-REF-NULL-COMPUTED-SIDE
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R2-CONDITION-REF-NULL-COMPUTED-SIDE",
        1,
        lambda p: p["computed_rows"][0]["condition_pairs"][0].update(
            condition_ref=None
        ),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=["/computed_row/condition_pairs/0/condition_ref"],
        owner="HARNESS",
    )

    # 3 (48): CORE009-R2-SOURCE-ENVELOPE-REF-NULL
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R2-SOURCE-ENVELOPE-REF-NULL",
        0,
        lambda p: p["source_envelopes"][0].update(source_envelope_ref=None),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=["/source_envelope_ref"],
        owner="unknown",
    )

    # 4 (49): CORE009-R2-SOURCE-ENVELOPE-REF-WRONG-KIND
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R2-SOURCE-ENVELOPE-REF-WRONG-KIND",
        0,
        lambda p: p["source_envelopes"][0].update(source_envelope_ref="INVALID-REF"),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=["/source_envelope_ref"],
        owner="unknown",
    )

    # 5 (50): CORE009-R2-CONDITION-REF-ABSENT-BOTH-SIDES
    def _cond_ref_absent_both(p):
        p["computed_rows"][0]["condition_pairs"][0].pop("condition_ref")
        p["source_envelopes"][0]["material"]["condition_pairs"][0].pop("condition_ref")

    add_single_row_case(
        cases,
        fixture,
        "CORE009-R2-CONDITION-REF-ABSENT-BOTH-SIDES",
        1,
        _cond_ref_absent_both,
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=[
            "/material/condition_pairs/0/condition_ref",
            "/computed_row/condition_pairs/0/condition_ref",
        ],
        owner="HARNESS",
    )

    # 6 (51): CORE009-R2-CONDITION-REF-ABSENT-SOURCE-SIDE
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R2-CONDITION-REF-ABSENT-SOURCE-SIDE",
        1,
        lambda p: p["source_envelopes"][0]["material"]["condition_pairs"][0].pop(
            "condition_ref"
        ),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=["/material/condition_pairs/0/condition_ref"],
        owner="HARNESS",
    )

    # 7 (52): CORE009-R2-CONDITION-REF-ABSENT-COMPUTED-SIDE
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R2-CONDITION-REF-ABSENT-COMPUTED-SIDE",
        1,
        lambda p: p["computed_rows"][0]["condition_pairs"][0].pop("condition_ref"),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=["/computed_row/condition_pairs/0/condition_ref"],
        owner="HARNESS",
    )

    # 8 (53): CORE009-R2-CONDITION-REF-WRONG-KIND-BOTH-SIDES
    def _cond_ref_wrong_kind_both(p):
        p["computed_rows"][0]["condition_pairs"][0]["condition_ref"] = 1
        p["source_envelopes"][0]["material"]["condition_pairs"][0]["condition_ref"] = 1

    add_single_row_case(
        cases,
        fixture,
        "CORE009-R2-CONDITION-REF-WRONG-KIND-BOTH-SIDES",
        1,
        _cond_ref_wrong_kind_both,
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=[
            "/material/condition_pairs/0/condition_ref",
            "/computed_row/condition_pairs/0/condition_ref",
        ],
        owner="HARNESS",
    )

    # 9 (54): CORE009-R2-BINDING-TEMPLATE-REVISION-NULL-BOTH-SIDES
    def _binding_tpl_rev_null_both(p):
        p["computed_rows"][0]["binding"]["template_ref"]["revision"] = None
        p["source_envelopes"][0]["row_binding"]["binding"]["template_ref"][
            "revision"
        ] = None

    add_single_row_case(
        cases,
        fixture,
        "CORE009-R2-BINDING-TEMPLATE-REVISION-NULL-BOTH-SIDES",
        0,
        _binding_tpl_rev_null_both,
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=[
            "/row_binding/binding/template_ref/revision",
            "/computed_row/binding/template_ref/revision",
        ],
        owner="BRAIN",
    )

    # 10 (55): CORE009-R2-BINDING-TEMPLATE-REVISION-NULL-SOURCE-SIDE
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R2-BINDING-TEMPLATE-REVISION-NULL-SOURCE-SIDE",
        0,
        lambda p: p["source_envelopes"][0]["row_binding"]["binding"][
            "template_ref"
        ].update(revision=None),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=["/row_binding/binding/template_ref/revision"],
        owner="BRAIN",
    )

    # 11 (56): CORE009-R2-BINDING-TEMPLATE-REVISION-NULL-COMPUTED-SIDE
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R2-BINDING-TEMPLATE-REVISION-NULL-COMPUTED-SIDE",
        0,
        lambda p: p["computed_rows"][0]["binding"]["template_ref"].update(
            revision=None
        ),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=["/computed_row/binding/template_ref/revision"],
        owner="BRAIN",
    )

    # 12 (57): CORE009-R2-BINDING-TEMPLATE-REF-NULL-BOTH-SIDES
    def _binding_tpl_ref_null_both(p):
        p["computed_rows"][0]["binding"]["template_ref"] = None
        p["source_envelopes"][0]["row_binding"]["binding"]["template_ref"] = None

    add_single_row_case(
        cases,
        fixture,
        "CORE009-R2-BINDING-TEMPLATE-REF-NULL-BOTH-SIDES",
        0,
        _binding_tpl_ref_null_both,
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=[
            "/row_binding/binding/template_ref",
            "/computed_row/binding/template_ref",
        ],
        owner="BRAIN",
    )

    # 13 (58): CORE009-R2-CONDITION-ARRAY-LENGTH-MISMATCH
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R2-CONDITION-ARRAY-LENGTH-MISMATCH",
        1,
        lambda p: p["computed_rows"][0].update(condition_pairs=[]),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_source_members_missing",
        miss_paths=["/computed_row/condition_pairs/0"],
        owner="HARNESS",
    )

    # 14 (59): CORE009-R2-KNOWN-AND-UNKNOWN-SELECTOR-CANDIDATES
    def _known_and_unknown_selector(p):
        unk_env = copy.deepcopy(p["source_envelopes"][0])
        unk_env["row_binding"]["template_ref"].pop("identity")
        p["source_envelopes"].append(unk_env)

    add_single_row_case(
        cases,
        fixture,
        "CORE009-R2-KNOWN-AND-UNKNOWN-SELECTOR-CANDIDATES",
        0,
        _known_and_unknown_selector,
        lambda p: [p["source_envelopes"][0]],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=["/row_binding/template_ref/identity"],
        owner="BRAIN",
    )

    return cases


def build_r3_cases(fixture):
    """Build all 13 r3 cases for project_source_result_references."""
    cases = []

    # 0..5 (60..65): result_ref revision/scope/owner null or absent
    for cid, axis, is_absent in (
        ("CORE009-R3-RESULT-REF-REVISION-NULL", "revision", False),
        ("CORE009-R3-RESULT-REF-REVISION-ABSENT", "revision", True),
        ("CORE009-R3-RESULT-REF-SCOPE-NULL", "scope", False),
        ("CORE009-R3-RESULT-REF-SCOPE-ABSENT", "scope", True),
        ("CORE009-R3-RESULT-REF-OWNER-NULL", "owner", False),
        ("CORE009-R3-RESULT-REF-OWNER-ABSENT", "owner", True),
    ):

        def _mut_res_axis(p, ax=axis, absent=is_absent):
            if absent:
                p["source_envelopes"][0]["result_ref"].pop(ax)
            else:
                p["source_envelopes"][0]["result_ref"][ax] = None

        add_single_row_case(
            cases,
            fixture,
            cid,
            1,
            _mut_res_axis,
            lambda p: p["source_envelopes"],
            "unresolved",
            "candidate_relation_unresolved",
            miss_paths=[f"/result_ref/{axis}"],
            owner="unknown",
        )

    # 6 (66): CORE009-R3-CONDITION-ARRAY-COMPUTED-ABSENT
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R3-CONDITION-ARRAY-COMPUTED-ABSENT",
        1,
        lambda p: p["computed_rows"][0].pop("condition_pairs"),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_source_members_missing",
        miss_paths=["/computed_row/condition_pairs"],
        owner="HARNESS",
    )

    # 7 (67): CORE009-R3-CONDITION-ARRAY-COMPUTED-NULL
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R3-CONDITION-ARRAY-COMPUTED-NULL",
        1,
        lambda p: p["computed_rows"][0].update(condition_pairs=None),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=["/computed_row/condition_pairs"],
        owner="HARNESS",
    )

    # 8 (68): CORE009-R3-CONDITION-ARRAY-SOURCE-NULL
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R3-CONDITION-ARRAY-SOURCE-NULL",
        1,
        lambda p: p["source_envelopes"][0]["material"].update(condition_pairs=None),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=["/material/condition_pairs"],
        owner="HARNESS",
    )

    # 9 (69): CORE009-R3-CONDITION-ARRAY-BOTH-NULL
    def _cond_array_both_null(p):
        p["computed_rows"][0]["condition_pairs"] = None
        p["source_envelopes"][0]["material"]["condition_pairs"] = None

    add_single_row_case(
        cases,
        fixture,
        "CORE009-R3-CONDITION-ARRAY-BOTH-NULL",
        1,
        _cond_array_both_null,
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=[
            "/material/condition_pairs",
            "/computed_row/condition_pairs",
        ],
        owner="HARNESS",
    )

    # 10 (70): CORE009-R3-CONDITION-ARRAY-COMPUTED-WRONG-KIND
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R3-CONDITION-ARRAY-COMPUTED-WRONG-KIND",
        1,
        lambda p: p["computed_rows"][0].update(condition_pairs=7),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_relation_unresolved",
        miss_paths=["/computed_row/condition_pairs"],
        owner="HARNESS",
    )

    # 11 (71): CORE009-R3-CONDITION-ARRAY-SOURCE-ABSENT
    add_single_row_case(
        cases,
        fixture,
        "CORE009-R3-CONDITION-ARRAY-SOURCE-ABSENT",
        1,
        lambda p: p["source_envelopes"][0]["material"].pop("condition_pairs"),
        lambda p: p["source_envelopes"],
        "unresolved",
        "candidate_source_members_missing",
        miss_paths=["/material/condition_pairs"],
        owner="HARNESS",
    )

    # 12 (72): CORE009-R3-DIFFERENCE-AND-MISSING-PRESERVED
    def _diff_and_missing(p):
        p["computed_rows"][0]["condition_pairs"] = []
        p["source_envelopes"][0]["material"]["disposition"] = "required"

    add_single_row_case(
        cases,
        fixture,
        "CORE009-R3-DIFFERENCE-AND-MISSING-PRESERVED",
        1,
        _diff_and_missing,
        lambda p: p["source_envelopes"],
        "content_conflict",
        "declared_fields_differ",
        diff_paths=["/material/disposition"],
        miss_paths=["/computed_row/condition_pairs/0"],
        owner="HARNESS",
    )

    return cases
