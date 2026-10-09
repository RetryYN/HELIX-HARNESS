"""Synthetic checks for the private LABO AggregateObservation assembler."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path


UNIT = Path(__file__).resolve().parents[1]
REPO = Path(__file__).resolve().parents[5]
sys.path.insert(0, str(REPO / "helix/helix-harness/units/common-kernel/src"))
sys.path.insert(0, str(UNIT / "src"))

import _private_aggregate_assembly as assembly  # noqa: E402
import projection as field_projection  # noqa: E402
from common_kernel import (  # noqa: E402
    NotApplicable,
    ResultKey,
    Stale,
    SubjectRef,
    Unknown,
    Unobserved,
    Value,
)


DIGEST = "sha256:" + "2" * 64


def ref(identity: str, revision: str = "r1") -> SubjectRef:
    return SubjectRef("labo-aggregate-fixture", identity, revision, DIGEST)


def key(subject: SubjectRef) -> ResultKey:
    return ResultKey("labo.aggregate.fixture", "candidate-v1", subject, (), "fixture")


class AggregateAssemblyTests(unittest.TestCase):
    def test_assembles_exact_five_fields_and_retains_all_existing_k1_variants(self) -> None:
        fields = {
            name: object()
            for name in field_projection._OBSERVATION_FIELDS
        }
        source_observation_ref = ref("observation")
        exact_source = ref("source", "source-r3")
        source_status = "failure"
        prior_key = key(ref("processing", "r1"))
        current_key = key(ref("processing", "r2"))
        nested_marker = object()
        nested_evidence = {"nested": [nested_marker]}
        prior_value = Value("prior", prior_key, {"origin": "prior"})
        observed_values = (
            Value("present", current_key, {"origin": "input"}),
            Unknown("unsupported", current_key, nested_evidence),
            Unobserved(current_key, "not_run"),
            Stale(prior_value, prior_key, current_key),
            NotApplicable("owner-declared", {"authority": nested_marker}, "fixture", current_key),
        )
        expected_fields = {
            "source_observation_ref",
            "exact_source",
            "source_status",
            "field_presence",
            "lab_processing",
        }

        for observed in observed_values:
            with self.subTest(observed_type=type(observed).__name__):
                result = assembly._assemble_aggregate_observation(
                    source_observation_ref=source_observation_ref,
                    exact_source=exact_source,
                    source_fields=fields,
                    source_status=source_status,
                    lab_processing=observed,
                )

                self.assertEqual(set(result.__dataclass_fields__), expected_fields)
                self.assertIs(result.source_observation_ref, source_observation_ref)
                self.assertIs(result.exact_source, exact_source)
                self.assertIs(result.source_status, source_status)
                self.assertIs(result.lab_processing, observed)
                self.assertEqual(tuple(result.field_presence), field_projection._OBSERVATION_FIELDS)
                for name, value in fields.items():
                    projected = result.field_presence[name]
                    self.assertIsInstance(projected, field_projection._Present)
                    self.assertIs(projected.value, value)

        self.assertIs(observed_values[1].evidence, nested_evidence)
        self.assertIs(observed_values[1].evidence["nested"][0], nested_marker)

    def test_one_missing_field_and_present_falsy_values_are_local_and_inputs_unchanged(self) -> None:
        fields: dict[str, object] = {
            name: object()
            for name in field_projection._OBSERVATION_FIELDS
        }
        fields["time"] = 0
        fields["artifact"] = ""
        fields["result"] = False
        del fields["deployment"]
        before = dict(fields)
        status = "unknown"
        source_ref = ref("source")
        observation_ref = ref("observation")
        processing = Unobserved(key(ref("processing")), "not_run")

        result = assembly._assemble_aggregate_observation(
            source_observation_ref=observation_ref,
            exact_source=source_ref,
            source_fields=fields,
            source_status=status,
            lab_processing=processing,
        )

        self.assertEqual(fields, before)
        self.assertIs(result.field_presence["deployment"], field_projection._MISSING)
        self.assertIsInstance(result.field_presence["time"], field_projection._Present)
        self.assertIs(result.field_presence["time"].value, 0)
        self.assertIsInstance(result.field_presence["artifact"], field_projection._Present)
        self.assertEqual(result.field_presence["artifact"].value, "")
        self.assertIsInstance(result.field_presence["result"], field_projection._Present)
        self.assertIs(result.field_presence["result"].value, False)
        self.assertEqual(len(result.field_presence), 20)
        self.assertIs(result.source_observation_ref, observation_ref)
        self.assertIs(result.exact_source, source_ref)
        self.assertIs(result.source_status, status)
        self.assertIs(result.lab_processing, processing)


if __name__ == "__main__":
    unittest.main()
