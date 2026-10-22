#!/usr/bin/env python3
"""Read-only local Git core for PR merge evidence; no refs or worktrees are changed."""
import hashlib
import importlib.util
import json
import os
import re
import subprocess
from pathlib import Path

SHA = re.compile(r"^[0-9a-f]{40}(?:[0-9a-f]{24})?$")


def git(repo, *args):
    return subprocess.run(["git", "--literal-pathspecs", "--git-dir", str(repo), *args],
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def text(result):
    return result.stdout.decode("utf-8", errors="replace").strip()


def evaluate_head(reviewed, head):
    if not SHA.fullmatch(str(reviewed)) or not SHA.fullmatch(str(head)):
        status = "unknown"
    else:
        status = "pass" if reviewed == head else "fail"
    return {"status": status, "evidence": {"reviewed_head": reviewed, "pr_head": head}}


def object_oid(repo, revision, path):
    tree = git(repo, "cat-file", "-e", revision + "^{tree}")
    if tree.returncode:
        return "unknown", None
    found = git(repo, "ls-tree", "-z", revision, "--", path)
    if found.returncode:
        return "unknown", None
    for entry in found.stdout.split(b"\0"):
        if entry and b"\t" in entry:
            metadata, entry_path = entry.split(b"\t", 1)
            fields = metadata.split()
            if entry_path == os.fsencode(path) and len(fields) == 3:
                return "present", fields[2].decode("ascii")
    return "absent", None


def merge_base(repo, base, head):
    result = git(repo, "merge-base", base, head)
    return (text(result), None) if result.returncode == 0 else (None, result.stderr.decode(errors="replace").strip())


def trial_merge(repo, base, head):
    ancestor, error = merge_base(repo, base, head)
    if ancestor is None:
        return {"status": "unknown", "tree": None, "merge_base": None, "error": error}
    merged = git(repo, "merge-tree", "--write-tree", base, head)
    first = merged.stdout.splitlines()[0].decode("ascii", errors="ignore") if merged.stdout else ""
    if merged.returncode == 0 and SHA.fullmatch(first):
        return {"status": "pass", "tree": first, "merge_base": ancestor, "error": None}
    # Git 2.43 can return 1 for invalid refs too; a tree OID plus conflict records distinguishes conflict output.
    if merged.returncode == 1 and SHA.fullmatch(first) and b"CONFLICT" in merged.stdout:
        return {"status": "fail", "tree": first, "merge_base": ancestor, "error": "conflict"}
    return {"status": "unknown", "tree": None, "merge_base": ancestor,
            "error": merged.stderr.decode(errors="replace").strip() or f"merge-tree exit {merged.returncode}"}


def changed_blob_check(repo, base, head, tree):
    ancestor, error = merge_base(repo, base, head)
    if ancestor is None:
        return {"status": "unknown", "items": [], "error": error}
    diff = git(repo, "diff", "--no-renames", "--name-only", "-z", ancestor, head)
    if diff.returncode:
        return {"status": "unknown", "items": [], "error": diff.stderr.decode(errors="replace").strip()}
    items = []
    for raw_path in diff.stdout.split(b"\0"):
        if not raw_path:
            continue
        path = raw_path.decode("utf-8", errors="surrogateescape")
        before_state, before = object_oid(repo, head, path)
        after_state, after = object_oid(repo, tree, path)
        if "unknown" in (before_state, after_state):
            status = "unknown"
        elif before_state == after_state == "absent":
            status = "match"
        elif before_state != after_state or before != after:
            status = "mismatch"
        else:
            status = "match"
        items.append({"path": path, "status": status, "pr_blob": before,
                      "merge_blob": after, "deleted_on_both": before_state == after_state == "absent"})
    status = "fail" if any(i["status"] == "mismatch" for i in items) else (
        "unknown" if any(i["status"] == "unknown" for i in items) else "pass")
    return {"status": status, "items": items, "merge_base": ancestor}


def stale_check(repo, tree):
    listing = git(repo, "ls-tree", "-r", "--name-only", "-z", tree)
    if listing.returncode:
        return {"status": "unknown", "items": [], "error": listing.stderr.decode(errors="replace").strip()}
    paths = [p.decode("utf-8", errors="surrogateescape") for p in listing.stdout.split(b"\0") if p]
    binding_paths = [p for p in paths if p.startswith("scaffold/bindings/") and p.endswith(".json")]
    bindings, unique_upstream = [], {}
    for path in binding_paths:
        state, oid = object_oid(repo, tree, path)
        if state != "present":
            return {"status": "unknown", "items": [], "error": "Binding blob unavailable: " + path}
        raw = git(repo, "cat-file", "blob", oid)
        if raw.returncode:
            return {"status": "unknown", "items": [], "error": "Binding blob read failed: " + path}
        try:
            binding = json.loads(raw.stdout.decode("utf-8"))
            if not isinstance(binding, dict):
                raise TypeError("Binding root is not an object")
            bindings.append(binding)
            if binding.get("state") != "retired":
                upstreams = binding["upstream"]
                if not isinstance(upstreams, list):
                    raise TypeError("Binding upstream is not a list")
                for upstream in upstreams:
                    if not isinstance(upstream, dict):
                        raise TypeError("Binding upstream entry is not an object")
                    unique_upstream.setdefault(upstream["path"], set()).add(upstream["sha256"])
        except (UnicodeDecodeError, json.JSONDecodeError, KeyError, TypeError) as exc:
            return {"status": "unknown", "items": [], "error": f"invalid Binding {path}: {exc}"}
    digests, evidence = {}, []
    for path, expected_set in sorted(unique_upstream.items()):
        state, oid = object_oid(repo, tree, path)
        if state == "unknown":
            return {"status": "unknown", "items": evidence, "error": "upstream lookup failed: " + path}
        if state == "absent":
            actual = None
        else:
            data = git(repo, "cat-file", "blob", oid)
            if data.returncode:
                return {"status": "unknown", "items": evidence, "error": "upstream blob read failed: " + path}
            actual = hashlib.sha256(data.stdout).hexdigest()
        digests[path] = actual
        for expected in sorted(expected_set):
            evidence.append({"path": path, "expected_sha256": expected, "actual_sha256": actual})
    helper = Path(__file__).with_name("scfctl.py").resolve()
    helper_sha = hashlib.sha256(helper.read_bytes()).hexdigest()
    spec = importlib.util.spec_from_file_location("scfctl_for_admission", helper)
    scfctl = importlib.util.module_from_spec(spec); spec.loader.exec_module(scfctl)
    try:
        stale = {path for binding in bindings if binding.get("state") != "retired"
                 for path, _ in scfctl.check_stale(binding, digests)}
    except (AttributeError, KeyError, TypeError) as exc:
        return {"status": "unknown", "items": evidence, "error": "scfctl input shape: " + str(exc),
                "oracle": {"path": "scaffold/tools/scfctl.py", "sha256": helper_sha}}
    status = "fail" if stale else "pass"
    return {"status": status, "items": evidence, "stale_paths": sorted(stale), "tree": tree,
            "oracle": {"path": "scaffold/tools/scfctl.py", "sha256": helper_sha}}
