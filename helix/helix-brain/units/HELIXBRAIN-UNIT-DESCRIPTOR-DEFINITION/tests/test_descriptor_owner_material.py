"""G1a owner acquisition の実入力部分だけを検収する。

根拠: L4 /dependency_semantic_ports/descriptor_target_contract/logical_port,
/ordered_branches/1,/relevance_table,/return_field_mapping と
L5 source acquisition の既存FN0 source qualification 契約。
ここではtarget解釈、cohort、state、matchを期待せず、KB/provenance/sourceの
原出現、FN0 qualificationの結果、局所境界だけを検収する。
"""

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_target_reader import _collect_owner_target_material
from supply_validation import validate_supply_input


class TestDescriptorOwnerMaterial(unittest.TestCase):
    def _collect(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(
            validated["input"], "setup: fn0 must retain the logical snapshot"
        )
        validated_before = copy.deepcopy(validated)
        claim = validated["input"]["claims"][0]

        material = _collect_owner_target_material(validated, claim)

        self.assertEqual(
            set(material),
            {
                "knowledge_record_indices",
                "provenance",
                "sources",
                "boundaries",
            },
        )
        self.assertEqual(raw, raw_before, "owner acquisition must not mutate raw input")
        self.assertEqual(
            validated,
            validated_before,
            "owner acquisition must not mutate ValidatedSupply",
        )
        return validated, claim, material

    def _assert_all_physical_sources(self, raw, validated, material):
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

    def test_positive_reads_original_record_provenance_and_all_sources_once(self):
        raw = descriptor_claim_input("positive")
        validated, claim, material = self._collect(raw)

        knowledge_ref = claim["binding"]["knowledge_ref"]
        matching_records = [
            index
            for index, record in enumerate(raw["knowledge_records"])
            if record["ref"] == knowledge_ref
        ]
        self.assertEqual(matching_records, [0])
        self.assertEqual(material["knowledge_record_indices"], matching_records)

        original_record = raw["knowledge_records"][0]
        provenance_ref = original_record["provenance_refs"][0]
        expected_source_indices = [
            index
            for index, source in enumerate(raw["sources"])
            if source["ref"] == provenance_ref
        ]
        self.assertEqual(expected_source_indices, [0])
        self.assertEqual(
            material["provenance"],
            [
                {
                    "knowledge_record_index": 0,
                    "provenance_index": 0,
                    "ref": copy.deepcopy(provenance_ref),
                    "source_indices": expected_source_indices,
                }
            ],
        )
        self._assert_all_physical_sources(raw, validated, material)

    def test_source_body_preserves_absent_null_empty_and_repeated_raw_values(self):
        for mode in ("absent", "null", "empty", "duplicate_declaration"):
            with self.subTest(mode=mode):
                raw = descriptor_claim_input(mode)
                validated, _claim, material = self._collect(raw)

                source_material = material["sources"][0]["source"]
                original_content = raw["sources"][0]["content"]
                self.assertEqual(source_material, raw["sources"][0])
                if mode == "absent":
                    self.assertNotIn("descriptor_targets", original_content)
                elif mode == "null":
                    self.assertIsNone(original_content["descriptor_targets"])
                elif mode == "empty":
                    self.assertEqual(original_content["descriptor_targets"], [])
                else:
                    self.assertEqual(len(original_content["descriptor_targets"]), 2)
                    self.assertEqual(
                        original_content["descriptor_targets"][0],
                        original_content["descriptor_targets"][1],
                    )
                self._assert_all_physical_sources(raw, validated, material)

    def test_provenance_repetition_and_optional_ref_members_are_preserved(self):
        raw = descriptor_claim_input("positive")
        binding_ref = raw["binding"]["knowledge_ref"]
        for member in ("source_locator", "sha256"):
            binding_ref.pop(member)
            raw["claims"][0]["binding"]["knowledge_ref"].pop(member)

        record = raw["knowledge_records"][0]
        for member in ("source_locator", "sha256"):
            record["ref"].pop(member)
        provenance_ref = copy.deepcopy(raw["sources"][0]["ref"])
        for member in ("source_locator", "sha256"):
            provenance_ref.pop(member)
        record["provenance_refs"] = [
            copy.deepcopy(provenance_ref),
            copy.deepcopy(provenance_ref),
        ]

        validated, _claim, material = self._collect(raw)

        self.assertEqual(material["knowledge_record_indices"], [0])
        self.assertEqual(
            material["provenance"],
            [
                {
                    "knowledge_record_index": 0,
                    "provenance_index": index,
                    "ref": copy.deepcopy(provenance_ref),
                    "source_indices": [0],
                }
                for index in (0, 1)
            ],
        )
        self._assert_all_physical_sources(raw, validated, material)

    def test_unqualified_and_nonsemantic_physical_sources_are_retained(self):
        raw = descriptor_claim_input("positive")

        # Index 1 remains independently qualified but has a non-semantic role.
        role_source = raw["sources"][1]
        role_source["role"] = "reference_only"
        # Index 2 has a typed qualification whose subject digest no longer matches.
        unqualified_source = raw["sources"][2]
        qualification = next(
            row
            for row in raw["qualifications"]
            if row["ref"] == unqualified_source["qualification_ref"]
        )
        qualification["subject_sha256"] = "different-digest"

        provenance = raw["knowledge_records"][0]["provenance_refs"]
        provenance.extend(
            [
                copy.deepcopy(role_source["ref"]),
                copy.deepcopy(unqualified_source["ref"]),
            ]
        )

        validated, _claim, material = self._collect(raw)

        self.assertEqual(
            [row["source_indices"] for row in material["provenance"]],
            [[0], [1], [2]],
        )
        self.assertEqual(
            [row["provenance_index"] for row in material["provenance"]], [0, 1, 2]
        )
        self._assert_all_physical_sources(raw, validated, material)
        self.assertFalse(material["sources"][1]["usable"])
        self.assertFalse(material["sources"][2]["usable"])
        self.assertTrue(
            any(
                boundary.get("locator") == "/sources/2"
                and boundary.get("cause") == "owner_source_unresolved"
                for boundary in material["boundaries"]
            )
        )

    def test_missing_knowledge_record_keeps_raw_sources_and_local_boundary(self):
        raw = descriptor_claim_input("owner_source_unresolved")
        validated, _claim, material = self._collect(raw)

        self.assertEqual(material["knowledge_record_indices"], [])
        self.assertEqual(material["provenance"], [])
        self._assert_all_physical_sources(raw, validated, material)
        self.assertTrue(
            any(
                boundary.get("locator") == "/knowledge_records"
                and boundary.get("cause") == "owner_source_unresolved"
                for boundary in material["boundaries"]
            )
        )
