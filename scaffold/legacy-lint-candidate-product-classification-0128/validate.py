#!/usr/bin/env python3
"""Independent validator for SCF-B-0128.

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
BUNDLE = ROOT / "scaffold/legacy-lint-candidate-product-classification-0128"
LEDGER = BUNDLE / "classification-research.jsonl"
INVENTORY = BUNDLE / "inventory.json"
BASE_REVISION = "cb5a45fea289d61b67cba100fd2406813021ef48"
BINDING_ID = "SCF-B-0128"
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
PRODUCTS = tuple(L1)
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
OVERLAP = {"SCF-B-0108": []}
EXPECTED_PROFILES = {
  "src/lint/action-binding-approval-readiness.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-OS"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS-L1-004/006 and HELIXOS-L1-001/004 both apply; a single owner is not proposed.",
    "marker": "export interface ActionBindingApprovalPlan",
    "reason": "Defines action-binding approval packets and readiness checks, joining HARNESS acceptance meaning with OS approval and state control."
  },
  "src/lint/agent-model-ssot.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS process artifacts may consume model metadata, but provider/model authority is OS responsibility.",
    "marker": "export function analyzeAgentModelSsot(",
    "reason": "Checks canonical model IDs and provider drift for worker configuration; this is OS operational policy and state control."
  },
  "src/lint/asset-drift.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS defines artifact meaning, while drift and legacy-surface enforcement remain OS controls.",
    "marker": "export interface AssetDriftInput",
    "reason": "Detects asset, legacy runtime, and command drift across operational surfaces; this is OS repository governance."
  },
  "src/lint/backfill-pairing.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "OS may record the findings, but requirement-to-plan pairing meaning is HARNESS-owned process evidence.",
    "marker": "export function normalizeTerm(",
    "reason": "Parses plan requirements and bidirectional backfill obligations for V-model artifacts; this is HARNESS trace semantics."
  },
  "src/lint/branch-kind.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-OS"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS plan branch meaning and HELIXOS branch/review control both match; no single owner is selected.",
    "marker": "export function branchSnapshotFromPrContext(",
    "reason": "Classifies branch and plan context while checking PR/provider state, joining HARNESS plan semantics with OS repository control."
  },
  "src/lint/canonical-reuse-authority.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-OS"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS-L1-005 and HELIXOS-L1-001/008 both provide boundary evidence; retain the conflict.",
    "marker": "export const assertCanonicalReuseAllowed",
    "reason": "Gates canonical artifact reuse against authority and blocked paths, combining HARNESS artifact contract with OS authority enforcement."
  },
  "src/lint/canonical-reuse-consumer-baseline.ts": {
    "candidate_products": [],
    "category": "insufficient_basis",
    "counter_evidence": "A data constant and path alone cannot distinguish HARNESS artifact consumers from OS control consumers.",
    "marker": "export const CANONICAL_REUSE_CONSUMER_BASELINE",
    "reason": "The module is a static consumer-baseline table without an independent product-boundary behavior span; it is retained for human semantic review."
  },
  "src/lint/change-impact.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "OS controls repository execution around the plan, but change category and impact meaning are HARNESS process evidence.",
    "marker": "export function changeSetIntegrityMessages(",
    "reason": "Classifies source/design/test change sets and checks plan integrity for V-model impact; this is HARNESS change-trace semantics."
  },
  "src/lint/coding-rules.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "OS may enforce repository checks, while module design rules and workflow meaning remain HARNESS-facing.",
    "marker": "export const SOURCE_MODULE_POLICY",
    "reason": "Declares source module direction and coding workflow policy for the development artifact; this is HARNESS engineering contract semantics."
  },
  "src/lint/completion-decision-packet.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "OS routes or records decisions, but completion packet meaning is the HARNESS contract.",
    "marker": "export type CompletionDecisionPacketViolationReason",
    "reason": "Validates completion decision packets, review bundles, and evidence freshness for V-model completion; this is HARNESS acceptance evidence."
  },
  "src/lint/cutover-readiness.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS supplies process completion conditions, while cutover authority and operational readiness belong to OS.",
    "marker": "export interface CutoverReadinessPlan",
    "reason": "Checks cutover records, outstanding state, and source-ledger readiness at an operational transition boundary; this is OS control."
  },
  "src/lint/descent-obligation.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "OS can manage the work queue, but layer descent and requirement trace meaning are HARNESS responsibilities.",
    "marker": "const DOC_FR_TRACE_RE",
    "reason": "Tracks FR and implementation-role obligations through V-model layers and detects descent gaps; this is HARNESS trace contract logic."
  },
  "src/lint/design-language.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "Web presentation may consume design outputs, but the design contract and baseline are HARNESS evidence.",
    "marker": "export const DESIGN_LANGUAGE_BASELINE_FINGERPRINT",
    "reason": "Defines design-language baselines and violation analysis for project design documents; this is HARNESS design quality semantics."
  },
  "src/lint/design-reality-binding.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-OS"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS-L1-003/004 and HELIXOS-L1-006/008 both apply; no single owner is proposed.",
    "marker": "export function classifyAddDesignRealityTargets(",
    "reason": "Binds design targets to implementation and failure-reachability evidence, joining HARNESS design reality with OS evidence/control state."
  },
  "src/lint/digest-inventory.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS uses digests as artifact evidence, but repository-wide inventory and drift enforcement are OS controls.",
    "marker": "export function scanDigestInventory(",
    "reason": "Scans canonical digest variants and exclusions across repository files; this is OS provenance and drift control."
  },
  "src/lint/document-agent-metadata.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "OS can store the registry, but document declaration and design metadata meaning are HARNESS process semantics.",
    "marker": "export function buildDeclarationRegistry(",
    "reason": "Builds document-agent declaration metadata and detects metadata/cycle findings, supporting HARNESS document traceability."
  },
  "src/lint/drive-db-registration.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS plan artifacts are inputs, while registration drift and persistence state are OS responsibilities.",
    "marker": "export function analyzeDriveDbRegistration(",
    "reason": "Checks persisted Drive/DB registration statistics and legacy compatibility models; this is OS state consistency control."
  },
  "src/lint/drive-model-passage.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "OS may route the plan, but drive-model passage meaning belongs to HARNESS process design.",
    "marker": "export function analyzeDriveModelPassage(",
    "reason": "Validates drive-model passage certificates and residual/forward targets in plans; this is HARNESS planning evidence."
  },
  "src/lint/feedback-log.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS provides artifact context, but feedback lifecycle and improvement status are OS control.",
    "marker": "export function parseFeedbackEntries(",
    "reason": "Parses feedback and improvement entries into operational status and references; this is OS learning-loop state."
  },
  "src/lint/forward-convergence.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-OS"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS-L1-007 and HELIXOS-L1-005/010 both match; preserve the connected responsibility.",
    "marker": "export function isValidVersionUp(",
    "reason": "Evaluates implementation convergence, landed status, and version-up targets, joining HARNESS completion semantics with OS adoption control."
  },
  "src/lint/frontend-design-coverage.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-Web"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS-L1-003/009 and HELIX-Web-L1-002/003 both apply; no single owner is proposed.",
    "marker": "export function analyzeFrontendDesignCoverage(",
    "reason": "Maps frontend design coverage to document-system and UI markers, joining HARNESS design evidence with Web presentation scope."
  },
  "src/lint/github-guards.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS completion evidence is consumed, but PR/provider guard enforcement is OS responsibility.",
    "marker": "export function parsePrContextSnapshot(",
    "reason": "Parses PR context, responsibility, closure references, and provider guard state; this is OS review/repository control."
  },
  "src/lint/handover-cutover-approval.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS work meaning may be handed over, but session cutover approval and terminal journaling are OS controls.",
    "marker": "export const HANDOVER_CUTOVER_APPROVAL_PIN",
    "reason": "Pins session handover cutover approvals and terminal journal evidence; this is OS continuity and authority state."
  },
  "src/lint/handover-resurrection.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS artifacts are inputs to recovery, while resurrection authority and baseline state are OS responsibilities.",
    "marker": "export type ResurrectionCategory",
    "reason": "Defines resurrection policy and allowed artifact recovery categories across sessions; this is OS recovery/control behavior."
  },
  "src/lint/handover-retirement.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS owns process content, but retirement and provider mutation controls are OS state governance.",
    "marker": "export type HandoverRetirementKind",
    "reason": "Classifies handover retirement references and mutation boundaries; this is OS lifecycle and session authority control."
  },
  "src/lint/identifier-rename.ts": {
    "candidate_products": [],
    "category": "insufficient_basis",
    "counter_evidence": "Shared rename mechanics and identifiers do not establish HARNESS, OS, Web, or Web-OS responsibility.",
    "marker": "export interface IdentifierRenameHit",
    "reason": "The module performs broad token/path rename analysis without a product-specific semantic boundary in the reviewed declaration span."
  },
  "src/lint/improvement-backlog.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS may supply improvement meaning, but backlog lifecycle and adoption status are OS responsibilities.",
    "marker": "export function parseBacklogEntries(",
    "reason": "Parses improvement backlog status, candidate types, and backpropagation fields into operational improvement state; this is OS learning control."
  },
  "src/lint/l1-l2-consistency.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "Web screen artifacts are evidence inputs; the L1/L2 consistency contract itself is HARNESS-owned.",
    "marker": "export function analyzeL1L2Consistency(",
    "reason": "Checks L1/L2 screen requirement identifiers and pair artifacts, which is HARNESS requirement/design trace semantics."
  },
  "src/lint/l1-l2-gap-check.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "OS can manage a gap packet, but the upstream layer gap meaning belongs to HARNESS.",
    "marker": "export const L1_L2_GAP_CHECK_SCHEMA_VERSION",
    "reason": "Defines L1/L2 gap packets, viewpoints, and messages for requirement/design closure; this is HARNESS process evidence."
  },
  "src/lint/l12-hybrid-reviewed-safe-v2.ts": {
    "candidate_products": [],
    "category": "insufficient_basis",
    "counter_evidence": "Static dispositions and path/name references are insufficient for four-product classification.",
    "marker": "export const REVIEWED_SAFE_DISPOSITIONS",
    "reason": "The module is a large reviewed-disposition table with no independent source behavior span proving a product owner."
  },
  "src/lint/l14-close-audit.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "OS may control execution and closure authority, but L14 evidence meaning is HARNESS-owned.",
    "marker": "export interface L14CloseAuditInput",
    "reason": "Audits L14 close rows, statuses, evidence, and boundary markers for V-model completion; this is HARNESS acceptance semantics."
  },
  "src/lint/l3-progression-authority.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "OS records authority state, while L3 progression meaning remains a HARNESS contract.",
    "marker": "export const L3_PROGRESSION_AUTHORITY_MARKER",
    "reason": "Verifies L3 progression authority markers and blocker paths in requirements; this is HARNESS requirement progression semantics."
  },
  "src/lint/l3-progression-reviewed-digests.ts": {
    "candidate_products": [],
    "category": "insufficient_basis",
    "counter_evidence": "Digest constants alone do not establish product responsibility.",
    "marker": "export const L3_PROGRESSION_REVIEWED_DIGESTS",
    "reason": "The module is a digest declaration table without a self-contained semantic owner span."
  },
  "src/lint/legacy-orchestration-semantic-consumers.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS supplies legacy meaning, but consumer migration state and ledger authority are OS responsibilities.",
    "marker": "export const LEGACY_ORCHESTRATION_CONSUMER_ROLES",
    "reason": "Defines migration-state and semantic-consumer ledger roles for legacy orchestration; this is OS transition and control state."
  },
  "src/lint/legacy-orchestration-surface.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS artifacts are inspected, but orchestration surface and exclusion enforcement are OS concerns.",
    "marker": "export function compareLegacyOrchestrationInventory(",
    "reason": "Compares legacy orchestration inventory and allowed exclusions, preserving execution-surface governance; this is OS repository control."
  },
  "src/lint/memory-handover-isolation.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS work artifacts may be handed over, but memory isolation and stale-session state are OS responsibilities.",
    "marker": "export function loadMemoryHandoverIsolationInput(",
    "reason": "Loads memory/handover isolation state and analyzes stale or cross-session records; this is OS continuity and recovery control."
  },
  "src/lint/objective-evidence-audit.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "OS may manage the audit run, but objective evidence and completion meaning are HARNESS process semantics.",
    "marker": "export interface ObjectiveEvidenceAuditInput",
    "reason": "Audits objective requirements against evidence and completion binding, which is HARNESS V-model acceptance evidence."
  },
  "src/lint/outstanding.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-OS"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS-L1-003/004 and HELIXOS-L1-002/006 both apply; retain conflict rather than assign one owner.",
    "marker": "export interface OutstandingWork",
    "reason": "Models outstanding work, semantic frontiers, and confirmation records, joining HARNESS completion meaning with OS operational backlog state."
  },
  "src/lint/pin-chain-derivation.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS contracts are pinned as inputs, while pin refresh/reassessment lifecycle belongs to OS governance.",
    "marker": "export type PinKind",
    "reason": "Derives deterministic and semantic review pins from feedback and digest inventories; this is OS provenance and revalidation control."
  },
  "src/lint/project-hook.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS workflow semantics may require hooks, but hook installation and provider/runtime guard state are OS-owned.",
    "marker": "export interface ProjectHookDoc",
    "reason": "Validates project hook configuration and forbidden legacy runtime references; this is OS execution-boundary control."
  },
  "src/lint/proposal-document-coverage-policy.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "OS can route proposals operationally, but the normative coverage vocabulary and evidence obligations belong to HARNESS.",
    "marker": "export const PROPOSAL_ROUTING_DOC_PATH",
    "reason": "Defines proposal coverage scenarios, evidence gates, routing markers, and subagent guards for development artifacts; this is HARNESS workflow contract semantics."
  },
  "src/lint/readability.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "OS may schedule the lint, while document readability and design communication are HARNESS responsibilities.",
    "marker": "export function analyzeReadability(",
    "reason": "Analyzes readability and encoding quality of L6/freeze design documents; this is HARNESS documentation quality evidence."
  },
  "src/lint/review-evidence.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "OS controls the review route, but the evidence contract and artifact acceptance meaning are HARNESS-owned.",
    "marker": "export const KIND_REVIEW_REQUIRED",
    "reason": "Defines review-required artifact kinds, green-command evidence, and review plans for V-model acceptance; this is HARNESS verification evidence."
  },
  "src/lint/right-arm-verification-strategy.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS defines verification obligations, while provider strategy and operational gate routing are OS responsibilities.",
    "marker": "export interface RightArmVerificationStrategyInput",
    "reason": "Checks provider/right-arm verification strategy, gate impact, and source-ledger state; this is OS worker and execution control."
  },
  "src/lint/secret-scan.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS artifact content is scanned, but secret policy and repository safety control are OS responsibilities.",
    "marker": "export function loadSecretScanArtifacts(",
    "reason": "Loads repository/state artifacts for secret scanning and reports safety violations; this is OS repository safety governance."
  },
  "src/lint/semantic-frontier-consistency.ts": {
    "candidate_products": [
      "HELIX-HARNESS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "OS may observe the frontier, but the frontier contract and requirement row meaning belong to HARNESS.",
    "marker": "export interface SemanticFrontierConsistencyInput",
    "reason": "Checks L3/L12 semantic frontier rows and setup/CLI boundaries against requirement counts; this is HARNESS requirement progression semantics."
  },
  "src/lint/shared.ts": {
    "candidate_products": [],
    "category": "insufficient_basis",
    "counter_evidence": "Shared parsing plumbing cannot establish a four-product owner from this source span.",
    "marker": "export function markdownFrontmatter(",
    "reason": "The module provides shared markdown/frontmatter and plan-loading helpers without an independent product-boundary contract."
  },
  "src/lint/skill-assignment.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS may define process layers, but skill assignment and applicability to workers are OS responsibilities.",
    "marker": "export const VALID_SKILL_LAYERS",
    "reason": "Defines skill applicability layers, drive models, and metadata loading for worker assignment; this is OS delegation/control state."
  },
  "src/lint/telemetry-closure.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS can produce evidence, while telemetry status and service observation are OS responsibilities.",
    "marker": "export interface TelemetryClosureDoc",
    "reason": "Checks telemetry closure matrix rows, statuses, owners, and evidence at an operational boundary; this is OS observability control."
  },
  "src/lint/version-up-readiness.ts": {
    "candidate_products": [
      "HELIX-HARNESS",
      "HELIX-OS"
    ],
    "category": "multi_product_conflict",
    "counter_evidence": "HARNESS-L1-007 and HELIXOS-L1-005/007 both apply; no single owner is selected.",
    "marker": "export interface VersionUpReadinessPlan",
    "reason": "Evaluates version-up activation, reapproval, source-ledger freshness, and evidence readiness, joining HARNESS release contract with OS adoption control."
  },
  "src/lint/workflow-classification-terminal-fullback.ts": {
    "candidate_products": [
      "HELIX-OS"
    ],
    "category": "direct_product_basis",
    "counter_evidence": "HARNESS workflow vocabulary is an input contract, while terminal fallback authority and recovery state belong to OS.",
    "marker": "export function terminalFullbackAuthoritySnapshot(",
    "reason": "Builds terminal workflow classification authority snapshots and failure reports at an operational fallback boundary; this is OS control state."
  }
}
EXPECTED_RECORD_KEYS = {"asset_id", "source_path", "source_exact", "phase_evidence", "legacy_asset_evidence", "classification", "boundary_evidence", "legacy_history_failure_consumer", "legacy_implementation_shrinkage_evidence", "wave_semantic_links", "wave_edge_count", "human_judgment_remaining", "authority_effect", "formal_asset_classification_updated", "new_build_allowed"}
EXPECTED_HUMAN_JUDGMENT = ["formal_product_owner", "formal_product_classification", "phase_admission", "implementation_or_reuse_decision", "degradation_meaning", "consumer_closure", "successor_assignment", "new_build_authority"]
EXPECTED_INVENTORY_KEYS = {"schema_revision", "binding_id", "base_revision", "scope", "candidate_needs_semantic_review_total", "target_count", "target_asset_ids", "target_source_paths", "l1_approval", "classification_counts", "target_wave_edge_count", "wave_files", "existing_research_overlap", "existing_0108_target_count", "existing_0108_target_asset_ids_sha256", "input_digests", "output_sha256", "authority_boundary", "classification_rule", "old_archive_execution", "overlap_rule"}
EXPECTED_OVERLAP_RULE = "candidate 51 IDs are compared with fixed BASE SCF-B-0108 unresolved src/lint 95 IDs; overlap must be empty"


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


def approval_evidence() -> dict:
    products = {}
    ids = {"HELIX-HARNESS": "HDEC-HARNESS-L1-01", "HELIX-OS": "HDEC-HELIXOS-L1-01", "HELIX-Web": "HDEC-HELIXWEB-L1-01", "HELIX-Web-OS": "HDEC-HELIXWEBOS-L1-01"}
    for product, path in L1.items():
        products[product] = {"decision_id": ids[product], "result": "approve", "l1_path": path, "approved_l1_sha256": digest(git_bytes(path)), "decision_record_anchor": anchor(APPROVAL_DECISION, APPROVAL_ROW_MARKERS[product], False), "l1_revision_matches_decision": True}
    return {"decision_record": {**anchor(APPROVAL_DECISION, "decision_status: approved", False), "decision_record_id": "HDEC-CONCEPT-V4.1-AND-FOUR-L1-2026-09-17", "decision_status": "approved", "authority_effect_declared_by_record": "effective_when_this_record_is_admitted_to_main"}, "human_decision_packet": anchor(APPROVAL_PACKET, "human_decision_record:", False), "products": products}

def boundary_evidence() -> dict:
    data = anchor(BOUNDARY, "## 対象別の正規入口", False)
    approval = approval_evidence()
    return {"product_boundary": {**data, "interpretation": "approved four-product meaning is referenced from the fixed human decision; this research scaffold grants no authority", "product_spans": {product: anchor(BOUNDARY, PRODUCT_BOUNDARY_MARKERS[product], False) for product in PRODUCTS}, "approved_meaning_spans": {product: anchor(APPROVAL_DECISION, APPROVAL_MEANING_MARKERS[product], False) for product in PRODUCTS}}, "l1": {product: {"raw_document": anchor(path, L1_MARKERS[product], False), "raw_metadata": {"status": "draft", "authority_status": "awaiting_parent_approval", "status_anchor": anchor(path, "status: draft", False), "authority_anchor": anchor(path, "authority_status: awaiting_parent_approval", False)}, "semantic_anchor": anchor(path, L1_MARKERS[product], False), "effective_approval": approval["products"][product], "interpretation": "raw L1 metadata remains draft; the effective approved decision is evidenced separately below; this scaffold does not grant product authority"} for product, path in L1.items()}}


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
    paths = [PHASE, DISPOSITION, DECISIONS, READ_AFTER, BOUNDARY, APPROVAL_DECISION, APPROVAL_PACKET, *L1.values(), FAILURE_SOURCE, CONSUMER_SOURCE, *[f["path"] for f in wave_files]]
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
    expected_phase = {r["asset_id"]: r for r in phase_rows if r.get("product_classification_status") == "candidate_needs_semantic_review" and r.get("source_path", "").startswith("src/lint/")}
    expected_ids = sorted(expected_phase)
    if len(expected_ids) != 51 or len(rows) != 51 or [r.get("asset_id") for r in rows] != expected_ids or len({r.get("asset_id") for r in rows}) != len(rows):
        fail("E_TARGET_SET", {"expected": expected_ids, "actual": [r.get("asset_id") for r in rows]})
    if set(EXPECTED_PROFILES) != {r["source_path"] for r in expected_phase.values()}:
        fail("E_PROFILE_SET", sorted(set(EXPECTED_PROFILES) ^ {r["source_path"] for r in expected_phase.values()}))
    existing_ids = sorted(r["asset_id"] for r in phase_rows if r.get("product_classification_status") == "unresolved" and r.get("artifact_evidence_kind") == "implementation_source" and r.get("source_path", "").startswith("src/lint/"))
    if len(existing_ids) != 95 or set(expected_ids) & set(existing_ids):
        fail("E_OVERLAP", {"existing_0108": len(existing_ids), "overlap": sorted(set(expected_ids) & set(existing_ids))})
    disp = {r["asset_id"]: r for r in disposition_rows}
    expected_boundary_base = boundary_evidence()
    expected_approval = approval_evidence()
    if inv.get("l1_approval") != expected_approval:
        fail("E_L1_APPROVAL", "inventory approval evidence")
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
        expected_boundary = json.loads(json.dumps(expected_boundary_base))
        basis = {}
        for product in prof["candidate_products"]:
            l1_span = anchor(L1[product], L1_BASIS_MARKERS[path][product], False)
            expected_boundary["l1"][product]["semantic_anchor"] = l1_span
            product_span = expected_boundary["product_boundary"]["product_spans"][product]
            meaning_span = expected_boundary["product_boundary"]["approved_meaning_spans"][product]
            basis[product] = {"l1_marker": L1_BASIS_MARKERS[path][product], "l1_line": l1_span["line"], "l1_line_text": l1_span["line_text"], "l1_line_text_sha256": l1_span["line_text_sha256"], "l1_span_sha256": l1_span["line_text_sha256"], "l1_document_sha256": digest(git_bytes(L1[product])), "product_boundary_marker": PRODUCT_BOUNDARY_MARKERS[product], "product_boundary_line": product_span["line"], "product_boundary_line_text": product_span["line_text"], "product_boundary_line_text_sha256": product_span["line_text_sha256"], "decision_id": expected_boundary["l1"][product]["effective_approval"]["decision_id"], "decision_meaning_marker": APPROVAL_MEANING_MARKERS[product], "decision_meaning_line": meaning_span["line"], "decision_meaning_line_text": meaning_span["line_text"], "decision_meaning_line_text_sha256": meaning_span["line_text_sha256"]}
        expected_class = {"category": prof["category"], "candidate_products": prof["candidate_products"], "candidate_product_basis": basis, "semantic_status": "research_candidate_not_formal", "reason": prof["reason"], "counter_evidence": prof["counter_evidence"]}
        if row.get("classification") != expected_class:
            fail("E_CLASSIFICATION", aid)
        for product in prof["candidate_products"]:
            if row.get("boundary_evidence", {}).get("l1", {}).get(product, {}).get("effective_approval") != expected_approval["products"][product]:
                fail("E_L1_APPROVAL", aid)
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
    if inv.get("binding_id") != BINDING_ID or inv.get("scope") != "fixed BASE candidate_needs_semantic_review src/lint exact 51 assets" or inv.get("candidate_needs_semantic_review_total") != candidate_status_total or candidate_status_total != 2228 or inv.get("target_count") != 51 or inv.get("target_asset_ids") != expected_ids or inv.get("target_source_paths") != expected_paths_in_record_order or inv.get("existing_research_overlap") != OVERLAP or inv.get("existing_0108_target_count") != 95 or inv.get("existing_0108_target_asset_ids_sha256") != digest("\n".join(existing_ids).encode()):
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
    expected_rules = {"direct_product_basis": "source marker span plus boundary interpretation and counter-evidence; path alone is invalid", "multi_product_conflict": "source marker maps to two product boundaries; no single owner proposed", "insufficient_basis": "shared table/plumbing or source span lacks product-boundary proof"}
    if inv.get("classification_rule") != expected_rules or inv.get("old_archive_execution") != {"runtime": False, "test": False, "ci": False, "source": False, "read_mode": "git show fixed BASE only"}:
        fail("E_INVENTORY_DECLARATION", "classification or execution boundary")
    if inv.get("overlap_rule") != EXPECTED_OVERLAP_RULE:
        fail("E_INVENTORY_DECLARATION", "overlap rule")
    if inv.get("output_sha256") != digest(LEDGER.read_bytes()):
        fail("E_OUTPUT_DIGEST", "classification ledger")
    print(f"SCF-B-0128 validate: PASS records={len(rows)} categories={counts} target_wave_edges={len(wave_edges)} overlap_0108={len(set(expected_ids) & set(existing_ids))}")


if __name__ == "__main__":
    try:
        check()
    except AssertionError as exc:
        print(exc, file=sys.stderr)
        raise SystemExit(1)
