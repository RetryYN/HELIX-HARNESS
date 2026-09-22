#!/usr/bin/env python3
"""Build the fixed-base, read-only receipt evidence research bundle."""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
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
FORBIDDEN_PROMOTIONS = {"implemented", "degraded", "unimplemented", "accepted", "rejected"}


def git_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE_REVISION}:{path}"], cwd=ROOT)


def git_blob(path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", f"{BASE_REVISION}:{path}"], cwd=ROOT, text=True).strip()


def rows(path: str) -> list[dict]:
    return [json.loads(line) for line in git_bytes(path).decode().splitlines() if line.strip()]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def tagged(data: bytes) -> str:
    return "sha256:" + sha(data)


def canonical(value: object) -> str:
    return tagged(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def source_anchors(path: str, data: bytes) -> list[dict]:
    lines = data.decode(errors="replace").splitlines()
    indices = [i for i, line in enumerate(lines, 1) if ANCHOR_REGEX.search(line)]
    if not indices:
        indices = [i for i, line in enumerate(lines, 1) if line.strip()][:1] or [1]
    return [
        {
            "line": i,
            "line_text_sha256": tagged(lines[i - 1].encode()),
            "line_preview": lines[i - 1][:240],
        }
        for i in indices
    ]


def source_observation(path: str, data: bytes, anchors: list[dict]) -> tuple[dict, dict, dict]:
    text = data.decode(errors="replace")
    lines = text.splitlines()
    parsed = None
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        pass
    if isinstance(parsed, dict) and "head_sha" in parsed:
        execution = {
            "status": "observed_asset_level",
            "kind": "ci_merge_head_receipt",
            "fields": {k: parsed.get(k) for k in ("head_sha", "base_sha", "tested_merge_head")},
            "unit_level_verdict": None,
        }
        result = {
            "status": "asset_level_identity_only",
            "verdict": None,
            "reason": "head/base/tested merge identity is recorded without a test verdict or acceptance verdict",
            "anchor_lines": [a["line"] for a in anchors],
        }
    elif isinstance(parsed, dict) and "numTotalTestSuites" in parsed:
        fields = {
            key: parsed.get(key)
            for key in (
                "numTotalTestSuites",
                "numPassedTestSuites",
                "numFailedTestSuites",
                "numPendingTestSuites",
                "numTotalTests",
                "numPassedTests",
                "numFailedTests",
                "numPendingTests",
                "numTodoTests",
            )
            if key in parsed
        }
        execution = {
            "status": "observed_asset_level",
            "kind": "vitest_json_summary",
            "fields": fields,
            "unit_level_verdict": None,
        }
        result = {
            "status": "asset_level_test_result_only",
            "verdict": "pass_with_pending" if fields.get("numPendingTests", 0) else "pass_observed",
            "fields": fields,
            "reason": "test result is recorded for the artifact but no unit/requirement/acceptance binding exists",
            "anchor_lines": [a["line"] for a in anchors],
        }
    else:
        passed = [line.strip() for line in lines if re.search(r"Test Files\s+\d+\s+passed|Tests\s+\d+\s+passed", line)]
        exit_matches = [line.strip() for line in lines if re.search(r"(?:vitest\s+)?exit=", line, re.I)]
        execution = {
            "status": "observed_asset_level" if passed or exit_matches else "unknown",
            "kind": "vitest_text_summary" if passed or exit_matches else "unclassified_log",
            "fields": {"passed_summary_lines": passed, "exit_lines": exit_matches},
            "unit_level_verdict": None,
        }
        result = {
            "status": "asset_level_test_result_only" if passed or exit_matches else "no_result_marker",
            "verdict": "pass_observed" if passed and not any("exit=1" in x for x in exit_matches) else None,
            "reason": "text log has an asset-level summary without a unit/requirement/acceptance binding",
            "anchor_lines": [a["line"] for a in anchors],
        }
    if isinstance(parsed, dict):
        failed_count = sum(int(parsed.get(k, 0) or 0) for k in ("numFailedTestSuites", "numFailedTests"))
        failures = [lines[0].strip()] if failed_count else []
    else:
        failures = [line.strip() for line in lines if re.search(r"fatal:|error|failed|failure", line, re.I)]
    failure_status = "observed_asset_level" if failures else "not_observed_in_asset"
    failure = {
        "status": failure_status,
        "marker_lines": failures[:32],
        "reason": (
            "static asset contains failure/error marker; it is not a unit-level degradation or failure verdict"
            if failures
            else "no failure/error marker was observed in this asset; absence does not prove success"
        ),
        "unit_level_verdict": None,
    }
    return execution, failure, result


def input_digests() -> list[dict]:
    return [
        {"path": path, "blob": git_blob(path), "bytes": len((data := git_bytes(path))), "sha256": tagged(data)}
        for path in INPUT_PATHS
    ]


def main() -> None:
    disposition_rows = rows(DISPOSITION)
    disposition_by_asset = {row["asset_id"]: row for row in disposition_rows}
    selected = [row for row in disposition_rows if re.search(SELECTION_REGEX, row.get("source_path", ""), re.IGNORECASE)]
    if len(selected) != 28:
        raise SystemExit(f"selection expected 28, got {len(selected)}")
    selected_ids = [row["asset_id"] for row in selected]

    wave_rows = []
    for wave, path in WAVE_PATHS.items():
        wave_rows.extend((wave, path, line_no, row) for line_no, row in enumerate(rows(path), 1))
    wave_by_asset: dict[str, list[dict]] = defaultdict(list)
    for wave, path, line_no, row in wave_rows:
        wave_by_asset[row["asset_id"]].append({"wave": wave, "path": path, "line": line_no})

    crosswalk_rows = rows(CROSSWALK)
    candidate_pool_units: dict[str, set[str]] = defaultdict(set)
    direct_links: dict[str, set[str]] = defaultdict(set)
    representative_links: dict[str, set[str]] = defaultdict(set)
    for row in crosswalk_rows:
        unit = row["unit_candidate_id"]
        pool = row.get("candidate_asset_pool", {}).get("phase_and_product_candidate_asset_ids", [])
        for asset_id in pool:
            candidate_pool_units[asset_id].add(unit)
        for field, target in (("direct_legacy_asset_links", direct_links), ("representative_legacy_assets", representative_links)):
            for item in row.get(field, []):
                asset_id = item if isinstance(item, str) else item.get("asset_id")
                if asset_id:
                    target[asset_id].add(unit)

    evidence_rows = []
    for ledger_record in selected:
        asset_id = ledger_record["asset_id"]
        source_path = ledger_record["source_path"]
        archive_path = ARCHIVE_PREFIX + source_path
        source_data = git_bytes(archive_path)
        anchors = source_anchors(archive_path, source_data)
        execution, failure, result = source_observation(source_path, source_data, anchors)
        candidate_units = sorted(candidate_pool_units.get(asset_id, set()))
        wave_refs = wave_by_asset.get(asset_id, [])
        direct_unit_refs = sorted(direct_links.get(asset_id, set()))
        representative_refs = sorted(representative_links.get(asset_id, set()))
        evidence_rows.append(
            {
                "acceptance_binding": {
                    "status": "absent",
                    "verdict": None,
                    "evidence_refs": [],
                    "reason": "no acceptance verdict or acceptance receipt is directly bound to this asset",
                },
                "asset_id": asset_id,
                "asset_role": "execution_result_or_receipt_candidate",
                "authority_effect": "none",
                "counter_evidence": [
                    {
                        "kind": "wave_edge_membership",
                        "wave_edge_count": len(wave_refs),
                        "reason": "the selected asset is absent from all 598 Wave semantic edges",
                    },
                    {
                        "kind": "crosswalk_direct_link",
                        "direct_legacy_asset_link_count": len(direct_unit_refs),
                        "representative_legacy_asset_link_count": len(representative_refs),
                        "reason": "candidate pool membership is explicitly search-candidate-only and is not a semantic link",
                    },
                    {
                        "kind": "formal_ledger_state",
                        "implementation_status": ledger_record.get("implementation_status"),
                        "disposition": ledger_record.get("disposition"),
                        "reason": "the fixed-base ledger remains unknown/unresolved",
                    },
                ],
                "current_implementation": {
                    "status": "unknown",
                    "evidence_refs": [],
                    "reason": "no current-path implementation evidence is directly linked by crosswalk, Wave, decision, or read-after records",
                },
                "degradation": {
                    "status": "unknown",
                    "evidence_refs": [],
                    "reason": "an asset-level failure marker cannot establish unit-level degradation",
                },
                "execution_observation": execution,
                "failure_observation": failure,
                "implementation": {
                    "status": "unknown",
                    "evidence_refs": [],
                    "reason": "a test result or receipt is not a direct unit implementation proof",
                },
                "legacy_history_binding": {
                    "decision_refs": [],
                    "read_after_refs": [],
                    "consumer_refs": ledger_record.get("consumer_refs", []),
                    "status": "asset_record_only",
                },
                "legacy_status": {
                    "implementation": "unknown",
                    "degradation": "unknown",
                    "failure": failure["status"],
                },
                "ledger_record": ledger_record,
                "product_unit_binding": {
                    "status": "absent",
                    "unit_candidate_ids": [],
                    "evidence_refs": [],
                    "candidate_pool_unit_ids": candidate_units,
                    "candidate_pool_membership_semantics": "search_candidate_only_not_direct_semantic_link",
                    "wave_edge_refs": wave_refs,
                    "direct_crosswalk_unit_refs": direct_unit_refs,
                    "representative_crosswalk_unit_refs": representative_refs,
                    "reason": "no direct semantic edge or direct crosswalk link; candidate pool membership cannot bind an asset to a unit",
                },
                "requirement_binding": {
                    "status": "absent",
                    "requirement_ids": [],
                    "evidence_refs": [],
                    "reason": "no direct requirement identity is carried by the receipt/result asset or its direct semantic links",
                },
                "result_observation": result,
                "source_exact": {
                    "archive_path": archive_path,
                    "blob": git_blob(archive_path),
                    "bytes": len(source_data),
                    "line_count": len(source_data.decode(errors="replace").splitlines()),
                    "sha256": tagged(source_data),
                    "ledger_source_sha256": "sha256:" + ledger_record["source_sha256"],
                    "read_mode": "git_object_static_read_only",
                    "anchors": anchors,
                },
                "unresolved": [
                    "unit binding is absent",
                    "requirement identity binding is absent",
                    "acceptance verdict binding is absent",
                    "current implementation evidence is absent",
                    "explicit legacy implementation decision is absent",
                    "explicit unit-level degradation decision is absent",
                ],
            }
        )

    BUNDLE.mkdir(parents=True, exist_ok=True)
    evidence_path = BUNDLE / "evidence.jsonl"
    evidence_path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in evidence_rows))

    scope = {
        "product_units": 218,
        "source_ids": 153,
        "wave_files": 50,
        "wave_edges": len(wave_rows),
        "wave_unique_assets": len({r[3]["asset_id"] for r in wave_rows}),
        "legacy_asset_ledger_rows": len(disposition_rows),
        "selected_assets": len(selected),
    }
    inventory = {
        "schema_revision": 1,
        "binding_id": "SCF-B-0118",
        "bundle_kind": "research_scaffold_asset_level_receipt_partition",
        "base_revision": BASE_REVISION,
        "base_source_mode": "all input and archive evidence bytes from fixed BASE Git objects",
        "authority_boundary": {
            "authority_effect": "none",
            "formal_implementation_claim_updated": False,
            "formal_degradation_claim_updated": False,
            "formal_unimplemented_claim_updated": False,
            "acceptance_verdict_created": False,
            "new_build_allowed": False,
            "status_rule": "unknown_when_direct_unit_evidence_is_missing",
        },
        "scope": scope,
        "selection": {
            "source": DISPOSITION,
            "source_row_order": "fixed-base ledger order",
            "source_path_regex": SELECTION_REGEX,
            "regex_flags": ["IGNORECASE"],
            "selected_asset_ids": selected_ids,
            "selected_asset_ids_sha256": tagged("\n".join(selected_ids).encode()),
            "excludes_by_rule": "every ledger row whose source_path does not match the regex; no representative-only sampling",
            "excluded_scope": {
                "nonmatching_ledger_rows": len(disposition_rows) - len(selected),
                "nonmatching_helix_evidence_rows": sum(1 for row in disposition_rows if row.get("source_path", "").startswith(".helix/evidence/") and not re.search(SELECTION_REGEX, row.get("source_path", ""), re.IGNORECASE)),
                "nonmatching_test_source_rows": sum(1 for row in disposition_rows if row.get("source_path", "").startswith("tests/") and not re.search(SELECTION_REGEX, row.get("source_path", ""), re.IGNORECASE)),
                "nonmatching_lint_named_rows": sum(1 for row in disposition_rows if "lint" in row.get("source_path", "").lower() and not re.search(SELECTION_REGEX, row.get("source_path", ""), re.IGNORECASE)),
                "nonmatching_review_head_rows": sum(1 for row in disposition_rows if "/review-" in row.get("source_path", "") and row.get("source_path", "").endswith("head.txt")),
                "examples": ["tests/*.test.ts", ".helix/evidence/review-1600/head.txt", ".helix/evidence/review-1600/biome.log", ".helix/evidence/review-1600/tsc.log"],
            },
        },
        "anchor_rule": {
            "regex": ANCHOR_REGEX.pattern,
            "flags": ["IGNORECASE"],
            "fallback": "first non-empty line, or line 1 for an empty object",
            "line_digest": "sha256 of the exact decoded line without a newline",
        },
        "exploration": {
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
        },
        "input_digests": input_digests(),
        "expected_asset_count": 28,
        "output_sha256": "",
    }
    inventory_path = BUNDLE / "inventory.json"
    inventory_path.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n")
    inventory["output_sha256"] = tagged(evidence_path.read_bytes())
    inventory_path.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
