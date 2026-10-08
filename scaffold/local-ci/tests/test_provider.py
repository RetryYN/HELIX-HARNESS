"""Provider boundary tests; all source data and execution outcomes are synthetic."""
from pathlib import Path
import io
import json
import sys
import unittest
from types import SimpleNamespace
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import provider
import target as target_module
import design_check
from common import CHECK_IDS, Diagnostic, canonical_bytes
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
    manifest_data = MANIFEST
    portable = None

    def __init__(self, repo, executable, identity):
        self.identity = identity
        self.calls = []
        self.blob_calls = []
        self.sources = {path: ("synthetic:" + path).encode() for path in CHECKER_PATHS}
        self.sources["scaffold/local-ci/config.json"] = canonical_bytes(type(self).portable)
        self.sources[MANIFEST_PATH] = type(self).manifest_data
        self.sources[LEDGER_PATH] = b"synthetic ledger\n"
        self.sources[CONTRACT_PATH] = b"synthetic contract\n"
        self.instances.append(self)

    def entries(self, tree):
        return {"synthetic": "tree"}

    def blob(self, entries, path):
        self.blob_calls.append(path)
        return self.sources[path]

    def invoke(self, *argv):
        self.calls.append(argv)
        return SimpleNamespace(returncode=0)


class ProviderTests(unittest.TestCase):
    def setUp(self):
        FakeReader.instances.clear()
        FakeReader.manifest_data = MANIFEST
        self.portable = json.loads(Path(provider.__file__).with_name("config.json").read_bytes())
        self.portable["executables"]["provider_git"] = {
            "name": "git", "version": "2.55.0", "sha256": "f" * 64}
        FakeReader.portable = self.portable
        self.config_patch = patch.object(provider, "_load_portable_config", return_value=self.portable)
        self.config_patch.start()
        self.addCleanup(self.config_patch.stop)
        self.reader_patch = patch("provider.GitReader", FakeReader)
        self.resolve_patch = patch("provider.resolve_target", return_value=TARGET)
        self.manifest_patch = patch("provider.verify_design_manifest",
                                    return_value={"structure_complete": True})
        self.manifest_mock = self.manifest_patch.start()
        self.addCleanup(self.manifest_patch.stop)
        self.receipt_patch = patch("provider.verify_receipt",
                                   return_value={"receipt_digest": "e" * 64,
                                                 "aggregate_state": "success"})
        self.receipt_mock = self.receipt_patch.start()
        self.addCleanup(self.receipt_patch.stop)
        for active in (self.reader_patch, self.resolve_patch):
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

    def test_dispatch_character_limit_is_unobserved_only_above_65535(self):
        raw = self.receipt_bytes()
        at_limit = raw + b" " * (65_535 - len(raw))
        self.assertEqual(len(at_limit), 65_535)
        result = provider.run_merge_unit_verifier("unused", BASE, HEAD, at_limit)
        self.assertTrue(result["positive"])
        self.assertEqual(len(FakeReader.instances), 1)

        FakeReader.instances.clear()
        over_limit = at_limit + b" "
        with self.assertRaises(Diagnostic) as raised:
            provider.run_merge_unit_verifier("unused", BASE, HEAD, over_limit)
        self.assertEqual((raised.exception.classification, raised.exception.reason),
                         ("Unobserved", "not_run"))
        self.assertEqual(FakeReader.instances, [])

    def test_malformed_json_and_invalid_utf8_are_unreadable_before_git_reader(self):
        for data in (b'{"executions":[', b"\xff"):
            with self.subTest(data=data):
                with self.assertRaises(Diagnostic) as raised:
                    provider.run_merge_unit_verifier("unused", BASE, HEAD, data)
                self.assertEqual((raised.exception.classification, raised.exception.reason),
                                 ("Unknown", "unreadable"))
                self.assertEqual(FakeReader.instances, [])

    def test_duplicate_envelope_key_remains_rejected_before_git_reader(self):
        with self.assertRaises(Diagnostic) as raised:
            provider.run_merge_unit_verifier("unused", BASE, HEAD, b'{"x":1,"x":2}')
        self.assertEqual((raised.exception.classification, raised.exception.reason),
                         ("Rejected", "invalid_input"))
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

    def test_malformed_manifest_rows_are_rejected_before_source_collection_or_diff(self):
        for manifest in (
            b'{"files":[1],"legacy_pins":[]}',
            b'{"files":[],"legacy_pins":[{}]}',
        ):
            with self.subTest(manifest=manifest):
                FakeReader.instances.clear()
                FakeReader.manifest_data = manifest
                self.manifest_mock.reset_mock()
                with self.assertRaises(Diagnostic) as raised:
                    provider.run_merge_unit_verifier("unused", BASE, HEAD, self.receipt_bytes())
                self.assertEqual((raised.exception.classification, raised.exception.reason),
                                 ("Rejected", "invalid_input"))
                self.assertFalse(self.manifest_mock.called)
                reader = FakeReader.instances[-1]
                self.assertEqual(reader.calls, [])
                self.assertEqual(reader.blob_calls, ["scaffold/local-ci/config.json", MANIFEST_PATH])

    def test_design_check_malformed_manifest_returns_diagnostic_without_git_process(self):
        malformed = b'{"files":[1],"legacy_pins":[]}'
        readers = []

        class DesignReader:
            def __init__(self, *args):
                self.blob_calls = []
                readers.append(self)

            def commit(self, _ref):
                return HEAD

            def tree(self, _commit):
                return "tree"

            def entries(self, _tree):
                return {"synthetic": "tree"}

            def blob(self, _entries, path):
                self.blob_calls.append(path)
                if path == MANIFEST_PATH:
                    return malformed
                raise AssertionError("source collection must stop at malformed manifest")

        output = io.BytesIO()
        with patch.object(design_check, "GitReader", DesignReader), \
                patch.object(design_check, "verify_design_manifest") as verify, \
                patch.object(design_check.sys, "stdout", SimpleNamespace(buffer=output)):
            status = design_check.main()
        self.assertEqual(status, 1)
        self.assertEqual(json.loads(output.getvalue()), {
            "classification": "Rejected", "reason": "invalid_input",
            "detail": "manifest DesignFile path is malformed",
        })
        self.assertEqual(readers[0].blob_calls, [MANIFEST_PATH])
        verify.assert_not_called()

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
        self.assertEqual(reader.identity, self.portable["executables"]["provider_git"])
        self.assertNotEqual(reader.identity, self.portable["executables"]["git"])
        self.assertEqual(result["provider_git_identity"], reader.identity)

    def test_ut_lci_77_unpinned_provider_observes_identity_only(self):
        self.portable["executables"]["provider_git"] = None
        identity = {"name": "git", "version": "2.55.0", "sha256": "f" * 64}
        with patch.object(provider, "observe_git_identity", return_value=identity) as observe:
            with self.assertRaises(Diagnostic) as raised:
                provider.run_merge_unit_verifier("unused", BASE, HEAD, self.receipt_bytes())
        self.assertEqual((raised.exception.classification, raised.exception.reason), ("Unobserved", "not_run"))
        self.assertEqual(raised.exception.provider_git_identity, identity)
        observe.assert_called_once_with(provider._PROVIDER_GIT_PATH)
        self.assertEqual(FakeReader.instances, [])
        self.receipt_mock.assert_not_called()

    def test_ut_lci_78_79_provider_pin_mismatch_stops_before_repository_probe(self):
        actual = dict(self.portable["executables"]["git"])
        for field, value in (("sha256", "0" * 64), ("version", "9.99.0")):
            with self.subTest(field=field):
                self.portable["executables"]["provider_git"] = {**actual, field: value}
                probe = SimpleNamespace(returncode=0, stdout=("git version " + actual["version"] + "\n").encode())
                with patch.object(provider, "GitReader", target_module.GitReader), \
                        patch.object(target_module.subprocess, "run", return_value=probe) as spawn:
                    with self.assertRaises(Diagnostic) as raised:
                        provider.run_merge_unit_verifier("unused", BASE, HEAD, self.receipt_bytes())
                self.assertEqual((raised.exception.classification, raised.exception.reason), ("Unknown", "unsupported"))
                spawn.assert_called_once()
                self.assertEqual(spawn.call_args.args[0], [provider._PROVIDER_GIT_PATH, "--version"])
                self.assertEqual(FakeReader.instances, [])
                self.receipt_mock.assert_not_called()

    def test_ut_lci_81_provider_diff_state_divergence_remains_nonpositive(self):
        with patch.object(FakeReader, "invoke", return_value=SimpleNamespace(returncode=2)):
            result = provider.run_merge_unit_verifier("unused", BASE, HEAD, self.receipt_bytes())
        self.assertEqual((result["local_state"], result["provider_state"]), ("success", "fail"))
        self.assertFalse(result["selected_check_parity"])
        self.assertFalse(result["positive"])


if __name__ == "__main__":
    unittest.main()
