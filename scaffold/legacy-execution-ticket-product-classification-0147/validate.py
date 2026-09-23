#!/usr/bin/env python3
"""Static consistency verifier. It reads legacy Git objects but never executes them."""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = Path(__file__).resolve().parent
BASE = "a577a7cddd1405de27bf01d22b050eb2acaa9ba9"
LEDGER = "docs/governance/legacy-asset-disposition.jsonl"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
MANIFEST = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
ARCHIVE = "archive/legacy-generation-2026-09-14/root/"
BINDING = "scaffold/bindings/SCF-B-0147.json"
EXPECTED_INV_KEYS = {"schema_revision", "binding_id", "base_revision", "archive_population_count", "selection", "comparison_sets", "input_digests", "classification_counts", "implementation_status_counts", "degradation_status_counts", "formal_effect", "authority_boundary", "outputs", "output_sha256"}
# Exact byte pins bind every nested record field, key set, value type, and line ending.
PINNED_RECORDS_SHA256 = "sha256:e3092094de9aaee773a227cefc4756e8ec480073ecceb5990312bf972715e0cc"
PINNED_INVENTORY_SHA256 = "sha256:4e16ae7df2894f5b3758d5d2941b01a344f13e5004067f724ddfd5f272b8f4b4"
PINNED_BINDING_SHA256 = "sha256:35c32a270dcf29cb2cf71818b0f437e38e12fad3304427b372ae5ca3a3243beb"

def artifact_pin_errors(data: bytes, expected_sha256: str, code: str) -> list[str]:
    return [] if expected_sha256 and digest(data) == expected_sha256 else [code]
BOUNDARY = "docs/concept/product-boundary.md"
APPROVAL = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
L1 = {
    "HELIX-HARNESS": ("docs/helix-harness/L1-planning/product-intent.md", "HARNESS-L1-004", "| HARNESS |", "| `HDEC-HARNESS-L1-01` |"),
    "HELIX-OS": ("docs/helix-os/L1-planning/system-intent.md", "HELIXOS-L1-003", "| HELIX-OS |", "| `HDEC-HELIXOS-L1-01` |"),
    "HELIX-Web": ("docs/helix-web/L1-planning/product-intent.md", "HELIXWEB-L1-001", "| HELIX-Web |", "| `HDEC-HELIXWEB-L1-01` |"),
    "HELIX-Web-OS": ("docs/helix-web-os/L1-planning/system-intent.md", "HELIXWEBOS-L1-002", "| HELIX-Web-OS |", "| `HDEC-HELIXWEBOS-L1-01` |"),
}
EXPECTED = {
    "execution-ticket-acceptance.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"]),
    "execution-ticket-intake.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"]),
    "execution-ticket-recognition.md": ("insufficient_basis", []),
    "execution-ticket-requests.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"]),
    "execution-ticket-requirements.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"]),
    "execution-ticket-trace.md": ("insufficient_basis", []),
    "execution-ticket-validation.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"]),
    "execution-ticket-vision.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"]),
}
SOURCE_UNIMPLEMENTED_CLAIM = {
    "execution-ticket-acceptance.md": True,
    "execution-ticket-intake.md": True,
    "execution-ticket-recognition.md": False,
    "execution-ticket-requests.md": False,
    "execution-ticket-requirements.md": True,
    "execution-ticket-trace.md": True,
    "execution-ticket-validation.md": False,
    "execution-ticket-vision.md": False,
}


def gshow(rev: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{rev}:{path}"], cwd=ROOT)


def gjsonl(rev: str, path: str) -> list[tuple[int, dict]]:
    return [(n, json.loads(line)) for n, line in enumerate(gshow(rev, path).decode().splitlines(), 1) if line.strip()]


def digest(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def receipt(rev: str, path: str, marker: str) -> dict | None:
    data = gshow(rev, path)
    for n, line in enumerate(data.decode().splitlines(), 1):
        if marker in line:
            blob = subprocess.check_output(["git", "rev-parse", f"{rev}:{path}"], cwd=ROOT, text=True).strip()
            return {"path": path, "blob": blob, "sha256": digest(data), "line": n, "text": line, "text_sha256": digest(line.encode())}
    return None


def row_identity(row: dict) -> tuple[str, str, str]:
    source = row.get("source_exact") or {}
    identity = row.get("source_identity") or {}
    provenance = identity.get("archive_provenance") or {}
    path = row.get("source_path") or source.get("source_path") or identity.get("source_path") or provenance.get("source_path") or ""
    sha = source.get("sha256") or row.get("source_sha256") or identity.get("source_sha256") or provenance.get("sha256") or ""
    if sha and not sha.startswith("sha256:"):
        sha = "sha256:" + sha
    return row.get("asset_id", ""), path, sha


def audit_overlap() -> tuple[dict, dict[str, list[str]]]:
    target_rows = [r for _, r in gjsonl(BASE, LEDGER) if r["source_path"].startswith("docs/governance/candidates/execution-ticket-")]
    target_id = {r["asset_id"] for r in target_rows}
    target_path = {r["source_path"] for r in target_rows}
    target_sha = {"sha256:" + r["source_sha256"] for r in target_rows}
    target_triple = {(r["asset_id"], r["source_path"], "sha256:" + r["source_sha256"]) for r in target_rows}
    sets = [
        ("main", BASE, None),
        ("pr_2096", "ab0a1faa4e2b310206b97a786c329334a2a0e151", "scaffold/legacy-research-assets-product-classification-0142/classification-research.jsonl"),
    ]
    summaries, errors = {}, {}
    for name, rev, path in sets:
        paths = [p for p in subprocess.check_output(["git", "ls-tree", "-r", "--name-only", rev, "scaffold"], cwd=ROOT, text=True).splitlines() if p.endswith("/classification-research.jsonl")] if path is None else [path]
        identities = [row_identity(r) for p in paths for _, r in gjsonl(rev, p)]
        ids, source_paths, hashes = ({x[i] for x in identities} for i in range(3))
        triple = set(identities)
        summaries[name] = {"revision": rev, "path": path or "all scaffold/*/classification-research.jsonl", "rows": len(identities), "distinct_ids": len(ids)}
        errors[name] = []
        if target_id & ids: errors[name].append("asset_id")
        if target_path & source_paths: errors[name].append("source_path")
        if target_sha & hashes: errors[name].append("source_sha256")
        if target_triple & triple: errors[name].append("triple")
    return summaries, errors


def validate_records(records: list[dict], inventory: dict) -> list[str]:
    errors: list[str] = []
    if type(inventory) is not dict: return ["E_INVENTORY_SCHEMA"]
    if set(inventory) != EXPECTED_INV_KEYS: errors.append("E_INVENTORY_SCHEMA")
    if type(inventory.get("base_revision")) is not str or inventory.get("base_revision") != BASE: errors.append("E_BASE_REVISION")
    if type(records) is not list or len(records) != 8 or any(type(row) is not dict for row in records): return errors + ["E_RECORD_SCHEMA"]
    if type(inventory.get("comparison_sets")) is not list: return errors + ["E_INVENTORY_SCHEMA"]
    record_bytes = ("".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in records)).encode()
    if inventory.get("output_sha256") != digest(record_bytes): errors.append("E_OUTPUT_DIGEST")
    targets = [(n, r) for n, r in gjsonl(BASE, LEDGER) if r["source_path"].startswith("docs/governance/candidates/execution-ticket-")]
    expected_ids = [r["asset_id"] for _, r in targets]
    ids = [r.get("asset_id") for r in records]
    if ids != expected_ids: errors.append("E_TARGET_SET")
    if len(ids) != len(set(ids)): errors.append("E_DUPLICATE")
    target_by_id = {r["asset_id"]: r for _, r in targets}
    phases = {r["asset_id"]: (n, r) for n, r in gjsonl(BASE, PHASE)}
    for row in records:
        if type(row) is not dict: errors.append("E_RECORD_SCHEMA"); continue
        nested = ("ledger", "source_exact", "classification", "phase", "implementation_degradation", "history_failure_consumer", "authority_boundary")
        if any(type(row.get(key)) is not dict for key in nested): errors.append("E_RECORD_SCHEMA:" + str(row.get("asset_id"))); continue
        aid = row.get("asset_id")
        asset = target_by_id.get(aid)
        if not asset: continue
        path = asset["source_path"]
        basename = path.rsplit("/", 1)[-1]
        archive = ARCHIVE + path
        source = gshow(BASE, archive)
        exact = row["source_exact"]
        tree = subprocess.check_output(["git", "ls-tree", BASE, "--", archive], cwd=ROOT, text=True).strip()
        fields, found = tree.split("\t", 1)
        mode, kind, oid = fields.split()
        manifest = [ln.split()[0] for ln in gshow(BASE, MANIFEST).decode().splitlines() if ln.endswith(" " + path)]
        ledger_row = row.get("ledger", {})
        if found != archive or mode != "100644" or kind != "blob" or exact.get("archive_blob") != oid or exact.get("sha256") != digest(source) or exact.get("ledger_sha256") != "sha256:" + asset["source_sha256"] or exact.get("sha256") != exact.get("ledger_sha256") or len(manifest) != 1 or exact.get("manifest_sha256") != "sha256:" + manifest[0]: errors.append("E_SOURCE:" + aid)
        expected_ledger = {"path": LEDGER, "line": next(n for n, r in gjsonl(BASE, LEDGER) if r["asset_id"] == aid), "row_sha256": digest(json.dumps(asset, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()), "source_path": path, "source_sha256": "sha256:" + asset["source_sha256"], "disposition": "unresolved", "product_target": "unresolved", "implementation_status": "unknown"}
        if set(ledger_row) != set(expected_ledger) or any(type(ledger_row.get(k)) is not type(v) or ledger_row.get(k) != v for k, v in expected_ledger.items()): errors.append("E_LEDGER:" + aid)
        lines = source.decode().splitlines()
        expected_markers = {"execution-ticket-acceptance.md": ["以下90件は未実行oracle", "| HXT-AC-001 |", "| HXB-AC-001 |"], "execution-ticket-intake.md": ["本版はHELIX本体の測定・チューニング要求", "現行Assignment／Bench資産の接続", "本書を要求候補として受理"], "execution-ticket-recognition.md": ["# 企画価値の運用検証候補"], "execution-ticket-requests.md": ["現時点は候補であり、新規実行権限を発行しない", "| HXT-RQ-01 |", "| HXT-RQ-05 |"], "execution-ticket-requirements.md": ["# 要件候補", "| ExecutionTicket |", "| MeasurementEpisode / MetricReceipt |", "L3承認・canonical freeze"], "execution-ticket-trace.md": ["canonical freeze・runtime実装・稼働・性能改善は未完了", "HXT-RQ-02 | HXT-FR-013", "| HXB-FR-001 |"], "execution-ticket-validation.md": ["# 利用要求の受入候補", "| HXT-RQ-05 |", "| HXT-RQ-06 |"], "execution-ticket-vision.md": ["通常開発を追加LLM起動なしで観測", "対象はHELIX本体の実行契約と測定接続"]}[basename]
        anchors = exact.get("semantic_anchors")
        if type(anchors) is not list or len(anchors) != len(expected_markers): errors.append("E_ANCHOR:" + aid)
        else:
            actual_markers = [a.get("marker") if type(a) is dict else None for a in anchors]
            if actual_markers != expected_markers: errors.append("E_ANCHOR:" + aid)
            for anchor in anchors:
                if type(anchor) is not dict or type(anchor.get("line")) is not int: errors.append("E_ANCHOR:" + aid); continue
                n = anchor["line"]
                if n < 1 or n > len(lines) or lines[n-1] != anchor.get("text") or type(anchor.get("marker")) is not str or anchor["marker"] not in lines[n-1] or digest(lines[n-1].encode()) != anchor.get("text_sha256"): errors.append("E_ANCHOR:" + aid)
        status, products = EXPECTED[basename]
        cl = row.get("classification", {})
        if type(cl) is not dict or cl.get("status") != status or cl.get("candidate_products") != products or cl.get("formal_owner") is not None or cl.get("formal_classification_updated") is not False: errors.append("E_PRODUCT:" + aid)
        if type(products) is not list or (status == "direct_product_basis" and len(products) != 1) or (status == "multi_product_conflict" and len(products) < 2) or (status == "insufficient_basis" and len(products) != 0): errors.append("E_CATEGORY_PARTITION:" + aid)
        for p, (l1path, l1marker, boundarymarker, approvalmarker) in L1.items():
            for key, target, marker in [("boundary_evidence", BOUNDARY, boundarymarker), ("l1_evidence", l1path, l1marker), ("approval_evidence", APPROVAL, approvalmarker)]:
                actual = receipt(BASE, target, marker)
                if actual is None or actual not in cl.get(key, []): errors.append("E_BOUNDARY:" + aid + ":" + p)
        p_line, phase = phases[aid]
        ph = row.get("phase", {})
        if type(ph) is not dict or type(ph.get("bootstrap_line")) is not int or ph.get("bootstrap_line") != p_line or ph.get("phase_classification_status") != phase["phase_classification_status"] or ph.get("candidate_phase_targets") != phase["candidate_phase_targets"] or ph.get("bootstrap_candidate_product_targets") != sorted(phase["candidate_product_targets"]) or ph.get("formal_phase_admission") is not False or ph.get("phase_updated") is not False: errors.append("E_PHASE:" + aid)
        impl = row.get("implementation_degradation", {})
        if impl.get("implementation_status") != "unknown" or impl.get("degradation_status") != "unknown" or impl.get("historical_execution_performed") is not False or impl.get("source_text_claims_unimplemented_or_unexecuted") is not SOURCE_UNIMPLEMENTED_CLAIM[basename]: errors.append("E_IMPLEMENTATION:" + aid)
        hist = row.get("history_failure_consumer", {})
        identity_terms = (aid, path)
        decision_match = any(term in gshow(BASE, "docs/governance/legacy-asset-decisions.jsonl").decode() for term in identity_terms)
        read_after_match = any(term in gshow(BASE, "docs/governance/legacy-asset-copy-read-after.jsonl").decode() for term in identity_terms)
        failure_match = any(term in gshow(BASE, "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md").decode() for term in identity_terms)
        consumer_match = any(term in gshow(BASE, "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md").decode() for term in identity_terms)
        if type(hist) is not dict or hist.get("consumer_closure_status") != "pending" or hist.get("consumer_refs") != [] or type(hist.get("direct_refs")) is not list or hist.get("decision_log_asset_match") is not decision_match or hist.get("read_after_asset_match") is not read_after_match: errors.append("E_CONSUMER:" + aid)
        if hist.get("bootstrap_candidate_product_targets") != sorted(phase["candidate_product_targets"]): errors.append("E_BOOTSTRAP_COMPARISON:" + aid)
        if sorted(products) != sorted(phase["candidate_product_targets"]) and not hist.get("counterevidence"): errors.append("E_BOOTSTRAP_COMPARISON:" + aid)
        if hist.get("failure_inventory", {}).get("asset_id_or_path_match") != failure_match or hist.get("consumer_inventory", {}).get("asset_id_or_path_match") != consumer_match: errors.append("E_HISTORY:" + aid)
        auth = row.get("authority_boundary", {})
        if auth.get("authority_effect") != "none" or auth.get("formal_product_authority") is not None or auth.get("new_build_allowed") is not False or auth.get("successor_assignment") is not None: errors.append("E_AUTHORITY:" + aid)
    set_summaries, overlaps = audit_overlap()
    for name, keys in overlaps.items():
        if keys: errors.append("E_OVERLAP:" + name + ":" + ",".join(keys))
    declared_sets = {r.get("name"): r for r in inventory.get("comparison_sets", [])}
    if set(declared_sets) != set(set_summaries): errors.append("E_COMPARISON_SETS")
    for name, actual in set_summaries.items():
        for key in ("revision", "path", "rows", "distinct_ids"):
            declared_value = declared_sets.get(name, {}).get(key)
            if type(declared_value) is not type(actual[key]) or declared_value != actual[key]: errors.append("E_COMPARISON_SET:" + name)
    category_counts = {"multi_product_conflict": sum(r["classification"].get("status") == "multi_product_conflict" for r in records), "insufficient_basis": sum(r["classification"].get("status") == "insufficient_basis" for r in records)}
    if category_counts != {"multi_product_conflict": 6, "insufficient_basis": 2} or inventory.get("classification_counts") != category_counts: errors.append("E_CATEGORY_PARTITION")
    if inventory.get("authority_boundary") != {"authority_effect": "none", "formal_asset_classification_updated": False, "formal_phase_admission": False, "formal_product_authority": None, "formal_owner_decided": False, "formal_implementation_status": "unknown", "formal_consumer_closure": False, "new_build_allowed": False, "LABO": "excluded; Issue #2089 hold remains in force"}: errors.append("E_AUTHORITY")
    return errors


def verify() -> None:
    record_bytes = (BUNDLE / "classification-research.jsonl").read_bytes()
    inventory_bytes = (BUNDLE / "inventory.json").read_bytes()
    binding_bytes = (ROOT / BINDING).read_bytes()
    if artifact_pin_errors(record_bytes, PINNED_RECORDS_SHA256, "E_RECORD_BYTES"): raise SystemExit("E_RECORD_BYTES: full JSONL object/key/type/value/line-ending pin mismatch")
    if artifact_pin_errors(inventory_bytes, PINNED_INVENTORY_SHA256, "E_INVENTORY_BYTES"): raise SystemExit("E_INVENTORY_BYTES: complete inventory pin mismatch")
    if artifact_pin_errors(binding_bytes, PINNED_BINDING_SHA256, "E_BINDING_BYTES"): raise SystemExit("E_BINDING_BYTES: complete Binding pin mismatch")
    records = [json.loads(line) for line in record_bytes.decode().splitlines() if line.strip()]
    inventory = json.loads(inventory_bytes)
    binding = json.loads(binding_bytes)
    if set(inventory) != EXPECTED_INV_KEYS or inventory.get("output_sha256") != digest(record_bytes): raise SystemExit("E_INVENTORY_SCHEMA: key set or byte binding")
    if binding.get("id") != "SCF-B-0147" or binding.get("kind") != "scaffold" or not any("LABO" in x for x in binding.get("operations", {}).get("forbidden", [])): raise SystemExit("E_BINDING: identity/schema/LABO exclusion")
    errors = validate_records(records, inventory)
    if errors:
        raise SystemExit("validation failed: " + ", ".join(errors[:12]))
    print(f"SCF-B-0147 static validation passed: {len(records)} assets")


if __name__ == "__main__":
    verify()
