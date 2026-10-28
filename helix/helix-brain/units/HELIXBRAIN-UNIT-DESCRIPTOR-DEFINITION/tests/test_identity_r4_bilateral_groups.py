"""R4 bilateral read grouping and endpoint boundary regressions.

Contract basis: L4 ``identity_version_trace_contract/read_branch_contracts/bilateral``
and ``public_projection/axis_reason_writer/general_occurrence_cause_witness/cause_competition_ja``.
The L5 function contract keeps existing single-read and finite opposing behavior,
and sends only same-pair/full-Binding cause competition through the aggregate writer.
These tests assert local public rows and leave raw/private read material in the input.
"""

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
    _left_body,
    _write_source_content,
    bilateral_input,
)


class TestIdentityR4BilateralGroups(unittest.TestCase):
    def _call(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        validated_before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        return result

    @staticmethod
    def _compatibility_rows(result):
        return [row for row in result["axes"] if row["axis"] == "compatibility"]

    @staticmethod
    def _record_sources(raw, record):
        right = [
            source
            for source in raw["sources"]
            if source.get("ref") == record.get("source_ref")
        ]
        left = [
            source
            for source in raw["sources"]
            if isinstance(source.get("content"), dict)
            and source["content"].get("compatibility_record_ref") == record.get("ref")
        ]
        if len(right) != 1 or len(left) != 1:
            raise AssertionError(
                "setup: each synthetic bilateral read needs one right and one left source"
            )
        return right[0], left[0]

    @staticmethod
    def _remove_qualified_source(raw, source):
        qualification_ref = copy.deepcopy(source.get("qualification_ref"))
        qualifications = [
            row for row in raw["qualifications"] if row.get("ref") == qualification_ref
        ]
        if len(qualifications) != 1:
            raise AssertionError(
                "setup: removed source must have one original Qualification"
            )
        root_ref = copy.deepcopy(qualifications[0].get("root_ref"))
        roots = [row for row in raw["qualification_roots"] if row == root_ref]
        if len(roots) != 1:
            raise AssertionError(
                "setup: removed Qualification must have one original root"
            )
        raw["sources"].remove(source)
        raw["qualifications"].remove(qualifications[0])
        raw["qualification_roots"].remove(roots[0])

    def _append_positive_read(self, raw, *, suffix, distinct_pair):
        original = raw["compatibility_records"][0]
        original_right, _original_left = self._record_sources(raw, original)
        record = copy.deepcopy(original)
        record["ref"]["identity"] = f"SYNTHETIC-R4-RECORD-{suffix}"
        record["ref"]["sha256"] = None
        if distinct_pair:
            record["left_ref"]["identity"] = f"SYNTHETIC-R4-LEFT-{suffix}"
            record["right_ref"]["identity"] = f"SYNTHETIC-R4-RIGHT-{suffix}"
            record["left_ref"]["sha256"] = None
            record["right_ref"]["sha256"] = None
        right_content = copy.deepcopy(original_right["content"])
        right_content["compatible_refs"] = [copy.deepcopy(record["right_ref"])]
        right_source = _append_qualified_source(
            raw,
            identity=f"SYNTHETIC-R4-RIGHT-SOURCE-{suffix}",
            owner=record["right_ref"]["owner"],
            scope=copy.deepcopy(record["right_ref"]["scope"]),
            content=right_content,
            qualification_identity=f"SYNTHETIC-R4-RIGHT-Q-{suffix}",
            root_identity=f"SYNTHETIC-R4-RIGHT-ROOT-{suffix}",
            revision=record["right_ref"]["revision"],
        )
        record["source_ref"] = copy.deepcopy(right_source["ref"])
        left_content = _left_body(raw, record, right_source, compatible=True)
        _append_qualified_source(
            raw,
            identity=f"SYNTHETIC-R4-LEFT-SOURCE-{suffix}",
            owner=record["left_ref"]["owner"],
            scope=copy.deepcopy(record["left_ref"]["scope"]),
            content=left_content,
            qualification_identity=f"SYNTHETIC-R4-LEFT-Q-{suffix}",
            root_identity=f"SYNTHETIC-R4-LEFT-ROOT-{suffix}",
            revision=record["left_ref"]["revision"],
        )
        raw["compatibility_records"].append(record)
        return record

    def test_different_pairs_remain_individual_resolved_reads(self):
        """L4 cause competition groups only a matching pair/full frame; another pair stays a read."""
        raw = bilateral_input("positive")
        second = self._append_positive_read(
            raw, suffix="DISTINCT-PAIR", distinct_pair=True
        )

        result = self._call(raw)
        rows = self._compatibility_rows(result)
        self.assertEqual(len(rows), 2)
        self.assertEqual([row["state"] for row in rows], ["resolved", "resolved"])
        by_record = {}
        for row in rows:
            _prefix, separator, encoded = row["reason"].partition("\n")
            self.assertEqual(separator, "\n")
            material = json.loads(encoded)
            self.assertEqual(len(material["record_indices"]), 1)
            by_record[material["record_indices"][0]] = row
        self.assertEqual(set(by_record), {0, 1})
        for index, record in enumerate(raw["compatibility_records"]):
            row = by_record[index]
            self.assertEqual(row["subject_ref"], record["left_ref"])
            self.assertEqual(
                row["original_refs"][:4],
                [
                    record["ref"],
                    record["left_ref"],
                    record["right_ref"],
                    record["source_ref"],
                ],
            )

    def test_same_cause_state_repetitions_keep_resolved_state_and_occurrences(self):
        """Repeated positive reads are not turned into an unknown cause competition."""
        raw = bilateral_input("positive")
        self._append_positive_read(
            raw, suffix="SAME-PAIR-POSITIVE", distinct_pair=False
        )

        result = self._call(raw)
        rows = self._compatibility_rows(result)
        self.assertEqual(len(rows), 2)
        by_record = {}
        for row in rows:
            self.assertEqual(row["state"], "resolved")
            _prefix, separator, encoded = row["reason"].partition("\n")
            self.assertEqual(separator, "\n")
            material = json.loads(encoded)
            self.assertEqual(len(material["record_indices"]), 1)
            by_record[material["record_indices"][0]] = row
        self.assertEqual(set(by_record), {0, 1})
        self.assertEqual(
            [by_record[index]["original_refs"][0]["identity"] for index in (0, 1)],
            [
                raw["compatibility_records"][0]["ref"]["identity"],
                raw["compatibility_records"][1]["ref"]["identity"],
            ],
        )

    def test_interleaved_pair_reads_aggregate_only_the_same_pair_competition(self):
        """A/B/A order groups only A's competing pair causes; the existing two-read finite rule stays exact."""
        raw = bilateral_input("opposing")
        a_positive, a_outside = raw["compatibility_records"]
        b_positive = self._append_positive_read(
            raw, suffix="INTERLEAVED-DISTINCT-PAIR", distinct_pair=True
        )
        raw["compatibility_records"] = [a_positive, b_positive, a_outside]

        result = self._call(raw)
        rows = self._compatibility_rows(result)
        self.assertEqual(len(rows), 2)
        group_rows = {}
        for row in rows:
            _prefix, separator, encoded = row["reason"].partition("\n")
            self.assertEqual(separator, "\n")
            material = json.loads(encoded)
            indices = (
                material["record_indices"]
                if "record_indices" in material
                else [
                    occurrence["record_index"]
                    for occurrence in material["cause_occurrences"]
                ]
            )
            group_rows[tuple(indices)] = row

        # The historical finite [resolved, conflict(outside)] projection applies only
        # to its exact two-read input (indices [0, 1]); inserting B makes this a
        # different, general same-pair cause competition for A at indices [0, 2].
        a_group = group_rows[(0, 2)]
        self.assertEqual(a_group["state"], "unknown")
        _prefix, separator, encoded = a_group["reason"].partition("\n")
        self.assertEqual(separator, "\n")
        self.assertEqual(
            json.loads(encoded),
            {
                "cause_occurrences": [
                    {"cause": "positive", "record_index": 0, "state": "resolved"},
                    {"cause": "outside", "record_index": 2, "state": "conflict"},
                ],
            },
        )
        b_row = group_rows[(1,)]
        self.assertEqual(b_row["state"], "resolved")
        self.assertEqual(b_row["subject_ref"], b_positive["left_ref"])
        mismatch_findings = [
            row for row in result["findings"] if row["code"] == "compatibility_mismatch"
        ]
        self.assertEqual(len(mismatch_findings), 1)
        finding = mismatch_findings[0]
        self.assertEqual(finding["subject_ref"], a_outside["left_ref"])
        self.assertEqual(
            finding["source_refs"],
            [
                a_outside["source_ref"],
                next(
                    source["ref"]
                    for source in raw["sources"]
                    if isinstance(source.get("content"), dict)
                    and source["content"].get("compatibility_record_ref")
                    == a_outside["ref"]
                ),
            ],
        )
        _prefix, separator, finding_material = finding["reason"].partition("\n")
        self.assertEqual(separator, "\n")
        self.assertEqual(json.loads(finding_material)["record_index"], 2)

    def test_interleaved_same_cause_reads_keep_original_record_order(self):
        """Noncompeting repeated pair reads stay individual and are not reordered around another pair."""
        raw = bilateral_input("positive")
        a_first = raw["compatibility_records"][0]
        b_middle = self._append_positive_read(
            raw, suffix="ORDER-DISTINCT-PAIR", distinct_pair=True
        )
        a_last = self._append_positive_read(
            raw, suffix="ORDER-SAME-PAIR-REPEAT", distinct_pair=False
        )
        self.assertEqual(raw["compatibility_records"], [a_first, b_middle, a_last])

        rows = self._compatibility_rows(self._call(raw))
        self.assertEqual(len(rows), 3)
        self.assertEqual(
            [row["state"] for row in rows], ["resolved", "resolved", "resolved"]
        )
        observed_indices = []
        for index, row in enumerate(rows):
            _prefix, separator, encoded = row["reason"].partition("\n")
            self.assertEqual(separator, "\n")
            material = json.loads(encoded)
            self.assertEqual(len(material["record_indices"]), 1)
            read_index = material["record_indices"][0]
            observed_indices.append(read_index)
            record = raw["compatibility_records"][read_index]
            self.assertEqual(row["subject_ref"], record["left_ref"])
            self.assertEqual(
                row["original_refs"][:4],
                [
                    record["ref"],
                    record["left_ref"],
                    record["right_ref"],
                    record["source_ref"],
                ],
            )
        self.assertEqual(observed_indices, [0, 1, 2])

    def test_null_and_regular_multiple_left_sources_have_distinct_stop_ids(self):
        """L4 keeps null-source and ordinary owner-source reads distinct; stop IDs identify each branch."""
        cases = []
        regular = bilateral_input("positive")
        record = regular["compatibility_records"][0]
        _right, left = self._record_sources(regular, record)
        regular["sources"].append(copy.deepcopy(left))
        cases.append((regular, "unclosed/multiple_finding_range_sources/left"))

        explicit_null = bilateral_input("positive")
        null_record = explicit_null["compatibility_records"][0]
        _right, null_left = self._record_sources(explicit_null, null_record)
        explicit_null["sources"].append(copy.deepcopy(null_left))
        null_record["source_ref"] = None
        cases.append(
            (explicit_null, "unclosed/multiple_finding_range_sources/left_null")
        )

        observed_ids = []
        for raw, expected_id in cases:
            with self.subTest(case_id=expected_id):
                with self.assertRaises(NotImplementedError) as caught:
                    self._call(raw)
                self.assertTrue(
                    str(caught.exception).startswith(f"F04/N01/{expected_id}:")
                )
                observed_ids.append(expected_id)
        self.assertEqual(len(set(observed_ids)), 2)

    def test_left_range_not_supplied_and_right_outside_is_not_bilateral_outside(self):
        """An outside right declaration alone cannot supply the left owner's range decision."""
        raw = bilateral_input("outside")
        record = raw["compatibility_records"][0]
        right, left = self._record_sources(raw, record)
        body = copy.deepcopy(left["content"])
        body["endpoint_owner_declaration"]["range_relation"] = "not_supplied"
        body["endpoint_owner_declaration"]["range_reason"] = None
        self.assertEqual(
            body["endpoint_owner_declaration"]["range_relation"], "not_supplied"
        )
        self.assertEqual(
            right["content"]["compatibility_range_declaration"]["relation"], "outside"
        )
        _write_source_content(raw, left, body)

        result = self._call(raw)
        rows = self._compatibility_rows(result)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["state"], "unknown")
        self.assertFalse(
            any(row["code"] == "compatibility_mismatch" for row in result["findings"])
        )

    def test_right_source_owner_must_match_the_recorded_range_owner(self):
        """A qualified right Ref under another owner cannot complete the range declaration."""
        raw = bilateral_input("outside")
        record = raw["compatibility_records"][0]
        old_right, left = self._record_sources(raw, record)
        self._remove_qualified_source(raw, old_right)
        wrong_owner = _append_qualified_source(
            raw,
            identity="SYNTHETIC-R4-WRONG-RANGE-OWNER",
            owner="synthetic-r4-unrelated-right-owner",
            scope=copy.deepcopy(old_right["ref"]["scope"]),
            content=copy.deepcopy(old_right["content"]),
            qualification_identity="SYNTHETIC-R4-WRONG-RANGE-OWNER-Q",
            root_identity="SYNTHETIC-R4-WRONG-RANGE-OWNER-ROOT",
            revision=old_right["ref"]["revision"],
        )
        record["source_ref"] = copy.deepcopy(wrong_owner["ref"])
        left_body = copy.deepcopy(left["content"])
        left_body["counterpart_source_ref"] = copy.deepcopy(wrong_owner["ref"])
        _write_source_content(raw, left, left_body)
        range_owner = next(
            owner
            for owner in old_right["content"]["compatibility_range_declaration"][
                "owner_declarations"
            ]
            if owner["endpoint_ref"] == record["right_ref"]
        )
        self.assertNotEqual(wrong_owner["ref"]["owner"], range_owner["owner"])

        result = self._call(raw)
        rows = self._compatibility_rows(result)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["state"], "unknown")
        self.assertFalse(
            any(row["code"] == "compatibility_mismatch" for row in result["findings"])
        )

    def test_unobserved_left_owner_scope_stays_unknown(self):
        """An unobserved target scope keeps the left owner read unknown despite qualified source scope."""
        for record_decision in (True, None):
            with self.subTest(record_compatible=record_decision):
                raw = bilateral_input("positive")
                raw["binding"]["template_ref"]["scope"] = None
                record = raw["compatibility_records"][0]
                record["compatible"] = record_decision
                _right, left = self._record_sources(raw, record)
                self.assertEqual(left["ref"]["scope"], record["left_ref"]["scope"])
                self.assertIsNone(raw["binding"]["template_ref"]["scope"])

                result = self._call(raw)
                rows = self._compatibility_rows(result)
                self.assertEqual(len(rows), 1)
                self.assertEqual(rows[0]["state"], "unknown")
                prefix, separator, encoded = rows[0]["reason"].partition("\n")
                self.assertEqual((prefix, separator), ("scope_unresolved", "\n"))
                material = json.loads(encoded)
                self.assertIn("owner_observations", material)
                left_reads = [
                    row
                    for row in material["owner_observations"]
                    if row["endpoint"] == "left"
                ]
                self.assertEqual(len(left_reads), 1)
                self.assertEqual(left_reads[0]["target_scope_relation"], "unobserved")
                self.assertEqual(left_reads[0]["cause"], "owner_subject_unresolved")


if __name__ == "__main__":
    unittest.main()
