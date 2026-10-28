"""FN11 projection expectations independently derived from L3/L4/L9 and L5/L8."""

import copy
import json
from pathlib import Path
import sys
import unittest

UNIT_ROOT = Path(__file__).resolve().parents[1]
FIXTURE_PATH = UNIT_ROOT / "tests" / "fixtures" / "project_cross_design_candidate_refs.json"
sys.path.insert(0, str(UNIT_ROOT / "src"))
import product_template_application

with FIXTURE_PATH.open(encoding="utf-8") as stream:
    _FIXTURE = json.load(stream)


def _call_fn11(testcase, packet):
    function = getattr(product_template_application, "project_cross_design_candidate_refs", None)
    if not callable(function):
        testcase.fail("FN11 public project_cross_design_candidate_refs is not implemented")
    return function(packet)


def _behavior_signature(result):
    """Exclude digests/raw identifiers while retaining projection decisions and occurrence indexes."""
    return [
        (
            link["candidate_index"],
            link["projection_state"],
            link["aggregate_classification"],
            tuple(
                (
                    universe["universe_index"],
                    tuple(universe["matching_universe_member_indices"]),
                    tuple(universe["matching_template_snapshot_indices"]),
                    universe["context_state"],
                    universe["projection_state"],
                    tuple(
                        (occurrence["side"], occurrence["target_index"], occurrence["relation"], tuple(occurrence["different_fields"]))
                        for occurrence in universe["member_comparison_occurrences"] + universe["snapshot_comparison_occurrences"]
                    ),
                )
                for universe in link["universe_results"]
            ),
        )
        for link in result["links"]
    ]


def _rename_reference_identifiers(value, in_scope=False):
    """Rename opaque Ref IDs/revisions/owners and scope labels; preserve enums and shape strings."""
    if isinstance(value, str):
        return "renamed::" + value if in_scope else value
    if isinstance(value, list):
        return [_rename_reference_identifiers(item, in_scope=in_scope) for item in value]
    if isinstance(value, dict):
        renamed = {}
        for key, item in value.items():
            if key in {"identity", "revision", "owner"} and isinstance(item, str):
                renamed[key] = "renamed::" + item
            else:
                renamed[key] = _rename_reference_identifiers(
                    item, in_scope=in_scope or key in {"scope", "product_scope"}
                )
        return renamed
    return value


class TestProjectCrossDesignCandidateRefs(unittest.TestCase):
    def test_keeps_candidate_order_duplicates_and_scope_separate(self):
        packet = copy.deepcopy(_FIXTURE["input_packet"])
        result = _call_fn11(self, packet)

        self.assertEqual([link["candidate_index"] for link in result["links"]], [0, 1, 2])
        self.assertEqual([link["candidate_ref"] for link in result["links"]], packet["brain_supply_analysis"]["candidate_refs"])
        self.assertEqual(result["links"][0]["projection_state"], "corresponding_in_fixture")
        self.assertEqual(result["links"][1]["projection_state"], "corresponding_in_fixture")
        self.assertEqual(result["links"][2]["projection_state"], "corresponding_in_fixture")
        self.assertEqual(
            [u["projection_state"] for u in result["links"][0]["universe_results"]],
            ["corresponding_in_fixture", "same_identity_revision_or_scope_mismatch"],
        )
        self.assertEqual(
            [u["matching_universe_member_indices"] for u in result["links"][0]["universe_results"]],
            [[0], []],
        )
        self.assertEqual(
            [u["matching_template_snapshot_indices"] for u in result["links"][0]["universe_results"]],
            [[0], []],
        )
        self.assertEqual(
            [u["matching_universe_member_indices"] for u in result["links"][1]["universe_results"]],
            [[], [0]],
        )
        self.assertEqual(
            [u["matching_template_snapshot_indices"] for u in result["links"][1]["universe_results"]],
            [[], [1]],
        )
        self.assertEqual(result["links"][0]["universe_results"][1]["different_fields"], ["scope"])
        self.assertEqual(
            result["links"][0]["universe_results"],
            [result["links"][2]["universe_results"][0], result["links"][2]["universe_results"][1]],
        )
        self.assertEqual(result["qualification"], "not_established_by_this_ref_projection")
        self.assertEqual(result["selection"], "not_established_by_this_ref_projection")
        self.assertEqual(result["side_effect_count"], 0)

    def test_exact_ref_is_not_corresponding_when_template_context_conflicts(self):
        packet = copy.deepcopy(_FIXTURE["input_packet"])
        packet["core_application"]["templates"][0]["binding"]["product_scope"] = copy.deepcopy(
            packet["core_application"]["universes"][1]["binding"]["product_scope"]
        )
        result = _call_fn11(self, packet)

        first_universe = result["links"][0]["universe_results"][0]
        self.assertEqual(first_universe["matching_universe_member_indices"], [0])
        self.assertEqual(first_universe["matching_template_snapshot_indices"], [0])
        self.assertEqual(first_universe["context_state"], "incoherent")
        self.assertEqual(first_universe["projection_state"], "universe_scope_unresolved")
        self.assertNotEqual(result["links"][0]["projection_state"], "corresponding_in_fixture")

    def test_projection_decisions_do_not_depend_on_identifier_spelling(self):
        packet = copy.deepcopy(_FIXTURE["input_packet"])
        renamed = _rename_reference_identifiers(packet)
        original_result = _call_fn11(self, packet)
        renamed_result = _call_fn11(self, renamed)

        self.assertEqual(_behavior_signature(original_result), _behavior_signature(renamed_result))
        self.assertEqual(
            [link["candidate_ref"] for link in renamed_result["links"]],
            renamed["brain_supply_analysis"]["candidate_refs"],
        )


    def test_l8_u_id_cases_and_local_probes_have_independent_oracles(self):
        def base():
            packet = copy.deepcopy(_FIXTURE["input_packet"])
            packet["brain_supply_analysis"]["candidate_refs"] = [
                copy.deepcopy(packet["brain_supply_analysis"]["candidate_refs"][0])
            ]
            packet["core_application"]["universes"] = [
                copy.deepcopy(packet["core_application"]["universes"][0])
            ]
            packet["core_application"]["templates"] = [
                copy.deepcopy(packet["core_application"]["templates"][0])
            ]
            return packet

        def edit(packet, path, value, remove=False):
            parts = path.split(".")
            node = packet
            for part in parts[:-1]:
                node = node[int(part)] if part.isdigit() else node[part]
            last = parts[-1]
            if last.isdigit():
                node[int(last)] = copy.deepcopy(value)
            elif remove:
                del node[last]
            else:
                node[last] = copy.deepcopy(value)

        def ref(**overrides):
            value = {
                "identity": "item-A", "revision": "rev-A",
                "scope": {"product": "product-A", "tenant": "tenant-A"},
                "owner": "owner-A", "source_locator": None, "sha256": None,
            }
            value.update(copy.deepcopy(overrides))
            return value

        def add(rows, case_id, configure, expected):
            packet = base()
            configure(packet)
            rows.append((case_id, packet, expected))

        rows = []
        # Normal Ref dimensions: each is compared separately under L3 F01's four-field rule.
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-EXACT-01", lambda p: None,
            {"links[0].projection_state": "corresponding_in_fixture",
             "links[0].universe_results[0].projection_state": "corresponding_in_fixture",
             "links[0].universe_results[0].matching_universe_member_indices": [0],
             "links[0].universe_results[0].matching_template_snapshot_indices": [0]})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-REVISION-02",
            lambda p: p["brain_supply_analysis"]["candidate_refs"][0].update(revision="rev-B"),
            {"links[0].universe_results[0].projection_state": "same_identity_revision_or_scope_mismatch",
             "links[0].universe_results[0].member_comparison_occurrences[0].different_fields": ["revision"],
             "links[0].universe_results[0].unresolved_fields": []})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SCOPE-03",
            lambda p: p["brain_supply_analysis"]["candidate_refs"][0].update(scope={"product":"other","tenant":"tenant-A"}),
            {"links[0].universe_results[0].projection_state": "same_identity_revision_or_scope_mismatch",
             "links[0].universe_results[0].member_comparison_occurrences[0].different_fields": ["scope"]})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-OWNER-04",
            lambda p: p["brain_supply_analysis"]["candidate_refs"][0].update(owner="owner-B"),
            {"links[0].universe_results[0].projection_state": "not_corresponding",
             "links[0].universe_results[0].member_comparison_occurrences[0].relation": "unrelated_known_ref",
             "links[0].universe_results[0].member_comparison_occurrences[0].different_fields": ["owner"]})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-BRAIN-SCOPE-SHAPE-05",
            lambda p: p["brain_supply_analysis"]["candidate_refs"][0].update(scope={"project":"product-A","tenant":"tenant-A"}),
            {"links[0].universe_results[0].projection_state": "same_identity_revision_or_scope_mismatch",
             "links[0].universe_results[0].member_comparison_occurrences[0].different_fields": ["scope"]})
        def duplicate_candidates(p):
            a = copy.deepcopy(p["brain_supply_analysis"]["candidate_refs"][0])
            b = copy.deepcopy(a); b["identity"] = "item-B"
            p["brain_supply_analysis"]["candidate_refs"] = [a, b, copy.deepcopy(a)]
            p["core_application"]["universes"][0]["members"] = [copy.deepcopy(a), copy.deepcopy(a)]
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-DUPLICATE-ORDER-06", duplicate_candidates,
            {"links[0].candidate_index": 0, "links[1].candidate_index": 1, "links[2].candidate_index": 2,
             "links[0].universe_results[0].matching_universe_member_indices": [0, 1]})

        # Outer collection presence: absent, null, empty and wrong-kind remain distinct.
        def drop_candidates(p): del p["brain_supply_analysis"]["candidate_refs"]
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-CANDIDATES-ABSENT-07", drop_candidates,
            {"candidate_refs_presence": "absent", "links": [], "candidate_refs_present": False})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-CANDIDATES-NULL-08",
            lambda p: p["brain_supply_analysis"].update(candidate_refs=None),
            {"candidate_refs_presence": "null", "candidate_refs": None, "links": []})
        def drop_universes(p): del p["core_application"]["universes"]
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-ABSENT-09", drop_universes,
            {"universes_presence": "absent", "universe_count": None,
             "links[0].projection_state": "not_compared_universes_absent",
             "links[0].universe_results": []})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-NULL-10",
            lambda p: p["core_application"].update(universes=None),
            {"universes_presence": "null", "universe_count": None,
             "links[0].projection_state": "not_compared_universes_null"})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-EMPTY-11",
            lambda p: p["core_application"].update(universes=[{"ref":ref(),"binding":{"product_scope":ref()["scope"]},"members":[]}]),
            {"universes_presence": "value", "links[0].universe_results[0].universe_members_presence": "empty",
             "links[0].universe_results[0].projection_state": "no_universe_member"})
        def drop_templates(p): del p["core_application"]["templates"]
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-ABSENT-12", drop_templates,
            {"templates_presence": "absent", "links[0].universe_results[0].projection_state": "not_compared_snapshots_absent"})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-NULL-13",
            lambda p: p["core_application"].update(templates=None),
            {"templates_presence": "null", "links[0].universe_results[0].projection_state": "not_compared_snapshots_null"})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-QUALIFICATION-UNESTABLISHED-14", lambda p: None,
            {"qualification": "not_established_by_this_ref_projection",
             "selection": "not_established_by_this_ref_projection", "side_effect_count": 0})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-CONTEXT-MISMATCH-15",
            lambda p: p["core_application"]["templates"][0]["binding"].update(product_scope={"product":"foreign"}),
            {"links[0].universe_results[0].context_state": "incoherent",
             "links[0].universe_results[0].projection_state": "universe_scope_unresolved"})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBERS-NULL-16",
            lambda p: p["core_application"]["universes"][0].update(members=None),
            {"links[0].universe_results[0].universe_members_presence": "null",
             "links[0].universe_results[0].projection_state": "unresolved_universe_members_null"})
        def drop_members(p): del p["core_application"]["universes"][0]["members"]
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBERS-ABSENT-17", drop_members,
            {"links[0].universe_results[0].universe_members_presence": "absent",
             "links[0].universe_results[0].projection_state": "unresolved_universe_members_absent"})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-IDENTITY-NULL-18",
            lambda p: p["brain_supply_analysis"]["candidate_refs"][0].update(identity=None),
            {"links[0].universe_results[0].projection_state": "unknown_ref_fields",
             "links[0].universe_results[0].member_comparison_occurrences[0].unresolved_fields": ["identity"]})
        def drop_candidate_identity(p): del p["brain_supply_analysis"]["candidate_refs"][0]["identity"]
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-IDENTITY-ABSENT-19", drop_candidate_identity,
            {"links[0].universe_results[0].projection_state": "unknown_ref_fields",
             "links[0].universe_results[0].member_comparison_occurrences[0].unresolved_fields": ["identity"]})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSES-EMPTY-20",
            lambda p: p["core_application"].update(universes=[]),
            {"universes_presence": "empty", "universe_count": 0,
             "links[0].projection_state": "no_universe_entries", "links[0].universe_results": []})
        def duplicate_universe(p): p["core_application"]["universes"].append(copy.deepcopy(p["core_application"]["universes"][0]))
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-DUPLICATE-21", duplicate_universe,
            {"links[0].universe_results[0].universe_index": 0,
             "links[0].universe_results[1].universe_index": 1,
             "links[0].universe_results[0].projection_state": "corresponding_in_fixture",
             "links[0].universe_results[1].projection_state": "corresponding_in_fixture"})
        def reverse_universe_order(p):
            a=copy.deepcopy(p["core_application"]["universes"][0]); b=copy.deepcopy(a)
            b["ref"]["identity"]="universe-B"; b["ref"]["scope"]={"product":"other"}; b["binding"]["product_scope"]={"product":"other"}
            candidate=copy.deepcopy(p["brain_supply_analysis"]["candidate_refs"][0])
            member=copy.deepcopy(candidate); member["scope"]={"product":"other","tenant":"tenant-A"}
            b["members"]=[member]
            t=copy.deepcopy(p["core_application"]["templates"][0]); t["ref"]=copy.deepcopy(member); t["binding"]["product_scope"]={"product":"other","tenant":"tenant-A"}
            p["core_application"]["universes"]=[b,a]; p["core_application"]["templates"].append(t)
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-ORDER-22", reverse_universe_order,
            {"links[0].universe_results[0].universe_index": 0,
             "links[0].universe_results[0].projection_state": "same_identity_revision_or_scope_mismatch",
             "links[0].universe_results[1].universe_index": 1,
             "links[0].universe_results[1].projection_state": "corresponding_in_fixture"})

        # Target-side absent/null and mixed unresolved plus known-difference evidence.
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBER-IDENTITY-NULL-23",
            lambda p: p["core_application"]["universes"][0]["members"][0].update(identity=None),
            {"links[0].universe_results[0].projection_state": "unknown_ref_fields",
             "links[0].universe_results[0].member_comparison_occurrences[0].unresolved_fields": ["identity"]})
        def drop_member_identity(p): del p["core_application"]["universes"][0]["members"][0]["identity"]
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBER-IDENTITY-ABSENT-24", drop_member_identity,
            {"links[0].universe_results[0].projection_state": "unknown_ref_fields",
             "links[0].universe_results[0].member_comparison_occurrences[0].relation": "target_field_unresolved"})
        def member_unknown_and_difference(p):
            member=copy.deepcopy(p["core_application"]["universes"][0]["members"][0]); del member["identity"]; member["revision"]="other-rev"
            p["core_application"]["universes"][0]["members"]=[member]
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBER-UNKNOWN-PLUS-KNOWN-DIFFERENCE-25", member_unknown_and_difference,
            {"links[0].universe_results[0].projection_state": "unknown_ref_fields",
             "links[0].universe_results[0].member_comparison_occurrences[0].unresolved_fields": ["identity"],
             "links[0].universe_results[0].member_comparison_occurrences[0].different_fields": ["revision"]})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-IDENTITY-NULL-26",
            lambda p: p["core_application"]["templates"][0]["ref"].update(identity=None),
            {"links[0].universe_results[0].projection_state": "unknown_ref_fields",
             "links[0].universe_results[0].snapshot_comparison_occurrences[0].unresolved_fields": ["identity"]})
        def drop_snapshot_identity(p): del p["core_application"]["templates"][0]["ref"]["identity"]
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-IDENTITY-ABSENT-27", drop_snapshot_identity,
            {"links[0].universe_results[0].projection_state": "unknown_ref_fields",
             "links[0].universe_results[0].snapshot_comparison_occurrences[0].relation": "target_field_unresolved"})
        def snapshot_unknown_and_difference(p):
            snap=p["core_application"]["templates"][0]["ref"]; del snap["identity"]; snap["revision"]="other-rev"
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-UNKNOWN-PLUS-KNOWN-DIFFERENCE-28", snapshot_unknown_and_difference,
            {"links[0].universe_results[0].projection_state": "unknown_ref_fields",
             "links[0].universe_results[0].snapshot_comparison_occurrences[0].unresolved_fields": ["identity"],
             "links[0].universe_results[0].snapshot_comparison_occurrences[0].different_fields": ["revision"]})
        def exact_plus_unknown(p):
            u=p["core_application"]["universes"][0]
            unknown=ref(); del unknown["identity"]
            u["members"].append(unknown)
            snap=copy.deepcopy(p["core_application"]["templates"][0]); other=copy.deepcopy(snap); other["ref"]={"revision":"other"}
            p["core_application"]["templates"]=[snap,other]
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-EXACT-WITH-UNRELATED-UNKNOWN-TARGETS-29", exact_plus_unknown,
            {"links[0].universe_results[0].projection_state": "corresponding_in_fixture",
             "links[0].universe_results[0].matching_universe_member_indices": [0],
             "links[0].universe_results[0].matching_template_snapshot_indices": [0],
             "links[0].universe_results[0].member_comparison_occurrences[1].unresolved_fields": ["identity"],
             "links[0].universe_results[0].snapshot_comparison_occurrences[1].unresolved_fields": ["identity","scope","owner"]})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-NULL-CANDIDATE-ELEMENT-30",
            lambda p: p["brain_supply_analysis"].update(candidate_refs=[None]),
            {"candidate_refs_presence": "value", "candidate_refs": [None], "links[0].candidate_ref": None,
             "links[0].projection_state": "unknown_ref_fields", "links[0].universe_results[0].unresolved_fields": ["identity","revision","scope","owner"]})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-NULL-UNIVERSE-ELEMENT-31",
            lambda p: p["core_application"].update(universes=[None]),
            {"links[0].universe_results[0].universe_ref_presence": "invalid_type",
             "links[0].universe_results[0].universe_ref": None,
             "links[0].universe_results[0].universe_members_presence": "invalid_type",
             "links[0].universe_results[0].projection_state": "unresolved_universe_members_invalid_type"})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-NULL-MEMBER-ELEMENT-32",
            lambda p: p["core_application"]["universes"][0].update(members=[None]),
            {"links[0].universe_results[0].projection_state": "unknown_ref_fields",
             "links[0].universe_results[0].member_comparison_occurrences[0].target_record_presence": "null"})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-NULL-SNAPSHOT-ELEMENT-33",
            lambda p: p["core_application"].update(templates=[None]),
            {"links[0].universe_results[0].projection_state": "unknown_ref_fields",
             "links[0].universe_results[0].snapshot_comparison_occurrences[0].target_record_presence": "null"})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-BOOL-NUMBER-SCOPE-DISTINCTION-34",
            lambda p: p["brain_supply_analysis"]["candidate_refs"][0].update(scope=True),
            {"links[0].universe_results[0].projection_state": "same_identity_revision_or_scope_mismatch",
             "links[0].universe_results[0].member_comparison_occurrences[0].different_fields": ["scope"]})
        def drop_template_ref(p): del p["core_application"]["templates"][0]["ref"]
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-REF-ABSENT-35", drop_template_ref,
            {"links[0].universe_results[0].projection_state": "unknown_ref_fields",
             "links[0].universe_results[0].snapshot_comparison_occurrences[0].target_record_presence": "absent"})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-REF-NULL-36",
            lambda p: p["core_application"]["templates"][0].update(ref=None),
            {"links[0].universe_results[0].projection_state": "unknown_ref_fields",
             "links[0].universe_results[0].snapshot_comparison_occurrences[0].target_record_presence": "null"})
        def drop_universe_ref(p): del p["core_application"]["universes"][0]["ref"]
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-REF-ABSENT-37", drop_universe_ref,
            {"links[0].universe_results[0].universe_ref_presence": "absent",
             "links[0].universe_results[0].context_state": "unknown",
             "links[0].universe_results[0].projection_state": "universe_scope_unresolved"})

        # Wrong-kind collection/member slots preserve raw values and distinguish invalid_type.
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-CANDIDATE-REFS-NONARRAY-38",
            lambda p: p["brain_supply_analysis"].update(candidate_refs="not-an-array"),
            {"candidate_refs_presence": "invalid_type", "candidate_refs": "not-an-array", "links": []})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSES-NONARRAY-39",
            lambda p: p["core_application"].update(universes={"one":1}),
            {"universes_presence": "invalid_type", "links[0].projection_state": "not_compared_universes_invalid_type",
             "links[0].universe_results": []})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBERS-NONARRAY-40",
            lambda p: p["core_application"]["universes"][0].update(members="not-an-array"),
            {"links[0].universe_results[0].universe_members_presence": "invalid_type",
             "links[0].universe_results[0].projection_state": "unresolved_universe_members_invalid_type"})
        add(rows, "HARNESS-L8-009-XBD-CORE009-F01-PROJ-TEMPLATES-NONARRAY-41",
            lambda p: p["core_application"].update(templates="not-an-array"),
            {"templates_presence": "invalid_type", "links[0].universe_results[0].projection_state": "not_compared_snapshots_invalid_type"})

        # Four L8 local probes pin cross-Universe diagnostics and raw non-object handling.
        def probe_a(p):
            exact=copy.deepcopy(p["core_application"]["universes"][0])
            missing=copy.deepcopy(exact); del missing["members"][0]["identity"]
            p["core_application"]["universes"]=[missing,exact]
        add(rows, "HARNESS-L8-009-R1-CE-A-UNKNOWN-MEMBER-FIELD-IN-OTHER-UNIVERSE", probe_a,
            {"links[0].universe_results[0].projection_state": "unknown_ref_fields",
             "links[0].universe_results[1].projection_state": "corresponding_in_fixture",
             "links[0].unresolved_fields": ["identity"]})
        def probe_b(p):
            u=copy.deepcopy(p["core_application"]["universes"][0]); u["members"]=[]
            other=copy.deepcopy(u)
            revised=copy.deepcopy(p["brain_supply_analysis"]["candidate_refs"][0]); revised["revision"]="rev-B"
            other["members"]=[revised]
            p["core_application"]["universes"]=[u,other]
        add(rows, "HARNESS-L8-009-R1-CE-B-EMPTY-MEMBER-PLUS-REVISION-DIFFERENCE", probe_b,
            {"links[0].universe_results[0].projection_state": "no_universe_member",
             "links[0].universe_results[1].projection_state": "same_identity_revision_or_scope_mismatch",
             "links[0].universe_results[1].different_fields": ["revision"]})
        def probe_c(p):
            u=copy.deepcopy(p["core_application"]["universes"][0]); u["members"]=None
            other=copy.deepcopy(u)
            revised=copy.deepcopy(p["brain_supply_analysis"]["candidate_refs"][0]); revised["revision"]="rev-B"
            other["members"]=[revised]
            p["core_application"]["universes"]=[u,other]
        add(rows, "HARNESS-L8-009-R1-CE-C-NULL-MEMBER-PLUS-REVISION-DIFFERENCE", probe_c,
            {"links[0].universe_results[0].universe_members_presence": "null",
             "links[0].universe_results[0].projection_state": "unresolved_universe_members_null",
             "links[0].universe_results[1].projection_state": "same_identity_revision_or_scope_mismatch"})
        add(rows, "HARNESS-L8-009-R1-UNIVERSE-NONOBJECT-RAW-PRESERVED",
            lambda p: p["core_application"].update(universes=["opaque-universe"]),
            {"links[0].universe_results[0].universe_ref_presence": "invalid_type",
             "links[0].universe_results[0].universe_ref": "opaque-universe",
             "links[0].universe_results[0].universe_members_presence": "invalid_type",
             "links[0].universe_results[0].projection_state": "unresolved_universe_members_invalid_type"})

        case_ids = [case_id for case_id, _, _ in rows]
        self.assertEqual(len(rows), 45)
        self.assertEqual(len(set(case_ids)), 45)
        self.assertEqual(sum(case_id.startswith("HARNESS-L8-009-XBD-") for case_id in case_ids), 41)
        self.assertEqual(sum(case_id.startswith("HARNESS-L8-009-R1-") for case_id in case_ids), 4)
        for case_id, packet, expected in rows:
            with self.subTest(case_id=case_id):
                result = _call_fn11(self, packet)
                for path, value in expected.items():
                    if path == "candidate_refs_present":
                        self.assertEqual("candidate_refs" in result, value, f"{case_id}: candidate_refs presence")
                        continue
                    actual = result
                    for segment in path.replace("[", ".").replace("]", "").split("."):
                        actual = actual[int(segment)] if segment.isdigit() else actual[segment]
                    self.assertEqual(actual, value, f"{case_id}: {path}")


if __name__ == "__main__":
    unittest.main()
