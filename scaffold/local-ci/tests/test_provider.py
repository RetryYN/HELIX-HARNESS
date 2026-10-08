"""Provider boundary tests; all source data and execution outcomes are synthetic."""
from pathlib import Path
import json
import sys
import unittest
from types import SimpleNamespace
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import provider
from common import CHECK_IDS, Diagnostic
from snapshot import CHECKER_PATHS, LEDGER_PATH, MANIFEST_PATH


BASE = "a" * 40
HEAD = "b" * 40
TARGET = {"repository_id": "synthetic/repo", "base_commit": BASE,
          "merge_base": "c" * 40, "head_commit": HEAD,
          "head_tree": "d" * 40, "worktree_clean": True}
MANIFEST = json.dumps({"version": "1", "files": [], "legacy_pins": []}).encode()
CONTRACT_PATH = "docs/helix-os/L4-basic-design/local-ci.md"


class FakeReader:
    instances = []

    def __init__(self, repo, executable, identity):
        self.calls = []
        self.sources = {path: ("synthetic:" + path).encode() for path in CHECKER_PATHS}
        self.sources["scaffold/local-ci/config.json"] = Path(
            provider.__file__).with_name("config.json").read_bytes()
        self.sources[MANIFEST_PATH] = MANIFEST
        self.sources[LEDGER_PATH] = b"synthetic ledger\n"
        self.sources[CONTRACT_PATH] = b"synthetic contract\n"
        self.instances.append(self)

    def entries(self, tree):
        return {"synthetic": "tree"}

    def blob(self, entries, path):
        return self.sources[path]

    def invoke(self, *argv):
        self.calls.append(argv)
        return SimpleNamespace(returncode=0)


class ProviderTests(unittest.TestCase):
    def setUp(self):
        FakeReader.instances.clear()
        self.reader_patch = patch("provider.GitReader", FakeReader)
        self.resolve_patch = patch("provider.resolve_target", return_value=TARGET)
        self.manifest_patch = patch("provider.verify_design_manifest",
                                    return_value={"structure_complete": True})
        self.receipt_patch = patch("provider.verify_receipt",
                                   return_value={"receipt_digest": "e" * 64,
                                                 "aggregate_state": "success"})
        self.receipt_mock = self.receipt_patch.start()
        self.addCleanup(self.receipt_patch.stop)
        for active in (self.reader_patch, self.resolve_patch, self.manifest_patch):
            active.start()
            self.addCleanup(active.stop)

    def receipt_bytes(self):
        return json.dumps({"executions": [
            {"check_id": check_id, "state": "success"} for check_id in CHECK_IDS
        ]}, separators=(",", ":")).encode()

    def test_missing_dispatch_or_receipt_is_unobserved_before_reader(self):
        for event, data in (("push", self.receipt_bytes()),
                            ("workflow_dispatch", b"")):
            with self.subTest(event=event, data=data):
                with self.assertRaises(Diagnostic) as raised:
                    provider.run_merge_unit_verifier("unused", BASE, HEAD, data,
                                                     event=event, permission="read")
                self.assertEqual((raised.exception.classification, raised.exception.reason),
                                 ("Unobserved", "not_run"))
                self.assertEqual(FakeReader.instances, [])

    def test_write_permission_is_rejected_before_reader(self):
        with self.assertRaises(Diagnostic) as raised:
            provider.run_merge_unit_verifier("unused", BASE, HEAD, self.receipt_bytes(),
                                             permission="write")
        self.assertEqual((raised.exception.classification, raised.exception.reason),
                         ("Rejected", "invalid_input"))
        self.assertEqual(FakeReader.instances, [])

    def test_target_mismatch_is_rejected_before_receipt_or_diff(self):
        self.resolve_patch.stop()
        self.resolve_patch = patch("provider.resolve_target",
                                   side_effect=Diagnostic("Stale", "target_changed"))
        self.resolve_patch.start()
        self.addCleanup(self.resolve_patch.stop)

        with self.assertRaises(Diagnostic) as raised:
            provider.run_merge_unit_verifier("unused", BASE, HEAD, self.receipt_bytes())
        self.assertEqual((raised.exception.classification, raised.exception.reason),
                         ("Stale", "target_changed"))
        self.receipt_mock.assert_not_called()
        self.assertEqual(FakeReader.instances[-1].calls, [])

    def test_invalid_receipt_is_rejected_before_diff(self):
        self.receipt_patch.stop()
        with self.assertRaises(Diagnostic) as raised:
            provider.run_merge_unit_verifier("unused", BASE, HEAD, b"{}")
        self.assertEqual((raised.exception.classification, raised.exception.reason),
                         ("Rejected", "invalid_input"))
        self.assertEqual(FakeReader.instances[-1].calls, [])

    def test_success_path_executes_only_the_selected_diff(self):
        result = provider.run_merge_unit_verifier("unused", BASE, HEAD, self.receipt_bytes())
        reader = FakeReader.instances[-1]
        self.assertEqual(reader.calls, [(
            "diff", "--check", "--no-ext-diff", "--no-textconv",
            TARGET["merge_base"], HEAD, "--")])
        self.assertEqual(result["check_id"], "LC-DIFF-001")
        self.assertEqual(result["provider_state"], "success")
        self.assertEqual(result["local_only_check_ids"], list(CHECK_IDS[:3]) + [CHECK_IDS[4]])
        self.assertTrue(result["positive"])


if __name__ == "__main__":
    unittest.main()
