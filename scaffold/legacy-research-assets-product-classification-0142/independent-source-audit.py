#!/usr/bin/env python3
"""Independent, static audit of the 57 archived research assets for SCF-B-0142.

This audit deliberately derives its scope from the fixed BASE disposition ledger;
it does not import the bundle generator, validator, or generated classification.
Legacy material is read only through Git objects and is never executed.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

BASE = "7afee33ae892fe1a3cf1085fac4e02d923ece01d"
ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "scaffold/legacy-research-assets-product-classification-0142/independent-source-audit.json"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
MANIFEST_PATH = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
FAILURE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
BOUNDARY = "docs/concept/product-boundary.md"
APPROVAL = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
TARGET_PREFIX = "docs/research/assets/"
WAVES = tuple(
    f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl"
    if n <= 36
    else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl"
    for n in range(1, 51)
)
PRODUCTS = {
    "HELIX-HARNESS": {
        "l1": "docs/helix-harness/L1-planning/product-intent.md",
        "l1_marker": "| HARNESS-L1-004 |",
        "boundary_marker": "| HARNESS |",
        "approval_marker": "| `HDEC-HARNESS-L1-01` |",
    },
    "HELIX-OS": {
        "l1": "docs/helix-os/L1-planning/system-intent.md",
        "l1_marker": "| HELIXOS-L1-003 |",
        "boundary_marker": "| HELIX-OS |",
        "approval_marker": "| `HDEC-HELIXOS-L1-01` |",
    },
    "HELIX-Web": {
        "l1": "docs/helix-web/L1-planning/product-intent.md",
        "l1_marker": "| HELIXWEB-L1-001 |",
        "boundary_marker": "| HELIX-Web |",
        "approval_marker": "| `HDEC-HELIXWEB-L1-01` |",
    },
    "HELIX-Web-OS": {
        "l1": "docs/helix-web-os/L1-planning/system-intent.md",
        "l1_marker": "| HELIXWEBOS-L1-002 |",
        "boundary_marker": "| HELIX-Web-OS |",
        "approval_marker": "| `HDEC-HELIXWEBOS-L1-01` |",
    },
}


def run_git(*args: str) -> bytes:
    return subprocess.check_output(["git", *args])


def git_bytes(path: str) -> bytes:
    return run_git("show", f"{BASE}:{path}")


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def blob_oid(path: str) -> str:
    return run_git("rev-parse", f"{BASE}:{path}").decode().strip()


def jsonl(path: str) -> list[tuple[int, dict]]:
    result = []
    for number, line in enumerate(git_bytes(path).decode(errors="replace").splitlines(), 1):
        if not line.strip():
            continue
        row = json.loads(line)
        if not isinstance(row, dict):
            raise AssertionError(f"non-object JSONL row: {path}:{number}")
        result.append((number, row))
    return result


def regular_blob(path: str) -> tuple[str, str, str]:
    archive_path = ARCHIVE_PREFIX + path
    rows = run_git("ls-tree", BASE, "--", archive_path).decode().splitlines()
    if len(rows) != 1:
        raise AssertionError(f"archive path missing or ambiguous: {archive_path}")
    left, entry_path = rows[0].split("\t", 1)
    mode, kind, oid = left.split()
    if entry_path != archive_path or mode != "100644" or kind != "blob":
        raise AssertionError(f"archive source is not regular blob mode 100644: {rows[0]}")
    return mode, kind, oid


def marker_receipt(path: str, marker: str) -> dict:
    data = git_bytes(path)
    for number, line in enumerate(data.decode(errors="replace").splitlines(), 1):
        if marker in line:
            return {
                "path": path,
                "blob": blob_oid(path),
                "sha256": tagged(data),
                "line": number,
                "line_text": line,
                "line_text_sha256": tagged(line.encode()),
                "marker": marker,
            }
    raise AssertionError(f"marker missing: {path}: {marker}")


def source_role(path: str) -> str:
    name = path.rsplit("/", 1)[-1]
    if name.endswith(".mutation.json"):
        return "review_mutation_case"
    if name.endswith(".evidence.json"):
        return "review_receipt_case"
    if name == "summary.json":
        return "historical_run_summary"
    if "/bench/prompts/" in path:
        return "benchmark_prompt_or_fixture"
    if "/blind-judge/" in path and name == "verdict.json":
        return "historical_blind_judge_verdict"
    if "/blind-judge/" in path:
        return "generated_candidate_source_as_text"
    if name.startswith("run-") and name.endswith(".ts"):
        return "historical_runner_source_read_only"
    if name.endswith(".stderr.txt"):
        return "historical_stderr_capture"
    if name.endswith(".stdout.txt"):
        return "historical_stdout_capture"
    if name.endswith(".ts.txt"):
        return "generated_source_or_test_as_text"
    return "historical_research_artifact"


def source_group(path: str) -> str:
    if "/kimi-review-lane-admission-" in path:
        return "kimi-review-lane-admission"
    if "/kimi-s4-bench-" in path:
        return "kimi-s4-bench"
    if "/kimi-smoke-rerun-" in path:
        return "kimi-smoke-rerun"
    raise AssertionError(f"unexpected target group: {path}")


def main() -> None:
    dispositions = jsonl(DISPOSITION)
    phases = jsonl(PHASE)
    decisions = jsonl(DECISIONS)
    read_after = jsonl(READ_AFTER)
    target_rows = [(number, row) for number, row in dispositions if row.get("source_path", "").startswith(TARGET_PREFIX)]
    ids = [row["asset_id"] for _, row in target_rows]
    paths = [row["source_path"] for _, row in target_rows]
    if len(target_rows) != 57 or len(set(ids)) != 57 or len(set(paths)) != 57:
        raise AssertionError(f"unexpected exact scope: rows={len(target_rows)} ids={len(set(ids))} paths={len(set(paths))}")

    phase_by_id: dict[str, list[tuple[int, dict]]] = defaultdict(list)
    decisions_by_id: dict[str, list[tuple[int, dict]]] = defaultdict(list)
    after_by_id: dict[str, list[tuple[int, dict]]] = defaultdict(list)
    for number, row in phases:
        phase_by_id[row.get("asset_id", "")].append((number, row))
    for number, row in decisions:
        decisions_by_id[row.get("asset_id", "")].append((number, row))
    for number, row in read_after:
        after_by_id[row.get("asset_id", "")].append((number, row))

    manifest = {}
    for line in git_bytes(MANIFEST_PATH).decode(errors="replace").splitlines():
        fields = line.split(maxsplit=1)
        if len(fields) == 2:
            manifest[fields[1].lstrip("* ")] = "sha256:" + fields[0]
    wave_contents = {path: git_bytes(path) for path in WAVES}
    failure_data = git_bytes(FAILURE)
    consumer_data = git_bytes(CONSUMER)
    records = []
    group_counts = Counter()
    role_counts = Counter()
    phase_counts = Counter()
    direct_decision_count = 0
    direct_read_after_count = 0
    total_bytes = 0
    total_lines = 0
    for disp_line, asset in target_rows:
        asset_id = asset["asset_id"]
        path = asset["source_path"]
        group = source_group(path)
        group_counts[group] += 1
        role = source_role(path)
        role_counts[role] += 1
        archive_path = ARCHIVE_PREFIX + path
        mode, kind, oid = regular_blob(path)
        data = git_bytes(archive_path)
        digest = tagged(data)
        line_count = len(data.decode(errors="replace").splitlines())
        total_bytes += len(data)
        total_lines += line_count
        if digest != "sha256:" + asset["source_sha256"] or digest != manifest.get(path):
            raise AssertionError(f"source/ledger/MANIFEST SHA mismatch: {path}")
        phase_matches = phase_by_id.get(asset_id, [])
        if len(phase_matches) != 1:
            raise AssertionError(f"phase row count for {asset_id}: {len(phase_matches)}")
        phase_line, phase = phase_matches[0]
        phase_status = phase.get("phase_classification_status")
        phase_counts[phase_status] += 1
        asset_decisions = decisions_by_id.get(asset_id, [])
        asset_read_after = after_by_id.get(asset_id, [])
        direct_decision_count += len(asset_decisions)
        direct_read_after_count += len(asset_read_after)
        id_wave_hits = [wave for wave, contents in wave_contents.items() if asset_id.encode() in contents]
        path_wave_hits = [wave for wave, contents in wave_contents.items() if path.encode() in contents]
        failure_id_hit = asset_id.encode() in failure_data
        failure_path_hit = path.encode() in failure_data
        consumer_id_hit = asset_id.encode() in consumer_data
        consumer_path_hit = path.encode() in consumer_data
        records.append(
            {
                "asset_id": asset_id,
                "disposition_line": disp_line,
                "source_path": path,
                "source_group": group,
                "artifact_role": role,
                "source": {
                    "archive_path": archive_path,
                    "blob": oid,
                    "mode": mode,
                    "type": kind,
                    "bytes": len(data),
                    "line_count": line_count,
                    "sha256": digest,
                    "ledger_sha256": "sha256:" + asset["source_sha256"],
                    "manifest_sha256": manifest[path],
                    "all_three_sha_match": True,
                    "static_read_only": True,
                },
                "disposition": {
                    "asset_class": asset.get("asset_class"),
                    "disposition": asset.get("disposition"),
                    "product_target": asset.get("product_target"),
                    "implementation_status": asset.get("implementation_status"),
                    "consumer_refs": sorted(asset.get("consumer_refs", [])),
                    "decision_record_ref": asset.get("decision_record_ref"),
                    "read_after_record_ref": asset.get("read_after_record_ref"),
                },
                "phase": {
                    "line": phase_line,
                    "status": phase_status,
                    "candidate_phase_targets": sorted(phase.get("candidate_phase_targets", [])),
                    "candidate_product_targets": sorted(phase.get("candidate_product_targets", [])),
                    "implementation_evidence_state": phase.get("implementation_evidence_state"),
                    "unresolved": sorted(phase.get("unresolved", [])),
                },
                "asset_specific_decision_rows": [number for number, _ in asset_decisions],
                "asset_specific_read_after_rows": [number for number, _ in asset_read_after],
                "wave_id_hits": id_wave_hits,
                "wave_path_hits": path_wave_hits,
                "failure_inventory_id_or_path_hit": failure_id_hit or failure_path_hit,
                "consumer_inventory_id_or_path_hit": consumer_id_hit or consumer_path_hit,
            }
        )

    if group_counts != Counter({"kimi-review-lane-admission": 22, "kimi-s4-bench": 20, "kimi-smoke-rerun": 15}):
        raise AssertionError(f"unexpected group counts: {group_counts}")
    empty_records = [record for record in records if record["source"]["bytes"] == 0]
    expected_empty = 5
    if len(empty_records) != expected_empty or total_bytes != 58243 or total_lines != 1181:
        raise AssertionError(f"unexpected source totals: empty={len(empty_records)} bytes={total_bytes} lines={total_lines}")
    if direct_decision_count or direct_read_after_count:
        raise AssertionError("target-specific decision or read-after rows exist; re-audit required")

    boundary_receipts = {
        product: marker_receipt(BOUNDARY, entry["boundary_marker"])
        for product, entry in PRODUCTS.items()
    }
    l1_receipts = {
        product: marker_receipt(entry["l1"], entry["l1_marker"])
        for product, entry in PRODUCTS.items()
    }
    approval_receipts = {
        product: marker_receipt(APPROVAL, entry["approval_marker"])
        for product, entry in PRODUCTS.items()
    }
    for record in records:
        if record["wave_id_hits"] or record["wave_path_hits"]:
            raise AssertionError(f"direct wave hit requires review: {record['asset_id']}")
        if record["failure_inventory_id_or_path_hit"] or record["consumer_inventory_id_or_path_hit"]:
            raise AssertionError(f"asset-specific failure/consumer inventory hit requires review: {record['asset_id']}")

    phase_status_counts = dict(sorted(phase_counts.items()))
    if phase_status_counts != {"unresolved": 34, "unresolved_with_candidate": 23}:
        raise AssertionError(f"unexpected phase status counts: {phase_status_counts}")
    phase_candidate_counts = {
        "without_candidate_phase": sum(not record["phase"]["candidate_phase_targets"] for record in records),
        "PHCAP-12": sum(record["phase"]["candidate_phase_targets"] == ["PHCAP-12"] for record in records),
        "PHCAP-15": sum(record["phase"]["candidate_phase_targets"] == ["PHCAP-15"] for record in records),
    }
    candidate_product_anomalies = [
        {
            "asset_id": record["asset_id"],
            "source_path": record["source_path"],
            "candidate_products": record["phase"]["candidate_product_targets"],
            "candidate_phase_targets": record["phase"]["candidate_phase_targets"],
            "note": "bootstrap candidates name HELIX-OS and HELIX-Web-OS; the bundle path-group heuristic alone would place this smoke fixture in the OS candidate set",
        }
        for record in records
        if record["phase"]["candidate_product_targets"]
    ]
    audit = {
        "schema_revision": 1,
        "audit_kind": "independent_static_source_and_registry_join",
        "base_revision": BASE,
        "derivation": {
            "target_scope_source": DISPOSITION,
            "generated_classification_read": False,
            "generator_or_validator_imported": False,
            "archive_access": "fixed BASE Git objects only; no archive path execution",
            "source_sha_rule": "Git object bytes = disposition source_sha256 = MANIFEST.sha256 entry",
        },
        "scope": {
            "prefix": TARGET_PREFIX,
            "record_count": len(records),
            "unique_asset_ids": len(set(ids)),
            "unique_source_paths": len(set(paths)),
            "asset_ids_sha256": tagged("\n".join(sorted(ids)).encode()),
            "source_paths_sha256": tagged("\n".join(sorted(paths)).encode()),
        },
        "source_totals": {
            "bytes": total_bytes,
            "lines": total_lines,
            "empty_source_count": len(empty_records),
            "empty_source_asset_ids": sorted(record["asset_id"] for record in empty_records),
            "empty_source_sha256": tagged(b""),
            "group_counts": dict(sorted(group_counts.items())),
            "artifact_role_counts": dict(sorted(role_counts.items())),
            "same_source_sha_occurrences": dict(sorted(Counter(record["source"]["sha256"] for record in records if record["source"]["bytes"] == 0).items())),
        },
        "static_content_review": {
            "kimi_review_lane_admission": "Two dated lanes contain approve/quota-switch/schema-drift/seeded-blocker/tool-request receipts and mutation cases for high-risk/tool activity/head binding/stale receipt/closure drift. These are historical evidence fixtures, not current runtime or acceptance proof.",
            "kimi_s4_bench": "Prompt inputs, runner source, generated code/test candidates, blind-judge verdict, summaries, and captured outputs; four stderr captures are empty. The runner source can invoke an external model and execute generated code, and was read as text only.",
            "kimi_smoke_rerun": "Prompt fixtures, runner source, historical echo/codegen/scope/ACP CLI output and summary; one stderr capture is empty. The runner source was read as text only.",
            "category_limit": "The path-group counts support research-candidate grouping only. They do not establish per-asset product ownership, phase admission, implementation, acceptance, or successor.",
            "historical_claim_limit": "CLI outputs and summaries remain historical source content; this audit performed no old-runtime, test, CI, workflow, hook, adapter, or runner execution.",
        },
        "registry_join": {
            "phase_status_counts": phase_status_counts,
            "phase_candidate_counts": phase_candidate_counts,
            "target_specific_decision_rows": direct_decision_count,
            "target_specific_read_after_rows": direct_read_after_count,
            "all_disposition_rows_formally_unresolved": all(record["disposition"]["disposition"] == "unresolved" and record["disposition"]["product_target"] == "unresolved" and record["disposition"]["implementation_status"] == "unknown" for record in records),
            "all_consumer_refs_empty": all(not record["disposition"]["consumer_refs"] for record in records),
            "failure_inventory": {"path": FAILURE, "sha256": tagged(failure_data), "target_id_hits": 0, "target_path_hits": 0},
            "consumer_inventory": {"path": CONSUMER, "sha256": tagged(consumer_data), "target_id_hits": 0, "target_path_hits": 0},
            "wave_inputs_scanned": len(wave_contents),
            "target_id_wave_hits": 0,
            "target_path_wave_hits": 0,
            "candidate_product_anomalies": candidate_product_anomalies,
            "interpretation": "No asset-specific decision, read-after, failure, or consumer closure was found. Absence of direct references does not establish absence of indirect consumers; closure remains pending.",
        },
        "four_product_current_main_evidence": {
            "product_boundary": {"revision": BASE, "path": BOUNDARY, "sha256": tagged(git_bytes(BOUNDARY)), "rows": boundary_receipts},
            "approval_decision": {"revision": BASE, "path": APPROVAL, "sha256": tagged(git_bytes(APPROVAL)), "rows": approval_receipts, "scope_limit": "Approval records bind exact L1 document bytes; they do not admit lower layers, assign these 57 assets, or authorize implementation."},
            "l1_documents": {product: {**l1_receipts[product], "product": product} for product in PRODUCTS},
        },
        "wave_inputs": [
            {"path": path, "blob": blob_oid(path), "sha256": tagged(contents)}
            for path, contents in wave_contents.items()
        ],
        "records": sorted(records, key=lambda record: record["asset_id"]),
        "authority_boundary": {
            "authority_effect": "none",
            "formal_asset_classification_updated": False,
            "formal_product_authority": None,
            "formal_implementation_status": "unknown",
            "phase_updated": False,
            "successor_assignment": None,
            "new_build_allowed": False,
        },
    }
    OUTPUT.write_text(json.dumps(audit, ensure_ascii=False, sort_keys=True, indent=2) + "\n")
    print(f"SCF-B-0142 independent source audit PASS records={len(records)} bytes={total_bytes} lines={total_lines} phase_candidates={phase_candidate_counts} target_wave_edges=0")


if __name__ == "__main__":
    main()
