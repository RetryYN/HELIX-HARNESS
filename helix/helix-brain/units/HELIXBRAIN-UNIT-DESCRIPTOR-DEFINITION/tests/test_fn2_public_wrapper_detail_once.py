"""L5 direct wrapper contract for public FN2.

Expected behavior is derived from L5
``/source_return_contract/descriptor_target_dataflow/direct_wrappers/fn2`` and
``/functions/2/private_detail_binding``: pass
the same validated snapshot to one F03 detail evaluation and return only its
comparison through the existing fieldwise public projection.
"""

from __future__ import annotations

import copy
import unittest
from unittest import mock

import descriptor_definitions
import values_applicability
from descriptor_definitions import (
    compare_descriptor_definitions,
    compare_values_and_applicability,
    validate_supply_input,
)
from supply_input_fixtures import base_input, load_document


AXIS_FIELDS = (
    "subject_ref",
    "binding",
    "axis",
    "state",
    "original_refs",
    "reason",
    "backflow_owner",
)
FINDING_FIELDS = (
    "code",
    "rule_ref",
    "subject_ref",
    "binding",
    "axis",
    "state",
    "source_refs",
    "reason",
    "backflow_owner",
)


def _public_comparison_projection(private_comparison: dict) -> dict:
    """Derive the L5 fieldwise projection without calling the production writer."""
    return {
        "axes": [
            {name: copy.deepcopy(axis[name]) for name in AXIS_FIELDS}
            for axis in private_comparison["axes"]
        ],
        "findings": [
            {name: copy.deepcopy(row[name]) for name in FINDING_FIELDS}
            for row in private_comparison["findings"]
        ],
        "producer_symbol": copy.deepcopy(private_comparison["producer_symbol"]),
        "input_binding": copy.deepcopy(private_comparison["input_binding"]),
    }


def _private_comparison_input(comparison: dict) -> dict:
    """Derive the L5 input-side F03 comparison fieldwise, without production code."""
    return {
        "axes": [
            {name: copy.deepcopy(axis[name]) for name in AXIS_FIELDS}
            for axis in comparison["axes"]
        ],
        "findings": [
            {name: copy.deepcopy(row[name]) for name in FINDING_FIELDS}
            for row in comparison["findings"]
        ],
        "producer_symbol": copy.deepcopy(comparison["producer_symbol"]),
        "input_binding": copy.deepcopy(comparison["input_binding"]),
    }


class TestFN2PublicWrapperDetailOnce(unittest.TestCase):
    def test_fn2_passes_same_snapshot_once_and_projects_only_comparison(self):
        raw = base_input(load_document())
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], raw_before)

        definitions = compare_descriptor_definitions({"validated": validated})
        self.assertEqual(
            definitions["producer_symbol"], "compare_descriptor_definitions"
        )
        self.assertEqual(definitions["input_binding"], raw_before["binding"])

        expected_context = {
            "snapshot": validated,
            "definitions": _private_comparison_input(definitions),
        }
        expected_detail = values_applicability.evaluate_field_values_detail(
            expected_context
        )
        expected_public = _public_comparison_projection(expected_detail["comparison"])
        expected_context_before = copy.deepcopy(expected_context)

        with mock.patch.object(
            descriptor_definitions,
            "_evaluate_field_values_detail",
            wraps=descriptor_definitions._evaluate_field_values_detail,
        ) as detail_spy:
            result = compare_values_and_applicability(
                {"validated": validated, "definitions": definitions}
            )

        self.assertEqual(detail_spy.call_count, 1)
        detail_context = detail_spy.call_args.args[0]
        self.assertIs(detail_context["snapshot"], validated)
        self.assertEqual(detail_context, expected_context_before)
        self.assertEqual(result, expected_public)
        self.assertEqual(
            set(result), {"axes", "findings", "producer_symbol", "input_binding"}
        )
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated["input"], raw_before)


if __name__ == "__main__":
    unittest.main()
