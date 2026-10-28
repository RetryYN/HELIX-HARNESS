"""FN4の型付きOracleBinding及びnonfill Claim dispatch（rule 70/71/72/74）の局所投影。"""

from __future__ import annotations

import copy
import json


_RULES = (
    (
        "measurement",
        "unrelated_measurement",
        "measurement.binding",
        "measurementの根拠が別の適用義務を指しており、当該subject/bindingの義務へ対応しない。",
    ),
    (
        "completion",
        "completion_oracle_revision",
        "completion.binding",
        "completionの対oracle版が当該義務の要求されたoracle binding版と異なる。",
    ),
)
_RULE70_CODE = "view_as_semantic_update"
_RULE70_REF = "HELIXBRAIN-L5-032-R-view_as_semantic_update"
_RULE70_AXIS = "meaning_update_claim"
_RULE70_PREDICATE = "変わった原根拠は表示だけでsemantic JSON/版/stateは同じ。意味更新claimは正本/view境界と相反。"

_RULE74_CODE = "threshold_fabricated"
_RULE74_REF = "HELIXBRAIN-L5-032-R-threshold_fabricated"
_RULE74_AXIS = "measurement.value"
_RULE74_PREDICATE = "measurementのowner値がunknownで、根拠のないgeneric default claimを与えている。原値unknownを保持。"

_CLAIM_MEMBERS = (
    "subject_ref",
    "binding",
    "actor",
    "kind",
    "proposed_value",
    "basis_refs",
)


def _stop(branch):
    raise NotImplementedError(
        f"F05/F06/unclosed/{branch}; owner=knowledge_owner; "
        "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
    )


def _unknown_reentry(branch, owner="knowledge_owner"):
    raise NotImplementedError(
        f"F05/F06/unknown_reentry/{branch}; owner={owner}; "
        "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
    )


def _observation(parent, member, locator):
    original = {"presence": "absent"}
    if member in parent:
        original = {"presence": "supplied", "value": copy.deepcopy(parent[member])}
    return {"locator": locator + "/" + member, "original_read": original}


def _usable_source_matches(validated, ref, *, required_role):
    from descriptor_definitions import _ref_same, _source_qualification_ok

    raw = validated["input"]
    matches = [
        (index, source)
        for index, source in enumerate(raw["sources"])
        if _ref_same(source.get("ref"), ref)
    ]
    if not matches or any(
        source.get("role") != required_role
        or not _source_qualification_ok(raw, source)
        or any(
            _ref_same(source["ref"], bad) for bad in validated["unusable_source_refs"]
        )
        for _, source in matches
    ):
        return None
    return matches


def _qualified_witnesses(validated, ref):
    matches = _usable_source_matches(validated, ref, required_role="semantic_json")
    if not matches:
        _stop("oracle_predicate_source")
    return matches


def _known_ref(ref):
    from descriptor_definitions import _ref_same

    return _ref_same(ref, ref)


def _revision_differs(left, right):
    return (
        _known_ref(left)
        and _known_ref(right)
        and all(left[key] == right[key] for key in ("identity", "scope", "owner"))
        and left["revision"] != right["revision"]
    )


def _oracle_tuples_compete(rows):
    """Known same-subject obligation/oracle tuples must not select one another."""
    for index, left in enumerate(rows):
        for right in rows[index + 1 :]:
            left_obligation = left.get("obligation_ref")
            right_obligation = right.get("obligation_ref")
            left_oracle = left.get("oracle_ref")
            right_oracle = right.get("oracle_ref")
            if (
                _known_ref(left_obligation)
                and _known_ref(right_obligation)
                and not _ref_equal(left_obligation, right_obligation)
            ):
                return True
            if (
                _known_ref(left_oracle)
                and _known_ref(right_oracle)
                and not _ref_equal(left_oracle, right_oracle)
            ):
                return True
    return False


def _ref_equal(left, right):
    from descriptor_definitions import _ref_same

    return _ref_same(left, right)


def _matching_descriptor_facts(
    raw, evaluation, subject_ref, binding, *, kind_filter=None
):
    from descriptor_definitions import _binding_same, _ref_same

    matches = []
    for slot_index, slot in enumerate(raw["descriptors"]):
        kind = slot.get("descriptor_kind")
        if kind_filter is not None and kind != kind_filter:
            continue
        for fact_index, fact in enumerate(slot.get("facts", [])):
            if not _ref_same(fact.get("ref"), subject_ref):
                continue
            locator = f"/descriptors/{slot_index}/facts/{fact_index}"
            if not any(
                locator in row["fact_locators"]
                and row["axis_name"] == f"{kind}.definition"
                for row in evaluation["assessments"]
            ):
                continue
            if not _binding_same(fact.get("binding"), binding) or not _known_ref(
                fact.get("ref")
            ):
                return None
            matches.append((slot_index, fact_index, locator, fact))
    return matches


def _project_rule70_claim(validated, evaluation, claim_index, claim, binding):
    from descriptor_definitions import _binding_same, _ref_same

    if (
        not isinstance(claim, dict)
        or set(claim) > set(_CLAIM_MEMBERS)
        or not _known_ref(claim.get("subject_ref"))
    ):
        _unknown_reentry("subject", "knowledge_owner")
    if not _binding_same(claim.get("binding"), binding):
        _unknown_reentry("binding", "knowledge_owner")
    proposed = claim.get("proposed_value")
    if (
        "proposed_value" not in claim
        or not isinstance(proposed, dict)
        or "semantic_json_change_ref" not in proposed
        or proposed["semantic_json_change_ref"] is not None
    ):
        _unknown_reentry("witness", "knowledge_owner")
    basis_refs = claim.get("basis_refs")
    if not isinstance(basis_refs, list) or not basis_refs:
        _unknown_reentry("witness", "knowledge_owner")
    raw = validated["input"]
    view_matches = []
    for basis_ref in basis_refs:
        if not _known_ref(basis_ref):
            _unknown_reentry("witness", "knowledge_owner")
        resolved = _usable_source_matches(
            validated, basis_ref, required_role="derived_view"
        )
        if not resolved:
            _unknown_reentry("witness", "knowledge_owner")
        for src_index, src in resolved:
            content = src.get("content")
            if not isinstance(content, dict) or not any(
                k != "binding" for k in content
            ):
                _unknown_reentry("witness", "knowledge_owner")
            if (src_index, src) not in view_matches:
                view_matches.append((src_index, src))

    fact_matches = _matching_descriptor_facts(
        raw, evaluation, claim["subject_ref"], binding
    )
    if not fact_matches or len(fact_matches) != 1:
        _unknown_reentry("subject", "knowledge_owner")
    _slot_index, _fact_index, fact_locator, fact = fact_matches[0]
    semantic_sources = _usable_source_matches(
        validated, fact.get("source_ref"), required_role="semantic_json"
    )
    if not semantic_sources:
        _unknown_reentry("witness", "knowledge_owner")
    for _, sem_src in semantic_sources:
        for _, view_src in view_matches:
            if sem_src["ref"].get("identity") == view_src["ref"].get(
                "identity"
            ) and sem_src["ref"].get("revision") == view_src["ref"].get("revision"):
                _unknown_reentry("witness", "knowledge_owner")

    witness_indices = {index for index, _ in semantic_sources + view_matches}
    source_refs = [
        copy.deepcopy(source["ref"])
        for index, source in enumerate(raw["sources"])
        if index in witness_indices
    ]
    claim_locator = f"/claims/{claim_index}"
    observations = (
        [_observation(claim, key, claim_locator) for key in _CLAIM_MEMBERS]
        + [
            _observation(fact, key, fact_locator)
            for key in ("ref", "source_ref", "binding")
        ]
        + [
            _observation(view_src, key, f"/sources/{view_index}")
            for view_index, view_src in view_matches
            for key in ("ref", "role")
        ]
    )
    diagnostic = {
        "code": _RULE70_CODE,
        "rule_ref": _RULE70_REF,
        "predicate_observations": observations,
    }
    reason = (
        _RULE70_PREDICATE
        + "\n"
        + json.dumps(
            diagnostic,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        )
    )
    original_refs = (
        [copy.deepcopy(claim["subject_ref"])]
        + [copy.deepcopy(ref) for ref in basis_refs if isinstance(ref, dict)]
        + [copy.deepcopy(fact["ref"]), copy.deepcopy(fact["source_ref"])]
        + [copy.deepcopy(view_src["ref"]) for _, view_src in view_matches]
    )
    axis_row = {
        "subject_ref": copy.deepcopy(claim["subject_ref"]),
        "binding": copy.deepcopy(claim["binding"]),
        "axis": _RULE70_AXIS,
        "state": "conflict",
        "original_refs": original_refs,
        "reason": reason,
        "backflow_owner": "knowledge_owner",
    }
    finding_row = {
        "code": _RULE70_CODE,
        "rule_ref": _RULE70_REF,
        "subject_ref": copy.deepcopy(claim["subject_ref"]),
        "binding": copy.deepcopy(claim["binding"]),
        "axis": _RULE70_AXIS,
        "state": "conflict",
        "source_refs": source_refs,
        "reason": reason,
        "backflow_owner": "knowledge_owner",
    }
    return axis_row, finding_row


def _project_rule74_claim(validated, evaluation, claim_index, claim, binding):
    from descriptor_definitions import _binding_same, _ref_same

    if (
        not isinstance(claim, dict)
        or set(claim) > set(_CLAIM_MEMBERS)
        or not _known_ref(claim.get("subject_ref"))
    ):
        _unknown_reentry("subject", "core_owner")
    if not _binding_same(claim.get("binding"), binding):
        _unknown_reentry("binding", "core_owner")
    proposed = claim.get("proposed_value")
    if (
        "proposed_value" not in claim
        or not isinstance(proposed, dict)
        or proposed.get("basis_origin") != "generic_default"
    ):
        _unknown_reentry("witness", "core_owner")
    basis_refs = claim.get("basis_refs")
    if not isinstance(basis_refs, list):
        _unknown_reentry("witness", "core_owner")
    raw = validated["input"]
    for basis_ref in basis_refs:
        if not _known_ref(basis_ref):
            _unknown_reentry("witness", "core_owner")
        if _usable_source_matches(validated, basis_ref, required_role="semantic_json"):
            _unknown_reentry("witness", "core_owner")

    fact_matches = _matching_descriptor_facts(
        raw, evaluation, claim["subject_ref"], binding, kind_filter="measurement"
    )
    if not fact_matches:
        _unknown_reentry("subject", "core_owner")

    values = raw["values"] if "values" in raw else []
    if not isinstance(values, list):
        _unknown_reentry("context", "core_owner")
    value_matches = [
        (val_index, vfact)
        for val_index, vfact in enumerate(values)
        if isinstance(vfact, dict)
        and _ref_same(vfact.get("subject_ref"), claim["subject_ref"])
    ]
    if len(value_matches) != 1:
        _unknown_reentry("subject", "core_owner")
    val_index, vfact = value_matches[0]
    if not _binding_same(vfact.get("binding"), binding) or not _known_ref(
        vfact.get("ref")
    ):
        _unknown_reentry("binding", "core_owner")
    if "value" not in vfact or vfact["value"] is not None:
        _unknown_reentry("witness", "core_owner")
    value_sources = _usable_source_matches(
        validated, vfact.get("source_ref"), required_role="semantic_json"
    )
    if not value_sources:
        _unknown_reentry("witness", "core_owner")

    witness_indices = {index for index, _ in value_sources}
    source_refs = [
        copy.deepcopy(source["ref"])
        for index, source in enumerate(raw["sources"])
        if index in witness_indices
    ]
    claim_locator = f"/claims/{claim_index}"
    val_locator = f"/values/{val_index}"
    observations = [
        _observation(claim, key, claim_locator) for key in _CLAIM_MEMBERS
    ] + [
        _observation(vfact, key, val_locator)
        for key in ("ref", "subject_ref", "binding", "value", "source_ref")
    ]
    diagnostic = {
        "code": _RULE74_CODE,
        "rule_ref": _RULE74_REF,
        "predicate_observations": observations,
    }
    reason = (
        _RULE74_PREDICATE
        + "\n"
        + json.dumps(
            diagnostic,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        )
    )
    original_refs = (
        [copy.deepcopy(claim["subject_ref"])]
        + [copy.deepcopy(ref) for ref in basis_refs if isinstance(ref, dict)]
        + [
            copy.deepcopy(vfact["ref"]),
            copy.deepcopy(vfact["subject_ref"]),
            copy.deepcopy(vfact["source_ref"]),
        ]
    )
    axis_row = {
        "subject_ref": copy.deepcopy(claim["subject_ref"]),
        "binding": copy.deepcopy(claim["binding"]),
        "axis": _RULE74_AXIS,
        "state": "unknown",
        "original_refs": original_refs,
        "reason": reason,
        "backflow_owner": "core_owner",
    }
    finding_row = {
        "code": _RULE74_CODE,
        "rule_ref": _RULE74_REF,
        "subject_ref": copy.deepcopy(claim["subject_ref"]),
        "binding": copy.deepcopy(claim["binding"]),
        "axis": _RULE74_AXIS,
        "state": "unknown",
        "source_refs": source_refs,
        "reason": reason,
        "backflow_owner": "core_owner",
    }
    return axis_row, finding_row


def compare_oracle_and_view_boundary_detail(context, frame):
    """同walk frameだけを消費し、既存definition行はcontextから全値保持する。

    L4 claim_dispatch と L5 fn4_nonfill_claim_detail に従い、fill_definitionの
    有限carry、meaning_revision_update (rule 70)、measurement_threshold (rule 74)、
    他producer担当18kind、及びOracleBindingのrule 71/72を規則順（70→71→72→74）で投影する。
    他の未形成predicateや非発火一般入力を成功emptyへ置き換えない。
    """
    from descriptor_definitions import _binding_same, _comparison, _ref_same
    from oracle_finite_carry import (
        _OTHER_PRODUCER_CLAIM_KINDS,
        _valid_other_producer_claim,
        is_zero_operand_carry,
    )
    from oracle_projection_writer import write_oracle_axes

    if (
        not isinstance(frame, dict)
        or set(frame)
        != {"validated", "definition_evaluation", "target_reads", "claim_uses"}
        or frame["validated"] is not context["validated"]
    ):
        _stop("oracle_frame")
    validated = frame["validated"]
    raw = validated["input"]
    if raw is None:
        return _comparison([], [], "compare_oracle_and_view_boundary", None)
    claims = raw["claims"] if "claims" in raw else []
    binding = raw["binding"]
    evaluation = frame["definition_evaluation"]
    if not isinstance(evaluation, dict) or set(evaluation) != {
        "comparison",
        "assessments",
    }:
        _stop("oracle_evaluation")
    original_axes = context["definitions"]["axes"]

    if is_zero_operand_carry(raw, frame["target_reads"]):
        return _comparison(
            write_oracle_axes(original_axes, []),
            [],
            "compare_oracle_and_view_boundary",
            binding,
        )

    if not isinstance(claims, list):
        _stop("oracle_claim_ports")
    if any(
        isinstance(claim, dict) and claim.get("kind") == "fill_definition"
        for claim in claims
    ):
        _stop("oracle_claim_ports")
    if frame["target_reads"] or frame["claim_uses"]:
        _stop("oracle_claim_ports")

    rule70_axes = []
    rule70_findings = []
    rule74_axes = []
    rule74_findings = []

    for claim_index, claim in enumerate(claims):
        if not isinstance(claim, dict) or not isinstance(claim.get("kind"), str):
            _unknown_reentry("claim_dispatch", "knowledge_owner")
        kind = claim["kind"]
        if kind == "meaning_revision_update":
            axis_row, finding_row = _project_rule70_claim(
                validated, evaluation, claim_index, claim, binding
            )
            rule70_axes.append(axis_row)
            rule70_findings.append(finding_row)
        elif kind == "measurement_threshold":
            axis_row, finding_row = _project_rule74_claim(
                validated, evaluation, claim_index, claim, binding
            )
            rule74_axes.append(axis_row)
            rule74_findings.append(finding_row)
        elif kind in _OTHER_PRODUCER_CLAIM_KINDS:
            if not _valid_other_producer_claim(claim, binding):
                _unknown_reentry("claim_dispatch", "knowledge_owner")
        else:
            _unknown_reentry("claim_dispatch", "knowledge_owner")

    rule71_72_axes = []
    rule71_72_findings = []
    oracle_bindings = raw["oracle_bindings"] if "oracle_bindings" in raw else []
    for kind, code, axis_name, predicate in _RULES:
        for slot_index, slot in enumerate(raw["descriptors"]):
            if slot["descriptor_kind"] != kind:
                continue
            for fact_index, fact in enumerate(slot["facts"]):
                locator = f"/descriptors/{slot_index}/facts/{fact_index}"
                if not any(
                    locator in row["fact_locators"]
                    and row["axis_name"] == kind + ".definition"
                    for row in evaluation["assessments"]
                ):
                    _stop("oracle_definition_origin")
                if not _binding_same(fact["binding"], binding) or not _known_ref(
                    fact["ref"]
                ):
                    _stop("oracle_subject_or_binding")
                obligation = fact["binding"].get("requirement_ref")
                subject_rows = [
                    (oracle_index, oracle)
                    for oracle_index, oracle in enumerate(oracle_bindings)
                    if _ref_same(oracle.get("subject_ref"), fact["ref"])
                ]
                if _oracle_tuples_compete([oracle for _, oracle in subject_rows]):
                    _stop("oracle_binding_competition")
                for oracle_index, oracle in subject_rows:
                    if not _known_ref(obligation) or not _known_ref(
                        oracle["obligation_ref"]
                    ):
                        _stop("oracle_obligation_correspondence")
                    same_obligation = _ref_same(obligation, oracle["obligation_ref"])
                    if not same_obligation and all(
                        obligation[key] == oracle["obligation_ref"][key]
                        for key in ("identity", "revision", "scope", "owner")
                    ):
                        _stop("oracle_obligation_digest")
                    if kind == "completion" and same_obligation:
                        if not _known_ref(fact.get("oracle_ref")) or not _known_ref(
                            oracle.get("oracle_ref")
                        ):
                            _stop("oracle_oracle_correspondence")
                    fires = (
                        not same_obligation
                        if kind == "measurement"
                        else (
                            same_obligation
                            and _revision_differs(
                                fact.get("oracle_ref"), oracle.get("oracle_ref")
                            )
                        )
                    )
                    if not fires:
                        continue
                    fact_sources = _qualified_witnesses(validated, fact["source_ref"])
                    oracle_sources = _qualified_witnesses(
                        validated, oracle["source_ref"]
                    )
                    witness_indices = {
                        index for index, _ in fact_sources + oracle_sources
                    }
                    source_refs = [
                        copy.deepcopy(source["ref"])
                        for index, source in enumerate(raw["sources"])
                        if index in witness_indices
                    ]
                    oracle_locator = f"/oracle_bindings/{oracle_index}"
                    fact_members = ("ref", "source_ref", "binding")
                    oracle_members = (
                        "ref",
                        "subject_ref",
                        "obligation_ref",
                        "source_ref",
                    )
                    if kind == "completion":
                        fact_members += ("oracle_ref",)
                        oracle_members += ("oracle_ref",)
                    observations = [
                        _observation(fact, key, locator) for key in fact_members
                    ] + [
                        _observation(oracle, key, oracle_locator)
                        for key in oracle_members
                    ]
                    rule_ref = "HELIXBRAIN-L5-032-R-" + code
                    diagnostic = {
                        "code": code,
                        "rule_ref": rule_ref,
                        "predicate_observations": observations,
                    }
                    reason = (
                        predicate
                        + "\n"
                        + json.dumps(
                            diagnostic,
                            ensure_ascii=False,
                            sort_keys=True,
                            separators=(",", ":"),
                        )
                    )
                    original_refs = [
                        copy.deepcopy(fact["ref"]),
                        copy.deepcopy(fact["source_ref"]),
                        copy.deepcopy(obligation),
                    ]
                    if kind == "completion":
                        original_refs.append(copy.deepcopy(fact["oracle_ref"]))
                    original_refs += [
                        copy.deepcopy(oracle[key]) for key in oracle_members
                    ]
                    original_refs = [
                        ref for ref in original_refs if isinstance(ref, dict)
                    ]
                    rule71_72_axes.append(
                        {
                            "subject_ref": copy.deepcopy(fact["ref"]),
                            "binding": copy.deepcopy(binding),
                            "axis": axis_name,
                            "state": "conflict",
                            "original_refs": original_refs,
                            "reason": reason,
                            "backflow_owner": "knowledge_owner",
                        }
                    )
                    rule71_72_findings.append(
                        {
                            "code": code,
                            "rule_ref": rule_ref,
                            "subject_ref": copy.deepcopy(fact["ref"]),
                            "binding": copy.deepcopy(binding),
                            "axis": axis_name,
                            "state": "conflict",
                            "source_refs": source_refs,
                            "reason": reason,
                            "backflow_owner": "knowledge_owner",
                        }
                    )

    predicate_axes = rule70_axes + rule71_72_axes + rule74_axes
    findings = rule70_findings + rule71_72_findings + rule74_findings
    if not findings:
        _stop("formed_context")
    axes = write_oracle_axes(original_axes, predicate_axes)
    return _comparison(axes, findings, "compare_oracle_and_view_boundary", binding)
