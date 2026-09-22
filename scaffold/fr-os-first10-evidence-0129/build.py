#!/usr/bin/env python3
"""Build the fixed-base, research-only HELIX-OS FR first-ten evidence slice."""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/fr-os-first10-evidence-0129"
BASE = "217e3a6e1c3e6ce25205d8330a96e0853c18f61b" 
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
CROSSWALK = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
DECOMPOSITION = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
CURRENT_EVIDENCE = "scaffold/fr-implementation-evidence-0109/evidence.jsonl"
CURRENT_INVENTORY = "scaffold/fr-implementation-evidence-0109/inventory.json"
CURRENT_README = "scaffold/fr-implementation-evidence-0109/README.md"
WAVES = {
    n: (f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl"
        if n <= 36 else
        f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl")
    for n in range(1, 51)
}
CONTEXT_INPUTS = [
    "docs/governance/new-generation-start-here.md",
    "docs/governance/legacy-asset-reuse-control.md",
    "docs/concept/product-boundary.md",
    "docs/helix-os/L1-planning/system-intent.md",
    "docs/governance/phase-capability-inventory.json",
    "docs/governance/phase-capability-inventory.md",
    "archive/legacy-generation-2026-09-14/MANIFEST.sha256",
]
INPUT_PATHS = [
    CROSSWALK, DECOMPOSITION, DISPOSITION, PHASE, DECISIONS, READ_AFTER,
    CURRENT_EVIDENCE, CURRENT_INVENTORY, CURRENT_README, *CONTEXT_INPUTS,
    *WAVES.values(),
]


def git_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE}:{path}"], cwd=ROOT)


def blob(path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", f"{BASE}:{path}"], cwd=ROOT, text=True).strip()


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def digest(data: bytes) -> str:
    return "sha256:" + sha(data)


def read_jsonl(path: str) -> list[tuple[int, dict]]:
    return [(i, json.loads(line)) for i, line in enumerate(git_bytes(path).decode().splitlines(), 1) if line.strip()]


def all_input_digests() -> list[dict]:
    return [{"path": p, "sha256": digest(git_bytes(p))} for p in INPUT_PATHS]


def first_ten_units() -> list[tuple[int, dict]]:
    result: list[tuple[int, dict]] = []
    for number, row in read_jsonl(CROSSWALK):
        unit = row.get("unit_candidate_id", "")
        if unit.startswith("IRUNIT-HIL-FR-") and unit.endswith("-HELIX-OS"):
            result.append((number, row))
            if len(result) == 10:
                break
    if len(result) != 10:
        raise RuntimeError(f"expected ten FR HELIX-OS units, got {len(result)}")
    return result


def current_partition() -> dict[str, tuple[int, dict, str]]:
    rows = git_bytes(CURRENT_EVIDENCE).decode().splitlines()
    wanted = {row[1]["unit_candidate_id"] for row in first_ten_units()}
    result: dict[str, tuple[int, dict, str]] = {}
    for line_no, line in enumerate(rows, 1):
        if not line.strip():
            continue
        row = json.loads(line)
        unit = row.get("unit_candidate_id")
        if unit in wanted:
            result[unit] = (line_no, row, digest(line.encode()))
    if set(result) != wanted:
        raise RuntimeError("existing FR-0109 evidence partition is missing a target unit")
    return result


def wave_edges() -> dict[str, list[tuple[int, int, dict]]]:
    wanted = [row[1]["unit_candidate_id"] for row in first_ten_units()]
    result = {u: [] for u in wanted}
    for wave, path in WAVES.items():
        for line_no, row in read_jsonl(path):
            if row.get("unit_candidate_id") in result:
                result[row["unit_candidate_id"]].append((wave, line_no, row))
    if any(len(v) == 0 for v in result.values()):
        raise RuntimeError("a target unit has no fixed-base Wave edge")
    return result


def selected_asset_ids(edges: dict[str, list[tuple[int, int, dict]]]) -> list[str]:
    return sorted({edge["asset_id"] for values in edges.values() for _, _, edge in values})


def line_anchor(data: bytes, start: int, end: int) -> dict:
    lines = data.splitlines(keepends=True)
    span = b"".join(lines[start - 1:end])
    return {
        "line_start": start,
        "line_end": end,
        "span_sha256": digest(span),
        "line_sha256": [digest(lines[i - 1].rstrip(b"\r\n")) for i in range(start, end + 1)],
    }


def asset_records(ids: list[str], edges: dict[str, list[tuple[int, int, dict]]]) -> list[dict]:
    ledger = {row["asset_id"]: row for _, row in read_jsonl(DISPOSITION)}
    phase = {row["asset_id"]: row for _, row in read_jsonl(PHASE)}
    decisions = read_jsonl(DECISIONS)
    read_after = read_jsonl(READ_AFTER)
    by_asset_decisions = {asset: [row for _, row in decisions if row.get("asset_id") == asset] for asset in ids}
    by_asset_read_after = {asset: [row for _, row in read_after if row.get("asset_id") == asset] for asset in ids}
    edge_by_asset: dict[str, list[dict]] = {asset: [] for asset in ids}
    for values in edges.values():
        for _, _, edge in values:
            edge_by_asset[edge["asset_id"]].append(edge)
    result = []
    for asset in ids:
        record = ledger[asset]
        sources = {}
        for edge in edge_by_asset[asset]:
            for ref in edge.get("evidence_refs", []):
                path = ref["archive_path"]
                data = git_bytes(path)
                sources[path] = {
                    "archive_path": path,
                    "source_path": path.removeprefix(ARCHIVE_PREFIX),
                    "git_blob_oid_at_base": blob(path),
                    "git_blob_sha256_at_base": sha(data),
                    "anchor": line_anchor(data, ref["line_start"], ref["line_end"]),
                }
        result.append({
            "asset_id": asset,
            "ledger_record": record,
            "phase_classification_record": phase[asset],
            "decision_records": by_asset_decisions[asset],
            "read_after_records": by_asset_read_after[asset],
            "edge_refs": sorted({edge["review_id"] for edge in edge_by_asset[asset]}),
            "source_exact": [sources[path] for path in sorted(sources)],
            "evidence_boundary": {
                "asset_level_only": True,
                "implementation_proof": False,
                "degradation_proof": False,
                "failure_receipt": False,
                "consumer_closure": False,
                "reason": "Wave edge and ledger/source records are static asset evidence; no unit acceptance or executed receipt is attached.",
            },
        })
    return result


def status_partition(crosswalk: dict, edges: list[dict], assets: list[dict], current: dict) -> dict:
    asset_ids = [a["asset_id"] for a in assets]
    observed_consumers = sorted({ref for edge in edges for ref in edge.get("observed_consumer_refs", [])})
    phase_candidates = sorted({phase for asset in assets for phase in asset["phase_classification_record"].get("candidate_phase_targets", [])})
    return {
        "old_implementation": {
            "status": "unknown",
            "direct_unit_evidence": False,
            "asset_ids": asset_ids,
            "edge_ids": [edge["review_id"] for edge in edges],
            "asset_level_observations": sorted({edge.get("legacy_requirement_implementation_contribution") for edge in edges}),
            "reason_unknown": "implementation_source/design/requirement records are candidate or contract partitions; execution, unit acceptance, and complete consumer binding are absent",
        },
        "old_degradation": {
            "status": "unknown",
            "direct_unit_evidence": False,
            "edge_ids": [edge["review_id"] for edge in edges],
            "constraint_observations": [edge.get("coverage", {}) for edge in edges],
            "reason_unknown": "edge constraint/failure fields are static coverage and counter-evidence, not an observed unit transition or degradation receipt",
        },
        "old_failure": {
            "status": "unknown",
            "direct_unit_evidence": False,
            "observed_failure_receipts": [],
            "edge_ids": [edge["review_id"] for edge in edges],
            "reason_unknown": "no executed failure receipt is attached; static coverage.failure and counterevidence do not establish a unit failure",
        },
        "old_consumer": {
            "status": "unknown",
            "closure_status": "pending",
            "observed_consumer_refs": observed_consumers,
            "decision_or_read_after_count": sum(len(a["decision_records"]) + len(a["read_after_records"]) for a in assets),
            "direct_unit_evidence": False,
            "reason_unknown": "consumer references/decision records are historical references; no closed unit consumer/acceptance relation is present",
        },
        "old_phase": {
            "status": "candidate_only",
            "phase_ids": phase_candidates,
            "direct_authority": False,
            "reason_unknown": "phase classification is a candidate record with authority_effect none and product boundary review pending",
        },
        "current_implementation": {
            "status": "unknown",
            "direct_unit_evidence": False,
            "partition_status": current.get("current_implementation_evidence", {}).get("status"),
            "reason_unknown": "current partition has no execution, implementation claim, or acceptance verdict; current source implementation is not established",
        },
        "acceptance": {
            "status": "unknown",
            "direct_unit_evidence": False,
            "reason_unknown": "no acceptance verdict is present in the crosswalk, Wave edge, old ledger, or current partition",
        },
        "unimplemented": {
            "status": "unknown",
            "direct_unit_evidence": False,
            "reason_unknown": "absence of a direct implementation receipt does not prove non-implementation",
        },
    }


def build() -> None:
    targets = first_ten_units()
    current = current_partition()
    edges_by_unit = wave_edges()
    asset_ids = selected_asset_ids(edges_by_unit)
    assets = asset_records(asset_ids, edges_by_unit)
    assets_by_id = {a["asset_id"]: a for a in assets}
    rows = []
    for crosswalk_line, crosswalk in targets:
        unit = crosswalk["unit_candidate_id"]
        current_line, current_row, current_digest = current[unit]
        edge_rows = edges_by_unit[unit]
        edges = [edge for _, _, edge in edge_rows]
        unit_asset_ids = sorted({edge["asset_id"] for edge in edges})
        selected_assets = [assets_by_id[asset] for asset in unit_asset_ids]
        rows.append({
            "schema": "fr-os-first10-evidence-0129/v1",
            "unit_candidate_id": unit,
            "source_requirement": {
                "crosswalk_line": crosswalk_line,
                "crosswalk_row": crosswalk,
                "direct_legacy_asset_links": crosswalk.get("direct_legacy_asset_links", []),
                "candidate_pool_is_not_proof": True,
            },
            "existing_218_binding": {
                "existing_unit": True,
                "new_unit_count": 0,
                "existing_partition_path": CURRENT_EVIDENCE,
                "existing_partition_line": current_line,
                "existing_partition_row_sha256": current_digest,
            },
            "current_evidence_partition": {
                "path": CURRENT_EVIDENCE,
                "line": current_line,
                "row_sha256": current_digest,
                "row": current_row,
                "inventory_path": CURRENT_INVENTORY,
                "inventory": json.loads(git_bytes(CURRENT_INVENTORY)),
                "base_pin_limitation": "existing FR-0109 partition is compared as current-main evidence, while this bundle independently pins all inputs to BASE",
            },
            "semantic_review_edges": [
                {"wave": wave, "wave_line": line, "edge": edge} for wave, line, edge in edge_rows
            ],
            "asset_evidence": selected_assets,
            "status_partition": status_partition(crosswalk, edges, selected_assets, current_row),
            "directly_established": [
                "the requirement source anchor and exact crosswalk row are fixed",
                "the listed Wave semantic edges and their source/asset anchors exist at BASE",
                "the listed historical ledger, phase, decision, and read-after records are exact static records",
                "candidate/representative assets are not implementation proof and no legacy execution was performed",
            ],
            "unresolved": [
                "unit-level old implementation status",
                "unit-level old degradation status",
                "unit-level old failure status",
                "unit-level consumer closure and acceptance",
                "current implementation and acceptance",
                "formal phase/product authority and successor",
                "explicit non-implementation verdict",
            ],
            "authority_boundary": {
                "authority_effect": "none",
                "research_only": True,
                "formal_implementation_claim": False,
                "formal_degradation_claim": False,
                "formal_failure_claim": False,
                "formal_unimplemented_claim": False,
                "acceptance_verdict": False,
                "legacy_execution_performed": False,
            },
        })
    evidence_path = BUNDLE / "evidence.jsonl"
    evidence_path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows))
    scope = {
        "source_requirement_ids": [row[1]["source_requirement_id"] for row in targets],
        "unit_ids": [row[1]["unit_candidate_id"] for row in targets],
        "unit_count": len(rows),
        "new_unit_count": 0,
        "existing_218_binding": True,
        "product": "HELIX-OS",
        "wave_edge_count": sum(len(v) for v in edges_by_unit.values()),
        "unique_asset_count": len(asset_ids),
        "ledger_scope_total": len(read_jsonl(DISPOSITION)),
        "wave_scope": [1, 50],
        "selection_rule": "crosswalk order; first ten IRUNIT-HIL-FR-* rows with product_scope exactly HELIX-OS",
    }
    inventory = {
        "schema_revision": 1,
        "binding_id": "SCF-B-0129",
        "bundle_kind": "research_scaffold_fr_os_first10_evidence_partition",
        "base_revision": BASE,
        "base_source_mode": "all inputs and historical source evidence read from fixed BASE Git objects",
        "authority_boundary": {
            "authority_effect": "none",
            "formal_implementation_claim_updated": False,
            "formal_degradation_claim_updated": False,
            "formal_failure_claim_updated": False,
            "formal_unimplemented_claim_updated": False,
            "acceptance_verdict_created": False,
            "new_build_allowed": False,
            "status_rule": "unknown_when_direct_unit_evidence_is_missing",
        },
        "scope": scope,
        "selection": {
            "crosswalk_path": CROSSWALK,
            "product_scope": "HELIX-OS",
            "ordered_unit_selection": "first ten matching crosswalk rows",
            "excluded": ["FR03-HELIX-OS because no such crosswalk unit exists", "all units after the first ten", "new unit creation"],
            "candidate_pool_semantics": "search candidates and representatives are retained as non-proof context",
        },
        "input_digests": all_input_digests(),
        "expected_unit_count": 10,
        "expected_edge_count": 30,
        "expected_unique_asset_count": len(asset_ids),
        "output_sha256": digest(evidence_path.read_bytes()),
        "forbidden_operations": ["old archive runtime/test/CI/workflow/hook/adapter/source execution", "formal authority or status promotion", "merge", "close"],
    }
    (BUNDLE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    build()
