"""F04-NEG-09: filename一致だけのidentity claimを独立入力で観測する。

根拠はL5 /failure_rules/66とClaim/QualifiedSource/MeaningFactの既存型、
/source_return_contract/constructor_meaning/{candidate_locality,reference_resolution}、
およびL4 /identity_version_trace_contract/same_call/source_qualification_writer と
/public_projection/axis_reason_writer/general_occurrence_cause_witness/finding_witness_table/8。
filenameはsource Refのlocatorとしてだけ同値にし、候補identityは各原Binding Refを保つ。
"""

from __future__ import annotations

import copy
import json
import unittest

from descriptor_definitions import (
    compare_descriptor_definitions,
    compare_identity_versions_and_trace,
    validate_supply_input,
)
from identity_input_fixtures import (
    _append_qualified_source,
    trace_input,
)


FILENAME = "templates/shared-name.json"
FILENAME_RULE = "HELIXBRAIN-L5-032-R-filename_identity_join"


def _filename_identity_claim_input():
    """既存Aを保ち、Binding Bのqualified source/slot/recordを追加する。"""
    raw = trace_input("positive")
    source_a = raw["sources"][0]
    original_source_a_bytes = source_a["content_bytes"]
    original_source_a_digest = source_a["ref"]["sha256"]
    qualification_a = next(
        row for row in raw["qualifications"]
        if row["ref"] == source_a["qualification_ref"]
    )

    binding_a = copy.deepcopy(raw["binding"])
    template_a = copy.deepcopy(binding_a["template_ref"])
    source_a["ref"]["source_locator"] = FILENAME
    qualification_a["subject_ref"] = copy.deepcopy(source_a["ref"])

    # Bは既存Bindingの型を保ち、candidate/template identityとknowledge Refだけ分ける。
    binding_b = copy.deepcopy(raw["descriptors"][0]["binding"])
    binding_b["template_ref"]["identity"] = "SYNTHETIC-TEMPLATE-B"
    binding_b["knowledge_ref"]["identity"] = "SYNTHETIC-KNOWLEDGE-B"
    template_b = copy.deepcopy(binding_b["template_ref"])

    logical_source_b_ref = copy.deepcopy(source_a["ref"])
    logical_source_b_ref.update({
        "identity": "SYNTHETIC-SEMANTIC-SOURCE-B",
        "sha256": None,
        "source_locator": FILENAME,
    })
    fact_b_in_body = copy.deepcopy(raw["descriptors"][0]["facts"][0])
    fact_b_in_body["ref"]["identity"] = "SYNTHETIC-DESCRIPTOR-B-FACT-1"
    fact_b_in_body["source_ref"] = copy.deepcopy(logical_source_b_ref)
    fact_b_in_body["binding"] = copy.deepcopy(binding_b)
    group_b = copy.deepcopy(source_a["content"]["descriptor_facts"][0])
    group_b["slot_identity"] = "synthetic-descriptor-B"
    group_b["descriptor_kind"] = "template identity"
    group_b["facts"] = [fact_b_in_body]
    content_b = {
        "binding": copy.deepcopy(binding_b),
        "descriptor_facts": [group_b],
    }
    source_b = _append_qualified_source(
        raw,
        identity=logical_source_b_ref["identity"],
        owner=binding_b["knowledge_ref"]["owner"],
        scope=copy.deepcopy(binding_b["template_ref"]["scope"]),
        content=content_b,
        qualification_identity="SYNTHETIC-SOURCE-B-QUALIFICATION",
        root_identity="SYNTHETIC-SOURCE-B-ROOT",
        revision=binding_b["template_ref"]["revision"],
    )
    source_b["ref"]["source_locator"] = FILENAME
    qualification_b = next(
        row for row in raw["qualifications"]
        if row["ref"] == source_b["qualification_ref"]
    )
    qualification_b["subject_ref"] = copy.deepcopy(source_b["ref"])

    fact_b = copy.deepcopy(fact_b_in_body)
    fact_b["source_ref"] = copy.deepcopy(source_b["ref"])
    raw["descriptors"].append({
        "slot_identity": "synthetic-descriptor-B",
        "descriptor_kind": "template identity",
        "binding": copy.deepcopy(binding_b),
        "facts": [fact_b],
        "comparison_refs": [],
        "definition_applicability_ref": None,
    })
    record_b = copy.deepcopy(raw["knowledge_records"][0])
    record_b["ref"] = copy.deepcopy(binding_b["knowledge_ref"])
    record_b["provenance_refs"] = [copy.deepcopy(source_b["ref"])]
    raw["knowledge_records"].append(record_b)
    raw["candidates"].append(copy.deepcopy(template_b))

    claim = {
        "subject_ref": copy.deepcopy(template_a),
        "binding": copy.deepcopy(binding_a),
        "actor": None,
        "kind": "same_template_identity",
        "proposed_value": {"same_filename": True},
        "basis_refs": [copy.deepcopy(source_a["ref"]), copy.deepcopy(source_b["ref"])],
    }
    raw["claims"].append(claim)

    # locatorだけの更新はsource body bytes/hashを変えない。RawValueへactual fieldを足さない。
    assert source_a["content_bytes"] == original_source_a_bytes
    assert source_a["ref"]["sha256"] == original_source_a_digest
    assert template_a["identity"] != template_b["identity"]
    assert source_a["ref"]["source_locator"] == source_b["ref"]["source_locator"]
    assert fact_b_in_body["source_ref"]["sha256"] is None
    assert source_a["content"]["binding"]["template_ref"] == template_a
    assert source_b["content"]["binding"]["template_ref"] == template_b
    assert raw["descriptors"][0]["binding"]["template_ref"] == template_a
    assert raw["descriptors"][-1]["binding"]["template_ref"] == template_b
    assert raw["candidates"][0] == template_a
    assert raw["candidates"][-1] == template_b
    return raw, source_a, source_b, claim, template_a, template_b


class TestFilenameIdentityClaim(unittest.TestCase):
    def test_qualified_distinct_identity_candidates_make_R66_claim_conflict(self):
        raw, source_a, source_b, claim, template_a, template_b = _filename_identity_claim_input()
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        validated_before = copy.deepcopy(validated)

        self.assertIsNotNone(validated["input"])
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["unusable_source_refs"], [])
        self.assertEqual(validated["input_issues"], [])
        result = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(result["producer_symbol"], "compare_identity_versions_and_trace")
        self.assertEqual(result["input_binding"], raw_before["binding"])

        findings = [row for row in result["findings"] if row["code"] == "filename_identity_join"]
        self.assertEqual(len(findings), 1)
        finding = findings[0]
        self.assertEqual(finding["rule_ref"], FILENAME_RULE)
        self.assertEqual(finding["axis"], "identity_claim")
        self.assertEqual(finding["state"], "conflict")
        self.assertEqual(finding["backflow_owner"], "knowledge_owner")
        self.assertEqual(finding["subject_ref"], claim["subject_ref"])
        self.assertEqual(finding["binding"], claim["binding"])
        source_indices = [raw_before["sources"].index(source_a), raw_before["sources"].index(source_b)]
        self.assertEqual(
            finding["source_refs"],
            [raw_before["sources"][index]["ref"] for index in source_indices],
        )
        self.assertEqual(finding["source_refs"][0]["source_locator"], FILENAME)
        self.assertEqual(finding["source_refs"][1]["source_locator"], FILENAME)
        self.assertNotEqual(template_a["identity"], template_b["identity"])
        template_identity_rows = [row for row in result["axes"] if row["axis"] == "template.identity"]
        self.assertTrue(template_identity_rows)
        self.assertTrue(all(row["subject_ref"] == template_a for row in template_identity_rows))
        self.assertTrue(all(row["binding"] == raw_before["binding"] for row in template_identity_rows))

        # fn1の既存の別Binding停止は維持し、fn1結果をfn3へ混ぜない。
        with self.assertRaisesRegex(NotImplementedError, "F02/descriptor_slot_binding_unresolved"):
            compare_descriptor_definitions({"validated": validated})

        _prefix, separator, diagnostic = finding["reason"].partition("\n")
        self.assertTrue(separator)
        material = json.loads(diagnostic)
        self.assertEqual(material["code"], "filename_identity_join")
        self.assertEqual(material["rule_ref"], FILENAME_RULE)
        observations = material["predicate_observations"]
        self.assertTrue(any(row["locator"].startswith("/claims/0/basis_refs") for row in observations))
        observations_json = json.dumps(observations, ensure_ascii=False)
        self.assertIn(template_a["identity"], observations_json)
        self.assertIn(template_b["identity"], observations_json)
        # filename/semantic identity claim alone supplies no artifact actual-version body or trust.
        self.assertFalse(any(
            row["axis"] == "template.version" and row["state"] == "resolved"
            for row in result["axes"]
        ))

    def test_unqualified_candidate_cannot_support_R66_and_fn1_unfrozen_binding_remains_stopped(self):
        raw, _source_a, source_b, _claim, _template_a, _template_b = _filename_identity_claim_input()
        qualification_b = next(
            row for row in raw["qualifications"]
            if row["ref"] == source_b["qualification_ref"]
        )
        qualification_b["subject_sha256"] = "0" * 64
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)

        self.assertIsNotNone(validated["input"])
        self.assertEqual(validated["input"], raw_before)
        self.assertTrue(any(
            ref == source_b["ref"] for ref in validated["unusable_source_refs"]
        ))
        self.assertTrue(any(
            row["source_ref"] == source_b["ref"] for row in validated["input_issues"]
        ))
        with self.assertRaisesRegex(NotImplementedError, "F02/descriptor_slot_binding_unresolved"):
            compare_descriptor_definitions({"validated": validated})

        # Bのqualification不成立を、無関係なAの成功や新identity_claim行へ置換しない。
        result = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated["input"], raw_before)
        self.assertFalse(any(row["code"] == "filename_identity_join" for row in result["findings"]))
        trace_a = next(row for row in result["axes"]
                       if row["axis"] == "descriptor.trace"
                       and row["subject_ref"] == raw_before["descriptors"][0]["facts"][0]["ref"])
        trace_b = next(row for row in result["axes"]
                       if row["axis"] == "descriptor.trace"
                       and row["subject_ref"] == raw_before["descriptors"][-1]["facts"][0]["ref"])
        self.assertEqual(trace_a["state"], "resolved")
        self.assertEqual(trace_b["state"], "unknown")
        self.assertFalse(any(row["axis"] == "identity_claim" for row in result["axes"]))


if __name__ == "__main__":
    unittest.main()
