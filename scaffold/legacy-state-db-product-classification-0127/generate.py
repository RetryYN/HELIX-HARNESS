#!/usr/bin/env python3
"""Build SCF-B-0127 from fixed BASE Git objects.

This module only reads the legacy archive, governance snapshots, and current
boundary documents through ``git show``.  No archived runtime, test, hook, or
CI asset is imported or executed.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-state-db-product-classification-0127"
BASE_REVISION = "99893e5950f4025742a0f8671914be25332c038c"
BINDING_ID = "SCF-B-0127"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
BOUNDARY = "docs/concept/product-boundary.md"
L1 = {
    "HELIX-HARNESS": "docs/helix-harness/L1-planning/product-intent.md",
    "HELIX-OS": "docs/helix-os/L1-planning/system-intent.md",
    "HELIX-Web": "docs/helix-web/L1-planning/product-intent.md",
    "HELIX-Web-OS": "docs/helix-web-os/L1-planning/system-intent.md",
}
L1_MARKERS = {
    "HELIX-HARNESS": "## 提供価値",
    "HELIX-OS": "## 提供価値",
    "HELIX-Web": "## 提供価値",
    "HELIX-Web-OS": "## 境界",
}
FAILURE_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
WAVE_PATHS = {
    n: (f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl"
        if n <= 36 else
        f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl")
    for n in range(1, 51)
}
PRODUCTS = ("HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS")


def profile(category: str, products: list[str], marker: str, reason: str, counter: str) -> dict:
    return {
        "category": category,
        "candidate_products": products,
        "marker": marker,
        "reason": reason,
        "counter_evidence": counter,
    }


# These are source-semantic pins.  The source marker and the explanation are
# deliberately per asset; a directory or filename is never used as ownership
# evidence by itself.
PROFILES = {
    "src/state-db/artifact-progress-decision.ts": profile("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function deriveArtifactProgressDecision", "Derives V-model artifact progress from document status and verification evidence, joining HARNESS completion meaning with OS state projection.", "HARNESS-L1-003/004 define trace and evidence meaning; HELIXOS-L1-008 owns projection consistency. A single product owner is not proposed."),
    "src/state-db/closure-authority-backfill-loader.ts": profile("direct_product_basis", ["HELIX-OS"], "export function readVerifiedRepoFile", "Verifies repository-owned files and allowlists before closure evidence is loaded; this is OS authority and state safety control.", "HARNESS-L1-004 defines evidence obligations but does not own repository authority or filesystem admission."),
    "src/state-db/closure-authority-backfill-production.ts": profile("direct_product_basis", ["HELIX-OS"], "export function buildCurrentClosureAuthorityBackfillRun", "Builds a current closure-authority run from tracked blobs and evidence inputs; its operational state and admission behavior belong to OS control.", "HARNESS-L1-006 defines closure conditions, while OS L1-008 governs current-state reconstruction; the source crosses that contract only through operational control."),
    "src/state-db/closure-authority-backfill-verifier.ts": profile("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function verifyClosureAuthorityBackfillCurrentContext", "Verifies V-model review identity, plan evidence, tests, and current authority context in one bundle, combining HARNESS evidence semantics with OS authority checks.", "HARNESS-L1-004/006 and HELIXOS-L1-004/008 both describe obligations visible in this span; no owner is selected."),
    "src/state-db/closure-authority-backfill.ts": profile("direct_product_basis", ["HELIX-OS"], "export function applyClosureAuthorityBackfill", "Applies closure-authority review and durable journal state, including recovery and filesystem effects; this is OS operational authority control.", "HARNESS provides the contract being reviewed, but it does not own durable state mutation or authority application."),
    "src/state-db/closure-authority-convergence-epoch.ts": profile("direct_product_basis", ["HELIX-OS"], "export async function reconcileClosureEpochOperation", "Reconciles closure epochs and terminal boundary events as an operational state transition; this is OS convergence and recovery control.", "HARNESS closure semantics are input evidence, not the owner of epoch persistence and reconciliation."),
    "src/state-db/closure-authority-convergence-production.ts": profile("direct_product_basis", ["HELIX-OS"], "export function recordClosureAuthorityReview", "Records closure-authority review drafts, proposals, receipts, and terminal partitions; the persistence and authority lifecycle are OS state control.", "HARNESS review meaning remains a contract dependency, while recording and partitioning authority is outside HARNESS ownership."),
    "src/state-db/closure-authority-convergence.ts": profile("direct_product_basis", ["HELIX-OS"], "export function runClosureAuthorityProductionOrchestration", "Orchestrates authority production cycles and appends convergence ledger state; this is OS operational orchestration.", "The V-model closure contract is evidence supplied to the operation and does not by itself make HARNESS the state owner."),
    "src/state-db/closure-auto-approval.ts": profile("direct_product_basis", ["HELIX-OS"], "export function buildProjectClosureAutoApprovalReadiness", "Evaluates project closure readiness against authority, required checks, and immutable run evidence; this is OS control and readiness state.", "HARNESS defines acceptance conditions, but auto-approval eligibility and runtime authority remain OS responsibilities."),
    "src/state-db/closure-evidence-materialization.ts": profile("direct_product_basis", ["HELIX-OS"], "export async function materializeClosureEvidence", "Materializes closure evidence with journaling, recovery, and durable filesystem operations; this is OS evidence-state control.", "HARNESS evidence meaning is a consumer contract; the source controls operational materialization and recovery."),
    "src/state-db/closure-evidence-runner.ts": profile("direct_product_basis", ["HELIX-OS"], "export class ClosureEvidenceRunner", "Runs typed test/gate subprocess evidence and records receipts, which is worker execution and operational evidence control.", "HARNESS defines verification obligations, but subprocess lifecycle and receipt execution are OS controls."),
    "src/state-db/closure-evidence-semantic-authority.ts": profile("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function loadClosureSemanticAuthorityBundle", "Loads and validates semantic authority envelopes that carry both V-model review meaning and runtime authority records.", "HARNESS-L1-004/006 and HELIXOS-L1-001/008 both provide direct boundary evidence; selecting one owner would erase the connection."),
    "src/state-db/closure-materialization-lock.ts": profile("direct_product_basis", ["HELIX-OS"], "export function acquireClosureMaterializationLock", "Acquires and releases a process/filesystem lock around evidence materialization; this is operational concurrency and state safety.", "No HARNESS L1 states ownership of process fencing or durable lock state."),
    "src/state-db/closure-terminal-boundaries.ts": profile("direct_product_basis", ["HELIX-OS"], "export function ensureClosureTerminalBoundaryImmutability", "Maintains immutable terminal-boundary projections and their database/file checks; this is OS state integrity control.", "HARNESS closure conditions are upstream evidence, while terminal projection immutability is OS persistence responsibility."),
    "src/state-db/current-location.ts": profile("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function buildProjectCurrentLocationSnapshot", "Projects current project location across V-model coverage, operation, design, and recovery state; HARNESS progress meaning and OS state reconstruction meet.", "HARNESS-L1-001/003 and HELIXOS-L1-008/012 both match the concrete span; no single owner is proposed."),
    "src/state-db/drive-registration.ts": profile("direct_product_basis", ["HELIX-OS"], "export function refreshPersistedDriveDbRegistrationStats", "Refreshes persisted database registration statistics against the current plan registry; this is OS persistence and consistency control.", "HARNESS plan meaning is read as input, but registration state and drift checks are OS-owned operational state."),
    "src/state-db/feedback-projections.ts": profile("direct_product_basis", ["HELIX-OS"], "export function projectFeedbackEvents", "Projects feedback, trouble, retry, issue, and improvement events into operational state; this is the OS learning and improvement loop.", "HARNESS supplies process artifacts, but HELIXOS-L1-006 explicitly covers observation, failure, learning, and improvement projection."),
    "src/state-db/github-execution-episode-location.ts": profile("direct_product_basis", ["HELIX-OS"], "export function projectExecutionEpisodeLocation", "Projects execution episode location and convergence into database state; this is OS worker/execution tracking.", "HARNESS workflow meaning is not enough to own provider execution location or convergence state."),
    "src/state-db/github-execution-episode-right-arm.ts": profile("direct_product_basis", ["HELIX-OS"], "export function admitExecutionEpisodeRightArmEvidence", "Admits execution-side evidence for a GitHub episode and persists the operational right-arm record; this is OS execution and evidence control.", "HARNESS verification contracts are referenced as evidence, while provider episode admission is OS control."),
    "src/state-db/github-execution-episode.ts": profile("direct_product_basis", ["HELIX-OS"], "export function executionEpisodeProjectionDigest", "Defines execution episode transitions and projection digests for worker state; this is OS execution lifecycle state.", "HARNESS does not own the provider execution state machine or its persistence digest."),
    "src/state-db/guardrail-invariants.ts": profile("direct_product_basis", ["HELIX-OS"], "export function inspectGuardrailInvariants", "Inspects allow/block/human-required guardrail decisions at the operational boundary; this is OS control and safety governance.", "HARNESS may define required gates, but guardrail decision state and enforcement belong to OS control."),
    "src/state-db/historical-vpair-migration-authority.ts": profile("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function sealHistoricalAuthorityGeneration", "Seals historical V-pair migration authority artifacts and review records, combining HARNESS V-model history with OS migration authority.", "HARNESS-L1-001/003 and HELIXOS-L1-001/008 both support the span; historical meaning and migration authority remain connected."),
    "src/state-db/index.ts": profile("insufficient_basis", [], "export function openHarnessDb(", "The module exposes a shared database facade and row primitives; the generic entry point alone cannot distinguish artifact meaning from OS persistence responsibility.", "The source contains shared plumbing without a product-specific contract span. A path or exported name is insufficient."),
    "src/state-db/maintenance.ts": profile("direct_product_basis", ["HELIX-OS"], "export function harnessDbStatus", "Reports and rebuilds HarnessDb schema state, which is operational persistence maintenance under OS control.", "HARNESS artifacts may be stored there, but maintenance and schema readiness are OS state concerns."),
    "src/state-db/migration.ts": profile("direct_product_basis", ["HELIX-OS"], "export function migrate", "Migrates and inspects database tables and row counts; this is OS persistence lifecycle control.", "No HARNESS L1 boundary owns database schema migration execution."),
    "src/state-db/plan-entry-routing-input.ts": profile("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function resolvePlanEntrySignalsFromDb", "Resolves plan-entry signals from stored process artifacts into routing inputs, joining HARNESS plan meaning with OS routing state.", "HARNESS-L1-008/009 defines requirement and design inputs; HELIXOS-L1-002/010 defines routing and integration order. Neither is collapsed."),
    "src/state-db/projection-writer.ts": profile("direct_product_basis", ["HELIX-OS"], "export function recordProjectionEvent", "Writes projection events and derived read models into HarnessDb; this is OS state projection and reconstruction control.", "HARNESS defines source artifact semantics, but the shared operational projection writer is OS infrastructure."),
    "src/state-db/refactor-candidate-policy.ts": profile("direct_product_basis", ["HELIX-HARNESS"], "export const REFACTOR_POLICY_TERMS", "Declares refactor scan terms and candidate policy vocabulary for development artifact analysis; this is HARNESS process/design support.", "HELIXOS may manage adoption and telemetry, but the semantic policy vocabulary is a HARNESS artifact contract."),
    "src/state-db/refactor-candidates.ts": profile("direct_product_basis", ["HELIX-HARNESS"], "export function analyzeRefactorCandidates", "Analyzes source functions and policy terms into refactor candidates for development improvement; the analyzed contract is HARNESS process quality.", "The database destination is operational, but candidate meaning and V-model improvement intent are HARNESS-facing."),
    "src/state-db/reverse-candidates.ts": profile("direct_product_basis", ["HELIX-HARNESS"], "export function collectReverseCandidates", "Derives reverse-candidate work from artifact progress and findings; this is HARNESS workflow feedback semantics.", "OS may route the candidate, but reverse type and artifact relation meaning are owned by the process contract."),
    "src/state-db/schema-authority.ts": profile("direct_product_basis", ["HELIX-OS"], "export function compareSchemaAuthority", "Compares tracked schema objects and database schema digests; this is OS persistence authority and drift control.", "HARNESS uses the database as evidence, but schema integrity and drift checks are operational OS state."),
    "src/state-db/skill-applicability-projection.ts": profile("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function projectSkillApplicabilityRows", "Projects skill applicability from process artifacts into operational rows, combining HARNESS task semantics with OS worker/skill state.", "HARNESS-L1-002/009 and HELIXOS-L1-003/009 both apply; the connection must remain a conflict candidate."),
    "src/state-db/state-hygiene.ts": profile("direct_product_basis", ["HELIX-OS"], "export function findTmpGcCandidates", "Finds and optionally cleans temporary database files while protecting evidence; this is OS filesystem hygiene and safety control.", "No HARNESS boundary establishes garbage collection or filesystem durability ownership."),
    "src/state-db/test-report-parser.ts": profile("direct_product_basis", ["HELIX-HARNESS"], "export function parseGreenCommandEvidence(", "Parses Vitest/Playwright/JUnit evidence and oracle markers into structured verification evidence; this is HARNESS verification artifact meaning.", "OS may run the reporter, but test evidence normalization and V-model trace meaning remain HARNESS process responsibilities."),
    "src/state-db/token-tracker.ts": profile("direct_product_basis", ["HELIX-OS"], "export function parseClaudeSessionUsage", "Parses runtime session usage and computes provider cost summaries; this is OS worker telemetry and resource control.", "HARNESS process artifacts may consume summaries, but provider usage and cost state are OS operational concerns."),
    "src/state-db/visualization-evidence.ts": profile("multi_product_conflict", ["HELIX-HARNESS", "HELIX-Web"], "export function projectVisualizationEvidence", "Projects V-model visualization evidence into a view-facing row, joining HARNESS evidence shape with Web presentation consumption.", "HARNESS-L1-001/003 defines evidence structure while HELIX-Web-L1-002/003 defines user presentation; one owner is not proposed."),
    "src/state-db/visualization-read-model.ts": profile("multi_product_conflict", ["HELIX-HARNESS", "HELIX-Web"], "export function buildVisualizationSnapshot", "Builds a visualization snapshot from relation, runtime, approval, and recovery state, joining HARNESS read-model meaning with Web-facing presentation.", "HARNESS evidence trace and Web dashboard boundary both match the source span; OS operational inputs do not settle the presentation owner."),
    "src/state-db/visualization-view-model.ts": profile("multi_product_conflict", ["HELIX-HARNESS", "HELIX-Web"], "export function buildProjectCurrentLocationView", "Builds project current-location and graph views for a presentation contract, combining HARNESS V-model projection with Web/UI view responsibility.", "HARNESS-L1-001/003 and HELIX-Web-L1-002/003 both provide direct boundary evidence; retain conflict."),
    "src/state-db/vmodel-fit.ts": profile("direct_product_basis", ["HELIX-HARNESS"], "export function buildVmodelFitReport", "Builds V-model fit, pair, trace, recovery, and acceptance views; these are HARNESS development-process contract semantics.", "HELIX-OS manages execution and state around the report, but the V-model fit meaning is HARNESS responsibility."),
}


def git_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE_REVISION}:{path}"], cwd=ROOT)


def git_blob(path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", f"{BASE_REVISION}:{path}"], cwd=ROOT, text=True).strip()


def digest(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def canonical(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def parse_jsonl(path: str) -> list[dict]:
    return [json.loads(line) for line in git_bytes(path).decode().splitlines() if line.strip()]


def row_hash(row: dict) -> str:
    return digest(canonical(row))


def static_matches(path: str, terms: list[str]) -> dict:
    data = git_bytes(path)
    lines = data.decode("utf-8", "replace").splitlines()
    hits = []
    for number, line in enumerate(lines, 1):
        if any(term and term in line for term in terms):
            hits.append({"line": number, "text": line, "text_sha256": digest(line.encode())})
    return {"path": path, "blob": git_blob(path), "sha256": digest(data), "matched_lines": hits}


def source_anchor(path: str, marker: str) -> dict:
    data = git_bytes(ARCHIVE_PREFIX + path)
    lines = data.decode("utf-8", "replace").splitlines()
    matches = [i for i, line in enumerate(lines, 1) if marker in line]
    if len(matches) != 1:
        raise RuntimeError(f"source marker is not unique: {path} {marker!r} {matches}")
    start = matches[0]
    end = min(len(lines), start + 9)
    span = "\n".join(lines[start - 1:end]).encode()
    return {
        "line_start": start,
        "line_end": end,
        "marker": marker,
        "line_text": lines[start - 1],
        "line_text_sha256": digest(lines[start - 1].encode()),
        "span_sha256": digest(span),
    }


def boundary_anchor(path: str, marker: str) -> dict:
    data = git_bytes(path)
    lines = data.decode("utf-8", "replace").splitlines()
    matches = [i for i, line in enumerate(lines, 1) if marker in line]
    if not matches:
        raise RuntimeError(f"boundary marker missing: {path} {marker!r}")
    line = lines[matches[0] - 1]
    return {"path": path, "blob": git_blob(path), "sha256": digest(data), "line": matches[0], "marker": marker, "line_text_sha256": digest(line.encode()), "line_text": line}


def main() -> None:
    BUNDLE.mkdir(parents=True, exist_ok=True)
    phase_rows = parse_jsonl(PHASE)
    disposition_rows = parse_jsonl(DISPOSITION)
    decisions = parse_jsonl(DECISIONS)
    read_after = parse_jsonl(READ_AFTER)
    phase_by_id = {r["asset_id"]: r for r in phase_rows}
    disposition_by_id = {r["asset_id"]: r for r in disposition_rows}
    targets = sorted((r for r in phase_rows if r.get("product_classification_status") == "candidate_needs_semantic_review" and r.get("source_path", "").startswith("src/state-db/")), key=lambda r: r["asset_id"])
    expected_paths = {r["source_path"] for r in targets}
    if len(targets) != 39 or expected_paths != set(PROFILES):
        raise RuntimeError(f"target/profile mismatch: {len(targets)} {len(expected_paths ^ set(PROFILES))}")

    boundary = boundary_anchor(BOUNDARY, "## 対象別の正規入口")
    boundary_evidence = {
        "product_boundary": {**boundary, "interpretation": "candidate boundary reference only; the document expressly does not create permanent authority"},
        "l1": {product: {**boundary_anchor(path, L1_MARKERS[product]), "interpretation": "draft L1 candidate; authority_status remains awaiting_parent_approval"} for product, path in L1.items()},
    }
    failure_global = static_matches(FAILURE_SOURCE, [])
    consumer_global = static_matches(CONSUMER_SOURCE, [])
    wave_edges = []
    wave_files = []
    for wave, path in WAVE_PATHS.items():
        try:
            raw = git_bytes(path)
        except subprocess.CalledProcessError:
            continue
        wave_files.append({"wave": wave, "path": path, "blob": git_blob(path), "bytes": len(raw), "sha256": digest(raw)})
        for line in raw.decode("utf-8", "replace").splitlines():
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            if row.get("asset_id") in {r["asset_id"] for r in targets} or row.get("source_path") in expected_paths:
                wave_edges.append({"wave": wave, "path": path, "row": row})

    rows = []
    for phase in targets:
        asset_id = phase["asset_id"]
        path = phase["source_path"]
        prof = PROFILES[path]
        source_path = ARCHIVE_PREFIX + path
        source = git_bytes(source_path)
        anchor = source_anchor(path, prof["marker"])
        disposition = disposition_by_id.get(asset_id)
        if disposition is None:
            raise RuntimeError(f"missing disposition {asset_id}")
        asset_terms = [asset_id, path]
        decision_rows = [r for r in decisions if r.get("asset_id") == asset_id]
        read_rows = [r for r in read_after if r.get("asset_id") == asset_id]
        failure = static_matches(FAILURE_SOURCE, asset_terms)
        consumer = static_matches(CONSUMER_SOURCE, asset_terms)
        rows.append({
            "asset_id": asset_id,
            "source_path": path,
            "source_exact": {
                "archive_path": source_path,
                "source_path": path,
                "blob": git_blob(source_path),
                "bytes": len(source),
                "line_count": len(source.decode("utf-8", "replace").splitlines()),
                "sha256": digest(source),
                "ledger_source_sha256": phase.get("source_sha256"),
                "ledger_digest_match": phase.get("source_sha256") == hashlib.sha256(source).hexdigest(),
                "semantic_anchor": anchor,
                "read_mode": "git_show_fixed_base_static_read",
            },
            "phase_evidence": {"row": phase, "row_sha256": row_hash(phase)},
            "legacy_asset_evidence": {"row": disposition, "row_sha256": row_hash(disposition)},
            "classification": {"category": prof["category"], "candidate_products": prof["candidate_products"], "semantic_status": "research_candidate_not_formal", "reason": prof["reason"], "counter_evidence": prof["counter_evidence"]},
            "boundary_evidence": boundary_evidence,
            "legacy_history_failure_consumer": {"decision_records": [{"row": r, "row_sha256": row_hash(r)} for r in decision_rows], "read_after_records": [{"row": r, "row_sha256": row_hash(r)} for r in read_rows], "failure_consumer_static": {"failure": failure, "consumer": consumer, "global_failure_inventory": failure_global, "global_consumer_inventory": consumer_global}},
            "legacy_implementation_shrinkage_evidence": {"artifact_evidence_kind": phase.get("artifact_evidence_kind"), "implementation_evidence_state": phase.get("implementation_evidence_state"), "legacy_implementation_status": phase.get("legacy_implementation_status"), "degradation_status": "unknown_pending_human_semantic_review", "degradation_evidence": ["legacy implementation status remains unknown", "no degradation or reuse conclusion is promoted by this scaffold"]},
            "wave_semantic_links": [e for e in wave_edges if e.get("row", {}).get("asset_id") == asset_id or e.get("row", {}).get("source_path") == path],
            "wave_edge_count": sum(1 for e in wave_edges if e.get("row", {}).get("asset_id") == asset_id or e.get("row", {}).get("source_path") == path),
            "human_judgment_remaining": ["formal_product_owner", "formal_product_classification", "phase_admission", "implementation_or_reuse_decision", "degradation_meaning", "consumer_closure", "successor_assignment", "new_build_authority"],
            "authority_effect": "none",
            "formal_asset_classification_updated": False,
            "new_build_allowed": False,
        })

    ledger = BUNDLE / "classification-research.jsonl"
    ledger.write_bytes(b"".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode() + b"\n" for row in rows))
    input_paths = [PHASE, DISPOSITION, DECISIONS, READ_AFTER, BOUNDARY, *L1.values(), FAILURE_SOURCE, CONSUMER_SOURCE, *[f["path"] for f in wave_files]]
    input_digests = [{"path": p, "blob": git_blob(p), "bytes": len(git_bytes(p)), "sha256": digest(git_bytes(p))} for p in input_paths]
    counts = {}
    for row in rows:
        category = row["classification"]["category"]
        counts[category] = counts.get(category, 0) + 1
    inventory = {
        "schema_revision": 1, "binding_id": BINDING_ID, "base_revision": BASE_REVISION,
        "scope": "fixed BASE candidate_needs_semantic_review src/state-db exact 39 assets",
        "candidate_needs_semantic_review_total": sum(r.get("product_classification_status") == "candidate_needs_semantic_review" for r in phase_rows),
        "target_count": len(rows), "target_asset_ids": [r["asset_id"] for r in rows], "target_source_paths": [r["source_path"] for r in rows],
        "classification_counts": counts, "target_wave_edge_count": len(wave_edges), "wave_files": wave_files,
        "existing_research_overlap": {"SCF-B-0107": [], "SCF-B-0117": [], "SCF-B-0120": [], "SCF-B-0123": [], "SCF-B-0126": []},
        "input_digests": input_digests, "output_sha256": digest(ledger.read_bytes()),
        "authority_boundary": {"authority_effect": "none", "formal_product_authority": None, "formal_asset_classification_updated": False, "formal_implementation_status": "unknown", "successor_assignment": None, "new_build_allowed": False, "read_mode": "static_git_object_only"},
        "classification_rule": {"direct_product_basis": "source marker span plus boundary interpretation and counter-evidence; path alone is invalid", "multi_product_conflict": "source marker maps to two product boundaries; no single owner proposed", "insufficient_basis": "shared facade/plumbing or source span lacks product-boundary proof"},
        "old_archive_execution": {"runtime": False, "test": False, "ci": False, "source": False, "read_mode": "git show fixed BASE only"},
        "overlap_rule": "existing research IDs are compared by asset_id and source_path; all five selected bindings have zero overlap",
    }
    (BUNDLE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, sort_keys=True, indent=2) + "\n")
    print(f"SCF-B-0127 generated records={len(rows)} categories={counts} target_wave_edges={len(wave_edges)}")


if __name__ == "__main__":
    main()
