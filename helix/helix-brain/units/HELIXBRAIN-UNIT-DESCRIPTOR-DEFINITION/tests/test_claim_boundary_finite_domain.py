"""FN7有限domainの純raw guard用TDD。

根拠: L4 `claim_boundary_projection_contract/finite_domain` と
`/meaning_carrier_predicate`。契約定数はL4 JSONから独立に読み、fixture dispatchや
known/qualificationの根拠に使わない。raw guardのNoneは適用範囲分類のみで、
FN7 Comparisonや意味読取の成功を表さない。
"""

from __future__ import annotations

import copy
import json
from pathlib import Path
import unittest

from claim_boundaries import (
    _FINITE_MEANING_LITERAL,
    _meaning_value_in_finite_domain,
    _validate_finite_domain,
)
from descriptor_definitions import validate_supply_input
from claim_boundary_input_fixtures import finite_claim_input
from identity_input_fixtures import (
    _same_ref_without_digest,
    _write_source_content,
    normal_input,
)
from test_oracle_finite_carry import _finite_input
from test_descriptor_empty_meaning_carrier import _typed_nonempty_operation


MEANING_UNCLOSED = (
    "FN7/unclosed/finite_meaning_value; Backflow HELIXBRAIN-L6-032-FN7-CLAIM"
)
DOMAIN_UNCLOSED = "FN7/unclosed/finite_domain; Backflow HELIXBRAIN-L6-032-FN7-CLAIM"
CANDIDATES_UNCLOSED = (
    "FN7/unclosed/finite_candidates; Backflow HELIXBRAIN-L6-032-FN7-CLAIM"
)
OTHER_EMPTY = (
    "meaning_comparisons",
    "section_fields",
    "values",
    "applicability_records",
    "relations",
    "oracle_bindings",
    "compatibility_records",
    "handoff_records",
)


def _contract_literal():
    repo = Path(__file__).resolve().parents[5]
    document = json.loads(
        (
            repo / "docs/helix-brain/L4-basic-design/template-semantic-supply.json"
        ).read_text(encoding="utf-8")
    )
    return document["claim_boundary_projection_contract"]["finite_domain"][
        "meaning_carrier_predicate"
    ]["meaning_object_literals"][0]


def _expect_stop(test: unittest.TestCase, raw, exact_message: str):
    # 呼出しだけを捕捉し、KeyError/TypeError等を期待stopへすり替えない。
    with test.assertRaises(NotImplementedError) as caught:
        _validate_finite_domain(raw)
    test.assertEqual(str(caught.exception), exact_message)


def _finite_raw():
    raw = finite_claim_input("none")
    before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    if validated.get("input") != before:
        raise AssertionError("setup: FN0 must preserve the finite raw snapshot")
    if (
        validated.get("input_issues") != []
        or validated.get("unusable_source_refs") != []
    ):
        raise AssertionError("setup: finite_claim_input('none') must be FN0-clean")
    return raw


def _root_fact_variant(raw, meaning):
    """既存L7 root slot/factを一つ保持し、meaningだけ有限値へ置く。"""
    template = _finite_input("empty")
    slot = copy.deepcopy(template["descriptors"][0])
    if not slot.get("facts"):
        raise AssertionError("setup: selected original root slot has no facts")
    slot["facts"] = [copy.deepcopy(slot["facts"][0])]
    slot["facts"][0].pop("oracle_ref", None)
    slot["facts"][0]["meaning"] = copy.deepcopy(meaning)
    slot_kind = slot["descriptor_kind"]
    if slot_kind not in raw["required_descriptor_kinds"]:
        raise AssertionError(
            "setup: original slot kind is not in the retained required-kind array"
        )
    # finite_claim_input changed the declared target source body/digest. Rebind
    # only the copied root fact's existing source occurrence to the corresponding
    # existing source Ref in this raw snapshot; no source/Q is synthesized.
    original_source_ref = slot["facts"][0].get("source_ref")
    matches = [
        source["ref"]
        for source in raw["sources"]
        if _same_ref_without_digest(source.get("ref"), original_source_ref)
    ]
    if len(matches) != 1:
        raise AssertionError(
            "setup: copied root fact must resolve to one existing source"
        )
    slot["facts"][0]["source_ref"] = copy.deepcopy(matches[0])
    raw["descriptors"].append(slot)
    return raw


def _source_fact_variant(raw, meaning):
    """既存qualified semantic_json sourceへ原slot由来の一fact群を同期する。"""
    template = _finite_input("empty")
    slot = copy.deepcopy(template["descriptors"][0])
    fact = copy.deepcopy(slot["facts"][0])
    if slot["descriptor_kind"] not in raw["required_descriptor_kinds"]:
        raise AssertionError("setup: source fact kind must be a declared existing kind")
    source_matches = [
        source
        for source in raw["sources"]
        if source.get("role") == "semantic_json"
        and _same_ref_without_digest(source.get("ref"), fact.get("source_ref"))
    ]
    if len(source_matches) != 1:
        raise AssertionError(
            "setup: original source fact must resolve to one existing semantic_json source"
        )
    source = source_matches[0]
    old_ref = copy.deepcopy(source["ref"])
    in_body_ref = copy.deepcopy(old_ref)
    # The body is its own source; use the existing self-reference representation
    # with nullable digest, then let the existing fixture helper sync source bytes,
    # full Ref digest, Qualification, and KB provenance.
    in_body_ref["sha256"] = None
    fact.pop("oracle_ref", None)
    fact["source_ref"] = in_body_ref
    fact["meaning"] = copy.deepcopy(meaning)
    content = copy.deepcopy(source["content"])
    content["descriptor_facts"] = [
        {
            "slot_identity": copy.deepcopy(slot["slot_identity"]),
            "descriptor_kind": slot["descriptor_kind"],
            "facts": [fact],
        }
    ]
    _write_source_content(raw, source, content)
    new_ref = copy.deepcopy(source["ref"])
    for record in raw["knowledge_records"]:
        record["provenance_refs"] = [
            copy.deepcopy(new_ref)
            if _same_ref_without_digest(ref, old_ref)
            else copy.deepcopy(ref)
            for ref in record["provenance_refs"]
        ]
    return raw


def _operation_fact_body_variant(raw, meaning):
    """原qualified sourceのoperation arguments.fact_bodyを個別に検査する。"""
    template = _finite_input("empty")
    slot = copy.deepcopy(template["descriptors"][0])
    fact = copy.deepcopy(slot["facts"][0])
    source = next(
        source
        for source in raw["sources"]
        if source.get("role") == "semantic_json"
        and _same_ref_without_digest(source.get("ref"), fact.get("source_ref"))
    )
    content = copy.deepcopy(source["content"])
    # G5で既に用いたtyped原operation入力を再利用し、同L4 pinのnormative
    # argumentを保持する。raw guardの形検証だけでdecoder/意味支持は主張しない。
    operation = _typed_nonempty_operation(template)
    operation["arguments"]["fact_body"] = copy.deepcopy(meaning)
    content["definition_meaning_operations"] = [operation]
    old_ref = copy.deepcopy(source["ref"])
    _write_source_content(raw, source, content)
    new_ref = copy.deepcopy(source["ref"])
    for record in raw["knowledge_records"]:
        record["provenance_refs"] = [
            copy.deepcopy(new_ref)
            if _same_ref_without_digest(ref, old_ref)
            else copy.deepcopy(ref)
            for ref in record["provenance_refs"]
        ]
    return raw


class TestClaimBoundaryFiniteDomain(unittest.TestCase):
    def test_l4_literal_predicate_uses_exact_object_or_explicit_null(self):
        """L4定数全値・key集合を比較し、nullのみ別途枝内に保つ。"""
        literal = _contract_literal()
        self.assertEqual(_FINITE_MEANING_LITERAL, literal)
        self.assertTrue(_meaning_value_in_finite_domain(copy.deepcopy(literal)))
        self.assertTrue(_meaning_value_in_finite_domain(None))

        for key in ("template_identity", "functional_role"):
            changed = copy.deepcopy(literal)
            changed[key] = changed[key] + "-different"
            self.assertFalse(_meaning_value_in_finite_domain(changed), key)

        extra = copy.deepcopy(literal)
        extra["unapproved"] = "x"
        self.assertFalse(_meaning_value_in_finite_domain(extra), "additional member")
        for missing in ("template_identity", "functional_role"):
            incomplete = copy.deepcopy(literal)
            del incomplete[missing]
            self.assertFalse(_meaning_value_in_finite_domain(incomplete), missing)
        for wrong in (
            {"template_identity": 7, "functional_role": literal["functional_role"]},
            {
                "template_identity": literal["template_identity"],
                "functional_role": None,
            },
            [],
            "meaning",
            1,
            False,
        ):
            self.assertFalse(_meaning_value_in_finite_domain(wrong), repr(wrong))

    def test_raw_guard_checks_root_source_and_operation_body_occurrences(self):
        """各carrier出現を独立に読む。passは有限枝の形分類に限る。"""
        literal = _contract_literal()
        base = _finite_raw()
        before = copy.deepcopy(base)
        self.assertIsNone(_validate_finite_domain(base))
        self.assertEqual(base, before)

        variants = (
            ("root fact", _root_fact_variant, "meaning"),
            ("source descriptor fact", _source_fact_variant, "meaning"),
            (
                "operation arguments fact_body",
                _operation_fact_body_variant,
                "fact_body",
            ),
        )
        for label, build, member in variants:
            with self.subTest(carrier=label):
                for inside in (copy.deepcopy(literal), None):
                    raw = _finite_raw()
                    build(raw, inside)
                    raw_before = copy.deepcopy(raw)
                    self.assertIsNone(_validate_finite_domain(raw), label)
                    self.assertEqual(
                        raw, raw_before, "raw guard must not normalize the snapshot"
                    )

                for changed_key in ("template_identity", "functional_role"):
                    outside = copy.deepcopy(literal)
                    outside[changed_key] += "-outside"
                    raw = _finite_raw()
                    build(raw, outside)
                    _expect_stop(self, raw, MEANING_UNCLOSED)

    def test_raw_guard_keeps_other_finite_domain_exclusions_unclosed(self):
        """空censusの枝だけを保ち、候補/collection/KB/Claim型外を成功へ変えない。"""
        raw = _finite_raw()
        raw["candidates"] = [copy.deepcopy(normal_input()["candidates"][0])]
        _expect_stop(self, raw, CANDIDATES_UNCLOSED)

        for member in OTHER_EMPTY:
            with self.subTest(collection=member, form="nonempty"):
                raw = _finite_raw()
                raw[member] = [None]
                _expect_stop(self, raw, DOMAIN_UNCLOSED)
            with self.subTest(collection=member, form="wrong-type"):
                raw = _finite_raw()
                raw[member] = None
                _expect_stop(self, raw, DOMAIN_UNCLOSED)

        raw = _finite_raw()
        raw["knowledge_records"].append(copy.deepcopy(raw["knowledge_records"][0]))
        _expect_stop(self, raw, DOMAIN_UNCLOSED)

        raw = _finite_raw()
        raw["claims"][0]["proposed_value"] = True
        _expect_stop(self, raw, DOMAIN_UNCLOSED)


if __name__ == "__main__":
    unittest.main()
