"""FN1 same-call walkの閉shape、原event coverageとnative readを固定する。

期待はL5 /descriptor_target_dataflow/index_types、
/definition_meaning_core/serialization_completion、/na_public_projection、
/call_return_closure/problem_emission_table と L4 の固定normative snapshotから導く。
既存public fn1のComparison全値は別契約のため、このtestの正規期待には使わない。
"""

from __future__ import annotations

import copy
import json
import unittest
from pathlib import Path

from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import compare_descriptor_definitions, validate_supply_input
from identity_input_fixtures import trace_input
from supply_input_fixtures import base_input, load_document


REPO_ROOT = Path(__file__).resolve().parents[5]
L4_PATH = REPO_ROOT / "docs/helix-brain/L4-basic-design/template-semantic-supply.json"
WALK_FIELDS = {"evaluation", "native_material", "target_reads", "intent_reads"}
EVALUATION_FIELDS = {"comparison", "assessments"}
COMPARISON_FIELDS = {"axes", "findings", "producer_symbol", "input_binding"}
ASSESSMENT_FIELDS = {
    "key", "state", "origin_branch", "slot_locators", "fact_locators",
    "comparison_axis_indices", "comparison_finding_indices", "original_axes", "axis_name",
}
KEY_FIELDS = {"binding", "slot_identity", "descriptor_kind"}
ORIGIN_FIELDS = {
    "ordinal", "assessment_key", "branch", "state", "cause", "slot_locators",
    "fact_locators", "meaning_read_indices", "applicability_read_indices",
    "subject_ref", "binding", "axis_name", "original_refs", "reason",
    "backflow_owner", "finding_rule_indices", "sort_source_refs",
    "special_read_indices", "pair_origin_links", "applicability_judgment_links",
    "meaning_support_links", "meaning_problem_links", "special_support_links",
}
NATIVE_FIELDS = {
    "meaning_reads", "applicability_reads", "special_reads", "judgment_origins",
    "pair_reads", "applicability_judgment_batches", "meaning_read_origins",
}
MEANING_READ_FIELDS = {
    "slot_locator", "fact_locator", "binding", "normative_frame", "acquisition_state",
    "occurrences", "supports", "problems",
}
MEANING_PROBLEM_FIELDS = {
    "cause", "source_ref", "source_index", "locator", "original_value", "reason",
}
APPLICABILITY_READ_FIELDS = {
    "slot_locator", "request", "acquisition_state", "source_occurrences", "supports", "problems",
}


def _resolve_json_pointer(value, pointer):
    if pointer == "":
        return value
    if not isinstance(pointer, str) or not pointer.startswith("/"):
        raise AssertionError(f"expected absolute RFC6901 locator, got {pointer!r}")
    current = value
    for token in pointer[1:].split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        if isinstance(current, list):
            current = current[int(token)]
        elif isinstance(current, dict):
            current = current[token]
        else:
            raise AssertionError(f"locator {pointer!r} crosses a scalar")
    return current


def _presence(value, supplied=True):
    return {"presence": "supplied", "value": copy.deepcopy(value)} if supplied else {"presence": "absent"}


class TestDescriptorDefinitionWalk(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.l4 = json.loads(L4_PATH.read_text(encoding="utf-8"))
        cls.snapshot = cls.l4["definition_meaning_resolution_contract"]["normative_basis_snapshot"]

    def _call(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"], "setup: selected input decodes")
        self.assertEqual(validated["input_issues"], [])
        validated_before = copy.deepcopy(validated)

        # Public fn1 remains a same-v compatibility observation, not the L5 canonical oracle.
        public_fn1 = compare_descriptor_definitions({"validated": validated})
        self.assertEqual(public_fn1["producer_symbol"], "compare_descriptor_definitions")
        self.assertEqual(public_fn1["input_binding"], raw_before["binding"])
        public_fn1_before = copy.deepcopy(public_fn1)

        walk = evaluate_descriptor_definition_walk({"validated": validated})
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(public_fn1, public_fn1_before)
        return raw_before, validated_before, walk

    def _expected_frame(self, descriptor_kind):
        entry = next(
            entry for entry in self.snapshot["entries"]
            if entry["value"]["descriptor"] == descriptor_kind
        )
        return {
            "revision": self.snapshot["revision"],
            "path": self.snapshot["path"],
            "file_sha256": self.snapshot["file_sha256"],
            "catalog_pointer": self.snapshot["pointer"],
            "catalog_canonical_sha256": self.snapshot["canonical_sha256"],
            "scope": copy.deepcopy(self.snapshot["scope"]),
            "entry_pointer": entry["pointer"],
            "entry_canonical_sha256": entry["canonical_sha256"],
            "entry_value": copy.deepcopy(entry["value"]),
        }

    def _assert_walk_closure_and_coverage(self, raw, walk, expected_meaning_cause):
        self.assertIsInstance(walk, dict)
        self.assertEqual(set(walk), WALK_FIELDS)
        evaluation = walk["evaluation"]
        native = walk["native_material"]
        self.assertEqual(set(evaluation), EVALUATION_FIELDS)
        self.assertEqual(set(native), NATIVE_FIELDS)
        comparison = evaluation["comparison"]
        self.assertEqual(set(comparison), COMPARISON_FIELDS)
        self.assertEqual(comparison["producer_symbol"], "compare_descriptor_definitions")
        self.assertEqual(comparison["input_binding"], raw["binding"])
        for member in NATIVE_FIELDS:
            self.assertIsInstance(native[member], list, f"native member {member} is returned even when empty")

        assessments = evaluation["assessments"]
        origins = native["judgment_origins"]
        self.assertIsInstance(assessments, list)
        self.assertEqual(len(assessments), len(origins))
        for index, (assessment, origin) in enumerate(zip(assessments, origins)):
            self.assertEqual(set(assessment), ASSESSMENT_FIELDS)
            self.assertEqual(set(assessment["key"]), KEY_FIELDS)
            self.assertEqual(set(origin), ORIGIN_FIELDS)
            self.assertEqual(origin["ordinal"], index)
            self.assertEqual(origin["assessment_key"], assessment["key"])
            self.assertEqual(origin["branch"], assessment["origin_branch"])
            self.assertEqual(origin["state"], assessment["state"])
            self.assertEqual(origin["slot_locators"], assessment["slot_locators"])
            self.assertEqual(origin["fact_locators"], assessment["fact_locators"])
            self.assertEqual(origin["axis_name"], assessment["axis_name"])
            self.assertEqual(
                assessment["original_axes"],
                [comparison["axes"][i] for i in assessment["comparison_axis_indices"]],
            )
            for axis_index in assessment["comparison_axis_indices"]:
                self.assertIsInstance(axis_index, int)
                self.assertGreaterEqual(axis_index, 0)
                self.assertLess(axis_index, len(comparison["axes"]))
            for finding_index in assessment["comparison_finding_indices"]:
                self.assertIsInstance(finding_index, int)
                self.assertGreaterEqual(finding_index, 0)
                self.assertLess(finding_index, len(comparison["findings"]))
            for locator in assessment["slot_locators"] + assessment["fact_locators"]:
                self.assertIsInstance(_resolve_json_pointer(raw, locator), dict)

        expected_facts = {}
        expected_slots = {}
        expected_kinds = {}
        for slot_index, slot in enumerate(raw["descriptors"]):
            slot_locator = f"/descriptors/{slot_index}"
            expected_slots[slot_locator] = slot
            expected_kinds[slot_locator] = slot["descriptor_kind"]
            for fact_index, fact in enumerate(slot["facts"]):
                fact_locator = f"{slot_locator}/facts/{fact_index}"
                expected_facts[fact_locator] = (slot_locator, slot, fact)

        definition_assessments = [
            item for item in assessments if item["axis_name"].endswith(".definition")
        ]
        attribution_assessments = [
            item for item in assessments if item["axis_name"] == "descriptor.attribution"
        ]
        applicability_assessments = [
            item for item in assessments if item["axis_name"].endswith(".definition_applicability")
        ]
        self.assertEqual(
            {fact for item in definition_assessments for fact in item["fact_locators"]},
            set(expected_facts),
            "each raw fact has its own primary definition event",
        )
        for fact_locator, (slot_locator, slot, _fact) in expected_facts.items():
            fact = _fact
            rows = [item for item in definition_assessments if fact_locator in item["fact_locators"]]
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["slot_locators"], [slot_locator])
            self.assertEqual(rows[0]["axis_name"], f"{slot['descriptor_kind']}.definition")
            self.assertEqual(rows[0]["state"], "unknown")
            self.assertEqual(rows[0]["origin_branch"], "source_unresolved")
            self.assertEqual(len(rows[0]["original_axes"]), 1)
            axis = rows[0]["original_axes"][0]
            self.assertEqual(axis["axis"], f"{slot['descriptor_kind']}.definition")
            self.assertEqual(axis["state"], "unknown")
            self.assertEqual(axis["subject_ref"], fact["ref"])
            self.assertEqual(axis["binding"], slot["binding"])
            self.assertEqual(axis["original_refs"], [fact["ref"], fact["source_ref"]])
            self.assertEqual(
                axis["reason"],
                "当該原意味のsource又は規範に対するowner原解釈を解決できない。元原因と所在を保持する。",
            )

        self.assertEqual(
            {loc for item in attribution_assessments for loc in item["slot_locators"]},
            set(expected_slots),
            "attribution events remain separate from definition events",
        )
        self.assertEqual(
            {loc for item in applicability_assessments for loc in item["slot_locators"]},
            set(expected_slots),
            "each explicit-null applicability request produces its own NA event",
        )
        for item in applicability_assessments:
            self.assertEqual(item["state"], "unknown")
            self.assertEqual(item["origin_branch"], "source_unresolved")
            slot_locator = item["slot_locators"][0]
            self.assertEqual(item["axis_name"], f"{expected_kinds[slot_locator]}.definition_applicability")

        meaning_reads = native["meaning_reads"]
        self.assertEqual(len(meaning_reads), len(expected_facts))
        self.assertEqual(
            {(read["slot_locator"], read["fact_locator"]) for read in meaning_reads},
            {(slot_locator, fact_locator) for fact_locator, (slot_locator, _slot, _fact) in expected_facts.items()},
        )
        for read in meaning_reads:
            self.assertEqual(set(read), MEANING_READ_FIELDS)
            self.assertEqual(read["normative_frame"], self._expected_frame(expected_facts[read["fact_locator"]][1]["descriptor_kind"]))
            self.assertEqual(read["acquisition_state"], "unknown")
            self.assertEqual(read["occurrences"], [])
            self.assertEqual(read["supports"], [])
            self.assertEqual(len(read["problems"]), 1)
            problem = read["problems"][0]
            self.assertEqual(set(problem), MEANING_PROBLEM_FIELDS)
            self.assertEqual(problem["cause"], expected_meaning_cause)
            self.assertEqual(problem["source_index"], 0)
            self.assertEqual(problem["reason"], (
                "当該原source又はその既存owner資格を解決できない。"
                if expected_meaning_cause == "source_unresolved"
                else "当該原sourceの要求されたcarrier memberが供給されていない。"
            ))
            if expected_meaning_cause == "source_unresolved":
                self.assertEqual(problem["locator"], "/sources/0")
                self.assertEqual(problem["original_value"], _presence(raw["sources"][0]))
            else:
                self.assertEqual(problem["locator"], "/sources/0/content/definition_meaning_operations")
                self.assertEqual(problem["original_value"], {"presence": "absent"})

        applicability_reads = native["applicability_reads"]
        self.assertEqual(len(applicability_reads), len(expected_slots))
        self.assertEqual(
            {read["slot_locator"] for read in applicability_reads}, set(expected_slots)
        )
        for read in applicability_reads:
            self.assertEqual(set(read), APPLICABILITY_READ_FIELDS)
            self.assertEqual(read["request"], _presence(None))
            self.assertEqual(read["acquisition_state"], "unknown")
            self.assertEqual(read["source_occurrences"], [])
            self.assertEqual(read["supports"], [])
            self.assertEqual(len(read["problems"]), 1)
            problem = read["problems"][0]
            self.assertEqual(problem["cause"], "applicability_request_null")
            self.assertEqual(problem["source_index"], None)
            self.assertEqual(problem["locator"], read["slot_locator"] + "/definition_applicability_ref")
            self.assertEqual(problem["original_value"], _presence(None))
            self.assertEqual(problem["reason"], "定義非適用の原参照が明示nullであり、当該原判断を解決できない。")

        self.assertEqual(len(native["applicability_judgment_batches"]), len(expected_slots))
        for batch in native["applicability_judgment_batches"]:
            self.assertEqual(set(batch), {"applicability_read_index", "slot_locator", "judgments"})
            self.assertEqual(batch["slot_locator"] in expected_slots, True)
            self.assertIsInstance(batch["applicability_read_index"], int)
            self.assertEqual(len(batch["judgments"]), 1)
            judgment = batch["judgments"][0]
            self.assertEqual(set(judgment), {
                "state", "origin_branch", "cause", "axis", "reason", "source_refs",
                "subject_ref", "binding", "backflow_owner", "slot_locator", "record_locator",
            })
            self.assertEqual(judgment["state"], "unknown")
            self.assertEqual(judgment["origin_branch"], "source_unresolved")
            self.assertEqual(judgment["cause"], "applicability_request_null")
            self.assertEqual(judgment["axis"], f"{expected_kinds[batch['slot_locator']]}.definition_applicability")
            self.assertEqual(judgment["reason"], "定義非適用の原参照が明示nullであり、当該原判断を解決できない。")
            self.assertEqual(judgment["source_refs"], [])
            self.assertEqual(judgment["slot_locator"], batch["slot_locator"])
            self.assertIsNone(judgment["record_locator"])

        self.assertEqual(walk["target_reads"], [], "no raw Claim means no target reader invocation")
        self.assertEqual(walk["intent_reads"], [], "no raw Claim means no intent reader invocation")

    def test_l7_normal_keeps_digest_mismatch_as_source_unresolved(self):
        """L7 normalを修復せず、既知のsource/provenance digest差を直接原因として保持する。"""
        raw = base_input(load_document())
        self.assertEqual(raw["claims"], [])
        self.assertNotEqual(
            raw["knowledge_records"][0]["provenance_refs"][0]["sha256"],
            raw["sources"][0]["ref"]["sha256"],
        )
        _raw, _validated, walk = self._call(raw)
        self._assert_walk_closure_and_coverage(raw, walk, "source_unresolved")

    def test_independent_trace_input_reaches_missing_meaning_carrier(self):
        """別構成したtrace inputでsource資格を揃え、carrier absenceを観測する。"""
        raw = trace_input()
        source_ref = raw["sources"][0]["ref"]
        self.assertEqual(raw["knowledge_records"][0]["provenance_refs"][0], source_ref)
        self.assertNotIn("definition_meaning_operations", raw["sources"][0]["content"])
        _raw, _validated, walk = self._call(raw)
        self._assert_walk_closure_and_coverage(raw, walk, "container_absent")

    def test_decode_error_keeps_four_field_empty_walk(self):
        """L5 invalid raw: fn0のnull inputを空のsame-call walkとして保持する。"""
        raw = 7
        validated = validate_supply_input(raw)
        self.assertIsNone(validated["input"])
        self.assertEqual(len(validated["input_issues"]), 1)
        validated_before = copy.deepcopy(validated)
        walk = evaluate_descriptor_definition_walk({"validated": validated})
        self.assertEqual(set(walk), WALK_FIELDS)
        self.assertEqual(set(walk["evaluation"]), EVALUATION_FIELDS)
        self.assertEqual(
            walk["evaluation"]["comparison"],
            {
                "axes": [], "findings": [],
                "producer_symbol": "compare_descriptor_definitions", "input_binding": None,
            },
        )
        self.assertEqual(walk["evaluation"]["assessments"], [])
        self.assertEqual(set(walk["native_material"]), NATIVE_FIELDS)
        self.assertTrue(all(walk["native_material"][member] == [] for member in NATIVE_FIELDS))
        self.assertEqual(walk["target_reads"], [])
        self.assertEqual(walk["intent_reads"], [])
        self.assertEqual(validated, validated_before)
        self.assertEqual(validated["input_issues"][0]["locator"], "")
        self.assertEqual(validated["input_issues"][0]["source_ref"], None)


if __name__ == "__main__":
    unittest.main()
