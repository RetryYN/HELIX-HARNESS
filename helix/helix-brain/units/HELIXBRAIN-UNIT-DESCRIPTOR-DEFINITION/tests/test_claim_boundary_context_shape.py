"""FN7 Context/ValidatedSupply envelope rejection tests.

These are deliberately malformed private protocol values, not valid fn0
outputs, not successful Comparison contexts, and not producer results. The
six None-valued Comparison placeholders below only let each negative isolate
the enclosing ClaimContext and ValidatedSupply shape checks; they do not
establish that any real ClaimContext has been constructed.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definitions import compare_claim_boundaries


CLAIM_CONTEXT_FIELDS = {
    "validated",
    "definitions",
    "values_applicability",
    "identity_trace",
    "oracle_view",
    "promotion",
    "dependencies_handoff",
}
BACKFLOW = "Backflow HELIXBRAIN-L6-032-FN7-CLAIM"


def _placeholder_context():
    """Malformed shell used only to reach an explicitly named shape stop."""
    return {member: None for member in CLAIM_CONTEXT_FIELDS}


class TestClaimBoundaryContextShape(unittest.TestCase):
    def _assert_unclosed(self, context, stop_id):
        before = copy.deepcopy(context)
        with self.assertRaises(NotImplementedError) as caught:
            compare_claim_boundaries(context)
        self.assertEqual(
            str(caught.exception),
            f"FN7/unclosed/{stop_id}; {BACKFLOW}",
        )
        self.assertEqual(context, before)

    def test_context_shape_rejects_nonobject_missing_and_extra_members(self):
        """L5 ClaimContext is one closed seven-field object."""
        cases = []
        cases.append(("nonobject", None))

        missing = _placeholder_context()
        missing.pop("dependencies_handoff")
        cases.append(("missing_member", missing))

        extra = _placeholder_context()
        extra["unmodeled"] = None
        cases.append(("extra_member", extra))

        for label, context in cases:
            with self.subTest(case=label):
                self._assert_unclosed(context, "claim_context_shape")

    def test_validated_supply_shape_rejects_nonobject_missing_extra_and_bad_arrays(self):
        """Only the fixed three-member ValidatedSupply envelope is accepted."""
        valid_shape = {
            "input": None,
            "input_issues": [],
            "unusable_source_refs": [],
        }
        cases = []
        cases.append(("nonobject", None))

        missing = copy.deepcopy(valid_shape)
        missing.pop("unusable_source_refs")
        cases.append(("missing_member", missing))

        extra = copy.deepcopy(valid_shape)
        extra["unmodeled"] = None
        cases.append(("extra_member", extra))

        bad_issues = copy.deepcopy(valid_shape)
        bad_issues["input_issues"] = None
        cases.append(("input_issues_nonarray", bad_issues))

        bad_unusable = copy.deepcopy(valid_shape)
        bad_unusable["unusable_source_refs"] = None
        cases.append(("unusable_source_refs_nonarray", bad_unusable))

        for label, validated in cases:
            with self.subTest(case=label):
                context = _placeholder_context()
                context["validated"] = validated
                self._assert_unclosed(context, "validated_supply_shape")

    def test_validated_input_scalar_or_null_stops_as_unclosed(self):
        """Scalar is ill-formed; the decode-null FN7 domain stays unclosed."""
        for label, raw_input in (
            ("scalar_input", "not-a-decoded-SupplyInput"),
            ("null_input", None),
        ):
            with self.subTest(case=label):
                context = _placeholder_context()
                context["validated"] = {
                    "input": raw_input,
                    "input_issues": [],
                    "unusable_source_refs": [],
                }
                self._assert_unclosed(context, "validated_input_unclosed")


if __name__ == "__main__":
    unittest.main()
