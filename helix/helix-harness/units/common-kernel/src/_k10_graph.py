"""Private, shape-preserving K10 graph projections.

This module implements only pure operations over values already supplied to
it. It does not resolve owners, read fixed sources, write K5 records, classify
K1 components, or expose K10 public APIs.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Literal, NotRequired, TypeAlias, TypedDict

from common_kernel import Combined, SubjectRef


__all__: tuple[str, ...] = ()


class _RelationType(TypedDict):
    name: str
    transitive: bool
    symmetric: bool
    inverse: NotRequired[str]
    contradicts: tuple[str, ...]
    dependency: bool
    propagation: Literal["none", "along", "against"]


class _RelationVocab(TypedDict):
    revision: str
    types: tuple[_RelationType, ...]


_OperationCondition: TypeAlias = tuple[Literal["operation_condition"], str, str]
_SelectedSource: TypeAlias = tuple[Literal["selected_source"], str]
_DepClass: TypeAlias = Literal["required", "reference_only"] | _OperationCondition | _SelectedSource
_ConditionOutcome: TypeAlias = Literal[
    "effective", "held", "condition_false", "not_selected", "reference_only"
]


_Edge = TypedDict(
    "_Edge",
    {
        "from": str,
        "to": str,
        "relation": str,
        "source": SubjectRef,
        "meaning": object,
        "dep_class": _DepClass,
        "safety": bool,
        "state": Literal["candidate", "confirmed", "retired"],
    },
)


class _GraphDecl(TypedDict):
    """GraphDecl payload only; its identity stays in the FixedRef metadata."""

    scope: object
    sources: tuple[SubjectRef, ...]
    vocab: SubjectRef
    control_plane: NotRequired[tuple[str, ...]]


class _ConditionState(TypedDict):
    operation_conditions: Mapping[tuple[str, str], Literal["true", "false", "unknown"]]
    selected_sources: Mapping[str, Literal["selected", "not_selected", "unknown"]]


class _GraphRules(TypedDict):
    identity: str
    version: str
    digest: str


class _Closure(TypedDict):
    seed: tuple[str, ...]
    effective: tuple[str, ...]
    held: tuple[str, ...]
    diagnostics: Mapping[str, Literal["condition_false", "not_selected", "reference_only"]]
    combined: Combined


class _Impact(TypedDict):
    changed: tuple[SubjectRef, ...]
    affected: tuple[str, ...]
    possibly: tuple[str, ...]
    combined: Combined


def _relation_types_named(vocab: _RelationVocab, name: str) -> tuple[_RelationType, ...]:
    return tuple(relation for relation in vocab["types"] if relation["name"] == name)


def _unique_relation_type(vocab: _RelationVocab, name: str) -> _RelationType | None:
    """Return a unique supplied declaration; ambiguity remains unresolved."""
    matches = _relation_types_named(vocab, name)
    return matches[0] if len(matches) == 1 else None


def _unregistered_edges(
    vocab: _RelationVocab, edges: Sequence[_Edge]
) -> tuple[_Edge, ...]:
    """Project edges whose relation name is absent from the supplied vocab."""
    registered = frozenset(relation["name"] for relation in vocab["types"])
    return tuple(edge for edge in edges if edge["relation"] not in registered)


def _missing_endpoints(
    node_identities: Sequence[str], edges: Sequence[_Edge]
) -> tuple[_Edge, ...]:
    """Compare endpoints to an already-resolved node identity projection."""
    nodes = frozenset(node_identities)
    return tuple(
        edge
        for edge in edges
        if edge["from"] not in nodes or edge["to"] not in nodes
    )


def _missing_symmetric_reverses(
    vocab: _RelationVocab, edges: Sequence[_Edge]
) -> tuple[_Edge, ...] | None:
    """Find confirmed symmetric edges without a confirmed reverse edge.

    ``None`` means the supplied vocabulary contains duplicate declarations for
    a relation used by an edge, so this helper cannot choose a property value.
    It is not a K1 classification or a public failure result.
    """
    confirmed = tuple(edge for edge in edges if edge["state"] == "confirmed")
    findings: list[_Edge] = []
    for edge in confirmed:
        relation = _unique_relation_type(vocab, edge["relation"])
        if relation is None:
            return None
        if not relation["symmetric"]:
            continue
        reverse_exists = any(
            other["from"] == edge["to"]
            and other["to"] == edge["from"]
            and other["relation"] == edge["relation"]
            for other in confirmed
        )
        if not reverse_exists:
            findings.append(edge)
    return tuple(findings)


def _missing_inverse_edges(
    vocab: _RelationVocab, edges: Sequence[_Edge]
) -> tuple[_Edge, ...] | None:
    """Find confirmed edges lacking their declared reverse relation."""
    confirmed = tuple(edge for edge in edges if edge["state"] == "confirmed")
    findings: list[_Edge] = []
    for edge in confirmed:
        relation = _unique_relation_type(vocab, edge["relation"])
        if relation is None:
            return None
        inverse = relation.get("inverse")
        if inverse is None:
            continue
        reverse_exists = any(
            other["from"] == edge["to"]
            and other["to"] == edge["from"]
            and other["relation"] == inverse
            for other in confirmed
        )
        if not reverse_exists:
            findings.append(edge)
    return tuple(findings)


def _contradicting_pairs(
    vocab: _RelationVocab, edges: Sequence[_Edge]
) -> tuple[tuple[_Edge, _Edge], ...] | None:
    """Find declared contradicts pairs on the same ordered endpoints."""
    confirmed = tuple(edge for edge in edges if edge["state"] == "confirmed")
    relations: list[_RelationType] = []
    for edge in confirmed:
        relation = _unique_relation_type(vocab, edge["relation"])
        if relation is None:
            return None
        relations.append(relation)

    pairs: list[tuple[_Edge, _Edge]] = []
    for left_index, left in enumerate(confirmed):
        for right_index in range(left_index + 1, len(confirmed)):
            right = confirmed[right_index]
            if (left["from"], left["to"]) != (right["from"], right["to"]):
                continue
            left_relation = relations[left_index]
            right_relation = relations[right_index]
            if (
                right["relation"] in left_relation["contradicts"]
                or left["relation"] in right_relation["contradicts"]
            ):
                pairs.append((left, right))
    return tuple(pairs)


def _classify_condition(
    dep_class: _DepClass, condition_state: _ConditionState
) -> _ConditionOutcome | None:
    """Project one DepClass variant against its already-supplied state.

    A missing map entry or out-of-shape runtime input is left unresolved. The
    function does not add a missing-value classification.
    """
    if dep_class == "required":
        return "effective"
    if dep_class == "reference_only":
        return "reference_only"
    if isinstance(dep_class, tuple) and len(dep_class) == 3 and dep_class[0] == "operation_condition":
        state = condition_state["operation_conditions"].get((dep_class[1], dep_class[2]))
        if state == "true":
            return "effective"
        if state == "unknown":
            return "held"
        if state == "false":
            return "condition_false"
        return None
    if isinstance(dep_class, tuple) and len(dep_class) == 2 and dep_class[0] == "selected_source":
        state = condition_state["selected_sources"].get(dep_class[1])
        if state == "selected":
            return "effective"
        if state == "unknown":
            return "held"
        if state == "not_selected":
            return "not_selected"
        return None
    return None


def _append_identity(values: list[str], known: set[str], identity: str) -> None:
    if identity not in known:
        known.add(identity)
        values.append(identity)


def _walk_closure_fields(
    seed: Sequence[str],
    edges: Sequence[_Edge],
    vocab: _RelationVocab,
    condition_state: _ConditionState,
) -> tuple[tuple[str, ...], tuple[str, ...], dict[str, str]] | None:
    """Return only Closure's effective/held/diagnostics fields.

    The caller supplies already-resolved graph and condition values. The
    missing ``Combined`` is deliberately not fabricated here.
    """
    effective: list[str] = []
    effective_seen: set[str] = set()
    held: list[str] = []
    held_seen: set[str] = set()
    diagnostics: dict[str, str] = {}
    queue = list(seed)
    expanded: set[str] = set()

    while queue:
        source = queue.pop(0)
        if source in expanded:
            continue
        expanded.add(source)
        for edge in edges:
            if edge["from"] != source or edge["state"] != "confirmed":
                continue
            relation = _unique_relation_type(vocab, edge["relation"])
            if relation is None:
                return None
            if not relation["dependency"]:
                continue
            outcome = _classify_condition(edge["dep_class"], condition_state)
            if outcome is None:
                return None
            target = edge["to"]
            if outcome == "effective":
                _append_identity(effective, effective_seen, target)
                if relation["transitive"]:
                    queue.append(target)
            elif outcome == "held":
                _append_identity(held, held_seen, target)
            else:
                previous = diagnostics.get(target)
                if previous is not None and previous != outcome:
                    return None
                diagnostics[target] = outcome

    return tuple(effective), tuple(held), diagnostics


def _edge_target_for_impact(edge: _Edge, source: str, propagation: str) -> str | None:
    if propagation == "along" and edge["from"] == source:
        return edge["to"]
    if propagation == "against" and edge["to"] == source:
        return edge["from"]
    return None


def _walk_impact_fields(
    changed: Sequence[str],
    edges: Sequence[_Edge],
    vocab: _RelationVocab,
    condition_state: _ConditionState,
) -> tuple[tuple[str, ...], tuple[str, ...], tuple[str, ...]] | None:
    """Return affected, possibly and an internal held-identity projection.

    ``Impact`` has no ``held`` field. Held identities are returned only as an
    internal input for the later existing-K1 component assembly, which is not
    implemented in this module.
    """
    affected: list[str] = []
    affected_seen: set[str] = set()
    candidate_reached: list[str] = []
    candidate_seen: set[str] = set()
    held: list[str] = []
    held_seen: set[str] = set()
    queue = [(identity, False) for identity in changed]
    expanded: set[tuple[str, bool]] = set()

    while queue:
        source, prior_candidate = queue.pop(0)
        if (source, prior_candidate) in expanded:
            continue
        expanded.add((source, prior_candidate))
        for edge in edges:
            if edge["state"] not in ("confirmed", "candidate"):
                continue
            relation = _unique_relation_type(vocab, edge["relation"])
            if relation is None:
                return None
            target = _edge_target_for_impact(edge, source, relation["propagation"])
            if target is None:
                continue
            outcome = _classify_condition(edge["dep_class"], condition_state)
            if outcome is None:
                return None
            if outcome == "held":
                _append_identity(held, held_seen, target)
                continue
            if outcome != "effective":
                continue

            candidate_path = prior_candidate or edge["state"] == "candidate"
            if candidate_path:
                _append_identity(candidate_reached, candidate_seen, target)
            else:
                _append_identity(affected, affected_seen, target)
            queue.append((target, candidate_path))

    possibly = tuple(identity for identity in candidate_reached if identity not in affected_seen)
    return tuple(affected), possibly, tuple(held)
