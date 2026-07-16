#!/usr/bin/env python3
"""Close DF-BUN-002 with exact routes and fail-closed Design receipts."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import re
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
GENERATED = ROOT / "docs/governance/generated"
STALE = GENERATED / "helix-bun-historical-stale-adjudication-v1.json"
STALE_REVIEW = GENERATED / "helix-bun-historical-stale-adjudication-independent-review-v1.json"
RETAIN_REVIEW = GENERATED / "helix-bun-historical-retain-evidence-independent-review-v1.json"
RETAIN_READJUDICATION = GENERATED / "helix-bun-historical-retain-evidence-readjudication-v1.json"
INVENTORY = GENERATED / "helix-bun-surface-inventory-v1.json"
ROUTE_GENERATOR = ROOT / "scripts/audit/generate-bun-plan-exact-design-route-candidates.py"
L1 = ROOT / "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md"
L3 = ROOT / "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md"
L4 = ROOT / "docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md"
HAT = ROOT / "docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md"
HST = ROOT / "docs/test-design/helix/L10-infinity-loop-platform-system-test-design.md"
ACTIVE_ATOM_FAMILY = {
    "BUN-ATOM-00814": ("design_governance", "typed-spec source contract is the exact current target"),
    "BUN-ATOM-01455": ("design_governance", "refactor-candidate design decision source is the exact current target"),
    "BUN-ATOM-01456": ("database_state", "state projection writer is the exact current target"),
    "BUN-ATOM-01457": ("design_governance", "Refactor mode process contract is the exact current target"),
    "BUN-ATOM-03098": ("ci_hook", "lint wiring gate test is the exact current target"),
    "BUN-ATOM-03099": ("design_governance", "design-language governance test is the exact current target"),
    "BUN-ATOM-03100": ("runtime_command", "doctor command entry component is the exact current target"),
}
RETIRE_ATOM_OWNER = {
    "BUN-ATOM-04081": "EvidenceProvenanceGate",
    "BUN-ATOM-04083": "EvidenceProvenanceGate",
    "BUN-ATOM-04085": "EvidenceProvenanceGate",
    "BUN-ATOM-04173": "AgentLifecycleController",
    "BUN-ATOM-04177": "EvidenceProvenanceGate",
    "BUN-ATOM-04195": "BoundedActionExecutor",
    "BUN-ATOM-05156": "MemoryCompactionCoordinator",
    "BUN-ATOM-05157": "MemoryCompactionCoordinator",
}


def sha_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def digest(value: object) -> str:
    return sha_bytes(json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True).encode())


def source(path: Path) -> dict[str, str]:
    return {"path": path.relative_to(ROOT).as_posix(), "sha256": sha_bytes(path.read_bytes())}


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def load_route_module():
    spec = importlib.util.spec_from_file_location("bun_exact_routes", ROUTE_GENERATOR)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load exact route generator")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def window(path: Path, line: int, radius: int = 5) -> str:
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    return "\n".join(lines[max(0, line - 1 - radius):min(len(lines), line + radius)])


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: generate-df-bun-002-terminal-design-receipts.py OUTPUT.json")
    output_path = Path(sys.argv[1])
    if not output_path.is_absolute():
        output_path = ROOT / output_path

    stale = load(STALE)
    stale_review = load(STALE_REVIEW)
    retain_review = load(RETAIN_REVIEW)
    retain_readjudication = load(RETAIN_READJUDICATION)
    retain_by_id = {row["atom_id"]: row for row in retain_readjudication["records"]}
    inventory = {row["id"]: row for row in load(INVENTORY)["records"]}
    stale_by_id = {row["atom_id"]: row for row in stale["records"]}
    route_module = load_route_module()

    active_findings = sorted(
        (row for row in stale_review["findings"] if row["adjudication"] == "active_reclassify"),
        key=lambda row: row["atom_id"],
    )
    retire_findings = sorted(
        (row for row in stale_review["findings"] if row["adjudication"] == "stale_orphan_retire_candidate"),
        key=lambda row: row["atom_id"],
    )
    retain_findings = sorted(
        (
            row for row in retain_review["findings"]
            if row["review_decision"] in {"challenge_supported", "retain_overclassified_challenge_required"}
        ),
        key=lambda row: row["atom_id"],
    )
    if (len(active_findings), len(retire_findings), len(retain_findings)) != (7, 8, 73):
        raise SystemExit("DF-BUN-002 denominator drift")

    l1_ids = set(route_module.ID_RE.findall(L1.read_text(encoding="utf-8")))
    l3_lines = route_module.table_lines(L3, "| HR-FR-HIL-")
    active_routes = []
    for finding in active_findings:
        atom_id = finding["atom_id"]
        base = stale_by_id[atom_id]
        if atom_id not in inventory:
            raise SystemExit(f"inventory binding missing: {atom_id}")
        source_path = ROOT / finding["source"]["path"]
        source_window = window(source_path, finding["source"]["line"])
        family, basis = ACTIVE_ATOM_FAMILY[atom_id]
        contract = route_module.FAMILY_ROUTES.get(family)
        if not contract:
            raise SystemExit(f"active route has no family contract: {atom_id}")
        contextual = set(route_module.ID_RE.findall(source_window)).intersection(l1_ids)
        hil = set(contract["requirements"]).intersection(l1_ids).union(contextual)
        hr = route_module.exact_ids(l3_lines, route_module.HR_RE, hil)
        hac = route_module.exact_ids(l3_lines, route_module.HAC_RE, hr)
        linked_paths = sorted(set(re.findall(r"(?:docs|src|scripts|tests?)/[A-Za-z0-9_./-]+", source_window)))
        route_body = {
            "atom_id": atom_id,
            "source_atom_sha256": base["custody_retention_design_receipt"]["source_atom_sha256"],
            "source": finding["source"],
            "semantic_family": family,
            "classification_basis": basis,
            "linked_current_paths": sorted(set(finding["meaningful_search_tokens"] + linked_paths)),
            "requirement_route": {
                "artifact_path": L1.relative_to(ROOT).as_posix(),
                "hil_ids": sorted(hil),
            },
            "functional_route": {
                "artifact_path": L3.relative_to(ROOT).as_posix(),
                "hr_ids": sorted(hr),
                "hac_ids": sorted(hac),
            },
            "component_route": {
                "artifact_path": L4.relative_to(ROOT).as_posix(),
                "symbols": contract["components"],
            },
            "acceptance_route": {
                "artifact_path": HAT.relative_to(ROOT).as_posix(),
                "hat_ids": contract["hat"],
            },
            "system_route": {
                "artifact_path": HST.relative_to(ROOT).as_posix(),
                "hst_ids": contract["hst"],
            },
            "replacement_kind_candidate": "node_reimplementation",
            "route_authority": "proposal_only",
        }
        active_routes.append({
            **route_body,
            "design_obligation_receipt_sha256": digest(route_body),
            "design_disposition": "exact_semantic_route_candidate_terminal",
            "runtime_mutation": False,
            "verified": False,
            "coverage_credit": False,
        })

    retire_receipts = []
    retire_obligations = [
        ("independent_replay", "independent replay proves no behavior or oracle loss"),
        ("owner_confirmation", "current component owner confirms no live semantic ownership"),
        ("alias_expiry", "all aliases have an explicit expiry or absence receipt"),
        ("generated_zero", "regeneration and closed-world scan return zero consumers"),
        ("tombstone", "immutable tombstone binds source atom and disposition"),
        ("rollback", "rollback path restores custody without reactivating Bun authority"),
    ]
    for finding in retire_findings:
        base = stale_by_id[finding["atom_id"]]
        body = {
            "atom_id": finding["atom_id"],
            "source_atom_sha256": base["custody_retention_design_receipt"]["source_atom_sha256"],
            "source": finding["source"],
            "terminal_design_decision": "retain_fail_closed_until_retirement_evidence_complete",
            "retirement_obligations": [
                {"obligation": name, "required_evidence": evidence, "status": "required_at_runtime_retirement_gate"}
                for name, evidence in retire_obligations
            ],
            "owner_component": RETIRE_ATOM_OWNER[finding["atom_id"]],
            "deletion_authorized": False,
            "supersede_authorized": False,
            "reopen_rule": "only a receipt set satisfying all six obligations may propose retirement",
            "current_retirement_evidence_state_sha256": digest({"atom_id": finding["atom_id"], "source": finding["source"], "obligations": retire_obligations}),
        }
        retire_receipts.append({
            **body,
            "design_obligation_receipt_sha256": digest(body),
            "design_disposition": "terminal_retirement_challenge",
            "design_pending": False,
            "runtime_mutation": False,
            "verified": False,
            "coverage_credit": False,
        })

    retain_receipts = []
    for finding in retain_findings:
        retained = retain_by_id[finding["atom_id"]]
        body = {
            "atom_id": finding["atom_id"],
            "source_atom_sha256": retained["custody_receipt_candidate"]["source_atom_sha256"],
            "source": finding["source"],
            "source_review_decision": finding["review_decision"],
            "unproven_reasons": finding["issues"],
            "terminal_design_decision": "retain_under_immutable_custody_without_adoption_or_semantic_credit",
            "owner_component": "RequirementDefinitionLedger",
            "adoption_authorized": False,
            "retirement_authorized": False,
            "reopen_rule": "only new atom-specific semantic evidence with a different evidence digest may reopen",
            "upstream_custody_receipt_sha256": retained["custody_receipt_candidate"]["receipt_sha256"],
            "current_unproven_evidence_sha256": digest({"atom_id": finding["atom_id"], "source": finding["source"], "issues": finding["issues"], "upstream": retained["custody_receipt_candidate"]["receipt_sha256"]}),
        }
        retain_receipts.append({
            **body,
            "design_obligation_receipt_sha256": digest(body),
            "design_disposition": "terminal_unproven_custody_challenge",
            "design_pending": False,
            "runtime_mutation": False,
            "verified": False,
            "coverage_credit": False,
        })

    overlap_receipts = []
    for retained in retain_readjudication["records"]:
        obligation = retained.get("current_bun_string_design_obligation")
        if not obligation:
            continue
        evidence = {
            "atom_id": retained["atom_id"],
            "classification": obligation["classification"],
            "authority_hits": obligation["authority_hits"],
            "fixture_hits": obligation["fixture_hits"],
            "source_atom_sha256": retained["custody_receipt_candidate"]["source_atom_sha256"],
        }
        body = {
            **evidence,
            "overlap_evidence_sha256": digest(evidence),
            "owner_component": "NodeControlPlane",
            "terminal_design_decision": "transfer_exact_current_bun_string_remediation_to_RA_BUN_001",
            "runtime_transfer_target": "RA-BUN-001",
            "reopen_rule": "reopen Design classification when the exact command/path hit-set digest or authority/fixture class changes",
            "runtime_remediation_pending": True,
        }
        overlap_receipts.append({
            **body,
            "design_obligation_receipt_sha256": digest(body),
            "runtime_mutation": False,
            "verified": False,
            "coverage_credit": False,
        })

    families = Counter(row["semantic_family"] for row in active_routes)
    output = {
        "schema_version": "helix.df-bun-002-terminal-design-receipts.v1",
        "status": "design_obligations_terminal_runtime_acceptance_separated",
        "generated_at": "2026-07-16",
        "sources": [source(path) for path in (STALE, STALE_REVIEW, RETAIN_REVIEW, RETAIN_READJUDICATION, INVENTORY, L1, L3, L4, HAT, HST)],
        "design_freeze_decision": {
            "blocker_id": "DF-BUN-002",
            "status": "closed",
            "denominator": 88,
            "closed": {
                "active_exact_route_candidates": 7,
                "terminal_retirement_challenges": 8,
                "terminal_unproven_custody_challenges": 73,
                "current_bun_string_overlap_transfer_receipts": 137,
            },
            "open_design_obligations": 0,
            "runtime_acceptance_transfer": {
                "active_route_implementation_and_verification": 7,
                "retirement_evidence_sets": 8,
                "custody_challenge_reopenings": 0,
            },
        },
        "summary": {
            "active_route_families": dict(sorted(families.items())),
            "runtime_mutations": 0,
            "verified_true": 0,
            "coverage_credit_true": 0,
            "deletions": 0,
            "supersedes": 0,
            "design_pending": 0,
        },
        "invariants": [
            "terminal challenge is a fail-closed Design decision, not adoption, retirement, or verification",
            "unproven retain has immutable custody but no semantic or coverage credit",
            "retirement needs independent replay, owner, alias expiry, generated-zero, tombstone, and rollback evidence",
            "active routes are atom-specific and proposal-only",
            "runtime and coverage remain zero",
        ],
        "active_exact_routes": active_routes,
        "terminal_retirement_challenges": retire_receipts,
        "terminal_unproven_custody_challenges": retain_receipts,
        "current_bun_string_overlap_transfer_receipts": overlap_receipts,
    }
    all_rows = active_routes + retire_receipts + retain_receipts
    if len(all_rows) != 88 or len({row["atom_id"] for row in all_rows}) != 88:
        raise SystemExit("DF-BUN-002 identity invariant failed")
    if any(row["runtime_mutation"] or row["verified"] or row["coverage_credit"] for row in all_rows + overlap_receipts):
        raise SystemExit("runtime/verification/coverage invariant failed")
    if any(not row["functional_route"]["hr_ids"] or not row["functional_route"]["hac_ids"] for row in active_routes):
        raise SystemExit("active exact semantic route incomplete")
    l4_text = L4.read_text(encoding="utf-8")
    if any(row["owner_component"] not in l4_text for row in retire_receipts):
        raise SystemExit("retirement owner is not bound to L4")
    if len(overlap_receipts) != 137 or any(row["owner_component"] not in l4_text for row in overlap_receipts):
        raise SystemExit("current Bun overlap transfer denominator/owner drift")
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
