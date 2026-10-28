"""optional Refのabsenceとsource collectionの原presenceを区別する。"""

import copy
import json
import unittest

from descriptor_definitions import (
    compare_identity_versions_and_trace,
    validate_supply_input,
)
from identity_input_fixtures import _write_source_content, bilateral_input, normal_input


class TestIdentityOptionalRefPresence(unittest.TestCase):
    def test_optional_locator_or_digest_absence_does_not_disqualify_actual_ref(self):
        for member in ("source_locator", "sha256"):
            with self.subTest(member=member):
                raw = bilateral_input("outside")
                record = raw["compatibility_records"][0]
                right = next(
                    s for s in raw["sources"] if s["ref"] == record["source_ref"]
                )
                body = copy.deepcopy(right["content"])
                body["compatibility_range_declaration"]["actual_pack_ref"].pop(member)
                _write_source_content(raw, right, body)
                record["source_ref"] = copy.deepcopy(right["ref"])
                left = next(
                    s
                    for s in raw["sources"]
                    if isinstance(s["content"], dict)
                    and s["content"].get("compatibility_record_ref") == record["ref"]
                )
                body = copy.deepcopy(left["content"])
                body["counterpart_source_ref"] = copy.deepcopy(right["ref"])
                _write_source_content(raw, left, body)
                before = copy.deepcopy(raw)
                validated = validate_supply_input(raw)
                self.assertEqual(validated["input"], before)
                self.assertEqual(validated["input_issues"], [])
                result = compare_identity_versions_and_trace({"validated": validated})
                identity = next(
                    r for r in result["axes"] if r["axis"] == "pack.identity"
                )
                self.assertEqual(identity["state"], "resolved")
                self.assertEqual(raw, before)
                self.assertEqual(validated["input"], before)

    def test_source_missing_witness_keeps_collection_presence_separate_from_original_ref(
        self,
    ):
        raw = normal_input()
        source = raw["sources"].pop(0)
        raw["qualifications"] = [
            q for q in raw["qualifications"] if q["ref"] != source["qualification_ref"]
        ]
        before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input"], before)
        self.assertEqual(validated["input_issues"], [])
        result = compare_identity_versions_and_trace({"validated": validated})
        finding = next(r for r in result["findings"] if r["code"] == "source_missing")
        material = json.loads(finding["reason"].partition("\n")[2])
        observations = {
            r["locator"]: r["original_read"] for r in material["predicate_observations"]
        }
        self.assertIn("/sources", observations)
        self.assertEqual(
            observations["/sources"],
            {"presence": "supplied", "value": before["sources"]},
        )
        self.assertEqual(
            finding["source_refs"], [before["descriptors"][0]["facts"][0]["source_ref"]]
        )
        self.assertEqual(raw, before)


if __name__ == "__main__":
    unittest.main()
