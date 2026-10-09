"""Local unit checks for the BRAIN pure projection candidate.

These synthetic tests do not exercise an owner reader, storage, adoption, or
the descriptor comparator.
"""

from __future__ import annotations

from dataclasses import replace
from pathlib import Path
import sys
import unittest

_UNIT = Path(__file__).resolve().parents[1]
_REPO = _UNIT.parents[3]
_KERNEL_SRC = _REPO / "helix/helix-harness/units/common-kernel/src"
sys.path.insert(0, str(_KERNEL_SRC))
sys.path.insert(0, str(_UNIT / "src"))

from brain import (  # noqa: E402
    BrainKnowledgeRecord,
    BrainSourceTraceInput,
    OwnerRecords,
    read_knowledge,
    trace_source,
)
from common_kernel import (  # noqa: E402
    Conflict,
    NotApplicable,
    Recorded,
    ResultKey,
    Stale,
    SubjectRef,
    Unknown,
    Unobserved,
    Value,
    key_of,
    lookup,
    record,
)


D1 = "sha256:" + "1" * 64
D2 = "sha256:" + "2" * 64


def ref(identity: str, revision: str = "r1", digest: str = D1) -> SubjectRef:
    return SubjectRef("brain-knowledge", identity, revision, digest)


def make_key(subject: SubjectRef) -> ResultKey:
    result = key_of("brain.read_knowledge", "stage1", subject, (), "brain-stage1")
    if not isinstance(result, ResultKey):
        raise AssertionError(f"fixture key was not constructed: {result!r}")
    return result


def brain_record(key: ResultKey, marker: str = "r1") -> BrainKnowledgeRecord:
    return BrainKnowledgeRecord(
        knowledge=key.subject,
        version=Value("version-1", key, {"source": marker}),
        state=Value("current", key, {"source": marker}),
        supersession=Unobserved(key, "not_selected"),
    )


def stored(key: ResultKey, payload: BrainKnowledgeRecord | Unknown | Unobserved):
    if isinstance(payload, (Unknown, Unobserved)):
        observed = payload
    else:
        observed = Value(payload, key, {"fixture": "synthetic"})
    result = record((), key, observed, producer="synthetic-owner")
    if not isinstance(result, Recorded):
        raise AssertionError(f"fixture record was not created: {result!r}")
    return result.record


class BrainProjectionTests(unittest.TestCase):
    def setUp(self) -> None:
        self.key = make_key(ref("knowledge:pattern-a"))
        old_key = make_key(ref("knowledge:pattern-a", "r0"))
        self.observations = (
            Value("value", self.key, {"fixture": "v"}),
            Unknown("unsupported", self.key),
            Unobserved(self.key, "not_run"),
            NotApplicable("reason", {"owner": "fixture"}, "reentry", self.key),
            Stale(Value("prior", old_key, {"fixture": "old"}), old_key, self.key),
        )
        self.baseline = self._input_with({})

    def _input_with(self, overrides: dict[str, object]) -> BrainSourceTraceInput:
        fields = {
            "knowledge": ref("knowledge:pattern-a"),
            "provenance": Value("provenance", self.key, {"n": 1}),
            "evidence": Value("evidence", self.key, {"n": 2}),
            "adopted_reason": Value("reason", self.key, {"n": 3}),
            "evaluated_scope": Value("scope", self.key, {"n": 4}),
            "counterexample": Value("counterexample", self.key, {"n": 5}),
            "limitation": Value("limitation", self.key, {"n": 6}),
            "labo_evaluation_target": Value("labo-target", self.key, {"n": 7}),
        }
        fields.update({key: value for key, value in overrides.items() if key != "owner_records"})
        owner_records = overrides.get(
            "owner_records",
            OwnerRecords(
                labo=Value("labo-record", self.key, {"role": "labo"}),
                os_registration=Value("os-record", self.key, {"role": "os"}),
                brain_verification=Value("verification-record", self.key, {"role": "brain"}),
                adoption=Value("adoption-record", self.key, {"role": "adoption"}),
            ),
        )
        return BrainSourceTraceInput(**fields, owner_records=owner_records)

    def test_trace_source_projects_each_declared_field_and_keeps_owner_roles(self) -> None:
        result = trace_source(self.baseline)
        for field in (
            "knowledge",
            "provenance",
            "evidence",
            "adopted_reason",
            "evaluated_scope",
            "counterexample",
            "limitation",
            "labo_evaluation_target",
        ):
            with self.subTest(field=field):
                self.assertEqual(getattr(result, field), getattr(self.baseline, field))
        for role in ("labo", "os_registration", "brain_verification", "adoption"):
            with self.subTest(owner_role=role):
                self.assertIs(
                    getattr(result.owner_records, role),
                    getattr(self.baseline.owner_records, role),
                )

    def test_trace_source_preserves_k1_variants_without_reclassifying_other_fields(self) -> None:
        source_fields = (
            "provenance",
            "evidence",
            "adopted_reason",
            "evaluated_scope",
            "counterexample",
            "limitation",
            "labo_evaluation_target",
        )
        for field in source_fields:
            for observation in self.observations:
                with self.subTest(field=field, variant=type(observation).__name__):
                    source = self._input_with({field: observation})
                    result = trace_source(source)
                    self.assertIs(getattr(result, field), observation)
                    for other in source_fields:
                        if other != field:
                            self.assertIs(getattr(result, other), getattr(source, other))

    def test_trace_source_keeps_owner_observations_in_their_own_fields(self) -> None:
        for role in ("labo", "os_registration", "brain_verification", "adoption"):
            for observation in self.observations:
                with self.subTest(role=role, variant=type(observation).__name__):
                    original = self.baseline.owner_records
                    changed = replace(original, **{role: observation})
                    result = trace_source(self._input_with({"owner_records": changed}))
                    self.assertIs(getattr(result.owner_records, role), observation)
                    for other in ("labo", "os_registration", "brain_verification", "adoption"):
                        if other != role:
                            self.assertIs(getattr(result.owner_records, other), getattr(original, other))


class BrainKnowledgeLookupTests(unittest.TestCase):
    def test_read_knowledge_returns_exact_k2_lookup_value(self) -> None:
        query = make_key(ref("knowledge:pattern-a"))
        record_ref = stored(query, brain_record(query))
        expected = lookup((record_ref,), query)
        self.assertIsInstance(expected, Value)
        self.assertIs(read_knowledge(query, (record_ref,)), expected)

    def test_read_knowledge_preserves_k2_no_match(self) -> None:
        query = make_key(ref("knowledge:missing"))
        result = read_knowledge(query, ())
        self.assertEqual(result, Unobserved(query, "not_run"))

    def test_read_knowledge_preserves_saved_unknown_observation(self) -> None:
        query = make_key(ref("knowledge:pattern-a"))
        saved_unknown = stored(query, Unknown("unsupported", query))
        result = read_knowledge(query, (saved_unknown,))
        self.assertIs(result, saved_unknown.result)
        self.assertIsInstance(result, Unknown)
        self.assertEqual(result.reason, "unsupported")

    def test_read_knowledge_keeps_nested_version_unknown_in_record_value(self) -> None:
        query = make_key(ref("knowledge:pattern-a"))
        version_unknown = Unknown("missing_input", query)
        payload = BrainKnowledgeRecord(
            knowledge=query.subject,
            version=version_unknown,
            state=Value("current", query, {"fixture": "state"}),
            supersession=Unobserved(query, "not_selected"),
        )
        saved = stored(query, payload)
        result = read_knowledge(query, (saved,))
        self.assertIsInstance(result, Value)
        self.assertIs(result.value.version, saved.result.value.version)
        self.assertEqual(result.value.version, version_unknown)

    def test_read_knowledge_keeps_nested_state_unknown_in_record_value(self) -> None:
        query = make_key(ref("knowledge:pattern-a"))
        payload = BrainKnowledgeRecord(
            knowledge=query.subject,
            version=Value("version-1", query, {"fixture": "version"}),
            state=Unknown("missing_input", query),
            supersession=Unobserved(query, "not_selected"),
        )
        saved = stored(query, payload)
        result = read_knowledge(query, (saved,))
        self.assertIsInstance(result, Value)
        self.assertEqual(result.value.state, Unknown("missing_input", query))

    def test_read_knowledge_keeps_each_declared_state_payload(self) -> None:
        for state in ("current", "superseded", "deprecated", "experimental", "retired"):
            with self.subTest(state=state):
                query = make_key(ref(f"knowledge:pattern-{state}"))
                payload = brain_record(query)
                payload = replace(payload, state=Value(state, query, {"fixture": "state"}))
                saved = stored(query, payload)
                result = read_knowledge(query, (saved,))
                self.assertIsInstance(result, Value)
                self.assertEqual(result.value.state, saved.result.value.state)

    def test_read_knowledge_preserves_prior_value_as_k2_stale(self) -> None:
        prior_key = make_key(ref("knowledge:pattern-a", "r1", D1))
        current_key = make_key(ref("knowledge:pattern-a", "r2", D2))
        prior_record = stored(prior_key, brain_record(prior_key))
        result = read_knowledge(current_key, (prior_record,))
        self.assertIsInstance(result, Stale)
        self.assertEqual(result.recorded_key, prior_key)
        self.assertEqual(result.current_key, current_key)
        self.assertEqual(result.prior, prior_record.result)

    def test_read_knowledge_preserves_prior_nonvalue_as_k2_unobserved(self) -> None:
        prior_key = make_key(ref("knowledge:pattern-a", "r1", D1))
        current_key = make_key(ref("knowledge:pattern-a", "r2", D2))
        prior_result = Unknown("unsupported", prior_key)
        prior_record = stored(prior_key, prior_result)
        result = read_knowledge(current_key, (prior_record,))
        self.assertEqual(result, Unobserved(current_key, "not_run", prior_record.key_digest))

    def test_read_knowledge_preserves_same_key_content_conflict(self) -> None:
        query = make_key(ref("knowledge:pattern-a"))
        first = record((), query, Value(brain_record(query, "first"), query, {"fixture": 1}), "owner")
        self.assertIsInstance(first, Recorded)
        second = record(
            (first.record,),
            query,
            Value(brain_record(query, "second"), query, {"fixture": 2}),
            "owner",
        )
        self.assertIsInstance(second, Conflict)
        self.assertNotEqual(first.record.result_digest, second.records[1].result_digest)
        result = read_knowledge(query, second.records)
        self.assertIsInstance(result, Unknown)
        self.assertEqual(result.reason, "conflict")

    def test_read_knowledge_does_not_mutate_restored_records(self) -> None:
        query = make_key(ref("knowledge:pattern-a", "r2", D2))
        prior_key = make_key(ref("knowledge:pattern-a", "r1", D1))
        prior_record = stored(prior_key, brain_record(prior_key))
        before = (prior_record.key, prior_record.key_digest, prior_record.result, prior_record.result_digest)
        result = read_knowledge(query, (prior_record,))
        self.assertIsInstance(result, Stale)
        after = (prior_record.key, prior_record.key_digest, prior_record.result, prior_record.result_digest)
        self.assertEqual(after, before)


if __name__ == "__main__":
    unittest.main()
