#!/usr/bin/env python3
"""Independent fail-closed validator for SCF-B-0128."""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BASE = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
BINDING_ID = "SCF-B-0128"
SCHEMA = "phase-gap-cross-analysis-0128/v1"
TAXONOMY_COMMIT = "78e23a622bc9c40183269e22a59c566d22b93435"
TAXONOMY_PATH = "scaffold/phase-status-taxonomy-0105/units.jsonl"
TAXONOMY_SHA256 = "e6f78052a998afbd0af43769fd639486a07e04472b79823e7cddff0a662600d4"
TAXONOMY_BLOB_OID = "c55fdcc06c23d53a5b2949ccf1a239c6064e6a8f"
TAXONOMY_INVENTORY_PATH = "scaffold/phase-status-taxonomy-0105/inventory.json"
TAXONOMY_INVENTORY_SHA256 = "89ddd6361743d37e809b2e5cd7aba217886770b5688787822426f6aa3bd123d2"
TAXONOMY_INVENTORY_BLOB_OID = "e3430907c65b3c74cf3f799875ca0f1c34fdc35e"
TAXONOMY_SNAPSHOT = "scaffold/phase-gap-cross-analysis-0128/phase-status-taxonomy-0105.units.jsonl"
IR = "archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json"
RDP = "docs/governance/requirement-disposition-review-program.md"
RDP_OVERLAP = "docs/governance/requirement-overlap-review-program.md"
RDP_SUBSTITUTABILITY = "docs/governance/requirement-technical-substitutability-review-program.md"
RDP_SCREEN = "docs/governance/audits/source-rebaseline/l2d-s1-01-input-holding-screen.jsonl"
PHCAP = "docs/governance/phase-capability-inventory.json"
PHCAP20_README = "scaffold/phcap20-memory-research/README.md"
PHCAP20_INVENTORY = "scaffold/phcap20-memory-research/inventory.json"
BOUNDARY_PATH = "docs/concept/product-boundary.md"
DECISION = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
L1_PATHS = [
    "docs/helix-harness/L1-planning/product-intent.md",
    "docs/helix-os/L1-planning/system-intent.md",
    "docs/helix-web/L1-planning/product-intent.md",
    "docs/helix-web-os/L1-planning/system-intent.md",
]
WAVE_PATHS = [
    *(f"docs/governance/legacy-requirement-direct-semantic-review-wave{i}.jsonl" for i in range(1, 37)),
    *(f"scaffold/legacy-semantic-review-wave{i}/legacy-requirement-direct-semantic-review-wave{i}.jsonl" for i in range(37, 51)),
]
BASE_INPUT_PATHS = [IR, *WAVE_PATHS, RDP, RDP_OVERLAP, RDP_SUBSTITUTABILITY, RDP_SCREEN, PHCAP, PHCAP20_README, PHCAP20_INVENTORY, BOUNDARY_PATH, DECISION, *L1_PATHS]
PHCAP_IDS = [f"PHCAP-{n:02d}" for n in range(1, 21)]
PHCAP_16_20 = set(f"PHCAP-{n:02d}" for n in range(16, 21))
TARGET_UNIT_IDS = [
    "IRUNIT-HIL-BR-14-HELIX-OS", "IRUNIT-HIL-BR-24-HELIX-OS", "IRUNIT-HIL-FR-17-HELIX-OS", "IRUNIT-HIL-FR-18-HELIX-OS", "IRUNIT-HIL-FR-19-HELIX-HARNESS", "IRUNIT-HIL-FR-20-HELIX-OS", "IRUNIT-HIL-FR-21-HELIX-OS", "IRUNIT-HIL-FR-23-HELIX-OS", "IRUNIT-HIL-FR-24-HELIX-OS", "IRUNIT-HIL-FR-31-HELIX-OS", "IRUNIT-HIL-FR-33-HELIX-HARNESS", "IRUNIT-HIL-FR-33-HELIX-OS", "IRUNIT-HIL-FR-46-HELIX-OS", "IRUNIT-HIL-FR-52-HELIX-OS", "IRUNIT-HIL-FR-53-HELIX-OS", "IRUNIT-HIL-NFR-02-HELIX-HARNESS", "IRUNIT-HIL-NFR-03-HELIX-HARNESS", "IRUNIT-HIL-NFR-05-HELIX-OS", "IRUNIT-HIL-NFR-06-HELIX-OS", "IRUNIT-HIL-NFR-07-HELIX-OS", "IRUNIT-HIL-NFR-11-HELIX-OS", "IRUNIT-HIL-NFR-12-HELIX-OS", "IRUNIT-HIL-NFR-23-HELIX-OS", "IRUNIT-HIL-NFR-30-HELIX-OS", "IRUNIT-HIL-NFR-31-HELIX-OS", "IRUNIT-HIL-NFR-32-HELIX-OS", "IRUNIT-HIL-TR-04-HELIX-HARNESS", "IRUNIT-HIL-TR-04-HELIX-OS", "IRUNIT-HIL-TR-07-HELIX-OS", "IRUNIT-HIL-TR-08-HELIX-HARNESS",
]
SOURCE = {"IRUNIT-HIL-BR-14-HELIX-OS", "IRUNIT-HIL-BR-24-HELIX-OS"}
PHCAP_BOUNDARY_UNITS = {"IRUNIT-HIL-FR-17-HELIX-OS", "IRUNIT-HIL-FR-18-HELIX-OS", "IRUNIT-HIL-FR-19-HELIX-HARNESS", "IRUNIT-HIL-FR-20-HELIX-OS", "IRUNIT-HIL-FR-24-HELIX-OS", "IRUNIT-HIL-FR-31-HELIX-OS", "IRUNIT-HIL-NFR-30-HELIX-OS", "IRUNIT-HIL-TR-07-HELIX-OS"}
COMPETITION = {"IRUNIT-HIL-FR-21-HELIX-OS", "IRUNIT-HIL-FR-23-HELIX-OS", "IRUNIT-HIL-FR-33-HELIX-HARNESS", "IRUNIT-HIL-FR-46-HELIX-OS", "IRUNIT-HIL-FR-52-HELIX-OS", "IRUNIT-HIL-FR-53-HELIX-OS", "IRUNIT-HIL-NFR-02-HELIX-HARNESS", "IRUNIT-HIL-NFR-03-HELIX-HARNESS", "IRUNIT-HIL-NFR-06-HELIX-OS", "IRUNIT-HIL-TR-08-HELIX-HARNESS"}
UNRESOLVED = set(TARGET_UNIT_IDS) - SOURCE - PHCAP_BOUNDARY_UNITS - COMPETITION
REASON_BY_UNIT = {**{x: "SOURCE_AUTHORITY_CUSTODY_GAP" for x in SOURCE}, **{x: "PHCAP_BOUNDARY_GAP" for x in PHCAP_BOUNDARY_UNITS}, **{x: "CROSS_PHASE_COMPETITION" for x in COMPETITION}, **{x: "CROSS_PHASE_UNRESOLVED" for x in UNRESOLVED}}
CLASS_DEFS = {
    "SOURCE_AUTHORITY_CUSTODY_GAP": ("原文のsource custody／要求定義authorityが閉じず、phase責務の主語をcurrent contractへ接続できない", "RDP source atomization、current contract、authority receipt、product／unit boundary decisionを揃える"),
    "PHCAP_BOUNDARY_GAP": ("prototype／re-entry／ingestion等のphase境界が競合し、PHCAP直接責務を原文だけで決められない", "候補phaseと全競合PHCAPのcurrent boundary contract、phase reviewer判断、consumer closureを揃える"),
    "CROSS_PHASE_COMPETITION": ("横断制約だがPHCAP-01〜15の具体能力との意味接続候補があり、phase非適用を導けない", "shared capability／connection／phaseを全PHCAP境界で比較し、product／phase authorityをhuman decisionする"),
    "CROSS_PHASE_UNRESOLVED": ("横断制約として読めるが、PHCAP-16〜20を含む全20境界の除外も直接責務も未立証", "全PHCAP-01〜20の直接責務・除外sourceを確認し、phase非適用を保留したままhuman reviewへ送る"),
}
# This compact independent pin catches replacement of an evidence list with a
# different but still well-shaped list.  The validator intentionally does not
# import generate.py, so a generator/ledger rewrite cannot rewrite the oracle.
SOURCE_EVIDENCE_SENTINELS = {
    "IRUNIT-HIL-BR-14-HELIX-OS": "ref authority receipt",
    "IRUNIT-HIL-BR-24-HELIX-OS": "current requirement-definition contract",
    "IRUNIT-HIL-FR-17-HELIX-OS": "current screen applicability contract",
    "IRUNIT-HIL-FR-18-HELIX-OS": "Prototype Builder artifact/state replay contract",
    "IRUNIT-HIL-FR-19-HELIX-HARNESS": "walkthrough receipt and iteration checkpoint contract",
    "IRUNIT-HIL-FR-20-HELIX-OS": "Screen Gate current receipt contract",
    "IRUNIT-HIL-FR-21-HELIX-OS": "immutable source snapshot and Git authority receipt contract",
    "IRUNIT-HIL-FR-23-HELIX-OS": "connector registry current contract",
    "IRUNIT-HIL-FR-24-HELIX-OS": "ingestion data contract",
    "IRUNIT-HIL-FR-31-HELIX-OS": "re-entry current contract",
    "IRUNIT-HIL-FR-33-HELIX-HARNESS": "active-surface dependency coverage contract",
    "IRUNIT-HIL-FR-33-HELIX-OS": "active Bun count and OS CI/release consumer contract",
    "IRUNIT-HIL-FR-46-HELIX-OS": "layer ledger catalog contract",
    "IRUNIT-HIL-FR-52-HELIX-OS": "canonicalization transaction contract",
    "IRUNIT-HIL-FR-53-HELIX-OS": "immutable asset identity/revision contract",
    "IRUNIT-HIL-NFR-02-HELIX-HARNESS": "role separation contract",
    "IRUNIT-HIL-NFR-03-HELIX-HARNESS": "reverse processing and no phase-skip contract",
    "IRUNIT-HIL-NFR-05-HELIX-OS": "untrusted input/intake security contract",
    "IRUNIT-HIL-NFR-06-HELIX-OS": "action-binding approval contract",
    "IRUNIT-HIL-NFR-07-HELIX-OS": "scope gate contract",
    "IRUNIT-HIL-NFR-11-HELIX-OS": "screen prototype/skip evidence contract",
    "IRUNIT-HIL-NFR-12-HELIX-OS": "source coverage custody contract",
    "IRUNIT-HIL-NFR-23-HELIX-OS": "acyclic scope derivation graph and authoritative-root contract",
    "IRUNIT-HIL-NFR-30-HELIX-OS": "authoring/canonicalization current contract",
    "IRUNIT-HIL-NFR-31-HELIX-OS": "all-or-nothing authoring/ledger/trace/projection/receipt contract",
    "IRUNIT-HIL-NFR-32-HELIX-OS": "semantic change contract",
    "IRUNIT-HIL-TR-04-HELIX-HARNESS": "portable/compatibility profile contract",
    "IRUNIT-HIL-TR-04-HELIX-OS": "OS runtime portability and compatibility profile contract",
    "IRUNIT-HIL-TR-07-HELIX-OS": "L4 write-authority decision record",
    "IRUNIT-HIL-TR-08-HELIX-HARNESS": "versioned Node/Python JSON Lines transport contract",
}
MINIMUM_CONDITIONS = [
    "current source contractが責務主語、対象product、input/output、acceptance、failure/recovery、revision/digestを固定する",
    "PHCAP-01〜20の競合境界を直接照合し、candidate／connection／shared capability／非適用の理由を原文anchorで分離する",
    "product ownerとphase authority reviewerがunit／connection／composite、target product、L2/L11 successorを明示決定する",
    "名前付きcurrent consumerのreceipt/read-after、failure/recovery、stale/re-entry、rollback/retention境界でclosureする",
]
NEGATIVE_CASE_CODES = ["E_BUNDLE", "E_SCHEMA", "E_BINDING", "E_BASE_COMMIT", "E_BASE_NOT_ANCESTOR", "E_TAXONOMY_NOT_ANCESTOR", "E_TAXONOMY_BLOB", "E_SOURCE_INPUT_DIGEST", "E_SOURCE_ANCHOR", "E_TARGET_SET", "E_WAVE_EDGE_COVERAGE", "E_ASSET_EVIDENCE", "E_TAXONOMY_COVERAGE", "E_TAXONOMY_STATUS", "E_MATRIX_RULE", "E_INVENTORY_DECLARATION", "E_REASON_CLASS", "E_ANALYSIS_EVIDENCE", "E_CONSUMER_EVIDENCE", "E_PHASE_AUTHORITY_SEPARATION", "E_PRODUCT_AUTHORITY_SEPARATION", "E_AUTHORITY_BOUNDARY", "E_MINIMUM_CONDITIONS"]


def git(*args: str, text: bool = False) -> bytes | str:
    result = subprocess.run(["git", *args], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=text, check=False)
    if result.returncode != 0:
        raise ValueError(result.stderr if text else result.stderr.decode("utf-8", errors="replace"))
    return result.stdout


def base_bytes(path: str) -> bytes:
    return git("show", f"{BASE}:{path}")  # type: ignore[return-value]


def tax_bytes(path: str = TAXONOMY_PATH) -> bytes:
    return git("show", f"{TAXONOMY_COMMIT}:{path}")  # type: ignore[return-value]


def sha(raw: bytes, prefix: bool = True) -> str:
    value = hashlib.sha256(raw).hexdigest()
    return f"sha256:{value}" if prefix else value


def base_json(path: str) -> Any:
    return json.loads(base_bytes(path).decode())


def base_jsonl(path: str) -> list[dict[str, Any]]:
    return [json.loads(line) for line in base_bytes(path).decode().splitlines() if line.strip()]


def tax_rows() -> list[dict[str, Any]]:
    raw = tax_bytes()
    if sha(raw, False) != TAXONOMY_SHA256 or git("rev-parse", f"{TAXONOMY_COMMIT}:{TAXONOMY_PATH}", text=True).strip() != TAXONOMY_BLOB_OID:
        raise ValueError("taxonomy immutable source mismatch")
    rows = [json.loads(line) for line in raw.decode().splitlines() if line.strip()]
    selected = [row for row in rows if row.get("unit_candidate_id") in TARGET_UNIT_IDS]
    if [row.get("unit_candidate_id") for row in selected] != TARGET_UNIT_IDS or len(selected) != 30:
        raise ValueError("taxonomy target set/order mismatch")
    return selected


def expected_edges(rows: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, list[dict[str, Any]]]]:
    wanted = [ref for row in rows for ref in row["wave_review"]["edge_refs"]]
    found: dict[str, dict[str, Any]] = {}
    for path in WAVE_PATHS:
        for edge in base_jsonl(path):
            if edge.get("review_id") in wanted:
                found[edge["review_id"]] = edge
    if set(found) != set(wanted) or len(found) != 66:
        raise ValueError("Wave edge coverage mismatch")
    by_unit = {row["unit_candidate_id"]: [found[ref] for ref in row["wave_review"]["edge_refs"]] for row in rows}
    return [found[ref] for ref in wanted], by_unit


def edge_summary(edge: dict[str, Any]) -> dict[str, Any]:
    return {key: edge.get(key) for key in ("review_id", "asset_id", "source_requirement_id", "source_path", "source_sha256", "source_statement_semantic_digest", "candidate_phase_targets", "phase_candidates", "candidate_product_targets", "consumer_closure_status", "consumer_evidence_count", "current_requirement_implementation_status", "legacy_execution_status", "legacy_implementation_status", "semantic_link_status", "semantic_relation", "failure_finding", "coverage_constraint")}


def expected_source_anchor(row: dict[str, Any], ir: dict[str, Any]) -> dict[str, Any]:
    anchor = row["source_anchor"]
    if ir[row["requirement_id"]]["statement"]["text"] != anchor["statement_text"]:
        raise ValueError("IR source statement mismatch")
    return {"archive_path": anchor["archive_path"], "json_pointer": anchor["json_pointer"], "line_start": anchor["line_start"], "line_end": anchor["line_end"], "source_text_spans": anchor.get("source_text_spans", []), "statement_text": anchor["statement_text"], "statement_text_sha256": sha(anchor["statement_text"].encode()), "statement_semantic_digest": anchor["statement_semantic_digest"], "static_only": True}


def expected_inventory(rows: list[dict[str, Any]], edges: list[dict[str, Any]]) -> dict[str, Any]:
    status_counts: dict[str, int] = {}
    rule_counts: dict[str, int] = {}
    for row in rows:
        status_counts[row["taxonomy"]["status"]] = status_counts.get(row["taxonomy"]["status"], 0) + 1
        rule_counts[row["taxonomy"]["matrix_rule_id"]] = rule_counts.get(row["taxonomy"]["matrix_rule_id"], 0) + 1
    class_units = {name: [] for name in CLASS_DEFS}
    for unit in TARGET_UNIT_IDS:
        class_units[REASON_BY_UNIT[unit]].append(unit)
    reason_classes = {name: {"description": desc, "next_action": action, "unit_ids": class_units[name], "unit_count": len(class_units[name])} for name, (desc, action) in CLASS_DEFS.items()}
    return {
        "schema": SCHEMA, "binding_id": BINDING_ID, "status": "research_only_scaffold_candidate", "authority_effect": "none", "new_build": False,
        "base": {"repository": "HELIX-HARNESS", "commit": BASE, "branch": "main", "required_ancestor": BASE},
        "taxonomy_snapshot": {"commit": TAXONOMY_COMMIT, "path": TAXONOMY_PATH, "sha256": TAXONOMY_SHA256, "blob_oid": TAXONOMY_BLOB_OID, "inventory_path": TAXONOMY_INVENTORY_PATH, "inventory_sha256": TAXONOMY_INVENTORY_SHA256, "inventory_blob_oid": TAXONOMY_INVENTORY_BLOB_OID, "snapshot_artifact": TAXONOMY_SNAPSHOT},
        "scope": {"unit_count": 30, "target_unit_ids": TARGET_UNIT_IDS, "product_counts": {"HELIX-OS": 24, "HELIX-HARNESS": 6}, "taxonomy_status_counts": status_counts, "matrix_rule_counts": rule_counts, "wave_scan_file_count": 50, "wave_scan_row_count": sum(len(base_jsonl(path)) for path in WAVE_PATHS), "semantic_review_edge_count": len(edges), "unique_old_asset_count": len({edge["asset_id"] for edge in edges}), "direct_phase_evidence_count": 0, "formal_phase_candidate_count": 0, "phase_nonapplicability_proven": 0, "excluded_phase_count": 0, "pending_all_20_count": 30},
        "reason_classes": reason_classes, "formal_judgment_minimum_conditions": MINIMUM_CONDITIONS,
        "input_snapshot": [{"path": path, "sha256": sha(base_bytes(path), False), "source": "fixed_BASE"} for path in BASE_INPUT_PATHS],
        "oracle_dependencies": [], "analysis_path": "analysis.jsonl", "unit_ids": TARGET_UNIT_IDS, "negative_case_codes": NEGATIVE_CASE_CODES,
        "authority_boundary": {"formal_crosswalk_modified": False, "formal_phase_authority_modified": False, "formal_product_authority_modified": False, "implementation_claim_generated": False, "unimplemented_claim_generated": False, "degradation_claim_generated": False, "failure_receipt_generated": False, "consumer_closure_generated": False, "successor_assigned": False, "old_archive_executed": False},
    }


class Validator:
    def __init__(self, root: Path = ROOT, bundle: Path = HERE):
        self.root = root.resolve()
        self.bundle = bundle.resolve()
        self.errors: list[str] = []

    def error(self, code: str, detail: str = "") -> None:
        self.errors.append(code + ((":" + detail) if detail else ""))

    def load(self) -> tuple[dict[str, Any], list[dict[str, Any]]] | None:
        try:
            inventory = json.loads((self.bundle / "inventory.json").read_text(encoding="utf-8"))
            rows = [json.loads(line) for line in (self.bundle / "analysis.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
            return inventory, rows
        except (OSError, json.JSONDecodeError) as exc:
            self.error("E_BUNDLE", str(exc))
            return None

    def validate(self) -> int:
        loaded = self.load()
        if loaded is None:
            return self.finish()
        inventory, actual = loaded
        try:
            rows = tax_rows(); edges, edges_by_unit = expected_edges(rows); ir = base_json(IR); expected_inv = expected_inventory(rows, edges)
        except Exception as exc:
            self.error("E_SOURCE_INPUT_DIGEST", repr(exc)); return self.finish()
        if inventory.get("schema") != SCHEMA: self.error("E_SCHEMA", "inventory schema")
        if inventory.get("binding_id") != BINDING_ID: self.error("E_BINDING", "inventory binding")
        if inventory.get("base") != expected_inv["base"]: self.error("E_BASE_COMMIT", "base declaration")
        ancestor = inventory.get("base", {}).get("required_ancestor")
        if not isinstance(ancestor, str) or subprocess.run(["git", "merge-base", "--is-ancestor", ancestor, "HEAD"], cwd=self.root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode != 0: self.error("E_BASE_NOT_ANCESTOR", str(ancestor))
        tax_decl = inventory.get("taxonomy_snapshot", {})
        tax_commit = tax_decl.get("commit")
        if not isinstance(tax_commit, str) or subprocess.run(["git", "merge-base", "--is-ancestor", tax_commit, "HEAD"], cwd=self.root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode != 0: self.error("E_TAXONOMY_NOT_ANCESTOR", str(tax_commit))
        if tax_decl.get("blob_oid") != TAXONOMY_BLOB_OID or tax_decl.get("inventory_blob_oid") != TAXONOMY_INVENTORY_BLOB_OID: self.error("E_TAXONOMY_BLOB", "taxonomy blob declaration")
        else:
            if subprocess.run(["git", "rev-parse", f"{TAXONOMY_COMMIT}:{TAXONOMY_PATH}"], cwd=self.root, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True).stdout.strip() != TAXONOMY_BLOB_OID: self.error("E_TAXONOMY_BLOB", "taxonomy source blob")
            if subprocess.run(["git", "rev-parse", f"{TAXONOMY_COMMIT}:{TAXONOMY_INVENTORY_PATH}"], cwd=self.root, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True).stdout.strip() != TAXONOMY_INVENTORY_BLOB_OID: self.error("E_TAXONOMY_BLOB", "taxonomy inventory blob")
        if inventory.get("taxonomy_snapshot") != expected_inv["taxonomy_snapshot"]: self.error("E_TAXONOMY_COVERAGE", "taxonomy snapshot")
        if inventory.get("input_snapshot") != expected_inv["input_snapshot"]: self.error("E_SOURCE_INPUT_DIGEST", "input snapshot declaration")
        for item in inventory.get("input_snapshot", []):
            if not isinstance(item.get("path"), str) or item.get("sha256") != sha(base_bytes(item["path"]), False): self.error("E_SOURCE_INPUT_DIGEST", str(item.get("path")))
        try:
            if sha((self.bundle / "phase-status-taxonomy-0105.units.jsonl").read_bytes(), False) != TAXONOMY_SHA256: self.error("E_TAXONOMY_COVERAGE", "snapshot artifact")
        except OSError: self.error("E_TAXONOMY_COVERAGE", "snapshot artifact missing")
        if set(inventory) != set(expected_inv): self.error("E_SCHEMA", "inventory top-level keys")
        for key in ("status", "authority_effect", "new_build", "base", "taxonomy_snapshot", "scope", "reason_classes", "formal_judgment_minimum_conditions", "input_snapshot", "oracle_dependencies", "analysis_path", "unit_ids", "negative_case_codes", "authority_boundary"):
            if inventory.get(key) != expected_inv.get(key):
                code = "E_INVENTORY_DECLARATION" if key in {"scope", "reason_classes", "unit_ids", "analysis_path"} else "E_MINIMUM_CONDITIONS" if key == "formal_judgment_minimum_conditions" else "E_AUTHORITY_BOUNDARY" if key in {"status", "authority_effect", "new_build", "oracle_dependencies", "authority_boundary"} else "E_TAXONOMY_COVERAGE" if key == "taxonomy_snapshot" else "E_SOURCE_INPUT_DIGEST" if key == "input_snapshot" else "E_SCHEMA"
                self.error(code, key)
        if inventory.get("negative_case_codes") != NEGATIVE_CASE_CODES: self.error("E_SCHEMA", "negative_case_codes")
        if inventory.get("unit_ids") != TARGET_UNIT_IDS or len(actual) != 30 or [row.get("unit_candidate_id") for row in actual] != TARGET_UNIT_IDS or len({row.get("unit_candidate_id") for row in actual}) != 30: self.error("E_TARGET_SET", "unit set/order")
        expected_tax = {row["unit_candidate_id"]: row for row in rows}
        expected_edges_by_unit = edges_by_unit
        actual_edge_ids: list[str] = []
        actual_assets: set[str] = set()
        for row in actual:
            unit = row.get("unit_candidate_id")
            source = expected_tax.get(unit)
            if source is None: continue
            self.check_unit(row, source, ir, expected_edges_by_unit[unit])
            actual_edge_ids.extend(row.get("wave_edge_ids", [])); actual_assets.update(row.get("legacy_asset_ids", []))
        expected_edge_ids = [ref for row in rows for ref in row["wave_review"]["edge_refs"]]
        if set(actual_edge_ids) != set(expected_edge_ids) or len(actual_edge_ids) != 66: self.error("E_WAVE_EDGE_COVERAGE", "66 edge set")
        if len(actual_edge_ids) != len(set(actual_edge_ids)): self.error("E_WAVE_EDGE_COVERAGE", "duplicate edge")
        if actual_assets != {edge["asset_id"] for edge in edges}: self.error("E_ASSET_EVIDENCE", "38 asset set")
        return self.finish()

    def check_unit(self, actual: dict[str, Any], source: dict[str, Any], ir: dict[str, Any], expected_edges: list[dict[str, Any]]) -> None:
        unit = source["unit_candidate_id"]
        expected_keys = {"schema", "unit_candidate_id", "requirement_id", "crosswalk_id", "product_scope_candidate", "source_anchor", "taxonomy", "candidate_phase_targets", "wave_edge_ids", "wave_edges", "legacy_asset_ids", "reason_class", "reason_description", "required_source_evidence", "required_human_decision", "required_consumer_evidence", "next_action", "product_review", "phase_result", "authority_boundary", "static_only"}
        if set(actual) != expected_keys: self.error("E_SCHEMA", unit + " keys")
        if actual.get("schema") != SCHEMA + "/unit": self.error("E_SCHEMA", unit)
        if actual.get("requirement_id") != source.get("requirement_id") or actual.get("crosswalk_id") != source.get("crosswalk_id") or actual.get("product_scope_candidate") != source.get("product_scope_candidate"): self.error("E_SOURCE_ANCHOR", unit + " binding")
        expected_anchor = expected_source_anchor(source, ir)
        if actual.get("source_anchor") != expected_anchor: self.error("E_SOURCE_ANCHOR", unit)
        tax = source["taxonomy"]
        expected_tax = {"status": tax["status"], "matrix_rule_id": tax["matrix_rule_id"], "candidate_statement": tax["candidate_statement"], "judgment_waiting": tax["judgment_waiting"], "authority_phase_status": tax["authority_phase_status"], "formal_phase_candidate": tax["formal_phase_candidate"], "direct_phase_candidate_count": tax["direct_phase_candidate_count"], "authority_boundary": source["authority_boundary"]}
        if actual.get("taxonomy") != expected_tax:
            if actual.get("taxonomy", {}).get("status") != tax["status"]: self.error("E_TAXONOMY_STATUS", unit)
            if actual.get("taxonomy", {}).get("matrix_rule_id") != tax["matrix_rule_id"]: self.error("E_MATRIX_RULE", unit)
            if actual.get("taxonomy", {}).get("authority_boundary") != source["authority_boundary"]: self.error("E_TAXONOMY_COVERAGE", unit)
        if actual.get("candidate_phase_targets") != source["phase_context"]["observed_asset_candidate_phases"]: self.error("E_TAXONOMY_COVERAGE", unit + " candidates")
        expected_ids = source["wave_review"]["edge_refs"]
        if set(actual.get("wave_edge_ids", [])) != set(expected_ids) or len(actual.get("wave_edge_ids", [])) != len(expected_ids): self.error("E_WAVE_EDGE_COVERAGE", unit)
        if actual.get("wave_edges") != [edge_summary(edge) for edge in expected_edges]: self.error("E_WAVE_EDGE_COVERAGE", unit + " details")
        expected_assets = sorted({edge["asset_id"] for edge in expected_edges})
        if actual.get("legacy_asset_ids") != expected_assets: self.error("E_ASSET_EVIDENCE", unit)
        reason = REASON_BY_UNIT[unit]
        if actual.get("reason_class") != reason: self.error("E_REASON_CLASS", unit)
        desc, action = CLASS_DEFS[reason]
        if actual.get("reason_description") != desc or actual.get("next_action") != action: self.error("E_REASON_CLASS", unit + " text")
        source_evidence = actual.get("required_source_evidence")
        if (not isinstance(source_evidence, list) or len(source_evidence) < 2 or
                not all(isinstance(x, str) and x for x in source_evidence) or
                not source_evidence[0].startswith(SOURCE_EVIDENCE_SENTINELS.get(unit, "\0"))):
            self.error("E_ANALYSIS_EVIDENCE", unit + " source")
        if not isinstance(actual.get("required_human_decision"), list) or len(actual["required_human_decision"]) < 1 or not all(isinstance(x, str) and x for x in actual["required_human_decision"]): self.error("E_ANALYSIS_EVIDENCE", unit + " human")
        if not isinstance(actual.get("required_consumer_evidence"), list) or len(actual["required_consumer_evidence"]) < 1 or not all(isinstance(x, str) and x for x in actual["required_consumer_evidence"]): self.error("E_CONSUMER_EVIDENCE", unit)
        if actual.get("product_review", {}).get("authority_product") is not None or actual.get("product_review", {}).get("status") != "candidate_scope_only": self.error("E_PRODUCT_AUTHORITY_SEPARATION", unit)
        if actual.get("phase_result") != {"direct_phase_evidence_count": 0, "formal_phase_candidate": None, "phase_non_applicability": {"status": "not_proven", "excluded_phase_ids": [], "pending_phase_ids": PHCAP_IDS}}: self.error("E_PHASE_AUTHORITY_SEPARATION", unit)
        if actual.get("authority_boundary") != {"formal_crosswalk_modified": False, "formal_phase_authority_modified": False, "formal_product_authority_modified": False, "implementation_claim_generated": False, "unimplemented_claim_generated": False, "degradation_claim_generated": False, "failure_receipt_generated": False, "consumer_closure_generated": False, "successor_assigned": False, "old_archive_executed": False}: self.error("E_AUTHORITY_BOUNDARY", unit)
        if actual.get("static_only") is not True: self.error("E_AUTHORITY_BOUNDARY", unit + " static")

    def finish(self) -> int:
        if self.errors:
            for error in self.errors: print("ERROR", error)
            return 1
        print("SCF-B-0128 validate PASS (30 units, 66 edges, 38 assets; direct phase evidence 0; formal phase 0)")
        return 0


if __name__ == "__main__":
    raise SystemExit(Validator().validate())
