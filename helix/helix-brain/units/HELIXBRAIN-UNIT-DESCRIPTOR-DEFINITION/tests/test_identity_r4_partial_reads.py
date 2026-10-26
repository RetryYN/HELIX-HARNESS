"""R4: partial Knowledge/trace reads stay local and preserve source occurrence order."""

from __future__ import annotations

import copy
import json
import unittest

from descriptor_definitions import compare_identity_versions_and_trace, validate_supply_input
from identity_input_fixtures import _write_source_content, bilateral_input, trace_input


class TestIdentityR4PartialReads(unittest.TestCase):
    def _call(self, raw):
        before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"])
        self.assertEqual(validated["input"], before)
        self.assertEqual(validated["input_issues"], [])
        validated_before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(raw, before)
        self.assertEqual(validated, validated_before)
        return result

    def _trace_rows(self, result):
        return [row for row in result["axes"] if row["axis"] == "descriptor.trace"]

    def test_distinct_matching_knowledge_records_keep_every_indexed_chain(self):
        raw = trace_input("positive")
        source_ref = copy.deepcopy(raw["sources"][0]["ref"])
        first = next(record for record in raw["knowledge_records"]
                     if record["ref"] == raw["descriptors"][0]["binding"]["knowledge_ref"])
        matching_provenance = [index for index, ref in enumerate(first["provenance_refs"])
                               if ref == source_ref]
        self.assertEqual(len(matching_provenance), 1)
        second = copy.deepcopy(first)
        second["operational_state"] = "synthetic-distinct-knowledge-record-state"
        second["provenance_refs"] = [copy.deepcopy(source_ref), copy.deepcopy(source_ref)]
        raw["knowledge_records"].append(second)

        result = self._call(raw)
        fact_ref = raw["descriptors"][0]["facts"][0]["ref"]
        trace = next(row for row in self._trace_rows(result) if row["subject_ref"] == fact_ref)
        self.assertEqual(trace["state"], "resolved")
        prefix, separator, encoded = trace["reason"].partition("\n")
        self.assertTrue(separator)
        self.assertTrue(prefix.startswith("原slot/fact/source/provenance/資格frame"))
        material = json.loads(encoded)
        self.assertEqual(set(material), {"trace_occurrences"})
        occurrences = material["trace_occurrences"]
        self.assertEqual([row["knowledge_record_index"] for row in occurrences], [0, 1, 1])
        self.assertEqual([row["provenance_index"] for row in occurrences],
                         [matching_provenance[0], 0, 1])
        self.assertEqual([row["source_index"] for row in occurrences], [0, 0, 0])

    def test_unformed_knowledge_provenance_is_a_local_unknown_read(self):
        variants = (
            ("absent", lambda record: record.pop("provenance_refs")),
            ("null", lambda record: record.update(provenance_refs=None)),
            ("type", lambda record: record.update(provenance_refs={"raw": "value"})),
        )
        for label, mutate in variants:
            with self.subTest(shape=label):
                raw = trace_input("positive")
                record = next(row for row in raw["knowledge_records"]
                              if row["ref"] == raw["descriptors"][0]["binding"]["knowledge_ref"])
                mutate(record)
                result = self._call(raw)
                traces = self._trace_rows(result)
                self.assertEqual(len(traces), 15)
                self.assertTrue(all(row["state"] == "unknown" for row in traces))
                for row in traces:
                    prefix, separator, encoded = row["reason"].partition("\n")
                    self.assertEqual((prefix, separator), ("source_unresolved", "\n"))
                    self.assertEqual(json.loads(encoded)["cause"], "source_unresolved")
                self.assertTrue(any(row["axis"] == "template.version" for row in result["axes"]))
                self.assertTrue(any(row["axis"] == "knowledge.operational_state" for row in result["axes"]))

    def test_unformed_fact_source_ref_is_local_source_unresolved(self):
        raw = trace_input("positive")
        bad_source_ref = {"untyped_source_ref": "raw value"}
        raw["descriptors"][0]["facts"][0]["source_ref"] = copy.deepcopy(bad_source_ref)

        result = self._call(raw)
        traces = self._trace_rows(result)
        self.assertEqual(len(traces), 15)
        target_ref = raw["descriptors"][0]["facts"][0]["ref"]
        target = next(row for row in traces if row["subject_ref"] == target_ref)
        self.assertEqual(target["state"], "unknown")
        prefix, separator, encoded = target["reason"].partition("\n")
        self.assertEqual((prefix, separator), ("source_unresolved", "\n"))
        self.assertEqual(json.loads(encoded)["cause"], "source_unresolved")
        siblings = [row for row in traces if row["subject_ref"] != target_ref]
        self.assertEqual(len(siblings), 14)
        self.assertTrue(all(row["state"] == "resolved" for row in siblings))
        self.assertFalse(any(row["code"] == "source_missing" for row in result["findings"]))
        self.assertFalse(any(bad_source_ref in row["original_refs"] for row in result["axes"]))
        self.assertFalse(any(bad_source_ref in row["source_refs"] for row in result["findings"]))

    def test_range_subject_candidate_with_only_scope_difference_is_conflict(self):
        raw = bilateral_input("outside")
        record = raw["compatibility_records"][0]
        right = next(source for source in raw["sources"] if source["ref"] == record["source_ref"])
        body = copy.deepcopy(right["content"])
        declaration = body["compatibility_range_declaration"]
        original_right_ref = copy.deepcopy(declaration["right_ref"])
        declaration["right_ref"]["scope"] = "synthetic-range-subject-scope-difference"
        for owner in declaration["owner_declarations"]:
            if owner["endpoint_ref"] == original_right_ref:
                owner["endpoint_ref"] = copy.deepcopy(declaration["right_ref"])
        _write_source_content(raw, right, body)
        raw["compatibility_records"] = []

        result = self._call(raw)
        for axis_name in ("pack.identity", "pack.revision"):
            row = next(row for row in result["axes"] if row["axis"] == axis_name)
            self.assertEqual(row["state"], "conflict")
            material = json.loads(row["reason"].partition("\n")[2])
            self.assertEqual(material["cause"], "actual_scope_differs")

    def test_fact_mixed_revision_requires_matching_identity_scope_and_owner(self):
        for member in ("identity", "scope", "owner"):
            with self.subTest(member=member):
                raw = trace_input("positive")
                fact = raw["descriptors"][0]["facts"][0]
                fact["binding"]["knowledge_ref"][member] = f"synthetic-other-{member}"
                fact["binding"]["knowledge_ref"]["revision"] = "synthetic-other-revision"
                result = self._call(raw)
                self.assertFalse(any(row["code"] == "mixed_knowledge_revision"
                                     for row in result["findings"]))


if __name__ == "__main__":
    unittest.main()
