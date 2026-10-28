"""FN4のL4有限carry枝を実入力で固定する。

根拠はL4 /oracle_view_boundary_contract/nonfire_read_plan。対象3kindの
実slot・OracleBinding・ValueFact・HandoffRecordを持たず、必要kind宣言は
残る入力で、fn1の原missing axisだけを原順・原値のままcarryする。
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definitions import (
    compare_descriptor_definitions,
    compare_identity_versions_and_trace,
    compare_oracle_and_view_boundary,
    validate_supply_input,
)
from identity_input_fixtures import (
    _same_ref_without_digest,
    _write_source_content,
    normal_input,
)


FN1 = "compare_descriptor_definitions"
FN3 = "compare_identity_versions_and_trace"
FN4 = "compare_oracle_and_view_boundary"
TARGET_KINDS = {"measurement", "completion", "negative oracle"}
CARRY_AXES = [
    "measurement.definition",
    "completion.definition",
    "negative oracle.definition",
]
AXIS_MEMBERS = {
    "subject_ref",
    "binding",
    "axis",
    "state",
    "original_refs",
    "reason",
    "backflow_owner",
}


def _finite_input(populations="absent"):
    """L4の有限枝をraw carrier上で構成し、Qualification/provenanceを同期する。"""
    if populations not in {"absent", "empty"}:
        raise ValueError("unknown population presence mode")
    raw = normal_input()
    raw["descriptors"] = [
        slot
        for slot in raw["descriptors"]
        if slot["descriptor_kind"] not in TARGET_KINDS
    ]

    # 全sourceをL4 role別許容集合内のbinding-only bodyへする。
    # これは資格の合成ではなく、既存source bytes/Qの同期である。
    for source in raw["sources"]:
        previous_ref = copy.deepcopy(source["ref"])
        _write_source_content(raw, source, {"binding": copy.deepcopy(raw["binding"])})
        current_ref = source["ref"]
        for slot in raw["descriptors"]:
            for fact in slot["facts"]:
                if _same_ref_without_digest(fact.get("source_ref"), previous_ref):
                    fact["source_ref"] = copy.deepcopy(current_ref)
        for record in raw["knowledge_records"]:
            record["provenance_refs"] = [
                copy.deepcopy(current_ref)
                if _same_ref_without_digest(ref, previous_ref)
                else ref
                for ref in record["provenance_refs"]
            ]

    # fn1の現行入口はclaims arrayを要求するため、空配列を保持する。
    raw["claims"] = []
    for member in ("oracle_bindings", "values", "handoff_records"):
        if populations == "absent":
            raw.pop(member, None)
        else:
            raw[member] = []
    return raw


class TestOracleFiniteCarry(unittest.TestCase):
    def _formed_context(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(
            validated["input"], "setup: FN0 must decode the finite input"
        )
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(
            validated["input_issues"], [], "setup: no structural input issue"
        )
        self.assertEqual(
            validated["unusable_source_refs"],
            [],
            "setup: synchronized sources remain usable",
        )

        definitions = compare_descriptor_definitions({"validated": validated})
        identity_trace = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(definitions["producer_symbol"], FN1)
        self.assertEqual(identity_trace["producer_symbol"], FN3)
        self.assertEqual(definitions["input_binding"], raw_before["binding"])
        self.assertEqual(identity_trace["input_binding"], raw_before["binding"])
        carry = [row for row in definitions["axes"] if row["axis"] in CARRY_AXES]
        self.assertCountEqual([row["axis"] for row in carry], CARRY_AXES)
        self.assertTrue(carry, "setup: fn1 must supply the finite carry population")
        self.assertTrue(all(set(row) == AXIS_MEMBERS for row in carry))
        self.assertTrue(all(row["state"] == "missing" for row in carry))

        context = {
            "validated": validated,
            "definitions": definitions,
            "identity_trace": identity_trace,
        }
        return raw_before, validated, definitions, identity_trace, context, carry

    def _assert_fn4_carries_only_original_definition_rows(self, raw, context, carry):
        raw_before = copy.deepcopy(raw)
        validated_before = copy.deepcopy(context["validated"])
        definitions_before = copy.deepcopy(context["definitions"])
        identity_trace_before = copy.deepcopy(context["identity_trace"])
        context_before = copy.deepcopy(context)

        result = compare_oracle_and_view_boundary(context)

        self.assertEqual(
            set(result), {"axes", "findings", "producer_symbol", "input_binding"}
        )
        self.assertEqual(result["producer_symbol"], FN4)
        self.assertEqual(result["input_binding"], raw["binding"])
        self.assertEqual(result["axes"], carry)
        self.assertEqual(
            [row["axis"] for row in result["axes"]], [row["axis"] for row in carry]
        )
        self.assertTrue(all(set(row) == AXIS_MEMBERS for row in result["axes"]))
        self.assertEqual(result["findings"], [])
        self.assertEqual(raw, raw_before)
        self.assertEqual(context["validated"], validated_before)
        self.assertEqual(context["definitions"], definitions_before)
        self.assertEqual(context["identity_trace"], identity_trace_before)
        self.assertEqual(context, context_before)

    def test_absent_empty_populations_carry_three_original_missing_axes(self):
        """Absent branch: 原順3軸をcarryし、fn1/fn3の他行を転載しない。"""
        raw = _finite_input("absent")
        for member in ("oracle_bindings", "values", "handoff_records"):
            self.assertNotIn(member, raw)
        self.assertFalse(
            any(slot["descriptor_kind"] in TARGET_KINDS for slot in raw["descriptors"])
        )
        raw_before, _, _, _, context, carry = self._formed_context(raw)
        self._assert_fn4_carries_only_original_definition_rows(
            raw_before, context, carry
        )

    def test_explicit_empty_populations_keep_their_presence_and_carry_rows(self):
        """[] branch: zero件はabsentへ正規化せず、同じcarry行を保持する。"""
        raw = _finite_input("empty")
        for member in ("oracle_bindings", "values", "handoff_records"):
            self.assertIn(member, raw)
            self.assertEqual(raw[member], [])
        raw_before, _, _, _, context, carry = self._formed_context(raw)
        self._assert_fn4_carries_only_original_definition_rows(
            raw_before, context, carry
        )

    def test_reference_only_source_with_allowed_content_key_remains_in_finite_domain(
        self,
    ):
        """L4 role/key allowlist: reference_onlyとreference_targetは有限枝内。"""
        raw = _finite_input("absent")
        source = raw["sources"][0]
        source["role"] = "reference_only"
        _write_source_content(
            raw,
            source,
            {
                "binding": copy.deepcopy(raw["binding"]),
                "reference_target": copy.deepcopy(
                    raw["descriptors"][0]["facts"][0]["ref"]
                ),
            },
        )
        raw_before, _, _, _, context, carry = self._formed_context(raw)
        self._assert_fn4_carries_only_original_definition_rows(
            raw_before, context, carry
        )

    def test_target_descriptor_slot_is_not_misclassified_as_finite_carry(self):
        """L4: target実slotはfacts内容に関わらず有限枝の外として停止する。"""
        raw = _finite_input("absent")
        original = normal_input()
        target_slot = next(
            slot
            for slot in original["descriptors"]
            if slot["descriptor_kind"] == "measurement"
        )
        raw["descriptors"].append(copy.deepcopy(target_slot))
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(
            validated["input"], "setup: FN0 must decode the out-of-branch case"
        )
        self.assertEqual(validated["input_issues"], [])
        definitions = compare_descriptor_definitions({"validated": validated})
        identity_trace = compare_identity_versions_and_trace({"validated": validated})
        context = {
            "validated": validated,
            "definitions": definitions,
            "identity_trace": identity_trace,
        }
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary(context)
        self.assertEqual(
            str(caught.exception),
            "F05/F06/unclosed/formed_context; owner=knowledge_owner; "
            "Backflow HELIXBRAIN-L6-032-FN4-ORACLE",
        )
        self.assertIn("Backflow HELIXBRAIN-L6-032-FN4-ORACLE", str(caught.exception))
        self.assertEqual(raw, raw_before)

    def _assert_outside_finite_domain_stops(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(
            validated["input"], "setup: FN0 must preserve raw branch input"
        )
        self.assertEqual(validated["input_issues"], [], "setup: no structural issue")
        definitions = compare_descriptor_definitions({"validated": validated})
        identity_trace = compare_identity_versions_and_trace({"validated": validated})
        context = {
            "validated": validated,
            "definitions": definitions,
            "identity_trace": identity_trace,
        }
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary(context)
        self.assertEqual(
            str(caught.exception),
            "F05/F06/unclosed/formed_context; owner=knowledge_owner; "
            "Backflow HELIXBRAIN-L6-032-FN4-ORACLE",
        )
        self.assertIn("Backflow HELIXBRAIN-L6-032-FN4-ORACLE", str(caught.exception))
        self.assertEqual(raw, raw_before)

    def test_unknown_source_content_key_is_not_treated_as_nonfire(self):
        """L4 source_content_shape: 未知top-level keyは有限枝外。"""
        raw = _finite_input("absent")
        source = raw["sources"][0]
        content = copy.deepcopy(source["content"])
        content["unrecognized_record"] = {"descriptor_kind": "measurement"}
        _write_source_content(raw, source, content)
        self._assert_outside_finite_domain_stops(raw)

    def test_derived_view_role_is_not_reclassified_from_its_binding_key(self):
        """L4 roles: derived_view原sourceはbody keyからsemantic_jsonに推定しない。"""
        raw = _finite_input("absent")
        raw["sources"][0]["role"] = "derived_view"
        self._assert_outside_finite_domain_stops(raw)

    def test_typed_target_kind_in_source_census_is_not_ignored(self):
        """L4 typed_kind_census: semantic_json descriptor_factsの対象kindで停止。"""
        raw = _finite_input("absent")
        source = raw["sources"][0]
        source["content"]["descriptor_facts"] = [
            {
                "descriptor_kind": "measurement",
                "slot_identity": "census-target-measurement",
                "facts": [],
            }
        ]
        _write_source_content(raw, source, source["content"])
        self._assert_outside_finite_domain_stops(raw)

    def test_nonempty_oracle_value_and_handoff_populations_are_not_nonfire(self):
        """L4 oracle_and_values/handoff_records:非空原recordを成功非発火にしない。"""
        original = normal_input()
        for member in ("oracle_bindings", "values", "handoff_records"):
            with self.subTest(population=member):
                raw = _finite_input("absent")
                raw[member] = copy.deepcopy(original[member])
                self._assert_outside_finite_domain_stops(raw)


if __name__ == "__main__":
    unittest.main()
