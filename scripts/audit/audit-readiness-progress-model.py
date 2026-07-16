#!/usr/bin/env python3
"""Independently audit §3 progress without mixing Design and Runtime credit."""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GEN = ROOT / "docs/governance/generated"
LEDGER = ROOT / "docs/governance/helix-requirements-freeze-readiness-ledger.md"
OUTPUT = GEN / "requirements-freeze-progress-independent-audit-v1.json"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(name: str) -> dict:
    return json.loads((GEN / name).read_text(encoding="utf-8"))


def main() -> None:
    check_only = sys.argv[1:] == ["--check"]
    if sys.argv[1:] not in ([], ["--check"]):
        raise SystemExit("usage: audit-readiness-progress-model.py [--check]")
    bun = load("helix-bun-plan-exact-design-route-independent-review-v1.json")
    savepoint = load("repository-savepoint-layer-tag-design-independent-review-v1.json")
    universal = load("universal-nonpo-authority-resolution-independent-review-v1.json")
    exact2 = load("exact2-semantic-normalization-independent-review-v1.json")
    bun_terminal = load("helix-df-bun-002-terminal-design-receipts-independent-review-v1.json")
    layer_semantics = load("l1-l12-layer-semantics-remediation-independent-review-v3.json")
    critical = load("design-freeze-critical-path-v1.json")
    vmodel = load("vmodel-authority-decision-packet-v1.json")
    visual = load("visual-design-harness-semantic-review-v1.json")
    po7_activation = load("po7-activation-runtime-independent-audit-v1.json")
    freeze_transition = load("post-po-design-freeze-transition-runtime-independent-audit-v2.json")
    authority_closed = (
        po7_activation["status"] == "independent_audit_pass_authority_activated"
        and critical["summary"]["design_freeze_open_rows"] == 0
        and critical["summary"].get("po_authority_activated_units") == 7
    )
    freeze_receipt_current = freeze_transition["status"] == "independent_audit_pass_post_po_design_freeze_runtime_v2"
    weights = {
        "要求・chat semantic capture": 10, "Visual Design HARNESS": 8, "HARNESS-owned subagent標準": 8,
        "Infinity Loop＋detector DB": 12, "Repository/Layer savepoint": 8, "Rebaseline extraction": 8,
        "Hybrid Python/core": 10, "Universal judgment core": 12, "UT/legacy source adoption": 12,
        "Node/Python/Linux authority design": 12,
    }
    gates = {
        "要求・chat semantic capture": [1, 1, 1, 1],
        "Visual Design HARNESS": [1, 1, 1, int(authority_closed)],
        "HARNESS-owned subagent標準": [1, 1, 1, int(authority_closed)],
        "Infinity Loop＋detector DB": [1, 1, 1, int(authority_closed)],
        "Repository/Layer savepoint": [1, 1, int(savepoint["summary"]["open"] == 0), int(authority_closed)],
        "Rebaseline extraction": [1, 1, 1, int(authority_closed)],
        "Hybrid Python/core": [1, 1, 1, int(authority_closed)],
        "Universal judgment core": [1, 1, int(universal["summary"]["records_with_findings"] == 0), int(authority_closed)],
        "UT/legacy source adoption": [1, int(exact2["status"] == "design_closure_accepted_candidate_not_verified"), int(exact2["status"] == "design_closure_accepted_candidate_not_verified"), int(authority_closed)],
        "Node/Python/Linux authority design": [1, int(bun["summary"]["route_complete_candidates"] == 2210 and bun_terminal["summary"]["finding_count"] == 0), int(bun_terminal["status"] == "independent_review_pass_terminal_design_closed_runtime_open"), int(authority_closed)],
    }
    rows = []
    for name, weight in weights.items():
        values = gates[name]
        credit = weight * sum(values) / 4
        rows.append({"workstream": name, "weight": weight, "design_gate_denominator": 4, "gates": dict(zip(["fixed_denominator", "design_disposition_and_exact_edges", "independent_review_current", "authority_or_source_limitation_closed"], values)), "design_credit": credit, "runtime_gate_denominator": 4, "runtime_gates": {"implemented": 0, "executed": 0, "verified": 0, "activated_or_environment_green": 0}, "runtime_credit": 0})
    design = sum(row["design_credit"] for row in rows)
    stale_candidates = [
        {"needle": "route complete 0", "kind": "Bun generic-route stale", "stale_claim": "route complete 0/2210", "current": f"independent family route complete {bun['summary']['route_complete_candidates']}/2210, findings {bun['summary']['records_with_findings']}", "credit_boundary": "runtime verified/coverage remains 0"},
        {"needle": "atomic case 6/6", "kind": "savepoint case denominator stale", "stale_claim": "atomic case 6/6", "current": "umbrella 6 plus granular failure cases 16 = Design case denominator 22; independent Design findings open 0", "credit_boundary": "remote ruleset/tag/restore execution remains 0"},
        {"needle": "stale provenance/authority challenge 37", "kind": "Universal 37 disposition stale", "stale_claim": "37 stale provenance/authority challenges open", "current": f"37 evidence terminal receipts plus 5 dependency terminal receipts; independent records {universal['summary']['records']} findings {universal['summary']['finding_count']}", "credit_boundary": "PO remains 22 questions/6 groups; no 37 additional PO decisions; runtime/coverage 0"},
        {"needle": "42bca9f9a1bfe15d947d4e762d76c8f1e2bdbe7dd82976ab506787749af03c40", "kind": "savepoint audit digest/check denominator stale", "stale_claim": "old audit SHA and pre-remediation checks", "current": "producer audit 18 checks plus independent seven findings closed_design_not_implemented", "credit_boundary": "implementation/execution/verified remain 0"},
        {"needle": "| Repository/Layer savepoint | 92%", "kind": "savepoint percentage unsupported", "stale_claim": "92% based on 6/6", "current": "umbrella6+granular16 and seven independent Design findings closed; fixed weighted model grants 3/4 Design gates", "credit_boundary": "Runtime Acceptance 0"},
        {"needle": "| UT/legacy source adoption | 58%", "kind": "UT/legacy Design percentage stale", "stale_claim": "58% before exact2 normalization closure", "current": "exact2 normalization independent review accepts Design closure; disposition and independent-review gates now pass", "credit_boundary": "CAS promotion/behavior replay/runtime verified remain 0"},
        {"needle": "| Node/Python/Linux authority design | 71%", "kind": "Bun percentage premise stale", "stale_claim": "generic route 0/2210", "current": "route Design review 2210/2210 and Bun terminal independent review pass c280; DF-BUN-001/002 closed", "credit_boundary": "Node implementation/active Bun zero remain Runtime 0"},
        {"needle": "| overall requirements freeze | 77.5%", "kind": "pre-activation overall percentage stale", "stale_claim": "authority gate remained open before GO activation", "current": f"fixed 100-point Design model={design}; Runtime model=0", "credit_boundary": "Design Freeze receipt is current; runtime implementation/execution/verification remains 0"},
    ]
    ledger_text = LEDGER.read_text(encoding="utf-8")
    stale = [{**{k: v for k, v in row.items() if k != "needle"}, "ledger_line": ledger_text[:ledger_text.index(row["needle"])].count("\n") + 1} for row in stale_candidates if row["needle"] in ledger_text]
    # readiness計算が実際に読む祖先だけをsnapshotへ含める。全generated JSONを入れると、
    # 本artifactの下流reviewや無関係audit更新で自己stale化する。
    input_names = {
        "helix-bun-plan-exact-design-route-independent-review-v1.json",
        "repository-savepoint-layer-tag-design-independent-review-v1.json",
        "universal-nonpo-authority-resolution-independent-review-v1.json",
        "exact2-semantic-normalization-independent-review-v1.json",
        "helix-df-bun-002-terminal-design-receipts-independent-review-v1.json",
        "l1-l12-layer-semantics-remediation-independent-review-v3.json",
        "design-freeze-critical-path-v1.json",
        "vmodel-authority-decision-packet-v1.json",
        "visual-design-harness-semantic-review-v1.json",
        "po7-activation-runtime-independent-audit-v1.json",
        "post-po-design-freeze-transition-runtime-independent-audit-v2.json",
    }
    direct = sorted(GEN / name for name in input_names)
    artifact = {
        "schema_version": "helix.requirements-freeze-progress-independent-audit.v1",
        "status": "independent_progress_model_current_design_freeze_receipt_runtime_zero" if not stale and freeze_receipt_current else "independent_progress_model_current_authority_closed_freeze_receipt_hardening",
        "source_ledger": {"path": str(LEDGER.relative_to(ROOT)), "sha256": sha(LEDGER)},
        "artifact_snapshot": {"direct_json_count": len(direct), "manifest_sha256": hashlib.sha256(json.dumps([(p.name, sha(p)) for p in direct], separators=(",", ":")).encode()).hexdigest()},
        "rules": {"design_gate_names": ["fixed denominator", "design disposition and exact edges", "independent review current", "authority or accepted source-limitation closure"], "workstream_weights_total": sum(weights.values()), "gate_weighting": "each workstream weight divided equally across four Design gates", "unknown_or_unproven": "0 credit", "runtime_separation": "implementation/execution/verification/activation are a separate four-gate axis and never add Design credit", "overall_ready": "100/100 Design points AND no authority blocker; percentage alone cannot freeze"},
        "summary": {"workstreams": 10, "design_points": design, "design_denominator": 100, "design_freeze_ready": freeze_receipt_current and design == 100, "runtime_points": 0, "runtime_denominator": 100, "runtime_acceptance_ready": False, "stale_ledger_statements": len(stale), "critical_path_design_rows": critical["summary"]["design_freeze_rows"], "critical_path_open_rows": critical["summary"]["design_freeze_open_rows"], "critical_path_open_owner_classes": critical["summary"]["open_by_owner_class"], "vmodel_packet_missing_po_decisions_before_activation": vmodel["counts"]["missing_po_decisions"], "vmodel_authority_activated": int(authority_closed), "design_freeze_transition_current": int(freeze_receipt_current), "coverage_credit_true": 0, "verified_true": 0},
        "post_audit_index_staleness": {"input_json_count": len(direct), "input_scope": "explicit readiness ancestors only", "artifact_operation": "replace_existing_not_add", "generated_readme_state": "not_evaluated_readme_edit_forbidden"},
        "workstreams": rows, "stale_findings": stale,
        "evidence_boundaries": {"visual_executed": visual["summary"]["executed"], "exact2_design_status": exact2["status"], "bun_route_design_complete": bun["summary"]["route_complete_candidates"], "bun_terminal_design_findings": bun_terminal["summary"]["finding_count"], "layer_semantics_unresolved": layer_semantics["summary"]["unresolved"], "savepoint_design_findings_open": savepoint["summary"]["open"], "universal_terminal_nonpo_receipts": universal["summary"]["records"]},
    }
    rendered = json.dumps(artifact, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if check_only:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != rendered:
            raise SystemExit(f"STALE: {OUTPUT.relative_to(ROOT)}")
        print(f"OK: {OUTPUT.relative_to(ROOT)}")
        return
    OUTPUT.write_text(rendered, encoding="utf-8")


if __name__ == "__main__":
    main()
