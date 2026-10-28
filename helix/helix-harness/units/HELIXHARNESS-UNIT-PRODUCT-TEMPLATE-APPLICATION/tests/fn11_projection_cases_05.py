"""FN11 independent packet cases, group 05."""

import copy

from fn11_projection_case_support import add_case, base_packet, ref


def build_cases(fixture):
    rows = []

    def base():
        return base_packet(fixture)

    def add(rows, case_id, configure, expected):
        add_case(rows, case_id, configure, expected, base)

    # Four L8 local probes pin cross-Universe diagnostics and raw non-object handling.
    def probe_a(p):
        exact = copy.deepcopy(p["core_application"]["universes"][0])
        missing = copy.deepcopy(exact)
        del missing["members"][0]["identity"]
        p["core_application"]["universes"] = [missing, exact]

    add(
        rows,
        "HARNESS-L8-009-R1-CE-A-UNKNOWN-MEMBER-FIELD-IN-OTHER-UNIVERSE",
        probe_a,
        {
            "links[0].universe_results[0].projection_state": "unknown_ref_fields",
            "links[0].universe_results[1].projection_state": "corresponding_in_fixture",
            "links[0].unresolved_fields": ["identity"],
        },
    )

    def probe_b(p):
        u = copy.deepcopy(p["core_application"]["universes"][0])
        u["members"] = []
        other = copy.deepcopy(u)
        revised = copy.deepcopy(p["brain_supply_analysis"]["candidate_refs"][0])
        revised["revision"] = "rev-B"
        other["members"] = [revised]
        p["core_application"]["universes"] = [u, other]

    add(
        rows,
        "HARNESS-L8-009-R1-CE-B-EMPTY-MEMBER-PLUS-REVISION-DIFFERENCE",
        probe_b,
        {
            "links[0].universe_results[0].projection_state": "no_universe_member",
            "links[0].universe_results[1].projection_state": "same_identity_revision_or_scope_mismatch",
            "links[0].universe_results[1].different_fields": ["revision"],
        },
    )

    def probe_c(p):
        u = copy.deepcopy(p["core_application"]["universes"][0])
        u["members"] = None
        other = copy.deepcopy(u)
        revised = copy.deepcopy(p["brain_supply_analysis"]["candidate_refs"][0])
        revised["revision"] = "rev-B"
        other["members"] = [revised]
        p["core_application"]["universes"] = [u, other]

    add(
        rows,
        "HARNESS-L8-009-R1-CE-C-NULL-MEMBER-PLUS-REVISION-DIFFERENCE",
        probe_c,
        {
            "links[0].universe_results[0].universe_members_presence": "null",
            "links[0].universe_results[0].projection_state": "unresolved_universe_members_null",
            "links[0].universe_results[1].projection_state": "same_identity_revision_or_scope_mismatch",
        },
    )
    add(
        rows,
        "HARNESS-L8-009-R1-UNIVERSE-NONOBJECT-RAW-PRESERVED",
        lambda p: p["core_application"].update(universes=["opaque-universe"]),
        {
            "links[0].universe_results[0].universe_ref_presence": "invalid_type",
            "links[0].universe_results[0].universe_ref": "opaque-universe",
            "links[0].universe_results[0].universe_members_presence": "invalid_type",
            "links[0].universe_results[0].projection_state": "unresolved_universe_members_invalid_type",
        },
    )
    return rows
