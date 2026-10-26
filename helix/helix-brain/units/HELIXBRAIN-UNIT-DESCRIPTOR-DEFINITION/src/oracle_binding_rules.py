"""FN4の型付きOracleBindingに対する既存rule 71/72の局所投影。"""
from __future__ import annotations

import copy
import json


_RULES = (
    ("measurement", "unrelated_measurement", "measurement.binding",
     "measurementの根拠が別の適用義務を指しており、当該subject/bindingの義務へ対応しない。"),
    ("completion", "completion_oracle_revision", "completion.binding",
     "completionの対oracle版が当該義務の要求されたoracle binding版と異なる。"),
)
_CARRY = {"measurement.definition", "completion.definition", "negative oracle.definition"}


def _stop(branch):
    raise NotImplementedError(
        f"F05/F06/unclosed/{branch}; owner=knowledge_owner; "
        "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
    )


def _observation(parent, member, locator):
    original = {"presence": "absent"}
    if member in parent:
        original = {"presence": "supplied", "value": copy.deepcopy(parent[member])}
    return {"locator": locator + "/" + member, "original_read": original}


def _qualified_witnesses(validated, ref):
    from descriptor_definitions import _ref_same, _source_qualification_ok

    raw = validated["input"]
    matches = [
        (index, source) for index, source in enumerate(raw["sources"])
        if _ref_same(source.get("ref"), ref)
    ]
    if not matches or any(
        source.get("role") != "semantic_json"
        or not _source_qualification_ok(raw, source)
        or any(_ref_same(source["ref"], bad) for bad in validated["unusable_source_refs"])
        for _, source in matches
    ):
        _stop("oracle_predicate_source")
    return matches


def _known_ref(ref):
    from descriptor_definitions import _ref_same

    return _ref_same(ref, ref)


def _revision_differs(left, right):
    return (
        _known_ref(left) and _known_ref(right)
        and all(left[key] == right[key] for key in ("identity", "scope", "owner"))
        and left["revision"] != right["revision"]
    )


def compare_oracle_and_view_boundary_detail(context, frame):
    """同walk frameだけを消費し、既存definition行はcontextから全値保持する。

    この局所実装はrule71/72の明示相違だけを投影する。他の未形成predicateや
    非発火一般入力を成功emptyへ置き換えない。Claim portの読取は行わない。
    """
    from descriptor_definitions import _binding_same, _comparison, _ref_same

    if (not isinstance(frame, dict)
            or set(frame) != {"validated", "definition_evaluation", "target_reads", "claim_uses"}
            or frame["validated"] is not context["validated"]):
        _stop("oracle_frame")
    validated = frame["validated"]
    raw = validated["input"]
    if raw is None:
        return _comparison([], [], "compare_oracle_and_view_boundary", None)
    claims = raw["claims"] if "claims" in raw else []
    if claims or frame["target_reads"] or frame["claim_uses"]:
        _stop("oracle_claim_ports")
    binding = raw["binding"]
    evaluation = frame["definition_evaluation"]
    if not isinstance(evaluation, dict) or set(evaluation) != {"comparison", "assessments"}:
        _stop("oracle_evaluation")
    original_axes = context["definitions"]["axes"]
    retained_indices = {index for index, row in enumerate(original_axes) if row["axis"] in _CARRY}
    new_axes = []
    findings = []
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
                if not _binding_same(fact["binding"], binding) or not _known_ref(fact["ref"]):
                    _stop("oracle_subject_or_binding")
                obligation = fact["binding"].get("requirement_ref")
                for oracle_index, oracle in enumerate(oracle_bindings):
                    if not _ref_same(oracle["subject_ref"], fact["ref"]):
                        continue
                    if not _known_ref(obligation) or not _known_ref(oracle["obligation_ref"]):
                        _stop("oracle_obligation_correspondence")
                    same_obligation = _ref_same(obligation, oracle["obligation_ref"])
                    if not same_obligation and all(
                        obligation[key] == oracle["obligation_ref"][key]
                        for key in ("identity", "revision", "scope", "owner")
                    ):
                        _stop("oracle_obligation_digest")
                    fires = not same_obligation if kind == "measurement" else (
                        same_obligation and _revision_differs(fact["oracle_ref"], oracle["oracle_ref"])
                    )
                    if not fires:
                        continue
                    fact_sources = _qualified_witnesses(validated, fact["source_ref"])
                    oracle_sources = _qualified_witnesses(validated, oracle["source_ref"])
                    witness_indices = {index for index, _ in fact_sources + oracle_sources}
                    source_refs = [
                        copy.deepcopy(source["ref"]) for index, source in enumerate(raw["sources"])
                        if index in witness_indices
                    ]
                    oracle_locator = f"/oracle_bindings/{oracle_index}"
                    fact_members = ("ref", "source_ref", "binding")
                    oracle_members = ("ref", "subject_ref", "obligation_ref", "source_ref")
                    if kind == "completion":
                        fact_members += ("oracle_ref",)
                        oracle_members += ("oracle_ref",)
                    observations = [
                        _observation(fact, key, locator)
                        for key in fact_members
                    ] + [
                        _observation(oracle, key, oracle_locator)
                        for key in oracle_members
                    ]
                    rule_ref = "HELIXBRAIN-L5-032-R-" + code
                    diagnostic = {"code": code, "rule_ref": rule_ref, "predicate_observations": observations}
                    reason = predicate + "\n" + json.dumps(diagnostic, ensure_ascii=False, sort_keys=True,
                                                          separators=(",", ":"))
                    original_refs = [copy.deepcopy(fact["ref"]), copy.deepcopy(fact["source_ref"]),
                                     copy.deepcopy(obligation)]
                    if kind == "completion":
                        original_refs.append(copy.deepcopy(fact["oracle_ref"]))
                    original_refs += [copy.deepcopy(oracle[key]) for key in oracle_members]
                    original_refs = [ref for ref in original_refs if isinstance(ref, dict)]
                    def same_row(row):
                        return (row["axis"] == axis_name
                                and _ref_same(row["subject_ref"], fact["ref"])
                                and _binding_same(row["binding"], binding))
                    existing_indices = {index for index, row in enumerate(original_axes) if same_row(row)}
                    retained_indices.update(existing_indices)
                    if not existing_indices and not any(same_row(row) for row in new_axes):
                        new_axes.append({"subject_ref": copy.deepcopy(fact["ref"]),
                                     "binding": copy.deepcopy(binding), "axis": axis_name,
                                     "state": "conflict", "original_refs": original_refs,
                                     "reason": reason, "backflow_owner": "knowledge_owner"})
                    findings.append({"code": code, "rule_ref": rule_ref,
                                     "subject_ref": copy.deepcopy(fact["ref"]),
                                     "binding": copy.deepcopy(binding), "axis": axis_name,
                                     "state": "conflict", "source_refs": source_refs,
                                     "reason": reason, "backflow_owner": "knowledge_owner"})
    if not findings:
        _stop("formed_context")
    axes = [copy.deepcopy(row) for index, row in enumerate(original_axes)
            if index in retained_indices] + new_axes
    return _comparison(axes, findings, "compare_oracle_and_view_boundary", binding)
