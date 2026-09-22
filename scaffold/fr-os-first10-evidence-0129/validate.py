#!/usr/bin/env python3
"""Fail-closed validator for the fixed-base HELIX-OS FR first-ten slice."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(os.environ.get("SCF_REPO_ROOT", Path(__file__).resolve().parents[2]))
BUNDLE = ROOT / "scaffold/fr-os-first10-evidence-0129"
BASE = "217e3a6e1c3e6ce25205d8330a96e0853c18f61b"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
CROSSWALK = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
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
    CROSSWALK, "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl", DISPOSITION, PHASE,
    DECISIONS, READ_AFTER, CURRENT_EVIDENCE, CURRENT_INVENTORY, CURRENT_README, *CONTEXT_INPUTS,
    *WAVES.values(),
]
INVENTORY_KEYS = {
    "schema_revision", "binding_id", "bundle_kind", "base_revision", "base_source_mode",
    "authority_boundary", "scope", "selection", "input_digests", "expected_unit_count",
    "expected_edge_count", "expected_unique_asset_count", "output_sha256", "forbidden_operations",
}
ROW_KEYS = {
    "schema", "unit_candidate_id", "source_requirement", "existing_218_binding",
    "current_evidence_partition", "semantic_review_edges", "asset_evidence", "status_partition",
    "directly_established", "unresolved", "authority_boundary",
}
ASSET_KEYS = {
    "asset_id", "ledger_record", "phase_classification_record", "decision_records", "read_after_records",
    "edge_refs", "source_exact", "evidence_boundary",
}


def fail(code: str, message: str) -> None:
    raise AssertionError(f"{code}: {message}")


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def digest(data: bytes) -> str:
    return "sha256:" + sha(data)


def canonical(value: object) -> str:
    return digest(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def git_bytes(path: str) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{BASE}:{path}"], cwd=ROOT)
    except subprocess.CalledProcessError as exc:
        fail("E_BASE_SOURCE", f"missing BASE object {path}: {exc}")


def git_blob(path: str) -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", f"{BASE}:{path}"], cwd=ROOT, text=True).strip()
    except subprocess.CalledProcessError as exc:
        fail("E_BASE_SOURCE", f"missing BASE blob {path}: {exc}")


def base_rows(path: str) -> list[tuple[int, dict]]:
    return [(i, json.loads(line)) for i, line in enumerate(git_bytes(path).decode().splitlines(), 1) if line.strip()]


def local_json(path: Path) -> object:
    try:
        return json.loads(path.read_text())
    except (OSError, json.JSONDecodeError) as exc:
        fail("E_SCHEMA", f"cannot read {path}: {exc}")


def local_jsonl(path: Path) -> list[dict]:
    try:
        return [json.loads(x) for x in path.read_text().splitlines() if x.strip()]
    except (OSError, json.JSONDecodeError) as exc:
        fail("E_SCHEMA", f"cannot read {path}: {exc}")


def targets() -> list[tuple[int, dict]]:
    selected = []
    for line, row in base_rows(CROSSWALK):
        unit = row.get("unit_candidate_id", "")
        if unit.startswith("IRUNIT-HIL-FR-") and unit.endswith("-HELIX-OS") and row.get("product_scope") == ["HELIX-OS"]:
            selected.append((line, row))
            if len(selected) == 10:
                break
    if len(selected) != 10:
        fail("E_SCOPE", "fixed BASE does not derive exactly ten target units")
    return selected


def wave_records() -> dict[str, list[tuple[int, int, dict]]]:
    wanted = [row[1]["unit_candidate_id"] for row in targets()]
    result = {unit: [] for unit in wanted}
    for wave, path in WAVES.items():
        for line, row in base_rows(path):
            if row.get("unit_candidate_id") in result:
                result[row["unit_candidate_id"]].append((wave, line, row))
    if any(len(v) != 3 for v in result.values()):
        fail("E_SCOPE", "each target unit must have exactly three fixed-base Wave edges")
    return result


def current_rows() -> dict[str, tuple[int, dict, str]]:
    wanted = {row[1]["unit_candidate_id"] for row in targets()}
    result = {}
    for line, raw in enumerate(git_bytes(CURRENT_EVIDENCE).decode().splitlines(), 1):
        if raw.strip():
            row = json.loads(raw)
            if row.get("unit_candidate_id") in wanted:
                result[row["unit_candidate_id"]] = (line, row, digest(raw.encode()))
    if set(result) != wanted:
        fail("E_CURRENT_PARTITION", "existing current evidence partition is incomplete")
    return result


def verify_base() -> None:
    head = os.environ.get("SCF_VALIDATION_HEAD", "HEAD")
    if subprocess.run(["git", "merge-base", "--is-ancestor", BASE, head], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode:
        fail("E_BASE_NOT_ANCESTOR", f"BASE {BASE} is not an ancestor of {head}")


def verify_inventory(inventory: dict, evidence_bytes: bytes) -> None:
    if set(inventory) != INVENTORY_KEYS:
        fail("E_SCHEMA", "inventory top-level key set drift")
    if inventory.get("schema_revision") != 1 or inventory.get("binding_id") != "SCF-B-0129":
        fail("E_SCHEMA", "inventory binding/schema drift")
    if inventory.get("bundle_kind") != "research_scaffold_fr_os_first10_evidence_partition":
        fail("E_SCHEMA", "inventory bundle_kind drift")
    if inventory.get("base_revision") != BASE or inventory.get("base_source_mode") != "all inputs and historical source evidence read from fixed BASE Git objects":
        fail("E_BASE_PIN", "fixed BASE declaration drift")
    if inventory.get("expected_unit_count") != 10 or inventory.get("expected_edge_count") != 30:
        fail("E_SCOPE", "expected unit/edge denominator drift")
    if inventory.get("expected_unique_asset_count") != 23:
        fail("E_SCOPE", "expected unique asset denominator drift")
    expected_scope = {
        "source_requirement_ids": [row[1]["source_requirement_id"] for row in targets()],
        "unit_ids": [row[1]["unit_candidate_id"] for row in targets()],
        "unit_count": 10, "new_unit_count": 0, "existing_218_binding": True,
        "product": "HELIX-OS", "wave_edge_count": 30, "unique_asset_count": 23,
        "ledger_scope_total": len(base_rows(DISPOSITION)), "wave_scope": [1, 50],
        "selection_rule": "crosswalk order; first ten IRUNIT-HIL-FR-* rows with product_scope exactly HELIX-OS",
    }
    if inventory.get("scope") != expected_scope:
        fail("E_SCOPE", "scope is not rederived from fixed BASE")
    expected_selection = {
        "crosswalk_path": CROSSWALK, "product_scope": "HELIX-OS", "ordered_unit_selection": "first ten matching crosswalk rows",
        "excluded": ["FR03-HELIX-OS because no such crosswalk unit exists", "all units after the first ten", "new unit creation"],
        "candidate_pool_semantics": "search candidates and representatives are retained as non-proof context",
    }
    if inventory.get("selection") != expected_selection:
        fail("E_SELECTION", "selection rule drift")
    expected_authority = {
        "authority_effect": "none", "formal_implementation_claim_updated": False,
        "formal_degradation_claim_updated": False, "formal_failure_claim_updated": False,
        "formal_unimplemented_claim_updated": False, "acceptance_verdict_created": False,
        "new_build_allowed": False, "status_rule": "unknown_when_direct_unit_evidence_is_missing",
    }
    if inventory.get("authority_boundary") != expected_authority:
        fail("E_AUTHORITY_BOUNDARY", "inventory authority boundary drift")
    expected_inputs = [{"path": p, "sha256": digest(git_bytes(p))} for p in INPUT_PATHS]
    if inventory.get("input_digests") != expected_inputs:
        fail("E_INPUT_DIGEST", "fixed BASE input digest set drift")
    if inventory.get("output_sha256") != digest(evidence_bytes):
        fail("E_OUTPUT_DIGEST", "evidence output digest mismatch")


def verify_ref(ref: dict, wave: int) -> None:
    path = ref.get("archive_path")
    data = git_bytes(path)
    lines = data.splitlines(keepends=True)
    start, end = ref.get("line_start"), ref.get("line_end")
    if not isinstance(start, int) or not isinstance(end, int) or start < 1 or end < start or end > len(lines):
        fail("E_ANCHOR", f"invalid anchor range {path}:{start}-{end}")
    selected = lines[start - 1:end]
    if wave <= 17:
        excerpt = b"".join(selected)
        rule = "raw_span_bytes"
    else:
        excerpt = b"\n".join(line.rstrip(b"\r\n") for line in selected)
        rule = "crlf_trim_lf_join_no_final_newline"
    if digest(excerpt) != ref.get("excerpt_sha256"):
        fail("E_ANCHOR", f"{wave} anchor hash mismatch for {path}:{start}-{end} ({rule})")


def expected_source_exact(asset: str, asset_edges: list[dict]) -> list[dict]:
    paths: dict[str, dict] = {}
    for edge in asset_edges:
        for ref in edge.get("evidence_refs", []):
            path = ref["archive_path"]
            data = git_bytes(path)
            lines = data.splitlines(keepends=True)
            start, end = ref["line_start"], ref["line_end"]
            span = b"".join(lines[start - 1:end])
            paths[path] = {
                "archive_path": path,
                "source_path": path.removeprefix(ARCHIVE_PREFIX),
                "git_blob_oid_at_base": git_blob(path),
                "git_blob_sha256_at_base": sha(data),
                "anchor": {
                    "line_start": start, "line_end": end, "span_sha256": digest(span),
                    "line_sha256": [digest(lines[i - 1].rstrip(b"\r\n")) for i in range(start, end + 1)],
                },
            }
    return [paths[path] for path in sorted(paths)]


def verify_status_partition(status: dict, edges: list[dict], current: dict) -> None:
    for field in ("old_implementation", "old_degradation", "old_failure", "old_consumer", "current_implementation", "acceptance", "unimplemented"):
        if status[field].get("status") != "unknown":
            fail("E_STATUS_PROMOTION", f"{field} status was promoted")
        if status[field].get("direct_unit_evidence") is not False:
            fail("E_STATUS_PROMOTION", f"{field} direct unit evidence was promoted")
        if not status[field].get("reason_unknown"):
            fail("E_STATUS_REASON", f"{field} has no unknown reason")
    if status["old_phase"].get("status") != "candidate_only" or status["old_phase"].get("direct_authority") is not False:
        fail("E_STATUS_PROMOTION", "phase candidate was promoted to authority")
    if status["old_phase"].get("reason_unknown") == "":
        fail("E_STATUS_REASON", "phase candidate has no boundary reason")
    if status["old_implementation"]["edge_ids"] != [e["review_id"] for e in edges]:
        fail("E_EDGE_SET", "implementation edge references drift")
    if status["old_degradation"]["edge_ids"] != [e["review_id"] for e in edges] or status["old_failure"]["edge_ids"] != [e["review_id"] for e in edges]:
        fail("E_EDGE_SET", "degradation/failure edge references drift")
    if status["current_implementation"].get("partition_status") != current.get("current_implementation_evidence", {}).get("status"):
        fail("E_CURRENT_PARTITION", "current partition status mismatch")


def validate(bundle: Path) -> None:
    verify_base()
    inventory = local_json(bundle / "inventory.json")
    if not isinstance(inventory, dict):
        fail("E_SCHEMA", "inventory must be an object")
    evidence_path = bundle / "evidence.jsonl"
    evidence_bytes = evidence_path.read_bytes()
    verify_inventory(inventory, evidence_bytes)
    actual = local_jsonl(evidence_path)
    target_rows = targets()
    expected_units = [row[1]["unit_candidate_id"] for row in target_rows]
    if len(actual) != 10 or [row.get("unit_candidate_id") for row in actual] != expected_units:
        fail("E_UNIT_SET", "evidence must contain the fixed first ten units exactly once and in selection order")
    all_edges = wave_records()
    current = current_rows()
    ledger = {row["asset_id"]: row for _, row in base_rows(DISPOSITION)}
    phase = {row["asset_id"]: row for _, row in base_rows(PHASE)}
    decisions = base_rows(DECISIONS)
    read_after = base_rows(READ_AFTER)
    expected_asset_ids = sorted({edge["asset_id"] for values in all_edges.values() for _, _, edge in values})
    all_asset_edges: dict[str, list[dict]] = {asset: [] for asset in expected_asset_ids}
    for values in all_edges.values():
        for _, _, edge in values:
            all_asset_edges[edge["asset_id"]].append(edge)
    actual_asset_ids = [a["asset_id"] for row in actual for a in row.get("asset_evidence", [])]
    if len(actual_asset_ids) != 30 or len(set(actual_asset_ids)) != 23:
        # The same crosswalk asset A60 is expected to occur in several unit rows.
        if len(actual_asset_ids) != 30 or sorted(set(actual_asset_ids)) != expected_asset_ids:
            fail("E_ASSET_SET", "per-unit asset memberships or unique asset set drift")
    elif sorted(set(actual_asset_ids)) != expected_asset_ids:
        fail("E_ASSET_SET", "unique asset set drift")
    for got, (crosswalk_line, crosswalk) in zip(actual, target_rows):
        unit = crosswalk["unit_candidate_id"]
        if set(got) != ROW_KEYS or got.get("schema") != "fr-os-first10-evidence-0129/v1":
            fail("E_SCHEMA", f"unit row key/schema drift at {unit}")
        if got["source_requirement"].get("crosswalk_line") != crosswalk_line or got["source_requirement"].get("crosswalk_row") != crosswalk:
            fail("E_SOURCE_REQUIREMENT", f"crosswalk row mismatch at {unit}")
        if got["source_requirement"].get("direct_legacy_asset_links") != crosswalk.get("direct_legacy_asset_links", []) or got["source_requirement"].get("candidate_pool_is_not_proof") is not True:
            fail("E_SOURCE_REQUIREMENT", f"candidate/direct-link boundary mismatch at {unit}")
        cur_line, cur_row, cur_digest = current[unit]
        cur = got["current_evidence_partition"]
        if cur.get("path") != CURRENT_EVIDENCE or cur.get("line") != cur_line or cur.get("row_sha256") != cur_digest or cur.get("row") != cur_row:
            fail("E_CURRENT_PARTITION", f"current-main partition row mismatch at {unit}")
        if cur.get("inventory_path") != CURRENT_INVENTORY or cur.get("inventory") != local_json_from_base(CURRENT_INVENTORY):
            fail("E_CURRENT_PARTITION", f"current-main inventory mismatch at {unit}")
        expected_edges = [{"wave": wave, "wave_line": line, "edge": edge} for wave, line, edge in all_edges[unit]]
        if got["semantic_review_edges"] != expected_edges:
            fail("E_EDGE_SET", f"Wave edge set/content mismatch at {unit}")
        edges = [entry["edge"] for entry in expected_edges]
        for entry in expected_edges:
            for ref in entry["edge"].get("evidence_refs", []):
                verify_ref(ref, entry["wave"])
        want_assets = sorted({edge["asset_id"] for edge in edges})
        unit_assets = got["asset_evidence"]
        if len(unit_assets) != len(want_assets) or len({a.get("asset_id") for a in unit_assets}) != len(want_assets) or sorted(a.get("asset_id") for a in unit_assets) != want_assets:
            fail("E_ASSET_SET", f"unit asset membership/count mismatch at {unit}")
        for asset in unit_assets:
            aid = asset.get("asset_id")
            if set(asset) != ASSET_KEYS or aid not in ledger:
                fail("E_SCHEMA", f"asset record schema/membership mismatch at {unit}/{aid}")
            if asset["ledger_record"] != ledger[aid]:
                fail("E_LEDGER_RECORD", f"full ledger record mismatch at {aid}")
            if asset["phase_classification_record"] != phase[aid]:
                fail("E_PHASE_RECORD", f"phase classification record mismatch at {aid}")
            want_decisions = [row for _, row in decisions if row.get("asset_id") == aid]
            want_read_after = [row for _, row in read_after if row.get("asset_id") == aid]
            if asset["decision_records"] != want_decisions or asset["read_after_records"] != want_read_after:
                fail("E_HISTORY_RECORD", f"decision/read-after record mismatch at {aid}")
            edge_for_asset = all_asset_edges[aid]
            if asset["edge_refs"] != sorted({edge["review_id"] for edge in edge_for_asset}):
                fail("E_EDGE_SET", f"asset edge refs mismatch at {aid}")
            if asset["source_exact"] != expected_source_exact(aid, edge_for_asset):
                fail("E_SOURCE_EVIDENCE", f"source blob/path/anchor mismatch at {aid}")
            boundary = asset["evidence_boundary"]
            if boundary.get("asset_level_only") is not True or boundary.get("implementation_proof") is not False or boundary.get("degradation_proof") is not False or boundary.get("failure_receipt") is not False or boundary.get("consumer_closure") is not False:
                fail("E_STATUS_PROMOTION", f"asset evidence boundary promoted at {aid}")
        verify_status_partition(got["status_partition"], edges, cur_row)
        expected_authority = {
            "authority_effect": "none", "research_only": True, "formal_implementation_claim": False,
            "formal_degradation_claim": False, "formal_failure_claim": False, "formal_unimplemented_claim": False,
            "acceptance_verdict": False, "legacy_execution_performed": False,
        }
        if got["authority_boundary"] != expected_authority:
            fail("E_AUTHORITY_BOUNDARY", f"unit authority boundary drift at {unit}")
        if got["existing_218_binding"].get("existing_unit") is not True or got["existing_218_binding"].get("new_unit_count") != 0:
            fail("E_SCOPE", f"existing 218-unit binding drift at {unit}")
        if not got["unresolved"] or not got["directly_established"]:
            fail("E_STATUS_REASON", f"missing unresolved/direct evidence partition at {unit}")
    print(f"PASS SCF-B-0129: 10 existing HELIX-OS units, 30 Wave edges, 23 unique old assets; all unit statuses remain unknown/candidate-only")


def local_json_from_base(path: str) -> object:
    return json.loads(git_bytes(path))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--bundle", type=Path, default=BUNDLE)
    args = parser.parse_args()
    try:
        validate(args.bundle.resolve())
    except AssertionError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
