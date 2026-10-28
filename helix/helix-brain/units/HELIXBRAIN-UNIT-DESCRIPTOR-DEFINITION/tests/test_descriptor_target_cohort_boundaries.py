"""独立target cohortの部分問題とcohort state境界を固定する。

期待値はL4 ``descriptor_target_contract`` のrelevance_table、
cohort_result_contract、return_field_mapping、problem_locatorから導く。
各入力はFN0を実際に通し、source bodyを変える場合は既存bytes/Q/
provenance/fact参照を同期している。
"""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definitions import validate_supply_input
from descriptor_target_reader import read_descriptor_replacement_target
from identity_input_fixtures import _write_source_content


_KINDS = (
    "template identity",
    "version",
    "layer/pair",
    "applicability",
    "required input",
    "required section",
    "required field",
    "relation",
    "意味owner",
    "trace",
    "negative oracle",
    "measurement",
    "completion",
    "downstream kind",
    "supersession",
)

_REASONS = {
    "target_ref_unresolved": "owner原target Refの比較必須memberが未供給/null/型外である。対応するtargetを補完しない。",
    "target_ref_conflict": "原Claimとowner宣言のtarget identityは同じだがrevision/scope/owner等の既存比較frameが既知に異なる。",
    "binding_unresolved": "owner原target宣言のfull Bindingを原Claim.bindingへ比較できない。原値を保持する。",
    "kind_unresolved": "owner原target宣言のdescriptor_kindが既決15名へ結べない。原値を保持する。",
    "declaration_shape": "owner原target宣言の構造を型付きviewへ対応できない。原宣言を保持する。",
    "target_mapping_conflict": "同target/slotの既知kind対応又はcaller slotの既知kind対応が相反する。原宣言と元slotを保持する。",
}


def _rewrite_source_body_and_links(raw, source_index, content):
    """bytes、Qualification、KB provenance、fact linksを同じsource Refへ同期する。"""
    source = raw["sources"][source_index]
    old_ref = copy.deepcopy(source["ref"])
    _write_source_content(raw, source, content)
    new_ref = copy.deepcopy(source["ref"])
    for record in raw.get("knowledge_records", []):
        record["provenance_refs"] = [
            copy.deepcopy(new_ref) if ref == old_ref else copy.deepcopy(ref)
            for ref in record.get("provenance_refs", [])
        ]
    for descriptor in raw.get("descriptors", []):
        for fact in descriptor.get("facts", []):
            if fact.get("source_ref") == old_ref:
                fact["source_ref"] = copy.deepcopy(new_ref)
    return new_ref


def _read(raw):
    """FN0受理とraw/V不変を確かめて、同じsnapshotのtarget readを返す。"""
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    if (
        validated["input"] is None
        or validated["input_issues"]
        or validated["unusable_source_refs"]
    ):
        raise AssertionError("setup: FN0 must accept the synchronized source input")
    if validated["input"] != raw_before:
        raise AssertionError("setup: FN0 must preserve the original raw snapshot")
    validated_before = copy.deepcopy(validated)
    result = read_descriptor_replacement_target(
        validated, raw["claims"][0], "/claims/0"
    )
    if raw != raw_before:
        raise AssertionError("target reader mutated raw input")
    if validated != validated_before:
        raise AssertionError("target reader mutated ValidatedSupply")
    return result


class TestDescriptorTargetCohortBoundaries(unittest.TestCase):
    def _positive(self):
        return descriptor_claim_input("positive")

    def _declaration(self, raw):
        return copy.deepcopy(raw["sources"][0]["content"]["descriptor_targets"][0])

    def _problem_tuples(self, result):
        return [
            (row["kind"], row["locator"], row["reason"]) for row in result["problems"]
        ]

    def test_same_identity_unresolved_frame_suppresses_exact_match(self):
        """同identityの比較不能frameはexact宣言と同cohortをunknownにする。"""
        raw = self._positive()
        source = raw["sources"][0]
        content = copy.deepcopy(source["content"])
        unresolved = copy.deepcopy(content["descriptor_targets"][0])
        unresolved["target_ref"]["revision"] = None
        content["descriptor_targets"].append(unresolved)
        source_ref = _rewrite_source_body_and_links(raw, 0, content)
        before = copy.deepcopy(raw)

        result = _read(raw)
        self.assertEqual(result["state"], "unknown")
        self.assertEqual(result["matches"], [])
        self.assertEqual(len(result["occurrences"]), 2)
        self.assertEqual(
            [row["declaration_locator"] for row in result["occurrences"]],
            [
                "/sources/0/content/descriptor_targets/0",
                "/sources/0/content/descriptor_targets/1",
            ],
        )
        self.assertEqual(
            self._problem_tuples(result),
            [
                (
                    "target_ref_unresolved",
                    "/sources/0/content/descriptor_targets/1/target_ref",
                    _REASONS["target_ref_unresolved"],
                )
            ],
        )
        self.assertEqual(
            result["problems"][0]["source_ref"],
            {"presence": "supplied", "value": source_ref},
        )
        self.assertEqual(raw, before)

    def test_unassociated_identity_problem_does_not_cancel_exact_match(self):
        """identity未帰属宣言は局所problemを残すが明示exact対応を相殺しない。"""
        raw = self._positive()
        content = copy.deepcopy(raw["sources"][0]["content"])
        unassociated = copy.deepcopy(content["descriptor_targets"][0])
        unassociated["target_ref"]["identity"] = None
        content["descriptor_targets"].append(unassociated)
        _rewrite_source_body_and_links(raw, 0, content)
        before = copy.deepcopy(raw)

        result = _read(raw)
        self.assertEqual(result["state"], "resolved")
        self.assertEqual(len(result["matches"]), 1)
        self.assertEqual(
            result["matches"][0]["declaration_locators"],
            ["/sources/0/content/descriptor_targets/0"],
        )
        self.assertEqual(len(result["occurrences"]), 2)
        self.assertEqual(
            self._problem_tuples(result),
            [
                (
                    "target_ref_unresolved",
                    "/sources/0/content/descriptor_targets/1/target_ref",
                    _REASONS["target_ref_unresolved"],
                )
            ],
        )
        self.assertEqual(raw, before)

    def test_untyped_kind_or_slot_does_not_become_a_partial_match(self):
        """ExactRef/Bindingでもkind又はslotが型付き住所でなければcohort全体がunknown。"""
        cases = (
            (
                "unknown kind",
                "descriptor_kind",
                "unrecognized-kind",
                "kind_unresolved",
                "/descriptor_kind",
            ),
            ("non-string slot", "slot_identity", 17, "declaration_shape", ""),
        )
        for label, member, value, problem_kind, suffix in cases:
            with self.subTest(case=label):
                raw = self._positive()
                content = copy.deepcopy(raw["sources"][0]["content"])
                invalid = copy.deepcopy(content["descriptor_targets"][0])
                invalid[member] = value
                content["descriptor_targets"].append(invalid)
                _rewrite_source_body_and_links(raw, 0, content)
                before = copy.deepcopy(raw)

                result = _read(raw)
                self.assertEqual(result["state"], "unknown")
                self.assertEqual(result["matches"], [])
                self.assertEqual(len(result["occurrences"]), 2)
                expected_locator = "/sources/0/content/descriptor_targets/1" + suffix
                self.assertEqual(
                    self._problem_tuples(result),
                    [(problem_kind, expected_locator, _REASONS[problem_kind])],
                )
                self.assertEqual(raw, before)

    def test_caller_slot_known_kind_difference_is_a_conflict(self):
        """owner宣言一件でも、対応slotの既知別kindはmapping conflictにする。"""
        raw = self._positive()
        owner_kind = raw["sources"][0]["content"]["descriptor_targets"][0][
            "descriptor_kind"
        ]
        raw["descriptors"][0]["descriptor_kind"] = next(
            kind for kind in _KINDS if kind != owner_kind
        )
        before = copy.deepcopy(raw)

        result = _read(raw)
        self.assertEqual(result["state"], "conflict")
        self.assertEqual(result["matches"], [])
        self.assertEqual(
            self._problem_tuples(result),
            [
                (
                    "target_mapping_conflict",
                    "/descriptors/0/descriptor_kind",
                    _REASONS["target_mapping_conflict"],
                )
            ],
        )
        self.assertEqual(raw, before)

    def test_only_known_different_target_frame_is_conflict(self):
        """同identityの既知別revisionだけではcurrent targetの一致を推定しない。"""
        raw = self._positive()
        content = copy.deepcopy(raw["sources"][0]["content"])
        different_frame = self._declaration(raw)
        different_frame["target_ref"]["revision"] += "-other"
        content["descriptor_targets"] = [different_frame]
        source_ref = _rewrite_source_body_and_links(raw, 0, content)
        before = copy.deepcopy(raw)

        result = _read(raw)
        self.assertEqual(result["state"], "conflict")
        self.assertEqual(result["matches"], [])
        self.assertEqual(len(result["occurrences"]), 1)
        self.assertEqual(
            self._problem_tuples(result),
            [
                (
                    "target_ref_conflict",
                    "/sources/0/content/descriptor_targets/0/target_ref",
                    _REASONS["target_ref_conflict"],
                )
            ],
        )
        self.assertEqual(
            result["problems"][0]["source_ref"],
            {"presence": "supplied", "value": source_ref},
        )
        self.assertEqual(raw, before)

    def test_partial_binding_problem_on_unrelated_target_is_local(self):
        """schema上供給されたpartial Bindingは保持し、比較不足だけを局所化する。"""
        raw = self._positive()
        source = raw["sources"][3]
        self.assertEqual(source["role"], "semantic_json")
        content = copy.deepcopy(source["content"])
        # このsource bodyに原Bindingを明示してから、1 memberだけを欠かせる。
        content["binding"] = copy.deepcopy(raw["binding"])
        partial_binding = copy.deepcopy(content["binding"])
        partial_binding.pop("knowledge_ref")
        content["binding"] = partial_binding
        unrelated = self._declaration(raw)
        unrelated["target_ref"]["identity"] += "-unrelated"
        content["descriptor_targets"] = [unrelated]
        source_ref = _rewrite_source_body_and_links(raw, 3, content)
        raw["knowledge_records"][0]["provenance_refs"].append(copy.deepcopy(source_ref))
        before = copy.deepcopy(raw)

        result = _read(raw)
        self.assertEqual(result["state"], "resolved")
        self.assertEqual(len(result["matches"]), 1)
        self.assertEqual(
            result["matches"][0]["source_refs"], [raw["sources"][0]["ref"]]
        )
        self.assertEqual(len(result["occurrences"]), 2)
        self.assertEqual(
            result["occurrences"][1]["source_binding"],
            {"presence": "supplied", "value": partial_binding},
        )
        self.assertEqual(
            self._problem_tuples(result),
            [
                (
                    "binding_unresolved",
                    "/sources/3/content/binding",
                    _REASONS["binding_unresolved"],
                )
            ],
        )
        self.assertEqual(
            result["problems"][0]["source_ref"],
            {"presence": "supplied", "value": source_ref},
        )
        self.assertEqual(raw, before)


if __name__ == "__main__":
    unittest.main()
