"""G5: empty versus absent original definition-meaning operation carriers.

Contract basis:
- L4 /oracle_view_boundary_contract/nonfire_read_plan/typed_kind_census keeps
  absent and [] distinct while both have zero original operation occurrences.
- L5 /source_return_contract/descriptor_target_dataflow/definition_meaning_core/
  basic_reader_bindings/meaning/body/algorithm/1 reads and retains the raw
  carrier; a typed carrier with no operations does not create supports.
- L4 /definition_meaning_resolution_contract/normative_basis_snapshot pins the
  fixed descriptor meaning catalog. The request below uses its literal entry
  pointer for slot 0, independent of the production constructor.

Input source bytes, qualification digest, KB provenance, and fact source refs
are updated together, following the existing trace_input fixture construction.
No expected walk or Comparison is copied from production output.
"""

from __future__ import annotations

import copy
import json
import unittest
from pathlib import Path

from descriptor_definition_reads import read_original_definition_meaning_bundle
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import validate_supply_input
from identity_input_fixtures import (
    _same_ref_without_digest,
    _write_source_content,
    trace_input,
)


BACKFLOW = "HELIXBRAIN-L6-032-N03-PATH"
MEANING_REQUEST = {
    "slot_locator": "/descriptors/0",
    "fact_locator": "/descriptors/0/facts/0",
    "normative_entry_pointer": "/descriptor_meanings/0",
}
L4_PATH = Path(__file__).resolve().parents[5] / (
    "docs/helix-brain/L4-basic-design/template-semantic-supply.json"
)


def _normative_frame_from_l4(descriptor_kind: str) -> dict:
    snapshot = json.loads(L4_PATH.read_text(encoding="utf-8"))[
        "definition_meaning_resolution_contract"
    ]["normative_basis_snapshot"]
    entry = next(
        row
        for row in snapshot["entries"]
        if row["value"]["descriptor"] == descriptor_kind
    )
    return {
        "revision": snapshot["revision"],
        "path": snapshot["path"],
        "file_sha256": snapshot["file_sha256"],
        "catalog_pointer": snapshot["pointer"],
        "catalog_canonical_sha256": snapshot["canonical_sha256"],
        "scope": copy.deepcopy(snapshot["scope"]),
        "entry_pointer": entry["pointer"],
        "entry_canonical_sha256": entry["canonical_sha256"],
        "entry_value": copy.deepcopy(entry["value"]),
    }


def _trace_raw_with_carrier(carrier: object | None, *, supplied: bool) -> dict:
    raw = trace_input()
    source = raw["sources"][0]
    old_source_ref = copy.deepcopy(source["ref"])
    content = copy.deepcopy(source["content"])
    if supplied:
        content["definition_meaning_operations"] = copy.deepcopy(carrier)
    else:
        content.pop("definition_meaning_operations", None)
    _write_source_content(raw, source, content)
    new_source_ref = copy.deepcopy(source["ref"])

    for record in raw["knowledge_records"]:
        record["provenance_refs"] = [
            copy.deepcopy(new_source_ref)
            if _same_ref_without_digest(ref, old_source_ref)
            else copy.deepcopy(ref)
            for ref in record.get("provenance_refs", [])
        ]
    for slot in raw["descriptors"]:
        for fact in slot.get("facts", []):
            if _same_ref_without_digest(fact.get("source_ref"), old_source_ref):
                fact["source_ref"] = copy.deepcopy(new_source_ref)
    return raw


def _typed_nonempty_operation(raw: dict) -> dict:
    slot = raw["descriptors"][0]
    fact = slot["facts"][0]
    return {
        "operation_ref": copy.deepcopy(raw["binding"]["template_ref"]),
        "arguments": {
            "binding": copy.deepcopy(raw["binding"]),
            "slot_identity": slot["slot_identity"],
            "descriptor_kind": slot["descriptor_kind"],
            "fact_ref": copy.deepcopy(fact["ref"]),
            "fact_body": copy.deepcopy(fact["meaning"]),
            "normative_argument": _normative_frame_from_l4(slot["descriptor_kind"]),
        },
        "decision": {
            "relation": "undetermined",
            "reason": {"presence": "absent"},
            "raw_semantic_basis": {"presence": "absent"},
            "basis_refs": [],
        },
    }


def _validate(raw: dict) -> dict:
    validated = validate_supply_input(raw)
    if validated["input"] != raw:
        raise AssertionError(
            "setup: FN0 must preserve the original carrier presence/value"
        )
    if validated["input_issues"] or validated["unusable_source_refs"]:
        raise AssertionError(
            "setup: FN0 must accept the synchronized qualified fixture"
        )
    return validated


class TestDescriptorEmptyMeaningCarrier(unittest.TestCase):
    def test_explicit_empty_carrier_is_zero_occurrences_without_problems_or_supports(
        self,
    ) -> None:
        raw = _trace_raw_with_carrier([], supplied=True)
        raw_before = copy.deepcopy(raw)
        source = raw["sources"][0]
        self.assertIn("definition_meaning_operations", source["content"])
        self.assertEqual(source["content"]["definition_meaning_operations"], [])
        self.assertEqual(
            source["content_bytes"],
            json.dumps(source["content"], ensure_ascii=False, separators=(",", ":")),
        )
        qualification = next(
            row
            for row in raw["qualifications"]
            if row["ref"] == source["qualification_ref"]
        )
        self.assertEqual(qualification["subject_ref"], source["ref"])
        self.assertEqual(qualification["subject_sha256"], source["ref"]["sha256"])
        self.assertEqual(raw["descriptors"][0]["facts"][0]["source_ref"], source["ref"])

        # FN0 and the direct original reader observe one immutable same-call V.
        validated = _validate(raw)
        validated_before = copy.deepcopy(validated)
        bundle = read_original_definition_meaning_bundle(validated, MEANING_REQUEST)
        read = bundle["read"]
        self.assertEqual(read["slot_locator"], "/descriptors/0")
        self.assertEqual(read["fact_locator"], "/descriptors/0/facts/0")
        self.assertEqual(
            read["binding"],
            {"presence": "supplied", "value": raw["descriptors"][0]["binding"]},
        )
        self.assertEqual(
            read["normative_frame"], _normative_frame_from_l4("template identity")
        )
        self.assertEqual(read["acquisition_state"], "unknown")
        self.assertEqual(read["occurrences"], [])
        self.assertEqual(read["supports"], [])
        self.assertEqual(read["problems"], [])
        self.assertEqual(bundle["problem_scopes"], [])
        self.assertEqual(bundle["support_origins"], [])
        self.assertEqual(validated, validated_before)
        self.assertEqual(raw, raw_before)

    def test_absent_carrier_keeps_absence_and_one_local_container_problem(self) -> None:
        raw = _trace_raw_with_carrier(None, supplied=False)
        raw_before = copy.deepcopy(raw)
        self.assertNotIn("definition_meaning_operations", raw["sources"][0]["content"])
        validated = _validate(raw)
        validated_before = copy.deepcopy(validated)
        bundle = read_original_definition_meaning_bundle(validated, MEANING_REQUEST)
        read = bundle["read"]

        self.assertEqual(read["acquisition_state"], "unknown")
        self.assertEqual(read["occurrences"], [])
        self.assertEqual(read["supports"], [])
        self.assertEqual(len(read["problems"]), 1)
        self.assertEqual(read["problems"][0]["cause"], "container_absent")
        self.assertEqual(
            read["problems"][0]["locator"],
            "/sources/0/content/definition_meaning_operations",
        )
        self.assertEqual(read["problems"][0]["original_value"], {"presence": "absent"})
        self.assertEqual(
            bundle["problem_scopes"],
            [{"problem_index": 0, "relevance": "target"}],
        )
        self.assertEqual(bundle["support_origins"], [])
        self.assertEqual(validated, validated_before)
        self.assertEqual(raw, raw_before)

    def test_empty_and_absent_walks_remain_unknown_source_unresolved(self) -> None:
        for supplied, carrier in ((True, []), (False, None)):
            with self.subTest(carrier="empty" if supplied else "absent"):
                raw = _trace_raw_with_carrier(carrier, supplied=supplied)
                raw_before = copy.deepcopy(raw)
                validated = _validate(raw)
                validated_before = copy.deepcopy(validated)
                walk = evaluate_descriptor_definition_walk({"validated": validated})

                reads = walk["native_material"]["meaning_reads"]
                self.assertEqual(len(reads), 15)
                self.assertTrue(
                    all(read["acquisition_state"] == "unknown" for read in reads)
                )
                self.assertTrue(
                    all(
                        read["occurrences"] == [] and read["supports"] == []
                        for read in reads
                    )
                )
                self.assertTrue(
                    all(
                        (read["problems"] == [])
                        if supplied
                        else (
                            [problem["cause"] for problem in read["problems"]]
                            == ["container_absent"]
                        )
                        for read in reads
                    )
                )
                self.assertTrue(
                    all(
                        origin["support_origins"] == []
                        for origin in walk["native_material"]["meaning_read_origins"]
                    )
                )
                matching = [
                    (assessment, origin)
                    for assessment, origin in zip(
                        walk["evaluation"]["assessments"],
                        walk["native_material"]["judgment_origins"],
                    )
                    if origin["axis_name"] == "template identity.definition"
                    and origin["slot_locators"] == ["/descriptors/0"]
                    and origin["fact_locators"] == ["/descriptors/0/facts/0"]
                ]
                self.assertEqual(len(matching), 1)
                assessment, origin = matching[0]
                self.assertEqual(assessment["state"], "unknown")
                self.assertEqual(assessment["origin_branch"], "source_unresolved")
                self.assertEqual(origin["branch"], "source_unresolved")
                self.assertNotEqual(assessment["origin_branch"], "meaning_undefined")
                self.assertEqual(validated, validated_before)
                self.assertEqual(raw, raw_before)

    def test_nonempty_typed_carrier_retains_the_current_unclosed_stop(self) -> None:
        raw = _trace_raw_with_carrier([], supplied=True)
        raw["sources"][0]["content"]["definition_meaning_operations"] = [
            _typed_nonempty_operation(raw)
        ]
        # Resynchronize this one raw content mutation through the same fixture
        # helper so FN0's source/Q/provenance chain remains qualified.
        source = raw["sources"][0]
        old_ref = copy.deepcopy(source["ref"])
        content = copy.deepcopy(source["content"])
        _write_source_content(raw, source, content)
        new_ref = copy.deepcopy(source["ref"])
        for record in raw["knowledge_records"]:
            record["provenance_refs"] = [
                copy.deepcopy(new_ref)
                if _same_ref_without_digest(ref, old_ref)
                else copy.deepcopy(ref)
                for ref in record.get("provenance_refs", [])
            ]
        for slot in raw["descriptors"]:
            for fact in slot.get("facts", []):
                if _same_ref_without_digest(fact.get("source_ref"), old_ref):
                    fact["source_ref"] = copy.deepcopy(new_ref)

        validated = _validate(raw)
        with self.assertRaises(NotImplementedError) as caught:
            read_original_definition_meaning_bundle(validated, MEANING_REQUEST)
        self.assertTrue(
            str(caught.exception).startswith(
                "F01/F02/unclosed/definition_meaning_operations_unclosed:"
            ),
            str(caught.exception),
        )
        self.assertIn("Backflow " + BACKFLOW, str(caught.exception))
