"""Unrelated malformed target Refs remain local beside an exact target match."""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_target_reader import read_descriptor_replacement_target
from descriptor_definitions import validate_supply_input
from identity_input_fixtures import _same_ref_without_digest, _write_source_content


TARGET_REF_UNRESOLVED_REASON = (
    "owner原target Refの比較必須memberが未供給/null/型外である。対応するtargetを補完しない。"
)


def _sync_source_content(raw, source, content):
    old_ref = copy.deepcopy(source["ref"])
    _write_source_content(raw, source, content)
    new_ref = copy.deepcopy(source["ref"])
    for record in raw.get("knowledge_records", []):
        record["provenance_refs"] = [
            copy.deepcopy(new_ref) if _same_ref_without_digest(ref, old_ref)
            else copy.deepcopy(ref)
            for ref in record.get("provenance_refs", [])
        ]
    for slot in raw.get("descriptors", []):
        for fact in slot.get("facts", []):
            if _same_ref_without_digest(fact.get("source_ref"), old_ref):
                fact["source_ref"] = copy.deepcopy(new_ref)


class TestDescriptorTargetLocalRefProblems(unittest.TestCase):
    def test_unrelated_invalid_ref_is_retained_without_blocking_exact_match(self):
        """L4 relevance keeps an unrelated target's typed Ref problem local."""
        for invalid_member in ("owner", "revision"):
            with self.subTest(invalid_member=invalid_member):
                raw = descriptor_claim_input("positive")
                source = raw["sources"][0]
                content = copy.deepcopy(source["content"])
                exact_declaration = copy.deepcopy(content["descriptor_targets"][0])
                unrelated = copy.deepcopy(exact_declaration)
                unrelated["target_ref"]["identity"] += "-unrelated"
                unrelated["target_ref"][invalid_member] = 7
                content["descriptor_targets"].append(unrelated)
                _sync_source_content(raw, source, content)

                raw_before = copy.deepcopy(raw)
                validated = validate_supply_input(raw)
                self.assertIsInstance(validated["input"], dict)
                self.assertEqual(validated["input"], raw_before)
                self.assertEqual(validated["input_issues"], [])
                self.assertEqual(validated["unusable_source_refs"], [])
                validated_before = copy.deepcopy(validated)

                actual = read_descriptor_replacement_target(
                    validated, raw["claims"][0], "/claims/0"
                )

                self.assertEqual(raw, raw_before)
                self.assertEqual(validated, validated_before)
                self.assertEqual(actual["state"], "resolved")
                self.assertEqual(len(actual["occurrences"]), 2)
                self.assertEqual(
                    [row["declaration"] for row in actual["occurrences"]],
                    content["descriptor_targets"],
                )
                self.assertEqual(len(actual["matches"]), 1)
                self.assertEqual(actual["matches"][0]["target_ref"], raw["claims"][0]["subject_ref"])
                self.assertEqual(
                    actual["matches"][0]["declaration_locators"],
                    ["/sources/0/content/descriptor_targets/0"],
                )
                self.assertEqual(actual["problems"], [{
                    "kind": "target_ref_unresolved",
                    "locator": "/sources/0/content/descriptor_targets/1/target_ref",
                    "reason": TARGET_REF_UNRESOLVED_REASON,
                    "source_ref": {"presence": "supplied", "value": raw["sources"][0]["ref"]},
                }])


if __name__ == "__main__":
    unittest.main()
