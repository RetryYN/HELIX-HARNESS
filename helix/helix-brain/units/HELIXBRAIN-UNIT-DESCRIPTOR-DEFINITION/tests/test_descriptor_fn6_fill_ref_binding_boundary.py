"""Keep FN6's original fill Claim Ref and Binding guards on the public path.

L4 /dependency_semantic_ports/claim_intent_protocol/rules/4 and
/dependency_semantic_ports/descriptor_target_contract/definition_consumer_boundary/claim_routes
keep Claim intent separate from structural subject/Binding validation. L5
/logical_input_structure/schema/$defs/Claim and /functions/6 preserve the
existing B02/F09 boundaries before a fill Claim can reach the new consumer.
"""
from __future__ import annotations

import copy
import unittest

from descriptor_definitions import (
    compare_dependencies_and_handoff,
    compare_descriptor_definitions,
    validate_supply_input,
)
from test_descriptor_fn6_rule87_occurrences import _raw_reference_claims


BACKFLOW = "HELIXBRAIN-L6-032-B02-FN6-PATH"
EXPECTED_STOPS = {
    "binding_mismatch": (
        "B02/claim_binding_mismatch: claims[0].binding does not match input.binding; "
        f"Backflow {BACKFLOW}"
    ),
    "subject_ref_string": (
        "B02/F09/claim_frame_or_actor: claims[0] has unsupported subject/binding/actor; "
        f"Backflow {BACKFLOW}"
    ),
    "binding_string": (
        "B02/F09/claim_frame_or_actor: claims[0] has unsupported subject/binding/actor; "
        f"Backflow {BACKFLOW}"
    ),
}


class TestDescriptorFn6FillRefBindingBoundary(unittest.TestCase):
    def test_fill_claim_preserves_ref_binding_shape_and_binding_equality(self):
        for variant, expected_stop in EXPECTED_STOPS.items():
            with self.subTest(variant=variant):
                raw = _raw_reference_claims(count=1)
                claim = raw["claims"][0]
                if variant == "binding_mismatch":
                    claim["binding"]["template_ref"]["identity"] = "claim-only-template"
                elif variant == "subject_ref_string":
                    claim["subject_ref"] = "not-a-Ref"
                elif variant == "binding_string":
                    claim["binding"] = "not-a-Binding"
                raw_before = copy.deepcopy(raw)

                # The fixture remains a genuine FN0 input. FN1 and public FN6
                # consume that same validated snapshot; no Comparison/frame is faked.
                validated = validate_supply_input(raw)
                self.assertIsNotNone(validated["input"])
                self.assertEqual(validated["input"], raw_before)
                self.assertEqual(validated["input_issues"], [])
                self.assertEqual(validated["unusable_source_refs"], [])
                definitions = compare_descriptor_definitions({"validated": validated})
                context = {"validated": validated, "definitions": definitions}
                context_before = copy.deepcopy(context)
                validated_before = copy.deepcopy(validated)

                try:
                    compare_dependencies_and_handoff(context)
                except Exception as caught:
                    self.assertIsInstance(caught, NotImplementedError)
                    self.assertEqual(str(caught), expected_stop)
                else:
                    self.fail(f"expected the existing FN6 guard for {variant}")

                self.assertEqual(raw, raw_before)
                self.assertEqual(validated, validated_before)
                self.assertEqual(validated["input"], raw_before)
                self.assertEqual(context, context_before)


if __name__ == "__main__":
    unittest.main()
