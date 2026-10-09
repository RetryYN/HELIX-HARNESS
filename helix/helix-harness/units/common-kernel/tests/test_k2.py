"""L7 K2 fixtures. Owner/K5/K6 stubs are not primary K2 callables.

Owner-boundary fixtures: UT-021a models owner key-input preparation and
UT-021c models the K6 binding/raw-source handoff. Primary K2 API coverage calls
key_of, lookup, or record; codec/construction helper tests are supplemental
private-boundary checks.
"""

from __future__ import annotations

from dataclasses import replace
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from common_kernel import (  # noqa: E402
    Conflict,
    NoOp,
    NotApplicable,
    Polarity,
    PolarityMapping,
    Recorded,
    Rejected,
    ResultKey,
    ResultRecord,
    Stale,
    SubjectRef,
    Unknown,
    Unobserved,
    Value,
    _bind_alias_inputs,
    _canonical_json_bytes,
    combine,
    key_of,
    lookup,
    record,
    _sha256_digest,
)

D1 = "sha256:" + "1" * 64
D2 = "sha256:" + "2" * 64
D3 = "sha256:" + "3" * 64


def ref(identity: str, revision: str = "r1", digest: str = D1, kind: str = "contract") -> SubjectRef:
    return SubjectRef(kind, identity, revision, digest)


def make_key(
    subject: SubjectRef | None = None,
    inputs: tuple[SubjectRef, ...] = (),
    operation: str = "op",
    operation_version: str = "v1",
    scope: str = "scope",
) -> ResultKey:
    return ResultKey(operation, operation_version, subject or ref("subject"), inputs, scope)


def observed_for(result: object, result_key: ResultKey):
    if isinstance(result, tuple) and result[0] == "unknown":
        return Unknown(result[1], result_key)
    if isinstance(result, tuple) and result[0] == "not_observed":
        return Unobserved(result_key, result[1])
    if isinstance(result, tuple) and result[0] == "n_a":
        return NotApplicable("reason", "authority", "trigger", result_key)
    return Value(result, result_key, {"evidence": "fixture"})


def record_for(result_key: ResultKey, result: object, result_digest: str | None = None, producer: str = "p"):
    observed = observed_for(result, result_key)
    digest = result_digest or _sha256_digest(_canonical_json_bytes({"fixture": result}))
    # For lookup fixtures, a stable digest is enough to model a complete K5 restore.
    key_digest = _sha256_digest(_canonical_json_bytes({"key": repr(result_key)}))
    return ResultRecord(result_key, key_digest, observed, digest, producer)


def positive_value(_: object) -> Polarity:
    return Polarity.POSITIVE


positive = PolarityMapping("test.positive", "1", positive_value)


class K2UnitTests(unittest.TestCase):
    def test_CK_K2_UT_001_VALUE(self) -> None:
        k = make_key()
        stored = record_for(k, "value")
        self.assertEqual(lookup([stored], k), stored.result)
        self.assertIsInstance(lookup([stored], k), Value)

    def test_CK_K2_UT_001_UNKNOWN(self) -> None:
        k = make_key()
        stored = record_for(k, ("unknown", "unreadable"))
        self.assertEqual(lookup([stored], k), stored.result)
        self.assertIsInstance(lookup([stored], k), Unknown)

    def test_CK_K2_UT_001_UNOBSERVED(self) -> None:
        k = make_key()
        stored = record_for(k, ("not_observed", "not_run"))
        self.assertEqual(lookup([stored], k), stored.result)
        self.assertIsInstance(lookup([stored], k), Unobserved)

    def test_CK_K2_UT_001_NOT_APPLICABLE(self) -> None:
        k = make_key()
        stored = record_for(k, ("n_a",))
        self.assertEqual(lookup([stored], k), stored.result)
        self.assertIsInstance(lookup([stored], k), NotApplicable)

    def test_CK_K2_UT_002_old_value_revision_and_digest_updates(self) -> None:
        positions = [
            ("subject", "subject"),
            ("oracle", "oracle"),
            ("contract", "contract"),
            ("config", "config"),
        ]
        for label, identity in positions:
            with self.subTest(position=label):
                old_subject = ref("subject")
                old_inputs = (ref(identity),) if identity != "subject" else ()
                new_subject = ref("subject", "r2", D2) if identity == "subject" else old_subject
                new_inputs = (ref(identity, "r2", D2),) if identity != "subject" else old_inputs
                old_key = make_key(old_subject, old_inputs)
                current = make_key(new_subject, new_inputs)
                self.assertIsInstance(lookup([record_for(old_key, "old")], current), Stale)

    def test_CK_K2_UT_003_old_nonvalues_supersede(self) -> None:
        for prior in (("unknown", "unreadable"), ("not_observed", "not_run"), ("n_a",)):
            with self.subTest(prior=prior):
                old = make_key(ref("subject", "r1", D1))
                current = make_key(ref("subject", "r2", D2))
                result = lookup([record_for(old, prior)], current)
                self.assertIsInstance(result, Unobserved)
                self.assertEqual(result.why, "not_run")
                self.assertEqual(result.superseded, record_for(old, prior).key_digest)

    def test_CK_K2_UT_004_same_revision_digest_conflict_all_positions(self) -> None:
        for position in ("subject", "oracle", "contract", "config"):
            with self.subTest(position=position):
                if position == "subject":
                    current = make_key(ref("subject", "r1", D2))
                    old = make_key(ref("subject", "r1", D1))
                else:
                    current = make_key(inputs=(ref(position, "r1", D2),))
                    old = make_key(inputs=(ref(position, "r1", D1),))
                self.assertEqual(lookup([record_for(old, "old")], current).reason, "conflict")

    def test_CK_K2_UT_005_conflict_precedes_stale(self) -> None:
        old = make_key(
            ref("subject"),
            (ref("a", "r1", D1), ref("b", "r1", D1)),
        )
        query = make_key(
            ref("subject"),
            (ref("a", "r2", D2), ref("b", "r1", D2)),
        )
        self.assertEqual(lookup([record_for(old, "old")], query).reason, "conflict")

    def test_CK_K2_UT_006_revision_only_change_is_stale(self) -> None:
        old = make_key(ref("subject", "r1", D1))
        query = make_key(ref("subject", "r2", D1))
        self.assertIsInstance(lookup([record_for(old, "old")], query), Stale)

    def test_CK_K2_UT_007_whitespace_revision_is_stale(self) -> None:
        old = make_key(ref("source", "r1", D1))
        query = make_key(ref("source", "r2", D2))
        self.assertIsInstance(lookup([record_for(old, "body ")], query), Stale)

    def test_CK_K2_UT_008_operation_version_scope_are_separate_questions(self) -> None:
        base = make_key()
        stored = record_for(base, "value")
        variants = [
            replace(base, operation="other"),
            replace(base, operation_version="v2"),
            replace(base, scope="other"),
        ]
        for query in variants:
            with self.subTest(query=query):
                result = lookup([stored], query)
                self.assertEqual(result, Unobserved(query, "not_run"))

    def test_CK_K2_UT_009_identity_set_add_remove(self) -> None:
        one = make_key(inputs=(ref("in1"),))
        two = make_key(inputs=(ref("in1"), ref("in2")))
        stored = record_for(one, "value")
        self.assertIsInstance(lookup([stored], two), Unobserved)
        self.assertIsInstance(lookup([record_for(two, "value")], one), Unobserved)

    def test_CK_K2_UT_010_lookup_does_not_mutate_records(self) -> None:
        old = make_key(ref("subject", "r1", D1))
        query = make_key(ref("subject", "r2", D2))
        records = [record_for(old, "value")]
        before = tuple(
            (item.key, item.key_digest, item.result, item.result_digest, item.producer)
            for item in records
        )
        self.assertIsInstance(lookup(records, query), Stale)
        after = tuple(
            (item.key, item.key_digest, item.result, item.result_digest, item.producer)
            for item in records
        )
        self.assertEqual(after, before)

    def test_CK_K2_UT_011_noop_conflict_and_stale_record_priority(self) -> None:
        k = make_key()
        first = record([], k, Value("x", k, {"evidence": "e"}), "p")
        self.assertIsInstance(first, Recorded)
        same = record([first.record], k, Value("x", k, {"evidence": "e"}), "p")
        self.assertIsInstance(same, NoOp)
        changed = record([first.record], k, Value("y", k, {"evidence": "e"}), "p")
        self.assertIsInstance(changed, Conflict)
        self.assertEqual(len(changed.records), 2)
        self.assertNotEqual(changed.records[0].result_digest, changed.records[1].result_digest)
        self.assertEqual(lookup(changed.records, k).reason, "conflict")
        stale = Stale(Value("x", k, {"evidence": "e"}), k, make_key(ref("subject", "r2", D2)))
        self.assertEqual(record([], None, stale, "p"), Rejected("stale_not_recordable"))

    def test_CK_K2_UT_012_old_revision_is_never_current_value(self) -> None:
        old = make_key(ref("subject", "r1", D1))
        current = make_key(ref("subject", "r2", D2))
        self.assertIsInstance(lookup([record_for(old, "old")], current), Stale)

    def test_CK_K2_UT_013_digest_format_validation_order(self) -> None:
        valid = ref("subject")
        self.assertIsInstance(key_of("op", "v1", valid, (), "scope"), ResultKey)
        self.assertEqual(key_of("op", "v1", replace(valid, digest="1" * 64), (), "scope"), Rejected("invalid_digest"))
        self.assertEqual(key_of("op", "v1", replace(valid, digest="sha256:" + "1" * 63), (), "scope"), Rejected("invalid_digest"))
        self.assertEqual(key_of("op", "v1", replace(valid, digest="a" * 40), (), "scope"), Rejected("invalid_digest"))
        self.assertEqual(key_of(None, "v1", replace(valid, digest="bad"), (), "scope"), Rejected("missing_key"))
        duplicate_bad_digest = (ref("dup", digest=D1), ref("dup", digest="bad"))
        self.assertEqual(key_of("op", "v1", valid, duplicate_bad_digest, "scope"), Rejected("invalid_digest"))

    def test_CK_K2_UT_014_layer_versions_stay_independent(self) -> None:
        pack_v1 = ref("pack", "v1", D1)
        pack_v2 = ref("pack", "v2", D2)
        release = ref("release-unit", "v1", D1)
        product = ref("integrated-product", "v3", D3)
        stage = ref("stage", "v4", D2)
        before = key_of("verify", "1", pack_v1, (release, product, stage), "scope")
        after = key_of("verify", "1", pack_v2, (release, product, stage), "scope")
        self.assertIsInstance(before, ResultKey)
        self.assertIsInstance(after, ResultKey)
        self.assertEqual(before.subject, pack_v1)
        self.assertEqual(after.subject, pack_v2)
        self.assertEqual(after.inputs, before.inputs)
        self.assertEqual(after.inputs, tuple(sorted((release, product, stage), key=lambda item: item.identity)))

    def test_CK_K2_UT_015_input_order_and_duplicate_identity(self) -> None:
        left, right = ref("a"), ref("b")
        first = key_of("op", "v1", ref("subject"), (left, right), "scope")
        reverse = key_of("op", "v1", ref("subject"), (right, left), "scope")
        self.assertEqual(first, reverse)
        self.assertEqual(
            key_of("op", "v1", ref("subject"), (left, replace(left, revision="r2")), "scope"),
            Rejected("duplicate_identity"),
        )

    def test_CK_K2_UT_016_kind_mismatch_subject_and_input(self) -> None:
        subject_query = make_key(ref("subject", kind="other"))
        subject_record = record_for(make_key(ref("subject", kind="contract")), "x")
        input_query = make_key(inputs=(ref("in", kind="other"),))
        input_record = record_for(make_key(inputs=(ref("in", kind="contract"),)), "x")
        self.assertEqual(lookup([subject_record], subject_query).reason, "conflict")
        self.assertEqual(lookup([input_record], input_query).reason, "conflict")

    def test_CK_K2_UT_017_identity_change_has_no_candidate(self) -> None:
        query_subject = make_key(ref("different"))
        query_input = make_key(inputs=(ref("in2"),))
        self.assertIsInstance(lookup([record_for(make_key(ref("subject")), "x")], query_subject), Unobserved)
        self.assertIsInstance(lookup([record_for(make_key(inputs=(ref("in1"),)), "x")], query_input), Unobserved)

    def test_CK_K2_UT_018_exact_match_beats_old_append_position(self) -> None:
        old_value_key = make_key(ref("subject", "r1", D1))
        exact_key = make_key(ref("subject", "r2", D2))
        exact = record_for(exact_key, "exact")
        for old_value in (record_for(old_value_key, "old"), record_for(old_value_key, ("unknown", "unreadable"))):
            self.assertEqual(lookup([exact, old_value], exact_key), exact.result)

    def test_CK_K2_UT_019_exact_plus_same_revision_conflict(self) -> None:
        exact_key = make_key(ref("subject", "r1", D1))
        conflicting_key = make_key(ref("subject", "r1", D2))
        self.assertEqual(
            lookup([record_for(exact_key, "exact"), record_for(conflicting_key, "other")], exact_key).reason,
            "conflict",
        )

    def test_CK_K2_UT_020_last_prior_respects_sequence(self) -> None:
        r0 = make_key(ref("subject", "r0", D1))
        r1 = make_key(ref("subject", "r1", D2))
        r2 = make_key(ref("subject", "r2", D3))
        zero, one = record_for(r0, "zero"), record_for(r1, "one")
        self.assertEqual(lookup([zero, one], r2).recorded_key, r1)
        self.assertEqual(lookup([one, zero], r2).recorded_key, r0)
        prior_nonvalue = record_for(r1, ("unknown", "unreadable"))
        superseded = lookup([zero, prior_nonvalue], r2)
        self.assertIsInstance(superseded, Unobserved)
        self.assertEqual(superseded.superseded, prior_nonvalue.key_digest)

    def test_CK_K2_UT_021_alias_binding_dedup_conflict_and_handoff(self) -> None:
        raw = ref("source", "r1", D1)
        alias = ref("side-left|role-input|source", "r1", D1, "role-alias")
        item = ({"side": "left"}, "input", raw, alias)
        binding = _bind_alias_inputs([item], "binding", "owner-map", "owner-r1")
        self.assertEqual(binding.aliases[0].raw_ref, raw)
        self.assertEqual(binding.aliases[0].alias_ref.digest, raw.digest)
        self.assertEqual(binding.inputs[0], binding.binding_ref)
        self.assertEqual(len(_bind_alias_inputs([item, item], "binding", "owner-map").aliases), 1)

        changed_raw = ref("source", "r2", D1)
        self.assertEqual(
            _bind_alias_inputs([item, ({"side": "left"}, "input", changed_raw, alias)], "binding", "owner-map"),
            Rejected("missing_key"),
        )
        self.assertEqual(
            _bind_alias_inputs([item, ({"side": "right"}, "input", raw, alias)], "binding", "owner-map"),
            Rejected("missing_key"),
        )
        digest_mismatch = ref("source", "r1", D2)
        self.assertEqual(
            _bind_alias_inputs(
                [({"side": "left"}, "input", digest_mismatch, alias)],
                "binding", "owner-map",
            ),
            Rejected("missing_key"),
        )

        # The boundary is a local K6 stub: binding and raw source buffers are
        # checked independently, without adding a K2 reader or receipt API.
        class StubReader:
            def read_binding(self, buffer: bytes, expected: SubjectRef) -> bool:
                return _sha256_digest(buffer) == expected.digest

            def observe_alias(self, buffer: bytes, expected: SubjectRef, key_ref: ResultKey):
                if _sha256_digest(buffer) != expected.digest:
                    return Unknown("conflict", key_ref)
                return Value(buffer, key_ref, {"stub_read": True})

        reader = StubReader()
        binding_ref = replace(binding.binding_ref, digest=_sha256_digest(binding.canonical_bytes))
        self.assertTrue(reader.read_binding(binding.canonical_bytes, binding_ref))
        self.assertEqual(reader.observe_alias(b"wrong", alias, make_key()), Unknown("conflict", make_key()))

    def test_CK_K2_UT_021a_missing_binding_input(self) -> None:
        raw = ref("source")
        alias = ref("side-left|input|source", "r1", D1, "role-alias")
        binding = _bind_alias_inputs([({"side": "left"}, "input", raw, alias)], "binding", "owner-map")

        def owner_key(binding_ref: SubjectRef | None, alias_refs: tuple[SubjectRef, ...]):
            # This owner boundary knows its required binding identity; K2 does
            # not infer a global required-input rule for all ResultKeys.
            if binding_ref is None:
                return Rejected("missing_key")
            return key_of("op", "v1", ref("subject"), (binding_ref, *alias_refs), "scope")

        self.assertIsInstance(binding, object)
        valid = owner_key(binding.binding_ref, (alias,))
        self.assertIsInstance(valid, ResultKey)
        self.assertEqual(owner_key(None, (alias,)), Rejected("missing_key"))

    def test_CK_K2_UT_021d_alias_revision_change_stales_lookup(self) -> None:
        first = _bind_alias_inputs(
            [({"side": "left"}, "input", ref("source", "r1", D1), ref("alias", "r1", D1, "alias"))],
            "binding", "owner-map", "owner-r1",
        )
        second = _bind_alias_inputs(
            [({"side": "left"}, "input", ref("source", "r2", D2), ref("alias", "r2", D2, "alias"))],
            "binding", "owner-map", "owner-r2",
        )
        old_key = make_key(inputs=first.inputs)
        current_key = make_key(inputs=second.inputs)
        self.assertIsInstance(lookup([record_for(old_key, "old")], current_key), Stale)

    def test_CK_K2_UT_030_canonical_json_object_sort(self) -> None:
        payload = {"z": [2, 1], "a": True}
        self.assertEqual(_canonical_json_bytes(payload), b'{"a":true,"z":[2,1]}')
        self.assertEqual(_sha256_digest(_canonical_json_bytes(payload)), "sha256:8e87dbb341568585e9b4a19cde5bb906feb933c76013ab18e2025932db6a3105")

    def test_CK_K2_UT_031_array_order(self) -> None:
        payload = {"z": [1, 2], "a": True}
        self.assertEqual(_canonical_json_bytes(payload), b'{"a":true,"z":[1,2]}')
        self.assertEqual(_sha256_digest(_canonical_json_bytes(payload)), "sha256:4c1ce63323c4813ce58cbc0b652e6782131793514687e3b93c1fc8e8f44675fc")

    def test_CK_K2_UT_032_finite_float(self) -> None:
        self.assertEqual(_canonical_json_bytes(1.0), b"1.0")
        self.assertEqual(_sha256_digest(_canonical_json_bytes(1.0)), "sha256:d0ff5974b6aa52cf562bea5921840c032a860a91a3512f7fe8f768f6bbe005f6")

    def test_CK_K2_UT_033_negative_zero(self) -> None:
        self.assertEqual(_canonical_json_bytes(-0.0), b"-0.0")
        self.assertEqual(_sha256_digest(_canonical_json_bytes(-0.0)), "sha256:c26617c7ccbcaa6631b45d851b8cf56e21d2ca624bdb1193afdbd4b560702cec")

    def test_CK_K2_UT_034a_integer(self) -> None:
        self.assertEqual(_canonical_json_bytes(9007199254740993), b"9007199254740993")
        self.assertEqual(_sha256_digest(_canonical_json_bytes(9007199254740993)), "sha256:a1c367c29158357e62a3ff5d3e800fb7698a22396439dbc0a9d4929322afd35d")

    def test_CK_K2_UT_034b_exponent(self) -> None:
        self.assertEqual(_canonical_json_bytes(1e20), b"1e+20")
        self.assertEqual(_sha256_digest(_canonical_json_bytes(1e20)), "sha256:7c18c9fbdcc8281573e9db9e04f04c3790b10696f3706f0f03fa87427d33e28b")

    def test_CK_K2_UT_035a_composed_unicode(self) -> None:
        self.assertEqual(_canonical_json_bytes("é"), bytes.fromhex("22c3a922"))
        self.assertEqual(_sha256_digest(_canonical_json_bytes("é")), "sha256:f2886017e9c7abacf804b54d64787dce2b611c9544ba21f3affdd126a6e50086")

    def test_CK_K2_UT_035b_decomposed_unicode(self) -> None:
        self.assertEqual(_canonical_json_bytes("e\u0301"), bytes.fromhex("2265cc8122"))
        self.assertEqual(_sha256_digest(_canonical_json_bytes("e\u0301")), "sha256:3d68ce21f2899a475713cdbe7562ba9bdb6b1dfde8af1f221bdff4a0935b53b2")

    def test_CK_K2_UT_036_non_string_key_rejected_by_codec(self) -> None:
        with self.assertRaises((TypeError, ValueError)):
            _canonical_json_bytes({1: "bad"})

    def test_CK_K2_UT_037_nonfinite_rejected_by_codec(self) -> None:
        with self.assertRaises(ValueError):
            _canonical_json_bytes({"bad": float("nan")})

    def test_CK_K2_UT_038_cycle_rejected_by_codec(self) -> None:
        cycle: list[object] = []
        cycle.append(cycle)
        with self.assertRaises(ValueError):
            _canonical_json_bytes(cycle)

    def test_CK_K2_UT_039_lone_surrogate_rejected_by_codec(self) -> None:
        with self.assertRaises(UnicodeEncodeError):
            _canonical_json_bytes("\ud800")

    def test_CK_K2_UT_040_raw_source_digest(self) -> None:
        self.assertEqual(_sha256_digest(b"x"), "sha256:2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881")
        self.assertEqual(_sha256_digest(b"y"), "sha256:a1fce4363854ff888cff4b8e7875d600c2682390412a8cf79b37d0b11148b0fa")

    def test_CK_K2_UT_041_canonical_bytes_do_not_include_storage_lf(self) -> None:
        raw = _canonical_json_bytes({"a": 1})
        self.assertEqual(raw, b'{"a":1}')
        self.assertNotEqual(_sha256_digest(raw), _sha256_digest(raw + b"\n"))


def _make_exact_case_test(ut_id: str, case: str, assertion):
    def test(self: K2UnitTests) -> None:
        assertion(self)
    test.__name__ = f"test_{ut_id}_{case}" if case else f"test_{ut_id}"
    return test


def _add_l7_expansion(name: str, fn) -> None:
    setattr(K2UnitTests, name, fn)


def _test_k2_002_position(self: K2UnitTests, identity: str, subject_position: bool) -> None:
    old_subject = ref("subject")
    old_inputs = () if subject_position else (ref(identity),)
    current_subject = ref("subject", "r2", D2) if subject_position else old_subject
    current_inputs = () if subject_position else (ref(identity, "r2", D2),)
    stored_key = make_key(old_subject, old_inputs)
    current_key = make_key(current_subject, current_inputs)
    self.assertIsInstance(lookup([record_for(stored_key, "old")], current_key), Stale)


for _suffix, _identity, _subject in (
    ("a", "subject", True),
    ("b", "oracle", False),
    ("c", "contract", False),
    ("d", "config", False),
):
    def _fn(self, identity=_identity, subject_position=_subject):
        _test_k2_002_position(self, identity, subject_position)
    _add_l7_expansion(f"test_CK_K2_UT_002{_suffix}", _fn)


for _suffix, _prior in (
    ("a", ("unknown", "unreadable")),
    ("b", ("not_observed", "not_run")),
    ("c", ("n_a",)),
):
    def _fn(self, prior=_prior):
        old = make_key(ref("subject", "r1", D1))
        current = make_key(ref("subject", "r2", D2))
        stored = record_for(old, prior)
        result = lookup([stored], current)
        self.assertIsInstance(result, Unobserved)
        self.assertEqual(result.why, "not_run")
        self.assertEqual(result.superseded, stored.key_digest)
    _add_l7_expansion(f"test_CK_K2_UT_003{_suffix}", _fn)


for _suffix, _position in (("a", "subject"), ("b", "oracle"), ("c", "contract"), ("d", "config")):
    def _fn(self, position=_position):
        if position == "subject":
            query = make_key(ref("subject", "r1", D2))
            old = make_key(ref("subject", "r1", D1))
        else:
            query = make_key(inputs=(ref(position, "r1", D2),))
            old = make_key(inputs=(ref(position, "r1", D1),))
        self.assertEqual(lookup([record_for(old, "old")], query).reason, "conflict")
    _add_l7_expansion(f"test_CK_K2_UT_004{_suffix}", _fn)


for _suffix, _field, _value in (
    ("a", "operation", "other"),
    ("b", "operation_version", "v2"),
    ("c", "scope", "other"),
):
    def _fn(self, field=_field, changed=_value):
        base = make_key()
        stored = record_for(base, "value")
        self.assertIsInstance(lookup([stored], replace(base, **{field: changed})), Unobserved)
    _add_l7_expansion(f"test_CK_K2_UT_008{_suffix}", _fn)


def _test_k2_009_add(self: K2UnitTests) -> None:
    one = make_key(inputs=(ref("in1"),))
    two = make_key(inputs=(ref("in1"), ref("in2")))
    self.assertIsInstance(lookup([record_for(one, "v")], two), Unobserved)


def _test_k2_009_remove(self: K2UnitTests) -> None:
    one = make_key(inputs=(ref("in1"),))
    two = make_key(inputs=(ref("in1"), ref("in2")))
    self.assertIsInstance(lookup([record_for(two, "v")], one), Unobserved)


_add_l7_expansion("test_CK_K2_UT_009a", _test_k2_009_add)
_add_l7_expansion("test_CK_K2_UT_009b", _test_k2_009_remove)


def _test_k2_011a(self: K2UnitTests) -> None:
    k = make_key()
    first = record([], k, Value("x", k, {"evidence": "e"}), "p")
    self.assertIsInstance(record([first.record], k, Value("x", k, {"evidence": "e"}), "p"), NoOp)

    caller_evidence = {"evidence": {"items": ["before"]}}
    snapshot = record([], k, Value("x", k, caller_evidence), "p")
    self.assertIsInstance(snapshot, Recorded)
    digest_before = snapshot.record.result_digest
    caller_evidence["evidence"]["items"].append("after")
    self.assertEqual(snapshot.record.result.evidence, {"evidence": {"items": ["before"]}})
    self.assertEqual(snapshot.record.result_digest, digest_before)


def _test_k2_011b(self: K2UnitTests) -> None:
    k = make_key()
    first = record([], k, Value("x", k, {"evidence": "e"}), "p")
    result = record([first.record], k, Value("y", k, {"evidence": "e"}), "p")
    self.assertIsInstance(result, Conflict)
    self.assertEqual(len(result.records), 2)
    self.assertEqual(result.records[0].result, Value("x", k, {"evidence": "e"}))
    self.assertEqual(result.records[1].result, Value("y", k, {"evidence": "e"}))
    self.assertNotEqual(result.records[0].result_digest, result.records[1].result_digest)

    # Separate one-change cases ensure class and evidence participate in the
    # ResultBody digest while the ResultKey stays fixed.
    class_changed = record(
        [first.record], k, Unknown("unreadable", k, {"evidence": "e"}), "p"
    )
    self.assertIsInstance(class_changed, Conflict)
    self.assertNotEqual(class_changed.records[0].result_digest, class_changed.records[1].result_digest)
    evidence_changed = record(
        [first.record], k, Value("x", k, {"evidence": "changed"}), "p"
    )
    self.assertIsInstance(evidence_changed, Conflict)
    self.assertNotEqual(evidence_changed.records[0].result_digest, evidence_changed.records[1].result_digest)


def _test_k2_011c(self: K2UnitTests) -> None:
    k = make_key()
    stale = Stale(Value("old", k, {}), k, make_key(ref("subject", "r2", D2)))
    self.assertEqual(record([], None, stale, "p"), Rejected("stale_not_recordable"))


_add_l7_expansion("test_CK_K2_UT_011a", _test_k2_011a)
_add_l7_expansion("test_CK_K2_UT_011b", _test_k2_011b)
_add_l7_expansion("test_CK_K2_UT_011c", _test_k2_011c)


def _test_k2_013_valid(self: K2UnitTests) -> None:
    self.assertIsInstance(key_of("op", "v1", ref("subject"), (), "scope"), ResultKey)


def _test_k2_013_no_prefix(self: K2UnitTests) -> None:
    self.assertEqual(key_of("op", "v1", ref("subject", digest="1" * 64), (), "scope"), Rejected("invalid_digest"))


def _test_k2_013_short(self: K2UnitTests) -> None:
    self.assertEqual(key_of("op", "v1", ref("subject", digest="sha256:" + "1" * 63), (), "scope"), Rejected("invalid_digest"))


def _test_k2_013_git_revision(self: K2UnitTests) -> None:
    self.assertEqual(key_of("op", "v1", ref("subject", digest="a" * 40), (), "scope"), Rejected("invalid_digest"))


def _test_k2_013_uppercase(self: K2UnitTests) -> None:
    self.assertEqual(
        key_of("op", "v1", ref("subject", digest="sha256:" + "A" * 64), (), "scope"),
        Rejected("invalid_digest"),
    )


def _test_k2_013_missing_precedence(self: K2UnitTests) -> None:
    # Intentional compound input: required operation is missing in the base,
    # then one field (subject.digest) is changed to an invalid format to check
    # L4's missing_key-before-invalid_digest precedence.
    self.assertEqual(key_of(None, "v1", ref("subject", digest="bad"), (), "scope"), Rejected("missing_key"))


def _test_k2_013_digest_precedence(self: K2UnitTests) -> None:
    self.assertEqual(
        key_of("op", "v1", ref("subject"), (ref("same"), ref("same", "r2", "bad")), "scope"),
        Rejected("invalid_digest"),
    )


for _name, _fn in (
    ("test_CK_K2_UT_013_VALID", _test_k2_013_valid),
    ("test_CK_K2_UT_013_NO_PREFIX", _test_k2_013_no_prefix),
    ("test_CK_K2_UT_013_SHORT", _test_k2_013_short),
    ("test_CK_K2_UT_013_GIT_REVISION", _test_k2_013_git_revision),
    ("test_CK_K2_UT_013_UPPERCASE", _test_k2_013_uppercase),
    ("test_CK_K2_UT_013_PRECEDENCE_MISSING", _test_k2_013_missing_precedence),
    ("test_CK_K2_UT_013_PRECEDENCE_DIGEST", _test_k2_013_digest_precedence),
):
    _add_l7_expansion(_name, _fn)


def _test_k2_015_order(self: K2UnitTests) -> None:
    a, b = ref("a"), ref("b")
    first = key_of("op", "v1", ref("subject"), (a, b), "scope")
    reverse = key_of("op", "v1", ref("subject"), (b, a), "scope")
    self.assertIsInstance(first, ResultKey)
    self.assertIsInstance(reverse, ResultKey)
    self.assertEqual(first, reverse)
    first_record = record([], first, Value("same", first, {"evidence": "fixture"}), "p")
    reverse_record = record([], reverse, Value("same", reverse, {"evidence": "fixture"}), "p")
    self.assertIsInstance(first_record, Recorded)
    self.assertIsInstance(reverse_record, Recorded)
    self.assertEqual(first_record.record.key_digest, reverse_record.record.key_digest)


def _test_k2_015_duplicate(self: K2UnitTests) -> None:
    a = ref("a")
    self.assertEqual(key_of("op", "v1", ref("subject"), (a, a), "scope"), Rejected("duplicate_identity"))


_add_l7_expansion("test_CK_K2_UT_015_ORDER", _test_k2_015_order)
_add_l7_expansion("test_CK_K2_UT_015_DUP", _test_k2_015_duplicate)


def _test_k2_016_subject_kind(self: K2UnitTests) -> None:
    self.assertEqual(lookup([record_for(make_key(ref("subject", kind="contract")), "x")], make_key(ref("subject", kind="other"))).reason, "conflict")


def _test_k2_016_input_kind(self: K2UnitTests) -> None:
    self.assertEqual(lookup([record_for(make_key(inputs=(ref("in", kind="contract"),)), "x")], make_key(inputs=(ref("in", kind="other"),))).reason, "conflict")


_add_l7_expansion("test_CK_K2_UT_016a", _test_k2_016_subject_kind)
_add_l7_expansion("test_CK_K2_UT_016b", _test_k2_016_input_kind)


def _test_k2_017_subject_identity(self: K2UnitTests) -> None:
    self.assertIsInstance(lookup([record_for(make_key(ref("subject")), "x")], make_key(ref("different"))), Unobserved)


def _test_k2_017_input_identity(self: K2UnitTests) -> None:
    self.assertIsInstance(lookup([record_for(make_key(inputs=(ref("in1"),)), "x")], make_key(inputs=(ref("in2"),))), Unobserved)


_add_l7_expansion("test_CK_K2_UT_017a", _test_k2_017_subject_identity)
_add_l7_expansion("test_CK_K2_UT_017b", _test_k2_017_input_identity)


def _test_k2_018_old_value(self: K2UnitTests) -> None:
    old, current = make_key(ref("subject", "r1", D1)), make_key(ref("subject", "r2", D2))
    exact = record_for(current, "current")
    prior = record_for(old, "old")
    self.assertEqual(lookup([prior, exact], current), exact.result)
    self.assertEqual(lookup([exact, prior], current), exact.result)


def _test_k2_018_old_unknown(self: K2UnitTests) -> None:
    old, current = make_key(ref("subject", "r1", D1)), make_key(ref("subject", "r2", D2))
    exact = record_for(current, "current")
    prior = record_for(old, ("unknown", "unreadable"))
    self.assertEqual(lookup([prior, exact], current), exact.result)
    self.assertEqual(lookup([exact, prior], current), exact.result)


_add_l7_expansion("test_CK_K2_UT_018_OLD_VALUE", _test_k2_018_old_value)
_add_l7_expansion("test_CK_K2_UT_018_OLD_UNKNOWN", _test_k2_018_old_unknown)


for _suffix, _order in (("a", (0, 1)), ("b", (1, 0))):
    def _fn(self, order=_order):
        r0, r1, r2 = (make_key(ref("subject", f"r{i}", (D1, D2, D3)[i])) for i in range(3))
        records = [record_for(r0, "zero"), record_for(r1, "one")]
        result = lookup([records[i] for i in order], r2)
        self.assertEqual(result.recorded_key, records[order[-1]].key)
    _add_l7_expansion(f"test_CK_K2_UT_020{_suffix}", _fn)


def _test_k2_020c(self: K2UnitTests) -> None:
    r0, r1, r2 = (make_key(ref("subject", f"r{i}", (D1, D2, D3)[i])) for i in range(3))
    old_nonvalue = record_for(r1, ("unknown", "unreadable"))
    result = lookup([record_for(r0, "zero"), old_nonvalue], r2)
    self.assertIsInstance(result, Unobserved)
    self.assertEqual(result.superseded, old_nonvalue.key_digest)


_add_l7_expansion("test_CK_K2_UT_020c", _test_k2_020c)


def _test_k2_021_positive(self: K2UnitTests) -> None:
    left = ("left", "input", ref("source", "r1", D1), ref("alias-left", "r1", D1, "alias"))
    right = ("right", "input", ref("source", "r2", D2), ref("alias-right", "r2", D2, "alias"))
    result = _bind_alias_inputs([left, right], "binding", "owner-map", "r1")
    self.assertEqual(len(result.aliases), 2)
    self.assertEqual(result.inputs[0], result.binding_ref)


def _test_k2_021_dedup(self: K2UnitTests) -> None:
    item = ("left", "input", ref("source"), ref("alias", digest=D1, kind="alias"))
    result = _bind_alias_inputs([item, item], "binding", "owner-map")
    self.assertEqual(len(result.aliases), 1)


def _test_k2_021_cross_role(self: K2UnitTests) -> None:
    left = ("left", "input", ref("source"), ref("alias-left", kind="alias"))
    right = ("right", "input", ref("source"), ref("alias-right", kind="alias"))
    result = _bind_alias_inputs([left, right], "binding", "owner-map")
    self.assertEqual(len(result.aliases), 2)


def _test_k2_021b(self: K2UnitTests) -> None:
    alias = ref("same-alias", kind="alias")
    first = ("left", "input", ref("source", "r1", D1), alias)
    second = ("left", "input", ref("source", "r2", D1), alias)
    self.assertEqual(_bind_alias_inputs([first, second], "binding", "owner-map"), Rejected("missing_key"))


def _test_k2_021c(self: K2UnitTests) -> None:
    expected = ref("alias", digest=D1, kind="alias")
    observed_bytes = b"wrong"
    binding_bytes = b"fixed owner binding"
    binding_ref = ref(
        "binding",
        digest=_sha256_digest(binding_bytes),
        kind="owner-binding",
    )
    result_key = key_of(
        "observe_alias",
        "K2-1",
        ref("alias-observation"),
        (binding_ref, expected),
        "UT-K2-021c",
    )
    self.assertIsInstance(result_key, ResultKey)

    # This local handoff stub models the L7 boundary only: it first reads the
    # fixed binding successfully, then reports the raw-source digest mismatch.
    class StubReader:
        def read_binding(self, buffer: bytes, expected_ref: SubjectRef) -> bool:
            return _sha256_digest(buffer) == expected_ref.digest

        def observe_alias(self, buffer: bytes, expected_ref: SubjectRef, key_ref: ResultKey):
            if _sha256_digest(buffer) != expected_ref.digest:
                return Unknown("conflict", key_ref)
            return Value(buffer, key_ref, {"stub_read": True})

    reader = StubReader()
    self.assertTrue(reader.read_binding(binding_bytes, binding_ref))
    result = reader.observe_alias(observed_bytes, expected, result_key)
    self.assertEqual(result, Unknown("conflict", result_key))


for _name, _fn in (
    ("test_CK_K2_UT_021_P", _test_k2_021_positive),
    ("test_CK_K2_UT_021_DEDUP", _test_k2_021_dedup),
    ("test_CK_K2_UT_021_CROSS_ROLE", _test_k2_021_cross_role),
    ("test_CK_K2_UT_021b", _test_k2_021b),
    ("test_CK_K2_UT_021c", _test_k2_021c),
):
    _add_l7_expansion(_name, _fn)


if __name__ == "__main__":
    unittest.main()
