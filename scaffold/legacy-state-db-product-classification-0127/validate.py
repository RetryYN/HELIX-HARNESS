#!/usr/bin/env python3
"""Independent validator for SCF-B-0127.

The validator does not import generate.py.  Expected semantic pins are copied
below as a fixed literal, while bytes, rows, anchors, and target membership
are re-derived from fixed BASE Git objects.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-state-db-product-classification-0127"
LEDGER = BUNDLE / "classification-research.jsonl"
INVENTORY = BUNDLE / "inventory.json"
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
L1_MARKERS = {"HELIX-HARNESS": "## 提供価値", "HELIX-OS": "## 提供価値", "HELIX-Web": "## 提供価値", "HELIX-Web-OS": "## 境界"}
FAILURE_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
WAVE_PATHS = {n: (f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl" if n <= 36 else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl") for n in range(1, 51)}
OVERLAP = {"SCF-B-0107": [], "SCF-B-0117": [], "SCF-B-0120": [], "SCF-B-0123": [], "SCF-B-0126": []}
EXPECTED_PROFILES = {
  "src/state-db/artifact-progress-decision.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-OS"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS-L1-003/004 define trace and evidence meaning; HELIXOS-L1-008 owns projection consistency. A single product owner is not proposed.",
    "marker": "export function deriveArtifactProgressDecision",
    "reason": "Derives V-model artifact progress from document status and verification evidence, joining HARNESS completion meaning with OS state projection."
  },
  "src/state-db/closure-authority-backfill-loader.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS-L1-004 defines evidence obligations but does not own repository authority or filesystem admission.",
    "marker": "export function readVerifiedRepoFile",
    "reason": "Verifies repository-owned files and allowlists before closure evidence is loaded; this is OS authority and state safety control."
  },
  "src/state-db/closure-authority-backfill-production.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS-L1-006 defines closure conditions, while OS L1-008 governs current-state reconstruction; the source crosses that contract only through operational control.",
    "marker": "export function buildCurrentClosureAuthorityBackfillRun",
    "reason": "Builds a current closure-authority run from tracked blobs and evidence inputs; its operational state and admission behavior belong to OS control."
  },
  "src/state-db/closure-authority-backfill-verifier.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-OS"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS-L1-004/006 and HELIXOS-L1-004/008 both describe obligations visible in this span; no owner is selected.",
    "marker": "export function verifyClosureAuthorityBackfillCurrentContext",
    "reason": "Verifies V-model review identity, plan evidence, tests, and current authority context in one bundle, combining HARNESS evidence semantics with OS authority checks."
  },
  "src/state-db/closure-authority-backfill.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS provides the contract being reviewed, but it does not own durable state mutation or authority application.",
    "marker": "export function applyClosureAuthorityBackfill",
    "reason": "Applies closure-authority review and durable journal state, including recovery and filesystem effects; this is OS operational authority control."
  },
  "src/state-db/closure-authority-convergence-epoch.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS closure semantics are input evidence, not the owner of epoch persistence and reconciliation.",
    "marker": "export async function reconcileClosureEpochOperation",
    "reason": "Reconciles closure epochs and terminal boundary events as an operational state transition; this is OS convergence and recovery control."
  },
  "src/state-db/closure-authority-convergence-production.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS review meaning remains a contract dependency, while recording and partitioning authority is outside HARNESS ownership.",
    "marker": "export function recordClosureAuthorityReview",
    "reason": "Records closure-authority review drafts, proposals, receipts, and terminal partitions; the persistence and authority lifecycle are OS state control."
  },
  "src/state-db/closure-authority-convergence.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "The V-model closure contract is evidence supplied to the operation and does not by itself make HARNESS the state owner.",
    "marker": "export function runClosureAuthorityProductionOrchestration",
    "reason": "Orchestrates authority production cycles and appends convergence ledger state; this is OS operational orchestration."
  },
  "src/state-db/closure-auto-approval.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS defines acceptance conditions, but auto-approval eligibility and runtime authority remain OS responsibilities.",
    "marker": "export function buildProjectClosureAutoApprovalReadiness",
    "reason": "Evaluates project closure readiness against authority, required checks, and immutable run evidence; this is OS control and readiness state."
  },
  "src/state-db/closure-evidence-materialization.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS evidence meaning is a consumer contract; the source controls operational materialization and recovery.",
    "marker": "export async function materializeClosureEvidence",
    "reason": "Materializes closure evidence with journaling, recovery, and durable filesystem operations; this is OS evidence-state control."
  },
  "src/state-db/closure-evidence-runner.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS defines verification obligations, but subprocess lifecycle and receipt execution are OS controls.",
    "marker": "export class ClosureEvidenceRunner",
    "reason": "Runs typed test/gate subprocess evidence and records receipts, which is worker execution and operational evidence control."
  },
  "src/state-db/closure-evidence-semantic-authority.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-OS"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS-L1-004/006 and HELIXOS-L1-001/008 both provide direct boundary evidence; selecting one owner would erase the connection.",
    "marker": "export function loadClosureSemanticAuthorityBundle",
    "reason": "Loads and validates semantic authority envelopes that carry both V-model review meaning and runtime authority records."
  },
  "src/state-db/closure-materialization-lock.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "No HARNESS L1 states ownership of process fencing or durable lock state.",
    "marker": "export function acquireClosureMaterializationLock",
    "reason": "Acquires and releases a process/filesystem lock around evidence materialization; this is operational concurrency and state safety."
  },
  "src/state-db/closure-terminal-boundaries.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS closure conditions are upstream evidence, while terminal projection immutability is OS persistence responsibility.",
    "marker": "export function ensureClosureTerminalBoundaryImmutability",
    "reason": "Maintains immutable terminal-boundary projections and their database/file checks; this is OS state integrity control."
  },
  "src/state-db/current-location.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-OS"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS-L1-001/003 and HELIXOS-L1-008/012 both match the concrete span; no single owner is proposed.",
    "marker": "export function buildProjectCurrentLocationSnapshot",
    "reason": "Projects current project location across V-model coverage, operation, design, and recovery state; HARNESS progress meaning and OS state reconstruction meet."
  },
  "src/state-db/drive-registration.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS plan meaning is read as input, but registration state and drift checks are OS-owned operational state.",
    "marker": "export function refreshPersistedDriveDbRegistrationStats",
    "reason": "Refreshes persisted database registration statistics against the current plan registry; this is OS persistence and consistency control."
  },
  "src/state-db/feedback-projections.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS supplies process artifacts, but HELIXOS-L1-006 explicitly covers observation, failure, learning, and improvement projection.",
    "marker": "export function projectFeedbackEvents",
    "reason": "Projects feedback, trouble, retry, issue, and improvement events into operational state; this is the OS learning and improvement loop."
  },
  "src/state-db/github-execution-episode-location.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS workflow meaning is not enough to own provider execution location or convergence state.",
    "marker": "export function projectExecutionEpisodeLocation",
    "reason": "Projects execution episode location and convergence into database state; this is OS worker/execution tracking."
  },
  "src/state-db/github-execution-episode-right-arm.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS verification contracts are referenced as evidence, while provider episode admission is OS control.",
    "marker": "export function admitExecutionEpisodeRightArmEvidence",
    "reason": "Admits execution-side evidence for a GitHub episode and persists the operational right-arm record; this is OS execution and evidence control."
  },
  "src/state-db/github-execution-episode.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS does not own the provider execution state machine or its persistence digest.",
    "marker": "export function executionEpisodeProjectionDigest",
    "reason": "Defines execution episode transitions and projection digests for worker state; this is OS execution lifecycle state."
  },
  "src/state-db/guardrail-invariants.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS may define required gates, but guardrail decision state and enforcement belong to OS control.",
    "marker": "export function inspectGuardrailInvariants",
    "reason": "Inspects allow/block/human-required guardrail decisions at the operational boundary; this is OS control and safety governance."
  },
  "src/state-db/historical-vpair-migration-authority.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-OS"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS-L1-001/003 and HELIXOS-L1-001/008 both support the span; historical meaning and migration authority remain connected.",
    "marker": "export function sealHistoricalAuthorityGeneration",
    "reason": "Seals historical V-pair migration authority artifacts and review records, combining HARNESS V-model history with OS migration authority."
  },
  "src/state-db/index.ts": {
    "candidate_products": [],
    "category": "insufficient_basis",
    "counter_evidence": "The source contains shared plumbing without a product-specific contract span. A path or exported name is insufficient.",
    "marker": "export function openHarnessDb(",
    "reason": "The module exposes a shared database facade and row primitives; the generic entry point alone cannot distinguish artifact meaning from OS persistence responsibility."
  },
  "src/state-db/maintenance.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS artifacts may be stored there, but maintenance and schema readiness are OS state concerns.",
    "marker": "export function harnessDbStatus",
    "reason": "Reports and rebuilds HarnessDb schema state, which is operational persistence maintenance under OS control."
  },
  "src/state-db/migration.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "No HARNESS L1 boundary owns database schema migration execution.",
    "marker": "export function migrate",
    "reason": "Migrates and inspects database tables and row counts; this is OS persistence lifecycle control."
  },
  "src/state-db/plan-entry-routing-input.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-OS"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS-L1-008/009 defines requirement and design inputs; HELIXOS-L1-002/010 defines routing and integration order. Neither is collapsed.",
    "marker": "export function resolvePlanEntrySignalsFromDb",
    "reason": "Resolves plan-entry signals from stored process artifacts into routing inputs, joining HARNESS plan meaning with OS routing state."
  },
  "src/state-db/projection-writer.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS defines source artifact semantics, but the shared operational projection writer is OS infrastructure.",
    "marker": "export function recordProjectionEvent",
    "reason": "Writes projection events and derived read models into HarnessDb; this is OS state projection and reconstruction control."
  },
  "src/state-db/refactor-candidate-policy.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HELIXOS may manage adoption and telemetry, but the semantic policy vocabulary is a HARNESS artifact contract.",
    "marker": "export const REFACTOR_POLICY_TERMS",
    "reason": "Declares refactor scan terms and candidate policy vocabulary for development artifact analysis; this is HARNESS process/design support."
  },
  "src/state-db/refactor-candidates.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "The database destination is operational, but candidate meaning and V-model improvement intent are HARNESS-facing.",
    "marker": "export function analyzeRefactorCandidates",
    "reason": "Analyzes source functions and policy terms into refactor candidates for development improvement; the analyzed contract is HARNESS process quality."
  },
  "src/state-db/reverse-candidates.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "OS may route the candidate, but reverse type and artifact relation meaning are owned by the process contract.",
    "marker": "export function collectReverseCandidates",
    "reason": "Derives reverse-candidate work from artifact progress and findings; this is HARNESS workflow feedback semantics."
  },
  "src/state-db/schema-authority.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS uses the database as evidence, but schema integrity and drift checks are operational OS state.",
    "marker": "export function compareSchemaAuthority",
    "reason": "Compares tracked schema objects and database schema digests; this is OS persistence authority and drift control."
  },
  "src/state-db/skill-applicability-projection.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-OS"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS-L1-002/009 and HELIXOS-L1-003/009 both apply; the connection must remain a conflict candidate.",
    "marker": "export function projectSkillApplicabilityRows",
    "reason": "Projects skill applicability from process artifacts into operational rows, combining HARNESS task semantics with OS worker/skill state."
  },
  "src/state-db/state-hygiene.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "No HARNESS boundary establishes garbage collection or filesystem durability ownership.",
    "marker": "export function findTmpGcCandidates",
    "reason": "Finds and optionally cleans temporary database files while protecting evidence; this is OS filesystem hygiene and safety control."
  },
  "src/state-db/test-report-parser.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "OS may run the reporter, but test evidence normalization and V-model trace meaning remain HARNESS process responsibilities.",
    "marker": "export function parseGreenCommandEvidence(",
    "reason": "Parses Vitest/Playwright/JUnit evidence and oracle markers into structured verification evidence; this is HARNESS verification artifact meaning."
  },
  "src/state-db/token-tracker.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS process artifacts may consume summaries, but provider usage and cost state are OS operational concerns.",
    "marker": "export function parseClaudeSessionUsage",
    "reason": "Parses runtime session usage and computes provider cost summaries; this is OS worker telemetry and resource control."
  },
  "src/state-db/visualization-evidence.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-Web"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS-L1-001/003 defines evidence structure while HELIX-Web-L1-002/003 defines user presentation; one owner is not proposed.",
    "marker": "export function projectVisualizationEvidence",
    "reason": "Projects V-model visualization evidence into a view-facing row, joining HARNESS evidence shape with Web presentation consumption."
  },
  "src/state-db/visualization-read-model.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-Web"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS evidence trace and Web dashboard boundary both match the source span; OS operational inputs do not settle the presentation owner.",
    "marker": "export function buildVisualizationSnapshot",
    "reason": "Builds a visualization snapshot from relation, runtime, approval, and recovery state, joining HARNESS read-model meaning with Web-facing presentation."
  },
  "src/state-db/visualization-view-model.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-Web"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS-L1-001/003 and HELIX-Web-L1-002/003 both provide direct boundary evidence; retain conflict.",
    "marker": "export function buildProjectCurrentLocationView",
    "reason": "Builds project current-location and graph views for a presentation contract, combining HARNESS V-model projection with Web/UI view responsibility."
  },
  "src/state-db/vmodel-fit.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HELIX-OS manages execution and state around the report, but the V-model fit meaning is HARNESS responsibility.",
    "marker": "export function buildVmodelFitReport",
    "reason": "Builds V-model fit, pair, trace, recovery, and acceptance views; these are HARNESS development-process contract semantics."
  }
}

EXPECTED_RECORD_KEYS = {"asset_id", "source_path", "source_exact", "phase_evidence", "legacy_asset_evidence", "classification", "boundary_evidence", "legacy_history_failure_consumer", "legacy_implementation_shrinkage_evidence", "wave_semantic_links", "wave_edge_count", "human_judgment_remaining", "authority_effect", "formal_asset_classification_updated", "new_build_allowed"}
EXPECTED_HUMAN_JUDGMENT = ["formal_product_owner", "formal_product_classification", "phase_admission", "implementation_or_reuse_decision", "degradation_meaning", "consumer_closure", "successor_assignment", "new_build_authority"]
EXPECTED_INVENTORY_KEYS = {"schema_revision", "binding_id", "base_revision", "scope", "candidate_needs_semantic_review_total", "target_count", "target_asset_ids", "target_source_paths", "classification_counts", "target_wave_edge_count", "wave_files", "existing_research_overlap", "input_digests", "output_sha256", "authority_boundary", "classification_rule", "old_archive_execution", "overlap_rule"}
EXPECTED_OVERLAP_RULE = "existing research IDs are compared by asset_id and source_path; all five selected bindings have zero overlap"


def fail(code: str, detail: object) -> None:
    raise AssertionError(f"{code}: {detail}")


def git_bytes(path: str) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{BASE_REVISION}:{path}"], cwd=ROOT)
    except subprocess.CalledProcessError as exc:
        fail("E_BASE_SOURCE", path)
        raise exc


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


def anchor(path: str, marker: str, archive: bool) -> dict:
    object_path = (ARCHIVE_PREFIX + path) if archive else path
    data = git_bytes(object_path)
    lines = data.decode("utf-8", "replace").splitlines()
    matches = [i for i, line in enumerate(lines, 1) if marker in line]
    if len(matches) != 1:
        fail("E_SOURCE_ANCHOR" if archive else "E_BOUNDARY_ANCHOR", {"path": path, "marker": marker, "matches": matches})
    start = matches[0]
    end = min(len(lines), start + 9) if archive else start
    line = lines[start - 1]
    span = "\n".join(lines[start - 1:end]).encode()
    return {"line_start": start, "line_end": end, "marker": marker, "line_text": line, "line_text_sha256": digest(line.encode()), "span_sha256": digest(span)} if archive else {"path": path, "blob": git_blob(path), "sha256": digest(data), "line": start, "marker": marker, "line_text_sha256": digest(line.encode()), "line_text": line}


def static_matches(path: str, terms: list[str]) -> dict:
    data = git_bytes(path)
    lines = data.decode("utf-8", "replace").splitlines()
    hits = [{"line": n, "text": line, "text_sha256": digest(line.encode())} for n, line in enumerate(lines, 1) if any(term and term in line for term in terms)]
    return {"path": path, "blob": git_blob(path), "sha256": digest(data), "matched_lines": hits}


def boundary_evidence() -> dict:
    data = anchor(BOUNDARY, "## 対象別の正規入口", False)
    return {"product_boundary": {**data, "interpretation": "candidate boundary reference only; the document expressly does not create permanent authority"}, "l1": {product: {**anchor(path, L1_MARKERS[product], False), "interpretation": "draft L1 candidate; authority_status remains awaiting_parent_approval"} for product, path in L1.items()}}


def wave_data(target_ids: set[str], target_paths: set[str]) -> tuple[list[dict], list[dict]]:
    files, edges = [], []
    for wave, path in WAVE_PATHS.items():
        try:
            raw = git_bytes(path)
        except AssertionError:
            # A path absent in the fixed snapshot is not an edge and is not an
            # input.  This keeps the validator independent of the generator's
            # optional file handling.
            continue
        files.append({"wave": wave, "path": path, "blob": git_blob(path), "bytes": len(raw), "sha256": digest(raw)})
        for line in raw.decode("utf-8", "replace").splitlines():
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            if row.get("asset_id") in target_ids or row.get("source_path") in target_paths:
                edges.append({"wave": wave, "path": path, "row": row})
    return files, edges


def expected_input_digests(wave_files: list[dict]) -> list[dict]:
    paths = [PHASE, DISPOSITION, DECISIONS, READ_AFTER, BOUNDARY, *L1.values(), FAILURE_SOURCE, CONSUMER_SOURCE, *[f["path"] for f in wave_files]]
    return [{"path": p, "blob": git_blob(p), "bytes": len(git_bytes(p)), "sha256": digest(git_bytes(p))} for p in paths]


def check() -> None:
    inv = json.loads(INVENTORY.read_text())
    rows = [json.loads(line) for line in LEDGER.read_text().splitlines() if line.strip()]
    if inv.get("base_revision") != BASE_REVISION:
        fail("E_BASE_PIN", inv.get("base_revision"))
    head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    if subprocess.call(["git", "merge-base", "--is-ancestor", BASE_REVISION, head], cwd=ROOT) != 0:
        fail("E_BASE_NOT_ANCESTOR", {"base": BASE_REVISION, "head": head})
    phase_rows = parse_jsonl(PHASE)
    disposition_rows = parse_jsonl(DISPOSITION)
    decisions = parse_jsonl(DECISIONS)
    read_after = parse_jsonl(READ_AFTER)
    expected_phase = {r["asset_id"]: r for r in phase_rows if r.get("product_classification_status") == "candidate_needs_semantic_review" and r.get("source_path", "").startswith("src/state-db/")}
    expected_ids = sorted(expected_phase)
    if len(expected_ids) != 39 or len(rows) != 39 or [r.get("asset_id") for r in rows] != expected_ids or len({r.get("asset_id") for r in rows}) != len(rows):
        fail("E_TARGET_SET", {"expected": expected_ids, "actual": [r.get("asset_id") for r in rows]})
    if set(EXPECTED_PROFILES) != {r["source_path"] for r in expected_phase.values()}:
        fail("E_PROFILE_SET", sorted(set(EXPECTED_PROFILES) ^ {r["source_path"] for r in expected_phase.values()}))
    disp = {r["asset_id"]: r for r in disposition_rows}
    expected_boundary = boundary_evidence()
    target_ids, target_paths = set(expected_phase), {r["source_path"] for r in expected_phase.values()}
    wave_files, wave_edges = wave_data(target_ids, target_paths)
    failure_global = static_matches(FAILURE_SOURCE, [])
    consumer_global = static_matches(CONSUMER_SOURCE, [])
    for row in rows:
        aid, path = row.get("asset_id"), row.get("source_path")
        phase = expected_phase.get(aid)
        if phase is None or path != phase.get("source_path"):
            fail("E_TARGET_SET", aid)
        prof = EXPECTED_PROFILES.get(path)
        if prof is None:
            fail("E_PROFILE_SET", path)
        source_path = ARCHIVE_PREFIX + path
        source = git_bytes(source_path)
        if row.get("source_exact", {}).get("read_mode") != "git_show_fixed_base_static_read":
            fail("E_READ_MODE", aid)
        expected_source = {"archive_path": source_path, "source_path": path, "blob": git_blob(source_path), "bytes": len(source), "line_count": len(source.decode("utf-8", "replace").splitlines()), "sha256": digest(source), "ledger_source_sha256": phase.get("source_sha256"), "ledger_digest_match": phase.get("source_sha256") == hashlib.sha256(source).hexdigest(), "semantic_anchor": anchor(path, prof["marker"], True), "read_mode": "git_show_fixed_base_static_read"}
        if row.get("source_exact") != expected_source:
            fail("E_OLD_ASSET_SOURCE", aid)
        expected_class = {"category": prof["category"], "candidate_products": prof["candidate_products"], "semantic_status": "research_candidate_not_formal", "reason": prof["reason"], "counter_evidence": prof["counter_evidence"]}
        if row.get("classification") != expected_class:
            fail("E_CLASSIFICATION", aid)
        if row.get("boundary_evidence") != expected_boundary:
            fail("E_BOUNDARY_ANCHOR", aid)
        if row.get("phase_evidence") != {"row": phase, "row_sha256": row_hash(phase)}:
            fail("E_PHASE_STATUS", aid)
        if row.get("legacy_asset_evidence") != {"row": disp.get(aid), "row_sha256": row_hash(disp[aid])}:
            fail("E_OLD_LEDGER_RECORD", aid)
        decisions_expected = [{"row": r, "row_sha256": row_hash(r)} for r in decisions if r.get("asset_id") == aid]
        read_expected = [{"row": r, "row_sha256": row_hash(r)} for r in read_after if r.get("asset_id") == aid]
        failure = static_matches(FAILURE_SOURCE, [aid, path])
        consumer = static_matches(CONSUMER_SOURCE, [aid, path])
        expected_hist = {"decision_records": decisions_expected, "read_after_records": read_expected, "failure_consumer_static": {"failure": failure, "consumer": consumer, "global_failure_inventory": failure_global, "global_consumer_inventory": consumer_global}}
        if row.get("legacy_history_failure_consumer") != expected_hist:
            fail("E_HISTORY", aid)
        expected_impl = {"artifact_evidence_kind": phase.get("artifact_evidence_kind"), "implementation_evidence_state": phase.get("implementation_evidence_state"), "legacy_implementation_status": phase.get("legacy_implementation_status"), "degradation_status": "unknown_pending_human_semantic_review", "degradation_evidence": ["legacy implementation status remains unknown", "no degradation or reuse conclusion is promoted by this scaffold"]}
        if row.get("legacy_implementation_shrinkage_evidence") != expected_impl:
            fail("E_IMPLEMENTATION_EVIDENCE", aid)
        links = [e for e in wave_edges if e.get("row", {}).get("asset_id") == aid or e.get("row", {}).get("source_path") == path]
        if row.get("wave_semantic_links") != links or row.get("wave_edge_count") != len(links):
            fail("E_WAVE_EDGE_SET", aid)
        if row.get("authority_effect") != "none" or row.get("formal_asset_classification_updated") is not False or row.get("new_build_allowed") is not False:
            fail("E_AUTHORITY_PROMOTION", aid)
        if set(row) != EXPECTED_RECORD_KEYS:
            fail("E_RECORD_SHAPE", aid)
        if row.get("human_judgment_remaining") != EXPECTED_HUMAN_JUDGMENT:
            fail("E_HUMAN_JUDGMENT", aid)
    expected_paths_in_record_order = [expected_phase[aid]["source_path"] for aid in expected_ids]
    candidate_status_total = sum(r.get("product_classification_status") == "candidate_needs_semantic_review" for r in phase_rows)
    if set(inv) != EXPECTED_INVENTORY_KEYS:
        fail("E_INVENTORY_SCHEMA", sorted(set(inv) ^ EXPECTED_INVENTORY_KEYS))
    if inv.get("schema_revision") != 1:
        fail("E_INVENTORY_DECLARATION", "schema revision")
    if inv.get("binding_id") != BINDING_ID or inv.get("scope") != "fixed BASE candidate_needs_semantic_review src/state-db exact 39 assets" or inv.get("candidate_needs_semantic_review_total") != candidate_status_total or candidate_status_total != 2228 or inv.get("target_count") != 39 or inv.get("target_asset_ids") != expected_ids or inv.get("target_source_paths") != expected_paths_in_record_order or inv.get("existing_research_overlap") != OVERLAP:
        fail("E_INVENTORY_DECLARATION", "target or overlap declaration")
    if inv.get("input_digests") != expected_input_digests(wave_files):
        fail("E_INPUT_DIGEST", "path/blob/bytes/digest set")
    counts = {}
    for row in rows:
        c = row["classification"]["category"]
        counts[c] = counts.get(c, 0) + 1
    if inv.get("classification_counts") != counts or inv.get("target_wave_edge_count") != len(wave_edges) or inv.get("wave_files") != wave_files:
        fail("E_INVENTORY_DECLARATION", "counts or wave inventory")
    expected_boundary_declaration = {"authority_effect": "none", "formal_product_authority": None, "formal_asset_classification_updated": False, "formal_implementation_status": "unknown", "successor_assignment": None, "new_build_allowed": False, "read_mode": "static_git_object_only"}
    if inv.get("authority_boundary") != expected_boundary_declaration:
        fail("E_AUTHORITY_PROMOTION", "inventory authority boundary")
    expected_rules = {"direct_product_basis": "source marker span plus boundary interpretation and counter-evidence; path alone is invalid", "multi_product_conflict": "source marker maps to two product boundaries; no single owner proposed", "insufficient_basis": "shared facade/plumbing or source span lacks product-boundary proof"}
    if inv.get("classification_rule") != expected_rules or inv.get("old_archive_execution") != {"runtime": False, "test": False, "ci": False, "source": False, "read_mode": "git show fixed BASE only"}:
        fail("E_INVENTORY_DECLARATION", "classification or execution boundary")
    if inv.get("overlap_rule") != EXPECTED_OVERLAP_RULE:
        fail("E_INVENTORY_DECLARATION", "overlap rule")
    if inv.get("output_sha256") != digest(LEDGER.read_bytes()):
        fail("E_OUTPUT_DIGEST", "classification ledger")
    print(f"SCF-B-0127 validate: PASS records={len(rows)} categories={counts} target_wave_edges={len(wave_edges)}")


if __name__ == "__main__":
    try:
        check()
    except AssertionError as exc:
        print(exc, file=sys.stderr)
        raise SystemExit(1)
