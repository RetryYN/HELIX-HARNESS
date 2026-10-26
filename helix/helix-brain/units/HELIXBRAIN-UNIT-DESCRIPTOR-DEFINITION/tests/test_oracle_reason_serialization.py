"""R3-M1: FN4診断のUnicode canonical JSONをbyte列で確認する。"""
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


class TestOracleReasonSerialization(unittest.TestCase):
    def _assert_canonical_reason(self, rule):
        raw, _before, _slot, _fact, oracle, source, _old, _new = oracle_binding_rule_input(rule)
        oracle["ref"]["identity"] = "合成-オラクル束縛"
        mirror = source["content"]["oracle_bindings"][0]
        for member in mirror:
            mirror[member] = copy.deepcopy(oracle[member])
        _old, new = _rewrite_qualified_source_body(raw, source, source["content"])
        oracle["source_ref"] = copy.deepcopy(new)
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["unusable_source_refs"], [])
        context = {
            "validated": validated,
            "definitions": compare_descriptor_definitions({"validated": validated}),
            "identity_trace": compare_identity_versions_and_trace({"validated": validated}),
        }
        context_before = copy.deepcopy(context)
        result = compare_oracle_and_view_boundary(context)
        findings = [row for row in result["findings"] if row["code"] == rule]
        self.assertEqual(len(findings), 1)
        reason = findings[0]["reason"]
        prefix, separator, diagnostic_text = reason.partition("\n")
        self.assertEqual(separator, "\n")
        self.assertIn("合成-オラクル束縛", diagnostic_text)
        canonical = json.dumps(json.loads(diagnostic_text), ensure_ascii=False,
                               sort_keys=True, separators=(",", ":"))
        self.assertEqual(reason.encode("utf-8"), (prefix + "\n" + canonical).encode("utf-8"))
        self.assertEqual(raw, raw_before)
        self.assertEqual(context, context_before)

    def test_R71_reason_uses_recursive_unicode_key_order(self):
        self._assert_canonical_reason("unrelated_measurement")

    def test_R72_reason_uses_recursive_unicode_key_order(self):
        self._assert_canonical_reason("completion_oracle_revision")


if __name__ == "__main__":
    unittest.main()
