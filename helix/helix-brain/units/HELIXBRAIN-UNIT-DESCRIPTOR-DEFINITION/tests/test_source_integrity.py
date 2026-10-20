# -*- coding: utf-8 -*-
"""HELIXBRAIN L5-032 validate_supply_input (fn0) source integrity test.

Calls the existing public validator directly:
    validate_supply_input(raw) -> ValidatedSupply

Cases:
    * base control (untouched complete synthetic input)
    * ADD-04 source-bytes-mismatch: /sources/0/ref/sha256 is replaced
      with "synthetic-mismatching-digest" while bytes/body are kept;
      the related source must surface in unusable_source_refs while
      unrelated supplied sources are preserved. Concrete mutation at
      /input_structure_verification/semantic_boundary_cases/2.

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

# 既存L5 /functions/0、L8 /additional_unit_cases/3、
# /input_structure_verification/semantic_boundary_cases/2、
# 分割fixture /materials/2/expected_validated が独立basis。
# test未凍結・未実行。実owner資格/全fn0/意味unknown/F02/全IO0は未証明。


def load_document():
    with open(L8_PATH, "rb") as fh:
        return json.loads(fh.read().decode("utf-8"))


def base_input(document):
    return copy.deepcopy(
        document["fixture_contract"]["normal_control"]["input"]
    )


def add04_input(document):
    """ADD-04: replace only /sources/0/ref/sha256 with a mismatched digest."""
    case = document["input_structure_verification"][
        "semantic_boundary_cases"
    ][2]
    assert case["case_ref"] == "HELIXBRAIN-L8-032-ADD-04"
    mutation = case["input_mutation"]
    assert mutation == {
        "operation": "replace_member",
        "pointer": "/sources/0/ref/sha256",
        "value": "synthetic-mismatching-digest",
    }
    raw = base_input(document)
    raw["sources"][0]["ref"]["sha256"] = mutation["value"]
    return raw


class TestSourceIntegrity(unittest.TestCase):
    def test_base_retains_supplied_sources(self):
        raw = base_input(load_document())
        snapshot = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"])
        self.assertEqual(validated["input"], snapshot, "source bytes/body/qualification remain unchanged")
        self.assertEqual(validated["unusable_source_refs"], [])
        self.assertEqual(raw, snapshot, "validator must not mutate input")

    def test_add04_mismatched_digest_makes_source_unusable(self):
        document = load_document()
        raw = add04_input(document)
        snapshot = copy.deepcopy(raw)
        source0_ref = raw["sources"][0]["ref"]
        unrelated_refs = [s["ref"] for s in raw["sources"][1:]]
        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"])
        self.assertEqual(validated["input"], snapshot, "source bytes/body/qualification remain unchanged")
        self.assertIn(source0_ref, validated["unusable_source_refs"])
        for ref in unrelated_refs:
            self.assertNotIn(ref, validated["unusable_source_refs"])
        self.assertEqual(raw, snapshot, "validator must not mutate input")


if __name__ == "__main__":
    unittest.main()
