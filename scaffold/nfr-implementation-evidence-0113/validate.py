#!/usr/bin/env python3
"""SCF-B-0113の固定BASE静的証拠bundleをfail-closedで検査する。"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
BUNDLE = Path(__file__).resolve().parent
BASE = "0d51a994f418450efc40438244f0552e428fc207"
SCHEMA = "nfr-implementation-evidence-0113/v1"
UNIT_SCHEMA = SCHEMA + "/unit"
BINDING_ID = "SCF-B-0113"
BASE_DECLARATION = {
    "repository": "HELIX-HARNESS",
    "commit": BASE,
    "branch": "main",
    "required_ancestor": BASE,
}
UNIT_TOP_LEVEL_KEYS = frozenset({
    "schema", "unit_candidate_id", "source_requirement", "source_anchor",
    "semantic_review_edges", "asset_set", "old_asset_evidence",
    "implementation_evidence", "degradation_evidence", "failure_evidence",
    "consumer_evidence", "representative_assets", "current_context",
    "current_implementation_evidence", "unimplemented_assessment",
    "authority_boundary", "unresolved",
})
OLD_ASSET_WRAPPER_KEYS = frozenset({"assets", "static_only", "not_implementation_proof"})
CROSSWALK = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
IR = "archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json"
DECOMP = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
CLASSIFICATION = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
CLASSIFICATION_META = "docs/governance/legacy-asset-phase-product-classification-bootstrap.meta.json"
SOURCE_IDS = [f"HIL-NFR-{n:02d}" for n in range(1, 21)]
UNIT_PATTERN = re.compile(r"^IRUNIT-HIL-NFR-(0[1-9]|1[0-9]|20)-HELIX-(OS|HARNESS)$")
CONTEXT_INPUTS = [
    "docs/concept/product-boundary.md",
    "docs/helix-harness/L1-planning/product-intent.md",
    "docs/helix-os/L1-planning/system-intent.md",
    "docs/helix-web/L1-planning/product-intent.md",
    "docs/helix-web-os/L1-planning/system-intent.md",
    "docs/governance/phase-capability-inventory.json",
    "docs/governance/phase-capability-inventory.md",
    "scaffold/phcap20-memory-research/README.md",
    "scaffold/phcap20-memory-research/inventory.json",
]
ANCHOR_POLICY = {
    "wave_1_17": "raw_span_bytes_including_final_newline",
    "wave_18_50": "utf8_lines_strip_crlf_join_lf_without_terminal_newline",
    "provenance": "legacy semantic review evidence_refs excerpt_sha256 static contract; policy is selected by edge wave",
}
EVIDENCE_PARTITION = {
    "source_statement": "crosswalk source_requirement snapshot",
    "candidate": "representative_legacy_assets and catalog status; search candidates only",
    "old_implementation": "implementation_source/test_source review edges; static, unexecuted, unit status unknown",
    "old_failure": "coverage.failure and ledger failure fields; observed receipt only, status unknown",
    "old_degradation": "phase transition and constraint assessment only; unit status unknown",
    "old_consumer": "observed refs and ledger/decision/read-after refs; closure pending",
    "current_implementation": "current context refs only; direct implementation evidence absent, status unknown",
    "current_acceptance": "direct acceptance receipt only; none found, status unknown",
}
PROHIBITED_INFERENCE = [
    "candidate_asset_pool、旧source存在、Wave edge、phase transition、coverage.failure、validator PASSから実装成立を導かない",
    "証拠欠落やunknownから未実装を断定しない",
    "degradation/failureの静的partitionから実行failureを導かない",
    "consumer refs、decision、read-afterからconsumer closureを導かない",
    "phase/product candidateから正式authority・successor・current acceptanceを生成しない",
]
UNRESOLVED = [
    "unit_implementation_status_unknown", "unit_degradation_status_unknown", "unit_failure_status_unknown",
    "consumer_closure_pending", "direct_phase_product_authority_pending",
    "current_implementation_evidence_missing", "current_acceptance_evidence_missing",
    "successor_assignment_unassigned",
]
PARTITION_CONTRACT = {
    "implementation": "旧implementation_source/test_sourceは候補source存在の静的記録。unit実装成立・旧実行は示さない",
    "degradation": "crosswalk transition/legacy capabilityとcoverage constraintの静的記録。unit縮退は示さない",
    "failure": "coverage.failure/counterevidence/unresolvedの静的記録。failure receiptは空でunknown",
    "consumer": "edge/ledger/decision/read-after参照の静的記録。consumer closureはpending",
}
NEGATIVE_CASE_CODES = [
    "E_UNIT_SET", "E_UNIT_SCHEMA", "E_REVIEW_EDGE_SET", "E_REVIEW_EDGE_DUP", "E_ASSET_SET",
    "E_INVENTORY_DECLARATION", "E_REPRESENTATIVE_ASSET", "E_IMPLEMENTATION_EVIDENCE",
    "E_DEGRADATION_EVIDENCE", "E_FAILURE_EVIDENCE", "E_CONSUMER_EVIDENCE", "E_SOURCE_ANCHOR",
    "E_OLD_ASSET_SOURCE", "E_OLD_ASSET_EVIDENCE", "E_INPUT_DIGEST", "E_BASE_COMMIT",
    "E_BASE_NOT_ANCESTOR", "E_AUTHORITY_BOUNDARY", "E_CURRENT_STATUS", "E_UNIMPLEMENTED_CLAIM",
]


def base_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE}:{path}"], cwd=ROOT)


def base_json(path: str) -> Any:
    return json.loads(base_bytes(path).decode("utf-8"))


def base_jsonl(path: str) -> list[dict[str, Any]]:
    return [json.loads(line) for line in base_bytes(path).decode("utf-8").splitlines() if line.strip()]


def sha256(data: bytes, prefix: bool = True) -> str:
    value = hashlib.sha256(data).hexdigest()
    return f"sha256:{value}" if prefix else value


def base_digest(path: str) -> str:
    return sha256(base_bytes(path), prefix=False)


def base_blob(path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", f"{BASE}:{path}"], cwd=ROOT, text=True).strip()


def canonical_digest(value: Any) -> str:
    return sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8"))


def wave_paths() -> dict[int, str]:
    paths = {}
    for wave in range(1, 51):
        docs = f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"
        scaffold = f"scaffold/legacy-semantic-review-wave{wave}/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"
        paths[wave] = docs if subprocess.run(
            ["git", "cat-file", "-e", f"{BASE}:{docs}"], cwd=ROOT,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        ).returncode == 0 else scaffold
    return paths


WAVE_PATHS = wave_paths()
INPUT_PATHS = [CROSSWALK, IR, DECOMP, DISPOSITION, DECISIONS, READ_AFTER, CLASSIFICATION, CLASSIFICATION_META]
INPUT_PATHS += [WAVE_PATHS[n] for n in range(1, 51)]
INPUT_PATHS += CONTEXT_INPUTS


def source_range(requirement_id: str) -> dict[str, Any]:
    raw = base_bytes(IR)
    lines = raw.splitlines(keepends=True)
    start = next(i for i, line in enumerate(lines) if re.match(rb'^  "' + requirement_id.encode() + rb'": \{', line))
    next_start = next(
        (i for i in range(start + 1, len(lines)) if re.match(rb'^  "HIL-[A-Z]+-[0-9]+": \{', lines[i])),
        len(lines),
    )
    selected = b"".join(lines[start:next_start])
    return {
        "path": IR,
        "json_pointer": f"requirements-ir/requirements.json#/{requirement_id}",
        "line_start": start + 1,
        "line_end": next_start,
        "span_sha256": sha256(selected),
        "file_sha256": base_digest(IR),
        "line_text_sha256": sha256(selected, prefix=False),
    }


def anchor_resolution(edge: dict[str, Any]) -> dict[str, Any]:
    references = []
    for ref in edge.get("evidence_refs", []):
        archive_path = ref.get("archive_path")
        actual = None
        range_status = "valid"
        try:
            data = base_bytes(archive_path)
            lines = data.splitlines(keepends=True)
            start, end = ref["line_start"], ref["line_end"]
            selected = lines[start - 1:end]
            if len(selected) != end - start + 1:
                range_status = "invalid"
            else:
                raw = b"".join(selected)
                actual = sha256(raw)
                without_terminal_newline = sha256(raw[:-1]) if raw.endswith(b"\n") else actual
                normalized = "\n".join(line.decode("utf-8").rstrip("\r\n") for line in selected).encode("utf-8")
                normalized_digest = sha256(normalized)
        except (KeyError, subprocess.CalledProcessError, OSError):
            range_status = "missing"
        declared = ref.get("excerpt_sha256")
        if actual is None:
            without_terminal_newline = None
            normalized_digest = None
            hash_basis = "unresolved"
        elif edge.get("wave", 0) <= 17 and declared == actual:
            hash_basis = "raw_span_bytes"
        elif edge.get("wave", 0) >= 18 and declared == normalized_digest:
            hash_basis = "utf8_lines_strip_crlf_join_lf_without_terminal_newline"
        else:
            hash_basis = "unresolved"
        references.append({
            "review_id": edge["review_id"], "evidence_ref_id": ref.get("evidence_ref_id"),
            "archive_path": archive_path, "line_start": ref.get("line_start"), "line_end": ref.get("line_end"),
            "declared_excerpt_sha256": declared, "base_excerpt_sha256": actual,
            "base_excerpt_sha256_without_terminal_newline": without_terminal_newline,
            "base_excerpt_sha256_lf_join_without_terminal_newline": normalized_digest,
            "declared_hash_basis": hash_basis,
            "base_file_sha256": base_digest(archive_path) if actual is not None else None,
            "git_blob_oid_at_base": base_blob(archive_path) if actual is not None else None,
            "range_status": range_status, "digest_matches": hash_basis != "unresolved",
        })
    mismatches = [ref for ref in references if not ref["digest_matches"]]
    return {
        "status": "resolved" if not mismatches else "unresolved_declared_digest_mismatch_at_base",
        "references": references,
        "mismatch_count": len(mismatches),
        "why_unresolved": (
            "旧semantic reviewが保持するexcerpt digestと固定BASE archive bytesが一致しないため、"
            "旧anchorの成立を断定せず、宣言値とBASE実値を分離して保留する"
            if mismatches else "全旧anchorの宣言excerpt digestが固定BASE bytesと一致する"
        ),
    }


def compact_edge(row: dict[str, Any], wave: int, source_file: str) -> dict[str, Any]:
    result = {key: row[key] for key in sorted(row)}
    result["wave"] = wave
    result["source_review_file"] = source_file
    result["anchor_resolution"] = anchor_resolution(result)
    return result


def target_crosswalk() -> list[dict[str, Any]]:
    rows = [row for row in base_jsonl(CROSSWALK) if row.get("source_requirement_id") in SOURCE_IDS]
    if len(rows) != 31 or any(not UNIT_PATTERN.fullmatch(row.get("unit_candidate_id", "")) for row in rows):
        raise ValueError("HIL-NFR-01〜20 crosswalk unit集合が不正")
    if len({row["unit_candidate_id"] for row in rows}) != 31:
        raise ValueError("HIL-NFR-01〜20 unitが重複している")
    return rows


def scan_edges() -> tuple[dict[str, list[dict[str, Any]]], int, list[str]]:
    by_unit: dict[str, list[dict[str, Any]]] = {}
    scan_count = 0
    files = [WAVE_PATHS[n] for n in range(1, 51)]
    for wave, path in WAVE_PATHS.items():
        for row in base_jsonl(path):
            scan_count += 1
            unit = row.get("unit_candidate_id")
            if unit and UNIT_PATTERN.fullmatch(unit) and row.get("source_requirement_id") in SOURCE_IDS:
                by_unit.setdefault(unit, []).append(compact_edge(row, wave, path))
    for unit in by_unit:
        by_unit[unit].sort(key=lambda edge: (edge["wave"], edge["review_id"]))
    return by_unit, scan_count, files


def expected_source(source: dict[str, Any], decomp: dict[str, Any]) -> dict[str, Any]:
    pool = source.get("candidate_asset_pool", {})
    pool_ids = pool.get("phase_and_product_candidate_asset_ids", [])
    return {
        "crosswalk_id": source.get("crosswalk_id"), "schema_revision": source.get("schema_revision"),
        "source_requirement_id": source["source_requirement_id"], "source_revision": source.get("source_revision"),
        "source_statement_semantic_digest": source.get("source_statement_semantic_digest"),
        "source_text_spans": source.get("source_text_spans", []), "product_scope": source.get("product_scope", []),
        "status_scope": source.get("status_scope"), "unit_kind": source.get("unit_kind"),
        "responsibility_summary": source.get("responsibility_summary"),
        "direct_phase_candidates": source.get("direct_phase_candidates", []),
        "phase_classification_status": source.get("phase_classification_status"),
        "phase_rationale": source.get("phase_rationale"),
        "legacy_requirement_implementation_status": source.get("legacy_requirement_implementation_status"),
        "current_requirement_implementation_status": source.get("current_requirement_implementation_status"),
        "unimplemented_assessment_status": source.get("unimplemented_assessment_status"),
        "successor_assignment_status": source.get("successor_assignment_status"),
        "consumer_closure_status": source.get("consumer_closure_status"),
        "direct_legacy_asset_link_status": source.get("direct_legacy_asset_link_status"),
        "direct_legacy_asset_links": source.get("direct_legacy_asset_links", []),
        "legacy_execution_performed": source.get("legacy_execution_performed"),
        "new_build_allowed": source.get("new_build_allowed"), "authority_effect": source.get("authority_effect"),
        "unresolved": source.get("unresolved", []),
        "candidate_asset_pool": {
            key: value for key, value in pool.items() if key != "phase_and_product_candidate_asset_ids"
        } | {
            "phase_and_product_candidate_asset_ids_count": len(pool_ids),
            "phase_and_product_candidate_asset_ids_digest": canonical_digest(pool_ids),
        },
        "representative_asset_candidates": source.get("representative_legacy_assets", []),
        "phase_capability_evidence": source.get("phase_capability_evidence", []),
        "decomposition_id": decomp.get("decomposition_id"),
        "decomposition_unit": next(
            (unit for unit in decomp.get("candidate_units", []) if unit.get("unit_candidate_id") == source.get("unit_candidate_id")),
            None,
        ),
    }


def old_asset_record(asset_id: str, edges: list[dict[str, Any]], disposition: dict[str, dict[str, Any]],
                     decisions: list[dict[str, Any]], read_after: list[dict[str, Any]],
                     classifications: dict[str, dict[str, Any]]) -> dict[str, Any]:
    old = disposition[asset_id]
    asset_edges = [edge for edge in edges if edge.get("asset_id") == asset_id]
    coverage_failures = sorted({edge.get("coverage", {}).get("failure") for edge in asset_edges if edge.get("coverage", {}).get("failure")})
    unresolved = sorted({item for edge in asset_edges for item in edge.get("unresolved", [])})
    edge_counterevidence = [{"review_id": edge["review_id"], "counterevidence": edge.get("counterevidence", [])} for edge in asset_edges]
    edge_consumers = sorted({ref for edge in asset_edges for ref in edge.get("observed_consumer_refs", [])})
    classification = classifications.get(asset_id)
    archive_path = f"archive/legacy-generation-2026-09-14/root/{old['source_path']}"
    return {
        "asset_id": asset_id,
        "source": {
            "source_path": old["source_path"], "archive_path": archive_path,
            "source_sha256": old["source_sha256"], "source_revision": old.get("source_revision"),
            "source_surface": old.get("source_surface"), "source_provenance_ref": old.get("source_provenance_ref"),
            "artifact_evidence_kind": sorted({edge.get("artifact_evidence_kind") for edge in asset_edges}),
            "git_blob_oid_at_base": base_blob(archive_path),
            "git_blob_sha256_at_base": sha256(base_bytes(archive_path), prefix=False),
        },
        "history": {
            "asset_class": old.get("asset_class"), "authority_status": old.get("authority_status"),
            "disposition": old.get("disposition"), "implementation_status": old.get("implementation_status"),
            "decision_record_ref": old.get("decision_record_ref"),
            "classification_id": classification.get("classification_id") if classification else None,
            "phase_classification_status": classification.get("phase_classification_status") if classification else None,
            "product_classification_status": classification.get("product_classification_status") if classification else None,
        },
        "failure": {
            "static_only": True, "coverage_failures": coverage_failures,
            "edge_counterevidence": edge_counterevidence, "unresolved": unresolved,
            "observed_failure_status": "unknown", "observed_failure_receipts": [],
        },
        "consumer": {
            "static_only": True, "closure_status": old.get("consumer_refs") and "pending" or "unknown",
            "ledger_consumer_refs": sorted(old.get("consumer_refs", [])), "edge_consumer_refs": edge_consumers,
            "edge_evidence_count": len(asset_edges),
            "decision_records": [row for row in decisions if row.get("asset_id") == asset_id],
            "read_after_records": [row for row in read_after if row.get("asset_id") == asset_id],
        },
        "ledger_record": old, "classification_record": classification,
        "edge_refs": [edge["review_id"] for edge in asset_edges],
        "static_only": True, "not_implementation_proof": True,
    }


def expected_impl(edges: list[dict[str, Any]]) -> dict[str, Any]:
    records = [{
        "review_id": edge["review_id"], "asset_id": edge["asset_id"],
        "artifact_evidence_kind": edge.get("artifact_evidence_kind"), "source_path": edge.get("source_path"),
        "source_sha256": edge.get("source_sha256"),
        "legacy_implementation_status": edge.get("catalog_legacy_implementation_status"),
        "legacy_execution_status": edge.get("legacy_execution_status"),
        "static_only": True, "evidence_role": "candidate_source_presence_only",
    } for edge in edges if edge.get("artifact_evidence_kind") in {"implementation_source", "test_source"}]
    return {
        "status": "static_candidate_partition", "unit_implementation_status": "unknown",
        "explicit_implementation_claim": False, "records": records,
        "supporting_design_edge_refs": [edge["review_id"] for edge in edges if edge.get("artifact_evidence_kind") in {"design", "test_design"}],
        "legacy_execution_performed": False, "current_implementation_status": "unknown",
    }


def expected_degradation(source: dict[str, Any], edges: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "status": "static_transition_and_constraint_partition", "unit_degradation_status": "unknown",
        "explicit_degradation_claim": False, "phase_transition_evidence": source.get("phase_capability_evidence", []),
        "edge_constraint_evidence": [{
            "review_id": edge["review_id"], "coverage": edge.get("coverage", {}),
            "legacy_requirement_implementation_contribution": edge.get("legacy_requirement_implementation_contribution"),
            "static_only": True,
        } for edge in edges],
        "legacy_execution_performed": False,
    }


def expected_failure(edges: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "status": "static_failure_finding_partition", "unit_failure_status": "unknown",
        "explicit_failure_claim": False, "observed_failure_status": "unknown", "observed_failure_receipts": [],
        "records": [{
            "review_id": edge["review_id"], "asset_id": edge["asset_id"],
            "coverage_failure": edge.get("coverage", {}).get("failure"),
            "counterevidence": edge.get("counterevidence", []), "unresolved": edge.get("unresolved", []),
            "static_only": True,
        } for edge in edges],
        "legacy_execution_performed": False,
    }


def expected_consumer(edges: list[dict[str, Any]], assets: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "status": "static_consumer_reference_partition", "closure_status": "pending",
        "explicit_consumer_closure": False,
        "records": [{
            "review_id": edge["review_id"], "observed_consumer_refs": edge.get("observed_consumer_refs", []),
            "consumer_closure_status": edge.get("consumer_closure_status"),
            "consumer_closure_evidence": edge.get("consumer_closure_evidence", []),
            "evidence_refs": edge.get("evidence_refs", []), "static_only": True,
        } for edge in edges],
        "ledger_consumer_refs": sorted({ref for asset in assets for ref in asset["consumer"]["ledger_consumer_refs"]}),
        "decision_and_read_after_asset_count": sum(bool(asset["consumer"]["decision_records"] or asset["consumer"]["read_after_records"]) for asset in assets),
    }


def current_context() -> list[dict[str, Any]]:
    return [{"path": path, "sha256": base_digest(path), "status": "context_only", "implementation_claim": False} for path in CONTEXT_INPUTS]


def expected_representative(source: dict[str, Any], assets: list[dict[str, Any]]) -> dict[str, Any]:
    asset_ids = [asset["asset_id"] for asset in assets]
    candidates = [item.get("asset_id") for item in source.get("representative_legacy_assets", [])]
    selected = [asset_id for asset_id in candidates if asset_id in asset_ids]
    if not selected:
        selected, rule = asset_ids[:3], "crosswalk_representative_intersection_else_sorted_edge_assets_first_three"
    else:
        selected, rule = selected[:3], "crosswalk_representative_intersection_first_three"
    return {
        "selection_rule": rule, "representative_asset_ids": selected,
        "records": [next(asset for asset in assets if asset["asset_id"] == asset_id) for asset_id in selected],
        "static_only": True, "not_implementation_proof": True,
    }


def read_bundle(bundle: Path) -> tuple[dict[str, Any], list[dict[str, Any]]] | None:
    try:
        inventory = json.loads((bundle / "inventory.json").read_text(encoding="utf-8"))
        evidence = [json.loads(line) for line in (bundle / "evidence.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
        return inventory, evidence
    except (OSError, json.JSONDecodeError) as exc:
        print(f"E_INPUT: {exc}")
        return None


class Validator:
    def __init__(self, bundle: Path):
        self.bundle = bundle
        self.errors: list[tuple[str, str]] = []

    def error(self, code: str, message: str) -> None:
        self.errors.append((code, message))

    def finish(self) -> int:
        if self.errors:
            for code, message in self.errors:
                print(f"{code}: {message}")
            return 1
        print("SCF-B-0113 validate: PASS (31 units; counts derived from fixed BASE; static-only)")
        return 0

    def check_input_snapshot(self, inventory: dict[str, Any]) -> None:
        expected = [{"path": path, "sha256": base_digest(path)} for path in INPUT_PATHS]
        if inventory.get("input_snapshot") != expected:
            self.error("E_INPUT_DIGEST", "inventory input_snapshotが固定BASE bytesと一致しない")

    def check_asset(self, asset: dict[str, Any], expected: dict[str, Any]) -> None:
        if asset != expected:
            if asset.get("ledger_record") != expected.get("ledger_record"):
                self.error("E_OLD_LEDGER_RECORD", f"{asset.get('asset_id')} ledger record不一致")
            elif asset.get("source") != expected.get("source"):
                self.error("E_OLD_ASSET_SOURCE", f"{asset.get('asset_id')} source/blob不一致")
            else:
                self.error("E_OLD_ASSET_EVIDENCE", f"{asset.get('asset_id')} old asset evidence不一致")

    def validate(self) -> int:
        loaded = read_bundle(self.bundle)
        if loaded is None:
            return 1
        inventory, evidence = loaded
        if inventory.get("schema") != SCHEMA:
            self.error("E_INVENTORY_SCHEMA", "schema不一致")
        if inventory.get("binding_id") != BINDING_ID:
            self.error("E_BINDING_ID", "binding_id不一致")
        if inventory.get("base") != BASE_DECLARATION:
            self.error("E_BASE_COMMIT", "固定BASE commit／ancestor宣言が不一致")
        if inventory.get("negative_case_codes") != NEGATIVE_CASE_CODES:
            self.error("E_INVENTORY_DECLARATION", "negative_case_codes宣言がvalidator固定集合と不一致")
        if subprocess.run(["git", "merge-base", "--is-ancestor", BASE, "HEAD"], cwd=ROOT).returncode != 0:
            self.error("E_BASE_NOT_ANCESTOR", "固定BASEが検証HEADの祖先ではない")
        if inventory.get("status") != "research_only_scaffold_candidate" or inventory.get("authority_effect") != "none" or inventory.get("new_build") is not False:
            self.error("E_AUTHORITY_BOUNDARY", "research-only／authority／new-build境界が不一致")
        try:
            crosswalk = target_crosswalk()
            decomp_rows = base_jsonl(DECOMP)
            decomp_by_unit = {unit["unit_candidate_id"]: row for row in decomp_rows for unit in row.get("candidate_units", [])}
            disposition = {row["asset_id"]: row for row in base_jsonl(DISPOSITION)}
            decisions = base_jsonl(DECISIONS)
            read_after = base_jsonl(READ_AFTER)
            classifications = {row["asset_id"]: row for row in base_jsonl(CLASSIFICATION)}
            expected_by_unit, scan_count, scan_files = scan_edges()
        except (KeyError, ValueError, subprocess.CalledProcessError, OSError) as exc:
            self.error("E_BASE_INPUT", str(exc))
            return self.finish()
        units = [row["unit_candidate_id"] for row in crosswalk]
        if [row.get("unit_candidate_id") for row in evidence] != units or len(set(row.get("unit_candidate_id") for row in evidence)) != len(units):
            self.error("E_UNIT_SET", "NFR01〜20 unit集合の順序・分母・重複が不一致")
        if set(inventory.get("unit_ids", [])) != set(units) or len(inventory.get("unit_ids", [])) != len(units):
            self.error("E_INVENTORY_DECLARATION", "inventory unit_idsが期待集合と不一致")
        expected_edges = {edge["review_id"]: edge for edges in expected_by_unit.values() for edge in edges}
        actual_edge_ids = [edge.get("review_id") for row in evidence for edge in row.get("semantic_review_edges", [])]
        if len(actual_edge_ids) != len(set(actual_edge_ids)):
            self.error("E_REVIEW_EDGE_DUP", "bundle全体のreview edge行が重複している")
        if sorted(actual_edge_ids) != sorted(expected_edges):
            self.error("E_REVIEW_EDGE_SET", "bundle全体のreview edge multisetが不一致")
        self.check_input_snapshot(inventory)
        if inventory.get("anchor_digest_policy") != ANCHOR_POLICY:
            self.error("E_SOURCE_ANCHOR", "anchor digest policyが不一致")
        if inventory.get("evidence_partition") != EVIDENCE_PARTITION:
            self.error("E_INVENTORY_DECLARATION", "evidence partition宣言が不一致")
        if inventory.get("prohibited_inference") != PROHIBITED_INFERENCE:
            self.error("E_INVENTORY_DECLARATION", "prohibited inference宣言が不一致")
        if inventory.get("unresolved") != UNRESOLVED:
            self.error("E_INVENTORY_DECLARATION", "inventory unresolved宣言が不一致")
        if inventory.get("partition_contract") != PARTITION_CONTRACT:
            self.error("E_INVENTORY_DECLARATION", "partition contract宣言が不一致")
        expected_assets = set(expected_edges.values() and edge["asset_id"] for edge in expected_edges.values())
        actual_assets = [asset.get("asset_id") for row in evidence for asset in row.get("old_asset_evidence", {}).get("assets", [])]
        if set(actual_assets) != expected_assets:
            self.error("E_ASSET_SET", "bundle全体のold asset集合が不一致")
        expected_scope = {
            "source_requirement_ids": SOURCE_IDS,
            "unit_count": len(units),
            "product_counts": {"HELIX-OS": sum(x["unit_candidate_id"].endswith("HELIX-OS") for x in crosswalk), "HELIX-HARNESS": sum(x["unit_candidate_id"].endswith("HELIX-HARNESS") for x in crosswalk)},
            "wave_range": [1, 50], "semantic_review_scan_files": scan_files,
            "semantic_review_scan_row_count": scan_count, "semantic_review_edge_count": len(expected_edges),
            "unique_old_asset_count": len(expected_assets), "br_units_included": 0,
        }
        if inventory.get("scope") != expected_scope:
            self.error("E_INVENTORY_DECLARATION", "inventory scope宣言が導出値と不一致")
        expected_counts = {
            "units": len(units), "helix_os_units": expected_scope["product_counts"]["HELIX-OS"],
            "helix_harness_units": expected_scope["product_counts"]["HELIX-HARNESS"],
            "semantic_review_edges": len(expected_edges), "unique_old_assets": len(expected_assets),
            "current_static_refs": len(units) * len(CONTEXT_INPUTS), "old_failure_receipts": 0,
            "old_runtime_test_ci_executions": 0, "current_runtime_executions": 0,
        }
        if inventory.get("counts") != expected_counts:
            self.error("E_INVENTORY_DECLARATION", "inventory countsが導出値と不一致")
        evidence_by_unit = {row.get("unit_candidate_id"): row for row in evidence}
        expected_declarations = []
        for source in crosswalk:
            unit = source["unit_candidate_id"]
            current = evidence_by_unit.get(unit)
            if current is None:
                continue
            if set(current) != UNIT_TOP_LEVEL_KEYS:
                self.error("E_UNIT_SCHEMA", f"{unit} unit top-level key集合が不一致")
            if current.get("schema") != UNIT_SCHEMA:
                self.error("E_UNIT_SCHEMA", f"{unit} unit schemaが不一致")
            edges = expected_by_unit[unit]
            asset_ids = sorted({edge["asset_id"] for edge in edges})
            assets = [old_asset_record(asset_id, edges, disposition, decisions, read_after, classifications) for asset_id in asset_ids]
            source_expected = expected_source(source, decomp_by_unit[unit])
            actual_source = current.get("source_requirement", {})
            if actual_source.get("representative_asset_candidates") != source_expected.get("representative_asset_candidates"):
                self.error("E_REPRESENTATIVE_ASSET", f"{unit} source representative asset record不一致")
            source_without_candidates = dict(actual_source)
            expected_without_candidates = dict(source_expected)
            source_without_candidates.pop("representative_asset_candidates", None)
            expected_without_candidates.pop("representative_asset_candidates", None)
            if source_without_candidates != expected_without_candidates:
                self.error("E_SOURCE_BINDING", f"{unit} source snapshot不一致")
            if current.get("source_anchor") != source_range(source["source_requirement_id"]):
                self.error("E_SOURCE_ANCHOR", f"{unit} source anchor不一致")
            actual_edges = current.get("semantic_review_edges", [])
            actual_ids = [edge.get("review_id") for edge in actual_edges]
            if len(actual_ids) != len(set(actual_ids)) or sorted(actual_ids) != sorted(edge["review_id"] for edge in edges):
                self.error("E_REVIEW_EDGE_SET", f"{unit} unit edge multiset／件数が不一致")
            expected_edges_sorted = sorted(edges, key=lambda edge: (edge["wave"], edge["review_id"]))
            actual_edges_sorted = sorted(actual_edges, key=lambda edge: (edge.get("wave", -1), edge.get("review_id", "")))
            for actual, expected in zip(actual_edges_sorted, expected_edges_sorted):
                if actual.get("anchor_resolution") != expected.get("anchor_resolution"):
                    self.error("E_SOURCE_ANCHOR", f"{unit} {actual.get('review_id')} anchor resolution不一致")
                if actual != expected:
                    self.error("E_REVIEW_EDGE_BYTES", f"{unit} {actual.get('review_id')} edge bytes不一致")
            expected_asset_set = {
                "asset_ids": asset_ids, "count": len(asset_ids),
                "completeness": "exact_unique_asset_ids_derived_from_wave_edges",
                "edge_asset_membership": {asset_id: [edge["review_id"] for edge in edges if edge["asset_id"] == asset_id] for asset_id in asset_ids},
            }
            if current.get("asset_set") != expected_asset_set:
                self.error("E_OLD_ASSET_UNIT_SET", f"{unit} unit asset_set宣言不一致")
            actual_unit_assets = current.get("old_asset_evidence", {}).get("assets", [])
            old_asset_wrapper = current.get("old_asset_evidence", {})
            if set(old_asset_wrapper) != OLD_ASSET_WRAPPER_KEYS:
                self.error("E_OLD_ASSET_EVIDENCE", f"{unit} old_asset_evidence key集合が不一致")
            if old_asset_wrapper.get("static_only") is not True or old_asset_wrapper.get("not_implementation_proof") is not True:
                self.error("E_OLD_ASSET_EVIDENCE", f"{unit} old_asset_evidenceのstatic-only境界が不一致")
            actual_unit_asset_ids = [asset.get("asset_id") for asset in actual_unit_assets]
            if len(actual_unit_asset_ids) != len(set(actual_unit_asset_ids)) or sorted(actual_unit_asset_ids) != asset_ids:
                self.error("E_OLD_ASSET_UNIT_SET", f"{unit} unit asset multiset／件数が不一致")
            expected_asset_records = [old_asset_record(asset_id, edges, disposition, decisions, read_after, classifications) for asset_id in asset_ids]
            for actual_asset, expected_asset in zip(sorted(actual_unit_assets, key=lambda x: x.get("asset_id", "")), expected_asset_records):
                self.check_asset(actual_asset, expected_asset)
            if current.get("implementation_evidence") != expected_impl(edges):
                self.error("E_IMPLEMENTATION_EVIDENCE", f"{unit} old implementation partition不一致")
            if current.get("degradation_evidence") != expected_degradation(source, edges):
                self.error("E_DEGRADATION_EVIDENCE", f"{unit} degradation partition不一致")
            if current.get("failure_evidence") != expected_failure(edges):
                self.error("E_FAILURE_EVIDENCE", f"{unit} failure partition不一致")
            if current.get("consumer_evidence") != expected_consumer(edges, expected_asset_records):
                self.error("E_CONSUMER_EVIDENCE", f"{unit} consumer partition不一致")
            if current.get("representative_assets") != expected_representative(source, expected_asset_records):
                self.error("E_REPRESENTATIVE_ASSET", f"{unit} representative asset record不一致")
            expected_context = current_context()
            current_impl = current.get("current_implementation_evidence", {})
            if current.get("current_context") != expected_context or current_impl != {
                "status": "unknown", "execution_performed": False, "current_refs": expected_context,
                "acceptance_status": "unknown", "operation_status": "unknown", "explicit_claim": False,
            }:
                self.error("E_CURRENT_STATUS", f"{unit} current implementation partition不一致")
            if current.get("unimplemented_assessment") != {
                "status": "not_assessed", "explicit_non_implementation_claim": False,
                "reason": "静的候補・review edge・source/historyだけではunitの未実装を導けない",
            }:
                self.error("E_UNIMPLEMENTED_CLAIM", f"{unit} unimplemented assertion不一致")
            if current.get("authority_boundary") != {
                "formal_phase_authority": False, "formal_product_authority": False,
                "formal_implementation_acceptance": False, "successor_assignment": False,
                "consumer_closure": False, "new_build": False,
            }:
                self.error("E_AUTHORITY_BOUNDARY", f"{unit} authority boundary不一致")
            expected_unresolved = sorted(set(source.get("unresolved", [])) | set(UNRESOLVED[:5]))
            if current.get("unresolved") != expected_unresolved:
                self.error("E_UNRESOLVED", f"{unit} unresolved set不一致")
            expected_declarations.append({
                "unit_candidate_id": unit, "product_scope": source_expected["product_scope"],
                "asset_ids": asset_ids, "asset_count": len(asset_ids),
                "edge_refs": [edge["review_id"] for edge in edges], "edge_count": len(edges),
                "representative_asset_ids": expected_representative(source, expected_asset_records)["representative_asset_ids"],
                "implementation_record_count": len(expected_impl(edges)["records"]),
                "degradation_phase_record_count": len(expected_degradation(source, edges)["phase_transition_evidence"]),
                "failure_record_count": len(edges), "consumer_record_count": len(edges),
                "phase_classification_status": source_expected["phase_classification_status"],
            })
        if inventory.get("unit_declarations") != expected_declarations:
            self.error("E_INVENTORY_DECLARATION", "unit_declarationsが証拠行から再導出した値と不一致")
        return self.finish()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--bundle", type=Path, default=BUNDLE)
    parser.add_argument("--repo", type=Path, default=ROOT)
    args = parser.parse_args()
    return Validator(args.bundle).validate()


if __name__ == "__main__":
    raise SystemExit(main())
