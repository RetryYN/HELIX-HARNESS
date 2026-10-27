"""Bounded FN4 fill_definition connection to the finite carry branch."""

from __future__ import annotations

import copy
import unittest

from descriptor_definitions import (
    compare_descriptor_definitions,
    compare_identity_versions_and_trace,
    compare_oracle_and_view_boundary,
    validate_supply_input,
)
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from identity_input_fixtures import _same_ref_without_digest, _write_source_content
from test_oracle_finite_carry import _finite_input


FN1 = "compare_descriptor_definitions"
FN3 = "compare_identity_versions_and_trace"
FN4 = "compare_oracle_and_view_boundary"
TARGET_KINDS = {"measurement", "completion", "negative oracle"}
CARRY_AXES = {
    "measurement.definition",
    "completion.definition",
    "negative oracle.definition",
}
AXIS_MEMBERS = {
    "subject_ref", "binding", "axis", "state", "original_refs", "reason",
    "backflow_owner",
}
UNRESOLVED_NONNULL_STOP = (
    "F05/F06/unclosed/oracle_claim_ports; owner=knowledge_owner; "
    "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
)


def _claim(raw, *, proposed_value, subject_ref=None):
    target = subject_ref
    if target is None:
        target = copy.deepcopy(raw["descriptors"][0]["facts"][0]["ref"])
    return {
        "subject_ref": copy.deepcopy(target),
        "binding": copy.deepcopy(raw["binding"]),
        "actor": "BRAIN",
        "kind": "fill_definition",
        "proposed_value": copy.deepcopy(proposed_value),
        "basis_refs": [],
    }


def _claim_finite_input(*, proposed_value, resolved_target, duplicate_claim=False):
    """Start with existing finite carrier fixture and add one explicit non-target Claim."""
    raw = _finite_input("absent")
    assert raw["descriptors"]
    slot = raw["descriptors"][0]
    fact = slot["facts"][0]
    claim = _claim(raw, proposed_value=proposed_value, subject_ref=fact["ref"])
    raw["claims"] = [copy.deepcopy(claim), copy.deepcopy(claim)] if duplicate_claim else [claim]

    source = raw["sources"][0]
    if resolved_target:
        old_ref = copy.deepcopy(source["ref"])
        content = copy.deepcopy(source["content"])
        content["descriptor_targets"] = [{
            "target_ref": copy.deepcopy(fact["ref"]),
            "slot_identity": slot["slot_identity"],
            "descriptor_kind": slot["descriptor_kind"],
        }]
        _write_source_content(raw, source, content)
        new_ref = copy.deepcopy(source["ref"])
        for record in raw["knowledge_records"]:
            record["provenance_refs"] = [
                copy.deepcopy(new_ref) if _same_ref_without_digest(ref, old_ref) else copy.deepcopy(ref)
                for ref in record["provenance_refs"]
            ]
        for descriptor in raw["descriptors"]:
            for source_fact in descriptor["facts"]:
                if _same_ref_without_digest(source_fact.get("source_ref"), old_ref):
                    source_fact["source_ref"] = copy.deepcopy(new_ref)
    return raw


def _same_call_context(raw):
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    if validated["input"] is None or validated["input_issues"] or validated["unusable_source_refs"]:
        raise AssertionError("setup: FN0 must accept the selected finite raw input")
    if validated["input"] != raw_before:
        raise AssertionError("setup: FN0 must preserve the complete raw snapshot")
    definitions = compare_descriptor_definitions({"validated": validated})
    identity_trace = compare_identity_versions_and_trace({"validated": validated})
    if definitions["producer_symbol"] != FN1 or identity_trace["producer_symbol"] != FN3:
        raise AssertionError("setup: fn1/fn3 results must come from their public producers")
    if definitions["input_binding"] != raw_before["binding"]:
        raise AssertionError("setup: fn1 must retain the raw input Binding")
    if identity_trace["input_binding"] != raw_before["binding"]:
        raise AssertionError("setup: fn3 must retain the raw input Binding")
    _assert_finite_raw_domain(raw_before)
    carry = [copy.deepcopy(row) for row in definitions["axes"] if row["axis"] in CARRY_AXES]
    if ({row["axis"] for row in carry} != CARRY_AXES
            or len(carry) != 3
            or not all(set(row) == AXIS_MEMBERS for row in carry)
            or not all(row["state"] == "missing" for row in carry)):
        raise AssertionError("setup: fn1 must provide the three original finite definition rows")
    context = {"validated": validated, "definitions": definitions, "identity_trace": identity_trace}
    return raw_before, validated, definitions, identity_trace, context, carry


def _assert_finite_raw_domain(raw):
    for member in ("oracle_bindings", "values", "handoff_records"):
        if member in raw and raw[member] != []:
            raise AssertionError(f"setup: {member} must have no record occurrences")
    if any(slot["descriptor_kind"] in TARGET_KINDS for slot in raw["descriptors"]):
        raise AssertionError("setup: no target-kind slot occurrence belongs to this finite branch")
    if any(claim.get("kind") != "fill_definition" for claim in raw["claims"]):
        raise AssertionError("setup: every original Claim is fill_definition")
    role_keys = {
        "semantic_json": {"binding", "descriptor_facts", "descriptor_targets", "definition_meaning_operations"},
        "reference_only": {"binding", "reference_target", "reference_context"},
    }
    for source in raw["sources"]:
        role = source.get("role")
        content = source.get("content")
        if role not in role_keys or not isinstance(content, dict) or not set(content) <= role_keys[role]:
            raise AssertionError("setup: source role/content key allowlist is outside the finite branch")
        if role == "semantic_json":
            for carrier in ("descriptor_facts", "definition_meaning_operations"):
                if carrier in content and content[carrier] != []:
                    raise AssertionError("setup: no typed target-kind census occurrence is present")


def _assert_public_carry(testcase, raw, context, carry):
    raw_before = copy.deepcopy(raw)
    context_before = copy.deepcopy(context)
    result = compare_oracle_and_view_boundary(context)
    testcase.assertEqual(set(result), {"axes", "findings", "producer_symbol", "input_binding"})
    testcase.assertEqual(result["producer_symbol"], FN4)
    testcase.assertEqual(result["input_binding"], raw["binding"])
    testcase.assertEqual(result["axes"], carry)
    testcase.assertEqual(result["findings"], [])
    testcase.assertTrue(all(set(row) == AXIS_MEMBERS for row in result["axes"]))
    testcase.assertEqual(raw, raw_before)
    testcase.assertEqual(context, context_before)


class TestDescriptorFillOracleConnection(unittest.TestCase):
    def test_explicit_null_claim_carries_finite_axes_with_unknown_target_read(self):
        """L4 allows null replacement to carry without resolving a required target address."""
        raw = _claim_finite_input(proposed_value=None, resolved_target=False)
        raw_before, validated, definitions, _identity, context, carry = _same_call_context(raw)
        walk = evaluate_descriptor_definition_walk({"validated": validated})
        self.assertEqual(walk["target_reads"][0]["claim_locator"], "/claims/0")
        self.assertEqual(walk["target_reads"][0]["state"], "unknown")
        self.assertEqual(walk["target_reads"][0]["matches"], [])
        _assert_public_carry(self, raw_before, context, carry)

    def test_nonnull_claim_carries_only_with_same_call_resolved_nontarget_match(self):
        """L4 permits nonnull carry only after the same-v target reader resolves an outside kind."""
        raw = _claim_finite_input(proposed_value="replacement proposal", resolved_target=True)
        raw_before, validated, definitions, _identity, context, carry = _same_call_context(raw)
        walk = evaluate_descriptor_definition_walk({"validated": validated})
        target = walk["target_reads"][0]
        self.assertEqual(target["state"], "resolved")
        self.assertTrue(target["matches"])
        self.assertTrue(all(row["descriptor_kind"] not in TARGET_KINDS for row in target["matches"]))
        self.assertEqual(target["matches"][0]["target_ref"], raw["claims"][0]["subject_ref"])
        self.assertEqual(definitions["producer_symbol"], FN1)
        _assert_public_carry(self, raw_before, context, carry)

    def test_nonnull_claim_with_unresolved_target_keeps_specific_unclosed_boundary(self):
        """A nonresolved target remains outside finite carry; it is not converted to empty success."""
        raw = _claim_finite_input(proposed_value="replacement proposal", resolved_target=False)
        raw_before, validated, _definitions, _identity, context, _carry = _same_call_context(raw)
        walk = evaluate_descriptor_definition_walk({"validated": validated})
        target = walk["target_reads"][0]
        self.assertEqual(target["state"], "unknown")
        self.assertEqual(target["matches"], [])
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary(context)
        self.assertEqual(str(caught.exception), UNRESOLVED_NONNULL_STOP)
        self.assertEqual(raw, raw_before)

    def test_equal_claim_values_at_distinct_locators_keep_distinct_walk_reads(self):
        """Same-value Claims remain per-occurrence reads at their original locators."""
        raw = _claim_finite_input(
            proposed_value="replacement proposal",
            resolved_target=True,
            duplicate_claim=True,
        )
        raw_before, validated, definitions, _identity, context, carry = _same_call_context(raw)
        walk = evaluate_descriptor_definition_walk({"validated": validated})
        self.assertEqual(
            [row["claim_locator"] for row in walk["target_reads"]],
            ["/claims/0", "/claims/1"],
        )
        self.assertEqual(
            [row["claim_locator"] for row in walk["intent_reads"]],
            ["/claims/0", "/claims/1"],
        )
        self.assertTrue(all(row["state"] == "resolved" and row["matches"] for row in walk["target_reads"]))
        _assert_public_carry(self, raw_before, context, carry)


if __name__ == "__main__":
    unittest.main()
