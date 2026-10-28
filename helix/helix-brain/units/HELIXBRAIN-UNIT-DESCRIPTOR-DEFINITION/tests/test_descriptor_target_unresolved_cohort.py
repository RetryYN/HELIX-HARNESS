"""L4 unresolved target/Binding cohort boundaries for the private target reader."""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definitions import validate_supply_input
from descriptor_target_reader import read_descriptor_replacement_target
from identity_input_fixtures import _same_ref_without_digest, _write_source_content


def _rewrite_source_and_sync(raw, source_index, content):
    source = raw["sources"][source_index]
    old_ref = copy.deepcopy(source["ref"])
    _write_source_content(raw, source, content)
    new_ref = copy.deepcopy(source["ref"])
    for record in raw.get("knowledge_records", []):
        record["provenance_refs"] = [
            copy.deepcopy(new_ref)
            if _same_ref_without_digest(ref, old_ref)
            else copy.deepcopy(ref)
            for ref in record.get("provenance_refs", [])
        ]
    for slot in raw.get("descriptors", []):
        for fact in slot.get("facts", []):
            if _same_ref_without_digest(fact.get("source_ref"), old_ref):
                fact["source_ref"] = copy.deepcopy(new_ref)
    return new_ref


def _read(raw):
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    if (
        validated["input"] is None
        or validated["input_issues"]
        or validated["unusable_source_refs"]
    ):
        raise AssertionError(
            "setup: FN0 accepts the synchronized source and provenance"
        )
    if validated["input"] != raw_before:
        raise AssertionError("setup: FN0 preserves the original raw snapshot")
    validated_before = copy.deepcopy(validated)
    result = read_descriptor_replacement_target(
        validated, raw["claims"][0], "/claims/0"
    )
    if raw != raw_before or validated != validated_before:
        raise AssertionError("reader must not mutate raw input or ValidatedSupply")
    return result


class TestDescriptorTargetUnresolvedCohort(unittest.TestCase):
    def _append_source3(
        self, raw, *, null_binding_revision, different_artifact_version=False
    ):
        source3 = raw["sources"][3]
        content = copy.deepcopy(source3["content"])
        content["binding"] = copy.deepcopy(raw["binding"])
        if null_binding_revision:
            content["binding"]["knowledge_ref"]["revision"] = None
        if different_artifact_version:
            content["binding"]["pack_artifact_version"] += "-different"
        target_ref = copy.deepcopy(raw["claims"][0]["subject_ref"])
        target_ref["revision"] = None
        content["descriptor_targets"] = [
            {
                "target_ref": target_ref,
                "slot_identity": raw["descriptors"][0]["slot_identity"],
                "descriptor_kind": raw["descriptors"][0]["descriptor_kind"],
            }
        ]
        source3_ref = _rewrite_source_and_sync(raw, 3, content)
        raw["knowledge_records"][0]["provenance_refs"].append(
            copy.deepcopy(source3_ref)
        )

    def test_unresolved_same_identity_frame_and_binding_do_not_disappear(self):
        """L4 keeps a same-identity, unresolvable current cohort unknown beside an exact witness."""
        raw = descriptor_claim_input("positive")
        self._append_source3(raw, null_binding_revision=True)

        result = _read(raw)
        self.assertEqual(result["state"], "unknown")
        self.assertEqual(result["matches"], [])
        self.assertEqual(
            [row["source_locator"] for row in result["occurrences"]],
            ["/sources/0", "/sources/3"],
        )
        self.assertEqual(
            [row["declaration_locator"] for row in result["occurrences"]],
            [
                "/sources/0/content/descriptor_targets/0",
                "/sources/3/content/descriptor_targets/0",
            ],
        )
        observed = {
            (problem["kind"], problem["locator"]) for problem in result["problems"]
        }
        self.assertIn(
            (
                "target_ref_unresolved",
                "/sources/3/content/descriptor_targets/0/target_ref",
            ),
            observed,
        )
        self.assertIn(("binding_unresolved", "/sources/3/content/binding"), observed)

    def test_later_known_binding_difference_separates_unresolved_ref_member(self):
        """A known scalar mismatch identifies another Binding despite one unresolved Ref member."""
        raw = descriptor_claim_input("positive")
        self._append_source3(
            raw,
            null_binding_revision=True,
            different_artifact_version=True,
        )

        result = _read(raw)
        self.assertEqual(result["state"], "resolved")
        self.assertEqual(len(result["matches"]), 1)
        self.assertEqual(
            result["matches"][0]["declaration_locators"],
            ["/sources/0/content/descriptor_targets/0"],
        )
        self.assertTrue(
            any(
                problem["kind"] == "binding_conflict"
                and problem["locator"] == "/sources/3/content/binding"
                for problem in result["problems"]
            )
        )


if __name__ == "__main__":
    unittest.main()
