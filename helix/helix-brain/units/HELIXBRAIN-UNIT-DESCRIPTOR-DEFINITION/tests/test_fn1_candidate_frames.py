"""WR66 S2: root and explicit candidate Binding frame boundaries.

Input reuses test_identity_filename_claim._filename_identity_claim_input, then
appends frozen I02 Claim 1. Partial expectations follow L4
/definition_meaning_resolution_contract/evaluation_populations and L5
/source_return_contract/descriptor_target_dataflow/definition_meaning_core:
root requirements stay independent, an explicit candidate frame yields missing
slot events, non-fill Claims do not create target/intent reads, and every walk
event retains its final Comparison index and raw origin. No saved output is used
as a whole-result oracle.
"""

from __future__ import annotations

import copy
import hashlib
import json
import unittest

from descriptor_definitions import compare_descriptor_definitions, validate_supply_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from test_identity_filename_claim import _filename_identity_claim_input

_I02_SHA = "f2b90f1049f5d8b13ff76dc5850c30e6437df6da5384961fcbe1d36ab64a7ae5"
_KINDS = (
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
_COMPARE_FIELDS = {"axes", "findings", "producer_symbol", "input_binding"}
_WALK_FIELDS = {"evaluation", "native_material", "target_reads", "intent_reads"}
_NATIVE_FIELDS = {
    "meaning_reads",
    "applicability_reads",
    "special_reads",
    "judgment_origins",
    "pair_reads",
    "applicability_judgment_batches",
    "meaning_read_origins",
}


def _sha(value):
    text = json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
        allow_nan=False,
    )
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _case():
    raw, source_a, source_b, claim0, candidate_a, candidate_b = (
        _filename_identity_claim_input()
    )
    candidates = copy.deepcopy(raw["candidates"])
    assert candidates == [candidate_a, candidate_b]
    claim1 = {
        "actor": "BRAIN",
        "basis_refs": candidates,
        "binding": copy.deepcopy(raw["binding"]),
        "kind": "absolute_product_choice",
        "proposed_value": copy.deepcopy(candidate_a),
        "subject_ref": copy.deepcopy(candidate_a),
    }
    raw["claims"].append(claim1)
    assert raw["claims"][0] == claim0
    assert _sha(raw) == _I02_SHA, (
        "fixture must reproduce the frozen I02 canonical raw SHA"
    )
    return raw, source_a, source_b, claim0, claim1, candidate_a, candidate_b


def _validated(testcase, raw):
    before = copy.deepcopy(raw)
    result = validate_supply_input(raw)
    testcase.assertEqual(raw, before, "FN0 must preserve caller raw")
    testcase.assertIsNotNone(result["input"], "setup: FN0 must retain frozen I02 input")
    testcase.assertEqual(result["input"], before)
    testcase.assertEqual(result["input_issues"], [])
    testcase.assertEqual(result["unusable_source_refs"], [])
    return result


def _call(testcase, producer, raw, validated):
    raw_before, validated_before = copy.deepcopy(raw), copy.deepcopy(validated)
    result = caught = None
    try:
        result = producer({"validated": validated})
    except Exception as exc:  # turn product exceptions into semantic assertion failures
        caught = exc
    finally:
        testcase.assertEqual(raw, raw_before, "producer must preserve original raw")
        testcase.assertEqual(
            validated, validated_before, "producer must preserve complete FN0 value"
        )
    testcase.assertIsNone(
        caught, f"finite S2 input should return a comparison: {caught!r}"
    )
    return result


def _comparison(testcase, value):
    testcase.assertEqual(set(value), _COMPARE_FIELDS)
    testcase.assertEqual(value["producer_symbol"], "compare_descriptor_definitions")
    return value


def _walk(testcase, raw, validated):
    result = _call(testcase, evaluate_descriptor_definition_walk, raw, validated)
    testcase.assertEqual(set(result), _WALK_FIELDS)
    testcase.assertEqual(set(result["native_material"]), _NATIVE_FIELDS)
    testcase.assertEqual(result["target_reads"], [])  # both I02 claims are non-fill
    testcase.assertEqual(result["intent_reads"], [])
    return result


def _bound_rows(rows, binding):
    return [row for row in rows if row.get("binding") == binding]


def _assessment_rows(walk, binding):
    return [
        row
        for row in walk["evaluation"]["assessments"]
        if row["key"]["binding"] == {"presence": "supplied", "value": binding}
    ]


def _root_projection(comparison, binding):
    return (
        _bound_rows(comparison["axes"], binding),
        _bound_rows(comparison["findings"], binding),
    )


def _assert_b_missing(testcase, comparison, binding_b):
    axes = [row for row in comparison["axes"] if row["binding"] == binding_b]
    findings = [row for row in comparison["findings"] if row["binding"] == binding_b]
    for ordinal, kind in enumerate(_KINDS[1:], start=2):
        code = f"descriptor_{ordinal:02d}_missing"
        matches = [row for row in axes if row["axis"] == f"{kind}.definition"]
        testcase.assertEqual(len(matches), 1)
        testcase.assertEqual(
            {
                k: matches[0][k]
                for k in ("subject_ref", "state", "original_refs", "backflow_owner")
            },
            {
                "subject_ref": binding_b["knowledge_ref"],
                "state": "missing",
                "original_refs": [],
                "backflow_owner": "knowledge_owner",
            },
        )
        matched_findings = [row for row in findings if row["code"] == code]
        testcase.assertEqual(len(matched_findings), 1)
        testcase.assertEqual(
            matched_findings[0]["rule_ref"], f"HELIXBRAIN-L5-032-R-{code}"
        )
        testcase.assertEqual(matched_findings[0]["axis"], f"{kind}.definition")
        testcase.assertEqual(matched_findings[0]["state"], "missing")
        testcase.assertEqual(matched_findings[0]["source_refs"], [])
        testcase.assertEqual(
            matched_findings[0]["subject_ref"], binding_b["knowledge_ref"]
        )
        testcase.assertEqual(matched_findings[0]["backflow_owner"], "knowledge_owner")
        testcase.assertEqual(
            list(matched_findings[0]),
            [
                "code",
                "rule_ref",
                "subject_ref",
                "binding",
                "axis",
                "state",
                "source_refs",
                "reason",
                "backflow_owner",
            ],
        )


class TestFN1CandidateFrames(unittest.TestCase):
    def test_i02_public_fn1_returns_closed_root_and_candidate_b_projection(self):
        """Public FN1 preserves A and emits B's 14 fixed missing kinds."""
        raw, _sa, _sb, claim0, claim1, _candidate_a, _candidate_b = _case()
        before = copy.deepcopy(raw)
        validated = _validated(self, raw)
        result = _comparison(
            self, _call(self, compare_descriptor_definitions, raw, validated)
        )
        binding_b = raw["descriptors"][15]["binding"]
        self.assertEqual(result["input_binding"], before["binding"])
        self.assertEqual(raw["claims"], [claim0, claim1])
        self.assertTrue(
            _bound_rows(result["axes"], before["binding"]),
            "root A projection must remain",
        )
        _assert_b_missing(self, result, binding_b)

    def test_walk_keeps_b_original_slot_and_links_fourteen_missing_events_to_final_axes(
        self,
    ):
        """B's absent kinds inherit the fixed root contract; the real slot keeps its own provenance."""
        raw, _sa, _sb, _claim0, claim1, candidate_a, candidate_b = _case()
        before = copy.deepcopy(raw)
        validated = _validated(self, raw)
        walk = _walk(self, raw, validated)
        comparison = _comparison(self, walk["evaluation"]["comparison"])
        assessments = walk["evaluation"]["assessments"]
        origins = walk["native_material"]["judgment_origins"]
        binding_b = raw["descriptors"][15]["binding"]
        self.assertEqual(comparison["input_binding"], before["binding"])
        self.assertEqual(raw["claims"][1], claim1)
        self.assertEqual(raw["candidates"], [candidate_a, candidate_b])
        self.assertEqual(raw["required_descriptor_kinds"], list(_KINDS))
        self.assertEqual(
            len(
                [
                    r
                    for r in assessments
                    if r["key"]["binding"]
                    == {"presence": "supplied", "value": binding_b}
                    and r["origin_branch"] == "required_slot_absent"
                ]
            ),
            14,
        )
        _assert_b_missing(self, comparison, binding_b)
        self.assertEqual(len(origins), len(assessments))
        root_indices = [
            i
            for i, row in enumerate(assessments)
            if row["key"]["binding"]
            == {"presence": "supplied", "value": raw["binding"]}
        ]
        b_indices = [
            i
            for i, row in enumerate(assessments)
            if row["key"]["binding"] == {"presence": "supplied", "value": binding_b}
        ]
        self.assertTrue(root_indices)
        self.assertTrue(b_indices)
        self.assertLess(max(root_indices), min(b_indices))
        self.assertEqual(
            {assessments[i]["key"]["descriptor_kind"] for i in root_indices},
            set(_KINDS),
        )
        fact_rows = [
            row
            for row in _assessment_rows(walk, binding_b)
            if row["fact_locators"] == ["/descriptors/15/facts/0"]
        ]
        self.assertTrue(fact_rows)
        b_meaning_reads = [
            read
            for read in walk["native_material"]["meaning_reads"]
            if read["slot_locator"] == "/descriptors/15"
            and read["fact_locator"] == "/descriptors/15/facts/0"
        ]
        self.assertEqual(len(b_meaning_reads), 1)

        for ordinal, assessment in enumerate(assessments):
            origin = origins[ordinal]
            self.assertEqual(origin["ordinal"], ordinal)
            self.assertEqual(origin["assessment_key"], assessment["key"])
            self.assertEqual(
                assessment["original_axes"],
                [comparison["axes"][i] for i in assessment["comparison_axis_indices"]],
            )
            if assessment["key"]["binding"] != {
                "presence": "supplied",
                "value": binding_b,
            }:
                continue
            if assessment["origin_branch"] == "required_slot_absent":
                self.assertEqual(len(assessment["comparison_axis_indices"]), 1)
                self.assertEqual(len(assessment["comparison_finding_indices"]), 1)
                axis_index = assessment["comparison_axis_indices"][0]
                finding_index = assessment["comparison_finding_indices"][0]
                self.assertEqual(
                    comparison["axes"][axis_index]["axis"], assessment["axis_name"]
                )
                self.assertEqual(
                    comparison["findings"][finding_index]["axis"],
                    assessment["axis_name"],
                )
                self.assertEqual(
                    origin["finding_rule_indices"],
                    [9 + 3 * _KINDS.index(assessment["key"]["descriptor_kind"])],
                )
                self.assertEqual(assessment["slot_locators"], [])
                self.assertEqual(assessment["fact_locators"], [])
                self.assertEqual(origin["branch"], "required_slot_absent")
                self.assertEqual(origin["slot_locators"], [])
                self.assertEqual(origin["fact_locators"], [])
                self.assertEqual(
                    origin["subject_ref"],
                    {"presence": "supplied", "value": binding_b["knowledge_ref"]},
                )
                for finding_index in assessment["comparison_finding_indices"]:
                    self.assertEqual(
                        comparison["findings"][finding_index]["state"], "missing"
                    )
                continue
            if "/descriptors/15" in assessment["slot_locators"]:
                self.assertEqual(origin["slot_locators"], assessment["slot_locators"])
                self.assertEqual(origin["fact_locators"], assessment["fact_locators"])
                self.assertEqual(
                    origin["binding"], {"presence": "supplied", "value": binding_b}
                )
                for locator in origin["fact_locators"]:
                    self.assertTrue(locator.startswith("/descriptors/15/facts/"))
                for read_index in origin["meaning_read_indices"]:
                    read = walk["native_material"]["meaning_reads"][read_index]
                    self.assertEqual(read["slot_locator"], "/descriptors/15")
                    self.assertTrue(
                        read["fact_locator"].startswith("/descriptors/15/facts/")
                    )
        self.assertTrue(
            any(
                r["slot_locators"] == ["/descriptors/15"]
                for r in _assessment_rows(walk, binding_b)
            )
        )
        self.assertEqual(raw, before)

    def test_root_a_projection_is_independent_of_b_descriptor_presence(self):
        """Separate FN1 and walk calls compare only A's original projection."""
        raw, *_ = _case()
        control_raw = copy.deepcopy(raw)
        del control_raw["descriptors"][15]
        raw_before, control_before = copy.deepcopy(raw), copy.deepcopy(control_raw)
        full_v, control_v = _validated(self, raw), _validated(self, control_raw)

        full_fn1 = _comparison(
            self, _call(self, compare_descriptor_definitions, raw, full_v)
        )
        control_fn1 = _comparison(
            self, _call(self, compare_descriptor_definitions, control_raw, control_v)
        )
        self.assertEqual(
            _root_projection(full_fn1, raw["binding"]),
            _root_projection(control_fn1, raw["binding"]),
        )

        full_walk = _walk(self, raw, full_v)
        control_walk = _walk(self, control_raw, control_v)
        self.assertEqual(
            _root_projection(full_walk["evaluation"]["comparison"], raw["binding"]),
            _root_projection(control_walk["evaluation"]["comparison"], raw["binding"]),
        )
        self.assertEqual(raw, raw_before)
        self.assertEqual(control_raw, control_before)

    def test_candidate_b_omission_keeps_root_and_b_slot_without_unrequested_missing_rows(
        self,
    ):
        """Candidates A-only/[] still retain root requirements and B's raw-slot read."""
        source, *_rest, candidate_a, candidate_b = _case()
        for candidates in ([candidate_a], []):
            with self.subTest(candidate_count=len(candidates)):
                raw = copy.deepcopy(source)
                raw["candidates"] = copy.deepcopy(candidates)
                before = copy.deepcopy(raw)
                validated = _validated(self, raw)
                public = _comparison(
                    self, _call(self, compare_descriptor_definitions, raw, validated)
                )
                walk = _walk(self, raw, validated)
                comparison = _comparison(self, walk["evaluation"]["comparison"])
                binding_b = raw["descriptors"][15]["binding"]
                for result in (public, comparison):
                    self.assertEqual(result["input_binding"], before["binding"])
                    self.assertTrue(_bound_rows(result["axes"], raw["binding"]))
                    self.assertFalse(
                        any(
                            row.get("binding") == binding_b
                            and row.get("state") == "missing"
                            and row.get("axis", "").endswith(".definition")
                            and row.get("axis", "").split(".definition")[0]
                            in _KINDS[1:]
                            for row in result["axes"]
                        )
                    )
                    self.assertFalse(
                        any(
                            row.get("binding") == binding_b
                            and row.get("state") == "missing"
                            and row.get("axis", "").endswith(".definition")
                            and row.get("axis", "").split(".definition")[0]
                            in _KINDS[1:]
                            for row in result["findings"]
                        )
                    )
                b_rows = _assessment_rows(walk, binding_b)
                self.assertTrue(b_rows)
                self.assertFalse(
                    any(
                        row["origin_branch"] == "required_slot_absent" for row in b_rows
                    )
                )
                self.assertTrue(
                    any(
                        row["fact_locators"] == ["/descriptors/15/facts/0"]
                        for row in b_rows
                    )
                )
                self.assertEqual(
                    len(
                        [
                            read
                            for read in walk["native_material"]["meaning_reads"]
                            if read["slot_locator"] == "/descriptors/15"
                            and read["fact_locator"] == "/descriptors/15/facts/0"
                        ]
                    ),
                    1,
                )
                self.assertTrue(
                    any(
                        row["axis"] == "template identity.definition"
                        and row["subject_ref"]
                        == raw["descriptors"][15]["facts"][0]["ref"]
                        for row in _bound_rows(public["axes"], binding_b)
                    )
                )
                self.assertEqual(
                    raw["descriptors"][15]["binding"]["template_ref"], candidate_b
                )
                self.assertEqual(raw, before)


if __name__ == "__main__":
    unittest.main()
