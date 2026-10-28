"""Keep the existing FN6 Claim-frame boundary on real fill_definition inputs.

Independent contract anchors: L4 `/dependency_semantic_ports/claim_intent_protocol/rules/4`
and `/dependency_semantic_ports/descriptor_target_contract/definition_consumer_boundary/claim_routes`;
L5 `/logical_input_structure/schema/$defs/Claim`, `/functions/6`, and
`/source_return_contract/descriptor_target_dataflow/consumer`. The old B02/F09
six-field and actor checks remain in force; a real same-call Claim route must not
bypass them merely because `kind=fill_definition`.
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
    "actor_wrong": (
        "B02/F09/claim_frame_or_actor: claims[0] has unsupported subject/binding/actor; "
        f"Backflow {BACKFLOW}"
    ),
    "actor_absent": (
        "B02/F09/claim_closed_shape: claims[0] is outside the 6-field Claim shape; "
        f"Backflow {BACKFLOW}"
    ),
    "extra_member": (
        "B02/F09/claim_closed_shape: claims[0] is outside the 6-field Claim shape; "
        f"Backflow {BACKFLOW}"
    ),
}


class TestDescriptorFn6FillClaimBoundary(unittest.TestCase):
    def test_fill_claim_keeps_old_actor_and_closed_shape_stops(self):
        for variant, expected_stop in EXPECTED_STOPS.items():
            with self.subTest(variant=variant):
                raw = _raw_reference_claims(count=1)
                claim = raw["claims"][0]
                if variant == "actor_wrong":
                    claim["actor"] = "X"
                elif variant == "actor_absent":
                    claim.pop("actor")
                elif variant == "extra_member":
                    claim["unexpected_claim_member"] = "preserve raw input"
                raw_before = copy.deepcopy(raw)

                # FN0/FN1 form the real public FN6 context; no Comparison or
                # frame is supplied by this test.
                validated = validate_supply_input(raw)
                self.assertEqual(validated["input"], raw_before)
                self.assertEqual(validated["input_issues"], [])
                self.assertEqual(validated["unusable_source_refs"], [])
                definitions = compare_descriptor_definitions({"validated": validated})
                context = {"validated": validated, "definitions": definitions}
                context_before = copy.deepcopy(context)

                try:
                    compare_dependencies_and_handoff(context)
                except Exception as caught:
                    self.assertIsInstance(caught, NotImplementedError)
                    self.assertEqual(str(caught), expected_stop)
                else:
                    self.fail(f"expected existing FN6 stop for {variant}")

                self.assertEqual(raw, raw_before)
                self.assertEqual(context, context_before)
                self.assertEqual(validated["input"], raw_before)
                self.assertIn("proposed_value", raw["claims"][0])
                self.assertIn("basis_refs", raw["claims"][0])


if __name__ == "__main__":
    unittest.main()
