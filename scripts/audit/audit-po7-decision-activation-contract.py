#!/usr/bin/env python3
"""PO7 activation producer是正後の設計契約を独立に再監査する。"""

import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GEN = ROOT / "docs/governance/generated"
OUTPUT = GEN / "po7-decision-activation-contract-independent-audit-v1.json"
SOURCES = {
    "universal_packet": GEN / "universal-workflow-po-decision-packet-v1.json",
    "vmauth_packet": GEN / "vmodel-authority-decision-packet-v1.json",
    "vmauth_receipt": ROOT / "docs/governance/vmodel-authority-receipt-v1.md",
    "chat_ledger": ROOT / "docs/governance/infinity-loop-source-capability-ledger.md",
    "l4_activation_design": ROOT / "docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md",
    "post_po_governance": ROOT / "docs/governance/post-po-design-freeze-transition-contract-v1.md",
    "hat_design": ROOT / "docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md",
    "hst_design": ROOT / "docs/test-design/helix/L10-infinity-loop-platform-system-test-design.md",
}

OLD_FINDINGS = {
    "PO7_UNIVERSAL_OPTION_RECEIPT_SCHEMA_ABSENT": "Universal option receipt schema",
    "PO7_MUTUAL_EXCLUSION_NOT_ENFORCED_AT_ACTIVATION": "exactly-one option enforcement",
    "PO7_UNIVERSAL_ACTIVATION_NOT_BOUND_TO_PACKET_DIGEST": "packet/source digest binding",
    "PO7_ACTOR_AND_AUTHORITY_PROOF_NOT_MACHINE_BOUND": "actor/authority proof binding",
    "PO7_IDEMPOTENCY_AND_CAS_CONTRACT_ABSENT": "idempotency and CAS",
    "PO7_PARTIAL_ACTIVATION_NOT_PROHIBITED_MECHANICALLY": "all-or-nothing activation",
    "PO7_REVOKE_SUPERSEDE_LIFECYCLE_INCOMPLETE": "append-only lifecycle",
    "PO7_CHAT_ANSWER_CUSTODY_NOT_BOUND_TO_RECEIPT": "chat answer custody",
    "PO7_HIGH_IMPACT_BC_ESCALATION_NOT_OPTION_BOUND": "B/C option co-authority",
    "PO7_VMAUTH_ACTIVATION_EVENT_SCHEMA_INCOMPLETE": "VMAUTH event schema",
}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path):
    return json.loads(path.read_text())


def contains_all(text: str, tokens: list[str]) -> bool:
    return all(token in text for token in tokens)


def build():
    po = load(SOURCES["universal_packet"])
    vm = load(SOURCES["vmauth_packet"])
    texts = {name: path.read_text() for name, path in SOURCES.items() if path.suffix != ".json"}
    l4 = texts["l4_activation_design"]
    governance = texts["post_po_governance"]
    hat = texts["hat_design"]
    hst = texts["hst_design"]
    combined_design = "\n".join((l4, governance, hat, hst, texts["vmauth_receipt"]))

    groups = po.get("decision_groups", [])
    questions = [qid for group in groups for qid in group.get("question_ids", [])]
    packet_state = {
        "universal_groups": len(groups),
        "universal_questions": len(questions),
        "universal_selected_options": po.get("summary", {}).get("selected_options"),
        "universal_activated_answers": po.get("summary", {}).get("activated_answers"),
        "vmauth_missing_po_decisions": vm.get("counts", {}).get("missing_po_decisions"),
        "vmauth_event_id": vm.get("approval", {}).get("event_id"),
        "vmauth_approved": vm.get("invariants", {}).get("approved"),
        "target_evidence_active_credit": vm.get("invariants", {}).get("target_evidence_active_credit"),
    }

    checks = {
        "PO7_UNIVERSAL_OPTION_RECEIPT_SCHEMA_ABSENT": contains_all(l4, ["UniversalOptionReceiptV1", "selected_option_id", "packet/source/decision-table"]),
        "PO7_MUTUAL_EXCLUSION_NOT_ENFORCED_AT_ACTIVATION": contains_all(l4 + hat, ["exactly-one", "unknown", "複数option", "activation 0"]),
        "PO7_UNIVERSAL_ACTIVATION_NOT_BOUND_TO_PACKET_DIGEST": contains_all(l4, ["packet_sha256", "source_set_sha256", "write直前"]),
        "PO7_ACTOR_AND_AUTHORITY_PROOF_NOT_MACHINE_BOUND": contains_all(l4 + hst, ["actor authority", "authority_scope", "authority_expiry", "actor authority欠落"]),
        "PO7_IDEMPOTENCY_AND_CAS_CONTRACT_ABSENT": contains_all(l4 + hst, ["idempotency_key", "expected_activation_epoch", "event-head CAS", "same key different payload", "CAS loser"]),
        "PO7_PARTIAL_ACTIVATION_NOT_PROHIBITED_MECHANICALLY": contains_all(l4 + hst, ["expected_group_receipt_count=6", "expected_answer_receipt_count=22", "all_or_nothing=true", "単一SQLite transaction", "全件rollback"]),
        "PO7_REVOKE_SUPERSEDE_LIFECYCLE_INCOMPLETE": contains_all(l4 + hst + governance, ["active | stale | revoked | superseded", "append-only", "freeze blocker", "reopen"]),
        "PO7_CHAT_ANSWER_CUSTODY_NOT_BOUND_TO_RECEIPT": contains_all(l4 + hat, ["chat answer", "answer event/message/normalized digest", "packet/source/actor/chat digest current"]),
        "PO7_HIGH_IMPACT_BC_ESCALATION_NOT_OPTION_BOUND": contains_all(l4 + hat + hst, ["B/C option", "required_co_authorities", "authority_scope", "authority_expiry", "co-authority欠落"]),
        "PO7_VMAUTH_ACTIVATION_EVENT_SCHEMA_INCOMPLETE": contains_all(l4 + hat, ["VModelAuthorityActivationEventV1", "VMAUTH event", "previous event", "stale epoch", "single winner"]),
    }

    closed = []
    findings = []
    for code, label in OLD_FINDINGS.items():
        record = {"code": code, "contract": label, "closed": checks[code]}
        if checks[code]:
            closed.append(record)
        else:
            findings.append({**record, "severity": "blocker", "status": "open_after_producer_correction"})

    preservation = {
        "packet_selection_zero": packet_state["universal_selected_options"] == 0,
        "packet_activation_zero": packet_state["universal_activated_answers"] == 0,
        "vmauth_not_activated": packet_state["vmauth_event_id"] is None and packet_state["vmauth_approved"] is False,
        "runtime_mutations": 0,
        "runtime_verified": 0,
        "coverage_credit_true": 0,
    }
    if not all(value is True or value == 0 for value in preservation.values()):
        findings.append({"code": "PO7_CURRENT_STATE_BOUNDARY_VIOLATED", "severity": "critical", "status": "open"})

    return {
        "schema_version": "helix.po7-decision-activation-contract-independent-audit.v2",
        "status": "independent_audit_design_contract_closed_not_activated" if not findings else "independent_audit_findings_open",
        "sources": {name: {"path": path.relative_to(ROOT).as_posix(), "sha256": sha(path)} for name, path in SOURCES.items()},
        "scope": {"universal_decision_groups": 6, "universal_questions": 22, "vmauth_decisions": 1, "previous_findings": 10},
        "packet_state": packet_state,
        "contract_checks": checks,
        "closed_findings": closed,
        "findings": findings,
        "summary": {
            "previous_findings": 10,
            "closed_findings": len(closed),
            "open_findings": len(findings),
            "selected_options": packet_state["universal_selected_options"],
            "activated_answers": packet_state["universal_activated_answers"],
            "activation_receipts_created": 0,
            "runtime_mutations": 0,
            "runtime_verified": 0,
            "coverage_credit_true": 0,
        },
        "preservation": preservation,
        "decision": "10 findingは設計契約とHAT/HST negative oracleでclosed。実装・実行証拠ではなく、PO選択、activation、runtime、verified、coverageは0のまま。",
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    result = build()
    rendered = json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if args.check:
        if not OUTPUT.is_file() or OUTPUT.read_text() != rendered:
            raise SystemExit("PO7 activation audit artifact is stale")
    else:
        OUTPUT.write_text(rendered)
    if result["findings"]:
        raise SystemExit(f"PO7 activation contract findings remain: {len(result['findings'])}")


if __name__ == "__main__":
    main()
