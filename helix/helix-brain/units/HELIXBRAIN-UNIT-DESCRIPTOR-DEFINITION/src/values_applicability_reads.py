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
    _json_equal,
    _presence,
    _ref_same,
    _ref_shape_ok,
    _source_shape_ok,
    _source_usable,
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
    "meaning_refs_absent": "原owner対応fieldにmeaning_fact_refsが供給されていない。",
    "meaning_refs_null": "原owner対応fieldのmeaning_fact_refsは明示nullである。",
    "meaning_refs_type": "原owner対応fieldのmeaning_fact_refsがRef配列でない。",
    "meaning_refs_empty": "原owner対応fieldのmeaning_fact_refsは明示空配列である。",
    "meaning_positive": "固定frame/原fact/body/原理由/basisへ対応する肯定意味判断を保持する。",
}

_JUDGMENT_CAUSE_TABLE: dict[str, tuple[str, str, str]] = {
    "field_owner_unresolved": (
        "definition_unknown",
        "unknown",
        "同field/subject/full Binding/bodyの独立owner宣言を取得できない。",
    ),
    "meaning_refs_absent": (
        "definition_unknown",
        "unknown",
        "原owner対応fieldにmeaning_fact_refsが供給されていない。",
    ),
    "meaning_refs_null": (
        "definition_unknown",
        "unknown",
        "原owner対応fieldのmeaning_fact_refsは明示nullである。",
    ),
    "meaning_refs_type": (
        "definition_unknown",
        "unknown",
        "原owner対応fieldのmeaning_fact_refsがRef配列でない。",
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
    "target_unknown": (
        "definition_unknown",
        "unknown",
        "fieldの原descriptor targetを一意のslot対応へ結べない。",
    ),
    "selected_fact_unresolved": (
        "definition_unknown",
        "unknown",
        "選択した原意味Refを対応slotの実factへ結べない。",
    ),
    "attribution_unknown": (
        "definition_unknown",
        "unknown",
        "選択factの原owner帰属を解決できない。帰属から意味knownを生成しない。",
    ),
    "meaning_read_unresolved": (
        "definition_unknown",
        "unknown",
        "原意味readerの当該fact支持を取得できない。",
    ),
}


def _f03_stop(branch: str, detail: str) -> NotImplementedError:
    err = NotImplementedError(f"F03/{branch}: {detail}; Backflow {F03_BACKFLOW_ID}")
    err._n03_branch_tagged = True
    return err


def _f03_request(
    kind: str,
    field_locator: str,
    subject_ref: Any,
    binding: Any,
    request_locator: str,
    requested_ref: Any,
) -> dict[str, Any]:
    return {
        "kind": kind,
        "field_locator": field_locator,
        "subject_ref": _presence(subject_ref, present=subject_ref is not None),
        "binding": _presence(binding, present=binding is not None),
        "request_locator": request_locator,
        "requested_ref": _presence(requested_ref, present=requested_ref is not None),
    }


def _root_occurrences(
    raw: dict[str, Any], collection: str, requested_ref: Any
) -> list[dict[str, Any]]:
    if collection not in raw or not isinstance(raw[collection], list):
        raise _f03_stop(
            "carrier_or_source_record_shape", f"{collection} is absent or not an array"
        )
    rows = raw[collection]
    occurrences: list[dict[str, Any]] = []
    for index, row in enumerate(rows):
        if (
            not isinstance(row, dict)
            or not _ref_shape_ok(row.get("ref"))
            or (
                collection in ("values", "applicability_records")
                and row.get("source_ref") is not None
                and not _ref_shape_ok(row.get("source_ref"))
            )
        ):
            raise _f03_stop(
                "carrier_or_source_record_shape",
                f"/{collection}/{index} record or Ref shape branch",
            )
        if _ref_same(row.get("ref"), requested_ref):
            occurrences.append(
                {
                    "index": index,
                    "locator": f"/{collection}/{index}",
                    "original_value": copy.deepcopy(row),
                }
            )
    return occurrences


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
        raise _f03_stop(
            "carrier_or_source_record_shape", f"unclosed F03Problem cause: {cause}"
        )
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
    if "sources" not in raw or not isinstance(raw["sources"], list):
        raise _f03_stop(
            "carrier_or_source_record_shape", "sources is absent or not an array"
        )
    for source in raw["sources"]:
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
    for field in raw["section_fields"]:
        if isinstance(field, dict) and field.get("applicability_ref") is None:
            return True
    return False


def _provenance_refs_for_knowledge(
    raw: dict[str, Any], knowledge_ref: dict[str, Any]
) -> list[dict[str, Any]]:
    if "knowledge_records" not in raw or not isinstance(raw["knowledge_records"], list):
        raise _f03_stop(
            "carrier_or_source_record_shape",
            "knowledge_records is absent or not an array",
        )
    prov_refs: list[dict[str, Any]] = []
    for k_idx, krec in enumerate(raw["knowledge_records"]):
        if not isinstance(krec, dict):
            raise _f03_stop(
                "carrier_or_source_record_shape",
                f"/knowledge_records/{k_idx} is not an object",
            )
        if _ref_same(krec.get("ref"), knowledge_ref):
            if "provenance_refs" not in krec or not isinstance(
                krec["provenance_refs"], list
            ):
                raise _f03_stop(
                    "carrier_or_source_record_shape",
                    f"/knowledge_records/{k_idx}/provenance_refs is absent or not an array",
                )
            for pref in krec["provenance_refs"]:
                if not _ref_shape_ok(pref):
                    raise _f03_stop(
                        "carrier_or_source_record_shape",
                        f"/knowledge_records/{k_idx}/provenance_refs contains non-Ref",
                    )
                prov_refs.append(pref)
    return prov_refs


def _matching_semantic_sources(
    validated: dict[str, Any],
    binding: Any,
    source_ref: Any = None,
) -> list[tuple[int, dict[str, Any]]]:
    raw = validated.get("input")
    if not isinstance(raw, dict):
        raise _f03_stop(
            "carrier_or_source_record_shape",
            "semantic source selection requires the same ValidatedSupply",
        )
    if "sources" not in raw or not isinstance(raw["sources"], list):
        raise _f03_stop(
            "carrier_or_source_record_shape", "sources is not supplied as an array"
        )
    matches: list[tuple[int, dict[str, Any]]] = []
    for index, source in enumerate(raw["sources"]):
        if not isinstance(source, dict):
            raise _f03_stop(
                "carrier_or_source_record_shape", f"sources[{index}] is not an object"
            )
        if source.get("role") != "semantic_json":
            continue
        if not _source_shape_ok(source):
            raise _f03_stop(
                "carrier_or_source_record_shape",
                f"sources[{index}] is outside the typed Source shape",
            )
        content = source.get("content")
        if not isinstance(content, dict):
            raise _f03_stop(
                "carrier_or_source_record_shape",
                f"sources[{index}].content is not an object",
            )
        if source_ref is not None:
            if not _ref_same(source.get("ref"), source_ref):
                continue
        elif not _binding_same(content.get("binding"), binding):
            continue
        if not _source_usable(validated, source.get("ref")):
            raise _f03_stop(
                "carrier_or_source_record_shape",
                f"matching semantic source is unusable at /sources/{index}",
            )
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
    request = _f03_request(
        kind, field_locator, expected_subject, binding, request_locator, requested_ref
    )
    if requested_ref is None:
        if kind == "field_applicability":
            return {
                "request": request,
                "state": "unknown",
                "root_occurrences": [],
                "source_occurrences": [],
                "supports": [],
                "problems": [
                    _problem("app_null", request_locator, _presence(None, present=True))
                ],
            }
        raise _f03_stop(
            "carrier_or_source_record_shape",
            f"{kind} requested_ref is null at {request_locator}",
        )

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
            raise _f03_stop(
                "duplicate_conflicting_carrier_records",
                f"conflicting root records for {kind}",
            )

    effective_source_ref = source_ref
    if (
        effective_source_ref is None
        and roots
        and kind
        in ("value", "field_applicability", "value_applicability", "parent_section")
    ):
        cand_src = roots[0]["original_value"].get("source_ref")
        if isinstance(cand_src, dict):
            effective_source_ref = cand_src

    source_candidates = _matching_semantic_sources(
        validated, binding, effective_source_ref
    )
    problems: list[dict[str, Any]] = []
    source_occurrences: list[dict[str, Any]] = []
    supports: list[dict[str, int]] = []

    for source_index, source in source_candidates:
        content = source["content"]
        locator = f"/sources/{source_index}/content/{member}"
        if "binding" not in content:
            problems.append(
                _problem(
                    "lookup_unresolved",
                    f"/sources/{source_index}/content/binding",
                    _presence(present=False),
                    source.get("ref"),
                    source_index,
                )
            )
            continue
        if content.get("binding") is None or not isinstance(
            content.get("binding"), dict
        ):
            problems.append(
                _problem(
                    "null_or_type",
                    f"/sources/{source_index}/content/binding",
                    _presence(content.get("binding"), present=True),
                    source.get("ref"),
                    source_index,
                )
            )
            continue
        if not _binding_same(content.get("binding"), binding):
            problems.append(
                _problem(
                    "frame_differs",
                    f"/sources/{source_index}/content/binding",
                    _presence(content.get("binding"), present=True),
                    source.get("ref"),
                    source_index,
                )
            )
            continue
        if member not in content:
            cause = "field_owner_not_found" if kind == "field" else "container_absent"
            problems.append(
                _problem(
                    cause,
                    locator,
                    _presence(present=False),
                    source.get("ref"),
                    source_index,
                )
            )
            continue
        entries = content[member]
        if entries is None or not isinstance(entries, list):
            raise _f03_stop(
                "carrier_or_source_record_shape", f"{locator} is null or not an array"
            )
        if not entries:
            problems.append(
                _problem(
                    "lookup_unresolved",
                    locator,
                    _presence(entries, present=True),
                    source.get("ref"),
                    source_index,
                )
            )
            continue
        matched_in_source = False
        for rec_index, entry in enumerate(entries):
            if not isinstance(entry, dict):
                raise _f03_stop(
                    "carrier_or_source_record_shape",
                    f"{locator}/{rec_index} is not an object",
                )
            if kind == "field":
                if set(entry.keys()) != {"record"} or not isinstance(
                    entry.get("record"), dict
                ):
                    raise _f03_stop(
                        "carrier_or_source_record_shape",
                        f"{locator}/{rec_index} must be F03OwnerSectionFieldEntry",
                    )
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
                        raise _f03_stop(
                            "duplicate_conflicting_carrier_records",
                            f"{locator}/{rec_index} differs from root SectionField",
                        )
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
                    if not _ref_same(
                        rec.get("subject_ref"), expected_subject
                    ) or not _binding_same(rec.get("binding"), binding):
                        raise _f03_stop(
                            "duplicate_conflicting_carrier_records",
                            f"{locator}/{rec_index} subject or binding differs",
                        )
                    if _json_equal(root_val, rec):
                        supports.append(
                            {
                                "root_occurrence_index": root_occ_idx,
                                "source_occurrence_index": src_occ_idx,
                            }
                        )
                    else:
                        raise _f03_stop(
                            "duplicate_conflicting_carrier_records",
                            f"{locator}/{rec_index} body differs from root record",
                        )
        if not matched_in_source:
            problems.append(
                _problem(
                    "lookup_unresolved",
                    locator,
                    _presence(entries, present=True),
                    source.get("ref"),
                    source_index,
                )
            )

    if not roots and not source_candidates:
        problems.append(
            _problem(
                "lookup_unresolved",
                request_locator,
                _presence(requested_ref, present=requested_ref is not None),
            )
        )
    if roots and not source_candidates:
        cause = "field_owner_not_found" if kind == "field" else "lookup_unresolved"
        problems.append(
            _problem(
                cause,
                request_locator,
                _presence(requested_ref, present=requested_ref is not None),
            )
        )

    return {
        "request": request,
        "state": "resolved" if supports else "unknown",
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
        "descriptor_slot_ref": _presence(
            slot_ref, present="descriptor_slot_ref" in field
        ),
    }
    problems: list[dict[str, Any]] = []
    occurrences: list[dict[str, Any]] = []
    matches: list[dict[str, Any]] = []

    if not has_f03_mode:
        sources = _matching_semantic_sources(validated, binding)
        for source_index, source in sources:
            locator = f"/sources/{source_index}/content/descriptor_targets"
            if "descriptor_targets" not in source["content"]:
                problems.append(
                    _problem(
                        "container_absent",
                        locator,
                        _presence(present=False),
                        source.get("ref"),
                        source_index,
                    )
                )
        return {
            "field_locator": field_locator,
            "request": request,
            "state": "unknown",
            "occurrences": [],
            "matches": [],
            "problems": problems,
        }

    if "sources" not in raw or not isinstance(raw["sources"], list):
        raise _f03_stop(
            "carrier_or_source_record_shape", "sources is absent or not an array"
        )
    if "descriptors" not in raw or not isinstance(raw["descriptors"], list):
        raise _f03_stop(
            "carrier_or_source_record_shape", "descriptors is absent or not an array"
        )
    prov_refs = _provenance_refs_for_knowledge(raw, binding["knowledge_ref"])

    for source_index, source in enumerate(raw["sources"]):
        if not isinstance(source, dict):
            raise _f03_stop(
                "carrier_or_source_record_shape",
                f"sources[{source_index}] is not an object",
            )
        if source.get("role") != "semantic_json":
            continue
        if not _source_shape_ok(source) or not isinstance(source.get("content"), dict):
            raise _f03_stop(
                "carrier_or_source_record_shape",
                f"sources[{source_index}] invalid semantic source shape",
            )
        content = source["content"]
        if not _source_usable(validated, source.get("ref")):
            if _binding_same(content.get("binding"), binding):
                raise _f03_stop(
                    "carrier_or_source_record_shape",
                    f"matching semantic source unusable at /sources/{source_index}",
                )
            continue
        is_in_prov = any(_ref_same(pref, source.get("ref")) for pref in prov_refs)
        locator = f"/sources/{source_index}/content/descriptor_targets"
        if "descriptor_targets" not in content:
            if _binding_same(content.get("binding"), binding):
                problems.append(
                    _problem(
                        "container_absent",
                        locator,
                        _presence(present=False),
                        source.get("ref"),
                        source_index,
                        relevance="target" if is_in_prov else "source_unattributed",
                    )
                )
            continue
        if not is_in_prov:
            problems.append(
                _problem(
                    "qualification_unresolved",
                    locator,
                    _presence(content["descriptor_targets"], present=True),
                    source.get("ref"),
                    source_index,
                    relevance="source_unattributed",
                )
            )
            continue
        raw_targets = content["descriptor_targets"]
        if raw_targets is None or not isinstance(raw_targets, list):
            raise _f03_stop(
                "carrier_or_source_record_shape", f"{locator} is null or not an array"
            )
        if not raw_targets:
            problems.append(
                _problem(
                    "lookup_unresolved",
                    locator,
                    _presence(raw_targets, present=True),
                    source.get("ref"),
                    source_index,
                )
            )
            continue
        for decl_index, decl in enumerate(raw_targets):
            decl_locator = f"{locator}/{decl_index}"
            if (
                not isinstance(decl, dict)
                or set(decl.keys())
                != {"target_ref", "slot_identity", "descriptor_kind"}
                or not _ref_shape_ok(decl.get("target_ref"))
                or not isinstance(decl.get("slot_identity"), str)
                or decl.get("descriptor_kind") not in _APPROVED_KINDS
            ):
                raise _f03_stop(
                    "carrier_or_source_record_shape",
                    f"{decl_locator} invalid F03BOwnerDescriptorTarget",
                )
            typed_decl = _presence(copy.deepcopy(decl), present=True)
            occurrences.append(
                {
                    "source_ref": _presence(source.get("ref"), present=True),
                    "source_index": source_index,
                    "source_locator": f"/sources/{source_index}",
                    "declaration_locator": decl_locator,
                    "declaration": copy.deepcopy(decl),
                    "source_binding": _presence(
                        content.get("binding"), present="binding" in content
                    ),
                    "typed_declaration": typed_decl,
                }
            )
            if _binding_same(content.get("binding"), binding) and _ref_same(
                decl["target_ref"], slot_ref
            ):
                slot_locators = [
                    f"/descriptors/{s_idx}"
                    for s_idx, s_obj in enumerate(raw["descriptors"])
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
        raise _f03_stop(
            "duplicate_conflicting_carrier_records",
            "multiple target matches in F03FieldTargetRead",
        )

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
        raise _f03_stop(
            "meaning_operation_shape",
            f"normative frame for kind {kind} not in F03 slice",
        )
    normative_frame = {
        "revision": _NORMATIVE_SNAPSHOT_META["revision"],
        "path": _NORMATIVE_SNAPSHOT_META["path"],
        "file_sha256": _NORMATIVE_SNAPSHOT_META["file_sha256"],
        "catalog_pointer": _NORMATIVE_SNAPSHOT_META["catalog_pointer"],
        "catalog_canonical_sha256": _NORMATIVE_SNAPSHOT_META[
            "catalog_canonical_sha256"
        ],
        "scope": copy.deepcopy(_NORMATIVE_SNAPSHOT_META["scope"]),
        "entry_pointer": entry_meta["entry_pointer"],
        "entry_canonical_sha256": entry_meta["entry_canonical_sha256"],
        "entry_value": copy.deepcopy(entry_meta["entry_value"]),
    }

    if "sources" not in raw or not isinstance(raw["sources"], list):
        raise _f03_stop(
            "carrier_or_source_record_shape", "sources is absent or not an array"
        )
    prov_refs = _provenance_refs_for_knowledge(raw, binding["knowledge_ref"])

    occurrences: list[dict[str, Any]] = []
    supports: list[dict[str, Any]] = []
    problems: list[dict[str, Any]] = []

    for source_index, source in enumerate(raw["sources"]):
        if not isinstance(source, dict):
            raise _f03_stop(
                "carrier_or_source_record_shape",
                f"sources[{source_index}] is not an object",
            )
        if source.get("role") != "semantic_json":
            continue
        if not _source_shape_ok(source) or not isinstance(source.get("content"), dict):
            raise _f03_stop(
                "carrier_or_source_record_shape",
                f"sources[{source_index}] invalid semantic source shape",
            )
        content = source["content"]
        if not _binding_same(content.get("binding"), binding):
            continue
        if not _source_usable(validated, source.get("ref")):
            raise _f03_stop(
                "carrier_or_source_record_shape",
                f"matching semantic source unusable at /sources/{source_index}",
            )
        if not any(_ref_same(pref, source.get("ref")) for pref in prov_refs):
            problems.append(
                {
                    "cause": "source_unresolved",
                    "source_ref": _presence(
                        source.get("ref"), present=isinstance(source.get("ref"), dict)
                    ),
                    "source_index": source_index,
                    "locator": f"/sources/{source_index}",
                    "original_value": _presence(
                        source.get("ref"), present=isinstance(source.get("ref"), dict)
                    ),
                    "reason": "当該sourceがknowledge_refのprovenance_refsに掲載されていない。",
                }
            )
            continue
        if "definition_meaning_operations" not in content:
            problems.append(
                {
                    "cause": "container_absent",
                    "source_ref": _presence(
                        source.get("ref"), present=isinstance(source.get("ref"), dict)
                    ),
                    "source_index": source_index,
                    "locator": f"/sources/{source_index}/content/definition_meaning_operations",
                    "original_value": _presence(present=False),
                    "reason": "owner原sourceにdefinition_meaning_operationsが供給されていない。",
                }
            )
            continue
        ops = content["definition_meaning_operations"]
        if ops is None or not isinstance(ops, list):
            raise _f03_stop(
                "meaning_operation_shape",
                f"/sources/{source_index}/content/definition_meaning_operations is invalid",
            )
        for rec_index, op in enumerate(ops):
            loc = f"/sources/{source_index}/content/definition_meaning_operations/{rec_index}"
            if (
                not isinstance(op, dict)
                or set(op.keys()) != {"operation_ref", "arguments", "decision"}
                or not isinstance(op.get("arguments"), dict)
                or not isinstance(op.get("decision"), dict)
            ):
                raise _f03_stop(
                    "meaning_operation_shape",
                    f"{loc} invalid F03BDefinitionMeaningOperation",
                )
            args = op["arguments"]
            dec = op["decision"]
            if (
                set(args.keys())
                != {
                    "binding",
                    "slot_identity",
                    "descriptor_kind",
                    "fact_ref",
                    "fact_body",
                    "normative_argument",
                }
                or set(dec.keys())
                != {"relation", "reason", "raw_semantic_basis", "basis_refs"}
                or dec.get("relation")
                not in (
                    "defines_descriptor",
                    "does_not_define_descriptor",
                    "undetermined",
                )
                or not isinstance(dec.get("reason"), dict)
                or (
                    dec["reason"] != {"presence": "absent"}
                    and (
                        set(dec["reason"].keys()) != {"presence", "value"}
                        or dec["reason"].get("presence") != "supplied"
                        or not isinstance(dec["reason"].get("value"), str)
                    )
                )
                or not isinstance(dec.get("raw_semantic_basis"), dict)
                or (
                    dec["raw_semantic_basis"] != {"presence": "absent"}
                    and (
                        set(dec["raw_semantic_basis"].keys()) != {"presence", "value"}
                        or dec["raw_semantic_basis"].get("presence") != "supplied"
                        or dec["raw_semantic_basis"].get("value") is None
                    )
                )
                or not isinstance(dec.get("basis_refs"), list)
                or any(not _ref_shape_ok(r) for r in dec["basis_refs"])
            ):
                raise _f03_stop(
                    "meaning_operation_shape",
                    f"{loc} invalid arguments/decision members",
                )
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
            if not _ref_same(args["fact_ref"], fact["ref"]):
                problems.append(
                    {
                        "cause": "fact_differs",
                        "source_ref": _presence(
                            source.get("ref"),
                            present=isinstance(source.get("ref"), dict),
                        ),
                        "source_index": source_index,
                        "locator": f"{loc}/arguments/fact_ref",
                        "original_value": _presence(args["fact_ref"], present=True),
                        "reason": "operationのfact_refが当該選択factと異なる。",
                    }
                )
                continue
            if (
                _binding_same(args["binding"], binding)
                and args["slot_identity"] == slot["slot_identity"]
                and args["descriptor_kind"] == kind
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
                raise _f03_stop(
                    "meaning_operation_shape",
                    f"{loc} arguments or normative_frame mismatch",
                )

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
