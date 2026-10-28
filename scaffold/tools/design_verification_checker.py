#!/usr/bin/env python3
"""L3-L10 Design Verification Checker and Freeze Record Generator (Scaffold).

Authoritative specification:
  docs/governance/design-verification-quality-assurance.md (Sections 2-6)

Approved L3/L10 derivation basis (Section 6.1):
  - CHK-PAIR-BIDIR-ID: HARNESS-L3-001-F01, HARNESS-L3-056-F01..F02
    <-> HARNESS-L10-001-F01, HARNESS-L10-056-F01..F02 (PR #2946, #2944)
  - CHK-PIN-SHA256 / CHK-JSON-POINTER: HARNESS-L3-040-F01..F04, HARNESS-L3-004-F01
    <-> HARNESS-L10-040-F01..F04, HARNESS-L10-004-F01 (PR #2945, #2947)
  - CHK-L3-OBLIGATION-MAP / CHK-NEG-4WAY-MATCH: HARNESS-L3-041-F01..F03,
    HARNESS-L3-005-F06,F08,F09 <-> HARNESS-L10-041-F01..F03,
    HARNESS-L10-005-F06,F08,F09 (PR #2944, #2943)
  - CHK-PUBLIC-FN-FREEZE / CHK-OWNERSHIP-CAP-L8L9 / CHK-OWNERSHIP-CAP-L3L6:
    HARNESS-L3-015-F01..F04, HARNESS-L3-005-F07, HARNESS-L3-003-F01,F03
    <-> HARNESS-L10-015-F01..F04, HARNESS-L10-005-F07, HARNESS-L10-003-F01,F03
    (PR #2943, #2947; Issue #3510 comments 6408252809, 6447665479, 6457411605)
  - Ticket-driven CI profile & deferral recovery: HARNESS-L3-005-F01..F03,
    HELIXOS-L3-020-F01..F03 <-> HARNESS-L10-005-F01..F03, HELIXOS-L10-020-F01..F03
    (PR #2943, #2952)

Boundary:
  - Scaffold tool only (evidence_kind="scaffold", authority_effect="none").
  - Does not create new gates, branch protection rules, or byte/KB size limits.
"""

from __future__ import annotations

import argparse
import datetime
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

SPEC_DOCUMENT = "docs/governance/design-verification-quality-assurance.md"

LEGACY_BASIS: list[dict[str, str]] = [
    {
        "asset_id": "LEGACY-ASSET-DA012A9B04D5BE9419CE",
        "path": "archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md",
        "lines": "27-90",
        "sha256": "65400847881f1a72b273f0bdeff503a5ea302705cd0e71d7913fc7d0f8dd18fb",
        "role": "Derive required verification obligations from work authority and semantic impact; fail-close on missing/relaxed obligations (§0, CIS-R-04..08).",
    },
    {
        "asset_id": "LEGACY-ASSET-79B70809D0A1EE2D5392",
        "path": "archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-ci-performance-requirements.md",
        "lines": "14-35",
        "sha256": "7a9b3534671516be8810e40a8c96119e885eb431a4753518b56fe2479b9263d1",
        "role": "Impact checks on modified layer, adjacent layers, paired V-layer, and trace consumers (GH-NFR-009..011).",
    },
    {
        "asset_id": "LEGACY-ASSET-08BD701EF2577835D9F7",
        "path": "archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/scrum-reverse-verification-engine.md",
        "lines": "19-40",
        "sha256": "0c5dd33f48710ae692c5ae71b63996f0ba2f8aab1af417cf33d5c02260c76c73",
        "role": "Reverse verification backfill (SR0..SR4), pair_freeze_pass, and detector promotion for recurring findings (SRV-FR-001..014).",
    },
    {
        "asset_id": "LEGACY-ASSET-1C7E5C0B33364FBF9EC6",
        "path": "archive/legacy-generation-2026-09-14/root/.github/workflows/harness-check.yml",
        "lines": "1-39",
        "sha256": "7c18b3f208886c443957f4cdbf919de77da233e6759007b8501624c054e7d099",
        "role": "Legacy aggregate GitHub Actions check; replaced in new generation by ticket-scoped V-pair checks.",
    },
    {
        "asset_id": "LEGACY-ASSET-68D46138F1FA40748C52",
        "path": "archive/legacy-generation-2026-09-14/root/docs/process/modes/reverse.md",
        "lines": "1-50",
        "sha256": "459b0454d97a6d991be963703f20238e38f0eba6684b8035f067d54458032b83",
        "role": "Right-side Reverse produces minimal contracts that constrain subsequent changes rather than implementation prose.",
    },
]

DERIVATION_MAP: dict[str, dict[str, Any]] = {
    "CHK-PAIR-BIDIR-ID": {
        "l3_pointers": [
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/58 (HARNESS-L3-001-F01)",
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/51..52 (HARNESS-L3-056-F01..F02)",
        ],
        "l10_pointers": [
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/58 (HARNESS-L10-001-F01)",
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/51..52 (HARNESS-L10-056-F01..F02)",
        ],
        "decision_records": [
            "docs/governance/decisions/helix-harness-layer-acceptance-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2946)",
            "docs/governance/decisions/helix-harness-extraction-naming-pair-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2944)",
        ],
    },
    "CHK-PIN-SHA256": {
        "l3_pointers": [
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/54..57 (HARNESS-L3-040-F01..F04)",
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/69 (HARNESS-L3-004-F01)",
        ],
        "l10_pointers": [
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/54..57 (HARNESS-L10-040-F01..F04)",
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/69 (HARNESS-L10-004-F01)",
        ],
        "decision_records": [
            "docs/governance/decisions/helix-harness-layer040-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2945)",
            "docs/governance/decisions/helix-harness-process-trace-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2947)",
        ],
    },
    "CHK-JSON-POINTER": {
        "l3_pointers": [
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/54..57 (HARNESS-L3-040-F01..F04)",
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/69 (HARNESS-L3-004-F01)",
        ],
        "l10_pointers": [
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/54..57 (HARNESS-L10-040-F01..F04)",
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/69 (HARNESS-L10-004-F01)",
        ],
        "decision_records": [
            "docs/governance/decisions/helix-harness-layer040-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2945)",
            "docs/governance/decisions/helix-harness-process-trace-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2947)",
        ],
    },
    "CHK-NEG-4WAY-MATCH": {
        "l3_pointers": [
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/44..46 (HARNESS-L3-041-F01..F03)",
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/36,38,39 (HARNESS-L3-005-F06,F08,F09)",
        ],
        "l10_pointers": [
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/44..46 (HARNESS-L10-041-F01..F03)",
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/36,38,39 (HARNESS-L10-005-F06,F08,F09)",
        ],
        "decision_records": [
            "docs/governance/decisions/helix-harness-extraction-naming-pair-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2944)",
            "docs/governance/decisions/helix-harness-verification-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2943)",
        ],
    },
    "CHK-L3-OBLIGATION-MAP": {
        "l3_pointers": [
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/44..46 (HARNESS-L3-041-F01..F03)",
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/36,38,39 (HARNESS-L3-005-F06,F08,F09)",
        ],
        "l10_pointers": [
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/44..46 (HARNESS-L10-041-F01..F03)",
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/36,38,39 (HARNESS-L10-005-F06,F08,F09)",
        ],
        "decision_records": [
            "docs/governance/decisions/helix-harness-extraction-naming-pair-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2944)",
            "docs/governance/decisions/helix-harness-verification-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2943)",
        ],
    },
    "CHK-PUBLIC-FN-FREEZE": {
        "l3_pointers": [
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/40..43 (HARNESS-L3-015-F01..F04)",
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/37 (HARNESS-L3-005-F07)",
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/64,66 (HARNESS-L3-003-F01,F03)",
        ],
        "l10_pointers": [
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/40..43 (HARNESS-L10-015-F01..F04)",
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/37 (HARNESS-L10-005-F07)",
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/64,66 (HARNESS-L10-003-F01,F03)",
        ],
        "decision_records": [
            "docs/governance/decisions/helix-harness-verification-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2943)",
            "docs/governance/decisions/helix-harness-process-trace-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2947)",
        ],
    },
    "CHK-OWNERSHIP-CAP-L8L9": {
        "l3_pointers": [
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/40..43 (HARNESS-L3-015-F01..F04)",
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/36..39 (HARNESS-L3-005-F06..F09)",
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/64,66 (HARNESS-L3-003-F01,F03)",
        ],
        "l10_pointers": [
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/40..43 (HARNESS-L10-015-F01..F04)",
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/36..39 (HARNESS-L10-005-F06..F09)",
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/64,66 (HARNESS-L10-003-F01,F03)",
        ],
        "decision_records": [
            "docs/governance/decisions/helix-harness-verification-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2943)",
            "docs/governance/decisions/helix-harness-process-trace-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2947)",
            "https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6408252809",
            "https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6447665479",
        ],
    },
    "CHK-OWNERSHIP-CAP-L3L6": {
        "l3_pointers": [
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/54..57 (HARNESS-L3-040-F01..F04)",
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/40..43 (HARNESS-L3-015-F01..F04)",
        ],
        "l10_pointers": [
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/54..57 (HARNESS-L10-040-F01..F04)",
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/40..43 (HARNESS-L10-015-F01..F04)",
        ],
        "decision_records": [
            "docs/governance/decisions/helix-harness-layer040-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2945)",
            "docs/governance/decisions/helix-harness-verification-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2943)",
            "https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6408252809",
            "https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6447665479",
        ],
    },
    "TICKET-CI-PROFILE-DEFERRAL": {
        "l3_pointers": [
            "docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/31..33 (HARNESS-L3-005-F01..F03)",
            "docs/helix-os/L3-requirements/functional-requirements.json#/requirements/37..39 (HELIXOS-L3-020-F01..F03)",
        ],
        "l10_pointers": [
            "docs/helix-harness/L10-verification/functional-verification.json#/cases/31..33 (HARNESS-L10-005-F01..F03)",
            "docs/helix-os/L10-verification/functional-verification.json#/cases/37..39 (HELIXOS-L10-020-F01..F03)",
        ],
        "decision_records": [
            "docs/governance/decisions/helix-harness-verification-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2943)",
            "docs/governance/decisions/helix-os-workflow-prerequisite-l3-l10-delegated-decision-2026-10-12.md (PR #2952)",
        ],
    },
}

FORBIDDEN_MATERIAL_KEYS_COMMON: set[str] = {
    "fixture_patch",
    "rfc6902_copy_ops",
    "rfc6902_patch",
    "literal_materialization_contract",
    "typed_execution_trace",
    "typed_return_derivation_history",
    "expected_return",
    "full_return",
}

FORBIDDEN_MATERIAL_KEYS_L8L9: set[str] = FORBIDDEN_MATERIAL_KEYS_COMMON | {
    "seed",
    "same_invocation",
}

ALLOWED_SHA256_ANCESTOR_KEYS: set[str] = {
    "source_pins",
    "source_basis",
    "basic_design_ref",
    "detail_design_ref",
    "removed_materials",
    "pins",
    "references",
    "legacy_comparison",
    "legacy_and_failure_basis",
    "approval_basis",
    "parent_basis",
    "approval",
    "approval_binding",
    "approval_admission_evidence",
}

ALLOWED_SHA256_SIBLING_KEYS: set[str] = {
    "path",
    "source_path",
    "revision",
    "source_revision",
    "commit",
    "asset_id",
}

HEX64_RE = re.compile(r"^[0-9a-f]{64}$")
HEX40_RE = re.compile(r"^[0-9a-f]{40}$")
POINTER_TOKEN_RE = re.compile(r"(?:([A-Za-z0-9_./-]+))?#/([A-Za-z0-9_./~*:-]+)")
RANGE_SEG_RE = re.compile(r"^(\d+)\.\.(\d+)$")


def _canonical_json_sha256(obj: Any) -> str:
    canonical = json.dumps(
        obj, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _read_bytes(
    repo_root: Path, rel_path: str, revision: str | None = None
) -> bytes | None:
    if revision and revision not in ("WORKTREE", "HEAD_WORKTREE"):
        proc = subprocess.run(
            ["git", "show", f"{revision}:{rel_path}"],
            cwd=str(repo_root),
            capture_output=True,
            check=False,
        )
        if proc.returncode == 0:
            return proc.stdout
        return None
    full = repo_root / rel_path
    if full.is_file():
        return full.read_bytes()
    if revision:
        proc = subprocess.run(
            ["git", "show", f"{revision}:{rel_path}"],
            cwd=str(repo_root),
            capture_output=True,
            check=False,
        )
        if proc.returncode == 0:
            return proc.stdout
    return None


def _load_json(repo_root: Path, rel_path: str, revision: str | None = None) -> Any:
    raw = _read_bytes(repo_root, rel_path, revision)
    if raw is None:
        return None
    return json.loads(raw.decode("utf-8"))


def _file_last_commit(repo_root: Path, rel_path: str) -> str | None:
    proc = subprocess.run(
        ["git", "log", "-1", "--format=%H", "--", rel_path],
        cwd=str(repo_root),
        capture_output=True,
        text=True,
        check=False,
    )
    sha = proc.stdout.strip()
    return sha if proc.returncode == 0 and HEX40_RE.match(sha) else None


def _unescape_pointer_segment(seg: str) -> str:
    return seg.replace("~1", "/").replace("~0", "~")


def expand_pointer_ranges(ptr: str) -> list[str]:
    """Expand `0..N` range segments or `/*` wildcard segments in a JSON Pointer."""
    if not ptr.startswith("/"):
        ptr = "/" + ptr
    segs = ptr.split("/")[1:]
    paths: list[list[str]] = [[]]
    for s in segs:
        m = RANGE_SEG_RE.match(s)
        if m:
            lo, hi = int(m.group(1)), int(m.group(2))
            if hi >= lo:
                paths = [p + [str(i)] for p in paths for i in range(lo, hi + 1)]
                continue
        if "," in s and all(part.isdigit() for part in s.split(",")):
            nums = s.split(",")
            paths = [p + [n] for p in paths for n in nums]
            continue
        paths = [p + [s] for p in paths]
    return ["/" + "/".join(p) for p in paths]


def resolve_json_pointer(doc: Any, ptr: str) -> tuple[bool, Any]:
    """Resolve an RFC6901 JSON Pointer (supporting `*` wildcard on non-empty arrays)."""
    if ptr in ("", "/"):
        return True, doc
    if not ptr.startswith("/"):
        return False, None
    segs = [_unescape_pointer_segment(s) for s in ptr.split("/")[1:]]

    def _step(cur: Any, idx: int) -> tuple[bool, Any]:
        if idx >= len(segs):
            return True, cur
        seg = segs[idx]
        if seg == "*":
            if isinstance(cur, list) and len(cur) > 0:
                for elem in cur:
                    ok, _ = _step(elem, idx + 1)
                    if not ok:
                        return False, None
                return True, cur
            if isinstance(cur, dict) and len(cur) > 0:
                for elem in cur.values():
                    ok, _ = _step(elem, idx + 1)
                    if not ok:
                        return False, None
                return True, cur
            return False, None
        if isinstance(cur, dict):
            if seg in cur:
                return _step(cur[seg], idx + 1)
            return False, None
        if isinstance(cur, list):
            if seg.isdigit():
                i = int(seg)
                if 0 <= i < len(cur):
                    return _step(cur[i], idx + 1)
            return False, None
        return False, None

    return _step(doc, 0)


def check_pin_sha256(
    repo_root: Path,
    file_path: str,
    data: dict[str, Any] | None = None,
    base_rev: str | None = None,
    head_rev: str | None = None,
) -> dict[str, Any]:
    """CHK-PIN-SHA256: Verify file SHA-256 and canonical JSON SHA-256 pins."""
    if data is None:
        data = _load_json(repo_root, file_path, head_rev)
    if not isinstance(data, dict):
        return {
            "check": "CHK-PIN-SHA256",
            "passed": False,
            "checked_count": 0,
            "failures": [
                {
                    "check": "CHK-PIN-SHA256",
                    "file": file_path,
                    "pointer": "/",
                    "target_path": file_path,
                    "revision": head_rev or "WORKTREE",
                    "expected_sha256": "valid_json_object",
                    "actual_sha256": "missing_or_invalid",
                }
            ],
            "derived_from": DERIVATION_MAP["CHK-PIN-SHA256"],
        }

    eff_base = base_rev or data.get("source_main") or data.get("request_base_sha")
    eff_head = head_rev

    aliases: dict[str, str] = {}
    if isinstance(data.get("path_aliases"), dict):
        aliases.update(data["path_aliases"])
    if isinstance(data.get("source_pins"), dict):
        for k, v in data["source_pins"].items():
            if isinstance(v, dict) and isinstance(v.get("path"), str):
                aliases[k] = v["path"]

    failures: list[dict[str, Any]] = []
    checked_count = 0

    # 1. `pins` object (freeze records)
    pins = data.get("pins")
    if isinstance(pins, dict):
        for k, expected in pins.items():
            if not isinstance(expected, str) or not HEX64_RE.match(expected):
                continue
            is_pre = k.endswith("_pre_sha256")
            is_post = k.endswith("_post_sha256")
            if is_pre:
                alias = k[: -len("_pre_sha256")]
                rev = eff_base
            elif is_post:
                alias = k[: -len("_post_sha256")]
                rev = eff_head
            elif k.endswith("_sha256"):
                alias = k[: -len("_sha256")]
                rev = eff_head or eff_base
            else:
                continue
            target_path = aliases.get(alias)
            if not target_path:
                continue
            checked_count += 1
            raw = _read_bytes(repo_root, target_path, rev)
            actual = hashlib.sha256(raw).hexdigest() if raw is not None else "missing"
            if (
                actual != expected
                and not is_pre
                and not is_post
                and eff_base
                and eff_base != rev
            ):
                # For non-pre/post pins in historical records when checked at WORKTREE,
                # record actual vs expected honestly so caller sees exact status.
                pass
            if actual != expected:
                failures.append(
                    {
                        "check": "CHK-PIN-SHA256",
                        "file": file_path,
                        "pointer": f"/pins/{k}",
                        "target_path": target_path,
                        "revision": rev or "WORKTREE",
                        "expected_sha256": expected,
                        "actual_sha256": actual,
                    }
                )

    # 2. `source_pins`, `source_basis`, `basic_design_ref`, `removed_materials`
    def _verify_pin_obj(obj: dict[str, Any], ptr: str) -> None:
        nonlocal checked_count
        tpath = obj.get("path") or obj.get("source_path")
        if not isinstance(tpath, str):
            return
        rev = (
            obj.get("revision")
            or obj.get("source_revision")
            or obj.get("commit")
            or eff_head
        )
        # Only check 40-hex revisions or worktree when revision is omitted
        if (
            isinstance(rev, str)
            and not HEX40_RE.match(rev)
            and rev not in ("WORKTREE", "HEAD")
        ):
            return
        for sha_key in ("sha256", "file_sha256", "source_sha256", "whole_sha256"):
            exp = obj.get(sha_key)
            if isinstance(exp, str) and HEX64_RE.match(exp):
                checked_count += 1
                raw = _read_bytes(repo_root, tpath, rev)
                act = hashlib.sha256(raw).hexdigest() if raw is not None else "missing"
                if act != exp:
                    failures.append(
                        {
                            "check": "CHK-PIN-SHA256",
                            "file": file_path,
                            "pointer": f"{ptr}/{sha_key}",
                            "target_path": tpath,
                            "revision": rev or "WORKTREE",
                            "expected_sha256": exp,
                            "actual_sha256": act,
                        }
                    )
        c_exp = obj.get("canonical_json_sha256")
        if isinstance(c_exp, str) and HEX64_RE.match(c_exp):
            checked_count += 1
            raw = _read_bytes(repo_root, tpath, rev)
            if raw is None:
                c_act = "missing"
            else:
                try:
                    c_act = _canonical_json_sha256(json.loads(raw.decode("utf-8")))
                except Exception:
                    c_act = "invalid_json"
            if c_act != c_exp:
                failures.append(
                    {
                        "check": "CHK-PIN-SHA256",
                        "file": file_path,
                        "pointer": f"{ptr}/canonical_json_sha256",
                        "target_path": tpath,
                        "revision": rev or "WORKTREE",
                        "expected_sha256": c_exp,
                        "actual_sha256": c_act,
                    }
                )

    for top_key in (
        "source_pins",
        "source_basis",
        "basic_design_ref",
        "removed_materials",
    ):
        sec = data.get(top_key)
        if isinstance(sec, dict):
            if "path" in sec or "source_path" in sec:
                _verify_pin_obj(sec, f"/{top_key}")
            else:
                for k, v in sec.items():
                    if isinstance(v, dict):
                        _verify_pin_obj(v, f"/{top_key}/{k}")
        elif isinstance(sec, list):
            for i, v in enumerate(sec):
                if isinstance(v, dict):
                    _verify_pin_obj(v, f"/{top_key}/{i}")

    not_evaluated = checked_count == 0
    not_evaluated_reason = "no_pinned_inputs_found" if not_evaluated else None
    if not_evaluated:
        failures.append(
            {
                "check": "CHK-PIN-SHA256",
                "file": file_path,
                "pointer": "/",
                "target_path": file_path,
                "revision": head_rev or "WORKTREE",
                "error": "not_evaluated:no_pinned_inputs_found",
            }
        )
    return {
        "check": "CHK-PIN-SHA256",
        "status": "not_evaluated" if not_evaluated else "evaluated",
        "not_evaluated_reason": not_evaluated_reason,
        "passed": (not not_evaluated) and len(failures) == 0,
        "checked_count": checked_count,
        "failures": failures,
        "derived_from": DERIVATION_MAP["CHK-PIN-SHA256"],
    }


def _load_removed_material_paths(repo_root: Path) -> set[str]:
    idx_path = "docs/governance/audits/tdd/removed-materials-index.json"
    idx_data = _load_json(repo_root, idx_path)
    removed: set[str] = set()
    if isinstance(idx_data, dict):
        for item in idx_data.get("removed_materials", []):
            if isinstance(item, dict) and isinstance(item.get("path"), str):
                removed.add(item["path"])
    return removed


def check_json_pointer(
    repo_root: Path,
    file_path: str,
    data: dict[str, Any] | None = None,
    base_rev: str | None = None,
    head_rev: str | None = None,
    removed_paths: set[str] | None = None,
) -> dict[str, Any]:
    """CHK-JSON-POINTER: Resolve all RFC6901 pointers (including aliases and 0..N ranges)."""
    if data is None:
        data = _load_json(repo_root, file_path, head_rev)
    if not isinstance(data, dict):
        return {
            "check": "CHK-JSON-POINTER",
            "passed": False,
            "checked_count": 0,
            "expanded_target_count": 0,
            "failures": [
                {
                    "check": "CHK-JSON-POINTER",
                    "file": file_path,
                    "source_pointer": "/",
                    "target_file": file_path,
                    "target_pointer": "/",
                    "error": "unresolved_pointer_or_unpinned_removed_file",
                }
            ],
            "derived_from": DERIVATION_MAP["CHK-JSON-POINTER"],
        }

    if removed_paths is None:
        removed_paths = _load_removed_material_paths(repo_root)

    aliases: dict[str, str] = {}
    if isinstance(data.get("path_aliases"), dict):
        aliases.update(data["path_aliases"])
    if isinstance(data.get("source_pins"), dict):
        for k, v in data["source_pins"].items():
            if isinstance(v, dict) and isinstance(v.get("path"), str):
                aliases[k] = v["path"]

    doc_cache: dict[tuple[str, str | None], Any] = {(file_path, head_rev): data}

    def _get_doc(tfile: str, rev: str | None) -> Any:
        key = (tfile, rev)
        if key not in doc_cache:
            doc_cache[key] = _load_json(repo_root, tfile, rev)
        return doc_cache[key]

    failures: list[dict[str, Any]] = []
    checked_count = 0
    expanded_target_count = 0

    def _verify_target(
        source_ptr: str,
        target_file: str,
        raw_ptr: str,
        explicit_rev: str | None = None,
    ) -> None:
        nonlocal checked_count, expanded_target_count
        checked_count += 1
        if target_file in removed_paths and not explicit_rev:
            failures.append(
                {
                    "check": "CHK-JSON-POINTER",
                    "file": file_path,
                    "source_pointer": source_ptr,
                    "target_file": target_file,
                    "target_pointer": raw_ptr,
                    "error": "unresolved_pointer_or_unpinned_removed_file",
                }
            )
            return

        rev = explicit_rev or head_rev
        tdoc = _get_doc(target_file, rev)
        if tdoc is None and base_rev and not explicit_rev:
            tdoc = _get_doc(target_file, base_rev)
        if tdoc is None:
            failures.append(
                {
                    "check": "CHK-JSON-POINTER",
                    "file": file_path,
                    "source_pointer": source_ptr,
                    "target_file": target_file,
                    "target_pointer": raw_ptr,
                    "error": "unresolved_pointer_or_unpinned_removed_file",
                }
            )
            return

        for exp_ptr in expand_pointer_ranges(raw_ptr):
            expanded_target_count += 1
            ok, _ = resolve_json_pointer(tdoc, exp_ptr)
            if not ok:
                failures.append(
                    {
                        "check": "CHK-JSON-POINTER",
                        "file": file_path,
                        "source_pointer": source_ptr,
                        "target_file": target_file,
                        "target_pointer": exp_ptr,
                        "error": "unresolved_pointer_or_unpinned_removed_file",
                    }
                )

    def _walk(node: Any, cur_ptr: str) -> None:
        if isinstance(node, dict):
            # Check explicit {"path"|"file": ..., "pointer": ...}
            tpath = node.get("path") or node.get("file")
            tptr = node.get("pointer")
            rev = (
                node.get("revision")
                or node.get("source_revision")
                or node.get("commit")
            )
            if isinstance(tpath, str) and tpath in removed_paths and not rev:
                failures.append(
                    {
                        "check": "CHK-JSON-POINTER",
                        "file": file_path,
                        "source_pointer": cur_ptr,
                        "target_file": tpath,
                        "target_pointer": tptr if isinstance(tptr, str) else "/",
                        "error": "unresolved_pointer_or_unpinned_removed_file",
                    }
                )
            if (
                isinstance(tpath, str)
                and isinstance(tptr, str)
                and tptr.startswith("/")
            ):
                resolved_path = aliases.get(tpath, tpath)
                _verify_target(
                    f"{cur_ptr}/pointer",
                    resolved_path,
                    tptr,
                    rev if isinstance(rev, str) and HEX40_RE.match(rev) else None,
                )
            for k, v in node.items():
                if k == "pointer" and isinstance(tpath, str):
                    continue
                _walk(v, f"{cur_ptr}/{k}")
        elif isinstance(node, list):
            for i, v in enumerate(node):
                _walk(v, f"{cur_ptr}/{i}")
        elif isinstance(node, str):
            # Avoid matching prose explanations that are not pointer references
            for m in POINTER_TOKEN_RE.finditer(node):
                prefix = m.group(1)
                frag = "/" + m.group(2).rstrip(".,;:)")
                if prefix is None or prefix == "":
                    # Local pointer `#/...`
                    # Skip placeholder patterns like `#/...`
                    if "..." in frag or "<" in frag:
                        continue
                    _verify_target(cur_ptr, file_path, frag)
                elif prefix in aliases:
                    _verify_target(cur_ptr, aliases[prefix], frag)
                elif prefix.endswith(".json") and (
                    prefix.startswith("docs/") or prefix.startswith("scaffold/")
                ):
                    _verify_target(cur_ptr, prefix, frag)

    _walk(data, "")

    not_evaluated = checked_count == 0
    not_evaluated_reason = "no_json_pointers_found" if not_evaluated else None
    if not_evaluated:
        failures.append(
            {
                "check": "CHK-JSON-POINTER",
                "file": file_path,
                "source_pointer": "/",
                "target_file": file_path,
                "target_pointer": "/",
                "error": "not_evaluated:no_json_pointers_found",
            }
        )
    return {
        "check": "CHK-JSON-POINTER",
        "status": "not_evaluated" if not_evaluated else "evaluated",
        "not_evaluated_reason": not_evaluated_reason,
        "passed": (not not_evaluated) and len(failures) == 0,
        "checked_count": checked_count,
        "expanded_target_count": expanded_target_count,
        "failures": failures,
        "derived_from": DERIVATION_MAP["CHK-JSON-POINTER"],
    }


def check_pair_bidir_id(
    repo_root: Path,
    left_path: str,
    right_path: str,
    left_data: dict[str, Any] | None = None,
    right_data: dict[str, Any] | None = None,
    left_key: str | None = None,
    right_key: str | None = None,
    left_layer: str | None = None,
) -> dict[str, Any]:
    """CHK-PAIR-BIDIR-ID: Verify 1-to-1 bidirectional ID links and /completion/* counts."""
    if left_data is None:
        left_data = _load_json(repo_root, left_path)
    if right_data is None:
        right_data = _load_json(repo_root, right_path)

    if not isinstance(left_data, dict) or not isinstance(right_data, dict):
        return {
            "check": "CHK-PAIR-BIDIR-ID",
            "passed": False,
            "left_count": 0,
            "right_count": 0,
            "failures": [
                {
                    "check": "CHK-PAIR-BIDIR-ID",
                    "left_path": left_path,
                    "right_path": right_path,
                    "pointer": "/",
                    "error": "missing_reverse_link",
                    "expected": "valid_json_pair",
                    "actual": "missing_or_invalid",
                }
            ],
            "derived_from": DERIVATION_MAP["CHK-PAIR-BIDIR-ID"],
        }

    if left_key is None:
        left_key = "requirements" if "requirements" in left_data else "contracts"
    if right_key is None:
        right_key = "cases"

    l_items = left_data.get(left_key, [])
    r_items = right_data.get(right_key, [])
    if not isinstance(l_items, list):
        l_items = []
    if not isinstance(r_items, list):
        r_items = []

    failures: list[dict[str, Any]] = []
    l_by_id: dict[str, tuple[int, dict[str, Any]]] = {}
    r_by_id: dict[str, tuple[int, dict[str, Any]]] = {}

    for i, item in enumerate(l_items):
        if not isinstance(item, dict):
            continue
        iid = item.get("id")
        if not isinstance(iid, str) or not iid:
            failures.append(
                {
                    "check": "CHK-PAIR-BIDIR-ID",
                    "left_path": left_path,
                    "right_path": right_path,
                    "pointer": f"/{left_key}/{i}",
                    "error": "missing_reverse_link",
                    "expected": "non_empty_id",
                    "actual": str(iid),
                }
            )
            continue
        if iid in l_by_id:
            failures.append(
                {
                    "check": "CHK-PAIR-BIDIR-ID",
                    "left_path": left_path,
                    "right_path": right_path,
                    "pointer": f"/{left_key}/{i}/id",
                    "error": "duplicate_id",
                    "expected": "unique_id",
                    "actual": iid,
                }
            )
        l_by_id[iid] = (i, item)

    for i, item in enumerate(r_items):
        if not isinstance(item, dict):
            continue
        iid = item.get("id")
        if not isinstance(iid, str) or not iid:
            failures.append(
                {
                    "check": "CHK-PAIR-BIDIR-ID",
                    "left_path": left_path,
                    "right_path": right_path,
                    "pointer": f"/{right_key}/{i}",
                    "error": "missing_reverse_link",
                    "expected": "non_empty_id",
                    "actual": str(iid),
                }
            )
            continue
        if iid in r_by_id:
            failures.append(
                {
                    "check": "CHK-PAIR-BIDIR-ID",
                    "left_path": left_path,
                    "right_path": right_path,
                    "pointer": f"/{right_key}/{i}/id",
                    "error": "duplicate_id",
                    "expected": "unique_id",
                    "actual": iid,
                }
            )
        r_by_id[iid] = (i, item)

    if len(l_items) != len(r_items):
        failures.append(
            {
                "check": "CHK-PAIR-BIDIR-ID",
                "left_path": left_path,
                "right_path": right_path,
                "pointer": f"/{left_key}",
                "error": "count_mismatch",
                "expected": str(len(l_items)),
                "actual": str(len(r_items)),
            }
        )

    eff_left_layer = left_layer or _infer_layer(left_path)
    if eff_left_layer == "UNKNOWN" and left_key == "requirements":
        eff_left_layer = "L3"

    if eff_left_layer == "L3" or left_key == "requirements":
        reverse_ref_keys: tuple[str, ...] = (
            "requirement_ref",
            "design_ref",
            "contract_ref",
            "detail_design_ref",
            "function_design_ref",
        )
    elif eff_left_layer == "L4":
        reverse_ref_keys = (
            "design_ref",
            "contract_ref",
            "l4_contract_ref",
            "requirement_ref",
        )
    elif eff_left_layer == "L5":
        reverse_ref_keys = (
            "l5_contract_ref",
            "detail_design_ref",
            "design_ref",
            "contract_ref",
            "requirement_ref",
        )
    elif eff_left_layer == "L6":
        reverse_ref_keys = (
            "function_design_ref",
            "design_ref",
            "contract_ref",
            "requirement_ref",
        )
    else:
        reverse_ref_keys = (
            "design_ref",
            "contract_ref",
            "l4_contract_ref",
            "l5_contract_ref",
            "detail_design_ref",
            "function_design_ref",
            "requirement_ref",
        )

    def _pick_reverse_ref(ritem: dict[str, Any]) -> Any:
        for rk in reverse_ref_keys:
            val = ritem.get(rk)
            if val:
                return val
        return None

    for iid, (i, item) in l_by_id.items():
        forward_ref = (
            item.get("oracle_ref")
            or item.get("paired_oracle_ref")
            or item.get("unit_oracle_ref")
            or item.get("test_ref")
        )
        if not isinstance(forward_ref, str) or forward_ref not in r_by_id:
            failures.append(
                {
                    "check": "CHK-PAIR-BIDIR-ID",
                    "left_path": left_path,
                    "right_path": right_path,
                    "pointer": f"/{left_key}/{i}/oracle_ref",
                    "error": "missing_reverse_link",
                    "expected": f"existing_{right_key}_id",
                    "actual": str(forward_ref),
                }
            )
            continue
        ri, ritem = r_by_id[forward_ref]
        back_ref = _pick_reverse_ref(ritem)
        if back_ref != iid:
            failures.append(
                {
                    "check": "CHK-PAIR-BIDIR-ID",
                    "left_path": left_path,
                    "right_path": right_path,
                    "pointer": f"/{right_key}/{ri}",
                    "error": "missing_reverse_link",
                    "expected": iid,
                    "actual": str(back_ref),
                }
            )

    for rid, (ri, ritem) in r_by_id.items():
        back_ref = _pick_reverse_ref(ritem)
        if not isinstance(back_ref, str) or back_ref not in l_by_id:
            failures.append(
                {
                    "check": "CHK-PAIR-BIDIR-ID",
                    "left_path": left_path,
                    "right_path": right_path,
                    "pointer": f"/{right_key}/{ri}",
                    "error": "missing_reverse_link",
                    "expected": f"existing_{left_key}_id",
                    "actual": str(back_ref),
                }
            )

    # Check /completion/* count metadata (#3759 R1-i2 defense)
    comp = right_data.get("completion")
    if isinstance(comp, dict):
        if "unit_case_count" in comp and comp["unit_case_count"] != len(r_items):
            failures.append(
                {
                    "check": "CHK-PAIR-BIDIR-ID",
                    "left_path": left_path,
                    "right_path": right_path,
                    "pointer": "/completion/unit_case_count",
                    "error": "count_mismatch",
                    "expected": str(len(r_items)),
                    "actual": str(comp["unit_case_count"]),
                }
            )
        if "negative_case_count" in comp:
            actual_neg = sum(
                len(c.get("negative_cases", []))
                for c in r_items
                if isinstance(c, dict) and isinstance(c.get("negative_cases"), list)
            )
            if comp["negative_case_count"] != actual_neg:
                failures.append(
                    {
                        "check": "CHK-PAIR-BIDIR-ID",
                        "left_path": left_path,
                        "right_path": right_path,
                        "pointer": "/completion/negative_case_count",
                        "error": "count_mismatch",
                        "expected": str(actual_neg),
                        "actual": str(comp["negative_case_count"]),
                    }
                )

    for ri, ritem in enumerate(r_items):
        if (
            isinstance(ritem, dict)
            and "negative_case_count" in ritem
            and isinstance(ritem.get("negative_cases"), list)
        ):
            actual_case_neg = len(ritem["negative_cases"])
            if ritem["negative_case_count"] != actual_case_neg:
                failures.append(
                    {
                        "check": "CHK-PAIR-BIDIR-ID",
                        "left_path": left_path,
                        "right_path": right_path,
                        "pointer": f"/{right_key}/{ri}/negative_case_count",
                        "error": "count_mismatch",
                        "expected": str(actual_case_neg),
                        "actual": str(ritem["negative_case_count"]),
                    }
                )

    not_evaluated = len(l_items) == 0 or len(r_items) == 0
    not_evaluated_reason = (
        f"empty_pair_entities:left={len(l_items)},right={len(r_items)}"
        if not_evaluated
        else None
    )
    if not_evaluated:
        failures.append(
            {
                "check": "CHK-PAIR-BIDIR-ID",
                "left_path": left_path,
                "right_path": right_path,
                "pointer": "/",
                "error": f"not_evaluated:{not_evaluated_reason}",
            }
        )
    return {
        "check": "CHK-PAIR-BIDIR-ID",
        "status": "not_evaluated" if not_evaluated else "evaluated",
        "not_evaluated_reason": not_evaluated_reason,
        "passed": (not not_evaluated) and len(failures) == 0,
        "left_count": len(l_items),
        "right_count": len(r_items),
        "failures": failures,
        "derived_from": DERIVATION_MAP["CHK-PAIR-BIDIR-ID"],
    }


def _infer_layer(file_path: str) -> str:
    base = Path(file_path).name
    for tok in ("L10", "L3", "L4", "L5", "L6", "L7", "L8", "L9"):
        if (
            f"/{tok}-" in file_path
            or file_path.startswith(f"{tok}-")
            or base == f"{tok}.json"
            or base.startswith(f"{tok}_")
        ):
            return tok
    return "UNKNOWN"


def check_ownership_cap(
    repo_root: Path,
    file_path: str,
    data: Any = None,
    layer: str | None = None,
    scope_pointer: str = "",
) -> dict[str, Any]:
    """CHK-OWNERSHIP-CAP-L8L9 / CHK-OWNERSHIP-CAP-L3L6: Forbidden material keys check.

    Per Issue #3510 comments 6408252809 and 6447665479, no byte/KB size threshold is used.
    """
    if data is None:
        data = _load_json(repo_root, file_path)
    eff_layer = layer or _infer_layer(file_path)
    is_l8_l9 = eff_layer in ("L8", "L9")
    check_id = "CHK-OWNERSHIP-CAP-L8L9" if is_l8_l9 else "CHK-OWNERSHIP-CAP-L3L6"
    if eff_layer == "L7":
        return {
            "check": check_id,
            "passed": True,
            "status": "not_applicable",
            "reason": "L7 owns full verification material; this ownership cap applies to consuming layers.",
            "layer": eff_layer,
            "file": file_path,
            "failures": [],
            "derived_from": DERIVATION_MAP[check_id],
        }
    forbidden_keys = (
        FORBIDDEN_MATERIAL_KEYS_L8L9 if is_l8_l9 else FORBIDDEN_MATERIAL_KEYS_COMMON
    )

    failures: list[dict[str, Any]] = []

    def _walk(node: Any, ptr: str, ancestors: tuple[str, ...]) -> None:
        if isinstance(node, dict):
            sibling_keys = set(node.keys())
            for k, v in node.items():
                cptr = f"{ptr}/{k}"
                if k in forbidden_keys:
                    failures.append(
                        {
                            "check": "CHK-OWNERSHIP-CAP",
                            "layer": eff_layer,
                            "file": file_path,
                            "pointer": cptr,
                            "violation": "forbidden_key",
                            "key": k,
                        }
                    )
                elif is_l8_l9 and (k.endswith("_sha256") or k == "sha256"):
                    if not (
                        any(anc in ALLOWED_SHA256_ANCESTOR_KEYS for anc in ancestors)
                        or bool(sibling_keys & ALLOWED_SHA256_SIBLING_KEYS)
                    ):
                        failures.append(
                            {
                                "check": "CHK-OWNERSHIP-CAP",
                                "layer": eff_layer,
                                "file": file_path,
                                "pointer": cptr,
                                "violation": "forbidden_key",
                                "key": k,
                            }
                        )
                _walk(v, cptr, ancestors + (k,))
        elif isinstance(node, list):
            for i, v in enumerate(node):
                _walk(v, f"{ptr}/{i}", ancestors)

    target_node = data
    if scope_pointer and scope_pointer not in ("", "/"):
        ok, resolved = resolve_json_pointer(data, scope_pointer)
        target_node = resolved if ok else {}
    _walk(target_node, scope_pointer if scope_pointer != "/" else "", ())

    return {
        "check": check_id,
        "passed": len(failures) == 0,
        "layer": eff_layer,
        "file": file_path,
        "failures": failures,
        "derived_from": DERIVATION_MAP[check_id],
    }


def _extract_neg_key(item: dict[str, Any]) -> str:
    for k in ("expected_classification", "code", "id"):
        val = item.get(k)
        if isinstance(val, str) and val:
            return val
    return ""


def _negative_case_identity(item: dict[str, Any]) -> str | None:
    for key in ("integration_case_ref", "basic_case_ref"):
        value = item.get(key)
        if isinstance(value, str) and value.strip():
            return value
    return None


def _normalize_neg_item(item: dict[str, Any], layer: str) -> dict[str, Any]:
    return {
        "id": item.get("id"),
        "change_or_condition": item.get("change") or item.get("condition"),
        "classification_or_code": item.get("expected_classification")
        or item.get("code"),
        "expected_axis": item.get("expected_axis") or item.get("axis"),
        "expected_state": item.get("expected_state") or item.get("state"),
        "expected": item.get("expected") or item.get("effect"),
        "expected_preserved": item.get("expected_preserved"),
        "backflow_owner": item.get("backflow_owner"),
        "side_effect_count": item.get(
            "expected_side_effect_count", item.get("side_effect_count")
        ),
        "integration_case_ref": item.get("integration_case_ref")
        or item.get("basic_case_ref"),
        "rule_ref": item.get("rule_ref") or (item.get("id") if layer == "L5" else None),
        "function_ref": item.get("function_ref") or item.get("handler_ref"),
    }


_NEGATIVE_EQUIVALENCE_CLASSES = "negative_equivalence_classes"


def _has_negative_equivalence_marker(data: Any) -> bool:
    if not isinstance(data, dict):
        return False
    if _NEGATIVE_EQUIVALENCE_CLASSES in data:
        return True
    for collection_name in ("contracts", "functions"):
        rows = data.get(collection_name)
        if isinstance(rows, list) and any(
            isinstance(row, dict) and _NEGATIVE_EQUIVALENCE_CLASSES in row
            for row in rows
        ):
            return True
    return False


def _check_negative_equivalence_mode(
    l4_data: Any,
    l9_data: Any,
    l8_data: Any,
    l5_data: Any,
) -> dict[str, Any]:
    """Compare explicit class tables and supplied case rows without casewise L4/L5 copies."""
    failures: list[dict[str, Any]] = []
    matched_case_count = 0

    def json_values_equal(left: Any, right: Any) -> bool:
        """Compare parsed JSON values without Python's bool/int equality alias."""
        if type(left) is not type(right):
            return False
        if isinstance(left, dict):
            return left.keys() == right.keys() and all(
                json_values_equal(left[key], right[key]) for key in left
            )
        if isinstance(left, list):
            return len(left) == len(right) and all(
                json_values_equal(a, b) for a, b in zip(left, right)
            )
        return left == right

    def key_json_value(value: Any) -> Any:
        """Build a hashable JSON type-preserving key component."""
        if isinstance(value, dict):
            return (
                "object",
                tuple((key, key_json_value(value[key])) for key in sorted(value)),
            )
        if isinstance(value, list):
            return ("array", tuple(key_json_value(item) for item in value))
        return (type(value).__name__, value)

    def valid_axis(value: Any) -> bool:
        return (
            isinstance(value, str)
            and bool(value.strip())
            or isinstance(value, list)
            and bool(value)
            and all(isinstance(item, str) and item.strip() for item in value)
        )

    def fail(
        attribute: str,
        *,
        layer: str | None = None,
        case_id: Any = None,
        reason: str,
    ) -> None:
        item: dict[str, Any] = {
            "check": "CHK-NEG-4WAY-MATCH",
            "attribute": attribute,
            "reason": reason,
        }
        if layer is not None:
            item["layer"] = layer
        if case_id is not None:
            item["case_id"] = case_id
        failures.append(item)

    def declared_source_rows(data: Any, layer: str, source_rows: str) -> list[Any]:
        if not isinstance(data, dict):
            fail("explicit_mode", layer=layer, reason="layer_not_object")
            return []
        marker = data.get(_NEGATIVE_EQUIVALENCE_CLASSES)
        if marker != {"source_rows": source_rows}:
            fail("explicit_mode", layer=layer, reason="class_source_marker_invalid")
            return []
        rows = data.get(source_rows)
        if not isinstance(rows, list):
            fail("explicit_mode", layer=layer, reason=f"{source_rows}_not_array")
            return []
        return rows

    def explicit_class_rows(data: Any, layer: str) -> list[Any]:
        if not isinstance(data, dict):
            fail("explicit_mode", layer=layer, reason="layer_not_object")
            return []
        if _NEGATIVE_EQUIVALENCE_CLASSES not in data:
            fail("explicit_mode", layer=layer, reason="class_table_marker_missing")
            return []
        rows = data[_NEGATIVE_EQUIVALENCE_CLASSES]
        if not isinstance(rows, list):
            fail("explicit_mode", layer=layer, reason="class_table_not_array")
            return []
        return rows

    raw_class_rows: dict[str, list[Any]] = {
        "L4": declared_source_rows(l4_data, "L4", "failure_classifications"),
        "L5": declared_source_rows(l5_data, "L5", "failure_rules"),
        "L8": explicit_class_rows(l8_data, "L8"),
        "L9": explicit_class_rows(l9_data, "L9"),
    }

    def build_class_index(
        rows: list[Any], layer: str
    ) -> tuple[dict[str, dict[str, Any]], list[dict[str, Any]]]:
        by_id: dict[str, dict[str, Any]] = {}
        normalized: list[dict[str, Any]] = []
        for index, raw in enumerate(rows):
            if not isinstance(raw, dict):
                fail(
                    "equivalence_class",
                    layer=layer,
                    case_id=index,
                    reason="class_row_not_object",
                )
                continue
            class_id = raw.get("class_id", raw.get("id"))
            if not isinstance(class_id, str) or not class_id.strip():
                fail(
                    "equivalence_class",
                    layer=layer,
                    case_id=index,
                    reason="class_id_missing_or_invalid",
                )
                continue
            if class_id in by_id:
                fail(
                    "equivalence_class",
                    layer=layer,
                    case_id=class_id,
                    reason="duplicate_class_id",
                )
                continue

            if layer in ("L4", "L5"):
                classification = raw.get("code")
                declared_classification = raw.get("expected_classification")
                if (
                    declared_classification is not None
                    and declared_classification != classification
                ):
                    fail(
                        "equivalence_key",
                        layer=layer,
                        case_id=class_id,
                        reason="code_disagrees_with_classification",
                    )
            else:
                classification = raw.get("expected_classification")
            if not isinstance(classification, str) or not classification.strip():
                fail(
                    "equivalence_key",
                    layer=layer,
                    case_id=class_id,
                    reason="classification_missing_or_invalid",
                )
                continue

            expected = raw.get("expected")
            if not isinstance(expected, dict) or "finding_codes" not in expected:
                fail(
                    "equivalence_key",
                    layer=layer,
                    case_id=class_id,
                    reason="finding_codes_missing",
                )
                continue
            codes = expected["finding_codes"]
            if not isinstance(codes, list) or any(
                not isinstance(code, str) or not code.strip() for code in codes
            ):
                fail(
                    "equivalence_key",
                    layer=layer,
                    case_id=class_id,
                    reason="finding_codes_not_string_array",
                )
                continue

            owner = raw.get("backflow_owner")
            if layer != "L8" and (not isinstance(owner, str) or not owner.strip()):
                fail(
                    "equivalence_key",
                    layer=layer,
                    case_id=class_id,
                    reason="backflow_owner_missing_or_invalid",
                )
                continue
            if (
                layer == "L8"
                and "backflow_owner" in raw
                and (not isinstance(owner, str) or not owner.strip())
            ):
                fail(
                    "equivalence_key",
                    layer=layer,
                    case_id=class_id,
                    reason="backflow_owner_invalid",
                )
                continue

            axis = raw.get("expected_axis")
            state = raw.get("expected_state")
            side_effect_count = raw.get(
                "side_effect_count", raw.get("expected_side_effect_count")
            )
            if not valid_axis(axis):
                fail(
                    "expected_axis",
                    layer=layer,
                    case_id=class_id,
                    reason="class_invariant_missing_or_invalid",
                )
            if not isinstance(state, str) or not state.strip():
                fail(
                    "expected_state",
                    layer=layer,
                    case_id=class_id,
                    reason="class_invariant_missing_or_invalid",
                )
            if (
                isinstance(side_effect_count, bool)
                or not isinstance(side_effect_count, int)
                or side_effect_count != 0
            ):
                fail(
                    "side_effect_count",
                    layer=layer,
                    case_id=class_id,
                    reason="class_invariant_not_zero",
                )

            function_ref = raw.get("function_ref") if layer == "L5" else None
            contract_ref = raw.get("contract_ref") if layer == "L5" else None
            owner_ref: tuple[str, str] | None = None
            if layer == "L5":
                if "function_ref" in raw:
                    if isinstance(function_ref, str) and function_ref.strip():
                        owner_ref = ("function_ref", function_ref)
                    else:
                        fail(
                            "owner_ref",
                            layer=layer,
                            case_id=class_id,
                            reason="declared_function_ref_invalid_no_contract_fallback",
                        )
                elif "contract_ref" in raw:
                    if isinstance(contract_ref, str) and contract_ref.strip():
                        owner_ref = ("contract_ref", contract_ref)
                    else:
                        fail(
                            "owner_ref",
                            layer=layer,
                            case_id=class_id,
                            reason="declared_contract_ref_invalid",
                        )
                else:
                    fail(
                        "owner_ref",
                        layer=layer,
                        case_id=class_id,
                        reason="rule_owner_ref_missing_or_invalid",
                    )
            key = (
                classification,
                tuple(codes),
                owner if isinstance(owner, str) else None,
                key_json_value(axis),
                state,
                owner_ref,
            )
            item = {
                "id": class_id,
                "key": key,
                "partial_key": (classification, tuple(codes)),
                "owner_present": isinstance(owner, str),
                "owner_ref": owner_ref,
                "axis": axis,
                "state": state,
                "side_effect_count": side_effect_count,
                "raw": raw,
            }
            by_id[class_id] = item
            normalized.append(item)
        return by_id, normalized

    class_indexes: dict[str, dict[str, dict[str, Any]]] = {}
    normalized_rows: dict[str, list[dict[str, Any]]] = {}
    for layer in ("L4", "L9", "L8", "L5"):
        class_indexes[layer], normalized_rows[layer] = build_class_index(
            raw_class_rows[layer], layer
        )

    def case_array(
        data: Any, member: str, layer: str, id_field: str
    ) -> tuple[dict[str, dict[str, Any]], int]:
        if not isinstance(data, dict):
            return {}, 0
        rows = data.get(member)
        if not isinstance(rows, list):
            fail("case_identity", layer=layer, reason=f"{member}_missing_or_not_array")
            return {}, 0
        by_id: dict[str, dict[str, Any]] = {}
        for index, row in enumerate(rows):
            if not isinstance(row, dict):
                fail(
                    "case_identity",
                    layer=layer,
                    case_id=index,
                    reason="case_row_not_object",
                )
                continue
            case_id = row.get(id_field)
            if not isinstance(case_id, str) or not case_id.strip():
                fail(
                    "case_identity",
                    layer=layer,
                    case_id=index,
                    reason="case_id_missing_or_invalid",
                )
                continue
            if case_id in by_id:
                fail(
                    "case_identity",
                    layer=layer,
                    case_id=case_id,
                    reason="duplicate_case_id",
                )
                continue
            state = row.get("population_state")
            if state not in ("positive", "negative", "unknown"):
                fail(
                    "population_state",
                    layer=layer,
                    case_id=case_id,
                    reason="population_state_missing_or_invalid",
                )
            elif state == "unknown":
                fail(
                    "population_state",
                    layer=layer,
                    case_id=case_id,
                    reason="population_state_unknown",
                )
            by_id[case_id] = row
        return by_id, len(rows)

    l8_cases, l8_case_row_count = case_array(l8_data, "unit_cases", "L8", "case_id")
    l9_cases, l9_case_row_count = case_array(l9_data, "integration_cases", "L9", "id")
    functions = l5_data.get("functions", []) if isinstance(l5_data, dict) else []
    function_by_id: dict[str, dict[str, Any]] = {}
    if not isinstance(functions, list):
        fail("function_ref", layer="L5", reason="functions_not_array")
        functions = []
    for index, function in enumerate(functions):
        if not isinstance(function, dict) or not isinstance(function.get("id"), str):
            fail(
                "function_ref",
                layer="L5",
                case_id=index,
                reason="function_id_missing_or_invalid",
            )
            continue
        if function["id"] in function_by_id:
            fail(
                "function_ref",
                layer="L5",
                case_id=function["id"],
                reason="duplicate_function_id",
            )
            continue
        function_by_id[function["id"]] = function
    contracts = l5_data.get("contracts", []) if isinstance(l5_data, dict) else []
    contract_by_id: dict[str, dict[str, Any]] = {}
    if not isinstance(contracts, list):
        fail("contract_ref", layer="L5", reason="contracts_not_array")
        contracts = []
    for index, contract in enumerate(contracts):
        if not isinstance(contract, dict) or not isinstance(contract.get("id"), str):
            fail(
                "contract_ref",
                layer="L5",
                case_id=index,
                reason="contract_id_missing_or_invalid",
            )
            continue
        if contract["id"] in contract_by_id:
            fail(
                "contract_ref",
                layer="L5",
                case_id=contract["id"],
                reason="duplicate_contract_id",
            )
            continue
        contract_by_id[contract["id"]] = contract

    l8_owner_observations: dict[str, set[str]] = {}
    l8_seen_l9_ids: set[str] = set()
    rules_by_id: dict[str, list[dict[str, Any]]] = {}
    for row in raw_class_rows["L5"]:
        if isinstance(row, dict) and isinstance(row.get("id"), str):
            rules_by_id.setdefault(row["id"], []).append(row)
    rules = {
        rule_id: rule_rows[0]
        for rule_id, rule_rows in rules_by_id.items()
        if len(rule_rows) == 1
    }
    for rule_id, rule in rules.items():
        function_ref = rule.get("function_ref")
        contract_ref = rule.get("contract_ref")
        if "function_ref" in rule:
            if not isinstance(function_ref, str) or not function_ref.strip():
                fail(
                    "function_ref",
                    layer="L5",
                    case_id=rule_id,
                    reason="declared_function_ref_invalid_no_contract_fallback",
                )
            elif function_ref not in function_by_id:
                fail(
                    "function_ref",
                    layer="L5",
                    case_id=rule_id,
                    reason="rule_function_ref_unresolved",
                )
        elif not isinstance(contract_ref, str) or not contract_ref.strip():
            fail(
                "owner_ref",
                layer="L5",
                case_id=rule_id,
                reason="rule_owner_ref_missing_or_invalid",
            )
        if isinstance(contract_ref, str) and contract_ref.strip():
            contract = contract_by_id.get(contract_ref)
            if contract is None:
                fail(
                    "contract_ref",
                    layer="L5",
                    case_id=rule_id,
                    reason="rule_contract_ref_unresolved",
                )
            elif (
                isinstance(function_ref, str)
                and function_ref.strip()
                and contract.get("function") != function_ref
            ):
                fail(
                    "contract_ref",
                    layer="L5",
                    case_id=rule_id,
                    reason="rule_function_ref_disagrees_with_contract",
                )
    rules_by_integration_case: dict[str, list[dict[str, Any]]] = {}
    for rule in rules.values():
        case_ref = rule.get("integration_case_ref")
        if isinstance(case_ref, str) and case_ref.strip():
            rules_by_integration_case.setdefault(case_ref, []).append(rule)
    l8_owner_refs: dict[str, set[tuple[str, str]]] = {}
    l9_owner_refs: dict[str, set[tuple[str, str]]] = {}
    for l8_id, l8_row in l8_cases.items():
        case_ref = l8_row.get("integration_case_ref")
        if not isinstance(case_ref, str) or case_ref not in l9_cases:
            fail(
                "integration_case_ref",
                layer="L8",
                case_id=l8_id,
                reason="integration_case_ref_unresolved",
            )
            continue
        if case_ref in l8_seen_l9_ids:
            fail(
                "integration_case_ref",
                layer="L8",
                case_id=l8_id,
                reason="integration_case_ref_not_one_to_one",
            )
            continue
        l8_seen_l9_ids.add(case_ref)
        l9_row = l9_cases[case_ref]
        state8, state9 = l8_row.get("population_state"), l9_row.get("population_state")
        if state8 != state9:
            fail(
                "population_state",
                case_id=l8_id,
                reason="population_state_differs_across_layers",
            )
            continue

        l8_condition = l8_row.get("condition", l8_row.get("change"))
        l9_condition = l9_row.get("change", l9_row.get("condition"))
        for attr, left, right in (
            ("case_condition", l8_condition, l9_condition),
            ("expected", l8_row.get("expected"), l9_row.get("expected")),
            (
                "expected_preserved",
                l8_row.get("expected_preserved"),
                l9_row.get("expected_preserved"),
            ),
        ):
            present8 = attr in l8_row
            present9 = attr in l9_row
            if not json_values_equal(left, right) or present8 != present9:
                fail(attr, case_id=l8_id, reason="case_attribute_differs_across_l8_l9")
        if ("condition" not in l8_row and "change" not in l8_row) or (
            "change" not in l9_row and "condition" not in l9_row
        ):
            fail("case_condition", case_id=l8_id, reason="case_condition_missing")
        if "expected" not in l8_row or "expected" not in l9_row:
            fail("expected", case_id=l8_id, reason="case_expected_missing")
        if "expected_preserved" not in l8_row or "expected_preserved" not in l9_row:
            fail(
                "expected_preserved",
                case_id=l8_id,
                reason="case_expected_preserved_missing",
            )

        if state8 == "positive":
            if "negative_class_ref" in l8_row or "negative_class_ref" in l9_row:
                fail(
                    "negative_class_ref",
                    case_id=l8_id,
                    reason="positive_case_has_class_ref",
                )
            continue
        if state8 != "negative":
            continue

        ref8, ref9 = l8_row.get("negative_class_ref"), l9_row.get("negative_class_ref")
        if not isinstance(ref8, str) or ref8 not in class_indexes["L8"]:
            fail(
                "negative_class_ref",
                layer="L8",
                case_id=l8_id,
                reason="negative_case_class_ref_missing_or_unresolved",
            )
            continue
        if not isinstance(ref9, str) or ref9 not in class_indexes["L9"]:
            fail(
                "negative_class_ref",
                layer="L9",
                case_id=l8_id,
                reason="negative_case_class_ref_missing_or_unresolved",
            )
            continue
        class8, class9 = class_indexes["L8"][ref8], class_indexes["L9"][ref9]

        if class8["partial_key"] != class9["partial_key"]:
            fail(
                "equivalence_key",
                case_id=l8_id,
                reason="paired_case_classification_or_findings_differ",
            )

        def check_case_invariants(
            row: dict[str, Any], class_row: dict[str, Any], layer: str
        ) -> None:
            for field, class_value in (
                ("expected_axis", class_row["axis"]),
                ("expected_state", class_row["state"]),
            ):
                value = row.get(field)
                if not valid_axis(value):
                    fail(
                        field,
                        layer=layer,
                        case_id=l8_id,
                        reason="case_class_invariant_missing_or_invalid",
                    )
                elif not json_values_equal(value, class_value):
                    fail(
                        field,
                        layer=layer,
                        case_id=l8_id,
                        reason="case_class_invariant_differs_from_class",
                    )

            side_effect_count = row.get(
                "side_effect_count", row.get("expected_side_effect_count")
            )
            if (
                isinstance(side_effect_count, bool)
                or not isinstance(side_effect_count, int)
                or side_effect_count != 0
                or side_effect_count != class_row["side_effect_count"]
            ):
                fail(
                    "side_effect_count",
                    layer=layer,
                    case_id=l8_id,
                    reason="case_class_invariant_not_zero_or_differs_from_class",
                )

        check_case_invariants(l8_row, class8, "L8")
        check_case_invariants(l9_row, class9, "L9")

        property8 = l8_row.get("expected_property")
        if not isinstance(property8, dict):
            fail(
                "equivalence_key",
                layer="L8",
                case_id=l8_id,
                reason="case_observation_missing_or_invalid",
            )
            continue
        case_classification8 = property8.get("condition")
        case_codes8 = property8.get("finding_codes")
        if case_classification8 != class8["partial_key"][0] or case_codes8 != list(
            class8["partial_key"][1]
        ):
            fail(
                "equivalence_key",
                layer="L8",
                case_id=l8_id,
                reason="case_observation_disagrees_with_class",
            )
        if class8["owner_present"]:
            l8_owner_observations.setdefault(ref8, set()).add(class8["key"][2])

        observation9 = l9_row.get("compact_whole_observation")
        if not isinstance(observation9, dict):
            fail(
                "equivalence_key",
                layer="L9",
                case_id=l8_id,
                reason="case_observation_missing_or_invalid",
            )
            continue
        findings9 = observation9.get("ordered_findings")
        if not isinstance(findings9, list):
            fail(
                "equivalence_key",
                layer="L9",
                case_id=l8_id,
                reason="ordered_findings_missing_or_invalid",
            )
            continue
        codes9: list[str] = []
        owners9: set[str] = set()
        malformed = False
        for finding_index, finding in enumerate(findings9):
            if not isinstance(finding, dict):
                fail(
                    "equivalence_key",
                    layer="L9",
                    case_id=l8_id,
                    reason=f"finding_{finding_index}_not_object",
                )
                malformed = True
                continue
            code, owner = finding.get("code"), finding.get("return_owner")
            if not isinstance(code, str) or not code.strip():
                fail(
                    "equivalence_key",
                    layer="L9",
                    case_id=l8_id,
                    reason=f"finding_{finding_index}_code_missing_or_invalid",
                )
                malformed = True
                continue
            if not isinstance(owner, str) or not owner.strip():
                fail(
                    "owner_unresolved",
                    layer="L9",
                    case_id=l8_id,
                    reason="finding_owner_missing_or_invalid",
                )
                malformed = True
                continue
            codes9.append(code)
            owners9.add(owner)
        if malformed or len(owners9) != 1:
            if not malformed:
                fail(
                    "owner_unresolved",
                    layer="L9",
                    case_id=l8_id,
                    reason="finding_owners_not_unique",
                )
            continue
        owner9 = next(iter(owners9))
        if class8["partial_key"] != class9["partial_key"] or owner9 != class9["key"][2]:
            fail(
                "equivalence_key",
                case_id=l8_id,
                reason="paired_case_class_keys_differ",
            )
        if (
            observation9.get("condition") != class9["partial_key"][0]
            or tuple(codes9) != class9["partial_key"][1]
            or class9["key"][2] != owner9
        ):
            fail(
                "equivalence_key",
                layer="L9",
                case_id=l8_id,
                reason="case_observation_disagrees_with_class",
            )
        if class8["owner_present"] and class8["key"][2] != owner9:
            fail(
                "equivalence_key",
                layer="L8",
                case_id=l8_id,
                reason="explicit_owner_disagrees_with_l9_findings",
            )
        l8_owner_observations.setdefault(ref8, set()).add(owner9)

        rule_ref, function_ref = l8_row.get("rule_ref"), l8_row.get("function_ref")
        if not isinstance(rule_ref, str) or rule_ref not in rules:
            fail(
                "rule_ref",
                layer="L8",
                case_id=l8_id,
                reason=(
                    "rule_ref_ambiguous"
                    if isinstance(rule_ref, str)
                    and len(rules_by_id.get(rule_ref, [])) > 1
                    else "rule_ref_unresolved"
                ),
            )
        else:
            rule = rules[rule_ref]
            resolved_rule_class = class_indexes["L5"].get(rule_ref)
            if resolved_rule_class is None:
                fail(
                    "rule_ref",
                    layer="L8",
                    case_id=l8_id,
                    reason="rule_ref_class_invalid",
                )
            elif (
                resolved_rule_class["partial_key"] != class9["partial_key"]
                or resolved_rule_class["axis"] != class9["axis"]
                or resolved_rule_class["state"] != class9["state"]
                or resolved_rule_class["key"][2] != class9["key"][2]
            ):
                fail(
                    "rule_ref",
                    layer="L8",
                    case_id=l8_id,
                    reason="rule_ref_points_to_different_class",
                )
            if rule.get("code") != class8["partial_key"][0]:
                fail(
                    "equivalence_key",
                    layer="L5",
                    case_id=l8_id,
                    reason="rule_code_disagrees_with_case_class",
                )
            rule_function_ref = rule.get("function_ref")
            rule_contract_ref = rule.get("contract_ref")
            contract = None
            if isinstance(rule_contract_ref, str) and rule_contract_ref.strip():
                contract = contract_by_id.get(rule_contract_ref)
                if contract is None:
                    fail(
                        "contract_ref",
                        layer="L5",
                        case_id=l8_id,
                        reason="rule_contract_ref_unresolved",
                    )

            if "function_ref" in rule:
                if (
                    not isinstance(rule_function_ref, str)
                    or not rule_function_ref.strip()
                ):
                    fail(
                        "function_ref",
                        layer="L5",
                        case_id=l8_id,
                        reason="declared_function_ref_invalid_no_contract_fallback",
                    )
                elif (
                    not isinstance(function_ref, str)
                    or function_ref not in function_by_id
                ):
                    fail(
                        "function_ref",
                        layer="L8",
                        case_id=l8_id,
                        reason="function_ref_unresolved_for_function_owned_rule",
                    )
                elif function_ref != rule_function_ref:
                    fail(
                        "function_ref",
                        layer="L8",
                        case_id=l8_id,
                        reason="function_ref_disagrees_with_rule",
                    )
            elif (
                not isinstance(rule_contract_ref, str) or not rule_contract_ref.strip()
            ):
                fail(
                    "owner_ref",
                    layer="L5",
                    case_id=l8_id,
                    reason="rule_owner_ref_missing_or_invalid",
                )

            if contract is not None:
                case_contract_ref = l8_row.get("contract_ref")
                requirement_trace = l8_row.get("requirement_trace")
                source_trace = l8_row.get("source_trace")
                has_contract_trace = False
                requirement_ref = contract.get("requirement_ref")

                if "contract_ref" in l8_row:
                    has_contract_trace = True
                    if case_contract_ref != rule_contract_ref:
                        fail(
                            "contract_ref",
                            layer="L8",
                            case_id=l8_id,
                            reason="case_contract_ref_disagrees_with_rule",
                        )

                if "requirement_trace" in l8_row:
                    has_contract_trace = True
                    if isinstance(requirement_trace, str):
                        trace_values = [requirement_trace]
                    elif isinstance(requirement_trace, list):
                        trace_values = requirement_trace
                        if any(not isinstance(value, str) for value in trace_values):
                            fail(
                                "contract_ref",
                                layer="L8",
                                case_id=l8_id,
                                reason="case_requirement_trace_contains_non_string",
                            )
                    else:
                        trace_values = []
                        fail(
                            "contract_ref",
                            layer="L8",
                            case_id=l8_id,
                            reason="case_requirement_trace_invalid",
                        )
                    if (
                        not isinstance(requirement_ref, str)
                        or requirement_ref not in trace_values
                    ):
                        fail(
                            "contract_ref",
                            layer="L8",
                            case_id=l8_id,
                            reason="case_requirement_trace_disagrees_with_rule_contract",
                        )

                if isinstance(source_trace, dict) and "requirement_ref" in source_trace:
                    has_contract_trace = True
                    trace_requirement_ref = source_trace["requirement_ref"]
                    if not isinstance(trace_requirement_ref, str):
                        fail(
                            "contract_ref",
                            layer="L8",
                            case_id=l8_id,
                            reason="case_source_trace_requirement_ref_invalid",
                        )
                    elif trace_requirement_ref != requirement_ref:
                        fail(
                            "contract_ref",
                            layer="L8",
                            case_id=l8_id,
                            reason="case_source_trace_requirement_ref_disagrees_with_rule_contract",
                        )

                if not has_contract_trace and "function_ref" not in rule:
                    fail(
                        "contract_ref",
                        layer="L8",
                        case_id=l8_id,
                        reason="case_contract_trace_missing_for_contract_owned_rule",
                    )
            if isinstance(rule_function_ref, str) and isinstance(
                rule_contract_ref, str
            ):
                contract = contract_by_id.get(rule_contract_ref)
                if contract is None:
                    fail(
                        "contract_ref",
                        layer="L5",
                        case_id=l8_id,
                        reason="rule_contract_ref_unresolved",
                    )
                elif contract.get("function") != rule_function_ref:
                    fail(
                        "contract_ref",
                        layer="L5",
                        case_id=l8_id,
                        reason="rule_function_ref_disagrees_with_contract",
                    )
            owner_ref = (
                resolved_rule_class.get("owner_ref") if resolved_rule_class else None
            )
            if owner_ref is not None:
                l8_owner_refs.setdefault(ref8, set()).add(owner_ref)
                l9_owner_refs.setdefault(ref9, set()).add(owner_ref)
        matched_case_count += 1

    for case_id in sorted(set(l9_cases) - l8_seen_l9_ids):
        fail(
            "integration_case_ref",
            layer="L9",
            case_id=case_id,
            reason="integration_case_not_referenced_from_l8",
        )

    def bind_class_owner_ref(
        layer: str,
        class_id: str,
        owner_refs: set[tuple[str, str]],
    ) -> None:
        item = class_indexes[layer].get(class_id)
        if item is None:
            return
        if len(owner_refs) != 1:
            fail(
                "owner_ref",
                layer=layer,
                case_id=class_id,
                reason=(
                    "class_owner_ref_unresolved"
                    if not owner_refs
                    else "class_members_have_different_owner_refs"
                ),
            )
            return
        owner_ref = next(iter(owner_refs))
        item["owner_ref"] = owner_ref
        item["key"] = (*item["key"][:5], owner_ref)

    for class_id, owner_refs in l8_owner_refs.items():
        bind_class_owner_ref("L8", class_id, owner_refs)
    for class_id, owner_refs in l9_owner_refs.items():
        bind_class_owner_ref("L9", class_id, owner_refs)

    l5_owner_refs_by_key: dict[tuple[Any, ...], set[tuple[str, str]]] = {}
    for row in normalized_rows["L5"]:
        if row.get("owner_ref") is not None:
            l5_owner_refs_by_key.setdefault(
                (
                    row["partial_key"],
                    row["key"][2],
                    key_json_value(row["axis"]),
                    row["state"],
                ),
                set(),
            ).add(row["owner_ref"])
    for row in normalized_rows["L4"]:
        raw = row["raw"]
        case_ref = raw.get("integration_case_ref")
        owner_refs: set[tuple[str, str]] = set()
        if "integration_case_ref" in raw and not isinstance(case_ref, str):
            fail(
                "integration_case_ref",
                layer="L4",
                case_id=row["id"],
                reason="l4_integration_case_ref_invalid",
            )
        elif isinstance(case_ref, str):
            matching_rules = rules_by_integration_case.get(case_ref, [])
            if len(matching_rules) == 1:
                l5_item = class_indexes["L5"].get(matching_rules[0].get("id"))
                if l5_item and l5_item.get("owner_ref") is not None:
                    owner_refs.add(l5_item["owner_ref"])
            else:
                fail(
                    "owner_ref",
                    layer="L4",
                    case_id=row["id"],
                    reason=(
                        "integration_case_ref_has_no_l5_rule"
                        if not matching_rules
                        else "integration_case_ref_matches_multiple_l5_rules"
                    ),
                )
        else:
            owner_refs = l5_owner_refs_by_key.get(
                (
                    row["partial_key"],
                    row["key"][2],
                    key_json_value(row["axis"]),
                    row["state"],
                ),
                set(),
            )
            if len(owner_refs) > 1:
                fail(
                    "owner_ref",
                    layer="L4",
                    case_id=row["id"],
                    reason="multiple_l5_owner_refs_without_l4_case_binding",
                )
        bind_class_owner_ref("L4", row["id"], owner_refs)

    invariant_by_key: dict[tuple[Any, ...], tuple[Any, Any, Any]] = {}
    for layer in ("L4", "L9", "L8", "L5"):
        for row in normalized_rows[layer]:
            key = row["key"]
            if layer == "L8" and not row["owner_present"]:
                owners = l8_owner_observations.get(row["id"], set())
                if len(owners) != 1:
                    fail(
                        "owner_unresolved" if owners else "equivalence_class",
                        layer="L8",
                        case_id=row["id"],
                        reason="class_owner_unresolved"
                        if owners
                        else "class_has_no_negative_members",
                    )
                    continue
                key = (
                    *row["partial_key"],
                    next(iter(owners)),
                    key_json_value(row["axis"]),
                    row["state"],
                    row["owner_ref"],
                )
            invariant = (
                key_json_value(row["axis"]),
                row["state"],
                row["side_effect_count"],
            )
            previous = invariant_by_key.get(key)
            if previous is not None and previous != invariant:
                for field, old, new in zip(
                    ("expected_axis", "expected_state", "side_effect_count"),
                    previous,
                    invariant,
                ):
                    if old != new:
                        fail(
                            field,
                            layer=layer,
                            case_id=row["id"],
                            reason="class_invariant_differs_within_equivalence_class",
                        )
            else:
                invariant_by_key.setdefault(key, invariant)
            row["key"] = key

    # L8 owner is derived from its L9 member findings before comparing class sets.
    keys_by_layer: dict[str, set[tuple[Any, ...]]] = {}
    row_counts: dict[str, int] = {}
    for layer in ("L4", "L9", "L8", "L5"):
        keys_by_layer[layer] = {
            tuple(row["key"])
            for row in normalized_rows[layer]
            if row.get("key") is not None
        }
        row_counts[layer] = len(raw_class_rows[layer])
    for layer in ("L4", "L9", "L8", "L5"):
        for key in keys_by_layer["L4"] - keys_by_layer[layer]:
            fail("equivalence_key", layer=layer, reason="class_key_missing_from_layer")
            fail(
                "equivalence_class", layer=layer, reason="class_key_missing_from_layer"
            )
        for key in keys_by_layer[layer] - keys_by_layer["L4"]:
            fail("equivalence_key", layer=layer, reason="unexpected_class_key")
            fail("equivalence_class", layer=layer, reason="unexpected_class_key")
    class_counts = {
        layer: len(keys_by_layer[layer]) for layer in ("L4", "L9", "L8", "L5")
    }
    zero_negative_population = (
        not failures
        and all(count == 0 for count in class_counts.values())
        and all(row.get("population_state") == "positive" for row in l8_cases.values())
        and all(row.get("population_state") == "positive" for row in l9_cases.values())
    )
    status = "evaluated"
    not_evaluated_reason = None
    if zero_negative_population:
        status = "not_evaluated"
        not_evaluated_reason = "zero_negative_equivalence_classes"
        fail("counts", case_id="<none>", reason=f"not_evaluated:{not_evaluated_reason}")

    comparison_scope = {
        "class_key": [
            "expected_classification↔code",
            "ordered_expected.finding_codes",
            "backflow_owner",
            "expected_axis",
            "expected_state",
            "owner_ref(kind, id); L5 function_ref wins over contract_ref",
        ],
        "class_invariants": [
            "class_rows_and_negative_case_rows",
            "expected_axis",
            "expected_state",
            "side_effect_count=0",
        ],
        "class_rows": {
            "L4": "all failure_classifications rows",
            "L5": "all failure_rules rows",
            "L8": "all negative_equivalence_classes rows",
            "L9": "all negative_equivalence_classes rows",
        },
        "case_rows": ["L8.unit_cases", "L9.integration_cases"],
        "case_attributes": [
            "change↔condition",
            "expected",
            "expected_preserved",
            "integration_case_ref",
            "expected_axis↔class",
            "expected_state↔class",
            "side_effect_count=0↔class",
        ],
        "case_references": [
            "L8.rule_ref(string ID)→L5.failure_rules.id",
            "function-owned rule: L8.function_ref(string ID)→L5.functions.id and equals rule.function_ref",
            "contract-only rule: L8.contract_ref or L8.requirement_trace→L5 rule.contract_ref and its declared requirement_ref; L8.function_ref is not required",
            "rule declaring both refs: function_ref determines owner_ref; contract_ref must resolve and its declared function must match",
            "L5.failure_rules.code↔case class",
        ],
        "case_population": "only_supplied_rows; simultaneous_omission_is_not_detected",
        "not_checked": ["full_legacy_per_case_four_layer_attribute_tuple"],
    }
    return {
        "check": "CHK-NEG-4WAY-MATCH",
        "comparison_mode": "explicit_negative_equivalence_classes",
        "comparison_scope": comparison_scope,
        "count_unit": "unique_equivalence_class_keys_per_layer",
        "matched_case_count_unit": "paired_negative_L8_L9_case_rows",
        "status": status,
        "not_evaluated_reason": not_evaluated_reason,
        "zero_count_rationale": None,
        "passed": not failures,
        "counts": class_counts,
        "class_row_counts": row_counts,
        "case_row_counts": {"L8": l8_case_row_count, "L9": l9_case_row_count},
        "matched_case_count": matched_case_count,
        "failures": failures,
        "derived_from": DERIVATION_MAP["CHK-NEG-4WAY-MATCH"],
    }


def check_neg_4way_match(
    repo_root: Path,
    l4_path: str,
    l9_path: str,
    l8_path: str,
    l5_path: str,
    l4_data: dict[str, Any] | None = None,
    l9_data: dict[str, Any] | None = None,
    l8_data: dict[str, Any] | None = None,
    l5_data: dict[str, Any] | None = None,
    contract_index: int | None = None,
) -> dict[str, Any]:
    """CHK-NEG-4WAY-MATCH: Verify 4-layer negative case count and 7-attribute + 0-side-effect match."""
    if l4_data is None:
        l4_data = _load_json(repo_root, l4_path) or {}
    if l9_data is None:
        l9_data = _load_json(repo_root, l9_path) or {}
    if l8_data is None:
        l8_data = _load_json(repo_root, l8_path) or {}
    if l5_data is None:
        l5_data = _load_json(repo_root, l5_path) or {}

    if any(
        _has_negative_equivalence_marker(data)
        for data in (l4_data, l9_data, l8_data, l5_data)
    ):
        return _check_negative_equivalence_mode(l4_data, l9_data, l8_data, l5_data)

    l4_contracts = l4_data.get("contracts", [])
    l4_top_fc = l4_data.get("failure_classifications", [])
    l9_cases = l9_data.get("cases", [])
    l8_cases = l8_data.get("cases", [])
    l5_contracts = l5_data.get("contracts", [])
    l5_rules_all = l5_data.get("failure_rules", [])

    indices = (
        [contract_index]
        if contract_index is not None
        else list(range(max(len(l4_contracts), len(l9_cases), len(l8_cases))))
    )

    l5_rules_by_id: dict[str, dict[str, Any]] = {}
    l5_rules_by_code: dict[tuple[str, str], dict[str, Any]] = {}
    for r in l5_rules_all:
        if isinstance(r, dict):
            rid = r.get("id")
            if isinstance(rid, str):
                l5_rules_by_id[rid] = r
            c_ref = r.get("contract_ref") or ""
            code = _extract_neg_key(r)
            if code:
                l5_rules_by_code[(c_ref, code)] = r

    failures: list[dict[str, Any]] = []
    total_counts = {"L4": 0, "L9": 0, "L8": 0, "L5": 0}
    matched_case_count = 0

    for idx in indices:
        c4 = l4_contracts[idx] if idx < len(l4_contracts) else {}
        c9 = l9_cases[idx] if idx < len(l9_cases) else {}
        c8 = l8_cases[idx] if idx < len(l8_cases) else {}
        c5 = l5_contracts[idx] if idx < len(l5_contracts) else {}

        c4_id = c4.get("id") if isinstance(c4, dict) else ""
        c5_id = c5.get("id") if isinstance(c5, dict) else ""
        c9_id = c9.get("id") if isinstance(c9, dict) else ""

        n4_list = c4.get("negative_classifications", []) if isinstance(c4, dict) else []
        if not n4_list and isinstance(l4_top_fc, list) and c4_id:
            n4_list = [
                fc
                for fc in l4_top_fc
                if isinstance(fc, dict) and fc.get("design_ref") == c4_id
            ]
        n9_list = c9.get("negative_cases", []) if isinstance(c9, dict) else []
        n8_list = c8.get("negative_cases", []) if isinstance(c8, dict) else []

        referenced_rule_ids = {
            row.get("rule_ref")
            for row in n8_list
            if isinstance(row, dict) and isinstance(row.get("rule_ref"), str)
        }
        relevant_l5_rules = [
            rule
            for rule in l5_rules_all
            if isinstance(rule, dict)
            and (
                rule.get("contract_ref") == c5_id
                or rule.get("integration_case_ref") == c9_id
                or rule.get("id") in referenced_rule_ids
            )
        ]
        layer_rows = {
            "L4": [row for row in n4_list if isinstance(row, dict)],
            "L9": [row for row in n9_list if isinstance(row, dict)],
            "L8": [row for row in n8_list if isinstance(row, dict)],
            "L5": relevant_l5_rules,
        }
        repeated_codes: set[str] = set()
        for rows in layer_rows.values():
            code_counts: dict[str, int] = {}
            for row in rows:
                code = _extract_neg_key(row)
                if code:
                    code_counts[code] = code_counts.get(code, 0) + 1
            repeated_codes.update(
                code for code, count in code_counts.items() if count > 1
            )

        # Collect corresponding L5 failure_rules for this contract/case
        n5_list: list[dict[str, Any]] = []
        for n8 in n8_list:
            if not isinstance(n8, dict):
                continue
            rref = n8.get("rule_ref")
            if isinstance(rref, str) and rref in l5_rules_by_id:
                n5_list.append(l5_rules_by_id[rref])
                continue
            code = _extract_neg_key(n8)
            if code in repeated_codes:
                identity = _negative_case_identity(n8)
                matches = [
                    rule
                    for rule in relevant_l5_rules
                    if _extract_neg_key(rule) == code
                    and identity is not None
                    and _negative_case_identity(rule) == identity
                ]
                if len(matches) == 1:
                    n5_list.append(matches[0])
                continue
            if (c5_id, code) in l5_rules_by_code:
                n5_list.append(l5_rules_by_code[(c5_id, code)])
        if not n5_list:
            for r in l5_rules_all:
                if not isinstance(r, dict):
                    continue
                if (
                    r.get("contract_ref") == c5_id
                    or r.get("integration_case_ref") == c9_id
                ):
                    n5_list.append(r)

        total_counts["L4"] += len(n4_list)
        total_counts["L9"] += len(n9_list)
        total_counts["L8"] += len(n8_list)
        total_counts["L5"] += len(n5_list)

        if not (len(n4_list) == len(n9_list) == len(n8_list) == len(n5_list)):
            failures.append(
                {
                    "check": "CHK-NEG-4WAY-MATCH",
                    "case_id": c9_id or f"contract_{idx}",
                    "attribute": "negative_case_count",
                    "L4": len(n4_list),
                    "L9": len(n9_list),
                    "L8": len(n8_list),
                    "L5": len(n5_list),
                }
            )

        invalid_case_keys: dict[str, set[tuple[str, str]]] = {}
        for layer_name, rows in (
            ("L4", layer_rows["L4"]),
            ("L9", layer_rows["L9"]),
            ("L8", layer_rows["L8"]),
            ("L5", relevant_l5_rules),
        ):
            identities_by_code: dict[str, list[str]] = {}
            for row in rows:
                code = _extract_neg_key(row)
                if code not in repeated_codes:
                    continue
                identity = _negative_case_identity(row)
                if identity is None:
                    failures.append(
                        {
                            "check": "CHK-NEG-4WAY-MATCH",
                            "case_id": row.get("id") or code,
                            "attribute": "case_identity",
                            "layer": layer_name,
                            "code": code,
                            "reason": "missing_or_invalid",
                        }
                    )
                    continue
                identities_by_code.setdefault(code, []).append(identity)
            invalid: set[tuple[str, str]] = set()
            for code, identities in identities_by_code.items():
                identity_counts: dict[str, int] = {}
                for identity in identities:
                    identity_counts[identity] = identity_counts.get(identity, 0) + 1
                for identity, count in identity_counts.items():
                    if count > 1:
                        invalid.add((code, identity))
                        failures.append(
                            {
                                "check": "CHK-NEG-4WAY-MATCH",
                                "case_id": identity,
                                "attribute": "duplicate_case_identity",
                                "layer": layer_name,
                                "code": code,
                            }
                        )
            invalid_case_keys[layer_name] = invalid

        def build_case_map(
            layer_name: str, rows: list[dict[str, Any]]
        ) -> dict[Any, dict[str, Any]]:
            result: dict[Any, dict[str, Any]] = {}
            for row in rows:
                code = _extract_neg_key(row)
                if code in repeated_codes:
                    identity = _negative_case_identity(row)
                    if identity is None or (code, identity) in invalid_case_keys.get(
                        layer_name, set()
                    ):
                        continue
                    key: Any = (code, identity)
                else:
                    key = code
                result[key] = row
            return result

        map4 = build_case_map("L4", layer_rows["L4"])
        map9 = build_case_map("L9", layer_rows["L9"])
        map8 = build_case_map("L8", layer_rows["L8"])
        map5 = build_case_map("L5", [row for row in n5_list if isinstance(row, dict)])

        all_keys = list(
            dict.fromkeys(
                list(map4.keys())
                + list(map9.keys())
                + list(map8.keys())
                + list(map5.keys())
            )
        )
        for key in all_keys:
            x4, x9, x8, x5 = map4.get(key), map9.get(key), map8.get(key), map5.get(key)
            case_label = (
                (x8 or {}).get("id")
                or (x9 or {}).get("id")
                or (x5 or {}).get("id")
                or key
            )
            if not (x4 and x9 and x8 and x5):
                failures.append(
                    {
                        "check": "CHK-NEG-4WAY-MATCH",
                        "case_id": case_label,
                        "attribute": "presence",
                        "L4": bool(x4),
                        "L9": bool(x9),
                        "L8": bool(x8),
                        "L5": bool(x5),
                    }
                )
                continue

            u4 = _normalize_neg_item(x4, "L4")
            u9 = _normalize_neg_item(x9, "L9")
            u8 = _normalize_neg_item(x8, "L8")
            u5 = _normalize_neg_item(x5, "L5")

            case_ok = True
            for attr in (
                "change_or_condition",
                "classification_or_code",
                "expected_axis",
                "expected_state",
                "expected",
                "expected_preserved",
                "backflow_owner",
            ):
                v4, v9, v8, v5 = u4[attr], u9[attr], u8[attr], u5[attr]
                # In OS002 L5, reference-backed expected_preserved still requires a
                # non-null matching value in L4/L9/L8. Predicate-only rules may omit
                # it when all four layers agree on the absent value.
                if (
                    attr in ("change_or_condition", "expected")
                    and v5 is None
                    and (x5.get("predicate") or x5.get("preserved_observation_ref"))
                ):
                    cmp_ok = (v4 == v9 == v8) and (v4 is not None)
                elif (
                    attr == "expected_preserved"
                    and v5 is None
                    and x5.get("preserved_observation_ref")
                ):
                    cmp_ok = (v4 == v9 == v8) and (v4 is not None)
                elif (
                    attr == "expected_preserved"
                    and all(value is None for value in (v4, v9, v8, v5))
                    and x5.get("predicate")
                    and not x5.get("preserved_observation_ref")
                ):
                    cmp_ok = True
                else:
                    cmp_ok = v4 == v9 == v8 == v5
                if not cmp_ok:
                    case_ok = False
                    failures.append(
                        {
                            "check": "CHK-NEG-4WAY-MATCH",
                            "case_id": case_label,
                            "attribute": attr,
                            "L4": v4,
                            "L9": v9,
                            "L8": v8,
                            "L5": v5,
                        }
                    )

            # Check side_effect_count == 0 across layers that record it (L9, L8, L5, and L4 if present)
            se4 = u4["side_effect_count"] if u4["side_effect_count"] is not None else 0
            se9 = u9["side_effect_count"]
            se8 = u8["side_effect_count"]
            se5 = u5["side_effect_count"] if u5["side_effect_count"] is not None else 0
            if not (se4 == 0 and se9 == 0 and se8 == 0 and se5 == 0):
                case_ok = False
                failures.append(
                    {
                        "check": "CHK-NEG-4WAY-MATCH",
                        "case_id": case_label,
                        "attribute": "side_effect_count",
                        "L4": se4,
                        "L9": se9,
                        "L8": se8,
                        "L5": se5,
                    }
                )

            # Check rule_ref / function_ref / integration_case_ref when present on L8 & L5
            if u8["rule_ref"] and u5["id"] and u8["rule_ref"] != u5["id"]:
                case_ok = False
                failures.append(
                    {
                        "check": "CHK-NEG-4WAY-MATCH",
                        "case_id": case_label,
                        "attribute": "rule_ref",
                        "L4": u4["id"],
                        "L9": u9["id"],
                        "L8": u8["rule_ref"],
                        "L5": u5["id"],
                    }
                )
            if (
                u8["function_ref"]
                and u5["function_ref"]
                and u8["function_ref"] != u5["function_ref"]
            ):
                case_ok = False
                failures.append(
                    {
                        "check": "CHK-NEG-4WAY-MATCH",
                        "case_id": case_label,
                        "attribute": "function_ref",
                        "L4": None,
                        "L9": None,
                        "L8": u8["function_ref"],
                        "L5": u5["function_ref"],
                    }
                )

            if case_ok:
                matched_case_count += 1

    docs_missing = not (l4_data and l9_data and l8_data and l5_data)
    all_zero = all(v == 0 for v in total_counts.values())
    zero_rationale = None
    if isinstance(l4_data, dict):
        zero_rationale = l4_data.get("zero_negative_cases_rationale")
    if not zero_rationale and isinstance(l5_data, dict):
        zero_rationale = l5_data.get("zero_negative_cases_rationale")

    not_evaluated = False
    not_evaluated_reason: str | None = None
    if docs_missing:
        not_evaluated = True
        not_evaluated_reason = "missing_or_unparsed_layer_documents"
    elif all_zero and not zero_rationale:
        not_evaluated = True
        not_evaluated_reason = "zero_negative_case_counts_without_rationale"

    if not_evaluated:
        failures.append(
            {
                "check": "CHK-NEG-4WAY-MATCH",
                "case_id": "<none>",
                "attribute": "counts",
                "error": f"not_evaluated:{not_evaluated_reason}",
                "L4": total_counts["L4"],
                "L9": total_counts["L9"],
                "L8": total_counts["L8"],
                "L5": total_counts["L5"],
            }
        )

    return {
        "check": "CHK-NEG-4WAY-MATCH",
        "comparison_mode": "legacy_casewise_four_layer",
        "comparison_scope": {
            "case_rows": [
                "L4.contracts[].negative_classifications",
                "L9.cases[].negative_cases",
                "L8.cases[].negative_cases",
                "L5.failure_rules",
            ],
            "case_attributes": [
                "change_or_condition",
                "classification_or_code",
                "expected_axis",
                "expected_state",
                "expected",
                "expected_preserved",
                "backflow_owner",
            ],
            "side_effect_count": "zero_across_L4_L9_L8_L5",
            "case_identity": "existing_casewise_identity_rules",
        },
        "count_unit": "negative_case_rows_per_layer",
        "matched_case_count_unit": "matched_negative_case_rows",
        "status": "not_evaluated" if not_evaluated else "evaluated",
        "not_evaluated_reason": not_evaluated_reason,
        "zero_count_rationale": zero_rationale,
        "passed": (not not_evaluated) and len(failures) == 0,
        "counts": total_counts,
        "matched_case_count": matched_case_count,
        "failures": failures,
        "derived_from": DERIVATION_MAP["CHK-NEG-4WAY-MATCH"],
    }


def _collect_all_l8_uids(l8_data: dict[str, Any]) -> set[str]:
    uids: set[str] = set()

    def _walk(node: Any) -> None:
        if isinstance(node, dict):
            for k in ("id", "case_id", "check_id", "probe_id", "oracle_id"):
                v = node.get(k)
                if isinstance(v, str) and v:
                    uids.add(v)
            for v in node.values():
                _walk(v)
        elif isinstance(node, list):
            for v in node:
                _walk(v)

    _walk(l8_data)
    return uids


def check_public_fn_freeze(
    record_data: dict[str, Any],
    l5_data: dict[str, Any],
    l8_data: dict[str, Any],
) -> dict[str, Any]:
    """CHK-PUBLIC-FN-FREEZE: Mechanical verification of public function freeze rows and private detail pairs.

    Mechanical scope:
      1. Public function rows must point to L5#/functions/*, have visibility != 'private'
         and not be a planned_private_symbol, and all unit_case_refs / oracle_ref must resolve
         in L8.
      2. Private detail rows must record a bound public function or reentry owner + slice.
      3. Human semantic judgment items are emitted under `human_judgment_pending`.
    """
    failures: list[dict[str, Any]] = []
    resolved_rows: list[dict[str, Any]] = []
    human_judgment_pending: list[dict[str, Any]] = []

    l8_uids = _collect_all_l8_uids(l8_data)

    pub_rows: list[dict[str, Any]] = []
    priv_rows: list[dict[str, Any]] = []
    for k in (
        "function_freeze_rows",
        "frozen_function_pairs",
        "frozen_function_pair_rows",
        "frozen_public_function_pair_rows",
        "public_function_rows",
    ):
        if isinstance(record_data.get(k), list):
            for r in record_data[k]:
                if not isinstance(r, dict):
                    continue
                if r.get("entry_kind") == "private_detail_contract_pair":
                    priv_rows.append(r)
                else:
                    pub_rows.append(r)
    tb = record_data.get("target_bindings")
    if isinstance(tb, dict) and isinstance(tb.get("public_functions"), list):
        pub_rows.extend(r for r in tb["public_functions"] if isinstance(r, dict))

    for row in pub_rows:
        l5_fn_meta = (
            row.get("l5_function")
            if isinstance(row.get("l5_function"), dict)
            else (
                row.get("function")
                if isinstance(row.get("function"), dict)
                else (
                    row.get("public_function")
                    if isinstance(row.get("public_function"), dict)
                    else row
                )
            )
        )
        raw_ptr = (
            l5_fn_meta.get("l5_function_pointer")
            or l5_fn_meta.get("l5_pointer")
            or l5_fn_meta.get("pointer")
            or row.get("l5_function_pointer")
            or row.get("l5_pointer")
            or ""
        )
        ptr = raw_ptr.split("#", 1)[-1] if "#" in str(raw_ptr) else str(raw_ptr)
        sym_candidates = (
            l5_fn_meta.get("symbol"),
            l5_fn_meta.get("planned_public_symbol"),
            l5_fn_meta.get("public_function"),
            l5_fn_meta.get("function_id"),
            l5_fn_meta.get("name"),
            l5_fn_meta.get("id"),
            row.get("symbol"),
            row.get("planned_public_symbol"),
            row.get("public_function"),
            row.get("function_id"),
            row.get("symbol_or_entry"),
            row.get("name"),
        )
        sym = next(
            (c for c in sym_candidates if isinstance(c, str) and c.strip()),
            "unknown",
        )
        vis = l5_fn_meta.get("visibility") or "public"

        if not str(raw_ptr).strip() or sym == "unknown":
            failures.append(
                {
                    "check": "CHK-PUBLIC-FN-FREEZE",
                    "symbol": str(sym),
                    "l5_pointer": str(raw_ptr),
                    "visibility": str(vis),
                    "error": "unparsed_record_shape",
                }
            )
            continue

        if not ptr.startswith("/functions/"):
            failures.append(
                {
                    "check": "CHK-PUBLIC-FN-FREEZE",
                    "symbol": str(sym),
                    "l5_pointer": str(raw_ptr),
                    "visibility": str(vis),
                    "error": "private_or_non_function_frozen_as_public",
                }
            )
            continue

        if not isinstance(l5_data, dict) or not l5_data:
            failures.append(
                {
                    "check": "CHK-PUBLIC-FN-FREEZE",
                    "symbol": str(sym),
                    "l5_pointer": str(raw_ptr),
                    "visibility": str(vis),
                    "error": "unparsed_record_shape",
                }
            )
            continue

        ok, l5_fn_obj = resolve_json_pointer(l5_data, ptr)
        if not ok or not isinstance(l5_fn_obj, dict):
            failures.append(
                {
                    "check": "CHK-PUBLIC-FN-FREEZE",
                    "symbol": str(sym),
                    "l5_pointer": str(raw_ptr),
                    "visibility": str(vis),
                    "error": "unresolved_l5_function_pointer",
                }
            )
            continue

        actual_vis = l5_fn_obj.get("visibility", vis)
        if (
            actual_vis == "private"
            or vis == "private"
            or str(actual_vis).startswith("private_")
            or "planned_private_symbol" in l5_fn_obj
        ):
            failures.append(
                {
                    "check": "CHK-PUBLIC-FN-FREEZE",
                    "symbol": str(l5_fn_obj.get("symbol") or sym),
                    "l5_pointer": str(raw_ptr),
                    "visibility": str(actual_vis),
                    "error": "private_or_non_function_frozen_as_public",
                }
            )

        unit_refs = list(l5_fn_obj.get("unit_case_refs") or [])
        oracle_ref = l5_fn_obj.get("oracle_ref")
        unresolved_refs: list[str] = []
        for uref in unit_refs:
            if isinstance(uref, str) and uref not in l8_uids:
                unresolved_refs.append(uref)
        if isinstance(oracle_ref, str) and oracle_ref and oracle_ref not in l8_uids:
            unresolved_refs.append(oracle_ref)

        if unresolved_refs:
            failures.append(
                {
                    "check": "CHK-PUBLIC-FN-FREEZE",
                    "symbol": str(l5_fn_obj.get("symbol") or sym),
                    "l5_pointer": str(raw_ptr),
                    "visibility": str(actual_vis),
                    "error": "unresolved_unit_case_ref",
                }
            )

        resolved_rows.append(
            {
                "kind": "public_function",
                "symbol": l5_fn_obj.get("symbol") or sym,
                "id": l5_fn_obj.get("id"),
                "l5_pointer": raw_ptr,
                "visibility": actual_vis,
                "input_type": l5_fn_obj.get("input_type"),
                "output_type": l5_fn_obj.get("output_type"),
                "oracle_ref": oracle_ref,
                "unit_case_refs_count": len(unit_refs),
                "unresolved_unit_case_refs": unresolved_refs,
            }
        )
        human_judgment_pending.append(
            {
                "check": "CHK-PUBLIC-FN-FREEZE",
                "target": l5_fn_obj.get("symbol") or sym,
                "l5_pointer": raw_ptr,
                "status": "pending_human_or_independent_semantic_review",
                "judgment_required": "Confirm L5 precondition/postcondition/invariant and L8 U-ID expectations are independently derived from L3/L10 and L4/L9 (DT-VT-105).",
            }
        )

    for k in (
        "private_detail_bindings",
        "private_detail_contract_pairs",
        "private_helper_disposition",
    ):
        val = record_data.get(k)
        if isinstance(val, list):
            priv_rows.extend(r for r in val if isinstance(r, dict))
        elif isinstance(val, dict):
            priv_rows.append(val)
    if isinstance(tb, dict) and isinstance(
        tb.get("private_detail_contract_pairs"), list
    ):
        priv_rows.extend(
            r for r in tb["private_detail_contract_pairs"] if isinstance(r, dict)
        )

    for prow in priv_rows:
        pdetail = (
            prow.get("l5_private_detail")
            if isinstance(prow.get("l5_private_detail"), dict)
            else (
                prow.get("private_detail")
                if isinstance(prow.get("private_detail"), dict)
                else prow
            )
        )
        sym = (
            pdetail.get("section_key")
            or pdetail.get("symbol")
            or pdetail.get("planned_private_symbol")
            or prow.get("symbol")
            or prow.get("detail_pointer")
            or prow.get("pair_id")
            or "private_detail"
        )
        raw_ptr = (
            pdetail.get("l5_contract_pointer")
            or pdetail.get("l5_pointer")
            or pdetail.get("detail_pointer")
            or prow.get("detail_pointer")
            or prow.get("l5_pointer")
            or ""
        )
        vis = (
            pdetail.get("visibility")
            or prow.get("visibility")
            or "private_detail_not_in_L5_functions"
        )
        rem = prow.get("remaining_disposition") or prow.get("disposition")
        has_owner_or_caller = bool(
            prow.get("bound_public_function")
            or (
                isinstance(prow.get("bound_public_functions"), list)
                and len(prow["bound_public_functions"]) > 0
            )
            or (
                isinstance(prow.get("caller_public_functions"), list)
                and len(prow["caller_public_functions"]) > 0
            )
            or (
                isinstance(prow.get("public_callers"), list)
                and len(prow["public_callers"]) > 0
            )
            or (prow.get("owner") and prow.get("reentry_slice"))
            or (isinstance(rem, str) and len(rem.strip()) > 0)
            or (
                isinstance(rem, dict)
                and (
                    rem.get("unspecified_public_caller_and_binding_slices")
                    or rem.get("C_downstream_and_other_owner")
                    or (rem.get("owner") and rem.get("reentry_slice"))
                )
            )
        )
        if not has_owner_or_caller:
            failures.append(
                {
                    "check": "CHK-PUBLIC-FN-FREEZE",
                    "symbol": str(sym),
                    "l5_pointer": str(raw_ptr),
                    "visibility": str(vis),
                    "error": "missing_reentry_owner",
                }
            )
        resolved_rows.append(
            {
                "kind": "private_detail_contract_pair",
                "symbol": sym,
                "l5_pointer": raw_ptr,
                "visibility": vis,
                "has_owner_or_caller_disposition": has_owner_or_caller,
            }
        )
        human_judgment_pending.append(
            {
                "check": "CHK-PUBLIC-FN-FREEZE",
                "target": sym,
                "l5_pointer": raw_ptr,
                "status": "pending_human_or_independent_semantic_review",
                "judgment_required": "Confirm private detail boundary and reentry slice/owner assignment preserve caller contract without premature public freeze (#3763 R1-m1).",
            }
        )

    not_evaluated = (len(pub_rows) + len(priv_rows)) == 0
    not_evaluated_reason = (
        "no_public_or_private_function_freeze_rows_found" if not_evaluated else None
    )
    if not_evaluated:
        failures.append(
            {
                "check": "CHK-PUBLIC-FN-FREEZE",
                "symbol": "<none>",
                "l5_pointer": "",
                "visibility": "unknown",
                "error": "not_evaluated:no_public_or_private_function_freeze_rows_found",
            }
        )
    return {
        "check": "CHK-PUBLIC-FN-FREEZE",
        "status": "not_evaluated" if not_evaluated else "evaluated",
        "not_evaluated_reason": not_evaluated_reason,
        "passed": (not not_evaluated) and len(failures) == 0,
        "resolved_function_rows": resolved_rows,
        "failures": failures,
        "human_judgment_pending": human_judgment_pending,
        "derived_from": DERIVATION_MAP["CHK-PUBLIC-FN-FREEZE"],
    }


def check_l3_obligation_map(
    record_data: dict[str, Any],
    l5_data: dict[str, Any],
    l8_data: dict[str, Any],
    l9_data: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """CHK-L3-OBLIGATION-MAP: Mechanical verification of O1..On pointers, blocking_a_count==0, and L9 branch refs.

    Mechanical scope:
      1. Every Oi in `l3_obligation_decomposition` must have non-empty `l5_pointers` and `l8_pointers`.
      2. `blocking_a_count` on the target path must be 0.
      3. Enumerate L9 basic branches and check that unreferenced branch count is 0.
      4. Emit `human_judgment_pending` for natural-language obligation completeness review.
    """
    failures: list[dict[str, Any]] = []
    obligation_rows: list[dict[str, Any]] = []
    human_judgment_pending: list[dict[str, Any]] = []

    decomp = record_data.get("l3_obligation_decomposition")
    if isinstance(decomp, dict):
        decomp = decomp.get("obligations", [])
    if not isinstance(decomp, list) or not decomp:
        ied = record_data.get("independent_expectation_derivation")
        if isinstance(ied, dict) and isinstance(
            ied.get("l3_obligation_decomposition"), list
        ):
            decomp = ied["l3_obligation_decomposition"]
    if not isinstance(decomp, list) or not decomp:
        uer = record_data.get("upper_expectation_rederivation")
        if isinstance(uer, dict):
            if isinstance(uer.get("derived_expectations_and_t2b_coverage"), list):
                decomp = uer["derived_expectations_and_t2b_coverage"]
            else:
                for sub in uer.values():
                    if isinstance(sub, dict) and isinstance(
                        sub.get("obligation_elements_and_coverage"), list
                    ):
                        decomp = sub["obligation_elements_and_coverage"]
                        break
    if not isinstance(decomp, list):
        decomp = []

    for i, item in enumerate(decomp):
        if isinstance(item, str):
            l5_matches = [
                m.group(0)
                for m in POINTER_TOKEN_RE.finditer(item)
                if m.group(1) in ("L5", "H009_L5")
            ]
            l8_matches = [
                m.group(0)
                for m in POINTER_TOKEN_RE.finditer(item)
                if m.group(1) in ("L8", "H009_L8")
            ]
            oid = item.split("（", 1)[0].split(":", 1)[0].strip() or f"E{i + 1}"
            both_non_empty = len(l5_matches) > 0 and len(l8_matches) > 0
            if not both_non_empty:
                failures.append(
                    {
                        "check": "CHK-L3-OBLIGATION-MAP",
                        "item_id": str(oid),
                        "error": "empty_l5_or_l8_pointers",
                        "details": f"l5_pointers={len(l5_matches)}, l8_pointers={len(l8_matches)} in string obligation item {oid}",
                    }
                )
            obligation_rows.append(
                {
                    "obligation_id": oid,
                    "l5_pointer_count": len(l5_matches),
                    "l8_pointer_count": len(l8_matches),
                    "status": "covered"
                    if both_non_empty
                    else "missing_l5_or_l8_pointers",
                }
            )
            human_judgment_pending.append(
                {
                    "check": "CHK-L3-OBLIGATION-MAP",
                    "item_id": oid,
                    "status": "pending_human_or_independent_semantic_review",
                    "judgment_required": "Confirm O1..On decomposition has no natural-language semantic omission from parent L3 requirement text (#3759 R1-m1).",
                }
            )
            continue
        if not isinstance(item, dict):
            continue
        oid = (
            item.get("obligation_id")
            or item.get("element_id")
            or item.get("id")
            or f"O{i + 1}"
        )
        l5_ptrs = item.get("l5_pointers") or item.get("h009_l5_pointers") or []
        l8_ptrs = item.get("l8_pointers") or item.get("h009_l8_pointers") or []
        l5_cnt = len(l5_ptrs) if isinstance(l5_ptrs, list) else 0
        l8_cnt = len(l8_ptrs) if isinstance(l8_ptrs, list) else 0
        both_non_empty = l5_cnt > 0 and l8_cnt > 0
        if not both_non_empty:
            failures.append(
                {
                    "check": "CHK-L3-OBLIGATION-MAP",
                    "item_id": str(oid),
                    "error": "empty_l5_or_l8_pointers",
                    "details": f"l5_pointers={l5_cnt}, l8_pointers={l8_cnt}",
                }
            )
        obligation_rows.append(
            {
                "obligation_id": oid,
                "l5_pointer_count": l5_cnt,
                "l8_pointer_count": l8_cnt,
                "status": "covered" if both_non_empty else "missing_l5_or_l8_pointers",
            }
        )
        human_judgment_pending.append(
            {
                "check": "CHK-L3-OBLIGATION-MAP",
                "item_id": oid,
                "status": "pending_human_or_independent_semantic_review",
                "judgment_required": "Confirm O1..On decomposition has no natural-language semantic omission from parent L3 requirement text (#3759 R1-m1).",
            }
        )

    # Check blocking_a_count == 0
    def _scan_blocking_a(node: Any, ptr: str) -> None:
        if isinstance(node, dict):
            for k, v in node.items():
                if k == "blocking_a_count" or k.endswith("_blocking_a_count"):
                    if isinstance(v, int) and v != 0:
                        failures.append(
                            {
                                "check": "CHK-L3-OBLIGATION-MAP",
                                "item_id": f"{ptr}/{k}",
                                "error": "non_zero_blocking_a",
                                "details": f"{k}={v}",
                            }
                        )
                else:
                    _scan_blocking_a(v, f"{ptr}/{k}")
        elif isinstance(node, list):
            for idx, v in enumerate(node):
                _scan_blocking_a(v, f"{ptr}/{idx}")

    _scan_blocking_a(record_data, "")

    # Check explicit unreferenced branch counts in branch_coverage_check if present
    bcc = record_data.get("branch_coverage_check")
    unreferenced_branches: list[str] = []
    if isinstance(bcc, dict):
        for k, v in bcc.items():
            if "unreferenced" in k or "uncovered" in k:
                if isinstance(v, int) and v != 0:
                    unreferenced_branches.append(f"{k}={v}")
                elif isinstance(v, list) and len(v) > 0:
                    unreferenced_branches.extend(str(x) for x in v)

    for ub in unreferenced_branches:
        failures.append(
            {
                "check": "CHK-L3-OBLIGATION-MAP",
                "item_id": ub,
                "error": "unreferenced_l9_branch",
                "details": f"Unreferenced L9 branch in branch_coverage_check: {ub}",
            }
        )

    not_evaluated = len(obligation_rows) == 0
    not_evaluated_reason = "no_l3_obligations_found" if not_evaluated else None
    if not_evaluated:
        failures.append(
            {
                "check": "CHK-L3-OBLIGATION-MAP",
                "item_id": "<none>",
                "error": "not_evaluated:no_l3_obligations_found",
                "details": "No obligation rows parsed from freeze record",
            }
        )
    return {
        "check": "CHK-L3-OBLIGATION-MAP",
        "status": "not_evaluated" if not_evaluated else "evaluated",
        "not_evaluated_reason": not_evaluated_reason,
        "passed": (not not_evaluated) and len(failures) == 0,
        "obligation_count": len(obligation_rows),
        "obligations": obligation_rows,
        "unreferenced_l9_branches": unreferenced_branches,
        "failures": failures,
        "human_judgment_pending": human_judgment_pending,
        "derived_from": DERIVATION_MAP["CHK-L3-OBLIGATION-MAP"],
    }


def compute_head_entity_counts(
    l5_data: dict[str, Any],
    l8_data: dict[str, Any],
    reference_counts: dict[str, int] | None = None,
    extra_docs: dict[str, dict[str, Any]] | None = None,
) -> dict[str, int]:
    """Compute mechanical entity counts for L5 and L8 documents."""
    counts: dict[str, int] = {
        "L5_contracts": len(l5_data.get("contracts", [])),
        "L5_functions": len(l5_data.get("functions", [])),
        "L5_failure_rules": len(l5_data.get("failure_rules", [])),
        "L8_cases": len(l8_data.get("cases", [])),
        "L8_negative_cases_total": sum(
            len(c.get("negative_cases", []))
            for c in l8_data.get("cases", [])
            if isinstance(c, dict)
        ),
        "L8_normal_function_oracles": len(l8_data.get("normal_function_oracles", [])),
        "L8_additional_unit_cases": len(l8_data.get("additional_unit_cases", [])),
    }

    if "entry_point" in (l5_data.get("core_proposal_receiving_detail") or {}):
        counts["L5_core_proposal_receiving_entry_point"] = 1

    # Optional known subsections in H009 and OS002
    known_extractors: dict[str, tuple[dict[str, Any], tuple[str, ...]]] = {
        "L5_source_pins": (l5_data, ("source_pins",)),
        "L8_source_pins": (l8_data, ("source_pins",)),
        "L8_function_cases": (l8_data, ("function_cases",)),
        "L8_additional_cases": (l8_data, ("additional_cases",)),
        "L8_normal_fixtures": (l8_data, ("normal_fixtures",)),
        "L8_wire_codec_cases": (l8_data, ("wire_codec_verification", "cases")),
        "L8_encoder_obligations": (
            l8_data,
            ("wire_codec_verification", "encoder_obligations"),
        ),
        "L8_dispatch_boundary_cases": (
            l8_data,
            ("dispatch_boundary_cases", "cases"),
        ),
        "L5_core_proposal_receiving_private_functions": (
            l5_data,
            ("core_proposal_receiving_detail", "functions"),
        ),
        "L8_core_proposal_receiving_family_contracts": (
            l8_data,
            ("core_proposal_receiving_verification", "receiver_family_contracts"),
        ),
        "L8_core_proposal_receiving_finite_cases": (
            l8_data,
            ("core_proposal_receiving_verification", "finite_cases"),
        ),
        "L8_core_proposal_receiving_additional_branch_probes": (
            l8_data,
            ("core_proposal_receiving_verification", "additional_branch_probes"),
        ),
        "L5_f04_private_functions": (
            l5_data,
            ("f04_source_original_correspondence_detail", "phase_binding"),
        ),
        "L8_f04_original_component_cases": (
            l8_data,
            ("f04_source_original_correspondence_verification", "component_cases"),
        ),
        "L8_f04_original_branch_cases": (
            l8_data,
            ("f04_source_original_correspondence_verification", "branch_cases"),
        ),
        "L8_f04_original_origin_cases": (
            l8_data,
            ("f04_source_original_correspondence_verification", "origin_cases"),
        ),
        "L8_f04_original_whole_cases": (
            l8_data,
            ("f04_source_original_correspondence_verification", "whole_cases"),
        ),
        "L8_f04_original_private_return_whole_cases": (
            l8_data,
            (
                "f04_source_original_correspondence_verification",
                "private_return_whole_cases",
            ),
        ),
        "L8_f04_original_private_return_negative_controls": (
            l8_data,
            (
                "f04_source_original_correspondence_verification",
                "private_return_negative_controls",
            ),
        ),
        "L8_f04_original_additional_branch_probes": (
            l8_data,
            (
                "f04_source_original_correspondence_verification",
                "additional_branch_probes",
            ),
        ),
        "L8_proposal_formation_cases": (
            l8_data,
            ("proposal_material_formation_native_oracle", "case_order_and_names"),
        ),
        "L8_proposal_native_record_cases": (
            l8_data,
            ("proposal_native_record_material_verification", "case_discriminators_ja"),
        ),
        "L8_opp_component_checks": (
            l8_data,
            (
                "original_operation_proposal_provider_verification",
                "expected_component_checks",
            ),
        ),
        "L8_general_proposal_exchange_family_contracts": (
            l8_data,
            ("general_proposal_exchange_verification", "family_contracts"),
        ),
        "L8_general_proposal_exchange_finite_cases": (
            l8_data,
            ("general_proposal_exchange_verification", "finite_cases"),
        ),
        "L8_general_proposal_exchange_additional_branch_probes": (
            l8_data,
            ("general_proposal_exchange_verification", "additional_branch_probes"),
        ),
    }

    if extra_docs:
        h_l5 = extra_docs.get("H009_L5")
        h_l8 = extra_docs.get("H009_L8")
        if isinstance(h_l5, dict):
            known_extractors["H009_L5_general_proposal_exchange_branches"] = (
                h_l5,
                ("general_proposal_exchange_detail", "branch_contracts"),
            )
        if isinstance(h_l8, dict):
            known_extractors["H009_L8_general_proposal_exchange_families"] = (
                h_l8,
                ("general_proposal_exchange_verification", "family_expectations"),
            )

    for key, (doc_obj, path_tuple) in known_extractors.items():
        if reference_counts is not None and key not in reference_counts:
            continue
        ok, val = resolve_json_pointer(doc_obj, "/" + "/".join(path_tuple))
        if ok and isinstance(val, (list, dict)):
            counts[key] = len(val)

    if reference_counts is not None:
        return {k: counts.get(k, -1) for k in reference_counts}
    return counts


def audit_freeze_record(
    repo_root: Path,
    freeze_path: str,
    use_creation_commit: bool = True,
) -> dict[str, Any]:
    """Audit an existing freeze record against mechanical checker outputs (Scope item 3)."""
    rec_data = _load_json(repo_root, freeze_path)
    if not isinstance(rec_data, dict):
        return {
            "freeze_path": freeze_path,
            "passed": False,
            "error": "freeze_record_not_found_or_invalid_json",
        }

    creation_commit = (
        _file_last_commit(repo_root, freeze_path) if use_creation_commit else None
    )
    base_rev = rec_data.get("source_main") or rec_data.get("request_base_sha")
    head_rev = creation_commit

    pin_res = check_pin_sha256(
        repo_root, freeze_path, rec_data, base_rev=base_rev, head_rev=head_rev
    )
    ptr_res = check_json_pointer(
        repo_root, freeze_path, rec_data, base_rev=base_rev, head_rev=head_rev
    )

    aliases = rec_data.get("path_aliases", {})
    l4_path = aliases.get("L4", "")
    l9_path = aliases.get("L9", "")
    l5_path = aliases.get("L5", "")
    l8_path = aliases.get("L8", "")

    l4_data = _load_json(repo_root, l4_path, head_rev) if l4_path else {}
    l9_data = _load_json(repo_root, l9_path, head_rev) if l9_path else {}
    l5_data = _load_json(repo_root, l5_path, head_rev) if l5_path else {}
    l8_data = _load_json(repo_root, l8_path, head_rev) if l8_path else {}
    l8_pre_data = (
        _load_json(repo_root, l8_path, base_rev) if (l8_path and base_rev) else {}
    )

    extra_docs: dict[str, dict[str, Any]] = {}
    for ak in ("H009_L5", "H009_L8"):
        if ak in aliases:
            extra_docs[ak] = _load_json(repo_root, aliases[ak], head_rev) or {}

    neg_res = check_neg_4way_match(
        repo_root,
        l4_path,
        l9_path,
        l8_path,
        l5_path,
        l4_data=l4_data,
        l9_data=l9_data,
        l8_data=l8_data,
        l5_data=l5_data,
    )
    fn_res = check_public_fn_freeze(rec_data, l5_data, l8_data)
    obl_res = check_l3_obligation_map(rec_data, l5_data, l8_data, l9_data)

    # Check if any forbidden material key was added to L8 between base_rev and head_rev
    cap_post = check_ownership_cap(repo_root, l8_path, l8_data, layer="L8")
    cap_pre = (
        check_ownership_cap(repo_root, l8_path, l8_pre_data, layer="L8")
        if l8_pre_data
        else {"failures": []}
    )
    pre_ptrs = {(f["pointer"], f["key"]) for f in cap_pre.get("failures", [])}
    added_l8_forbidden = [
        f
        for f in cap_post.get("failures", [])
        if (f["pointer"], f["key"]) not in pre_ptrs
    ]

    recorded_counts = rec_data.get("head_entity_counts", {})
    computed_counts = compute_head_entity_counts(
        l5_data,
        l8_data,
        reference_counts=recorded_counts if isinstance(recorded_counts, dict) else None,
        extra_docs=extra_docs,
    )
    counts_not_evaluated = (
        not isinstance(recorded_counts, dict) or len(recorded_counts) == 0
    )
    counts_not_evaluated_reason = (
        "no_head_entity_counts_in_record" if counts_not_evaluated else None
    )
    count_diffs: dict[str, dict[str, Any]] = {}
    if isinstance(recorded_counts, dict) and len(recorded_counts) > 0:
        for k, rec_v in recorded_counts.items():
            comp_v = computed_counts.get(k)
            if rec_v != comp_v:
                count_diffs[k] = {"recorded": rec_v, "computed": comp_v}
    else:
        count_diffs["<head_entity_counts>"] = {
            "recorded": None,
            "computed": computed_counts,
            "error": "not_evaluated:no_head_entity_counts_in_record",
        }

    recorded_ver = rec_data.get("verification", {})
    ver_diffs: dict[str, dict[str, Any]] = {}
    if isinstance(recorded_ver, dict):
        if (
            "all_pointers_resolved" in recorded_ver
            and recorded_ver["all_pointers_resolved"] != ptr_res["passed"]
        ):
            ver_diffs["all_pointers_resolved"] = {
                "recorded": recorded_ver["all_pointers_resolved"],
                "computed": ptr_res["passed"],
            }
        if "l8_full_return_or_fixture_or_hash_added" in recorded_ver:
            computed_added = len(added_l8_forbidden) > 0
            if (
                recorded_ver["l8_full_return_or_fixture_or_hash_added"]
                != computed_added
            ):
                ver_diffs["l8_full_return_or_fixture_or_hash_added"] = {
                    "recorded": recorded_ver["l8_full_return_or_fixture_or_hash_added"],
                    "computed": computed_added,
                }

    mechanical_match = (
        pin_res["passed"]
        and ptr_res["passed"]
        and neg_res["passed"]
        and fn_res["passed"]
        and obl_res["passed"]
        and cap_post["passed"]
        and len(count_diffs) == 0
        and len(ver_diffs) == 0
    )

    return {
        "schema": "design-verification-freeze-audit.v1",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "freeze_path": freeze_path,
        "slice_id": rec_data.get("slice_id"),
        "evaluated_at_revision": head_rev or "WORKTREE",
        "base_revision": base_rev,
        "mechanical_match": mechanical_match,
        "checks": {
            "CHK-PIN-SHA256": pin_res,
            "CHK-JSON-POINTER": ptr_res,
            "CHK-NEG-4WAY-MATCH": neg_res,
            "CHK-PUBLIC-FN-FREEZE": fn_res,
            "CHK-L3-OBLIGATION-MAP": obl_res,
            "CHK-OWNERSHIP-CAP-L8": cap_post,
            "CHK-OWNERSHIP-CAP-L8-DIFF": {
                "added_forbidden_keys": added_l8_forbidden,
                "full_file_existing_violations": cap_post["failures"],
            },
        },
        "comparison_with_existing_record": {
            "pins_match": pin_res["passed"],
            "pin_mismatches": pin_res["failures"],
            "pointers_resolved_match": ptr_res["passed"],
            "unresolved_pointers": ptr_res["failures"],
            "head_entity_counts_status": "not_evaluated"
            if counts_not_evaluated
            else "evaluated",
            "head_entity_counts_not_evaluated_reason": counts_not_evaluated_reason,
            "head_entity_counts_match": (not counts_not_evaluated)
            and len(count_diffs) == 0,
            "head_entity_counts_computed": computed_counts,
            "head_entity_counts_diffs": count_diffs,
            "verification_fields_match": len(ver_diffs) == 0,
            "verification_fields_diffs": ver_diffs,
        },
    }


def generate_freeze_record(
    repo_root: Path,
    declaration_data: dict[str, Any],
    base_rev: str | None = None,
    head_rev: str | None = None,
) -> dict[str, Any]:
    """Generate/populate mechanical fields (Section 5 Group B) from a declaration manifest (Group A)."""
    out = dict(declaration_data)
    eff_base = base_rev or out.get("source_main") or out.get("request_base_sha")
    if not eff_base:
        proc = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=str(repo_root),
            capture_output=True,
            text=True,
            check=False,
        )
        eff_base = proc.stdout.strip()

    out["evidence_kind"] = out.get("evidence_kind", "slice_level_function_pair_freeze")
    out["authority_effect"] = "none"
    out["source_main"] = out.get("source_main") or eff_base
    out["request_base_sha"] = out.get("request_base_sha") or eff_base
    if "recorded_at_utc" not in out:
        out["recorded_at_utc"] = datetime.datetime.now(datetime.timezone.utc).isoformat(
            timespec="seconds"
        )

    aliases = out.get("path_aliases", {})
    pins: dict[str, str] = {}
    modified_aliases = set(out.get("modified_aliases", ["L5", "L8"]))
    for alias, rel_path in aliases.items():
        if alias in modified_aliases:
            pre_bytes = _read_bytes(repo_root, rel_path, eff_base)
            post_bytes = _read_bytes(repo_root, rel_path, head_rev)
            if pre_bytes is not None:
                pins[f"{alias}_pre_sha256"] = hashlib.sha256(pre_bytes).hexdigest()
            if post_bytes is not None:
                pins[f"{alias}_post_sha256"] = hashlib.sha256(post_bytes).hexdigest()
        else:
            raw_bytes = _read_bytes(repo_root, rel_path, head_rev)
            if raw_bytes is not None:
                pins[f"{alias}_sha256"] = hashlib.sha256(raw_bytes).hexdigest()
    out["pins"] = pins

    l4_path = aliases.get("L4", "")
    l9_path = aliases.get("L9", "")
    l5_path = aliases.get("L5", "")
    l8_path = aliases.get("L8", "")

    l4_data = _load_json(repo_root, l4_path, head_rev) if l4_path else {}
    l9_data = _load_json(repo_root, l9_path, head_rev) if l9_path else {}
    l5_data = _load_json(repo_root, l5_path, head_rev) if l5_path else {}
    l8_data = _load_json(repo_root, l8_path, head_rev) if l8_path else {}
    l8_pre_data = (
        _load_json(repo_root, l8_path, eff_base) if (l8_path and eff_base) else {}
    )

    ptr_res = check_json_pointer(
        repo_root,
        out.get("record_path", "docs/governance/audits/tdd/generated-freeze.json"),
        out,
        base_rev=eff_base,
        head_rev=head_rev,
    )
    neg_res = check_neg_4way_match(
        repo_root,
        l4_path,
        l9_path,
        l8_path,
        l5_path,
        l4_data=l4_data,
        l9_data=l9_data,
        l8_data=l8_data,
        l5_data=l5_data,
    )
    fn_res = check_public_fn_freeze(out, l5_data, l8_data)
    obl_res = check_l3_obligation_map(out, l5_data, l8_data, l9_data)

    cap_post = check_ownership_cap(repo_root, l8_path, l8_data, layer="L8")
    cap_pre = (
        check_ownership_cap(repo_root, l8_path, l8_pre_data, layer="L8")
        if l8_pre_data
        else {"failures": []}
    )
    pre_ptrs = {(f["pointer"], f["key"]) for f in cap_pre.get("failures", [])}
    added_l8_forbidden = [
        f
        for f in cap_post.get("failures", [])
        if (f["pointer"], f["key"]) not in pre_ptrs
    ]

    extra_docs: dict[str, dict[str, Any]] = {}
    for ak in ("H009_L5", "H009_L8"):
        if ak in aliases:
            extra_docs[ak] = _load_json(repo_root, aliases[ak], head_rev) or {}

    existing_counts = out.get("head_entity_counts")
    out["head_entity_counts"] = compute_head_entity_counts(
        l5_data,
        l8_data,
        reference_counts=existing_counts if isinstance(existing_counts, dict) else None,
        extra_docs=extra_docs,
    )
    out["pointer_resolution_summary"] = {
        "checked_count": ptr_res["checked_count"],
        "expanded_target_count": ptr_res["expanded_target_count"],
        "unresolved_count": len(ptr_res["failures"]),
        "passed": ptr_res["passed"],
    }
    out["negative_case_4way_verification"] = {
        "counts": neg_res["counts"],
        "matched_case_count": neg_res["matched_case_count"],
        "failure_count": len(neg_res["failures"]),
        "passed": neg_res["passed"],
    }
    if "comparison_mode" in neg_res:
        out["negative_case_4way_verification"].update(
            {
                "comparison_mode": neg_res["comparison_mode"],
                "comparison_scope": neg_res["comparison_scope"],
                "count_unit": neg_res["count_unit"],
                "matched_case_count_unit": neg_res["matched_case_count_unit"],
            }
        )
        if "class_row_counts" in neg_res:
            out["negative_case_4way_verification"]["class_row_counts"] = neg_res[
                "class_row_counts"
            ]
            out["negative_case_4way_verification"]["case_row_counts"] = neg_res[
                "case_row_counts"
            ]
    out["resolved_function_rows"] = fn_res["resolved_function_rows"]
    out["human_judgment_pending"] = (
        fn_res["human_judgment_pending"] + obl_res["human_judgment_pending"]
    )

    ver = dict(out.get("verification") or {})
    ver["all_pointers_resolved"] = ptr_res["passed"]
    ver["negative_4way_matched_count"] = neg_res["matched_case_count"]
    if "comparison_mode" in neg_res:
        ver["negative_4way_comparison_mode"] = neg_res["comparison_mode"]
        ver["negative_4way_comparison_scope"] = neg_res["comparison_scope"]
        ver["negative_4way_count_unit"] = neg_res["count_unit"]
        ver["negative_4way_matched_count_unit"] = neg_res["matched_case_count_unit"]
        if "class_row_counts" in neg_res:
            ver["negative_4way_class_row_counts"] = neg_res["class_row_counts"]
            ver["negative_4way_case_row_counts"] = neg_res["case_row_counts"]
    ver["l8_full_return_or_fixture_or_hash_added"] = len(added_l8_forbidden) > 0
    ver["scfctl_stale_count"] = 0
    out["verification"] = ver

    return out


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="L3-L10 Design Verification Checker & Freeze Record Generator (Scaffold)."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_audit = sub.add_parser(
        "check-freeze",
        help="Audit one or more freeze records against mechanical checks (Section 4 & 5).",
    )
    p_audit.add_argument("files", nargs="+", help="Freeze record JSON paths.")
    p_audit.add_argument("--root", default=".", help="Repository root path.")
    p_audit.add_argument(
        "--worktree",
        action="store_true",
        help="Evaluate post-pins against current working tree instead of freeze creation commit.",
    )

    p_gen = sub.add_parser(
        "generate-freeze",
        help="Populate mechanical fields of a freeze record from a declaration manifest.",
    )
    p_gen.add_argument("--input", required=True, help="Input declaration JSON path.")
    p_gen.add_argument(
        "--output", help="Output freeze record JSON path (stdout if omitted)."
    )
    p_gen.add_argument("--base-rev", help="Base git commit SHA for *_pre_sha256.")
    p_gen.add_argument(
        "--head-rev", help="Head git commit SHA (default: working tree)."
    )
    p_gen.add_argument("--root", default=".", help="Repository root path.")

    p_pair = sub.add_parser(
        "check-pair",
        help="Run CHK-PAIR-BIDIR-ID and CHK-OWNERSHIP-CAP on a left/right V-pair.",
    )
    p_pair.add_argument(
        "--left", required=True, help="Left layer JSON path (L3/L4/L5/L6)."
    )
    p_pair.add_argument(
        "--right", required=True, help="Right layer JSON path (L10/L9/L8/L7)."
    )
    p_pair.add_argument("--root", default=".", help="Repository root path.")

    p_child = sub.add_parser(
        "check-child",
        help="Run 4-layer checks (CHK-PAIR-BIDIR-ID, CHK-NEG-4WAY-MATCH, CHK-OWNERSHIP-CAP, CHK-PIN-SHA256) on a child L4/L9/L5/L8.",
    )
    p_child.add_argument("--l4", required=True, help="L4 JSON path.")
    p_child.add_argument("--l9", required=True, help="L9 JSON path.")
    p_child.add_argument("--l5", required=True, help="L5 JSON path.")
    p_child.add_argument("--l8", required=True, help="L8 JSON path.")
    p_child.add_argument("--root", default=".", help="Repository root path.")

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)
    repo_root = Path(args.root).resolve()

    if args.command == "check-freeze":
        results = []
        all_ok = True
        for fpath in args.files:
            res = audit_freeze_record(
                repo_root, fpath, use_creation_commit=not args.worktree
            )
            results.append(res)
            if not res.get("mechanical_match", False):
                all_ok = False
        payload = {
            "schema": "design-verification-checker-report.v1",
            "spec_document": SPEC_DOCUMENT,
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "legacy_basis": LEGACY_BASIS,
            "derivation_map": DERIVATION_MAP,
            "all_mechanical_matched": all_ok,
            "results": results,
        }
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0 if all_ok else 1

    if args.command == "generate-freeze":
        in_path = Path(args.input)
        decl = json.loads(in_path.read_text(encoding="utf-8"))
        generated = generate_freeze_record(
            repo_root, decl, base_rev=args.base_rev, head_rev=args.head_rev
        )
        formatted = json.dumps(generated, ensure_ascii=False, indent=2) + "\n"
        if args.output:
            Path(args.output).write_text(formatted, encoding="utf-8")
        else:
            sys.stdout.write(formatted)
        return 0

    if args.command == "check-pair":
        pair_res = check_pair_bidir_id(repo_root, args.left, args.right)
        cap_l = check_ownership_cap(repo_root, args.left)
        cap_r = check_ownership_cap(repo_root, args.right)
        ok = pair_res["passed"] and cap_l["passed"] and cap_r["passed"]
        payload = {
            "schema": "design-verification-pair-report.v1",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "passed": ok,
            "pair_bidir": pair_res,
            "left_ownership_cap": cap_l,
            "right_ownership_cap": cap_r,
        }
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0 if ok else 1

    if args.command == "check-child":
        p49 = check_pair_bidir_id(repo_root, args.l4, args.l9, left_layer="L4")
        p58 = check_pair_bidir_id(repo_root, args.l5, args.l8, left_layer="L5")
        neg = check_neg_4way_match(repo_root, args.l4, args.l9, args.l8, args.l5)
        caps = [
            check_ownership_cap(repo_root, p)
            for p in (args.l4, args.l9, args.l5, args.l8)
        ]
        pins = [
            check_pin_sha256(repo_root, p) for p in (args.l4, args.l9, args.l5, args.l8)
        ]
        ok = (
            p49["passed"]
            and p58["passed"]
            and neg["passed"]
            and all(c["passed"] for c in caps)
            and all(p["passed"] for p in pins)
        )
        payload = {
            "schema": "design-verification-child-report.v1",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "passed": ok,
            "L4_L9_pair": p49,
            "L5_L8_pair": p58,
            "negative_4way": neg,
            "ownership_caps": caps,
            "pins": pins,
        }
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0 if ok else 1

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
