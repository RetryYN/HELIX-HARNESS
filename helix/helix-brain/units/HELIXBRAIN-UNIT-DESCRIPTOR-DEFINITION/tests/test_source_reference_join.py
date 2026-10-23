"""L5 /type_contract/reference_comparison: locatorを参照identityにしない。"""

import copy
import unittest

from descriptor_definitions import validate_supply_input
from supply_input_fixtures import base_input, load_document


class TestSourceReferenceJoin(unittest.TestCase):
    def test_equivalent_qualification_copy_with_other_locator_is_retained(self):
        raw = base_input(load_document())
        additional = copy.deepcopy(raw["qualifications"][0])
        additional["ref"]["source_locator"] = "/synthetic/qualification/copy"
        raw["qualifications"].append(additional)
        before = copy.deepcopy(raw)
        result = validate_supply_input(raw)
        self.assertEqual(result["input"], before, "semantic: both qualification occurrences remain")
        self.assertEqual(result["unusable_source_refs"], [], "semantic: locator is not reference identity")
        self.assertEqual(result["input_issues"], [], "semantic: equivalent reference occurrence is not conflict")
        self.assertEqual(raw, before, "semantic: raw input is unchanged")


if __name__ == "__main__":
    unittest.main()
