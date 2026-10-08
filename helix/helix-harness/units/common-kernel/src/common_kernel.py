"""Pure K1/K2 semantic core for the HELIX common-kernel unit.

The package deliberately has no K5 storage, K6 source reader, or owner-specific
authority implementation.  Inputs and outputs are immutable values so callers
can retain the exact observations and key material they supplied.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
import hashlib
import json
import math
import re
from typing import Any, Callable, Generic, Iterable, Sequence, TypeVar

T = TypeVar("T")
Digest = str
KeyDigest = str
PolarityOf = Callable[[Any], "Polarity"]

_DIGEST_RE = re.compile(r"^sha256:[0-9a-f]{64}$")


class Polarity(str, Enum):
    POSITIVE = "Positive"
    NEGATIVE = "Negative"


@dataclass(frozen=True)
class PolarityRef:
    """Owner-supplied mapping identity and version retained by K1."""
    identity: str
    version: str


@dataclass(frozen=True)
class PolarityMapping:
    """Python representation of the existing owner PolarityOf<T> mapping."""
    identity: str
    version: str
    classify: PolarityOf

    def __call__(self, value: Any) -> Polarity:
        return self.classify(value)

    @property
    def reference(self) -> PolarityRef:
        return PolarityRef(self.identity, self.version)


class Verdict(str, Enum):
    POSITIVE = "Positive"
    NEGATIVE = "Negative"
    UNDETERMINED = "Undetermined"


class UnknownReason(str, Enum):
    AMBIGUOUS = "ambiguous"
    UNSUPPORTED = "unsupported"
    CONFLICT = "conflict"
    EVALUATION_ERROR = "evaluation_error"
    INDETERMINATE = "indeterminate"
    UNREADABLE = "unreadable"
    INCOMPARABLE = "incomparable"
    UNREGISTERED = "unregistered"
    MISSING_INPUT = "missing_input"
    INVALID_DISPOSITION = "invalid_disposition"


class UnobservedWhy(str, Enum):
    NOT_SELECTED = "not_selected"
    NOT_RUN = "not_run"
    PENDING_RECEIPT = "pending_receipt"


@dataclass(frozen=True)
class SubjectRef:
    kind: str
    identity: str
    revision: str
    digest: Digest


@dataclass(frozen=True)
class ResultKey:
    operation: str
    operation_version: str
    subject: SubjectRef
    inputs: tuple[SubjectRef, ...]
    scope: str


@dataclass(frozen=True)
class Value(Generic[T]):
    value: T
    key: ResultKey
    evidence: Any


@dataclass(frozen=True)
class Unknown:
    reason: str | UnknownReason
    key: ResultKey
    evidence: Any = None


@dataclass(frozen=True)
class Unobserved:
    key: ResultKey
    why: str | UnobservedWhy
    superseded: KeyDigest | None = None


@dataclass(frozen=True)
class Stale(Generic[T]):
    prior: Value[T]
    recorded_key: ResultKey
    current_key: ResultKey


@dataclass(frozen=True)
class NotApplicable:
    reason: str
    authority: Any
    reentry_trigger: str
    key: ResultKey


Observed = Value[T] | Unknown | Unobserved | Stale[T] | NotApplicable


@dataclass(frozen=True)
class Rejected:
    reason: str


@dataclass(frozen=True)
class WithheldReason:
    index: int | str
    observed_class: str
    reason: str


@dataclass(frozen=True)
class SetDiagnostic:
    """Internal aggregate diagnostic, outside the key-bearing Observed union."""
    class_name: str
    reason: str


@dataclass(frozen=True)
class Combined(Generic[T]):
    verdict: Verdict
    components: tuple[Observed[T], ...]
    polarity: PolarityRef | tuple[PolarityRef | None, ...] | None
    negatives: tuple[int, ...]
    non_values: tuple[int, ...]
    excluded: tuple[int, ...]
    set_reason: SetDiagnostic | None


@dataclass(frozen=True)
class Admitted:
    combined: Combined[Any]


@dataclass(frozen=True)
class Withheld:
    reasons: tuple[WithheldReason, ...]


@dataclass(frozen=True)
class ResultRecord(Generic[T]):
    key: ResultKey
    key_digest: KeyDigest
    result: Observed[T]
    result_digest: Digest
    producer: Any


@dataclass(frozen=True)
class Recorded(Generic[T]):
    record: ResultRecord[T]
    records: tuple[ResultRecord[T], ...]


@dataclass(frozen=True)
class NoOp(Generic[T]):
    record: ResultRecord[T]


@dataclass(frozen=True)
class Conflict(Generic[T]):
    records: tuple[ResultRecord[T], ...]


@dataclass(frozen=True)
class RoleBoundAlias:
    context: Any
    role: str
    raw_ref: SubjectRef
    alias_ref: SubjectRef


@dataclass(frozen=True)
class AliasBinding:
    binding_ref: SubjectRef
    aliases: tuple[RoleBoundAlias, ...]
    canonical_bytes: bytes
    inputs: tuple[SubjectRef, ...]


def _get(value: Any, name: str, default: Any = None) -> Any:
    if isinstance(value, dict):
        return value.get(name, default)
    return getattr(value, name, default)


def _present(value: Any) -> bool:
    return value is not None


def _ref_fields_present(ref: Any) -> bool:
    return ref is not None and all(
        _present(_get(ref, field)) for field in ("kind", "identity", "revision", "digest")
    )


def _observed_key(value: Any) -> Any:
    # L4 Stale has no generic `key` field: its current_key is the key of the
    # stale observation. The recorded key remains separately available.
    if isinstance(value, Stale):
        return value.current_key
    return _get(value, "key")


def validate_result_key(key: Any) -> Rejected | None:
    """K1-I6 key-field presence check; it intentionally does not shape-check values."""
    if key is None or not all(
        _present(_get(key, field))
        for field in ("operation", "operation_version", "subject", "inputs", "scope")
    ):
        return Rejected("missing_key")
    if not _ref_fields_present(_get(key, "subject")):
        return Rejected("missing_key")
    inputs = _get(key, "inputs")
    if not isinstance(inputs, (tuple, list)):
        return Rejected("missing_key")
    if any(not _ref_fields_present(ref) for ref in inputs):
        return Rejected("missing_key")
    return None


def prepare_polarity_input(
    value: T,
    key: ResultKey,
    polarity: PolarityMapping | None,
    evidence: Any = None,
) -> Value[T] | Unknown | Rejected:
    """Caller/owner boundary helper for mapping-unavailable observations.

    The mapping is not evaluated here: `combine` receives it separately. A
    missing mapping yields the existing complete-key Unknown variant.
    """
    invalid = validate_result_key(key)
    if invalid:
        return invalid
    if polarity is None:
        return Unknown(UnknownReason.MISSING_INPUT, key, evidence)
    return Value(value, key, evidence)


def _is_valid_disposition(value: Any) -> bool:
    return all(
        _present(_get(value, name))
        for name in ("reason", "authority", "reentry_trigger")
    )


def _component_and_polarity(
    item: Any, default_polarity: PolarityMapping | None
) -> tuple[Observed[Any], PolarityMapping | None]:
    if (
        isinstance(item, tuple)
        and len(item) == 2
        and isinstance(item[1], PolarityMapping)
    ):
        return item[0], item[1]
    return item, default_polarity


def _class_name(value: Any) -> str:
    if isinstance(value, Value):
        return "Value"
    if isinstance(value, Unknown):
        return "Unknown"
    if isinstance(value, Unobserved):
        return "Unobserved"
    if isinstance(value, Stale):
        return "Stale"
    if isinstance(value, NotApplicable):
        return "NotApplicable"
    return type(value).__name__


def _why(value: Any) -> str:
    raw = _get(value, "reason", _get(value, "why", None))
    if isinstance(raw, Enum):
        return str(raw.value)
    return str(raw) if raw is not None else ""


def combine(
    components: Sequence[Observed[T] | tuple[Observed[Any], PolarityMapping]],
    polarity: PolarityMapping | None = None,
) -> Combined[T] | Rejected:
    normalized: list[tuple[Observed[Any], PolarityMapping | None]] = [
        _component_and_polarity(item, polarity) for item in components
    ]
    for component, _ in normalized:
        invalid = validate_result_key(_observed_key(component))
        if invalid:
            return invalid

    negatives: list[int] = []
    non_values: list[int] = []
    excluded: list[int] = []
    decision_count = 0
    for index, (component, component_polarity) in enumerate(normalized):
        if isinstance(component, NotApplicable):
            if _is_valid_disposition(component):
                excluded.append(index)
            else:
                non_values.append(index)
                decision_count += 1
            continue
        decision_count += 1
        if isinstance(component, Value):
            if component_polarity is None:
                raise TypeError(
                    "Value without its owner PolarityOf must be converted to "
                    "keyed Unknown(missing_input) before combine"
                )
            result = component_polarity(component.value)
            if result in (Polarity.NEGATIVE, Polarity.NEGATIVE.value):
                negatives.append(index)
            elif result not in (Polarity.POSITIVE, Polarity.POSITIVE.value):
                raise TypeError("PolarityOf must return Positive or Negative")
            continue
        non_values.append(index)

    set_reason = None
    if decision_count == 0:
        # Aggregate absence is a Combined-level diagnostic, not an Observed
        # component. It therefore carries no fabricated or reused ResultKey.
        set_reason = SetDiagnostic("Unknown", UnknownReason.MISSING_INPUT.value)
    verdict = (
        Verdict.NEGATIVE
        if negatives
        else Verdict.UNDETERMINED
        if non_values or decision_count == 0
        else Verdict.POSITIVE
    )
    if not normalized:
        polarity_identity = polarity.reference if polarity is not None else None
    elif polarity is not None and all(
        item_polarity is polarity for _, item_polarity in normalized
    ):
        polarity_identity = polarity.reference
    else:
        polarity_identity = tuple(
            item_polarity.reference if item_polarity is not None else None
            for _, item_polarity in normalized
        )
    return Combined(
        verdict=verdict,
        components=tuple(component for component, _ in normalized),
        polarity=polarity_identity,
        negatives=tuple(negatives),
        non_values=tuple(non_values),
        excluded=tuple(excluded),
        set_reason=set_reason,
    )


def admit(combined: Combined[T]) -> Admitted | Withheld | Rejected:
    if not isinstance(combined, Combined):
        raise TypeError("admit expects Combined")
    for component in combined.components:
        invalid = validate_result_key(_observed_key(component))
        if invalid:
            return invalid
    if combined.verdict is Verdict.POSITIVE:
        return Admitted(combined)

    reasons: list[WithheldReason] = []
    for index in combined.negatives:
        reasons.append(WithheldReason(index, "Value", "negative_value"))
    for index in combined.non_values:
        component = combined.components[index]
        reason = _why(component)
        if isinstance(component, NotApplicable):
            reason = "invalid_disposition"
        elif isinstance(component, Stale):
            reason = "stale"
        reasons.append(WithheldReason(index, _class_name(component), reason))
    if combined.set_reason is not None:
        reasons.append(
            WithheldReason("whole", combined.set_reason.class_name, combined.set_reason.reason)
        )
    if not reasons:
        # A malformed hand-created Combined is outside the typed input
        # precondition; do not turn it into an affirmative result.
        return Withheld((WithheldReason("whole", "Unknown", "missing_input"),))
    return Withheld(tuple(reasons))


def disposition(
    reason: str | None,
    authority: Any,
    reentry_trigger: str | None,
    key: ResultKey,
) -> NotApplicable | Unknown | Rejected:
    invalid = validate_result_key(key)
    if invalid:
        return invalid
    if reason is None or authority is None or reentry_trigger is None:
        return Unknown(UnknownReason.INVALID_DISPOSITION, key)
    return NotApplicable(reason, authority, reentry_trigger, key)


def canonical_json_bytes(value: Any) -> bytes:
    """Serialize the L6 selected CPython JSON candidate; no newline framing."""
    _check_json_domain(value, set())
    encoded = json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
        allow_nan=False,
        check_circular=True,
    )
    return encoded.encode("utf-8", errors="strict")


def _check_json_domain(value: Any, ancestors: set[int]) -> None:
    if value is None or isinstance(value, (str, bool, int)):
        return
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ValueError("non-finite number is outside canonical JSON domain")
        return
    if isinstance(value, list) or isinstance(value, tuple):
        marker = id(value)
        if marker in ancestors:
            raise ValueError("cyclic container is outside canonical JSON domain")
        ancestors.add(marker)
        try:
            for item in value:
                _check_json_domain(item, ancestors)
        finally:
            ancestors.remove(marker)
        return
    if isinstance(value, dict):
        marker = id(value)
        if marker in ancestors:
            raise ValueError("cyclic container is outside canonical JSON domain")
        ancestors.add(marker)
        try:
            for key, item in value.items():
                if not isinstance(key, str):
                    raise TypeError("canonical JSON object keys must be strings")
                _check_json_domain(key, ancestors)
                _check_json_domain(item, ancestors)
        finally:
            ancestors.remove(marker)
        return
    raise TypeError("value is outside canonical JSON domain")


def sha256_digest(value: bytes) -> Digest:
    if not isinstance(value, bytes):
        raise TypeError("sha256_digest accepts exact bytes")
    return "sha256:" + hashlib.sha256(value).hexdigest()


def _canonical_value(value: Any) -> Any:
    if isinstance(value, Enum):
        return value.value
    if hasattr(value, "__dataclass_fields__"):
        return {
            field: _canonical_value(getattr(value, field))
            for field in value.__dataclass_fields__
        }
    if isinstance(value, tuple):
        return [_canonical_value(item) for item in value]
    if isinstance(value, list):
        return [_canonical_value(item) for item in value]
    if isinstance(value, dict):
        return {key: _canonical_value(item) for key, item in value.items()}
    return value


def _key_digest(key: ResultKey) -> KeyDigest:
    return sha256_digest(canonical_json_bytes(_canonical_value(key)))


def _valid_digest(value: Any) -> bool:
    return isinstance(value, str) and _DIGEST_RE.fullmatch(value) is not None


def key_of(
    operation: str | None,
    operation_version: str | None,
    subject: SubjectRef | None,
    inputs: Sequence[SubjectRef] | None,
    scope: str | None,
) -> ResultKey | Rejected:
    if (
        operation is None
        or operation_version is None
        or subject is None
        or inputs is None
        or scope is None
        or not _ref_fields_present(subject)
        or any(not _ref_fields_present(item) for item in inputs)
    ):
        return Rejected("missing_key")
    if not _valid_digest(subject.digest) or any(not _valid_digest(item.digest) for item in inputs):
        return Rejected("invalid_digest")
    identities = [_get(item, "identity") for item in inputs]
    if len(set(identities)) != len(identities):
        return Rejected("duplicate_identity")
    return ResultKey(
        operation=operation,
        operation_version=operation_version,
        subject=subject,
        inputs=tuple(sorted(inputs, key=lambda ref: ref.identity)),
        scope=scope,
    )


def bind_alias_inputs(
    aliases: Sequence[tuple[Any, str, SubjectRef, SubjectRef]],
    binding_kind: str,
    binding_identity: str,
    owner_revision: str | None = None,
) -> AliasBinding | Rejected:
    """Bind owner-provided role aliases without resolving owner authority."""
    by_alias: dict[str, tuple[Any, str, SubjectRef, SubjectRef]] = {}
    for context, role, raw_ref, alias_ref in aliases:
        if not _ref_fields_present(raw_ref) or not _ref_fields_present(alias_ref):
            return Rejected("missing_key")
        if alias_ref.digest != raw_ref.digest:
            return Rejected("missing_key")
        previous = by_alias.get(alias_ref.identity)
        entry = (context, role, raw_ref, alias_ref)
        if previous is not None and previous != entry:
            return Rejected("missing_key")
        if previous is None:
            by_alias[alias_ref.identity] = entry

    ordered = [by_alias[key] for key in sorted(by_alias)]
    mapping = [
        {
            "context": _canonical_value(context),
            "role": role,
            "raw_ref": _canonical_value(raw_ref),
            "alias_ref": _canonical_value(alias_ref),
        }
        for context, role, raw_ref, alias_ref in ordered
    ]
    binding_bytes = canonical_json_bytes(mapping)
    revision = owner_revision or canonical_json_bytes(
        [
            {"alias_identity": alias_ref.identity, "raw_revision": raw_ref.revision}
            for _, _, raw_ref, alias_ref in ordered
        ]
    ).decode("utf-8")
    binding_ref = SubjectRef(
        kind=binding_kind,
        identity=binding_identity,
        revision=revision,
        digest=sha256_digest(binding_bytes),
    )
    normalized_aliases = tuple(
        RoleBoundAlias(context, role, raw_ref, alias_ref)
        for context, role, raw_ref, alias_ref in ordered
    )
    inputs = (binding_ref,) + tuple(alias_ref for _, _, _, alias_ref in ordered)
    return AliasBinding(binding_ref, normalized_aliases, binding_bytes, inputs)


def candidate_records(
    records: Sequence[ResultRecord[T]], query_key: ResultKey
) -> tuple[ResultRecord[T], ...] | Unobserved | Rejected:
    invalid = validate_result_key(query_key)
    if invalid:
        return invalid
    query_inputs = {_get(ref, "identity") for ref in query_key.inputs}
    candidates = tuple(
        record
        for record in records
        if record.key.operation == query_key.operation
        and record.key.operation_version == query_key.operation_version
        and record.key.scope == query_key.scope
        and record.key.subject.identity == query_key.subject.identity
        and {_get(ref, "identity") for ref in record.key.inputs} == query_inputs
    )
    if not candidates:
        return Unobserved(query_key, UnobservedWhy.NOT_RUN)
    return candidates


def lookup_conflicts(
    candidates: Sequence[ResultRecord[T]], query_key: ResultKey
) -> Unknown | None:
    query_refs = [query_key.subject, *query_key.inputs]
    for record in candidates:
        stored_refs = [record.key.subject, *record.key.inputs]
        for query_ref in query_refs:
            for stored_ref in stored_refs:
                if stored_ref.identity != query_ref.identity:
                    continue
                if stored_ref.kind != query_ref.kind:
                    return Unknown(UnknownReason.CONFLICT, query_key)
                if (
                    stored_ref.revision == query_ref.revision
                    and stored_ref.digest != query_ref.digest
                ):
                    return Unknown(UnknownReason.CONFLICT, query_key)
    return None


def _refs_equal(left: Sequence[SubjectRef], right: Sequence[SubjectRef]) -> bool:
    return len(left) == len(right) and all(a == b for a, b in zip(left, right))


def _keys_equal(left: ResultKey, right: ResultKey) -> bool:
    return (
        left.operation == right.operation
        and left.operation_version == right.operation_version
        and left.subject == right.subject
        and _refs_equal(left.inputs, right.inputs)
        and left.scope == right.scope
    )


def lookup_exact_or_prior(
    candidates: Sequence[ResultRecord[T]], query_key: ResultKey
) -> Observed[T]:
    exact = [record for record in candidates if _keys_equal(record.key, query_key)]
    if exact:
        if len({record.result_digest for record in exact}) > 1:
            return Unknown(UnknownReason.CONFLICT, query_key)
        return exact[0].result
    prior = candidates[-1]
    if isinstance(prior.result, Value):
        return Stale(prior.result, prior.key, query_key)
    return Unobserved(query_key, UnobservedWhy.NOT_RUN, prior.key_digest)


def lookup(
    records: Sequence[ResultRecord[T]], query_key: ResultKey
) -> Observed[T] | Rejected:
    candidates = candidate_records(records, query_key)
    if isinstance(candidates, (Rejected, Unobserved)):
        return candidates
    conflict = lookup_conflicts(candidates, query_key)
    if conflict is not None:
        return conflict
    return lookup_exact_or_prior(candidates, query_key)


def _observed_body(result: Observed[Any]) -> Any:
    if isinstance(result, Value):
        return {"class": "Value", "value": _canonical_value(result.value), "evidence": _canonical_value(result.evidence)}
    if isinstance(result, Unknown):
        return {"class": "Unknown", "reason": _why(result), "evidence": _canonical_value(result.evidence)}
    if isinstance(result, Unobserved):
        return {"class": "Unobserved", "why": _why(result), "superseded": result.superseded}
    if isinstance(result, Stale):
        return {
            "class": "Stale",
            "prior": _observed_body(result.prior),
            "recorded_key": _canonical_value(result.recorded_key),
            "current_key": _canonical_value(result.current_key),
        }
    if isinstance(result, NotApplicable):
        return {
            "class": "NotApplicable",
            "reason": result.reason,
            "authority": _canonical_value(result.authority),
            "reentry_trigger": result.reentry_trigger,
        }
    raise TypeError("result is outside the typed Observed domain")


def record(
    records: Sequence[ResultRecord[T]],
    key: ResultKey,
    result: Observed[T],
    producer: Any,
) -> Recorded[T] | NoOp[T] | Conflict[T] | Rejected:
    if isinstance(result, Stale):
        return Rejected("stale_not_recordable")
    invalid = validate_result_key(key)
    if invalid:
        return invalid
    invalid = validate_result_key(_get(result, "key"))
    if invalid:
        return invalid
    result_digest = sha256_digest(canonical_json_bytes(_observed_body(result)))
    new_record = ResultRecord(key, _key_digest(key), result, result_digest, producer)
    matching = tuple(existing for existing in records if _keys_equal(existing.key, key))
    if any(existing.result_digest == result_digest for existing in matching):
        return NoOp(next(existing for existing in matching if existing.result_digest == result_digest))
    if matching:
        return Conflict((*matching, new_record))
    return Recorded(new_record, (*records, new_record))


__all__ = [
    "Admitted", "Combined", "Conflict", "NotApplicable", "NoOp",
    "Polarity", "PolarityMapping", "PolarityRef", "Rejected", "Recorded", "ResultKey", "ResultRecord",
    "SetDiagnostic", "SubjectRef", "Stale", "Unknown", "UnknownReason", "Unobserved", "UnobservedWhy",
    "Value", "Verdict", "Withheld", "WithheldReason", "admit", "combine",
    "disposition", "key_of", "lookup", "record",
]
