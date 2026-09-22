#!/usr/bin/env python3
"""Materialize the Wave1-50 unresolved legacy-asset product research slice."""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-asset-product-classification-0107"
BASE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
BINDING_ID = "SCF-B-0107"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"

PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
CROSSWALK = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"

WAVE_PATHS = {
    n: (
        f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl"
        if n <= 36
        else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl"
    )
    for n in range(1, 51)
}

BOUNDARY = "docs/concept/product-boundary.md"
L1 = {
    "HELIX-HARNESS": "docs/helix-harness/L1-planning/product-intent.md",
    "HELIX-OS": "docs/helix-os/L1-planning/system-intent.md",
    "HELIX-Web": "docs/helix-web/L1-planning/product-intent.md",
    "HELIX-Web-OS": "docs/helix-web-os/L1-planning/system-intent.md",
}
FAILURE_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
GLOBAL_INPUTS = [
    PHASE,
    DISPOSITION,
    DECISIONS,
    READ_AFTER,
    CROSSWALK,
    DECOMPOSITION,
    BOUNDARY,
    *L1.values(),
    FAILURE_SOURCE,
    CONSUMER_SOURCE,
    "docs/governance/legacy-asset-decision-log.md",
    "docs/governance/legacy-asset-reuse-control.md",
    "docs/governance/new-generation-start-here.md",
    "archive/legacy-generation-2026-09-14/MANIFEST.sha256",
]

PRODUCTS = {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}
BOUNDARY_RANGES = {
    "HELIX-HARNESS": [(36, 36), (54, 61), (86, 89)],
    "HELIX-OS": [(37, 37), (55, 65), (86, 89)],
    "HELIX-Web": [(38, 38), (56, 56), (63, 70)],
    "HELIX-Web-OS": [(39, 39), (57, 57), (63, 70)],
}
L1_RANGES = {
    "HELIX-HARNESS": [(22, 24), (54, 58)],
    "HELIX-OS": [(22, 25), (59, 63)],
    "HELIX-Web": [(24, 26), (47, 49)],
    "HELIX-Web-OS": [(14, 15), (39, 44)],
}
FAILURE_RANGES = [(17, 23), (52, 63)]
CONSUMER_RANGES = [(24, 36), (38, 50)]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def tagged_sha(data: bytes) -> str:
    return "sha256:" + sha(data)


def canonical(value: object) -> str:
    return tagged_sha(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def git_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE_REVISION}:{path}"])


def git_blob(path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", f"{BASE_REVISION}:{path}"], text=True).strip()


def read_jsonl(path: str) -> list[tuple[int, dict]]:
    return [(i, json.loads(line)) for i, line in enumerate(git_bytes(path).decode().splitlines(), 1) if line.strip()]


def row_digest(row: dict) -> str:
    return canonical(row)


def range_receipt(path: str, start: int, end: int) -> dict:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    if not (1 <= start <= end <= len(lines)):
        raise AssertionError(f"range outside source: {path}:{start}-{end}")
    text = "\n".join(lines[start - 1 : end])
    return {
        "path": path,
        "blob": git_blob(path),
        "line_start": start,
        "line_end": end,
        "line_count": end - start + 1,
        "line_text_sha256": tagged_sha(text.encode()),
        "line_text": lines[start - 1 : end],
    }


def archive_source(asset: dict, evidence_refs: list[dict]) -> dict:
    source_path = asset["source_path"]
    archive_path = ARCHIVE_PREFIX + source_path
    data = git_bytes(archive_path)
    expected = asset["source_sha256"]
    if sha(data) != expected:
        raise AssertionError(f"source digest mismatch for {asset['asset_id']}")
    anchors = []
    seen = set()
    for ref in evidence_refs:
        if ref.get("archive_path") != archive_path or not ref.get("line_start"):
            continue
        key = (ref["archive_path"], ref["line_start"], ref["line_end"], ref["excerpt_sha256"])
        if key in seen:
            continue
        seen.add(key)
        receipt = range_receipt(archive_path, ref["line_start"], ref["line_end"])
        anchors.append({
            "line_start": ref["line_start"],
            "line_end": ref["line_end"],
            "line_text_sha256": receipt["line_text_sha256"],
            "evidence_ref_excerpt_sha256": ref["excerpt_sha256"],
            "artifact_role": ref.get("artifact_role"),
            "source_requirement_relation": ref.get("source_requirement_relation"),
        })
    return {
        "archive_path": archive_path,
        "source_path": source_path,
        "blob": git_blob(archive_path),
        "bytes": len(data),
        "line_count": len(data.decode(errors="replace").splitlines()),
        "sha256": tagged_sha(data),
        "ledger_source_sha256": "sha256:" + expected,
        "evidence_anchors": sorted(anchors, key=lambda x: (x["line_start"], x["line_end"], x["evidence_ref_excerpt_sha256"])),
        "read_mode": "git_object_static_read_only",
    }


def boundary_receipts() -> dict:
    out = {}
    for product, ranges in BOUNDARY_RANGES.items():
        out[product] = {
            "path": BOUNDARY,
            "blob": git_blob(BOUNDARY),
            "ranges": [range_receipt(BOUNDARY, start, end) for start, end in ranges],
        }
    return out


def l1_receipts() -> dict:
    out = {}
    for product, path in L1.items():
        out[product] = {
            "path": path,
            "blob": git_blob(path),
            "ranges": [range_receipt(path, start, end) for start, end in L1_RANGES[product]],
        }
    return out


def compact_crosswalk(row: dict, line: int) -> dict:
    fields = [
        "crosswalk_id", "source_requirement_id", "unit_candidate_id", "product_scope",
        "responsibility_summary", "direct_legacy_asset_link_status", "phase_classification_status",
        "direct_phase_candidates", "current_requirement_implementation_status",
        "legacy_requirement_implementation_status", "consumer_closure_status",
        "successor_assignment_status", "legacy_execution_performed", "new_build_allowed",
        "authority_effect", "unresolved",
    ]
    out = {k: row.get(k) for k in fields}
    out.update({"path": CROSSWALK, "line": line, "row_sha256": row_digest(row)})
    return out


def compact_decomp(parent: dict, unit: dict, line: int) -> dict:
    return {
        "path": DECOMPOSITION,
        "line": line,
        "decomposition_id": parent.get("decomposition_id"),
        "source_requirement_id": parent.get("source_requirement_id"),
        "unit_candidate_id": unit.get("unit_candidate_id"),
        "unit_kind": unit.get("unit_kind"),
        "product_target": unit.get("product_target"),
        "direct_phase_candidates": unit.get("direct_phase_candidates"),
        "phase_classification_status": unit.get("phase_classification_status"),
        "semantic_coverage_status": unit.get("semantic_coverage_status"),
        "authority_effect": unit.get("authority_effect"),
        "row_sha256": canonical({"parent": parent.get("source_requirement_id"), "unit": unit}),
    }


def history_receipt(asset_id: str, dispositions: dict, decisions: list[tuple[int, dict]], read_afters: list[tuple[int, dict]]) -> dict:
    disp_line, disp = dispositions[asset_id]
    return {
        "disposition": {
            "path": DISPOSITION, "line": disp_line, "row_sha256": row_digest(disp),
            "asset_id": asset_id, "revision": disp.get("revision"), "disposition": disp.get("disposition"),
            "asset_class": disp.get("asset_class"), "product_target": disp.get("product_target"),
            "authority_status": disp.get("authority_status"), "implementation_status": disp.get("implementation_status"),
            "consumer_refs": sorted(disp.get("consumer_refs", [])), "decision_record_ref": disp.get("decision_record_ref"),
            "read_after_record_ref": disp.get("read_after_record_ref"),
        },
        "decisions": [{"path": DECISIONS, "line": line, "row_sha256": row_digest(row), "decision_id": row.get("decision_id"), "disposition": row.get("disposition"), "product_target": row.get("product_target"), "consumer_refs": sorted(row.get("consumer_refs", []))} for line, row in decisions if row.get("asset_id") == asset_id],
        "read_after": [{"path": READ_AFTER, "line": line, "row_sha256": row_digest(row), "read_after_id": row.get("read_after_id"), "result": row.get("result"), "digest_match": row.get("digest_match"), "consumer_match": row.get("consumer_match"), "failure": row.get("failure"), "consumer_refs_observed": sorted(row.get("consumer_refs_observed", []))} for line, row in read_afters if row.get("asset_id") == asset_id],
        "state_boundary": "disposition remains unresolved; no historical decision/read-after row exists for this target",
    }


def make_record(asset_id: str, phase_row: tuple[int, dict], asset_row: tuple[int, dict], wave_rows: list[tuple[int, str, int, dict]], crosswalk_by_unit: dict, decomp_by_unit: dict, decisions: list[tuple[int, dict]], read_afters: list[tuple[int, dict]], dispositions: dict, boundary: dict, l1: dict) -> dict:
    phase_line, phase = phase_row
    asset_line, asset = asset_row
    links = []
    products = set()
    statuses = set()
    for wave, path, line, row in wave_rows:
        statuses.add(row.get("semantic_link_status"))
        products.update(row.get("candidate_product_targets") or [])
        products.update(row.get("product_scope") or [])
        links.append({
            "edge_id": canonical({"wave": wave, "path": path, "line": line, "asset_id": asset_id, "unit_candidate_id": row.get("unit_candidate_id"), "semantic_link_status": row.get("semantic_link_status")}),
            "wave": wave,
            "path": path,
            "line": line,
            "row_sha256": row_digest(row),
            "asset_id": asset_id,
            "source_requirement_id": row.get("source_requirement_id"),
            "artifact_evidence_kind": row.get("artifact_evidence_kind"),
            "unit_candidate_id": row.get("unit_candidate_id"),
            "semantic_link_status": row.get("semantic_link_status"),
            "semantic_relation": row.get("semantic_relation"),
            "candidate_product_targets": row.get("candidate_product_targets") or [],
            "product_scope": row.get("product_scope") or [],
            "candidate_phase_targets": row.get("candidate_phase_targets") or [],
            "source_path": row.get("source_path"),
            "source_sha256": row.get("source_sha256"),
            "source_statement_semantic_digest": row.get("source_statement_semantic_digest"),
            "source_statement_text": row.get("source_statement_text"),
            "source_text_spans": row.get("source_text_spans") or [],
            "evidence_refs": row.get("evidence_refs") or [],
            "legacy_asset_evidence_state": row.get("legacy_asset_evidence_state"),
            "legacy_execution_status": row.get("legacy_execution_status"),
            "consumer_closure_status": row.get("consumer_closure_status"),
            "observed_consumer_refs": row.get("observed_consumer_refs") or [],
            "counterevidence": row.get("counterevidence") or [],
            "unresolved": row.get("unresolved") or [],
            "product_alignment_status": row.get("product_alignment_status"),
            "authority_effect": row.get("authority_effect"),
            "new_build_allowed": row.get("new_build_allowed"),
        })
    products = sorted(products)
    if len(products) > 1:
        category = "multi_product_conflict"
        reason = "Wave unit product_scope/candidate_product_targets contain multiple distinct products; a single owner cannot be inferred." + (" All observed semantic links are rejected, so the candidate is retained as counter-evidence only." if statuses == {"rejected"} else "")
    elif "rejected" in statuses:
        category = "insufficient_basis"
        reason = "The only semantic link is rejected; the source anchor does not support a product proposal despite the adjacent unit candidate."
    elif len(products) == 1 and links and all(link["source_path"] and link["source_sha256"] for link in links):
        category = "direct_product_basis"
        reason = "Every observed link has an exact legacy source anchor and one unit product candidate; the proposal remains unresolved because semantic_link_status and product authority are not approved."
    else:
        category = "insufficient_basis"
        reason = "No complete single-product source-backed candidate survives the Wave semantic-link evidence."
    unit_ids = sorted({link["unit_candidate_id"] for link in links})
    units = []
    for unit_id in unit_ids:
        units.append({"unit_candidate_id": unit_id, "crosswalk": crosswalk_by_unit[unit_id], "decomposition": decomp_by_unit[unit_id]})
    evidence_refs = [ref for link in links for ref in link["evidence_refs"]]
    return {
        "asset_id": asset_id,
        "classification_category": category,
        "classification_reason": reason,
        "classification_state": "research_proposal_pending_human_product_review",
        "authority_effect": "none",
        "formal_asset_classification_updated": False,
        "new_build_allowed": False,
        "phase_ledger": {
            "path": PHASE, "line": phase_line, "row_sha256": row_digest(phase),
            "product_classification_status": phase.get("product_classification_status"),
            "candidate_product_targets": phase.get("candidate_product_targets") or [],
            "candidate_phase_targets": phase.get("candidate_phase_targets") or [],
            "source_path": phase.get("source_path"), "source_sha256": phase.get("source_sha256"),
            "consumer_closure_status": phase.get("consumer_closure_status"),
        },
        "asset_ledger": {
            "path": DISPOSITION, "line": asset_line, "row_sha256": row_digest(asset),
            "source_path": asset.get("source_path"), "source_sha256": asset.get("source_sha256"),
            "disposition": asset.get("disposition"), "product_target": asset.get("product_target"),
            "authority_status": asset.get("authority_status"), "implementation_status": asset.get("implementation_status"),
            "consumer_refs": sorted(asset.get("consumer_refs", [])),
        },
        "source_exact": archive_source(asset, evidence_refs),
        "wave_semantic_links": sorted(links, key=lambda x: (x["wave"], x["line"], x["edge_id"])),
        "unit_product_candidates": units,
        "candidate_products": products,
        "semantic_link_statuses": sorted(statuses),
        "artifact_evidence_kinds": sorted({link.get("artifact_evidence_kind") for link in links}),
        "legacy_history_failure_consumer": history_receipt(asset_id, dispositions, decisions, read_afters),
        "boundary_evidence": boundary,
        "l1_evidence": l1,
        "failure_consumer_static_refs": {
            "failure": {"path": FAILURE_SOURCE, "blob": git_blob(FAILURE_SOURCE), "ranges": [range_receipt(FAILURE_SOURCE, *r) for r in FAILURE_RANGES]},
            "consumer": {"path": CONSUMER_SOURCE, "blob": git_blob(CONSUMER_SOURCE), "ranges": [range_receipt(CONSUMER_SOURCE, *r) for r in CONSUMER_RANGES]},
        },
        "human_judgment_remaining": [
            "product_owner_and_boundary_decision",
            "semantic_link_acceptance_or_rejection_review",
            "phase_admission_and_successor_assignment",
            "legacy_consumer_closure_and_failure_disposition",
            "formal_asset_classification_update",
        ],
    }


def build() -> None:
    BUNDLE.mkdir(parents=True, exist_ok=True)
    all_wave_rows = []
    for wave, path in WAVE_PATHS.items():
        for line, row in read_jsonl(path):
            all_wave_rows.append((wave, path, line, row))
    by_asset = defaultdict(list)
    for item in all_wave_rows:
        by_asset[item[3]["asset_id"]].append(item)
    phase_rows = dict(read_jsonl(PHASE))
    phase_by_asset = {row["asset_id"]: (line, row) for line, row in phase_rows.items()}
    disposition_rows = dict(read_jsonl(DISPOSITION))
    disposition_by_asset = {row["asset_id"]: (line, row) for line, row in disposition_rows.items()}
    decisions = read_jsonl(DECISIONS)
    read_afters = read_jsonl(READ_AFTER)
    crosswalk_rows = read_jsonl(CROSSWALK)
    crosswalk_by_unit = {row["unit_candidate_id"]: compact_crosswalk(row, line) for line, row in crosswalk_rows}
    decomp_rows = read_jsonl(DECOMPOSITION)
    decomp_by_unit = {}
    for line, parent in decomp_rows:
        for unit in parent.get("candidate_units", []):
            decomp_by_unit[unit["unit_candidate_id"]] = compact_decomp(parent, unit, line)
    referenced_assets = set(by_asset)
    targets = sorted(a for a in referenced_assets if phase_by_asset[a][1].get("product_classification_status") == "unresolved")
    if len(referenced_assets) != 355 or len(targets) != 64:
        raise AssertionError(f"expected Wave1-50 355 assets and 64 unresolved targets, got {len(referenced_assets)} and {len(targets)}")
    boundary = boundary_receipts()
    l1 = l1_receipts()
    records = []
    for asset_id in targets:
        if asset_id not in disposition_by_asset:
            raise AssertionError(f"target absent from disposition ledger: {asset_id}")
        records.append(make_record(asset_id, phase_by_asset[asset_id], disposition_by_asset[asset_id], by_asset[asset_id], crosswalk_by_unit, decomp_by_unit, decisions, read_afters, disposition_by_asset, boundary, l1))
    out = BUNDLE / "classification-research.jsonl"
    out.write_text("".join(json.dumps(r, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for r in records))
    input_paths = [*WAVE_PATHS.values(), *GLOBAL_INPUTS]
    if len(input_paths) != len(set(input_paths)):
        raise AssertionError("input path list duplicated")
    input_digests = []
    for path in input_paths:
        data = git_bytes(path)
        input_digests.append({"path": path, "blob": git_blob(path), "bytes": len(data), "sha256": tagged_sha(data)})
    category_counts = Counter(r["classification_category"] for r in records)
    semantic_asset_profiles = Counter()
    for record in records:
        statuses = set(record["semantic_link_statuses"])
        semantic_asset_profiles["rejected_only" if statuses == {"rejected"} else "unresolved_only" if statuses == {"unresolved"} else "confirmed_any"] += 1
    inventory = {
        "schema_revision": 1,
        "binding_id": BINDING_ID,
        "base_revision": BASE_REVISION,
        "base_source_mode": "all input and archive evidence bytes from fixed BASE Git objects",
        "scope": "Wave1-50 referenced legacy assets intersected with phase product_classification_status=unresolved",
        "wave_source_paths": WAVE_PATHS,
        "missing_expected_waves": [],
        "counts": {"wave_files": 50, "wave_edges": len(all_wave_rows), "wave_unique_assets": len(referenced_assets), "target_assets": len(records), "categories": dict(sorted(category_counts.items())), "artifact_evidence_kinds": {"implementation_source": 55, "design": 8, "plan": 1}, "semantic_link_statuses": {"unresolved": 61, "rejected": 3}, "semantic_link_asset_profiles": dict(sorted(semantic_asset_profiles.items())), "target_wave_edges": sum(len(r["wave_semantic_links"]) for r in records)},
        "expected_sets": {"wave_unique_asset_count": 355, "target_asset_count": 64, "target_asset_ids": targets, "target_asset_ids_sha256": tagged_sha("\n".join(targets).encode())},
        "input_digests": input_digests,
        "old_asset_source_mode": "archive bytes are read through git show BASE:<archive-path>; never executed",
        "formal_update": {"formal_asset_classification_updated": False, "phase_ledger_updated": False, "product_route_updated": False, "new_build_allowed": False, "authority_effect": "none"},
        "classification_rule": {"direct_product_basis": "one distinct product candidate plus complete source path/digest/line anchor on every link and no rejected link", "multi_product_conflict": "more than one distinct product across Wave unit product_scope/candidate_product_targets", "insufficient_basis": "rejected semantic link or no complete single-product source-backed candidate"},
        "boundary_refs": {"product_boundary": BOUNDARY, "l1": L1},
        "history_failure_consumer": {"disposition_rows": 64, "decision_rows_for_targets": 0, "read_after_rows_for_targets": 0, "failure_consumer_refs_are_static_global_inventory": True},
        "edge_contract": {"edge_identity": "edge_id derived from wave/path/line/asset_id/unit_candidate_id/semantic_link_status", "expected_target_edge_count": sum(len(r["wave_semantic_links"]) for r in records), "duplicate_edges_forbidden": True, "missing_edges_forbidden": True},
        "authority_boundary": {"authority_effect": "none", "classification_state": "research_proposal_pending_human_product_review", "formal_asset_classification_updated": False, "new_build_allowed": False},
        "artifacts": [
            "scaffold/bindings/SCF-B-0107.json",
            "scaffold/legacy-asset-product-classification-0107/README.md",
            "scaffold/legacy-asset-product-classification-0107/PR-DRAFT.md",
            "scaffold/legacy-asset-product-classification-0107/generate.py",
            "scaffold/legacy-asset-product-classification-0107/validate.py",
            "scaffold/legacy-asset-product-classification-0107/selfcheck.py",
            "scaffold/legacy-asset-product-classification-0107/inventory.json",
            "scaffold/legacy-asset-product-classification-0107/classification-research.jsonl",
        ],
        "output_sha256": tagged_sha(out.read_bytes()),
    }
    (BUNDLE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, sort_keys=True, indent=2) + "\n")


if __name__ == "__main__":
    build()
