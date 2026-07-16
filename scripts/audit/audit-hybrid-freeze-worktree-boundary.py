#!/usr/bin/env python3
"""Audit the uncommitted boundary of the hybrid requirements freeze worktree."""

import argparse
import hashlib
import json
import re
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "docs/governance/generated/hybrid-freeze-worktree-boundary-independent-audit-v1.json"
GENERATED_INDEX = ROOT / "docs/governance/generated/README.md"
SELF = Path(__file__).resolve()
EXCLUDED = {str(SELF.relative_to(ROOT)), str(OUTPUT.relative_to(ROOT)), str(GENERATED_INDEX.relative_to(ROOT))}
RUNTIME_PREFIXES = ("src/", "tests/", "test/", "package.json", "bun.lock", "tsconfig", "pyproject.toml", ".github/")
SECRET_PATTERNS = {
    "private_key": re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "aws_access_key": re.compile(rb"AKIA[0-9A-Z]{16}"),
    "github_token": re.compile(rb"gh[pousr]_[A-Za-z0-9_]{30,}"),
    "openai_style_key": re.compile(rb"sk-[A-Za-z0-9]{20,}"),
}
EMAIL = re.compile(rb"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT)


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def status_rows():
    raw = git("status", "--porcelain=v1", "-z").split(b"\0")
    rows = []
    for item in raw:
        if not item:
            continue
        state = item[:2].decode()
        path = item[3:].decode("utf-8", "surrogateescape")
        if path in EXCLUDED:
            continue
        rows.append({"state": state, "path": path})
    return rows


def build():
    head = git("rev-parse", "HEAD").decode().strip()
    branch = git("branch", "--show-current").decode().strip()
    rows = status_rows()
    tracked = [row for row in rows if row["state"] != "??"]
    untracked = [row for row in rows if row["state"] == "??"]
    runtime = [row for row in rows if row["path"].startswith(RUNTIME_PREFIXES)]
    findings = []
    large = []
    binary = []
    secret_hits = Counter()
    pii_candidates = []
    files_scanned = 0
    scan_paths = []
    for row in rows:
        path = ROOT / row["path"]
        if path.is_dir():
            scan_paths.extend(item for item in path.rglob("*") if item.is_file() and item.resolve() not in {OUTPUT, GENERATED_INDEX})
        elif path.is_file() and path.resolve() not in {SELF, OUTPUT}:
            scan_paths.append(path)
    for path in sorted(set(scan_paths)):
        relative = str(path.relative_to(ROOT))
        size = path.stat().st_size
        if size >= 5 * 1024 * 1024:
            large.append({"path": relative, "bytes": size, "sha256": sha256(path)})
        data = path.read_bytes()
        is_binary = b"\0" in data[:8192] or path.suffix in {".gz", ".zip", ".png", ".jpg", ".pdf"}
        if is_binary:
            binary.append({"path": relative, "bytes": size, "sha256": sha256(path)})
            continue
        files_scanned += 1
        for name, pattern in SECRET_PATTERNS.items():
            secret_hits[name] += len(pattern.findall(data))
        for match in EMAIL.findall(data):
            value = match.decode("ascii", "ignore").lower()
            if value.startswith("git@") or value.endswith("@example.com") or value.endswith("@example.org"):
                continue
            pii_candidates.append({"path": relative, "kind": "email_address"})

    generated = [row for row in untracked if row["path"].startswith("docs/governance/generated/")]
    generated_files = []
    for row in generated:
        root = ROOT / row["path"]
        if root.is_dir():
            generated_files.extend(path for path in root.rglob("*") if path.is_file() and path.resolve() not in {OUTPUT, GENERATED_INDEX})
        elif root.is_file():
            generated_files.append(root)
    shard_files = [path for path in generated_files if path.suffix == ".gz"]
    accidental = []
    for pattern in ("*.tmp", "*.bak", "*.swp", ".DS_Store", "__pycache__"):
        accidental.extend(str(path.relative_to(ROOT)) for path in ROOT.rglob(pattern) if ".git" not in path.parts)

    if branch != "codex/hybrid-requirements-freeze":
        findings.append({"code": "wrong_worktree_branch", "actual": branch})
    if runtime:
        findings.append({"code": "uncommitted_runtime_implementation_change", "paths": [row["path"] for row in runtime]})
    if sum(secret_hits.values()):
        findings.append({"code": "high_confidence_secret_candidate", "counts": dict(secret_hits)})
    if pii_candidates:
        findings.append({"code": "non_example_email_pii_candidate", "count": len(pii_candidates)})

    split = Counter()
    for row in rows:
        path = row["path"]
        if path.startswith("docs/governance/generated/"):
            split["generated_evidence_and_independent_reviews"] += 1
        elif path.startswith("scripts/audit/"):
            split["replay_and_independent_audit_scripts"] += 1
        elif path.startswith("docs/design/") or path.startswith("docs/test-design/"):
            split["layered_design_and_test_design"] += 1
        elif path.startswith("docs/governance/"):
            split["governance_ledgers_contracts_and_freeze"] += 1
        elif path.startswith("docs/plans/") or path.startswith("docs/process/"):
            split["plans_and_process_alignment"] += 1
        elif path in {"AGENTS.md", "CLAUDE.md"} or path.startswith("docs/adr/"):
            split["authority_and_runtime_policy_docs"] += 1
        else:
            split["historical_and_reference_alignment"] += 1

    return {
        "schema_version": "helix.hybrid-freeze-worktree-boundary-independent-audit.v1",
        "status": "boundary_observed_freeze_not_committable" if not findings else "boundary_findings_open",
        "worktree": {"path": str(ROOT), "branch": branch, "base_head": head, "base_head_kind": "worktree HEAD before uncommitted freeze batch"},
        "scope": {
            "observable_write_boundary": "git worktree inventory only",
            "project_external_write_count": 0,
            "project_external_write_claim": "No project-external path is present in the Git-observable change set; filesystem-wide provenance is not inferable from Git.",
            "audit_files_excluded_from_batch_inventory": sorted(EXCLUDED),
        },
        "summary": {
            "changed_paths": len(rows),
            "tracked_modified": len(tracked),
            "untracked_roots": len(untracked),
            "runtime_implementation_changes": len(runtime),
            "generated_untracked_roots": len(generated),
            "generated_files_under_roots": len(generated_files),
            "generated_custody_bytes": sum(path.stat().st_size for path in generated_files),
            "compressed_shards": len(shard_files),
            "large_files_at_least_5MiB": len(large),
            "binary_or_compressed_files": len(binary),
            "text_files_secret_scanned": files_scanned,
            "high_confidence_secret_candidates": sum(secret_hits.values()),
            "non_example_email_pii_candidates": len(pii_candidates),
            "accidental_path_candidates": len(set(accidental)),
        },
        "custody": {
            "generated_boundary": "docs/governance/generated is an untracked generated evidence root and must be committed with its producer/reviewer scripts and digest manifests, never as an opaque bulk add.",
            "large_files": large,
            "binary_or_compressed_count": len(binary),
            "compressed_shard_sha256_set_digest": hashlib.sha256("\n".join(sorted(sha256(path) for path in shard_files)).encode()).hexdigest(),
            "accidental_paths": sorted(set(accidental)),
        },
        "security_scan": {"secret_pattern_counts": dict(secret_hits), "pii_candidates": pii_candidates},
        "commit_split_candidates": dict(split),
        "freeze_block": {
            "commit_or_pr_allowed": False,
            "reasons": [
                "requirements freeze and PO/VMAUTH activation are not complete",
                "generated evidence custody must be split with exact producer/reviewer/digest ownership",
                "the uncommitted batch spans multiple independently reviewable design and governance concerns",
                "large generated and compressed artifacts require repository-size and publication-policy review before staging",
                "accidental path candidates must be adjudicated before an explicit-path stage",
            ],
        },
        "changed_paths": rows,
        "findings": findings,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    result = build()
    rendered = json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if args.check:
        if not OUTPUT.is_file() or OUTPUT.read_text() != rendered:
            raise SystemExit("worktree boundary audit artifact is stale")
    else:
        OUTPUT.write_text(rendered)
    if result["findings"]:
        raise SystemExit(f"worktree boundary findings remain: {len(result['findings'])}")


if __name__ == "__main__":
    main()
