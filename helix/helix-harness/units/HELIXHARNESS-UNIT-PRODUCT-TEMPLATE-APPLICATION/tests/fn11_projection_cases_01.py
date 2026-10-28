"""FN11 independent packet cases, group 01."""

import copy

from fn11_projection_case_support import add_case, base_packet, ref


def build_cases(fixture):
    rows = []

    def base():
        return base_packet(fixture)

    def add(rows, case_id, configure, expected):
        add_case(rows, case_id, configure, expected, base)

    # Normal Ref dimensions: each is compared separately under L3 F01's four-field rule.
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-EXACT-01",
        lambda p: None,
        {
            "links[0].projection_state": "corresponding_in_fixture",
            "links[0].universe_results[0].projection_state": "corresponding_in_fixture",
            "links[0].universe_results[0].matching_universe_member_indices": [0],
            "links[0].universe_results[0].matching_template_snapshot_indices": [0],
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-REVISION-02",
        lambda p: p["brain_supply_analysis"]["candidate_refs"][0].update(
            revision="rev-B"
        ),
        {
            "links[0].universe_results[0].projection_state": "same_identity_revision_or_scope_mismatch",
            "links[0].universe_results[0].member_comparison_occurrences[0].different_fields": [
                "revision"
            ],
            "links[0].universe_results[0].unresolved_fields": [],
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SCOPE-03",
        lambda p: p["brain_supply_analysis"]["candidate_refs"][0].update(
            scope={"product": "other", "tenant": "tenant-A"}
        ),
        {
            "links[0].universe_results[0].projection_state": "same_identity_revision_or_scope_mismatch",
            "links[0].universe_results[0].member_comparison_occurrences[0].different_fields": [
                "scope"
            ],
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-OWNER-04",
        lambda p: p["brain_supply_analysis"]["candidate_refs"][0].update(
            owner="owner-B"
        ),
        {
            "links[0].universe_results[0].projection_state": "not_corresponding",
            "links[0].universe_results[0].member_comparison_occurrences[0].relation": "unrelated_known_ref",
            "links[0].universe_results[0].member_comparison_occurrences[0].different_fields": [
                "owner"
            ],
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-BRAIN-SCOPE-SHAPE-05",
        lambda p: p["brain_supply_analysis"]["candidate_refs"][0].update(
            scope={"project": "product-A", "tenant": "tenant-A"}
        ),
        {
            "links[0].universe_results[0].projection_state": "same_identity_revision_or_scope_mismatch",
            "links[0].universe_results[0].member_comparison_occurrences[0].different_fields": [
                "scope"
            ],
        },
    )

    def duplicate_candidates(p):
        a = copy.deepcopy(p["brain_supply_analysis"]["candidate_refs"][0])
        b = copy.deepcopy(a)
        b["identity"] = "item-B"
        p["brain_supply_analysis"]["candidate_refs"] = [a, b, copy.deepcopy(a)]
        p["core_application"]["universes"][0]["members"] = [
            copy.deepcopy(a),
            copy.deepcopy(a),
        ]

    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-DUPLICATE-ORDER-06",
        duplicate_candidates,
        {
            "links[0].candidate_index": 0,
            "links[1].candidate_index": 1,
            "links[2].candidate_index": 2,
            "links[0].universe_results[0].matching_universe_member_indices": [0, 1],
        },
    )
    return rows
