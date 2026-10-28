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

Static proposal only: product cases have not been executed. Input
preparation is shared; mutations and independent assertions stay here.
Input documents must not be mutated by the validator.
"""

import copy
import unittest

from descriptor_definitions import validate_supply_input
from supply_input_fixtures import base_input, load_document

# 既存L5 /functions/0、L8 /additional_unit_cases/3、
# /input_structure_verification/semantic_boundary_cases/2、
# 分割fixture /materials/2/expected_validated が独立basis。
# test未凍結・未実行。実owner資格/全fn0/意味unknown/F02/全IO0は未証明。


def add04_input(document, assertions):
    """ADD-04: replace only /sources/0/ref/sha256 with a mismatched digest."""
    case = document["input_structure_verification"]["semantic_boundary_cases"][2]
    assertions.assertEqual(
        case["case_ref"], "HELIXBRAIN-L8-032-ADD-04", "setup: ADD04 identity"
    )
    mutation = case["input_mutation"]
    assertions.assertEqual(
        mutation,
        {
            "operation": "replace_member",
            "pointer": "/sources/0/ref/sha256",
            "value": "synthetic-mismatching-digest",
        },
        "setup: ADD04 fixed input mutation",
    )
    raw = base_input(document)
    raw["sources"][0]["ref"]["sha256"] = mutation["value"]
    return raw


class TestSourceIntegrity(unittest.TestCase):
    def test_base_retains_supplied_sources(self):
        raw = base_input(load_document())
        snapshot = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(
            validated["input"], "semantic: structurally decodable input is preserved"
        )
        self.assertEqual(
            validated["input"],
            snapshot,
            "semantic: source bytes/body/qualification remain unchanged",
        )
        self.assertEqual(
            validated["unusable_source_refs"],
            [],
            "semantic: original synthetic sources are not unusable",
        )
        self.assertEqual(raw, snapshot, "semantic: validator must not mutate input")

    def test_add04_mismatched_digest_makes_source_unusable(self):
        document = load_document()
        raw = add04_input(document, self)
        snapshot = copy.deepcopy(raw)
        source0_ref = raw["sources"][0]["ref"]
        unrelated_refs = [s["ref"] for s in raw["sources"][1:]]
        validated = validate_supply_input(raw)
        self.assertIsNotNone(
            validated["input"], "semantic: structurally decodable input is preserved"
        )
        self.assertEqual(
            validated["input"],
            snapshot,
            "semantic: source bytes/body/qualification remain unchanged",
        )
        self.assertIn(
            source0_ref,
            validated["unusable_source_refs"],
            "semantic: mismatched source is unusable",
        )
        for ref in unrelated_refs:
            self.assertNotIn(
                ref,
                validated["unusable_source_refs"],
                "semantic: unrelated source remains unaffected",
            )
        self.assertEqual(raw, snapshot, "semantic: validator must not mutate input")


if __name__ == "__main__":
    unittest.main()
