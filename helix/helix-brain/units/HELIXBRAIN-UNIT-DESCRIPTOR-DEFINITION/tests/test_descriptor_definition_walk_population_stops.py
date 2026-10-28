"""FN1 root/explicit-candidate frame boundary under raw Binding differences.

The reachable non-transitive Ref case is derived from L4
``/definition_meaning_resolution_contract/evaluation_populations`` and the
L5 ``definition_meaning_core/event_and_field_contract/single_walk_algorithm_candidate/1``.
These tests fix only the admitted stop and metamorphic controls; they do not
goldenize the full canonical walk.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import _binding_same, _ref_same, validate_supply_input
from supply_input_fixtures import base_input, load_document


BACKFLOW = "Backflow HELIXBRAIN-L6-032-N03-PATH"
RAW_DISTINCT_FRAME_STOP = (
    "F01/F02/unclosed/definition_meaning_walk/raw_distinct_binding_frames; " + BACKFLOW
)


def _normal_raw():
    return base_input(load_document())


def _distinct_root_slot_raw(candidate_present: bool):
    raw = _normal_raw()
    root_template = raw["binding"]["template_ref"]
    root_template["sha256"] = "a" * 64

    for slot in raw["descriptors"]:
        slot["binding"]["template_ref"]["sha256"] = None
        for fact in slot["facts"]:
            fact["binding"]["template_ref"]["sha256"] = None

    if candidate_present:
        candidate = copy.deepcopy(root_template)
        candidate["sha256"] = "b" * 64
        raw["candidates"] = [candidate]
    else:
        raw["candidates"] = []
    return raw


def _walk(raw):
    validated = validate_supply_input(raw)
    if validated["input"] is None or validated["input_issues"]:
        raise AssertionError(
            "setup: the selected typed input must decode with no issues"
        )
    return evaluate_descriptor_definition_walk({"validated": validated})


class TestDescriptorDefinitionWalkPopulationStops(unittest.TestCase):
    def _assert_raw_distinct_stop(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsInstance(
            validated["input"], dict, "setup: fn0 accepts the typed input"
        )
        self.assertEqual(validated["input_issues"], [])

        root_template = raw["binding"]["template_ref"]
        slot_template = raw["descriptors"][0]["binding"]["template_ref"]
        candidate = raw["candidates"][0] if raw["candidates"] else None
        if candidate is not None:
            self.assertFalse(_ref_same(candidate, root_template))
            self.assertTrue(_ref_same(candidate, slot_template))
        self.assertNotEqual(raw["descriptors"][0]["binding"], raw["binding"])
        self.assertTrue(_binding_same(raw["descriptors"][0]["binding"], raw["binding"]))
        # Existing fn1 guard admits this partial-Ref equality; the stop belongs
        # to the canonical frame population boundary, not a new input gate.
        from definition_comparison import _fn1_scope_guard

        _fn1_scope_guard(validated["input"], validated["input"]["binding"])
        with self.assertRaises(NotImplementedError) as caught:
            evaluate_descriptor_definition_walk({"validated": validated})
        self.assertEqual(str(caught.exception), RAW_DISTINCT_FRAME_STOP)
        self.assertEqual(raw, raw_before)

    def test_root_candidate_reaching_partial_slot_binding_stops_with_frame_id(self):
        """Candidate B matches a slot's null-SHA Ref but differs from root SHA A."""
        self._assert_raw_distinct_stop(_distinct_root_slot_raw(candidate_present=True))

    def test_root_binding_is_not_dropped_when_candidate_filter_is_empty(self):
        """The root contract remains in scope even when candidates is explicitly empty."""
        self._assert_raw_distinct_stop(_distinct_root_slot_raw(candidate_present=False))

    def test_exact_root_candidate_keeps_the_same_root_frame(self):
        """An exact-root candidate is a duplicate selector, not a new frame."""
        raw = _normal_raw()
        raw["candidates"] = [copy.deepcopy(raw["binding"]["template_ref"])]
        baseline = _walk(_normal_raw())
        selected = _walk(raw)
        self.assertEqual(selected["evaluation"], baseline["evaluation"])
        self.assertEqual(selected["native_material"], baseline["native_material"])

    def test_unrelated_candidate_does_not_add_a_contract_frame(self):
        """An unmatched typed Ref is not an explicit candidate for these frames."""
        raw = _normal_raw()
        unrelated = copy.deepcopy(raw["binding"]["template_ref"])
        unrelated["identity"] = "SYNTHETIC-UNRELATED-TEMPLATE"
        unrelated["revision"] = "synthetic-unrelated-revision"
        raw["candidates"] = [unrelated]
        baseline = _walk(_normal_raw())
        selected = _walk(raw)
        self.assertEqual(selected["evaluation"], baseline["evaluation"])
        self.assertEqual(selected["native_material"], baseline["native_material"])


if __name__ == "__main__":
    unittest.main()
