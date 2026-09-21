#!/usr/bin/env python3
"""RDP-001 holding外67 pathのread-only静的検証。"""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
REPORT_PATH = HERE / "report.json"
BINDING_PATH = ROOT / "scaffold" / "bindings" / "SCF-B-0023.json"
BASELINE = "6fabd12512a3659fff4a956692cdd61faeeb16ce"
PRE_ISOLATION = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
HOLDING_PATH = "docs/governance/pre-isolation-revision-delta-source-holding.jsonl"
CATALOG_PATH = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
ARCHIVE_ROOT = "archive/legacy-generation-2026-09-14/root"
EXPECTED_PATH_SET_SHA256 = "fdcc60e7354a32d77b2ca563461a26737867a8f07ad41b64e01e707330ca9381"
EXPECTED_DENOMINATORS = {
    "pre_isolation_tree_file_count": 4092,
    "archive_root_tree_file_count": 4020,
    "archive_root_gap": 72,
    "full_baseline_to_pre_diff_path_count": 400,
    "full_baseline_to_pre_diff_hunk_count": 492,
    "holding_record_count": 333,
    "holding_existing_path_record_count": 333,
    "holding_external_new_path_count": 67,
    "external_status_A_count": 67,
    "archive_commit_exact_path_count": 67,
    "archive_commit_same_blob_count": 39,
    "archive_commit_changed_blob_count": 28,
    "archive_root_present_count": 0,
    "legacy_catalog_record_count": 0,
    "current_main_path_present_count": 8,
    "current_main_same_blob_count": 2,
    "current_main_changed_blob_count": 6,
    "current_main_absent_count": 59,
}
EXPECTED_PRODUCT_COUNTS = {
    "HELIX-HARNESS": 4,
    "HELIX-OS": 4,
    "HELIX-Web": 4,
    "HELIX-Web-OS": 4,
    "shared-cross-product": 51,
}
EXPECTED_PHASE_COUNTS = {
    "L1-planning": 4,
    "L11-acceptance": 5,
    "L2-requirements": 6,
    "shared-design": 4,
    "upstream-governance-or-crosswalk": 48,
}
REQUIRED_READ_SOURCES = {
    "AGENTS.md",
    "docs/governance/new-generation-start-here.md",
    "docs/governance/audits/source-rebaseline/pre-isolation-revision-delta-audit-2026-09-16.md",
    "docs/governance/management-provisional-requirement-registration.md",
    HOLDING_PATH,
    "PR #1957",
}


def run_git(args: list[str], check: bool = True) -> str:
    result = subprocess.run(["git", *args], cwd=ROOT, text=True, capture_output=True, check=False)
    if check and result.returncode:
        raise RuntimeError(result.stderr.strip() or "git command failed")
    return result.stdout.strip()


def git_oid(commit: str, path: str) -> str | None:
    result = subprocess.run(
        ["git", "rev-parse", f"{commit}:{path}"],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    return result.stdout.strip() if result.returncode == 0 else None


def tree_paths(commit: str) -> set[str]:
    return set(run_git(["ls-tree", "-r", "--name-only", commit]).splitlines())


def read_json(path: Path, errors: list[str]) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"JSONを読めない: {path}: {exc}")
        return {}
    if not isinstance(value, dict):
        errors.append(f"JSONがobjectではない: {path}")
        return {}
    return value


def read_jsonl(path: Path, errors: list[str]) -> list[dict]:
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as exc:
        errors.append(f"JSONLを読めない: {path}: {exc}")
        return []
    records: list[dict] = []
    for no, line in enumerate(lines, 1):
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append(f"JSONL不正 {path}:{no}: {exc}")
            continue
        if isinstance(value, dict):
            records.append(value)
        else:
            errors.append(f"JSONL recordがobjectではない {path}:{no}")
    return records


def classify(path: str) -> tuple[str, str, str]:
    product = "shared-cross-product"
    for prefix, candidate in (
        ("docs/design/harness/", "HELIX-HARNESS"),
        ("docs/test-design/harness/", "HELIX-HARNESS"),
        ("docs/design/helix-os/", "HELIX-OS"),
        ("docs/test-design/helix-os/", "HELIX-OS"),
        ("docs/design/helix-web-os/", "HELIX-Web-OS"),
        ("docs/test-design/helix-web-os/", "HELIX-Web-OS"),
        ("docs/design/helix-web/", "HELIX-Web"),
        ("docs/test-design/helix-web/", "HELIX-Web"),
    ):
        if path.startswith(prefix):
            product = candidate
            break
    if "/L1-planning/" in path:
        phase = "L1-planning"
    elif "/L2-requirements/" in path:
        phase = "L2-requirements"
    elif path.startswith("docs/test-design/"):
        phase = "L11-acceptance"
    elif path.startswith("docs/governance/"):
        phase = "upstream-governance-or-crosswalk"
    else:
        phase = "shared-design"
    artifact = "design-patch" if path.endswith(".jsonpatch") else ("markdown" if path.endswith(".md") else "document")
    return product, phase, artifact


def canonical_path_sha256(paths: list[str]) -> str:
    payload = json.dumps(sorted(paths), ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def validate(report: dict | None = None) -> list[str]:
    errors: list[str] = []
    if report is None:
        report = read_json(REPORT_PATH, errors)
    binding = read_json(BINDING_PATH, errors)
    holding = read_jsonl(ROOT / HOLDING_PATH, errors)
    catalog = read_jsonl(ROOT / CATALOG_PATH, errors)
    holding_paths = {record.get("source_path") for record in holding}
    catalog_counts = Counter(record.get("source_path") for record in catalog)

    if report.get("schema") != "rdp001-preisolation-outside-holding-audit.v1":
        errors.append("report schema不正")
    if report.get("status") != "findings_only":
        errors.append("findings_only境界が変更されている")
    if report.get("authority_effect") != "none":
        errors.append("authority_effectはnoneに固定する")
    if report.get("binding_created") is not True or report.get("binding_id") != "SCF-B-0023":
        errors.append("SCF-B-0023登録境界が欠落している")
    if report.get("binding_state") != "registered":
        errors.append("SCF-B-0023はregisteredに固定する")
    if report.get("scope", {}).get("old_archive_execution") is not False:
        errors.append("旧archive実行境界がtrueになっている")
    if not REQUIRED_READ_SOURCES.issubset(set(report.get("read_sources", []))):
        errors.append("必須read sourceの記録が欠落している")

    if len(holding) != 333:
        errors.append(f"holding record数不一致: {len(holding)}")
    diff_lines = run_git(["diff", "--name-status", BASELINE, PRE_ISOLATION]).splitlines()
    diff_rows = [line.split("\t", 1) for line in diff_lines if "\t" in line]
    external = sorted(path for status, path in diff_rows if status == "A" and path not in holding_paths)
    if len(external) != 67:
        errors.append(f"holding外status A数不一致: {len(external)}")
    if canonical_path_sha256(external) != report.get("external_path_set_sha256") or report.get("external_path_set_sha256") != EXPECTED_PATH_SET_SHA256:
        errors.append("holding外path set digest不一致")

    rows = report.get("rows")
    if not isinstance(rows, list) or len(rows) != 67:
        errors.append("report rowsは67件に固定する")
        rows = rows if isinstance(rows, list) else []
    by_path = {row.get("path"): row for row in rows if isinstance(row, dict)}
    if len(by_path) != 67:
        errors.append("report pathの重複または欠落")
    if sorted(by_path) != external:
        errors.append("report path setがGit diffと不一致")

    archive_paths = tree_paths(ARCHIVE)
    archive_root_paths = {path[len(ARCHIVE_ROOT) + 1:] for path in archive_paths if path.startswith(ARCHIVE_ROOT + "/")}
    current = report.get("scope", {}).get("current_main_commit")
    if not current:
        errors.append("current_main_commitが欠落")
        current = "origin/main"
    expected_rows = []
    for path in external:
        row = by_path.get(path)
        if row is None:
            continue
        pre = git_oid(PRE_ISOLATION, path)
        archived = git_oid(ARCHIVE, path)
        current_oid = git_oid(current, path)
        current_state = "absent" if current_oid is None else ("same" if current_oid == pre else "changed")
        archive_relation = "same" if archived == pre else ("different" if archived else "absent")
        product, phase, artifact = classify(path)
        expected = {
            "diff_status": "A",
            "artifact_kind": artifact,
            "product_scope": product,
            "phase_scope": phase,
            "implementation_evidence": "none_path_only",
            "pre_isolation_blob_oid": pre,
            "archive_commit_blob_oid": archived,
            "archive_blob_relation": archive_relation,
            "archive_root_present": path in archive_root_paths,
            "legacy_catalog_record_count": catalog_counts[path],
            "current_main_state": current_state,
        }
        for key, value in expected.items():
            if row.get(key) != value:
                errors.append(f"row {path} の {key} が不一致")
        if row.get("classification_state") != "path_based_candidate_only":
            errors.append(f"row {path} の分類境界が変更されている")
        if row.get("implementation_evidence") != "none_path_only":
            errors.append(f"row {path} に実装証拠を追加できない")
        expected_rows.append(row)

    hunk_count = sum(line.startswith("@@ ") for line in run_git(["diff", "--unified=0", BASELINE, PRE_ISOLATION]).splitlines())
    actual_denominators = {
        "pre_isolation_tree_file_count": len(tree_paths(PRE_ISOLATION)),
        "archive_root_tree_file_count": len(archive_root_paths),
        "archive_root_gap": len(tree_paths(PRE_ISOLATION)) - len(archive_root_paths),
        "full_baseline_to_pre_diff_path_count": len(diff_lines),
        "full_baseline_to_pre_diff_hunk_count": hunk_count,
        "holding_record_count": len(holding),
        "holding_existing_path_record_count": len(holding_paths),
        "holding_external_new_path_count": len(external),
        "external_status_A_count": sum(status == "A" for status, _ in diff_rows),
        "archive_commit_exact_path_count": sum(git_oid(ARCHIVE, path) is not None for path in external),
        "archive_commit_same_blob_count": sum(git_oid(ARCHIVE, path) == git_oid(PRE_ISOLATION, path) for path in external),
        "archive_commit_changed_blob_count": sum(git_oid(ARCHIVE, path) not in (None, git_oid(PRE_ISOLATION, path)) for path in external),
        "archive_root_present_count": sum(path in archive_root_paths for path in external),
        "legacy_catalog_record_count": sum(catalog_counts[path] for path in external),
        "current_main_path_present_count": sum(row.get("current_main_state") != "absent" for row in expected_rows),
        "current_main_same_blob_count": sum(row.get("current_main_state") == "same" for row in expected_rows),
        "current_main_changed_blob_count": sum(row.get("current_main_state") == "changed" for row in expected_rows),
        "current_main_absent_count": sum(row.get("current_main_state") == "absent" for row in expected_rows),
    }
    for key, value in EXPECTED_DENOMINATORS.items():
        if actual_denominators.get(key) != value or report.get("denominators", {}).get(key) != value:
            errors.append(f"denominator不一致: {key} actual={actual_denominators.get(key)} report={report.get('denominators', {}).get(key)}")

    aggregate = report.get("aggregate_classification", {})
    product_counts = dict(sorted(Counter(row.get("product_scope") for row in expected_rows).items()))
    phase_counts = dict(sorted(Counter(row.get("phase_scope") for row in expected_rows).items()))
    if product_counts != EXPECTED_PRODUCT_COUNTS or aggregate.get("product_scope_counts") != EXPECTED_PRODUCT_COUNTS:
        errors.append("product分類数不一致")
    if phase_counts != EXPECTED_PHASE_COUNTS or aggregate.get("phase_scope_counts") != EXPECTED_PHASE_COUNTS:
        errors.append("phase分類数不一致")

    if binding.get("id") != "SCF-B-0023" or binding.get("state") != "registered":
        errors.append("SCF-B-0023 binding state不正")
    if binding.get("product") != "HELIX-HARNESS":
        errors.append("binding host product不正")
    roles = []
    for path in sorted((ROOT / "scaffold" / "bindings").glob("SCF-B-*.json")):
        other = read_json(path, errors)
        if other.get("state") != "retired":
            roles.append((other.get("id"), other.get("role")))
    if sum(role == binding.get("role") for _, role in roles) != 1:
        errors.append("SCF-B-0023 roleがuniqueではない")
    for upstream in binding.get("upstream", []):
        path = upstream.get("path")
        actual = hashlib.sha256((ROOT / path).read_bytes()).hexdigest() if isinstance(path, str) and (ROOT / path).is_file() else None
        if actual != upstream.get("sha256"):
            errors.append(f"binding upstream digest不一致: {path}")
    expected_artifacts = {
        "scaffold/pre-isolation-outside-holding-67/README.md",
        "scaffold/pre-isolation-outside-holding-67/report.json",
        "scaffold/pre-isolation-outside-holding-67/validate.py",
        "scaffold/pre-isolation-outside-holding-67/selfcheck.py",
    }
    if not expected_artifacts.issubset(set(binding.get("artifacts", []))):
        errors.append("binding artifactsが候補4ファイルを包含していない")
    return errors


def main() -> int:
    errors = validate()
    for error in errors:
        print("ERROR:", error)
    print("PASS" if not errors else f"FAIL errors={len(errors)}")
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
