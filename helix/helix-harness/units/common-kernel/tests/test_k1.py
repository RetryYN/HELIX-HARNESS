"""L7 K1 fixture coverage. Each generated method has one explicit UT ID."""

from __future__ import annotations

from dataclasses import replace
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from common_kernel import (  # noqa: E402
    Admitted,
    Combined,
    NotApplicable,
    Polarity,
    PolarityMapping,
    PolarityRef,
    Rejected,
    ResultKey,
    ResultRecord,
    SetDiagnostic,
    Stale,
    SubjectRef,
    Unknown,
    UnknownReason,
    Unobserved,
    UnobservedWhy,
    Value,
    Verdict,
    Withheld,
    WithheldReason,
    admit,
    combine,
    disposition,
    prepare_polarity_input,
)


DIGEST = "sha256:" + "a" * 64


def ref(identity: str = "subject", revision: str = "r1", digest: str = DIGEST) -> SubjectRef:
    return SubjectRef("contract", identity, revision, digest)


def key(
    identity: str = "subject", revision: str = "r1", digest: str = DIGEST
) -> ResultKey:
    return ResultKey("operation", "1", ref(identity, revision, digest), (), "scope")


def value(data: object, result_key: ResultKey | None = None) -> Value:
    return Value(data, result_key or key(), {"evidence": "fixture"})


def positive_value(_: object) -> Polarity:
    return Polarity.POSITIVE


def negative_value(_: object) -> Polarity:
    return Polarity.NEGATIVE


def unknown_value(_: object) -> Polarity:
    raise AssertionError("polarity must not be requested for non-Value")


positive = PolarityMapping("test.positive", "1", positive_value)
negative = PolarityMapping("test.negative", "1", negative_value)
unknown = PolarityMapping("test.unknown", "1", unknown_value)


class K1UnitTests(unittest.TestCase):
    def test_CK_K1_UT_001(self) -> None:
        connect_polarity = PolarityMapping("CONNECT.compatibility", "1", positive_value)
        harness_polarity = PolarityMapping("HARNESS.verification", "1", positive_value)
        combined = combine([
            (value("compatible"), connect_polarity),
            (value("pass"), harness_polarity),
        ])
        self.assertIsInstance(combined, Combined)
        self.assertEqual(combined.verdict, Verdict.POSITIVE)
        self.assertEqual(
            combined.polarity,
            (PolarityRef("CONNECT.compatibility", "1"), PolarityRef("HARNESS.verification", "1")),
        )
        self.assertIsInstance(admit(combined), Admitted)

    def test_CK_K1_UT_003(self) -> None:
        combined = combine([value("fail"), Unknown("unreadable", key())], negative)
        self.assertEqual(combined.verdict, Verdict.NEGATIVE)
        self.assertEqual(combined.components[1].reason, "unreadable")
        self.assertEqual(combined.negatives, (0,))
        self.assertEqual(combined.non_values, (1,))
        withheld = admit(combined)
        self.assertEqual([r.index for r in withheld.reasons], [0, 1])
        self.assertEqual(len(withheld.reasons), 2)

    def test_CK_K1_UT_002a(self) -> None:
        result = combine([value("pass"), Unknown("incomparable", key())], positive)
        self.assertEqual(result.verdict, Verdict.UNDETERMINED)
        self.assertEqual(result.non_values, (1,))

    def test_CK_K1_UT_002b(self) -> None:
        old = key(revision="r1")
        current = key(revision="r2")
        result = combine([value("pass"), Stale(value("old", old), old, current)], positive)
        self.assertEqual(result.verdict, Verdict.UNDETERMINED)
        self.assertEqual(result.non_values, (1,))

    def test_CK_K1_UT_002c(self) -> None:
        result = combine([value("pass"), Unobserved(key(), "not_selected")], positive)
        self.assertEqual(result.verdict, Verdict.UNDETERMINED)
        self.assertEqual(result.non_values, (1,))

    def test_CK_K1_UT_004(self) -> None:
        components = [
            value("pass"),
            Unknown("conflict", key()),
            Unobserved(key(), UnobservedWhy.PENDING_RECEIPT),
            Stale(value("old"), key(revision="r1"), key(revision="r2")),
        ]
        combined = combine(components, positive)
        self.assertEqual(combined.verdict, Verdict.UNDETERMINED)
        self.assertEqual(combined.components, tuple(components))
        self.assertEqual(combined.non_values, (1, 2, 3))
        self.assertEqual([r.index for r in admit(combined).reasons], [1, 2, 3])

    def test_CK_K1_UT_005_baseline(self) -> None:
        self.assertIsInstance(admit(combine([value("pass"), value("pass")], positive)), Admitted)

    def test_CK_K1_UT_005_negative(self) -> None:
        mixed = PolarityMapping(
            "test.mixed", "1",
            lambda item: Polarity.NEGATIVE if item == "fail" else Polarity.POSITIVE,
        )
        combined = combine([value("pass"), value("fail")], mixed)
        self.assertEqual(combined.verdict, Verdict.NEGATIVE)
        self.assertTrue(admit(combined).reasons)

    def test_CK_K1_UT_006(self) -> None:
        prepared = prepare_polarity_input("source-value", key(), None)
        self.assertEqual(prepared, Unknown(UnknownReason.MISSING_INPUT, key(), None))
        combined = combine([prepared, value("pass")], positive)
        self.assertEqual(combined.verdict, Verdict.UNDETERMINED)
        self.assertEqual(combined.non_values, (0,))

    def test_contract_boundary_value_without_mapping_is_rejected(self) -> None:
        with self.assertRaisesRegex(TypeError, "converted to keyed Unknown"):
            combine([value("source-value")], None)

    def test_CK_K1_UT_007a(self) -> None:
        result = combine([], positive)
        self.assertEqual(result.verdict, Verdict.UNDETERMINED)
        self.assertEqual(result.set_reason, SetDiagnostic("Unknown", "missing_input"))
        self.assertEqual(admit(result).reasons, (WithheldReason("whole", "Unknown", "missing_input"),))

    def test_CK_K1_UT_007b(self) -> None:
        item = NotApplicable("reason", "authority", "trigger", key())
        result = combine([item], positive)
        self.assertEqual(result.verdict, Verdict.UNDETERMINED)
        self.assertEqual(result.set_reason, SetDiagnostic("Unknown", "missing_input"))
        self.assertEqual(admit(result).reasons, (WithheldReason("whole", "Unknown", "missing_input"),))

    def test_CK_K1_UT_007c(self) -> None:
        items = [NotApplicable("reason", "authority", "trigger", key()) for _ in range(3)]
        result = combine(items, positive)
        self.assertEqual(result.verdict, Verdict.UNDETERMINED)
        self.assertEqual(result.set_reason, SetDiagnostic("Unknown", "missing_input"))
        self.assertEqual(admit(result).reasons, (WithheldReason("whole", "Unknown", "missing_input"),))

    def test_CK_K1_UT_008_disposition_three_required_fields(self) -> None:
        for missing in ("reason", "authority", "reentry_trigger"):
            with self.subTest(field=missing):
                args = {"reason": "not applicable", "authority": "declared", "reentry_trigger": "change"}
                args[missing] = None
                result = disposition(args["reason"], args["authority"], args["reentry_trigger"], key())
                self.assertEqual(result, Unknown("invalid_disposition", key()))

    def test_CK_K1_UT_008a(self) -> None:
        self.assertEqual(disposition(None, "authority", "trigger", key()), Unknown("invalid_disposition", key()))

    def test_CK_K1_UT_008b(self) -> None:
        self.assertEqual(disposition("reason", None, "trigger", key()), Unknown("invalid_disposition", key()))

    def test_CK_K1_UT_008c(self) -> None:
        self.assertEqual(disposition("reason", "authority", None, key()), Unknown("invalid_disposition", key()))

    def test_CK_K1_UT_009_accept_classes_and_record_classes(self) -> None:
        accepted = [
            value("v"),
            Unknown("unreadable", key()),
            Unobserved(key(), "not_run"),
            NotApplicable("reason", "authority", "trigger", key()),
            Stale(value("old"), key(revision="r1"), key(revision="r2")),
        ]
        for item in accepted:
            with self.subTest(cls=type(item).__name__):
                combined = combine([item], positive)
                self.assertIsInstance(combined, Combined)
                self.assertIs(combined.components[0], item)
        self.assertEqual(combine([accepted[3]], positive).excluded, (0,))

    def test_CK_K1_UT_009_ACCEPT_COMBINE_Value(self) -> None:
        self.assertIsInstance(combine([value("v")], positive), Combined)

    def test_CK_K1_UT_009_ACCEPT_COMBINE_Unknown(self) -> None:
        self.assertIsInstance(combine([Unknown("unreadable", key())], positive), Combined)

    def test_CK_K1_UT_009_ACCEPT_COMBINE_Unobserved(self) -> None:
        self.assertIsInstance(combine([Unobserved(key(), "not_run")], positive), Combined)

    def test_CK_K1_UT_009_ACCEPT_COMBINE_NotApplicable(self) -> None:
        self.assertIsInstance(combine([NotApplicable("reason", "authority", "trigger", key())], positive), Combined)

    def test_CK_K1_UT_009_ACCEPT_COMBINE_Stale(self) -> None:
        old = key(revision="r1")
        self.assertIsInstance(combine([Stale(value("old", old), old, key(revision="r2"))], positive), Combined)

    def test_CK_K1_UT_009_ACCEPT_RECORD_Value(self) -> None:
        from common_kernel import record
        self.assertNotIsInstance(record([], key(), value("v"), "producer"), Rejected)

    def test_CK_K1_UT_009_ACCEPT_RECORD_Unknown(self) -> None:
        from common_kernel import record
        self.assertNotIsInstance(record([], key(), Unknown("unreadable", key()), "producer"), Rejected)

    def test_CK_K1_UT_009_ACCEPT_RECORD_Unobserved(self) -> None:
        from common_kernel import record
        self.assertNotIsInstance(record([], key(), Unobserved(key(), "not_run"), "producer"), Rejected)

    def test_CK_K1_UT_009_ACCEPT_RECORD_NotApplicable(self) -> None:
        from common_kernel import record
        self.assertNotIsInstance(record([], key(), NotApplicable("r", "a", "t", key()), "producer"), Rejected)

    def test_CK_K1_UT_009_LOOKUP_Value(self) -> None:
        from common_kernel import record, lookup
        k = key()
        stored = record([], k, value("v"), "p").record
        self.assertEqual(lookup([stored], k), stored.result)

    def test_CK_K1_UT_009_LOOKUP_Unknown(self) -> None:
        from common_kernel import lookup
        k = key()
        stored = ResultRecord(k, "key-digest", Unknown("unreadable", k), "result-digest", "p")
        self.assertEqual(lookup([stored], k), stored.result)

    def test_CK_K1_UT_009_LOOKUP_Unobserved(self) -> None:
        from common_kernel import lookup
        k = key()
        stored = ResultRecord(k, "key-digest", Unobserved(k, "not_run"), "result-digest", "p")
        self.assertEqual(lookup([stored], k), stored.result)

    def test_CK_K1_UT_009_LOOKUP_NotApplicable(self) -> None:
        from common_kernel import lookup
        k = key()
        stored = ResultRecord(k, "key-digest", NotApplicable("r", "a", "t", k), "result-digest", "p")
        self.assertEqual(lookup([stored], k), stored.result)

    def test_CK_K1_UT_009_STALE_LOOKUP(self) -> None:
        from common_kernel import lookup
        old = key(revision="r1")
        current = key(revision="r2")
        stored = ResultRecord(old, "old-key", value("old", old), "result-digest", "p")
        self.assertIsInstance(lookup([stored], current), Stale)

    def test_CK_K1_UT_009_STALE_RECORD(self) -> None:
        from common_kernel import record
        old = key(revision="r1")
        stale = Stale(value("old", old), old, key(revision="r2"))
        self.assertEqual(record([], old, stale, "p"), Rejected("stale_not_recordable"))

    def test_CK_K1_UT_009_KEY_COMBINE_Value(self) -> None:
        self.assertEqual(combine([replace(value("v"), key=None)], positive), Rejected("missing_key"))

    def test_CK_K1_UT_009_KEY_COMBINE_Unknown(self) -> None:
        self.assertEqual(combine([replace(Unknown("unreadable", key()), key=None)], positive), Rejected("missing_key"))

    def test_CK_K1_UT_009_KEY_COMBINE_Unobserved(self) -> None:
        self.assertEqual(combine([replace(Unobserved(key(), "not_run"), key=None)], positive), Rejected("missing_key"))

    def test_CK_K1_UT_009_KEY_COMBINE_NotApplicable(self) -> None:
        self.assertEqual(combine([replace(NotApplicable("r", "a", "t", key()), key=None)], positive), Rejected("missing_key"))

    def test_CK_K1_UT_009_KEY_COMBINE_Stale(self) -> None:
        old = key(revision="r1")
        self.assertEqual(combine([Stale(value("old", old), old, None)], positive), Rejected("missing_key"))

    def test_CK_K1_UT_009_KEY_RECORD(self) -> None:
        from common_kernel import record
        self.assertEqual(record([], None, value("v"), "p"), Rejected("missing_key"))

    def test_CK_K1_UT_009_KEY_LOOKUP(self) -> None:
        from common_kernel import lookup
        self.assertEqual(lookup([], None), Rejected("missing_key"))

    def test_CK_K1_UT_010_complete_scan_empty_is_value(self) -> None:
        # Owner supplies a Value only after its complete-scan marker is checked.
        combined = combine([value([])], positive)
        self.assertEqual(combined.verdict, Verdict.POSITIVE)

    def test_CK_K1_UT_010_partial_scan_is_non_value(self) -> None:
        combined = combine([Unknown("unreadable", key())], positive)
        self.assertEqual(combined.verdict, Verdict.UNDETERMINED)

    def test_CK_K1_UT_010_read_failure_is_non_value(self) -> None:
        combined = combine([Unobserved(key(), "not_run")], positive)
        self.assertEqual(combined.verdict, Verdict.UNDETERMINED)

    def test_CK_K1_UT_011_projection_cannot_be_combined(self) -> None:
        projection = {"display": "green", "omitted": ["Unknown"]}
        self.assertEqual(combine([projection], positive), Rejected("missing_key"))

    def test_CK_K1_UT_012_mapping_word_table(self) -> None:
        mapping = {
            "ambiguous": (Unknown("ambiguous", key()), None),
            "unsupported": (Unknown("unsupported", key()), None),
            "mismatch": (value("mismatch"), negative),
            "conflict": (Unknown("conflict", key()), None),
            "evaluation_error": (Unknown("evaluation_error", key()), None),
            "indeterminate": (Unknown("indeterminate", key()), None),
            "unknown": (Unknown("missing_input", key()), None),
            "stale": (Stale(value("old"), key(revision="r1"), key(revision="r2")), None),
            "not_observed": (Unobserved(key(), "not_selected"), None),
            "unregistered": (Unknown("unsupported", key()), None),
            "incompatible": (value("incompatible"), negative),
            "not_applicable": (NotApplicable("reason", "authority", "trigger", key()), None),
        }
        for word, (observed, polarity) in mapping.items():
            with self.subTest(word=word):
                result = combine([observed], polarity or unknown)
                self.assertIsInstance(result, Combined)
                self.assertIs(result.components[0], observed)
        self.assertEqual(combine([mapping["mismatch"][0]], negative).verdict, Verdict.NEGATIVE)
        self.assertEqual(combine([mapping["incompatible"][0]], negative).verdict, Verdict.NEGATIVE)
        self.assertEqual(combine([mapping["not_observed"][0]], unknown).verdict, Verdict.UNDETERMINED)

    def test_CK_K1_UT_012_wrong_mapping_mismatch(self) -> None:
        correct = combine([value("mismatch")], negative)
        wrong = combine([value("mismatch")], positive)
        self.assertEqual(correct.verdict, Verdict.NEGATIVE)
        self.assertNotEqual(wrong.verdict, correct.verdict)

    def test_CK_K1_UT_012_wrong_mapping_incompatible(self) -> None:
        correct = combine([value("incompatible")], negative)
        wrong = combine([value("incompatible")], positive)
        self.assertEqual(correct.verdict, Verdict.NEGATIVE)
        self.assertNotEqual(wrong.verdict, correct.verdict)

    def test_CK_K1_UT_012_wrong_mapping_not_observed(self) -> None:
        correct = combine([Unobserved(key(), "not_selected")], unknown)
        wrong = combine([value("not_observed")], positive)
        self.assertEqual(correct.verdict, Verdict.UNDETERMINED)
        self.assertNotEqual(wrong.verdict, correct.verdict)

    def test_CK_K1_UT_012_unregistered(self) -> None:
        self.assertEqual(Unknown("unsupported", key()).reason, "unsupported")


def _missing_key(field: str, boundary: str) -> object:
    base = key()
    if field in {"operation", "operation_version", "subject", "inputs", "scope"}:
        return replace(base, **{field: None})
    if field.startswith("subject."):
        subject = replace(base.subject, **{field.split(".", 1)[1]: None})
        return replace(base, subject=subject)
    if field.startswith("input."):
        item = replace(ref("input"), **{field.split(".", 1)[1]: None})
        return replace(base, inputs=(item,))
    raise AssertionError(field)


_KEY_FIELDS = [
    "operation", "operation_version", "subject", "inputs", "scope",
    "subject.kind", "subject.identity", "subject.revision", "subject.digest",
    "input.kind", "input.identity", "input.revision", "input.digest",
]


def _make_key_missing_test(field: str, boundary: str):
    def test(self: K1UnitTests) -> None:
        malformed_key = _missing_key(field, boundary)
        if boundary == "combine":
            output = combine([value("x", malformed_key)], positive)
        elif boundary == "record":
            from common_kernel import record
            output = record([], malformed_key, value("x", malformed_key), "producer")
        else:
            from common_kernel import lookup
            output = lookup([], malformed_key)
        self.assertEqual(output, Rejected("missing_key"))
    test.__name__ = f"test_CK_K1_UT_013_{field.replace('.', '_')}_{boundary}"
    return test


for _field in _KEY_FIELDS:
    for _boundary in ("combine", "record", "lookup"):
        setattr(
            K1UnitTests,
            f"test_CK_K1_UT_013_{_field.replace('.', '_')}_{_boundary}",
            _make_key_missing_test(_field, _boundary),
        )


def _make_mapping_word_test(word: str, expected_class: type, expected_reason: str | None = None):
    def test(self: K1UnitTests) -> None:
        k = key()
        if word == "mismatch":
            observed, mapping = value("mismatch", k), negative
        elif word == "incompatible":
            observed, mapping = value("incompatible", k), negative
        elif word == "absent":
            observed, mapping = value([], k), positive
        elif word == "stale":
            old = key(revision="r1")
            observed, mapping = Stale(value("old", old), old, key(revision="r2")), positive
        elif word == "not_observed":
            observed, mapping = Unobserved(k, "not_selected"), positive
        elif word == "未評価":
            observed, mapping = Unobserved(k, "pending_receipt"), positive
        elif word == "not_applicable":
            observed, mapping = NotApplicable("reason", "authority", "trigger", k), positive
        else:
            reason = expected_reason or word
            observed, mapping = Unknown(reason, k), positive
        result = combine([observed], mapping)
        self.assertIsInstance(result, Combined)
        self.assertIsInstance(result.components[0], expected_class)
        if expected_reason is not None:
            self.assertEqual(result.components[0].reason, expected_reason)
        if word in ("mismatch", "incompatible"):
            self.assertEqual(result.verdict, Verdict.NEGATIVE)
    test.__name__ = f"test_CK_K1_UT_012_MAP_{word}"
    return test


_MAPPING_WORDS = [
    ("ambiguous", Unknown),
    ("unsupported", Unknown),
    ("mismatch", Value),
    ("conflict", Unknown),
    ("absent", Value),
    ("evaluation_error", Unknown),
    ("indeterminate", Unknown),
    ("unknown", Unknown, "missing_input"),
    ("stale", Stale),
    ("not_observed", Unobserved),
    ("未評価", Unobserved),
    ("incompatible", Value),
    ("not_applicable", NotApplicable),
]
for _mapping_row in _MAPPING_WORDS:
    _word, _class, *_reason = _mapping_row
    setattr(
        K1UnitTests,
        f"test_CK_K1_UT_012_MAP_{_word}",
        _make_mapping_word_test(_word, _class, _reason[0] if _reason else None),
    )


def _make_admit_key_test(field: str | None):
    def test(self: K1UnitTests) -> None:
        good = value("pass")
        if field is None:
            malformed = replace(good, key=None)
        else:
            malformed = replace(good, key=_missing_key(field, "combine"))
        combined = Combined(Verdict.POSITIVE, (malformed,), "mapping", (), (), (), None)
        self.assertEqual(admit(combined), Rejected("missing_key"))
    suffix = "WHOLE" if field is None else field.replace(".", "_")
    test.__name__ = f"test_CK_K1_UT_014_KEY_{suffix}"
    return test


setattr(K1UnitTests, "test_CK_K1_UT_014_KEY_WHOLE", _make_admit_key_test(None))
for _field in _KEY_FIELDS:
    setattr(
        K1UnitTests,
        f"test_CK_K1_UT_014_KEY_{_field.replace('.', '_')}",
        _make_admit_key_test(_field),
    )


if __name__ == "__main__":
    unittest.main()
