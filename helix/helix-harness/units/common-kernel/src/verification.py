"""K6 receipt verification logic over the existing K1/K2/K5 contracts.

Owner-bound readers, verifier-set resolution, and execution are private seams.
This module deliberately does not implement the public ``run`` API: its fixed
``ResultRecorded`` return has no mapped non-positive transport while the
executor and K5 writer are unconnected.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping, Sequence

try:  # support both the unit's direct-import and package-import test layouts
    from . import common_kernel as k1
    from . import journal as k5
except ImportError:  # pragma: no cover - exercised by current unit discovery
    import common_kernel as k1
    import journal as k5


@dataclass(frozen=True)
class VerifierRef:
    identity: str
    version: str
    digest: str

    def as_subject_ref(self) -> k1.SubjectRef:
        return k1.SubjectRef("verifier", self.identity, self.version, self.digest)


@dataclass(frozen=True)
class VerifierEntry:
    ref: VerifierRef
    deterministic: bool
    checks: Mapping[str, k1.PolarityMapping]


@dataclass(frozen=True)
class VerifierSet:
    ref: k1.SubjectRef
    members: tuple[VerifierEntry, ...]
    required_for: Mapping[str, tuple[str, ...]]


@dataclass(frozen=True)
class Execution:
    argv_digest: str
    exit: int
    outputs: tuple[k5.FixedRef, ...]
    started: str
    completed: str


@dataclass(frozen=True)
class Registry:
    registered: tuple[str, ...]
    evaluated: tuple[str, ...]


@dataclass(frozen=True)
class ReceiptBody:
    verifier: VerifierRef
    verifier_set: k1.SubjectRef
    key: k1.ResultKey
    read: Mapping[str, str]
    execution: Execution
    registry: Registry
    inner: k1.Combined[Any]
    authority_effect: str = "none"


@dataclass(frozen=True)
class AdmittedReceipt:
    body: ReceiptBody
    reverifiable: bool
    reproduction: Any
    issuer_authenticity: k1.Unknown


@dataclass(frozen=True)
class Assurance:
    reverifiable: bool
    reproduction: Any
    issuer_authenticity: k1.Unknown


@dataclass(frozen=True)
class RequiredResult:
    combined: k1.Combined[Any]
    assurance: Mapping[str, Assurance]


def _derive_receipt_key(
    base_key: k1.ResultKey,
    verifier: VerifierRef,
    verifier_set: k1.SubjectRef,
) -> k1.ResultKey | k1.Rejected:
    """Derive the K6 receipt key; K2 owns validation and input ordering."""
    refs = (*base_key.inputs, verifier.as_subject_ref(), verifier_set)
    return k1.key_of(
        base_key.operation,
        verifier.version,
        base_key.subject,
        refs,
        base_key.scope,
    )


def _lookup_receipt(
    records: Sequence[k1.ResultRecord[Any]], query_key: k1.ResultKey
) -> k1.Observed[Any] | k1.Rejected:
    """Use K2's exact/prior/conflict rules on a K5-restored ordered sequence."""
    return k1.lookup(records, query_key)


def _match_verifier_entry(
    verifier: VerifierRef, verifier_set: VerifierSet, key: k1.ResultKey
) -> k1.Observed[VerifierEntry]:
    for entry in verifier_set.members:
        if entry.ref == verifier:
            return k1.Value(entry, key, {"member": verifier.identity})
    return k1.Unknown(k1.UnknownReason.UNREGISTERED, key, {"verifier": verifier.identity})


def _validate_receipt_key_body(
    record: k1.ResultRecord[Any], query_key: k1.ResultKey, body: ReceiptBody
) -> k1.Observed[bool]:
    if record.key != query_key or record.result.key != record.key or body.key != query_key:
        return k1.Unknown(k1.UnknownReason.CONFLICT, query_key, {"field": "key"})
    expected_verifier = body.verifier.as_subject_ref()
    if expected_verifier not in query_key.inputs or body.verifier_set not in query_key.inputs:
        return k1.Unknown(k1.UnknownReason.CONFLICT, query_key, {"field": "verifier_inputs"})
    if body.authority_effect != "none":
        return k1.Unknown(k1.UnknownReason.CONFLICT, query_key, {"field": "authority_effect"})
    return k1.Value(True, query_key, {"key_body_consistent": True})


def _validate_record_digest(
    record: k1.ResultRecord[Any], query_key: k1.ResultKey
) -> k1.Observed[bool]:
    """Re-derive the stored observation digest with the existing K1 recorder."""
    rebuilt = k1.record((), record.key, record.result, record.producer)
    if not isinstance(rebuilt, k1.Recorded):
        return k1.Unknown(k1.UnknownReason.CONFLICT, query_key, {"field": "record_digest_input"})
    if record.key_digest != rebuilt.record.key_digest or record.result_digest != rebuilt.record.result_digest:
        return k1.Unknown(k1.UnknownReason.CONFLICT, query_key, {"field": "record_digest"})
    return k1.Value(True, query_key, {"record_digest": "matched"})


def _validate_read_set(
    body: ReceiptBody, query_key: k1.ResultKey
) -> k1.Observed[bool]:
    expected: dict[str, str] = {query_key.subject.identity: query_key.subject.digest}
    for ref in query_key.inputs:
        if ref.kind in {"verifier", "verifier_set"}:
            continue
        prior = expected.get(ref.identity)
        if prior is not None and prior != ref.digest:
            return k1.Unknown(k1.UnknownReason.CONFLICT, query_key, {"identity": ref.identity})
        expected[ref.identity] = ref.digest

    actual = body.read
    missing = set(expected) - set(actual)
    if missing:
        return k1.Unknown(k1.UnknownReason.MISSING_INPUT, query_key, {"missing": tuple(sorted(missing))})
    extra = set(actual) - set(expected)
    if extra:
        return k1.Unknown(k1.UnknownReason.CONFLICT, query_key, {"extra": tuple(sorted(extra))})
    mismatched = [identity for identity, digest in expected.items() if actual[identity] != digest]
    if mismatched:
        return k1.Unknown(k1.UnknownReason.CONFLICT, query_key, {"digest_mismatch": tuple(sorted(mismatched))})
    return k1.Value(True, query_key, {"read_set": tuple(sorted(expected))})


def _verify_fixed_outputs(
    outputs: Sequence[k5.FixedRef],
    key: k1.ResultKey,
    read_results: Sequence[k1.Observed[bytes]],
) -> k1.Observed[tuple[k5.FixedRef, ...]]:
    # Owner boundary precondition: one real read observation per ordered ref.
    assert len(outputs) == len(read_results)
    for ref, read in zip(outputs, read_results):
        if not isinstance(read, k1.Value):
            return read
        actual_digest = k1._sha256_digest(read.value)
        if actual_digest != ref.digest:
            return k1.Unknown(k1.UnknownReason.CONFLICT, key, {"fixed_ref": ref.locator})
    return k1.Value(tuple(outputs), key, {"output_count": len(outputs)})


def _rebuild_inner(
    registry: Registry,
    stored_inner: k1.Combined[Any],
    entry: VerifierEntry,
    key: k1.ResultKey,
) -> k1.Observed[k1.Combined[Any]]:
    unregistered_evaluated = [item for item in registry.evaluated if item not in set(registry.registered)]
    if len(stored_inner.components) != len(registry.registered) + len(unregistered_evaluated):
        return k1.Unknown(k1.UnknownReason.CONFLICT, key, {"field": "evaluated_components"})
    components: list[Any] = []
    registered = set(registry.registered)
    evaluated = set(registry.evaluated)

    # Keep owner-declared registration order. Registered-but-unevaluated checks
    # are explicit K1 Unobserved components.
    for index, check_id in enumerate(registry.registered):
        mapping = entry.checks.get(check_id)
        if check_id in evaluated:
            observed = stored_inner.components[index]
            if isinstance(observed, k1.Value) and mapping is None:
                # K1 requires owner mapping resolution before combine; keep the
                # original component key and represent only that unavailable
                # mapping as the existing non-value.
                components.append(k1.Unknown(k1.UnknownReason.MISSING_INPUT, observed.key, {"check": check_id}))
            else:
                components.append((observed, mapping) if mapping is not None and isinstance(observed, k1.Value) else observed)
        else:
            missing = stored_inner.components[index]
            if not isinstance(missing, k1.Unobserved) or missing.why != k1.UnobservedWhy.NOT_RUN:
                return k1.Unknown(k1.UnknownReason.CONFLICT, key, {"field": "unevaluated_component", "check": check_id})
            components.append(missing)

    # Preserve evaluated results whose check is not in the owner declaration,
    # but do not let an unregistered Value become a positive K1 component.
    for offset, check_id in enumerate(unregistered_evaluated, start=len(registry.registered)):
        if check_id not in registered:
            observed = stored_inner.components[offset]
            observed_key = observed.current_key if isinstance(observed, k1.Stale) else getattr(observed, "key", key)
            components.append(k1.Unknown(k1.UnknownReason.UNREGISTERED, observed_key, {"check": check_id}))

    rebuilt = k1.combine(components)
    if isinstance(rebuilt, k1.Rejected):
        return rebuilt
    if rebuilt != stored_inner:
        return k1.Unknown(k1.UnknownReason.CONFLICT, key, {"field": "inner"})
    if not registry.registered:
        # K1 combine already retains its existing set_reason diagnostic.
        return k1.Value(rebuilt, key, {"registered_count": 0})
    return k1.Value(rebuilt, key, {"registered_count": len(registry.registered)})


def _admit_receipt_with_owner_observations(
    record: k1.ResultRecord[Any],
    query_key: k1.ResultKey,
    verifier_set: k1.SubjectRef,
    current_set: k1.Value[VerifierSet],
    fixed_output_reads: Sequence[k1.Observed[bytes]],
) -> k1.Observed[AdmittedReceipt]:
    """Pure admission helper over explicit K4 and FixedRef observations.

    This is not the public K6 API: production owner resolution is unconnected,
    so no public wrapper creates an observation from that absence.
    """
    if not isinstance(record.result, k1.Value):
        return record.result
    body = record.result.value
    # ReceiptBody and K1 ResultRecord are typed API inputs. A malformed
    # runtime shape is outside this contract rather than a new K6 reason.
    assert isinstance(body, ReceiptBody)
    if record.result.key != record.key:
        return k1.Unknown(k1.UnknownReason.CONFLICT, query_key, {"field": "record_result_key"})
    if current_set.value.ref != verifier_set:
        return k1.Unknown(k1.UnknownReason.CONFLICT, query_key, {"field": "verifier_set_ref"})

    digest = _validate_record_digest(record, query_key)
    if not isinstance(digest, k1.Value):
        return digest
    member = _match_verifier_entry(body.verifier, current_set.value, query_key)
    if not isinstance(member, k1.Value):
        return member
    for check in (
        lambda: _validate_receipt_key_body(record, query_key, body),
        lambda: _validate_read_set(body, query_key),
        lambda: _verify_fixed_outputs(body.execution.outputs, query_key, fixed_output_reads),
        lambda: _rebuild_inner(body.registry, body.inner, member.value, query_key),
    ):
        result = check()
        if not isinstance(result, k1.Value):
            return result

    admitted = AdmittedReceipt(
        body=body,
        reverifiable=member.value.deterministic,
        reproduction=k1.Unobserved(query_key, k1.UnobservedWhy.NOT_RUN),
        issuer_authenticity=k1.Unknown(k1.UnknownReason.UNSUPPORTED, query_key),
    )
    return k1.Value(admitted, query_key, {"admitted": True})


def _reverify_with_execution_observation(
    admitted: AdmittedReceipt,
    execution: k1.Observed[k1.Combined[Any]],
) -> k1.Observed[AdmittedReceipt]:
    key = admitted.body.key
    if not admitted.reverifiable:
        reproduction: Any = k1.Unknown(k1.UnknownReason.UNSUPPORTED, key)
    else:
        if isinstance(execution, k1.Value):
            expected = k1._sha256_digest(k1._canonical_json_bytes(k1._canonical_value(admitted.body.inner)))
            actual = k1._sha256_digest(k1._canonical_json_bytes(k1._canonical_value(execution.value)))
            reproduction = (
                k1.Value(True, key, {"inner_digest_equal": True})
                if actual == expected
                else k1.Unknown(k1.UnknownReason.CONFLICT, key, {"inner_digest_equal": False})
            )
        else:
            reproduction = execution
    result = AdmittedReceipt(
        admitted.body,
        admitted.reverifiable,
        reproduction,
        admitted.issuer_authenticity,
    )
    return k1.Value(result, key, {"reverified": admitted.reverifiable})


def _required_from_owner_observations(
    operation: str,
    base_key: k1.ResultKey,
    verifier_set: k1.SubjectRef,
    reverify: bool,
    current_set: k1.Value[VerifierSet],
    restored: k1.Observed[Sequence[k1.ResultRecord[Any]]],
    fixed_output_reads: Mapping[str, Sequence[k1.Observed[bytes]]],
    executions: Mapping[str, k1.Observed[k1.Combined[Any]]],
) -> RequiredResult:
    """Pure fold after adapters supplied actual typed owner observations."""
    snapshot = current_set.value
    required_ids = snapshot.required_for.get(operation, ())
    if not required_ids:
        empty = k1.combine([])
        assert isinstance(empty, k1.Combined)
        return RequiredResult(empty, {})

    components: list[Any] = []
    assurances: dict[str, Assurance] = {}
    if not isinstance(restored, k1.Value):
        components.extend(restored for _ in required_ids)
    else:
        for verifier_id in required_ids:
            entry = next((member for member in snapshot.members if member.ref.identity == verifier_id), None)
            if entry is None:
                components.append(k1.Unknown(k1.UnknownReason.UNREGISTERED, base_key, {"verifier": verifier_id}))
                continue
            query_key = _derive_receipt_key(base_key, entry.ref, verifier_set)
            assert isinstance(query_key, k1.ResultKey), "typed K6 key inputs must satisfy existing K2 key preconditions"
            observed = _lookup_receipt(restored.value, query_key)
            assert not isinstance(observed, k1.Rejected), "typed K6 query must satisfy existing K2 lookup preconditions"
            if not isinstance(observed, k1.Value):
                components.append(observed)
                continue
            source_record = _record_for_lookup(restored.value, query_key, observed)
            if not isinstance(source_record, k1.Value):
                components.append(source_record)
                continue
            admitted = _admit_receipt_with_owner_observations(
                source_record.value,
                query_key,
                verifier_set,
                current_set,
                fixed_output_reads[verifier_id],
            )
            if not isinstance(admitted, k1.Value):
                components.append(admitted)
                continue
            receipt = admitted.value
            if reverify:
                verified = _reverify_with_execution_observation(receipt, executions[verifier_id])
                if isinstance(verified, k1.Value):
                    receipt = verified.value
            assurance = Assurance(receipt.reverifiable, receipt.reproduction, receipt.issuer_authenticity)
            assurances[verifier_id] = assurance
            components.extend(_inner_components(receipt, entry, query_key))

    combined = k1.combine(components)
    assert isinstance(combined, k1.Combined)
    return RequiredResult(combined, assurances)


def _record_for_lookup(
    records: Sequence[k1.ResultRecord[Any]],
    key: k1.ResultKey,
    observed: k1.Value[Any],
) -> k1.Observed[k1.ResultRecord[Any]]:
    """Recover the source record from the exact K5-restored sequence.

    K2 lookup deliberately returns the stored observation, not its K5 wrapper.
    Admission still needs that wrapper's original digest and producer; never
    synthesize either from the lookup result.
    """
    for record in records:
        if record.key == key and record.result == observed:
            return k1.Value(record, key, {"source_record": "k5_restored"})
    return k1.Unknown(k1.UnknownReason.CONFLICT, key, {"field": "lookup_source_record"})


def _inner_components(
    receipt: AdmittedReceipt, entry: VerifierEntry, fallback_key: k1.ResultKey
) -> list[Any]:
    inner = receipt.body.inner
    result: list[Any] = []
    evaluated = set(receipt.body.registry.evaluated)
    registered = set(receipt.body.registry.registered)
    for index, check_id in enumerate(receipt.body.registry.registered):
        mapping = entry.checks.get(check_id)
        if check_id in evaluated:
            component = inner.components[index]
            if isinstance(component, k1.Value) and mapping is None:
                result.append(k1.Unknown(k1.UnknownReason.MISSING_INPUT, component.key, {"check": check_id}))
            else:
                result.append((component, mapping) if isinstance(component, k1.Value) and mapping is not None else component)
        else:
            component = inner.components[index]
            result.append(component)
    unregistered_evaluated = [item for item in receipt.body.registry.evaluated if item not in registered]
    for offset, check_id in enumerate(unregistered_evaluated, start=len(receipt.body.registry.registered)):
        if check_id not in registered:
            component = inner.components[offset]
            observed_key = component.current_key if isinstance(component, k1.Stale) else getattr(component, "key", fallback_key)
            result.append(k1.Unknown(k1.UnknownReason.UNREGISTERED, observed_key, {"check": check_id}))
    if inner.set_reason is not None:
        result.append(k1.Unknown(inner.set_reason.reason, fallback_key))
    return result
