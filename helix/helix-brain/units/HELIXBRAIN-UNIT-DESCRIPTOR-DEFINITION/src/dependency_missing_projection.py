"""Required-dependency no-call and absent-selector public projections."""

from __future__ import annotations

import copy
from typing import Any

from dependencies_handoff_ports import _serialize_trace
from descriptor_definitions import _binding_shape_ok, _ref_shape_ok


_MISSING_AXIS_PREFIX = "必要identityに対応する原Refは当該categoryに未供給。他bodyで補償しない。"
_MISSING_RULE = "HELIXBRAIN-L5-032-R-required_dependency_missing"
_SELECTOR_RULE = "HELIXBRAIN-L5-032-R-dependency_selector_unknown"
_SELECTORS = (
    "core_return_requested",
    "core_source_selected",
    "labo_evaluation_selected",
)


def _root_binding_and_subject(validated: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]] | None:
    raw = validated.get("input")
    binding = raw.get("binding") if isinstance(raw, dict) else None
    if not _binding_shape_ok(binding):
        return None
    subject = binding.get("knowledge_ref")
    if not _ref_shape_ok(subject):
        subject = binding.get("template_ref")
    if not _ref_shape_ok(subject):
        return None
    return binding, subject


def _category_refs_and_locator(raw: dict[str, Any], category: str) -> tuple[list[Any], str | None]:
    dependencies = raw.get("dependencies")
    refs = dependencies.get(category) if isinstance(dependencies, dict) else None
    if isinstance(refs, list):
        return copy.deepcopy(refs), f"/dependencies/{category}"
    return [], None


def project_required_dependency_missing_axis(
    validated: dict[str, Any],
    category: str,
    required_identity: str,
) -> list[dict[str, Any]]:
    """Form one L5 R105 no-call Axis for one original required identity."""
    if category not in {"always_refs", "core_return_refs"}:
        raise ValueError("category must be a canonical fn6 dependency category")
    formed = _root_binding_and_subject(validated)
    if formed is None:
        return []
    binding, subject = formed
    raw = validated["input"]
    original_refs, category_locator = _category_refs_and_locator(raw, category)
    material = {
        "format": "BRAIN032-F09-axis-reason-trace-v1",
        "producer_symbol": "compare_dependencies_and_handoff",
        "axis": "dependency_reference",
        "state": "missing",
        "subject_ref": copy.deepcopy(subject),
        "binding": copy.deepcopy(binding),
        "original_refs": copy.deepcopy(original_refs),
        "backflow_owner": "knowledge_owner",
        "request_locator": None,
        "source_category_locator": category_locator,
        "cause": None,
        "canonical_body_support": [],
        "handoff_record": None,
        "selection_observation": None,
    }
    reason = f"{_MISSING_AXIS_PREFIX}\nTRACE={_serialize_trace(material)}"
    return [{
        "subject_ref": copy.deepcopy(subject),
        "binding": copy.deepcopy(binding),
        "axis": "dependency_reference",
        "state": "missing",
        "original_refs": original_refs,
        "reason": reason,
        "backflow_owner": "knowledge_owner",
    }]


def project_required_dependency_missing_finding(
    validated: dict[str, Any],
    category: str,
    required_identity: str,
) -> list[dict[str, Any]]:
    """Form the existing R105 Finding when its typed subject is formable."""
    if category not in {"always_refs", "core_return_refs"}:
        raise ValueError("category must be a canonical fn6 dependency category")
    formed = _root_binding_and_subject(validated)
    if formed is None:
        return []
    binding, subject = formed
    raw = validated["input"]
    source_path = f"/dependencies/{category}"
    original_refs, _ = _category_refs_and_locator(raw, category)
    return [{
        "code": "required_dependency_missing",
        "rule_ref": _MISSING_RULE,
        "subject_ref": copy.deepcopy(subject),
        "binding": copy.deepcopy(binding),
        "axis": "dependency_reference",
        "state": "missing",
        "source_refs": original_refs,
        "reason": (
            "HELIXBRAIN-L3-032-F09で必要なidentity "
            f"{required_identity} が入力 {source_path} にない。"
            "欠落Refのrevision/scope/owner/source_locator/digestは生成しない。"
        ),
        "backflow_owner": "knowledge_owner",
    }]


def project_absent_dependency_selector(
    validated: dict[str, Any],
    selector: str,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Project one absent selector through its existing R106 Axis/Finding."""
    if selector not in _SELECTORS:
        raise ValueError("selector is outside the fixed fn6 selector set")
    formed = _root_binding_and_subject(validated)
    if formed is None:
        return [], []
    binding, subject = formed
    reason = (
        f"条件selector {selector} が /dependencies/{selector} にない。"
        "falseを既定せず、その条件のref集合を評価しない。"
    )
    axis = {
        "subject_ref": copy.deepcopy(subject),
        "binding": copy.deepcopy(binding),
        "axis": "dependency_selection",
        "state": "unknown",
        "original_refs": [],
        "reason": reason,
        "backflow_owner": None,
    }
    finding = {
        "code": "dependency_selector_unknown",
        "rule_ref": _SELECTOR_RULE,
        "subject_ref": copy.deepcopy(subject),
        "binding": copy.deepcopy(binding),
        "axis": "dependency_selection",
        "state": "unknown",
        "source_refs": [],
        "reason": reason,
        "backflow_owner": None,
    }
    return [axis], [finding]
