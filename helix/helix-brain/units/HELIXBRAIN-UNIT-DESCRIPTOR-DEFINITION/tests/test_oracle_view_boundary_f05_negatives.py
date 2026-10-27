"""F05-NEG-01/02の同call未対応claim境界を固定する。

これらはpredicate実装のRed/Greenではない。L8で定義された実入力から
現canonical FN1 walkが返す未対応IDを観測し、fn1のmissingと入力保持を
確かめる境界テストである。
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definitions import (
    compare_descriptor_definitions,
    compare_identity_versions_and_trace,
    compare_oracle_and_view_boundary,
    validate_supply_input,
)


EXPECTED_WALK_STOP = (
    "F05/F06/unclosed/oracle_claim_ports; owner=knowledge_owner; "
    "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
)


class TestOracleViewBoundaryF05Negatives(unittest.TestCase):
    def _assert_f05_negative_stops_at_unimplemented_claim_walk(
        self, slot_index, kind, expected_missing_code, target_identity
    ):
        # Reuse the existing L8-derived input builder. Its setUp only loads
        # fixture material; this test does not invoke its fn1 test method.
        from test_descriptor_definitions import TestDescriptorDefinitions

        builder = TestDescriptorDefinitions(
            "test_f05_neg01_and_neg02_fn1_prerequisite_measurement_and_completion_missing"
        )
        builder.setUp()
        raw = builder._f05_view_repair_input(slot_index, kind, target_identity)
        raw_before = copy.deepcopy(raw)

        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"], "setup: L8-derived input must decode")
        self.assertEqual(validated["input"], raw_before)
        added_sources = raw["sources"][len(builder.base["sources"]):]
        for source in added_sources:
            self.assertNotIn(source["ref"], validated["unusable_source_refs"])
        validated_before = copy.deepcopy(validated)

        definitions = compare_descriptor_definitions({"validated": validated})
        self.assertEqual(definitions["producer_symbol"], "compare_descriptor_definitions")
        self.assertEqual(definitions["input_binding"], raw_before["binding"])
        missing = [row for row in definitions["findings"] if row["code"] == expected_missing_code]
        self.assertEqual(len(missing), 1)
        self.assertEqual(missing[0]["axis"], f"{kind}.definition")
        self.assertEqual(missing[0]["state"], "missing")

        identity_trace = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(identity_trace["producer_symbol"], "compare_identity_versions_and_trace")
        self.assertEqual(identity_trace["input_binding"], raw_before["binding"])
        context = {
            "validated": validated,
            "definitions": definitions,
            "identity_trace": identity_trace,
        }
        context_before = copy.deepcopy(context)

        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary(context)
        self.assertEqual(str(caught.exception), EXPECTED_WALK_STOP)
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(context, context_before)

    def test_f05_neg01_view_measurement_repair_keeps_fn1_missing_and_stops_at_walk_id(self):
        self._assert_f05_negative_stops_at_unimplemented_claim_walk(
            11,
            "measurement",
            "descriptor_12_missing",
            "SYNTHETIC-OWNER-MEASUREMENT-TARGET-A",
        )

    def test_f05_neg02_view_completion_repair_keeps_fn1_missing_and_stops_at_walk_id(self):
        self._assert_f05_negative_stops_at_unimplemented_claim_walk(
            12,
            "completion",
            "descriptor_13_missing",
            "SYNTHETIC-OWNER-COMPLETION-TARGET-A",
        )


if __name__ == "__main__":
    unittest.main()
