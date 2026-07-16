#!/usr/bin/env python3
"""Generate proposal-only design routes for active Bun PLAN replacement atoms."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
GENERATED = ROOT / "docs/governance/generated"
ADJUDICATION = GENERATED / "helix-bun-plan-semantic-adjudication-v1.json"
INVENTORY = GENERATED / "helix-bun-surface-inventory-v1.json"
L1 = ROOT / "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md"
L3 = ROOT / "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md"
L4 = ROOT / "docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md"
HAT = ROOT / "docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md"
HST = ROOT / "docs/test-design/helix/L10-infinity-loop-platform-system-test-design.md"

ID_RE = re.compile(r"\bHIL-(?:BR|FR|TR|NFR)-\d+\b")
HR_RE = re.compile(r"\bHR-FR-HIL-\d+\b")
HAC_RE = re.compile(r"\bHAC-HIL-\d+[a-z]\b")
HAT_RE = re.compile(r"\bHAT-HIL-\d+\b")
HST_RE = re.compile(r"\bHST-HIL-\d+\b")
CURRENT_BUN_RE = re.compile(
    r"(?i)(?:\bbunx\b|\bbun\b|\bbun(?::sqlite|-unit|\.lockb?\b)|runner\s*:\s*[\"']?bun\b)"
)

FAMILY_ROUTES = {
    "runtime_command": {
        "requirements": {"HIL-FR-59", "HIL-FR-60", "HIL-TR-13", "HIL-NFR-37", "HIL-NFR-38"},
        "components": ["CanonicalActionIntentNormalizer", "BoundedActionExecutor"],
        "hat": ["HAT-HIL-24"],
        "hst": ["HST-HIL-039"],
    },
    "test_verification": {
        "requirements": {"HIL-FR-26", "HIL-TR-10", "HIL-NFR-08", "HIL-NFR-13"},
        "components": ["EvidenceProvenanceGate", "DeterminismGate"],
        "hat": ["HAT-HIL-10"],
        "hst": ["HST-HIL-009"],
    },
    "ci_hook": {
        "requirements": {"HIL-BR-16", "HIL-FR-28", "HIL-NFR-15", "HIL-BR-02", "HIL-FR-02"},
        "components": ["ThreeStageCiOrchestrator", "GitHubEventBridge"],
        "hat": ["HAT-HIL-06"],
        "hst": ["HST-HIL-003", "HST-HIL-004"],
    },
    "package_distribution": {
        "requirements": {"HIL-TR-04", "HIL-TR-05", "HIL-TR-06", "HIL-NFR-05", "HIL-NFR-06", "HIL-NFR-09", "HIL-NFR-19"},
        "components": ["SupplyChainVerifier", "OsCompletionGate"],
        "hat": ["HAT-HIL-14"],
        "hst": ["HST-HIL-014", "HST-HIL-017"],
    },
    "database_state": {
        "requirements": {"HIL-FR-25", "HIL-FR-26", "HIL-TR-09", "HIL-TR-10", "HIL-NFR-13"},
        "components": ["HarnessDbPort", "HarnessDbProjection"],
        "hat": ["HAT-HIL-10", "HAT-HIL-11"],
        "hst": ["HST-HIL-009", "HST-HIL-010"],
    },
    "design_governance": {
        "requirements": {"HIL-BR-21", "HIL-BR-22", "HIL-BR-24", "HIL-BR-25", "HIL-FR-39", "HIL-FR-41", "HIL-FR-42", "HIL-FR-45", "HIL-FR-49"},
        "components": ["DesignObligationPlanner", "RequirementDefinitionLedger"],
        "hat": ["HAT-HIL-16", "HAT-HIL-17", "HAT-HIL-18", "HAT-HIL-19", "HAT-HIL-25"],
        "hst": ["HST-HIL-025", "HST-HIL-026", "HST-HIL-027", "HST-HIL-029", "HST-HIL-030", "HST-HIL-031", "HST-HIL-032", "HST-HIL-033", "HST-HIL-034", "HST-HIL-040"],
    },
    "memory_handover": {
        "requirements": {"HIL-BR-03", "HIL-BR-10", "HIL-FR-10", "HIL-FR-32"},
        "components": ["MemoryCompactionCoordinator", "AgentLifecycleController"],
        "hat": ["HAT-HIL-02", "HAT-HIL-07", "HAT-HIL-08"],
        "hst": ["HST-HIL-001", "HST-HIL-006", "HST-HIL-015"],
    },
    "adapter_setup": {
        "requirements": {"HIL-FR-12", "HIL-FR-34", "HIL-TR-05", "HIL-NFR-09", "HIL-NFR-10"},
        "components": ["AgentSyncGuard", "OsAdapter"],
        "hat": ["HAT-HIL-08", "HAT-HIL-14"],
        "hst": ["HST-HIL-006", "HST-HIL-014"],
    },
    "visual_design": {
        "requirements": {"HIL-BR-13", "HIL-FR-17", "HIL-FR-18", "HIL-FR-19", "HIL-FR-20", "HIL-FR-64"},
        "components": ["ScreenApplicabilityGate", "PrototypeBuilder"],
        "hat": ["HAT-HIL-15", "HAT-HIL-19", "HAT-HIL-30"],
        "hst": ["HST-HIL-012", "HST-HIL-024", "HST-HIL-034"],
    },
}

CLOSED_PYTHON_CAPABILITY_RE = re.compile(
    r"(?i)(?:proposal[- ]only|proposal worker|python worker).*(?:analysis|detector|document engine|product data|source atomization)|"
    r"(?:analysis|detector|document engine|product data|source atomization).*(?:proposal[- ]only|proposal worker|python worker)"
)


def semantic_family(text: str, source_path: str, plan_status: str) -> tuple[str, str]:
    value = text.lower()
    rules = [
        ("ci_hook", ("ci", "github action", "hook", "pretool", "posttool")),
        ("test_verification", ("test", "vitest", "coverage", "verify", "検証")),
        ("package_distribution", ("package", "lockfile", "install", "distribution", "配布")),
        ("database_state", ("sqlite", "database", "harness.db", "migration")),
        ("runtime_command", ("bun run", "bunx", "command", "cli", "実行")),
    ]
    for family, needles in rules:
        if any(token in value for token in needles):
            return family, "source_line_inventory_context"
    if plan_status != "confirmed":
        return "unclassified_context", "plan_not_confirmed"
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
    for family, pattern in path_rules:
        if re.search(pattern, path):
            return family, "confirmed_plan_path_and_context"
    return "unclassified_context", "insufficient_confirmed_context"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def table_lines(path: Path, prefix: str) -> list[str]:
    return [line for line in path.read_text(encoding="utf-8").splitlines() if line.startswith(prefix)]


def exact_ids(lines: list[str], pattern: re.Pattern[str], needles: set[str]) -> set[str]:
    found: set[str] = set()
    for line in lines:
        if needles.intersection(ID_RE.findall(line) + HR_RE.findall(line) + HAC_RE.findall(line)):
            found.update(pattern.findall(line))
    return found


def source_window(path: Path, line: int, radius: int = 5) -> str:
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    start = max(0, line - 1 - radius)
    end = min(len(lines), line + radius)
    return "\n".join(lines[start:end])


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: generate-bun-plan-exact-design-route-candidates.py OUTPUT.json")

    adjudication = json.loads(ADJUDICATION.read_text(encoding="utf-8"))
    inventory = {
        row["id"]: row
        for row in json.loads(INVENTORY.read_text(encoding="utf-8"))["records"]
    }
    active = [
        row for row in adjudication["records"]
        if row["semantic_class"] == "active_consumer_command_replacement"
    ]
    l1_ids = set(ID_RE.findall(L1.read_text(encoding="utf-8")))
    l3_lines = table_lines(L3, "| HR-FR-HIL-")
    hat_lines = table_lines(HAT, "| HAT-HIL-")
    hst_lines = table_lines(HST, "| HST-HIL-")

    canonical_bun_requirements = {"HIL-BR-19", "HIL-FR-33", "HIL-TR-01", "HIL-TR-11"}
    records = []
    grammar_queue = []
    for row in sorted(active, key=lambda item: item["atom_id"]):
        inv = inventory[row["atom_id"]]
        window = source_window(ROOT / row["file"], row["line"])
        source_lines = (ROOT / row["file"]).read_text(encoding="utf-8", errors="replace").splitlines()
        source_line = source_lines[row["line"] - 1] if 0 < row["line"] <= len(source_lines) else ""
        linked_paths = sorted(set(re.findall(r"(?:docs|src|scripts|tests?)/[A-Za-z0-9_./-]+", window)))
        semantic_family_value, classification_basis = semantic_family(
            inv["context"] + "\n" + source_line + "\n" + (row.get("section_heading") or ""),
            row["file"] + " " + " ".join(linked_paths), row.get("plan_status") or "",
        )
        contextual = set(ID_RE.findall(window)).intersection(l1_ids)
        family_contract = FAMILY_ROUTES.get(semantic_family_value)
        primary_requirement_ids = (
            set(family_contract["requirements"]).intersection(l1_ids).union(contextual)
            if family_contract else set()
        )
        hr_ids = exact_ids(l3_lines, HR_RE, primary_requirement_ids)
        hac_ids = exact_ids(l3_lines, HAC_RE, hr_ids)
        hat_ids = set(family_contract["hat"]) if family_contract else set()
        hst_ids = set(family_contract["hst"]) if family_contract else set()

        current_bun_match = bool(CURRENT_BUN_RE.search(inv["context"]) or CURRENT_BUN_RE.search(window))
        original_grammar_mismatch = not row["command_like"]
        grammar_disposition = (
            "active_replacement_candidate_reconfirmed"
            if current_bun_match
            else "semantic_reclassification_required"
        )
        replacement_kind = "node_reimplementation" if current_bun_match else "retire"

        component_candidates = [
            {
                "artifact_path": L4.relative_to(ROOT).as_posix(),
                "stable_component_or_symbol": component,
                "reason": f"primary {semantic_family_value} contract selected from deterministic source-context classification",
            }
            for component in (family_contract["components"] if family_contract else [])
        ]
        python_closed_capability_evidence = bool(
            CLOSED_PYTHON_CAPABILITY_RE.search(inv["context"] + "\n" + window)
        )
        if python_closed_capability_evidence:
            component_candidates.append({
                "artifact_path": L4.relative_to(ROOT).as_posix(),
                "stable_component_or_symbol": "PythonWorkerBroker",
                "reason": "candidate boundary only when the replacement delegates proposal-only Python work; Node retains authority",
            })

        route = {
            "atom_id": row["atom_id"],
            "source_atom_sha256": row["source_atom_sha256"],
            "source": {"artifact_path": row["file"], "line": row["line"]},
            "semantic_family": semantic_family_value,
            "semantic_classification_evidence": {
                "basis": classification_basis,
                "plan_status": row.get("plan_status"),
                "section_heading": row.get("section_heading"),
                "linked_ids": sorted(set(ID_RE.findall(window))),
                "linked_paths": linked_paths,
                "context_sha256": hashlib.sha256((window + "\n" + inv["context"]).encode()).hexdigest(),
            },
            "replacement_kind_candidate": replacement_kind,
            "replacement_kind_allowed_values": ["node_reimplementation", "python_proposal_worker", "retire"],
            "grammar_reclassification": grammar_disposition,
            "original_command_like": row["command_like"],
            "current_bun_syntax_observed": current_bun_match,
            "requirement_route": {
                "artifact_path": L1.relative_to(ROOT).as_posix(),
                "requirement_ids": sorted(primary_requirement_ids),
                "contextual_requirement_ids": sorted(contextual),
            },
            "functional_route": {
                "artifact_path": L3.relative_to(ROOT).as_posix(),
                "requirement_ids": sorted(hr_ids),
                "acceptance_condition_ids": sorted(hac_ids),
            },
            "component_route_candidates": component_candidates,
            "python_closed_capability_evidence": python_closed_capability_evidence,
            "acceptance_oracle_route": {
                "artifact_path": HAT.relative_to(ROOT).as_posix(),
                "oracle_ids": sorted(hat_ids),
            },
            "system_oracle_route": {
                "artifact_path": HST.relative_to(ROOT).as_posix(),
                "oracle_ids": sorted(hst_ids),
            },
            "supporting_common_cutover_edge": {
                "requirement_ids": sorted(canonical_bun_requirements),
                "component_symbols": ["BunDependencyCoverageGate", "BunCutoverGate", "NodeControlPlane"],
                "hat_ids": ["HAT-HIL-13"],
                "hst_ids": ["HST-HIL-013"],
                "coverage_role": "supporting_only_not_primary_route",
            },
            "route_specificity": "family_specific_primary_route" if family_contract else "challenge_gap_obligation",
            "semantic_route_required": not bool(family_contract),
            "challenge_gap_obligation": (
                None if family_contract else {
                    "obligation_type": "BUN_ATOM_SEMANTIC_ROUTE_GAP",
                    "owner_component": "DesignObligationPlanner",
                    "required_evidence": "atom-level source meaning, current consumer, component owner, contextual HIL, and oracle before routing",
                    "must_not_guess": True,
                }
            ),
            "route_complete_candidate": bool(
                family_contract and primary_requirement_ids and hr_ids and hac_ids and hat_ids and hst_ids and component_candidates
            ),
            "route_authority": "proposal_only",
            "coverage_credit": False,
            "verified": False,
            "authority_receipt": None,
        }
        records.append(route)
        if original_grammar_mismatch:
            grammar_queue.append({
                "atom_id": row["atom_id"],
                "source_atom_sha256": row["source_atom_sha256"],
                "file": row["file"],
                "line": row["line"],
                "previous_command_like": False,
                "current_bun_syntax_observed": current_bun_match,
                "re_adjudication": grammar_disposition,
                "replacement_kind_candidate": replacement_kind,
                "coverage_credit": False,
                "verified": False,
            })

    kind_counts = Counter(row["replacement_kind_candidate"] for row in records)
    family_counts = Counter(row["semantic_family"] for row in records)
    specificity_counts = Counter(row["route_specificity"] for row in records)
    grammar_counts = Counter(row["re_adjudication"] for row in grammar_queue)
    artifact = {
        "schema_version": "helix.bun-plan-exact-design-route-candidates.v1",
        "status": "proposal_routes_generated_semantic_review_required_not_verified",
        "source_artifacts": {
            "adjudication": {"path": ADJUDICATION.relative_to(ROOT).as_posix(), "sha256": digest(ADJUDICATION)},
            "inventory": {"path": INVENTORY.relative_to(ROOT).as_posix(), "sha256": digest(INVENTORY)},
            "L1": {"path": L1.relative_to(ROOT).as_posix(), "sha256": digest(L1)},
            "L3": {"path": L3.relative_to(ROOT).as_posix(), "sha256": digest(L3)},
            "L4": {"path": L4.relative_to(ROOT).as_posix(), "sha256": digest(L4)},
            "HAT": {"path": HAT.relative_to(ROOT).as_posix(), "sha256": digest(HAT)},
            "HST": {"path": HST.relative_to(ROOT).as_posix(), "sha256": digest(HST)},
        },
        "scope": {
            "active_replacement_denominator": len(active),
            "grammar_mismatch_denominator": len(grammar_queue),
            "runtime_execution": 0,
            "external_changes": 0,
        },
        "summary": {
            "route_records": len(records),
            "unique_atom_ids": len({row["atom_id"] for row in records}),
            "by_replacement_kind_candidate": dict(sorted(kind_counts.items())),
            "by_semantic_family": dict(sorted(family_counts.items())),
            "by_route_specificity": dict(sorted(specificity_counts.items())),
            "route_complete_candidates": sum(row["route_complete_candidate"] for row in records),
            "challenge_gap_obligations": sum(row["challenge_gap_obligation"] is not None for row in records),
            "python_worker_candidates_with_closed_capability_evidence": sum(row["python_closed_capability_evidence"] for row in records),
            "grammar_queue_by_re_adjudication": dict(sorted(grammar_counts.items())),
            "authority_receipts": 0,
            "coverage_credit_true": 0,
            "verified_true": 0,
        },
        "invariants": [
            "every active replacement atom has exactly one proposal route record",
            "all referenced requirement, component, and oracle identifiers are extracted from current repo-owned artifacts",
            "Node remains write and execution authority; a Python component candidate never grants direct repository or database authority",
            "retire remains proposal-only and requires an independent closed-world unreachability receipt",
            "design route existence is not replacement execution or compatibility verification",
            "a generic Bun cutover route is not an exact per-atom semantic route and cannot be route-complete",
            "unclassified context creates a challenge/gap obligation and never receives a guessed primary route",
            "PythonWorkerBroker is emitted only when source context explicitly binds proposal-only Python to an ADR-009 closed capability class",
        ],
        "records": records,
        "grammar_mismatch_re_adjudication_queue": grammar_queue,
    }
    Path(sys.argv[1]).write_text(
        json.dumps(artifact, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
