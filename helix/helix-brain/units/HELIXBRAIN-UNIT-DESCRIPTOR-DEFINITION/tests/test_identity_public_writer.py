"""L4 axis_reason_writerの順序と局所witnessを独立に観測する。"""

import copy
import json
import unittest

from descriptor_definitions import compare_identity_versions_and_trace, validate_supply_input
from identity_input_fixtures import bilateral_input, normal_input


class TestIdentityPublicWriter(unittest.TestCase):
    def _call(self, raw):
        before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input"], before)
        self.assertEqual(validated["input_issues"], [])
        validated_before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(validated, validated_before)
        self.assertEqual(raw, before)
        return result

    def _material(self, row):
        prefix, separator, encoded = row["reason"].partition("\n")
        self.assertTrue(separator, "固定prefixとdiagnostic JSONを区別する")
        return prefix, json.loads(encoded)

    def test_findings_follow_rule_order_across_reader_domains(self):
        raw = bilateral_input("outside")
        raw["oracle_bindings"][0]["oracle_ref"]["revision"] = "synthetic-other-revision"
        result = self._call(raw)
        relevant = [r["code"] for r in result["findings"]
                    if r["code"] in {"compatibility_mismatch", "oracle_revision_mismatch"}]
        self.assertEqual(relevant, ["compatibility_mismatch", "oracle_revision_mismatch"])

    def test_oracle_witness_retains_original_nodes_and_predicate(self):
        raw = normal_input()
        raw["oracle_bindings"][0]["oracle_ref"]["revision"] = "synthetic-other-revision"
        result = self._call(raw)
        finding = next(r for r in result["findings"] if r["code"] == "oracle_revision_mismatch")
        prefix, material = self._material(finding)
        self.assertEqual(prefix, "同subject/要求scopeへ束縛されたoracleの版が当該bindingのoracle版と異なる。")
        self.assertEqual(set(material), {"code", "rule_ref", "predicate_observations"})
        self.assertEqual(material["code"], finding["code"])
        self.assertEqual(material["rule_ref"], finding["rule_ref"])
        observations = material["predicate_observations"]
        self.assertTrue(observations)
        found = {}
        for observation in observations:
            self.assertEqual(set(observation), {"locator", "original_read"})
            node = raw
            for token in observation["locator"].split("/")[1:]:
                token = token.replace("~1", "/").replace("~0", "~")
                node = node[int(token)] if isinstance(node, list) else node[token]
            self.assertEqual(observation["original_read"], {"presence": "supplied", "value": node})
            found[observation["locator"]] = node
        self.assertTrue(any(
            path == "/oracle_bindings/0" or path.startswith("/oracle_bindings/0/")
            for path in found
        ))
        self.assertTrue(any("binding" in path for path in found))

    def test_compatibility_findings_keep_fixed_local_diagnostic_members(self):
        for mode, code in (("outside", "compatibility_mismatch"),
                           ("source_null", "compatibility_unknown")):
            with self.subTest(mode=mode):
                raw = bilateral_input(mode)
                result = self._call(raw)
                finding = next(r for r in result["findings"] if r["code"] == code)
                _, material = self._material(finding)
                self.assertEqual(set(material), {
                    "bilateral_read_index", "left_owner_source_indices", "original_record_reason",
                    "range_relation", "record_compatible", "record_index", "right_owner_source_indices",
                    "source_ref", "source_scope", "target_scope",
                })
                record = raw["compatibility_records"][0]
                self.assertEqual(material["bilateral_read_index"], 0)
                self.assertEqual(material["record_index"], 0)
                self.assertEqual(material["original_record_reason"], record["reason"])
                self.assertEqual(material["record_compatible"], record["compatible"])
                self.assertEqual(material["source_ref"], record["source_ref"])
                self.assertEqual(material["target_scope"], raw["binding"]["template_ref"]["scope"])
                if mode == "source_null":
                    self.assertIsNone(material["source_scope"])
                    self.assertEqual(material["left_owner_source_indices"], [])
                    self.assertEqual(material["right_owner_source_indices"], [])
                    self.assertEqual(material["range_relation"], "not_supplied")
                else:
                    self.assertEqual(material["range_relation"], "outside")
                    self.assertEqual(len(material["left_owner_source_indices"]), 1)
                    self.assertEqual(len(material["right_owner_source_indices"]), 1)
                    right_index = material["right_owner_source_indices"][0]
                    self.assertEqual(raw["sources"][right_index]["ref"], record["source_ref"])

    def test_operational_state_refs_use_original_provenance_without_extra_record_ref(self):
        raw = normal_input()
        result = self._call(raw)
        axis = next(r for r in result["axes"] if r["axis"] == "knowledge.operational_state")
        self.assertEqual(axis["original_refs"], [
            raw["binding"]["knowledge_ref"], *raw["knowledge_records"][0]["provenance_refs"],
        ])


if __name__ == "__main__":
    unittest.main()
