#!/usr/bin/env python3
"""Audit the exported PO7 activation receipt without trusting the local DB."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GEN = ROOT / "docs/governance/generated"
RECEIPT = GEN / "po7-activation-terminal-command-receipt-v1.json"
OUTPUT = GEN / "po7-activation-runtime-independent-audit-v1.json"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    receipt = load(RECEIPT)
    evidence = receipt.get("evidence", {})
    operation = evidence.get("operation", {})
    groups = evidence.get("group_receipts", [])
    questions = evidence.get("question_receipts", [])
    vmodel = evidence.get("vmodel_event", {})
    projection = evidence.get("projection", {})
    terminal = evidence.get("terminal", {})
    go_path = GEN / "po-go-authority-event-v1.json"
    universal_path = GEN / "universal-workflow-po-decision-packet-v1.json"
    vmodel_path = GEN / "vmodel-authority-decision-packet-v1.json"
    go = load(go_path)
    issues: list[dict[str, object]] = []

    def check(condition: bool, code: str, actual: object = None) -> None:
        if not condition:
            issues.append({"code": code, "actual": actual})

    expected_groups = {f"UWR-PO-DG-{index:02d}" for index in range(1, 7)}
    group_ids = {row.get("decision_group_id") for row in groups}
    question_ids = [row.get("question_id") for row in questions]
    queue_ids = [row.get("queue_id") for row in questions]
    check(receipt.get("executed") is True, "not_executed")
    check(receipt.get("replay") is True, "idempotent_replay_not_observed")
    check(receipt.get("authorityEpoch") == 1, "authority_epoch", receipt.get("authorityEpoch"))
    check(len(groups) == 6 and group_ids == expected_groups, "group_set", sorted(group_ids))
    check(all(row.get("selected_option_id") == "A" and row.get("status") == "active" for row in groups), "group_activation")
    check(len(questions) == 22 and len(set(question_ids)) == 22 and len(set(queue_ids)) == 22, "question_queue_cardinality")
    check(all(row.get("selected_option_id") == "A" and row.get("status") == "active" for row in questions), "question_activation")
    check(vmodel.get("status") == "active" and vmodel.get("event_sequence") == 1, "vmodel_activation", vmodel)
    check(projection.get("status") == "active" and projection.get("freeze_blocker_status") == "closed", "projection_not_closed", projection)
    check(projection.get("group_count") == 6 and projection.get("question_count") == 22, "projection_counts", projection)
    check(terminal.get("status") == "active" and terminal.get("authority_epoch") == 1, "terminal_not_active", terminal)
    for camel, snake in (("payloadDigest", "payload_digest"), ("eventDigest", "event_digest"), ("writeSetDigest", "write_set_digest")):
        check(receipt.get(camel) == terminal.get(snake), f"terminal_{snake}_mismatch")
    check(operation.get("payload_digest") == receipt.get("payloadDigest"), "operation_payload_mismatch")
    check(operation.get("universal_packet_digest") == sha(universal_path), "universal_packet_stale")
    check(operation.get("vmodel_packet_digest") == sha(vmodel_path), "vmodel_packet_stale")
    payload = go.get("payload", go)
    actor = payload.get("actor", {})
    check(payload.get("raw_message_sha256") == operation.get("answer_message_digest"), "go_raw_digest_mismatch")
    check(payload.get("normalized_decision_sha256") == operation.get("normalized_answer_digest"), "go_normalized_digest_mismatch")
    check(actor.get("actor_id") == "PO" and operation.get("actor_id") == "PO", "actor_authority_mismatch")
    check(actor.get("actor_authority") == operation.get("actor_authority"), "actor_authority_class_mismatch")

    result = {
        "schema_version": "helix.po7-activation-runtime-independent-audit.v1",
        "status": "independent_audit_pass_authority_activated" if not issues else "independent_audit_findings_open",
        "sources": {
            "activation_receipt": {"path": RECEIPT.relative_to(ROOT).as_posix(), "sha256": sha(RECEIPT)},
            "go_authority_event": {"path": go_path.relative_to(ROOT).as_posix(), "sha256": sha(go_path)},
            "universal_packet": {"path": universal_path.relative_to(ROOT).as_posix(), "sha256": sha(universal_path)},
            "vmodel_packet": {"path": vmodel_path.relative_to(ROOT).as_posix(), "sha256": sha(vmodel_path)},
        },
        "projection": {
            "authority_epoch": receipt.get("authorityEpoch"),
            "decision_groups_activated": len(groups),
            "question_receipts_activated": len(questions),
            "vmodel_authority_events": 1 if vmodel else 0,
            "freeze_blocker_status": projection.get("freeze_blocker_status"),
            "idempotent_replay_observed": receipt.get("replay"),
        },
        "digests": {
            "payload": receipt.get("payloadDigest"),
            "event": receipt.get("eventDigest"),
            "write_set": receipt.get("writeSetDigest"),
        },
        "findings": issues,
        "safety": {
            "authority_activation_credit": 1 if not issues else 0,
            "unrelated_runtime_execution_credit": 0,
            "verified": False,
            "coverage_credit": False,
        },
    }
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    if issues:
        raise SystemExit("PO7 activation audit findings remain")


if __name__ == "__main__":
    main()
