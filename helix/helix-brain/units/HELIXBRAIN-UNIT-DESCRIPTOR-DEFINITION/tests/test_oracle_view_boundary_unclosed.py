"""fn4の未閉包をdecode可能な実same-call Contextで確認する。

L4 oracle_view_boundary_contract/limits[1] とsame_call/invalid_contextを根拠に、
normal_controlの実oracle/value/対象slotをempty成功へ置換しない。
"""

import copy
import unittest

from descriptor_definitions import (
    compare_descriptor_definitions,
    compare_identity_versions_and_trace,
    compare_oracle_and_view_boundary,
    validate_supply_input,
)
from identity_input_fixtures import normal_input


class TestOracleViewBoundaryUnclosed(unittest.TestCase):
    def _context(self):
        raw = normal_input()
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input_issues"], [])
        return raw, {
            "validated": validated,
            "definitions": compare_descriptor_definitions({"validated": validated}),
            "identity_trace": compare_identity_versions_and_trace(
                {"validated": validated}
            ),
        }

    def test_normal_real_oracle_population_is_identified_as_unimplemented(self):
        raw, context = self._context()
        self.assertTrue(raw["oracle_bindings"])
        self.assertTrue(raw["values"])
        self.assertTrue(
            any(slot["descriptor_kind"] == "measurement" for slot in raw["descriptors"])
        )
        before = copy.deepcopy(context)
        raw_before = copy.deepcopy(raw)
        with self.subTest(
            case="HELIXBRAIN-L8-032-NORMAL-compare_oracle_and_view_boundary"
        ):
            with self.assertRaises(NotImplementedError) as caught:
                compare_oracle_and_view_boundary(context)
            self.assertIn("F05/F06/unclosed/formed_context;", str(caught.exception))
            self.assertIn(
                "Backflow HELIXBRAIN-L6-032-FN4-ORACLE", str(caught.exception)
            )
        self.assertEqual(context, before)
        self.assertEqual(raw, raw_before)

    def test_public_context_does_not_accept_a_private_frame_override(self):
        raw, context = self._context()
        context["frame"] = {}
        before = copy.deepcopy(context)
        raw_before = copy.deepcopy(raw)
        with self.subTest(branch="oracle_context_shape"):
            with self.assertRaises(NotImplementedError) as caught:
                compare_oracle_and_view_boundary(context)
            self.assertIn(
                "F05/F06/unclosed/oracle_context_shape;", str(caught.exception)
            )
            self.assertIn(
                "Backflow HELIXBRAIN-L6-032-FN4-ORACLE", str(caught.exception)
            )
        self.assertEqual(context, before)
        self.assertEqual(raw, raw_before)


if __name__ == "__main__":
    unittest.main()
