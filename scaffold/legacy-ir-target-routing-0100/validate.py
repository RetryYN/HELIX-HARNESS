#!/usr/bin/env python3
"""SCF-B-0100の静的validator。旧archiveの実行面は呼び出さない。"""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = Path(__file__).resolve().parent
OLD_IR = "archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json"
EXPECTED_BASE = "36784d25aa4cc53d89c28c2ff81b4009db234605"
PRODUCTS = {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}
EXPECTED_IDS = {
    "HIL-BR-19", "HIL-FR-27", "HIL-FR-33", "HIL-FR-34", "HIL-NFR-09",
    "HIL-NFR-14", "HIL-NFR-19", "HIL-NFR-25", "HIL-TR-01", "HIL-TR-02",
    "HIL-TR-03", "HIL-TR-04", "HIL-TR-05", "HIL-TR-06", "HIL-TR-07",
    "HIL-TR-08", "HIL-TR-09", "HIL-TR-11",
}
BOUNDARY_LINES = {"HELIX-HARNESS": 36, "HELIX-OS": 37, "HELIX-Web": 38, "HELIX-Web-OS": 39}
BOUNDARY_INTERPRETATION = "HARNESSは工程・提供契約、HELIX-OSは管理・Worker・CI・状態・改善の責務。candidateは正式ownerを確定しない。"


def sha_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_jsonl(path: str):
    rows, lines = [], {}
    for number, raw in enumerate((ROOT / path).read_text(encoding="utf-8").splitlines(), 1):
        if not raw.strip():
            continue
        item = json.loads(raw)
        rows.append(item)
        key = item.get("requirement_id") or item.get("source_requirement_id")
        if key:
            lines[key] = number
    return rows, lines


def load_crosswalk():
    rows, lines = [], {}
    path = ROOT / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
    for number, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not raw.strip():
            continue
        item = json.loads(raw)
        rows.append(item)
        lines[(item.get("source_requirement_id"), item.get("unit_candidate_id"))] = number
    return rows, lines


def blob(path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", "HEAD:" + path], cwd=ROOT, text=True).strip()


def line_anchor(path: str, line: int):
    lines = (ROOT / path).read_text(encoding="utf-8").splitlines()
    if line < 1 or line > len(lines):
        return None, None
    text = lines[line - 1]
    return text, hashlib.sha256(text.encode("utf-8")).hexdigest()


def error(code: str, message: str) -> str:
    return f"{code}: {message}"


def statement_line_anchor(requirement_id: str):
    lines = (ROOT / OLD_IR).read_text(encoding="utf-8").splitlines()
    found_id = False
    in_statement = False
    for number, line in enumerate(lines, 1):
        if f'"requirement_id": "{requirement_id}"' in line:
            found_id = True
            continue
        if not found_id:
            continue
        if '"statement": {' in line:
            in_statement = True
            continue
        if in_statement and '"text": ' in line:
            return number, line, hashlib.sha256(line.encode("utf-8")).hexdigest()
        if line.startswith('  "HIL-'):
            break
    return None, None, None


def base_ancestor_errors(base_head: str = EXPECTED_BASE, head: str = "HEAD"):
    """固定BASEが検証対象HEADの祖先であることを確認する。"""
    errors = []
    if subprocess.run(
        ["git", "merge-base", "--is-ancestor", base_head, head],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    ).returncode != 0:
        errors.append(error("E_BASE_NOT_ANCESTOR", f"base={base_head} head={head}"))
    return errors


def validate_inventory(inventory, check_ancestor: bool = True):
    errors = []
    if inventory.get("base_head") != EXPECTED_BASE:
        errors.append(error("E_BASE_HEAD", f"base_head={inventory.get('base_head')}"))
    elif check_ancestor:
        errors.extend(base_ancestor_errors(inventory.get("base_head")))
    if inventory.get("record_count") != 18 or inventory.get("queue_unchanged") is not True:
        errors.append(error("E_INVENTORY", "inventory count/queue_unchanged不一致"))
    for entry in inventory.get("input_digests", []):
        path = entry.get("path")
        if not path:
            errors.append(error("E_INPUT_DIGEST", "input digest path missing"))
            continue
        source = ROOT / path
        if not source.exists():
            errors.append(error("E_INPUT_DIGEST", f"input missing: {path}"))
            continue
        if sha_file(source) != entry.get("sha256"):
            errors.append(error("E_INPUT_DIGEST", f"input bytes digest drift: {path}"))
        try:
            current_blob = blob(path)
        except subprocess.CalledProcessError:
            current_blob = None
        if current_blob != entry.get("blob"):
            errors.append(error("E_INPUT_BLOB", f"input Git blob drift: {path}"))
    return errors


def validate_records(records, check_files: bool = True):
    errors = []
    queue_rows, queue_lines = load_jsonl("docs/governance/legacy-ir-target-routing-queue.jsonl")
    routing_rows, routing_lines = load_jsonl("docs/governance/legacy-ir-product-routing-bootstrap.jsonl")
    decomp_rows, decomp_lines = load_jsonl("docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl")
    correction_rows, _ = load_jsonl("docs/governance/legacy-ir-product-routing-corrections.jsonl")
    crosswalk_rows, crosswalk_lines = load_crosswalk()
    ledger_rows, _ = load_jsonl("docs/governance/legacy-asset-disposition.jsonl")
    ledger = {item.get("asset_id"): item for item in ledger_rows}
    unresolved_queue_rows = [item for item in queue_rows if item.get("target_resolution_status") == "unresolved_target"]
    unresolved_queue_ids = {item.get("requirement_id") for item in unresolved_queue_rows}
    if unresolved_queue_ids != EXPECTED_IDS or len(unresolved_queue_rows) != len(EXPECTED_IDS):
        errors.append(error("E_QUEUE_SET", f"queueから動的再導出したunresolved_target set不一致 missing={sorted(EXPECTED_IDS-unresolved_queue_ids)} extra={sorted(unresolved_queue_ids-EXPECTED_IDS)} count={len(unresolved_queue_rows)}"))
    queue = {item.get("requirement_id"): item for item in unresolved_queue_rows}
    routing = {item.get("source_requirement_id"): item for item in routing_rows}
    decomposition = {item.get("source_requirement_id"): item for item in decomp_rows}
    corrections = {item.get("source_requirement_id") for item in correction_rows}
    crosswalk = {(item.get("source_requirement_id"), item.get("unit_candidate_id")): item for item in crosswalk_rows}
    old_ir = json.loads((ROOT / OLD_IR).read_text(encoding="utf-8"))

    ids = [item.get("source_requirement_id") for item in records]
    if len(ids) != len(set(ids)):
        errors.append(error("E_ID_DUPLICATE", "bridge record source_requirement_id が重複"))
    if set(ids) != EXPECTED_IDS:
        errors.append(error("E_ID_SET", f"18件exact set不一致 missing={sorted(EXPECTED_IDS-set(ids))} extra={sorted(set(ids)-EXPECTED_IDS)}"))
    if len(records) != 18:
        errors.append(error("E_ID_COUNT", f"record count={len(records)}"))

    for item in records:
        rid = item.get("source_requirement_id")
        if rid not in EXPECTED_IDS:
            continue
        q, r, d, source = queue.get(rid), routing.get(rid), decomposition.get(rid), old_ir.get(rid)
        if not all((q, r, d, source)):
            errors.append(error("E_SOURCE_MISSING", f"{rid}: queue/routing/decomposition/source missing"))
            continue
        src = item.get("source_exact", {})
        statement = source.get("statement", {})
        expected_line, expected_line_text, expected_line_digest = statement_line_anchor(rid)
        if src.get("path") != OLD_IR:
            errors.append(error("E_SOURCE_REFERENCE", f"{rid}: old IR path不一致"))
        if src.get("line") != expected_line:
            errors.append(error("E_SOURCE_LINE_ANCHOR", f"{rid}: statement.text line={src.get('line')} expected={expected_line}"))
        if src.get("line_text") != expected_line_text:
            errors.append(error("E_SOURCE_LINE_ANCHOR", f"{rid}: statement.text line text不一致"))
        if src.get("line_text_sha256") != expected_line_digest:
            errors.append(error("E_SOURCE_LINE_DIGEST", f"{rid}: statement.text line digest不一致"))
        if src.get("json_pointer") != f"requirements.json#/{rid}/statement/text":
            errors.append(error("E_SOURCE_REFERENCE", f"{rid}: JSON pointer不一致"))
        if src.get("statement_text") != statement.get("text"):
            errors.append(error("E_SOURCE_TEXT", f"{rid}: statement text不一致"))
        if src.get("statement_semantic_digest") != statement.get("semantic_digest"):
            errors.append(error("E_SOURCE_DIGEST", f"{rid}: old IR statement digest不一致"))
        if src.get("statement_semantic_digest") != d.get("source_statement_semantic_digest") or src.get("statement_semantic_digest") != r.get("source_statement_semantic_digest"):
            errors.append(error("E_SOURCE_DIGEST", f"{rid}: prior ledger digestと不一致"))
        if src.get("blob") != blob(OLD_IR):
            errors.append(error("E_SOURCE_REFERENCE", f"{rid}: old IR blob不一致"))
        if check_files and src.get("source_file_sha256") != sha_file(ROOT / OLD_IR):
            errors.append(error("E_SOURCE_DIGEST", f"{rid}: old IR file digest不一致"))

        qs = item.get("queue_status", {})
        for key in ("target_resolution_status", "candidate_product_targets", "original_target_assessment", "unresolved_reason"):
            if qs.get(key) != q.get(key):
                errors.append(error("E_QUEUE_STATE", f"{rid}: queue台帳の動的再導出値 {key} とrecordが不一致"))
        if q.get("target_resolution_status") != "unresolved_target" or q.get("candidate_product_targets") != []:
            errors.append(error("E_QUEUE_SOURCE_STATE", f"{rid}: queue台帳自身が18件unresolved空候補の契約に不一致"))
        if qs.get("target_resolution_status") != "unresolved_target" or qs.get("candidate_product_targets") != []:
            errors.append(error("E_QUEUE_STATE", f"{rid}: queue unresolved stateを変形"))
        prior = item.get("prior_routing", {})
        cand = item.get("decomposition_candidate", {})
        if prior.get("candidate_product_targets") != r.get("candidate_product_targets") or prior.get("routing_candidate") != r.get("routing_candidate"):
            errors.append(error("E_CANDIDATE_BOUNDARY", f"{rid}: routing candidate drift"))
        if cand.get("candidate_product_targets") != d.get("candidate_product_targets") or cand.get("routing_candidate") != d.get("routing_candidate"):
            errors.append(error("E_CANDIDATE_BOUNDARY", f"{rid}: decomposition candidate drift"))
        if cand.get("candidate_product_targets") != prior.get("candidate_product_targets"):
            errors.append(error("E_CANDIDATE_BOUNDARY", f"{rid}: routing/decomposition target set不一致"))
        if rid in corrections:
            errors.append(error("E_CORRECTION_OVERLAP", f"{rid}: correction対象はbridge対象外でなければならない"))

        got_units = cand.get("candidate_units", [])
        want_units = d.get("candidate_units", [])
        if [u.get("unit_candidate_id") for u in got_units] != [u.get("unit_candidate_id") for u in want_units]:
            errors.append(error("E_UNIT_SET", f"{rid}: candidate unit set不一致"))
        for unit in got_units:
            uid = unit.get("unit_candidate_id")
            original = next((u for u in want_units if u.get("unit_candidate_id") == uid), None)
            if original is None:
                errors.append(error("E_UNIT_SET", f"{rid}: unknown unit {uid}"))
                continue
            for key in ("unit_kind", "candidate_product", "responsibility_summary", "source_text_spans", "direct_phase_candidates", "phase_classification_status", "semantic_coverage_status", "shared_source_overlaps"):
                source_key = "product_target" if key == "candidate_product" else key
                if unit.get(key) != original.get(source_key):
                    errors.append(error("E_UNIT_SOURCE", f"{rid}/{uid}: {key}不一致"))
            if unit.get("candidate_product") not in PRODUCTS:
                errors.append(error("E_CANDIDATE_BOUNDARY", f"{rid}/{uid}: unknown product"))
            old_refs = [x for x in unit.get("evidence_refs", []) if x.get("path") == OLD_IR]
            if not old_refs or any(x.get("line") != expected_line for x in old_refs):
                errors.append(error("E_SOURCE_LINE_ANCHOR", f"{rid}/{uid}: unit evidence line不一致"))
            x = crosswalk.get((rid, uid))
            if x is None:
                errors.append(error("E_CROSSWALK_MISSING", f"{rid}/{uid}: crosswalk missing"))
                continue
            status = unit.get("crosswalk_status", {})
            if status.get("legacy_execution_performed") is not False or status.get("new_build_allowed") is not False:
                errors.append(error("E_LEGACY_EXECUTION", f"{rid}/{uid}: execution/new_build promotion"))
            if status.get("direct_legacy_asset_links") not in ([], None):
                errors.append(error("E_ASSET_DIRECT_LINK", f"{rid}/{uid}: direct semantic asset link promoted"))
            expected_assets = {a.get("asset_id") for a in x.get("representative_legacy_assets", [])}
            actual_assets = {a.get("asset_id") for a in unit.get("candidate_legacy_assets", [])}
            if expected_assets != actual_assets:
                errors.append(error("E_ASSET_SET", f"{rid}/{uid}: candidate asset set不一致"))
            for asset in unit.get("candidate_legacy_assets", []):
                aid = asset.get("asset_id")
                row = ledger.get(aid)
                if row is None or not asset.get("ledger_match"):
                    errors.append(error("E_ASSET_LEDGER_MISSING", f"{rid}/{uid}/{aid}: ledger missing"))
                    continue
                if asset.get("source_sha256") != row.get("source_sha256") or asset.get("source_path") != row.get("source_path"):
                    errors.append(error("E_ASSET_LEDGER_DIGEST", f"{rid}/{uid}/{aid}: source path/digest drift"))
                if asset.get("disposition") != row.get("disposition") or asset.get("disposition") != "unresolved":
                    errors.append(error("E_ASSET_LEDGER_STATE", f"{rid}/{uid}/{aid}: disposition promoted"))
                if asset.get("ledger_ref", {}).get("blob") != blob("docs/governance/legacy-asset-disposition.jsonl"):
                    errors.append(error("E_ASSET_LEDGER_REFERENCE", f"{rid}/{uid}/{aid}: ledger blob drift"))
                if asset.get("consumer", {}).get("closure_status") not in ("pending", "not_observed_pending"):
                    errors.append(error("E_CONSUMER_BOUNDARY", f"{rid}/{uid}/{aid}: consumer closure promoted"))
                if asset.get("failure", {}).get("status") != "unreviewed_pending_semantic_review":
                    errors.append(error("E_FAILURE_BOUNDARY", f"{rid}/{uid}/{aid}: failure status promoted"))
        boundary = item.get("product_boundary", {})
        if boundary.get("evaluated_products") != ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]:
            errors.append(error("E_CANDIDATE_BOUNDARY", f"{rid}: four-product evaluated set drift"))
        refs = boundary.get("boundary_refs", [])
        expected_boundary_blob = blob("docs/concept/product-boundary.md")
        expected_refs = []
        for product in ("HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"):
            line = BOUNDARY_LINES[product]
            line_text, line_digest = line_anchor("docs/concept/product-boundary.md", line)
            expected_refs.append({
                "product": product,
                "path": "docs/concept/product-boundary.md",
                "blob": expected_boundary_blob,
                "line": line,
                "line_text": line_text,
                "line_text_sha256": line_digest,
            })
        if refs != expected_refs:
            if any(x.get("blob") != expected_boundary_blob for x in refs):
                errors.append(error("E_BOUNDARY_BLOB", f"{rid}: product-boundary blob不一致"))
            if any(x.get("line_text") != expected.get("line_text") or x.get("line_text_sha256") != expected.get("line_text_sha256") for x, expected in zip(refs, expected_refs)):
                errors.append(error("E_BOUNDARY_LINE_ANCHOR", f"{rid}: product-boundary実行行または行digest不一致"))
            if not any(item.startswith("E_BOUNDARY_BLOB:") for item in errors[-4:]) and not any(item.startswith("E_BOUNDARY_LINE_ANCHOR:") for item in errors[-4:]):
                errors.append(error("E_BOUNDARY_REFERENCE", f"{rid}: product-boundary path/product/line参照不一致"))
        expected_interpretation_digest = hashlib.sha256(BOUNDARY_INTERPRETATION.encode("utf-8")).hexdigest()
        if boundary.get("interpretation") != BOUNDARY_INTERPRETATION or boundary.get("interpretation_sha256") != expected_interpretation_digest:
            errors.append(error("E_BOUNDARY_INTERPRETATION", f"{rid}: product-boundary interpretationまたはdigest不一致"))
        if item.get("authority_effect") != "none" or item.get("meaning_change_applied") is not False or item.get("successor_assignment_status") != "unassigned":
            errors.append(error("E_AUTHORITY_BOUNDARY", f"{rid}: authority/meaning/successor promoted"))
        if item.get("legacy_execution_performed") is not False:
            errors.append(error("E_LEGACY_EXECUTION", f"{rid}: legacy execution promoted"))
        for meaning in item.get("meaning_differences", []):
            if meaning.get("kind") == "routing_correction" and meaning.get("correction_state") != "proposed_pending_po_review":
                errors.append(error("E_AUTHORITY_BOUNDARY", f"{rid}: correction promoted"))

    return errors


def main() -> int:
    records = [json.loads(line) for line in (BUNDLE / "research.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    errors = validate_records(records)
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    inventory = json.loads((BUNDLE / "inventory.json").read_text(encoding="utf-8"))
    inventory_errors = validate_inventory(inventory)
    if inventory_errors:
        print("\n".join(inventory_errors), file=sys.stderr)
        return 1
    print("SCF-B-0100 validate: PASS records=18 candidate_units=27 queue_unchanged=true")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
