"""BRAIN032 ADD05/ADD07の限定反例。期待は既存L5/L8から独立に導く。

L5 /functions/0、/wire_codec_contract/source_byte_and_qualification_order、
L8 /additional_unit_cases/{4,6}。元bytes/digestを保つbody差と、原source
scopeを保つqualificationの別tenant差は、shape受理で資格成功にしない。
"""

import copy
import unittest

from descriptor_definitions import validate_supply_input
from supply_input_fixtures import base_input, load_document


class TestSourceContentAndScope(unittest.TestCase):
    def assert_only_source_zero_unusable(self, raw):
        before = copy.deepcopy(raw)
        result = validate_supply_input(raw)
        self.assertEqual(result["input"], before, "semantic: decoded input is retained")
        self.assertIn(raw["sources"][0]["ref"], result["unusable_source_refs"],
                      "semantic: source0 with invalid body or scope must be unusable")
        for source in raw["sources"][1:]:
            self.assertNotIn(source["ref"], result["unusable_source_refs"],
                             "semantic: unrelated source is retained")
        self.assertTrue(result["input_issues"], "semantic: source failure is visible")
        self.assertEqual(raw, before, "semantic: raw input is unchanged")
        return result

    def test_add05_changed_body_with_original_bytes_is_unusable(self):
        raw = base_input(load_document())
        original_bytes = raw["sources"][0]["content_bytes"]
        original_digest = raw["sources"][0]["ref"]["sha256"]
        raw["sources"][0]["content"]["binding"]["version_target"] = "synthetic-other-version"
        self.assertEqual(raw["sources"][0]["content_bytes"], original_bytes, "setup: original bytes")
        self.assertEqual(raw["sources"][0]["ref"]["sha256"], original_digest, "setup: original digest")
        self.assert_only_source_zero_unusable(raw)

    def test_add07_other_qualification_tenant_is_unusable(self):
        raw = base_input(load_document())
        original_source = copy.deepcopy(raw["sources"][0])
        raw["qualifications"][0]["applicable_scope"]["tenant"] = "synthetic-other-tenant"
        self.assertEqual(raw["sources"][0], original_source, "setup: original source")
        result = self.assert_only_source_zero_unusable(raw)
        # L5 call_return_closure/fn0_qualification_scope_issue_serialization。
        self.assertIn({
            "locator": "/qualifications/0/applicable_scope",
            "reason": "原資格の適用scopeが当該sourceのscopeに対応しない。",
            "source_ref": original_source["ref"],
        }, result["input_issues"], "semantic: original qualification scope diagnostic")


if __name__ == "__main__":
    unittest.main()
