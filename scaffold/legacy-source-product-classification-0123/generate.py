#!/usr/bin/env python3
"""Materialize SCF-B-0123 static research for unresolved source assets in five legacy directories."""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-source-product-classification-0123"
BASE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
BINDING_ID = "SCF-B-0123"
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
SOURCE_PREFIXES = ("src/workflow/", "src/setup/", "src/cli/", "src/requirements/", "src/shared/")

# Every entry is a source-semantic review record.  The marker is located in
# the fixed BASE blob, so the stored line/digest is not inferred from a path
# name.  Classification remains a candidate research result, never authority.
def spec(category: str, products: list[str], marker: str | None, length: int, reason: str, legacy: str = "") -> dict:
    return {"category": category, "products": products, "marker": marker, "length": length, "reason": reason, "legacy": legacy}

DIRECT_H = {
    'workflow': spec('direct_product_basis', ['HELIX-HARNESS'], 'export function registerWorkflowCommands', 45, 'The CLI declares requirements-owned typed workflow surfaces and builds a bounded guide from workflow identity; the span is a HARNESS process and artifact contract.', 'The old command surface remains unresolved static process evidence; guide generation, consumer closure, and current implementation were not executed or promoted.'),
    'measurement-evidence-evaluator': spec('direct_product_basis', ['HELIX-HARNESS'], 'export function evaluateMeasurementEvidence', 90, 'The evaluator validates measurement observations, baseline binding, freshness, representativeness, thresholds, and hard limits as explicit quality evidence; these are HARNESS verification and completion contract semantics.', 'The old evaluator is retained as static NFR/measurement evidence; no current measurement run, consumer closure, or formal quality authority is asserted.'),
    'requirement-authority': spec('direct_product_basis', ['HELIX-HARNESS'], 'export function promoteRequirementIrToCanonical', 45, 'The source models canonical requirement IR records, root and semantic digests, and the requirements authority shape; this is the HARNESS requirement artifact boundary.', 'The canonical promotion helper is historical source evidence only; no promotion, current authority, or implementation completion was performed.'),
    'requirement-definition-trace-census': spec('direct_product_basis', ['HELIX-HARNESS'], 'export function compileRequirementDefinitionTraceCensus', 95, 'The census compiles requirement, system contract, and acceptance-case trace relations and reports definition gaps; this is HARNESS V-model trace evidence.', 'The trace census remains an unexecuted historical analyzer; missing links and consumer closure require human review and no formal trace authority is added.'),
    'requirement-generated-view-generator': spec('direct_product_basis', ['HELIX-HARNESS'], 'const requirementIr = loadCanonicalRequirementIrFromShards', 20, 'The source renders the canonical requirement IR into the generated requirement-definition view and records source counts and root digest; this is a HARNESS artifact projection.', 'The generator is old static projection evidence; no generated view was written or accepted as current authority.'),
    'requirement-generated-view': spec('direct_product_basis', ['HELIX-HARNESS'], 'export function renderRequirementGeneratedView', 100, 'The source renders and parses the requirement IR view while preserving the legacy Markdown authority boundary; the reviewed behavior is a HARNESS requirement presentation contract.', 'The source explicitly retains legacy Markdown until cutover; rendering and parsing were not executed and no authority cutover is claimed.'),
    'requirement-ir-shadow-generator': spec('direct_product_basis', ['HELIX-HARNESS'], 'const shadow = compileRequirementIrShadow', 50, 'The migration-only command compiles requirement source documents into a shadow IR with stable shard digests; this is HARNESS requirement migration evidence.', 'The command is marked migration-only and was not run; the shadow remains a static candidate and cannot replace requirement authority.'),
    'requirement-ir-shadow': spec('direct_product_basis', ['HELIX-HARNESS'], 'export function compileRequirementIrShadow', 80, 'The source defines requirement, system-contract, acceptance, and system-test shadow records plus linkage and digest validation; this is HARNESS requirement artifact structure.', 'The shadow compiler and linkage rules are historical static evidence; no shadow was promoted, executed, or treated as implementation closure.'),
    'derived-requirement-trace': spec('direct_product_basis', ['HELIX-HARNESS'], 'export const DERIVED_REQUIREMENT_TRACE_VERSION', 110, 'The source compiles workflow atoms into requirement, system-contract, acceptance, and V-model pair trace artifacts; this is HARNESS requirement and verification trace structure.', 'The trace compiler preserves unresolved findings and digest links as historical evidence; no derived requirement or acceptance artifact was generated or accepted.'),
    'workflow-guide': spec('direct_product_basis', ['HELIX-HARNESS'], 'export function buildWorkflowGuide', 120, 'The guide builder resolves requirements-owned workflow registry identity, gates, stale conditions, and bounded work phases; this is HARNESS workflow process and artifact guidance.', 'The guide source preserves stale and authority-digest guards; no guide was built, routed, or accepted as a current process authority.'),
    'workflow-interview-unresolved': spec('direct_product_basis', ['HELIX-HARNESS'], 'export function evaluateWorkflowInterview', 100, 'The interview evaluator records unresolved workflow ambiguity, contradiction, missing authority, and missing branch signals; this is HARNESS requirements elicitation and clarification evidence.', 'The evaluator keeps unresolved questions pending human decisions; no interview result, workflow authority, or implementation was produced.'),
}
DIRECT_O = {
    'claude-unanswered-review-detector': spec('direct_product_basis', ['HELIX-OS'], 'export function runClaudeUnansweredReviewDetectorCommand', 55, 'The CLI command reads review state, detects unanswered Claude review subjects, and emits a report through runtime review state; this is HELIX-OS review and state control.', 'The old review detector is static evidence of a fail-closed review-state workflow; no provider, filesystem write, or review admission was executed.'),
    'rename': spec('direct_product_basis', ['HELIX-OS'], 'export function registerRenameCommands', 100, 'The CLI exposes identifier rename audit, rehearsal, backup, smoke, monitoring, approval, and cutover planning over HELIX state paths; this is HELIX-OS operational control.', 'The source provides no-write rehearsal and gated cutover surfaces; no rename, state mutation, or authority transition was performed.'),
    'review-fallback': spec('direct_product_basis', ['HELIX-OS'], 'export function deriveAdmittedFallbackRisk', 110, 'The command surface derives admitted review risk, selects an independent provider, and validates provider-neutral review receipts; this is HELIX-OS review orchestration and fallback control.', 'Fallback selection and receipt persistence remain historical compatibility evidence; no provider process, GitHub review, or execution admission was run.'),
    'route': spec('direct_product_basis', ['HELIX-OS'], 'export function buildWorkflowExecutionApprovalAuditEvent', 45, 'The CLI builds an approval audit event and evaluates typed workflow execution routing with fail-closed conditions; this is HELIX-OS execution and audit control.', 'The route command preserves approval and audit shrinkage boundaries; no audit write, workflow execution, or authority promotion was performed.'),
    'lite-canary-selector': spec('direct_product_basis', ['HELIX-OS'], 'export function runLiteCanaryRepositorySelector', 100, 'The CLI composition root passes Git metadata and distribution fast-check results into a canary lane selector; this is HELIX-OS CI/distribution operation control.', 'The selector is static orchestration evidence and explicitly depends on admission inputs; no GitHub event, canary run, or release action was executed.'),
    'preflight-gate-aggregation': spec('direct_product_basis', ['HELIX-OS'], 'export function runPreflightGateAggregationCommand', 40, 'The command aggregates preflight gate results and emits a bounded operational result from runtime evidence; this is HELIX-OS execution readiness control.', 'The preflight aggregator remains unexecuted state evidence; no gate was opened, closed, or promoted.'),
    'ai-decision-proposal': spec('direct_product_basis', ['HELIX-OS'], 'export function validateAiDecisionProposal', 80, 'The validator constrains AI decision proposals, required operational metrics, and forbidden authority-escalation actions; this is HELIX-OS learning and control safety.', 'The source explicitly rejects authority escalation and only proposes next-state actions; no AI decision, learning update, or operational state mutation was performed.'),
    'cli-workflow-identity-projection': spec('direct_product_basis', ['HELIX-OS'], 'export function buildCliWorkflowIdentityProjection', 38, 'The projection publishes only an authority-validated typed workflow identity and rejects legacy identity emission at the CLI boundary; this is HELIX-OS authority control.', 'The projection preserves legacy-input shrinkage and typed output requirements; no state snapshot or CLI output was executed.'),
    'current-location-workflow-identity': spec('direct_product_basis', ['HELIX-OS'], 'export function attachCurrentLocationWorkflowIdentity', 20, 'The composition boundary resolves current workflow identity against the installed authority catalog for CLI/read-model consumers; this is HELIX-OS operational identity control.', 'The source preserves typed identity and legacy compatibility as static evidence; no current-location read or authority resolution was executed.'),
    'readiness': spec('direct_product_basis', ['HELIX-OS'], 'export function evaluateAutomationReadiness', 55, 'The evaluator reads workflow runs, findings, gates, and human-required guardrails from harness.db and produces automation readiness rows; the operational state and human block control are HELIX-OS responsibilities.', 'The old readiness query is static database/state evidence; no database, workflow run, or readiness decision was executed.'),
    'workflow-classification-routing': spec('direct_product_basis', ['HELIX-OS'], 'export function routeSignalToWorkflowClassification', 95, 'The router matches a signal to the installed workflow classification catalog, reports unknown/ambiguous/decision-required states, and preserves unresolved-until-decision semantics; this is HELIX-OS authority routing.', 'The source fail-closes unknown and ambiguous classifications; no catalog read, route decision, or legacy identity emission was executed.'),
    'workflow-execution-routing': spec('direct_product_basis', ['HELIX-OS'], 'export function evaluateWorkflowExecutionRoute', 120, 'The evaluator combines classification routing, execution policy projection, registered command binding, approval requirements, and typed receipts; this is HELIX-OS execution control.', 'The old route evaluator preserves fail-closed dispositions and typed receipts; no policy load, command execution, or approval was performed.'),
    'distribution-consumer-cli': spec('direct_product_basis', ['HELIX-OS'], 'export async function runLiteConsumerCli', 45, 'The source composes the Lite consumer command registry, node adapter, services, provider delegation, and completion receipts; this is HELIX-OS distribution/consumer operation.', 'The CLI is historical consumer-operation evidence; provider delegation, service state, and filesystem writes were not executed.'),
    'distribution-consumer-command-composition': spec('direct_product_basis', ['HELIX-OS'], 'export async function dispatchLiteConsumerCommand', 45, 'The dispatcher admits a registered Lite consumer command and returns typed execution or failure results; this is HELIX-OS command and distribution control.', 'The dispatcher preserves typed failure admission but was not run and does not establish a current consumer implementation.'),
    'distribution-consumer-command-registry': spec('direct_product_basis', ['HELIX-OS'], 'export const LITE_CONSUMER_COMMAND_REGISTRY_SCHEMA', 45, 'The registry defines bounded Lite consumer command identities, provider admission, dry-run flags, and failure codes; this is HELIX-OS distribution operation control.', 'The registry is static command-boundary evidence; no provider command, consumer state, or release operation was executed.'),
    'distribution-consumer-node-adapter': spec('direct_product_basis', ['HELIX-OS'], 'export interface LiteConsumerNodeServices', 75, 'The adapter contracts provider delegation, setup, status, doctor, and completion decision services for a Lite consumer; these are HELIX-OS operational service controls.', 'The adapter retains provider and filesystem safety boundaries, but no node service or consumer was executed.'),
    'distribution-identity': spec('direct_product_basis', ['HELIX-OS'], 'export const HELIX_DISTRIBUTION_REPOSITORY', 45, 'The source validates current, legacy-compatible, and explicit distribution repository identities and rejects invalid remotes; distribution identity is HELIX-OS operation control.', 'The identity resolver preserves legacy repository rejection/compatibility evidence; no remote, package, or update operation was accessed.'),
    'distribution-lite-consumer-lifecycle': spec('direct_product_basis', ['HELIX-OS'], 'export function rehearseLiteConsumerLifecycle', 100, 'The lifecycle source validates safe consumer paths, immutable engine pins, snapshot digests, and rollback rehearsal; this is HELIX-OS distribution and state control.', 'The source is explicitly a lifecycle rehearsal with path/digest guards; no consumer copy, rollback, or release state was changed.'),
    'update-check': spec('direct_product_basis', ['HELIX-OS'], 'export function checkForUpdate', 80, 'The update checker validates the distribution identity, manifest, cache freshness, remote policy, and update availability; this is HELIX-OS distribution operation control.', 'Update checking remains historical network/cache control evidence; no remote request, cache write, or update was executed.'),
}
CONFLICT = {
    'issue-hierarchy-census': spec('multi_product_conflict', ['HELIX-HARNESS', 'HELIX-OS'], 'export function registerIssueHierarchyCensusCommand', 45, 'The read-only census checks GitHub Issue hierarchy contracts that express HARNESS requirement/process relationships while using HELIX-OS GitHub projection and operational source loading; one owner is not established.', 'The command is documented as read-only and does not write GitHub; the old contract census and consumer closure remain unexecuted.'),
    'full-regression-shards': spec('multi_product_conflict', ['HELIX-HARNESS', 'HELIX-OS'], 'export function runFullRegressionShardCommand', 90, 'The command plans and validates regression shards and receipts, combining HARNESS verification evidence with HELIX-OS runtime/CI execution control; a single product owner cannot be inferred.', 'Shard planning and receipt validation are static evidence only; no regression, CI, or receipt admission was executed.'),
    'contracts-extras': spec('multi_product_conflict', ['HELIX-HARNESS', 'HELIX-OS'], 'export function suggestSkillInjection', 120, 'The contract helpers combine capability/skill and folder-rule artifact semantics with command catalogs, partition paths, and operational readiness; HARNESS artifact meaning and HELIX-OS control overlap.', 'The helpers preserve shared contract and operational guardrails without deciding owner, consumer closure, or implementation status.'),
    'design-elicitation': spec('multi_product_conflict', ['HELIX-HARNESS', 'HELIX-Web'], 'export function composeDesignBottomupDiscovery', 100, 'The engine derives screen design requirements from backend capabilities, harness.db projections, CLI capabilities, and screen traces; HARNESS requirement/design meaning and HELIX-Web presentation responsibility compete.', 'The source explicitly leaves screen mock and adapter composition as later stages; no design requirement, Web surface, or implementation was generated.'),
    'universal-workflow-envelope': spec('multi_product_conflict', ['HELIX-HARNESS', 'HELIX-OS'], 'export const UNIVERSAL_WORKFLOW_SCHEMA_VERSION', 120, 'The envelope schema binds workflow atoms, unresolved/authority findings, derived requirements, contracts, and runtime orchestration; HARNESS workflow artifact meaning and HELIX-OS execution/state control meet.', 'The schema preserves unresolved, authority-missing, and branch-missing findings; no workflow envelope was executed or promoted.'),
    'nfr-registry': spec('multi_product_conflict', ['HELIX-HARNESS', 'HELIX-OS'], 'export interface NfrRegistryV1', 120, 'The NFR registry defines requirement quality characteristics and authority roles including runtime profile environment; HARNESS quality semantics and HELIX-OS operational authority overlap.', 'The registry is static quality/authority evidence; no NFR approval, runtime profile, or formal owner was assigned.'),
    'requirement-authority-gate': spec('multi_product_conflict', ['HELIX-HARNESS', 'HELIX-OS'], 'export function checkFrozenBaselineMaterialReceipt', 120, 'The gate validates canonical requirement authority, frozen baseline material, migration consumers, and source reads; HARNESS requirement authority and HELIX-OS promotion/migration control overlap.', 'The gate preserves canonical/frozen and migration allowlist boundaries; no authority gate, file read, promotion, or consumer migration was run.'),
    'requirement-ir-authority-cutover': spec('multi_product_conflict', ['HELIX-HARNESS', 'HELIX-OS'], 'const canonical = promoteRequirementIrToCanonical', 55, 'The command promotes a requirement shadow into canonical shards and manifest output, combining HARNESS requirement artifact meaning with HELIX-OS authority/cutover operation.', 'The source is a cutover command, but no cutover or output write was performed; current authority remains unchanged.'),
    'distribution-artifact-projection': spec('multi_product_conflict', ['HELIX-HARNESS', 'HELIX-OS'], 'export function projectDistributionArtifacts', 100, 'The projection catalogs HARNESS capability artifacts while excluding harness.db, environment, and local state from a distribution package; artifact content and distribution operation cross product boundaries.', 'The projection preserves exclusion and consumer-safety guards; no artifact catalog, package, or distribution authority was produced.'),
    'distribution-dependency-closure': spec('multi_product_conflict', ['HELIX-HARNESS', 'HELIX-OS'], 'export function analyzeDistributionDependencyClosure', 120, 'The analyzer traverses TypeScript dependency edges and Lite canary coverage over HARNESS source while enforcing distribution/runtime package closure; source artifact meaning and OS distribution control overlap.', 'Dependency and canary analysis remain static package evidence; no source execution, package build, or canary admission occurred.'),
    'distribution-lite-consumer-canary': spec('multi_product_conflict', ['HELIX-HARNESS', 'HELIX-OS'], 'export function admitLiteConsumerCanaryArtifact', 110, 'The canary validates a HARNESS source identity, requirements digest, distribution documents, runtime inputs, and consumer artifact; HARNESS artifact contract and HELIX-OS distribution admission conflict.', 'The source fail-closes identity, digest, path, and runtime-input mismatches; no artifact was admitted or published.'),
    'distribution-lite-consumer-services': spec('multi_product_conflict', ['HELIX-OS', 'HELIX-Web-OS'], 'export function createLiteConsumerServices', 100, 'The services manage consumer-lite state, workflow commands, provider delegation, and a consumer workflow file; HELIX-OS distribution control and HELIX-Web-OS service/runtime operation both appear.', 'The service layer contains path, symlink, and state guards; no consumer service, workflow, or external runtime was started.'),
    'distribution-lite-package': spec('multi_product_conflict', ['HELIX-HARNESS', 'HELIX-OS'], 'export function buildLiteDistributionPackage', 130, 'The package builder gathers HARNESS source and requirement documents, validates distribution identity, and creates a Lite artifact for DevOS; artifact ownership and distribution operation are distinct boundaries.', 'The builder preserves source/digest/remote guards but was not run and does not establish release or implementation success.'),
    'distribution-package-builder': spec('multi_product_conflict', ['HELIX-HARNESS', 'HELIX-OS'], 'export function createDeterministicDistributionPackage', 130, 'The package builder binds HARNESS source repository and requirements identity to a DevOS distribution manifest and deterministic tar inputs; HARNESS artifact meaning and HELIX-OS distribution control conflict.', 'The deterministic package path is historical build evidence only; no package, release, or distribution authority was created.'),
    'distribution-profile': spec('multi_product_conflict', ['HELIX-HARNESS', 'HELIX-OS'], 'export function validateDistributionProfileCatalog', 100, 'The profile requires HELIX-HARNESS source authority and a DevOS distribution repository while validating capability and refinement digests; source artifact ownership and distribution authority overlap.', 'The profile validator preserves source-authority and refinement mismatch failures; no profile was accepted as formal distribution authority.'),
}
INSUFFICIENT = {
    'helpers': spec('insufficient_basis', [], 'export function verificationSourceLines', 30, 'The helper only formats packet freshness, verification-source, and record-template strings; generic formatting does not prove a product-boundary owner.', 'The old helper is retained as shared static evidence with no product-specific authority, consumer closure, or execution claim.'),
    'contracts-types': spec('insufficient_basis', [], 'export type', 55, 'The file only declares generic Finding, ContractResult, projection, test, and command evidence shapes; type declarations alone do not establish a product owner.', 'The shared type vocabulary is static historical evidence and has no standalone implementation or boundary proof.'),
    'skill-applicability-authoring': spec('insufficient_basis', [], None, 4, 'The source is a one-line re-export of a schema adapter; it contains no independent product responsibility span from which to infer ownership.', 'The re-export preserves a legacy module boundary only; the underlying adapter and consumer closure require separate review.'),
    'workflow-classification-legacy-adapter': spec('insufficient_basis', [], None, 2, 'The source is a one-line re-export of the schema legacy adapter; this file itself has no independent product-boundary behavior.', 'The re-export is retained as static compatibility evidence and does not establish an implementation or owner.'),
    'canonical-digest': spec('insufficient_basis', [], 'export function canonicalJson', 35, 'The utility canonicalizes JSON and computes SHA-256 digests; generic serialization and hashing do not identify a product owner.', 'The helper is shared infrastructure evidence with no product-specific consumer or authority claim.'),
    'collection-utils': spec('insufficient_basis', [], 'export function uniqueSorted', 8, 'The utility sorts and deduplicates strings; generic collection behavior provides no product-boundary proof.', 'The helper remains shared static evidence without implementation or product ownership inference.'),
    'commit-subject': spec('insufficient_basis', [], 'export function analyzeCommitSubjects', 35, 'The utility checks conventional commit subject formatting and generated-message exceptions; repository hygiene alone does not prove a product owner.', 'The commit analysis is static shared tooling evidence and does not establish CI, release, or product authority.'),
    'file-walk': spec('insufficient_basis', [], 'export function walkFiles', 45, 'The utility walks filesystem paths and returns file metadata; generic traversal does not establish a product boundary.', 'The file walker is shared static infrastructure; no filesystem traversal or consumer closure was executed.'),
    'repo-info': spec('insufficient_basis', [], 'export function readRepoHeadSha', 25, 'The utility reads repository HEAD and package version through injected dependencies; generic repository metadata does not establish a product owner.', 'The repository reader retains dependency-injected static behavior and was not executed against a live repository.'),
    'shell-quote': spec('insufficient_basis', [], 'export function shellQuote', 12, 'The utility quotes one shell token; generic command-string safety does not prove HARNESS, OS, Web, or Web-OS ownership.', 'The quoting helper is shared static evidence; no shell command was executed.'),
    'string-utils': spec('insufficient_basis', [], 'export function escapeRegExp', 8, 'The utility escapes regular-expression text; generic string handling provides no product-boundary proof.', 'The helper is shared static evidence with no product authority or execution claim.'),
    'time-utils': spec('insufficient_basis', [], 'export function nowIso', 8, 'The utility returns an ISO timestamp; generic time formatting does not identify a product owner.', 'The helper is shared static evidence and was not used to establish freshness or runtime success.'),
    'typescript-lazy': spec('insufficient_basis', [], 'function loadTypescript', 25, 'The utility lazily resolves the TypeScript module for multiple owners and explicitly avoids owner-specific reverse dependencies; its shared loading role is insufficient for product classification.', 'The lazy loader preserves a shared dependency boundary; no compiler load or owner promotion was performed.'),
    'value-guards': spec('insufficient_basis', [], 'export function deepFreeze', 15, 'The utility checks records and recursively freezes values; generic data guards do not establish a product-boundary owner.', 'The value guard is shared static infrastructure and was not executed.'),
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
    "classification_category_tamper", "semantic_review_tamper", "legacy_evidence_tamper", "boundary_digest_tamper", "input_digest_omission",
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
        "legacy_implementation_shrinkage_evidence": {"disposition": asset.get("disposition"), "implementation_status": asset.get("implementation_status"), "execution_performed": False, "interpretation": review.get("legacy", ""), "source_anchor": review_obj["source_spans"]},
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
    targets = sorted(a for a, (line, row) in phase_by_asset.items() if row.get("product_classification_status") == "unresolved" and any(row.get("source_path", "").startswith(prefix) for prefix in SOURCE_PREFIXES))
    if len(targets) != 59:
        raise AssertionError(f"expected 59 target assets, got {len(targets)}")
    if set(phase_by_asset[a][1]["source_path"].rsplit("/", 1)[-1].removesuffix(".ts") for a in targets) != set(REVIEW_SPECS):
        raise AssertionError("source review spec set does not match target asset set")
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
        "scope": "phase product unresolved + five source prefixes exact 59 assets",
        "wave_source_paths": WAVE_PATHS,
        "counts": {"wave_files": 50, "wave_edges": len(wave_rows), "wave_unique_assets": len(by_asset), "target_assets": len(records), "target_wave_edges": sum(len(r["wave_semantic_links"]) for r in records), "target_wave_linked_assets": sum(bool(r["wave_semantic_links"]) for r in records), "categories": dict(sorted(category_counts.items())), "target_asset_artifact_evidence_kinds": {"implementation_source": sum(1 for a in targets if phase_by_asset[a][1].get("artifact_evidence_kind") == "implementation_source")}},
        "review_counts": {"source_semantic_reviewed": len(records), "source_semantic_review_pending": 0, "direct_candidate_basis": category_counts["direct_product_basis"], "multi_product_conflict": category_counts["multi_product_conflict"], "insufficient_basis": category_counts["insufficient_basis"]},
        "expected_sets": {"target_asset_count": 59, "target_asset_ids": targets, "target_asset_ids_sha256": tagged("\n".join(targets).encode()), "source_paths": [phase_by_asset[a][1]["source_path"] for a in targets]},
        "input_digests": input_digests,
        "old_asset_source_mode": "archive bytes are read through git show BASE:<archive-path>; never executed",
        "formal_update": {"formal_asset_classification_updated": False, "phase_ledger_updated": False, "product_route_updated": False, "successor_updated": False, "new_build_allowed": False, "authority_effect": "none"},
        "classification_rule": {"direct_product_basis": "a reviewed concrete source span mapped to one product L1 with explicit boundary counterevidence and pending consumer evidence", "multi_product_conflict": "reviewed source behavior contains concrete responsibilities mapped to two product boundaries; no single owner is proposed", "insufficient_basis": "source is generic, tombstone, shared infrastructure, or lacks an accepted product-boundary proof; observed Wave scope is not inherited"},
        "manual_reviewed_asset_ids": targets,
        "negative_cases": NEGATIVE_CASES,
        "research_overlap": {
            "reference_bundle_counts": {"wave_unresolved_product": 64, "lint_unresolved_src": 95, "runtime_unresolved_src": 73, "schema_unresolved_src": 31, "source_prefix_unresolved": 59},
            "pairwise_intersections": {"schema_wave_unresolved_product": 1, "schema_lint_unresolved_src": 0, "schema_runtime_unresolved_src": 0, "runtime_wave_unresolved_product": 16, "runtime_lint_unresolved_src": 0, "wave_unresolved_product_lint_unresolved_src": 14, "source_wave_unresolved_product": 11, "source_lint_unresolved_src": 0, "source_runtime_unresolved_src": 0, "source_schema_unresolved_src": 0},
            "union_count": 280,
            "schema_wave_overlap_asset_ids": [],
            "source_wave_overlap_asset_ids": sorted({a for a in targets if a in by_asset and phase_by_asset[a][1].get("product_classification_status") == "unresolved"}),
            "schema_lint_overlap_asset_ids": [],
            "schema_runtime_overlap_asset_ids": [],
            "source_lint_overlap_asset_ids": [],
            "source_runtime_overlap_asset_ids": [],
            "source_schema_overlap_asset_ids": [],
        },
        "boundary_refs": {"product_boundary": BOUNDARY, "l1": L1}, "history_failure_consumer": {"disposition_rows": 59, "decision_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["decisions"]) for r in records), "read_after_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["read_after"]) for r in records), "failure_consumer_refs_are_static_global_inventory": True},
        "edge_contract": {"edge_identity": "edge_id derived from wave/path/line/asset_id/unit_candidate_id/semantic_link_status", "duplicate_edges_forbidden": True, "missing_edges_forbidden": True},
        "authority_boundary": {"authority_effect": "none", "classification_state": "research_proposal_pending_human_product_review", "formal_asset_classification_updated": False, "new_build_allowed": False},
        "artifacts": ["scaffold/bindings/SCF-B-0123.json", "scaffold/legacy-source-product-classification-0123/README.md", "scaffold/legacy-source-product-classification-0123/PR-DRAFT.md", "scaffold/legacy-source-product-classification-0123/generate.py", "scaffold/legacy-source-product-classification-0123/validate.py", "scaffold/legacy-source-product-classification-0123/selfcheck.py", "scaffold/legacy-source-product-classification-0123/inventory.json", "scaffold/legacy-source-product-classification-0123/classification-research.jsonl"],
        "output_sha256": tagged(out.read_bytes()),
    }
    phase_dist = Counter(tuple(phase_by_asset[a][1].get("candidate_phase_targets") or []) for a in targets)
    inventory["counts"]["target_phase_candidate_distribution"] = {"|".join(k): v for k, v in sorted(phase_dist.items())}
    (BUNDLE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, sort_keys=True, indent=2) + "\n")


if __name__ == "__main__":
    build()
