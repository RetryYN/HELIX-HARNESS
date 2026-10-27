"""未知owner Source RefをFN0原値とowner取得結果に保持する。

期待値はL4のRef/QualifiedSource/Qualification schemaとL5の
execution_contract/qualificationから独立に導く。identity=nullはRefのwire型内だが、
full Ref自己比較の一致や独立Qualificationとの一致を成立させない。FN0は原source
snapshotを保持して未資格Refを報告し、owner material取得はそのphysical source全値を
残したままusable=Falseとする。
"""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_target_reader import _collect_owner_target_material
from supply_validation import validate_supply_input


class TestDescriptorOwnerUnresolvedRef(unittest.TestCase):
    def test_null_identity_source_is_retained_but_not_usable(self) -> None:
        raw = descriptor_claim_input("positive")
        self.assertEqual(raw["sources"][2]["role"], "semantic_json")

        # Preserve the original independent qualification. Only the physical
        # source Ref's typed identity value becomes unknown.
        raw["sources"][2]["ref"]["identity"] = None
        source_ref = copy.deepcopy(raw["sources"][2]["ref"])
        raw_before = copy.deepcopy(raw)

        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"], "setup: FN0 should retain the wire-valid Ref")
        self.assertEqual(validated["input"], raw_before)
        self.assertIn(
            source_ref,
            validated["unusable_source_refs"],
            "the unresolved source's exact Ref must be reported as unusable",
        )
        source_issues = [
            issue for issue in validated["input_issues"]
            if issue.get("locator") == "/sources/2"
        ]
        self.assertEqual(len(source_issues), 1)
        self.assertEqual(source_issues[0]["source_ref"], source_ref)

        validated_before = copy.deepcopy(validated)
        claim = validated["input"]["claims"][0]
        material = _collect_owner_target_material(validated, claim)

        self.assertEqual(
            material["sources"][2],
            {
                "source_index": 2,
                "source": copy.deepcopy(raw_before["sources"][2]),
                "usable": False,
            },
        )
        self.assertEqual(
            [row["source"] for row in material["sources"]],
            raw_before["sources"],
            "owner acquisition must retain every physical source in original order",
        )
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)


if __name__ == "__main__":
    unittest.main()
