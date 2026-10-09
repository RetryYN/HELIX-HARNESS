"""Tests for the private, source-only CONNECT observation-slot projection.

These are partial helper probes related to the synthetic L8 inputs. They do
not discharge any of the 152 formal L7 fixture locators or claim a K1 result
for CONNECT declaration, compatibility, endpoint binding, authority, retry,
trace, NFR, or business behavior.
"""

from __future__ import annotations

from pathlib import Path
import sys
import unittest


UNIT = Path(__file__).resolve().parents[1]
REPO = Path(__file__).resolve().parents[5]
sys.path.insert(0, str(REPO / "helix/helix-harness/units/common-kernel/src"))
sys.path.insert(0, str(UNIT / "src"))

import connection_contract as connect  # noqa: E402
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


DIGEST = "sha256:" + "1" * 64


def ref(identity: str, revision: str = "r1") -> SubjectRef:
    return SubjectRef("connect-fixture", identity, revision, DIGEST)


def key(subject: SubjectRef) -> ResultKey:
    result = key_of("connect.observation_projection", "candidate-1", subject, (), "fixture")
    if not isinstance(result, ResultKey):
        raise AssertionError(f"fixture key was not constructed: {result!r}")
    return result


class ObservationSlotProjectionTests(unittest.TestCase):
    def test_synthetic_declaration_slots_keep_explicit_order_and_objects(self):
        # Related only to the positive input shape of L8-CONNECT-001-01-POS.
        source_ref = ref("source-declaration")
        consumer_ref = ref("consumer-declaration")
        source_value = Value({"marker": "source"}, key(source_ref), {"fixture": "source"})
        consumer_value = Value({"marker": "consumer"}, key(consumer_ref), {"fixture": "consumer"})
        baseline = (
            ("source_declaration", source_ref, source_value),
            ("consumer_declaration", consumer_ref, consumer_value),
        )

        projected = connect._retain_observation_slots(baseline)

        self.assertEqual(projected, baseline)
        self.assertIs(projected[0][2], source_value)
        self.assertIs(projected[1][2], consumer_value)

    def test_existing_unknown_mutation_is_retained_without_classification(self):
        # Partial projection probe related to L8-CONNECT-001-01-SOURCE-UNKNOWN;
        # the helper does not produce the fixture's overall declaration result.
        source_ref = ref("source-declaration")
        consumer_ref = ref("consumer-declaration")
        source_key = key(source_ref)
        consumer_value = Value("consumer", key(consumer_ref), {"fixture": "consumer"})
        baseline_source = Value("source", source_key, {"fixture": "source"})
        baseline = (
            ("source_declaration", source_ref, baseline_source),
            ("consumer_declaration", consumer_ref, consumer_value),
        )
        unknown = Unknown("unsupported", source_key, {"fixture": "unchanged-evidence"})
        mutated = (("source_declaration", source_ref, unknown), baseline[1])

        baseline_projection = connect._retain_observation_slots(baseline)
        projection = connect._retain_observation_slots(mutated)

        self.assertIs(baseline_projection[0][2], baseline_source)
        self.assertIs(projection[0][2], unknown)
        self.assertEqual(projection[0][2].reason, "unsupported")
        self.assertEqual(projection[0][2].evidence, {"fixture": "unchanged-evidence"})
        self.assertIs(projection[1][2], consumer_value)

    def test_all_existing_k1_nonvalues_remain_opaque_slots(self):
        # This checks preservation only; it does not choose among K1 outcomes.
        subject = ref("observation")
        current_subject = ref("observation", "r2")
        old_key = key(subject)
        current_key = key(current_subject)
        prior = Value("prior", old_key, {"fixture": "prior"})
        values = (
            Unknown("missing_input", old_key, {"fixture": "unknown"}),
            Unobserved(old_key, "not_run"),
            Stale(prior, old_key, current_key),
            NotApplicable("owner-declared", {"fixture": "authority"}, "fixture-reentry", old_key),
        )
        slots = tuple((f"observation_{index}", subject, value) for index, value in enumerate(values))

        projected = connect._retain_observation_slots(slots)

        self.assertEqual(len(projected), len(values))
        for row, original in zip(projected, values, strict=True):
            self.assertIs(row[2], original)

    def test_private_helper_rejects_malformed_python_rows(self):
        # This is only the private helper's call-shape precondition, not a
        # product/API Rejected result or a formal L8 oracle.
        with self.assertRaises(TypeError):
            connect._retain_observation_slots((("source", ref("source")),))  # type: ignore[arg-type]


if __name__ == "__main__":
    unittest.main()
