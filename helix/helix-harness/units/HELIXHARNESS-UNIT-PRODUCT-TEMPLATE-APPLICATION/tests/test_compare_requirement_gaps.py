"""Unit tests for H009 L5#/functions/5 compare_requirement_gaps."""

import copy
import json
from pathlib import Path
import sys
import unittest

UNIT_ROOT = Path(__file__).resolve().parents[1]
FIXTURE_PATH = UNIT_ROOT / "tests" / "fixtures" / "application_input.json"
sys.path.insert(0, str(UNIT_ROOT / "src"))
from _requirement_gaps_test_helpers import (
    _rename_all_identifiers,
    _rename_id,
    _replace_kind_tokens,
    _same_ref_core,
)  # noqa: E402

from product_template_application import (  # noqa: E402
    compare_applicability,
    compare_kind_obligation_trace,
    compare_requirement_gaps,
    compare_requirement_gaps_detail,
    validate_application_input,
)
from test_application_input import (  # noqa: E402
    _fixture_normal_input,
    _rebuild_source_graph,
    _remove_path,
    _set_path,
)

with FIXTURE_PATH.open("r", encoding="utf-8") as _STREAM:
    _FIXTURE = json.load(_STREAM)


def _resolve_recipe_raw(recipe_id):
    if recipe_id == "CORE-NORMAL-UNIT-REQUIRED":
        return _fixture_normal_input()
    recipe = next(row for row in _FIXTURE["recipes"] if row["id"] == recipe_id)
    if "literal_raw_input" in recipe:
        return copy.deepcopy(recipe["literal_raw_input"])
    base_ref = recipe.get("base_input_fixture_ref", "CORE-NORMAL-UNIT-REQUIRED")
    if base_ref == "CORE-NORMAL-UNIT-REQUIRED":
        raw = copy.deepcopy(_FIXTURE["normal_input"])
    else:
        raw = _resolve_recipe_raw(base_ref)
    kr = recipe.get("kind_replacement")
    if isinstance(kr, dict):
        raw = _replace_kind_tokens(raw, kr["from"], kr["to"])
        for change in kr.get("changes", []):
            _set_path(raw, change["property_path"], change["value"])
    for collection, value in recipe.get("input_overrides", {}).items():
        raw[collection] = copy.deepcopy(value)
    for collection, items in recipe.get("input_appends", {}).items():
        raw.setdefault(collection, []).extend(copy.deepcopy(items))
    for change in recipe.get("pre_rebuild_changes", []):
        if change.get("property_present") is False:
            _remove_path(raw, change["property_path"])
        else:
            _set_path(raw, change["property_path"], change["value"])
    if recipe.get("source_preparation") == "CORE-FIXTURE-SOURCE-REBUILD-01":
        _rebuild_source_graph(raw)
    for change in recipe.get("final_input_changes", []):
        if change.get("property_present") is False:
            _remove_path(raw, change["property_path"])
        else:
            _set_path(raw, change["property_path"], change["value"])
    return raw


class TestCompareRequirementGaps(unittest.TestCase):
    """Contract-independent unit tests for HARNESS-L5-009-compare_requirement_gaps."""

    @classmethod
    def setUpClass(cls):
        cls.fixture_data = _FIXTURE
        cls.recipes_by_id = {
            recipe["id"]: recipe for recipe in cls.fixture_data["recipes"]
        }
        cls.f05_negative_cases = {
            case["id"]: case for case in cls.fixture_data["f05_negative_cases"]
        }

    def _run_gaps(self, raw):
        validated = validate_application_input(copy.deepcopy(raw))
        applicability = compare_applicability({"validated": validated})
        kind_trace = compare_kind_obligation_trace(
            {"validated": validated, "compare_applicability": applicability}
        )
        ctx = {
            "validated": validated,
            "compare_applicability": applicability,
            "compare_kind_obligation_trace": kind_trace,
        }
        ctx_before = copy.deepcopy(ctx)
        try:
            result = compare_requirement_gaps(ctx)
        except NotImplementedError as exc:
            self.fail(f"compare_requirement_gaps raised NotImplementedError: {exc}")
        self.assertEqual(ctx, ctx_before, "Context must not be mutated (effect=none)")
        return result, validated, applicability, kind_trace

    def _apply_f05_mutation(self, neg_case):
        cid = neg_case["id"]
        tm = neg_case["typed_mutation"]
        target = tm["target"]
        op = tm["operation"]
        val = tm["synthetic_value"]

        if cid == "HARNESS-L8-009-F05-NEG-01":
            raw = copy.deepcopy(self.fixture_data["normal_input"])
            assert (
                target == "field_inputs[0].definition_refs + claims"
                and op == "remove_and_append"
            )
            raw["field_inputs"][0]["definition_refs"] = val["definition_refs"]
            raw.setdefault("claims", []).append(
                {
                    "ref": {
                        "identity": "claim-neg-01-value-only-gap",
                        "revision": "synthetic-A",
                        "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                        "owner": "synthetic-core-owner",
                        "source_locator": None,
                        "sha256": None,
                    },
                    "subject_ref": copy.deepcopy(raw["field_inputs"][0]["ref"]),
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["claim_kind"],
                    "proposed_value": {"definition_refs": val["definition_refs"]},
                    "basis_refs": [copy.deepcopy(raw["field_inputs"][0]["ref"])],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F05-NEG-02":
            raw = copy.deepcopy(self.fixture_data["normal_input"])
            assert (
                target == "field_inputs[0].value_fact_refs + claims"
                and op == "remove_and_append"
            )
            raw["field_inputs"][0]["value_fact_refs"] = val["value_fact_refs"]
            raw.setdefault("claims", []).append(
                {
                    "ref": {
                        "identity": "claim-neg-02-definition-gap",
                        "revision": "synthetic-A",
                        "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                        "owner": "synthetic-core-owner",
                        "source_locator": None,
                        "sha256": None,
                    },
                    "subject_ref": copy.deepcopy(raw["field_inputs"][0]["ref"]),
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["claim_kind"],
                    "proposed_value": {"retain": val["retain"]},
                    "basis_refs": copy.deepcopy(
                        raw["field_inputs"][0]["definition_refs"]
                    ),
                }
            )
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F05-NEG-03":
            raw = _resolve_recipe_raw("CORE-SUPPORT-GAP-FOUR")
            assert target == "gap_proposals[0] + claims" and op == "replace_and_append"
            raw["gap_proposals"][0]["kind"] = val["kind"]
            raw["gap_proposals"][0]["reason"] = val["reason"]
            raw.setdefault("claims", []).append(
                {
                    "ref": {
                        "identity": "claim-neg-03-classification-fabricated",
                        "revision": "synthetic-A",
                        "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                        "owner": "synthetic-core-owner",
                        "source_locator": None,
                        "sha256": None,
                    },
                    "subject_ref": copy.deepcopy(raw["gap_proposals"][0]["ref"]),
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["claim_kind"],
                    "proposed_value": {
                        "kind": val["kind"],
                        "reason": val["reason"],
                    },
                    "basis_refs": [copy.deepcopy(raw["gap_proposals"][0]["ref"])],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F05-NEG-04":
            raw = _resolve_recipe_raw("CORE-SUPPORT-GAP-FOUR")
            assert target == "gap_proposals[0].source_refs" and op == "replace"
            raw["gap_proposals"][0]["source_refs"] = copy.deepcopy(val)
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F05-NEG-05":
            raw = _resolve_recipe_raw("CORE-SUPPORT-GAP-FOUR")
            assert target == "claims" and op == "append"
            other_template_ref = copy.deepcopy(
                next(
                    t["ref"]
                    for t in raw["templates"]
                    if t["ref"]["identity"]
                    != raw["binding"]["template_ref"]["identity"]
                )
            )
            raw.setdefault("claims", []).append(
                {
                    "ref": {
                        "identity": "claim-neg-05-other-template-compensation",
                        "revision": "synthetic-A",
                        "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                        "owner": "synthetic-core-owner",
                        "source_locator": None,
                        "sha256": None,
                    },
                    "subject_ref": copy.deepcopy(raw["binding"]["template_ref"]),
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["kind"],
                    "proposed_value": {
                        "subject": val["subject"],
                        "basis": val["basis"],
                    },
                    "basis_refs": [other_template_ref],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F05-NEG-06":
            raw = _resolve_recipe_raw("CORE-SUPPORT-GAP-FOUR")
            assert (
                target == "gap_proposals[knowledge-gap].backflow_owner"
                and op == "replace"
            )
            knowledge_gap = copy.deepcopy(raw["gap_proposals"][0])
            knowledge_gap["ref"]["identity"] = "gap-knowledge-definition"
            knowledge_gap["subject_ref"] = copy.deepcopy(
                raw["field_inputs"][0]["definition_refs"][0]
            )
            knowledge_gap["source_refs"] = [
                copy.deepcopy(raw["field_inputs"][0]["definition_refs"][0]),
                copy.deepcopy(raw["binding"]["knowledge_ref"]),
            ]
            knowledge_gap["backflow_owner"] = val
            raw["gap_proposals"].append(knowledge_gap)
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F05-NEG-07":
            raw = _resolve_recipe_raw("CORE-SUPPORT-GAP-FOUR")
            assert target == "claims" and op == "append"
            derived_proposal = next(
                gp
                for gp in raw["gap_proposals"]
                if gp["kind"] == "derived_requirement_candidate"
            )
            raw.setdefault("claims", []).append(
                {
                    "ref": {
                        "identity": "claim-neg-07-candidate-as-agreement",
                        "revision": "synthetic-A",
                        "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                        "owner": "synthetic-core-owner",
                        "source_locator": None,
                        "sha256": None,
                    },
                    "subject_ref": copy.deepcopy(derived_proposal["ref"]),
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["kind"],
                    "proposed_value": {"basis": val["basis"]},
                    "basis_refs": [copy.deepcopy(derived_proposal["ref"])],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        raise ValueError(f"Unknown negative case: {cid}")

    def test_normal_compare_requirement_gaps_oracle(self):
        """HARNESS-L8-009-NORMAL-compare_requirement_gaps on CORE-NORMAL-UNIT-REQUIRED."""
        oracle = self.fixture_data["compare_requirement_gaps_oracle"]
        self.assertEqual(oracle["id"], "HARNESS-L8-009-NORMAL-compare_requirement_gaps")
        self.assertEqual(
            oracle["function_ref"], "HARNESS-L5-009-compare_requirement_gaps"
        )
        raw = _resolve_recipe_raw(oracle["input_fixture_ref"])
        res, validated, _, _ = self._run_gaps(raw)

        self.assertEqual(res["producer_symbol"], "compare_requirement_gaps")
        self.assertEqual(res["input_binding"], raw["binding"])
        self.assertEqual(res["findings"], [])

        axes = res["original_axes"]
        self.assertEqual(len(axes), 2)
        def_axis, val_axis = axes[0], axes[1]
        self.assertEqual(def_axis["axis"], "field.definition")
        self.assertEqual(def_axis["state"], "known")
        self.assertEqual(def_axis["subject_ref"], raw["field_inputs"][0]["ref"])
        self.assertEqual(def_axis["binding"], raw["binding"])
        self.assertEqual(
            def_axis["original_refs"], raw["field_inputs"][0]["definition_refs"]
        )
        self.assertIsNone(def_axis["backflow_owner"])
        self.assertTrue(isinstance(def_axis["reason"], str) and def_axis["reason"])

        self.assertEqual(val_axis["axis"], "field.value")
        self.assertEqual(val_axis["state"], "known")
        self.assertEqual(val_axis["subject_ref"], raw["field_inputs"][0]["ref"])
        self.assertEqual(val_axis["binding"], raw["binding"])
        self.assertEqual(
            val_axis["original_refs"], raw["field_inputs"][0]["value_fact_refs"]
        )
        self.assertIsNone(val_axis["backflow_owner"])
        self.assertTrue(isinstance(val_axis["reason"], str) and val_axis["reason"])

        mat = res["material"]
        self.assertEqual(
            set(mat.keys()),
            {"field_checks", "candidate_proposals", "unfinished_obligation_refs"},
        )
        self.assertEqual(len(mat["field_checks"]), 1)
        fc = mat["field_checks"][0]
        self.assertEqual(fc["field_ref"], raw["field_inputs"][0]["ref"])
        self.assertEqual(
            fc["definition_refs"], raw["field_inputs"][0]["definition_refs"]
        )
        self.assertEqual(fc["value_refs"], raw["field_inputs"][0]["value_fact_refs"])
        self.assertEqual(fc["definition_state"], "known")
        self.assertEqual(fc["value_state"], "known")
        self.assertEqual(mat["candidate_proposals"], [])
        self.assertEqual(
            [r["identity"] for r in mat["unfinished_obligation_refs"]],
            ["synthetic-obligation-unit"],
        )

    def test_f05_neg_01_definition_as_value_gap(self):
        """HARNESS-L8-009-F05-NEG-01: definition_as_value_gap."""
        neg = self.f05_negative_cases["HARNESS-L8-009-F05-NEG-01"]
        raw = self._apply_f05_mutation(neg)
        res, _, _, _ = self._run_gaps(raw)

        finding = next(
            (f for f in res["findings"] if f["code"] == "definition_as_value_gap"),
            None,
        )
        self.assertIsNotNone(finding)
        self.assertEqual(
            finding["rule_ref"], "HARNESS-L5-009-R-definition_as_value_gap"
        )
        self.assertEqual(finding["axis"], "field.definition")
        self.assertEqual(finding["state"], "missing")
        self.assertEqual(finding["backflow_owner"], "brain_owner")
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertEqual(finding["subject_ref"], raw["field_inputs"][0]["ref"])

        fc = res["material"]["field_checks"][0]
        self.assertEqual(fc["definition_state"], "missing")
        self.assertEqual(fc["value_state"], "known")
        def_axis = next(
            a for a in res["original_axes"] if a["axis"] == "field.definition"
        )
        self.assertEqual(def_axis["state"], "missing")
        self.assertEqual(def_axis["backflow_owner"], "brain_owner")

    def test_f05_neg_02_value_as_definition_gap(self):
        """HARNESS-L8-009-F05-NEG-02: value_as_definition_gap."""
        neg = self.f05_negative_cases["HARNESS-L8-009-F05-NEG-02"]
        raw = self._apply_f05_mutation(neg)
        res, _, _, _ = self._run_gaps(raw)

        finding = next(
            (f for f in res["findings"] if f["code"] == "value_as_definition_gap"),
            None,
        )
        self.assertIsNotNone(finding)
        self.assertEqual(
            finding["rule_ref"], "HARNESS-L5-009-R-value_as_definition_gap"
        )
        self.assertEqual(finding["axis"], "field.value")
        self.assertEqual(finding["state"], "unknown")
        self.assertEqual(finding["backflow_owner"], "requirement_008_owner")
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertEqual(finding["subject_ref"], raw["field_inputs"][0]["ref"])

        fc = res["material"]["field_checks"][0]
        self.assertEqual(fc["definition_state"], "known")
        self.assertEqual(fc["value_state"], "unknown")
        val_axis = next(a for a in res["original_axes"] if a["axis"] == "field.value")
        self.assertEqual(val_axis["state"], "unknown")
        self.assertEqual(val_axis["backflow_owner"], "requirement_008_owner")

    def test_f05_neg_03_classification_fabricated(self):
        """HARNESS-L8-009-F05-NEG-03: classification_fabricated."""
        neg = self.f05_negative_cases["HARNESS-L8-009-F05-NEG-03"]
        raw = self._apply_f05_mutation(neg)
        res, _, _, _ = self._run_gaps(raw)

        finding = next(
            (f for f in res["findings"] if f["code"] == "classification_fabricated"),
            None,
        )
        self.assertIsNotNone(finding)
        self.assertEqual(
            finding["rule_ref"], "HARNESS-L5-009-R-classification_fabricated"
        )
        self.assertEqual(finding["axis"], "gap.classification")
        self.assertEqual(finding["state"], "unknown")
        self.assertEqual(finding["backflow_owner"], "core_owner")
        self.assertEqual(finding["binding"], raw["binding"])

        first_candidate = res["material"]["candidate_proposals"][0]
        self.assertEqual(first_candidate["kind"], "unresolved")

    def test_f05_neg_04_oral_only_gap(self):
        """HARNESS-L8-009-F05-NEG-04: oral_only_gap."""
        neg = self.f05_negative_cases["HARNESS-L8-009-F05-NEG-04"]
        raw = self._apply_f05_mutation(neg)
        res, _, _, _ = self._run_gaps(raw)

        finding = next(
            (f for f in res["findings"] if f["code"] == "oral_only_gap"),
            None,
        )
        self.assertIsNotNone(finding)
        self.assertEqual(finding["rule_ref"], "HARNESS-L5-009-R-oral_only_gap")
        self.assertEqual(finding["axis"], "gap.trace")
        self.assertEqual(finding["state"], "missing")
        self.assertEqual(finding["backflow_owner"], "core_owner")
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertEqual(finding["subject_ref"], raw["gap_proposals"][0]["ref"])

        first_candidate = res["material"]["candidate_proposals"][0]
        self.assertEqual(first_candidate["kind"], "unresolved")
        self.assertEqual(first_candidate["source_refs"], [])

    def test_f05_neg_05_other_template_compensation(self):
        """HARNESS-L8-009-F05-NEG-05: other_template_compensation."""
        neg = self.f05_negative_cases["HARNESS-L8-009-F05-NEG-05"]
        raw = self._apply_f05_mutation(neg)
        res, _, _, _ = self._run_gaps(raw)

        finding = next(
            (f for f in res["findings"] if f["code"] == "other_template_compensation"),
            None,
        )
        self.assertIsNotNone(finding)
        self.assertEqual(
            finding["rule_ref"], "HARNESS-L5-009-R-other_template_compensation"
        )
        self.assertEqual(finding["axis"], "gap.coverage")
        self.assertEqual(finding["state"], "unknown")
        self.assertEqual(finding["backflow_owner"], "core_owner")
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertEqual(len(res["material"]["candidate_proposals"]), 4)

    def test_f05_neg_06_wrong_gap_owner(self):
        """HARNESS-L8-009-F05-NEG-06: wrong_gap_owner."""
        neg = self.f05_negative_cases["HARNESS-L8-009-F05-NEG-06"]
        raw = self._apply_f05_mutation(neg)
        res, _, _, _ = self._run_gaps(raw)

        finding = next(
            (f for f in res["findings"] if f["code"] == "wrong_gap_owner"),
            None,
        )
        self.assertIsNotNone(finding)
        self.assertEqual(finding["rule_ref"], "HARNESS-L5-009-R-wrong_gap_owner")
        self.assertEqual(finding["axis"], "gap.owner")
        self.assertEqual(finding["state"], "conflict")
        self.assertEqual(finding["backflow_owner"], "brain_owner")
        self.assertEqual(finding["binding"], raw["binding"])

    def test_f05_neg_07_candidate_as_requirements_agreement(self):
        """HARNESS-L8-009-F05-NEG-07: candidate_as_requirements_agreement."""
        neg = self.f05_negative_cases["HARNESS-L8-009-F05-NEG-07"]
        raw = self._apply_f05_mutation(neg)
        res, _, _, _ = self._run_gaps(raw)

        finding = next(
            (
                f
                for f in res["findings"]
                if f["code"] == "candidate_as_requirements_agreement"
            ),
            None,
        )
        self.assertIsNotNone(finding)
        self.assertEqual(
            finding["rule_ref"],
            "HARNESS-L5-009-R-candidate_as_requirements_agreement",
        )
        self.assertEqual(finding["axis"], "requirements_agreement_claim")
        self.assertEqual(finding["state"], "conflict")
        self.assertEqual(finding["backflow_owner"], "requirement_owner")
        self.assertEqual(finding["binding"], raw["binding"])

    def test_all_f05_negative_cases_preserve_input_and_emit_expected_finding(self):
        """All 7 F05 negative cases emit their exact classification/axis/state/owner/rule_ref."""
        self.assertEqual(len(self.f05_negative_cases), 7)
        for cid, neg in self.f05_negative_cases.items():
            with self.subTest(case_id=cid):
                raw = self._apply_f05_mutation(neg)
                res, _, _, _ = self._run_gaps(raw)
                self.assertEqual(res["producer_symbol"], "compare_requirement_gaps")
                self.assertEqual(res["input_binding"], raw["binding"])
                matching = [
                    f
                    for f in res["findings"]
                    if f["code"] == neg["expected_classification"]
                ]
                self.assertTrue(
                    matching,
                    f"Expected finding {neg['expected_classification']} in {cid}",
                )
                for f in matching:
                    self.assertEqual(f["rule_ref"], neg["rule_ref"])
                    self.assertEqual(f["axis"], neg["expected_axis"])
                    self.assertEqual(f["state"], neg["expected_state"])
                    self.assertEqual(f["backflow_owner"], neg["backflow_owner"])

    def test_add_15_four_return_materials_and_non_oracle_kind_check(self):
        """HARNESS-L8-009-ADD-15: four-return-materials and non-oracle GapProposal.kind check."""
        add15 = self.fixture_data["add_15_case"]
        self.assertEqual(add15["id"], "HARNESS-L8-009-ADD-15")
        raw = _resolve_recipe_raw(add15["input_fixture_ref"])
        res, _, _, _ = self._run_gaps(raw)

        self.assertEqual(res["findings"], [])
        proposals = res["material"]["candidate_proposals"]
        expected_records = add15["expected_candidate_records"]
        self.assertEqual(len(proposals), len(expected_records))
        for actual, exp in zip(proposals, expected_records):
            self.assertEqual(actual["kind"], exp["kind"])
            self.assertEqual(actual["backflow_owner"], exp["backflow_owner"])
            self.assertTrue(
                any(
                    _same_ref_core(sr, exp["basis_ref"]) for sr in actual["source_refs"]
                )
            )
            self.assertEqual(
                len(actual["unfinished_obligation_refs"]),
                len(exp["unfinished_obligation_refs"]),
            )
            for u_act, u_exp in zip(
                actual["unfinished_obligation_refs"],
                exp["unfinished_obligation_refs"],
            ):
                self.assertTrue(_same_ref_core(u_act, u_exp))

        # Verify GapProposal.kind is not treated as an oracle when evidence meaning is missing
        raw_unverified = copy.deepcopy(raw)
        raw_unverified["semantic_records"] = [
            sr
            for sr in raw_unverified["semantic_records"]
            if sr["ref"]["identity"] != "gap-evidence-question"
        ]
        _rebuild_source_graph(raw_unverified)
        res_unverified, _, _, _ = self._run_gaps(raw_unverified)
        self.assertEqual(
            res_unverified["material"]["candidate_proposals"][0]["kind"],
            "unresolved",
        )
        self.assertEqual(
            [p["kind"] for p in res_unverified["material"]["candidate_proposals"][1:]],
            ["contradiction", "derived_requirement_candidate", "na_candidate"],
        )

    def test_add_16_known_definition_value_unknown(self):
        """HARNESS-L8-009-ADD-16: known-definition-value-unknown."""
        add16 = self.fixture_data["add_16_case"]
        self.assertEqual(add16["id"], "HARNESS-L8-009-ADD-16")
        raw = _resolve_recipe_raw(add16["input_fixture_ref"])
        res, _, _, _ = self._run_gaps(raw)

        self.assertEqual(res["findings"], [])
        fc = res["material"]["field_checks"][0]
        self.assertEqual(
            fc["definition_state"],
            add16["expected_separate_axes"]["field_definition"],
        )
        self.assertEqual(
            fc["value_state"],
            add16["expected_separate_axes"]["project_value"],
        )
        def_axis = next(
            a for a in res["original_axes"] if a["axis"] == "field.definition"
        )
        val_axis = next(a for a in res["original_axes"] if a["axis"] == "field.value")
        self.assertEqual(def_axis["state"], "known")
        self.assertIsNone(def_axis["backflow_owner"])
        self.assertEqual(val_axis["state"], "unknown")
        self.assertEqual(val_axis["backflow_owner"], "requirement_008_owner")

    def test_context_dependency_guard_rejects_mismatched_producer_or_binding(self):
        """CompareRequirementGapsContext rejects missing or mismatched predecessor comparisons."""
        raw = _fixture_normal_input()
        validated = validate_application_input(raw)
        applicability = compare_applicability({"validated": validated})
        kind_trace = compare_kind_obligation_trace(
            {"validated": validated, "compare_applicability": applicability}
        )

        bad_trace = copy.deepcopy(kind_trace)
        bad_trace["producer_symbol"] = "wrong_producer"
        try:
            res = compare_requirement_gaps_detail(
                {
                    "validated": validated,
                    "compare_applicability": applicability,
                    "compare_kind_obligation_trace": bad_trace,
                }
            )
        except NotImplementedError as exc:
            self.fail(f"Not implemented: {exc}")
        self.assertEqual(res["producer_symbol"], "compare_requirement_gaps")
        self.assertEqual(res["material"]["field_checks"], [])
        self.assertEqual(res["material"]["candidate_proposals"], [])
        self.assertEqual(res["material"]["unfinished_obligation_refs"], [])

    def test_identifier_rename_invariance_and_structural_predicates(self):
        """R1 F1: All F05 cases (normal, ADD-15, ADD-16, NEG-01..07) work under bulk identifier renaming without literal fixture strings."""
        # 1. Normal, ADD-15, ADD-16 under bulk identifier renaming
        for recipe_id in (
            "CORE-NORMAL-UNIT-REQUIRED",
            "CORE-ADD-INPUT-15",
            "CORE-ADD-INPUT-16",
        ):
            raw = _rename_all_identifiers(_resolve_recipe_raw(recipe_id))
            _rebuild_source_graph(raw)
            res, _, _, _ = self._run_gaps(raw)
            self.assertEqual(res["producer_symbol"], "compare_requirement_gaps")
            self.assertEqual(res["input_binding"], raw["binding"])
            self.assertEqual(res["findings"], [])
            if recipe_id == "CORE-ADD-INPUT-15":
                self.assertEqual(
                    [p["kind"] for p in res["material"]["candidate_proposals"]],
                    [
                        "question",
                        "contradiction",
                        "derived_requirement_candidate",
                        "na_candidate",
                    ],
                )

        # 2. All 7 negative cases under bulk identifier renaming and neutral proposed_value
        for cid, neg in self.f05_negative_cases.items():
            with self.subTest(case_id=cid):
                raw = _rename_all_identifiers(self._apply_f05_mutation(neg))
                for claim in raw.get("claims") or []:
                    claim["proposed_value"] = {"note": "neutral-structural-test"}
                if cid == "HARNESS-L8-009-F05-NEG-06":
                    # Subject is the structural definition_ref from field_inputs (not literal 'field-definition')
                    def_ref = copy.deepcopy(
                        raw["field_inputs"][0]["definition_refs"][0]
                    )
                    raw["gap_proposals"][-1]["subject_ref"] = def_ref
                    raw["gap_proposals"][-1]["source_refs"] = [def_ref]
                elif cid == "HARNESS-L8-009-F05-NEG-07":
                    # Basis is the structural source_ref of the derived_requirement_candidate proposal
                    derived_src = copy.deepcopy(
                        raw["gap_proposals"][2]["source_refs"][0]
                    )
                    raw["claims"][-1]["subject_ref"] = copy.deepcopy(
                        raw["binding"]["template_ref"]
                    )
                    raw["claims"][-1]["basis_refs"] = [derived_src]
                _rebuild_source_graph(raw)
                res, _, _, _ = self._run_gaps(raw)
                matching = [
                    f
                    for f in res["findings"]
                    if f["code"] == neg["expected_classification"]
                ]
                self.assertTrue(
                    matching,
                    f"Expected finding {neg['expected_classification']} in renamed {cid}",
                )

        # 3. Control test: non-template basis (field_inputs[0].ref / definition_refs[0]) must NOT emit other_template_compensation
        for non_tmpl_basis_fn in (
            lambda r: copy.deepcopy(r["field_inputs"][0]["ref"]),
            lambda r: copy.deepcopy(r["field_inputs"][0]["definition_refs"][0]),
        ):
            control_raw = _rename_all_identifiers(
                self._apply_f05_mutation(
                    self.f05_negative_cases["HARNESS-L8-009-F05-NEG-05"]
                )
            )
            control_raw["claims"][-1]["proposed_value"] = {
                "note": "neutral-non-template-control"
            }
            control_raw["claims"][-1]["basis_refs"] = [non_tmpl_basis_fn(control_raw)]
            _rebuild_source_graph(control_raw)
            control_res, _, _, _ = self._run_gaps(control_raw)
            comp_findings = [
                f
                for f in control_res["findings"]
                if f["code"] == "other_template_compensation"
            ]
            self.assertEqual(
                comp_findings,
                [],
                "Non-template basis_refs must not emit other_template_compensation",
            )


if __name__ == "__main__":
    unittest.main()
