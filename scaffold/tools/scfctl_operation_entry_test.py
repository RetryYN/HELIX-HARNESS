#!/usr/bin/env python3
"""Direct command-entry regression tests for scfctl's write guards."""

import contextlib
import importlib.util
import io
import json
import os
import signal
import tempfile
import unittest
from pathlib import Path


TOOL_PATH = Path(__file__).with_name("scfctl.py")
SPEC = importlib.util.spec_from_file_location(
    "scfctl_operation_entry_test_scfctl", TOOL_PATH
)
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
        previous = (
            SCFCTL.ROOT,
            SCFCTL.SCF,
            SCFCTL.BINDINGS,
            SCFCTL.EVIDENCE,
            SCFCTL.CASES,
            SCFCTL.SCHEMA,
        )
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
            (
                SCFCTL.ROOT,
                SCFCTL.SCF,
                SCFCTL.BINDINGS,
                SCFCTL.EVIDENCE,
                SCFCTL.CASES,
                SCFCTL.SCHEMA,
            ) = previous
            temporary.cleanup()

    def binding(
        self,
        root,
        issue,
        state="active",
        replacement_status="pending",
        binding_id="SCF-B-0900",
        role="direct command test role",
    ):
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
            "upstream": [
                {"path": upstream_rel, "sha256": SCFCTL.sha256_file(upstream_rel)}
            ],
            "role": role,
            "obligations": ["obligation"],
            "connections": {
                "consumers": ["consumer"],
                "dependencies": [],
                "boundary": "scaffold/",
            },
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
            receipt_path.write_text(
                json.dumps(receipt, ensure_ascii=False, sort_keys=True) + "\n",
                encoding="utf-8",
            )
            binding["replacement"]["confirmation_ref"] = receipt_rel
            binding["replacement"]["confirmation_digest"] = SCFCTL.sha256_file(
                receipt_rel
            )
        return binding

    def write_binding(self, binding):
        path = Path(SCFCTL.BINDINGS) / (binding["id"] + ".json")
        path.write_text(
            json.dumps(binding, ensure_ascii=False, indent=1) + "\n", encoding="utf-8"
        )
        return path

    def invoke(self, *argv):
        stdout = io.StringIO()
        with contextlib.redirect_stdout(stdout):
            code = SCFCTL.main(list(argv))
        return code, stdout.getvalue()

    def test_retire_rejects_invalid_issue_without_mutating_binding(self):
        for issue in (0, -1, True):
            with self.subTest(issue=issue), self.layout() as root:
                binding = self.binding(
                    root, issue, state="replacing", replacement_status="confirmed"
                )
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
                code, output = self.invoke(
                    "check-replacement", binding["id"], "--record"
                )
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
            sibling = self.binding(
                root, 1, binding_id="SCF-B-0901", role=binding["role"]
            )
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
            binding = self.binding(
                root, 1, state="replacing", replacement_status="confirmed"
            )
            path = self.write_binding(binding)
            code, output = self.invoke("retire", binding["id"])
            self.assertEqual(code, 0, output)
            self.assertEqual(json.loads(path.read_bytes())["state"], "retired")

    def test_receipt_checks_at_retire_and_validate(self):
        failures = {
            "bytes": "E_RETIRE",
            "missing": "E_RETIRE",
            "json": "E_RETIRE",
            "shape": "E_RETIRE",
            "result": "E_RETIRE",
            "binding": "E_RETIRE",
            "core": "E_RETIRE",
            "revision_missing": "E_RECEIPT_REVISION_SET",
            "revision_wrong": "E_RECEIPT_REVISION",
        }
        for command in ("retire", "validate"):
            for change in ("normal", *failures, "formal_updated", "artifact_deleted"):
                with (
                    self.subTest(command=command, change=change),
                    self.layout() as root,
                ):
                    binding = self.binding(
                        root, 1, state="replacing", replacement_status="confirmed"
                    )
                    path = self.write_binding(binding)
                    if command == "validate":
                        code, output = self.invoke("retire", binding["id"])
                        self.assertEqual(code, 0, output)
                        binding = json.loads(path.read_text())
                    receipt_path = root / binding["replacement"]["confirmation_ref"]
                    receipt = json.loads(receipt_path.read_text())
                    if change == "bytes":
                        receipt_path.write_text(receipt_path.read_text() + " ")
                    elif change == "missing":
                        receipt_path.unlink()
                    elif change == "core":
                        binding["reason"] += " changed"
                    elif change == "formal_updated":
                        (root / "formal/target.txt").write_bytes(
                            b"new formal revision\n"
                        )
                    elif change == "artifact_deleted":
                        (root / "scaffold/artifact.txt").unlink()
                    elif change in (
                        "json",
                        "shape",
                        "result",
                        "binding",
                        "revision_missing",
                        "revision_wrong",
                    ):
                        if change == "result":
                            receipt["result"] = "fail"
                        if change == "binding":
                            receipt["binding"] = "SCF-B-0901"
                        if change == "revision_missing":
                            receipt["target_revisions"] = {}
                        if change == "revision_wrong":
                            receipt["target_revisions"]["formal/target.txt"] = "0" * 64
                        receipt_path.write_text(
                            "{"
                            if change == "json"
                            else json.dumps([] if change == "shape" else receipt)
                        )
                        binding["replacement"]["confirmation_digest"] = (
                            SCFCTL.sha256_file(
                                binding["replacement"]["confirmation_ref"]
                            )
                        )
                        if command == "validate":
                            binding["retired"]["read_after_digest"] = binding[
                                "replacement"
                            ]["confirmation_digest"]
                    self.write_binding(binding)
                    before = path.read_bytes()
                    code, output = self.invoke(
                        command, *([binding["id"]] if command == "retire" else [])
                    )
                    expected = failures.get(change)
                    if command == "retire" and change in (
                        "formal_updated",
                        "artifact_deleted",
                    ):
                        expected = (
                            "E_REVISION" if change == "formal_updated" else "E_ARTIFACT"
                        )
                    if expected:
                        self.assertNotEqual(code, 0, output)
                        self.assertIn(expected, output)
                        self.assertEqual(path.read_bytes(), before)
                    else:
                        self.assertEqual(code, 0, output)
                        if command == "validate":
                            self.assertEqual(path.read_bytes(), before)

    def test_validate_rejects_retired_read_after_mismatch(self):
        for field, value in (
            ("read_after_digest", "0" * 64),
            ("confirmation_ref", "scaffold/evidence/other.json"),
        ):
            with self.subTest(field=field), self.layout() as root:
                binding = self.binding(
                    root, 1, state="replacing", replacement_status="confirmed"
                )
                path = self.write_binding(binding)
                code, output = self.invoke("retire", binding["id"])
                self.assertEqual(code, 0, output)
                binding = json.loads(path.read_text())
                binding["retired"][field] = value
                self.write_binding(binding)
                before = path.read_bytes()
                code, output = self.invoke("validate")
                self.assertNotEqual(code, 0, output)
                self.assertIn("E_RETIRE", output)
                self.assertEqual(path.read_bytes(), before)

    def test_validate_rejects_incomplete_fixed_revision_set(self):
        for change, expected in (
            ("partial_want", "E_REVISION_SET"),
            ("empty_formal", "E_REPL"),
        ):
            with self.subTest(change=change), self.layout() as root:
                binding = self.binding(
                    root, 1, state="replacing", replacement_status="confirmed"
                )
                path = self.write_binding(binding)
                code, output = self.invoke("retire", binding["id"])
                self.assertEqual(code, 0, output)
                binding = json.loads(path.read_text())
                receipt_path = root / binding["replacement"]["confirmation_ref"]
                receipt = json.loads(receipt_path.read_text())
                binding["replacement"]["target_revisions"] = {}
                if change == "empty_formal":
                    binding["replacement"]["formal_artifacts"] = []
                    receipt["target_revisions"] = {}
                receipt["binding_core_digest"] = SCFCTL.binding_core_digest(binding)
                receipt_path.write_text(json.dumps(receipt))
                digest = SCFCTL.sha256_file(binding["replacement"]["confirmation_ref"])
                binding["replacement"]["confirmation_digest"] = digest
                binding["retired"]["read_after_digest"] = digest
                self.write_binding(binding)
                before = path.read_bytes()
                code, output = self.invoke("validate")
                self.assertNotEqual(code, 0, output)
                self.assertIn(expected, output)
                self.assertEqual(path.read_bytes(), before)

    def test_validate_rejects_fifo_receipt(self):
        with self.layout() as root:
            binding = self.binding(
                root, 1, state="replacing", replacement_status="confirmed"
            )
            path = self.write_binding(binding)
            code, output = self.invoke("retire", binding["id"])
            self.assertEqual(code, 0, output)
            receipt = root / binding["replacement"]["confirmation_ref"]
            receipt.unlink()
            os.mkfifo(receipt)
            before = path.read_bytes()

            def timed_out(signum, frame):
                self.fail("validate blocked while reading a FIFO receipt")

            previous = signal.signal(signal.SIGALRM, timed_out)
            try:
                signal.alarm(2)
                code, output = self.invoke("validate")
            finally:
                signal.alarm(0)
                signal.signal(signal.SIGALRM, previous)
            self.assertNotEqual(code, 0, output)
            self.assertIn("E_RETIRE", output)
            self.assertEqual(path.read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
