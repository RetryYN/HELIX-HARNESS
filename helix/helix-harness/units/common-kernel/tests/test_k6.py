"""K6 local receipt tests for implemented pure logic and synthetic owner seams.

Ten L8 cases remain outside this executable fixture count because their
signature/owner/consumer outcome is unmapped by the current contracts.
"""
from __future__ import annotations

from dataclasses import replace
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import common_kernel as k1  # noqa: E402
import verification as k6  # noqa: E402
import journal as k5  # noqa: E402

D1 = "sha256:" + "1" * 64
D2 = "sha256:" + "2" * 64
D3 = "sha256:" + "3" * 64


def _ref(identity: str, revision: str = "r1", digest: str = D1, kind: str = "contract"):
    return k1.SubjectRef(kind, identity, revision, digest)


def _base_key(*, subject: k1.SubjectRef | None = None, inputs: tuple[k1.SubjectRef, ...] | None = None):
    value = k1.key_of("op", "base-v1", subject or _ref("subject"), inputs if inputs is not None else (_ref("input", kind="input"),), "scope")
    assert isinstance(value, k1.ResultKey)
    return value


def _polarity(value):
    return k1.Polarity.POSITIVE if value is True else k1.Polarity.NEGATIVE


def _check_mapping(check_id: str):
    return k1.PolarityMapping("check:" + check_id, "v1", _polarity)


def _verifier(identity: str = "A", version: str = "v1", digest: str = D1):
    return k6.VerifierRef(identity, version, digest)


def _set_ref(revision: str = "r1", digest: str = D1):
    return _ref("set", revision, digest, "verifier_set")


def _check_key(base: k1.ResultKey, check_id: str):
    result = k1.key_of("check", "v1", _ref(check_id, kind="check"), (), base.scope)
    assert isinstance(result, k1.ResultKey)
    return result


def _entry(identity: str = "A", *, checks=("check",), deterministic=True, version="v1", digest=D1):
    return k6.VerifierEntry(
        _verifier(identity, version, digest),
        deterministic,
        {check: _check_mapping(check) for check in checks},
    )


def _snapshot(*entries: k6.VerifierEntry, required=None, ref=None):
    if required is None:
        required = {"op": tuple(entry.ref.identity for entry in entries)}
    return k6.VerifierSet(ref or _set_ref(), tuple(entries), required)


def _body(
    base: k1.ResultKey,
    entry: k6.VerifierEntry,
    set_ref: k1.SubjectRef,
    *,
    registered=None,
    evaluated=None,
    results=None,
    outputs=(),
):
    receipt_key = k6._derive_receipt_key(base, entry.ref, set_ref)
    assert isinstance(receipt_key, k1.ResultKey)
    registered = tuple(entry.checks) if registered is None else tuple(registered)
    evaluated = registered if evaluated is None else tuple(evaluated)
    results = dict(results or {})
    observations = []
    evaluated_set = set(evaluated)
    for check_id in registered:
        key = _check_key(base, check_id)
        if check_id not in evaluated_set:
            observation = k1.Unobserved(key, k1.UnobservedWhy.NOT_RUN)
        else:
            observation = results.get(check_id, k1.Value(True, key, {"check": check_id}))
        mapping = entry.checks.get(check_id)
        observations.append((observation, mapping) if mapping is not None and isinstance(observation, k1.Value) else observation)
    for check_id in evaluated:
        if check_id not in set(registered):
            key = _check_key(base, check_id)
            observations.append(k1.Unknown(k1.UnknownReason.UNREGISTERED, key, {"check": check_id}))
    inner = k1.combine(observations)
    assert isinstance(inner, k1.Combined)
    read = {base.subject.identity: base.subject.digest}
    read.update({ref.identity: ref.digest for ref in base.inputs if ref.kind not in {"verifier", "verifier_set"}})
    return k6.ReceiptBody(
        verifier=entry.ref,
        verifier_set=set_ref,
        key=receipt_key,
        read=read,
        execution=k6.Execution(D1, 0, tuple(outputs), "t1", "t2"),
        registry=k6.Registry(registered, evaluated),
        inner=inner,
    )


def _record(key: k1.ResultKey, body_or_value):
    observation = k1.Value(body_or_value, key, {"fixture": True})
    recorded = k1.record((), key, observation, "synthetic-k5-restored")
    assert isinstance(recorded, k1.Recorded)
    return recorded.record


def _fixture(entry=None, base=None, set_ref=None, **body_kwargs):
    entry = entry or _entry()
    base = base or _base_key()
    set_ref = set_ref or _set_ref()
    body = _body(base, entry, set_ref, **body_kwargs)
    record = _record(body.key, body)
    snapshot = _snapshot(entry, ref=set_ref)
    return base, entry, set_ref, body, record, snapshot


def _admit(body, record, base, snapshot, set_ref):
    current = k1.Value(snapshot, base, {"synthetic_owner_observation": True})
    reads = tuple(k1.Value(b"output", body.key, {"synthetic_reader_observation": True}) for _ in body.execution.outputs)
    return k6._admit_receipt_with_owner_observations(record, body.key, set_ref, current, reads)


IMPLEMENTED_L8_CASES = (
    "L8-K6-01-BASE",
    "L8-K6-01-SUBJECT-REV", "L8-K6-01-SUBJECT-DIGEST", "L8-K6-01-SET-REV",
    "L8-K6-01-SET-DIGEST", "L8-K6-01-VERIFIER-DIGEST", "L8-K6-01-VERIFIER-VERSION",
    "L8-K6-01-INPUT-ADD", "L8-K6-01-INPUT-REMOVE",
    "L8-K6-03-BASE", "L8-K6-03-UNREGISTERED-IDENTITY", "L8-K6-03-UNREGISTERED-VERSION",
    "L8-K6-03-UNREGISTERED-DIGEST",
    "L8-K6-05-OLD-QUERY-RECEIPT", "L8-K6-05-INPUT-BODY", "L8-K6-05-VERIFIER-SET-BODY",
    "L8-K6-06-BASE", "L8-K6-06-SUBJECT-MISSING", "L8-K6-06-INPUT-MISSING", "L8-K6-06-READ-EMPTY",
    "L8-K6-06-EXTRA-IDENTITY", "L8-K6-06-DIGEST-MISMATCH",
    "L8-K6-07-BASE", "L8-K6-07-BYTES-MUTATED", "L8-K6-07-OUTPUT-UNREADABLE",
    "L8-K6-08-BASE", "L8-K6-08-STORED-INNER-VERDICT", "L8-K6-08-UNREGISTERED-CHECK",
    "L8-K6-09-BASE", "L8-K6-09-NEGATIVE-AND-UNKNOWN", "L8-K6-09-UNEVALUATED",
    "L8-K6-09-REGISTERED-ZERO", "L8-K6-09-ALL-NOT-APPLICABLE",
    "L8-K6-10-A-RECEIPT-MISSING", "L8-K6-10-A-OLD-REVISION", "L8-K6-10-EXACT-PLUS-DIGEST-CONFLICT",
    "L8-K6-10-SAME-KEY-RESULT-CONFLICT", "L8-K6-10-SEGMENT-MISSING",
    "L8-K6-10-VERIFIER-VERSIONS-DIFFER", "L8-K6-10-C-NOT-SUBSTITUTE",
    "L8-K6-11-REPRODUCTION-MATCH", "L8-K6-11-FORGED-INNER", "L8-K6-11-NONDETERMINISTIC",
    "L8-K6-14-TIME-ORDER",
    "L8-K6-15-ASSURANCE-SEPARATE",
)


class K6ImplementedFixtures(unittest.TestCase):
    def _exercise(self, case: str):
        if case.startswith("L8-K6-01-"):
            self._lookup_case(case)
        elif case.startswith("L8-K6-03-"):
            self._member_case(case)
        elif case.startswith("L8-K6-05-"):
            self._body_case(case)
        elif case.startswith("L8-K6-06-"):
            self._read_case(case)
        elif case.startswith("L8-K6-07-"):
            self._fixed_ref_case(case)
        elif case.startswith("L8-K6-08-"):
            self._inner_case(case)
        elif case.startswith("L8-K6-09-"):
            self._required_case(case)
        elif case.startswith("L8-K6-10-"):
            self._required_lookup_case(case)
        elif case.startswith("L8-K6-11-"):
            self._reverify_case(case)
        elif case == "L8-K6-14-TIME-ORDER":
            self._time_order_case()
        elif case == "L8-K6-15-ASSURANCE-SEPARATE":
            self._assurance_separate_case()
        else:
            self.fail(f"fixture not explicitly implemented: {case}")

    def _lookup_case(self, case):
        base = _base_key()
        entry = _entry()
        set_ref = _set_ref()
        old_key = k6._derive_receipt_key(base, entry.ref, set_ref)
        self.assertIsInstance(old_key, k1.ResultKey)
        records = [_record(old_key, "old"), _record(old_key, "old")]
        self.assertIsInstance(k6._lookup_receipt(records[:1], old_key), k1.Value)
        query = old_key
        if case.endswith("SUBJECT-REV"):
            subject = replace(base.subject, revision="r2")
            query = k6._derive_receipt_key(_base_key(subject=subject), entry.ref, set_ref)
            self.assertIsInstance(k6._lookup_receipt(records[:1], query), k1.Stale)
        elif case.endswith("SUBJECT-DIGEST"):
            subject = replace(base.subject, digest=D2)
            query = k6._derive_receipt_key(_base_key(subject=subject), entry.ref, set_ref)
            result = k6._lookup_receipt(records[:1], query)
            self.assertIsInstance(result, k1.Unknown)
            self.assertEqual(result.reason, k1.UnknownReason.CONFLICT)
        elif case.endswith("SET-REV"):
            changed = replace(set_ref, revision="r2")
            query = k6._derive_receipt_key(base, entry.ref, changed)
            self.assertIsInstance(k6._lookup_receipt(records[:1], query), k1.Stale)
        elif case.endswith("SET-DIGEST"):
            changed = replace(set_ref, digest=D2)
            query = k6._derive_receipt_key(base, entry.ref, changed)
            result = k6._lookup_receipt(records[:1], query)
            self.assertIsInstance(result, k1.Unknown)
            self.assertEqual(result.reason, k1.UnknownReason.CONFLICT)
        elif case.endswith("VERIFIER-DIGEST"):
            changed = _verifier("A", "v1", D2)
            query = k6._derive_receipt_key(base, changed, set_ref)
            result = k6._lookup_receipt(records[:1], query)
            self.assertIsInstance(result, k1.Unknown)
            self.assertEqual(result.reason, k1.UnknownReason.CONFLICT)
        elif case.endswith("VERIFIER-VERSION"):
            changed = _verifier("A", "v2", D1)
            query = k6._derive_receipt_key(base, changed, set_ref)
            result = k6._lookup_receipt(records[:1], query)
            self.assertIsInstance(result, k1.Unobserved)
            self.assertEqual(result.why, k1.UnobservedWhy.NOT_RUN)
        elif case.endswith("INPUT-ADD"):
            changed = _base_key(inputs=(*base.inputs, _ref("input2", kind="input")))
            query = k6._derive_receipt_key(changed, entry.ref, set_ref)
            result = k6._lookup_receipt(records[:1], query)
            self.assertIsInstance(result, k1.Unobserved)
            self.assertEqual(result.why, k1.UnobservedWhy.NOT_RUN)
        elif case.endswith("INPUT-REMOVE"):
            changed = _base_key(inputs=())
            query = k6._derive_receipt_key(changed, entry.ref, set_ref)
            result = k6._lookup_receipt(records[:1], query)
            self.assertIsInstance(result, k1.Unobserved)
            self.assertEqual(result.why, k1.UnobservedWhy.NOT_RUN)
        else:
            self.assertIsInstance(k6._lookup_receipt(records[:1], query), k1.Value)

    def _member_case(self, case):
        base, entry, set_ref, _, _, snapshot = _fixture()
        self.assertIsInstance(k6._match_verifier_entry(entry.ref, snapshot, base), k1.Value)
        if case.endswith("UNREGISTERED-IDENTITY"):
            changed = replace(entry.ref, identity="other")
        elif case.endswith("UNREGISTERED-VERSION"):
            changed = replace(entry.ref, version="v2")
        elif case.endswith("UNREGISTERED-DIGEST"):
            changed = replace(entry.ref, digest=D2)
        else:
            return
        result = k6._match_verifier_entry(changed, snapshot, base)
        self.assertIsInstance(result, k1.Unknown)
        self.assertEqual(result.reason, k1.UnknownReason.UNREGISTERED)

    def _body_case(self, case):
        base, entry, set_ref, body, rec, snapshot = _fixture()
        valid = _admit(body, rec, base, snapshot, set_ref)
        self.assertIsInstance(valid, k1.Value)
        if case.endswith("OLD-QUERY-RECEIPT"):
            newer = _base_key(subject=replace(base.subject, revision="r2"))
            query = k6._derive_receipt_key(newer, entry.ref, set_ref)
            self.assertIsInstance(query, k1.ResultKey)
            result = k6._admit_receipt_with_owner_observations(
                rec, query, set_ref, k1.Value(snapshot, query, {"synthetic_owner_observation": True}), ()
            )
        elif case.endswith("INPUT-BODY"):
            body_key = replace(body.key, inputs=tuple(ref for ref in body.key.inputs if ref.kind != "input") + (_ref("other-input", kind="input"),))
            changed = replace(body, key=body_key)
            result = _admit(changed, _record(body.key, changed), base, snapshot, set_ref)
        else:
            changed = replace(body, verifier_set=replace(set_ref, revision="r2"))
            result = _admit(changed, _record(body.key, changed), base, snapshot, set_ref)
        self.assertIsInstance(result, k1.Unknown)
        self.assertEqual(result.reason, k1.UnknownReason.CONFLICT)

    def _read_case(self, case):
        base, entry, set_ref, body, _, _ = _fixture()
        self.assertIsInstance(k6._validate_read_set(body, body.key), k1.Value)
        read = dict(body.read)
        if case.endswith("SUBJECT-MISSING"):
            read.pop(base.subject.identity)
        elif case.endswith("INPUT-MISSING"):
            read.pop(base.inputs[0].identity)
        elif case.endswith("READ-EMPTY"):
            read = {}
        elif case.endswith("EXTRA-IDENTITY"):
            read["extra"] = D1
        elif case.endswith("DIGEST-MISMATCH"):
            read[base.inputs[0].identity] = D2
        else:
            return
        result = k6._validate_read_set(replace(body, read=read), body.key)
        self.assertIsInstance(result, k1.Unknown)
        self.assertEqual(result.reason, k1.UnknownReason.MISSING_INPUT if case.endswith(("SUBJECT-MISSING", "INPUT-MISSING", "READ-EMPTY")) else k1.UnknownReason.CONFLICT)

    def _fixed_ref_case(self, case):
        fixed = k5.FixedRef("repository", "output/0", k1._sha256_digest(b"output"))
        base, entry, set_ref, body, _, _ = _fixture(outputs=(fixed,))
        self.assertIsInstance(
            k6._verify_fixed_outputs((fixed,), body.key, (k1.Value(b"output", body.key, {"synthetic_reader_observation": True}),)),
            k1.Value,
        )
        if case.endswith("BYTES-MUTATED"):
            result = k6._verify_fixed_outputs((fixed,), body.key, (k1.Value(b"changed", body.key, {}),))
            self.assertIsInstance(result, k1.Unknown)
            self.assertEqual(result.reason, k1.UnknownReason.CONFLICT)
        elif case.endswith("OUTPUT-UNREADABLE"):
            result = k6._verify_fixed_outputs((fixed,), body.key, (k1.Unknown(k1.UnknownReason.UNREADABLE, body.key),))
            self.assertIsInstance(result, k1.Unknown)
            self.assertEqual(result.reason, k1.UnknownReason.UNREADABLE)

    def _inner_case(self, case):
        base, entry, set_ref, body, _, _ = _fixture()
        self.assertIsInstance(k6._rebuild_inner(body.registry, body.inner, entry, body.key), k1.Value)
        if case.endswith("STORED-INNER-VERDICT"):
            negative_body = _body(
                base,
                entry,
                set_ref,
                results={"check": k1.Value(False, _check_key(base, "check"), {"check": "check"})},
            )
            self.assertEqual(negative_body.inner.verdict, k1.Verdict.NEGATIVE)
            self.assertIsInstance(
                k6._rebuild_inner(negative_body.registry, negative_body.inner, entry, negative_body.key),
                k1.Value,
            )
            changed_inner = replace(negative_body.inner, verdict=k1.Verdict.POSITIVE)
            result = k6._rebuild_inner(negative_body.registry, changed_inner, entry, negative_body.key)
            self.assertIsInstance(result, k1.Unknown)
            self.assertEqual(result.reason, k1.UnknownReason.CONFLICT)
        elif case.endswith("UNREGISTERED-CHECK"):
            rogue_key = _check_key(base, "rogue")
            rogue = k1.Unknown(k1.UnknownReason.UNREGISTERED, rogue_key, {"check": "rogue"})
            expected = k1.combine([(body.inner.components[0], entry.checks["check"]), rogue])
            self.assertIsInstance(expected, k1.Combined)
            registry = k6.Registry(("check",), ("check", "rogue"))
            result = k6._rebuild_inner(registry, expected, entry, body.key)
            self.assertIsInstance(result, k1.Value)
            self.assertIsInstance(result.value.components[-1], k1.Unknown)
            self.assertEqual(result.value.components[-1].reason, k1.UnknownReason.UNREGISTERED)

    def _required_context(self, *, a_checks=("a1",), b_checks=("b1",), required=("A", "B")):
        base = _base_key()
        a = _entry("A", checks=a_checks)
        b = _entry("B", checks=b_checks)
        snapshot = _snapshot(a, b, required={"op": tuple(required)})
        records = []
        for entry in (a, b):
            if entry.ref.identity in required:
                body = _body(base, entry, snapshot.ref, registered=entry.checks.keys(), evaluated=entry.checks.keys())
                records.append(_record(body.key, body))
        return base, a, b, snapshot, records

    def _required_call(self, base, snapshot, records):
        reads = {verifier_id: () for verifier_id in snapshot.required_for.get("op", ())}
        return k6._required_from_owner_observations(
            "op",
            base,
            snapshot.ref,
            False,
            k1.Value(snapshot, base, {"synthetic_owner_observation": True}),
            k1.Value(tuple(records), base, {"complete_synthetic_restore_observation": True}),
            reads,
            {},
        )

    def _required_case(self, case):
        if case.endswith("NEGATIVE-AND-UNKNOWN"):
            base, a, b, snapshot, records = self._required_context(a_checks=("a1", "a2"))
            a_body = _body(base, a, snapshot.ref, registered=("a1", "a2"), evaluated=("a1", "a2"), results={
                "a1": k1.Value(False, _check_key(base, "a1"), {"check": "a1"}),
                "a2": k1.Unknown(k1.UnknownReason.UNREADABLE, _check_key(base, "a2")),
            })
            records = [_record(a_body.key, a_body), records[1]]
        elif case.endswith("UNEVALUATED"):
            base, a, b, snapshot, records = self._required_context(a_checks=("a1", "a2"))
            a_body = _body(base, a, snapshot.ref, registered=("a1", "a2"), evaluated=("a1",))
            records = [_record(a_body.key, a_body), records[1]]
        elif case.endswith("REGISTERED-ZERO"):
            base, a, b, snapshot, records = self._required_context(a_checks=())
            a_body = _body(base, a, snapshot.ref, registered=(), evaluated=())
            records = [_record(a_body.key, a_body), records[1]]
        elif case.endswith("ALL-NOT-APPLICABLE"):
            base, a, b, snapshot, records = self._required_context(a_checks=("a1", "a2"))
            na = {cid: k1.NotApplicable("outside_scope", "owner", "reentry", _check_key(base, cid)) for cid in ("a1", "a2")}
            a_body = _body(base, a, snapshot.ref, registered=("a1", "a2"), evaluated=("a1", "a2"), results=na)
            records = [_record(a_body.key, a_body), records[1]]
        else:
            base, a, b, snapshot, records = self._required_context()
        baseline_base, _, _, baseline_snapshot, baseline_records = self._required_context()
        baseline = self._required_call(baseline_base, baseline_snapshot, baseline_records)
        self.assertIsInstance(baseline.combined, k1.Combined)
        if case.endswith("BASE"):
            self.assertEqual(baseline.combined.verdict, k1.Verdict.POSITIVE)
            self.assertEqual(set(baseline.assurance), {"A", "B"})
            self.assertEqual(len(baseline.combined.components), 2)
            self.assertEqual(
                [item.key.subject.identity for item in baseline.combined.components],
                ["a1", "b1"],
            )
            self.assertEqual(
                [item.key.operation for item in baseline.combined.components],
                ["check", "check"],
            )
            return
        result = self._required_call(base, snapshot, records)
        if case.endswith("NEGATIVE-AND-UNKNOWN"):
            self.assertEqual(result.combined.verdict, k1.Verdict.NEGATIVE)
            self.assertEqual(result.combined.negatives, (0,))
            self.assertEqual(result.combined.non_values, (1,))
            self.assertEqual([item.key.subject.identity for item in result.combined.components], ["a1", "a2", "b1"])
            self.assertEqual([item.key.operation for item in result.combined.components], ["check"] * 3)
        elif case.endswith("UNEVALUATED"):
            self.assertEqual(result.combined.verdict, k1.Verdict.UNDETERMINED)
            self.assertEqual([item.key.subject.identity for item in result.combined.components], ["a1", "a2", "b1"])
            self.assertIsInstance(result.combined.components[1], k1.Unobserved)
            self.assertEqual(result.combined.components[1].why, k1.UnobservedWhy.NOT_RUN)
        else:
            self.assertEqual(result.combined.verdict, k1.Verdict.UNDETERMINED)
            self.assertTrue(any(isinstance(item, k1.Unknown) and item.reason == k1.UnknownReason.MISSING_INPUT for item in result.combined.components))

    def _required_context_records(self, base, snapshot):
        result = []
        for entry in snapshot.members:
            if entry.ref.identity in snapshot.required_for.get("op", ()):
                body = _body(base, entry, snapshot.ref, registered=tuple(entry.checks), evaluated=tuple(entry.checks))
                result.append(_record(body.key, body))
        return result

    def _required_lookup_case(self, case):
        if case.endswith("VERIFIER-VERSIONS-DIFFER"):
            base = _base_key()
            a, b = _entry("A", version="v1"), _entry("B", version="v2")
            snapshot = _snapshot(a, b, required={"op": ("A", "B")})
            records = [_record((body := _body(base, e, snapshot.ref)).key, body) for e in (a, b)]
            result = self._required_call(base, snapshot, records)
            self.assertEqual(result.combined.verdict, k1.Verdict.POSITIVE)
            self.assertEqual(set(result.assurance), {"A", "B"})
            return

        base, a, b, snapshot, records = self._required_context()
        baseline_records = self._required_context_records(base, snapshot)
        baseline = self._required_call(base, snapshot, baseline_records)
        self.assertEqual(baseline.combined.verdict, k1.Verdict.POSITIVE)
        if case.endswith("A-RECEIPT-MISSING"):
            records = [records[1]]
            result = self._required_call(base, snapshot, records)
            self.assertTrue(any(isinstance(item, k1.Unobserved) and item.why == k1.UnobservedWhy.NOT_RUN for item in result.combined.components))
        elif case.endswith("A-OLD-REVISION"):
            oldbase = _base_key(subject=replace(base.subject, revision="r0"))
            oldbody = _body(oldbase, a, snapshot.ref)
            result = self._required_call(base, snapshot, [_record(oldbody.key, oldbody), records[1]])
            self.assertTrue(any(isinstance(item, k1.Stale) for item in result.combined.components))
        elif case.endswith("EXACT-PLUS-DIGEST-CONFLICT"):
            body_a = _body(base, a, snapshot.ref)
            changed_subject = replace(body_a.key.subject, digest=D2)
            changed_key = k1.key_of(body_a.key.operation, body_a.key.operation_version, changed_subject, body_a.key.inputs, body_a.key.scope)
            self.assertIsInstance(changed_key, k1.ResultKey)
            changed_body = replace(body_a, key=changed_key)
            result = self._required_call(base, snapshot, [_record(body_a.key, body_a), _record(changed_key, changed_body), records[1]])
            self.assertTrue(any(isinstance(item, k1.Unknown) and item.reason == k1.UnknownReason.CONFLICT for item in result.combined.components))
        elif case.endswith("SAME-KEY-RESULT-CONFLICT"):
            body_a = _body(base, a, snapshot.ref)
            changed_body = replace(body_a, execution=replace(body_a.execution, completed="t3"))
            result = self._required_call(base, snapshot, [_record(body_a.key, body_a), _record(body_a.key, changed_body), records[1]])
            self.assertTrue(any(isinstance(item, k1.Unknown) and item.reason == k1.UnknownReason.CONFLICT for item in result.combined.components))
        elif case.endswith("SEGMENT-MISSING"):
            result = k6._required_from_owner_observations(
                "op",
                base,
                snapshot.ref,
                False,
                k1.Value(snapshot, base, {"synthetic_owner_observation": True}),
                k1.Unknown(k1.UnknownReason.MISSING_INPUT, base, {"missing": "segment"}),
                {"A": (), "B": ()},
                {},
            )
            missing = [item for item in result.combined.components if isinstance(item, k1.Unknown)]
            self.assertEqual(len(missing), 2)
            self.assertTrue(all(item.reason == k1.UnknownReason.MISSING_INPUT for item in missing))
        else:  # C cannot fill either required A or B
            c = _entry("C")
            cbody = _body(base, c, snapshot.ref)
            result = self._required_call(base, snapshot, [_record(cbody.key, cbody)])
            missing = [item for item in result.combined.components if isinstance(item, k1.Unobserved)]
            self.assertEqual(len(missing), 2)

    def _reverify_case(self, case):
        base, entry, set_ref, body, _, _ = _fixture()
        admitted = k6.AdmittedReceipt(body, entry.deterministic, k1.Unobserved(body.key, k1.UnobservedWhy.NOT_RUN), k1.Unknown(k1.UnknownReason.UNSUPPORTED, body.key))
        if case.endswith("NONDETERMINISTIC"):
            changed = replace(admitted, reverifiable=False)
            result = k6._reverify_with_execution_observation(changed, k1.Unobserved(body.key, k1.UnobservedWhy.NOT_RUN))
            self.assertIsInstance(result, k1.Value)
            self.assertIsInstance(result.value.reproduction, k1.Unknown)
            self.assertEqual(result.value.reproduction.reason, k1.UnknownReason.UNSUPPORTED)
            return
        baseline = k6._reverify_with_execution_observation(
            admitted, k1.Value(body.inner, body.key, {"synthetic_executor_observation": True})
        )
        self.assertIsInstance(baseline, k1.Value)
        self.assertIsInstance(baseline.value.reproduction, k1.Value)
        if case.endswith("FORGED-INNER"):
            forged = replace(body.inner, verdict=k1.Verdict.NEGATIVE)
            result = k6._reverify_with_execution_observation(
                admitted, k1.Value(forged, body.key, {"synthetic_executor_observation": True})
            )
            self.assertIsInstance(result.value.reproduction, k1.Unknown)
            self.assertEqual(result.value.reproduction.reason, k1.UnknownReason.CONFLICT)

    def _time_order_case(self):
        base = _base_key(subject=_ref("subject", "r3"))
        entry = _entry()
        set_ref = _set_ref()
        old1 = _base_key(subject=_ref("subject", "r1"))
        old2 = _base_key(subject=_ref("subject", "r2"))
        key1 = k6._derive_receipt_key(old1, entry.ref, set_ref)
        key2 = k6._derive_receipt_key(old2, entry.ref, set_ref)
        query = k6._derive_receipt_key(base, entry.ref, set_ref)
        body1 = _body(old1, entry, set_ref)
        body2 = _body(old2, entry, set_ref)
        self.assertEqual((body1.key, body2.key), (key1, key2))
        # K5 order is r1 then r2 while timestamps say r1 completed later.
        body1 = replace(body1, execution=replace(body1.execution, started="t5", completed="t6"))
        body2 = replace(body2, execution=replace(body2.execution, started="t1", completed="t2"))
        records = [_record(key1, body1), _record(key2, body2)]
        baseline = k6._lookup_receipt(records, query)
        self.assertIsInstance(baseline, k1.Stale)
        self.assertEqual(baseline.prior.value.key.subject.revision, "r2")
        self.assertEqual(baseline.prior.value.execution.completed, "t2")
        # Reverse only the timestamps while preserving exact K5 append order and valid record digests.
        reversed_body1 = replace(body1, execution=replace(body1.execution, started="t1", completed="t2"))
        reversed_body2 = replace(body2, execution=replace(body2.execution, started="t5", completed="t6"))
        reversed_records = [_record(key1, reversed_body1), _record(key2, reversed_body2)]
        changed = k6._lookup_receipt(reversed_records, query)
        self.assertIsInstance(changed, k1.Stale)
        self.assertEqual(changed.prior.value.key.subject.revision, "r2")
        self.assertEqual(changed.prior.value.execution.completed, "t6")

    def _assurance_separate_case(self):
        base = _base_key()
        a = _entry("A", checks=("a1",), deterministic=False)
        b = _entry("B", checks=("b1",), deterministic=True)
        snapshot = _snapshot(a, b, required={"op": ("A", "B")})
        records = []
        executions = {}
        for entry in (a, b):
            body = _body(base, entry, snapshot.ref)
            records.append(_record(body.key, body))
            executions[entry.ref.identity] = k1.Value(
                body.inner, body.key, {"synthetic_executor_observation": True}
            )

        result = k6._required_from_owner_observations(
            "op",
            base,
            snapshot.ref,
            True,
            k1.Value(snapshot, base, {"synthetic_owner_observation": True}),
            k1.Value(tuple(records), base, {"complete_synthetic_restore_observation": True}),
            {"A": (), "B": ()},
            executions,
        )

        self.assertEqual(result.combined.verdict, k1.Verdict.POSITIVE)
        self.assertEqual(tuple(result.assurance), ("A", "B"))
        self.assertIsInstance(result.assurance["A"].reproduction, k1.Unknown)
        self.assertEqual(result.assurance["A"].reproduction.reason, k1.UnknownReason.UNSUPPORTED)
        self.assertIsInstance(result.assurance["B"].reproduction, k1.Value)
        self.assertTrue(result.assurance["B"].reproduction.value)
        for assurance in result.assurance.values():
            self.assertIsInstance(assurance.issuer_authenticity, k1.Unknown)
            self.assertEqual(assurance.issuer_authenticity.reason, k1.UnknownReason.UNSUPPORTED)

    def test_missing_owner_polarity_keeps_component_key_and_nonpositive(self):
        base, entry, _, body, _, _ = _fixture()
        owner_without_mapping = replace(entry, checks={})
        admitted = k6.AdmittedReceipt(
            body,
            True,
            k1.Unobserved(body.key, k1.UnobservedWhy.NOT_RUN),
            k1.Unknown(k1.UnknownReason.UNSUPPORTED, body.key),
        )
        components = k6._inner_components(admitted, owner_without_mapping, body.key)
        self.assertEqual(len(components), 1)
        component = components[0]
        self.assertIsInstance(component, k1.Unknown)
        self.assertEqual(component.reason, k1.UnknownReason.MISSING_INPUT)
        self.assertEqual(component.key, body.inner.components[0].key)
        combined = k1.combine(components)
        self.assertIsInstance(combined, k1.Combined)
        self.assertEqual(combined.verdict, k1.Verdict.UNDETERMINED)
        self.assertEqual(combined.components[0].key, body.inner.components[0].key)

    def test_restored_record_metadata_is_not_synthesized(self):
        """Regression beyond the fixed 55 L8 fixtures: retain K5 record bytes."""
        base, a, _, snapshot, records = self._required_context()
        source = records[0]
        original = k6._admit_receipt_with_owner_observations
        seen = []

        def capture(record, query_key, verifier_set, current_set, fixed_output_reads):
            seen.append(record)
            return original(record, query_key, verifier_set, current_set, fixed_output_reads)

        with patch.object(k6, "_admit_receipt_with_owner_observations", side_effect=capture):
            result = self._required_call(base, snapshot, records)
        self.assertEqual(result.combined.verdict, k1.Verdict.POSITIVE)
        self.assertIs(seen[0], source)
        self.assertEqual(seen[0].result_digest, source.result_digest)
        self.assertEqual(seen[0].producer, source.producer)

    def test_result_record_digest_mutation_is_rejected_as_conflict(self):
        base, entry, set_ref, body, record, snapshot = _fixture()
        self.assertIsInstance(_admit(body, record, base, snapshot, set_ref), k1.Value)
        altered = replace(record, result_digest="sha256:" + "f" * 64)
        result = _admit(body, altered, base, snapshot, set_ref)
        self.assertIsInstance(result, k1.Unknown)
        self.assertEqual(result.reason, k1.UnknownReason.CONFLICT)

    def test_unconnected_public_owner_bound_apis_are_not_exposed(self):
        for name in ("run", "admit_receipt", "required", "reverify"):
            with self.subTest(name=name):
                self.assertFalse(hasattr(k6, name))

    def test_same_check_identity_across_verifiers_has_no_namespace_carrier(self):
        """Regression documenting the existing K1 component boundary, not K6-I7 completion."""
        base, _, _, snapshot, records = self._required_context(
            a_checks=("shared",), b_checks=("shared",)
        )
        result = self._required_call(base, snapshot, records)

        self.assertEqual(result.combined.verdict, k1.Verdict.POSITIVE)
        self.assertEqual(set(result.assurance), {"A", "B"})
        self.assertEqual(len(result.combined.components), 2)
        first, second = result.combined.components
        self.assertEqual(first.key, second.key)
        self.assertFalse(hasattr(first, "verifier"))
        self.assertFalse(hasattr(first, "check_id"))


def _install_case(case_id: str, ut_number: int):
    def test_case(self):
        self._exercise(case_id)
    test_case.__name__ = f"test_ck_k6_ut_{ut_number:03d}"
    test_case.__doc__ = f"Implements the fixed {case_id} L8 fixture as a single test."
    setattr(K6ImplementedFixtures, test_case.__name__, test_case)


IMPLEMENTED_UT_NUMBERS = (
    *range(1, 10),
    *range(14, 18),
    *range(20, 50),
    53,
    55,
)
assert len(IMPLEMENTED_L8_CASES) == len(IMPLEMENTED_UT_NUMBERS) == 45

for _case_id, _ut_number in zip(IMPLEMENTED_L8_CASES, IMPLEMENTED_UT_NUMBERS):
    _install_case(_case_id, _ut_number)


if __name__ == "__main__":
    unittest.main()
