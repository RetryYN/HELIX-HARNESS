#!/usr/bin/env python3
"""merge_admission.py — 統制レーンのmerge admission・試験merge・明示merge・read-after仮設ツール。

正本手順: docs/governance/github-upstream-operating-model.md 258〜298行
（「作成側とレビュー対応側の責務」258〜266行、「governance／operation_change PRのmerge admission」
268〜282行、「PR #1797 repository_foundation」284〜299行）。

旧HELIXの対応:
- LEGACY-ASSET-6EBDB617A8104A7756D0 (CLAUDE.md L191-215)
- LEGACY-ASSET-A54FF182C7E8ACF56ACF (AGENTS.md L315-335)
- LEGACY-ASSET-CF1129DCA8779904F6B3 (github-autonomous-operations-requirements.md L91-94, L107-115)
- LEGACY-ASSET-8686BB8CF396BAF57F2E (github-merge-admission-requirements.md L21-50, L98-126, L135)
- LEGACY-ASSET-A813B096E3205791EC07 (src/audit/github-merge-readiness.ts L1-882)

権限の境界:
- 本スクリプトは手順を機械化するだけで、mergeの権限を生まない。
- 自分のPRのmerge（author == executor / reviewer）、DraftのReady化、GitHub native auto-merge、
  PR branchへのbase取込み（content HEAD変更）、release/tagは行わず、行える分岐も持たない。
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from typing import Any, Callable

HERE = Path(__file__).resolve().parent
DEFAULT_REPO_ROOT = HERE.parents[1]
HEX40_RE = re.compile(r"^[0-9a-f]{40}$")
GH_SUBCMD = "merge"
MAX_WAIT_ATTEMPTS = 240
MAX_WAIT_INTERVAL = 300.0
READ_AFTER_WAIT_ATTEMPTS = 5
READ_AFTER_WAIT_INTERVAL = 1.0
PR_VIEW_FIELDS = "state,isDraft,headRefOid,autoMergeRequest,mergeStateStatus"

RunnerType = Callable[[list[str], Path | None], subprocess.CompletedProcess[str]]


def default_runner(
    argv: list[str], cwd: Path | None = None
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        argv,
        cwd=str(cwd) if cwd is not None else None,
        text=True,
        capture_output=True,
        check=False,
    )


def validate_inputs(
    pr: int,
    head: str,
    review_comment: str,
    wait_attempts: int,
    wait_interval: float,
    author: str | None = None,
    executor: str | None = None,
    packet_data: dict[str, Any] | None = None,
) -> tuple[bool, str | None]:
    if not isinstance(pr, int) or pr <= 0:
        return False, "invalid_pr_number"
    if not isinstance(head, str) or not HEX40_RE.match(head):
        return False, "invalid_head_sha"
    if not isinstance(review_comment, str) or not review_comment.strip():
        return False, "invalid_review_comment"
    if wait_attempts < 1 or wait_attempts > MAX_WAIT_ATTEMPTS:
        return False, "invalid_wait_attempts"
    if wait_interval < 0.0 or wait_interval > MAX_WAIT_INTERVAL:
        return False, "invalid_wait_interval"

    pkt_req = packet_data
    pkt_res = packet_data
    if isinstance(packet_data, dict) and "payload" in packet_data:
        payload = packet_data.get("payload") or {}
        pkt_req = payload.get("request") or {}
        pkt_res = payload.get("response") or pkt_req
    elif isinstance(packet_data, dict) and "request" in packet_data:
        pkt_req = packet_data.get("request") or {}
        pkt_res = packet_data.get("response") or pkt_req

    eff_author = (author or "").strip()
    eff_executor = (executor or "").strip()
    pkt_author = ""
    pkt_reviewer = ""
    if isinstance(pkt_req, dict):
        pkt_author = str(pkt_req.get("author") or "").strip()
        pkt_reviewer = str(pkt_req.get("reviewer") or "").strip()
        if not eff_author and pkt_author:
            eff_author = pkt_author
        if "pr" in pkt_req and int(pkt_req["pr"]) != pr:
            return False, "packet_pr_mismatch"
        if "content_sha" in pkt_req and str(pkt_req["content_sha"]) != head:
            return False, "packet_head_mismatch"

    if isinstance(pkt_res, dict) and pkt_res:
        res_reviewer = str(pkt_res.get("reviewer") or "").strip()
        if res_reviewer:
            pkt_reviewer = res_reviewer
        if "content_sha" in pkt_res and str(pkt_res["content_sha"]) != head:
            return False, "packet_head_mismatch"
        if "result" in pkt_res and pkt_res.get("result") != "no_findings":
            return False, "review_not_no_findings"
        findings = pkt_res.get("findings")
        if isinstance(findings, list) and len(findings) > 0:
            return False, "unresolved_findings"

    if pkt_author and pkt_reviewer and pkt_author == pkt_reviewer:
        return False, "self_merge_forbidden"
    if eff_author and eff_executor and eff_author == eff_executor:
        return False, "self_merge_forbidden"
    if eff_executor and pkt_reviewer and eff_executor != pkt_reviewer:
        return False, "executor_not_reviewer"

    return True, None


def check_pr_admissible(pr_info: dict[str, Any], expected_head: str) -> str | None:
    state = pr_info.get("state", "OPEN")
    is_draft = pr_info.get("isDraft")
    head_oid = pr_info.get("headRefOid")
    auto_merge = pr_info.get("autoMergeRequest")
    merge_state = pr_info.get("mergeStateStatus")

    if state != "OPEN":
        return "pr_not_open"
    if is_draft is not False:
        return "pr_is_draft"
    if head_oid != expected_head:
        return "head_mismatch"
    if auto_merge is not None:
        return "auto_merge_enabled"
    if merge_state != "CLEAN":
        return "merge_state_not_clean"
    return None


def render_completion_comment(
    *,
    pr: int,
    head: str,
    review_comment: str,
    base_main_sha: str,
    stale_line: str,
    trial_tree: str,
    merge_commit: str,
    parents: list[str],
    tree_matched: bool,
    is_ancestor: bool,
    work_label: str = "",
    reviewer_label: str = "",
) -> str:
    tm_ja = "一致" if tree_matched else "不一致"
    anc_ja = "ok" if is_ancestor else "NG"
    parents_str = " ".join(parents)
    wl = work_label.strip() or f"PR #{pr}（HEAD `{head[:8]}`）の統合を完了した"
    lines = ["## merge admission・明示merge・read-after 完了", ""]
    if reviewer_label.strip():
        lines.extend([f"review {reviewer_label.strip()}", ""])
    lines.extend(
        [
            "**merge 前の照合**",
            f"- Ready、exact HEAD `{head}`、CLEAN、autoMergeRequest null。",
            f"- review の no_findings は {review_comment.strip()}。",
            "",
            "**試験 merge**",
            f"- main `{base_main_sha}` に `--no-ff` で merge した。",
            f"- {stale_line}、trial tree は `{trial_tree}`。",
            "",
            "**明示 merge**",
            f"- `gh pr {GH_SUBCMD} {pr} --merge --match-head-commit {head[:8]}…`",
            "",
            "**read-after**",
            f"- merge commit は `{merge_commit}`（parents: {parents_str}）。",
            f"- `{merge_commit}^{{tree}}` と trial tree は{tm_ja}した。",
            f"- HEAD は main の ancestor か：{anc_ja}。",
            "",
            "**作業結果**",
            f"- {wl}。",
            f"- 後続の作業 base は、merge 後の `{merge_commit[:8]}` とする。",
            "",
        ]
    )
    return "\n".join(lines)


def run_merge_admission(
    *,
    pr: int,
    head: str,
    review_comment: str,
    repo_root: Path = DEFAULT_REPO_ROOT,
    work_label: str = "",
    reviewer_label: str = "",
    author: str | None = None,
    executor: str | None = None,
    packet_data: dict[str, Any] | None = None,
    wait_attempts: int = MAX_WAIT_ATTEMPTS,
    wait_interval: float = 30.0,
    post_comment: bool = False,
    comment_out: Path | None = None,
    worktree_parent: Path | None = None,
    runner: RunnerType = default_runner,
    sleep_fn: Callable[[float], None] = time.sleep,
) -> dict[str, Any]:
    ok, reason = validate_inputs(
        pr=pr,
        head=head,
        review_comment=review_comment,
        wait_attempts=wait_attempts,
        wait_interval=wait_interval,
        author=author,
        executor=executor,
        packet_data=packet_data,
    )
    if not ok:
        return {
            "schema": "scaffold-merge-admission-result.v1",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "ok": False,
            "status": "rejected",
            "reason": reason,
            "pr": pr,
            "head": head,
        }

    pr_info: dict[str, Any] = {}
    for attempt in range(1, wait_attempts + 1):
        view_proc = runner(
            ["gh", "pr", "view", str(pr), "--json", PR_VIEW_FIELDS],
            repo_root,
        )
        if view_proc.returncode != 0:
            return {
                "schema": "scaffold-merge-admission-result.v1",
                "evidence_kind": "scaffold",
                "authority_effect": "none",
                "ok": False,
                "status": "rejected",
                "reason": "gh_pr_view_failed",
                "pr": pr,
                "head": head,
                "stderr": view_proc.stderr.strip(),
            }
        try:
            pr_info = json.loads(view_proc.stdout)
        except json.JSONDecodeError:
            return {
                "schema": "scaffold-merge-admission-result.v1",
                "evidence_kind": "scaffold",
                "authority_effect": "none",
                "ok": False,
                "status": "rejected",
                "reason": "gh_pr_view_invalid_json",
                "pr": pr,
                "head": head,
            }

        chk_reason = check_pr_admissible(pr_info, head)
        if chk_reason is None:
            break
        if chk_reason != "merge_state_not_clean":
            break
        if attempt < wait_attempts and wait_interval > 0:
            sleep_fn(wait_interval)

    chk_reason = check_pr_admissible(pr_info, head)
    if chk_reason is not None:
        out_err: dict[str, Any] = {
            "schema": "scaffold-merge-admission-result.v1",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "ok": False,
            "status": "rejected",
            "reason": chk_reason,
            "pr": pr,
            "head": head,
            "observed_pr": pr_info,
        }
        if chk_reason == "head_mismatch":
            out_err["observed_head"] = pr_info.get("headRefOid")
        return out_err

    fetch_pre = runner(["git", "fetch", "-q", "origin"], repo_root)
    if fetch_pre.returncode != 0:
        return {
            "schema": "scaffold-merge-admission-result.v1",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "ok": False,
            "status": "rejected",
            "reason": "git_fetch_failed",
            "pr": pr,
            "head": head,
        }
    rev_main = runner(["git", "rev-parse", "origin/main"], repo_root)
    if rev_main.returncode != 0:
        return {
            "schema": "scaffold-merge-admission-result.v1",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "ok": False,
            "status": "rejected",
            "reason": "origin_main_resolve_failed",
            "pr": pr,
            "head": head,
        }
    base_main_sha = rev_main.stdout.strip()

    wt_base = str(worktree_parent) if worktree_parent is not None else None
    wt_dir = Path(tempfile.mkdtemp(prefix=f"helix-admit-{pr}-", dir=wt_base))
    worktree_removed = False
    stale_line = ""
    trial_tree = ""
    try:
        wt_add = runner(
            ["git", "worktree", "add", "-q", "--detach", str(wt_dir), base_main_sha],
            repo_root,
        )
        if wt_add.returncode != 0:
            return {
                "schema": "scaffold-merge-admission-result.v1",
                "evidence_kind": "scaffold",
                "authority_effect": "none",
                "ok": False,
                "status": "rejected",
                "reason": "worktree_add_failed",
                "pr": pr,
                "head": head,
                "base_main_sha": base_main_sha,
            }

        trial_merge = runner(
            ["git", "-C", str(wt_dir), "merge", "-q", "--no-ff", "--no-edit", head],
            repo_root,
        )
        if trial_merge.returncode != 0:
            return {
                "schema": "scaffold-merge-admission-result.v1",
                "evidence_kind": "scaffold",
                "authority_effect": "none",
                "ok": False,
                "status": "rejected",
                "reason": "trial_merge_conflict",
                "pr": pr,
                "head": head,
                "base_main_sha": base_main_sha,
            }

        scf_proc = runner(
            [sys.executable, "-B", "scaffold/tools/scfctl.py", "stale"],
            wt_dir,
        )
        out_lines = [ln.strip() for ln in scf_proc.stdout.splitlines() if ln.strip()]
        stale_line = out_lines[-1] if out_lines else ""
        if scf_proc.returncode != 0 or stale_line != "stale=0":
            return {
                "schema": "scaffold-merge-admission-result.v1",
                "evidence_kind": "scaffold",
                "authority_effect": "none",
                "ok": False,
                "status": "rejected",
                "reason": "scaffold_stale",
                "pr": pr,
                "head": head,
                "base_main_sha": base_main_sha,
                "stale_output": stale_line,
            }

        tree_proc = runner(
            ["git", "-C", str(wt_dir), "rev-parse", "HEAD^{tree}"],
            repo_root,
        )
        if tree_proc.returncode != 0:
            return {
                "schema": "scaffold-merge-admission-result.v1",
                "evidence_kind": "scaffold",
                "authority_effect": "none",
                "ok": False,
                "status": "rejected",
                "reason": "trial_tree_resolve_failed",
                "pr": pr,
                "head": head,
                "base_main_sha": base_main_sha,
            }
        trial_tree = tree_proc.stdout.strip()
    finally:
        rm_proc = runner(
            ["git", "worktree", "remove", "--force", str(wt_dir)],
            repo_root,
        )
        shutil.rmtree(wt_dir, ignore_errors=True)
        worktree_removed = (rm_proc.returncode == 0) and (not wt_dir.exists())

    # Step (c-pre): merge直前の再取得（operating-model 274行・294行）
    fetch_before_merge = runner(["git", "fetch", "-q", "origin"], repo_root)
    if fetch_before_merge.returncode != 0:
        return {
            "schema": "scaffold-merge-admission-result.v1",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "ok": False,
            "status": "rejected",
            "reason": "git_fetch_failed",
            "pr": pr,
            "head": head,
            "worktree_removed": worktree_removed,
        }
    rev_main_before_merge = runner(["git", "rev-parse", "origin/main"], repo_root)
    observed_main_before_merge = rev_main_before_merge.stdout.strip()
    if (
        rev_main_before_merge.returncode != 0
        or observed_main_before_merge != base_main_sha
    ):
        return {
            "schema": "scaffold-merge-admission-result.v1",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "ok": False,
            "status": "rejected",
            "reason": "main_head_moved_before_merge",
            "pr": pr,
            "head": head,
            "base_main_sha": base_main_sha,
            "observed_main_sha": observed_main_before_merge,
            "trial_tree": trial_tree,
            "worktree_removed": worktree_removed,
        }

    recheck_view = runner(
        ["gh", "pr", "view", str(pr), "--json", PR_VIEW_FIELDS],
        repo_root,
    )
    if recheck_view.returncode != 0:
        return {
            "schema": "scaffold-merge-admission-result.v1",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "ok": False,
            "status": "rejected",
            "reason": "gh_pr_view_failed",
            "pr": pr,
            "head": head,
            "worktree_removed": worktree_removed,
        }
    try:
        recheck_pr_info = json.loads(recheck_view.stdout)
    except json.JSONDecodeError:
        return {
            "schema": "scaffold-merge-admission-result.v1",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "ok": False,
            "status": "rejected",
            "reason": "gh_pr_view_invalid_json",
            "pr": pr,
            "head": head,
            "worktree_removed": worktree_removed,
        }
    recheck_reason = check_pr_admissible(recheck_pr_info, head)
    if recheck_reason is not None:
        return {
            "schema": "scaffold-merge-admission-result.v1",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "ok": False,
            "status": "rejected",
            "reason": "pre_merge_pr_state_drifted",
            "drift_reason": recheck_reason,
            "pr": pr,
            "head": head,
            "base_main_sha": base_main_sha,
            "observed_pr": recheck_pr_info,
            "worktree_removed": worktree_removed,
        }

    # Step (c): 明示merge
    merge_proc = runner(
        [
            "gh",
            "pr",
            GH_SUBCMD,
            str(pr),
            "--merge",
            "--match-head-commit",
            head,
        ],
        repo_root,
    )
    if merge_proc.returncode != 0:
        return {
            "schema": "scaffold-merge-admission-result.v1",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "ok": False,
            "status": "failed",
            "reason": "merge_command_failed",
            "pr": pr,
            "head": head,
            "base_main_sha": base_main_sha,
            "trial_tree": trial_tree,
            "worktree_removed": worktree_removed,
            "stderr": merge_proc.stderr.strip(),
        }

    # Step (d): post-merge read-after（gh pr view --json state,mergeCommit でmerge commitを特定）
    runner(["git", "fetch", "-q", "origin"], repo_root)
    merge_commit = ""
    for mc_attempt in range(1, READ_AFTER_WAIT_ATTEMPTS + 1):
        mc_view = runner(
            ["gh", "pr", "view", str(pr), "--json", "state,mergeCommit"],
            repo_root,
        )
        if mc_view.returncode == 0:
            try:
                mc_info = json.loads(mc_view.stdout)
                mc_state = str(mc_info.get("state") or "").strip()
                mc_obj = mc_info.get("mergeCommit") or {}
                if mc_state == "MERGED" and isinstance(mc_obj, dict):
                    oid = str(mc_obj.get("oid") or "").strip()
                    if HEX40_RE.match(oid):
                        merge_commit = oid
                        break
            except json.JSONDecodeError:
                merge_commit = ""
        if mc_attempt < READ_AFTER_WAIT_ATTEMPTS and READ_AFTER_WAIT_INTERVAL > 0:
            sleep_fn(READ_AFTER_WAIT_INTERVAL)
            runner(["git", "fetch", "-q", "origin"], repo_root)

    if not HEX40_RE.match(merge_commit):
        return {
            "schema": "scaffold-merge-admission-result.v1",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "ok": False,
            "status": "read_after_failed",
            "reason": "read_after_merge_commit_missing",
            "pr": pr,
            "head": head,
            "base_main_sha": base_main_sha,
            "trial_tree": trial_tree,
            "worktree_removed": worktree_removed,
        }

    mt_proc = runner(
        ["git", "rev-parse", f"{merge_commit}^{{tree}}"],
        repo_root,
    )
    merge_tree = mt_proc.stdout.strip()
    par_proc = runner(
        ["git", "log", "-1", "--format=%P", merge_commit],
        repo_root,
    )
    parents = par_proc.stdout.strip().split()
    anc_head_proc = runner(
        ["git", "merge-base", "--is-ancestor", head, "origin/main"],
        repo_root,
    )
    anc_mc_proc = runner(
        ["git", "merge-base", "--is-ancestor", merge_commit, "origin/main"],
        repo_root,
    )
    is_ancestor = anc_head_proc.returncode == 0 and anc_mc_proc.returncode == 0
    tree_matched = (mt_proc.returncode == 0) and (merge_tree == trial_tree)
    parents_valid = (
        len(parents) == 2 and parents[0] == base_main_sha and parents[1] == head
    )

    comment_md = render_completion_comment(
        pr=pr,
        head=head,
        review_comment=review_comment,
        base_main_sha=base_main_sha,
        stale_line=stale_line,
        trial_tree=trial_tree,
        merge_commit=merge_commit,
        parents=parents,
        tree_matched=tree_matched,
        is_ancestor=is_ancestor,
        work_label=work_label,
        reviewer_label=reviewer_label,
    )
    if comment_out is not None:
        comment_out.write_text(comment_md, encoding="utf-8")

    if not parents_valid or not is_ancestor:
        return {
            "schema": "scaffold-merge-admission-result.v1",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "ok": False,
            "status": "read_after_failed",
            "reason": "read_after_head_or_parent_mismatch",
            "pr": pr,
            "head": head,
            "base_main_sha": base_main_sha,
            "merge_commit": merge_commit,
            "parents": parents,
            "is_ancestor": is_ancestor,
            "trial_tree": trial_tree,
            "main_tree": merge_tree,
            "tree_matched": tree_matched,
            "worktree_removed": worktree_removed,
            "comment_markdown": comment_md,
        }

    if not tree_matched:
        return {
            "schema": "scaffold-merge-admission-result.v1",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "ok": False,
            "status": "read_after_failed",
            "reason": "read_after_tree_mismatch",
            "pr": pr,
            "head": head,
            "base_main_sha": base_main_sha,
            "merge_commit": merge_commit,
            "parents": parents,
            "is_ancestor": is_ancestor,
            "trial_tree": trial_tree,
            "main_tree": merge_tree,
            "tree_matched": tree_matched,
            "worktree_removed": worktree_removed,
            "comment_markdown": comment_md,
        }

    comment_url: str | None = None
    if post_comment:
        fd, tmp_md = tempfile.mkstemp(prefix=f"helix-admit-c{pr}-", suffix=".md")
        os.close(fd)
        tmp_path = Path(tmp_md)
        try:
            tmp_path.write_text(comment_md, encoding="utf-8")
            c_proc = runner(
                ["gh", "pr", "comment", str(pr), "--body-file", str(tmp_path)],
                repo_root,
            )
            if c_proc.returncode != 0:
                return {
                    "schema": "scaffold-merge-admission-result.v1",
                    "evidence_kind": "scaffold",
                    "authority_effect": "none",
                    "ok": False,
                    "status": "comment_failed",
                    "reason": "gh_pr_comment_failed",
                    "pr": pr,
                    "head": head,
                    "merge_commit": merge_commit,
                    "comment_markdown": comment_md,
                }
            c_lines = [ln.strip() for ln in c_proc.stdout.splitlines() if ln.strip()]
            comment_url = c_lines[-1] if c_lines else ""
        finally:
            tmp_path.unlink(missing_ok=True)

    return {
        "schema": "scaffold-merge-admission-result.v1",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "ok": True,
        "status": "merged",
        "reason": None,
        "pr": pr,
        "head": head,
        "review_comment": review_comment,
        "base_main_sha": base_main_sha,
        "stale": stale_line,
        "trial_tree": trial_tree,
        "merge_commit": merge_commit,
        "parents": parents,
        "main_tree": merge_tree,
        "is_ancestor": is_ancestor,
        "tree_matched": tree_matched,
        "worktree_removed": worktree_removed,
        "comment_posted": post_comment,
        "comment_url": comment_url,
        "comment_markdown": comment_md,
    }


def build_arg_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="統制レーン merge admission・試験merge・明示merge・read-after 仮設ツール"
    )
    p.add_argument("--pr", type=int, required=True, help="対象PR番号")
    p.add_argument(
        "--head", required=True, help="review済みexact content HEAD (40-hex)"
    )
    p.add_argument(
        "--review-comment",
        required=True,
        help="no_findings を記録した review comment のIDまたはURL",
    )
    p.add_argument("--work-label", default="", help="完了commentの作業結果ラベル")
    p.add_argument("--reviewer-label", default="", help="完了commentのreviewer表記")
    p.add_argument("--author", default=None, help="PR作成側runtime/識別子")
    p.add_argument("--executor", default=None, help="merge実行側runtime/識別子")
    p.add_argument(
        "--packet",
        default=None,
        help="照合用 review_request / review_response JSON ファイルpath",
    )
    p.add_argument(
        "--wait-attempts",
        type=int,
        default=MAX_WAIT_ATTEMPTS,
        help=f"CLEAN待機の最大試行回数 (1..{MAX_WAIT_ATTEMPTS})",
    )
    p.add_argument(
        "--wait-interval",
        type=float,
        default=30.0,
        help="CLEAN待機の間隔秒数",
    )
    p.add_argument(
        "--post-comment",
        action="store_true",
        help="完了commentを gh pr comment で投稿する",
    )
    p.add_argument(
        "--comment-out",
        default=None,
        help="生成した完了comment本文を書き出すpath",
    )
    p.add_argument(
        "--repo-root",
        default=None,
        help="対象repository root path（省略時は本ファイルから解決）",
    )
    return p


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)
    packet_data: dict[str, Any] | None = None
    if args.packet:
        try:
            packet_data = json.loads(Path(args.packet).read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            out = {
                "schema": "scaffold-merge-admission-result.v1",
                "evidence_kind": "scaffold",
                "authority_effect": "none",
                "ok": False,
                "status": "rejected",
                "reason": "invalid_packet_file",
                "error": str(exc),
            }
            print(json.dumps(out, ensure_ascii=False))
            return 2

    repo_root = Path(args.repo_root).resolve() if args.repo_root else DEFAULT_REPO_ROOT
    comment_out = Path(args.comment_out) if args.comment_out else None

    res = run_merge_admission(
        pr=args.pr,
        head=args.head,
        review_comment=args.review_comment,
        repo_root=repo_root,
        work_label=args.work_label,
        reviewer_label=args.reviewer_label,
        author=args.author,
        executor=args.executor,
        packet_data=packet_data,
        wait_attempts=args.wait_attempts,
        wait_interval=args.wait_interval,
        post_comment=args.post_comment,
        comment_out=comment_out,
    )
    print(json.dumps(res, ensure_ascii=False))
    return 0 if res.get("ok") else 1


if __name__ == "__main__":
    sys.exit(main())
