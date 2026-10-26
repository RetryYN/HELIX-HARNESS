"""fn3 descriptor trace predicates の読取を担う。"""
from __future__ import annotations
import copy
from typing import Any
from descriptor_definitions import (
    _binding_same,
    _json_equal,
    _ref_same,
    _wire_binding_shape_ok,
    _wire_ref_shape_ok,
)
from identity_trace_support import (
    _fn3_axis,
    _fn3_diag,
    _fn3_finding,
    _fn3_predicate_finding_reason,
    _fn3_qualification_rows,
    _fn3_qualified_owner_source,
    _fn3_root_rows,
    _fn3_scope_same,
    _fn3_stop,
    _fn3_valid_source,
)

def _fn3_trace(raw: dict[str, Any], binding: dict[str, Any], unusable: list[Any],
               axes: list[dict[str, Any]], findings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Resolve only direct slot/fact/record/provenance/source/body/Q/root links."""
    reads: list[dict[str, Any]] = []
    slots = raw.get("descriptors")
    records = raw.get("knowledge_records")
    if not isinstance(slots, list):
        raise _fn3_stop("unclosed/descriptor_slots_absent", "descriptor slot collection is absent or not an array")
    if not isinstance(records, list):
        raise _fn3_stop("unclosed/knowledge_records_absent", "knowledge_records collection is absent or not an array")
    if not isinstance(raw.get("claims", []), list):
        raise _fn3_stop("unclosed/identity_claim", "claims is not an array")
    sources = raw.get("sources") if isinstance(raw.get("sources"), list) else []
    for si, slot in enumerate(slots):
        if not isinstance(slot, dict) or not isinstance(slot.get("facts"), list):
            continue
        slot_binding = slot.get("binding")
        if "binding" not in slot:
            raise _fn3_stop("unclosed/slot_binding_absent", f"/descriptors/{si}/binding is absent or not an object")
        if not _wire_binding_shape_ok(slot_binding):
            raise _fn3_stop("unclosed/slot_binding_unformed", f"/descriptors/{si}/binding is outside the closed wire Binding shape")
        for fi, fact in enumerate(slot["facts"]):
            if not isinstance(fact, dict):
                continue
            locator = f"/descriptors/{si}/facts/{fi}"
            if not _wire_ref_shape_ok(fact.get("ref")):
                raise _fn3_stop("unclosed/fact_subject_unformed", f"{locator}/ref does not form a wire Ref")
            if ("source_ref" in fact and fact["source_ref"] is not None
                    and not _wire_ref_shape_ok(fact["source_ref"])):
                raise _fn3_stop("unclosed/fact_source_ref_unformed", f"{locator}/source_ref does not form a wire Ref")
            slot_locator = f"/descriptors/{si}"
            slot_kref = slot_binding.get("knowledge_ref")
            fact_binding = fact.get("binding") if isinstance(fact.get("binding"), dict) else {}
            fact_kref = fact_binding.get("knowledge_ref")
            fact_source_ref = fact.get("source_ref")
            source_ref_joinable = (
                _wire_ref_shape_ok(fact_source_ref)
                and all(fact_source_ref.get(key) is not None for key in ("identity", "revision", "scope", "owner"))
            )
            if not isinstance(slot_kref, dict) or slot_kref.get("revision") is None:
                raise _fn3_stop("F04-NEG-02/revision_absent", "trace slot knowledge Ref lacks a supplied revision")
            record_candidates = [(ri, rec) for ri, rec in enumerate(records)
                                 if isinstance(rec, dict) and _ref_same(rec.get("ref"), slot_kref)]
            if len(record_candidates) > 1 and any(
                    not _json_equal(record_candidates[0][1], candidate[1])
                    for candidate in record_candidates[1:]):
                raise _fn3_stop("unclosed/distinct_knowledge_records",
                                f"multiple distinct KnowledgeRecords match {slot_locator}/binding/knowledge_ref")
            record_reads = [{"index": ri, "locator": f"/knowledge_records/{ri}",
                             "original_read": {"presence": "supplied", "value": copy.deepcopy(rec)}}
                            for ri, rec in record_candidates]
            prov_rows: list[dict[str, Any]] = []
            source_indices: list[int] = []
            body_groups: list[dict[str, Any]] = []
            chains: list[dict[str, Any]] = []
            any_source = False
            any_qualified = False
            any_body = False
            for ri, rec in record_candidates:
                if "provenance_refs" not in rec:
                    raise _fn3_stop("unclosed/knowledge_provenance_absent",
                                    f"/knowledge_records/{ri}/provenance_refs is absent")
                provs = rec["provenance_refs"]
                if provs is None:
                    raise _fn3_stop("unclosed/knowledge_provenance_null",
                                    f"/knowledge_records/{ri}/provenance_refs is null")
                if not isinstance(provs, list):
                    raise _fn3_stop("unclosed/knowledge_provenance_type",
                                    f"/knowledge_records/{ri}/provenance_refs is not an array")
                for pi, pref in enumerate(provs):
                    matching_sources = [(idx, src) for idx, src in enumerate(sources)
                                        if isinstance(src, dict) and _ref_same(src.get("ref"), pref)]
                    provrow = {"knowledge_record_index": ri, "provenance_index": pi,
                               "locator": f"/knowledge_records/{ri}/provenance_refs/{pi}",
                               "original_read": {"presence": "supplied", "value": copy.deepcopy(pref)},
                               "relation": "corresponding" if matching_sources else "unestablished"}
                    prov_rows.append(provrow)
                    for source_index, source in matching_sources:
                        any_source = True
                        if source_index not in source_indices:
                            source_indices.append(source_index)
                        content = source.get("content")
                        if not _fn3_qualified_owner_source(raw, source_index, source, unusable):
                            continue
                        any_qualified = True
                        if not isinstance(content, dict) or not _binding_same(content.get("binding"), slot_binding):
                            continue
                        groups = content.get("descriptor_facts")
                        if not isinstance(groups, list):
                            continue
                        for gi, group in enumerate(groups):
                            if not isinstance(group, dict) or not isinstance(group.get("facts"), list):
                                continue
                            gloc = f"/sources/{source_index}/content/descriptor_facts/{gi}"
                            if not any(x.get("locator") == gloc for x in body_groups):
                                body_groups.append({"index": source_index, "locator": gloc,
                                                    "original_read": {"presence": "supplied", "value": copy.deepcopy(group)}})
                            for inner_index, inner_fact in enumerate(group["facts"]):
                                if not isinstance(inner_fact, dict):
                                    continue
                                if not _ref_same(inner_fact.get("ref"), fact.get("ref")):
                                    continue
                                any_body = True
                                # Each relation is a direct comparison; no null-digest intermediary is reused.
                                if not _ref_same(inner_fact.get("source_ref"), source.get("ref")):
                                    continue
                                if not _ref_same(fact.get("source_ref"), source.get("ref")):
                                    continue
                                if not _binding_same(fact_binding, slot_binding):
                                    continue
                                if not _binding_same(inner_fact.get("binding"), slot_binding):
                                    continue
                                if not _ref_same(fact_kref, rec.get("ref")):
                                    continue
                                qref = source.get("qualification_ref")
                                for qi, qual in _fn3_qualification_rows(raw, qref):
                                    if not _ref_same(qual.get("subject_ref"), source.get("ref")):
                                        continue
                                    if not _fn3_valid_source(raw, source, unusable):
                                        continue
                                    roots = _fn3_root_rows(raw, qual.get("root_ref"))
                                    for root_index, root in roots:
                                        chains.append({"knowledge_record_index": ri, "provenance_index": pi,
                                                       "source_index": source_index, "qualification_index": qi,
                                                       "root_index": root_index, "record": rec, "provenance": pref,
                                                       "source": source, "qualification": qual, "root": root,
                                                       "body_group_index": gi, "inner_fact_index": inner_index})
            fact_mixed = (isinstance(fact_kref, dict) and isinstance(slot_kref, dict)
                          and all(fact_kref.get(k) is not None and slot_kref.get(k) is not None
                                  and _json_equal(fact_kref.get(k), slot_kref.get(k)) for k in ("identity", "scope", "owner"))
                          and not _json_equal(fact_kref.get("revision"), slot_kref.get("revision")))
            # Preserve all physically distinct chain rows in source order; repeated Qs remain
            # occurrences, while a shared physical source/root is listed once in its read column.
            slot_scope = slot_binding.get("template_ref", {}).get("scope") if isinstance(slot_binding.get("template_ref"), dict) else None
            for chain in chains:
                if not _fn3_scope_same(chain["source"].get("ref", {}).get("scope"), slot_scope):
                    chain["scope_mismatch"] = True
            state = "resolved" if chains else "unknown"
            cause = "original_trace_corresponding" if chains else (
                "knowledge_unresolved" if not record_candidates else
                "source_unresolved" if not source_ref_joinable or not any_source else "qualification_unresolved" if not any_qualified
                else "body_unresolved" if not any_body else "knowledge_unresolved")
            if fact_mixed:
                state, cause = "conflict", "mixed_knowledge_revision"
                mixed_observations = [
                    (locator + "/binding/knowledge_ref", "fact knowledge Ref"),
                    (slot_locator + "/binding/knowledge_ref", "slot knowledge Ref"),
                ]
                findings.append(_fn3_finding("mixed_knowledge_revision", fact.get("ref"), slot_binding,
                                             "descriptor.trace", "conflict", [fact.get("source_ref")] if isinstance(fact.get("source_ref"), dict) else [],
                                             _fn3_predicate_finding_reason(raw, "mixed_knowledge_revision",
                                                                           mixed_observations)))
            if (source_ref_joinable and not any(_ref_same(src.get("ref"), fact_source_ref)
                                                for src in sources if isinstance(src, dict))):
                source_observations = [("/sources", "source collection presence"),
                                       (locator + "/source_ref", "fact source Ref")]
                source_observations.extend((f"/sources/{source_index}/ref", "supplied source Ref")
                                           for source_index, source in enumerate(sources)
                                           if isinstance(source, dict) and isinstance(source.get("ref"), dict))
                findings.append(_fn3_finding("source_missing", binding.get("template_ref"), binding, "source", "missing",
                                             [fact_source_ref],
                                             _fn3_predicate_finding_reason(raw, "source_missing", source_observations)))
            if isinstance(fact_kref, dict) and isinstance(slot_kref, dict) and not _ref_same(fact_kref, slot_kref):
                current = binding.get("knowledge_ref")
                old_records = [(idx, rec) for idx, rec in record_candidates if _ref_same(rec.get("ref"), slot_kref)]
                superseded = any(isinstance(rel, dict) and rel.get("kind") == "supersedes"
                                 and any(_ref_same(rel.get("from_ref"), rec.get("ref")) for _, rec in old_records)
                                 and _ref_same(rel.get("to_ref"), fact_kref)
                                 for rel in raw.get("relations", []) if isinstance(raw.get("relations"), list))
                if old_records and not superseded:
                    state, cause = "conflict", "mixed_knowledge_revision"
                    silent_observations = [
                        (locator + "/binding/knowledge_ref", "new fact knowledge Ref"),
                        (slot_locator + "/binding/knowledge_ref", "original slot knowledge Ref"),
                    ]
                    silent_observations.extend((f"/knowledge_records/{old_index}/ref", "original KnowledgeRecord Ref")
                                               for old_index, _old_record in old_records)
                    relations = raw.get("relations")
                    if isinstance(relations, list) and relations:
                        silent_observations.extend((f"/relations/{relation_index}", "original relation occurrence")
                                                   for relation_index, _relation in enumerate(relations))
                    else:
                        silent_observations.append(("/relations", "relation collection presence"))
                    findings.append(_fn3_finding("silent_supersession", fact.get("ref"), slot_binding,
                                                 "descriptor.trace", "conflict", [fact.get("source_ref")] if isinstance(fact.get("source_ref"), dict) else [],
                                                 _fn3_predicate_finding_reason(raw, "silent_supersession",
                                                                               silent_observations)))
            if any(c.get("scope_mismatch") for c in chains):
                state, cause = "conflict", "scope_differs"
            # Build the fixed 9-key per-chain trace material.
            chain_material = [{"descriptor_kind": slot.get("descriptor_kind"), "fact_locator": locator,
                               "knowledge_record_index": c["knowledge_record_index"],
                               "provenance_index": c["provenance_index"],
                               "qualification_index": c["qualification_index"], "root_index": c["root_index"],
                               "slot_identity": slot.get("slot_identity"), "slot_locator": slot_locator,
                               "source_index": c["source_index"]} for c in chains]
            if len(chain_material) == 1:
                material = chain_material[0]
            elif chain_material:
                material = {"trace_occurrences": chain_material}
            else:
                material = {"cause": cause, "request": {"slot_locator": slot_locator, "fact_locator": locator},
                            "state": state, "slot_presence": "supplied", "slot_is_null": False,
                            "fact_presence": "supplied", "fact_is_null": False,
                            "knowledge_record_indices": [i for i, _ in record_candidates],
                            "provenance_indices": [{"knowledge_record_index": p["knowledge_record_index"],
                                                     "provenance_index": p["provenance_index"]} for p in prov_rows],
                            "source_indices": sorted(source_indices),
                            "body_group_locators": [g["locator"] for g in body_groups]}
            reason_prefix = ("原slot/fact/source/provenance/資格frameの対応を保持する。意味完成又は利用許可ではない。"
                             if chains else cause)
            reason = _fn3_diag(reason_prefix, material)
            refs = [fact.get("ref"), fact.get("source_ref"), slot_kref]
            for c in chains:
                refs.extend([c["record"].get("ref"), c["provenance"], c["source"].get("ref"),
                             c["source"].get("qualification_ref"), c["qualification"].get("ref"), c["root"]])
            axis_refs = [r for r in refs if isinstance(r, dict)]
            axes.append(_fn3_axis(fact.get("ref"), slot_binding, "descriptor.trace", state, axis_refs, reason, None))
            reads.append({"request": {"slot_locator": slot_locator, "fact_locator": locator},
                          "slot_read": {"presence": "supplied", "value": copy.deepcopy(slot)},
                          "fact_read": {"presence": "supplied", "value": copy.deepcopy(fact)},
                          "knowledge_records": record_reads, "provenance_refs": prov_rows,
                          "source_indices": sorted(source_indices), "body_groups": body_groups,
                          "state": state, "cause": cause})
    return reads
