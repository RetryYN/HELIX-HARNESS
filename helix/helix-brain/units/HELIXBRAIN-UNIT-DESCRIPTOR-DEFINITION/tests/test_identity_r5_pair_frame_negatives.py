"""R5 negatives for bilateral pair and original Binding-frame grouping.

L4 identity_version_trace_contract/read_branch_contracts/bilateral/different_subject_frame
requires a different pair/frame read to remain separate. L4
public_projection/axis_reason_writer/general_occurrence_cause_witness/cause_competition_ja
and bilateral_aggregation/unclosed_boundary permit grouping only where original full
pair/frame/Binding correspondence is established. The exact two-read
finite_multiple_record_boundary remains its finite exception.
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
    bilateral_input,
)


class TestIdentityR5PairFrameNegatives(unittest.TestCase):
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
    def _rows(result):
        return [row for row in result["axes"] if row["axis"] == "compatibility"]

    @staticmethod
    def _record_indices(row):
        _prefix, separator, encoded = row["reason"].partition("\n")
        if separator != "\n":
            raise AssertionError(
                "setup: compatibility reason must include its diagnostic JSON"
            )
        material = json.loads(encoded)
        if "record_indices" in material:
            return material["record_indices"], material
        return [
            item["record_index"] for item in material["cause_occurrences"]
        ], material

    @staticmethod
    def _reason_prefix(row):
        prefix, separator, _encoded = row["reason"].partition("\n")
        if separator != "\n":
            raise AssertionError(
                "setup: compatibility reason must include its diagnostic JSON"
            )
        return prefix

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
            raise AssertionError("setup: expected one original left/right source")
        return right[0], left[0]

    def _append_positive_read(self, raw, suffix):
        original = raw["compatibility_records"][0]
        original_right, _original_left = self._record_sources(raw, original)
        record = copy.deepcopy(original)
        record["ref"]["identity"] = f"SYNTHETIC-R5-RECORD-{suffix}"
        record["ref"]["sha256"] = None
        record["left_ref"]["identity"] = f"SYNTHETIC-R5-LEFT-{suffix}"
        record["right_ref"]["identity"] = f"SYNTHETIC-R5-RIGHT-{suffix}"
        record["left_ref"]["sha256"] = None
        record["right_ref"]["sha256"] = None
        right_content = copy.deepcopy(original_right["content"])
        right_content["compatible_refs"] = [copy.deepcopy(record["right_ref"])]
        right_source = _append_qualified_source(
            raw,
            identity=f"SYNTHETIC-R5-RIGHT-SOURCE-{suffix}",
            owner=record["right_ref"]["owner"],
            scope=copy.deepcopy(record["right_ref"]["scope"]),
            content=right_content,
            qualification_identity=f"SYNTHETIC-R5-RIGHT-Q-{suffix}",
            root_identity=f"SYNTHETIC-R5-RIGHT-ROOT-{suffix}",
            revision=record["right_ref"]["revision"],
        )
        record["source_ref"] = copy.deepcopy(right_source["ref"])
        left_content = _left_body(raw, record, right_source, compatible=True)
        _append_qualified_source(
            raw,
            identity=f"SYNTHETIC-R5-LEFT-SOURCE-{suffix}",
            owner=record["left_ref"]["owner"],
            scope=copy.deepcopy(record["left_ref"]["scope"]),
            content=left_content,
            qualification_identity=f"SYNTHETIC-R5-LEFT-Q-{suffix}",
            root_identity=f"SYNTHETIC-R5-LEFT-ROOT-{suffix}",
            revision=record["left_ref"]["revision"],
        )
        raw["compatibility_records"].append(record)
        return record

    def test_left_ref_only_pair_difference_does_not_join_different_causes(self):
        """The left full Ref alone distinguishes a positive pair from an unprovided left read."""
        raw = bilateral_input("opposing")
        positive, mismatched = raw["compatibility_records"]
        mismatched["left_ref"]["identity"] = "SYNTHETIC-R5-DIFFERENT-LEFT-PAIR"
        self.assertNotEqual(positive["left_ref"], mismatched["left_ref"])
        self.assertEqual(positive["right_ref"], mismatched["right_ref"])

        rows = self._rows(self._call(raw))
        self.assertEqual(len(rows), 2)
        by_index = {}
        for row in rows:
            indices, material = self._record_indices(row)
            self.assertEqual(len(indices), 1)
            by_index[indices[0]] = (row, material)
        self.assertEqual(set(by_index), {0, 1})
        self.assertEqual(by_index[0][0]["state"], "resolved")
        self.assertEqual(by_index[1][0]["state"], "unknown")
        self.assertEqual(
            self._reason_prefix(by_index[1][0]),
            "右pack-owner原宣言は存在するが独立template-owner本文が未供給であり当該pair互換照合はunknownに保持する。",
        )

    def test_same_pair_outside_binding_template_scope_remains_two_reads(self):
        """Same pair refs with a known target-scope mismatch cannot aggregate across frames."""
        raw = bilateral_input("positive")
        first = raw["compatibility_records"][0]
        second = copy.deepcopy(first)
        second["ref"]["identity"] = "SYNTHETIC-R5-SAME-PAIR-NO-LEFT-OWNER"
        second["ref"]["sha256"] = None
        # There is no left owner source for this distinct record ref, so its read is
        # left_owner_unprovided. Both records retain exactly the same full pair Refs.
        raw["compatibility_records"].append(second)
        target_scope = copy.deepcopy(raw["binding"]["template_ref"]["scope"])
        target_scope["environment"] = "synthetic-R5-different-target-frame"
        raw["binding"]["template_ref"]["scope"] = target_scope
        self.assertEqual(first["left_ref"], second["left_ref"])
        self.assertEqual(first["right_ref"], second["right_ref"])
        self.assertNotEqual(
            first["left_ref"]["scope"], raw["binding"]["template_ref"]["scope"]
        )

        rows = self._rows(self._call(raw))
        self.assertEqual(len(rows), 2)
        by_index = {}
        for row in rows:
            indices, material = self._record_indices(row)
            self.assertEqual(len(indices), 1)
            by_index[indices[0]] = (row, material)
        self.assertEqual(set(by_index), {0, 1})
        self.assertEqual(by_index[0][0]["state"], "conflict")
        self.assertEqual(
            self._reason_prefix(by_index[0][0]),
            "原source自身の資格scopeは対応するが対象pairのscopeと既知に異なる。",
        )
        self.assertEqual(by_index[1][0]["state"], "unknown")
        self.assertEqual(
            self._reason_prefix(by_index[1][0]),
            "右pack-owner原宣言は存在するが独立template-owner本文が未供給であり当該pair互換照合はunknownに保持する。",
        )

    def test_same_pair_outside_binding_pack_scope_remains_two_reads(self):
        """The right endpoint frame is checked against the original Binding pack Ref scope."""
        raw = bilateral_input("positive")
        first = raw["compatibility_records"][0]
        second = copy.deepcopy(first)
        second["ref"]["identity"] = "SYNTHETIC-R5-SAME-PAIR-NO-LEFT-OWNER-PACK-FRAME"
        second["ref"]["sha256"] = None
        raw["compatibility_records"].append(second)
        target_scope = copy.deepcopy(raw["binding"]["pack_ref"]["scope"])
        target_scope["environment"] = "synthetic-R5-different-pack-frame"
        raw["binding"]["pack_ref"]["scope"] = target_scope
        self.assertEqual(
            first["left_ref"]["scope"], raw["binding"]["template_ref"]["scope"]
        )
        self.assertEqual(first["right_ref"], second["right_ref"])
        self.assertNotEqual(
            first["right_ref"]["scope"], raw["binding"]["pack_ref"]["scope"]
        )

        rows = self._rows(self._call(raw))
        self.assertEqual(len(rows), 2)
        by_index = {}
        for row in rows:
            indices, material = self._record_indices(row)
            self.assertEqual(len(indices), 1)
            by_index[indices[0]] = (row, material)
        self.assertEqual(set(by_index), {0, 1})
        # Individual read causes remain the original positive and missing-left read;
        # only the group frame differs on the pack endpoint.
        self.assertEqual(by_index[0][0]["state"], "resolved")
        self.assertEqual(by_index[1][0]["state"], "unknown")
        self.assertEqual(
            self._reason_prefix(by_index[1][0]),
            "右pack-owner原宣言は存在するが独立template-owner本文が未供給であり当該pair互換照合はunknownに保持する。",
        )

    def test_same_pair_multiple_causes_remain_the_aggregate_control(self):
        """A non-finite same-pair cause competition still aggregates to unknown."""
        raw = bilateral_input("opposing")
        # The unmodified positive/outside pair is the exact L4 finite example and
        # must stay conflict. A null record decision keeps this an unclosed general
        # competition while both records retain the same original pair/frame.
        raw["compatibility_records"][0]["compatible"] = None
        rows = self._rows(self._call(raw))
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["state"], "unknown")
        indices, material = self._record_indices(rows[0])
        self.assertEqual(indices, [0, 1])
        self.assertEqual(
            material["cause_occurrences"],
            [
                {"cause": "compatible_null", "record_index": 0, "state": "unknown"},
                {"cause": "outside", "record_index": 1, "state": "conflict"},
            ],
        )

    def test_partial_original_binding_keeps_competing_pair_reads_individual(self):
        """A wire-valid partial Binding does not establish a full group frame."""
        raw = bilateral_input("opposing")
        raw["binding"]["oracle_ref"] = {}
        self.assertEqual(raw["binding"]["oracle_ref"], {})

        rows = self._rows(self._call(raw))
        self.assertEqual(len(rows), 2)
        by_index = {}
        for row in rows:
            indices, material = self._record_indices(row)
            self.assertEqual(len(indices), 1)
            by_index[indices[0]] = (row, material)
        self.assertEqual(set(by_index), {0, 1})
        self.assertEqual(by_index[0][0]["state"], "resolved")
        self.assertEqual(by_index[1][0]["state"], "conflict")

    def test_leading_distinct_outcome_keeps_general_aggregate_at_indices_one_two(self):
        """A same-pair positive/outside group at [1,2] uses general competition, not finite [0,1]."""
        raw = bilateral_input("opposing")
        a_positive, a_outside = raw["compatibility_records"]
        b_positive = self._append_positive_read(raw, "LEADING-DISTINCT-PAIR")
        raw["compatibility_records"] = [b_positive, a_positive, a_outside]

        result = self._call(raw)
        rows = self._rows(result)
        self.assertEqual(len(rows), 2)
        by_indices = {}
        for row in rows:
            indices, material = self._record_indices(row)
            by_indices[tuple(indices)] = (row, material)
        self.assertEqual(set(by_indices), {(0,), (1, 2)})
        self.assertEqual(by_indices[(0,)][0]["state"], "resolved")
        self.assertEqual(by_indices[(1, 2)][0]["state"], "unknown")
        self.assertEqual(
            by_indices[(1, 2)][1]["cause_occurrences"],
            [
                {"cause": "positive", "record_index": 1, "state": "resolved"},
                {"cause": "outside", "record_index": 2, "state": "conflict"},
            ],
        )
        mismatches = [
            row for row in result["findings"] if row["code"] == "compatibility_mismatch"
        ]
        self.assertEqual(len(mismatches), 1)
        _prefix, separator, finding_material = mismatches[0]["reason"].partition("\n")
        self.assertEqual(separator, "\n")
        self.assertEqual(json.loads(finding_material)["record_index"], 2)


if __name__ == "__main__":
    unittest.main()
