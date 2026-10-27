"""Rule 71/72 projection contracts from actual typed FN0/FN1/FN3 contexts.

Expected joins are read from L4 ``oracle_binding_correspondence`` and
``rule_projection_table/71..72``; exact reason bytes use L4
``finding_reason`` and L6's selected operand/locator order. Tests don't patch
private readers or inject a synthetic successful FN1 result.
"""

from __future__ import annotations

import copy
import json
import unittest

from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import compare_oracle_and_view_boundary, validate_supply_input
from descriptor_target_frame import build_descriptor_claim_uses
from oracle_binding_rules import compare_oracle_and_view_boundary_detail
from oracle_projection_input_fixtures import (
    oracle_projection_input,
    oracle_projection_public_context,
    synchronize_oracle_binding_source,
)
from oracle_view_boundary import compare_oracle_and_view_boundary as public_fn4


FN4 = "compare_oracle_and_view_boundary"
BACKFLOW = "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
EXPECTED_RULES = {
    "measurement": {
        "code": "unrelated_measurement",
        "rule_ref": "HELIXBRAIN-L5-032-R-unrelated_measurement",
        "axis": "measurement.binding",
        "prefix": "measurementの根拠が別の適用義務を指しており、当該subject/bindingの義務へ対応しない。",
    },
    "completion": {
        "code": "completion_oracle_revision",
        "rule_ref": "HELIXBRAIN-L5-032-R-completion_oracle_revision",
        "axis": "completion.binding",
        "prefix": "completionの対oracle版が当該義務の要求されたoracle binding版と異なる。",
    },
}
CARRY = {
    "measurement.definition",
    "completion.definition",
    "negative oracle.definition",
}


def _presence(value, present=True):
    return {"presence": "supplied", "value": copy.deepcopy(value)} if present else {"presence": "absent"}


def _expected_observations(raw, rule, fact, oracle):
    spec = EXPECTED_RULES[rule]
    fact_members = ["ref", "source_ref", "binding"]
    oracle_members = ["ref", "subject_ref", "obligation_ref", "source_ref"]
    if rule == "completion":
        fact_members.append("oracle_ref")
        oracle_members.append("oracle_ref")
    slot_index = next(
        index for index, slot in enumerate(raw["descriptors"])
        if slot["descriptor_kind"] == rule
    )
    fact_index = raw["descriptors"][slot_index]["facts"].index(fact)
    fact_locator = f"/descriptors/{slot_index}/facts/{fact_index}"
    oracle_index = next(index for index, row in enumerate(raw["oracle_bindings"]) if row is oracle)
    oracle_locator = f"/oracle_bindings/{oracle_index}"
    observations = []
    for parent, members, locator in (
        (fact, fact_members, fact_locator),
        (oracle, oracle_members, oracle_locator),
    ):
        for member in members:
            observations.append({
                "locator": locator + "/" + member,
                "original_read": _presence(parent[member], member in parent),
            })
    return observations


def _expected_original_refs(rule, fact, oracle):
    oracle_members = ["ref", "subject_ref", "obligation_ref", "source_ref"]
    refs = [fact["ref"], fact["source_ref"], fact["binding"]["requirement_ref"]]
    if rule == "completion":
        refs.append(fact["oracle_ref"])
        oracle_members.append("oracle_ref")
    refs.extend(oracle[member] for member in oracle_members)
    return [copy.deepcopy(ref) for ref in refs if isinstance(ref, dict)]


def _expected_source_refs(raw, fact, oracle):
    witnesses = [fact["source_ref"], oracle["source_ref"]]
    return [
        copy.deepcopy(source["ref"])
        for source in raw["sources"]
        if any(_same_source_ref(source["ref"], witness) for witness in witnesses)
    ]


def _same_source_ref(left, right):
    """L5 Ref correspondence allows an unknown digest, but not a known mismatch."""
    return (
        isinstance(left, dict)
        and isinstance(right, dict)
        and all(
            left.get(key) is not None and left.get(key) == right.get(key)
            for key in ("identity", "revision", "scope", "owner")
        )
        and (
            left.get("sha256") is None
            or right.get("sha256") is None
            or left["sha256"] == right["sha256"]
        )
    )


def _assert_exact_finding(test, raw, result, rule, fact, oracle, finding, *, axis_oracle=None):
    spec = EXPECTED_RULES[rule]
    test.assertEqual(set(finding), {
        "code", "rule_ref", "subject_ref", "binding", "axis", "state",
        "source_refs", "reason", "backflow_owner",
    })
    test.assertEqual(finding["code"], spec["code"])
    test.assertEqual(finding["rule_ref"], spec["rule_ref"])
    test.assertEqual(finding["subject_ref"], fact["ref"])
    test.assertEqual(finding["binding"], raw["binding"])
    test.assertEqual(finding["axis"], spec["axis"])
    test.assertEqual(finding["state"], "conflict")
    test.assertEqual(finding["source_refs"], _expected_source_refs(raw, fact, oracle))
    test.assertEqual(finding["backflow_owner"], "knowledge_owner")

    diagnostic = {
        "code": spec["code"],
        "rule_ref": spec["rule_ref"],
        "predicate_observations": _expected_observations(raw, rule, fact, oracle),
    }
    expected_reason = spec["prefix"] + "\n" + json.dumps(
        diagnostic, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    )
    test.assertEqual(finding["reason"], expected_reason)
    test.assertEqual(
        finding["reason"].encode("utf-8"), expected_reason.encode("utf-8"),
        "L4 diagnostic JSON is fixed byte-for-byte, including sorted object keys",
    )

    axis_oracle = oracle if axis_oracle is None else axis_oracle
    axis = next(
        row for row in result["axes"]
        if row["axis"] == spec["axis"] and row["subject_ref"] == fact["ref"]
    )
    test.assertEqual(set(axis), {
        "subject_ref", "binding", "axis", "state", "original_refs", "reason", "backflow_owner",
    })
    test.assertEqual(axis["subject_ref"], fact["ref"])
    test.assertEqual(axis["binding"], raw["binding"])
    test.assertEqual(axis["state"], "conflict")
    test.assertEqual(axis["original_refs"], _expected_original_refs(rule, fact, axis_oracle))
    axis_diagnostic = {
        "code": spec["code"],
        "rule_ref": spec["rule_ref"],
        "predicate_observations": _expected_observations(raw, rule, fact, axis_oracle),
    }
    axis_reason = spec["prefix"] + "\n" + json.dumps(
        axis_diagnostic, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    )
    test.assertEqual(axis["reason"], axis_reason)
    test.assertEqual(axis["backflow_owner"], "knowledge_owner")


def _private_context_and_frame(raw):
    from descriptor_definitions import compare_descriptor_definitions, compare_identity_versions_and_trace

    validated = validate_supply_input(raw)
    if validated["input"] is None or not isinstance(validated["input"], dict):
        raise AssertionError("setup: private rejection starts from a real decoded ValidatedSupply")
    definitions = compare_descriptor_definitions({"validated": validated})
    identity_trace = compare_identity_versions_and_trace({"validated": validated})
    context = {"validated": validated, "definitions": definitions, "identity_trace": identity_trace}
    walk = evaluate_descriptor_definition_walk({"validated": validated})
    uses = build_descriptor_claim_uses(
        validated, walk["evaluation"], walk["target_reads"], walk["intent_reads"]
    )
    frame = {
        "validated": validated,
        "definition_evaluation": walk["evaluation"],
        "target_reads": walk["target_reads"],
        "claim_uses": uses,
    }
    return validated, context, frame


def _assert_stop(test, callback, branch):
    with test.assertRaises(NotImplementedError) as caught:
        callback()
    test.assertEqual(
        str(caught.exception),
        f"F05/F06/unclosed/{branch}; owner=knowledge_owner; {BACKFLOW}",
    )


class TestOracleRuleProjectionContract(unittest.TestCase):
    def test_both_rules_keep_full_diagnostic_refs_and_rule_order(self):
        raw, _before, source = oracle_projection_input(rules=("completion", "measurement"))
        raw_before = copy.deepcopy(raw)
        validated, definitions, _identity_trace, context = oracle_projection_public_context(raw)
        context_before = copy.deepcopy(context)
        result = public_fn4(context)
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(context, context_before)
        self.assertEqual(result["producer_symbol"], FN4)
        self.assertEqual(result["input_binding"], raw_before["binding"])

        original_carry = [row for row in definitions["axes"] if row["axis"] in CARRY]
        self.assertEqual([row for row in result["axes"] if row["axis"] in CARRY], original_carry)
        new_axis_names = [row["axis"] for row in result["axes"] if row["axis"].endswith(".binding")]
        self.assertEqual(new_axis_names, ["measurement.binding", "completion.binding"])
        codes = [row["code"] for row in result["findings"]]
        self.assertEqual(codes, ["unrelated_measurement", "completion_oracle_revision"])

        facts = {
            rule: next(slot["facts"][0] for slot in raw["descriptors"] if slot["descriptor_kind"] == rule)
            for rule in ("measurement", "completion")
        }
        oracles = {
            "measurement": next(row for row in raw["oracle_bindings"] if row["subject_ref"] == facts["measurement"]["ref"]),
            "completion": next(row for row in raw["oracle_bindings"] if row["subject_ref"] == facts["completion"]["ref"]),
        }
        for rule, finding in zip(("measurement", "completion"), result["findings"]):
            _assert_exact_finding(self, raw, result, rule, facts[rule], oracles[rule], finding)
        self.assertEqual(source["ref"], oracles["completion"]["source_ref"])
        self.assertEqual(
            [entry["source_ref"] for entry in raw["oracle_bindings"]],
            [source["ref"], source["ref"]],
        )

    def test_whole_equal_duplicate_oracle_rows_repeat_finding_but_share_one_axis(self):
        raw, _before, _source = oracle_projection_input(rules=("measurement",), duplicate=True)
        validated, _definitions, _identity_trace, context = oracle_projection_public_context(raw)
        before = copy.deepcopy(context)
        result = public_fn4(context)
        self.assertEqual(context, before)
        self.assertEqual(validated["input"], raw)
        self.assertEqual([row["code"] for row in result["findings"]], ["unrelated_measurement"] * 2)
        fact = next(
            slot["facts"][0] for slot in raw["descriptors"]
            if slot["descriptor_kind"] == "measurement"
        )
        for oracle, finding in zip(raw["oracle_bindings"], result["findings"]):
            _assert_exact_finding(
                self, raw, result, "measurement", fact, oracle, finding,
                axis_oracle=raw["oracle_bindings"][0],
            )
        matching_axes = [row for row in result["axes"] if row["axis"] == "measurement.binding"]
        self.assertEqual(len(matching_axes), 1)
        self.assertEqual(matching_axes[0]["original_refs"], _expected_original_refs(
            "measurement", raw["descriptors"][next(i for i, s in enumerate(raw["descriptors"]) if s["descriptor_kind"] == "measurement")]["facts"][0],
            raw["oracle_bindings"][0],
        ))

    def test_distinct_same_subject_oracle_tuples_stop_as_competition(self):
        raw, _before, _source = oracle_projection_input(rules=("measurement",), competing=True)
        self.assertEqual(raw["oracle_bindings"][0]["subject_ref"], raw["oracle_bindings"][1]["subject_ref"])
        self.assertNotEqual(raw["oracle_bindings"][0], raw["oracle_bindings"][1])
        _validated, _definitions, _identity_trace, context = oracle_projection_public_context(raw)
        _assert_stop(self, lambda: public_fn4(context), "oracle_binding_competition")

    def test_completion_null_oracle_ref_stops_without_becoming_nonfire(self):
        raw, _before, _source = oracle_projection_input(rules=("completion",))
        completion = next(
            slot for slot in raw["descriptors"] if slot["descriptor_kind"] == "completion"
        )
        completion["facts"][0]["oracle_ref"] = None
        _validated, _definitions, _identity_trace, context = oracle_projection_public_context(raw)
        _assert_stop(self, lambda: public_fn4(context), "oracle_oracle_correspondence")

    def test_known_oracle_identity_scope_or_owner_difference_does_not_fire_revision_rule(self):
        for member, replacement in (
            ("identity", "SYNTHETIC-OTHER-ORACLE"),
            ("scope", {"project": "other-P", "tenant": "other-T", "environment": "other-E"}),
            ("owner", "synthetic-other-oracle-owner"),
        ):
            with self.subTest(member=member):
                raw, _before, _source = oracle_projection_input(rules=("completion",))
                raw["oracle_bindings"][0]["oracle_ref"][member] = copy.deepcopy(replacement)
                synchronize_oracle_binding_source(raw)
                _validated, _definitions, _identity_trace, context = oracle_projection_public_context(raw)
                _assert_stop(self, lambda: public_fn4(context), "formed_context")

    def test_source_witness_must_match_be_semantic_and_remain_qualified(self):
        mutations = ("no_match", "wrong_role", "bad_qualification")
        for case in mutations:
            with self.subTest(case=case):
                raw, _before, oracle_source = oracle_projection_input(rules=("measurement",))
                if case == "no_match":
                    missing = copy.deepcopy(raw["oracle_bindings"][0]["source_ref"])
                    missing["identity"] = "SYNTHETIC-MISSING-ORACLE-SOURCE"
                    raw["oracle_bindings"][0]["source_ref"] = missing
                elif case == "wrong_role":
                    oracle_source["role"] = "reference_only"
                else:
                    missing_qualification = copy.deepcopy(oracle_source["qualification_ref"])
                    missing_qualification["identity"] = "SYNTHETIC-MISSING-QUALIFICATION"
                    oracle_source["qualification_ref"] = missing_qualification
                validated, _definitions, _identity_trace, context = oracle_projection_public_context(
                    raw, allow_fn0_issues=(case == "bad_qualification")
                )
                if case == "bad_qualification":
                    self.assertIn(oracle_source["ref"], validated["unusable_source_refs"])
                    self.assertTrue(any(issue["locator"].startswith("/sources/") for issue in validated["input_issues"]))
                _assert_stop(self, lambda: public_fn4(context), "oracle_predicate_source")

    def test_private_definition_origin_binding_and_obligation_stops_use_real_frame(self):
        # These negative snapshots deliberately mutate an actual fn0/FN1/FN3/walk
        # frame after construction. They are rejection checks, not valid success fixtures.
        raw, _before, _source = oracle_projection_input(rules=("measurement",))
        validated, context, frame = _private_context_and_frame(raw)
        frame["definition_evaluation"]["assessments"] = [
            row for row in frame["definition_evaluation"]["assessments"]
            if row["axis_name"] != "measurement.definition"
        ]
        _assert_stop(
            self, lambda: compare_oracle_and_view_boundary_detail(context, frame),
            "oracle_definition_origin",
        )
        self.assertIs(validated, frame["validated"])

        raw, _before, _source = oracle_projection_input(rules=("measurement",))
        validated, context, frame = _private_context_and_frame(raw)
        validated["input"]["descriptors"][next(i for i, row in enumerate(validated["input"]["descriptors"]) if row["descriptor_kind"] == "measurement")]["facts"][0]["binding"]["template_ref"]["identity"] = "SYNTHETIC-OTHER-TEMPLATE"
        _assert_stop(
            self, lambda: compare_oracle_and_view_boundary_detail(context, frame),
            "oracle_subject_or_binding",
        )
        self.assertIs(validated, frame["validated"])

        raw, _before, _source = oracle_projection_input(rules=("measurement",))
        validated, context, frame = _private_context_and_frame(raw)
        validated["input"]["oracle_bindings"][0]["obligation_ref"] = None
        _assert_stop(
            self, lambda: compare_oracle_and_view_boundary_detail(context, frame),
            "oracle_obligation_correspondence",
        )
        self.assertIs(validated, frame["validated"])

    def test_obligation_digest_difference_is_not_treated_as_unrelated_identity(self):
        raw, _before, _source = oracle_projection_input(rules=("measurement",))
        required_ref = raw["binding"]["requirement_ref"]
        required_ref["sha256"] = "a" * 64
        for slot in raw["descriptors"]:
            slot["binding"]["requirement_ref"]["sha256"] = "a" * 64
            for fact in slot["facts"]:
                fact["binding"]["requirement_ref"]["sha256"] = "a" * 64
        oracle_obligation = copy.deepcopy(required_ref)
        oracle_obligation["sha256"] = "b" * 64
        raw["oracle_bindings"][0]["obligation_ref"] = oracle_obligation
        synchronize_oracle_binding_source(raw)
        _validated, _definitions, _identity_trace, context = oracle_projection_public_context(raw)
        _assert_stop(self, lambda: public_fn4(context), "oracle_obligation_digest")

    def test_frozen_frame_and_evaluation_guards_reject_inconsistent_private_values(self):
        raw, _before, _source = oracle_projection_input(rules=("measurement",))
        _validated, context, frame = _private_context_and_frame(raw)
        frame.pop("claim_uses")
        _assert_stop(self, lambda: compare_oracle_and_view_boundary_detail(context, frame), "oracle_frame")

        raw, _before, _source = oracle_projection_input(rules=("measurement",))
        _validated, context, frame = _private_context_and_frame(raw)
        frame["definition_evaluation"] = None
        _assert_stop(self, lambda: compare_oracle_and_view_boundary_detail(context, frame), "oracle_evaluation")

if __name__ == "__main__":
    unittest.main()
