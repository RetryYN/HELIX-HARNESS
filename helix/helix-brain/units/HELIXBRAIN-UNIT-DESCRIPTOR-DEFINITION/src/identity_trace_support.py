"""fn3 共通のwire読取、source参照、finding/axis形成を担う。"""
from __future__ import annotations
import copy
import json
from typing import Any
from descriptor_definitions import (
    _binding_same,
    _copy_refs_in_source_order,
    _is_json_value,
    _json_equal,
    _ref_same,
    _ref_shape_ok,
    _source_qualification_ok,
    _wire_ref_shape_ok,
)

def _fn3_r59_binding_shape_ok(value: Any) -> bool:
    """Keep the closed Binding/Ref shape while permitting only template.revision absence."""
    fields = {
        "template_ref", "knowledge_ref", "requirement_ref", "oracle_ref", "pack_ref",
        "pack_contract_version", "pack_artifact_version", "pack_dependency_versions", "version_target",
    }
    if not isinstance(value, dict) or set(value) != fields:
        return False
    template_ref = value.get("template_ref")
    ref_fields = {"identity", "revision", "scope", "owner", "source_locator", "sha256"}
    if not isinstance(template_ref, dict) or "revision" in template_ref or set(template_ref) != ref_fields - {"revision"}:
        return False
    if not all(isinstance(template_ref[key], (str, type(None)))
               for key in ("identity", "owner", "source_locator", "sha256")) or not _is_json_value(template_ref["scope"]):
        return False
    if any(not _ref_shape_ok(value[key]) for key in ("knowledge_ref", "requirement_ref", "oracle_ref", "pack_ref")):
        return False
    if any(not isinstance(value[key], (str, type(None)))
           for key in ("pack_contract_version", "pack_artifact_version", "version_target")):
        return False
    return isinstance(value["pack_dependency_versions"], list) and all(
        _ref_shape_ok(row) for row in value["pack_dependency_versions"]
    )

_FN3_BACKFLOW = "HELIXBRAIN-L6-032-FN3-IDENTITY"

_IDENTITY_ACTUAL_AXES = (
    ("template.identity", "template_actual_ref", "/binding/template_ref", "/binding/template_ref"),
    ("knowledge.identity", "knowledge_actual_ref", "/binding/knowledge_ref", "/binding/knowledge_ref"),
    ("requirement.identity", "requirement_actual_ref", "/binding/requirement_ref", "/binding/requirement_ref"),
    ("oracle.identity", "oracle_actual_ref", "/binding/oracle_ref", "/binding/oracle_ref"),
    ("pack.identity", "pack_actual_ref", "/binding/pack_ref", "/binding/pack_ref"),
    ("template.version", "template_actual_revision", "/binding/template_ref/revision", "/binding/template_ref"),
    ("knowledge.revision", "knowledge_actual_revision", "/binding/knowledge_ref/revision", "/binding/knowledge_ref"),
    ("pack.revision", "pack_actual_revision", "/binding/pack_ref/revision", "/binding/pack_ref"),
    ("pack.contract_version", "pack_actual_contract_version", "/binding/pack_contract_version", "/binding/pack_ref"),
    ("pack.artifact_version", "pack_actual_artifact_version", "/binding/pack_artifact_version", "/binding/pack_ref"),
    ("knowledge.operational_state", "knowledge_actual_operational_state", "knowledge_state_selection", "/binding/knowledge_ref"),
)

def _fn3_stop(case_id: str, detail: str) -> NotImplementedError:
    return NotImplementedError(f"F04/N01/{case_id}: {detail}; Backflow {_FN3_BACKFLOW}")

def _fn3_axis(subject: Any, binding: Any, name: str, state: str, refs: list[Any], reason: str,
              owner: Any = None) -> dict[str, Any]:
    return {
        "subject_ref": copy.deepcopy(subject), "binding": copy.deepcopy(binding), "axis": name,
        "state": state, "original_refs": _copy_refs_in_source_order([r for r in refs if isinstance(r, dict)]),
        "reason": reason, "backflow_owner": owner,
    }

def _fn3_finding(code: str, subject: Any, binding: Any, axis: str, state: str,
                 source_refs: list[Any], reason: str, owner: str = "knowledge_owner") -> dict[str, Any]:
    return {
        "code": code, "rule_ref": f"HELIXBRAIN-L5-032-R-{code}",
        "subject_ref": copy.deepcopy(subject), "binding": copy.deepcopy(binding), "axis": axis,
        "state": state, "source_refs": _copy_refs_in_source_order([r for r in source_refs if isinstance(r, dict)]),
        "reason": reason, "backflow_owner": owner,
    }

def _fn3_write_predicate_axes(findings: list[dict[str, Any]], axes: list[dict[str, Any]]) -> None:
    """Append only predicate rows with no same-subject/Binding/axis read row."""
    read_axes = tuple(axes)
    for finding in findings:
        subject = finding.get("subject_ref")
        binding = finding.get("binding")
        if not isinstance(subject, dict) or not isinstance(binding, dict):
            continue
        matching_read = any(
            row.get("axis") == finding.get("axis")
            and (_json_equal(row.get("subject_ref"), subject) or _ref_same(row.get("subject_ref"), subject))
            and (_json_equal(row.get("binding"), binding) or _binding_same(row.get("binding"), binding))
            for row in read_axes
        )
        if matching_read:
            continue
        refs = [subject]
        refs.extend(ref for ref in finding.get("source_refs", []) if _wire_ref_shape_ok(ref))
        axes.append(_fn3_axis(subject, binding, finding["axis"], finding["state"], refs,
                              finding["reason"], finding.get("backflow_owner")))

def _fn3_source_rows(raw: dict[str, Any], ref: Any) -> list[tuple[int, dict[str, Any]]]:
    sources = raw.get("sources")
    if not isinstance(sources, list) or not isinstance(ref, dict):
        return []
    return [(i, s) for i, s in enumerate(sources)
            if isinstance(s, dict) and _ref_same(s.get("ref"), ref)]

def _fn3_qualification_rows(raw: dict[str, Any], ref: Any) -> list[tuple[int, dict[str, Any]]]:
    rows = raw.get("qualifications")
    if not isinstance(rows, list) or not isinstance(ref, dict):
        return []
    return [(i, q) for i, q in enumerate(rows)
            if isinstance(q, dict) and _ref_same(q.get("ref"), ref)]

def _fn3_root_rows(raw: dict[str, Any], ref: Any) -> list[tuple[int, dict[str, Any]]]:
    rows = raw.get("qualification_roots")
    if not isinstance(rows, list) or not isinstance(ref, dict):
        return []
    return [(i, root) for i, root in enumerate(rows) if isinstance(root, dict) and _ref_same(root, ref)]

def _fn3_valid_source(raw: dict[str, Any], source: dict[str, Any], unusable: list[Any]) -> bool:
    if source.get("role") != "semantic_json" or any(_json_equal(source.get("ref"), u) for u in unusable):
        return False
    return _source_qualification_ok(raw, source)

def _fn3_diag(prefix: str, material: dict[str, Any]) -> str:
    return prefix + "\n" + json.dumps(material, ensure_ascii=False, sort_keys=True, separators=(",", ":"))

_FN3_FINDING_PREFIXES = {
    "version_missing": "当該templateの実内容版が未供給。knowledge/pack/version_targetがあってもtemplate実版ではない。",
    "source_missing": "candidate-Aのbindingで参照されたsemantic sourceが供給されていない。他候補sourceは当該sourceではない。",
    "scope_missing": "候補の適用scopeが未供給で、同名または他scopeの供給で補えない。",
    "mixed_knowledge_revision": "一項目の根拠だけが同templateのexact knowledge bindingと異なるrevisionへ結ばれている。",
    "silent_supersession": "原旧knowledge参照を異版へ付け替えたが、その旧新を結ぶ明示supersession原関係がない。",
    "oracle_revision_mismatch": "同subject/要求scopeへ束縛されたoracleの版が当該bindingのoracle版と異なる。",
    "image_identity_inference": "template意味identityのowner原根拠が未供給で、画像だけの推定claimがある。",
    "tool_node_identity_inference": "実template版のowner原根拠が未供給で、tool node IDだけの推定claimがある。",
    "filename_identity_join": "qualified原記録で異identityの二候補に、filename一致だけでsame identity claimを付けている。",
}

def _fn3_predicate_finding_reason(raw: dict[str, Any], code: str,
                                 observations: list[tuple[str, str]]) -> str:
    rule_ref = f"HELIXBRAIN-L5-032-R-{code}"
    reads = [{"locator": pointer, "original_read": _fn3_presence(raw, pointer)}
             for pointer, _role in observations]
    return _fn3_diag(_FN3_FINDING_PREFIXES[code],
                     {"code": code, "rule_ref": rule_ref, "predicate_observations": reads})

def _fn3_scope_relation(left: Any, right: Any) -> str:
    """Compare observed RawValue scopes without turning absence into known difference."""
    if left is None or right is None:
        return "unobserved"
    return "same" if _json_equal(left, right) else "different"

def _fn3_combine_scope_relations(relations: tuple[str, ...]) -> str:
    if "different" in relations:
        return "different"
    if "unobserved" in relations:
        return "unobserved"
    return "same"

def _fn3_wire_full_ref(value: Any) -> bool:
    """L4 Refのwire shapeとfull endpoint tupleが観測済みかを確認する。"""
    return (_wire_ref_shape_ok(value)
            and all(key in value and value[key] is not None
                    for key in ("identity", "revision", "scope", "owner")))

def _fn3_range_declaration_formed(value: Any) -> bool:
    """Project only a locally well-formed L4 RangeDeclaration carrier."""
    members = {"left_ref", "right_ref", "actual_pack_ref", "actual_contract_version",
               "actual_artifact_version", "declared_range", "relation", "reason", "owner_declarations"}
    if not isinstance(value, dict) or set(value) != members:
        return False
    if not all(_wire_ref_shape_ok(value.get(key)) for key in ("left_ref", "right_ref", "actual_pack_ref")):
        return False
    if (not isinstance(value.get("actual_contract_version"), str)
            or not isinstance(value.get("actual_artifact_version"), str)
            or value.get("relation") != "outside" or not isinstance(value.get("reason"), str)):
        return False
    declared = value.get("declared_range")
    if (not isinstance(declared, dict) or set(declared) != {"pack_contract_versions", "pack_artifact_versions"}
            or any(not isinstance(declared.get(key), list)
                   or any(not isinstance(item, str) for item in declared[key])
                   for key in ("pack_contract_versions", "pack_artifact_versions"))):
        return False
    owners = value.get("owner_declarations")
    if not isinstance(owners, list) or len(owners) != 2:
        return False
    if not all(isinstance(row, dict) and set(row) == {"endpoint_ref", "owner", "relation"}
               and _wire_ref_shape_ok(row.get("endpoint_ref"))
               and isinstance(row.get("owner"), str)
               and row["owner"] == row["endpoint_ref"].get("owner")
               and row.get("relation") == "outside" for row in owners):
        return False
    return (sum(_ref_same(row["endpoint_ref"], value["left_ref"]) for row in owners) == 1
            and sum(_ref_same(row["endpoint_ref"], value["right_ref"]) for row in owners) == 1)

def _fn3_left_owner_body_formed(value: Any) -> bool:
    """Project only one of the two closed L4 LeftOwnerSourceBody branches."""
    common = {"compatible_refs", "compatible", "compatibility_record_ref",
              "counterpart_source_ref", "endpoint_owner_declaration"}
    if not isinstance(value, dict) or type(value.get("compatible")) is not bool:
        return False
    expected = common if value["compatible"] else common | {"declared_range"}
    if set(value) != expected:
        return False
    if (not isinstance(value.get("compatible_refs"), list)
            or any(not _wire_ref_shape_ok(ref) for ref in value["compatible_refs"])
            or not _wire_ref_shape_ok(value.get("compatibility_record_ref"))
            or not _wire_ref_shape_ok(value.get("counterpart_source_ref"))):
        return False
    declaration = value.get("endpoint_owner_declaration")
    declaration_fields = {"endpoint", "endpoint_ref", "owner", "compatible",
                          "range_relation", "range_reason"}
    if (not isinstance(declaration, dict) or set(declaration) != declaration_fields
            or declaration.get("endpoint") != "left"
            or not _wire_ref_shape_ok(declaration.get("endpoint_ref"))
            or not isinstance(declaration.get("owner"), str)
            or type(declaration.get("compatible")) is not bool
            or not isinstance(declaration.get("range_relation"), str)
            or declaration.get("range_relation") not in {"outside", "not_supplied"}
            or (declaration.get("range_reason") is not None
                and not isinstance(declaration.get("range_reason"), str))):
        return False
    if not value["compatible"]:
        declared = value.get("declared_range")
        if (not isinstance(declared, dict)
                or set(declared) != {"pack_contract_versions", "pack_artifact_versions"}
                or any(not isinstance(declared.get(key), list)
                       or any(not isinstance(item, str) for item in declared[key])
                       for key in ("pack_contract_versions", "pack_artifact_versions"))):
            return False
    return True

def _fn3_resolve_pointer(root: Any, pointer: str) -> tuple[bool, Any]:
    if pointer in {"", "/"}:
        return True, root
    if not isinstance(pointer, str) or not pointer.startswith("/"):
        return False, None
    current = root
    for raw_part in pointer[1:].split("/"):
        part = raw_part.replace("~1", "/").replace("~0", "~")
        if isinstance(current, dict) and part in current:
            current = current[part]
        elif isinstance(current, list) and part.isdigit() and int(part) < len(current):
            current = current[int(part)]
        else:
            return False, None
    return True, current

def _fn3_presence(root: Any, pointer: str) -> dict[str, Any]:
    present, value = _fn3_resolve_pointer(root, pointer)
    return {"presence": "supplied", "value": copy.deepcopy(value)} if present else {"presence": "absent"}

def _fn3_qualified_owner_source(raw: dict[str, Any], source: dict[str, Any],
                                unusable: list[Any]) -> bool:
    if not _fn3_valid_source(raw, source, unusable):
        return False
    qrows = _fn3_qualification_rows(raw, source.get("qualification_ref"))
    if not qrows or any(not _json_equal(q, qrows[0][1]) for _, q in qrows[1:]):
        return False
    q = qrows[0][1]
    body = q.get("qualification_body")
    roots = _fn3_root_rows(raw, q.get("root_ref"))
    return (isinstance(body, dict) and body.get("owner") == source.get("ref", {}).get("owner")
            and bool(roots) and all(root.get("owner") == source.get("ref", {}).get("owner") for _, root in roots))
