"""Unit tests for compare_selected_knowledge (HARNESS-L5-009-compare_selected_knowledge / FN6)."""

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
    raw = _resolve_recipe_raw(recipe["base_input_fixture_ref"])
    for k, v in (recipe.get("input_overrides") or {}).items():
        raw[k] = copy.deepcopy(v)
    for k, v in (recipe.get("input_appends") or {}).items():
        raw.setdefault(k, []).extend(copy.deepcopy(v))
    for change in recipe.get("pre_rebuild_changes") or []:
        if change.get("action") == "remove_field_definition_sources":
            for fi in raw.get("field_inputs") or []:
                fi["definition_refs"] = []
    if recipe.get("source_preparation") == "CORE-FIXTURE-SOURCE-REBUILD-01":
        _rebuild_source_graph(raw)
    return raw


def _rename_id(val):
    return "id-" + hashlib.sha256(val.encode("utf-8")).hexdigest()[:12]


def _rename_all_identifiers(obj):
    """Recursively obfuscate all synthetic/fixture identifiers so no literal substring survives."""
    if isinstance(obj, dict):
        out = {}
        for k, v in obj.items():
            if k in ("identity", "owner", "actor", "decider"):
                out[k] = _rename_id(v) if isinstance(v, str) else v
            elif k in (
                "field",
                "template",
                "application_contract",
                "subject",
            ) and isinstance(v, str):
                out[k] = _rename_id(v)
            else:
                out[k] = _rename_all_identifiers(v)
        return out
    if isinstance(obj, list):
        return [_rename_all_identifiers(x) for x in obj]
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


class TestCompareSelectedKnowledge(unittest.TestCase):
    """Red->Green unit tests for HARNESS-L5-009-compare_selected_knowledge."""

    @classmethod
    def setUpClass(cls):
        cls.fixture_data = FIXTURE_DATA
        cls.f06_negative_cases = {
            c["id"]: c for c in cls.fixture_data["f06_negative_cases"]
        }

    def _run_selected_knowledge(self, raw_input):
        snapshot = copy.deepcopy(raw_input)
        validated = validate_application_input(raw_input)
        req_axes = compare_required_axes({"validated": validated})
        fn = getattr(pta, "compare_selected_knowledge", None)
        self.assertIsNotNone(
            fn,
            "compare_selected_knowledge must be exported from product_template_application",
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
            "compare_selected_knowledge must be effect=none and never mutate input",
        )
        return res, validated, req_axes

    def _apply_f06_mutation(self, neg_case):
        cid = neg_case["id"]
        tm = neg_case["typed_mutation"]
        target = tm["target"]
        op = tm["operation"]
        val = tm["synthetic_value"]

        raw = _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED")
        chosen_kr = raw["knowledge_records"][0]

        if cid == "HARNESS-L8-009-F06-NEG-01":
            assert (
                target == "knowledge_records[chosen].operational_state + claims"
                and op == "replace_and_append"
            )
            chosen_kr["operational_state"] = {
                "stale": True,
                "stale_reason": val["state"],
            }
            raw.setdefault("claims", []).append(
                {
                    "ref": {
                        "identity": "claim-neg-01-stale-knowledge-usable",
                        "revision": "synthetic-A",
                        "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                        "owner": "synthetic-core-owner",
                        "source_locator": None,
                        "sha256": None,
                    },
                    "subject_ref": copy.deepcopy(chosen_kr["ref"]),
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["claim_kind"],
                    "proposed_value": {"state": val["state"]},
                    "basis_refs": [copy.deepcopy(chosen_kr["ref"])],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F06-NEG-02":
            assert (
                target == "knowledge_records[chosen].authority_ref + claims"
                and op == "remove_and_append"
            )
            chosen_kr["authority_ref"] = val["authority_ref"]
            raw.setdefault("claims", []).append(
                {
                    "ref": {
                        "identity": "claim-neg-02-unapproved-knowledge-usable",
                        "revision": "synthetic-A",
                        "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                        "owner": "synthetic-core-owner",
                        "source_locator": None,
                        "sha256": None,
                    },
                    "subject_ref": copy.deepcopy(chosen_kr["ref"]),
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["claim_kind"],
                    "proposed_value": {"authority_ref": val["authority_ref"]},
                    "basis_refs": [copy.deepcopy(chosen_kr["ref"])],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F06-NEG-03":
            assert (
                target == "knowledge_records[chosen].binding.product_scope"
                and op == "replace"
            )
            foreign_scope = copy.deepcopy(chosen_kr["binding"]["product_scope"])
            foreign_scope["product"] = val
            chosen_kr["binding"]["product_scope"] = foreign_scope
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F06-NEG-04":
            assert target == "claims" and op == "append"
            raw["universes"][0]["members"] = []
            arbitrary_tmpl_ref = copy.deepcopy(raw["binding"]["template_ref"])
            arbitrary_tmpl_ref["identity"] = val["value"]
            raw.setdefault("claims", []).append(
                {
                    "ref": {
                        "identity": "claim-neg-04-no-match-arbitrary-selection",
                        "revision": "synthetic-A",
                        "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                        "owner": "synthetic-core-owner",
                        "source_locator": None,
                        "sha256": None,
                    },
                    "subject_ref": arbitrary_tmpl_ref,
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["kind"],
                    "proposed_value": {
                        "value": val["value"],
                        "basis": val["basis"],
                    },
                    "basis_refs": [copy.deepcopy(raw["universes"][0]["ref"])],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F06-NEG-05":
            assert (
                target == "knowledge_records[chosen].required_field_refs + field_inputs"
                and op == "remove_selected"
            )
            raw["field_inputs"] = []
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F06-NEG-06":
            assert target == "claims" and op == "append"
            unselected_ref = copy.deepcopy(
                raw["operations"]["unselected_knowledge_refs"][0]
            )
            raw.setdefault("claims", []).append(
                {
                    "ref": {
                        "identity": "claim-neg-06-reference-as-authority",
                        "revision": "synthetic-A",
                        "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                        "owner": "synthetic-core-owner",
                        "source_locator": None,
                        "sha256": None,
                    },
                    "subject_ref": unselected_ref,
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["kind"],
                    "proposed_value": {"basis_role": val["basis_role"]},
                    "basis_refs": [copy.deepcopy(unselected_ref)],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F06-NEG-07":
            assert target == "claims" and op == "append"
            tmpl_ref = copy.deepcopy(raw["binding"]["template_ref"])
            raw.setdefault("claims", []).append(
                {
                    "ref": {
                        "identity": "claim-neg-07-template-as-agreement",
                        "revision": "synthetic-A",
                        "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                        "owner": "synthetic-core-owner",
                        "source_locator": None,
                        "sha256": None,
                    },
                    "subject_ref": tmpl_ref,
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["kind"],
                    "proposed_value": {"basis": val["basis"]},
                    "basis_refs": [copy.deepcopy(tmpl_ref)],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        raise ValueError(f"Unknown F06 negative case: {cid}")

    def test_normal_compare_selected_knowledge_oracle(self):
        """HARNESS-L8-009-NORMAL-compare_selected_knowledge on CORE-NORMAL-UNIT-REQUIRED."""
        oracle = self.fixture_data["compare_selected_knowledge_oracle"]
        self.assertEqual(
            oracle["id"], "HARNESS-L8-009-NORMAL-compare_selected_knowledge"
        )
        self.assertEqual(
            oracle["function_ref"], "HARNESS-L5-009-compare_selected_knowledge"
        )
        raw = _resolve_recipe_raw(oracle["input_fixture_ref"])
        res, _, _ = self._run_selected_knowledge(raw)

        self.assertEqual(res["producer_symbol"], "compare_selected_knowledge")
        self.assertEqual(res["input_binding"], raw["binding"])
        self.assertEqual(res["original_axes"], [])
        self.assertEqual(res["findings"], [])

        mat = res["material"]
        self.assertEqual(
            set(mat.keys()),
            {
                "selected_knowledge_refs",
                "checked_field_refs",
                "usable_candidate_refs",
                "unselected_unobserved_refs",
            },
        )
        self.assertEqual(
            mat["selected_knowledge_refs"],
            raw["operations"]["selected_knowledge_refs"],
        )
        self.assertEqual(
            mat["checked_field_refs"],
            raw["knowledge_records"][0]["required_field_refs"],
        )
        self.assertEqual(
            mat["usable_candidate_refs"],
            [raw["knowledge_records"][0]["ref"]],
        )
        self.assertEqual(
            mat["unselected_unobserved_refs"],
            raw["operations"]["unselected_knowledge_refs"],
        )

    def test_add_17_unselected_reference_preserved(self):
        """HARNESS-L8-009-ADD-17: unselected-reference-preserved."""
        add17 = self.fixture_data["add_17_case"]
        self.assertEqual(add17["id"], "HARNESS-L8-009-ADD-17")
        raw = _resolve_recipe_raw(add17["input_fixture_ref"])
        res, _, _ = self._run_selected_knowledge(raw)

        self.assertEqual(res["findings"], [])
        mat = res["material"]
        self.assertEqual(
            mat["usable_candidate_refs"],
            [raw["knowledge_records"][0]["ref"]],
        )
        self.assertEqual(
            len(mat["unselected_unobserved_refs"]),
            len(add17["expected_unobserved_refs"]),
        )
        for actual, expected in zip(
            mat["unselected_unobserved_refs"], add17["expected_unobserved_refs"]
        ):
            self.assertTrue(_same_ref_core(actual, expected))

    def _assert_f06_negative_case(self, case_id):
        neg = self.f06_negative_cases[case_id]
        raw = self._apply_f06_mutation(neg)
        res, _, _ = self._run_selected_knowledge(raw)

        self.assertEqual(res["producer_symbol"], "compare_selected_knowledge")
        self.assertEqual(res["input_binding"], raw["binding"])

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

    def test_f06_neg_01_stale_template_allowed(self):
        """HARNESS-L8-009-F06-NEG-01: stale_template_allowed."""
        res, _, _ = self._assert_f06_negative_case("HARNESS-L8-009-F06-NEG-01")
        self.assertEqual(res["material"]["usable_candidate_refs"], [])

    def test_f06_neg_02_unapproved_template_allowed(self):
        """HARNESS-L8-009-F06-NEG-02: unapproved_template_allowed."""
        res, _, _ = self._assert_f06_negative_case("HARNESS-L8-009-F06-NEG-02")
        self.assertEqual(res["material"]["usable_candidate_refs"], [])

    def test_f06_neg_03_foreign_product_template_allowed(self):
        """HARNESS-L8-009-F06-NEG-03: foreign_product_template_allowed."""
        res, _, _ = self._assert_f06_negative_case("HARNESS-L8-009-F06-NEG-03")
        self.assertEqual(res["material"]["usable_candidate_refs"], [])

    def test_f06_neg_04_no_match_arbitrary_selection(self):
        """HARNESS-L8-009-F06-NEG-04: no_match_arbitrary_selection."""
        self._assert_f06_negative_case("HARNESS-L8-009-F06-NEG-04")

    def test_f06_neg_05_knowledge_gap_fallback(self):
        """HARNESS-L8-009-F06-NEG-05: knowledge_gap_fallback."""
        res, _, _ = self._assert_f06_negative_case("HARNESS-L8-009-F06-NEG-05")
        self.assertEqual(res["material"]["usable_candidate_refs"], [])

    def test_f06_neg_06_reference_as_application_authority(self):
        """HARNESS-L8-009-F06-NEG-06: reference_as_application_authority."""
        res, raw, _ = self._assert_f06_negative_case("HARNESS-L8-009-F06-NEG-06")
        self.assertEqual(
            res["material"]["unselected_unobserved_refs"],
            raw["operations"]["unselected_knowledge_refs"],
        )

    def test_f06_neg_07_template_as_requirement_agreement(self):
        """HARNESS-L8-009-F06-NEG-07: template_as_requirement_agreement."""
        self._assert_f06_negative_case("HARNESS-L8-009-F06-NEG-07")

    def test_all_f06_negative_cases_preserve_input_and_emit_expected_finding(self):
        """All 7 F06 negative cases emit their exact classification/axis/state/owner/rule_ref."""
        self.assertEqual(len(self.f06_negative_cases), 7)
        for cid in sorted(self.f06_negative_cases.keys()):
            with self.subTest(case_id=cid):
                self._assert_f06_negative_case(cid)

    def test_context_dependency_guard_rejects_mismatched_producer_or_binding(self):
        """CompareSelectedKnowledgeContext rejects missing or mismatched compare_required_axes."""
        raw = _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED")
        validated = validate_application_input(raw)
        req_axes = compare_required_axes({"validated": validated})
        fn = getattr(pta, "compare_selected_knowledge", None)
        self.assertIsNotNone(fn)

        bad_axes = copy.deepcopy(req_axes)
        bad_axes["producer_symbol"] = "forged_producer"
        res = fn({"validated": validated, "compare_required_axes": bad_axes})
        self.assertEqual(res["producer_symbol"], "compare_selected_knowledge")
        self.assertEqual(res["original_axes"], [])
        self.assertEqual(res["findings"], [])
        self.assertEqual(res["material"]["selected_knowledge_refs"], [])
        self.assertEqual(res["material"]["usable_candidate_refs"], [])

    def test_identifier_rename_invariance_and_structural_predicates(self):
        """All F06 cases (normal, ADD-17, NEG-01..07) work under bulk SHA-256 identifier renaming and neutral proposed_value."""
        for recipe_id in ("CORE-NORMAL-UNIT-REQUIRED", "CORE-ADD-INPUT-17"):
            raw = _rename_all_identifiers(_resolve_recipe_raw(recipe_id))
            _rebuild_source_graph(raw)
            res, _, _ = self._run_selected_knowledge(raw)
            self.assertEqual(res["producer_symbol"], "compare_selected_knowledge")
            self.assertEqual(res["input_binding"], raw["binding"])
            self.assertEqual(res["findings"], [])
            self.assertEqual(
                res["material"]["usable_candidate_refs"],
                [raw["knowledge_records"][0]["ref"]],
            )

        for cid, neg in self.f06_negative_cases.items():
            with self.subTest(case_id=cid):
                raw = _rename_all_identifiers(self._apply_f06_mutation(neg))
                for claim in raw.get("claims") or []:
                    claim["proposed_value"] = {"note": "neutral-structural-test"}
                _rebuild_source_graph(raw)
                res, _, _ = self._run_selected_knowledge(raw)
                matching = [
                    f
                    for f in res["findings"]
                    if f["code"] == neg["expected_classification"]
                ]
                self.assertTrue(
                    matching,
                    f"Expected finding {neg['expected_classification']} in renamed {cid}",
                )

    def test_near_miss_control_cases_do_not_emit_findings(self):
        """Control tests: near-miss inputs where L5 predicate does NOT hold must NOT emit findings."""
        # Control 1 (NEG-01): knowledge_usable claim on a non-stale usable selected knowledge record
        raw1 = _rename_all_identifiers(
            self._apply_f06_mutation(
                self.f06_negative_cases["HARNESS-L8-009-F06-NEG-01"]
            )
        )
        raw1["knowledge_records"][0]["operational_state"] = {
            "original_state": "usable-normal"
        }
        _rebuild_source_graph(raw1)
        res1, _, _ = self._run_selected_knowledge(raw1)
        self.assertEqual(res1["findings"], [])

        # Control 2 (NEG-02): knowledge_usable claim when authority_ref is a valid Ref
        raw2 = _rename_all_identifiers(
            self._apply_f06_mutation(
                self.f06_negative_cases["HARNESS-L8-009-F06-NEG-02"]
            )
        )
        raw2["knowledge_records"][0]["authority_ref"] = copy.deepcopy(
            raw2["binding"]["knowledge_ref"]
        )
        _rebuild_source_graph(raw2)
        res2, _, _ = self._run_selected_knowledge(raw2)
        self.assertEqual(res2["findings"], [])

        # Control 3 (NEG-03): unselected knowledge record has foreign product_scope, while selected matches
        raw3 = _rename_all_identifiers(_resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED"))
        unselected_kr = copy.deepcopy(raw3["knowledge_records"][0])
        unselected_kr["ref"] = copy.deepcopy(
            raw3["operations"]["unselected_knowledge_refs"][0]
        )
        unselected_kr["binding"]["product_scope"]["product"] = "FOREIGN-P"
        raw3["knowledge_records"].append(unselected_kr)
        _rebuild_source_graph(raw3)
        res3, _, _ = self._run_selected_knowledge(raw3)
        self.assertEqual(res3["findings"], [])

        # Control 4 (NEG-04): template_selected claim where subject_ref IS a matching member of universes[0].members
        raw4 = _rename_all_identifiers(_resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED"))
        raw4.setdefault("claims", []).append(
            {
                "ref": copy.deepcopy(raw4["binding"]["application_contract_ref"]),
                "subject_ref": copy.deepcopy(raw4["binding"]["template_ref"]),
                "binding": copy.deepcopy(raw4["binding"]),
                "actor": "control-actor",
                "kind": "template_selected",
                "proposed_value": {"note": "valid-member-selection"},
                "basis_refs": [copy.deepcopy(raw4["universes"][0]["ref"])],
            }
        )
        _rebuild_source_graph(raw4)
        res4, _, _ = self._run_selected_knowledge(raw4)
        self.assertEqual(res4["findings"], [])

        # Control 5 (NEG-05): unselected knowledge record is missing its required field, while selected has its field
        raw5 = _rename_all_identifiers(_resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED"))
        unselected_kr5 = copy.deepcopy(raw5["knowledge_records"][0])
        unselected_kr5["ref"] = copy.deepcopy(
            raw5["operations"]["unselected_knowledge_refs"][0]
        )
        missing_field_ref = copy.deepcopy(raw5["field_inputs"][0]["ref"])
        missing_field_ref["identity"] = "unselected-missing-field"
        unselected_kr5["required_field_refs"] = [missing_field_ref]
        raw5["knowledge_records"].append(unselected_kr5)
        _rebuild_source_graph(raw5)
        res5, _, _ = self._run_selected_knowledge(raw5)
        self.assertEqual(res5["findings"], [])

        # Control 6 (NEG-06): application_authority claim backed by selected_knowledge_refs[0] (not unselected)
        raw6 = _rename_all_identifiers(
            self._apply_f06_mutation(
                self.f06_negative_cases["HARNESS-L8-009-F06-NEG-06"]
            )
        )
        raw6["claims"][-1]["subject_ref"] = copy.deepcopy(
            raw6["operations"]["selected_knowledge_refs"][0]
        )
        raw6["claims"][-1]["basis_refs"] = [
            copy.deepcopy(raw6["operations"]["selected_knowledge_refs"][0])
        ]
        _rebuild_source_graph(raw6)
        res6, _, _ = self._run_selected_knowledge(raw6)
        self.assertEqual(res6["findings"], [])

        # Control 7 (NEG-07): requirements_agreement claim backed by requirement_ref (not template-only)
        raw7 = _rename_all_identifiers(
            self._apply_f06_mutation(
                self.f06_negative_cases["HARNESS-L8-009-F06-NEG-07"]
            )
        )
        raw7["claims"][-1]["subject_ref"] = copy.deepcopy(
            raw7["binding"]["requirement_ref"]
        )
        raw7["claims"][-1]["basis_refs"] = [
            copy.deepcopy(raw7["binding"]["requirement_ref"]),
            copy.deepcopy(raw7["binding"]["template_ref"]),
        ]
        _rebuild_source_graph(raw7)
        res7, _, _ = self._run_selected_knowledge(raw7)
        self.assertEqual(res7["findings"], [])

    def test_brain_definition_source_correspondence_read_and_return_oracle(self):
        """brain_definition_source_read_binding / return_writer: selected_missing, unselected, unformed."""
        raw = _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED")
        brain_src = next(
            s
            for s in raw["sources"]
            if s["ref"]["identity"] == raw["templates"][0]["source_ref"]["identity"]
        )
        brain_binding = {"pattern_ref": {"identity": "BRAIN-PATTERN-1"}}
        brain_src["body"]["call_input"] = {"binding": brain_binding}
        brain_src["body"]["call_comparison"] = {
            "producer_symbol": "compare_descriptor_definitions",
            "call_input_pointer": "/call_input",
            "input_binding": brain_binding,
            "original_axes": [
                {
                    "subject_ref": copy.deepcopy(raw["knowledge_records"][0]["ref"]),
                    "binding": brain_binding,
                    "axis": "field.definition",
                    "state": "missing",
                    "original_refs": [
                        copy.deepcopy(raw["knowledge_records"][0]["ref"])
                    ],
                    "reason": "BRAIN descriptor definition missing",
                    "backflow_owner": "BRAIN",
                }
            ],
            "findings": [],
        }

        corr_rec = {
            "ref": {
                "identity": "corr-selected-k",
                "revision": "synthetic-A",
                "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                "owner": raw["binding"]["template_ref"]["owner"],
                "source_locator": None,
                "sha256": None,
            },
            "binding": copy.deepcopy(raw["binding"]),
            "kind": "selected_brain_definition_correspondence",
            "meaning": {
                "selected_template_ref": copy.deepcopy(raw["templates"][0]["ref"]),
                "selected_knowledge_ref": copy.deepcopy(
                    raw["knowledge_records"][0]["ref"]
                ),
                "brain_source_ref": copy.deepcopy(brain_src["ref"]),
                "input_pointer": "/call_input",
                "comparison_pointer": "/call_comparison",
                "brain_binding_pointer": "/call_input/binding",
            },
            "source_ref": copy.deepcopy(raw["templates"][0]["source_ref"]),
        }
        raw["semantic_records"].append(corr_rec)
        _rebuild_source_graph(raw)
        res, _, _ = self._run_selected_knowledge(raw)
        self.assertEqual(res["material"]["usable_candidate_refs"], [])
        self.assertNotIn("correspondence_issues", res["material"])
        self.assertEqual(len(res["original_axes"]), 1)
        ax = res["original_axes"][0]
        self.assertEqual(ax["axis"], "knowledge.usability")
        self.assertEqual(ax["state"], "unknown")
        self.assertEqual(ax["subject_ref"], raw["knowledge_records"][0]["ref"])
        self.assertEqual(ax["binding"], raw["knowledge_records"][0]["binding"])
        self.assertEqual(ax["backflow_owner"], "BRAIN")
        self.assertEqual(len(ax["original_refs"]), 3)

        # 2. unformed_with_record_ref -> emits correspondence_issues with locator /semantic_records/{idx}
        raw_unformed = _resolve_recipe_raw("CORE-NORMAL-UNIT-REQUIRED")
        idx = len(raw_unformed["semantic_records"])
        raw_unformed["semantic_records"].append(
            {
                "ref": {
                    "identity": "corr-unformed-k",
                    "revision": "synthetic-A",
                    "scope": copy.deepcopy(raw_unformed["binding"]["product_scope"]),
                    "owner": raw_unformed["binding"]["template_ref"]["owner"],
                    "source_locator": None,
                    "sha256": None,
                },
                "binding": copy.deepcopy(raw_unformed["binding"]),
                "kind": "selected_brain_definition_correspondence",
                "meaning": {},
                "source_ref": None,
            }
        )
        _rebuild_source_graph(raw_unformed)
        res_u, val_u, req_axes_u = self._run_selected_knowledge(raw_unformed)
        self.assertIn("correspondence_issues", res_u["material"])
        issues = res_u["material"]["correspondence_issues"]
        self.assertEqual(len(issues), 1)
        self.assertEqual(issues[0]["locator"], f"/semantic_records/{idx}")
        self.assertIsNone(issues[0]["source_ref"])
        self.assertTrue(isinstance(issues[0]["reason"], str) and issues[0]["reason"])

        # 3. unformed_without_record_ref (ref member absent on pre-validated snapshot)
        val_no_ref = copy.deepcopy(val_u)
        del val_no_ref["input"]["semantic_records"][idx]["ref"]
        fn = getattr(pta, "compare_selected_knowledge")
        res_no_ref = fn({"validated": val_no_ref, "compare_required_axes": req_axes_u})
        self.assertIn("correspondence_issues", res_no_ref["material"])
        self.assertEqual(
            res_no_ref["material"]["correspondence_issues"][0]["locator"],
            f"/semantic_records/{idx}",
        )
        self.assertIsNone(
            res_no_ref["material"]["correspondence_issues"][0]["source_ref"]
        )

        # 4. unselected knowledge correspondence -> preserves selected K1 usable_candidate_refs
        raw_unsel = copy.deepcopy(raw)
        raw_unsel["semantic_records"][-1]["meaning"]["selected_knowledge_ref"] = (
            copy.deepcopy(raw_unsel["operations"]["unselected_knowledge_refs"][0])
        )
        _rebuild_source_graph(raw_unsel)
        res_unsel, _, _ = self._run_selected_knowledge(raw_unsel)
        self.assertEqual(
            res_unsel["material"]["usable_candidate_refs"],
            [raw_unsel["knowledge_records"][0]["ref"]],
        )
        self.assertNotIn("correspondence_issues", res_unsel["material"])
        self.assertEqual(res_unsel["original_axes"], [])


if __name__ == "__main__":
    unittest.main()
