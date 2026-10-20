# -*- coding: utf-8 -*-
"""HELIXBRAIN L5-032 validate_supply_input (fn0) decode test proposal.

Calls the existing public validator directly:
    validate_supply_input(raw) -> ValidatedSupply

Cases from L8 template-semantic-supply.json:
    * NORMAL-validate_supply_input (complete synthetic input decodes)
    * ADD-01 raw-input-shape-invalid (non-dict input is rejected into
      an InputIssue, not silently coerced)
    * ADD-02 semantic-null-through (a decodable slot carrying
      meaning=null stays present; null is not hidden as a shape error)

Static proposal only: not executed in this lane. No stub, mock or
new helper; stdlib + dict only. Input documents must not be mutated
by the validator.
"""

import copy
import json
from pathlib import Path
import unittest

from descriptor_definitions import validate_supply_input

REPOSITORY = Path(__file__).resolve().parents[5]
L8_PATH = REPOSITORY / "docs/helix-brain/L8-unit-verification/template-semantic-supply.json"

# 独立test basis: L5 /functions/0, /type_contract/types/{ValidatedSupply,InputIssue};
# L8 /function_oracles/0, /additional_unit_cases/{0,1}。未凍結・未実行。
# fn0局所decodeだけの部分oracle。資格検証の完成/F02のRed/全IO0は認定しない。


def load_document():
    with open(L8_PATH, "rb") as fh:
        return json.loads(fh.read().decode("utf-8"))


def base_input(document):
    return copy.deepcopy(
        document["fixture_contract"]["normal_control"]["input"]
    )


class TestSupplyInput(unittest.TestCase):
    def test_normal_input_decodes_all_fields(self):
        raw = base_input(load_document())
        snapshot = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsInstance(validated, dict)
        self.assertIsNotNone(validated["input"])
        self.assertEqual(validated["input"]["descriptors"][6]
                         ["slot_identity"], "synthetic-descriptor-7")
        self.assertEqual(len(validated["input"]["descriptors"]), 15)
        self.assertEqual(
            validated["input"]["required_descriptor_kinds"],
            raw["required_descriptor_kinds"],
        )
        self.assertEqual(validated["input"], snapshot, "all decoded logical fields are preserved")
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(raw, snapshot, "validator must not mutate input")

    def test_add01_string_input_is_rejected(self):
        raw = "not-a-supply-input"
        validated = validate_supply_input(raw)
        self.assertIsNone(validated["input"])
        self.assertNotEqual(validated["input_issues"], [])
        issue = validated["input_issues"][0]
        self.assertIsInstance(issue["locator"], str)
        self.assertIsInstance(issue["reason"], str)
        self.assertNotEqual(issue["reason"], "")
        self.assertEqual(set(issue.keys()),
                         {"locator", "reason", "source_ref"})

    def test_add02_meaning_null_is_preserved(self):
        document = load_document()
        raw = base_input(document)
        self.assertEqual(raw["descriptors"][6]["descriptor_kind"], "required field", "setup: target slot")
        raw["descriptors"][6]["facts"][0]["meaning"] = None
        snapshot = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"])
        slot = validated["input"]["descriptors"][6]
        self.assertEqual(slot["slot_identity"], "synthetic-descriptor-7")
        self.assertIsNone(slot["facts"][0]["meaning"])
        self.assertEqual(validated["input"], snapshot, "semantic null remains in decoded input")
        self.assertEqual(raw, snapshot, "validator must not mutate input")


if __name__ == "__main__":
    unittest.main()
