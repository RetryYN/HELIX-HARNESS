"""Canonical missing-slot origins and post-sort index links for the FN1 walk.

This uses the real FN0-validated Claim fixture with its descriptor population
removed. Expected canonical kinds, public missing rules, and global
failure_rules indices are independently fixed from L4
``/definition_meaning_resolution_contract/evaluation_populations`` and L5
``/failure_rules``, ``/source_return_contract/descriptor_target_dataflow/index_types``
and ``/definition_meaning_core/event_and_field_contract``.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definitions import validate_supply_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_claim_input_fixtures import descriptor_claim_input


PRODUCER = "compare_descriptor_definitions"
MISSING_REASON = "必要なdescriptor slotが当該原Bindingに供給されていない。"
EXPECTED_MISSING = (
    ("template identity", "descriptor_01_missing", 9),
    ("version", "descriptor_02_missing", 12),
    ("layer/pair", "descriptor_03_missing", 15),
    ("applicability", "descriptor_04_missing", 18),
    ("required input", "descriptor_05_missing", 21),
    ("required section", "descriptor_06_missing", 24),
    ("required field", "descriptor_07_missing", 27),
    ("relation", "descriptor_08_missing", 30),
    ("意味owner", "descriptor_09_missing", 33),
    ("trace", "descriptor_10_missing", 36),
    ("negative oracle", "descriptor_11_missing", 39),
    ("measurement", "descriptor_12_missing", 42),
    ("completion", "descriptor_13_missing", 45),
    ("downstream kind", "descriptor_14_missing", 48),
    ("supersession", "descriptor_15_missing", 51),
)
ORIGIN_FIELDS = (
    "ordinal",
    "assessment_key",
    "branch",
    "state",
    "cause",
    "slot_locators",
    "fact_locators",
    "meaning_read_indices",
    "applicability_read_indices",
    "subject_ref",
    "binding",
    "axis_name",
    "original_refs",
    "reason",
    "backflow_owner",
    "finding_rule_indices",
    "sort_source_refs",
    "special_read_indices",
    "pair_origin_links",
    "applicability_judgment_links",
    "meaning_support_links",
    "meaning_problem_links",
    "special_support_links",
)


def _walk(raw: dict) -> tuple[dict, dict]:
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    if (
        validated["input"] is None
        or validated["input_issues"]
        or validated["unusable_source_refs"]
    ):
        raise AssertionError(
            "setup: FN0 must accept the input with an empty descriptor array"
        )
    if validated["input"] != raw_before:
        raise AssertionError(
            "FN0 must retain the raw empty descriptor array and required kinds"
        )
    validated_before = copy.deepcopy(validated)
    result = evaluate_descriptor_definition_walk({"validated": validated})
    if raw != raw_before or validated != validated_before:
        raise AssertionError(
            "the same-call walk must not mutate raw or validated input"
        )
    return validated, result


class TestDescriptorMissingOrigins(unittest.TestCase):
    def test_all_root_required_missing_kinds_keep_global_rule_origins_and_sorted_links(
        self,
    ) -> None:
        raw = descriptor_claim_input("positive")
        binding = copy.deepcopy(raw["binding"])
        subject = copy.deepcopy(binding["knowledge_ref"])
        owner_declarations = copy.deepcopy(
            raw["sources"][0]["content"]["descriptor_targets"]
        )
        raw["descriptors"] = []
        raw_before = copy.deepcopy(raw)

        validated, walk = _walk(raw)
        comparison = walk["evaluation"]["comparison"]
        assessments = walk["evaluation"]["assessments"]
        origins = walk["native_material"]["judgment_origins"]

        self.assertEqual(
            raw["required_descriptor_kinds"], [row[0] for row in EXPECTED_MISSING]
        )
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(comparison["producer_symbol"], PRODUCER)
        self.assertEqual(comparison["input_binding"], binding)
        self.assertEqual(len(comparison["axes"]), 15)
        self.assertEqual(len(comparison["findings"]), 15)
        self.assertEqual(len(assessments), 15)
        self.assertEqual(len(origins), 15)
        self.assertEqual(
            list(walk["native_material"]),
            [
                "meaning_reads",
                "applicability_reads",
                "special_reads",
                "judgment_origins",
                "pair_reads",
                "applicability_judgment_batches",
                "meaning_read_origins",
            ],
        )
        for name in (
            "meaning_reads",
            "applicability_reads",
            "pair_reads",
            "applicability_judgment_batches",
            "meaning_read_origins",
        ):
            self.assertEqual(walk["native_material"][name], [])
        self.assertEqual(
            walk["native_material"]["special_reads"],
            [
                {
                    "request": {
                        "request_kind": "replacement_claim",
                        "request_locator": "/claims/0",
                    },
                    "acquisition_state": "unknown",
                    "source_occurrences": [],
                    "supports": [],
                    "problems": [],
                }
            ],
        )

        for ordinal, (kind, code, failure_rule_index) in enumerate(EXPECTED_MISSING):
            axis_name = f"{kind}.definition"
            rule_ref = f"HELIXBRAIN-L5-032-R-{code}"
            assessment = assessments[ordinal]
            origin = origins[ordinal]

            self.assertEqual(
                set(assessment),
                {
                    "key",
                    "state",
                    "origin_branch",
                    "slot_locators",
                    "fact_locators",
                    "comparison_axis_indices",
                    "comparison_finding_indices",
                    "original_axes",
                    "axis_name",
                },
            )
            self.assertEqual(
                assessment["key"],
                {
                    "binding": {"presence": "supplied", "value": binding},
                    "slot_identity": {"presence": "absent"},
                    "descriptor_kind": kind,
                },
            )
            self.assertEqual(assessment["state"], "missing")
            self.assertEqual(assessment["origin_branch"], "required_slot_absent")
            self.assertEqual(assessment["slot_locators"], [])
            self.assertEqual(assessment["fact_locators"], [])
            self.assertEqual(assessment["axis_name"], axis_name)

            axis_positions = [
                index
                for index, axis in enumerate(comparison["axes"])
                if axis["axis"] == axis_name and axis["state"] == "missing"
            ]
            self.assertEqual(len(axis_positions), 1)
            axis_index = axis_positions[0]
            axis = comparison["axes"][axis_index]
            self.assertEqual(
                axis,
                {
                    "subject_ref": subject,
                    "binding": binding,
                    "axis": axis_name,
                    "state": "missing",
                    "original_refs": [],
                    "reason": MISSING_REASON,
                    "backflow_owner": "knowledge_owner",
                },
            )
            self.assertEqual(assessment["comparison_axis_indices"], [axis_index])
            self.assertEqual(assessment["original_axes"], [axis])

            finding_positions = [
                index
                for index, finding in enumerate(comparison["findings"])
                if finding["rule_ref"] == rule_ref
            ]
            self.assertEqual(len(finding_positions), 1)
            finding_index = finding_positions[0]
            finding = comparison["findings"][finding_index]
            self.assertEqual(
                finding,
                {
                    "code": code,
                    "rule_ref": rule_ref,
                    "subject_ref": subject,
                    "binding": binding,
                    "axis": axis_name,
                    "state": "missing",
                    "source_refs": [],
                    "reason": MISSING_REASON,
                    "backflow_owner": "knowledge_owner",
                },
            )
            self.assertEqual(assessment["comparison_finding_indices"], [finding_index])

            self.assertEqual(tuple(origin), ORIGIN_FIELDS)
            self.assertEqual(origin["ordinal"], ordinal)
            self.assertEqual(origin["assessment_key"], assessment["key"])
            self.assertEqual(origin["branch"], "required_slot_absent")
            self.assertEqual(origin["state"], "missing")
            self.assertEqual(origin["cause"], "required_slot_absent")
            self.assertEqual(origin["slot_locators"], [])
            self.assertEqual(origin["fact_locators"], [])
            self.assertEqual(origin["meaning_read_indices"], [])
            self.assertEqual(origin["applicability_read_indices"], [])
            self.assertEqual(
                origin["subject_ref"], {"presence": "supplied", "value": subject}
            )
            self.assertEqual(
                origin["binding"], {"presence": "supplied", "value": binding}
            )
            self.assertEqual(origin["axis_name"], axis_name)
            self.assertEqual(origin["original_refs"], [])
            self.assertEqual(origin["reason"], MISSING_REASON)
            self.assertEqual(origin["backflow_owner"], "knowledge_owner")
            self.assertEqual(origin["finding_rule_indices"], [failure_rule_index])
            self.assertEqual(
                origin["sort_source_refs"], {"presence": "supplied", "value": []}
            )
            self.assertEqual(origin["special_read_indices"], [])
            self.assertEqual(origin["pair_origin_links"], [])
            self.assertEqual(origin["applicability_judgment_links"], [])
            self.assertEqual(origin["meaning_support_links"], [])
            self.assertEqual(origin["meaning_problem_links"], [])
            self.assertEqual(origin["special_support_links"], [])

        self.assertEqual(walk["target_reads"][0]["state"], "resolved")
        self.assertEqual(walk["target_reads"][0]["matches"][0]["slot_locators"], [])
        self.assertEqual(
            [row["declaration"] for row in walk["target_reads"][0]["occurrences"]],
            owner_declarations,
        )
        self.assertEqual(validated["input"], raw_before)


if __name__ == "__main__":
    unittest.main()
