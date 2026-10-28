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
CROSS_SECTION_REASON = (
    "当該required sectionの定義不足を別Patternのrequired inputで補うことはできない。"
)
CROSS_FIELD_REASON = (
    "当該required fieldの定義不足を別Patternのrequired inputで補うことはできない。"
)
REPLACEMENT_UNRESOLVED_REASON = (
    "当該原targetの不足と置換根拠の原分類・template対応を解決できない。"
)

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
    content_bytes = json.dumps(
        source["content"], ensure_ascii=False, separators=(",", ":")
    )
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
        self.assertEqual(
            ordered_digest(self.base), BASE_INPUT_SHA256, "setup: base input revision"
        )
        self.original_binding = copy.deepcopy(self.base["descriptors"][6]["binding"])

    def _slot_removed_input(self, slot_index=6):
        raw = copy.deepcopy(self.base)
        self.assertEqual(
            raw["descriptors"][slot_index]["descriptor_kind"],
            FIXED_15_KINDS[slot_index],
        )
        del raw["descriptors"][slot_index]
        self.assertEqual(
            raw["descriptors"],
            self.base["descriptors"][:slot_index]
            + self.base["descriptors"][slot_index + 1 :],
        )
        self.assertEqual(
            raw["required_descriptor_kinds"], self.base["required_descriptor_kinds"]
        )
        return raw

    def _neg02_input(self):
        ops = load_materials()["case3_negative1_operations"]
        # この11操作の構成だけを明示する。汎用path解決/patch engineは持たない。
        self.assertEqual(
            [(o["op"], o["path"]) for o in ops],
            [
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
            ],
        )
        self.assertEqual(self.base["descriptors"][6]["slot_identity"], ops[0]["value"])
        self.assertEqual(
            self.base["descriptors"][6]["descriptor_kind"], ops[1]["value"]
        )
        self.assertEqual(self.original_binding, ops[2]["value"])
        self.assertEqual(self.base["knowledge_records"][0]["ref"], ops[3]["value"])
        raw = self._slot_removed_input()
        raw["sources"].append(copy.deepcopy(ops[5]["value"]))
        raw["qualifications"].append(copy.deepcopy(ops[6]["value"]))
        raw["knowledge_records"][0]["provenance_refs"].append(
            copy.deepcopy(ops[7]["value"])
        )
        raw["sources"].append(copy.deepcopy(ops[8]["value"]))
        raw["qualifications"].append(copy.deepcopy(ops[9]["value"]))
        raw["claims"].append(copy.deepcopy(ops[10]["value"]))
        self.assertEqual(raw["sources"][:5], self.base["sources"])
        self.assertEqual(raw["qualifications"][:5], self.base["qualifications"])
        self.assertEqual(
            ordered_digest(raw), NEG02_INPUT_SHA256, "setup: concrete NEG02 input"
        )
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
        target_qual["qualification_body"]["subject"] = (
            "synthetic-section-target-source-A"
        )
        target_source["content"]["descriptor_targets"] = [
            {
                "target_ref": copy.deepcopy(target_ref),
                "slot_identity": "synthetic-descriptor-6",
                "descriptor_kind": "required section",
            }
        ]
        digest_a = _rebind_source_digest(target_source, target_qual)
        target_prov["identity"] = "synthetic-section-target-source-A"
        target_prov["sha256"] = digest_a

        claim["subject_ref"] = copy.deepcopy(target_ref)
        basis_source["content"]["replacement_basis_uses"][0]["claim"] = copy.deepcopy(
            claim
        )
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
        target_qual["subject_ref"]["identity"] = (
            f"synthetic-{kind_name}-target-source-A"
        )
        target_qual["qualification_body"]["subject"] = (
            f"synthetic-{kind_name}-target-source-A"
        )
        target_source["content"]["descriptor_targets"] = [
            {
                "target_ref": copy.deepcopy(target_ref),
                "slot_identity": f"synthetic-descriptor-{slot_index + 1}",
                "descriptor_kind": kind_name,
            }
        ]
        digest_a = _rebind_source_digest(target_source, target_qual)
        target_prov["identity"] = f"synthetic-{kind_name}-target-source-A"
        target_prov["sha256"] = digest_a

        view_source["role"] = "derived_view"
        view_source["ref"]["identity"] = f"synthetic-derived-view-{kind_name}"
        view_qual["subject_ref"]["identity"] = f"synthetic-derived-view-{kind_name}"
        view_qual["qualification_body"]["subject"] = (
            f"synthetic-derived-view-{kind_name}"
        )
        view_source["content"] = {
            "binding": copy.deepcopy(self.original_binding),
            "rendered_view": f"synthetic rendered view for {kind_name}",
        }
        _rebind_source_digest(view_source, view_qual)

        claim["subject_ref"] = copy.deepcopy(target_ref)
        claim["basis_refs"] = [
            {
                "identity": f"synthetic-derived-view-{kind_name}",
                "revision": "synthetic-rev-B",
                "scope": copy.deepcopy(self.original_binding["knowledge_ref"]["scope"]),
                "owner": "synthetic-knowledge-owner",
                "source_locator": None,
                "sha256": None,
            }
        ]

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
            self.assertNotIn(
                source["ref"],
                validated["unusable_source_refs"],
                "setup: added source qualification",
            )
        validated_before = copy.deepcopy(validated)
        result = compare_descriptor_definitions({"validated": validated})
        self.assertEqual(
            validated, validated_before, "DefinitionContext input is unchanged"
        )
        self.assertEqual(raw, before, "raw input is unchanged by validator/comparison")
        self.assertEqual(result["producer_symbol"], "compare_descriptor_definitions")
        return result

    def _assert_missing(
        self, result, code, subject=None, axis_name="required field.definition"
    ):
        findings = [f for f in result["findings"] if f["code"] == code]
        self.assertTrue(findings, "semantic: intended defect must be diagnosed")
        matching = [
            f
            for f in findings
            if f["binding"] == self.original_binding
            and (subject is None or f["subject_ref"] == subject)
        ]
        self.assertTrue(
            matching, "semantic: original target/full Binding must be retained"
        )
        for finding in matching:
            self.assertEqual(finding["axis"], axis_name)
            self.assertEqual(finding["state"], "missing")
            self.assertEqual(finding["backflow_owner"], "knowledge_owner")
            self.assertEqual(finding["rule_ref"], "HELIXBRAIN-L5-032-R-" + code)
        self.assertTrue(
            any(
                a["binding"] == self.original_binding
                and a["axis"] == axis_name
                and a["state"] == "missing"
                and a["backflow_owner"] == "knowledge_owner"
                for a in result["axes"]
            )
        )

    def test_neg02_cross_pattern_field_substitution(self):
        raw = self._neg02_input()
        subject = copy.deepcopy(raw["claims"][-1]["subject_ref"])
        self.assertEqual(subject["identity"], "SYNTHETIC-OWNER-FIELD-TARGET-A")
        result = self._compare(raw, added_sources=raw["sources"][5:])
        self._assert_missing(result, CROSS_CODE, subject)
        self._assert_missing(
            result, MISSING_CODE, self.original_binding["knowledge_ref"]
        )
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
            raw["sources"][6]["content"]["replacement_basis_uses"][0]["fact"][
                "source_ref"
            ],
        ]
        self.assertEqual(cross_findings[0]["source_refs"], expected_refs)

    def test_neg01_cross_pattern_section_substitution(self):
        case_spec = self.document["cases"][3]["negative_cases"][0]
        self.assertEqual(case_spec["id"], "HELIXBRAIN-L8-032-F02-NEG-01")
        self.assertEqual(
            case_spec["rule_ref"], "HELIXBRAIN-L5-032-R-" + CROSS_SECTION_CODE
        )
        raw = self._neg01_input()
        subject = copy.deepcopy(raw["claims"][-1]["subject_ref"])
        self.assertEqual(subject["identity"], "SYNTHETIC-OWNER-SECTION-TARGET-A")
        result = self._compare(raw, added_sources=raw["sources"][5:])
        self._assert_missing(
            result, CROSS_SECTION_CODE, subject, axis_name="required section.definition"
        )
        self._assert_missing(
            result,
            "descriptor_06_missing",
            self.original_binding["knowledge_ref"],
            axis_name="required section.definition",
        )
        cross_findings = [
            f for f in result["findings"] if f["code"] == CROSS_SECTION_CODE
        ]
        self.assertEqual(len(cross_findings), 1)
        self.assertEqual(cross_findings[0]["reason"], CROSS_SECTION_REASON)

    def test_neg21_required_field_missing_without_substitution(self):
        mutation = self.document["cases"][3]["negative_cases"][20]["typed_mutation"]
        self.assertEqual(
            mutation,
            {"operation": "remove_slot", "target_descriptor_kind": "required field"},
        )
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
                self.assertEqual(
                    finding,
                    {
                        "code": code,
                        "rule_ref": f"HELIXBRAIN-L5-032-R-{code}",
                        "subject_ref": self.original_binding["knowledge_ref"],
                        "binding": self.original_binding,
                        "axis": axis_name,
                        "state": "missing",
                        "source_refs": [],
                        "reason": SLOT_MISSING_REASON,
                        "backflow_owner": "knowledge_owner",
                    },
                )
                missing_axes = [a for a in result["axes"] if a["state"] == "missing"]
                self.assertEqual(
                    missing_axes,
                    [
                        {
                            "subject_ref": self.original_binding["knowledge_ref"],
                            "binding": self.original_binding,
                            "axis": axis_name,
                            "state": "missing",
                            "original_refs": [],
                            "reason": SLOT_MISSING_REASON,
                            "backflow_owner": "knowledge_owner",
                        }
                    ],
                )
                # 残り14 descriptorの3軸（definition/attribution/definition_applicability）が保全される。
                self.assertEqual(len(result["axes"]), 14 * 3 + 1)

    def test_f05_neg01_and_neg02_fn1_prerequisite_measurement_and_completion_missing(
        self,
    ):
        cases = (
            (
                0,
                11,
                "measurement",
                "descriptor_12_missing",
                "SYNTHETIC-OWNER-MEASUREMENT-TARGET-A",
            ),
            (
                1,
                12,
                "completion",
                "descriptor_13_missing",
                "SYNTHETIC-OWNER-COMPLETION-TARGET-A",
            ),
        )
        for f05_index, slot_index, kind_name, expected_code, target_id in cases:
            f05_case = self.document["cases"][6]["negative_cases"][f05_index]
            self.assertEqual(
                f05_case["typed_mutation"]["synthetic_value"],
                {
                    "remove_kind": kind_name,
                    "basis_role": "derived_view",
                    "claim_kind": "fill_definition",
                },
            )
            with self.subTest(kind=kind_name, code=expected_code):
                raw = self._f05_view_repair_input(slot_index, kind_name, target_id)
                result = self._compare(raw, added_sources=raw["sources"][5:])
                self.assertEqual(
                    [f["code"] for f in result["findings"]], [expected_code]
                )
                self._assert_missing(
                    result,
                    expected_code,
                    self.original_binding["knowledge_ref"],
                    axis_name=f"{kind_name}.definition",
                )
                # fn4へ引き継ぐ3軸（negative oracle/measurement/completion）が揃い、fn1 specialは発火しない。
                carried_axes = [
                    a
                    for a in result["axes"]
                    if a["axis"]
                    in (
                        "negative oracle.definition",
                        "measurement.definition",
                        "completion.definition",
                    )
                ]
                self.assertEqual(len(carried_axes), 3)
                states_by_axis = {a["axis"]: a["state"] for a in carried_axes}
                self.assertEqual(
                    states_by_axis["negative oracle.definition"], "unknown"
                )
                self.assertEqual(states_by_axis[f"{kind_name}.definition"], "missing")

    def test_kind_surplus_reads_all_supplied_slots_without_synthesizing_required_kinds(
        self,
    ):
        # 余剰kind: required_descriptor_kindsが13種のみでも、供給された15 DescriptorSlotはall_slot_read_domainで読む。
        raw_surplus = copy.deepcopy(self.base)
        raw_surplus["required_descriptor_kinds"] = [
            k
            for k in self.base["required_descriptor_kinds"]
            if k not in ("required field", "measurement")
        ]
        result_surplus = self._compare(raw_surplus)
        self.assertEqual(result_surplus["findings"], [])
        self.assertEqual(len(result_surplus["axes"]), 45)
        self.assertTrue(
            any(
                a["axis"] == "required field.definition" and a["state"] == "unknown"
                for a in result_surplus["axes"]
            )
        )
        self.assertTrue(
            any(
                a["axis"] == "measurement.definition" and a["state"] == "unknown"
                for a in result_surplus["axes"]
            )
        )

        # required_descriptor_kindsに無いkindはslot未供給でもmissing集合へ合成しない。
        raw_subset_missing = copy.deepcopy(raw_surplus)
        raw_subset_missing["descriptors"] = [
            s
            for s in raw_subset_missing["descriptors"]
            if s["descriptor_kind"] not in ("required section", "required field")
        ]
        result_subset = self._compare(raw_subset_missing)
        self.assertEqual(
            [f["code"] for f in result_subset["findings"]], ["descriptor_06_missing"]
        )

    def test_replacement_claim_unresolved_basis_and_nonfiring_branches(self):
        # 明示empty basis_refs: constructors/3 第3枝 replacement_basis_unresolved unknown を形成し rule8 Finding は出さない。
        raw_empty_basis = self._neg02_input()
        raw_empty_basis["claims"][-1]["basis_refs"] = []
        result_empty = self._compare(
            raw_empty_basis, added_sources=raw_empty_basis["sources"][5:]
        )
        self.assertEqual([f["code"] for f in result_empty["findings"]], [MISSING_CODE])
        unresolved_axes = [
            a
            for a in result_empty["axes"]
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
        basis_source["content"]["binding"]["template_ref"]["identity"] = (
            "SYNTHETIC-TEMPLATE-A"
        )
        basis_source["content"]["replacement_basis_uses"][0]["basis_binding"][
            "template_ref"
        ]["identity"] = "SYNTHETIC-TEMPLATE-A"
        basis_source["content"]["replacement_basis_uses"][0]["fact"]["binding"][
            "template_ref"
        ]["identity"] = "SYNTHETIC-TEMPLATE-A"
        basis_source["content"]["descriptor_facts"][0]["facts"][0]["binding"][
            "template_ref"
        ]["identity"] = "SYNTHETIC-TEMPLATE-A"
        _rebind_source_digest(basis_source, basis_qual)
        result_same = self._compare(
            raw_same_pattern, added_sources=raw_same_pattern["sources"][5:]
        )
        self.assertEqual([f["code"] for f in result_same["findings"]], [MISSING_CODE])
        self.assertFalse(
            any(
                a["subject_ref"] == raw_same_pattern["claims"][-1]["subject_ref"]
                for a in result_same["axes"]
            )
        )

    def test_out_of_scope_branches_preserve_not_implemented_ids(self):
        raw_dup_req = copy.deepcopy(self.base)
        raw_dup_req["required_descriptor_kinds"].append("required field")
        validated_dup = validate_supply_input(raw_dup_req)
        with self.assertRaises(NotImplementedError) as caught_dup:
            compare_descriptor_definitions({"validated": validated_dup})
        self.assertIn(
            "F02/required_kinds_outside_frozen_path", str(caught_dup.exception)
        )

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

        raw_harness_claim = copy.deepcopy(self.base)
        raw_harness_claim["claims"].append(
            {
                "subject_ref": copy.deepcopy(self.original_binding["template_ref"]),
                "binding": copy.deepcopy(self.original_binding),
                "actor": "BRAIN",
                "kind": "harness_layer_pair_override",
                "proposed_value": "synthetic harness layer pair override",
                "basis_refs": [],
            }
        )
        validated_harness = validate_supply_input(raw_harness_claim)
        with self.assertRaises(NotImplementedError) as caught_harness:
            compare_descriptor_definitions({"validated": validated_harness})
        self.assertIn("F01/harness_claim_unimplemented", str(caught_harness.exception))

        # 別Bindingのharness_layer_pair_override Claimは当該BindingのF01停止を起こさない（R2-m3）。
        raw_other_harness = copy.deepcopy(self.base)
        other_binding = copy.deepcopy(self.original_binding)
        other_binding["template_ref"]["identity"] = "OTHER-TEMPLATE-HARNESS"
        raw_other_harness["claims"].append(
            {**copy.deepcopy(raw_harness_claim["claims"][-1]), "binding": other_binding}
        )
        self.assertEqual(self._compare(raw_other_harness)["findings"], [])

        raw_f01_claim = copy.deepcopy(self.base)
        raw_f01_claim["claims"].append(
            {
                "subject_ref": copy.deepcopy(
                    raw_f01_claim["descriptors"][2]["facts"][0]["ref"]
                ),
                "binding": copy.deepcopy(self.original_binding),
                "actor": None,
                "kind": "custom_descriptor_claim",
                "proposed_value": "synthetic descriptor claim on fact_ref",
                "basis_refs": [],
            }
        )
        # L4 consumer_branch_table/8: 対象外Claimは原definition結果を変えない。
        control_raw = copy.deepcopy(raw_f01_claim)
        control_raw["claims"].pop()
        self.assertEqual(self._compare(raw_f01_claim), self._compare(control_raw))

        # fill_definition Claimはsubject_refがfact_refと一致してもF01停止にしない。
        raw_fill_on_fact = copy.deepcopy(self.base)
        raw_fill_on_fact["claims"].append(
            {
                "subject_ref": copy.deepcopy(
                    raw_fill_on_fact["descriptors"][2]["facts"][0]["ref"]
                ),
                "binding": copy.deepcopy(self.original_binding),
                "actor": None,
                "kind": "fill_definition",
                "proposed_value": "synthetic fill definition",
                "basis_refs": [],
            }
        )
        result_fill_on_fact = self._compare(raw_fill_on_fact)
        self.assertEqual(result_fill_on_fact["findings"], [])

    def test_r1_m1_fill_definition_positive_intent_values_and_actor(self):
        # L4 claim_intent_protocol/rules/4: proposed_valueキー供給済みの全RawValue（null/false/0/空文字/空配列）と非null actorはpositive。
        cases = (
            ("null_value", None, None),
            ("false_value", False, None),
            ("zero_value", 0, None),
            ("empty_string", "", None),
            ("empty_list", [], None),
            ("non_null_actor", "filled", "synthetic-actor"),
        )
        for label, proposed_val, actor_val in cases:
            with self.subTest(case=label):
                raw = self._neg02_input()
                raw["claims"][-1]["proposed_value"] = copy.deepcopy(proposed_val)
                raw["claims"][-1]["actor"] = actor_val
                basis_source = raw["sources"][6]
                basis_qual = raw["qualifications"][6]
                basis_source["content"]["replacement_basis_uses"][0]["claim"] = (
                    copy.deepcopy(raw["claims"][-1])
                )
                _rebind_source_digest(basis_source, basis_qual)
                result = self._compare(raw, added_sources=raw["sources"][5:])
                self._assert_missing(
                    result, CROSS_CODE, raw["claims"][-1]["subject_ref"]
                )

        # proposed_valueキー欠落のみunresolved（constructors/3 第4枝で追加event非発火）。
        raw_absent_pv = self._neg02_input()
        del raw_absent_pv["claims"][-1]["proposed_value"]
        result_absent_pv = self._compare(
            raw_absent_pv, added_sources=raw_absent_pv["sources"][5:]
        )
        self.assertEqual(
            [f["code"] for f in result_absent_pv["findings"]], [MISSING_CODE]
        )
        self.assertFalse(
            any(
                a["subject_ref"] == raw_absent_pv["claims"][-1]["subject_ref"]
                for a in result_absent_pv["axes"]
            )
        )

    def test_r1_m2_basis_refs_member_absent_emits_replacement_basis_unresolved(self):
        # L4 replacement_special/unresolved_third_branch & L5 constructors/3/branches/2: basis_refsキー欠落はunknownを出して保持。
        raw = self._neg02_input()
        subject = copy.deepcopy(raw["claims"][-1]["subject_ref"])
        del raw["claims"][-1]["basis_refs"]
        result = self._compare(raw, added_sources=raw["sources"][5:])
        self.assertEqual([f["code"] for f in result["findings"]], [MISSING_CODE])
        unresolved = [a for a in result["axes"] if a["subject_ref"] == subject]
        self.assertEqual(len(unresolved), 1)
        self.assertEqual(unresolved[0]["axis"], "required field.definition")
        self.assertEqual(unresolved[0]["state"], "unknown")
        self.assertEqual(unresolved[0]["reason"], REPLACEMENT_UNRESOLVED_REASON)
        self.assertEqual(
            unresolved[0]["original_refs"],
            [
                raw["sources"][5]["content"]["descriptor_targets"][0]["target_ref"],
                raw["sources"][5]["ref"],
            ],
        )

    def test_r1_m2_special_sort_source_refs_per_usable_occurrence_and_finding_sort(
        self,
    ):
        # 1. descriptor_06_missing (required section.definition) と descriptor_07_missing (required field.definition) のaxis順整列。
        raw_two_missing = copy.deepcopy(self.base)
        raw_two_missing["descriptors"] = [
            s
            for s in raw_two_missing["descriptors"]
            if s["descriptor_kind"] not in ("required section", "required field")
        ]
        res_two = self._compare(raw_two_missing)
        self.assertEqual(
            [f["code"] for f in res_two["findings"]],
            ["descriptor_07_missing", "descriptor_06_missing"],
        )

        # 2. special sort_source_refs は usable な replacement_basis_uses の要素ごとに積まれる（L5 sort_source_ref_column/special）。
        raw_multi = self._neg02_input()
        claim0 = raw_multi["claims"][-1]
        b_source = raw_multi["sources"][6]
        b_qual = raw_multi["qualifications"][6]
        use0 = copy.deepcopy(b_source["content"]["replacement_basis_uses"][0])

        def clone_basis_source(suffix, fact_id):
            src = copy.deepcopy(b_source)
            qual = copy.deepcopy(b_qual)
            src_id = f"synthetic-semantic-source-{suffix}"
            qual_id = f"synthetic-source-qualification-{suffix}"
            src["ref"]["identity"] = src_id
            src["qualification_ref"]["identity"] = qual_id
            qual["ref"]["identity"] = qual_id
            qual["subject_ref"]["identity"] = src_id
            qual["qualification_body"]["subject"] = src_id
            src["content"]["descriptor_facts"][0]["facts"][0]["source_ref"][
                "identity"
            ] = src_id
            src["content"]["descriptor_facts"][0]["facts"][0]["ref"]["identity"] = (
                fact_id
            )
            ref = copy.deepcopy(claim0["basis_refs"][0])
            ref["identity"] = src_id
            return src, qual, ref

        c_source, c_qual, c_ref = clone_basis_source(
            "C", "synthetic-descriptor-C5-fact-1"
        )
        b2_source, b2_qual, b2_ref = clone_basis_source(
            "B2", "synthetic-descriptor-B2-fact-1"
        )
        b_ref = copy.deepcopy(claim0["basis_refs"][0])

        # 各special readのsource_occurrences全列をsort列に使い、同じsort keyはClaim/read順を保つ。
        claim0["basis_refs"] = [copy.deepcopy(b_ref), copy.deepcopy(b2_ref)]
        claim1 = copy.deepcopy(claim0)
        claim1["proposed_value"] = "claim1-val"
        claim1["basis_refs"] = [copy.deepcopy(b_ref), copy.deepcopy(c_ref)]

        def make_use(claim_obj, src_id, fact_id):
            u = copy.deepcopy(use0)
            u["claim"] = copy.deepcopy(claim_obj)
            u["basis_ref"]["identity"] = src_id
            u["fact"]["source_ref"]["identity"] = src_id
            u["fact"]["ref"]["identity"] = fact_id
            return u

        b_source["content"]["replacement_basis_uses"] = [
            make_use(
                claim0, "synthetic-semantic-source-B", "synthetic-descriptor-B5-fact-1"
            ),
            make_use(
                claim1, "synthetic-semantic-source-B", "synthetic-descriptor-B5-fact-1"
            ),
        ]
        b2_source["content"]["replacement_basis_uses"] = []
        c_source["content"]["replacement_basis_uses"] = [
            make_use(
                claim1, "synthetic-semantic-source-C", "synthetic-descriptor-C5-fact-1"
            ),
        ]

        _rebind_source_digest(b_source, b_qual)
        _rebind_source_digest(c_source, c_qual)
        _rebind_source_digest(b2_source, b2_qual)

        raw_multi["sources"].extend([c_source, b2_source])
        raw_multi["qualifications"].extend([c_qual, b2_qual])
        raw_multi["claims"].append(claim1)

        res_multi = self._compare(raw_multi, added_sources=raw_multi["sources"][5:])
        cross_axes = [
            a
            for a in res_multi["axes"]
            if a["reason"].endswith("別Patternのrequired inputで補うことはできない。")
        ]
        self.assertEqual(len(cross_axes), 3)
        self.assertEqual(
            [a["original_refs"][1]["identity"] for a in cross_axes],
            [
                "synthetic-semantic-source-B2",
                "synthetic-semantic-source-C",
                "synthetic-semantic-source-C",
            ],
        )

    def test_r1_m4_target_and_basis_negative_boundary_mutations(self):
        # Group A: target解決の各条件を1つずつ崩すと追加special eventは非発火（descriptor_07_missingのみ）。
        def assert_no_special_event(raw):
            validated = validate_supply_input(raw)
            if validated["input"] is None:
                validated = {
                    "input": raw,
                    "unusable_source_refs": [],
                    "input_issues": [],
                }
            res = compare_descriptor_definitions({"validated": validated})
            self.assertEqual([f["code"] for f in res["findings"]], [MISSING_CODE])
            self.assertEqual(len(res["axes"]), 14 * 3 + 1)

        target_mutations = [
            (
                "claim_kind_other",
                lambda r: r["claims"][-1].__setitem__("kind", "other_kind"),
            ),
            (
                "claim_binding_diff",
                lambda r: r["claims"][-1]["binding"]["template_ref"].__setitem__(
                    "identity", "OTHER-TPL"
                ),
            ),
            (
                "subject_ref_bad",
                lambda r: r["claims"][-1].__setitem__("subject_ref", {"identity": ""}),
            ),
            (
                "target_src_role",
                lambda r: r["sources"][5].__setitem__("role", "reference_only"),
            ),
            (
                "target_src_unusable",
                lambda r: r["qualifications"][5].__setitem__(
                    "subject_sha256", "0" * 64
                ),
            ),
            (
                "target_src_no_prov",
                lambda r: r["knowledge_records"][0]["provenance_refs"].pop(),
            ),
            (
                "target_prov_on_other_kr",
                lambda r: r["knowledge_records"].append(
                    {
                        "ref": {
                            **copy.deepcopy(r["knowledge_records"][0]["ref"]),
                            "identity": "OTHER-KR",
                        },
                        "provenance_refs": [
                            r["knowledge_records"][0]["provenance_refs"].pop()
                        ],
                    }
                ),
            ),
            (
                "target_src_content_type",
                lambda r: (
                    r["sources"][5].__setitem__("content", []),
                    _rebind_source_digest(r["sources"][5], r["qualifications"][5]),
                    r["knowledge_records"][0]["provenance_refs"][-1].__setitem__(
                        "sha256", r["sources"][5]["ref"]["sha256"]
                    ),
                ),
            ),
            (
                "target_src_binding_diff",
                lambda r: (
                    r["sources"][5]["content"]["binding"]["template_ref"].__setitem__(
                        "identity", "OTHER-TPL"
                    ),
                    _rebind_source_digest(r["sources"][5], r["qualifications"][5]),
                    r["knowledge_records"][0]["provenance_refs"][-1].__setitem__(
                        "sha256", r["sources"][5]["ref"]["sha256"]
                    ),
                ),
            ),
            (
                "targets_not_list",
                lambda r: (
                    r["sources"][5]["content"].__setitem__("descriptor_targets", None),
                    _rebind_source_digest(r["sources"][5], r["qualifications"][5]),
                    r["knowledge_records"][0]["provenance_refs"][-1].__setitem__(
                        "sha256", r["sources"][5]["ref"]["sha256"]
                    ),
                ),
            ),
            (
                "target_elem_not_dict",
                lambda r: (
                    r["sources"][5]["content"].__setitem__(
                        "descriptor_targets", ["bad"]
                    ),
                    _rebind_source_digest(r["sources"][5], r["qualifications"][5]),
                    r["knowledge_records"][0]["provenance_refs"][-1].__setitem__(
                        "sha256", r["sources"][5]["ref"]["sha256"]
                    ),
                ),
            ),
            (
                "target_ref_bad",
                lambda r: (
                    r["sources"][5]["content"]["descriptor_targets"][0].__setitem__(
                        "target_ref", None
                    ),
                    _rebind_source_digest(r["sources"][5], r["qualifications"][5]),
                    r["knowledge_records"][0]["provenance_refs"][-1].__setitem__(
                        "sha256", r["sources"][5]["ref"]["sha256"]
                    ),
                ),
            ),
            (
                "target_ref_diff",
                lambda r: (
                    r["sources"][5]["content"]["descriptor_targets"][0][
                        "target_ref"
                    ].__setitem__("identity", "OTHER-TARGET"),
                    _rebind_source_digest(r["sources"][5], r["qualifications"][5]),
                    r["knowledge_records"][0]["provenance_refs"][-1].__setitem__(
                        "sha256", r["sources"][5]["ref"]["sha256"]
                    ),
                ),
            ),
            (
                "target_slot_non_str",
                lambda r: (
                    r["sources"][5]["content"]["descriptor_targets"][0].__setitem__(
                        "slot_identity", 123
                    ),
                    _rebind_source_digest(r["sources"][5], r["qualifications"][5]),
                    r["knowledge_records"][0]["provenance_refs"][-1].__setitem__(
                        "sha256", r["sources"][5]["ref"]["sha256"]
                    ),
                ),
            ),
            (
                "target_slot_empty",
                lambda r: (
                    r["sources"][5]["content"]["descriptor_targets"][0].__setitem__(
                        "slot_identity", ""
                    ),
                    _rebind_source_digest(r["sources"][5], r["qualifications"][5]),
                    r["knowledge_records"][0]["provenance_refs"][-1].__setitem__(
                        "sha256", r["sources"][5]["ref"]["sha256"]
                    ),
                ),
            ),
            (
                "target_kind_bad",
                lambda r: (
                    r["sources"][5]["content"]["descriptor_targets"][0].__setitem__(
                        "descriptor_kind", "bad_kind"
                    ),
                    _rebind_source_digest(r["sources"][5], r["qualifications"][5]),
                    r["knowledge_records"][0]["provenance_refs"][-1].__setitem__(
                        "sha256", r["sources"][5]["ref"]["sha256"]
                    ),
                ),
            ),
            (
                "target_caller_conflict",
                lambda r: r["descriptors"][0].__setitem__(
                    "slot_identity", "synthetic-descriptor-7"
                ),
            ),
            (
                "target_ambiguous",
                lambda r: (
                    r["sources"][5]["content"]["descriptor_targets"].append(
                        {
                            "target_ref": copy.deepcopy(r["claims"][-1]["subject_ref"]),
                            "slot_identity": "synthetic-descriptor-7-alt",
                            "descriptor_kind": "required field",
                        }
                    ),
                    _rebind_source_digest(r["sources"][5], r["qualifications"][5]),
                    r["knowledge_records"][0]["provenance_refs"][-1].__setitem__(
                        "sha256", r["sources"][5]["ref"]["sha256"]
                    ),
                ),
            ),
        ]
        for label, mutate in target_mutations:
            with self.subTest(group="target", case=label):
                raw = self._neg02_input()
                mutate(raw)
                assert_no_special_event(raw)

        # target slotが欠落していない（primary missing無し）場合も追加special非発火。
        raw_not_missing = self._neg02_input()
        raw_not_missing["descriptors"].insert(
            6, copy.deepcopy(self.base["descriptors"][6])
        )
        res_not_missing = self._compare(
            raw_not_missing, added_sources=raw_not_missing["sources"][5:]
        )
        self.assertEqual(res_not_missing["findings"], [])
        self.assertFalse(
            any(
                a["subject_ref"] == raw_not_missing["claims"][-1]["subject_ref"]
                for a in res_not_missing["axes"]
            )
        )

        # Group B: basis解決・replacement_basis_uses・descriptor_factsの各条件を1つずつ崩すとunknown（replacement_basis_unresolved）になりrule8は非発火。
        def assert_unresolved_unknown(raw):
            subject = raw["claims"][-1]["subject_ref"]
            validated = validate_supply_input(raw)
            res = compare_descriptor_definitions({"validated": validated})
            self.assertEqual([f["code"] for f in res["findings"]], [MISSING_CODE])
            rows = [a for a in res["axes"] if a["subject_ref"] == subject]
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["state"], "unknown")
            self.assertEqual(rows[0]["reason"], REPLACEMENT_UNRESOLVED_REASON)

        basis_mutations = [
            (
                "basis_src_role_view",
                lambda r: (
                    r["sources"][6].__setitem__("role", "derived_view"),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "basis_ref_unmatched",
                lambda r: r["claims"][-1]["basis_refs"][0].__setitem__(
                    "identity", "missing-basis-src"
                ),
            ),
            (
                "basis_src_unusable",
                lambda r: r["qualifications"][6].__setitem__(
                    "subject_sha256", "0" * 64
                ),
            ),
            (
                "uses_not_list",
                lambda r: (
                    r["sources"][6]["content"].__setitem__(
                        "replacement_basis_uses", None
                    ),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "facts_groups_not_list",
                lambda r: (
                    r["sources"][6]["content"].__setitem__("descriptor_facts", None),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "uses_empty",
                lambda r: (
                    r["sources"][6]["content"].__setitem__(
                        "replacement_basis_uses", []
                    ),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "use_not_dict",
                lambda r: (
                    r["sources"][6]["content"].__setitem__(
                        "replacement_basis_uses",
                        [
                            [
                                "claim",
                                "basis_ref",
                                "basis_binding",
                                "slot_identity",
                                "descriptor_kind",
                                "fact",
                            ]
                        ],
                    ),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "use_extra_key",
                lambda r: (
                    r["sources"][6]["content"]["replacement_basis_uses"][0].__setitem__(
                        "extra", 1
                    ),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "use_claim_diff",
                lambda r: (
                    r["sources"][6]["content"]["replacement_basis_uses"][0][
                        "claim"
                    ].__setitem__("proposed_value", "diff"),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "use_basis_ref_id_diff",
                lambda r: (
                    r["sources"][6]["content"]["replacement_basis_uses"][0][
                        "basis_ref"
                    ].__setitem__("identity", "other-src"),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "use_basis_binding_bad",
                lambda r: (
                    r["sources"][6]["content"]["replacement_basis_uses"][0].__setitem__(
                        "basis_binding", None
                    ),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "use_basis_binding_diff",
                lambda r: (
                    r["sources"][6]["content"]["binding"]["template_ref"].__setitem__(
                        "identity", "SYNTHETIC-TEMPLATE-C"
                    ),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "use_slot_non_str",
                lambda r: (
                    r["sources"][6]["content"]["replacement_basis_uses"][0].__setitem__(
                        "slot_identity", 123
                    ),
                    r["sources"][6]["content"]["descriptor_facts"][0].__setitem__(
                        "slot_identity", 123
                    ),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "use_slot_empty",
                lambda r: (
                    r["sources"][6]["content"]["replacement_basis_uses"][0].__setitem__(
                        "slot_identity", ""
                    ),
                    r["sources"][6]["content"]["descriptor_facts"][0].__setitem__(
                        "slot_identity", ""
                    ),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "use_kind_invalid",
                lambda r: (
                    r["sources"][6]["content"]["replacement_basis_uses"][0].__setitem__(
                        "descriptor_kind", "invalid_kind"
                    ),
                    r["sources"][6]["content"]["descriptor_facts"][0].__setitem__(
                        "descriptor_kind", "invalid_kind"
                    ),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "use_fact_not_dict",
                lambda r: (
                    r["sources"][6]["content"]["replacement_basis_uses"][0].__setitem__(
                        "fact", "bad"
                    ),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "use_fact_binding_diff",
                lambda r: (
                    r["sources"][6]["content"]["replacement_basis_uses"][0]["fact"][
                        "binding"
                    ]["template_ref"].__setitem__("identity", "SYNTHETIC-TEMPLATE-C"),
                    r["sources"][6]["content"]["descriptor_facts"][0]["facts"][0][
                        "binding"
                    ]["template_ref"].__setitem__("identity", "SYNTHETIC-TEMPLATE-C"),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "grp_not_dict",
                lambda r: (
                    r["sources"][6]["content"].__setitem__("descriptor_facts", ["bad"]),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "grp_slot_diff",
                lambda r: (
                    r["sources"][6]["content"]["descriptor_facts"][0].__setitem__(
                        "slot_identity", "other-slot"
                    ),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "grp_kind_diff",
                lambda r: (
                    r["sources"][6]["content"]["descriptor_facts"][0].__setitem__(
                        "descriptor_kind", "version"
                    ),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "grp_facts_not_list",
                lambda r: (
                    r["sources"][6]["content"]["descriptor_facts"][0].__setitem__(
                        "facts", None
                    ),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "orig_fact_not_dict",
                lambda r: (
                    r["sources"][6]["content"]["descriptor_facts"][0].__setitem__(
                        "facts", ["bad"]
                    ),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "orig_fact_ref_diff",
                lambda r: (
                    r["sources"][6]["content"]["descriptor_facts"][0]["facts"][0][
                        "ref"
                    ].__setitem__("identity", "other-fact"),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
            (
                "orig_fact_body_diff",
                lambda r: (
                    r["sources"][6]["content"]["descriptor_facts"][0]["facts"][
                        0
                    ].__setitem__("meaning", {"changed": True}),
                    _rebind_source_digest(r["sources"][6], r["qualifications"][6]),
                ),
            ),
        ]
        for label, mutate in basis_mutations:
            with self.subTest(group="basis", case=label):
                raw = self._neg02_input()
                mutate(raw)
                assert_unresolved_unknown(raw)

        # L5 ref_same treats a null SHA as matching a known SHA; this remains a positive
        # basis correspondence and therefore retains the cross-pattern finding.
        raw_sha_unknown = self._neg02_input()
        claim = raw_sha_unknown["claims"][-1]
        use = raw_sha_unknown["sources"][6]["content"]["replacement_basis_uses"][0]
        self.assertIsNone(claim["basis_refs"][0]["sha256"])
        use["basis_ref"]["sha256"] = "0" * 64
        _rebind_source_digest(
            raw_sha_unknown["sources"][6], raw_sha_unknown["qualifications"][6]
        )
        result_sha_unknown = self._compare(
            raw_sha_unknown, added_sources=raw_sha_unknown["sources"][5:]
        )
        self.assertEqual(
            [finding["code"] for finding in result_sha_unknown["findings"]],
            [MISSING_CODE, CROSS_CODE],
        )
        cross_sha_unknown = [
            finding
            for finding in result_sha_unknown["findings"]
            if finding["code"] == CROSS_CODE
        ]
        self.assertEqual(len(cross_sha_unknown), 1)
        self.assertEqual(cross_sha_unknown[0]["reason"], CROSS_FIELD_REASON)
        self.assertEqual(
            cross_sha_unknown[0]["source_refs"],
            [
                claim["basis_refs"][0],
                raw_sha_unknown["sources"][5]["content"]["descriptor_targets"][0][
                    "target_ref"
                ],
                raw_sha_unknown["sources"][5]["ref"],
                raw_sha_unknown["sources"][6]["ref"],
                use["basis_ref"],
                use["fact"]["ref"],
                use["fact"]["source_ref"],
            ],
        )

        # Group C: 既知owner kindがrequired input以外（例: version）で確定した場合はrule8も第3枝unknownも非発火。
        raw_non_req_input = self._neg02_input()
        raw_non_req_input["sources"][6]["content"]["replacement_basis_uses"][0][
            "descriptor_kind"
        ] = "version"
        raw_non_req_input["sources"][6]["content"]["descriptor_facts"][0][
            "descriptor_kind"
        ] = "version"
        _rebind_source_digest(
            raw_non_req_input["sources"][6], raw_non_req_input["qualifications"][6]
        )
        assert_no_special_event(raw_non_req_input)

        # Group D (R2-m1c, R2-m2): provenance_refsが非listのKnowledgeRecord（T3）、derived_view混入（T5/E10）、cross発火＋未解決basis混在（E40/E41）。
        raw_t3 = self._neg02_input()
        raw_t3["descriptors"] = []
        raw_t3["required_descriptor_kinds"] = ["required field"]
        raw_t3["knowledge_records"][0]["provenance_refs"] = None
        res_t3 = compare_descriptor_definitions(
            {
                "validated": {
                    "input": raw_t3,
                    "unusable_source_refs": [],
                    "input_issues": [],
                }
            }
        )
        self.assertEqual([f["code"] for f in res_t3["findings"]], [MISSING_CODE])

        raw_role_mix = self._neg02_input()
        dup_t_view = copy.deepcopy(raw_role_mix["sources"][5])
        dup_t_view["role"] = "derived_view"
        dup_t_view["content"]["descriptor_targets"][0]["slot_identity"] = (
            "conflicting-from-derived-view"
        )
        dup_b_view = copy.deepcopy(raw_role_mix["sources"][6])
        dup_b_view["role"] = "derived_view"
        raw_role_mix["sources"].extend([dup_t_view, dup_b_view])
        res_role_mix = compare_descriptor_definitions(
            {
                "validated": {
                    "input": raw_role_mix,
                    "unusable_source_refs": [],
                    "input_issues": [],
                }
            }
        )
        self.assertEqual(
            [f["code"] for f in res_role_mix["findings"]], [MISSING_CODE, CROSS_CODE]
        )

        raw_mixed_basis = self._neg02_input()
        unres_ref = copy.deepcopy(raw_mixed_basis["claims"][-1]["basis_refs"][0])
        unres_ref["identity"] = "missing-basis-src"
        raw_mixed_basis["claims"][-1]["basis_refs"].append(unres_ref)
        raw_mixed_basis["sources"][6]["content"]["replacement_basis_uses"][0][
            "claim"
        ] = copy.deepcopy(raw_mixed_basis["claims"][-1])
        _rebind_source_digest(
            raw_mixed_basis["sources"][6], raw_mixed_basis["qualifications"][6]
        )
        res_mixed_basis = self._compare(
            raw_mixed_basis, added_sources=raw_mixed_basis["sources"][5:]
        )
        self.assertEqual(
            [f["code"] for f in res_mixed_basis["findings"]], [MISSING_CODE, CROSS_CODE]
        )
        mixed_axes = [
            a
            for a in res_mixed_basis["axes"]
            if a["subject_ref"] == raw_mixed_basis["claims"][-1]["subject_ref"]
        ]
        self.assertEqual(len(mixed_axes), 1)
        self.assertEqual(mixed_axes[0]["state"], "missing")

    def test_unrelated_provenance_problem_keeps_resolved_target_special_finding(self):
        """L4 activates on a resolved original target match and retains unrelated problems."""
        raw = self._neg02_input()
        raw["knowledge_records"][0]["provenance_refs"][-1]["extra"] = 1
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"])
        self.assertEqual(validated["input_issues"], [])

        from descriptor_target_reader import read_descriptor_replacement_target

        target_read = read_descriptor_replacement_target(
            validated, raw["claims"][-1], f"/claims/{len(raw['claims']) - 1}"
        )
        self.assertEqual(target_read["state"], "resolved")
        self.assertEqual(len(target_read["matches"]), 1)
        self.assertEqual(
            target_read["matches"][0]["declaration_locators"],
            ["/sources/5/content/descriptor_targets/0"],
        )
        self.assertEqual(
            target_read["problems"],
            [
                {
                    "kind": "owner_source_unresolved",
                    "locator": "/knowledge_records/0/provenance_refs/0",
                    "reason": "同knowledge原record/provenanceから既存資格を満たすowner sourceへ解決できない。原所在と不足を保持する。",
                    "source_ref": {"presence": "absent"},
                }
            ],
        )

        result = compare_descriptor_definitions({"validated": validated})
        self.assertEqual(
            [finding["code"] for finding in result["findings"]],
            [MISSING_CODE, CROSS_CODE],
        )
        cross = next(
            finding for finding in result["findings"] if finding["code"] == CROSS_CODE
        )
        self.assertEqual(cross["axis"], "required field.definition")
        self.assertEqual(cross["state"], "missing")
        self.assertEqual(cross["reason"], CROSS_FIELD_REASON)
        self.assertEqual(cross["backflow_owner"], "knowledge_owner")
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated["input"], raw_before)

    def test_base_control_preserves_unknown_without_substitution(self):
        result = self._compare(copy.deepcopy(self.base))
        codes = [f["code"] for f in result["findings"]]
        self.assertNotIn(CROSS_CODE, codes)
        self.assertNotIn(MISSING_CODE, codes)
        # 元fixtureの未解決source/意味を全体knownへ修復しない部分対照。
        self.assertTrue(
            any(
                a["binding"] == self.original_binding
                and a["axis"] == "required field.definition"
                and a["state"] == "unknown"
                for a in result["axes"]
            )
        )


if __name__ == "__main__":
    unittest.main()
