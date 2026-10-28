"""H009 L5#/functions/4: compare_kind_obligation_trace."""

import copy

from application_input_schema import _json_equal


def _same_ref_ignoring_sha(left, right):
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    return (
        left.get("identity") == right.get("identity")
        and left.get("revision") == right.get("revision")
        and _json_equal(left.get("scope"), right.get("scope"))
        and left.get("owner") == right.get("owner")
    )


def _same_identity_and_scope(left, right):
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    return left.get("identity") == right.get("identity") and _json_equal(
        left.get("scope"), right.get("scope")
    )


def _is_source_unusable(source_ref, unusable_refs):
    if not isinstance(source_ref, dict):
        return True
    for u_ref in unusable_refs:
        if _same_ref_ignoring_sha(source_ref, u_ref):
            return True
    return False


def _collect_source_refs(primary_refs, binding):
    refs = []
    for ref in primary_refs:
        if isinstance(ref, dict):
            refs.append(copy.deepcopy(ref))
    if not refs and isinstance(binding, dict):
        for key in ("application_contract_ref", "template_ref", "requirement_ref"):
            if isinstance(binding.get(key), dict):
                refs.append(copy.deepcopy(binding[key]))
    return refs


def compare_kind_obligation_trace(context):
    """Compare unit/connection/composite obligations and bidirectional trace edges."""
    if not isinstance(context, dict):
        return {
            "producer_symbol": "compare_kind_obligation_trace",
            "input_binding": {},
            "original_axes": [],
            "findings": [],
            "material": {
                "obligations": [],
                "required_trace_refs": [],
                "matched_edge_refs": [],
                "missing_trace_refs": [],
            },
        }

    validated = context.get("validated")
    if not isinstance(validated, dict):
        return {
            "producer_symbol": "compare_kind_obligation_trace",
            "input_binding": {},
            "original_axes": [],
            "findings": [],
            "material": {
                "obligations": [],
                "required_trace_refs": [],
                "matched_edge_refs": [],
                "missing_trace_refs": [],
            },
        }

    raw = validated.get("input")
    if not isinstance(raw, dict):
        return {
            "producer_symbol": "compare_kind_obligation_trace",
            "input_binding": {},
            "original_axes": [],
            "findings": [],
            "material": {
                "obligations": [],
                "required_trace_refs": [],
                "matched_edge_refs": [],
                "missing_trace_refs": [],
            },
        }

    binding = copy.deepcopy(raw.get("binding") or {})
    app_comp = context.get("compare_applicability")
    if (
        not isinstance(app_comp, dict)
        or app_comp.get("producer_symbol") != "compare_applicability"
        or not _json_equal(app_comp.get("input_binding"), binding)
    ):
        return {
            "producer_symbol": "compare_kind_obligation_trace",
            "input_binding": binding,
            "original_axes": [],
            "findings": [],
            "material": {
                "obligations": [],
                "required_trace_refs": [],
                "matched_edge_refs": [],
                "missing_trace_refs": [],
            },
        }

    unusable_refs = validated.get("unusable_source_refs") or []
    findings = []
    valid_obligations = []

    raw_obligations = raw.get("obligations")
    if isinstance(raw_obligations, list):
        for ob in raw_obligations:
            if not isinstance(ob, dict):
                continue
            kind = ob.get("kind")
            meaning = ob.get("meaning")
            members = (
                meaning.get("members")
                if isinstance(meaning, dict)
                else ob.get("members")
            )
            source_reason = (
                meaning.get("source_reason")
                if isinstance(meaning, dict) and "source_reason" in meaning
                else ob.get("source_reason")
            )

            is_empty_composite = kind == "composite" and (
                (isinstance(members, list) and len(members) == 0)
                or meaning in (None, {}, [], "")
            )
            if is_empty_composite:
                has_reason = isinstance(source_reason, str) and bool(
                    source_reason.strip()
                )
                if not has_reason:
                    findings.append(
                        {
                            "code": "composite_empty_without_reason",
                            "rule_ref": "HARNESS-L5-009-R-composite_empty_without_reason",
                            "subject_ref": copy.deepcopy(
                                ob.get("ref")
                                or ob.get("template_ref")
                                or binding.get("template_ref")
                            ),
                            "binding": copy.deepcopy(binding),
                            "axis": "composite.obligation",
                            "state": "unknown",
                            "source_refs": _collect_source_refs(
                                [ob.get("source_ref"), ob.get("ref")], binding
                            ),
                            "reason": "Composite obligation set is empty without an original source reason.",
                            "backflow_owner": "core_owner",
                        }
                    )
                continue

            if kind not in ("unit", "connection", "composite"):
                continue
            if _is_source_unusable(ob.get("source_ref"), unusable_refs):
                continue
            valid_obligations.append(copy.deepcopy(ob))

    present_kinds = {ob.get("kind") for ob in valid_obligations}

    raw_trace_reqs = raw.get("trace_requirements")
    raw_trace_edges = raw.get("trace_edges")
    trace_reqs = raw_trace_reqs if isinstance(raw_trace_reqs, list) else []
    trace_edges = raw_trace_edges if isinstance(raw_trace_edges, list) else []

    design_endpoint_refs = [
        req.get("to_ref")
        for req in trace_reqs
        if isinstance(req, dict)
        and not _is_source_unusable(req.get("source_ref"), unusable_refs)
        and req.get("direction") == "forward"
        and any(
            _same_ref_ignoring_sha(req.get("from_ref"), ob.get("ref"))
            for ob in valid_obligations
        )
        and isinstance(req.get("to_ref"), dict)
    ]

    raw_claims = raw.get("claims")
    if isinstance(raw_claims, list):
        for claim in raw_claims:
            if not isinstance(claim, dict):
                continue
            c_kind = claim.get("kind")
            pv = claim.get("proposed_value")
            c_basis = (
                pv.get("basis")
                if isinstance(pv, dict) and "basis" in pv
                else (pv if isinstance(pv, str) else claim.get("basis"))
            )
            c_sources = _collect_source_refs(
                [claim.get("ref"), *(claim.get("basis_refs") or [])],
                binding,
            )
            subject_ref = copy.deepcopy(
                claim.get("subject_ref") or binding.get("template_ref")
            )

            if (
                c_kind == "connection_complete"
                and c_basis == "unit-success"
                and "connection" not in present_kinds
            ):
                findings.append(
                    {
                        "code": "connection_by_unit_only",
                        "rule_ref": "HARNESS-L5-009-R-connection_by_unit_only",
                        "subject_ref": subject_ref,
                        "binding": copy.deepcopy(binding),
                        "axis": "connection.obligation",
                        "state": "missing",
                        "source_refs": c_sources,
                        "reason": "Connection edge obligation cannot be closed solely on the basis of unit success.",
                        "backflow_owner": "core_owner",
                    }
                )
            elif (
                c_kind == "composite_complete"
                and c_basis == "unit-edge-sum"
                and "composite" not in present_kinds
            ):
                findings.append(
                    {
                        "code": "composite_by_lower_sum",
                        "rule_ref": "HARNESS-L5-009-R-composite_by_lower_sum",
                        "subject_ref": subject_ref,
                        "binding": copy.deepcopy(binding),
                        "axis": "composite.obligation",
                        "state": "missing",
                        "source_refs": c_sources,
                        "reason": "Composite obligation cannot be closed solely by the sum of lower unit and edge obligations.",
                        "backflow_owner": "core_owner",
                    }
                )
            elif c_kind == "design_complete" and not (
                isinstance(claim.get("basis_refs"), list)
                and design_endpoint_refs
                and any(
                    _same_ref_ignoring_sha(b_ref, d_ref)
                    for b_ref in claim["basis_refs"]
                    for d_ref in design_endpoint_refs
                )
                and any(
                    _same_ref_ignoring_sha(b_ref, binding.get("oracle_ref"))
                    for b_ref in claim["basis_refs"]
                )
            ):
                findings.append(
                    {
                        "code": "extraction_as_design_complete",
                        "rule_ref": "HARNESS-L5-009-R-extraction_as_design_complete",
                        "subject_ref": subject_ref,
                        "binding": copy.deepcopy(binding),
                        "axis": "design_completion_claim",
                        "state": "unknown",
                        "source_refs": c_sources,
                        "reason": "041 extraction success does not establish concrete design or paired oracle completion.",
                        "backflow_owner": "design_owner",
                    }
                )

    required_trace_refs = []
    matched_edge_refs = []
    missing_trace_refs = []
    missing_reverse_reqs = []

    for req in trace_reqs:
        if not isinstance(req, dict) or not isinstance(req.get("ref"), dict):
            continue
        if _is_source_unusable(req.get("source_ref"), unusable_refs):
            continue
        req_ref = copy.deepcopy(req["ref"])
        required_trace_refs.append(req_ref)

        req_from = req.get("from_ref")
        req_to = req.get("to_ref")
        req_kind = req.get("kind")
        req_dir = req.get("direction")

        matched_edge = None
        for edge in trace_edges:
            if not isinstance(edge, dict) or not isinstance(edge.get("ref"), dict):
                continue
            if _is_source_unusable(edge.get("source_ref"), unusable_refs):
                continue
            if (
                edge.get("kind") == req_kind
                and edge.get("direction") == req_dir
                and _json_equal(edge.get("binding"), binding)
                and _same_ref_ignoring_sha(edge.get("from_ref"), req_from)
                and _same_ref_ignoring_sha(edge.get("to_ref"), req_to)
            ):
                matched_edge = edge
                break

        if matched_edge is not None:
            matched_edge_refs.append(copy.deepcopy(matched_edge["ref"]))
            continue

        missing_trace_refs.append(copy.deepcopy(req_ref))

        mismatched_edge = None
        for edge in trace_edges:
            if not isinstance(edge, dict):
                continue
            if (
                edge.get("kind") == req_kind
                and edge.get("direction") == req_dir
                and _same_ref_ignoring_sha(edge.get("from_ref"), req_from)
                and _same_identity_and_scope(edge.get("to_ref"), req_to)
                and isinstance(edge.get("to_ref"), dict)
                and isinstance(req_to, dict)
                and edge["to_ref"].get("revision") != req_to.get("revision")
            ):
                mismatched_edge = edge
                break

        if mismatched_edge is not None and isinstance(req_to, dict):
            sup_to = mismatched_edge["to_ref"]
            exp_rev = req_to.get("revision")
            sup_rev = sup_to.get("revision")
            edge_sources = _collect_source_refs(
                [
                    req.get("source_ref"),
                    mismatched_edge.get("source_ref"),
                    mismatched_edge.get("ref"),
                ],
                binding,
            )
            is_obligation_to_design = req_dir == "forward" and any(
                _same_ref_ignoring_sha(req_from, ob.get("ref"))
                for ob in valid_obligations
            )

            if is_obligation_to_design:
                findings.append(
                    {
                        "code": "design_revision_mismatch",
                        "rule_ref": "HARNESS-L5-009-R-design_revision_mismatch",
                        "subject_ref": copy.deepcopy(req_to),
                        "binding": copy.deepcopy(binding),
                        "axis": "design.binding",
                        "state": "conflict",
                        "source_refs": edge_sources,
                        "reason": (
                            f"Design endpoint revision mismatch: expected {exp_rev}, "
                            f"supplied {sup_rev}."
                        ),
                        "backflow_owner": "design_owner",
                    }
                )
            elif _same_identity_and_scope(req_to, binding.get("oracle_ref")):
                findings.append(
                    {
                        "code": "pair_revision_mismatch",
                        "rule_ref": "HARNESS-L5-009-R-pair_revision_mismatch",
                        "subject_ref": copy.deepcopy(req_to),
                        "binding": copy.deepcopy(binding),
                        "axis": "pair.binding",
                        "state": "conflict",
                        "source_refs": edge_sources,
                        "reason": (
                            f"Pair oracle endpoint revision mismatch: expected {exp_rev}, "
                            f"supplied {sup_rev}."
                        ),
                        "backflow_owner": "oracle_owner",
                    }
                )
        elif req_dir == "reverse":
            missing_reverse_reqs.append(req)

    if missing_reverse_reqs:
        rev_sources = []
        for req in missing_reverse_reqs:
            for r in (req.get("ref"), req.get("source_ref")):
                if isinstance(r, dict):
                    rev_sources.append(copy.deepcopy(r))
        findings.append(
            {
                "code": "one_way_trace",
                "rule_ref": "HARNESS-L5-009-R-one_way_trace",
                "subject_ref": copy.deepcopy(
                    missing_reverse_reqs[0].get("ref") or binding.get("template_ref")
                ),
                "binding": copy.deepcopy(binding),
                "axis": "trace",
                "state": "missing",
                "source_refs": _collect_source_refs(rev_sources, binding),
                "reason": "Required reverse trace edges are missing; one-way forward edges do not complete bidirectional trace.",
                "backflow_owner": "trace_owner",
            }
        )

    return {
        "producer_symbol": "compare_kind_obligation_trace",
        "input_binding": binding,
        "original_axes": [],
        "findings": findings,
        "material": {
            "obligations": valid_obligations,
            "required_trace_refs": required_trace_refs,
            "matched_edge_refs": matched_edge_refs,
            "missing_trace_refs": missing_trace_refs,
        },
    }
