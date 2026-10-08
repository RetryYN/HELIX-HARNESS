"""Private snapshot closure tests; all source/checker files are synthetic data."""
import json
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import Diagnostic, sha256
from snapshot import CHECKER_PATHS, GOV_INPUTS, LEDGER_PATH, MANIFEST_PATH, read_fixed_snapshot
from target import GitReader, resolve_target
from test_target import TargetTests


class SnapshotTests(TargetTests):
    # Reuse only fixture setup, not the inherited target test methods.
    def setUp(self):
        super().setUp()
        files = {p: b"synthetic input\n" for p in (*CHECKER_PATHS, *GOV_INPUTS, LEDGER_PATH)}
        files[MANIFEST_PATH] = json.dumps({"files": [{"path": "source.md"}], "legacy_pins": []}).encode()
        files["scaffold/bindings/SCF-B-0001.json"] = json.dumps({
            "state": "active", "upstream": [{"path": "source.md"}],
            "artifacts": ["artifact.dat", "directory"]}).encode()
        files["artifact.dat"] = b"artifact content is not a checker input"
        files["directory/leaf"] = b"exists"
        files["unrelated-private-file"] = b"do not expose"
        for path, data in files.items():
            destination = self.root / path
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(data)
        self.call("add", ".")
        self.call("commit", "-qm", "synthetic snapshot closure")
        self.head = self.call("rev-parse", "HEAD").decode().strip()
        self.target = resolve_target(self.reader, self.head, self.head, "synthetic")

    def test_snapshot_reads_fixed_blob_not_live_source(self):
        (self.root / "source.md").write_text("live change\n")
        snapshot = read_fixed_snapshot(self.reader, self.target)
        self.addCleanup(snapshot.close)
        self.assertEqual(snapshot.sources["source.md"], b"synthetic bytes\n")
        self.assertEqual((snapshot.root / "source.md").read_bytes(), b"synthetic bytes\n")

    def test_snapshot_omits_original_git_config_and_unrelated_files(self):
        self.call("config", "remote.fixture.url", "https://example.invalid/not-used")
        snapshot = read_fixed_snapshot(self.reader, self.target)
        self.addCleanup(snapshot.close)
        self.assertNotIn("example.invalid", (snapshot.root / ".git/config").read_text())
        self.assertFalse((snapshot.root / "unrelated-private-file").exists())
        self.assertFalse((snapshot.root / ".git/objects/info/alternates").exists())

    def test_artifact_only_paths_preserve_existence_type(self):
        snapshot = read_fixed_snapshot(self.reader, self.target)
        self.addCleanup(snapshot.close)
        self.assertTrue((snapshot.root / "artifact.dat").is_file())
        self.assertEqual((snapshot.root / "artifact.dat").read_bytes(), b"")
        self.assertTrue((snapshot.root / "directory").is_dir())
        self.assertNotIn("artifact.dat", snapshot.sources)

    def test_missing_target_artifact_is_not_fabricated(self):
        binding = self.root / "scaffold/bindings/SCF-B-0001.json"
        body = json.loads(binding.read_text())
        body["artifacts"].append("missing.dat")
        binding.write_text(json.dumps(body))
        self.call("commit", "-qam", "synthetic missing artifact")
        head = self.reader.commit("HEAD")
        target = resolve_target(self.reader, head, head, "synthetic")
        self.diagnostic("Unknown", "missing_input", read_fixed_snapshot, self.reader, target)

    def test_private_objects_can_read_declared_blob(self):
        snapshot = read_fixed_snapshot(self.reader, self.target)
        self.addCleanup(snapshot.close)
        private = GitReader(snapshot.root, self.git, self.identity)
        entries = private.entries(private.tree(self.head))
        self.assertEqual(private.blob(entries, "source.md"), b"synthetic bytes\n")
        self.assertEqual(private.read("diff", "--check", "--no-ext-diff", "--no-textconv", self.head, self.head, "--"), b"")

    def test_private_git_diff_check_matches_base_to_head_with_change_delete_rename_and_whitespace(self):
        (self.root / "delete-me.txt").write_bytes(b"deleted in head\n")
        (self.root / "rename-from.txt").write_bytes(b"unchanged rename payload\n")
        self.call("add", ".")
        self.call("commit", "-qm", "synthetic diff baseline")
        base = self.call("rev-parse", "HEAD").decode().strip()

        (self.root / "source.md").write_bytes(b"changed with trailing space \t\n")
        (self.root / "delete-me.txt").unlink()
        (self.root / "rename-from.txt").rename(self.root / "rename-to.txt")
        self.call("add", "-A")
        self.call("commit", "-qm", "synthetic changed head")
        head = self.call("rev-parse", "HEAD").decode().strip()
        target = resolve_target(self.reader, base, head, "synthetic")

        original_diff = self.reader.invoke(
            "diff", "--check", "--no-ext-diff", "--no-textconv", target["merge_base"], head, "--")
        snapshot = read_fixed_snapshot(self.reader, target)
        self.addCleanup(snapshot.close)
        private = GitReader(snapshot.root, self.git, self.identity)
        private_diff = private.invoke(
            "diff", "--check", "--no-ext-diff", "--no-textconv", target["merge_base"], head, "--")
        self.assertEqual((private_diff.returncode, private_diff.stdout),
                         (original_diff.returncode, original_diff.stdout))
        self.assertNotEqual(original_diff.returncode, 0)
        self.assertIn(b"trailing whitespace", original_diff.stdout)

        original_names = self.reader.invoke(
            "diff", "--name-status", "--no-ext-diff", "--no-textconv", target["merge_base"], head, "--")
        private_names = private.invoke(
            "diff", "--name-status", "--no-ext-diff", "--no-textconv", target["merge_base"], head, "--")
        self.assertEqual((private_names.returncode, private_names.stdout),
                         (original_names.returncode, original_names.stdout))
        self.assertIn(b"R100\trename-from.txt\trename-to.txt", original_names.stdout)
        self.assertIn(b"D\tdelete-me.txt", original_names.stdout)

    def test_malformed_manifest_and_binding_rows_are_rejected(self):
        cases = (
            (MANIFEST_PATH, {"files": [{"path": 7}], "legacy_pins": []}, "malformed files row"),
            (MANIFEST_PATH, {"files": [], "legacy_pins": [{"archive_path": "archive/file"}]},
             "malformed legacy pin row"),
            ("scaffold/bindings/SCF-B-0001.json", {
                "state": "active", "upstream": [{"digest": "sha256:" + "0" * 64}],
                "artifacts": ["artifact.dat", "directory"]}, "malformed Binding upstream row"),
        )
        for path, value, label in cases:
            with self.subTest(case=label):
                (self.root / path).write_text(json.dumps(value))
                self.call("add", path)
                self.call("commit", "-qm", label)
                head = self.call("rev-parse", "HEAD").decode().strip()
                target = resolve_target(self.reader, head, head, "synthetic")
                self.diagnostic("Rejected", "invalid_input", read_fixed_snapshot, self.reader, target)


# unittest inherits test methods, which would duplicate the target suite and use
# changed fixture assumptions. Keep this class limited to snapshot oracles.
for _name in tuple(name for name in dir(TargetTests) if name.startswith("test_")):
    setattr(SnapshotTests, _name, None)
del TargetTests

if __name__ == "__main__":
    unittest.main()
