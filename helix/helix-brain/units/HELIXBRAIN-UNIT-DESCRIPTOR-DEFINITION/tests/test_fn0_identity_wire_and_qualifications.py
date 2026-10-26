"""fn0 wire-presence regression checks and same-snapshot downstream observation."""

from __future__ import annotations

import copy
import unittest

from dependencies_handoff import compare_dependencies_and_handoff
from descriptor_definitions import (
    compare_descriptor_definitions,
    compare_values_and_applicability,
    validate_supply_input,
)
from identity_input_fixtures import normal_input


class TestFn0IdentityWireAndQualifications(unittest.TestCase):
    def _validate_keeps_raw(self, raw):
        original = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input"], original)
        self.assertEqual(validated["input_issues"], [])
        return validated, original

    def _run_existing_same_snapshot_readers(self, raw):
        validated, original = self._validate_keeps_raw(raw)
        validated_before = copy.deepcopy(validated)
        definitions = compare_descriptor_definitions({"validated": validated})
        self.assertEqual(definitions["producer_symbol"], "compare_descriptor_definitions")
        self.assertEqual(definitions["input_binding"], original["binding"])
        definitions_before = copy.deepcopy(definitions)
        self.assertEqual(validated, validated_before)

        values = compare_values_and_applicability({
            "validated": validated,
            "definitions": definitions,
        })
        self.assertEqual(values["producer_symbol"], "compare_values_and_applicability")
        self.assertEqual(values["input_binding"], original["binding"])
        self.assertEqual(validated, validated_before)
        self.assertEqual(definitions, definitions_before)

        handoff = compare_dependencies_and_handoff({
            "validated": validated,
            "definitions": definitions,
        })
        self.assertEqual(handoff["producer_symbol"], "compare_dependencies_and_handoff")
        self.assertEqual(handoff["input_binding"], original["binding"])
        self.assertEqual(validated, validated_before)
        self.assertEqual(definitions, definitions_before)
        self.assertEqual(raw, original)
        return validated, definitions, values, handoff

    def _run_fn1_fn2_and_observe_fn6_boundary(self, raw):
        validated, original = self._validate_keeps_raw(raw)
        validated_before = copy.deepcopy(validated)
        definitions = compare_descriptor_definitions({"validated": validated})
        self.assertEqual(definitions["input_binding"], original["binding"])
        definitions_before = copy.deepcopy(definitions)
        values = compare_values_and_applicability({
            "validated": validated,
            "definitions": definitions,
        })
        self.assertEqual(values["input_binding"], original["binding"])
        self.assertEqual(validated, validated_before)
        self.assertEqual(definitions, definitions_before)

        # fn6's current closed Binding reader has a separate typed boundary. Keep that
        # stop explicit; do not repair or widen it using a value synthesized from fn0.
        try:
            handoff = compare_dependencies_and_handoff({
                "validated": validated,
                "definitions": definitions,
            })
        except NotImplementedError as exc:
            self.assertIn("F09/B02/binding_or_subject_ref_missing", str(exc))
            self.assertIn("Backflow", str(exc))
        else:
            self.assertEqual(handoff["input_binding"], original["binding"])
        self.assertEqual(validated, validated_before)
        self.assertEqual(raw, original)

    def test_optional_ref_members_are_preserved_and_do_not_change_fn0_disposition(self):
        complete = normal_input()
        complete_validated, complete_original = self._validate_keeps_raw(complete)

        for member in ("source_locator", "sha256"):
            with self.subTest(optional_ref_member=member):
                raw = copy.deepcopy(complete_original)
                del raw["binding"]["template_ref"][member]
                raw_before = copy.deepcopy(raw)
                validated, original = self._validate_keeps_raw(raw)
                self.assertEqual(original, raw_before)
                self.assertEqual(
                    validated["unusable_source_refs"],
                    complete_validated["unusable_source_refs"],
                    "omitting an optional wire Ref member does not alter source disposition",
                )
                # fn1/fn2 consume the same decoded value. fn6's separate closed typed
                # boundary is observed as an explicit stop rather than bypassed.
                self._run_fn1_fn2_and_observe_fn6_boundary(raw)
                self.assertEqual(raw, raw_before)

    def test_exact_duplicate_qualification_is_retained_without_changing_fn0_status(self):
        raw = normal_input()
        baseline, original = self._validate_keeps_raw(raw)
        source = original["sources"][0]
        matching = [
            qualification for qualification in original["qualifications"]
            if qualification["ref"] == source["qualification_ref"]
        ]
        self.assertEqual(len(matching), 1)

        repeated = copy.deepcopy(original)
        repeated["qualifications"].append(copy.deepcopy(matching[0]))
        repeated_before = copy.deepcopy(repeated)
        validated, decoded = self._validate_keeps_raw(repeated)
        self.assertEqual(decoded, repeated_before)
        self.assertEqual(len(validated["input"]["qualifications"]), len(original["qualifications"]) + 1)
        self.assertEqual(
            validated["input"]["qualifications"][-1],
            matching[0],
            "the exact repeated Qualification remains a second original occurrence",
        )
        self.assertEqual(validated["unusable_source_refs"], baseline["unusable_source_refs"])
        self.assertEqual(validated["input_issues"], baseline["input_issues"])
        # A repeated Qualification is not converted into a new trust result. The existing
        # same-snapshot consumers receive and preserve this exact decoded input.
        self._run_existing_same_snapshot_readers(repeated)
        self.assertEqual(repeated, repeated_before)


if __name__ == "__main__":
    unittest.main()
