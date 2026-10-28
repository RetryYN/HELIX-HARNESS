"""L5の固定kind訪問順と原slot locatorを独立に確かめる。"""

import copy
import json
from pathlib import Path
import unittest

from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import validate_supply_input
from identity_input_fixtures import normal_input


class TestDescriptorDefinitionWalkOrder(unittest.TestCase):
    def test_reversed_slots_keep_canonical_kind_events_and_original_locators(self):
        document = json.loads(
            (
                Path(__file__).resolve().parents[5]
                / "docs/helix-brain/L4-basic-design/template-semantic-supply.json"
            ).read_text()
        )
        kinds = [
            entry["value"]["descriptor"]
            for entry in document["definition_meaning_resolution_contract"][
                "normative_basis_snapshot"
            ]["entries"]
        ]
        raw = normal_input()
        raw["descriptors"].reverse()
        before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input_issues"], [])
        validated_before = copy.deepcopy(validated)
        walk = evaluate_descriptor_definition_walk({"validated": validated})
        origins = walk["native_material"]["judgment_origins"]
        visited = []
        for origin in origins:
            kind = origin["assessment_key"]["descriptor_kind"]
            if not visited or visited[-1] != kind:
                visited.append(kind)
            slot_locator = origin["slot_locators"][0]
            prefix, index = slot_locator.rsplit("/", 1)
            self.assertEqual(prefix, "/descriptors")
            self.assertEqual(raw["descriptors"][int(index)]["descriptor_kind"], kind)
        self.assertEqual(
            visited, kinds, "L5 event_order_completion: frame内は固定kind順"
        )
        self.assertEqual(raw, before)
        self.assertEqual(validated, validated_before)


if __name__ == "__main__":
    unittest.main()
