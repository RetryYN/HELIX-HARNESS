"""FN1 root/explicit-candidate frame boundary under raw Binding differences.

Raw-distinct frame expectations are independently asserted in
``test_descriptor_walk_raw_distinct_frames`` from L4
``/definition_meaning_resolution_contract/evaluation_populations`` and the
L5 ``definition_meaning_core/event_and_field_contract/single_walk_algorithm_candidate/1``.
This file retains exact-root and unrelated-candidate controls.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import validate_supply_input
from supply_input_fixtures import base_input, load_document


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
