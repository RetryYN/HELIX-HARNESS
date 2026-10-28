"""A resolved owner address can still be out-of-scope by its declared kind.

L4 /oracle_view_boundary_contract/nonnull_claim_target_reuse and
/nonfire_read_plan/raw_domain/claims classify non-null finite carry from the
resolved owner address kind. The declaration may resolve without a caller slot;
absence of that slot does not turn measurement into a non-target kind. L5
/source_return_contract/descriptor_target_dataflow/direct_wrappers/fn4 keeps
this decision on the same FN0/walk input.
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import compare_oracle_and_view_boundary
from identity_input_fixtures import _same_ref_without_digest, _write_source_content
from test_descriptor_fill_oracle_connection import (
    _claim_finite_input,
    _same_call_context,
)


TARGET_KINDS = {"measurement", "completion", "negative oracle"}
EXPECTED_STOP = (
    "F05/F06/unclosed/oracle_claim_ports; owner=knowledge_owner; "
    "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
)


class TestDescriptorFn4TargetKindWithoutSlot(unittest.TestCase):
    def test_resolved_measurement_owner_target_without_caller_slot_keeps_fn4_boundary(
        self,
    ):
        raw = _claim_finite_input(proposed_value="replacement", resolved_target=True)
        source = raw["sources"][0]
        old_source_ref = copy.deepcopy(source["ref"])
        content = copy.deepcopy(source["content"])
        declaration = content["descriptor_targets"][0]
        declaration["descriptor_kind"] = "measurement"
        declaration["slot_identity"] = "owner-measurement-slot-not-in-input"
        _write_source_content(raw, source, content)
        new_source_ref = copy.deepcopy(source["ref"])

        for record in raw["knowledge_records"]:
            record["provenance_refs"] = [
                copy.deepcopy(new_source_ref)
                if _same_ref_without_digest(ref, old_source_ref)
                else copy.deepcopy(ref)
                for ref in record["provenance_refs"]
            ]
        for descriptor in raw["descriptors"]:
            for fact in descriptor["facts"]:
                if _same_ref_without_digest(fact.get("source_ref"), old_source_ref):
                    fact["source_ref"] = copy.deepcopy(new_source_ref)

        raw_before, validated, _definitions, _identity, context, _carry = (
            _same_call_context(raw)
        )
        self.assertFalse(
            any(slot["descriptor_kind"] in TARGET_KINDS for slot in raw["descriptors"])
        )
        self.assertEqual(raw["claims"][0]["subject_ref"], declaration["target_ref"])
        walk = evaluate_descriptor_definition_walk({"validated": validated})
        target = walk["target_reads"][0]
        self.assertEqual(target["state"], "resolved")
        self.assertEqual(len(target["matches"]), 1)
        self.assertEqual(target["matches"][0]["descriptor_kind"], "measurement")
        self.assertEqual(
            target["matches"][0]["slot_identity"], "owner-measurement-slot-not-in-input"
        )
        self.assertEqual(target["matches"][0]["slot_locators"], [])
        self.assertEqual(
            target["matches"][0]["target_ref"], raw["claims"][0]["subject_ref"]
        )
        raw_after_walk = copy.deepcopy(raw)
        context_before = copy.deepcopy(context)

        try:
            compare_oracle_and_view_boundary(context)
        except Exception as caught:
            self.assertIsInstance(caught, NotImplementedError)
            self.assertEqual(str(caught), EXPECTED_STOP)
        else:
            self.fail(
                "measurement target kind must remain outside the finite carry branch"
            )

        self.assertEqual(raw, raw_after_walk)
        self.assertEqual(raw, raw_before)
        self.assertEqual(context, context_before)


if __name__ == "__main__":
    unittest.main()
