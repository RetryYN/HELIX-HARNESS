"""FN11 independent packet cases, group 02."""

import copy

from fn11_projection_case_support import add_case, base_packet, ref


def build_cases(fixture):
    rows = []

    def base():
        return base_packet(fixture)

    def add(rows, case_id, configure, expected):
        add_case(rows, case_id, configure, expected, base)

    # Outer collection presence: absent, null, empty and wrong-kind remain distinct.
    def drop_candidates(p):
        del p["brain_supply_analysis"]["candidate_refs"]

    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-CANDIDATES-ABSENT-07",
        drop_candidates,
        {
            "candidate_refs_presence": "absent",
            "links": [],
            "candidate_refs_present": False,
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-CANDIDATES-NULL-08",
        lambda p: p["brain_supply_analysis"].update(candidate_refs=None),
        {"candidate_refs_presence": "null", "candidate_refs": None, "links": []},
    )

    def drop_universes(p):
        del p["core_application"]["universes"]

    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-ABSENT-09",
        drop_universes,
        {
            "universes_presence": "absent",
            "universe_count": None,
            "links[0].projection_state": "not_compared_universes_absent",
            "links[0].universe_results": [],
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-NULL-10",
        lambda p: p["core_application"].update(universes=None),
        {
            "universes_presence": "null",
            "universe_count": None,
            "links[0].projection_state": "not_compared_universes_null",
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-EMPTY-11",
        lambda p: p["core_application"].update(
            universes=[
                {
                    "ref": ref(),
                    "binding": {"product_scope": ref()["scope"]},
                    "members": [],
                }
            ]
        ),
        {
            "universes_presence": "value",
            "links[0].universe_results[0].universe_members_presence": "empty",
            "links[0].universe_results[0].projection_state": "no_universe_member",
        },
    )

    def drop_templates(p):
        del p["core_application"]["templates"]

    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-ABSENT-12",
        drop_templates,
        {
            "templates_presence": "absent",
            "links[0].universe_results[0].projection_state": "not_compared_snapshots_absent",
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-NULL-13",
        lambda p: p["core_application"].update(templates=None),
        {
            "templates_presence": "null",
            "links[0].universe_results[0].projection_state": "not_compared_snapshots_null",
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-QUALIFICATION-UNESTABLISHED-14",
        lambda p: None,
        {
            "qualification": "not_established_by_this_ref_projection",
            "selection": "not_established_by_this_ref_projection",
            "side_effect_count": 0,
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-CONTEXT-MISMATCH-15",
        lambda p: p["core_application"]["templates"][0]["binding"].update(
            product_scope={"product": "foreign"}
        ),
        {
            "links[0].universe_results[0].context_state": "incoherent",
            "links[0].universe_results[0].projection_state": "universe_scope_unresolved",
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBERS-NULL-16",
        lambda p: p["core_application"]["universes"][0].update(members=None),
        {
            "links[0].universe_results[0].universe_members_presence": "null",
            "links[0].universe_results[0].projection_state": "unresolved_universe_members_null",
        },
    )

    def drop_members(p):
        del p["core_application"]["universes"][0]["members"]

    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBERS-ABSENT-17",
        drop_members,
        {
            "links[0].universe_results[0].universe_members_presence": "absent",
            "links[0].universe_results[0].projection_state": "unresolved_universe_members_absent",
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-IDENTITY-NULL-18",
        lambda p: p["brain_supply_analysis"]["candidate_refs"][0].update(identity=None),
        {
            "links[0].universe_results[0].projection_state": "unknown_ref_fields",
            "links[0].universe_results[0].member_comparison_occurrences[0].unresolved_fields": [
                "identity"
            ],
        },
    )

    def drop_candidate_identity(p):
        del p["brain_supply_analysis"]["candidate_refs"][0]["identity"]

    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-IDENTITY-ABSENT-19",
        drop_candidate_identity,
        {
            "links[0].universe_results[0].projection_state": "unknown_ref_fields",
            "links[0].universe_results[0].member_comparison_occurrences[0].unresolved_fields": [
                "identity"
            ],
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSES-EMPTY-20",
        lambda p: p["core_application"].update(universes=[]),
        {
            "universes_presence": "empty",
            "universe_count": 0,
            "links[0].projection_state": "no_universe_entries",
            "links[0].universe_results": [],
        },
    )

    def duplicate_universe(p):
        p["core_application"]["universes"].append(
            copy.deepcopy(p["core_application"]["universes"][0])
        )

    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-DUPLICATE-21",
        duplicate_universe,
        {
            "links[0].universe_results[0].universe_index": 0,
            "links[0].universe_results[1].universe_index": 1,
            "links[0].universe_results[0].projection_state": "corresponding_in_fixture",
            "links[0].universe_results[1].projection_state": "corresponding_in_fixture",
        },
    )

    def reverse_universe_order(p):
        a = copy.deepcopy(p["core_application"]["universes"][0])
        b = copy.deepcopy(a)
        b["ref"]["identity"] = "universe-B"
        b["ref"]["scope"] = {"product": "other"}
        b["binding"]["product_scope"] = {"product": "other"}
        candidate = copy.deepcopy(p["brain_supply_analysis"]["candidate_refs"][0])
        member = copy.deepcopy(candidate)
        member["scope"] = {"product": "other", "tenant": "tenant-A"}
        b["members"] = [member]
        t = copy.deepcopy(p["core_application"]["templates"][0])
        t["ref"] = copy.deepcopy(member)
        t["binding"]["product_scope"] = {"product": "other", "tenant": "tenant-A"}
        p["core_application"]["universes"] = [b, a]
        p["core_application"]["templates"].append(t)

    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-ORDER-22",
        reverse_universe_order,
        {
            "links[0].universe_results[0].universe_index": 0,
            "links[0].universe_results[0].projection_state": "same_identity_revision_or_scope_mismatch",
            "links[0].universe_results[1].universe_index": 1,
            "links[0].universe_results[1].projection_state": "corresponding_in_fixture",
        },
    )
    return rows
