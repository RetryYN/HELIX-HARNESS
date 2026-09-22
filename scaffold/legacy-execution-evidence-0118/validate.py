#!/usr/bin/env python3
"""Fail-closed validator for the fixed-base receipt partition."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-execution-evidence-0118"
BASE_REVISION = "44d546a40d2b4fa88701faf93ea8b618f4f1b86c"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
CROSSWALK = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
PHASE_CLASSIFICATION = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
SELECTION_REGEX = r"(?:\.vitest\.log$|/vitest-targeted|test-result|receipt\.json$|full-receipt)"
WAVE_PATHS = {
    n: (
        f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl"
        if n <= 36
        else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl"
    )
    for n in range(1, 51)
}
GLOBAL_INPUTS = [
    DISPOSITION,
    CROSSWALK,
    DECOMPOSITION,
    DECISIONS,
    READ_AFTER,
    PHASE_CLASSIFICATION,
    "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md",
    "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md",
    "docs/governance/legacy-asset-decision-log.md",
    "docs/governance/legacy-asset-reuse-control.md",
    "docs/governance/new-generation-start-here.md",
    "archive/legacy-generation-2026-09-14/MANIFEST.sha256",
]
INPUT_PATHS = [*WAVE_PATHS.values(), *GLOBAL_INPUTS]
ANCHOR_REGEX = re.compile(
    r"(?:Test Files|Tests\s+\d|vitest exit|fatal:|numTotalTestSuites|numPassedTestSuites|"
    r"numFailedTestSuites|numTotalTests|numPassedTests|numFailedTests|head_sha|base_sha|tested_merge_head)",
    re.IGNORECASE,
)
TOP_LEVEL_KEYS = {
    "acceptance_binding",
    "asset_id",
    "asset_role",
    "authority_effect",
    "counter_evidence",
    "current_implementation",
    "degradation",
    "execution_observation",
    "failure_observation",
    "implementation",
    "legacy_history_binding",
    "legacy_status",
    "ledger_record",
    "product_unit_binding",
    "requirement_binding",
    "result_observation",
    "source_exact",
    "unresolved",
}
INVENTORY_TOP_LEVEL_KEYS = {
    "schema_revision",
    "binding_id",
    "bundle_kind",
    "base_revision",
    "base_source_mode",
    "authority_boundary",
    "scope",
    "selection",
    "anchor_rule",
    "exploration",
    "input_digests",
    "expected_asset_count",
    "output_sha256",
}
EXPECTED_BUNDLE_KIND = "research_scaffold_asset_level_receipt_partition"
EXPECTED_ASSET_COUNT = 28


def fail(code: str, message: str) -> None:
    raise AssertionError(f"{code}: {message}")


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def tagged(data: bytes) -> str:
    return "sha256:" + sha(data)


def canonical(value: object) -> str:
    return tagged(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def git_bytes(path: str) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{BASE_REVISION}:{path}"], cwd=ROOT, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as exc:
        fail("E_BASE_SOURCE", f"missing fixed-base object {path}: {exc}")


def git_blob(path: str) -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", f"{BASE_REVISION}:{path}"], cwd=ROOT, text=True, stderr=subprocess.PIPE).strip()
    except subprocess.CalledProcessError as exc:
        fail("E_BASE_SOURCE", f"missing fixed-base blob {path}: {exc}")


def base_rows(path: str) -> list[tuple[int, dict]]:
    return [(line_no, json.loads(line)) for line_no, line in enumerate(git_bytes(path).decode().splitlines(), 1) if line.strip()]


def local_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text())
    except (OSError, json.JSONDecodeError) as exc:
        fail("E_SCHEMA", f"cannot read JSON {path}: {exc}")


def local_jsonl(path: Path) -> list[dict]:
    try:
        return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]
    except (OSError, json.JSONDecodeError) as exc:
        fail("E_SCHEMA", f"cannot read JSONL {path}: {exc}")


def source_anchors(path: str, data: bytes) -> list[dict]:
    lines = data.decode(errors="replace").splitlines()
    indices = [i for i, line in enumerate(lines, 1) if ANCHOR_REGEX.search(line)]
    if not indices:
        indices = [i for i, line in enumerate(lines, 1) if line.strip()][:1] or [1]
    return [
        {"line": i, "line_text_sha256": tagged(lines[i - 1].encode()), "line_preview": lines[i - 1][:240]}
        for i in indices
    ]



def _oracle_nonnegative_int(parsed: dict, key: str) -> int | None:
    value = parsed.get(key)
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        return None
    return value


def oracle_source_observation(data: bytes, anchors: list[dict]) -> tuple[dict, dict, dict]:
    """Validator-side expected classifier; deliberately does not import generator code."""
    text = data.decode(errors="replace")
    lines = text.splitlines()
    anchor_lines = [item["line"] for item in anchors]
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        parsed = None

    def failure(markers: list[str]) -> dict:
        return {
            "status": "observed_asset_level" if markers else "not_observed_in_asset",
            "marker_lines": markers[:32],
            "reason": (
                "static asset contains failure/error/nonzero-exit marker; it is not a unit-level degradation or failure verdict"
                if markers
                else "no failure/error marker was observed in this asset; absence does not prove success"
            ),
            "unit_level_verdict": None,
        }

    if isinstance(parsed, dict) and "head_sha" in parsed:
        identity = {key: parsed.get(key) for key in ("head_sha", "base_sha", "tested_merge_head")}
        return (
            {
                "status": "observed_asset_level",
                "kind": "ci_merge_head_receipt",
                "fields": identity,
                "unit_level_verdict": None,
            },
            failure([]),
            {
                "status": "asset_level_identity_only",
                "verdict": None,
                "reason": (
                    "head/base/tested merge identity is recorded without a test verdict or acceptance verdict"
                    if all(identity[key] not in (None, "") for key in identity)
                    else "identity receipt is incomplete and has no test verdict or acceptance verdict"
                ),
                "anchor_lines": anchor_lines,
            },
        )

    summary_keys = (
        "numTotalTestSuites", "numPassedTestSuites", "numFailedTestSuites", "numPendingTestSuites", "numTodoTestSuites",
        "numTotalTests", "numPassedTests", "numFailedTests", "numPendingTests", "numTodoTests",
    )
    required = ("numTotalTests", "numPassedTests", "numFailedTests", "numPendingTests", "numTodoTests")
    if isinstance(parsed, dict) and "numTotalTestSuites" in parsed:
        fields = {key: parsed[key] for key in summary_keys if key in parsed}
        counts = {key: _oracle_nonnegative_int(parsed, key) for key in required}
        suite_counts = {key: _oracle_nonnegative_int(parsed, key) for key in ("numTotalTestSuites", "numPassedTestSuites", "numFailedTestSuites", "numPendingTestSuites")}
        suite_todo = _oracle_nonnegative_int(parsed, "numTodoTestSuites")
        suite_complete = all(value is not None for value in suite_counts.values()) and (
            ("numTodoTestSuites" not in parsed or suite_todo is not None)
        ) and (
            suite_counts["numPassedTestSuites"]
            + suite_counts["numFailedTestSuites"]
            + suite_counts["numPendingTestSuites"]
            + (suite_todo or 0)
            == suite_counts["numTotalTestSuites"]
        )
        suite_failed = suite_counts["numFailedTestSuites"] or 0
        test_failed = _oracle_nonnegative_int(parsed, "numFailedTests") or 0
        pending = (suite_counts["numPendingTestSuites"] or 0) + (_oracle_nonnegative_int(parsed, "numPendingTests") or 0)
        positive_success = (_oracle_nonnegative_int(parsed, "numPassedTests") or 0) > 0 and (suite_counts["numPassedTestSuites"] or 0) > 0
        failed_markers = [lines[0].strip()] if suite_failed + test_failed else []
        base_result = {
            "status": "asset_level_test_result_only",
            "verdict": None,
            "fields": fields,
            "anchor_lines": anchor_lines,
        }
        if failed_markers:
            result = {**base_result, "reason": "contradictory success and failure counts prevent a pass verdict" if positive_success else "explicit failure count prevents a pass verdict"}
        elif any(counts[key] is None for key in required) or not suite_complete:
            result = {**base_result, "reason": "required test counts are missing or invalid; result is unknown"}
        elif sum(counts[key] for key in ("numPassedTests", "numFailedTests", "numPendingTests", "numTodoTests")) != counts["numTotalTests"]:
            result = {**base_result, "reason": "test counts are inconsistent; result is unknown"}
        elif not positive_success:
            result = {**base_result, "reason": "no positive successful test count is present; result is unknown"}
        elif pending:
            result = {**base_result, "verdict": "pass_with_pending", "reason": "explicit pending count prevents a complete pass verdict"}
        else:
            result = {**base_result, "verdict": "pass_observed", "reason": "complete zero-failure counts are observed only at asset level"}
        return (
            {
                "status": "observed_asset_level",
                "kind": "vitest_json_summary",
                "fields": fields,
                "unit_level_verdict": None,
            },
            failure(failed_markers),
            result,
        )

    pass_pattern = re.compile(r"^\s*(?:Test Files|Tests)\s+(\d+)\s+passed(?:\s+\(\d+\))?\s*$", re.IGNORECASE)
    failed_count_pattern = re.compile(r"(?<!\d)(\d+)\s+failed\b", re.IGNORECASE)
    exit_pattern = re.compile(r"\b(?:vitest\s+exit|exit\s+code|exited\s+with\s+code)\s*(?:=|:)?\s*(-?\d+)(?!\w)", re.IGNORECASE)
    failure_pattern = re.compile(r"\b(?:fatal|error|failure|fail|failed|segmentation\s+fault)\b", re.IGNORECASE)
    zero_failure_line = re.compile(r"(?<!\d)0\s+(?:errors?|fail(?:ed|ure)s?)\b", re.IGNORECASE)
    passed = [line.strip() for line in lines if pass_pattern.search(line)]
    passed_counts = [int(match.group(1)) for line in lines if (match := pass_pattern.search(line))]
    exits = [line.strip() for line in lines if exit_pattern.search(line)]
    failed_counts = [int(match.group(1)) for line in lines if (match := failed_count_pattern.search(line)) and int(match.group(1)) > 0]
    failed = []
    for line in lines:
        match = failed_count_pattern.search(line)
        if ((failure_pattern.search(line) and not zero_failure_line.search(line)) or (match and int(match.group(1)) > 0)):
            if line.strip() not in failed:
                failed.append(line.strip())
    observed = bool(passed or exits or failed)
    execution = {
        "status": "observed_asset_level" if observed else "unknown",
        "kind": "vitest_text_summary" if observed else "unclassified_log",
        "fields": {"passed_summary_lines": passed, "passed_counts": passed_counts, "failed_counts": failed_counts, "exit_lines": exits},
        "unit_level_verdict": None,
    }
    positive_pass = any(count > 0 for count in passed_counts)
    nonzero = []
    for line in exits:
        match = exit_pattern.search(line)
        if match and int(match.group(1)) != 0:
            nonzero.append(line)
    explicit_zero = any((match := exit_pattern.search(line)) and int(match.group(1)) == 0 for line in exits)
    if failed and nonzero:
        reason = "contradictory failure marker and nonzero exit code prevent a pass verdict"
    elif failed and positive_pass:
        reason = "contradictory pass summary and failure marker prevent a pass verdict"
    elif nonzero and positive_pass:
        reason = "contradictory pass summary and nonzero exit code prevent a pass verdict"
    elif failed:
        reason = "explicit failure/error text prevents a pass verdict"
    elif nonzero:
        reason = "nonzero exit code prevents a pass verdict"
    elif positive_pass and not explicit_zero:
        reason = "text pass summary has no explicit exit code 0; result is unknown"
    elif positive_pass:
        reason = "text pass summary has no failure marker or nonzero exit, and remains asset-level only"
    else:
        reason = "no positive test pass summary is present"
    if failed or nonzero:
        result = {
            "status": "asset_level_test_result_only", "verdict": None,
            "reason": reason, "anchor_lines": anchor_lines,
        }
    elif positive_pass and explicit_zero:
        result = {
            "status": "asset_level_test_result_only", "verdict": "pass_observed",
            "reason": reason,
            "anchor_lines": anchor_lines,
        }
    else:
        result = {
            "status": "asset_level_test_result_only" if passed or exits else "no_result_marker", "verdict": None,
            "reason": reason, "anchor_lines": anchor_lines,
        }
    failure_markers = list(failed)
    for line in nonzero:
        if line not in failure_markers:
            failure_markers.append(line)
    return execution, failure(failure_markers), result

def verify_base() -> None:
    validation_head = os.environ.get("SCF_VALIDATION_HEAD", "HEAD")
    if subprocess.run(["git", "merge-base", "--is-ancestor", BASE_REVISION, validation_head], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode:
        fail("E_BASE_NOT_ANCESTOR", f"fixed BASE {BASE_REVISION} is not an ancestor of {validation_head}")


def verify_inventory(inventory: dict, evidence_path: Path) -> tuple[list[dict], list[dict], dict, dict]:
    expected_paths = [*WAVE_PATHS.values(), *GLOBAL_INPUTS]
    if set(inventory) != INVENTORY_TOP_LEVEL_KEYS:
        fail("E_SCHEMA", "inventory top-level key set drift")
    if inventory.get("schema_revision") != 1 or inventory.get("binding_id") != "SCF-B-0118":
        fail("E_SCHEMA", "inventory schema or binding id mismatch")
    if inventory.get("bundle_kind") != EXPECTED_BUNDLE_KIND:
        fail("E_SCHEMA", "inventory bundle_kind drift")
    if inventory.get("expected_asset_count") != EXPECTED_ASSET_COUNT:
        fail("E_SCOPE", "inventory expected_asset_count drift")
    if inventory.get("base_revision") != BASE_REVISION or inventory.get("base_source_mode") != "all input and archive evidence bytes from fixed BASE Git objects":
        fail("E_BASE_PIN", "inventory BASE pin/source mode drift")
    expected_authority = {
        "authority_effect": "none",
        "formal_implementation_claim_updated": False,
        "formal_degradation_claim_updated": False,
        "formal_unimplemented_claim_updated": False,
        "acceptance_verdict_created": False,
        "new_build_allowed": False,
        "status_rule": "unknown_when_direct_unit_evidence_is_missing",
    }
    if inventory.get("authority_boundary") != expected_authority:
        fail("E_AUTHORITY_BOUNDARY", "authority boundary or promotion rule drift")
    actual_inputs = inventory.get("input_digests")
    if not isinstance(actual_inputs, list) or [x.get("path") for x in actual_inputs] != expected_paths or len({x.get("path") for x in actual_inputs}) != len(expected_paths):
        fail("E_INPUT_SET", "fixed-base input path set/order drift")
    for item, path in zip(actual_inputs, expected_paths):
        data = git_bytes(path)
        expected = {"path": path, "blob": git_blob(path), "bytes": len(data), "sha256": tagged(data)}
        if item != expected:
            fail("E_INPUT_DIGEST", f"input digest mismatch {path}")
    if not evidence_path.exists() or inventory.get("output_sha256") != tagged(evidence_path.read_bytes()):
        fail("E_OUTPUT_DIGEST", "evidence output digest mismatch")
    disposition = base_rows(DISPOSITION)
    disposition_rows = [row for _, row in disposition]
    selected = [row for row in disposition_rows if re.search(SELECTION_REGEX, row.get("source_path", ""), re.IGNORECASE)]
    wave_rows = []
    for wave, path in WAVE_PATHS.items():
        wave_rows.extend((wave, path, line_no, row) for line_no, row in base_rows(path))
    decomposition_rows = [row for _, row in base_rows(DECOMPOSITION)]
    product_units = sum(len(row.get("candidate_units", [])) for row in decomposition_rows)
    crosswalk_rows = [row for _, row in base_rows(CROSSWALK)]
    selected_ids = {row["asset_id"] for row in selected}
    direct_ids = set()
    representative_ids = set()
    for row in crosswalk_rows:
        for item in row.get("direct_legacy_asset_links", []):
            direct_ids.add(item if isinstance(item, str) else item.get("asset_id"))
        for item in row.get("representative_legacy_assets", []):
            representative_ids.add(item if isinstance(item, str) else item.get("asset_id"))
    decision_text = json.dumps([row for _, row in base_rows(DECISIONS)], ensure_ascii=False)
    read_after_text = json.dumps([row for _, row in base_rows(READ_AFTER)], ensure_ascii=False)
    expected_scope = {
        "product_units": product_units,
        "source_ids": len(decomposition_rows),
        "wave_files": len(WAVE_PATHS),
        "wave_edges": len(wave_rows),
        "wave_unique_assets": len({row["asset_id"] for _, _, _, row in wave_rows}),
        "legacy_asset_ledger_rows": len(disposition_rows),
        "selected_assets": len(selected),
    }
    if inventory.get("scope") != {
        "product_units": 218,
        "source_ids": 153,
        "wave_files": 50,
        "wave_edges": 598,
        "wave_unique_assets": 355,
        "legacy_asset_ledger_rows": 4020,
        "selected_assets": 28,
    }:
        fail("E_SCOPE", "218 unit / 153 source / 598 edge / 4020 asset scope declaration drift")
    if inventory.get("scope") != expected_scope:
        fail("E_SCOPE", f"scope does not match fixed-base decomposition/Wave/ledger derivation: {expected_scope}")
    if len(selected_ids & {row["asset_id"] for _, _, _, row in wave_rows}) != 0:
        fail("E_EXPLORATION", "a selected asset unexpectedly occurs in Wave edges")
    if selected_ids & direct_ids or selected_ids & representative_ids:
        fail("E_EXPLORATION", "a selected asset unexpectedly has a direct/representative crosswalk link")
    if any(asset_id in decision_text or asset_id in read_after_text for asset_id in selected_ids):
        fail("E_EXPLORATION", "a selected asset unexpectedly has a decision/read-after reference")
    expected_anchor_rule = {
        "regex": ANCHOR_REGEX.pattern,
        "flags": ["IGNORECASE"],
        "fallback": "first non-empty line, or line 1 for an empty object",
        "line_digest": "sha256 of the exact decoded line without a newline",
    }
    if inventory.get("anchor_rule") != expected_anchor_rule:
        fail("E_EXPLORATION", "source anchor rule drift")
    selection = inventory.get("selection")
    expected_selection = {
        "source": DISPOSITION,
        "source_row_order": "fixed-base ledger order",
        "source_path_regex": SELECTION_REGEX,
        "regex_flags": ["IGNORECASE"],
        "selected_asset_ids": [r["asset_id"] for r in selected],
        "selected_asset_ids_sha256": tagged("\n".join(r["asset_id"] for r in selected).encode()),
        "excludes_by_rule": "every ledger row whose source_path does not match the regex; no representative-only sampling",
        "excluded_scope": {
            "nonmatching_ledger_rows": len(disposition_rows) - len(selected),
            "nonmatching_helix_evidence_rows": sum(1 for row in disposition_rows if row.get("source_path", "").startswith(".helix/evidence/") and not re.search(SELECTION_REGEX, row.get("source_path", ""), re.IGNORECASE)),
            "nonmatching_test_source_rows": sum(1 for row in disposition_rows if row.get("source_path", "").startswith("tests/") and not re.search(SELECTION_REGEX, row.get("source_path", ""), re.IGNORECASE)),
            "nonmatching_lint_named_rows": sum(1 for row in disposition_rows if "lint" in row.get("source_path", "").lower() and not re.search(SELECTION_REGEX, row.get("source_path", ""), re.IGNORECASE)),
            "nonmatching_review_head_rows": sum(1 for row in disposition_rows if "/review-" in row.get("source_path", "") and row.get("source_path", "").endswith("head.txt")),
            "examples": ["tests/*.test.ts", ".helix/evidence/review-1600/head.txt", ".helix/evidence/review-1600/biome.log", ".helix/evidence/review-1600/tsc.log"],
        },
    }
    if selection != expected_selection:
        fail("E_EXPLORATION", "selection/search rule or exact asset set drift")
    exploration = inventory.get("exploration")
    if exploration != {
        "search_scope": [
            "all 218 product units from fixed-base decomposition",
            "all 598 Wave1-50 semantic edges and 355 unique Wave assets",
            "all 4,020 fixed-base legacy asset ledger rows",
            "crosswalk direct_legacy_asset_links and representative_legacy_assets",
            "fixed-base legacy decisions and copy read-after records",
        ],
        "negative_findings": {
            "selected_assets_in_wave_edges": 0,
            "selected_assets_in_direct_crosswalk_links": 0,
            "selected_assets_in_representative_crosswalk_links": 0,
            "selected_assets_with_decision_or_read_after_refs": 0,
            "candidate_pool_membership_is_binding": False,
        },
        "prohibition": "do not promote a test pass, lint/fatal line, or receipt identity to unit implementation, degradation, unimplementation, or acceptance",
    }:
        fail("E_EXPLORATION", "exploration scope/counter-evidence declaration drift")
    return selected, disposition_rows, {}, {}


def expected_records(selected: list[dict]) -> list[dict]:
    wave_rows: list[tuple[int, str, int, dict]] = []
    for wave, path in WAVE_PATHS.items():
        wave_rows.extend((wave, path, line_no, row) for line_no, row in base_rows(path))
    wave_by_asset: dict[str, list[dict]] = defaultdict(list)
    for wave, path, line_no, row in wave_rows:
        wave_by_asset[row["asset_id"]].append({"wave": wave, "path": path, "line": line_no})
    crosswalk = [row for _, row in base_rows(CROSSWALK)]
    pool_units: dict[str, set[str]] = defaultdict(set)
    direct: dict[str, set[str]] = defaultdict(set)
    representative: dict[str, set[str]] = defaultdict(set)
    for row in crosswalk:
        unit = row["unit_candidate_id"]
        for asset_id in row.get("candidate_asset_pool", {}).get("phase_and_product_candidate_asset_ids", []):
            pool_units[asset_id].add(unit)
        for field, target in (("direct_legacy_asset_links", direct), ("representative_legacy_assets", representative)):
            for item in row.get(field, []):
                asset_id = item if isinstance(item, str) else item.get("asset_id")
                if asset_id:
                    target[asset_id].add(unit)
    decisions_text = json.dumps([row for _, row in base_rows(DECISIONS)], ensure_ascii=False)
    read_after_text = json.dumps([row for _, row in base_rows(READ_AFTER)], ensure_ascii=False)
    output = []
    for ledger_record in selected:
        asset_id = ledger_record["asset_id"]
        source_path = ledger_record["source_path"]
        archive_path = ARCHIVE_PREFIX + source_path
        source_data = git_bytes(archive_path)
        anchors = source_anchors(archive_path, source_data)
        execution, failure, result = oracle_source_observation(source_data, anchors)
        pool = sorted(pool_units.get(asset_id, set()))
        wave_refs = wave_by_asset.get(asset_id, [])
        direct_refs = sorted(direct.get(asset_id, set()))
        representative_refs = sorted(representative.get(asset_id, set()))
        if asset_id in decisions_text or asset_id in read_after_text:
            fail("E_HISTORY_BINDING", f"unexpected decision/read-after ref for {asset_id}")
        output.append(
            {
                "acceptance_binding": {"status": "absent", "verdict": None, "evidence_refs": [], "reason": "no acceptance verdict or acceptance receipt is directly bound to this asset"},
                "asset_id": asset_id,
                "asset_role": "execution_result_or_receipt_candidate",
                "authority_effect": "none",
                "counter_evidence": [
                    {"kind": "wave_edge_membership", "wave_edge_count": len(wave_refs), "reason": "the selected asset is absent from all 598 Wave semantic edges"},
                    {"kind": "crosswalk_direct_link", "direct_legacy_asset_link_count": len(direct_refs), "representative_legacy_asset_link_count": len(representative_refs), "reason": "candidate pool membership is explicitly search-candidate-only and is not a semantic link"},
                    {"kind": "formal_ledger_state", "implementation_status": ledger_record.get("implementation_status"), "disposition": ledger_record.get("disposition"), "reason": "the fixed-base ledger remains unknown/unresolved"},
                ],
                "current_implementation": {"status": "unknown", "evidence_refs": [], "reason": "no current-path implementation evidence is directly linked by crosswalk, Wave, decision, or read-after records"},
                "degradation": {"status": "unknown", "evidence_refs": [], "reason": "an asset-level failure marker cannot establish unit-level degradation"},
                "execution_observation": execution,
                "failure_observation": failure,
                "implementation": {"status": "unknown", "evidence_refs": [], "reason": "a test result or receipt is not a direct unit implementation proof"},
                "legacy_history_binding": {"decision_refs": [], "read_after_refs": [], "consumer_refs": ledger_record.get("consumer_refs", []), "status": "asset_record_only"},
                "legacy_status": {"implementation": "unknown", "degradation": "unknown", "failure": failure["status"]},
                "ledger_record": ledger_record,
                "product_unit_binding": {"status": "absent", "unit_candidate_ids": [], "evidence_refs": [], "candidate_pool_unit_ids": pool, "candidate_pool_membership_semantics": "search_candidate_only_not_direct_semantic_link", "wave_edge_refs": wave_refs, "direct_crosswalk_unit_refs": direct_refs, "representative_crosswalk_unit_refs": representative_refs, "reason": "no direct semantic edge or direct crosswalk link; candidate pool membership cannot bind an asset to a unit"},
                "requirement_binding": {"status": "absent", "requirement_ids": [], "evidence_refs": [], "reason": "no direct requirement identity is carried by the receipt/result asset or its direct semantic links"},
                "result_observation": result,
                "source_exact": {"archive_path": archive_path, "blob": git_blob(archive_path), "bytes": len(source_data), "line_count": len(source_data.decode(errors="replace").splitlines()), "sha256": tagged(source_data), "ledger_source_sha256": "sha256:" + ledger_record["source_sha256"], "read_mode": "git_object_static_read_only", "anchors": anchors},
                "unresolved": ["unit binding is absent", "requirement identity binding is absent", "acceptance verdict binding is absent", "current implementation evidence is absent", "explicit legacy implementation decision is absent", "explicit unit-level degradation decision is absent"],
            }
        )
    return output


def validate(bundle: Path) -> None:
    global BUNDLE
    BUNDLE = bundle
    inventory = local_json(BUNDLE / "inventory.json")
    evidence_path = BUNDLE / "evidence.jsonl"
    verify_base()
    selected, _, _, _ = verify_inventory(inventory, evidence_path)
    actual = local_jsonl(evidence_path)
    expected = expected_records(selected)
    expected_count = inventory["expected_asset_count"]
    if len(actual) != expected_count or len({row.get("asset_id") for row in actual}) != expected_count or [row.get("asset_id") for row in actual] != [row["asset_id"] for row in expected]:
        fail("E_ASSET_SET", f"evidence must contain each of the {expected_count} selected assets exactly once in ledger order")
    for i, (got, want) in enumerate(zip(actual, expected), 1):
        aid = want["asset_id"]
        if set(got) != TOP_LEVEL_KEYS:
            fail("E_SCHEMA", f"top-level evidence key set drift at {aid}")
        if got["ledger_record"] != want["ledger_record"]:
            fail("E_LEDGER_RECORD", f"full fixed-base ledger record mismatch at {aid}")
        if got["source_exact"] != want["source_exact"]:
            fail("E_SOURCE_EVIDENCE", f"source blob/SHA/anchor mismatch at {aid}")
        binding_codes = {
            "product_unit_binding": "E_UNIT_BINDING",
            "requirement_binding": "E_REQUIREMENT_BINDING",
            "acceptance_binding": "E_ACCEPTANCE_BINDING",
        }
        for field in ("product_unit_binding", "requirement_binding", "acceptance_binding"):
            if got[field] != want[field]:
                fail(binding_codes[field], f"fabricated or altered {field} at {aid}")
        if got["execution_observation"] != want["execution_observation"] or got["failure_observation"] != want["failure_observation"] or got["result_observation"] != want["result_observation"]:
            fail("E_OBSERVATION", f"execution/failure/result observation mismatch at {aid}")
        if got["legacy_status"] != want["legacy_status"] or got["implementation"] != want["implementation"] or got["degradation"] != want["degradation"] or got["current_implementation"] != want["current_implementation"]:
            fail("E_STATUS_PROMOTION", f"implementation/degradation/current status promotion at {aid}")
        if got["legacy_history_binding"] != want["legacy_history_binding"] or got["counter_evidence"] != want["counter_evidence"] or got["unresolved"] != want["unresolved"]:
            fail("E_HISTORY_OR_COUNTER", f"history/counter/unresolved mismatch at {aid}")
        if got["authority_effect"] != "none" or got["asset_role"] != "execution_result_or_receipt_candidate":
            fail("E_AUTHORITY_BOUNDARY", f"authority or role promotion at {aid}")
    print(f"PASS SCF-B-0118: {len(actual)} asset-level receipt records; unit/requirement/acceptance bindings remain absent")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--bundle", type=Path, default=BUNDLE)
    args = parser.parse_args()
    try:
        validate(args.bundle.resolve())
    except AssertionError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
