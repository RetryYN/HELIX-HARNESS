"""FN0 public input validation expectations from current L7/L8 contracts."""

import copy
import hashlib
import json
from pathlib import Path
import sys
import unittest

UNIT_ROOT = Path(__file__).resolve().parents[1]
FIXTURE_PATH = UNIT_ROOT / "tests" / "fixtures" / "application_input.json"
sys.path.insert(0, str(UNIT_ROOT / "src"))
from product_template_application import validate_application_input

with FIXTURE_PATH.open(encoding="utf-8") as stream:
    _FIXTURE = json.load(stream)


def _ref_identity(ref):
    return ref.get("identity") if isinstance(ref, dict) else None


def _rebuild_source_graph(raw):
    """Apply only CORE-FIXTURE-SOURCE-REBUILD-01 from the pinned L8 recipe."""
    for source in raw["sources"]:
        source_identity = _ref_identity(source["ref"])
        records = []
        for collection, rows in raw.items():
            if not isinstance(rows, list):
                continue
            for row in rows:
                if not isinstance(row, dict):
                    continue
                source_ref = row.get("source_ref")
                if _ref_identity(source_ref) != source_identity:
                    continue
                records.append(
                    {
                        "collection": collection,
                        "ref": copy.deepcopy(row["ref"]),
                        "payload": {
                            key: copy.deepcopy(value)
                            for key, value in row.items()
                            if key != "source_ref"
                        },
                    }
                )
        body = copy.deepcopy(source["body"])
        body["records"] = records
        content = json.dumps(body, ensure_ascii=False, separators=(",", ":"))
        source["body"] = body
        source["content_bytes"] = content
        digest = hashlib.sha256(content.encode("utf-8")).hexdigest()
        source["ref"]["sha256"] = digest
        qualification_ref = source.get("qualification_ref")
        for qualification in raw["qualifications"]:
            if qualification.get("ref") != qualification_ref:
                continue
            qualification["subject_ref"]["sha256"] = digest
            qualification["subject_sha256"] = digest


def _set_path(root, path, value):
    parent = root
    for part in path[:-1]:
        parent = parent[part]
    parent[path[-1]] = copy.deepcopy(value)


def _remove_path(root, path):
    parent = root
    for part in path[:-1]:
        parent = parent[part]
    del parent[path[-1]]


def _input_for_recipe(recipe_id):
    recipe = next(row for row in _FIXTURE["recipes"] if row["id"] == recipe_id)
    if "literal_raw_input" in recipe:
        return copy.deepcopy(recipe["literal_raw_input"])
    raw = copy.deepcopy(_FIXTURE["normal_input"])
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


def _fixture_normal_input():
    raw = copy.deepcopy(_FIXTURE["normal_input"])
    _rebuild_source_graph(raw)
    return raw


class TestValidateApplicationInput(unittest.TestCase):
    def _call_expected(self, case_id, expectation, raw):
        try:
            return validate_application_input(raw)
        except NotImplementedError as exc:
            self.fail(
                f"{case_id}: {expectation}; public FN0 reached its declared bootstrap stop: {exc}"
            )

    def _assert_result_shape(self, result):
        self.assertIsInstance(result, dict)
        self.assertEqual(set(result), {"input", "input_issues", "unusable_source_refs"})
        self.assertIsInstance(result["input_issues"], list)
        self.assertIsInstance(result["unusable_source_refs"], list)

    def _assert_normal_control(self):
        normal = _fixture_normal_input()
        before = copy.deepcopy(normal)
        result = self._call_expected(
            "NORMAL-validate_application_input",
            "有効な合成RawValueをdecodeし元inputを保持する",
            normal,
        )
        self._assert_result_shape(result)
        self.assertEqual(result["input"], normal)
        self.assertEqual(result["input_issues"], [])
        self.assertEqual(result["unusable_source_refs"], [])
        self.assertEqual(normal, before)

    def test_add01_scalar_root_is_rejected_without_coercion(self):
        raw = _input_for_recipe("CORE-ADD-INPUT-01")
        before = copy.deepcopy(raw)
        result = self._call_expected(
            "HARNESS-L8-009-ADD-01",
            "scalar root yields input=null and a located InputIssue",
            raw,
        )
        self._assert_result_shape(result)
        self.assertIsNone(result["input"])
        self.assertTrue(result["input_issues"])
        self.assertEqual(result["input_issues"][0]["locator"], "")
        self.assertTrue(result["input_issues"][0]["reason"])
        self.assertIsNone(result["input_issues"][0]["source_ref"])
        self.assertEqual(raw, before)
        self._assert_normal_control()

    def test_add02_explicit_null_is_preserved_as_raw_meaning(self):
        raw = _input_for_recipe("CORE-ADD-INPUT-02")
        before = copy.deepcopy(raw)
        result = self._call_expected(
            "HARNESS-L8-009-ADD-02",
            "decodeable axis value=null remains present and is not a shape issue",
            raw,
        )
        self._assert_result_shape(result)
        self.assertEqual(result["input"], raw)
        self.assertEqual(result["input_issues"], [])
        self.assertTrue(
            any(
                row.get("axis") == "kind" and row.get("value", object()) is None
                for row in raw["axis_facts"]
            )
        )
        self.assertEqual(raw, before)
        self._assert_normal_control()

    def test_add03_missing_universe_is_not_defaulted(self):
        raw = _input_for_recipe("CORE-ADD-INPUT-03")
        before = copy.deepcopy(raw)
        result = self._call_expected(
            "HARNESS-L8-009-ADD-03",
            "missing universes remains absent instead of becoming an empty collection",
            raw,
        )
        self._assert_result_shape(result)
        self.assertEqual(result["input"], raw)
        self.assertNotIn("universes", result["input"])
        self.assertEqual(result["input_issues"], [])
        self.assertEqual(raw, before)
        self._assert_normal_control()

    def test_add04_body_bytes_mismatch_is_localized(self):
        raw = _input_for_recipe("CORE-ADD-INPUT-04")
        before = copy.deepcopy(raw)
        source_ref = copy.deepcopy(raw["sources"][0]["ref"])
        unrelated_ref = copy.deepcopy(raw["sources"][1]["ref"])
        result = self._call_expected(
            "HARNESS-L8-009-ADD-04",
            "body/bytes mismatch marks its source unusable while preserving raw input",
            raw,
        )
        self._assert_result_shape(result)
        self.assertEqual(result["input"], raw)
        self.assertIn(source_ref, result["unusable_source_refs"])
        self.assertNotIn(unrelated_ref, result["unusable_source_refs"])
        self.assertEqual(raw, before)
        self._assert_normal_control()

    def test_add05_missing_qualification_root_does_not_use_digest_as_trust(self):
        raw = _input_for_recipe("CORE-ADD-INPUT-05")
        before = copy.deepcopy(raw)
        source_ref = copy.deepcopy(raw["sources"][0]["ref"])
        unrelated_ref = copy.deepcopy(raw["sources"][1]["ref"])
        result = self._call_expected(
            "HARNESS-L8-009-ADD-05",
            "missing qualification root stays unqualified despite matching digest",
            raw,
        )
        self._assert_result_shape(result)
        self.assertEqual(result["input"], raw)
        self.assertIn(source_ref, result["unusable_source_refs"])
        self.assertNotIn(unrelated_ref, result["unusable_source_refs"])
        self.assertEqual(raw, before)
        self._assert_normal_control()

    def test_add06_wrong_scope_qualification_stays_unqualified_locally(self):
        raw = _input_for_recipe("CORE-ADD-INPUT-06")
        before = copy.deepcopy(raw)
        source_ref = copy.deepcopy(raw["sources"][0]["ref"])
        unrelated_ref = copy.deepcopy(raw["sources"][1]["ref"])
        result = self._call_expected(
            "HARNESS-L8-009-ADD-06",
            "wrong-scope qualification is not accepted and unrelated source remains represented",
            raw,
        )
        self._assert_result_shape(result)
        self.assertEqual(result["input"], raw)
        self.assertIn(source_ref, result["unusable_source_refs"])
        self.assertNotIn(unrelated_ref, result["unusable_source_refs"])
        self.assertIn(unrelated_ref, [row["ref"] for row in result["input"]["sources"]])
        self.assertEqual(raw, before)
        self._assert_normal_control()

    def test_add07_opposing_qualified_facts_are_not_deduplicated(self):
        raw = _input_for_recipe("CORE-ADD-INPUT-07")
        before = copy.deepcopy(raw)
        result = self._call_expected(
            "HARNESS-L8-009-ADD-07",
            "opposing same-subject/revision facts remain available for conflict evaluation",
            raw,
        )
        self._assert_result_shape(result)
        self.assertEqual(result["input"], raw)
        self.assertEqual(len(result["input"]["axis_facts"]), len(raw["axis_facts"]))
        self.assertEqual(result["input_issues"], [])
        self.assertEqual(raw, before)
        self._assert_normal_control()


if __name__ == "__main__":
    unittest.main()
