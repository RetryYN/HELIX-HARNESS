"""FN3 public compare_applicability and private condition_meaning_lookup_miss_writer expectations derived independently from L5/L8/L7 contracts."""

import copy
import json
from pathlib import Path
import sys
import unittest

UNIT_ROOT = Path(__file__).resolve().parents[1]
FIXTURE_PATH = UNIT_ROOT / "tests" / "fixtures" / "application_input.json"
sys.path.insert(0, str(UNIT_ROOT / "src"))
from product_template_application import (
    compare_applicability,
    compare_candidate_universe,
    compare_required_axes,
    validate_application_input,
)
from test_application_input import (
    _fixture_normal_input,
    _rebuild_source_graph,
    _remove_path,
    _set_path,
)

with FIXTURE_PATH.open(encoding="utf-8") as stream:
    _FIXTURE = json.load(stream)


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
    for collection, value in recipe.get("input_overrides", {}).items():
        raw[collection] = copy.deepcopy(value)
    if recipe.get("source_preparation") == "CORE-FIXTURE-SOURCE-REBUILD-01":
        _rebuild_source_graph(raw)
    for change in recipe.get("final_input_changes", []):
        if change.get("property_present") is False:
            _remove_path(raw, change["property_path"])
        else:
            _set_path(raw, change["property_path"], change["value"])
    return raw


def _mutated_raw_for_f03_negative_case(case_row):
    mutation = case_row["typed_mutation"]
    target = mutation.get("target")
    op = mutation.get("operation")
    syn = mutation.get("synthetic_value")

    if (
        target
        in (
            "na_records[0].reason",
            "na_records[0].decider",
            "na_records[0].target_revision",
            "na_records[0].reentry_condition",
        )
        and op == "replace"
    ):
        raw = _resolve_recipe_raw("CORE-ADD-INPUT-11")
        field = target.split(".", 1)[1]
        raw["na_records"][0][field] = copy.deepcopy(syn)
    elif (
        target == "conditions[0].semantic_comparison_ref + claims"
        and op == "remove_and_append"
    ):
        raw = _fixture_normal_input()
        raw["conditions"][0]["semantic_comparison_ref"] = syn.get("comparison_ref")
        raw["claims"].append(
            {
                "ref": {
                    "identity": "claim-f03-neg-05",
                    "revision": "synthetic-A",
                    "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                    "owner": "synthetic-core-owner",
                    "source_locator": None,
                    "sha256": None,
                },
                "subject_ref": copy.deepcopy(raw["binding"]["template_ref"]),
                "binding": copy.deepcopy(raw["binding"]),
                "actor": "synthetic-core-owner",
                "kind": syn["claim_kind"],
                "proposed_value": True,
                "basis_refs": [copy.deepcopy(raw["binding"]["requirement_ref"])],
            }
        )
    elif target == "application_policies[0] + claims" and op == "replace_and_append":
        raw = _resolve_recipe_raw("CORE-ADD-INPUT-12")
        raw["application_policies"][0]["requiredness"] = syn["requiredness"]
        raw["claims"][0]["kind"] = syn["claim_kind"]
    elif target == "na_records[0].template_ref" and op == "replace":
        raw = _resolve_recipe_raw("CORE-ADD-INPUT-11")
        raw["na_records"][0]["template_ref"]["identity"] = copy.deepcopy(syn)
    elif target == "na_records[0].binding.product_scope" and op == "replace":
        raw = _resolve_recipe_raw("CORE-ADD-INPUT-11")
        raw["na_records"][0]["binding"]["product_scope"]["product"] = copy.deepcopy(syn)
    else:
        raise ValueError(f"Unsupported F03 mutation recipe: {mutation}")
    _rebuild_source_graph(raw)
    return raw


def _mutated_raw_for_lookup_miss_matrix(variant):
    raw = _fixture_normal_input()
    raw["conditions"][0]["condition_value"] = False
    if variant == "qualified_true":
        pass
    elif variant == "qualified_null":
        raw["semantic_comparisons"][0]["same_meaning"] = None
    elif variant == "requested_ref_lookup_miss":
        req_ref = copy.deepcopy(
            _FIXTURE["condition_meaning_lookup_miss_oracle"]["coverage"][
                "lookup_miss_other_record_evidence"
            ]["requested_ref"]
        )
        req_ref["sha256"] = None
        raw["conditions"][0]["semantic_comparison_ref"] = req_ref
    else:
        raise ValueError(f"Unsupported lookup-miss matrix variant: {variant}")
    _rebuild_source_graph(raw)
    return raw


def _mutated_raw_for_presence_probe(probe_id):
    raw = _fixture_normal_input()
    if probe_id == "CORE009-COND-VALUE-ABSENT":
        raw["conditions"][0].pop("condition_value", None)
    elif probe_id == "CORE009-COND-VALUE-NULL":
        raw["conditions"][0]["condition_value"] = None
    elif probe_id == "CORE009-COND-VALUE-TRUE":
        raw["conditions"][0]["condition_value"] = True
    elif probe_id == "CORE009-COND-REF-MISSING":
        raw["conditions"] = []
    elif probe_id == "CORE009-COND-REF-AMBIGUOUS":
        raw["conditions"].append(copy.deepcopy(raw["conditions"][0]))
    elif probe_id == "CORE009-COND-EMPTY-REF-LIST":
        raw["application_policies"][0]["condition_refs"] = []
    else:
        raise ValueError(f"Unsupported presence probe: {probe_id}")
    _rebuild_source_graph(raw)
    return raw


class TestCompareApplicability(unittest.TestCase):
    def _build_context(self, raw):
        validated = validate_application_input(raw)
        req_axes = compare_required_axes({"validated": validated})
        cand_univ = compare_candidate_universe(
            {
                "validated": validated,
                "compare_required_axes": req_axes,
            }
        )
        return {
            "validated": validated,
            "compare_required_axes": req_axes,
            "compare_candidate_universe": cand_univ,
        }

    def _call_expected(self, case_id, expectation, context):
        try:
            return compare_applicability(context)
        except NotImplementedError as exc:
            self.fail(
                f"{case_id}: {expectation}; public FN3 reached its declared bootstrap stop: {exc}"
            )

    def _assert_comparison_shape(
        self,
        result,
        expected_binding,
        expect_rows=True,
    ):
        self.assertIsInstance(result, dict)
        self.assertEqual(
            set(result),
            {
                "producer_symbol",
                "input_binding",
                "original_axes",
                "findings",
                "material",
            },
        )
        self.assertEqual(result["producer_symbol"], "compare_applicability")
        self.assertEqual(result["input_binding"], expected_binding)
        self.assertEqual(result["original_axes"], [])
        self.assertIsInstance(result["findings"], list)
        self.assertIsInstance(result["material"], dict)
        required_material_keys = {
            "template_refs",
            "disposition",
            "original_condition_refs",
            "original_condition_values",
            "unfinished_obligation_refs",
            "na_candidate_records",
        }
        if expect_rows:
            required_material_keys |= {"policy_decisions", "source_projection_rows"}
        self.assertEqual(set(result["material"]), required_material_keys)

    def test_normal_compare_applicability_oracle(self):
        oracle = _FIXTURE["compare_applicability_oracle"]
        raw = _fixture_normal_input()
        context = self._build_context(raw)
        before = copy.deepcopy(context)
        result = self._call_expected(
            oracle["id"],
            oracle["expected_observation"],
            context,
        )
        self._assert_comparison_shape(result, raw["binding"])
        self.assertEqual(context, before)
        self.assertEqual(result["findings"], [])
        mat = result["material"]
        policy = raw["application_policies"][0]
        self.assertEqual(mat["template_refs"], [policy["template_ref"]])
        self.assertEqual(mat["disposition"], "required")
        self.assertEqual(mat["original_condition_refs"], policy["condition_refs"])
        self.assertEqual(mat["original_condition_values"], [True])
        self.assertEqual(mat["unfinished_obligation_refs"], policy["obligation_refs"])
        self.assertEqual(mat["na_candidate_records"], [])
        self.assertEqual(
            mat["policy_decisions"],
            [
                {
                    "policy_occurrence_index": 0,
                    "policy_ref": policy["ref"],
                    "disposition": "required",
                }
            ],
        )
        self.assertEqual(
            mat["source_projection_rows"],
            [
                {
                    "application_policy_ref": policy["ref"],
                    "template_ref": policy["template_ref"],
                    "binding": policy["binding"],
                    "disposition": "required",
                    "condition_pairs": [{"condition_ref": raw["conditions"][0]["ref"]}],
                    "obligation_refs": policy["obligation_refs"],
                }
            ],
        )

    def test_add11_qualified_na_all_four(self):
        add_case = _FIXTURE["add_11_case"]
        raw = _resolve_recipe_raw("CORE-ADD-INPUT-11")
        context = self._build_context(raw)
        before = copy.deepcopy(context)
        result = self._call_expected(
            add_case["id"],
            add_case["expected_observation"],
            context,
        )
        self._assert_comparison_shape(result, raw["binding"])
        self.assertEqual(context, before)
        self.assertEqual(result["findings"], [])
        mat = result["material"]
        policy = raw["application_policies"][0]
        self.assertEqual(mat["disposition"], "na")
        self.assertEqual(mat["original_condition_refs"], policy["condition_refs"])
        self.assertEqual(mat["original_condition_values"], [False])
        self.assertEqual(mat["unfinished_obligation_refs"], policy["obligation_refs"])
        self.assertEqual(mat["na_candidate_records"], [raw["na_records"][0]])
        self.assertEqual(
            mat["policy_decisions"],
            [
                {
                    "policy_occurrence_index": 0,
                    "policy_ref": policy["ref"],
                    "disposition": "na",
                }
            ],
        )
        self.assertEqual(mat["source_projection_rows"][0]["disposition"], "na")
        self.assertEqual(
            mat["source_projection_rows"][0]["na_attributes"],
            raw["na_records"][0],
        )

    def test_add12_conditional_raw_false_preserved(self):
        add_case = _FIXTURE["add_12_case"]
        raw = _resolve_recipe_raw("CORE-ADD-INPUT-12")
        context = self._build_context(raw)
        before = copy.deepcopy(context)
        result = self._call_expected(
            add_case["id"],
            add_case["expected_observation"],
            context,
        )
        self._assert_comparison_shape(result, raw["binding"])
        self.assertEqual(context, before)
        mat = result["material"]
        policy = raw["application_policies"][0]
        self.assertEqual(mat["disposition"], "conditional")
        self.assertEqual(mat["original_condition_refs"], policy["condition_refs"])
        self.assertEqual(mat["original_condition_values"], [False])
        self.assertEqual(mat["unfinished_obligation_refs"], policy["obligation_refs"])
        self.assertEqual(mat["na_candidate_records"], [])
        self.assertEqual(
            mat["policy_decisions"],
            [
                {
                    "policy_occurrence_index": 0,
                    "policy_ref": policy["ref"],
                    "disposition": "conditional",
                }
            ],
        )
        self.assertEqual(
            mat["source_projection_rows"][0]["disposition"],
            "conditional",
        )
        self.assertEqual(len(result["findings"]), 1)
        finding = result["findings"][0]
        self.assertEqual(finding["code"], "conditional_unfulfilled_closed")
        self.assertEqual(
            finding["rule_ref"],
            "HARNESS-L5-009-R-conditional_unfulfilled_closed",
        )
        self.assertEqual(finding["axis"], "condition")
        self.assertEqual(finding["state"], "unknown")
        self.assertEqual(finding["backflow_owner"], "core_owner")

    def test_add13_unknown_not_na(self):
        add_case = _FIXTURE["add_13_case"]
        raw = _resolve_recipe_raw("CORE-ADD-INPUT-13")
        context = self._build_context(raw)
        before = copy.deepcopy(context)
        result = self._call_expected(
            add_case["id"],
            add_case["expected_observation"],
            context,
        )
        self._assert_comparison_shape(result, raw["binding"])
        self.assertEqual(context, before)
        self.assertEqual(result["findings"], [])
        mat = result["material"]
        policy = raw["application_policies"][0]
        self.assertEqual(mat["disposition"], "unresolved")
        self.assertEqual(mat["original_condition_refs"], policy["condition_refs"])
        self.assertEqual(mat["original_condition_values"], [])
        self.assertEqual(mat["unfinished_obligation_refs"], policy["obligation_refs"])
        self.assertEqual(mat["na_candidate_records"], [])
        self.assertEqual(
            mat["policy_decisions"][0]["disposition"],
            "unresolved",
        )
        self.assertEqual(
            mat["source_projection_rows"][0]["disposition"],
            "unresolved",
        )

    def _check_negative_case(self, case_row):
        raw = _mutated_raw_for_f03_negative_case(case_row)
        context = self._build_context(raw)
        before = copy.deepcopy(context)
        result = self._call_expected(
            case_row["id"],
            case_row["expected"],
            context,
        )
        self._assert_comparison_shape(result, raw["binding"])
        self.assertEqual(context, before)
        self.assertEqual(len(result["findings"]), 1)
        finding = result["findings"][0]
        self.assertEqual(
            set(finding),
            {
                "code",
                "rule_ref",
                "subject_ref",
                "binding",
                "axis",
                "state",
                "source_refs",
                "reason",
                "backflow_owner",
            },
        )
        self.assertEqual(finding["code"], case_row["expected_classification"])
        self.assertEqual(finding["rule_ref"], case_row["rule_ref"])
        self.assertEqual(finding["axis"], case_row["expected_axis"])
        self.assertEqual(finding["state"], case_row["expected_state"])
        self.assertEqual(finding["backflow_owner"], case_row["backflow_owner"])
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertTrue(finding["source_refs"])
        self.assertIsInstance(finding["reason"], str)
        self.assertTrue(finding["reason"].strip())

        mat = result["material"]
        policy = raw["application_policies"][0]
        self.assertEqual(mat["unfinished_obligation_refs"], policy["obligation_refs"])
        self.assertEqual(mat["na_candidate_records"], [])
        code = case_row["expected_classification"]
        if code == "conditional_unfulfilled_closed":
            self.assertEqual(mat["disposition"], "conditional")
            self.assertEqual(mat["policy_decisions"][0]["disposition"], "conditional")
            self.assertEqual(
                mat["source_projection_rows"][0]["disposition"],
                "conditional",
            )
            self.assertEqual(mat["original_condition_values"], [False])
        else:
            self.assertEqual(mat["disposition"], "unresolved")
            self.assertEqual(mat["policy_decisions"][0]["disposition"], "unresolved")
            self.assertEqual(
                mat["source_projection_rows"][0]["disposition"],
                "unresolved",
            )
            if code in (
                "na_reason_missing",
                "na_decider_missing",
                "na_revision_missing",
                "na_reentry_missing",
            ):
                self.assertEqual(
                    mat["source_projection_rows"][0]["na_attributes"],
                    raw["na_records"][0],
                )
            elif code in ("limited_na_cross_template", "na_scope_mismatch"):
                self.assertNotIn("na_attributes", mat["source_projection_rows"][0])

    def test_lookup_miss_matrix_qualified_true(self):
        oracle = _FIXTURE["condition_meaning_lookup_miss_oracle"]
        case_entry = oracle["case_matrix"][0]
        raw = _mutated_raw_for_lookup_miss_matrix(case_entry["variant"])
        context = self._build_context(raw)
        result = self._call_expected(
            case_entry["case_id"],
            "raw false preserved in condition_pairs while qualified same_meaning=true yields required",
            context,
        )
        self._assert_comparison_shape(result, raw["binding"])
        self.assertEqual(result["findings"], [])
        mat = result["material"]
        self.assertEqual(mat["disposition"], "required")
        self.assertEqual(mat["original_condition_values"], [True])
        self.assertEqual(
            mat["source_projection_rows"][0]["condition_pairs"],
            [
                {
                    "condition_ref": raw["conditions"][0]["ref"],
                    "condition_value": False,
                }
            ],
        )

    def test_lookup_miss_matrix_qualified_null(self):
        oracle = _FIXTURE["condition_meaning_lookup_miss_oracle"]
        case_entry = oracle["case_matrix"][1]
        raw = _mutated_raw_for_lookup_miss_matrix(case_entry["variant"])
        context = self._build_context(raw)
        result = self._call_expected(
            case_entry["case_id"],
            "raw false preserved in condition_pairs while qualified same_meaning=null yields unresolved without lookup-miss finding",
            context,
        )
        self._assert_comparison_shape(result, raw["binding"])
        self.assertEqual(result["findings"], [])
        mat = result["material"]
        self.assertEqual(mat["disposition"], "unresolved")
        self.assertEqual(mat["original_condition_values"], [None])
        self.assertEqual(
            mat["source_projection_rows"][0]["disposition"],
            "unresolved",
        )
        self.assertEqual(
            mat["source_projection_rows"][0]["condition_pairs"],
            [
                {
                    "condition_ref": raw["conditions"][0]["ref"],
                    "condition_value": False,
                }
            ],
        )

    def test_lookup_miss_matrix_requested_ref_lookup_miss(self):
        oracle = _FIXTURE["condition_meaning_lookup_miss_oracle"]
        case_entry = oracle["case_matrix"][2]
        raw = _mutated_raw_for_lookup_miss_matrix(case_entry["variant"])
        context = self._build_context(raw)
        result = self._call_expected(
            case_entry["case_id"],
            "requested semantic_comparison_ref missing from semantic_comparisons emits condition_meaning_unresolved finding and omits value from original_condition_values",
            context,
        )
        self._assert_comparison_shape(result, raw["binding"])
        mat = result["material"]
        self.assertEqual(mat["disposition"], "unresolved")
        self.assertEqual(mat["original_condition_values"], [])
        self.assertEqual(
            mat["source_projection_rows"][0]["disposition"],
            "unresolved",
        )
        self.assertEqual(
            mat["source_projection_rows"][0]["condition_pairs"],
            [
                {
                    "condition_ref": raw["conditions"][0]["ref"],
                    "condition_value": False,
                }
            ],
        )
        self.assertEqual(len(result["findings"]), 1)
        finding = result["findings"][0]
        self.assertEqual(finding["code"], "condition_meaning_unresolved")
        self.assertEqual(
            finding["rule_ref"],
            "HARNESS-L5-009-R-condition_meaning_unresolved",
        )
        self.assertEqual(finding["subject_ref"], raw["conditions"][0]["ref"])
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertEqual(finding["axis"], "condition")
        self.assertEqual(finding["state"], "unknown")
        self.assertEqual(finding["backflow_owner"], "core_owner")
        self.assertEqual(
            finding["source_refs"],
            [
                raw["application_policies"][0]["ref"],
                raw["application_policies"][0]["condition_refs"][0],
                raw["conditions"][0]["source_ref"],
                raw["conditions"][0]["semantic_comparison_ref"],
                raw["qualifications"][1]["ref"],
                raw["qualification_roots"][1],
            ],
        )
        self.assertIsInstance(finding["reason"], str)
        self.assertTrue(finding["reason"].strip())

    def test_lookup_miss_unexercised_guard_boundaries(self):
        # 1. Same identity, different sha256 on existing comparison -> 0 full-Ref matches -> triggers lookup miss
        raw_diff_sha = _fixture_normal_input()
        raw_diff_sha["semantic_comparisons"][0]["ref"]["sha256"] = "0" * 64
        _rebuild_source_graph(raw_diff_sha)
        res_diff_sha = self._call_expected(
            "LOOKUP-MISS-UNEXERCISED-1",
            "same identity with different sha256 on existing comparison has 0 full-Ref matches",
            self._build_context(raw_diff_sha),
        )
        self.assertEqual(len(res_diff_sha["findings"]), 1)
        self.assertEqual(
            res_diff_sha["findings"][0]["code"],
            "condition_meaning_unresolved",
        )

        # 2. Non-null but malformed semantic_comparison_ref -> outside guard
        raw_malformed = _fixture_normal_input()
        raw_malformed["conditions"][0]["semantic_comparison_ref"] = {
            "identity": "unformed-ref-missing-fields"
        }
        _rebuild_source_graph(raw_malformed)
        res_malformed = self._call_expected(
            "LOOKUP-MISS-UNEXERCISED-2",
            "malformed non-null semantic_comparison_ref is outside lookup-miss guard",
            self._build_context(raw_malformed),
        )
        self.assertEqual(res_malformed["findings"], [])
        self.assertEqual(res_malformed["material"]["disposition"], "unresolved")

        # 3. Multiple matching semantic_comparisons -> outside guard
        raw_dup_sc = _fixture_normal_input()
        raw_dup_sc["semantic_comparisons"].append(
            copy.deepcopy(raw_dup_sc["semantic_comparisons"][0])
        )
        _rebuild_source_graph(raw_dup_sc)
        res_dup_sc = self._call_expected(
            "LOOKUP-MISS-UNEXERCISED-3",
            "duplicate semantic_comparisons is outside lookup-miss guard",
            self._build_context(raw_dup_sc),
        )
        self.assertEqual(res_dup_sc["findings"], [])
        self.assertEqual(res_dup_sc["material"]["disposition"], "unresolved")

        # 4. Unqualified condition source -> outside guard
        raw_unqual = _mutated_raw_for_lookup_miss_matrix("requested_ref_lookup_miss")
        raw_unqual["sources"][1]["content_bytes"] = "{}"
        res_unqual = self._call_expected(
            "LOOKUP-MISS-UNEXERCISED-4",
            "unqualified condition source is outside lookup-miss guard",
            self._build_context(raw_unqual),
        )
        self.assertEqual(res_unqual["findings"], [])
        self.assertEqual(res_unqual["material"]["disposition"], "unresolved")

        # 5. Repeated condition_refs occurrences preserve order and repetition
        raw_rep = _mutated_raw_for_lookup_miss_matrix("requested_ref_lookup_miss")
        cond_ref = copy.deepcopy(
            raw_rep["application_policies"][0]["condition_refs"][0]
        )
        raw_rep["application_policies"][0]["condition_refs"].append(cond_ref)
        _rebuild_source_graph(raw_rep)
        res_rep = self._call_expected(
            "LOOKUP-MISS-UNEXERCISED-5",
            "repeated condition_refs occurrences emit repeated findings in occurrence order",
            self._build_context(raw_rep),
        )
        self.assertEqual(len(res_rep["findings"]), 2)
        self.assertEqual(
            res_rep["findings"][0]["code"],
            "condition_meaning_unresolved",
        )
        self.assertEqual(
            res_rep["findings"][1]["code"],
            "condition_meaning_unresolved",
        )

    def test_producer_condition_presence_probes(self):
        for probe in _FIXTURE["producer_condition_presence_probes"]:
            probe_id = probe["id"]
            raw = _mutated_raw_for_presence_probe(probe_id)
            res = self._call_expected(
                probe_id,
                f"producer condition_pairs presence probe {probe_id}",
                self._build_context(raw),
            )
            row = res["material"]["source_projection_rows"][0]
            cond_ref = _FIXTURE["normal_input"]["conditions"][0]["ref"]
            if probe_id == "CORE009-COND-VALUE-ABSENT":
                self.assertEqual(row["condition_pairs"], [{"condition_ref": cond_ref}])
            elif probe_id == "CORE009-COND-VALUE-NULL":
                self.assertEqual(
                    row["condition_pairs"],
                    [{"condition_ref": cond_ref, "condition_value": None}],
                )
            elif probe_id == "CORE009-COND-VALUE-TRUE":
                self.assertEqual(
                    row["condition_pairs"],
                    [{"condition_ref": cond_ref, "condition_value": True}],
                )
            elif probe_id in ("CORE009-COND-REF-MISSING", "CORE009-COND-REF-AMBIGUOUS"):
                self.assertNotIn("condition_pairs", row)
            elif probe_id == "CORE009-COND-EMPTY-REF-LIST":
                self.assertEqual(row["condition_pairs"], [])

    def test_application_policies_collection_presence_rule(self):
        raw_empty = _fixture_normal_input()
        raw_empty["application_policies"] = []
        _rebuild_source_graph(raw_empty)
        res_empty = self._call_expected(
            "COLLECTION-PRESENCE-EMPTY",
            "present [] application_policies returns empty policy_decisions and source_projection_rows",
            self._build_context(raw_empty),
        )
        self._assert_comparison_shape(res_empty, raw_empty["binding"], expect_rows=True)
        self.assertEqual(res_empty["material"]["policy_decisions"], [])
        self.assertEqual(res_empty["material"]["source_projection_rows"], [])
        self.assertEqual(res_empty["material"]["disposition"], "unresolved")

        raw_absent = _fixture_normal_input()
        del raw_absent["application_policies"]
        _rebuild_source_graph(raw_absent)
        res_absent = self._call_expected(
            "COLLECTION-PRESENCE-ABSENT",
            "absent application_policies omits policy_decisions and source_projection_rows",
            self._build_context(raw_absent),
        )
        self._assert_comparison_shape(
            res_absent,
            raw_absent["binding"],
            expect_rows=False,
        )


def _bind_negative_tests():
    for row in _FIXTURE["f03_negative_cases"]:
        case_id = row["id"].lower().replace("-", "_")
        method_name = f"test_{case_id}_{row['expected_classification']}"

        def _make_test(case_row):
            def _test(self):
                self._check_negative_case(case_row)

            return _test

        setattr(TestCompareApplicability, method_name, _make_test(row))


_bind_negative_tests()


if __name__ == "__main__":
    unittest.main()
