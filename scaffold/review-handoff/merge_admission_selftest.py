#!/usr/bin/env python3
"""merge_admission_selftest.py — merge_admission.py の単体検証。

gh / git / scfctl 呼出しをモックrunnerで差し替え、実PRや外部GitHubへ一切作用させずに
次の全分岐を検証する:
1. Ready + CLEAN + trial merge OK + stale=0 + 明示merge + read-after一致 (正常系・待機後CLEAN含む)
2. Draft PR 拒否 (pr_is_draft)
3. HEAD 不一致 拒否 (head_mismatch)
4. autoMergeRequest 有り 拒否 (auto_merge_enabled)
5. mergeStateStatus != CLEAN 拒否 (merge_state_not_clean)
6. 試験 merge 衝突 拒否 + worktree 確実削除 (trial_merge_conflict)
7. scfctl stale >= 1 拒否 + worktree 確実削除 (scaffold_stale)
8. merge 後 read-after HEAD/parent/ancestor 不一致 検出 (read_after_head_or_parent_mismatch)
9. merge 後 read-after tree 不一致 検出 (read_after_tree_mismatch)
10. 権限境界: 自己PR merge 拒否 (self_merge_forbidden) / packet 照合拒否
"""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

import merge_admission  # noqa: E402

SAMPLE_HEAD = "a" * 40
SAMPLE_BASE = "b" * 40
SAMPLE_MERGE = "c" * 40
SAMPLE_TREE = "d" * 40
GH_SUBCMD = "merge"


class FakeScenarioRunner:
    def __init__(
        self,
        *,
        pr_views: list[dict[str, object]] | None = None,
        base_main_sha: str = SAMPLE_BASE,
        trial_merge_rc: int = 0,
        stale_rc: int = 0,
        stale_stdout: str = "checked=165\nstale=0\n",
        trial_tree: str = SAMPLE_TREE,
        merge_rc: int = 0,
        merge_commit: str = SAMPLE_MERGE,
        main_tree: str = SAMPLE_TREE,
        parents: str | None = None,
        is_ancestor_rc: int = 0,
        comment_url: str = "https://github.com/RetryYN/HELIX-HARNESS/pull/3999#issuecomment-1",
    ) -> None:
        self.pr_views = list(
            pr_views
            or [
                {
                    "state": "OPEN",
                    "isDraft": False,
                    "headRefOid": SAMPLE_HEAD,
                    "autoMergeRequest": None,
                    "mergeStateStatus": "CLEAN",
                }
            ]
        )
        self.base_main_sha = base_main_sha
        self.trial_merge_rc = trial_merge_rc
        self.stale_rc = stale_rc
        self.stale_stdout = stale_stdout
        self.trial_tree = trial_tree
        self.merge_rc = merge_rc
        self.merge_commit = merge_commit
        self.main_tree = main_tree
        self.parents = (
            parents if parents is not None else f"{base_main_sha} {SAMPLE_HEAD}"
        )
        self.is_ancestor_rc = is_ancestor_rc
        self.comment_url = comment_url
        self.calls: list[list[str]] = []
        self._fetch_count = 0
        self._view_idx = 0

    def __call__(
        self, argv: list[str], cwd: Path | None = None
    ) -> subprocess.CompletedProcess[str]:
        self.calls.append(list(argv))
        if argv[:3] == ["gh", "pr", "view"]:
            idx = min(self._view_idx, len(self.pr_views) - 1)
            self._view_idx += 1
            return subprocess.CompletedProcess(
                argv, 0, json.dumps(self.pr_views[idx]), ""
            )
        if argv[:3] == ["git", "fetch", "-q"]:
            self._fetch_count += 1
            return subprocess.CompletedProcess(argv, 0, "", "")
        if argv == ["git", "rev-parse", "origin/main"]:
            sha = self.base_main_sha if self._fetch_count <= 1 else self.merge_commit
            return subprocess.CompletedProcess(argv, 0, sha + "\n", "")
        if argv[:3] == ["git", "worktree", "add"]:
            return subprocess.CompletedProcess(argv, 0, "", "")
        if len(argv) >= 4 and argv[:2] == ["git", "-C"] and argv[3] == "merge":
            return subprocess.CompletedProcess(
                argv, self.trial_merge_rc, "", "conflict" if self.trial_merge_rc else ""
            )
        if len(argv) >= 3 and argv[-2:] == ["scaffold/tools/scfctl.py", "stale"]:
            return subprocess.CompletedProcess(
                argv, self.stale_rc, self.stale_stdout, ""
            )
        if (
            len(argv) >= 5
            and argv[:2] == ["git", "-C"]
            and argv[3:] == ["rev-parse", "HEAD^{tree}"]
        ):
            return subprocess.CompletedProcess(argv, 0, self.trial_tree + "\n", "")
        if argv[:3] == ["git", "worktree", "remove"]:
            wt_path = Path(argv[-1])
            if wt_path.exists():
                for child in wt_path.iterdir():
                    if child.is_file():
                        child.unlink()
                wt_path.rmdir()
            return subprocess.CompletedProcess(argv, 0, "", "")
        if argv[:3] == ["gh", "pr", GH_SUBCMD]:
            return subprocess.CompletedProcess(
                argv, self.merge_rc, "", "merge failed" if self.merge_rc else ""
            )
        if argv == ["git", "rev-parse", "origin/main^{tree}"]:
            return subprocess.CompletedProcess(argv, 0, self.main_tree + "\n", "")
        if argv[:4] == ["git", "log", "-1", "--format=%P"]:
            return subprocess.CompletedProcess(argv, 0, self.parents + "\n", "")
        if argv[:3] == ["git", "merge-base", "--is-ancestor"]:
            return subprocess.CompletedProcess(argv, self.is_ancestor_rc, "", "")
        if argv[:3] == ["gh", "pr", "comment"]:
            return subprocess.CompletedProcess(argv, 0, self.comment_url + "\n", "")
        raise AssertionError(f"Unexpected command: {argv}")


class MergeAdmissionTest(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp_dir = Path(tempfile.mkdtemp(prefix="helix-admit-test-"))

    def tearDown(self) -> None:
        for p in sorted(self.tmp_dir.rglob("*"), reverse=True):
            if p.is_file():
                p.unlink()
            elif p.is_dir():
                p.rmdir()
        if self.tmp_dir.exists():
            self.tmp_dir.rmdir()

    def test_happy_path_after_polling_and_comment(self) -> None:
        runner = FakeScenarioRunner(
            pr_views=[
                {
                    "state": "OPEN",
                    "isDraft": False,
                    "headRefOid": SAMPLE_HEAD,
                    "autoMergeRequest": None,
                    "mergeStateStatus": "BLOCKED",
                },
                {
                    "state": "OPEN",
                    "isDraft": False,
                    "headRefOid": SAMPLE_HEAD,
                    "autoMergeRequest": None,
                    "mergeStateStatus": "CLEAN",
                },
            ]
        )
        slept: list[float] = []
        comment_file = self.tmp_dir / "comment.md"
        res = merge_admission.run_merge_admission(
            pr=3999,
            head=SAMPLE_HEAD,
            review_comment="https://github.com/RetryYN/HELIX-HARNESS/pull/3999#issuecomment-99",
            repo_root=self.tmp_dir,
            work_label="WR99（テスト作業）を完了した",
            reviewer_label="Claude Code (VS Code)",
            author="antigravity",
            executor="claude",
            wait_attempts=3,
            wait_interval=0.5,
            post_comment=True,
            comment_out=comment_file,
            worktree_parent=self.tmp_dir,
            runner=runner,
            sleep_fn=slept.append,
        )
        self.assertTrue(res["ok"])
        self.assertEqual(res["status"], "merged")
        self.assertIsNone(res["reason"])
        self.assertEqual(res["stale"], "stale=0")
        self.assertEqual(res["trial_tree"], SAMPLE_TREE)
        self.assertEqual(res["main_tree"], SAMPLE_TREE)
        self.assertTrue(res["tree_matched"])
        self.assertTrue(res["is_ancestor"])
        self.assertTrue(res["worktree_removed"])
        self.assertTrue(res["comment_posted"])
        self.assertEqual(len(slept), 1)
        self.assertTrue(comment_file.exists())
        self.assertIn(
            "merge admission・明示merge・read-after 完了", res["comment_markdown"]
        )
        self.assertIn("--merge --match-head-commit", res["comment_markdown"])

    def test_reject_draft_pr(self) -> None:
        runner = FakeScenarioRunner(
            pr_views=[
                {
                    "state": "OPEN",
                    "isDraft": True,
                    "headRefOid": SAMPLE_HEAD,
                    "autoMergeRequest": None,
                    "mergeStateStatus": "CLEAN",
                }
            ]
        )
        res = merge_admission.run_merge_admission(
            pr=3999,
            head=SAMPLE_HEAD,
            review_comment="IC_1",
            repo_root=self.tmp_dir,
            worktree_parent=self.tmp_dir,
            runner=runner,
            sleep_fn=lambda _: None,
        )
        self.assertFalse(res["ok"])
        self.assertEqual(res["reason"], "pr_is_draft")
        self.assertEqual(len(runner.calls), 1)

    def test_reject_head_mismatch(self) -> None:
        runner = FakeScenarioRunner(
            pr_views=[
                {
                    "state": "OPEN",
                    "isDraft": False,
                    "headRefOid": "e" * 40,
                    "autoMergeRequest": None,
                    "mergeStateStatus": "CLEAN",
                }
            ]
        )
        res = merge_admission.run_merge_admission(
            pr=3999,
            head=SAMPLE_HEAD,
            review_comment="IC_1",
            repo_root=self.tmp_dir,
            worktree_parent=self.tmp_dir,
            runner=runner,
            sleep_fn=lambda _: None,
        )
        self.assertFalse(res["ok"])
        self.assertEqual(res["reason"], "head_mismatch")
        self.assertEqual(len(runner.calls), 1)

    def test_reject_auto_merge_enabled(self) -> None:
        runner = FakeScenarioRunner(
            pr_views=[
                {
                    "state": "OPEN",
                    "isDraft": False,
                    "headRefOid": SAMPLE_HEAD,
                    "autoMergeRequest": {"enabledAt": "2026-10-28T00:00:00Z"},
                    "mergeStateStatus": "CLEAN",
                }
            ]
        )
        res = merge_admission.run_merge_admission(
            pr=3999,
            head=SAMPLE_HEAD,
            review_comment="IC_1",
            repo_root=self.tmp_dir,
            worktree_parent=self.tmp_dir,
            runner=runner,
            sleep_fn=lambda _: None,
        )
        self.assertFalse(res["ok"])
        self.assertEqual(res["reason"], "auto_merge_enabled")
        self.assertEqual(len(runner.calls), 1)

    def test_reject_trial_merge_conflict_and_cleanup_worktree(self) -> None:
        runner = FakeScenarioRunner(trial_merge_rc=1)
        res = merge_admission.run_merge_admission(
            pr=3999,
            head=SAMPLE_HEAD,
            review_comment="IC_1",
            repo_root=self.tmp_dir,
            worktree_parent=self.tmp_dir,
            runner=runner,
            sleep_fn=lambda _: None,
        )
        self.assertFalse(res["ok"])
        self.assertEqual(res["reason"], "trial_merge_conflict")
        self.assertTrue(
            any(c[:3] == ["git", "worktree", "remove"] for c in runner.calls)
        )
        self.assertFalse(any(c[:3] == ["gh", "pr", GH_SUBCMD] for c in runner.calls))
        leftover = list(self.tmp_dir.glob("helix-admit-*"))
        self.assertEqual(leftover, [])

    def test_reject_scaffold_stale_and_cleanup_worktree(self) -> None:
        runner = FakeScenarioRunner(
            stale_rc=1,
            stale_stdout="SCF-B-0003: STALE\nstale=1\n",
        )
        res = merge_admission.run_merge_admission(
            pr=3999,
            head=SAMPLE_HEAD,
            review_comment="IC_1",
            repo_root=self.tmp_dir,
            worktree_parent=self.tmp_dir,
            runner=runner,
            sleep_fn=lambda _: None,
        )
        self.assertFalse(res["ok"])
        self.assertEqual(res["reason"], "scaffold_stale")
        self.assertEqual(res["stale_output"], "stale=1")
        self.assertTrue(
            any(c[:3] == ["git", "worktree", "remove"] for c in runner.calls)
        )
        self.assertFalse(any(c[:3] == ["gh", "pr", GH_SUBCMD] for c in runner.calls))
        leftover = list(self.tmp_dir.glob("helix-admit-*"))
        self.assertEqual(leftover, [])

    def test_read_after_head_or_parent_mismatch(self) -> None:
        runner = FakeScenarioRunner(
            parents=f"{SAMPLE_BASE} {'f' * 40}",
            is_ancestor_rc=1,
        )
        res = merge_admission.run_merge_admission(
            pr=3999,
            head=SAMPLE_HEAD,
            review_comment="IC_1",
            repo_root=self.tmp_dir,
            post_comment=True,
            worktree_parent=self.tmp_dir,
            runner=runner,
            sleep_fn=lambda _: None,
        )
        self.assertFalse(res["ok"])
        self.assertEqual(res["status"], "read_after_failed")
        self.assertEqual(res["reason"], "read_after_head_or_parent_mismatch")
        self.assertFalse(any(c[:3] == ["gh", "pr", "comment"] for c in runner.calls))

    def test_read_after_tree_mismatch(self) -> None:
        runner = FakeScenarioRunner(
            trial_tree=SAMPLE_TREE,
            main_tree="9" * 40,
        )
        res = merge_admission.run_merge_admission(
            pr=3999,
            head=SAMPLE_HEAD,
            review_comment="IC_1",
            repo_root=self.tmp_dir,
            post_comment=True,
            worktree_parent=self.tmp_dir,
            runner=runner,
            sleep_fn=lambda _: None,
        )
        self.assertFalse(res["ok"])
        self.assertEqual(res["status"], "read_after_failed")
        self.assertEqual(res["reason"], "read_after_tree_mismatch")
        self.assertFalse(res["tree_matched"])
        self.assertFalse(any(c[:3] == ["gh", "pr", "comment"] for c in runner.calls))

    def test_authority_boundary_self_merge_and_packet_validation(self) -> None:
        runner = FakeScenarioRunner()
        res_self = merge_admission.run_merge_admission(
            pr=3999,
            head=SAMPLE_HEAD,
            review_comment="IC_1",
            author="claude",
            executor="claude",
            repo_root=self.tmp_dir,
            runner=runner,
        )
        self.assertFalse(res_self["ok"])
        self.assertEqual(res_self["reason"], "self_merge_forbidden")
        self.assertEqual(len(runner.calls), 0)

        res_pkt_self = merge_admission.run_merge_admission(
            pr=3999,
            head=SAMPLE_HEAD,
            review_comment="IC_1",
            executor="antigravity",
            packet_data={
                "request": {
                    "pr": 3999,
                    "content_sha": SAMPLE_HEAD,
                    "author": "antigravity",
                    "reviewer": "claude",
                },
                "response": {
                    "content_sha": SAMPLE_HEAD,
                    "reviewer": "claude",
                    "result": "no_findings",
                    "findings": [],
                },
            },
            repo_root=self.tmp_dir,
            runner=runner,
        )
        self.assertFalse(res_pkt_self["ok"])
        self.assertEqual(res_pkt_self["reason"], "self_merge_forbidden")

        res_pkt_findings = merge_admission.run_merge_admission(
            pr=3999,
            head=SAMPLE_HEAD,
            review_comment="IC_1",
            executor="claude",
            packet_data={
                "request": {
                    "pr": 3999,
                    "content_sha": SAMPLE_HEAD,
                    "author": "antigravity",
                    "reviewer": "claude",
                },
                "response": {
                    "content_sha": SAMPLE_HEAD,
                    "reviewer": "claude",
                    "result": "changes_requested",
                    "findings": [{"id": "F1"}],
                },
            },
            repo_root=self.tmp_dir,
            runner=runner,
        )
        self.assertFalse(res_pkt_findings["ok"])
        self.assertEqual(res_pkt_findings["reason"], "review_not_no_findings")


if __name__ == "__main__":
    unittest.main(verbosity=2)
