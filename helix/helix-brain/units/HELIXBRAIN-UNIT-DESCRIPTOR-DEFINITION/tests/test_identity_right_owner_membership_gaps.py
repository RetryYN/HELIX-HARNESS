"""FN3 bilateral readの右owner由来Membershipを公開経路で部分観測する。

根拠: L4 /identity_version_trace_contract/read_branch_contracts/bilateral/right,
/membership、および/membership_precedence。右sourceの資格・record bindingと、
compatible_refsの右endpoint fullRef membershipは独立したreadである。membership
が解決しない入力をresolvedまたは既存R62 Findingへ昇格させない。
"""

from __future__ import annotations

import copy
import json
import unittest

from descriptor_definitions import (
    compare_identity_versions_and_trace,
    validate_supply_input,
)
from identity_input_fixtures import (
    _append_qualified_source,
    _write_source_content,
    bilateral_input,
)


class TestIdentityRightOwnerMembershipGaps(unittest.TestCase):
    def _validated(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(raw, raw_before, "fn0 must not mutate the supplied input")
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        return validated, raw_before

    def _call_bilateral_owner_unresolved(self, raw):
        """L4 pair_aggregation: owner資格/endpoint membershipの未成立はbilateral_owner_unresolved unknown。"""
        validated, raw_before = self._validated(raw)
        validated_before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        compatibility_rows = [
            row for row in result["axes"] if row["axis"] == "compatibility"
        ]
        self.assertTrue(compatibility_rows)
        self.assertTrue(all(row["state"] == "unknown" for row in compatibility_rows))
        for row in compatibility_rows:
            _prefix, separator, material = row["reason"].partition("\n")
            self.assertTrue(separator)
            self.assertEqual(
                json.loads(material)["cause"], "bilateral_owner_unresolved"
            )
        self.assertFalse(
            any(row["code"] == "compatibility_mismatch" for row in result["findings"])
        )
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)

    @staticmethod
    def _record(raw):
        return raw["compatibility_records"][0]

    @staticmethod
    def _right_source(raw, source_ref):
        matches = [
            source for source in raw["sources"] if source.get("ref") == source_ref
        ]
        if len(matches) != 1:
            raise AssertionError(
                "setup: the original CompatibilityRecord must select one right source"
            )
        return matches[0]

    @staticmethod
    def _left_source(raw, record_ref):
        matches = [
            source
            for source in raw["sources"]
            if isinstance(source.get("content"), dict)
            and source["content"].get("compatibility_record_ref") == record_ref
        ]
        if len(matches) != 1:
            raise AssertionError(
                "setup: the positive fixture must contain one linked left source"
            )
        return matches[0]

    def test_qualified_source_of_another_owner_does_not_resolve_right_endpoint(self):
        """資格/Q/rootが自己整合しても、別owner sourceを対象right ownerへ昇格しない。"""
        raw = bilateral_input("positive")
        record = self._record(raw)
        original_right = self._right_source(raw, record["source_ref"])
        left = self._left_source(raw, record["ref"])

        # 追加source自身のQualification/root/ownerはfixture helperで整合させる。
        # compatible_refsには元right_refを残し、membershipだけがpositiveでも、
        # 別owner sourceは元right endpoint ownerの根拠にならないことを観測する。
        other_owner_source = _append_qualified_source(
            raw,
            identity="SYNTHETIC-OTHER-OWNER-RIGHT-SOURCE",
            owner="synthetic-unrelated-pack-owner",
            scope=copy.deepcopy(original_right["ref"]["scope"]),
            content=copy.deepcopy(original_right["content"]),
            qualification_identity="SYNTHETIC-OTHER-OWNER-RIGHT-QUALIFICATION",
            root_identity="SYNTHETIC-OTHER-OWNER-RIGHT-ROOT",
            revision=original_right["ref"]["revision"],
        )
        self.assertNotEqual(
            other_owner_source["ref"]["owner"], record["right_ref"]["owner"]
        )
        self.assertIn(
            record["right_ref"], other_owner_source["content"]["compatible_refs"]
        )
        record["source_ref"] = copy.deepcopy(other_owner_source["ref"])

        # 左ownerの明示counterpart linkだけを新sourceへ同期する。左側membershipに
        # 別gateを足さず、その本文の全ての既存member/宣言は保つ。
        left_body = copy.deepcopy(left["content"])
        left_body["counterpart_source_ref"] = copy.deepcopy(other_owner_source["ref"])
        _write_source_content(raw, left, left_body)

        self._call_bilateral_owner_unresolved(raw)

    def test_right_membership_uses_all_original_members_not_a_fixed_position(self):
        """右memberだけを別typed Refへ置換してもresolved/R62にしない。"""
        raw = bilateral_input("positive")
        record = self._record(raw)
        original_right_ref = copy.deepcopy(record["right_ref"])
        right = self._right_source(raw, record["source_ref"])
        left = self._left_source(raw, record["ref"])

        body = copy.deepcopy(right["content"])
        original_members = body["compatible_refs"]
        matching_positions = [
            index
            for index, member in enumerate(original_members)
            if member == original_right_ref
        ]
        self.assertTrue(
            matching_positions,
            "setup: positive control must contain the original right Ref",
        )
        replacement = copy.deepcopy(original_right_ref)
        replacement["identity"] = "SYNTHETIC-DIFFERENT-RIGHT-ENDPOINT"
        body["compatible_refs"] = [
            replacement if member == original_right_ref else member
            for member in original_members
        ]
        self.assertFalse(
            any(member == original_right_ref for member in body["compatible_refs"])
        )
        self.assertTrue(
            all(isinstance(member, dict) for member in body["compatible_refs"])
        )

        # body digest/Q subjectを同期したうえで、recordとleft counterpartの原linkも
        # 新しいsource Refへ同期する。right sourceのqualification identityは保つ。
        _write_source_content(raw, right, body)
        record["source_ref"] = copy.deepcopy(right["ref"])
        left_body = copy.deepcopy(left["content"])
        left_body["counterpart_source_ref"] = copy.deepcopy(right["ref"])
        _write_source_content(raw, left, left_body)

        self._call_bilateral_owner_unresolved(raw)

    def test_positive_right_membership_at_reordered_position_stays_resolved(self):
        """L4 membershipはmatching_ref_indices全件を見るため位置を入れ替えてもpositive。"""
        raw = bilateral_input("positive")
        record = self._record(raw)
        original_right_ref = copy.deepcopy(record["right_ref"])
        right = self._right_source(raw, record["source_ref"])
        left = self._left_source(raw, record["ref"])

        body = copy.deepcopy(right["content"])
        members = body["compatible_refs"]
        matching_positions = [
            index
            for index, member in enumerate(members)
            if member == original_right_ref
        ]
        self.assertTrue(
            matching_positions,
            "setup: positive control must contain the original right Ref",
        )
        moved_member = members.pop(matching_positions[0])
        members.insert(0, moved_member)
        self.assertEqual(members[0], original_right_ref)
        self.assertEqual(sum(member == original_right_ref for member in members), 1)

        _write_source_content(raw, right, body)
        record["source_ref"] = copy.deepcopy(right["ref"])
        left_body = copy.deepcopy(left["content"])
        left_body["counterpart_source_ref"] = copy.deepcopy(right["ref"])
        _write_source_content(raw, left, left_body)

        validated, raw_before = self._validated(raw)
        validated_before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        compatibility_rows = [
            row for row in result["axes"] if row["axis"] == "compatibility"
        ]
        self.assertEqual(len(compatibility_rows), 1)
        self.assertEqual(compatibility_rows[0]["state"], "resolved")
        self.assertFalse(
            any(row["code"] == "compatibility_mismatch" for row in result["findings"])
        )
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)


if __name__ == "__main__":
    unittest.main()
