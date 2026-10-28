#!/usr/bin/env python3
"""Unit tests (PASS and mutation FAIL) for scaffold/tools/design_verification_checker.py."""

from __future__ import annotations

import copy
import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import design_verification_checker as dvc  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parents[2]


def ownership_cap_test_material() -> dict[str, object]:
    return {
        "fixture": {"input": {"value": "raw"}},
        "fixture_patch": [{"op": "replace", "path": "/value", "value": "case"}],
        "expected_return": {"state": "held"},
        "full_return": {"state": "held", "details": ["full"]},
        "materialization_sha256": "a" * 64,
        "literal_materialization_contract": {
            "seed": {"input": "independent"},
            "rfc6902_copy_ops": [{"op": "copy", "from": "/seed", "path": "/case"}],
            "rfc6902_patch": [{"op": "add", "path": "/case", "value": {}}],
            "expected_return": {"state": "held"},
            "full_return": {"state": "held", "details": ["full"]},
        },
    }


class DesignVerificationCheckerSelfTest(unittest.TestCase):
    @staticmethod
    def _negative_rows(layer: dict[str, object]) -> list[dict[str, object]]:
        if "failure_rules" in layer:
            return layer["failure_rules"]
        if "contracts" in layer:
            return layer["contracts"][0].get("negative_classifications", [])
        return layer["cases"][0].get("negative_cases", [])

    @staticmethod
    def _repeated_code_layers(
        order_by_layer: dict[str, list[str]],
    ) -> tuple[
        dict[str, object], dict[str, object], dict[str, object], dict[str, object]
    ]:
        cases = {
            identity: {
                "integration_case_ref": f"CASE-{identity}",
                "code": "missing",
                "change": f"independent condition {identity}",
                "axis": "input",
                "state": "incomplete",
                "expected": f"reject {identity}",
                "expected_preserved": {"original": identity},
                "backflow_owner": "CORE",
            }
            for identity in ("A", "B")
        }
        l4_rows = []
        l9_rows = []
        l8_rows = []
        l5_rows = []
        for identity in order_by_layer["L4"]:
            l4_rows.append({"id": f"L4-{identity}", **cases[identity]})
        for identity in order_by_layer["L9"]:
            l9_rows.append(
                {
                    "id": f"L9-{identity}",
                    **cases[identity],
                    "expected_side_effect_count": 0,
                }
            )
        for identity in order_by_layer["L8"]:
            l8_rows.append(
                {
                    "id": f"L8-{identity}",
                    "rule_ref": f"L5-R-{identity}",
                    "function_ref": "L5-fn1",
                    **cases[identity],
                    "expected_side_effect_count": 0,
                }
            )
        for identity in order_by_layer["L5"]:
            l5_rows.append(
                {
                    "id": f"L5-R-{identity}",
                    "contract_ref": "L5-01",
                    "function_ref": "L5-fn1",
                    "condition": cases[identity]["change"],
                    "expected_axis": cases[identity]["axis"],
                    "expected_state": cases[identity]["state"],
                    **{
                        key: value
                        for key, value in cases[identity].items()
                        if key not in ("change", "axis", "state")
                    },
                    "side_effect_count": 0,
                }
            )
        return (
            {"contracts": [{"id": "L4-01", "negative_classifications": l4_rows}]},
            {"cases": [{"id": "L9-01", "negative_cases": l9_rows}]},
            {"cases": [{"id": "L8-01", "negative_cases": l8_rows}]},
            {"contracts": [{"id": "L5-01"}], "failure_rules": l5_rows},
        )

    @staticmethod
    def _equivalence_class(
        class_id: str,
        classification: str,
        finding_codes: list[str],
        owner: str,
        axis: str = "binding",
        state: str = "incomplete",
    ) -> dict[str, object]:
        return {
            "class_id": class_id,
            "expected_classification": classification,
            "expected_axis": axis,
            "expected_state": state,
            "side_effect_count": 0,
            "expected": {"finding_codes": list(finding_codes)},
            "backflow_owner": owner,
        }

    @classmethod
    def _equivalence_mode_layers(
        cls,
    ) -> tuple[
        dict[str, object], dict[str, object], dict[str, object], dict[str, object]
    ]:
        """Synthetic opt-in shape; this is not the current L4/L5/L8/L9 schema."""
        keys = {
            "K-UNKNOWN": {
                "classification": "fixture_unknown",
                "finding_codes": ["field_unknown"],
                "owner": "owner-x",
                "axis": "identity",
                "state": "unresolved",
            },
            "K-CONFLICT": {
                "classification": "fixture_conflict",
                "finding_codes": ["field_conflict", "field_conflict_detail"],
                "owner": "owner-y",
                "axis": "scope",
                "state": "conflict",
            },
            "K-UNKNOWN-OTHER-OWNER": {
                "classification": "fixture_unknown",
                "finding_codes": ["field_unknown"],
                "owner": "owner-z",
                "axis": "identity",
                "state": "unresolved",
            },
        }

        # Deliberately use different class IDs and place rows at different
        # contract/function positions. Equivalence uses declared owner refs,
        # not cross-layer class ID or array position.
        l4_classes = [
            cls._equivalence_class("L4-C-UNKNOWN", **keys["K-UNKNOWN"]),
            cls._equivalence_class("L4-C-CONFLICT", **keys["K-CONFLICT"]),
            cls._equivalence_class(
                "L4-C-UNKNOWN-OTHER-OWNER", **keys["K-UNKNOWN-OTHER-OWNER"]
            ),
        ]
        for class_row in l4_classes:
            class_row["design_ref"] = "L4-contract-A"
        l5_classes = [
            cls._equivalence_class("L5-RULE-CONFLICT", **keys["K-CONFLICT"]),
            cls._equivalence_class("L5-RULE-UNKNOWN", **keys["K-UNKNOWN"]),
            cls._equivalence_class(
                "L5-RULE-UNKNOWN-OTHER-OWNER", **keys["K-UNKNOWN-OTHER-OWNER"]
            ),
        ]
        l8_classes = [
            cls._equivalence_class("L8-CLASS-1", **keys["K-UNKNOWN"]),
            cls._equivalence_class("L8-CLASS-2", **keys["K-CONFLICT"]),
            cls._equivalence_class("L8-CLASS-3", **keys["K-UNKNOWN-OTHER-OWNER"]),
        ]
        for class_row in l8_classes:
            # L8 rows do not provide finding owners; the checker resolves them
            # through the matching L9 case's original findings.
            class_row.pop("backflow_owner")
        l9_classes = [
            cls._equivalence_class("L9-CLASS-B", **keys["K-CONFLICT"]),
            cls._equivalence_class("L9-CLASS-A", **keys["K-UNKNOWN"]),
            cls._equivalence_class("L9-CLASS-C", **keys["K-UNKNOWN-OTHER-OWNER"]),
        ]

        l8_rows = [
            {
                "case_id": "CASE-UNKNOWN-1",
                "population_state": "negative",
                "negative_class_ref": "L8-CLASS-1",
                "expected_property": {
                    "condition": "fixture_unknown",
                    "finding_codes": ["field_unknown"],
                },
            },
            {
                "case_id": "CASE-UNKNOWN-2",
                "population_state": "negative",
                "negative_class_ref": "L8-CLASS-1",
                "expected_property": {
                    "condition": "fixture_unknown",
                    "finding_codes": ["field_unknown"],
                },
            },
            {
                "case_id": "CASE-CONFLICT",
                "population_state": "negative",
                "negative_class_ref": "L8-CLASS-2",
                "expected_property": {
                    "condition": "fixture_conflict",
                    "finding_codes": ["field_conflict", "field_conflict_detail"],
                },
            },
            {
                "case_id": "CASE-POSITIVE",
                "population_state": "positive",
                "expected_property": {"condition": "fixture_ok", "finding_codes": []},
            },
            {
                "case_id": "CASE-UNKNOWN-OTHER-OWNER",
                "population_state": "negative",
                "negative_class_ref": "L8-CLASS-3",
                "expected_property": {
                    "condition": "fixture_unknown",
                    "finding_codes": ["field_unknown"],
                },
            },
        ]
        l9_rows = [
            {
                "id": "CASE-UNKNOWN-1",
                "population_state": "negative",
                "negative_class_ref": "L9-CLASS-A",
                "compact_whole_observation": {
                    "condition": "fixture_unknown",
                    "ordered_findings": [
                        {"code": "field_unknown", "return_owner": "owner-x"}
                    ],
                },
            },
            {
                "id": "CASE-UNKNOWN-2",
                "population_state": "negative",
                "negative_class_ref": "L9-CLASS-A",
                "compact_whole_observation": {
                    "condition": "fixture_unknown",
                    "ordered_findings": [
                        {"code": "field_unknown", "return_owner": "owner-x"}
                    ],
                },
            },
            {
                "id": "CASE-CONFLICT",
                "population_state": "negative",
                "negative_class_ref": "L9-CLASS-B",
                "compact_whole_observation": {
                    "condition": "fixture_conflict",
                    "ordered_findings": [
                        {"code": "field_conflict", "return_owner": "owner-y"},
                        {
                            "code": "field_conflict_detail",
                            "return_owner": "owner-y",
                        },
                    ],
                },
            },
            {
                "id": "CASE-POSITIVE",
                "population_state": "positive",
                "compact_whole_observation": {
                    "condition": "fixture_ok",
                    "ordered_findings": [],
                },
            },
            {
                "id": "CASE-UNKNOWN-OTHER-OWNER",
                "population_state": "negative",
                "negative_class_ref": "L9-CLASS-C",
                "compact_whole_observation": {
                    "condition": "fixture_unknown",
                    "ordered_findings": [
                        {"code": "field_unknown", "return_owner": "owner-z"}
                    ],
                },
            },
        ]

        class_rule_refs = {
            "L8-CLASS-1": ("L5-RULE-UNKNOWN", "L5-fn-A"),
            "L8-CLASS-2": ("L5-RULE-CONFLICT", "L5-fn-D"),
            "L8-CLASS-3": ("L5-RULE-UNKNOWN-OTHER-OWNER", "L5-fn-D"),
        }
        l5_rules = []
        for class_id, function_id in (
            ("L5-RULE-UNKNOWN", "L5-fn-A"),
            ("L5-RULE-CONFLICT", "L5-fn-D"),
            ("L5-RULE-UNKNOWN-OTHER-OWNER", "L5-fn-D"),
        ):
            class_row = next(row for row in l5_classes if row["class_id"] == class_id)
            l5_rules.append(
                {
                    "id": class_id,
                    "code": class_row["expected_classification"],
                    "function_ref": function_id,
                    "class_id": class_id,
                    "expected_classification": class_row["expected_classification"],
                    "expected_axis": class_row["expected_axis"],
                    "expected_state": class_row["expected_state"],
                    "side_effect_count": class_row["side_effect_count"],
                    "expected": copy.deepcopy(class_row["expected"]),
                    "backflow_owner": class_row.get("backflow_owner"),
                }
            )
        for row in l8_rows:
            class_ref = row.get("negative_class_ref")
            if class_ref in class_rule_refs:
                row["rule_ref"], row["function_ref"] = class_rule_refs[class_ref]
                class_row = next(
                    item for item in l8_classes if item["class_id"] == class_ref
                )
                row["expected_axis"] = class_row["expected_axis"]
                row["expected_state"] = class_row["expected_state"]
                row["side_effect_count"] = 0
            row["integration_case_ref"] = row["case_id"]
            row["condition"] = row["expected_property"]["condition"]
            row["expected"] = f"expected:{row['case_id']}"
            row["expected_preserved"] = {"case": row["case_id"]}
        for row in l9_rows:
            if row.get("population_state") == "negative":
                class_row = next(
                    item
                    for item in l9_classes
                    if item["class_id"] == row["negative_class_ref"]
                )
                row["expected_axis"] = class_row["expected_axis"]
                row["expected_state"] = class_row["expected_state"]
                row["side_effect_count"] = 0
            row["change"] = row["compact_whole_observation"]["condition"]
            row["expected"] = f"expected:{row['id']}"
            row["expected_preserved"] = {"case": row["id"]}
        return (
            {
                "contracts": [
                    {
                        "id": "L4-contract-A",
                        "negative_class_refs": [row["class_id"] for row in l4_classes],
                    }
                ],
                "negative_equivalence_classes": {
                    "source_rows": "failure_classifications"
                },
                "failure_classifications": [
                    {
                        **row,
                        "id": row["class_id"],
                        "code": row["expected_classification"],
                    }
                    for row in l4_classes
                ],
            },
            {
                "integration_cases": l9_rows,
                "negative_equivalence_classes": l9_classes,
            },
            {
                "case_count": len(l8_rows),
                "unit_cases": l8_rows,
                "negative_equivalence_classes": l8_classes,
            },
            {
                "functions": [
                    {"id": "L5-fn-A"},
                    {"id": "L5-fn-B"},
                    {"id": "L5-fn-C"},
                    {"id": "L5-fn-D"},
                ],
                "failure_rules": l5_rules,
                "negative_equivalence_classes": {"source_rows": "failure_rules"},
            },
        )

    def test_chk_neg_4way_explicit_equivalence_mode_passes_synthetic_classes(
        self,
    ) -> None:
        layers = self._equivalence_mode_layers()
        function_ids = {row["id"] for row in layers[3]["functions"]}
        rules_by_id = {row["id"]: row for row in layers[3]["failure_rules"]}
        l9_ids = {row["id"] for row in layers[1]["integration_cases"]}
        for row in layers[2]["unit_cases"]:
            if row["population_state"] == "positive":
                continue
            self.assertIn(row["integration_case_ref"], l9_ids)
            self.assertIn(row["rule_ref"], rules_by_id)
            self.assertIn(row["function_ref"], function_ids)
            self.assertEqual(
                rules_by_id[row["rule_ref"]]["function_ref"], row["function_ref"]
            )
        result = dvc.check_neg_4way_match(
            REPO_ROOT,
            "L4",
            "L9",
            "L8",
            "L5",
            layers[0],
            layers[1],
            layers[2],
            layers[3],
        )
        self.assertTrue(
            result["passed"],
            msg=(
                "explicit equivalence mode must compare the ordered class key, "
                "pair L8/L9 supplied cases by case ID, and ignore class IDs and "
                f"contract/function array positions: {result}"
            ),
        )
        self.assertEqual(
            result["comparison_mode"], "explicit_negative_equivalence_classes"
        )
        self.assertEqual(result["parent_link_mode"], "new_parent_link")
        self.assertEqual(
            result["count_unit"], "unique_equivalence_class_keys_per_layer"
        )
        self.assertEqual(
            result["matched_case_count_unit"], "paired_negative_L8_L9_case_rows"
        )
        self.assertEqual(result["counts"], {"L4": 3, "L9": 3, "L8": 3, "L5": 3})
        self.assertEqual(
            result["class_row_counts"], {"L4": 3, "L9": 3, "L8": 3, "L5": 3}
        )
        self.assertEqual(result["case_row_counts"], {"L8": 5, "L9": 5})
        self.assertEqual(
            result["comparison_scope"]["case_population"],
            "only_supplied_rows; simultaneous_omission_is_not_detected",
        )
        self.assertEqual(
            result["comparison_scope"]["not_checked"],
            ["full_legacy_per_case_four_layer_attribute_tuple"],
        )

    def test_chk_neg_4way_new_parent_link_partial_declaration_fails(self) -> None:
        for missing_field in ("design_ref", "negative_class_refs"):
            with self.subTest(missing_field=missing_field):
                layers = list(self._equivalence_mode_layers())
                if missing_field == "design_ref":
                    layers[0]["failure_classifications"][2].pop("design_ref")
                    expected_reason = "l4_top_level_design_ref_missing_or_invalid"
                else:
                    layers[0]["contracts"][0].pop("negative_class_refs")
                    expected_reason = "l4_negative_class_refs_missing"
                result = dvc.check_neg_4way_match(
                    REPO_ROOT, "L4", "L9", "L8", "L5", *layers
                )
                self.assertEqual(result["parent_link_mode"], "new_parent_link")
                self.assertFalse(result["passed"], msg=result)
                self.assertIn(
                    expected_reason,
                    {item["reason"] for item in result["failures"]},
                )

    def test_chk_neg_4way_new_parent_link_one_direction_only_fails(self) -> None:
        layers = list(self._equivalence_mode_layers())
        class_id = layers[0]["failure_classifications"][0]["class_id"]
        layers[0]["contracts"][0]["negative_class_refs"].remove(class_id)
        result = dvc.check_neg_4way_match(REPO_ROOT, "L4", "L9", "L8", "L5", *layers)
        self.assertEqual(result["parent_link_mode"], "new_parent_link")
        self.assertFalse(result["passed"], msg=result)
        self.assertIn(
            "l4_parent_reverse_link_missing_or_ambiguous",
            {item["reason"] for item in result["failures"]},
        )

    def test_chk_neg_4way_new_parent_link_duplicate_fails(self) -> None:
        layers = list(self._equivalence_mode_layers())
        class_id = layers[0]["failure_classifications"][0]["class_id"]
        layers[0]["contracts"][0]["negative_class_refs"].append(class_id)
        result = dvc.check_neg_4way_match(REPO_ROOT, "L4", "L9", "L8", "L5", *layers)
        self.assertEqual(result["parent_link_mode"], "new_parent_link")
        self.assertFalse(result["passed"], msg=result)
        self.assertIn(
            "l4_negative_class_ref_duplicate",
            {item["reason"] for item in result["failures"]},
        )

    def test_chk_neg_4way_new_and_nested_parent_definitions_conflict(self) -> None:
        layers = list(self._equivalence_mode_layers())
        layers[0]["contracts"][0]["negative_classifications"] = [
            copy.deepcopy(layers[0]["failure_classifications"][0])
        ]
        result = dvc.check_neg_4way_match(REPO_ROOT, "L4", "L9", "L8", "L5", *layers)
        self.assertEqual(result["parent_link_mode"], "new_parent_link")
        self.assertFalse(result["passed"], msg=result)
        self.assertIn(
            "l4_class_dual_definition_nested_and_top_level",
            {item["reason"] for item in result["failures"]},
        )

    def test_chk_neg_4way_explicit_legacy_parent_mode_rejects_nested_duplicate(
        self,
    ) -> None:
        layers = list(self._equivalence_mode_layers())
        l4 = layers[0]
        for row in l4["failure_classifications"]:
            row.pop("design_ref", None)
        l4["contracts"][0].pop("negative_class_refs", None)
        l4["contracts"][0]["negative_classifications"] = [
            copy.deepcopy(l4["failure_classifications"][0])
        ]
        result = dvc.check_neg_4way_match(REPO_ROOT, "L4", "L9", "L8", "L5", *layers)
        self.assertEqual(
            result["comparison_mode"], "explicit_negative_equivalence_classes"
        )
        self.assertEqual(result["parent_link_mode"], "legacy")
        self.assertFalse(result["passed"], msg=result)
        self.assertIn(
            "l4_class_dual_definition_nested_and_top_level",
            {item["reason"] for item in result["failures"]},
        )

    def test_chk_neg_4way_verification_discipline_old_parent_form_passes(self) -> None:
        paths = (
            "docs/helix-harness/L4-basic-design/verification-discipline.json",
            "docs/helix-harness/L9-integration-verification/verification-discipline.json",
            "docs/helix-harness/L8-unit-verification/verification-discipline.json",
            "docs/helix-harness/L5-detail-design/verification-discipline.json",
        )
        result = dvc.check_neg_4way_match(REPO_ROOT, *paths)
        self.assertEqual(
            result["comparison_mode"], "explicit_negative_equivalence_classes"
        )
        self.assertEqual(result["parent_link_mode"], "legacy")
        self.assertTrue(result["passed"], msg=result)
        self.assertEqual(result["counts"], {"L4": 84, "L9": 84, "L8": 84, "L5": 84})
        self.assertEqual(result["matched_case_count"], 84)
        self.assertEqual(
            result["comparison_scope"]["class_invariants"],
            [
                "class_rows_only; negative cases inherit by negative_class_ref",
                "expected_axis",
                "expected_state",
                "side_effect_count=0",
            ],
        )
        self.assertEqual(
            result["comparison_scope"]["case_attributes"],
            [
                "change↔condition",
                "expected",
                "expected_preserved",
                "integration_case_ref",
                "negative_class_ref→class key (case key fields optional; if present, exact match)",
                "L8.expected_property (optional class projection; if present, exact match)",
            ],
        )

    def test_chk_neg_4way_explicit_mode_inherits_case_key_from_class_reference(
        self,
    ) -> None:
        layers = self._equivalence_mode_layers()
        for case in layers[2]["unit_cases"]:
            if case["population_state"] != "negative":
                continue
            for field in (
                "expected_axis",
                "expected_state",
                "side_effect_count",
                "expected_side_effect_count",
                "expected_property",
            ):
                case.pop(field, None)

        for case in layers[1]["integration_cases"]:
            if case["population_state"] != "negative":
                continue
            for field in (
                "expected_axis",
                "expected_state",
                "side_effect_count",
                "expected_side_effect_count",
            ):
                case.pop(field, None)

        result = dvc.check_neg_4way_match(
            REPO_ROOT,
            "L4",
            "L9",
            "L8",
            "L5",
            layers[0],
            layers[1],
            layers[2],
            layers[3],
        )
        self.assertTrue(
            result["passed"],
            msg=(
                "negative_class_ref must supply the L8/L9 class key without copied "
                f"axis/state/side-effect/expected_property fields: {result}"
            ),
        )
        self.assertEqual(result["matched_case_count"], 4)
        self.assertEqual(result["case_row_counts"], {"L8": 5, "L9": 5})

    def test_chk_neg_4way_explicit_mode_rejects_case_key_mismatch(self) -> None:
        baseline = self._equivalence_mode_layers()
        mutations = (
            (
                "classification",
                lambda layers: layers[2]["unit_cases"][0][
                    "expected_property"
                ].__setitem__("condition", "different-classification"),
                "equivalence_key",
            ),
            (
                "finding_codes",
                lambda layers: layers[2]["unit_cases"][0][
                    "expected_property"
                ].__setitem__("finding_codes", ["different-finding"]),
                "equivalence_key",
            ),
            (
                "partial_expected_property_projection",
                lambda layers: layers[2]["unit_cases"][0]["expected_property"].pop(
                    "finding_codes"
                ),
                "equivalence_key",
            ),
            (
                "null_expected_property_projection",
                lambda layers: layers[2]["unit_cases"][0].__setitem__(
                    "expected_property", None
                ),
                "equivalence_key",
            ),
            (
                "backflow_owner",
                lambda layers: layers[1]["integration_cases"][0][
                    "compact_whole_observation"
                ]["ordered_findings"][0].__setitem__("return_owner", "different-owner"),
                "equivalence_key",
            ),
            (
                "expected_axis",
                lambda layers: layers[2]["unit_cases"][0].__setitem__(
                    "expected_axis", "different-axis"
                ),
                "expected_axis",
            ),
            (
                "expected_state",
                lambda layers: layers[2]["unit_cases"][0].__setitem__(
                    "expected_state", "different-state"
                ),
                "expected_state",
            ),
            (
                "owner_ref",
                lambda layers: layers[2]["unit_cases"][0].__setitem__(
                    "rule_ref", "L5-RULE-CONFLICT"
                ),
                "rule_ref",
            ),
            (
                "side_effect_count",
                lambda layers: layers[2]["unit_cases"][0].__setitem__(
                    "side_effect_count", 1
                ),
                "side_effect_count",
            ),
            (
                "null_expected_side_effect_count_alias",
                lambda layers: layers[2]["unit_cases"][0].__setitem__(
                    "expected_side_effect_count", None
                ),
                "side_effect_count",
            ),
        )
        for name, mutate, expected_attribute in mutations:
            with self.subTest(key_component=name):
                mismatched = copy.deepcopy(baseline)
                mutate(mismatched)
                result = dvc.check_neg_4way_match(
                    REPO_ROOT,
                    "L4",
                    "L9",
                    "L8",
                    "L5",
                    mismatched[0],
                    mismatched[1],
                    mismatched[2],
                    mismatched[3],
                )
                self.assertFalse(result["passed"], msg=result)
                self.assertTrue(
                    any(
                        failure.get("attribute") == expected_attribute
                        for failure in result["failures"]
                    ),
                    msg=f"{name} mutation must fail on {expected_attribute}: {result}",
                )

    def test_chk_neg_4way_explicit_mode_rejects_unresolved_case_class_ref(self) -> None:
        layers = self._equivalence_mode_layers()
        layers[2]["unit_cases"][0]["negative_class_ref"] = "NO-SUCH-CLASS"
        result = dvc.check_neg_4way_match(
            REPO_ROOT,
            "L4",
            "L9",
            "L8",
            "L5",
            layers[0],
            layers[1],
            layers[2],
            layers[3],
        )
        self.assertFalse(result["passed"], msg=result)
        self.assertTrue(
            any(
                failure.get("attribute") == "negative_class_ref"
                and failure.get("reason")
                == "negative_case_class_ref_missing_or_unresolved"
                for failure in result["failures"]
            ),
            msg=result,
        )

    @classmethod
    def _contract_owned_equivalence_layers(
        cls, *, split_same_five_key: bool = False
    ) -> tuple[
        dict[str, object], dict[str, object], dict[str, object], dict[str, object]
    ]:
        layers = cls._equivalence_mode_layers()
        l4, l9, l8, l5 = layers
        rule = next(
            row for row in l5["failure_rules"] if row["id"] == "L5-RULE-UNKNOWN"
        )
        rule.pop("function_ref")
        rule["contract_ref"] = "L5-CONTRACT-A"
        rule["integration_case_ref"] = "CASE-UNKNOWN-1"
        l5["contracts"] = [
            {
                "id": "L5-CONTRACT-A",
                "l4_contract_ref": "L4-CONTRACT-A",
                "requirement_ref": "REQ-A",
            }
        ]
        l4["contracts"] = [
            {
                "id": "L4-CONTRACT-A",
                "negative_class_refs": [
                    row["class_id"] for row in l4["failure_classifications"]
                ],
            }
        ]
        for row in l4["failure_classifications"]:
            row["design_ref"] = "L4-CONTRACT-A"
        l4["failure_classifications"][0]["integration_case_ref"] = "CASE-UNKNOWN-1"
        for row in l4["failure_classifications"]:
            if row.get("backflow_owner") == "owner-x":
                row["expected_axis"] = ["/fixture/owner"]
        for row in l5["failure_rules"]:
            if row.get("id") == "L5-RULE-UNKNOWN":
                row["expected_axis"] = ["/fixture/owner"]
        for row in l8["negative_equivalence_classes"]:
            if row.get("class_id") == "L8-CLASS-1":
                row["expected_axis"] = ["/fixture/owner"]
        for row in l9["negative_equivalence_classes"]:
            if row.get("class_id") == "L9-CLASS-A":
                row["expected_axis"] = ["/fixture/owner"]
        for row in l8["unit_cases"]:
            if row.get("negative_class_ref") == "L8-CLASS-1":
                row["expected_axis"] = ["/fixture/owner"]
        for row in l9["integration_cases"]:
            if row.get("negative_class_ref") == "L9-CLASS-A":
                row["expected_axis"] = ["/fixture/owner"]
        for row in l8["unit_cases"]:
            if row.get("negative_class_ref") == "L8-CLASS-1":
                row.pop("function_ref", None)
                row["rule_ref"] = "L5-RULE-UNKNOWN"
                if row["case_id"] == "CASE-UNKNOWN-1":
                    row["contract_ref"] = "L5-CONTRACT-A"
                else:
                    row["requirement_trace"] = ["REQ-A"]

        if split_same_five_key:
            duplicate_l4 = copy.deepcopy(l4["failure_classifications"][0])
            duplicate_l4["class_id"] = "L4-C-UNKNOWN-CONTRACT-B"
            duplicate_l4["id"] = "L4-C-UNKNOWN-CONTRACT-B"
            duplicate_l4["integration_case_ref"] = "CASE-UNKNOWN-CONTRACT-B"
            duplicate_l4["design_ref"] = "L4-CONTRACT-B"
            l4["failure_classifications"].append(duplicate_l4)

            duplicate_l5 = copy.deepcopy(rule)
            duplicate_l5.update(
                {
                    "id": "L5-RULE-UNKNOWN-CONTRACT-B",
                    "class_id": "L5-RULE-UNKNOWN-CONTRACT-B",
                    "contract_ref": "L5-CONTRACT-B",
                    "integration_case_ref": "CASE-UNKNOWN-CONTRACT-B",
                }
            )
            l5["failure_rules"].append(duplicate_l5)
            l5["contracts"].append(
                {
                    "id": "L5-CONTRACT-B",
                    "l4_contract_ref": "L4-CONTRACT-B",
                    "requirement_ref": "REQ-B",
                }
            )

            duplicate_l8_class = copy.deepcopy(
                next(
                    row
                    for row in l8["negative_equivalence_classes"]
                    if row["class_id"] == "L8-CLASS-1"
                )
            )
            duplicate_l8_class["class_id"] = "L8-CLASS-UNKNOWN-CONTRACT-B"
            l8["negative_equivalence_classes"].append(duplicate_l8_class)
            duplicate_l9_class = copy.deepcopy(
                next(
                    row
                    for row in l9["negative_equivalence_classes"]
                    if row["class_id"] == "L9-CLASS-A"
                )
            )
            duplicate_l9_class["class_id"] = "L9-CLASS-UNKNOWN-CONTRACT-B"
            l9["negative_equivalence_classes"].append(duplicate_l9_class)

            new_l8_case = copy.deepcopy(
                next(
                    row
                    for row in l8["unit_cases"]
                    if row["case_id"] == "CASE-UNKNOWN-1"
                )
            )
            new_l8_case.update(
                {
                    "case_id": "CASE-UNKNOWN-CONTRACT-B",
                    "negative_class_ref": "L8-CLASS-UNKNOWN-CONTRACT-B",
                    "integration_case_ref": "CASE-UNKNOWN-CONTRACT-B",
                    "rule_ref": "L5-RULE-UNKNOWN-CONTRACT-B",
                    "contract_ref": "L5-CONTRACT-B",
                    "requirement_trace": ["REQ-B"],
                    "expected": "expected:CASE-UNKNOWN-CONTRACT-B",
                    "expected_preserved": {"case": "CASE-UNKNOWN-CONTRACT-B"},
                }
            )
            l8["unit_cases"].append(new_l8_case)

            new_l9_case = copy.deepcopy(
                next(
                    row
                    for row in l9["integration_cases"]
                    if row["id"] == "CASE-UNKNOWN-1"
                )
            )
            new_l9_case.update(
                {
                    "id": "CASE-UNKNOWN-CONTRACT-B",
                    "negative_class_ref": "L9-CLASS-UNKNOWN-CONTRACT-B",
                    "expected": "expected:CASE-UNKNOWN-CONTRACT-B",
                    "expected_preserved": {"case": "CASE-UNKNOWN-CONTRACT-B"},
                }
            )
            l9["integration_cases"].append(new_l9_case)
            l8["case_count"] += 1

            l4["contracts"].append(
                {
                    "id": "L4-CONTRACT-B",
                    "negative_class_refs": [duplicate_l4["class_id"]],
                }
            )

        return layers

    def test_chk_neg_4way_explicit_owner_ref_uses_function_ref_when_declared(
        self,
    ) -> None:
        layers = self._equivalence_mode_layers()
        result = dvc.check_neg_4way_match(
            REPO_ROOT,
            "L4",
            "L9",
            "L8",
            "L5",
            layers[0],
            layers[1],
            layers[2],
            layers[3],
        )
        self.assertTrue(result["passed"], msg=result)
        self.assertEqual(
            result["comparison_scope"]["class_key"][-1],
            "owner_ref(kind, id); L5 function_ref wins over contract_ref",
        )

    def test_chk_neg_4way_explicit_owner_ref_accepts_contract_only_rule_trace(
        self,
    ) -> None:
        layers = self._contract_owned_equivalence_layers()
        result = dvc.check_neg_4way_match(
            REPO_ROOT,
            "L4",
            "L9",
            "L8",
            "L5",
            layers[0],
            layers[1],
            layers[2],
            layers[3],
        )
        self.assertTrue(result["passed"], msg=result)
        self.assertEqual(result["counts"], {"L4": 3, "L9": 3, "L8": 3, "L5": 3})
        self.assertFalse(
            any(
                failure.get("attribute") == "function_ref"
                for failure in result["failures"]
            ),
            msg=result,
        )

    def test_chk_neg_4way_l4_contract_ref_accepts_os015_contract_shape(self) -> None:
        """The parent field matches OS015 at e5232d331 L5 /contracts/1."""
        # Source evidence: docs/helix-os/L5-detail-design/
        # management-authority-source-record.json#/contracts/1 has
        # l4_contract_ref=HELIXOS-L4-015-F01; its parent is
        # docs/helix-os/L4-basic-design/management-authority-source-record.json
        # #/contracts/1, id=HELIXOS-L4-015-F01 (e5232d331).
        layers = self._contract_owned_equivalence_layers()
        l4, _l9, l8, l5 = layers
        l4["contracts"][0]["id"] = "HELIXOS-L4-015-F01"
        for row in l4["failure_classifications"]:
            if row.get("design_ref") == "L4-CONTRACT-A":
                row["design_ref"] = "HELIXOS-L4-015-F01"
        l5["contracts"][0].update(
            {
                "id": "HELIXOS-L5-015-P-F01",
                "l4_contract_ref": "HELIXOS-L4-015-F01",
                "requirement_ref": "HELIXOS-L3-015-F01",
            }
        )
        next(row for row in l5["failure_rules"] if row["id"] == "L5-RULE-UNKNOWN")[
            "contract_ref"
        ] = "HELIXOS-L5-015-P-F01"
        for row in l8["unit_cases"]:
            if row.get("rule_ref") == "L5-RULE-UNKNOWN":
                if "contract_ref" in row:
                    row["contract_ref"] = "HELIXOS-L5-015-P-F01"
                if "requirement_trace" in row:
                    row["requirement_trace"] = ["HELIXOS-L3-015-F01"]
        result = dvc.check_neg_4way_match(
            REPO_ROOT,
            "L4",
            "L9",
            "L8",
            "L5",
            layers[0],
            layers[1],
            layers[2],
            layers[3],
        )
        self.assertTrue(result["passed"], msg=result)

    def test_chk_neg_4way_explicit_owner_ref_separates_same_five_key_contracts(
        self,
    ) -> None:
        layers = self._contract_owned_equivalence_layers(split_same_five_key=True)
        result = dvc.check_neg_4way_match(
            REPO_ROOT,
            "L4",
            "L9",
            "L8",
            "L5",
            layers[0],
            layers[1],
            layers[2],
            layers[3],
        )
        self.assertTrue(result["passed"], msg=result)
        self.assertEqual(result["counts"], {"L4": 4, "L9": 4, "L8": 4, "L5": 4})

    def test_chk_neg_4way_explicit_owner_ref_fails_closed_on_bad_bindings(self) -> None:
        baseline = self._contract_owned_equivalence_layers()
        mutations: list[tuple[str, tuple[dict[str, object], ...], str]] = []

        missing_trace = copy.deepcopy(baseline)
        for row in missing_trace[2]["unit_cases"]:
            if row.get("rule_ref") == "L5-RULE-UNKNOWN":
                row.pop("requirement_trace", None)
                row.pop("contract_ref", None)
        mutations.append(("contract_trace_missing", missing_trace, "contract_ref"))

        wrong_trace = copy.deepcopy(baseline)
        for row in wrong_trace[2]["unit_cases"]:
            if row.get("rule_ref") == "L5-RULE-UNKNOWN":
                row["requirement_trace"] = ["REQ-OTHER"]
        mutations.append(("contract_trace_mismatch", wrong_trace, "contract_ref"))

        non_string_trace_member = copy.deepcopy(baseline)
        for row in non_string_trace_member[2]["unit_cases"]:
            if row.get("rule_ref") == "L5-RULE-UNKNOWN":
                row["requirement_trace"] = ["REQ-A", 7]
                row["source_trace"] = {"requirement_ref": "REQ-A"}
        mutations.append(
            (
                "requirement_trace_non_string_member_even_with_valid_source_trace",
                non_string_trace_member,
                "contract_ref",
            )
        )

        inconsistent_trace_carriers = copy.deepcopy(baseline)
        for row in inconsistent_trace_carriers[2]["unit_cases"]:
            if row.get("rule_ref") == "L5-RULE-UNKNOWN":
                row["requirement_trace"] = ["REQ-A"]
                row["source_trace"] = {"requirement_ref": "REQ-OTHER"}
        mutations.append(
            (
                "source_trace_mismatch_even_with_valid_requirement_trace",
                inconsistent_trace_carriers,
                "contract_ref",
            )
        )

        non_object_source_trace = copy.deepcopy(baseline)
        for row in non_object_source_trace[2]["unit_cases"]:
            if row.get("rule_ref") == "L5-RULE-UNKNOWN":
                row["contract_ref"] = "L5-CONTRACT-A"
                row["source_trace"] = ["REQ-A"]
        mutations.append(
            (
                "non_object_source_trace_not_rescued_by_contract_ref",
                non_object_source_trace,
                "contract_ref",
            )
        )

        l4_parent_contract_mismatch = copy.deepcopy(baseline)
        l5_contract = next(
            row
            for row in l4_parent_contract_mismatch[3]["contracts"]
            if row["id"] == "L5-CONTRACT-A"
        )
        l5_contract["basic_design_ref"] = "L4-CONTRACT-WRONG"
        mutations.append(
            (
                "l4_integration_case_owner_rule_contract_must_match_l4_parent",
                l4_parent_contract_mismatch,
                "contract_ref",
            )
        )

        conflicting_l4_parent_refs = copy.deepcopy(baseline)
        l5_contract = next(
            row
            for row in conflicting_l4_parent_refs[3]["contracts"]
            if row["id"] == "L5-CONTRACT-A"
        )
        l5_contract["basic_design_ref"] = "L4-CONTRACT-CONFLICT"
        mutations.append(
            (
                "l4_contract_ref_and_basic_design_ref_conflict",
                conflicting_l4_parent_refs,
                "contract_ref",
            )
        )

        both_refs_case_contract_mismatch = copy.deepcopy(baseline)
        rule = next(
            row
            for row in both_refs_case_contract_mismatch[3]["failure_rules"]
            if row["id"] == "L5-RULE-UNKNOWN"
        )
        rule["function_ref"] = "L5-fn-A"
        both_refs_case_contract_mismatch[3]["contracts"][0]["function"] = "L5-fn-A"
        for row in both_refs_case_contract_mismatch[2]["unit_cases"]:
            if row.get("rule_ref") == "L5-RULE-UNKNOWN":
                row["function_ref"] = "L5-fn-A"
                if row["case_id"] == "CASE-UNKNOWN-1":
                    row["contract_ref"] = "L5-CONTRACT-WRONG"
        mutations.append(
            (
                "both_rule_refs_case_contract_trace_mismatch",
                both_refs_case_contract_mismatch,
                "contract_ref",
            )
        )

        invalid_function_no_fallback = copy.deepcopy(baseline)
        rule = next(
            row
            for row in invalid_function_no_fallback[3]["failure_rules"]
            if row["id"] == "L5-RULE-UNKNOWN"
        )
        rule["function_ref"] = "NO-SUCH-FUNCTION"
        mutations.append(
            (
                "invalid_function_does_not_fall_back_to_contract",
                invalid_function_no_fallback,
                "function_ref",
            )
        )

        both_refs_disagree = copy.deepcopy(baseline)
        rule = next(
            row
            for row in both_refs_disagree[3]["failure_rules"]
            if row["id"] == "L5-RULE-UNKNOWN"
        )
        rule["function_ref"] = "L5-fn-A"
        both_refs_disagree[3]["contracts"][0]["function"] = "L5-fn-D"
        for row in both_refs_disagree[2]["unit_cases"]:
            if row.get("rule_ref") == "L5-RULE-UNKNOWN":
                row["function_ref"] = "L5-fn-A"
        mutations.append(
            ("both_declared_refs_must_agree", both_refs_disagree, "contract_ref")
        )

        duplicate_function_id = copy.deepcopy(baseline)
        duplicate_function_id[3]["functions"].append(
            copy.deepcopy(duplicate_function_id[3]["functions"][0])
        )
        mutations.append(
            ("duplicate_function_id", duplicate_function_id, "function_ref")
        )

        duplicate_contract_id = copy.deepcopy(baseline)
        duplicate_contract_id[3]["contracts"].append(
            copy.deepcopy(duplicate_contract_id[3]["contracts"][0])
        )
        mutations.append(
            ("duplicate_contract_id", duplicate_contract_id, "contract_ref")
        )

        same_class_different_owners = copy.deepcopy(baseline)
        case = next(
            row
            for row in same_class_different_owners[2]["unit_cases"]
            if row["case_id"] == "CASE-UNKNOWN-2"
        )
        case["rule_ref"] = "L5-RULE-UNKNOWN-OTHER-OWNER"
        case["function_ref"] = "L5-fn-D"
        mutations.append(
            (
                "same_class_has_different_owner_refs",
                same_class_different_owners,
                "owner_ref",
            )
        )

        ambiguous_rule_ref = copy.deepcopy(baseline)
        duplicate_rule = copy.deepcopy(
            next(
                row
                for row in ambiguous_rule_ref[3]["failure_rules"]
                if row["id"] == "L5-RULE-UNKNOWN"
            )
        )
        ambiguous_rule_ref[3]["failure_rules"].append(duplicate_rule)
        mutations.append(("duplicate_rule_ref", ambiguous_rule_ref, "rule_ref"))

        for name, layers, expected_attribute in mutations:
            with self.subTest(mutation=name):
                result = dvc.check_neg_4way_match(
                    REPO_ROOT,
                    "L4",
                    "L9",
                    "L8",
                    "L5",
                    layers[0],
                    layers[1],
                    layers[2],
                    layers[3],
                )
                self.assertFalse(result["passed"], msg=result)
                self.assertTrue(
                    any(
                        failure.get("attribute") == expected_attribute
                        for failure in result["failures"]
                    ),
                    msg=result,
                )

    def test_chk_neg_4way_equivalence_mode_checks_invariants_case_fields_and_l5_refs(
        self,
    ) -> None:
        baseline = self._equivalence_mode_layers()

        def check(layers: tuple[dict[str, object], ...]) -> dict[str, object]:
            return dvc.check_neg_4way_match(
                REPO_ROOT,
                "L4",
                "L9",
                "L8",
                "L5",
                layers[0],
                layers[1],
                layers[2],
                layers[3],
            )

        result = check(baseline)
        self.assertTrue(
            result["passed"],
            msg=f"the full synthetic class/case/ref fixture is valid: {result}",
        )

        mutations: list[tuple[str, tuple[dict[str, object], ...], str]] = []
        for layer in range(4):
            for field, bad_value in (
                ("expected_axis", "different-axis"),
                ("expected_state", "different-state"),
                ("side_effect_count", 1),
            ):
                mutated = copy.deepcopy(baseline)
                if layer == 0:
                    row = mutated[layer]["failure_classifications"][0]
                elif layer == 3:
                    row = mutated[layer]["failure_rules"][0]
                else:
                    row = mutated[layer]["negative_equivalence_classes"][0]
                row[field] = bad_value
                expected_attribute = (
                    "equivalence_key"
                    if field in ("expected_axis", "expected_state")
                    else field
                )
                mutations.append((f"L{layer + 4}_{field}", mutated, expected_attribute))

        case_mutations = (
            ("case_condition", lambda row: row.__setitem__("condition", "other")),
            ("expected", lambda row: row.__setitem__("expected", "other")),
            (
                "expected_preserved",
                lambda row: row.__setitem__("expected_preserved", {"case": "other"}),
            ),
            (
                "integration_case_ref",
                lambda row: row.__setitem__("integration_case_ref", "NO-SUCH-L9-ID"),
            ),
        )
        for attribute, mutate in case_mutations:
            for case_index, label in ((0, "negative"), (3, "positive")):
                mutated = copy.deepcopy(baseline)
                mutate(mutated[2]["unit_cases"][case_index])
                mutations.append((f"L8_{label}_{attribute}", mutated, attribute))
                mutated = copy.deepcopy(baseline)
                if attribute == "case_condition":
                    mutated[1]["integration_cases"][case_index]["change"] = "other"
                elif attribute == "integration_case_ref":
                    mutated[1]["integration_cases"][case_index]["id"] = "OTHER-ID"
                else:
                    mutate(mutated[1]["integration_cases"][case_index])
                mutations.append((f"L9_{label}_{attribute}", mutated, attribute))

        for layer_index, case_member, label in (
            (2, "unit_cases", "L8"),
            (1, "integration_cases", "L9"),
        ):
            for field in ("expected_axis", "expected_state", "side_effect_count"):
                expected_attribute = field
                for suffix, replacement in (
                    (
                        "different",
                        "different-value" if field != "side_effect_count" else 1,
                    ),
                    ("null", None),
                ):
                    mutated = copy.deepcopy(baseline)
                    mutated[layer_index][case_member][0][field] = replacement
                    mutations.append(
                        (f"{label}_case_{field}_{suffix}", mutated, expected_attribute)
                    )
                if field == "side_effect_count":
                    mutated = copy.deepcopy(baseline)
                    mutated[layer_index][case_member][0][field] = True
                    mutations.append(
                        (f"{label}_case_{field}_boolean", mutated, expected_attribute)
                    )
        bad_rule_ref = copy.deepcopy(baseline)
        bad_rule_ref[2]["unit_cases"][0]["rule_ref"] = "NO-SUCH-RULE"
        mutations.append(("L8_rule_ref", bad_rule_ref, "rule_ref"))

        pointer_rule_ref = copy.deepcopy(baseline)
        pointer_rule_ref[2]["unit_cases"][0]["rule_ref"] = "/failure_rules/0"
        mutations.append(
            ("L8_rule_ref_pointer_form_unsupported", pointer_rule_ref, "rule_ref")
        )

        object_function_ref = copy.deepcopy(baseline)
        object_function_ref[2]["unit_cases"][0]["function_ref"] = {"id": "L5-fn-A"}
        mutations.append(
            (
                "L8_function_ref_object_form_unsupported",
                object_function_ref,
                "function_ref",
            )
        )

        wrong_resolving_rule_ref = copy.deepcopy(baseline)
        wrong_resolving_rule_ref[2]["unit_cases"][0]["rule_ref"] = "L5-RULE-CONFLICT"
        mutations.append(
            (
                "L8_rule_ref_resolves_to_other_class",
                wrong_resolving_rule_ref,
                "rule_ref",
            )
        )

        bad_function_ref = copy.deepcopy(baseline)
        bad_function_ref[2]["unit_cases"][0]["function_ref"] = "NO-SUCH-FUNCTION"
        mutations.append(("L8_function_ref", bad_function_ref, "function_ref"))

        wrong_resolving_function_ref = copy.deepcopy(baseline)
        wrong_resolving_function_ref[2]["unit_cases"][0]["function_ref"] = "L5-fn-D"
        mutations.append(
            (
                "L8_function_ref_resolves_to_other_function",
                wrong_resolving_function_ref,
                "function_ref",
            )
        )

        wrong_valid_case_ref = copy.deepcopy(baseline)
        wrong_valid_case_ref[2]["unit_cases"][0]["integration_case_ref"] = (
            "CASE-UNKNOWN-2"
        )
        mutations.append(
            (
                "L8_integration_case_ref_points_to_other_case",
                wrong_valid_case_ref,
                "integration_case_ref",
            )
        )

        wrong_l4_code = copy.deepcopy(baseline)
        wrong_l4_code[0]["failure_classifications"][0]["code"] = "different-code"
        mutations.append(
            ("L4_code_disagrees_with_classification", wrong_l4_code, "equivalence_key")
        )

        wrong_rule_code = copy.deepcopy(baseline)
        wrong_rule_code[3]["failure_rules"][0]["code"] = "different-code"
        mutations.append(("L5_rule_code", wrong_rule_code, "equivalence_key"))

        rule_function_mismatch = copy.deepcopy(baseline)
        rule_function_mismatch[3]["failure_rules"][0]["function_ref"] = "L5-fn-B"
        self.assertNotEqual(
            rule_function_mismatch[3]["failure_rules"][0]["function_ref"],
            baseline[3]["failure_rules"][0]["function_ref"],
            "the mutation must change the source field before exercising the checker",
        )
        mutations.append(
            ("L5_rule_function_ref", rule_function_mismatch, "function_ref")
        )

        for name, mutated, expected_attribute in mutations:
            with self.subTest(mutation=name):
                result = check(mutated)
                self.assertFalse(result["passed"], msg=result)
                self.assertEqual(result["status"], "evaluated", msg=result)
                self.assertTrue(
                    any(
                        failure.get("attribute") == expected_attribute
                        for failure in result["failures"]
                    ),
                    msg=(
                        f"{name} must fail on {expected_attribute}, not an unrelated "
                        f"population result: {result}"
                    ),
                )

    def test_chk_neg_4way_equivalence_mode_allows_repeated_l4_l8_l9_class_rows(
        self,
    ) -> None:
        layers = self._equivalence_mode_layers()
        duplicate_l4 = copy.deepcopy(layers[0]["failure_classifications"][0])
        duplicate_l4["id"] = "L4-C-UNKNOWN-DUP"
        duplicate_l4["class_id"] = "L4-C-UNKNOWN-DUP"
        layers[0]["failure_classifications"].append(duplicate_l4)
        layers[0]["contracts"][0]["negative_class_refs"].append(
            duplicate_l4["class_id"]
        )

        duplicate_l8 = copy.deepcopy(layers[2]["negative_equivalence_classes"][0])
        duplicate_l8["class_id"] = "L8-CLASS-UNKNOWN-DUP"
        layers[2]["negative_equivalence_classes"].append(duplicate_l8)
        duplicate_l9 = copy.deepcopy(layers[1]["negative_equivalence_classes"][1])
        duplicate_l9["class_id"] = "L9-CLASS-UNKNOWN-DUP"
        layers[1]["negative_equivalence_classes"].append(duplicate_l9)

        duplicate_l8_case = copy.deepcopy(layers[2]["unit_cases"][0])
        duplicate_l8_case.update(
            {
                "case_id": "CASE-UNKNOWN-DUP",
                "negative_class_ref": "L8-CLASS-UNKNOWN-DUP",
                "integration_case_ref": "CASE-UNKNOWN-DUP",
                "expected": "expected:CASE-UNKNOWN-DUP",
                "expected_preserved": {"case": "CASE-UNKNOWN-DUP"},
            }
        )
        layers[2]["unit_cases"].append(duplicate_l8_case)
        duplicate_l9_case = copy.deepcopy(layers[1]["integration_cases"][1])
        duplicate_l9_case.update(
            {
                "id": "CASE-UNKNOWN-DUP",
                "negative_class_ref": "L9-CLASS-UNKNOWN-DUP",
                "expected": "expected:CASE-UNKNOWN-DUP",
                "expected_preserved": {"case": "CASE-UNKNOWN-DUP"},
            }
        )
        layers[1]["integration_cases"].append(duplicate_l9_case)

        result = dvc.check_neg_4way_match(
            REPO_ROOT,
            "L4",
            "L9",
            "L8",
            "L5",
            layers[0],
            layers[1],
            layers[2],
            layers[3],
        )
        self.assertTrue(result["passed"], msg=result)
        self.assertEqual(result["counts"], {"L4": 3, "L9": 3, "L8": 3, "L5": 3})
        self.assertEqual(
            result["class_row_counts"], {"L4": 4, "L9": 4, "L8": 4, "L5": 3}
        )

        duplicate_l4["expected_axis"] = "inconsistent-duplicate"
        mismatch = dvc.check_neg_4way_match(
            REPO_ROOT,
            "L4",
            "L9",
            "L8",
            "L5",
            layers[0],
            layers[1],
            layers[2],
            layers[3],
        )
        self.assertFalse(mismatch["passed"], msg=mismatch)
        self.assertTrue(
            any(
                failure.get("attribute") in ("expected_axis", "equivalence_key")
                for failure in mismatch["failures"]
            ),
            msg=mismatch,
        )

    def test_chk_neg_4way_equivalence_mode_rejects_duplicate_l5_owner_key(self) -> None:
        layers = self._equivalence_mode_layers()
        duplicate_rule = copy.deepcopy(layers[3]["failure_rules"][1])
        duplicate_rule["id"] = "L5-RULE-UNKNOWN-DUP"
        duplicate_rule["class_id"] = "L5-RULE-UNKNOWN-DUP"
        layers[3]["failure_rules"].append(duplicate_rule)

        result = dvc.check_neg_4way_match(
            REPO_ROOT,
            "L4",
            "L9",
            "L8",
            "L5",
            layers[0],
            layers[1],
            layers[2],
            layers[3],
        )
        self.assertFalse(result["passed"], msg=result)
        self.assertTrue(
            any(
                failure.get("layer") == "L5"
                and failure.get("reason") == "multiple_l5_rules_share_equivalence_key"
                for failure in result["failures"]
            ),
            msg=result,
        )

    def test_chk_neg_4way_explicit_equivalence_mode_fails_closed_on_bad_membership(
        self,
    ) -> None:
        baseline = self._equivalence_mode_layers()
        mutations: dict[str, tuple[tuple[dict[str, object], ...], str]] = {}

        positive_has_ref = copy.deepcopy(baseline)
        positive_has_ref[2]["unit_cases"][3]["negative_class_ref"] = "L8-CLASS-1"
        mutations["positive_has_class_ref"] = (positive_has_ref, "negative_class_ref")

        negative_lacks_ref = copy.deepcopy(baseline)
        negative_lacks_ref[2]["unit_cases"][0].pop("negative_class_ref")
        mutations["negative_lacks_class_ref"] = (
            negative_lacks_ref,
            "negative_class_ref",
        )

        unknown_state = copy.deepcopy(baseline)
        unknown_state[1]["integration_cases"][0]["population_state"] = "unknown"
        mutations["unknown_case_state"] = (unknown_state, "population_state")

        missing_state = copy.deepcopy(baseline)
        missing_state[2]["unit_cases"][0].pop("population_state")
        mutations["missing_case_state"] = (missing_state, "population_state")

        missing_l9_case = copy.deepcopy(baseline)
        missing_l9_case[1]["integration_cases"].pop(0)
        mutations["case_missing_from_l9"] = (missing_l9_case, "integration_case_ref")

        missing_l8_case = copy.deepcopy(baseline)
        missing_l8_case[2]["unit_cases"].pop(0)
        missing_l8_case[2]["case_count"] -= 1
        mutations["case_missing_from_l8"] = (missing_l8_case, "integration_case_ref")

        l9_negative_lacks_ref = copy.deepcopy(baseline)
        l9_negative_lacks_ref[1]["integration_cases"][0].pop("negative_class_ref")
        mutations["l9_negative_lacks_class_ref"] = (
            l9_negative_lacks_ref,
            "negative_class_ref",
        )

        bad_class_ref = copy.deepcopy(baseline)
        bad_class_ref[2]["unit_cases"][0]["negative_class_ref"] = "NO-SUCH-CLASS"
        mutations["case_ref_does_not_resolve_locally"] = (
            bad_class_ref,
            "negative_class_ref",
        )

        partial_mode_marker = copy.deepcopy(baseline)
        partial_mode_marker[2].pop("negative_equivalence_classes")
        mutations["partial_explicit_mode_marker"] = (
            partial_mode_marker,
            "explicit_mode",
        )

        empty_class_with_negative_case = copy.deepcopy(baseline)
        empty_class_with_negative_case[1]["negative_equivalence_classes"] = []
        mutations["empty_class_table_with_negative_cases"] = (
            empty_class_with_negative_case,
            "equivalence_class",
        )

        class_missing_from_l4 = copy.deepcopy(baseline)
        class_missing_from_l4[0]["failure_classifications"].pop(0)
        mutations["class_missing_from_l4"] = (
            class_missing_from_l4,
            "equivalence_class",
        )

        class_missing_from_l5 = copy.deepcopy(baseline)
        class_missing_from_l5[3]["failure_rules"].pop(0)
        mutations["class_missing_from_l5"] = (
            class_missing_from_l5,
            "equivalence_class",
        )

        wrong_type_marker = copy.deepcopy(baseline)
        wrong_type_marker[0]["negative_equivalence_classes"] = "not-a-source-map"
        mutations["class_marker_wrong_type"] = (wrong_type_marker, "explicit_mode")

        wrong_type_l8_marker = copy.deepcopy(baseline)
        wrong_type_l8_marker[2]["negative_equivalence_classes"] = {"not": "an array"}
        mutations["l8_class_marker_wrong_type"] = (
            wrong_type_l8_marker,
            "equivalence_class",
        )

        wrong_type_l5_marker = copy.deepcopy(baseline)
        wrong_type_l5_marker[3]["negative_equivalence_classes"] = None
        mutations["l5_class_marker_wrong_type"] = (
            wrong_type_l5_marker,
            "explicit_mode",
        )

        wrong_type_l9_marker = copy.deepcopy(baseline)
        wrong_type_l9_marker[1]["negative_equivalence_classes"] = "not-an-array"
        mutations["l9_class_marker_wrong_type"] = (
            wrong_type_l9_marker,
            "equivalence_class",
        )

        class_key_mismatch = copy.deepcopy(baseline)
        class_key_mismatch[2]["negative_equivalence_classes"][0]["expected"][
            "finding_codes"
        ] = ["field_unknown", "field_extra"]
        mutations["key_finding_codes_differ"] = (class_key_mismatch, "equivalence_key")

        missing_finding_codes = copy.deepcopy(baseline)
        missing_finding_codes[0]["failure_classifications"][0]["expected"].pop(
            "finding_codes"
        )
        mutations["finding_codes_missing"] = (missing_finding_codes, "equivalence_key")

        null_finding_codes = copy.deepcopy(baseline)
        null_finding_codes[3]["failure_rules"][0]["expected"]["finding_codes"] = None
        mutations["finding_codes_null"] = (null_finding_codes, "equivalence_key")

        wrong_type_finding_codes = copy.deepcopy(baseline)
        wrong_type_finding_codes[2]["negative_equivalence_classes"][0]["expected"][
            "finding_codes"
        ] = "field_unknown"
        mutations["finding_codes_wrong_type"] = (
            wrong_type_finding_codes,
            "equivalence_key",
        )

        l8_case_condition_mismatch = copy.deepcopy(baseline)
        l8_case_condition_mismatch[2]["unit_cases"][0]["expected_property"][
            "condition"
        ] = "different_case_condition"
        mutations["l8_case_condition_disagrees_with_class"] = (
            l8_case_condition_mismatch,
            "equivalence_key",
        )

        l8_case_codes_mismatch = copy.deepcopy(baseline)
        l8_case_codes_mismatch[2]["unit_cases"][0]["expected_property"][
            "finding_codes"
        ] = ["field_unknown", "unexpected_code"]
        mutations["l8_case_codes_disagree_with_class"] = (
            l8_case_codes_mismatch,
            "equivalence_key",
        )

        classification_mismatch = copy.deepcopy(baseline)
        classification_mismatch[2]["negative_equivalence_classes"][0][
            "expected_classification"
        ] = "different_classification"
        mutations["key_classification_differs"] = (
            classification_mismatch,
            "equivalence_key",
        )

        owner_mismatch = copy.deepcopy(baseline)
        owner_mismatch[3]["failure_rules"][1]["backflow_owner"] = "different-owner"
        mutations["key_owner_differs"] = (owner_mismatch, "equivalence_key")

        l8_explicit_owner_mismatch = copy.deepcopy(baseline)
        l8_explicit_owner_mismatch[2]["negative_equivalence_classes"][0][
            "backflow_owner"
        ] = "not-owner-x"
        mutations["l8_explicit_owner_disagrees_with_l9"] = (
            l8_explicit_owner_mismatch,
            "equivalence_key",
        )

        code_order_mismatch = copy.deepcopy(baseline)
        code_order_mismatch[1]["negative_equivalence_classes"][0]["expected"][
            "finding_codes"
        ] = ["field_conflict_detail", "field_conflict"]
        mutations["finding_code_order_differs"] = (
            code_order_mismatch,
            "equivalence_key",
        )

        owner_unresolved = copy.deepcopy(baseline)
        owner_unresolved[1]["integration_cases"][0]["compact_whole_observation"][
            "ordered_findings"
        ][0].pop("return_owner")
        mutations["l9_owner_unresolved"] = (owner_unresolved, "owner_unresolved")

        owner_missing = copy.deepcopy(baseline)
        owner_missing[1]["integration_cases"][0]["compact_whole_observation"][
            "ordered_findings"
        ] = []
        mutations["l9_owner_has_zero_findings"] = (owner_missing, "owner_unresolved")

        owner_ambiguous = copy.deepcopy(baseline)
        owner_ambiguous[1]["integration_cases"][2]["compact_whole_observation"][
            "ordered_findings"
        ][1]["return_owner"] = "another-owner"
        mutations["l9_owner_ambiguous"] = (owner_ambiguous, "owner_unresolved")

        l9_finding_code_mismatch = copy.deepcopy(baseline)
        l9_finding_code_mismatch[1]["integration_cases"][0][
            "compact_whole_observation"
        ]["ordered_findings"][0]["code"] = "different_finding_code"
        mutations["l9_finding_code_disagrees_with_class"] = (
            l9_finding_code_mismatch,
            "equivalence_key",
        )

        l9_finding_owner_mismatch = copy.deepcopy(baseline)
        l9_finding_owner_mismatch[1]["integration_cases"][0][
            "compact_whole_observation"
        ]["ordered_findings"][0]["return_owner"] = "different-owner"
        mutations["l9_finding_owner_disagrees_with_class"] = (
            l9_finding_owner_mismatch,
            "equivalence_key",
        )

        population_state_mismatch = copy.deepcopy(baseline)
        population_state_mismatch[1]["integration_cases"][3]["population_state"] = (
            "negative"
        )
        population_state_mismatch[1]["integration_cases"][3]["negative_class_ref"] = (
            "L9-CLASS-A"
        )
        mutations["same_case_state_differs_across_l8_l9"] = (
            population_state_mismatch,
            "population_state",
        )

        l9_positive_has_ref = copy.deepcopy(baseline)
        l9_positive_has_ref[1]["integration_cases"][3]["negative_class_ref"] = (
            "L9-CLASS-A"
        )
        mutations["l9_positive_has_class_ref"] = (
            l9_positive_has_ref,
            "negative_class_ref",
        )

        duplicate_case = copy.deepcopy(baseline)
        duplicate_case[2]["unit_cases"][1]["case_id"] = "CASE-UNKNOWN-1"
        mutations["duplicate_case_id"] = (duplicate_case, "case_identity")

        duplicate_class = copy.deepcopy(baseline)
        duplicate_class[2]["negative_equivalence_classes"][1]["class_id"] = (
            duplicate_class[2]["negative_equivalence_classes"][0]["class_id"]
        )
        mutations["duplicate_class_id_within_layer"] = (
            duplicate_class,
            "equivalence_class",
        )

        finding_code_multiplicity_mismatch = copy.deepcopy(baseline)
        finding_code_multiplicity_mismatch[1]["negative_equivalence_classes"][0][
            "expected"
        ]["finding_codes"] = [
            "field_conflict",
            "field_conflict",
            "field_conflict_detail",
        ]
        mutations["finding_code_multiplicity_differs"] = (
            finding_code_multiplicity_mismatch,
            "equivalence_key",
        )

        # A case omitted from both L8 and L9 together with its class is not
        # claimed detectable because no independent roster exists.
        for name, (mutated, expected_attribute) in mutations.items():
            with self.subTest(mutation=name):
                result = dvc.check_neg_4way_match(
                    REPO_ROOT,
                    "L4",
                    "L9",
                    "L8",
                    "L5",
                    mutated[0],
                    mutated[1],
                    mutated[2],
                    mutated[3],
                )
                self.assertFalse(result["passed"], msg=result)
                self.assertEqual(result["status"], "evaluated", msg=result)
                self.assertTrue(
                    any(
                        failure.get("attribute") == expected_attribute
                        for failure in result["failures"]
                    ),
                    msg=(
                        f"{name} must be rejected by {expected_attribute}, "
                        f"not by an unrelated empty/not-evaluated result: {result}"
                    ),
                )

    def test_chk_neg_4way_explicit_equivalence_mode_ignores_class_and_case_order(
        self,
    ) -> None:
        layers = self._equivalence_mode_layers()
        layers[0]["failure_classifications"].reverse()
        layers[1]["negative_equivalence_classes"].reverse()
        layers[1]["integration_cases"].reverse()
        layers[2]["negative_equivalence_classes"].reverse()
        layers[2]["unit_cases"].reverse()
        layers[3]["failure_rules"].reverse()
        result = dvc.check_neg_4way_match(
            REPO_ROOT,
            "L4",
            "L9",
            "L8",
            "L5",
            layers[0],
            layers[1],
            layers[2],
            layers[3],
        )
        self.assertTrue(
            result["passed"],
            msg=f"class/case order is not part of the equivalence key: {result}",
        )

    def test_chk_neg_4way_explicit_mode_separates_same_three_fields_by_axis(
        self,
    ) -> None:
        layers = self._equivalence_mode_layers()
        l4, l9, l8, l5 = layers
        identity = "CASE-UNKNOWN-DIFFERENT-AXIS"
        axis = "/fixture/other-axis"

        l4_row = self._equivalence_class(
            "L4-C-UNKNOWN-DIFFERENT-AXIS",
            classification="fixture_unknown",
            finding_codes=["field_unknown"],
            owner="owner-x",
            axis=axis,
            state="unresolved",
        )
        l4_row.update({"id": l4_row["class_id"], "code": "fixture_unknown"})
        l4_row["design_ref"] = "L4-contract-A"
        l4["failure_classifications"].append(l4_row)
        l4["contracts"][0]["negative_class_refs"].append(l4_row["class_id"])

        l5_row = self._equivalence_class(
            "L5-RULE-UNKNOWN-DIFFERENT-AXIS",
            classification="fixture_unknown",
            finding_codes=["field_unknown"],
            owner="owner-x",
            axis=axis,
            state="unresolved",
        )
        l5_row.update(
            {
                "id": l5_row["class_id"],
                "code": "fixture_unknown",
                "function_ref": "L5-fn-A",
            }
        )
        l5["failure_rules"].append(l5_row)

        l8_class = self._equivalence_class(
            "L8-CLASS-UNKNOWN-DIFFERENT-AXIS",
            classification="fixture_unknown",
            finding_codes=["field_unknown"],
            owner="owner-x",
            axis=axis,
            state="unresolved",
        )
        l8_class.pop("backflow_owner")
        l8["negative_equivalence_classes"].append(l8_class)

        l9_class = self._equivalence_class(
            "L9-CLASS-UNKNOWN-DIFFERENT-AXIS",
            classification="fixture_unknown",
            finding_codes=["field_unknown"],
            owner="owner-x",
            axis=axis,
            state="unresolved",
        )
        l9["negative_equivalence_classes"].append(l9_class)

        l8["unit_cases"].append(
            {
                "case_id": identity,
                "population_state": "negative",
                "negative_class_ref": l8_class["class_id"],
                "expected_property": {
                    "condition": "fixture_unknown",
                    "finding_codes": ["field_unknown"],
                },
                "rule_ref": l5_row["id"],
                "function_ref": "L5-fn-A",
                "integration_case_ref": identity,
                "condition": "fixture_unknown",
                "expected": f"expected:{identity}",
                "expected_preserved": {"case": identity},
                "expected_axis": axis,
                "expected_state": "unresolved",
                "side_effect_count": 0,
            }
        )
        l9["integration_cases"].append(
            {
                "id": identity,
                "population_state": "negative",
                "negative_class_ref": l9_class["class_id"],
                "compact_whole_observation": {
                    "condition": "fixture_unknown",
                    "ordered_findings": [
                        {"code": "field_unknown", "return_owner": "owner-x"}
                    ],
                },
                "change": "fixture_unknown",
                "expected": f"expected:{identity}",
                "expected_preserved": {"case": identity},
                "expected_axis": axis,
                "expected_state": "unresolved",
                "side_effect_count": 0,
            }
        )

        result = dvc.check_neg_4way_match(
            REPO_ROOT,
            "L4",
            "L9",
            "L8",
            "L5",
            layers[0],
            layers[1],
            layers[2],
            layers[3],
        )
        self.assertTrue(result["passed"], msg=result)
        self.assertEqual(result["counts"], {"L4": 4, "L9": 4, "L8": 4, "L5": 4})

    def test_chk_neg_4way_explicit_mode_rejects_cross_layer_case_class_key_swap(
        self,
    ) -> None:
        layers = self._equivalence_mode_layers()
        alt_l4 = self._equivalence_class(
            "L4-C-UNKNOWN-ALT",
            classification="fixture_unknown",
            finding_codes=["field_unknown_alt"],
            owner="owner-x",
            axis="identity",
            state="unresolved",
        )
        alt_l4["id"] = alt_l4["class_id"]
        alt_l4["code"] = alt_l4["expected_classification"]
        layers[0]["failure_classifications"].append(alt_l4)

        alt_l5 = self._equivalence_class(
            "L5-RULE-UNKNOWN-ALT",
            classification="fixture_unknown",
            finding_codes=["field_unknown_alt"],
            owner="owner-x",
            axis="identity",
            state="unresolved",
        )
        alt_l5.update(
            {
                "id": alt_l5["class_id"],
                "code": alt_l5["expected_classification"],
                "function_ref": "L5-fn-B",
            }
        )
        layers[3]["failure_rules"].append(alt_l5)

        alt_l8 = self._equivalence_class(
            "L8-CLASS-ALT",
            classification="fixture_unknown",
            finding_codes=["field_unknown_alt"],
            owner="owner-x",
            axis="identity",
            state="unresolved",
        )
        alt_l8.pop("backflow_owner")
        layers[2]["negative_equivalence_classes"].append(alt_l8)

        alt_l9 = self._equivalence_class(
            "L9-CLASS-ALT",
            classification="fixture_unknown",
            finding_codes=["field_unknown_alt"],
            owner="owner-x",
            axis="identity",
            state="unresolved",
        )
        layers[1]["negative_equivalence_classes"].append(alt_l9)

        # Each side independently agrees with its own class. The paired L8/L9
        # case must still reject their different full class keys.
        layers[2]["unit_cases"][0]["negative_class_ref"] = "L8-CLASS-ALT"
        layers[2]["unit_cases"][0]["expected_property"]["finding_codes"] = [
            "field_unknown_alt"
        ]
        # Keep the rule reference consistent with the L9 side; only the L8
        # case/class key is swapped, isolating the paired-key comparison.
        layers[2]["unit_cases"][0]["rule_ref"] = "L5-RULE-UNKNOWN"
        layers[2]["unit_cases"][0]["function_ref"] = "L5-fn-A"

        result = dvc.check_neg_4way_match(
            REPO_ROOT,
            "L4",
            "L9",
            "L8",
            "L5",
            layers[0],
            layers[1],
            layers[2],
            layers[3],
        )
        self.assertFalse(result["passed"], msg=result)
        self.assertTrue(
            any(
                failure.get("attribute") == "equivalence_key"
                and failure.get("case_id") == "CASE-UNKNOWN-1"
                for failure in result["failures"]
            ),
            msg=f"paired case with different L8/L9 class keys must fail: {result}",
        )

    def test_chk_neg_4way_explicit_equivalence_mode_accepts_consistent_l8_owner(
        self,
    ) -> None:
        layers = self._equivalence_mode_layers()
        owners = {
            "L8-CLASS-1": "owner-x",
            "L8-CLASS-2": "owner-y",
            "L8-CLASS-3": "owner-z",
        }
        for class_row in layers[2]["negative_equivalence_classes"]:
            class_row["backflow_owner"] = owners[class_row["class_id"]]
        result = dvc.check_neg_4way_match(
            REPO_ROOT,
            "L4",
            "L9",
            "L8",
            "L5",
            layers[0],
            layers[1],
            layers[2],
            layers[3],
        )
        self.assertTrue(
            result["passed"],
            msg=f"an explicit L8 owner agreeing with its L9 findings is valid: {result}",
        )

    def test_chk_neg_4way_explicit_equivalence_mode_zero_population_not_evaluated(
        self,
    ) -> None:
        positive_only = self._equivalence_mode_layers()
        for layer_index in (0, 3):
            data = positive_only[layer_index]
            data["negative_equivalence_classes"] = {
                "source_rows": (
                    "failure_classifications" if layer_index == 0 else "failure_rules"
                )
            }
            data[
                "failure_classifications" if layer_index == 0 else "failure_rules"
            ] = []
        positive_only[0]["contracts"][0]["negative_class_refs"] = []
        positive_only[1]["negative_equivalence_classes"] = []
        positive_only[2]["negative_equivalence_classes"] = []
        positive_only[2]["unit_cases"] = [positive_only[2]["unit_cases"][3]]
        positive_only[2]["case_count"] = 1
        positive_only[1]["integration_cases"] = [
            positive_only[1]["integration_cases"][3]
        ]

        empty_population = copy.deepcopy(positive_only)
        empty_population[2]["unit_cases"] = []
        empty_population[2]["case_count"] = 0
        empty_population[1]["integration_cases"] = []

        for label, layers in (
            ("positive_only", positive_only),
            ("empty_case_populations", empty_population),
        ):
            with self.subTest(population=label):
                result = dvc.check_neg_4way_match(
                    REPO_ROOT,
                    "L4",
                    "L9",
                    "L8",
                    "L5",
                    layers[0],
                    layers[1],
                    layers[2],
                    layers[3],
                )
                self.assertFalse(result["passed"], msg=result)
                self.assertEqual(result["status"], "not_evaluated", msg=result)
                self.assertEqual(
                    result["not_evaluated_reason"],
                    "zero_negative_equivalence_classes",
                )

    def test_chk_neg_4way_explicit_mode_preserves_legacy_casewise_mode(self) -> None:
        legacy = self._repeated_code_layers(
            {layer: ["A", "B"] for layer in ("L4", "L9", "L8", "L5")}
        )
        result = dvc.check_neg_4way_match(REPO_ROOT, "L4", "L9", "L8", "L5", *legacy)
        self.assertTrue(result["passed"], msg=result["failures"])
        self.assertEqual(result["matched_case_count"], 2)
        self.assertEqual(result["comparison_mode"], "legacy_casewise_four_layer")
        self.assertEqual(result["count_unit"], "negative_case_rows_per_layer")

    def test_chk_neg_4way_repeated_code_matches_each_explicit_case(self) -> None:
        layers = self._repeated_code_layers(
            {layer: ["A", "B"] for layer in ("L4", "L9", "L8", "L5")}
        )
        baseline = dvc.check_neg_4way_match(REPO_ROOT, "L4", "L9", "L8", "L5", *layers)

        mutated = copy.deepcopy(layers)
        mutated[2]["cases"][0]["negative_cases"][0]["expected"] = (
            "mutated expectation for case A"
        )
        result = dvc.check_neg_4way_match(REPO_ROOT, "L4", "L9", "L8", "L5", *mutated)
        with self.subTest(observation="baseline"):
            self.assertTrue(baseline["passed"], msg=baseline["failures"])
            self.assertEqual(baseline["matched_case_count"], 2)
        with self.subTest(observation="changed_first_case"):
            self.assertFalse(
                result["passed"], msg="a changed first case must be detected"
            )
            self.assertTrue(result["failures"])

        fallback_layers = copy.deepcopy(layers)
        for row in fallback_layers[2]["cases"][0]["negative_cases"]:
            row.pop("rule_ref", None)
        fallback_baseline = dvc.check_neg_4way_match(
            REPO_ROOT, "L4", "L9", "L8", "L5", *fallback_layers
        )
        fallback_mutation = copy.deepcopy(fallback_layers)
        fallback_mutation[2]["cases"][0]["negative_cases"][0]["expected"] = (
            "mutated fallback expectation for case A"
        )
        fallback_result = dvc.check_neg_4way_match(
            REPO_ROOT, "L4", "L9", "L8", "L5", *fallback_mutation
        )
        with self.subTest(observation="identity_fallback"):
            self.assertTrue(
                fallback_baseline["passed"], msg=fallback_baseline["failures"]
            )
            self.assertEqual(fallback_baseline["matched_case_count"], 2)
            self.assertFalse(
                fallback_result["passed"],
                msg="identity fallback must retain each repeated-code case",
            )

    def test_chk_neg_4way_repeated_code_requires_unambiguous_case_identity(
        self,
    ) -> None:
        layers = self._repeated_code_layers(
            {layer: ["A", "B"] for layer in ("L4", "L9", "L8", "L5")}
        )
        for identity_mode in ("missing", "duplicate"):
            with self.subTest(identity_mode=identity_mode):
                ambiguous = copy.deepcopy(layers)
                for layer in ambiguous:
                    rows = self._negative_rows(layer)
                    for row in rows:
                        if identity_mode == "missing":
                            row.pop("integration_case_ref", None)
                        else:
                            row["integration_case_ref"] = "CASE-DUPLICATE"
                result = dvc.check_neg_4way_match(
                    REPO_ROOT, "L4", "L9", "L8", "L5", *ambiguous
                )
                self.assertFalse(
                    result["passed"],
                    msg=f"repeated code with {identity_mode} identity must fail closed",
                )
                self.assertTrue(result["failures"])
                if identity_mode == "missing":
                    missing_identity_layers = {
                        failure.get("layer")
                        for failure in result["failures"]
                        if failure.get("attribute") == "case_identity"
                        and failure.get("reason") == "missing_or_invalid"
                    }
                    self.assertEqual(missing_identity_layers, {"L4", "L9", "L8", "L5"})

        ambiguous_l5 = copy.deepcopy(layers)
        extra_rule = copy.deepcopy(ambiguous_l5[3]["failure_rules"][0])
        extra_rule["id"] = "L5-R-A-duplicate-identity"
        ambiguous_l5[3]["failure_rules"].append(extra_rule)
        selected_ref_result = dvc.check_neg_4way_match(
            REPO_ROOT, "L4", "L9", "L8", "L5", *ambiguous_l5
        )
        self.assertFalse(
            selected_ref_result["passed"],
            msg="an unselected duplicate L5 identity must fail closed",
        )

        # The existing single-code contract remains valid without an explicit identity.
        unique = copy.deepcopy(layers)
        for layer in unique:
            rows = self._negative_rows(layer)
            for row in rows[1:]:
                row["code"] = "other"
            for row in rows:
                row.pop("integration_case_ref", None)
        # Select only the first row in each layer to exercise the established unique-code case.
        unique[0]["contracts"][0]["negative_classifications"] = unique[0]["contracts"][
            0
        ]["negative_classifications"][:1]
        unique[1]["cases"][0]["negative_cases"] = unique[1]["cases"][0][
            "negative_cases"
        ][:1]
        unique[2]["cases"][0]["negative_cases"] = unique[2]["cases"][0][
            "negative_cases"
        ][:1]
        unique[3]["failure_rules"] = unique[3]["failure_rules"][:1]
        control = dvc.check_neg_4way_match(REPO_ROOT, "L4", "L9", "L8", "L5", *unique)
        self.assertTrue(control["passed"], msg=control["failures"])
        self.assertEqual(control["matched_case_count"], 1)

    def test_chk_neg_4way_repeated_code_uses_identity_across_layer_order(self) -> None:
        layers = self._repeated_code_layers(
            {
                "L4": ["A", "B"],
                "L9": ["B", "A"],
                "L8": ["A", "B"],
                "L5": ["B", "A"],
            }
        )
        l9_case_b = layers[1]["cases"][0]["negative_cases"][0]
        l9_case_b["basic_case_ref"] = l9_case_b.pop("integration_case_ref")
        result = dvc.check_neg_4way_match(REPO_ROOT, "L4", "L9", "L8", "L5", *layers)
        self.assertTrue(result["passed"], msg=result["failures"])
        self.assertEqual(result["matched_case_count"], 2)

    def test_derivation_map_and_legacy_basis_recorded(self) -> None:
        for check_id in (
            "CHK-PIN-SHA256",
            "CHK-JSON-POINTER",
            "CHK-PAIR-BIDIR-ID",
            "CHK-NEG-4WAY-MATCH",
            "CHK-PUBLIC-FN-FREEZE",
            "CHK-L3-OBLIGATION-MAP",
            "CHK-OWNERSHIP-CAP-L8L9",
            "CHK-OWNERSHIP-CAP-L3L6",
            "TICKET-CI-PROFILE-DEFERRAL",
        ):
            self.assertIn(check_id, dvc.DERIVATION_MAP)
            entry = dvc.DERIVATION_MAP[check_id]
            self.assertTrue(len(entry["l3_pointers"]) >= 1)
            self.assertTrue(len(entry["l10_pointers"]) >= 1)
            self.assertTrue(len(entry["decision_records"]) >= 1)
        self.assertEqual(len(dvc.LEGACY_BASIS), 5)

    def test_chk_pin_sha256_pass_and_mutation_fail(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            target = root / "docs" / "sample.json"
            target.parent.mkdir(parents=True)
            obj = {"b": 1, "a": [2, 3]}
            raw = (json.dumps(obj, indent=2) + "\n").encode("utf-8")
            target.write_bytes(raw)
            raw_sha = hashlib.sha256(raw).hexdigest()
            canon_sha = dvc._canonical_json_sha256(obj)

            rec = {
                "path_aliases": {"S": "docs/sample.json"},
                "pins": {"S_sha256": raw_sha},
                "source_pins": {
                    "S": {
                        "path": "docs/sample.json",
                        "sha256": raw_sha,
                        "canonical_json_sha256": canon_sha,
                    }
                },
            }
            res_pass = dvc.check_pin_sha256(root, "freeze.json", rec)
            self.assertTrue(res_pass["passed"])
            self.assertEqual(res_pass["checked_count"], 3)
            self.assertEqual(res_pass["failures"], [])

            # Mutation 1: corrupt raw SHA-256
            mut1 = copy.deepcopy(rec)
            mut1["pins"]["S_sha256"] = "0" * 64
            res_fail1 = dvc.check_pin_sha256(root, "freeze.json", mut1)
            self.assertFalse(res_fail1["passed"])
            self.assertEqual(len(res_fail1["failures"]), 1)
            self.assertEqual(res_fail1["failures"][0]["check"], "CHK-PIN-SHA256")
            self.assertEqual(res_fail1["failures"][0]["pointer"], "/pins/S_sha256")
            self.assertEqual(res_fail1["failures"][0]["actual_sha256"], raw_sha)

            # Mutation 2: corrupt canonical_json_sha256
            mut2 = copy.deepcopy(rec)
            mut2["source_pins"]["S"]["canonical_json_sha256"] = "f" * 64
            res_fail2 = dvc.check_pin_sha256(root, "freeze.json", mut2)
            self.assertFalse(res_fail2["passed"])
            self.assertEqual(
                res_fail2["failures"][0]["pointer"],
                "/source_pins/S/canonical_json_sha256",
            )

    def test_chk_json_pointer_pass_and_mutation_fail(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            tfile = root / "docs" / "target.json"
            tfile.parent.mkdir(parents=True)
            tfile.write_text(
                json.dumps(
                    {
                        "items": [{"id": "A"}, {"id": "B"}, {"id": "C"}],
                        "nested": {"key": "val"},
                    }
                ),
                encoding="utf-8",
            )
            doc = {
                "path_aliases": {"T": "docs/target.json"},
                "local_Section": {"x": 42},
                "refs": [
                    "#/local_Section/x",
                    "T#/items/0..2/id",
                    "T#/items/*/id",
                    {"path": "T", "pointer": "/nested/key"},
                ],
            }
            res_pass = dvc.check_json_pointer(
                root, "docs/source.json", doc, removed_paths={"docs/removed.json"}
            )
            self.assertTrue(res_pass["passed"])
            self.assertEqual(res_pass["checked_count"], 4)
            self.assertEqual(res_pass["expanded_target_count"], 6)

            # Mutation 1: out-of-range index in 0..N
            mut1 = copy.deepcopy(doc)
            mut1["refs"][1] = "T#/items/0..3/id"
            res_fail1 = dvc.check_json_pointer(
                root, "docs/source.json", mut1, removed_paths={"docs/removed.json"}
            )
            self.assertFalse(res_fail1["passed"])
            self.assertEqual(res_fail1["failures"][0]["check"], "CHK-JSON-POINTER")
            self.assertEqual(res_fail1["failures"][0]["target_pointer"], "/items/3/id")
            self.assertEqual(
                res_fail1["failures"][0]["error"],
                "unresolved_pointer_or_unpinned_removed_file",
            )

            # Mutation 2: unpinned reference to removed sidecar file
            mut2 = copy.deepcopy(doc)
            mut2["refs"].append({"path": "docs/removed.json", "pointer": "/items/0"})
            res_fail2 = dvc.check_json_pointer(
                root, "docs/source.json", mut2, removed_paths={"docs/removed.json"}
            )
            self.assertFalse(res_fail2["passed"])
            self.assertTrue(
                any(
                    f["target_file"] == "docs/removed.json"
                    for f in res_fail2["failures"]
                )
            )

    def test_chk_json_pointer_large_real_ranges_resolve(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            f945 = root / "docs" / "range_945.json"
            f583 = root / "docs" / "range_583.json"
            f945.parent.mkdir(parents=True, exist_ok=True)
            f945.write_text(
                json.dumps({"case_bindings": [{"id": f"CB-{i}"} for i in range(945)]}),
                encoding="utf-8",
            )
            f583.write_text(
                json.dumps(
                    {"cases": [{"calls": [{"fn": f"FN-{i}"}]} for i in range(583)]}
                ),
                encoding="utf-8",
            )
            doc = {
                "path_aliases": {
                    "R945": "docs/range_945.json",
                    "R583": "docs/range_583.json",
                },
                "refs": [
                    "R945#/case_bindings/0..944",
                    "R583#/cases/0..582/calls/0",
                ],
            }

            result = dvc.check_json_pointer(root, "freeze.json", doc)

            self.assertTrue(result["passed"], msg=result["failures"][:3])
            self.assertEqual(result["checked_count"], 2)
            self.assertEqual(result["expanded_target_count"], 945 + 583)

    def test_chk_json_pointer_large_range_still_rejects_missing_end(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            f945 = root / "docs" / "range_945.json"
            f945.parent.mkdir(parents=True, exist_ok=True)
            f945.write_text(
                json.dumps({"case_bindings": [{"id": f"CB-{i}"} for i in range(945)]}),
                encoding="utf-8",
            )
            doc = {
                "path_aliases": {"R945": "docs/range_945.json"},
                "refs": ["R945#/case_bindings/0..945"],
            }

            result = dvc.check_json_pointer(root, "freeze.json", doc)

            self.assertFalse(result["passed"])
            self.assertEqual(result["expanded_target_count"], 946)
            self.assertEqual(len(result["failures"]), 1)
            self.assertEqual(
                result["failures"][0]["target_pointer"], "/case_bindings/945"
            )

    def test_chk_json_pointer_small_and_reverse_range_behavior(self) -> None:
        path = "docs/helix-os/L8-unit-verification/log-feedback-memory-lineage.json"
        small = {
            "path_aliases": {"OS007": path},
            "refs": ["OS007#/case_bindings/0..2"],
        }
        small_result = dvc.check_json_pointer(REPO_ROOT, "freeze.json", small)
        self.assertTrue(small_result["passed"], msg=small_result["failures"])
        self.assertEqual(small_result["expanded_target_count"], 3)

        reverse = {
            "path_aliases": {"OS007": path},
            "refs": ["OS007#/case_bindings/2..0"],
        }
        reverse_result = dvc.check_json_pointer(REPO_ROOT, "freeze.json", reverse)
        self.assertFalse(reverse_result["passed"])
        self.assertEqual(len(reverse_result["failures"]), 1)
        self.assertEqual(
            reverse_result["failures"][0]["target_pointer"],
            "/case_bindings/2..0",
        )

    def test_chk_pair_bidir_id_pass_and_mutation_fail(self) -> None:
        left = {
            "contracts": [
                {"id": "L5-C1", "oracle_ref": "L8-C1"},
                {"id": "L5-C2", "oracle_ref": "L8-C2"},
            ]
        }
        right = {
            "cases": [
                {
                    "id": "L8-C1",
                    "design_ref": "L5-C1",
                    "negative_case_count": 2,
                    "negative_cases": [{"id": "N1"}, {"id": "N2"}],
                },
                {
                    "id": "L8-C2",
                    "design_ref": "L5-C2",
                    "negative_case_count": 1,
                    "negative_cases": [{"id": "N3"}],
                },
            ],
            "completion": {"unit_case_count": 2, "negative_case_count": 3},
        }
        res_pass = dvc.check_pair_bidir_id(
            REPO_ROOT, "L5.json", "L8.json", left_data=left, right_data=right
        )
        self.assertTrue(res_pass["passed"])

        # Mutation 1: break reverse link
        mut_r1 = copy.deepcopy(right)
        mut_r1["cases"][1]["design_ref"] = "L5-WRONG"
        res_fail1 = dvc.check_pair_bidir_id(
            REPO_ROOT, "L5.json", "L8.json", left_data=left, right_data=mut_r1
        )
        self.assertFalse(res_fail1["passed"])
        self.assertEqual(res_fail1["failures"][0]["error"], "missing_reverse_link")

        # Mutation 2: duplicate ID
        mut_l2 = copy.deepcopy(left)
        mut_l2["contracts"][1]["id"] = "L5-C1"
        res_fail2 = dvc.check_pair_bidir_id(
            REPO_ROOT, "L5.json", "L8.json", left_data=mut_l2, right_data=right
        )
        self.assertFalse(res_fail2["passed"])
        self.assertTrue(
            any(f["error"] == "duplicate_id" for f in res_fail2["failures"])
        )

        # Mutation 3: /completion/negative_case_count mismatch (#3759 R1-i2)
        mut_r3 = copy.deepcopy(right)
        mut_r3["completion"]["negative_case_count"] = 99
        res_fail3 = dvc.check_pair_bidir_id(
            REPO_ROOT, "L5.json", "L8.json", left_data=left, right_data=mut_r3
        )
        self.assertFalse(res_fail3["passed"])
        self.assertTrue(
            any(
                f["pointer"] == "/completion/negative_case_count"
                and f["error"] == "count_mismatch"
                for f in res_fail3["failures"]
            )
        )

    def test_chk_ownership_cap_l8l9_and_l3l6_pass_and_mutation_fail(self) -> None:
        clean_l8 = {
            "source_pins": {"L5": {"path": "docs/L5.json", "sha256": "a" * 64}},
            "cases": [
                {
                    "id": "U1",
                    "counterexample": "invalid input",
                    "expected": "rejected",
                }
            ],
        }
        res_l8_pass = dvc.check_ownership_cap(
            REPO_ROOT, "docs/helix-os/L8-unit-verification/x.json", clean_l8
        )
        self.assertTrue(res_l8_pass["passed"])
        self.assertEqual(res_l8_pass["check"], "CHK-OWNERSHIP-CAP-L8L9")

        # Mutation 1: add forbidden key `fixture_patch` and unpinned `expected_output_sha256` to L8
        dirty_l8 = copy.deepcopy(clean_l8)
        dirty_l8["cases"][0]["fixture_patch"] = [{"op": "replace"}]
        dirty_l8["cases"][0]["expected_output_sha256"] = "b" * 64
        res_l8_fail = dvc.check_ownership_cap(
            REPO_ROOT, "docs/helix-os/L8-unit-verification/x.json", dirty_l8
        )
        self.assertFalse(res_l8_fail["passed"])
        keys_caught = {f["key"] for f in res_l8_fail["failures"]}
        self.assertIn("fixture_patch", keys_caught)
        self.assertIn("expected_output_sha256", keys_caught)

        # Mutation 2: L5 with forbidden `full_return` / `rfc6902_copy_ops`
        clean_l5 = {
            "type_contract": {
                "types": {"Envelope": {"fields": {"source_sha256": "string"}}}
            },
            "functions": [{"id": "F1", "symbol": "fn1"}],
        }
        res_l5_pass = dvc.check_ownership_cap(
            REPO_ROOT, "docs/helix-os/L5-detail-design/x.json", clean_l5
        )
        self.assertTrue(res_l5_pass["passed"])
        self.assertEqual(res_l5_pass["check"], "CHK-OWNERSHIP-CAP-L3L6")

        dirty_l5 = copy.deepcopy(clean_l5)
        dirty_l5["functions"][0]["full_return"] = {"huge": "payload"}
        res_l5_fail = dvc.check_ownership_cap(
            REPO_ROOT, "docs/helix-os/L5-detail-design/x.json", dirty_l5
        )
        self.assertFalse(res_l5_fail["passed"])
        self.assertEqual(res_l5_fail["failures"][0]["key"], "full_return")

    def test_l7_allows_full_test_material(self) -> None:
        l7 = dvc.check_ownership_cap(
            REPO_ROOT,
            "docs/helix-labo/L7-function-verification/aggregate-correlate-connection.json",
            ownership_cap_test_material(),
            layer="L7",
        )
        self.assertTrue(l7["passed"], msg=l7["failures"])
        self.assertEqual(l7["status"], "not_applicable")
        self.assertTrue(l7["reason"])

    def test_l6_l8_l9_reject_l7_full_test_material(self) -> None:
        material = ownership_cap_test_material()
        common_material_keys = {
            "fixture_patch",
            "expected_return",
            "full_return",
            "literal_materialization_contract",
        }
        for layer in ("L6", "L8", "L9"):
            result = dvc.check_ownership_cap(
                REPO_ROOT,
                f"docs/helix-labo/{layer}-verification/aggregate-correlate-connection.json",
                material,
                layer=layer,
            )
            self.assertFalse(result["passed"], msg=layer)
            rejected = {failure["key"] for failure in result["failures"]}
            self.assertTrue(common_material_keys <= rejected, msg=(layer, rejected))
            if layer in ("L8", "L9"):
                self.assertIn("seed", rejected)
                self.assertIn("materialization_sha256", rejected)

    def test_chk_neg_4way_casewise_mode_ignores_partial_top_level_parent_links(
        self,
    ) -> None:
        l4 = {
            "contracts": [
                {
                    "id": "L4-01",
                    "negative_classifications": [
                        {
                            "code": "err_a",
                            "change": "bad input A",
                            "axis": "input",
                            "state": "conflict",
                            "expected": "reject A",
                            "expected_preserved": {"obs": "keep"},
                            "backflow_owner": "CORE",
                        }
                    ],
                }
            ]
        }
        l9 = {
            "cases": [
                {
                    "id": "L9-01",
                    "negative_cases": [
                        {
                            "id": "L9-01-N1",
                            "code": "err_a",
                            "change": "bad input A",
                            "axis": "input",
                            "state": "conflict",
                            "expected": "reject A",
                            "expected_preserved": {"obs": "keep"},
                            "backflow_owner": "CORE",
                            "expected_side_effect_count": 0,
                        }
                    ],
                }
            ]
        }
        l8 = {
            "cases": [
                {
                    "id": "L8-01",
                    "negative_cases": [
                        {
                            "id": "L8-01-N1",
                            "rule_ref": "L5-R-err_a",
                            "function_ref": "L5-fn1",
                            "code": "err_a",
                            "change": "bad input A",
                            "axis": "input",
                            "state": "conflict",
                            "expected": "reject A",
                            "expected_preserved": {"obs": "keep"},
                            "backflow_owner": "CORE",
                            "expected_side_effect_count": 0,
                        }
                    ],
                }
            ]
        }
        l5 = {
            "contracts": [{"id": "L5-01"}],
            "failure_rules": [
                {
                    "id": "L5-R-err_a",
                    "contract_ref": "L5-01",
                    "function_ref": "L5-fn1",
                    "code": "err_a",
                    "condition": "bad input A",
                    "expected_axis": "input",
                    "expected_state": "conflict",
                    "expected": "reject A",
                    "expected_preserved": {"obs": "keep"},
                    "backflow_owner": "CORE",
                    "side_effect_count": 0,
                }
            ],
        }
        res_pass = dvc.check_neg_4way_match(
            REPO_ROOT, "L4", "L9", "L8", "L5", l4, l9, l8, l5
        )
        self.assertTrue(res_pass["passed"])
        self.assertEqual(res_pass["matched_case_count"], 1)
        self.assertEqual(res_pass["comparison_mode"], "legacy_casewise_four_layer")
        self.assertEqual(res_pass["parent_link_mode"], "legacy")

        # A partial design_ref in legacy casewise input remains inert.
        partial_parent_l4 = copy.deepcopy(l4)
        partial_parent_l4["failure_classifications"] = [
            {"class_id": "top-level-linked", "design_ref": "L4-01"},
            {"class_id": "top-level-unlinked"},
        ]
        partial_parent = dvc.check_neg_4way_match(
            REPO_ROOT,
            "L4",
            "L9",
            "L8",
            "L5",
            partial_parent_l4,
            l9,
            l8,
            l5,
        )
        self.assertEqual(partial_parent, res_pass)

        # Mutation 1: change backflow_owner on L8
        mut_l8 = copy.deepcopy(l8)
        mut_l8["cases"][0]["negative_cases"][0]["backflow_owner"] = "WRONG_OWNER"
        res_fail1 = dvc.check_neg_4way_match(
            REPO_ROOT, "L4", "L9", "L8", "L5", l4, l9, mut_l8, l5
        )
        self.assertFalse(res_fail1["passed"])
        self.assertEqual(res_fail1["failures"][0]["attribute"], "backflow_owner")

        # Mutation 2: non-zero side_effect_count on L9
        mut_l9 = copy.deepcopy(l9)
        mut_l9["cases"][0]["negative_cases"][0]["expected_side_effect_count"] = 1
        res_fail2 = dvc.check_neg_4way_match(
            REPO_ROOT, "L4", "L9", "L8", "L5", l4, mut_l9, l8, l5
        )
        self.assertFalse(res_fail2["passed"])
        self.assertEqual(res_fail2["failures"][0]["attribute"], "side_effect_count")

    def test_chk_neg_4way_expected_preserved_null_alignment_and_os002_reference(
        self,
    ) -> None:
        def make_layers():
            l4 = {
                "contracts": [
                    {
                        "id": "L4-NULL-PRESERVED",
                        "negative_classifications": [
                            {
                                "code": "predicate_only",
                                "change": "a stated negative condition",
                                "axis": "input",
                                "state": "conflict",
                                "expected": "reject while retaining source input",
                                "backflow_owner": "CORE",
                            }
                        ],
                    }
                ]
            }
            l9 = {
                "cases": [
                    {
                        "id": "L9-NULL-PRESERVED",
                        "negative_cases": [
                            {
                                "id": "L9-N1",
                                "code": "predicate_only",
                                "change": "a stated negative condition",
                                "axis": "input",
                                "state": "conflict",
                                "expected": "reject while retaining source input",
                                "backflow_owner": "CORE",
                                "expected_side_effect_count": 0,
                            }
                        ],
                    }
                ]
            }
            l8 = {
                "cases": [
                    {
                        "id": "L8-NULL-PRESERVED",
                        "negative_cases": [
                            {
                                "id": "L8-N1",
                                "rule_ref": "L5-R-predicate_only",
                                "function_ref": "L5-fn",
                                "code": "predicate_only",
                                "change": "a stated negative condition",
                                "axis": "input",
                                "state": "conflict",
                                "expected": "reject while retaining source input",
                                "backflow_owner": "CORE",
                                "expected_side_effect_count": 0,
                            }
                        ],
                    }
                ]
            }
            l5 = {
                "contracts": [{"id": "L5-NULL-PRESERVED"}],
                "failure_rules": [
                    {
                        "id": "L5-R-predicate_only",
                        "contract_ref": "L5-NULL-PRESERVED",
                        "function_ref": "L5-fn",
                        "code": "predicate_only",
                        "condition": "a stated negative condition",
                        "expected_axis": "input",
                        "expected_state": "conflict",
                        "expected": "reject while retaining source input",
                        "backflow_owner": "CORE",
                        "side_effect_count": 0,
                        "predicate": "reject this condition and preserve the original input",
                    }
                ],
            }
            return l4, l9, l8, l5

        l4, l9, l8, l5 = make_layers()
        predicate_only_match = dvc.check_neg_4way_match(
            REPO_ROOT, "L4", "L9", "L8", "L5", l4, l9, l8, l5
        )
        self.assertTrue(predicate_only_match["passed"])
        self.assertEqual(predicate_only_match["matched_case_count"], 1)

        one_layer_only = copy.deepcopy((l4, l9, l8, l5))
        one_layer_only[0]["contracts"][0]["negative_classifications"][0][
            "expected_preserved"
        ] = {"source": "retained"}
        one_layer_result = dvc.check_neg_4way_match(
            REPO_ROOT, "L4", "L9", "L8", "L5", *one_layer_only
        )
        self.assertFalse(one_layer_result["passed"])
        self.assertTrue(
            any(
                failure["attribute"] == "expected_preserved"
                for failure in one_layer_result["failures"]
            )
        )

        literal_mismatch = copy.deepcopy((l4, l9, l8, l5))
        for layer in literal_mismatch[:3]:
            target = (
                layer["contracts"][0]["negative_classifications"][0]
                if "contracts" in layer
                else layer["cases"][0]["negative_cases"][0]
            )
            target["expected_preserved"] = {"source": "same"}
        literal_mismatch[3]["failure_rules"][0]["expected_preserved"] = {
            "source": "different"
        }
        literal_result = dvc.check_neg_4way_match(
            REPO_ROOT, "L4", "L9", "L8", "L5", *literal_mismatch
        )
        self.assertFalse(literal_result["passed"])
        self.assertTrue(
            any(
                failure["attribute"] == "expected_preserved"
                for failure in literal_result["failures"]
            )
        )

        os002_paths = {
            "L4": "docs/helix-os/L4-basic-design/project-template-trace.json",
            "L9": "docs/helix-os/L9-integration-verification/project-template-trace.json",
            "L8": "docs/helix-os/L8-unit-verification/project-template-trace.json",
            "L5": "docs/helix-os/L5-detail-design/project-template-trace.json",
        }
        os002_layers = {
            layer: dvc._load_json(REPO_ROOT, path)
            for layer, path in os002_paths.items()
        }
        os002_match = dvc.check_neg_4way_match(
            REPO_ROOT,
            os002_paths["L4"],
            os002_paths["L9"],
            os002_paths["L8"],
            os002_paths["L5"],
            os002_layers["L4"],
            os002_layers["L9"],
            os002_layers["L8"],
            os002_layers["L5"],
            contract_index=0,
        )
        self.assertTrue(
            os002_layers["L5"]["failure_rules"][0]["preserved_observation_ref"]
        )
        self.assertTrue(os002_match["passed"], msg=os002_match["failures"])
        self.assertEqual(os002_match["matched_case_count"], 2)

        os002_missing_upper_values = copy.deepcopy(os002_layers)
        for layer in ("L4", "L9", "L8"):
            rows = (
                os002_missing_upper_values[layer]["contracts"][0][
                    "negative_classifications"
                ]
                if layer == "L4"
                else os002_missing_upper_values[layer]["cases"][0]["negative_cases"]
            )
            for row in rows:
                row.pop("expected_preserved", None)
        os002_missing_result = dvc.check_neg_4way_match(
            REPO_ROOT,
            os002_paths["L4"],
            os002_paths["L9"],
            os002_paths["L8"],
            os002_paths["L5"],
            os002_missing_upper_values["L4"],
            os002_missing_upper_values["L9"],
            os002_missing_upper_values["L8"],
            os002_missing_upper_values["L5"],
            contract_index=0,
        )
        preserved_failures = [
            failure
            for failure in os002_missing_result["failures"]
            if failure["attribute"] == "expected_preserved"
        ]
        self.assertFalse(os002_missing_result["passed"])
        self.assertEqual(len(preserved_failures), 2)
        self.assertTrue(
            all(
                failure["L4"] is None
                and failure["L9"] is None
                and failure["L8"] is None
                and failure["L5"] is None
                for failure in preserved_failures
            )
        )
        self.assertEqual(os002_missing_upper_values["L5"], os002_layers["L5"])

    def test_legacy_additional_negative_state_and_scope_are_four_layer_checked(
        self,
    ) -> None:
        paths = {
            "L4": "docs/helix-os/L4-basic-design/project-template-trace.json",
            "L5": "docs/helix-os/L5-detail-design/project-template-trace.json",
            "L8": "docs/helix-os/L8-unit-verification/project-template-trace.json",
            "L9": "docs/helix-os/L9-integration-verification/project-template-trace.json",
        }
        layers = {key: dvc._load_json(REPO_ROOT, path) for key, path in paths.items()}
        baseline = dvc.check_neg_4way_match(
            REPO_ROOT,
            paths["L4"],
            paths["L9"],
            paths["L8"],
            paths["L5"],
            l4_data=layers["L4"],
            l9_data=layers["L9"],
            l8_data=layers["L8"],
            l5_data=layers["L5"],
        )
        self.assertTrue(baseline["passed"], baseline["failures"])
        self.assertEqual(baseline["counts"], {"L4": 85, "L9": 85, "L8": 85, "L5": 85})

        # ADD-41/42 are deliberately referenced through L8 additional_cases;
        # the ordinary cases[] copies stay unchanged to exercise the missing
        # consumer path that previously allowed this state drift.
        changed = copy.deepcopy(layers["L8"])
        changed["additional_cases"][40]["expected_state"] = "unknown"
        mutated = dvc.check_neg_4way_match(
            REPO_ROOT,
            paths["L4"],
            paths["L9"],
            paths["L8"],
            paths["L5"],
            l4_data=layers["L4"],
            l9_data=layers["L9"],
            l8_data=changed,
            l5_data=layers["L5"],
        )
        self.assertFalse(mutated["passed"])
        state_failure = next(
            failure
            for failure in mutated["failures"]
            if failure.get("case_id") == "HELIXOS-L8-002-ADD-41"
            and failure.get("attribute") == "expected_state"
        )
        self.assertEqual(
            {key: state_failure[key] for key in ("L4", "L8", "L9", "L5")},
            {"L4": "missing", "L8": "unknown", "L9": "missing", "L5": "missing"},
        )
        for bad_state in ("absent", "not-a-state", None):
            invalid_state = copy.deepcopy(layers["L8"])
            invalid_state["additional_cases"][40]["expected_state"] = bad_state
            result = dvc.check_neg_4way_match(
                REPO_ROOT,
                paths["L4"],
                paths["L9"],
                paths["L8"],
                paths["L5"],
                l4_data=layers["L4"],
                l9_data=layers["L9"],
                l8_data=invalid_state,
                l5_data=layers["L5"],
            )
            self.assertTrue(
                any(
                    failure.get("case_id") == "HELIXOS-L8-002-ADD-41"
                    and failure.get("attribute") == "expected_state"
                    and failure.get("error") == "missing_or_invalid_negative_state"
                    for failure in result["failures"]
                )
            )
        # Container-valued states used to reach set membership and raise
        # TypeError. They must be reported as structured invalid states.
        for bad_state in ([], {}):
            invalid_state = copy.deepcopy(layers["L8"])
            invalid_state["additional_cases"][40]["expected_state"] = bad_state
            result = dvc.check_neg_4way_match(
                REPO_ROOT,
                paths["L4"],
                paths["L9"],
                paths["L8"],
                paths["L5"],
                l4_data=layers["L4"],
                l9_data=layers["L9"],
                l8_data=invalid_state,
                l5_data=layers["L5"],
            )
            self.assertTrue(
                any(
                    failure.get("case_id") == "HELIXOS-L8-002-ADD-41"
                    and failure.get("attribute") == "expected_state"
                    and failure.get("error") == "missing_or_invalid_negative_state"
                    for failure in result["failures"]
                )
            )
        deleted_state = copy.deepcopy(layers["L8"])
        del deleted_state["additional_cases"][40]["expected_state"]
        deleted_state_result = dvc.check_neg_4way_match(
            REPO_ROOT,
            paths["L4"],
            paths["L9"],
            paths["L8"],
            paths["L5"],
            l4_data=layers["L4"],
            l9_data=layers["L9"],
            l8_data=deleted_state,
            l5_data=layers["L5"],
        )
        self.assertTrue(
            any(
                failure.get("case_id") == "HELIXOS-L8-002-ADD-41"
                and failure.get("attribute") == "expected_state"
                and failure.get("error") == "missing_or_invalid_negative_state"
                for failure in deleted_state_result["failures"]
            )
        )
        self.assertFalse(
            any(
                failure.get("case_id") == "HELIXOS-L8-002-ADD-50"
                for failure in baseline["failures"]
            )
        )
        add50 = layers["L8"]["additional_cases"][49]
        self.assertEqual(add50["expected_state"], "absent")
        self.assertEqual(
            add50["function_ref"], "HELIXOS-L5-002-compare_operation_dependencies"
        )
        add50_function = next(
            row
            for row in layers["L5"]["functions"]
            if row["id"] == add50["function_ref"]
        )
        self.assertNotIn(add50["id"], add50_function["unit_case_refs"])
        self.assertFalse(
            any(
                row.get("code") == add50["code"]
                for row in layers["L5"]["failure_rules"]
            )
        )
        self.assertFalse(
            any(
                row.get("code") == add50["code"]
                for row in layers["L4"]["contracts"][1]["negative_classifications"]
            )
        )
        self.assertFalse(
            any(
                row.get("code") == add50["code"]
                for row in layers["L9"]["cases"][1]["negative_cases"]
            )
        )

        missing_function = copy.deepcopy(layers["L8"])
        missing_function["additional_cases"][40]["function_ref"] = None
        missing_function_result = dvc.check_neg_4way_match(
            REPO_ROOT,
            paths["L4"],
            paths["L9"],
            paths["L8"],
            paths["L5"],
            l4_data=layers["L4"],
            l9_data=layers["L9"],
            l8_data=missing_function,
            l5_data=layers["L5"],
        )
        self.assertTrue(
            any(
                failure.get("case_id") == "HELIXOS-L8-002-ADD-41"
                and failure.get("attribute") == "additional_case_function_scope"
                for failure in missing_function_result["failures"]
            )
        )

        # Malformed owner references are reported as failures instead of
        # escaping through dict lookup/hash operations.
        owner_function = next(
            row
            for row in layers["L5"]["functions"]
            if "HELIXOS-L8-002-ADD-41" in row["unit_case_refs"]
        )
        for malformed_refs, expected_attribute in (
            ({"bad": "shape"}, "invalid_l5_function_contract_refs"),
            ([{}], "invalid_l5_contract_ref_type"),
        ):
            malformed_l5 = copy.deepcopy(layers["L5"])
            next(
                row
                for row in malformed_l5["functions"]
                if row["id"] == owner_function["id"]
            )["contract_refs"] = malformed_refs
            malformed_result = dvc.check_neg_4way_match(
                REPO_ROOT,
                paths["L4"],
                paths["L9"],
                paths["L8"],
                paths["L5"],
                l4_data=layers["L4"],
                l9_data=layers["L9"],
                l8_data=layers["L8"],
                l5_data=malformed_l5,
            )
            self.assertTrue(
                any(
                    failure.get("case_id") == "HELIXOS-L8-002-ADD-41"
                    and failure.get("attribute") == expected_attribute
                    for failure in malformed_result["failures"]
                )
            )

        for malformed_design_ref in ([], {}):
            malformed_l5 = copy.deepcopy(layers["L5"])
            owner_contract_id = owner_function["contract_refs"][0]
            next(
                row
                for row in malformed_l5["contracts"]
                if row["id"] == owner_contract_id
            )["basic_design_ref"] = malformed_design_ref
            malformed_result = dvc.check_neg_4way_match(
                REPO_ROOT,
                paths["L4"],
                paths["L9"],
                paths["L8"],
                paths["L5"],
                l4_data=layers["L4"],
                l9_data=layers["L9"],
                l8_data=layers["L8"],
                l5_data=malformed_l5,
            )
            self.assertTrue(
                any(
                    failure.get("case_id") == "HELIXOS-L8-002-ADD-41"
                    and failure.get("attribute") == "invalid_l5_basic_design_ref"
                    for failure in malformed_result["failures"]
                )
            )

        # An identical code in a different L4 parent cannot replace or add a
        # counterpart for ADD-41's L5 function/contract scope.
        unrelated_code = copy.deepcopy(layers["L4"])
        unrelated_code["contracts"][0]["negative_classifications"].append(
            {"code": "harness_process_contract_ref_missing", "state": "missing"}
        )
        unrelated_result = dvc.check_neg_4way_match(
            REPO_ROOT,
            paths["L4"],
            paths["L9"],
            paths["L8"],
            paths["L5"],
            l4_data=unrelated_code,
            l9_data=layers["L9"],
            l8_data=layers["L8"],
            l5_data=layers["L5"],
        )
        self.assertFalse(
            any(
                failure.get("case_id") == "HELIXOS-L8-002-ADD-41"
                and failure.get("attribute") == "additional_case_counterpart"
                and failure.get("layer") == "L4"
                and failure.get("actual_count") != 1
                for failure in unrelated_result["failures"]
            )
        )

        # ADD-50 is a nonnegative private operation. Reusing an unrelated
        # negative code must not make its row part of the four-layer scope.
        private_code_collision = copy.deepcopy(layers["L8"])
        collision_code = "private_scope_collision"
        private_code_collision["additional_cases"][49]["code"] = collision_code
        private_collision_l4 = copy.deepcopy(layers["L4"])
        private_collision_l4["contracts"][0]["negative_classifications"].append(
            {"code": collision_code, "state": "missing"}
        )
        collision_result = dvc.check_neg_4way_match(
            REPO_ROOT,
            paths["L4"],
            paths["L9"],
            paths["L8"],
            paths["L5"],
            l4_data=private_collision_l4,
            l9_data=layers["L9"],
            l8_data=private_code_collision,
            l5_data=layers["L5"],
        )
        self.assertFalse(
            any(
                failure.get("case_id") == "HELIXOS-L8-002-ADD-50"
                for failure in collision_result["failures"]
            )
        )

        duplicate_l5_contract = copy.deepcopy(layers["L5"])
        duplicate_l5_contract["contracts"].append(
            copy.deepcopy(duplicate_l5_contract["contracts"][1])
        )
        duplicate_l5_result = dvc.check_neg_4way_match(
            REPO_ROOT,
            paths["L4"],
            paths["L9"],
            paths["L8"],
            paths["L5"],
            l4_data=layers["L4"],
            l9_data=layers["L9"],
            l8_data=layers["L8"],
            l5_data=duplicate_l5_contract,
        )
        self.assertTrue(
            any(
                failure.get("case_id") == "HELIXOS-L8-002-ADD-41"
                and failure.get("attribute") == "l5_contract_ref_ambiguity"
                for failure in duplicate_l5_result["failures"]
            )
        )

        duplicate_l4_parent = copy.deepcopy(layers["L4"])
        duplicate_l4_parent["contracts"].append(
            copy.deepcopy(duplicate_l4_parent["contracts"][1])
        )
        duplicate_l4_result = dvc.check_neg_4way_match(
            REPO_ROOT,
            paths["L4"],
            paths["L9"],
            paths["L8"],
            paths["L5"],
            l4_data=duplicate_l4_parent,
            l9_data=layers["L9"],
            l8_data=layers["L8"],
            l5_data=layers["L5"],
        )
        self.assertTrue(
            any(
                failure.get("case_id") == "HELIXOS-L8-002-ADD-41"
                and failure.get("attribute") == "l4_parent_ref_ambiguity"
                for failure in duplicate_l4_result["failures"]
            )
        )

        duplicate_l9_parent = copy.deepcopy(layers["L9"])
        duplicate_l9_parent["cases"].append(
            copy.deepcopy(duplicate_l9_parent["cases"][1])
        )
        duplicate_l9_result = dvc.check_neg_4way_match(
            REPO_ROOT,
            paths["L4"],
            paths["L9"],
            paths["L8"],
            paths["L5"],
            l4_data=layers["L4"],
            l9_data=duplicate_l9_parent,
            l8_data=layers["L8"],
            l5_data=layers["L5"],
        )
        self.assertTrue(
            any(
                failure.get("case_id") == "HELIXOS-L8-002-ADD-41"
                and failure.get("attribute") == "l9_design_ref_ambiguity"
                for failure in duplicate_l9_result["failures"]
            )
        )

        # A partial counterpart must fail closed, not silently reclassify the
        # additional row as out of scope. ADD-50 remains explicitly nonnegative
        # and is therefore outside this negative four-layer comparison.
        partial = copy.deepcopy(layers["L4"])
        partial["contracts"][1]["negative_classifications"] = [
            row
            for row in partial["contracts"][1]["negative_classifications"]
            if row.get("code") != "harness_process_contract_ref_missing"
        ]
        partial_result = dvc.check_neg_4way_match(
            REPO_ROOT,
            paths["L4"],
            paths["L9"],
            paths["L8"],
            paths["L5"],
            l4_data=partial,
            l9_data=layers["L9"],
            l8_data=layers["L8"],
            l5_data=layers["L5"],
        )
        self.assertTrue(
            any(
                failure.get("case_id") == "HELIXOS-L8-002-ADD-41"
                and failure.get("attribute") == "additional_case_counterpart"
                and failure.get("layer") == "L4"
                for failure in partial_result["failures"]
            )
        )

    def test_basic_pair_freeze_row_recomputes_ids_links_counts_and_dispositions(
        self,
    ) -> None:
        freeze_path = (
            "docs/governance/audits/tdd/os002-b1-f04-basic-freeze-2026-10-28.json"
        )
        record = dvc._load_json(REPO_ROOT, freeze_path)
        aliases = record["path_aliases"]
        loaded = {
            alias: dvc._load_json(REPO_ROOT, path)
            for alias, path in aliases.items()
            if alias in {"L3F", "L10F", "L4", "L9"}
        }
        result = dvc._check_basic_pair_freeze_row(record, aliases, loaded)
        # The immutable source freeze has one stale declared sub-oracle ID;
        # audit must report it rather than repair or reinterpret the record.
        mismatch = [
            failure
            for failure in result["failures"]
            if failure.get("error") == "child_id_mismatch"
        ]
        self.assertEqual(len(mismatch), 1)
        self.assertEqual(
            mismatch[0]["pointer"],
            "L9#/cases/5/selected_source_member_correspondence_oracles",
        )
        self.assertEqual(
            mismatch[0]["expected_id"],
            "HELIXOS-L9-002-F04-SOURCE-MEMBER-CORRESPONDENCE",
        )
        self.assertEqual(mismatch[0]["actual_id"], "HELIXOS-L9-002-F04-SOURCE-MEMBERS")

        repaired_copy = copy.deepcopy(record)
        repaired_copy["basic_pair_freeze_row"]["l9_sub_oracles"][4]["id"] = mismatch[0][
            "actual_id"
        ]
        repaired_result = dvc._check_basic_pair_freeze_row(
            repaired_copy, aliases, loaded
        )
        self.assertTrue(repaired_result["passed"], repaired_result["failures"])

        mutated = copy.deepcopy(repaired_copy)
        mutated["basic_pair_freeze_row"]["l9_sub_oracles"][1]["count"] += 1
        mutated_result = dvc._check_basic_pair_freeze_row(mutated, aliases, loaded)
        self.assertTrue(
            any(
                failure.get("error") == "child_count_mismatch"
                for failure in mutated_result["failures"]
            )
        )

        empty_child_refs = copy.deepcopy(repaired_copy)
        empty_child_refs["basic_pair_freeze_row"]["l4_subcontracts"] = []
        empty_child_refs["basic_pair_freeze_row"]["l9_sub_oracles"] = []
        empty_result = dvc._check_basic_pair_freeze_row(
            empty_child_refs, aliases, loaded
        )
        self.assertEqual(
            sum(
                failure.get("error") == "empty_required_array"
                for failure in empty_result["failures"]
            ),
            2,
        )

        invalid_parent = copy.deepcopy(repaired_copy)
        invalid_parent["basic_pair_freeze_row"]["l4_contract_pointer"] = (
            "L4#/contracts/999"
        )
        invalid_parent_result = dvc._check_basic_pair_freeze_row(
            invalid_parent, aliases, loaded
        )
        self.assertTrue(
            any(
                failure.get("error") == "unresolved_or_non_object_pair_pointer"
                for failure in invalid_parent_result["failures"]
            )
        )
        self.assertTrue(
            any(
                failure.get("error") == "child_pointer_outside_selected_parent"
                for failure in invalid_parent_result["failures"]
            )
        )

        unknown_state = copy.deepcopy(repaired_copy)
        unknown_state["basic_pair_freeze_row"]["freeze_state"] = "frozen-ish"
        unknown_state_result = dvc._check_basic_pair_freeze_row(
            unknown_state, aliases, loaded
        )
        self.assertTrue(
            any(
                failure.get("error") == "missing_or_unknown_freeze_state"
                for failure in unknown_state_result["failures"]
            )
        )

        unknown_class = copy.deepcopy(repaired_copy)
        unknown_class["remaining_dispositions"][0]["class"] = "D"
        unknown_class_result = dvc._check_basic_pair_freeze_row(
            unknown_class, aliases, loaded
        )
        self.assertTrue(
            any(
                failure.get("error") == "invalid_disposition_class_or_row"
                for failure in unknown_class_result["failures"]
            )
        )

    def test_basic_pair_generate_and_audit_recompute_without_semantic_approval(
        self,
    ) -> None:
        freeze_path = (
            "docs/governance/audits/tdd/os002-b1-f04-basic-freeze-2026-10-28.json"
        )
        record = dvc._load_json(REPO_ROOT, freeze_path)
        current_head = subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=REPO_ROOT, text=True
        ).strip()
        manifest = copy.deepcopy(record)
        for key in (
            "pins",
            "verification",
            "basic_pair_freeze_verification",
            "negative_case_4way_verification",
            "pointer_resolution_summary",
            "resolved_function_rows",
            "head_entity_counts",
        ):
            manifest.pop(key, None)
        manifest["source_main"] = current_head
        manifest["request_base_sha"] = current_head
        manifest["basic_pair_freeze_row"]["l9_sub_oracles"][4]["id"] = (
            "HELIXOS-L9-002-F04-SOURCE-MEMBERS"
        )
        manifest["human_judgment_pending"] = [
            {"status": "pending_human_semantic_review"}
        ]

        generated = dvc.generate_freeze_record(
            REPO_ROOT, manifest, base_rev=current_head, head_rev=current_head
        )
        self.assertTrue(generated["basic_pair_freeze_verification"]["passed"])
        self.assertEqual(generated["authority_effect"], "none")
        self.assertEqual(
            generated["human_judgment_pending"],
            [{"status": "pending_human_semantic_review"}],
        )
        with tempfile.TemporaryDirectory() as tmpdir:
            generated_path = Path(tmpdir) / "generated-basic-pair-freeze.json"
            generated_path.write_text(
                json.dumps(generated, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            audited = dvc.audit_freeze_record(
                REPO_ROOT, str(generated_path), use_creation_commit=False
            )
        self.assertTrue(
            audited["mechanical_match"],
            audited["comparison_with_existing_record"],
        )

        broken = copy.deepcopy(manifest)
        broken["basic_pair_freeze_row"]["l9_case_pointer"] = "L9#/cases/99"
        bad_generation = dvc.generate_freeze_record(
            REPO_ROOT, broken, base_rev=current_head, head_rev=current_head
        )
        self.assertFalse(bad_generation["basic_pair_freeze_verification"]["passed"])
        self.assertGreater(
            bad_generation["basic_pair_freeze_verification"]["failure_count"], 0
        )

    def test_chk_public_fn_freeze_pass_and_mutation_fail(self) -> None:
        l5 = {
            "functions": [
                {
                    "id": "L5-FN-0",
                    "symbol": "pub_fn",
                    "visibility": "public",
                    "input_type": "In",
                    "output_type": "Out",
                    "oracle_ref": "L8-NORM-0",
                    "unit_case_refs": ["L8-U-1"],
                },
                {
                    "id": "L5-FN-1",
                    "symbol": "_priv_fn",
                    "visibility": "private",
                    "oracle_ref": "L8-NORM-1",
                    "unit_case_refs": [],
                },
            ]
        }
        l8 = {
            "normal_function_oracles": [{"id": "L8-NORM-0"}],
            "additional_unit_cases": [{"id": "L8-U-1"}],
        }
        rec = {
            "function_freeze_rows": [
                {
                    "entry_kind": "public_function",
                    "symbol": "pub_fn",
                    "l5_function_pointer": "L5#/functions/0",
                }
            ],
            "private_detail_bindings": [
                {
                    "detail_pointer": "L5#/some_detail",
                    "symbol": "_helper",
                    "bound_public_functions": ["pub_fn"],
                }
            ],
        }
        res_pass = dvc.check_public_fn_freeze(rec, l5, l8)
        self.assertTrue(res_pass["passed"])
        self.assertEqual(len(res_pass["resolved_function_rows"]), 2)
        self.assertEqual(len(res_pass["human_judgment_pending"]), 2)

        # Mutation 1: freeze private function as public (#3763 R1-m1)
        mut1 = copy.deepcopy(rec)
        mut1["function_freeze_rows"][0]["l5_function_pointer"] = "L5#/functions/1"
        res_fail1 = dvc.check_public_fn_freeze(mut1, l5, l8)
        self.assertFalse(res_fail1["passed"])
        self.assertEqual(
            res_fail1["failures"][0]["error"],
            "private_or_non_function_frozen_as_public",
        )

        # Mutation 2: unresolved unit_case_ref in L8
        mut_l5 = copy.deepcopy(l5)
        mut_l5["functions"][0]["unit_case_refs"].append("L8-MISSING-999")
        res_fail2 = dvc.check_public_fn_freeze(rec, mut_l5, l8)
        self.assertFalse(res_fail2["passed"])
        self.assertEqual(res_fail2["failures"][0]["error"], "unresolved_unit_case_ref")

        # Mutation 3: private_detail_binding missing owner/caller disposition
        mut3 = copy.deepcopy(rec)
        mut3["private_detail_bindings"][0] = {
            "detail_pointer": "L5#/some_detail",
            "symbol": "_orphan_helper",
        }
        res_fail3 = dvc.check_public_fn_freeze(mut3, l5, l8)
        self.assertFalse(res_fail3["passed"])
        self.assertEqual(res_fail3["failures"][0]["error"], "missing_reentry_owner")

    def test_chk_l3_obligation_map_pass_and_mutation_fail(self) -> None:
        rec = {
            "l3_obligation_decomposition": [
                {
                    "obligation_id": "O1",
                    "l5_pointers": ["L5#/functions/0"],
                    "l8_pointers": ["L8#/cases/0"],
                }
            ],
            "verification": {"blocking_a_count": 0},
            "branch_coverage_check": {"unreferenced_branch_count": 0},
        }
        res_pass = dvc.check_l3_obligation_map(rec, {}, {})
        self.assertTrue(res_pass["passed"])
        self.assertEqual(res_pass["obligation_count"], 1)
        self.assertEqual(len(res_pass["human_judgment_pending"]), 1)

        # Mutation 1: empty l8_pointers
        mut1 = copy.deepcopy(rec)
        mut1["l3_obligation_decomposition"][0]["l8_pointers"] = []
        res_fail1 = dvc.check_l3_obligation_map(mut1, {}, {})
        self.assertFalse(res_fail1["passed"])
        self.assertEqual(res_fail1["failures"][0]["error"], "empty_l5_or_l8_pointers")

        # Mutation 2: non-zero blocking_a_count
        mut2 = copy.deepcopy(rec)
        mut2["verification"]["blocking_a_count"] = 2
        res_fail2 = dvc.check_l3_obligation_map(mut2, {}, {})
        self.assertFalse(res_fail2["passed"])
        self.assertEqual(res_fail2["failures"][0]["error"], "non_zero_blocking_a")

        # Mutation 3: unreferenced L9 branch
        mut3 = copy.deepcopy(rec)
        mut3["branch_coverage_check"]["unreferenced_branch_count"] = 1
        res_fail3 = dvc.check_l3_obligation_map(mut3, {}, {})
        self.assertFalse(res_fail3["passed"])
        self.assertEqual(res_fail3["failures"][0]["error"], "unreferenced_l9_branch")

        # Mutation 4 (F1): string obligation with L5 pointer only and L8 pointer count == 0
        mut4 = {
            "upper_expectation_rederivation": {
                "derived_expectations_and_t2b_coverage": [
                    "E1（テスト期待）: L5#/functions/5 と L8 origin_cases/0（U-01）で固定。"
                ]
            }
        }
        res_fail4 = dvc.check_l3_obligation_map(mut4, {}, {})
        self.assertFalse(res_fail4["passed"])
        self.assertEqual(res_fail4["failures"][0]["error"], "empty_l5_or_l8_pointers")
        self.assertEqual(
            res_fail4["obligations"][0]["status"], "missing_l5_or_l8_pointers"
        )

        # Mutation 5 (F1): dict obligation with empty l8_pointers but self-reported status="covered"
        mut5 = {
            "l3_obligation_decomposition": [
                {
                    "obligation_id": "O-SELF-REPORTED",
                    "l5_pointers": ["L5#/functions/0"],
                    "l8_pointers": [],
                    "status": "covered",
                }
            ]
        }
        res_fail5 = dvc.check_l3_obligation_map(mut5, {}, {})
        self.assertFalse(res_fail5["passed"])
        self.assertEqual(
            res_fail5["obligations"][0]["status"], "missing_l5_or_l8_pointers"
        )

    def test_f2_zero_count_fail_close_not_evaluated(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            empty_pin = dvc.check_pin_sha256(root, "empty.json", {})
            self.assertFalse(empty_pin["passed"])
            self.assertEqual(empty_pin["status"], "not_evaluated")
            self.assertEqual(
                empty_pin["not_evaluated_reason"], "no_pinned_inputs_found"
            )

            empty_ptr = dvc.check_json_pointer(root, "empty.json", {"hello": "world"})
            self.assertFalse(empty_ptr["passed"])
            self.assertEqual(empty_ptr["status"], "not_evaluated")
            self.assertEqual(
                empty_ptr["not_evaluated_reason"], "no_json_pointers_found"
            )

            empty_pair = dvc.check_pair_bidir_id(
                root,
                "l3.json",
                "l10.json",
                left_data={"requirements": []},
                right_data={"cases": []},
            )
            self.assertFalse(empty_pair["passed"])
            self.assertEqual(empty_pair["status"], "not_evaluated")
            self.assertIn("empty_pair_entities", empty_pair["not_evaluated_reason"])

            empty_neg_missing = dvc.check_neg_4way_match(
                root, "l4.json", "l9.json", "l8.json", "l5.json", {}, {}, {}, {}
            )
            self.assertFalse(empty_neg_missing["passed"])
            self.assertEqual(empty_neg_missing["status"], "not_evaluated")
            self.assertEqual(
                empty_neg_missing["not_evaluated_reason"],
                "missing_or_unparsed_layer_documents",
            )

            non_empty_no_neg = {"contracts": [{"id": "C1"}], "cases": [{"id": "C1"}]}
            zero_neg_no_rationale = dvc.check_neg_4way_match(
                root,
                "l4.json",
                "l9.json",
                "l8.json",
                "l5.json",
                non_empty_no_neg,
                non_empty_no_neg,
                non_empty_no_neg,
                non_empty_no_neg,
            )
            self.assertFalse(zero_neg_no_rationale["passed"])
            self.assertEqual(zero_neg_no_rationale["status"], "not_evaluated")
            self.assertEqual(
                zero_neg_no_rationale["not_evaluated_reason"],
                "zero_negative_case_counts_without_rationale",
            )

            with_rationale = {
                "contracts": [{"id": "C1"}],
                "zero_negative_cases_rationale": "Pure constant declaration slice without failure path",
            }
            zero_neg_with_rationale = dvc.check_neg_4way_match(
                root,
                "l4.json",
                "l9.json",
                "l8.json",
                "l5.json",
                with_rationale,
                non_empty_no_neg,
                non_empty_no_neg,
                non_empty_no_neg,
            )
            self.assertTrue(zero_neg_with_rationale["passed"])
            self.assertEqual(zero_neg_with_rationale["status"], "evaluated")
            self.assertIsNotNone(zero_neg_with_rationale["zero_count_rationale"])

            empty_fn = dvc.check_public_fn_freeze({}, {}, {})
            self.assertFalse(empty_fn["passed"])
            self.assertEqual(empty_fn["status"], "not_evaluated")
            self.assertEqual(
                empty_fn["not_evaluated_reason"],
                "no_public_or_private_function_freeze_rows_found",
            )

            empty_obl = dvc.check_l3_obligation_map({}, {}, {})
            self.assertFalse(empty_obl["passed"])
            self.assertEqual(empty_obl["status"], "not_evaluated")
            self.assertEqual(
                empty_obl["not_evaluated_reason"], "no_l3_obligations_found"
            )

        for unparsed_rec in (
            "docs/governance/audits/tdd/harness001-v12-layer-contract-pair-freeze-2026-10-28.json",
            "docs/governance/audits/tdd/labo011-aggregate-correlate-connection-pair-freeze-2026-10-28.json",
            "docs/governance/audits/tdd/os007-os015-function-pair-freeze-2026-10-28.json",
        ):
            audit = dvc.audit_freeze_record(REPO_ROOT, unparsed_rec)
            self.assertFalse(
                audit["mechanical_match"],
                msg=f"Expected mechanical_match=False for {unparsed_rec}",
            )

    def test_f3_unparsed_record_shape_vs_design_violation(self) -> None:
        l5 = {
            "functions": [
                {
                    "id": "FN-01",
                    "symbol": "pub_fn",
                    "visibility": "public",
                    "unit_case_refs": ["U1"],
                }
            ]
        }
        l8 = {"cases": [{"id": "U1"}]}
        # Missing pointer -> unparsed_record_shape
        rec_unparsed = {"function_freeze_rows": [{"symbol": "pub_fn"}]}
        res_unparsed = dvc.check_public_fn_freeze(rec_unparsed, l5, l8)
        self.assertFalse(res_unparsed["passed"])
        self.assertEqual(res_unparsed["failures"][0]["error"], "unparsed_record_shape")

        # Empty l5_data -> unparsed_record_shape
        rec_empty_l5 = {
            "function_freeze_rows": [
                {"symbol": "pub_fn", "l5_pointer": "L5#/functions/0"}
            ]
        }
        res_empty_l5 = dvc.check_public_fn_freeze(rec_empty_l5, {}, l8)
        self.assertFalse(res_empty_l5["passed"])
        self.assertEqual(res_empty_l5["failures"][0]["error"], "unparsed_record_shape")

        # Non-existent index in loaded l5_data -> unresolved_l5_function_pointer
        rec_missing_idx = {
            "function_freeze_rows": [
                {"symbol": "pub_fn", "l5_pointer": "L5#/functions/99"}
            ]
        }
        res_missing_idx = dvc.check_public_fn_freeze(rec_missing_idx, l5, l8)
        self.assertFalse(res_missing_idx["passed"])
        self.assertEqual(
            res_missing_idx["failures"][0]["error"], "unresolved_l5_function_pointer"
        )

    def test_existing_four_freeze_records_audit_and_generate(self) -> None:
        records_with_expected_match = [
            (
                "docs/governance/audits/tdd/os002-t2a-f04-projection-member-freeze-2026-10-28.json",
                True,
            ),
            (
                "docs/governance/audits/tdd/h009-f02a-function-pair-freeze-2026-10-28.json",
                False,
            ),
            (
                "docs/governance/audits/tdd/os002-t1c-f02-proposal-receiving-freeze-2026-10-28.json",
                True,
            ),
        ]
        for rpath, expected_match in records_with_expected_match:
            audit = dvc.audit_freeze_record(REPO_ROOT, rpath, use_creation_commit=True)
            self.assertEqual(
                audit["mechanical_match"],
                expected_match,
                msg=f"Expected mechanical_match={expected_match} for {rpath}, got {audit['comparison_with_existing_record']}",
            )
            cmp_sec = audit["comparison_with_existing_record"]
            self.assertTrue(cmp_sec["pins_match"])
            self.assertTrue(cmp_sec["pointers_resolved_match"])
            self.assertTrue(cmp_sec["head_entity_counts_match"])
            self.assertTrue(cmp_sec["verification_fields_match"])

        # os002-t2b has E1..E4 with L5#/... pointers but prose L8 references (l8_pointer_count == 0),
        # so CHK-L3-OBLIGATION-MAP must fail with empty_l5_or_l8_pointers (F1).
        t2b_path = "docs/governance/audits/tdd/os002-t2b-f04-original-correspondence-freeze-2026-10-28.json"
        t2b_audit = dvc.audit_freeze_record(
            REPO_ROOT, t2b_path, use_creation_commit=True
        )
        self.assertFalse(t2b_audit["mechanical_match"])
        t2b_obl = t2b_audit["checks"]["CHK-L3-OBLIGATION-MAP"]
        self.assertFalse(t2b_obl["passed"])
        self.assertEqual(len(t2b_obl["failures"]), 4)
        self.assertTrue(
            all(f["error"] == "empty_l5_or_l8_pointers" for f in t2b_obl["failures"])
        )

        # Also test generate_freeze_record on a minimal declaration skeleton
        h009_rec = json.loads(
            (
                REPO_ROOT
                / "docs/governance/audits/tdd/h009-f02a-function-pair-freeze-2026-10-28.json"
            ).read_text(encoding="utf-8")
        )
        skeleton = {
            "record_id": h009_rec["record_id"],
            "slice_id": h009_rec["slice_id"],
            "request_id": h009_rec["request_id"],
            "source_main": h009_rec["source_main"],
            "request_base_sha": h009_rec["source_main"],
            "path_aliases": h009_rec["path_aliases"],
            "independent_expectation_derivation": h009_rec[
                "independent_expectation_derivation"
            ],
            "function_freeze_rows": h009_rec["function_freeze_rows"],
            "head_entity_counts": {k: 0 for k in h009_rec["head_entity_counts"]},
        }
        rec_commit = dvc._file_last_commit(
            REPO_ROOT,
            "docs/governance/audits/tdd/h009-f02a-function-pair-freeze-2026-10-28.json",
        )
        generated = dvc.generate_freeze_record(
            REPO_ROOT,
            skeleton,
            base_rev=h009_rec["source_main"],
            head_rev=rec_commit,
        )
        self.assertEqual(generated["pins"], h009_rec["pins"])
        self.assertEqual(
            generated["head_entity_counts"], h009_rec["head_entity_counts"]
        )
        self.assertTrue(generated["pointer_resolution_summary"]["passed"])
        self.assertTrue(generated["negative_case_4way_verification"]["passed"])
        self.assertEqual(
            generated["negative_case_4way_verification"]["comparison_mode"],
            "legacy_casewise_four_layer",
        )
        self.assertEqual(
            generated["negative_case_4way_verification"]["parent_link_mode"],
            "legacy",
        )
        self.assertIn("negative_4way_parent_link_mode", generated["verification"])
        self.assertEqual(
            generated["negative_case_4way_verification"]["count_unit"],
            "negative_case_rows_per_layer",
        )
        self.assertIn(
            "negative_4way_comparison_scope",
            generated["verification"],
        )

    def test_existing_l8_forbidden_key_fails_full_freeze_aggregate(self) -> None:
        freeze_path = (
            "docs/governance/audits/tdd/h009-f02a-function-pair-freeze-2026-10-28.json"
        )
        audit = dvc.audit_freeze_record(
            REPO_ROOT, freeze_path, use_creation_commit=True
        )
        l8_path = dvc._load_json(REPO_ROOT, freeze_path)["path_aliases"]["L8"]
        base_l8 = dvc._load_json(REPO_ROOT, l8_path, audit["base_revision"])
        head_l8 = dvc._load_json(REPO_ROOT, l8_path, audit["evaluated_at_revision"])
        base_cap = dvc.check_ownership_cap(REPO_ROOT, l8_path, base_l8, layer="L8")
        head_cap = dvc.check_ownership_cap(REPO_ROOT, l8_path, head_l8, layer="L8")

        proc = subprocess.run(
            [
                sys.executable,
                str(Path(__file__).with_name("design_verification_checker.py")),
                "check-freeze",
                freeze_path,
                "--root",
                str(REPO_ROOT),
            ],
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
            check=False,
        )
        cli_report = json.loads(proc.stdout)

        self.assertEqual(
            {
                "base_seed_violation": any(
                    item["pointer"]
                    == "/condition_meaning_lookup_miss_oracle/reconstruction/seed"
                    for item in base_cap["failures"]
                ),
                "head_seed_violation": any(
                    item["pointer"]
                    == "/condition_meaning_lookup_miss_oracle/reconstruction/seed"
                    for item in head_cap["failures"]
                ),
                "added_forbidden_keys": audit["checks"]["CHK-OWNERSHIP-CAP-L8-DIFF"][
                    "added_forbidden_keys"
                ],
                "existing_violations": audit["checks"]["CHK-OWNERSHIP-CAP-L8-DIFF"][
                    "full_file_existing_violations"
                ],
                "mechanical_match": audit["mechanical_match"],
                "cli_all_mechanical_matched": cli_report["all_mechanical_matched"],
                "cli_returncode": proc.returncode,
            },
            {
                "base_seed_violation": True,
                "head_seed_violation": True,
                "added_forbidden_keys": [],
                "existing_violations": [
                    {
                        "check": "CHK-OWNERSHIP-CAP",
                        "layer": "L8",
                        "file": l8_path,
                        "pointer": "/condition_meaning_lookup_miss_oracle/reconstruction/seed",
                        "violation": "forbidden_key",
                        "key": "seed",
                    }
                ],
                "mechanical_match": False,
                "cli_all_mechanical_matched": False,
                "cli_returncode": 1,
            },
        )

    def test_chk_pair_bidir_id_resolves_design_ref_when_upstream_requirement_ref_coexists(
        self,
    ) -> None:
        l4_path = "docs/helix-brain/L4-basic-design/template-semantic-supply.json"
        l9_path = (
            "docs/helix-brain/L9-integration-verification/template-semantic-supply.json"
        )
        l5_path = "docs/helix-brain/L5-detail-design/template-semantic-supply.json"
        l8_path = "docs/helix-brain/L8-unit-verification/template-semantic-supply.json"

        l4_l9 = dvc.check_pair_bidir_id(
            REPO_ROOT, l4_path, l9_path, left_key="contracts", right_key="cases"
        )
        l5_l8 = dvc.check_pair_bidir_id(
            REPO_ROOT, l5_path, l8_path, left_key="contracts", right_key="cases"
        )
        self.assertTrue(l4_l9["passed"], f"Expected L4<->L9 pass, got: {l4_l9}")
        self.assertEqual(l4_l9["left_count"], 14)
        self.assertEqual(l4_l9["right_count"], 14)
        self.assertEqual(l4_l9["failures"], [])
        self.assertTrue(l5_l8["passed"], f"Expected L5<->L8 pass, got: {l5_l8}")
        self.assertEqual(l5_l8["left_count"], 14)
        self.assertEqual(l5_l8["right_count"], 14)
        self.assertEqual(l5_l8["failures"], [])

        # Counterexample: mismatched design_ref must still fail even when requirement_ref is present
        bad_l9 = dvc._load_json(REPO_ROOT, l9_path)
        bad_l9["cases"][0]["design_ref"] = "HELIXBRAIN-L4-032-MISMATCH"
        bad_res = dvc.check_pair_bidir_id(
            REPO_ROOT,
            l4_path,
            l9_path,
            left_data=dvc._load_json(REPO_ROOT, l4_path),
            right_data=bad_l9,
            left_key="contracts",
            right_key="cases",
        )
        self.assertFalse(bad_res["passed"])
        self.assertTrue(
            any(f["error"] == "missing_reverse_link" for f in bad_res["failures"])
        )

    def test_chk_ownership_cap_scopes_same_invocation_to_l8l9_and_passes_brain032_l4(
        self,
    ) -> None:
        l4_path = "docs/helix-brain/L4-basic-design/template-semantic-supply.json"
        l4_cap = dvc.check_ownership_cap(REPO_ROOT, l4_path, layer="L4")
        self.assertTrue(l4_cap["passed"], f"Expected BRAIN032 L4 pass, got: {l4_cap}")
        self.assertEqual(l4_cap["failures"], [])

        # Counterexample 1: same_invocation in L8/L9 must still fail CHK-OWNERSHIP-CAP-L8L9
        l8_with_same_inv = {
            "cases": [{"id": "C1", "recipe_contract": {"same_invocation": "forbidden"}}]
        }
        l8_cap = dvc.check_ownership_cap(
            REPO_ROOT,
            "docs/helix-brain/L8-unit-verification/template-semantic-supply.json",
            data=l8_with_same_inv,
            layer="L8",
        )
        self.assertFalse(l8_cap["passed"])
        self.assertEqual(len(l8_cap["failures"]), 1)
        self.assertEqual(l8_cap["failures"][0]["key"], "same_invocation")

        # Counterexample 2: fixture_patch / expected_return in L4 must still fail CHK-OWNERSHIP-CAP-L3L6
        l4_with_fixture = {"contracts": [{"id": "B1", "fixture_patch": []}]}
        l4_bad_cap = dvc.check_ownership_cap(
            REPO_ROOT, l4_path, data=l4_with_fixture, layer="L4"
        )
        self.assertFalse(l4_bad_cap["passed"])
        self.assertEqual(l4_bad_cap["failures"][0]["key"], "fixture_patch")

    def test_chk_pair_bidir_id_selects_layer_specific_reverse_ref_when_l4_and_l5_refs_coexist(
        self,
    ) -> None:
        l5_data = {
            "contracts": [
                {
                    "id": "HELIXLABO-L5-001-F01",
                    "oracle_ref": "LABO001-F01-CASE-01",
                }
            ],
            "completion": {"contracts_total": 1},
        }
        l8_data = {
            "cases": [
                {
                    "id": "LABO001-F01-CASE-01",
                    "requirement_ref": "HELIXLABO-L3-001-F01",
                    "l4_contract_ref": "HELIXLABO-L4-001-F01",
                    "l5_contract_ref": "HELIXLABO-L5-001-F01",
                }
            ],
            "completion": {"cases_total": 1},
        }
        res_l5 = dvc.check_pair_bidir_id(
            REPO_ROOT,
            "docs/helix-labo/L5-detail-design/authorized-observation-aggregation.json",
            "docs/helix-labo/L8-unit-verification/authorized-observation-aggregation.json",
            left_data=l5_data,
            right_data=l8_data,
        )
        self.assertTrue(
            res_l5["passed"],
            f"Expected L5<->L8 pass when l4_contract_ref and l5_contract_ref coexist, got: {res_l5}",
        )
        self.assertEqual(res_l5["failures"], [])

        # Counterexample: if left is L4, it must pick l4_contract_ref and fail against L5 IDs
        res_as_l4 = dvc.check_pair_bidir_id(
            REPO_ROOT,
            "docs/helix-labo/L4-basic-design/authorized-observation-aggregation.json",
            "docs/helix-labo/L8-unit-verification/authorized-observation-aggregation.json",
            left_data=l5_data,
            right_data=l8_data,
        )
        self.assertFalse(res_as_l4["passed"])
        self.assertTrue(
            any(
                f["error"] == "missing_reverse_link" and f["pointer"] == "/cases/0"
                for f in res_as_l4["failures"]
            )
        )


if __name__ == "__main__":
    unittest.main()
