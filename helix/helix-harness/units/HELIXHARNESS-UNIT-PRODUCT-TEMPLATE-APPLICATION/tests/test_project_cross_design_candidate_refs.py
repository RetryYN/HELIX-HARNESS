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


def _rename_string_values(value):
    if isinstance(value, str):
        return "renamed::" + value
    if isinstance(value, list):
        return [_rename_string_values(item) for item in value]
    if isinstance(value, dict):
        return {key: _rename_string_values(item) for key, item in value.items()}
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
        renamed = _rename_string_values(packet)
        original_result = _call_fn11(self, packet)
        renamed_result = _call_fn11(self, renamed)

        self.assertEqual(_behavior_signature(original_result), _behavior_signature(renamed_result))
        self.assertEqual(
            [link["candidate_ref"] for link in renamed_result["links"]],
            renamed["brain_supply_analysis"]["candidate_refs"],
        )


if __name__ == "__main__":
    unittest.main()
