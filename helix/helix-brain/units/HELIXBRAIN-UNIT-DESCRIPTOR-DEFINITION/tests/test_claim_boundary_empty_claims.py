"""R1-m1 regression: actual FN0-FN6 path with an explicitly empty Claim array.

The independent expectation is the exact L4 finite_domain stop. The case does
not create a successful FN7 Comparison or treat an absent Claim collection as
empty. The expectation follows L4 unclosed_projection_boundaries/other_domain.
"""

from __future__ import annotations

import copy
import unittest

from claim_boundary_input_fixtures import finite_claim_input
from descriptor_definitions import compare_claim_boundaries
from test_claim_boundaries_finite import _actual_same_call

FINITE_DOMAIN_STOP = "FN7/unclosed/finite_domain; Backflow HELIXBRAIN-L6-032-FN7-CLAIM"


class TestClaimBoundaryEmptyClaims(unittest.TestCase):
    def test_explicit_empty_claims_stops_at_finite_domain_without_mutation(self):
        """An explicit [] is not normalized into FN7's empty Comparison."""
        raw = finite_claim_input("none")
        raw["claims"] = []
        raw_before = copy.deepcopy(raw)

        call = _actual_same_call(raw)
        self.assertEqual(raw["claims"], [])
        self.assertEqual(call["validated"]["input"], raw_before)
        self.assertEqual(call["validated"]["input_issues"], [])
        self.assertEqual(call["validated"]["unusable_source_refs"], [])
        self.assertEqual(raw, raw_before)

        # Assert all six actual same-call Comparisons remain unchanged across
        # the rejected FN7 call; no expected Comparison/frame is fabricated.
        comparisons_before = copy.deepcopy(call["comparisons"])
        validated_before = copy.deepcopy(call["validated"])
        context_before = copy.deepcopy(call["context"])
        walk_before = copy.deepcopy(call["walk"])
        uses_before = copy.deepcopy(call["uses"])
        with self.assertRaises(NotImplementedError) as caught:
            compare_claim_boundaries(call["context"])

        self.assertEqual(str(caught.exception), FINITE_DOMAIN_STOP)
        self.assertEqual(raw, raw_before)
        self.assertEqual(call["validated"], validated_before)
        self.assertEqual(call["comparisons"], comparisons_before)
        self.assertEqual(call["context"], context_before)
        self.assertEqual(call["walk"], walk_before)
        self.assertEqual(call["uses"], uses_before)
