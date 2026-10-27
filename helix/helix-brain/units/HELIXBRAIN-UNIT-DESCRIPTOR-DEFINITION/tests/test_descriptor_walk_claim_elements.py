"""FN7B residual Claim-element guard regressions through the real FN0."""

from __future__ import annotations

import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import validate_supply_input


_EXPECTED_STOP = (
    "F01/F02/unclosed/definition_meaning_walk/supplied_claim_ports; "
    "Backflow HELIXBRAIN-L6-032-N03-PATH"
)


class TestDescriptorWalkClaimElementGuard(unittest.TestCase):
    """Claim要素の不正型でも、既存の未閉包停止と原値保持を検査する。

    L5 /logical_input_structure/schema/$defs/Claim はClaimをobjectとして定義し、
    descriptor_definition_walkのsupplied_claim_portsは配列内の非object要素に対する
    既存停止境界である。FN0のclean結果はこの要素を含むrawの保持確認に限られ、
    Claim全体のschema適合を意味しない。新しい意味判定やgateは要求しない。
    """

    def test_non_object_claim_elements_keep_named_walk_stop(self):
        for claim_value in (1, None):
            with self.subTest(claim_value=claim_value):
                raw = descriptor_claim_input("positive")
                raw["claims"] = [claim_value]
                raw_before = copy.deepcopy(raw)

                validated = validate_supply_input(raw)
                self.assertIsNotNone(
                    validated["input"],
                    "FN0 should retain this JSON raw input for this boundary check",
                )
                self.assertEqual(validated["input"], raw_before)
                self.assertEqual(validated["input_issues"], [])
                self.assertEqual(validated["unusable_source_refs"], [])
                validated_before = copy.deepcopy(validated)

                caught = None
                try:
                    evaluate_descriptor_definition_walk({"validated": validated})
                except Exception as error:
                    caught = error
                finally:
                    self.assertEqual(raw, raw_before, "raw input must remain unchanged")
                    self.assertEqual(
                        validated,
                        validated_before,
                        "FN0 ValidatedSupply must remain unchanged",
                    )

                self.assertIsNotNone(caught, "walk should stop at the existing closed boundary")
                self.assertIsInstance(caught, NotImplementedError)
                self.assertEqual(str(caught), _EXPECTED_STOP)
