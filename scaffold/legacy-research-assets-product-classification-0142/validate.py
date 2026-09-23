#!/usr/bin/env python3
"""Fail-closed validator for SCF-B-0142; archive files are read as Git objects only."""
from __future__ import annotations

import hashlib
import json
import subprocess
from functools import lru_cache
from pathlib import Path

BUNDLE = Path(__file__).resolve().parent
ROOT = BUNDLE.parents[1]
LEDGER = BUNDLE / "classification-research.jsonl"
INVENTORY = BUNDLE / "inventory.json"
BINDING = BUNDLE.parent / "bindings/SCF-B-0142.json"
AUDIT = BUNDLE / "independent-source-audit.json"
SNAPSHOT = BUNDLE / "research-union-snapshot.json"
BASE_REVISION = "a577a7cddd1405de27bf01d22b050eb2acaa9ba9"
PR_2097 = "d233e6e99f705439043a07f0a96bdd9e535a288a"
SNAPSHOT_SHA256 = "sha256:4ad0a0d393ed8e0d334354fe0449ad167a3762251f709e969e30e3e5fdaaece9"
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
def git_names(revision: str) -> list[str]:
    try:
        return subprocess.check_output(["git", "ls-tree", "-r", "--name-only", revision], text=True, cwd=ROOT).splitlines()
    except subprocess.CalledProcessError:
        return []


MAIN_RESEARCH_PATHS = tuple(sorted(p for p in git_names(BASE_REVISION) if p.startswith("scaffold/") and p.endswith("/classification-research.jsonl")))
OPEN_RESEARCH = {PR_2097: "scaffold/legacy-execution-ticket-product-classification-0147/classification-research.jsonl"}
CORE_INPUTS = (DISPOSITION, PHASE, DECISIONS, READ_AFTER, BOUNDARY, *L1.values(), APPROVAL, "docs/governance/new-generation-start-here.md", "docs/governance/legacy-asset-reuse-control.md", FAILURE, CONSUMER, MANIFEST, *WAVE_PATHS)
EXPECTED_NEGATIVE_CASES = ("target_omission", "target_duplicate", "source_sha_tamper", "source_anchor_tamper", "empty_source_reclassified", "phase_admission", "implementation_promotion", "history_digest_tamper", "boundary_digest_tamper", "wave_edge_injection", "authority_promotion", "overlap_flag_tamper", "input_omission", "input_stale", "input_snapshot_digest_tamper", "binding_omission", "output_digest_tamper", "independent_audit_digest_tamper", "independent_audit_schema_revision_type", "independent_audit_static_content_review_tamper", "audit_record_asset_id_list", "audit_l1_documents_null", "audit_boundary_rows_list", "record_schema_revision_type", "record_product_basis_null", "record_product_basis_item_null", "record_failure_consumer_static_null", "record_boundary_product_rows_list", "record_boundary_l1_null", "record_approval_rows_null", "base_pin_tamper", "archive_symlink_mode", "archive_manifest_mismatch", "malformed_json", "duplicate_json_key", "history_disposition_promotion", "bootstrap_candidate_tamper", "phase_status_promotion", "human_judgment_clearance", "record_extra_key", "record_null_classification", "record_list_phase", "record_missing_ledger", "strict_bool_integer", "strict_integer_float", "inventory_target_count_tamper", "inventory_wave_count_tamper", "inventory_bool_integer", "binding_state_promotion", "binding_forbidden_clearance", "binding_replacement_promotion", "research_union_tamper")


def fail(code: str, message: str) -> None:
    raise AssertionError(f"{code}: {message}")


def same_typed_value(actual: object, expected: object) -> bool:
    """JSON value equality that distinguishes bool/int/float and recursively checks containers."""
    if type(actual) is not type(expected):
        return False
    if isinstance(expected, dict):
        return actual.keys() == expected.keys() and all(same_typed_value(actual[k], expected[k]) for k in expected)
    if isinstance(expected, list):
        return len(actual) == len(expected) and all(same_typed_value(a, e) for a, e in zip(actual, expected))
    return actual == expected


def require_object(value: object, keys: tuple[str, ...], code: str, label: str) -> dict:
    if not isinstance(value, dict) or set(value) != set(keys):
        fail(code, f"{label}: exact object keyset required")
    return value


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
        return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)
    except subprocess.CalledProcessError:
        fail("E_INPUT_STALE", f"pinned revision unavailable: {revision}:{path}")


@lru_cache(maxsize=None)
def git_blob(revision: str, path: str) -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", f"{revision}:{path}"], text=True, cwd=ROOT).strip()
    except subprocess.CalledProcessError:
        fail("E_INPUT_STALE", f"pinned revision unavailable: {revision}:{path}")


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
        result = subprocess.check_output(["git", "ls-tree", BASE_REVISION, "--", archive], text=True, cwd=ROOT).splitlines()
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
        return "insufficient_basis", [], "empty source artifact has no excerpt for a product claim"
    if path.endswith("/fixture3-notes.txt"):
        return "multi_product_conflict", ["HELIX-OS", "HELIX-Web-OS"], "source says the staging deploy runs on weekdays, requires a green smoke suite, and pages on-call after two health-check failures, but does not identify whether this is HELIX-OS project/CI operation or HELIX-Web-OS service deployment/monitoring; the four-product boundaries distinguish these responsibilities, while bootstrap independently lists both OS and Web-OS candidates and the smoke path group only suggests OS"
    if "/kimi-s4-bench-" in path:
        return "multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "S4 bench evidence is a path-group candidate spanning HARNESS and OS; per-asset ownership remains unresolved"
    return "direct_product_basis", ["HELIX-OS"], "review/smoke path group suggests OS; per-asset ownership remains unresolved"


def source_path(row: dict) -> str:
    return row.get("source_path") or (row.get("source_exact") or {}).get("source_path") or ""


def source_group(path: str) -> str:
    if "/kimi-review-lane-admission-" in path:
        return "kimi-review-lane-admission"
    if "/kimi-s4-bench-" in path:
        return "kimi-s4-bench"
    if "/kimi-smoke-rerun-" in path:
        return "kimi-smoke-rerun"
    fail("E_INDEPENDENT_AUDIT", f"unknown research source group {path}")


def source_role(path: str) -> str:
    name = path.rsplit("/", 1)[-1]
    if name.endswith(".mutation.json"):
        return "review_mutation_case"
    if name.endswith(".evidence.json"):
        return "review_receipt_case"
    if name == "summary.json":
        return "historical_run_summary"
    if "/bench/prompts/" in path:
        return "benchmark_prompt_or_fixture"
    if "/blind-judge/" in path and name == "verdict.json":
        return "historical_blind_judge_verdict"
    if "/blind-judge/" in path:
        return "generated_candidate_source_as_text"
    if name.startswith("run-") and name.endswith(".ts"):
        return "historical_runner_source_read_only"
    if name.endswith(".stderr.txt"):
        return "historical_stderr_capture"
    if name.endswith(".stdout.txt"):
        return "historical_stdout_capture"
    if name.endswith(".ts.txt"):
        return "generated_source_or_test_as_text"
    return "historical_research_artifact"


def research_snapshot() -> dict:
    try:
        raw = SNAPSHOT.read_bytes()
    except OSError as exc:
        fail("E_INPUT_STALE", f"vendored research snapshot unavailable: {exc}")
    if tagged(raw) != SNAPSHOT_SHA256:
        fail("E_INPUT_STALE", "vendored research snapshot digest mismatch")
    snapshot = local_json(SNAPSHOT)
    require_object(snapshot, ("schema_revision", "records"), "E_INPUT_STALE", "research snapshot")
    if snapshot.get("schema_revision") != 1 or not isinstance(snapshot.get("records"), list):
        fail("E_INPUT_STALE", "vendored research snapshot schema")
    for entry in snapshot["records"]:
        require_object(entry, ("revision", "path", "blob", "bytes", "sha256", "identities"), "E_INPUT_STALE", "snapshot entry")
        identities = entry.get("identities")
        if not isinstance(identities, list) or any(not isinstance(row, list) or len(row) != 3 or any(not isinstance(value, str) or not value for value in row) for row in identities):
            fail("E_INPUT_STALE", f"snapshot identity list {entry.get('path')}")
    return snapshot


def snapshot_ref(revision: str, path: str) -> dict:
    entries = research_snapshot()["records"]
    entry = next((row for row in entries if row["revision"] == revision and row["path"] == path), None)
    if entry is None:
        fail("E_INPUT_STALE", f"vendored research snapshot missing {revision}:{path}")
    try:
        data = git_bytes(revision, path)
        blob = git_blob(revision, path)
    except AssertionError as exc:
        if not str(exc).startswith("E_INPUT_STALE:"):
            raise
    else:
        if len(data) != entry["bytes"] or tagged(data) != entry["sha256"] or blob != entry["blob"]:
            fail("E_INPUT_STALE", f"pinned Git bytes differ from vendored snapshot {revision}:{path}")
    return {"revision": revision, "path": path, "blob": entry["blob"], "bytes": entry["bytes"], "sha256": entry["sha256"], "read_mode": "vendored_snapshot_git_object_bytes_verified_when_available"}


def all_research_records(revision: str) -> list[dict]:
    result = []
    entries = [row for row in research_snapshot()["records"] if row["revision"] == revision]
    if not entries:
        fail("E_INPUT_STALE", f"no vendored research corpus for {revision}")
    for entry in entries:
        try:
            data = git_bytes(revision, entry["path"])
            blob = git_blob(revision, entry["path"])
            if len(data) != entry["bytes"] or tagged(data) != entry["sha256"] or blob != entry["blob"]:
                fail("E_INPUT_STALE", f"pinned Git bytes differ from snapshot {revision}:{entry['path']}")
            result += [json.loads(line, object_pairs_hook=strict_pairs) for line in data.decode().splitlines() if line.strip()]
        except AssertionError as exc:
            if not str(exc).startswith("E_INPUT_STALE:"):
                raise
            result += [{"asset_id": row[0], "source_path": row[1], "source_sha256": row[2]} for row in entry["identities"]]
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
    prs = {"pr2097": normalized(PR_2097)}
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
    research_paths = [(row["revision"], row["path"]) for row in research_snapshot()["records"]]
    entries = [(BASE_REVISION, path) for path in CORE_INPUTS] + research_paths
    result = []
    seen = set()
    for revision, path in entries:
        if (revision, path) in seen:
            continue
        seen.add((revision, path))
        if (revision, path) in research_paths:
            result.append(snapshot_ref(revision, path))
        else:
            result.append(static_ref(revision, path))
    return result


def verify_source(record: dict, asset: dict) -> None:
    path = record.get("source_path")
    if path != asset.get("source_path"):
        fail("E_TARGET_SET", f"source path mismatch {record.get('asset_id')}")
    exact = record.get("source_exact")
    require_object(exact, ("source_path", "archive_path", "blob", "archive_mode", "archive_type", "bytes", "line_count", "sha256", "ledger_source_sha256", "ledger_digest_match", "archive_manifest_sha256", "archive_manifest_match", "semantic_anchor", "anchor_line_coverage", "read_mode"), "E_SOURCE", str(path))
    require_object(exact.get("semantic_anchor"), ("status", "marker", "line_start", "line_end", "line_text", "line_text_sha256"), "E_SOURCE", f"anchor {path}")
    require_object(exact.get("anchor_line_coverage"), ("source_line_count", "anchor_line_count", "coverage_ratio", "unread_line_ranges"), "E_SOURCE", f"coverage {path}")
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
        expected_anchor_status = "mechanical_prefix_excerpt_not_semantic_span"
        expected_unread = [[expected_end + 1, len(lines)]] if expected_end < len(lines) else []
        expected_coverage = round((expected_end - expected_start + 1) / len(lines), 6)
    else:
        expected_start = expected_end = 0; expected_lines = []; expected_anchor_status = "empty_source_no_excerpt"; expected_unread = []; expected_coverage = 0.0
    if anchor.get("status") != expected_anchor_status or anchor.get("line_start") != expected_start or anchor.get("line_end") != expected_end or anchor.get("line_text") != expected_lines or anchor.get("line_text_sha256") != tagged("\n".join(expected_lines).encode()) or not same_typed_value(exact.get("anchor_line_coverage"), {"source_line_count": len(lines), "anchor_line_count": expected_end - expected_start + 1 if lines else 0, "coverage_ratio": expected_coverage, "unread_line_ranges": expected_unread}):
        fail("E_SOURCE", f"semantic anchor {path}")
    expected_exact = {"source_path": path, "archive_path": archive, "blob": oid, "archive_mode": mode, "archive_type": kind, "bytes": len(data), "line_count": len(lines), "sha256": tagged(data), "ledger_source_sha256": "sha256:" + asset["source_sha256"], "ledger_digest_match": True, "archive_manifest_sha256": expected_manifest, "archive_manifest_match": True, "semantic_anchor": {"status": expected_anchor_status, "marker": lines[0][:240] if lines else None, "line_start": expected_start, "line_end": expected_end, "line_text": expected_lines, "line_text_sha256": tagged("\n".join(expected_lines).encode())}, "anchor_line_coverage": {"source_line_count": len(lines), "anchor_line_count": expected_end - expected_start + 1 if lines else 0, "coverage_ratio": expected_coverage, "unread_line_ranges": expected_unread}, "read_mode": "git_object_static_read_only"}
    if not same_typed_value(exact, expected_exact):
        fail("E_SOURCE", f"source exact typed object {path}")
    classification = record.get("classification")
    if classification.get("category") != expected_category or not same_typed_value(classification.get("candidate_products"), expected_products) or classification.get("reason") != expected_reason:
        fail("E_CLASSIFICATION", path)
    expected_counter = (["source-specific ambiguity: weekday staging deployment, smoke-suite gate, on-call paging after repeated health-check failure does not identify internal HELIX project/CI operation (HELIX-OS) versus Web service deployment/monitoring (HELIX-Web-OS); bootstrap independently lists both candidates; smoke path group suggests OS only; neither candidate is formally adopted"] if path.endswith("/fixture3-notes.txt") else ([] if expected_category == "direct_product_basis" else (["empty_source_no_excerpt"] if expected_category == "insufficient_basis" else ["HARNESS and OS meanings remain distinct; path group is not per-asset ownership proof"])))
    if not same_typed_value(classification.get("counterevidence"), expected_counter):
        fail("E_CLASSIFICATION", f"counterevidence {path}")


def verify() -> None:
    inventory = local_json(INVENTORY)
    binding = local_json(BINDING)
    records = local_jsonl(LEDGER)
    require_object(inventory, ("schema_revision", "binding_id", "artifacts", "base_revision", "base_source_mode", "independent_source_audit", "archive_population_count", "research_scope", "classification_counts", "source_group_counts", "implementation_counts", "phase_counts", "wave_evidence", "research_union", "overlap_status", "authority_boundary", "input_digests", "binding_upstream_paths", "output_sha256", "generator_contract"), "E_INVENTORY", "inventory")
    require_object(binding, ("schema_revision", "id", "kind", "title", "product", "owner_candidate", "state", "reason", "upstream", "role", "obligations", "connections", "operations", "artifacts", "verification", "replacement", "created", "updated"), "E_BINDING_CLOSURE", "binding")
    require_object(inventory.get("research_scope"), ("source_prefix", "target_count", "target_id_count", "target_source_path_count", "target_ids", "target_source_paths", "target_ids_sha256", "target_source_paths_sha256"), "E_INVENTORY", "research_scope")
    require_object(inventory.get("wave_evidence"), ("scanned_input_count", "target_edge_count", "direct_edge_status", "input_paths"), "E_INVENTORY", "wave_evidence")
    require_object(inventory.get("authority_boundary"), ("authority_effect", "formal_asset_classification_updated", "formal_product_authority", "formal_implementation_status", "phase_updated", "successor_assignment", "new_build_allowed", "read_mode"), "E_AUTHORITY", "authority_boundary")
    require_object(binding.get("operations"), ("allowed", "forbidden"), "E_BINDING_CLOSURE", "binding.operations")
    require_object(binding.get("replacement"), ("role_target", "formal_artifacts", "issue", "status"), "E_BINDING_CLOSURE", "binding.replacement")
    require_object(binding.get("connections"), ("boundary", "consumers", "dependencies"), "E_BINDING_CLOSURE", "binding.connections")
    require_object(binding.get("verification"), ("evidence_kind", "scope", "oracles", "negative_cases"), "E_BINDING_CLOSURE", "binding.verification")
    disposition_rows = rows(BASE_REVISION, DISPOSITION)
    phase_rows = rows(BASE_REVISION, PHASE)
    decisions = rows(BASE_REVISION, DECISIONS)
    read_after = rows(BASE_REVISION, READ_AFTER)
    disp_by_id = {r["asset_id"]: (n, r) for n, r in disposition_rows}
    phase_by_id = {r["asset_id"]: (n, r) for n, r in phase_rows}
    targets = {r["asset_id"]: r for _, r in disposition_rows if r.get("source_path", "").startswith(TARGET_PREFIX)}
    if len(targets) != 57:
        fail("E_TARGET_SET", f"BASE target count {len(targets)}")
    if any(not isinstance(r.get("asset_id"), str) or not isinstance(r.get("source_path"), str) for r in records):
        fail("E_RECORD", "asset_id and source_path must be strings")
    ids = [r.get("asset_id") for r in records]
    paths = [r.get("source_path") for r in records]
    if len(records) != 57 or set(ids) != set(targets) or len(set(ids)) != 57 or set(paths) != {a["source_path"] for a in targets.values()} or len(set(paths)) != 57:
        fail("E_TARGET_SET", "exact target IDs/source paths required")
    audit = local_json(AUDIT)
    require_object(audit, ("schema_revision", "audit_kind", "base_revision", "derivation", "scope", "source_totals", "static_content_review", "registry_join", "four_product_current_main_evidence", "wave_inputs", "records", "authority_boundary"), "E_INDEPENDENT_AUDIT", "audit")
    require_object(audit.get("authority_boundary"), ("authority_effect", "formal_asset_classification_updated", "formal_product_authority", "formal_implementation_status", "phase_updated", "successor_assignment", "new_build_allowed"), "E_INDEPENDENT_AUDIT", "audit.authority_boundary")
    require_object(audit.get("registry_join"), ("phase_status_counts", "phase_candidate_counts", "target_specific_decision_rows", "target_specific_read_after_rows", "all_disposition_rows_formally_unresolved", "all_consumer_refs_empty", "failure_inventory", "consumer_inventory", "wave_inputs_scanned", "target_id_wave_hits", "target_path_wave_hits", "candidate_product_anomalies", "interpretation"), "E_INDEPENDENT_AUDIT", "audit.registry_join")
    require_object(audit["registry_join"].get("failure_inventory"), ("path", "sha256", "target_id_hits", "target_path_hits"), "E_INDEPENDENT_AUDIT", "audit.registry_join.failure_inventory")
    require_object(audit["registry_join"].get("consumer_inventory"), ("path", "sha256", "target_id_hits", "target_path_hits"), "E_INDEPENDENT_AUDIT", "audit.registry_join.consumer_inventory")
    require_object(audit.get("scope"), ("prefix", "record_count", "unique_asset_ids", "unique_source_paths", "asset_ids_sha256", "source_paths_sha256"), "E_INDEPENDENT_AUDIT", "audit.scope")
    require_object(audit.get("source_totals"), ("bytes", "lines", "empty_source_count", "empty_source_asset_ids", "empty_source_sha256", "group_counts", "artifact_role_counts", "same_source_sha_occurrences"), "E_INDEPENDENT_AUDIT", "audit.source_totals")
    require_object(audit.get("derivation"), ("target_scope_source", "generated_classification_read", "generator_or_validator_imported", "archive_access", "source_sha_rule"), "E_INDEPENDENT_AUDIT", "audit.derivation")
    require_object(audit.get("static_content_review"), ("kimi_review_lane_admission", "kimi_s4_bench", "kimi_smoke_rerun", "category_limit", "historical_claim_limit"), "E_INDEPENDENT_AUDIT", "audit.static_content_review")
    require_object(audit.get("four_product_current_main_evidence"), ("product_boundary", "approval_decision", "l1_documents"), "E_INDEPENDENT_AUDIT", "audit.four_product_current_main_evidence")
    require_object(audit["four_product_current_main_evidence"].get("product_boundary"), ("revision", "path", "sha256", "rows"), "E_INDEPENDENT_AUDIT", "audit.product_boundary")
    require_object(audit["four_product_current_main_evidence"].get("approval_decision"), ("revision", "path", "sha256", "rows", "scope_limit"), "E_INDEPENDENT_AUDIT", "audit.approval_decision")
    audit_products = audit["four_product_current_main_evidence"]
    for label, row_map in (("audit.product_boundary.rows", audit_products["product_boundary"].get("rows")), ("audit.approval_decision.rows", audit_products["approval_decision"].get("rows")), ("audit.l1_documents", audit_products.get("l1_documents"))):
        if not isinstance(row_map, dict) or set(row_map) != set(PRODUCTS):
            fail("E_INDEPENDENT_AUDIT", f"{label}: exact four-product object required")
        for product, row in row_map.items():
            if not isinstance(row, dict):
                fail("E_INDEPENDENT_AUDIT", f"{label}.{product}: object required")
    expected_static_content_review = {
        "kimi_review_lane_admission": "Two dated lanes contain approve/quota-switch/schema-drift/seeded-blocker/tool-request receipts and mutation cases for high-risk/tool activity/head binding/stale receipt/closure drift. These are historical evidence fixtures, not current runtime or acceptance proof.",
        "kimi_s4_bench": "Prompt inputs, runner source, generated code/test candidates, blind-judge verdict, summaries, and captured outputs; four stderr captures are empty. The runner source can invoke an external model and execute generated code, and was read as text only.",
        "kimi_smoke_rerun": "Prompt fixtures, runner source, historical echo/codegen/scope/ACP CLI output and summary; one stderr capture is empty. The runner source was read as text only.",
        "category_limit": "The path-group counts support research-candidate grouping only. They do not establish per-asset product ownership, phase admission, implementation, acceptance, or successor.",
        "historical_claim_limit": "CLI outputs and summaries remain historical source content; this audit performed no old-runtime, test, CI, workflow, hook, adapter, or runner execution.",
    }
    if not same_typed_value(audit.get("schema_revision"), 1) or not same_typed_value(audit.get("static_content_review"), expected_static_content_review):
        fail("E_INDEPENDENT_AUDIT", "audit schema revision or static content review")
    if not same_typed_value(audit.get("derivation"), {"target_scope_source": DISPOSITION, "generated_classification_read": False, "generator_or_validator_imported": False, "archive_access": "fixed BASE Git objects only; no archive path execution", "source_sha_rule": "Git object bytes = disposition source_sha256 = MANIFEST.sha256 entry"}):
        fail("E_INDEPENDENT_AUDIT", "audit derivation")
    if not same_typed_value(audit.get("authority_boundary"), {"authority_effect": "none", "formal_asset_classification_updated": False, "formal_product_authority": None, "formal_implementation_status": "unknown", "phase_updated": False, "successor_assignment": None, "new_build_allowed": False}):
        fail("E_INDEPENDENT_AUDIT", "audit authority boundary")
    audit_rel_path = "scaffold/legacy-research-assets-product-classification-0142/independent-source-audit.json"
    audit_ref = inventory.get("independent_source_audit", {})
    if audit_ref != {"path": audit_rel_path, "sha256": tagged(AUDIT.read_bytes()), "record_count": 57, "scope_derivation": "fixed BASE disposition; generated classification, generator, and validator are not audit inputs"}:
        fail("E_INDEPENDENT_AUDIT", "audit output digest or provenance")
    audit_rows = audit.get("records", [])
    if not isinstance(audit_rows, list) or any(not isinstance(row, dict) for row in audit_rows):
        fail("E_INDEPENDENT_AUDIT", "audit records must be an object array")
    if any(not isinstance(row.get("asset_id"), str) for row in audit_rows) or len({row["asset_id"] for row in audit_rows}) != len(audit_rows):
        fail("E_INDEPENDENT_AUDIT", "audit record asset_id values must be unique strings")
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
        require_object(audited, ("asset_id", "disposition_line", "source_path", "source_group", "artifact_role", "source", "disposition", "phase", "asset_specific_decision_rows", "asset_specific_read_after_rows", "wave_id_hits", "wave_path_hits", "failure_inventory_id_or_path_hit", "consumer_inventory_id_or_path_hit"), "E_INDEPENDENT_AUDIT", f"audit record {asset_id}")
        require_object(audited.get("source"), ("archive_path", "blob", "mode", "type", "bytes", "line_count", "sha256", "ledger_sha256", "manifest_sha256", "all_three_sha_match", "static_read_only"), "E_INDEPENDENT_AUDIT", f"audit source {asset_id}")
        require_object(audited.get("disposition"), ("asset_class", "disposition", "product_target", "implementation_status", "consumer_refs", "decision_record_ref", "read_after_record_ref"), "E_INDEPENDENT_AUDIT", f"audit disposition {asset_id}")
        require_object(audited.get("phase"), ("line", "status", "candidate_phase_targets", "candidate_product_targets", "implementation_evidence_state", "unresolved"), "E_INDEPENDENT_AUDIT", f"audit phase {asset_id}")
        if audited.get("source_path") != asset.get("source_path") or audited.get("source", {}).get("sha256") != "sha256:" + asset.get("source_sha256", "") or audited.get("source", {}).get("ledger_sha256") != "sha256:" + asset.get("source_sha256", "") or audited.get("source", {}).get("mode") != "100644" or audited.get("source", {}).get("type") != "blob" or audited.get("source", {}).get("all_three_sha_match") is not True or audited.get("source", {}).get("static_read_only") is not True:
            fail("E_INDEPENDENT_AUDIT", f"source/ledger record {asset_id}")
        disp_line, disp = disp_by_id[asset_id]
        phase_line, phase = phase_by_id[asset_id]
        archive = ARCHIVE_PREFIX + asset["source_path"]
        data = git_bytes(BASE_REVISION, archive)
        audit_disp = {"asset_class": disp.get("asset_class"), "disposition": disp.get("disposition"), "product_target": disp.get("product_target"), "implementation_status": disp.get("implementation_status"), "consumer_refs": sorted(disp.get("consumer_refs", [])), "decision_record_ref": disp.get("decision_record_ref"), "read_after_record_ref": disp.get("read_after_record_ref")}
        audit_phase = {"line": phase_line, "status": phase.get("phase_classification_status"), "candidate_phase_targets": sorted(phase.get("candidate_phase_targets", [])), "candidate_product_targets": sorted(phase.get("candidate_product_targets", [])), "implementation_evidence_state": phase.get("implementation_evidence_state"), "unresolved": sorted(phase.get("unresolved", []))}
        expected_audit_record = {"asset_id": asset_id, "disposition_line": disp_line, "source_path": asset["source_path"], "source_group": source_group(asset["source_path"]), "artifact_role": source_role(asset["source_path"]), "source": {"archive_path": archive, "blob": git_blob(BASE_REVISION, archive), "mode": "100644", "type": "blob", "bytes": len(data), "line_count": len(data.decode(errors="replace").splitlines()), "sha256": tagged(data), "ledger_sha256": "sha256:" + asset["source_sha256"], "manifest_sha256": manifest_sha(asset["source_path"]), "all_three_sha_match": True, "static_read_only": True}, "disposition": audit_disp, "phase": audit_phase, "asset_specific_decision_rows": [n for n, row in decisions if row.get("asset_id") == asset_id], "asset_specific_read_after_rows": [n for n, row in read_after if row.get("asset_id") == asset_id], "wave_id_hits": [], "wave_path_hits": [], "failure_inventory_id_or_path_hit": False, "consumer_inventory_id_or_path_hit": False}
        if not same_typed_value(audited, expected_audit_record):
            fail("E_INDEPENDENT_AUDIT", f"audit record values {asset_id}")
    audit_join = audit.get("registry_join", {})
    if (
        audit.get("source_totals", {}).get("bytes") != 58243
        or audit.get("source_totals", {}).get("lines") != 1181
        or audit.get("source_totals", {}).get("empty_source_count") != 5
        or audit_join.get("target_specific_decision_rows") != 0
        or audit_join.get("target_specific_read_after_rows") != 0
        or audit_join.get("target_id_wave_hits") != 0
        or audit_join.get("target_path_wave_hits") != 0
        or audit_join.get("candidate_product_anomalies") != [{"asset_id": "LEGACY-ASSET-F3000D26921558AA2E0C", "source_path": "docs/research/assets/kimi-smoke-rerun-2026-08-08/bench/prompts/fixture3-notes.txt", "candidate_products": ["HELIX-OS", "HELIX-Web-OS"], "candidate_phase_targets": ["PHCAP-15"], "note": "bundle retains this as multi_product_conflict: the source describes weekday staging deployment, a smoke-suite gate, and on-call paging after repeated health-check failure without identifying HELIX-OS project/CI operation versus HELIX-Web-OS service deployment/monitoring; bootstrap independently lists both candidates, while the smoke path group suggests OS only; neither candidate is adopted as formal authority"}]
    ):
        fail("E_INDEPENDENT_AUDIT", "source and registry join summary")
    expected_registry_join = {
        "phase_status_counts": {"unresolved": 34, "unresolved_with_candidate": 23},
        "phase_candidate_counts": {"without_candidate_phase": 34, "PHCAP-12": 22, "PHCAP-15": 1},
        "target_specific_decision_rows": 0, "target_specific_read_after_rows": 0,
        "all_disposition_rows_formally_unresolved": True, "all_consumer_refs_empty": True,
        "failure_inventory": {"path": FAILURE, "sha256": tagged(git_bytes(BASE_REVISION, FAILURE)), "target_id_hits": 0, "target_path_hits": 0},
        "consumer_inventory": {"path": CONSUMER, "sha256": tagged(git_bytes(BASE_REVISION, CONSUMER)), "target_id_hits": 0, "target_path_hits": 0},
        "wave_inputs_scanned": 50, "target_id_wave_hits": 0, "target_path_wave_hits": 0,
        "candidate_product_anomalies": [{"asset_id": "LEGACY-ASSET-F3000D26921558AA2E0C", "source_path": "docs/research/assets/kimi-smoke-rerun-2026-08-08/bench/prompts/fixture3-notes.txt", "candidate_products": ["HELIX-OS", "HELIX-Web-OS"], "candidate_phase_targets": ["PHCAP-15"], "note": "bundle retains this as multi_product_conflict: the source describes weekday staging deployment, a smoke-suite gate, and on-call paging after repeated health-check failure without identifying HELIX-OS project/CI operation versus HELIX-Web-OS service deployment/monitoring; bootstrap independently lists both candidates, while the smoke path group suggests OS only; neither candidate is adopted as formal authority"}],
        "interpretation": "No asset-specific decision, read-after, failure, or consumer closure was found. Absence of direct references does not establish absence of indirect consumers; closure remains pending.",
    }
    if not same_typed_value(audit_join, expected_registry_join):
        fail("E_INDEPENDENT_AUDIT", "registry join exact values")
    expected_audit_scope = {"prefix": TARGET_PREFIX, "record_count": 57, "unique_asset_ids": 57, "unique_source_paths": 57, "asset_ids_sha256": tagged("\n".join(sorted(targets)).encode()), "source_paths_sha256": tagged("\n".join(sorted(a["source_path"] for a in targets.values())).encode())}
    if not same_typed_value(audit.get("scope"), expected_audit_scope):
        fail("E_INDEPENDENT_AUDIT", "audit scope exact values")
    empty_audit_ids = sorted(aid for aid, row in audit_by_id.items() if row["source"]["bytes"] == 0)
    role_counts: dict[str, int] = {}
    group_counts: dict[str, int] = {}
    for aid, row in audit_by_id.items():
        role_counts[row["artifact_role"]] = role_counts.get(row["artifact_role"], 0) + 1
        group_counts[row["source_group"]] = group_counts.get(row["source_group"], 0) + 1
    expected_empty_sha = tagged(b"")
    expected_audit_totals = {"bytes": 58243, "lines": 1181, "empty_source_count": 5, "empty_source_asset_ids": empty_audit_ids, "empty_source_sha256": expected_empty_sha, "group_counts": dict(sorted(group_counts.items())), "artifact_role_counts": dict(sorted(role_counts.items())), "same_source_sha_occurrences": {expected_empty_sha: 5}}
    if not same_typed_value(audit.get("source_totals"), expected_audit_totals):
        fail("E_INDEPENDENT_AUDIT", "source totals exact values")
    expected_wave_inputs = [{"path": path, "blob": git_blob(BASE_REVISION, path), "sha256": tagged(git_bytes(BASE_REVISION, path))} for path in WAVE_PATHS]
    if not same_typed_value(audit.get("wave_inputs"), expected_wave_inputs):
        fail("E_INDEPENDENT_AUDIT", "wave input receipts")
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
    def audit_receipt(path: str, marker: str) -> dict:
        row = expected_receipt(BASE_REVISION, path, marker)
        return {"path": row["path"], "blob": row["blob"], "sha256": row["sha256"], "line": row["line_start"], "line_text": row["line_text"][0], "line_text_sha256": row["line_text_sha256"], "marker": row["marker"]}
    expected_boundary_audit = {"product_boundary": {"revision": BASE_REVISION, "path": BOUNDARY, "sha256": tagged(git_bytes(BASE_REVISION, BOUNDARY)), "rows": {p: audit_receipt(BOUNDARY, BOUNDARY_MARKERS[p]) for p in PRODUCTS}}, "approval_decision": {"revision": BASE_REVISION, "path": APPROVAL, "sha256": tagged(git_bytes(BASE_REVISION, APPROVAL)), "rows": {p: audit_receipt(APPROVAL, APPROVAL_MARKERS[p]) for p in PRODUCTS}, "scope_limit": "Approval records bind exact L1 document bytes; they do not admit lower layers, assign these 57 assets, or authorize implementation."}, "l1_documents": {p: {**audit_receipt(L1[p], L1_MARKERS[p]), "product": p} for p in PRODUCTS}}
    if not same_typed_value(audited_boundary, expected_boundary_audit):
        fail("E_INDEPENDENT_AUDIT", "four-product audit receipts exact values")
    expected_categories = {"direct_product_basis": 0, "multi_product_conflict": 0, "insufficient_basis": 0}
    for record in records:
        require_object(record, ("schema_revision", "binding_id", "asset_id", "source_path", "source_exact", "asset_ledger", "classification", "boundary_evidence", "phase_evidence", "implementation_evidence", "legacy_history_failure_consumer", "wave_evidence", "authority_effect", "formal_asset_classification_updated", "new_build_allowed", "successor_assignment", "human_judgment_remaining"), "E_RECORD", "record")
        require_object(record.get("classification"), ("category", "candidate_products", "product_basis", "counterevidence", "reason"), "E_RECORD", "classification")
        require_object(record.get("asset_ledger"), ("disposition", "bootstrap"), "E_RECORD", "asset_ledger")
        require_object(record["asset_ledger"].get("bootstrap"), ("path", "line", "row_sha256", "artifact_evidence_kind", "product_classification_status", "candidate_product_targets", "phase_classification_status", "candidate_phase_targets", "legacy_implementation_status", "implementation_evidence_state", "unresolved"), "E_RECORD", "asset_ledger.bootstrap")
        require_object(record.get("phase_evidence"), ("candidate_phase_targets", "bootstrap_status", "formal_phase_admission", "phase_status", "source"), "E_RECORD", "phase_evidence")
        require_object(record.get("implementation_evidence"), ("status", "unimplemented_status", "degradation_status", "implementation_evidence_state", "legacy_execution_performed", "source_claims_are_not_execution_proof", "consumer_closure_status"), "E_RECORD", "implementation_evidence")
        require_object(record.get("legacy_history_failure_consumer"), ("disposition", "decisions", "read_after", "failure_consumer_static", "observed_failure_status", "consumer_closure_status", "degradation_status"), "E_RECORD", "legacy_history_failure_consumer")
        require_object(record.get("wave_evidence"), ("edge_count", "matching_inputs", "scanned_input_count", "status"), "E_RECORD", "wave_evidence")
        asset_id = record.get("asset_id")
        asset = targets.get(asset_id)
        if asset is None or record.get("binding_id") != BINDING_ID:
            fail("E_TARGET_SET", str(asset_id))
        if not same_typed_value(record.get("schema_revision"), 1):
            fail("E_RECORD", f"schema_revision {asset_id}")
        classification = record["classification"]
        if (not isinstance(classification.get("category"), str)
                or not isinstance(classification.get("candidate_products"), list)
                or any(not isinstance(product, str) for product in classification["candidate_products"])
                or not isinstance(classification.get("product_basis"), list)
                or any(not isinstance(link, dict) for link in classification["product_basis"])
                or not isinstance(classification.get("counterevidence"), list)):
            fail("E_RECORD", f"classification container types {asset_id}")
        verify_source(record, asset)
        category = record["classification"]["category"]
        expected_categories[category] += 1
        if record.get("authority_effect") != "none" or record.get("formal_asset_classification_updated") is not False or record.get("new_build_allowed") is not False or record.get("successor_assignment") is not None:
            fail("E_AUTHORITY", asset_id)
        if not same_typed_value(record.get("implementation_evidence"), {"status": "unknown", "unimplemented_status": "unknown", "degradation_status": "unknown", "implementation_evidence_state": "document_present", "legacy_execution_performed": False, "source_claims_are_not_execution_proof": True, "consumer_closure_status": "pending"}):
            fail("E_IMPLEMENTATION", asset_id)
        if not same_typed_value(record.get("human_judgment_remaining"), ["product owner and boundary acceptance", "phase admission", "successor selection", "implementation/unimplemented and degradation closure", "consumer closure", "formal asset classification"]):
            fail("E_RECORD", f"human judgment closure {asset_id}")
        p_line, phase = phase_by_id[asset_id]
        if record["phase_evidence"].get("formal_phase_admission") is not False or record["phase_evidence"].get("source") != {"path": PHASE, "line": p_line, "row_sha256": row_digest(phase)}:
            fail("E_PHASE", asset_id)
        if record["phase_evidence"].get("candidate_phase_targets") != sorted(phase.get("candidate_phase_targets", [])) or record["phase_evidence"].get("bootstrap_status") != phase.get("phase_classification_status"):
            fail("E_PHASE", asset_id)
        boundary = record.get("boundary_evidence", {})
        require_object(boundary, ("product_boundary", "l1", "approval"), "E_BOUNDARY_ANCHOR", f"boundary {asset_id}")
        require_object(boundary.get("product_boundary"), ("path", "blob", "sha256", "read_mode", "product_rows"), "E_BOUNDARY_ANCHOR", f"product boundary {asset_id}")
        require_object(boundary.get("approval"), ("path", "blob", "sha256", "rows"), "E_BOUNDARY_ANCHOR", f"approval boundary {asset_id}")
        if (not isinstance(boundary["product_boundary"].get("product_rows"), dict)
                or set(boundary["product_boundary"]["product_rows"]) != set(PRODUCTS)
                or not isinstance(boundary.get("l1"), dict)
                or set(boundary["l1"]) != set(PRODUCTS)
                or not isinstance(boundary["approval"].get("rows"), dict)
                or set(boundary["approval"]["rows"]) != set(PRODUCTS)):
            fail("E_BOUNDARY_ANCHOR", f"boundary product row containers {asset_id}")
        if boundary.get("product_boundary", {}).get("path") != BOUNDARY or boundary.get("product_boundary", {}).get("blob") != git_blob(BASE_REVISION, BOUNDARY) or boundary.get("product_boundary", {}).get("sha256") != tagged(git_bytes(BASE_REVISION, BOUNDARY)) or boundary.get("product_boundary", {}).get("read_mode") != "git_object_static_read_only":
            fail("E_BOUNDARY_ANCHOR", asset_id)
        for p in PRODUCTS:
            if boundary.get("product_boundary", {}).get("product_rows", {}).get(p) != expected_receipt(BASE_REVISION, BOUNDARY, BOUNDARY_MARKERS[p]) or boundary.get("l1", {}).get(p) != expected_receipt(BASE_REVISION, L1[p], L1_MARKERS[p]) or boundary.get("approval", {}).get("rows", {}).get(p) != expected_receipt(BASE_REVISION, APPROVAL, APPROVAL_MARKERS[p]):
                fail("E_BOUNDARY_ANCHOR", f"{asset_id}:{p}")
        expected_boundary = {
            "product_boundary": {"path": BOUNDARY, "blob": git_blob(BASE_REVISION, BOUNDARY), "sha256": tagged(git_bytes(BASE_REVISION, BOUNDARY)), "read_mode": "git_object_static_read_only", "product_rows": {p: expected_receipt(BASE_REVISION, BOUNDARY, BOUNDARY_MARKERS[p]) for p in PRODUCTS}},
            "l1": {p: expected_receipt(BASE_REVISION, L1[p], L1_MARKERS[p]) for p in PRODUCTS},
            "approval": {"path": APPROVAL, "blob": git_blob(BASE_REVISION, APPROVAL), "sha256": tagged(git_bytes(BASE_REVISION, APPROVAL)), "rows": {p: expected_receipt(BASE_REVISION, APPROVAL, APPROVAL_MARKERS[p]) for p in PRODUCTS}},
        }
        if not same_typed_value(boundary, expected_boundary):
            fail("E_BOUNDARY_ANCHOR", f"boundary full object {asset_id}")
        disp_line, disp = disp_by_id[asset_id]
        expected_disp = {"path": DISPOSITION, "line": disp_line, "row_sha256": row_digest(disp), "asset_id": asset_id, "source_path": disp["source_path"], "source_sha256": "sha256:" + disp["source_sha256"], "asset_class": disp.get("asset_class"), "disposition": disp.get("disposition"), "product_target": disp.get("product_target"), "implementation_status": disp.get("implementation_status"), "consumer_refs": sorted(disp.get("consumer_refs", [])), "decision_record_ref": disp.get("decision_record_ref"), "read_after_record_ref": disp.get("read_after_record_ref")}
        if not same_typed_value(record["asset_ledger"].get("disposition"), expected_disp) or not same_typed_value(record["legacy_history_failure_consumer"].get("disposition"), expected_disp):
            fail("E_LEDGER", asset_id)
        expected_bootstrap = {"path": PHASE, "line": p_line, "row_sha256": row_digest(phase), "artifact_evidence_kind": phase.get("artifact_evidence_kind"), "product_classification_status": phase.get("product_classification_status"), "candidate_product_targets": sorted(phase.get("candidate_product_targets", [])), "phase_classification_status": phase.get("phase_classification_status"), "candidate_phase_targets": sorted(phase.get("candidate_phase_targets", [])), "legacy_implementation_status": phase.get("legacy_implementation_status"), "implementation_evidence_state": phase.get("implementation_evidence_state"), "unresolved": sorted(phase.get("unresolved", []))}
        if not same_typed_value(record["asset_ledger"].get("bootstrap"), expected_bootstrap):
            fail("E_LEDGER", f"bootstrap {asset_id}")
        bootstrap_products = expected_bootstrap["candidate_product_targets"]
        classified_products = record["classification"].get("candidate_products")
        if bootstrap_products and (
            (len(bootstrap_products) == 1 and record["classification"].get("category") == "direct_product_basis" and classified_products != bootstrap_products)
            or (len(bootstrap_products) > 1 and record["classification"].get("category") != "multi_product_conflict" and not record["classification"].get("counterevidence"))
        ):
            fail("E_CLASSIFICATION", f"bootstrap/product conflict not represented {asset_id}")
        expected_phase = {"candidate_phase_targets": sorted(phase.get("candidate_phase_targets", [])), "bootstrap_status": phase.get("phase_classification_status"), "formal_phase_admission": False, "phase_status": "research_candidate_unresolved" if phase.get("candidate_phase_targets") else "unresolved", "source": {"path": PHASE, "line": p_line, "row_sha256": row_digest(phase)}}
        if not same_typed_value(record.get("phase_evidence"), expected_phase):
            fail("E_PHASE", asset_id)
        if not same_typed_value(record.get("wave_evidence"), {"edge_count": 0, "matching_inputs": [], "scanned_input_count": 50, "status": "no_direct_asset_edge_found"}):
            fail("E_WAVE", asset_id)
        expected_failure = static_ref(BASE_REVISION, FAILURE); expected_consumer = static_ref(BASE_REVISION, CONSUMER)
        history = record.get("legacy_history_failure_consumer", {})
        static_failure_consumer = history.get("failure_consumer_static")
        if not isinstance(static_failure_consumer, dict):
            fail("E_RECORD", f"failure_consumer_static must be an object {asset_id}")
        require_object(static_failure_consumer, ("failure", "consumer"), "E_RECORD", f"failure_consumer_static {asset_id}")
        if history.get("failure_consumer_static", {}).get("failure") != expected_failure or history.get("failure_consumer_static", {}).get("consumer") != expected_consumer or history.get("consumer_closure_status") != "asset-level consumer closure pending":
            fail("E_HISTORY_CONSUMER", asset_id)
        expected_decisions = [{"path": DECISIONS, "line": n, "row_sha256": row_digest(row), "decision_id": row.get("decision_id"), "disposition": row.get("disposition")} for n, row in decisions if row.get("asset_id") == asset_id]
        expected_read_after = [{"path": READ_AFTER, "line": n, "row_sha256": row_digest(row), "result": row.get("result"), "digest_match": row.get("digest_match"), "consumer_match": row.get("consumer_match")} for n, row in read_after if row.get("asset_id") == asset_id]
        expected_history = {"disposition": expected_disp, "decisions": expected_decisions, "read_after": expected_read_after, "failure_consumer_static": {"failure": expected_failure, "consumer": expected_consumer}, "observed_failure_status": "asset_specific_failure_or_degradation_not_established", "consumer_closure_status": "asset-level consumer closure pending", "degradation_status": "unknown"}
        if not same_typed_value(history, expected_history):
            fail("E_HISTORY_CONSUMER", asset_id)
        for link in record["classification"].get("product_basis", []):
            p = link.get("product")
            if p not in record["classification"]["candidate_products"] or link.get("boundary") != boundary["product_boundary"]["product_rows"][p] or link.get("l1") != boundary["l1"][p]:
                fail("E_CLASSIFICATION", asset_id)
        expected_basis = [{"product": p, "boundary": boundary["product_boundary"]["product_rows"][p], "l1": boundary["l1"][p], "mechanical_excerpt": {"source_path": record["source_path"], "line_start": record["source_exact"]["semantic_anchor"]["line_start"], "line_end": record["source_exact"]["semantic_anchor"]["line_end"], "not_semantic_analysis": True}} for p in record["classification"]["candidate_products"]]
        expected_category, expected_products, expected_reason = profile(record["source_path"], record["source_exact"]["line_count"])
        expected_counter = (["source-specific ambiguity: weekday staging deployment, smoke-suite gate, on-call paging after repeated health-check failure does not identify internal HELIX project/CI operation (HELIX-OS) versus Web service deployment/monitoring (HELIX-Web-OS); bootstrap independently lists both candidates; smoke path group suggests OS only; neither candidate is formally adopted"] if record["source_path"].endswith("/fixture3-notes.txt") else ([] if expected_category == "direct_product_basis" else (["empty_source_no_excerpt"] if expected_category == "insufficient_basis" else ["HARNESS and OS meanings remain distinct; path group is not per-asset ownership proof"])))
        expected_classification = {"category": expected_category, "candidate_products": expected_products, "product_basis": expected_basis, "counterevidence": expected_counter, "reason": expected_reason}
        if not same_typed_value(record["classification"], expected_classification):
            fail("E_CLASSIFICATION", f"basis {asset_id}")
    if not same_typed_value(expected_categories, inventory.get("classification_counts")):
        fail("E_CATEGORY_PARTITION", "classification counts")
    if inventory.get("output_sha256") != tagged(LEDGER.read_bytes()):
        fail("E_OUTPUT_DIGEST", "classification output")
    if inventory.get("base_revision") != BASE_REVISION or inventory.get("archive_population_count") != 4020 or inventory.get("binding_id") != BINDING_ID:
        fail("E_BASE_PIN", "inventory pin")
    scope = inventory.get("research_scope", {})
    if scope.get("target_count") != 57 or scope.get("target_id_count") != 57 or scope.get("target_source_path_count") != 57 or scope.get("target_ids") != sorted(ids) or scope.get("target_source_paths") != sorted(paths) or scope.get("target_ids_sha256") != tagged("\n".join(sorted(ids)).encode()) or scope.get("target_source_paths_sha256") != tagged("\n".join(sorted(paths)).encode()):
        fail("E_TARGET_SET", "inventory scope")
    sets = research_sets()
    target_ids, target_paths = set(ids), set(paths)
    main, p2097 = sets["main"], sets["pr2097"]
    target_sha256s = {record["source_exact"]["sha256"] for record in records}
    target_identities = {(record["asset_id"], record["source_path"], record["source_exact"]["sha256"]) for record in records}
    target_overlaps = {}
    for name, current in (("current_main", main), ("pr2097", p2097)):
        target_overlaps[name] = {
            "asset_ids": len(target_ids & current["ids"]),
            "source_paths": len(target_paths & current["paths"]),
            "source_sha256": len(target_sha256s & current["sha256s"]),
            "identity_triples": len(target_identities & current["identities"]),
        }
    pr_names = ("pr2097",)
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
        "pr2097": {"revision": PR_2097, "new_asset_count": len(new["pr2097"]["ids"]), "new_source_count": len(new["pr2097"]["paths"]), "new_source_sha256_count": len(new["pr2097"]["sha256s"]), "target_overlap": target_overlaps["pr2097"]},
        "open_new_pairwise_overlap": pair_overlaps,
        "open_new_source_sha256_aliases": sha_aliases,
        "target_source_sha256_count": len(target_sha256s),
        "projected_union_count": len(main["ids"] | new_union_ids | target_ids),
        "projected_union_source_count": len(main["paths"] | new_union_paths | target_paths),
        "projected_union_identity_triple_count": len(main["identities"] | new_union_identities | target_identities),
        "projected_union_source_sha256_count": len(main["sha256s"] | new_union_sha256s | target_sha256s),
    }
    expected_overlap_status = {"target_vs_main": target_overlaps["current_main"], "target_vs_pr2097": target_overlaps["pr2097"], "open_new_pairwise": pair_overlaps, "all_asset_id_path_sha_identity_counts_zero": all(not any(value.values()) for value in target_overlaps.values()) and all(not any(value.values()) for value in pair_overlaps.values())}
    if not expected_overlap_status["all_asset_id_path_sha_identity_counts_zero"]:
        fail("E_OVERLAP", "target or pairwise open-PR identity overlap")
    if not same_typed_value(inventory.get("research_union"), expected_union):
        fail("E_RESEARCH_UNION", "ID/path/SHA union counts")
    if not same_typed_value(inventory.get("overlap_status"), expected_overlap_status):
        fail("E_OVERLAP", "inventory overlap")
    expected_input_rows = expected_inputs()
    if not same_typed_value(inventory.get("input_digests"), expected_input_rows):
        fail("E_INPUT_DIGEST", "input set/digest")
    expected_binding_upstream = [{"path": row["path"], "sha256": row["sha256"].split(":", 1)[1], "note": "固定Git objectの静的read-only根拠。静的read-only参照のみ。旧archiveは実行しない"} for row in expected_input_rows if row["revision"] == BASE_REVISION and row["path"] not in OPEN_RESEARCH.values()]
    if not same_typed_value(inventory.get("binding_upstream_paths"), expected_binding_upstream) or not same_typed_value(binding.get("upstream"), expected_binding_upstream):
        fail("E_BINDING_CLOSURE", "upstream closure")
    expected_inventory_values = {
        "schema_revision": 1, "binding_id": BINDING_ID,
        "artifacts": ["scaffold/bindings/SCF-B-0142.json", "scaffold/legacy-research-assets-product-classification-0142/README.md", "scaffold/legacy-research-assets-product-classification-0142/PR-DRAFT.md", "scaffold/legacy-research-assets-product-classification-0142/generate.py", "scaffold/legacy-research-assets-product-classification-0142/validate.py", "scaffold/legacy-research-assets-product-classification-0142/selfcheck.py", "scaffold/legacy-research-assets-product-classification-0142/independent-source-audit.py", "scaffold/legacy-research-assets-product-classification-0142/independent-source-audit.json", "scaffold/legacy-research-assets-product-classification-0142/research-union-snapshot.json", "scaffold/legacy-research-assets-product-classification-0142/inventory.json", "scaffold/legacy-research-assets-product-classification-0142/classification-research.jsonl"],
        "base_revision": BASE_REVISION, "base_source_mode": "all fixed inputs and archive evidence bytes from fixed BASE Git objects",
        "independent_source_audit": {"path": "scaffold/legacy-research-assets-product-classification-0142/independent-source-audit.json", "sha256": tagged(AUDIT.read_bytes()), "record_count": 57, "scope_derivation": "fixed BASE disposition; generated classification, generator, and validator are not audit inputs"},
        "archive_population_count": 4020,
        "research_scope": {"source_prefix": TARGET_PREFIX, "target_count": 57, "target_id_count": 57, "target_source_path_count": 57, "target_ids": sorted(ids), "target_source_paths": sorted(paths), "target_ids_sha256": tagged("\n".join(sorted(ids)).encode()), "target_source_paths_sha256": tagged("\n".join(sorted(paths)).encode())},
        "classification_counts": expected_categories,
        "source_group_counts": {"kimi-review-lane-admission": sum("kimi-review-lane-admission-" in p for p in paths), "kimi-s4-bench": sum("kimi-s4-bench-" in p for p in paths), "kimi-smoke-rerun": sum("kimi-smoke-rerun-" in p for p in paths)},
        "implementation_counts": {"formal_unknown": 57, "legacy_execution_performed_false": 57, "consumer_closure_pending": 57},
        "phase_counts": {"research_candidate_unresolved": sum(bool(phase_by_id[aid][1].get("candidate_phase_targets")) for aid in targets)},
        "wave_evidence": {"scanned_input_count": 50, "target_edge_count": sum(record["wave_evidence"]["edge_count"] for record in records), "direct_edge_status": "none", "input_paths": list(WAVE_PATHS)},
        "research_union": expected_union, "overlap_status": expected_overlap_status,
        "authority_boundary": {"authority_effect": "none", "formal_asset_classification_updated": False, "formal_product_authority": None, "formal_implementation_status": "unknown", "phase_updated": False, "successor_assignment": None, "new_build_allowed": False, "read_mode": "static_git_object_only"},
        "input_digests": expected_input_rows, "binding_upstream_paths": expected_binding_upstream,
        "output_sha256": tagged(LEDGER.read_bytes()),
        "generator_contract": {"archive_runtime_source_test_ci_hook_execution": False, "duplicate_json_keys_rejected": True, "category_partition": ["direct_product_basis", "multi_product_conflict", "insufficient_basis"], "exact_target_set": True, "archive_regular_blob_required": True, "manifest_and_ledger_digest_required": True},
    }
    if not same_typed_value(inventory, expected_inventory_values):
        fail("E_INVENTORY", "inventory must exactly match independent expected values")
    expected_binding = {
        "schema_revision": 1, "id": BINDING_ID, "kind": "scaffold", "title": "固定BASE docs/research/assets/** 57件の四製品責務候補研究", "product": "HELIX-OS", "owner_candidate": "四製品product-boundary研究（正式owner未解決）", "state": "registered",
        "reason": "旧research asset 57件をGit object静的readで機械抽出excerpt、四製品L1/boundary、phase、実装状態、failure、consumerを分離研究する。正式分類、authority、successor、buildを生成しない。",
        "upstream": expected_binding_upstream, "role": "legacy research assets static product-boundary research",
        "obligations": ["固定BASE source blob／MANIFEST／ledger digestを照合する", "独立auditでsource／phase／decision／failure／consumer／waveと四製品L1をjoinする", "四製品候補とformal authorityを分離する", "implementation／phase／consumer closureを未確定として保持する", "current mainと固定#2097 historical HEAD比較点のresearch unionをID／source path／source SHA256で検査する"],
        "connections": {"boundary": "research evidence only; no formal product, phase, implementation, successor, consumer, runtime, merge, or close authority", "consumers": ["四製品product-boundary reviewer", "phase and implementation evidence reviewer", "root next asset batch"], "dependencies": ["fixed BASE disposition and phase ledgers", "fixed BASE archive MANIFEST", "current main research union including merged #2090 and #2094", "fixed historical #2097 HEAD research snapshot"]},
        "operations": {"allowed": ["read fixed BASE and pinned PR Git objects statically", "write research scaffold and registered Binding", "run deterministic generator/validator/selfcheck/scfctl"], "forbidden": ["execute old-generation archive source/runtime/test/hook/adapter/CI", "旧archiveは実行しない", "promote formal product/phase/implementation/consumer authority", "merge/close/deploy"]},
        "artifacts": expected_inventory_values["artifacts"],
        "verification": {"evidence_kind": "scaffold", "scope": ["schema_interface", "deterministic_behavior", "source_revision_stale", "negative_case", "forbidden_write_scope"], "oracles": ["validator independently derives the fixed BASE target set and does not import generator output as an oracle", "independent-source-audit.py independently joins all 57 source blobs, disposition, phase, decision/read-after, wave, failure/consumer, and four current-main L1 records", "validator compares source blob/type/mode/bytes/SHA/MANIFEST/ledger and four product boundary/L1 receipts", "validator checks current main research union including merged #2090/#2094 and fixed historical #2097 HEAD snapshot with target ID/path/SHA and pairwise new-union overlaps", "selfcheck executes exact negative cases and expected error codes", "scfctl validate/stale/residuals and git diff --check"], "negative_cases": ["record/inventory/Binding exact shape and history/bootstrap/phase/human judgment tamper", "strict bool/int/float types; null/list/missing fail-close, including schema_revision", "container null/list/scalar fail-close for records and audit evidence", "binding state/operations/replacement authority promotion", "declared target/wave count and real overlap flag tamper", "source and anchor digest tamper", "phase or implementation promotion", "E_BASE_PIN, E_INPUT_STALE, input/output/audit digest mismatch", "archive mode/MANIFEST and malformed/duplicate-key JSON"]},
        "replacement": {"role_target": None, "formal_artifacts": [], "issue": 0, "status": "pending"}, "created": "2026-09-23", "updated": "2026-09-23",
    }
    if not same_typed_value(binding, expected_binding):
        fail("E_BINDING_CLOSURE", "binding must exactly match registered research contract")
    if inventory.get("authority_boundary") != {"authority_effect": "none", "formal_asset_classification_updated": False, "formal_product_authority": None, "formal_implementation_status": "unknown", "phase_updated": False, "successor_assignment": None, "new_build_allowed": False, "read_mode": "static_git_object_only"}:
        fail("E_AUTHORITY", "binding/inventory boundary")
    output = LEDGER.read_bytes()
    if inventory.get("output_sha256") != tagged(output):
        fail("E_OUTPUT_DIGEST", "classification output")
    print(f"{BINDING_ID} validate PASS records={len(records)} counts={expected_categories} target_edge_count=0")


if __name__ == "__main__":
    verify()
