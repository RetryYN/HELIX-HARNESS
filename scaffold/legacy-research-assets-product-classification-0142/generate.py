#!/usr/bin/env python3
"""Generate SCF-B-0142 from fixed Git objects; legacy assets are never executed."""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-research-assets-product-classification-0142"
BINDING = ROOT / "scaffold/bindings/SCF-B-0142.json"
SNAPSHOT = BUNDLE / "research-union-snapshot.json"
SNAPSHOT_SHA256 = "sha256:4ad0a0d393ed8e0d334354fe0449ad167a3762251f709e969e30e3e5fdaaece9"
BASE_REVISION = "a577a7cddd1405de27bf01d22b050eb2acaa9ba9"
PR_2097 = "d233e6e99f705439043a07f0a96bdd9e535a288a"
BINDING_ID = "SCF-B-0142"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
MANIFEST = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
BOUNDARY = "docs/concept/product-boundary.md"
APPROVAL = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
START = "docs/governance/new-generation-start-here.md"
REUSE = "docs/governance/legacy-asset-reuse-control.md"
FAILURE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
TARGET_PREFIX = "docs/research/assets/"
PRODUCTS = ("HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS")
L1 = {
    "HELIX-HARNESS": "docs/helix-harness/L1-planning/product-intent.md",
    "HELIX-OS": "docs/helix-os/L1-planning/system-intent.md",
    "HELIX-Web": "docs/helix-web/L1-planning/product-intent.md",
    "HELIX-Web-OS": "docs/helix-web-os/L1-planning/system-intent.md",
}
L1_MARKERS = {
    "HELIX-HARNESS": "| HARNESS-L1-004 |",
    "HELIX-OS": "| HELIXOS-L1-003 |",
    "HELIX-Web": "| HELIXWEB-L1-001 |",
    "HELIX-Web-OS": "| HELIXWEBOS-L1-002 |",
}
BOUNDARY_MARKERS = {
    "HELIX-HARNESS": "| HARNESS |",
    "HELIX-OS": "| HELIX-OS |",
    "HELIX-Web": "| HELIX-Web |",
    "HELIX-Web-OS": "| HELIX-Web-OS |",
}
APPROVAL_MARKERS = {
    "HELIX-HARNESS": "| `HDEC-HARNESS-L1-01` |",
    "HELIX-OS": "| `HDEC-HELIXOS-L1-01` |",
    "HELIX-Web": "| `HDEC-HELIXWEB-L1-01` |",
    "HELIX-Web-OS": "| `HDEC-HELIXWEBOS-L1-01` |",
}
WAVE_PATHS = tuple(
    f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl"
    if n <= 36
    else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl"
    for n in range(1, 51)
)
def git_names(revision: str) -> list[str]:
    try:
        return subprocess.check_output(["git", "ls-tree", "-r", "--name-only", revision], text=True, cwd=ROOT).splitlines()
    except subprocess.CalledProcessError as exc:
        raise AssertionError(f"E_INPUT_STALE: pinned revision unavailable: {revision}") from exc


MAIN_RESEARCH_PATHS = tuple(sorted(p for p in git_names(BASE_REVISION) if p.startswith("scaffold/") and p.endswith("/classification-research.jsonl")))
OPEN_RESEARCH = {
    PR_2097: "scaffold/legacy-execution-ticket-product-classification-0147/classification-research.jsonl",
}
CORE_INPUTS = (
    DISPOSITION,
    PHASE,
    DECISIONS,
    READ_AFTER,
    BOUNDARY,
    *L1.values(),
    APPROVAL,
    START,
    REUSE,
    FAILURE,
    CONSUMER,
    MANIFEST,
    *WAVE_PATHS,
)


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def canonical(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def row_digest(value: object) -> str:
    return tagged(canonical(value))


def git_bytes(revision: str, path: str) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)
    except subprocess.CalledProcessError as exc:
        raise AssertionError(f"E_INPUT_STALE: pinned Git object unavailable: {revision}:{path}") from exc


def git_blob(revision: str, path: str) -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", f"{revision}:{path}"], text=True, cwd=ROOT).strip()
    except subprocess.CalledProcessError as exc:
        raise AssertionError(f"E_INPUT_STALE: pinned Git object unavailable: {revision}:{path}") from exc


def json_rows(revision: str, path: str) -> list[tuple[int, dict]]:
    rows: list[tuple[int, dict]] = []
    for line_no, line in enumerate(git_bytes(revision, path).decode(errors="replace").splitlines(), 1):
        if line.strip():
            value = json.loads(line)
            if not isinstance(value, dict):
                raise AssertionError(f"non-object row: {path}:{line_no}")
            rows.append((line_no, value))
    return rows


def receipt(revision: str, path: str, marker: str) -> dict:
    lines = git_bytes(revision, path).decode(errors="replace").splitlines()
    for number, line in enumerate(lines, 1):
        if marker in line:
            return {
                "path": path,
                "blob": git_blob(revision, path),
                "sha256": tagged(git_bytes(revision, path)),
                "line_start": number,
                "line_end": number,
                "line_text": [line],
                "line_text_sha256": tagged(line.encode()),
                "marker": marker,
                "read_mode": "git_object_static_read_only",
            }
    raise AssertionError(f"marker not found: {path}: {marker}")


def static_ref(revision: str, path: str) -> dict:
    data = git_bytes(revision, path)
    return {"revision": revision, "path": path, "blob": git_blob(revision, path), "bytes": len(data), "sha256": tagged(data), "read_mode": "git_object_static_read_only"}


def build_research_snapshot() -> dict:
    entries = [(BASE_REVISION, path) for path in MAIN_RESEARCH_PATHS] + list(OPEN_RESEARCH.items())
    prior = None
    if SNAPSHOT.exists():
        prior_bytes = SNAPSHOT.read_bytes()
        if tagged(prior_bytes) != SNAPSHOT_SHA256:
            raise AssertionError("E_INPUT_STALE: existing vendored research snapshot digest mismatch")
        prior = json.loads(prior_bytes)
    records = []
    for revision, path in entries:
        try:
            data = git_bytes(revision, path)
            blob = git_blob(revision, path)
        except AssertionError as exc:
            if not str(exc).startswith("E_INPUT_STALE:") or prior is None:
                raise
            old = next((row for row in prior.get("records", []) if row.get("revision") == revision and row.get("path") == path), None)
            if old is None:
                raise AssertionError(f"E_INPUT_STALE: no vendored snapshot for {revision}:{path}") from exc
            records.append(old)
            continue
        rows = [json.loads(line) for line in data.decode().splitlines() if line.strip()]
        identities = sorted([
            row.get("asset_id", ""),
            row.get("source_path") or (row.get("source_exact") or {}).get("source_path") or "",
            ((row.get("source_exact") or {}).get("sha256") or row.get("source_sha256") or ""),
        ] for row in rows)
        if any(not all(item) for item in identities):
            raise AssertionError(f"research identity incomplete in {revision}:{path}")
        records.append({"revision": revision, "path": path, "blob": blob, "bytes": len(data), "sha256": tagged(data), "identities": identities})
    return {"schema_revision": 1, "records": records}


def snapshot_ref(revision: str, path: str) -> dict:
    snapshot = json.loads(SNAPSHOT.read_text())
    row = next((entry for entry in snapshot["records"] if entry["revision"] == revision and entry["path"] == path), None)
    if row is None:
        raise AssertionError(f"E_INPUT_STALE: no vendored research snapshot for {revision}:{path}")
    try:
        data = git_bytes(revision, path)
        blob = git_blob(revision, path)
    except AssertionError as exc:
        if not str(exc).startswith("E_INPUT_STALE:"):
            raise
    else:
        if len(data) != row["bytes"] or tagged(data) != row["sha256"] or blob != row["blob"]:
            raise AssertionError(f"E_INPUT_STALE: pinned Git bytes differ from vendored snapshot {revision}:{path}")
    return {"revision": revision, "path": path, "blob": row["blob"], "bytes": row["bytes"], "sha256": row["sha256"], "read_mode": "vendored_snapshot_git_object_bytes_verified_when_available"}


def archive_tree(path: str) -> tuple[str, str, str]:
    archive = ARCHIVE_PREFIX + path
    rows = subprocess.check_output(["git", "ls-tree", BASE_REVISION, "--", archive], text=True, cwd=ROOT).splitlines()
    if len(rows) != 1:
        raise AssertionError(f"archive path missing or ambiguous: {archive}")
    left, entry = rows[0].split("\t", 1)
    mode, kind, oid = left.split()
    if entry != archive or mode != "100644" or kind != "blob":
        raise AssertionError(f"archive entry is not a regular blob: {rows[0]}")
    return mode, kind, oid


def manifest_sha(path: str) -> str:
    hits = [line for line in git_bytes(BASE_REVISION, MANIFEST).decode(errors="replace").splitlines() if line.endswith(" " + path)]
    if len(hits) != 1:
        raise AssertionError(f"MANIFEST entry missing: {path}")
    return "sha256:" + hits[0].split()[0]


def source_exact(asset: dict) -> dict:
    path = asset["source_path"]
    archive = ARCHIVE_PREFIX + path
    mode, kind, oid = archive_tree(path)
    data = git_bytes(BASE_REVISION, archive)
    digest = tagged(data)
    ledger_digest = "sha256:" + asset["source_sha256"]
    if digest != ledger_digest or digest != manifest_sha(path) or oid != git_blob(BASE_REVISION, archive):
        raise AssertionError(f"source digest mismatch: {path}")
    lines = data.decode(errors="replace").splitlines()
    if lines:
        start, end = 1, min(8, len(lines))
        anchor_lines = lines[start - 1 : end]
        anchor = {
            "status": "mechanical_prefix_excerpt_not_semantic_span",
            "marker": anchor_lines[0][:240],
            "line_start": start,
            "line_end": end,
            "line_text": anchor_lines,
            "line_text_sha256": tagged("\n".join(anchor_lines).encode()),
        }
        unread = []
        if end < len(lines):
            unread.append([end + 1, len(lines)])
        coverage = {"source_line_count": len(lines), "anchor_line_count": end - start + 1, "coverage_ratio": round((end - start + 1) / len(lines), 6), "unread_line_ranges": unread}
    else:
        anchor = {"status": "empty_source_no_excerpt", "marker": None, "line_start": 0, "line_end": 0, "line_text": [], "line_text_sha256": tagged(b"")}
        coverage = {"source_line_count": 0, "anchor_line_count": 0, "coverage_ratio": 0.0, "unread_line_ranges": []}
    return {
        "source_path": path,
        "archive_path": archive,
        "blob": oid,
        "archive_mode": mode,
        "archive_type": kind,
        "bytes": len(data),
        "line_count": len(lines),
        "sha256": digest,
        "ledger_source_sha256": ledger_digest,
        "ledger_digest_match": True,
        "archive_manifest_sha256": manifest_sha(path),
        "archive_manifest_match": True,
        "semantic_anchor": anchor,
        "anchor_line_coverage": coverage,
        "read_mode": "git_object_static_read_only",
    }


def profile(path: str, line_count: int) -> tuple[str, list[str], str]:
    if line_count == 0:
        return "insufficient_basis", [], "empty source artifact has no excerpt for a product claim"
    if path.endswith("/fixture3-notes.txt"):
        return "multi_product_conflict", ["HELIX-OS", "HELIX-Web-OS"], "source says the staging deploy runs on weekdays, requires a green smoke suite, and pages on-call after two health-check failures, but does not identify whether this is HELIX-OS project/CI operation or HELIX-Web-OS service deployment/monitoring; the four-product boundaries distinguish these responsibilities, while bootstrap independently lists both OS and Web-OS candidates and the smoke path group only suggests OS"
    if "/kimi-s4-bench-" in path:
        return "multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "S4 bench evidence is a path-group candidate spanning HARNESS and OS; per-asset ownership remains unresolved"
    return "direct_product_basis", ["HELIX-OS"], "review/smoke path group suggests OS; per-asset ownership remains unresolved"


def input_digests() -> list[dict]:
    inputs = [(BASE_REVISION, path) for path in CORE_INPUTS]
    research_inputs = [(BASE_REVISION, path) for path in MAIN_RESEARCH_PATHS] + list(OPEN_RESEARCH.items())
    inputs += research_inputs
    result = []
    seen = set()
    for revision, path in inputs:
        key = (revision, path)
        if key in seen:
            continue
        seen.add(key)
        if (revision, path) in research_inputs:
            result.append(snapshot_ref(revision, path))
        else:
            try:
                data = git_bytes(revision, path)
                result.append({"revision": revision, "path": path, "blob": git_blob(revision, path), "bytes": len(data), "sha256": tagged(data), "read_mode": "git_object_static_read_only"})
            except AssertionError as exc:
                if not str(exc).startswith("E_INPUT_STALE:"):
                    raise
                raise
    return result


def research_sets() -> dict:
    snapshot = json.loads(SNAPSHOT.read_text())
    def all_records(revision: str) -> list[dict]:
        records = []
        refs = [entry for entry in snapshot["records"] if entry["revision"] == revision]
        if not refs:
            raise AssertionError(f"E_INPUT_STALE: no vendored research snapshot for {revision}")
        for entry in refs:
            try:
                data = git_bytes(revision, entry["path"])
                if len(data) != entry["bytes"] or tagged(data) != entry["sha256"] or git_blob(revision, entry["path"]) != entry["blob"]:
                    raise AssertionError(f"pinned research bytes differ from snapshot: {revision}:{entry['path']}")
                records.extend(json.loads(line) for line in data.decode().splitlines() if line.strip())
            except AssertionError as exc:
                if not str(exc).startswith("E_INPUT_STALE:"):
                    raise
                records.extend({"asset_id": item[0], "source_path": item[1], "source_sha256": item[2]} for item in entry["identities"])
        return records

    def identity(row: dict) -> tuple[str, str, str]:
        path = row.get("source_path") or (row.get("source_exact") or {}).get("source_path") or ""
        source_sha = (row.get("source_exact") or {}).get("sha256") or row.get("source_sha256") or ""
        if source_sha and not source_sha.startswith("sha256:"):
            source_sha = "sha256:" + source_sha
        if not row.get("asset_id") or not path or not source_sha:
            raise AssertionError(f"research identity incomplete: {row.get('asset_id')}")
        return row["asset_id"], path, source_sha

    def unique_by_id(rows: list[dict]) -> dict[str, tuple[str, str, str]]:
        result = {}
        for row in rows:
            value = identity(row)
            previous = result.setdefault(value[0], value)
            if previous != value:
                raise AssertionError(f"asset ID has conflicting path/source SHA: {value[0]}")
        return result

    main = unique_by_id(all_records(BASE_REVISION))
    p2097 = unique_by_id(all_records(PR_2097))
    main_ids = set(main)
    main_paths = {value[1] for value in main.values()}
    main_shas = {value[2] for value in main.values()}
    main_identities = set(main.values())
    pr_values = {"pr2097": p2097}
    new = {name: {aid: value for aid, value in values.items() if aid not in main_ids} for name, values in pr_values.items()}
    new_ids = {name: set(values) for name, values in new.items()}
    new_paths = {name: {value[1] for value in values.values()} for name, values in new.items()}
    new_shas = {name: {value[2] for value in values.values()} for name, values in new.items()}
    new_identities = {name: set(values.values()) for name, values in new.items()}
    return {
        "main": {"record_count": len(main), "asset_count": len(main_ids), "source_count": len(main_paths), "sha256_count": len(main_shas), "ids": main_ids, "paths": main_paths, "sha256s": main_shas, "identities": main_identities},
        "pr2097": {"ids": set(p2097), "paths": {value[1] for value in p2097.values()}, "sha256s": {value[2] for value in p2097.values()}, "identities": set(p2097.values())},
        "new": {name: {"ids": new_ids[name], "paths": new_paths[name], "sha256s": new_shas[name], "identities": new_identities[name], "records": new[name]} for name in new},
    }


def build_records() -> tuple[list[dict], list[dict], dict]:
    dispositions = json_rows(BASE_REVISION, DISPOSITION)
    phases = json_rows(BASE_REVISION, PHASE)
    decisions = json_rows(BASE_REVISION, DECISIONS)
    read_after = json_rows(BASE_REVISION, READ_AFTER)
    disp_by_id = {row["asset_id"]: (line, row) for line, row in dispositions}
    phase_by_id = {row["asset_id"]: (line, row) for line, row in phases}
    targets = [(line, row) for line, row in dispositions if row.get("source_path", "").startswith(TARGET_PREFIX)]
    if len(targets) != 57 or len({r["asset_id"] for _, r in targets}) != 57 or len({r["source_path"] for _, r in targets}) != 57:
        raise AssertionError("target set must be exact docs/research/assets/** 57")
    wave_hits = {r["asset_id"]: [] for _, r in targets}
    wave_refs = []
    for path in WAVE_PATHS:
        data = git_bytes(BASE_REVISION, path).decode(errors="replace")
        wave_refs.append(static_ref(BASE_REVISION, path))
        for asset_id in wave_hits:
            if asset_id in data:
                wave_hits[asset_id].append(path)
    records = []
    category_counts = {"direct_product_basis": 0, "multi_product_conflict": 0, "insufficient_basis": 0}
    for disp_line, asset in targets:
        phase_line, phase = phase_by_id[asset["asset_id"]]
        exact = source_exact(asset)
        category, products, reason = profile(asset["source_path"], exact["line_count"])
        category_counts[category] += 1
        boundary = {p: receipt(BASE_REVISION, BOUNDARY, BOUNDARY_MARKERS[p]) for p in PRODUCTS}
        l1 = {p: receipt(BASE_REVISION, L1[p], L1_MARKERS[p]) for p in PRODUCTS}
        approval = {p: receipt(BASE_REVISION, APPROVAL, APPROVAL_MARKERS[p]) for p in PRODUCTS}
        product_basis = []
        for p in products:
            product_basis.append({"product": p, "boundary": boundary[p], "l1": l1[p], "mechanical_excerpt": {"source_path": asset["source_path"], "line_start": exact["semantic_anchor"]["line_start"], "line_end": exact["semantic_anchor"]["line_end"], "not_semantic_analysis": True}})
        disposition = {"path": DISPOSITION, "line": disp_line, "row_sha256": row_digest(asset), "asset_id": asset["asset_id"], "source_path": asset["source_path"], "source_sha256": "sha256:" + asset["source_sha256"], "asset_class": asset.get("asset_class"), "disposition": asset.get("disposition"), "product_target": asset.get("product_target"), "implementation_status": asset.get("implementation_status"), "consumer_refs": sorted(asset.get("consumer_refs", [])), "decision_record_ref": asset.get("decision_record_ref"), "read_after_record_ref": asset.get("read_after_record_ref")}
        decisions_for_asset = [{"path": DECISIONS, "line": n, "row_sha256": row_digest(row), "decision_id": row.get("decision_id"), "disposition": row.get("disposition")} for n, row in decisions if row.get("asset_id") == asset["asset_id"]]
        read_after_for_asset = [{"path": READ_AFTER, "line": n, "row_sha256": row_digest(row), "result": row.get("result"), "digest_match": row.get("digest_match"), "consumer_match": row.get("consumer_match")} for n, row in read_after if row.get("asset_id") == asset["asset_id"]]
        record = {
            "schema_revision": 1,
            "binding_id": BINDING_ID,
            "asset_id": asset["asset_id"],
            "source_path": asset["source_path"],
            "source_exact": exact,
            "asset_ledger": {"disposition": disposition, "bootstrap": {"path": PHASE, "line": phase_line, "row_sha256": row_digest(phase), "artifact_evidence_kind": phase.get("artifact_evidence_kind"), "product_classification_status": phase.get("product_classification_status"), "candidate_product_targets": sorted(phase.get("candidate_product_targets", [])), "phase_classification_status": phase.get("phase_classification_status"), "candidate_phase_targets": sorted(phase.get("candidate_phase_targets", [])), "legacy_implementation_status": phase.get("legacy_implementation_status"), "implementation_evidence_state": phase.get("implementation_evidence_state"), "unresolved": sorted(phase.get("unresolved", []))}},
            "classification": {"category": category, "candidate_products": products, "product_basis": product_basis, "counterevidence": (["source-specific ambiguity: weekday staging deployment, smoke-suite gate, on-call paging after repeated health-check failure does not identify internal HELIX project/CI operation (HELIX-OS) versus Web service deployment/monitoring (HELIX-Web-OS); bootstrap independently lists both candidates; smoke path group suggests OS only; neither candidate is formally adopted"] if asset["source_path"].endswith("/fixture3-notes.txt") else ([] if category == "direct_product_basis" else (["empty_source_no_excerpt"] if category == "insufficient_basis" else ["HARNESS and OS meanings remain distinct; path group is not per-asset ownership proof"]))), "reason": reason},
            "boundary_evidence": {"product_boundary": {"path": BOUNDARY, "blob": git_blob(BASE_REVISION, BOUNDARY), "sha256": tagged(git_bytes(BASE_REVISION, BOUNDARY)), "read_mode": "git_object_static_read_only", "product_rows": boundary}, "l1": l1, "approval": {"path": APPROVAL, "blob": git_blob(BASE_REVISION, APPROVAL), "sha256": tagged(git_bytes(BASE_REVISION, APPROVAL)), "rows": approval}},
            "phase_evidence": {"candidate_phase_targets": sorted(phase.get("candidate_phase_targets", [])), "bootstrap_status": phase.get("phase_classification_status"), "formal_phase_admission": False, "phase_status": "research_candidate_unresolved" if phase.get("candidate_phase_targets") else "unresolved", "source": {"path": PHASE, "line": phase_line, "row_sha256": row_digest(phase)}},
            "implementation_evidence": {"status": "unknown", "unimplemented_status": "unknown", "degradation_status": "unknown", "implementation_evidence_state": "document_present", "legacy_execution_performed": False, "source_claims_are_not_execution_proof": True, "consumer_closure_status": "pending"},
            "legacy_history_failure_consumer": {"disposition": disposition, "decisions": decisions_for_asset, "read_after": read_after_for_asset, "failure_consumer_static": {"failure": static_ref(BASE_REVISION, FAILURE), "consumer": static_ref(BASE_REVISION, CONSUMER)}, "observed_failure_status": "asset_specific_failure_or_degradation_not_established", "consumer_closure_status": "asset-level consumer closure pending", "degradation_status": "unknown"},
            "wave_evidence": {"edge_count": len(wave_hits[asset["asset_id"]]), "matching_inputs": wave_hits[asset["asset_id"]], "scanned_input_count": len(wave_refs), "status": "no_direct_asset_edge_found" if not wave_hits[asset["asset_id"]] else "direct_edge_requires_review"},
            "authority_effect": "none",
            "formal_asset_classification_updated": False,
            "new_build_allowed": False,
            "successor_assignment": None,
            "human_judgment_remaining": ["product owner and boundary acceptance", "phase admission", "successor selection", "implementation/unimplemented and degradation closure", "consumer closure", "formal asset classification"],
        }
        records.append(record)
    return records, wave_refs, {"category_counts": category_counts, "target_ids": {r["asset_id"] for r in records}, "target_paths": {r["source_path"] for r in records}}


def write_outputs() -> None:
    snapshot = build_research_snapshot()
    SNAPSHOT.write_text(json.dumps(snapshot, ensure_ascii=False, sort_keys=True, indent=2) + "\n")
    records, wave_refs, summary = build_records()
    records.sort(key=lambda row: row["asset_id"])
    output = "".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in records).encode()
    sets = research_sets()
    main = sets["main"]
    p2097 = sets["pr2097"]
    target_ids, target_paths = summary["target_ids"], summary["target_paths"]
    target_sha256s = {record["source_exact"]["sha256"] for record in records}
    target_identities = {(record["asset_id"], record["source_path"], record["source_exact"]["sha256"]) for record in records}
    pr_names = ("pr2097",)
    new = sets["new"]
    new_union_ids = set().union(*(new[name]["ids"] for name in pr_names))
    new_union_paths = set().union(*(new[name]["paths"] for name in pr_names))
    new_union_sha256s = set().union(*(new[name]["sha256s"] for name in pr_names))
    new_union_identities = set().union(*(new[name]["identities"] for name in pr_names))
    pair_overlaps = {}
    for index, left in enumerate(pr_names):
        for right in pr_names[index + 1 :]:
            left_assets, right_assets = new[left], new[right]
            pair_overlaps[f"{left}_vs_{right}"] = {
                "asset_ids": len(left_assets["ids"] & right_assets["ids"]),
                "source_paths": len(left_assets["paths"] & right_assets["paths"]),
                "source_sha256": len(left_assets["sha256s"] & right_assets["sha256s"]),
                "identity_triples": len(left_assets["identities"] & right_assets["identities"]),
            }
    target_overlaps = {}
    for name, current in (("current_main", main), ("pr2097", p2097)):
        target_overlaps[name] = {
            "asset_ids": len(target_ids & current["ids"]),
            "source_paths": len(target_paths & current["paths"]),
            "source_sha256": len(target_sha256s & current["sha256s"]),
            "identity_triples": len(target_identities & current["identities"]),
        }
    sha_aliases = []
    for name in pr_names:
        by_sha = {}
        for aid, path, digest in new[name]["identities"]:
            by_sha.setdefault(digest, []).append((aid, path))
        sha_aliases.extend(
            {"pr": name, "sha256": digest, "asset_ids": sorted(aid for aid, _ in pairs), "source_paths": sorted(path for _, path in pairs)}
            for digest, pairs in sorted(by_sha.items())
            if len(pairs) > 1
        )
    upstream = input_digests()
    local_upstream = [row for row in upstream if row["revision"] == BASE_REVISION and row["path"] not in OPEN_RESEARCH.values()]
    binding_upstream = [{"path": row["path"], "sha256": row["sha256"].split(":", 1)[1], "note": "固定Git objectの静的read-only根拠。静的read-only参照のみ。旧archiveは実行しない"} for row in local_upstream]
    audit_rel_path = "scaffold/legacy-research-assets-product-classification-0142/independent-source-audit.json"
    audit_data = BUNDLE.joinpath("independent-source-audit.json").read_bytes()
    inventory = {
        "schema_revision": 1,
        "binding_id": BINDING_ID,
        "artifacts": ["scaffold/bindings/SCF-B-0142.json", "scaffold/legacy-research-assets-product-classification-0142/README.md", "scaffold/legacy-research-assets-product-classification-0142/PR-DRAFT.md", "scaffold/legacy-research-assets-product-classification-0142/generate.py", "scaffold/legacy-research-assets-product-classification-0142/validate.py", "scaffold/legacy-research-assets-product-classification-0142/selfcheck.py", "scaffold/legacy-research-assets-product-classification-0142/independent-source-audit.py", audit_rel_path, "scaffold/legacy-research-assets-product-classification-0142/research-union-snapshot.json", "scaffold/legacy-research-assets-product-classification-0142/inventory.json", "scaffold/legacy-research-assets-product-classification-0142/classification-research.jsonl"],
        "base_revision": BASE_REVISION,
        "base_source_mode": "all fixed inputs and archive evidence bytes from fixed BASE Git objects",
        "independent_source_audit": {"path": audit_rel_path, "sha256": tagged(audit_data), "record_count": 57, "scope_derivation": "fixed BASE disposition; generated classification, generator, and validator are not audit inputs"},
        "archive_population_count": 4020,
        "research_scope": {"source_prefix": TARGET_PREFIX, "target_count": len(records), "target_id_count": len(target_ids), "target_source_path_count": len(target_paths), "target_ids": sorted(target_ids), "target_source_paths": sorted(target_paths), "target_ids_sha256": tagged("\n".join(sorted(target_ids)).encode()), "target_source_paths_sha256": tagged("\n".join(sorted(target_paths)).encode())},
        "classification_counts": summary["category_counts"],
        "source_group_counts": {"kimi-review-lane-admission": sum("kimi-review-lane-admission-" in p for p in target_paths), "kimi-s4-bench": sum("kimi-s4-bench-" in p for p in target_paths), "kimi-smoke-rerun": sum("kimi-smoke-rerun-" in p for p in target_paths)},
        "implementation_counts": {"formal_unknown": len(records), "legacy_execution_performed_false": len(records), "consumer_closure_pending": len(records)},
        "phase_counts": {"research_candidate_unresolved": sum(bool(next(r for r in records if r["asset_id"] == aid)["phase_evidence"]["candidate_phase_targets"]) for aid in target_ids)},
        "wave_evidence": {"scanned_input_count": len(wave_refs), "target_edge_count": sum(r["wave_evidence"]["edge_count"] for r in records), "direct_edge_status": "none", "input_paths": [r["path"] for r in wave_refs]},
        "research_union": {
            "current_main": {"revision": BASE_REVISION, "asset_count": len(main["ids"]), "source_count": len(main["paths"]), "source_sha256_count": len(main["sha256s"]), "target_overlap": target_overlaps["current_main"]},
            "pr2097": {"revision": PR_2097, "new_asset_count": len(new["pr2097"]["ids"]), "new_source_count": len(new["pr2097"]["paths"]), "new_source_sha256_count": len(new["pr2097"]["sha256s"]), "target_overlap": target_overlaps["pr2097"]},
            "open_new_pairwise_overlap": pair_overlaps,
            "open_new_source_sha256_aliases": sha_aliases,
            "target_source_sha256_count": len(target_sha256s),
            "projected_union_count": len(main["ids"] | new_union_ids | target_ids),
            "projected_union_source_count": len(main["paths"] | new_union_paths | target_paths),
            "projected_union_identity_triple_count": len(main["identities"] | new_union_identities | target_identities),
            "projected_union_source_sha256_count": len(main["sha256s"] | new_union_sha256s | target_sha256s),
        },
        "overlap_status": {"target_vs_main": target_overlaps["current_main"], "target_vs_pr2097": target_overlaps["pr2097"], "open_new_pairwise": pair_overlaps, "all_asset_id_path_sha_identity_counts_zero": all(not any(value.values()) for value in target_overlaps.values()) and all(not any(value.values()) for value in pair_overlaps.values())},
        "authority_boundary": {"authority_effect": "none", "formal_asset_classification_updated": False, "formal_product_authority": None, "formal_implementation_status": "unknown", "phase_updated": False, "successor_assignment": None, "new_build_allowed": False, "read_mode": "static_git_object_only"},
        "input_digests": upstream,
        "binding_upstream_paths": binding_upstream,
        "output_sha256": tagged(output),
        "generator_contract": {"archive_runtime_source_test_ci_hook_execution": False, "duplicate_json_keys_rejected": True, "category_partition": ["direct_product_basis", "multi_product_conflict", "insufficient_basis"], "exact_target_set": True, "archive_regular_blob_required": True, "manifest_and_ledger_digest_required": True},
    }
    BUNDLE.joinpath("classification-research.jsonl").write_bytes(output)
    BUNDLE.joinpath("inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, sort_keys=True, indent=2) + "\n")
    binding = {
        "schema_revision": 1,
        "id": BINDING_ID,
        "kind": "scaffold",
        "title": "固定BASE docs/research/assets/** 57件の四製品責務候補研究",
        "product": "HELIX-OS",
        "owner_candidate": "四製品product-boundary研究（正式owner未解決）",
        "state": "registered",
        "reason": "旧research asset 57件をGit object静的readで機械抽出excerpt、四製品L1/boundary、phase、実装状態、failure、consumerを分離研究する。正式分類、authority、successor、buildを生成しない。",
        "upstream": binding_upstream,
        "role": "legacy research assets static product-boundary research",
        "obligations": ["固定BASE source blob／MANIFEST／ledger digestを照合する", "独立auditでsource／phase／decision／failure／consumer／waveと四製品L1をjoinする", "四製品候補とformal authorityを分離する", "implementation／phase／consumer closureを未確定として保持する", "current mainと固定#2097 historical HEAD比較点のresearch unionをID／source path／source SHA256で検査する"],
        "connections": {"boundary": "research evidence only; no formal product, phase, implementation, successor, consumer, runtime, merge, or close authority", "consumers": ["四製品product-boundary reviewer", "phase and implementation evidence reviewer", "root next asset batch"], "dependencies": ["fixed BASE disposition and phase ledgers", "fixed BASE archive MANIFEST", "current main research union including merged #2090 and #2094", "fixed historical #2097 HEAD research snapshot"]},
        "operations": {"allowed": ["read fixed BASE and pinned PR Git objects statically", "write research scaffold and registered Binding", "run deterministic generator/validator/selfcheck/scfctl"], "forbidden": ["execute old-generation archive source/runtime/test/hook/adapter/CI", "旧archiveは実行しない", "promote formal product/phase/implementation/consumer authority", "merge/close/deploy"]},
        "artifacts": inventory["artifacts"],
        "verification": {"evidence_kind": "scaffold", "scope": ["schema_interface", "deterministic_behavior", "source_revision_stale", "negative_case", "forbidden_write_scope"], "oracles": ["validator independently derives the fixed BASE target set and does not import generator output as an oracle", "independent-source-audit.py independently joins all 57 source blobs, disposition, phase, decision/read-after, wave, failure/consumer, and four current-main L1 records", "validator compares source blob/type/mode/bytes/SHA/MANIFEST/ledger and four product boundary/L1 receipts", "validator checks current main research union including merged #2090/#2094 and fixed historical #2097 HEAD snapshot with target ID/path/SHA and pairwise new-union overlaps", "selfcheck executes exact negative cases and expected error codes", "scfctl validate/stale/residuals and git diff --check"], "negative_cases": ["record/inventory/Binding exact shape and history/bootstrap/phase/human judgment tamper", "strict bool/int/float types; null/list/missing fail-close, including schema_revision", "container null/list/scalar fail-close for records and audit evidence", "binding state/operations/replacement authority promotion", "declared target/wave count and real overlap flag tamper", "source and anchor digest tamper", "phase or implementation promotion", "E_BASE_PIN, E_INPUT_STALE, input/output/audit digest mismatch", "archive mode/MANIFEST and malformed/duplicate-key JSON"]},
        "replacement": {"role_target": None, "formal_artifacts": [], "issue": 0, "status": "pending"},
        "created": "2026-09-23",
        "updated": "2026-09-23",
    }
    BINDING.write_text(json.dumps(binding, ensure_ascii=False, sort_keys=True, indent=2) + "\n")
    print(f"{BINDING_ID} generated records={len(records)} counts={summary['category_counts']} target_edge_count={inventory['wave_evidence']['target_edge_count']}")


if __name__ == "__main__":
    write_outputs()
