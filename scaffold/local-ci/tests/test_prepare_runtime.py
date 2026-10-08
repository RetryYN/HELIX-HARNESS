"""Synthetic-only tests for external runtime preparation."""
import json
import os
from pathlib import Path
import stat
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import Diagnostic, canonical_bytes, sha256
from prepare_runtime import prepare_runtime


class PrepareRuntimeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.repo = self.root / "repo"
        self.repo.mkdir()
        (self.repo / "scaffold/local-ci").mkdir(parents=True)
        self.external = self.root / "external"
        self.external.mkdir()
        self.output = self.root / "output"
        self.output.mkdir()
        self.stdlib = self.external / "stdlib"
        self.stdlib.mkdir()
        (self.stdlib / "os.py").write_bytes(b"synthetic os\n")
        (self.stdlib / "test").mkdir()
        (self.stdlib / "test/test_os.py").write_bytes(b"excluded test\n")
        (self.stdlib / "__pycache__").mkdir()
        (self.stdlib / "__pycache__/ignored.pyc").write_bytes(b"excluded cache")
        self.external_file = self.external / "external-module.py"
        self.external_file.write_bytes(b"dereferenced target\n")
        (self.stdlib / "linked.py").symlink_to(self.external_file)

        self.host_paths = {}
        for name in ("python", "git", "bwrap"):
            path = self.external / name
            path.write_bytes((name + " executable fixture").encode())
            self.host_paths[name] = str(path)
        self.mounts = {}
        for index, key in enumerate(("python_bin", "git_bin", "loader") +
                                    tuple("lib_" + str(i) for i in range(19))):
            path = self.external / ("mount-" + str(index))
            path.write_bytes(("mount " + key).encode())
            self.mounts[key] = path
            self.host_paths.setdefault("mounts", {})[key] = str(path)
        self.host_paths["mounts"]["stdlib"] = str(self.stdlib)

        template = json.loads((Path(__file__).resolve().parents[1] / "config.json").read_text())
        for name in ("python", "git", "bwrap"):
            template["executables"][name]["sha256"] = sha256(Path(self.host_paths[name]).read_bytes())
        tree_files = {
            "os.py": b"synthetic os\n",
            "linked.py": b"dereferenced target\n",
        }
        template["sandbox"]["mounts"] = [
            {"host_key": "python_bin", "target": "/runtime/python", "sha256": sha256(self.mounts["python_bin"].read_bytes()), "kind": "file"},
            {"host_key": "stdlib", "target": "/runtime/stdlib", "sha256": sha256(canonical_bytes({name: sha256(data) for name, data in sorted(tree_files.items())})), "kind": "tree"},
            {"host_key": "git_bin", "target": "/runtime/git", "sha256": sha256(self.mounts["git_bin"].read_bytes()), "kind": "file"},
            {"host_key": "loader", "target": "/runtime/loader", "sha256": sha256(self.mounts["loader"].read_bytes()), "kind": "file"},
        ] + [
            {"host_key": key, "target": "/runtime/" + key, "sha256": sha256(path.read_bytes()), "kind": "file"}
            for key, path in sorted(self.mounts.items()) if key not in ("python_bin", "git_bin", "loader")
        ]
        profile = {key: value for key, value in template["sandbox"].items() if key != "profile_digest"}
        template["sandbox"]["profile_digest"] = sha256(canonical_bytes(profile))
        self.portable_path = self.repo / "scaffold/local-ci/config.json"
        self.portable_path.write_bytes(canonical_bytes(template) + b"\n")
        self.host_paths_file = self.external / "host-paths.json"
        self.host_paths_file.write_bytes(canonical_bytes(self.host_paths) + b"\n")
        self.bundle = self.output / "bundle"
        self.host_config = self.output / "host-config.json"

    def prepare(self, **overrides):
        values = {
            "repo_root": self.repo,
            "portable_config": self.portable_path,
            "host_paths_file": self.host_paths_file,
            "bundle_output": self.bundle,
            "host_config_output": self.host_config,
        }
        values.update(overrides)
        return prepare_runtime(**values)

    def test_pinned_synthetic_tree_is_bundled_with_file_symlink_dereferenced(self):
        result = self.prepare()
        self.assertEqual(result["bundle_file_count"], 2)
        self.assertEqual((self.bundle / "linked.py").read_bytes(), b"dereferenced target\n")
        self.assertFalse((self.bundle / "linked.py").is_symlink())
        self.assertFalse((self.bundle / "test").exists())
        self.assertFalse((self.bundle / "__pycache__").exists())
        generated = json.loads(self.host_config.read_text())
        self.assertEqual(generated["mounts"]["stdlib"], str(self.bundle))
        self.assertEqual(stat.S_IMODE(self.host_config.stat().st_mode), 0o600)

    def test_nonnull_provider_git_identity_is_validated_but_not_resolved(self):
        portable = json.loads(self.portable_path.read_text())
        portable["executables"]["provider_git"] = {
            "name": "git", "version": "2.43.0", "sha256": "a" * 64,
        }
        self.portable_path.write_bytes(canonical_bytes(portable) + b"\n")
        result = self.prepare()
        self.assertEqual(result["bundle_file_count"], 2)
        self.assertEqual(json.loads(self.host_config.read_text())["git"], self.host_paths["git"])

    def test_stdlib_file_symlink_cannot_read_repository_bytes(self):
        private_source = self.repo / "private-source.py"
        private_source.write_bytes(b"repository-only bytes\n")
        (self.stdlib / "inside-link.py").symlink_to(private_source)
        with self.assertRaises(Diagnostic) as raised:
            self.prepare()
        self.assertIn("repository", raised.exception.detail)
        self.assertFalse(self.bundle.exists())
        self.assertFalse(self.host_config.exists())

    def test_existing_output_is_never_overwritten(self):
        self.bundle.mkdir()
        marker = self.bundle / "keep"
        marker.write_text("existing")
        with self.assertRaises(Diagnostic):
            self.prepare()
        self.assertEqual(marker.read_text(), "existing")
        self.assertFalse(self.host_config.exists())

    def test_checkout_output_and_checkout_spelled_symlink_inputs_are_rejected(self):
        inside = self.repo / "inside"
        inside.mkdir()
        with self.assertRaises(Diagnostic):
            self.prepare(bundle_output=inside / "bundle")
        linked_host = self.repo / "host-link"
        linked_host.symlink_to(self.host_paths["python"])
        host_paths = dict(self.host_paths)
        host_paths["python"] = str(linked_host)
        self.host_paths_file.write_bytes(canonical_bytes(host_paths) + b"\n")
        with self.assertRaises(Diagnostic):
            self.prepare()
        self.assertFalse(self.bundle.exists())
        self.assertFalse(self.host_config.exists())

    def test_symlink_directory_and_special_file_fail_without_partial_outputs(self):
        (self.stdlib / "linked-dir").symlink_to(self.external, target_is_directory=True)
        with self.assertRaises(Diagnostic):
            self.prepare()
        self.assertFalse(self.bundle.exists())
        (self.stdlib / "linked-dir").unlink()
        fifo = self.stdlib / "named-pipe"
        os.mkfifo(fifo)
        with self.assertRaises(Diagnostic):
            self.prepare()
        self.assertFalse(self.bundle.exists())
        fifo.unlink()

    def test_pin_mismatch_cleans_any_partial_outputs(self):
        (self.stdlib / "os.py").write_bytes(b"changed bytes\n")
        with self.assertRaises(Diagnostic):
            self.prepare()
        self.assertFalse(self.bundle.exists())
        self.assertFalse(self.host_config.exists())

    def test_host_config_write_failure_removes_new_bundle_and_partial_config(self):
        with patch("prepare_runtime.os.fsync", side_effect=OSError("synthetic fsync failure")):
            with self.assertRaises(Diagnostic):
                self.prepare()
        self.assertFalse(self.bundle.exists())
        self.assertFalse(self.host_config.exists())


if __name__ == "__main__":
    unittest.main()
