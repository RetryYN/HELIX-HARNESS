"""H009 FN8 expectations derived from the frozen L4/L9/L5/L8 pair."""

import copy
import json
from pathlib import Path
import sys
import unittest

UNIT_ROOT = Path(__file__).resolve().parents[1]
FIXTURE_PATH = UNIT_ROOT / "tests" / "fixtures" / "application_input.json"
if str(UNIT_ROOT / "src") not in sys.path:
    sys.path.insert(0, str(UNIT_ROOT / "src"))

import product_template_application as pta  # noqa: E402
from test_application_input import _fixture_normal_input, _rebuild_source_graph  # noqa: E402
from test_compare_selected_knowledge import _rename_all_identifiers  # noqa: E402

with FIXTURE_PATH.open("r", encoding="utf-8") as stream:
    _FIXTURE = json.load(stream)


def _replace_exact_value(value, old_value, new_value):
    if value == old_value:
        return copy.deepcopy(new_value)
    if isinstance(value, dict):
        return {
            key: _replace_exact_value(item, old_value, new_value)
            for key, item in value.items()
        }
    if isinstance(value, list):
        return [_replace_exact_value(item, old_value, new_value) for item in value]
    return value


def _different_binding_snapshot(raw, template_suffix, obligation_suffix, scope=None):
    variant = copy.deepcopy(raw)
    old_scope = copy.deepcopy(variant["binding"]["product_scope"])
    new_scope = copy.deepcopy(old_scope if scope is None else scope)
    if new_scope != old_scope:
        variant = _replace_exact_value(variant, old_scope, new_scope)
    old_template_ref = copy.deepcopy(variant["binding"]["template_ref"])
    new_template_ref = copy.deepcopy(old_template_ref)
    new_template_ref["identity"] = f"{old_template_ref['identity']}-{template_suffix}"
    variant = _replace_exact_value(variant, old_template_ref, new_template_ref)
    old_obligation_ref = copy.deepcopy(variant["obligations"][0]["ref"])
    new_obligation_ref = copy.deepcopy(old_obligation_ref)
    new_obligation_ref["identity"] = (
        f"{old_obligation_ref['identity']}-{obligation_suffix}"
    )
    variant = _replace_exact_value(variant, old_obligation_ref, new_obligation_ref)
    _rebuild_source_graph(variant)
    return variant


def _build_context(raw):
    validated = pta.validate_application_input(raw)
    required_axes = pta.compare_required_axes({"validated": validated})
    candidate_universe = pta.compare_candidate_universe(
        {"validated": validated, "compare_required_axes": required_axes}
    )
    applicability = pta.compare_applicability({"validated": validated})
    kind_trace = pta.compare_kind_obligation_trace(
        {"validated": validated, "compare_applicability": applicability}
    )
    return {
        "validated": validated,
        "compare_candidate_universe": candidate_universe,
        "compare_applicability": applicability,
        "compare_kind_obligation_trace": kind_trace,
    }


def _compare_context(context):
    fn = getattr(pta, "compare_semantic_equivalence", None)
    if not callable(fn):
        raise AssertionError(
            "compare_semantic_equivalence must be exported from product_template_application"
        )
    return fn(context), context


def _compare(raw):
    return _compare_context(_build_context(raw))


def _input_for_recipe(recipe_id):
    recipe = next(row for row in _FIXTURE["recipes"] if row["id"] == recipe_id)
    base_ref = recipe["base_input_fixture_ref"]
    if base_ref != "CORE-NORMAL-UNIT-REQUIRED":
        raise AssertionError(f"unsupported fixture base for {recipe_id}: {base_ref}")
    raw = copy.deepcopy(_FIXTURE["normal_input"])
    for collection, value in recipe.get("input_overrides", {}).items():
        raw[collection] = copy.deepcopy(value)
    if recipe.get("source_preparation") == "CORE-FIXTURE-SOURCE-REBUILD-01":
        _rebuild_source_graph(raw)
    if recipe.get("final_input_changes"):
        raise AssertionError(f"unhandled final input changes for {recipe_id}")
    return raw


class TestCompareSemanticEquivalence(unittest.TestCase):
    """Check FN8's L5 material against the independent L4/L9 and L8 contract."""

    def _assert_material(self, comparison, expected_refs):
        self.assertEqual(
            set(comparison),
            {
                "producer_symbol",
                "input_binding",
                "original_axes",
                "findings",
                "material",
            },
        )
        self.assertEqual(comparison["producer_symbol"], "compare_semantic_equivalence")
        self.assertEqual(comparison["original_axes"], [])
        self.assertIsInstance(comparison["findings"], list)
        material = comparison["material"]
        self.assertEqual(
            set(material),
            {
                "comparison_state",
                "obligation_refs",
                "comparison_basis_refs",
                "missing_obligation_refs",
                "extra_obligation_refs",
                "not_evaluated_refs",
            },
        )
        self.assertEqual(material["comparison_state"], "not_evaluated")
        self.assertEqual(material["obligation_refs"], expected_refs)
        self.assertEqual(material["comparison_basis_refs"], [])
        self.assertEqual(material["missing_obligation_refs"], [])
        self.assertEqual(material["extra_obligation_refs"], [])
        self.assertEqual(material["not_evaluated_refs"], expected_refs)

    def test_single_snapshot_preserves_original_obligations_as_not_evaluated(self):
        raw = _fixture_normal_input()
        before = copy.deepcopy(raw)
        expected_refs = [copy.deepcopy(row["ref"]) for row in raw["obligations"]]

        comparison, _context = _compare(raw)

        self._assert_material(comparison, expected_refs)
        self.assertEqual(comparison["findings"], [])
        self.assertEqual(raw, before, "FN8 is effect=none")

    def test_metadata_only_change_and_bulk_identifier_rename_do_not_change_result_state(
        self,
    ):
        baseline = _fixture_normal_input()
        variant = _input_for_recipe("CORE-ADD-INPUT-20")
        renamed = _rename_all_identifiers(copy.deepcopy(variant))
        _rebuild_source_graph(renamed)

        recipe_provenance = _FIXTURE["source_provenance"]["fn8_add20_recipe_reference"]
        self.assertEqual(
            recipe_provenance["source_revision"],
            "d4d68f1354153682b7b6e41c99bbdf949279e5c0",
        )
        self.assertEqual(
            recipe_provenance["source_path"],
            "docs/helix-harness/L8-unit-verification/product-template-application.json",
        )
        self.assertEqual(
            recipe_provenance["source_pointer"],
            "/fixture_contract/additional_input_recipes/16",
        )
        recipe_index = next(
            index
            for index, row in enumerate(_FIXTURE["recipes"])
            if row["id"] == "CORE-ADD-INPUT-20"
        )
        self.assertEqual(
            recipe_provenance["fixture_pointer"], f"/recipes/{recipe_index}"
        )
        self.assertEqual(
            recipe_provenance["source_whole_file_sha256"],
            "2473e4c32d5c75b2ef48be662f27ba9e1710b6767ce9110f66883761df967776",
        )
        add20_case_provenance = _FIXTURE["source_provenance"][
            "fn8_add20_case_reference"
        ]
        self.assertEqual(
            add20_case_provenance["source_pointer"], "/additional_unit_cases/19"
        )
        expected_variant = copy.deepcopy(baseline)
        expected_variant["nonsemantic_metadata"] = copy.deepcopy(
            _FIXTURE["recipes"][recipe_index]["input_overrides"]["nonsemantic_metadata"]
        )
        self.assertEqual(variant, expected_variant)
        original_result, _ = _compare(baseline)
        variant_result, _ = _compare(variant)
        renamed_result, _ = _compare(renamed)

        original_material = original_result["material"]
        self.assertEqual(original_result["findings"], [])
        self.assertEqual(variant_result["findings"], [])
        self.assertEqual(renamed_result["findings"], [])
        self.assertEqual(variant_result["material"], original_material)
        self.assertEqual(
            renamed_result["material"]["comparison_state"],
            original_material["comparison_state"],
        )
        self.assertEqual(
            len(renamed_result["material"]["obligation_refs"]),
            len(original_material["obligation_refs"]),
        )
        renamed_expected_refs = [row["ref"] for row in renamed["obligations"]]
        self.assertEqual(
            renamed_result["material"]["obligation_refs"], renamed_expected_refs
        )
        self.assertEqual(
            renamed_result["material"]["not_evaluated_refs"], renamed_expected_refs
        )
        self.assertEqual(
            len(renamed_result["material"]["not_evaluated_refs"]),
            len(original_material["not_evaluated_refs"]),
        )
        self.assertNotEqual(
            renamed_result["material"]["obligation_refs"],
            original_material["obligation_refs"],
            "the renamed snapshot must retain its own refs instead of matching fixture IDs",
        )

    def test_ai_name_only_change_does_not_change_obligation_material(self):
        baseline = _fixture_normal_input()
        variant = copy.deepcopy(baseline)
        variant["nonsemantic_metadata"]["ai_name"] = "single-field-ai-variant"

        baseline_result, _ = _compare(baseline)
        variant_result, _ = _compare(variant)

        self.assertEqual(baseline_result["findings"], [])
        self.assertEqual(variant_result["findings"], [])
        self.assertEqual(
            variant_result["input_binding"], baseline_result["input_binding"]
        )
        self.assertEqual(variant_result["material"], baseline_result["material"])

    def test_language_only_change_does_not_change_obligation_material(self):
        baseline = _fixture_normal_input()
        variant = copy.deepcopy(baseline)
        variant["nonsemantic_metadata"]["language_name"] = (
            "single-field-language-variant"
        )

        baseline_result, _ = _compare(baseline)
        variant_result, _ = _compare(variant)

        self.assertEqual(baseline_result["findings"], [])
        self.assertEqual(variant_result["findings"], [])
        self.assertEqual(
            variant_result["input_binding"], baseline_result["input_binding"]
        )
        self.assertEqual(variant_result["material"], baseline_result["material"])

    def test_different_template_or_scope_producer_material_does_not_cross_bind(self):
        first = _fixture_normal_input()
        template_variant = _different_binding_snapshot(
            first, "template-variant", "obligation-variant"
        )
        first_scope = copy.deepcopy(first["binding"]["product_scope"])
        other_scope = copy.deepcopy(first_scope)
        other_scope["product"] = f"{first_scope['product']}-other-scope"
        scope_variant = _different_binding_snapshot(
            first, "scope-template", "scope-obligation", scope=other_scope
        )

        first_result, first_context = _compare(first)
        for foreign in (template_variant, scope_variant):
            with self.subTest(scope=foreign["binding"]["product_scope"]):
                foreign_result, foreign_context = _compare(foreign)
                foreign_refs = [row["ref"] for row in foreign["obligations"]]
                first_refs = [row["ref"] for row in first["obligations"]]
                self.assertNotEqual(first_refs, foreign_refs)
                self.assertNotEqual(
                    first["binding"]["template_ref"],
                    foreign["binding"]["template_ref"],
                )
                self.assertEqual(
                    foreign_context["compare_kind_obligation_trace"]["input_binding"],
                    foreign["binding"],
                )
                self.assertEqual(
                    foreign_result["material"]["obligation_refs"], foreign_refs
                )

                # Cross producer results from another binding. They are not evidence
                # for this immutable input and must not contribute foreign refs.
                mixed_context = {
                    "validated": first_context["validated"],
                    "compare_candidate_universe": foreign_context[
                        "compare_candidate_universe"
                    ],
                    "compare_applicability": foreign_context["compare_applicability"],
                    "compare_kind_obligation_trace": foreign_context[
                        "compare_kind_obligation_trace"
                    ],
                }
                mixed_result, _ = _compare_context(mixed_context)
                self.assertEqual(mixed_result["input_binding"], first["binding"])
                self.assertEqual(mixed_result["material"], first_result["material"])
                for key in (
                    "obligation_refs",
                    "comparison_basis_refs",
                    "missing_obligation_refs",
                    "extra_obligation_refs",
                    "not_evaluated_refs",
                ):
                    self.assertTrue(
                        all(
                            ref not in foreign_refs
                            for ref in mixed_result["material"][key]
                        ),
                        f"foreign {key} leaked across bindings",
                    )

    def test_obligation_ref_order_and_duplicate_occurrences_are_preserved(self):
        raw = _fixture_normal_input()
        original = copy.deepcopy(raw["obligations"][0])
        duplicate = copy.deepcopy(original)
        raw["obligations"] = [duplicate, original, copy.deepcopy(original)]
        raw["templates"][0]["obligation_refs"] = [
            copy.deepcopy(original["ref"]),
            copy.deepcopy(original["ref"]),
            copy.deepcopy(original["ref"]),
        ]
        _rebuild_source_graph(raw)
        expected_refs = [copy.deepcopy(row["ref"]) for row in raw["obligations"]]

        comparison, context = _compare(raw)

        self.assertEqual(
            context["compare_kind_obligation_trace"]["material"]["obligations"],
            raw["obligations"],
        )
        self._assert_material(comparison, expected_refs)
        self.assertEqual(
            comparison["material"]["obligation_refs"][0],
            comparison["material"]["obligation_refs"][2],
        )

    def test_validator_input_issue_locators_are_retained_in_fn8_stop(self):
        raw = _fixture_normal_input()
        raw["obligations"][0]["ref"]["identity"] = 42
        raw["obligations"][0]["ref"]["owner"] = False

        validated = pta.validate_application_input(raw)

        self.assertIsNone(validated["input"])
        locators = [issue["locator"] for issue in validated["input_issues"]]
        self.assertEqual(
            locators,
            ["/obligations/0/ref/identity", "/obligations/0/ref/owner"],
        )
        compare_fn = getattr(pta, "compare_semantic_equivalence", None)
        self.assertTrue(
            callable(compare_fn),
            "FN8 public function is required before asserting retained locators",
        )
        with self.assertRaises(NotImplementedError) as raised:
            compare_fn({"validated": validated})
        reason = str(raised.exception)
        for locator in locators:
            self.assertIn(locator, reason)


if __name__ == "__main__":
    unittest.main()
