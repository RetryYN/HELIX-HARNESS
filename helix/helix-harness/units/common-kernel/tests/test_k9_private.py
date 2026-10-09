"""Meaningful local checks for K9's private, typed-input pure helpers only."""

from __future__ import annotations

from dataclasses import fields
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import common_kernel as k1  # noqa: E402
import _k9_private as k9  # noqa: E402

D1 = "sha256:" + "1" * 64
D2 = "sha256:" + "2" * 64


def _ref(identity: str, *, kind: str = "source", revision: str = "r1", digest: str = D1):
    return k1.SubjectRef(kind, identity, revision, digest)


def _key(identity: str, *, operation: str = "review_independence_component"):
    result = k1.key_of(
        operation,
        "K9",
        _ref(identity, kind="subject"),
        (_ref("input-" + identity, kind="input"),),
        "scope-task",
    )
    if not isinstance(result, k1.ResultKey):
        raise AssertionError("synthetic test key must satisfy existing K2 preconditions")
    return result


class K9ShapeProjectionTests(unittest.TestCase):
    def test_private_shapes_preserve_l4_field_order_and_names(self):
        self.assertEqual(
            [field.name for field in fields(k9._ParticipantSlot)],
            ["slot", "role", "actor", "origin", "context", "authority", "route"],
        )
        self.assertEqual(
            [field.name for field in fields(k9._RoleSelection)],
            ["role", "state", "source"],
        )
        self.assertEqual(
            [field.name for field in fields(k9._ReviewTarget)],
            ["artifact", "base", "task_scope", "oracle", "current_result", "case"],
        )
        self.assertEqual(
            [field.name for field in fields(k9._ReviewAxisCheck)],
            [
                "creator_slot",
                "creator_role",
                "axis",
                "creator_ref",
                "reviewer_ref",
                "comparison_contract",
                "creator_axis_identity",
                "reviewer_axis_identity",
                "relation",
            ],
        )
        self.assertEqual(k9.__all__, ())


class RoleBoundSourceAliasTests(unittest.TestCase):
    def test_exact_k9_alias_uses_raw_content_digest_and_context_fields(self):
        raw = _ref("shared", revision="r4", digest=D2)
        alias = k9._role_bound_source_ref("producer-slot", "producer", "context", "creator", raw)
        self.assertEqual(alias.kind, "k9_role_bound_source")
        self.assertEqual(
            alias.identity,
            k1._canonical_json_bytes(
                {
                    "slot": "producer-slot",
                    "role": "producer",
                    "axis": "context",
                    "side": "creator",
                    "source_kind": "source",
                    "source_identity": "shared",
                }
            ).decode("utf-8"),
        )
        self.assertEqual(alias.revision, raw.revision)
        self.assertEqual(alias.digest, raw.digest)

    def test_same_raw_ref_on_creator_and_reviewer_sides_keeps_both_aliases(self):
        raw = _ref("shared")
        sources = (
            k9._ComparisonSource("creator-1", "producer", "identity", "creator", raw),
            k9._ComparisonSource("reviewer-1", "reviewer", "identity", "reviewer", raw),
        )
        binding = k9._bind_role_bound_source_aliases(
            sources,
            binding_kind="owner_binding",
            binding_identity="owner-binding-current",
        )
        self.assertIsInstance(binding, k1.AliasBinding)
        self.assertEqual(len(binding.aliases), 2)
        self.assertEqual(len(binding.inputs), 3)  # binding ref plus both distinct aliases
        self.assertNotEqual(binding.aliases[0].alias_ref.identity, binding.aliases[1].alias_ref.identity)
        self.assertEqual({entry.raw_ref for entry in binding.aliases}, {raw})

    def test_exact_alias_duplicate_deduplicates_through_common_k2_helper(self):
        raw = _ref("shared")
        item = k9._ComparisonSource("slot", "producer", "identity", "creator", raw)
        binding = k9._bind_role_bound_source_aliases(
            (item, item), binding_kind="owner_binding", binding_identity="owner-binding-current"
        )
        self.assertIsInstance(binding, k1.AliasBinding)
        self.assertEqual(len(binding.aliases), 1)
        self.assertEqual(len(binding.inputs), 2)

    def test_same_alias_identity_with_different_raw_revision_is_rejected_by_k2_helper(self):
        sources = (
            k9._ComparisonSource("slot", "producer", "identity", "creator", _ref("shared")),
            k9._ComparisonSource(
                "slot", "producer", "identity", "creator", _ref("shared", revision="r2", digest=D2)
            ),
        )
        result = k9._bind_role_bound_source_aliases(
            sources, binding_kind="owner_binding", binding_identity="owner-binding-current"
        )
        self.assertEqual(result, k1.Rejected("missing_key"))

    def test_nullable_source_is_not_replaced_with_a_fabricated_ref(self):
        result = k9._bind_role_bound_source_aliases(
            (k9._ComparisonSource("slot", "reviewer", "route", "reviewer", None),),
            binding_kind="owner_binding",
            binding_identity="owner-binding-current",
        )
        self.assertIsInstance(result, k1.AliasBinding)
        self.assertEqual(result.aliases, ())
        self.assertEqual(len(result.inputs), 1)


class TargetAndAxisComparisonTests(unittest.TestCase):
    def setUp(self):
        self.target = k9._ReviewTarget(
            _ref("artifact", kind="target"),
            _ref("base", kind="target"),
            _ref("scope", kind="target"),
            _ref("oracle", kind="target"),
            _ref("result", kind="target"),
            _ref("case", kind="target"),
        )

    def test_all_six_review_target_fields_compare_in_fixed_order(self):
        fields_in_order = ("artifact", "base", "task_scope", "oracle", "current_result", "case")
        for field in fields_in_order:
            changed = dict((name, getattr(self.target, name)) for name in fields_in_order)
            changed[field] = _ref(field + "-changed", kind="target")
            with self.subTest(field=field):
                self.assertEqual(
                    k9._review_target_mismatches(self.target, k9._ReviewTarget(**changed)),
                    (field,),
                )
        self.assertEqual(k9._review_target_mismatches(self.target, self.target), ())

    def test_axis_comparison_retains_every_slot_and_axis_after_a_collision(self):
        rows = []
        for slot, role in (("slot-1", "producer"), ("slot-2", "helper")):
            for axis in ("identity", "context", "authority", "route"):
                left = f"{slot}-{axis}-left"
                right = left if (slot, axis) == ("slot-1", "identity") else f"{slot}-{axis}-right"
                rows.append(
                    k9._AxisComparisonInput(
                        creator_slot=slot,
                        creator_role=role,
                        axis=axis,
                        creator_ref=_ref(left),
                        reviewer_ref=_ref(right),
                        comparison_contract=_ref(axis, kind="contract"),
                        creator_axis_identity=left,
                        reviewer_axis_identity=right,
                        comparison_key=_key(f"{slot}-{axis}"),
                        evidence={"fixture": "typed-owner-resolved-input"},
                    )
                )
        checks = k9._compare_resolved_axes(rows)
        self.assertEqual(len(checks), 8)
        self.assertEqual(
            tuple((check.creator_slot, check.axis) for check in checks),
            tuple((row.creator_slot, row.axis) for row in rows),
        )
        self.assertEqual(tuple(check.relation.value for check in checks), ("same",) + ("distinct",) * 7)
        self.assertTrue(all(check.relation.key == _key(f"{check.creator_slot}-{check.axis}") for check in checks))

    def test_unresolved_axis_preserves_the_existing_nonvalue_and_does_not_compare(self):
        existing = k1.Unknown(k1.UnknownReason.UNSUPPORTED, _key("route-unknown"), {"source": "owner"})
        row = k9._AxisComparisonInput(
            creator_slot="creator-1",
            creator_role="producer",
            axis="route",
            creator_ref=None,
            reviewer_ref=None,
            comparison_contract=None,
            creator_axis_identity=None,
            reviewer_axis_identity="route-r1",
            comparison_key=None,
            evidence=None,
            unresolved_relation=existing,
        )
        check = k9._compare_resolved_axes((row,))[0]
        self.assertIs(check.relation, existing)
        self.assertEqual(check.creator_axis_identity, None)
        self.assertEqual(check.reviewer_axis_identity, "route-r1")

    def test_resolved_axis_requires_existing_key_and_unresolved_relation(self):
        row = k9._AxisComparisonInput(
            creator_slot="creator-1",
            creator_role="producer",
            axis="identity",
            creator_ref=_ref("creator"),
            reviewer_ref=_ref("reviewer"),
            comparison_contract=None,
            creator_axis_identity="creator",
            reviewer_axis_identity="reviewer",
            comparison_key=None,
            evidence=None,
        )
        with self.assertRaises(TypeError):
            k9._compare_resolved_axes((row,))


class K9PolarityDelegationTests(unittest.TestCase):
    def test_same_is_negative_and_all_nonvalues_survive_the_existing_k1_fold(self):
        same_key = _key("axis-same")
        unknown_key = _key("axis-unknown")
        components = (
            k1.Value(k9._AxisRelationFact("slot", "identity", "same"), same_key, {"axis": "identity"}),
            k1.Unknown(k1.UnknownReason.UNSUPPORTED, unknown_key, {"axis": "route"}),
        )
        combined = k9._combine_review_components(components)
        self.assertIsInstance(combined, k1.Combined)
        self.assertEqual(combined.verdict, k1.Verdict.NEGATIVE)
        self.assertEqual(combined.negatives, (0,))
        self.assertEqual(combined.non_values, (1,))
        self.assertEqual(
            combined.polarity,
            (
                k1.PolarityRef("k9_independence_polarity", "K9"),
                k1.PolarityRef("k9_independence_polarity", "K9"),
            ),
        )

    def test_distinct_complete_nonempty_are_positive_through_existing_k1_fold(self):
        facts = (
            k9._AxisRelationFact("slot", "identity", "distinct"),
            k9._RosterCompletenessFact(True),
            k9._CreatorSetNonemptyFact(True),
        )
        components = tuple(
            k1.Value(fact, _key(f"positive-{index}"), {"fact": index})
            for index, fact in enumerate(facts)
        )
        combined = k9._combine_review_components(components)
        self.assertIsInstance(combined, k1.Combined)
        self.assertEqual(combined.verdict, k1.Verdict.POSITIVE)
        self.assertEqual(combined.negatives, ())
        self.assertEqual(combined.non_values, ())

    def test_empty_component_set_uses_k1_existing_missing_input_set_diagnostic(self):
        combined = k9._combine_review_components(())
        self.assertIsInstance(combined, k1.Combined)
        self.assertEqual(combined.verdict, k1.Verdict.UNDETERMINED)
        self.assertEqual(combined.set_reason, k1.SetDiagnostic("Unknown", "missing_input"))

    def test_nonaffirmative_facts_are_not_fabricated_as_negative_or_positive_values(self):
        with self.assertRaises(TypeError):
            k9._k9_independence_polarity(k9._RosterCompletenessFact(False))
        with self.assertRaises(TypeError):
            k9._k9_independence_polarity(k9._CreatorSetNonemptyFact(False))


if __name__ == "__main__":
    unittest.main()
