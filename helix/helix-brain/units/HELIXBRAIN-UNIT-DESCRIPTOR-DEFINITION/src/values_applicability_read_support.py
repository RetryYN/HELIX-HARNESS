"""Shared F03 source, provenance, occurrence, and request-read helpers."""

from __future__ import annotations

import copy
from typing import Any

from descriptor_definitions import (
    _binding_same,
    _presence,
    _ref_same,
    _ref_shape_ok,
    _source_shape_ok,
    _source_usable,
    _tag_unsupported,
)

F03_BACKFLOW_ID = "HELIXBRAIN-L6-032-F03-FN2-PATH"

N03_BACKFLOW_ID = "HELIXBRAIN-L6-032-N03-PATH"


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
