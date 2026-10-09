"""Synthetic tests for private LABO projection candidates only."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

SOURCE_DIR = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(SOURCE_DIR))

import projection as candidate  # noqa: E402


class PrivateProjectionTests(unittest.TestCase):
    def test_all_twenty_fields_are_retained_without_value_interpretation(self) -> None:
        raw_values = {field: object() for field in candidate._OBSERVATION_FIELDS}
        status = object()

        result = candidate._project_aggregate_fields(raw_values, status)

        self.assertEqual(tuple(result.field_presence), candidate._OBSERVATION_FIELDS)
        self.assertIs(result.source_status, status)
        for field, original in raw_values.items():
            self.assertIsInstance(result.field_presence[field], candidate._Present)
            self.assertIs(result.field_presence[field].value, original)
        self.assertEqual(len(raw_values), 20)

    def test_each_single_missing_field_is_local_and_does_not_mutate_input(self) -> None:
        for missing_field in candidate._OBSERVATION_FIELDS:
            with self.subTest(missing_field=missing_field):
                raw_values = {field: object() for field in candidate._OBSERVATION_FIELDS}
                del raw_values[missing_field]
                before = dict(raw_values)

                result = candidate._project_aggregate_fields(raw_values, "unknown")

                self.assertEqual(raw_values, before)
                self.assertEqual(len(result.field_presence), 20)
                self.assertIs(result.field_presence[missing_field], candidate._MISSING)
                for field, original in raw_values.items():
                    self.assertIsInstance(result.field_presence[field], candidate._Present)
                    self.assertIs(result.field_presence[field].value, original)

    def test_all_seven_declared_status_values_are_preserved_separately(self) -> None:
        statuses = (
            "success",
            "failure",
            "rejected",
            "cancelled",
            "blocked",
            "unknown",
            "not_observed",
        )
        empty_fields: dict[str, object] = {}

        for status in statuses:
            with self.subTest(status=status):
                result = candidate._project_aggregate_fields(empty_fields, status)
                self.assertEqual(result.source_status, status)
                self.assertEqual(set(result.field_presence), set(candidate._OBSERVATION_FIELDS))
                self.assertTrue(
                    all(value is candidate._MISSING for value in result.field_presence.values())
                )

    def test_episode_candidate_shape_retains_refs_and_relation_only(self) -> None:
        inputs = {
            "candidate_ref": object(),
            "observation_refs": [object(), object()],
            "source_refs": [object()],
            "source_contract_refs": [object()],
            "schema_refs": [object()],
            "provenance_refs": [object()],
            "relation": object(),
        }
        snapshots = {key: value for key, value in inputs.items()}

        result = candidate._project_episode_candidate_shape(**inputs)

        for field, original in snapshots.items():
            self.assertIs(getattr(result, field), original)
        self.assertFalse(result.causal_assertion)
        self.assertEqual(set(result.__dataclass_fields__), set(inputs) | {"causal_assertion"})


if __name__ == "__main__":
    unittest.main()
