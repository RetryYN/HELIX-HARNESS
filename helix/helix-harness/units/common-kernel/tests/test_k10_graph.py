"""Local K10 pure-field tests; they do not execute public APIs or owner readers."""

from __future__ import annotations

from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import _k10_graph as k10  # noqa: E402
from common_kernel import SubjectRef  # noqa: E402


_DIGEST = "sha256:" + "1" * 64


def relation(
    name: str,
    *,
    transitive: bool = False,
    symmetric: bool = False,
    inverse: str | None = None,
    contradicts: tuple[str, ...] = (),
    dependency: bool = False,
    propagation: str = "none",
) -> k10._RelationType:
    value: k10._RelationType = {
        "name": name,
        "transitive": transitive,
        "symmetric": symmetric,
        "contradicts": contradicts,
        "dependency": dependency,
        "propagation": propagation,  # type: ignore[typeddict-item]
    }
    if inverse is not None:
        value["inverse"] = inverse
    return value


def edge(
    source: str,
    target: str,
    relation_name: str,
    *,
    dep_class: k10._DepClass = "required",
    safety: bool = False,
    state: str = "confirmed",
    meaning: object = "declared",
) -> k10._Edge:
    return {
        "from": source,
        "to": target,
        "relation": relation_name,
        "source": SubjectRef("source", f"{source}-{target}", "r1", _DIGEST),
        "meaning": meaning,
        "dep_class": dep_class,
        "safety": safety,
        "state": state,  # type: ignore[typeddict-item]
    }


def vocab(*relations: k10._RelationType) -> k10._RelationVocab:
    return {"revision": "r1", "types": tuple(relations)}


def condition_state(
    *,
    operations: dict[tuple[str, str], str] | None = None,
    sources: dict[str, str] | None = None,
) -> k10._ConditionState:
    return {
        "operation_conditions": operations or {},  # type: ignore[typeddict-item]
        "selected_sources": sources or {},  # type: ignore[typeddict-item]
    }


class K10ExistingShapeTests(unittest.TestCase):
    def test_shape_fields_match_l4_and_graphdecl_identity_stays_outside_payload(self) -> None:
        self.assertEqual(
            tuple(k10._RelationType.__annotations__),
            ("name", "transitive", "symmetric", "inverse", "contradicts", "dependency", "propagation"),
        )
        self.assertEqual(
            tuple(k10._Edge.__annotations__),
            ("from", "to", "relation", "source", "meaning", "dep_class", "safety", "state"),
        )
        self.assertEqual(
            tuple(k10._GraphDecl.__annotations__),
            ("scope", "sources", "vocab", "control_plane"),
        )
        self.assertNotIn("identity", k10._GraphDecl.__annotations__)
        self.assertEqual(
            tuple(k10._Impact.__annotations__),
            ("changed", "affected", "possibly", "combined"),
        )
        self.assertNotIn("held", k10._Impact.__annotations__)

    def test_scope_and_meaning_are_retained_without_normalization(self) -> None:
        source_ref = SubjectRef("source", "source-a", "r1", _DIGEST)
        vocab_ref = SubjectRef("relation_vocab", "vocab-a", "r1", _DIGEST)
        scope = {"scope": ["repo-a", "repo-b"]}
        decl: k10._GraphDecl = {
            "scope": scope,
            "sources": (source_ref,),
            "vocab": vocab_ref,
            "control_plane": ("cp-a",),
        }
        opaque_meaning = {"source-wording": ["literal", 3]}
        supplied = edge("a", "b", "rel", meaning=opaque_meaning)
        self.assertIs(decl["scope"], scope)
        self.assertIs(supplied["meaning"], opaque_meaning)


class K10RelationComparisonTests(unittest.TestCase):
    def test_unregistered_relation_and_resolved_endpoint_membership(self) -> None:
        declared = vocab(relation("known"))
        known = edge("a", "b", "known")
        unknown = edge("a", "b", "unknown")
        self.assertEqual(k10._unregistered_edges(declared, (known, unknown)), (unknown,))
        self.assertEqual(k10._missing_endpoints(("a", "b"), (known,)), ())
        self.assertEqual(k10._missing_endpoints(("a",), (known,)), (known,))

    def test_symmetric_relation_requires_confirmed_reverse_edge(self) -> None:
        declared = vocab(relation("connected", symmetric=True))
        forward = edge("a", "b", "connected")
        candidate_reverse = edge("b", "a", "connected", state="candidate")
        reverse = edge("b", "a", "connected")
        self.assertEqual(k10._missing_symmetric_reverses(declared, (forward,)), (forward,))
        self.assertEqual(
            k10._missing_symmetric_reverses(declared, (forward, candidate_reverse)),
            (forward,),
        )
        self.assertEqual(k10._missing_symmetric_reverses(declared, (forward, reverse)), ())

    def test_inverse_relation_uses_reverse_endpoints_and_declared_inverse_name(self) -> None:
        declared = vocab(
            relation("depends_on", inverse="blocks"),
            relation("blocks", inverse="depends_on"),
        )
        dependent = edge("a", "b", "depends_on")
        blocks = edge("b", "a", "blocks")
        self.assertEqual(k10._missing_inverse_edges(declared, (dependent,)), (dependent,))
        self.assertEqual(k10._missing_inverse_edges(declared, (dependent, blocks)), ())

    def test_contradicts_pair_is_reported_without_a_k1_classification(self) -> None:
        declared = vocab(
            relation("supports", contradicts=("contradicts",)),
            relation("contradicts"),
        )
        supporting = edge("a", "b", "supports")
        contradicting = edge("a", "b", "contradicts")
        self.assertEqual(
            k10._contradicting_pairs(declared, (supporting, contradicting)),
            ((supporting, contradicting),),
        )

    def test_duplicate_relation_declaration_is_left_unresolved(self) -> None:
        declared = vocab(relation("rel"), relation("rel", symmetric=True))
        self.assertIsNone(k10._missing_symmetric_reverses(declared, (edge("a", "b", "rel"),)))


class K10ConditionAndClosureTests(unittest.TestCase):
    def test_each_depclass_variant_uses_its_own_condition_state(self) -> None:
        states = condition_state(
            operations={("deploy", "ready"): "true", ("deploy", "blocked"): "false", ("deploy", "later"): "unknown"},
            sources={"src-selected": "selected", "src-off": "not_selected", "src-unknown": "unknown"},
        )
        self.assertEqual(k10._classify_condition("required", states), "effective")
        self.assertEqual(k10._classify_condition(("operation_condition", "deploy", "ready"), states), "effective")
        self.assertEqual(k10._classify_condition(("operation_condition", "deploy", "blocked"), states), "condition_false")
        self.assertEqual(k10._classify_condition(("operation_condition", "deploy", "later"), states), "held")
        self.assertEqual(k10._classify_condition(("selected_source", "src-selected"), states), "effective")
        self.assertEqual(k10._classify_condition(("selected_source", "src-off"), states), "not_selected")
        self.assertEqual(k10._classify_condition(("selected_source", "src-unknown"), states), "held")
        self.assertEqual(k10._classify_condition("reference_only", states), "reference_only")

    def test_missing_condition_entry_is_not_relabelled_as_unknown(self) -> None:
        self.assertIsNone(
            k10._classify_condition(
                ("operation_condition", "deploy", "unprovided"), condition_state()
            )
        )

    def test_closure_fields_keep_effective_held_diagnostics_and_safety_separate(self) -> None:
        declared = vocab(
            relation("requires", dependency=True, transitive=False),
            relation("requires_transitive", dependency=True, transitive=True),
        )
        edges = (
            edge("a", "b", "requires", safety=True),
            edge("b", "c", "requires_transitive"),
            edge("a", "d", "requires", dep_class=("selected_source", "chosen"), safety=True),
            edge("a", "h", "requires", dep_class=("operation_condition", "deploy", "later")),
            edge("a", "f", "requires", dep_class=("operation_condition", "deploy", "false")),
            edge("a", "r", "requires", dep_class="reference_only"),
            edge("a", "candidate", "requires", state="candidate"),
        )
        state = condition_state(
            operations={("deploy", "later"): "unknown", ("deploy", "false"): "false"},
            sources={"chosen": "selected"},
        )
        result = k10._walk_closure_fields(("a",), edges, declared, state)
        self.assertIsNotNone(result)
        effective, held, diagnostics = result
        self.assertEqual(set(effective), {"b", "d"})
        self.assertNotIn("c", effective)  # Nontransitive first edge stops expansion.
        self.assertEqual(held, ("h",))
        self.assertEqual(diagnostics, {"f": "condition_false", "r": "reference_only"})
        self.assertNotIn("candidate", effective)

    def test_retired_edges_do_not_participate_in_closure(self) -> None:
        declared = vocab(relation("requires", dependency=True, transitive=True))
        retired = edge("a", "b", "requires", state="retired")
        confirmed = edge("a", "b", "requires", state="confirmed")
        self.assertEqual(
            k10._walk_closure_fields(("a",), (confirmed,), declared, condition_state()),
            (("b",), (), {}),
        )
        result = k10._walk_closure_fields(("a",), (retired,), declared, condition_state())
        self.assertEqual(result, ((), (), {}))

    def test_false_reference_and_held_edges_do_not_expand_to_children(self) -> None:
        declared = vocab(relation("requires", dependency=True, transitive=True))
        edges = (
            edge("a", "false", "requires", dep_class=("operation_condition", "op", "false")),
            edge("false", "false-child", "requires"),
            edge("a", "reference", "requires", dep_class="reference_only"),
            edge("reference", "reference-child", "requires"),
            edge("a", "held", "requires", dep_class=("operation_condition", "op", "held")),
            edge("held", "held-child", "requires"),
        )
        state = condition_state(operations={("op", "false"): "false", ("op", "held"): "unknown"})
        result = k10._walk_closure_fields(("a",), edges, declared, state)
        self.assertIsNotNone(result)
        effective, held, diagnostics = result
        self.assertEqual(effective, ())
        self.assertEqual(held, ("held",))
        self.assertEqual(diagnostics, {"false": "condition_false", "reference": "reference_only"})
        self.assertNotIn("false-child", effective)
        self.assertNotIn("reference-child", effective)
        self.assertNotIn("held-child", effective)

    def test_unknown_relation_on_reachable_walk_stays_unresolved(self) -> None:
        declared = vocab(relation("known", dependency=True, transitive=True))
        edges = (edge("a", "b", "known"), edge("b", "c", "not-registered"))
        self.assertIsNone(k10._walk_closure_fields(("a",), edges, declared, condition_state()))

    def test_transitive_property_single_field_change_controls_expansion(self) -> None:
        transitive = vocab(relation("requires", dependency=True, transitive=True))
        nontransitive = vocab(relation("requires", dependency=True, transitive=False))
        edges = (edge("a", "b", "requires"), edge("b", "c", "requires"))
        expanded = k10._walk_closure_fields(("a",), edges, transitive, condition_state())
        stopped = k10._walk_closure_fields(("a",), edges, nontransitive, condition_state())
        self.assertEqual(expanded, (("b", "c"), (), {}))
        self.assertEqual(stopped, (("b",), (), {}))

    def test_transitive_true_expands_and_cycle_only_does_not_reject(self) -> None:
        declared = vocab(relation("requires", dependency=True, transitive=True))
        edges = (edge("a", "b", "requires"), edge("b", "a", "requires"), edge("b", "c", "requires"))
        result = k10._walk_closure_fields(("a",), edges, declared, condition_state())
        self.assertIsNotNone(result)
        effective, held, diagnostics = result
        self.assertEqual(set(effective), {"a", "b", "c"})
        self.assertEqual(held, ())
        self.assertEqual(diagnostics, {})


class K10ImpactTests(unittest.TestCase):
    def test_propagation_candidate_and_held_fields_are_separate(self) -> None:
        declared = vocab(
            relation("along", propagation="along"),
            relation("against", propagation="against"),
            relation("none", propagation="none"),
        )
        edges = (
            edge("a", "b", "along"),
            edge("c", "b", "against"),
            edge("d", "e", "none"),
            edge("f", "g", "along", state="candidate"),
            edge("g", "h", "along"),
            edge("g", "i", "along", dep_class=("operation_condition", "deploy", "later")),
        )
        result = k10._walk_impact_fields(
            ("a", "d", "f"),
            edges,
            declared,
            condition_state(operations={("deploy", "later"): "unknown"}),
        )
        self.assertIsNotNone(result)
        affected, possibly, held_internal = result
        self.assertEqual(affected, ("b", "c"))
        self.assertEqual(possibly, ("g", "h"))
        self.assertEqual(held_internal, ("i",))
        self.assertNotIn("held", k10._Impact.__annotations__)

        against_only = k10._walk_impact_fields(("b",), (edges[1],), declared, condition_state())
        self.assertIsNotNone(against_only)
        self.assertEqual(against_only[0], ("c",))

    def test_confirmed_path_removes_node_from_candidate_only_possibly(self) -> None:
        declared = vocab(relation("along", propagation="along"))
        edges = (
            edge("a", "b", "along", state="candidate"),
            edge("a", "c", "along"),
            edge("c", "b", "along"),
        )
        result = k10._walk_impact_fields(("a",), edges, declared, condition_state())
        self.assertIsNotNone(result)
        affected, possibly, held_internal = result
        self.assertEqual(set(affected), {"c", "b"})
        self.assertEqual(possibly, ())
        self.assertEqual(held_internal, ())

    def test_candidate_path_cascade_is_reclassified_when_confirmed_path_reaches_node(self) -> None:
        declared = vocab(relation("along", transitive=True, propagation="along"))
        edges = (
            edge("a", "b", "along", state="candidate"),
            edge("b", "c", "along"),
            edge("a", "d", "along"),
            edge("d", "b", "along"),
        )
        result = k10._walk_impact_fields(("a",), edges, declared, condition_state())
        self.assertIsNotNone(result)
        affected, possibly, held_internal = result
        self.assertEqual(set(affected), {"d", "b", "c"})
        self.assertEqual(possibly, ())
        self.assertEqual(held_internal, ())


if __name__ == "__main__":
    unittest.main()
