"""Native FN0 validation-detail expectations from the finite L4/L5/L8 contract."""

from __future__ import annotations

import copy
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

UNIT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(UNIT_ROOT / "src"))

import application_validation
from test_application_input import _fixture_normal_input, _input_for_recipe


class TestValidateApplicationInputDetail(unittest.TestCase):
    def _call_detail(self, validation_input):
        detail = getattr(
            application_validation, "validate_application_input_detail", None
        )
        self.assertTrue(callable(detail), "V01: private detail entry is missing")
        return detail(validation_input)

    def test_native_empty_collections_keep_presence_in_full_return(self):
        raw = {
            "sources": [],
            "qualifications": [],
            "qualification_roots": [],
        }
        result = self._call_detail({"tag": "native", "raw": raw})

        self.assertEqual(
            result,
            {
                "original_raw_input": {"tag": "native", "raw": raw},
                "validated": {
                    "input": raw,
                    "input_issues": [],
                    "unusable_source_refs": [],
                },
                "source_observations": {
                    "sources_read": {
                        "tag": "present",
                        "location": {"root": "validation_input", "pointer": "/sources"},
                        "value": [],
                    },
                    "qualifications_read": {
                        "tag": "present",
                        "location": {
                            "root": "validation_input",
                            "pointer": "/qualifications",
                        },
                        "value": [],
                    },
                    "roots_read": {
                        "tag": "present",
                        "location": {
                            "root": "validation_input",
                            "pointer": "/qualification_roots",
                        },
                        "value": [],
                    },
                    "source_occurrences": [],
                    "causes": [],
                },
            },
        )

    def test_absent_sources_collection_is_not_reported_as_an_empty_array(self):
        raw = _fixture_normal_input()
        raw.pop("sources")

        result = self._call_detail({"tag": "native", "raw": raw})
        observations = result["source_observations"]

        self.assertEqual(observations["sources_read"]["tag"], "absent")
        self.assertEqual(
            observations["sources_read"]["requested"]["pointer"], "/sources"
        )
        self.assertEqual(observations["sources_read"]["parent_value"], raw)
        self.assertEqual(observations["source_occurrences"], [])
        self.assertEqual(observations["causes"], [])
        self.assertEqual(result["validated"]["input"], raw)

    def test_null_source_qualification_ref_keeps_lookup_pattern_zero(self):
        raw = _fixture_normal_input()
        raw["sources"][0]["qualification_ref"] = None

        result = self._call_detail({"tag": "native", "raw": raw})
        source_row = result["source_observations"]["source_occurrences"][0]
        lookup = source_row["causes"][0]

        self.assertEqual(source_row["qualification_ref"]["tag"], "present")
        self.assertIsNone(source_row["qualification_ref"]["value"])
        self.assertEqual(lookup["kind"], "source_unresolved")
        self.assertEqual(
            lookup["rule_pointer"],
            "/f05_detail_contract/validation_cause_diagnostic_contract/lookup_patterns/0",
        )
        self.assertEqual(lookup["left"]["read"]["value"], None)
        self.assertEqual(lookup["right"]["tag"], "normative_literal")
        self.assertEqual(source_row["usability"]["tag"], "unestablished")

    def test_absent_qualification_root_ref_keeps_lookup_pattern_two(self):
        raw = _fixture_normal_input()
        raw["qualifications"][0].pop("root_ref")

        result = self._call_detail({"tag": "native", "raw": raw})
        qualification = result["source_observations"]["source_occurrences"][0][
            "qualification_occurrences"
        ][0]
        lookup = qualification["causes"][-1]

        self.assertEqual(qualification["root_ref"]["tag"], "absent")
        self.assertEqual(qualification["root_occurrences"], [])
        self.assertEqual(lookup["kind"], "source_unresolved")
        self.assertEqual(
            lookup["rule_pointer"],
            "/f05_detail_contract/validation_cause_diagnostic_contract/lookup_patterns/2",
        )
        self.assertEqual(lookup["left"]["read"]["tag"], "absent")

    def test_native_shape_failure_preserves_raw_and_marks_children_unreached(self):
        raw = "not-an-application-object"
        before = copy.deepcopy(raw)
        result = self._call_detail({"tag": "native", "raw": raw})

        self.assertEqual(result["original_raw_input"], {"tag": "native", "raw": raw})
        self.assertIsNone(result["validated"]["input"])
        self.assertEqual(
            result["validated"]["input_issues"],
            [
                {
                    "locator": "",
                    "reason": "ApplicationInputはJSON objectでなければならない。",
                    "source_ref": None,
                }
            ],
        )
        self.assertEqual(result["validated"]["unusable_source_refs"], [])
        observations = result["source_observations"]
        self.assertEqual(observations["source_occurrences"], [])
        self.assertEqual(len(observations["causes"]), 1)
        self.assertEqual(observations["causes"][0]["kind"], "input_unobserved")
        self.assertEqual(
            [
                observations[name]["tag"]
                for name in ("sources_read", "qualifications_read", "roots_read")
            ],
            ["unreached", "unreached", "unreached"],
        )
        self.assertEqual(raw, before)

    def test_native_fixture_occurrences_keep_source_qualification_root_order(self):
        raw = _fixture_normal_input()
        before = copy.deepcopy(raw)

        result = self._call_detail({"tag": "native", "raw": raw})
        self.assertEqual(result["original_raw_input"], {"tag": "native", "raw": raw})
        self.assertEqual(
            result["validated"],
            {
                "input": raw,
                "input_issues": [],
                "unusable_source_refs": [],
            },
        )
        observations = result["source_observations"]
        self.assertEqual(len(raw["sources"]), 6)
        self.assertEqual(len(raw["qualifications"]), 6)
        self.assertEqual(len(raw["qualification_roots"]), 6)
        for name, member in (
            ("sources_read", "sources"),
            ("qualifications_read", "qualifications"),
            ("roots_read", "qualification_roots"),
        ):
            self.assertEqual(observations[name]["tag"], "present")
            self.assertEqual(observations[name]["value"], raw[member])
        self.assertEqual(observations["causes"], [])
        self.assertEqual(
            [row["source_index"] for row in observations["source_occurrences"]],
            list(range(len(raw["sources"]))),
        )
        self.assertEqual(len(observations["source_occurrences"]), 6)
        self.assertEqual(
            [row["kind"] for row in observations["source_occurrences"][0]["checks"]],
            ["content_bytes_body", "source_digest", "source_role"],
        )
        for source_index, source_row in enumerate(observations["source_occurrences"]):
            self.assertEqual(
                [check["result"] for check in source_row["checks"]],
                ["corresponding"] * 3,
            )
            self.assertEqual(source_row["causes"], [])
            self.assertEqual(
                source_row["usability"],
                {
                    "tag": "usable",
                    "check_indices": [0, 1, 2],
                    "qualification_indices": [0],
                },
            )
            source = raw["sources"][source_index]
            self.assertEqual(source_row["original_source"], source)
            self.assertEqual(
                source_row["locator"],
                {
                    "root": "validation_input",
                    "pointer": f"/sources/{source_index}",
                },
            )
            matching_qualifications = [
                index
                for index, qualification in enumerate(raw["qualifications"])
                if qualification.get("ref") == source.get("qualification_ref")
            ]
            self.assertEqual(
                [
                    row["qualification_index"]
                    for row in source_row["qualification_occurrences"]
                ],
                matching_qualifications,
            )
            for qualification_row in source_row["qualification_occurrences"]:
                self.assertEqual(
                    [check["result"] for check in qualification_row["checks"]],
                    ["corresponding"] * 8,
                )
                self.assertEqual(qualification_row["causes"], [])
                self.assertEqual(
                    [row["kind"] for row in qualification_row["checks"]],
                    [
                        "qualification_ref",
                        "qualification_subject",
                        "qualification_digest",
                        "qualification_digest",
                        "qualification_owner",
                        "qualification_owner",
                        "qualification_scope",
                        "qualification_scope",
                    ],
                )
                qualification = raw["qualifications"][
                    qualification_row["qualification_index"]
                ]
                matching_roots = [
                    index
                    for index, root in enumerate(raw["qualification_roots"])
                    if root == qualification.get("root_ref")
                ]
                self.assertEqual(
                    [
                        row["root_index"]
                        for row in qualification_row["root_occurrences"]
                    ],
                    matching_roots,
                )
                for root_row in qualification_row["root_occurrences"]:
                    self.assertEqual(
                        [check["result"] for check in root_row["checks"]],
                        ["corresponding"] * 8,
                    )
                    self.assertEqual(root_row["causes"], [])
                    self.assertEqual(
                        [row["kind"] for row in root_row["checks"]],
                        [
                            "qualification_root_ref",
                            "root_owner",
                            "root_owner",
                            "root_subject_revision_scope",
                            "root_subject_revision_scope",
                            "root_subject_revision_scope",
                            "root_subject_revision_scope",
                            "root_subject_revision_scope",
                        ],
                    )
        self.assertEqual(raw, before)

    def test_eight_source_contract_shape_keeps_all_source_and_root_occurrences(self):
        raw = _fixture_normal_input()
        for suffix in ("six", "seven"):
            source = copy.deepcopy(raw["sources"][0])
            qualification = copy.deepcopy(raw["qualifications"][0])
            source["ref"]["identity"] = f"synthetic-extra-source-{suffix}"
            source["qualification_ref"]["identity"] = (
                f"synthetic-extra-qualification-{suffix}"
            )
            qualification["ref"] = copy.deepcopy(source["qualification_ref"])
            qualification["subject_ref"] = copy.deepcopy(source["ref"])
            raw["sources"].append(source)
            raw["qualifications"].append(qualification)

        before = copy.deepcopy(raw)
        result = self._call_detail({"tag": "native", "raw": raw})
        observations = result["source_observations"]

        self.assertEqual(result["original_raw_input"]["raw"], raw)
        self.assertEqual(result["validated"]["input"], raw)
        self.assertEqual(result["validated"]["input_issues"], [])
        self.assertEqual(result["validated"]["unusable_source_refs"], [])
        self.assertEqual(
            [
                len(raw[member])
                for member in ("sources", "qualifications", "qualification_roots")
            ],
            [8, 8, 6],
        )
        self.assertEqual(
            [row["source_index"] for row in observations["source_occurrences"]],
            list(range(8)),
        )
        self.assertEqual(
            [
                row["root_index"]
                for row in observations["source_occurrences"][6][
                    "qualification_occurrences"
                ][0]["root_occurrences"]
            ],
            [0],
        )
        for source_row in observations["source_occurrences"]:
            self.assertEqual(
                [check["result"] for check in source_row["checks"]],
                ["corresponding"] * 3,
            )
            self.assertEqual(source_row["causes"], [])
            self.assertEqual(source_row["usability"]["tag"], "usable")
            self.assertEqual(len(source_row["qualification_occurrences"]), 1)
            qualification_row = source_row["qualification_occurrences"][0]
            self.assertEqual(
                [check["result"] for check in qualification_row["checks"]],
                ["corresponding"] * 8,
            )
            self.assertEqual(len(qualification_row["root_occurrences"]), 1)
            root_row = qualification_row["root_occurrences"][0]
            self.assertEqual(
                [check["result"] for check in root_row["checks"]], ["corresponding"] * 8
            )
        self.assertEqual(observations["causes"], [])
        self.assertEqual(raw, before)

    def test_repeated_qualification_and_root_occurrences_use_local_usable_indices(self):
        full = _fixture_normal_input()
        source = copy.deepcopy(full["sources"][0])
        qualification = copy.deepcopy(full["qualifications"][0])
        root = copy.deepcopy(full["qualification_roots"][0])
        unmatched_qualification = copy.deepcopy(full["qualifications"][1])
        unmatched_root = copy.deepcopy(full["qualification_roots"][1])
        raw = {
            "sources": [source],
            "qualifications": [
                unmatched_qualification,
                qualification,
                copy.deepcopy(qualification),
            ],
            "qualification_roots": [
                unmatched_root,
                root,
                copy.deepcopy(root),
            ],
        }

        result = self._call_detail({"tag": "native", "raw": raw})
        source_row = result["source_observations"]["source_occurrences"][0]

        self.assertEqual(
            [
                row["qualification_index"]
                for row in source_row["qualification_occurrences"]
            ],
            [1, 2],
        )
        self.assertEqual(
            [
                row["root_index"]
                for row in source_row["qualification_occurrences"][0][
                    "root_occurrences"
                ]
            ],
            [1, 2],
        )
        self.assertEqual(source_row["usability"]["tag"], "usable")
        self.assertEqual(source_row["usability"]["qualification_indices"], [0, 1])
        self.assertEqual(source_row["causes"], [])

    def test_missing_source_body_is_unestablished_with_original_absent_read(self):
        raw = _fixture_normal_input()
        source_ref = copy.deepcopy(raw["sources"][0]["ref"])
        del raw["sources"][0]["body"]

        result = self._call_detail({"tag": "native", "raw": raw})
        source_row = result["source_observations"]["source_occurrences"][0]
        check = source_row["checks"][0]

        self.assertEqual(check["result"], "unestablished")
        self.assertEqual(check["left"]["tag"], "original")
        self.assertEqual(check["right"]["tag"], "original")
        self.assertEqual(check["right"]["read"]["tag"], "absent")
        self.assertEqual(
            check["right"]["read"]["requested"]["pointer"], "/sources/0/body"
        )
        self.assertEqual(check["causes"][0]["kind"], "body_unformed")
        self.assertEqual(source_row["usability"]["tag"], "unestablished")
        self.assertEqual(result["validated"]["input"], raw)
        self.assertEqual(result["validated"]["unusable_source_refs"], [source_ref])
        self.assertEqual(
            result["validated"]["input_issues"][0]["locator"], "/sources/0/body"
        )

    def test_null_source_digest_is_not_applicable_without_cause(self):
        raw = _fixture_normal_input()
        raw["sources"][0]["ref"]["sha256"] = None

        result = self._call_detail({"tag": "native", "raw": raw})
        source_row = result["source_observations"]["source_occurrences"][0]
        digest_check = source_row["checks"][1]

        self.assertEqual(digest_check["result"], "not_applicable")
        self.assertEqual(digest_check["causes"], [])
        self.assertEqual(source_row["usability"]["tag"], "usable")
        self.assertEqual(result["validated"]["input_issues"], [])

    def test_absent_roots_collection_preserves_absent_read_and_lookup_cause(self):
        raw = _input_for_recipe("CORE-ADD-INPUT-05")
        raw.pop("qualification_roots")

        result = self._call_detail({"tag": "native", "raw": raw})
        source_row = result["source_observations"]["source_occurrences"][0]
        qualification = source_row["qualification_occurrences"][0]
        lookup = qualification["causes"][-1]

        self.assertEqual(result["source_observations"]["roots_read"]["tag"], "absent")
        self.assertEqual(qualification["root_occurrences"], [])
        self.assertEqual(lookup["kind"], "source_unresolved")
        self.assertEqual(
            lookup["rule_pointer"],
            "/f05_detail_contract/validation_cause_diagnostic_contract/lookup_patterns/3",
        )
        self.assertEqual(lookup["right"]["read"]["tag"], "absent")
        self.assertEqual(source_row["usability"]["tag"], "unestablished")

    def test_add02_and_add03_keep_null_and_absent_raw_member_in_detail(self):
        null_raw = _input_for_recipe("CORE-ADD-INPUT-02")
        absent_raw = _input_for_recipe("CORE-ADD-INPUT-03")
        null_result = self._call_detail({"tag": "native", "raw": null_raw})
        absent_result = self._call_detail({"tag": "native", "raw": absent_raw})

        self.assertEqual(null_result["original_raw_input"]["raw"], null_raw)
        self.assertEqual(null_result["validated"]["input"], null_raw)
        self.assertEqual(null_result["validated"]["input_issues"], [])
        self.assertTrue(
            any(
                row.get("axis") == "kind" and row.get("value", object()) is None
                for row in null_result["validated"]["input"]["axis_facts"]
            )
        )
        self.assertEqual(absent_result["original_raw_input"]["raw"], absent_raw)
        self.assertEqual(absent_result["validated"]["input"], absent_raw)
        self.assertNotIn("universes", absent_result["validated"]["input"])
        self.assertEqual(absent_result["validated"]["input_issues"], [])

    def test_add06_scope_difference_is_a_qualification_check_and_stays_local(self):
        raw = _input_for_recipe("CORE-ADD-INPUT-06")
        source_ref = copy.deepcopy(raw["sources"][0]["ref"])
        result = self._call_detail({"tag": "native", "raw": raw})

        source = result["source_observations"]["source_occurrences"][0]
        qualification = source["qualification_occurrences"][0]
        scope_checks = [
            check
            for check in qualification["checks"]
            if check["kind"] == "qualification_scope"
        ]
        self.assertEqual(
            [check["result"] for check in scope_checks],
            ["different", "corresponding"],
        )
        self.assertEqual(scope_checks[0]["causes"][0]["kind"], "target_mismatch")
        self.assertEqual(source["usability"]["tag"], "unusable")
        self.assertIn(source_ref, result["validated"]["unusable_source_refs"])
        self.assertNotIn(
            raw["sources"][1]["ref"], result["validated"]["unusable_source_refs"]
        )
        self.assertIn(
            {
                "locator": "/qualifications/0/scope",
                "reason": "CORE Qualificationとsourceの原scopeが対応しない。",
                "source_ref": source_ref,
            },
            result["validated"]["input_issues"],
        )

    def test_add07_conflicting_facts_remain_in_the_original_full_snapshot(self):
        raw = _input_for_recipe("CORE-ADD-INPUT-07")
        before = copy.deepcopy(raw)
        result = self._call_detail({"tag": "native", "raw": raw})

        self.assertEqual(result["original_raw_input"]["raw"], raw)
        self.assertEqual(result["validated"]["input"], raw)
        self.assertEqual(
            result["source_observations"]["sources_read"]["value"],
            raw["sources"],
        )
        self.assertEqual(raw["axis_facts"], before["axis_facts"])
        self.assertEqual(len(raw["axis_facts"]), len(before["axis_facts"]))

    def test_role_only_difference_stays_private_and_does_not_add_public_issue(self):
        baseline = _fixture_normal_input()
        role_changed = copy.deepcopy(baseline)
        role_changed["sources"][0]["role"] = "derived_view"
        baseline_before = copy.deepcopy(baseline)
        role_changed_before = copy.deepcopy(role_changed)
        normal = self._call_detail({"tag": "native", "raw": baseline})
        changed = self._call_detail({"tag": "native", "raw": role_changed})

        changed_source = changed["source_observations"]["source_occurrences"][0]
        role_check = changed_source["checks"][2]
        self.assertEqual(role_check["kind"], "source_role")
        self.assertEqual(role_check["result"], "different")
        self.assertEqual(role_check["causes"][0]["kind"], "source_unusable")
        self.assertEqual(changed_source["usability"]["tag"], "unusable")
        self.assertEqual(
            changed["source_observations"]["causes"], changed_source["causes"]
        )
        self.assertTrue(
            all(
                not row["causes"]
                for row in changed["source_observations"]["source_occurrences"][1:]
            )
        )
        self.assertEqual(
            changed["validated"]["input_issues"],
            normal["validated"]["input_issues"],
        )
        self.assertEqual(
            changed["validated"]["unusable_source_refs"],
            normal["validated"]["unusable_source_refs"],
        )
        self.assertEqual(changed["validated"]["unusable_source_refs"], [])
        self.assertEqual(baseline, baseline_before)
        self.assertEqual(role_changed, role_changed_before)

    def test_qualification_owner_difference_is_retained_at_both_local_levels(self):
        raw = _fixture_normal_input()
        raw["qualifications"][0]["owner"] = "distinct-qualification-owner"
        result = self._call_detail({"tag": "native", "raw": raw})

        source = result["source_observations"]["source_occurrences"][0]
        qualification = source["qualification_occurrences"][0]
        owner_checks = [
            check
            for check in qualification["checks"]
            if check["kind"] == "qualification_owner"
        ]
        root_owner_checks = [
            check
            for check in qualification["root_occurrences"][0]["checks"]
            if check["kind"] == "root_owner"
        ]
        self.assertEqual(
            [check["result"] for check in owner_checks],
            ["different", "corresponding"],
        )
        self.assertEqual(
            [check["result"] for check in root_owner_checks],
            ["different", "corresponding"],
        )
        self.assertEqual(owner_checks[0]["causes"][0]["kind"], "owner_mismatch")
        self.assertEqual(root_owner_checks[0]["causes"][0]["kind"], "owner_mismatch")
        self.assertEqual(source["usability"]["tag"], "unusable")
        self.assertIn(
            raw["sources"][0]["ref"], result["validated"]["unusable_source_refs"]
        )

    def test_source_body_mismatch_keeps_check_cause_and_public_projection_local(self):
        raw = _input_for_recipe("CORE-ADD-INPUT-04")
        before = copy.deepcopy(raw)
        source_ref = copy.deepcopy(raw["sources"][0]["ref"])
        result = self._call_detail({"tag": "native", "raw": raw})

        observation = result["source_observations"]["source_occurrences"][0]
        check = observation["checks"][0]
        self.assertEqual(check["kind"], "content_bytes_body")
        self.assertEqual(check["result"], "different")
        self.assertEqual(check["causes"][0]["kind"], "source_body_mismatch")
        self.assertEqual(
            check["causes"][0]["target"],
            {"root": "validation_input", "pointer": "/sources/0/content_bytes"},
        )
        self.assertEqual(observation["usability"]["tag"], "unusable")
        self.assertEqual(result["validated"]["input"], raw)
        self.assertIn(source_ref, result["validated"]["unusable_source_refs"])
        self.assertEqual(raw, before)

    def test_missing_independent_root_is_a_lookup_cause_without_fake_occurrence(self):
        raw = _input_for_recipe("CORE-ADD-INPUT-05")
        result = self._call_detail({"tag": "native", "raw": raw})

        source = result["source_observations"]["source_occurrences"][0]
        qualification = source["qualification_occurrences"][0]
        self.assertEqual(qualification["root_occurrences"], [])
        self.assertEqual(qualification["causes"][-1]["kind"], "source_unresolved")
        self.assertEqual(
            qualification["causes"][-1]["rule_pointer"],
            "/f05_detail_contract/validation_cause_diagnostic_contract/lookup_patterns/3",
        )
        self.assertEqual(source["usability"]["tag"], "unestablished")

    def test_public_fn0_is_one_detail_call_validated_projection(self):
        raw = {"sources": [], "qualifications": [], "qualification_roots": []}
        detailed_return = {
            "original_raw_input": {"tag": "native", "raw": raw},
            "validated": {
                "input": raw,
                "input_issues": [],
                "unusable_source_refs": [],
            },
            "source_observations": {
                "sources_read": {},
                "qualifications_read": {},
                "roots_read": {},
                "source_occurrences": [],
                "causes": [],
            },
        }
        with patch.object(
            application_validation,
            "validate_application_input_detail",
            return_value=detailed_return,
            create=True,
        ) as detail_call:
            result = application_validation.validate_application_input(raw)

        self.assertEqual(result, detailed_return["validated"])
        detail_call.assert_called_once_with({"tag": "native", "raw": raw})

    def test_public_fn0_uses_l5_fixed_root_owner_and_scope_reasons(self):
        owner_raw = _fixture_normal_input()
        owner_raw["qualifications"][0]["owner"] = "distinct-qualification-owner"
        owner_source_ref = copy.deepcopy(owner_raw["sources"][0]["ref"])
        owner_result = application_validation.validate_application_input(owner_raw)
        self.assertEqual(
            owner_result["input_issues"],
            [
                {
                    "locator": "/qualifications/0/owner",
                    "reason": "CORE Qualificationとsourceの原ownerが対応しない。",
                    "source_ref": owner_source_ref,
                },
                {
                    "locator": "/qualification_roots/0/owner",
                    "reason": "COREの供給独立rootと資格又はsourceの原ownerが対応しない。",
                    "source_ref": owner_source_ref,
                },
            ],
        )

        scope_raw = _input_for_recipe("CORE-ADD-INPUT-06")
        scope_source_ref = copy.deepcopy(scope_raw["sources"][0]["ref"])
        scope_result = application_validation.validate_application_input(scope_raw)
        self.assertEqual(
            scope_result["input_issues"],
            [
                {
                    "locator": "/qualifications/0/scope",
                    "reason": "CORE Qualificationとsourceの原scopeが対応しない。",
                    "source_ref": scope_source_ref,
                },
                {
                    "locator": "/qualifications/0/scope",
                    "reason": "COREの原root参照又は資格scopeが供給独立rootへ対応しない。",
                    "source_ref": scope_source_ref,
                },
            ],
        )


if __name__ == "__main__":
    unittest.main()
