"""R4 boundary controls for R71 obligation comparison and typed subject refs.

The fixtures build real, synchronized fn0 inputs and exercise the public
fn0→fn1/fn3→fn4 path. Expectations follow L4
``oracle_view_boundary_contract/rule_projection_table/3 (rule /failure_rules/71)`` and L5
``source_return_contract/constructor_meaning/reference_equality``. They do
not inject a successful comparison or assert saved whole-result bytes.
"""

from __future__ import annotations

import copy
import unittest

from oracle_projection_input_fixtures import (
    oracle_projection_input,
    oracle_projection_public_context,
    synchronize_oracle_binding_source,
)
from oracle_view_boundary import compare_oracle_and_view_boundary as public_fn4


class TestOracleReferenceBoundaries(unittest.TestCase):
    def test_r71_fires_for_an_obligation_ref_difference_in_each_identity_member(self):
        """L4 R71 treats a typed different obligation as the measurement conflict."""
        for member, replacement in (
            ("owner", "synthetic-other-requirement-owner"),
            (
                "scope",
                {
                    "project": "synthetic-other-project",
                    "tenant": "synthetic-other-tenant",
                    "environment": "synthetic-other-environment",
                },
            ),
            ("revision", "synthetic-other-requirement-revision"),
        ):
            with self.subTest(member=member):
                raw, _fixture_before, _source = oracle_projection_input(
                    rules=("measurement",)
                )
                fact = next(
                    slot["facts"][0]
                    for slot in raw["descriptors"]
                    if slot["descriptor_kind"] == "measurement"
                )
                obligation = copy.deepcopy(fact["binding"]["requirement_ref"])
                obligation[member] = copy.deepcopy(replacement)
                raw["oracle_bindings"][0]["obligation_ref"] = obligation
                synchronize_oracle_binding_source(raw)
                raw_before = copy.deepcopy(raw)

                validated, _definitions, _trace, context = (
                    oracle_projection_public_context(raw)
                )
                context_before = copy.deepcopy(context)
                result = public_fn4(context)

                self.assertEqual(raw, raw_before)
                self.assertEqual(validated["input"], raw_before)
                self.assertEqual(context, context_before)
                findings = result["findings"]
                self.assertEqual(len(findings), 1)
                self.assertEqual(findings[0]["code"], "unrelated_measurement")
                self.assertEqual(
                    findings[0]["rule_ref"],
                    "HELIXBRAIN-L5-032-R-unrelated_measurement",
                )
                self.assertEqual(findings[0]["axis"], "measurement.binding")
                self.assertEqual(findings[0]["state"], "conflict")
                self.assertEqual(findings[0]["backflow_owner"], "knowledge_owner")
                self.assertEqual(findings[0]["subject_ref"], fact["ref"])
                axes = [
                    axis
                    for axis in result["axes"]
                    if axis["axis"] == "measurement.binding"
                ]
                self.assertEqual(len(axes), 1)
                self.assertEqual(axes[0]["subject_ref"], fact["ref"])

    def test_r71_finding_and_axis_keep_fact_ref_when_only_one_sha_is_null(self):
        """L5 makes a null digest non-comparing; R71 retains the typed fact Ref."""
        for digest_on in ("oracle_subject", "measurement_fact"):
            with self.subTest(digest_on=digest_on):
                raw, _fixture_before, _source = oracle_projection_input(
                    rules=("measurement",)
                )
                fact = next(
                    slot["facts"][0]
                    for slot in raw["descriptors"]
                    if slot["descriptor_kind"] == "measurement"
                )
                oracle_subject = raw["oracle_bindings"][0]["subject_ref"]
                if digest_on == "oracle_subject":
                    self.assertIsNone(fact["ref"]["sha256"])
                    oracle_subject["sha256"] = "a" * 64
                else:
                    self.assertIsNone(oracle_subject["sha256"])
                    fact["ref"]["sha256"] = "a" * 64
                self.assertNotEqual(fact["ref"]["sha256"], oracle_subject["sha256"])
                synchronize_oracle_binding_source(raw)
                raw_before = copy.deepcopy(raw)

                validated, _definitions, _trace, context = (
                    oracle_projection_public_context(raw)
                )
                context_before = copy.deepcopy(context)
                result = public_fn4(context)

                self.assertEqual(raw, raw_before)
                self.assertEqual(validated["input"], raw_before)
                self.assertEqual(context, context_before)
                self.assertEqual(
                    [finding["code"] for finding in result["findings"]],
                    ["unrelated_measurement"],
                )
                finding = result["findings"][0]
                self.assertEqual(finding["subject_ref"], fact["ref"])
                self.assertEqual(
                    finding["subject_ref"]["sha256"], fact["ref"]["sha256"]
                )
                axes = [
                    axis
                    for axis in result["axes"]
                    if axis["axis"] == "measurement.binding"
                ]
                self.assertEqual(len(axes), 1)
                self.assertEqual(axes[0]["subject_ref"], fact["ref"])
                self.assertEqual(
                    axes[0]["subject_ref"]["sha256"], fact["ref"]["sha256"]
                )


if __name__ == "__main__":
    unittest.main()
