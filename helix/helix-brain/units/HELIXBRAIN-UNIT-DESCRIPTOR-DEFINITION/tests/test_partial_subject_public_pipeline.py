"""partial root subjectでの実FN0→FN1→FN6投影と同snapshot保持。

根拠:
- L4 #/definition_meaning_resolution_contract/evaluation_populations と
  #/definition_meaning_resolution_contract/consumer_branch_table
- L4 #/dependency_semantic_ports/public_projection/dependency_subject,/order
- L4 #/identity_version_trace_contract/schema/$defs/Comparison
- L5 #/functions/1 と
  #/source_return_contract/descriptor_target_dataflow/definition_meaning_core/
  reason_and_subject_contract

zero profileはinput=nullのinvalid_raw fallbackではない。実fn0が保持したpartial
Bindingと、event発生元が無いことを同時に確認し、空軸をknown/resolvedの証拠にしない。
この2profileだけで全canonical frame評価や全L3意味の完成は主張しない。
"""

from __future__ import annotations

import copy
import unittest

from dependencies_handoff import compare_dependencies_and_handoff
from descriptor_definitions import compare_descriptor_definitions, validate_supply_input
from supply_input_fixtures import base_input, load_document


R105 = "HELIXBRAIN-L5-032-R-required_dependency_missing"
R106 = "HELIXBRAIN-L5-032-R-dependency_selector_unknown"
HANDOFF_REASON_PREFIX = "受渡しstateを原recordから保持。"


def _zero_profile(*, remove_template_ref: bool) -> dict:
    raw = base_input(load_document())
    raw["descriptors"] = []
    raw["required_descriptor_kinds"] = []
    raw["relations"] = []
    raw["meaning_comparisons"] = []
    raw["claims"] = []
    raw["candidates"] = []
    del raw["dependencies"]
    raw["binding"].pop("knowledge_ref")
    if remove_template_ref:
        raw["binding"].pop("template_ref")
    return raw


def _run_fn0_fn1(raw: dict) -> tuple[dict, dict, dict, dict]:
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    validated_before = copy.deepcopy(validated)
    if validated["input"] is None or validated["input_issues"]:
        raise AssertionError("setup: FN0 must preserve the decode-valid partial snapshot")
    definitions = compare_descriptor_definitions({"validated": validated})
    if raw != raw_before or validated != validated_before:
        raise AssertionError("FN0/FN1 must preserve the original same-call snapshot")
    return raw_before, validated, validated_before, definitions


class TestPartialSubjectPublicPipeline(unittest.TestCase):
    def _assert_empty_fn1_comparison(self, raw: dict, definitions: dict) -> None:
        self.assertEqual(list(definitions), [
            "axes", "findings", "producer_symbol", "input_binding",
        ])
        self.assertEqual(definitions["axes"], [])
        self.assertEqual(definitions["findings"], [])
        self.assertEqual(definitions["producer_symbol"], "compare_descriptor_definitions")
        self.assertEqual(definitions["input_binding"], raw["binding"])

    def test_template_ref_fallback_projects_missing_dependencies_and_preserves_handoff(self) -> None:
        raw = _zero_profile(remove_template_ref=False)
        raw_before, validated, validated_before, definitions = _run_fn0_fn1(raw)
        self._assert_empty_fn1_comparison(raw_before, definitions)

        definitions_before = copy.deepcopy(definitions)
        result = compare_dependencies_and_handoff({
            "validated": validated,
            "definitions": definitions,
        })

        template_subject = raw_before["binding"]["template_ref"]
        self.assertEqual(result["producer_symbol"], "compare_dependencies_and_handoff")
        self.assertEqual(list(result), ["axes", "findings", "producer_symbol", "input_binding"])
        self.assertEqual(result["input_binding"], raw_before["binding"])
        self.assertEqual(
            [row["axis"] for row in result["axes"]],
            ["dependency_reference"] * 5 + ["dependency_selection"] * 3
            + ["handoff"] * len(raw_before["handoff_records"]),
        )
        dependency_axes = result["axes"][:8]
        for axis in dependency_axes:
            self.assertEqual(axis["subject_ref"], template_subject)
            self.assertEqual(axis["binding"], raw_before["binding"])
        self.assertEqual([row["state"] for row in dependency_axes[:5]], ["missing"] * 5)
        self.assertEqual([row["state"] for row in dependency_axes[5:]], ["unknown"] * 3)
        self.assertEqual(
            [row["rule_ref"] for row in result["findings"]],
            [R105] * 5 + [R106] * 3,
        )
        handoff_axes = result["axes"][8:]
        self.assertEqual(len(handoff_axes), len(raw_before["handoff_records"]))
        for axis, record in zip(handoff_axes, raw_before["handoff_records"]):
            self.assertEqual(axis["subject_ref"], record["subject_ref"])
            self.assertEqual(axis["binding"], record["binding"])
            self.assertEqual(axis["state"], record["state"])
            self.assertEqual(axis["original_refs"], [record["source_ref"]])
            self.assertTrue(axis["reason"].startswith(HANDOFF_REASON_PREFIX))

        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(definitions, definitions_before)

    def test_no_subject_ref_keeps_fn6_handoff_without_typed_dependency_rows(self) -> None:
        raw = _zero_profile(remove_template_ref=True)
        raw_before, validated, validated_before, definitions = _run_fn0_fn1(raw)
        self._assert_empty_fn1_comparison(raw_before, definitions)

        definitions_before = copy.deepcopy(definitions)
        result = compare_dependencies_and_handoff({
            "validated": validated,
            "definitions": definitions,
        })

        self.assertEqual(result["producer_symbol"], "compare_dependencies_and_handoff")
        self.assertEqual(result["input_binding"], raw_before["binding"])
        self.assertEqual(result["findings"], [])
        self.assertEqual(len(result["axes"]), len(raw_before["handoff_records"]))
        for axis, record in zip(result["axes"], raw_before["handoff_records"]):
            self.assertEqual(axis["axis"], "handoff")
            self.assertEqual(axis["subject_ref"], record["subject_ref"])
            self.assertEqual(axis["binding"], record["binding"])
            self.assertEqual(axis["state"], record["state"])
            self.assertEqual(axis["original_refs"], [record["source_ref"]])
            self.assertTrue(axis["reason"].startswith(HANDOFF_REASON_PREFIX))

        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(definitions, definitions_before)

    def test_actual_slots_with_partial_root_binding_keep_existing_fn1_stop(self) -> None:
        for remove_template_ref in (False, True):
            with self.subTest(remove_template_ref=remove_template_ref):
                raw = base_input(load_document())
                raw["binding"].pop("knowledge_ref")
                if remove_template_ref:
                    raw["binding"].pop("template_ref")
                raw_before = copy.deepcopy(raw)
                validated = validate_supply_input(raw)
                self.assertIsNotNone(validated["input"])
                self.assertEqual(validated["input_issues"], [])
                validated_before = copy.deepcopy(validated)

                with self.assertRaises(NotImplementedError) as caught:
                    compare_descriptor_definitions({"validated": validated})
                self.assertTrue(str(caught.exception).startswith(
                    "F02/descriptor_slot_binding_unresolved:"
                ))
                self.assertIn("Backflow HELIXBRAIN-L6-032-N03-PATH", str(caught.exception))
                self.assertEqual(raw, raw_before)
                self.assertEqual(validated, validated_before)

    def test_fn6_rejects_changed_input_binding_in_real_fn1_comparison(self) -> None:
        raw = _zero_profile(remove_template_ref=False)
        raw_before, validated, validated_before, definitions = _run_fn0_fn1(raw)
        self.assertEqual(definitions["producer_symbol"], "compare_descriptor_definitions")
        self.assertEqual(definitions["input_binding"], raw_before["binding"])

        definitions_before = copy.deepcopy(definitions)
        mismatched_definitions = copy.deepcopy(definitions)
        mismatched_definitions["input_binding"]["template_ref"]["revision"] = (
            "failure-injection-different-revision"
        )
        expected_mismatch = copy.deepcopy(definitions)
        expected_mismatch["input_binding"]["template_ref"]["revision"] = (
            "failure-injection-different-revision"
        )
        self.assertEqual(mismatched_definitions, expected_mismatch)

        with self.assertRaises(NotImplementedError) as caught:
            compare_dependencies_and_handoff({
                "validated": validated,
                "definitions": mismatched_definitions,
            })
        self.assertEqual(
            str(caught.exception),
            "B02/F09/definitions_comparison_mismatch: definitions must be the same-snapshot "
            "fn1 Comparison; Backflow HELIXBRAIN-L6-032-B02-FN6-PATH",
        )
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(definitions, definitions_before)


if __name__ == "__main__":
    unittest.main()
