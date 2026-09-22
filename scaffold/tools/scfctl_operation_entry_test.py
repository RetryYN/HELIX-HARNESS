#!/usr/bin/env python3
"""Direct command-entry regression tests for scfctl's write guards."""
import contextlib
import importlib.util
import io
import json
import tempfile
import unittest
from pathlib import Path


TOOL_PATH = Path(__file__).with_name("scfctl.py")
SPEC = importlib.util.spec_from_file_location("scfctl_operation_entry_test_scfctl", TOOL_PATH)
SCFCTL = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(SCFCTL)


class OperationEntryTests(unittest.TestCase):
    def isolated_layout(self):
        temporary = tempfile.TemporaryDirectory(prefix="scfctl-operation-entry-")
        root = Path(temporary.name)
        scaffold = root / "scaffold"
        bindings = scaffold / "bindings"
        evidence = scaffold / "evidence"
        bindings.mkdir(parents=True)
        evidence.mkdir(parents=True)
        previous = (SCFCTL.ROOT, SCFCTL.SCF, SCFCTL.BINDINGS, SCFCTL.EVIDENCE,
                    SCFCTL.CASES, SCFCTL.SCHEMA)
        SCFCTL.ROOT = str(root)
        SCFCTL.SCF = str(scaffold)
        SCFCTL.BINDINGS = str(bindings)
        SCFCTL.EVIDENCE = str(evidence)
        SCFCTL.CASES = str(scaffold / "checks" / "cases")
        SCFCTL.SCHEMA = str(scaffold / "schema" / "binding.schema.json")
        return temporary, root, previous

    @contextlib.contextmanager
    def layout(self):
        temporary, root, previous = self.isolated_layout()
        try:
            yield root
        finally:
            (SCFCTL.ROOT, SCFCTL.SCF, SCFCTL.BINDINGS, SCFCTL.EVIDENCE,
             SCFCTL.CASES, SCFCTL.SCHEMA) = previous
            temporary.cleanup()

    def binding(self, root, issue, state="active", replacement_status="pending",
                binding_id="SCF-B-0900", role="direct command test role"):
        upstream = root / "source" / "upstream.md"
        artifact = root / "scaffold" / "artifact.txt"
        formal = root / "formal" / "target.txt"
        upstream.parent.mkdir(parents=True, exist_ok=True)
        artifact.parent.mkdir(parents=True, exist_ok=True)
        formal.parent.mkdir(parents=True, exist_ok=True)
        upstream.write_bytes(b"upstream\n")
        artifact.write_bytes(b"scaffold artifact\n")
        formal.write_bytes(b"formal artifact\n")
        upstream_rel = "source/upstream.md"
        artifact_rel = "scaffold/artifact.txt"
        formal_rel = "formal/target.txt"
        binding = {
            "schema_revision": 1,
            "id": binding_id,
            "kind": "scaffold",
            "title": "direct command test",
            "product": "HELIX-OS",
            "owner_candidate": "HELIX-OS test",
            "state": state,
            "reason": "formal artifact lifecycle entry test",
            "upstream": [{"path": upstream_rel, "sha256": SCFCTL.sha256_file(upstream_rel)}],
            "role": role,
            "obligations": ["obligation"],
            "connections": {"consumers": ["consumer"], "dependencies": [], "boundary": "scaffold/"},
            "operations": {"allowed": [], "forbidden": ["outside scaffold write"]},
            "artifacts": [artifact_rel],
            "verification": {
                "evidence_kind": "scaffold",
                "scope": ["negative_case"],
                "oracles": ["oracle"],
                "negative_cases": ["negative"],
            },
            "replacement": {
                "role_target": "formal role",
                "formal_artifacts": [formal_rel],
                "issue": issue,
                "status": replacement_status,
                "transfer": {
                    "role": "formal role",
                    "obligations": {"obligation": "formal obligation"},
                    "consumers": {"consumer": "formal consumer"},
                    "oracles": {"oracle": "formal oracle"},
                    "negative_cases": {"negative": "formal negative"},
                },
                "target_revisions": {formal_rel: SCFCTL.sha256_file(formal_rel)},
                "confirmation_ref": None,
                "confirmation_digest": None,
            },
            "created": "2026-09-22",
            "updated": "2026-09-22",
        }
        if state == "replacing" and replacement_status == "confirmed":
            receipt_rel = "scaffold/evidence/replacement-%s.json" % binding["id"]
            receipt_path = root / receipt_rel
            receipt = {
                "binding": binding["id"],
                "result": "pass",
                "binding_core_digest": SCFCTL.binding_core_digest(binding),
                "target_revisions": dict(binding["replacement"]["target_revisions"]),
            }
            receipt_path.write_text(json.dumps(receipt, ensure_ascii=False, sort_keys=True) + "\n", encoding="utf-8")
            binding["replacement"]["confirmation_ref"] = receipt_rel
            binding["replacement"]["confirmation_digest"] = SCFCTL.sha256_file(receipt_rel)
        return binding

    def write_binding(self, binding):
        path = Path(SCFCTL.BINDINGS) / (binding["id"] + ".json")
        path.write_text(json.dumps(binding, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        return path

    def invoke(self, *argv):
        stdout = io.StringIO()
        with contextlib.redirect_stdout(stdout):
            code = SCFCTL.main(list(argv))
        return code, stdout.getvalue()

    def test_retire_rejects_invalid_issue_without_mutating_binding(self):
        for issue in (0, -1, True):
            with self.subTest(issue=issue), self.layout() as root:
                binding = self.binding(root, issue, state="replacing", replacement_status="confirmed")
                path = self.write_binding(binding)
                before = path.read_bytes()
                code, output = self.invoke("retire", binding["id"])
                self.assertNotEqual(code, 0)
                self.assertIn("E_ISSUE", output)
                self.assertEqual(path.read_bytes(), before)
                self.assertEqual(json.loads(path.read_bytes())["state"], "replacing")

    def test_check_replacement_rejects_invalid_issue_without_receipt(self):
        for issue in (0, -1, True):
            with self.subTest(issue=issue), self.layout() as root:
                binding = self.binding(root, issue)
                path = self.write_binding(binding)
                before = path.read_bytes()
                code, output = self.invoke("check-replacement", binding["id"], "--record")
                self.assertNotEqual(code, 0)
                self.assertIn("E_ISSUE", output)
                self.assertEqual(path.read_bytes(), before)
                self.assertEqual(list(Path(SCFCTL.EVIDENCE).glob("*")), [])

    def test_check_replacement_normal_issue_records_receipt(self):
        with self.layout() as root:
            binding = self.binding(root, 1)
            self.write_binding(binding)
            code, output = self.invoke("check-replacement", binding["id"], "--record")
            self.assertEqual(code, 0, output)
            receipt = Path(SCFCTL.EVIDENCE) / "replacement-SCF-B-0900.json"
            self.assertTrue(receipt.is_file())
            self.assertIn("check-replacement SCF-B-0900: pass", output)

    def test_check_replacement_rejects_unsafe_state_without_receipt(self):
        with self.layout() as root:
            binding = self.binding(root, 1, state="retired")
            path = self.write_binding(binding)
            before = path.read_bytes()
            code, output = self.invoke("check-replacement", binding["id"], "--record")
            self.assertNotEqual(code, 0)
            self.assertIn("E_STATE", output)
            self.assertEqual(path.read_bytes(), before)
            self.assertEqual(list(Path(SCFCTL.EVIDENCE).glob("*")), [])

    def test_check_replacement_keeps_duplicate_role_rule_at_entry(self):
        with self.layout() as root:
            binding = self.binding(root, 1, binding_id="SCF-B-0900")
            sibling = self.binding(root, 1, binding_id="SCF-B-0901", role=binding["role"])
            target_path = self.write_binding(binding)
            self.write_binding(sibling)
            before = target_path.read_bytes()
            code, output = self.invoke("check-replacement", binding["id"], "--record")
            self.assertNotEqual(code, 0)
            self.assertIn("E_DOUBLE", output)
            self.assertEqual(target_path.read_bytes(), before)
            self.assertEqual(list(Path(SCFCTL.EVIDENCE).glob("*")), [])

    def test_malformed_binding_is_rejected_before_evidence_write(self):
        with self.layout() as root:
            binding = self.binding(root, 1)
            binding.pop("replacement")
            path = self.write_binding(binding)
            before = path.read_bytes()
            code, output = self.invoke("check-replacement", binding["id"], "--record")
            self.assertNotEqual(code, 0)
            self.assertIn("E_SHAPE: 必須key欠落 replacement", output)
            self.assertEqual(path.read_bytes(), before)
            self.assertEqual(list(Path(SCFCTL.EVIDENCE).glob("*")), [])

    def test_retire_normal_workflow_still_mutates_only_after_preflight(self):
        with self.layout() as root:
            binding = self.binding(root, 1, state="replacing", replacement_status="confirmed")
            path = self.write_binding(binding)
            code, output = self.invoke("retire", binding["id"])
            self.assertEqual(code, 0, output)
            self.assertEqual(json.loads(path.read_bytes())["state"], "retired")


if __name__ == "__main__":
    unittest.main()
