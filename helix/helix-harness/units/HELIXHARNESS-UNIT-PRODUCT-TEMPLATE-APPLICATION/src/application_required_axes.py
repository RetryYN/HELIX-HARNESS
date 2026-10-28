"""Required axes comparison (HARNESS-L5-009-compare_required_axes / FN1)."""

import copy

_AXIS_INDEX_AND_OWNER = {
    "requirement identity": (1, "requirement_or_contract_owner"),
    "requirement revision": (2, "requirement_or_contract_owner"),
    "kind": (3, "requirement_or_contract_owner"),
    "subject": (4, "requirement_or_contract_owner"),
    "relation": (5, "requirement_or_contract_owner"),
    "composition": (6, "requirement_or_contract_owner"),
    "risk": (7, "requirement_or_contract_owner"),
    "domain": (8, "requirement_or_contract_owner"),
    "layer": (9, "requirement_or_contract_owner"),
    "pair": (10, "requirement_or_contract_owner"),
    "product scope": (11, "requirement_or_contract_owner"),
    "process contract revision": (12, "requirement_or_contract_owner"),
    "application contract revision": (13, "requirement_or_contract_owner"),
    "template identity": (14, "brain_or_core_owner"),
    "template version": (15, "brain_or_core_owner"),
    "semantic contract revision": (16, "brain_or_core_owner"),
    "template source": (17, "brain_or_core_owner"),
    "knowledge usability": (18, "brain_or_core_owner"),
    "selection basis": (19, "brain_or_core_owner"),
}


def _selected_and_nonselected_operations(operations):
    selected = {"always"}
    nonselected = []
    if operations.get("forward_requested", False):
        selected.add("forward")
    else:
        nonselected.append("forward")
    if operations.get("backflow_requested", False):
        selected.add("backflow")
    else:
        nonselected.append("backflow")
    if operations.get("impact_requested", False):
        selected.add("impact")
    else:
        nonselected.append("impact")
    if operations.get("selected_knowledge_refs"):
        selected.add("selected_knowledge")
    return selected, nonselected


def _has_semantic_conflict(matching_facts, semantic_comparisons):
    if len(matching_facts) < 2:
        return False
    first_val = matching_facts[0].get("value")
    if any(fact.get("value") != first_val for fact in matching_facts[1:]):
        return True
    fact_refs = [fact.get("ref") for fact in matching_facts]
    for sc in semantic_comparisons:
        if sc.get("same_meaning") is False:
            left = sc.get("left_ref")
            right = sc.get("right_ref")
            if left in fact_refs and right in fact_refs:
                return True
    return False


def _evaluate_axis_requirement(ar, binding, axis_facts, semantic_comparisons):
    axis_name = ar["axis"]
    idx, owner = _AXIS_INDEX_AND_OWNER.get(
        axis_name, (0, "requirement_or_contract_owner")
    )
    matching_facts = [
        af
        for af in axis_facts
        if af.get("axis") == axis_name and af.get("binding") == binding
    ]
    if not matching_facts:
        code = f"axis_{idx:02d}_missing"
        rule_ref = f"HARNESS-L5-009-R-{code}"
        refs = [copy.deepcopy(ar["ref"]), copy.deepcopy(ar["source_ref"])]
        reason = f"Required axis {axis_name} is missing for selected operation."
        axis_row = {
            "subject_ref": copy.deepcopy(ar["subject_ref"]),
            "binding": copy.deepcopy(binding),
            "axis": axis_name,
            "state": "missing",
            "original_refs": refs,
            "reason": reason,
            "backflow_owner": owner,
        }
        finding = {
            "code": code,
            "rule_ref": rule_ref,
            "subject_ref": copy.deepcopy(ar["subject_ref"]),
            "binding": copy.deepcopy(binding),
            "axis": axis_name,
            "state": "missing",
            "reason": reason,
            "backflow_owner": owner,
            "source_refs": copy.deepcopy(refs),
        }
        return axis_row, finding

    if _has_semantic_conflict(matching_facts, semantic_comparisons):
        code = f"axis_{idx:02d}_conflict"
        rule_ref = f"HARNESS-L5-009-R-{code}"
        refs = []
        for fact in matching_facts:
            refs.append(copy.deepcopy(fact["ref"]))
            refs.append(copy.deepcopy(fact["source_ref"]))
        reason = f"Conflicting qualified facts supplied for required axis {axis_name}."
        axis_row = {
            "subject_ref": copy.deepcopy(ar["subject_ref"]),
            "binding": copy.deepcopy(binding),
            "axis": axis_name,
            "state": "conflict",
            "original_refs": refs,
            "reason": reason,
            "backflow_owner": owner,
        }
        finding = {
            "code": code,
            "rule_ref": rule_ref,
            "subject_ref": copy.deepcopy(ar["subject_ref"]),
            "binding": copy.deepcopy(binding),
            "axis": axis_name,
            "state": "conflict",
            "reason": reason,
            "backflow_owner": owner,
            "source_refs": copy.deepcopy(refs),
        }
        return axis_row, finding

    af = matching_facts[0]
    axis_row = {
        "subject_ref": copy.deepcopy(ar["subject_ref"]),
        "binding": copy.deepcopy(af["binding"]),
        "axis": axis_name,
        "state": "known",
        "original_refs": [copy.deepcopy(af["ref"]), copy.deepcopy(af["source_ref"])],
        "reason": af["reason"],
        "backflow_owner": None,
    }
    return axis_row, None


def _check_knowledge_and_precondition_rules(inp, binding, operations):
    extra_findings = []
    expected_k_ref = binding.get("knowledge_ref", {})
    for kr in inp.get("knowledge_records", []):
        kr_b_ref = kr.get("binding", {}).get("knowledge_ref", {})
        if kr_b_ref.get("identity") == expected_k_ref.get("identity") and kr_b_ref.get(
            "revision"
        ) != expected_k_ref.get("revision"):
            code = "knowledge_wrong_revision"
            extra_findings.append(
                {
                    "code": code,
                    "rule_ref": f"HARNESS-L5-009-R-{code}",
                    "subject_ref": copy.deepcopy(kr["ref"]),
                    "binding": copy.deepcopy(binding),
                    "axis": "knowledge.binding",
                    "state": "conflict",
                    "reason": "Selected knowledge record binding revision mismatches input binding.",
                    "backflow_owner": "brain_owner",
                    "source_refs": [
                        copy.deepcopy(kr["ref"]),
                        copy.deepcopy(kr["source_ref"]),
                    ],
                }
            )

    for claim in inp.get("claims", []):
        if claim.get("kind") != "require_before_local_supply":
            continue
        prop = claim.get("proposed_value")
        code = None
        if prop == "backflow-only-input" and not operations.get(
            "backflow_requested", False
        ):
            code = "unused_backflow_required"
        elif prop == "old-new-consumer-input" and not operations.get(
            "impact_requested", False
        ):
            code = "unused_impact_required"
        elif prop == "unselected-knowledge":
            code = "unselected_knowledge_required"
        if code is not None:
            extra_findings.append(
                {
                    "code": code,
                    "rule_ref": f"HARNESS-L5-009-R-{code}",
                    "subject_ref": copy.deepcopy(claim["subject_ref"]),
                    "binding": copy.deepcopy(binding),
                    "axis": "precondition_claim",
                    "state": "conflict",
                    "reason": f"Non-selected input {prop} cannot gate selected operation.",
                    "backflow_owner": "core_owner",
                    "source_refs": [
                        copy.deepcopy(claim["ref"]),
                        *copy.deepcopy(claim.get("basis_refs", [])),
                    ],
                }
            )
    return extra_findings


def compare_required_axes(context):
    validated = context["validated"]
    inp = validated["input"]
    binding = copy.deepcopy(inp["binding"])
    operations = inp["operations"]
    selected_ops, nonselected_ops = _selected_and_nonselected_operations(operations)

    axis_requirements = inp["axis_requirements"]
    axis_facts = inp["axis_facts"]
    semantic_comparisons = inp.get("semantic_comparisons", [])

    selected_reqs = [
        ar for ar in axis_requirements if ar.get("operation") in selected_ops
    ]
    original_axes = []
    findings = []
    required_axis_refs = []

    for ar in selected_reqs:
        required_axis_refs.append(copy.deepcopy(ar["ref"]))
        axis_row, finding = _evaluate_axis_requirement(
            ar, binding, axis_facts, semantic_comparisons
        )
        original_axes.append(axis_row)
        if finding is not None:
            findings.append(finding)

    findings.extend(_check_knowledge_and_precondition_rules(inp, binding, operations))

    return {
        "producer_symbol": "compare_required_axes",
        "input_binding": binding,
        "original_axes": original_axes,
        "findings": findings,
        "material": {
            "required_axis_refs": required_axis_refs,
            "facts": copy.deepcopy(axis_facts),
            "nonselected_operations": nonselected_ops,
        },
    }
