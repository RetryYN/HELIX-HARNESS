"""Focused tests for implemented pure K4/G3 comparison helpers only."""

from __future__ import annotations

from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import _k4_g3 as k4_g3  # noqa: E402
from common_kernel import Combined, Verdict, combine  # noqa: E402


class ObligationIdDeltaTests(unittest.TestCase):
    def test_exact_set_has_no_delta(self) -> None:
        self.assertEqual(
            k4_g3._obligation_id_delta(frozenset({"a", "b"}), frozenset({"a", "b"})),
            (frozenset(), frozenset()),
        )

    def test_missing_set_member_is_reported_without_fabricating_result(self) -> None:
        self.assertEqual(
            k4_g3._obligation_id_delta(frozenset({"a", "b"}), frozenset({"a"})),
            (frozenset({"b"}), frozenset()),
        )

    def test_unregistered_view_member_is_reported(self) -> None:
        self.assertEqual(
            k4_g3._obligation_id_delta(frozenset({"a"}), frozenset({"a", "x"})),
            (frozenset(), frozenset({"x"})),
        )

    def test_empty_set_does_not_get_a_private_positive_result(self) -> None:
        self.assertEqual(
            k4_g3._obligation_id_delta(frozenset(), frozenset()),
            (frozenset(), frozenset()),
        )
        combined = combine([])
        self.assertIsInstance(combined, Combined)
        self.assertEqual(combined.verdict, Verdict.UNDETERMINED)
        self.assertEqual(combined.set_reason.class_name, "Unknown")
        self.assertEqual(combined.set_reason.reason, "missing_input")


class DispositionCompletenessTests(unittest.TestCase):
    def test_not_applicable_requires_each_existing_field(self) -> None:
        complete = ("reason", "authority", "reentry")
        self.assertTrue(k4_g3._not_applicable_fields_complete(*complete))
        for index in range(3):
            fields = list(complete)
            fields[index] = None
            with self.subTest(missing=index):
                self.assertFalse(k4_g3._not_applicable_fields_complete(*fields))

    def test_deferred_requires_each_existing_field(self) -> None:
        complete = ("point", "owner", "condition")
        self.assertTrue(k4_g3._deferred_fields_complete(*complete))
        for index in range(3):
            fields = list(complete)
            fields[index] = None
            with self.subTest(missing=index):
                self.assertFalse(k4_g3._deferred_fields_complete(*fields))


class HandoffDeltaTests(unittest.TestCase):
    def setUp(self) -> None:
        self.expected = {
            "current": ("key-current", "result-current"),
            "removed-from-new-set": ("key-old", "result-old"),
        }

    def test_matching_unfinished_and_digest_pairs(self) -> None:
        self.assertEqual(
            k4_g3._handoff_delta(self.expected, ("current", "removed-from-new-set"), self.expected),
            (frozenset(), frozenset(), frozenset(), frozenset()),
        )

    def test_missing_new_set_unfinished_id(self) -> None:
        delta = k4_g3._handoff_delta(
            self.expected,
            ("removed-from-new-set",),
            self.expected,
        )
        self.assertEqual(delta, (frozenset({"current"}), frozenset(), frozenset(), frozenset()))

    def test_missing_old_set_unfinished_id(self) -> None:
        delta = k4_g3._handoff_delta(
            self.expected,
            ("current",),
            self.expected,
        )
        self.assertEqual(
            delta,
            (frozenset({"removed-from-new-set"}), frozenset(), frozenset(), frozenset()),
        )

    def test_extra_completed_id_is_unregistered_delta(self) -> None:
        delta = k4_g3._handoff_delta(
            self.expected,
            ("current", "removed-from-new-set", "completed"),
            self.expected,
        )
        self.assertEqual(delta, (frozenset(), frozenset({"completed"}), frozenset(), frozenset()))

    def test_missing_new_set_inherited_record(self) -> None:
        delta = k4_g3._handoff_delta(
            self.expected,
            ("current", "removed-from-new-set"),
            {"removed-from-new-set": self.expected["removed-from-new-set"]},
        )
        self.assertEqual(delta, (frozenset(), frozenset(), frozenset({"current"}), frozenset()))

    def test_missing_old_set_inherited_record(self) -> None:
        delta = k4_g3._handoff_delta(
            self.expected,
            ("current", "removed-from-new-set"),
            {"current": self.expected["current"]},
        )
        self.assertEqual(
            delta,
            (frozenset(), frozenset(), frozenset({"removed-from-new-set"}), frozenset()),
        )

    def test_new_set_record_digest_pair_mismatch(self) -> None:
        actual = dict(self.expected)
        actual["current"] = ("different-key", "result-current")
        delta = k4_g3._handoff_delta(self.expected, tuple(self.expected), actual)
        self.assertEqual(delta, (frozenset(), frozenset(), frozenset(), frozenset({"current"})))

    def test_old_set_record_digest_pair_mismatch(self) -> None:
        actual = dict(self.expected)
        actual["removed-from-new-set"] = ("key-old", "different-result")
        delta = k4_g3._handoff_delta(self.expected, tuple(self.expected), actual)
        self.assertEqual(
            delta,
            (frozenset(), frozenset(), frozenset(), frozenset({"removed-from-new-set"})),
        )


if __name__ == "__main__":
    unittest.main()
