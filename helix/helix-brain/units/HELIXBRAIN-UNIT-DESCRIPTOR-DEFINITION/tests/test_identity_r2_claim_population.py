"""R2 M3/M4: Claimの対象scopeとfn3 trace populationをL4に固定する。"""

from __future__ import annotations

import copy
import json
import unittest

from descriptor_definitions import compare_identity_versions_and_trace, validate_supply_input
from identity_input_fixtures import normal_input


class TestIdentityR2ClaimPopulation(unittest.TestCase):
    def _call(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"], "semantic case must reach fn3 after fn0 decode")
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        validated_before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(result["producer_symbol"], "compare_identity_versions_and_trace")
        return result

    def _identity_claim(self, raw, *, kind="template_identity", proposed=None, basis=None):
        fact = raw["descriptors"][0]["facts"][0]
        claim = {
            "subject_ref": copy.deepcopy(fact["ref"]),
            "binding": copy.deepcopy(raw["binding"]),
            "actor": None,
            "kind": kind,
            "proposed_value": ({"basis_role": "image_only"} if proposed is None else proposed),
            "basis_refs": ([copy.deepcopy(fact["source_ref"])] if basis is None else basis),
        }
        raw["claims"].append(claim)
        return claim

    def _trace_rows(self, result):
        return [row for row in result["axes"] if row["axis"] == "descriptor.trace"]

    def test_non_fn3_claim_kinds_do_not_change_fn3_publication(self):
        """L4 same_callはclaims配列を共有するが、fn3のidentity predicates外は対象外。"""
        for other_kind in ("operation_deadline", "resource_capacity", "project_obligation_discharge"):
            with self.subTest(kind=other_kind):
                raw = normal_input()
                self._identity_claim(raw, kind=other_kind, proposed={"value": "opaque"})
                result = self._call(raw)
                # L4通常形の局所観測をrawから導き、whole Comparisonをoracleにしない。
                self.assertEqual(result["input_binding"], raw["binding"])
                self.assertEqual(
                    [(row["subject_ref"], row["binding"]) for row in self._trace_rows(result)],
                    [(fact["ref"], slot["binding"]) for slot in raw["descriptors"]
                     for fact in slot["facts"]],
                )
                self.assertTrue(all(row["state"] == "unknown" for row in self._trace_rows(result)))
                self.assertFalse(any(row["axis"] == "identity_claim" for row in result["axes"]))
                self.assertEqual([row["code"] for row in result["findings"]], ["compatibility_unknown"])

    def test_descriptors_absent_null_and_empty_have_no_trace_rows(self):
        """L4 trace_population.presence: absent/null/[]は別のまま、実fact requestは0件。"""
        for shape in ("absent", "null", "empty"):
            with self.subTest(shape=shape):
                raw = normal_input()
                if shape == "absent":
                    del raw["descriptors"]
                elif shape == "null":
                    raw["descriptors"] = None
                else:
                    raw["descriptors"] = []
                before = copy.deepcopy(raw)
                result = self._call(raw)
                self.assertEqual(raw, before)
                self.assertEqual(self._trace_rows(result), [])
                self.assertEqual(result["input_binding"], before["binding"])

    def test_empty_or_absent_facts_create_no_trace_rows_for_that_slot(self):
        """実slotのfacts absent/null/[]からprobeやpublic rowを補わない。"""
        for shape in ("absent", "null", "empty"):
            with self.subTest(shape=shape):
                raw = normal_input()
                slot = raw["descriptors"][0]
                if shape == "absent":
                    del slot["facts"]
                elif shape == "null":
                    slot["facts"] = None
                else:
                    slot["facts"] = []
                before = copy.deepcopy(raw)
                result = self._call(raw)
                self.assertEqual(raw, before)
                rows = self._trace_rows(result)
                self.assertTrue(rows, "unaffected slots retain their own trace observations")
                self.assertEqual(
                    len(rows),
                    sum(len(s.get("facts", [])) for s in before["descriptors"]
                        if isinstance(s.get("facts", []), list)),
                )
                removed_refs = [fact["ref"] for fact in normal_input()["descriptors"][0]["facts"]]
                self.assertFalse(any(row["subject_ref"] in removed_refs for row in rows))
                self.assertEqual(result["input_binding"], before["binding"])

    def test_null_slot_knowledge_revision_is_unknown_not_template_revision_failure(self):
        """L4 partial_and_null / trace input readerはnull slot revisionをknowledge_unresolvedに保つ。"""
        raw = normal_input()
        slot = raw["descriptors"][0]
        slot["binding"]["knowledge_ref"]["revision"] = None
        before = copy.deepcopy(raw)
        result = self._call(raw)
        self.assertEqual(raw, before)
        rows = [row for row in self._trace_rows(result)
                if row["subject_ref"] == before["descriptors"][0]["facts"][0]["ref"]]
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["state"], "unknown")
        _prefix, separator, diagnostic = rows[0]["reason"].partition("\n")
        self.assertTrue(separator)
        self.assertEqual(json.loads(diagnostic)["cause"], "knowledge_unresolved")
        self.assertFalse(any(row["code"] == "version_missing" for row in result["findings"]))

    def test_unformed_slot_binding_keeps_private_input_without_public_trace_row(self):
        """L4 formed_public_projection.unformattable_subjectは公開行を作らず私的readを保つ。"""
        for bad_binding in ("absent", "null"):
            with self.subTest(binding=bad_binding):
                raw = normal_input()
                slot = raw["descriptors"][0]
                fact_ref = copy.deepcopy(slot["facts"][0]["ref"])
                if bad_binding == "absent":
                    del slot["binding"]
                else:
                    slot["binding"] = None
                before = copy.deepcopy(raw)
                result = self._call(raw)
                self.assertEqual(raw, before)
                self.assertFalse(any(row["axis"] == "descriptor.trace"
                                     and row["subject_ref"] == fact_ref for row in result["axes"]))
                self.assertFalse(any(row["axis"] == "descriptor.trace"
                                     and row["subject_ref"] == fact_ref for row in result["findings"]))
                self.assertEqual(result["input_binding"], before["binding"])

    def test_partial_root_binding_preserves_unrelated_formed_trace_population(self):
        """L4 partial_and_null: rootの欠落を他slotの形成済みreadの消去へ波及させない。"""
        for shape in ("empty", "template_ref_absent", "oracle_ref_partial"):
            with self.subTest(shape=shape):
                raw = normal_input()
                expected_traces = [(fact["ref"], slot["binding"])
                                   for slot in raw["descriptors"] for fact in slot["facts"]]
                if shape == "empty":
                    raw["binding"] = {}
                elif shape == "template_ref_absent":
                    del raw["binding"]["template_ref"]
                else:
                    raw["binding"]["oracle_ref"] = {}
                result = self._call(raw)
                self.assertEqual(result["input_binding"], raw["binding"])
                self.assertEqual([(row["subject_ref"], row["binding"])
                                  for row in self._trace_rows(result)], expected_traces)
                self.assertTrue(all(row["state"] == "unknown" for row in self._trace_rows(result)))

    def test_absent_claims_means_no_explicit_identity_claim(self):
        raw = normal_input()
        del raw["claims"]
        result = self._call(raw)
        self.assertFalse(any(row["axis"] == "identity_claim" for row in result["axes"]))
        self.assertEqual([row["code"] for row in result["findings"]], ["compatibility_unknown"])

    def test_absent_compatibility_records_creates_no_explicit_pair_axis(self):
        raw = normal_input()
        del raw["compatibility_records"]
        result = self._call(raw)
        self.assertFalse(any(row["axis"] == "compatibility" for row in result["axes"]))
        self.assertFalse(any(row["code"] in {"compatibility_unknown", "compatibility_mismatch"}
                             for row in result["findings"]))
        self.assertEqual(len(self._trace_rows(result)), 15)

    def test_absent_sources_keeps_each_original_missing_source_witness(self):
        raw = normal_input()
        del raw["sources"]
        expected_refs = [fact["source_ref"] for slot in raw["descriptors"] for fact in slot["facts"]]
        result = self._call(raw)
        missing = [row for row in result["findings"] if row["code"] == "source_missing"]
        self.assertEqual(len(missing), len(expected_refs))
        self.assertEqual([row["source_refs"] for row in missing], [[ref] for ref in expected_refs])
        traces = self._trace_rows(result)
        self.assertEqual(len(traces), 15)
        self.assertTrue(all(row["state"] == "unknown" for row in traces))

    def test_validated_null_input_returns_the_declared_empty_comparison(self):
        """L4 same_call/partial_and_null: fn0 input=nullは公開Findingへ変換しない。"""
        validated = validate_supply_input(None)
        validated_before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(result, {
            "axes": [], "findings": [],
            "producer_symbol": "compare_identity_versions_and_trace",
            "input_binding": None,
        })
        self.assertEqual(validated, validated_before)


if __name__ == "__main__":
    unittest.main()
