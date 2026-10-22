#!/usr/bin/env python3
"""Temporary Git integration tests for the read-only admission core."""
import importlib.util
import json
import subprocess
import sys
import tempfile
from pathlib import Path

TOOL = Path(__file__).with_name("pr_admission_check.py")
SPEC = importlib.util.spec_from_file_location("pr_admission_check", TOOL)
CORE = importlib.util.module_from_spec(SPEC); SPEC.loader.exec_module(CORE)


def git(root, *args, data=None):
    p = subprocess.run(["git", "-C", str(root), *args], input=data,
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if p.returncode:
        raise RuntimeError(p.stderr.decode(errors="replace"))
    return p.stdout


def fixture(root):
    git(root, "init", "-q", "-b", "main")
    git(root, "config", "user.name", "admission-selftest")
    git(root, "config", "user.email", "selftest@example.invalid")
    (root / "docs").mkdir()
    (root / "docs/upstream.md").write_bytes(b"upstream\r\n")
    (root / "docs/change.txt").write_text("base\n")
    (root / "docs/delete.txt").write_text("to delete\n")
    (root / "docs/conflict.txt").write_text("base line\n")
    (root / "scaffold/bindings").mkdir(parents=True)
    binding = {"id": "SELFTEST", "state": "registered", "upstream": [
        {"path": "docs/upstream.md", "sha256": "0" * 64}]}
    (root / "scaffold/bindings/fixture.json").write_text(json.dumps(binding))
    git(root, "add", "."); git(root, "commit", "-qm", "base")
    base = git(root, "rev-parse", "HEAD").decode().strip()
    git(root, "checkout", "-qb", "pr")
    (root / "docs/change.txt").write_text("PR change\n")
    (root / "docs/delete.txt").unlink()
    (root / "docs/conflict.txt").write_text("PR line\n")
    (root / "docs/new.txt").write_text("new\n")
    (root / "data.bin").write_bytes(b"\xff\r\n")
    git(root, "add", "-A"); git(root, "commit", "-qm", "PR")
    head = git(root, "rev-parse", "HEAD").decode().strip()
    git(root, "checkout", "-q", "main")
    (root / "docs/conflict.txt").write_text("main line\n")
    (root / "docs/change.txt").write_text("main change\n")
    git(root, "add", "docs"); git(root, "commit", "-qm", "main conflict")
    main = git(root, "rev-parse", "HEAD").decode().strip()
    return base, main, head


def main():
    with tempfile.TemporaryDirectory(prefix="pr-admission-selftest-") as td:
        root = Path(td); base, main_head, pr_head = fixture(root); repo = root / ".git"
        pr_tree = git(root, "rev-parse", pr_head + "^{tree}").decode().strip()
        cases = [
            ("reviewed HEAD mismatch", CORE.evaluate_head("a" * 40, pr_head), "fail"),
            ("changed blob mismatch", CORE.changed_blob_check(repo, base, pr_head, main_head + "^{tree}"), "fail"),
            ("stale Binding upstream", CORE.stale_check(repo, pr_tree), "fail"),
            ("trial merge conflict", CORE.trial_merge(repo, main_head, pr_head), "fail"),
            ("Git merge error is unknown", CORE.trial_merge(repo, "f" * 40, pr_head), "unknown"),
        ]
        ok = True
        for name, result, expected in cases:
            actual = result["status"]
            passed = actual == expected
            print(("ok  " if passed else "FAIL") + f" {name}: expected {expected}, got {actual}; evidence="
                  + json.dumps(result, sort_keys=True))
            ok &= passed
        clean_merge = CORE.trial_merge(repo, base, pr_head)
        clean = CORE.changed_blob_check(repo, base, pr_head, clean_merge["tree"])
        items = {item["path"]: item for item in clean["items"]}
        io_ok = (clean_merge["status"] == "pass" and clean["status"] == "pass"
                 and items.get("docs/delete.txt", {}).get("deleted_on_both")
                 and items.get("data.bin", {}).get("pr_blob") == items.get("data.bin", {}).get("merge_blob")
                 and items.get("docs/new.txt", {}).get("status") == "match")
        print(("ok  " if io_ok else "FAIL") + " binary/deletion/addition evidence: " + json.dumps(clean, sort_keys=True))
        ok &= io_ok
        print("selftest:", "OK" if ok else "FAIL")
        return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
