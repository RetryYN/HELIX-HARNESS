"""FN4 raw-runner absence populations retain their original snapshot presence.

The absent-vs-empty cases follow L4
``/oracle_view_boundary_contract/nonfire_read_plan/raw_domain/populations`` and
``/same_call/null_input``. The tests use fn0, the canonical FN1 walk, its
same-call frame inputs, and actual FN3 output. They do not fabricate an
upstream Comparison or claim that the normal 15-slot population is closed.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import validate_supply_input
from descriptor_target_frame import build_descriptor_claim_uses
from identity_trace import compare_identity_versions_and_trace
from oracle_binding_rules import compare_oracle_and_view_boundary_detail
from supply_input_fixtures import base_input, load_document


FN4_BACKFLOW = "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
FORMED_CONTEXT_STOP = "F05/F06/unclosed/formed_context;"


def _raw_runner_material(raw):
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    if not isinstance(validated.get("input"), dict):
        raise AssertionError("setup: fn0 must decode the selected typed input")
    if validated["input_issues"]:
        raise AssertionError("setup: selected input has no fn0 issues")
    validated_before = copy.deepcopy(validated)

    walk = evaluate_descriptor_definition_walk({"validated": validated})
    uses = build_descriptor_claim_uses(
        validated, walk["evaluation"], walk["target_reads"], walk["intent_reads"]
    )
    frame = {
        "validated": validated,
        "definition_evaluation": walk["evaluation"],
        "target_reads": walk["target_reads"],
        "claim_uses": uses,
    }
    # These are the declared raw-runner inputs: the same walk's fn1 Comparison
    # and actual fn3 Comparison from this ValidatedSupply.
    context = {
        "validated": validated,
        "definitions": walk["evaluation"]["comparison"],
        "identity_trace": compare_identity_versions_and_trace({"validated": validated}),
    }
    return raw_before, validated_before, validated, walk, frame, context


class TestFn4AbsentPopulations(unittest.TestCase):
    def _assert_unclosed_not_empty_success(self, raw):
        raw_before, validated_before, validated, walk, frame, context = _raw_runner_material(raw)
        self.assertEqual(context["definitions"], walk["evaluation"]["comparison"])
        self.assertIs(frame["validated"], validated)
        self.assertEqual(set(frame), {
            "validated", "definition_evaluation", "target_reads", "claim_uses",
        })

        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary_detail(context, frame)
        self.assertIn(FORMED_CONTEXT_STOP, str(caught.exception))
        self.assertIn(FN4_BACKFLOW, str(caught.exception))
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)

    def test_absent_claims_are_zero_occurrences_for_walk_and_frame(self):
        """Absent claims remain absent while the real same-call frame has zero uses."""
        raw = base_input(load_document())
        raw.pop("claims")
        # Keep the FN4 predicate population empty so this checks only the claim
        # absence path; the 15 descriptor slots still keep the overall context
        # outside the finite FN4 return branch.
        raw["oracle_bindings"] = []

        raw_before, validated_before, validated, walk, frame, context = _raw_runner_material(raw)
        self.assertNotIn("claims", raw_before)
        self.assertNotIn("claims", validated["input"])
        self.assertEqual(walk["target_reads"], [])
        self.assertEqual(walk["intent_reads"], [])
        self.assertEqual(frame["claim_uses"], [])
        self.assertEqual(context["definitions"], walk["evaluation"]["comparison"])

        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary_detail(context, frame)
        self.assertIn(FORMED_CONTEXT_STOP, str(caught.exception))
        self.assertIn(FN4_BACKFLOW, str(caught.exception))
        self.assertNotIn("claims", validated["input"])
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)

    def test_absent_oracle_bindings_are_zero_occurrences_not_a_keyerror(self):
        """Absent and empty oracle arrays share zero rows without closing normal FN4."""
        raw = base_input(load_document())
        raw.pop("oracle_bindings")
        raw["claims"] = []

        raw_before, validated_before, validated, walk, frame, context = _raw_runner_material(raw)
        self.assertNotIn("oracle_bindings", raw_before)
        self.assertNotIn("oracle_bindings", validated["input"])
        self.assertEqual(walk["target_reads"], [])
        self.assertEqual(walk["intent_reads"], [])
        self.assertEqual(frame["claim_uses"], [])
        self.assertEqual(context["definitions"], walk["evaluation"]["comparison"])

        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary_detail(context, frame)
        self.assertIn(FORMED_CONTEXT_STOP, str(caught.exception))
        self.assertIn(FN4_BACKFLOW, str(caught.exception))
        self.assertNotIn("oracle_bindings", validated["input"])
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)


if __name__ == "__main__":
    unittest.main()
