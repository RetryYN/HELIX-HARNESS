"""K3 authority-query projection over the shared K1/K2 result kernel.

The module contains no owner reader, selector, writer, or action implementation.
Private owner-boundary functions return an explicit unavailable observation by
default. Unit fixtures may patch those functions; production composition must
come from the owning mechanisms rather than caller-supplied callbacks.
"""

from __future__ import annotations

from dataclasses import dataclass, field, replace
from enum import Enum
from typing import Any, Mapping, Sequence

from common_kernel import (
    Combined,
    Observed,
    Polarity,
    PolarityMapping,
    Rejected,
    ResultKey,
    SubjectRef,
    Unknown,
    UnknownReason,
    Unobserved,
    Value,
    combine,
    key_of,
    lookup,
    _bind_alias_inputs,
    _canonical_json_bytes,
    _canonical_value,
    _sha256_digest,
)


K3_OPERATION_VERSION = "k3-authority-check/2"
K3_OPERATION = "permission_check"
K3_SCOPE = "authority"
_PERMISSION_OPERATIONS = frozenset(
    {
        "read",
        "write",
        "execute",
        "network",
        "install",
        "delete",
        "merge",
        "release",
        "deploy",
        "credential-use",
        "security-change",
    }
)
_K3_POLARITY = PolarityMapping(
    identity="common-kernel-k3-check-value",
    version="0.1.0",
    classify=lambda value: Polarity.POSITIVE
    if value is CheckValue.MATCH
    else Polarity.NEGATIVE,
)


class CheckValue(str, Enum):
    MATCH = "match"
    MISMATCH = "mismatch"


@dataclass(frozen=True)
class PermissionQuery:
    operation: str
    target: str
    revision: SubjectRef
    requested_scope: Any
    operation_inputs: Mapping[str, SubjectRef]


PermissionQueryRef = SubjectRef
AuthorityInputRef = SubjectRef
AuthorityInputBindingRef = SubjectRef


@dataclass(frozen=True)
class OperationAuthorityTuple:
    actor: str
    target: str
    operation: str
    revision: SubjectRef
    environment: SubjectRef
    scope: Any
    expiry: Any


@dataclass(frozen=True)
class PermissionRecord:
    ref: SubjectRef
    tuple: OperationAuthorityTuple
    operation_inputs: Mapping[str, SubjectRef]
    outcome: str
    reason: str
    source: SubjectRef
    issuer: str
    constraints: tuple[SubjectRef, ...] = ()


@dataclass(frozen=True)
class AuthorityContext:
    tuple: OperationAuthorityTuple
    operation_inputs: Mapping[str, SubjectRef]
    current_assignment: SubjectRef
    target_owner_decl: SubjectRef
    environment_decl: SubjectRef
    operation_decl: SubjectRef
    authority_decl: SubjectRef
    policy: SubjectRef
    source_current: Mapping[str, SubjectRef]
    observed_at: SubjectRef
    revocation_heads: tuple["SegmentHead", ...]
    pre_execution_constraints: tuple[SubjectRef, ...] = ()


@dataclass(frozen=True)
class ResolutionDiagnostic:
    reason: str
    available_refs: tuple[SubjectRef, ...] = ()
    missing_identities: tuple[str, ...] = ()


@dataclass(frozen=True)
class Resolved:
    value: AuthorityContext


@dataclass(frozen=True)
class Unresolved:
    diagnostic: ResolutionDiagnostic


AuthorityContextResolution = Resolved | Unresolved


@dataclass(frozen=True)
class PermissionCheckDiagnostic:
    query: SubjectRef | None
    reason: str
    available_refs: tuple[SubjectRef, ...] = ()
    missing_identities: tuple[str, ...] = ()


@dataclass(frozen=True)
class Component:
    identity: str
    observed: Observed[Any]
    polarity: PolarityMapping | None = None


@dataclass(frozen=True)
class PermissionCheckResult:
    query: SubjectRef
    context: AuthorityContextResolution
    permission: SubjectRef
    effective_decision: Observed[SubjectRef]
    components: tuple[Component, ...]
    combined: Combined[Any]
    assurance: Mapping[str, Observed[Any]]
    authority_effect: str = "none"


PermissionCheck = PermissionCheckResult | PermissionCheckDiagnostic


@dataclass(frozen=True)
class RoleInput:
    role: str
    raw_ref: SubjectRef
    context: Any = field(default_factory=dict)


@dataclass(frozen=True)
class OwnerMapping:
    """Read-only output of the SECURITY/owner resolver boundary."""

    role_inputs: tuple[RoleInput, ...]
    binding_bytes: bytes
    binding_ref: SubjectRef
    current_heads: tuple[SubjectRef, ...]
    missing_identities: tuple[str, ...] = ()


@dataclass(frozen=True)
class OwnerContextData:
    context: AuthorityContext | None
    missing_identities: tuple[str, ...] = ()
    unavailable_reason: str | None = None
    axis_observations: Mapping[str, Observed[Any]] = field(default_factory=dict)
    component_observations: Mapping[str, Observed[Any]] = field(default_factory=dict)
    revocation_snapshot: "RevocationSnapshot | None" = None
    # Owner-resolved tuple scope can survive an otherwise incomplete context
    # read. It is never derived from PermissionQuery.requested_scope.
    key_scope: Any | None = None


@dataclass(frozen=True)
class PermissionSourceData:
    """Typed private SECURITY adapter handoff.

    Registration, exact-source-byte decoding, and declared issuer checks belong
    to the owner adapter. K3 still cross-checks the returned refs against the
    owner-resolved current source map before composing a positive result.
    """

    record: PermissionRecord | None
    current_ref: SubjectRef | None
    selector_observation: Observed[SubjectRef] | None
    expiry_observation: Observed[Any] | None = None
    declared_issuer: str | None = None
    unavailable_reason: str | None = None


@dataclass(frozen=True)
class K6AssuranceData:
    reverifiable: Observed[Any] | None
    reproduction: Observed[Any] | None
    issuer_authenticity: Observed[Any] | None
    reverifiable_polarity: PolarityMapping | None = None
    reproduction_polarity: PolarityMapping | None = None
    issuer_authenticity_polarity: PolarityMapping | None = None


@dataclass(frozen=True)
class SegmentHead:
    segment: str
    seq: int
    entry_digest: str


@dataclass(frozen=True)
class RevocationSnapshot:
    """Private owner-port result tied to the complete current revocation head set."""

    heads: tuple[SegmentHead, ...]
    observation: Observed[Any]


def _owner_mapping(query_ref: SubjectRef, input_heads: Sequence[SubjectRef]) -> OwnerMapping | None:
    """Private owner port. No production owner reader is supplied in this unit."""
    del query_ref, input_heads
    return None


def _owner_context(query: PermissionQuery, input_heads: Sequence[SubjectRef]) -> OwnerContextData:
    """Private current-prefix reader port; caller heads are expected values only."""
    del query, input_heads
    return OwnerContextData(None, unavailable_reason="missing_input")


def _permission_source(
    query: PermissionQuery, context: AuthorityContext, permission: SubjectRef
) -> PermissionSourceData:
    """Private SECURITY source-selector port; it never trusts a caller record."""
    del query, context, permission
    return PermissionSourceData(None, None, None, unavailable_reason="missing_input")


def _k6_assurance(
    permission: SubjectRef, query_ref: SubjectRef, context: AuthorityContext
) -> K6AssuranceData:
    """Private K6 handoff port. This module does not perform source byte reads."""
    del permission, query_ref, context
    return K6AssuranceData(None, None, None)


def _query_ref(query: PermissionQuery) -> SubjectRef:
    ordered_inputs = sorted(query.operation_inputs.items())
    identities = [identity for identity, _ in ordered_inputs]
    query_value = {
        "operation": query.operation,
        "target": query.target,
        "revision": _canonical_value(query.revision),
        "requested_scope": _canonical_value(query.requested_scope),
        "operation_inputs": {identity: _canonical_value(ref) for identity, ref in ordered_inputs},
    }
    identity_value = {
        "kind": "permission_query",
        "operation": query.operation,
        "target": query.target,
        "revision_identity": query.revision.identity,
        "sorted_operation_input_identities": identities,
    }
    revision_value = {
        "revision": query.revision.revision,
        "operation_input_revisions": [ref.revision for _, ref in ordered_inputs],
    }
    return SubjectRef(
        kind="permission_query",
        identity=_canonical_json_bytes(identity_value).decode("utf-8"),
        revision=_canonical_json_bytes(revision_value).decode("utf-8"),
        digest=_sha256_digest(_canonical_json_bytes(query_value)),
    )


def _authority_input_ref(role_input: RoleInput) -> SubjectRef:
    return SubjectRef(
        kind="k3_authority_input",
        identity=_canonical_json_bytes(
            {"role": role_input.role, "identity": role_input.raw_ref.identity}
        ).decode("utf-8"),
        revision=role_input.raw_ref.revision,
        digest=role_input.raw_ref.digest,
    )


def _binding_inputs(query_ref: SubjectRef, owner_mapping: OwnerMapping | None) -> tuple[SubjectRef, ...] | Rejected:
    if owner_mapping is None:
        return Rejected("missing_key")
    query_context = {"query_identity": query_ref.identity}
    aliases = [
        (
            {**query_context, **_canonical_value(item.context)},
            item.role,
            item.raw_ref,
            _authority_input_ref(item),
        )
        for item in owner_mapping.role_inputs
    ]
    binding_identity = _canonical_json_bytes(
        {
            "owner": "SECURITY",
            "operation": K3_OPERATION,
            "query": query_ref.identity,
        }
    ).decode("utf-8")
    binding = _bind_alias_inputs(
        aliases,
        binding_kind="k3_authority_input_binding",
        binding_identity=binding_identity,
        owner_revision=_canonical_json_bytes(
            [
                {"alias_identity": alias[3].identity, "raw_revision": alias[2].revision}
                for alias in sorted(aliases, key=lambda item: item[3].identity)
            ]
        ).decode("utf-8"),
    )
    if isinstance(binding, Rejected):
        return binding
    # Do not trust a binding reference or bytes supplied by a caller boundary.
    if binding.binding_ref != owner_mapping.binding_ref or binding.canonical_bytes != owner_mapping.binding_bytes:
        return Rejected("missing_key")
    return (query_ref, binding.binding_ref, *binding.inputs[1:])


def _key_with_scope(
    permission: SubjectRef,
    query_ref: SubjectRef,
    scope: Any,
    owner_mapping: OwnerMapping,
) -> ResultKey | Rejected:
    bound_inputs = _binding_inputs(query_ref, owner_mapping)
    if isinstance(bound_inputs, Rejected):
        return bound_inputs
    inputs = tuple(bound_inputs) + tuple(owner_mapping.current_heads)
    return key_of(
        K3_OPERATION,
        K3_OPERATION_VERSION,
        permission,
        inputs,
        _canonical_json_bytes(scope).decode("utf-8"),
    )


def _key(permission: SubjectRef, query_ref: SubjectRef, context: AuthorityContext, owner_mapping: OwnerMapping) -> ResultKey | Rejected:
    return _key_with_scope(permission, query_ref, context.tuple.scope, owner_mapping)


def _value(key: ResultKey, matches: bool, evidence: Any = None) -> Value[CheckValue]:
    return Value(CheckValue.MATCH if matches else CheckValue.MISMATCH, key, evidence)


def _unknown(key: ResultKey, reason: str, evidence: Any = None) -> Unknown:
    return Unknown(reason, key, evidence)


def _compare_inputs(
    key: ResultKey,
    query_inputs: Mapping[str, SubjectRef],
    record_inputs: Mapping[str, SubjectRef],
    current_inputs: Mapping[str, SubjectRef],
) -> dict[str, Observed[Any]]:
    """Compare caller, saved decision, and owner-current refs without substitution."""
    result: dict[str, Observed[Any]] = {}
    identities = sorted(set(query_inputs) | set(record_inputs) | set(current_inputs))
    for identity in identities:
        if identity not in current_inputs and (identity in query_inputs or identity in record_inputs):
            result[identity] = _value(key, False, {"input": identity, "reason": "extra_key"})
        elif identity not in query_inputs or identity not in record_inputs or identity not in current_inputs:
            result[identity] = _unknown(key, UnknownReason.MISSING_INPUT.value, {"input": identity})
        else:
            refs = (query_inputs[identity], record_inputs[identity], current_inputs[identity])
            conflict = any(
                left.identity == right.identity
                and left.revision == right.revision
                and left.digest != right.digest
                for index, left in enumerate(refs)
                for right in refs[index + 1 :]
            )
            if conflict:
                result[identity] = _unknown(key, UnknownReason.CONFLICT.value, {"input": identity})
            else:
                result[identity] = _value(key, all(ref == refs[0] for ref in refs[1:]), {"input": identity})
    return result


def _axis_components(
    key: ResultKey,
    query: PermissionQuery,
    context: AuthorityContext,
    record: PermissionRecord,
    owner_observations: Mapping[str, Observed[Any]] | None = None,
) -> list[Component]:
    axes = (
        ("actor", context.tuple.actor, record.tuple.actor),
        ("target", query.target, context.tuple.target, record.tuple.target),
        ("operation", query.operation, context.tuple.operation, record.tuple.operation),
        ("revision", query.revision, context.tuple.revision, record.tuple.revision),
        ("environment", context.tuple.environment, record.tuple.environment),
        ("scope", query.requested_scope, context.tuple.scope, record.tuple.scope),
    )
    components: list[Component] = []
    owner_observations = owner_observations or {}
    for axis in axes:
        identity = axis[0]
        values = axis[1:]
        if identity in owner_observations:
            observed = owner_observations[identity]
        elif identity in {"revision", "environment"}:
            if any(value is None for value in values):
                observed: Observed[Any] = _unknown(key, UnknownReason.MISSING_INPUT.value, {"axis": identity})
            else:
                refs = [value for value in values if isinstance(value, SubjectRef)]
                if len(refs) != len(values):
                    observed = _unknown(key, UnknownReason.MISSING_INPUT.value, {"axis": identity})
                elif any(
                    left.identity == right.identity
                    and left.revision == right.revision
                    and left.digest != right.digest
                    for left, right in zip(refs, refs[1:])
                ):
                    observed = _unknown(key, UnknownReason.CONFLICT.value, {"axis": identity})
                else:
                    observed = _value(key, all(ref == refs[0] for ref in refs[1:]), {"axis": identity})
        else:
            if any(value is None for value in values):
                observed = _unknown(key, UnknownReason.MISSING_INPUT.value, {"axis": identity})
            else:
                observed = _value(key, all(value == values[0] for value in values[1:]), {"axis": identity})
        components.append(Component(identity, observed))
    return components


def _ref_match_observation(
    key: ResultKey, identity: str, expected: SubjectRef | None, observed: SubjectRef | None
) -> Observed[Any]:
    if expected is None or observed is None:
        return _unknown(key, UnknownReason.MISSING_INPUT.value, {"ref": identity})
    if (
        expected.identity == observed.identity
        and expected.revision == observed.revision
        and expected.digest != observed.digest
    ):
        return _unknown(key, UnknownReason.CONFLICT.value, {"ref": identity})
    return _value(key, expected == observed, {"ref": identity})


def _registered_source_observation(
    key: ResultKey, context: AuthorityContext, record: PermissionRecord
) -> Observed[Any]:
    """Cross-check the typed SECURITY-port record against its registered current source ref."""
    registered = context.source_current.get(record.source.identity)
    if registered is None:
        return _unknown(key, "unregistered", {"source": record.source.identity})
    return _ref_match_observation(key, "registered_source", registered, record.source)


def _revocation_observation(
    key: ResultKey, context: AuthorityContext, owner_data: OwnerContextData
) -> Observed[Any] | None:
    snapshot = owner_data.revocation_snapshot
    if snapshot is None:
        if context.revocation_heads:
            return _unknown(key, UnknownReason.MISSING_INPUT.value, {"component": "revocation"})
        return None
    if _canonical_revocation_heads(snapshot.heads) != _canonical_revocation_heads(context.revocation_heads):
        return _unknown(key, UnknownReason.CONFLICT.value, {"component": "revocation", "heads": "mismatch"})
    # The owner observation is already keyed to its source evidence. Keep its
    # original key and evidence; the K3 query key is not a translation of it.
    return snapshot.observation


def _canonical_revocation_heads(heads: Sequence[SegmentHead]) -> tuple[SegmentHead, ...]:
    """Compare current head sets independent of order, deduplicating exact refs only."""
    unique = {(head.segment, head.seq, head.entry_digest): head for head in heads}
    return tuple(unique[key] for key in sorted(unique))


def _combine_components(components: Sequence[Component]) -> Combined[Any] | Rejected:
    return combine(
        [
            (component.observed, component.polarity)
            if component.polarity is not None
            else component.observed
            for component in components
        ],
        _K3_POLARITY,
    )


def _resolution(query: PermissionQuery, input_heads: Sequence[SubjectRef]) -> AuthorityContextResolution | PermissionCheckDiagnostic:
    query_ref = _query_ref(query)
    if query.operation not in _PERMISSION_OPERATIONS:
        return PermissionCheckDiagnostic(query_ref, "invalid_query")
    mapping = _owner_mapping(query_ref, input_heads)
    if mapping is None or mapping.missing_identities:
        missing = mapping.missing_identities if mapping else ("owner_current_refs",)
        return Unresolved(ResolutionDiagnostic("missing_input", missing_identities=tuple(missing)))
    key_inputs = _binding_inputs(query_ref, mapping)
    if isinstance(key_inputs, Rejected):
        return PermissionCheckDiagnostic(query_ref, key_inputs.reason)
    owner_data = _owner_context(query, input_heads)
    if owner_data.context is None:
        return Unresolved(
            ResolutionDiagnostic(
                owner_data.unavailable_reason or "missing_input",
                missing_identities=owner_data.missing_identities,
            )
        )
    expected = tuple(input_heads)
    if expected and expected != mapping.current_heads:
        return Unresolved(ResolutionDiagnostic("conflict", missing_identities=("input_heads",)))
    if owner_data.missing_identities or owner_data.unavailable_reason:
        return Unresolved(
            ResolutionDiagnostic(
                owner_data.unavailable_reason or "missing_input",
                missing_identities=owner_data.missing_identities,
            )
        )
    return Resolved(owner_data.context)


def _check_with_unresolved_context(
    query: PermissionQuery,
    permission: SubjectRef,
    query_ref: SubjectRef,
    mapping: OwnerMapping,
    owner_data: OwnerContextData,
    input_heads: Sequence[SubjectRef],
) -> PermissionCheck:
    """Preserve owner read failures when the owner still resolved key scope."""
    if owner_data.key_scope is None:
        return PermissionCheckDiagnostic(
            query_ref,
            "missing_key",
            missing_identities=owner_data.missing_identities or ("current_tuple_scope",),
        )
    result_key = _key_with_scope(permission, query_ref, owner_data.key_scope, mapping)
    if isinstance(result_key, Rejected):
        return PermissionCheckDiagnostic(query_ref, "missing_key")

    reason = owner_data.unavailable_reason or UnknownReason.MISSING_INPUT.value
    components: list[Component] = [
        Component("effective_decision", _unknown(result_key, reason, {"context": "unresolved"}))
    ]
    for axis in ("actor", "target", "operation", "revision", "environment", "scope", "expiry"):
        components.append(
            Component(
                axis,
                owner_data.axis_observations.get(
                    axis, _unknown(result_key, UnknownReason.MISSING_INPUT.value, {"axis": axis})
                ),
            )
        )
    components.extend(
        Component(name, observation)
        for name, observation in owner_data.component_observations.items()
    )
    if tuple(input_heads) and tuple(input_heads) != mapping.current_heads:
        components.append(Component("caller_expected_heads", _unknown(result_key, "conflict", {"field": "input_heads"})))

    assurance = {
        name: _unknown(result_key, UnknownReason.MISSING_INPUT.value, {"assurance": name})
        for name in ("reverifiable", "reproduction", "issuer_authenticity")
    }
    components.extend(Component(f"assurance:{name}", observed) for name, observed in assurance.items())
    combined = _combine_components(components)
    if isinstance(combined, Rejected):
        return PermissionCheckDiagnostic(query_ref, "missing_key")
    return PermissionCheckResult(
        query=query_ref,
        context=Unresolved(
            ResolutionDiagnostic(
                reason,
                missing_identities=owner_data.missing_identities,
            )
        ),
        permission=permission,
        effective_decision=components[0].observed,
        components=tuple(components),
        combined=combined,
        assurance=assurance,
    )


def resolve_authority_context(
    query: PermissionQuery, input_heads: Sequence[SubjectRef]
) -> AuthorityContextResolution | PermissionCheckDiagnostic:
    """Reconstruct current owner context; `input_heads` are expected values only."""
    return _resolution(query, input_heads)


def check_permission(
    query: PermissionQuery, permission: SubjectRef, input_heads: Sequence[SubjectRef]
) -> PermissionCheck:
    """Read-only K3 check composed through the existing K1 result kernel."""
    query_ref = _query_ref(query)
    if query.operation not in _PERMISSION_OPERATIONS:
        return PermissionCheckDiagnostic(query_ref, "invalid_query")
    mapping = _owner_mapping(query_ref, input_heads)
    if mapping is None or mapping.missing_identities:
        missing = mapping.missing_identities if mapping else ("owner_current_refs",)
        return PermissionCheckDiagnostic(query_ref, "missing_key", missing_identities=tuple(missing))
    binding_inputs = _binding_inputs(query_ref, mapping)
    if isinstance(binding_inputs, Rejected):
        return PermissionCheckDiagnostic(query_ref, "missing_key")
    owner_data = _owner_context(query, input_heads)
    if owner_data.context is None:
        return _check_with_unresolved_context(
            query, permission, query_ref, mapping, owner_data, input_heads
        )
    context = owner_data.context
    if tuple(input_heads) and tuple(input_heads) != mapping.current_heads:
        context_drift = True
    else:
        context_drift = False
    result_key = _key(permission, query_ref, context, mapping)
    if isinstance(result_key, Rejected):
        return PermissionCheckDiagnostic(query_ref, "missing_key")

    source = _permission_source(query, context, permission)
    effective_decision: Observed[SubjectRef]
    if source.record is None:
        selector = source.selector_observation
        if isinstance(selector, Value):
            effective_decision = _unknown(
                result_key,
                UnknownReason.MISSING_INPUT.value,
                {"source": "current_record_missing"},
            )
        else:
            effective_decision = selector if selector is not None else _unknown(result_key, source.unavailable_reason or "missing_input")
        decision_polarity = PolarityMapping(
            identity="k3-current-decision-ref-match",
            version=K3_OPERATION_VERSION,
            classify=lambda value: Polarity.POSITIVE if value == permission else Polarity.NEGATIVE,
        )
        components = [Component("effective_decision", effective_decision, decision_polarity)]
        for axis in ("actor", "target", "operation", "revision", "environment", "scope"):
            components.append(
                Component(
                    axis,
                    owner_data.axis_observations.get(
                        axis,
                        _unknown(result_key, "missing_input", {"axis": axis}),
                    ),
                )
            )
        components.append(
            Component(
                "expiry",
                source.expiry_observation
                or owner_data.axis_observations.get(
                    "expiry", _unknown(result_key, "missing_input", {"axis": "expiry"})
                ),
            )
        )
        components.append(Component("issuer", _unknown(result_key, "missing_input")))
    else:
        record = source.record
        current_ref = source.current_ref
        if isinstance(source.selector_observation, Value) and (
            current_ref is None or source.selector_observation.value != current_ref
        ):
            effective_decision = _unknown(
                result_key,
                UnknownReason.MISSING_INPUT.value if current_ref is None else UnknownReason.CONFLICT.value,
                {"source": "selector_current_ref"},
            )
        elif source.selector_observation is not None:
            effective_decision = source.selector_observation
        elif current_ref is None:
            effective_decision = _unknown(result_key, source.unavailable_reason or "missing_input")
        else:
            effective_decision = Value(current_ref, result_key, {"current_ref": current_ref})
        decision_polarity = PolarityMapping(
            identity="k3-current-decision-ref-match",
            version=K3_OPERATION_VERSION,
            classify=lambda value: Polarity.POSITIVE if value == permission else Polarity.NEGATIVE,
        )
        components = [Component("effective_decision", effective_decision, decision_polarity)]
        components.append(
            Component(
                "permission_record_ref",
                _ref_match_observation(result_key, "permission_record", current_ref, record.ref),
            )
        )
        components.append(
            Component(
                "registered_source",
                _registered_source_observation(result_key, context, record),
            )
        )
        components.extend(
            _axis_components(
                result_key,
                query,
                context,
                record,
                owner_data.axis_observations,
            )
        )
        components.append(
            Component(
                "expiry",
                source.expiry_observation or _unknown(result_key, "missing_input", {"axis": "expiry"}),
            )
        )
        if source.declared_issuer is not None:
            components.append(
                Component(
                    "issuer",
                    _value(
                        result_key,
                        record.issuer == source.declared_issuer,
                        {"issuer_match": record.issuer == source.declared_issuer},
                    ),
                )
            )
        else:
            components.append(Component("issuer", _unknown(result_key, UnknownReason.MISSING_INPUT.value)))
        components.extend(
            Component(f"operation_input:{identity}", observed)
            for identity, observed in _compare_inputs(
                result_key,
                query.operation_inputs,
                record.operation_inputs,
                context.operation_inputs,
            ).items()
        )
        outcome = record.outcome
        if outcome == "deny":
            components.append(Component("source_outcome", _value(result_key, False, {"outcome": "deny"})))
        elif outcome == "allow":
            if record.constraints:
                # L4 does not define a positive mapping for an allow record
                # carrying separate constraints. Preserve the existing K1
                # unsupported classification instead of treating the extra
                # constraint payload as inert.
                components.append(
                    Component(
                        "source_outcome",
                        _unknown(
                            result_key,
                            UnknownReason.UNSUPPORTED.value,
                            {"outcome": "allow", "constraints": "unresolved_mapping"},
                        ),
                    )
                )
            else:
                components.append(Component("source_outcome", _value(result_key, True, {"outcome": "allow"})))
        elif outcome == "constrain":
            # The owner adapter must provide positive pre-execution evidence for
            # every declared constraint. The core preserves those observations;
            # it does not invent a constraint policy or execute an effect.
            constraints = tuple(record.constraints)
            declared = tuple(context.pre_execution_constraints)
            if constraints and constraints == declared:
                constraint_observations = [
                    owner_data.component_observations.get(
                        f"constraint:{constraint.identity}",
                        _unknown(result_key, "missing_input", {"constraint": constraint.identity}),
                    )
                    for constraint in constraints
                ]
                components.extend(
                    Component(f"constraint:{constraint.identity}", observation)
                    for constraint, observation in zip(constraints, constraint_observations)
                )
                components.append(Component("source_outcome", _value(result_key, True, {"outcome": "constrain"})))
            else:
                components.append(Component("source_outcome", _unknown(result_key, "missing_input", {"outcome": "constrain"})))
        else:
            components.append(Component("source_outcome", _unknown(result_key, UnknownReason.UNSUPPORTED.value, {"outcome": outcome})))

    revocation = _revocation_observation(result_key, context, owner_data)
    if revocation is not None:
        components.append(Component("revocation", revocation))

    for name, observation in owner_data.component_observations.items():
        components.append(Component(name, observation))
    if context_drift:
        components.append(Component("caller_expected_heads", _unknown(result_key, "conflict", {"field": "input_heads"})))

    assurance_data = _k6_assurance(permission, query_ref, context)
    assurance: dict[str, Observed[Any]] = {}
    for name, observation in (
        ("reverifiable", assurance_data.reverifiable),
        ("reproduction", assurance_data.reproduction),
        ("issuer_authenticity", assurance_data.issuer_authenticity),
    ):
        assurance[name] = observation if observation is not None else _unknown(result_key, UnknownReason.MISSING_INPUT.value, {"assurance": name})
        polarity_mapping = getattr(assurance_data, f"{name}_polarity")
        components.append(Component(f"assurance:{name}", assurance[name], polarity_mapping))
    combined = _combine_components(components)
    if isinstance(combined, Rejected):
        return PermissionCheckDiagnostic(query_ref, "missing_key")
    return PermissionCheckResult(
        query=query_ref,
        context=(
            Unresolved(
                ResolutionDiagnostic(
                    owner_data.unavailable_reason or "missing_input",
                    missing_identities=owner_data.missing_identities,
                )
            )
            if owner_data.missing_identities or owner_data.unavailable_reason
            else Resolved(context)
        ),
        permission=permission,
        effective_decision=effective_decision,
        components=tuple(components),
        combined=combined,
        assurance=assurance,
    )


def _lookup_saved_permission_check(records: Sequence[Any], query_key: ResultKey) -> Observed[Any]:
    """FN-12 consumer helper. It delegates exact/prior semantics to K2."""
    return lookup(records, query_key)


# Type-level names in L4 §16.2; concrete refs are SubjectRef values resolved
# by the private owner boundary.
__all__ = [
    "AuthorityContext",
    "AuthorityContextResolution",
    "AuthorityInputBindingRef",
    "AuthorityInputRef",
    "Component",
    "OperationAuthorityTuple",
    "PermissionCheck",
    "PermissionCheckDiagnostic",
    "PermissionCheckResult",
    "PermissionQuery",
    "PermissionQueryRef",
    "PermissionRecord",
    "resolve_authority_context",
    "check_permission",
]
