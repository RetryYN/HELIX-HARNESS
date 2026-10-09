"""Focused private source-qualified resource projection checks."""

from __future__ import annotations

from dataclasses import FrozenInstanceError, fields as dataclass_fields
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[5]
CK_SRC = ROOT / "helix/helix-harness/units/common-kernel/src"
INFRA_SRC = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(CK_SRC))
sys.path.insert(0, str(INFRA_SRC))

from common_kernel import (  # noqa: E402
    NotApplicable,
    ResultKey,
    Stale,
    SubjectRef,
    Unknown,
    Unobserved,
    Value,
    key_of,
)
import infrastructure as infra  # noqa: E402
import _private_resource_projection as projection_module  # noqa: E402


DIGEST = "sha256:" + "1" * 64
RESOURCE_FIELDS = (
    "role",
    "environment",
    "location",
    "version",
    "dependency",
    "lifecycle",
)


def ref(identity: str, kind: str = "fixture", revision: str = "r1") -> SubjectRef:
    return SubjectRef(kind, identity, revision, DIGEST)


def key_for(subject: SubjectRef) -> ResultKey:
    result = key_of("infra_projection", "1", subject, (), "fixture-scope")
    if not isinstance(result, ResultKey):
        raise AssertionError("the explicit fixture key must be valid")
    return result


def value_for(payload: object, key: ResultKey) -> Value:
    return Value(payload, key, {"fixture": "source-qualified"})


def observation(field_ref: SubjectRef, value: object, key: ResultKey) -> infra.SourceObservation:
    owner_ref = ref("owner:" + field_ref.identity, "owner")
    return infra.SourceObservation(
        field_ref,
        value,
        Value(owner_ref, key_for(field_ref), {"owner-source": owner_ref.identity}),
    )


def six_field_baseline() -> tuple[ResultKey, dict[str, infra.SourceObservation]]:
    key = key_for(ref("resource-a", "resource"))
    fields = {}
    for name in RESOURCE_FIELDS:
        field_ref = ref(f"resource-a/{name}", "resource-field")
        fields[name] = observation(field_ref, value_for(f"display-{name}", key), key)
    return key, fields


class TestPrivateResourceProjection(unittest.TestCase):
    def test_six_source_qualified_fields_baseline_has_identity_and_fields_only(self):
        # L8 locator: L8-INFRA-001-01-BASE. This checks a synthetic projection only.
        key, baseline = six_field_baseline()
        original_items = tuple(baseline.items())

        projected = projection_module._project_resource_observation(key, baseline)

        self.assertIs(projected.identity, key.subject)
        self.assertEqual(set(projected.fields), set(RESOURCE_FIELDS))
        self.assertEqual(
            tuple(field.name for field in dataclass_fields(projection_module._ResourceProjection)),
            ("identity", "fields"),
        )
        for field_name in RESOURCE_FIELDS:
            self.assertIs(projected.fields[field_name], baseline[field_name])
            self.assertIsInstance(projected.fields[field_name].value, Value)
        self.assertEqual(tuple(baseline.items()), original_items)
        with self.assertRaises(TypeError):
            projected.fields["extra"] = baseline["role"]
        with self.assertRaises(FrozenInstanceError):
            projected.identity = ref("changed", "resource")

    def test_single_version_unknown_keeps_its_source_and_owner(self):
        # L8 locator: L8-INFRA-001-14-VERSION-UNREADABLE; only version is changed.
        key, baseline = six_field_baseline()
        changed = dict(baseline)
        version_ref = ref("resource-a/version", "resource-field")
        changed["version"] = observation(version_ref, Unknown("unreadable", key), key)

        projected = projection_module._project_resource_observation(key, changed)

        version = projected.fields["version"]
        self.assertIsInstance(version.value, Unknown)
        self.assertEqual(version.value.reason, "unreadable")
        self.assertEqual(version.subject, version_ref)
        self.assertEqual(version.owner_ref.value.identity, "owner:resource-a/version")
        for field_name in set(RESOURCE_FIELDS) - {"version"}:
            self.assertIs(projected.fields[field_name], baseline[field_name])

    def test_unknown_unobserved_stale_and_not_applicable_are_retained(self):
        key = key_for(ref("resource-a", "resource"))
        current_key = key_for(ref("resource-a", "resource", "r2"))
        prior = value_for("old", key)
        values = {
            "unknown": Unknown("unreadable", key),
            "unobserved": Unobserved(key, "not_run"),
            "stale": Stale(prior, key, current_key),
            "not_applicable": NotApplicable("owner-declared", "fixture-authority", "scope-change", key),
        }
        baseline = {
            name: observation(ref(f"resource-a/{name}", "resource-field"), value, key)
            for name, value in values.items()
        }

        projected = projection_module._project_resource_observation(key, baseline)

        for name, value in values.items():
            self.assertIs(projected.fields[name].value, value)
            self.assertEqual(projected.fields[name].subject.identity, f"resource-a/{name}")
            self.assertIsInstance(projected.fields[name].owner_ref, Value)

    def test_absent_mapping_field_is_not_filled_or_called_domain_absence(self):
        # L8 missing-field locators concern complete source scans; this is only a sparse mapping check.
        key, baseline = six_field_baseline()
        del baseline["dependency"]

        projected = projection_module._project_resource_observation(key, baseline)

        self.assertNotIn("dependency", projected.fields)
        self.assertEqual(set(projected.fields), set(RESOURCE_FIELDS) - {"dependency"})
        self.assertEqual(projected.identity, key.subject)

    def test_same_display_different_subject_refs_remain_distinct(self):
        # Synthetic identity regression; it does not execute the cross-environment L8 oracle.
        first_key = key_for(ref("resource-a", "resource"))
        second_key = key_for(ref("resource-b", "resource"))
        first_ref = ref("resource-a/location", "resource-field")
        second_ref = ref("resource-b/location", "resource-field")
        first = {"location": observation(first_ref, value_for("same-display", first_key), first_key)}
        second = {"location": observation(second_ref, value_for("same-display", second_key), second_key)}

        first_projection = projection_module._project_resource_observation(first_key, first)
        second_projection = projection_module._project_resource_observation(second_key, second)

        self.assertEqual(first_projection.fields["location"].value.value, "same-display")
        self.assertEqual(second_projection.fields["location"].value.value, "same-display")
        self.assertNotEqual(first_projection.identity, second_projection.identity)
        self.assertEqual((first_projection.identity.identity, second_projection.identity.identity), ("resource-a", "resource-b"))

    def test_projection_does_not_mutate_input_mapping_or_observations(self):
        key, baseline = six_field_baseline()
        item_snapshot = tuple(baseline.items())
        observation_snapshot = tuple(baseline.values())

        projected = projection_module._project_resource_observation(key, baseline)

        self.assertEqual(tuple(baseline.items()), item_snapshot)
        self.assertEqual(tuple(baseline.values()), observation_snapshot)
        self.assertTrue(all(projected.fields[name] is baseline[name] for name in baseline))


if __name__ == "__main__":
    unittest.main()
