"""Focused tests for private HARNESS comparison primitives only.

These are not executions of the formal L7 fixture corpus or public L5 APIs.
"""

from __future__ import annotations

from pathlib import Path
import sys
import unittest

_unit = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_unit / "src"))
sys.path.insert(0, str(_unit.parent / "common-kernel" / "src"))

from common_kernel import SubjectRef, Unknown  # noqa: E402
from stage1_pack import (  # noqa: E402
    _DeclaredFieldFact,
    _compare_declared_fields,
    _compare_field_refs,
)


def ref(identity: str, revision: str = "r1", digest: str = "sha256:" + "a" * 64) -> SubjectRef:
    return SubjectRef("contract", identity, revision, digest)


class PrivatePackComparisonTests(unittest.TestCase):
    def test_exact_ref_baseline_is_match_and_retains_all_refs(self) -> None:
        field = ref("field:owner")
        source = ref("source:owner")

        result = _compare_field_refs(field, source, source)

        self.assertEqual(result.comparison, "match")
        self.assertEqual(result.field_ref, field)
        self.assertEqual(result.left_ref, source)
        self.assertEqual(result.right_ref, source)

    def test_single_revision_mutation_is_domain_mismatch_not_k2_stale(self) -> None:
        field = ref("field:revision")
        baseline = ref("pack:one", "r1")
        changed = ref("pack:one", "r2")

        result = _compare_field_refs(field, baseline, changed)

        self.assertEqual(result.comparison, "mismatch")
        self.assertEqual((result.left_ref, result.right_ref), (baseline, changed))
        self.assertNotIsInstance(result, Unknown)

    def test_explicit_fields_keep_order_and_detect_one_mutation(self) -> None:
        field_identity = ref("field:identity")
        field_version = ref("field:version")
        identity = ref("pack:one")
        version = ref("version:one", "v1")
        changed_version = ref("version:one", "v2")

        evaluation = _compare_declared_fields(
            (
                _compare_field_refs(field_identity, identity, identity),
                _compare_field_refs(field_version, version, changed_version),
            ),
        )

        facts = evaluation.facts
        self.assertEqual([fact.comparison for fact in facts], ["match", "mismatch"])
        self.assertEqual([fact.field_ref for fact in facts], [field_identity, field_version])
        self.assertEqual((facts[1].left_ref, facts[1].right_ref), (version, changed_version))

    def test_explicit_missing_and_multiple_states_are_not_inferred(self) -> None:
        field_missing = ref("field:owner")
        field_multiple = ref("field:dependency")
        candidates = (ref("dependency:one"), ref("dependency:two"))

        evaluation = _compare_declared_fields(
            (
                _DeclaredFieldFact(field_missing, "missing", ()),
                _DeclaredFieldFact(field_multiple, "multiple", candidates),
            )
        )

        self.assertEqual([fact.state for fact in evaluation.facts], ["missing", "multiple"])
        self.assertEqual(evaluation.facts[0].candidate_refs, ())
        self.assertEqual(evaluation.facts[1].candidate_refs, candidates)

    def test_existing_owner_nonvalue_is_returned_by_identity(self) -> None:
        key_subject = ref("owner-result")
        from common_kernel import ResultKey  # local to keep test imports explicit

        key = ResultKey("fixture-owner-operation", "1", key_subject, (), "fixture")
        result = Unknown("unsupported", key, {"owner": "fixture-existing-result"})

        evaluation = _compare_declared_fields((), (result,))

        self.assertIs(evaluation.source_results[0], result)


if __name__ == "__main__":
    unittest.main()
