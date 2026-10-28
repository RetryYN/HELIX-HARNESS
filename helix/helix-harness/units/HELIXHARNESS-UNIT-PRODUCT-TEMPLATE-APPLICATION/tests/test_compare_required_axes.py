"""FN1 public compare_required_axes expectations derived independently from L5/L8 contracts."""

import copy
import json
from pathlib import Path
import sys
import unittest

UNIT_ROOT = Path(__file__).resolve().parents[1]
FIXTURE_PATH = UNIT_ROOT / "tests" / "fixtures" / "application_input.json"
sys.path.insert(0, str(UNIT_ROOT / "src"))
from product_template_application import (
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


def _selected_and_nonselected_ops_from_contract(operations):
    """Derive selected and non-selected operation sets from L5 AxisRequirement contract."""
    selected = {"always"}
    nonselected = []
    if operations.get("forward_requested", False):
        selected.add("forward")
    else:
        nonselected.append("forward")
    if operations.get("backflow_requested", False):
        selected.add("backflow")
    else:
        nonselected.append("backflow")
    if operations.get("impact_requested", False):
        selected.add("impact")
    else:
        nonselected.append("impact")
    if operations.get("selected_knowledge_refs"):
        selected.add("selected_knowledge")
    return selected, nonselected


def _mutated_raw_for_negative_case(case_row):
    raw = copy.deepcopy(_FIXTURE["normal_input"])
    mutation = case_row["typed_mutation"]
    op = mutation.get("operation")
    if op == "remove_required_axis_fact":
        axis_name = mutation["axis"]
        raw["axis_facts"] = [
            fact for fact in raw["axis_facts"] if fact.get("axis") != axis_name
        ]
    elif op == "append_qualified_conflicting_axis_fact":
        axis_name = mutation["axis"]
        orig_fact = next(
            fact for fact in raw["axis_facts"] if fact.get("axis") == axis_name
        )
        conflicting = copy.deepcopy(orig_fact)
        conflicting["ref"]["identity"] = f"{orig_fact['ref']['identity']}-conflicting"
        if isinstance(orig_fact["value"], dict):
            conflicting["value"] = {
                "product": "SYNTHETIC-CONFLICT-P",
                "tenant": "SYNTHETIC-T",
                "environment": "SYNTHETIC-E",
            }
        else:
            conflicting["value"] = f"{orig_fact['value']}-conflicting"
        conflicting["reason"] = "same binding/axis qualified contradictory original"
        raw["axis_facts"].append(conflicting)
        raw["semantic_comparisons"].append(
            {
                "ref": {
                    "identity": f"conflict-comparison-{orig_fact['ref']['identity']}",
                    "revision": "synthetic-A",
                    "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                    "owner": "synthetic-core-owner",
                    "source_locator": None,
                    "sha256": None,
                },
                "left_ref": copy.deepcopy(orig_fact["ref"]),
                "right_ref": copy.deepcopy(conflicting["ref"]),
                "same_meaning": False,
                "reason": "独立owner SemanticComparisonが同axis/subject/revision/scopeの相反を示す。",
                "source_ref": copy.deepcopy(raw["axis_requirements"][0]["source_ref"]),
            }
        )
    elif (
        mutation.get("target")
        == "knowledge_records[chosen].binding.knowledge_ref.revision"
    ):
        raw["knowledge_records"][0]["binding"]["knowledge_ref"]["revision"] = mutation[
            "synthetic_value"
        ]
    elif mutation.get("target") == "claims" and op == "append":
        syn = mutation["synthetic_value"]
        if "operations.backflow_requested" in syn:
            raw["operations"]["backflow_requested"] = syn[
                "operations.backflow_requested"
            ]
        if "operations.impact_requested" in syn:
            raw["operations"]["impact_requested"] = syn["operations.impact_requested"]
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
                "actor": "synthetic-caller",
                "kind": syn["kind"],
                "proposed_value": syn["value"],
                "basis_refs": [copy.deepcopy(raw["binding"]["requirement_ref"])],
            }
        )
    else:
        raise ValueError(f"Unsupported mutation recipe: {mutation}")
    _rebuild_source_graph(raw)
    return raw


class TestCompareRequiredAxes(unittest.TestCase):
    def _call_expected(self, case_id, expectation, context):
        try:
            return compare_required_axes(context)
        except NotImplementedError as exc:
            self.fail(
                f"{case_id}: {expectation}; public FN1 reached its declared bootstrap stop: {exc}"
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
        self.assertEqual(result["producer_symbol"], "compare_required_axes")
        self.assertEqual(result["input_binding"], expected_binding)
        self.assertIsInstance(result["original_axes"], list)
        self.assertIsInstance(result["findings"], list)
        self.assertIsInstance(result["material"], dict)
        self.assertEqual(
            set(result["material"]),
            {"required_axis_refs", "facts", "nonselected_operations"},
        )

    def _assert_known_axis_result(self, obs, req, fact):
        self.assertEqual(
            set(obs),
            {
                "subject_ref",
                "binding",
                "axis",
                "state",
                "original_refs",
                "reason",
                "backflow_owner",
            },
        )
        self.assertEqual(obs["subject_ref"], req["subject_ref"])
        self.assertEqual(obs["binding"], fact["binding"])
        self.assertEqual(obs["axis"], req["axis"])
        self.assertEqual(obs["state"], "known")
        self.assertEqual(obs["original_refs"], [fact["ref"], fact["source_ref"]])
        self.assertIsInstance(obs["reason"], str)
        self.assertTrue(obs["reason"].strip())
        self.assertEqual(obs["reason"], fact["reason"])
        self.assertIsNone(obs["backflow_owner"])

    def _assert_known_axes_match_selected_requirements(self, result, raw):
        selected_ops, nonselected_ops = _selected_and_nonselected_ops_from_contract(
            raw["operations"]
        )
        selected_reqs = [
            req
            for req in raw["axis_requirements"]
            if req.get("operation") in selected_ops
        ]
        self.assertEqual(len(result["original_axes"]), len(selected_reqs))
        for req, obs in zip(selected_reqs, result["original_axes"], strict=True):
            fact = next(
                row
                for row in raw["axis_facts"]
                if row.get("axis") == req["axis"]
                and row.get("binding") == raw["binding"]
            )
            self._assert_known_axis_result(obs, req, fact)
        self.assertEqual(
            result["material"]["required_axis_refs"],
            [req["ref"] for req in selected_reqs],
        )
        self.assertEqual(result["material"]["facts"], raw["axis_facts"])
        self.assertEqual(
            result["material"]["nonselected_operations"],
            nonselected_ops,
        )

    def test_normal_compare_required_axes_oracle(self):
        oracle = _FIXTURE["compare_required_axes_oracle"]
        raw = _fixture_normal_input()
        validated = validate_application_input(raw)
        context = {"validated": validated}
        before = copy.deepcopy(context)
        result = self._call_expected(
            oracle["id"],
            oracle["expected_observation"],
            context,
        )
        self._assert_comparison_shape(result, raw["binding"])
        self.assertEqual(len(raw["axis_requirements"]), 19)
        self._assert_known_axes_match_selected_requirements(result, raw)
        self.assertEqual(result["findings"], [])
        self.assertEqual(
            result["material"]["nonselected_operations"],
            ["backflow", "impact"],
        )
        self.assertEqual(context, before)

    def test_add08_unused_operation_inputs_do_not_gate_forward(self):
        add_case = _FIXTURE["add_08_case"]
        raw = _input_for_recipe("CORE-ADD-INPUT-08")
        raw["axis_requirements"].extend(
            [
                {
                    "ref": {
                        "identity": "axis-unused-backflow",
                        "revision": "synthetic-A",
                        "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                        "owner": "synthetic-core-owner",
                        "source_locator": None,
                        "sha256": None,
                    },
                    "axis": "backflow-only-input",
                    "operation": "backflow",
                    "subject_ref": copy.deepcopy(raw["binding"]["template_ref"]),
                    "reason": "差戻し操作時のみ必要な入力",
                    "source_ref": copy.deepcopy(
                        raw["axis_requirements"][0]["source_ref"]
                    ),
                },
                {
                    "ref": {
                        "identity": "axis-unused-impact",
                        "revision": "synthetic-A",
                        "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                        "owner": "synthetic-core-owner",
                        "source_locator": None,
                        "sha256": None,
                    },
                    "axis": "old-new-consumer-input",
                    "operation": "impact",
                    "subject_ref": copy.deepcopy(raw["binding"]["template_ref"]),
                    "reason": "影響比較操作時のみ必要な入力",
                    "source_ref": copy.deepcopy(
                        raw["axis_requirements"][0]["source_ref"]
                    ),
                },
            ]
        )
        _rebuild_source_graph(raw)
        validated = validate_application_input(raw)
        context = {"validated": validated}
        before = copy.deepcopy(context)
        result = self._call_expected(
            add_case["id"],
            add_case["expected_observation"],
            context,
        )
        self._assert_comparison_shape(result, raw["binding"])
        self.assertEqual(len(result["original_axes"]), 19)
        self._assert_known_axes_match_selected_requirements(result, raw)
        self.assertEqual(result["findings"], [])
        self.assertEqual(
            result["material"]["nonselected_operations"],
            ["backflow", "impact"],
        )
        self.assertEqual(context, before)

    def _check_negative_case(self, case_row):
        raw = _mutated_raw_for_negative_case(case_row)
        validated = validate_application_input(raw)
        context = {"validated": validated}
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

        selected_ops, nonselected_ops = _selected_and_nonselected_ops_from_contract(
            raw["operations"]
        )
        selected_reqs = [
            req
            for req in raw["axis_requirements"]
            if req.get("operation") in selected_ops
        ]
        self.assertEqual(len(result["original_axes"]), len(selected_reqs))
        self.assertEqual(
            result["material"]["required_axis_refs"],
            [req["ref"] for req in selected_reqs],
        )
        self.assertEqual(result["material"]["facts"], raw["axis_facts"])
        self.assertEqual(
            result["material"]["nonselected_operations"],
            nonselected_ops,
        )

        mutation_op = case_row["typed_mutation"].get("operation")
        if mutation_op in (
            "remove_required_axis_fact",
            "append_qualified_conflicting_axis_fact",
        ):
            target_axis = case_row["expected_axis"]
            for req, obs in zip(selected_reqs, result["original_axes"], strict=True):
                if req["axis"] == target_axis:
                    self.assertEqual(obs["subject_ref"], req["subject_ref"])
                    self.assertEqual(obs["binding"], raw["binding"])
                    self.assertEqual(obs["axis"], target_axis)
                    self.assertEqual(obs["state"], case_row["expected_state"])
                    self.assertEqual(obs["backflow_owner"], case_row["backflow_owner"])
                    self.assertEqual(obs["original_refs"], finding["source_refs"])
                    self.assertIsInstance(obs["reason"], str)
                    self.assertTrue(obs["reason"].strip())
                    if mutation_op == "remove_required_axis_fact":
                        self.assertEqual(
                            obs["original_refs"],
                            [req["ref"], req["source_ref"]],
                        )
                    else:
                        matching_facts = [
                            row
                            for row in raw["axis_facts"]
                            if row.get("axis") == target_axis
                            and row.get("binding") == raw["binding"]
                        ]
                        expected_conflict_refs = []
                        for fact_row in matching_facts:
                            expected_conflict_refs.append(fact_row["ref"])
                            expected_conflict_refs.append(fact_row["source_ref"])
                        self.assertEqual(
                            obs["original_refs"],
                            expected_conflict_refs,
                        )
                else:
                    fact = next(
                        row
                        for row in raw["axis_facts"]
                        if row.get("axis") == req["axis"]
                        and row.get("binding") == raw["binding"]
                    )
                    self._assert_known_axis_result(obs, req, fact)
        else:
            for req, obs in zip(selected_reqs, result["original_axes"], strict=True):
                fact = next(
                    row
                    for row in raw["axis_facts"]
                    if row.get("axis") == req["axis"]
                    and row.get("binding") == raw["binding"]
                )
                self._assert_known_axis_result(obs, req, fact)


def _bind_negative_tests():
    for row in _FIXTURE["f01_negative_cases"]:
        case_id = row["id"].lower().replace("-", "_")
        method_name = f"test_{case_id}_{row['expected_classification']}"

        def _make_test(case_row):
            def _test(self):
                self._check_negative_case(case_row)

            return _test

        setattr(TestCompareRequiredAxes, method_name, _make_test(row))


_bind_negative_tests()


if __name__ == "__main__":
    unittest.main()
