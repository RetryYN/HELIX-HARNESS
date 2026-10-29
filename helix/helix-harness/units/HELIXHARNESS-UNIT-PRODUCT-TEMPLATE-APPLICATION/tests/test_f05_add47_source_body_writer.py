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


class TestF05Add47SourceBodyWriter(unittest.TestCase):
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
        scan = {
            "tag": "scanned",
            "profile_observations": [],
            "semantic_record_indices": list(range(len(validated["input"]["semantic_records"]))),
            "semantic_records_read": {
                "tag": "present",
                "location": {
                    "root": "validation_return",
                    "pointer": "/validated/input/semantic_records",
                },
                "value": copy.deepcopy(validated["input"]["semantic_records"]),
            },
        }

        result = compare_requirement_gaps_detail(request, scan)

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
