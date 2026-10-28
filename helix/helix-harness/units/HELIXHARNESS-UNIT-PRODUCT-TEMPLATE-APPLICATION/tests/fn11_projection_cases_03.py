"""FN11 independent packet cases, group 03."""

import copy

from fn11_projection_case_support import add_case, base_packet, ref


def build_cases(fixture):
    rows = []

    def base():
        return base_packet(fixture)

    def add(rows, case_id, configure, expected):
        add_case(rows, case_id, configure, expected, base)

    # Target-side absent/null and mixed unresolved plus known-difference evidence.
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBER-IDENTITY-NULL-23",
        lambda p: p["core_application"]["universes"][0]["members"][0].update(
            identity=None
        ),
        {
            "links[0].universe_results[0].projection_state": "unknown_ref_fields",
            "links[0].universe_results[0].member_comparison_occurrences[0].unresolved_fields": [
                "identity"
            ],
        },
    )

    def drop_member_identity(p):
        del p["core_application"]["universes"][0]["members"][0]["identity"]

    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBER-IDENTITY-ABSENT-24",
        drop_member_identity,
        {
            "links[0].universe_results[0].projection_state": "unknown_ref_fields",
            "links[0].universe_results[0].member_comparison_occurrences[0].relation": "target_field_unresolved",
        },
    )

    def member_unknown_and_difference(p):
        member = copy.deepcopy(p["core_application"]["universes"][0]["members"][0])
        del member["identity"]
        member["revision"] = "other-rev"
        p["core_application"]["universes"][0]["members"] = [member]

    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBER-UNKNOWN-PLUS-KNOWN-DIFFERENCE-25",
        member_unknown_and_difference,
        {
            "links[0].universe_results[0].projection_state": "unknown_ref_fields",
            "links[0].universe_results[0].member_comparison_occurrences[0].unresolved_fields": [
                "identity"
            ],
            "links[0].universe_results[0].member_comparison_occurrences[0].different_fields": [
                "revision"
            ],
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-IDENTITY-NULL-26",
        lambda p: p["core_application"]["templates"][0]["ref"].update(identity=None),
        {
            "links[0].universe_results[0].projection_state": "unknown_ref_fields",
            "links[0].universe_results[0].snapshot_comparison_occurrences[0].unresolved_fields": [
                "identity"
            ],
        },
    )

    def drop_snapshot_identity(p):
        del p["core_application"]["templates"][0]["ref"]["identity"]

    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-IDENTITY-ABSENT-27",
        drop_snapshot_identity,
        {
            "links[0].universe_results[0].projection_state": "unknown_ref_fields",
            "links[0].universe_results[0].snapshot_comparison_occurrences[0].relation": "target_field_unresolved",
        },
    )

    def snapshot_unknown_and_difference(p):
        snap = p["core_application"]["templates"][0]["ref"]
        del snap["identity"]
        snap["revision"] = "other-rev"

    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-UNKNOWN-PLUS-KNOWN-DIFFERENCE-28",
        snapshot_unknown_and_difference,
        {
            "links[0].universe_results[0].projection_state": "unknown_ref_fields",
            "links[0].universe_results[0].snapshot_comparison_occurrences[0].unresolved_fields": [
                "identity"
            ],
            "links[0].universe_results[0].snapshot_comparison_occurrences[0].different_fields": [
                "revision"
            ],
        },
    )

    def exact_plus_unknown(p):
        u = p["core_application"]["universes"][0]
        unknown = ref()
        del unknown["identity"]
        u["members"].append(unknown)
        snap = copy.deepcopy(p["core_application"]["templates"][0])
        other = copy.deepcopy(snap)
        other["ref"] = {"revision": "other"}
        p["core_application"]["templates"] = [snap, other]

    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-EXACT-WITH-UNRELATED-UNKNOWN-TARGETS-29",
        exact_plus_unknown,
        {
            "links[0].universe_results[0].projection_state": "corresponding_in_fixture",
            "links[0].universe_results[0].matching_universe_member_indices": [0],
            "links[0].universe_results[0].matching_template_snapshot_indices": [0],
            "links[0].universe_results[0].member_comparison_occurrences[1].unresolved_fields": [
                "identity"
            ],
            "links[0].universe_results[0].snapshot_comparison_occurrences[1].unresolved_fields": [
                "identity",
                "scope",
                "owner",
            ],
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-NULL-CANDIDATE-ELEMENT-30",
        lambda p: p["brain_supply_analysis"].update(candidate_refs=[None]),
        {
            "candidate_refs_presence": "value",
            "candidate_refs": [None],
            "links[0].candidate_ref": None,
            "links[0].projection_state": "unknown_ref_fields",
            "links[0].universe_results[0].unresolved_fields": [
                "identity",
                "revision",
                "scope",
                "owner",
            ],
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-NULL-UNIVERSE-ELEMENT-31",
        lambda p: p["core_application"].update(universes=[None]),
        {
            "links[0].universe_results[0].universe_ref_presence": "invalid_type",
            "links[0].universe_results[0].universe_ref": None,
            "links[0].universe_results[0].universe_members_presence": "invalid_type",
            "links[0].universe_results[0].projection_state": "unresolved_universe_members_invalid_type",
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-NULL-MEMBER-ELEMENT-32",
        lambda p: p["core_application"]["universes"][0].update(members=[None]),
        {
            "links[0].universe_results[0].projection_state": "unknown_ref_fields",
            "links[0].universe_results[0].member_comparison_occurrences[0].target_record_presence": "null",
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-NULL-SNAPSHOT-ELEMENT-33",
        lambda p: p["core_application"].update(templates=[None]),
        {
            "links[0].universe_results[0].projection_state": "unknown_ref_fields",
            "links[0].universe_results[0].snapshot_comparison_occurrences[0].target_record_presence": "null",
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-BOOL-NUMBER-SCOPE-DISTINCTION-34",
        lambda p: p["brain_supply_analysis"]["candidate_refs"][0].update(scope=True),
        {
            "links[0].universe_results[0].projection_state": "same_identity_revision_or_scope_mismatch",
            "links[0].universe_results[0].member_comparison_occurrences[0].different_fields": [
                "scope"
            ],
        },
    )

    def drop_template_ref(p):
        del p["core_application"]["templates"][0]["ref"]

    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-REF-ABSENT-35",
        drop_template_ref,
        {
            "links[0].universe_results[0].projection_state": "unknown_ref_fields",
            "links[0].universe_results[0].snapshot_comparison_occurrences[0].target_record_presence": "absent",
        },
    )
    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-REF-NULL-36",
        lambda p: p["core_application"]["templates"][0].update(ref=None),
        {
            "links[0].universe_results[0].projection_state": "unknown_ref_fields",
            "links[0].universe_results[0].snapshot_comparison_occurrences[0].target_record_presence": "null",
        },
    )

    def drop_universe_ref(p):
        del p["core_application"]["universes"][0]["ref"]

    add(
        rows,
        "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-REF-ABSENT-37",
        drop_universe_ref,
        {
            "links[0].universe_results[0].universe_ref_presence": "absent",
            "links[0].universe_results[0].context_state": "unknown",
            "links[0].universe_results[0].projection_state": "universe_scope_unresolved",
        },
    )
    return rows
