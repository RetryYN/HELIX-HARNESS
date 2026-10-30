"""FN13 publish_general_proposal_exchange_public unit tests derived from L4/L5/L8/L9."""

import copy
import hashlib
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

UNIT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(UNIT_ROOT / "src"))
sys.path.insert(0, str(UNIT_ROOT / "tests"))

from gpe_case_support import (  # noqa: E402
    GPE_FIXTURE,
    assert_authority_port_failure,
    assert_header_port_failure,
    assert_public_endpoint_structure,
    build_base_request,
    build_empty_universe_raw_input,
    build_exactness_defect_raw_input,
    build_mixed_na_candidate_raw_input,
    build_na_only_raw_input,
    build_renamed_request,
    build_residual_valid_sibling_raw_input,
    call_fn13,
    compute_upstream_comparisons,
    default_relation_occurrence,
    expected_body_issue,
)


class TestGeneralProposalExchange(unittest.TestCase):
    """L8 unit verification for HARNESS-L5-009-publish_general_proposal_exchange_public."""

    def test_public_proposal_publication_endpoint_contract(self):
        """Verify L8#/additional_unit_cases/24 and normal_function_oracles/12."""
        req = build_base_request()
        pub = call_fn13(self, req)

        import application_general_proposal_exchange as gpe_mod

        calls = []
        orig_builder = gpe_mod.publish_general_proposal_exchange

        def _spy(r):
            calls.append(r)
            return orig_builder(r)

        with patch.object(
            gpe_mod, "publish_general_proposal_exchange", side_effect=_spy
        ):
            pub_delegated = call_fn13(self, req)

        self.assertEqual(len(calls), 1)
        self.assertEqual(pub_delegated, pub)
        assert_public_endpoint_structure(self, pub)

    def test_finite_case_00_f01_required(self):
        """Verify finite_cases/0 F01-required positive exactness and publication."""
        req = build_base_request()
        raw_in = json.loads(req["source_occurrences"][0]["source_json_utf8"])[
            "records"
        ][0]["payload"]["caller_inputs"]["validation_input"]["raw"]
        _, c0, c1, _ = compute_upstream_comparisons(raw_in)
        pub = call_fn13(self, req)
        gv = pub["general_view"]
        self.assertEqual(gv["attempt_capture"]["operation_role"]["tag"], "ready")
        nd = gv["attempt_capture"]["native_dispatch"]
        self.assertEqual(nd["tag"], "returned")
        self.assertEqual(nd["native_call_count"], 1)
        self.assertEqual(nd["symbol"], "build_general_native_proposal_record_detail")

        n_val = nd["value"]["value"]
        p_obs = n_val["capture"]["capture"]["caller_return"]["producer_observations"]
        self.assertEqual(p_obs[0]["comparison"], c0)
        self.assertEqual(p_obs[1]["comparison"], c1)
        self.assertEqual(len(n_val["record"]["candidate_entries"]), 1)
        self.assertEqual(n_val["record"]["na_exclusion_entries"], [])
        self.assertEqual(n_val["record"]["residual_entries"], [])
        self.assertEqual(
            n_val["record"]["coverage"]["completion"], "covered_as_captured"
        )
        self.assertEqual(
            n_val["record"]["membership_completion"], "resolved_for_captured_members"
        )

        u_obs = gv["universe_observation"]
        self.assertEqual(u_obs["tag"], "observed")
        self.assertEqual(
            u_obs["comparison_location"]["pointer"],
            "/attempt_capture/native_dispatch/value/value/capture/capture/caller_return/producer_observations/1/comparison",
        )
        self.assertEqual(len(u_obs["value"]["universe_steps"]), 51)
        self.assertEqual(len(u_obs["value"]["member_observations"]), 1)
        self.assertEqual(len(u_obs["value"]["candidate_steps"]), 1)
        self.assertEqual(u_obs["value"]["conclusion"]["tag"], "exact_for_context")
        self.assertEqual(len(u_obs["value"]["conclusion"]["basis_steps"]), 68)

        self.assertEqual(len(gv["relation_observations"]), 1)
        rel_obs = gv["relation_observations"][0]
        self.assertEqual(rel_obs["native_ref4"]["tag"], "formed")
        self.assertEqual(rel_obs["native_ref4"]["value"]["identity"], "T1")
        self.assertEqual(gv["proposed_body"]["tag"], "formed")
        self.assertEqual(
            gv["proposed_body"]["value"]["proposed_refs"],
            [rel_obs["native_ref4"]["value"]],
        )
        self.assertEqual(gv["body_issues"], [])
        self.assertEqual(pub["header_port"]["tag"], "returned")
        self.assertEqual(pub["header_decode"]["tag"], "formed")
        self.assertEqual(pub["authority_port"]["tag"], "returned")
        self.assertEqual(pub["source_candidate"]["tag"], "formed")
        sc_val = pub["source_candidate"]["value"]
        self.assertEqual(
            hashlib.sha256(sc_val["source_json_utf8"].encode("utf-8")).hexdigest(),
            sc_val["source_sha256"],
        )
        self.assertEqual(pub["publication_issues"], [])

    def test_finite_case_01_f02_qualified_empty(self):
        """Verify finite_cases/1 F02-qualified-empty explicit empty candidate universe."""
        req = build_base_request(
            validation_input={"tag": "native", "raw": build_empty_universe_raw_input()},
            relation_occurrences=[],
        )
        pub = call_fn13(self, req)
        gv = pub["general_view"]
        n_rec = gv["attempt_capture"]["native_dispatch"]["value"]["value"]["record"]
        self.assertEqual(n_rec["candidate_entries"], [])
        self.assertEqual(n_rec["na_exclusion_entries"], [])
        self.assertEqual(n_rec["residual_entries"], [])
        self.assertEqual(n_rec["coverage"]["completion"], "covered_as_captured")
        self.assertEqual(
            n_rec["membership_completion"], "resolved_for_captured_members"
        )
        u_obs = gv["universe_observation"]["value"]
        self.assertEqual(len(u_obs["universe_steps"]), 48)
        self.assertEqual(u_obs["member_observations"], [])
        self.assertEqual(u_obs["candidate_steps"], [])
        self.assertEqual(u_obs["conclusion"]["tag"], "exact_for_context")
        self.assertEqual(gv["relation_observations"], [])
        self.assertEqual(gv["proposed_body"]["tag"], "formed")
        self.assertEqual(gv["proposed_body"]["value"]["proposed_refs"], [])
        self.assertEqual(gv["body_issues"], [])
        self.assertEqual(pub["source_candidate"]["tag"], "formed")

    def test_finite_case_02_f03_valid_na_only(self):
        """Verify finite_cases/2 F03-valid-NA-only preserves 4 NA attributes and empty proposed_refs."""
        req = build_base_request(
            validation_input={"tag": "native", "raw": build_na_only_raw_input()},
            relation_occurrences=[],
        )
        pub = call_fn13(self, req)
        gv = pub["general_view"]
        n_val = gv["attempt_capture"]["native_dispatch"]["value"]["value"]
        n_rec = n_val["record"]
        self.assertEqual(n_rec["candidate_entries"], [])
        self.assertEqual(len(n_rec["na_exclusion_entries"]), 1)
        self.assertEqual(
            n_rec["na_exclusion_entries"][0]["kind"], "na_exclusion_candidate"
        )
        self.assertEqual(n_rec["residual_entries"], [])
        self.assertEqual(n_rec["coverage"]["completion"], "covered_as_captured")
        self.assertEqual(
            n_rec["membership_completion"], "resolved_for_captured_members"
        )
        na_attrs = n_val["capture"]["proposal"]["template_results"][0][
            "source_row_reads"
        ][0]["read"]["value"]["na_attributes"]
        self.assertTrue(
            {"reason", "decider", "target_revision", "reentry_condition"}.issubset(
                na_attrs.keys()
            )
        )
        self.assertEqual(gv["proposed_body"]["tag"], "formed")
        self.assertEqual(gv["proposed_body"]["value"]["proposed_refs"], [])
        self.assertEqual(gv["body_issues"], [])
        self.assertEqual(pub["source_candidate"]["tag"], "formed")

    def test_finite_case_03_f05_equivalent_relation(self):
        """Verify finite_cases/3 F05-equivalent-relation preserves repeated equal relations."""
        rel0 = default_relation_occurrence()
        req = build_base_request(relation_occurrences=[rel0, copy.deepcopy(rel0)])
        gv = call_fn13(self, req)["general_view"]
        self.assertEqual(len(gv["relation_observations"]), 1)
        rel_obs = gv["relation_observations"][0]
        self.assertEqual(len(rel_obs["relation_occurrences"]), 2)
        self.assertEqual(
            [r["relation_occurrence_index"] for r in rel_obs["relation_occurrences"]],
            [0, 1],
        )
        self.assertEqual(
            rel_obs["native_ref4"],
            {
                "tag": "formed",
                "value": rel_obs["relation_occurrences"][0]["target_read"]["value"],
                "representative_relation_occurrence_index": 0,
            },
        )
        self.assertEqual(gv["proposed_body"]["tag"], "formed")
        self.assertEqual(len(gv["proposed_body"]["value"]["proposed_refs"]), 1)
        self.assertEqual(gv["body_issues"], [])

    def test_finite_case_04_f07_binding_domain_unavailable(self):
        """Verify finite_cases/4 F07-binding-domain-unavailable all-skip and unformed body."""
        req = build_base_request(
            validation_input=GPE_FIXTURE["binding_domain_validation_input"]
        )
        pub = call_fn13(self, req)
        gv = pub["general_view"]
        self.assertEqual(gv["attempt_capture"]["operation_role"]["tag"], "ready")
        nd = gv["attempt_capture"]["native_dispatch"]
        self.assertEqual(nd["tag"], "returned")
        self.assertEqual(nd["native_call_count"], 1)
        n_val = nd["value"]["value"]
        p_obs = n_val["capture"]["capture"]["caller_return"]["producer_observations"]
        self.assertEqual(len(p_obs), 7)
        self.assertTrue(all(obs["tag"] == "explicit_skip" for obs in p_obs))
        self.assertEqual(n_val["capture"]["proposal"]["tag"], "unavailable")
        self.assertEqual(n_val["record"]["coverage"]["tag"], "not_observed")
        self.assertEqual(n_val["record"]["membership_completion"], "not_observed")
        self.assertEqual(
            gv["universe_observation"],
            {"tag": "not_observed", "original_dispatch": p_obs[1]},
        )
        self.assertEqual(gv["relation_observations"], [])
        self.assertEqual(
            gv["proposed_body"],
            {
                "tag": "unformed",
                "diagnostic_refs": [
                    {
                        "pointer": "/attempt_capture/native_dispatch/value/value/capture/proposal"
                    },
                    {"pointer": "/body_issues/0"},
                ],
            },
        )
        self.assertEqual(
            gv["body_issues"],
            [
                expected_body_issue(
                    "/attempt_capture/native_dispatch/value/value/record/coverage",
                    "unresolved",
                    "元candidate出現のcoverageが完結していない。",
                    "CORE/009",
                    "proposal_coverage",
                    req["source_occurrences"][0]["source_ref"],
                )
            ],
        )
        blocked_pb = [{"pointer": "/general_view/proposed_body"}]
        self.assertEqual(
            pub["header_port"], {"tag": "not_called", "blocked_by": blocked_pb}
        )
        self.assertEqual(
            pub["source_candidate"], {"tag": "unreached", "diagnostic_refs": blocked_pb}
        )

    def test_finite_case_05_known_candidate_control(self):
        """Verify finite_cases/5 known-candidate-control boundary without OS selected/used fabrication."""
        pub = call_fn13(self, build_base_request())
        rec = pub["source_candidate"]["value"]["decoded_raw_records"][0]
        self.assertEqual(rec["section_key"], "F02")
        self.assertEqual(rec["record_kind"], "core_proposal_exchange")
        trace_sec = rec["payload"]["original_trace_section"]
        self.assertEqual(list(trace_sec.keys()), ["proposed_refs", "proposed_source"])
        self.assertNotIn("selected_refs", trace_sec)
        self.assertNotIn("used_refs", trace_sec)
        self.assertEqual(len(trace_sec["proposed_refs"]), 1)
        self.assertEqual(trace_sec["proposed_refs"][0]["identity"], "T1")

    def test_finite_case_06_f08_header_unavailable(self):
        """Verify finite_cases/6 F08-header-unavailable port failure propagation."""
        pub = call_fn13(self, build_base_request(), header_port_mode="unavailable")
        assert_header_port_failure(
            self, pub, "unavailable", "原owner header portの供給がない。"
        )

    def test_finite_case_07_f08_header_return_unobserved(self):
        """Verify finite_cases/7 F08-header-return_unobserved port failure propagation."""
        pub = call_fn13(
            self, build_base_request(), header_port_mode="return_unobserved"
        )
        assert_header_port_failure(
            self,
            pub,
            "return_unobserved",
            "原owner header portは呼出済みだが返却を観測していない。",
        )

    def test_finite_case_08_f08_authority_unavailable(self):
        """Verify finite_cases/8 F08-authority-unavailable port failure propagation."""
        pub = call_fn13(self, build_base_request(), authority_port_mode="unavailable")
        assert_authority_port_failure(
            self, pub, "unavailable", "原owner authority portの供給がない。"
        )

    def test_finite_case_09_f08_authority_return_unobserved(self):
        """Verify finite_cases/9 F08-authority-return_unobserved port failure propagation."""
        pub = call_fn13(
            self, build_base_request(), authority_port_mode="return_unobserved"
        )
        assert_authority_port_failure(
            self,
            pub,
            "return_unobserved",
            "原owner authority portは呼出済みだが返却を観測していない。",
        )

    def test_finite_case_10_f04_residual_valid_sibling(self):
        """Verify finite_cases/10 F04-residual-valid-sibling preserves valid sibling and residual."""
        raw_rvs = build_residual_valid_sibling_raw_input()
        rel = default_relation_occurrence()
        rel["core_ref6_key"] = copy.deepcopy(
            raw_rvs["application_policies"][1]["template_ref"]
        )
        req = build_base_request(
            validation_input={"tag": "native", "raw": raw_rvs},
            relation_occurrences=[rel],
        )
        pub = call_fn13(self, req)
        gv = pub["general_view"]
        n_rec = gv["attempt_capture"]["native_dispatch"]["value"]["value"]["record"]
        self.assertEqual(n_rec["coverage"]["completion"], "covered_as_captured")
        self.assertEqual(
            n_rec["membership_completion"], "residual_for_captured_members"
        )
        self.assertEqual(
            n_rec["original_universe_exactness"]["state"], "not_recomputed"
        )
        self.assertEqual(len(n_rec["residual_entries"]), 1)
        self.assertEqual(n_rec["residual_entries"][0]["member_index"], 0)
        self.assertEqual(len(n_rec["candidate_entries"]), 1)
        self.assertEqual(n_rec["candidate_entries"][0]["member_index"], 1)
        self.assertEqual(
            gv["universe_observation"]["value"]["conclusion"]["tag"], "incomplete"
        )
        self.assertEqual(len(gv["relation_observations"]), 1)
        self.assertEqual(gv["relation_observations"][0]["member_index"], 1)
        self.assertEqual(gv["relation_observations"][0]["native_ref4"]["tag"], "formed")
        mc_ptr = (
            "/attempt_capture/native_dispatch/value/value/record/membership_completion"
        )
        self.assertEqual(
            gv["proposed_body"],
            {
                "tag": "unformed",
                "diagnostic_refs": [
                    {"pointer": mc_ptr},
                    {"pointer": "/body_issues/0"},
                ],
            },
        )
        self.assertEqual(
            gv["body_issues"],
            [
                expected_body_issue(
                    mc_ptr,
                    "unresolved",
                    "捕捉された提案membershipが完結していない。",
                    "CORE/009",
                    "proposal_membership",
                    req["source_occurrences"][0]["source_ref"],
                )
            ],
        )
        self.assertEqual(pub["header_port"]["tag"], "not_called")
        self.assertEqual(pub["source_candidate"]["tag"], "unreached")

    def test_gpe_f03_mixed_na_candidate(self):
        """Probe 0: HARNESS-L8-009-GPE-F03-MIXED-NA-CANDIDATE."""
        raw_mix = build_mixed_na_candidate_raw_input()
        rel = default_relation_occurrence()
        rel["core_ref6_key"] = copy.deepcopy(
            raw_mix["application_policies"][1]["template_ref"]
        )
        req = build_base_request(
            validation_input={"tag": "native", "raw": raw_mix},
            relation_occurrences=[rel],
        )
        pub = call_fn13(self, req)
        gv = pub["general_view"]
        n_rec = gv["attempt_capture"]["native_dispatch"]["value"]["value"]["record"]
        self.assertEqual(len(n_rec["na_exclusion_entries"]), 1)
        self.assertEqual(n_rec["na_exclusion_entries"][0]["member_index"], 0)
        self.assertEqual(len(n_rec["candidate_entries"]), 1)
        self.assertEqual(n_rec["candidate_entries"][0]["member_index"], 1)
        self.assertEqual(n_rec["residual_entries"], [])
        self.assertEqual(
            n_rec["membership_completion"], "resolved_for_captured_members"
        )
        self.assertEqual(gv["proposed_body"]["tag"], "formed")
        self.assertEqual(
            gv["proposed_body"]["value"]["proposed_refs"][0]["identity"], "T1"
        )
        self.assertEqual(gv["body_issues"], [])
        self.assertEqual(pub["source_candidate"]["tag"], "formed")

    def test_gpe_f06_no_relation(self):
        """Probe 1: HARNESS-L8-009-GPE-F06-NO-RELATION."""
        req = build_base_request(relation_occurrences=[])
        gv = call_fn13(self, req)["general_view"]
        self.assertEqual(len(gv["relation_observations"]), 1)
        rel_obs = gv["relation_observations"][0]
        self.assertEqual(rel_obs["relation_occurrences"], [])
        self.assertEqual(rel_obs["native_ref4"]["tag"], "unformed")
        self.assertEqual(gv["proposed_body"]["tag"], "unformed")
        self.assertEqual(
            gv["body_issues"],
            [
                expected_body_issue(
                    "/relation_observations/0/relation_occurrences",
                    "missing",
                    "当該candidateの原対応relationが供給されていない。",
                    "CORE/009",
                    "proposal_relation",
                    req["source_occurrences"][0]["source_ref"],
                )
            ],
        )

    def test_gpe_f06_locator_unformed(self):
        """Probe 2: HARNESS-L8-009-GPE-F06-LOCATOR-UNFORMED."""
        rel_missing = default_relation_occurrence()
        rel_missing["native_ref4_locator"]["payload_pointer"] = (
            "/events/0/binding/missing_child"
        )
        req_missing = build_base_request(relation_occurrences=[rel_missing])
        gv_m = call_fn13(self, req_missing)["general_view"]
        occ_m = gv_m["relation_observations"][0]["relation_occurrences"][0]
        self.assertEqual(occ_m["target_read"]["tag"], "missing")
        self.assertEqual(
            occ_m["target_read"]["requested"], "/events/0/binding/missing_child"
        )
        self.assertEqual(
            gv_m["relation_observations"][0]["native_ref4"]["tag"], "unformed"
        )
        self.assertEqual(gv_m["proposed_body"]["tag"], "unformed")
        self.assertEqual(
            gv_m["body_issues"],
            [
                expected_body_issue(
                    "/relation_observations/0/relation_occurrences/0/relation/native_ref4_locator",
                    "unresolved",
                    "当該relationのtargetを原source所在から形成できない。",
                    "OS-original-owner",
                    "proposal_relation",
                    req_missing["source_occurrences"][2]["source_ref"],
                )
            ],
        )

        rel_inv = default_relation_occurrence()
        rel_inv["native_ref4_locator"]["payload_pointer"] = "invalid_pointer_no_slash"
        gv_inv = call_fn13(self, build_base_request(relation_occurrences=[rel_inv]))[
            "general_view"
        ]
        self.assertEqual(
            gv_inv["relation_observations"][0]["relation_occurrences"][0][
                "target_read"
            ]["tag"],
            "invalid_pointer",
        )
        self.assertEqual(gv_inv["proposed_body"]["tag"], "unformed")

    def test_gpe_f05_repeated_different_relations(self):
        """Probe 3: HARNESS-L8-009-GPE-F05-REPEATED-DIFFERENT-RELATIONS."""
        rel_s1 = default_relation_occurrence()
        rel_s1["native_ref4_locator"]["source_occurrence_index"] = 1
        rel_s1["native_ref4_locator"]["subject_ref"]["identity"] = (
            "FIXTURE-F03-TWIN-DISTINCT-SUBJECT"
        )
        rel_s2 = default_relation_occurrence()
        rel_s2["native_ref4_locator"]["source_occurrence_index"] = 2
        req = build_base_request(
            relation_occurrences=[rel_s1, rel_s2], qualify_source1=True
        )
        gv = call_fn13(self, req)["general_view"]
        rel_obs = gv["relation_observations"][0]
        self.assertEqual(len(rel_obs["relation_occurrences"]), 2)
        self.assertEqual(
            [
                r["target_read"]["value"]["identity"]
                for r in rel_obs["relation_occurrences"]
            ],
            ["T1-twin-conflict", "T1"],
        )
        self.assertEqual(rel_obs["native_ref4"]["tag"], "unformed")
        self.assertEqual(gv["proposed_body"]["tag"], "unformed")
        self.assertEqual(
            gv["body_issues"],
            [
                expected_body_issue(
                    "/relation_observations/0/native_ref4",
                    "conflict",
                    "同candidateに対応する原Ref4間に既知差がある。",
                    "CORE/009",
                    "proposal_relation",
                    req["source_occurrences"][1]["source_ref"],
                    [req["source_occurrences"][2]["source_ref"]],
                )
            ],
        )

    def test_gpe_f05_compound_source_flags(self):
        """Probe 4: HARNESS-L8-009-GPE-F05-COMPOUND-SOURCE-FLAGS."""
        rel_ex = default_relation_occurrence()
        rel_ex["native_ref4_locator"]["source_occurrence_index"] = 2
        rel_ex["native_ref4_locator"]["record_index"] = 0
        req_b = build_base_request(
            relation_occurrences=[rel_ex], contradict_source1_and_2=True
        )
        gv_b = call_fn13(self, req_b)["general_view"]
        q_orig_b = gv_b["relation_observations"][0]["relation_occurrences"][0][
            "qualification_origin"
        ]
        self.assertEqual(
            q_orig_b["classification_flags"],
            ["qualified", "conflicting", "unresolved"],
        )
        self.assertEqual(q_orig_b["target_record_indices"], [])
        self.assertEqual(
            gv_b["relation_observations"][0]["native_ref4"]["tag"], "unformed"
        )
        self.assertEqual(gv_b["proposed_body"]["tag"], "unformed")
        self.assertEqual(
            gv_b["body_issues"],
            [
                expected_body_issue(
                    "/relation_observations/0/relation_occurrences/0/qualification_origin",
                    "unresolved",
                    "当該source occurrenceのtargetに有効な資格根拠が残らない。",
                    "OS-original-owner",
                    "proposal_source",
                    req_b["source_occurrences"][2]["source_ref"],
                    [req_b["source_occurrences"][1]["source_ref"]],
                )
            ],
        )

        rel_surv = copy.deepcopy(rel_ex)
        rel_surv["native_ref4_locator"]["record_index"] = 1
        rel_surv["native_ref4_locator"]["subject_ref"]["identity"] = (
            "FIXTURE-F03-SURVIVING-RECORD"
        )
        req_a = build_base_request(
            relation_occurrences=[rel_surv], contradict_source1_and_2=True
        )
        gv_a = call_fn13(self, req_a)["general_view"]
        q_orig_a = gv_a["relation_observations"][0]["relation_occurrences"][0][
            "qualification_origin"
        ]
        self.assertEqual(
            q_orig_a["classification_flags"],
            ["qualified", "conflicting", "unresolved"],
        )
        self.assertEqual(q_orig_a["target_record_indices"], [1])
        self.assertEqual(
            gv_a["relation_observations"][0]["native_ref4"]["tag"], "formed"
        )
        self.assertEqual(gv_a["proposed_body"]["tag"], "formed")
        self.assertEqual(gv_a["body_issues"], [])

    def test_gpe_f04_f07_multiple_obstructions(self):
        """Probe 5: HARNESS-L8-009-GPE-F04-F07-MULTIPLE-OBSTRUCTIONS."""
        req = build_base_request(
            validation_input={
                "tag": "native",
                "raw": build_residual_valid_sibling_raw_input(),
            },
            relation_occurrences=[],
        )
        gv = call_fn13(self, req)["general_view"]
        self.assertEqual(gv["proposed_body"]["tag"], "unformed")
        self.assertEqual(
            [issue["axis"] for issue in gv["body_issues"]],
            ["proposal_membership", "proposal_relation"],
        )
        self.assertEqual(
            [issue["path"] for issue in gv["body_issues"]],
            [
                "/attempt_capture/native_dispatch/value/value/record/membership_completion",
                "/relation_observations/0/relation_occurrences",
            ],
        )

    def test_gpe_f07_exactness_defect(self):
        """Probe 6: HARNESS-L8-009-GPE-F07-EXACTNESS-DEFECT."""
        req = build_base_request(
            validation_input={
                "tag": "native",
                "raw": build_exactness_defect_raw_input(),
            }
        )
        pub = call_fn13(self, req)
        gv = pub["general_view"]
        self.assertEqual(gv["proposed_body"]["tag"], "formed")
        self.assertEqual(gv["body_issues"], [])
        u_obs = gv["universe_observation"]
        self.assertEqual(u_obs["tag"], "observed")
        self.assertEqual(u_obs["value"]["conclusion"]["tag"], "incomplete")
        self.assertTrue(len(u_obs["value"]["conclusion"]["obstructions"]) >= 1)
        self.assertEqual(pub["source_candidate"]["tag"], "formed")
        ev = pub["source_candidate"]["value"]["decoded_raw_records"][0]["payload"][
            "evidence"
        ]
        self.assertEqual(
            ev["universe_observation"]["value"]["conclusion"]["tag"], "incomplete"
        )

    def test_gpe_f02_f07_exactness_unobserved(self):
        """Probe 7: HARNESS-L8-009-GPE-F02-F07-EXACTNESS-UNOBSERVED."""
        gv = call_fn13(self, build_base_request(), legacy_f02_only=True)["general_view"]
        self.assertEqual(gv["proposed_body"]["tag"], "formed")
        self.assertEqual(gv["universe_observation"]["tag"], "not_observed")
        self.assertEqual(
            gv["universe_observation"]["original_dispatch"]["tag"], "returned"
        )
        self.assertEqual(
            gv["universe_observation"]["original_dispatch"]["comparison"]["findings"],
            [],
        )

    def test_gpe_f07_native_unreached(self):
        """Probe 8: HARNESS-L8-009-GPE-F07-NATIVE-UNREACHED."""
        req = build_base_request()
        req["operation_source_occurrence_index"] = 1
        pub = call_fn13(self, req)
        gv = pub["general_view"]
        blocked = [{"pointer": "/qualification_snapshot/source_issues/0"}]
        blocked_gv = [
            {"pointer": "/attempt_capture/qualification_snapshot/source_issues/0"}
        ]
        self.assertEqual(
            gv["attempt_capture"]["operation_role"],
            {"tag": "unreached", "blocked_by": blocked},
        )
        self.assertEqual(
            gv["attempt_capture"]["native_dispatch"],
            {"tag": "not_called", "native_call_count": 0, "blocked_by": blocked},
        )
        for key in ("membership_capture", "universe_observation", "proposed_body"):
            self.assertEqual(gv[key], {"tag": "unreached", "blocked_by": blocked_gv})
        self.assertEqual(gv["relation_observations"], [])
        self.assertEqual(gv["body_issues"], [])
        self.assertEqual(pub["header_port"]["tag"], "not_called")
        self.assertEqual(pub["source_candidate"]["tag"], "unreached")

    def test_bulk_identifier_rename_preserves_exchange_decisions(self):
        """Verify bulk renaming all Ref and scope identifiers preserves all decisions."""
        req_orig = build_base_request()
        pub_orig = call_fn13(self, req_orig)
        pub_ren = call_fn13(self, build_renamed_request(req_orig))
        self.assertEqual(
            pub_ren["general_view"]["proposed_body"]["tag"],
            pub_orig["general_view"]["proposed_body"]["tag"],
        )
        self.assertEqual(
            pub_ren["general_view"]["proposed_body"]["value"]["proposed_refs"][0][
                "identity"
            ],
            "renamed::T1",
        )
        self.assertEqual(
            pub_ren["general_view"]["universe_observation"]["value"]["conclusion"][
                "tag"
            ],
            "exact_for_context",
        )
        self.assertEqual(pub_ren["source_candidate"]["tag"], "formed")


def test_gpe_f03_mixed_na_candidate():
    TestGeneralProposalExchange(
        "test_gpe_f03_mixed_na_candidate"
    ).test_gpe_f03_mixed_na_candidate()


def test_gpe_f06_no_relation():
    TestGeneralProposalExchange("test_gpe_f06_no_relation").test_gpe_f06_no_relation()


def test_gpe_f06_locator_unformed():
    TestGeneralProposalExchange(
        "test_gpe_f06_locator_unformed"
    ).test_gpe_f06_locator_unformed()


def test_gpe_f05_repeated_different_relations():
    TestGeneralProposalExchange(
        "test_gpe_f05_repeated_different_relations"
    ).test_gpe_f05_repeated_different_relations()


def test_gpe_f05_compound_source_flags():
    TestGeneralProposalExchange(
        "test_gpe_f05_compound_source_flags"
    ).test_gpe_f05_compound_source_flags()


def test_gpe_f04_f07_multiple_obstructions():
    TestGeneralProposalExchange(
        "test_gpe_f04_f07_multiple_obstructions"
    ).test_gpe_f04_f07_multiple_obstructions()


def test_gpe_f07_exactness_defect():
    TestGeneralProposalExchange(
        "test_gpe_f07_exactness_defect"
    ).test_gpe_f07_exactness_defect()


def test_gpe_f02_f07_exactness_unobserved():
    TestGeneralProposalExchange(
        "test_gpe_f02_f07_exactness_unobserved"
    ).test_gpe_f02_f07_exactness_unobserved()


def test_gpe_f07_native_unreached():
    TestGeneralProposalExchange(
        "test_gpe_f07_native_unreached"
    ).test_gpe_f07_native_unreached()


if __name__ == "__main__":
    unittest.main()
