"""FN11 independent packet cases, group 04."""

import copy

from fn11_projection_case_support import add_case, base_packet, ref


def build_cases(fixture):
    rows = []

    def base():
        return base_packet(fixture)

    def add(rows, case_id, configure, expected):
        add_case(rows, case_id, configure, expected, base)

    # Wrong-kind collection/member slots preserve raw values and distinguish invalid_type.
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-CANDIDATE-REFS-NONARRAY-38",
        lambda p: p["brain_supply_analysis"].update(candidate_refs="not-an-array"),
        {
            "candidate_refs_presence": "invalid_type",
            "candidate_refs": "not-an-array",
            "links": [],
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSES-NONARRAY-39",
        lambda p: p["core_application"].update(universes={"one": 1}),
        {
            "universes_presence": "invalid_type",
            "links[0].projection_state": "not_compared_universes_invalid_type",
            "links[0].universe_results": [],
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBERS-NONARRAY-40",
        lambda p: p["core_application"]["universes"][0].update(members="not-an-array"),
        {
            "links[0].universe_results[0].universe_members_presence": "invalid_type",
            "links[0].universe_results[0].projection_state": "unresolved_universe_members_invalid_type",
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-TEMPLATES-NONARRAY-41",
        lambda p: p["core_application"].update(templates="not-an-array"),
        {
            "templates_presence": "invalid_type",
            "links[0].universe_results[0].projection_state": "not_compared_snapshots_invalid_type",
        },
    )
    return rows
