#!/usr/bin/env python3
"""Pre-review local verification script for PR body, Red->Green commits, and unit artifacts.

This scaffold tool is a temporary pre-review helper registered under SCF-B-0167
for Issue #3510. It emits structured JSON evidence (pass/fail and findings per
check) without making merge, approval, or authority decisions.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]

DEFAULT_PATH_ALIASES: dict[str, str] = {
    "L2": "docs/helix-harness/L2-requirements/product-requirements.md",
    "L11": "docs/helix-harness/L11-acceptance/product-acceptance.md",
    "L3F": "docs/helix-harness/L3-requirements/functional-requirements.json",
    "L10F": "docs/helix-harness/L10-verification/functional-verification.json",
    "L3B": "docs/helix-harness/L3-requirements/business-requirements.json",
    "L10B": "docs/helix-harness/L10-verification/business-verification.json",
    "L3N": "docs/helix-harness/L3-requirements/nfr-grade.json",
    "L10N": "docs/helix-harness/L10-verification/nfr-verification.json",
    "OS_L3F": "docs/helix-os/L3-requirements/functional-requirements.json",
    "OS_L10F": "docs/helix-os/L10-verification/functional-verification.json",
}

DEFAULT_REMOVED_MATERIAL_KEYS: tuple[str, ...] = (
    "expected_output",
    "input_preparation",
    "expected_material_type",
)

LAYER_DIR_BY_PREFIX: dict[str, str] = {
    "L4": "L4-basic-design",
    "L5": "L5-detail-design",
    "L6": "L6-component-design",
    "L7": "L7-implementation-design",
    "L8": "L8-unit-verification",
    "L9": "L9-integration-verification",
}

SHA40_RE = re.compile(r"(?<![0-9a-fA-F])([0-9a-f]{40})(?![0-9a-fA-F])")
SHORT_SHA_CONTEXT_RE = re.compile(
    r"(?:Red(?:\s+commit)?|Green(?:\s+commit)?|commit|base|head|merge)\s*"
    r"(?:SHA\s*)?[:=`(\[]*\s*`?([0-9a-f]{7,39})`?",
    re.IGNORECASE,
)
RED_SHA_RE = re.compile(
    r"Red(?:\s+commit)?[^`\n0-9a-f]{0,40}`?([0-9a-f]{7,40})`?",
    re.IGNORECASE,
)
GREEN_SHA_RE = re.compile(
    r"Green(?:\s+commit)?[^`\n0-9a-f]{0,40}`?([0-9a-f]{7,40})`?",
    re.IGNORECASE,
)
JSON_POINTER_RE = re.compile(r"\b([A-Za-z0-9_]+)#(/[A-Za-z0-9_./~-]+)")
DOC_ID_RE = re.compile(
    r"\b((?:HARNESS|HELIXOS|HELIXBRAIN|HELIXWEB|HELIXLABO|HELIXSECURITY|HELIXINFRA)"
    r"-(?:L(?:10|11|[1-9])|E)-[A-Za-z0-9_.-]+)\b"
)
CLOSING_3510_RE = re.compile(
    r"\b(close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s*:?\s*"
    r"(?:#3510\b|https?://github\.com/[^/\s]+/[^/\s]+/issues/3510\b)",
    re.IGNORECASE,
)
DOC_PATH_IN_BODY_RE = re.compile(r"(docs/[a-z0-9-]+/L[4-9]-[a-z-]+/([a-z0-9-]+)\.json)")


def _run_cmd(
    args: list[str], cwd: Path = REPO_ROOT
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        cwd=str(cwd),
        capture_output=True,
        text=True,
        check=False,
    )


def infer_pointer_map(
    pr_body: str,
    unit_path: Path | None = None,
    explicit_map: dict[str, str] | None = None,
) -> dict[str, str]:
    """Build prefix -> relative JSON path mapping from defaults, body, and explicit args."""
    mapping = dict(DEFAULT_PATH_ALIASES)
    slug_product: tuple[str, str] | None = None

    match = DOC_PATH_IN_BODY_RE.search(pr_body)
    if match:
        full_rel, slug = match.group(1), match.group(2)
        parts = Path(full_rel).parts
        if len(parts) >= 2:
            slug_product = (parts[1], slug)

    if slug_product is None and unit_path is not None:
        unit_name = unit_path.name.lower()
        for prefix in ("helixharness-unit-", "helixbrain-unit-", "helixos-unit-"):
            if unit_name.startswith(prefix):
                slug = unit_name[len(prefix) :]
                prod = (
                    "helix-harness"
                    if "harness" in prefix
                    else ("helix-brain" if "brain" in prefix else "helix-os")
                )
                slug_product = (prod, slug)
                break

    if slug_product is not None:
        product_dir, slug = slug_product
        for pfx, layer_dir in LAYER_DIR_BY_PREFIX.items():
            mapping[pfx] = f"docs/{product_dir}/{layer_dir}/{slug}.json"

    if explicit_map:
        mapping.update(explicit_map)
    return mapping


def check_commit_sha_and_red_green(
    pr_body: str,
    commits: list[dict[str, Any]],
    commit_exists_fn: Any = None,
) -> dict[str, Any]:
    """(1) Verify 40-char/short SHAs in PR body exist and Red/Green matches git log."""
    sha40s = sorted(set(SHA40_RE.findall(pr_body)))
    short_shas = sorted(
        {
            m.group(1)
            for m in SHORT_SHA_CONTEXT_RE.finditer(pr_body)
            if len(m.group(1)) < 40
        }
    )
    red_shas = [m.group(1) for m in RED_SHA_RE.finditer(pr_body)]
    green_shas = [m.group(1) for m in GREEN_SHA_RE.finditer(pr_body)]

    log_shas = [c["sha"] for c in commits]

    def _matches_commit(candidate: str, full_sha: str) -> bool:
        return full_sha == candidate or full_sha.startswith(candidate)

    def _exists_in_repo(candidate: str) -> bool:
        if any(_matches_commit(candidate, full) for full in log_shas):
            return True
        if commit_exists_fn is not None:
            return bool(commit_exists_fn(candidate))
        return False

    missing_shas: list[str] = []
    for sha in sha40s + short_shas:
        if not _exists_in_repo(sha):
            missing_shas.append(sha)

    red_green_errors: list[str] = []
    resolved_reds: list[tuple[int, dict[str, Any]]] = []
    resolved_greens: list[tuple[int, dict[str, Any]]] = []

    for r_sha in red_shas:
        found = [
            (idx, c)
            for idx, c in enumerate(commits)
            if _matches_commit(r_sha, c["sha"])
        ]
        if not found:
            red_green_errors.append(
                f"Red commit SHA '{r_sha}' not found in base..head commit log"
            )
        else:
            idx, c = found[0]
            resolved_reds.append((idx, c))
            subj = c.get("subject", "")
            if subj and not (subj.startswith("test") or "red" in subj.lower()):
                red_green_errors.append(
                    f"Red commit '{r_sha}' subject '{subj}' does not match test/Red commit convention"
                )

    for g_sha in green_shas:
        found = [
            (idx, c)
            for idx, c in enumerate(commits)
            if _matches_commit(g_sha, c["sha"])
        ]
        if not found:
            red_green_errors.append(
                f"Green commit SHA '{g_sha}' not found in base..head commit log"
            )
        else:
            idx, c = found[0]
            resolved_greens.append((idx, c))
            subj = c.get("subject", "")
            if subj and not (
                subj.startswith(("feat", "fix")) or "green" in subj.lower()
            ):
                red_green_errors.append(
                    f"Green commit '{g_sha}' subject '{subj}' does not match feat/fix/Green commit convention"
                )

    if resolved_reds and resolved_greens:
        if resolved_reds[0][0] >= resolved_greens[0][0]:
            red_green_errors.append(
                f"Red commit ({resolved_reds[0][1]['sha']}) does not precede Green commit ({resolved_greens[0][1]['sha']}) in base..head"
            )

    passed = not missing_shas and not red_green_errors
    return {
        "passed": passed,
        "status": "pass" if passed else "fail",
        "checked_40char_shas": sha40s,
        "checked_short_shas": short_shas,
        "declared_red_shas": red_shas,
        "declared_green_shas": green_shas,
        "missing_shas": missing_shas,
        "red_green_errors": red_green_errors,
    }


def _resolve_rfc6901_with_ranges(doc: Any, pointer: str) -> tuple[bool, str]:
    """Resolve an RFC 6901 pointer (supporting N..M range at leaf/segment) against doc."""
    clean_ptr = pointer.rstrip(".,;:)")
    if not clean_ptr.startswith("/"):
        return False, f"Invalid pointer syntax: {clean_ptr}"
    tokens = [
        tok.replace("~1", "/").replace("~0", "~")
        for tok in clean_ptr.lstrip("/").split("/")
        if tok != ""
    ]

    def _walk(current: Any, idx: int) -> tuple[bool, str]:
        if idx >= len(tokens):
            return True, "ok"
        tok = tokens[idx]
        if ".." in tok:
            parts = tok.split("..", 1)
            if not (parts[0].isdigit() and parts[1].isdigit()):
                return False, f"Non-numeric range '{tok}' in {clean_ptr}"
            start, end = int(parts[0]), int(parts[1])
            if not isinstance(current, list):
                return False, f"Range '{tok}' applied to non-list in {clean_ptr}"
            if start > end or start < 0 or end >= len(current):
                return (
                    False,
                    f"Range {start}..{end} out of bounds (len={len(current)}) in {clean_ptr}",
                )
            for item_idx in range(start, end + 1):
                ok, msg = _walk(current[item_idx], idx + 1)
                if not ok:
                    return False, msg
            return True, "ok"
        if isinstance(current, list):
            if not tok.isdigit():
                return False, f"Non-integer list index '{tok}' in {clean_ptr}"
            list_idx = int(tok)
            if list_idx < 0 or list_idx >= len(current):
                return (
                    False,
                    f"Index {list_idx} out of bounds (len={len(current)}) in {clean_ptr}",
                )
            return _walk(current[list_idx], idx + 1)
        if isinstance(current, dict):
            if tok not in current:
                return False, f"Missing key '{tok}' in {clean_ptr}"
            return _walk(current[tok], idx + 1)
        return False, f"Cannot traverse scalar at '{tok}' in {clean_ptr}"

    return _walk(doc, 0)


def check_json_pointers_resolve(
    pr_body: str,
    pointer_map: dict[str, str],
    repo_root: Path = REPO_ROOT,
    json_loader: Any = None,
) -> dict[str, Any]:
    """(2) Verify L3F#, L5#, L8# etc. JSON pointers in PR body resolve on main."""
    raw_matches = JSON_POINTER_RE.findall(pr_body)
    doc_cache: dict[str, Any] = {}
    resolved: list[str] = []
    unresolved: list[dict[str, str]] = []

    for prefix, ptr in raw_matches:
        clean_ptr = ptr.rstrip(".,;:)")
        full_expr = f"{prefix}#{clean_ptr}"
        rel_path = pointer_map.get(prefix)
        if not rel_path:
            unresolved.append(
                {
                    "pointer": full_expr,
                    "reason": f"Unmapped document prefix '{prefix}'",
                }
            )
            continue
        if rel_path not in doc_cache:
            try:
                if json_loader is not None:
                    doc_cache[rel_path] = json_loader(rel_path)
                else:
                    target_file = repo_root / rel_path
                    if not target_file.exists():
                        unresolved.append(
                            {
                                "pointer": full_expr,
                                "reason": f"Target file does not exist: {rel_path}",
                            }
                        )
                        continue
                    doc_cache[rel_path] = json.loads(
                        target_file.read_text(encoding="utf-8")
                    )
            except Exception as exc:
                unresolved.append(
                    {
                        "pointer": full_expr,
                        "reason": f"Failed to load {rel_path}: {exc}",
                    }
                )
                continue

        ok, msg = _resolve_rfc6901_with_ranges(doc_cache[rel_path], clean_ptr)
        if ok:
            resolved.append(full_expr)
        else:
            unresolved.append({"pointer": full_expr, "file": rel_path, "reason": msg})

    passed = len(unresolved) == 0
    return {
        "passed": passed,
        "status": "pass" if passed else "fail",
        "resolved_count": len(resolved),
        "resolved_pointers": resolved,
        "unresolved_pointers": unresolved,
    }


def check_doc_ids_exist(
    pr_body: str,
    repo_root: Path = REPO_ROOT,
    id_exists_fn: Any = None,
) -> dict[str, Any]:
    """(3) Verify HELIX IDs (HARNESS-L*-..., HELIXBRAIN-L*-..., HARNESS-E-...) exist under docs/."""
    extracted = sorted(
        {
            m.rstrip(".,;:)")
            for m in DOC_ID_RE.findall(pr_body)
            if ".." not in m and not m.endswith("-")
        }
    )
    found_ids: list[str] = []
    missing_ids: list[str] = []

    docs_dir = repo_root / "docs"
    for doc_id in extracted:
        if id_exists_fn is not None:
            exists = bool(id_exists_fn(doc_id))
        else:
            res = _run_cmd(
                ["git", "grep", "-F", "-q", doc_id, "--", "docs/"],
                cwd=repo_root,
            )
            exists = res.returncode == 0
            if not exists and docs_dir.exists():
                res_rg = _run_cmd(
                    ["grep", "-R", "-F", "-q", doc_id, str(docs_dir)],
                    cwd=repo_root,
                )
                exists = res_rg.returncode == 0
        if exists:
            found_ids.append(doc_id)
        else:
            missing_ids.append(doc_id)

    passed = len(missing_ids) == 0
    return {
        "passed": passed,
        "status": "pass" if passed else "fail",
        "checked_ids": extracted,
        "found_ids": found_ids,
        "missing_ids": missing_ids,
    }


def check_no_closing_keyword_3510(pr_body: str) -> dict[str, Any]:
    """(4) Verify PR body does not contain Closes/Fixes/Resolves #3510."""
    matches = [m.group(0) for m in CLOSING_3510_RE.finditer(pr_body)]
    passed = len(matches) == 0
    return {
        "passed": passed,
        "status": "pass" if passed else "fail",
        "forbidden_matches": matches,
    }


def _is_test_or_fixture_path(path_str: str) -> bool:
    parts = Path(path_str).parts
    return "tests" in parts or "fixtures" in parts


def check_tests_and_fixtures_unchanged_after_red(
    commits: list[dict[str, Any]],
    explicit_red_sha: str | None = None,
) -> dict[str, Any]:
    """(5) Verify tests/ and fixtures are not modified in non-Red commits after Red commit."""
    if not commits:
        return {
            "passed": True,
            "status": "pass",
            "red_commits": [],
            "violations": [],
        }

    red_indices: list[int] = []
    for idx, c in enumerate(commits):
        sha = c.get("sha", "")
        subj = c.get("subject", "")
        if explicit_red_sha and (
            sha == explicit_red_sha or sha.startswith(explicit_red_sha)
        ):
            red_indices.append(idx)
        elif not explicit_red_sha and (
            subj.startswith("test(")
            or subj.startswith("test:")
            or "red" in subj.lower()
        ):
            red_indices.append(idx)

    if not red_indices:
        return {
            "passed": True,
            "status": "pass",
            "red_commits": [],
            "violations": [],
            "note": "No Red test commit in range (non-TDD or doc/scaffold PR)",
        }

    first_red_idx = red_indices[0]
    red_set = set(red_indices)
    violations: list[dict[str, Any]] = []

    for idx in range(first_red_idx + 1, len(commits)):
        if idx in red_set:
            continue
        c = commits[idx]
        bad_files = [f for f in c.get("files", []) if _is_test_or_fixture_path(f)]
        if bad_files:
            violations.append(
                {
                    "sha": c.get("sha"),
                    "subject": c.get("subject"),
                    "modified_test_or_fixture_files": bad_files,
                }
            )

    passed = len(violations) == 0
    return {
        "passed": passed,
        "status": "pass" if passed else "fail",
        "red_commits": [commits[i].get("sha") for i in red_indices],
        "violations": violations,
    }


def _collect_json_keys(obj: Any, out: set[str]) -> None:
    if isinstance(obj, dict):
        for k, v in obj.items():
            out.add(str(k))
            _collect_json_keys(v, out)
    elif isinstance(obj, list):
        for item in obj:
            _collect_json_keys(item, out)


def check_no_removed_materials_keys(
    unit_path: Path | None,
    l8_doc: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """(6) Verify tests/ and fixtures do not contain keys listed in L8 removed_materials."""
    removed_keys: set[str] = set(DEFAULT_REMOVED_MATERIAL_KEYS)
    if isinstance(l8_doc, dict):
        rm = l8_doc.get("removed_materials")
        if isinstance(rm, list):
            for entry in rm:
                if isinstance(entry, dict):
                    for field_name in ("key", "field", "name", "material_key"):
                        val = entry.get(field_name)
                        if isinstance(val, str) and val:
                            removed_keys.add(val)
                        elif isinstance(val, list):
                            removed_keys.update(
                                str(x) for x in val if isinstance(x, str)
                            )
                    keys_list = entry.get("removed_keys") or entry.get("keys")
                    if isinstance(keys_list, list):
                        removed_keys.update(
                            str(x) for x in keys_list if isinstance(x, str)
                        )
                elif isinstance(entry, str):
                    for k in DEFAULT_REMOVED_MATERIAL_KEYS:
                        if k in entry:
                            removed_keys.add(k)

    if unit_path is None or not unit_path.exists():
        return {
            "passed": True,
            "status": "pass",
            "removed_material_keys": sorted(removed_keys),
            "scanned_files": [],
            "violations": [],
            "note": "No unit_path specified or path does not exist",
        }

    tests_dir = unit_path / "tests"
    scan_root = tests_dir if tests_dir.exists() else unit_path
    scanned_files: list[str] = []
    violations: list[dict[str, Any]] = []

    for fpath in sorted(scan_root.rglob("*")):
        if not fpath.is_file() or "__pycache__" in fpath.parts:
            continue
        rel = str(fpath)
        if fpath.suffix == ".json":
            scanned_files.append(rel)
            try:
                data = json.loads(fpath.read_text(encoding="utf-8"))
                keys_found: set[str] = set()
                _collect_json_keys(data, keys_found)
                hit = sorted(keys_found & removed_keys)
                if hit:
                    violations.append({"file": rel, "forbidden_keys": hit})
            except Exception as exc:
                violations.append({"file": rel, "error": f"JSON parse error: {exc}"})
        elif fpath.suffix == ".py":
            scanned_files.append(rel)
            text = fpath.read_text(encoding="utf-8")
            hit = sorted(
                k for k in removed_keys if re.search(rf'["\']{re.escape(k)}["\']', text)
            )
            if hit:
                violations.append({"file": rel, "forbidden_keys": hit})

    passed = len(violations) == 0
    return {
        "passed": passed,
        "status": "pass" if passed else "fail",
        "removed_material_keys": sorted(removed_keys),
        "scanned_files": scanned_files,
        "violations": violations,
    }


def _find_ruff_cmd() -> list[str]:
    ruff_bin = shutil.which("ruff")
    if ruff_bin:
        return [ruff_bin]
    uvx_bin = shutil.which("uvx") or "/home/tenni/.local/bin/uvx"
    if Path(uvx_bin).exists():
        return [uvx_bin, "--offline", "ruff@0.17.1"]
    return ["ruff"]


def check_tooling_summary(
    unit_path: Path | None = None,
    repo_root: Path = REPO_ROOT,
    runner: Any = None,
) -> dict[str, Any]:
    """(7) Run ruff 0.17.1 check & format --check, unittest, and scfctl stale/validate."""
    exec_fn = runner or _run_cmd
    ruff_base = _find_ruff_cmd()
    target_dir = str(unit_path) if unit_path is not None else "scaffold/tools"

    ruff_check = exec_fn(
        [*ruff_base, "check", "--no-fix", "--no-cache", target_dir],
        cwd=repo_root,
    )
    ruff_format = exec_fn(
        [*ruff_base, "format", "--no-cache", "--check", target_dir],
        cwd=repo_root,
    )

    if unit_path is not None and (unit_path / "tests").exists():
        ut_cmd = [
            sys.executable,
            "-B",
            "-m",
            "unittest",
            "discover",
            "-s",
            str(unit_path / "tests"),
            "-p",
            "test_*.py",
        ]
    else:
        ut_cmd = [
            sys.executable,
            "-B",
            "-m",
            "unittest",
            "discover",
            "-s",
            str(repo_root / "scaffold/tools"),
            "-p",
            "test_*.py",
        ]
    unittest_res = exec_fn(ut_cmd, cwd=repo_root)

    scfctl_path = str(repo_root / "scaffold/tools/scfctl.py")
    scf_stale = exec_fn([sys.executable, "-B", scfctl_path, "stale"], cwd=repo_root)
    scf_validate = exec_fn(
        [sys.executable, "-B", scfctl_path, "validate"], cwd=repo_root
    )

    subresults = {
        "ruff_check": {
            "passed": ruff_check.returncode == 0,
            "returncode": ruff_check.returncode,
            "output": (ruff_check.stdout + ruff_check.stderr).strip(),
        },
        "ruff_format_check": {
            "passed": ruff_format.returncode == 0,
            "returncode": ruff_format.returncode,
            "output": (ruff_format.stdout + ruff_format.stderr).strip(),
        },
        "unittest": {
            "passed": unittest_res.returncode == 0,
            "returncode": unittest_res.returncode,
            "output": (unittest_res.stdout + unittest_res.stderr).strip(),
        },
        "scfctl_stale": {
            "passed": scf_stale.returncode == 0
            and "stale=0" in (scf_stale.stdout + scf_stale.stderr),
            "returncode": scf_stale.returncode,
            "output": (scf_stale.stdout + scf_stale.stderr).strip(),
        },
        "scfctl_validate": {
            "passed": scf_validate.returncode == 0
            and "fail=0" in (scf_validate.stdout + scf_validate.stderr),
            "returncode": scf_validate.returncode,
            "output": (scf_validate.stdout + scf_validate.stderr).strip(),
        },
    }
    passed = all(item["passed"] for item in subresults.values())
    return {
        "passed": passed,
        "status": "pass" if passed else "fail",
        "results": subresults,
    }


def load_git_commits(
    base: str, head: str, repo_root: Path = REPO_ROOT
) -> list[dict[str, Any]]:
    """Load commits in base..head in chronological order with changed file lists."""
    res = _run_cmd(
        ["git", "log", "--reverse", "--format=%H\t%s", f"{base}..{head}"],
        cwd=repo_root,
    )
    if res.returncode != 0:
        return []
    commits: list[dict[str, Any]] = []
    for line in res.stdout.splitlines():
        if not line.strip():
            continue
        sha, _, subj = line.partition("\t")
        files_res = _run_cmd(
            ["git", "diff-tree", "--no-commit-id", "--name-only", "-r", sha],
            cwd=repo_root,
        )
        files = [f.strip() for f in files_res.stdout.splitlines() if f.strip()]
        commits.append({"sha": sha.strip(), "subject": subj.strip(), "files": files})
    return commits


def git_commit_exists(sha: str, repo_root: Path = REPO_ROOT) -> bool:
    res = _run_cmd(["git", "cat-file", "-t", sha], cwd=repo_root)
    return res.returncode == 0 and res.stdout.strip() == "commit"


def run_all_checks(
    pr_body: str,
    base_sha: str,
    head_sha: str,
    unit_path: Path | None = None,
    pointer_map: dict[str, str] | None = None,
    repo_root: Path = REPO_ROOT,
    commits: list[dict[str, Any]] | None = None,
    commit_exists_fn: Any = None,
    json_loader: Any = None,
    id_exists_fn: Any = None,
    l8_doc: dict[str, Any] | None = None,
    tooling_runner: Any = None,
) -> dict[str, Any]:
    """Execute all 7 pre-review checks and return a structured scaffold report."""
    resolved_commits = (
        commits
        if commits is not None
        else load_git_commits(base_sha, head_sha, repo_root=repo_root)
    )
    exists_fn = commit_exists_fn or (
        lambda s: git_commit_exists(s, repo_root=repo_root)
    )
    resolved_map = infer_pointer_map(
        pr_body, unit_path=unit_path, explicit_map=pointer_map
    )

    if l8_doc is None and "L8" in resolved_map:
        l8_path = repo_root / resolved_map["L8"]
        if l8_path.exists():
            try:
                l8_doc = json.loads(l8_path.read_text(encoding="utf-8"))
            except Exception:
                l8_doc = None

    c1 = check_commit_sha_and_red_green(
        pr_body, resolved_commits, commit_exists_fn=exists_fn
    )
    c2 = check_json_pointers_resolve(
        pr_body, resolved_map, repo_root=repo_root, json_loader=json_loader
    )
    c3 = check_doc_ids_exist(pr_body, repo_root=repo_root, id_exists_fn=id_exists_fn)
    c4 = check_no_closing_keyword_3510(pr_body)
    c5 = check_tests_and_fixtures_unchanged_after_red(resolved_commits)
    c6 = check_no_removed_materials_keys(unit_path, l8_doc=l8_doc)
    c7 = check_tooling_summary(
        unit_path=unit_path, repo_root=repo_root, runner=tooling_runner
    )

    checks = {
        "1_commit_sha_and_red_green": c1,
        "2_json_pointers_resolve": c2,
        "3_doc_ids_exist": c3,
        "4_no_closing_keyword_3510": c4,
        "5_tests_and_fixtures_unchanged_after_red": c5,
        "6_no_removed_materials_keys": c6,
        "7_tooling_summary": c7,
    }
    overall_passed = all(item["passed"] for item in checks.values())
    return {
        "schema": "scaffold-pre-review-check.v1",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "base_sha": base_sha,
        "head_sha": head_sha,
        "unit_path": str(unit_path) if unit_path is not None else None,
        "overall_status": "pass" if overall_passed else "fail",
        "checks": checks,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Run scaffold pre-review checks on a PR or branch range."
    )
    parser.add_argument("--pr", type=int, help="GitHub PR number")
    parser.add_argument("--base", help="Base commit SHA or ref")
    parser.add_argument("--head", help="Head commit SHA or ref")
    parser.add_argument("--body-file", help="Path to PR body markdown file")
    parser.add_argument("--unit-path", help="Path to unit directory")
    parser.add_argument(
        "--pointer-map",
        action="append",
        default=[],
        help="Explicit prefix=path mapping (e.g. L5=docs/...)",
    )
    args = parser.parse_args(argv)

    pr_body = ""
    base_sha = args.base or "main"
    head_sha = args.head or "HEAD"

    if args.pr is not None:
        res = _run_cmd(
            [
                "gh",
                "pr",
                "view",
                str(args.pr),
                "--json",
                "body,baseRefOid,headRefOid",
            ]
        )
        if res.returncode == 0:
            pr_data = json.loads(res.stdout)
            pr_body = pr_data.get("body") or ""
            base_sha = args.base or pr_data.get("baseRefOid") or base_sha
            head_sha = args.head or pr_data.get("headRefOid") or head_sha

    if args.body_file:
        pr_body = Path(args.body_file).read_text(encoding="utf-8")

    explicit_map: dict[str, str] = {}
    for entry in args.pointer_map:
        if "=" in entry:
            k, v = entry.split("=", 1)
            explicit_map[k.strip()] = v.strip()

    unit_path = Path(args.unit_path) if args.unit_path else None
    report = run_all_checks(
        pr_body=pr_body,
        base_sha=base_sha,
        head_sha=head_sha,
        unit_path=unit_path,
        pointer_map=explicit_map,
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
