"""ID-addressed unit coverage for all FN11 L8 cases and local probes."""

import json
from pathlib import Path
import unittest

from fn11_projection_cases_01 import build_cases as _normal_cases
from fn11_projection_cases_02 import build_cases as _presence_cases
from fn11_projection_cases_03 import build_cases as _target_cases
from fn11_projection_cases_04 import build_cases as _malformed_cases
from fn11_projection_cases_05 import build_cases as _probe_cases
from test_project_cross_design_candidate_refs import _call_fn11

UNIT_ROOT = Path(__file__).resolve().parents[1]
FIXTURE_PATH = (
    UNIT_ROOT / "tests" / "fixtures" / "project_cross_design_candidate_refs.json"
)
with FIXTURE_PATH.open(encoding="utf-8") as stream:
    _FIXTURE = json.load(stream)

_EXPECTED_CASE_IDS = (
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-EXACT-01",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-REVISION-02",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SCOPE-03",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-OWNER-04",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-BRAIN-SCOPE-SHAPE-05",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-DUPLICATE-ORDER-06",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-CANDIDATES-ABSENT-07",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-CANDIDATES-NULL-08",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-ABSENT-09",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-NULL-10",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-EMPTY-11",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-ABSENT-12",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-NULL-13",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-QUALIFICATION-UNESTABLISHED-14",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-CONTEXT-MISMATCH-15",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBERS-NULL-16",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBERS-ABSENT-17",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-IDENTITY-NULL-18",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-IDENTITY-ABSENT-19",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSES-EMPTY-20",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-DUPLICATE-21",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-ORDER-22",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBER-IDENTITY-NULL-23",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBER-IDENTITY-ABSENT-24",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBER-UNKNOWN-PLUS-KNOWN-DIFFERENCE-25",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-IDENTITY-NULL-26",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-IDENTITY-ABSENT-27",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-UNKNOWN-PLUS-KNOWN-DIFFERENCE-28",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-EXACT-WITH-UNRELATED-UNKNOWN-TARGETS-29",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-NULL-CANDIDATE-ELEMENT-30",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-NULL-UNIVERSE-ELEMENT-31",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-NULL-MEMBER-ELEMENT-32",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-NULL-SNAPSHOT-ELEMENT-33",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-BOOL-NUMBER-SCOPE-DISTINCTION-34",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-REF-ABSENT-35",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-SNAPSHOT-REF-NULL-36",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSE-REF-ABSENT-37",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-CANDIDATE-REFS-NONARRAY-38",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-UNIVERSES-NONARRAY-39",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-MEMBERS-NONARRAY-40",
    "HARNESS-L8-009-XBD-CORE009-F01-PROJ-TEMPLATES-NONARRAY-41",
    "HARNESS-L8-009-R1-CE-A-UNKNOWN-MEMBER-FIELD-IN-OTHER-UNIVERSE",
    "HARNESS-L8-009-R1-CE-B-EMPTY-MEMBER-PLUS-REVISION-DIFFERENCE",
    "HARNESS-L8-009-R1-CE-C-NULL-MEMBER-PLUS-REVISION-DIFFERENCE",
    "HARNESS-L8-009-R1-UNIVERSE-NONOBJECT-RAW-PRESERVED",
)


def _run_rows(testcase, rows):
    for case_id, packet, expected in rows:
        with testcase.subTest(case_id=case_id):
            result = _call_fn11(testcase, packet)
            for path, value in expected.items():
                if path == "candidate_refs_present":
                    testcase.assertEqual(
                        "candidate_refs" in result,
                        value,
                        f"{case_id}: candidate_refs presence",
                    )
                    continue
                actual = result
                for segment in path.replace("[", ".").replace("]", "").split("."):
                    actual = (
                        actual[int(segment)] if segment.isdigit() else actual[segment]
                    )
                testcase.assertEqual(actual, value, f"{case_id}: {path}")


class TestProjectCrossDesignCandidateRefL8Cases(unittest.TestCase):
    def test_discovery_covers_each_l8_case_and_probe_once(self):
        groups = [
            _normal_cases(_FIXTURE),
            _presence_cases(_FIXTURE),
            _target_cases(_FIXTURE),
            _malformed_cases(_FIXTURE),
            _probe_cases(_FIXTURE),
        ]
        case_ids = [case_id for rows in groups for case_id, _, _ in rows]
        self.assertEqual(len(case_ids), 45)
        self.assertEqual(len(set(case_ids)), 45)
        self.assertEqual(set(case_ids), set(_EXPECTED_CASE_IDS))

    def test_normal_ref_and_order_cases(self):
        _run_rows(self, _normal_cases(_FIXTURE))

    def test_collection_presence_cases(self):
        _run_rows(self, _presence_cases(_FIXTURE))

    def test_ref_field_and_occurrence_cases(self):
        _run_rows(self, _target_cases(_FIXTURE))

    def test_malformed_container_cases(self):
        _run_rows(self, _malformed_cases(_FIXTURE))

    def test_local_probe_cases(self):
        _run_rows(self, _probe_cases(_FIXTURE))


if __name__ == "__main__":
    unittest.main()
