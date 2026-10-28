"""Unit tests for H009 L5#/functions/4 compare_kind_obligation_trace."""

import copy
import json
from pathlib import Path
import sys
import unittest

UNIT_ROOT = Path(__file__).resolve().parents[1]
FIXTURE_PATH = UNIT_ROOT / "tests" / "fixtures" / "application_input.json"
sys.path.insert(0, str(UNIT_ROOT / "src"))

from product_template_application import (  # noqa: E402
    compare_applicability,
    compare_kind_obligation_trace,
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


def _replace_kind_tokens(obj, src_kind, dst_kind):
    if isinstance(obj, dict):
        return {k: _replace_kind_tokens(v, src_kind, dst_kind) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_replace_kind_tokens(x, src_kind, dst_kind) for x in obj]
    if isinstance(obj, str):
        if obj == src_kind:
            return dst_kind
        suffix = f"-{src_kind}"
        if obj.endswith(suffix):
            return f"{obj[: -len(suffix)]}-{dst_kind}"
    return obj


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
    if recipe.get("source_preparation") == "CORE-FIXTURE-SOURCE-REBUILD-01":
        _rebuild_source_graph(raw)
    for change in recipe.get("final_input_changes", []):
        if change.get("property_present") is False:
            _remove_path(raw, change["property_path"])
        else:
            _set_path(raw, change["property_path"], change["value"])
    return raw


class TestCompareKindObligationTrace(unittest.TestCase):
    """Verify H009 L5#/functions/4 compare_kind_obligation_trace against L5/L8 contracts."""

    @classmethod
    def setUpClass(cls):
        cls.fixture_data = _FIXTURE
        cls.normal_input = cls.fixture_data["normal_input"]
        cls.recipes_by_id = {
            recipe["id"]: recipe for recipe in cls.fixture_data["recipes"]
        }
        cls.normal_oracle = cls.fixture_data["compare_kind_obligation_trace_oracle"]
        cls.f04_negative_cases = {
            case["id"]: case for case in cls.fixture_data["f04_negative_cases"]
        }
        cls.add_14_case = cls.fixture_data["add_14_case"]

    def _run_trace(self, raw_input):
        snapshot = copy.deepcopy(raw_input)
        validated = validate_application_input(raw_input)
        applicability = compare_applicability({"validated": validated})
        try:
            result = compare_kind_obligation_trace(
                {
                    "validated": validated,
                    "compare_applicability": applicability,
                }
            )
        except NotImplementedError as exc:
            self.fail(
                f"compare_kind_obligation_trace raised NotImplementedError: {exc}"
            )
        self.assertEqual(raw_input, snapshot, "Input must not be mutated (effect=none)")
        return result, validated, applicability

    def _apply_f04_mutation(self, neg_case):
        cid = neg_case["id"]
        tm = neg_case["typed_mutation"]
        target = tm["target"]
        op = tm["operation"]
        val = tm["synthetic_value"]

        if cid == "HARNESS-L8-009-F04-NEG-01":
            raw = _resolve_recipe_raw("CORE-NORMAL-CONNECTION-REQUIRED")
            raw["obligations"] = [
                ob
                for ob in raw.get("obligations", [])
                if ob.get("kind") != val["remove_kind"]
            ]
            raw.setdefault("claims", []).append(
                {
                    "ref": {
                        "identity": "claim-neg-01-connection-by-unit",
                        "revision": "synthetic-A",
                        "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                        "owner": "synthetic-core-owner",
                        "source_locator": None,
                        "sha256": None,
                    },
                    "subject_ref": copy.deepcopy(raw["binding"]["template_ref"]),
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["claim_kind"],
                    "proposed_value": {"basis": val["basis"]},
                    "basis_refs": [copy.deepcopy(raw["binding"]["template_ref"])],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F04-NEG-02":
            raw = _resolve_recipe_raw("CORE-NORMAL-COMPOSITE-REQUIRED")
            raw["obligations"] = [
                ob
                for ob in raw.get("obligations", [])
                if ob.get("kind") != val["remove_kind"]
            ]
            raw.setdefault("claims", []).append(
                {
                    "ref": {
                        "identity": "claim-neg-02-composite-by-lower-sum",
                        "revision": "synthetic-A",
                        "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                        "owner": "synthetic-core-owner",
                        "source_locator": None,
                        "sha256": None,
                    },
                    "subject_ref": copy.deepcopy(raw["binding"]["template_ref"]),
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-core-owner",
                    "kind": val["claim_kind"],
                    "proposed_value": {"basis": val["basis"]},
                    "basis_refs": [copy.deepcopy(raw["binding"]["template_ref"])],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F04-NEG-03":
            raw = _fixture_normal_input()
            assert target == "trace_edges" and op == "remove" and val == "reverse-edge"
            raw["trace_edges"] = [
                edge
                for edge in raw["trace_edges"]
                if edge.get("direction") != "reverse"
            ]
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F04-NEG-04":
            raw = _fixture_normal_input()
            assert target == "trace_edges[obligation-design].to_ref.revision"
            for edge in raw["trace_edges"]:
                if (
                    edge.get("direction") == "forward"
                    and edge.get("from_ref", {}).get("identity")
                    == "synthetic-obligation-unit"
                    and edge.get("to_ref", {}).get("identity")
                    == "synthetic-design-unit"
                ):
                    edge["to_ref"]["revision"] = val
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F04-NEG-05":
            raw = _fixture_normal_input()
            assert target == "trace_edges[design-pair].to_ref.revision"
            for edge in raw["trace_edges"]:
                if (
                    edge.get("direction") == "forward"
                    and edge.get("from_ref", {}).get("identity")
                    == "synthetic-design-unit"
                    and edge.get("to_ref", {}).get("identity") == "synthetic-pair-unit"
                ):
                    edge["to_ref"]["revision"] = val
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F04-NEG-06":
            raw = _fixture_normal_input()
            assert target == "claims" and op == "append"
            raw.setdefault("claims", []).append(
                {
                    "ref": {
                        "identity": "claim-neg-06-extraction-design-complete",
                        "revision": "synthetic-A",
                        "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                        "owner": "synthetic-design-owner",
                        "source_locator": None,
                        "sha256": None,
                    },
                    "subject_ref": copy.deepcopy(raw["binding"]["template_ref"]),
                    "binding": copy.deepcopy(raw["binding"]),
                    "actor": "synthetic-design-owner",
                    "kind": val["kind"],
                    "proposed_value": {"basis": val["basis"]},
                    "basis_refs": [copy.deepcopy(raw["binding"]["template_ref"])],
                }
            )
            _rebuild_source_graph(raw)
            return raw

        if cid == "HARNESS-L8-009-F04-NEG-07":
            raw = _resolve_recipe_raw("CORE-NORMAL-COMPOSITE-REQUIRED")
            assert target == "obligations" and op == "replace_selected"
            ob0 = copy.deepcopy(raw["obligations"][0])
            ob0["kind"] = val["kind"]
            ob0["meaning"] = {
                "members": copy.deepcopy(val["members"]),
                "source_reason": val["source_reason"],
            }
            unit_ob = copy.deepcopy(self.normal_input["obligations"][0])
            raw["obligations"] = [ob0, unit_ob]
            _rebuild_source_graph(raw)
            return raw

        raise AssertionError(f"Unhandled negative case: {cid}")

    def test_normal_oracle_compare_kind_obligation_trace(self):
        """HARNESS-L8-009-NORMAL-compare_kind_obligation_trace on CORE-NORMAL-UNIT-REQUIRED."""
        self.assertEqual(
            self.normal_oracle["id"],
            "HARNESS-L8-009-NORMAL-compare_kind_obligation_trace",
        )
        raw = _fixture_normal_input()
        res, validated, _ = self._run_trace(raw)

        self.assertEqual(res["producer_symbol"], "compare_kind_obligation_trace")
        self.assertEqual(res["input_binding"], raw["binding"])
        self.assertEqual(res["original_axes"], [])
        self.assertEqual(res["findings"], [])

        mat = res["material"]
        self.assertEqual(
            set(mat.keys()),
            {
                "obligations",
                "required_trace_refs",
                "matched_edge_refs",
                "missing_trace_refs",
            },
        )
        self.assertEqual(mat["obligations"], raw["obligations"])
        self.assertEqual(
            mat["required_trace_refs"],
            [tr["ref"] for tr in raw["trace_requirements"]],
        )
        self.assertEqual(
            mat["matched_edge_refs"],
            [te["ref"] for te in raw["trace_edges"]],
        )
        self.assertEqual(mat["missing_trace_refs"], [])

    def test_add_14_independent_three_kinds(self):
        """HARNESS-L8-009-ADD-14: independent-three-kinds (unit, connection, composite)."""
        self.assertEqual(self.add_14_case["id"], "HARNESS-L8-009-ADD-14")
        recipe = self.recipes_by_id["CORE-ADD-INPUT-14"]
        fixture_refs = recipe["input_fixture_refs"]
        self.assertEqual(
            fixture_refs,
            [
                "CORE-NORMAL-UNIT-REQUIRED",
                "CORE-NORMAL-CONNECTION-REQUIRED",
                "CORE-NORMAL-COMPOSITE-REQUIRED",
            ],
        )

        expected_kinds = ["unit", "connection", "composite"]
        expected_identities = [
            "synthetic-obligation-unit",
            "synthetic-obligation-connection",
            "synthetic-obligation-composite",
        ]

        for ref_id, exp_kind, exp_ob_id in zip(
            fixture_refs, expected_kinds, expected_identities
        ):
            raw = _resolve_recipe_raw(ref_id)
            res, validated, _ = self._run_trace(raw)
            self.assertEqual(res["findings"], [])
            mat = res["material"]
            self.assertEqual(len(mat["obligations"]), 1)
            self.assertEqual(mat["obligations"][0]["kind"], exp_kind)
            self.assertEqual(mat["obligations"][0]["ref"]["identity"], exp_ob_id)
            self.assertEqual(mat["obligations"][0]["binding"], raw["binding"])
            self.assertEqual(len(mat["required_trace_refs"]), 6)
            self.assertEqual(len(mat["matched_edge_refs"]), 6)
            self.assertEqual(mat["missing_trace_refs"], [])

    def test_f04_neg_01_connection_by_unit_only(self):
        """HARNESS-L8-009-F04-NEG-01: connection_by_unit_only."""
        neg = self.f04_negative_cases["HARNESS-L8-009-F04-NEG-01"]
        raw = self._apply_f04_mutation(neg)
        res, validated, _ = self._run_trace(raw)

        codes = [f["code"] for f in res["findings"]]
        self.assertIn("connection_by_unit_only", codes)
        finding = next(
            f for f in res["findings"] if f["code"] == "connection_by_unit_only"
        )
        self.assertEqual(
            finding["rule_ref"], "HARNESS-L5-009-R-connection_by_unit_only"
        )
        self.assertEqual(finding["axis"], "connection.obligation")
        self.assertEqual(finding["state"], "missing")
        self.assertEqual(finding["backflow_owner"], "core_owner")
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertTrue(finding["source_refs"])
        self.assertTrue(
            isinstance(finding["reason"], str) and finding["reason"].strip()
        )

    def test_f04_neg_02_composite_by_lower_sum(self):
        """HARNESS-L8-009-F04-NEG-02: composite_by_lower_sum."""
        neg = self.f04_negative_cases["HARNESS-L8-009-F04-NEG-02"]
        raw = self._apply_f04_mutation(neg)
        res, validated, _ = self._run_trace(raw)

        codes = [f["code"] for f in res["findings"]]
        self.assertIn("composite_by_lower_sum", codes)
        finding = next(
            f for f in res["findings"] if f["code"] == "composite_by_lower_sum"
        )
        self.assertEqual(finding["rule_ref"], "HARNESS-L5-009-R-composite_by_lower_sum")
        self.assertEqual(finding["axis"], "composite.obligation")
        self.assertEqual(finding["state"], "missing")
        self.assertEqual(finding["backflow_owner"], "core_owner")
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertTrue(finding["source_refs"])

    def test_f04_neg_03_one_way_trace(self):
        """HARNESS-L8-009-F04-NEG-03: one_way_trace."""
        neg = self.f04_negative_cases["HARNESS-L8-009-F04-NEG-03"]
        raw = self._apply_f04_mutation(neg)
        res, validated, _ = self._run_trace(raw)

        codes = [f["code"] for f in res["findings"]]
        self.assertIn("one_way_trace", codes)
        finding = next(f for f in res["findings"] if f["code"] == "one_way_trace")
        self.assertEqual(finding["rule_ref"], "HARNESS-L5-009-R-one_way_trace")
        self.assertEqual(finding["axis"], "trace")
        self.assertEqual(finding["state"], "missing")
        self.assertEqual(finding["backflow_owner"], "trace_owner")
        self.assertEqual(finding["binding"], raw["binding"])

        mat = res["material"]
        matched_ids = [r["identity"] for r in mat["matched_edge_refs"]]
        self.assertEqual(
            matched_ids,
            ["trace-1-forward", "trace-2-forward", "trace-3-forward"],
        )
        missing_ids = [r["identity"] for r in mat["missing_trace_refs"]]
        self.assertEqual(
            missing_ids,
            [
                "trace-required-1-reverse",
                "trace-required-2-reverse",
                "trace-required-3-reverse",
            ],
        )

    def test_f04_neg_04_design_revision_mismatch(self):
        """HARNESS-L8-009-F04-NEG-04: design_revision_mismatch."""
        neg = self.f04_negative_cases["HARNESS-L8-009-F04-NEG-04"]
        raw = self._apply_f04_mutation(neg)
        res, validated, _ = self._run_trace(raw)

        codes = [f["code"] for f in res["findings"]]
        self.assertIn("design_revision_mismatch", codes)
        finding = next(
            f for f in res["findings"] if f["code"] == "design_revision_mismatch"
        )
        self.assertEqual(
            finding["rule_ref"], "HARNESS-L5-009-R-design_revision_mismatch"
        )
        self.assertEqual(finding["axis"], "design.binding")
        self.assertEqual(finding["state"], "conflict")
        self.assertEqual(finding["backflow_owner"], "design_owner")
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertIn("synthetic-A", finding["reason"])
        self.assertIn("different-design-revision", finding["reason"])

        mat = res["material"]
        matched_ids = [r["identity"] for r in mat["matched_edge_refs"]]
        self.assertNotIn("trace-2-forward", matched_ids)
        self.assertEqual(len(matched_ids), 5)
        missing_ids = [r["identity"] for r in mat["missing_trace_refs"]]
        self.assertEqual(missing_ids, ["trace-required-2-forward"])

    def test_f04_neg_04_design_revision_mismatch_without_design_in_identity(self):
        """HARNESS-L8-009-F04-NEG-04: structural design endpoint resolution without 'design' substring."""
        neg = self.f04_negative_cases["HARNESS-L8-009-F04-NEG-04"]
        raw = self._apply_f04_mutation(neg)
        for coll in ("trace_requirements", "trace_edges"):
            for item in raw.get(coll, []):
                for endpoint in ("from_ref", "to_ref"):
                    ref = item.get(endpoint)
                    if (
                        isinstance(ref, dict)
                        and ref.get("identity") == "synthetic-design-unit"
                    ):
                        ref["identity"] = "synthetic-artifact-unit"
                        ref["owner"] = "synthetic-artifact-owner"
        _rebuild_source_graph(raw)
        res, validated, _ = self._run_trace(raw)

        codes = [f["code"] for f in res["findings"]]
        self.assertIn("design_revision_mismatch", codes)
        finding = next(
            f for f in res["findings"] if f["code"] == "design_revision_mismatch"
        )
        self.assertEqual(
            finding["rule_ref"], "HARNESS-L5-009-R-design_revision_mismatch"
        )
        self.assertEqual(finding["axis"], "design.binding")
        self.assertEqual(finding["state"], "conflict")
        self.assertEqual(finding["backflow_owner"], "design_owner")
        self.assertEqual(finding["subject_ref"]["identity"], "synthetic-artifact-unit")

    def test_f04_neg_05_pair_revision_mismatch(self):
        """HARNESS-L8-009-F04-NEG-05: pair_revision_mismatch."""
        neg = self.f04_negative_cases["HARNESS-L8-009-F04-NEG-05"]
        raw = self._apply_f04_mutation(neg)
        res, validated, _ = self._run_trace(raw)

        codes = [f["code"] for f in res["findings"]]
        self.assertIn("pair_revision_mismatch", codes)
        finding = next(
            f for f in res["findings"] if f["code"] == "pair_revision_mismatch"
        )
        self.assertEqual(finding["rule_ref"], "HARNESS-L5-009-R-pair_revision_mismatch")
        self.assertEqual(finding["axis"], "pair.binding")
        self.assertEqual(finding["state"], "conflict")
        self.assertEqual(finding["backflow_owner"], "oracle_owner")
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertIn("synthetic-A", finding["reason"])
        self.assertIn("different-pair-revision", finding["reason"])

        mat = res["material"]
        matched_ids = [r["identity"] for r in mat["matched_edge_refs"]]
        self.assertNotIn("trace-3-forward", matched_ids)
        self.assertEqual(len(matched_ids), 5)
        missing_ids = [r["identity"] for r in mat["missing_trace_refs"]]
        self.assertEqual(missing_ids, ["trace-required-3-forward"])

    def test_f04_neg_06_extraction_as_design_complete(self):
        """HARNESS-L8-009-F04-NEG-06: extraction_as_design_complete."""
        neg = self.f04_negative_cases["HARNESS-L8-009-F04-NEG-06"]
        raw = self._apply_f04_mutation(neg)
        res, validated, _ = self._run_trace(raw)

        codes = [f["code"] for f in res["findings"]]
        self.assertIn("extraction_as_design_complete", codes)
        finding = next(
            f for f in res["findings"] if f["code"] == "extraction_as_design_complete"
        )
        self.assertEqual(
            finding["rule_ref"], "HARNESS-L5-009-R-extraction_as_design_complete"
        )
        self.assertEqual(finding["axis"], "design_completion_claim")
        self.assertEqual(finding["state"], "unknown")
        self.assertEqual(finding["backflow_owner"], "design_owner")
        self.assertEqual(finding["binding"], raw["binding"])
        self.assertEqual(len(res["material"]["obligations"]), 1)

        # Structural check without literal '041-extraction-success' string:
        # design_complete claim lacking concrete design + paired oracle basis_refs
        raw_struct = copy.deepcopy(raw)
        raw_struct["claims"][0]["proposed_value"] = {"basis": "extraction-only"}
        res_struct, _, _ = self._run_trace(raw_struct)
        self.assertIn(
            "extraction_as_design_complete",
            [f["code"] for f in res_struct["findings"]],
        )

    def _f04_design_complete_claim_input(self, basis_refs, claim_identity):
        raw = _fixture_normal_input()
        raw["claims"].append(
            {
                "ref": {
                    "identity": claim_identity,
                    "revision": "synthetic-A",
                    "scope": copy.deepcopy(raw["binding"]["product_scope"]),
                    "owner": "synthetic-design-owner",
                    "source_locator": None,
                    "sha256": None,
                },
                "subject_ref": copy.deepcopy(raw["binding"]["template_ref"]),
                "binding": copy.deepcopy(raw["binding"]),
                "actor": "synthetic-design-owner",
                "kind": "design_complete",
                "proposed_value": {"basis": "041-extraction-success"},
                "basis_refs": copy.deepcopy(basis_refs),
            }
        )
        _rebuild_source_graph(raw)
        return raw

    def _f04_design_endpoint_ref(self, raw):
        # The L5/L4/L9 contract's requirement→obligation→design trace is
        # represented by this fixture edge; it is supplied as Claim basis.
        edge = next(
            req
            for req in raw["trace_requirements"]
            if req["ref"]["identity"] == "trace-required-2-forward"
        )
        self.assertEqual(edge["direction"], "forward")
        self.assertEqual(edge["from_ref"], raw["obligations"][0]["ref"])
        return copy.deepcopy(edge["to_ref"])

    def test_f04_design_complete_claim_with_both_basis_refs_has_no_finding(self):
        """F04: both design endpoint and bound oracle refs suppress this finding."""
        raw = _fixture_normal_input()
        basis_refs = [
            self._f04_design_endpoint_ref(raw),
            copy.deepcopy(raw["binding"]["oracle_ref"]),
        ]
        raw = self._f04_design_complete_claim_input(
            basis_refs, "claim-f04-design-and-oracle-basis"
        )

        res, _, _ = self._run_trace(raw)

        self.assertNotIn(
            "extraction_as_design_complete",
            [finding["code"] for finding in res["findings"]],
        )

    def test_f04_design_complete_claim_missing_design_basis_has_finding(self):
        """F04 boundary: oracle basis alone leaves the concrete design basis missing."""
        raw = _fixture_normal_input()
        raw = self._f04_design_complete_claim_input(
            [copy.deepcopy(raw["binding"]["oracle_ref"])],
            "claim-f04-oracle-only-basis",
        )

        res, _, _ = self._run_trace(raw)

        finding = next(
            row
            for row in res["findings"]
            if row["code"] == "extraction_as_design_complete"
        )
        self.assertEqual(finding["axis"], "design_completion_claim")
        self.assertEqual(finding["state"], "unknown")
        self.assertEqual(finding["backflow_owner"], "design_owner")

    def test_f04_design_complete_claim_missing_oracle_basis_has_finding(self):
        """F04 boundary: design basis alone leaves the bound oracle basis missing."""
        raw = _fixture_normal_input()
        raw = self._f04_design_complete_claim_input(
            [self._f04_design_endpoint_ref(raw)],
            "claim-f04-design-only-basis",
        )

        res, _, _ = self._run_trace(raw)

        finding = next(
            row
            for row in res["findings"]
            if row["code"] == "extraction_as_design_complete"
        )
        self.assertEqual(finding["axis"], "design_completion_claim")
        self.assertEqual(finding["state"], "unknown")
        self.assertEqual(finding["backflow_owner"], "design_owner")

    def test_f04_neg_07_composite_empty_without_reason(self):
        """HARNESS-L8-009-F04-NEG-07: composite_empty_without_reason."""
        neg = self.f04_negative_cases["HARNESS-L8-009-F04-NEG-07"]
        raw = self._apply_f04_mutation(neg)
        res, validated, _ = self._run_trace(raw)

        codes = [f["code"] for f in res["findings"]]
        self.assertIn("composite_empty_without_reason", codes)
        finding = next(
            f for f in res["findings"] if f["code"] == "composite_empty_without_reason"
        )
        self.assertEqual(
            finding["rule_ref"], "HARNESS-L5-009-R-composite_empty_without_reason"
        )
        self.assertEqual(finding["axis"], "composite.obligation")
        self.assertEqual(finding["state"], "unknown")
        self.assertEqual(finding["backflow_owner"], "core_owner")
        self.assertEqual(finding["binding"], raw["binding"])

        preserved_kinds = [ob["kind"] for ob in res["material"]["obligations"]]
        self.assertIn("unit", preserved_kinds)
        self.assertNotIn("composite", preserved_kinds)

    def test_all_f04_negative_cases_preserve_input_and_emit_expected_finding(self):
        """All 7 F04 negative cases emit their exact classification/axis/state/owner/rule_ref."""
        self.assertEqual(len(self.f04_negative_cases), 7)
        for cid, neg in self.f04_negative_cases.items():
            with self.subTest(case_id=cid):
                raw = self._apply_f04_mutation(neg)
                res, validated, _ = self._run_trace(raw)
                self.assertEqual(
                    res["producer_symbol"], "compare_kind_obligation_trace"
                )
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

    def test_context_dependency_guard_rejects_mismatched_producer_or_binding(self):
        """CompareKindObligationTraceContext rejects missing or mismatched compare_applicability."""
        raw = _fixture_normal_input()
        validated = validate_application_input(raw)
        applicability = compare_applicability({"validated": validated})

        bad_app = copy.deepcopy(applicability)
        bad_app["producer_symbol"] = "wrong_producer"
        try:
            res = compare_kind_obligation_trace(
                {"validated": validated, "compare_applicability": bad_app}
            )
        except NotImplementedError as exc:
            self.fail(f"Not implemented: {exc}")
        self.assertEqual(res["producer_symbol"], "compare_kind_obligation_trace")
        self.assertEqual(res["material"]["obligations"], [])
        self.assertEqual(res["material"]["matched_edge_refs"], [])
