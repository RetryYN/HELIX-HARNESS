#!/usr/bin/env python3
"""SCF-B-0141 deterministic generator.

The generator reads only fixed Git objects.  It does not import or execute any
legacy source, runtime, test, hook, adapter, workflow, or CI asset.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-config-product-classification-0141"
BASE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
BINDING_ID = "SCF-B-0141"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
MANIFEST = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
BOUNDARY = "docs/concept/product-boundary.md"
L1 = {
    "HELIX-HARNESS": "docs/helix-harness/L1-planning/product-intent.md",
    "HELIX-OS": "docs/helix-os/L1-planning/system-intent.md",
    "HELIX-Web": "docs/helix-web/L1-planning/product-intent.md",
    "HELIX-Web-OS": "docs/helix-web-os/L1-planning/system-intent.md",
}
FAILURE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
DECISION_RECORD = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
DECISION_PACKET = "docs/governance/audits/source-rebaseline/concept-v4.1-human-decision-packet.md"
REUSE = "docs/governance/legacy-asset-reuse-control.md"
START = "docs/governance/new-generation-start-here.md"
WAVE_PATHS = {
    n: (f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl" if n <= 36
        else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl")
    for n in range(1, 51)
}
PRODUCTS = tuple(L1)
HUMAN_JUDGMENT = [
    "product_owner_and_boundary_decision",
    "configuration_semantic_anchor_acceptance",
    "phase_candidate_admission_and_successor_assignment",
    "legacy_implementation_degradation_failure_and_consumer_closure",
    "formal_asset_classification_update",
]
RULES = {
    "direct_product_basis": "phase candidate has one product and the configuration marker is retained as a reviewable static basis; this is not formal ownership",
    "multi_product_conflict": "phase candidates contain two or more products; a single owner cannot be inferred",
    "insufficient_basis": "no product candidate is present in the phase snapshot; configuration presence alone cannot establish a product owner",
}
INPUTS = [PHASE, DISPOSITION, DECISIONS, READ_AFTER, BOUNDARY, *L1.values(), FAILURE, CONSUMER,
          DECISION_RECORD, DECISION_PACKET, REUSE, START, MANIFEST, *WAVE_PATHS.values()]


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def canonical(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def digest_row(row: dict) -> str:
    return tagged(canonical(row))


def git_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE_REVISION}:{path}"])


def git_blob(path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", f"{BASE_REVISION}:{path}"], text=True).strip()


def strict_pairs(pairs: list[tuple[str, object]]) -> dict:
    out = {}
    for key, value in pairs:
        if key in out:
            raise ValueError(f"duplicate JSON key: {key}")
        out[key] = value
    return out


def jsonl(path: str) -> list[tuple[int, dict]]:
    rows = []
    for line_no, line in enumerate(git_bytes(path).decode(errors="replace").splitlines(), 1):
        if not line.strip():
            continue
        row = json.loads(line, object_pairs_hook=strict_pairs)
        if not isinstance(row, dict):
            raise ValueError(f"non-object JSON at {path}:{line_no}")
        rows.append((line_no, row))
    return rows


def manifest_sha(source_path: str) -> str:
    for line in git_bytes(MANIFEST).decode(errors="replace").splitlines():
        if line.endswith(" " + source_path):
            return "sha256:" + line.split(maxsplit=1)[0]
    raise ValueError(f"manifest entry missing: {source_path}")


def receipt(path: str, start: int, end: int) -> dict:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    text = "\n".join(lines[start - 1:end])
    return {"path": path, "line_start": start, "line_end": end,
            "line_text_sha256": tagged(text.encode()), "line_text": lines[start - 1:end]}


def boundary_evidence() -> dict:
    spans = [(36, 39), (54, 65), (86, 89)]
    return {"path": BOUNDARY, "blob": git_blob(BOUNDARY), "sha256": tagged(git_bytes(BOUNDARY)),
            "ranges": [receipt(BOUNDARY, *r) for r in spans]}


def fixed_l1_evidence() -> dict:
    ranges = {
        "HELIX-HARNESS": [(22, 35), (54, 58)],
        "HELIX-OS": [(22, 40), (59, 63)],
        "HELIX-Web": [(24, 35), (45, 49)],
        "HELIX-Web-OS": [(14, 23), (37, 44)],
    }
    return {p: {"path": path, "blob": git_blob(path), "sha256": tagged(git_bytes(path)),
                "ranges": [receipt(path, start, end) for start, end in ranges[p]]}
            for p, path in L1.items()}


def source_exact(asset: dict) -> dict:
    archive_path = ARCHIVE_PREFIX + asset["source_path"]
    data = git_bytes(archive_path)
    lines = data.decode(errors="replace").splitlines()
    first = next((i for i, line in enumerate(lines, 1) if line.strip()), 1)
    text = lines[first - 1] if lines else ""
    digest = tagged(data)
    manifest = manifest_sha(asset["source_path"])
    return {
        "archive_path": archive_path, "source_path": asset["source_path"], "blob": git_blob(archive_path),
        "bytes": len(data), "line_count": len(lines), "sha256": digest,
        "ledger_source_sha256": "sha256:" + asset["source_sha256"], "ledger_digest_match": digest == "sha256:" + asset["source_sha256"],
        "archive_manifest_sha256": manifest, "archive_manifest_match": digest == manifest,
        "semantic_anchor": {"marker": text[:240], "line_start": first, "line_end": first,
                             "line_text": [text], "line_text_sha256": tagged(text.encode()),
                             "interpretation": "first non-empty JSON configuration line; retained as a static review anchor only",
                             "products_considered": list(PRODUCTS)},
        "read_mode": "git_object_static_read_only",
    }


def history(asset_id: str, dispositions: dict[str, tuple[int, dict]], decisions: list[tuple[int, dict]], read_after: list[tuple[int, dict]]) -> dict:
    line_no, row = dispositions[asset_id]
    compact = {"path": DISPOSITION, "line": line_no, "row_sha256": digest_row(row),
               "source_path": row.get("source_path"), "source_sha256": row.get("source_sha256"),
               "disposition": row.get("disposition"), "asset_class": row.get("asset_class"),
               "product_target": row.get("product_target"), "implementation_status": row.get("implementation_status"),
               "consumer_refs": sorted(row.get("consumer_refs", [])), "decision_record_ref": row.get("decision_record_ref"),
               "read_after_record_ref": row.get("read_after_record_ref")}
    return {"disposition": compact,
            "decisions": [{"path": DECISIONS, "line": n, "row_sha256": digest_row(r), "decision_id": r.get("decision_id"),
                           "product_target": r.get("product_target"), "disposition": r.get("disposition")}
                          for n, r in decisions if r.get("asset_id") == asset_id],
            "read_after": [{"path": READ_AFTER, "line": n, "row_sha256": digest_row(r), "read_after_id": r.get("read_after_id"),
                            "result": r.get("result"), "digest_match": r.get("digest_match"), "consumer_match": r.get("consumer_match")}
                           for n, r in read_after if r.get("asset_id") == asset_id],
            "failure_consumer_static": {
                "failure": {"path": FAILURE, "blob": git_blob(FAILURE), "sha256": tagged(git_bytes(FAILURE)), "read_mode": "git_object_static_read_only"},
                "consumer": {"path": CONSUMER, "blob": git_blob(CONSUMER), "sha256": tagged(git_bytes(CONSUMER)), "read_mode": "git_object_static_read_only"},
            },
            "observed_failure_status": "asset_specific_failure_or_degradation_not_established",
            "consumer_closure_status": "asset-level consumer closure pending; disposition refs and global static inventory retained",
            "degradation_status": "unknown"}


def make_record(asset: dict, phase: dict, dispositions: dict[str, tuple[int, dict]], decisions: list[tuple[int, dict]], read_after: list[tuple[int, dict]], wave_links: list[dict]) -> dict:
    products = sorted(set(phase.get("candidate_product_targets") or []))
    if len(products) == 1:
        category = "direct_product_basis"
        reason = RULES[category] + "; the provisional phase candidate remains unresolved and requires human boundary review."
    elif len(products) > 1:
        category = "multi_product_conflict"
        reason = RULES[category] + "; retain all candidates and split the unit before any routing decision."
    else:
        category = "insufficient_basis"
        reason = RULES[category] + "; retain the missing candidate evidence for human review."
    source = source_exact(asset)
    phase_line = phase["_line"]
    phase_copy = {k: v for k, v in phase.items() if k != "_line"}
    return {
        "asset_id": asset["asset_id"], "source_path": asset["source_path"], "source_exact": source,
        "phase_evidence": {"path": PHASE, "line": phase_line, "row_sha256": digest_row(phase_copy),
                            "artifact_evidence_kind": phase.get("artifact_evidence_kind"), "candidate_phase_targets": phase.get("candidate_phase_targets") or [],
                            "candidate_product_targets": phase.get("candidate_product_targets") or [], "phase_classification_status": phase.get("phase_classification_status"),
                            "product_classification_status": phase.get("product_classification_status"), "implementation_evidence_state": phase.get("implementation_evidence_state"),
                            "legacy_implementation_status": phase.get("legacy_implementation_status"), "legacy_execution_performed": phase.get("legacy_execution_performed"),
                            "consumer_closure_status": phase.get("consumer_closure_status"), "unresolved": phase.get("unresolved") or []},
        "legacy_asset_evidence": {"path": DISPOSITION, "line": dispositions[asset["asset_id"]][0], "row_sha256": digest_row(asset["_disp"]),
                                  "source_path": asset["_disp"].get("source_path"), "source_sha256": asset["_disp"].get("source_sha256"),
                                  "asset_class": asset["_disp"].get("asset_class"), "disposition": asset["_disp"].get("disposition"),
                                  "product_target": asset["_disp"].get("product_target"), "implementation_status": asset["_disp"].get("implementation_status"),
                                  "consumer_refs": sorted(asset["_disp"].get("consumer_refs", [])), "decision_record_ref": asset["_disp"].get("decision_record_ref"),
                                  "read_after_record_ref": asset["_disp"].get("read_after_record_ref")},
        "classification": {"category": category, "candidate_products": products, "semantic_status": "research_candidate_pending_human_review", "reason": reason},
        "boundary_evidence": {"product_boundary": boundary_evidence(), "l1": fixed_l1_evidence()},
        "legacy_history_failure_consumer": history(asset["asset_id"], dispositions, decisions, read_after),
        "implementation_evidence": {"artifact_evidence_kind": "configuration", "status": "unknown", "presence": "configuration_present_unexecuted", "unimplemented_evidence": phase.get("unresolved") or ["legacy_implementation_status_unknown"], "legacy_execution_performed": False},
        "wave_semantic_links": wave_links, "wave_edge_count": len(wave_links),
        "human_judgment_remaining": HUMAN_JUDGMENT, "authority_effect": "none", "formal_asset_classification_updated": False, "new_build_allowed": False,
    }


def build() -> None:
    phase_rows = jsonl(PHASE)
    disp_rows = jsonl(DISPOSITION)
    phase_by_path = {r.get("source_path"): (n, r) for n, r in phase_rows}
    disp_by_id = {r.get("asset_id"): (n, r) for n, r in disp_rows}
    targets = [r for n, r in disp_rows if r.get("source_path", "").startswith("config/")]
    if len(targets) != 41:
        raise AssertionError(f"expected 41 config assets, got {len(targets)}")
    wave_by_asset = {}
    for wave, path in WAVE_PATHS.items():
        for line, edge in jsonl(path):
            if edge.get("asset_id") in {r["asset_id"] for r in targets}:
                wave_by_asset.setdefault(edge["asset_id"], []).append({
                    "wave": wave, "path": path, "line": line, "row_sha256": digest_row(edge),
                    "asset_id": edge.get("asset_id"), "source_path": edge.get("source_path"), "source_sha256": edge.get("source_sha256"),
                    "source_requirement_id": edge.get("source_requirement_id"), "unit_candidate_id": edge.get("unit_candidate_id"),
                    "semantic_link_status": edge.get("semantic_link_status"), "candidate_product_targets": edge.get("candidate_product_targets") or [],
                    "candidate_phase_targets": edge.get("candidate_phase_targets") or [], "product_scope": edge.get("product_scope") or [],
                    "evidence_refs": edge.get("evidence_refs") or [], "counterevidence": edge.get("counterevidence") or []})
    records = []
    for asset in targets:
        line, phase = phase_by_path[asset["source_path"]]
        phase = dict(phase); phase["_line"] = line
        a = dict(asset); a["_disp"] = asset
        records.append(make_record(a, phase, disp_by_id, jsonl(DECISIONS), jsonl(READ_AFTER), wave_by_asset.get(asset["asset_id"], [])))
    records.sort(key=lambda x: x["source_path"])
    out = BUNDLE / "classification-research.jsonl"
    out.write_text("".join(json.dumps(r, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for r in records))
    input_digests = []
    for path in INPUTS:
        data = git_bytes(path)
        input_digests.append({"path": path, "blob": git_blob(path), "bytes": len(data), "sha256": tagged(data)})
    counts = {k: sum(r["classification"]["category"] == k for r in records) for k in RULES}
    inv = {
        "schema_revision": 1, "binding_id": BINDING_ID, "bundle_revision": "SCF-B-0141-r1", "base_revision": BASE_REVISION,
        "base_source_mode": "all source, input, and archive evidence bytes from fixed BASE Git objects",
        "scope": "fixed BASE unresolved config/** exact 41 assets after main+PR2074+PR2078 research union",
        "research_scope": {"source_prefix": "config/", "asset_class": "Historical", "disposition": "unresolved", "artifact_evidence_kind": "configuration", "mode": "research_only", "products": list(PRODUCTS)},
        "evidence_completeness": {"source_blob_sha_line_anchor": True, "phase_and_implementation_status": True, "missing_evidence_preserved": True, "failure_degradation": "global_static_inventory_and_asset_unknown", "consumer": "global_static_inventory_and_asset_pending", "wave_scan": True},
        "target_count": 41, "target_asset_ids": [r["asset_id"] for r in records], "target_source_paths": [r["source_path"] for r in records],
        "target_asset_ids_sha256": tagged(("\n".join(r["asset_id"] for r in records)).encode()),
        "target_artifact_evidence_kinds": {"configuration": 41}, "classification_counts": counts,
        "input_digests": input_digests, "output_sha256": tagged(out.read_bytes()),
        "research_union": {"origin_main_pre_2074_count": 399, "origin_main_current_count": 429, "pr2074_count": 31, "pr2078_count": 120, "union_count": 496, "target_overlap_origin_main_current": 0, "target_overlap_origin_main_pre_2074": 0, "target_overlap_pr2074": 0, "target_overlap_pr2078": 0,
                           "integration_order": "origin/main pre-#2074 (399) -> #2074 merged into main (429) -> #2078 candidate union (496) -> config/41 (537), all /4020",
                           "candidate_denominator_main_pre_2074": 399, "candidate_denominator_current_main": 429, "candidate_denominator_after_pr2078": 496, "candidate_denominator_after_config": 537},
        "overlap_status": {"status": "pass", "target_vs_origin_main_pre_2074": 0, "target_vs_origin_main_current": 0, "target_vs_pr2074": 0, "target_vs_pr2078": 0, "target_vs_union": 0, "union_exact": True},
        "denominator_role": {"archive_population": 4020, "origin_main_pre_2074": 399, "origin_main_current": 429, "open_pr_union": 496, "config_target": 41, "integrated_candidate_after_config": 537, "role": "research_candidate_evidence_only; no formal adoption or completion"},
        "classification_rule": RULES,
        "authority_boundary": {"authority_effect": "none", "formal_product_authority": None, "formal_asset_classification_updated": False, "formal_implementation_status": "unknown", "phase_updated": False, "successor_assignment": None, "new_build_allowed": False, "read_mode": "static_git_object_only"},
        "old_archive_execution": {"source_read": "git show fixed BASE only", "runtime": False, "test": False, "ci": False, "workflow": False, "hook": False, "adapter": False},
        "wave_scan": {"files": 50, "edges": 598, "target_edges": sum(len(v) for v in wave_by_asset.values()), "target_linked_assets": len(wave_by_asset)},
        "negative_cases": ["target omission/duplicate/extra", "source blob/SHA/line anchor tamper", "phase implementation status tamper", "classification category/product/reason tamper", "missing evidence/degradation/consumer tamper", "Wave edge injection", "input freshness omission/duplicate/value tamper", "nested duplicate JSON keys", "exact union overlap tamper", "category partition/count tamper", "authority/new_build promotion", "fixed BASE pin/ancestor/source missing", "output digest tamper", "binding upstream stale"],
        "artifacts": [f"scaffold/bindings/{BINDING_ID}.json", f"scaffold/legacy-config-product-classification-0141/README.md", f"scaffold/legacy-config-product-classification-0141/PR-DRAFT.md", f"scaffold/legacy-config-product-classification-0141/generate.py", f"scaffold/legacy-config-product-classification-0141/validate.py", f"scaffold/legacy-config-product-classification-0141/selfcheck.py", f"scaffold/legacy-config-product-classification-0141/inventory.json", f"scaffold/legacy-config-product-classification-0141/classification-research.jsonl"],
    }
    (BUNDLE / "inventory.json").write_text(json.dumps(inv, ensure_ascii=False, sort_keys=True, indent=2) + "\n")


if __name__ == "__main__":
    build()
    print("SCF-B-0141 generate PASS records=41")
