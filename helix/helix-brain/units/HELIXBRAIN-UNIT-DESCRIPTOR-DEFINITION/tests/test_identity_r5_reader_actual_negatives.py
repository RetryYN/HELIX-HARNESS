"""R5 reader/actual negative observations from L4 same-call source carriers."""

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
    trace_input,
)


class TestIdentityR5ReaderActualNegatives(unittest.TestCase):
    def _call(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"])
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        validated_before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        return result

    @staticmethod
    def _trace_for(result, subject_ref):
        rows = [
            row
            for row in result["axes"]
            if row["axis"] == "descriptor.trace" and row["subject_ref"] == subject_ref
        ]
        if len(rows) != 1:
            raise AssertionError(
                f"expected one trace row for {subject_ref!r}; got {len(rows)}"
            )
        return rows[0]

    def test_malformed_inner_source_ref_is_local_source_unresolved(self):
        # The extra-member case retains all identity fields, so _ref_same alone
        # would link it. The scalar case verifies that this local cause survives
        # when no malformed value can compare equal as a Ref.
        for variant in ("extra_member", "scalar"):
            with self.subTest(variant=variant):
                raw = trace_input("positive")
                fact = raw["descriptors"][0]["facts"][0]
                source = next(
                    row
                    for row in raw["sources"]
                    if row.get("ref") == fact.get("source_ref")
                )
                original_fact_source_ref = copy.deepcopy(fact["source_ref"])
                record = next(
                    row
                    for row in raw["knowledge_records"]
                    if row.get("ref")
                    == raw["descriptors"][0]["binding"]["knowledge_ref"]
                )
                original_provenance = copy.deepcopy(record["provenance_refs"])
                body = copy.deepcopy(source["content"])
                matching_inner = [
                    inner
                    for group in body["descriptor_facts"]
                    for inner in group["facts"]
                    if inner.get("ref") == fact["ref"]
                ]
                self.assertEqual(len(matching_inner), 1)
                inner = matching_inner[0]
                malformed = copy.deepcopy(inner["source_ref"])
                if variant == "extra_member":
                    malformed["untyped_source_ref"] = "raw value"
                else:
                    malformed = 17
                inner["source_ref"] = copy.deepcopy(malformed)
                _write_source_content(raw, source, body)
                # Keep the public fact and KnowledgeRecord links attached to the
                # same physical source after its bytes/Q digest are refreshed.
                updated_source_ref = copy.deepcopy(source["ref"])
                for slot in raw["descriptors"]:
                    for public_fact in slot.get("facts", []):
                        if public_fact.get("source_ref") == original_fact_source_ref:
                            public_fact["source_ref"] = copy.deepcopy(
                                updated_source_ref
                            )
                for knowledge_record in raw["knowledge_records"]:
                    for index, provenance_ref in enumerate(
                        knowledge_record.get("provenance_refs", [])
                    ):
                        if provenance_ref == original_fact_source_ref:
                            knowledge_record["provenance_refs"][index] = copy.deepcopy(
                                updated_source_ref
                            )

                # The test changes only the owner-body witness. The public fact
                # and KnowledgeRecord provenance path remain the original path.
                self.assertEqual(fact["source_ref"], updated_source_ref)
                self.assertEqual(
                    sum(ref == updated_source_ref for ref in record["provenance_refs"]),
                    sum(ref == original_fact_source_ref for ref in original_provenance),
                )
                result = self._call(raw)
                row = self._trace_for(result, fact["ref"])
                self.assertEqual(row["state"], "unknown")
                prefix, separator, encoded = row["reason"].partition("\n")
                self.assertEqual((prefix, separator), ("source_unresolved", "\n"))
                self.assertEqual(json.loads(encoded)["cause"], "source_unresolved")
                siblings = [
                    axis
                    for axis in result["axes"]
                    if axis["axis"] == "descriptor.trace"
                    and axis["subject_ref"] != fact["ref"]
                ]
                self.assertEqual(len(siblings), 14)
                self.assertTrue(all(axis["state"] == "resolved" for axis in siblings))

    def test_actual_scope_difference_is_read_on_either_declared_endpoint(self):
        for endpoint in ("left", "right"):
            with self.subTest(endpoint=endpoint):
                raw = bilateral_input("outside")
                record = raw["compatibility_records"][0]
                source = next(
                    row
                    for row in raw["sources"]
                    if row.get("ref") == record.get("source_ref")
                )
                body = copy.deepcopy(source["content"])
                declaration = body["compatibility_range_declaration"]
                member = f"{endpoint}_ref"
                original = copy.deepcopy(declaration[member])
                declaration[member]["scope"] = f"synthetic-r5-{endpoint}-scope"
                for owner in declaration["owner_declarations"]:
                    if owner.get("endpoint_ref") == original:
                        owner["endpoint_ref"] = copy.deepcopy(declaration[member])
                _write_source_content(raw, source, body)
                # Isolate the actual port while retaining its qualified source.
                raw["compatibility_records"] = []

                result = self._call(raw)
                for axis_name in ("pack.identity", "pack.revision"):
                    axis = next(
                        row for row in result["axes"] if row["axis"] == axis_name
                    )
                    self.assertEqual(axis["state"], "conflict")
                    self.assertEqual(
                        json.loads(axis["reason"].partition("\n")[2])["cause"],
                        "actual_scope_differs",
                    )

    def test_actual_owner_difference_prevents_subject_candidate_on_either_endpoint(
        self,
    ):
        for endpoint in ("left", "right"):
            with self.subTest(endpoint=endpoint):
                raw = bilateral_input("outside")
                record = raw["compatibility_records"][0]
                source = next(
                    row
                    for row in raw["sources"]
                    if row.get("ref") == record.get("source_ref")
                )
                body = copy.deepcopy(source["content"])
                declaration = body["compatibility_range_declaration"]
                member = f"{endpoint}_ref"
                original = copy.deepcopy(declaration[member])
                declaration[member]["owner"] = f"synthetic-r5-{endpoint}-owner"
                for owner in declaration["owner_declarations"]:
                    if owner.get("endpoint_ref") == original:
                        owner["endpoint_ref"] = copy.deepcopy(declaration[member])
                        owner["owner"] = declaration[member]["owner"]
                _write_source_content(raw, source, body)
                raw["compatibility_records"] = []

                result = self._call(raw)
                axis = next(
                    row for row in result["axes"] if row["axis"] == "pack.identity"
                )
                self.assertEqual(axis["state"], "unknown")
                self.assertEqual(
                    json.loads(axis["reason"].partition("\n")[2])["cause"],
                    "actual_owner_body_unprovided",
                )

    def test_malformed_matching_provenance_is_not_a_public_ref_or_trace_link(self):
        raw = trace_input("positive")
        fact = raw["descriptors"][0]["facts"][0]
        source_ref = raw["sources"][0]["ref"]
        record = next(
            row
            for row in raw["knowledge_records"]
            if row.get("ref") == raw["descriptors"][0]["binding"]["knowledge_ref"]
        )
        matches = [
            index
            for index, ref in enumerate(record["provenance_refs"])
            if ref == source_ref
        ]
        self.assertEqual(len(matches), 1)
        provenance_index = matches[0]
        malformed = copy.deepcopy(record["provenance_refs"][provenance_index])
        malformed["untyped_provenance_member"] = "raw value"
        record["provenance_refs"][provenance_index] = copy.deepcopy(malformed)
        # An independently qualified but unrelated body must not hide the
        # malformed source occurrence by turning its cause into body_unresolved.
        unrelated_body = copy.deepcopy(raw["sources"][0]["content"])
        unrelated_body["descriptor_facts"] = []
        unrelated_source = _append_qualified_source(
            raw,
            identity="SYNTHETIC-R5-UNRELATED-PROVENANCE-SOURCE",
            owner=raw["sources"][0]["ref"]["owner"],
            scope=copy.deepcopy(raw["sources"][0]["ref"]["scope"]),
            content=unrelated_body,
            qualification_identity="SYNTHETIC-R5-UNRELATED-PROVENANCE-Q",
            root_identity="SYNTHETIC-R5-UNRELATED-PROVENANCE-ROOT",
        )
        record["provenance_refs"].append(copy.deepcopy(unrelated_source["ref"]))
        expected_actual_refs = [raw["binding"]["knowledge_ref"]]
        expected_actual_refs.extend(
            ref
            for index, ref in enumerate(record["provenance_refs"])
            if index != provenance_index
        )

        result = self._call(raw)
        actual = next(
            row
            for row in result["axes"]
            if row["axis"] == "knowledge.operational_state"
        )
        self.assertEqual(actual["original_refs"], expected_actual_refs)
        self.assertNotIn(malformed, actual["original_refs"])
        trace = self._trace_for(result, fact["ref"])
        self.assertEqual(trace["state"], "unknown")
        prefix, separator, encoded = trace["reason"].partition("\n")
        self.assertEqual((prefix, separator), ("source_unresolved", "\n"))
        self.assertEqual(json.loads(encoded)["cause"], "source_unresolved")
        siblings = [
            axis
            for axis in result["axes"]
            if axis["axis"] == "descriptor.trace" and axis["subject_ref"] != fact["ref"]
        ]
        self.assertEqual(len(siblings), 14)
        # This KnowledgeRecord is shared by all fifteen facts; its malformed
        # source occurrence makes every dependent trace unknown, without a stop.
        self.assertTrue(all(axis["state"] == "unknown" for axis in siblings))
        self.assertTrue(
            all(
                json.loads(axis["reason"].partition("\n")[2])["cause"]
                == "source_unresolved"
                for axis in siblings
            )
        )


if __name__ == "__main__":
    unittest.main()
