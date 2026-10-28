"""Independent L5 source-cohort and raw-occurrence checks for FN1."""

from __future__ import annotations

import copy
import unittest

from descriptor_definition_reads import read_definition_special_support
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import (
    _binding_same,
    compare_descriptor_definitions,
    validate_supply_input,
)
from supply_input_fixtures import base_input, load_document
import test_descriptor_definitions
import test_fn1_wrapper_walk_replacement_special

_rebind_source_digest = test_descriptor_definitions._rebind_source_digest


class TestFN1ReplacementSourceCohort(unittest.TestCase):
    def _raw_distinct_target_frame_with_present_slot(self):
        builder = test_descriptor_definitions.TestDescriptorDefinitions(
            "test_neg02_cross_pattern_field_substitution"
        )
        builder.setUp()
        raw = builder._neg02_input()
        root_binding = copy.deepcopy(raw["binding"])
        root_binding["template_ref"]["sha256"] = "a" * 64
        slot_binding = copy.deepcopy(raw["binding"])
        slot_binding["template_ref"]["sha256"] = None
        raw["binding"] = root_binding

        for slot in raw["descriptors"]:
            slot["binding"] = copy.deepcopy(slot_binding)
            for fact in slot.get("facts", []):
                fact["binding"] = copy.deepcopy(slot_binding)
        field_slot = copy.deepcopy(builder.base["descriptors"][6])
        field_slot["binding"] = copy.deepcopy(slot_binding)
        for fact in field_slot["facts"]:
            fact["binding"] = copy.deepcopy(slot_binding)
        raw["descriptors"].insert(6, field_slot)
        raw["candidates"] = [copy.deepcopy(slot_binding["template_ref"])]

        claim = raw["claims"][-1]
        claim["binding"] = copy.deepcopy(slot_binding)
        target_source = raw["sources"][5]
        target_source["content"]["binding"] = copy.deepcopy(slot_binding)
        _rebind_source_digest(target_source, raw["qualifications"][5])
        basis_source = raw["sources"][6]
        basis_source["content"]["replacement_basis_uses"][0]["claim"] = copy.deepcopy(
            claim
        )
        _rebind_source_digest(basis_source, raw["qualifications"][6])
        return raw, claim, root_binding, slot_binding

    def _input_with_nonbasis_source_cohorts(self):
        builder = test_descriptor_definitions.TestDescriptorDefinitions(
            "test_neg02_cross_pattern_field_substitution"
        )
        builder.setUp()
        raw = builder._neg02_input()
        claim = raw["claims"][-1]
        basis_source = raw["sources"][6]
        basis_qualification = raw["qualifications"][6]

        def append_source(
            identity: str,
            qualification_identity: str,
            fact_identity: str,
            *,
            claim_matches: bool,
        ):
            source = copy.deepcopy(basis_source)
            qualification = copy.deepcopy(basis_qualification)
            source["ref"]["identity"] = identity
            source["qualification_ref"]["identity"] = qualification_identity
            qualification["ref"]["identity"] = qualification_identity
            qualification["subject_ref"]["identity"] = identity
            qualification["qualification_body"]["subject"] = identity
            fact = source["content"]["descriptor_facts"][0]["facts"][0]
            fact["source_ref"]["identity"] = identity
            fact["ref"]["identity"] = fact_identity
            use = source["content"]["replacement_basis_uses"][0]
            use["fact"] = copy.deepcopy(fact)
            if not claim_matches:
                use["claim"]["proposed_value"] = "foreign original Claim"
            _rebind_source_digest(source, qualification)
            raw["sources"].append(source)
            raw["qualifications"].append(qualification)
            return source

        # These sources are independently qualified semantic_json sources.
        # Their typed use retains the original Claim basis Ref B while their
        # physical source Refs are C and D.
        source_c = append_source(
            "synthetic-semantic-source-C",
            "synthetic-source-qualification-C",
            "synthetic-descriptor-C5-fact-1",
            claim_matches=True,
        )
        source_d = append_source(
            "synthetic-semantic-source-D",
            "synthetic-source-qualification-D",
            "synthetic-descriptor-D5-fact-1",
            claim_matches=False,
        )
        return raw, claim, basis_source, source_c, source_d

    def _same_pattern_with_foreign_problem(self):
        builder = test_descriptor_definitions.TestDescriptorDefinitions(
            "test_neg02_cross_pattern_field_substitution"
        )
        builder.setUp()
        raw = builder._neg02_input()
        claim = raw["claims"][-1]
        source_b = raw["sources"][6]
        qualification_b = raw["qualifications"][6]
        binding = copy.deepcopy(claim["binding"])
        source_b["content"]["binding"] = copy.deepcopy(binding)
        use_b = source_b["content"]["replacement_basis_uses"][0]
        use_b["claim"] = copy.deepcopy(claim)
        use_b["basis_binding"] = copy.deepcopy(binding)
        fact_b = source_b["content"]["descriptor_facts"][0]["facts"][0]
        fact_b["binding"] = copy.deepcopy(binding)
        use_b["fact"] = copy.deepcopy(fact_b)
        _rebind_source_digest(source_b, qualification_b)

        claim_ref_c = copy.deepcopy(source_b["ref"])
        claim_ref_c["identity"] = "synthetic-semantic-source-C"
        claim_ref_c["sha256"] = None
        claim["basis_refs"].append(claim_ref_c)
        use_b["claim"] = copy.deepcopy(claim)
        _rebind_source_digest(source_b, qualification_b)

        source_c = copy.deepcopy(source_b)
        qualification_c = copy.deepcopy(qualification_b)
        source_c["ref"]["identity"] = claim_ref_c["identity"]
        source_c["qualification_ref"]["identity"] = "synthetic-source-qualification-C"
        qualification_c["ref"]["identity"] = source_c["qualification_ref"]["identity"]
        qualification_c["subject_ref"]["identity"] = claim_ref_c["identity"]
        qualification_c["qualification_body"]["subject"] = claim_ref_c["identity"]
        _rebind_source_digest(source_c, qualification_c)
        claim["basis_refs"][-1] = copy.deepcopy(source_c["ref"])
        source_b["content"]["replacement_basis_uses"][0]["claim"] = copy.deepcopy(claim)
        _rebind_source_digest(source_b, qualification_b)
        # Keep C as a real source occurrence, but make its existing owner
        # qualification unusable. This gives a local problem beside B's
        # positive support without changing the known same-Pattern predicate.
        qualification_c["subject_sha256"] = "0" * 64
        raw["sources"].append(source_c)
        raw["qualifications"].append(qualification_c)
        return raw, claim

    def test_typed_binding_mirror_difference_is_a_local_problem(self):
        builder = test_descriptor_definitions.TestDescriptorDefinitions(
            "test_neg02_cross_pattern_field_substitution"
        )
        builder.setUp()
        raw = builder._neg02_input()
        source = raw["sources"][6]
        qualification = raw["qualifications"][6]
        source["content"]["binding"]["template_ref"]["identity"] = (
            "SYNTHETIC-TEMPLATE-KNOWN-DIFFERENCE"
        )
        _rebind_source_digest(source, qualification)
        original = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsInstance(validated["input"], dict)
        self.assertEqual(validated["input_issues"], [])
        self.assertNotIn(source["ref"], validated["unusable_source_refs"])

        read = read_definition_special_support(
            validated,
            {"request_kind": "replacement_claim", "request_locator": "/claims/0"},
        )
        self.assertEqual(len(read["source_occurrences"]), 1)
        self.assertEqual(
            read["source_occurrences"][0]["original_record"],
            source["content"]["replacement_basis_uses"][0],
        )
        self.assertEqual(read["supports"], [])
        self.assertEqual(len(read["problems"]), 1)
        problem = read["problems"][0]
        self.assertEqual(problem["cause"], "binding_differs")
        self.assertEqual(
            problem["locator"],
            "/sources/6/content/replacement_basis_uses/0/basis_binding",
        )
        self.assertEqual(
            problem["original_value"],
            {
                "presence": "supplied",
                "value": source["content"]["replacement_basis_uses"][0][
                    "basis_binding"
                ],
            },
        )
        self.assertEqual(problem["source_index"], 6)
        self.assertEqual(raw, original)

    def test_null_source_binding_is_a_single_local_unresolved_mirror_problem(self):
        builder = test_descriptor_definitions.TestDescriptorDefinitions(
            "test_neg02_cross_pattern_field_substitution"
        )
        builder.setUp()
        raw = builder._neg02_input()
        source = raw["sources"][6]
        _qualification = raw["qualifications"][6]
        source["content"]["binding"] = None
        _rebind_source_digest(source, _qualification)
        original = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsInstance(validated["input"], dict)
        self.assertEqual(validated["input_issues"], [])
        self.assertNotIn(source["ref"], validated["unusable_source_refs"])

        read = read_definition_special_support(
            validated,
            {"request_kind": "replacement_claim", "request_locator": "/claims/0"},
        )
        self.assertEqual(len(read["source_occurrences"]), 1)
        self.assertEqual(read["supports"], [])
        self.assertEqual(len(read["problems"]), 1)
        problem = read["problems"][0]
        self.assertEqual(problem["cause"], "binding_unresolved")
        self.assertEqual(problem["locator"], "/sources/6/content/binding")
        self.assertEqual(
            problem["original_value"], {"presence": "supplied", "value": None}
        )
        self.assertEqual(problem["source_index"], 6)
        self.assertEqual(raw, original)

    def test_source_and_record_partial_bindings_keep_their_own_problem_locator(self):
        for side in ("source", "record"):
            with self.subTest(side=side):
                builder = test_descriptor_definitions.TestDescriptorDefinitions(
                    "test_neg02_cross_pattern_field_substitution"
                )
                builder.setUp()
                raw = builder._neg02_input()
                source = raw["sources"][6]
                qualification = raw["qualifications"][6]
                use = source["content"]["replacement_basis_uses"][0]
                if side == "source":
                    source["content"]["binding"].pop("pack_contract_version")
                    expected_locator = "/sources/6/content/binding"
                    expected_value = source["content"]["binding"]
                else:
                    use["basis_binding"].pop("pack_contract_version")
                    expected_locator = (
                        "/sources/6/content/replacement_basis_uses/0/basis_binding"
                    )
                    expected_value = use["basis_binding"]
                _rebind_source_digest(source, qualification)
                original = copy.deepcopy(raw)

                validated = validate_supply_input(raw)
                self.assertIsInstance(validated["input"], dict)
                self.assertEqual(validated["input_issues"], [])
                self.assertNotIn(source["ref"], validated["unusable_source_refs"])

                read = read_definition_special_support(
                    validated,
                    {
                        "request_kind": "replacement_claim",
                        "request_locator": "/claims/0",
                    },
                )
                self.assertEqual(read["supports"], [])
                self.assertEqual(len(read["problems"]), 1)
                problem = read["problems"][0]
                self.assertEqual(problem["cause"], "binding_unresolved")
                self.assertEqual(problem["locator"], expected_locator)
                self.assertEqual(
                    problem["original_value"],
                    {"presence": "supplied", "value": expected_value},
                )
                self.assertEqual(raw, original)

    def test_nested_closed_record_shape_failure_is_one_raw_decode_problem(self):
        builder = test_descriptor_definitions.TestDescriptorDefinitions(
            "test_neg02_cross_pattern_field_substitution"
        )
        builder.setUp()
        raw = builder._neg02_input()
        source = raw["sources"][6]
        qualification = raw["qualifications"][6]
        use = source["content"]["replacement_basis_uses"][0]
        use["fact"]["unexpected_member"] = "raw evidence"
        _rebind_source_digest(source, qualification)
        original = copy.deepcopy(raw)

        validated = validate_supply_input(raw)
        self.assertIsInstance(validated["input"], dict)
        self.assertEqual(validated["input_issues"], [])
        self.assertNotIn(source["ref"], validated["unusable_source_refs"])
        read = read_definition_special_support(
            validated,
            {"request_kind": "replacement_claim", "request_locator": "/claims/0"},
        )
        self.assertEqual(len(read["source_occurrences"]), 1)
        self.assertEqual(read["source_occurrences"][0]["original_record"], use)
        self.assertEqual(read["supports"], [])
        self.assertEqual(len(read["problems"]), 1)
        self.assertEqual(read["problems"][0]["cause"], "record_decode_failed")
        self.assertEqual(
            read["problems"][0]["locator"],
            "/sources/6/content/replacement_basis_uses/0",
        )
        self.assertEqual(raw, original)

    def test_typed_slot_and_kind_mirror_differences_keep_the_original_field(self):
        for member, value, expected_cause, expected_reason in (
            (
                "slot_identity",
                "synthetic-other-slot",
                "slot_differs",
                "原recordのslot identityが現在の原slotと既知に相違する。",
            ),
            (
                "descriptor_kind",
                "required section",
                "kind_differs",
                "原recordのdescriptor kindが現在の原slotと既知に相違する。",
            ),
            (
                "descriptor_kind",
                "synthetic-unclassified-kind",
                "kind_unresolved",
                "原recordのdescriptor kindを固定15分類へ解決できない。",
            ),
        ):
            with self.subTest(member=member):
                builder = test_descriptor_definitions.TestDescriptorDefinitions(
                    "test_neg02_cross_pattern_field_substitution"
                )
                builder.setUp()
                raw = builder._neg02_input()
                source = raw["sources"][6]
                qualification = raw["qualifications"][6]
                source["content"]["replacement_basis_uses"][0][member] = value
                _rebind_source_digest(source, qualification)
                original = copy.deepcopy(raw)
                validated = validate_supply_input(raw)
                self.assertIsInstance(validated["input"], dict)
                self.assertEqual(validated["input_issues"], [])
                self.assertNotIn(source["ref"], validated["unusable_source_refs"])

                read = read_definition_special_support(
                    validated,
                    {
                        "request_kind": "replacement_claim",
                        "request_locator": "/claims/0",
                    },
                )
                self.assertEqual(len(read["source_occurrences"]), 1)
                self.assertEqual(read["supports"], [])
                self.assertEqual(len(read["problems"]), 1)
                problem = read["problems"][0]
                self.assertEqual(problem["cause"], expected_cause)
                self.assertEqual(
                    problem["locator"],
                    f"/sources/6/content/replacement_basis_uses/0/{member}",
                )
                self.assertEqual(
                    problem["original_value"],
                    {"presence": "supplied", "value": value},
                )
                self.assertEqual(problem["reason"], expected_reason)
                self.assertEqual(raw, original)

    def test_known_same_pattern_support_does_not_become_unresolved_from_foreign_problem(
        self,
    ):
        raw, claim = self._same_pattern_with_foreign_problem()
        original = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsInstance(validated["input"], dict)
        self.assertEqual(len(validated["input_issues"]), 1)
        self.assertEqual(validated["input_issues"][0]["locator"], "/sources/7")
        self.assertEqual(len(validated["unusable_source_refs"]), 1)

        walk = evaluate_descriptor_definition_walk({"validated": validated})
        read = walk["native_material"]["special_reads"][0]
        self.assertEqual(read["acquisition_state"], "resolved")
        self.assertEqual(
            [problem["cause"] for problem in read["problems"]], ["source_unresolved"]
        )
        self.assertEqual(len(read["supports"]), 1)
        self.assertEqual(
            read["supports"][0]["record"]["basis_binding"], claim["binding"]
        )
        self.assertFalse(
            any(
                origin["cause"] == "replacement_basis_unresolved"
                and origin["subject_ref"].get("value") == claim["subject_ref"]
                for origin in walk["native_material"]["judgment_origins"]
            ),
            "a known same-Pattern false predicate must not fire an unresolved event",
        )
        public = compare_descriptor_definitions({"validated": validated})
        self.assertFalse(
            any(
                axis["subject_ref"] == claim["subject_ref"]
                and axis["axis"] == "required field.definition"
                and axis["state"] == "unknown"
                for axis in public["axes"]
            )
        )
        self.assertEqual(raw, original)

    def test_emitted_cross_pattern_event_links_target_locators_and_rule_index(self):
        builder = test_fn1_wrapper_walk_replacement_special.TestFN1WrapperWalkReplacementSpecial(
            "test_fill_occurrences_are_read_once_in_order_and_only_supported_positive_projects"
        )
        builder.setUp()
        raw = builder._cross_pattern_raw()
        validated = validate_supply_input(raw)
        walk = evaluate_descriptor_definition_walk({"validated": validated})
        target_match = walk["target_reads"][0]["matches"][0]
        origins = walk["native_material"]["judgment_origins"]
        origin = next(
            item
            for item in origins
            if item["cause"] == "cross_pattern_field_substitution"
        )
        self.assertEqual(target_match["slot_locators"], [])
        self.assertEqual(origin["slot_locators"], target_match["slot_locators"])
        self.assertEqual(origin["finding_rule_indices"], [8])
        self.assertEqual(origin["special_read_indices"], [0])
        self.assertEqual(
            origin["special_support_links"],
            [{"special_read_index": 0, "support_index": 0}],
        )
        self.assertEqual(
            origin["assessment_key"]["slot_identity"],
            {"presence": "supplied", "value": target_match["slot_identity"]},
        )

    def test_existing_slot_primary_missing_keeps_nonempty_target_locator_and_rule_link(
        self,
    ):
        builder = test_fn1_wrapper_walk_replacement_special.TestFN1WrapperWalkReplacementSpecial(
            "test_fill_occurrences_are_read_once_in_order_and_only_supported_positive_projects"
        )
        builder.setUp()
        raw = builder._cross_pattern_raw()
        field_slot = copy.deepcopy(base_input(load_document())["descriptors"][6])
        field_slot["facts"] = []
        raw["descriptors"].insert(6, field_slot)
        original = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsInstance(validated["input"], dict)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], original)

        walk = evaluate_descriptor_definition_walk({"validated": validated})
        target = walk["target_reads"][0]
        self.assertEqual(target["state"], "resolved")
        self.assertEqual(len(target["matches"]), 1)
        target_match = target["matches"][0]
        self.assertEqual(target_match["slot_locators"], ["/descriptors/6"])
        self.assertEqual(
            [
                (
                    origin["cause"],
                    origin["slot_locators"],
                    origin["finding_rule_indices"],
                )
                for origin in walk["native_material"]["judgment_origins"]
                if origin["cause"] == "cross_pattern_field_substitution"
            ],
            [("cross_pattern_field_substitution", ["/descriptors/6"], [8])],
        )
        origin = next(
            origin
            for origin in walk["native_material"]["judgment_origins"]
            if origin["cause"] == "cross_pattern_field_substitution"
        )
        self.assertEqual(origin["special_read_indices"], [0])
        self.assertEqual(
            origin["special_support_links"],
            [{"special_read_index": 0, "support_index": 0}],
        )
        self.assertEqual(
            origin["assessment_key"]["slot_identity"],
            {"presence": "supplied", "value": target_match["slot_identity"]},
        )
        self.assertEqual(raw, original)

    def test_present_raw_target_slot_does_not_join_root_missing_by_binding_alias(self):
        raw, claim, root_binding, slot_binding = (
            self._raw_distinct_target_frame_with_present_slot()
        )
        original = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsInstance(validated["input"], dict)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], original)

        walk = evaluate_descriptor_definition_walk({"validated": validated})
        target = next(
            read
            for read in walk["target_reads"]
            if read["claim_locator"] == f"/claims/{len(raw['claims']) - 1}"
        )
        self.assertEqual(target["state"], "resolved")
        self.assertEqual(len(target["matches"]), 1)
        self.assertEqual(target["matches"][0]["slot_locators"], ["/descriptors/6"])
        self.assertEqual(target["matches"][0]["binding"], slot_binding)
        self.assertNotEqual(root_binding, slot_binding)
        self.assertEqual(claim["binding"], slot_binding)
        self.assertTrue(_binding_same(root_binding, slot_binding))

        origins = walk["native_material"]["judgment_origins"]
        self.assertFalse(
            any(
                origin["cause"]
                in {
                    "cross_pattern_section_substitution",
                    "cross_pattern_field_substitution",
                    "replacement_basis_unresolved",
                }
                and origin.get("special_read_indices") == [0]
                for origin in origins
            ),
            "a missing event in the raw root frame cannot be joined to this present target slot",
        )
        public = compare_descriptor_definitions({"validated": validated})
        self.assertFalse(
            any(
                finding["code"]
                in {
                    "cross_pattern_section_substitution",
                    "cross_pattern_field_substitution",
                }
                and finding["binding"] == claim["binding"]
                for finding in public["findings"]
            )
        )
        self.assertEqual(raw, original)

    def test_basis_use_selects_other_source_and_raw_occurrences_keep_noncohort(self):
        raw, claim, source_b, source_c, source_d = (
            self._input_with_nonbasis_source_cohorts()
        )
        original = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsInstance(validated["input"], dict)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], original)
        for source in (source_b, source_c, source_d):
            self.assertFalse(
                any(ref == source["ref"] for ref in validated["unusable_source_refs"]),
                f"setup: {source['ref']['identity']} must be qualified",
            )

        validated_before = copy.deepcopy(validated)
        read = read_definition_special_support(
            validated,
            {
                "request_kind": "replacement_claim",
                "request_locator": f"/claims/{len(original['claims']) - 1}",
            },
        )

        expected_occurrences = []
        for source_index, source in enumerate(original["sources"]):
            if (
                isinstance(source, dict)
                and source.get("role") == "semantic_json"
                and isinstance(source.get("content"), dict)
                and isinstance(source["content"].get("replacement_basis_uses"), list)
            ):
                for record_index, record in enumerate(
                    source["content"]["replacement_basis_uses"]
                ):
                    expected_occurrences.append(
                        {
                            "source_ref": source["ref"],
                            "source_index": source_index,
                            "record_index": record_index,
                            "locator": (
                                f"/sources/{source_index}/content/"
                                f"replacement_basis_uses/{record_index}"
                            ),
                            "original_record": record,
                        }
                    )

        self.assertEqual(read["acquisition_state"], "resolved")
        self.assertEqual(
            [row["locator"] for row in read["source_occurrences"]],
            [row["locator"] for row in expected_occurrences],
        )
        self.assertTrue(
            all(
                row == expected
                for row, expected in zip(
                    read["source_occurrences"], expected_occurrences
                )
            ),
            "raw occurrence values must remain identical to their source rows",
        )
        self.assertEqual(
            [row["source_ref"] for row in read["supports"]],
            [source_b["ref"], source_c["ref"]],
        )
        self.assertEqual(
            [row["record"] for row in read["supports"]],
            [
                source["content"]["replacement_basis_uses"][0]
                for source in (source_b, source_c)
            ],
        )
        self.assertNotIn(
            source_d["ref"], [row["source_ref"] for row in read["supports"]]
        )
        self.assertEqual(read["problems"], [])
        self.assertEqual(raw, original)
        self.assertEqual(validated, validated_before)
        self.assertEqual(claim, original["claims"][-1])

    def test_distinct_owner_group_tuples_keep_matching_support_without_guessing(self):
        builder = test_descriptor_definitions.TestDescriptorDefinitions(
            "test_neg02_cross_pattern_field_substitution"
        )
        builder.setUp()
        raw = builder._neg02_input()
        source = raw["sources"][6]
        qualification = raw["qualifications"][6]
        original_group = source["content"]["descriptor_facts"][0]
        other_group = copy.deepcopy(original_group)
        other_group["slot_identity"] = "synthetic-distinct-owner-group"
        other_group["descriptor_kind"] = "required section"
        source["content"]["descriptor_facts"].append(other_group)
        _rebind_source_digest(source, qualification)
        original = copy.deepcopy(raw)

        validated = validate_supply_input(raw)
        self.assertIsInstance(validated["input"], dict)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], original)

        read = read_definition_special_support(
            validated,
            {"request_kind": "replacement_claim", "request_locator": "/claims/0"},
        )
        self.assertEqual(len(read["source_occurrences"]), 1)
        self.assertEqual(len(read["supports"]), 1)
        self.assertEqual(
            read["supports"][0]["record"],
            source["content"]["replacement_basis_uses"][0],
        )
        self.assertEqual(read["problems"], [])
        self.assertEqual(raw, original)

    def test_identical_duplicate_owner_tuples_still_allow_slot_mirror_diagnostic(self):
        builder = test_descriptor_definitions.TestDescriptorDefinitions(
            "test_neg02_cross_pattern_field_substitution"
        )
        builder.setUp()
        raw = builder._neg02_input()
        source = raw["sources"][6]
        qualification = raw["qualifications"][6]
        group = source["content"]["descriptor_facts"][0]
        source["content"]["descriptor_facts"].append(copy.deepcopy(group))
        use = source["content"]["replacement_basis_uses"][0]
        use["slot_identity"] = "synthetic-known-different-slot"
        _rebind_source_digest(source, qualification)
        original = copy.deepcopy(raw)

        validated = validate_supply_input(raw)
        self.assertIsInstance(validated["input"], dict)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], original)
        read = read_definition_special_support(
            validated,
            {"request_kind": "replacement_claim", "request_locator": "/claims/0"},
        )
        self.assertEqual(len(read["source_occurrences"]), 1)
        self.assertEqual(read["supports"], [])
        self.assertEqual(len(read["problems"]), 1)
        self.assertEqual(read["problems"][0]["cause"], "slot_differs")
        self.assertEqual(
            read["problems"][0]["locator"],
            "/sources/6/content/replacement_basis_uses/0/slot_identity",
        )
        self.assertEqual(raw, original)


if __name__ == "__main__":
    unittest.main()
