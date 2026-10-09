"""K5 formal fixtures. All bytes/store observations are synthetic and local."""
from __future__ import annotations

from dataclasses import replace
from copy import deepcopy
import json
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
            different_manifest = replace(mh, segment=_segment("manifest", 0, "different-log"))
            different_segment = replace(ah, segment=_segment("a", 2, "different-log"))
            mismatched_scopes = (
                (replace(scope, log_id="different-log"), heads),
                (replace(scope, manifest_head=different_manifest), [different_manifest, ah, bh]),
                (replace(scope, segments=(different_segment.segment,)), [mh, different_segment]),
            )
            for candidate, candidate_heads in mismatched_scopes:
                with self.subTest(scope_log=candidate.log_id, manifest_log=candidate.manifest_head.segment.log_id,
                                  segment_logs=tuple(segment.log_id for segment in candidate.segments)):
                    with self.assertRaisesRegex(NotImplementedError, "mismatched scope/log"):
                        k5.project(k5.Projector("p", "1", D1), candidate, candidate_heads)
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
            scope = replace(scope, segments=()); heads = [mh]
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
            scope = replace(scope, segments=()); heads = [mh]
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
            event = _recorded_event()
            prior = [{"kind": "ResultRecorded", "key_digest": event["key_digest"], "result_digest": event["result_digest"]}]
            if n == 14:
                self.assertEqual(k5._event_valid(event, _decl(), _segment(), "w", {_segment()}, prior), "noop")
            elif n == 15:
                different = deepcopy(event)
                different["result"] = _result_body(False)
                different["result_digest"] = _sha256_digest(_canonical_json_bytes(different["result"]))
                self.assertEqual(k5._event_valid(different, _decl(), _segment(), "w", {_segment()}, prior), "conflict")
            else:
                seg = _segment()
                context = k5._AppendContext(_decl(), frozenset({seg}), tuple(prior), False, True)
                with patch.object(k5, "_read_bytes", side_effect=AssertionError("unreadable peer must stop before read")) as reader, \
                     patch.object(k5, "current_head", side_effect=AssertionError("unreadable peer must stop before head read")) as head_reader, \
                     patch.object(k5, "_append_bytes") as append_port:
                    outcome = k5._append_with_context(seg, event, seg.writer, context)
                self.assertIsInstance(outcome, Rejected)
                self.assertEqual(outcome.reason, "peer_unreadable")
                reader.assert_not_called(); head_reader.assert_not_called(); append_port.assert_not_called()
            return
        if 17 <= n <= 32:
            seg = _segment(); decl = _decl(); manifest = {seg}; event = _recorded_event()
            records = []
            manifest_segment = None
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
            elif n == 27:
                event = {"kind": "ResultConflictDetected", "key_digest": D1, "result_digests": [D1, D2]}
                records = [{"key_digest": D1, "result_digest": D1}]
            elif n == 28:
                event = {"kind": "Correction", "target": D1, "reason": "correction"}
                records = [{"entry_digest": D1, "event": _recorded_event()}]
            elif n == 29:
                decl = _decl(manifest_writer="manifest")
                seg = _segment("other"); manifest = {seg}; manifest_segment = seg
                event = {"kind": "SegmentOpened", "segment": k5._plain(_segment("opened"))}
            elif n == 30: event = {"kind": "DeclaredEvent", "event_type": "unknown", "refs": {}}
            elif n == 31: event = _recorded_event()
            elif n == 32: manifest = set()
            writer = "wrong" if n == 31 else seg.writer
            outcome = k5._event_valid(event, decl, seg, writer, manifest, records, manifest_segment=manifest_segment)
            expected = {
                17: "missing_key",
                20: "stale_not_recordable",
            }
            if n in expected:
                self.assertEqual(outcome, expected[n], f"UT-{n:03d} must preserve its fixed private preflight result")
            else:
                self.assertIs(outcome, k5._UNMAPPED_APPEND_VALIDATION, f"UT-{n:03d} must stop at the existing unmapped validation boundary")
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
                manifest, a, b, scope, me, ae, be, mh, ah, bh = _manifest_and_data()
                blobs = {manifest: _bytes(me), a: _bytes(ae), b: _bytes(be)}
                heads = [mh, ah, bh]
                projector = k5.Projector("p", "1", D1)
                with patch.object(k5, "_read_bytes", side_effect=lambda seg: blobs.get(seg)):
                    results = [k5.project(projector, scope, order) for order in (heads, [bh, mh, ah], [ah, bh, mh])]
                self.assertTrue(all(isinstance(item, Value) for item in results))
                self.assertEqual(results[0].value.output, results[1].value.output)
                self.assertEqual(results[0].value.output, results[2].value.output)
                self.assertEqual(len({item.value.output_digest for item in results}), 1)
            elif n == 48:
                self.assertEqual([x.segment.segment_no for x in ordered], [2,10])
            else:
                manifest = _segment("manifest", 0)
                nfc, nfd = "é", unicodedata.normalize("NFD", "é")
                seg2, seg10 = _segment(nfc, 2), _segment(nfd, 10)
                opened = _chain(manifest, [{"kind": "SegmentOpened", "segment": k5._plain(s)} for s in (seg10, seg2)])
                key2, key10 = _key("r1"), _key("r2")
                entries2 = _chain(seg2, [_recorded_event(key2, _result_body(True))])
                entries10 = _chain(seg10, [_recorded_event(key10, _result_body(True))])
                scope = k5.ScopeDecl("scope", "r", "log", _head(opened), (seg2, seg10))
                blobs = {manifest: _bytes(opened), seg2: _bytes(entries2), seg10: _bytes(entries10)}
                query = _key("r3")
                with patch.object(k5, "_read_bytes", side_effect=lambda seg: blobs.get(seg)):
                    restored = k5.restore(_decl(), scope, [_head(opened), _head(entries10), _head(entries2)])
                self.assertIsInstance(restored, Value)
                self.assertEqual([item.key for item in restored.value], [key2, key10])
                prior = lookup(restored.value, query)
                self.assertIsInstance(prior, Stale)
                self.assertEqual(prior.recorded_key, key10)
                self.assertEqual(prior.current_key, query)
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
                closed_a = _chain(a, [{"kind": "DeclaredEvent", "event_type": "open", "refs": {"state": "closed", "id": "A"}}])
                closed_b = _chain(b, [{"kind": "DeclaredEvent", "event_type": "open", "refs": {"state": "closed", "id": "B"}}])
                closed_blobs = {manifest: _bytes(me), a: _bytes(closed_a), b: _bytes(closed_b)}
                before = dict(closed_blobs)
                with patch.object(k5, "_read_bytes", side_effect=lambda seg: closed_blobs.get(seg)), patch.object(k5, "_append_bytes") as append_port:
                    result = k5.project(projector, scope, [mh, _head(closed_a)])
                self.assertIsInstance(result, Unknown)
                self.assertEqual(result.reason, UnknownReason.MISSING_INPUT)
                self.assertEqual(closed_blobs, before)
                append_port.assert_not_called()
            return
        if 76 <= n <= 86:
            manifest = _segment("manifest", 0)
            writer_seg = _segment("current", 1)
            decl = _decl(manifest_writer="manifest")
            if n == 76:
                target = manifest
                event = {"kind": "SegmentOpened", "segment": k5._plain(writer_seg)}
                context = k5._AppendContext(decl, frozenset({manifest, writer_seg}), (), True, True, manifest_segment=manifest)
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
                # These four L8 owner conditions do not enter this private
                # helper's arguments. Keep the same local sentinel fixture;
                # the distinct owner outcomes remain outside L7 coverage.
                target = writer_seg; event = {"kind": "DeclaredEvent", "event_type": "open", "refs": {}}
                context = k5._AppendContext(decl, frozenset({manifest, writer_seg}), (), True, False)
            elif n == 84:
                target = writer_seg; event = _recorded_event()
                context = k5._AppendContext(decl, frozenset({manifest, writer_seg}), (), False, True)
            else:
                target = writer_seg; event = {"kind": "DeclaredEvent", "event_type": "open", "refs": {"late": True}}
                context = k5._AppendContext(decl, frozenset({manifest, writer_seg}), (), True, True)
            initial = _bytes(_chain(target, [_declared("old")]))
            with patch.object(k5, "_read_bytes", return_value=initial), patch.object(k5, "_append_bytes", return_value=k5.SegmentHead(target, 2, D2)) as append_port:
                if n in (77, 78):
                    with self.assertRaises(NotImplementedError):
                        k5._append_with_context(target, event, target.writer, context)
                    result = None
                else:
                    result = k5._append_with_context(target, event, target.writer, context)
            if n in (77, 78, 79, 80, 81, 82, 83, 84):
                append_port.assert_not_called()
                if n in (77, 78):
                    self.assertIsNone(result)
                elif n == 84:
                    self.assertIsInstance(result, Rejected); self.assertEqual(result.reason, "peer_unreadable")
                else:
                    self.assertIsNone(result, "unbound owner input is not mapped by this private core")
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
            manifest, a, _, scope, me, _, _, mh, _, _ = _manifest_and_data((_segment("a", 2),))
            first = _chain(a, [_declared("first")])
            # Extend the same scope while preserving the projection value: the
            # correction restates the existing event. This lets the checkpoint
            # retain its old head while the full rebuild remains byte-equal.
            extended = _chain(a, [
                _declared("first"),
                {"kind": "Correction", "target": first[0].entry_digest,
                 "reason": "restate", "replacement": _declared("first")},
            ])
            projector = k5.Projector("p", "1", D1)
            old_heads = [mh, _head(first)]
            current_heads = [mh, _head(extended)]
            blobs = {manifest: _bytes(me), a: _bytes(extended)}
            with patch.object(k5, "_read_bytes", side_effect=lambda seg: blobs.get(seg)):
                old_projection = k5.project(projector, scope, old_heads)
                current_projection = k5.project(projector, scope, current_heads)
            self.assertIsInstance(old_projection, Value)
            self.assertIsInstance(current_projection, Value)
            checkpoint = k5.Checkpoint(
                old_projection.value.projector,
                old_projection.value.scope,
                old_projection.value.input_heads,
                old_projection.value.output,
                old_projection.value.output_digest,
            )
            if n == 61:
                # Current input head extends the checkpoint head while the
                # prior-prefix anchor and full-rebuild result still agree.
                with patch.object(k5, "_read_bytes", side_effect=lambda seg: blobs.get(seg)):
                    got = k5.verify(current_projection.value, checkpoint)
                self.assertIsInstance(got, Value)
            elif n == 62:
                # The current projection is shorter than the checkpoint head.
                with patch.object(k5, "_read_bytes", side_effect=lambda seg: blobs.get(seg)):
                    got = k5.verify(old_projection.value, replace(checkpoint, input_heads=(mh, _head(extended))))
                self.assertIsInstance(got, Unknown); self.assertEqual(got.reason, UnknownReason.CONFLICT)
            elif n == 63:
                bad_anchor = replace(checkpoint, input_heads=(mh, k5.SegmentHead(a, 1, D2)))
                with patch.object(k5, "_read_bytes", side_effect=lambda seg: blobs.get(seg)):
                    got = k5.verify(current_projection.value, bad_anchor)
                self.assertIsInstance(got, Unknown); self.assertEqual(got.reason, UnknownReason.CONFLICT)
            elif n == 64:
                bad_state = replace(checkpoint, state={"changed": True})
                with patch.object(k5, "_read_bytes", side_effect=lambda seg: blobs.get(seg)):
                    got = k5.verify(current_projection.value, bad_state)
                self.assertIsInstance(got, Unknown); self.assertEqual(got.reason, UnknownReason.CONFLICT)
            else:
                changed = {"changed": True}
                bad_state = replace(checkpoint, state=changed, state_digest=_sha256_digest(_canonical_json_bytes(changed)))
                with patch.object(k5, "_read_bytes", side_effect=lambda seg: blobs.get(seg)):
                    got = k5.verify(current_projection.value, bad_state)
                self.assertIsInstance(got, Unknown); self.assertEqual(got.reason, UnknownReason.CONFLICT)
                self.assertEqual(got.evidence, {"checkpoint": "mismatch"})
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

    def test_ck_k5_ut_102_closed_event_union_rejects_missing_and_unknown_kind(self):
        seg = _segment()
        for label, event in (("missing", {"event_type": "open", "refs": {}}), ("unknown", {"kind": "Other", "event_type": "open", "refs": {}})):
            with self.subTest(variant=label):
                entry = _entry(seg, 1, "genesis", event)
                with patch.object(k5, "_read_bytes", return_value=_bytes([entry])):
                    result = k5.read(seg, _head([entry]))
                self.assertIsInstance(result, Unknown)
                self.assertEqual(result.reason, UnknownReason.UNREADABLE)
                self.assertIn("event_shape", result.evidence)

    def test_ck_k5_ut_103_malformed_nested_event_stops_read_and_append(self):
        seg = _segment()
        malformed = ["not", "an", "event"]
        draft = {"schema_version": k5.SCHEMA_VERSION, "segment": seg, "seq": 1, "prev_digest": "genesis", "event": malformed}
        entry = k5.LogEntry(k5.SCHEMA_VERSION, seg, 1, "genesis", malformed, _sha256_digest(_canonical_json_bytes(k5._plain(draft))))
        with patch.object(k5, "_read_bytes", return_value=_bytes([entry])):
            result = k5.read(seg, _head([entry]))
        self.assertIsInstance(result, Unknown); self.assertEqual(result.reason, UnknownReason.UNREADABLE)
        context = k5._AppendContext(_decl(), frozenset({seg}), (), True, True)
        with patch.object(k5, "_read_bytes", side_effect=AssertionError("malformed append reaches reader")), patch.object(k5, "_append_bytes", side_effect=AssertionError("malformed append reaches writer")):
            with self.assertRaises(NotImplementedError):
                k5._append_with_context(seg, {"kind": "Correction", "target": [], "reason": "r"}, seg.writer, context)

    def test_ck_k5_ut_104_genesis_head_key_and_projection_paths(self):
        manifest, a, _, scope, me, _, _, mh, _, _ = _manifest_and_data((_segment("a", 2),))
        empty = k5.SegmentHead(a, 0, "genesis")
        projector = k5.Projector("p", "1", D1)
        blobs = {manifest: _bytes(me), a: b""}
        with patch.object(k5, "_read_bytes", side_effect=lambda seg: blobs.get(seg)):
            current = k5.current_head(a)
            read = k5.read(a, empty)
            restored = k5.restore(_decl(), scope, [mh, empty])
            projected = k5.project(projector, scope, [mh, empty])
            verified = k5.verify(projected.value) if isinstance(projected, Value) else projected
        self.assertIsInstance(current, Value); self.assertEqual(current.value, empty)
        self.assertIsInstance(read, Value); self.assertIsInstance(read.key, ResultKey)
        self.assertIsInstance(restored, Value); self.assertEqual(restored.value, [])
        self.assertIsInstance(projected, Value); self.assertIsInstance(verified, Value)
        self.assertEqual(projected.value.output_digest, _sha256_digest(_canonical_json_bytes([])))

    def test_ck_k5_ut_105_segment_opened_targets_manifest_segment(self):
        manifest = _segment("manifest", 0); data = _segment("writer", 1)
        decl = _decl(manifest_writer="manifest")
        event = {"kind": "SegmentOpened", "segment": k5._plain(data)}
        context = k5._AppendContext(decl, frozenset({manifest, data}), (), True, True, manifest_segment=manifest)
        raw = _bytes(_chain(manifest, [_declared("prior")]))
        with patch.object(k5, "_read_bytes", return_value=raw), patch.object(k5, "_append_bytes", return_value=k5.SegmentHead(manifest, 2, D2)) as append_port:
            result = k5._append_with_context(manifest, event, "manifest", context)
        self.assertIsInstance(result, k5.Appended); append_port.assert_called_once()
        for destination in (data, _segment("manifest", 9)):
            bad_context = k5._AppendContext(decl, frozenset({manifest, data, destination}), (), True, True, manifest_segment=manifest)
            with patch.object(k5, "_read_bytes", side_effect=AssertionError("invalid manifest destination must stop before read")), patch.object(k5, "_append_bytes") as writer:
                with self.assertRaises(NotImplementedError):
                    k5._append_with_context(destination, event, destination.writer, bad_context)
            writer.assert_not_called()

    def test_ck_k5_ut_106_append_constraints_reject_duplicate_and_wrong_shapes(self):
        seg = _segment(); decl = _decl()
        events = []
        conflict = {"kind": "ResultConflictDetected", "key_digest": D1, "result_digests": [D1, D1]}
        events.append(("duplicate-conflict-digest", conflict, [{"key_digest": D1, "result_digest": D1}]))
        bad_ref = _recorded_event(body={"class": "Value", "value": {"encoding": "FixedRef", "store": "stage", "locator": "x", "digest": D1}, "evidence": {"encoding": "Inline", "type": "dict", "value": {}}})
        events.append(("fixedref-store", bad_ref, []))
        bad_correction = {"kind": "Correction", "target": D1, "reason": "r", "replacement": {"kind": "SegmentOpened", "segment": k5._plain(seg)}}
        events.append(("replacement-union", bad_correction, []))
        for label, event, records in events:
            with self.subTest(constraint=label):
                context = k5._AppendContext(decl, frozenset({seg}), tuple(records), True, True)
                with patch.object(k5, "_read_bytes", side_effect=AssertionError("invalid event reached reader")), patch.object(k5, "_append_bytes") as writer:
                    with self.assertRaisesRegex(NotImplementedError, "K5 append rejection mapping for this validation condition is not defined"):
                        k5._append_with_context(seg, event, seg.writer, context)
                writer.assert_not_called()

    def test_ck_k5_ut_107_projection_heads_deduplicate_only_in_scope_duplicates(self):
        manifest, a, b, scope, me, ae, be, mh, ah, bh = _manifest_and_data()
        heads = [mh, ah, bh, ah]
        blobs = {manifest: _bytes(me), a: _bytes(ae), b: _bytes(be)}
        with patch.object(k5, "_read_bytes", side_effect=lambda seg: blobs.get(seg)):
            projected = k5.project(k5.Projector("p", "1", D1), scope, heads)
        self.assertIsInstance(projected, Value)
        self.assertEqual(projected.value.input_heads, tuple(sorted((mh, ah, bh), key=k5._heads_key)))
        self.assertEqual(len(projected.key.inputs), 3)

    def test_ck_k5_ut_109_scope_out_head_stops_before_read(self):
        manifest, a, b, scope, me, ae, be, mh, ah, bh = _manifest_and_data()
        extra = k5.SegmentHead(_segment("outside", 99), 1, D3)
        with patch.object(k5, "_read_bytes", side_effect=AssertionError("scope-out head must not be silently filtered")) as reader:
            with self.assertRaises(NotImplementedError):
                k5.project(k5.Projector("p", "1", D1), scope, [mh, ah, bh, extra])
        reader.assert_not_called()

    def test_ck_k5_ut_110_event_validation_malformed_and_nonfinite_are_unmapped(self):
        seg = _segment("w", 1)
        decl = _decl()
        malformed_kind = {"kind": [], "event_type": "open", "refs": {}}
        nan_result = _recorded_event()
        nan_result["result"]["value"]["value"] = float("nan")
        bad_record_digest = _recorded_event(); bad_record_digest["key_digest"] = "not-a-digest"
        malformed_cases = (
            ("unhashable-kind", malformed_kind, False),
            ("nonfinite-result", nan_result, True),
            ("record-key-digest-malformed", bad_record_digest, False),
            ("result-digests-none", {"kind": "ResultConflictDetected", "key_digest": D1, "result_digests": None}, False),
            ("result-digest-malformed", {"kind": "ResultConflictDetected", "key_digest": D1, "result_digests": ["bad"]}, False),
            ("missing-segment", {"kind": "SegmentOpened"}, False),
            ("correction-list-replacement", {"kind": "Correction", "target": D1, "reason": "r", "replacement": []}, False),
            ("correction-target-malformed", {"kind": "Correction", "target": "entry", "reason": "r", "replacement": None}, False),
            ("segment-number-bool", {"kind": "SegmentOpened", "segment": {"log_id": "log", "writer": "w", "segment_no": True}}, False),
            ("segment-number-float", {"kind": "SegmentOpened", "segment": {"log_id": "log", "writer": "w", "segment_no": 1.0}}, False),
            ("segment-number-string", {"kind": "SegmentOpened", "segment": {"log_id": "log", "writer": "w", "segment_no": "1"}}, False),
        )
        for label, event, shape_valid in malformed_cases:
            with self.subTest(case=label):
                self.assertEqual(k5._event_shape_valid(event), shape_valid)
                self.assertIs(k5._event_valid(event, decl, seg, seg.writer, {seg}, []), k5._UNMAPPED_APPEND_VALIDATION)
                context = k5._AppendContext(decl, frozenset({seg}), (), True, True)
                with patch.object(k5, "_read_bytes", side_effect=AssertionError("unmapped event reached reader")) as reader, \
                     patch.object(k5, "current_head", side_effect=AssertionError("unmapped event reached head reader")) as head_reader, \
                     patch.object(k5, "_append_bytes", side_effect=AssertionError("unmapped event reached writer")) as writer:
                    with self.assertRaises(NotImplementedError):
                        k5._append_with_context(seg, event, seg.writer, context)
                reader.assert_not_called(); head_reader.assert_not_called(); writer.assert_not_called()

        baseline = _entry(seg, 1, "genesis", _declared("valid"))
        for label, mutation, expected_evidence in (
            ("schema-version-unhashable", lambda wire: wire.update(schema_version=[]), "(b)"),
            ("seq-unhashable", lambda wire: wire.update(seq=[]), "(a)"),
            ("nonfinite-nested-event", lambda wire: wire["event"]["refs"].update(value=float("nan")), "(a)"),
        ):
            with self.subTest(raw_read=label):
                wire = k5._plain(baseline)
                mutation(wire)
                raw = json.dumps(wire, ensure_ascii=False, separators=(",", ":"), allow_nan=True).encode("utf-8") + b"\n"
                with patch.object(k5, "_read_bytes", return_value=raw):
                    observed = k5.read(seg, _head([baseline]))
                self.assertIsInstance(observed, Unknown)
                self.assertEqual(observed.reason, UnknownReason.UNREADABLE)
                self.assertIn(expected_evidence, observed.evidence)

        deeply_nested_json = b"[" * 2000 + b"0" + b"]" * 2000 + b"\n"
        with patch.object(k5, "_read_bytes", return_value=deeply_nested_json):
            prefix_result = k5.read(seg, _head([baseline]))
            tail_result = k5.current_head(seg)
        for result in (prefix_result, tail_result):
            self.assertIsInstance(result, Unknown)
            self.assertEqual(result.reason, UnknownReason.UNREADABLE)
            self.assertIn("(a)", result.evidence)

    def test_ck_k5_ut_111_existing_append_reasons_are_event_scoped(self):
        seg = _segment("w", 1)
        decl = _decl()
        context = k5._AppendContext(decl, frozenset({seg}), (), False, True)
        non_result_event = _declared("peer-check-is-not-result-recorded")
        with patch.object(k5, "_read_bytes", side_effect=AssertionError("preflight only")) as reader, \
             patch.object(k5, "current_head", side_effect=AssertionError("preflight only")) as head_reader, \
             patch.object(k5, "_append_bytes", side_effect=AssertionError("preflight only")) as writer:
            with self.assertRaises(NotImplementedError):
                k5._append_with_context(seg, non_result_event, seg.writer, context)
            peer_result = k5._append_with_context(seg, _recorded_event(), seg.writer, context)
            stale = _recorded_event(body={"class": "Stale"})
            stale_result = k5._append_with_context(seg, stale, seg.writer, context)
        self.assertIsInstance(peer_result, Rejected); self.assertEqual(peer_result.reason, "peer_unreadable")
        self.assertIsInstance(stale_result, Rejected); self.assertEqual(stale_result.reason, "stale_not_recordable")
        reader.assert_not_called(); head_reader.assert_not_called(); writer.assert_not_called()

    def test_ck_k5_ut_108_stale_precedes_missing_key(self):
        stale = {"kind": "ResultRecorded", "result": {"class": "Stale"}}
        result = k5._event_valid(stale, _decl(), _segment(), "w", {_segment()}, [])
        self.assertEqual(result, "stale_not_recordable")

    def test_ck_k5_ut_101_append_invalid_key_body_stops_unmapped_branch(self):
        seg = _segment("w", 1)
        manifest = _segment("manifest", 0)
        decl = _decl()
        context = k5._AppendContext(decl, frozenset({manifest, seg}), (), True, True)

        invalid_digest = _recorded_event()
        invalid_digest["key"]["subject"]["digest"] = "not-a-digest"
        invalid_digest["key_digest"] = _key_digest(k5._decode_key(invalid_digest["key"]))

        duplicate_identity = _recorded_event()
        duplicate_identity["key"]["inputs"] = [
            {"kind": "ref", "identity": "same", "revision": "r1", "digest": D1},
            {"kind": "ref", "identity": "same", "revision": "r2", "digest": D2},
        ]
        duplicate_identity["key_digest"] = _key_digest(k5._decode_key(duplicate_identity["key"]))

        unhashable_identity = _recorded_event()
        unhashable_identity["key"]["inputs"] = [
            {"kind": "ref", "identity": ["not", "text"], "revision": "r1", "digest": D1},
        ]
        unhashable_identity["key_digest"] = _key_digest(k5._decode_key(unhashable_identity["key"]))

        bad_unknown_reason = _recorded_event(body={"class": "Unknown", "reason": "not-a-reason", "evidence": {}})
        missing_unknown_reason = _recorded_event(body={"class": "Unknown", "evidence": {}})
        bad_unobserved_why = _recorded_event(body={"class": "Unobserved", "why": "not-a-why"})
        missing_value_evidence = _recorded_event(body={
            "class": "Value",
            "value": {"encoding": "Inline", "type": "bool", "value": True},
        })
        bad_fixedref_digest = _recorded_event(body={
            "class": "Value",
            "value": {"encoding": "FixedRef", "store": "repository", "locator": {"path": "x"}, "digest": "bad"},
            "evidence": {"encoding": "Inline", "type": "dict", "value": {}},
        })
        nonstring_inline_type = _recorded_event(body={
            "class": "Value",
            "value": {"encoding": "Inline", "type": ["bool"], "value": True},
            "evidence": {"encoding": "Inline", "type": "dict", "value": {}},
        })

        unresolved_cases = (
            ("invalid_digest", invalid_digest),
            ("duplicate_input_identity", duplicate_identity),
            ("unhashable_input_identity", unhashable_identity),
            ("unknown_reason", bad_unknown_reason),
            ("unknown_reason_missing", missing_unknown_reason),
            ("unobserved_why", bad_unobserved_why),
            ("value_evidence_missing", missing_value_evidence),
            ("fixedref_digest_invalid", bad_fixedref_digest),
            ("inline_type_nonstring", nonstring_inline_type),
        )
        for label, event in unresolved_cases:
            with self.subTest(case=label):
                with patch.object(k5, "_read_bytes", return_value=b"old bytes") as read_port, \
                     patch.object(k5, "current_head", return_value=Value(k5.SegmentHead(seg, 1, D1), _key(), {})) as head_port, \
                     patch.object(k5, "_append_bytes", return_value=k5.SegmentHead(seg, 2, D2)) as append_port, \
                     patch.object(k5, "_fixed_ref_bytes", return_value=b"must-not-read") as fixedref_port:
                    with self.assertRaises(NotImplementedError):
                        k5._append_with_context(seg, event, seg.writer, context)
                read_port.assert_not_called()
                head_port.assert_not_called()
                append_port.assert_not_called()
                fixedref_port.assert_not_called()

    def test_ck_k5_ut_112_restore_closed_key_shape_and_project_is_domain_only(self):
        manifest, a, _, scope, me, _, _, mh, _, _ = _manifest_and_data((_segment("a", 2),))
        key = _key()
        projector = k5.Projector("p", "1", D1)
        declared = _declared("projection-root")

        def observe(record_event):
            entries = _chain(a, [declared, record_event])
            blobs = {manifest: _bytes(me), a: _bytes(entries)}
            heads = [mh, _head(entries)]
            with patch.object(k5, "_read_bytes", side_effect=lambda seg: blobs.get(seg)):
                restored = k5.restore(_decl(), scope, heads)
                projected = k5.project(projector, scope, heads)
            return restored, projected

        # A complete known key is the baseline. project() folds only declared
        # domain events; restore() is the separate ResultRecorded decoder.
        baseline = _recorded_event(key, _result_body())
        restored, projected = observe(baseline)
        self.assertIsInstance(restored, Value)
        self.assertEqual(len(restored.value), 1)
        self.assertIsInstance(projected, Value)
        self.assertEqual(projected.value.output, [declared])

        extra_field = deepcopy(baseline)
        extra_field["key"]["unexpected"] = "must-not-be-dropped-before-digest-check"
        restored, projected = observe(extra_field)
        self.assertIsInstance(restored, Unknown)
        self.assertEqual(restored.reason, UnknownReason.UNREADABLE)
        self.assertEqual(restored.evidence, ("result_body",))
        self.assertIsInstance(projected, Value)
        self.assertEqual(projected.value.output, [declared])

        for field in ("key_digest", "result_digest"):
            with self.subTest(tampered=field):
                tampered = deepcopy(baseline)
                tampered[field] = D2
                restored, _ = observe(tampered)
                self.assertIsInstance(restored, Unknown)
                self.assertEqual(restored.reason, UnknownReason.UNREADABLE)
                self.assertEqual(restored.evidence, ("result_body",))

        malformed_body = _recorded_event(key, {"class": "outside-result-union"})
        restored, projected = observe(malformed_body)
        self.assertIsInstance(restored, Unknown)
        self.assertEqual(restored.evidence, ("result_body",))
        self.assertIsInstance(projected, Value)
        self.assertEqual(projected.value.output, [declared])

    def test_ck_k5_ut_113_fixed_read_and_correction_shape_branches(self):
        seg = _segment("a", 2)
        zero_head = k5.SegmentHead(seg, 0, D1)
        with patch.object(k5, "_read_bytes", return_value=b""):
            zero = k5.read(seg, zero_head)
        self.assertIsInstance(zero, Unknown)
        self.assertIn("(g)", zero.evidence)

        foreign = _segment("foreign", 2)
        foreign_entry = _entry(foreign, 1, "genesis", _declared("foreign"))
        with patch.object(k5, "_read_bytes", return_value=_bytes([foreign_entry])):
            foreign_read = k5.read(seg, k5.SegmentHead(seg, 1, foreign_entry.entry_digest))
        self.assertIsInstance(foreign_read, Unknown)
        self.assertIn("(h)", foreign_read.evidence)

        bad_correction = _entry(seg, 1, "genesis", {
            "kind": "Correction", "target": D1, "reason": "r",
            "replacement": {"kind": "SegmentOpened", "segment": k5._plain(seg)},
        })
        with patch.object(k5, "_read_bytes", return_value=_bytes([bad_correction])):
            correction_read = k5.read(seg, _head([bad_correction]))
        self.assertIsInstance(correction_read, Unknown)
        self.assertIn("event_shape", correction_read.evidence)

        root = _entry(seg, 1, "genesis", _declared("root"))
        first = _entry(seg, 2, root.entry_digest, {
            "kind": "Correction", "target": root.entry_digest,
            "reason": "r1", "replacement": _declared("first"),
        })
        second = _entry(seg, 3, first.entry_digest, {
            "kind": "Correction", "target": first.entry_digest,
            "reason": "r2", "replacement": _declared("second"),
        })
        self.assertEqual(k5._correction_projection([root, first, second], _key()), [_declared("second")])

    def test_ck_k5_ut_114_append_scope_and_manifest_local_boundaries(self):
        manifest = _segment("manifest", 0)
        data = _segment("data", 1)
        decl = _decl(manifest_writer="manifest")
        context = k5._AppendContext(decl, frozenset({manifest, data}), (), True, True, manifest_segment=manifest)
        opened = {"kind": "SegmentOpened", "segment": k5._plain(data)}

        for label, target, writer, event, ctx in (
            ("wrong-writer", manifest, "other", opened, context),
            ("wrong-log", manifest, "manifest", {"kind": "SegmentOpened", "segment": k5._plain(_segment("data", 1, "other-log"))}, context),
            ("decl-manifest-writer-mismatch", manifest, "manifest", opened,
             k5._AppendContext(_decl(manifest_writer="other"), frozenset({manifest, data}), (), True, True, manifest_segment=manifest)),
        ):
            with self.subTest(append=label):
                with patch.object(k5, "_read_bytes", side_effect=AssertionError("invalid append must stop before read")) as reader, \
                     patch.object(k5, "_append_bytes") as writer_port:
                    with self.assertRaises(NotImplementedError):
                        k5._append_with_context(target, event, writer, ctx)
                reader.assert_not_called(); writer_port.assert_not_called()

        key = _key()
        prior = [{"key_digest": _key_digest(key), "result_digest": D1}]
        one_digest = {"kind": "ResultConflictDetected", "key_digest": _key_digest(key), "result_digests": [D1]}
        with patch.object(k5, "_read_bytes", side_effect=AssertionError("invalid conflict must stop before read")), \
             patch.object(k5, "_append_bytes") as writer_port:
            with self.assertRaises(NotImplementedError):
                k5._append_with_context(data, one_digest, data.writer,
                    k5._AppendContext(decl, frozenset({manifest, data}), tuple(prior), True, True, manifest_segment=manifest))
        writer_port.assert_not_called()

        # Each required-key subfield remains the existing missing_key result
        # at the append boundary; no new reason is introduced.
        for label, mutate in (
            ("operation", lambda raw: raw["key"].pop("operation")),
            ("operation-version", lambda raw: raw["key"].pop("operation_version")),
            ("subject", lambda raw: raw["key"].pop("subject")),
            ("inputs", lambda raw: raw["key"].pop("inputs")),
            ("scope", lambda raw: raw["key"].pop("scope")),
        ):
            with self.subTest(missing_key_field=label):
                invalid = _recorded_event(key)
                mutate(invalid)
                with patch.object(k5, "_read_bytes", side_effect=AssertionError("missing key must stop before read")), \
                     patch.object(k5, "_append_bytes") as writer_port:
                    observed = k5._append_with_context(data, invalid, data.writer,
                        k5._AppendContext(decl, frozenset({manifest, data}), (), True, True, manifest_segment=manifest))
                self.assertIsInstance(observed, Rejected)
                self.assertEqual(observed.reason, "missing_key")
                writer_port.assert_not_called()
        for ref_role in ("subject", "input"):
            for field in ("kind", "identity", "revision", "digest"):
                with self.subTest(missing_ref_field=(ref_role, field)):
                    invalid_ref = _recorded_event(key)
                    if ref_role == "subject":
                        invalid_ref["key"]["subject"].pop(field)
                    else:
                        invalid_ref["key"]["inputs"] = [{
                            "kind": "ref", "identity": "source", "revision": "r1", "digest": D1,
                        }]
                        invalid_ref["key"]["inputs"][0].pop(field)
                    with patch.object(k5, "_read_bytes", side_effect=AssertionError("missing SubjectRef field must stop before read")), \
                         patch.object(k5, "_append_bytes") as writer_port:
                        missing_ref = k5._append_with_context(data, invalid_ref, data.writer,
                            k5._AppendContext(decl, frozenset({manifest, data}), (), True, True, manifest_segment=manifest))
                    self.assertIsInstance(missing_ref, Rejected)
                    self.assertEqual(missing_ref.reason, "missing_key")
                    writer_port.assert_not_called()

        noop_event = _recorded_event(key, _result_body())
        noop_records = ({"key_digest": noop_event["key_digest"], "result_digest": noop_event["result_digest"]},)
        with patch.object(k5, "_read_bytes", side_effect=AssertionError("noop must not read")), \
             patch.object(k5, "_append_bytes") as writer_port:
            noop = k5._append_with_context(data, noop_event, data.writer,
                k5._AppendContext(decl, frozenset({manifest, data}), noop_records, True, True, manifest_segment=manifest))
        self.assertIsInstance(noop, NoOp); writer_port.assert_not_called()

        # Missing manifest head and an unregistered declared scope segment
        # are separate existing Unknown(missing_input) branches.
        unopened_scope = k5.ScopeDecl("s", "r", "log", k5.SegmentHead(manifest, 0, "genesis"), (data,))
        with patch.object(k5, "_read_bytes", side_effect=AssertionError("missing manifest head must stop before read")):
            missing_manifest = k5._read_scope(unopened_scope, [])
        self.assertIsInstance(missing_manifest, Unknown)
        self.assertEqual(missing_manifest.reason, UnknownReason.MISSING_INPUT)
        self.assertEqual(missing_manifest.evidence, {"manifest_head": "missing"})

        empty_manifest_head = k5.SegmentHead(manifest, 0, "genesis")
        opened_scope = k5.ScopeDecl("s", "r", "log", empty_manifest_head, (data,))
        with patch.object(k5, "_read_bytes", return_value=b""):
            unregistered = k5._read_scope(opened_scope, [empty_manifest_head, k5.SegmentHead(data, 0, "genesis")])
        self.assertIsInstance(unregistered, Unknown)
        self.assertEqual(unregistered.reason, UnknownReason.MISSING_INPUT)
        self.assertEqual(unregistered.evidence, {"unregistered_scope_segment": True})

        # Bootstrap is not inferred from an empty manifest: the private
        # append preflight remains unmapped and performs no write.
        bootstrap_context = k5._AppendContext(decl, frozenset({data}), (), True, True, manifest_segment=manifest)
        with patch.object(k5, "_read_bytes", side_effect=AssertionError("bootstrap must stop before read")), \
             patch.object(k5, "_append_bytes") as bootstrap_writer:
            with self.assertRaises(NotImplementedError):
                k5._append_with_context(manifest, opened, manifest.writer, bootstrap_context)
        bootstrap_writer.assert_not_called()

    def test_ck_k5_ut_115_checkpoint_conflicts_share_existing_diagnostic(self):
        manifest, a, _, scope, me, _, _, mh, _, _ = _manifest_and_data((_segment("a", 2),))
        first = _chain(a, [_declared("first")])
        extended = _chain(a, [
            _declared("first"),
            {"kind": "Correction", "target": first[0].entry_digest,
             "reason": "restate", "replacement": _declared("first")},
        ])
        projector = k5.Projector("p", "1", D1)
        full_heads = (mh, _head(extended))
        blobs = {manifest: _bytes(me), a: _bytes(extended)}
        with patch.object(k5, "_read_bytes", side_effect=lambda segment: blobs.get(segment)):
            current = k5.project(projector, scope, full_heads)
        self.assertIsInstance(current, Value)
        projection = current.value
        good_checkpoint = k5.Checkpoint(projector, scope, full_heads, projection.output, projection.output_digest)

        # An old read-set may be a valid subset of the current fixed read-set.
        subset = replace(good_checkpoint, input_heads=(mh,))
        with patch.object(k5, "_read_bytes", side_effect=lambda segment: blobs.get(segment)):
            subset_result = k5.verify(projection, subset)
        self.assertIsInstance(subset_result, Value)

        bad_old = k5.SegmentHead(_segment("removed", 4), 1, D1)
        same_seq_different_digest = replace(_head(extended), entry_digest=D2)
        cases = (
            ("scope", replace(good_checkpoint, scope=replace(scope, revision="other"))),
            ("projector", replace(good_checkpoint, projector=replace(projector, version="2"))),
            ("old-key-not-subset", replace(good_checkpoint, input_heads=(mh, bad_old))),
            ("same-seq-digest", replace(good_checkpoint, input_heads=(mh, same_seq_different_digest))),
        )
        for label, checkpoint in cases:
            with self.subTest(checkpoint=label):
                with patch.object(k5, "_read_bytes", side_effect=lambda segment: blobs.get(segment)):
                    result = k5.verify(projection, checkpoint)
                self.assertIsInstance(result, Unknown)
                self.assertEqual(result.reason, UnknownReason.CONFLICT)
                self.assertEqual(result.evidence, {"checkpoint": "mismatch"})


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
