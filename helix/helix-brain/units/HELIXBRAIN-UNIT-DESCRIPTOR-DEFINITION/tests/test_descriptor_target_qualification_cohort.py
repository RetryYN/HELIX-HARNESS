"""Qualification relevance within a descriptor-target cohort.

Independent expectations follow L4
``/dependency_semantic_ports/descriptor_target_contract``: relevance_table/0,
cohort_result_contract/{scope,unknown,resolved,preservation}, ordered_branches/1,
and return_field_mapping for occurrences and problems.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definitions import validate_supply_input
from descriptor_target_reader import read_descriptor_replacement_target
from identity_input_fixtures import _append_qualified_source


_OWNER_SOURCE_REASON = (
    "同knowledge原record/provenanceから既存資格を満たすowner sourceへ"
    "解決できない。原所在と不足を保持する。"
)


class TestDescriptorTargetQualificationCohort(unittest.TestCase):
    def _unqualify_source_bytes(self, source):
        """Retain the declared digest/body and corrupt only the supplied bytes."""
        source["content_bytes"] = "{ broken source bytes"

    def _append_qualified_copy(self, raw):
        original_source = raw["sources"][0]
        declaration = copy.deepcopy(original_source["content"]["descriptor_targets"][0])
        binding = copy.deepcopy(raw["binding"])
        qualified = _append_qualified_source(
            raw,
            identity="SYNTHETIC-G1B-QUALIFIED-TARGET-SOURCE",
            owner=original_source["ref"]["owner"],
            scope=copy.deepcopy(original_source["ref"]["scope"]),
            content={
                "binding": binding,
                "descriptor_targets": [copy.deepcopy(declaration)],
            },
            qualification_identity="SYNTHETIC-G1B-QUALIFIED-TARGET-QUALIFICATION",
            root_identity="SYNTHETIC-G1B-QUALIFIED-TARGET-ROOT",
            revision=original_source["ref"]["revision"],
        )
        matching_records = [
            record
            for record in raw["knowledge_records"]
            if record.get("ref") == raw["claims"][0]["binding"].get("knowledge_ref")
        ]
        if len(matching_records) != 1:
            raise ValueError(
                "fixture must have exactly one original Claim knowledge record"
            )
        matching_records[0]["provenance_refs"].append(copy.deepcopy(qualified["ref"]))
        return qualified, declaration

    def _read(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsInstance(
            validated["input"],
            dict,
            "setup: FN0 must retain the raw snapshot; do not synthesize ValidatedSupply",
        )
        self.assertEqual(validated["input"], raw_before)
        validated_before = copy.deepcopy(validated)
        result = read_descriptor_replacement_target(
            validated, raw["claims"][0], "/claims/0"
        )
        self.assertEqual(raw, raw_before, "target reading must not mutate raw input")
        self.assertEqual(
            validated, validated_before, "target reading must not mutate FN0 output"
        )
        return validated, result

    def _expected_occurrence(self, source, source_index, declaration_index=0):
        return {
            "source_ref": {
                "presence": "supplied",
                "value": copy.deepcopy(source["ref"]),
            },
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

    def _expected_unqualified_problem(self, source, source_index):
        return {
            "kind": "owner_source_unresolved",
            "locator": f"/sources/{source_index}",
            "reason": _OWNER_SOURCE_REASON,
            "source_ref": {
                "presence": "supplied",
                "value": copy.deepcopy(source["ref"]),
            },
        }

    def test_unqualified_exact_declaration_is_retained_but_qualified_copy_resolves(
        self,
    ):
        raw = descriptor_claim_input("positive")
        unqualified_source = raw["sources"][0]
        self._unqualify_source_bytes(unqualified_source)
        qualified_source, declaration = self._append_qualified_copy(raw)
        record = next(
            record
            for record in raw["knowledge_records"]
            if record.get("ref") == raw["claims"][0]["binding"].get("knowledge_ref")
        )
        unqualified_index = next(
            index
            for index, source in enumerate(raw["sources"])
            if source is unqualified_source
        )
        qualified_index = next(
            index
            for index, source in enumerate(raw["sources"])
            if source is qualified_source
        )

        validated, actual = self._read(raw)

        # FN0's qualification result is a setup fact, not the target-reader oracle.
        self.assertIn(unqualified_source["ref"], validated["unusable_source_refs"])
        self.assertNotIn(qualified_source["ref"], validated["unusable_source_refs"])
        self.assertEqual(actual["state"], "resolved")
        self.assertEqual(len(actual["matches"]), 1)
        match = actual["matches"][0]
        self.assertEqual(match["target_ref"], raw["claims"][0]["subject_ref"])
        self.assertEqual(match["binding"], raw["claims"][0]["binding"])
        self.assertEqual(match["slot_identity"], declaration["slot_identity"])
        self.assertEqual(match["descriptor_kind"], declaration["descriptor_kind"])
        self.assertEqual(match["source_refs"], [qualified_source["ref"]])
        self.assertEqual(
            match["declaration_locators"],
            [
                f"/sources/{qualified_index}/content/descriptor_targets/0",
            ],
        )
        self.assertNotIn(unqualified_source["ref"], match["source_refs"])
        self.assertEqual(
            actual["occurrences"],
            [
                self._expected_occurrence(unqualified_source, unqualified_index),
                self._expected_occurrence(qualified_source, qualified_index),
            ],
        )
        self.assertEqual(
            actual["problems"],
            [
                self._expected_unqualified_problem(
                    unqualified_source, unqualified_index
                ),
            ],
        )
        self.assertEqual(record["provenance_refs"][-1], qualified_source["ref"])

    def test_single_unqualified_exact_declaration_remains_unknown(self):
        raw = descriptor_claim_input("positive")
        unqualified_source = raw["sources"][0]
        self._unqualify_source_bytes(unqualified_source)
        unqualified_index = next(
            index
            for index, source in enumerate(raw["sources"])
            if source is unqualified_source
        )

        validated, actual = self._read(raw)

        self.assertIn(unqualified_source["ref"], validated["unusable_source_refs"])
        self.assertEqual(actual["state"], "unknown")
        self.assertEqual(actual["matches"], [])
        self.assertEqual(
            actual["occurrences"],
            [
                self._expected_occurrence(unqualified_source, unqualified_index),
            ],
        )
        self.assertEqual(
            actual["problems"],
            [
                self._expected_unqualified_problem(
                    unqualified_source, unqualified_index
                ),
            ],
        )


if __name__ == "__main__":
    unittest.main()
