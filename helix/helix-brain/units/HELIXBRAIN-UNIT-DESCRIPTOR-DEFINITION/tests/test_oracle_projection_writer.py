"""Pure AxisResult projection properties for the FN4 oracle writer.

These inputs are mathematical writer operands only; they are not presented as
fn0/FN1 output or as a fabricated OracleContext.
"""

from __future__ import annotations

import copy
import unittest

from oracle_projection_writer import write_oracle_axes


def _ref(identity):
    return {
        "identity": identity,
        "revision": "synthetic-revision",
        "scope": {"project": "synthetic-project"},
        "owner": "synthetic-owner",
        "source_locator": None,
        "sha256": None,
    }


def _binding(template_identity="synthetic-template", requirement_identity="synthetic-requirement"):
    base = _ref(template_identity)
    return {
        "template_ref": base,
        "knowledge_ref": _ref("synthetic-knowledge"),
        "requirement_ref": _ref(requirement_identity),
        "oracle_ref": _ref("synthetic-oracle"),
        "pack_ref": _ref("synthetic-pack"),
        "pack_contract_version": "1",
        "pack_artifact_version": "1",
        "pack_dependency_versions": [],
        "version_target": None,
    }


def _axis(name, *, subject=None, binding=None, state="unknown", reason="raw reason"):
    return {
        "subject_ref": copy.deepcopy(subject if subject is not None else _ref("synthetic-subject")),
        "binding": copy.deepcopy(binding if binding is not None else _binding()),
        "axis": name,
        "state": state,
        "original_refs": [_ref("synthetic-original")],
        "reason": reason,
        "backflow_owner": "knowledge_owner",
    }


class TestOracleProjectionWriter(unittest.TestCase):
    def test_carry_and_existing_matching_axis_keep_all_seven_fields_and_original_order(self):
        carry = _axis("measurement.definition", state="missing", reason="carry stays exact")
        matching = _axis("measurement.binding", state="unknown", reason="preexisting raw reason")
        mismatched_subject = _axis(
            "measurement.binding", subject=_ref("other-subject"), reason="must not carry"
        )
        mismatched_binding = _axis(
            "measurement.binding", binding=_binding("other-template"), reason="must not carry either"
        )
        predicate_match = _axis("measurement.binding", state="conflict", reason="predicate copy")
        new_rule = _axis("completion.binding", state="conflict", reason="new completion row")
        original = [carry, mismatched_subject, matching, mismatched_binding]
        predicate = [predicate_match, new_rule]
        original_before = copy.deepcopy(original)
        predicate_before = copy.deepcopy(predicate)

        result = write_oracle_axes(original, predicate)

        self.assertEqual(result, [carry, matching, new_rule])
        self.assertEqual(result[0], original[0])
        self.assertEqual(result[1], original[2])
        self.assertEqual(set(result[1]), {
            "subject_ref", "binding", "axis", "state", "original_refs", "reason", "backflow_owner",
        })
        self.assertEqual(original, original_before)
        self.assertEqual(predicate, predicate_before)

    def test_repeated_predicate_row_keeps_first_axis_occurrence(self):
        carry = _axis("negative oracle.definition", state="missing")
        first = _axis("measurement.binding", state="conflict", reason="first occurrence")
        repeated = copy.deepcopy(first)
        repeated["reason"] = "later duplicate must not replace first"

        result = write_oracle_axes([carry], [first, repeated])

        self.assertEqual(result, [carry, first])
        self.assertEqual(result[1]["reason"], "first occurrence")

    def test_distinct_predicate_axes_follow_input_rule_order(self):
        carry = _axis("completion.definition", state="unknown")
        completion = _axis("completion.binding", state="conflict")
        measurement = _axis("measurement.binding", state="conflict")

        result = write_oracle_axes([carry], [completion, measurement])

        self.assertEqual(result, [carry, completion, measurement])
        self.assertEqual([row["axis"] for row in result], [
            "completion.definition", "completion.binding", "measurement.binding",
        ])


if __name__ == "__main__":
    unittest.main()
