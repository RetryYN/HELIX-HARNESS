"""R2 identity predicateの負側: 一意停止枝、R66、ADD-14、outside全owner。"""

from __future__ import annotations

import copy
import unittest

from descriptor_definitions import (
    compare_identity_versions_and_trace,
    validate_supply_input,
)
from identity_input_fixtures import (
    _write_source_content,
    bilateral_input,
    normal_input,
    trace_input,
)
from test_identity_filename_claim import _filename_identity_claim_input


class TestIdentityR2PredicateNegatives(unittest.TestCase):
    def _call(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(validated["input"], "semantic case must pass fn0 decode")
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        validated_before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        return result

    def _claim(self, raw, *, kind="template_identity", proposed=None, basis=None):
        fact = raw["descriptors"][0]["facts"][0]
        claim = {
            "subject_ref": copy.deepcopy(fact["ref"]),
            "binding": copy.deepcopy(raw["binding"]),
            "actor": None,
            "kind": kind,
            "proposed_value": {"basis_role": "image_only"}
            if proposed is None
            else proposed,
            "basis_refs": [copy.deepcopy(fact["source_ref"])]
            if basis is None
            else basis,
        }
        raw["claims"].append(claim)
        return claim

    def _stop(self, raw, branch_id):
        before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsNotNone(
            validated["input"], "branch must reach fn3 after fn0 decode"
        )
        self.assertEqual(validated["input"], before)
        self.assertEqual(validated["input_issues"], [])
        with self.assertRaises(NotImplementedError) as caught:
            compare_identity_versions_and_trace({"validated": validated})
        self.assertIn(branch_id, str(caught.exception))
        self.assertIn("F04/N01", str(caught.exception))
        self.assertIn("HELIXBRAIN-L6-032-FN3-IDENTITY", str(caught.exception))
        self.assertEqual(raw, before)
        self.assertEqual(validated["input"], before)

    def test_identity_claim_malformed_branches_have_distinct_stop_ids(self):
        """L4 identity predicatesは対象kind内の不成立だけを枝別に停止する。"""
        variants = (
            ("subject_ref_shape", lambda claim: claim.update(subject_ref=7)),
            (
                "binding_shape",
                lambda claim: claim.update(binding={"unrecognized": True}),
            ),
            (
                "proposed_value_type",
                lambda claim: claim.update(proposed_value="not-an-object"),
            ),
            (
                "basis_role",
                lambda claim: claim.update(proposed_value={"unrelated": True}),
            ),
            (
                "basis_role",
                lambda claim: claim.update(proposed_value={"basis_role": []}),
            ),
            (
                "basis_role",
                lambda claim: claim.update(
                    proposed_value={"basis_role": {"untyped": True}}
                ),
            ),
            (
                "kind_role_mismatch",
                lambda claim: claim.update(
                    proposed_value={"basis_role": "tool_node_only"}
                ),
            ),
            ("basis_refs_type", lambda claim: claim.pop("basis_refs")),
            ("basis_refs_empty", lambda claim: claim.update(basis_refs=[])),
            (
                "basis_ref_shape",
                lambda claim: claim.update(basis_refs=[{"unrecognized": True}]),
            ),
        )
        for branch, mutate in variants:
            with self.subTest(branch=branch):
                raw = normal_input()
                claim = self._claim(raw)
                mutate(claim)
                self._stop(raw, f"unclosed/identity_claim/{branch}")

    def test_r66_basis_count_and_member_shape_have_distinct_stops(self):
        for branch, basis in (
            ("filename_basis_refs_count", []),
            ("filename_basis_refs_count", [normal_input()["sources"][0]["ref"]]),
            (
                "filename_basis_ref_shape",
                [{"unrecognized": True}, normal_input()["sources"][0]["ref"]],
            ),
        ):
            with self.subTest(branch=branch, count=len(basis)):
                raw, _source_a, _source_b, claim, _template_a, _template_b = (
                    _filename_identity_claim_input()
                )
                claim["basis_refs"] = copy.deepcopy(basis)
                self._stop(raw, f"unclosed/identity_claim/{branch}")

    def test_r66_does_not_join_when_filename_differs(self):
        raw, source_a, source_b, claim, _template_a, _template_b = (
            _filename_identity_claim_input()
        )
        source_b["ref"]["source_locator"] = "templates/different-name.json"
        q_b = next(
            q
            for q in raw["qualifications"]
            if q["ref"] == source_b["qualification_ref"]
        )
        q_b["subject_ref"] = copy.deepcopy(source_b["ref"])
        claim["basis_refs"][1] = copy.deepcopy(source_b["ref"])
        result = self._call(raw)
        self.assertNotEqual(
            source_a["ref"]["source_locator"], source_b["ref"]["source_locator"]
        )
        self.assertFalse(
            any(row["code"] == "filename_identity_join" for row in result["findings"])
        )

    def test_r66_does_not_join_when_candidate_identities_are_equal(self):
        raw, _source_a, source_b, claim_row, template_a, _template_b = (
            _filename_identity_claim_input()
        )
        content_b = copy.deepcopy(source_b["content"])
        content_b["binding"]["template_ref"]["identity"] = template_a["identity"]
        content_b["descriptor_facts"][0]["facts"][0]["binding"]["template_ref"][
            "identity"
        ] = template_a["identity"]
        _write_source_content(raw, source_b, content_b)
        slot_b = raw["descriptors"][-1]
        slot_b["binding"]["template_ref"]["identity"] = template_a["identity"]
        slot_b["facts"][0]["binding"]["template_ref"]["identity"] = template_a[
            "identity"
        ]
        slot_b["facts"][0]["source_ref"] = copy.deepcopy(source_b["ref"])
        claim_row["basis_refs"][1] = copy.deepcopy(source_b["ref"])
        raw["candidates"][-1]["identity"] = template_a["identity"]
        for record in raw["knowledge_records"]:
            if record["ref"] == slot_b["binding"]["knowledge_ref"]:
                record["provenance_refs"] = [copy.deepcopy(source_b["ref"])]
        result = self._call(raw)
        self.assertTrue(
            any(
                row["axis"] == "descriptor.trace"
                and row["state"] == "resolved"
                and row["subject_ref"] == slot_b["facts"][0]["ref"]
                for row in result["axes"]
            ),
            "equal identity must not lose qualified candidate B",
        )
        self.assertFalse(
            any(row["code"] == "filename_identity_join" for row in result["findings"])
        )

    def test_r66_requires_one_physical_source_occurrence_per_basis_ref(self):
        missing_raw, _source_a, _source_b, missing_claim, _ta, _tb = (
            _filename_identity_claim_input()
        )
        missing_claim["basis_refs"][1]["identity"] = "no-matching-source"
        missing_result = self._call(missing_raw)
        self.assertFalse(
            any(
                row["code"] == "filename_identity_join"
                for row in missing_result["findings"]
            )
        )

        raw, _source_a, source_b, _claim_row, _template_a, _template_b = (
            _filename_identity_claim_input()
        )
        raw["sources"].append(copy.deepcopy(source_b))
        result = self._call(raw)
        self.assertEqual(
            sum(row.get("ref") == source_b["ref"] for row in raw["sources"]), 2
        )
        self.assertFalse(
            any(row["code"] == "filename_identity_join" for row in result["findings"])
        )

    def test_ADD14_relation_requires_exact_kind_from_and_to(self):
        for changed_member in ("kind", "from_ref", "to_ref"):
            with self.subTest(member=changed_member):
                raw = trace_input("positive")
                old_ref = copy.deepcopy(raw["knowledge_records"][0]["ref"])
                fact = raw["descriptors"][0]["facts"][0]
                new_ref = copy.deepcopy(fact["binding"]["knowledge_ref"])
                new_ref["revision"] = "synthetic-next-revision"
                fact["binding"]["knowledge_ref"] = copy.deepcopy(new_ref)
                relation = {
                    "ref": {
                        **copy.deepcopy(old_ref),
                        "identity": "synthetic-add14-relation",
                    },
                    "binding": copy.deepcopy(raw["binding"]),
                    "kind": "supersedes",
                    "from_ref": copy.deepcopy(old_ref),
                    "to_ref": copy.deepcopy(new_ref),
                    "direction": "old_to_new",
                    "source_ref": copy.deepcopy(raw["sources"][0]["ref"]),
                }
                if changed_member == "kind":
                    relation["kind"] = "related_to"
                elif changed_member == "from_ref":
                    relation["from_ref"]["revision"] = "different-old-revision"
                else:
                    relation["to_ref"]["revision"] = "different-new-revision"
                raw["relations"].append(relation)
                result = self._call(raw)
                self.assertTrue(
                    any(
                        row["code"] == "silent_supersession"
                        and row["state"] == "conflict"
                        for row in result["findings"]
                    )
                )

    def test_outside_is_not_established_when_only_one_owner_declares_outside(self):
        raw = bilateral_input("outside")
        range_source = next(
            source
            for source in raw["sources"]
            if isinstance(source.get("content"), dict)
            and "compatibility_range_declaration" in source["content"]
        )
        old_ref = copy.deepcopy(range_source["ref"])
        content = copy.deepcopy(range_source["content"])
        content["compatibility_range_declaration"]["owner_declarations"][0][
            "relation"
        ] = "not_supplied"
        _write_source_content(raw, range_source, content)
        record = next(
            row for row in raw["compatibility_records"] if row["source_ref"] == old_ref
        )
        record["source_ref"] = copy.deepcopy(range_source["ref"])
        left = next(
            source
            for source in raw["sources"]
            if isinstance(source.get("content"), dict)
            and source["content"].get("counterpart_source_ref") == old_ref
        )
        left_body = copy.deepcopy(left["content"])
        left_body["counterpart_source_ref"] = copy.deepcopy(range_source["ref"])
        _write_source_content(raw, left, left_body)
        result = self._call(raw)
        self.assertFalse(
            any(
                row["code"] == "compatibility_mismatch" and row["state"] == "conflict"
                for row in result["findings"]
            )
        )
        self.assertFalse(
            any(
                row["axis"] == "compatibility"
                and row["state"] == "conflict"
                and "outside" in row["reason"]
                for row in result["axes"]
            )
        )


if __name__ == "__main__":
    unittest.main()
