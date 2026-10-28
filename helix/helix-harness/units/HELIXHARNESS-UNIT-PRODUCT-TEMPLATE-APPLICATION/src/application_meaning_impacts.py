"""Meaning impacts comparison (HARNESS-L5-009-compare_meaning_impacts / FN7)."""

import copy
import json

_FOUR_SEMANTIC_FACETS = (
    "applicability",
    "required_field",
    "negative_oracle",
    "completion",
)


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


def _find_consumer(consumers, ref):
    for c in consumers:
        if isinstance(c, dict) and _same_ref_ignoring_sha(c.get("ref"), ref):
            return c
    return None


def _find_delta(deltas, ref):
    for d in deltas:
        if isinstance(d, dict) and _same_ref_ignoring_sha(d.get("ref"), ref):
            return d
    return None


def _find_comparison(comparisons, ref):
    for sc in comparisons:
        if isinstance(sc, dict) and _same_ref_ignoring_sha(sc.get("ref"), ref):
            return sc
    return None


def _is_qualified_evidence_for_consumer(ev, consumer, binding, deltas, unusable_refs):
    if not isinstance(ev, dict) or not isinstance(consumer, dict):
        return False
    if not _is_valid_ref(ev.get("ref")) or _is_unusable(ev.get("ref"), unusable_refs):
        return False
    ev_src = ev.get("source_ref")
    if _is_valid_ref(ev_src) and _is_unusable(ev_src, unusable_refs):
        return False
    if not _same_ref_ignoring_sha(ev.get("consumer_ref"), consumer.get("ref")):
        return False
    ev_binding = ev.get("binding")
    c_binding = consumer.get("binding")
    if not isinstance(ev_binding, dict) or not isinstance(c_binding, dict):
        return False
    if not _json_equal(ev_binding.get("product_scope"), c_binding.get("product_scope")):
        return False
    if not _json_equal(ev_binding, binding) or not _json_equal(ev_binding, c_binding):
        return False
    delta = _find_delta(deltas, ev.get("delta_ref"))
    if delta is None:
        return False
    used_tmpl = consumer.get("used_template_ref")
    if _is_valid_ref(used_tmpl):
        old_t = delta.get("old_template_ref")
        new_t = delta.get("new_template_ref")
        if not (
            _same_ref_ignoring_sha(used_tmpl, old_t)
            or _same_ref_ignoring_sha(used_tmpl, new_t)
        ):
            return False
    return True


def _consumer_is_still_on_old_template(consumer, deltas):
    if not isinstance(consumer, dict):
        return False
    used = consumer.get("used_template_ref")
    if not _is_valid_ref(used):
        return False
    for d in deltas:
        if not isinstance(d, dict):
            continue
        old_t = d.get("old_template_ref")
        new_t = d.get("new_template_ref")
        if _same_ref_ignoring_sha(used, old_t) and not _same_ref_ignoring_sha(
            used, new_t
        ):
            return True
    return False


def _has_full_migration_evidence(consumer, basis_refs, qualified_evs, deltas):
    if not isinstance(consumer, dict):
        return False
    if _consumer_is_still_on_old_template(consumer, deltas):
        return False
    covered_facets = set()
    for b_ref in basis_refs:
        for ev in qualified_evs:
            if _same_ref_ignoring_sha(ev.get("ref"), b_ref) and isinstance(
                ev.get("affected"), bool
            ):
                d = _find_delta(deltas, ev.get("delta_ref"))
                if d is not None and d.get("facet") in _FOUR_SEMANTIC_FACETS:
                    covered_facets.add(d.get("facet"))
    return all(f in covered_facets for f in _FOUR_SEMANTIC_FACETS)


def _is_view_only_delta(delta, comparisons):
    if not isinstance(delta, dict):
        return False
    if delta.get("facet") == "view_only":
        return True
    comp = _find_comparison(comparisons, delta.get("comparison_ref"))
    if comp is not None and comp.get("same_meaning") is True:
        return True
    return False


def _make_finding(code, subject_ref, binding, axis, state, reason, owner, source_refs):
    refs = [copy.deepcopy(r) for r in source_refs if _is_valid_ref(r)]
    if not refs and _is_valid_ref(subject_ref):
        refs = [copy.deepcopy(subject_ref)]
    return {
        "code": code,
        "rule_ref": f"HARNESS-L5-009-R-{code}",
        "subject_ref": copy.deepcopy(subject_ref),
        "binding": copy.deepcopy(binding),
        "axis": axis,
        "state": state,
        "reason": reason,
        "backflow_owner": owner,
        "source_refs": refs,
    }


def _evaluate_claim_rules(
    claims,
    consumers,
    deltas,
    impact_evidence,
    comparisons,
    binding,
    unusable_refs,
    unaffected_consumer_refs,
):
    findings = []
    for claim in claims:
        if not isinstance(claim, dict):
            continue
        kind = claim.get("kind")
        subj_ref = claim.get("subject_ref")
        basis_refs = [r for r in (claim.get("basis_refs") or []) if _is_valid_ref(r)]
        claim_ref = claim.get("ref")
        base_src_refs = (
            ([claim_ref] if _is_valid_ref(claim_ref) else [])
            + basis_refs
            + ([subj_ref] if _is_valid_ref(subj_ref) else [])
        )

        if kind == "meaning_migrated":
            consumer = _find_consumer(consumers, subj_ref) or (
                consumers[0] if consumers else None
            )
            q_evs = [
                ev
                for ev in impact_evidence
                if _is_qualified_evidence_for_consumer(
                    ev, consumer, binding, deltas, unusable_refs
                )
            ]
            if not _has_full_migration_evidence(consumer, basis_refs, q_evs, deltas):
                has_locator = any(
                    isinstance(r.get("source_locator"), str)
                    and bool(r["source_locator"].strip())
                    for r in basis_refs
                )
                code = (
                    "filename_as_migration_complete"
                    if has_locator
                    else "digest_as_migration_complete"
                )
                reason = (
                    "Filename change alone does not complete semantic migration while consumer remains on old template."
                    if code == "filename_as_migration_complete"
                    else "File digest update alone does not complete semantic migration while consumer remains on old template."
                )
                findings.append(
                    _make_finding(
                        code,
                        subj_ref,
                        binding,
                        "migration_claim",
                        "unknown",
                        reason,
                        "core_owner",
                        base_src_refs,
                    )
                )

        elif kind == "meaning_changed":
            target_deltas = []
            for r in [subj_ref, *basis_refs]:
                d = _find_delta(deltas, r)
                if d is not None:
                    target_deltas.append(d)
            has_real_semantic_change = any(
                d.get("facet") in _FOUR_SEMANTIC_FACETS
                and not _is_view_only_delta(d, comparisons)
                for d in target_deltas
            )
            if target_deltas and not has_real_semantic_change:
                findings.append(
                    _make_finding(
                        "view_as_meaning_migration",
                        subj_ref,
                        binding,
                        "meaning_change_claim",
                        "conflict",
                        "View-only rendering change with unchanged semantic content cannot declare meaning change or migration.",
                        "core_owner",
                        base_src_refs,
                    )
                )

        elif kind == "consumer_unaffected":
            is_proven_unaffected = any(
                _same_ref_ignoring_sha(subj_ref, u_ref)
                for u_ref in unaffected_consumer_refs
            )
            if not is_proven_unaffected:
                findings.append(
                    _make_finding(
                        "unknown_as_unaffected",
                        subj_ref,
                        binding,
                        "impact",
                        "unknown",
                        "Consumer without same-scope qualified unaffected evidence must remain Unknown, not Unaffected.",
                        "core_owner",
                        base_src_refs,
                    )
                )

        elif kind == "delete_old_consumer_ref":
            consumer = _find_consumer(consumers, subj_ref) or (
                consumers[0] if consumers else None
            )
            if _consumer_is_still_on_old_template(consumer, deltas):
                findings.append(
                    _make_finding(
                        "old_revision_lost",
                        subj_ref,
                        binding,
                        "consumer.trace",
                        "missing",
                        "Unmigrated consumer original old template identity/revision/scope must be preserved.",
                        "core_owner",
                        base_src_refs,
                    )
                )

        elif kind == "impact_coverage":
            consumer = _find_consumer(consumers, subj_ref) or (
                consumers[0] if consumers else None
            )
            used_tmpl = (
                consumer.get("used_template_ref")
                if isinstance(consumer, dict)
                else None
            )
            completion_deltas = [
                d
                for d in deltas
                if isinstance(d, dict)
                and "completion" in _FOUR_SEMANTIC_FACETS
                and d.get("facet") == "completion"
                and (
                    not _is_valid_ref(used_tmpl)
                    or _same_ref_ignoring_sha(d.get("old_template_ref"), used_tmpl)
                )
            ]
            omitted_completion = [
                d
                for d in completion_deltas
                if not any(
                    _same_ref_ignoring_sha(d.get("ref"), b_ref) for b_ref in basis_refs
                )
            ]
            if omitted_completion:
                findings.append(
                    _make_finding(
                        "completion_delta_omitted",
                        subj_ref,
                        binding,
                        "impact.coverage",
                        "missing",
                        "Completion meaning delta affecting consumer must not be omitted from impact coverage.",
                        "core_owner",
                        base_src_refs
                        + [d.get("ref") for d in omitted_completion if "ref" in d],
                    )
                )

        elif kind == "invalidate_all_scopes":
            subj_consumer = _find_consumer(consumers, subj_ref)
            subj_scope = (
                subj_consumer.get("binding", {}).get("product_scope")
                if isinstance(subj_consumer, dict)
                and isinstance(subj_consumer.get("binding"), dict)
                else (subj_ref.get("scope") if isinstance(subj_ref, dict) else None)
            )
            has_foreign_target = not _json_equal(
                subj_scope, binding.get("product_scope")
            ) or any(
                isinstance(c, dict)
                and isinstance(c.get("binding"), dict)
                and not _json_equal(
                    c["binding"].get("product_scope"), binding.get("product_scope")
                )
                for c in consumers
            )
            if has_foreign_target:
                findings.append(
                    _make_finding(
                        "all_scope_invalidated",
                        subj_ref,
                        binding,
                        "impact.scope",
                        "conflict",
                        "Meaning delta localized to target product_scope cannot invalidate unrelated valid scopes.",
                        "core_owner",
                        base_src_refs,
                    )
                )

        elif kind == "os_used_revision_updated":
            findings.append(
                _make_finding(
                    "core_updates_used_revision",
                    subj_ref,
                    binding,
                    "used_revision_claim",
                    "conflict",
                    "CORE impact candidate does not update OS actual used template revision or registration state.",
                    "os_owner",
                    base_src_refs,
                )
            )

        elif kind == "os_obligation_discharged":
            findings.append(
                _make_finding(
                    "core_closes_unfinished_obligation",
                    subj_ref,
                    binding,
                    "obligation_discharge_claim",
                    "conflict",
                    "CORE impact analysis cannot close or discharge unfinished OS obligations.",
                    "os_owner",
                    base_src_refs,
                )
            )

        elif kind == "os_event_state_stale_updated":
            findings.append(
                _make_finding(
                    "core_updates_event_stale",
                    subj_ref,
                    binding,
                    "record_update_claim",
                    "conflict",
                    "CORE impact analysis cannot directly update OS event, state, or stale records.",
                    "os_owner",
                    base_src_refs,
                )
            )

    return findings


def compare_meaning_impacts(context):
    if not isinstance(context, dict) or not isinstance(context.get("validated"), dict):
        raise ValueError("CompareMeaningImpactsContext requires validated input.")

    validated = context["validated"]
    inp = validated.get("input") or {}
    binding = copy.deepcopy(inp.get("binding") or {})
    unusable_refs = validated.get("unusable_source_refs") or []

    operations = inp.get("operations") or {}
    operation_selected = bool(operations.get("impact_requested", False))
    original_consumers = copy.deepcopy(inp.get("consumers") or [])

    req_axes = context.get("compare_required_axes")
    if (
        not isinstance(req_axes, dict)
        or req_axes.get("producer_symbol") != "compare_required_axes"
        or not _json_equal(req_axes.get("input_binding"), binding)
    ):
        return {
            "producer_symbol": "compare_meaning_impacts",
            "input_binding": binding,
            "original_axes": [],
            "findings": [],
            "material": {
                "operation_selected": operation_selected,
                "delta_refs": [],
                "impact_evidence_refs": [],
                "affected_consumer_refs": [],
                "unaffected_consumer_refs": [],
                "unknown_consumer_refs": [],
                "original_consumers": original_consumers,
            },
        }

    deltas = [d for d in (inp.get("meaning_deltas") or []) if isinstance(d, dict)]
    impact_evidence = [
        ev for ev in (inp.get("impact_evidence") or []) if isinstance(ev, dict)
    ]
    consumers = [c for c in (inp.get("consumers") or []) if isinstance(c, dict)]
    comparisons = [
        sc for sc in (inp.get("semantic_comparisons") or []) if isinstance(sc, dict)
    ]
    claims = [cl for cl in (inp.get("claims") or []) if isinstance(cl, dict)]

    if not operation_selected:
        return {
            "producer_symbol": "compare_meaning_impacts",
            "input_binding": binding,
            "original_axes": [],
            "findings": [],
            "material": {
                "operation_selected": False,
                "delta_refs": [],
                "impact_evidence_refs": [],
                "affected_consumer_refs": [],
                "unaffected_consumer_refs": [],
                "unknown_consumer_refs": [],
                "original_consumers": original_consumers,
            },
        }

    delta_refs = [
        copy.deepcopy(d["ref"])
        for d in deltas
        if _is_valid_ref(d.get("ref")) and not _is_unusable(d.get("ref"), unusable_refs)
    ]

    impact_evidence_refs = []
    findings = []

    for ev in impact_evidence:
        ev_ref = ev.get("ref")
        if not _is_valid_ref(ev_ref) or _is_unusable(ev_ref, unusable_refs):
            continue
        target_consumer = _find_consumer(consumers, ev.get("consumer_ref"))
        if target_consumer is not None:
            c_scope = (target_consumer.get("binding") or {}).get("product_scope")
            ev_scope = (ev.get("binding") or {}).get("product_scope")
            if (
                _json_equal(c_scope, binding.get("product_scope"))
                and not _json_equal(ev_scope, binding.get("product_scope"))
                and ev.get("affected") is False
            ):
                src_refs = [ev_ref]
                if _is_valid_ref(ev.get("source_ref")):
                    src_refs.append(ev["source_ref"])
                if _is_valid_ref(target_consumer.get("ref")):
                    src_refs.append(target_consumer["ref"])
                findings.append(
                    _make_finding(
                        "foreign_scope_unaffected_proof",
                        target_consumer.get("ref"),
                        binding,
                        "impact.binding",
                        "conflict",
                        "Foreign product_scope impact evidence cannot prove same-scope consumer is unaffected.",
                        "core_owner",
                        src_refs,
                    )
                )
                continue
        if target_consumer is not None and _is_qualified_evidence_for_consumer(
            ev, target_consumer, binding, deltas, unusable_refs
        ):
            impact_evidence_refs.append(copy.deepcopy(ev_ref))

    affected_consumer_refs = []
    unaffected_consumer_refs = []
    unknown_consumer_refs = []

    for consumer in consumers:
        c_ref = consumer.get("ref")
        if not _is_valid_ref(c_ref):
            continue
        c_scope = (consumer.get("binding") or {}).get("product_scope")
        if not _json_equal(c_scope, binding.get("product_scope")):
            continue
        if not deltas:
            continue
        q_evs = [
            ev
            for ev in impact_evidence
            if _is_qualified_evidence_for_consumer(
                ev, consumer, binding, deltas, unusable_refs
            )
        ]
        if any(ev.get("affected") is True for ev in q_evs):
            affected_consumer_refs.append(copy.deepcopy(c_ref))
        elif q_evs and all(ev.get("affected") is False for ev in q_evs):
            unaffected_consumer_refs.append(copy.deepcopy(c_ref))
        else:
            unknown_consumer_refs.append(copy.deepcopy(c_ref))

    findings.extend(
        _evaluate_claim_rules(
            claims,
            consumers,
            deltas,
            impact_evidence,
            comparisons,
            binding,
            unusable_refs,
            unaffected_consumer_refs,
        )
    )

    return {
        "producer_symbol": "compare_meaning_impacts",
        "input_binding": binding,
        "original_axes": [],
        "findings": findings,
        "material": {
            "operation_selected": True,
            "delta_refs": delta_refs,
            "impact_evidence_refs": impact_evidence_refs,
            "affected_consumer_refs": affected_consumer_refs,
            "unaffected_consumer_refs": unaffected_consumer_refs,
            "unknown_consumer_refs": unknown_consumer_refs,
            "original_consumers": original_consumers,
        },
    }
