#!/usr/bin/env python3
"""Temporary Git integration checks for the read-only admission core."""

import hashlib
import importlib.util
import json
import subprocess
import sys
import tempfile
from pathlib import Path

sys.dont_write_bytecode = True
TOOL = Path(__file__).with_name("pr_admission_check.py")
SPEC = importlib.util.spec_from_file_location("pr_admission_check", TOOL)
CORE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CORE)


def git(root, *args, data=None):
    p = subprocess.run(
        ["git", "-C", str(root), *args],
        input=data,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if p.returncode:
        raise RuntimeError(p.stderr.decode(errors="replace"))
    return p.stdout


def commit(root, message):
    git(root, "add", "-A")
    git(root, "commit", "-qm", message)


def fixture(root):
    git(root, "init", "-q", "-b", "main")
    git(root, "config", "user.name", "admission-selftest")
    git(root, "config", "user.email", "selftest@example.invalid")
    (root / "docs").mkdir()
    (root / "docs/change.txt").write_text("".join(f"line {n}\n" for n in range(1, 26)))
    upstream = b"upstream\r\n"
    (root / "docs/upstream.md").write_bytes(upstream)
    (root / "docs/delete.txt").write_text("delete me\n")
    (root / "docs/crlf.txt").write_bytes(b"old\r\n")
    (root / "scaffold/bindings").mkdir(parents=True)
    binding = {
        "id": "SELFTEST",
        "state": "registered",
        "upstream": [
            {"path": "docs/upstream.md", "sha256": hashlib.sha256(upstream).hexdigest()}
        ],
    }
    (root / "scaffold/bindings/fixture.json").write_text(json.dumps(binding))
    helper = Path(CORE.__file__).with_name("scfctl.py").read_bytes()
    (root / "scaffold/tools").mkdir(parents=True)
    (root / "scaffold/tools/scfctl.py").write_bytes(helper)
    commit(root, "base")
    git(root, "checkout", "-qb", "pr")
    lines = (root / "docs/change.txt").read_text().splitlines()
    lines[1] = "PR line 2"
    (root / "docs/change.txt").write_text("\n".join(lines) + "\n")
    (root / "docs/delete.txt").unlink()
    (root / "docs/new.txt").write_text("new\n")
    (root / "docs/crlf.txt").write_bytes(b"PR\r\ncontent\r\n")
    (root / "data.bin").write_bytes(b"\x00\xff\r\n")
    commit(root, "PR changes")
    pr_head = git(root, "rev-parse", "HEAD").decode().strip()
    git(root, "checkout", "-q", "main")
    (root / "docs/main-only.txt").write_text("main\n")
    commit(root, "main distinct file")
    return pr_head


def check(name, condition, evidence):
    print(
        ("ok  " if condition else "FAIL")
        + f" {name}: "
        + json.dumps(evidence, sort_keys=True)
    )
    return condition


def main():
    ok = True
    with tempfile.TemporaryDirectory(prefix="pr-admission-selftest-") as td:
        root = Path(td)
        pr_head = fixture(root)
        repo = root / ".git"
        calls = []
        original_git = CORE.git

        def counted_git(repo_arg, *args):
            if args[:1] in (("rev-parse",), ("merge-base",)):
                calls.append(args[0])
            return original_git(repo_arg, *args)

        CORE.git = counted_git
        clean = CORE.run(repo, pr_head, "main", "pr")
        CORE.git = original_git
        items = {i["path"]: i for i in clean["blobs"]["items"]}
        io = all(
            items.get(p, {}).get("status") == "match"
            for p in ("docs/change.txt", "docs/crlf.txt", "data.bin", "docs/new.txt")
        )
        io &= items.get("docs/delete.txt", {}).get("deleted_on_both") is True
        ok &= check(
            "diverged clean merge + item/aggregate blob pass",
            clean["status"] == "pass"
            and clean["trial"]["status"]
            == clean["blobs"]["status"]
            == clean["stale"]["status"]
            == "pass"
            and io,
            clean,
        )
        ok &= check(
            "revision resolution and merge-base each run once",
            calls.count("rev-parse") == 2 and calls.count("merge-base") == 1,
            calls,
        )

        lines = (root / "docs/change.txt").read_text().splitlines()
        lines[23] = "main line 24"
        (root / "docs/change.txt").write_text("\n".join(lines) + "\n")
        commit(root, "main disjoint hunk")
        disjoint = CORE.run(repo, pr_head, "main", "pr")
        changed = {i["path"]: i for i in disjoint["blobs"]["items"]}["docs/change.txt"]
        ok &= check(
            "same-file disjoint hunks merge clean but blob differs",
            disjoint["trial"]["status"] == "pass"
            and disjoint["blobs"]["status"] == "fail"
            and changed["status"] == "mismatch"
            and changed["pr_blob"] != changed["merge_blob"],
            {
                "run": disjoint["status"],
                "trial": disjoint["trial"],
                "aggregate": disjoint["blobs"]["status"],
                "item": changed,
            },
        )

        (root / "docs/upstream.md").write_bytes(b"changed upstream\r\n")
        commit(root, "stale upstream")
        stale = CORE.run(repo, pr_head, "main", "pr")
        ok &= check(
            "run reports stale Binding fail",
            stale["trial"]["status"] == "pass"
            and stale["stale"]["status"] == "fail"
            and "docs/upstream.md" in stale["stale"]["stale_paths"],
            stale["stale"],
        )
        (root / "scaffold/tools/scfctl.py").write_bytes(b"# changed candidate helper\n")
        commit(root, "candidate scfctl")
        helper_diff = CORE.run(repo, pr_head, "main", "pr")
        ok &= check(
            "merged scfctl differs so stale is unknown",
            helper_diff["stale"]["status"] == "unknown"
            and helper_diff["stale"]["oracle"]["sha256"]
            != helper_diff["stale"]["oracle"]["merged_sha256"],
            helper_diff["stale"],
        )

        mismatch = CORE.run(repo, "0" * 40, "main", "pr")
        ok &= check(
            "HEAD mismatch stops later checks",
            mismatch["head"]["status"] == mismatch["status"] == "fail"
            and all(
                mismatch[k]["status"] == "unknown" for k in ("trial", "blobs", "stale")
            ),
            mismatch,
        )

        original_git = CORE.git

        def merge_error(repo_arg, *args):
            if args and args[0] == "merge-tree":
                return subprocess.CompletedProcess(args, 1, b"", b"bad object")
            return original_git(repo_arg, *args)

        CORE.git = merge_error
        failed_trial = CORE.run(repo, pr_head, "main", "pr")
        CORE.git = original_git
        ok &= check(
            "merge-tree-only error stops later checks",
            failed_trial["merge_base"] is not None
            and failed_trial["trial"]["status"] == "unknown"
            and all(failed_trial[k]["status"] == "unknown" for k in ("blobs", "stale")),
            failed_trial,
        )

        lines = (root / "docs/change.txt").read_text().splitlines()
        lines[1] = "main conflict line"
        (root / "docs/change.txt").write_text("\n".join(lines) + "\n")
        commit(root, "main conflict")
        conflict = CORE.run(repo, pr_head, "main", "pr")
        ok &= check(
            "conflict fails and stops later checks",
            conflict["trial"]["status"] == "fail"
            and all(conflict[k]["status"] == "unknown" for k in ("blobs", "stale")),
            conflict,
        )
    print("selftest:", "OK" if ok else "FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
