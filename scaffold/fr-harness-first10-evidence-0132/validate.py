#!/usr/bin/env python3
"""Fail-closed validator for the fixed-base HELIX-HARNESS FR first-ten slice."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(os.environ.get("SCF_REPO_ROOT", Path(__file__).resolve().parents[2]))
BUNDLE = ROOT / "scaffold/fr-harness-first10-evidence-0132"
BASE = "94d99ebb4c55c2edb0575ac2dc100af0d5b93b90"
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
    "docs/helix-harness/L1-planning/product-intent.md",
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
FORBIDDEN_OPERATIONS = [
    "old archive runtime/test/CI/workflow/hook/adapter/source execution",
    "formal authority or status promotion",
    "merge",
    "close",
]
DIRECTLY_ESTABLISHED = [
    "the requirement source anchor and exact crosswalk row are fixed",
    "the listed Wave semantic edges and their source/asset anchors exist at BASE",
    "the listed historical ledger, phase, decision, and read-after records are exact static records",
    "candidate/representative assets are not implementation proof and no legacy execution was performed",
]
UNRESOLVED = [
    "unit-level old implementation status",
    "unit-level old degradation status",
    "unit-level old failure status",
    "unit-level consumer closure and acceptance",
    "current implementation and acceptance",
    "formal phase/product authority and successor",
    "explicit non-implementation verdict",
]


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
        if unit.startswith("IRUNIT-HIL-FR-") and unit.endswith("-HELIX-HARNESS") and row.get("product_scope") == ["HELIX-HARNESS"]:
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
    if inventory.get("schema_revision") != 1 or inventory.get("binding_id") != "SCF-B-0132":
        fail("E_SCHEMA", "inventory binding/schema drift")
    if inventory.get("bundle_kind") != "research_scaffold_fr_os_first10_evidence_partition":
        fail("E_SCHEMA", "inventory bundle_kind drift")
    if inventory.get("base_revision") != BASE or inventory.get("base_source_mode") != "all inputs and historical source evidence read from fixed BASE Git objects":
        fail("E_BASE_PIN", "fixed BASE declaration drift")
    if inventory.get("expected_unit_count") != 10 or inventory.get("expected_edge_count") != 30:
        fail("E_SCOPE", "expected unit/edge denominator drift")
    if inventory.get("expected_unique_asset_count") != 22:
        fail("E_SCOPE", "expected unique asset denominator drift")
    expected_scope = {
        "source_requirement_ids": [row[1]["source_requirement_id"] for row in targets()],
        "unit_ids": [row[1]["unit_candidate_id"] for row in targets()],
        "unit_count": 10, "new_unit_count": 0, "existing_218_binding": True,
        "product": "HELIX-HARNESS", "wave_edge_count": 30, "unique_asset_count": 22,
        "ledger_scope_total": len(base_rows(DISPOSITION)), "wave_scope": [1, 50],
        "selection_rule": "crosswalk order; first ten IRUNIT-HIL-FR-* rows with product_scope exactly HELIX-HARNESS",
    }
    if inventory.get("scope") != expected_scope:
        fail("E_SCOPE", "scope is not rederived from fixed BASE")
    expected_selection = {
        "crosswalk_path": CROSSWALK, "product_scope": "HELIX-HARNESS", "ordered_unit_selection": "first ten matching crosswalk rows",
        "excluded": ["FR01/FR02 HELIX-HARNESS rows are outside the fixed-base crosswalk selection; rows after the first ten are excluded", "all units after the first ten", "new unit creation"],
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
    if inventory.get("forbidden_operations") != FORBIDDEN_OPERATIONS:
        fail("E_FORBIDDEN_OPERATION", "forbidden operation boundary drift")


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


def expected_status_partition(edges: list[dict], assets: list[dict], current: dict) -> dict:
    asset_ids = [asset["asset_id"] for asset in assets]
    observed_consumers = sorted({ref for edge in edges for ref in edge.get("observed_consumer_refs", [])})
    phase_candidates = sorted({
        phase
        for asset in assets
        for phase in asset["phase_classification_record"].get("candidate_phase_targets", [])
    })
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
            "decision_or_read_after_count": sum(len(asset["decision_records"]) + len(asset["read_after_records"]) for asset in assets),
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


def verify_status_partition(status: dict, edges: list[dict], assets: list[dict], current: dict) -> None:
    for field in ("old_implementation", "old_degradation", "old_failure", "old_consumer", "current_implementation", "acceptance", "unimplemented"):
        observed = status.get(field, {})
        if observed.get("status") != "unknown":
            fail("E_STATUS_PROMOTION", f"{field} status was promoted")
        if observed.get("direct_unit_evidence") is not False:
            fail("E_STATUS_PROMOTION", f"{field} direct unit evidence was promoted")
        if not observed.get("reason_unknown"):
            fail("E_STATUS_REASON", f"{field} has no unknown reason")
    old_phase = status.get("old_phase", {})
    if old_phase.get("status") != "candidate_only" or old_phase.get("direct_authority") is not False:
        fail("E_STATUS_PROMOTION", "phase candidate was promoted to authority")
    if old_phase.get("reason_unknown") == "":
        fail("E_STATUS_REASON", "phase candidate has no boundary reason")
    if status.get("old_consumer", {}).get("closure_status") != "pending":
        fail("E_STATUS_PROMOTION", "consumer closure status was promoted")
    if status.get("old_implementation", {}).get("asset_ids") != [asset["asset_id"] for asset in assets]:
        fail("E_ASSET_SET", "implementation asset membership drift")
    if status.get("old_phase", {}).get("phase_ids") != expected_status_partition(edges, assets, current)["old_phase"]["phase_ids"]:
        fail("E_PHASE_RECORD", "phase candidate set drift")
    if status.get("old_implementation", {}).get("edge_ids") != [e["review_id"] for e in edges]:
        fail("E_EDGE_SET", "implementation edge references drift")
    if status.get("old_degradation", {}).get("edge_ids") != [e["review_id"] for e in edges] or status.get("old_failure", {}).get("edge_ids") != [e["review_id"] for e in edges]:
        fail("E_EDGE_SET", "degradation/failure edge references drift")
    if status.get("current_implementation", {}).get("partition_status") != current.get("current_implementation_evidence", {}).get("status"):
        fail("E_CURRENT_PARTITION", "current partition status mismatch")
    if status != expected_status_partition(edges, assets, current):
        fail("E_STATUS_PARTITION", "status partition field/value drift")


def expected_asset_record(asset_id: str, edge_for_asset: list[dict], ledger: dict, phase: dict, decisions: list[tuple[int, dict]], read_after: list[tuple[int, dict]]) -> dict:
    return {
        "asset_id": asset_id,
        "ledger_record": ledger[asset_id],
        "phase_classification_record": phase[asset_id],
        "decision_records": [row for _, row in decisions if row.get("asset_id") == asset_id],
        "read_after_records": [row for _, row in read_after if row.get("asset_id") == asset_id],
        "edge_refs": sorted({edge["review_id"] for edge in edge_for_asset}),
        "source_exact": expected_source_exact(asset_id, edge_for_asset),
        "evidence_boundary": {
            "asset_level_only": True,
            "implementation_proof": False,
            "degradation_proof": False,
            "failure_receipt": False,
            "consumer_closure": False,
            "reason": "Wave edge and ledger/source records are static asset evidence; no unit acceptance or executed receipt is attached.",
        },
    }


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
    if len(actual_asset_ids) != 30 or len(set(actual_asset_ids)) != 22:
        # The same crosswalk asset A60 is expected to occur in several unit rows.
        if len(actual_asset_ids) != 30 or sorted(set(actual_asset_ids)) != expected_asset_ids:
            fail("E_ASSET_SET", "per-unit asset memberships or unique asset set drift")
    elif sorted(set(actual_asset_ids)) != expected_asset_ids:
        fail("E_ASSET_SET", "unique asset set drift")
    for got, (crosswalk_line, crosswalk) in zip(actual, target_rows):
        unit = crosswalk["unit_candidate_id"]
        if set(got) != ROW_KEYS or got.get("schema") != "fr-harness-first10-evidence-0132/v1":
            fail("E_SCHEMA", f"unit row key/schema drift at {unit}")
        expected_source_requirement = {
            "crosswalk_line": crosswalk_line,
            "crosswalk_row": crosswalk,
            "direct_legacy_asset_links": crosswalk.get("direct_legacy_asset_links", []),
            "candidate_pool_is_not_proof": True,
        }
        if got.get("source_requirement") != expected_source_requirement:
            fail("E_SOURCE_REQUIREMENT", f"crosswalk row mismatch at {unit}")
        cur_line, cur_row, cur_digest = current[unit]
        expected_existing_binding = {
            "existing_unit": True,
            "new_unit_count": 0,
            "existing_partition_path": CURRENT_EVIDENCE,
            "existing_partition_line": cur_line,
            "existing_partition_row_sha256": cur_digest,
        }
        if got.get("existing_218_binding") != expected_existing_binding:
            fail("E_SCOPE", f"existing 218-unit binding drift at {unit}")
        expected_current_partition = {
            "path": CURRENT_EVIDENCE,
            "line": cur_line,
            "row_sha256": cur_digest,
            "row": cur_row,
            "inventory_path": CURRENT_INVENTORY,
            "inventory": local_json_from_base(CURRENT_INVENTORY),
            "base_pin_limitation": "existing FR-0109 partition is compared as current-main evidence, while this bundle independently pins all inputs to BASE",
        }
        if got.get("current_evidence_partition") != expected_current_partition:
            fail("E_CURRENT_PARTITION", f"current-main partition row mismatch at {unit}")
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
            if asset.get("ledger_record") != ledger[aid]:
                fail("E_LEDGER_RECORD", f"full ledger record mismatch at {aid}")
            if asset.get("phase_classification_record") != phase[aid]:
                fail("E_PHASE_RECORD", f"phase classification record mismatch at {aid}")
            want_decisions = [row for _, row in decisions if row.get("asset_id") == aid]
            want_read_after = [row for _, row in read_after if row.get("asset_id") == aid]
            if asset.get("decision_records") != want_decisions or asset.get("read_after_records") != want_read_after:
                fail("E_HISTORY_RECORD", f"decision/read-after record mismatch at {aid}")
            edge_for_asset = all_asset_edges[aid]
            if asset.get("edge_refs") != sorted({edge["review_id"] for edge in edge_for_asset}):
                fail("E_EDGE_SET", f"asset edge refs mismatch at {aid}")
            if asset.get("source_exact") != expected_source_exact(aid, edge_for_asset):
                fail("E_SOURCE_EVIDENCE", f"source blob/path/anchor mismatch at {aid}")
            expected_boundary = expected_asset_record(aid, edge_for_asset, ledger, phase, decisions, read_after)["evidence_boundary"]
            if asset.get("evidence_boundary") != expected_boundary:
                fail("E_STATUS_PROMOTION", f"asset evidence boundary promoted at {aid}")
            expected_asset = expected_asset_record(aid, edge_for_asset, ledger, phase, decisions, read_after)
            if asset != expected_asset:
                fail("E_ASSET_RECORD", f"asset record field/value drift at {unit}/{aid}")
        verify_status_partition(got.get("status_partition", {}), edges, unit_assets, cur_row)
        expected_authority = {
            "authority_effect": "none", "research_only": True, "formal_implementation_claim": False,
            "formal_degradation_claim": False, "formal_failure_claim": False, "formal_unimplemented_claim": False,
            "acceptance_verdict": False, "legacy_execution_performed": False,
        }
        if got["authority_boundary"] != expected_authority:
            fail("E_AUTHORITY_BOUNDARY", f"unit authority boundary drift at {unit}")
        if got.get("directly_established") != DIRECTLY_ESTABLISHED:
            fail("E_STATUS_REASON", f"directly-established evidence partition drift at {unit}")
        if got.get("unresolved") != UNRESOLVED:
            fail("E_STATUS_REASON", f"missing unresolved/direct evidence partition at {unit}")
    print(f"PASS SCF-B-0132: 10 existing HELIX-HARNESS units, 30 Wave edges, 22 unique old assets; all unit statuses remain unknown/candidate-only")


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
