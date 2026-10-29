"""Bounded F05 source/body writer check derived from L4/L5 writer contract."""

import copy
import json
from pathlib import Path
import sys
import unittest

UNIT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(UNIT_ROOT / "src"))
sys.path.insert(0, str(UNIT_ROOT / "tests"))
L8_PATH = UNIT_ROOT.parents[3] / "docs/helix-harness/L8-unit-verification/product-template-application.json"

from application_applicability import compare_applicability
from application_kind_obligation_trace import compare_kind_obligation_trace
from application_validation_detail import validate_application_input_detail
from product_template_application import compare_requirement_gaps_detail
from test_compare_requirement_gaps import _resolve_recipe_raw


def _request_and_scan(raw):
    validation = validate_application_input_detail({"raw": copy.deepcopy(raw)})
    validated = validation["validated"]
    applicability = compare_applicability({"validated": validated})
    trace = compare_kind_obligation_trace(
        {"validated": validated, "compare_applicability": applicability}
    )
    request = {
        "validation": validation,
        "compare_applicability": {
            "tag": "returned",
            "producer": "compare_applicability",
            "comparison": applicability,
        },
        "compare_kind_obligation_trace": {
            "tag": "returned",
            "producer": "compare_kind_obligation_trace",
            "comparison": trace,
        },
    }
    semantic_records = validated["input"]["semantic_records"]
    scan = {
        "tag": "scanned",
        "profile_observations": [],
        "semantic_record_indices": list(range(len(semantic_records))),
        "semantic_records_read": {
            "tag": "present",
            "location": {
                "root": "validation_return",
                "pointer": "/validated/input/semantic_records",
            },
            "value": copy.deepcopy(semantic_records),
        },
    }
    return validation, request, scan


class TestF05Add47SourceBodyWriter(unittest.TestCase):
    def test_add46_empty_source_collection_writes_only_unresolved_source_cause(self):
        l8 = json.loads(L8_PATH.read_text(encoding="utf-8"))
        case = l8["additional_unit_cases"][46]
        self.assertEqual(case["id"], "HARNESS-L8-009-ADD-46")
        fixed = case["fixed_writer_case"]
        raw = _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED")
        raw["binding"] = copy.deepcopy(fixed["input_slice"]["field_inputs"][0]["binding"])
        raw["field_inputs"] = copy.deepcopy(fixed["input_slice"]["field_inputs"])
        raw["semantic_records"] = copy.deepcopy(fixed["input_slice"]["semantic_records"])
        raw["sources"] = []
        validation, request, scan = _request_and_scan(raw)

        result = compare_requirement_gaps_detail(request, scan)

        self.assertEqual(result["comparison"]["tag"], "unformed")
        field = result["owner_material"]["field_results"][0]["value"]
        occurrence = field["definition_material"]["operands"][0]["operand"]["record_occurrences"][0]
        expected = fixed["expected_record_occurrence"]
        self.assertEqual(occurrence["source_ref_read"], expected["source_ref_read"])
        self.assertEqual(occurrence["causes"], expected["causes"])
        self.assertEqual(occurrence["source_observation_indices"], [])
        self.assertEqual(occurrence["body_occurrences"], [])
        self.assertEqual(occurrence["owner_bindings"], [])
        self.assertEqual(
            validation["source_observations"]["source_occurrences"], []
        )
        attempt = field["definition_material"]["operands"][0]["projection_attempts"][0]
        self.assertEqual(attempt["result"]["tag"], "unformed")
        self.assertIn(occurrence["causes"][0], attempt["result"]["causes"])

    def test_add46_does_not_infer_unresolved_cause_from_absent_or_null_source_ref(self):
        l8 = json.loads(L8_PATH.read_text(encoding="utf-8"))
        base = l8["additional_unit_cases"][46]["fixed_writer_case"]["input_slice"]
        for state in ("absent", "null"):
            with self.subTest(source_ref=state):
                raw = _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED")
                raw["binding"] = copy.deepcopy(base["field_inputs"][0]["binding"])
                raw["field_inputs"] = copy.deepcopy(base["field_inputs"])
                raw["semantic_records"] = copy.deepcopy(base["semantic_records"])
                raw["sources"] = []
                if state == "absent":
                    raw["semantic_records"][0].pop("source_ref")
                else:
                    raw["semantic_records"][0]["source_ref"] = None
                _, request, scan = _request_and_scan(raw)

                with self.assertRaisesRegex(
                    NotImplementedError,
                    "WR154-P2 F03 source-unresolved cause is pending",
                ):
                    compare_requirement_gaps_detail(request, scan)

    def test_source_body_payload_difference_is_retained_as_local_cause(self):
        raw = _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED")
        l8 = json.loads(L8_PATH.read_text(encoding="utf-8"))
        case = l8["additional_unit_cases"][47]
        self.assertEqual(case["id"], "HARNESS-L8-009-ADD-47")
        base = l8["additional_unit_cases"][46]["fixed_writer_case"]["input_slice"]
        record = copy.deepcopy(base["semantic_records"][0])
        body_payload = {
            key: copy.deepcopy(value)
            for key, value in record.items()
            if key != "source_ref"
        }
        body_payload["meaning"] = {"meaning": "異なる合成source body meaning"}
        raw["binding"] = copy.deepcopy(base["field_inputs"][0]["binding"])
        raw["field_inputs"] = copy.deepcopy(base["field_inputs"])
        raw["semantic_records"] = [record]
        raw["sources"] = [
            {
                "ref": copy.deepcopy(record["source_ref"]),
                "role": "semantic_source",
                "body": {
                    "records": [
                        {
                            "collection": "semantic_records",
                            "ref": copy.deepcopy(record["ref"]),
                            "payload": body_payload,
                        }
                    ]
                },
            }
        ]
        validation, request, scan = _request_and_scan(raw)

        result = compare_requirement_gaps_detail(request, scan)

        self.assertEqual(result["comparison"]["tag"], "unformed")
        field = result["owner_material"]["field_results"][0]["value"]
        occurrence = field["definition_material"]["operands"][0]["operand"]["record_occurrences"][0]
        body = occurrence["body_occurrences"][0]
        source_observation = validation["source_observations"]["source_occurrences"][
            occurrence["source_observation_indices"][0]
        ]
        self.assertEqual(source_observation["usability"]["tag"], "unestablished")
        self.assertEqual(body["payload_relation"], "different")
        self.assertEqual(
            body["causes"],
            [
                {
                    "kind": "source_body_mismatch",
                    "target": {
                        "root": "validation_input",
                        "pointer": "/sources/0/body/records/0/payload",
                    },
                    "left": {
                        "tag": "original",
                        "read": {
                            "tag": "present",
                            "location": {
                                "root": "validation_input",
                                "pointer": "/semantic_records/0",
                            },
                            "value": raw["semantic_records"][0],
                        },
                    },
                    "right": {
                        "tag": "original",
                        "read": body["payload_read"],
                    },
                    "rule_pointer": "/f05_detail_contract/field_content_source_failure_writer_contract/writers/1",
                }
            ],
        )
        self.assertEqual(occurrence["causes"], body["causes"])
        attempt = field["definition_material"]["operands"][0]["projection_attempts"][0]
        self.assertEqual(attempt["result"]["tag"], "unformed")
        self.assertIn(body["causes"][0], attempt["result"]["causes"])

    def test_matching_body_payload_has_no_mismatch_cause(self):
        raw = _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED")
        l8 = json.loads(L8_PATH.read_text(encoding="utf-8"))
        base = l8["additional_unit_cases"][46]["fixed_writer_case"]["input_slice"]
        record = copy.deepcopy(base["semantic_records"][0])
        raw["binding"] = copy.deepcopy(base["field_inputs"][0]["binding"])
        raw["field_inputs"] = copy.deepcopy(base["field_inputs"])
        raw["semantic_records"] = [record]
        raw["sources"] = [
            {
                "ref": copy.deepcopy(record["source_ref"]),
                "role": "semantic_source",
                "body": {
                    "records": [
                        {
                            "collection": "semantic_records",
                            "ref": copy.deepcopy(record["ref"]),
                            "payload": {
                                key: copy.deepcopy(value)
                                for key, value in record.items()
                                if key != "source_ref"
                            },
                        }
                    ]
                },
            }
        ]
        _, request, scan = _request_and_scan(raw)

        result = compare_requirement_gaps_detail(request, scan)

        self.assertEqual(result["comparison"]["tag"], "unformed")
        field = result["owner_material"]["field_results"][0]["value"]
        occurrence = field["definition_material"]["operands"][0]["operand"]["record_occurrences"][0]
        body = occurrence["body_occurrences"][0]
        self.assertEqual(body["payload_relation"], "corresponding")
        self.assertEqual(body["causes"], [])
        self.assertNotIn("source_body_mismatch", [cause["kind"] for cause in occurrence["causes"]])

    def test_legacy_normal_input_does_not_promote_raw_definition_to_known(self):
        raw = _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED")
        _, request, scan = _request_and_scan(raw)

        result = compare_requirement_gaps_detail(request, scan)

        self.assertEqual(
            set(result),
            {
                "original_request",
                "context_formation",
                "header_formation",
                "comparison",
                "owner_material",
            },
        )
        self.assertEqual(result["comparison"]["tag"], "unformed")
        field = result["owner_material"]["field_results"][0]["value"]
        self.assertEqual(field["field_check"]["tag"], "unformed")
        self.assertEqual(
            field["definition_assessment"]["judgment"]["causes"][0]["rule_pointer"],
            "/f05_detail_contract/field_summary_and_custody_writer_contract/patterns/0",
        )

    def test_unestablished_selection_cannot_form_empty_comparison(self):
        raw = _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED")
        raw.pop("application_policies", None)
        _, request, scan = _request_and_scan(raw)

        with self.assertRaisesRegex(
            NotImplementedError,
            "WR154-R2-STOP-F02-SELECTION-UNESTABLISHED-CAUSE-01",
        ):
            compare_requirement_gaps_detail(request, scan)

    def test_unresolved_gap_proposal_cannot_be_omitted_from_formed_comparison(self):
        raw = _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED")
        raw.pop("application_policies", None)
        raw["gap_proposals"] = copy.deepcopy(
            _resolve_recipe_raw("CORE-SUPPORT-GAP-FOUR")["gap_proposals"][:1]
        )
        _, request, scan = _request_and_scan(raw)

        with self.assertRaisesRegex(
            NotImplementedError,
            "WR154-R2-STOP-F10-GAP-PROPOSITION-ABSENT-01",
        ):
            compare_requirement_gaps_detail(request, scan)

    def test_absent_input_collections_do_not_default_to_empty(self):
        for member in ("field_inputs", "gap_proposals"):
            with self.subTest(member=member):
                raw = _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED")
                raw.pop(member)
                _, request, scan = _request_and_scan(raw)

                with self.assertRaisesRegex(
                    NotImplementedError,
                    f"WR154-R2-STOP-F02-INPUT-COLLECTION-ABSENT-01:{member}",
                ):
                    compare_requirement_gaps_detail(request, scan)

    def test_unimplemented_f13_profile_scan_stops_at_public_entry(self):
        raw = _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED")
        _, request, scan = _request_and_scan(raw)
        scan["profile_observations"] = [{"case_only": True}]

        with self.assertRaisesRegex(
            NotImplementedError,
            "WR154-R2-STOP-F13-PROFILE-CONSUMER-01",
        ):
            compare_requirement_gaps_detail(request, scan)

    def test_f13_scan_must_bind_to_same_validation_semantic_records(self):
        raw = _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED")
        _, request, scan = _request_and_scan(raw)
        scan["semantic_records_read"]["value"] = []

        with self.assertRaisesRegex(
            NotImplementedError,
            "WR154-R2-STOP-F13-SCAN-D-BOUNDARY-01",
        ):
            compare_requirement_gaps_detail(request, scan)

    def test_f13_profile_candidate_cannot_be_dropped_from_empty_scan(self):
        raw = _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED")
        raw["semantic_records"][0]["kind"] = "f05_knowledge_revision_gap_evidence"
        _, request, scan = _request_and_scan(raw)

        with self.assertRaisesRegex(
            NotImplementedError,
            "WR154-R2-STOP-F13-PROFILE-SCAN-CANDIDATE-OMITTED-01",
        ):
            compare_requirement_gaps_detail(request, scan)

    def test_missing_body_entry_retains_contract_stop(self):
        raw = _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED")
        l8 = json.loads(L8_PATH.read_text(encoding="utf-8"))
        base = l8["additional_unit_cases"][46]["fixed_writer_case"]["input_slice"]
        record = copy.deepcopy(base["semantic_records"][0])
        raw["binding"] = copy.deepcopy(base["field_inputs"][0]["binding"])
        raw["field_inputs"] = copy.deepcopy(base["field_inputs"])
        raw["semantic_records"] = [record]
        raw["sources"] = [
            {
                "ref": copy.deepcopy(record["source_ref"]),
                "role": "semantic_source",
                "body": {"records": []},
            }
        ]
        _, request, scan = _request_and_scan(raw)

        with self.assertRaisesRegex(
            NotImplementedError,
            "WR154-R2-STOP-F05-BODY-ENTRY-ABSENT-01",
        ):
            compare_requirement_gaps_detail(request, scan)

    def test_native_context_mismatch_returns_original_cause(self):
        raw = _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED")
        _, request, scan = _request_and_scan(raw)
        request["compare_applicability"]["comparison"]["producer_symbol"] = "wrong"

        result = compare_requirement_gaps_detail(request, scan)

        self.assertEqual(result["context_formation"]["result"]["tag"], "unformed")
        cause = result["context_formation"]["result"]["causes"][0]
        self.assertEqual(cause["kind"], "target_mismatch")
        self.assertEqual(
            cause["rule_pointer"],
            "/f05_detail_contract/context_header_cause_contract/context_patterns/1",
        )
        self.assertEqual(result["comparison"]["tag"], "unformed")
