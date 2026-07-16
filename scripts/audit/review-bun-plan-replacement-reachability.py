#!/usr/bin/env python3
"""Statically review Bun PLAN adjudication without granting verification credit."""

from __future__ import annotations

import hashlib
import json
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
GENERATED = ROOT / "docs/governance/generated"
SOURCE = GENERATED / "helix-bun-plan-semantic-adjudication-v1.json"
PROJECTION = GENERATED / "helix-bun-corrected-projection-contract-v1.json"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def finding(code: str, detail: str) -> dict[str, str]:
    return {"code": code, "detail": detail}


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: review-bun-plan-replacement-reachability.py OUTPUT.json")

    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    projection = json.loads(PROJECTION.read_text(encoding="utf-8"))
    records = source["records"]
    superset = source["superset_records"]
    projection_slot = next(
        slot for slot in projection["overlay_slots"]
        if slot["path"] == SOURCE.relative_to(ROOT).as_posix()
    )

    atom_ids = [row["atom_id"] for row in records]
    source_paths = [ROOT / row["file"] for row in records]
    if len(atom_ids) != len(set(atom_ids)):
        raise SystemExit("duplicate atom_id in adjudication records")
    if any(not path.is_file() for path in source_paths):
        raise SystemExit("one or more source PLAN files are missing")

    reviewed = []
    for row in records:
        refs = row["consumer_reachability"]["external_reference_paths"]
        plan_stem = Path(row["file"]).stem
        ref_checks = []
        for relative in refs:
            path = ROOT / relative
            exists = path.is_file()
            contains_plan_stem = exists and plan_stem in path.read_text(
                encoding="utf-8", errors="replace"
            )
            ref_checks.append({
                "path": relative,
                "exists": exists,
                "contains_plan_stem": contains_plan_stem,
            })

        findings = []
        semantic_class = row["semantic_class"]
        if semantic_class == "active_consumer_command_replacement":
            findings.append(finding(
                "BUN_PLAN_REPLACEMENT_TARGET_ORPHAN",
                "target_family is categorical only; no replacement artifact path, symbol, digest, oracle, or execution receipt is bound",
            ))
            findings.append(finding(
                "BUN_PLAN_COMMAND_REACHABILITY_UNPROVEN",
                "external_reference_paths prove only an exact PLAN-stem mention, not a Bun-command-to-Node-consumer edge",
            ))
            if not row["command_like"]:
                findings.append(finding(
                    "BUN_PLAN_ACTIVE_CLASSIFICATION_REVIEW_REQUIRED",
                    "the replayed command grammar did not recognize this row as command-like; active replacement classification needs atom-level semantic review",
                ))
        elif semantic_class == "historical_execution_evidence":
            findings.append(finding(
                "BUN_PLAN_HISTORICAL_CUSTODY_RECEIPT_MISSING",
                "historical classification has no immutable evidence custody or consumer-replacement receipt",
            ))
            if row["consumer_reachability"]["external_reference_count"]:
                findings.append(finding(
                    "BUN_PLAN_HISTORICAL_UNREACHABILITY_UNPROVEN",
                    "one or more current files mention the PLAN stem; the scan cannot prove that no executable or normative consumer remains",
                ))
        elif semantic_class == "stale_orphan":
            findings.append(finding(
                "BUN_PLAN_STALE_UNREACHABILITY_RECEIPT_MISSING",
                "absence of an exact PLAN-stem mention is not a closed-world proof of unreachability through aliases, IDs, symbols, or generated consumers",
            ))
        else:
            findings.append(finding(
                "BUN_PLAN_UNKNOWN_SEMANTIC_CLASS",
                f"unsupported semantic class: {semantic_class}",
            ))

        reviewed.append({
            "atom_id": row["atom_id"],
            "source_atom_sha256": row["source_atom_sha256"],
            "file": row["file"],
            "line": row["line"],
            "semantic_class": semantic_class,
            "command_like": row["command_like"],
            "target_family": row["target_family"],
            "declared_reachability": row["reachability"],
            "external_reference_count": row["consumer_reachability"]["external_reference_count"],
            "external_reference_checks": ref_checks,
            "findings": findings,
            "static_verdict": "not_verified",
            "coverage_credit": False,
            "verified": False,
            "authority_receipt": None,
        })

    finding_counts = Counter(
        item["code"] for row in reviewed for item in row["findings"]
    )
    class_counts = Counter(row["semantic_class"] for row in reviewed)
    superset_counts = Counter(row["semantic_class"] for row in superset)
    artifact = {
        "schema_version": "helix.bun-plan-replacement-reachability-review.v1",
        "status": "static_review_complete_not_verified",
        "source_artifacts": {
            "adjudication": {
                "path": SOURCE.relative_to(ROOT).as_posix(),
                "sha256": sha256(SOURCE),
            },
            "corrected_projection": {
                "path": PROJECTION.relative_to(ROOT).as_posix(),
                "sha256": sha256(PROJECTION),
                "declared_plan_overlay_sha256": projection_slot["sha256"],
                "declared_plan_overlay_rows": projection_slot["adjudicated_rows"],
            },
        },
        "scope": {
            "superset_denominator": len(superset),
            "corrected_projection_plan_overlay_denominator": len(records),
            "selection_custody_note": "the 4,472-row superset is retained for omission audit; the corrected projection consumes the selected 2,577-row overlay",
            "runtime_execution": 0,
            "external_changes": 0,
        },
        "summary": {
            "reviewed_rows": len(reviewed),
            "unique_atom_ids": len(set(atom_ids)),
            "by_semantic_class": dict(sorted(class_counts.items())),
            "superset_by_semantic_class": dict(sorted(superset_counts.items())),
            "finding_counts": dict(sorted(finding_counts.items())),
            "active_replacement_rows_with_bound_target_artifact": 0,
            "historical_rows_with_unreachability_receipt": 0,
            "stale_orphan_rows_with_unreachability_receipt": 0,
            "authority_receipts": 0,
            "coverage_credit_true": 0,
            "verified_true": 0,
        },
        "mechanical_limits": [
            "an exact PLAN-stem mention proves a textual reference only",
            "target_family does not identify a replacement artifact or executable oracle",
            "absence of a PLAN-stem mention does not prove closed-world unreachability",
            "plan status and evidence-like headings do not establish immutable custody",
            "static review cannot grant runtime replacement or platform compatibility verification",
        ],
        "promotion_requirements": [
            "bind every active atom to a current Node/Python artifact path or symbol, source digest, and oracle",
            "replay the bound oracle and attach an independent execution receipt",
            "bind historical rows to immutable custody and prove all reachable consumers were replaced",
            "bind stale-orphan rows to a closed-world unreachability receipt covering aliases, IDs, symbols, and generated consumers",
        ],
        "records": reviewed,
    }
    Path(sys.argv[1]).write_text(
        json.dumps(artifact, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
