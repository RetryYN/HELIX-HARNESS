"""R2 M5: fn0が宣言したRef/Binding受理境界とQualification不成立を固定する。"""

from __future__ import annotations

import copy
import unittest

from descriptor_definitions import validate_supply_input
from identity_input_fixtures import normal_input


class TestFn0R2NegativeBoundaries(unittest.TestCase):
    def test_distinct_qualification_occurrences_make_source_unusable(self):
        """同一qualification Refに異なる原Qが複数あるとき、sourceをusableにしない。"""
        raw = normal_input()
        source = raw["sources"][0]
        matching = [
            q for q in raw["qualifications"] if q["ref"] == source["qualification_ref"]
        ]
        self.assertEqual(len(matching), 1)
        conflicting = copy.deepcopy(matching[0])
        conflicting["qualification_body"]["authority_effect"] = (
            "different original occurrence"
        )
        raw["qualifications"].append(conflicting)
        before = copy.deepcopy(raw)

        validated = validate_supply_input(raw)

        self.assertEqual(validated["input"], before)
        self.assertEqual(raw, before)
        self.assertIn(source["ref"], validated["unusable_source_refs"])
        self.assertTrue(
            any(
                issue.get("source_ref") == source["ref"]
                for issue in validated["input_issues"]
            )
        )

    def test_one_invalid_copy_of_equal_qualifications_makes_source_unusable(self):
        """重複Qの一方だけsubject digestを壊しても、他方でsourceをusableにしない。"""
        raw = normal_input()
        source = raw["sources"][0]
        matching = [
            q for q in raw["qualifications"] if q["ref"] == source["qualification_ref"]
        ]
        self.assertEqual(len(matching), 1)
        raw["qualifications"].append(copy.deepcopy(matching[0]))
        raw["qualifications"][-1]["subject_sha256"] = "0" * 64
        before = copy.deepcopy(raw)

        validated = validate_supply_input(raw)

        self.assertEqual(validated["input"], before)
        self.assertEqual(raw, before)
        self.assertIn(source["ref"], validated["unusable_source_refs"])
        self.assertTrue(
            any(
                issue.get("source_ref") == source["ref"]
                for issue in validated["input_issues"]
            )
        )

    def test_non_string_ref_member_is_rejected_by_fn0_decode(self):
        """Refの型外memberはfn0 decode failureでありfn3 semantic branchへ混ぜない。"""
        for member in ("identity", "revision", "owner", "source_locator", "sha256"):
            with self.subTest(member=member):
                raw = normal_input()
                raw["binding"]["template_ref"][member] = 23
                before = copy.deepcopy(raw)
                validated = validate_supply_input(raw)
                self.assertIsNone(validated["input"])
                self.assertTrue(validated["input_issues"])
                self.assertEqual(raw, before)

    def test_unknown_ref_member_is_rejected_by_fn0_decode(self):
        raw = normal_input()
        raw["binding"]["template_ref"]["unrecognized"] = "opaque"
        before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNone(validated["input"])
        self.assertTrue(validated["input_issues"])
        self.assertEqual(raw, before)

    def test_binding_wrong_scalar_and_unknown_member_are_rejected_by_fn0_decode(self):
        variants = (
            ("pack_contract_version", 17),
            ("unrecognized", "opaque"),
        )
        for member, value in variants:
            with self.subTest(member=member):
                raw = normal_input()
                raw["binding"][member] = value
                before = copy.deepcopy(raw)
                validated = validate_supply_input(raw)
                self.assertIsNone(validated["input"])
                self.assertTrue(validated["input_issues"])
                self.assertEqual(raw, before)

    def test_optional_locator_and_digest_nulls_are_preserved(self):
        for member in ("source_locator", "sha256"):
            with self.subTest(member=member):
                raw = normal_input()
                raw["binding"]["template_ref"][member] = None
                before = copy.deepcopy(raw)
                validated = validate_supply_input(raw)
                self.assertIsNotNone(validated["input"])
                self.assertEqual(validated["input"], before)
                self.assertEqual(validated["input_issues"], [])
                self.assertEqual(raw, before)

    def test_absent_binding_members_are_accepted_and_preserved(self):
        """L4 Ref/Bindingはoptional memberを宣言し、partial inputを原値のまま持つ。"""
        variants = ("oracle_ref", "template_ref", "all")
        for missing in variants:
            with self.subTest(missing=missing):
                raw = normal_input()
                if missing == "all":
                    raw["binding"] = {}
                else:
                    del raw["binding"][missing]
                before = copy.deepcopy(raw)
                validated = validate_supply_input(raw)
                self.assertIsNotNone(validated["input"])
                self.assertEqual(validated["input"], before)
                self.assertEqual(validated["input_issues"], [])
                self.assertEqual(raw, before)


if __name__ == "__main__":
    unittest.main()
