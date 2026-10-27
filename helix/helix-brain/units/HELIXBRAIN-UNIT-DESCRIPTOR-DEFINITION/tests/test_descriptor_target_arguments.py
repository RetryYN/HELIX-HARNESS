"""L4 fill_definition専用portの経路外引数を明示停止する負例。"""
import copy
import unittest

from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definitions import validate_supply_input
from descriptor_target_reader import read_descriptor_replacement_target


class TestDescriptorTargetArguments(unittest.TestCase):
    def test_nonobject_or_other_kind_is_not_an_empty_unknown_read(self):
        raw = descriptor_claim_input()
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input_issues"], [])
        other_kind = copy.deepcopy(raw["claims"][0])
        other_kind["kind"] = "outside-the-fill-definition-port"
        # These are deliberate private argument violations, not a successful
        # Claim read or a ClaimContext/Comparison supplied by another producer.
        for label, claim in (("nonobject", None), ("other kind", other_kind)):
            with self.subTest(argument=label):
                before = copy.deepcopy((validated, claim))
                with self.assertRaises(NotImplementedError) as caught:
                    read_descriptor_replacement_target(validated, claim, "/claims/0")
                self.assertEqual(str(caught.exception),
                    "F01/F02/unclosed/descriptor_target_reader; "
                    "Backflow HELIXBRAIN-L6-032-N03-PATH")
                self.assertEqual((validated, claim), before)
