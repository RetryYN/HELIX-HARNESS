"""L4/L5の局所Ref比較とclosed projection境界を確認する。

L4 /identity_version_trace_contract/raw_carriers/projection_guard と
schema/$defs/RangeDeclaration・RangeOwnerDeclaration、および
read_branch_contracts/actual と public_projection/axis_reason_writer/refs_order
に従う。L5 /source_return_contract/constructor_meaning/reference_equality は
source_locatorをRef identityに含めない。L4 finding_witness_table/5 と L5
/failure_rules/63 は、oracle revision不一致に同じsubject/要求scopeの対応を要する。
whole Comparisonやfixture期待値は複製しない。
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definitions import compare_identity_versions_and_trace, validate_supply_input
from identity_input_fixtures import _write_source_content, bilateral_input, normal_input


FN3_BACKFLOW = "HELIXBRAIN-L6-032-FN3-IDENTITY"


class TestIdentityProjectionBoundaries(unittest.TestCase):
    def _call(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"])
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        validated_before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(result["input_binding"], raw_before["binding"])
        return result

    def _axis(self, result, name):
        return next(row for row in result["axes"] if row["axis"] == name)

    def _call_unformed_range(self, raw, case_id):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"], case_id)
        self.assertEqual(validated["input"], raw_before, case_id)
        self.assertEqual(validated["input_issues"], [], case_id)
        validated_before = copy.deepcopy(validated)
        try:
            result = compare_identity_versions_and_trace({"validated": validated})
        except NotImplementedError as exc:
            message = str(exc)
            self.assertTrue("F04/" in message or "N01/" in message, case_id)
            self.assertIn(FN3_BACKFLOW, message, case_id)
        else:
            self.assertEqual(raw, raw_before, case_id)
            self.assertEqual(validated, validated_before, case_id)
            self.assertFalse(any(
                row["code"] == "compatibility_mismatch" for row in result["findings"]
            ), case_id)
            artifact = self._axis(result, "pack.artifact_version")
            self.assertEqual(artifact["state"], "unknown", case_id)

    def test_pack_identity_does_not_compare_source_locator(self):
        raw = bilateral_input("outside")
        record = raw["compatibility_records"][0]
        right = next(source for source in raw["sources"] if source["ref"] == record["source_ref"])
        content = copy.deepcopy(right["content"])
        range_declaration = content["compatibility_range_declaration"]
        changed_actual_ref = range_declaration["actual_pack_ref"]
        original_actual_ref = copy.deepcopy(changed_actual_ref)
        changed_actual_ref["source_locator"] = "owners/pack-observation.json"
        self.assertEqual(
            {key: value for key, value in changed_actual_ref.items() if key != "source_locator"},
            {key: value for key, value in original_actual_ref.items() if key != "source_locator"},
        )

        _write_source_content(raw, right, content)
        record["source_ref"] = copy.deepcopy(right["ref"])
        left = next(
            source for source in raw["sources"]
            if isinstance(source.get("content"), dict)
            and source["content"].get("compatibility_record_ref") == record["ref"]
        )
        left_content = copy.deepcopy(left["content"])
        left_content["counterpart_source_ref"] = copy.deepcopy(right["ref"])
        _write_source_content(raw, left, left_content)

        result = self._call(raw)
        pack_identity = self._axis(result, "pack.identity")
        self.assertEqual(pack_identity["state"], "resolved")
        self.assertEqual(pack_identity["subject_ref"], raw["binding"]["pack_ref"])
        self.assertEqual(
            raw["sources"][raw["sources"].index(right)]["content"][
                "compatibility_range_declaration"
            ]["actual_pack_ref"]["source_locator"],
            "owners/pack-observation.json",
        )

    def test_range_artifact_value_outside_local_schema_is_not_projected(self):
        """WR05の型外artifact causes public写像は未閉包。L4局所unknownを観測するか、未形成写像をF04/N01+FN3へBackflowするため両経路を許す。本testは未完成predicateや新Findingを生成せず、public写像の成立を認定しない。"""
        raw = bilateral_input("outside")
        record = raw["compatibility_records"][0]
        right = next(source for source in raw["sources"] if source["ref"] == record["source_ref"])
        content = copy.deepcopy(right["content"])
        content["compatibility_range_declaration"]["actual_artifact_version"] = {
            "untyped": "raw value remains preserved"
        }
        _write_source_content(raw, right, content)
        record["source_ref"] = copy.deepcopy(right["ref"])
        left = next(
            source for source in raw["sources"]
            if isinstance(source.get("content"), dict)
            and source["content"].get("compatibility_record_ref") == record["ref"]
        )
        left_content = copy.deepcopy(left["content"])
        left_content["counterpart_source_ref"] = copy.deepcopy(right["ref"])
        _write_source_content(raw, left, left_content)

        self._call_unformed_range(raw, "F04-NEG-10/local-RangeDeclaration value type")

    def test_non_outside_owner_relation_is_not_two_owner_range_evidence(self):
        """WR05のowner relation不一致 causes public写像は未閉包。L4局所unknownを観測するか、未形成写像をF04/N01+FN3へBackflowするため両経路を許す。本testは未完成predicateや新Findingを生成せず、public写像の成立を認定しない。"""
        raw = bilateral_input("outside")
        record = raw["compatibility_records"][0]
        right = next(source for source in raw["sources"] if source["ref"] == record["source_ref"])
        content = copy.deepcopy(right["content"])
        content["compatibility_range_declaration"]["owner_declarations"][1]["relation"] = "inside"
        _write_source_content(raw, right, content)
        record["source_ref"] = copy.deepcopy(right["ref"])
        left = next(
            source for source in raw["sources"]
            if isinstance(source.get("content"), dict)
            and source["content"].get("compatibility_record_ref") == record["ref"]
        )
        left_content = copy.deepcopy(left["content"])
        left_content["counterpart_source_ref"] = copy.deepcopy(right["ref"])
        _write_source_content(raw, left, left_content)

        self._call_unformed_range(raw, "RangeOwnerDeclaration relation const")

    def test_oracle_revision_without_subject_or_obligation_link_does_not_emit_R63(self):
        """L4/L5のR63対象結合がないtyped inputは通常Comparisonを返し、Findingを出さない。"""
        cases = ("obligation identity differs", "subject target is absent")
        for case_id in cases:
            with self.subTest(case_id=case_id):
                raw = normal_input()
                oracle = raw["oracle_bindings"][0]
                oracle["oracle_ref"]["revision"] = "synthetic-other-oracle-revision"
                if case_id == "obligation identity differs":
                    oracle["obligation_ref"]["identity"] = "synthetic-unmatched-requirement"
                else:
                    oracle["subject_ref"]["identity"] = "synthetic-nonexistent-subject"

                raw_before = copy.deepcopy(raw)
                validated = validate_supply_input(raw)
                self.assertIsNotNone(validated["input"])
                self.assertEqual(validated["input"], raw_before)
                self.assertEqual(validated["input_issues"], [])
                validated_before = copy.deepcopy(validated)
                result = compare_identity_versions_and_trace({"validated": validated})
                self.assertEqual(raw, raw_before)
                self.assertEqual(validated, validated_before)
                self.assertEqual(result["producer_symbol"], "compare_identity_versions_and_trace")
                self.assertEqual(set(result), {"axes", "findings", "producer_symbol", "input_binding"})
                self.assertIsInstance(result["axes"], list)
                self.assertIsInstance(result["findings"], list)
                self.assertEqual(result["input_binding"], raw_before["binding"])
                self.assertFalse(any(
                    row["code"] == "oracle_revision_mismatch"
                    for row in result["findings"]
                ), case_id)


if __name__ == "__main__":
    unittest.main()
