"""非compat既存Findingと公開actual診断の原観測を保存する。"""

import copy
import json
import unittest

import descriptor_definitions as product
from identity_input_fixtures import bilateral_input, normal_input, trace_input


class TestIdentityWitnessReads(unittest.TestCase):
    def test_existing_findings_use_typed_original_predicate_observations(self):
        scope = normal_input()
        scope["binding"]["template_ref"]["scope"] = None
        missing = normal_input()
        source = missing["sources"].pop(0)
        missing["qualifications"] = [
            q
            for q in missing["qualifications"]
            if q["ref"] != source["qualification_ref"]
        ]
        mixed = trace_input("positive")
        mixed["descriptors"][0]["facts"][0]["binding"]["knowledge_ref"]["revision"] = (
            "synthetic-next-revision"
        )
        for raw, code in (
            (scope, "scope_missing"),
            (missing, "source_missing"),
            (mixed, "mixed_knowledge_revision"),
            (mixed, "silent_supersession"),
        ):
            with self.subTest(code=code):
                before = copy.deepcopy(raw)
                validated = product.validate_supply_input(raw)
                self.assertEqual(validated["input"], before)
                self.assertEqual(validated["input_issues"], [])
                result = product.compare_identity_versions_and_trace(
                    {"validated": validated}
                )
                finding = next(row for row in result["findings"] if row["code"] == code)
                _, separator, encoded = finding["reason"].partition("\n")
                self.assertTrue(separator)
                material = json.loads(encoded)
                self.assertEqual(
                    set(material), {"code", "rule_ref", "predicate_observations"}
                )
                self.assertEqual(material["code"], code)
                self.assertEqual(material["rule_ref"], finding["rule_ref"])
                self.assertTrue(material["predicate_observations"])
                for observation in material["predicate_observations"]:
                    self.assertEqual(set(observation), {"locator", "original_read"})
                    node = raw
                    supplied = True
                    for token in observation["locator"].split("/")[1:]:
                        token = token.replace("~1", "/").replace("~0", "~")
                        if isinstance(node, dict) and token in node:
                            node = node[token]
                        elif (
                            isinstance(node, list)
                            and token.isdigit()
                            and int(token) < len(node)
                        ):
                            node = node[int(token)]
                        else:
                            supplied = False
                            break
                    expected = (
                        {"presence": "supplied", "value": node}
                        if supplied
                        else {"presence": "absent"}
                    )
                    self.assertEqual(observation["original_read"], expected)
                self.assertEqual(raw, before)
                self.assertEqual(validated["input"], before)

    def test_actual_source_pointers_identify_the_original_artifact_operand(self):
        raw = bilateral_input("outside")
        before = copy.deepcopy(raw)
        record = raw["compatibility_records"][0]
        source_index = next(
            i
            for i, source in enumerate(raw["sources"])
            if source["ref"] == record["source_ref"]
        )
        pointer = f"/sources/{source_index}/content/compatibility_range_declaration/actual_artifact_version"
        self.assertIsInstance(
            raw["sources"][source_index]["content"]["compatibility_range_declaration"][
                "actual_artifact_version"
            ],
            str,
        )
        validated = product.validate_supply_input(raw)
        self.assertEqual(validated["input"], before)
        self.assertEqual(validated["input_issues"], [])
        result = product.compare_identity_versions_and_trace({"validated": validated})
        artifact_axis = next(
            row for row in result["axes"] if row["axis"] == "pack.artifact_version"
        )
        material = json.loads(artifact_axis["reason"].partition("\n")[2])
        self.assertEqual(material["actual_source_pointers"], [pointer])
        self.assertEqual(raw, before)
        self.assertEqual(validated["input"], before)


if __name__ == "__main__":
    unittest.main()
