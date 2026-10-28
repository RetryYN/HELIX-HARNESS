"""rule 72 revision predicate checks from typed operands and the public call path.

The direct predicate cases test only revision comparison semantics; they do not
claim source qualification or an accepted FN0/FN1 context. The integration case
uses the real FN0→FN1/FN3→FN4 producer chain and checks that a nullable typed
OracleBinding oracle_ref is stopped instead of silently treated as non-firing.
"""

from __future__ import annotations

import copy
import unittest

from oracle_binding_rules import _revision_differs
from oracle_projection_input_fixtures import (
    oracle_projection_input,
    oracle_projection_public_context,
    synchronize_oracle_binding_source,
)
from oracle_view_boundary import compare_oracle_and_view_boundary as public_fn4


BACKFLOW = "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"


def _ref(
    *,
    identity="SYNTHETIC-ORACLE",
    revision="rev-a",
    scope=None,
    owner="synthetic-owner",
):
    return {
        "identity": identity,
        "revision": revision,
        "scope": {"project": "synthetic-project"}
        if scope is None
        else copy.deepcopy(scope),
        "owner": owner,
        "source_locator": "synthetic/oracle.json",
        "sha256": "a" * 64,
    }


class OracleRevisionPredicateTests(unittest.TestCase):
    def test_revision_difference_requires_known_matching_identity_scope_and_owner(self):
        cases = (
            (
                "different revision",
                _ref(revision="rev-a"),
                _ref(revision="rev-b"),
                True,
            ),
            ("same revision", _ref(revision="rev-a"), _ref(revision="rev-a"), False),
            (
                "different identity",
                _ref(identity="ORACLE-A"),
                _ref(identity="ORACLE-B", revision="rev-b"),
                False,
            ),
            (
                "different scope",
                _ref(scope={"project": "P-a"}),
                _ref(scope={"project": "P-b"}, revision="rev-b"),
                False,
            ),
            (
                "different owner",
                _ref(owner="owner-a"),
                _ref(owner="owner-b", revision="rev-b"),
                False,
            ),
        )
        for label, left, right, expected in cases:
            with self.subTest(case=label):
                before = copy.deepcopy((left, right))
                self.assertIs(_revision_differs(left, right), expected)
                self.assertEqual((left, right), before)

    def test_unknown_revision_on_either_operand_does_not_count_as_difference(self):
        cases = (
            ("left revision unknown", _ref(revision=None), _ref(revision="rev-b")),
            ("right revision unknown", _ref(revision="rev-a"), _ref(revision=None)),
        )
        for label, left, right in cases:
            with self.subTest(case=label):
                before = copy.deepcopy((left, right))
                self.assertFalse(_revision_differs(left, right))
                self.assertEqual((left, right), before)

    def test_absent_operand_does_not_count_as_revision_difference(self):
        left = _ref(revision="rev-a")
        right = _ref(revision="rev-b")
        before = copy.deepcopy((left, right))
        self.assertFalse(_revision_differs(None, right))
        self.assertFalse(_revision_differs(left, None))
        self.assertEqual((left, right), before)

    def test_public_fn4_stops_nullable_oracle_binding_oracle_ref(self):
        raw, _fixture_before, _source = oracle_projection_input(rules=("completion",))
        raw["oracle_bindings"][0]["oracle_ref"] = None
        synchronize_oracle_binding_source(raw)
        raw_before = copy.deepcopy(raw)

        validated, _definitions, _identity_trace, context = (
            oracle_projection_public_context(raw)
        )
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], raw_before)
        context_before = copy.deepcopy(context)

        with self.assertRaises(NotImplementedError) as raised:
            public_fn4(context)

        message = str(raised.exception)
        self.assertIn("F05/F06/unclosed/oracle_oracle_correspondence", message)
        self.assertIn("owner=knowledge_owner", message)
        self.assertIn(BACKFLOW, message)
        self.assertEqual(raw, raw_before)
        self.assertEqual(context, context_before)


if __name__ == "__main__":
    unittest.main()
