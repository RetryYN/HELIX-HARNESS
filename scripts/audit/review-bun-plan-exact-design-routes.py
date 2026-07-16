#!/usr/bin/env python3
"""Bun PLAN atomのexact design route候補を生成者と独立に全件監査する。"""

from __future__ import annotations

import argparse
import collections
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CANDIDATE = ROOT / "docs/governance/generated/helix-bun-plan-exact-design-route-candidates-v1.json"
OUTPUT = ROOT / "docs/governance/generated/helix-bun-plan-exact-design-route-independent-review-v1.json"
BUN_RE = re.compile(r"(?i)(?:\bbunx\b|\bbun\b|\bbun(?::sqlite|-unit|\.lockb?\b)|runner\s*:\s*[\"']?bun\b)")

AUTHORITIES = {
    "l1": ROOT / "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md",
    "l3": ROOT / "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md",
    "l4": ROOT / "docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md",
    "hat": ROOT / "docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md",
    "hst": ROOT / "docs/test-design/helix/L10-infinity-loop-platform-system-test-design.md",
    "adjudication": ROOT / "docs/governance/generated/helix-bun-plan-semantic-adjudication-v1.json",
    "inventory": ROOT / "docs/governance/generated/helix-bun-surface-inventory-v1.json",
}

FAMILY_CONTRACTS = {
    "runtime_command": ({"HIL-FR-59", "HIL-FR-60", "HIL-TR-13", "HIL-NFR-37", "HIL-NFR-38"}, {"CanonicalActionIntentNormalizer", "BoundedActionExecutor"}, {"HAT-HIL-24"}, {"HST-HIL-039"}),
    "test_verification": ({"HIL-FR-26", "HIL-TR-10", "HIL-NFR-08", "HIL-NFR-13"}, {"EvidenceProvenanceGate", "DeterminismGate"}, {"HAT-HIL-10"}, {"HST-HIL-009"}),
    "ci_hook": ({"HIL-BR-16", "HIL-FR-28", "HIL-NFR-15", "HIL-BR-02", "HIL-FR-02"}, {"ThreeStageCiOrchestrator", "GitHubEventBridge"}, {"HAT-HIL-06"}, {"HST-HIL-003", "HST-HIL-004"}),
    "package_distribution": ({"HIL-TR-04", "HIL-TR-05", "HIL-TR-06", "HIL-NFR-05", "HIL-NFR-06", "HIL-NFR-09", "HIL-NFR-19"}, {"SupplyChainVerifier", "OsCompletionGate"}, {"HAT-HIL-14"}, {"HST-HIL-014", "HST-HIL-017"}),
    "database_state": ({"HIL-FR-25", "HIL-FR-26", "HIL-TR-09", "HIL-TR-10", "HIL-NFR-13"}, {"HarnessDbPort", "HarnessDbProjection"}, {"HAT-HIL-10", "HAT-HIL-11"}, {"HST-HIL-009", "HST-HIL-010"}),
    "design_governance": ({"HIL-BR-21", "HIL-BR-22", "HIL-BR-24", "HIL-BR-25", "HIL-FR-39", "HIL-FR-41", "HIL-FR-42", "HIL-FR-45", "HIL-FR-49"}, {"DesignObligationPlanner", "RequirementDefinitionLedger"}, {"HAT-HIL-16", "HAT-HIL-17", "HAT-HIL-18", "HAT-HIL-19", "HAT-HIL-25"}, {"HST-HIL-025", "HST-HIL-026", "HST-HIL-027", "HST-HIL-029", "HST-HIL-030", "HST-HIL-031", "HST-HIL-032", "HST-HIL-033", "HST-HIL-034", "HST-HIL-040"}),
    "memory_handover": ({"HIL-BR-03", "HIL-BR-10", "HIL-FR-10", "HIL-FR-32"}, {"MemoryCompactionCoordinator", "AgentLifecycleController"}, {"HAT-HIL-02", "HAT-HIL-07", "HAT-HIL-08"}, {"HST-HIL-001", "HST-HIL-006", "HST-HIL-015"}),
    "adapter_setup": ({"HIL-FR-12", "HIL-FR-34", "HIL-TR-05", "HIL-NFR-09", "HIL-NFR-10"}, {"AgentSyncGuard", "OsAdapter"}, {"HAT-HIL-08", "HAT-HIL-14"}, {"HST-HIL-006", "HST-HIL-014"}),
    "visual_design": ({"HIL-BR-13", "HIL-FR-17", "HIL-FR-18", "HIL-FR-19", "HIL-FR-20", "HIL-FR-64"}, {"ScreenApplicabilityGate", "PrototypeBuilder"}, {"HAT-HIL-15", "HAT-HIL-19", "HAT-HIL-30"}, {"HST-HIL-012", "HST-HIL-024", "HST-HIL-034"}),
}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def semantic_layer(text: str, source_path: str, plan_status: str) -> str:
    value = text.lower()
    rules = [
        ("ci_hook", ("ci", "github action", "hook", "pretool", "posttool")),
        ("test_verification", ("test", "vitest", "coverage", "verify", "検証")),
        ("package_distribution", ("package", "lockfile", "install", "distribution", "配布")),
        ("database_state", ("sqlite", "database", "harness.db", "migration")),
        ("runtime_command", ("bun run", "bunx", "command", "cli", "実行")),
        ("design_plan_reference", ("plan", "設計", "要件", "roadmap")),
    ]
    for label, needles in rules:
        if any(token in value for token in needles):
            return label
    if plan_status != "confirmed":
        return "unclassified_context"
    path = source_path.lower()
    path_rules = [
        ("test_verification", r"(?:green-command|test-report|verification-evidence)"),
        ("database_state", r"(?:projection-writer|db-projection)"),
        ("runtime_command", r"(?:effort-observation)"),
        ("visual_design", r"(?:visual|visualization|ui-standard|ux-verification|web-dashboard)"),
        ("memory_handover", r"(?:memory|handover|feedback|session-log|forced-stop|journal|post-deploy|operations-feedback)"),
        ("adapter_setup", r"(?:setup|adapter|work-guard|biome|config-dependency|destructive-command|solo-conversion|delegation-brief)"),
        ("design_governance", r"(?:design|requirement|vmodel|vpair|pair|route|gate|governance|review|quality|branch|backprop|backfill|artifact|skill|tdd|verification|pillar|workflow|elicitation|version-up|convergence|technical|agent|orchestration|durability|message-catalog|plan-entry|deliverable|errata)"),
    ]
    for label, pattern in path_rules:
        if re.search(pattern, path):
            return label
    return "unclassified_context"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    candidate = json.loads(CANDIDATE.read_text(encoding="utf-8"))
    texts = {key: path.read_text(encoding="utf-8") for key, path in AUTHORITIES.items()}
    adjudication = {row["atom_id"]: row for row in json.loads(texts["adjudication"])["records"]}
    inventory = {row["id"]: row for row in json.loads(texts["inventory"])["records"]}
    findings = []
    layers = collections.Counter()
    issue_counts = collections.Counter()
    fingerprints: dict[tuple, set[str]] = collections.defaultdict(set)

    for row in candidate["records"]:
        fingerprint = (
            tuple(row["requirement_route"]["requirement_ids"]),
            tuple(row["functional_route"]["requirement_ids"]),
            tuple(component["stable_component_or_symbol"] for component in row["component_route_candidates"]),
            tuple(row["acceptance_oracle_route"]["oracle_ids"]),
            tuple(row["system_oracle_route"]["oracle_ids"]),
        )
        fingerprints[fingerprint].add(row["semantic_family"])

    for row in candidate["records"]:
        atom = row["atom_id"]
        source_path = ROOT / row["source"]["artifact_path"]
        line_no = row["source"]["line"]
        source_lines = source_path.read_text(encoding="utf-8", errors="replace").splitlines() if source_path.exists() else []
        line = source_lines[line_no - 1] if 0 < line_no <= len(source_lines) else ""
        inv = inventory.get(atom)
        adj = adjudication.get(atom)
        context = "\n".join(filter(None, [line, inv.get("context", "") if inv else "", adj.get("section_heading", "") if adj else ""]))
        evidence_paths = (row.get("semantic_classification_evidence") or {}).get("linked_paths", [])
        layer = semantic_layer(context, row["source"]["artifact_path"] + " " + " ".join(evidence_paths), (adj or {}).get("plan_status") or "")
        layers[layer] += 1
        issues = []

        if not source_path.exists() or not line:
            issues.append("source_coordinate_missing")
        if not inv or not adj or row["source_atom_sha256"] != (adj or {}).get("source_atom_sha256"):
            issues.append("source_atom_binding_mismatch")
        if row["current_bun_syntax_observed"] != bool(BUN_RE.search(context)):
            issues.append("source_grammar_observation_mismatch")
        references = [
            (texts["l1"], row["requirement_route"]["requirement_ids"] + row["requirement_route"]["contextual_requirement_ids"], "l1_reference_missing"),
            (texts["l3"], row["functional_route"]["requirement_ids"] + row["functional_route"]["acceptance_condition_ids"], "l3_reference_missing"),
            (texts["hat"], row["acceptance_oracle_route"]["oracle_ids"], "hat_reference_missing"),
            (texts["hst"], row["system_oracle_route"]["oracle_ids"], "hst_reference_missing"),
        ]
        for authority, ids, code in references:
            if any(identifier not in authority for identifier in ids):
                issues.append(code)
        if any(component["stable_component_or_symbol"] not in texts["l4"] for component in row["component_route_candidates"]):
            issues.append("l4_component_missing")
        if row.get("semantic_family") != layer:
            issues.append("semantic_family_source_mismatch")
        classification_evidence = row.get("semantic_classification_evidence") or {}
        if classification_evidence.get("plan_status") != (adj or {}).get("plan_status") or not classification_evidence.get("context_sha256"):
            issues.append("semantic_classification_evidence_incomplete")
        contract = FAMILY_CONTRACTS.get(layer)
        components = {component["stable_component_or_symbol"] for component in row["component_route_candidates"]}
        if contract:
            expected_requirements, expected_components, expected_hat, expected_hst = contract
            if not expected_requirements.issubset(set(row["requirement_route"]["requirement_ids"])):
                issues.append("family_requirement_route_mismatch")
            if components != expected_components:
                issues.append("family_component_route_mismatch")
            if set(row["acceptance_oracle_route"]["oracle_ids"]) != expected_hat:
                issues.append("family_hat_route_mismatch")
            if set(row["system_oracle_route"]["oracle_ids"]) != expected_hst:
                issues.append("family_hst_route_mismatch")
            routed_l3 = "\n".join(line for line in texts["l3"].splitlines() if any(identifier in line for identifier in row["requirement_route"]["requirement_ids"]))
            expected_hr = set(re.findall(r"HR-FR-HIL-\d+", routed_l3))
            expected_hac = set(re.findall(r"HAC-HIL-\d+[a-z]", "\n".join(line for line in texts["l3"].splitlines() if any(identifier in line for identifier in expected_hr))))
            if set(row["functional_route"]["requirement_ids"]) != expected_hr or set(row["functional_route"]["acceptance_condition_ids"]) != expected_hac:
                issues.append("family_hr_hac_route_mismatch")
            if row["route_specificity"] != "family_specific_primary_route" or not row["route_complete_candidate"] or row.get("challenge_gap_obligation") is not None:
                issues.append("classified_family_completion_state_invalid")
        else:
            challenge = row.get("challenge_gap_obligation")
            if layer != "unclassified_context" or row["route_specificity"] != "challenge_gap_obligation" or row["route_complete_candidate"] or not row.get("semantic_route_required"):
                issues.append("unclassified_challenge_state_invalid")
            if any((row["requirement_route"]["requirement_ids"], row["functional_route"]["requirement_ids"], row["functional_route"]["acceptance_condition_ids"], row["component_route_candidates"], row["acceptance_oracle_route"]["oracle_ids"], row["system_oracle_route"]["oracle_ids"])):
                issues.append("unclassified_challenge_guessed_primary_route")
            if not challenge or not challenge.get("must_not_guess") or challenge.get("owner_component") != "DesignObligationPlanner":
                issues.append("unclassified_challenge_obligation_incomplete")
        fingerprint = (
            tuple(row["requirement_route"]["requirement_ids"]), tuple(row["functional_route"]["requirement_ids"]),
            tuple(component["stable_component_or_symbol"] for component in row["component_route_candidates"]),
            tuple(row["acceptance_oracle_route"]["oracle_ids"]), tuple(row["system_oracle_route"]["oracle_ids"]),
        )
        if len(fingerprints[fingerprint]) > 1:
            issues.append("generic_fingerprint_crosses_semantic_families")
        if any(component["stable_component_or_symbol"] == "PythonWorkerBroker" for component in row["component_route_candidates"]):
            issues.append("python_component_keyword_only_not_closed_capability")
        if row.get("python_closed_capability_evidence"):
            issues.append("python_closed_capability_candidate_present")
        if row["replacement_kind_candidate"] == "python_proposal_worker":
            issues.append("python_replacement_without_closed_capability_receipt")
        if row["replacement_kind_candidate"] == "retire" and row.get("authority_receipt") is None:
            issues.append("retire_without_unreachability_receipt")
        if row.get("verified") or row.get("coverage_credit") or row.get("authority_receipt") is not None:
            issues.append("forbidden_evidence_credit")

        for issue in set(issues):
            issue_counts[issue] += 1
        findings.append({
            "atom_id": atom,
            "source": row["source"],
            "source_atom_sha256": row["source_atom_sha256"],
            "semantic_layer": layer,
            "replacement_kind_candidate": row["replacement_kind_candidate"],
            "checks": {
                "source_coordinate_exists": bool(source_path.exists() and line),
                "source_atom_binding_matches": bool(inv and adj and row["source_atom_sha256"] == adj.get("source_atom_sha256")),
                "grammar_observation_matches": row["current_bun_syntax_observed"] == bool(BUN_RE.search(context)),
                "referenced_ids_exist": not any(code in issues for code in ("l1_reference_missing", "l3_reference_missing", "hat_reference_missing", "hst_reference_missing")),
                "component_symbols_exist": "l4_component_missing" not in issues,
                "family_semantic_route_matches": not any(code in issues for code in ("semantic_family_source_mismatch", "family_requirement_route_mismatch", "family_component_route_mismatch", "family_hat_route_mismatch", "family_hst_route_mismatch", "family_hr_hac_route_mismatch")),
            },
            "issues": sorted(set(issues)),
            "disposition": "challenge_gap_not_complete" if layer == "unclassified_context" else ("candidate_correction_required" if issues else "family_candidate_consistent_not_verified"),
            "verified": False,
            "coverage_credit": False,
            "authority_receipt": None,
        })

    record_count = len(candidate["records"])
    payload = {
        "schema_version": "helix.bun-plan-exact-design-route-independent-review.v1",
        "status": "independent_review_pass_classified_and_challenge_fail_closed_not_verified" if not issue_counts else "independent_review_correction_required_not_verified",
        "source_artifacts": {
            "candidate": {"path": str(CANDIDATE.relative_to(ROOT)), "sha256": sha(CANDIDATE)},
            **{key: {"path": str(path.relative_to(ROOT)), "sha256": sha(path)} for key, path in AUTHORITIES.items()},
        },
        "scope": {"records_reviewed": record_count, "records_expected": 2210, "reviewer_relation": "independent_of_candidate_generator"},
        "summary": {
            "records_with_findings": sum(bool(row["issues"]) for row in findings),
            "issue_counts": dict(sorted(issue_counts.items())),
            "semantic_layers": dict(sorted(layers.items())),
            "primary_route_fingerprint_count": len(fingerprints),
            "cross_family_fingerprint_count": sum(len(families) > 1 for families in fingerprints.values()),
            "route_complete_candidates": sum(bool(row.get("route_complete_candidate")) for row in candidate["records"]),
            "classified_family_routes": sum(row.get("route_specificity") == "family_specific_primary_route" for row in candidate["records"]),
            "unclassified_challenge_obligations": sum(row.get("route_specificity") == "challenge_gap_obligation" for row in candidate["records"]),
            "python_worker_candidates": sum(row.get("replacement_kind_candidate") == "python_proposal_worker" or row.get("python_closed_capability_evidence") for row in candidate["records"]),
        },
        "decision": "5 classified familyはfamily固有routeとして審査し、unclassified contextは推測routeを作らずchallenge obligationのまま保持する。共通Bun cutover edgeはprimary completionへ数えない。",
        "execution": {"implemented": 0, "executed": 0, "verified": 0, "coverage_credit": False, "authority_receipts": 0},
        "findings": findings,
    }
    assert record_count == 2210
    assert not any(row["verified"] or row["coverage_credit"] or row["authority_receipt"] for row in findings)
    encoded = (json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_bytes() != encoded:
            print(f"STALE: {OUTPUT.relative_to(ROOT)}")
            return 1
        print(f"OK: {OUTPUT.relative_to(ROOT)}")
        return 0
    OUTPUT.write_bytes(encoded)
    print(f"WROTE: {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
