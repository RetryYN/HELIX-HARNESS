"""Target reader cohort boundaries from same-call FN0 inputs.

The input starts from ``descriptor_claim_input('positive')``. Mutated source
bodies are reserialized with the existing fixture helper and their original
knowledge provenance/fact links are synchronized. Expectations come from L4
``descriptor_target_contract`` (ordered branches, relevance table, cohort
result and optional Ref comparison) rather than the target reader's output.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definitions import validate_supply_input
from descriptor_target_reader import read_descriptor_replacement_target
from identity_input_fixtures import _write_source_content


TARGET_READ_FIELDS = {
    "claim_locator",
    "claim",
    "candidate_indices",
    "candidate_refs",
    "occurrences",
    "matches",
    "state",
    "problems",
}
TARGET_OCCURRENCE_FIELDS = {
    "source_ref",
    "source_locator",
    "declaration_locator",
    "declaration",
    "source_binding",
}
TARGET_MATCH_FIELDS = {
    "target_ref",
    "binding",
    "slot_identity",
    "descriptor_kind",
    "source_refs",
    "declaration_locators",
    "slot_locators",
    "candidate_indices",
    "candidate_refs",
}


def _rewrite_source_body_and_links(raw, source_index, content):
    """Keep bytes, Qualification digest, KnowledgeRecord, and fact links aligned."""
    source = raw["sources"][source_index]
    old_ref = copy.deepcopy(source["ref"])
    _write_source_content(raw, source, content)
    new_ref = copy.deepcopy(source["ref"])

    for record in raw.get("knowledge_records", []):
        record["provenance_refs"] = [
            copy.deepcopy(new_ref) if ref == old_ref else copy.deepcopy(ref)
            for ref in record.get("provenance_refs", [])
        ]
    for slot in raw.get("descriptors", []):
        for fact in slot.get("facts", []):
            if fact.get("source_ref") == old_ref:
                fact["source_ref"] = copy.deepcopy(new_ref)
    return new_ref


def _read_target(raw):
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    if validated["input"] is None or validated["input_issues"] or validated["unusable_source_refs"]:
        raise AssertionError("setup: FN0 must accept the synchronized raw source")
    if validated["input"] != raw_before:
        raise AssertionError("setup: FN0 must preserve the raw input snapshot")
    validated_before = copy.deepcopy(validated)
    try:
        return read_descriptor_replacement_target(
            validated,
            raw["claims"][0],
            "/claims/0",
        )
    finally:
        if raw != raw_before:
            raise AssertionError("walk mutated raw input")
        if validated != validated_before:
            raise AssertionError("walk mutated ValidatedSupply")


class TestDescriptorTargetCohorts(unittest.TestCase):
    def _target(self, raw):
        target = _read_target(raw)
        self.assertEqual(set(target), TARGET_READ_FIELDS)
        self.assertTrue(all(set(row) == TARGET_OCCURRENCE_FIELDS for row in target["occurrences"]))
        self.assertTrue(all(set(row) == TARGET_MATCH_FIELDS for row in target["matches"]))
        self.assertEqual(target["claim_locator"], "/claims/0")
        self.assertEqual(target["claim"], raw["claims"][0])
        return target

    def test_out_of_type_target_owner_is_local_unknown_not_known_conflict(self):
        """An invalid typed Ref field remains unresolved in its own target cohort."""
        raw = descriptor_claim_input("positive")
        source = raw["sources"][0]
        content = copy.deepcopy(source["content"])
        content["descriptor_targets"][0]["target_ref"]["owner"] = 17
        _rewrite_source_body_and_links(raw, 0, content)

        target = self._target(raw)
        self.assertEqual(target["state"], "unknown")
        self.assertEqual(target["matches"], [])
        self.assertTrue(any(problem["kind"] == "target_ref_unresolved" for problem in target["problems"]))
        self.assertFalse(any(problem["kind"] in {"target_ref_conflict", "target_mapping_conflict"} for problem in target["problems"]))

    def test_null_source_binding_revision_is_unresolved_not_binding_conflict(self):
        """A nullable source Ref revision prevents a known full-Binding mismatch."""
        raw = descriptor_claim_input("positive")
        source = raw["sources"][0]
        content = copy.deepcopy(source["content"])
        content["binding"]["knowledge_ref"]["revision"] = None
        _rewrite_source_body_and_links(raw, 0, content)
        raw_before = copy.deepcopy(raw)

        target = self._target(raw)
        self.assertEqual(target["state"], "unknown")
        self.assertEqual(target["matches"], [])
        self.assertTrue(any(problem["kind"] == "binding_unresolved" for problem in target["problems"]))
        self.assertFalse(any(problem["kind"] == "binding_conflict" for problem in target["problems"]))
        self.assertEqual(raw, raw_before)

    def test_omitted_optional_ref_location_and_digest_keep_exact_binding_match(self):
        """Absent optional Ref members do not create a new identity gate."""
        raw = descriptor_claim_input("positive")
        source = raw["sources"][0]
        content = copy.deepcopy(source["content"])
        source_binding = content["binding"]
        refs = [source_binding[name] for name in (
            "template_ref", "knowledge_ref", "requirement_ref", "oracle_ref", "pack_ref"
        )]
        refs.extend(source_binding["pack_dependency_versions"])
        for ref in refs:
            ref.pop("source_locator", None)
            ref.pop("sha256", None)
        _rewrite_source_body_and_links(raw, 0, content)
        raw_before = copy.deepcopy(raw)

        target = self._target(raw)
        self.assertEqual(target["state"], "resolved")
        self.assertEqual(len(target["matches"]), 1)
        self.assertEqual(target["matches"][0]["binding"], source_binding)
        self.assertEqual(
            target["occurrences"][0]["source_binding"],
            {"presence": "supplied", "value": source_binding},
        )
        self.assertEqual(raw, raw_before)

    def test_exact_target_survives_other_known_binding_and_unresolved_target_frame(self):
        """A separate source Binding with an incomplete target frame cannot cancel exact evidence."""
        raw = descriptor_claim_input("positive")
        self.assertEqual(raw["sources"][3]["role"], "semantic_json")
        source0_ref = copy.deepcopy(raw["sources"][0]["ref"])
        source3 = raw["sources"][3]
        content = copy.deepcopy(source3["content"])
        self.assertIsInstance(content["binding"]["pack_artifact_version"], str)
        content["binding"]["pack_artifact_version"] = (
            content["binding"]["pack_artifact_version"] + "-different"
        )
        target_ref = copy.deepcopy(raw["claims"][0]["subject_ref"])
        target_ref["revision"] = None
        content["descriptor_targets"] = [{
            "target_ref": target_ref,
            "slot_identity": raw["descriptors"][0]["slot_identity"],
            "descriptor_kind": raw["descriptors"][0]["descriptor_kind"],
        }]
        source3_ref = _rewrite_source_body_and_links(raw, 3, content)
        record = raw["knowledge_records"][0]
        record["provenance_refs"].append(copy.deepcopy(source3_ref))
        raw_before = copy.deepcopy(raw)

        target = self._target(raw)
        self.assertEqual(target["state"], "resolved")
        self.assertEqual(len(target["occurrences"]), 2)
        self.assertEqual(
            [row["source_locator"] for row in target["occurrences"]],
            ["/sources/0", "/sources/3"],
        )
        self.assertEqual(len(target["matches"]), 1)
        match = target["matches"][0]
        self.assertEqual(match["source_refs"], [source0_ref])
        self.assertEqual(match["declaration_locators"], ["/sources/0/content/descriptor_targets/0"])
        self.assertEqual(raw, raw_before)

    def test_physical_reference_only_duplicate_does_not_add_owner_witness(self):
        """A duplicate physical row with reference_only role is not another owner declaration."""
        raw = descriptor_claim_input("positive")
        duplicate = copy.deepcopy(raw["sources"][0])
        duplicate["role"] = "reference_only"
        raw["sources"].append(duplicate)
        raw_before = copy.deepcopy(raw)

        target = self._target(raw)
        self.assertEqual(target["state"], "resolved")
        self.assertEqual(len(target["matches"]), 1)
        self.assertEqual(target["matches"][0]["source_refs"], [raw["sources"][0]["ref"]])
        self.assertEqual(target["matches"][0]["declaration_locators"], ["/sources/0/content/descriptor_targets/0"])
        self.assertEqual(raw, raw_before)


if __name__ == "__main__":
    unittest.main()
