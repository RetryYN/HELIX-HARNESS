#!/usr/bin/env python3
"""Materialize SCF-B-0117 static research for unresolved src/runtime assets."""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-runtime-product-classification-0117"
BASE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
BINDING_ID = "SCF-B-0117"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
CROSSWALK = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
BOUNDARY = "docs/concept/product-boundary.md"
L1 = {
    "HELIX-HARNESS": "docs/helix-harness/L1-planning/product-intent.md",
    "HELIX-OS": "docs/helix-os/L1-planning/system-intent.md",
    "HELIX-Web": "docs/helix-web/L1-planning/product-intent.md",
    "HELIX-Web-OS": "docs/helix-web-os/L1-planning/system-intent.md",
}
FAILURE_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
WAVE_PATHS = {
    n: (f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl" if n <= 36 else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl")
    for n in range(1, 51)
}
GLOBAL_INPUTS = [
    PHASE, DISPOSITION, DECISIONS, READ_AFTER, CROSSWALK, DECOMPOSITION,
    BOUNDARY, *L1.values(), FAILURE_SOURCE, CONSUMER_SOURCE,
    "docs/governance/legacy-asset-decision-log.md",
    "docs/governance/legacy-asset-reuse-control.md",
    "docs/governance/new-generation-start-here.md",
    "archive/legacy-generation-2026-09-14/MANIFEST.sha256",
]
PRODUCTS = ("HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS")

# Every entry is a source-semantic review record.  The marker is located in
# the fixed BASE blob, so the stored line/digest is not inferred from a path
# name.  Classification remains a candidate research result, never authority.
def spec(category: str, products: list[str], marker: str | None, length: int, reason: str) -> dict:
    return {"category": category, "products": products, "marker": marker, "length": length, "reason": reason}

DIRECT_H = {
    "artifact-convergence-analyzer": spec("direct_product_basis", ["HELIX-HARNESS"], "export function buildArtifactConvergenceReport", 55, "The report body compares design, test, plan, code and task artifacts, emits convergence findings, and creates actionable source-linked tasks; the reviewed behavior is a HARNESS V-model artifact convergence contract."),
    "atomic-slice-admission": spec("direct_product_basis", ["HELIX-HARNESS"], "export function evaluateAtomicSlice", 82, "The evaluator admits or splits an atomic change slice, checks scope expansion and blocker evidence, and returns a design/no-code decision; this is HARNESS change-scope and design admission behavior."),
    "change-package-delta-archive": spec("direct_product_basis", ["HELIX-HARNESS"], "export function buildChangePackageDeltaArchiveReport", 48, "The report checks plan design/test deltas, rollback path and evidence digest before archiving a change package; this is HARNESS controlled change evidence."),
    "claude-unanswered-review-detector": spec("direct_product_basis", ["HELIX-HARNESS"], "export function detectUnansweredClaudeReviews", 70, "The detector matches review requests to independent receipt responses and reports unanswered review obligations; this is HARNESS review convergence evidence."),
    "document-change-report": spec("direct_product_basis", ["HELIX-HARNESS"], "export function buildDocumentChangeReport", 45, "The function builds a deterministic document change report with changed paths, semantic counts and digests; this supports HARNESS design and requirement review trace."),
    "document-semantic-diff": spec("direct_product_basis", ["HELIX-HARNESS"], "export function diffSemanticDocuments", 52, "The diff compares document snapshots and reports added, removed and changed semantic records with stable digests; this is HARNESS document trace and review evidence."),
    "forward-plan-authoring-transaction": spec("direct_product_basis", ["HELIX-HARNESS"], "export function authorForwardPlanTransaction", 90, "The transaction validates and authors a forward plan against an open-branch reservation and emits plan identity evidence; this is HARNESS plan authoring control."),
    "forward-reverse-terminal-reservation": spec("direct_product_basis", ["HELIX-HARNESS"], "export function reserveForwardReverseTerminalPair", 70, "The function reserves a forward/reverse terminal pair and validates the plan contract and terminal evidence; this is HARNESS V-model plan terminal binding."),
    "full-regression-shards": spec("direct_product_basis", ["HELIX-HARNESS"], "export function validateFullRegressionShardPlan", 70, "The validator checks regression shard scope, required cells, base head and receipt evidence; this is HARNESS verification-plan admission."),
    "harness-taxonomy-curation-policy": spec("direct_product_basis", ["HELIX-HARNESS"], "export function buildHarnessTaxonomyCurationReport", 52, "The report curates external sources into explicit HARNESS taxonomy families and rejects unverified or risky entries; the source names the Harness taxonomy contract and implements its review rules."),
    "helix-bench-task-dataset": spec("direct_product_basis", ["HELIX-HARNESS"], "export function validateHelixBenchDataset", 70, "The validator checks benchmark tasks across Requirement Binding, Design Trace, Controlled Implementation and Review Convergence with fixture and acceptance digests; this is HARNESS V-model evaluation."),
    "open-branch-plan-identity-reservation": spec("direct_product_basis", ["HELIX-HARNESS"], "export function projectOpenBranchPlanReservations", 72, "The projection validates open-branch plan identity reservations, terminal evidence and plan IDs; it binds plan lifecycle evidence in the HARNESS authoring layer."),
    "repo-wide-guard-runner": spec("direct_product_basis", ["HELIX-HARNESS"], "export function discoverRepoWideGuardTests", 42, "The runner discovers and loads repository-wide guard tests marked by the explicit harness marker; this is HARNESS verification surface discovery."),
    "review-guard": spec("direct_product_basis", ["HELIX-HARNESS"], "export function assessReviewSession", 43, "The assessment detects working-tree mutations during read-only delegated review and summarizes staged review changes; the source explicitly protects the HARNESS review role boundary."),
    "review-lane-closure": spec("direct_product_basis", ["HELIX-HARNESS"], "export function buildReviewLaneClosureManifest", 53, "The manifest binds review-lane source closure and provider material to a digest, so admission concerns the reviewed implementation surface; this is HARNESS review closure."),
    "review-receipt-plan-binding": spec("direct_product_basis", ["HELIX-HARNESS"], "export function evaluateReviewReceiptPlanBinding", 78, "The evaluator joins review receipts to changed plans, rejects terminal promotion and checks evidence availability; this is HARNESS plan/review admission."),
    "skill-efficacy-evaluation": spec("direct_product_basis", ["HELIX-HARNESS"], "export function buildSkillEfficacyEvaluationReport", 54, "The report compares with-skill and without-skill evidence and requires reproducible grading artifacts; this is HARNESS process-efficacy evaluation."),
}

DIRECT_O = {
    "author-runtime-evidence": spec("direct_product_basis", ["HELIX-OS"], "export function authorRuntimeAttestation", 32, "The function parses GitHub author evidence and attests whether a change came from Claude, Codex, mixed or external automation with fail-closed missing evidence; this is OS runtime identity control."),
    "closure-evidence-probe-context": spec("direct_product_basis", ["HELIX-OS"], "export function evaluateClosureProbeExecutionContext", 55, "The evaluator checks repository identity, HEAD, clean status and matching worktree before a closure probe; this is OS execution-context authority."),
    "cursor-cloud-run-authority": spec("direct_product_basis", ["HELIX-OS"], "export function classifyCursorV1Runs", 62, "The classifier and follow-up decisions bind Cursor cloud run state, terminal status and read-after evidence; this is OS external-provider run authority."),
    "detect": spec("direct_product_basis", ["HELIX-OS"], "export function detectMode", 35, "The source detects available runtime providers and derives judgment-gate next action, requiring human review when independent runtime evidence is absent; this is OS runtime coordination."),
    "event-projection-checkpoint-replay": spec("direct_product_basis", ["HELIX-OS"], "export function evaluateCheckpointReplay", 48, "The replay evaluator checks append-only event causal order, idempotent ingest, projection drift and checkpoint recovery; this is OS state projection integrity."),
    "event-projection-checkpoint-transaction": spec("direct_product_basis", ["HELIX-OS"], "export function ingestOrchestrationEvent", 118, "The transaction appends an orchestration event, updates projection state and rebuilds/readbacks checkpoint data with rollback failure codes; this is OS durable state management."),
    "forced-stop": spec("direct_product_basis", ["HELIX-OS"], "export function scanDanglingStops", 44, "The scanner records forced-stop/session evidence and produces recovery proposals without exposing raw text; this is OS runtime interruption and recovery control."),
    "git-argument-boundary": spec("direct_product_basis", ["HELIX-OS"], "export function requireSafeGitRemoteUrl", 35, "The functions reject unsafe remote and revision arguments before Git transport interpretation; this is OS command boundary safety."),
    "git-command-guard-hook": spec("direct_product_basis", ["HELIX-OS"], "export function runGitCommandGuardHook", 100, "The hook parses a command, consults guard override evidence and records an audit before permitting destructive Git mutation; this is OS mutation authority."),
    "git-command-guard": spec("direct_product_basis", ["HELIX-OS"], "export function evaluateGitCommandGuard", 86, "The pure guard classifies destructive Git and GitHub lifecycle commands, blocks cross-runtime history damage and requires a reasoned override; this is OS safety control."),
    "guard-override-transaction": spec("direct_product_basis", ["HELIX-OS"], "export function commitOverrideUse", 45, "The transaction consumes a one-shot override marker and commits an auditable guard-block classification, preventing replay; this is OS guard authority."),
    "hosted-preflight": spec("direct_product_basis", ["HELIX-OS"], "export function requireHostedSurfacePreflight", 50, "The preflight validates hosted adapter parity and refuses an unproven surface before operation; this is OS execution-surface safety."),
    "isolated-worktree-sandbox-runner": spec("direct_product_basis", ["HELIX-OS"], "export function buildIsolatedWorktreePlan", 53, "The plan fixes worktree/sandbox identity, writable paths, and cleanup evidence for isolated provider work; this is OS worker isolation."),
    "issue-hierarchy": spec("direct_product_basis", ["HELIX-OS"], "export function auditIssueNativeGraphProjection", 82, "The audit projects issue hierarchy/dependency relations and detects native graph drift and closure inconsistencies; this is OS governance state projection."),
    "lane-hygiene": spec("direct_product_basis", ["HELIX-OS"], "export function inspectLane", 42, "The inspector parses worktree porcelain and checks lane cleanliness against a base; this is OS lane and worktree hygiene."),
    "machine-safety-guard-hook": spec("direct_product_basis", ["HELIX-OS"], "export function runMachineSafetyGuardHook", 46, "The hook resolves interpreter scripts and applies the machine safety classifier before shell execution, failing closed on unverifiable inputs; this is OS host-safety control."),
    "machine-safety-guard": spec("direct_product_basis", ["HELIX-OS"], "export function evaluateMachineSafetyGuard", 63, "The classifier blocks broad, dynamic, host-destructive and interpreter deletion operations while permitting a proven single-file case; this is OS machine safety."),
    "physical-filesystem-identity": spec("direct_product_basis", ["HELIX-OS"], "export function evaluatePhysicalFilesystemTargetSafety", 90, "The evaluator binds realpath/device/inode and no-follow file identity before mutation, rejecting symlink or target drift; this is OS filesystem safety."),
    "project-hook-assignment-provider": spec("direct_product_basis", ["HELIX-OS"], "export function createAssignmentProjectHookAuthorityProvider", 48, "The provider captures project hook authority input through an explicit physical adapter and returns unavailable rather than inventing authority; this is OS hook authority."),
    "project-hook-authority-consumer": spec("direct_product_basis", ["HELIX-OS"], "export function admitProjectHookAuthorityDispatch", 40, "The consumer admits dispatch only from a resolved hook authority surface and preserves failure receipts; this is OS execution authority."),
    "project-hook-authority-envelope": spec("direct_product_basis", ["HELIX-OS"], "export function resolveProjectHookAuthorityFromTransport", 62, "The envelope verifies transport schema, source material and root identity before resolving project hook authority; this is OS authority transport."),
    "project-hook-authority-provider": spec("direct_product_basis", ["HELIX-OS"], "export function resolveProjectHookAuthorityFromProvider", 37, "The provider consumes explicit authority input and returns an unavailable result when it cannot be supplied, avoiding ambient inference; this is OS authority control."),
    "project-hook-authority-surface-projector": spec("direct_product_basis", ["HELIX-OS"], "export function projectProjectHookAuthoritySurfaces", 33, "The projector copies one resolved receipt/failure byte surface across session, doctor, status and dispatch without recomputing authority; this is OS state projection."),
    "project-hook-authority": spec("direct_product_basis", ["HELIX-OS"], "export function projectHookAuthoritySourceStaleFailure", 65, "The authority resolver validates root identity, source material, assignment binding and lifecycle policy, returning typed stale/unavailable failures; this is OS hook authority."),
    "project-hook-physical-adapter": spec("direct_product_basis", ["HELIX-OS"], "export function captureProjectHookAuthorityInput", 28, "The adapter reads physical repository identity, configured source material and hook authority input for the resolver; this is OS physical authority capture."),
    "provider-process-lifecycle": spec("direct_product_basis", ["HELIX-OS"], "export function classifyProviderProcessTerminal", 90, "The classifier admits provider success only after deadline, signal and process-tree conditions are satisfied, preventing exit-zero false success; this is OS provider lifecycle control."),
    "resident-lane-assignment": spec("direct_product_basis", ["HELIX-OS"], "export function projectResidentLaneAssignments", 105, "The projection validates resident lane assignment state and review/takeover returns, preserving typed failure codes; this is OS worker lane authority."),
    "runtime-capability-matrix": spec("direct_product_basis", ["HELIX-OS"], "export function evaluateRuntimeCapabilityRoute", 50, "The route evaluator compares requested capability with runtime support and returns a bounded route decision; this is OS runtime capability governance."),
    "secret-egress-hook": spec("direct_product_basis", ["HELIX-OS"], "export function runSecretEgressHook", 80, "The hook scans write/Git egress inputs for secret material and blocks without emitting raw values; this is OS security egress control."),
    "security-credential-egress-guard": spec("direct_product_basis", ["HELIX-OS"], "export function buildSecurityCredentialEgressGuardReport", 58, "The report evaluates offline/allowlist egress policy and credential-bearing activation, returning typed findings; this is OS security boundary control."),
    "source-content-mirror-completeness": spec("direct_product_basis", ["HELIX-OS"], "export function buildSourceContentMirrorCompletenessReport", 82, "The report checks repository refs, default tree/content digests, chunk completeness and resumable mirror failures; this is OS source-state projection control."),
    "state-machine-tool-policy": spec("direct_product_basis", ["HELIX-OS"], "export function buildStateMachineToolPolicyReport", 58, "The report applies hard/advisory/unsupported tool policy to a state-machine request and fails on forbidden transitions; this is OS runtime policy."),
    "upstream-adoption": spec("direct_product_basis", ["HELIX-OS"], "export function buildGuardGovernancePack", 70, "The governance pack classifies provenance, consumer CLI resolution, green evidence and distribution curation with fail-close decisions; this is OS upstream control."),
    "windows-lite-canary-admission": spec("direct_product_basis", ["HELIX-OS"], "export function evaluateWindowsCanaryQueue", 65, "The queue/lease/completion evaluators bind policy, Linux artifact digest, profile digest and canary receipts; this is OS platform admission."),
    "work-guard-hook": spec("direct_product_basis", ["HELIX-OS"], "export function runWorkGuardHook", 85, "The hook collects stdin, Git/session state and one-shot foreign-edit overrides, blocking unverifiable worktree ownership; this is OS work-safety control."),
    "work-guard": spec("direct_product_basis", ["HELIX-OS"], "export function evaluateWorkGuard", 82, "The pure guard blocks edits to another runtime's uncommitted files and requires evidence-backed override; this is OS shared-worktree safety."),
    "worktree-state": spec("direct_product_basis", ["HELIX-OS"], "export function resolveWorkGuardTargetState", 95, "The state resolver combines Git porcelain, session touched files and target worktree identity before evaluating an edit; this is OS worktree authority."),
}

CONFLICT = {
    "claude-pr-convergence": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function validateClaudePrReviewReceipt", 95, "The source validates independent review receipt and author-runtime attestation: the review/acceptance contract is HARNESS-facing while runtime identity and GitHub evidence are OS-facing, so one owner cannot be inferred."),
    "cross-repo-spec-store": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function buildCrossRepoSpecStoreReport", 45, "The source checks consuming plan/spec artifact binding and pinned refs while also deciding trusted cross-repository synchronization; plan evidence and operational authority remain in conflict."),
    "constitution-template-stack": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function buildConstitutionTemplateStackReport", 55, "The source resolves core/role/preset/project policy templates and reports override findings; template/design contract is HARNESS-facing while project authority resolution is OS-facing."),
    "independent-review-fallback": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function selectIndependentReviewProvider", 72, "The source selects and persists an independent review provider and sandbox fallback; review admission is HARNESS-facing while provider process/sandbox authority is OS-facing."),
    "parallel-candidate-verifier-council": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function buildCandidateCouncilReport", 48, "The council aggregates candidate verification findings and provider evidence; verification decision belongs to HARNESS but runtime/provider quorum belongs to OS."),
    "preflight-gate-aggregation": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function aggregatePreflightGates", 75, "The aggregator joins repository/design preflight gates with runtime/adapter observations and fail-close outcomes; both V-model admission and operational execution boundaries are present."),
    "summary-surface-audit": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function buildSummarySurfaceCommandAudit", 78, "The audit checks semantic requirement fields and workflow-route commands while also exposing operational doctor/status projections; presentation contract and OS state projection compete."),
    "work-graph-receipt-acceptance": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function evaluateParentAcceptanceOrdering", 78, "The source orders delegation/parent acceptance receipts and verifies worker independent-review capability; work-graph admission is HARNESS-facing while worker/lane capability is OS-facing."),
}

INSUFFICIENT = {
    "autonomous-loop-run-receipts": spec("insufficient_basis", [], None, 9, "The source is an explicit relocation tombstone with no runtime behavior; it preserves a dependency-direction history but cannot establish a current product boundary."),
    "document-report-write-port": spec("insufficient_basis", [], "export function validateDocumentReportArtifactPath", 42, "The source validates a report write path and receipt, but generic artifact I/O does not identify whether the consuming contract is HARNESS or OS."),
    "digest": spec("insufficient_basis", [], "export function compareBytewise", 14, "The source provides locale-independent byte ordering only; a utility primitive has no direct product-responsibility evidence."),
    "extension-preset-bundle-registry": spec("insufficient_basis", [], "export function buildExtensionPresetBundleRegistryReport", 45, "The source validates extension/preset bundle metadata, but catalog records alone do not establish HARNESS, OS or end-product ownership."),
    "issue-closure-graph": spec("insufficient_basis", [], None, 5, "The source is a compatibility tombstone pointing to a lint owner; no runtime responsibility remains to classify."),
    "lint-artifact-write-port": spec("insufficient_basis", [], "export function createLintArtifactWritePort", 43, "The source writes lint artifacts through a durable port, but the generic write boundary is shared infrastructure and lacks product-specific contract evidence."),
    "lint-effect-executor": spec("insufficient_basis", [], "export function runProbe", 70, "The source executes probe/materialize effects under digest and authorization checks, but the generic lint effect port does not by itself establish product ownership."),
    "lint-probe-adapter": spec("insufficient_basis", [], "export function createLintProbePort", 34, "The source adapts a bounded probe process, but command execution transport is shared infrastructure without a product-boundary proof."),
    "run-debug": spec("insufficient_basis", [], "export function appendRuntimeVerificationLogEvent", 26, "The source appends a runtime verification log event, but this narrow log port does not establish the product contract that consumes it."),
    "sqlite-error": spec("insufficient_basis", [], "export function isSqliteBusy", 5, "The source normalizes SQLite busy/locked error text only; the utility has no product-specific responsibility evidence."),
    "stable-cause-digest": spec("insufficient_basis", [], "export function stableCauseDigest", 36, "The source creates privacy-safe error cause digests, but generic diagnostic normalization does not establish a product owner."),
}

REVIEW_SPECS = {**DIRECT_H, **DIRECT_O, **CONFLICT, **INSUFFICIENT}

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
NEGATIVE_CASES = [
    "target_record_omission", "target_record_duplicate", "edge_omission", "edge_duplicate",
    "source_digest_tamper", "source_anchor_tamper", "source_profile_tamper", "candidate_product_tamper",
    "classification_category_tamper", "semantic_review_tamper", "boundary_digest_tamper", "input_digest_omission",
    "input_digest_duplicate", "input_digest_extra_path", "authority_promotion", "record_top_level_extra_key",
    "source_read_mode_tamper", "inventory_authority_promotion", "inventory_scope_tamper", "inventory_formal_update_tamper",
    "inventory_classification_rule_tamper", "inventory_counts_artifact_kind_tamper", "inventory_edge_count_tamper",
    "fixed_BASE_non_ancestor", "generator_review_spec_tamper", "generator_anchor_tamper",
    "generator_l1_tamper", "base_pin_tamper", "base_source_missing", "history_tamper",
    "human_judgment_tamper", "input_digest_value_tamper", "inventory_negative_case_tamper",
    "output_digest_tamper", "phase_status_tamper", "source_line_range_tamper",
    "inventory_overlap_tamper",
]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def tagged(data: bytes) -> str:
    return "sha256:" + sha(data)


def canonical(value: object) -> str:
    return tagged(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


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
    text = "\n".join(lines[start - 1:end])
    return {"path": path, "blob": git_blob(path), "line_start": start, "line_end": end, "line_count": end - start + 1, "line_text_sha256": tagged(text.encode()), "line_text": lines[start - 1:end]}


def boundary_receipts() -> dict:
    return {product: {"path": BOUNDARY, "blob": git_blob(BOUNDARY), "ranges": [range_receipt(BOUNDARY, *r) for r in ranges]} for product, ranges in BOUNDARY_RANGES.items()}


def l1_receipts() -> dict:
    return {product: {"path": path, "blob": git_blob(path), "ranges": [range_receipt(path, *r) for r in L1_RANGES[product]]} for product, path in L1.items()}


def compact_crosswalk(row: dict, line: int) -> dict:
    fields = ["crosswalk_id", "source_requirement_id", "unit_candidate_id", "product_scope", "responsibility_summary", "direct_legacy_asset_link_status", "phase_classification_status", "direct_phase_candidates", "current_requirement_implementation_status", "legacy_requirement_implementation_status", "consumer_closure_status", "successor_assignment_status", "legacy_execution_performed", "new_build_allowed", "authority_effect", "unresolved"]
    out = {k: row.get(k) for k in fields}
    out.update({"path": CROSSWALK, "line": line, "row_sha256": row_digest(row)})
    return out


def compact_decomp(parent: dict, unit: dict, line: int) -> dict:
    return {"path": DECOMPOSITION, "line": line, "decomposition_id": parent.get("decomposition_id"), "source_requirement_id": parent.get("source_requirement_id"), "unit_candidate_id": unit.get("unit_candidate_id"), "unit_kind": unit.get("unit_kind"), "product_target": unit.get("product_target"), "direct_phase_candidates": unit.get("direct_phase_candidates"), "phase_classification_status": unit.get("phase_classification_status"), "semantic_coverage_status": unit.get("semantic_coverage_status"), "authority_effect": unit.get("authority_effect"), "row_sha256": canonical({"parent": parent.get("source_requirement_id"), "unit": unit})}


def history_receipt(asset_id: str, dispositions: dict, decisions: list[tuple[int, dict]], read_afters: list[tuple[int, dict]]) -> dict:
    line, row = dispositions[asset_id]
    return {
        "disposition": {"path": DISPOSITION, "line": line, "row_sha256": row_digest(row), "asset_id": asset_id, "revision": row.get("revision"), "disposition": row.get("disposition"), "asset_class": row.get("asset_class"), "product_target": row.get("product_target"), "authority_status": row.get("authority_status"), "implementation_status": row.get("implementation_status"), "consumer_refs": sorted(row.get("consumer_refs", [])), "decision_record_ref": row.get("decision_record_ref"), "read_after_record_ref": row.get("read_after_record_ref")},
        "decisions": [{"path": DECISIONS, "line": n, "row_sha256": row_digest(r), "decision_id": r.get("decision_id"), "disposition": r.get("disposition"), "product_target": r.get("product_target"), "consumer_refs": sorted(r.get("consumer_refs", []))} for n, r in decisions if r.get("asset_id") == asset_id],
        "read_after": [{"path": READ_AFTER, "line": n, "row_sha256": row_digest(r), "read_after_id": r.get("read_after_id"), "result": r.get("result"), "digest_match": r.get("digest_match"), "consumer_match": r.get("consumer_match"), "failure": r.get("failure"), "consumer_refs_observed": sorted(r.get("consumer_refs_observed", []))} for n, r in read_afters if r.get("asset_id") == asset_id],
        "state_boundary": "disposition remains unresolved; decision/read-after rows are preserved as historical evidence and do not confer product authority",
    }


def profile_for(name: str) -> tuple[str, list[str], str, dict]:
    if name not in REVIEW_SPECS:
        raise AssertionError(f"unreviewed source {name}")
    s = REVIEW_SPECS[name]
    return s["category"], list(s["products"]), s["reason"], s


def _anchor_for(path: str, review: dict) -> list[dict]:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    marker = review.get("marker")
    if marker:
        starts = [i for i, line in enumerate(lines, 1) if marker in line]
        if len(starts) > 1:
            # Prefer a declaration line whose trimmed text starts with the
            # marker; substring matches in similarly named failure helpers are
            # not semantic anchors.
            exact = [
                i for i, line in enumerate(lines, 1)
                if line.strip().startswith(marker)
                and (len(line.strip()) == len(marker) or not line.strip()[len(marker)].isalnum() and line.strip()[len(marker)] not in "_$")
            ]
            if exact:
                starts = exact
        if len(starts) != 1:
            raise AssertionError(f"marker {marker!r} not unique in {path}: {starts}")
        start = starts[0]
    else:
        starts = [i for i, line in enumerate(lines, 1) if line.strip() and not line.lstrip().startswith(("import ", "from "))]
        start = starts[0] if starts else 1
    end = min(len(lines), start + review["length"] - 1)
    text = "\n".join(lines[start - 1:end])
    return [{"line_start": start, "line_end": end, "line_text": lines[start - 1:end], "line_text_sha256": tagged(text.encode()), "interpretation": review["reason"], "products_considered": list(review["products"]) or list(PRODUCTS)}]


def archive_source(asset: dict, review: dict) -> dict:
    archive_path = ARCHIVE_PREFIX + asset["source_path"]
    data = git_bytes(archive_path)
    if sha(data) != asset["source_sha256"]:
        raise AssertionError(f"source digest mismatch for {asset['asset_id']}")
    return {"archive_path": archive_path, "source_path": asset["source_path"], "blob": git_blob(archive_path), "bytes": len(data), "line_count": len(data.decode(errors="replace").splitlines()), "sha256": tagged(data), "ledger_source_sha256": "sha256:" + asset["source_sha256"], "semantic_anchors": _anchor_for(archive_path, review), "read_mode": "git_object_static_read_only"}


def wave_link(item: tuple[int, str, int, dict]) -> dict:
    wave, path, line, row = item
    edge_base = {"wave": wave, "path": path, "line": line, "asset_id": row["asset_id"], "unit_candidate_id": row.get("unit_candidate_id"), "semantic_link_status": row.get("semantic_link_status")}
    return {"edge_id": canonical(edge_base), "wave": wave, "path": path, "line": line, "row_sha256": row_digest(row), "asset_id": row["asset_id"], "source_requirement_id": row.get("source_requirement_id"), "artifact_evidence_kind": row.get("artifact_evidence_kind"), "unit_candidate_id": row.get("unit_candidate_id"), "semantic_link_status": row.get("semantic_link_status"), "semantic_relation": row.get("semantic_relation"), "candidate_product_targets": row.get("candidate_product_targets") or [], "product_scope": row.get("product_scope") or [], "candidate_phase_targets": row.get("candidate_phase_targets") or [], "source_path": row.get("source_path"), "source_sha256": row.get("source_sha256"), "source_statement_semantic_digest": row.get("source_statement_semantic_digest"), "source_statement_text": row.get("source_statement_text"), "source_text_spans": row.get("source_text_spans") or [], "evidence_refs": row.get("evidence_refs") or [], "legacy_asset_evidence_state": row.get("legacy_asset_evidence_state"), "legacy_execution_status": row.get("legacy_execution_status"), "consumer_closure_status": row.get("consumer_closure_status"), "observed_consumer_refs": row.get("observed_consumer_refs") or [], "counterevidence": row.get("counterevidence") or [], "unresolved": row.get("unresolved") or [], "product_alignment_status": row.get("product_alignment_status"), "authority_effect": row.get("authority_effect"), "new_build_allowed": row.get("new_build_allowed")}


def manual_review(review: dict, archive_path: str, boundary: dict, l1: dict) -> dict:
    category, products = review["category"], review["products"]
    status = {"direct_product_basis": "reviewed_candidate", "multi_product_conflict": "reviewed_conflict", "insufficient_basis": "reviewed_insufficient_basis"}[category]
    counter = []
    for product in (products or PRODUCTS):
        ranges = BOUNDARY_RANGES[product]
        counter.append({"product": product, "evidence": range_receipt(BOUNDARY, *ranges[1]), "interpretation": f"product-boundary text for {product} remains the human counter-boundary; the source span does not establish an approved owner"})
    return {"status": status, "source_spans": _anchor_for(archive_path, review), "candidate_products": list(products), "l1_evidence": {p: l1[p] for p in products}, "interpretation": review["reason"], "boundary_counterevidence": counter, "consumer_boundary": {"status": "pending", "interpretation": "legacy consumer relation is retained as a pending closure boundary; no direct semantic link is accepted", "refs": [range_receipt(CONSUMER_SOURCE, *r) for r in CONSUMER_RANGES]}}


def make_record(asset_id: str, phase_item: tuple[int, dict], asset_item: tuple[int, dict], wave_items: list[tuple[int, str, int, dict]], cw: dict, decomp: dict, decisions: list[tuple[int, dict]], read_afters: list[tuple[int, dict]], dispositions: dict, boundary: dict, l1: dict) -> dict:
    phase_line, phase = phase_item
    asset_line, asset = asset_item
    name = asset["source_path"].rsplit("/", 1)[-1].removesuffix(".ts")
    category, products, reason, review = profile_for(name)
    links = [wave_link(x) for x in wave_items]
    wave_products = sorted({p for link in links for p in (link.get("candidate_product_targets") or []) + (link.get("product_scope") or [])})
    unit_ids = sorted({link["unit_candidate_id"] for link in links if link.get("unit_candidate_id")})
    units = [{"unit_candidate_id": uid, "crosswalk": cw[uid], "decomposition": decomp[uid]} for uid in unit_ids]
    phase_receipt = {"path": PHASE, "line": phase_line, "row_sha256": row_digest(phase), "product_classification_status": phase.get("product_classification_status"), "candidate_product_targets": phase.get("candidate_product_targets") or [], "candidate_phase_targets": phase.get("candidate_phase_targets") or [], "source_path": phase.get("source_path"), "source_sha256": phase.get("source_sha256"), "consumer_closure_status": phase.get("consumer_closure_status")}
    asset_receipt = {"path": DISPOSITION, "line": asset_line, "row_sha256": row_digest(asset), "source_path": asset.get("source_path"), "source_sha256": asset.get("source_sha256"), "disposition": asset.get("disposition"), "product_target": asset.get("product_target"), "authority_status": asset.get("authority_status"), "implementation_status": asset.get("implementation_status"), "consumer_refs": sorted(asset.get("consumer_refs", []))}
    review_obj = manual_review(review, ARCHIVE_PREFIX + asset["source_path"], boundary, l1)
    return {
        "asset_id": asset_id, "classification_category": category, "classification_reason": reason + " Candidate only; formal product authority remains unresolved.", "classification_state": "research_proposal_pending_human_product_review", "authority_effect": "none", "formal_asset_classification_updated": False, "new_build_allowed": False,
        "source_profile": {"name": name, "base_category": category, "source_products": products, "wave_products": wave_products, "profile_reason": reason, "semantic_review_status": review_obj["status"]},
        "phase_ledger": phase_receipt, "asset_ledger": asset_receipt, "source_exact": archive_source(asset, review),
        "wave_semantic_links": sorted(links, key=lambda x: (x["wave"], x["line"], x["edge_id"])), "unit_product_candidates": units,
        "candidate_products": products, "observed_wave_products": wave_products, "semantic_link_statuses": sorted({x.get("semantic_link_status") for x in links}), "artifact_evidence_kinds": sorted({x.get("artifact_evidence_kind") for x in links}) if links else ["implementation_source"],
        "legacy_history_failure_consumer": history_receipt(asset_id, dispositions, decisions, read_afters), "boundary_evidence": boundary, "l1_evidence": l1,
        "manual_semantic_review": review_obj,
        "failure_consumer_static_refs": {"failure": {"path": FAILURE_SOURCE, "blob": git_blob(FAILURE_SOURCE), "ranges": [range_receipt(FAILURE_SOURCE, *r) for r in FAILURE_RANGES]}, "consumer": {"path": CONSUMER_SOURCE, "blob": git_blob(CONSUMER_SOURCE), "ranges": [range_receipt(CONSUMER_SOURCE, *r) for r in CONSUMER_RANGES]}},
        "human_judgment_remaining": ["product_owner_and_boundary_decision", "source_semantic_anchor_acceptance", "phase_admission_and_successor_assignment", "legacy_consumer_closure_and_failure_disposition", "formal_asset_classification_update"],
    }


def build() -> None:
    BUNDLE.mkdir(parents=True, exist_ok=True)
    wave_rows = []
    for wave, path in WAVE_PATHS.items():
        wave_rows.extend((wave, path, line, row) for line, row in read_jsonl(path))
    by_asset: defaultdict[str, list] = defaultdict(list)
    for item in wave_rows:
        by_asset[item[3]["asset_id"]].append(item)
    phase_by_asset = {row["asset_id"]: (line, row) for line, row in read_jsonl(PHASE)}
    disposition_by_asset = {row["asset_id"]: (line, row) for line, row in read_jsonl(DISPOSITION)}
    decisions, read_afters = read_jsonl(DECISIONS), read_jsonl(READ_AFTER)
    cw = {row["unit_candidate_id"]: compact_crosswalk(row, line) for line, row in read_jsonl(CROSSWALK)}
    decomp: dict = {}
    for line, parent in read_jsonl(DECOMPOSITION):
        for unit in parent.get("candidate_units", []):
            decomp[unit["unit_candidate_id"]] = compact_decomp(parent, unit, line)
    targets = sorted(a for a, (line, row) in phase_by_asset.items() if row.get("product_classification_status") == "unresolved" and row.get("source_path", "").startswith("src/runtime/"))
    if len(targets) != 73:
        raise AssertionError(f"expected 73 target assets, got {len(targets)}")
    if set(phase_by_asset[a][1]["source_path"].rsplit("/", 1)[-1].removesuffix(".ts") for a in targets) != set(REVIEW_SPECS):
        raise AssertionError("runtime review spec set does not match target asset set")
    if any(a not in disposition_by_asset for a in targets):
        raise AssertionError("target absent from disposition ledger")
    boundary, l1 = boundary_receipts(), l1_receipts()
    records = [make_record(a, phase_by_asset[a], disposition_by_asset[a], by_asset.get(a, []), cw, decomp, decisions, read_afters, disposition_by_asset, boundary, l1) for a in targets]
    out = BUNDLE / "classification-research.jsonl"
    out.write_text("".join(json.dumps(r, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for r in records))
    source_paths = [ARCHIVE_PREFIX + phase_by_asset[a][1]["source_path"] for a in targets]
    input_paths = [*WAVE_PATHS.values(), *GLOBAL_INPUTS, *source_paths]
    if len(input_paths) != len(set(input_paths)):
        raise AssertionError("input path list duplicated")
    input_digests = [{"path": p, "blob": git_blob(p), "bytes": len(git_bytes(p)), "sha256": tagged(git_bytes(p))} for p in input_paths]
    category_counts = Counter(r["classification_category"] for r in records)
    category_counts = Counter({key: category_counts.get(key, 0) for key in ("direct_product_basis", "multi_product_conflict", "insufficient_basis")})
    inventory = {
        "schema_revision": 1, "binding_id": BINDING_ID, "base_revision": BASE_REVISION, "base_source_mode": "all input and archive evidence bytes from fixed BASE Git objects",
        "scope": "phase product unresolved + src/runtime/ exact 73 assets",
        "wave_source_paths": WAVE_PATHS,
        "counts": {"wave_files": 50, "wave_edges": len(wave_rows), "wave_unique_assets": len(by_asset), "target_assets": len(records), "target_wave_edges": sum(len(r["wave_semantic_links"]) for r in records), "target_wave_linked_assets": sum(bool(r["wave_semantic_links"]) for r in records), "categories": dict(sorted(category_counts.items())), "target_asset_artifact_evidence_kinds": {"implementation_source": sum(1 for a in targets if phase_by_asset[a][1].get("artifact_evidence_kind") == "implementation_source")}},
        "review_counts": {"source_semantic_reviewed": len(records), "source_semantic_review_pending": 0, "direct_candidate_basis": category_counts["direct_product_basis"], "multi_product_conflict": category_counts["multi_product_conflict"], "insufficient_basis": category_counts["insufficient_basis"]},
        "expected_sets": {"target_asset_count": 73, "target_asset_ids": targets, "target_asset_ids_sha256": tagged("\n".join(targets).encode()), "source_paths": [phase_by_asset[a][1]["source_path"] for a in targets]},
        "input_digests": input_digests,
        "old_asset_source_mode": "archive bytes are read through git show BASE:<archive-path>; never executed",
        "formal_update": {"formal_asset_classification_updated": False, "phase_ledger_updated": False, "product_route_updated": False, "successor_updated": False, "new_build_allowed": False, "authority_effect": "none"},
        "classification_rule": {"direct_product_basis": "a reviewed concrete source span mapped to one product L1 with explicit boundary counterevidence and pending consumer evidence", "multi_product_conflict": "reviewed source behavior contains concrete responsibilities mapped to two product boundaries; no single owner is proposed", "insufficient_basis": "source is generic, tombstone, shared infrastructure, or lacks an accepted product-boundary proof; observed Wave scope is not inherited"},
        "manual_reviewed_asset_ids": targets,
        "negative_cases": NEGATIVE_CASES,
        "research_overlap": {
            "reference_bundle_counts": {"wave_unresolved_product": 64, "lint_unresolved_src": 95, "runtime_unresolved_src": 73},
            "pairwise_intersections": {"runtime_wave_unresolved_product": 16, "runtime_lint_unresolved_src": 0, "wave_unresolved_product_lint_unresolved_src": 14},
            "union_count": 202,
            "runtime_wave_overlap_asset_ids": sorted({a for a in targets if a in by_asset and phase_by_asset[a][1].get("product_classification_status") == "unresolved"}),
            "runtime_lint_overlap_asset_ids": [],
        },
        "boundary_refs": {"product_boundary": BOUNDARY, "l1": L1}, "history_failure_consumer": {"disposition_rows": 73, "decision_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["decisions"]) for r in records), "read_after_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["read_after"]) for r in records), "failure_consumer_refs_are_static_global_inventory": True},
        "edge_contract": {"edge_identity": "edge_id derived from wave/path/line/asset_id/unit_candidate_id/semantic_link_status", "duplicate_edges_forbidden": True, "missing_edges_forbidden": True},
        "authority_boundary": {"authority_effect": "none", "classification_state": "research_proposal_pending_human_product_review", "formal_asset_classification_updated": False, "new_build_allowed": False},
        "artifacts": ["scaffold/bindings/SCF-B-0117.json", "scaffold/legacy-runtime-product-classification-0117/README.md", "scaffold/legacy-runtime-product-classification-0117/PR-DRAFT.md", "scaffold/legacy-runtime-product-classification-0117/generate.py", "scaffold/legacy-runtime-product-classification-0117/validate.py", "scaffold/legacy-runtime-product-classification-0117/selfcheck.py", "scaffold/legacy-runtime-product-classification-0117/inventory.json", "scaffold/legacy-runtime-product-classification-0117/classification-research.jsonl"],
        "output_sha256": tagged(out.read_bytes()),
    }
    phase_dist = Counter(tuple(phase_by_asset[a][1].get("candidate_phase_targets") or []) for a in targets)
    inventory["counts"]["target_phase_candidate_distribution"] = {"|".join(k): v for k, v in sorted(phase_dist.items())}
    (BUNDLE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, sort_keys=True, indent=2) + "\n")


if __name__ == "__main__":
    build()
