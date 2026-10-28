"""Independent L4 population checks for raw-distinct, comparable Bindings."""

from __future__ import annotations

import copy
import unittest

from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import _binding_same, _ref_same, validate_supply_input
from test_descriptor_definition_walk_population_stops import (
    _distinct_root_slot_raw,
)


REQUIRED_KINDS = [
    "template identity",
    "version",
    "layer/pair",
    "applicability",
    "required input",
    "required section",
    "required field",
    "relation",
    "意味owner",
    "trace",
    "negative oracle",
    "measurement",
    "completion",
    "downstream kind",
    "supersession",
]
MISSING_REASON = "必要なdescriptor slotが当該原Bindingに供給されていない。"


class TestDescriptorWalkRawDistinctFrames(unittest.TestCase):
    def test_root_contract_and_original_slot_frame_both_keep_raw_values_and_links(self):
        """Root obligations and source slots remain separate across candidate variants."""
        for candidate_present in (False, True):
            with self.subTest(candidate_present=candidate_present):
                raw = _distinct_root_slot_raw(candidate_present)
                raw_before = copy.deepcopy(raw)
                validated = validate_supply_input(raw)
                self.assertIsInstance(validated["input"], dict)
                self.assertEqual(validated["input_issues"], [])
                self.assertEqual(validated["input"], raw_before)

                root_binding = raw_before["binding"]
                slot_binding = raw_before["descriptors"][0]["binding"]
                root_ref = root_binding["template_ref"]
                slot_ref = slot_binding["template_ref"]
                self.assertTrue(_binding_same(root_binding, slot_binding))
                self.assertNotEqual(root_binding, slot_binding)
                self.assertNotEqual(root_ref["sha256"], slot_ref["sha256"])
                if candidate_present:
                    candidate = raw_before["candidates"][0]
                    self.assertFalse(_ref_same(candidate, root_ref))
                    self.assertTrue(_ref_same(candidate, slot_ref))
                else:
                    self.assertEqual(raw_before["candidates"], [])

                walk = evaluate_descriptor_definition_walk({"validated": validated})
                comparison = walk["evaluation"]["comparison"]
                axes = comparison["axes"]
                findings = comparison["findings"]
                assessments = walk["evaluation"]["assessments"]
                origins = walk["native_material"]["judgment_origins"]

                self.assertEqual(raw, raw_before)
                self.assertEqual(validated["input"], raw_before)
                self.assertEqual(walk["target_reads"], [])
                self.assertEqual(walk["intent_reads"], [])
                self.assertEqual(
                    raw_before["required_descriptor_kinds"], REQUIRED_KINDS
                )

                root_missing = [
                    axis
                    for axis in axes
                    if axis["state"] == "missing"
                    and axis["axis"].endswith(".definition")
                    and axis["binding"] == root_binding
                ]
                self.assertEqual(len(root_missing), len(REQUIRED_KINDS))
                self.assertEqual(
                    {axis["axis"] for axis in root_missing},
                    {f"{kind}.definition" for kind in REQUIRED_KINDS},
                )
                for axis in root_missing:
                    self.assertEqual(axis["subject_ref"], root_binding["knowledge_ref"])
                    self.assertEqual(axis["original_refs"], [])
                    self.assertEqual(axis["reason"], MISSING_REASON)
                    self.assertEqual(axis["backflow_owner"], "knowledge_owner")

                self.assertEqual(
                    {finding["code"] for finding in findings},
                    {f"descriptor_{index:02d}_missing" for index in range(1, 16)},
                )
                self.assertEqual(
                    len(axes), len(REQUIRED_KINDS) + 3 * len(raw_before["descriptors"])
                )
                self.assertEqual(len(assessments), len(axes))
                self.assertEqual(len(origins), len(assessments))

                # The root's canonical no-slot events come first; the 15 raw
                # slot/fact occurrences then retain their original locators.
                self.assertEqual(
                    [origin["cause"] for origin in origins[:15]],
                    ["required_slot_absent"] * 15,
                )
                self.assertEqual(
                    [origin["axis_name"] for origin in origins[:15]],
                    [f"{kind}.definition" for kind in REQUIRED_KINDS],
                )
                expected_fact_locators = [
                    f"/descriptors/{slot_index}/facts/{fact_index}"
                    for slot_index, slot in enumerate(raw_before["descriptors"])
                    for fact_index, _fact in enumerate(slot["facts"])
                ]
                self.assertEqual(
                    [
                        read["fact_locator"]
                        for read in walk["native_material"]["meaning_reads"]
                    ],
                    expected_fact_locators,
                )
                for slot_index, slot in enumerate(raw_before["descriptors"]):
                    locator = f"/descriptors/{slot_index}"
                    slot_origins = [
                        origin
                        for origin in origins
                        if locator in origin["slot_locators"]
                    ]
                    self.assertEqual(len(slot_origins), 3)
                    self.assertTrue(
                        all(
                            origin["binding"]["value"] == slot["binding"]
                            for origin in slot_origins
                        )
                    )
                    expected_kind = slot["descriptor_kind"]
                    self.assertEqual(
                        [origin["axis_name"] for origin in slot_origins],
                        [
                            "descriptor.attribution",
                            f"{expected_kind}.definition",
                            f"{expected_kind}.definition_applicability",
                        ],
                    )
                    self.assertEqual(
                        [origin["fact_locators"] for origin in slot_origins],
                        [[f"{locator}/facts/0"], [f"{locator}/facts/0"], []],
                    )

                # Every native assessment keeps a one-to-one link to the
                # final sorted public axes/findings; no candidate Binding is
                # synthesized into the output.
                for ordinal, (assessment, origin) in enumerate(
                    zip(assessments, origins)
                ):
                    self.assertEqual(origin["ordinal"], ordinal)
                    indices = assessment["comparison_axis_indices"]
                    self.assertEqual(len(indices), 1)
                    self.assertEqual(assessment["original_axes"], [axes[indices[0]]])
                    self.assertTrue(
                        all(
                            0 <= index < len(findings)
                            for index in assessment["comparison_finding_indices"]
                        )
                    )
                    if ordinal < 15:
                        kind = REQUIRED_KINDS[ordinal]
                        self.assertEqual(
                            len(assessment["comparison_finding_indices"]), 1
                        )
                        finding = findings[assessment["comparison_finding_indices"][0]]
                        self.assertEqual(
                            finding["code"], f"descriptor_{ordinal + 1:02d}_missing"
                        )
                        self.assertEqual(
                            finding["rule_ref"],
                            f"HELIXBRAIN-L5-032-R-descriptor_{ordinal + 1:02d}_missing",
                        )
                        self.assertEqual(
                            finding["subject_ref"], root_binding["knowledge_ref"]
                        )
                        self.assertEqual(finding["binding"], root_binding)
                        self.assertEqual(finding["axis"], f"{kind}.definition")
                        self.assertEqual(finding["state"], "missing")
                        self.assertEqual(finding["source_refs"], [])
                        self.assertEqual(finding["reason"], MISSING_REASON)
                        self.assertEqual(finding["backflow_owner"], "knowledge_owner")
                    else:
                        self.assertEqual(assessment["comparison_finding_indices"], [])
                for axis in axes:
                    self.assertIn(axis["binding"], (root_binding, slot_binding))
