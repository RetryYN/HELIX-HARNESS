"""fn3公開入口と、同一snapshotから各fn3責務を統合する。"""
from __future__ import annotations
import copy
from typing import Any
from descriptor_definitions import (
    _comparison,
    _json_equal,
)
from identity_trace_actual import (
    _fn3_actual_axes,
)
from identity_trace_bilateral import (
    _fn3_compatibility,
    _fn3_endpoint_owner_reads,
)
from identity_trace_claims import (
    _fn3_identity_claim_findings,
)
from identity_trace_projection import (
    _fn3_validate_private_return,
)
from identity_trace_reader import (
    _fn3_trace,
)
from identity_trace_support import (
    _fn3_finding,
    _fn3_predicate_finding_reason,
    _fn3_qualification_rows,
    _fn3_root_rows,
    _fn3_source_rows,
    _fn3_stop,
    _fn3_valid_source,
    _fn3_write_predicate_axes,
)

def compare_identity_versions_and_trace(context: dict[str, object]) -> dict[str, object]:
    """fn3: 同じfn0 ValidatedSupplyから有限actual/trace/bilateral readを射影する。"""
    if not isinstance(context, dict):
        raise _fn3_stop("F04/N01/validated_context", "IdentityContext is not an object")
    validated = context.get("validated")
    if not isinstance(validated, dict) or "input" not in validated:
        raise _fn3_stop("F04/N01/validated_context", "IdentityContext.validated is absent")
    unusable = validated.get("unusable_source_refs")
    if not isinstance(unusable, list):
        raise _fn3_stop("F04/N01/unusable_source_refs", "fn0 source disposition is absent or not an array")
    raw = validated.get("input")
    if raw is None:
        return _comparison([], [], "compare_identity_versions_and_trace", None)
    if not isinstance(raw, dict):
        raise _fn3_stop("F04/N01/validated_input", "ValidatedSupply.input is not an object or null")
    before = copy.deepcopy(raw)
    binding_read = raw.get("binding")
    binding = binding_read if isinstance(binding_read, dict) else {}
    dependencies = binding.get("pack_dependency_versions")
    if dependencies:
        raise _fn3_stop(f"unclosed/nonempty_dependency/{len(dependencies)}", "pack dependency version observations are outside the fixed branch")
    axes: list[dict[str, Any]] = []
    findings: list[dict[str, Any]] = []
    actual_reads = _fn3_actual_axes(raw, binding, unusable, axes, findings)
    trace_reads = _fn3_trace(raw, binding, unusable, axes, findings)
    _fn3_identity_claim_findings(raw, binding, unusable, findings, trace_reads)
    bilateral_reads = _fn3_compatibility(raw, binding, unusable, axes, findings)
    template_ref = binding.get("template_ref")
    if isinstance(template_ref, dict) and template_ref.get("scope") is None:
        findings.append(_fn3_finding(
            "scope_missing", template_ref, binding, "scope", "missing", [],
            _fn3_predicate_finding_reason(raw, "scope_missing",
                                          [("/binding/template_ref/scope", "scope")]))
        )
    rule_order = {
        "source_missing": 0, "version_missing": 1, "scope_missing": 2,
        "compatibility_unknown": 3, "compatibility_mismatch": 4,
        "oracle_revision_mismatch": 5, "image_identity_inference": 6,
        "tool_node_identity_inference": 7, "filename_identity_join": 8,
        "version_target_as_actual": 9, "mixed_knowledge_revision": 10,
        "silent_supersession": 11,
    }
    findings.sort(key=lambda row: rule_order.get(row.get("code"), len(rule_order)))
    _fn3_write_predicate_axes(findings, axes)
    if not _json_equal(raw, before):
        raise AssertionError("fn3 mutated the supplied immutable snapshot")
    # Keep the private reader result closed and local; only its Comparison is public.
    observed_source_indices = {i for read in trace_reads for i in read.get("source_indices", [])}
    for read in actual_reads:
        observed_source_indices.update(row["source_index"] for row in read.get("observations", [])
                                       if isinstance(row, dict) and isinstance(row.get("source_index"), int))
    for read in bilateral_reads:
        for ref in read.get("sources", []):
            observed_source_indices.update(i for i, _source in _fn3_source_rows(raw, ref))
    source_qualification_reads = []
    for source_index, source in enumerate(raw.get("sources", [])):
        if source_index not in observed_source_indices:
            continue
        if not isinstance(source, dict):
            continue
        qrows = _fn3_qualification_rows(raw, source.get("qualification_ref"))
        qualification_occurrences = [
            {"index": qi, "locator": f"/qualifications/{qi}",
             "original_read": {"presence": "supplied", "value": copy.deepcopy(q)}}
            for qi, q in qrows
        ]
        root_occurrences = []
        seen_root_indices = set()
        for _qi, q in qrows:
            root_ref = q.get("root_ref")
            for ri, root in _fn3_root_rows(raw, root_ref):
                if ri not in seen_root_indices:
                    seen_root_indices.add(ri)
                    root_occurrences.append({"index": ri, "locator": f"/qualification_roots/{ri}",
                                             "original_read": {"presence": "supplied", "value": copy.deepcopy(root)}})
        usable = _fn3_valid_source(raw, source, unusable)
        source_qualification_reads.append({
            "source_index": source_index,
            "source": {"index": source_index, "locator": f"/sources/{source_index}",
                       "original_read": {"presence": "supplied", "value": copy.deepcopy(source)}},
            "qualifications": qualification_occurrences, "roots": root_occurrences,
            "fn0_disposition": "usable" if usable else "unusable",
            "state": "resolved" if usable else "unknown",
        })
    private_bilateral_reads = []
    for index, read in enumerate(bilateral_reads):
        record = read.get("record")
        owner_reads = []
        if isinstance(record, dict):
            owner_reads.extend(_fn3_endpoint_owner_reads(raw, record, unusable, "left"))
            owner_reads.extend(_fn3_endpoint_owner_reads(raw, record, unusable, "right"))
        private_bilateral_reads.append({
            "request": {"record_locator": f"/compatibility_records/{read.get('record_index', index)}"},
            "record_read": {"presence": "supplied", "value": copy.deepcopy(record)},
            "owner_reads": owner_reads, "state": read["state"],
            "cause": ("bilateral_owner_unresolved" if read["cause"] == "owner_decision_unresolved" else read["cause"]),
        })
    private_return = {
        "comparison": _comparison(axes, findings, "compare_identity_versions_and_trace",
                                  binding_read if isinstance(binding_read, dict) else None),
        "source_qualifications": source_qualification_reads, "actual_operands": actual_reads,
        "descriptor_traces": trace_reads, "bilateral_pairs": private_bilateral_reads,
    }
    _fn3_validate_private_return(private_return)
    return copy.deepcopy(private_return["comparison"])
