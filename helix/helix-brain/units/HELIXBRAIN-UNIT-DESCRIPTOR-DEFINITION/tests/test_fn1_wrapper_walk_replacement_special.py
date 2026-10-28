"""FN1 same-walk replacement special-read schedule and public projection.

Authority:
- L4 /dependency_semantic_ports/descriptor_target_contract/replacement_special
- L4 /claim_intent_protocol/rules/4
- L5 /source_return_contract/descriptor_target_dataflow/direct_wrappers/fn1
- L5 /source_return_contract/descriptor_target_dataflow/definition_meaning_core/call_return_closure/replacement_claim_request_schedule
- L5 /source_return_contract/descriptor_target_dataflow/definition_meaning_core/special_source_producers/3
- L5 /source_return_contract/descriptor_target_dataflow/definition_meaning_core/schema/new_defs/DefinitionSpecialRead
- L5 /source_return_contract/descriptor_target_dataflow/definition_meaning_core/call_return_closure/special_event_constructors/constructors/3

This checks the public FN1 path and its same-call native observation. It does not
use a whole-comparison oracle or infer qualification from the fixture label.
"""

from __future__ import annotations

import copy
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

import descriptor_definition_walk
from descriptor_definitions import compare_descriptor_definitions, validate_supply_input
from supply_input_fixtures import base_input, load_document
import test_descriptor_definitions
from identity_input_fixtures import normal_input


MISSING_CODE = "descriptor_07_missing"
CROSS_CODE = "cross_pattern_field_substitution"
CROSS_RULE = "HELIXBRAIN-L5-032-R-cross_pattern_field_substitution"
CROSS_REASON = "当該required fieldの定義不足を別Patternのrequired inputで補うことはできない。"


class TestFN1WrapperWalkReplacementSpecial(unittest.TestCase):
    def _cross_pattern_raw(self) -> dict:
        fixture = test_descriptor_definitions.TestDescriptorDefinitions(
            "test_neg02_cross_pattern_field_substitution"
        )
        fixture.setUp()
        return fixture._neg02_input()

    def test_fill_occurrences_are_read_once_in_order_and_only_supported_positive_projects(self):
        raw = self._cross_pattern_raw()
        primary_claim = copy.deepcopy(raw["claims"][0])

        negative_intent = copy.deepcopy(primary_claim)
        negative_intent["proposed_value"] = False
        negative_intent["basis_refs"] = []

        unresolved_target = copy.deepcopy(primary_claim)
        unresolved_target["subject_ref"]["identity"] = "SYNTHETIC-UNMATCHED-TARGET"
        unresolved_target.pop("proposed_value")
        unresolved_target.pop("basis_refs")
        raw["claims"] = [primary_claim, negative_intent, unresolved_target]
        raw_before = copy.deepcopy(raw)

        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"])
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], raw_before)
        validated_before = copy.deepcopy(validated)

        captured_walks = []
        real_walk = descriptor_definition_walk.evaluate_descriptor_definition_walk

        def capture_walk(context):
            result = real_walk(context)
            captured_walks.append(result)
            return result

        reader_calls = []
        old_profile = sys.getprofile()

        def profile(frame, event, arg):
            if (
                event == "call"
                and frame.f_code.co_name == "read_definition_special_support"
                and Path(frame.f_code.co_filename).name.endswith(".py")
            ):
                reader_calls.append(
                    (
                        frame.f_locals.get("validated"),
                        copy.deepcopy(frame.f_locals.get("request")),
                    )
                )
            if old_profile is not None:
                old_profile(frame, event, arg)

        try:
            sys.setprofile(profile)
            with patch.object(
                descriptor_definition_walk,
                "evaluate_descriptor_definition_walk",
                side_effect=capture_walk,
            ):
                try:
                    result = compare_descriptor_definitions({"validated": validated})
                except NotImplementedError as exc:
                    self.fail(f"public FN1 must preserve this wire-valid input: {exc}")
        finally:
            sys.setprofile(old_profile)

        failures = []

        def check(label, actual, expected):
            if actual != expected:
                failures.append(f"{label}: expected {expected!r}, got {actual!r}")

        check("same-call walk count", len(captured_walks), 1)
        expected_requests = [
            {"request_kind": "replacement_claim", "request_locator": f"/claims/{i}"}
            for i in range(3)
        ]
        check("special reader call count", len(reader_calls), 3)
        check("special reader ValidatedSupply identity", all(call[0] is validated for call in reader_calls), True)
        check("special reader request order", [call[1] for call in reader_calls], expected_requests)

        walk = captured_walks[0] if captured_walks else None
        reads = walk["native_material"]["special_reads"] if walk is not None else []
        check("saved special-read count", len(reads), 3)
        if len(reads) == 3:
            check("saved request order", [read.get("request") for read in reads], expected_requests)
            expected_fields = [
                "request",
                "acquisition_state",
                "source_occurrences",
                "supports",
                "problems",
            ]
            for index, read in enumerate(reads):
                check(f"special-read {index} field order", list(read), expected_fields)
                for occurrence_index, occurrence in enumerate(read.get("source_occurrences", [])):
                    check(
                        f"special-read {index} occurrence {occurrence_index} field order",
                        list(occurrence),
                        ["source_ref", "source_index", "record_index", "locator", "original_record"],
                    )
                for support_index, support in enumerate(read.get("supports", [])):
                    check(
                        f"special-read {index} support {support_index} field order",
                        list(support),
                        ["source_ref", "source_index", "record_index", "locator", "support_kind", "record"],
                    )

            source_index = next(
                index
                for index, source in enumerate(raw_before["sources"])
                if isinstance(source, dict)
                and isinstance(source.get("content"), dict)
                and "replacement_basis_uses" in source["content"]
            )
            source = raw_before["sources"][source_index]
            use = source["content"]["replacement_basis_uses"][0]
            occurrence_locator = f"/sources/{source_index}/content/replacement_basis_uses/0"
            expected_occurrence = {
                "source_ref": source["ref"],
                "source_index": source_index,
                "record_index": 0,
                "locator": occurrence_locator,
                "original_record": use,
            }
            check("positive read acquisition", reads[0].get("acquisition_state"), "resolved")
            check("positive raw occurrence", reads[0].get("source_occurrences"), [expected_occurrence])
            check(
                "positive typed support",
                reads[0].get("supports"),
                [{
                    "source_ref": source["ref"],
                    "source_index": source_index,
                    "record_index": 0,
                    "locator": occurrence_locator,
                    "support_kind": "replacement_claim",
                    "record": use,
                }],
            )
            check("positive read problems", reads[0].get("problems"), [])
            for index in (1, 2):
                check(f"nonfiring read {index} acquisition", reads[index].get("acquisition_state"), "unknown")
                check(f"nonfiring read {index} occurrences", reads[index].get("source_occurrences"), [])
                check(f"nonfiring read {index} supports", reads[index].get("supports"), [])

        finding_codes = [finding["code"] for finding in result["findings"]]
        check("one original required-field missing finding", finding_codes.count(MISSING_CODE), 1)
        check("one supported positive cross-pattern finding", finding_codes.count(CROSS_CODE), 1)
        cross = next((f for f in result["findings"] if f["code"] == CROSS_CODE), None)
        if cross is not None:
            for key, expected in {
                "rule_ref": CROSS_RULE,
                "subject_ref": primary_claim["subject_ref"],
                "binding": primary_claim["binding"],
                "axis": "required field.definition",
                "state": "missing",
                "reason": CROSS_REASON,
                "backflow_owner": "knowledge_owner",
            }.items():
                check(f"cross-pattern {key}", cross.get(key), expected)
        else:
            failures.append("cross-pattern expected finding is absent")
        check(
            "unresolved-target claim does not project a typed row",
            any(
                row.get("subject_ref") == unresolved_target["subject_ref"]
                for row in result["axes"] + result["findings"]
            ),
            False,
        )
        check("public producer", result["producer_symbol"], "compare_descriptor_definitions")
        check("public input binding", result["input_binding"], raw_before["binding"])
        check("raw snapshot unchanged", raw, raw_before)
        check("ValidatedSupply unchanged", validated, validated_before)
        self.assertEqual(failures, [], "\n".join(failures))

    def test_raw_distinct_optional_ref_member_is_not_a_public_fn1_stop(self):
        baseline = normal_input()
        baseline_validated = validate_supply_input(baseline)
        self.assertIsNotNone(baseline_validated["input"])
        self.assertEqual(baseline_validated["input_issues"], [])

        for member in ("source_locator", "sha256"):
            with self.subTest(member=member):
                raw = copy.deepcopy(baseline)
                del raw["binding"]["template_ref"][member]
                raw_before = copy.deepcopy(raw)
                validated = validate_supply_input(raw)
                self.assertIsNotNone(validated["input"])
                self.assertEqual(validated["input_issues"], [])
                self.assertEqual(validated["input"], raw_before)
                try:
                    result = compare_descriptor_definitions({"validated": validated})
                except NotImplementedError as exc:
                    self.fail(f"FN1 must keep this raw-distinct optional Ref in scope: {exc}")
                self.assertEqual(
                    list(result), ["axes", "findings", "producer_symbol", "input_binding"]
                )
                self.assertEqual(result["producer_symbol"], "compare_descriptor_definitions")
                self.assertEqual(result["input_binding"], raw_before["binding"])
                self.assertIsInstance(result["axes"], list)
                self.assertIsInstance(result["findings"], list)
                self.assertEqual(raw, raw_before)
                self.assertEqual(validated["input"], raw_before)

    def test_unformable_missing_subject_returns_no_typed_row_and_keeps_original_binding(self):
        raw = base_input(load_document())
        raw["descriptors"] = []
        raw["required_descriptor_kinds"] = ["template identity"]
        raw["relations"] = []
        raw["meaning_comparisons"] = []
        raw["claims"] = []
        raw["candidates"] = []
        raw["binding"].pop("knowledge_ref")
        raw["binding"].pop("template_ref")
        raw_before = copy.deepcopy(raw)

        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"])
        self.assertEqual(validated["input_issues"], [])
        try:
            result = compare_descriptor_definitions({"validated": validated})
        except NotImplementedError as exc:
            self.fail(f"FN1 should omit unformable typed rows without stopping: {exc}")
        self.assertEqual(result["axes"], [])
        self.assertEqual(result["findings"], [])
        self.assertEqual(result["producer_symbol"], "compare_descriptor_definitions")
        self.assertEqual(result["input_binding"], raw_before["binding"])
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated["input"], raw_before)


if __name__ == "__main__":
    unittest.main()
