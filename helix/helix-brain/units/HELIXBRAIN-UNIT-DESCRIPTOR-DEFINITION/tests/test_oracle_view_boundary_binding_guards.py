"""FN4 R71/R72がtyped subject・義務・oracle対応後にだけ発火することを確かめる。

入力はfn0 validなOracleBindingと同期済owner source mirrorから構成する。
L4 /oracle_binding_correspondence/{f06_join,mismatch,revision_order} と
/rule_projection_table/71..72、L5 /failure_rules/{71,72} を根拠とする。
"""

from __future__ import annotations

import copy
import json
import unittest

from descriptor_definitions import (
    compare_descriptor_definitions,
    compare_identity_versions_and_trace,
    compare_oracle_and_view_boundary,
    validate_supply_input,
)
from oracle_binding_input_fixtures import (
    _rewrite_qualified_source_body,
    oracle_binding_rule_input,
)


FN1 = "compare_descriptor_definitions"
FN3 = "compare_identity_versions_and_trace"
FN4 = "compare_oracle_and_view_boundary"
UNFIRED_BRANCH = (
    "F05/F06/unclosed/formed_context; owner=knowledge_owner; "
    "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
)
CASES = {
    "unrelated_measurement": {
        "kind": "measurement",
        "code": "unrelated_measurement",
        "axis": "measurement.binding",
        "predicate": "measurementの根拠が別の適用義務を指しており、当該subject/bindingの義務へ対応しない。",
    },
    "completion_oracle_revision": {
        "kind": "completion",
        "code": "completion_oracle_revision",
        "axis": "completion.binding",
        "predicate": "completionの対oracle版が当該義務の要求されたoracle binding版と異なる。",
    },
}


def _resolve_pointer(value, pointer):
    if not isinstance(pointer, str) or not pointer.startswith("/"):
        raise AssertionError(f"expected RFC6901 absolute locator, got {pointer!r}")
    current = value
    for token in pointer[1:].split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        current = current[int(token)] if isinstance(current, list) else current[token]
    return current


def _ref_with_identity(ref, identity):
    result = copy.deepcopy(ref)
    result["identity"] = identity
    return result


class TestOracleViewBoundaryBindingGuards(unittest.TestCase):
    def _sync_oracle_binding(self, raw, oracle_binding, source):
        """原typed body mirrorを更新し、digest/Qualification/provenanceを同期する。"""
        mirror_rows = source["content"]["oracle_bindings"]
        self.assertEqual(len(mirror_rows), 1)
        mirror = mirror_rows[0]
        self.assertNotIn(
            "source_ref", mirror, "avoid a self-digest cycle in source body"
        )
        for member in mirror:
            self.assertIn(member, oracle_binding)
            mirror[member] = copy.deepcopy(oracle_binding[member])
        _old_ref, new_ref = _rewrite_qualified_source_body(
            raw, source, source["content"]
        )
        oracle_binding["source_ref"] = copy.deepcopy(new_ref)
        self.assertEqual(source["ref"], new_ref)
        for member, value in mirror.items():
            self.assertEqual(
                value, oracle_binding[member], f"owner body mirror {member}"
            )

    def _prepare(self, rule, mutation=None):
        raw, _fixture_before, _slot, fact, oracle_binding, source, _old, _new = (
            oracle_binding_rule_input(rule)
        )
        if mutation is not None:
            mutation(fact, oracle_binding)
            self._sync_oracle_binding(raw, oracle_binding, source)
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(
            validated["input"], "setup: fn0 accepts typed partial Ref members"
        )
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["unusable_source_refs"], [])
        validated_before = copy.deepcopy(validated)

        # Both upstream products are real results from the same validated snapshot.
        definitions = compare_descriptor_definitions({"validated": validated})
        identity_trace = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(definitions["producer_symbol"], FN1)
        self.assertEqual(identity_trace["producer_symbol"], FN3)
        self.assertEqual(definitions["input_binding"], raw_before["binding"])
        self.assertEqual(identity_trace["input_binding"], raw_before["binding"])
        context = {
            "validated": validated,
            "definitions": definitions,
            "identity_trace": identity_trace,
        }
        self.assertEqual(set(context), {"validated", "definitions", "identity_trace"})
        return (
            raw,
            raw_before,
            validated,
            validated_before,
            context,
            fact,
            oracle_binding,
        )

    def _assert_unfired_stops_without_empty_result(self, rule, mutation):
        (raw, raw_before, validated, validated_before, context, _fact, _oracle) = (
            self._prepare(rule, mutation)
        )
        context_before = copy.deepcopy(context)
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary(context)
        self.assertEqual(str(caught.exception), UNFIRED_BRANCH)
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(context, context_before)

    def test_R71_matching_obligation_does_not_fire_unrelated_measurement(self):
        """L4/L5 rule 71 needs a different typed obligation after subject correspondence."""

        def match_obligation(fact, oracle):
            oracle["obligation_ref"] = copy.deepcopy(fact["binding"]["requirement_ref"])

        self._assert_unfired_stops_without_empty_result(
            "unrelated_measurement", match_obligation
        )

    def test_R72_different_subject_does_not_become_revision_conflict(self):
        """L4 f06_join: same obligation and different revision cannot bridge another subject."""

        def different_subject(_fact, oracle):
            oracle["subject_ref"] = _ref_with_identity(
                oracle["subject_ref"], "SYNTHETIC-OTHER-COMPLETION-SUBJECT"
            )

        self._assert_unfired_stops_without_empty_result(
            "completion_oracle_revision", different_subject
        )

    def test_R72_different_obligation_does_not_become_revision_conflict(self):
        """L4 f06_join: a known other obligation is not the completion's required obligation."""

        def different_obligation(_fact, oracle):
            oracle["obligation_ref"] = _ref_with_identity(
                oracle["obligation_ref"], "SYNTHETIC-OTHER-COMPLETION-OBLIGATION"
            )

        self._assert_unfired_stops_without_empty_result(
            "completion_oracle_revision", different_obligation
        )

    def test_R72_equal_oracle_revision_does_not_fire(self):
        """L4 revision_order: aligned subject and obligation are compared before revisions."""

        def equal_revision(fact, oracle):
            oracle["oracle_ref"]["revision"] = fact["oracle_ref"]["revision"]

        self._assert_unfired_stops_without_empty_result(
            "completion_oracle_revision", equal_revision
        )

    def test_R72_owner_difference_is_not_a_revision_only_conflict(self):
        """L4 mismatch: identity/scope/revision resemblance cannot hide a different oracle owner."""

        def different_owner(_fact, oracle):
            oracle["oracle_ref"]["owner"] = "SYNTHETIC-OTHER-ORACLE-OWNER"

        self._assert_unfired_stops_without_empty_result(
            "completion_oracle_revision", different_owner
        )

    def _assert_positive_rule_prefix_and_observations(self, rule):
        raw, raw_before, validated, validated_before, context, fact, oracle_binding = (
            self._prepare(rule)
        )
        context_before = copy.deepcopy(context)
        result = compare_oracle_and_view_boundary(context)
        expectation = CASES[rule]
        findings = [
            row for row in result["findings"] if row["code"] == expectation["code"]
        ]
        self.assertEqual(len(findings), 1)
        finding = findings[0]
        self.assertEqual(
            finding["rule_ref"], "HELIXBRAIN-L5-032-R-" + expectation["code"]
        )
        self.assertEqual(finding["axis"], expectation["axis"])
        self.assertEqual(finding["state"], "conflict")
        self.assertEqual(finding["subject_ref"], fact["ref"])
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertEqual(finding["backflow_owner"], "knowledge_owner")

        prefix, separator, diagnostic_text = finding["reason"].partition("\n")
        self.assertEqual(prefix, expectation["predicate"])
        self.assertTrue(separator)
        diagnostic = json.loads(diagnostic_text)
        self.assertEqual(
            set(diagnostic), {"code", "rule_ref", "predicate_observations"}
        )
        self.assertEqual(diagnostic["code"], expectation["code"])
        self.assertEqual(diagnostic["rule_ref"], finding["rule_ref"])
        self.assertTrue(diagnostic["predicate_observations"])
        for observation in diagnostic["predicate_observations"]:
            self.assertEqual(set(observation), {"locator", "original_read"})
            raw_value = _resolve_pointer(raw, observation["locator"])
            self.assertEqual(
                observation["original_read"],
                {"presence": "supplied", "value": raw_value},
                f"diagnostic must preserve actual raw value at {observation['locator']}",
            )

        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(context, context_before)
        self.assertEqual(result["producer_symbol"], FN4)
        self.assertEqual(result["input_binding"], raw["binding"])
        self.assertEqual(oracle_binding["subject_ref"], fact["ref"])

    def test_existing_R71_predicate_has_exact_L5_prefix_and_raw_diagnostics(self):
        """Positive control remains the exact existing rule 71 predicate and raw observation path."""
        self._assert_positive_rule_prefix_and_observations("unrelated_measurement")

    def test_existing_R72_predicate_has_exact_L5_prefix_and_raw_diagnostics(self):
        """Positive control remains the exact existing rule 72 predicate and raw observation path."""
        self._assert_positive_rule_prefix_and_observations("completion_oracle_revision")


if __name__ == "__main__":
    unittest.main()
