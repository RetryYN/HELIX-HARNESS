#!/usr/bin/env python3
"""固定BASEから既存の218 evidence partitionを静的に再導出する共通処理。"""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
BASE_COMMIT = "94d99ebb4c55c2edb0575ac2dc100af0d5b93b90"
BUNDLE_REL = "scaffold/legacy-evidence-crosswalk-0146"

SOURCE_PARTITIONS = (
    "scaffold/fr-implementation-evidence-0109/evidence.jsonl",
    "scaffold/fr-implementation-evidence-0110/evidence.jsonl",
    "scaffold/fr-implementation-evidence-0111/evidence.jsonl",
    "scaffold/br-implementation-evidence-0102/evidence.jsonl",
    "scaffold/br-implementation-evidence-0104/evidence.jsonl",
    "scaffold/br-implementation-evidence-0106/evidence.jsonl",
    "scaffold/nfr-implementation-evidence-0113/evidence.jsonl",
    "scaffold/nfr-implementation-evidence-0114/evidence.jsonl",
    "scaffold/tr-implementation-evidence-0112/evidence.jsonl",
)

CANONICAL_INPUTS = (
    "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl",
    "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl",
    "docs/governance/legacy-asset-disposition.jsonl",
    "docs/governance/legacy-asset-decisions.jsonl",
    "docs/governance/legacy-asset-copy-read-after.jsonl",
)

INPUT_PATHS = SOURCE_PARTITIONS + CANONICAL_INPUTS

FIELD_SPECS = {
    "old_implementation": {
        "expected_status": "unknown",
        "reason_code": "E_OLD_IMPLEMENTATION_DIRECT_RECEIPT_MISSING",
        "artifact_keys": [
            "asset_id", "source_path", "source_blob_sha256", "source_anchor",
            "execution_receipt_sha256", "result", "acceptance_verdict",
        ],
        "relation_keys": [
            "unit_candidate_id", "requirement_atom_id", "semantic_edge_id",
            "asset_id", "receipt_ref",
        ],
        "human_decision_keys": ["decision_id", "authority", "verdict", "decision_revision"],
    },
    "old_degradation": {
        "expected_status": "unknown",
        "reason_code": "E_OLD_DEGRADATION_OBSERVED_TRANSITION_MISSING",
        "artifact_keys": [
            "asset_id", "source_anchor", "before_state", "after_state",
            "trigger", "observed_at", "revision", "degradation_receipt_sha256",
        ],
        "relation_keys": [
            "unit_candidate_id", "requirement_atom_id", "semantic_edge_id",
            "asset_id", "affected_atom_ids",
        ],
        "human_decision_keys": ["decision_id", "authority", "classification", "decision_revision"],
    },
    "old_failure": {
        "expected_status": "unknown",
        "reason_code": "E_OLD_FAILURE_RECEIPT_MISSING",
        "artifact_keys": [
            "asset_id", "source_anchor", "failure_code", "status_or_exit",
            "observed_at", "revision", "failure_receipt_sha256",
        ],
        "relation_keys": [
            "unit_candidate_id", "requirement_atom_id", "semantic_edge_id",
            "asset_id", "acceptance_ref",
        ],
        "human_decision_keys": ["decision_id", "authority", "failure_classification", "decision_revision"],
    },
    "consumer": {
        "expected_status": "pending",
        "reason_code": "E_CONSUMER_CLOSURE_RELATION_MISSING",
        "artifact_keys": [
            "consumer_id", "closure_receipt_sha256", "decision_record_ref",
            "read_after_record_ref", "revision",
        ],
        "relation_keys": [
            "unit_candidate_id", "requirement_atom_id", "asset_id",
            "consumer_id", "acceptance_ref",
        ],
        "human_decision_keys": ["decision_id", "authority", "closure_verdict", "decision_revision"],
    },
    "current_implementation": {
        "expected_status": "unknown",
        "reason_code": "E_CURRENT_IMPLEMENTATION_RECEIPT_MISSING",
        "artifact_keys": [
            "current_path", "current_blob_sha256", "source_anchor",
            "execution_receipt_sha256", "operation_result", "revision",
        ],
        "relation_keys": [
            "unit_candidate_id", "requirement_atom_id", "current_source_ref",
            "acceptance_ref",
        ],
        "human_decision_keys": ["decision_id", "authority", "implementation_verdict", "decision_revision"],
    },
    "acceptance": {
        "expected_status": "unknown",
        "reason_code": "E_ACCEPTANCE_VERDICT_MISSING",
        "artifact_keys": [
            "acceptance_id", "criteria", "verdict", "evidence_refs",
            "revision", "acceptance_receipt_sha256",
        ],
        "relation_keys": [
            "unit_candidate_id", "requirement_atom_id", "source_ref",
            "edge_ref", "consumer_ref",
        ],
        "human_decision_keys": ["decision_id", "authority", "acceptance_verdict", "decision_revision"],
    },
    "unimplemented": {
        "expected_status": "not_assessed",
        "reason_code": "E_NONIMPLEMENTATION_DECISION_MISSING",
        "artifact_keys": [
            "non_implementation_decision_id", "search_scope", "search_scope_digest",
            "negative_result", "counterevidence_refs",
        ],
        "relation_keys": [
            "unit_candidate_id", "requirement_atom_id", "search_scope",
            "counterevidence_ref",
        ],
        "human_decision_keys": ["decision_id", "authority", "disposition", "decision_revision"],
    },
}

NEGATIVE_CASE_CODES = [
    "E_BUNDLE",
    "E_BASE_NOT_ANCESTOR",
    "E_BASE_COMMIT",
    "E_INPUT_DIGEST",
    "E_OUTPUT_DIGEST",
    "E_TRANSFER_MANIFEST",
    "E_RECORD_SET",
    "E_PRODUCT_DENOMINATOR",
    "E_IRCONN_DENOMINATOR",
    "E_EDGE_SET",
    "E_EDGE_DUPLICATE",
    "E_ASSET_SET",
    "E_ASSET_DUPLICATE",
    "E_STATUS_PARTITION",
    "E_REQUIRED_EVIDENCE_SCHEMA",
    "E_INVENTORY_DECLARATION",
    "E_RECORD_RELATION",
    "E_AUTHORITY_BOUNDARY",
    "E_TOP_LEVEL_KEY",
]


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_obj(value) -> str:
    return sha256_bytes(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def git_bytes(path: str) -> bytes:
    result = subprocess.run(
        ["git", "-C", str(ROOT), "show", f"{BASE_COMMIT}:{path}"],
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode:
        raise RuntimeError(f"BASEから読めない入力 {path}: {result.stderr.decode(errors='replace').strip()}")
    return result.stdout


def check_base_ancestor() -> bool:
    result = subprocess.run(
        ["git", "-C", str(ROOT), "merge-base", "--is-ancestor", BASE_COMMIT, "HEAD"],
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return result.returncode == 0


def parse_jsonl(path: str):
    data = git_bytes(path)
    out = []
    for line_no, raw in enumerate(data.splitlines(keepends=True), 1):
        if not raw.strip():
            continue
        out.append((line_no, raw, json.loads(raw.decode("utf-8"))))
    return data, out


def input_digests():
    return [{"path": path, "sha256": sha256_bytes(git_bytes(path))} for path in INPUT_PATHS]


def load_decomposition():
    _, rows = parse_jsonl(CANONICAL_INPUTS[1])
    by_unit = {}
    for parent_line, parent_raw, parent in rows:
        for candidate_index, candidate in enumerate(parent.get("candidate_units") or []):
            unit_id = candidate.get("unit_candidate_id")
            if not unit_id or unit_id in by_unit:
                raise ValueError(f"decomposition candidate unit重複または欠落: {unit_id!r}")
            by_unit[unit_id] = {
                "parent_line": parent_line,
                "parent_row_sha256": "sha256:" + sha256_bytes(parent_raw),
                "candidate_index": candidate_index,
                "candidate_sha256": "sha256:" + sha256_obj(candidate),
                "candidate": candidate,
            }
    return by_unit


def load_canonical():
    _, crosswalk_rows = parse_jsonl(CANONICAL_INPUTS[0])
    crosswalk = {}
    for line_no, raw, row in crosswalk_rows:
        unit_id = row.get("unit_candidate_id")
        if not unit_id or unit_id in crosswalk:
            raise ValueError(f"crosswalk unit重複または欠落: {unit_id!r}")
        crosswalk[unit_id] = {
            "line": line_no,
            "row_sha256": "sha256:" + sha256_bytes(raw),
            "row": row,
        }
    decomposition = load_decomposition()
    _, ledger_rows = parse_jsonl(CANONICAL_INPUTS[2])
    ledger = {}
    for _, _, row in ledger_rows:
        asset_id = row.get("asset_id")
        if asset_id:
            ledger[asset_id] = row
    return crosswalk, decomposition, ledger


def load_partition_rows():
    rows = []
    for path in SOURCE_PARTITIONS:
        _, parsed = parse_jsonl(path)
        for line_no, raw, row in parsed:
            rows.append({
                "path": path,
                "line": line_no,
                "row_sha256": "sha256:" + sha256_bytes(raw),
                "row": row,
            })
    return rows


def subject_kind(unit_id: str) -> str:
    return "connection" if unit_id.startswith("IRCONN-") else "product_unit"


def family(unit_id: str) -> str:
    match = re.match(r"^IR(?:UNIT|CONN)-HIL-([A-Z]+)-", unit_id)
    return match.group(1) if match else "UNKNOWN"


def raw_sections(row):
    if row.get("schema", "").startswith("br-"):
        return (
            row.get("legacy_implementation_evidence") or {},
            row.get("legacy_degradation_evidence") or {},
            row.get("legacy_failure_evidence") or {},
            row.get("legacy_consumer_evidence") or {},
        )
    return (
        row.get("implementation_evidence") or {},
        row.get("degradation_evidence") or {},
        row.get("failure_evidence") or {},
        row.get("consumer_evidence") or {},
    )


def raw_observations(row):
    impl, degradation, failure, consumer = raw_sections(row)
    current = row.get("current_implementation_evidence") or {}
    unimplemented = row.get("unimplemented_assessment") or {}
    is_br = row.get("schema", "").startswith("br-")
    return {
        "legacy_execution_performed": bool(impl.get("execution_performed") if is_br else impl.get("legacy_execution_performed")),
        "implementation_claim": bool(impl.get("explicit_implementation_claim")),
        "degradation_execution_performed": bool(degradation.get("legacy_execution_performed")),
        "degradation_claim": bool(degradation.get("explicit_degradation_claim")),
        "failure_claim": bool(failure.get("explicit_failure_claim")),
        "failure_receipt_count": len(failure.get("observed_failure_receipts") or []),
        "consumer_closure_status": consumer.get("closure_status"),
        "consumer_closure_evidence_count": len(consumer.get("consumer_closure_evidence") or []),
        "current_execution_performed": bool(current.get("execution_performed")),
        "current_claim": bool(current.get("explicit_claim")),
        "current_status": current.get("status"),
        "acceptance_status": current.get("acceptance_status"),
        "non_implementation_claim": bool(unimplemented.get("explicit_non_implementation_claim")),
    }


def direct_evidence_flags(row):
    obs = raw_observations(row)
    # 直接unit証拠として認めるreceipt schemaを明示する。固定BASEでは全て欠落する。
    impl_direct = obs["implementation_claim"] and obs["legacy_execution_performed"]
    degradation_direct = obs["degradation_claim"] and obs["degradation_execution_performed"]
    failure_direct = obs["failure_claim"] and obs["failure_receipt_count"] > 0
    consumer_direct = (
        obs["consumer_closure_status"] == "closed"
        and obs["consumer_closure_evidence_count"] > 0
    )
    current_direct = obs["current_claim"] and obs["current_execution_performed"] and obs["current_status"] not in (None, "unknown")
    acceptance_direct = obs["acceptance_status"] not in (None, "unknown", "not_assessed")
    unimplemented_direct = obs["non_implementation_claim"]
    return {
        "old_implementation": impl_direct,
        "old_degradation": degradation_direct,
        "old_failure": failure_direct,
        "consumer": consumer_direct,
        "current_implementation": current_direct,
        "acceptance": acceptance_direct,
        "unimplemented": unimplemented_direct,
    }


def edge_rows(row):
    edges = []
    for entry in row.get("semantic_review_edges") or []:
        edge = entry.get("edge") if isinstance(entry, dict) and isinstance(entry.get("edge"), dict) else entry
        edges.append({
            "review_id": edge.get("review_id"),
            "asset_id": edge.get("asset_id"),
            "wave": edge.get("wave"),
            "source_review_file": edge.get("source_review_file"),
            "source_path": edge.get("source_path"),
            "source_sha256": edge.get("source_sha256"),
            "source_requirement_id": edge.get("source_requirement_id"),
            "unit_candidate_id": edge.get("unit_candidate_id"),
            "legacy_execution_status": edge.get("legacy_execution_status"),
            "legacy_requirement_implementation_contribution": edge.get("legacy_requirement_implementation_contribution"),
            "consumer_closure_status": edge.get("consumer_closure_status"),
            "current_requirement_implementation_status": edge.get("current_requirement_implementation_status"),
        })
    return edges


def asset_ids(row):
    if row.get("asset_set"):
        return list(row["asset_set"].get("asset_ids") or [])
    return [asset.get("asset_id") for asset in (row.get("old_asset_evidence", {}).get("assets") or [])]


def field_record(field: str, direct: bool):
    spec = FIELD_SPECS[field]
    if direct:
        raise ValueError(f"固定BASEで直接unit証拠が見つかったため期待unknown境界を維持できない: {field}")
    return {
        "status": spec["expected_status"],
        "direct_evidence_present": False,
        "reason_code": spec["reason_code"],
        "required_evidence_schema": {
            "artifact_keys": list(spec["artifact_keys"]),
            "relation_keys": list(spec["relation_keys"]),
            "human_decision_keys": list(spec["human_decision_keys"]),
        },
    }


def derive_record(source):
    row = source["row"]
    unit_id = row["unit_candidate_id"]
    crosswalk, decomposition, ledger = source["crosswalk"], source["decomposition"], source["ledger"]
    cw = crosswalk[unit_id]
    dec = decomposition[unit_id]
    crosswalk_row = cw["row"]
    edges = edge_rows(row)
    assets = asset_ids(row)
    if any(not value for value in assets):
        raise ValueError(f"asset id欠落: {unit_id}")
    if any(not edge["review_id"] for edge in edges):
        raise ValueError(f"review id欠落: {unit_id}")
    flags = direct_evidence_flags(row)
    status_partition = {field: field_record(field, flags[field]) for field in FIELD_SPECS}
    observations = raw_observations(row)
    subject = {
        "unit_candidate_id": unit_id,
        "subject_kind": subject_kind(unit_id),
        "requirement_family": family(unit_id),
        "source_requirement_id": crosswalk_row.get("source_requirement_id"),
        "product_scope": list(crosswalk_row.get("product_scope") or []),
        "unit_kind": crosswalk_row.get("unit_kind"),
        "authority_effect": crosswalk_row.get("authority_effect"),
        "crosswalk_id": crosswalk_row.get("crosswalk_id"),
    }
    return {
        "schema": "legacy-evidence-crosswalk-0146/v1/record",
        "authority_boundary": {
            "authority_effect": "none",
            "formal_status_change": False,
            "formal_acceptance": False,
            "successor_assignment": "unassigned",
        },
        "subject": subject,
        "source_record": {
            "partition_path": source["path"],
            "partition_line": source["line"],
            "partition_row_sha256": source["row_sha256"],
            "partition_schema": row.get("schema"),
            "crosswalk_line": cw["line"],
            "crosswalk_row_sha256": cw["row_sha256"],
            "decomposition_parent_line": dec["parent_line"],
            "decomposition_parent_row_sha256": dec["parent_row_sha256"],
            "decomposition_candidate_index": dec["candidate_index"],
            "decomposition_candidate_sha256": dec["candidate_sha256"],
        },
        "coverage": {
            "edge_ids": [edge["review_id"] for edge in edges],
            "edge_refs": edges,
            "asset_ids": assets,
            "asset_record_count": len(assets),
        },
        "raw_observations": observations,
        "status_partition": status_partition,
        "unresolved": [
            "old_implementation_unknown",
            "old_degradation_unknown",
            "old_failure_unknown",
            "consumer_closure_pending",
            "current_implementation_unknown",
            "acceptance_unknown",
            "unimplemented_not_assessed",
        ],
        "prohibited_inference": [
            "source_or_design_presence_is_not_unit_implementation",
            "static_coverage_failure_is_not_observed_failure",
            "consumer_reference_is_not_closed_consumer_acceptance",
            "current_requirement_candidate_is_not_current_implementation",
            "missing_receipt_is_not_explicit_non_implementation",
        ],
        "ledger_asset_ids_checked": [asset_id for asset_id in assets if asset_id in ledger],
    }


def derive_all():
    crosswalk, decomposition, ledger = load_canonical()
    source_rows = load_partition_rows()
    by_id = {}
    for source in source_rows:
        unit_id = source["row"].get("unit_candidate_id")
        if not unit_id or unit_id in by_id:
            raise ValueError(f"source partition unit重複または欠落: {unit_id!r}")
        source["crosswalk"] = crosswalk
        source["decomposition"] = decomposition
        source["ledger"] = ledger
        by_id[unit_id] = derive_record(source)
    if set(by_id) != set(crosswalk) or set(by_id) != set(decomposition):
        raise ValueError("source/crosswalk/decompositionのrecord setが一致しない")
    records = [by_id[unit_id] for unit_id in crosswalk]
    return records, crosswalk, decomposition, ledger


def counts(records):
    edge_ids = [edge_id for record in records for edge_id in record["coverage"]["edge_ids"]]
    asset_ids = [asset_id for record in records for asset_id in record["coverage"]["asset_ids"]]
    product_units = [r for r in records if r["subject"]["subject_kind"] == "product_unit"]
    connections = [r for r in records if r["subject"]["subject_kind"] == "connection"]
    return {
        "records": len(records),
        "product_units": len(product_units),
        "connections": len(connections),
        "semantic_review_edges": len(edge_ids),
        "unique_semantic_review_edges": len(set(edge_ids)),
        "asset_references": len(asset_ids),
        "unique_old_assets": len(set(asset_ids)),
        "status_fields": {
            field: {status: sum(record["status_partition"][field]["status"] == status for record in records) for status in {record["status_partition"][field]["status"] for record in records}}
            for field in FIELD_SPECS
        },
    }
