"""K5 formal fixtures. All bytes/store observations are synthetic and local."""
from __future__ import annotations

from dataclasses import replace
from copy import deepcopy
from pathlib import Path
import sys
import unicodedata
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import journal as k5  # noqa: E402
from common_kernel import (  # noqa: E402
    Conflict, NoOp, NotApplicable, Rejected, ResultKey, ResultRecord, Stale,
    SubjectRef, Unknown, UnknownReason, Unobserved, UnobservedWhy, Value,
    _canonical_json_bytes, _key_digest, _sha256_digest, key_of, lookup, record,
)

D1 = "sha256:" + "1" * 64
D2 = "sha256:" + "2" * 64
D3 = "sha256:" + "3" * 64


def _segment(writer="w", number=1, log="log"):
    return k5.SegmentId(log, writer, number)


def _decl(log="log", operations=("op",), event_types=("open",), manifest_writer="manifest"):
    return k5.LogDecl(log, "owner", "repository", tuple(operations), {"bool": "inline", "dict": "inline"}, tuple(event_types), manifest_writer)


def _key(revision="r1", digest=D1, scope="s"):
    result = key_of("op", "1", SubjectRef("kind", "identity", revision, digest), (), scope)
    assert isinstance(result, ResultKey)
    return result


def _declared(label="x"):
    return {"kind": "DeclaredEvent", "event_type": "open", "refs": {"label": label}}


def _entry(seg, seq, prev, event, *, schema=k5.SCHEMA_VERSION):
    return k5._make_entry(seg, seq, prev, event) if schema == k5.SCHEMA_VERSION else _custom_entry(seg, seq, prev, event, schema)


def _custom_entry(seg, seq, prev, event, schema=k5.SCHEMA_VERSION):
    draft = {"schema_version": schema, "segment": seg, "seq": seq, "prev_digest": prev, "event": event}
    return k5.LogEntry(schema, seg, seq, prev, event, _sha256_digest(_canonical_json_bytes(k5._plain(draft))))


def _chain(seg, events):
    result, prev = [], "genesis"
    for idx, event in enumerate(events, 1):
        item = _entry(seg, idx, prev, event)
        result.append(item)
        prev = item.entry_digest
    return result


def _bytes(entries):
    return b"".join(k5._encode_entry(item) for item in entries)


def _head(entries):
    item = entries[-1]
    return k5.SegmentHead(item.segment, item.seq, item.entry_digest)


def _result_body(value=True):
    return {"class": "Value", "value": {"encoding": "Inline", "type": "bool", "value": value}, "evidence": {"encoding": "Inline", "type": "dict", "value": {}}}


def _recorded_event(key=None, body=None, *, key_digest=None, result_digest=None):
    key = key or _key()
    body = body or _result_body()
    return {
        "kind": "ResultRecorded", "key": k5._plain(key),
        "key_digest": key_digest or _key_digest(key), "result": body,
        "result_digest": result_digest or _sha256_digest(_canonical_json_bytes(body)),
        "producer": {"identity": "producer"},
    }


def _manifest_and_data(scope_segments=None):
    data_a, data_b = _segment("a", 2), _segment("b", 10)
    manifest = _segment("manifest", 0)
    scope_segments = tuple(scope_segments if scope_segments is not None else (data_a, data_b))
    opened = _chain(manifest, [{"kind": "SegmentOpened", "segment": k5._plain(s)} for s in (data_a, data_b)])
    mh, ah, bh = _head(opened), None, None
    ae = _chain(data_a, [_declared("a")]); be = _chain(data_b, [_declared("b")])
    ah, bh = _head(ae), _head(be)
    scope = k5.ScopeDecl("scope", "rev", "log", mh, scope_segments)
    return manifest, data_a, data_b, scope, opened, ae, be, mh, ah, bh


class K5Fixtures(unittest.TestCase):
    def test_ck_k5_ut_092_ledger_rows(self):
        manifest, a, b, scope, me, ae, be, mh, ah, bh = _manifest_and_data(( _segment("a", 2), ))
        projector = k5.Projector("ledger_view_candidate", "1", D1)
        heads = [mh, ah]
        rows = Value([{"identity": "unit", "version": "0.1.0", "declaration": {"encoding": "FixedRef", "digest": D1}}], _key(), {"source": "registration-observation"})
        release = Unknown(UnknownReason.MISSING_INPUT, _key(), {"missing": "release-source"})
        generation = Unobserved(_key(), UnobservedWhy.NOT_RUN)
        immediate = Unknown(UnknownReason.UNREADABLE, _key(), {"source": "pointer-check"})
        recovery = Value([], _key(), {"source": "recovery-log"})
        actual = NotApplicable("outside_scope", "existing_owner", "reentry", _key())
        view = k5._project_ledger_view(
            projector, scope, heads, rows=rows, release=release,
            generation=generation, immediate_check=immediate,
            recovery_diagnostics=recovery, actual=actual,
        )
        self.assertIsInstance(view, Value)
        self.assertIs(view.value.rows, rows)
        self.assertEqual(view.value.rows.value[0]["identity"], "unit")
        self.assertEqual(view.value.rows.value[0]["declaration"]["digest"], D1)

    def test_ck_k5_ut_093_ledger_fields(self):
        manifest, a, b, scope, me, ae, be, mh, ah, bh = _manifest_and_data(( _segment("a", 2), ))
        projector = k5.Projector("ledger_view_candidate", "1", D1)
        heads = [mh, ah]
        rows = Unknown(UnknownReason.UNREGISTERED, _key(), {"field": "rows"})
        release = Value([{"release_id": "r1"}], _key(), {"field": "release"})
        generation = Value({"generation": "g2"}, _key(), {"field": "target"})
        immediate = Unobserved(_key(), UnobservedWhy.NOT_RUN)
        recovery = Unknown(UnknownReason.MISSING_INPUT, _key(), {"field": "recovery"})
        actual = Value([{"run": "observed"}], _key(), {"field": "actual"})
        result = k5._project_ledger_view(
            projector, scope, heads, rows=rows, release=release,
            generation=generation, immediate_check=immediate,
            recovery_diagnostics=recovery, actual=actual,
        )
        self.assertIsInstance(result, Value)
        self.assertIs(result.value.rows, rows)
        self.assertIs(result.value.release, release)
        self.assertIs(result.value.target.generation, generation)
        self.assertIs(result.value.target.immediate_check, immediate)
        self.assertIs(result.value.target.recovery_diagnostics, recovery)
        self.assertIs(result.value.actual, actual)

    def test_ck_k5_ut_094_head_refs(self):
        manifest, a, b, scope, _, _, _, mh, ah, bh = _manifest_and_data()
        projector = k5.Projector("p", "1", D1)
        base = k5._build_projection_key(projector, scope, [mh, ah, bh])
        repeated = k5._build_projection_key(projector, scope, [mh, ah, bh, ah])
        self.assertEqual(repeated, base)
        aliased = replace(ah, seq=2, entry_digest=D2)
        rejected = k5._build_projection_key(projector, scope, [mh, ah, aliased, bh])
        self.assertIsInstance(rejected, Rejected)
        self.assertEqual(rejected.reason, "duplicate_identity")
        with patch.object(k5, "_read_bytes", side_effect=AssertionError("key conflict must stop before reading")):
            with self.assertRaisesRegex(NotImplementedError, "not defined"):
                k5.project(projector, scope, [mh, ah, aliased, bh])

    def test_ck_k5_ut_095_current_head_rejects_seq_zero_tail(self):
        seg = _segment()
        # A physically present canonical row cannot declare itself to be the
        # empty genesis head. This isolates the malformed seq=0 tail case.
        body = {
            "schema_version": k5.SCHEMA_VERSION,
            "segment": k5._plain(seg),
            "seq": 0,
            "prev_digest": "genesis",
            "event": _declared("zero"),
            "entry_digest": "genesis",
        }
        raw = _canonical_json_bytes(body) + b"\n"
        with patch.object(k5, "_read_bytes", return_value=raw):
            result = k5.current_head(seg)
        self.assertIsInstance(result, Unknown)
        self.assertEqual(result.reason, UnknownReason.UNREADABLE)
        self.assertIn("(c)", result.evidence)

    def test_ck_k5_ut_096_current_head_rejects_duplicate_tail_seq(self):
        seg = _segment()
        first = _entry(seg, 1, "genesis", _declared("first"))
        second = _entry(seg, 1, first.entry_digest, _declared("second"))
        with patch.object(k5, "_read_bytes", return_value=_bytes([first, second])):
            result = k5.current_head(seg)
        self.assertIsInstance(result, Unknown)
        self.assertEqual(result.reason, UnknownReason.UNREADABLE)
        self.assertIn("(d)", result.evidence)
        self.assertIn("(g)", result.evidence)

    def test_ck_k5_ut_097_read_rejects_foreign_genesis_head(self):
        seg = _segment("requested")
        foreign = k5.SegmentHead(_segment("foreign"), 0, "genesis")
        with patch.object(k5, "_read_bytes", return_value=b""):
            result = k5.read(seg, foreign)
        self.assertIsInstance(result, Unknown)
        self.assertEqual(result.reason, UnknownReason.UNREADABLE)
        self.assertEqual(result.evidence, ("(g)",))

    def test_ck_k5_ut_098_restore_rejects_malformed_result_body(self):
        mutations = []
        for field in ("reason",):
            mutations.extend(((f"unknown-missing-{field}", lambda body, f=field: body.pop(f)),
                              (f"unknown-null-{field}", lambda body, f=field: body.__setitem__(f, None)),
                              (f"unknown-invalid-{field}", lambda body, f=field: body.__setitem__(f, "not-a-reason"))))
        mutations.extend((("unknown-missing-class-field", lambda body: body.pop("reason")),))
        mutations.extend((("unobserved-missing-why", lambda body: body.pop("why")),
                          ("unobserved-null-why", lambda body: body.__setitem__("why", None)),
                          ("unobserved-invalid-why", lambda body: body.__setitem__("why", "later"))))
        for field in ("reason", "authority", "reentry_trigger"):
            mutations.append((f"not-applicable-missing-{field}", lambda body, f=field: body.pop(f)))
            mutations.append((f"not-applicable-null-{field}", lambda body, f=field: body.__setitem__(f, None)))
        for field in ("value", "evidence"):
            mutations.append((f"value-missing-{field}", lambda body, f=field: body.pop(f)))
            mutations.append((f"value-null-{field}", lambda body, f=field: body.__setitem__(f, None)))
        mutations.append(("value-unknown-encoding", lambda body: body["value"].__setitem__("encoding", "Other")))
        mutations.append(("value-undeclared-inline-type", lambda body: body["value"].__setitem__("type", "undeclared")))
        mutations.append(("value-nonstring-inline-type", lambda body: body["value"].__setitem__("type", [])))

        manifest, a, _, scope, me, _, _, mh, _, _ = _manifest_and_data((_segment("a", 2),))
        bases = {
            "Unknown": {"class": "Unknown", "reason": "unreadable", "evidence": {}},
            "Unobserved": {"class": "Unobserved", "why": "not_run"},
            "NotApplicable": {"class": "NotApplicable", "reason": "outside_scope", "authority": "owner", "reentry_trigger": "change"},
            "Value": _result_body(),
        }
        for label, mutate in mutations:
            base_name = "unknown" if label.startswith("unknown-") else "unobserved" if label.startswith("unobserved-") else "not-applicable" if label.startswith("not-applicable-") else "value"
            base = bases[{"unknown": "Unknown", "unobserved": "Unobserved", "not-applicable": "NotApplicable", "value": "Value"}[base_name]]
            body = deepcopy(base)
            mutate(body)
            entries = _chain(a, [_recorded_event(body=body)])
            head = _head(entries)
            blobs = {manifest: _bytes(me), a: _bytes(entries)}
            with self.subTest(malformed_result_body=label), patch.object(k5, "_read_bytes", side_effect=lambda seg, values=blobs: values.get(seg)):
                result = k5.restore(_decl(), scope, [mh, head])
                self.assertIsInstance(result, Unknown)
                self.assertEqual(result.reason, UnknownReason.UNREADABLE)
                self.assertEqual(result.evidence, ("result_body",))

    def test_ck_k5_ut_099_scope_log_mismatch_stops_unmapped_branch(self):
        manifest, a, b, scope, me, ae, be, mh, ah, bh = _manifest_and_data()
        heads = [mh, ah, bh]
        blobs = {manifest: _bytes(me), a: _bytes(ae), b: _bytes(be)}
        with patch.object(k5, "_read_bytes", side_effect=lambda seg: blobs.get(seg)):
            mismatched_scopes = (
                replace(scope, log_id="different-log"),
                replace(scope, manifest_head=replace(mh, segment=_segment("manifest", 0, "different-log"))),
                replace(scope, segments=(_segment("a", 2, "different-log"),)),
            )
            for candidate in mismatched_scopes:
                with self.subTest(scope_log=candidate.log_id, manifest_log=candidate.manifest_head.segment.log_id,
                                  segment_logs=tuple(segment.log_id for segment in candidate.segments)):
                    with self.assertRaisesRegex(NotImplementedError, "mismatched scope/log"):
                        k5.project(k5.Projector("p", "1", D1), candidate, heads)
            with self.assertRaisesRegex(NotImplementedError, "mismatched scope/log"):
                k5.restore(_decl(log="different-log"), scope, heads)

    def test_ck_k5_ut_100_restore_rejects_invalid_result_key(self):
        valid_key = key_of(
            "op", "1", SubjectRef("kind", "subject", "r1", D1),
            [SubjectRef("input", "one", "r1", D2)], "scope",
        )
        self.assertIsInstance(valid_key, ResultKey)
        base_event = _recorded_event(valid_key)
        mutations = []
        for field in ("operation", "operation_version", "subject", "inputs", "scope"):
            mutations.append((f"missing-result-key-{field}", lambda event, f=field: event["key"].pop(f)))
        for field in ("kind", "identity", "revision", "digest"):
            mutations.append((f"missing-subject-ref-{field}", lambda event, f=field: event["key"]["subject"].pop(f)))
        for field in ("kind", "identity", "revision", "digest"):
            mutations.append((f"missing-input-ref-{field}", lambda event, f=field: event["key"]["inputs"][0].pop(f)))
        mutations.append(("invalid-subject-digest", lambda event: event["key"]["subject"].__setitem__("digest", "bad")))
        mutations.append(("invalid-input-digest", lambda event: event["key"]["inputs"][0].__setitem__("digest", "bad")))
        mutations.append(("duplicate-input-identity", lambda event: event["key"]["inputs"].append({"kind": "input", "identity": "one", "revision": "r2", "digest": D3})))

        manifest, a, _, scope, me, _, _, mh, _, _ = _manifest_and_data((_segment("a", 2),))
        for label, mutate in mutations:
            event = deepcopy(base_event)
            mutate(event)
            entries = _chain(a, [event])
            blobs = {manifest: _bytes(me), a: _bytes(entries)}
            with self.subTest(invalid_result_key=label), patch.object(k5, "_read_bytes", side_effect=lambda seg, values=blobs: values.get(seg)):
                result = k5.restore(_decl(), scope, [mh, _head(entries)])
                self.assertIsInstance(result, Unknown)
                self.assertEqual(result.reason, UnknownReason.UNREADABLE)
                self.assertEqual(result.evidence, ("result_body",))

    def _read_case(self, n):
        seg = _segment()
        entries = _chain(seg, [_declared("a"), _declared("b"), _declared("c")])
        head = _head(entries)
        raw = _bytes(entries)
        if n == 1:
            changed = bytearray(raw); changed[10] ^= 1; raw = bytes(changed)
        elif n == 2:
            raw = _bytes(entries[:1] + entries[2:])
        elif n == 3:
            raw = _bytes([entries[0], entries[2], entries[1]])
        elif n == 4:
            raw = raw.replace(b'"label":"b"', b'"label":')
        elif n == 5:
            altered = [_custom_entry(seg, 1, "genesis", _declared("a")), _custom_entry(seg, 2, "sha256:" + "a" * 64, _declared("b"), schema="future"), _entry(seg, 3, "sha256:" + "b" * 64, _declared("c"))]
            # Make the changed-schema chain internally self-consistent.
            altered[1] = _custom_entry(seg, 2, altered[0].entry_digest, _declared("b"), schema="future")
            altered[2] = _entry(seg, 3, altered[1].entry_digest, _declared("c")); raw = _bytes(altered); head = _head(altered)
        elif n == 6:
            altered = [_entry(seg, 0, "genesis", _declared("a")), _entry(seg, 2, "sha256:" + "x" * 64, _declared("b")), _entry(seg, 3, "sha256:" + "y" * 64, _declared("c"))]
            altered[1] = _entry(seg, 2, altered[0].entry_digest, _declared("b")); altered[2] = _entry(seg, 3, altered[1].entry_digest, _declared("c")); raw = _bytes(altered); head = _head(altered)
        elif n == 7:
            altered = [_entry(seg, 1, "genesis", _declared("a")), _entry(seg, 2, "sha256:" + "x" * 64, _declared("b")), _entry(seg, 2, "sha256:" + "y" * 64, _declared("c")), _entry(seg, 4, "sha256:" + "z" * 64, _declared("d"))]
            for i in range(1, len(altered)):
                altered[i] = _entry(seg, altered[i].seq, altered[i-1].entry_digest, altered[i].event)
            raw = _bytes(altered); head = _head(altered)
        elif n == 8:
            altered = [_entry(seg, 1, "genesis", _declared("a")), _entry(seg, 2, D2, _declared("b")), _entry(seg, 3, "sha256:" + "x" * 64, _declared("c"))]
            altered[2] = _entry(seg, 3, altered[1].entry_digest, _declared("c")); raw = _bytes(altered); head = _head(altered)
        elif n == 9:
            altered = list(entries); changed_digest = D3
            altered[1] = replace(altered[1], entry_digest=changed_digest)
            altered[2] = _entry(seg, 3, changed_digest, altered[2].event)
            raw = _bytes(altered); head = _head(altered)
        elif n == 10:
            head = k5.SegmentHead(seg, 4, D3)
        elif n == 11:
            other = _chain(seg, [_declared("a"), _declared("b"), _declared("different")])
            raw = _bytes(other); head = k5.SegmentHead(seg, 3, entries[-1].entry_digest)
        elif n == 87:
            raw = raw.replace(b"\n", b"\r\n", 1)
        elif n == 88:
            raw = raw.replace(b"\n", b" \n", 1)
        elif n == 89:
            obj = k5._plain(entries[0]); raw = ("{" + ",".join(f'{_canonical_json_bytes(k).decode()}:{_canonical_json_bytes(v).decode()}' for k,v in reversed(list(obj.items()))) + "}\n").encode() + _bytes(entries[1:])
        return raw, seg, head

    def _scope(self, n):
        manifest, a, b, scope, _, _, _, mh, ah, bh = _manifest_and_data()
        if n == 50:
            heads = [mh, ah, bh]
        elif n == 51:
            heads = [mh, ah]
        elif n == 52:
            scope = replace(scope, segments=()); heads = [mh, ah, bh]
        elif n == 53:
            heads = [mh, ah, bh]
        elif n == 54:
            scope = replace(scope, segments=(a,)); heads = [mh, ah]
        elif n == 55:
            heads = [mh, ah]
        elif n == 69:
            heads = [mh, ah, bh]
        elif n == 70:
            scope = replace(scope, segments=(a,)); heads = [mh, ah]
        elif n == 71:
            heads = [mh, ah]
        elif n == 72:
            scope = replace(scope, segments=()); heads = [mh, ah, bh]
        elif n == 73:
            heads = [mh, ah, bh]
        elif n == 74:
            heads = [mh, ah, bh]
        elif n == 75:
            # A contains the matching observation; B would conflict, but B is
            # absent from the fixed whole scope input set.
            heads = [mh, ah]
        else:
            heads = [mh, ah, bh]
        return scope, heads

    def _exercise(self, n):
        if 1 <= n <= 11 or 87 <= n <= 89:
            raw, seg, head = self._read_case(n)
            with patch.object(k5, "_read_bytes", return_value=raw):
                result = k5.read(seg, head)
            self.assertIsInstance(result, Unknown, f"UT-{n:03d} public read must report damaged prefix")
            self.assertEqual(result.reason, UnknownReason.UNREADABLE)
            self.assertIsInstance(result.key, ResultKey)
            self.assertTrue(result.evidence, f"UT-{n:03d} must detect its single byte/chain mutation")
            expected_evidence = {4: "(a)", 5: "(b)", 6: "(c)", 7: "(d)", 8: "(e)", 9: "(f)", 10: "(g)", 11: "(g)", 87: "(h)", 88: "(h)", 89: "(h)"}
            if n in expected_evidence:
                self.assertEqual(result.evidence, (expected_evidence[n],), f"UT-{n:03d} must retain the fixed K5-I3 evidence code")
            if n not in (1, 2, 3):
                self.assertEqual(len(result.evidence), 1, f"UT-{n:03d} must isolate one K5-I3 condition")
            return
        if n in (12, 13):
            manifest, a, b, scope, me, ae, be, mh, ah, bh = _manifest_and_data((a := _segment("a", 2),))
            projector = k5.Projector("p", "1", D1)
            h1 = [mh, ah]
            key1 = k5._build_projection_key(projector, scope, h1)
            if n == 12:
                expected_inputs = tuple(k5._head_ref(head) for head in (mh, ah))
                self.assertEqual(key1.operation, projector.identity)
                self.assertEqual(key1.operation_version, projector.version)
                self.assertEqual(key1.subject, SubjectRef("projector", projector.identity, projector.version, projector.digest))
                self.assertEqual(len(key1.inputs), 2)
                self.assertEqual(set(key1.inputs), set(expected_inputs))
                self.assertEqual(key1.scope, k5._scope_identity(scope))
                with patch.object(k5, "_read_bytes", side_effect=lambda seg: {manifest: _bytes(me), a: _bytes(ae)}.get(seg)):
                    head = k5.current_head(a)
                    fixed = k5.read(a, ah)
                self.assertIsInstance(head, Value)
                self.assertEqual(head.value, ah)
                self.assertIsInstance(fixed, Value)
                self.assertEqual(fixed.value, ae)
            else:
                extended = _chain(a, [_declared("a"), _declared("a2")])
                current = _head(extended)
                key2 = k5._build_projection_key(projector, scope, [mh, current])
                old = Value({"x": 1}, key1, {})
                recorded = record([], key1, old, "producer"); self.assertNotIsInstance(recorded, Rejected)
                with patch.object(k5, "_read_bytes", side_effect=lambda seg: {manifest: _bytes(me), a: _bytes(extended)}.get(seg)):
                    observed_head = k5.current_head(a)
                    fixed_old = k5.verify(k5.Projection(projector, scope, tuple(h1), [_declared("a")], _sha256_digest(_canonical_json_bytes([_declared("a")]))))
                self.assertIsInstance(observed_head, Value)
                self.assertEqual(observed_head.value, current)
                self.assertIsInstance(fixed_old, Value, "fixed seq1 projection must remain verifiable after seq2 append")
                stale = lookup([recorded.record], key2)
                self.assertIsInstance(stale, Stale)
                self.assertEqual((stale.recorded_key, stale.current_key), (key1, key2))
            return
        if 14 <= n <= 16:
            event = _recorded_event(); prior = [{"key_digest": event["key_digest"], "result_digest": event["result_digest"]}]
            if n == 14: self.assertIsInstance(k5._recorded_preflight(event["key_digest"], event["result_digest"], prior, True), NoOp)
            elif n == 15: self.assertIsInstance(k5._recorded_preflight(event["key_digest"], D2, prior, True), Conflict)
            else: self.assertEqual(k5._recorded_preflight(event["key_digest"], event["result_digest"], prior, False).reason, "peer_unreadable")
            return
        if 17 <= n <= 32:
            seg = _segment(); decl = _decl(); manifest = {seg}; event = _recorded_event()
            records = []
            if n == 17: event.pop("key")
            elif n == 18: event["key_digest"] = D2
            elif n == 19: event["result_digest"] = D2
            elif n == 20:
                event["result"] = {"class": "Stale"}
                event["result_digest"] = _sha256_digest(_canonical_json_bytes(event["result"]))
            elif n in (21, 22, 23):
                event["result"] = {"class": "NotApplicable", "reason": "x", "authority": "a", "reentry_trigger": "r"}
                event["result"].pop({21: "reason", 22: "authority", 23: "reentry_trigger"}[n])
                event["result_digest"] = _sha256_digest(_canonical_json_bytes(event["result"]))
            elif n == 24:
                event["result"]["value"]["type"] = "undeclared"
                event["result_digest"] = _sha256_digest(_canonical_json_bytes(event["result"]))
            elif n == 25: event["key"]["operation"] = "other"; event["key_digest"] = _key_digest(k5._decode_key(event["key"]))
            elif n == 26: event = {"kind": "ResultConflictDetected", "key_digest": D1, "result_digests": [D1]}
            elif n == 27: event = {"kind": "ResultConflictDetected", "key_digest": D1, "result_digests": [D1, D2]}
            elif n == 28: event = {"kind": "Correction", "target": D1}
            elif n == 29:
                seg = _segment("other"); manifest = {seg}; event = {"kind": "SegmentOpened", "segment": k5._plain(seg)}
            elif n == 30: event = {"kind": "DeclaredEvent", "event_type": "unknown", "refs": {}}
            elif n == 31: event = _recorded_event()
            elif n == 32: manifest = set()
            writer = "wrong" if n == 31 else seg.writer
            expected = {17:"missing_key",18:"missing_key",19:"missing_key",20:"stale_not_recordable",21:"invalid_disposition",22:"invalid_disposition",23:"invalid_disposition",24:"missing_key",25:"missing_key",26:"missing_key",27:"missing_key",28:"missing_key",29:"missing_key",30:"missing_key",31:"missing_key",32:"missing_key"}
            self.assertEqual(k5._event_valid(event, decl, seg, writer, manifest, records), expected[n], f"UT-{n:03d} must return the fixed existing preflight result")
            return
        if 33 <= n <= 39:
            key = _key(); body = _result_body()
            if n == 35: body = {"class": "Unknown", "reason": "unreadable", "evidence": {}}
            elif n == 36: body = {"class": "Unobserved", "why": "not_run"}
            elif n == 37: body = {"class": "NotApplicable", "reason": "n/a", "authority": "owner", "reentry_trigger": "r"}
            elif n in (38, 39):
                ref = {"encoding": "FixedRef", "store": "repository", "locator": {"revision": "r", "path": "p"}, "digest": D1}
                body = {"class": "Value", "value": ref, "evidence": {"encoding": "Inline", "type": "dict", "value": {}}}
                event = _recorded_event(key, body)
                with patch.object(k5, "_fixed_ref_bytes", return_value=None if n == 38 else b"bad"):
                    got = k5._record_from_event(event, _decl())
                self.assertIsInstance(got.result, Unknown); self.assertEqual(got.result.reason, UnknownReason.UNREADABLE); self.assertEqual(got.result.key, key); return
            event = _recorded_event(key, body)
            got = k5._record_from_event(event, _decl())
            self.assertIsInstance(got, ResultRecord)
            self.assertEqual(type(got.result).__name__, {33: "Value", 34: "Value", 35: "Unknown", 36: "Unobserved", 37: "NotApplicable"}.get(n, "Value"))
            self.assertEqual(got.result.key, key)
            if n == 35: self.assertEqual(got.result.reason, UnknownReason.UNREADABLE)
            if n == 36: self.assertEqual(got.result.why, UnobservedWhy.NOT_RUN)
            if n == 37:
                self.assertEqual((got.result.reason, got.result.authority, got.result.reentry_trigger), ("n/a", "owner", "r"))
            return
        if 40 <= n <= 45:
            seg = _segment("a"); root = _entry(seg, 1, "genesis", _declared("root"))
            if n == 40: events = [root]
            elif n == 41:
                c1 = _entry(seg, 2, root.entry_digest, {"kind": "Correction", "target": root.entry_digest, "reason": "r", "replacement": _declared("c1")})
                c2 = _entry(seg, 3, c1.entry_digest, {"kind": "Correction", "target": c1.entry_digest, "reason": "r", "replacement": _declared("c2")}); events = [root,c1,c2]
            elif n == 42:
                c1 = _entry(seg, 2, root.entry_digest, {"kind": "Correction", "target": root.entry_digest, "reason": "r", "replacement": None}); events=[root,c1]
            elif n == 43:
                manifest, a, b, scope, me, _, _, mh, _, _ = _manifest_and_data()
                root = _entry(a, 1, "genesis", _declared("root"))
                c1 = _entry(a, 2, root.entry_digest, {"kind": "Correction", "target": root.entry_digest, "reason": "r", "replacement": _declared("a")})
                c2 = _entry(b, 1, "genesis", {"kind": "Correction", "target": root.entry_digest, "reason": "r", "replacement": _declared("b")})
                a_entries, b_entries = [root, c1], [c2]
                heads = [mh, _head(a_entries), _head(b_entries)]
                blobs = {manifest: _bytes(me), a: _bytes(a_entries), b: _bytes(b_entries)}
                projector = k5.Projector("p", "1", D1)
                with patch.object(k5, "_read_bytes", side_effect=lambda item: blobs.get(item)):
                    value = k5.project(projector, scope, heads)
                self.assertIsInstance(value, Unknown)
                self.assertEqual(value.reason, UnknownReason.CONFLICT)
                self.assertIsInstance(value.key, ResultKey)
                self.assertEqual(value.key, k5._build_projection_key(projector, scope, heads))
                return
            else:
                k = _key("r1"); one = _recorded_event(k, _result_body(True)); prior=[{"key_digest":one["key_digest"],"result_digest":one["result_digest"]}]
                if n == 44: self.assertIsInstance(k5._recorded_preflight(one["key_digest"], D2, prior, True), Conflict)
                else:
                    second = _key("r2"); rec=record([],k,Value(True,k,{}),"p"); self.assertIsInstance(lookup([rec.record],second), Stale)
                return
            value = k5._correction_projection(events, _key())
            if n in (40, 41): self.assertEqual(value[0]["refs"]["label"], {40:"root",41:"c2"}[n])
            elif n == 42: self.assertEqual(value, [])
            else:
                self.assertIsInstance(value, Unknown)
                self.assertEqual(value.reason, UnknownReason.CONFLICT)
                self.assertEqual(value.key, _key())
            return
        if n in (46, 47, 48, 49):
            seg2, seg10 = _segment("w", 2), _segment("w", 10)
            entries = [_entry(seg10,1,"genesis",_declared("10")),_entry(seg2,1,"genesis",_declared("2"))]
            ordered = k5._order_entries(entries)
            if n == 46:
                self.assertIsNotNone(k5._event_valid({"output": ["projection"]}, _decl(), seg2, "w", {seg2}, []))
            elif n == 47:
                self.assertEqual([x.event for x in k5._order_entries(entries)], [x.event for x in k5._order_entries(list(reversed(entries)))])
            elif n == 48:
                self.assertEqual([x.segment.segment_no for x in ordered], [2,10])
            else:
                nfc, nfd = "é", "e\u0301"; self.assertEqual(unicodedata.normalize("NFC", nfc), unicodedata.normalize("NFC", nfd))
            return
        if 50 <= n <= 55 or 69 <= n <= 75:
            scope, heads = self._scope(n)
            manifest, a, b, _, me, ae, be, mh, ah, bh = _manifest_and_data()
            blobs = {manifest: _bytes(me), a: _bytes(ae), b: _bytes(be)}
            if 69 <= n <= 75:
                key_a = _key(scope="scope-a")
                a_entries = _chain(a, [_recorded_event(key_a, _result_body(True))])
                key_b = key_a if n == 75 else _key(scope="scope-b")
                b_entries = _chain(b, [_recorded_event(key_b, _result_body(False))])
                ah, bh = _head(a_entries), _head(b_entries)
                heads = [ah if head.segment == a else bh if head.segment == b else head for head in heads]
                blobs[a], blobs[b] = _bytes(a_entries), _bytes(b_entries)
            if n == 53:
                damaged = bytearray(blobs[b]); damaged[10] ^= 1; blobs[b] = bytes(damaged)
            elif n == 73:
                damaged = bytearray(blobs[manifest]); damaged[10] ^= 1; blobs[manifest] = bytes(damaged)
            elif n == 74:
                damaged = bytearray(blobs[b]); damaged[10] ^= 1; blobs[b] = bytes(damaged)
            projector = k5.Projector("p", "1", D1)
            with patch.object(k5, "_read_bytes", side_effect=lambda seg: blobs.get(seg)):
                result = k5.restore(_decl(), scope, heads) if 69 <= n <= 75 else k5.project(projector, scope, heads)
            if n in (50,54,69,70): self.assertIsInstance(result, Value)
            elif n in (51,52,55,71,72,75): self.assertEqual(result.reason, UnknownReason.MISSING_INPUT)
            else: self.assertEqual(result.reason, UnknownReason.UNREADABLE)
            self.assertIsInstance(result.key, ResultKey)
            if n in (50,54):
                self.assertEqual(result.value.scope, scope)
                self.assertEqual(result.value.projector, projector)
                self.assertEqual(result.value.output_digest, _sha256_digest(_canonical_json_bytes(result.value.output)))
            if n in (69,70):
                self.assertEqual(len(result.value), 1 if n == 70 else 2)
                query = result.value[0].key
                found = lookup(result.value, query)
                self.assertIsInstance(found, Value)
                self.assertEqual(found.key, query)
            if n == 55:
                complete, *_ = _manifest_and_data(); self.assertEqual(complete, _manifest_and_data()[0])
            return
        if 76 <= n <= 86:
            manifest = _segment("manifest", 0)
            writer_seg = _segment("current", 1)
            decl = _decl(manifest_writer="manifest")
            if n == 76:
                target = manifest
                event = {"kind": "SegmentOpened", "segment": k5._plain(manifest)}
                context = k5._AppendContext(decl, frozenset({manifest, writer_seg}), (), True, True)
            elif n == 77:
                target = writer_seg
                event = {"kind": "DeclaredEvent", "event_type": "open", "refs": {}}
                context = k5._AppendContext(decl, frozenset({manifest}), (), True, True)
            elif n == 78:
                target = writer_seg; event = {"kind": "DeclaredEvent", "event_type": "open", "refs": {}}
                context = k5._AppendContext(decl, frozenset({manifest, writer_seg}), (), False, True)
            elif n == 79:
                target = writer_seg; event = {"kind": "DeclaredEvent", "event_type": "open", "refs": {}}
                context = k5._AppendContext(decl, frozenset({manifest, writer_seg}), (), True, False)
            elif 80 <= n <= 83:
                target = writer_seg; event = {"kind": "DeclaredEvent", "event_type": "open", "refs": {"case": n}}
                context = k5._AppendContext(decl, frozenset({manifest, writer_seg}), (), True, False)
            elif n == 84:
                target = writer_seg; event = {"kind": "DeclaredEvent", "event_type": "open", "refs": {}}
                context = k5._AppendContext(decl, frozenset({manifest, writer_seg}), (), False, True)
            else:
                target = writer_seg; event = {"kind": "DeclaredEvent", "event_type": "open", "refs": {"late": True}}
                context = k5._AppendContext(decl, frozenset({manifest, writer_seg}), (), True, True)
            initial = _bytes(_chain(target, [_declared("old")]))
            with patch.object(k5, "_read_bytes", return_value=initial), patch.object(k5, "_append_bytes", return_value=k5.SegmentHead(target, 2, D2)) as append_port:
                result = k5._append_with_context(target, event, target.writer, context)
            if n in (77, 78, 79, 80, 81, 82, 83, 84):
                append_port.assert_not_called()
                if n == 77:
                    self.assertIsInstance(result, Rejected)
                elif n in (78, 84):
                    self.assertIsInstance(result, Rejected); self.assertEqual(result.reason, "peer_unreadable")
                else:
                    self.assertIsNone(result, "unbound authority/assignment input has no public-class mapping in this private core")
            else:
                append_port.assert_called_once()
                self.assertIsInstance(result, k5.Appended)
                if n == 85:
                    self.assertNotIn("EpochIssued", str(event))
                if n == 86:
                    self.assertEqual(event["refs"], {"late": True})
            return
        if 56 <= n <= 60:
            key = k5._build_projection_key(k5.Projector("p","1",D1), k5.ScopeDecl("s","r","log",k5.SegmentHead(_segment(),1,D1),(_segment(),)), [k5.SegmentHead(_segment(),1,D1)])
            result = Value({"projection":1}, key, {})
            rec = record([], key, result, "p"); self.assertNotIsInstance(rec, Rejected)
            if n == 56: self.assertEqual(lookup([rec.record], key), result)
            elif n == 57:
                changed = replace(key, inputs=(replace(key.inputs[0],revision="2"),)); self.assertIsInstance(lookup([rec.record],changed), Stale)
            elif n == 58:
                changed = replace(key, operation_version="2"); self.assertIsInstance(lookup([rec.record],changed), Unobserved)
            elif n == 59:
                changed = replace(key, subject=replace(key.subject,digest=D2)); self.assertIsInstance(lookup([rec.record],changed), Unknown)
            else: self.assertEqual(lookup([rec.record], key), result)
            return
        if 61 <= n <= 65:
            proj = k5.Projection(k5.Projector("p","1",D1), k5.ScopeDecl("s","r","log",k5.SegmentHead(_segment(),1,D1),(_segment(),)), (k5.SegmentHead(_segment(),1,D1),), {"x":1}, _sha256_digest(_canonical_json_bytes({"x":1})))
            state = proj.output; checkpoint = k5.Checkpoint(proj.projector, proj.scope, proj.input_heads, state, _sha256_digest(_canonical_json_bytes(state)))
            if n == 61: self.assertTrue(k5._checkpoint_valid(proj,checkpoint,proj))
            elif n == 62: self.assertFalse(k5._checkpoint_valid(replace(proj,input_heads=()),checkpoint,proj))
            elif n == 63: self.assertFalse(k5._checkpoint_valid(proj,replace(checkpoint,input_heads=(replace(checkpoint.input_heads[0],entry_digest=D2),)),proj))
            elif n == 64: self.assertFalse(k5._checkpoint_valid(proj,replace(checkpoint,state={"x":2}),proj))
            else: self.assertFalse(k5._checkpoint_valid(proj,replace(checkpoint,state={"x":2},state_digest=_sha256_digest(_canonical_json_bytes({"x":2}))),proj))
            return
        if 66 <= n <= 68:
            manifest,a,b,scope,me,ae,be,mh,ah,bh = _manifest_and_data((a := _segment("a",2),))
            blobs={manifest:_bytes(me),a:_bytes(ae)}; heads=[mh,ah]; projector=k5.Projector("p","1",D1)
            with patch.object(k5,"_read_bytes",side_effect=lambda seg: blobs.get(seg)):
                good=k5.project(projector,scope,heads)
            self.assertIsInstance(good,Value); proj=good.value
            if n == 66: candidate=replace(proj,output=[_declared("changed")])
            elif n == 67: candidate=replace(proj,output_digest=D2)
            else:
                changed=[_declared("changed")]; candidate=replace(proj,output=changed,output_digest=_sha256_digest(_canonical_json_bytes(changed)))
            with patch.object(k5,"_read_bytes",side_effect=lambda seg: blobs.get(seg)):
                failed = k5.verify(candidate)
            self.assertIsInstance(failed, Unknown)
            self.assertEqual(failed.reason, UnknownReason.CONFLICT)
            self.assertIsInstance(failed.key, ResultKey)
            if n in (66, 67): self.assertEqual(failed.evidence, {"saved_output_digest":"mismatch"})
            else: self.assertEqual(failed.evidence, {"rebuild":"mismatch"})
            return
        if n == 90:
            key_a=_key(scope="A"); key_whole=_key(scope="whole"); value=Value(True,key_a,{})
            rec=record([],key_a,value,"p"); self.assertIsInstance(lookup([rec.record],key_whole),Unobserved)
            return
        if n == 91:
            manifest, a, b, scope, me, ae, be, mh, ah, bh = _manifest_and_data()
            key=_key(); ae=_chain(a,[_recorded_event(key,_result_body(True))]); be=_chain(b,[_recorded_event(key,_result_body(False))])
            heads=[mh,_head(ae),_head(be)]; blobs={manifest:_bytes(me),a:_bytes(ae),b:_bytes(be)}
            with patch.object(k5,"_read_bytes",side_effect=lambda seg: blobs.get(seg)):
                restored=k5.restore(_decl(),scope,heads)
            self.assertIsInstance(restored,Value); self.assertEqual(len(restored.value),2)
            self.assertTrue(all(isinstance(item,ResultRecord) for item in restored.value))
            self.assertIsInstance(lookup(restored.value,key),Unknown)
            return
        self.fail(f"No fixture implementation for CK-K5-UT-{n:03d}")


def _make_test(case_id):
    def test(self):
        self._exercise(case_id)
    test.__name__ = f"test_ck_k5_ut_{case_id:03d}"
    test.__doc__ = f"Formal K5 unit identity CK-K5-UT-{case_id:03d}."
    return test


for _case_id in range(1, 92):
    setattr(K5Fixtures, f"test_ck_k5_ut_{_case_id:03d}", _make_test(_case_id))


if __name__ == "__main__":
    unittest.main()
