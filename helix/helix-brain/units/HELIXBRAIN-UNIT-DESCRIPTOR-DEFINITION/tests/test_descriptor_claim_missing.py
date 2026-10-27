"""L5 canonical walk coverage for fill_definition claims over missing definitions.

The inputs use the real FN0 validator and the existing qualified Claim fixture.
Expected missing events come from the L4 evaluation populations and L5
event/serialization contracts; no public fn1 Comparison is supplied as an
oracle or used to construct the private walk result.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definitions import validate_supply_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_claim_input_fixtures import descriptor_claim_input


PRODUCER = "compare_descriptor_definitions"
MISSING_REASON = "必要なdescriptor slotが当該原Bindingに供給されていない。"
FACTS_MISSING_REASON = "原descriptor slotの意味factsが不足している。元presenceと所在を保持する。"
MISSING_RULE = "HELIXBRAIN-L5-032-R-descriptor_01_missing"


def _walk(raw: dict) -> tuple[dict, dict]:
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    if validated["input"] is None or validated["input_issues"] or validated["unusable_source_refs"]:
        raise AssertionError("setup: FN0 must accept the mutated raw input")
    if validated["input"] != raw_before:
        raise AssertionError("FN0 must retain the original raw presence and value")
    validated_before = copy.deepcopy(validated)
    result = evaluate_descriptor_definition_walk({"validated": validated})
    if raw != raw_before or validated != validated_before:
        raise AssertionError("the canonical walk must retain the same-call input")
    return validated, result


class TestDescriptorClaimMissing(unittest.TestCase):
    def test_claim_target_slot_absent_keeps_required_kind_missing_event(self) -> None:
        raw = descriptor_claim_input("positive")
        slot = raw["descriptors"][0]
        self.assertEqual(slot["descriptor_kind"], "template identity")
        slot_locator = "/descriptors/0"
        kind = slot["descriptor_kind"]
        binding = copy.deepcopy(raw["binding"])
        subject = copy.deepcopy(binding["knowledge_ref"])
        declaration = copy.deepcopy(raw["sources"][0]["content"]["descriptor_targets"][0])
        required_before = copy.deepcopy(raw["required_descriptor_kinds"])
        self.assertIn(kind, required_before)
        del raw["descriptors"][0]
        raw_before = copy.deepcopy(raw)

        validated, walk = _walk(raw)
        comparison = walk["evaluation"]["comparison"]
        self.assertEqual(comparison["producer_symbol"], PRODUCER)
        self.assertEqual(comparison["input_binding"], binding)
        self.assertEqual(raw["required_descriptor_kinds"], required_before)
        self.assertEqual(raw["sources"][0]["content"]["descriptor_targets"][0], declaration)
        self.assertEqual(validated["input"], raw_before)

        axis_rows = [
            (index, row) for index, row in enumerate(comparison["axes"])
            if row["axis"] == f"{kind}.definition" and row["state"] == "missing"
        ]
        self.assertEqual(len(axis_rows), 1)
        axis_index, axis = axis_rows[0]
        self.assertEqual(axis, {
            "subject_ref": subject,
            "binding": binding,
            "axis": "template identity.definition",
            "state": "missing",
            "original_refs": [],
            "reason": MISSING_REASON,
            "backflow_owner": "knowledge_owner",
        })

        assessment_rows = [
            row for row in walk["evaluation"]["assessments"]
            if row["axis_name"] == "template identity.definition"
            and row["origin_branch"] == "required_slot_absent"
        ]
        self.assertEqual(len(assessment_rows), 1)
        assessment = assessment_rows[0]
        self.assertEqual(assessment["state"], "missing")
        self.assertEqual(assessment["slot_locators"], [])
        self.assertEqual(assessment["fact_locators"], [])
        self.assertEqual(assessment["key"], {
            "binding": {"presence": "supplied", "value": binding},
            "slot_identity": {"presence": "absent"},
            "descriptor_kind": "template identity",
        })
        self.assertEqual(assessment["comparison_axis_indices"], [axis_index])
        self.assertEqual(assessment["original_axes"], [axis])

        findings = [row for row in comparison["findings"] if row["rule_ref"] == MISSING_RULE]
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0], {
            "code": "descriptor_01_missing",
            "rule_ref": MISSING_RULE,
            "subject_ref": subject,
            "binding": binding,
            "axis": "template identity.definition",
            "state": "missing",
            "source_refs": [],
            "reason": MISSING_REASON,
            "backflow_owner": "knowledge_owner",
        })
        finding_index = comparison["findings"].index(findings[0])
        self.assertEqual(assessment["comparison_finding_indices"], [finding_index])

        self.assertEqual(len(walk["target_reads"]), 1)
        target = walk["target_reads"][0]
        self.assertEqual(target["state"], "resolved")
        self.assertEqual(target["matches"][0]["declaration_locators"], [
            "/sources/0/content/descriptor_targets/0",
        ])
        self.assertEqual(target["matches"][0]["slot_locators"], [])

    def test_existing_slot_with_empty_facts_is_missing_without_slot_finding(self) -> None:
        raw = descriptor_claim_input("positive")
        slot = raw["descriptors"][0]
        slot_locator = "/descriptors/0"
        kind = slot["descriptor_kind"]
        binding = copy.deepcopy(slot["binding"])
        subject = copy.deepcopy(binding["knowledge_ref"])
        slot_identity = slot["slot_identity"]
        slot["facts"] = []
        raw_before = copy.deepcopy(raw)

        validated, walk = _walk(raw)
        comparison = walk["evaluation"]["comparison"]
        self.assertEqual(validated["input"], raw_before)

        axes = [row for row in comparison["axes"] if row["axis"] == f"{kind}.definition"]
        self.assertEqual(len(axes), 1)
        axis = axes[0]
        self.assertEqual(axis, {
            "subject_ref": subject,
            "binding": binding,
            "axis": "template identity.definition",
            "state": "missing",
            "original_refs": [],
            "reason": FACTS_MISSING_REASON,
            "backflow_owner": binding["knowledge_ref"]["owner"],
        })
        self.assertFalse(any(row["rule_ref"] == MISSING_RULE for row in comparison["findings"]))

        assessments = [
            row for row in walk["evaluation"]["assessments"]
            if row["axis_name"] == "template identity.definition"
            and row["origin_branch"] == "facts_missing"
        ]
        self.assertEqual(len(assessments), 1)
        assessment = assessments[0]
        self.assertEqual(assessment["state"], "missing")
        self.assertEqual(assessment["slot_locators"], [slot_locator])
        self.assertEqual(assessment["fact_locators"], [])
        self.assertEqual(assessment["key"], {
            "binding": {"presence": "supplied", "value": binding},
            "slot_identity": {"presence": "supplied", "value": slot_identity},
            "descriptor_kind": "template identity",
        })
        self.assertEqual(assessment["comparison_axis_indices"], [
            next(i for i, candidate in enumerate(comparison["axes"]) if candidate == axis),
        ])

        self.assertEqual(len(walk["target_reads"]), 1)
        target = walk["target_reads"][0]
        self.assertEqual(target["state"], "resolved")
        self.assertEqual(target["matches"][0]["slot_locators"], [slot_locator])
        self.assertEqual(
            [row["slot_locator"] for row in walk["native_material"]["pair_reads"]].count(slot_locator),
            1,
        )
        pair_row = next(
            row for row in walk["native_material"]["pair_reads"]
            if row["slot_locator"] == slot_locator
        )
        self.assertEqual(pair_row["result"], {"axes": [], "origins": []})
        self.assertEqual(
            [row["slot_locator"] for row in walk["native_material"]["applicability_reads"]].count(slot_locator),
            1,
        )
        self.assertEqual(
            [row["slot_locator"] for row in walk["native_material"]["applicability_judgment_batches"]].count(slot_locator),
            1,
        )

    def test_fn0_preserves_absent_and_null_facts_presence_for_slot_walk(self) -> None:
        for presence in ("absent", "null"):
            with self.subTest(presence=presence):
                raw = descriptor_claim_input("positive")
                slot = raw["descriptors"][0]
                slot_locator = "/descriptors/0"
                slot_identity = slot["slot_identity"]
                binding = copy.deepcopy(slot["binding"])
                if presence == "absent":
                    del slot["facts"]
                else:
                    slot["facts"] = None
                raw_before = copy.deepcopy(raw)

                validated, walk = _walk(raw)
                self.assertEqual(validated["input"], raw_before)
                self.assertEqual(
                    (
                        "facts" in validated["input"]["descriptors"][0],
                        validated["input"]["descriptors"][0].get("facts"),
                    ),
                    (presence != "absent", None),
                )
                matching = [
                    row for row in walk["evaluation"]["assessments"]
                    if row["axis_name"] == "template identity.definition"
                    and row["origin_branch"] == "facts_missing"
                ]
                self.assertEqual(len(matching), 1)
                assessment = matching[0]
                self.assertEqual(assessment["state"], "missing")
                self.assertEqual(assessment["key"]["slot_identity"], {
                    "presence": "supplied", "value": slot_identity,
                })
                self.assertEqual(assessment["key"]["binding"], {
                    "presence": "supplied", "value": binding,
                })
                self.assertEqual(assessment["slot_locators"], [slot_locator])
                self.assertEqual(assessment["fact_locators"], [])


if __name__ == "__main__":
    unittest.main()
