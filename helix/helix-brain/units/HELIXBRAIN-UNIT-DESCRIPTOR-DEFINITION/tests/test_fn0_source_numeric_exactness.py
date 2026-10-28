"""L5 strict source parseの有限数値同値と精度保持を検証する。

Oracle: L5 /wire_codec_contract/numeric_carrier_profile/number_rules/{factory,value_equality}
と /wire_codec_contract/numeric_carrier_profile/decode_steps。source内strict JSON
読取りも丸めずparseするが、ここでは新public numeric carrierを要求しない。
"""

from __future__ import annotations

import copy
import hashlib
import unittest

from descriptor_definitions import validate_supply_input
from supply_input_fixtures import base_input, load_document


def _raw_with_source_number(source_text, supplied_content):
    raw = base_input(load_document())
    source = raw["sources"][0]
    digest = hashlib.sha256(source_text.encode("utf-8", errors="strict")).hexdigest()
    source["content_bytes"] = source_text
    source["content"] = copy.deepcopy(supplied_content)
    source["ref"]["sha256"] = digest
    qualification = next(
        row
        for row in raw["qualifications"]
        if row["ref"]["identity"] == source["qualification_ref"]["identity"]
    )
    qualification["subject_ref"]["sha256"] = digest
    qualification["subject_sha256"] = digest
    return raw


class TestFn0SourceNumericExactness(unittest.TestCase):
    def test_inner_source_parse_does_not_round_distinct_decimal_values_together(self):
        raw = _raw_with_source_number(
            '{"value":9007199254740993.0}',
            {"value": 9007199254740992.0},
        )
        before = copy.deepcopy(raw)
        source_ref = copy.deepcopy(raw["sources"][0]["ref"])

        result = validate_supply_input(raw)

        self.assertEqual(result["input"], before)
        self.assertIn(source_ref, result["unusable_source_refs"])
        self.assertTrue(result["input_issues"])
        self.assertEqual(raw, before)

    def test_inner_source_decimal_token_equals_supplied_exact_integer_by_value(self):
        raw = _raw_with_source_number('{"value":1.0}', {"value": 1})
        before = copy.deepcopy(raw)

        result = validate_supply_input(raw)

        self.assertEqual(result["input"], before)
        self.assertEqual(result["unusable_source_refs"], [])
        self.assertEqual(result["input_issues"], [])
        self.assertEqual(raw, before)


if __name__ == "__main__":
    unittest.main()
