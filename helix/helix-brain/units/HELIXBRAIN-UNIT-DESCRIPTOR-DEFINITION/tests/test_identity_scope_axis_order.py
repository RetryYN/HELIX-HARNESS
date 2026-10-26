"""通常roleを持たない既存scope predicate軸はL4末尾domainへ置く。"""

import copy
import unittest

from descriptor_definitions import compare_identity_versions_and_trace, validate_supply_input
from identity_input_fixtures import normal_input


class TestIdentityScopeAxisOrder(unittest.TestCase):
    def test_scope_missing_axis_follows_trace_and_bilateral_domains(self):
        raw = normal_input()
        raw["binding"]["template_ref"]["scope"] = None
        before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input"], before)
        self.assertEqual(validated["input_issues"], [])
        result = compare_identity_versions_and_trace({"validated": validated})
        axes = result["axes"]
        self.assertEqual([row["axis"] for row in axes].count("scope"), 1)
        self.assertEqual(axes[-1]["axis"], "scope")
        self.assertEqual(axes[-1]["state"], "missing")
        self.assertEqual(axes[-1]["subject_ref"], before["binding"]["template_ref"])
        self.assertEqual(raw, before)
        self.assertEqual(validated["input"], before)


if __name__ == "__main__":
    unittest.main()
