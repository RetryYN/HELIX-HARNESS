"""Private K8 label/effect projections over existing Common Kernel values.

This module implements only pure typed projection and selection helpers. It has
no SECURITY/current-source reader, K5 persistence, effect writer, or public K8
API. Synthetic typed values used by its unit tests are not current observations.
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any, Mapping, Sequence

try:
    from . import common_kernel as k1
    from .permission import PermissionCheck as _PermissionCheck
    from .permission import PermissionCheckDiagnostic as _PermissionCheckDiagnostic
    from .permission import PermissionCheckResult as _PermissionCheckResult
    from .verification import RequiredResult as _RequiredResult
    from .verification import VerifierRef as _VerifierRef
except ImportError:  # direct-import unit discovery
    import common_kernel as k1
    from permission import PermissionCheck as _PermissionCheck
    from permission import PermissionCheckDiagnostic as _PermissionCheckDiagnostic
    from permission import PermissionCheckResult as _PermissionCheckResult
    from verification import RequiredResult as _RequiredResult
    from verification import VerifierRef as _VerifierRef

__all__: tuple[str, ...] = ()


@dataclass(frozen=True)
class _TargetOwnerRef:
    target: k1.SubjectRef
    owner: k1.SubjectRef


@dataclass(frozen=True)
class _RouteSlice:
    target_owners: tuple[_TargetOwnerRef, ...]
    route_verifier: _VerifierRef


@dataclass(frozen=True)
class _EffectSlice:
    effect_source: k1.SubjectRef


@dataclass(frozen=True)
class _ClassificationDecl:
    classification_definition: k1.SubjectRef
    classifier: k1.SubjectRef
    route_slice: _RouteSlice | None
    effect_slice: _EffectSlice | None


@dataclass(frozen=True)
class _InputSourceRef:
    source: k1.SubjectRef
    project: k1.SubjectRef


@dataclass(frozen=True)
class _ObservedLabel:
    input: _InputSourceRef
    trust: str
    classification: k1.Observed[Any]
    key: k1.ResultKey
    evidence: Any


@dataclass(frozen=True)
class _EffectBinding:
    input_label: k1.SubjectRef | None
    route: k1.SubjectRef | None
    target: k1.SubjectRef | None
    permission_query: k1.SubjectRef | None


@dataclass(frozen=True)
class _EffectObservation:
    source: k1.SubjectRef
    event: k1.SubjectRef | None
    outcome: str
    issuer: str
    binding: _EffectBinding | None


@dataclass(frozen=True)
class _EffectIssuerDiagnostic:
    state: str
    source: k1.SubjectRef | None
    declared_issuer: str | None
    observed_issuer: str | None
    reason: str | None


@dataclass(frozen=True)
class _EffectIssuerAssuranceDiagnostic:
    state: str = "unproven"
    reason: str = "no_existing_signature_or_anchor"


class _MismatchField(str, Enum):
    INPUT_LABEL = "input_label"
    ROUTE = "route"
    TARGET = "target"
    REVISION_SUBJECT = "revision_subject"
    PERMISSION_CHECK = "permission_check"
    PERMISSION_QUERY = "permission_query"
    EFFECT_EVENT = "effect_event"
    BINDING_INPUT_LABEL = "binding.input_label"
    BINDING_ROUTE = "binding.route"
    BINDING_TARGET = "binding.target"
    BINDING_PERMISSION_QUERY = "binding.permission_query"
    ISSUER = "issuer"
    CURRENT_CLASSIFICATION_RECORD = "current_classification_record"


_MISMATCH_ORDER = tuple(_MismatchField)


@dataclass(frozen=True)
class _Validated:
    pass


@dataclass(frozen=True)
class _Mismatch:
    fields: tuple[_MismatchField, ...]

    def __post_init__(self) -> None:
        if not self.fields or any(not isinstance(field, _MismatchField) for field in self.fields):
            raise TypeError("K8 Mismatch requires a nonempty tuple of existing mismatch fields")
        if len(set(self.fields)) != len(self.fields):
            raise TypeError("K8 Mismatch fields must not repeat")


@dataclass(frozen=True)
class _Denied:
    source: str

    def __post_init__(self) -> None:
        if self.source not in {"permission_check", "route_verification"}:
            raise TypeError("K8 Denied source must use an existing closed value")


_TransitionOutcome = _Validated | _Mismatch | _Denied


@dataclass(frozen=True)
class _KeyUnavailable:
    state: str
    diagnostic: k1.Rejected


@dataclass(frozen=True)
class _ValidationEvidenceUnavailable:
    state: str
    evidence_ref: Any
    reason: str


@dataclass(frozen=True)
class _NotSelected:
    state: str = "not_selected"


@dataclass(frozen=True)
class _TransitionComponents:
    saved_input_label: k1.Observed[Any]
    current_classification: k1.Observed[Any]
    effect: k1.Observed[Any]
    permission_check: _PermissionCheck | _KeyUnavailable
    route_verification: _RequiredResult | _KeyUnavailable
    issuer_source_match: _EffectIssuerDiagnostic
    raw_read_refs: tuple[k1.SubjectRef, ...]


@dataclass(frozen=True)
class _TransitionValidation:
    result: k1.Observed[_TransitionOutcome] | _KeyUnavailable
    components: _TransitionComponents | _ValidationEvidenceUnavailable
    issuer_authenticity: _EffectIssuerAssuranceDiagnostic


@dataclass(frozen=True)
class _CaseInputBinding:
    input_label: k1.SubjectRef
    source: k1.SubjectRef
    project: k1.SubjectRef
    task_scope: k1.SubjectRef
    selection: str
    route: k1.SubjectRef | None
    target: k1.SubjectRef | None
    permission_query: k1.SubjectRef | None
    effect_observation: k1.SubjectRef | None


@dataclass(frozen=True)
class _CaseResultPointers:
    classification_key: k1.ResultKey
    effect_key: k1.ResultKey
    validation_key: k1.ResultKey | None


@dataclass(frozen=True)
class _TransitionCase:
    input_binding_ref: k1.SubjectRef
    result_pointers: _CaseResultPointers


@dataclass(frozen=True)
class _LabelTransition:
    source_label: _ObservedLabel
    read_result: k1.Observed[Any]
    observed_effect: k1.Observed[Any]
    validated_transition: _TransitionValidation | _NotSelected
    pointer_diagnostics: tuple[Any, ...]


def _canonical(value: Any) -> Any:
    return k1._canonical_value(value)


def _canonical_bytes(value: Any) -> bytes:
    return k1._canonical_json_bytes(_canonical(value))


def _operation_version(
    operation: str,
    api_contract: k1.SubjectRef,
    owner_contracts: Sequence[k1.SubjectRef],
) -> str:
    """Canonical L4 K8OperationVersion from already-resolved contract refs."""
    ordered = tuple(
        sorted(owner_contracts, key=lambda ref: (ref.identity, ref.kind, ref.revision, ref.digest))
    )
    body = {
        "operation": operation,
        "api_contract": _canonical(api_contract),
        "owner_contracts": [_canonical(ref) for ref in ordered],
    }
    return _canonical_bytes(body).decode("utf-8", errors="strict")


def _case_binding_ref(
    owner_identity: str,
    case_identity: str,
    owner_input_binding: k1.SubjectRef,
    binding: _CaseInputBinding,
) -> k1.SubjectRef:
    """Construct the input-only binding ref; result pointers are excluded."""
    identity = _canonical_bytes(
        {"owner_identity": owner_identity, "case_identity": case_identity}
    ).decode("utf-8", errors="strict")
    return k1.SubjectRef(
        kind="k8_case_binding",
        identity=identity,
        revision=owner_input_binding.revision,
        digest=k1._sha256_digest(_canonical_bytes(binding)),
    )


def _role_bound_input_ref(side: str, role: str, ref: k1.SubjectRef) -> k1.SubjectRef:
    """Represent an existing role alias without changing its source digest."""
    identity = _canonical_bytes(
        {"side": side, "role": role, "ref_identity": ref.identity}
    ).decode("utf-8", errors="strict")
    return k1.SubjectRef("k8_role_input", identity, ref.revision, ref.digest)


def _bind_role_inputs(
    aliases: Sequence[tuple[str, str, k1.SubjectRef]],
    *,
    binding_kind: str,
    binding_identity: str,
    owner_revision: str | None = None,
) -> k1.AliasBinding | k1.Rejected:
    """Delegate alias dedup/conflict and mapping bytes to the existing K2 rule."""
    prepared = []
    for side, role, raw_ref in aliases:
        alias_ref = _role_bound_input_ref(side, role, raw_ref)
        prepared.append(({"side": side}, role, raw_ref, alias_ref))
    return k1._bind_alias_inputs(
        prepared, binding_kind, binding_identity, owner_revision=owner_revision
    )


def _key_from_resolved_refs(
    operation: str,
    operation_version: str,
    subject: k1.SubjectRef,
    inputs: Sequence[k1.SubjectRef],
    scope: str,
) -> k1.ResultKey | k1.Rejected:
    """Build a K2 key from resolved role-bound refs; K2 owns key validation."""
    unique: list[k1.SubjectRef] = []
    by_identity: dict[str, k1.SubjectRef] = {}
    for ref in inputs:
        if ref.identity == subject.identity:
            if ref == subject:
                continue  # K8 keeps the operation subject only in the subject slot.
            return k1.Rejected("missing_key")
        prior = by_identity.get(ref.identity)
        if prior is not None:
            if prior == ref:
                continue
            # K8 requires same role-bound alias collisions to stop before K2 key_of.
            return k1.Rejected("missing_key")
        by_identity[ref.identity] = ref
        unique.append(ref)
    return k1.key_of(operation, operation_version, subject, unique, scope)


def _project_observed_label(
    input_ref: _InputSourceRef,
    classification: k1.Observed[Any],
    key: k1.ResultKey,
    evidence: Any,
) -> _ObservedLabel:
    """Losslessly project a typed classification; trust is always untrusted."""
    return _ObservedLabel(input_ref, "untrusted", classification, key, evidence)


def _retain_effect_observation(value: _EffectObservation) -> _EffectObservation:
    """Return the exact already-typed effect record without deriving its truth."""
    return value


def _compare_transition_fields(
    pairs: Mapping[_MismatchField, tuple[Any, Any]],
) -> tuple[tuple[_MismatchField, ...], tuple[_MismatchField, ...]]:
    """Return confirmed differences and fields not comparable due to nulls."""
    mismatches: list[_MismatchField] = []
    unavailable: list[_MismatchField] = []
    for field in _MISMATCH_ORDER:
        if field not in pairs:
            continue
        expected, actual = pairs[field]
        if expected is None or actual is None:
            unavailable.append(field)
        elif expected != actual:
            mismatches.append(field)
    return tuple(mismatches), tuple(unavailable)


def _polarity_mapping(api_contract: k1.SubjectRef) -> k1.PolarityMapping:
    """Build the existing K8 mapping identity/version from resolved contract ref."""
    version = _canonical_bytes(
        {"revision": api_contract.revision, "digest": api_contract.digest}
    ).decode("utf-8", errors="strict")

    def classify(value: Any) -> k1.Polarity:
        if isinstance(value, _Validated):
            return k1.Polarity.POSITIVE
        if isinstance(value, (_Mismatch, _Denied)):
            return k1.Polarity.NEGATIVE
        raise TypeError("K8 PolarityOf requires a typed TransitionOutcome")

    return k1.PolarityMapping("k8_transition_polarity", version, classify)


def _reason_string(reason: Any) -> str:
    return str(reason.value) if isinstance(reason, Enum) else str(reason)


def _append_observed_candidate(value: Any, target: list[tuple[str, str, Any]]) -> None:
    """Collect existing K1 candidate classes while retaining the source object."""
    if isinstance(value, k1.Unknown):
        target.append(("unknown", _reason_string(value.reason), value))
    elif isinstance(value, k1.Stale):
        # L4 K8 fresh dependencies map Stale to Unknown(missing_input).
        target.append(("unknown", k1.UnknownReason.MISSING_INPUT.value, value))
    elif isinstance(value, k1.NotApplicable):
        # Required K8 dependencies cannot be satisfied by NotApplicable.
        target.append(("unknown", k1.UnknownReason.MISSING_INPUT.value, value))
    elif isinstance(value, k1.Unobserved):
        target.append(("unobserved", _reason_string(value.why), value))
    elif isinstance(value, k1.Value):
        return
    else:
        raise TypeError("K8 component must use an existing K1 Observed variant")


def _combined_candidates(combined: Any, target: list[tuple[str, str, Any]]) -> None:
    if not isinstance(combined, k1.Combined):
        raise TypeError("K8 dependency must use the existing K1 Combined type")
    start = len(target)
    components = combined.components
    non_values = set(combined.non_values)
    for index, component in enumerate(components):
        if index in non_values:
            _append_observed_candidate(component, target)
    set_reason = combined.set_reason
    if set_reason is not None:
        target.append(("unknown", _reason_string(set_reason.reason), set_reason))
    if (
        combined.verdict == k1.Verdict.UNDETERMINED
        and len(target) == start
    ):
        target.append(("unknown", k1.UnknownReason.MISSING_INPUT.value, combined))


def _collect_candidates(components: _TransitionComponents) -> list[tuple[str, str, Any]]:
    candidates: list[tuple[str, str, Any]] = []
    _append_observed_candidate(components.saved_input_label, candidates)
    _append_observed_candidate(components.current_classification, candidates)
    _append_observed_candidate(components.effect, candidates)

    permission = components.permission_check
    if isinstance(permission, _KeyUnavailable):
        candidates.append(("unknown", k1.UnknownReason.MISSING_INPUT.value, permission))
    elif isinstance(permission, _PermissionCheckResult):
        _combined_candidates(permission.combined, candidates)
    elif isinstance(permission, _PermissionCheckDiagnostic):
        # Existing PermissionCheckDiagnostic; both defined reasons map locally.
        if permission.reason not in {"missing_key", "invalid_query"}:
            raise TypeError("K8 received an unknown existing K3 diagnostic reason")
        candidates.append(("unknown", k1.UnknownReason.MISSING_INPUT.value, permission))
    else:
        raise TypeError("K8 permission component must use an existing K3 type")

    route = components.route_verification
    if isinstance(route, _KeyUnavailable):
        candidates.append(("unknown", k1.UnknownReason.MISSING_INPUT.value, route))
    elif isinstance(route, _RequiredResult):
        _combined_candidates(route.combined, candidates)
    else:
        raise TypeError("K8 route component must use the existing K6 RequiredResult type")
    return candidates


def _effect_binding_missing_fields(observation: _EffectObservation) -> tuple[str, ...]:
    """Return required event/binding refs absent from a typed effect observation."""
    if not isinstance(observation, _EffectObservation):
        raise TypeError("K8 effect Value must contain the existing EffectObservation shape")
    missing: list[str] = []
    if observation.event is None:
        missing.append("event")
    binding = observation.binding
    if binding is None:
        missing.extend(("binding.input_label", "binding.route", "binding.target", "binding.permission_query"))
    elif not isinstance(binding, _EffectBinding):
        raise TypeError("K8 effect binding must use the existing typed EffectBinding shape")
    else:
        for name in ("input_label", "route", "target", "permission_query"):
            if getattr(binding, name) is None:
                missing.append(f"binding.{name}")
    return tuple(missing)


_UNKNOWN_PRIORITY = (
    "ambiguous",
    "unsupported",
    "conflict",
    "evaluation_error",
    "indeterminate",
    "unreadable",
    "incomparable",
    "unregistered",
    "missing_input",
    "invalid_disposition",
)
_UNOBSERVED_PRIORITY = ("not_selected", "not_run", "pending_receipt")


def _priority_reason(candidates: Sequence[tuple[str, str, Any]], kind: str, priority: Sequence[str]) -> str | None:
    reasons = {reason for candidate_kind, reason, _ in candidates if candidate_kind == kind}
    unrecognized = reasons.difference(priority)
    if unrecognized:
        raise TypeError(f"typed K8 input contains an unrecognized {kind} reason")
    return next((reason for reason in priority if reason in reasons), None)


def _select_observation(
    key: k1.ResultKey,
    value: Any | None,
    dependencies: Sequence[Any],
) -> k1.Observed[Any]:
    """Select an existing observation class without converting non-values."""
    candidates: list[tuple[str, str, Any]] = []
    for dependency in dependencies:
        _append_observed_candidate(dependency, candidates)
    reason = _priority_reason(candidates, "unknown", _UNKNOWN_PRIORITY)
    if reason is not None:
        return k1.Unknown(reason, key, {"candidates": tuple(candidates)})
    why = _priority_reason(candidates, "unobserved", _UNOBSERVED_PRIORITY)
    if why is not None:
        return k1.Unobserved(key, why)
    if value is None:
        return k1.Unknown(k1.UnknownReason.MISSING_INPUT, key, {"dependencies": tuple(dependencies)})
    return k1.Value(value, key, {"dependencies": tuple(dependencies)})


def _select_transition_result(
    *,
    key: k1.ResultKey,
    selected: bool,
    validation_key_ready: bool,
    mismatches: Sequence[_MismatchField],
    components: _TransitionComponents,
    null_comparison_fields: Sequence[_MismatchField] = (),
    issuer_source_unavailable: bool = False,
) -> k1.Observed[_TransitionOutcome] | _KeyUnavailable | k1.Rejected:
    """Implement only the L4 §18.4 fresh-selection table over typed inputs."""
    if not isinstance(selected, bool) or not isinstance(validation_key_ready, bool):
        raise TypeError("K8 selection and key-readiness inputs must be booleans")
    if any(not isinstance(field, _MismatchField) for field in mismatches):
        raise TypeError("K8 mismatch input must use only existing MismatchField values")
    if any(not isinstance(field, _MismatchField) for field in null_comparison_fields):
        raise TypeError("K8 unavailable comparison input must use only existing MismatchField values")
    if not validation_key_ready:
        if selected:
            return _KeyUnavailable("key_unavailable", k1.Rejected("missing_key"))
        return k1.Rejected("missing_key")
    if not selected:
        return k1.Unobserved(key, k1.UnobservedWhy.NOT_SELECTED)

    fields = set(mismatches)
    issuer_state = components.issuer_source_match.state
    if issuer_state == "mismatch":
        fields.add(_MismatchField.ISSUER)
    elif issuer_state not in {"match", "unavailable"}:
        raise TypeError("typed K8 issuer diagnostic has an unknown state")
    if (
        isinstance(components.effect, k1.Value)
        and isinstance(components.effect.value, _EffectObservation)
        and components.effect.value.outcome == "none"
    ):
        fields.add(_MismatchField.EFFECT_EVENT)
    candidates = _collect_candidates(components)
    if isinstance(components.effect, k1.Value):
        for missing_field in _effect_binding_missing_fields(components.effect.value):
            candidates.append(
                ("unknown", k1.UnknownReason.MISSING_INPUT.value, ("effect", missing_field))
            )
    if issuer_state == "unavailable" and not isinstance(components.effect, (k1.Unknown, k1.Unobserved, k1.Stale, k1.NotApplicable)):
        candidates.append(("unknown", k1.UnknownReason.MISSING_INPUT.value, components.issuer_source_match))
    if null_comparison_fields:
        candidates.extend(
            ("unknown", k1.UnknownReason.MISSING_INPUT.value, field)
            for field in null_comparison_fields
        )
    if issuer_source_unavailable:
        _append_observed_candidate(components.effect, candidates)

    # Existing K3/K6 negative outcomes are subordinate to confirmed mismatch.
    if fields:
        ordered = tuple(field for field in _MISMATCH_ORDER if field in fields)
        return k1.Value(_Mismatch(ordered), key, {"mismatch_fields": tuple(f.value for f in ordered)})

    permission = components.permission_check
    if isinstance(permission, _PermissionCheckResult) and permission.combined.verdict == k1.Verdict.NEGATIVE:
        return k1.Value(_Denied("permission_check"), key, {"source": "permission_check"})

    route = components.route_verification
    if isinstance(route, _RequiredResult) and route.combined.verdict == k1.Verdict.NEGATIVE:
        return k1.Value(_Denied("route_verification"), key, {"source": "route_verification"})

    reason = _priority_reason(candidates, "unknown", _UNKNOWN_PRIORITY)
    if reason is not None:
        return k1.Unknown(reason, key, {"candidates": tuple(candidates)})

    why = _priority_reason(candidates, "unobserved", _UNOBSERVED_PRIORITY)
    if why is not None:
        return k1.Unobserved(key, why)

    required_values = (components.saved_input_label, components.current_classification, components.effect)
    if not all(isinstance(item, k1.Value) for item in required_values):
        return k1.Unknown(k1.UnknownReason.MISSING_INPUT, key, {"candidates": tuple(candidates)})
    if not all(
        isinstance(item, (_PermissionCheckResult, _RequiredResult))
        and item.combined.verdict == k1.Verdict.POSITIVE
        for item in (components.permission_check, components.route_verification)
    ):
        return k1.Unknown(k1.UnknownReason.MISSING_INPUT, key, {"candidates": tuple(candidates)})
    effect_value = components.effect.value
    if not isinstance(effect_value, _EffectObservation):
        raise TypeError("K8 effect Value must contain the existing EffectObservation shape")
    if effect_value.outcome != "occurred":
        # L4 treats selected outcome=none as a confirmed effect_event mismatch.
        return k1.Value(_Mismatch((_MismatchField.EFFECT_EVENT,)), key, {"mismatch_fields": ("effect_event",)})
    return k1.Value(_Validated(), key, {"components": components})


def _make_transition_validation(
    result: k1.Observed[_TransitionOutcome] | _KeyUnavailable,
    components: _TransitionComponents | _ValidationEvidenceUnavailable,
    issuer_authenticity: _EffectIssuerAssuranceDiagnostic,
) -> _TransitionValidation:
    """Retain every typed component and the supplied assurance projection."""
    return _TransitionValidation(result, components, issuer_authenticity)


def _project_label_transition(
    source_label: _ObservedLabel,
    read_result: k1.Observed[Any],
    observed_effect: k1.Observed[Any],
    validation: _TransitionValidation | _NotSelected,
    pointer_diagnostics: Sequence[Any],
) -> _LabelTransition:
    return _LabelTransition(
        source_label,
        read_result,
        observed_effect,
        validation,
        tuple(pointer_diagnostics),
    )
