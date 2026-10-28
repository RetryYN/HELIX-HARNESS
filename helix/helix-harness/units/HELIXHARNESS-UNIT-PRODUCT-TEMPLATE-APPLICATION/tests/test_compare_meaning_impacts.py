"""Unit tests for compare_meaning_impacts (HARNESS-L5-009-compare_meaning_impacts / FN7)."""

import copy
import hashlib
import json
from pathlib import Path
import sys
import unittest

UNIT_DIR = Path(__file__).resolve().parents[1]
SRC_DIR = UNIT_DIR / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from application_required_axes import compare_required_axes  # noqa: E402
from application_validation import validate_application_input  # noqa: E402
import product_template_application as pta  # noqa: E402
from test_application_input import _rebuild_source_graph  # noqa: E402

FIXTURE_PATH = Path(__file__).resolve().parent / "fixtures" / "application_input.json"
with FIXTURE_PATH.open("r", encoding="utf-8") as _f:
    FIXTURE_DATA = json.load(_f)


def _resolve_recipe_raw(recipe_id):
    if recipe_id == "CORE-NORMAL-UNIT-REQUIRED":
        return copy.deepcopy(FIXTURE_DATA["normal_input"])
    recipes = {r["id"]: r for r in FIXTURE_DATA["recipes"]}
    recipe = recipes[recipe_id]
    base_ref = recipe.get("base_input_fixture_ref") or "CORE-NORMAL-UNIT-REQUIRED"
    raw = _resolve_recipe_raw(base_ref)
    for k, v in (recipe.get("input_overrides") or {}).items():
        raw[k] = copy.deepcopy(v)
    if recipe.get("source_preparation") == "CORE-FIXTURE-SOURCE-REBUILD-01":
        _rebuild_source_graph(raw)
    return raw


def _rename_id(val, prefix="id"):
    return f"{prefix}-" + hashlib.sha256(val.encode("utf-8")).hexdigest()[:12]


def _rename_all_identifiers(obj, prefix="id"):
    """Recursively obfuscate all synthetic/fixture identifiers so no literal substring survives."""
    if isinstance(obj, dict):
        out = {}
        for k, v in obj.items():
            if k in ("identity", "owner", "actor", "decider"):
                out[k] = _rename_id(v, prefix) if isinstance(v, str) else v
            elif k in (
                "field",
                "template",
                "application_contract",
                "subject",
            ) and isinstance(v, str):
                out[k] = _rename_id(v, prefix)
            else:
                out[k] = _rename_all_identifiers(v, prefix)
        return out
    if isinstance(obj, list):
        return [_rename_all_identifiers(x, prefix) for x in obj]
    return obj


def _same_ref_core(left, right):
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    return (
        left.get("identity") == right.get("identity")
        and left.get("revision") == right.get("revision")
        and left.get("scope") == right.get("scope")
        and left.get("owner") == right.get("owner")
        and left.get("source_locator") == right.get("source_locator")
    )


class TestCompareMeaningImpacts(unittest.TestCase):
    """Red->Green unit tests for HARNESS-L5-009-compare_meaning_impacts."""

    @classmethod
    def setUpClass(cls):
        cls.fixture_data = FIXTURE_DATA
        cls.f07_negative_cases = {
            c["id"]: c for c in cls.fixture_data["f07_negative_cases"]
        }
        cls.f08_negative_cases = {
            c["id"]: c for c in cls.fixture_data["f08_negative_cases"]
        }

    def _run_meaning_impacts(self, raw_input):
        snapshot = copy.deepcopy(raw_input)
        validated = validate_application_input(raw_input)
        req_axes = compare_required_axes({"validated": validated})
        fn = getattr(pta, "compare_meaning_impacts", None)
        self.assertIsNotNone(
            fn,
            "compare_meaning_impacts must be exported from product_template_application",
        )
        res = fn(
            {
                "validated": validated,
                "compare_required_axes": req_axes,
            }
        )
        self.assertEqual(
            raw_input,
            snapshot,
            "compare_meaning_impacts must be effect=none and never mutate input",
        )
        return res, validated, req_axes

    def _apply_mutation(self, neg_case):
        cid = neg_case["id"]
        val = neg_case["typed_mutation"]["synthetic_value"]

        if cid in ("HARNESS-L8-009-F07-NEG-01", "HARNESS-L8-009-F07-NEG-02"):
            raw = _resolve_recipe_raw("CORE-SUPPORT-IMPACT-FOUR")
            consumer_ref = copy.deepcopy(raw["consumers"][0]["ref"])
            old_tmpl_ref = copy.deepcopy(raw["consumers"][0]["used_template_ref"])
            if cid == "HARNESS-L8-009-F07-NEG-01":
                old_tmpl_ref["source_locator"] = "templates/renamed_template.json"
            raw.setdefault("claims", []).append(
                {
                    "ref": copy.deepcopy(raw["binding"]["application_contract_ref"]),
                    "subject_ref": consumer_ref,
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["kind"],
                    "proposed_value": {"basis": val["basis"]},
                    "basis_refs": [old_tmpl_ref],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F07-NEG-03":
            raw = _resolve_recipe_raw("CORE-ADD-INPUT-19")
            view_delta_ref = copy.deepcopy(raw["meaning_deltas"][0]["ref"])
            raw.setdefault("claims", []).append(
                {
                    "ref": copy.deepcopy(raw["binding"]["application_contract_ref"]),
                    "subject_ref": view_delta_ref,
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["claim_kind"],
                    "proposed_value": {
                        "facet": val["facet"],
                        "same_semantic_content": val["same_semantic_content"],
                    },
                    "basis_refs": [view_delta_ref],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F07-NEG-04":
            raw = _resolve_recipe_raw("CORE-SUPPORT-IMPACT-FOUR")
            raw["impact_evidence"][0]["affected"] = val["affected"]
            raw["impact_evidence"] = [raw["impact_evidence"][0]]
            consumer_ref = copy.deepcopy(raw["consumers"][0]["ref"])
            raw.setdefault("claims", []).append(
                {
                    "ref": copy.deepcopy(raw["binding"]["application_contract_ref"]),
                    "subject_ref": consumer_ref,
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["claim_kind"],
                    "proposed_value": {"status": "unaffected"},
                    "basis_refs": [copy.deepcopy(raw["impact_evidence"][0]["ref"])],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F07-NEG-05":
            raw = _resolve_recipe_raw("CORE-ADD-INPUT-19")
            raw["impact_evidence"][0]["binding"]["product_scope"]["product"] = val
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F07-NEG-06":
            raw = _resolve_recipe_raw("CORE-SUPPORT-IMPACT-FOUR")
            consumer_ref = copy.deepcopy(raw["consumers"][0]["ref"])
            new_tmpl_ref = copy.deepcopy(raw["meaning_deltas"][0]["new_template_ref"])
            raw.setdefault("claims", []).append(
                {
                    "ref": copy.deepcopy(raw["binding"]["application_contract_ref"]),
                    "subject_ref": consumer_ref,
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["kind"],
                    "proposed_value": {"basis": val["basis"]},
                    "basis_refs": [new_tmpl_ref],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F07-NEG-07":
            raw = _resolve_recipe_raw("CORE-SUPPORT-IMPACT-FOUR")
            non_completion_refs = [
                copy.deepcopy(d["ref"])
                for d in raw["meaning_deltas"]
                if d.get("facet") != val["omit_facet"]
            ]
            raw.setdefault("claims", []).append(
                {
                    "ref": copy.deepcopy(raw["binding"]["application_contract_ref"]),
                    "subject_ref": copy.deepcopy(raw["consumers"][0]["ref"]),
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["kind"],
                    "proposed_value": {"omit_facet": val["omit_facet"]},
                    "basis_refs": non_completion_refs,
                }
            )
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F08-NEG-01":
            raw = _resolve_recipe_raw("CORE-SUPPORT-IMPACT-FOUR")
            foreign_consumer = copy.deepcopy(raw["consumers"][0])
            foreign_consumer["ref"]["identity"] = "consumer-foreign-Q"
            foreign_consumer["ref"]["scope"]["product"] = "SYNTHETIC-Q"
            foreign_consumer["binding"]["product_scope"]["product"] = "SYNTHETIC-Q"
            raw["consumers"].append(foreign_consumer)
            raw.setdefault("claims", []).append(
                {
                    "ref": copy.deepcopy(raw["binding"]["application_contract_ref"]),
                    "subject_ref": copy.deepcopy(foreign_consumer["ref"]),
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["kind"],
                    "proposed_value": {"basis": val["basis"]},
                    "basis_refs": [copy.deepcopy(raw["meaning_deltas"][0]["ref"])],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        if cid in (
            "HARNESS-L8-009-F08-NEG-02",
            "HARNESS-L8-009-F08-NEG-03",
            "HARNESS-L8-009-F08-NEG-04",
        ):
            raw = _resolve_recipe_raw("CORE-SUPPORT-IMPACT-FOUR")
            subj_ref = (
                copy.deepcopy(raw["consumers"][0]["obligation_refs"][0])
                if cid == "HARNESS-L8-009-F08-NEG-03"
                else copy.deepcopy(raw["consumers"][0]["ref"])
            )
            raw.setdefault("claims", []).append(
                {
                    "ref": copy.deepcopy(raw["binding"]["application_contract_ref"]),
                    "subject_ref": subj_ref,
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": val["actor"],
                    "kind": val["kind"],
                    "proposed_value": {"updated_by": val["actor"]},
                    "basis_refs": [copy.deepcopy(raw["meaning_deltas"][0]["ref"])],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        raise ValueError(f"Unknown negative case: {cid}")

    def test_normal_compare_meaning_impacts_oracle(self):
        """HARNESS-L8-009-NORMAL-compare_meaning_impacts on CORE-NORMAL-UNIT-REQUIRED."""
        oracle = self.fixture_data["compare_meaning_impacts_oracle"]
        self.assertEqual(oracle["id"], "HARNESS-L8-009-NORMAL-compare_meaning_impacts")
        self.assertEqual(
            oracle["function_ref"], "HARNESS-L5-009-compare_meaning_impacts"
        )
        raw = _resolve_recipe_raw(oracle["input_fixture_ref"])
        res, _, _ = self._run_meaning_impacts(raw)

        self.assertEqual(res["producer_symbol"], "compare_meaning_impacts")
        self.assertEqual(res["input_binding"], raw["binding"])
        self.assertEqual(res["original_axes"], [])
        self.assertEqual(res["findings"], [])

        mat = res["material"]
        self.assertEqual(
            set(mat.keys()),
            {
                "operation_selected",
                "delta_refs",
                "impact_evidence_refs",
                "affected_consumer_refs",
                "unaffected_consumer_refs",
                "unknown_consumer_refs",
                "original_consumers",
            },
        )
        self.assertIs(mat["operation_selected"], False)
        self.assertEqual(mat["delta_refs"], [])
        self.assertEqual(mat["impact_evidence_refs"], [])
        self.assertEqual(mat["affected_consumer_refs"], [])
        self.assertEqual(mat["unaffected_consumer_refs"], [])
        self.assertEqual(mat["unknown_consumer_refs"], [])
        self.assertEqual(mat["original_consumers"], raw["consumers"])

    def test_add_18_all_four_facet_locality(self):
        """HARNESS-L8-009-ADD-18: all-four-facet-locality (separate P and Q invocations)."""
        add18 = self.fixture_data["add_18_case"]
        self.assertEqual(add18["id"], "HARNESS-L8-009-ADD-18")
        recipes = {r["id"]: r for r in self.fixture_data["recipes"]}
        sep_refs = recipes[add18["input_fixture_ref"]]["separate_input_fixture_refs"]
        self.assertEqual(sep_refs, ["CORE-SUPPORT-IMPACT-FOUR", "CORE-SUPPORT-Q-VALID"])

        raw_p = _resolve_recipe_raw(sep_refs[0])
        res_p, _, _ = self._run_meaning_impacts(raw_p)
        self.assertEqual(res_p["findings"], [])
        mat_p = res_p["material"]
        self.assertIs(mat_p["operation_selected"], True)
        self.assertEqual(len(mat_p["delta_refs"]), 4)
        self.assertEqual(
            [d["facet"] for d in raw_p["meaning_deltas"]],
            add18["expected_facets"],
        )
        self.assertEqual(len(mat_p["impact_evidence_refs"]), 4)
        self.assertEqual(
            mat_p["affected_consumer_refs"],
            [raw_p["consumers"][0]["ref"]],
        )
        self.assertEqual(mat_p["unaffected_consumer_refs"], [])
        self.assertEqual(mat_p["unknown_consumer_refs"], [])
        self.assertTrue(
            _same_ref_core(
                mat_p["original_consumers"][0]["used_template_ref"],
                add18["expected_old_consumer"]["used_template_ref"],
            )
        )
        self.assertEqual(
            mat_p["original_consumers"][0]["state"],
            add18["expected_old_consumer"]["state"],
        )

        # Separate invocation on Q: valid scope Q unchanged and unaffected by P deltas
        raw_q = _resolve_recipe_raw(sep_refs[1])
        res_q, _, _ = self._run_meaning_impacts(raw_q)
        self.assertEqual(res_q["findings"], [])
        self.assertEqual(res_q["input_binding"], raw_q["binding"])
        self.assertEqual(res_q["material"]["original_consumers"], raw_q["consumers"])
        self.assertEqual(res_q["material"]["affected_consumer_refs"], [])

    def test_add_19_known_unaffected_with_proof(self):
        """HARNESS-L8-009-ADD-19: known-unaffected-with-proof."""
        add19 = self.fixture_data["add_19_case"]
        self.assertEqual(add19["id"], "HARNESS-L8-009-ADD-19")
        raw = _resolve_recipe_raw(add19["input_fixture_ref"])
        res, _, _ = self._run_meaning_impacts(raw)

        self.assertEqual(res["findings"], [])
        mat = res["material"]
        self.assertIs(mat["operation_selected"], True)
        self.assertEqual(mat["delta_refs"], [raw["meaning_deltas"][0]["ref"]])
        self.assertEqual(
            mat["impact_evidence_refs"], [raw["impact_evidence"][0]["ref"]]
        )
        self.assertEqual(mat["affected_consumer_refs"], [])
        self.assertEqual(mat["unaffected_consumer_refs"], [raw["consumers"][0]["ref"]])
        self.assertEqual(mat["unknown_consumer_refs"], [])
        self.assertEqual(mat["original_consumers"], raw["consumers"])

    def _assert_negative_case(self, neg):
        raw = self._apply_mutation(neg)
        res, _, _ = self._run_meaning_impacts(raw)

        self.assertEqual(res["producer_symbol"], "compare_meaning_impacts")
        self.assertEqual(res["input_binding"], raw["binding"])
        self.assertEqual(res["material"]["original_consumers"], raw["consumers"])

        matching = [
            f for f in res["findings"] if f["code"] == neg["expected_classification"]
        ]
        self.assertTrue(
            matching,
            f"Expected finding {neg['expected_classification']} in {res['findings']}",
        )
        finding = matching[0]
        self.assertEqual(finding["rule_ref"], neg["rule_ref"])
        self.assertEqual(finding["axis"], neg["expected_axis"])
        self.assertEqual(finding["state"], neg["expected_state"])
        self.assertEqual(finding["backflow_owner"], neg["backflow_owner"])
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertTrue(isinstance(finding["reason"], str) and finding["reason"])
        self.assertTrue(
            isinstance(finding["source_refs"], list) and len(finding["source_refs"]) > 0
        )
        return res, raw, finding

    def test_f07_neg_01_filename_as_migration_complete(self):
        """HARNESS-L8-009-F07-NEG-01: filename_as_migration_complete."""
        self._assert_negative_case(self.f07_negative_cases["HARNESS-L8-009-F07-NEG-01"])

    def test_f07_neg_02_digest_as_migration_complete(self):
        """HARNESS-L8-009-F07-NEG-02: digest_as_migration_complete."""
        self._assert_negative_case(self.f07_negative_cases["HARNESS-L8-009-F07-NEG-02"])

    def test_f07_neg_03_view_as_meaning_migration(self):
        """HARNESS-L8-009-F07-NEG-03: view_as_meaning_migration."""
        self._assert_negative_case(self.f07_negative_cases["HARNESS-L8-009-F07-NEG-03"])

    def test_f07_neg_04_unknown_as_unaffected(self):
        """HARNESS-L8-009-F07-NEG-04: unknown_as_unaffected."""
        res, raw, _ = self._assert_negative_case(
            self.f07_negative_cases["HARNESS-L8-009-F07-NEG-04"]
        )
        self.assertEqual(res["material"]["unaffected_consumer_refs"], [])
        self.assertEqual(
            res["material"]["unknown_consumer_refs"], [raw["consumers"][0]["ref"]]
        )

    def test_f07_neg_05_foreign_scope_unaffected_proof(self):
        """HARNESS-L8-009-F07-NEG-05: foreign_scope_unaffected_proof."""
        res, raw, _ = self._assert_negative_case(
            self.f07_negative_cases["HARNESS-L8-009-F07-NEG-05"]
        )
        self.assertEqual(res["material"]["unaffected_consumer_refs"], [])
        self.assertEqual(
            res["material"]["unknown_consumer_refs"], [raw["consumers"][0]["ref"]]
        )

    def test_f07_neg_06_old_revision_lost(self):
        """HARNESS-L8-009-F07-NEG-06: old_revision_lost."""
        res, raw, _ = self._assert_negative_case(
            self.f07_negative_cases["HARNESS-L8-009-F07-NEG-06"]
        )
        self.assertEqual(
            res["material"]["original_consumers"][0]["used_template_ref"],
            raw["consumers"][0]["used_template_ref"],
        )

    def test_f07_neg_07_completion_delta_omitted(self):
        """HARNESS-L8-009-F07-NEG-07: completion_delta_omitted."""
        res, _, _ = self._assert_negative_case(
            self.f07_negative_cases["HARNESS-L8-009-F07-NEG-07"]
        )
        self.assertEqual(len(res["material"]["delta_refs"]), 4)

    def test_f08_neg_01_all_scope_invalidated(self):
        """HARNESS-L8-009-F08-NEG-01: all_scope_invalidated."""
        self._assert_negative_case(self.f08_negative_cases["HARNESS-L8-009-F08-NEG-01"])

    def test_f08_neg_02_core_updates_used_revision(self):
        """HARNESS-L8-009-F08-NEG-02: core_updates_used_revision."""
        self._assert_negative_case(self.f08_negative_cases["HARNESS-L8-009-F08-NEG-02"])

    def test_f08_neg_03_core_closes_unfinished_obligation(self):
        """HARNESS-L8-009-F08-NEG-03: core_closes_unfinished_obligation."""
        self._assert_negative_case(self.f08_negative_cases["HARNESS-L8-009-F08-NEG-03"])

    def test_f08_neg_04_core_updates_event_stale(self):
        """HARNESS-L8-009-F08-NEG-04: core_updates_event_stale."""
        self._assert_negative_case(self.f08_negative_cases["HARNESS-L8-009-F08-NEG-04"])

    def test_context_dependency_guard_rejects_mismatched_producer_or_binding(self):
        """CompareMeaningImpactsContext rejects missing or mismatched compare_required_axes."""
        raw = _resolve_recipe_raw("CORE-SUPPORT-IMPACT-FOUR")
        validated = validate_application_input(raw)
        req_axes = compare_required_axes({"validated": validated})
        fn = getattr(pta, "compare_meaning_impacts", None)
        self.assertIsNotNone(fn, "compare_meaning_impacts must be exported")

        bad_prod = copy.deepcopy(req_axes)
        bad_prod["producer_symbol"] = "wrong_producer"
        res1 = fn({"validated": validated, "compare_required_axes": bad_prod})
        self.assertEqual(res1["producer_symbol"], "compare_meaning_impacts")
        self.assertEqual(res1["findings"], [])
        self.assertEqual(res1["material"]["delta_refs"], [])

        bad_bind = copy.deepcopy(req_axes)
        bad_bind["input_binding"]["product_scope"]["product"] = "MISMATCHED-P"
        res2 = fn({"validated": validated, "compare_required_axes": bad_bind})
        self.assertEqual(res2["findings"], [])
        self.assertEqual(res2["material"]["delta_refs"], [])

    def test_identifier_rename_invariance_and_structural_predicates(self):
        """All F07/F08 cases work under bulk SHA-256 identifier renaming and neutral proposed_value."""
        raw_norm = _rename_all_identifiers(
            _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED"), "RNORM"
        )
        _rebuild_source_graph(raw_norm)
        res_norm, _, _ = self._run_meaning_impacts(raw_norm)
        self.assertEqual(res_norm["findings"], [])
        self.assertIs(res_norm["material"]["operation_selected"], False)

        raw_18 = _rename_all_identifiers(
            _resolve_recipe_raw("CORE-SUPPORT-IMPACT-FOUR"), "R18"
        )
        _rebuild_source_graph(raw_18)
        res_18, _, _ = self._run_meaning_impacts(raw_18)
        self.assertEqual(res_18["findings"], [])
        self.assertEqual(len(res_18["material"]["delta_refs"]), 4)
        self.assertEqual(
            res_18["material"]["affected_consumer_refs"],
            [raw_18["consumers"][0]["ref"]],
        )

        raw_19 = _rename_all_identifiers(
            _resolve_recipe_raw("CORE-ADD-INPUT-19"), "R19"
        )
        _rebuild_source_graph(raw_19)
        res_19, _, _ = self._run_meaning_impacts(raw_19)
        self.assertEqual(res_19["findings"], [])
        self.assertEqual(
            res_19["material"]["unaffected_consumer_refs"],
            [raw_19["consumers"][0]["ref"]],
        )

        all_neg = list(self.f07_negative_cases.values()) + list(
            self.f08_negative_cases.values()
        )
        for neg in all_neg:
            cid = neg["id"]
            with self.subTest(case_id=cid):
                raw_neg = self._apply_mutation(neg)
                if cid == "HARNESS-L8-009-F07-NEG-01":
                    raw_neg["claims"][-1]["proposed_value"] = {"note": "neutral"}
                    src_ref = copy.deepcopy(raw_neg["sources"][0]["ref"])
                    src_ref["source_locator"] = "templates/renamed_file.json"
                    raw_neg["claims"][-1]["basis_refs"] = [src_ref]
                elif cid == "HARNESS-L8-009-F07-NEG-02":
                    raw_neg["claims"][-1]["proposed_value"] = {"note": "neutral"}
                    dig_ref = copy.deepcopy(raw_neg["sources"][0]["ref"])
                    dig_ref["source_locator"] = None
                    raw_neg["claims"][-1]["basis_refs"] = [dig_ref]
                elif raw_neg.get("claims"):
                    raw_neg["claims"][-1]["proposed_value"] = {"note": "neutral"}
                renamed_neg = _rename_all_identifiers(raw_neg, f"R{cid[-2:]}")
                _rebuild_source_graph(renamed_neg)
                res_neg, _, _ = self._run_meaning_impacts(renamed_neg)
                codes = [f["code"] for f in res_neg["findings"]]
                self.assertIn(
                    neg["expected_classification"],
                    codes,
                    f"Failed under identifier renaming for {cid}: got {codes}",
                )

    def test_near_miss_control_cases_do_not_emit_findings(self):
        """Control tests: near-miss inputs where L5 predicate does NOT hold must NOT emit findings."""
        # Control 1 (F07-NEG-01/02): meaning_migrated claim backed by full 4-facet impact_evidence and new_template_ref
        raw1 = _rename_all_identifiers(_resolve_recipe_raw("CORE-SUPPORT-IMPACT-FOUR"))
        raw1["consumers"][0]["used_template_ref"] = copy.deepcopy(
            raw1["meaning_deltas"][0]["new_template_ref"]
        )
        raw1.setdefault("claims", []).append(
            {
                "ref": copy.deepcopy(raw1["binding"]["application_contract_ref"]),
                "subject_ref": copy.deepcopy(raw1["consumers"][0]["ref"]),
                "binding": copy.deepcopy(raw1["binding"]),
                "actor": "control-actor",
                "kind": "meaning_migrated",
                "proposed_value": {"note": "valid-migration-with-evidence"},
                "basis_refs": [
                    copy.deepcopy(e["ref"]) for e in raw1["impact_evidence"]
                ],
            }
        )
        _rebuild_source_graph(raw1)
        res1, _, _ = self._run_meaning_impacts(raw1)
        self.assertEqual(res1["findings"], [])

        # Control 2 (F07-NEG-03): meaning_changed claim backed by a real semantic facet delta (same_meaning=False)
        raw2 = _rename_all_identifiers(_resolve_recipe_raw("CORE-SUPPORT-IMPACT-FOUR"))
        raw2.setdefault("claims", []).append(
            {
                "ref": copy.deepcopy(raw2["binding"]["application_contract_ref"]),
                "subject_ref": copy.deepcopy(raw2["meaning_deltas"][0]["ref"]),
                "binding": copy.deepcopy(raw2["binding"]),
                "actor": "control-actor",
                "kind": "meaning_changed",
                "proposed_value": {"note": "real-semantic-change"},
                "basis_refs": [copy.deepcopy(raw2["meaning_deltas"][0]["ref"])],
            }
        )
        _rebuild_source_graph(raw2)
        res2, _, _ = self._run_meaning_impacts(raw2)
        self.assertEqual(res2["findings"], [])

        # Control 3 (F07-NEG-04/05): consumer_unaffected claim when same-scope qualified affected=False evidence exists
        raw3 = _rename_all_identifiers(_resolve_recipe_raw("CORE-ADD-INPUT-19"))
        raw3.setdefault("claims", []).append(
            {
                "ref": copy.deepcopy(raw3["binding"]["application_contract_ref"]),
                "subject_ref": copy.deepcopy(raw3["consumers"][0]["ref"]),
                "binding": copy.deepcopy(raw3["binding"]),
                "actor": "control-actor",
                "kind": "consumer_unaffected",
                "proposed_value": {"note": "valid-unaffected"},
                "basis_refs": [copy.deepcopy(raw3["impact_evidence"][0]["ref"])],
            }
        )
        _rebuild_source_graph(raw3)
        res3, _, _ = self._run_meaning_impacts(raw3)
        self.assertEqual(res3["findings"], [])

        # Control 4 (F07-NEG-07): impact_coverage claim that includes ALL 4 facet deltas (including completion)
        raw4 = _rename_all_identifiers(_resolve_recipe_raw("CORE-SUPPORT-IMPACT-FOUR"))
        raw4.setdefault("claims", []).append(
            {
                "ref": copy.deepcopy(raw4["binding"]["application_contract_ref"]),
                "subject_ref": copy.deepcopy(raw4["consumers"][0]["ref"]),
                "binding": copy.deepcopy(raw4["binding"]),
                "actor": "control-actor",
                "kind": "impact_coverage",
                "proposed_value": {"note": "all-4-facets-covered"},
                "basis_refs": [copy.deepcopy(d["ref"]) for d in raw4["meaning_deltas"]],
            }
        )
        _rebuild_source_graph(raw4)
        res4, _, _ = self._run_meaning_impacts(raw4)
        self.assertEqual(res4["findings"], [])

    def test_material_multiplicity_and_order_preserved(self):
        """L5 type_contract/general_rules: Ref arrays and original_consumers preserve multiplicity and order."""
        raw = _resolve_recipe_raw("CORE-SUPPORT-IMPACT-FOUR")
        raw["meaning_deltas"].append(copy.deepcopy(raw["meaning_deltas"][0]))
        raw["impact_evidence"].append(copy.deepcopy(raw["impact_evidence"][0]))
        raw["consumers"].append(copy.deepcopy(raw["consumers"][0]))
        _rebuild_source_graph(raw)
        res, _, _ = self._run_meaning_impacts(raw)

        mat = res["material"]
        self.assertEqual(len(mat["delta_refs"]), 5)
        self.assertEqual(len(mat["impact_evidence_refs"]), 5)
        self.assertEqual(len(mat["affected_consumer_refs"]), 2)
        self.assertEqual(len(mat["original_consumers"]), 2)


if __name__ == "__main__":
    unittest.main()
