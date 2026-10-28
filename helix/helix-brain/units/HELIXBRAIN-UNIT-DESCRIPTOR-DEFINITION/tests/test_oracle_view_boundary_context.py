"""FN4のsame-call / decode-null / partial-context境界だけを確かめる。

期待はL4 /oracle_view_boundary_contract/{same_call,null_input,
partial_context_projection}から独立に選ぶ。F05/F06の通常意味判定や
7 ruleの全域成立、L8の保存出力はこのtestの対象にしない。
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definitions import (
    compare_descriptor_definitions,
    compare_identity_versions_and_trace,
    compare_oracle_and_view_boundary,
    validate_supply_input,
)
from supply_input_fixtures import base_input, load_document


FN4 = "compare_oracle_and_view_boundary"
FN1 = "compare_descriptor_definitions"
FN3 = "compare_identity_versions_and_trace"


class TestOracleViewBoundaryContext(unittest.TestCase):
    def setUp(self):
        self.document = load_document()

    def _normal_context(self):
        raw = base_input(self.document)
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], raw_before)
        validated_before = copy.deepcopy(validated)

        definitions = compare_descriptor_definitions({"validated": validated})
        identity_trace = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(definitions["producer_symbol"], FN1)
        self.assertEqual(identity_trace["producer_symbol"], FN3)
        self.assertEqual(definitions["input_binding"], raw_before["binding"])
        self.assertEqual(identity_trace["input_binding"], raw_before["binding"])
        self._assert_input_comparison(definitions, FN1, raw_before["binding"])
        self._assert_input_comparison(identity_trace, FN3, raw_before["binding"])

        context = {
            "validated": validated,
            "definitions": definitions,
            "identity_trace": identity_trace,
        }
        self.assertEqual(set(context), {"validated", "definitions", "identity_trace"})
        return raw, raw_before, validated, validated_before, context

    def _assert_fn4_comparison(self, result, input_binding):
        self.assertEqual(
            set(result), {"axes", "findings", "producer_symbol", "input_binding"}
        )
        self.assertIsInstance(result["axes"], list)
        self.assertIsInstance(result["findings"], list)
        self.assertEqual(result["producer_symbol"], FN4)
        self.assertEqual(result["input_binding"], input_binding)

    def _assert_input_comparison(self, result, producer_symbol, input_binding):
        self.assertEqual(
            set(result), {"axes", "findings", "producer_symbol", "input_binding"}
        )
        self.assertIsInstance(result["axes"], list)
        self.assertIsInstance(result["findings"], list)
        self.assertEqual(result["producer_symbol"], producer_symbol)
        self.assertEqual(result["input_binding"], input_binding)

    def test_decode_null_keeps_issues_and_composes_an_empty_fn4_comparison(self):
        """L4 null_input: decode不能はInputIssueを保ち、empty Comparisonを成功扱いしない。"""
        raw = "not-a-supply-input"
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNone(validated["input"])
        self.assertTrue(validated["input_issues"])
        validated_before = copy.deepcopy(validated)

        # これはdecode-error composition用の明示empty Comparisonであり、
        # formed fn1/fn3 resultを捏造して通常入力へ使うものではない。
        definitions = {
            "axes": [],
            "findings": [],
            "producer_symbol": FN1,
            "input_binding": None,
        }
        identity_trace = {
            "axes": [],
            "findings": [],
            "producer_symbol": FN3,
            "input_binding": None,
        }
        self._assert_input_comparison(definitions, FN1, None)
        self._assert_input_comparison(identity_trace, FN3, None)
        context = {
            "validated": validated,
            "definitions": definitions,
            "identity_trace": identity_trace,
        }
        context_before = copy.deepcopy(context)

        result = compare_oracle_and_view_boundary(context)

        self._assert_fn4_comparison(result, None)
        self.assertEqual(result["axes"], [])
        self.assertEqual(result["findings"], [])
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(context, context_before)

    def _assert_partial_context_stop(
        self, context, raw, raw_before, validated, validated_before, branch
    ):
        context_before = copy.deepcopy(context)
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary(context)
        message = str(caught.exception)
        self.assertIn(f"F05/F06/partial/{branch};", message)
        self.assertIn("knowledge_owner", message)
        self.assertIn("Backflow HELIXBRAIN-L6-032-FN4-ORACLE", message)
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(context, context_before)

    def test_wrong_definitions_producer_stops_as_partial_context(self):
        """L4 same_call/invalid_context: 別producerをempty成功で補完しない。"""
        raw, raw_before, validated, validated_before, context = self._normal_context()
        definitions = copy.deepcopy(context["definitions"])
        definitions["producer_symbol"] = "another_producer"
        context["definitions"] = definitions
        self._assert_partial_context_stop(
            context,
            raw,
            raw_before,
            validated,
            validated_before,
            "definitions_producer",
        )

    def test_identity_trace_binding_mismatch_stops_as_partial_context(self):
        """L4 partial_context_projection: 異Bindingをempty成功で補完しない。"""
        raw, raw_before, validated, validated_before, context = self._normal_context()
        identity_trace = copy.deepcopy(context["identity_trace"])
        mismatched_binding = copy.deepcopy(raw_before["binding"])
        mismatched_binding["template_ref"]["identity"] = "SYNTHETIC-OTHER-TEMPLATE"
        identity_trace["input_binding"] = mismatched_binding
        context["identity_trace"] = identity_trace
        self._assert_partial_context_stop(
            context,
            raw,
            raw_before,
            validated,
            validated_before,
            "identity_trace_binding",
        )

    def test_identity_trace_producer_mismatch_stops_as_partial_context(self):
        """L4 partial_context_projection: identity_trace producerも同call限定。"""
        raw, raw_before, validated, validated_before, context = self._normal_context()
        identity_trace = copy.deepcopy(context["identity_trace"])
        identity_trace["producer_symbol"] = "another_producer"
        context["identity_trace"] = identity_trace
        self._assert_partial_context_stop(
            context,
            raw,
            raw_before,
            validated,
            validated_before,
            "identity_trace_producer",
        )

    def test_definitions_binding_mismatch_stops_as_partial_context(self):
        """L4 partial_context_projection: definitions Bindingも同call限定。"""
        raw, raw_before, validated, validated_before, context = self._normal_context()
        definitions = copy.deepcopy(context["definitions"])
        mismatched_binding = copy.deepcopy(raw_before["binding"])
        mismatched_binding["template_ref"]["identity"] = "SYNTHETIC-OTHER-TEMPLATE"
        definitions["input_binding"] = mismatched_binding
        context["definitions"] = definitions
        self._assert_partial_context_stop(
            context,
            raw,
            raw_before,
            validated,
            validated_before,
            "definitions_binding",
        )


if __name__ == "__main__":
    unittest.main()
