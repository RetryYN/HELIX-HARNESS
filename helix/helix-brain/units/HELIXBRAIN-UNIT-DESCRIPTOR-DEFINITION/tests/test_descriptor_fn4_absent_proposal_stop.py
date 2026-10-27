"""Absent proposed_value remains unresolved and outside FN4's finite carry.

L4 /oracle_view_boundary_contract/nonfire_read_plan/raw_domain/claims keeps
absent distinct from explicit null and outside the finite branch. L5
/claim_intent_detail/reader maps fill_definition with absent proposed_value to
unresolved; /source_return_contract/descriptor_target_dataflow/direct_wrappers/fn4
and /functions/4 bound the finite carry cases.
"""
from __future__ import annotations

import copy
import unittest

from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import compare_oracle_and_view_boundary
from test_descriptor_fill_oracle_connection import _claim_finite_input, _same_call_context


EXPECTED_STOP = (
    "F05/F06/unclosed/oracle_claim_ports; owner=knowledge_owner; "
    "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
)


class TestDescriptorFn4AbsentProposalStop(unittest.TestCase):
    def test_absent_proposed_value_stays_unresolved_for_resolved_and_unknown_targets(self):
        for resolved_target in (True, False):
            with self.subTest(resolved_target=resolved_target):
                raw = _claim_finite_input(
                    proposed_value="temporary proposal value",
                    resolved_target=resolved_target,
                )
                raw["claims"][0].pop("proposed_value")
                raw_before, validated, _definitions, _identity, context, _carry = (
                    _same_call_context(raw)
                )
                self.assertNotIn("proposed_value", raw["claims"][0])
                walk = evaluate_descriptor_definition_walk({"validated": validated})
                self.assertEqual(walk["intent_reads"][0]["intent"], "unresolved")
                self.assertEqual(
                    walk["target_reads"][0]["state"],
                    "resolved" if resolved_target else "unknown",
                )
                context_before = copy.deepcopy(context)

                # Catch only the product call: another exception such as the
                # mutant KeyError must fail the NotImplementedError assertion.
                try:
                    compare_oracle_and_view_boundary(context)
                except Exception as caught:
                    self.assertIsInstance(caught, NotImplementedError)
                    self.assertEqual(str(caught), EXPECTED_STOP)
                else:
                    self.fail("absent proposal must stay outside the finite carry branch")

                self.assertEqual(raw, raw_before)
                self.assertEqual(context, context_before)


if __name__ == "__main__":
    unittest.main()
