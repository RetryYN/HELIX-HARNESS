"""L5 direct fn6 descriptor-fill接続を実FN0/FN1から確認する。

primary source_unresolvedはmeaning_undefinedでもmissingでもないため、
rule87を作らない。既存dependency/handoff prefixはClaim0対照から保持する。
手作りComparison、private frame、置換したreader返却を入力しない。
"""
from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definitions import (
    compare_dependencies_and_handoff,
    compare_descriptor_definitions,
    validate_supply_input,
)


def _call(raw):
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    if validated["input"] != raw_before or validated["input_issues"] or validated["unusable_source_refs"]:
        raise AssertionError("setup: actual FN0 clean and snapshot preserved")
    definitions = compare_descriptor_definitions({"validated": validated})
    context = {"validated": validated, "definitions": definitions}
    context_before = copy.deepcopy(context)
    try:
        return compare_dependencies_and_handoff(context)
    finally:
        if raw != raw_before or context != context_before:
            raise AssertionError("fn6 must preserve raw and same-call context")


class TestDescriptorFillDependenciesConnection(unittest.TestCase):
    def test_fill_without_primary_support_keeps_original_dependency_and_handoff_prefix(self):
        for dependencies in ("supplied", "absent"):
            for count in (1, 2):
                with self.subTest(dependencies=dependencies, claim_occurrences=count):
                    raw = descriptor_claim_input("positive")
                    if dependencies == "absent":
                        del raw["dependencies"]
                    if count == 2:
                        raw["claims"].append(copy.deepcopy(raw["claims"][0]))
                    baseline = copy.deepcopy(raw)
                    baseline["claims"] = []
                    prefix = _call(baseline)
                    result = _call(raw)
                    self.assertEqual(set(result), {"axes", "findings", "producer_symbol", "input_binding"})
                    self.assertEqual(result["producer_symbol"], "compare_dependencies_and_handoff")
                    self.assertEqual(result["input_binding"], raw["binding"])
                    self.assertEqual(result["axes"], prefix["axes"])
                    self.assertEqual(result["findings"], prefix["findings"])
                    self.assertFalse(any(row["code"] == "reference_as_required_definition" for row in result["findings"]))


if __name__ == "__main__":
    unittest.main()
