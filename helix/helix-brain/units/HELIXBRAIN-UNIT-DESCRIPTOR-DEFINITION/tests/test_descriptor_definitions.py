"""BRAIN032 F02の実unittest著述。未凍結・未実行。

根拠: L3 /requirements/1、L10 /cases/1、L9 /cases/3/negative_cases/1、
L8 NEG02/NEG21 /cases/3/negative_cases/{1,20}、/function_oracles/1。
部分oracleだけをassertし、全Comparisonや実資格の成立を創作しない。
同unit src/descriptor_definitions.pyの公開関数を使用する。本体/stubは含めない。
import/setup errorは意味的Redではない。入力不変だけを観測し、全外部IOの
不在まで証明するテストではない。製品/CI/OS登録や受入の証拠ではない。
"""

import copy
import hashlib
import json
from pathlib import Path
import unittest

from descriptor_definitions import compare_descriptor_definitions, validate_supply_input

# tests→unit→units→helix-brain→helix→repository。起動cwdへ依存しない。
REPOSITORY = Path(__file__).resolve().parents[5]
L8_PATH = REPOSITORY / "docs/helix-brain/L8-unit-verification/template-semantic-supply.json"
BASE_INPUT_SHA256 = "7a319d1a313738ace504a0d1dcc112a0fc25d2171e4a5490dcf544369a0bc452"
NEG02_INPUT_SHA256 = "718ef000f84e4511b5abda5961869b8b0ee943b56427ae1a357bbd7c915a7b3d"
CROSS_CODE = "cross_pattern_field_substitution"
MISSING_CODE = "descriptor_07_missing"


def ordered_digest(value):
    return hashlib.sha256(
        json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    ).hexdigest()


class TestDescriptorDefinitions(unittest.TestCase):
    def setUp(self):
        self.document = json.loads(L8_PATH.read_text(encoding="utf-8"))
        self.base = self.document["fixture_contract"]["normal_control"]["input"]
        self.assertEqual(ordered_digest(self.base), BASE_INPUT_SHA256, "setup: base input revision")
        self.original_binding = copy.deepcopy(self.base["descriptors"][6]["binding"])

    def _slot_removed_input(self):
        raw = copy.deepcopy(self.base)
        self.assertEqual(raw["descriptors"][6]["slot_identity"], "synthetic-descriptor-7")
        self.assertEqual(raw["descriptors"][6]["descriptor_kind"], "required field")
        raw["descriptors"].pop(6)
        self.assertEqual(raw["descriptors"], self.base["descriptors"][:6] + self.base["descriptors"][7:])
        self.assertEqual(raw["required_descriptor_kinds"], self.base["required_descriptor_kinds"])
        return raw

    def _neg02_input(self):
        ops = self.document["cases"][3]["negative_cases"][1]["fixture_construction"]["operations"]
        # この11操作の構成だけを明示する。汎用path解決/patch engineは持たない。
        self.assertEqual([(o["op"], o["path"]) for o in ops], [
            ("test", "/descriptors/6/slot_identity"),
            ("test", "/descriptors/6/descriptor_kind"),
            ("test", "/descriptors/6/binding"),
            ("test", "/knowledge_records/0/ref"),
            ("remove", "/descriptors/6"),
            ("add", "/sources/-"),
            ("add", "/qualifications/-"),
            ("add", "/knowledge_records/0/provenance_refs/-"),
            ("add", "/sources/-"),
            ("add", "/qualifications/-"),
            ("add", "/claims/-"),
        ])
        self.assertEqual(self.base["descriptors"][6]["slot_identity"], ops[0]["value"])
        self.assertEqual(self.base["descriptors"][6]["descriptor_kind"], ops[1]["value"])
        self.assertEqual(self.original_binding, ops[2]["value"])
        self.assertEqual(self.base["knowledge_records"][0]["ref"], ops[3]["value"])
        raw = self._slot_removed_input()
        raw["sources"].append(copy.deepcopy(ops[5]["value"]))
        raw["qualifications"].append(copy.deepcopy(ops[6]["value"]))
        raw["knowledge_records"][0]["provenance_refs"].append(copy.deepcopy(ops[7]["value"]))
        raw["sources"].append(copy.deepcopy(ops[8]["value"]))
        raw["qualifications"].append(copy.deepcopy(ops[9]["value"]))
        raw["claims"].append(copy.deepcopy(ops[10]["value"]))
        self.assertEqual(raw["sources"][:5], self.base["sources"])
        self.assertEqual(raw["qualifications"][:5], self.base["qualifications"])
        self.assertEqual(ordered_digest(raw), NEG02_INPUT_SHA256, "setup: concrete NEG02 input")
        return raw

    def _compare(self, raw, added_sources=()):
        before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        # 準備条件。ここでの失敗はrule8の実装前semantic Redには数えない。
        self.assertIsNotNone(validated["input"], "setup: raw input must decode")
        for source in added_sources:
            self.assertNotIn(source["ref"], validated["unusable_source_refs"], "setup: added source qualification")
        validated_before = copy.deepcopy(validated)
        result = compare_descriptor_definitions({"validated": validated})
        self.assertEqual(validated, validated_before, "DefinitionContext input is unchanged")
        self.assertEqual(raw, before, "raw input is unchanged by validator/comparison")
        self.assertEqual(result["producer_symbol"], "compare_descriptor_definitions")
        return result

    def _assert_missing(self, result, code, subject=None):
        findings = [f for f in result["findings"] if f["code"] == code]
        self.assertTrue(findings, "semantic: intended defect must be diagnosed")
        matching = [f for f in findings if f["binding"] == self.original_binding
                    and (subject is None or f["subject_ref"] == subject)]
        self.assertTrue(matching, "semantic: original target/full Binding must be retained")
        for finding in matching:
            self.assertEqual(finding["axis"], "required field.definition")
            self.assertEqual(finding["state"], "missing")
            self.assertEqual(finding["backflow_owner"], "knowledge_owner")
            self.assertEqual(finding["rule_ref"], "HELIXBRAIN-L5-032-R-" + code)
        self.assertTrue(any(a["binding"] == self.original_binding
                            and a["axis"] == "required field.definition"
                            and a["state"] == "missing"
                            and a["backflow_owner"] == "knowledge_owner"
                            for a in result["axes"]))

    def test_neg02_cross_pattern_field_substitution(self):
        raw = self._neg02_input()
        subject = copy.deepcopy(raw["claims"][-1]["subject_ref"])
        self.assertEqual(subject["identity"], "SYNTHETIC-OWNER-FIELD-TARGET-A")
        result = self._compare(raw, added_sources=raw["sources"][5:])
        self._assert_missing(result, CROSS_CODE, subject)

    def test_neg21_required_field_missing_without_substitution(self):
        mutation = self.document["cases"][3]["negative_cases"][20]["typed_mutation"]
        self.assertEqual(mutation, {"operation": "remove_slot", "target_descriptor_kind": "required field"})
        raw = self._slot_removed_input()
        self.assertEqual(raw["claims"], self.base["claims"])
        result = self._compare(raw)
        self._assert_missing(result, MISSING_CODE)
        self.assertNotIn(CROSS_CODE, [f["code"] for f in result["findings"]])

    def test_base_control_preserves_unknown_without_substitution(self):
        result = self._compare(copy.deepcopy(self.base))
        codes = [f["code"] for f in result["findings"]]
        self.assertNotIn(CROSS_CODE, codes)
        self.assertNotIn(MISSING_CODE, codes)
        # 元fixtureの未解決source/意味を全体knownへ修復しない部分対照。
        self.assertTrue(any(a["binding"] == self.original_binding
                            and a["axis"] == "required field.definition"
                            and a["state"] == "unknown"
                            for a in result["axes"]))


if __name__ == "__main__":
    unittest.main()
