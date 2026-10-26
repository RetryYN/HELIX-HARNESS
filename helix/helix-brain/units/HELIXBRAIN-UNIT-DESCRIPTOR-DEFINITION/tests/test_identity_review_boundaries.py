"""PR 3709 review regressions, derived from the fixed L4/L5 branches."""

from __future__ import annotations

import copy
import json
import unittest

from descriptor_definitions import compare_identity_versions_and_trace, validate_supply_input
from identity_input_fixtures import (
    _append_qualified_source,
    _write_source_content,
    bilateral_input,
    trace_input,
)


FN3_BACKFLOW = "HELIXBRAIN-L6-032-FN3-IDENTITY"


class TestIdentityReviewBoundaries(unittest.TestCase):
    def _validated(self, raw):
        original = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input"], original)
        self.assertEqual(validated["input_issues"], [])
        return validated, original

    def _call(self, raw):
        validated, original = self._validated(raw)
        validated_before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(validated, validated_before)
        self.assertEqual(raw, original)
        return result

    def _axis(self, result, name):
        return next(row for row in result["axes"] if row["axis"] == name)

    def _reason(self, row):
        prefix, separator, encoded = row["reason"].partition("\n")
        self.assertEqual(separator, "\n", "L4 reason is fixed prefix + LF + diagnostic JSON")
        return prefix, json.loads(encoded)

    def _assert_id_stop(self, raw, label):
        validated, original = self._validated(raw)
        validated_before = copy.deepcopy(validated)
        try:
            compare_identity_versions_and_trace({"validated": validated})
        except NotImplementedError as exc:
            message = str(exc)
            self.assertIn("F04/N01/", message)
            self.assertIn(FN3_BACKFLOW, message)
            self.assertIn(label, message)
        else:
            self.fail(f"unsupported input must stop at an identified boundary: {label}")
        self.assertEqual(validated, validated_before)
        self.assertEqual(raw, original)

    def _compat_record(self, raw):
        return raw["compatibility_records"][0]

    def _left_source(self, raw, record):
        matches = [
            source for source in raw["sources"]
            if isinstance(source.get("content"), dict)
            and source["content"].get("compatibility_record_ref") == record["ref"]
        ]
        self.assertEqual(len(matches), 1)
        return matches[0]

    def test_m2_empty_knowledge_records_keep_knowledge_unresolved_cause(self):
        raw = trace_input("zero")
        result = self._call(raw)
        rows = [row for row in result["axes"] if row["axis"] == "descriptor.trace"]
        self.assertEqual(len(rows), 15)
        for row in rows:
            self.assertEqual(row["state"], "unknown")
            prefix, material = self._reason(row)
            self.assertEqual(prefix, "knowledge_unresolved")
            self.assertEqual(material["cause"], "knowledge_unresolved")
            self.assertEqual(material["knowledge_record_indices"], [])
            self.assertEqual(material["provenance_indices"], [])
            self.assertEqual(material["source_indices"], [])
            self.assertEqual(material["body_group_locators"], [])
        self.assertFalse(any(row["code"] == "source_missing" for row in result["findings"]))

    def test_m3_single_compatibility_reason_uses_the_four_key_material_for_five_modes(self):
        expected = {
            "one_owner": (
                "unknown",
                "右pack-owner原宣言は存在するが独立template-owner本文が未供給であり当該pair互換照合はunknownに保持する。",
            ),
            "positive": (
                "resolved",
                "同scope明示pairについて独立template-owner本文とpack-owner本文が共にtrueを明示する。実利用許可ではない。",
            ),
            "outside": (
                "conflict",
                "同scope明示pairについて独立template-owner本文とpack-owner本文が当該実版範囲外を明示する。",
            ),
            "scope": (
                "conflict",
                "原source自身の資格scopeは対応するが対象pairのscopeと既知に異なる。",
            ),
            "source_null": (
                "unknown",
                "明示pairのsource_refは明示nullでowner互換根拠を解決できない。",
            ),
        }
        for mode, (state, prefix_expected) in expected.items():
            with self.subTest(mode=mode):
                raw = bilateral_input(mode)
                result = self._call(raw)
                row = self._axis(result, "compatibility")
                self.assertEqual(row["state"], state)
                prefix, material = self._reason(row)
                self.assertEqual(prefix, prefix_expected)
                self.assertEqual(set(material), {
                    "original_record_reasons", "pair_group_index", "record_indices", "record_states",
                })
                self.assertEqual(material["pair_group_index"], 0)
                self.assertEqual(material["record_indices"], [0])
                self.assertEqual(material["record_states"], [state])
                self.assertEqual(material["original_record_reasons"], [raw["compatibility_records"][0]["reason"]])

    def _assert_conflict_or_identified_stop(self, raw, label):
        # L4 private判断はconflict。公開cause→FindingがWR05の未閉包範囲なら
        # 指定Backflowで止める。unknownへの丸め込みはどちらの契約でも許されない。
        validated, original = self._validated(raw)
        validated_before = copy.deepcopy(validated)
        try:
            result = compare_identity_versions_and_trace({"validated": validated})
        except NotImplementedError as exc:
            message = str(exc)
            self.assertIn("F04/N01/", message)
            self.assertIn(FN3_BACKFLOW, message)
        else:
            self.assertEqual(raw, original)
            self.assertEqual(validated, validated_before)
            self.assertEqual(self._axis(result, "compatibility")["state"], "conflict", label)
        self.assertEqual(raw, original)
        self.assertEqual(validated, validated_before)

    def test_m4_opposing_owner_decisions_never_silently_become_unknown(self):
        # Left false without an outside declaration, while the pack owner is true.
        left_false = bilateral_input("positive")
        record = self._compat_record(left_false)
        left = self._left_source(left_false, record)
        body = copy.deepcopy(left["content"])
        body["compatible"] = False
        body["endpoint_owner_declaration"]["compatible"] = False
        body["endpoint_owner_declaration"]["range_relation"] = "not_supplied"
        body["endpoint_owner_declaration"]["range_reason"] = None
        body["declared_range"] = {
            "pack_contract_versions": [left_false["binding"]["pack_contract_version"]],
            "pack_artifact_versions": [left_false["binding"]["pack_artifact_version"]],
        }
        _write_source_content(left_false, left, body)

        # The record says false, but both qualified owner bodies say true.
        record_false = bilateral_input("positive")
        self._compat_record(record_false)["compatible"] = False

        # The left owner says outside while the right source remains positive.
        left_outside = bilateral_input("outside")
        record = self._compat_record(left_outside)
        record["compatible"] = True
        right = next(source for source in left_outside["sources"] if source["ref"] == record["source_ref"])
        right_body = copy.deepcopy(right["content"])
        right_body.pop("compatibility_range_declaration", None)
        right_body["compatible"] = True
        _write_source_content(left_outside, right, right_body)
        record["source_ref"] = copy.deepcopy(right["ref"])
        left = self._left_source(left_outside, record)
        left_body = copy.deepcopy(left["content"])
        left_body["counterpart_source_ref"] = copy.deepcopy(right["ref"])
        _write_source_content(left_outside, left, left_body)

        for label, raw in (
            ("left false vs right true", left_false),
            ("record false vs both owner bodies true", record_false),
            ("left-only outside vs right positive", left_outside),
        ):
            with self.subTest(case=label):
                self._assert_conflict_or_identified_stop(raw, label)

    def test_m5_missing_right_source_is_not_mislabeled_as_missing_left_owner(self):
        raw = bilateral_input("positive")
        record = self._compat_record(raw)
        missing_ref = copy.deepcopy(record["source_ref"])
        right = next(source for source in raw["sources"] if source["ref"] == missing_ref)
        raw["sources"].remove(right)
        validated, original = self._validated(raw)
        validated_before = copy.deepcopy(validated)
        try:
            result = compare_identity_versions_and_trace({"validated": validated})
        except NotImplementedError as exc:
            self.assertIn("F04/N01/", str(exc))
            self.assertIn(FN3_BACKFLOW, str(exc))
        else:
            row = self._axis(result, "compatibility")
            self.assertEqual(row["state"], "unknown")
            prefix, separator, encoded = row["reason"].partition("\n")
            if separator:
                self.assertEqual(json.loads(encoded).get("cause"), "right_owner_unprovided")
            else:
                self.assertIn("right_owner_unprovided", prefix)
        self.assertEqual(validated, validated_before)
        self.assertEqual(raw, original)

    def test_m6_unsupported_identity_shapes_stop_with_F04_N01_backflow(self):
        missing_records = trace_input("positive")
        missing_records.pop("knowledge_records")

        missing_slot_binding = trace_input("positive")
        missing_slot_binding["descriptors"][0].pop("binding")

        distinct_records = trace_input("equal_records")
        distinct_records["knowledge_records"][1]["operational_state"] = "synthetic-distinct-state"

        multiple_range_sources = bilateral_input("outside")
        record = self._compat_record(multiple_range_sources)
        right = next(source for source in multiple_range_sources["sources"] if source["ref"] == record["source_ref"])
        multiple_range_sources["sources"].append(copy.deepcopy(right))

        unsupported_claim = trace_input("positive")
        fact = unsupported_claim["descriptors"][0]["facts"][0]
        unsupported_claim["claims"].append({
            "subject_ref": copy.deepcopy(fact["ref"]),
            "binding": copy.deepcopy(unsupported_claim["binding"]),
            "actor": "BRAIN",
            "kind": "unrecognized_identity_claim",
            "proposed_value": {"basis_role": "unrecognized"},
            "basis_refs": [copy.deepcopy(unsupported_claim["sources"][0]["ref"])],
        })

        null_provenance = trace_input("positive")
        null_provenance["knowledge_records"][0]["provenance_refs"] = None

        cases = (
            (missing_records, "unclosed/knowledge_records_absent"),
            (missing_slot_binding, "unclosed/slot_binding_absent"),
            (distinct_records, "unclosed/distinct_knowledge_records"),
            (multiple_range_sources, "unclosed/multiple_finding_range_sources"),
            (unsupported_claim, "unclosed/identity_claim"),
            (null_provenance, "unclosed/knowledge_provenance_null"),
        )
        for raw, label in cases:
            with self.subTest(case=label):
                self._assert_id_stop(raw, label)

    def test_m6_three_equal_records_remain_the_existing_success_contrast(self):
        raw = trace_input("equal_records")
        raw["knowledge_records"].append(copy.deepcopy(raw["knowledge_records"][0]))
        result = self._call(raw)
        trace = self._axis(result, "descriptor.trace")
        self.assertEqual(trace["state"], "resolved")
        _prefix, material = self._reason(trace)
        self.assertEqual(
            [row["knowledge_record_index"] for row in material["trace_occurrences"]],
            [0, 1, 2],
        )

    def test_m6_multiple_actual_ranges_do_not_choose_the_last_source(self):
        for reverse in (False, True):
            with self.subTest(reverse=reverse):
                raw = bilateral_input("outside")
                record = self._compat_record(raw)
                right_index = next(i for i, source in enumerate(raw["sources"])
                                   if source["ref"] == record["source_ref"])
                right = raw["sources"][right_index]
                other = _append_qualified_source(
                    raw, identity="synthetic-secondary-actual-pack-source",
                    owner=right["ref"]["owner"], scope=right["ref"]["scope"],
                    content=right["content"],
                    qualification_identity="synthetic-secondary-actual-pack-qualification",
                    root_identity="synthetic-secondary-actual-pack-root",
                )
                qualification = next(q for q in raw["qualifications"]
                                     if q["ref"] == other["qualification_ref"])
                qualification["subject_sha256"] = "0" * 64
                if reverse:
                    raw["sources"][right_index], raw["sources"][-1] = raw["sources"][-1], raw["sources"][right_index]
                original = copy.deepcopy(raw)
                validated = validate_supply_input(raw)
                self.assertEqual(validated["input"], original)
                self.assertEqual(validated["unusable_source_refs"], [other["ref"]])
                self.assertEqual(len(validated["input_issues"]), 1)
                validated_before = copy.deepcopy(validated)
                with self.assertRaises(NotImplementedError) as caught:
                    compare_identity_versions_and_trace({"validated": validated})
                self.assertIn("F04/N01/", str(caught.exception))
                self.assertIn(FN3_BACKFLOW, str(caught.exception))
                self.assertIn("unclosed/multiple_actual_range_sources", str(caught.exception))
                self.assertEqual(raw, original)
                self.assertEqual(validated, validated_before)

    def test_trace_source_indices_follow_physical_source_order_not_provenance_order(self):
        raw = trace_input("positive")
        self.assertGreaterEqual(len(raw["sources"]), 2)
        record = raw["knowledge_records"][0]
        record["provenance_refs"] = [
            copy.deepcopy(raw["sources"][1]["ref"]),
            copy.deepcopy(raw["sources"][0]["ref"]),
        ]
        fact = raw["descriptors"][0]["facts"][0]
        fact["ref"]["identity"] = "SYNTHETIC-UNMATCHED-TRACE-FACT"
        original_provenance = copy.deepcopy(record["provenance_refs"])

        result = self._call(raw)
        trace = self._axis(result, "descriptor.trace")
        self.assertEqual(trace["state"], "unknown")
        _prefix, material = self._reason(trace)
        self.assertEqual(material["source_indices"], [0, 1])
        self.assertEqual(material["provenance_indices"], [
            {"knowledge_record_index": 0, "provenance_index": 0},
            {"knowledge_record_index": 0, "provenance_index": 1},
        ])
        self.assertEqual(raw["knowledge_records"][0]["provenance_refs"], original_provenance)


if __name__ == "__main__":
    unittest.main()
