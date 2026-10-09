"""Focused tests for private SECURITY projection/ref comparison helpers."""
from __future__ import annotations

import unittest
from dataclasses import dataclass
from pathlib import Path
import sys

HERE = Path(__file__).resolve()
REPO_ROOT = HERE.parents[5]
sys.path.insert(0, str(HERE.parent.parent / "src"))
sys.path.insert(0, str(REPO_ROOT / "helix/helix-harness/units/common-kernel/src"))
sys.path.insert(0, str(REPO_ROOT / "helix/helix-harness/units/common-kernel/tests"))

import common_kernel as k1
import journal as k5
import permission as k3
import verification as k6

from projection import (
    _SecurityInputSlots,
    _project_existing_slots,
    _same_fixed_ref,
    _same_subject_ref,
)


@dataclass(frozen=True)
class _CaseRef:
    parent: k1.SubjectRef
    case: k1.SubjectRef


def _subject(kind="case", identity="id", revision="r1", digest="sha256:" + "a" * 64):
    return k1.SubjectRef(kind, identity, revision, digest)


class ProjectionPreservationTests(unittest.TestCase):
    def test_projection_preserves_existing_result_objects_and_all_slots(self):
        key = k1.ResultKey("read", "v1", _subject("query"), (), "scope")
        unknown = k1.Unknown(k1.UnknownReason.UNSUPPORTED, key, {"source": "owner"})
        unobserved = k1.Unobserved(key, k1.UnobservedWhy.NOT_RUN)
        diagnostic = k3.PermissionCheckDiagnostic(None, "missing_key")
        assurance = k6.Assurance(
            reverifiable=False,
            reproduction=None,
            issuer_authenticity=k1.Unknown(k1.UnknownReason.UNSUPPORTED, key),
        )
        required = k6.RequiredResult(
            combined=k1.Combined(k1.Verdict.UNDETERMINED, (unknown,), None, (), (0,), (), None),
            assurance={"verifier": assurance},
        )
        input_ref = _subject("source", "input")
        fixed_ref = k5.FixedRef("repository", "records/example", "sha256:" + "b" * 64)
        original = _SecurityInputSlots(
            case_ref=_CaseRef(_subject("parent"), _subject("case")),
            input_refs=(input_ref,),
            permission=diagnostic,
            label=unknown,
            effect=unobserved,
            verification=required,
            propagation=unknown,
            source_refs=(fixed_ref,),
        )

        projected = _project_existing_slots(original)

        self.assertIsNot(projected, original)
        self.assertEqual(type(projected), type(original))
        self.assertIs(projected.case_ref, original.case_ref)
        self.assertIs(projected.input_refs, original.input_refs)
        self.assertIs(projected.permission, diagnostic)
        self.assertIs(projected.label, unknown)
        self.assertIs(projected.effect, unobserved)
        self.assertIs(projected.verification, required)
        self.assertIs(projected.propagation, unknown)
        self.assertIs(projected.source_refs, original.source_refs)
        self.assertEqual(projected.permission.reason, "missing_key")
        self.assertIs(projected.verification.assurance["verifier"], assurance)
        self.assertIs(projected.verification.combined.components[0], unknown)


class ExplicitReferenceComparisonTests(unittest.TestCase):
    def test_subject_ref_all_fields_equal(self):
        self.assertTrue(_same_subject_ref(_subject(), _subject()))

    def test_subject_ref_kind_mismatch(self):
        self.assertFalse(_same_subject_ref(_subject(), _subject(kind="other")))

    def test_subject_ref_identity_mismatch(self):
        self.assertFalse(_same_subject_ref(_subject(), _subject(identity="other")))

    def test_subject_ref_revision_mismatch(self):
        self.assertFalse(_same_subject_ref(_subject(), _subject(revision="r2")))

    def test_subject_ref_digest_mismatch(self):
        self.assertFalse(_same_subject_ref(_subject(), _subject(digest="sha256:" + "c" * 64)))

    def test_fixed_ref_all_fields_equal(self):
        left = k5.FixedRef("repository", "records/example", "sha256:" + "a" * 64)
        right = k5.FixedRef("repository", "records/example", "sha256:" + "a" * 64)
        self.assertTrue(_same_fixed_ref(left, right))

    def test_fixed_ref_store_mismatch(self):
        self.assertFalse(_same_fixed_ref(
            k5.FixedRef("repository", "x", "d"), k5.FixedRef("stage", "x", "d")
        ))

    def test_fixed_ref_locator_mismatch(self):
        self.assertFalse(_same_fixed_ref(
            k5.FixedRef("repository", "x", "d"), k5.FixedRef("repository", "y", "d")
        ))

    def test_fixed_ref_digest_mismatch(self):
        self.assertFalse(_same_fixed_ref(
            k5.FixedRef("repository", "x", "d1"), k5.FixedRef("repository", "x", "d2")
        ))


if __name__ == "__main__":
    unittest.main()
