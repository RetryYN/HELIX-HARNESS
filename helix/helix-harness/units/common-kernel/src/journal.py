"""K5 append-only journal semantics for the common-kernel unit.

This module keeps the K5 codec, prefix validation, reconstruction, projection,
and verification beside (and dependent on) the K1/K2 semantic core. Physical
store and authority effects are deliberately private adapter boundaries.
"""

from __future__ import annotations

from dataclasses import dataclass, fields, is_dataclass
from enum import Enum
import hashlib
import json
import unicodedata
from typing import Any, Callable, Iterable, Mapping, Sequence

from common_kernel import (
    Conflict,
    NoOp,
    NotApplicable,
    Rejected,
    ResultKey,
    ResultRecord,
    Stale,
    SubjectRef,
    Unknown,
    UnknownReason,
    Unobserved,
    UnobservedWhy,
    Value,
    lookup,
    record,
    _canonical_json_bytes,
    _canonical_value,
    _key_digest,
    _sha256_digest,
    key_of,
    _valid_digest,
)


# Candidate encoding version used by this draft. No owner registration has
# fixed this value yet; schema validation accepts only this local candidate.
SCHEMA_VERSION = "1"
_KNOWN_SCHEMA_VERSIONS = frozenset({SCHEMA_VERSION})


class _UnmappedAppendValidation:
    __slots__ = ()


_UNMAPPED_APPEND_VALIDATION = _UnmappedAppendValidation()


@dataclass(frozen=True)
class SegmentId:
    log_id: str
    writer: str
    segment_no: int


@dataclass(frozen=True)
class FixedRef:
    store: str
    locator: Any
    digest: str


@dataclass(frozen=True)
class LogDecl:
    log_id: str
    owner: Any
    store: str
    operations: tuple[str, ...]
    value_encodings: Mapping[str, Any]
    event_types: tuple[str, ...]
    manifest_writer: str


@dataclass(frozen=True)
class LogEntry:
    schema_version: str
    segment: SegmentId
    seq: int
    prev_digest: str
    event: Mapping[str, Any]
    entry_digest: str


@dataclass(frozen=True)
class SegmentHead:
    segment: SegmentId
    seq: int
    entry_digest: str


@dataclass(frozen=True)
class ScopeDecl:
    scope_id: str
    revision: str
    log_id: str
    manifest_head: SegmentHead
    segments: tuple[SegmentId, ...]


@dataclass(frozen=True)
class Projector:
    identity: str
    version: str
    digest: str


@dataclass(frozen=True)
class Projection:
    projector: Projector
    scope: ScopeDecl
    input_heads: tuple[SegmentHead, ...]
    output: Any
    output_digest: str


@dataclass(frozen=True)
class Checkpoint:
    projector: Projector
    scope: ScopeDecl
    input_heads: tuple[SegmentHead, ...]
    state: Any
    state_digest: str


@dataclass(frozen=True)
class Appended:
    head: SegmentHead


@dataclass(frozen=True)
class LedgerTarget:
    generation: Any
    immediate_check: Any
    recovery_diagnostics: Any


@dataclass(frozen=True)
class LedgerView:
    rows: Any
    release: Any
    target: LedgerTarget
    actual: Any


@dataclass(frozen=True)
class _Prefix:
    entries: tuple[LogEntry, ...]
    evidence: tuple[str, ...] = ()


@dataclass(frozen=True)
class _AppendContext:
    declaration: LogDecl
    manifest_segments: frozenset[SegmentId]
    restored_records: tuple[Mapping[str, Any], ...]
    peers_readable: bool
    effect_ready: bool
    manifest_segment: SegmentId | None = None


def _plain(value: Any) -> Any:
    if isinstance(value, Enum):
        return value.value
    if is_dataclass(value):
        return {field.name: _plain(getattr(value, field.name)) for field in fields(value)}
    if isinstance(value, Mapping):
        return {str(key): _plain(item) for key, item in value.items()}
    if isinstance(value, (tuple, list)):
        return [_plain(item) for item in value]
    return value


def _segment_identity(segment: SegmentId) -> str:
    return _canonical_json_bytes([segment.log_id, segment.writer, segment.segment_no]).decode("utf-8")


def _observation_key(operation: str, subject: SubjectRef, inputs: Sequence[SubjectRef], scope: str) -> ResultKey | Rejected:
    """Build a complete internal K5 observation key from declared inputs."""
    return key_of(operation, SCHEMA_VERSION, subject, tuple(inputs), scope)


def _key_for_read(segment: SegmentId, head: SegmentHead) -> ResultKey:
    digest = head.entry_digest if head.entry_digest.startswith("sha256:") else _sha256_digest(b"genesis")
    subject = SubjectRef("log_segment", _segment_identity(segment), str(head.seq), digest)
    return _observation_key("k5.read", subject, (), segment.log_id)


def _head_ref(head: SegmentHead) -> SubjectRef:
    digest = head.entry_digest if head.entry_digest.startswith("sha256:") else _sha256_digest(b"genesis")
    return SubjectRef("log_segment", _segment_identity(head.segment), str(head.seq), digest)


def _unique_heads(heads: Sequence[SegmentHead]) -> tuple[SegmentHead, ...]:
    """Remove only byte-for-byte equal head refs; retain same-identity variants."""
    return tuple(dict.fromkeys(heads))


def _key_for_restore(log: LogDecl, scope: ScopeDecl, heads: Sequence[SegmentHead]) -> ResultKey | Rejected:
    manifest = scope.manifest_head
    subject = SubjectRef("log", log.log_id, scope.revision, _sha256_digest(_canonical_json_bytes(_plain(log))))
    refs = [_head_ref(manifest)]
    refs.extend(_head_ref(h) for h in _scope_input_heads(scope, heads) if h != manifest)
    return _observation_key("k5.restore", subject, refs, _scope_identity(scope))


def _scope_input_heads(scope: ScopeDecl, heads: Sequence[SegmentHead]) -> tuple[SegmentHead, ...]:
    allowed = set(scope.segments) | {scope.manifest_head.segment}
    if any(head.segment not in allowed for head in heads):
        # No K5 result mapping is fixed for caller-supplied heads outside the
        # declared scope. Never erase them and return a successful projection.
        raise NotImplementedError("scope-out input-head mapping is not defined")
    return _unique_heads(tuple(heads))


def _scope_identity(scope: ScopeDecl) -> str:
    return _canonical_json_bytes([scope.scope_id, scope.revision]).decode("utf-8")


def _entry_body(entry: LogEntry | Mapping[str, Any]) -> dict[str, Any]:
    raw = _plain(entry)
    return {name: raw[name] for name in ("schema_version", "segment", "seq", "prev_digest", "event")}


def _entry_digest(entry: LogEntry | Mapping[str, Any]) -> str:
    return _sha256_digest(_canonical_json_bytes(_entry_body(entry)))


def _entry_to_dict(entry: LogEntry) -> dict[str, Any]:
    raw = _plain(entry)
    return raw


def _decode_segment(value: Any) -> SegmentId:
    if isinstance(value, SegmentId):
        return value
    if isinstance(value, Mapping):
        return SegmentId(value["log_id"], value["writer"], value["segment_no"])
    raise ValueError("invalid segment")


def _decode_entry(value: Mapping[str, Any]) -> LogEntry:
    return LogEntry(
        schema_version=value["schema_version"],
        segment=_decode_segment(value["segment"]),
        seq=value["seq"],
        prev_digest=value["prev_digest"],
        event=value["event"],
        entry_digest=value["entry_digest"],
    )


def _make_entry(segment: SegmentId, seq: int, prev_digest: str, event: Mapping[str, Any]) -> LogEntry:
    draft = LogEntry(SCHEMA_VERSION, segment, seq, prev_digest, dict(event), "")
    return LogEntry(SCHEMA_VERSION, segment, seq, prev_digest, dict(event), _entry_digest(draft))


def _encode_entry(entry: LogEntry) -> bytes:
    return _canonical_json_bytes(_entry_to_dict(entry)) + b"\n"


def _validate_segment_prefix(raw: bytes, segment: SegmentId, head: SegmentHead) -> _Prefix:
    """Validate only the immutable prefix named by head; evidence uses L4 (a)-(h)."""
    evidence: list[str] = []
    if not isinstance(raw, bytes) or type(head.seq) is not int or head.seq < 0:
        return _Prefix((), ("(a)",))
    if head.segment != segment:
        # The supplied fixed head names a different segment, so its requested
        # seq/digest is absent from the segment being read (K5-I3(g)).
        evidence.append("(g)")
    lines = raw.splitlines(keepends=True)
    if head.seq == 0:
        if head.entry_digest != "genesis":
            evidence.append("(g)")
        return _Prefix((), tuple(evidence))
    parsed: list[LogEntry] = []
    decoded_lines: list[bytes] = []
    # Parse all available lines up to the fixed head. Bytes after the requested
    # head are intentionally outside this observation.
    for line in lines[: head.seq]:
        decoded_lines.append(line)
        try:
            item = json.loads(line.decode("utf-8", errors="strict"))
            entry = _decode_entry(item)
        except (UnicodeDecodeError, json.JSONDecodeError, KeyError, TypeError, ValueError, OverflowError, RecursionError):
            evidence.append("(a)")
            continue
        if (
            not isinstance(entry.segment, SegmentId)
            or not isinstance(entry.segment.log_id, str)
            or not isinstance(entry.segment.writer, str)
            or type(entry.segment.segment_no) is not int
            or entry.segment.segment_no < 0
            or type(entry.seq) is not int
            or entry.seq < 0
        ):
            evidence.append("(a)")
            continue
        parsed.append(entry)
        if not _event_shape_valid(entry.event):
            evidence.append("event_shape")
        if not isinstance(entry.schema_version, str) or entry.schema_version not in _KNOWN_SCHEMA_VERSIONS:
            evidence.append("(b)")
        try:
            canonical_line = _canonical_json_bytes(_entry_to_dict(entry)) + b"\n"
        except (TypeError, ValueError, OverflowError, RecursionError):
            evidence.append("(a)")
        else:
            if not line.endswith(b"\n") or line != canonical_line:
                evidence.append("(h)")
    if len(lines) < head.seq:
        evidence.append("(g)")
    seqs = [entry.seq for entry in parsed]
    if len(seqs) != len(set(seqs)):
        evidence.append("(d)")
    if len(parsed) == head.seq and len(seqs) == len(set(seqs)) and seqs != list(range(1, head.seq + 1)):
        evidence.append("(c)")
    for index, entry in enumerate(parsed):
        if entry.segment != segment:
            evidence.append("(h)")
        if entry.seq == 1:
            expected_prev = "genesis"
        elif index > 0 and parsed[index - 1].seq == entry.seq - 1:
            expected_prev = parsed[index - 1].entry_digest
        else:
            expected_prev = None
        if expected_prev is not None:
            if entry.prev_digest != expected_prev:
                evidence.append("(e)")
        try:
            if entry.entry_digest != _entry_digest(entry):
                evidence.append("(f)")
        except (TypeError, ValueError, OverflowError, RecursionError):
            evidence.append("(a)")
    matching = [entry for entry in parsed if entry.seq == head.seq]
    if not matching or matching[-1].entry_digest != head.entry_digest:
        evidence.append("(g)")
    ordered = tuple(sorted(set(evidence)))
    return _Prefix(tuple(parsed) if not ordered else (), ordered)


def _unknown(key: ResultKey, evidence: Any) -> Unknown:
    return Unknown(UnknownReason.UNREADABLE, key, evidence)


K5Observed = Value | Unknown | Unobserved


def _read_bytes(segment: SegmentId) -> bytes | Unknown | Unobserved:
    """Private store-reader seam. Production binding belongs to the store owner."""
    return Unobserved(_key_for_read(segment, SegmentHead(segment, 0, "genesis")), UnobservedWhy.NOT_RUN)


def read(segment: SegmentId, head: SegmentHead) -> K5Observed:
    """Observe and validate the immutable prefix named by ``head``."""
    key = _key_for_read(segment, head)
    observed = _read_bytes(segment)
    if isinstance(observed, (Unknown, Unobserved)):
        return observed
    prefix = _validate_segment_prefix(observed, segment, head)
    if prefix.evidence:
        return _unknown(key, prefix.evidence)
    return Value(list(prefix.entries), key, {"segment": segment, "head": head})


def current_head(segment: SegmentId) -> K5Observed:
    """Observe the physical stream and return its fully validated current tail."""
    raw = _read_bytes(segment)
    key = _key_for_read(segment, SegmentHead(segment, 0, "genesis"))
    if isinstance(raw, (Unknown, Unobserved)):
        return raw
    lines = raw.splitlines(keepends=True)
    if not lines:
        return Value(SegmentHead(segment, 0, "genesis"), key, {"entries": 0})
    # The tail is discovered from the complete bytes, then the full prefix is
    # validated before the observed head is returned.
    try:
        tail = _decode_entry(json.loads(lines[-1].decode("utf-8")))
    except (UnicodeDecodeError, json.JSONDecodeError, KeyError, TypeError, ValueError, OverflowError, RecursionError):
        return _unknown(key, ("(a)",))
    head = SegmentHead(segment, tail.seq, tail.entry_digest)
    prefix = _validate_segment_prefix(raw, segment, head)
    evidence = set(prefix.evidence)
    if len(lines) != head.seq:
        # current_head observes the actual complete stream, unlike read()'s
        # intentionally fixed prefix. Revalidate through the physical line
        # count so a seq=0 tail or an extra/duplicate tail cannot look empty or
        # make current_head accept a valid earlier prefix.
        complete = _validate_segment_prefix(raw, segment, SegmentHead(segment, len(lines), head.entry_digest))
        evidence.update(complete.evidence)
    if evidence:
        return _unknown(_key_for_read(segment, head), tuple(sorted(evidence)))
    return Value(head, _key_for_read(segment, head), {"entries": len(prefix.entries)})


def _fixed_ref_bytes(ref: FixedRef) -> bytes | None:
    """Private FixedRef reader seam; no store or filesystem is opened here."""
    return None


def _result_body_shape_valid(body: Mapping[str, Any], decl: LogDecl) -> bool:
    """Check stored ResultBody structure without resolving any FixedRef bytes."""
    cls = body.get("class")
    if cls == "Value":
        for field_name in ("value", "evidence"):
            item = body.get(field_name)
            if not isinstance(item, Mapping):
                return False
            encoding = item.get("encoding")
            if encoding == "Inline":
                if (
                    "value" not in item
                    or not isinstance(item.get("type"), str)
                    or decl.value_encodings.get(item["type"]) != "inline"
                ):
                    return False
            elif encoding == "FixedRef":
                if (
                    not all(name in item for name in ("store", "locator", "digest"))
                    or item.get("store") != decl.store
                    or not _valid_digest(item.get("digest"))
                ):
                    return False
            else:
                return False
        return True
    if cls == "Unknown":
        try:
            UnknownReason(body["reason"])
        except (KeyError, TypeError, ValueError):
            return False
        return True
    if cls == "Unobserved":
        try:
            UnobservedWhy(body["why"])
        except (KeyError, TypeError, ValueError):
            return False
        superseded = body.get("superseded")
        return superseded is None or _valid_digest(superseded)
    if cls == "NotApplicable":
        return (
            all(name in body and body[name] is not None for name in ("reason", "authority", "reentry_trigger"))
            and isinstance(body["reason"], str)
            and isinstance(body["reentry_trigger"], str)
        )
    return False


_EVENT_VARIANTS = frozenset({"ResultRecorded", "ResultConflictDetected", "Correction", "SegmentOpened", "DeclaredEvent"})


def _event_shape_valid(event: Any) -> bool:
    """Validate the local Python Event-union encoding without owner policy."""
    try:
        if not isinstance(event, Mapping):
            return False
        kind = event.get("kind")
        if not isinstance(kind, str) or kind not in _EVENT_VARIANTS:
            return False
        if kind == "ResultRecorded":
            return (
                isinstance(event.get("key"), Mapping)
                and _valid_digest(event.get("key_digest"))
                and isinstance(event.get("result"), Mapping)
                and _valid_digest(event.get("result_digest"))
                and "producer" in event
            )
        if kind == "ResultConflictDetected":
            values = event.get("result_digests")
            return _valid_digest(event.get("key_digest")) and isinstance(values, (list, tuple)) and all(_valid_digest(x) for x in values)
        if kind == "Correction":
            replacement = event.get("replacement")
            return (
                _valid_digest(event.get("target"))
                and isinstance(event.get("reason"), str)
                and (replacement is None or _event_shape_valid(replacement))
                and (replacement is None or replacement.get("kind") == "DeclaredEvent")
            )
        if kind == "SegmentOpened":
            item = _decode_segment(event.get("segment"))
            return isinstance(item.log_id, str) and isinstance(item.writer, str) and type(item.segment_no) is int and item.segment_no >= 0
        if kind == "DeclaredEvent":
            return isinstance(event.get("event_type"), str) and bool(event.get("event_type")) and isinstance(event.get("refs"), Mapping)
        return False
    except (AttributeError, KeyError, TypeError, ValueError, OverflowError, RecursionError):
        return False


def _decode_result_body(body: Mapping[str, Any], decl: LogDecl) -> Mapping[str, Any] | None:
    if not _result_body_shape_valid(body, decl):
        return None
    cls = body.get("class")
    payload = dict(body)
    if cls == "Value":
        for field_name in ("value", "evidence"):
            item = payload.get(field_name)
            if not isinstance(item, Mapping):
                return None
            encoding = item.get("encoding")
            if encoding == "FixedRef":
                if not all(name in item for name in ("store", "locator", "digest")) or not _valid_digest(item.get("digest")):
                    return None
                ref = FixedRef(item["store"], item["locator"], item["digest"])
                raw = _fixed_ref_bytes(ref)
                if raw is None or _sha256_digest(raw) != ref.digest:
                    payload["class"] = "Unknown"
                    payload["reason"] = UnknownReason.UNREADABLE.value
                    payload["evidence"] = {"fixed_ref": _plain(ref)}
                    payload.pop("value", None)
                    break
                payload[field_name] = raw
            elif encoding == "Inline":
                value_type = item.get("type")
                if (
                    "value" not in item
                    or not isinstance(value_type, str)
                    or decl.value_encodings.get(value_type) != "inline"
                ):
                    return None
                payload[field_name] = item.get("value")
            else:
                return None
    return payload


def _observed_from_body(body: Mapping[str, Any], key: ResultKey):
    cls = body.get("class")
    if cls == "Value":
        if "value" not in body or "evidence" not in body:
            return None
        return Value(body.get("value"), key, body.get("evidence"))
    if cls == "Unknown":
        if "reason" not in body:
            return None
        try:
            reason = UnknownReason(body["reason"])
        except (KeyError, TypeError, ValueError):
            return None
        return Unknown(reason, key, body.get("evidence"))
    if cls == "Unobserved":
        if "why" not in body:
            return None
        try:
            why = UnobservedWhy(body["why"])
        except (KeyError, TypeError, ValueError):
            return None
        if body.get("superseded") is not None and not _valid_digest(body["superseded"]):
            return None
        return Unobserved(key, why, body.get("superseded"))
    if cls == "NotApplicable":
        if not all(name in body and body[name] is not None for name in ("reason", "authority", "reentry_trigger")):
            return None
        if not isinstance(body["reason"], str) or not isinstance(body["reentry_trigger"], str):
            return None
        return NotApplicable(body.get("reason"), body.get("authority"), body.get("reentry_trigger"), key)
    return None


def _record_from_event(event: Mapping[str, Any], decl: LogDecl) -> ResultRecord | None:
    """Decode a stored record only after K2 key_of accepts its full key."""
    key_data = event.get("key")
    if not isinstance(key_data, Mapping):
        return None
    # The persisted ResultKey is a closed five-field shape. Do not silently
    # discard an unknown top-level field before recomputing its digest.
    if set(key_data) != {"operation", "operation_version", "subject", "inputs", "scope"}:
        return None
    try:
        subject_data = key_data["subject"]
        input_data = key_data["inputs"]
        if not isinstance(subject_data, Mapping) or not isinstance(input_data, (list, tuple)):
            return None
        subject = SubjectRef(**subject_data)
        inputs = tuple(SubjectRef(**ref) for ref in input_data)
        validated_key = key_of(
            key_data.get("operation"),
            key_data.get("operation_version"),
            subject,
            inputs,
            key_data.get("scope"),
        )
    except (KeyError, TypeError, ValueError):
        return None
    if isinstance(validated_key, Rejected):
        return None
    key = validated_key
    if event.get("key_digest") != _key_digest(key):
        return None
    result_body = event.get("result", {})
    if not isinstance(result_body, Mapping) or event.get("result_digest") != _sha256_digest(_canonical_json_bytes(_plain(result_body))):
        return None
    body = _decode_result_body(result_body, decl)
    if body is None:
        return None
    result = _observed_from_body(body, key)
    if result is None:
        return None
    return ResultRecord(key, event.get("key_digest", _key_digest(key)), result, event.get("result_digest", ""), event.get("producer"))


def _read_scope(scope: ScopeDecl, input_heads: Sequence[SegmentHead]):
    declared_logs = {scope.log_id, scope.manifest_head.segment.log_id, *(segment.log_id for segment in scope.segments)}
    if len(declared_logs) != 1:
        raise NotImplementedError("K5 classification for mismatched scope/log identities is not defined")
    # Exact repeated refs denote one input. Different refs for one SegmentId
    # are left to K2's real duplicate-identity diagnostic; never choose one by
    # dictionary insertion order.
    unique_heads = _unique_heads(input_heads)
    scope_heads = _scope_input_heads(scope, unique_heads)
    scope_key = _scope_key(scope, scope_heads)
    if isinstance(scope_key, Rejected):
        raise NotImplementedError("K5 mapping for conflicting refs with one SegmentId is not defined")
    heads = {head.segment: head for head in scope_heads}
    if not scope.segments:
        return Unknown(UnknownReason.MISSING_INPUT, scope_key, {"scope_segments": "empty"})
    if heads.get(scope.manifest_head.segment) != scope.manifest_head:
        return Unknown(UnknownReason.MISSING_INPUT, scope_key, {"manifest_head": "missing"})
    manifest_obs = read(scope.manifest_head.segment, scope.manifest_head)
    if not isinstance(manifest_obs, Value):
        return manifest_obs
    opened = [entry.event.get("segment") for entry in manifest_obs.value if _variant(entry.event) == "SegmentOpened"]
    try:
        opened_segments = {_decode_segment(item) for item in opened}
    except (KeyError, TypeError, ValueError):
        return Unknown(UnknownReason.UNREADABLE, scope_key, {"manifest_event": "invalid_shape"})
    entries: list[LogEntry] = []
    if any(segment not in opened_segments for segment in scope.segments):
        return Unknown(UnknownReason.MISSING_INPUT, scope_key, {"unregistered_scope_segment": True})
    # The declared scope defines the read set. Exact duplicate refs are removed
    # above; scope-out caller heads were already stopped by _scope_input_heads.
    for segment in scope.segments:
        head = heads.get(segment)
        if head is None:
            return Unknown(UnknownReason.MISSING_INPUT, scope_key, {"missing_head": _plain(segment)})
        observed = read(segment, head)
        if not isinstance(observed, Value):
            return observed
        entries.extend(observed.value)
    return Value(_order_entries(entries), scope_key, {"manifest": manifest_obs.evidence})


def _scope_key(scope: ScopeDecl, heads: Sequence[SegmentHead]) -> ResultKey | Rejected:
    subject = SubjectRef("scope", scope.scope_id, scope.revision, _sha256_digest(_canonical_json_bytes(_plain(scope))))
    refs = [_head_ref(scope.manifest_head)]
    refs.extend(_head_ref(head) for head in _scope_input_heads(scope, heads) if head != scope.manifest_head)
    return _observation_key("k5.scope", subject, refs, _scope_identity(scope))


def _order_entries(entries: Sequence[LogEntry]) -> list[LogEntry]:
    return sorted(entries, key=lambda e: (unicodedata.normalize("NFC", e.segment.writer).encode("utf-8"), e.segment.segment_no, e.seq))


def _heads_key(head: SegmentHead):
    return (head.segment.log_id, unicodedata.normalize("NFC", head.segment.writer).encode("utf-8"), head.segment.segment_no)


def _variant(event: Mapping[str, Any]) -> str | None:
    if not isinstance(event, Mapping):
        return None
    value = event.get("kind")
    return value if isinstance(value, str) and value in _EVENT_VARIANTS else None


def restore(log: LogDecl, scope: ScopeDecl, input_heads: Sequence[SegmentHead]) -> K5Observed:
    """Restore all records in a declared scope after validating every prefix."""
    if log.log_id != scope.log_id:
        raise NotImplementedError("K5 classification for mismatched scope/log identities is not defined")
    key = _key_for_restore(log, scope, input_heads)
    if isinstance(key, Rejected):
        raise NotImplementedError("K5 mapping for conflicting refs with one SegmentId is not defined")
    restored = _read_scope(scope, input_heads)
    if not isinstance(restored, Value):
        return restored
    records: list[ResultRecord] = []
    for entry in restored.value:
        if _variant(entry.event) == "ResultRecorded":
            record_item = _record_from_event(entry.event, log)
            if record_item is None:
                return _unknown(key, ("result_body",))
            records.append(record_item)
    # L7 ordering is explicit and time independent; the K2 lookup consumes
    # this append-order sequence after the complete scope has been validated.
    return Value(records, key, {"entry_count": len(restored.value)})


def _build_projection_key(projector: Projector, scope: ScopeDecl, input_heads: Sequence[SegmentHead]) -> ResultKey | Rejected:
    subject = SubjectRef("projector", projector.identity, projector.version, projector.digest)
    manifest = scope.manifest_head
    refs = [_head_ref(manifest)]
    refs.extend(_head_ref(h) for h in _scope_input_heads(scope, input_heads) if h != manifest)
    key = key_of(projector.identity, projector.version, subject, refs, _scope_identity(scope))
    # Preserve K2's actual diagnostic. Retrying through another constructor
    # would mask duplicate identities and fabricate a usable observation key.
    return key


def _correction_projection(entries: Sequence[LogEntry], key: ResultKey) -> list[Mapping[str, Any]] | Unknown:
    declared: dict[str, Mapping[str, Any]] = {}
    corrections: dict[str, list[tuple[str, Mapping[str, Any]]]] = {}
    for entry in entries:
        event = entry.event
        if _variant(event) == "DeclaredEvent":
            declared[entry.entry_digest] = event
        elif _variant(event) == "Correction":
            corrections.setdefault(event.get("target"), []).append((entry.entry_digest, event))
    output: list[Mapping[str, Any]] = []
    for root_digest, original in declared.items():
        chain_seen: set[str] = set()
        current_target = root_digest
        current = original
        while True:
            branches = corrections.get(current_target, [])
            if not branches:
                if current is not None:
                    output.append(current)
                break
            if len(branches) != 1:
                return Unknown(UnknownReason.CONFLICT, key, {"correction_branch": current_target})
            marker, correction = branches[0]
            if marker in chain_seen:
                return Unknown(UnknownReason.CONFLICT, key, {"correction_cycle": current_target})
            chain_seen.add(marker)
            replacement = correction.get("replacement")
            current = replacement
            current_target = marker
    output.sort(key=_canonical_json_bytes)
    return output


def project(projector: Projector, scope: ScopeDecl, input_heads: Sequence[SegmentHead]) -> K5Observed:
    """Build a deterministic projection from the complete declared scope."""
    key = _build_projection_key(projector, scope, input_heads)
    if isinstance(key, Rejected):
        raise NotImplementedError("K5 mapping for conflicting refs with one SegmentId is not defined")
    observed = _read_scope(scope, input_heads)
    if not isinstance(observed, Value):
        return observed
    output = _correction_projection(observed.value, key)
    if isinstance(output, Unknown):
        return Unknown(output.reason, key, output.evidence)
    output_digest = _sha256_digest(_canonical_json_bytes(_plain(output)))
    projection = Projection(projector, scope, tuple(sorted(_scope_input_heads(scope, input_heads), key=_heads_key)), output, output_digest)
    return Value(projection, key, {"entry_count": len(observed.value)})


def _checkpoint_valid(projection: Projection, checkpoint: Checkpoint, rebuilt: Projection) -> bool:
    if checkpoint.scope != projection.scope or checkpoint.projector != projection.projector:
        return False
    if _sha256_digest(_canonical_json_bytes(_plain(checkpoint.state))) != checkpoint.state_digest:
        return False
    old = {_heads_key(head): head for head in checkpoint.input_heads}
    new = {_heads_key(head): head for head in projection.input_heads}
    if not old.keys() <= new.keys():
        return False
    for key, old_head in old.items():
        new_head = new[key]
        if new_head.seq < old_head.seq:
            return False
        if new_head.seq == old_head.seq and new_head.entry_digest != old_head.entry_digest:
            return False
        if new_head.seq > old_head.seq:
            extended_bytes = _read_bytes(new_head.segment)
            if not isinstance(extended_bytes, bytes):
                return False
            old_prefix = _validate_segment_prefix(extended_bytes, old_head.segment, old_head)
            if old_prefix.evidence:
                return False
    # The generic K5 fold is its own deterministic full rebuild; no domain
    # delta is inferred from checkpoint state.
    return checkpoint.state == rebuilt.output and checkpoint.state_digest == rebuilt.output_digest


def verify(projection: Projection, checkpoint: Checkpoint | None = None) -> K5Observed:
    """Rebuild and compare a saved projection and optional checkpoint."""
    key = _build_projection_key(projection.projector, projection.scope, projection.input_heads)
    if isinstance(key, Rejected):
        raise NotImplementedError("K5 mapping for conflicting refs with one SegmentId is not defined")
    if _sha256_digest(_canonical_json_bytes(_plain(projection.output))) != projection.output_digest:
        return Unknown(UnknownReason.CONFLICT, key, {"saved_output_digest": "mismatch"})
    rebuilt = project(projection.projector, projection.scope, projection.input_heads)
    if not isinstance(rebuilt, Value):
        return rebuilt
    if rebuilt.value.output_digest != projection.output_digest or rebuilt.value.output != projection.output:
        return Unknown(UnknownReason.CONFLICT, key, {"rebuild": "mismatch"})
    if checkpoint is not None and not _checkpoint_valid(projection, checkpoint, rebuilt.value):
        return Unknown(UnknownReason.CONFLICT, key, {"checkpoint": "mismatch"})
    return Value(projection, key, {"verified": True})


def _project_ledger_view(
    projector: Projector,
    scope: ScopeDecl,
    input_heads: Sequence[SegmentHead],
    *,
    rows: Any,
    release: Any,
    generation: Any,
    immediate_check: Any,
    recovery_diagnostics: Any,
    actual: Any,
):
    """Purely assemble already-observed LedgerView fields under a K5 key.

    This does not resolve owner declarations or read any of the four source
    logs. Each field is carried verbatim, including its own non-Value result.
    """
    key = _build_projection_key(projector, scope, input_heads)
    if isinstance(key, Rejected):
        return key
    view = LedgerView(
        rows=rows,
        release=release,
        target=LedgerTarget(generation, immediate_check, recovery_diagnostics),
        actual=actual,
    )
    return Value(view, key, {"field_count": 4})


def _append_bytes(segment: SegmentId, data: bytes) -> SegmentHead | None:
    """Private append seam. No physical writer is included in this module."""
    return None


def _append_with_context(segment: SegmentId, event: Mapping[str, Any], writer: str, context: _AppendContext):
    """Private preflight/adapter handoff used by the owner-bound public API."""
    if not context.effect_ready:
        # K3/K7 observations are owned by their existing adapters. This seam
        # refuses the effect without inventing a K5 authority result/reason.
        return None
    issue = _event_valid(
        event, context.declaration, segment, writer, set(context.manifest_segments),
        context.restored_records, manifest_segment=context.manifest_segment,
    )
    if issue == "stale_not_recordable":
        return Rejected("stale_not_recordable")
    if not context.peers_readable:
        if _variant(event) == "ResultRecorded":
            # K5-I5 fixes this reason for unreadable ResultRecorded peers only.
            return Rejected("peer_unreadable")
        raise NotImplementedError("peer-read failure mapping for this event kind is not defined")
    if issue is _UNMAPPED_APPEND_VALIDATION:
        raise NotImplementedError("K5 append rejection mapping for this validation condition is not defined")
    if issue == "noop":
        return NoOp(next(item for item in context.restored_records if item.get("key_digest") == event.get("key_digest") and item.get("result_digest") == event.get("result_digest")))
    if issue == "conflict":
        return Conflict(tuple(item for item in context.restored_records if item.get("key_digest") == event.get("key_digest")))
    if issue is not None:
        return Rejected(issue)
    raw = _read_bytes(segment)
    if not isinstance(raw, bytes):
        return None
    current = current_head(segment)
    if not isinstance(current, Value):
        return None
    next_entry = _make_entry(segment, current.value.seq + 1, current.value.entry_digest if current.value.seq else "genesis", event)
    appended = _append_bytes(segment, _encode_entry(next_entry))
    return Appended(appended) if isinstance(appended, SegmentHead) else appended


def _event_valid(
    event: Mapping[str, Any],
    decl: LogDecl,
    segment: SegmentId,
    writer: str,
    manifest: set[SegmentId],
    records: Sequence[Mapping[str, Any]],
    *,
    manifest_segment: SegmentId | None = None,
) -> str | _UnmappedAppendValidation | None:
    try:
        return _event_valid_impl(event, decl, segment, writer, manifest, records, manifest_segment=manifest_segment)
    except (AttributeError, KeyError, TypeError, ValueError, OverflowError, RecursionError):
        # Canonicalization and malformed nested data have no general K5
        # rejection reason in the fixed L4/L5 contract.
        return _UNMAPPED_APPEND_VALIDATION


def _event_valid_impl(
    event: Mapping[str, Any],
    decl: LogDecl,
    segment: SegmentId,
    writer: str,
    manifest: set[SegmentId],
    records: Sequence[Mapping[str, Any]],
    *,
    manifest_segment: SegmentId | None = None,
) -> str | _UnmappedAppendValidation | None:
    if not isinstance(event, Mapping):
        return _UNMAPPED_APPEND_VALIDATION
    kind = _variant(event)
    if kind == "ResultRecorded" and isinstance(event.get("result"), Mapping) and event["result"].get("class") == "Stale":
        return "stale_not_recordable"
    if kind == "ResultRecorded" and "key" not in event:
        return "missing_key"
    if kind == "ResultRecorded" and isinstance(event.get("key"), Mapping):
        key_data = event["key"]
        required_key_fields = {"operation", "operation_version", "subject", "inputs", "scope"}
        required_subject_fields = {"kind", "identity", "revision", "digest"}
        if not required_key_fields.issubset(key_data):
            return "missing_key"
        subject_data = key_data.get("subject")
        if isinstance(subject_data, Mapping) and not required_subject_fields.issubset(subject_data):
            return "missing_key"
        input_data = key_data.get("inputs")
        if isinstance(input_data, (list, tuple)) and any(
            isinstance(item, Mapping) and not required_subject_fields.issubset(item)
            for item in input_data
        ):
            return "missing_key"
    if kind is None or not _event_shape_valid(event):
        return _UNMAPPED_APPEND_VALIDATION
    if writer != segment.writer or segment not in manifest:
        return _UNMAPPED_APPEND_VALIDATION
    if kind == "SegmentOpened":
        try:
            opened = _decode_segment(event.get("segment"))
        except (KeyError, TypeError, ValueError):
            return _UNMAPPED_APPEND_VALIDATION
        if (
            manifest_segment is None
            or segment != manifest_segment
            or writer != decl.manifest_writer
            or segment.writer != decl.manifest_writer
            or opened.log_id != decl.log_id
        ):
            return _UNMAPPED_APPEND_VALIDATION
    elif kind == "DeclaredEvent":
        if event.get("event_type") not in decl.event_types:
            return _UNMAPPED_APPEND_VALIDATION
    elif kind == "ResultRecorded":
        key = event.get("key", {})
        try:
            decoded_key = _decode_key(key)
        except (KeyError, TypeError, ValueError):
            return _UNMAPPED_APPEND_VALIDATION
        try:
            validated_key = key_of(
                decoded_key.operation,
                decoded_key.operation_version,
                decoded_key.subject,
                decoded_key.inputs,
                decoded_key.scope,
            )
        except (TypeError, ValueError):
            return _UNMAPPED_APPEND_VALIDATION
        if isinstance(validated_key, Rejected):
            if validated_key.reason == "missing_key":
                return "missing_key"
            # K2 has a precise rejection here, but L5/L8 do not define the
            # corresponding K5 append reason. Stop locally without exposing a
            # K2-only reason through the K5 boundary.
            return _UNMAPPED_APPEND_VALIDATION
        if event.get("key_digest") != _key_digest(decoded_key):
            return _UNMAPPED_APPEND_VALIDATION
        body = event.get("result", {})
        if not isinstance(body, Mapping):
            return _UNMAPPED_APPEND_VALIDATION
        if event.get("result_digest") != _sha256_digest(_canonical_json_bytes(_plain(body))):
            return _UNMAPPED_APPEND_VALIDATION
        if body.get("class") == "NotApplicable" and not all(body.get(name) is not None for name in ("reason", "authority", "reentry_trigger")):
            return _UNMAPPED_APPEND_VALIDATION
        if (
            body.get("class") == "Value"
            and any(
                isinstance(body.get(field_name), Mapping)
                and body[field_name].get("encoding") == "Inline"
                and isinstance(body[field_name].get("type"), str)
                and body[field_name].get("type") not in decl.value_encodings
                for field_name in ("value", "evidence")
            )
        ):
            return _UNMAPPED_APPEND_VALIDATION
        if not _result_body_shape_valid(body, decl):
            # The append API's outer Rejected reason for these additional
            # malformed ResultBody shapes is not fixed by the current oracle.
            return _UNMAPPED_APPEND_VALIDATION
        if decoded_key.operation not in decl.operations:
            return _UNMAPPED_APPEND_VALIDATION
        digests = [record.get("result_digest") for record in records if record.get("key_digest") == event.get("key_digest")]
        if digests:
            if event.get("result_digest") in digests:
                return "noop"
            return "conflict"
    elif kind == "ResultConflictDetected":
        digests = event.get("result_digests", [])
        if len(digests) < 2 or len(set(digests)) != len(digests) or not all(any(item.get("key_digest") == event.get("key_digest") and item.get("result_digest") == digest for item in records) for digest in digests):
            return _UNMAPPED_APPEND_VALIDATION
    elif kind == "Correction":
        replacement = event.get("replacement")
        if replacement is not None and (not _event_shape_valid(replacement) or _variant(replacement) != "DeclaredEvent"):
            return _UNMAPPED_APPEND_VALIDATION
        target = event.get("target")
        allowed = {item.get("entry_digest") for item in records if _variant(item.get("event", {})) == "DeclaredEvent"}
        changed = True
        while changed:
            changed = False
            for item in records:
                if _variant(item.get("event", {})) == "Correction" and item.get("event", {}).get("target") in allowed and item.get("entry_digest") not in allowed:
                    allowed.add(item.get("entry_digest"))
                    changed = True
        if target not in allowed:
            return _UNMAPPED_APPEND_VALIDATION
    elif kind not in {"SegmentOpened", "DeclaredEvent", "ResultRecorded", "ResultConflictDetected", "Correction"}:
        return _UNMAPPED_APPEND_VALIDATION
    return None


def _recorded_preflight(key_digest: str, result_digest: str, records: Sequence[Mapping[str, Any]], all_peers_readable: bool):
    if not all_peers_readable:
        return Rejected("peer_unreadable")
    previous = [item for item in records if item.get("key_digest") == key_digest]
    if not previous:
        return None
    if any(item.get("result_digest") == result_digest for item in previous):
        return NoOp(previous[0])
    return Conflict(tuple(previous))


def _decode_key(data: Mapping[str, Any]) -> ResultKey:
    return ResultKey(data["operation"], data["operation_version"], SubjectRef(**data["subject"]), tuple(SubjectRef(**x) for x in data["inputs"]), data["scope"])


__all__ = [
    "Appended", "Checkpoint", "FixedRef", "LedgerTarget", "LedgerView", "LogDecl", "LogEntry", "Projection",
    "Projector", "ScopeDecl", "SegmentHead", "SegmentId", "current_head",
    "project", "read", "restore", "verify",
]
