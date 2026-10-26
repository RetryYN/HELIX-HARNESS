"""R2 compatibility causes from L4 single-read and pair aggregation rules."""

from __future__ import annotations

import copy
import json
import unittest

from descriptor_definitions import compare_identity_versions_and_trace, validate_supply_input
from identity_input_fixtures import (
    _append_qualified_source,
    _left_body,
    _write_source_content,
    bilateral_input,
)


class TestIdentityR2Compatibility(unittest.TestCase):
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

    def _compatibility_axis(self, result):
        rows = [row for row in result["axes"] if row["axis"] == "compatibility"]
        self.assertEqual(len(rows), 1)
        return rows[0]

    def _cause_reason(self, axis, pair_cause, state, owner_causes=None):
        self.assertEqual(axis["state"], state)
        prefix, separator, encoded = axis["reason"].partition("\n")
        self.assertEqual(separator, "\n")
        self.assertEqual(prefix, pair_cause)
        material = json.loads(encoded)
        self.assertEqual(set(material), {
            "cause", "request", "state", "record_presence", "record_is_null", "owner_observations",
        })
        self.assertEqual(material["cause"], pair_cause)
        self.assertEqual(material["state"], state)
        self.assertEqual(material["record_presence"], "supplied")
        self.assertIs(material["record_is_null"], False)
        self.assertIsInstance(material["owner_observations"], list)
        self.assertTrue(all(set(row) == {
            "endpoint", "source_index", "target_scope_relation", "state", "cause",
        } for row in material["owner_observations"]))
        if owner_causes is not None:
            self.assertEqual(
                [(row["endpoint"], row["cause"]) for row in material["owner_observations"]],
                owner_causes,
            )
        states = {
            "owner_body_corresponding": "resolved",
            "owner_decision_differs": "conflict",
            "owner_subject_unresolved": "unknown",
            "owner_decision_unresolved": "unknown",
            "owner_counterpart_unresolved": "unknown",
        }
        for row in material["owner_observations"]:
            self.assertEqual(row["target_scope_relation"], "same")
            self.assertIsInstance(row["source_index"], int)
            if owner_causes is not None:
                self.assertEqual(row["state"], states[row["cause"]])
        return material

    def _record_and_owners(self, raw):
        record = raw["compatibility_records"][0]
        left = next(
            source for source in raw["sources"]
            if isinstance(source.get("content"), dict)
            and source["content"].get("compatibility_record_ref") == record["ref"]
        )
        right = next(source for source in raw["sources"] if source.get("ref") == record["source_ref"])
        return record, left, right

    def _write_body(self, raw, source, body):
        old_ref = copy.deepcopy(source.get("ref"))
        _write_source_content(raw, source, body)
        new_ref = copy.deepcopy(source.get("ref"))
        if old_ref == new_ref:
            return
        for record in raw.get("compatibility_records", []):
            if isinstance(record, dict) and record.get("source_ref") == old_ref:
                record["source_ref"] = copy.deepcopy(new_ref)
        for candidate in raw.get("sources", []):
            content = candidate.get("content") if isinstance(candidate, dict) else None
            if not isinstance(content, dict) or content.get("counterpart_source_ref") != old_ref:
                continue
            linked_body = copy.deepcopy(content)
            linked_body["counterpart_source_ref"] = copy.deepcopy(new_ref)
            _write_source_content(raw, candidate, linked_body)

    def test_single_unexercised_causes_have_l4_state_and_literal_reason(self):
        cases = []

        raw = bilateral_input("positive")
        record, _left, _right = self._record_and_owners(raw)
        record["compatible"] = False
        cases.append(("record decision differs from both owners", "body_record_differs", "conflict",
                      [("left", "owner_decision_differs"), ("right", "owner_decision_differs")], raw))

        raw = bilateral_input("positive")
        record, left, _right = self._record_and_owners(raw)
        body = _left_body(raw, record, _right, compatible=False, outside=True)
        self._write_body(raw, left, body)
        cases.append(("two endpoint decisions oppose", "bilateral_decisions_opposing", "conflict",
                      [("left", "owner_decision_differs"), ("right", "owner_body_corresponding")], raw))

        raw = bilateral_input("positive")
        _record, _left, right = self._record_and_owners(raw)
        body = copy.deepcopy(right["content"])
        body["compatible_refs"] = [copy.deepcopy(raw["compatibility_records"][0]["left_ref"])]
        self._write_body(raw, right, body)
        cases.append(("right endpoint membership unresolved", "bilateral_owner_unresolved", "unknown",
                      [("left", "owner_body_corresponding"), ("right", "owner_subject_unresolved")], raw))

        raw = bilateral_input("positive")
        _record, _left, right = self._record_and_owners(raw)
        body = copy.deepcopy(right["content"])
        body["compatible"] = None
        self._write_body(raw, right, body)
        cases.append(("endpoint decision unresolved", "bilateral_owner_unresolved", "unknown",
                      [("left", "owner_body_corresponding"), ("right", "owner_decision_unresolved")], raw))

        raw = bilateral_input("positive")
        record, _left, _right = self._record_and_owners(raw)
        record["compatible"] = None
        cases.append(("record compatible null", "compatible_null", "unknown",
                      [("left", "owner_decision_unresolved"), ("right", "owner_decision_unresolved")], raw))

        raw = bilateral_input("positive")
        record, _left, right = self._record_and_owners(raw)
        raw["sources"].remove(right)
        # L4 left counterpart link needs an actual right source, not just equal Ref values.
        cases.append(("right owner source unprovided", "right_owner_unprovided", "unknown",
                      [("left", "owner_counterpart_unresolved")], raw))

        for label, pair_cause, state, owner_causes, raw_case in cases:
            with self.subTest(branch=label):
                axis = self._compatibility_axis(self._call(raw_case))
                material = self._cause_reason(axis, pair_cause, state, owner_causes)
                if label == "right owner source unprovided":
                    self.assertTrue(material["owner_observations"])
                    self.assertEqual(material["owner_observations"][0]["endpoint"], "left")
                    self.assertEqual(material["owner_observations"][0]["state"], "unknown")

    def test_same_pair_cause_competition_aggregates_without_rewriting_reads(self):
        raw = bilateral_input("positive")
        first = raw["compatibility_records"][0]
        first_left = next(
            source for source in raw["sources"]
            if isinstance(source.get("content"), dict)
            and source["content"].get("compatibility_record_ref") == first["ref"]
        )
        second = copy.deepcopy(first)
        second["ref"] = copy.deepcopy(first["ref"])
        second["ref"]["identity"] = "SYNTHETIC-COMPATIBILITY-CAUSE-COMPETITION"
        second["ref"]["sha256"] = None
        second["reason"] = "second same-pair owner read"
        second["compatible"] = False
        second_right = _append_qualified_source(
            raw,
            identity="SYNTHETIC-COMPATIBILITY-CAUSE-COMPETITION-RIGHT",
            owner=first["right_ref"]["owner"],
            scope=first["right_ref"]["scope"],
            content={"compatible_refs": [copy.deepcopy(first["right_ref"])], "compatible": True},
            qualification_identity="SYNTHETIC-COMPATIBILITY-CAUSE-COMPETITION-Q",
            root_identity="SYNTHETIC-COMPATIBILITY-CAUSE-COMPETITION-ROOT",
            revision=first["right_ref"]["revision"],
        )
        second["source_ref"] = copy.deepcopy(second_right["ref"])
        raw["compatibility_records"].append(second)
        second_left_body = copy.deepcopy(first_left["content"])
        second_left_body["compatibility_record_ref"] = copy.deepcopy(second["ref"])
        second_left_body["counterpart_source_ref"] = copy.deepcopy(second["source_ref"])
        _append_qualified_source(
            raw,
            identity="SYNTHETIC-COMPATIBILITY-CAUSE-COMPETITION-LEFT",
            owner=first["left_ref"]["owner"],
            scope=first["left_ref"]["scope"],
            content=second_left_body,
            qualification_identity="SYNTHETIC-COMPATIBILITY-CAUSE-COMPETITION-LEFT-Q",
            root_identity="SYNTHETIC-COMPATIBILITY-CAUSE-COMPETITION-LEFT-ROOT",
            revision=first["left_ref"]["revision"],
        )
        result = self._call(raw)
        axis = self._compatibility_axis(result)
        self.assertEqual(axis["state"], "unknown")
        self.assertEqual(axis["backflow_owner"], "knowledge_owner")
        prefix, separator, encoded = axis["reason"].partition("\n")
        self.assertEqual(separator, "\n")
        self.assertEqual(prefix, "両端契約のowner宣言へ解決する互換根拠が未供給で適合/不適合を評価できない。")
        material = json.loads(encoded)
        self.assertEqual(set(material), {"cause_occurrences"})
        occurrences = material["cause_occurrences"]
        self.assertEqual([set(row) for row in occurrences], [
            {"cause", "record_index", "state"}, {"cause", "record_index", "state"},
        ])
        self.assertEqual(occurrences, [
            {"cause": "positive", "record_index": 0, "state": "resolved"},
            {"cause": "body_record_differs", "record_index": 1, "state": "conflict"},
        ])
        self.assertFalse(any(row["code"] in {"compatibility_unknown", "compatibility_mismatch"}
                             for row in result["findings"]))

    def test_unusable_right_source_remains_right_owner_unprovided(self):
        raw = bilateral_input("positive")
        record, _left, right = self._record_and_owners(raw)
        qualification = next(row for row in raw["qualifications"]
                             if row["ref"] == right["qualification_ref"])
        qualification["subject_sha256"] = "0" * 64
        original = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input"], original)
        self.assertIn(right["ref"], validated["unusable_source_refs"])
        self.assertTrue(validated["input_issues"])
        before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        axis = self._compatibility_axis(result)
        self._cause_reason(axis, "right_owner_unprovided", "unknown")
        self.assertFalse(any(row["code"] in {"compatibility_unknown", "compatibility_mismatch"}
                             for row in result["findings"]))
        self.assertEqual(validated, before)
        self.assertEqual(raw, original)

    def test_multiple_left_sources_stop_at_their_own_unclosed_finding_range_branch(self):
        # WR05 retains the multiple Finding-range branch; duplicate only LEFT so
        # neither multiple actual nor multiple RIGHT sources can satisfy this ID.
        raw = bilateral_input("outside")
        _record, left, _right = self._record_and_owners(raw)
        raw["sources"].append(copy.deepcopy(left))
        original = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input"], original)
        self.assertEqual(validated["input_issues"], [])
        before = copy.deepcopy(validated)
        with self.assertRaises(NotImplementedError) as caught:
            compare_identity_versions_and_trace({"validated": validated})
        self.assertIn("F04/N01/unclosed/multiple_finding_range_sources/left", str(caught.exception))
        self.assertIn("HELIXBRAIN-L6-032-FN3-IDENTITY", str(caught.exception))
        self.assertEqual(validated, before)
        self.assertEqual(raw, original)

    def test_finite_positive_outside_pair_keeps_its_existing_conflict_projection(self):
        raw = bilateral_input("opposing")
        result = self._call(raw)
        axis = self._compatibility_axis(result)
        self.assertEqual(axis["state"], "conflict")
        prefix, separator, encoded = axis["reason"].partition("\n")
        self.assertEqual((prefix, separator), ("同scope同明示pairのqualified原宣言が相反する。両原宣言を保持する。", "\n"))
        material = json.loads(encoded)
        self.assertEqual(material["record_indices"], [0, 1])
        self.assertEqual(material["record_states"], ["resolved", "conflict"])
        findings = [row for row in result["findings"] if row["code"] == "compatibility_mismatch"]
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0]["state"], "conflict")


if __name__ == "__main__":
    unittest.main()
