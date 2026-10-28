"""Direct L5 R105 projection checks for original partial Binding presence.

These tests call the required-dependency projector with the actual FN0 result.
They do not fabricate an FN1 Comparison; the expectations follow the L5
required-dependency missing-axis writer's subject fallback and raw-presence
trace contract.
"""

from __future__ import annotations

import copy
import json
import unittest

from dependency_missing_projection import project_required_dependency_missing_axis
from descriptor_definitions import validate_supply_input
from supply_input_fixtures import base_input, load_document


class TestDependencyMissingProjection(unittest.TestCase):
    def _validated(self, raw: dict) -> dict:
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(raw, raw_before)
        return validated

    def test_missing_root_knowledge_ref_uses_original_template_ref_and_keeps_presence(
        self,
    ) -> None:
        raw = base_input(load_document())
        raw["dependencies"]["always_refs"] = [
            ref
            for ref in raw["dependencies"]["always_refs"]
            if ref["identity"] != "HELIXBRAIN-L2-003"
        ]
        del raw["binding"]["knowledge_ref"]
        raw["dependencies"]["always_refs"].append(
            copy.deepcopy(raw["dependencies"]["always_refs"][0])
        )
        raw_before = copy.deepcopy(raw)
        validated = self._validated(raw)

        axes = project_required_dependency_missing_axis(
            validated, "always_refs", "HELIXBRAIN-L2-003"
        )

        self.assertEqual(len(axes), 1)
        axis = axes[0]
        self.assertEqual(
            list(axis),
            [
                "subject_ref",
                "binding",
                "axis",
                "state",
                "original_refs",
                "reason",
                "backflow_owner",
            ],
        )
        self.assertEqual(axis["subject_ref"], raw_before["binding"]["template_ref"])
        self.assertEqual(axis["binding"], raw_before["binding"])
        self.assertNotIn("knowledge_ref", axis["binding"])
        self.assertEqual(axis["axis"], "dependency_reference")
        self.assertEqual(axis["state"], "missing")
        self.assertEqual(
            axis["original_refs"], raw_before["dependencies"]["always_refs"]
        )
        self.assertEqual(axis["backflow_owner"], "knowledge_owner")

        prefix, trace_text = axis["reason"].split("\nTRACE=", 1)
        self.assertEqual(
            prefix,
            "必要identityに対応する原Refは当該categoryに未供給。他bodyで補償しない。",
        )
        trace = json.loads(trace_text)
        self.assertEqual(
            list(trace),
            [
                "format",
                "producer_symbol",
                "axis",
                "state",
                "subject_ref",
                "binding",
                "original_refs",
                "backflow_owner",
                "request_locator",
                "source_category_locator",
                "cause",
                "canonical_body_support",
                "handoff_record",
                "selection_observation",
            ],
        )
        self.assertEqual(trace["subject_ref"], raw_before["binding"]["template_ref"])
        self.assertEqual(trace["binding"], raw_before["binding"])
        self.assertNotIn("knowledge_ref", trace["binding"])
        self.assertEqual(
            trace["original_refs"], raw_before["dependencies"]["always_refs"]
        )
        self.assertEqual(trace["source_category_locator"], "/dependencies/always_refs")
        self.assertIsNone(trace["request_locator"])
        self.assertIsNone(trace["cause"])
        self.assertEqual(trace["canonical_body_support"], [])
        self.assertIsNone(trace["handoff_record"])
        self.assertIsNone(trace["selection_observation"])
        self.assertEqual(validated["input"], raw_before)

    def test_absent_root_subject_refs_do_not_form_a_typed_axis(self) -> None:
        raw = base_input(load_document())
        raw["dependencies"]["always_refs"] = [
            ref
            for ref in raw["dependencies"]["always_refs"]
            if ref["identity"] != "HELIXBRAIN-L2-003"
        ]
        del raw["binding"]["knowledge_ref"]
        del raw["binding"]["template_ref"]
        raw_before = copy.deepcopy(raw)
        validated = self._validated(raw)

        axes = project_required_dependency_missing_axis(
            validated, "always_refs", "HELIXBRAIN-L2-003"
        )

        self.assertEqual(axes, [])
        self.assertEqual(validated["input"], raw_before)

    def test_category_refs_keep_occurrences_and_absence_has_no_locator(self) -> None:
        present_raw = base_input(load_document())
        present_raw["dependencies"]["always_refs"] = [
            ref
            for ref in present_raw["dependencies"]["always_refs"]
            if ref["identity"] != "HELIXBRAIN-L2-003"
        ]
        present_raw["dependencies"]["always_refs"].append(
            copy.deepcopy(present_raw["dependencies"]["always_refs"][0])
        )
        present_before = copy.deepcopy(present_raw)
        present_validated = self._validated(present_raw)
        present_axes = project_required_dependency_missing_axis(
            present_validated, "always_refs", "HELIXBRAIN-L2-003"
        )

        self.assertEqual(len(present_axes), 1)
        self.assertEqual(
            present_axes[0]["original_refs"],
            present_before["dependencies"]["always_refs"],
        )
        self.assertEqual(
            json.loads(present_axes[0]["reason"].split("\nTRACE=", 1)[1])[
                "source_category_locator"
            ],
            "/dependencies/always_refs",
        )

        absent_raw = base_input(load_document())
        del absent_raw["dependencies"]["always_refs"]
        absent_before = copy.deepcopy(absent_raw)
        absent_validated = self._validated(absent_raw)
        absent_axes = project_required_dependency_missing_axis(
            absent_validated, "always_refs", "HELIXBRAIN-L2-003"
        )

        self.assertEqual(len(absent_axes), 1)
        self.assertEqual(absent_axes[0]["original_refs"], [])
        absent_trace = json.loads(absent_axes[0]["reason"].split("\nTRACE=", 1)[1])
        self.assertIsNone(absent_trace["source_category_locator"])
        self.assertEqual(absent_validated["input"], absent_before)


if __name__ == "__main__":
    unittest.main()
