"""Keep only the explicit empty meaning carrier in G5's zero-occurrence branch.

L4 /oracle_view_boundary_contract/nonfire_read_plan/typed_kind_census permits
absent or [] for zero occurrences and keeps null/type-outside/nonempty outside
that finite branch. L5 /source_return_contract/descriptor_target_dataflow/
definition_meaning_core/basic_reader_bindings/meaning/body/algorithm leaves
those supplied carriers on the existing unclosed reader path. Each case uses
FN0-qualified source bytes, qualification, provenance, and fact refs.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definition_reads import read_original_definition_meaning_bundle
from test_descriptor_empty_meaning_carrier import (
    BACKFLOW,
    MEANING_REQUEST,
    _trace_raw_with_carrier,
    _typed_nonempty_operation,
    _validate,
)


EXPECTED_STOP = (
    "F01/F02/unclosed/definition_meaning_operations_unclosed: "
    "a supplied definition_meaning_operations carrier is outside the implemented reader path; "
    f"Backflow {BACKFLOW}"
)


class TestDescriptorMeaningCarrierWrongShapes(unittest.TestCase):
    def test_supplied_nonempty_or_wrong_shape_carriers_keep_the_unclosed_stop(self):
        carriers = (
            ("null", None),
            ("false", False),
            ("zero", 0),
            ("empty_string", ""),
            ("object", {}),
            ("nonempty_array", "build_from_raw"),
        )
        for label, candidate in carriers:
            with self.subTest(carrier=label):
                if label == "nonempty_array":
                    seed = _trace_raw_with_carrier([], supplied=True)
                    candidate = [_typed_nonempty_operation(seed)]
                raw = _trace_raw_with_carrier(candidate, supplied=True)
                raw_before = copy.deepcopy(raw)
                self.assertIn(
                    "definition_meaning_operations", raw["sources"][0]["content"]
                )
                self.assertEqual(
                    raw["sources"][0]["content"]["definition_meaning_operations"],
                    candidate,
                )
                validated = _validate(raw)
                validated_before = copy.deepcopy(validated)

                try:
                    read_original_definition_meaning_bundle(validated, MEANING_REQUEST)
                except Exception as caught:
                    self.assertIsInstance(caught, NotImplementedError)
                    self.assertEqual(str(caught), EXPECTED_STOP)
                else:
                    self.fail(f"expected the existing unclosed reader stop for {label}")

                self.assertEqual(raw, raw_before)
                self.assertEqual(validated, validated_before)
                self.assertEqual(validated["input"], raw_before)


if __name__ == "__main__":
    unittest.main()
