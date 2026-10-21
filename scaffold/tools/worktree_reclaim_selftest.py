#!/usr/bin/env python3
"""Isolated tests for worktree_reclaim.py; never applies to this checkout."""
import contextlib, datetime as dt, importlib.util, io, json, os, subprocess, sys, tarfile, tempfile, time, unittest
from pathlib import Path

P = Path(__file__).with_name("worktree_reclaim.py")
S = importlib.util.spec_from_file_location("wr_selftest_tool", P)
WR = importlib.util.module_from_spec(S); assert S.loader; S.loader.exec_module(WR)

def run(c, cwd=None, env=None):
    p = subprocess.run([str(x) for x in c], cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    assert p.returncode == 0, (c, p.stdout.decode(), p.stderr.decode())
    return p

def git(repo, *a, env=None): return run(["git", "-C", repo, *a], env=env)

class Cases(unittest.TestCase):
    def setUp(self):
        self.t = tempfile.TemporaryDirectory(prefix="wr-reclaim-test-"); self.root = Path(self.t.name)
        self.repo = self.root / "main"; self.repo.mkdir()
        self.now = time.time(); self.old = self.now - 9 * WR.DAY
        old = dt.datetime.fromtimestamp(self.old, dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        self.env = dict(os.environ, GIT_AUTHOR_DATE=old, GIT_COMMITTER_DATE=old)
        git(self.root, "init", "-b", "main", self.repo); git(self.repo, "config", "user.name", "T"); git(self.repo, "config", "user.email", "t@x")
        (self.repo / ".gitignore").write_text("ignored.log\n"); (self.repo / "tracked.txt").write_text("base\n")
        git(self.repo, "add", ".gitignore", "tracked.txt"); git(self.repo, "commit", "-m", "base", env=self.env)
        self.prs = self.root / "prs.json"; self.prs.write_text("[]")

    def tearDown(self): self.t.cleanup()

    def old_wt(self, name, branch, dirty=False, ignored=False, link=False):
        wt = self.root / name; git(self.repo, "worktree", "add", str(wt), "-b", branch, env=self.env)
        if dirty: (wt / "tracked.txt").write_text("base\ndirty\n"); (wt / "untracked.txt").write_text("keep\n")
        if ignored: (wt / "ignored.log").write_text("ignored\n")
        if link:
            outside = self.root / "outside"; outside.mkdir(); (outside / "sentinel").write_text("keep\n")
            (wt / "linked-dir").symlink_to(outside, target_is_directory=True)
        for p in [wt, *wt.rglob("*")]: os.utime(p, (self.old, self.old), follow_symlinks=False)
        return wt

    def invoke(self, *args, prs=None):
        out = io.StringIO()
        argv = ["--repo", str(self.repo), "--backup-dir", str(self.root / "backup"), "--report", str(self.root / "report.json"),
                "--open-prs-file", str(prs or self.prs), "--now", str(self.now), *args]
        with contextlib.redirect_stdout(out): code = WR.main(argv)
        return code, json.loads(out.getvalue())

    def got(self, report, wt): return next(x for x in report["worktrees"] if x["worktree"] == str(wt))

    def test_dry_run_and_apply_backup_remove(self):
        dry_wt = self.old_wt("dry", "dry-branch", dirty=True)
        code, rep = self.invoke()
        self.assertEqual((code, self.got(rep, dry_wt)["reason"]), (0, "eligible")); self.assertTrue(dry_wt.exists())
        wt = self.old_wt("old", "old-branch", dirty=True, ignored=True)
        code, rep = self.invoke("--apply"); self.assertEqual(code, 0); r = self.got(rep, wt)
        self.assertEqual(r["reason"], "removed"); self.assertFalse(wt.exists()); self.assertIn("old-branch", git(self.repo, "branch").stdout.decode())
        self.assertIn("dry-branch", git(self.repo, "branch").stdout.decode())
        self.assertIn("dirty", Path(r["backup"]["patch"]).read_text())
        with tarfile.open(r["backup"]["untracked_tar"], "r:gz") as tar: self.assertIn("ignored.log", set(tar.getnames()))

    def test_fresh_open_pr_and_process_skip(self):
        fresh = self.root / "fresh"; git(self.repo, "worktree", "add", str(fresh), "-b", "fresh-branch")
        openwt = self.old_wt("open", "open-branch")
        prs = self.root / "prs-open.json"; prs.write_text('["open-branch"]')
        procwt = self.old_wt("busy", "busy-branch")
        proc = subprocess.Popen([sys.executable, "-c", "import time;time.sleep(30)"], cwd=procwt)
        try: code, rep = self.invoke("--apply", prs=prs)
        finally: proc.terminate(); proc.wait()
        self.assertEqual((code, self.got(rep, fresh)["reason"], self.got(rep, openwt)["reason"], self.got(rep, procwt)["reason"]),
                         (0, "fresh", "open_pr_branch", "process_in_use"))

    def test_directory_link_is_fail_closed(self):
        wt = self.old_wt("linked", "linked-branch", link=True)
        code, rep = self.invoke("--apply")
        self.assertEqual((code, self.got(rep, wt)["reason"]), (0, "junction_or_directory_link"))
        self.assertTrue((self.root / "outside" / "sentinel").exists()); self.assertTrue(wt.exists())

if __name__ == "__main__": unittest.main()
