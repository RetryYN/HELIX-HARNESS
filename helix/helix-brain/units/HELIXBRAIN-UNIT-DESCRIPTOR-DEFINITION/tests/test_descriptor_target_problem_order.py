"""Original-order projection of target-reader problems across sources.

Independent expectations follow L4
``/dependency_semantic_ports/descriptor_target_contract/return_field_mapping``:
problems retain source/index/field order, while each occurrence remains in
source and declaration order.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definitions import validate_supply_input
from descriptor_target_reader import read_descriptor_replacement_target
from identity_input_fixtures import _append_qualified_source


_REASONS = {
    "owner_source_unresolved": "同knowledge原record/provenanceから既存資格を満たすowner sourceへ解決できない。原所在と不足を保持する。",
    "kind_unresolved": "owner原target宣言のdescriptor_kindが既決15名へ結べない。原値を保持する。",
    "target_mapping_conflict": "同target/slotの既知kind対応又はcaller slotの既知kind対応が相反する。原宣言と元slotを保持する。",
}


class TestDescriptorTargetProblemOrder(unittest.TestCase):
    def _append_target_source(self, raw, declarations, suffix):
        first = raw["sources"][0]
        source = _append_qualified_source(
            raw,
            identity=f"SYNTHETIC-G1B-PROBLEM-SOURCE-{suffix}",
            owner=first["ref"]["owner"],
            scope=copy.deepcopy(first["ref"]["scope"]),
            content={
                "binding": copy.deepcopy(raw["binding"]),
                "descriptor_targets": copy.deepcopy(declarations),
            },
            qualification_identity=f"SYNTHETIC-G1B-PROBLEM-QUALIFICATION-{suffix}",
            root_identity=f"SYNTHETIC-G1B-PROBLEM-ROOT-{suffix}",
            revision=first["ref"]["revision"],
        )
        matching_records = [
            record for record in raw["knowledge_records"]
            if record.get("ref") == raw["claims"][0]["binding"].get("knowledge_ref")
        ]
        if len(matching_records) != 1:
            raise ValueError("fixture must have one original Claim knowledge record")
        matching_records[0]["provenance_refs"].append(copy.deepcopy(source["ref"]))
        source_index = next(
            index for index, candidate in enumerate(raw["sources"])
            if candidate is source
        )
        return source_index, source

    def _read(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsInstance(
            validated["input"], dict,
            "setup: FN0 must preserve the raw snapshot; do not synthesize ValidatedSupply",
        )
        self.assertEqual(validated["input"], raw_before)
        validated_before = copy.deepcopy(validated)
        actual = read_descriptor_replacement_target(
            validated, raw["claims"][0], "/claims/0"
        )
        self.assertEqual(raw, raw_before, "target reading must not mutate raw input")
        self.assertEqual(validated, validated_before, "target reading must not mutate FN0 output")
        return validated, actual

    def _occurrence(self, source, source_index, declaration_index):
        return {
            "source_ref": {"presence": "supplied", "value": copy.deepcopy(source["ref"])},
            "source_locator": f"/sources/{source_index}",
            "declaration_locator": (
                f"/sources/{source_index}/content/descriptor_targets/{declaration_index}"
            ),
            "declaration": copy.deepcopy(
                source["content"]["descriptor_targets"][declaration_index]
            ),
            "source_binding": {
                "presence": "supplied",
                "value": copy.deepcopy(source["content"]["binding"]),
            },
        }

    def _problem(self, kind, locator, source):
        return {
            "kind": kind,
            "locator": locator,
            "reason": _REASONS[kind],
            "source_ref": {"presence": "supplied", "value": copy.deepcopy(source["ref"])},
        }

    def test_source_and_declaration_order_with_unqualified_later_source(self):
        raw = descriptor_claim_input("unrelated_target")
        qualified_source = raw["sources"][0]
        exact_declaration = copy.deepcopy(
            qualified_source["content"]["descriptor_targets"][0]
        )
        unqualified_index, unqualified_source = self._append_target_source(
            raw, [exact_declaration], "UNQUALIFIED-LATER"
        )
        # Keep the declaration, decoded body, ref, and qualification record intact;
        # only the supplied bytes fail FN0's existing qualification check.
        unqualified_source["content_bytes"] = "{ broken owner source bytes"
        qualified_index = next(
            index for index, source in enumerate(raw["sources"])
            if source is qualified_source
        )
        raw_before = copy.deepcopy(raw)

        validated, actual = self._read(raw)

        self.assertNotIn(qualified_source["ref"], validated["unusable_source_refs"])
        self.assertIn(unqualified_source["ref"], validated["unusable_source_refs"])
        self.assertEqual(actual["state"], "resolved")
        self.assertEqual(actual["occurrences"], [
            self._occurrence(qualified_source, qualified_index, 0),
            self._occurrence(qualified_source, qualified_index, 1),
            self._occurrence(unqualified_source, unqualified_index, 0),
        ])
        self.assertEqual(len(actual["matches"]), 1)
        self.assertEqual(actual["matches"][0]["source_refs"], [qualified_source["ref"]])
        self.assertEqual(actual["matches"][0]["declaration_locators"], [
            f"/sources/{qualified_index}/content/descriptor_targets/0",
        ])
        self.assertEqual(actual["problems"], [
            self._problem(
                "kind_unresolved",
                f"/sources/{qualified_index}/content/descriptor_targets/1/descriptor_kind",
                qualified_source,
            ),
            self._problem("owner_source_unresolved", f"/sources/{unqualified_index}", unqualified_source),
        ])
        self.assertEqual(raw, raw_before)

    def test_group_problem_precedes_later_source_local_problem(self):
        raw = descriptor_claim_input("same_slot_kind_conflict")
        first_source = raw["sources"][0]
        unrelated = copy.deepcopy(first_source["content"]["descriptor_targets"][0])
        unrelated["target_ref"]["identity"] += "-different-target"
        unrelated["descriptor_kind"] = "unrecognized-kind"
        later_index, later_source = self._append_target_source(
            raw, [unrelated], "LATER-UNRELATED-KIND"
        )
        first_index = next(
            index for index, source in enumerate(raw["sources"])
            if source is first_source
        )
        raw_before = copy.deepcopy(raw)

        validated, actual = self._read(raw)

        self.assertEqual(validated["unusable_source_refs"], [])
        self.assertEqual(actual["state"], "conflict")
        self.assertEqual(actual["matches"], [])
        self.assertEqual(actual["occurrences"], [
            self._occurrence(first_source, first_index, 0),
            self._occurrence(first_source, first_index, 1),
            self._occurrence(later_source, later_index, 0),
        ])
        self.assertEqual(actual["problems"], [
            self._problem(
                "target_mapping_conflict",
                f"/sources/{first_index}/content/descriptor_targets",
                first_source,
            ),
            self._problem(
                "kind_unresolved",
                f"/sources/{later_index}/content/descriptor_targets/0/descriptor_kind",
                later_source,
            ),
        ])
        self.assertEqual(raw, raw_before)


if __name__ == "__main__":
    unittest.main()
