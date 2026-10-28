"""Selected knowledge comparison (HARNESS-L5-009-compare_selected_knowledge / FN6)."""

import copy
import json


def _json_equal(left, right):
    return json.dumps(left, sort_keys=True, ensure_ascii=False) == json.dumps(
        right, sort_keys=True, ensure_ascii=False
    )


def _same_ref_ignoring_sha(left, right):
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    return (
        left.get("identity") == right.get("identity")
        and left.get("revision") == right.get("revision")
        and left.get("scope") == right.get("scope")
        and left.get("owner") == right.get("owner")
        and left.get("source_locator") == right.get("source_locator")
    )


def _is_valid_ref(ref):
    return (
        isinstance(ref, dict)
        and isinstance(ref.get("identity"), str)
        and bool(ref["identity"])
        and isinstance(ref.get("revision"), str)
        and bool(ref["revision"])
        and isinstance(ref.get("scope"), dict)
    )


def _is_unusable(ref, unusable_refs):
    if not isinstance(ref, dict):
        return True
    return any(_same_ref_ignoring_sha(ref, u) for u in unusable_refs)


def _is_stale_operational_state(op_state):
    if isinstance(op_state, dict):
        if op_state.get("stale") is True:
            return True
        if op_state.get("state") == "stale":
            return True
        stale_reason = op_state.get("stale_reason")
        if isinstance(stale_reason, str) and bool(stale_reason.strip()):
            return True
    return False


def _resolve_rfc6901(root_obj, pointer):
    if not isinstance(pointer, str):
        return False, None
    if pointer == "":
        return True, root_obj
    if not pointer.startswith("/"):
        return False, None
    cur = root_obj
    for raw_token in pointer.split("/")[1:]:
        token = raw_token.replace("~1", "/").replace("~0", "~")
        if isinstance(cur, dict):
            if token not in cur:
                return False, None
            cur = cur[token]
        elif isinstance(cur, list):
            if not token.isdigit():
                return False, None
            idx = int(token)
            if idx < 0 or idx >= len(cur):
                return False, None
            cur = cur[idx]
        else:
            return False, None
    return True, cur


def _evaluate_correspondence_records(
    raw,
    binding,
    unusable_refs,
    selected_knowledge_refs,
    unselected_unobserved_refs,
    usable_candidate_refs,
    original_axes,
):
    correspondence_issues = []
    sources = [s for s in (raw.get("sources") or []) if isinstance(s, dict)]
    templates = [t for t in (raw.get("templates") or []) if isinstance(t, dict)]
    knowledge_records = [
        kr for kr in (raw.get("knowledge_records") or []) if isinstance(kr, dict)
    ]

    for rec_idx, rec in enumerate(raw.get("semantic_records") or []):
        if (
            not isinstance(rec, dict)
            or rec.get("kind") != "selected_brain_definition_correspondence"
        ):
            continue

        reasons = []
        rec_ref = rec.get("ref")
        if "ref" not in rec or not _is_valid_ref(rec_ref):
            reasons.append("Correspondence record.ref is absent or invalid.")
        if not isinstance(rec.get("binding"), dict) or not _json_equal(
            rec.get("binding"), binding
        ):
            reasons.append(
                "Correspondence record.binding does not match application binding."
            )

        rec_src_ref = rec.get("source_ref")
        rec_sources = [
            s
            for s in sources
            if _is_valid_ref(rec_src_ref)
            and _same_ref_ignoring_sha(s.get("ref"), rec_src_ref)
            and not _is_unusable(s.get("ref"), unusable_refs)
        ]
        if not rec_sources:
            reasons.append("Correspondence record.source_ref is missing or unusable.")

        meaning = rec.get("meaning")
        if not isinstance(meaning, dict):
            reasons.append("Correspondence record.meaning is not an object.")
            meaning = {}

        sel_t_ref = meaning.get("selected_template_ref")
        sel_k_ref = meaning.get("selected_knowledge_ref")
        brain_src_ref = meaning.get("brain_source_ref")
        in_ptr = meaning.get("input_pointer")
        comp_ptr = meaning.get("comparison_pointer")
        b_bind_ptr = meaning.get("brain_binding_pointer")

        # Check if target is strictly an unselected knowledge ref
        if (
            not reasons
            and _is_valid_ref(sel_k_ref)
            and any(
                _same_ref_ignoring_sha(sel_k_ref, u) for u in unselected_unobserved_refs
            )
            and not any(
                _same_ref_ignoring_sha(sel_k_ref, s) for s in selected_knowledge_refs
            )
        ):
            continue

        matched_tmpls = [
            t
            for t in templates
            if _is_valid_ref(sel_t_ref)
            and _same_ref_ignoring_sha(t.get("ref"), sel_t_ref)
        ]
        if not matched_tmpls:
            reasons.append(
                "selected_template_ref does not resolve to an input template."
            )

        matched_krs = [
            kr
            for kr in knowledge_records
            if _is_valid_ref(sel_k_ref)
            and _same_ref_ignoring_sha(kr.get("ref"), sel_k_ref)
            and any(
                _same_ref_ignoring_sha(sel_k_ref, s) for s in selected_knowledge_refs
            )
        ]
        if not matched_krs:
            reasons.append(
                "selected_knowledge_ref does not resolve to a selected KnowledgeUseRecord."
            )

        brain_sources = [
            s
            for s in sources
            if _is_valid_ref(brain_src_ref)
            and _same_ref_ignoring_sha(s.get("ref"), brain_src_ref)
            and not _is_unusable(s.get("ref"), unusable_refs)
            and isinstance(s.get("body"), dict)
        ]
        if not brain_sources:
            reasons.append("brain_source_ref is missing or unusable.")

        resolved_input = None
        resolved_comp = None
        resolved_b_bind = None
        if brain_sources:
            b_body = brain_sources[0]["body"]
            ok_in, resolved_input = _resolve_rfc6901(b_body, in_ptr)
            ok_comp, resolved_comp = _resolve_rfc6901(b_body, comp_ptr)
            ok_bb, resolved_b_bind = _resolve_rfc6901(b_body, b_bind_ptr)
            if not (ok_in and isinstance(resolved_input, dict)):
                reasons.append("input_pointer did not resolve in brain_source.body.")
            if not (ok_comp and isinstance(resolved_comp, dict)):
                reasons.append(
                    "comparison_pointer did not resolve in brain_source.body."
                )
            if not (ok_bb and isinstance(resolved_b_bind, dict)):
                reasons.append(
                    "brain_binding_pointer did not resolve in brain_source.body."
                )
            if isinstance(resolved_comp, dict):
                if (
                    resolved_comp.get("producer_symbol")
                    != "compare_descriptor_definitions"
                ):
                    reasons.append(
                        "comparison producer_symbol is not compare_descriptor_definitions."
                    )
                if resolved_comp.get("call_input_pointer") != in_ptr:
                    reasons.append(
                        "comparison lacks explicit call_input_pointer correspondence."
                    )

        if reasons:
            unique_src_ref = (
                copy.deepcopy(rec_sources[0]["ref"]) if len(rec_sources) == 1 else None
            )
            correspondence_issues.append(
                {
                    "locator": f"/semantic_records/{rec_idx}",
                    "reason": " ".join(reasons),
                    "source_ref": unique_src_ref,
                }
            )
            continue

        target_kr = matched_krs[0]
        rec_source_env = rec_sources[0]
        brain_source_env = brain_sources[0]
        comp_axes = resolved_comp.get("original_axes")
        if not isinstance(comp_axes, list):
            comp_axes = resolved_comp.get("axes") or []

        for ax_idx, orig_ax in enumerate(comp_axes):
            if not isinstance(orig_ax, dict):
                continue
            if (
                _json_equal(orig_ax.get("binding"), resolved_b_bind)
                and orig_ax.get("axis") in ("field.definition", "descriptor.definition")
                and orig_ax.get("state") == "missing"
            ):
                usable_candidate_refs[:] = [
                    r
                    for r in usable_candidate_refs
                    if not _same_ref_ignoring_sha(r, target_kr["ref"])
                ]
                original_axes.append(
                    {
                        "subject_ref": copy.deepcopy(target_kr["ref"]),
                        "binding": copy.deepcopy(target_kr["binding"]),
                        "axis": "knowledge.usability",
                        "state": "unknown",
                        "original_refs": [
                            copy.deepcopy(rec_ref),
                            copy.deepcopy(rec_source_env["ref"]),
                            copy.deepcopy(brain_source_env["ref"]),
                        ],
                        "reason": (
                            f"Correspondence /semantic_records/{rec_idx} observed missing "
                            f"BRAIN definition at {comp_ptr}/original_axes/{ax_idx}: "
                            f"{orig_ax.get('reason', '')}"
                        ),
                        "backflow_owner": copy.deepcopy(orig_ax.get("backflow_owner")),
                    }
                )

    return correspondence_issues


def compare_selected_knowledge(context):
    """Compare selected knowledge records and forward claims (HARNESS-L5-009-compare_selected_knowledge)."""
    empty_material = {
        "selected_knowledge_refs": [],
        "checked_field_refs": [],
        "usable_candidate_refs": [],
        "unselected_unobserved_refs": [],
    }
    if not isinstance(context, dict):
        return {
            "producer_symbol": "compare_selected_knowledge",
            "input_binding": None,
            "original_axes": [],
            "findings": [],
            "material": copy.deepcopy(empty_material),
        }

    validated = context.get("validated")
    raw = validated.get("input") if isinstance(validated, dict) else None
    binding = (
        copy.deepcopy(raw.get("binding"))
        if isinstance(raw, dict) and isinstance(raw.get("binding"), dict)
        else None
    )
    req_axes_comp = context.get("compare_required_axes")

    if (
        not isinstance(validated, dict)
        or not isinstance(raw, dict)
        or not isinstance(binding, dict)
        or not isinstance(req_axes_comp, dict)
        or req_axes_comp.get("producer_symbol") != "compare_required_axes"
        or not _json_equal(req_axes_comp.get("input_binding"), binding)
    ):
        return {
            "producer_symbol": "compare_selected_knowledge",
            "input_binding": binding,
            "original_axes": [],
            "findings": [],
            "material": copy.deepcopy(empty_material),
        }

    unusable_refs = validated.get("unusable_source_refs") or []
    ops = raw.get("operations") if isinstance(raw.get("operations"), dict) else {}
    selected_knowledge_refs = [
        copy.deepcopy(r)
        for r in (ops.get("selected_knowledge_refs") or [])
        if isinstance(r, dict)
    ]
    unselected_unobserved_refs = [
        copy.deepcopy(r)
        for r in (ops.get("unselected_knowledge_refs") or [])
        if isinstance(r, dict)
    ]

    checked_field_refs = []
    usable_candidate_refs = []
    original_axes = []
    findings = []

    knowledge_records = [
        kr for kr in (raw.get("knowledge_records") or []) if isinstance(kr, dict)
    ]
    field_inputs = [
        fi for fi in (raw.get("field_inputs") or []) if isinstance(fi, dict)
    ]
    claims = [c for c in (raw.get("claims") or []) if isinstance(c, dict)]
    target_product_scope = binding.get("product_scope")

    for sel_ref in selected_knowledge_refs:
        matched_krs = [
            kr
            for kr in knowledge_records
            if _same_ref_ignoring_sha(kr.get("ref"), sel_ref)
        ]
        if not matched_krs:
            continue

        for kr in matched_krs:
            kr_ref = kr.get("ref") or sel_ref
            kr_src = kr.get("source_ref")
            kr_usable = not _is_unusable(kr_src, unusable_refs)

            # 1. Check stale operational_state
            is_stale = _is_stale_operational_state(kr.get("operational_state"))
            if is_stale:
                kr_usable = False
                for claim in claims:
                    if claim.get("kind") == "knowledge_usable" and (
                        _same_ref_ignoring_sha(claim.get("subject_ref"), kr_ref)
                        or any(
                            _same_ref_ignoring_sha(b, kr_ref)
                            for b in (claim.get("basis_refs") or [])
                        )
                    ):
                        src_refs = [copy.deepcopy(kr_ref)]
                        if isinstance(kr_src, dict):
                            src_refs.append(copy.deepcopy(kr_src))
                        if isinstance(claim.get("ref"), dict):
                            src_refs.append(copy.deepcopy(claim["ref"]))
                        findings.append(
                            {
                                "code": "stale_template_allowed",
                                "rule_ref": "HARNESS-L5-009-R-stale_template_allowed",
                                "subject_ref": copy.deepcopy(kr_ref),
                                "binding": copy.deepcopy(binding),
                                "axis": "knowledge.usability",
                                "state": "conflict",
                                "source_refs": src_refs,
                                "reason": (
                                    "Selected knowledge has an owner-recorded stale operational "
                                    "state and cannot be claimed usable."
                                ),
                                "backflow_owner": "brain_owner",
                            }
                        )

            # 2. Check authority_ref presence and usability
            auth_ref = kr.get("authority_ref")
            if not _is_valid_ref(auth_ref):
                kr_usable = False
                src_refs = [copy.deepcopy(kr_ref)]
                if isinstance(kr_src, dict):
                    src_refs.append(copy.deepcopy(kr_src))
                for claim in claims:
                    if claim.get(
                        "kind"
                    ) == "knowledge_usable" and _same_ref_ignoring_sha(
                        claim.get("subject_ref"), kr_ref
                    ):
                        if isinstance(claim.get("ref"), dict):
                            src_refs.append(copy.deepcopy(claim["ref"]))
                findings.append(
                    {
                        "code": "unapproved_template_allowed",
                        "rule_ref": "HARNESS-L5-009-R-unapproved_template_allowed",
                        "subject_ref": copy.deepcopy(kr_ref),
                        "binding": copy.deepcopy(binding),
                        "axis": "knowledge.authority",
                        "state": "unknown",
                        "source_refs": src_refs,
                        "reason": (
                            "Selected knowledge lacks a valid authority_ref ground and "
                            "cannot be treated as approved."
                        ),
                        "backflow_owner": "brain_owner",
                    }
                )

            # 3. Check product_scope match
            kr_binding_scope = (kr.get("binding") or {}).get("product_scope")
            kr_ref_scope = kr_ref.get("scope")
            if (
                kr_binding_scope != target_product_scope
                or kr_ref_scope != target_product_scope
            ):
                kr_usable = False
                src_refs = [copy.deepcopy(kr_ref)]
                if isinstance(kr_src, dict):
                    src_refs.append(copy.deepcopy(kr_src))
                findings.append(
                    {
                        "code": "foreign_product_template_allowed",
                        "rule_ref": "HARNESS-L5-009-R-foreign_product_template_allowed",
                        "subject_ref": copy.deepcopy(kr_ref),
                        "binding": copy.deepcopy(binding),
                        "axis": "knowledge.binding",
                        "state": "conflict",
                        "source_refs": src_refs,
                        "reason": (
                            "Selected knowledge product_scope differs from target "
                            "application product_scope."
                        ),
                        "backflow_owner": "core_owner",
                    }
                )

            # 4. Check required_field_refs against field_inputs
            req_fields = kr.get("required_field_refs")
            if not isinstance(req_fields, list):
                kr_usable = False
            else:
                for rf_ref in req_fields:
                    if not isinstance(rf_ref, dict):
                        kr_usable = False
                        continue
                    matched_fis = [
                        fi
                        for fi in field_inputs
                        if _same_ref_ignoring_sha(fi.get("ref"), rf_ref)
                        and _same_ref_ignoring_sha(
                            fi.get("template_ref"), kr.get("template_ref")
                        )
                        and isinstance(fi.get("definition_refs"), list)
                        and len(fi["definition_refs"]) > 0
                        and all(_is_valid_ref(dr) for dr in fi["definition_refs"])
                        and not _is_unusable(fi.get("source_ref"), unusable_refs)
                    ]
                    if matched_fis:
                        if not any(
                            _same_ref_ignoring_sha(rf_ref, existing)
                            for existing in checked_field_refs
                        ):
                            checked_field_refs.append(copy.deepcopy(rf_ref))
                    else:
                        kr_usable = False
                        src_refs = [copy.deepcopy(kr_ref), copy.deepcopy(rf_ref)]
                        if isinstance(kr_src, dict):
                            src_refs.append(copy.deepcopy(kr_src))
                        findings.append(
                            {
                                "code": "knowledge_gap_fallback",
                                "rule_ref": "HARNESS-L5-009-R-knowledge_gap_fallback",
                                "subject_ref": copy.deepcopy(rf_ref),
                                "binding": copy.deepcopy(binding),
                                "axis": "knowledge.required_input",
                                "state": "missing",
                                "source_refs": src_refs,
                                "reason": (
                                    "Required field definition ground for selected knowledge "
                                    "is missing from field_inputs."
                                ),
                                "backflow_owner": "brain_owner",
                            }
                        )

            if kr_usable and not any(
                _same_ref_ignoring_sha(kr_ref, existing)
                for existing in usable_candidate_refs
            ):
                usable_candidate_refs.append(copy.deepcopy(kr_ref))

    # Evaluate claims for NEG-04, NEG-06, NEG-07
    universe_member_refs = []
    for u in raw.get("universes") or []:
        if isinstance(u, dict) and isinstance(u.get("members"), list):
            for m in u["members"]:
                if isinstance(m, dict):
                    universe_member_refs.append(m)

    all_template_refs = []
    if isinstance(binding.get("template_ref"), dict):
        all_template_refs.append(binding["template_ref"])
    for t in raw.get("templates") or []:
        if isinstance(t, dict) and isinstance(t.get("ref"), dict):
            all_template_refs.append(t["ref"])
    all_template_refs.extend(universe_member_refs)

    all_requirement_refs = []
    if isinstance(binding.get("requirement_ref"), dict):
        all_requirement_refs.append(binding["requirement_ref"])
    for ar in raw.get("axis_requirements") or []:
        if isinstance(ar, dict) and isinstance(ar.get("requirement_ref"), dict):
            all_requirement_refs.append(ar["requirement_ref"])

    for claim in claims:
        ckind = claim.get("kind")
        c_ref = claim.get("ref") if isinstance(claim.get("ref"), dict) else {}
        c_subj = (
            claim.get("subject_ref")
            if isinstance(claim.get("subject_ref"), dict)
            else {}
        )
        c_basis = [
            copy.deepcopy(b)
            for b in (claim.get("basis_refs") or [])
            if isinstance(b, dict)
        ]

        if ckind == "template_selected":
            in_universe = any(
                _same_ref_ignoring_sha(c_subj, m) for m in universe_member_refs
            )
            if not universe_member_refs or not in_universe:
                findings.append(
                    {
                        "code": "no_match_arbitrary_selection",
                        "rule_ref": "HARNESS-L5-009-R-no_match_arbitrary_selection",
                        "subject_ref": copy.deepcopy(c_subj),
                        "binding": copy.deepcopy(binding),
                        "axis": "application",
                        "state": "unknown",
                        "source_refs": [copy.deepcopy(c_ref), *c_basis],
                        "reason": (
                            "Claim selects a template that is not present in the matching "
                            "candidate universe."
                        ),
                        "backflow_owner": "core_owner",
                    }
                )

        elif ckind == "application_authority":
            uses_unselected = any(
                _same_ref_ignoring_sha(c_subj, u) for u in unselected_unobserved_refs
            ) or any(
                _same_ref_ignoring_sha(b, u)
                for b in c_basis
                for u in unselected_unobserved_refs
            )
            if uses_unselected:
                findings.append(
                    {
                        "code": "reference_as_application_authority",
                        "rule_ref": "HARNESS-L5-009-R-reference_as_application_authority",
                        "subject_ref": copy.deepcopy(c_subj),
                        "binding": copy.deepcopy(binding),
                        "axis": "authority_claim",
                        "state": "conflict",
                        "source_refs": [copy.deepcopy(c_ref), *c_basis],
                        "reason": (
                            "Unselected reference-only knowledge cannot be converted into "
                            "application authority."
                        ),
                        "backflow_owner": "core_owner",
                    }
                )

        elif ckind == "requirements_agreement":
            has_template_basis = any(
                _same_ref_ignoring_sha(b, tr)
                for b in c_basis
                for tr in all_template_refs
            )
            has_requirement_basis = any(
                _same_ref_ignoring_sha(b, rr)
                for b in c_basis
                for rr in all_requirement_refs
            )
            if has_template_basis and not has_requirement_basis:
                findings.append(
                    {
                        "code": "template_as_requirement_agreement",
                        "rule_ref": "HARNESS-L5-009-R-template_as_requirement_agreement",
                        "subject_ref": copy.deepcopy(c_subj),
                        "binding": copy.deepcopy(binding),
                        "axis": "requirements_agreement_claim",
                        "state": "conflict",
                        "source_refs": [copy.deepcopy(c_ref), *c_basis],
                        "reason": (
                            "Template body alone cannot establish human requirement "
                            "agreement authority."
                        ),
                        "backflow_owner": "requirement_owner",
                    }
                )

    correspondence_issues = _evaluate_correspondence_records(
        raw,
        binding,
        unusable_refs,
        selected_knowledge_refs,
        unselected_unobserved_refs,
        usable_candidate_refs,
        original_axes,
    )

    material = {
        "selected_knowledge_refs": selected_knowledge_refs,
        "checked_field_refs": checked_field_refs,
        "usable_candidate_refs": usable_candidate_refs,
        "unselected_unobserved_refs": unselected_unobserved_refs,
    }
    if correspondence_issues:
        material["correspondence_issues"] = correspondence_issues

    return {
        "producer_symbol": "compare_selected_knowledge",
        "input_binding": binding,
        "original_axes": original_axes,
        "findings": findings,
        "material": material,
    }
