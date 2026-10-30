#!/usr/bin/env python3
"""Replay the recorded WR245 checker probes from in-repository JSON inputs.

These are schema-shape probes only. The PR-B overlay changes L4/L5 `code`
from stable IDs to expected outcome labels, so a checker PASS is not semantic
approval and does not authorize edits to formal L4/L5 files.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
INPUTS = HERE / "inputs"
REPORTS = HERE / "reports"
L4 = INPUTS / "l4-proposed-pr-a.json"
L9_A = INPUTS / "l9-proposed-pr-a.json"
L5_B = INPUTS / "l5-probe-pr-b.json"
L8_B = INPUTS / "l8-probe-pr-b.json"
L9_B = INPUTS / "l9-probe-pr-b.json"
REPORT_A = REPORTS / "pr-a-check-child-report.json"
REPORT_B = REPORTS / "pr-b-overlay-check-child-report.json"
MANIFEST = HERE / "trial-manifest.json"
BASE = "456bf1f4e143811a32ae1314f3146e34098509db"
CHECKER = "scaffold/tools/design_verification_checker.py"
L5_SOURCE = "docs/helix-security/L5-detail-design/revoke-quarantine-propagation.json"
L8_SOURCE = "docs/helix-security/L8-unit-verification/revoke-quarantine-propagation.json"
PINNED = {
    L4: "d46e39cad2e2a90cfc532fa57226a4d650336e794a375f07e1cc2e6cbba15eb3",
    L9_A: "7513bf5edc381aec1cf6a6ae2b3abe6c01cafe16d2bb6f7ad59e452c2efaad4e",
    L5_B: "e539a960b093971af946b6ff375cf4b3f1818f72aa6bbaf4860fca8a98c9825a",
    L8_B: "bcb164ae413cc367967d3d956ea325763dc4d7ccd88d7b1405e2d38b653c577e",
    L9_B: "c97337aac023b68238f3cb7f4f75f9e05d5a0d998eac6a73f42cd57319723fac",
}
EXPECTED_BASE_SHA = {
    CHECKER: "e751526d67cd8df11e5aac1c5a1a178dfbd0fecc3f2ed21f995b7dda11ea4d5d",
    L5_SOURCE: "90c3761e88ea76fefe1222372ffa1218afcf2fc8cb4dec666ca8b7ca98bd8734",
    L8_SOURCE: "ebfb5a50360fbcf4c0df262a4c31c87870b963b9d4e557888d63aef74699c777",
}


def digest(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def fail(message: str) -> None:
    raise ValueError(message)


def git_file(path: str) -> bytes:
    return subprocess.check_output(["git", "-C", str(ROOT), "show", f"{BASE}:{path}"])


def verify_pins() -> dict[str, Any]:
    manifest = json.loads(MANIFEST.read_bytes())
    if manifest.get("base_revision") != BASE:
        fail("trial manifest base revision mismatch")
    if manifest.get("checker", {}).get("path") != CHECKER or manifest["checker"].get("sha256") != EXPECTED_BASE_SHA[CHECKER]:
        fail("trial manifest checker source pin mismatch")
    for entry in manifest.get("trial_inputs", []):
        path = HERE / entry["path"]
        if not path.exists() or digest(path.read_bytes()) != entry.get("sha256"):
            fail(f"trial manifest input pin mismatch: {entry.get('path')}")
    for path, expected in PINNED.items():
        actual = digest(path.read_bytes())
        if actual != expected:
            fail(f"trial input SHA mismatch: {path.name} {actual}")
    for path, expected in EXPECTED_BASE_SHA.items():
        actual = digest(git_file(path))
        if actual != expected:
            fail(f"base source SHA mismatch: {path} {actual}")
        if digest((ROOT / path).read_bytes()) != expected:
            fail(f"working source differs from pinned base: {path}")
    return manifest


def verify_semantic_remap() -> dict[str, int]:
    l4_base = json.loads(git_file("docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json"))
    l5_base = json.loads(git_file(L5_SOURCE))
    l4_trial = json.loads(L4.read_bytes())
    l5_trial = json.loads(L5_B.read_bytes())
    base_classes = l4_base["failure_classifications"]
    trial_classes = l4_trial["failure_classifications"]
    if len(base_classes) != 30 or len(trial_classes) != 30:
        fail("expected 30 L4 class rows")
    if any((a.get("class_id"), a.get("expected_classification")) != (b.get("class_id"), b.get("expected_classification")) for a,b in zip(base_classes,trial_classes)):
        fail("L4 stable IDs or expected classification changed in probe")
    if any(row.get("code") != row.get("expected_classification") for row in trial_classes):
        fail("L4 checker probe does not exhibit the recorded code remap")
    base_rules = l5_base["failure_rules"]
    trial_rules = l5_trial["failure_rules"]
    if len(base_rules) != 30 or len(trial_rules) != 30:
        fail("expected 30 L5 rule rows")
    if any((a.get("id"), a.get("class_id")) != (b.get("id"), b.get("class_id")) for a,b in zip(base_rules,trial_rules)):
        fail("L5 stable rule/class IDs changed in probe")
    if any(row.get("code") != row.get("expected",{}).get("condition") for row in trial_rules):
        fail("L5 checker probe does not exhibit the recorded code remap")
    return {"L4_code_to_expected_outcome_remaps": 30, "L5_code_to_expected_outcome_remaps": 30}


def run_trial(name: str, l4: Path, l9: Path, l5: Path, l8: Path, expected_exit: int, failures: int, matched: int, report_path: Path, record: bool) -> dict[str, Any]:
    command = [sys.executable, str(ROOT / CHECKER), "check-child", "--l4", str(l4.relative_to(ROOT)), "--l9", str(l9.relative_to(ROOT)), "--l5", str(l5.relative_to(ROOT)), "--l8", str(l8.relative_to(ROOT)), "--root", str(ROOT)]
    result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True)
    if result.returncode != expected_exit:
        fail(f"{name} checker exit was {result.returncode}, expected {expected_exit}; stderr={result.stderr[-1000:]}")
    report = json.loads(result.stdout)
    n4 = report["negative_4way"]
    actual_failures = len(n4["failures"])
    actual_matched = n4["matched_case_count"]
    if (actual_failures, actual_matched) != (failures, matched):
        fail(f"{name} measured {(actual_failures,actual_matched)}, expected {(failures,matched)}")
    if report_path.exists() and not record:
        saved = json.loads(report_path.read_bytes())
        if report != saved:
            fail(f"{name} replay output differs from stored checker report")
    else:
        report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    return {
        "name": name,
        "command": command,
        "exit_code": result.returncode,
        "passed": report.get("passed"),
        "negative_4way_failures": actual_failures,
        "matched_case_count": actual_matched,
        "report_path": str(report_path.relative_to(ROOT)),
        "report_sha256": digest(report_path.read_bytes()),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--record", action="store_true", help="write the deterministic reports from this replay")
    args = parser.parse_args()
    manifest = verify_pins()
    remap = verify_semantic_remap()
    l5_base = ROOT / L5_SOURCE
    l8_base = ROOT / L8_SOURCE
    pr_a = run_trial("PR-A intermediate state", L4, L9_A, l5_base, l8_base, 1, 438, 0, REPORT_A, args.record)
    pr_b = run_trial("PR-B shape-only overlay", L4, L9_B, L5_B, L8_B, 0, 0, 275, REPORT_B, args.record)
    manifest_trials = {trial["id"]: trial for trial in manifest.get("trials", [])}
    for result, trial_id in ((pr_a, "pr-a-intermediate"), (pr_b, "pr-b-shape-overlay")):
        expected = manifest_trials.get(trial_id)
        if expected is None or expected.get("report_sha256") != result["report_sha256"]:
            fail(f"trial manifest report pin mismatch: {trial_id}")
        if (expected.get("exit_code"), expected.get("passed"), expected.get("negative_4way_failures"), expected.get("matched_case_count")) != (result["exit_code"], result["passed"], result["negative_4way_failures"], result["matched_case_count"]):
            fail(f"trial manifest result mismatch: {trial_id}")
    summary = {
        "base_revision": BASE,
        "checker_source": CHECKER,
        "checker_source_sha256": EXPECTED_BASE_SHA[CHECKER],
        "base_L5_sha256": EXPECTED_BASE_SHA[L5_SOURCE],
        "base_L8_sha256": EXPECTED_BASE_SHA[L8_SOURCE],
        "semantic_remap_audit": remap,
        "trials": [pr_a, pr_b],
        "semantic_approval": False,
        "interpretation": "PR-B output is a checker-shape result only. Its 30 L4 and 30 L5 code fields change from stable IDs to expected outcome labels. This is not semantic approval or authorization to edit formal documents.",
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, IndexError, TypeError, ValueError, subprocess.CalledProcessError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
