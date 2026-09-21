#!/usr/bin/env python3
"""RDP-001 research-premise候補60 pathのread-only静的検証。"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MANIFEST = ROOT / "scaffold/pre-isolation-research-next60/rdp001-preiso-research-next60.json"
DEFAULT_INVENTORY = ROOT / "scaffold/pre-isolation-research-next60/rdp001-preiso-research-next60-semantic-diff-inventory.json"
HOLDING_REL = "docs/governance/pre-isolation-revision-delta-source-holding.jsonl"
ASSET_REL = "docs/governance/legacy-asset-disposition.jsonl"
PHASE_REL = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
BASELINE = "6fabd12512a3659fff4a956692cdd61faeeb16ce"
PRE_ISOLATION = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
CANDIDATE_BASE = "59d344ea0cd8c26aed55bad0c674119e9be821ae"
INPUT_DIGESTS = {
    "docs/governance/pre-isolation-revision-delta-source-holding.jsonl": "d61a36db8e053d9006d11a09d1c60fd86413f32daa4a766aaeae2bc849130180",
    "docs/governance/legacy-asset-disposition.jsonl": "cd73ac407937ad86c6be2c0b27d70863b1873fe39c2d6c0f89620e648dccad8c",
    "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl": "2188f236cb7ed316772ee1fcf413f3b098f702cb4c9d9b3dad09a72db7468c1f",
    "docs/governance/requirement-atomization-review-contract.md": "adf39ac913498acd6370788e9e510b29cb0b88fa165bfa497ac489956e76c9ba",
}
NUMBERS = list(range(85, 145))
EXPECTED_IDS = [f"PREISO-REV-{n:06d}" for n in NUMBERS]
EXPECTED_PATHS = {
    "PREISO-REV-000085": 'docs/plans/PLAN-L7-1687-cli-r00-throughput-baseline.md',
    "PREISO-REV-000086": 'docs/plans/PLAN-L7-1743-claude-unanswered-review-detector.md',
    "PREISO-REV-000087": 'docs/plans/PLAN-L7-555-issue-metadata-enforcement.md',
    "PREISO-REV-000088": 'docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md',
    "PREISO-REV-000089": 'docs/plans/PLAN-L7-570-design-elicitation-typed-classification.md',
    "PREISO-REV-000090": 'docs/plans/PLAN-L7-571-typed-plan-authority-failure.md',
    "PREISO-REV-000091": 'docs/plans/PLAN-L7-572-typed-plan-signal-identity-consistency.md',
    "PREISO-REV-000092": 'docs/plans/PLAN-L7-573-github-workflow-identity-ingest.md',
    "PREISO-REV-000093": 'docs/plans/PLAN-L7-574-github-workflow-identity-admission.md',
    "PREISO-REV-000094": 'docs/plans/PLAN-L7-575-plan-registry-workflow-identity-projection.md',
    "PREISO-REV-000095": 'docs/plans/PLAN-L7-576-github-execution-episode-state.md',
    "PREISO-REV-000096": 'docs/plans/PLAN-L7-577-github-execution-episode-location-projection.md',
    "PREISO-REV-000097": 'docs/plans/PLAN-L7-578-github-execution-episode-right-arm-evidence.md',
    "PREISO-REV-000098": 'docs/plans/PLAN-L7-579-plan-entry-legacy-workflow-identity-isolation.md',
    "PREISO-REV-000099": 'docs/plans/PLAN-L7-580-workflow-classification-catalog-doctor.md',
    "PREISO-REV-000100": 'docs/plans/PLAN-L7-581-github-workflow-identity-migration-bundle-admission.md',
    "PREISO-REV-000101": 'docs/plans/PLAN-L7-582-bounded-probe-history.md',
    "PREISO-REV-000102": 'docs/plans/PLAN-L7-583-workflow-classification-drive-run-projection.md',
    "PREISO-REV-000103": 'docs/plans/PLAN-L7-584-current-location-workflow-identity.md',
    "PREISO-REV-000104": 'docs/plans/PLAN-L7-601-physical-filesystem-identity.md',
    "PREISO-REV-000105": 'docs/plans/PLAN-L7-603-distribution-deterministic-archive.md',
    "PREISO-REV-000106": 'docs/plans/PLAN-L7-635-workflow-guide-dynamic-injection.md',
    "PREISO-REV-000107": 'docs/plans/PLAN-L7-636-event-projection-checkpoint-replay.md',
    "PREISO-REV-000108": 'docs/plans/PLAN-L7-637-event-projection-checkpoint-transaction.md',
    "PREISO-REV-000109": 'docs/plans/PLAN-L7-638-xhigh-reasoning-effort-schema.md',
    "PREISO-REV-000110": 'docs/plans/PLAN-L7-639-luna-worker-model-registry.md',
    "PREISO-REV-000111": 'docs/plans/PLAN-L7-640-luna-native-spawn-admission.md',
    "PREISO-REV-000112": 'docs/plans/PLAN-L7-641-route-eval-cwd-isolation.md',
    "PREISO-REV-000113": 'docs/plans/PLAN-L7-642-distribution-lite-profile-manifest.md',
    "PREISO-REV-000114": 'docs/plans/PLAN-L7-643-node-engine-runtime-gate.md',
    "PREISO-REV-000115": 'docs/plans/PLAN-L7-645-derived-trace-entry-failure-oracle.md',
    "PREISO-REV-000116": 'docs/plans/PLAN-L7-646-ai-decision-proposal-failure-oracle.md',
    "PREISO-REV-000117": 'docs/plans/PLAN-L7-647-typed-backfill-pending-routing.md',
    "PREISO-REV-000118": 'docs/plans/PLAN-L7-648-review-evidence-reviewer-identity.md',
    "PREISO-REV-000119": 'docs/plans/PLAN-L7-649-proposal-lane-effort-binding.md',
    "PREISO-REV-000120": 'docs/plans/PLAN-L7-650-lite-catalog-parse-oracle.md',
    "PREISO-REV-000121": 'docs/plans/PLAN-L7-651-project-hook-authority-resolver.md',
    "PREISO-REV-000122": 'docs/plans/PLAN-L7-652-distribution-lite-artifact-projection.md',
    "PREISO-REV-000123": 'docs/plans/PLAN-L7-653-distribution-lite-dependency-closure.md',
    "PREISO-REV-000124": 'docs/plans/PLAN-L7-654-distribution-devos-instruction-authority.md',
    "PREISO-REV-000125": 'docs/plans/PLAN-L7-655-distribution-devos-runtime-identity.md',
    "PREISO-REV-000126": 'docs/plans/PLAN-L7-656-distribution-lite-profile-bound-package.md',
    "PREISO-REV-000127": 'docs/plans/PLAN-L7-657-distribution-lite-consumer-canary.md',
    "PREISO-REV-000128": 'docs/plans/PLAN-L7-658-lite-consumer-distribution-docs.md',
    "PREISO-REV-000129": 'docs/plans/PLAN-L7-659-lite-canary-manifest-exact-set-oracle.md',
    "PREISO-REV-000130": 'docs/plans/PLAN-L7-660-lite-document-rule-oracles.md',
    "PREISO-REV-000131": 'docs/plans/PLAN-L7-661-lite-requirements-manifest-oracle.md',
    "PREISO-REV-000132": 'docs/plans/PLAN-L7-662-project-hook-physical-adapter.md',
    "PREISO-REV-000133": 'docs/plans/PLAN-L7-663-issue-metadata-scheduled-audit.md',
    "PREISO-REV-000134": 'docs/plans/PLAN-L7-664-project-hook-physical-identity-validation.md',
    "PREISO-REV-000135": 'docs/plans/PLAN-L7-665-plan-modification-ownership.md',
    "PREISO-REV-000136": 'docs/plans/PLAN-L7-666-issue-dependency-contract-attribution.md',
    "PREISO-REV-000137": 'docs/plans/PLAN-L7-667-project-hook-authority-input-provider.md',
    "PREISO-REV-000138": 'docs/plans/PLAN-L7-668-project-hook-authority-surface-projector.md',
    "PREISO-REV-000139": 'docs/plans/PLAN-L7-669-project-hook-assignment-provider.md',
    "PREISO-REV-000140": 'docs/plans/PLAN-L7-670-issue-metadata-fail-close-oracle.md',
    "PREISO-REV-000141": 'docs/plans/PLAN-L7-671-issue-dependency-detector-parser-shape.md',
    "PREISO-REV-000142": 'docs/plans/PLAN-L7-672-current-location-summary-typed-output.md',
    "PREISO-REV-000143": 'docs/plans/PLAN-L7-673-reverse-fullback-scope-all-entry-validation.md',
    "PREISO-REV-000144": 'docs/plans/PLAN-L7-674-terminal-fullback-bundle-admission.md',
}
PRIOR_IDS = [
    "PREISO-REV-000001", "PREISO-REV-000002", "PREISO-REV-000015", "PREISO-REV-000016",
    "PREISO-REV-000026", "PREISO-REV-000060", "PREISO-REV-000003", "PREISO-REV-000004",
    "PREISO-REV-000005", "PREISO-REV-000006", "PREISO-REV-000007", "PREISO-REV-000008",
    "PREISO-REV-000009", "PREISO-REV-000010", "PREISO-REV-000011", "PREISO-REV-000012",
    "PREISO-REV-000013", "PREISO-REV-000014", "PREISO-REV-000017", "PREISO-REV-000018",
    "PREISO-REV-000019", "PREISO-REV-000020", "PREISO-REV-000021", "PREISO-REV-000022",
]
PR1946_IDS = [f"PREISO-REV-{n:06d}" for n in list(range(23, 26)) + list(range(27, 44))]
PR1946_PATHS = {
    "PREISO-REV-000023": 'docs/governance/candidates/helix-concept-v4-requirements.md',
    "PREISO-REV-000024": 'docs/governance/candidates/helix-concept-v4.0.md',
    "PREISO-REV-000025": 'docs/governance/helix-harness-concept_v3.1.md',
    "PREISO-REV-000027": 'docs/plans/PLAN-L3-1358-three-lane-capacity-profile-v05.md',
    "PREISO-REV-000028": 'docs/plans/PLAN-L3-1500-concept-vision-intake.md',
    "PREISO-REV-000029": 'docs/plans/PLAN-L3-1594-skill-mechanism-migration.md',
    "PREISO-REV-000030": 'docs/plans/PLAN-L3-1595-rule-derivation.md',
    "PREISO-REV-000031": 'docs/plans/PLAN-L3-1608-instruction-path-change-resilience.md',
    "PREISO-REV-000032": 'docs/plans/PLAN-L3-1610-conversation-lifetime-reconstruction.md',
    "PREISO-REV-000033": 'docs/plans/PLAN-L3-1622-producer-provenance-separation.md',
    "PREISO-REV-000034": 'docs/plans/PLAN-L3-1639-bugbot-generation.md',
    "PREISO-REV-000035": 'docs/plans/PLAN-L3-1642-bugbot-bounded-repair.md',
    "PREISO-REV-000036": 'docs/plans/PLAN-L3-54-distribution-package-release.md',
    "PREISO-REV-000037": 'docs/plans/PLAN-L3-60-workflow-catalog-projection-authority.md',
    "PREISO-REV-000038": 'docs/plans/PLAN-L3-61-github-workflow-guidance-authority.md',
    "PREISO-REV-000039": 'docs/plans/PLAN-L3-62-security-capability-broker-authority.md',
    "PREISO-REV-000040": 'docs/plans/PLAN-L3-63-codex-native-worker-routing.md',
    "PREISO-REV-000041": 'docs/plans/PLAN-L3-64-codex-native-worker-project-hook-authority.md',
    "PREISO-REV-000042": 'docs/plans/PLAN-L3-65-distribution-repository-devos-authority.md',
    "PREISO-REV-000043": 'docs/plans/PLAN-L3-659-commercial-license-policy.md',
}
PR1949_IDS = [f"PREISO-REV-{n:06d}" for n in list(range(44, 60)) + list(range(61, 85))]
PR1949_PATHS = {
    "PREISO-REV-000044": 'docs/plans/PLAN-L3-66-system-synthesis-requirements.md',
    "PREISO-REV-000045": 'docs/plans/PLAN-L3-67-skill-applicability-authority.md',
    "PREISO-REV-000046": 'docs/plans/PLAN-L3-68-release-module-bundle-composition.md',
    "PREISO-REV-000047": 'docs/plans/PLAN-L3-69-worker-context-boundary-compiler.md',
    "PREISO-REV-000048": 'docs/plans/PLAN-L3-70-windows-lite-canary-admission.md',
    "PREISO-REV-000049": 'docs/plans/PLAN-L3-71-product-lifecycle-operations.md',
    "PREISO-REV-000050": 'docs/plans/PLAN-L3-72-technology-environment-reconciliation.md',
    "PREISO-REV-000051": 'docs/plans/PLAN-L3-73-ci-system-synthesis.md',
    "PREISO-REV-000052": 'docs/plans/PLAN-L3-74-universal-improvement-loop.md',
    "PREISO-REV-000053": 'docs/plans/PLAN-L3-75-resident-lane-orchestration-authority.md',
    "PREISO-REV-000054": 'docs/plans/PLAN-L3-76-uil-observation-generation-authority.md',
    "PREISO-REV-000055": 'docs/plans/PLAN-L3-77-refactoring-trigger-authority.md',
    "PREISO-REV-000056": 'docs/plans/PLAN-L3-78-three-lane-cloud-governance-authority.md',
    "PREISO-REV-000057": 'docs/plans/PLAN-L3-79-requirements-authority-materialization-gate.md',
    "PREISO-REV-000058": 'docs/plans/PLAN-L3-80-responsibility-centric-learning-system.md',
    "PREISO-REV-000059": 'docs/plans/PLAN-L3-81-agentic-audit-future-state-delta.md',
    "PREISO-REV-000061": 'docs/plans/PLAN-L3-83-functional-release-slice-composition.md',
    "PREISO-REV-000062": 'docs/plans/PLAN-L3-84-helix-concept-v4-upgrade.md',
    "PREISO-REV-000063": 'docs/plans/PLAN-L3-85-document-authority-census.md',
    "PREISO-REV-000064": 'docs/plans/PLAN-L3-86-harness-memory-coordination-boundary.md',
    "PREISO-REV-000065": 'docs/plans/PLAN-L3-87-security-engagement-authority.md',
    "PREISO-REV-000066": 'docs/plans/PLAN-L3-88-execution-ticket-bench-authority.md',
    "PREISO-REV-000067": 'docs/plans/PLAN-L3-89-mechanism-adequacy-authority.md',
    "PREISO-REV-000068": 'docs/plans/PLAN-L3-90-requirement-formation-scoped-admission.md',
    "PREISO-REV-000069": 'docs/plans/PLAN-L3-91-design-grounding-human-convergence.md',
    "PREISO-REV-000070": 'docs/plans/PLAN-L3-92-world-governance.md',
    "PREISO-REV-000071": 'docs/plans/PLAN-L3-93-ci-event-concurrency-generation.md',
    "PREISO-REV-000072": 'docs/plans/PLAN-L4-75-workflow-switch-route-allocation-boundary.md',
    "PREISO-REV-000073": 'docs/plans/PLAN-L4-76-project-hook-authority-boundary.md',
    "PREISO-REV-000074": 'docs/plans/PLAN-L4-77-cursor-cloud-independent-execution-boundary.md',
    "PREISO-REV-000075": 'docs/plans/PLAN-L5-102-workflow-switch-route-allocation-schema.md',
    "PREISO-REV-000076": 'docs/plans/PLAN-L5-103-project-hook-authority-schema.md',
    "PREISO-REV-000077": 'docs/plans/PLAN-L5-104-python-runtime-toolchain-freeze.md',
    "PREISO-REV-000078": 'docs/plans/PLAN-L5-105-cursor-cloud-independent-execution-contract.md',
    "PREISO-REV-000079": 'docs/plans/PLAN-L6-108-python-semantic-canary-pair-freeze.md',
    "PREISO-REV-000080": 'docs/plans/PLAN-L6-1670-pin-chain-derivation-design.md',
    "PREISO-REV-000081": 'docs/plans/PLAN-L6-1734-python-semantic-foundation-canary-boundary.md',
    "PREISO-REV-000082": 'docs/plans/PLAN-L7-1307-unreachable-tokenizer-exception.md',
    "PREISO-REV-000083": 'docs/plans/PLAN-L7-1574-cli-summary-fixture.md',
    "PREISO-REV-000084": 'docs/plans/PLAN-L7-1612-merge-admission-terminal-diagnosis.md',
}
EXPECTED_NEGATIVES = {
    "RP-NEG-DIGEST", "RP-NEG-HUNK-COVERAGE", "RP-NEG-LEGACY-EXECUTION", "RP-NEG-PHASE-CLOSURE",
    "RP-NEG-OWNER-UNRESOLVED", "RP-NEG-AUTHORITY-NO-SUCCESSOR", "RP-NEG-ATOM-HOLD", "RP-NEG-COUNTEREVIDENCE", "RP-NEG-PR1946-OVERLAP", "RP-NEG-PR1949-OVERLAP",
}
REVIEW_ONLY_NUMBERS = {5, 12, 19, 26, 33, 40, 47, 54}
HOLDING_KEYS = [
    "source_revision_item_id", "source_path", "baseline_commit", "baseline_blob_oid", "baseline_file_sha256",
    "pre_isolation_commit", "pre_isolation_blob_oid", "pre_isolation_file_sha256", "archive_path", "archive_commit",
    "source_category", "revision_relation", "baseline_revision_state", "pre_isolation_revision_state",
    "meaning_change_applied", "successor_requirement_ids", "human_decision_ref", "authority_effect",
]
ASSET_KEYS = [
    "asset_id", "source_sha256", "asset_class", "disposition", "implementation_status", "consumer_refs",
    "product_target", "source_authority_state", "target_authority_state", "carry_forward_state", "decision_status",
    "executability_status", "external_effect_status",
]
PHASE_KEYS = [
    "classification_id", "phase_classification_status", "candidate_phase_targets", "candidate_product_targets",
    "product_classification_status", "consumer_closure_status", "consumer_refs", "implementation_evidence_state",
    "legacy_execution_performed", "legacy_implementation_status", "unresolved",
]
DIFF_HUNK = re.compile(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @")

def fail(errors: list[str], message: str) -> None:
    errors.append(message)

def read_json(path: Path, errors: list[str]) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(errors, f"JSONを読めない: {path}: {exc}"); return {}
    if not isinstance(value, dict): fail(errors, f"JSONがobjectではない: {path}"); return {}
    return value

def read_jsonl(path: Path, errors: list[str]) -> list[dict]:
    records = []
    try: lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as exc: fail(errors, f"台帳を読めない: {path}: {exc}"); return records
    for no, line in enumerate(lines, 1):
        if not line.strip(): continue
        try: value = json.loads(line)
        except json.JSONDecodeError as exc: fail(errors, f"台帳JSON不正 {path}:{no}: {exc}"); continue
        if isinstance(value, dict): records.append(value)
        else: fail(errors, f"台帳recordがobjectではない {path}:{no}")
    return records

def git_blob(commit: str, path: str, errors: list[str]) -> bytes | None:
    result = subprocess.run(["git", "cat-file", "blob", f"{commit}:{path}"], cwd=ROOT, capture_output=True, check=False)
    if result.returncode: fail(errors, f"Git blobを読めない: {commit}:{path}"); return None
    return result.stdout

def line_span(blob: bytes, start: int, end: int) -> bytes | None:
    if start == 0 and end == -1: return b""
    if not isinstance(start, int) or not isinstance(end, int) or start < 1 or end < start - 1: return None
    if start == end + 1: return b""
    lines = blob.splitlines(keepends=True)
    if end > len(lines): return None
    return b"".join(lines[start - 1:end])

def check_span(errors: list[str], label: str, blob: bytes, declaration: dict) -> None:
    actual = line_span(blob, declaration.get("start_line"), declaration.get("end_line"))
    if actual is None: fail(errors, f"{label} line span不正"); return
    if declaration.get("exact_text") != actual.decode("utf-8", errors="replace"): fail(errors, f"{label} exact_text不一致")
    if declaration.get("sha256") != "sha256:" + hashlib.sha256(actual).hexdigest(): fail(errors, f"{label} SHA-256不一致")

def changed_end(start: int, count: int) -> int: return start + count - 1 if count else start - 1

def parse_diff(errors: list[str], paths: list[str] | None = None) -> list[tuple[str, int, int, int, int]]:
    command = ["git", "diff", "--unified=0", "--no-renames", BASELINE, PRE_ISOLATION]
    if paths is not None: command += ["--", *paths]
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, check=False)
    if result.returncode: fail(errors, f"Git diffを読めない: {result.stderr.strip()}"); return []
    current = None; hunks = []
    for line in result.stdout.splitlines():
        if line.startswith("diff --git a/"):
            marker = line[len("diff --git a/"):]; left, right = marker.split(" b/", 1); current = right if left == right else None
            if current is None: fail(errors, f"renameまたはpath差替えを検出: {line}")
        elif line.startswith("@@ "):
            match = DIFF_HUNK.match(line)
            if match is None or current is None: fail(errors, f"Git diff hunk header不正: {line}"); continue
            old_start = int(match.group(1)); old_count = int(match.group(2) or 1); new_start = int(match.group(3)); new_count = int(match.group(4) or 1)
            hunks.append((current, old_start, changed_end(old_start, old_count), new_start, changed_end(new_start, new_count)))
    return hunks

def main() -> int:
    parser = argparse.ArgumentParser(); parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST); parser.add_argument("--inventory", type=Path, default=DEFAULT_INVENTORY); args = parser.parse_args()
    errors: list[str] = []; manifest = read_json(args.manifest, errors); inventory = read_json(args.inventory, errors)
    holding = read_jsonl(ROOT / HOLDING_REL, errors); assets = read_jsonl(ROOT / ASSET_REL, errors); phases = read_jsonl(ROOT / PHASE_REL, errors)
    holding_by_id = {r.get("source_revision_item_id"): r for r in holding}; assets_by_path = {r.get("source_path"): r for r in assets}; phases_by_asset = {r.get("asset_id"): r for r in phases}
    current_paths = {EXPECTED_PATHS[i] for i in EXPECTED_IDS}
    pr1946_paths = {PR1946_PATHS[i] for i in PR1946_IDS}
    pr1949_paths = {PR1949_PATHS[i] for i in PR1949_IDS}
    prior_paths = {holding_by_id[i].get("source_path") for i in PRIOR_IDS if i in holding_by_id}
    if current_paths & pr1946_paths: fail(errors, "current selected pathがPR1946 candidate pathと重複")
    if current_paths & pr1949_paths: fail(errors, "current selected pathがPR1949 candidate pathと重複")
    if current_paths & prior_paths: fail(errors, "current selected pathがPR1943 prior pathと重複")
    for key, value in (("schema", "helix-scaffold-preisolation-research-next60-manifest.v1"), ("candidate_kind", "research_premise"), ("status", "candidate_pending_semantic_equivalence_review"), ("authority_effect", "none"), ("meaning_change_applied", False), ("successor_requirement_ids", []), ("human_decision_ref", None), ("equivalence_claim", None)):
        if manifest.get(key) != value: fail(errors, f"manifest {key}が固定候補境界と不一致")
    comparison = manifest.get("comparison", {})
    expected = {"baseline_commit": BASELINE, "pre_isolation_commit": PRE_ISOLATION, "archive_commit": ARCHIVE, "candidate_worktree_base_commit": CANDIDATE_BASE, "base_freshness_gate": False, "base_update_rebase_performed": False, "base_update_policy": "source input digest is fixed; later base update is review-side test-merge handling, not candidate freshness validation", "source_holding_record_count": 333, "full_diff_file_count": 400, "full_diff_hunk_count": 492, "integrated_prior_scope_file_count": 24, "integrated_prior_scope_hunk_count": 91, "pr1946_selected_scope_file_count": 20, "pr1946_selected_scope_hunk_count": 21, "pr1949_unmerged_candidate_scope_file_count": 40, "pr1949_unmerged_candidate_scope_hunk_count": 40, "combined_selected_before_current_file_count": 84, "combined_selected_before_current_hunk_count": 152, "residual_before_current_selection_file_count": 316, "residual_before_current_selection_hunk_count": 340, "current_selected_file_count": 60, "current_selected_hunk_count": 60, "combined_selected_file_count": 144, "combined_selected_hunk_count": 212, "remaining_after_current_selection_file_count": 256, "remaining_after_current_selection_hunk_count": 280, "source_holding_selected_before_current_count": 84, "source_holding_current_selection_count": 60, "source_holding_remaining_record_count": 189}
    for key, value in expected.items():
        if comparison.get(key) != value: fail(errors, f"comparison {key}不一致")
    if comparison.get("old_runtime_test_ci_execution") is not False: fail(errors, "old_runtime_test_ci_executionはfalseに固定する")
    if comparison.get("method") != "read-only Git object bytes; exact changed hunk spans and UTF-8 SHA-256": fail(errors, "comparison method不一致")
    if manifest.get("source_input_digests") != INPUT_DIGESTS: fail(errors, "manifest source input digest不一致")
    expected_prior = {"request_ids": ["GUI-1934-REVIEW-02", "SCF-B-0007", "SCF-B-0009"], "integration_ref": "PR-1943", "status": "integrated_prior_scope", "source_revision_item_ids": PRIOR_IDS, "file_count": 24, "hunk_count": 91}
    expected_pr1946 = {"request_ids": ["PR-1946", "SCF-B-0012"], "integration_ref": "PR-1946", "candidate_ref": "6e1d24d652f009057e23f99ce8f4399a0a9092d0", "status": "selected_candidate_originated_unmerged", "status_at_selection": "unmerged_candidate", "status_at_rebaseline": "integrated_in_latest_main", "integration_commit": "bcd54942763835492478d998ced6c3b56566b89b", "source_revision_item_ids": PR1946_IDS, "source_paths": [PR1946_PATHS[i] for i in PR1946_IDS], "file_count": 20, "hunk_count": 21}
    expected_pr1949 = {"request_ids": ["PR-1949", "SCF-B-0015"], "integration_ref": "PR-1949", "candidate_ref": "9d12b1371282fe66237aa855fab5acf1576d6391", "candidate_ref_role": "historical_round1_candidate_ref", "status": "selected_candidate_originated_unmerged", "status_at_selection": "unmerged_candidate", "status_at_rebaseline": "integrated_in_latest_main", "integration_commit": "e21962d3aad689b260f6396ec2dc862df6f1fce3", "integration_head": "747071f56f1f952fff7491daf1e185956bf1964d", "source_revision_item_ids": PR1949_IDS, "source_paths": [PR1949_PATHS[i] for i in PR1949_IDS], "file_count": 40, "hunk_count": 40}
    if comparison.get("integrated_prior_scope") != expected_prior or comparison.get("pr1946_selected_scope") != expected_pr1946 or comparison.get("pr1949_unmerged_candidate_scope") != expected_pr1949: fail(errors, "prior selected scope不一致")
    scope = manifest.get("scope", {})
    expected_pr1949_lineage = {"candidate_ref": "9d12b1371282fe66237aa855fab5acf1576d6391", "candidate_ref_role": "historical_round1_candidate_ref", "status_at_selection": "unmerged_candidate", "status_at_rebaseline": "integrated_in_latest_main", "integration_commit": "e21962d3aad689b260f6396ec2dc862df6f1fce3", "integration_head": "747071f56f1f952fff7491daf1e185956bf1964d"}
    if scope.get("diff_scope") != "selected_source_items_only" or scope.get("candidate_kind") != "research_premise" or scope.get("selected_source_revision_item_ids") != EXPECTED_IDS or scope.get("integrated_prior_source_revision_item_ids") != PRIOR_IDS or scope.get("pr1946_selected_source_revision_item_ids") != PR1946_IDS or scope.get("pr1949_unmerged_candidate_source_revision_item_ids") != PR1949_IDS or scope.get("selected_before_current_source_revision_item_ids") != PRIOR_IDS + PR1946_IDS + PR1949_IDS or scope.get("pr1949_scope_lineage") != expected_pr1949_lineage: fail(errors, "manifest scope／PR1949 lineage不一致")
    if set(EXPECTED_IDS) & set(PR1946_IDS) or set(EXPECTED_IDS) & set(PR1949_IDS) or set(EXPECTED_IDS) & set(PRIOR_IDS): fail(errors, "current selected IDがprior scopeと重複")
    rows = manifest.get("paths")
    if not isinstance(rows, list) or [r.get("source_revision_item_id") for r in rows] != EXPECTED_IDS: fail(errors, "manifest pathsのID順序不一致")
    rows = rows if isinstance(rows, list) else []; path_by_id = {}
    for row in rows:
        item_id = row.get("source_revision_item_id"); path_by_id[item_id] = row
        expected_path = EXPECTED_PATHS.get(item_id)
        if expected_path is None: fail(errors, f"未知のselected ID: {item_id}"); continue
        holding_row = holding_by_id.get(item_id)
        if holding_row is None: fail(errors, f"holding欠落: {item_id}"); continue
        for field in HOLDING_KEYS:
            if row.get(field) != holding_row.get(field): fail(errors, f"{item_id} holding field不一致: {field}")
        if row.get("source_path") != expected_path or row.get("candidate_kind") != "research_premise": fail(errors, f"{item_id} path／candidate kind不一致")
        if row.get("product_owner_candidate") != "unresolved" or row.get("secondary_consumer_candidate") is not None: fail(errors, f"{item_id} owner候補不一致")
        asset = assets_by_path.get(expected_path); phase = phases_by_asset.get(asset.get("asset_id")) if asset else None
        for key, source, fields in (("legacy_asset", asset, ASSET_KEYS), ("phase_classification", phase, PHASE_KEYS)):
            if source is None: fail(errors, f"{item_id} {key} snapshot欠落"); continue
            for field in fields:
                if row.get(key, {}).get(field) != source.get(field): fail(errors, f"{item_id} {key}不一致: {field}")
        if phase and (phase.get("consumer_closure_status") != "pending" or phase.get("legacy_execution_performed") is not False): fail(errors, f"{item_id} phase未確認境界不一致")
    if set(path_by_id) != set(EXPECTED_IDS): fail(errors, "manifest source ID集合不一致")
    full_hunks = parse_diff(errors); selected_paths = [EXPECTED_PATHS[i] for i in EXPECTED_IDS]; selected_hunks = parse_diff(errors, selected_paths)
    if len({p for p, *_ in full_hunks}) != 400 or len(full_hunks) != 492: fail(errors, f"全体diff分母不一致: files={len({p for p, *_ in full_hunks})} hunks={len(full_hunks)}")
    if len({p for p, *_ in selected_hunks}) != 60 or len(selected_hunks) != 60: fail(errors, f"selected diff scope不一致: files={len({p for p, *_ in selected_hunks})} hunks={len(selected_hunks)}")
    for key, value in (("schema", "helix-scaffold-preisolation-research-next60-semantic-diff.v1"), ("candidate_kind", "research_premise"), ("status", "candidate_pending_semantic_equivalence_review"), ("authority_effect", "none"), ("meaning_change_applied", False), ("successor_requirement_ids", []), ("human_decision_ref", None), ("equivalence_claim", None)):
        if inventory.get(key) != value: fail(errors, f"inventory {key}が固定候補境界と不一致")
    if inventory.get("source_input_digests") != INPUT_DIGESTS: fail(errors, "inventory source input digest不一致")
    if inventory.get("comparison") != comparison or inventory.get("scope") != scope or inventory.get("source_items") != rows: fail(errors, "inventory comparison／scope／source items不一致")
    if inventory.get("classification_unit") != "hunk_fragment" or inventory.get("classification_counts_are_not_semantic_atom_counts") is not True: fail(errors, "hunk分類とatom境界の固定値不一致")
    atom = inventory.get("semantic_atomization", {}); atom_expected = {"status": "not_started", "hunk_level_classification_only": True, "semantic_atomization_complete": False, "semantic_atom_count": 0, "hunk_fragment_count": 60, "compound_hunk_hold_count": 60, "semantic_subunit_reviewed_fragment_count": 8, "semantic_subunit_count": 8, "fully_unsubdivided_fragment_count": 52, "remaining_semantic_denominator": "60 research-premise hunk fragments remain non-atomic; 8 subunits are review-only decomposition candidates and do not establish semantic atom coverage"}
    for key, value in atom_expected.items():
        if atom.get(key) != value: fail(errors, f"semantic_atomization {key}不一致")
    fragments = inventory.get("fragments"); fragments = fragments if isinstance(fragments, list) else []
    if len(fragments) != 60: fail(errors, f"fragments件数不一致: {len(fragments)}")
    seen = set(); inventory_hunks = []; counts = {"research_premise": 0, "unresolved": 0}
    for fragment in fragments:
        fid = fragment.get("fragment_id"); seen.add(fid); sid = fragment.get("source_revision_item_id"); path = fragment.get("source_path")
        if not isinstance(fid, str) or sid not in EXPECTED_IDS: fail(errors, f"fragment identity不正: {fid}"); continue
        if path != EXPECTED_PATHS[sid] or fragment.get("classification") != "research_premise" or fragment.get("candidate_kind") != "research_premise": fail(errors, f"{fid} path／classification不一致")
        if fragment.get("product_owner_candidate") != "unresolved" or fragment.get("secondary_consumer_candidate") is not None: fail(errors, f"{fid} owner候補不一致")
        if fragment.get("classification_unit") != "hunk_fragment" or fragment.get("hunk_level_classification_only") is not True or fragment.get("semantic_atomization_status") != "not_atomized": fail(errors, f"{fid} hunk／atom境界不一致")
        hold = fragment.get("compound_hunk_hold", {})
        if hold.get("hold_id") != f"RDP001-RESEARCH60-HOLD-{fid}" or hold.get("status") != "held_as_compound_hunk" or hold.get("semantic_atom_count") != 0: fail(errors, f"{fid} compound hold不一致")
        if not isinstance(fragment.get("normalized_statement"), str) or len(fragment["normalized_statement"]) < 20 or not fragment.get("unresolved_meaning") or not fragment.get("possible_conflicts") or not fragment.get("counterevidence"): fail(errors, f"{fid} review boundary／counterevidence欠落")
        counts["research_premise"] += 1; b = fragment.get("baseline", {}); p = fragment.get("pre_isolation", {}); inventory_hunks.append((path, b.get("start_line"), b.get("end_line"), p.get("start_line"), p.get("end_line")))
        bb = git_blob(BASELINE, path, errors); pb = git_blob(PRE_ISOLATION, path, errors)
        if bb is not None: check_span(errors, f"{fid} baseline", bb, b)
        if pb is not None: check_span(errors, f"{fid} pre-isolation", pb, p)
        if b.get("exact_text") == p.get("exact_text"): fail(errors, f"{fid} changed fragment textが同一")
        negative_ids = fragment.get("retained_negative_ids", [])
        if not negative_ids or not set(negative_ids).issubset(EXPECTED_NEGATIVES): fail(errors, f"{fid} retained negative不正")
        number = int(fid.rsplit("-", 1)[1]); subs = fragment.get("semantic_subunits", []); expected_subs = [f"{fid}-SU-01"] if number in REVIEW_ONLY_NUMBERS else []
        if [s.get("semantic_subunit_id") for s in subs] != expected_subs: fail(errors, f"{fid} review-only subunit集合不一致")
        for sub in subs:
            span = sub.get("source_span", {})
            if sub.get("semantic_status") != "review_only_candidate" or sub.get("owner_candidate") != "unresolved" or sub.get("candidate_kind") != "unresolved" or sub.get("source_fragment_id") != fid: fail(errors, f"{fid} review-only subunit境界不一致")
            if span.get("revision") != "pre_isolation" or span.get("commit") != PRE_ISOLATION: fail(errors, f"{fid} subunit revision不一致")
            if pb is not None: check_span(errors, f"{fid} review-only subunit", pb, span)
    if seen != {f"RDP001-RESEARCH60-DIFF-{n:03d}" for n in range(1, 61)}: fail(errors, "fragment ID集合不一致")
    if counts != {"research_premise": 60, "unresolved": 0}: fail(errors, f"classification counts不一致: {counts}")
    if sorted(inventory_hunks) != sorted(selected_hunks): fail(errors, "Git diff hunkとinventory spanの集合不一致")
    negatives = inventory.get("retained_negatives", []); negative_ids = {n.get("negative_id") for n in negatives if isinstance(n, dict)}
    if negative_ids != EXPECTED_NEGATIVES: fail(errors, "negative ID集合不一致")
    referenced = {n for f in fragments for n in f.get("retained_negative_ids", [])}
    if referenced != EXPECTED_NEGATIVES: fail(errors, "fragmentとnegativeの参照集合不一致")
    if errors:
        print("FAIL: RDP-001 research-premise next60-path candidate"); print("\n".join(f"- {e}" for e in errors)); return 1
    print("PASS: RDP-001 research-premise next60-path candidate (read-only static check)")
    print("integrated prior=24 files / 91 hunks; PR1946 selected=20 files / 21 hunks; PR1949 lineage=selected-origin-unmerged/rebaseline-integrated, 40 files / 40 hunks; before current selected=84 files / 152 hunks")
    print("current selected=60 files / 60 hunks; combined selected=144 files / 212 hunks; remaining=256 files / 280 hunks")
    print("hunk_classification_counts=research_premise:60; unresolved:0; semantic_atoms=0; compound_hunk_holds=60; review_only_subunits=8; fully_unsubdivided=52")
    print(f"authority_effect={inventory['authority_effect']}; semantic_equivalence={'unresolved' if inventory['equivalence_claim'] is None else inventory['equivalence_claim']}; legacy runtime/test/CI execution={comparison['old_runtime_test_ci_execution']}")
    return 0

if __name__ == "__main__": raise SystemExit(main())
