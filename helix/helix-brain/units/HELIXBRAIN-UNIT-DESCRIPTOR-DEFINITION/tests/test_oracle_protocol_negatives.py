"""Private-protocol defensive stops after building real FN0/FN1/FN3 frames.

Each case deliberately corrupts a real producer result after construction. It
does not represent a valid same-call FN0 snapshot or a successful FN1 input;
the assertions cover only fail-closed behavior at the private FN4 boundary.
"""

from __future__ import annotations

import copy
import unittest

from oracle_binding_rules import compare_oracle_and_view_boundary_detail
from oracle_projection_input_fixtures import oracle_projection_input
from test_oracle_rule_projection_contract import _private_context_and_frame


BACKFLOW = "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"


def _assert_stop(test, callback, branch):
    with test.assertRaises(NotImplementedError) as caught:
        callback()
    test.assertEqual(
        str(caught.exception),
        f"F05/F06/unclosed/{branch}; owner=knowledge_owner; {BACKFLOW}",
    )


def _measurement_fact(validated):
    raw = validated["input"]
    slot = next(
        row for row in raw["descriptors"] if row["descriptor_kind"] == "measurement"
    )
    return slot["facts"][0]


def _oracle_source(validated):
    raw = validated["input"]
    oracle_ref = raw["oracle_bindings"][0]["source_ref"]
    index, source = next(
        (index, row)
        for index, row in enumerate(raw["sources"])
        if row["ref"] == oracle_ref
    )
    return index, source


class OracleProtocolNegativeTests(unittest.TestCase):
    def test_measurement_fact_with_unknown_revision_stops_subject_join(self):
        raw, _before, _source = oracle_projection_input(rules=("measurement",))
        validated, context, frame = _private_context_and_frame(raw)
        self.assertIs(frame["validated"], context["validated"])

        _measurement_fact(validated)["ref"]["revision"] = None
        context_before = copy.deepcopy(context)
        frame_before = copy.deepcopy(frame)

        _assert_stop(
            self,
            lambda: compare_oracle_and_view_boundary_detail(context, frame),
            "oracle_subject_or_binding",
        )
        self.assertEqual(context, context_before)
        self.assertEqual(frame, frame_before)
        self.assertIs(frame["validated"], context["validated"])

    def test_unusable_source_ref_stops_even_when_qualification_remains_valid(self):
        raw, _before, _source = oracle_projection_input(rules=("measurement",))
        validated, context, frame = _private_context_and_frame(raw)
        self.assertIs(frame["validated"], context["validated"])
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["unusable_source_refs"], [])
        _source_index, source = _oracle_source(validated)
        self.assertEqual(source["role"], "semantic_json")
        self.assertIsInstance(source["qualification_ref"], dict)

        validated["unusable_source_refs"].append(copy.deepcopy(source["ref"]))
        context_before = copy.deepcopy(context)
        frame_before = copy.deepcopy(frame)

        _assert_stop(
            self,
            lambda: compare_oracle_and_view_boundary_detail(context, frame),
            "oracle_predicate_source",
        )
        self.assertEqual(context, context_before)
        self.assertEqual(frame, frame_before)
        self.assertIs(frame["validated"], context["validated"])

    def test_changed_qualification_link_stops_against_stale_fn0_metadata(self):
        raw, _before, _source = oracle_projection_input(rules=("measurement",))
        validated, context, frame = _private_context_and_frame(raw)
        self.assertIs(frame["validated"], context["validated"])
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["unusable_source_refs"], [])
        _source_index, source = _oracle_source(validated)
        self.assertEqual(source["role"], "semantic_json")

        source["qualification_ref"]["identity"] = "SYNTHETIC-MISSING-QUALIFICATION"
        context_before = copy.deepcopy(context)
        frame_before = copy.deepcopy(frame)

        _assert_stop(
            self,
            lambda: compare_oracle_and_view_boundary_detail(context, frame),
            "oracle_predicate_source",
        )
        self.assertEqual(context, context_before)
        self.assertEqual(frame, frame_before)
        self.assertIs(frame["validated"], context["validated"])


if __name__ == "__main__":
    unittest.main()
