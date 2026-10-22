#!/usr/bin/env python3
"""Read-only GitHub snapshot adapter for the local PR admission core."""
import argparse
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

sys.dont_write_bytecode = True
import pr_admission_check as core

SHA = re.compile(r"^[0-9a-f]{40}$")


class SnapshotError(Exception):
    pass


def gh_read(args):
    """Run a fixed read-only gh command; never include stderr or credentials in output."""
    result = subprocess.run(["gh", *args], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode:
        raise SnapshotError("github_read_failed")
    return result.stdout


def snapshot(repo, number, github=gh_read):
    names = ("number", "state", "draft", "head_sha", "base_ref", "merge_state", "main_sha")
    fields = {name: "unknown" for name in names}
    observed = {}
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repo) or number < 1:
        return observed, fields
    try:
        raw = github(["pr", "view", str(number), "--repo", repo, "--json",
                      "number,state,isDraft,headRefOid,baseRefName,mergeStateStatus"])
        pr = json.loads(raw) if isinstance(raw, str) else raw
    except (SnapshotError, ValueError, TypeError, OSError, subprocess.SubprocessError):
        pr = {}
    if not isinstance(pr, dict):
        pr = {}
    values = {"number": pr.get("number"), "state": pr.get("state"),
              "draft": pr.get("isDraft"), "head_sha": pr.get("headRefOid"),
              "base_ref": pr.get("baseRefName"), "merge_state": pr.get("mergeStateStatus")}
    for key in ("number", "state", "draft", "head_sha", "base_ref", "merge_state"):
        value = values[key]
        valid = ((key == "number" and value == number)
                 or (key == "state" and value in ("OPEN", "CLOSED", "MERGED"))
                 or (key == "draft" and isinstance(value, bool))
                 or (key == "head_sha" and isinstance(value, str) and SHA.fullmatch(value))
                 or (key == "base_ref" and isinstance(value, str) and bool(value))
                 or (key == "merge_state" and isinstance(value, str) and bool(value)))
        if valid:
            fields[key] = "pass"
            observed[key] = value
    try:
        main_raw = github(["api", f"repos/{repo}/commits/main", "--jq", ".sha"])
        main_sha = main_raw.strip() if isinstance(main_raw, str) else main_raw
    except (SnapshotError, ValueError, TypeError, OSError, subprocess.SubprocessError):
        main_sha = None
    if isinstance(main_sha, str) and SHA.fullmatch(main_sha):
        observed["main_sha"] = main_sha
        fields["main_sha"] = "pass"
    return observed, fields


def verify_snapshot_refs(gitdir, main_sha, head_sha):
    values = []
    for ref in ("refs/r18/main", "refs/r18/head"):
        result = subprocess.run(["git", "--git-dir", str(gitdir), "rev-parse", ref],
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        values.append(result.stdout.strip() if result.returncode == 0 else None)
    if values != [main_sha, head_sha]:
        raise SnapshotError("snapshot_ref_race")


def fetch_refs(repo, number, main_sha, head_sha, gitdir):
    url = f"https://github.com/{repo}.git"
    result = subprocess.run(["git", "--git-dir", str(gitdir), "fetch", "--no-tags", url,
                             "+refs/heads/main:refs/r18/main",
                             f"+refs/pull/{number}/head:refs/r18/head"],
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode:
        raise SnapshotError("git_fetch_failed")
    verify_snapshot_refs(gitdir, main_sha, head_sha)


def item(status, **evidence):
    return {"status": status, "evidence": evidence}


def evaluate(repo, number, reviewed_head, github=gh_read, fetcher=fetch_refs):
    result = {"repo": repo, "pr_number": number, "reviewed_head": reviewed_head}
    observed, fields = snapshot(repo, number, github)
    snapshot_statuses = list(fields.values())
    snapshot_status = "fail" if "fail" in snapshot_statuses else "unknown" if "unknown" in snapshot_statuses else "pass"
    result["snapshot"] = {"status": snapshot_status, "evidence": {
        "observed": observed,
        "fields": {name: {"status": status, "value": observed.get(name)} for name, status in fields.items()}}}
    if fields["number"] == fields["state"] == fields["head_sha"] == "unknown":
        result["error"] = "github_snapshot_unknown"
    head_sha = observed.get("head_sha")
    result["reviewed_head_check"] = item(
        "unknown" if fields["head_sha"] != "pass" or not isinstance(reviewed_head, str) or not SHA.fullmatch(reviewed_head)
        else ("pass" if reviewed_head == head_sha else "fail"), reviewed=reviewed_head, observed=head_sha)
    draft = observed.get("draft")
    result["draft"] = item("unknown" if fields["draft"] != "pass" else "fail" if draft else "pass", value=draft)
    merge_state = observed.get("merge_state")
    merge_status = ("pass" if merge_state == "CLEAN" else "fail" if merge_state == "DIRTY" else "unknown")
    result["merge_state"] = item(merge_status, value=merge_state)
    state, base_ref = observed.get("state"), observed.get("base_ref")
    if fields["state"] != "pass" or fields["base_ref"] != "pass":
        result["pr_state"] = item("unknown", state=state, base_ref=base_ref, expected_base="main")
    elif state != "OPEN" or base_ref != "main":
        result["pr_state"] = item("fail", state=state, base_ref=base_ref, expected_base="main")
    else:
        result["pr_state"] = item("pass", state=state, base_ref=base_ref)
    if (snapshot_status != "pass" or result["reviewed_head_check"]["status"] != "pass"
            or result["pr_state"]["status"] != "pass"):
        result["core"] = item("unknown", reason="prior_admission_item_not_pass")
    else:
        try:
            with tempfile.TemporaryDirectory(prefix="pr-admission-github-") as tmp:
                gitdir = Path(tmp) / "repo.git"
                init = subprocess.run(["git", "init", "--bare", "-q", str(gitdir)],
                                      stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                if init.returncode:
                    raise SnapshotError("temporary_repository_failed")
                fetcher(repo, number, observed["main_sha"], head_sha, gitdir)
                core_result = core.run(gitdir, reviewed_head, "refs/r18/main", "refs/r18/head")
            result["core"] = core_result
        except (SnapshotError, OSError, subprocess.SubprocessError):
            result["core"] = item("unknown", reason="git_snapshot_unknown")
    statuses = [result[key]["status"] for key in
                ("snapshot", "reviewed_head_check", "draft", "merge_state", "pr_state", "core")]
    result["status"] = "fail" if "fail" in statuses else "unknown" if "unknown" in statuses else "pass"
    return result


def main(argv=None, github=gh_read, fetcher=fetch_refs):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repo", help="GitHub owner/name")
    parser.add_argument("pr", type=int, help="pull request number")
    parser.add_argument("reviewed_head", help="exact HEAD from the review request")
    args = parser.parse_args(argv)
    result = evaluate(args.repo, args.pr, args.reviewed_head, github, fetcher)
    print(json.dumps(result, sort_keys=True))
    return 0 if result["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
