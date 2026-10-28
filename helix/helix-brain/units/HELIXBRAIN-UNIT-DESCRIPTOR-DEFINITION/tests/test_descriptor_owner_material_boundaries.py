"""G1a owner-source acquisition locator boundaries.

Expectations come from L4
``/dependency_semantic_ports/descriptor_target_contract/problem_locator/owner_source_unresolved``.
Each case starts with the existing qualified positive raw and passes it through
FN0; it checks only the owner-material acquisition boundary and preservation of
the original records and physical sources.
"""

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_target_reader import _collect_owner_target_material
from supply_validation import validate_supply_input


class TestDescriptorOwnerMaterialBoundaries(unittest.TestCase):
    def _collect(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(
            validated["input"],
            "setup: FN0 must retain this logical snapshot; do not synthesize ValidatedSupply",
        )
        validated_before = copy.deepcopy(validated)
        claim = validated["input"]["claims"][0]
        material = _collect_owner_target_material(validated, claim)
        self.assertEqual(raw, raw_before, "owner acquisition must not mutate raw input")
        self.assertEqual(
            validated,
            validated_before,
            "owner acquisition must not mutate the FN0 snapshot or qualification result",
        )
        return validated, claim, material

    def _assert_physical_sources_preserved(self, raw, validated, material):
        expected = [
            {
                "source_index": index,
                "source": copy.deepcopy(source),
                "usable": (
                    source["role"] == "semantic_json"
                    and source["ref"] not in validated["unusable_source_refs"]
                ),
            }
            for index, source in enumerate(raw["sources"])
        ]
        self.assertEqual(material["sources"], expected)

    def test_missing_claim_knowledge_ref_uses_binding_locator(self):
        raw = descriptor_claim_input("positive")
        raw["claims"][0]["binding"].pop("knowledge_ref")

        validated, _claim, material = self._collect(raw)

        self.assertEqual(material["knowledge_record_indices"], [])
        self.assertEqual(material["provenance"], [])
        self.assertEqual(
            material["boundaries"],
            [
                {
                    "locator": "/binding/knowledge_ref",
                    "cause": "owner_source_unresolved",
                }
            ],
        )
        self._assert_physical_sources_preserved(raw, validated, material)

    def test_ambiguous_matching_records_keep_every_record_index(self):
        raw = descriptor_claim_input("positive")
        raw["knowledge_records"].append(copy.deepcopy(raw["knowledge_records"][0]))

        validated, _claim, material = self._collect(raw)

        self.assertEqual(material["knowledge_record_indices"], [0, 1])
        self.assertEqual(
            [row["knowledge_record_index"] for row in material["provenance"]],
            [0, 1],
            "each ambiguous original record's provenance occurrence remains visible",
        )
        self.assertEqual(
            material["boundaries"],
            [
                {
                    "locator": "/knowledge_records",
                    "cause": "owner_source_unresolved",
                }
            ],
        )
        self._assert_physical_sources_preserved(raw, validated, material)

    def test_unjoined_and_empty_provenance_use_their_original_locators(self):
        for mode in ("unjoined", "empty", "nonlist"):
            with self.subTest(mode=mode):
                raw = descriptor_claim_input("positive")
                record = raw["knowledge_records"][0]
                if mode == "unjoined":
                    unmatched_ref = copy.deepcopy(raw["sources"][0]["ref"])
                    unmatched_ref["identity"] += "-no-source"
                    record["provenance_refs"] = [unmatched_ref]
                elif mode == "empty":
                    record["provenance_refs"] = []
                else:
                    record["provenance_refs"] = "not-an-array"

                validated, _claim, material = self._collect(raw)

                self.assertEqual(material["knowledge_record_indices"], [0])
                if mode == "unjoined":
                    self.assertEqual(
                        material["provenance"],
                        [
                            {
                                "knowledge_record_index": 0,
                                "provenance_index": 0,
                                "ref": copy.deepcopy(unmatched_ref),
                                "source_indices": [],
                            }
                        ],
                    )
                    expected_locator = "/knowledge_records/0/provenance_refs/0"
                else:
                    self.assertEqual(material["provenance"], [])
                    expected_locator = "/knowledge_records/0/provenance_refs"
                self.assertEqual(
                    material["boundaries"],
                    [
                        {
                            "locator": expected_locator,
                            "cause": "owner_source_unresolved",
                        }
                    ],
                )
                self._assert_physical_sources_preserved(raw, validated, material)
