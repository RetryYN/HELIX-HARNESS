"""fn3 identity/trace の有限観測を独立入力で確かめる。

根拠はL4 identity_version_trace_contract（actual/bilateral/trace/public_projection）、
L5 /functions/3、L8 /function_oracles/3 と個別case ID。画像/tool node・filename・
version_targetのclaimは独立actual version/identity evidenceではなく、該当caseの
Findingとunknown/conflict軸を観測する。L8の期待全体や保存済みwholeを入力・期待として
複製しない。各assertは契約から選んだ部分観測で、製品全域の
成功や資格・承認を示さない。未閉包枝はcase ID付きNotImplementedErrorで止める。
"""

from __future__ import annotations

import copy
import json
import unittest

from descriptor_definitions import (
    compare_descriptor_definitions,
    compare_identity_versions_and_trace,
    validate_supply_input,
)
from identity_input_fixtures import normal_input


FN3 = "compare_identity_versions_and_trace"
FN3_BACKFLOW = "HELIXBRAIN-L6-032-FN3-IDENTITY"
TRACE_AXIS = "descriptor.trace"
COMPAT_AXIS = "compatibility"


def _identity_fixture_api():
    # C3 bilateral/trace入力は別のtest-only入力assemblerがL4 raw carrier形から
    # 合成する。期待値、ValidatedSupply、private readはこのAPIから受け取らない。
    from identity_input_fixtures import bilateral_input, trace_input

    return bilateral_input, trace_input


class TestIdentityVersionsAndTrace(unittest.TestCase):
    def _normal_raw(self):
        return normal_input()

    def _validate(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(raw, raw_before, "fn0 must not mutate raw input")
        self.assertIsNotNone(validated["input"], "fn0 decoding contract must preserve this schema-valid input")
        self.assertEqual(validated["input"], raw_before, "fn0 decoded input retains all original values")
        self.assertEqual(validated["input_issues"], [], "fn0 decode/qualification contract has no issue for this input")
        return validated, raw_before

    def _fn3(self, raw):
        validated, raw_before = self._validate(raw)
        validated_before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(validated, validated_before, "fn3 must not mutate the same fn0 result")
        self.assertEqual(raw, raw_before, "fn3 must not mutate raw input")
        self._assert_comparison(result, raw_before["binding"])
        return result, validated

    def _assert_comparison(self, result, binding):
        self.assertEqual(
            set(result), {"axes", "findings", "producer_symbol", "input_binding"}
        )
        self.assertEqual(result["producer_symbol"], FN3)
        self.assertEqual(result["input_binding"], binding)
        self.assertIsInstance(result["axes"], list)
        self.assertIsInstance(result["findings"], list)
        for axis in result["axes"]:
            self.assertEqual(
                set(axis),
                {"subject_ref", "binding", "axis", "state", "original_refs", "reason", "backflow_owner"},
            )
        for finding in result["findings"]:
            self.assertEqual(
                set(finding),
                {"code", "rule_ref", "subject_ref", "binding", "axis", "state", "source_refs", "reason", "backflow_owner"},
            )

    def _assert_axis_state(self, result, axis_name, state):
        rows = [row for row in result["axes"] if row["axis"] == axis_name]
        self.assertTrue(rows, f"expected axis {axis_name}")
        self.assertTrue(any(row["state"] == state for row in rows))

    def _assert_finding(self, result, code, state, axis):
        rows = [row for row in result["findings"] if row["code"] == code]
        self.assertTrue(rows, f"expected finding {code}")
        self.assertTrue(any(
            row["rule_ref"] == f"HELIXBRAIN-L5-032-R-{code}"
            and row["state"] == state
            and row["axis"] == axis
            and row["backflow_owner"] == "knowledge_owner"
            for row in rows
        ))

    def _assert_mixed_revision_finding(self, result, fact, slot):
        rows = [row for row in result["findings"] if row["code"] == "mixed_knowledge_revision"]
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["rule_ref"], "HELIXBRAIN-L5-032-R-mixed_knowledge_revision")
        self.assertEqual(rows[0]["subject_ref"], fact["ref"])
        self.assertEqual(rows[0]["binding"], slot["binding"])
        self.assertEqual(rows[0]["axis"], TRACE_AXIS)
        self.assertEqual(rows[0]["state"], "conflict")
        self.assertEqual(rows[0]["source_refs"], [fact["source_ref"]])
        self.assertEqual(rows[0]["backflow_owner"], "knowledge_owner")
        return rows[0]

    def _assert_actual_owner_unprovided(self, result, axis_name, original_ref):
        rows = [row for row in result["axes"] if row["axis"] == axis_name]
        self.assertTrue(rows, f"expected actual axis {axis_name}")
        matching = [row for row in rows if row["state"] == "unknown"]
        self.assertTrue(matching, f"{axis_name} stays unknown without qualified actual owner evidence")
        self.assertTrue(any(original_ref in row["original_refs"] for row in matching))
        materials = []
        for row in matching:
            _prefix, separator, diagnostic_json = row["reason"].partition("\n")
            if separator:
                materials.append(json.loads(diagnostic_json))
        self.assertTrue(any(
            material.get("cause") == "actual_owner_body_unprovided"
            for material in materials
        ))

    def _assert_case_result(self, case_id, raw):
        # Variantごとに独立rawを渡す。変異自体はL8 typed mutationの語彙から
        # 独立に組み立て、L8の保存済みexpected outputは読まない。
        try:
            result, _validated = self._fn3(raw)
        except NotImplementedError as exc:
            self.fail(f"{case_id}: finite supported observation stopped: {exc}")
        return result

    def test_NORMAL_fn3_uses_the_same_fn0_snapshot_as_fn1(self):
        raw = self._normal_raw()
        raw_before = copy.deepcopy(raw)
        validated, _ = self._validate(raw)
        validated_before = copy.deepcopy(validated)

        # fn1は別producerとして同じfn0値を受け取る。fn1 Comparisonはfn3へ渡さない。
        definitions = compare_descriptor_definitions({"validated": validated})
        definitions_before = copy.deepcopy(definitions)
        self.assertEqual(definitions["producer_symbol"], "compare_descriptor_definitions")
        self.assertEqual(definitions["input_binding"], raw["binding"])
        result = compare_identity_versions_and_trace({"validated": validated})

        self._assert_comparison(result, raw["binding"])
        self.assertEqual(validated, validated_before)
        self.assertEqual(definitions, definitions_before)
        self.assertEqual(raw, raw_before)
        # L4 normal inputではactual owner本文とprovenance対応は未解決。
        self._assert_axis_state(result, TRACE_AXIS, "unknown")
        self._assert_axis_state(result, COMPAT_AXIS, "unknown")
        self._assert_finding(result, "compatibility_unknown", "unknown", COMPAT_AXIS)
        self.assertTrue(any(
            row["axis"] == "template.identity" and row["state"] == "unknown"
            for row in result["axes"]
        ))

    def test_F04_NEG_01_missing_semantic_source_keeps_the_original_ref(self):
        raw = self._normal_raw()
        original_ref = copy.deepcopy(raw["descriptors"][0]["facts"][0]["source_ref"])
        source_count_before = len(raw["sources"])
        source_index = next(i for i, s in enumerate(raw["sources"])
                            if s["ref"]["identity"] == "synthetic-semantic-source")
        self.assertEqual(source_index, 0, "setup: selected missing source is the original source[0]")
        source = raw["sources"].pop(source_index)
        qualification_ref = copy.deepcopy(source["qualification_ref"])
        raw["qualifications"] = [q for q in raw["qualifications"] if q["ref"] != qualification_ref]
        self.assertEqual(len(raw["sources"]), source_count_before - 1)
        result = self._assert_case_result("HELIXBRAIN-L8-032-F04-NEG-01", raw)
        source_missing = [row for row in result["findings"] if row["code"] == "source_missing"]
        self.assertTrue(source_missing)
        self.assertTrue(any(
            row["rule_ref"] == "HELIXBRAIN-L5-032-R-source_missing"
            and row["axis"] == "source"
            and row["state"] == "missing"
            and row["backflow_owner"] == "knowledge_owner"
            and row["subject_ref"] == raw["binding"]["template_ref"]
            and original_ref in row["source_refs"]
            for row in source_missing
        ))

    def test_F04_NEG_03_scope_null_is_not_repaired_from_filename_or_other_scope(self):
        raw = self._normal_raw()
        raw["binding"]["template_ref"]["scope"] = None
        result = self._assert_case_result("HELIXBRAIN-L8-032-F04-NEG-03", raw)
        self.assertTrue(any(
            row["code"] == "scope_missing"
            and row["rule_ref"] == "HELIXBRAIN-L5-032-R-scope_missing"
            and row["state"] == "missing"
            for row in result["findings"]
        ))

    def test_F04_NEG_04_source_null_keeps_null_reason_and_does_not_add_null_ref(self):
        bilateral_input, _trace_input = _identity_fixture_api()
        raw = bilateral_input("source_null")
        raw_before = copy.deepcopy(raw)
        result = self._assert_case_result("HELIXBRAIN-L8-032-F04-NEG-04", raw)
        self.assertEqual(raw, raw_before)
        rows = [row for row in result["axes"] if row["axis"] == COMPAT_AXIS]
        self.assertTrue(rows)
        self.assertTrue(any(row["state"] == "unknown" for row in rows))
        self.assertTrue(all(
            ref is not None for row in rows for ref in row["original_refs"]
        ))
        self._assert_finding(result, "compatibility_unknown", "unknown", COMPAT_AXIS)
        prefix, separator, _material = rows[0]["reason"].partition("\n")
        self.assertTrue(separator)
        self.assertEqual(prefix, "明示pairのsource_refは明示nullでowner互換根拠を解決できない。")
        r61 = next(row for row in result["findings"] if row["code"] == "compatibility_unknown")
        self.assertEqual(r61["source_refs"], [])

    def test_F04_NEG_05_qualified_outside_range_uses_the_existing_mismatch_rule(self):
        bilateral_input, _trace_input = _identity_fixture_api()
        raw = bilateral_input("outside")
        result = self._assert_case_result("HELIXBRAIN-L8-032-F04-NEG-05", raw)
        rows = [row for row in result["axes"] if row["axis"] == COMPAT_AXIS]
        self.assertTrue(any(
            row["state"] == "conflict" and row["backflow_owner"] == "knowledge_owner"
            for row in rows
        ))
        findings = [row for row in result["findings"] if row["code"] == "compatibility_mismatch"]
        self.assertEqual(len(findings), 1)
        finding = findings[0]
        self.assertEqual(finding["rule_ref"], "HELIXBRAIN-L5-032-R-compatibility_mismatch")
        self.assertEqual(finding["axis"], COMPAT_AXIS)
        self.assertEqual(finding["state"], "conflict")
        self.assertEqual(finding["backflow_owner"], "knowledge_owner")
        record = raw["compatibility_records"][0]
        left_sources = [
            source for source in raw["sources"]
            if isinstance(source.get("content"), dict)
            and source["content"].get("compatibility_record_ref") == record["ref"]
            and source["content"].get("counterpart_source_ref") == record["source_ref"]
        ]
        right_sources = [source for source in raw["sources"] if source["ref"] == record["source_ref"]]
        self.assertEqual(len(left_sources), 1)
        self.assertEqual(len(right_sources), 1)
        self.assertEqual(len(finding["source_refs"]), 2)
        participating = [left_sources[0]["ref"], right_sources[0]["ref"]]
        self.assertEqual(finding["source_refs"], [
            source["ref"] for source in raw["sources"] if source["ref"] in participating
        ])

    def test_F04_NEG_06_oracle_revision_mismatch_preserves_the_supplied_revision(self):
        raw = self._normal_raw()
        original = copy.deepcopy(raw["oracle_bindings"][0]["oracle_ref"])
        raw["oracle_bindings"][0]["oracle_ref"]["revision"] = "synthetic-other-revision"
        result = self._assert_case_result("HELIXBRAIN-L8-032-F04-NEG-06", raw)
        self.assertEqual(raw["oracle_bindings"][0]["oracle_ref"]["revision"], "synthetic-other-revision")
        self.assertEqual(result["input_binding"], raw["binding"])
        self.assertNotEqual(original["revision"], raw["oracle_bindings"][0]["oracle_ref"]["revision"])
        findings = [row for row in result["findings"] if row["code"] == "oracle_revision_mismatch"]
        self.assertEqual(len(findings), 1)
        finding = findings[0]
        self.assertEqual(finding["rule_ref"], "HELIXBRAIN-L5-032-R-oracle_revision_mismatch")
        self.assertEqual(finding["axis"], "oracle.binding")
        self.assertEqual(finding["state"], "conflict")
        self.assertEqual(finding["backflow_owner"], "knowledge_owner")
        self.assertEqual(finding["subject_ref"], raw["oracle_bindings"][0]["subject_ref"])
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertTrue(any(
            row["axis"] == "oracle.binding" and row["state"] == "conflict"
            and row["backflow_owner"] == "knowledge_owner"
            for row in result["axes"]
        ))

    def _append_claim(self, raw, kind, proposed_value, basis_refs):
        descriptor = raw["descriptors"][0]
        raw["claims"].append({
            "subject_ref": copy.deepcopy(descriptor["facts"][0]["ref"]),
            "binding": copy.deepcopy(descriptor["binding"]),
            "actor": None,
            "kind": kind,
            "proposed_value": proposed_value,
            "basis_refs": copy.deepcopy(basis_refs),
        })

    def test_F04_NEG_07_image_only_claim_does_not_replace_original_identity(self):
        raw = self._normal_raw()
        original_template = copy.deepcopy(raw["binding"]["template_ref"])
        basis = [raw["descriptors"][0]["facts"][0]["source_ref"]]
        self._append_claim(raw, "template_identity", {"identity": None, "basis_role": "image_only"}, basis)
        result = self._assert_case_result("HELIXBRAIN-L8-032-F04-NEG-07", raw)
        self.assertEqual(result["input_binding"]["template_ref"], original_template)
        self._assert_finding(result, "image_identity_inference", "unknown", "template.identity")
        self.assertIn("template.identity", [row["axis"] for row in result["axes"]])
        self._assert_actual_owner_unprovided(result, "template.identity", original_template)

    def test_F04_NEG_08_tool_node_only_claim_does_not_replace_template_revision(self):
        raw = self._normal_raw()
        original_template = copy.deepcopy(raw["binding"]["template_ref"])
        self._append_claim(raw, "template_version", {"revision": None, "basis_role": "tool_node_only"},
                           [copy.deepcopy(raw["sources"][0]["ref"])])
        result = self._assert_case_result("HELIXBRAIN-L8-032-F04-NEG-08", raw)
        self.assertEqual(result["input_binding"]["template_ref"], original_template)
        self._assert_finding(result, "tool_node_identity_inference", "unknown", "template.version")
        self.assertIn("template.version", [row["axis"] for row in result["axes"]])
        self._assert_actual_owner_unprovided(result, "template.version", original_template)

    def test_F04_NEG_09_same_filename_claim_does_not_join_identity(self):
        raw = self._normal_raw()
        original = copy.deepcopy(raw["binding"]["template_ref"])
        filename_sources = raw["sources"][2:4]
        self._append_claim(
            raw, "same_template_identity", {"same_filename": True},
            [copy.deepcopy(source["ref"]) for source in filename_sources],
        )
        result = self._assert_case_result("HELIXBRAIN-L8-032-F04-NEG-09", raw)
        self.assertEqual(result["input_binding"]["template_ref"], original)
        # L5のpredicateには、qualifiedな異template identity二候補と同filenameが必要。
        # このrawはそのactual evidenceを持たないためL8のconflictを先取りしない。
        self._assert_actual_owner_unprovided(result, "template.identity", original)
        self.assertFalse(any(row["code"] == "filename_identity_join" for row in result["findings"]))
        self.assertFalse(any(row["axis"] == "identity_claim" for row in result["axes"]))

    def test_F04_NEG_10_unformed_actual_version_claim_stops_at_the_unclosed_boundary(self):
        raw = self._normal_raw()
        self._append_claim(
            raw, "template_version", raw["binding"]["version_target"],
            [copy.deepcopy(raw["sources"][0]["ref"])],
        )
        # L5 R67はqualifiedな原template実版との比較を要する。現入力にはそのoperandが
        # 形成されていないため、推測のunknown/Findingではなく、停止位置をcase IDで保つ。
        self._assert_fn3_stops_with_case_id(
            "F04-NEG-10/unclosed/version_target_as_actual", raw
        )

    def test_F04_NEG_11_zero_knowledge_records_keep_unknown_trace(self):
        _bilateral_input, trace_input = _identity_fixture_api()
        raw = trace_input("zero")
        self.assertEqual(raw["knowledge_records"], [])
        result = self._assert_case_result("HELIXBRAIN-L8-032-F04-NEG-11", raw)
        self._assert_axis_state(result, TRACE_AXIS, "unknown")
        self.assertEqual(result["input_binding"], raw["binding"])

    def test_I1B_equal_records_keep_both_raw_occurrences(self):
        _bilateral_input, trace_input = _identity_fixture_api()
        raw = trace_input("equal_records")
        self.assertGreaterEqual(len(raw["knowledge_records"]), 2)
        self.assertEqual(raw["knowledge_records"][0], raw["knowledge_records"][1])
        raw_before = copy.deepcopy(raw)
        result = self._assert_case_result("HELIXBRAIN-L8-032-I1B-EQUAL-RECORDS", raw)
        self.assertEqual(raw, raw_before)
        self._assert_axis_state(result, TRACE_AXIS, "resolved")
        slot, fact = raw["descriptors"][0], raw["descriptors"][0]["facts"][0]
        record = raw["knowledge_records"][0]
        provenance = record["provenance_refs"][0]
        source = next(row for row in raw["sources"] if row["ref"] == provenance)
        qualification = next(row for row in raw["qualifications"] if row["ref"] == source["qualification_ref"])
        root = next(row for row in raw["qualification_roots"] if row == qualification["root_ref"])
        chain_refs = [
            record["ref"], provenance, source["ref"], source["qualification_ref"],
            qualification["ref"], root,
        ]
        expected_refs = [fact["ref"], fact["source_ref"], slot["binding"]["knowledge_ref"]] + chain_refs + chain_refs
        rows = [row for row in result["axes"] if row["axis"] == TRACE_AXIS]
        self.assertTrue(any(row["original_refs"] == expected_refs for row in rows))
        reason = next(row["reason"] for row in rows if row["original_refs"] == expected_refs)
        _prefix, separator, diagnostic_json = reason.partition("\n")
        self.assertTrue(separator)
        occurrences = json.loads(diagnostic_json)["trace_occurrences"]
        self.assertEqual(len(occurrences), 2)
        self.assertEqual(
            [(row["knowledge_record_index"], row["provenance_index"]) for row in occurrences],
            [(0, 0), (1, 0)],
        )

    def test_I1Q_equal_qualification_occurrences_keep_both_global_indices(self):
        _bilateral_input, trace_input = _identity_fixture_api()
        raw = trace_input("equal_qualifications")
        source = next(s for s in raw["sources"] if s["qualification_ref"] is not None)
        matching = [q for q in raw["qualifications"] if q["ref"] == source["qualification_ref"]]
        self.assertEqual(len(matching), 2)
        self.assertEqual(matching[0], matching[1])
        raw_before = copy.deepcopy(raw)
        validated, _ = self._validate(raw)
        self.assertEqual(validated["input"], raw_before)
        self.assertNotIn(source["ref"], validated["unusable_source_refs"])
        result = compare_identity_versions_and_trace({"validated": validated})
        self._assert_comparison(result, raw["binding"])
        self.assertEqual(raw, raw_before)
        self._assert_axis_state(result, TRACE_AXIS, "resolved")
        slot, fact = raw["descriptors"][0], raw["descriptors"][0]["facts"][0]
        record = raw["knowledge_records"][0]
        provenance = record["provenance_refs"][0]
        qualification = matching[0]
        root = qualification["root_ref"]
        suffix = [
            record["ref"], provenance, source["ref"], source["qualification_ref"],
            qualification["ref"], root,
        ]
        expected_refs = [fact["ref"], fact["source_ref"], slot["binding"]["knowledge_ref"]] + suffix + suffix
        trace_rows = [row for row in result["axes"] if row["axis"] == TRACE_AXIS]
        self.assertTrue(any(row["original_refs"] == expected_refs for row in trace_rows))
        self.assertEqual(len(expected_refs), 15)
        reason = next(row["reason"] for row in trace_rows if row["original_refs"] == expected_refs)
        _prefix, separator, diagnostic_json = reason.partition("\n")
        self.assertTrue(separator, "plural trace reason uses fixed prefix plus diagnostic JSON")
        material = json.loads(diagnostic_json)
        occurrences = material["trace_occurrences"]
        self.assertEqual([row["qualification_index"] for row in occurrences], [0, len(raw["qualifications"]) - 1])

    def test_N01_NEG_01_mixed_revision_is_not_silently_collapsed(self):
        _bilateral_input, trace_input = _identity_fixture_api()
        raw = trace_input("positive")
        slot = raw["descriptors"][0]
        fact = slot["facts"][0]
        fact["binding"]["knowledge_ref"]["revision"] = "synthetic-other-revision"
        result = self._assert_case_result("HELIXBRAIN-L8-032-N01-NEG-01", raw)
        # L5 R-mixed: 一項目のrevision差。R-silent: 同じ旧新pairに明示relationなし。
        # この入力は両述語を満たす。L8 NEG番号を相互排他gateへ変えない（R3-m3）。
        findings = [row for row in result["findings"] if row["code"] == "mixed_knowledge_revision"]
        self.assertTrue(findings)
        self._assert_mixed_revision_finding(result, fact, slot)
        self._assert_finding(result, "silent_supersession", "conflict", TRACE_AXIS)
        self.assertEqual(sum(row["code"] == "silent_supersession" for row in result["findings"]), 1)
        self._assert_axis_state(result, TRACE_AXIS, "conflict")

    def test_N01_NEG_02_missing_supersession_keeps_the_original_binding(self):
        _bilateral_input, trace_input = _identity_fixture_api()
        raw = trace_input("positive")
        original = copy.deepcopy(raw["binding"]["knowledge_ref"])
        fact = raw["descriptors"][0]["facts"][0]
        original_fact_ref = copy.deepcopy(fact["ref"])
        old_trace_ref = copy.deepcopy(raw["knowledge_records"][0]["ref"])
        new_fact_ref = copy.deepcopy(fact["binding"]["knowledge_ref"])
        new_fact_ref["revision"] = "synthetic-next-revision"
        fact["binding"]["knowledge_ref"] = copy.deepcopy(new_fact_ref)
        self.assertFalse(any(
            relation["kind"] == "supersedes"
            and relation["from_ref"] == old_trace_ref
            and relation["to_ref"] == new_fact_ref
            for relation in raw["relations"]
        ), "silent case has no relation for this old/new pair; unrelated relations remain")
        result = self._assert_case_result("HELIXBRAIN-L8-032-N01-NEG-02", raw)
        self.assertEqual(result["input_binding"]["knowledge_ref"], original)
        self._assert_finding(result, "silent_supersession", "conflict", TRACE_AXIS)
        self._assert_mixed_revision_finding(result, fact, raw["descriptors"][0])
        self.assertTrue(any(
            row["axis"] == TRACE_AXIS and old_trace_ref in row["original_refs"]
            for row in result["axes"]
        ))
        silent = [row for row in result["findings"] if row["code"] == "silent_supersession"]
        self.assertEqual(len(silent), 1)
        self.assertTrue(any(
            row["subject_ref"] == original_fact_ref
            and row["binding"] == raw["descriptors"][0]["binding"]
            and fact["source_ref"] in row["source_refs"]
            for row in silent
        ))
        self.assertEqual(fact["binding"]["knowledge_ref"], new_fact_ref)

    def test_ADD_13_pack_artifact_change_keeps_template_and_knowledge_versions(self):
        bilateral_input, _trace_input = _identity_fixture_api()
        baseline_raw = bilateral_input("positive")
        baseline_result = self._assert_case_result("ADD-13-baseline", baseline_raw)
        raw = bilateral_input("positive")
        template_revision = copy.deepcopy(raw["binding"]["template_ref"]["revision"])
        knowledge_revision = copy.deepcopy(raw["binding"]["knowledge_ref"]["revision"])
        raw["binding"]["pack_artifact_version"] = "synthetic-artifact-B"
        result = self._assert_case_result("HELIXBRAIN-L8-032-ADD-13", raw)
        self.assertEqual(result["input_binding"]["template_ref"]["revision"], template_revision)
        self.assertEqual(result["input_binding"]["knowledge_ref"]["revision"], knowledge_revision)
        self._assert_axis_state(result, "pack.artifact_version", "unknown")
        self._assert_actual_owner_unprovided(
            result, "pack.artifact_version", raw["binding"]["pack_ref"]
        )
        for axis_name in ("template.version", "knowledge.revision", "pack.contract_version"):
            before = [row["state"] for row in baseline_result["axes"] if row["axis"] == axis_name]
            after = [row["state"] for row in result["axes"] if row["axis"] == axis_name]
            self.assertTrue(before, f"baseline exposes {axis_name}")
            self.assertEqual(after, before, f"pack artifact mutation leaves {axis_name} observation unchanged")

    def test_ADD_14_explicit_supersession_does_not_rewrite_old_trace_refs(self):
        _bilateral_input, trace_input = _identity_fixture_api()
        raw = trace_input("positive")
        old_ref = copy.deepcopy(raw["knowledge_records"][0]["ref"])
        original_record = copy.deepcopy(raw["knowledge_records"][0])
        fact = raw["descriptors"][0]["facts"][0]
        old_fact_ref = copy.deepcopy(fact["binding"]["knowledge_ref"])
        self.assertEqual(old_fact_ref, old_ref)
        new_fact_ref = copy.deepcopy(old_fact_ref)
        new_fact_ref["revision"] = "synthetic-next-revision"
        fact["binding"]["knowledge_ref"] = copy.deepcopy(new_fact_ref)
        # N01-NEG-02は同じ旧→新付替えで対応relationがない対照を保持する。
        raw["relations"].append({
            "ref": {**copy.deepcopy(old_ref), "identity": "synthetic-add14-relation"},
            "binding": copy.deepcopy(raw["binding"]),
            "kind": "supersedes",
            "from_ref": old_ref,
            "to_ref": new_fact_ref,
            "direction": "old_to_new",
            "source_ref": copy.deepcopy(raw["sources"][0]["ref"]),
        })
        self.assertTrue(any(
            relation["kind"] == "supersedes"
            and relation["from_ref"] == old_ref
            and relation["to_ref"] == new_fact_ref
            and relation["direction"] == "old_to_new"
            for relation in raw["relations"]
        ))
        result = self._assert_case_result("HELIXBRAIN-L8-032-ADD-14", raw)
        self.assertEqual(result["input_binding"], raw["binding"])
        self.assertEqual(raw["knowledge_records"][0], original_record)
        self.assertEqual(fact["binding"]["knowledge_ref"], new_fact_ref)
        self.assertFalse(any(row["code"] == "silent_supersession" for row in result["findings"]))
        # N01-NEG-02は同じ旧→新付替えでsilent_supersessionを出す対照。明示relationは
        # その述語だけに作用し、mixed_knowledge_revisionの原predicate/tupleを消さない。
        self._assert_mixed_revision_finding(result, fact, raw["descriptors"][0])
        self.assertTrue(any(
            row["axis"] == TRACE_AXIS and old_ref in row["original_refs"]
            for row in result["axes"]
        ))

    def test_C3_positive_pair_is_resolved_only_from_bilateral_owner_sources(self):
        bilateral_input, _trace_input = _identity_fixture_api()
        raw = bilateral_input("positive")
        result = self._assert_case_result("C3-INDEPENDENT-BILATERAL-TEMPLATE-PACK-POSITIVE-WHOLE", raw)
        rows = [row for row in result["axes"] if row["axis"] == COMPAT_AXIS]
        self.assertTrue(rows)
        self.assertTrue(any(row["state"] == "resolved" for row in rows))
        self.assertFalse(any(
            row["code"] in {"compatibility_unknown", "compatibility_mismatch"}
            for row in result["findings"]
        ))

    def test_C3_original_one_owner_stays_unknown_and_keeps_R61_mapping(self):
        bilateral_input, _trace_input = _identity_fixture_api()
        raw = bilateral_input("one_owner")
        result = self._assert_case_result("C3-ORIGINAL-ONE-OWNER-PAIR-UNKNOWN-WHOLE", raw)
        rows = [row for row in result["axes"] if row["axis"] == COMPAT_AXIS]
        self.assertTrue(rows)
        self.assertTrue(any(row["state"] == "unknown" for row in rows))
        self.assertTrue(any(
            row["code"] == "compatibility_unknown"
            and row["rule_ref"] == "HELIXBRAIN-L5-032-R-compatibility_unknown"
            for row in result["findings"]
        ))

    def test_general_single_trace_chain_preserves_the_l4_ref_sequence(self):
        _bilateral_input, trace_input = _identity_fixture_api()
        raw = trace_input("positive")
        result = self._assert_case_result("HELIXBRAIN-L8-032-ID-GENERAL-OCCURRENCE-CAUSE-WITNESS", raw)
        slot, fact = raw["descriptors"][0], raw["descriptors"][0]["facts"][0]
        record = raw["knowledge_records"][0]
        provenance = record["provenance_refs"][0]
        source = next(row for row in raw["sources"] if row["ref"] == provenance)
        qualification = next(row for row in raw["qualifications"] if row["ref"] == source["qualification_ref"])
        root = next(row for row in raw["qualification_roots"] if row == qualification["root_ref"])
        expected_prefix_and_suffix = [
            fact["ref"], fact["source_ref"], slot["binding"]["knowledge_ref"],
            record["ref"], provenance, source["ref"], source["qualification_ref"],
            qualification["ref"], root,
        ]
        rows = [row for row in result["axes"] if row["axis"] == TRACE_AXIS]
        self.assertTrue(rows)
        self.assertTrue(any(row["original_refs"] == expected_prefix_and_suffix for row in rows))

    def test_C3_scope_difference_remains_conflict_without_a_new_finding(self):
        bilateral_input, _trace_input = _identity_fixture_api()
        raw = bilateral_input("scope")
        result = self._assert_case_result("C3-QUALIFIED-SOURCE-OTHER-SCOPE-WHOLE", raw)
        rows = [row for row in result["axes"] if row["axis"] == COMPAT_AXIS]
        self.assertTrue(rows)
        self.assertTrue(any(row["state"] == "conflict" for row in rows))
        self.assertFalse(any(row["code"] == "compatibility_mismatch" for row in result["findings"]))

    def test_C3_range_false_uses_only_the_qualified_outside_predicate(self):
        bilateral_input, _trace_input = _identity_fixture_api()
        raw = bilateral_input("outside")
        result = self._assert_case_result("C3-QUALIFIED-BILATERAL-RANGE-FALSE-WHOLE", raw)
        self.assertTrue(any(
            row["code"] == "compatibility_mismatch"
            and row["rule_ref"] == "HELIXBRAIN-L5-032-R-compatibility_mismatch"
            for row in result["findings"]
        ))

    def test_C3_opposing_records_keep_the_existing_mismatch_finding(self):
        bilateral_input, _trace_input = _identity_fixture_api()
        raw = bilateral_input("opposing")
        result = self._assert_case_result("C3-TWO-INDEPENDENT-BILATERAL-OPPOSING-SOURCES-WHOLE", raw)
        findings = [row for row in result["findings"] if row["code"] == "compatibility_mismatch"]
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0]["rule_ref"], "HELIXBRAIN-L5-032-R-compatibility_mismatch")
        rows = [row for row in result["axes"] if row["axis"] == COMPAT_AXIS]
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["state"], "conflict")
        prefix, separator, diagnostic_json = rows[0]["reason"].partition("\n")
        self.assertTrue(separator)
        material = json.loads(diagnostic_json)
        self.assertEqual(material["record_indices"], [0, 1])
        self.assertEqual(material["record_states"], ["resolved", "conflict"])
        self.assertEqual(material["original_record_reasons"],
                         [record["reason"] for record in raw["compatibility_records"]])
        for record in raw["compatibility_records"]:
            self.assertIn(record["ref"], rows[0]["original_refs"])
            self.assertIn(record["source_ref"], rows[0]["original_refs"])

    def _assert_fn3_stops_with_case_id(self, case_id, raw):
        validated, raw_before = self._validate(raw)
        with self.assertRaises(NotImplementedError) as caught:
            compare_identity_versions_and_trace({"validated": validated})
        self.assertIn(case_id, str(caught.exception))
        self.assertIn("F04/N01", str(caught.exception))
        self.assertIn(FN3_BACKFLOW, str(caught.exception))
        self.assertEqual(raw, raw_before)

    def test_F04_NEG_02_R59_projects_absent_and_null_revision(self):
        # L4 R59は公開template.versionの原行をmissingへ投影し、同じ原subject/Binding
        # にFindingを1件対応させる。内部cause/stateはこの公開結果から推定しない。
        # 配置更新はroot comment 6421804448 の限定適用で、whole期待は複製しない。
        for case_id, missing in (("revision_absent", "absent"), ("revision_null", "null")):
            with self.subTest(case_id=case_id):
                raw = self._normal_raw()
                template_ref = raw["binding"]["template_ref"]
                if missing == "absent":
                    template_ref.pop("revision")
                else:
                    template_ref["revision"] = None
                raw_before = copy.deepcopy(raw)
                validated, _ = self._validate(raw)
                validated_before = copy.deepcopy(validated)
                result = compare_identity_versions_and_trace({"validated": validated})
                self.assertEqual(raw, raw_before)
                self.assertEqual(validated, validated_before)
                self._assert_comparison(result, raw_before["binding"])

                version_rows = [row for row in result["axes"] if row["axis"] == "template.version"]
                self.assertEqual(len(version_rows), 1)
                self.assertEqual(version_rows[0]["state"], "missing")
                self.assertEqual(version_rows[0]["subject_ref"], raw_before["binding"]["template_ref"])
                self.assertEqual(version_rows[0]["binding"], raw_before["binding"])
                findings = [row for row in result["findings"] if row["code"] == "version_missing"]
                self.assertEqual(len(findings), 1)
                finding = findings[0]
                self.assertEqual(finding["rule_ref"], "HELIXBRAIN-L5-032-R-version_missing")
                self.assertEqual(finding["axis"], "template.version")
                self.assertEqual(finding["state"], "missing")
                self.assertEqual(finding["backflow_owner"], "knowledge_owner")
                self.assertEqual(finding["subject_ref"], raw_before["binding"]["template_ref"])
                self.assertEqual(finding["binding"], raw_before["binding"])
                self.assertEqual(finding["source_refs"], [])

    def test_nonempty_dependency_branch_is_unclosed(self):
        for occurrence_count in (1, 2):
            with self.subTest(case_id=f"unclosed/nonempty_dependency/{occurrence_count}"):
                raw = self._normal_raw()
                raw["binding"]["pack_dependency_versions"] = [
                    copy.deepcopy(raw["binding"]["pack_ref"])
                    for _ in range(occurrence_count)
                ]
                self.assertEqual(len(raw["binding"]["pack_dependency_versions"]), occurrence_count)
                self._assert_fn3_stops_with_case_id(
                    f"unclosed/nonempty_dependency/{occurrence_count}", raw
                )

    def test_multiple_finding_range_sources_are_unclosed(self):
        bilateral_input, _trace_input = _identity_fixture_api()
        raw = bilateral_input("positive")
        record = raw["compatibility_records"][0]
        right_source = next(source for source in raw["sources"] if source["ref"] == record["source_ref"])
        # positiveにrange actual bodyは無いので、actual側停止ではこのassertを満たせない。
        qualifications_before = copy.deepcopy(raw["qualifications"])
        roots_before = copy.deepcopy(raw["qualification_roots"])
        # 同じRef/whole sourceの物理原出現だけを重ねる。record/Q/rootは増やさない。
        raw["sources"].append(copy.deepcopy(right_source))
        matches = [i for i, source in enumerate(raw["sources"]) if source["ref"] == record["source_ref"]]
        self.assertEqual(len(matches), 2)
        self.assertEqual(raw["sources"][matches[0]], raw["sources"][matches[1]])
        self.assertEqual(raw["qualifications"], qualifications_before)
        self.assertEqual(raw["qualification_roots"], roots_before)
        self.assertEqual(len(raw["compatibility_records"]), 1)
        self._assert_fn3_stops_with_case_id("unclosed/multiple_finding_range_sources/right", raw)

    def test_null_compatibility_decision_keeps_unknown_axis_without_new_finding(self):
        # R3-M1: compatible_nullは既存L4の単一read reasonへ射影し、停止にしない。
        bilateral_input, _trace_input = _identity_fixture_api()
        raw = bilateral_input("positive")
        raw["compatibility_records"][0]["compatible"] = None
        result = self._assert_case_result("compatible_null", raw)
        rows = [row for row in result["axes"] if row["axis"] == "compatibility"]
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["state"], "unknown")
        prefix, separator, encoded = rows[0]["reason"].partition("\n")
        self.assertEqual((prefix, separator), ("compatible_null", "\n"))
        material = json.loads(encoded)
        self.assertEqual(material["cause"], "compatible_null")
        self.assertEqual(material["state"], "unknown")
        self.assertEqual(material["request"], {"record_locator": "/compatibility_records/0"})
        self.assertFalse(any(row["code"] in {"compatibility_unknown", "compatibility_mismatch"}
                             for row in result["findings"]))


    def test_different_pair_reads_are_not_combined_into_one_aggregate(self):
        bilateral_input, _trace_input = _identity_fixture_api()
        raw = bilateral_input("opposing")
        raw["compatibility_records"][0]["right_ref"]["identity"] = "unrelated-pack"
        result = self._assert_case_result("different-pair", raw)
        rows = [row for row in result["axes"] if row["axis"] == "compatibility"]
        self.assertEqual([row["state"] for row in rows], ["unknown", "conflict"])
        materials = [json.loads(row["reason"].partition("\n")[2]) for row in rows]
        self.assertEqual(materials[0]["request"], {"record_locator": "/compatibility_records/0"})
        self.assertEqual(materials[1]["record_indices"], [1])
        self.assertTrue(all("cause_occurrences" not in material for material in materials))

if __name__ == "__main__":
    unittest.main()
