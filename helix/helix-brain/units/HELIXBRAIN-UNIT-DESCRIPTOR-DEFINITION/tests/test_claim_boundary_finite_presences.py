"""L4有限raw条件のpresence・住所対応・typed operationを固定する。

pure guardの分類だけを測り、非空meaning decoderや公開ClaimContextの成立を
主張しない。全値は原inputとして構成し、Comparison/frameを作らない。
"""
import copy
import unittest

from claim_boundaries import _validate_finite_domain
from claim_boundary_input_fixtures import finite_claim_input
from descriptor_definitions import validate_supply_input
from identity_input_fixtures import _same_ref_without_digest, _write_source_content
from test_claim_boundary_finite_domain import (
    _contract_literal, _root_fact_variant, _operation_fact_body_variant,
)

STOP = "FN7/unclosed/finite_domain; Backflow HELIXBRAIN-L6-032-FN7-CLAIM"


def _sync_source(raw, source):
    old = copy.deepcopy(source["ref"])
    _write_source_content(raw, source, copy.deepcopy(source["content"]))
    for record in raw["knowledge_records"]:
        record["provenance_refs"] = [
            copy.deepcopy(source["ref"]) if _same_ref_without_digest(ref, old)
            else copy.deepcopy(ref)
            for ref in record["provenance_refs"]
        ]


def _assert_fn0_clean(test, raw):
    v = validate_supply_input(raw)
    test.assertEqual(v["input"], raw)
    test.assertEqual(v["input_issues"], [])
    test.assertEqual(v["unusable_source_refs"], [])


class TestClaimBoundaryFinitePresences(unittest.TestCase):
    def _expect_stop(self, raw):
        before = copy.deepcopy(raw)
        with self.assertRaises(NotImplementedError) as caught:
            _validate_finite_domain(raw)
        self.assertEqual(str(caught.exception), STOP)
        self.assertEqual(raw, before)

    def test_optional_slot_metadata_absence_is_not_a_new_finite_requirement(self):
        # L5 DescriptorSlot has optional properties; L4 adds own facts array and
        # known kind, not required comparison/applicability or other metadata.
        for member in ("comparison_refs", "definition_applicability_ref", "slot_identity", "binding"):
            with self.subTest(absent=member):
                raw = finite_claim_input("none")
                _root_fact_variant(raw, _contract_literal())
                del raw["descriptors"][0][member]
                _assert_fn0_clean(self, raw)
                before = copy.deepcopy(raw)
                self.assertIsNone(_validate_finite_domain(raw))
                self.assertEqual(raw, before)

    def test_each_claim_requires_its_original_ref_and_binding_owner_declaration(self):
        for variant in ("carrier_absent", "subject_differs", "binding_differs", "second_claim_unaddressed"):
            with self.subTest(variant=variant):
                raw = finite_claim_input("none")
                if variant == "carrier_absent":
                    del raw["sources"][0]["content"]["descriptor_targets"]
                    _sync_source(raw, raw["sources"][0])
                elif variant == "subject_differs":
                    raw["claims"][0]["subject_ref"]["identity"] += "-unaddressed"
                elif variant == "binding_differs":
                    raw["claims"][0]["binding"]["template_ref"]["identity"] += "-other"
                else:
                    second = copy.deepcopy(raw["claims"][0])
                    second["subject_ref"]["identity"] += "-unaddressed"
                    raw["claims"].append(second)
                _assert_fn0_clean(self, raw)
                self._expect_stop(raw)

    def test_operation_keeps_existing_closed_typed_members_without_decoding_meaning(self):
        for variant in ("extra_operation", "missing_operation_ref", "extra_argument", "missing_binding", "invalid_relation", "extra_normative"):
            with self.subTest(variant=variant):
                raw = finite_claim_input("none")
                _operation_fact_body_variant(raw, _contract_literal())
                source = raw["sources"][0]
                operation = source["content"]["definition_meaning_operations"][0]
                if variant == "extra_operation":
                    operation["unmodeled"] = None
                elif variant == "missing_operation_ref":
                    del operation["operation_ref"]
                elif variant == "extra_argument":
                    operation["arguments"]["unmodeled"] = None
                elif variant == "missing_binding":
                    del operation["arguments"]["binding"]
                elif variant == "invalid_relation":
                    operation["decision"]["relation"] = "unknown-relation"
                else:
                    operation["arguments"]["normative_argument"]["unmodeled"] = None
                _sync_source(raw, source)
                _assert_fn0_clean(self, raw)
                self._expect_stop(raw)
