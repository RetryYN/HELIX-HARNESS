#!/usr/bin/env python3
"""ADD-47後のD-Axis-0限定refreeze候補を最新mainから再構成する。"""
from __future__ import annotations

import argparse
import copy
import datetime
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

BASE_RECORD = "docs/governance/audits/tdd/h009-fn5-axis-cause-pointer-crosswalk-add46-refreeze-2026-10-30.json"
OUTPUT_DEFAULT = "docs/governance/audits/tdd/h009-fn5-axis-cause-pointer-crosswalk-add47-refreeze-2026-10-30.json"
LAYER_PATHS = (
    "docs/helix-harness/L5-detail-design/product-template-application.json",
    "docs/helix-harness/L8-unit-verification/product-template-application.json",
    "docs/helix-harness/L9-integration-verification/product-template-application.json",
)
OLD_FREEZE = "docs/governance/audits/tdd/h009-fn5-axis-cause-pointer-crosswalk-freeze-2026-10-29.json"
OLD_REFREEZE = "docs/governance/audits/tdd/h009-fn5-axis-cause-pointer-crosswalk-add46-refreeze-2026-10-30.json"
SOURCE_CONTENT = "docs/governance/audits/tdd/h009-fn5-source-content-failure-writer-pr-candidate-freeze-2026-10-29.json"


def run_json(command: list[str], cwd: Path) -> tuple[dict, bytes, int]:
    result = subprocess.run(command, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if not result.stdout:
        raise RuntimeError(f"コマンドにJSON出力がない: {command}; stderr={result.stderr.decode(errors='replace')}")
    return json.loads(result.stdout), result.stdout, result.returncode


def revision(root: Path) -> str:
    return subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip()


def selected_freeze_paths(root: Path, base_revision: str) -> list[str]:
    listed = subprocess.check_output(
        ["git", "ls-tree", "-r", "--name-only", base_revision, "docs/governance/audits/tdd"],
        cwd=root,
        text=True,
    ).splitlines()
    selected: list[str] = []
    for path in listed:
        name = Path(path).name.lower()
        if not any(token in name for token in ("freeze", "refreeze")) or "checker-reconcile" in name:
            continue
        raw = subprocess.check_output(["git", "show", f"{base_revision}:{path}"], cwd=root)
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue
        serialized = json.dumps(data, ensure_ascii=False)
        if any(layer_path in serialized for layer_path in LAYER_PATHS):
            selected.append(path)
    return selected


def check_freeze_set(root: Path, paths: list[str]) -> tuple[dict, bytes, int]:
    return run_json(
        [
            sys.executable,
            "scaffold/tools/design_verification_checker.py",
            "check-freeze",
            "--worktree",
            "--root",
            str(root),
            *paths,
        ],
        root,
    )


def check_child(root: Path) -> dict:
    result, _, code = run_json(
        [
            sys.executable,
            "scaffold/tools/design_verification_checker.py",
            "check-child",
            "--root",
            str(root),
            "--l4",
            "docs/helix-harness/L4-basic-design/product-template-application.json",
            "--l9",
            "docs/helix-harness/L9-integration-verification/product-template-application.json",
            "--l5",
            "docs/helix-harness/L5-detail-design/product-template-application.json",
            "--l8",
            "docs/helix-harness/L8-unit-verification/product-template-application.json",
        ],
        root,
    )
    if code != 0:
        raise RuntimeError("check-childが不合格のためrefreeze recordを生成しない")
    return result


def check_basic_pair(root: Path) -> dict:
    result, _, code = run_json(
        [
            sys.executable,
            "scaffold/tools/design_verification_checker.py",
            "check-pair",
            "--root",
            str(root),
            "--left",
            "docs/helix-harness/L4-basic-design/product-template-application.json",
            "--right",
            "docs/helix-harness/L9-integration-verification/product-template-application.json",
        ],
        root,
    )
    if code != 0:
        raise RuntimeError("L4/L9 check-pairが不合格のためrefreeze recordを生成しない")
    return result


def stale_count(root: Path) -> int:
    result = subprocess.check_output(
        [sys.executable, "scaffold/tools/scfctl.py", "stale"], cwd=root, text=True
    )
    match = re.search(r"^stale=(\d+)$", result, flags=re.MULTILINE)
    if not match:
        raise RuntimeError("scfctl staleの件数を読めない")
    return int(match.group(1))


def pin_failure_count(row: dict) -> int:
    return len(row.get("checks", {}).get("CHK-PIN-SHA256", {}).get("failures", []))


def make_freeze_impact_review(base_root: Path, candidate_root: Path, base_revision: str) -> dict:
    paths = selected_freeze_paths(base_root, base_revision)
    base_result, base_raw, base_rc = check_freeze_set(base_root, paths)
    candidate_result, candidate_raw, candidate_rc = check_freeze_set(candidate_root, paths)
    base_rows = {row["freeze_path"]: row for row in base_result["results"]}
    candidate_rows = {row["freeze_path"]: row for row in candidate_result["results"]}
    transitions = [
        {
            "path": path,
            "base_mechanical_match": base_rows[path]["mechanical_match"],
            "candidate_mechanical_match": candidate_rows[path]["mechanical_match"],
        }
        for path in paths
        if base_rows[path]["mechanical_match"] != candidate_rows[path]["mechanical_match"]
    ]
    targeted = []
    for path in (OLD_REFREEZE, OLD_FREEZE, SOURCE_CONTENT):
        if path not in base_rows:
            continue
        targeted.append(
            {
                "path": path,
                "base_mechanical_match": base_rows[path]["mechanical_match"],
                "candidate_mechanical_match": candidate_rows[path]["mechanical_match"],
                "base_pin_failure_count": pin_failure_count(base_rows[path]),
                "candidate_pin_failure_count": pin_failure_count(candidate_rows[path]),
                "candidate_pin_failures": candidate_rows[path].get("checks", {}).get("CHK-PIN-SHA256", {}).get("failures", []),
            }
        )
    changed_rows = sum(base_rows[path] != candidate_rows[path] for path in paths)
    unchanged_rows = len(paths) - changed_rows
    return {
        "recomputed_at_utc": None,
        "latest_main_base": base_revision,
        "candidate_head": revision(candidate_root),
        "target_record_set": {
            "selection": "base revision内のTDD監査JSONから、file名にfreezeまたはrefreezeを含み（checker-reconcileを除外）、本文でL5/L8/L9 product-template-application文書の完全pathを一つ以上参照する記録を選ぶ。mainと候補で同じpath集合を使う。",
            "selection_base_revision": base_revision,
            "excluded": "checker-reconcile報告、base revisionに存在しない新規refreeze候補。",
            "count": len(paths),
            "record_paths": paths,
            "execution_mode": "python3 scaffold/tools/design_verification_checker.py check-freeze --worktree --root <worktree> <record_paths>",
        },
        "base_worktree_revision": revision(base_root),
        "candidate_worktree_revision": revision(candidate_root),
        "candidate_worktree_contains_uncommitted_changes": True,
        "candidate_tree_state_ja": "candidate_rootはlatest mainを祖先に持つ候補worktree。L8/SCF pin差分はcandidate HEADへcommit済み。refreeze builderと出力recordは未commit。",
        "base_result_count": len(base_result["results"]),
        "candidate_result_count": len(candidate_result["results"]),
        "base_command_exit_code": base_rc,
        "candidate_command_exit_code": candidate_rc,
        "base_check_freeze_all_mechanical_matched": base_result["all_mechanical_matched"],
        "candidate_check_freeze_all_mechanical_matched": candidate_result["all_mechanical_matched"],
        "mechanical_match_count_base": sum(bool(row["mechanical_match"]) for row in base_result["results"]),
        "mechanical_match_count_candidate": sum(bool(row["mechanical_match"]) for row in candidate_result["results"]),
        "mechanical_match_boolean_transition_count": len(transitions),
        "mechanical_match_boolean_transitions": transitions,
        "targeted_diagnostic_records": targeted,
        "raw_report_comparison": {
            "base_bytes": len(base_raw),
            "base_sha256": hashlib.sha256(base_raw).hexdigest(),
            "candidate_bytes": len(candidate_raw),
            "candidate_sha256": hashlib.sha256(candidate_raw).hexdigest(),
            "result_object_diff_count": changed_rows,
            "result_object_unchanged_count": unchanged_rows,
            "interpretation_ja": "raw report行の差分はmechanical matchの遷移数とは別に数える。既存pin診断の変化だけから他recordの合格を推定しない。",
        },
        "artifact_status": "指定されたfreeze record群の静的比較。独立意味review、U-ID実行、F05全体freezeを示さない。",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="ADD-47後の限定refreeze候補を最新mainと照合して生成する。")
    parser.add_argument("--root", required=True, type=Path, help="ADD-47候補worktreeのroot")
    parser.add_argument("--base-root", required=True, type=Path, help="変更前mainのworktree root")
    parser.add_argument("--base-revision", required=True, help="mainの固定commit SHA")
    parser.add_argument("--recorded-at-utc", help="再現時に固定する作成時刻（ISO 8601 UTC、省略時は実時刻）")
    parser.add_argument("--recomputed-at-utc", help="再現時に固定する再計算時刻（ISO 8601 UTC、省略時は実時刻）")
    parser.add_argument("--output", default=OUTPUT_DEFAULT, help="rootからの相対出力path")
    args = parser.parse_args()
    root = args.root.resolve()
    base_root = args.base_root.resolve()
    out_path = root / args.output
    if not out_path.resolve().is_relative_to(root):
        raise SystemExit("出力pathは候補worktree root配下に置く")
    if revision(base_root) != args.base_revision:
        raise SystemExit("base-root HEADが指定base-revisionと一致しない")
    recorded_at = args.recorded_at_utc or datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")

    old = json.loads((root / BASE_RECORD).read_text())
    manifest = copy.deepcopy(old)
    manifest["record_id"] = "HARNESS009-FN5-AXIS-CAUSE-POINTER-CROSSWALK-ADD47-REFREEZE-20261030"
    manifest["request_id"] = "WR154-R2-ADD47-L8-REFREEZE-20261030"
    manifest["record_path"] = args.output
    manifest["source_main"] = args.base_revision
    manifest["request_base_sha"] = args.base_revision
    manifest["modified_aliases"] = ["L8"]
    manifest["recorded_at_utc"] = recorded_at
    manifest.pop("review_response_ref", None)
    manifest["remaining_scope_ja"] = (
        f"{args.base_revision} mainを基点に、ADD-46/47の固定writer leafを含むL8 revision pinだけを更新するD-Axis-0限定refreeze候補。"
        "前recordのO2意味と3条件は保つ。L8 ADD-26/27をO2全枝のU-IDとして対応させ、両方not_executedのまま保持する。"
        "private detail reentry_slice=D-H009-T3bは別sliceのまま。本候補が扱うのはD-Axis-0の該当2枝だけで、ADD-46 source_ref writer leaf、"
        "ADD-47 source/body payload mismatch writer leaf、その固定入力delta/BodyOccurrence Cause期待、他F05 cause・親返却は本slice外。ADD-46/47ともnot_executedで、fixture全体、producer実行、L9対応、pair freezeの成立を示さない。"
    )
    manifest["criterion"] = (
        "3条件を維持する。1) DT-VT-105に従い、L3/L10上位期待とL4/L9 basic semanticsからO2期待を独立に導き、"
        "L5/L8技術shapeを別に対応照合する。2) O2全2枝をL8 U-ID #26/27に対応させ、両行はnot_executed・独立review pendingのまま保持する。"
        f"3) private detail reentry_slice=D-H009-T3bをこのpair sliceから分離する。latest main {args.base_revision}をbaseとし、"
        "ADD-47追加後のL8 post pin、L4 unchanged pointer、全pointer/count/verification fieldをcheckerで照合する。"
        "ADD-46/47はいずれもこのO2 slice外の候補であり、このrefreezeのcase closureへ数えない。"
    )
    manifest["scope"]["excluded"] = list(manifest["scope"]["excluded"]) + [
        "ADD-46 source_ref fixed writer leaf候補（同一L8文書内だが、このO2 pair sliceのclosure対象外。not_executed。）",
        "ADD-47 source_body_mismatch fixed writer leaf候補（同一L8文書内だが、このO2 pair sliceのclosure対象外。not_executed。）"
    ]
    superseded = list(manifest.get("supersedes_records", []))
    if not any(row.get("record_path") == old["record_path"] for row in superseded):
        superseded.append(
            {
                "record_id": old["record_id"],
                "record_path": old["record_path"],
                "supersession_scope": "同じD-Axis-0/O2 sliceについて、ADD-46/47を含む新L8 file revisionのpin/count/機械検証recordへ差し替える。旧recordと旧revisionの証拠は変更せず保持する。",
            }
        )
    manifest["supersedes_records"] = superseded
    freeze_impact = make_freeze_impact_review(base_root, root, args.base_revision)
    recomputed_at = args.recomputed_at_utc or datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
    freeze_impact["recomputed_at_utc"] = recomputed_at
    manifest["freeze_impact_review"] = freeze_impact

    sys.path.insert(0, str(root / "scaffold/tools"))
    from design_verification_checker import generate_freeze_record

    generated = generate_freeze_record(root, manifest, base_rev=args.base_revision)
    generated["verification"]["add46_add47_scope_status"] = "ADD-46/47は同一L8文書内の別candidate。execution_state=not_executed。D-Axis-0 O2 case数へ加えない。"
    generated["verification"]["L4_L9_check_pair"] = check_basic_pair(root)
    generated["verification"]["L5_L8_check_child"] = check_child(root)
    generated["verification"]["scfctl_stale_count"] = stale_count(root)
    encoded = (json.dumps(generated, ensure_ascii=False, indent=2) + "\n").encode()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(encoded)
    print(f"output={out_path}")
    print(f"sha256={hashlib.sha256(encoded).hexdigest()}")
    print(f"base={args.base_revision}; modified_aliases=L8; freeze_paths={generated['freeze_impact_review']['target_record_set']['count']}")
    print(f"recorded_at_utc={recorded_at}; recomputed_at_utc={recomputed_at}")
    print("scope=O2 D-Axis-0の2枝のみ。ADD-46/47は対象外かつnot_executed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
