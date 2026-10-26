"""BRAIN032 F02の実unittest著述。

根拠: L3 /requirements/1、L10 /cases/1、L9 /cases/3/negative_cases/1、
L4 /descriptor_meanings、/definition_meaning_resolution_contract/evaluation_populations、
/dependency_semantic_ports/descriptor_target_contract、/dependency_semantic_ports/claim_intent_protocol/rules/4、
L5 /functions/1、/failure_rules/7..51、/source_return_contract/descriptor_target_dataflow/definition_meaning_core、
L8 NEG01/NEG02/NEG03..45 /cases/3/negative_cases、F05-NEG-01/02 /cases/6/negative_cases/{0,1}、/function_oracles/1。
部分oracleだけをassertし、全Comparisonや実資格の成立を創作しない。
同unit src/descriptor_definitions.pyの公開関数を使用する。本体/stubは含めない。
import/setup errorは意味的Redではない。入力不変だけを観測し、全外部IOの
不在まで証明するテストではない。製品/CI/OS登録や受入の証拠ではない。
"""

import copy
import hashlib
import json
import unittest

from descriptor_definitions import compare_descriptor_definitions, validate_supply_input
from supply_input_fixtures import base_input, load_document, load_materials

BASE_INPUT_SHA256 = "7a319d1a313738ace504a0d1dcc112a0fc25d2171e4a5490dcf544369a0bc452"
NEG02_INPUT_SHA256 = "718ef000f84e4511b5abda5961869b8b0ee943b56427ae1a357bbd7c915a7b3d"
CROSS_SECTION_CODE = "cross_pattern_section_substitution"
CROSS_CODE = "cross_pattern_field_substitution"
MISSING_CODE = "descriptor_07_missing"
SLOT_MISSING_REASON = "必要なdescriptor slotが当該原Bindingに供給されていない。"
CROSS_SECTION_REASON = "当該required sectionの定義不足を別Patternのrequired inputで補うことはできない。"
CROSS_FIELD_REASON = "当該required fieldの定義不足を別Patternのrequired inputで補うことはできない。"
REPLACEMENT_UNRESOLVED_REASON = "当該原targetの不足と置換根拠の原分類・template対応を解決できない。"

FIXED_15_KINDS = (
    "template identity",
    "version",
    "layer/pair",
    "applicability",
    "required input",
    "required section",
    "required field",
    "relation",
    "意味owner",
    "trace",
    "negative oracle",
    "measurement",
    "completion",
    "downstream kind",
    "supersession",
)


def ordered_digest(value):
    return hashlib.sha256(
        json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    ).hexdigest()


def _rebind_source_digest(source, qualification):
    content_bytes = json.dumps(source["content"], ensure_ascii=False, separators=(",", ":"))
    digest = hashlib.sha256(content_bytes.encode("utf-8")).hexdigest()
    source["content_bytes"] = content_bytes
    source["ref"]["sha256"] = digest
    qualification["subject_ref"]["sha256"] = digest
    qualification["subject_sha256"] = digest
    return digest


class TestDescriptorDefinitions(unittest.TestCase):
    def setUp(self):
        self.document = load_document()
        self.base = base_input(self.document)
        self.assertEqual(ordered_digest(self.base), BASE_INPUT_SHA256, "setup: base input revision")
        self.original_binding = copy.deepcopy(self.base["descriptors"][6]["binding"])

    def _slot_removed_input(self, slot_index=6):
        raw = copy.deepcopy(self.base)
        self.assertEqual(raw["descriptors"][slot_index]["descriptor_kind"], FIXED_15_KINDS[slot_index])
        del raw["descriptors"][slot_index]
        self.assertEqual(
            raw["descriptors"],
            self.base["descriptors"][:slot_index] + self.base["descriptors"][slot_index + 1:],
        )
        self.assertEqual(raw["required_descriptor_kinds"], self.base["required_descriptor_kinds"])
        return raw

    def _neg02_input(self):
        ops = load_materials()["case3_negative1_operations"]
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

    def _neg01_input(self):
        ops = load_materials()["case3_negative1_operations"]
        raw = self._slot_removed_input(slot_index=5)
        target_source = copy.deepcopy(ops[5]["value"])
        target_qual = copy.deepcopy(ops[6]["value"])
        target_prov = copy.deepcopy(ops[7]["value"])
        basis_source = copy.deepcopy(ops[8]["value"])
        basis_qual = copy.deepcopy(ops[9]["value"])
        claim = copy.deepcopy(ops[10]["value"])

        target_ref = copy.deepcopy(claim["subject_ref"])
        target_ref["identity"] = "SYNTHETIC-OWNER-SECTION-TARGET-A"
        target_source["ref"]["identity"] = "synthetic-section-target-source-A"
        target_qual["subject_ref"]["identity"] = "synthetic-section-target-source-A"
        target_qual["qualification_body"]["subject"] = "synthetic-section-target-source-A"
        target_source["content"]["descriptor_targets"] = [{
            "target_ref": copy.deepcopy(target_ref),
            "slot_identity": "synthetic-descriptor-6",
            "descriptor_kind": "required section",
        }]
        digest_a = _rebind_source_digest(target_source, target_qual)
        target_prov["identity"] = "synthetic-section-target-source-A"
        target_prov["sha256"] = digest_a

        claim["subject_ref"] = copy.deepcopy(target_ref)
        basis_source["content"]["replacement_basis_uses"][0]["claim"] = copy.deepcopy(claim)
        _rebind_source_digest(basis_source, basis_qual)

        raw["sources"].append(target_source)
        raw["qualifications"].append(target_qual)
        raw["knowledge_records"][0]["provenance_refs"].append(target_prov)
        raw["sources"].append(basis_source)
        raw["qualifications"].append(basis_qual)
        raw["claims"].append(claim)
        return raw

    def _f05_view_repair_input(self, slot_index, kind_name, target_identity):
        ops = load_materials()["case3_negative1_operations"]
        raw = self._slot_removed_input(slot_index=slot_index)
        target_source = copy.deepcopy(ops[5]["value"])
        target_qual = copy.deepcopy(ops[6]["value"])
        target_prov = copy.deepcopy(ops[7]["value"])
        view_source = copy.deepcopy(ops[8]["value"])
        view_qual = copy.deepcopy(ops[9]["value"])
        claim = copy.deepcopy(ops[10]["value"])

        target_ref = copy.deepcopy(claim["subject_ref"])
        target_ref["identity"] = target_identity
        target_source["ref"]["identity"] = f"synthetic-{kind_name}-target-source-A"
        target_qual["subject_ref"]["identity"] = f"synthetic-{kind_name}-target-source-A"
        target_qual["qualification_body"]["subject"] = f"synthetic-{kind_name}-target-source-A"
        target_source["content"]["descriptor_targets"] = [{
            "target_ref": copy.deepcopy(target_ref),
            "slot_identity": f"synthetic-descriptor-{slot_index + 1}",
            "descriptor_kind": kind_name,
        }]
        digest_a = _rebind_source_digest(target_source, target_qual)
        target_prov["identity"] = f"synthetic-{kind_name}-target-source-A"
        target_prov["sha256"] = digest_a

        view_source["role"] = "derived_view"
        view_source["ref"]["identity"] = f"synthetic-derived-view-{kind_name}"
        view_qual["subject_ref"]["identity"] = f"synthetic-derived-view-{kind_name}"
        view_qual["qualification_body"]["subject"] = f"synthetic-derived-view-{kind_name}"
        view_source["content"] = {
            "binding": copy.deepcopy(self.original_binding),
            "rendered_view": f"synthetic rendered view for {kind_name}",
        }
        _rebind_source_digest(view_source, view_qual)

        claim["subject_ref"] = copy.deepcopy(target_ref)
        claim["basis_refs"] = [{
            "identity": f"synthetic-derived-view-{kind_name}",
            "revision": "synthetic-rev-B",
            "scope": copy.deepcopy(self.original_binding["knowledge_ref"]["scope"]),
            "owner": "synthetic-knowledge-owner",
            "source_locator": None,
            "sha256": None,
        }]

        raw["sources"].append(target_source)
        raw["qualifications"].append(target_qual)
        raw["knowledge_records"][0]["provenance_refs"].append(target_prov)
        raw["sources"].append(view_source)
        raw["qualifications"].append(view_qual)
        raw["claims"].append(claim)
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

    def _assert_missing(self, result, code, subject=None, axis_name="required field.definition"):
        findings = [f for f in result["findings"] if f["code"] == code]
        self.assertTrue(findings, "semantic: intended defect must be diagnosed")
        matching = [f for f in findings if f["binding"] == self.original_binding
                    and (subject is None or f["subject_ref"] == subject)]
        self.assertTrue(matching, "semantic: original target/full Binding must be retained")
        for finding in matching:
            self.assertEqual(finding["axis"], axis_name)
            self.assertEqual(finding["state"], "missing")
            self.assertEqual(finding["backflow_owner"], "knowledge_owner")
            self.assertEqual(finding["rule_ref"], "HELIXBRAIN-L5-032-R-" + code)
        self.assertTrue(any(a["binding"] == self.original_binding
                            and a["axis"] == axis_name
                            and a["state"] == "missing"
                            and a["backflow_owner"] == "knowledge_owner"
                            for a in result["axes"]))

    def test_neg02_cross_pattern_field_substitution(self):
        raw = self._neg02_input()
        subject = copy.deepcopy(raw["claims"][-1]["subject_ref"])
        self.assertEqual(subject["identity"], "SYNTHETIC-OWNER-FIELD-TARGET-A")
        result = self._compare(raw, added_sources=raw["sources"][5:])
        self._assert_missing(result, CROSS_CODE, subject)
        self._assert_missing(result, MISSING_CODE, self.original_binding["knowledge_ref"])
        cross_findings = [f for f in result["findings"] if f["code"] == CROSS_CODE]
        self.assertEqual(len(cross_findings), 1)
        self.assertEqual(cross_findings[0]["reason"], CROSS_FIELD_REASON)
        expected_refs = [
            raw["claims"][-1]["basis_refs"][0],
            raw["sources"][5]["content"]["descriptor_targets"][0]["target_ref"],
            raw["sources"][5]["ref"],
            raw["sources"][6]["ref"],
            raw["sources"][6]["content"]["replacement_basis_uses"][0]["basis_ref"],
            raw["sources"][6]["content"]["replacement_basis_uses"][0]["fact"]["ref"],
            raw["sources"][6]["content"]["replacement_basis_uses"][0]["fact"]["source_ref"],
        ]
        self.assertEqual(cross_findings[0]["source_refs"], expected_refs)

    def test_neg01_cross_pattern_section_substitution(self):
        case_spec = self.document["cases"][3]["negative_cases"][0]
        self.assertEqual(case_spec["id"], "HELIXBRAIN-L8-032-F02-NEG-01")
        self.assertEqual(case_spec["rule_ref"], "HELIXBRAIN-L5-032-R-" + CROSS_SECTION_CODE)
        raw = self._neg01_input()
        subject = copy.deepcopy(raw["claims"][-1]["subject_ref"])
        self.assertEqual(subject["identity"], "SYNTHETIC-OWNER-SECTION-TARGET-A")
        result = self._compare(raw, added_sources=raw["sources"][5:])
        self._assert_missing(result, CROSS_SECTION_CODE, subject, axis_name="required section.definition")
        self._assert_missing(
            result, "descriptor_06_missing", self.original_binding["knowledge_ref"],
            axis_name="required section.definition",
        )
        cross_findings = [f for f in result["findings"] if f["code"] == CROSS_SECTION_CODE]
        self.assertEqual(len(cross_findings), 1)
        self.assertEqual(cross_findings[0]["reason"], CROSS_SECTION_REASON)

    def test_neg21_required_field_missing_without_substitution(self):
        mutation = self.document["cases"][3]["negative_cases"][20]["typed_mutation"]
        self.assertEqual(mutation, {"operation": "remove_slot", "target_descriptor_kind": "required field"})
        raw = self._slot_removed_input()
        self.assertEqual(raw["claims"], self.base["claims"])
        result = self._compare(raw)
        self._assert_missing(result, MISSING_CODE)
        self.assertNotIn(CROSS_CODE, [f["code"] for f in result["findings"]])

    def test_all_15_fixed_kinds_missing_slot_rules(self):
        for slot_index, kind_name in enumerate(FIXED_15_KINDS):
            code = f"descriptor_{slot_index + 1:02d}_missing"
            axis_name = f"{kind_name}.definition"
            case_index = 2 + slot_index * 3
            case_spec = self.document["cases"][3]["negative_cases"][case_index]
            self.assertEqual(case_spec["rule_ref"], f"HELIXBRAIN-L5-032-R-{code}")
            self.assertEqual(
                case_spec["typed_mutation"],
                {"operation": "remove_slot", "target_descriptor_kind": kind_name},
            )
            with self.subTest(kind=kind_name, code=code):
                raw = self._slot_removed_input(slot_index=slot_index)
                if kind_name == "relation":
                    raw["relations"] = []
                result = self._compare(raw)
                self.assertEqual([f["code"] for f in result["findings"]], [code])
                finding = result["findings"][0]
                self.assertEqual(finding, {
                    "code": code,
                    "rule_ref": f"HELIXBRAIN-L5-032-R-{code}",
                    "subject_ref": self.original_binding["knowledge_ref"],
                    "binding": self.original_binding,
                    "axis": axis_name,
                    "state": "missing",
                    "source_refs": [],
                    "reason": SLOT_MISSING_REASON,
                    "backflow_owner": "knowledge_owner",
                })
                missing_axes = [a for a in result["axes"] if a["state"] == "missing"]
                self.assertEqual(missing_axes, [{
                    "subject_ref": self.original_binding["knowledge_ref"],
                    "binding": self.original_binding,
                    "axis": axis_name,
                    "state": "missing",
                    "original_refs": [],
                    "reason": SLOT_MISSING_REASON,
                    "backflow_owner": "knowledge_owner",
                }])
                # 残り14 descriptorの3軸（definition/attribution/definition_applicability）が保全される。
                self.assertEqual(len(result["axes"]), 14 * 3 + 1)

    def test_f05_neg01_and_neg02_fn1_prerequisite_measurement_and_completion_missing(self):
        cases = (
            (0, 11, "measurement", "descriptor_12_missing", "SYNTHETIC-OWNER-MEASUREMENT-TARGET-A"),
            (1, 12, "completion", "descriptor_13_missing", "SYNTHETIC-OWNER-COMPLETION-TARGET-A"),
        )
        for f05_index, slot_index, kind_name, expected_code, target_id in cases:
            f05_case = self.document["cases"][6]["negative_cases"][f05_index]
            self.assertEqual(f05_case["typed_mutation"]["synthetic_value"], {
                "remove_kind": kind_name,
                "basis_role": "derived_view",
                "claim_kind": "fill_definition",
            })
            with self.subTest(kind=kind_name, code=expected_code):
                raw = self._f05_view_repair_input(slot_index, kind_name, target_id)
                result = self._compare(raw, added_sources=raw["sources"][5:])
                self.assertEqual([f["code"] for f in result["findings"]], [expected_code])
                self._assert_missing(
                    result, expected_code, self.original_binding["knowledge_ref"],
                    axis_name=f"{kind_name}.definition",
                )
                # fn4へ引き継ぐ3軸（negative oracle/measurement/completion）が揃い、fn1 specialは発火しない。
                carried_axes = [
                    a for a in result["axes"]
                    if a["axis"] in (
                        "negative oracle.definition",
                        "measurement.definition",
                        "completion.definition",
                    )
                ]
                self.assertEqual(len(carried_axes), 3)
                states_by_axis = {a["axis"]: a["state"] for a in carried_axes}
                self.assertEqual(states_by_axis["negative oracle.definition"], "unknown")
                self.assertEqual(states_by_axis[f"{kind_name}.definition"], "missing")

    def test_kind_surplus_reads_all_supplied_slots_without_synthesizing_required_kinds(self):
        # 余剰kind: required_descriptor_kindsが13種のみでも、供給された15 DescriptorSlotはall_slot_read_domainで読む。
        raw_surplus = copy.deepcopy(self.base)
        raw_surplus["required_descriptor_kinds"] = [
            k for k in self.base["required_descriptor_kinds"]
            if k not in ("required field", "measurement")
        ]
        result_surplus = self._compare(raw_surplus)
        self.assertEqual(result_surplus["findings"], [])
        self.assertEqual(len(result_surplus["axes"]), 45)
        self.assertTrue(any(
            a["axis"] == "required field.definition" and a["state"] == "unknown"
            for a in result_surplus["axes"]
        ))
        self.assertTrue(any(
            a["axis"] == "measurement.definition" and a["state"] == "unknown"
            for a in result_surplus["axes"]
        ))

        # required_descriptor_kindsに無いkindはslot未供給でもmissing集合へ合成しない。
        raw_subset_missing = copy.deepcopy(raw_surplus)
        raw_subset_missing["descriptors"] = [
            s for s in raw_subset_missing["descriptors"]
            if s["descriptor_kind"] not in ("required section", "required field")
        ]
        result_subset = self._compare(raw_subset_missing)
        self.assertEqual([f["code"] for f in result_subset["findings"]], ["descriptor_06_missing"])

    def test_replacement_claim_unresolved_basis_and_nonfiring_branches(self):
        # 明示empty basis_refs: constructors/3 第3枝 replacement_basis_unresolved unknown を形成し rule8 Finding は出さない。
        raw_empty_basis = self._neg02_input()
        raw_empty_basis["claims"][-1]["basis_refs"] = []
        result_empty = self._compare(raw_empty_basis, added_sources=raw_empty_basis["sources"][5:])
        self.assertEqual([f["code"] for f in result_empty["findings"]], [MISSING_CODE])
        unresolved_axes = [
            a for a in result_empty["axes"]
            if a["axis"] == "required field.definition"
            and a["subject_ref"] == raw_empty_basis["claims"][-1]["subject_ref"]
        ]
        self.assertEqual(len(unresolved_axes), 1)
        self.assertEqual(unresolved_axes[0]["state"], "unknown")
        self.assertEqual(unresolved_axes[0]["reason"], REPLACEMENT_UNRESOLVED_REASON)
        self.assertEqual(unresolved_axes[0]["backflow_owner"], "knowledge_owner")

        # 同一Pattern（template_ref.identity一致）の場合はconstructors/3 第4枝で追加special非発火。
        raw_same_pattern = self._neg02_input()
        basis_source = raw_same_pattern["sources"][6]
        basis_qual = raw_same_pattern["qualifications"][6]
        basis_source["content"]["binding"]["template_ref"]["identity"] = "SYNTHETIC-TEMPLATE-A"
        basis_source["content"]["replacement_basis_uses"][0]["basis_binding"]["template_ref"]["identity"] = "SYNTHETIC-TEMPLATE-A"
        basis_source["content"]["replacement_basis_uses"][0]["fact"]["binding"]["template_ref"]["identity"] = "SYNTHETIC-TEMPLATE-A"
        basis_source["content"]["descriptor_facts"][0]["facts"][0]["binding"]["template_ref"]["identity"] = "SYNTHETIC-TEMPLATE-A"
        _rebind_source_digest(basis_source, basis_qual)
        result_same = self._compare(raw_same_pattern, added_sources=raw_same_pattern["sources"][5:])
        self.assertEqual([f["code"] for f in result_same["findings"]], [MISSING_CODE])
        self.assertFalse(any(
            a["subject_ref"] == raw_same_pattern["claims"][-1]["subject_ref"]
            for a in result_same["axes"]
        ))

    def test_out_of_scope_branches_preserve_not_implemented_ids(self):
        raw_dup_req = copy.deepcopy(self.base)
        raw_dup_req["required_descriptor_kinds"].append("required field")
        validated_dup = validate_supply_input(raw_dup_req)
        with self.assertRaises(NotImplementedError) as caught_dup:
            compare_descriptor_definitions({"validated": validated_dup})
        self.assertIn("F02/required_kinds_outside_frozen_path", str(caught_dup.exception))

        raw_dup_slot = copy.deepcopy(self.base)
        extra_slot = copy.deepcopy(raw_dup_slot["descriptors"][6])
        extra_slot["slot_identity"] = "synthetic-descriptor-7-dup"
        raw_dup_slot["descriptors"].append(extra_slot)
        validated_slot = validate_supply_input(raw_dup_slot)
        with self.assertRaises(NotImplementedError) as caught_slot:
            compare_descriptor_definitions({"validated": validated_slot})
        self.assertIn("F02/descriptor_kind_duplicate_slot", str(caught_slot.exception))

        raw_no_rel = copy.deepcopy(self.base)
        raw_no_rel["relations"] = []
        validated_rel = validate_supply_input(raw_no_rel)
        with self.assertRaises(NotImplementedError) as caught_rel:
            compare_descriptor_definitions({"validated": validated_rel})
        self.assertIn("F01/related_relation_unresolved", str(caught_rel.exception))

        raw_f01_claim = copy.deepcopy(self.base)
        raw_f01_claim["claims"].append({
            "subject_ref": copy.deepcopy(raw_f01_claim["descriptors"][2]["facts"][0]["ref"]),
            "binding": copy.deepcopy(self.original_binding),
            "actor": None,
            "kind": "redefine_layer_pair",
            "proposed_value": "synthetic redefine layer pair",
            "basis_refs": [],
        })
        validated_claim = validate_supply_input(raw_f01_claim)
        with self.assertRaises(NotImplementedError) as caught_claim:
            compare_descriptor_definitions({"validated": validated_claim})
        self.assertIn("F01/descriptor_claim_unimplemented", str(caught_claim.exception))

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
