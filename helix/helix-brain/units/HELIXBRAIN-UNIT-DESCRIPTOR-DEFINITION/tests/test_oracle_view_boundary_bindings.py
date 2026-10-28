"""FN4のF06既存rule 71/72をtyped Ref対応で個別に確かめる。

根拠: L4 /oracle_view_boundary_contract/oracle_binding_correspondence と
/rule_projection_table/{71,72}、L5 /failure_rules/{71,72}、L8
/cases/7/negative_cases/{0,1}。meaning RawValue内の追加keyや保存whole outputを使わない。
"""

from __future__ import annotations

import copy
import json
import unittest

from descriptor_definitions import (
    compare_descriptor_definitions,
    compare_identity_versions_and_trace,
    validate_supply_input,
)
from oracle_binding_input_fixtures import oracle_binding_rule_input
from oracle_view_boundary import compare_oracle_and_view_boundary


FN1 = "compare_descriptor_definitions"
FN3 = "compare_identity_versions_and_trace"
FN4 = "compare_oracle_and_view_boundary"
RULES = {
    "unrelated_measurement": {
        "case_id": "HELIXBRAIN-L8-032-F06-NEG-01",
        "code": "unrelated_measurement",
        "rule_ref": "HELIXBRAIN-L5-032-R-unrelated_measurement",
        "axis": "measurement.binding",
    },
    "completion_oracle_revision": {
        "case_id": "HELIXBRAIN-L8-032-F06-NEG-02",
        "code": "completion_oracle_revision",
        "rule_ref": "HELIXBRAIN-L5-032-R-completion_oracle_revision",
        "axis": "completion.binding",
    },
}
CARRY_AXES = {
    "measurement.definition",
    "completion.definition",
    "negative oracle.definition",
}


def _same_source_ref(left, right):
    """L5 reference_equality: 片方のdigestがnullなら既知digest差を作らない。"""
    return all(
        left.get(key) is not None and left.get(key) == right.get(key)
        for key in ("identity", "revision", "scope", "owner")
    ) and (
        left.get("sha256") is None
        or right.get("sha256") is None
        or left["sha256"] == right["sha256"]
    )


class TestOracleViewBoundaryBindings(unittest.TestCase):
    def _run_fn4(self, rule):
        (
            raw,
            raw_before,
            slot,
            fact,
            oracle_binding,
            oracle_source,
            old_source_ref,
            new_source_ref,
        ) = oracle_binding_rule_input(rule)
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(
            validated["input"], "setup: FN0 must decode this typed-witness input"
        )
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [], "setup: no structural issue")
        self.assertEqual(
            validated["unusable_source_refs"],
            [],
            "setup: synchronized sources remain usable",
        )
        body_rows = oracle_source["content"]["oracle_bindings"]
        self.assertEqual(len(body_rows), 1)
        for member, value in body_rows[0].items():
            self.assertEqual(
                value, oracle_binding[member], f"setup: source mirror {member}"
            )
        validated_before = copy.deepcopy(validated)

        definitions = compare_descriptor_definitions({"validated": validated})
        identity_trace = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(definitions["producer_symbol"], FN1)
        self.assertEqual(identity_trace["producer_symbol"], FN3)
        self.assertEqual(definitions["input_binding"], raw_before["binding"])
        self.assertEqual(identity_trace["input_binding"], raw_before["binding"])
        definitions_before = copy.deepcopy(definitions)
        identity_trace_before = copy.deepcopy(identity_trace)

        original_carry = [
            row for row in definitions["axes"] if row["axis"] in CARRY_AXES
        ]
        self.assertEqual({row["axis"] for row in original_carry}, CARRY_AXES)

        target_axis = f"{slot['descriptor_kind']}.definition"
        target_axes = [row for row in definitions["axes"] if row["axis"] == target_axis]
        self.assertTrue(
            target_axes, "setup: FN1 exposes the selected typed definition subject"
        )
        self.assertTrue(any(row["subject_ref"] == fact["ref"] for row in target_axes))
        context = {
            "validated": validated,
            "definitions": definitions,
            "identity_trace": identity_trace,
        }
        context_before = copy.deepcopy(context)
        result = compare_oracle_and_view_boundary(context)

        self.assertEqual(
            set(result), {"axes", "findings", "producer_symbol", "input_binding"}
        )
        self.assertEqual(result["producer_symbol"], FN4)
        self.assertEqual(result["input_binding"], raw_before["binding"])
        self.assertIsInstance(result["axes"], list)
        self.assertIsInstance(result["findings"], list)
        self.assertEqual(
            [row for row in result["axes"] if row["axis"] in CARRY_AXES],
            original_carry,
            "L4 projection_order: preserve the three original definition carry rows in their order",
        )
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(definitions, definitions_before)
        self.assertEqual(identity_trace, identity_trace_before)
        self.assertEqual(context, context_before)
        self.assertEqual(old_source_ref["identity"], new_source_ref["identity"])
        self.assertEqual(oracle_source["ref"], new_source_ref)
        return raw_before, fact, oracle_binding, result, oracle_source

    def _assert_existing_finding(
        self, rule, raw, fact, oracle_binding, result, oracle_source
    ):
        expectation = RULES[rule]
        findings = [
            row for row in result["findings"] if row["code"] == expectation["code"]
        ]
        self.assertEqual(len(findings), 1, expectation["case_id"])
        finding = findings[0]
        self.assertEqual(
            set(finding),
            {
                "code",
                "rule_ref",
                "subject_ref",
                "binding",
                "axis",
                "state",
                "source_refs",
                "reason",
                "backflow_owner",
            },
        )
        self.assertEqual(finding["code"], expectation["code"])
        self.assertEqual(finding["rule_ref"], expectation["rule_ref"])
        self.assertEqual(finding["subject_ref"], fact["ref"])
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertEqual(finding["axis"], expectation["axis"])
        self.assertEqual(finding["state"], "conflict")
        self.assertEqual(finding["backflow_owner"], "knowledge_owner")

        fact_sources = [
            source
            for source in raw["sources"]
            if _same_source_ref(source["ref"], fact["source_ref"])
        ]
        self.assertEqual(
            len(fact_sources), 1, "the test input names one actual source occurrence"
        )
        fact_source = fact_sources[0]
        witness_refs = [fact_source["ref"], oracle_binding["source_ref"]]
        expected_sources = [
            source["ref"]
            for source in raw["sources"]
            if any(source["ref"] == witness_ref for witness_ref in witness_refs)
        ]
        self.assertEqual(
            expected_sources, [fact_source["ref"], oracle_binding["source_ref"]]
        )
        self.assertEqual(finding["source_refs"], expected_sources)

        # L4 fixes the reason envelope and diagnostic fields, but L5 does not
        # publish a literal Japanese prefix for these two predicates.
        prefix, separator, diagnostic_text = finding["reason"].partition("\n")
        self.assertTrue(prefix)
        self.assertTrue(separator)
        diagnostic = json.loads(diagnostic_text)
        self.assertEqual(
            set(diagnostic), {"code", "rule_ref", "predicate_observations"}
        )
        self.assertEqual(diagnostic["code"], expectation["code"])
        self.assertEqual(diagnostic["rule_ref"], expectation["rule_ref"])
        self.assertTrue(diagnostic["predicate_observations"])
        self.assertTrue(
            all(
                set(observation) == {"locator", "original_read"}
                for observation in diagnostic["predicate_observations"]
            )
        )

        axis_rows = [
            row
            for row in result["axes"]
            if row["axis"] == expectation["axis"]
            and row["subject_ref"] == fact["ref"]
            and row["binding"] == raw["binding"]
        ]
        self.assertEqual(len(axis_rows), 1)
        self.assertEqual(axis_rows[0]["state"], "conflict")
        self.assertEqual(axis_rows[0]["backflow_owner"], "knowledge_owner")
        self.assertEqual(oracle_source["ref"], oracle_binding["source_ref"])

    def test_F06_NEG_01_measurement_oracle_basis_for_another_obligation_conflicts(self):
        """L4/L5 rule 71: same typed subject, but OracleBinding obligation differs from Binding obligation."""
        raw, fact, oracle_binding, result, source = self._run_fn4(
            "unrelated_measurement"
        )
        self.assertEqual(oracle_binding["subject_ref"], fact["ref"])
        self.assertNotEqual(
            oracle_binding["obligation_ref"], fact["binding"]["requirement_ref"]
        )
        self._assert_existing_finding(
            "unrelated_measurement", raw, fact, oracle_binding, result, source
        )

    def test_F06_NEG_02_completion_oracle_revision_conflicts_for_same_subject_obligation(
        self,
    ):
        """L4/L5 rule 72: join subject and obligation first, then compare typed oracle revisions."""
        raw, fact, oracle_binding, result, source = self._run_fn4(
            "completion_oracle_revision"
        )
        self.assertEqual(oracle_binding["subject_ref"], fact["ref"])
        self.assertEqual(
            oracle_binding["obligation_ref"], fact["binding"]["requirement_ref"]
        )
        self.assertEqual(
            oracle_binding["oracle_ref"]["identity"], fact["oracle_ref"]["identity"]
        )
        self.assertEqual(
            oracle_binding["oracle_ref"]["scope"], fact["oracle_ref"]["scope"]
        )
        self.assertEqual(
            oracle_binding["oracle_ref"]["owner"], fact["oracle_ref"]["owner"]
        )
        self.assertNotEqual(
            oracle_binding["oracle_ref"]["revision"], fact["oracle_ref"]["revision"]
        )
        self._assert_existing_finding(
            "completion_oracle_revision", raw, fact, oracle_binding, result, source
        )


if __name__ == "__main__":
    unittest.main()
