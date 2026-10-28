"""FN12 project_source_result_references unit tests derived from L3/L4 and L5/L8."""

import copy
import json
from pathlib import Path
import sys
import unittest

UNIT_ROOT = Path(__file__).resolve().parents[1]
FIXTURE_PATH = (
    UNIT_ROOT / "tests" / "fixtures" / "project_source_result_references.json"
)
sys.path.insert(0, str(UNIT_ROOT / "src"))
sys.path.insert(0, str(UNIT_ROOT / "tests"))

from fn12_projection_case_support import (  # noqa: E402
    build_four_dispositions_packet,
    build_single_row_packet,
    make_expected_row,
)
from fn12_projection_cases_baseline import build_baseline_cases  # noqa: E402
from fn12_projection_cases_r1 import build_r1_cases  # noqa: E402
from fn12_projection_cases_r2_r3 import (  # noqa: E402
    build_r2_cases,
    build_r3_cases,
)
import product_template_application  # noqa: E402
from test_application_input import (  # noqa: E402
    _fixture_normal_input,
    _rebuild_source_graph,
)

with FIXTURE_PATH.open(encoding="utf-8") as stream:
    _FIXTURE = json.load(stream)


def _call_fn12(testcase, packet):
    function = getattr(
        product_template_application, "project_source_result_references", None
    )
    if not callable(function):
        testcase.fail("FN12 public project_source_result_references is not implemented")
    before = copy.deepcopy(packet)
    result = function(packet)
    testcase.assertEqual(packet, before, "FN12 must not mutate its input (effect=none)")
    return result


def _rename_identifiers(value, in_scope=False):
    """Bulk-rename Ref identity/revision/owner and scope strings while keeping enum literals."""
    if isinstance(value, str):
        return "renamed::" + value if in_scope else value
    if isinstance(value, list):
        return [_rename_identifiers(item, in_scope=in_scope) for item in value]
    if isinstance(value, dict):
        out = {}
        for key, item in value.items():
            if key in {
                "identity",
                "revision",
                "owner",
                "subject_revision",
                "subject_owner",
                "target_revision",
                "decider",
            } and isinstance(item, str):
                out[key] = "renamed::" + item
            else:
                out[key] = _rename_identifiers(
                    item,
                    in_scope=in_scope
                    or key in {"scope", "product_scope", "subject_scope"},
                )
        return out
    return value


def _structural_signature(projection_result):
    return (
        [
            (
                row.get("candidate_count"),
                row["source_relation"],
                row["source_relation_reason"],
                tuple(row.get("source_relation_difference_paths", ())),
                tuple(row.get("source_relation_missing_paths", ())),
                row["logical_backflow_owner"],
                row["actual_source_qualification"],
                row["actual_recipient_qualification"],
                row["decision_impact"],
            )
            for row in projection_result["rows"]
        ],
        projection_result["input_findings"],
    )


def _run_stage1_compare_applicability(raw_input):
    validated = product_template_application.validate_application_input(raw_input)
    req_axes = product_template_application.compare_required_axes(
        {"validated": validated}
    )
    cand_univ = product_template_application.compare_candidate_universe(
        {"validated": validated, "compare_required_axes": req_axes}
    )
    return product_template_application.compare_applicability(
        {
            "validated": validated,
            "compare_required_axes": req_axes,
            "compare_candidate_universe": cand_univ,
        }
    )


class TestProjectSourceResultReferences(unittest.TestCase):
    def test_discovery_covers_all_73_cases_and_85_rows(self):
        baseline = build_baseline_cases(_FIXTURE)
        r1 = build_r1_cases(_FIXTURE)
        r2 = build_r2_cases(_FIXTURE)
        r3 = build_r3_cases(_FIXTURE)
        self.assertEqual(len(baseline), 24)
        self.assertEqual(len(r1), 21)
        self.assertEqual(len(r2), 15)
        self.assertEqual(len(r3), 13)
        all_cases = baseline + r1 + r2 + r3
        self.assertEqual(len(all_cases), 73)
        case_ids = [cid for cid, _, _ in all_cases]
        self.assertEqual(len(set(case_ids)), 73)
        total_rows = sum(len(exp["rows"]) for _, _, exp in all_cases)
        self.assertEqual(total_rows, 85)

    def _assert_case_group(self, group_cases):
        for case_id, packet, expected in group_cases:
            with self.subTest(case_id=case_id):
                actual = _call_fn12(self, packet)
                self.assertEqual(actual, expected, f"Mismatch in {case_id}")

    def test_baseline_24_cases(self):
        self._assert_case_group(build_baseline_cases(_FIXTURE))

    def test_r1_21_cases(self):
        self._assert_case_group(build_r1_cases(_FIXTURE))

    def test_r2_15_cases(self):
        self._assert_case_group(build_r2_cases(_FIXTURE))

    def test_r3_13_cases(self):
        self._assert_case_group(build_r3_cases(_FIXTURE))

    def test_producer_consumer_chain_and_source_port_binding_oracles(self):
        raw_in = _fixture_normal_input()
        for patch_op in _FIXTURE["chain_synthetic_input_overlay"]:
            if patch_op["path"] == "/input_ref":
                raw_in["input_ref"] = copy.deepcopy(patch_op["value"])
            elif patch_op["path"] == "/conditions/0/condition_value":
                raw_in["conditions"][0]["condition_value"] = copy.deepcopy(
                    patch_op["value"]
                )
        _rebuild_source_graph(raw_in)
        comp_app = _run_stage1_compare_applicability(raw_in)
        computed_rows = copy.deepcopy(comp_app["material"]["source_projection_rows"])
        indep_port = copy.deepcopy(_FIXTURE["chain_independent_source_envelope_port"])

        # 1. PORT-PRESENT-DISTINCT-FROM-APPLICATION-SOURCES
        pkt_present = {
            "application_input": copy.deepcopy(raw_in),
            "computed_rows": copy.deepcopy(computed_rows),
            "source_envelopes": copy.deepcopy(indep_port),
        }
        self.assertNotEqual(
            pkt_present["source_envelopes"],
            pkt_present["application_input"]["sources"],
        )
        res_present = _call_fn12(self, pkt_present)
        exp_present = {
            "rows": [
                make_expected_row(
                    pkt_present,
                    0,
                    indep_port,
                    "content_corresponding",
                    "all_declared_fields_equal",
                    owner="not_required",
                )
            ],
            "input_findings": [],
        }
        self.assertEqual(res_present, exp_present)

        # 2. PORT-ABSENT-WITH-APPLICATION-SOURCES-PRESENT
        pkt_absent = {
            "application_input": copy.deepcopy(raw_in),
            "computed_rows": copy.deepcopy(computed_rows),
        }
        self.assertTrue(len(pkt_absent["application_input"]["sources"]) > 0)
        res_absent = _call_fn12(self, pkt_absent)
        exp_absent = {
            "rows": [
                make_expected_row(
                    pkt_absent,
                    0,
                    [],
                    "unprovided",
                    "source_envelopes_absent",
                    owner="unknown",
                )
            ],
            "input_findings": [],
        }
        self.assertEqual(res_absent, exp_absent)

        # 3. PORT-EXPLICIT-NULL
        pkt_null = {
            "application_input": copy.deepcopy(raw_in),
            "computed_rows": copy.deepcopy(computed_rows),
            "source_envelopes": None,
        }
        res_null = _call_fn12(self, pkt_null)
        exp_null = {
            "rows": [
                make_expected_row(
                    pkt_null,
                    0,
                    [],
                    "unresolved",
                    "source_envelopes_explicit_null_or_non_array",
                    owner="unknown",
                )
            ],
            "input_findings": [],
        }
        self.assertEqual(res_null, exp_null)

        # 4. Existing generic input (ApplicationInput.sources lacks row_binding/result_ref)
        pkt_generic = {
            "application_input": copy.deepcopy(raw_in),
            "computed_rows": copy.deepcopy(computed_rows),
            "source_envelopes": copy.deepcopy(raw_in["sources"]),
        }
        res_generic = _call_fn12(self, pkt_generic)
        self.assertEqual(res_generic["rows"][0]["source_relation"], "unresolved")
        self.assertEqual(
            res_generic["rows"][0]["source_relation_reason"],
            "candidate_relation_unresolved",
        )
        self.assertEqual(
            res_generic["rows"][0]["source_relation_missing_paths"],
            [
                "/row_binding/application_policy_ref/identity",
                "/row_binding/template_ref/identity",
            ],
        )

    def test_condition_pair_member_and_one_sided_absent_contrasts(self):
        raw_in = _fixture_normal_input()
        raw_in["input_ref"] = copy.deepcopy(
            _FIXTURE["chain_synthetic_input_overlay"][0]["value"]
        )
        raw_in["conditions"][0]["condition_value"] = True
        _rebuild_source_graph(raw_in)
        comp_app = _run_stage1_compare_applicability(raw_in)
        base_pkt = {
            "application_input": copy.deepcopy(raw_in),
            "computed_rows": copy.deepcopy(
                comp_app["material"]["source_projection_rows"]
            ),
            "source_envelopes": copy.deepcopy(
                _FIXTURE["chain_independent_source_envelope_port"]
            ),
        }

        # CORE009-F03-CONDITION-PAIR-VALUE-ABSENT-BOTH-SIDES
        pkt_val_absent = copy.deepcopy(base_pkt)
        pkt_val_absent["computed_rows"][0]["condition_pairs"][0].pop("condition_value")
        pkt_val_absent["source_envelopes"][0]["material"]["condition_pairs"][0].pop(
            "condition_value"
        )
        res_val_absent = _call_fn12(self, pkt_val_absent)
        self.assertEqual(res_val_absent["rows"][0]["source_relation"], "unresolved")
        self.assertEqual(
            res_val_absent["rows"][0]["source_relation_reason"],
            "candidate_source_members_missing",
        )
        self.assertEqual(
            res_val_absent["rows"][0]["source_relation_missing_paths"],
            [
                "/material/condition_pairs/0/condition_value",
                "/computed_row/condition_pairs/0/condition_value",
            ],
        )
        self.assertEqual(res_val_absent["rows"][0]["logical_backflow_owner"], "HARNESS")

        # CORE009-COND-ONE-SIDED-COLLECTION-ABSENT-VALUE-ABSENT
        pkt_onesided = copy.deepcopy(pkt_val_absent)
        pkt_onesided["source_envelopes"][0]["material"].pop("condition_pairs")
        res_onesided = _call_fn12(self, pkt_onesided)
        self.assertEqual(res_onesided["rows"][0]["source_relation"], "unresolved")
        self.assertEqual(
            res_onesided["rows"][0]["source_relation_reason"],
            "candidate_source_members_missing",
        )
        self.assertEqual(
            res_onesided["rows"][0]["source_relation_missing_paths"],
            ["/material/condition_pairs"],
        )
        self.assertEqual(res_onesided["rows"][0]["logical_backflow_owner"], "HARNESS")

        # Non-object element inside condition_pairs array
        pkt_nonobj_cp = copy.deepcopy(base_pkt)
        pkt_nonobj_cp["source_envelopes"][0]["material"]["condition_pairs"] = [123]
        res_nonobj_cp = _call_fn12(self, pkt_nonobj_cp)
        self.assertEqual(res_nonobj_cp["rows"][0]["source_relation"], "unresolved")
        self.assertEqual(
            res_nonobj_cp["rows"][0]["source_relation_reason"],
            "candidate_source_members_missing",
        )
        self.assertEqual(
            res_nonobj_cp["rows"][0]["source_relation_missing_paths"],
            ["/material/condition_pairs/0"],
        )

    def test_producer_condition_presence_probes_with_projection(self):
        for probe_id in (
            "CORE009-COND-VALUE-ABSENT",
            "CORE009-COND-VALUE-NULL",
            "CORE009-COND-VALUE-TRUE",
            "CORE009-COND-REF-MISSING",
            "CORE009-COND-REF-AMBIGUOUS",
            "CORE009-COND-EMPTY-REF-LIST",
        ):
            with self.subTest(probe_id=probe_id):
                raw_in = _fixture_normal_input()
                raw_in["input_ref"] = copy.deepcopy(
                    _FIXTURE["chain_synthetic_input_overlay"][0]["value"]
                )
                if probe_id == "CORE009-COND-VALUE-NULL":
                    raw_in["conditions"][0]["condition_value"] = None
                elif probe_id == "CORE009-COND-VALUE-TRUE":
                    raw_in["conditions"][0]["condition_value"] = True
                elif probe_id == "CORE009-COND-REF-MISSING":
                    raw_in["conditions"] = []
                elif probe_id == "CORE009-COND-REF-AMBIGUOUS":
                    dup_c = copy.deepcopy(raw_in["conditions"][0])
                    dup_c["axis_fact_ref"]["identity"] = "axis-fact-3"
                    raw_in["conditions"].append(dup_c)
                elif probe_id == "CORE009-COND-EMPTY-REF-LIST":
                    raw_in["application_policies"][0]["condition_refs"] = []
                _rebuild_source_graph(raw_in)
                comp_app = _run_stage1_compare_applicability(raw_in)
                pkt = {
                    "application_input": copy.deepcopy(raw_in),
                    "computed_rows": copy.deepcopy(
                        comp_app["material"]["source_projection_rows"]
                    ),
                    "source_envelopes": copy.deepcopy(
                        _FIXTURE["chain_independent_source_envelope_port"]
                    ),
                }
                res = _call_fn12(self, pkt)
                row0 = res["rows"][0]
                if probe_id == "CORE009-COND-VALUE-TRUE":
                    self.assertEqual(row0["source_relation"], "content_corresponding")
                elif probe_id == "CORE009-COND-VALUE-ABSENT":
                    self.assertEqual(row0["source_relation"], "unresolved")
                    self.assertEqual(
                        row0["source_relation_missing_paths"],
                        ["/computed_row/condition_pairs/0/condition_value"],
                    )
                elif probe_id == "CORE009-COND-VALUE-NULL":
                    self.assertEqual(row0["source_relation"], "content_conflict")
                    self.assertEqual(
                        row0["source_relation_difference_paths"],
                        ["/material/condition_pairs/0/condition_value"],
                    )
                elif probe_id in (
                    "CORE009-COND-REF-MISSING",
                    "CORE009-COND-REF-AMBIGUOUS",
                ):
                    self.assertEqual(
                        row0["computed_condition_pairs"], {"presence": "absent"}
                    )
                    self.assertEqual(row0["source_relation"], "content_conflict")
                    self.assertEqual(
                        row0["source_relation_reason"], "declared_fields_differ"
                    )
                    self.assertEqual(
                        row0["source_relation_difference_paths"],
                        ["/material/disposition"],
                    )
                    self.assertEqual(
                        row0["source_relation_missing_paths"],
                        ["/computed_row/condition_pairs"],
                    )
                elif probe_id == "CORE009-COND-EMPTY-REF-LIST":
                    self.assertEqual(
                        row0["computed_condition_pairs"],
                        {"presence": "present", "value": []},
                    )
                    self.assertEqual(row0["source_relation"], "content_conflict")
                    self.assertEqual(
                        row0["source_relation_reason"], "declared_fields_differ"
                    )
                    self.assertEqual(
                        row0["source_relation_difference_paths"],
                        ["/material/disposition"],
                    )
                    self.assertEqual(
                        row0["source_relation_missing_paths"],
                        ["/computed_row/condition_pairs/0"],
                    )

    def test_na_four_attributes_required_and_unknown_never_converted_to_na(self):
        for attr in (
            "reason",
            "decider",
            "target_revision",
            "reentry_condition",
        ):
            with self.subTest(na_attr=attr):
                pkt = build_single_row_packet(_FIXTURE, 2)
                pkt["computed_rows"][0]["na_attributes"][attr] = None
                pkt["source_envelopes"][0]["material"]["na_attributes"][attr] = None
                res = _call_fn12(self, pkt)
                row0 = res["rows"][0]
                self.assertEqual(row0["source_relation"], "unresolved")
                self.assertEqual(
                    row0["source_relation_reason"],
                    "candidate_source_members_missing",
                )
                self.assertEqual(
                    row0["source_relation_missing_paths"],
                    [
                        f"/material/na_attributes/{attr}",
                        f"/computed_row/na_attributes/{attr}",
                    ],
                )
                self.assertEqual(row0["logical_backflow_owner"], "HARNESS")
                self.assertEqual(
                    row0["computed_disposition"],
                    {"presence": "present", "value": "na"},
                )

        # Both sides na_attributes absent on disposition="na"
        pkt_na_absent = build_single_row_packet(_FIXTURE, 2)
        pkt_na_absent["computed_rows"][0].pop("na_attributes")
        pkt_na_absent["source_envelopes"][0]["material"].pop("na_attributes")
        res_na_absent = _call_fn12(self, pkt_na_absent)
        self.assertEqual(res_na_absent["rows"][0]["source_relation"], "unresolved")
        self.assertEqual(
            res_na_absent["rows"][0]["source_relation_missing_paths"],
            ["/material/na_attributes", "/computed_row/na_attributes"],
        )

    def test_owner_routing_usage_record_and_multiple_axes_unknown(self):
        # /material/usage_record routes to OS when unmapped comparison or multi-axis occurs
        pkt_multi = build_single_row_packet(_FIXTURE, 0)
        pkt_multi["source_envelopes"][0]["row_binding"]["binding"]["requirement_ref"][
            "revision"
        ] = "rev-B"
        pkt_multi["source_envelopes"][0]["material"]["disposition"] = "conditional"
        res_multi = _call_fn12(self, pkt_multi)
        self.assertEqual(res_multi["rows"][0]["source_relation"], "content_conflict")
        self.assertEqual(res_multi["rows"][0]["logical_backflow_owner"], "unknown")

        # Bool vs integer distinction in condition_value comparison
        pkt_bool_num = build_single_row_packet(_FIXTURE, 1)
        pkt_bool_num["computed_rows"][0]["condition_pairs"][0]["condition_value"] = True
        pkt_bool_num["source_envelopes"][0]["material"]["condition_pairs"][0][
            "condition_value"
        ] = 1
        res_bool_num = _call_fn12(self, pkt_bool_num)
        self.assertEqual(res_bool_num["rows"][0]["source_relation"], "content_conflict")

        pkt_int_float = build_single_row_packet(_FIXTURE, 1)
        pkt_int_float["computed_rows"][0]["condition_pairs"][0]["condition_value"] = 2
        pkt_int_float["source_envelopes"][0]["material"]["condition_pairs"][0][
            "condition_value"
        ] = 2.0
        res_int_float = _call_fn12(self, pkt_int_float)
        self.assertEqual(
            res_int_float["rows"][0]["source_relation"], "content_corresponding"
        )

    def test_projection_decisions_do_not_depend_on_identifier_spelling(self):
        original_pkt = build_four_dispositions_packet(_FIXTURE)
        renamed_pkt = _rename_identifiers(original_pkt)
        original_res = _call_fn12(self, original_pkt)
        renamed_res = _call_fn12(self, renamed_pkt)
        self.assertEqual(
            _structural_signature(original_res),
            _structural_signature(renamed_res),
        )
        self.assertEqual(
            renamed_res["rows"][0]["application_policy_ref"]["value"]["identity"],
            "renamed::policy-required",
        )


if __name__ == "__main__":
    unittest.main()
