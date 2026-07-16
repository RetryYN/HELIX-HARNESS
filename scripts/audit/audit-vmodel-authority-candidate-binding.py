#!/usr/bin/env python3
"""Byte-exact independent audit of the pending V-model authority candidate binding."""

import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RECEIPT = ROOT / "docs/governance/vmodel-authority-receipt-v1.md"
PACKET = ROOT / "docs/governance/generated/vmodel-authority-decision-packet-v1.json"
OUTPUT = ROOT / "docs/governance/generated/vmodel-authority-candidate-binding-independent-audit-v1.json"
RECEIPT_BINDINGS = {
    "vmodel-canonical-authority-cutover.md": ROOT / "docs/design/helix/L3-requirements/vmodel-canonical-authority-cutover.md",
    "ADR-009-node-python-linux-runtime.md": ROOT / "docs/adr/ADR-009-node-python-linux-runtime.md",
    "infinity-loop-platform-requirements.md": ROOT / "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md",
    "infinity-loop-functional-requirements.md": ROOT / "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md",
    "helix-harness-concept_v3.1.md": ROOT / "docs/governance/helix-harness-concept_v3.1.md",
    "helix-harness-requirements_v1.2.md": ROOT / "docs/governance/helix-harness-requirements_v1.2.md",
    "helix-charter_v0.1.md": ROOT / "docs/design/helix/L0-charter/helix-charter_v0.1.md",
}


def sha256_bytes(value):
    return hashlib.sha256(value).hexdigest()


def sha256(path):
    return sha256_bytes(path.read_bytes())


def build():
    raw = RECEIPT.read_bytes()
    text = raw.decode()
    packet = json.loads(PACKET.read_text())
    findings = []
    front = text.split("---", 2)[1]
    fields = {}
    for line in front.splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            fields[key.strip()] = value.strip()

    binding_checks = []
    for label, path in RECEIPT_BINDINGS.items():
        match = re.search(rf"\| `{re.escape(label)}` \| `([0-9a-f]{{64}})` \|", text)
        embedded = match.group(1) if match else None
        current = sha256(path)
        binding_checks.append({"label": label, "path": str(path.relative_to(ROOT)), "embedded_sha256": embedded, "current_sha256": current, "current": embedded == current})
        if embedded != current:
            findings.append({"code": "receipt_source_digest_stale", "path": str(path.relative_to(ROOT)), "embedded_sha256": embedded, "current_sha256": current})

    table_start = raw.index("## §1 authority decision".encode())
    table_end = raw.index("### §1.1 machine decision packet".encode())
    section_end = raw.index("## §2 stale条件と独立gate".encode())
    table_digest = sha256_bytes(raw[table_start:table_end])
    declared_table_digest = fields.get("decision_table_sha256")
    binding_row = re.search(r"§1 decision table.*?\| `([0-9a-f]{64})` \|", text)
    row_digest = binding_row.group(1) if binding_row else None
    if declared_table_digest != table_digest or row_digest != table_digest:
        findings.append({"code": "decision_table_digest_mismatch", "frontmatter": declared_table_digest, "binding_row": row_digest, "current_table_sha256": table_digest})
    declared_span_digest = sha256_bytes(raw[table_start:section_end])
    stale_span_label = "§1 decision table（headingから§2直前まで" in text or "§1 decision table（§1 headingから§2直前まで" in text
    if stale_span_label:
        findings.append({
            "code": "decision_table_span_label_inaccurate",
            "declared_span": "§1 headingから§2直前まで",
            "digest_bound_actual_span": "§1 headingから§1.1直前まで",
            "declared_span_sha256": declared_span_digest,
            "bound_sha256": row_digest,
        })

    packet_digest = sha256(PACKET)
    packet_match = re.search(r"vmodel-authority-decision-packet-v1\.json`（SHA-256\s*`([0-9a-f]{64})`", text)
    embedded_packet = packet_match.group(1) if packet_match else None
    if embedded_packet != packet_digest:
        findings.append({"code": "receipt_packet_digest_stale", "embedded_sha256": embedded_packet, "current_sha256": packet_digest})

    packet_sources = []
    for name, source in packet["source_snapshots"].items():
        path = ROOT / source["path"]
        current = sha256(path)
        matched = source["sha256"] == current
        packet_sources.append({"name": name, "path": source["path"], "embedded_sha256": source["sha256"], "current_sha256": current, "current": matched})
        if not matched:
            findings.append({"code": "packet_source_snapshot_stale", "name": name, "path": source["path"], "embedded_sha256": source["sha256"], "current_sha256": current})

    placeholders = {key: fields.get(key) for key in ("approval_event_id", "approved_actor", "approved_at", "approved_digest")}
    expected_fields = {
        "status": "pending-po-approval",
        "requirements_authoring_freeze": "pending",
        "implementation_preflight": "blocked",
        "runtime_cutover": "pending",
        "active_runtime_compatibility": "legacy-l0-l14",
        "python_policy_supersession": "pending",
        "python_tool_activation": "0/29",
    }
    field_mismatches = {key: {"expected": expected, "actual": fields.get(key)} for key, expected in expected_fields.items() if fields.get(key) != expected}
    if field_mismatches:
        findings.append({"code": "pending_runtime_boundary_mismatch", "fields": field_mismatches})
    if set(placeholders.values()) != {"pending"}:
        findings.append({"code": "approval_placeholder_not_pending", "fields": placeholders})
    packet_boundary = packet.get("invariants", {})
    expected_packet = {"approved": False, "requirements_authoring_freeze": "pending", "implementation_preflight": "blocked", "runtime_cutover": "pending", "python_tool_activation": "0/29", "target_evidence_active_credit": 0}
    packet_mismatches = {key: {"expected": expected, "actual": packet_boundary.get(key)} for key, expected in expected_packet.items() if packet_boundary.get(key) != expected}
    if packet_mismatches or packet.get("status") != "pending_po_activation" or any(packet.get("approval", {}).values()):
        findings.append({"code": "packet_pending_boundary_mismatch", "fields": packet_mismatches})

    stale = [finding for finding in findings if finding["code"] in {"receipt_source_digest_stale", "receipt_packet_digest_stale", "packet_source_snapshot_stale", "decision_table_digest_mismatch", "decision_table_span_label_inaccurate"}]
    return {
        "schema_version": "helix.vmodel-authority-candidate-binding-independent-audit.v1",
        "status": "candidate_binding_stale_pending_approval_preserved" if stale else "candidate_binding_current_pending_approval_preserved",
        "sources": {"receipt": {"path": str(RECEIPT.relative_to(ROOT)), "sha256": sha256(RECEIPT)}, "packet": {"path": str(PACKET.relative_to(ROOT)), "sha256": packet_digest}},
        "receipt_source_bindings": binding_checks,
        "decision_table": {"byte_span": "§1 heading inclusive to §1.1 heading exclusive", "bytes": table_end - table_start, "current_sha256": table_digest, "frontmatter_sha256": declared_table_digest, "binding_row_sha256": row_digest, "all_equal": table_digest == declared_table_digest == row_digest},
        "packet_binding": {"embedded_sha256": embedded_packet, "current_sha256": packet_digest, "current": embedded_packet == packet_digest, "source_snapshots": packet_sources},
        "approval_boundary": {"receipt_placeholders": placeholders, "receipt_fields": {key: fields.get(key) for key in expected_fields}, "packet_status": packet.get("status"), "packet_approval": packet.get("approval"), "packet_invariants": packet_boundary, "activation_performed": False},
        "refresh_policy": "Pending candidate source/packet digests may be refreshed, but refresh cannot inherit or synthesize approval and cannot change runtime/implementation/Python activation boundaries.",
        "summary": {"receipt_source_bindings": len(binding_checks), "receipt_source_bindings_current": sum(row["current"] for row in binding_checks), "packet_source_snapshots": len(packet_sources), "packet_source_snapshots_current": sum(row["current"] for row in packet_sources), "decision_table_current": table_digest == declared_table_digest == row_digest, "packet_digest_current": embedded_packet == packet_digest, "approval_placeholders_pending": set(placeholders.values()) == {"pending"}, "runtime_boundaries_preserved": not field_mismatches and not packet_mismatches},
        "findings": findings,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    result = build()
    rendered = json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if args.check:
        if not OUTPUT.is_file() or OUTPUT.read_text() != rendered:
            raise SystemExit("V-model candidate binding audit artifact is stale")
    else:
        OUTPUT.write_text(rendered)


if __name__ == "__main__":
    main()
