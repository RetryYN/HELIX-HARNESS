#!/usr/bin/env python3
"""Independently review Bun historical-retain readjudication evidence."""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
from collections import Counter
from pathlib import Path


INPUT = Path("docs/governance/generated/helix-bun-historical-retain-evidence-readjudication-v1.json")
OUTPUT = Path("docs/governance/generated/helix-bun-historical-retain-evidence-independent-review-v1.json")
EXPECTED_INPUT_SHA256 = "6934c8215d70b879c9668feaafc199cc679d6514271ac66a3bd483bcaf5c349a"
CANDIDATE = Path("docs/governance/generated/helix-bun-historical-stale-adjudication-v1.json")
PATH_RE = re.compile(r"(?:src|tests|scripts|docs|\.github)/[A-Za-z0-9_./\\-]+(?:\.[A-Za-z0-9_-]+)?")
ID_RE = re.compile(r"\b(?:HIL|HR-FR-HIL|HAT-HIL|HST-HIL|HAC-HIL)-[A-Z0-9.-]+\b")
SYMBOL_RE = re.compile(r"\b[A-Z][A-Za-z0-9]*(?:Gate|Registry|Engine|Runner|Adapter|Command|Projection|Ledger|Receipt)\b")
SEMANTIC_ANCHOR_RE = re.compile(
    r"verified|evidence|accept|受入|検証|完了|成功|pass|exit|green|decision|決定|rollback|移行|互換|基準",
    re.IGNORECASE,
)
MEANINGFUL_DIRECT_PATH_RE = re.compile(r"^(?:src|tests|scripts|\.github|docs/(?!plans/))/")
EXECUTABLE_PATH_RE = re.compile(r"^(?:src|tests|scripts|\.github)/")
ACTIVE_AUTHORITY_PATH_RE = re.compile(r"^(?:src|tests|scripts|\.github|\.claude|\.codex)/|^(?:package\.json|bun\.lockb?)$")
BUN_COMMAND_RE = re.compile(r"\bbun(?:x)?\s+[^`\n;|]+", re.IGNORECASE)


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def digest(value: object) -> str:
    return sha256_bytes(json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode())


def tokens_for(window: str) -> list[str]:
    values = PATH_RE.findall(window) + ID_RE.findall(window) + SYMBOL_RE.findall(window)
    return sorted({value.rstrip("),.;:`") for value in values if len(value) >= 6 and not value.startswith("PLAN-")})


def git_history(path: str) -> list[str]:
    result = subprocess.run(
        ["git", "log", "-n", "20", "--format=%H", "--", path],
        check=True,
        capture_output=True,
        text=True,
    )
    return [line for line in result.stdout.splitlines() if line]


def main() -> None:
    input_bytes = INPUT.read_bytes()
    input_sha = sha256_bytes(input_bytes)
    if input_sha != EXPECTED_INPUT_SHA256:
        raise SystemExit(f"input custody drift: {input_sha}")
    source = json.loads(input_bytes)
    candidate = json.loads(CANDIDATE.read_text(encoding="utf-8"))
    candidate_by_id = {row["atom_id"]: row for row in candidate["records"]}
    manifest = source["search_contract"]["manifest"]
    manifest_digest = digest(manifest)
    snapshot_scope_valid = (
        len(manifest) == 2154
        and source["search_contract"]["scope_files"] == 2154
        and manifest_digest == source["search_contract"]["scope_sha256"]
    )
    manifest_paths = {item["path"] for item in manifest}
    active_texts = {
        item["path"]: Path(item["path"]).read_text(encoding="utf-8", errors="replace")
        for item in manifest
        if ACTIVE_AUTHORITY_PATH_RE.match(item["path"]) and Path(item["path"]).is_file()
    }
    history_cache: dict[str, list[str]] = {}
    findings = []
    for row in source["records"]:
        path = Path(row["source"]["path"])
        lines = path.read_text(encoding="utf-8").splitlines()
        index = row["source"]["line"] - 1
        window_start = max(0, index - 4)
        window_end = min(len(lines), index + 5)
        window = "\n".join(lines[window_start:window_end])
        line_text = lines[index]
        reconstructed_tokens = tokens_for(window)
        recorded_tokens = row["semantic_trace"]["linked_tokens"]
        plan_stem_violation = any(token.startswith("PLAN-") for token in recorded_tokens)
        token_binding_valid = reconstructed_tokens == recorded_tokens
        meaningful_consumers = []
        for evidence in row["semantic_trace"]["token_evidence"]:
            token = evidence["token"]
            if evidence["current_path_exists"] and token in manifest_paths and MEANINGFUL_DIRECT_PATH_RE.match(token):
                meaningful_consumers.append({"token": token, "path": token, "kind": "direct_current_path"})
            for hit in evidence["hits"]:
                if EXECUTABLE_PATH_RE.match(hit["path"]):
                    meaningful_consumers.append({"token": token, "path": hit["path"], "kind": "executable_consumer"})
        meaningful_consumers = sorted(
            {json.dumps(item, sort_keys=True): item for item in meaningful_consumers}.values(),
            key=lambda item: (item["token"], item["path"], item["kind"]),
        )
        semantic_anchor = bool(SEMANTIC_ANCHOR_RE.search(window))
        history = history_cache.setdefault(str(path), git_history(str(path)))
        history_valid = history == row["git_history"]["commits"] and digest(history) == row["git_history"]["commit_set_sha256"]
        receipt = row["custody_receipt_candidate"]
        receipt_body = {key: value for key, value in receipt.items() if key not in {"receipt_sha256", "retention"}}
        receipt_valid = digest(receipt_body) == receipt["receipt_sha256"]
        source_binding_valid = sha256_bytes(path.read_bytes()) == row["source"]["file_sha256"]
        candidate_row = candidate_by_id.get(row["atom_id"])
        source_atom_binding_valid = bool(candidate_row) and (
            candidate_row["custody_retention_design_receipt"]["source_atom_sha256"]
            == receipt["source_atom_sha256"]
        )
        commands = sorted({match.group(0).strip().rstrip(".,)") for match in BUN_COMMAND_RE.finditer(line_text)})
        active_authority_hits = sorted(
            {
                (command, active_path)
                for command in commands
                for active_path, text in active_texts.items()
                if command in text
            }
        )
        support = all(
            [
                not plan_stem_violation,
                token_binding_valid,
                bool(recorded_tokens),
                bool(meaningful_consumers),
                semantic_anchor,
                history_valid,
                receipt_valid,
                source_binding_valid,
                source_atom_binding_valid,
                snapshot_scope_valid,
            ]
        )
        original = row["adjudication"]
        if original == "immutable_historical_retain" and support:
            review_decision = "retain_supported"
        elif original == "immutable_historical_retain":
            review_decision = "retain_overclassified_challenge_required"
        elif original == "explicit_challenge" and not support:
            review_decision = "challenge_supported"
        else:
            review_decision = "challenge_retain_candidate"
        issues = []
        if plan_stem_violation:
            issues.append("plan_stem_used_as_evidence")
        if not token_binding_valid:
            issues.append("linked_tokens_not_exactly_from_plus_minus_4")
        if not recorded_tokens:
            issues.append("line_specific_linked_id_path_symbol_missing")
        if not meaningful_consumers:
            issues.append("current_semantic_consumer_missing")
        if not semantic_anchor:
            issues.append("historical_bun_command_plus_current_path_without_retention_semantics")
        if not history_valid:
            issues.append("git_20_commit_custody_mismatch")
        if not receipt_valid:
            issues.append("custody_receipt_digest_mismatch")
        if not source_binding_valid:
            issues.append("source_file_digest_mismatch")
        if not source_atom_binding_valid:
            issues.append("source_atom_custody_mismatch")
        if active_authority_hits:
            issues.append("exact_historical_bun_command_present_on_active_authority_surface")
        findings.append(
            {
                "atom_id": row["atom_id"],
                "source": {"path": str(path), "line": row["source"]["line"]},
                "original_adjudication": original,
                "review_decision": review_decision,
                "issues": issues,
                "plus_minus_4": {
                    "start_line": window_start + 1,
                    "end_line": window_end,
                    "sha256": sha256_bytes(window.encode()),
                    "reconstructed_tokens": reconstructed_tokens,
                    "semantic_retention_anchor": semantic_anchor,
                },
                "meaningful_current_consumers": meaningful_consumers,
                "active_authority_hits": [
                    {"command": command, "path": active_path} for command, active_path in active_authority_hits
                ],
                "git_history_20_valid": history_valid,
                "custody_receipt_valid": receipt_valid,
                "source_atom_binding_valid": source_atom_binding_valid,
                "runtime_mutation": False,
                "verified": False,
                "coverage_credit": False,
            }
        )
    counts = Counter(item["review_decision"] for item in findings)
    issue_counts = Counter(issue for item in findings for issue in item["issues"])
    output = {
        "schema_version": "helix.bun-historical-retain-evidence-independent-review.v1",
        "status": "independent_semantic_review_complete_corrections_proposal_only",
        "generated_at": "2026-07-16",
        "source": {"path": str(INPUT), "sha256": input_sha},
        "review_contract": {
            "denominator": 333,
            "source_window": "exact source line plus/minus 4 lines",
            "plan_stem_as_evidence": "forbidden",
            "current_path_alone": "insufficient",
            "git_history": "current git log -n 20 for each source path",
            "snapshot_scope": "validate the embedded 2,154-file manifest and digest",
            "fail_close": "unsupported retain becomes challenge_required; no supersede/retire",
        },
        "scope_audit": {
            "expected_files": 2154,
            "observed_files": len(manifest),
            "recorded_sha256": source["search_contract"]["scope_sha256"],
            "reconstructed_sha256": manifest_digest,
            "valid": snapshot_scope_valid,
        },
        "summary": {
            "rows": len(findings),
            **dict(sorted(counts.items())),
            "issue_counts": dict(sorted(issue_counts.items())),
            "plan_stem_violations": sum("plan_stem_used_as_evidence" in item["issues"] for item in findings),
            "invalid_custody_receipts": sum(not item["custody_receipt_valid"] for item in findings),
            "invalid_source_atom_bindings": sum(not item["source_atom_binding_valid"] for item in findings),
            "active_authority_leak_candidates": sum(bool(item["active_authority_hits"]) for item in findings),
            "runtime_mutations": 0,
            "verified_true": 0,
            "coverage_credit_true": 0,
        },
        "correction_policy": {
            "retain_overclassified_challenge_required": "change adjudication to explicit_challenge before any terminal custody receipt",
            "challenge_retain_candidate": "requires independent human/runtime judgement before retain",
            "supersede_or_retire": "forbidden by this review",
        },
        "findings": findings,
    }
    if len(findings) != 333 or len({item["atom_id"] for item in findings}) != 333:
        raise SystemExit("333-row denominator/identity invariant failed")
    if not snapshot_scope_valid:
        raise SystemExit("2,154-file snapshot scope custody failed")
    if any(item["runtime_mutation"] or item["verified"] or item["coverage_credit"] for item in findings):
        raise SystemExit("runtime/verification/coverage invariant failed")
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
