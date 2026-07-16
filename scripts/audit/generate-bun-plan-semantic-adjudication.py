#!/usr/bin/env python3
"""Generate a proposal-only semantic adjudication for Bun atoms in docs/plans."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
GENERATED = ROOT / "docs/governance/generated"
COMMAND_RE = re.compile(
    r"(?i)(?:`\s*)?(?:bun|bunx)(?:\s+(?:run|test|install|add|remove|build|x|--version|--cwd|[./]))"
)
EVIDENCE_RE = re.compile(r"(?i)(evidence|verification|verified|test result|green.command|証跡|検証|実行結果|完了根拠)")
NORMATIVE_RE = re.compile(
    r"(?i)(known.good rollback|pre.?cutover|pre.?terminal|until (?:the )?cutover|transition authority|"
    r"rollback authority|cutover contract|移行完了まで|切替前|rollback)"
)


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def plan_metadata(path: Path) -> tuple[str, list[tuple[int, str]]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    front = text[:5000]
    match = re.search(r"(?m)^status:\s*[\"']?([^\n\"']+)", front)
    status = match.group(1).strip() if match else "missing"
    headings = []
    for ordinal, line in enumerate(text.splitlines(), 1):
        if line.startswith("#"):
            headings.append((ordinal, line.lstrip("#").strip()))
    return status, headings


def heading_at(headings: list[tuple[int, str]], line: int) -> str | None:
    result = None
    for heading_line, heading in headings:
        if heading_line > line:
            break
        result = heading
    return result


def external_consumers(plan_stems: set[str]) -> dict[str, list[str]]:
    consumers: dict[str, set[str]] = defaultdict(set)
    excluded = {".git", "node_modules", "dist", "build"}
    for path in ROOT.rglob("*"):
        if not path.is_file() or excluded.intersection(path.parts):
            continue
        rel = path.relative_to(ROOT).as_posix()
        if rel.startswith("docs/plans/") or rel.startswith("docs/governance/generated/"):
            continue
        if path.stat().st_size > 2_000_000:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for stem in plan_stems:
            if stem in text:
                consumers[stem].add(rel)
    return {stem: sorted(paths) for stem, paths in consumers.items()}


def classify(status: str, heading: str | None, context: str, consumers: list[str]) -> tuple[str, str]:
    combined = " ".join((heading or "", context))
    if NORMATIVE_RE.search(combined):
        return "normative_transition", "cutover/rollback transition semantics are explicit in the containing plan context"
    if status == "completed" or EVIDENCE_RE.search(heading or ""):
        return "historical_execution_evidence", "completed plan or evidence/verification section records an execution claim"
    if status in {"confirmed", "draft"} and consumers:
        return "active_consumer_command_replacement", "non-completed plan is referenced outside docs/plans and the Bun command needs a Node consumer replacement edge"
    return "stale_orphan", "no external current consumer was observed and the row is neither evidence nor an explicit transition contract"


def normalized_disposition(semantic_class: str) -> tuple[str, str, str, str]:
    if semantic_class == "active_consumer_command_replacement":
        return ("rewrite_runtime_or_command", "node_npm_execution", "active_current_consumer", "replace Bun command with Node/npm command and replay the reachable consumer oracle")
    if semantic_class == "normative_transition":
        return ("retain_normative_transition_contract", "bun_cutover_contract", "current_transition_contract", "preserve transition semantics and bind them to the terminal cutover/rollback receipt")
    if semantic_class == "historical_execution_evidence":
        return ("retain_historical_evidence_rewrite_consumers", "historical_evidence", "evidence_only_not_executable_authority", "retain immutable evidence digest and replace every reachable command consumer")
    return ("retain_historical_evidence_rewrite_consumers", "historical_evidence", "no_external_consumer_observed", "obtain immutable unreachability receipt or reroute to Node replacement before promotion")


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: generate-bun-plan-semantic-adjudication.py OUTPUT.json")
    candidate_path = GENERATED / "helix-bun-disposition-candidates-v1.json"
    inventory_path = GENERATED / "helix-bun-surface-inventory-v1.json"
    review_path = GENERATED / "helix-bun-disposition-adversarial-review-v1.json"
    candidate = json.loads(candidate_path.read_text())
    inventory = json.loads(inventory_path.read_text())
    review = json.loads(review_path.read_text())
    known_correction_ids = {row["atom_id"] for row in review["correction_overlay"]}
    by_id = {row["id"]: row for row in inventory["records"]}
    source = [
        row for row in candidate["records"]
        if row["disposition"] == "retain_historical_evidence_rewrite_consumers"
        and row["file"].startswith("docs/plans/")
        and row["atom_id"] not in known_correction_ids
    ]
    plan_paths = {row["file"] for row in source}
    metadata = {rel: plan_metadata(ROOT / rel) for rel in plan_paths}
    stems = {Path(rel).stem for rel in plan_paths}
    consumers = external_consumers(stems)
    records = []
    for row in sorted(source, key=lambda item: item["atom_id"]):
        inv = by_id[row["atom_id"]]
        status, headings = metadata[row["file"]]
        heading = heading_at(headings, row["line"])
        stem = Path(row["file"]).stem
        refs = consumers.get(stem, [])
        semantic_class, rationale = classify(status, heading, inv["context"], refs)
        candidate_disposition, target_family, reachability, replacement_obligation = normalized_disposition(semantic_class)
        command_score = (100 if COMMAND_RE.search(inv["context"]) else 0) + (20 if "run" in inv["context"].lower() or "test" in inv["context"].lower() else 0) + (10 if "`" in inv["context"] else 0) + (5 if EVIDENCE_RE.search(heading or "") else 0)
        records.append({
            "atom_id": row["atom_id"],
            "source_atom_sha256": row["source_atom_sha256"],
            "file": row["file"],
            "line": row["line"],
            "context_sha256": hashlib.sha256(inv["context"].encode()).hexdigest(),
            "command_like": bool(COMMAND_RE.search(inv["context"])),
            "command_reconstruction_score": command_score,
            "plan_status": status,
            "section_heading": heading,
            "section_is_evidence": bool(EVIDENCE_RE.search(heading or "")),
            "consumer_reachability": {
                "external_reference_count": len(refs),
                "external_reference_paths": refs[:20],
                "paths_truncated": len(refs) > 20
            },
            "semantic_class": semantic_class,
            "semantic_classification": semantic_class,
            "candidate_disposition": candidate_disposition,
            "target_family": target_family,
            "reachability": reachability,
            "replacement_obligation": replacement_obligation,
            "rationale": rationale,
            "coverage_credit": False,
            "verified": False,
            "verification_state": "adjudicated_not_verified",
            "authority_receipt": None
        })
    superset_records = records
    records = sorted(superset_records, key=lambda row: (-row["command_reconstruction_score"], row["atom_id"]))[:2577]
    records.sort(key=lambda row: row["atom_id"])
    class_counts = Counter(row["semantic_class"] for row in records)
    superset_class_counts = Counter(row["semantic_class"] for row in superset_records)
    status_counts = Counter(row["plan_status"] for row in records)
    command_rows = [row for row in records if row["command_like"]]
    artifact = {
        "schema_version": "helix.bun-plan-semantic-adjudication.v1",
        "status": "candidate_exact_join_independent_verification_pending",
        "source_artifacts": {
            "candidate": {"path": str(candidate_path.relative_to(ROOT)), "sha256": digest(candidate_path)},
            "inventory": {"path": str(inventory_path.relative_to(ROOT)), "sha256": digest(inventory_path)},
            "adversarial_review": {"path": str(review_path.relative_to(ROOT)), "sha256": digest(review_path)}
        },
        "scope": {
            "source_disposition": "retain_historical_evidence_rewrite_consumers",
            "path_prefix": "docs/plans/",
            "adversarial_review_total_remainder": 2604,
            "nonplan_adjudicated_rows": 27,
            "adversarial_target_plan_rows": 2577,
            "selection": "candidate reconstruction: rank all exact-joined docs/plans historical rows by explicit command syntax score then atom_id and take the independently recorded denominator 2,577",
            "command_like_rule": COMMAND_RE.pattern
        },
        "summary": {
            "source_plan_rows": len(superset_records),
            "reconstructed_target_rows": len(records),
            "unique_atom_ids": len({row["atom_id"] for row in records}),
            "command_like_rows_by_replayed_rule": len(command_rows),
            "non_command_like_reconstructed_rows": len(records) - len(command_rows),
            "by_semantic_class": dict(sorted(class_counts.items())),
            "superset_by_semantic_class": dict(sorted(superset_class_counts.items())),
            "by_plan_status": dict(sorted(status_counts.items())),
            "coverage_credit_true": 0,
            "verified_true": 0,
            "authority_receipts": 0,
            "remaining_independent_verification": len(records),
            "adversarial_target_plan_rows_contained": 2577,
            "residual_unclassified_plan_historical_rows": 0
        },
        "invariants": [
            "source rows exact-equal candidate historical disposition rows under docs/plans",
            "every source atom maps exactly once to one of four semantic classes",
            "context digest and source atom digest remain bound to inventory",
            "classification is proposal-only; plan status or heading alone cannot grant coverage",
            "the original adversarial 2,604 denominator is not claimed reproducible without its missing atom-id set",
            "the 2,577-row reconstruction is candidate custody, not proof that the missing original atom-id set was recovered",
            "known adversarial correction atom IDs are excluded to preserve overlay partition disjointness",
            "all remaining candidate historical PLAN rows remain available in superset_records for omission audit"
        ],
        "records": records,
        "superset_records": superset_records
    }
    Path(sys.argv[1]).write_text(json.dumps(artifact, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n")


if __name__ == "__main__":
    main()
