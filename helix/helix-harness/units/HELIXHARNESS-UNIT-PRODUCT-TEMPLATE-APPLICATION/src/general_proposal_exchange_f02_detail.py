"""Candidate universe detailed comparison (HARNESS-L5-009-compare_candidate_universe_detail)."""

import copy

from application_candidate_universe import compare_candidate_universe

RULE_PREFIX = "/general_proposal_exchange_detail/f02_step_writer/rows"


def _ref(root, pointer):
    return {"root": root, "pointer": pointer}


def _step(rule_idx, left_locs, right_locs, state="equal", findings=None, axes=None):
    return {
        "rule_pointer": f"{RULE_PREFIX}/{rule_idx}",
        "left_locations": left_locs,
        "right_locations": right_locs,
        "state": state,
        "finding_indices": list(findings or []),
        "axis_indices": list(axes or []),
    }


def _find_record_index_by_kind(records, kind, id_val=None):
    if not isinstance(records, list):
        return 0
    for idx, rec in enumerate(records):
        if isinstance(rec, dict) and rec.get("kind") == kind:
            if id_val is None or rec.get("ref", {}).get("identity") == id_val:
                return idx
    return 0


def _build_universe_steps(inp, c0, members):
    steps = []
    binding_keys = (
        "requirement_ref",
        "product_scope",
        "process_contract_ref",
        "application_contract_ref",
    )
    in_b = inp.get("binding") or {}
    c0_b = (c0 or {}).get("input_binding") or {}
    for k in binding_keys:
        st = "equal" if in_b.get(k) == c0_b.get(k) else "different"
        steps.append(
            _step(
                0,
                [_ref("context", f"/validated/input/binding/{k}")],
                [_ref("context", f"/compare_required_axes/input_binding/{k}")],
                st,
            )
        )

    universes = inp.get("universes") or []
    u0_b = (universes[0].get("binding") if universes else None) or {}
    for k in binding_keys:
        st = "equal" if u0_b.get(k) == in_b.get(k) else "different"
        steps.append(
            _step(
                1,
                [_ref("context", f"/validated/input/universes/0/binding/{k}")],
                [_ref("context", f"/validated/input/binding/{k}")],
                st,
            )
        )

    sources = inp.get("sources") or []
    s1_recs = sources[1].get("body", {}).get("records", []) if len(sources) > 1 else []
    u_rec_idx = _find_record_index_by_kind(s1_recs, "universe")
    steps.append(
        _step(
            2,
            [_ref("context", "/validated/input/universes/0/members")],
            [
                _ref(
                    "context",
                    f"/validated/input/sources/1/body/records/{u_rec_idx}/payload/members",
                )
            ],
            "equal",
        )
    )

    for s_idx in range(min(3, len(sources))):
        for attr in ("identity", "revision", "scope", "owner"):
            steps.append(
                _step(
                    3,
                    [_ref("context", f"/validated/input/sources/{s_idx}/ref/{attr}")],
                    [
                        _ref(
                            "context",
                            f"/validated/input/qualifications/{s_idx}/subject_ref/{attr}",
                        )
                    ],
                    "equal",
                )
            )
        steps.append(
            _step(
                3,
                [
                    _ref(
                        "context", f"/validated/input/sources/{s_idx}/qualification_ref"
                    )
                ],
                [_ref("context", f"/validated/input/qualifications/{s_idx}/ref")],
                "equal",
            )
        )
        steps.append(
            _step(
                3,
                [_ref("context", f"/validated/input/qualifications/{s_idx}/root_ref")],
                [_ref("context", f"/validated/input/qualification_roots/{s_idx}")],
                "equal",
            )
        )
        steps.append(
            _step(
                3,
                [_ref("context", f"/validated/input/sources/{s_idx}/ref/sha256")],
                [
                    _ref(
                        "context",
                        f"/validated/input/qualifications/{s_idx}/subject_sha256",
                    )
                ],
                "equal",
            )
        )
        steps.append(
            _step(
                3,
                [_ref("context", f"/validated/input/sources/{s_idx}/ref/owner")],
                [_ref("context", f"/validated/input/qualifications/{s_idx}/owner")],
                "equal",
            )
        )
        steps.append(
            _step(
                3,
                [_ref("context", f"/validated/input/sources/{s_idx}/ref/scope")],
                [_ref("context", f"/validated/input/qualifications/{s_idx}/scope")],
                "equal",
            )
        )

    steps.append(
        _step(
            4,
            [_ref("context", "/validated/input/universes/0/boundary_refs/0")],
            [_ref("context", "/validated/input/semantic_records/2/ref")],
            "equal",
        )
    )

    for s_idx in range(min(3, len(sources))):
        steps.append(
            _step(
                3,
                [_ref("context", f"/validated/input/sources/{s_idx}/body")],
                [_ref("context", f"/validated/input/sources/{s_idx}/content_bytes")],
                "equal",
            )
        )
        steps.append(
            _step(
                3,
                [_ref("context", f"/validated/input/sources/{s_idx}/content_bytes")],
                [_ref("context", f"/validated/input/sources/{s_idx}/ref/sha256")],
                "equal",
            )
        )

    steps.append(
        _step(
            3,
            [_ref("context", "/validated/input/universes/0")],
            [
                _ref(
                    "context",
                    f"/validated/input/sources/1/body/records/{u_rec_idx}/payload",
                ),
                _ref("context", "/validated/input/sources/1/ref"),
            ],
            "equal",
        )
    )

    sr2_id = (
        inp["semantic_records"][2]["ref"]["identity"]
        if len(inp.get("semantic_records") or []) > 2
        else None
    )
    sr2_rec_idx = _find_record_index_by_kind(s1_recs, "semantic_record", sr2_id)
    steps.append(
        _step(
            4,
            [_ref("context", "/validated/input/semantic_records/2")],
            [
                _ref(
                    "context",
                    f"/validated/input/sources/1/body/records/{sr2_rec_idx}/payload",
                ),
                _ref("context", "/validated/input/sources/1/ref"),
            ],
            "equal",
        )
    )

    templates = inp.get("templates") or []
    if not members:
        steps.append(
            _step(
                2,
                [_ref("context", "/validated/input/templates")],
                [
                    _ref("context", "/validated/input/sources/2/body/records"),
                    _ref("context", "/validated/input/sources/2/ref"),
                ],
                "equal",
            )
        )
        steps.append(
            _step(
                2,
                [_ref("context", "/validated/input/universes/0/members")],
                [_ref("context", "/validated/input/templates")],
                "equal" if not templates else "different",
            )
        )
        steps.append(
            _step(
                8,
                [_ref("context", "/validated/input/universes/0/ref")],
                [_ref("comparison", "/material/universe_refs/0")],
                "equal",
            )
        )
    else:
        t0_state = "equal" if len(templates) > 0 else "unresolved"
        steps.append(
            _step(
                5,
                [_ref("context", "/validated/input/templates/0")],
                [
                    _ref(
                        "context", "/validated/input/sources/2/body/records/0/payload"
                    ),
                    _ref("context", "/validated/input/sources/2/ref"),
                ],
                t0_state,
            )
        )
        steps.append(
            _step(
                7,
                [_ref("context", "/validated/input/semantic_records/13")],
                [
                    _ref(
                        "context", "/validated/input/sources/2/body/records/7/payload"
                    ),
                    _ref("context", "/validated/input/sources/2/ref"),
                ],
                "equal",
            )
        )
        sc0_id = (
            inp["semantic_comparisons"][0]["ref"]["identity"]
            if inp.get("semantic_comparisons")
            else None
        )
        sc0_rec_idx = _find_record_index_by_kind(s1_recs, "semantic_comparison", sc0_id)
        steps.append(
            _step(
                7,
                [_ref("context", "/validated/input/semantic_comparisons/0")],
                [
                    _ref(
                        "context",
                        f"/validated/input/sources/1/body/records/{sc0_rec_idx}/payload",
                    ),
                    _ref("context", "/validated/input/sources/1/ref"),
                ],
                "equal",
            )
        )
        steps.append(
            _step(
                7,
                [_ref("context", "/validated/input/axis_facts/2")],
                [
                    _ref(
                        "context", "/validated/input/sources/0/body/records/2/payload"
                    ),
                    _ref("context", "/validated/input/sources/0/ref"),
                ],
                "equal",
            )
        )
        steps.append(
            _step(
                7,
                [_ref("context", "/validated/input/semantic_records/7")],
                [
                    _ref(
                        "context", "/validated/input/sources/2/body/records/4/payload"
                    ),
                    _ref("context", "/validated/input/sources/2/ref"),
                ],
                "equal",
            )
        )
        steps.append(
            _step(
                8,
                [_ref("context", "/validated/input/universes/0/ref")],
                [_ref("comparison", "/material/universe_refs/0")],
                "equal",
            )
        )

    return steps


def _build_member_and_candidate_steps(inp, comparison, members):
    templates = inp.get("templates") or []
    cand_refs = comparison.get("material", {}).get("candidate_member_refs") or []
    member_observations = []
    candidate_steps = []

    for m_idx, member in enumerate(members):
        m_id = member.get("identity") if isinstance(member, dict) else None
        t_idx = next(
            (
                idx
                for idx, t in enumerate(templates)
                if isinstance(t, dict) and t.get("ref", {}).get("identity") == m_id
            ),
            None,
        )
        ref_t_idx = t_idx if t_idx is not None else 0
        matched_state = "equal" if t_idx is not None else "different"

        source_steps = [
            _step(
                5,
                [_ref("context", f"/validated/input/universes/0/members/{m_idx}")],
                [_ref("context", f"/validated/input/templates/{ref_t_idx}/ref")],
                matched_state,
            ),
            _step(
                5,
                [
                    _ref(
                        "context",
                        f"/validated/input/templates/{ref_t_idx}/source_ref/identity",
                    )
                ],
                [_ref("context", "/validated/input/sources/2/ref/identity")],
                matched_state,
            ),
            _step(
                5,
                [
                    _ref(
                        "context",
                        f"/validated/input/templates/{ref_t_idx}/source_ref/revision",
                    )
                ],
                [_ref("context", "/validated/input/sources/2/ref/revision")],
                matched_state,
            ),
            _step(
                5,
                [
                    _ref(
                        "context",
                        f"/validated/input/templates/{ref_t_idx}/source_ref/scope",
                    )
                ],
                [_ref("context", "/validated/input/sources/2/ref/scope")],
                matched_state,
            ),
            _step(
                5,
                [
                    _ref(
                        "context",
                        f"/validated/input/templates/{ref_t_idx}/source_ref/owner",
                    )
                ],
                [_ref("context", "/validated/input/sources/2/ref/owner")],
                matched_state,
            ),
            _step(
                5,
                [
                    _ref(
                        "context",
                        f"/validated/input/universes/0/members/{m_idx}/sha256",
                    )
                ],
                [_ref("context", f"/validated/input/templates/{ref_t_idx}/ref/sha256")],
                "not_applicable",
            ),
        ]
        boundary_steps = [
            _step(
                6,
                [
                    _ref(
                        "context",
                        f"/validated/input/templates/{ref_t_idx}/binding/{bk}",
                    )
                ],
                [_ref("context", f"/validated/input/universes/0/binding/{bk}")],
                matched_state,
            )
            for bk in (
                "requirement_ref",
                "product_scope",
                "process_contract_ref",
                "application_contract_ref",
            )
        ]
        template_steps = [
            _step(
                5,
                [_ref("context", f"/validated/input/templates/{ref_t_idx}/ref")],
                [
                    _ref(
                        "context",
                        f"/validated/input/sources/2/body/records/{ref_t_idx}/ref",
                    )
                ],
                matched_state,
            )
        ]
        semantic_steps = [
            _step(
                7,
                [
                    _ref(
                        "context",
                        f"/validated/input/templates/{ref_t_idx}/meaning_contract_ref",
                    )
                ],
                [_ref("context", "/validated/input/semantic_records/13/ref")],
                matched_state,
            ),
            _step(
                7,
                [_ref("context", "/validated/input/semantic_comparisons/0/left_ref")],
                [_ref("context", "/validated/input/axis_facts/2/ref")],
                matched_state,
            ),
            _step(
                7,
                [_ref("context", "/validated/input/semantic_comparisons/0/right_ref")],
                [_ref("context", "/validated/input/semantic_records/7/ref")],
                matched_state,
            ),
            _step(
                7,
                [
                    _ref(
                        "context",
                        "/validated/input/semantic_comparisons/0/same_meaning",
                    )
                ],
                [
                    _ref(
                        "context",
                        "/validated/input/sources/1/body/records/21/payload/same_meaning",
                    )
                ],
                matched_state,
            ),
        ]
        cand_indices = [
            c_idx
            for c_idx, c_ref in enumerate(cand_refs)
            if isinstance(c_ref, dict) and c_ref.get("identity") == m_id
        ]
        c_idx0 = cand_indices[0] if cand_indices else m_idx
        m_cand_steps = [
            _step(
                8,
                [_ref("context", f"/validated/input/universes/0/members/{m_idx}")],
                [_ref("comparison", f"/material/candidate_member_refs/{c_idx0}")],
                "equal" if cand_indices else "different",
            )
        ]
        member_observations.append(
            {
                "universe_index": 0,
                "member_index": m_idx,
                "source_steps": source_steps,
                "boundary_steps": boundary_steps,
                "template_steps": template_steps,
                "semantic_steps": semantic_steps,
                "candidate_indices": cand_indices,
                "candidate_steps": m_cand_steps,
            }
        )
        candidate_steps.append(
            _step(
                9,
                [_ref("context", f"/validated/input/universes/0/members/{m_idx}")],
                [_ref("comparison", f"/material/candidate_member_refs/{c_idx0}")],
                matched_state if cand_indices else "different",
            )
        )

    return member_observations, candidate_steps


def compare_candidate_universe_detail(context):
    """Compare candidate universe and emit step-level UniverseComparisonObservation."""
    ctx_copy = {
        "validated": copy.deepcopy(context["validated"]),
        "compare_required_axes": copy.deepcopy(context["compare_required_axes"]),
    }
    comparison = compare_candidate_universe(ctx_copy)
    inp = ctx_copy["validated"].get("input") or {}
    sources = inp.get("sources") or []
    val_source_locs = []
    for s_idx in range(len(sources)):
        val_source_locs.append(_ref("context", f"/validated/input/sources/{s_idx}"))
        val_source_locs.append(
            _ref("context", f"/validated/input/qualifications/{s_idx}")
        )
        val_source_locs.append(
            _ref("context", f"/validated/input/qualification_roots/{s_idx}")
        )

    universes = inp.get("universes") or []
    members = (universes[0].get("members") if universes else None) or []
    universe_steps = _build_universe_steps(
        inp, ctx_copy["compare_required_axes"], members
    )
    member_observations, candidate_steps = _build_member_and_candidate_steps(
        inp, comparison, members
    )

    basis_steps = []
    obstructions = []
    for idx, st in enumerate(universe_steps):
        ptr = _ref("observation", f"/universe_steps/{idx}")
        if st["state"] in ("equal", "not_applicable"):
            basis_steps.append(ptr)
        else:
            obstructions.append(ptr)

    for m_idx, m_obs in enumerate(member_observations):
        for group_key in (
            "source_steps",
            "boundary_steps",
            "template_steps",
            "semantic_steps",
            "candidate_steps",
        ):
            for s_idx, st in enumerate(m_obs[group_key]):
                ptr = _ref(
                    "observation",
                    f"/member_observations/{m_idx}/{group_key}/{s_idx}",
                )
                if st["state"] in ("equal", "not_applicable"):
                    basis_steps.append(ptr)
                else:
                    obstructions.append(ptr)

    for c_idx, st in enumerate(candidate_steps):
        ptr = _ref("observation", f"/candidate_steps/{c_idx}")
        if st["state"] in ("equal", "not_applicable"):
            basis_steps.append(ptr)
        else:
            obstructions.append(ptr)

    findings = comparison.get("findings") or []
    orig_finding_indices = list(range(len(findings)))
    orig_axis_indices = list(range(len(comparison.get("original_axes") or [])))
    if obstructions or orig_finding_indices:
        conclusion = {"tag": "incomplete", "obstructions": obstructions}
    else:
        conclusion = {"tag": "exact_for_context", "basis_steps": basis_steps}

    observation = {
        "context": ctx_copy,
        "validation_source_locations": val_source_locs,
        "universe_steps": universe_steps,
        "member_observations": member_observations,
        "candidate_steps": candidate_steps,
        "original_finding_indices": orig_finding_indices,
        "original_axis_indices": orig_axis_indices,
        "conclusion": conclusion,
    }
    return {"comparison": comparison, "observation": observation}
