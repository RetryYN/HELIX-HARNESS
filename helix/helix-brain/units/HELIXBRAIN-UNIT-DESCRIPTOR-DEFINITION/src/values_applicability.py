"""BRAIN032 F03/N03 値と適用（fn2 compare_values_and_applicability / _evaluate_field_values_detail）実装。

根拠:
- docs/helix-brain/L4-basic-design/template-semantic-supply.json
  - /field_value_applicability_contract
  - /definition_meaning_resolution_contract/normative_basis_snapshot
- docs/helix-brain/L5-detail-design/template-semantic-supply.json
  - /functions/2
  - /failure_rules/54..57, 102..104
  - /field_value_applicability_detail/private_reader_bindings
  - /field_value_applicability_detail/claim_protocol
"""

from __future__ import annotations

import copy
from typing import Any

from descriptor_definitions import (
    _APPROVED_KINDS,
    _binding_same,
    _comparison,
    _copy_refs_in_source_order,
    _f03_request,
    _json_equal,
    _n03_rule,
    _ordered,
    _owner_body_equal,
    _presence,
    _ref_same,
    _ref_shape_ok,
    _root_occurrences,
    _same_claim_target,
    _source_shape_ok,
    _source_usable,
    _write_f03b_comparison_from_existing_comparison,
)

F03_BACKFLOW_ID = "HELIXBRAIN-L6-032-F03-FN2-PATH"
N03_BACKFLOW_ID = "HELIXBRAIN-L6-032-N03-PATH"

_NORMATIVE_SNAPSHOT_META = {
    "revision": "5a3cfa984fab34f31ce623d667db1670f80b1544",
    "path": "docs/helix-brain/L4-basic-design/template-semantic-supply.json",
    "file_sha256": "033cff2d2bbe00975b09ce2cbecb4f3d542bf4fae859912ac41f5a584561fdb2",
    "catalog_pointer": "/descriptor_meanings",
    "catalog_canonical_sha256": "224602413a177ad7f304bebfa9e0aea55293dc0a771b3e74d9c396c8d2f15651",
    "scope": {
        "parent_requirement": "HELIXBRAIN-L2-032",
        "functional_requirement": "HELIXBRAIN-L3-032-F01",
        "scope_kind": "generic_design_template_descriptor",
    },
}

_NORMATIVE_ENTRIES: dict[str, dict[str, Any]] = {
    "required field": {
        "entry_pointer": "/descriptor_meanings/6",
        "entry_canonical_sha256": "938d18ac4f080533bfbba789ab0f4059c4c1b5eb5fdf600b463ecae4f4525d32",
        "entry_value": {
            "descriptor": "required field",
            "meaning": "節に属する欄の意味・要否の条件。節のN/Aを全欄へ一律転写しない。",
        },
    },
}

_PROBLEM_REASONS: dict[str, str] = {
    "owner_unresolved": "原fieldの独立owner宣言を同subject/full Binding/bodyへ結べない。",
    "definition_empty": "原ownerが対応するfieldの意味参照を明示空としている。元field定義missingを保持する。",
    "definition_known": "同原fieldの選択factについて同callの元意味判定knownを保持する。",
    "definition_unknown": "同原fieldの選択factに対応する元意味判定を取得できない。",
    "value_unknown": "原案件値はunknownである。元理由とknowledge版を保持する。",
    "value_supplied": "原製品ownerの供給値を保持する。汎用定義へ採用しない。",
    "applicability_null": "field固有の適用参照は明示nullであり非適用を生成しない。",
    "applicability_unknown": "原field適用判断はunknownであり非適用へ変換しない。",
    "applicability_na": "同fieldの原owner判断と理由と再評価条件が非適用を支持する。",
    "field_na": "根拠付き非適用は当該fieldだけに保持する。",
    "parent_na_no_transfer": "根拠付きsection非適用だけを保持しfieldへ転写しない。",
    "field_unknown": "field固有の適用判断は未決である。",
    "container_absent": "owner原sourceにdescriptor_targets memberが供給されていない。targetを生成しない。",
    "field_owner_not_found": "当該原fieldに対応する独立ownerのsection_field_recordsを取得できない。",
    "app_null": "原fieldのapplicability_refは明示nullである。",
    "definition_material_absent": "同callの元definition私有材料が供給されていない。",
    "definition_material_differs": "元definition私有材料は同callの公開Comparisonに対応しない。",
    "record_unknown": "原recordはunknownを保持している。",
    "na_incomplete": "原非適用判断に必要な原理由又は再評価条件又は判定者が未供給である。",
    "lookup_unresolved": "原requestに対応するroot又はowner source recordを解決できない。",
    "frame_differs": "原subject又はfull Bindingが当該requestと既知に異なる。",
    "records_differ": "同じ原record Refの異なる本文を保持する。先頭又は最新を選ばない。",
    "reference_fixture": "参照fixture値を稼働値へ採用しない。",
    "origin_absent": "原案件値のowner由来が未供給である。",
    "null_or_type": "原request又はcontainerのnull又は型外を保持する。",
    "not_declared": "原targetに対応するowner宣言を取得できない。",
    "ambiguous": "同原targetに複数の異なるslot対応がある。",
    "kind_conflict": "同原targetとslotの既知kind対応が相反する。",
    "qualification_unresolved": "原sourceの既存資格又はbody照合が未成立である。",
    "fact_unresolved": "原field意味参照を同slotの原factへ結べない。",
    "field_refs_invalid": "原fieldのmeaning_fact_refsは未供給又はnull又は型外である。",
    "definition_missing": "選択した原field意味factの元missing判定を保持する。",
    "definition_conflict": "選択した原field意味factの元conflict判定を保持する。",
    "definition_na": "選択した原field意味factの元非適用判定を保持する。",
    "applicability_applicable": "同fieldの原owner判断applicableを保持する。",
    "field_applicable": "同fieldの原適用判断applicableだけを保持する。",
    "value_na": "当該原値が指す同fieldの根拠付き非適用を別観点として保持する。",
    "field_owner_unresolved": "同field/subject/full Binding/bodyの独立owner宣言を取得できない。",
    "meaning_refs_empty": "原owner対応fieldのmeaning_fact_refsは明示空配列である。",
    "meaning_positive": "固定frame/原fact/body/原理由/basisへ対応する肯定意味判断を保持する。",
}

_JUDGMENT_CAUSE_TABLE: dict[str, tuple[str, str, str]] = {
    "field_owner_unresolved": (
        "definition_unknown",
        "unknown",
        "同field/subject/full Binding/bodyの独立owner宣言を取得できない。",
    ),
    "meaning_refs_empty": (
        "definition_empty",
        "missing",
        "原owner対応fieldのmeaning_fact_refsは明示空配列である。",
    ),
    "meaning_positive": (
        "definition_known",
        "known",
        "固定frame/原fact/body/原理由/basisへ対応する肯定意味判断を保持する。",
    ),
}

_F03_RULE_SPECS: dict[int, tuple[str, str, str, str, str]] = {
    54: (
        "unknown_as_na",
        "HELIXBRAIN-L5-032-R-unknown_as_na",
        "field.value",
        "core_owner",
        "field定義は既知で案件値のみ未供給。field固有のqualified CORE判断がなくN/A claimを支えない。原値unknownを保存。",
    ),
    55: (
        "definition_as_value_gap",
        "HELIXBRAIN-L5-032-R-definition_as_value_gap",
        "field.definition",
        "knowledge_owner",
        "field固有の意味定義が欠落。返却claimが案件値の未決だけとしても原定義missingを消せない。",
    ),
    56: (
        "applicability_unknown_as_na",
        "HELIXBRAIN-L5-032-R-applicability_unknown_as_na",
        "applicability.evaluation",
        "core_owner",
        "元適用判断がunknownで、同fieldの非適用の原判断/理由/再評価根拠が未供給。",
    ),
    57: (
        "section_na_all_fields",
        "HELIXBRAIN-L5-032-R-section_na_all_fields",
        "field.applicability",
        "core_owner",
        "sectionへの根拠付きN/Aのみ存在し、field固有条件/理由/判定根拠が未供給。節の判断を全fieldへ転写しない。",
    ),
}


def _f03_stop(branch: str, detail: str) -> NotImplementedError:
    err = NotImplementedError(f"F03/{branch}: {detail}; Backflow {F03_BACKFLOW_ID}")
    err._n03_branch_tagged = True
    return err


def _problem(
    cause: str,
    locator: str,
    original_value: dict[str, Any],
    source_ref: Any = None,
    source_index: int | None = None,
    *,
    relevance: str = "target",
) -> dict[str, Any]:
    reason = _PROBLEM_REASONS.get(cause)
    if reason is None:
        raise _f03_stop("problem_cause_unclosed", f"unclosed F03Problem cause: {cause}")
    return {
        "cause": cause,
        "locator": locator,
        "original_value": copy.deepcopy(original_value),
        "source_ref": _presence(source_ref, present=isinstance(source_ref, dict)),
        "source_index": source_index,
        "relevance": relevance,
        "reason": reason,
    }


def _has_f03_carriers_or_null_applicability(raw: dict[str, Any]) -> bool:
    for source in raw.get("sources", []):
        if isinstance(source, dict) and isinstance(source.get("content"), dict):
            content = source["content"]
            if any(
                k in content
                for k in (
                    "section_field_records",
                    "descriptor_targets",
                    "value_facts",
                    "field_applicability_records",
                )
            ):
                return True
    for field in raw.get("section_fields", []):
        if isinstance(field, dict) and field.get("applicability_ref") is None:
            return True
    return False


def _matching_semantic_sources(
    validated: dict[str, Any],
    binding: Any,
    source_ref: Any = None,
) -> list[tuple[int, dict[str, Any]]]:
    raw = validated.get("input")
    if not isinstance(raw, dict):
        raise _f03_stop("validated_input_missing", "semantic source selection requires the same ValidatedSupply")
    if "sources" not in raw or not isinstance(raw["sources"], list):
        raise _f03_stop("sources_absent_or_shape", "sources is not supplied as an array")
    matches: list[tuple[int, dict[str, Any]]] = []
    for index, source in enumerate(raw["sources"]):
        if not isinstance(source, dict):
            raise _f03_stop("source_record_decoder", f"sources[{index}] is not an object")
        if source.get("role") != "semantic_json":
            continue
        if not _source_shape_ok(source):
            raise _f03_stop("semantic_source_record_decoder", f"sources[{index}] is outside the typed Source shape")
        content = source.get("content")
        if not isinstance(content, dict):
            raise _f03_stop("semantic_source_content_decoder", f"sources[{index}].content is not an object")
        if source_ref is not None:
            if not _ref_same(source.get("ref"), source_ref):
                continue
        elif not _binding_same(content.get("binding"), binding):
            continue
        if not _source_usable(validated, source.get("ref")):
            raise _f03_stop("matching_source_unusable", f"matching semantic source is unusable at /sources/{index}")
        matches.append((index, source))
    return matches


def _read_f03_field_owner_record(
    validated: dict[str, Any],
    kind: str,
    field_locator: str,
    field: dict[str, Any],
    request_locator: str,
    requested_ref: Any,
    source_ref: Any = None,
    subject_ref: Any = None,
) -> dict[str, Any]:
    raw = validated["input"]
    binding = raw["binding"]
    expected_subject = field.get("ref") if subject_ref is None else subject_ref
    request = _f03_request(kind, field_locator, expected_subject, binding, request_locator, requested_ref)
    if requested_ref is None:
        if kind == "field_applicability":
            return {
                "request": request,
                "state": "unknown",
                "root_occurrences": [],
                "source_occurrences": [],
                "supports": [],
                "problems": [_problem("app_null", request_locator, _presence(None, present=True))],
            }
        raise _f03_stop("requested_ref_null", f"{kind} requested_ref is null at {request_locator}")

    collection = {
        "field": "section_fields",
        "value": "values",
        "field_applicability": "applicability_records",
        "value_applicability": "applicability_records",
        "parent_section": "applicability_records",
    }[kind]
    member = {
        "field": "section_field_records",
        "value": "value_facts",
        "field_applicability": "field_applicability_records",
        "value_applicability": "field_applicability_records",
        "parent_section": "field_applicability_records",
    }[kind]

    roots = _root_occurrences(raw, collection, requested_ref)
    if len(roots) > 1:
        first_body = roots[0]["original_value"]
        if any(not _json_equal(r["original_value"], first_body) for r in roots[1:]):
            raise _f03_stop("duplicate_conflicting_carrier_records", f"conflicting root records for {kind}")

    effective_source_ref = source_ref
    if effective_source_ref is None and roots and kind in ("value", "field_applicability", "value_applicability", "parent_section"):
        cand_src = roots[0]["original_value"].get("source_ref")
        if isinstance(cand_src, dict):
            effective_source_ref = cand_src

    source_candidates = _matching_semantic_sources(validated, binding, effective_source_ref)
    problems: list[dict[str, Any]] = []
    source_occurrences: list[dict[str, Any]] = []
    supports: list[dict[str, int]] = []

    for source_index, source in source_candidates:
        content = source["content"]
        locator = f"/sources/{source_index}/content/{member}"
        if "binding" not in content:
            problems.append(
                _problem("lookup_unresolved", f"/sources/{source_index}/content/binding", _presence(present=False), source.get("ref"), source_index)
            )
            continue
        if content.get("binding") is None or not isinstance(content.get("binding"), dict):
            problems.append(
                _problem("null_or_type", f"/sources/{source_index}/content/binding", _presence(content.get("binding"), present=True), source.get("ref"), source_index)
            )
            continue
        if not _binding_same(content.get("binding"), binding):
            problems.append(
                _problem("frame_differs", f"/sources/{source_index}/content/binding", _presence(content.get("binding"), present=True), source.get("ref"), source_index)
            )
            continue
        if member not in content:
            cause = "field_owner_not_found" if kind == "field" else "container_absent"
            problems.append(_problem(cause, locator, _presence(present=False), source.get("ref"), source_index))
            continue
        entries = content[member]
        if entries is None or not isinstance(entries, list):
            raise _f03_stop(f"{member}_container_shape", f"{locator} is null or not an array")
        if not entries:
            problems.append(_problem("lookup_unresolved", locator, _presence(entries, present=True), source.get("ref"), source_index))
            continue
        matched_in_source = False
        for rec_index, entry in enumerate(entries):
            if not isinstance(entry, dict):
                raise _f03_stop(f"{member}_entry_shape", f"{locator}/{rec_index} is not an object")
            if kind == "field":
                if set(entry.keys()) != {"record"} or not isinstance(entry.get("record"), dict):
                    raise _f03_stop("section_field_entry_shape", f"{locator}/{rec_index} must be F03OwnerSectionFieldEntry")
                rec = entry["record"]
                if not _ref_same(rec.get("ref"), requested_ref):
                    continue
                matched_in_source = True
                src_occ_idx = len(source_occurrences)
                source_occurrences.append(
                    {
                        "source_index": source_index,
                        "record_index": rec_index,
                        "locator": f"{locator}/{rec_index}",
                        "source_ref": copy.deepcopy(source["ref"]),
                        "original_value": copy.deepcopy(entry),
                    }
                )
                for root_occ_idx, root_occ in enumerate(roots):
                    if _json_equal(root_occ["original_value"], rec):
                        supports.append(
                            {
                                "root_occurrence_index": root_occ_idx,
                                "source_occurrence_index": src_occ_idx,
                            }
                        )
                    else:
                        raise _f03_stop("field_mirror_differs", f"{locator}/{rec_index} differs from root SectionField")
            else:
                rec = entry
                if not _ref_same(rec.get("ref"), requested_ref):
                    continue
                matched_in_source = True
                src_occ_idx = len(source_occurrences)
                source_occurrences.append(
                    {
                        "source_index": source_index,
                        "record_index": rec_index,
                        "locator": f"{locator}/{rec_index}",
                        "source_ref": copy.deepcopy(source["ref"]),
                        "original_value": copy.deepcopy(rec),
                    }
                )
                for root_occ_idx, root_occ in enumerate(roots):
                    root_val = root_occ["original_value"]
                    if not _ref_same(rec.get("subject_ref"), expected_subject) or not _binding_same(rec.get("binding"), binding):
                        raise _f03_stop("carrier_record_frame_differs", f"{locator}/{rec_index} subject or binding differs")
                    if _json_equal(root_val, rec):
                        supports.append(
                            {
                                "root_occurrence_index": root_occ_idx,
                                "source_occurrence_index": src_occ_idx,
                            }
                        )
                    else:
                        raise _f03_stop("carrier_record_body_differs", f"{locator}/{rec_index} body differs from root record")
        if not matched_in_source:
            problems.append(_problem("lookup_unresolved", locator, _presence(entries, present=True), source.get("ref"), source_index))

    if not roots and not source_candidates:
        problems.append(_problem("lookup_unresolved", request_locator, _presence(requested_ref, present=requested_ref is not None)))
    if roots and not source_candidates:
        cause = "field_owner_not_found" if kind == "field" else "lookup_unresolved"
        problems.append(_problem(cause, request_locator, _presence(requested_ref, present=requested_ref is not None)))

    if supports:
        if kind == "field":
            problems = []
        state = "resolved"
    else:
        state = "unknown"

    return {
        "request": request,
        "state": state,
        "root_occurrences": roots,
        "source_occurrences": source_occurrences,
        "supports": supports,
        "problems": problems,
    }


def _read_f03_field_descriptor_target(
    validated: dict[str, Any],
    field_locator: str,
    field: dict[str, Any],
    *,
    has_f03_mode: bool,
) -> dict[str, Any]:
    raw = validated["input"]
    binding = raw["binding"]
    slot_ref = field.get("descriptor_slot_ref")
    request = {
        "binding": _presence(binding, present=binding is not None),
        "descriptor_slot_ref": _presence(slot_ref, present="descriptor_slot_ref" in field),
    }
    problems: list[dict[str, Any]] = []
    occurrences: list[dict[str, Any]] = []
    matches: list[dict[str, Any]] = []

    if not has_f03_mode:
        sources = _matching_semantic_sources(validated, binding)
        for source_index, source in sources:
            locator = f"/sources/{source_index}/content/descriptor_targets"
            if "descriptor_targets" not in source["content"]:
                problems.append(_problem("container_absent", locator, _presence(present=False), source.get("ref"), source_index))
        return {
            "field_locator": field_locator,
            "request": request,
            "state": "unknown",
            "occurrences": [],
            "matches": [],
            "problems": problems,
        }

    knowledge_ref = binding["knowledge_ref"]
    prov_refs: list[dict[str, Any]] = []
    for krec in raw.get("knowledge_records", []):
        if isinstance(krec, dict) and _ref_same(krec.get("ref"), knowledge_ref):
            for pref in krec.get("provenance_refs", []):
                if isinstance(pref, dict):
                    prov_refs.append(pref)

    for source_index, source in enumerate(raw.get("sources", [])):
        if not isinstance(source, dict) or source.get("role") != "semantic_json":
            continue
        if not _source_usable(validated, source.get("ref")):
            continue
        if not any(_ref_same(pref, source.get("ref")) for pref in prov_refs):
            continue
        content = source.get("content")
        if not isinstance(content, dict):
            continue
        locator = f"/sources/{source_index}/content/descriptor_targets"
        if "descriptor_targets" not in content:
            problems.append(
                _problem(
                    "container_absent",
                    locator,
                    _presence(present=False),
                    source.get("ref"),
                    source_index,
                    relevance="source_unattributed",
                )
            )
            continue
        raw_targets = content["descriptor_targets"]
        if raw_targets is None or not isinstance(raw_targets, list):
            raise _f03_stop("descriptor_targets_shape", f"{locator} is null or not an array")
        if not raw_targets:
            problems.append(_problem("lookup_unresolved", locator, _presence(raw_targets, present=True), source.get("ref"), source_index))
            continue
        for decl_index, decl in enumerate(raw_targets):
            decl_locator = f"{locator}/{decl_index}"
            if (
                not isinstance(decl, dict)
                or set(decl.keys()) != {"target_ref", "slot_identity", "descriptor_kind"}
                or not _ref_shape_ok(decl.get("target_ref"))
                or not isinstance(decl.get("slot_identity"), str)
                or decl.get("descriptor_kind") not in _APPROVED_KINDS
            ):
                raise _f03_stop("descriptor_target_declaration_shape", f"{decl_locator} invalid F03BOwnerDescriptorTarget")
            typed_decl = _presence(copy.deepcopy(decl), present=True)
            occurrences.append(
                {
                    "source_ref": _presence(source.get("ref"), present=True),
                    "source_index": source_index,
                    "source_locator": f"/sources/{source_index}",
                    "declaration_locator": decl_locator,
                    "declaration": copy.deepcopy(decl),
                    "source_binding": _presence(content.get("binding"), present="binding" in content),
                    "typed_declaration": typed_decl,
                }
            )
            if _binding_same(content.get("binding"), binding) and _ref_same(decl["target_ref"], slot_ref):
                slot_locators = [
                    f"/descriptors/{s_idx}"
                    for s_idx, s_obj in enumerate(raw.get("descriptors", []))
                    if isinstance(s_obj, dict)
                    and s_obj.get("slot_identity") == decl["slot_identity"]
                    and s_obj.get("descriptor_kind") == decl["descriptor_kind"]
                    and _binding_same(s_obj.get("binding"), binding)
                ]
                matches.append(
                    {
                        "target_ref": copy.deepcopy(decl["target_ref"]),
                        "binding": copy.deepcopy(binding),
                        "slot_identity": decl["slot_identity"],
                        "descriptor_kind": decl["descriptor_kind"],
                        "source_refs": [copy.deepcopy(source["ref"])],
                        "declaration_locators": [decl_locator],
                        "slot_locators": slot_locators,
                    }
                )

    state = "resolved" if len(matches) == 1 else "unknown"
    if len(matches) > 1:
        raise _f03_stop("ambiguous_or_conflicting_descriptor_target", "multiple target matches in F03FieldTargetRead")

    return {
        "field_locator": field_locator,
        "request": request,
        "state": state,
        "occurrences": occurrences,
        "matches": matches,
        "problems": problems,
    }


def _read_f03_fact_meaning(
    validated: dict[str, Any],
    slot_locator: str,
    fact_locator: str,
    slot: dict[str, Any],
    fact: dict[str, Any],
) -> dict[str, Any]:
    raw = validated["input"]
    binding = slot["binding"]
    kind = slot["descriptor_kind"]
    entry_meta = _NORMATIVE_ENTRIES.get(kind)
    if entry_meta is None:
        raise _f03_stop("normative_frame_kind_unclosed", f"normative frame for kind {kind} not in F03 slice")
    normative_frame = {
        "revision": _NORMATIVE_SNAPSHOT_META["revision"],
        "path": _NORMATIVE_SNAPSHOT_META["path"],
        "file_sha256": _NORMATIVE_SNAPSHOT_META["file_sha256"],
        "catalog_pointer": _NORMATIVE_SNAPSHOT_META["catalog_pointer"],
        "catalog_canonical_sha256": _NORMATIVE_SNAPSHOT_META["catalog_canonical_sha256"],
        "scope": copy.deepcopy(_NORMATIVE_SNAPSHOT_META["scope"]),
        "entry_pointer": entry_meta["entry_pointer"],
        "entry_canonical_sha256": entry_meta["entry_canonical_sha256"],
        "entry_value": copy.deepcopy(entry_meta["entry_value"]),
    }

    knowledge_ref = binding["knowledge_ref"]
    prov_refs: list[dict[str, Any]] = []
    for krec in raw.get("knowledge_records", []):
        if isinstance(krec, dict) and _ref_same(krec.get("ref"), knowledge_ref):
            for pref in krec.get("provenance_refs", []):
                if isinstance(pref, dict):
                    prov_refs.append(pref)

    occurrences: list[dict[str, Any]] = []
    supports: list[dict[str, Any]] = []
    problems: list[dict[str, Any]] = []

    for source_index, source in enumerate(raw.get("sources", [])):
        if not isinstance(source, dict) or source.get("role") != "semantic_json":
            continue
        if not _source_usable(validated, source.get("ref")):
            continue
        if not any(_ref_same(pref, source.get("ref")) for pref in prov_refs):
            continue
        content = source.get("content")
        if not isinstance(content, dict) or not _binding_same(content.get("binding"), binding):
            continue
        if "definition_meaning_operations" not in content:
            continue
        ops = content["definition_meaning_operations"]
        if ops is None or not isinstance(ops, list):
            raise _f03_stop("definition_meaning_operations_shape", f"/sources/{source_index}/content/definition_meaning_operations is invalid")
        for rec_index, op in enumerate(ops):
            loc = f"/sources/{source_index}/content/definition_meaning_operations/{rec_index}"
            if (
                not isinstance(op, dict)
                or set(op.keys()) != {"operation_ref", "arguments", "decision"}
                or not isinstance(op.get("arguments"), dict)
                or not isinstance(op.get("decision"), dict)
            ):
                raise _f03_stop("definition_meaning_operation_record_shape", f"{loc} invalid F03BDefinitionMeaningOperation")
            args = op["arguments"]
            dec = op["decision"]
            if (
                set(args.keys()) != {"binding", "slot_identity", "descriptor_kind", "fact_ref", "fact_body", "normative_argument"}
                or set(dec.keys()) != {"relation", "reason", "raw_semantic_basis", "basis_refs"}
            ):
                raise _f03_stop("definition_meaning_operation_nested_shape", f"{loc} invalid arguments/decision members")
            occurrences.append(
                {
                    "source_ref": copy.deepcopy(source["ref"]),
                    "source_index": source_index,
                    "record_index": rec_index,
                    "locator": loc,
                    "original_record": copy.deepcopy(op),
                    "decoded_record": _presence(copy.deepcopy(op), present=True),
                }
            )
            if (
                _binding_same(args["binding"], binding)
                and args["slot_identity"] == slot["slot_identity"]
                and args["descriptor_kind"] == kind
                and _ref_same(args["fact_ref"], fact["ref"])
                and _json_equal(args["fact_body"], fact["meaning"])
                and _json_equal(args["normative_argument"], normative_frame)
            ):
                supports.append(
                    {
                        "source_ref": copy.deepcopy(source["ref"]),
                        "source_index": source_index,
                        "record_index": rec_index,
                        "locator": loc,
                        "operation": copy.deepcopy(op),
                        "normative_frame": copy.deepcopy(normative_frame),
                    }
                )
            else:
                raise _f03_stop("definition_meaning_operation_mismatch", f"{loc} arguments or normative_frame mismatch")

    return {
        "slot_locator": slot_locator,
        "fact_locator": fact_locator,
        "binding": _presence(binding, present=True),
        "normative_frame": normative_frame,
        "acquisition_state": "resolved" if supports else "unknown",
        "occurrences": occurrences,
        "supports": supports,
        "problems": problems,
    }


def _read_f03_original_field_definition(
    validated: dict[str, Any],
    field_locator: str,
    field: dict[str, Any],
    *,
    has_f03_mode: bool,
) -> dict[str, Any]:
    raw = validated["input"]
    binding = raw["binding"]
    field_ref = field["ref"]
    knowledge_ref = binding["knowledge_ref"]

    meaning_refs = field.get("meaning_fact_refs")
    if not isinstance(meaning_refs, list) or any(not _ref_shape_ok(r) for r in meaning_refs):
        raise _f03_stop("meaning_fact_refs_shape", f"{field_locator}/meaning_fact_refs must be a Ref array")
    for comp in raw.get("meaning_comparisons", []):
        if isinstance(comp, dict) and any(
            _ref_same(comp.get(side), mref)
            for mref in meaning_refs
            for side in ("left_fact_ref", "right_fact_ref")
        ):
            raise _f03_stop("meaning_comparison_pair_read", "F03 pair_reads with participating meaning_comparisons is outside this slice")

    request = {
        "field_locator": field_locator,
        "field": _presence(field, present=True),
        "binding": _presence(binding, present=True),
    }
    owner_read = _read_f03_field_owner_record(
        validated, "field", field_locator, field, field_locator + "/ref", field_ref
    )
    target_read = _read_f03_field_descriptor_target(
        validated, field_locator, field, has_f03_mode=has_f03_mode
    )

    fact_reads: list[dict[str, Any]] = []
    pair_reads: list[dict[str, Any]] = []
    judgments: list[dict[str, Any]] = []

    if owner_read["state"] != "resolved":
        orig_refs = [field_ref, field.get("descriptor_slot_ref")]
        if has_f03_mode:
            orig_refs.append(knowledge_ref)
        branch, state, reason = _JUDGMENT_CAUSE_TABLE["field_owner_unresolved"]
        judgments.append(
            {
                "branch": branch,
                "cause": "field_owner_unresolved",
                "state": state,
                "request_ref_index": None,
                "fact_read_indices": [],
                "meaning_support_indices": [],
                "pair_read_indices": [],
                "original_refs": _copy_refs_in_source_order(orig_refs),
                "original_reason": _presence(present=False),
                "original_semantic_basis": _presence(present=False),
                "reason": reason,
            }
        )
    else:
        owner_src_ref = owner_read["source_occurrences"][owner_read["supports"][0]["source_occurrence_index"]]["source_ref"]
        if len(meaning_refs) == 0:
            branch, state, reason = _JUDGMENT_CAUSE_TABLE["meaning_refs_empty"]
            judgments.append(
                {
                    "branch": branch,
                    "cause": "meaning_refs_empty",
                    "state": state,
                    "request_ref_index": None,
                    "fact_read_indices": [],
                    "meaning_support_indices": [],
                    "pair_read_indices": [],
                    "original_refs": _copy_refs_in_source_order(
                        [field_ref, field.get("descriptor_slot_ref"), knowledge_ref, owner_src_ref]
                    ),
                    "original_reason": _presence(present=False),
                    "original_semantic_basis": _presence(present=False),
                    "reason": reason,
                }
            )
        else:
            if target_read["state"] != "resolved" or not target_read["matches"][0]["slot_locators"]:
                raise _f03_stop("target_unresolved_for_nonempty_meaning_refs", "target_read unresolved for non-empty meaning_fact_refs")
            slot_locator = target_read["matches"][0]["slot_locators"][0]
            slot_idx = int(slot_locator.rsplit("/", 1)[-1])
            slot = raw["descriptors"][slot_idx]

            for ref_idx, req_ref in enumerate(meaning_refs):
                req_loc = f"{field_locator}/meaning_fact_refs/{ref_idx}"
                matched_fact_idx: int | None = None
                matched_fact: dict[str, Any] | None = None
                for f_idx, cand_fact in enumerate(slot.get("facts", [])):
                    if isinstance(cand_fact, dict) and _ref_same(cand_fact.get("ref"), req_ref):
                        matched_fact_idx = f_idx
                        matched_fact = cand_fact
                        break
                if matched_fact is None or matched_fact_idx is None:
                    raise _f03_stop("selected_fact_unresolved", f"selected fact not found in {slot_locator}")
                fact_locator = f"{slot_locator}/facts/{matched_fact_idx}"

                attr_supports: list[dict[str, Any]] = []
                for s_idx, source in enumerate(raw.get("sources", [])):
                    if (
                        not isinstance(source, dict)
                        or source.get("role") != "semantic_json"
                        or not _ref_same(source.get("ref"), matched_fact.get("source_ref"))
                        or not _source_usable(validated, source.get("ref"))
                    ):
                        continue
                    content = source.get("content")
                    if not isinstance(content, dict) or not _binding_same(content.get("binding"), binding):
                        continue
                    for g_idx, group in enumerate(content.get("descriptor_facts", [])):
                        if not isinstance(group, dict) or group.get("slot_identity") != slot.get("slot_identity"):
                            continue
                        if group.get("descriptor_kind") != slot.get("descriptor_kind"):
                            raise _f03_stop("attribution_kind_conflict", "descriptor_kind conflict in attribution_read")
                        for gf_idx, orig_fact in enumerate(group.get("facts", [])):
                            if (
                                isinstance(orig_fact, dict)
                                and _ref_same(orig_fact.get("ref"), matched_fact.get("ref"))
                                and _owner_body_equal(orig_fact, matched_fact)
                                and _binding_same(orig_fact.get("binding"), binding)
                            ):
                                attr_supports.append(
                                    {
                                        "source_ref": copy.deepcopy(source["ref"]),
                                        "source_index": s_idx,
                                        "group_index": g_idx,
                                        "fact_index": gf_idx,
                                        "group_locator": f"/sources/{s_idx}/content/descriptor_facts/{g_idx}",
                                        "fact_locator": f"/sources/{s_idx}/content/descriptor_facts/{g_idx}/facts/{gf_idx}",
                                        "original_group": copy.deepcopy(group),
                                        "original_fact": copy.deepcopy(orig_fact),
                                    }
                                )
                if not attr_supports:
                    raise _f03_stop("attribution_unknown", f"attribution unresolved for {fact_locator}")
                attribution_read = {
                    "state": "known",
                    "supports": attr_supports,
                    "problems": [],
                }
                meaning_read_val = _read_f03_fact_meaning(validated, slot_locator, fact_locator, slot, matched_fact)
                if not meaning_read_val["supports"]:
                    raise _f03_stop("meaning_read_unresolved", f"meaning_read has no positive support for {fact_locator}")

                fact_read_idx = len(fact_reads)
                fact_reads.append(
                    {
                        "request_locator": req_loc,
                        "requested_ref": _presence(req_ref, present=True),
                        "slot_locator": slot_locator,
                        "fact_locator": fact_locator,
                        "fact": _presence(matched_fact, present=True),
                        "attribution_read": attribution_read,
                        "meaning_read": _presence(meaning_read_val, present=True),
                        "problems": [],
                    }
                )

                for m_sup_idx, m_sup in enumerate(meaning_read_val["supports"]):
                    dec = m_sup["operation"]["decision"]
                    if (
                        dec.get("relation") != "defines_descriptor"
                        or dec["reason"].get("presence") != "supplied"
                        or not isinstance(dec["reason"].get("value"), str)
                        or dec["raw_semantic_basis"].get("presence") != "supplied"
                        or dec["raw_semantic_basis"].get("value") is None
                    ):
                        raise _f03_stop("meaning_decision_non_positive", "non-positive or incomplete meaning decision")
                    branch, state, reason = _JUDGMENT_CAUSE_TABLE["meaning_positive"]
                    orig_refs = [
                        field_ref,
                        field.get("descriptor_slot_ref"),
                        knowledge_ref,
                        owner_src_ref,
                        matched_fact["ref"],
                        matched_fact["source_ref"],
                        m_sup["source_ref"],
                        m_sup["operation"]["operation_ref"],
                        *dec.get("basis_refs", []),
                    ]
                    judgments.append(
                        {
                            "branch": branch,
                            "cause": "meaning_positive",
                            "state": state,
                            "request_ref_index": ref_idx,
                            "fact_read_indices": [fact_read_idx],
                            "meaning_support_indices": [m_sup_idx],
                            "pair_read_indices": [],
                            "original_refs": _copy_refs_in_source_order(orig_refs),
                            "original_reason": copy.deepcopy(dec["reason"]),
                            "original_semantic_basis": copy.deepcopy(dec["raw_semantic_basis"]),
                            "reason": reason,
                        }
                    )

    problems = (
        copy.deepcopy(owner_read["problems"])
        + ([] if has_f03_mode and target_read["state"] == "resolved" else copy.deepcopy(target_read["problems"]))
        + [p for fr in fact_reads for p in fr["problems"]]
    )
    return {
        "request": request,
        "owner_read": owner_read,
        "target_read": target_read,
        "fact_reads": fact_reads,
        "pair_reads": pair_reads,
        "judgments": judgments,
        "problems": problems,
    }


def _build_reason_material(
    branch: str,
    field_locator: str,
    request_locator: str,
    root_locators: list[str],
    source_locators: list[str],
    original_presence: dict[str, Any],
    original_reason: dict[str, Any],
    original_owner: dict[str, Any],
    original_decision: dict[str, Any],
    original_reentry: dict[str, Any],
    knowledge_ref: dict[str, Any],
    definition_cause: dict[str, Any],
) -> dict[str, Any]:
    return {
        "branch": branch,
        "field_locator": field_locator,
        "request_locator": request_locator,
        "root_locators": list(root_locators),
        "source_locators": list(source_locators),
        "original_presence": copy.deepcopy(original_presence),
        "original_reason": copy.deepcopy(original_reason),
        "original_owner": copy.deepcopy(original_owner),
        "original_decision": copy.deepcopy(original_decision),
        "original_reentry": copy.deepcopy(original_reentry),
        "knowledge_ref": copy.deepcopy(knowledge_ref),
        "definition_cause": copy.deepcopy(definition_cause),
    }


def _emit_event_and_axis(
    branch: str,
    subject_ref: dict[str, Any],
    binding: dict[str, Any],
    axis_name: str,
    state: str,
    original_refs: list[Any],
    backflow_owner: str | None,
    material: dict[str, Any],
    judgment_indices: list[int],
) -> tuple[dict[str, Any], dict[str, Any]]:
    reason = _PROBLEM_REASONS[branch] + "\n" + _ordered(material)
    cleaned_refs = _copy_refs_in_source_order([r for r in original_refs if r is not None])
    axis = {
        "subject_ref": copy.deepcopy(subject_ref),
        "binding": copy.deepcopy(binding),
        "axis": axis_name,
        "state": state,
        "original_refs": cleaned_refs,
        "reason": reason,
        "backflow_owner": backflow_owner,
    }
    event = {
        "branch": branch,
        "subject_ref": _presence(subject_ref, present=True),
        "binding": _presence(binding, present=True),
        "axis": axis_name,
        "state": state,
        "original_refs": copy.deepcopy(cleaned_refs),
        "reason_material": material,
        "reason": reason,
        "backflow_owner": backflow_owner,
        "definition_judgment_indices": list(judgment_indices),
    }
    return event, axis


def _build_f03_row(
    validated: dict[str, Any],
    index: int,
    field: dict[str, Any],
    *,
    has_f03_mode: bool,
) -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]]]:
    raw = validated["input"]
    field_locator = f"/section_fields/{index}"
    binding = raw["binding"]
    field_ref = field.get("ref")
    field_members = {
        "ref",
        "descriptor_slot_ref",
        "parent_section_ref",
        "meaning_fact_refs",
        "requiredness_fact_refs",
        "normative_rule_refs",
        "oracle_refs",
        "value_fact_refs",
        "applicability_ref",
    }
    if set(field.keys()) != field_members or not isinstance(field_ref, dict) or not isinstance(binding, dict):
        raise NotImplementedError(f"SectionField closed shape branch: Backflow {N03_BACKFLOW_ID}")

    definition_read = _read_f03_original_field_definition(
        validated, field_locator, field, has_f03_mode=has_f03_mode
    )

    if "applicability_ref" not in field:
        raise NotImplementedError(f"field applicability absent branch: Backflow {N03_BACKFLOW_ID}")
    applicability_ref = field["applicability_ref"]
    if applicability_ref is not None and not isinstance(applicability_ref, dict):
        raise NotImplementedError(f"field applicability Ref type branch: Backflow {N03_BACKFLOW_ID}")
    if applicability_ref is None and not has_f03_mode:
        raise NotImplementedError(f"field applicability absent/null branch: Backflow {N03_BACKFLOW_ID}")

    applicability_request_locator = field_locator + "/applicability_ref"
    applicability_read = _read_f03_field_owner_record(
        validated,
        "field_applicability",
        field_locator,
        field,
        applicability_request_locator,
        applicability_ref,
    )

    value_reads: list[dict[str, Any]] = []
    values = raw.get("values")
    value_refs = field.get("value_fact_refs")
    if not isinstance(values, list) or not isinstance(value_refs, list):
        raise NotImplementedError(f"SectionField.value_fact_refs absence/null/type branch: Backflow {N03_BACKFLOW_ID}")
    for value_index, value_ref in enumerate(value_refs):
        if not isinstance(value_ref, dict):
            raise NotImplementedError(f"SectionField.value_fact_refs non-Ref branch: Backflow {N03_BACKFLOW_ID}")
        matching_values = [row for row in values if _ref_same(row.get("ref"), value_ref)]
        if len(matching_values) > 1:
            raise NotImplementedError(f"duplicate same-ref ValueFact body branch: Backflow {N03_BACKFLOW_ID}")
        if matching_values and (
            not _ref_same(matching_values[0].get("subject_ref"), field_ref)
            or not _binding_same(matching_values[0].get("binding"), binding)
        ):
            raise NotImplementedError(f"ValueFact subject/full Binding mismatch branch: Backflow {N03_BACKFLOW_ID}")
        source_ref = matching_values[0].get("source_ref") if matching_values else None
        value_read = _read_f03_field_owner_record(
            validated,
            "value",
            field_locator,
            field,
            f"{field_locator}/value_fact_refs/{value_index}",
            value_ref,
            source_ref,
        )
        value_reads.append(value_read)
        if matching_values and "applicability_ref" in matching_values[0]:
            value_app_ref = matching_values[0]["applicability_ref"]
            if value_app_ref is not None:
                if not isinstance(value_app_ref, dict):
                    raise NotImplementedError(f"ValueFact.applicability_ref type branch: Backflow {N03_BACKFLOW_ID}")
                val_app_read = _read_f03_field_owner_record(
                    validated,
                    "value_applicability",
                    field_locator,
                    field,
                    f"/values/{_root_occurrences(raw, 'values', value_ref)[0]['index']}/applicability_ref",
                    value_app_ref,
                    subject_ref=matching_values[0].get("subject_ref"),
                )
                if val_app_read["state"] != "unknown":
                    raise _f03_stop("value_applicability_supplied", "ValueFact.applicability_ref non-null resolved/conflict evaluation is outside this slice")
                value_reads.append(val_app_read)

    parent_reads: list[dict[str, Any]] = []
    parent_ref = field.get("parent_section_ref")
    if parent_ref is not None:
        if not isinstance(parent_ref, dict):
            raise NotImplementedError(f"SectionField.parent_section_ref type branch: Backflow {N03_BACKFLOW_ID}")
        if has_f03_mode:
            for app_rec in raw.get("applicability_records", []):
                if isinstance(app_rec, dict) and _ref_same(app_rec.get("subject_ref"), parent_ref):
                    parent_reads.append(
                        _read_f03_field_owner_record(
                            validated,
                            "parent_section",
                            field_locator,
                            field,
                            field_locator + "/parent_section_ref",
                            app_rec.get("ref"),
                            app_rec.get("source_ref"),
                            subject_ref=parent_ref,
                        )
                    )
        else:
            parent_reads.append(
                _read_f03_field_owner_record(
                    validated,
                    "parent_section",
                    field_locator,
                    field,
                    field_locator + "/parent_section_ref",
                    parent_ref,
                    subject_ref=parent_ref,
                )
            )

    knowledge_ref = binding["knowledge_ref"]
    knowledge_owner = knowledge_ref.get("owner") if isinstance(knowledge_ref.get("owner"), str) else None
    events: list[dict[str, Any]] = []
    public_axes: list[dict[str, Any]] = []

    for j_idx, judgment in enumerate(definition_read["judgments"]):
        j_branch = judgment["branch"]
        j_state = judgment["state"]
        j_cause = judgment["cause"]
        mat = _build_reason_material(
            j_branch,
            field_locator,
            field_locator + "/meaning_fact_refs",
            [r["locator"] for r in definition_read["owner_read"]["root_occurrences"]],
            [r["locator"] for r in definition_read["owner_read"]["source_occurrences"]],
            _presence(field.get("meaning_fact_refs"), present="meaning_fact_refs" in field),
            judgment["original_reason"],
            _presence(present=False),
            _presence(present=False),
            _presence(present=False),
            knowledge_ref,
            _presence(j_cause, present=True),
        )
        ev, ax = _emit_event_and_axis(
            j_branch,
            field_ref,
            binding,
            "field.definition",
            j_state,
            judgment["original_refs"],
            knowledge_owner,
            mat,
            [j_idx],
        )
        events.append(ev)
        public_axes.append(ax)

    case_active = bool(value_reads) or (applicability_ref is not None) or any(
        pr["state"] == "resolved" for pr in parent_reads
    )

    if case_active:
        resolved_parent_na: dict[str, Any] | None = None
        resolved_parent_read: dict[str, Any] | None = None
        for pr in parent_reads:
            if pr["state"] == "resolved" and pr["root_occurrences"]:
                p_rec = pr["root_occurrences"][0]["original_value"]
                if p_rec.get("decision") == "not_applicable":
                    if p_rec.get("owner") is None or p_rec.get("reason") is None or p_rec.get("reentry_condition") is None:
                        raise _f03_stop("na_incomplete_branch", "parent not_applicable record lacks owner/reason/reentry_condition")
                    resolved_parent_na = p_rec
                    resolved_parent_read = pr
                    break

        if applicability_ref is None:
            core_owner = (
                resolved_parent_na.get("owner")
                if isinstance(resolved_parent_na, dict) and isinstance(resolved_parent_na.get("owner"), str)
                else "synthetic-core-owner"
            )
            if resolved_parent_na is not None and resolved_parent_read is not None:
                app_mat = _build_reason_material(
                    "applicability_null",
                    field_locator,
                    applicability_request_locator,
                    [r["locator"] for r in resolved_parent_read["root_occurrences"]],
                    [r["locator"] for r in resolved_parent_read["source_occurrences"]],
                    _presence(None, present=True),
                    _presence(resolved_parent_na.get("reason"), present="reason" in resolved_parent_na),
                    _presence(resolved_parent_na.get("owner"), present="owner" in resolved_parent_na),
                    _presence(resolved_parent_na.get("decision"), present="decision" in resolved_parent_na),
                    _presence(resolved_parent_na.get("reentry_condition"), present="reentry_condition" in resolved_parent_na),
                    knowledge_ref,
                    _presence(present=False),
                )
            else:
                if value_reads and value_reads[0]["root_occurrences"]:
                    v_src = value_reads[0]["root_occurrences"][0]["original_value"].get("source_ref")
                    if isinstance(v_src, dict) and isinstance(v_src.get("owner"), str):
                        core_owner = v_src["owner"]
                app_mat = _build_reason_material(
                    "applicability_null",
                    field_locator,
                    applicability_request_locator,
                    [],
                    [],
                    _presence(None, present=True),
                    _presence(present=False),
                    _presence(present=False),
                    _presence(present=False),
                    _presence(present=False),
                    knowledge_ref,
                    _presence(present=False),
                )
            ev, ax = _emit_event_and_axis(
                "applicability_null",
                field_ref,
                binding,
                "applicability.evaluation",
                "unknown",
                [knowledge_ref],
                core_owner,
                app_mat,
                [],
            )
            events.append(ev)
            public_axes.append(ax)
        elif applicability_read["state"] == "resolved":
            app_rec = applicability_read["root_occurrences"][0]["original_value"]
            app_owner = app_rec.get("owner") if isinstance(app_rec.get("owner"), str) else knowledge_owner
            decision = app_rec.get("decision")
            if decision == "applicable":
                app_branch, app_state = "applicability_applicable", "applicable"
            elif decision == "not_applicable":
                if app_rec.get("owner") is None or app_rec.get("reason") is None or app_rec.get("reentry_condition") is None:
                    raise _f03_stop("na_incomplete_branch", "ApplicabilityRecord decision=not_applicable lacks owner/reason/reentry_condition")
                app_branch, app_state = "applicability_na", "not_applicable"
            elif decision == "unknown":
                app_branch, app_state = "applicability_unknown", "unknown"
            else:
                raise _f03_stop("applicability_decision_invalid", f"invalid ApplicabilityRecord.decision: {decision}")
            app_refs = [app_rec.get("ref"), knowledge_ref, app_rec.get("source_ref")]
            app_mat = _build_reason_material(
                app_branch,
                field_locator,
                applicability_request_locator,
                [r["locator"] for r in applicability_read["root_occurrences"]],
                [r["locator"] for r in applicability_read["source_occurrences"]],
                _presence(decision, present="decision" in app_rec),
                _presence(app_rec.get("reason"), present="reason" in app_rec),
                _presence(app_rec.get("owner"), present="owner" in app_rec),
                _presence(decision, present="decision" in app_rec),
                _presence(app_rec.get("reentry_condition"), present="reentry_condition" in app_rec),
                knowledge_ref,
                _presence(present=False),
            )
            ev, ax = _emit_event_and_axis(
                app_branch,
                field_ref,
                binding,
                "applicability.evaluation",
                app_state,
                app_refs,
                app_owner,
                app_mat,
                [],
            )
            events.append(ev)
            public_axes.append(ax)
        else:
            app_mat = _build_reason_material(
                "applicability_unknown",
                field_locator,
                applicability_request_locator,
                [r["locator"] for r in applicability_read["root_occurrences"]],
                [r["locator"] for r in applicability_read["source_occurrences"]],
                _presence(applicability_ref, present=True),
                _presence(present=False),
                _presence(present=False),
                _presence(present=False),
                _presence(present=False),
                knowledge_ref,
                _presence(present=False),
            )
            ev, ax = _emit_event_and_axis(
                "applicability_unknown",
                field_ref,
                binding,
                "applicability.evaluation",
                "unknown",
                [applicability_ref],
                knowledge_owner,
                app_mat,
                [],
            )
            events.append(ev)
            public_axes.append(ax)

        for v_read in value_reads:
            if v_read["request"]["kind"] != "value":
                continue
            v_occs = v_read["root_occurrences"]
            v_rec = v_occs[0]["original_value"] if v_occs else None
            if v_read["state"] == "resolved" and isinstance(v_rec, dict):
                v_src = v_rec.get("source_ref")
                v_owner = v_src.get("owner") if isinstance(v_src, dict) and isinstance(v_src.get("owner"), str) else knowledge_owner
                v_refs = [v_rec.get("ref"), knowledge_ref, v_src]
                if v_rec.get("value") is not None and v_rec.get("origin") == "product_input":
                    v_branch, v_state = "value_supplied", "supplied"
                elif v_rec.get("value") is None and v_rec.get("origin") in ("absent", "reference_fixture"):
                    v_branch, v_state = "value_unknown", "unknown"
                else:
                    raise _f03_stop("value_origin_or_value_combination", "unclosed ValueFact value/origin combination")
            else:
                v_owner = knowledge_owner
                v_refs = [v_rec.get("ref"), v_rec.get("source_ref")] if isinstance(v_rec, dict) else []
                v_branch, v_state = "value_unknown", "unknown"

            v_mat = _build_reason_material(
                v_branch,
                field_locator,
                v_read["request"]["request_locator"],
                [r["locator"] for r in v_occs],
                [r["locator"] for r in v_read["source_occurrences"]],
                _presence(v_rec.get("value"), present="value" in v_rec) if isinstance(v_rec, dict) else _presence(present=False),
                _presence(v_rec.get("reason"), present="reason" in v_rec) if isinstance(v_rec, dict) else _presence(present=False),
                _presence(present=False),
                _presence(present=False),
                _presence(present=False),
                knowledge_ref,
                _presence(present=False),
            )
            ev, ax = _emit_event_and_axis(
                v_branch,
                field_ref,
                binding,
                "field.value",
                v_state,
                v_refs,
                v_owner,
                v_mat,
                [],
            )
            events.append(ev)
            public_axes.append(ax)

        if applicability_ref is None:
            if resolved_parent_na is not None and resolved_parent_read is not None:
                p_owner = (
                    resolved_parent_na.get("owner")
                    if isinstance(resolved_parent_na.get("owner"), str)
                    else "synthetic-core-owner"
                )
                p_refs = [resolved_parent_na.get("ref"), knowledge_ref, resolved_parent_na.get("source_ref")]
                fapp_mat = _build_reason_material(
                    "parent_na_no_transfer",
                    field_locator,
                    applicability_request_locator,
                    [r["locator"] for r in resolved_parent_read["root_occurrences"]],
                    [r["locator"] for r in resolved_parent_read["source_occurrences"]],
                    _presence(None, present=True),
                    _presence(resolved_parent_na.get("reason"), present="reason" in resolved_parent_na),
                    _presence(resolved_parent_na.get("owner"), present="owner" in resolved_parent_na),
                    _presence(resolved_parent_na.get("decision"), present="decision" in resolved_parent_na),
                    _presence(resolved_parent_na.get("reentry_condition"), present="reentry_condition" in resolved_parent_na),
                    knowledge_ref,
                    _presence(present=False),
                )
                ev, ax = _emit_event_and_axis(
                    "parent_na_no_transfer",
                    field_ref,
                    binding,
                    "field.applicability",
                    "unknown",
                    p_refs,
                    p_owner,
                    fapp_mat,
                    [],
                )
                events.append(ev)
                public_axes.append(ax)
            else:
                f_owner = "synthetic-core-owner"
                if value_reads and value_reads[0]["root_occurrences"]:
                    v_src = value_reads[0]["root_occurrences"][0]["original_value"].get("source_ref")
                    if isinstance(v_src, dict) and isinstance(v_src.get("owner"), str):
                        f_owner = v_src["owner"]
                fapp_mat = _build_reason_material(
                    "field_unknown",
                    field_locator,
                    applicability_request_locator,
                    [],
                    [],
                    _presence(None, present=True),
                    _presence(present=False),
                    _presence(present=False),
                    _presence(present=False),
                    _presence(present=False),
                    knowledge_ref,
                    _presence(present=False),
                )
                ev, ax = _emit_event_and_axis(
                    "field_unknown",
                    field_ref,
                    binding,
                    "field.applicability",
                    "unknown",
                    [knowledge_ref],
                    f_owner,
                    fapp_mat,
                    [],
                )
                events.append(ev)
                public_axes.append(ax)
        elif applicability_read["state"] == "resolved":
            app_rec = applicability_read["root_occurrences"][0]["original_value"]
            app_owner = app_rec.get("owner") if isinstance(app_rec.get("owner"), str) else knowledge_owner
            decision = app_rec.get("decision")
            if decision == "applicable":
                f_branch, f_state = "field_applicable", "applicable"
            elif decision == "not_applicable":
                f_branch, f_state = "field_na", "not_applicable"
            else:
                f_branch, f_state = "field_unknown", "unknown"
            f_refs = [app_rec.get("ref"), knowledge_ref, app_rec.get("source_ref")]
            fapp_mat = _build_reason_material(
                f_branch,
                field_locator,
                applicability_request_locator,
                [r["locator"] for r in applicability_read["root_occurrences"]],
                [r["locator"] for r in applicability_read["source_occurrences"]],
                _presence(decision, present="decision" in app_rec),
                _presence(app_rec.get("reason"), present="reason" in app_rec),
                _presence(app_rec.get("owner"), present="owner" in app_rec),
                _presence(decision, present="decision" in app_rec),
                _presence(app_rec.get("reentry_condition"), present="reentry_condition" in app_rec),
                knowledge_ref,
                _presence(present=False),
            )
            ev, ax = _emit_event_and_axis(
                f_branch,
                field_ref,
                binding,
                "field.applicability",
                f_state,
                f_refs,
                app_owner,
                fapp_mat,
                [],
            )
            events.append(ev)
            public_axes.append(ax)
        else:
            fapp_mat = _build_reason_material(
                "field_unknown",
                field_locator,
                applicability_request_locator,
                [r["locator"] for r in applicability_read["root_occurrences"]],
                [r["locator"] for r in applicability_read["source_occurrences"]],
                _presence(applicability_ref, present=True),
                _presence(present=False),
                _presence(present=False),
                _presence(present=False),
                _presence(present=False),
                knowledge_ref,
                _presence(present=False),
            )
            ev, ax = _emit_event_and_axis(
                "field_unknown",
                field_ref,
                binding,
                "field.applicability",
                "unknown",
                [applicability_ref],
                knowledge_owner,
                fapp_mat,
                [],
            )
            events.append(ev)
            public_axes.append(ax)

    row = {
        "field_locator": field_locator,
        "field": copy.deepcopy(field),
        "definition_read": definition_read,
        "value_reads": value_reads,
        "applicability_read": applicability_read,
        "parent_reads": parent_reads,
        "events": events,
        "axis_indices": [],
        "finding_indices": [],
    }
    all_problems = (
        copy.deepcopy(definition_read["problems"])
        + [problem for read in value_reads for problem in read["problems"]]
        + copy.deepcopy(applicability_read["problems"])
        + [problem for read in parent_reads for problem in read["problems"]]
    )
    return row, public_axes, all_problems


def _evaluate_f03_claim_on_row(
    claim: dict[str, Any],
    row: dict[str, Any],
) -> tuple[int, dict[str, Any]] | None:
    required_claim_members = {"subject_ref", "binding", "actor", "kind", "proposed_value", "basis_refs"}
    if set(claim.keys()) != required_claim_members:
        raise NotImplementedError(f"Claim/ValueFact closed shape branch: Backflow {N03_BACKFLOW_ID}")
    if claim.get("actor") != "BRAIN" or not isinstance(claim.get("basis_refs"), list):
        raise NotImplementedError(f"Claim actor/basis branch: Backflow {N03_BACKFLOW_ID}")
    if any(not _ref_shape_ok(r) for r in claim["basis_refs"]):
        raise _f03_stop("claim_basis_refs_shape", "Claim.basis_refs contains non-Ref element")

    kind = claim.get("kind")
    proposed = claim.get("proposed_value")

    if kind == "value_only_gap":
        if proposed != "unknown":
            raise _f03_stop("claim_proposed_value_invalid", f"invalid proposed_value for value_only_gap: {proposed!r}")
        candidates = [55]
    elif kind == "field_not_applicable":
        if proposed == "not_applicable":
            candidates = [56, 54]
        elif proposed == "applicable":
            return None
        else:
            raise _f03_stop("claim_proposed_value_invalid", f"invalid proposed_value for field_not_applicable: {proposed!r}")
    elif kind == "all_section_fields_not_applicable":
        if proposed != "not_applicable":
            raise _f03_stop(
                "claim_proposed_value_invalid",
                f"invalid proposed_value for all_section_fields_not_applicable: {proposed!r}",
            )
        candidates = [57]
    else:
        raise _f03_stop("claim_kind_unrecognized", f"unrecognized F03 Claim.kind: {kind!r}")

    events_by_axis: dict[str, list[dict[str, Any]]] = {}
    for ev in row["events"]:
        events_by_axis.setdefault(ev["axis"], []).append(ev)

    for rule_num in (55, 56, 54, 57):
        if rule_num not in candidates:
            continue
        if rule_num == 55:
            for ev in events_by_axis.get("field.definition", []):
                if ev["state"] == "missing" and ev["branch"] == "definition_empty":
                    return 55, ev
        elif rule_num == 56:
            for ev in events_by_axis.get("applicability.evaluation", []):
                if ev["state"] == "unknown" and ev["branch"] == "applicability_unknown":
                    return 56, ev
        elif rule_num == 54:
            def_known = any(e["state"] == "known" for e in events_by_axis.get("field.definition", []))
            app_ok = any(e["state"] == "applicable" for e in events_by_axis.get("applicability.evaluation", []))
            if def_known and app_ok:
                for ev in events_by_axis.get("field.value", []):
                    if ev["state"] == "unknown":
                        return 54, ev
        elif rule_num == 57:
            for ev in events_by_axis.get("field.applicability", []):
                if ev["state"] == "unknown" and ev["branch"] == "parent_na_no_transfer":
                    return 57, ev

    return None


def evaluate_field_values_detail(context: dict[str, Any]) -> dict[str, Any]:
    """L4 F03BasicContextを受け、閉じたF03Evaluationを返す。"""
    if set(context) != {"snapshot", "definitions"}:
        raise NotImplementedError(f"F03BasicContext closed shape: Backflow {N03_BACKFLOW_ID}")
    validated = context["snapshot"]
    definitions = context["definitions"]
    if not isinstance(validated, dict) or not isinstance(validated.get("input"), dict):
        raise NotImplementedError(f"F03 snapshot alias is not the validated input: Backflow {N03_BACKFLOW_ID}")
    if (
        not isinstance(definitions, dict)
        or set(definitions) != {"axes", "findings", "producer_symbol", "input_binding"}
        or not isinstance(definitions.get("axes"), list)
        or not isinstance(definitions.get("findings"), list)
    ):
        raise NotImplementedError(f"F03 definitions is not a closed projected Comparison: Backflow {N03_BACKFLOW_ID}")
    raw = validated["input"]
    binding = raw.get("binding")
    axes: list[dict[str, Any]] = []
    findings: list[dict[str, Any]] = []
    rows: list[dict[str, Any]] = []
    problems: list[dict[str, Any]] = []
    if not isinstance(binding, dict) or "values" not in raw or "section_fields" not in raw or "claims" not in raw:
        raise NotImplementedError(f"fn2 required input presence branch: Backflow {N03_BACKFLOW_ID}")
    values = raw["values"]
    if not isinstance(values, list) or not isinstance(raw["claims"], list):
        raise NotImplementedError(f"fn2 values/claims container branch: Backflow {N03_BACKFLOW_ID}")
    if any(not isinstance(value, dict) for value in values):
        raise NotImplementedError(f"ValueFact decode branch: Backflow {N03_BACKFLOW_ID}")
    fields = raw["section_fields"]
    if not isinstance(fields, list):
        raise NotImplementedError(f"section_fields absence/null/type branch: Backflow {N03_BACKFLOW_ID}")

    has_f03_mode = _has_f03_carriers_or_null_applicability(raw)

    for field_index, field in enumerate(fields):
        if not isinstance(field, dict):
            raise NotImplementedError(f"F03 section_field decode branch: Backflow {N03_BACKFLOW_ID}")
        row, row_axes, row_problems = _build_f03_row(
            validated, field_index, field, has_f03_mode=has_f03_mode
        )
        row["axis_indices"] = list(range(len(axes), len(axes) + len(row_axes)))
        axes.extend(row_axes)
        rows.append(row)
        problems.extend(row_problems)

    for claim in raw["claims"]:
        if not isinstance(claim, dict):
            raise NotImplementedError(f"Claim record type branch: Backflow {N03_BACKFLOW_ID}")
        if not _binding_same(claim.get("binding"), binding):
            raise _f03_stop("claim_binding_mismatch", "Claim.binding does not match snapshot binding")

        matching_rows = [r for r in rows if _ref_same(claim.get("subject_ref"), r["field"].get("ref"))]
        if matching_rows and claim.get("kind") not in ("operation_deadline", "resource_capacity"):
            if len(matching_rows) != 1:
                raise _f03_stop("claim_multiple_field_rows", "Claim subject_ref matches multiple section_fields")
            target_row = matching_rows[0]
            matched = _evaluate_f03_claim_on_row(claim, target_row)
            if matched is not None:
                rule_num, matched_event = matched
                code, rule_ref, axis_name, backflow_owner, reason = _F03_RULE_SPECS[rule_num]
                participating_refs = [
                    *matched_event["original_refs"],
                    claim["subject_ref"],
                    *claim["basis_refs"],
                ]
                finding_idx = len(findings)
                findings.append(
                    {
                        "code": code,
                        "rule_ref": rule_ref,
                        "subject_ref": copy.deepcopy(claim["subject_ref"]),
                        "binding": copy.deepcopy(claim["binding"]),
                        "axis": axis_name,
                        "state": matched_event["state"],
                        "source_refs": _copy_refs_in_source_order(participating_refs),
                        "reason": reason,
                        "backflow_owner": backflow_owner,
                    }
                )
                target_row["finding_indices"].append(finding_idx)
            continue

        matching_values = [value_fact for value_fact in values if _same_claim_target(claim, value_fact)]
        if len(matching_values) != 1:
            raise NotImplementedError(f"Claim target must resolve to one same-frame ValueFact: Backflow {N03_BACKFLOW_ID}")
        value_fact = matching_values[0]
        rule = _n03_rule(claim, value_fact)
        rule_ref, axis_name, owner, reason = rule
        participating_refs = [
            ref for ref in [value_fact.get("ref"), claim.get("subject_ref"), *claim["basis_refs"]]
            if ref is not None
        ]
        finding = {
            "code": rule_ref.rsplit("-", 1)[-1],
            "rule_ref": rule_ref,
            "subject_ref": copy.deepcopy(claim["subject_ref"]),
            "binding": copy.deepcopy(claim["binding"]),
            "axis": axis_name,
            "state": "unknown",
            "source_refs": _copy_refs_in_source_order(participating_refs),
            "reason": reason,
            "backflow_owner": owner,
        }
        findings.append(finding)
        axes.append(
            {
                "subject_ref": copy.deepcopy(claim["subject_ref"]),
                "binding": copy.deepcopy(claim["binding"]),
                "axis": axis_name,
                "state": "unknown",
                "original_refs": _copy_refs_in_source_order(participating_refs),
                "reason": reason,
                "backflow_owner": owner,
            }
        )

    carried = [
        copy.deepcopy(axis)
        for axis in definitions["axes"]
        if isinstance(axis, dict) and axis.get("axis") in {"required section.definition", "required field.definition"}
    ]
    if carried:
        for row in rows:
            row["axis_indices"] = [index + len(carried) for index in row["axis_indices"]]
    public = _comparison(carried + axes, findings, "compare_values_and_applicability", binding)
    f03_comparison = _write_f03b_comparison_from_existing_comparison(public)
    return {"comparison": f03_comparison, "rows": rows, "problems": problems}
