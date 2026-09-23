#!/usr/bin/env python3
"""Static consistency verifier. It reads legacy Git objects but never executes them."""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = Path(__file__).resolve().parent
BASE = "b3a3c49b34bfaa1cca5861075d1de18c0e5e7204"
LEDGER = "docs/governance/legacy-asset-disposition.jsonl"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
MANIFEST = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
ARCHIVE = "archive/legacy-generation-2026-09-14/root/"
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
    "execution-ticket-vision.md": ("insufficient_basis", ["HELIX-HARNESS", "HELIX-OS"]),
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
        ("pr_2078", "c55ffc91b08aabb0a0216168b3cf2b1e5fe6bf03", "scaffold/legacy-implementation-residual-0126/classification-research.jsonl"),
        ("pr_2090", "2c84761d73e46349874978810b886c611e4b009d", "scaffold/legacy-config-product-classification-0141/classification-research.jsonl"),
        ("pr_2094", "115b49bc165dc9419e71c3f8e846565c973999fd", "scaffold/legacy-ai-instruction-product-classification-0145/classification-research.jsonl"),
        ("pr_2092_reconciliation", "ac8aa82c3ba9463d24810a9eac8be1302544b760", "scaffold/legacy-overlap-reconciliation-0144/classification-reconciliation.jsonl"),
        ("scf_b_0142", "6deb8a48ff1187be58e6aaa704401b80d1d6fbbd", "scaffold/legacy-research-assets-product-classification-0142/classification-research.jsonl"),
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
    targets = [(n, r) for n, r in gjsonl(BASE, LEDGER) if r["source_path"].startswith("docs/governance/candidates/execution-ticket-")]
    expected_ids = [r["asset_id"] for _, r in targets]
    ids = [r.get("asset_id") for r in records]
    if ids != expected_ids: errors.append("E_TARGET_SET")
    if len(ids) != len(set(ids)): errors.append("E_DUPLICATE")
    target_by_id = {r["asset_id"]: r for _, r in targets}
    phases = {r["asset_id"]: (n, r) for n, r in gjsonl(BASE, PHASE)}
    for row in records:
        aid = row.get("asset_id")
        asset = target_by_id.get(aid)
        if not asset: continue
        path = asset["source_path"]
        basename = path.rsplit("/", 1)[-1]
        archive = ARCHIVE + path
        source = gshow(BASE, archive)
        exact = row.get("source_exact", {})
        tree = subprocess.check_output(["git", "ls-tree", BASE, "--", archive], cwd=ROOT, text=True).strip()
        fields, found = tree.split("\t", 1)
        mode, kind, oid = fields.split()
        manifest = [ln.split()[0] for ln in gshow(BASE, MANIFEST).decode().splitlines() if ln.endswith(" " + path)]
        ledger_row = row.get("ledger", {})
        if found != archive or mode != "100644" or kind != "blob" or exact.get("archive_blob") != oid or exact.get("sha256") != digest(source) or exact.get("ledger_sha256") != "sha256:" + asset["source_sha256"] or exact.get("sha256") != exact.get("ledger_sha256") or len(manifest) != 1 or exact.get("manifest_sha256") != "sha256:" + manifest[0]: errors.append("E_SOURCE:" + aid)
        if ledger_row.get("source_path") != path or ledger_row.get("source_sha256") != "sha256:" + asset["source_sha256"] or ledger_row.get("disposition") != "unresolved" or ledger_row.get("product_target") != "unresolved" or ledger_row.get("implementation_status") != "unknown": errors.append("E_LEDGER:" + aid)
        lines = source.decode().splitlines()
        for anchor in exact.get("semantic_anchors", []):
            n = anchor.get("line", 0)
            if n < 1 or n > len(lines) or lines[n-1] != anchor.get("text") or anchor.get("marker") not in lines[n-1] or digest(lines[n-1].encode()) != anchor.get("text_sha256"): errors.append("E_ANCHOR:" + aid)
        status, products = EXPECTED[basename]
        cl = row.get("classification", {})
        if cl.get("status") != status or cl.get("candidate_products") != products or cl.get("formal_owner") is not None or cl.get("formal_classification_updated") is not False: errors.append("E_PRODUCT:" + aid)
        for p, (l1path, l1marker, boundarymarker, approvalmarker) in L1.items():
            for key, target, marker in [("boundary_evidence", BOUNDARY, boundarymarker), ("l1_evidence", l1path, l1marker), ("approval_evidence", APPROVAL, approvalmarker)]:
                actual = receipt(BASE, target, marker)
                if actual is None or actual not in cl.get(key, []): errors.append("E_BOUNDARY:" + aid + ":" + p)
        p_line, phase = phases[aid]
        ph = row.get("phase", {})
        if ph.get("bootstrap_line") != p_line or ph.get("phase_classification_status") != phase["phase_classification_status"] or ph.get("candidate_phase_targets") != phase["candidate_phase_targets"] or ph.get("formal_phase_admission") is not False or ph.get("phase_updated") is not False: errors.append("E_PHASE:" + aid)
        impl = row.get("implementation_degradation", {})
        if impl.get("implementation_status") != "unknown" or impl.get("degradation_status") != "unknown" or impl.get("historical_execution_performed") is not False: errors.append("E_IMPLEMENTATION:" + aid)
        hist = row.get("history_failure_consumer", {})
        identity_terms = (aid, path)
        decision_match = any(term in gshow(BASE, "docs/governance/legacy-asset-decisions.jsonl").decode() for term in identity_terms)
        read_after_match = any(term in gshow(BASE, "docs/governance/legacy-asset-copy-read-after.jsonl").decode() for term in identity_terms)
        failure_match = any(term in gshow(BASE, "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md").decode() for term in identity_terms)
        consumer_match = any(term in gshow(BASE, "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md").decode() for term in identity_terms)
        if hist.get("consumer_closure_status") != "pending" or hist.get("consumer_refs") != [] or hist.get("decision_log_asset_match") != decision_match or hist.get("read_after_asset_match") != read_after_match: errors.append("E_CONSUMER:" + aid)
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
            if declared_sets.get(name, {}).get(key) != actual[key]: errors.append("E_COMPARISON_SET:" + name)
    return errors


def verify() -> None:
    records = [json.loads(line) for line in (BUNDLE / "classification-research.jsonl").read_text().splitlines() if line.strip()]
    inventory = json.loads((BUNDLE / "inventory.json").read_text())
    errors = validate_records(records, inventory)
    if errors:
        raise SystemExit("validation failed: " + ", ".join(errors[:12]))
    print(f"SCF-B-0147 static validation passed: {len(records)} assets")


if __name__ == "__main__":
    verify()
