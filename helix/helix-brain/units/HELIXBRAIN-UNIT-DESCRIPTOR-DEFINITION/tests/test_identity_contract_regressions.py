"""fn3契約の回帰境界をL4/L5から独立に確認する。

期待根拠: L4 /identity_version_trace_contract/public_projection/axis_reason_writer
（actual_roles, refs_order, reason_serialization, general_occurrence_cause_witness）と
read_branch_contracts/bilateral、L5 /functions/3/algorithm。全ComparisonやL8 whole
は複製せず、原出現順、局所state/cause、既存predicateだけを部分観測する。
"""

from __future__ import annotations

import copy
import json
import unittest

from descriptor_definitions import compare_identity_versions_and_trace, validate_supply_input
from identity_input_fixtures import (
    _write_source_content,
    bilateral_input,
    normal_input,
    trace_input,
)


FN3_BACKFLOW = "HELIXBRAIN-L6-032-FN3-IDENTITY"
ACTUAL_AXIS_ORDER = [
    "template.identity",
    "knowledge.identity",
    "requirement.identity",
    "oracle.identity",
    "pack.identity",
    "template.version",
    "knowledge.revision",
    "pack.revision",
    "pack.contract_version",
    "pack.artifact_version",
    "knowledge.operational_state",
]


class TestIdentityContractRegressions(unittest.TestCase):
    def _call(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"], "fn0 decoding contract preserves this valid original input")
        self.assertEqual(validated["input"], raw_before, "fn0 preserves the supplied raw values")
        self.assertEqual(validated["input_issues"], [])
        validated_before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(validated, validated_before)
        self.assertEqual(raw, raw_before)
        self.assertEqual(result["producer_symbol"], "compare_identity_versions_and_trace")
        self.assertEqual(result["input_binding"], raw["binding"])
        return result

    def _material(self, row):
        prefix, separator, encoded = row["reason"].partition("\n")
        self.assertTrue(separator, "L4 reason is fixed prefix + diagnostic JSON")
        return prefix, json.loads(encoded)

    def _assert_unknown_or_fn3_stop(self, raw, case_id):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"], "fn0 decoding contract preserves the regression input")
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        try:
            result = compare_identity_versions_and_trace({"validated": validated})
        except NotImplementedError as exc:
            message = str(exc)
            self.assertIn("F04/N01/", message)
            self.assertIn(FN3_BACKFLOW, message)
        else:
            self.assertEqual(raw, raw_before)
            self.assertEqual(validated["input"], raw_before)
            self.assertFalse(any(
                row["axis"] == "compatibility" and row["state"] == "resolved"
                for row in result["axes"]
            ), case_id)
            self.assertFalse(any(
                row["code"] == "compatibility_mismatch"
                for row in result["findings"]
            ), case_id)
            self.assertTrue(any(
                row["axis"] == "compatibility" and row["state"] == "unknown"
                for row in result["axes"]
            ), case_id)

    def test_normal_actual_axis_order_and_operand_origins(self):
        raw = normal_input()
        result = self._call(raw)
        trace_rows = [row for row in result["axes"] if row["axis"] == "descriptor.trace"]
        self.assertTrue(trace_rows)
        self.assertTrue(all(row["backflow_owner"] is None for row in trace_rows))
        self.assertEqual([row["axis"] for row in result["axes"][:11]], ACTUAL_AXIS_ORDER)
        self.assertNotIn("pack.dependency_version", [row["axis"] for row in result["axes"]])

        template_revision = next(row for row in result["axes"] if row["axis"] == "template.version")
        prefix, material = self._material(template_revision)
        self.assertEqual(
            prefix,
            "原値は供給されているが独立した実owner本文のactual operandが未供給であり、当該照合はunknownに保持する。",
        )
        self.assertEqual(material["cause"], "actual_owner_body_unprovided")
        self.assertEqual(material["member_pointer"], "/binding/template_ref/revision")
        self.assertEqual(material["original_read"], {
            "presence": "supplied",
            "value": raw["binding"]["template_ref"]["revision"],
        })

        state_axis = next(row for row in result["axes"] if row["axis"] == "knowledge.operational_state")
        _prefix, state_material = self._material(state_axis)
        self.assertEqual(state_material["member_pointer"], "/knowledge_records/0/operational_state")
        self.assertEqual(state_material["original_read"], {
            "presence": "supplied",
            "value": raw["knowledge_records"][0]["operational_state"],
        })

    def test_outside_range_actual_pack_operands_come_from_range_declaration(self):
        raw = bilateral_input("outside")
        range_source_index = next(
            index for index, source in enumerate(raw["sources"])
            if isinstance(source.get("content"), dict)
            and "compatibility_range_declaration" in source["content"]
        )
        range_declaration = raw["sources"][range_source_index]["content"]["compatibility_range_declaration"]
        result = self._call(raw)
        axes = {row["axis"]: row for row in result["axes"]}
        for name in ("pack.identity", "pack.revision", "pack.contract_version", "pack.artifact_version"):
            self.assertEqual(axes[name]["state"], "resolved")

        artifact_prefix, artifact_material = self._material(axes["pack.artifact_version"])
        self.assertEqual(
            artifact_prefix,
            "原値とqualified実owner本文の明示actual operandが対応する。互換適合又は実利用許可を意味しない。",
        )
        self.assertEqual(
            artifact_material["member_pointer"],
            "/binding/pack_artifact_version",
        )
        self.assertEqual(artifact_material["original_read"], {
            "presence": "supplied",
            "value": raw["binding"]["pack_artifact_version"],
        })
        self.assertIn(
            f"/sources/{range_source_index}/content/compatibility_range_declaration/actual_artifact_version",
            artifact_material["actual_source_pointers"],
        )
        self.assertEqual(
            range_declaration["actual_artifact_version"],
            raw["binding"]["pack_artifact_version"],
        )

    def test_scope_missing_has_one_scope_finding_for_the_original_subject(self):
        scope_raw = normal_input()
        scope_raw["binding"]["template_ref"]["scope"] = None
        scope_result = self._call(scope_raw)
        scope_findings = [row for row in scope_result["findings"] if row["code"] == "scope_missing"]
        self.assertEqual(len(scope_findings), 1)
        scope = scope_findings[0]
        self.assertEqual(scope["rule_ref"], "HELIXBRAIN-L5-032-R-scope_missing")
        self.assertEqual(scope["axis"], "scope")
        self.assertEqual(scope["state"], "missing")
        self.assertEqual(scope["backflow_owner"], "knowledge_owner")
        self.assertEqual(scope["subject_ref"], scope_raw["binding"]["template_ref"])
        self.assertEqual(scope["binding"], scope_raw["binding"])
        self.assertFalse(any(row["axis"] in {"template.identity", "template.version"}
                             for row in scope_result["findings"]))

    def test_oracle_revision_findings_keep_predicate_subjects_and_occurrences(self):
        for duplicate in (False, True):
            with self.subTest(oracle_binding_duplicate=duplicate):
                raw = normal_input()
                oracle = raw["oracle_bindings"][0]
                oracle["oracle_ref"]["revision"] = "synthetic-other-revision"
                if duplicate:
                    raw["oracle_bindings"].append(copy.deepcopy(oracle))
                result = self._call(raw)
                findings = [row for row in result["findings"] if row["code"] == "oracle_revision_mismatch"]
                self.assertEqual(len(findings), 2 if duplicate else 1)
                self.assertTrue(all(
                    row["rule_ref"] == "HELIXBRAIN-L5-032-R-oracle_revision_mismatch"
                    and row["axis"] == "oracle.binding"
                    and row["state"] == "conflict"
                    and row["backflow_owner"] == "knowledge_owner"
                    and row["subject_ref"] == oracle["subject_ref"]
                    and row["binding"] == raw["binding"]
                    and oracle["source_ref"] in row["source_refs"]
                    for row in findings
                ))
                if duplicate:
                    self.assertTrue(any("/oracle_bindings/0" in row["reason"] for row in findings))
                    self.assertTrue(any("/oracle_bindings/1" in row["reason"] for row in findings))

    def test_trace_matches_ref_with_null_sha_and_different_locator_without_rewriting_it(self):
        raw = trace_input("positive")
        fact = raw["descriptors"][0]["facts"][0]
        fact["source_ref"]["sha256"] = None
        fact["source_ref"]["source_locator"] = "facts/local-observation.json"
        original_fact_source_ref = copy.deepcopy(fact["source_ref"])
        result = self._call(raw)
        trace = next(row for row in result["axes"] if row["axis"] == "descriptor.trace")
        self.assertEqual(trace["state"], "resolved")
        self.assertIsNone(trace["backflow_owner"])
        prefix, material = self._material(trace)
        self.assertEqual(prefix, "原slot/fact/source/provenance/資格frameの対応を保持する。意味完成又は利用許可ではない。")
        self.assertEqual(material["knowledge_record_index"], 0)
        self.assertEqual(material["qualification_index"], 0)
        record = raw["knowledge_records"][0]
        provenance = record["provenance_refs"][0]
        source = next(row for row in raw["sources"] if row["ref"] == provenance)
        qualification = next(row for row in raw["qualifications"] if row["ref"] == source["qualification_ref"])
        root = next(row for row in raw["qualification_roots"] if row == qualification["root_ref"])
        expected_refs = [
            fact["ref"], original_fact_source_ref, raw["descriptors"][0]["binding"]["knowledge_ref"],
            record["ref"], provenance, source["ref"], source["qualification_ref"], qualification["ref"], root,
        ]
        self.assertEqual(trace["original_refs"], expected_refs)
        self.assertIsNone(trace["original_refs"][1]["sha256"])
        self.assertEqual(trace["original_refs"][1]["source_locator"], "facts/local-observation.json")

    def test_three_equal_knowledge_records_keep_all_trace_chains_in_original_order(self):
        raw = trace_input("equal_records")
        raw["knowledge_records"].append(copy.deepcopy(raw["knowledge_records"][0]))
        self.assertEqual(raw["knowledge_records"][0], raw["knowledge_records"][1])
        self.assertEqual(raw["knowledge_records"][1], raw["knowledge_records"][2])
        result = self._call(raw)
        trace = next(row for row in result["axes"] if row["axis"] == "descriptor.trace")
        self.assertEqual(trace["state"], "resolved")
        slot, fact = raw["descriptors"][0], raw["descriptors"][0]["facts"][0]
        record = raw["knowledge_records"][0]
        provenance = record["provenance_refs"][0]
        source = next(row for row in raw["sources"] if row["ref"] == provenance)
        qualification = next(row for row in raw["qualifications"] if row["ref"] == source["qualification_ref"])
        root = next(row for row in raw["qualification_roots"] if row == qualification["root_ref"])
        suffix = [record["ref"], provenance, source["ref"], source["qualification_ref"], qualification["ref"], root]
        self.assertEqual(
            trace["original_refs"],
            [fact["ref"], fact["source_ref"], slot["binding"]["knowledge_ref"]] + suffix * 3,
        )
        self.assertEqual(len(trace["original_refs"]), 21)
        _prefix, material = self._material(trace)
        self.assertEqual(
            [row["knowledge_record_index"] for row in material["trace_occurrences"]],
            [0, 1, 2],
        )
        self.assertFalse(any(row["axis"] == "descriptor.trace" for row in result["findings"]))

    def test_source_without_matching_descriptor_fact_body_does_not_resolve_trace(self):
        raw = trace_input("positive")
        source = raw["sources"][0]
        old_ref = copy.deepcopy(source["ref"])
        content = copy.deepcopy(source["content"])
        self.assertIn("descriptor_facts", content)
        content["descriptor_facts"] = []
        _write_source_content(raw, source, content)
        new_ref = copy.deepcopy(source["ref"])
        for slot in raw["descriptors"]:
            for fact in slot.get("facts", []):
                if fact.get("source_ref") == old_ref:
                    fact["source_ref"] = copy.deepcopy(new_ref)
        record = raw["knowledge_records"][0]
        record["provenance_refs"] = [
            copy.deepcopy(new_ref) if ref == old_ref else ref
            for ref in record["provenance_refs"]
        ]
        try:
            result = self._call(raw)
        except NotImplementedError as exc:
            self.assertTrue("F04" in str(exc) or "N01" in str(exc))
            self.assertIn(FN3_BACKFLOW, str(exc))
        else:
            trace = next(row for row in result["axes"] if row["axis"] == "descriptor.trace")
            self.assertEqual(trace["state"], "unknown")
            _prefix, material = self._material(trace)
            self.assertIn(material.get("cause"), {"body_unresolved", "source_unresolved", "qualification_unresolved"})

    def test_left_endpoint_ref_mismatch_cannot_make_bilateral_owner_success(self):
        raw = bilateral_input("positive")
        record = raw["compatibility_records"][0]
        left = next(
            source for source in raw["sources"]
            if isinstance(source.get("content"), dict)
            and source["content"].get("compatibility_record_ref") == record["ref"]
        )
        body = copy.deepcopy(left["content"])
        body["endpoint_owner_declaration"]["endpoint_ref"] = copy.deepcopy(record["right_ref"])
        self.assertEqual(body["compatible_refs"], [record["left_ref"], record["right_ref"]])
        _write_source_content(raw, left, body)
        self._assert_unknown_or_fn3_stop(raw, "C3/left_endpoint_ref_mismatch")

    def test_right_boolean_outside_without_range_declaration_cannot_make_R62(self):
        raw = bilateral_input("outside")
        record = raw["compatibility_records"][0]
        right = next(source for source in raw["sources"] if source["ref"] == record["source_ref"])
        left = next(
            source for source in raw["sources"]
            if isinstance(source.get("content"), dict)
            and source["content"].get("compatibility_record_ref") == record["ref"]
        )
        right_content = copy.deepcopy(right["content"])
        right_content.pop("compatibility_range_declaration")
        _write_source_content(raw, right, right_content)
        record["source_ref"] = copy.deepcopy(right["ref"])
        left_content = copy.deepcopy(left["content"])
        left_content["counterpart_source_ref"] = copy.deepcopy(right["ref"])
        _write_source_content(raw, left, left_content)
        self._assert_unknown_or_fn3_stop(raw, "C3/right_outside_boolean_without_range")

    def test_semantic_json_basis_claim_is_not_treated_as_image_only_identity(self):
        raw = normal_input()
        fact = raw["descriptors"][0]["facts"][0]
        raw["claims"].append({
            "subject_ref": copy.deepcopy(fact["ref"]),
            "binding": copy.deepcopy(raw["descriptors"][0]["binding"]),
            "actor": None,
            "kind": "template_identity",
            "proposed_value": {"basis_role": "semantic_json"},
            "basis_refs": [copy.deepcopy(raw["sources"][0]["ref"])],
        })
        result = self._call(raw)
        self.assertFalse(any(row["code"] == "image_identity_inference" for row in result["findings"]))
        template_identity = next(row for row in result["axes"] if row["axis"] == "template.identity")
        self.assertEqual(template_identity["state"], "unknown")
        prefix, material = self._material(template_identity)
        self.assertEqual(prefix, "原値は供給されているが独立した実owner本文のactual operandが未供給であり、当該照合はunknownに保持する。")
        self.assertEqual(material["cause"], "actual_owner_body_unprovided")
        self.assertIn(raw["sources"][0]["ref"], raw["claims"][-1]["basis_refs"])

    def test_fn3_does_not_turn_missing_fn0_unusable_source_disposition_into_success(self):
        raw = bilateral_input("positive")
        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"])
        self.assertIn("unusable_source_refs", validated)
        invalid_validated = copy.deepcopy(validated)
        del invalid_validated["unusable_source_refs"]
        try:
            result = compare_identity_versions_and_trace({"validated": invalid_validated})
        except NotImplementedError as exc:
            self.assertTrue("F04" in str(exc) or "N01" in str(exc))
            self.assertIn(FN3_BACKFLOW, str(exc))
        else:
            self.assertFalse(any(
                row["axis"] in {"compatibility", "descriptor.trace"}
                and row["state"] == "resolved"
                for row in result["axes"]
            ))

    def test_known_mismatched_knowledge_hashes_do_not_join_through_null_binding_sha(self):
        raw = trace_input("positive")
        fact = raw["descriptors"][0]["facts"][0]
        slot = raw["descriptors"][0]
        raw["binding"]["knowledge_ref"]["sha256"] = None
        slot["binding"]["knowledge_ref"]["sha256"] = None
        fact["binding"]["knowledge_ref"]["sha256"] = "b" * 64
        raw["knowledge_records"][0]["ref"]["sha256"] = "a" * 64
        result = self._call(raw)
        trace = next(row for row in result["axes"] if row["axis"] == "descriptor.trace")
        self.assertNotEqual(trace["state"], "resolved")
        if trace["state"] == "unknown":
            _prefix, material = self._material(trace)
            self.assertNotEqual(material.get("cause"), "original_trace_corresponding")


if __name__ == "__main__":
    unittest.main()
