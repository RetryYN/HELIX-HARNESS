"""FN1 walkが未実装special source producerをempty成功へ丸めない境界を固定する。

入力sourceはfn0 qualifiedなsemantic_jsonとして追加し、
L5 /definition_meaning_core/special_source_producers のnative carrierを使う。
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import validate_supply_input
from identity_input_fixtures import _append_qualified_source
from supply_input_fixtures import base_input, load_document


BACKFLOW = "HELIXBRAIN-L6-032-N03-PATH"
DISPLAY_STOP = (
    "F01/F02/unclosed/definition_meaning_walk/display_special_ports; "
    f"Backflow {BACKFLOW}"
)
RELATION_STOP = (
    "F01/F02/unclosed/definition_meaning_walk/required_relation_special_ports; "
    f"Backflow {BACKFLOW}"
)


def _raw_with_native_carrier(carrier, value):
    raw = base_input(load_document())
    binding = copy.deepcopy(raw["binding"])
    source = _append_qualified_source(
        raw,
        identity=f"SYNTHETIC-FN4-WALK-{carrier.upper()}",
        owner=binding["knowledge_ref"]["owner"],
        scope=copy.deepcopy(binding["template_ref"]["scope"]),
        content={"binding": binding, carrier: copy.deepcopy(value)},
        qualification_identity=f"SYNTHETIC-FN4-WALK-{carrier.upper()}-Q",
        root_identity=f"SYNTHETIC-FN4-WALK-{carrier.upper()}-ROOT",
    )
    return raw, source


class TestDescriptorDefinitionWalkSpecialStops(unittest.TestCase):
    def _validated(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input"], raw_before, "setup: fn0 preserves the raw source entry")
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["unusable_source_refs"], [])
        return raw_before, validated, copy.deepcopy(validated)

    def _assert_walk_stop(self, raw, expected):
        raw_before, validated, validated_before = self._validated(raw)
        with self.assertRaises(NotImplementedError) as caught:
            evaluate_descriptor_definition_walk({"validated": validated})
        self.assertEqual(str(caught.exception), expected)
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)

    def test_qualified_display_groups_carrier_stops_at_unimplemented_port(self):
        """Supplied display carrier reaches its explicit unsupported native read boundary."""
        raw, source = _raw_with_native_carrier("descriptor_display_groups", [])
        self.assertEqual(source["content"]["descriptor_display_groups"], [])
        self._assert_walk_stop(raw, DISPLAY_STOP)

    def test_required_relation_entry_stops_at_unimplemented_port(self):
        """A raw native owner relation entry requests a read; malformed member stays unclosed."""
        raw, source = _raw_with_native_carrier("required_relations", [{}])
        self.assertEqual(source["content"]["required_relations"], [{}])
        self._assert_walk_stop(raw, RELATION_STOP)

    def test_empty_required_relation_carrier_adds_no_native_request(self):
        """An explicitly empty native carrier is a valid normal walk with zero request entries."""
        raw, source = _raw_with_native_carrier("required_relations", [])
        raw_before, validated, validated_before = self._validated(raw)
        walk = evaluate_descriptor_definition_walk({"validated": validated})
        self.assertEqual(set(walk), {"evaluation", "native_material", "target_reads", "intent_reads"})
        self.assertEqual(walk["evaluation"]["comparison"]["producer_symbol"], "compare_descriptor_definitions")
        self.assertTrue(walk["evaluation"]["comparison"]["axes"], "normal decoded input retains its existing axes")
        self.assertTrue(walk["native_material"]["meaning_reads"])
        self.assertTrue(all(
            read["acquisition_state"] == "unknown"
            for read in walk["native_material"]["meaning_reads"]
        ))
        self.assertEqual(walk["native_material"]["special_reads"], [])
        self.assertEqual(walk["target_reads"], [])
        self.assertEqual(walk["intent_reads"], [])
        self.assertEqual(source["content"]["required_relations"], [])
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)


if __name__ == "__main__":
    unittest.main()
