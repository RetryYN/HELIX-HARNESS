"""Focused tests for private, source-only INFRA projection subsets.

Each test names its L8 baseline and single mutation explicitly. Tests do not
derive an expected result from the fixture identifier. Owner-dependent FN-01
and FN-05 remain unconnected and are represented as hold rows in the coverage
inventory, not as synthetic K1/K2/K3 outcomes.
"""

from __future__ import annotations

from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[5]
CK_SRC = ROOT / "helix/helix-harness/units/common-kernel/src"
INFRA_SRC = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(CK_SRC))
sys.path.insert(0, str(INFRA_SRC))

import infrastructure as infra  # noqa: E402
from common_kernel import (  # noqa: E402
    ResultKey,
    SubjectRef,
    Unknown,
    Unobserved,
    Value,
    key_of,
)


DIGEST = "sha256:" + "1" * 64


def ref(identity: str, kind: str = "fixture", revision: str = "r1") -> SubjectRef:
    return SubjectRef(kind, identity, revision, DIGEST)


def key_for(subject: SubjectRef | None = None) -> ResultKey:
    key = key_of("infra_projection", "1", subject or ref("resource"), (), "fixture-scope")
    if not isinstance(key, ResultKey):
        raise AssertionError("the explicit fixture key must be valid")
    return key


def observed(subject: SubjectRef, payload: object, key: ResultKey):
    return Value(payload, key, {"source": subject.identity})


def observation(field_ref: SubjectRef, value, owner_ref: SubjectRef | None = None):
    owner = owner_ref or ref("owner:" + field_ref.identity, "owner")
    return infra.SourceObservation(
        field_ref,
        value,
        Value(owner, key_for(field_ref), {"source": owner.identity}),
    )


class TestImplementedProjections(unittest.TestCase):
    def test_resource_projection_subset_preserves_baseline_and_unreadable_mutation(self):
        # L8 reference: L8-INFRA-001-14-BASE; this is a synthetic field subset.
        key = key_for(ref("resource", "resource"))
        location_ref = ref("resource/location", "resource-field")
        version_ref = ref("resource/version", "resource-field")
        baseline = {
            "location": observation(location_ref, observed(location_ref, "zone-a", key)),
            "version": observation(version_ref, observed(version_ref, "v1", key)),
        }
        baseline_projection = infra._project_resource_observation_subset(key, baseline)
        self.assertEqual(baseline_projection.identity, key.subject)
        self.assertIs(baseline_projection.fields["location"], baseline["location"])
        self.assertEqual(baseline_projection.fields["version"].value.value, "v1")

        # Single mutation: only the version observation becomes Unknown(unreadable).
        mutated = dict(baseline)
        mutated["version"] = observation(version_ref, Unknown("unreadable", key))
        projection = infra._project_resource_observation_subset(key, mutated)
        self.assertIsInstance(projection.fields["version"].value, Unknown)
        self.assertEqual(projection.fields["version"].value.reason, "unreadable")
        self.assertEqual(projection.fields["location"], baseline["location"])

    def test_resource_projection_subset_preserves_unseen_declared_role(self):
        # L8 reference: L8-INFRA-001-03-BASE; this is a synthetic role subset.
        key = key_for(ref("resource", "resource"))
        role_ref = ref("resource/role", "resource-field")
        baseline = {"role": observation(role_ref, observed(role_ref, "worker", key))}
        self.assertEqual(infra._project_resource_observation_subset(key, baseline).fields["role"].value.value, "worker")

        # Single mutation: role value is a newly declared, previously unseen string.
        changed = {"role": observation(role_ref, observed(role_ref, "recovery-worker", key))}
        result = infra._project_resource_observation_subset(key, changed)
        self.assertEqual(result.fields["role"].value.value, "recovery-worker")
        self.assertEqual(result.fields["role"].subject, role_ref)

    def test_axis_pair_retains_values_and_unknown_without_comparison_class(self):
        # L8 reference: L8-INFRA-001-02-BASE; this is a synthetic axis subset.
        key = key_for()
        left_ref = ref("left/source", "environment-field")
        right_ref = ref("right/source", "environment-field")
        left = {"source": observation(left_ref, observed(left_ref, "source-a", key))}
        right = {"source": observation(right_ref, observed(right_ref, "source-a", key))}
        baseline_pairs = infra._pair_source_observations(left, right)
        self.assertEqual(baseline_pairs["source"][0].value.value, "source-a")
        self.assertEqual(baseline_pairs["source"][1].value.value, "source-a")

        # Single mutation: right-side source observation is Unknown(missing_input).
        right_mutated = {"source": observation(right_ref, Unknown("missing_input", key))}
        pairs = infra._pair_source_observations(left, right_mutated)
        self.assertIsInstance(pairs["source"][0].value, Value)
        self.assertIsInstance(pairs["source"][1].value, Unknown)
        self.assertEqual(pairs["source"][1].value.reason, "missing_input")

    def test_path_storage_projection_treats_owner_keys_as_opaque(self):
        # L8 reference: L8-INFRA-001-05-BASE; this is a synthetic ref subset.
        scope = ref("scope", "scope")
        key = key_for()
        logical_ref = ref("logical-connection", "connection")
        physical_ref = ref("physical-path", "path")
        baseline = {
            "logical_connection": observation(logical_ref, observed(logical_ref, "conn-1", key)),
            "physical_path": observation(physical_ref, observed(physical_ref, "path-1", key)),
        }
        projected = infra._retain_path_storage_observations(scope, baseline)
        self.assertEqual(set(projected), {"logical_connection", "physical_path"})
        self.assertEqual(projected["logical_connection"].subject, logical_ref)
        self.assertEqual(projected["physical_path"].subject, physical_ref)

        # Single mutation: only the physical protocol observation is Unknown.
        protocol_ref = ref("physical-path/protocol", "path-field")
        mutated = dict(baseline)
        mutated["physical_protocol"] = observation(protocol_ref, Unknown("missing_input", key))
        after = infra._retain_path_storage_observations(scope, mutated)
        self.assertIsInstance(after["physical_protocol"].value, Unknown)
        self.assertEqual(after["logical_connection"], baseline["logical_connection"])

    def test_nfr_helper_counts_supplied_states_and_keeps_missing_denominator(self):
        # Private helper projection only; this does not claim the L8 NFR was measured.
        key = key_for()
        declared = ("probe-a", "probe-b", "probe-c", "probe-d")
        supplied = {
            "probe-a": Value({"elapsed_seconds": 4}, key, {"source": "synthetic-clock"}),
            "probe-b": Unknown("missing_input", key),
            "probe-c": Unobserved(key, "not_run"),
        }
        summary = infra._summarize_nfr_observations(declared, supplied)
        self.assertEqual(summary.denominator, 4)
        self.assertEqual(summary.value_count, 1)
        self.assertEqual(summary.unknown_count, 1)
        self.assertEqual(summary.unobserved_count, 1)
        self.assertEqual(summary.unresolved_count, 1)
        self.assertEqual(summary.observations["probe-a"].value, {"elapsed_seconds": 4})
        self.assertEqual(summary.observations["probe-b"].reason, "missing_input")


if __name__ == "__main__":
    unittest.main()
