"""L5から独立に導いたfn0 source-byte/Qualification境界。

Oracle: L5 /wire_codec_contract/source_byte_and_qualification_order と
/source_return_contract/descriptor_target_dataflow/definition_meaning_core/
call_return_closure/fn0_qualification_scope_issue_serialization。
Qualification Ref の所在差は /type_contract/reference_comparison に従う。
"""

from __future__ import annotations

import copy
import hashlib
import unittest

from descriptor_definitions import validate_supply_input
from supply_input_fixtures import base_input, load_document


def _raw():
    return base_input(load_document())


def _qualification_for(raw, source_index=0):
    source = raw["sources"][source_index]
    return next(
        row
        for row in raw["qualifications"]
        if row["ref"]["identity"] == source["qualification_ref"]["identity"]
    )


def _set_source_bytes_and_matching_subject_digest(raw, source_index, text):
    source = raw["sources"][source_index]
    digest = hashlib.sha256(text.encode("utf-8", errors="strict")).hexdigest()
    source["content_bytes"] = text
    source["ref"]["sha256"] = digest
    qualification = _qualification_for(raw, source_index)
    qualification["subject_ref"]["sha256"] = digest
    qualification["subject_sha256"] = digest


class TestFn0SourceQualificationContract(unittest.TestCase):
    def assert_source_unusable_without_losing_snapshot(self, raw, index=0):
        before = copy.deepcopy(raw)
        ref = copy.deepcopy(raw["sources"][index]["ref"])
        other_refs = [
            copy.deepcopy(row["ref"])
            for i, row in enumerate(raw["sources"])
            if i != index
        ]
        result = validate_supply_input(raw)
        self.assertEqual(result["input"], before)
        self.assertIn(ref, result["unusable_source_refs"])
        for other in other_refs:
            self.assertNotIn(other, result["unusable_source_refs"])
        self.assertTrue(result["input_issues"])
        self.assertEqual(raw, before)
        return result, ref

    def test_unencodable_source_text_is_unusable_and_preserved(self):
        raw = _raw()
        raw["sources"][0]["content_bytes"] = '{"unpaired": \ud800}'
        self.assert_source_unusable_without_losing_snapshot(raw)

    def test_strict_source_json_rejects_duplicate_keys_and_non_json_constants(self):
        for malformed in ('{"key": 1, "key": 2}', '{"key": NaN}', '{"key": Infinity}'):
            with self.subTest(source_text=malformed):
                raw = _raw()
                _set_source_bytes_and_matching_subject_digest(raw, 0, malformed)
                self.assert_source_unusable_without_losing_snapshot(raw)

    def test_parsed_source_body_must_equal_supplied_content(self):
        raw = _raw()
        raw["sources"][0]["content"]["body_probe"] = "not present in source bytes"
        self.assert_source_unusable_without_losing_snapshot(raw)

    def test_qualification_subject_tuple_and_digest_must_match_source(self):
        mutations = (
            ("identity", "another-subject"),
            ("revision", "another-revision"),
            ("scope", {"tenant": "another-tenant"}),
            ("owner", "another-owner"),
        )
        for member, value in mutations:
            with self.subTest(subject_member=member):
                raw = _raw()
                qualification = _qualification_for(raw)
                qualification["subject_ref"][member] = copy.deepcopy(value)
                self.assert_source_unusable_without_losing_snapshot(raw)

        raw = _raw()
        qualification = _qualification_for(raw)
        qualification["subject_sha256"] = "0" * 64
        self.assert_source_unusable_without_losing_snapshot(raw)

    def test_qualification_requires_an_independent_matching_root(self):
        raw = _raw()
        qualification = _qualification_for(raw)
        root = qualification["root_ref"]
        raw["qualification_roots"] = [
            candidate
            for candidate in raw["qualification_roots"]
            if not (
                candidate["identity"] == root["identity"]
                and candidate["revision"] == root["revision"]
                and candidate["scope"] == root["scope"]
                and candidate["owner"] == root["owner"]
            )
        ]
        self.assert_source_unusable_without_losing_snapshot(raw)

    def test_scope_mismatch_uses_qualification_locator_and_l5_reason(self):
        raw = _raw()
        qualification_index = next(
            i
            for i, row in enumerate(raw["qualifications"])
            if row["ref"]["identity"]
            == raw["sources"][0]["qualification_ref"]["identity"]
        )
        original_source_ref = copy.deepcopy(raw["sources"][0]["ref"])
        raw["qualifications"][qualification_index]["applicable_scope"] = {
            "tenant": "different-tenant"
        }
        before = copy.deepcopy(raw)

        result = validate_supply_input(raw)

        self.assertEqual(result["input"], before)
        self.assertIn(original_source_ref, result["unusable_source_refs"])
        self.assertIn(
            {
                "locator": f"/qualifications/{qualification_index}/applicable_scope",
                "reason": "原資格の適用scopeが当該sourceのscopeに対応しない。",
                "source_ref": original_source_ref,
            },
            result["input_issues"],
        )
        self.assertEqual(raw, before)

    def test_qualification_ref_locator_difference_does_not_create_conflict(self):
        raw = _raw()
        qualification = copy.deepcopy(_qualification_for(raw))
        qualification["ref"]["source_locator"] = "/another/location/for/same-ref"
        raw["qualifications"].append(qualification)
        before = copy.deepcopy(raw)

        result = validate_supply_input(raw)

        self.assertEqual(result["input"], before)
        self.assertEqual(result["input_issues"], [])
        self.assertEqual(result["unusable_source_refs"], [])
        self.assertEqual(result["input"]["qualifications"][-1], qualification)
        self.assertEqual(raw, before)


if __name__ == "__main__":
    unittest.main()
