"""FN2 public compare_candidate_universe expectations derived independently from L5/L8 contracts."""

import copy
import json
from pathlib import Path
import sys
import unittest

UNIT_ROOT = Path(__file__).resolve().parents[1]
FIXTURE_PATH = UNIT_ROOT / "tests" / "fixtures" / "application_input.json"
sys.path.insert(0, str(UNIT_ROOT / "src"))
from product_template_application import (
    compare_candidate_universe,
    compare_required_axes,
    validate_application_input,
)
from test_application_input import (
    _fixture_normal_input,
    _input_for_recipe,
    _rebuild_source_graph,
)

with FIXTURE_PATH.open(encoding="utf-8") as stream:
    _FIXTURE = json.load(stream)


def _mutated_raw_for_f02_negative_case(case_row):
    raw = copy.deepcopy(_FIXTURE["normal_input"])
    mutation = case_row["typed_mutation"]
    target = mutation.get("target")
    op = mutation.get("operation")
    syn = mutation.get("synthetic_value")

    if target == "universes[0].members" and op == "append_existing_member":
        raw["universes"][0]["members"].append(
            copy.deepcopy(raw["universes"][0]["members"][0])
        )
    elif target == "universes" and op == "replace":
        raw["universes"] = copy.deepcopy(syn)
    elif target == "universes[0].members[0].revision" and op == "replace":
        raw["universes"][0]["members"][0]["revision"] = copy.deepcopy(syn)
    elif target == "universes[0].members[0].scope" and op == "replace":
        raw["universes"][0]["members"][0]["scope"] = copy.deepcopy(syn)
    elif target == "claims" and op == "append":
        kind = syn["kind"]
        if kind == "os_used_set":
            proposed_val = copy.deepcopy(syn)
        elif kind == "candidate_members":
            proposed_val = [
                {
                    "identity": "SYNTHETIC-T-EXTRA",
                    "revision": "synthetic-A",
                    "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                    "owner": "synthetic-brain-owner",
                    "source_locator": None,
                    "sha256": None,
                }
            ]
        else:
            proposed_val = copy.deepcopy(syn)
        raw["claims"].append(
            {
                "ref": {
                    "identity": f"claim-{case_row['id'].lower()}",
                    "revision": "synthetic-A",
                    "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                    "owner": "synthetic-core-owner",
                    "source_locator": None,
                    "sha256": None,
                },
                "subject_ref": copy.deepcopy(raw["binding"]["template_ref"]),
                "binding": copy.deepcopy(raw["binding"]),
                "actor": "synthetic-core-owner",
                "kind": kind,
                "proposed_value": proposed_val,
                "basis_refs": [copy.deepcopy(raw["binding"]["requirement_ref"])],
            }
        )
    else:
        raise ValueError(f"Unsupported F02 mutation recipe: {mutation}")
    _rebuild_source_graph(raw)
    return raw


class TestCompareCandidateUniverse(unittest.TestCase):
    def _build_context(self, raw):
        validated = validate_application_input(raw)
        req_axes = compare_required_axes({"validated": validated})
        return {
            "validated": validated,
            "compare_required_axes": req_axes,
        }

    def _call_expected(self, case_id, expectation, context):
        try:
            return compare_candidate_universe(context)
        except NotImplementedError as exc:
            self.fail(
                f"{case_id}: {expectation}; public FN2 reached its declared bootstrap stop: {exc}"
            )

    def _assert_comparison_shape(self, result, expected_binding):
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
        self.assertEqual(result["producer_symbol"], "compare_candidate_universe")
        self.assertEqual(result["input_binding"], expected_binding)
        self.assertEqual(result["original_axes"], [])
        self.assertIsInstance(result["findings"], list)
        self.assertIsInstance(result["material"], dict)
        self.assertEqual(
            set(result["material"]),
            {
                "universe_refs",
                "candidate_member_refs",
                "missing_member_refs",
                "extra_member_refs",
            },
        )

    def test_normal_compare_candidate_universe_oracle(self):
        oracle = _FIXTURE["compare_candidate_universe_oracle"]
        raw = _fixture_normal_input()
        context = self._build_context(raw)
        before = copy.deepcopy(context)
        result = self._call_expected(
            oracle["id"],
            oracle["expected_observation"],
            context,
        )
        self._assert_comparison_shape(result, raw["binding"])
        self.assertEqual(result["findings"], [])
        self.assertEqual(
            result["material"]["universe_refs"],
            [raw["universes"][0]["ref"]],
        )
        self.assertEqual(
            result["material"]["candidate_member_refs"],
            raw["universes"][0]["members"],
        )
        self.assertEqual(result["material"]["missing_member_refs"], [])
        self.assertEqual(result["material"]["extra_member_refs"], [])
        self.assertEqual(context, before)

    def test_add09_explicit_empty_with_boundary(self):
        add_case = _FIXTURE["add_09_case"]
        raw = _input_for_recipe("CORE-ADD-INPUT-09")
        context = self._build_context(raw)
        before = copy.deepcopy(context)
        result = self._call_expected(
            add_case["id"],
            add_case["expected_observation"],
            context,
        )
        self._assert_comparison_shape(result, raw["binding"])
        self.assertEqual(result["findings"], [])
        self.assertEqual(
            result["material"]["universe_refs"],
            [raw["universes"][0]["ref"]],
        )
        self.assertEqual(result["material"]["candidate_member_refs"], [])
        self.assertEqual(result["material"]["missing_member_refs"], [])
        self.assertEqual(result["material"]["extra_member_refs"], [])
        self.assertEqual(context, before)

    def test_add10_missing_extra_equal_count(self):
        add_case = _FIXTURE["add_10_case"]
        raw = _input_for_recipe("CORE-ADD-INPUT-10")
        context = self._build_context(raw)
        before = copy.deepcopy(context)
        result = self._call_expected(
            add_case["id"],
            add_case["expected_observation"],
            context,
        )
        self._assert_comparison_shape(result, raw["binding"])
        self.assertEqual(context, before)
        self.assertEqual(len(result["findings"]), 1)
        finding = result["findings"][0]
        self.assertEqual(finding["code"], "same_count_wrong_member")
        self.assertEqual(
            finding["rule_ref"], "HARNESS-L5-009-R-same_count_wrong_member"
        )
        self.assertEqual(finding["axis"], "candidate_set_equivalence")
        self.assertEqual(finding["state"], "conflict")
        self.assertEqual(finding["backflow_owner"], "oracle_owner")
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertTrue(finding["source_refs"])
        self.assertIsInstance(finding["reason"], str)
        self.assertTrue(finding["reason"].strip())

        expected_members = raw["universes"][0]["members"]
        claimed_members = raw["claims"][0]["proposed_value"]
        self.assertEqual(len(expected_members), len(claimed_members))
        self.assertEqual(
            result["material"]["universe_refs"],
            [raw["universes"][0]["ref"]],
        )
        self.assertEqual(
            result["material"]["candidate_member_refs"],
            expected_members,
        )
        self.assertEqual(
            result["material"]["missing_member_refs"],
            expected_members,
        )
        self.assertEqual(
            result["material"]["extra_member_refs"],
            claimed_members,
        )

    def _check_negative_case(self, case_row):
        raw = _mutated_raw_for_f02_negative_case(case_row)
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

        code = case_row["expected_classification"]
        if code == "universe_missing":
            self.assertEqual(result["material"]["universe_refs"], [])
            self.assertEqual(result["material"]["candidate_member_refs"], [])
            self.assertEqual(result["material"]["missing_member_refs"], [])
            self.assertEqual(result["material"]["extra_member_refs"], [])
        elif code == "duplicate_template_identity":
            self.assertEqual(
                result["material"]["universe_refs"],
                [raw["universes"][0]["ref"]],
            )
            self.assertEqual(
                result["material"]["candidate_member_refs"],
                raw["universes"][0]["members"],
            )
            self.assertEqual(len(result["material"]["candidate_member_refs"]), 2)
        elif code in ("foreign_revision_in_set", "foreign_product_in_set"):
            self.assertEqual(
                result["material"]["universe_refs"],
                [raw["universes"][0]["ref"]],
            )
            self.assertEqual(result["material"]["candidate_member_refs"], [])
        elif code == "proposed_as_used":
            self.assertEqual(
                result["material"]["universe_refs"],
                [raw["universes"][0]["ref"]],
            )
            self.assertEqual(
                result["material"]["candidate_member_refs"],
                raw["universes"][0]["members"],
            )
        elif code == "same_count_wrong_member":
            self.assertEqual(
                result["material"]["universe_refs"],
                [raw["universes"][0]["ref"]],
            )
            self.assertEqual(
                result["material"]["candidate_member_refs"],
                raw["universes"][0]["members"],
            )
            self.assertEqual(
                result["material"]["missing_member_refs"],
                raw["universes"][0]["members"],
            )
            self.assertEqual(
                result["material"]["extra_member_refs"],
                raw["claims"][0]["proposed_value"],
            )


def _bind_negative_tests():
    for row in _FIXTURE["f02_negative_cases"]:
        case_id = row["id"].lower().replace("-", "_")
        method_name = f"test_{case_id}_{row['expected_classification']}"

        def _make_test(case_row):
            def _test(self):
                self._check_negative_case(case_row)

            return _test

        setattr(TestCompareCandidateUniverse, method_name, _make_test(row))


_bind_negative_tests()


if __name__ == "__main__":
    unittest.main()
