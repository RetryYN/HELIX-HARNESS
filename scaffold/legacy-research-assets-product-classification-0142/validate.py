#!/usr/bin/env python3
"""Fail-closed validator for SCF-B-0142; archive files are read as Git objects only."""
from __future__ import annotations

import hashlib
import json
import subprocess
from functools import lru_cache
from pathlib import Path

BUNDLE = Path(__file__).resolve().parent
LEDGER = BUNDLE / "classification-research.jsonl"
INVENTORY = BUNDLE / "inventory.json"
BINDING = BUNDLE.parent / "bindings/SCF-B-0142.json"
AUDIT = BUNDLE / "independent-source-audit.json"
BASE_REVISION = "7afee33ae892fe1a3cf1085fac4e02d923ece01d"
PR_2090 = "f075c91c03e8ebff5e9c30c8a6974a6e9389b40e"
PR_2094 = "e5fc691c33f182f036048904b699e448795c2e20"
BINDING_ID = "SCF-B-0142"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
MANIFEST = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
BOUNDARY = "docs/concept/product-boundary.md"
APPROVAL = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
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
L1_MARKERS = {"HELIX-HARNESS": "| HARNESS-L1-004 |", "HELIX-OS": "| HELIXOS-L1-003 |", "HELIX-Web": "| HELIXWEB-L1-001 |", "HELIX-Web-OS": "| HELIXWEBOS-L1-002 |"}
BOUNDARY_MARKERS = {"HELIX-HARNESS": "| HARNESS |", "HELIX-OS": "| HELIX-OS |", "HELIX-Web": "| HELIX-Web |", "HELIX-Web-OS": "| HELIX-Web-OS |"}
APPROVAL_MARKERS = {"HELIX-HARNESS": "| `HDEC-HARNESS-L1-01` |", "HELIX-OS": "| `HDEC-HELIXOS-L1-01` |", "HELIX-Web": "| `HDEC-HELIXWEB-L1-01` |", "HELIX-Web-OS": "| `HDEC-HELIXWEBOS-L1-01` |"}
WAVE_PATHS = tuple(f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl" if n <= 36 else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl" for n in range(1, 51))
MAIN_RESEARCH_PATHS = tuple(sorted(p for p in subprocess.check_output(["git", "ls-tree", "-r", "--name-only", BASE_REVISION], text=True).splitlines() if p.startswith("scaffold/") and p.endswith("/classification-research.jsonl")))
OPEN_RESEARCH = {PR_2090: "scaffold/legacy-config-product-classification-0141/classification-research.jsonl", PR_2094: "scaffold/legacy-ai-instruction-product-classification-0145/classification-research.jsonl"}
CORE_INPUTS = (DISPOSITION, PHASE, DECISIONS, READ_AFTER, BOUNDARY, *L1.values(), APPROVAL, "docs/governance/new-generation-start-here.md", "docs/governance/legacy-asset-reuse-control.md", FAILURE, CONSUMER, MANIFEST, *WAVE_PATHS)
EXPECTED_NEGATIVE_CASES = ("target_omission", "target_duplicate", "source_sha_tamper", "source_anchor_tamper", "empty_source_reclassified", "phase_admission", "implementation_promotion", "history_digest_tamper", "boundary_digest_tamper", "wave_edge_injection", "authority_promotion", "overlap_tamper", "input_omission", "input_stale", "binding_omission", "output_digest_tamper", "independent_audit_digest_tamper", "archive_symlink_mode", "archive_manifest_mismatch", "malformed_json", "duplicate_json_key")


def fail(code: str, message: str) -> None:
    raise AssertionError(f"{code}: {message}")


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def canonical(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def row_digest(value: object) -> str:
    return tagged(canonical(value))


def strict_pairs(pairs: list[tuple[str, object]]) -> dict:
    out = {}
    for key, value in pairs:
        if key in out:
            fail("E_JSON", f"duplicate key {key}")
        out[key] = value
    return out


def local_json(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(), object_pairs_hook=strict_pairs)
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        fail("E_JSON", f"{path}: {exc}")
    if not isinstance(value, dict):
        fail("E_JSON", f"object required: {path}")
    return value


def local_jsonl(path: Path) -> list[dict]:
    rows = []
    try:
        lines = path.read_text().splitlines()
    except OSError as exc:
        fail("E_JSON", f"{path}: {exc}")
    for number, line in enumerate(lines, 1):
        if not line.strip():
            continue
        try:
            value = json.loads(line, object_pairs_hook=strict_pairs)
        except (json.JSONDecodeError, ValueError) as exc:
            fail("E_JSON", f"{path}:{number}: {exc}")
        if not isinstance(value, dict):
            fail("E_JSON", f"object required: {path}:{number}")
        rows.append(value)
    return rows


@lru_cache(maxsize=None)
def git_bytes(revision: str, path: str) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{revision}:{path}"])
    except subprocess.CalledProcessError:
        fail("E_INPUT", f"missing {revision}:{path}")


@lru_cache(maxsize=None)
def git_blob(revision: str, path: str) -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", f"{revision}:{path}"], text=True).strip()
    except subprocess.CalledProcessError:
        fail("E_INPUT", f"missing blob {revision}:{path}")


def rows(revision: str, path: str) -> list[tuple[int, dict]]:
    result = []
    for number, line in enumerate(git_bytes(revision, path).decode(errors="replace").splitlines(), 1):
        if line.strip():
            value = json.loads(line, object_pairs_hook=strict_pairs)
            if not isinstance(value, dict):
                fail("E_INPUT", f"object required {path}:{number}")
            result.append((number, value))
    return result


def expected_receipt(revision: str, path: str, marker: str) -> dict:
    data = git_bytes(revision, path)
    for number, line in enumerate(data.decode(errors="replace").splitlines(), 1):
        if marker in line:
            return {"path": path, "blob": git_blob(revision, path), "sha256": tagged(data), "line_start": number, "line_end": number, "line_text": [line], "line_text_sha256": tagged(line.encode()), "marker": marker, "read_mode": "git_object_static_read_only"}
    fail("E_BOUNDARY_ANCHOR", f"marker not found {path}:{marker}")


def static_ref(revision: str, path: str) -> dict:
    data = git_bytes(revision, path)
    return {"revision": revision, "path": path, "blob": git_blob(revision, path), "bytes": len(data), "sha256": tagged(data), "read_mode": "git_object_static_read_only"}


def archive_tree(path: str) -> tuple[str, str, str]:
    archive = ARCHIVE_PREFIX + path
    try:
        result = subprocess.check_output(["git", "ls-tree", BASE_REVISION, "--", archive], text=True).splitlines()
    except subprocess.CalledProcessError:
        fail("E_ARCHIVE_STATIC", archive)
    if len(result) != 1:
        fail("E_ARCHIVE_STATIC", f"missing/ambiguous {archive}")
    left, entry = result[0].split("\t", 1)
    mode, kind, oid = left.split()
    if entry != archive or mode != "100644" or kind != "blob":
        fail("E_ARCHIVE_STATIC", result[0])
    return mode, kind, oid


def manifest_sha(path: str) -> str:
    hits = [line for line in git_bytes(BASE_REVISION, MANIFEST).decode(errors="replace").splitlines() if line.endswith(" " + path)]
    if len(hits) != 1:
        fail("E_ARCHIVE_STATIC", f"MANIFEST entry {path}")
    return "sha256:" + hits[0].split()[0]


def profile(path: str, line_count: int) -> tuple[str, list[str], str]:
    if line_count == 0:
        return "insufficient_basis", [], "empty source artifact has no semantic span for a product claim"
    if "/kimi-s4-bench-" in path:
        return "multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "S4 bench evidence spans HARNESS verification contract and OS worker execution control"
    return "direct_product_basis", ["HELIX-OS"], "review/smoke lane evidence concerns worker admission, provider activity, and runtime evidence under OS control"


def source_path(row: dict) -> str:
    return row.get("source_path") or (row.get("source_exact") or {}).get("source_path") or ""


def all_research_records(revision: str) -> list[dict]:
    paths = [p for p in subprocess.check_output(["git", "ls-tree", "-r", "--name-only", revision], text=True).splitlines() if p.startswith("scaffold/") and p.endswith("/classification-research.jsonl")]
    result = []
    for path in paths:
        result += [json.loads(line) for line in git_bytes(revision, path).decode().splitlines() if line.strip()]
    return result


@lru_cache(maxsize=1)
def research_sets() -> dict:
    def source_sha(row: dict) -> str:
        value = (row.get("source_exact") or {}).get("sha256") or row.get("source_sha256") or ""
        if value and not value.startswith("sha256:"):
            value = "sha256:" + value
        return value

    def normalized(revision: str) -> dict[str, tuple[str, str, str]]:
        result = {}
        for row in all_research_records(revision):
            identity = (row.get("asset_id", ""), source_path(row), source_sha(row))
            if not all(identity):
                fail("E_OVERLAP", f"incomplete research identity at {revision}:{identity[0]}")
            old = result.setdefault(identity[0], identity)
            if old != identity:
                fail("E_OVERLAP", f"conflicting research identity at {revision}:{identity[0]}")
        return result

    main = normalized(BASE_REVISION)
    prs = {
        "pr2090": normalized(PR_2090),
        "pr2094": normalized(PR_2094),
    }
    main_ids = set(main)
    new = {name: {aid: value for aid, value in values.items() if aid not in main_ids} for name, values in prs.items()}

    def sets(values: dict[str, tuple[str, str, str]]) -> dict:
        return {
            "ids": set(values),
            "paths": {value[1] for value in values.values()},
            "sha256s": {value[2] for value in values.values()},
            "identities": set(values.values()),
            "records": values,
        }

    return {"main": sets(main), **{name: sets(values) for name, values in prs.items()}, "new": {name: sets(values) for name, values in new.items()}}


@lru_cache(maxsize=1)
def expected_inputs() -> list[dict]:
    entries = [(BASE_REVISION, path) for path in CORE_INPUTS] + [(BASE_REVISION, path) for path in MAIN_RESEARCH_PATHS] + list(OPEN_RESEARCH.items())
    result = []
    seen = set()
    for revision, path in entries:
        if (revision, path) in seen:
            continue
        seen.add((revision, path))
        result.append(static_ref(revision, path))
    return result


def verify_source(record: dict, asset: dict) -> None:
    path = record.get("source_path")
    if path != asset.get("source_path"):
        fail("E_TARGET_SET", f"source path mismatch {record.get('asset_id')}")
    exact = record.get("source_exact")
    if not isinstance(exact, dict):
        fail("E_SOURCE", path)
    archive = ARCHIVE_PREFIX + path
    mode, kind, oid = archive_tree(path)
    if mode != "100644" or kind != "blob":
        fail("E_ARCHIVE_STATIC", path)
    data = git_bytes(BASE_REVISION, archive)
    lines = data.decode(errors="replace").splitlines()
    expected_manifest = manifest_sha(path)
    if exact.get("archive_manifest_sha256") != expected_manifest:
        fail("E_ARCHIVE_STATIC", path)
    if exact.get("source_path") != path or exact.get("archive_path") != archive or exact.get("blob") != oid or exact.get("archive_mode") != mode or exact.get("archive_type") != kind or exact.get("bytes") != len(data) or exact.get("line_count") != len(lines) or exact.get("sha256") != tagged(data) or exact.get("ledger_source_sha256") != "sha256:" + asset["source_sha256"] or exact.get("ledger_digest_match") is not True or exact.get("archive_manifest_match") is not True or exact.get("read_mode") != "git_object_static_read_only":
        fail("E_SOURCE", path)
    anchor = exact.get("semantic_anchor", {})
    expected_category, expected_products, expected_reason = profile(path, len(lines))
    if lines:
        expected_start, expected_end, expected_lines = 1, min(8, len(lines)), lines[: min(8, len(lines))]
        expected_anchor_status = "static_semantic_span"
        expected_unread = [[expected_end + 1, len(lines)]] if expected_end < len(lines) else []
        expected_coverage = round((expected_end - expected_start + 1) / len(lines), 6)
    else:
        expected_start = expected_end = 0; expected_lines = []; expected_anchor_status = "empty_source_no_semantic_span"; expected_unread = []; expected_coverage = 0.0
    if anchor.get("status") != expected_anchor_status or anchor.get("line_start") != expected_start or anchor.get("line_end") != expected_end or anchor.get("line_text") != expected_lines or anchor.get("line_text_sha256") != tagged("\n".join(expected_lines).encode()) or exact.get("anchor_line_coverage") != {"source_line_count": len(lines), "anchor_line_count": expected_end - expected_start + 1 if lines else 0, "coverage_ratio": expected_coverage, "unread_line_ranges": expected_unread}:
        fail("E_SOURCE", f"semantic anchor {path}")
    classification = record.get("classification", {})
    if classification.get("category") != expected_category or classification.get("candidate_products") != expected_products or classification.get("reason") != expected_reason:
        fail("E_CLASSIFICATION", path)
    expected_counter = [] if expected_category == "direct_product_basis" else (["empty_source_no_semantic_span"] if expected_category == "insufficient_basis" else ["HARNESS verification meaning and OS execution meaning remain distinct"])
    if classification.get("counterevidence") != expected_counter:
        fail("E_CLASSIFICATION", f"counterevidence {path}")


def verify() -> None:
    inventory = local_json(INVENTORY)
    binding = local_json(BINDING)
    records = local_jsonl(LEDGER)
    disposition_rows = rows(BASE_REVISION, DISPOSITION)
    phase_rows = rows(BASE_REVISION, PHASE)
    decisions = rows(BASE_REVISION, DECISIONS)
    read_after = rows(BASE_REVISION, READ_AFTER)
    disp_by_id = {r["asset_id"]: (n, r) for n, r in disposition_rows}
    phase_by_id = {r["asset_id"]: (n, r) for n, r in phase_rows}
    targets = {r["asset_id"]: r for _, r in disposition_rows if r.get("source_path", "").startswith(TARGET_PREFIX)}
    if len(targets) != 57:
        fail("E_TARGET_SET", f"BASE target count {len(targets)}")
    ids = [r.get("asset_id") for r in records]
    paths = [r.get("source_path") for r in records]
    if len(records) != 57 or set(ids) != set(targets) or len(set(ids)) != 57 or set(paths) != {a["source_path"] for a in targets.values()} or len(set(paths)) != 57:
        fail("E_TARGET_SET", "exact target IDs/source paths required")
    audit = local_json(AUDIT)
    audit_rel_path = "scaffold/legacy-research-assets-product-classification-0142/independent-source-audit.json"
    audit_ref = inventory.get("independent_source_audit", {})
    if audit_ref != {"path": audit_rel_path, "sha256": tagged(AUDIT.read_bytes()), "record_count": 57, "scope_derivation": "fixed BASE disposition; generated classification, generator, and validator are not audit inputs"}:
        fail("E_INDEPENDENT_AUDIT", "audit output digest or provenance")
    audit_rows = audit.get("records", [])
    audit_by_id = {row.get("asset_id"): row for row in audit_rows}
    if (
        audit.get("base_revision") != BASE_REVISION
        or audit.get("audit_kind") != "independent_static_source_and_registry_join"
        or audit.get("derivation", {}).get("generated_classification_read") is not False
        or audit.get("derivation", {}).get("generator_or_validator_imported") is not False
        or audit.get("scope", {}).get("record_count") != 57
        or audit.get("scope", {}).get("unique_asset_ids") != 57
        or audit.get("scope", {}).get("unique_source_paths") != 57
        or len(audit_rows) != 57
        or set(audit_by_id) != set(targets)
    ):
        fail("E_INDEPENDENT_AUDIT", "independent target derivation")
    for asset_id, asset in targets.items():
        audited = audit_by_id[asset_id]
        if audited.get("source_path") != asset.get("source_path") or audited.get("source", {}).get("sha256") != "sha256:" + asset.get("source_sha256", "") or audited.get("source", {}).get("ledger_sha256") != "sha256:" + asset.get("source_sha256", "") or audited.get("source", {}).get("mode") != "100644" or audited.get("source", {}).get("type") != "blob" or audited.get("source", {}).get("all_three_sha_match") is not True or audited.get("source", {}).get("static_read_only") is not True:
            fail("E_INDEPENDENT_AUDIT", f"source/ledger record {asset_id}")
    audit_join = audit.get("registry_join", {})
    if (
        audit.get("source_totals", {}).get("bytes") != 58243
        or audit.get("source_totals", {}).get("lines") != 1181
        or audit.get("source_totals", {}).get("empty_source_count") != 5
        or audit_join.get("target_specific_decision_rows") != 0
        or audit_join.get("target_specific_read_after_rows") != 0
        or audit_join.get("target_id_wave_hits") != 0
        or audit_join.get("target_path_wave_hits") != 0
        or audit_join.get("candidate_product_anomalies") != [{"asset_id": "LEGACY-ASSET-F3000D26921558AA2E0C", "source_path": "docs/research/assets/kimi-smoke-rerun-2026-08-08/bench/prompts/fixture3-notes.txt", "candidate_products": ["HELIX-OS", "HELIX-Web-OS"], "candidate_phase_targets": ["PHCAP-15"], "note": "bootstrap candidates name HELIX-OS and HELIX-Web-OS; the bundle path-group heuristic alone would place this smoke fixture in the OS candidate set"}]
    ):
        fail("E_INDEPENDENT_AUDIT", "source and registry join summary")
    def audit_marker_matches(actual: dict, path: str, marker: str) -> bool:
        expected = expected_receipt(BASE_REVISION, path, marker)
        return actual == {
            "path": expected["path"],
            "blob": expected["blob"],
            "sha256": expected["sha256"],
            "line": expected["line_start"],
            "line_text": expected["line_text"][0],
            "line_text_sha256": expected["line_text_sha256"],
            "marker": expected["marker"],
        }
    audited_boundary = audit.get("four_product_current_main_evidence", {})
    if audited_boundary.get("product_boundary", {}).get("sha256") != tagged(git_bytes(BASE_REVISION, BOUNDARY)) or audited_boundary.get("approval_decision", {}).get("sha256") != tagged(git_bytes(BASE_REVISION, APPROVAL)):
        fail("E_INDEPENDENT_AUDIT", "boundary or approval source pin")
    for product in PRODUCTS:
        l1_actual = dict(audited_boundary.get("l1_documents", {}).get(product, {}))
        l1_actual.pop("product", None)
        if (
            not audit_marker_matches(audited_boundary.get("product_boundary", {}).get("rows", {}).get(product, {}), BOUNDARY, BOUNDARY_MARKERS[product])
            or not audit_marker_matches(audited_boundary.get("approval_decision", {}).get("rows", {}).get(product, {}), APPROVAL, APPROVAL_MARKERS[product])
            or not audit_marker_matches(l1_actual, L1[product], L1_MARKERS[product])
            or audited_boundary.get("l1_documents", {}).get(product, {}).get("product") != product
        ):
            fail("E_INDEPENDENT_AUDIT", f"four-product evidence {product}")
    expected_categories = {"direct_product_basis": 0, "multi_product_conflict": 0, "insufficient_basis": 0}
    for record in records:
        asset_id = record.get("asset_id")
        asset = targets.get(asset_id)
        if asset is None or record.get("binding_id") != BINDING_ID or record.get("schema_revision") != 1:
            fail("E_TARGET_SET", str(asset_id))
        verify_source(record, asset)
        category = record["classification"]["category"]
        expected_categories[category] += 1
        if record.get("authority_effect") != "none" or record.get("formal_asset_classification_updated") is not False or record.get("new_build_allowed") is not False or record.get("successor_assignment") is not None:
            fail("E_AUTHORITY", asset_id)
        if record.get("implementation_evidence") != {"status": "unknown", "unimplemented_status": "unknown", "degradation_status": "unknown", "implementation_evidence_state": "document_present", "legacy_execution_performed": False, "source_claims_are_not_execution_proof": True, "consumer_closure_status": "pending"}:
            fail("E_IMPLEMENTATION", asset_id)
        p_line, phase = phase_by_id[asset_id]
        if record["phase_evidence"].get("formal_phase_admission") is not False or record["phase_evidence"].get("source") != {"path": PHASE, "line": p_line, "row_sha256": row_digest(phase)}:
            fail("E_PHASE", asset_id)
        if record["phase_evidence"].get("candidate_phase_targets") != sorted(phase.get("candidate_phase_targets", [])) or record["phase_evidence"].get("bootstrap_status") != phase.get("phase_classification_status"):
            fail("E_PHASE", asset_id)
        boundary = record.get("boundary_evidence", {})
        if boundary.get("product_boundary", {}).get("path") != BOUNDARY or boundary.get("product_boundary", {}).get("blob") != git_blob(BASE_REVISION, BOUNDARY) or boundary.get("product_boundary", {}).get("sha256") != tagged(git_bytes(BASE_REVISION, BOUNDARY)) or boundary.get("product_boundary", {}).get("read_mode") != "git_object_static_read_only":
            fail("E_BOUNDARY_ANCHOR", asset_id)
        for p in PRODUCTS:
            if boundary.get("product_boundary", {}).get("product_rows", {}).get(p) != expected_receipt(BASE_REVISION, BOUNDARY, BOUNDARY_MARKERS[p]) or boundary.get("l1", {}).get(p) != expected_receipt(BASE_REVISION, L1[p], L1_MARKERS[p]) or boundary.get("approval", {}).get("rows", {}).get(p) != expected_receipt(BASE_REVISION, APPROVAL, APPROVAL_MARKERS[p]):
                fail("E_BOUNDARY_ANCHOR", f"{asset_id}:{p}")
        disp_line, disp = disp_by_id[asset_id]
        expected_disp = {"path": DISPOSITION, "line": disp_line, "row_sha256": row_digest(disp), "asset_id": asset_id, "source_path": disp["source_path"], "source_sha256": "sha256:" + disp["source_sha256"], "asset_class": disp.get("asset_class"), "disposition": disp.get("disposition"), "product_target": disp.get("product_target"), "implementation_status": disp.get("implementation_status"), "consumer_refs": sorted(disp.get("consumer_refs", [])), "decision_record_ref": disp.get("decision_record_ref"), "read_after_record_ref": disp.get("read_after_record_ref")}
        if record["asset_ledger"].get("disposition") != expected_disp:
            fail("E_LEDGER", asset_id)
        if record.get("wave_evidence") != {"edge_count": 0, "matching_inputs": [], "scanned_input_count": 50, "status": "no_direct_asset_edge_found"}:
            fail("E_WAVE", asset_id)
        expected_failure = static_ref(BASE_REVISION, FAILURE); expected_consumer = static_ref(BASE_REVISION, CONSUMER)
        history = record.get("legacy_history_failure_consumer", {})
        if history.get("failure_consumer_static", {}).get("failure") != expected_failure or history.get("failure_consumer_static", {}).get("consumer") != expected_consumer or history.get("consumer_closure_status") != "asset-level consumer closure pending":
            fail("E_HISTORY_CONSUMER", asset_id)
        expected_decisions = [{"path": DECISIONS, "line": n, "row_sha256": row_digest(row), "decision_id": row.get("decision_id"), "disposition": row.get("disposition")} for n, row in decisions if row.get("asset_id") == asset_id]
        expected_read_after = [{"path": READ_AFTER, "line": n, "row_sha256": row_digest(row), "result": row.get("result"), "digest_match": row.get("digest_match"), "consumer_match": row.get("consumer_match")} for n, row in read_after if row.get("asset_id") == asset_id]
        if history.get("decisions") != expected_decisions or history.get("read_after") != expected_read_after:
            fail("E_HISTORY_CONSUMER", asset_id)
        for link in record["classification"].get("product_basis", []):
            p = link.get("product")
            if p not in record["classification"]["candidate_products"] or link.get("boundary") != boundary["product_boundary"]["product_rows"][p] or link.get("l1") != boundary["l1"][p]:
                fail("E_CLASSIFICATION", asset_id)
        expected_basis = [{"product": p, "boundary": boundary["product_boundary"]["product_rows"][p], "l1": boundary["l1"][p], "semantic_span": {"source_path": record["source_path"], "line_start": record["source_exact"]["semantic_anchor"]["line_start"], "line_end": record["source_exact"]["semantic_anchor"]["line_end"]}} for p in record["classification"]["candidate_products"]]
        if record["classification"].get("product_basis") != expected_basis:
            fail("E_CLASSIFICATION", f"basis {asset_id}")
    if expected_categories != inventory.get("classification_counts"):
        fail("E_CATEGORY_PARTITION", "classification counts")
    if inventory.get("base_revision") != BASE_REVISION or inventory.get("archive_population_count") != 4020 or inventory.get("binding_id") != BINDING_ID:
        fail("E_BASE_PIN", "inventory pin")
    scope = inventory.get("research_scope", {})
    if scope.get("target_count") != 57 or scope.get("target_ids") != sorted(ids) or scope.get("target_source_paths") != sorted(paths) or scope.get("target_ids_sha256") != tagged("\n".join(sorted(ids)).encode()) or scope.get("target_source_paths_sha256") != tagged("\n".join(sorted(paths)).encode()):
        fail("E_TARGET_SET", "inventory scope")
    sets = research_sets()
    target_ids, target_paths = set(ids), set(paths)
    main, p2090, p2094 = sets["main"], sets["pr2090"], sets["pr2094"]
    target_sha256s = {record["source_exact"]["sha256"] for record in records}
    target_identities = {(record["asset_id"], record["source_path"], record["source_exact"]["sha256"]) for record in records}
    target_overlaps = {}
    for name, current in (("current_main", main), ("pr2090", p2090), ("pr2094", p2094)):
        target_overlaps[name] = {
            "asset_ids": len(target_ids & current["ids"]),
            "source_paths": len(target_paths & current["paths"]),
            "source_sha256": len(target_sha256s & current["sha256s"]),
            "identity_triples": len(target_identities & current["identities"]),
        }
    pr_names = ("pr2090", "pr2094")
    new = sets["new"]
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
    new_union_ids = set().union(*(new[name]["ids"] for name in pr_names))
    new_union_paths = set().union(*(new[name]["paths"] for name in pr_names))
    new_union_sha256s = set().union(*(new[name]["sha256s"] for name in pr_names))
    new_union_identities = set().union(*(new[name]["identities"] for name in pr_names))
    expected_union = {
        "current_main": {"revision": BASE_REVISION, "asset_count": len(main["ids"]), "source_count": len(main["paths"]), "source_sha256_count": len(main["sha256s"]), "target_overlap": target_overlaps["current_main"]},
        "pr2090": {"revision": PR_2090, "new_asset_count": len(new["pr2090"]["ids"]), "new_source_count": len(new["pr2090"]["paths"]), "new_source_sha256_count": len(new["pr2090"]["sha256s"]), "target_overlap": target_overlaps["pr2090"]},
        "pr2094": {"revision": PR_2094, "new_asset_count": len(new["pr2094"]["ids"]), "new_source_count": len(new["pr2094"]["paths"]), "new_source_sha256_count": len(new["pr2094"]["sha256s"]), "target_overlap": target_overlaps["pr2094"]},
        "open_new_pairwise_overlap": pair_overlaps,
        "open_new_source_sha256_aliases": sha_aliases,
        "target_source_sha256_count": len(target_sha256s),
        "projected_union_count": len(main["ids"] | new_union_ids | target_ids),
        "projected_union_source_count": len(main["paths"] | new_union_paths | target_paths),
        "projected_union_identity_triple_count": len(main["identities"] | new_union_identities | target_identities),
        "projected_union_source_sha256_count": len(main["sha256s"] | new_union_sha256s | target_sha256s),
    }
    expected_overlap_status = {"target_vs_main": target_overlaps["current_main"], "target_vs_pr2090": target_overlaps["pr2090"], "target_vs_pr2094": target_overlaps["pr2094"], "open_new_pairwise": pair_overlaps, "all_asset_id_path_sha_identity_counts_zero": all(not any(value.values()) for value in target_overlaps.values()) and all(not any(value.values()) for value in pair_overlaps.values())}
    if not expected_overlap_status["all_asset_id_path_sha_identity_counts_zero"]:
        fail("E_OVERLAP", "target or pairwise open-PR identity overlap")
    if inventory.get("research_union") != expected_union:
        fail("E_RESEARCH_UNION", "ID/path/SHA union counts")
    if inventory.get("overlap_status") != expected_overlap_status:
        fail("E_OVERLAP", "inventory overlap")
    expected_input_rows = expected_inputs()
    if inventory.get("input_digests") != expected_input_rows:
        fail("E_INPUT_DIGEST", "input set/digest")
    expected_binding_upstream = [{"path": row["path"], "sha256": row["sha256"].split(":", 1)[1], "note": "固定Git objectの静的read-only根拠。静的read-only参照のみ。旧archiveは実行しない"} for row in expected_input_rows if row["revision"] == BASE_REVISION and row["path"] not in OPEN_RESEARCH.values()]
    if inventory.get("binding_upstream_paths") != expected_binding_upstream or binding.get("upstream") != expected_binding_upstream:
        fail("E_BINDING_CLOSURE", "upstream closure")
    if binding.get("id") != BINDING_ID or binding.get("kind") != "scaffold" or inventory.get("authority_boundary") != {"authority_effect": "none", "formal_asset_classification_updated": False, "formal_product_authority": None, "formal_implementation_status": "unknown", "phase_updated": False, "successor_assignment": None, "new_build_allowed": False, "read_mode": "static_git_object_only"}:
        fail("E_AUTHORITY", "binding/inventory boundary")
    output = LEDGER.read_bytes()
    if inventory.get("output_sha256") != tagged(output):
        fail("E_OUTPUT_DIGEST", "classification output")
    print(f"{BINDING_ID} validate PASS records={len(records)} counts={expected_categories} target_edge_count=0")


if __name__ == "__main__":
    verify()
