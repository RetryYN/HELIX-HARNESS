"""Synthetic Git fixtures for UT-LCI-01..06,24..26,50..52,59..62."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import Diagnostic, sha256
import target as target_module
from target import GIT_ENV, GitReader, check_clean_checkout, resolve_target


class TargetTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.git = "/usr/bin/git"
        self.identity = {"name": "git", "version": subprocess.check_output(
            [self.git, "--version"], env=GIT_ENV).decode().strip().removeprefix("git version "),
            "sha256": sha256(Path(self.git).read_bytes())}
        self.call("init", "-q")
        self.call("config", "user.name", "Synthetic fixture")
        self.call("config", "user.email", "fixture@example.invalid")
        (self.root / "source.md").write_text("synthetic bytes\n")
        self.call("add", "source.md")
        self.call("commit", "-qm", "fixture baseline")
        self.head = self.call("rev-parse", "HEAD").decode().strip()
        self.reader = GitReader(self.root, self.git, self.identity)

    def call(self, *args):
        return subprocess.check_output([self.git, "-c", "core.hooksPath=/dev/null", *args],
                                       cwd=self.root, env=GIT_ENV, stderr=subprocess.DEVNULL)

    def diagnostic(self, classification, reason, fn, *args):
        with self.assertRaises(Diagnostic) as raised:
            fn(*args)
        self.assertEqual((raised.exception.classification, raised.exception.reason),
                         (classification, reason))

    def test_missing_fsmonitor_policy_is_rejected_before_git_probe(self):
        policy = list(target_module.GIT_POLICY)
        index = policy.index("core.fsmonitor=false")
        del policy[index-1:index+1]
        with patch.object(target_module, "GIT_POLICY", tuple(policy)), patch("target.subprocess.run") as spawn:
            self.diagnostic("Rejected", "invalid_input", GitReader, self.root, self.git, self.identity)
            spawn.assert_not_called()

    def test_unreadable_resolved_blob_is_unknown_unreadable(self):
        entries = self.reader.entries(self.reader.tree(self.head))
        with patch("target.subprocess.run", return_value=type("Failure", (), {"returncode": 1})()):
            self.diagnostic("Unknown", "unreadable", self.reader.blob, entries, "source.md")

    def test_UT_LCI_24_26_clean_baseline(self):
        target = resolve_target(self.reader, self.head, self.head, "synthetic")
        self.assertEqual(target["head_commit"], self.head)
        self.assertTrue(target["worktree_clean"])
        self.assertEqual(check_clean_checkout(self.reader, target), target)

    def test_UT_LCI_01_missing_base(self):
        self.diagnostic("Rejected", "missing_key", resolve_target,
                        self.reader, "", self.head, "synthetic")

    def test_supplied_malformed_ref_is_invalid_input(self):
        for ref in ("\x00", 7):
            with self.subTest(ref=ref):
                self.diagnostic("Rejected", "invalid_input", self.reader.commit, ref)

    def test_absent_ref_is_missing_key(self):
        self.diagnostic("Rejected", "missing_key", self.reader.commit, None)

    def test_UT_LCI_59_unresolved_oid(self):
        self.diagnostic("Rejected", "invalid_input", resolve_target,
                        self.reader, "0" * 40, self.head, "synthetic")

    def test_ambiguous_branch_and_tag_ref_is_unknown_ambiguous(self):
        (self.root / "source.md").write_text("second commit\n")
        self.call("add", "source.md")
        self.call("commit", "-qm", "second fixture commit")
        tagged_commit = self.call("rev-parse", "HEAD").decode().strip()
        self.call("branch", "candidate", self.head)
        self.call("tag", "candidate", tagged_commit)
        self.diagnostic("Unknown", "ambiguous", self.reader.commit, "candidate")

    def test_UT_LCI_02_requested_head_mismatch(self):
        (self.root / "source.md").write_text("another commit\n")
        self.call("commit", "-qam", "fixture changed")
        self.diagnostic("Stale", "target_changed", resolve_target,
                        self.reader, self.head, self.head, "synthetic")

    def test_UT_LCI_05_staged_change(self):
        target = resolve_target(self.reader, self.head, self.head, "synthetic")
        (self.root / "source.md").write_text("staged\n")
        self.call("add", "source.md")
        self.diagnostic("Stale", "target_changed", check_clean_checkout, self.reader, target)

    def test_UT_LCI_06_untracked_change(self):
        target = resolve_target(self.reader, self.head, self.head, "synthetic")
        (self.root / "untracked").write_text("fixture\n")
        self.diagnostic("Stale", "target_changed", check_clean_checkout, self.reader, target)

    def test_UT_LCI_25_read_blob(self):
        entries = self.reader.entries(self.reader.tree(self.head))
        data = self.reader.blob(entries, "source.md")
        self.assertEqual(data, b"synthetic bytes\n")

    def test_UT_LCI_03_digest_mismatch(self):
        entries = self.reader.entries(self.reader.tree(self.head))
        self.diagnostic("Unknown", "conflict", self.reader.blob, entries, "source.md", "0" * 64)

    def test_UT_LCI_04_symlink_rejected(self):
        os.symlink("source.md", self.root / "link.md")
        self.call("add", "link.md")
        self.call("commit", "-qm", "fixture symlink")
        entries = self.reader.entries(self.reader.tree(self.reader.commit("HEAD")))
        self.diagnostic("Unknown", "conflict", self.reader.blob, entries, "link.md")

    def test_UT_LCI_52_declared_path_missing(self):
        entries = self.reader.entries(self.reader.tree(self.head))
        self.diagnostic("Unknown", "missing_input", self.reader.blob, entries, "missing.md")

    def test_UT_LCI_50_version_floor_before_other_probe(self):
        result = subprocess.CompletedProcess([], 0, b"git version 2.35.1\n", b"")
        with patch("target.subprocess.run", return_value=result) as run:
            self.diagnostic("Unknown", "unsupported", GitReader, self.root, self.git, self.identity)
        self.assertEqual(run.call_count, 1)
        self.assertEqual(run.call_args.args[0], [self.git, "--version"])

    def test_local_filter_config_is_rejected_without_running_helper(self):
        (self.root / ".gitattributes").write_text("source.md filter=probe\n")
        self.call("add", ".gitattributes")
        self.call("commit", "-qm", "synthetic filter attribute")
        marker = self.root / "filter-was-run"
        helper = self.root / "synthetic-filter.py"
        helper.write_text(
            "import pathlib, sys\n"
            f"pathlib.Path({str(marker)!r}).write_text('ran')\n"
            "sys.stdout.buffer.write(sys.stdin.buffer.read())\n"
        )
        self.call("config", "filter.probe.clean", f"{sys.executable} {helper}")

        with patch("target.subprocess.run", wraps=subprocess.run) as run:
            with self.assertRaises(Diagnostic) as raised:
                GitReader(self.root, self.git, self.identity)
        self.assertEqual((raised.exception.classification, raised.exception.reason),
                         ("Rejected", "invalid_input"))
        self.assertNotIn(str(helper), raised.exception.detail)
        self.assertFalse(marker.exists())
        invoked = [call.args[0] for call in run.call_args_list]
        self.assertEqual(invoked[0], [self.git, "--version"])
        self.assertTrue(any("config" in argv and "--no-includes" in argv for argv in invoked))
        self.assertFalse(any("status" in argv for argv in invoked))
        self.assertTrue(all("--no-pager" in argv for argv in invoked[1:]))

    def test_local_include_directive_is_rejected_without_printing_path(self):
        private_path = "/private/synthetic/include.conf"
        self.call("config", "include.path", private_path)
        with self.assertRaises(Diagnostic) as raised:
            GitReader(self.root, self.git, self.identity)
        self.assertEqual((raised.exception.classification, raised.exception.reason),
                         ("Rejected", "invalid_input"))
        self.assertNotIn(private_path, raised.exception.detail)


if __name__ == "__main__":
    unittest.main()
