"""Native proposal material and record formation (HARNESS-L5-009-build_general_native_proposal_record_detail)."""

import copy

from application_applicability import compare_applicability
from application_required_axes import compare_required_axes
from application_validation_detail import validate_application_input_detail
from general_proposal_exchange_f02_detail import compare_candidate_universe_detail

PRODUCER_CATALOGUE = (
    "compare_required_axes",
    "compare_candidate_universe",
    "compare_applicability",
    "compare_kind_obligation_trace",
    "compare_selected_knowledge",
    "compare_meaning_impacts",
    "compare_semantic_equivalence",
)


def _loc(root, pointer):
    return {"root": root, "pointer": pointer}


def _present_read(root, pointer, value):
    return {
        "tag": "present",
        "location": _loc(root, pointer),
        "value": copy.deepcopy(value),
    }


def _same_ref5(left, right):
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    return (
        left.get("identity") == right.get("identity")
        and left.get("revision") == right.get("revision")
        and left.get("scope") == right.get("scope")
        and left.get("owner") == right.get("owner")
        and left.get("source_locator") == right.get("source_locator")
    )


def _build_explicit_skip_observations(validated):
    val_read = _present_read("caller_return", "/validation/validated", validated)
    in_read = _present_read(
        "caller_return", "/validation/validated/input", validated.get("input")
    )
    hdr_cause = {
        "kind": "header_unformed",
        "target": _loc("caller_return", "/validation/validated/input"),
        "left": {"tag": "original", "read": in_read},
        "right": {
            "tag": "normative_literal",
            "value": None,
            "rule_pointer": "/f05_detail_contract/caller_return_writer_contract/header_patterns/0/right_literal",
        },
        "rule_pointer": "/f05_detail_contract/caller_return_writer_contract/header_patterns/0",
    }
    observations = []
    for idx, prod in enumerate(PRODUCER_CATALOGUE):
        operands = [{"name": "validated", "read": copy.deepcopy(val_read)}]
        causes = []
        if idx > 0:
            dep_ptr = "/producer_observations/0"
            dep_read = _present_read("caller_return", dep_ptr, observations[0])
            operands.append({"name": "compare_required_axes", "read": dep_read})
            causes.append(
                {
                    "kind": "context_unformed",
                    "target": _loc("caller_return", dep_ptr),
                    "left": {"tag": "original", "read": copy.deepcopy(dep_read)},
                    "right": {
                        "tag": "normative_literal",
                        "value": None,
                        "rule_pointer": "/f05_detail_contract/caller_return_writer_contract/context_patterns/0/right_literal",
                    },
                    "rule_pointer": "/f05_detail_contract/caller_return_writer_contract/context_patterns/0",
                }
            )
        causes.append(copy.deepcopy(hdr_cause))
        observations.append(
            {
                "tag": "explicit_skip",
                "producer": prod,
                "skip": {
                    "context_operands": operands,
                    "header_binding": {
                        "tag": "unreached",
                        "requested": _loc(
                            "caller_return", "/validation/validated/input/binding"
                        ),
                        "reached": _loc("caller_return", "/validation/validated/input"),
                        "reached_value": copy.deepcopy(validated.get("input")),
                    },
                    "causes": causes,
                },
            }
        )
    return observations


def _build_caller_return_and_f02(caller_inputs):
    val_detail = validate_application_input_detail(caller_inputs["validation_input"])
    validated = val_detail["validated"]
    inp = validated.get("input")
    if not isinstance(inp, dict) or not isinstance(inp.get("binding"), dict):
        p_obs = _build_explicit_skip_observations(validated)
        u_obs = {"tag": "not_observed", "original_dispatch": copy.deepcopy(p_obs[1])}
        sem_scan = {
            "tag": "unreached",
            "causes": [],
        }
    else:
        c0 = compare_required_axes({"validated": validated})
        f02_res = compare_candidate_universe_detail(
            {"validated": validated, "compare_required_axes": c0}
        )
        if isinstance(f02_res, dict) and "observation" in f02_res:
            c1 = f02_res["comparison"]
            f02_detail = f02_res
        else:
            c1 = f02_res
            f02_detail = None
        c2 = compare_applicability(
            {
                "validated": validated,
                "compare_required_axes": c0,
                "compare_candidate_universe": c1,
            }
        )
        p_obs = [
            {
                "tag": "returned",
                "producer": "compare_required_axes",
                "comparison": c0,
            },
            {
                "tag": "returned",
                "producer": "compare_candidate_universe",
                "comparison": c1,
            },
            {
                "tag": "returned",
                "producer": "compare_applicability",
                "comparison": c2,
            },
        ]
        for idx in range(3, 7):
            p_obs.append(
                {
                    "tag": "unobserved",
                    "producer": PRODUCER_CATALOGUE[idx],
                    "original_operands": [
                        {
                            "name": "validated",
                            "read": _present_read(
                                "caller_return", "/validation/validated", validated
                            ),
                        }
                    ],
                    "causes": [],
                }
            )
        if f02_detail is not None:
            u_obs = {"tag": "observed", "value": f02_detail}
        else:
            u_obs = {
                "tag": "not_observed",
                "original_dispatch": copy.deepcopy(p_obs[1]),
            }
        sem_recs = inp.get("semantic_records") or []
        sem_scan = {
            "tag": "scanned",
            "profile_observations": [],
            "semantic_record_indices": list(range(len(sem_recs))),
            "semantic_records_read": _present_read(
                "validation_return", "/validated/input/semantic_records", sem_recs
            ),
        }

    caller_return = {
        "validation": val_detail,
        "f05": {"tag": "unformed", "causes": []},
        "producer_observations": p_obs,
        "claims": {"tag": "unformed", "causes": []},
        "analysis": {"tag": "unformed", "causes": []},
        "causes": [],
        "input_scope_knowledge_gap": {
            "profile_scan": sem_scan,
            "post_return_projections": [],
        },
    }
    return caller_return, u_obs


def build_application_analysis_detail(caller_inputs):
    """Build CoreApplicationDetailReturn from CallerInputs."""
    caller_return, _ = _build_caller_return_and_f02(caller_inputs)
    return caller_return


def read_proposal_native_material(capture):
    """Read ProposalObservation from ProposalActualCallerCapture."""
    cr = capture["caller_return"]
    p_obs = cr["producer_observations"]
    if p_obs[1]["tag"] != "returned" or p_obs[2]["tag"] != "returned":
        causes = []
        for idx in (1, 2):
            if p_obs[idx]["tag"] != "returned":
                ptr = f"/producer_observations/{idx}"
                causes.append(
                    {
                        "kind": "context_unformed",
                        "target": _loc("caller_return", ptr),
                        "left": {
                            "tag": "original",
                            "read": _present_read("caller_return", ptr, p_obs[idx]),
                        },
                        "right": {
                            "tag": "normative_literal",
                            "value": "returned comparison from designated same-call producer",
                            "rule_pointer": "/proposal_material_formation_detail/guards/producer_unavailable/right_literal",
                        },
                        "rule_pointer": "/proposal_material_formation_detail/guards/producer_unavailable",
                    }
                )
        return {"tag": "unavailable", "causes": causes}

    c1_mat = p_obs[1]["comparison"]["material"]
    c2_mat = p_obs[2]["comparison"]["material"]
    p_decs = c2_mat.get("policy_decisions") or []
    s_rows = c2_mat.get("source_projection_rows") or []
    val_in = cr["validation"]["validated"].get("input") or {}
    policies = val_in.get("application_policies") or []
    cand_members = c1_mat.get("candidate_member_refs") or []

    template_results = []
    for m_idx, m_ref in enumerate(cand_members):
        m_id = m_ref.get("identity") if isinstance(m_ref, dict) else None
        matched_occs = []
        for d_idx, dec in enumerate(p_decs):
            p_idx = dec.get("policy_occurrence_index")
            pol = (
                policies[p_idx]
                if isinstance(p_idx, int) and 0 <= p_idx < len(policies)
                else {}
            )
            t_ref = pol.get("template_ref") or dec.get("template_ref") or {}
            if t_ref.get("identity") == m_id:
                matched_occs.append(
                    {
                        "policy_index": p_idx,
                        "policy_read": _present_read(
                            "validation_input",
                            f"/application_policies/{p_idx}",
                            pol,
                        ),
                        "decision_index": d_idx,
                        "decision_read": _present_read(
                            "caller_return",
                            f"/producer_observations/2/comparison/material/policy_decisions/{d_idx}",
                            dec,
                        ),
                        "policy_ref_relation": "corresponding",
                        "template_relation": "corresponding",
                        "binding_relation": "corresponding",
                        "disposition_read": _present_read(
                            "caller_return",
                            f"/producer_observations/2/comparison/material/policy_decisions/{d_idx}/disposition",
                            dec.get("disposition"),
                        ),
                        "causes": [],
                    }
                )
        row_reads = []
        for r_idx, row in enumerate(s_rows):
            rt_ref = row.get("template_ref") or {}
            if rt_ref.get("identity") == m_id or len(cand_members) == 1:
                row_reads.append(
                    {
                        "row_index": r_idx,
                        "read": _present_read(
                            "caller_return",
                            f"/producer_observations/2/comparison/material/source_projection_rows/{r_idx}",
                            row,
                        ),
                    }
                )
        if len(matched_occs) == 1:
            disp = matched_occs[0]["disposition_read"]["value"]
            if disp == "required":
                membership = {"tag": "candidate", "kind": "required_candidate"}
            elif disp == "conditional":
                membership = {"tag": "candidate", "kind": "conditional_candidate"}
            elif disp == "na":
                membership = {"tag": "candidate", "kind": "na_exclusion_candidate"}
            elif disp == "unresolved":
                membership = {"tag": "unresolved", "causes": []}
            else:
                membership = {"tag": "unformed", "causes": []}
        else:
            membership = {"tag": "unformed", "causes": []}

        template_results.append(
            {
                "member_index": m_idx,
                "member_read": _present_read(
                    "caller_return",
                    f"/producer_observations/1/comparison/material/candidate_member_refs/{m_idx}",
                    m_ref,
                ),
                "policy_occurrences": matched_occs,
                "source_row_reads": row_reads,
                "membership": membership,
                "causes": [],
            }
        )

    return {
        "tag": "observed",
        "considered_read": _present_read(
            "caller_return", "/producer_observations/1/comparison/material", c1_mat
        ),
        "policy_decisions_read": _present_read(
            "caller_return",
            "/producer_observations/2/comparison/material/policy_decisions",
            p_decs,
        ),
        "source_rows_read": _present_read(
            "caller_return",
            "/producer_observations/2/comparison/material/source_projection_rows",
            s_rows,
        ),
        "template_results": template_results,
        "causes": [],
    }


def form_proposal_material_detail(capture):
    """Form CoreProposalDetailedReturn from ProposalActualCallerCapture."""
    cap_copy = copy.deepcopy(capture)
    return {
        "capture": cap_copy,
        "proposal": read_proposal_native_material(cap_copy),
    }


def build_proposal_material_detail(caller_inputs):
    """Build CoreProposalDetailedReturn from CallerInputs."""
    caller_return = build_application_analysis_detail(caller_inputs)
    return form_proposal_material_detail(
        {
            "caller_inputs": copy.deepcopy(caller_inputs),
            "caller_return": caller_return,
        }
    )


def form_native_proposal_record_detail(proposal_detail):
    """Form NativeProposalRecordDetailedReturn from CoreProposalDetailedReturn."""
    prop_copy = copy.deepcopy(proposal_detail)
    proposal = prop_copy["proposal"]
    exactness = {
        "state": "not_recomputed",
        "producer_observation_location": _loc(
            "native_proposal_return", "/capture/caller_return/producer_observations/1"
        ),
        "caller_inputs_location": _loc(
            "native_proposal_return", "/capture/caller_inputs"
        ),
        "claim": "no_new_exactness_claim",
    }
    if proposal["tag"] != "observed":
        return {
            "capture": prop_copy,
            "record": {
                "candidate_entries": [],
                "na_exclusion_entries": [],
                "residual_entries": [],
                "coverage": {
                    "tag": "not_observed",
                    "source_observation_location": _loc(
                        "native_proposal_return",
                        "/capture/caller_return/producer_observations/1",
                    ),
                },
                "membership_completion": "not_observed",
                "original_universe_exactness": exactness,
            },
        }

    cand_entries = []
    na_entries = []
    res_entries = []
    t_results = proposal.get("template_results") or []
    for r_idx, res in enumerate(t_results):
        m_idx = res["member_index"]
        m_read = copy.deepcopy(res["member_read"])
        n_loc = _loc("native_proposal_return", f"/proposal/template_results/{r_idx}")
        mem = res["membership"]
        if mem["tag"] == "candidate" and mem["kind"] in (
            "required_candidate",
            "conditional_candidate",
        ):
            cand_entries.append(
                {
                    "result_index": r_idx,
                    "member_index": m_idx,
                    "kind": mem["kind"],
                    "template_ref_read": m_read,
                    "native_result_location": n_loc,
                }
            )
        elif mem["tag"] == "candidate" and mem["kind"] == "na_exclusion_candidate":
            na_entries.append(
                {
                    "result_index": r_idx,
                    "member_index": m_idx,
                    "kind": "na_exclusion_candidate",
                    "template_ref_read": m_read,
                    "native_result_location": n_loc,
                }
            )
        else:
            res_entries.append(
                {
                    "result_index": r_idx,
                    "member_index": m_idx,
                    "template_ref_read": m_read,
                    "membership": copy.deepcopy(mem),
                    "native_result_location": n_loc,
                }
            )

    p1 = prop_copy["capture"]["caller_return"]["producer_observations"][1]
    src_members = p1["comparison"]["material"].get("candidate_member_refs") or []
    member_cov = []
    all_corresponding = True
    for s_idx, s_ref in enumerate(src_members):
        matching_r = [
            r_idx
            for r_idx, res in enumerate(t_results)
            if res.get("member_index") == s_idx
        ]
        if len(matching_r) == 1:
            r_read = t_results[matching_r[0]].get("member_read", {})
            corr = (
                "corresponding"
                if r_read.get("tag") == "present"
                and _same_ref5(r_read.get("value"), s_ref)
                else "different"
            )
        else:
            corr = "different"
        if corr != "corresponding":
            all_corresponding = False
        member_cov.append(
            {
                "member_index": s_idx,
                "result_indices": matching_r,
                "correspondence": corr,
            }
        )

    unmatched = [
        r_idx
        for r_idx, res in enumerate(t_results)
        if not isinstance(res.get("member_index"), int)
        or res["member_index"] < 0
        or res["member_index"] >= len(src_members)
    ]
    cov_comp = (
        "covered_as_captured"
        if all_corresponding and not unmatched
        else "incomplete_as_captured"
    )
    mem_comp = (
        "residual_for_captured_members"
        if res_entries
        else "resolved_for_captured_members"
    )
    return {
        "capture": prop_copy,
        "record": {
            "candidate_entries": cand_entries,
            "na_exclusion_entries": na_entries,
            "residual_entries": res_entries,
            "coverage": {
                "tag": "enumerated",
                "member_coverage": member_cov,
                "unmatched_result_indices": unmatched,
                "unreadable_result_indices": [],
                "completion": cov_comp,
            },
            "membership_completion": mem_comp,
            "original_universe_exactness": exactness,
        },
    }


def build_native_proposal_record_detail(caller_inputs):
    """Build NativeProposalRecordDetailedReturn from CallerInputs."""
    return form_native_proposal_record_detail(
        build_proposal_material_detail(caller_inputs)
    )


def build_general_native_proposal_record_detail(caller_inputs):
    """Build GeneralNativeDetailedReturn from CallerInputs in a single execution."""
    caller_return, u_obs = _build_caller_return_and_f02(caller_inputs)
    prop_detail = form_proposal_material_detail(
        {
            "caller_inputs": copy.deepcopy(caller_inputs),
            "caller_return": caller_return,
        }
    )
    native_record = form_native_proposal_record_detail(prop_detail)
    return {"value": native_record, "universe_observation": u_obs}
