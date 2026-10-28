"""FN4 R4のnative reader境界を正規入力で確かめる。

L4 /definition_meaning_resolution_contract/readers/1 とL5
/source_return_contract/descriptor_target_dataflow/definition_meaning_core/
basic_reader_bindings/applicability は、absent requestをnot_requestedとし、
meaning readerは同じfact sourceに対応するprovenance出現だけを解決する。
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definition_reads import (
    read_original_definition_applicability,
)
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import validate_supply_input
from identity_input_fixtures import trace_input
from supply_input_fixtures import base_input, load_document


class TestDescriptorReadBoundaries(unittest.TestCase):
    def test_absent_applicability_request_is_not_requested_in_native_reader(self):
        """L5 applicability acquisition: slot原memberのabsenceをそのまま読む。"""
        raw = base_input(load_document())
        slot_index = 0
        slot = raw["descriptors"][slot_index]
        slot.pop("definition_applicability_ref")
        raw_before = copy.deepcopy(raw)

        validated = validate_supply_input(raw)
        self.assertIsInstance(
            validated["input"], dict, "setup: fn0 decodes this raw snapshot"
        )
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        validated_before = copy.deepcopy(validated)

        # Existing public fn1 structural guard currently requires the member in
        # its closed DescriptorSlot. This test therefore exercises the native
        # request directly with the same fn0 ValidatedSupply; it does not claim
        # that the current whole walk admits this slot shape.
        read = read_original_definition_applicability(
            validated, {"slot_locator": f"/descriptors/{slot_index}"}
        )

        self.assertEqual(
            set(read),
            {
                "slot_locator",
                "request",
                "acquisition_state",
                "source_occurrences",
                "supports",
                "problems",
            },
        )
        self.assertEqual(read["slot_locator"], f"/descriptors/{slot_index}")
        self.assertEqual(read["request"], {"presence": "absent"})
        self.assertEqual(read["acquisition_state"], "not_requested")
        self.assertEqual(read["source_occurrences"], [])
        self.assertEqual(read["supports"], [])
        self.assertEqual(read["problems"], [])
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)

    def test_unrelated_knowledge_provenance_does_not_change_meaning_reads(self):
        """L5 meaning reader:別source provenanceは対象factのreadに混ぜない。"""
        baseline_raw = trace_input()
        added_raw = copy.deepcopy(baseline_raw)
        source_ref = added_raw["sources"][0]["ref"]
        unrelated_source_ref = added_raw["sources"][1]["ref"]
        self.assertNotEqual(source_ref["identity"], unrelated_source_ref["identity"])

        binding_knowledge_ref = added_raw["binding"]["knowledge_ref"]
        records = [
            row
            for row in added_raw["knowledge_records"]
            if row.get("ref") == binding_knowledge_ref
        ]
        self.assertEqual(
            len(records), 1, "setup: one KnowledgeRecord owns the raw Binding"
        )
        record = records[0]
        self.assertFalse(
            any(
                ref.get("identity") == unrelated_source_ref["identity"]
                for ref in record["provenance_refs"]
            )
        )
        record["provenance_refs"].append(copy.deepcopy(unrelated_source_ref))

        baseline_before = copy.deepcopy(baseline_raw)
        added_before = copy.deepcopy(added_raw)
        baseline_validated = validate_supply_input(baseline_raw)
        added_validated = validate_supply_input(added_raw)
        for validated, expected in (
            (baseline_validated, baseline_before),
            (added_validated, added_before),
        ):
            self.assertIsInstance(
                validated["input"], dict, "setup: fn0 decodes the provenance input"
            )
            self.assertEqual(validated["input"], expected)
            self.assertEqual(validated["input_issues"], [])
            self.assertEqual(validated["unusable_source_refs"], [])

        baseline_before_read = copy.deepcopy(baseline_validated)
        added_before_read = copy.deepcopy(added_validated)
        baseline_walk = evaluate_descriptor_definition_walk(
            {"validated": baseline_validated}
        )
        added_walk = evaluate_descriptor_definition_walk({"validated": added_validated})

        baseline_reads = baseline_walk["native_material"]["meaning_reads"]
        added_reads = added_walk["native_material"]["meaning_reads"]
        self.assertEqual(
            len(baseline_reads), 15, "setup: the base trace input has 15 actual facts"
        )
        self.assertEqual(added_reads, baseline_reads)
        self.assertTrue(all(read["problems"] for read in baseline_reads))
        self.assertTrue(
            all(
                all(problem["source_index"] == 0 for problem in read["problems"])
                for read in baseline_reads
            )
        )
        self.assertEqual(baseline_raw, baseline_before)
        self.assertEqual(added_raw, added_before)
        self.assertEqual(baseline_validated, baseline_before_read)
        self.assertEqual(added_validated, added_before_read)


if __name__ == "__main__":
    unittest.main()
