"""L4のtyped公開row形成不能を、元RawValueを補完せず識別する。"""

import copy
import unittest

from descriptor_definitions import compare_identity_versions_and_trace, validate_supply_input
from identity_input_fixtures import normal_input, trace_input


class TestIdentityPublicFormationGuards(unittest.TestCase):
    def _validated(self, raw):
        before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input"], before)
        self.assertEqual(validated["input_issues"], [])
        return validated, before

    def _omitted_trace(self, raw):
        # 最新review6424756090は旧R1停止指示を訂正し、L4 construction guardへ戻した。
        validated, before = self._validated(raw)
        validated_before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        traces = [row for row in result["axes"] if row["axis"] == "descriptor.trace"]
        self.assertEqual(len(traces), 14)
        self.assertTrue(all(row["state"] == "resolved" for row in traces))
        self.assertEqual(
            [(row["subject_ref"], row["binding"]) for row in traces],
            [(fact["ref"], slot["binding"]) for slot in raw["descriptors"][1:]
             for fact in slot["facts"]],
        )
        self.assertEqual(raw, before)
        self.assertEqual(validated, validated_before)

    def test_fact_without_a_typed_subject_omits_only_its_public_trace(self):
        for value in ("absent", None, 7, "untyped-subject", {"untyped": "subject"}):
            with self.subTest(value=value):
                raw = trace_input("positive")
                fact = raw["descriptors"][0]["facts"][0]
                if value == "absent":
                    fact.pop("ref")
                else:
                    fact["ref"] = copy.deepcopy(value)
                self._omitted_trace(raw)

    def test_unformattable_slot_binding_omits_only_its_public_trace(self):
        raw = trace_input("positive")
        raw["descriptors"][0]["binding"]["untyped_member"] = 1
        self._omitted_trace(raw)

    def test_unformed_source_ref_stays_raw_and_is_never_published_as_a_ref(self):
        # 型不成立の原source_refはprivate RawValueへ保持する局所unknownか、
        # 担当外の識別停止。いずれも型外dictをsource Ref又は欠落根拠に昇格しない。
        raw = trace_input("positive")
        bad = {"untyped_source_ref": "raw value"}
        raw["descriptors"][0]["facts"][0]["source_ref"] = copy.deepcopy(bad)
        validated, before = self._validated(raw)
        validated_before = copy.deepcopy(validated)
        try:
            result = compare_identity_versions_and_trace({"validated": validated})
        except NotImplementedError as exc:
            self.assertIn("F04/N01/unclosed/fact_source_ref_unformed", str(exc))
            self.assertIn("HELIXBRAIN-L6-032-FN3-IDENTITY", str(exc))
        else:
            self.assertFalse(any(r["code"] == "source_missing" for r in result["findings"]))
            for row in result["axes"]:
                self.assertNotIn(bad, row["original_refs"])
            for row in result["findings"]:
                self.assertNotIn(bad, row["source_refs"])
        self.assertEqual(raw, before)
        self.assertEqual(validated, validated_before)

    def test_optional_digest_absence_remains_in_the_original_source_predicate_ref(self):
        raw = normal_input()
        ref = raw["descriptors"][0]["facts"][0]["source_ref"]
        ref.pop("sha256")
        expected = copy.deepcopy(ref)
        missing = raw["sources"].pop(0)
        raw["qualifications"] = [q for q in raw["qualifications"] if q["ref"] != missing["qualification_ref"]]
        validated, before = self._validated(raw)
        result = compare_identity_versions_and_trace({"validated": validated})
        findings = [r for r in result["findings"]
                    if r["code"] == "source_missing" and r["source_refs"] == [expected]]
        self.assertEqual(len(findings), 1)
        rows = [r for r in result["axes"] if r["axis"] == "source" and r["reason"] == findings[0]["reason"]]
        self.assertEqual(len(rows), 1)
        self.assertIn(expected, rows[0]["original_refs"])
        self.assertNotIn("sha256", next(r for r in rows[0]["original_refs"] if r == expected))
        self.assertEqual(raw, before)
        self.assertEqual(validated["input"], before)

    def test_unresolved_source_scope_is_not_a_known_missing_semantic_source(self):
        # Ref照合に必要なscopeが不明なら、source objectの不存在を証明できない。
        # L4 read_branch_contracts/traceのとおり局所unknownを保ち、他14項目を止めない。
        raw = trace_input("positive")
        fact = raw["descriptors"][0]["facts"][0]
        fact["source_ref"]["scope"] = None
        validated, before = self._validated(raw)
        validated_before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        self.assertFalse(any(r["code"] == "source_missing" for r in result["findings"]))
        trace_rows = [r for r in result["axes"] if r["axis"] == "descriptor.trace"]
        self.assertEqual(len(trace_rows), 15)
        row = next(r for r in trace_rows if r["subject_ref"] == fact["ref"])
        self.assertEqual(row["state"], "unknown")
        siblings = [r for r in trace_rows if r["subject_ref"] != fact["ref"]]
        self.assertEqual(len(siblings), 14)
        self.assertTrue(all(r["state"] == "resolved" for r in siblings))
        self.assertEqual(raw, before)
        self.assertEqual(validated, validated_before)


if __name__ == "__main__":
    unittest.main()
