#!/usr/bin/env python3
"""Refs/index/worktree stay unchanged; real-repo merge-tree may add unreachable objects to its object DB."""
import hashlib
import importlib.util
import json
import os
import re
import subprocess
import sys
from pathlib import Path

SHA = re.compile(r"^[0-9a-f]{40}(?:[0-9a-f]{24})?$")


def git(repo, *args):
    return subprocess.run(["git", "--literal-pathspecs", "--git-dir", str(repo), *args],
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def text(result):
    return result.stdout.decode("utf-8", errors="replace").strip()


def resolve_commit(repo, revision):
    if not isinstance(revision, str) or revision.startswith("-"):
        return None
    result = git(repo, "rev-parse", "--verify", "--end-of-options", revision + "^{commit}")
    value = text(result)
    return value if result.returncode == 0 and SHA.fullmatch(value) else None


def evaluate_head(reviewed, head):
    status = "unknown" if not SHA.fullmatch(str(reviewed)) or not head else (
        "pass" if reviewed == head else "fail")
    return {"status": status, "evidence": {"reviewed_head": reviewed, "pr_head": head}}


def object_oid(repo, revision, path):
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


def trial_merge(repo, base, head, ancestor):
    merged = git(repo, "merge-tree", "--write-tree", base, head)
    first = merged.stdout.splitlines()[0].decode("ascii", errors="ignore") if merged.stdout else ""
    if merged.returncode == 0 and SHA.fullmatch(first):
        return {"status": "pass", "tree": first, "merge_base": ancestor, "error": None}
    if merged.returncode == 1 and SHA.fullmatch(first):
        return {"status": "fail", "tree": first, "merge_base": ancestor, "error": "conflict"}
    return {"status": "unknown", "tree": None, "merge_base": ancestor,
            "error": merged.stderr.decode(errors="replace").strip() or f"merge-tree exit {merged.returncode}"}


def changed_blob_check(repo, ancestor, head, tree):
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
        status = "unknown" if "unknown" in (before_state, after_state) else (
            "mismatch" if before_state != after_state or before != after else "match")
        items.append({"path": path, "status": status, "pr_blob": before, "merge_blob": after,
                      "deleted_on_both": before_state == after_state == "absent"})
    status = "fail" if any(i["status"] == "mismatch" for i in items) else (
        "unknown" if any(i["status"] == "unknown" for i in items) else "pass")
    return {"status": status, "items": items, "merge_base": ancestor}


def stale_check(repo, tree):
    listing = git(repo, "ls-tree", "-r", "--name-only", "-z", tree)
    if listing.returncode:
        return {"status": "unknown", "items": [], "error": listing.stderr.decode(errors="replace").strip()}
    paths = [p.decode("utf-8", errors="surrogateescape") for p in listing.stdout.split(b"\0") if p]
    binding_paths = [p for p in paths if p.startswith("scaffold/bindings/") and p.endswith(".json") and p.count("/") == 2]
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
    helper = Path(__file__).with_name("scfctl.py").resolve()
    helper_raw = helper.read_bytes()
    helper_sha = hashlib.sha256(helper_raw).hexdigest()
    merged_state, merged_oid = object_oid(repo, tree, "scaffold/tools/scfctl.py")
    merged_helper = git(repo, "cat-file", "blob", merged_oid) if merged_state == "present" else None
    if merged_helper is None or merged_helper.returncode:
        return {"status": "unknown", "items": [], "error": "merged scfctl.py unavailable"}
    merged_sha = hashlib.sha256(merged_helper.stdout).hexdigest()
    oracle = {"path": "scaffold/tools/scfctl.py", "sha256": helper_sha, "merged_sha256": merged_sha}
    if helper_sha != merged_sha:
        return {"status": "unknown", "items": [], "error": "local and merged scfctl.py differ", "oracle": oracle}
    digests, evidence = {}, []
    for path, expected_set in sorted(unique_upstream.items()):
        state, oid = object_oid(repo, tree, path)
        if state == "unknown":
            return {"status": "unknown", "items": evidence, "error": "upstream lookup failed: " + path, "oracle": oracle}
        if state == "absent":
            actual = None
        else:
            data = git(repo, "cat-file", "blob", oid)
            if data.returncode:
                return {"status": "unknown", "items": evidence, "error": "upstream blob read failed: " + path, "oracle": oracle}
            actual = hashlib.sha256(data.stdout).hexdigest()
        digests[path] = actual
        for expected in sorted(expected_set):
            evidence.append({"path": path, "expected_sha256": expected, "actual_sha256": actual})
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location("scfctl_for_admission", helper)
    scfctl = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(scfctl)
    try:
        stale = {path for binding in bindings if binding.get("state") != "retired"
                 for path, _ in scfctl.check_stale(binding, digests)}
    except (AttributeError, KeyError, TypeError) as exc:
        return {"status": "unknown", "items": evidence, "error": "scfctl input shape: " + str(exc), "oracle": oracle}
    return {"status": "fail" if stale else "pass", "items": evidence,
            "stale_paths": sorted(stale), "tree": tree, "oracle": oracle}


def run(repo, reviewed_head, base, head):
    base_sha, head_sha = resolve_commit(repo, base), resolve_commit(repo, head)
    head_check = evaluate_head(reviewed_head, head_sha)
    result = {"base_sha": base_sha, "head_sha": head_sha, "head": head_check,
              "merge_base": None, "tree": None}
    later_unknown = {"status": "unknown", "items": [], "error": "prior check did not pass"}
    if not base_sha or not head_sha or head_check["status"] != "pass":
        result.update(trial=later_unknown, blobs=later_unknown, stale=later_unknown)
    else:
        ancestor, error = merge_base(repo, base_sha, head_sha)
        result["merge_base"] = ancestor
        trial = trial_merge(repo, base_sha, head_sha, ancestor) if ancestor else {
            "status": "unknown", "tree": None, "merge_base": None, "error": error}
        result["trial"] = trial
        result["tree"] = trial["tree"]
        if trial["status"] != "pass":
            result.update(blobs=later_unknown, stale=later_unknown)
        else:
            result["blobs"] = changed_blob_check(repo, ancestor, head_sha, trial["tree"])
            result["stale"] = stale_check(repo, trial["tree"])
    statuses = [result[k]["status"] for k in ("head", "trial", "blobs", "stale")]
    result["status"] = "fail" if "fail" in statuses else ("unknown" if "unknown" in statuses else "pass")
    return result
