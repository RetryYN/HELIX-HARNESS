"""Partial local comparisons only; these do not execute K7/G5 public APIs."""

from __future__ import annotations

from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import _k7_g5_private as helpers  # noqa: E402
import journal as k5  # noqa: E402
from common_kernel import SubjectRef  # noqa: E402


class K7G5PrivatePartialTests(unittest.TestCase):
    def test_ck_k7_ut_006_explicit_head_mismatch_is_only_a_bool(self) -> None:
        segment = k5.SegmentId("pointer", "writer", 1)
        baseline = k5.SegmentHead(segment, 3, "entry-3")
        self.assertTrue(helpers._same_head(baseline, baseline))

        mutated = k5.SegmentHead(segment, 2, "entry-2")
        self.assertFalse(helpers._same_head(baseline, mutated))

    def test_ck_k7_ut_033_target_identity_mismatch_is_only_a_bool(self) -> None:
        self.assertTrue(helpers._same_target_identity("stage-a", "stage-a"))
        self.assertFalse(helpers._same_target_identity("stage-a", "stage-b"))

    def test_ck_k7_ut_035_composition_ref_mismatch_is_only_a_bool(self) -> None:
        digest = "sha256:" + "1" * 64
        baseline = SubjectRef("composition", "bundle-a", "r1", digest)
        self.assertTrue(helpers._same_subject_ref(baseline, baseline))

        mutated = SubjectRef("composition", "bundle-b", "r1", digest)
        self.assertFalse(helpers._same_subject_ref(baseline, mutated))

    def test_ck_g5_ut_035_keeps_two_classes_for_one_identity(self) -> None:
        supplied = (("recipient-a", "worker_run"), ("recipient-a", "approval_consumer"))
        observed = helpers._identity_class_pairs(supplied)
        self.assertEqual(
            observed,
            frozenset({("recipient-a", "worker_run"), ("recipient-a", "approval_consumer")}),
        )

    def test_ck_g5_ut_036_single_missing_class_is_detected(self) -> None:
        expected = frozenset({("recipient-a", "worker_run"), ("recipient-a", "approval_consumer")})
        baseline = helpers._identity_class_pairs(tuple(expected))
        self.assertEqual(baseline, expected)

        mutated = helpers._identity_class_pairs((("recipient-a", "worker_run"),))
        self.assertNotEqual(mutated, expected)
        self.assertNotIn(("recipient-a", "approval_consumer"), mutated)


if __name__ == "__main__":
    unittest.main()
