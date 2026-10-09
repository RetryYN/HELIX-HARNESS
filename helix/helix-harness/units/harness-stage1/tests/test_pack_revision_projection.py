"""Local tests for the private PackRevisionComparison payload projection.

These methods are implementation-only aliases to existing SUP-003/004/005
partial oracles. They do not execute the formal L7 corpus or public L5 API.
"""

from __future__ import annotations

from pathlib import Path
import sys
import unittest

_unit = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_unit / "src"))
sys.path.insert(0, str(_unit.parent / "common-kernel" / "src"))

from common_kernel import ResultKey, SubjectRef, Unknown  # noqa: E402
from pack_revision_projection import (  # noqa: E402
    _pack_revision_comparison_candidate,
)
from stage1_pack import (  # noqa: E402
    _DeclaredFieldFact,
    _compare_declared_fields,
    _compare_field_refs,
)


def ref(identity: str, revision: str = "r1", digest: str = "sha256:" + "a" * 64) -> SubjectRef:
    return SubjectRef("contract", identity, revision, digest)


def baseline_inputs() -> dict[str, object]:
    return {
        "declared_pack_refs": (ref("pack:main"),),
        "current_pack_refs": (ref("pack:main"),),
        "declared_contract_refs": (ref("contract:main"),),
        "current_contract_refs": (ref("contract:main"),),
        "declared_dependency_refs": (ref("dependency:main"),),
        "current_dependency_refs": (ref("dependency:main"),),
        "cause_dependency_refs": (ref("cause:dependency"),),
        "cause_pack_refs": (ref("cause:pack"),),
        "facts": (
            _compare_field_refs(ref("field:pack"), ref("pack:main"), ref("pack:main")),
            _DeclaredFieldFact(ref("field:declared-state"), "multiple", (ref("candidate:a"), ref("candidate:b"))),
            _compare_field_refs(ref("field:contract"), ref("contract:main"), ref("contract:main")),
        ),
        "revision_relation": "current",
    }


def construct(**changes: object):
    args = baseline_inputs()
    args.update(changes)
    return _pack_revision_comparison_candidate(**args)  # type: ignore[arg-type]


class PackRevisionProjectionTests(unittest.TestCase):
    def test_sup_harness_revision_001_current_baseline_retains_refs_and_mixed_fact_order(self) -> None:
        args = baseline_inputs()
        result = _pack_revision_comparison_candidate(**args)  # type: ignore[arg-type]

        for name in (
            "declared_pack_refs", "current_pack_refs",
            "declared_contract_refs", "current_contract_refs",
            "declared_dependency_refs", "current_dependency_refs",
            "cause_dependency_refs", "cause_pack_refs",
        ):
            self.assertEqual(getattr(result, name), args[name])
        self.assertEqual(result.revision_relation, "current")
        self.assertEqual(result.facts, args["facts"])
        self.assertTrue(all(actual is expected for actual, expected in zip(result.facts, args["facts"])))
        self.assertEqual(result.field_comparisons, (args["facts"][0], args["facts"][2]))  # type: ignore[index]
        self.assertEqual(result.declared_field_facts, (args["facts"][1],))  # type: ignore[index]

    def test_sup_harness_revision_002_stale_relation_is_retained_as_supplied(self) -> None:
        args = baseline_inputs()
        result = construct(revision_relation="stale")

        self.assertEqual(result.revision_relation, "stale")
        self.assertEqual(result.declared_pack_refs, args["declared_pack_refs"])
        self.assertEqual(result.current_pack_refs, args["current_pack_refs"])
        self.assertEqual(result.facts, args["facts"])

    def test_sup_harness_revision_003_declared_pack_ref_only_mutation_preserves_other_inputs(self) -> None:
        baseline = baseline_inputs()
        changed_declared_pack = (ref("pack:main", "r2"),)
        result = construct(declared_pack_refs=changed_declared_pack)

        self.assertEqual(result.declared_pack_refs, changed_declared_pack)
        self.assertEqual(result.current_pack_refs, baseline["current_pack_refs"])
        self.assertEqual(result.declared_contract_refs, baseline["declared_contract_refs"])
        self.assertEqual(result.current_contract_refs, baseline["current_contract_refs"])
        self.assertEqual(result.declared_dependency_refs, baseline["declared_dependency_refs"])
        self.assertEqual(result.current_dependency_refs, baseline["current_dependency_refs"])
        self.assertEqual(result.cause_dependency_refs, baseline["cause_dependency_refs"])
        self.assertEqual(result.cause_pack_refs, baseline["cause_pack_refs"])
        self.assertEqual(result.facts, baseline["facts"])
        self.assertEqual(result.revision_relation, "current")

    def test_sup_harness_revision_004_existing_unknown_is_preserved_outside_payload(self) -> None:
        subject = ref("owner:source")
        key = ResultKey("fixture-owner-operation", "1", subject, (), "fixture")
        evidence = {"owner": "existing-source-result"}
        unknown = Unknown("unreadable", key, evidence)

        evaluation = _compare_declared_fields((), (unknown,))

        self.assertEqual(evaluation.facts, ())
        self.assertIs(evaluation.source_results[0], unknown)
        self.assertIsInstance(evaluation.source_results[0], Unknown)
        self.assertEqual(evaluation.source_results[0].reason, "unreadable")
        self.assertIs(evaluation.source_results[0].evidence, evidence)


if __name__ == "__main__":
    unittest.main()
