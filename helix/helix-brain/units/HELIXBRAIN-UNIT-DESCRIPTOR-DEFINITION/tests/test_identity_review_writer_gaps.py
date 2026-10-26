"""R1で残った公開Identity writerの部分観測。

L4 identity_version_trace_contract/public_projection/axis_reason_writer と
L5 functions/3 の述語を、既存のnormal/trace/bilateral入力から独立に照合する。
保存済みwhole/hashや実装private関数は期待値に使わず、ValidatedSupplyと入力の
不変性、公開Comparisonの局所Finding/Axisのみを見る。R64のimage-only Claimは
L4 rule_mapping/finding_witness_tableの既存Findingへ原Claim.subject_ref/Bindingで結ぶ。
identity Claimのunsupported basis_roleと空basisは、review R3の修正で確定した
枝別stop IDをassertする。
"""

from __future__ import annotations

import copy
import json
import unittest

from descriptor_definitions import compare_identity_versions_and_trace, validate_supply_input
from identity_input_fixtures import normal_input, trace_input


class TestIdentityReviewWriterGaps(unittest.TestCase):
    def _call(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(raw, raw_before, "fn0 must not mutate the supplied input")
        self.assertIsNotNone(validated["input"])
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        validated_before = copy.deepcopy(validated)
        try:
            result = compare_identity_versions_and_trace({"validated": validated})
        finally:
            self.assertEqual(validated, validated_before, "fn3 must not mutate ValidatedSupply")
            self.assertEqual(raw, raw_before, "fn3 must not mutate the supplied input")
        self.assertEqual(set(result), {"axes", "findings", "producer_symbol", "input_binding"})
        return result

    @staticmethod
    def _material(row):
        prefix, separator, encoded = row["reason"].partition("\n")
        return prefix, separator, json.loads(encoded) if separator else None

    def test_R59_null_template_revision_keeps_version_row_and_finding_witness(self):
        """L4 R59: null revisionは同じversion行をmissingにし、Findingを一件足す。"""
        raw = normal_input()
        raw["binding"]["template_ref"]["revision"] = None
        result = self._call(raw)

        version_rows = [row for row in result["axes"] if row["axis"] == "template.version"]
        self.assertEqual(len(version_rows), 1)
        self.assertEqual(version_rows[0]["state"], "missing")
        self.assertEqual(version_rows[0]["subject_ref"], raw["binding"]["template_ref"])
        version_findings = [row for row in result["findings"] if row["code"] == "version_missing"]
        self.assertEqual(len(version_findings), 1)
        finding = version_findings[0]
        self.assertEqual(finding["rule_ref"], "HELIXBRAIN-L5-032-R-version_missing")
        self.assertEqual(finding["subject_ref"], raw["binding"]["template_ref"])
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertEqual(finding["axis"], "template.version")
        self.assertEqual(finding["state"], "missing")
        prefix, separator, material = self._material(finding)
        self.assertTrue(separator)
        self.assertEqual(
            prefix,
            "当該templateの実内容版が未供給。knowledge/pack/version_targetがあってもtemplate実版ではない。",
        )
        self.assertEqual(set(material), {"code", "rule_ref", "predicate_observations"})
        self.assertEqual(material["code"], finding["code"])
        self.assertEqual(material["rule_ref"], finding["rule_ref"])
        observation = next(
            row for row in material["predicate_observations"]
            if row["locator"] == "/binding/template_ref/revision"
        )
        self.assertEqual(observation["original_read"], {"presence": "supplied", "value": None})

    def test_trace_body_unresolved_uses_cause_literal_and_source_occurrence_order(self):
        """L4 unexercised_trace: owner body不一致をbody_unresolvedとして局所保持する。"""
        raw = trace_input("positive")
        first_fact = raw["descriptors"][0]["facts"][0]
        first_fact["ref"]["identity"] = "SYNTHETIC-UNMATCHED-TRACE-FACT"
        result = self._call(raw)

        trace_rows = [row for row in result["axes"] if row["axis"] == "descriptor.trace"]
        self.assertTrue(trace_rows)
        axis = next(row for row in trace_rows if row["subject_ref"] == first_fact["ref"])
        self.assertEqual(axis["state"], "unknown")
        prefix, separator, material = self._material(axis)
        self.assertTrue(separator)
        self.assertEqual(prefix, "body_unresolved")
        self.assertEqual(material["cause"], prefix)

        original_record = raw["knowledge_records"][0]
        expected_source_indices = [
            index for index, source in enumerate(raw["sources"])
            if any(source["ref"] == provenance for provenance in original_record["provenance_refs"])
        ]
        self.assertEqual(material["source_indices"], expected_source_indices)

    def test_R64_image_only_claim_is_reported_against_original_claim_subject(self):
        """L4既存R64 Findingを原Claim.subject_ref/Bindingへ固定する。"""
        raw = normal_input()
        claim = {
            "actor": "BRAIN",
            "kind": "template_identity",
            "subject_ref": copy.deepcopy(raw["binding"]["template_ref"]),
            "binding": copy.deepcopy(raw["binding"]),
            "basis_refs": [copy.deepcopy(raw["sources"][0]["ref"])],
            "proposed_value": {"basis_role": "image_only"},
        }
        raw["claims"].append(claim)
        result = self._call(raw)
        findings = [row for row in result["findings"] if row["code"] == "image_identity_inference"]
        self.assertEqual(len(findings), 1)
        finding = findings[0]
        self.assertEqual(finding["rule_ref"], "HELIXBRAIN-L5-032-R-image_identity_inference")
        self.assertEqual(finding["subject_ref"], claim["subject_ref"])
        self.assertEqual(finding["binding"], claim["binding"])
        self.assertEqual(finding["axis"], "template.identity")
        self.assertEqual(finding["state"], "unknown")

    def test_unknown_identity_claim_basis_role_stops_with_fn3_backflow(self):
        """R3 M1の枝別stop契約: unsupported roleはbasis_role locatorの一意IDで止める。"""
        raw = normal_input()
        raw["claims"].append({
            "actor": "BRAIN",
            "kind": "template_identity",
            "subject_ref": copy.deepcopy(raw["descriptors"][0]["facts"][0]["ref"]),
            "binding": copy.deepcopy(raw["binding"]),
            "basis_refs": [copy.deepcopy(raw["sources"][0]["ref"])],
            "proposed_value": {"basis_role": "synthetic-unknown-role"},
        })
        with self.assertRaises(NotImplementedError) as caught:
            self._call(raw)
        self.assertIn("F04/N01/unclosed/identity_claim/basis_role", str(caught.exception))
        self.assertIn("HELIXBRAIN-L6-032-FN3-IDENTITY", str(caught.exception))

    def test_image_only_claim_with_empty_basis_stops_explicitly(self):
        """R3 M1の枝別stop契約: explicit empty basisはbasis_refs_empty IDで止める。"""
        raw = normal_input()
        raw["claims"].append({
            "actor": "BRAIN",
            "kind": "template_identity",
            "subject_ref": copy.deepcopy(raw["descriptors"][0]["facts"][0]["ref"]),
            "binding": copy.deepcopy(raw["binding"]),
            "basis_refs": [],
            "proposed_value": {"basis_role": "image_only"},
        })
        with self.assertRaises(NotImplementedError) as caught:
            self._call(raw)
        self.assertIn("F04/N01/unclosed/identity_claim/basis_refs_empty", str(caught.exception))
        self.assertIn("HELIXBRAIN-L6-032-FN3-IDENTITY", str(caught.exception))

    def test_R63_oracle_binding_axis_follows_trace_and_bilateral_rows(self):
        """L4 axes_order: predicate専用oracle.binding rowはtrace/bilateral後に置く。"""
        raw = normal_input()
        raw["oracle_bindings"][0]["oracle_ref"]["revision"] = "synthetic-other-revision"
        result = self._call(raw)

        oracle_rows = [
            (index, row) for index, row in enumerate(result["axes"])
            if row["axis"] == "oracle.binding"
        ]
        self.assertTrue(oracle_rows)
        finding = next(row for row in result["findings"] if row["code"] == "oracle_revision_mismatch")
        self.assertEqual(finding["subject_ref"], raw["oracle_bindings"][0]["subject_ref"])
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertEqual(finding["axis"], "oracle.binding")
        self.assertEqual(finding["state"], "conflict")
        special_before_oracle = [
            index for index, row in enumerate(result["axes"])
            if row["axis"] in {"descriptor.trace", "compatibility"}
        ]
        self.assertTrue(special_before_oracle)
        self.assertGreater(min(index for index, _row in oracle_rows), max(special_before_oracle))

    def test_source_missing_findings_have_ordered_predicate_axis_rows(self):
        """L4 axes_order/finding_witness_table: source missingの各原factに専用rowを持つ。"""
        raw = normal_input()
        missing_source = raw["sources"].pop(0)
        raw["qualifications"] = [
            row for row in raw["qualifications"]
            if row["ref"] != missing_source["qualification_ref"]
        ]
        expected_occurrences = []
        for slot_index, slot in enumerate(raw["descriptors"]):
            for fact_index, fact in enumerate(slot["facts"]):
                ref = fact.get("source_ref")
                target = missing_source["ref"]
                if not isinstance(ref, dict):
                    continue
                # L5 Ref照合: locatorは所在、片側null digestは同値の証明にしない。
                if not all(ref.get(key) is not None and ref.get(key) == target.get(key)
                           for key in ("identity", "revision", "scope", "owner")):
                    continue
                if (ref.get("sha256") is not None and target.get("sha256") is not None
                        and ref["sha256"] != target["sha256"]):
                    continue
                locator = f"/descriptors/{slot_index}/facts/{fact_index}/source_ref"
                expected_occurrences.append((locator, copy.deepcopy(ref)))
        self.assertTrue(expected_occurrences)
        result = self._call(raw)

        findings = [row for row in result["findings"] if row["code"] == "source_missing"]
        rows = [row for row in result["axes"] if row["axis"] == "source" and row["state"] == "missing"]
        self.assertEqual(len(findings), len(expected_occurrences))
        self.assertEqual(len(rows), len(findings))
        for locator, source_ref in expected_occurrences:
            matching_findings = [
                row for row in findings
                if row["source_refs"] == [source_ref] and any(
                    observation["locator"] == locator
                    for observation in self._material(row)[2]["predicate_observations"]
                )
            ]
            self.assertEqual(len(matching_findings), 1)
            matching_rows = [
                row for row in rows
                if row["subject_ref"] == raw["binding"]["template_ref"]
                and row["binding"] == raw["binding"]
                and source_ref in row["original_refs"]
                and row["reason"] == matching_findings[0]["reason"]
            ]
            self.assertEqual(len(matching_rows), 1)
        self.assertTrue(all(row["source_refs"] and None not in row["source_refs"] for row in findings))
        last_trace_or_bilateral = max(
            index for index, row in enumerate(result["axes"])
            if row["axis"] in {"descriptor.trace", "compatibility"}
        )
        self.assertTrue(all(
            index > last_trace_or_bilateral
            for index, row in enumerate(result["axes"])
            if row["axis"] == "source" and row["state"] == "missing"
        ))

    def test_fn0_preserves_partial_provenance_and_fn3_keeps_unknown_reads(self):
        """R4-M2/L4 partial_and_null: 不形成provenanceで他原軸を消さない。"""
        for mode, value in (("absent", None), ("null", None), ("string", "synthetic-not-a-ref-array")):
            with self.subTest(mode=mode):
                raw = trace_input("positive")
                record = raw["knowledge_records"][0]
                if mode == "absent":
                    del record["provenance_refs"]
                else:
                    record["provenance_refs"] = value
                result = self._call(raw)
                traces = [r for r in result["axes"] if r["axis"] == "descriptor.trace"]
                self.assertEqual(len(traces), 15)
                for row in traces:
                    self.assertEqual(row["state"], "unknown")
                    prefix, separator, material = self._material(row)
                    self.assertEqual((prefix, separator), ("knowledge_unresolved", "\n"))
                    self.assertEqual(material["cause"], "knowledge_unresolved")
                    self.assertEqual(material["knowledge_record_indices"], [0])
                    self.assertEqual(material["provenance_indices"], [])
                operational = next(r for r in result["axes"] if r["axis"] == "knowledge.operational_state")
                self.assertEqual(operational["state"], "unknown")


if __name__ == "__main__":
    unittest.main()
