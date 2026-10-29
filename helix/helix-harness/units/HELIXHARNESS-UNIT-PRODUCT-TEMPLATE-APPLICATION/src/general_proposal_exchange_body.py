"""General original operation proposal body formation (HARNESS-L5-009-build_general_original_operation_proposal)."""

import copy
import hashlib
import json

from general_proposal_exchange_native import build_general_native_proposal_record_detail

FLAG_ORDER = ("qualified", "unqualified", "conflicting", "unresolved")


def _diag(pointer):
    return {"pointer": pointer}


def _issue(path, state, detail, backflow_owner, axis, source_ref=None, related=None):
    out = {
        "path": path,
        "state": state,
        "detail": detail,
        "backflow_owner": backflow_owner,
        "axis": axis,
    }
    if source_ref is not None:
        out["source_ref"] = copy.deepcopy(source_ref)
    out["related_source_refs"] = copy.deepcopy(related or [])
    return out


def _order_flags(flags_set):
    return [f for f in FLAG_ORDER if f in flags_set]


def _decode_sources(source_occurrences):
    attempts = []
    walk_idx = 0
    for s_idx, s_occ in enumerate(source_occurrences):
        raw_text = s_occ.get("source_json_utf8")
        parsed = None
        if isinstance(raw_text, str):
            try:
                cand = json.loads(raw_text)
                if isinstance(cand, dict) and isinstance(cand.get("records"), list):
                    parsed = cand
            except Exception:
                parsed = None
        if parsed is not None:
            attempts.append(
                {
                    "source_occurrence_index": s_idx,
                    "decode": {"tag": "ready", "body": parsed},
                    "qualification": {"tag": "observed", "walk_index": walk_idx},
                }
            )
            walk_idx += 1
        else:
            attempts.append(
                {
                    "source_occurrence_index": s_idx,
                    "decode": {
                        "tag": "failed",
                        "decode": {
                            "phase": "json_parse",
                            "phase_complete": False,
                            "input_issues": [],
                        },
                    },
                    "qualification": {
                        "tag": "unreached",
                        "blocked_by": [_diag(f"/source_attempts/{s_idx}/decode")],
                    },
                }
            )
    return attempts


def _qualify_sources(req_cap, source_attempts):
    s_occs = req_cap.get("source_occurrences") or []
    q_inputs = req_cap.get("qualification_inputs") or []
    r_inputs = req_cap.get("qualification_root_inputs") or []
    source_issues, source_walks, candidate_records = [], [], []

    for s_idx, att in enumerate(source_attempts):
        if att["decode"]["tag"] != "ready":
            continue
        s_occ = s_occs[s_idx]
        s_ref, s_owner = s_occ.get("source_ref"), s_occ.get("owner")
        actual_sha = hashlib.sha256(
            (s_occ.get("source_json_utf8") or "").encode("utf-8")
        ).hexdigest()
        q_ref = s_occ.get("qualification_ref")
        matched_qs = [
            q
            for q in q_inputs
            if isinstance(q, dict) and q_ref is not None and q.get("ref") == q_ref
        ]
        q_obj = matched_qs[0] if matched_qs else None
        root_ref = q_obj.get("root_ref") if q_obj else None
        matched_rs = [
            r
            for r in r_inputs
            if isinstance(r, dict) and root_ref is not None and r.get("ref") == root_ref
        ]
        r_obj = matched_rs[0] if matched_rs else None
        walk_flags, walk_src_issues = set(), []

        if q_obj is None or r_obj is None:
            st = "unqualified" if (q_obj is None and q_ref is None) else "unresolved"
            walk_src_issues.append(len(source_issues))
            source_issues.append(
                _issue(
                    f"/source_occurrences/{s_idx}/qualification_ref",
                    st,
                    "原source資格比較に必要な独立対応端を一意に取得できない。",
                    s_owner,
                    "source qualification",
                    s_ref,
                )
            )
            walk_flags.add(st)
        else:
            claim_sha, root_sha = (
                q_obj.get("source_sha256"),
                r_obj.get("allowed_source_sha256"),
            )
            if (
                actual_sha != s_occ.get("source_sha256")
                or actual_sha != claim_sha
                or actual_sha != root_sha
                or q_obj.get("source_ref") != s_ref
                or q_obj.get("owner") != s_owner
                or r_obj.get("owner") != s_owner
            ):
                walk_src_issues.append(len(source_issues))
                source_issues.append(
                    _issue(
                        f"/source_occurrences/{s_idx}/source_sha256",
                        "unqualified",
                        f"source occurrenceのSHA-256 {actual_sha}が、qualification_refで選択されたQualification.source_sha256 {claim_sha}およびQualificationRoot.allowed_source_sha256 {root_sha}と一致しない。",
                        s_owner,
                        "source qualification",
                        s_ref,
                    )
                )
                walk_flags.add("unqualified")
            else:
                walk_flags.add("qualified")
                q_subs = q_obj.get("subject_refs") or []
                r_subs = r_obj.get("allowed_subject_refs") or []
                w_idx = len(source_walks)
                for r_idx, rec in enumerate(att["decode"]["body"]["records"]):
                    sub = rec.get("subject_ref")
                    if sub in q_subs and sub in r_subs:
                        candidate_records.append((s_idx, w_idx, r_idx, rec))

        source_walks.append(
            {
                "source_occurrence_index": s_idx,
                "classification_flags": _order_flags(walk_flags),
                "qualified_record_indices": [],
                "input_issue_indices": [],
                "source_issue_indices": walk_src_issues,
            }
        )

    by_key = {}
    for item in candidate_records:
        rec = item[3]
        key = (
            json.dumps(rec.get("subject_ref"), sort_keys=True),
            rec.get("section_key"),
        )
        by_key.setdefault(key, []).append(item)

    excluded = set()
    for group in by_key.values():
        if len(group) > 1 and any(
            it[3].get("payload") != group[0][3].get("payload") for it in group[1:]
        ):
            for s_idx, w_idx, r_idx, _ in group:
                excluded.add((s_idx, r_idx))
                rel_refs = [
                    s_occs[os_idx]["source_ref"]
                    for os_idx, _, _, _ in group
                    if os_idx != s_idx
                ]
                iss_idx = len(source_issues)
                source_issues.append(
                    _issue(
                        f"/source_occurrences/{s_idx}/decoded_records/{r_idx}",
                        "conflicting",
                        "有資格原recordの同subjectとsectionに相反する内容がある。",
                        s_occs[s_idx].get("owner"),
                        "source qualification",
                        s_occs[s_idx].get("source_ref"),
                        rel_refs,
                    )
                )
                walk = source_walks[w_idx]
                walk["source_issue_indices"].append(iss_idx)
                walk["classification_flags"] = _order_flags(
                    set(walk["classification_flags"]) | {"conflicting", "unresolved"}
                )

    qualified_raw_occurrences = []
    for s_idx, w_idx, r_idx, rec in candidate_records:
        if (s_idx, r_idx) not in excluded:
            source_walks[w_idx]["qualified_record_indices"].append(
                len(qualified_raw_occurrences)
            )
            qualified_raw_occurrences.append(
                {
                    "source_occurrence_index": s_idx,
                    "record_index": r_idx,
                    "source_ref": copy.deepcopy(s_occs[s_idx].get("source_ref")),
                    "record": copy.deepcopy(rec),
                }
            )

    return {
        "input_issues": [],
        "source_issues": source_issues,
        "source_walks": source_walks,
        "qualified_raw_occurrences": qualified_raw_occurrences,
    }


def _evaluate_operation_role(req_cap, source_attempts, qual_snap):
    s_occs = req_cap.get("source_occurrences") or []
    op_idx = req_cap.get("operation_source_occurrence_index")
    if (
        not isinstance(op_idx, int)
        or isinstance(op_idx, bool)
        or not (0 <= op_idx < len(s_occs))
    ):
        return {
            "tag": "failed",
            "candidate_records": [],
            "input_issues": [
                _issue(
                    "/operation_source_occurrence_index",
                    "invalid_shape",
                    "指定operation source occurrence indexが原配列の範囲外である。",
                    "CORE",
                    "operation_source",
                )
            ],
        }
    att = source_attempts[op_idx]
    if att["decode"]["tag"] != "ready":
        return {
            "tag": "unreached",
            "blocked_by": copy.deepcopy(att["qualification"]["blocked_by"]),
        }
    w_idx = att["qualification"]["walk_index"]
    walk = qual_snap["source_walks"][w_idx]
    if walk["classification_flags"] != ["qualified"]:
        blocked = [
            _diag(f"/qualification_snapshot/source_issues/{i}")
            for i in walk["source_issue_indices"]
        ]
        return {
            "tag": "unreached",
            "blocked_by": blocked
            or [_diag(f"/qualification_snapshot/source_walks/{w_idx}")],
        }

    records = att["decode"]["body"]["records"]
    surviving_r = {
        qro["record_index"]
        for qro in qual_snap["qualified_raw_occurrences"]
        if qro["source_occurrence_index"] == op_idx
    }
    candidates = [
        {
            "source_occurrence_index": op_idx,
            "record_index": r_idx,
            "subject_ref": copy.deepcopy(rec.get("subject_ref")),
            "payload_pointer": f"/source_attempts/{op_idx}/decode/body/records/{r_idx}/payload",
        }
        for r_idx, rec in enumerate(records)
        if r_idx in surviving_r
        and rec.get("section_key") == "F02"
        and rec.get("record_kind") == "original_trace_section"
    ]
    if len(candidates) != 1:
        msg = (
            "指定source内に原operation profileのheader roleに対応するrecordがない。"
            if not candidates
            else "指定source内に原operation profileのheader roleに対応するrecordが複数あり、一意に形成できない。"
        )
        return {
            "tag": "failed",
            "candidate_records": candidates,
            "input_issues": [
                _issue(
                    f"/source_occurrences/{op_idx}/decoded_records",
                    "unresolved",
                    msg,
                    "CORE",
                    "operation_role",
                    s_occs[op_idx].get("source_ref"),
                )
            ],
        }

    sel = candidates[0]
    payload = records[sel["record_index"]].get("payload") or {}
    return {
        "tag": "ready",
        "selected_record": sel,
        "frame": {
            "caller_inputs": copy.deepcopy(payload.get("caller_inputs")),
            "proposed_source": copy.deepcopy(payload.get("proposed_source")),
            "relation_occurrences": copy.deepcopy(
                payload.get("relation_occurrences") or []
            ),
        },
    }


def _read_target_pointer(payload, payload_ptr_prefix, pointer_str):
    if not isinstance(pointer_str, str) or (
        pointer_str != "" and not pointer_str.startswith("/")
    ):
        return {"tag": "invalid_pointer", "requested": str(pointer_str)}
    if pointer_str == "":
        return {
            "tag": "present",
            "location": _diag(payload_ptr_prefix),
            "value": copy.deepcopy(payload),
        }
    curr, curr_ptr = payload, payload_ptr_prefix
    for raw_tok in pointer_str.split("/")[1:]:
        tok = raw_tok.replace("~1", "/").replace("~0", "~")
        if isinstance(curr, dict) and tok in curr:
            curr, curr_ptr = curr[tok], f"{curr_ptr}/{tok}"
        elif isinstance(curr, list) and tok.isdigit() and 0 <= int(tok) < len(curr):
            curr, curr_ptr = curr[int(tok)], f"{curr_ptr}/{tok}"
        else:
            return {
                "tag": "missing",
                "requested": pointer_str,
                "parent_location": _diag(curr_ptr),
            }
    return {"tag": "present", "location": _diag(curr_ptr), "value": copy.deepcopy(curr)}


def _is_valid_os_ref4(val):
    return (
        isinstance(val, dict)
        and all(isinstance(val.get(k), str) for k in ("identity", "revision", "owner"))
        and isinstance(val.get("scope"), dict)
    )


def _evaluate_candidate_relations(
    cand_entries, rel_occs, req_cap, source_attempts, qual_snap, op_src_ref
):
    s_occs = req_cap.get("source_occurrences") or []
    rel_observations, rel_issues = [], []

    for k_idx, cand in enumerate(cand_entries):
        t_read = cand["template_ref_read"]
        c_key = t_read.get("value") if t_read.get("tag") == "present" else None
        matched_rels = [
            (j_idx, rel)
            for j_idx, rel in enumerate(rel_occs)
            if isinstance(rel, dict) and rel.get("core_ref6_key") == c_key
        ]
        if not matched_rels:
            path = f"/relation_observations/{k_idx}/relation_occurrences"
            rel_issues.append(
                (
                    path,
                    _issue(
                        path,
                        "missing",
                        "当該candidateの原対応relationが供給されていない。",
                        "CORE/009",
                        "proposal_relation",
                        op_src_ref,
                    ),
                )
            )
            rel_observations.append(
                {
                    "candidate_entry_index": k_idx,
                    "result_index": cand["result_index"],
                    "member_index": cand["member_index"],
                    "template_ref_read": copy.deepcopy(t_read),
                    "relation_occurrences": [],
                    "native_ref4": {
                        "tag": "unformed",
                        "diagnostic_refs": [_diag(path)],
                    },
                }
            )
            continue

        matched_rows, valid_targets, row_diag_ptrs = [], [], []
        for m_pos, (j_idx, rel) in enumerate(matched_rels):
            loc = rel.get("native_ref4_locator") or {}
            t_s_idx, t_r_idx, ptr_str = (
                loc.get("source_occurrence_index"),
                loc.get("record_index"),
                loc.get("payload_pointer"),
            )
            att = (
                source_attempts[t_s_idx]
                if isinstance(t_s_idx, int) and 0 <= t_s_idx < len(source_attempts)
                else None
            )
            t_src_ref = (
                s_occs[t_s_idx].get("source_ref") if att is not None else op_src_ref
            )
            t_owner = s_occs[t_s_idx].get("owner") if att is not None else "CORE/009"

            if att is None or att["decode"]["tag"] != "ready":
                blocked = (
                    [_diag(f"/attempt_capture/source_attempts/{t_s_idx}/decode")]
                    if att is not None
                    else []
                )
                t_read_res = {
                    "tag": "unreached",
                    "requested": str(ptr_str or ""),
                    "blocked_by": blocked,
                }
                q_origin = {"tag": "unreached", "blocked_by": copy.deepcopy(blocked)}
            else:
                recs = att["decode"]["body"]["records"]
                w_idx = att["qualification"]["walk_index"]
                walk = qual_snap["source_walks"][w_idx]
                target_flat = [
                    f_idx
                    for f_idx, qro in enumerate(qual_snap["qualified_raw_occurrences"])
                    if qro["source_occurrence_index"] == t_s_idx
                    and qro["record_index"] == t_r_idx
                ]
                q_origin = {
                    "tag": "observed",
                    "source_occurrence_index": t_s_idx,
                    "walk_index": w_idx,
                    "classification_flags": copy.deepcopy(walk["classification_flags"]),
                    "qualified_record_indices": copy.deepcopy(
                        walk["qualified_record_indices"]
                    ),
                    "target_record_indices": target_flat,
                    "input_issue_indices": copy.deepcopy(walk["input_issue_indices"]),
                    "source_issue_indices": copy.deepcopy(walk["source_issue_indices"]),
                }
                if (
                    isinstance(t_r_idx, int)
                    and 0 <= t_r_idx < len(recs)
                    and recs[t_r_idx].get("subject_ref") == loc.get("subject_ref")
                    and s_occs[t_s_idx].get("source_ref") == loc.get("source_ref")
                ):
                    p_prefix = f"/attempt_capture/source_attempts/{t_s_idx}/decode/body/records/{t_r_idx}/payload"
                    t_read_res = _read_target_pointer(
                        recs[t_r_idx].get("payload"), p_prefix, ptr_str
                    )
                else:
                    t_read_res = {
                        "tag": "missing",
                        "requested": str(ptr_str or ""),
                        "parent_location": _diag(
                            f"/attempt_capture/source_attempts/{t_s_idx}/decode/body/records"
                        ),
                    }

            m_diags = []
            locator_ok = t_read_res["tag"] == "present" and _is_valid_os_ref4(
                t_read_res.get("value")
            )
            if not locator_ok:
                loc_path = f"/relation_observations/{k_idx}/relation_occurrences/{m_pos}/relation/native_ref4_locator"
                m_diags.append(_diag(loc_path))
                row_diag_ptrs.append(_diag(loc_path))
                rel_issues.append(
                    (
                        loc_path,
                        _issue(
                            loc_path,
                            "unresolved",
                            "当該relationのtargetを原source所在から形成できない。",
                            t_owner,
                            "proposal_relation",
                            t_src_ref,
                        ),
                    )
                )

            qual_ok = (
                q_origin["tag"] == "observed"
                and len(q_origin["target_record_indices"]) > 0
            )
            if not qual_ok:
                q_path = f"/relation_observations/{k_idx}/relation_occurrences/{m_pos}/qualification_origin"
                m_diags.append(_diag(q_path))
                row_diag_ptrs.append(_diag(q_path))
                rel_src_refs = []
                for si_idx in q_origin.get("source_issue_indices", []):
                    for r_ref in (
                        qual_snap["source_issues"][si_idx].get("related_source_refs")
                        or []
                    ):
                        if r_ref not in rel_src_refs:
                            rel_src_refs.append(copy.deepcopy(r_ref))
                rel_issues.append(
                    (
                        q_path,
                        _issue(
                            q_path,
                            "unresolved",
                            "当該source occurrenceのtargetに有効な資格根拠が残らない。",
                            t_owner,
                            "proposal_source",
                            t_src_ref,
                            rel_src_refs,
                        ),
                    )
                )

            if locator_ok and qual_ok:
                valid_targets.append((j_idx, m_pos, t_s_idx, t_read_res["value"]))
            matched_rows.append(
                {
                    "relation_occurrence_index": j_idx,
                    "relation": copy.deepcopy(rel),
                    "target_read": t_read_res,
                    "qualification_origin": q_origin,
                    "diagnostic_refs": m_diags,
                }
            )

        if len(valid_targets) == len(matched_rows) and valid_targets:
            first_ref4 = valid_targets[0][3]
            if all(vt[3] == first_ref4 for vt in valid_targets[1:]):
                native_ref4 = {
                    "tag": "formed",
                    "value": copy.deepcopy(first_ref4),
                    "representative_relation_occurrence_index": valid_targets[0][0],
                }
            else:
                diff_path = f"/relation_observations/{k_idx}/native_ref4"
                other_s_refs = [
                    s_occs[vt[2]].get("source_ref")
                    for vt in valid_targets[1:]
                    if vt[3] != first_ref4
                ]
                rel_issues.append(
                    (
                        diff_path,
                        _issue(
                            diff_path,
                            "conflict",
                            "同candidateに対応する原Ref4間に既知差がある。",
                            "CORE/009",
                            "proposal_relation",
                            s_occs[valid_targets[0][2]].get("source_ref"),
                            other_s_refs,
                        ),
                    )
                )
                d_refs = [
                    _diag(
                        f"/relation_observations/{k_idx}/relation_occurrences/{vt[1]}/target_read"
                    )
                    for vt in valid_targets
                ]
                native_ref4 = {"tag": "unformed", "diagnostic_refs": d_refs}
        else:
            native_ref4 = {"tag": "unformed", "diagnostic_refs": row_diag_ptrs}

        rel_observations.append(
            {
                "candidate_entry_index": k_idx,
                "result_index": cand["result_index"],
                "member_index": cand["member_index"],
                "template_ref_read": copy.deepcopy(t_read),
                "relation_occurrences": matched_rows,
                "native_ref4": native_ref4,
            }
        )

    return rel_observations, rel_issues


def build_general_original_operation_proposal(request):
    """Build GeneralProposalView from RawProviderRequest."""
    req_cap = copy.deepcopy(request)
    s_occs = req_cap.get("source_occurrences") or []
    source_attempts = _decode_sources(s_occs)
    qual_snap = _qualify_sources(req_cap, source_attempts)
    op_role = _evaluate_operation_role(req_cap, source_attempts, qual_snap)

    if op_role["tag"] != "ready":
        role_blocked = (
            copy.deepcopy(op_role["blocked_by"])
            if op_role["tag"] == "unreached"
            else [
                _diag(f"/operation_role/input_issues/{i}")
                for i in range(len(op_role.get("input_issues") or []))
            ]
        )
        gv_blocked = [_diag(f"/attempt_capture{d['pointer']}") for d in role_blocked]
        unr = {"tag": "unreached", "blocked_by": copy.deepcopy(gv_blocked)}
        return {
            "attempt_capture": {
                "request_capture": req_cap,
                "source_attempts": source_attempts,
                "qualification_snapshot": qual_snap,
                "operation_role": op_role,
                "native_dispatch": {
                    "tag": "not_called",
                    "native_call_count": 0,
                    "blocked_by": role_blocked,
                },
            },
            "membership_capture": copy.deepcopy(unr),
            "universe_observation": copy.deepcopy(unr),
            "relation_observations": [],
            "proposed_body": copy.deepcopy(unr),
            "body_issues": [],
        }

    frame = op_role["frame"]
    native_ret = build_general_native_proposal_record_detail(frame["caller_inputs"])
    native_dispatch = {
        "tag": "returned",
        "native_call_count": 1,
        "symbol": "build_general_native_proposal_record_detail",
        "value": native_ret,
    }
    membership_capture = {
        "tag": "observed",
        "native_location": _diag("/attempt_capture/native_dispatch/value/value"),
        "record_location": _diag("/attempt_capture/native_dispatch/value/value/record"),
    }
    n_u_obs = native_ret["universe_observation"]
    universe_observation = (
        {
            "tag": "observed",
            "comparison_location": _diag(
                "/attempt_capture/native_dispatch/value/value/capture/capture/caller_return/producer_observations/1/comparison"
            ),
            "value": copy.deepcopy(n_u_obs["value"]["observation"]),
        }
        if n_u_obs["tag"] == "observed"
        else {
            "tag": "not_observed",
            "original_dispatch": copy.deepcopy(n_u_obs["original_dispatch"]),
        }
    )

    op_src_ref = s_occs[req_cap["operation_source_occurrence_index"]].get("source_ref")
    n_val = native_ret["value"]
    n_rec = n_val["record"]
    rel_observations, rel_issues = _evaluate_candidate_relations(
        n_rec["candidate_entries"],
        frame["relation_occurrences"],
        req_cap,
        source_attempts,
        qual_snap,
        op_src_ref,
    )

    body_issues, body_diags = [], []
    cov = n_rec["coverage"]
    cov_ok = (
        cov.get("tag") == "enumerated"
        and cov.get("completion") == "covered_as_captured"
    )
    mem_ok = n_rec["membership_completion"] == "resolved_for_captured_members"

    if not cov_ok:
        ptr = (
            "/attempt_capture/native_dispatch/value/value/capture/proposal"
            if n_val["capture"]["proposal"]["tag"] == "unavailable"
            else "/attempt_capture/native_dispatch/value/value/record/coverage"
        )
        body_diags.append(_diag(ptr))
        body_issues.append(
            _issue(
                "/attempt_capture/native_dispatch/value/value/record/coverage",
                "unresolved",
                "元candidate出現のcoverageが完結していない。",
                "CORE/009",
                "proposal_coverage",
                op_src_ref,
            )
        )
        body_diags.append(_diag(f"/body_issues/{len(body_issues) - 1}"))
    elif not mem_ok:
        mc_ptr = (
            "/attempt_capture/native_dispatch/value/value/record/membership_completion"
        )
        body_diags.append(_diag(mc_ptr))
        body_issues.append(
            _issue(
                mc_ptr,
                "unresolved",
                "捕捉された提案membershipが完結していない。",
                "CORE/009",
                "proposal_membership",
                op_src_ref,
            )
        )
        body_diags.append(_diag(f"/body_issues/{len(body_issues) - 1}"))

    for _, iss in rel_issues:
        body_issues.append(iss)
        body_diags.append(_diag(f"/body_issues/{len(body_issues) - 1}"))

    all_rels_formed = all(
        r_obs["native_ref4"]["tag"] == "formed" for r_obs in rel_observations
    )
    proposed_body = (
        {
            "tag": "formed",
            "value": {
                "proposed_refs": [
                    copy.deepcopy(r_obs["native_ref4"]["value"])
                    for r_obs in rel_observations
                ],
                "proposed_source": copy.deepcopy(frame["proposed_source"]),
            },
        }
        if (cov_ok and mem_ok and all_rels_formed and not body_issues)
        else {"tag": "unformed", "diagnostic_refs": body_diags}
    )

    return {
        "attempt_capture": {
            "request_capture": req_cap,
            "source_attempts": source_attempts,
            "qualification_snapshot": qual_snap,
            "operation_role": op_role,
            "native_dispatch": native_dispatch,
        },
        "membership_capture": membership_capture,
        "universe_observation": universe_observation,
        "relation_observations": rel_observations,
        "proposed_body": proposed_body,
        "body_issues": body_issues,
    }
