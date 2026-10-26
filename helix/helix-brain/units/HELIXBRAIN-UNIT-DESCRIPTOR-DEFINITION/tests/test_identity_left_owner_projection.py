"""Left-owner閉型の局所projectionで不正なrange宣言をpositive扱いしない。

L4 /identity_version_trace_contract/schema/$defs/EndpointOwnerDeclaration と
LeftOwnerSourceBody、/raw_carriers/projection_guard の形成条件を参照する。
元QualifiedSource.contentはRawValueのままなのでfn0入力保持を確認し、型外値を
owner qualificationやoutside predicateへ昇格させない。型外だけの新Findingは期待しない。
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definitions import compare_identity_versions_and_trace, validate_supply_input
from identity_input_fixtures import _write_source_content, bilateral_input


FN3_BACKFLOW = "HELIXBRAIN-L6-032-FN3-IDENTITY"


class TestIdentityLeftOwnerProjection(unittest.TestCase):
    def _input_with_left_declaration(self, mutate):
        raw = bilateral_input("positive")
        record = raw["compatibility_records"][0]
        left_sources = [
            source for source in raw["sources"]
            if isinstance(source.get("content"), dict)
            and source["content"].get("compatibility_record_ref") == record["ref"]
            and source["content"].get("counterpart_source_ref") == record["source_ref"]
        ]
        self.assertEqual(len(left_sources), 1)
        source = left_sources[0]
        content = copy.deepcopy(source["content"])
        mutate(content["endpoint_owner_declaration"])
        # Sync bytes and Qualification subject digest for this input only.
        _write_source_content(raw, source, content)
        return raw

    def _assert_not_false_outside_resolution(self, raw, label):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"], label)
        self.assertEqual(validated["input"], raw_before, label)
        self.assertEqual(validated["input_issues"], [], label)
        validated_before = copy.deepcopy(validated)
        try:
            result = compare_identity_versions_and_trace({"validated": validated})
        except NotImplementedError as exc:
            message = str(exc)
            self.assertTrue("F04/" in message or "N01/" in message, label)
            self.assertIn(FN3_BACKFLOW, message, label)
        else:
            self.assertEqual(raw, raw_before, label)
            self.assertEqual(validated, validated_before, label)
            self.assertEqual(result["input_binding"], raw_before["binding"], label)
            # Type failure alone has no fixed Finding mapping. In particular, it
            # cannot satisfy the existing known-outside rule R62.
            self.assertFalse(any(
                finding["code"] == "compatibility_mismatch"
                for finding in result["findings"]
            ), label)
            rows = [axis for axis in result["axes"] if axis["axis"] == "compatibility"]
            self.assertTrue(rows, label)
            self.assertTrue(all(axis["state"] == "unknown" for axis in rows), label)
        self.assertEqual(raw, raw_before, label)
        self.assertEqual(validated, validated_before, label)

    def test_invalid_left_range_relation_is_not_positive_owner_evidence(self):
        raw = self._input_with_left_declaration(
            lambda declaration: declaration.__setitem__("range_relation", "inside")
        )
        self._assert_not_false_outside_resolution(raw, "EndpointOwnerDeclaration.range_relation enum")

    def test_out_of_type_left_range_reason_is_not_positive_owner_evidence(self):
        raw = self._input_with_left_declaration(
            lambda declaration: declaration.__setitem__("range_reason", {"raw": "not string or null"})
        )
        self._assert_not_false_outside_resolution(raw, "EndpointOwnerDeclaration.range_reason type")


if __name__ == "__main__":
    unittest.main()
