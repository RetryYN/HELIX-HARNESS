#!/usr/bin/env python3
"""Post-PO Design Freeze v2 runtime independent audit.

The command receipt is only a locator/binding.  A pass is reconstructed from a
separate full-row export, current repository sources, and explicit digest
preimages.  Absence of the v2 receipt means that the transition has not been
executed yet; that state is intentionally successful and non-authoritative.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
GEN = ROOT / "docs/governance/generated"
DEFAULT_RECEIPT = GEN / "post-po-design-freeze-transition-command-receipt-v2.json"
DEFAULT_EXPORT = GEN / "post-po-design-freeze-transition-full-row-export-v2.json"
DEFAULT_OUTPUT = GEN / "post-po-design-freeze-transition-runtime-independent-audit-v2.json"
ZERO = hashlib.sha256(b"genesis").hexdigest()

CURRENT_SOURCES = {
    "critical": "design-freeze-critical-path-v1.json",
    "review": "design-freeze-critical-path-independent-review-v1.json",
    "audit": "design-freeze-critical-path-source-rebound-independent-audit-v1.json",
    "activation_audit": "po7-activation-runtime-independent-audit-v1.json",
}
V2_TABLES = [
    "design_freeze_v2_transition_operations",
    "design_freeze_v2_authority_link_events",
    "design_freeze_v2_receipts",
    "design_freeze_v2_projections",
    "design_freeze_v2_progress_projections",
    "design_freeze_v2_l01_candidates",
    "design_freeze_v2_l01_handoffs",
    "design_freeze_v2_transition_outbox",
    "design_freeze_v2_transition_terminal_receipts",
]
PO7_TABLES = [
    "po7_activation_operations",
    "po7_activation_projections",
    "po7_activation_terminal_receipts",
    "po7_vmodel_authority_events",
    "po7_group_option_receipts",
    "po7_question_answer_receipts",
]
PO7_QUESTION_ORDER = [
    "UWR-Q-C-APPROVAL-03", "UWR-Q-B-018", "UWR-Q-B-022",
    "UWR-Q-C-MONEY-01", "UWR-Q-C-MONEY-02", "UWR-Q-C-MONEY-03",
    "UWR-Q-C-MONEY-04", "UWR-Q-C-DEADLINE-01", "UWR-Q-C-DEADLINE-04",
    "UWR-Q-R-020", "UWR-Q-R-021", "UWR-Q-C-PERSONAL-DATA-01",
    "UWR-Q-R-002", "UWR-Q-R-003", "UWR-Q-R-004", "UWR-Q-R-005",
    "UWR-Q-R-011", "UWR-Q-R-012", "UWR-Q-R-014", "UWR-Q-R-016",
    "UWR-Q-R-017", "UWR-Q-R-022",
]
PO7_COLUMNS = {
    "po7_activation_operations": ["operation_id","idempotency_key","request_digest","payload_digest","authority_epoch","previous_event_digest","universal_packet_digest","universal_source_set_digest","vmodel_packet_digest","vmodel_source_set_digest","decision_table_digest","authority_event_payload_digest","actor_id","actor_authority","authority_evidence_digest","answer_event_id","answer_message_digest","normalized_answer_digest","observed_at","status"],
    "po7_group_option_receipts": ["receipt_id","operation_id","decision_group_id","selected_option_id","option_decision_digest","packet_digest","source_revision_digest","actor_id","actor_authority","authority_evidence_digest","idempotency_key","authority_epoch","previous_receipt_digest","answer_event_id","answer_message_digest","normalized_answer_digest","issued_at","status"],
    "po7_question_answer_receipts": ["receipt_id","operation_id","question_id","queue_id","decision_group_id","selected_option_id","answer_value","answer_value_digest","packet_digest","source_revision_digest","answer_event_id","answer_message_digest","normalized_answer_digest","authority_epoch","issued_at","status"],
    "po7_vmodel_authority_events": ["event_id","operation_id","event_sequence","event_digest","previous_event_digest","packet_digest","source_set_digest","decision_table_digest","actor_id","actor_authority","authority_evidence_digest","co_authority_receipt_digests","idempotency_key","authority_epoch","answer_event_id","answer_message_digest","normalized_answer_digest","status","issued_at"],
    "po7_activation_projections": ["projection_id","operation_id","authority_epoch","event_digest","group_count","question_count","disposition_set_digest","queue_set_digest","freeze_blocker_status","reason_digest","status","projected_at"],
}
HEAD_PAIRS = [
    ("expected_authority_head_digest", "current_authority_head_digest"),
    ("expected_freeze_head_digest", "current_freeze_head_digest"),
    ("expected_progress_head_digest", "current_progress_head_digest"),
    ("expected_candidate_head_digest", "current_candidate_head_digest"),
]


def canonical(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def digest(value: Any) -> str:
    raw = value if isinstance(value, str) else canonical(value)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def file_digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def git(*args: str) -> str:
    return subprocess.run(
        ["git", "-C", str(ROOT), *args], check=True, text=True,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    ).stdout.strip()


def rows(export: dict[str, Any], table: str) -> list[dict[str, Any]]:
    tables = export.get("tables")
    value = tables.get(table) if isinstance(tables, dict) else None
    return value if isinstance(value, list) and all(isinstance(row, dict) for row in value) else []


def negative_matrix() -> list[dict[str, Any]]:
    return [
        {"id": "DFV2-N-01", "mutation": "v2 receipt absent", "expected": "not_executed, exit 0"},
        {"id": "DFV2-N-02", "mutation": "full-row export absent or receipt/export digest mismatch", "expected": "fail_closed"},
        {"id": "DFV2-N-03", "mutation": "one of nine v2 rows omitted/duplicated", "expected": "DFV2_FULL_ROW_DENOMINATOR"},
        {"id": "DFV2-N-04", "mutation": "current source changed after command", "expected": "DFV2_CURRENT_SOURCE_DRIFT"},
        {"id": "DFV2-N-05", "mutation": "full preimage or declared digest preimage changed", "expected": "DFV2_DIGEST_RECOMPUTE"},
        {"id": "DFV2-N-06", "mutation": "ordered write-set row/order changed", "expected": "DFV2_WRITE_SET_DIGEST"},
        {"id": "DFV2-N-07", "mutation": "any expected/current CAS head changed", "expected": "DFV2_HEAD_CAS"},
        {"id": "DFV2-N-08", "mutation": "19/76 denominator changed", "expected": "DFV2_DENOMINATOR_19_76"},
        {"id": "DFV2-N-09", "mutation": "review identity/runtime changed", "expected": "DFV2_REVIEW_IDENTITY"},
        {"id": "DFV2-N-10", "mutation": "PO7 latest epoch/event/status or 6/22/A set changed", "expected": "DFV2_PO7_LATEST"},
        {"id": "DFV2-N-11", "mutation": "repository HEAD/tree/remote-containing refs changed", "expected": "DFV2_REPOSITORY_SNAPSHOT"},
        {"id": "DFV2-N-12", "mutation": "receipt summary differs from reconstructed terminal row", "expected": "DFV2_RECEIPT_SELF_REPORT_MISMATCH"},
    ]


def audit(receipt_path: Path, export_path: Path) -> tuple[dict[str, Any], int]:
    base = {
        "schema_version": "helix.post-po-design-freeze-transition-runtime-independent-audit.v2",
        "negative_test_matrix": negative_matrix(),
    }
    if not receipt_path.exists():
        return ({**base, "status": "not_executed", "executed": False,
                 "sources": {"receipt": str(receipt_path.relative_to(ROOT))},
                 "findings": [], "safety": {"authority_credit": 0, "freeze_credit": 0}}, 0)

    findings: list[dict[str, Any]] = []

    def check(condition: bool, code: str, actual: Any = None) -> None:
        if not condition:
            findings.append({"code": code, "actual": actual})

    try:
        receipt = load(receipt_path)
        check(receipt.get("executed") is True, "DFV2_RECEIPT_NOT_EXECUTED")
        check(export_path.exists(), "DFV2_FULL_ROW_EXPORT_MISSING", str(export_path))
        if not export_path.exists():
            raise ValueError("full-row export missing")
        export = load(export_path)
        check(receipt.get("fullRowExportSha256") == file_digest(export_path),
              "DFV2_EXPORT_BINDING", receipt.get("fullRowExportSha256"))
        check(export.get("schema_version") == "helix.post-po-design-freeze-transition-full-row-export.v2",
              "DFV2_EXPORT_SCHEMA", export.get("schema_version"))

        operation_id = receipt.get("operationId")
        for table in V2_TABLES:
            table_rows = rows(export, table)
            check(len(table_rows) == 1, "DFV2_FULL_ROW_DENOMINATOR", {"table": table, "count": len(table_rows)})
            if table_rows:
                check(table_rows[0].get("operation_id") == operation_id,
                      "DFV2_OPERATION_BINDING", table)
        table_set = set((export.get("tables") or {}).keys())
        check(set(V2_TABLES + PO7_TABLES).issubset(table_set), "DFV2_EXPORT_TABLE_SET", sorted(table_set))

        op = rows(export, V2_TABLES[0])[0] if rows(export, V2_TABLES[0]) else {}
        terminal = rows(export, V2_TABLES[-1])[0] if rows(export, V2_TABLES[-1]) else {}
        freeze = rows(export, "design_freeze_v2_receipts")[0] if rows(export, "design_freeze_v2_receipts") else {}

        # Current-source rebound: hashes are independently measured now, never copied from receipt.
        current_hashes = {key: file_digest(GEN / name) for key, name in CURRENT_SOURCES.items()}
        preimage_text = op.get("full_preimage_json")
        try:
            preimage = json.loads(preimage_text) if isinstance(preimage_text, str) else None
        except json.JSONDecodeError:
            preimage = None
        check(isinstance(preimage, dict), "DFV2_FULL_PREIMAGE_JSON")
        if isinstance(preimage, dict):
            check(op.get("full_preimage_digest") == digest(preimage), "DFV2_DIGEST_RECOMPUTE", "operation.full_preimage")
            check(freeze.get("full_preimage_digest") == digest(preimage), "DFV2_DIGEST_RECOMPUTE", "receipt.full_preimage")
            source_key_map = {"critical": "critical", "review": "review", "audit": "audit", "po7Audit": "activation_audit"}
            bound_sources = {source_key_map.get(key, key): value.get("digest") for key, value in (preimage.get("critical", {}).get("sources", {}) or {}).items()}
            check(bound_sources == current_hashes,
                  "DFV2_CURRENT_SOURCE_DRIFT", {"expected": bound_sources, "actual": current_hashes})

        head = git("rev-parse", "HEAD")
        tree = git("rev-parse", "HEAD^{tree}")
        refs = sorted(line.strip() for line in git("branch", "-r", "--contains", head).splitlines() if line.strip())
        repository = preimage.get("repository") if isinstance(preimage, dict) else None
        check(bool(refs), "DFV2_REPOSITORY_SNAPSHOT", "no remote-containing ref")
        if isinstance(preimage, dict):
            check(isinstance(repository, dict) and repository.get("headOid") == head and repository.get("treeOid") == tree and isinstance(repository.get("remoteRefs"), list) and bool(repository.get("remoteRefs")),
                  "DFV2_REPOSITORY_SNAPSHOT", repository)
        check(freeze.get("repository_head_oid") == head and freeze.get("repository_tree_oid") == tree,
              "DFV2_REPOSITORY_SNAPSHOT", {"head": head, "tree": tree})

        # All four CAS pairs must be present and identical on every exported v2 row.
        reference_heads = {name: op.get(name) for pair in HEAD_PAIRS for name in pair}
        for name, value in reference_heads.items():
            check(isinstance(value, str) and len(value) == 64, "DFV2_HEAD_CAS", {name: value})
        for table in V2_TABLES:
            for row in rows(export, table):
                for name, value in reference_heads.items():
                    check(row.get(name) == value, "DFV2_HEAD_CAS", {"table": table, "field": name})

        for table in [V2_TABLES[index] for index in (0, 2, 3, 4)]:
            for row in rows(export, table):
                check(row.get("design_slice_denominator") == 19 and row.get("design_artifact_denominator") == 76,
                      "DFV2_DENOMINATOR_19_76", table)

        review_identity = op.get("review_identity")
        review_runtime = op.get("review_runtime")
        review_authority = preimage.get("review_authority", {}) if isinstance(preimage, dict) else {}
        review_digest = digest(review_authority)
        check(bool(review_identity) and bool(review_runtime) and review_authority.get("reviewer_identity") == review_identity and review_authority.get("reviewer_runtime") == review_runtime and review_authority.get("runtime_model_separated") is True and review_authority.get("producer_identity") != review_identity and op.get("review_identity_digest") == review_digest,
              "DFV2_REVIEW_IDENTITY", {"identity": review_identity, "runtime": review_runtime})
        check(freeze.get("review_identity_digest") == review_digest, "DFV2_REVIEW_IDENTITY", "freeze receipt")

        # Digest preimages are exported separately from rows, so every claimed digest is recomputable.
        digest_preimages = export.get("digest_preimages")
        check(isinstance(digest_preimages, dict) and bool(digest_preimages), "DFV2_DIGEST_PREIMAGES_MISSING")
        if isinstance(digest_preimages, dict):
            row_index = {f"{table}.{field}": row.get(field) for table in V2_TABLES for row in rows(export, table) for field in row}
            for target, value in digest_preimages.items():
                check(target in row_index and row_index.get(target) == digest(value),
                      "DFV2_DIGEST_RECOMPUTE", target)

        ordered_writes = export.get("ordered_write_set")
        check(isinstance(ordered_writes, list) and len(ordered_writes) == 8,
              "DFV2_WRITE_SET_SHAPE", ordered_writes)
        if isinstance(ordered_writes, list):
            expected_order = V2_TABLES[:-1]
            check([item.get("table") for item in ordered_writes if isinstance(item, dict)] == expected_order,
                  "DFV2_WRITE_SET_SHAPE", ordered_writes)
            check(terminal.get("write_set_digest") == digest(ordered_writes),
                  "DFV2_WRITE_SET_DIGEST", terminal.get("write_set_digest"))
            column_orders = export.get("column_orders", {})
            for item in ordered_writes:
                if isinstance(item, dict) and item.get("table") in V2_TABLES:
                    object_row = rows(export, item["table"])[0]
                    expected_row = [object_row.get(column) for column in column_orders.get(item["table"], [])]
                    check(item.get("row") == expected_row and len(expected_row) == len(object_row),
                          "DFV2_WRITE_SET_ROW_MISMATCH", item.get("table"))

        # Reconstruct latest sealed PO7 authority solely from exported full rows.
        operations = rows(export, "po7_activation_operations")
        projections = rows(export, "po7_activation_projections")
        latest = max(projections, key=lambda row: int(row.get("authority_epoch", 0)), default={})
        epoch = int(latest.get("authority_epoch", 0))
        event = latest.get("event_digest")
        po7_op = latest.get("operation_id")
        groups = [row for row in rows(export, "po7_group_option_receipts") if row.get("operation_id") == po7_op and row.get("status") == "active"]
        questions = [row for row in rows(export, "po7_question_answer_receipts") if row.get("operation_id") == po7_op and row.get("status") == "active"]
        vmodels = [row for row in rows(export, "po7_vmodel_authority_events") if row.get("operation_id") == po7_op and row.get("status") == "active"]
        terminals = [row for row in rows(export, "po7_activation_terminal_receipts") if row.get("operation_id") == po7_op and row.get("status") == "active"]
        operation = next((row for row in operations if row.get("operation_id") == po7_op and row.get("status") == "active"), None)
        expected_groups = [f"UWR-PO-DG-{number:02d}" for number in range(1, 7)]
        po7_ok = (
            latest.get("status") == "active" and latest.get("freeze_blocker_status") == "closed"
            and latest.get("group_count") == 6 and latest.get("question_count") == 22
            and sorted(str(row.get("decision_group_id")) for row in groups) == expected_groups
            and operation is not None and len(questions) == 22 and len({row.get("question_id") for row in questions}) == 22
            and len({row.get("queue_id") for row in questions}) == 22 and len(vmodels) == 1 and len(terminals) == 1
            and all(row.get("selected_option_id") == "A" and row.get("authority_epoch") == epoch for row in groups + questions)
            and vmodels[0].get("authority_epoch") == epoch and vmodels[0].get("event_digest") == event
        )
        check(po7_ok, "DFV2_PO7_LATEST", {"epoch": epoch, "event_digest": event})
        groups_ordered = sorted(groups, key=lambda row: str(row.get("decision_group_id")))
        question_by_id = {str(row.get("question_id")): row for row in questions}
        questions_ordered = [question_by_id.get(question_id) for question_id in PO7_QUESTION_ORDER]
        po7_ordered_writes = []
        if operation is not None:
            po7_ordered_writes.append({"table": "po7_activation_operations", "row": [operation.get(column) for column in PO7_COLUMNS["po7_activation_operations"]]})
        po7_ordered_writes.extend({"table": "po7_group_option_receipts", "row": [row.get(column) for column in PO7_COLUMNS["po7_group_option_receipts"]]} for row in groups_ordered)
        po7_ordered_writes.extend({"table": "po7_question_answer_receipts", "row": [row.get(column) for column in PO7_COLUMNS["po7_question_answer_receipts"]]} for row in questions_ordered if row is not None)
        if vmodels:
            po7_ordered_writes.append({"table": "po7_vmodel_authority_events", "row": [vmodels[0].get(column) for column in PO7_COLUMNS["po7_vmodel_authority_events"]]})
        po7_ordered_writes.append({"table": "po7_activation_projections", "row": [latest.get(column) for column in PO7_COLUMNS["po7_activation_projections"]]})
        check(len(terminals) == 1 and terminals[0].get("write_set_digest") == digest(po7_ordered_writes),
              "DFV2_PO7_WRITE_SET_DIGEST", terminals[0].get("write_set_digest") if terminals else None)
        if isinstance(preimage, dict):
            check(preimage.get("po7", {}).get("terminal_write_set_digest") == digest(po7_ordered_writes),
                  "DFV2_PO7_WRITE_SET_DIGEST", "preimage")
        authority_set_digest = digest(sorted([digest(row) for row in groups] + ([digest(vmodels[0])] if vmodels else [])))
        check(freeze.get("authority_receipt_set_digest") == authority_set_digest,
              "DFV2_PO7_LATEST", "authority_receipt_set_digest")

        for receipt_field, terminal_field in {
            "payloadDigest": "payload_digest", "freezeReceiptDigest": "freeze_receipt_digest",
            "candidateDigest": "candidate_digest", "writeSetDigest": "write_set_digest",
        }.items():
            check(receipt.get(receipt_field) == terminal.get(terminal_field),
                  "DFV2_RECEIPT_SELF_REPORT_MISMATCH", receipt_field)

        result = {
            **base,
            "status": "independent_audit_pass_post_po_design_freeze_runtime_v2" if not findings else "independent_audit_fail_closed",
            "executed": True,
            "sources": {
                "receipt": {"path": str(receipt_path.relative_to(ROOT)), "sha256": file_digest(receipt_path)},
                "full_row_export": {"path": str(export_path.relative_to(ROOT)), "sha256": file_digest(export_path)},
                "current": current_hashes,
            },
            "recomputed": {"operation_id": operation_id, "repository_snapshot": repository,
                           "heads": reference_heads, "denominators": {"design_slices": 19, "design_artifacts": 76},
                           "po7_latest": {"authority_epoch": epoch, "event_digest": event}},
            "findings": findings,
            "safety": {"authority_credit": 1 if not findings else 0, "freeze_credit": 1 if not findings else 0},
        }
        return result, 0 if not findings else 1
    except Exception as error:  # malformed/missing executed evidence is always fail-closed
        findings.append({"code": "DFV2_AUDIT_EXCEPTION", "actual": str(error)})
        return ({**base, "status": "independent_audit_fail_closed", "executed": True,
                 "findings": findings, "safety": {"authority_credit": 0, "freeze_credit": 0}}, 1)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--receipt", type=Path, default=DEFAULT_RECEIPT)
    parser.add_argument("--export", dest="export_path", type=Path, default=DEFAULT_EXPORT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    result, exit_code = audit(args.receipt.resolve(), args.export_path.resolve())
    rendered = json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if args.check:
        if not args.output.exists() or args.output.read_text(encoding="utf-8") != rendered:
            print("FAIL: v2 runtime independent audit output is stale", file=sys.stderr)
            return 1
    else:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(result["status"])
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
