#!/usr/bin/env python3
"""Derive, but never execute, the PO GO=A×6+VMAUTH activation payload."""

import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GEN = ROOT / "docs/governance/generated"
PO = GEN / "universal-workflow-po-decision-packet-v1.json"
VM = GEN / "vmodel-authority-decision-packet-v1.json"
RECEIPT = ROOT / "docs/governance/vmodel-authority-receipt-v1.md"
LEDGER = ROOT / "docs/governance/universal-workflow-question-ledger.md"
L4 = ROOT / "docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md"
OUTPUT = GEN / "po-go-activation-preflight-independent-audit-v1.json"


def load(path):
    return json.loads(path.read_text())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build():
    po = load(PO)
    vm = load(VM)
    receipt_text = RECEIPT.read_text()
    decision_table_sha = re.search(r"^decision_table_sha256: ([0-9a-f]{64})$", receipt_text, re.MULTILINE).group(1)
    packet_sha = sha(PO)
    vm_sha = sha(VM)
    groups = []
    questions = []
    for group in po["decision_groups"]:
        option = next(option for option in group["options"] if option["option_id"] == group["recommended_default"])
        groups.append({
            "receipt_id": None,
            "decision_group_id": group["decision_group_id"],
            "selected_option_id": "A",
            "selected_option_decision": option["decision"],
            "packet_sha256": packet_sha,
            "source_revision_sha256": None,
            "actor_id": None,
            "actor_authority": None,
            "authority_evidence_sha256": None,
            "idempotency_key": None,
            "expected_activation_epoch": None,
            "previous_receipt_sha256": None,
            "answer_event_id": None,
            "answer_message_sha256": None,
            "normalized_answer_sha256": None,
            "status": "active",
        })
        for mapping in [row for row in po["question_mapping"] if row["decision_group_id"] == group["decision_group_id"]]:
            questions.append({"queue_id": mapping["queue_id"], "question_id": mapping["question_id"], "decision_group_id": group["decision_group_id"], "selected_option_id": "A", "answer_value": option["decision"]})

    normalized_proposal = ";".join([f"{group['decision_group_id']}=A" for group in groups] + ["VMAUTH-PO-01=approve"])
    vmauth = {
        "event_id": None, "event_sequence": None, "event_digest": None,
        "packet_sha256": vm_sha, "source_set_sha256": None, "decision_table_sha256": decision_table_sha,
        "actor_id": None, "actor_authority": None, "authority_evidence_sha256": None,
        "co_authority_receipt_digests": [], "idempotency_key": None, "expected_activation_epoch": None,
        "previous_event_sha256": None, "answer_event_id": None, "answer_message_sha256": None,
        "normalized_answer_sha256": hashlib.sha256(normalized_proposal.encode()).hexdigest(),
        "status": "active", "issued_at": None,
    }
    required_runtime = sorted({key for row in groups for key, value in row.items() if value is None} | {key for key, value in vmauth.items() if value is None})
    findings = [
        {"code": "PO_GO_CHAT_ANSWER_CUSTODY_UNAVAILABLE", "severity": "blocker", "detail": "trusted answer_event_id、raw message bytes digest、actor identity/authority proof、trusted timestampが現行artifactに無い。proposed normalized stringはraw chat receiptを代替しない。"},
        {"code": "PO_GO_SOURCE_SET_CANONICALIZATION_UNDERDEFINED", "severity": "blocker", "detail": "source artifact ordered-set digestは要求されるが、exact member list、order、canonical byte framing/versionがmachine schemaまたはgeneratorに固定されていない。"},
        {"code": "PO_GO_ACTIVATION_GENERATOR_NOT_IMPLEMENTED", "severity": "blocker", "detail": "scripts/srcにUniversalOptionReceiptV1 6件、22 answer receipts、VMAUTH event、terminal receiptを生成するproducer/writerが存在しない。現存するのはdesign contractとread-only auditだけ。"},
        {"code": "PO_GO_DB_CAS_INPUTS_UNAVAILABLE", "severity": "blocker", "detail": "activation epoch、previous receipt/event heads、event sequence、receipt/event IDs、idempotency keyはstate DBからread-validate-commit時に取得する必要があるが、実pathが未実装。"},
    ]
    return {
        "schema_version": "helix.po-go-activation-preflight-independent-audit.v1",
        "status": "preflight_blocked_exact_payload_not_executable",
        "interpretation": {"po_go": "Universal six groups select recommended option A and VMAUTH-PO-01 approve", "normalized_answer_proposal": normalized_proposal, "warning": "proposal digest is not chat answer custody"},
        "sources": {name: {"path": str(path.relative_to(ROOT)), "sha256": sha(path)} for name, path in (("universal_packet", PO), ("vmodel_packet", VM), ("vmodel_receipt", RECEIPT), ("question_ledger", LEDGER), ("l4_contract", L4))},
        "derived_payload": {
            "activation_transaction": {"activation_transaction_id": None, "expected_group_receipt_count": 6, "expected_answer_receipt_count": 22, "all_or_nothing": True, "idempotency_key": None, "expected_activation_epoch": None, "expected_event_head": None, "ordered_write_set": ["universal_group_receipts[6]", "question_answer_receipts[22]", "vmodel_authority_event[1]", "disposition_queue_projection", "terminal_activation_receipt"]},
            "universal_option_receipts": groups,
            "question_answer_expansion": questions,
            "vmodel_authority_activation_event": vmauth,
        },
        "validation": {
            "groups": len(groups), "all_selected_A": all(row["selected_option_id"] == "A" for row in groups),
            "recommended_A_in_packet": all(group["recommended_default"] == "A" for group in po["decision_groups"]),
            "questions": len(questions), "unique_question_ids": len({row["question_id"] for row in questions}), "unique_queue_ids": len({row["queue_id"] for row in questions}),
            "question_group_mapping_exact": {group["decision_group_id"]: len([row for row in questions if row["decision_group_id"] == group["decision_group_id"]]) for group in groups},
            "vmauth_decision_ids": [row["id"] for row in vm["missing_po_decisions"]], "vmauth_packet_current_sha256": vm_sha,
            "chat_answer_custody_complete": False, "runtime_required_fields": required_runtime,
        },
        "path_discovery": {
            "existing_generator": None, "existing_activation_writer": None,
            "read_only_audits": ["scripts/audit/audit-po7-decision-activation-contract.py", "scripts/audit/audit-post-po-design-freeze-transition.py"],
            "design_contracts": ["docs/governance/universal-workflow-question-ledger.md §5.3", "docs/governance/vmodel-authority-receipt-v1.md §3", "docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md §11/§13"],
        },
        "findings": findings,
        "execution": {"authorized": False, "performed": False, "tag": False, "commit": False, "push": False, "db_mutation": False},
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    rendered = json.dumps(build(), ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if args.check:
        if not OUTPUT.is_file() or OUTPUT.read_text() != rendered:
            raise SystemExit("PO GO preflight artifact is stale")
    else:
        OUTPUT.write_text(rendered)


if __name__ == "__main__":
    main()
