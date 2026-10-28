"""L4/L5 descriptor target portの独立部分期待を固定する。"""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definitions import validate_supply_input
from descriptor_target_reader import read_descriptor_replacement_target


_TARGET_PROBLEM_REASONS = {
    "owner_source_unresolved": "同knowledge原record/provenanceから既存資格を満たすowner sourceへ解決できない。原所在と不足を保持する。",
    "target_container_absent": "owner原sourceにdescriptor_targets memberが供給されていない。targetを生成しない。",
    "target_container_null": "owner原sourceのdescriptor_targetsは明示nullである。targetを生成しない。",
    "target_container_type": "owner原sourceのdescriptor_targetsが配列型でない。原値を保持しtargetを生成しない。",
    "target_not_declared": "原Claimが指すtargetの明示owner対応を当該原scopeに得られない。欠落definitionからtargetを推定しない。",
    "declaration_shape": "owner原target宣言の構造を型付きviewへ対応できない。原宣言を保持する。",
    "target_ambiguous": "同じ原target Refに複数の異なるslot対応が宣言されている。先頭又は全scopeへの適用を推定せず全候補を保持する。",
    "target_mapping_conflict": "同target/slotの既知kind対応又はcaller slotの既知kind対応が相反する。原宣言と元slotを保持する。",
    "kind_unresolved": "owner原target宣言のdescriptor_kindが既決15名へ結べない。原値を保持する。",
}


class TestDescriptorTargetReader(unittest.TestCase):
    def _read(self, mode="positive"):
        raw = descriptor_claim_input(mode)
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsInstance(
            validated["input"], dict, "setup: fn0 decodes the raw claim/source snapshot"
        )
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["unusable_source_refs"], [])
        validated_before = copy.deepcopy(validated)
        result = read_descriptor_replacement_target(
            validated, raw["claims"][0], "/claims/0"
        )
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        return raw, result

    def test_qualified_single_target_has_closed_read_occurrence_and_match(self):
        """L4 target contract: typed result copies owner source/target/slot values."""
        raw, actual = self._read()
        source = raw["sources"][0]
        declaration = source["content"]["descriptor_targets"][0]
        source_ref = source["ref"]
        candidate_refs = raw["candidates"]
        candidate_indices = list(range(len(candidate_refs)))
        expected_occurrence = {
            "source_ref": {"presence": "supplied", "value": copy.deepcopy(source_ref)},
            "source_locator": "/sources/0",
            "declaration_locator": "/sources/0/content/descriptor_targets/0",
            "declaration": copy.deepcopy(declaration),
            "source_binding": {
                "presence": "supplied",
                "value": copy.deepcopy(source["content"]["binding"]),
            },
        }
        expected_match = {
            "target_ref": copy.deepcopy(declaration["target_ref"]),
            "binding": copy.deepcopy(source["content"]["binding"]),
            "slot_identity": declaration["slot_identity"],
            "descriptor_kind": declaration["descriptor_kind"],
            "source_refs": [copy.deepcopy(source_ref)],
            "declaration_locators": ["/sources/0/content/descriptor_targets/0"],
            "slot_locators": ["/descriptors/0"],
            "candidate_indices": candidate_indices,
            "candidate_refs": copy.deepcopy(candidate_refs),
        }
        expected = {
            "claim_locator": "/claims/0",
            "claim": copy.deepcopy(raw["claims"][0]),
            "candidate_indices": candidate_indices,
            "candidate_refs": copy.deepcopy(candidate_refs),
            "occurrences": [expected_occurrence],
            "matches": [expected_match],
            "state": "resolved",
            "problems": [],
        }
        self.assertEqual(set(actual), set(expected))
        self.assertEqual(actual, expected)

    def test_target_container_presence_branches_remain_distinct(self):
        """L4 ordered branch 3 distinguishes absent, null, non-array, and empty."""
        expected_kind = {
            "absent": "target_container_absent",
            "null": "target_container_null",
            "type": "target_container_type",
            "empty": "target_not_declared",
        }
        expected_locator = "/sources/0/content/descriptor_targets"
        for mode, kind in expected_kind.items():
            with self.subTest(mode=mode):
                raw, actual = self._read(mode)
                self.assertEqual(actual["state"], "unknown")
                self.assertEqual(actual["matches"], [])
                self.assertEqual(actual["claim_locator"], "/claims/0")
                self.assertEqual(actual["claim"], raw["claims"][0])
                self.assertEqual(
                    actual["candidate_indices"], list(range(len(raw["candidates"])))
                )
                self.assertEqual(actual["candidate_refs"], raw["candidates"])
                self.assertEqual(actual["occurrences"], [])
                self.assertEqual(
                    actual["problems"],
                    [
                        {
                            "kind": kind,
                            "locator": expected_locator,
                            "reason": _TARGET_PROBLEM_REASONS[kind],
                            "source_ref": {
                                "presence": "supplied",
                                "value": raw["sources"][0]["ref"],
                            },
                        }
                    ],
                )

    def test_missing_knowledge_record_is_local_owner_source_unresolved(self):
        """L4 KB/provenance selector does not infer an owner source from raw sources."""
        raw, actual = self._read("owner_source_unresolved")
        self.assertEqual(actual["state"], "unknown")
        self.assertEqual(actual["matches"], [])
        self.assertEqual(actual["occurrences"], [])
        self.assertEqual(
            actual["problems"],
            [
                {
                    "kind": "owner_source_unresolved",
                    "locator": "/knowledge_records",
                    "reason": _TARGET_PROBLEM_REASONS["owner_source_unresolved"],
                    "source_ref": {"presence": "absent"},
                }
            ],
        )

    def test_malformed_declaration_is_preserved_as_one_local_problem(self):
        """L4 typed view failure keeps the original RawValue occurrence and locator."""
        raw, actual = self._read("declaration_shape")
        self.assertEqual(actual["state"], "unknown")
        self.assertEqual(actual["matches"], [])
        self.assertEqual(len(actual["occurrences"]), 1)
        self.assertEqual(actual["occurrences"][0]["declaration"], None)
        self.assertEqual(
            actual["occurrences"][0]["declaration_locator"],
            "/sources/0/content/descriptor_targets/0",
        )
        self.assertEqual(
            actual["problems"],
            [
                {
                    "kind": "declaration_shape",
                    "locator": "/sources/0/content/descriptor_targets/0",
                    "reason": _TARGET_PROBLEM_REASONS["declaration_shape"],
                    "source_ref": {
                        "presence": "supplied",
                        "value": raw["sources"][0]["ref"],
                    },
                }
            ],
        )

    def test_same_slot_kind_conflict_and_distinct_slot_are_not_first_match(self):
        """L4 cohort reduction preserves all declarations and does not select a winner."""
        for mode, kind in (
            ("same_slot_kind_conflict", "target_mapping_conflict"),
            ("distinct_slot", "target_ambiguous"),
        ):
            with self.subTest(mode=mode):
                raw, actual = self._read(mode)
                self.assertEqual(
                    actual["state"],
                    "conflict" if kind == "target_mapping_conflict" else "unknown",
                )
                self.assertEqual(actual["matches"], [])
                self.assertEqual(len(actual["occurrences"]), 2)
                self.assertEqual(
                    [row["declaration_locator"] for row in actual["occurrences"]],
                    [
                        "/sources/0/content/descriptor_targets/0",
                        "/sources/0/content/descriptor_targets/1",
                    ],
                )
                self.assertEqual(
                    actual["problems"],
                    [
                        {
                            "kind": kind,
                            "locator": "/sources/0/content/descriptor_targets",
                            "reason": _TARGET_PROBLEM_REASONS[kind],
                            "source_ref": {
                                "presence": "supplied",
                                "value": raw["sources"][0]["ref"],
                            },
                        }
                    ],
                )

    def test_unrelated_target_problem_does_not_block_exact_target(self):
        """L4 relevance table keeps unrelated target declarations local."""
        raw, actual = self._read("unrelated_target")
        self.assertEqual(actual["state"], "resolved")
        self.assertEqual(len(actual["occurrences"]), 2)
        self.assertEqual(len(actual["matches"]), 1)
        self.assertEqual(
            actual["matches"][0]["target_ref"], raw["claims"][0]["subject_ref"]
        )
        self.assertEqual(
            actual["problems"],
            [
                {
                    "kind": "kind_unresolved",
                    "locator": "/sources/0/content/descriptor_targets/1/descriptor_kind",
                    "reason": _TARGET_PROBLEM_REASONS["kind_unresolved"],
                    "source_ref": {
                        "presence": "supplied",
                        "value": raw["sources"][0]["ref"],
                    },
                }
            ],
        )

    def test_exact_duplicate_target_keeps_each_source_and_locator_occurrence(self):
        """L4 exact-match aggregation preserves duplicate provenance and locator order."""
        raw, actual = self._read("duplicate_declaration")
        source_ref = raw["sources"][0]["ref"]
        self.assertEqual(actual["state"], "resolved")
        self.assertEqual(len(actual["occurrences"]), 2)
        self.assertEqual(len(actual["matches"]), 1)
        self.assertEqual(actual["matches"][0]["source_refs"], [source_ref, source_ref])
        self.assertEqual(
            actual["matches"][0]["declaration_locators"],
            [
                "/sources/0/content/descriptor_targets/0",
                "/sources/0/content/descriptor_targets/1",
            ],
        )
        self.assertEqual(actual["matches"][0]["slot_locators"], ["/descriptors/0"])

    def test_all_candidates_are_preserved_but_match_indices_select_all_equal_root_refs(
        self,
    ):
        """L4 all-candidate preservation is distinct from match selection."""
        raw, actual = self._read("candidate_scope")
        all_candidate_refs = raw["candidates"]
        self.assertEqual(actual["candidate_indices"], [0, 1, 2])
        self.assertEqual(actual["candidate_refs"], all_candidate_refs)
        self.assertEqual(actual["state"], "resolved")
        self.assertEqual(len(actual["matches"]), 1)
        self.assertEqual(actual["matches"][0]["candidate_indices"], [0, 2])
        self.assertEqual(
            actual["matches"][0]["candidate_refs"],
            [
                all_candidate_refs[0],
                all_candidate_refs[2],
            ],
        )
        self.assertEqual(actual["problems"], [])


if __name__ == "__main__":
    unittest.main()
