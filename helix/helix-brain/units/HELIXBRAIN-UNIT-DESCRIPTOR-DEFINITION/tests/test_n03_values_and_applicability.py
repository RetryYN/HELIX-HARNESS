"""N03 の fn0→fn1→fn2 経路に対する局所test候補。

期待の根拠はL5 /functions/{0,1,2}、/failure_rules/102..104、
/field_value_applicability_detail/claim_protocol と、L8
/function_oracles/{0,1,2}、/cases/13/negative_cases/{0,1,2}、
/additional_unit_cases/36。normal oracleは部分期待だけをassertし、
全Comparisonを固定しない。製品資格・実行時の値・単位変換を主張しない。
"""

import copy
import unittest

from descriptor_definitions import (
    compare_descriptor_definitions,
    compare_values_and_applicability,
    validate_supply_input,
)
from supply_input_fixtures import base_input, load_document


N03_CASES = (
    {
        "case_id": "HELIXBRAIN-L8-032-N03-NEG-01",
        "value_ref_identity": "SYNTHETIC-N03-TIMEOUT-VALUE",
        "subject_ref_identity": "SYNTHETIC-N03-TIMEOUT-TARGET",
        "kind": "operation_deadline",
        "intended_value": "90 seconds",
        "rule_ref": "HELIXBRAIN-L5-032-R-fixture_timeout_default",
        "code": "fixture_timeout_default",
        "axis": "operation_value",
        "state": "unknown",
        "backflow_owner": "core_owner",
    },
    {
        "case_id": "HELIXBRAIN-L8-032-N03-NEG-02",
        "value_ref_identity": "SYNTHETIC-N03-CPU-VALUE",
        "subject_ref_identity": "SYNTHETIC-N03-CPU-TARGET",
        "kind": "resource_capacity",
        "intended_value": "1 CPU",
        "rule_ref": "HELIXBRAIN-L5-032-R-fixture_cpu_default",
        "code": "fixture_cpu_default",
        "axis": "resource_value",
        "state": "unknown",
        "backflow_owner": "infrastructure_owner",
    },
    {
        "case_id": "HELIXBRAIN-L8-032-N03-NEG-03",
        "value_ref_identity": "SYNTHETIC-N03-MEMORY-VALUE",
        "subject_ref_identity": "SYNTHETIC-N03-MEMORY-TARGET",
        "kind": "resource_capacity",
        "intended_value": "256 MiB",
        "rule_ref": "HELIXBRAIN-L5-032-R-fixture_memory_default",
        "code": "fixture_memory_default",
        "axis": "resource_value",
        "state": "unknown",
        "backflow_owner": "infrastructure_owner",
    },
)


def _synthetic_ref_from(source_ref, identity):
    """原Refのrevision/scope/ownerを保った局所合成Ref。"""
    ref = copy.deepcopy(source_ref)
    ref["identity"] = identity
    return ref


def _n03_input(document, case):
    raw = base_input(document)
    original_value = raw["values"][0]
    value_fact = {
        "subject_ref": _synthetic_ref_from(original_value["subject_ref"], case["subject_ref_identity"]),
        "binding": copy.deepcopy(original_value["binding"]),
        "value": None,
        "source_ref": None,
        "reason": "対象operationの原根拠未供給",
        "origin": "absent",
        "applicability_ref": None,
        "ref": _synthetic_ref_from(original_value["ref"], case["value_ref_identity"]),
    }
    claim = {
        "subject_ref": copy.deepcopy(value_fact["subject_ref"]),
        "binding": copy.deepcopy(value_fact["binding"]),
        "actor": "BRAIN",
        "kind": case["kind"],
        "proposed_value": {
            "intended_value": case["intended_value"],
            "basis_origin": "reference_fixture",
        },
        "basis_refs": [],
    }
    # L8の values[timeout/cpu/memory] はfixture selectorでありJSON Pointerではない。
    # 新しいValueFactとClaimはこのtest内だけの合成入力で、既存原値を置き換えない。
    raw["values"].append(value_fact)
    raw["claims"].append(claim)
    return raw, value_fact, claim


class TestN03ValuesAndApplicability(unittest.TestCase):
    def setUp(self):
        self.document = load_document()

    def _run_same_snapshot_path(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], raw_before)
        validated_before = copy.deepcopy(validated)

        # fn1/fn2は同じvを使う。定義結果を別fixtureやcacheから注入しない。
        definitions = compare_descriptor_definitions({"validated": validated})
        self.assertEqual(definitions["producer_symbol"], "compare_descriptor_definitions")
        self.assertEqual(set(definitions), {"axes", "findings", "producer_symbol", "input_binding"})
        self.assertEqual(definitions["input_binding"], raw_before["binding"])
        definitions_before = copy.deepcopy(definitions)
        self.assertEqual(validated, validated_before)
        result = compare_values_and_applicability({
            "validated": validated,
            "definitions": definitions,
        })
        self.assertEqual(result["producer_symbol"], "compare_values_and_applicability")
        self.assertEqual(set(result), {"axes", "findings", "producer_symbol", "input_binding"})
        self.assertEqual(result["input_binding"], raw_before["binding"])
        self.assertEqual(definitions, definitions_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(raw, raw_before)
        return validated, definitions, result

    def test_normal_path_keeps_only_documented_unknowns(self):
        raw = base_input(self.document)
        raw_before = copy.deepcopy(raw)
        self.assertEqual(len(raw["descriptors"]), 15)
        self.assertEqual(raw["meaning_comparisons"], [])
        self.assertEqual(len(raw["section_fields"]), 1)
        self.assertEqual(raw["claims"], [])

        validated, definitions, result = self._run_same_snapshot_path(raw)
        self.assertEqual(validated["input"], raw_before)
        self.assertIsInstance(definitions["axes"], list)
        self.assertIsInstance(definitions["findings"], list)
        # 原normalの15 factはprovenance未解決。空Comparisonではこの観測を満たさない。
        for descriptor in raw_before["descriptors"]:
            for fact in descriptor["facts"]:
                with self.subTest(kind=descriptor["descriptor_kind"]):
                    observed = [row for row in definitions["axes"]
                                if row["subject_ref"] == fact["ref"]
                                and row["binding"] == fact["binding"]
                                and row["axis"] == descriptor["descriptor_kind"] + ".definition"]
                    self.assertTrue(observed)
                    self.assertTrue(all(row["state"] == "unknown" for row in observed))
                    attribution = [row for row in definitions["axes"]
                                   if row["subject_ref"] == fact["ref"]
                                   and row["binding"] == descriptor["binding"]
                                   and row["axis"] == "descriptor.attribution"]
                    self.assertTrue(attribution)
                    self.assertTrue(all(row["state"] == "known" for row in attribution))
            na_rows = [row for row in definitions["axes"]
                       if row["binding"] == descriptor["binding"]
                       and row["axis"] == descriptor["descriptor_kind"] + ".definition_applicability"]
            self.assertTrue(na_rows)
            self.assertTrue(all(row["state"] == "unknown" for row in na_rows))

        target = raw_before["values"][0]
        target_axes = [
            row for row in result["axes"]
            if row["subject_ref"] == target["subject_ref"]
            and row["binding"] == target["binding"]
        ]
        for axis_name in ("field.definition", "field.value", "applicability.evaluation"):
            with self.subTest(axis=axis_name):
                matching = [row for row in target_axes if row["axis"] == axis_name]
                self.assertTrue(matching)
                self.assertTrue(all(row["state"] == "unknown" for row in matching))

    def _assert_n03_case(self, case):
        raw, value_fact, claim = _n03_input(self.document, case)
        raw_before = copy.deepcopy(raw)
        validated, _, result = self._run_same_snapshot_path(raw)
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input"]["values"][-1], value_fact)
        self.assertEqual(validated["input"]["claims"][-1], claim)

        matching_findings = [
            finding for finding in result["findings"]
            if finding["rule_ref"] == case["rule_ref"]
        ]
        self.assertEqual(len(matching_findings), 1)
        finding = matching_findings[0]
        self.assertEqual(finding["code"], case["code"])
        self.assertEqual(finding["subject_ref"], claim["subject_ref"])
        self.assertEqual(finding["binding"], claim["binding"])
        self.assertEqual(finding["axis"], case["axis"])
        self.assertEqual(finding["state"], case["state"])
        self.assertEqual(finding["backflow_owner"], case["backflow_owner"])

        matching_axes = [
            axis for axis in result["axes"]
            if axis["subject_ref"] == claim["subject_ref"]
            and axis["binding"] == claim["binding"]
            and axis["axis"] == case["axis"]
        ]
        self.assertTrue(matching_axes)
        self.assertTrue(any(
            axis["state"] == case["state"]
            and axis["backflow_owner"] == case["backflow_owner"]
            for axis in matching_axes
        ))

    def test_n03_neg01_timeout_fixture_is_not_a_runtime_deadline(self):
        self._assert_n03_case(N03_CASES[0])

    def test_n03_neg02_cpu_fixture_is_not_a_runtime_capacity(self):
        self._assert_n03_case(N03_CASES[1])

    def test_n03_neg03_memory_fixture_is_not_a_runtime_capacity(self):
        self._assert_n03_case(N03_CASES[2])


if __name__ == "__main__":
    unittest.main()
