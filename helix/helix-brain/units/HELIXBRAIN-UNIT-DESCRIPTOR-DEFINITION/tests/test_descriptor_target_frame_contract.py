"""FN4 consumes only same-call frame material and keeps malformed frames closed.

Frame fields are derived from L5
``/source_return_contract/descriptor_target_dataflow/transport_types/DescriptorTargetCallFrame``.
The zero-use case follows the L5 ``build_descriptor_claim_uses`` consumer and
L4 ``/oracle_view_boundary_contract/same_call``. Corrupted private arguments
below are explicit negative controls, not valid fn0 inputs or real raw-runner
frames.
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
CLAIM_USES_STOP = "F05/F06/unclosed/descriptor_claim_uses; owner=knowledge_owner;"
ORACLE_FRAME_STOP = "F05/F06/unclosed/oracle_frame;"
ORACLE_EVALUATION_STOP = "F05/F06/unclosed/oracle_evaluation;"
FORMED_CONTEXT_STOP = "F05/F06/unclosed/formed_context;"
FRAME_FIELDS = {"validated", "definition_evaluation", "target_reads", "claim_uses"}
EVALUATION_FIELDS = {"comparison", "assessments"}


def _real_material():
    raw = base_input(load_document())
    raw["claims"] = []
    raw["oracle_bindings"] = []
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    if not isinstance(validated.get("input"), dict) or validated["input_issues"]:
        raise AssertionError(
            "setup: fn0 must accept the selected raw input without issues"
        )
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
    context = {
        "validated": validated,
        "definitions": walk["evaluation"]["comparison"],
        "identity_trace": compare_identity_versions_and_trace({"validated": validated}),
    }
    return raw, raw_before, validated, validated_before, walk, frame, context


class TestDescriptorTargetFrameContract(unittest.TestCase):
    def test_real_zero_claim_walk_builds_exact_empty_claim_use_frame(self):
        """A real no-Claim walk yields zero uses; its frame keeps the same snapshot."""
        raw, raw_before, validated, validated_before, walk, frame, context = (
            _real_material()
        )
        self.assertEqual(
            set(walk), {"evaluation", "native_material", "target_reads", "intent_reads"}
        )
        self.assertEqual(set(walk["evaluation"]), EVALUATION_FIELDS)
        self.assertEqual(walk["target_reads"], [])
        self.assertEqual(walk["intent_reads"], [])
        self.assertEqual(frame["claim_uses"], [])
        self.assertEqual(set(frame), FRAME_FIELDS)
        self.assertIs(frame["validated"], validated)
        self.assertIs(frame["definition_evaluation"], walk["evaluation"])
        self.assertEqual(context["definitions"], walk["evaluation"]["comparison"])

        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary_detail(context, frame)
        self.assertIn(FORMED_CONTEXT_STOP, str(caught.exception))
        self.assertIn(FN4_BACKFLOW, str(caught.exception))
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)

    def test_claim_use_builder_rejects_private_reads_not_from_zero_claim_walk(self):
        """Typed nonempty private reads are invalid transport here, not product input."""
        _raw, _raw_before, validated, _validated_before, walk, _frame, _context = (
            _real_material()
        )
        raw_binding = validated["input"]["binding"]
        claim = {
            "subject_ref": copy.deepcopy(raw_binding["template_ref"]),
            "binding": copy.deepcopy(raw_binding),
            "actor": None,
            "kind": "fill_definition",
            "proposed_value": None,
            "basis_refs": [],
        }
        target_read = {
            "claim_locator": "/claims/0",
            "claim": claim,
            "candidate_indices": [],
            "candidate_refs": [],
            "occurrences": [],
            "matches": [],
            "state": "unknown",
            "problems": [],
        }
        intent_read = {
            "claim_locator": "/claims/0",
            "claim": claim,
            "kind": {"presence": "supplied", "value": "fill_definition"},
            "proposed_value": {"presence": "supplied", "value": None},
            "intent": "unresolved",
            "reason": "private negative control",
        }
        cases = (
            ("target_reads", [target_read], []),
            ("intent_reads", [], [intent_read]),
        )
        for label, target_reads, intent_reads in cases:
            with self.subTest(protocol=label):
                with self.assertRaises(NotImplementedError) as caught:
                    build_descriptor_claim_uses(
                        validated, walk["evaluation"], target_reads, intent_reads
                    )
                self.assertIn(CLAIM_USES_STOP, str(caught.exception))
                self.assertIn(FN4_BACKFLOW, str(caught.exception))

    def test_claim_use_builder_rejects_malformed_evaluation_shape(self):
        """Malformed evaluation members are not accepted as a zero-Claim walk."""
        _raw, _raw_before, validated, _validated_before, walk, _frame, _context = (
            _real_material()
        )
        malformed_evaluations = (
            {**copy.deepcopy(walk["evaluation"]), "assessments": None},
            {"comparison": copy.deepcopy(walk["evaluation"]["comparison"])},
            {**copy.deepcopy(walk["evaluation"]), "unexpected": []},
        )
        for malformed in malformed_evaluations:
            with self.subTest(evaluation=malformed):
                with self.assertRaises(NotImplementedError) as caught:
                    build_descriptor_claim_uses(validated, malformed, [], [])
                self.assertIn(CLAIM_USES_STOP, str(caught.exception))
                self.assertIn(FN4_BACKFLOW, str(caught.exception))

    def test_claim_use_builder_rejects_assessments_on_null_input_walk(self):
        """A null-input walk has no assessments; corrupted private events stop."""
        validated = validate_supply_input(7)
        walk = evaluate_descriptor_definition_walk({"validated": validated})
        self.assertIsNone(validated["input"])
        self.assertEqual(walk["evaluation"]["assessments"], [])
        malformed = copy.deepcopy(walk["evaluation"])
        malformed["assessments"] = [{}]
        with self.assertRaises(NotImplementedError) as caught:
            build_descriptor_claim_uses(validated, malformed, [], [])
        self.assertIn(CLAIM_USES_STOP, str(caught.exception))
        self.assertIn(FN4_BACKFLOW, str(caught.exception))

    def test_private_detail_rejects_corrupted_frame_shape(self):
        """The closed frame is validated before any FN4 predicate is evaluated."""
        _raw, raw_before, validated, validated_before, _walk, frame, context = (
            _real_material()
        )
        invalid = dict(frame)
        invalid["caller_override"] = {}
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary_detail(context, invalid)
        self.assertIn(ORACLE_FRAME_STOP, str(caught.exception))
        self.assertIn(FN4_BACKFLOW, str(caught.exception))
        self.assertEqual(context["validated"], validated)
        self.assertEqual(raw_before, validated["input"])
        self.assertEqual(validated, validated_before)

    def test_private_detail_rejects_corrupted_evaluation_shape(self):
        """The nested evaluation must retain its two typed fields."""
        _raw, raw_before, validated, validated_before, _walk, frame, context = (
            _real_material()
        )
        invalid = dict(frame)
        invalid["definition_evaluation"] = {
            "comparison": copy.deepcopy(frame["definition_evaluation"]["comparison"]),
        }
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary_detail(context, invalid)
        self.assertIn(ORACLE_EVALUATION_STOP, str(caught.exception))
        self.assertIn(FN4_BACKFLOW, str(caught.exception))
        self.assertEqual(raw_before, validated["input"])
        self.assertEqual(validated, validated_before)


if __name__ == "__main__":
    unittest.main()
