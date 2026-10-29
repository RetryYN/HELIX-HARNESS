"""F02 same-call policy-to-field selection materialization."""

from __future__ import annotations

import copy

from application_input_schema import _json_equal
from application_source_checks import _ref_relation


_INPUT_ROOT = "validation_input"
_REQUEST_ROOT = "f05_request"


def _location(root, pointer):
    return {"root": root, "pointer": pointer}


def _present(root, pointer, value):
    return {
        "tag": "present",
        "location": _location(root, pointer),
        "value": copy.deepcopy(value),
    }


def _absent(root, pointer, parent_pointer, parent_value):
    return {
        "tag": "absent",
        "requested": _location(root, pointer),
        "parent": _location(root, parent_pointer),
        "parent_value": copy.deepcopy(parent_value),
    }


def _read_member(root, pointer, parent_pointer, parent, member):
    if isinstance(parent, dict) and member in parent:
        return _present(root, pointer, parent[member])
    return _absent(root, pointer, parent_pointer, parent)


def _relation(left, right):
    if not isinstance(left, dict) or not isinstance(right, dict):
        return "unestablished"
    return "corresponding" if _json_equal(left, right) else "different"


def _cause(kind, target, left, right, rule_pointer):
    return {
        "kind": kind,
        "target": target,
        "left": {"tag": "original", "read": copy.deepcopy(left)},
        "right": {"tag": "original", "read": copy.deepcopy(right)},
        "rule_pointer": rule_pointer,
    }


def _decision_collection_read(comparison):
    material = comparison.get("material") if isinstance(comparison, dict) else None
    if not isinstance(material, dict):
        return _absent(
            _REQUEST_ROOT,
            "/compare_applicability/comparison/material/policy_decisions",
            "/compare_applicability/comparison/material",
            material,
        )
    return _read_member(
        _REQUEST_ROOT,
        "/compare_applicability/comparison/material/policy_decisions",
        "/compare_applicability/comparison/material",
        material,
        "policy_decisions",
    )


def _field_selection(input_value, comparison, field, field_index):
    """Join actual same-call decisions to raw policy rows and one field."""
    policy_collection = input_value.get("application_policies")
    decision_collection_read = _decision_collection_read(comparison)
    decisions = (
        decision_collection_read.get("value")
        if decision_collection_read["tag"] == "present"
        else None
    )
    if not isinstance(decisions, list) or not isinstance(policy_collection, list):
        return {
            "tag": "unestablished",
            "original_operands": [
                {
                    "name": "policy_decisions",
                    "read": decision_collection_read,
                },
                {
                    "name": "application_policies",
                    "read": (
                        _present(
                            _INPUT_ROOT, "/application_policies", policy_collection
                        )
                        if "application_policies" in input_value
                        else _absent(
                            _INPUT_ROOT,
                            "/application_policies",
                            "",
                            input_value,
                        )
                    ),
                },
                {
                    "name": "field",
                    "read": _present(
                        _INPUT_ROOT, f"/field_inputs/{field_index}", field
                    ),
                },
            ],
            "policy_occurrences": [],
            "causes": [],
        }

    field_template = field.get("template_ref") if isinstance(field, dict) else None
    field_binding = field.get("binding") if isinstance(field, dict) else None
    occurrences = []
    causes = []
    field_has_target = False
    only_known_outside = bool(decisions)

    for decision_index, decision in enumerate(decisions):
        decision_pointer = (
            "/compare_applicability/comparison/material/policy_decisions/"
            f"{decision_index}"
        )
        decision_read = _present(_REQUEST_ROOT, decision_pointer, decision)
        if not isinstance(decision, dict):
            only_known_outside = False
            continue
        policy_index = decision.get("policy_occurrence_index")
        if (
            isinstance(policy_index, bool)
            or not isinstance(policy_index, int)
            or policy_index < 0
            or policy_index >= len(policy_collection)
        ):
            only_known_outside = False
            continue

        policy = policy_collection[policy_index]
        policy_pointer = f"/application_policies/{policy_index}"
        policy_read = _present(_INPUT_ROOT, policy_pointer, policy)
        if not isinstance(policy, dict):
            only_known_outside = False
            continue
        policy_ref_read = _read_member(
            _INPUT_ROOT,
            f"{policy_pointer}/ref",
            policy_pointer,
            policy,
            "ref",
        )
        decision_ref_read = _read_member(
            _REQUEST_ROOT,
            f"{decision_pointer}/policy_ref",
            decision_pointer,
            decision,
            "policy_ref",
        )
        policy_template_read = _read_member(
            _INPUT_ROOT,
            f"{policy_pointer}/template_ref",
            policy_pointer,
            policy,
            "template_ref",
        )
        field_template_read = _read_member(
            _INPUT_ROOT,
            f"/field_inputs/{field_index}/template_ref",
            f"/field_inputs/{field_index}",
            field,
            "template_ref",
        )
        policy_binding_read = _read_member(
            _INPUT_ROOT,
            f"{policy_pointer}/binding",
            policy_pointer,
            policy,
            "binding",
        )
        field_binding_read = _read_member(
            _INPUT_ROOT,
            f"/field_inputs/{field_index}/binding",
            f"/field_inputs/{field_index}",
            field,
            "binding",
        )
        disposition_read = _read_member(
            _REQUEST_ROOT,
            f"{decision_pointer}/disposition",
            decision_pointer,
            decision,
            "disposition",
        )
        policy_ref_relation = _ref_relation(
            decision_ref_read.get("value")
            if decision_ref_read["tag"] == "present"
            else None,
            policy_ref_read.get("value")
            if policy_ref_read["tag"] == "present"
            else None,
        )
        template_relation = _ref_relation(
            policy_template_read.get("value")
            if policy_template_read["tag"] == "present"
            else None,
            field_template_read.get("value")
            if field_template_read["tag"] == "present"
            else None,
        )
        binding_relation = _relation(
            policy_binding_read.get("value")
            if policy_binding_read["tag"] == "present"
            else None,
            field_binding_read.get("value")
            if field_binding_read["tag"] == "present"
            else None,
        )
        occurrence_causes = []
        occurrences.append(
            {
                "policy_index": policy_index,
                "policy_read": policy_read,
                "decision_index": decision_index,
                "decision_read": decision_read,
                "policy_ref_relation": policy_ref_relation,
                "template_relation": template_relation,
                "binding_relation": binding_relation,
                "disposition_read": disposition_read,
                "causes": occurrence_causes,
            }
        )
        if (
            policy_ref_relation == "corresponding"
            and template_relation == "corresponding"
            and binding_relation == "corresponding"
        ):
            field_has_target = True
        elif (
            policy_ref_relation == "corresponding"
            and template_relation in ("different", "corresponding")
            and binding_relation in ("different", "corresponding")
            and (template_relation == "different" or binding_relation == "different")
        ):
            mismatch = (
                (
                    "template_ref",
                    template_relation,
                    policy_template_read,
                    field_template_read,
                )
                if template_relation == "different"
                else (
                    "binding",
                    binding_relation,
                    policy_binding_read,
                    field_binding_read,
                )
            )
            member, _relation_value, policy_side, field_side = mismatch
            causes.append(
                _cause(
                    "target_mismatch",
                    _location(
                        _INPUT_ROOT,
                        f"/field_inputs/{field_index}/{member}",
                    ),
                    field_side,
                    policy_side,
                    "/f05_detail_contract/selection_contract/branches",
                )
            )
        else:
            only_known_outside = False

    if field_has_target:
        return {"tag": "targeted", "policy_occurrences": occurrences}
    if only_known_outside:
        return {
            "tag": "outside",
            "original_operands": [
                {
                    "name": "field",
                    "read": _present(
                        _INPUT_ROOT, f"/field_inputs/{field_index}", field
                    ),
                },
                {
                    "name": "policy_decisions",
                    "read": decision_collection_read,
                },
            ],
            "causes": causes,
        }
    return {
        "tag": "unestablished",
        "original_operands": [
            {
                "name": "policy_decisions",
                "read": decision_collection_read,
            },
            {
                "name": "field",
                "read": _present(_INPUT_ROOT, f"/field_inputs/{field_index}", field),
            },
        ],
        "policy_occurrences": occurrences,
        "causes": causes,
    }
