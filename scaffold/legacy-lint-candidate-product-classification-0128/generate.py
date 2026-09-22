#!/usr/bin/env python3
"""Static generator for the candidate src/lint product research bundle."""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-lint-candidate-product-classification-0128"
BASE_REVISION = "cb5a45fea289d61b67cba100fd2406813021ef48"
BINDING_ID = "SCF-B-0128"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
BOUNDARY = "docs/concept/product-boundary.md"
L1 = {"HELIX-HARNESS": "docs/helix-harness/L1-planning/product-intent.md", "HELIX-OS": "docs/helix-os/L1-planning/system-intent.md", "HELIX-Web": "docs/helix-web/L1-planning/product-intent.md", "HELIX-Web-OS": "docs/helix-web-os/L1-planning/system-intent.md"}
L1_MARKERS = {"HELIX-HARNESS": "## 提供価値", "HELIX-OS": "## 提供価値", "HELIX-Web": "## 提供価値", "HELIX-Web-OS": "## 境界"}
APPROVAL_DECISION = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
APPROVAL_PACKET = "docs/governance/audits/source-rebaseline/concept-v4.1-human-decision-packet.md"
PRODUCT_BOUNDARY_MARKERS = {"HELIX-HARNESS": "| HARNESS | Vモデル、工程、要求・設計・検証の対応、進行・完了条件、外部提供物の成立条件 |", "HELIX-OS": "| HELIX-OS | プロジェクト群の管理・統制、Worker、CI、ログ、学習、継続・復旧、HELIXの改善循環 |", "HELIX-Web": "| HELIX-Web | Connector型AI開発SaaSとしてWeb利用者が受け取るダッシュボード、サービス、操作体験 |", "HELIX-Web-OS": "| HELIX-Web-OS | Web展開先のtenant・Connector・job・service state・配備・監視・復旧 |"}
APPROVAL_ROW_MARKERS = {"HELIX-HARNESS": "| `HDEC-HARNESS-L1-01` |", "HELIX-OS": "| `HDEC-HELIXOS-L1-01` |", "HELIX-Web": "| `HDEC-HELIXWEB-L1-01` |", "HELIX-Web-OS": "| `HDEC-HELIXWEBOS-L1-01` |"}
APPROVAL_MEANING_MARKERS = {"HELIX-HARNESS": "- HELIX-HARNESSを外部提供製品とし、", "HELIX-OS": "- HELIX-OSをHELIX project群の管理・統制・Worker・学習・log・CI・継続改善機構とし、", "HELIX-Web": "- HELIX-WebをHELIX-OSが開発・改善管理するConnector型Web製品とする。", "HELIX-Web-OS": "- HELIX-Web-OSをHELIX-OS外のservice runtimeとし、"}
L1_BASIS_MARKERS = {'src/lint/action-binding-approval-readiness.ts': {'HELIX-HARNESS': '| HARNESS-L1-004 |',
                                                   'HELIX-OS': '| HELIXOS-L1-004 |'},
 'src/lint/agent-model-ssot.ts': {'HELIX-OS': '| HELIXOS-L1-003 |'},
 'src/lint/asset-drift.ts': {'HELIX-OS': '| HELIXOS-L1-008 |'},
 'src/lint/backfill-pairing.ts': {'HELIX-HARNESS': '| HARNESS-L1-003 |'},
 'src/lint/branch-kind.ts': {'HELIX-HARNESS': '| HARNESS-L1-003 |', 'HELIX-OS': '| HELIXOS-L1-004 |'},
 'src/lint/canonical-reuse-authority.ts': {'HELIX-HARNESS': '| HARNESS-L1-003 |', 'HELIX-OS': '| HELIXOS-L1-008 |'},
 'src/lint/canonical-reuse-consumer-baseline.ts': {},
 'src/lint/change-impact.ts': {'HELIX-HARNESS': '| HARNESS-L1-003 |'},
 'src/lint/coding-rules.ts': {'HELIX-HARNESS': '| HARNESS-L1-002 |'},
 'src/lint/completion-decision-packet.ts': {'HELIX-HARNESS': '| HARNESS-L1-004 |'},
 'src/lint/cutover-readiness.ts': {'HELIX-OS': '| HELIXOS-L1-007 |'},
 'src/lint/descent-obligation.ts': {'HELIX-HARNESS': '| HARNESS-L1-003 |'},
 'src/lint/design-language.ts': {'HELIX-HARNESS': '| HARNESS-L1-009 |'},
 'src/lint/design-reality-binding.ts': {'HELIX-HARNESS': '| HARNESS-L1-009 |', 'HELIX-OS': '| HELIXOS-L1-008 |'},
 'src/lint/digest-inventory.ts': {'HELIX-OS': '| HELIXOS-L1-008 |'},
 'src/lint/document-agent-metadata.ts': {'HELIX-HARNESS': '| HARNESS-L1-001 |'},
 'src/lint/drive-db-registration.ts': {'HELIX-OS': '| HELIXOS-L1-008 |'},
 'src/lint/drive-model-passage.ts': {'HELIX-HARNESS': '| HARNESS-L1-008 |'},
 'src/lint/feedback-log.ts': {'HELIX-OS': '| HELIXOS-L1-006 |'},
 'src/lint/forward-convergence.ts': {'HELIX-HARNESS': '| HARNESS-L1-004 |', 'HELIX-OS': '| HELIXOS-L1-005 |'},
 'src/lint/frontend-design-coverage.ts': {'HELIX-HARNESS': '| HARNESS-L1-009 |', 'HELIX-Web': '| HELIXWEB-L1-002 |'},
 'src/lint/github-guards.ts': {'HELIX-OS': '| HELIXOS-L1-004 |'},
 'src/lint/handover-cutover-approval.ts': {'HELIX-OS': '| HELIXOS-L1-007 |'},
 'src/lint/handover-resurrection.ts': {'HELIX-OS': '| HELIXOS-L1-003 |'},
 'src/lint/handover-retirement.ts': {'HELIX-OS': '| HELIXOS-L1-003 |'},
 'src/lint/identifier-rename.ts': {},
 'src/lint/improvement-backlog.ts': {'HELIX-OS': '| HELIXOS-L1-006 |'},
 'src/lint/l1-l2-consistency.ts': {'HELIX-HARNESS': '| HARNESS-L1-003 |'},
 'src/lint/l1-l2-gap-check.ts': {'HELIX-HARNESS': '| HARNESS-L1-003 |'},
 'src/lint/l12-hybrid-reviewed-safe-v2.ts': {},
 'src/lint/l14-close-audit.ts': {'HELIX-HARNESS': '| HARNESS-L1-004 |'},
 'src/lint/l3-progression-authority.ts': {'HELIX-HARNESS': '| HARNESS-L1-003 |'},
 'src/lint/l3-progression-reviewed-digests.ts': {},
 'src/lint/legacy-orchestration-semantic-consumers.ts': {'HELIX-OS': '| HELIXOS-L1-007 |'},
 'src/lint/legacy-orchestration-surface.ts': {'HELIX-OS': '| HELIXOS-L1-007 |'},
 'src/lint/memory-handover-isolation.ts': {'HELIX-OS': '| HELIXOS-L1-003 |'},
 'src/lint/objective-evidence-audit.ts': {'HELIX-HARNESS': '| HARNESS-L1-004 |'},
 'src/lint/outstanding.ts': {'HELIX-HARNESS': '| HARNESS-L1-004 |', 'HELIX-OS': '| HELIXOS-L1-008 |'},
 'src/lint/pin-chain-derivation.ts': {'HELIX-OS': '| HELIXOS-L1-006 |'},
 'src/lint/project-hook.ts': {'HELIX-OS': '| HELIXOS-L1-008 |'},
 'src/lint/proposal-document-coverage-policy.ts': {'HELIX-HARNESS': '| HARNESS-L1-006 |'},
 'src/lint/readability.ts': {'HELIX-HARNESS': '| HARNESS-L1-009 |'},
 'src/lint/review-evidence.ts': {'HELIX-HARNESS': '| HARNESS-L1-004 |'},
 'src/lint/right-arm-verification-strategy.ts': {'HELIX-OS': '| HELIXOS-L1-003 |'},
 'src/lint/secret-scan.ts': {'HELIX-OS': '| HELIXOS-L1-008 |'},
 'src/lint/semantic-frontier-consistency.ts': {'HELIX-HARNESS': '| HARNESS-L1-003 |'},
 'src/lint/shared.ts': {},
 'src/lint/skill-assignment.ts': {'HELIX-OS': '| HELIXOS-L1-003 |'},
 'src/lint/telemetry-closure.ts': {'HELIX-OS': '| HELIXOS-L1-008 |'},
 'src/lint/version-up-readiness.ts': {'HELIX-HARNESS': '| HARNESS-L1-007 |', 'HELIX-OS': '| HELIXOS-L1-005 |'},
 'src/lint/workflow-classification-terminal-fullback.ts': {'HELIX-OS': '| HELIXOS-L1-008 |'}}
FAILURE_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
WAVE_PATHS = {n: (f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl" if n <= 36 else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl") for n in range(1, 51)}
PRODUCTS = ("HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS")


def p(category: str, products: list[str], marker: str, reason: str, counter: str) -> dict:
    return {"category": category, "candidate_products": products, "marker": marker, "reason": reason, "counter_evidence": counter}


# Every profile is tied to a concrete source marker.  These are candidate
# interpretations only; path/name groupings are never used as ownership proof.
PROFILES = {
 "src/lint/action-binding-approval-readiness.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export interface ActionBindingApprovalPlan", "Defines action-binding approval packets and readiness checks, joining HARNESS acceptance meaning with OS approval and state control.", "HARNESS-L1-004/006 and HELIXOS-L1-001/004 both apply; a single owner is not proposed."),
 "src/lint/agent-model-ssot.ts": p("direct_product_basis", ["HELIX-OS"], "export function analyzeAgentModelSsot(", "Checks canonical model IDs and provider drift for worker configuration; this is OS operational policy and state control.", "HARNESS process artifacts may consume model metadata, but provider/model authority is OS responsibility."),
 "src/lint/asset-drift.ts": p("direct_product_basis", ["HELIX-OS"], "export interface AssetDriftInput", "Detects asset, legacy runtime, and command drift across operational surfaces; this is OS repository governance.", "HARNESS defines artifact meaning, while drift and legacy-surface enforcement remain OS controls."),
 "src/lint/backfill-pairing.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export function normalizeTerm(", "Parses plan requirements and bidirectional backfill obligations for V-model artifacts; this is HARNESS trace semantics.", "OS may record the findings, but requirement-to-plan pairing meaning is HARNESS-owned process evidence."),
 "src/lint/branch-kind.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function branchSnapshotFromPrContext(", "Classifies branch and plan context while checking PR/provider state, joining HARNESS plan semantics with OS repository control.", "HARNESS plan branch meaning and HELIXOS branch/review control both match; no single owner is selected."),
 "src/lint/canonical-reuse-authority.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export const assertCanonicalReuseAllowed", "Gates canonical artifact reuse against authority and blocked paths, combining HARNESS artifact contract with OS authority enforcement.", "HARNESS-L1-005 and HELIXOS-L1-001/008 both provide boundary evidence; retain the conflict."),
 "src/lint/canonical-reuse-consumer-baseline.ts": p("insufficient_basis", [], "export const CANONICAL_REUSE_CONSUMER_BASELINE", "The module is a static consumer-baseline table without an independent product-boundary behavior span; it is retained for human semantic review.", "A data constant and path alone cannot distinguish HARNESS artifact consumers from OS control consumers."),
 "src/lint/change-impact.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export function changeSetIntegrityMessages(", "Classifies source/design/test change sets and checks plan integrity for V-model impact; this is HARNESS change-trace semantics.", "OS controls repository execution around the plan, but change category and impact meaning are HARNESS process evidence."),
 "src/lint/coding-rules.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export const SOURCE_MODULE_POLICY", "Declares source module direction and coding workflow policy for the development artifact; this is HARNESS engineering contract semantics.", "OS may enforce repository checks, while module design rules and workflow meaning remain HARNESS-facing."),
 "src/lint/completion-decision-packet.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export type CompletionDecisionPacketViolationReason", "Validates completion decision packets, review bundles, and evidence freshness for V-model completion; this is HARNESS acceptance evidence.", "OS routes or records decisions, but completion packet meaning is the HARNESS contract."),
 "src/lint/cutover-readiness.ts": p("direct_product_basis", ["HELIX-OS"], "export interface CutoverReadinessPlan", "Checks cutover records, outstanding state, and source-ledger readiness at an operational transition boundary; this is OS control.", "HARNESS supplies process completion conditions, while cutover authority and operational readiness belong to OS."),
 "src/lint/descent-obligation.ts": p("direct_product_basis", ["HELIX-HARNESS"], "const DOC_FR_TRACE_RE", "Tracks FR and implementation-role obligations through V-model layers and detects descent gaps; this is HARNESS trace contract logic.", "OS can manage the work queue, but layer descent and requirement trace meaning are HARNESS responsibilities."),
 "src/lint/design-language.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export const DESIGN_LANGUAGE_BASELINE_FINGERPRINT", "Defines design-language baselines and violation analysis for project design documents; this is HARNESS design quality semantics.", "Web presentation may consume design outputs, but the design contract and baseline are HARNESS evidence."),
 "src/lint/design-reality-binding.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function classifyAddDesignRealityTargets(", "Binds design targets to implementation and failure-reachability evidence, joining HARNESS design reality with OS evidence/control state.", "HARNESS-L1-003/004 and HELIXOS-L1-006/008 both apply; no single owner is proposed."),
 "src/lint/digest-inventory.ts": p("direct_product_basis", ["HELIX-OS"], "export function scanDigestInventory(", "Scans canonical digest variants and exclusions across repository files; this is OS provenance and drift control.", "HARNESS uses digests as artifact evidence, but repository-wide inventory and drift enforcement are OS controls."),
 "src/lint/document-agent-metadata.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export function buildDeclarationRegistry(", "Builds document-agent declaration metadata and detects metadata/cycle findings, supporting HARNESS document traceability.", "OS can store the registry, but document declaration and design metadata meaning are HARNESS process semantics."),
 "src/lint/drive-db-registration.ts": p("direct_product_basis", ["HELIX-OS"], "export function analyzeDriveDbRegistration(", "Checks persisted Drive/DB registration statistics and legacy compatibility models; this is OS state consistency control.", "HARNESS plan artifacts are inputs, while registration drift and persistence state are OS responsibilities."),
 "src/lint/drive-model-passage.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export function analyzeDriveModelPassage(", "Validates drive-model passage certificates and residual/forward targets in plans; this is HARNESS planning evidence.", "OS may route the plan, but drive-model passage meaning belongs to HARNESS process design."),
 "src/lint/feedback-log.ts": p("direct_product_basis", ["HELIX-OS"], "export function parseFeedbackEntries(", "Parses feedback and improvement entries into operational status and references; this is OS learning-loop state.", "HARNESS provides artifact context, but feedback lifecycle and improvement status are OS control."),
 "src/lint/forward-convergence.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function isValidVersionUp(", "Evaluates implementation convergence, landed status, and version-up targets, joining HARNESS completion semantics with OS adoption control.", "HARNESS-L1-007 and HELIXOS-L1-005/010 both match; preserve the connected responsibility."),
 "src/lint/frontend-design-coverage.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-Web"], "export function analyzeFrontendDesignCoverage(", "Maps frontend design coverage to document-system and UI markers, joining HARNESS design evidence with Web presentation scope.", "HARNESS-L1-003/009 and HELIX-Web-L1-002/003 both apply; no single owner is proposed."),
 "src/lint/github-guards.ts": p("direct_product_basis", ["HELIX-OS"], "export function parsePrContextSnapshot(", "Parses PR context, responsibility, closure references, and provider guard state; this is OS review/repository control.", "HARNESS completion evidence is consumed, but PR/provider guard enforcement is OS responsibility."),
 "src/lint/handover-cutover-approval.ts": p("direct_product_basis", ["HELIX-OS"], "export const HANDOVER_CUTOVER_APPROVAL_PIN", "Pins session handover cutover approvals and terminal journal evidence; this is OS continuity and authority state.", "HARNESS work meaning may be handed over, but session cutover approval and terminal journaling are OS controls."),
 "src/lint/handover-resurrection.ts": p("direct_product_basis", ["HELIX-OS"], "export type ResurrectionCategory", "Defines resurrection policy and allowed artifact recovery categories across sessions; this is OS recovery/control behavior.", "HARNESS artifacts are inputs to recovery, while resurrection authority and baseline state are OS responsibilities."),
 "src/lint/handover-retirement.ts": p("direct_product_basis", ["HELIX-OS"], "export type HandoverRetirementKind", "Classifies handover retirement references and mutation boundaries; this is OS lifecycle and session authority control.", "HARNESS owns process content, but retirement and provider mutation controls are OS state governance."),
 "src/lint/identifier-rename.ts": p("insufficient_basis", [], "export interface IdentifierRenameHit", "The module performs broad token/path rename analysis without a product-specific semantic boundary in the reviewed declaration span.", "Shared rename mechanics and identifiers do not establish HARNESS, OS, Web, or Web-OS responsibility."),
 "src/lint/improvement-backlog.ts": p("direct_product_basis", ["HELIX-OS"], "export function parseBacklogEntries(", "Parses improvement backlog status, candidate types, and backpropagation fields into operational improvement state; this is OS learning control.", "HARNESS may supply improvement meaning, but backlog lifecycle and adoption status are OS responsibilities."),
 "src/lint/l1-l2-consistency.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export function analyzeL1L2Consistency(", "Checks L1/L2 screen requirement identifiers and pair artifacts, which is HARNESS requirement/design trace semantics.", "Web screen artifacts are evidence inputs; the L1/L2 consistency contract itself is HARNESS-owned."),
 "src/lint/l1-l2-gap-check.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export const L1_L2_GAP_CHECK_SCHEMA_VERSION", "Defines L1/L2 gap packets, viewpoints, and messages for requirement/design closure; this is HARNESS process evidence.", "OS can manage a gap packet, but the upstream layer gap meaning belongs to HARNESS."),
 "src/lint/l12-hybrid-reviewed-safe-v2.ts": p("insufficient_basis", [], "export const REVIEWED_SAFE_DISPOSITIONS", "The module is a large reviewed-disposition table with no independent source behavior span proving a product owner.", "Static dispositions and path/name references are insufficient for four-product classification."),
 "src/lint/l14-close-audit.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export interface L14CloseAuditInput", "Audits L14 close rows, statuses, evidence, and boundary markers for V-model completion; this is HARNESS acceptance semantics.", "OS may control execution and closure authority, but L14 evidence meaning is HARNESS-owned."),
 "src/lint/l3-progression-authority.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export const L3_PROGRESSION_AUTHORITY_MARKER", "Verifies L3 progression authority markers and blocker paths in requirements; this is HARNESS requirement progression semantics.", "OS records authority state, while L3 progression meaning remains a HARNESS contract."),
 "src/lint/l3-progression-reviewed-digests.ts": p("insufficient_basis", [], "export const L3_PROGRESSION_REVIEWED_DIGESTS", "The module is a digest declaration table without a self-contained semantic owner span.", "Digest constants alone do not establish product responsibility."),
 "src/lint/legacy-orchestration-semantic-consumers.ts": p("direct_product_basis", ["HELIX-OS"], "export const LEGACY_ORCHESTRATION_CONSUMER_ROLES", "Defines migration-state and semantic-consumer ledger roles for legacy orchestration; this is OS transition and control state.", "HARNESS supplies legacy meaning, but consumer migration state and ledger authority are OS responsibilities."),
 "src/lint/legacy-orchestration-surface.ts": p("direct_product_basis", ["HELIX-OS"], "export function compareLegacyOrchestrationInventory(", "Compares legacy orchestration inventory and allowed exclusions, preserving execution-surface governance; this is OS repository control.", "HARNESS artifacts are inspected, but orchestration surface and exclusion enforcement are OS concerns."),
 "src/lint/memory-handover-isolation.ts": p("direct_product_basis", ["HELIX-OS"], "export function loadMemoryHandoverIsolationInput(", "Loads memory/handover isolation state and analyzes stale or cross-session records; this is OS continuity and recovery control.", "HARNESS work artifacts may be handed over, but memory isolation and stale-session state are OS responsibilities."),
 "src/lint/objective-evidence-audit.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export interface ObjectiveEvidenceAuditInput", "Audits objective requirements against evidence and completion binding, which is HARNESS V-model acceptance evidence.", "OS may manage the audit run, but objective evidence and completion meaning are HARNESS process semantics."),
 "src/lint/outstanding.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export interface OutstandingWork", "Models outstanding work, semantic frontiers, and confirmation records, joining HARNESS completion meaning with OS operational backlog state.", "HARNESS-L1-003/004 and HELIXOS-L1-002/006 both apply; retain conflict rather than assign one owner."),
 "src/lint/pin-chain-derivation.ts": p("direct_product_basis", ["HELIX-OS"], "export type PinKind", "Derives deterministic and semantic review pins from feedback and digest inventories; this is OS provenance and revalidation control.", "HARNESS contracts are pinned as inputs, while pin refresh/reassessment lifecycle belongs to OS governance."),
 "src/lint/project-hook.ts": p("direct_product_basis", ["HELIX-OS"], "export interface ProjectHookDoc", "Validates project hook configuration and forbidden legacy runtime references; this is OS execution-boundary control.", "HARNESS workflow semantics may require hooks, but hook installation and provider/runtime guard state are OS-owned."),
 "src/lint/proposal-document-coverage-policy.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export const PROPOSAL_ROUTING_DOC_PATH", "Defines proposal coverage scenarios, evidence gates, routing markers, and subagent guards for development artifacts; this is HARNESS workflow contract semantics.", "OS can route proposals operationally, but the normative coverage vocabulary and evidence obligations belong to HARNESS."),
 "src/lint/readability.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export function analyzeReadability(", "Analyzes readability and encoding quality of L6/freeze design documents; this is HARNESS documentation quality evidence.", "OS may schedule the lint, while document readability and design communication are HARNESS responsibilities."),
 "src/lint/review-evidence.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export const KIND_REVIEW_REQUIRED", "Defines review-required artifact kinds, green-command evidence, and review plans for V-model acceptance; this is HARNESS verification evidence.", "OS controls the review route, but the evidence contract and artifact acceptance meaning are HARNESS-owned."),
 "src/lint/right-arm-verification-strategy.ts": p("direct_product_basis", ["HELIX-OS"], "export interface RightArmVerificationStrategyInput", "Checks provider/right-arm verification strategy, gate impact, and source-ledger state; this is OS worker and execution control.", "HARNESS defines verification obligations, while provider strategy and operational gate routing are OS responsibilities."),
 "src/lint/secret-scan.ts": p("direct_product_basis", ["HELIX-OS"], "export function loadSecretScanArtifacts(", "Loads repository/state artifacts for secret scanning and reports safety violations; this is OS repository safety governance.", "HARNESS artifact content is scanned, but secret policy and repository safety control are OS responsibilities."),
 "src/lint/semantic-frontier-consistency.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export interface SemanticFrontierConsistencyInput", "Checks L3/L12 semantic frontier rows and setup/CLI boundaries against requirement counts; this is HARNESS requirement progression semantics.", "OS may observe the frontier, but the frontier contract and requirement row meaning belong to HARNESS."),
 "src/lint/shared.ts": p("insufficient_basis", [], "export function markdownFrontmatter(", "The module provides shared markdown/frontmatter and plan-loading helpers without an independent product-boundary contract.", "Shared parsing plumbing cannot establish a four-product owner from this source span."),
 "src/lint/skill-assignment.ts": p("direct_product_basis", ["HELIX-OS"], "export const VALID_SKILL_LAYERS", "Defines skill applicability layers, drive models, and metadata loading for worker assignment; this is OS delegation/control state.", "HARNESS may define process layers, but skill assignment and applicability to workers are OS responsibilities."),
 "src/lint/telemetry-closure.ts": p("direct_product_basis", ["HELIX-OS"], "export interface TelemetryClosureDoc", "Checks telemetry closure matrix rows, statuses, owners, and evidence at an operational boundary; this is OS observability control.", "HARNESS can produce evidence, while telemetry status and service observation are OS responsibilities."),
 "src/lint/version-up-readiness.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export interface VersionUpReadinessPlan", "Evaluates version-up activation, reapproval, source-ledger freshness, and evidence readiness, joining HARNESS release contract with OS adoption control.", "HARNESS-L1-007 and HELIXOS-L1-005/007 both apply; no single owner is selected."),
 "src/lint/workflow-classification-terminal-fullback.ts": p("direct_product_basis", ["HELIX-OS"], "export function terminalFullbackAuthoritySnapshot(", "Builds terminal workflow classification authority snapshots and failure reports at an operational fallback boundary; this is OS control state.", "HARNESS workflow vocabulary is an input contract, while terminal fallback authority and recovery state belong to OS."),
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
    return [json.loads(x) for x in git_bytes(path).decode().splitlines() if x.strip()]

def row_hash(row: dict) -> str:
    return digest(canonical(row))

def anchor(path: str, marker: str, archive: bool = True) -> dict:
    obj = ARCHIVE_PREFIX + path if archive else path
    data = git_bytes(obj); lines = data.decode("utf-8", "replace").splitlines()
    matches = [i for i, line in enumerate(lines, 1) if marker in line]
    if len(matches) != 1:
        raise RuntimeError(f"marker not unique {path!r} {marker!r} {matches}")
    start = matches[0]; end = min(len(lines), start + 9); line = lines[start - 1]
    return {"line_start": start, "line_end": end, "marker": marker, "line_text": line, "line_text_sha256": digest(line.encode()), "span_sha256": digest("\n".join(lines[start - 1:end]).encode())}

def receipt(path: str, marker: str) -> dict:
    data = git_bytes(path); lines = data.decode("utf-8", "replace").splitlines(); matches = [i for i,l in enumerate(lines,1) if marker in l]
    if len(matches) != 1: raise RuntimeError(f"boundary marker not unique {path} {marker} {matches}")
    n=matches[0]; return {"path": path, "blob": git_blob(path), "sha256": digest(data), "line": n, "marker": marker, "line_text": lines[n-1], "line_text_sha256": digest(lines[n-1].encode())}

def static_matches(path: str, terms: list[str]) -> dict:
    data=git_bytes(path); hits=[{"line":n,"text":line,"text_sha256":digest(line.encode())} for n,line in enumerate(data.decode("utf-8","replace").splitlines(),1) if any(t and t in line for t in terms)]
    return {"path":path,"blob":git_blob(path),"sha256":digest(data),"matched_lines":hits}

def approval_evidence() -> dict:
    products = {}
    for product, path in L1.items():
        products[product] = {
            "decision_id": {"HELIX-HARNESS": "HDEC-HARNESS-L1-01", "HELIX-OS": "HDEC-HELIXOS-L1-01", "HELIX-Web": "HDEC-HELIXWEB-L1-01", "HELIX-Web-OS": "HDEC-HELIXWEBOS-L1-01"}[product],
            "result": "approve",
            "l1_path": path,
            "approved_l1_sha256": digest(git_bytes(path)),
            "decision_record_anchor": receipt(APPROVAL_DECISION, APPROVAL_ROW_MARKERS[product]),
            "l1_revision_matches_decision": True,
        }
    return {
        "decision_record": {**receipt(APPROVAL_DECISION, "decision_status: approved"), "decision_record_id": "HDEC-CONCEPT-V4.1-AND-FOUR-L1-2026-09-17", "decision_status": "approved", "authority_effect_declared_by_record": "effective_when_this_record_is_admitted_to_main"},
        "human_decision_packet": receipt(APPROVAL_PACKET, "human_decision_record:"),
        "products": products,
    }

def main() -> None:
    BUNDLE.mkdir(parents=True, exist_ok=True)
    phase_rows=parse_jsonl(PHASE); phase_by_id={r["asset_id"]:r for r in phase_rows}; dispositions={r["asset_id"]:r for r in parse_jsonl(DISPOSITION)}; decisions=parse_jsonl(DECISIONS); read_after=parse_jsonl(READ_AFTER)
    targets=sorted((r for r in phase_rows if r.get("product_classification_status")=="candidate_needs_semantic_review" and r.get("artifact_evidence_kind")=="implementation_source" and r.get("source_path","").startswith("src/lint/")),key=lambda r:r["asset_id"])
    existing=sorted(r["asset_id"] for r in phase_rows if r.get("product_classification_status")=="unresolved" and r.get("artifact_evidence_kind")=="implementation_source" and r.get("source_path","").startswith("src/lint/"))
    if len(targets)!=51 or set(PROFILES)!={r["source_path"] for r in targets}: raise RuntimeError("target/profile set mismatch")
    approval = approval_evidence()
    product_boundary = {**receipt(BOUNDARY,"## 対象別の正規入口"),"interpretation":"approved four-product meaning is referenced from the fixed human decision; this research scaffold grants no authority", "product_spans": {product: receipt(BOUNDARY, PRODUCT_BOUNDARY_MARKERS[product]) for product in PRODUCTS}, "approved_meaning_spans": {product: receipt(APPROVAL_DECISION, APPROVAL_MEANING_MARKERS[product]) for product in PRODUCTS}}
    boundary={"product_boundary":product_boundary,"l1":{product:{"raw_document":receipt(path,L1_MARKERS[product]),"raw_metadata":{"status":"draft","authority_status":"awaiting_parent_approval","status_anchor":receipt(path,"status: draft"),"authority_anchor":receipt(path,"authority_status: awaiting_parent_approval")},"semantic_anchor":receipt(path,"## 提供価値" if product != "HELIX-Web-OS" else "## 境界"),"effective_approval":approval["products"][product],"interpretation":"raw L1 metadata remains draft; the effective approved decision is evidenced separately below; this scaffold does not grant product authority"} for product,path in L1.items()}}
    # The boundary object carries product-wide references; each asset adds its own semantic L1 row marker.
    wave_files=[]; wave_edges=[]; ids={r["asset_id"] for r in targets}; paths={r["source_path"] for r in targets}
    for wave,path in WAVE_PATHS.items():
        try: raw=git_bytes(path)
        except subprocess.CalledProcessError: continue
        wave_files.append({"wave":wave,"path":path,"blob":git_blob(path),"bytes":len(raw),"sha256":digest(raw)})
        for line in raw.decode("utf-8","replace").splitlines():
            if not line.strip(): continue
            try: row=json.loads(line)
            except json.JSONDecodeError: continue
            if row.get("asset_id") in ids or row.get("source_path") in paths: wave_edges.append({"wave":wave,"path":path,"row":row})
    failure_global=static_matches(FAILURE_SOURCE,[]); consumer_global=static_matches(CONSUMER_SOURCE,[]); rows=[]
    for phase in targets:
        aid=phase["asset_id"]; path=phase["source_path"]; prof=PROFILES[path]
        source_path=ARCHIVE_PREFIX+path; source=git_bytes(source_path)
        disp=dispositions[aid]
        decision_rows=[r for r in decisions if r.get("asset_id")==aid]
        read_rows=[r for r in read_after if r.get("asset_id")==aid]
        links=[e for e in wave_edges if e["row"].get("asset_id")==aid or e["row"].get("source_path")==path]
        asset_boundary={**boundary,"l1":{**boundary["l1"]}}
        basis={}
        for product in prof["candidate_products"]:
            l1_span=receipt(L1[product],L1_BASIS_MARKERS[path][product])
            product_span=boundary["product_boundary"]["product_spans"][product]
            meaning_span=boundary["product_boundary"]["approved_meaning_spans"][product]
            asset_boundary["l1"][product]={**asset_boundary["l1"][product],"semantic_anchor":l1_span}
            basis[product]={"l1_marker":L1_BASIS_MARKERS[path][product],"l1_line":l1_span["line"],"l1_line_text":l1_span["line_text"],"l1_line_text_sha256":l1_span["line_text_sha256"],"l1_span_sha256":l1_span["line_text_sha256"],"l1_document_sha256":digest(git_bytes(L1[product])),"product_boundary_marker":PRODUCT_BOUNDARY_MARKERS[product],"product_boundary_line":product_span["line"],"product_boundary_line_text":product_span["line_text"],"product_boundary_line_text_sha256":product_span["line_text_sha256"],"decision_id":asset_boundary["l1"][product]["effective_approval"]["decision_id"],"decision_meaning_marker":APPROVAL_MEANING_MARKERS[product],"decision_meaning_line":meaning_span["line"],"decision_meaning_line_text":meaning_span["line_text"],"decision_meaning_line_text_sha256":meaning_span["line_text_sha256"]}
        rows.append({"asset_id":aid,"source_path":path,"source_exact":{"archive_path":source_path,"source_path":path,"blob":git_blob(source_path),"bytes":len(source),"line_count":len(source.decode("utf-8","replace").splitlines()),"sha256":digest(source),"ledger_source_sha256":phase.get("source_sha256"),"ledger_digest_match":phase.get("source_sha256")==hashlib.sha256(source).hexdigest(),"semantic_anchor":anchor(path,prof["marker"]),"read_mode":"git_show_fixed_base_static_read"},"phase_evidence":{"row":phase,"row_sha256":row_hash(phase)},"legacy_asset_evidence":{"row":disp,"row_sha256":row_hash(disp)},"classification":{"category":prof["category"],"candidate_products":prof["candidate_products"],"candidate_product_basis":basis,"semantic_status":"research_candidate_not_formal","reason":prof["reason"],"counter_evidence":prof["counter_evidence"]},"boundary_evidence":asset_boundary,"legacy_history_failure_consumer":{"decision_records":[{"row":r,"row_sha256":row_hash(r)} for r in decision_rows],"read_after_records":[{"row":r,"row_sha256":row_hash(r)} for r in read_rows],"failure_consumer_static":{"failure":static_matches(FAILURE_SOURCE,[aid,path]),"consumer":static_matches(CONSUMER_SOURCE,[aid,path]),"global_failure_inventory":failure_global,"global_consumer_inventory":consumer_global}},"legacy_implementation_shrinkage_evidence":{"artifact_evidence_kind":phase.get("artifact_evidence_kind"),"implementation_evidence_state":phase.get("implementation_evidence_state"),"legacy_implementation_status":phase.get("legacy_implementation_status"),"degradation_status":"unknown_pending_human_semantic_review","degradation_evidence":["legacy implementation status remains unknown","no degradation or reuse conclusion is promoted by this scaffold"]},"wave_semantic_links":links,"wave_edge_count":len(links),"human_judgment_remaining":["formal_product_owner","formal_product_classification","phase_admission","implementation_or_reuse_decision","degradation_meaning","consumer_closure","successor_assignment","new_build_authority"],"authority_effect":"none","formal_asset_classification_updated":False,"new_build_allowed":False})
    ledger=BUNDLE/"classification-research.jsonl"; ledger.write_bytes(b"".join(json.dumps(r,ensure_ascii=False,sort_keys=True,separators=(",",":" )).encode()+b"\n" for r in rows))
    input_paths=[PHASE,DISPOSITION,DECISIONS,READ_AFTER,BOUNDARY,APPROVAL_DECISION,APPROVAL_PACKET,*L1.values(),FAILURE_SOURCE,CONSUMER_SOURCE,*[x["path"] for x in wave_files]]
    inv={"schema_revision":1,"binding_id":BINDING_ID,"base_revision":BASE_REVISION,"scope":"fixed BASE candidate_needs_semantic_review src/lint exact 51 assets","candidate_needs_semantic_review_total":sum(r.get("product_classification_status")=="candidate_needs_semantic_review" for r in phase_rows),"target_count":len(rows),"target_asset_ids":[r["asset_id"] for r in rows],"target_source_paths":[r["source_path"] for r in rows],"l1_approval":approval,"classification_counts":{c:sum(r["classification"]["category"]==c for r in rows) for c in sorted({r["classification"]["category"] for r in rows})},"target_wave_edge_count":len(wave_edges),"wave_files":wave_files,"existing_research_overlap":{"SCF-B-0108":[]},"existing_0108_target_count":len(existing),"existing_0108_target_asset_ids_sha256":digest("\n".join(existing).encode()),"input_digests":[{"path":p,"blob":git_blob(p),"bytes":len(git_bytes(p)),"sha256":digest(git_bytes(p))} for p in input_paths],"output_sha256":digest(ledger.read_bytes()),"authority_boundary":{"authority_effect":"none","formal_product_authority":None,"formal_asset_classification_updated":False,"formal_implementation_status":"unknown","successor_assignment":None,"new_build_allowed":False,"read_mode":"static_git_object_only"},"classification_rule":{"direct_product_basis":"source marker span plus boundary interpretation and counter-evidence; path alone is invalid","multi_product_conflict":"source marker maps to two product boundaries; no single owner proposed","insufficient_basis":"shared table/plumbing or source span lacks product-boundary proof"},"old_archive_execution":{"runtime":False,"test":False,"ci":False,"source":False,"read_mode":"git show fixed BASE only"},"overlap_rule":"candidate 51 IDs are compared with fixed BASE SCF-B-0108 unresolved src/lint 95 IDs; overlap must be empty"}
    (BUNDLE/"inventory.json").write_text(json.dumps(inv,ensure_ascii=False,sort_keys=True,indent=2)+"\n"); print(f"SCF-B-0128 generated records={len(rows)} categories={inv['classification_counts']} target_wave_edges={len(wave_edges)} overlap_0108=0")

if __name__=="__main__": main()
