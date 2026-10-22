#!/usr/bin/env python3
"""Mock GitHub transport and exercise the adapter with the real local admission core."""
import hashlib
import io
import importlib.util
import json
import subprocess
import sys
import tempfile
from contextlib import redirect_stdout
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("pr_admission_github", HERE / "pr_admission_github.py")
adapter = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = adapter
spec.loader.exec_module(adapter)


def git(root, *args):
    result = subprocess.run(["git", "-C", str(root), *args], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode:
        raise RuntimeError("fixture_git_failed")
    return result.stdout.decode().strip()


def commit(root, message):
    git(root, "add", "-A"); git(root, "commit", "-qm", message)
    return git(root, "rev-parse", "HEAD")


def fixture(root):
    git(root, "init", "-q", "-b", "main"); git(root, "config", "user.name", "selftest")
    git(root, "config", "user.email", "selftest@example.invalid")
    (root / "file.txt").write_text("base\n")
    (root / "scaffold/bindings").mkdir(parents=True)
    upstream = b"stable upstream\n"
    (root / "upstream.txt").write_bytes(upstream)
    binding = {"state": "registered", "upstream": [{"path": "upstream.txt",
               "sha256": hashlib.sha256(upstream).hexdigest()}]}
    (root / "scaffold/bindings/fixture.json").write_text(json.dumps(binding))
    (root / "scaffold/tools").mkdir(parents=True)
    (root / "scaffold/tools/scfctl.py").write_bytes((HERE / "scfctl.py").read_bytes())
    main_sha = commit(root, "base")
    git(root, "checkout", "-qb", "pr"); (root / "file.txt").write_text("pr\n")
    head_sha = commit(root, "pr"); git(root, "update-ref", "refs/pull/7/head", head_sha)
    return main_sha, head_sha


def prdata(head, state="OPEN", draft=False, merge="CLEAN", base="main", number=7):
    return {"number": number, "state": state, "isDraft": draft, "headRefOid": head,
            "baseRefName": base, "mergeStateStatus": merge}


def main():
    ok = True
    with tempfile.TemporaryDirectory(prefix="pr-admission-github-selftest-") as td:
        root = Path(td); main_sha, head_sha = fixture(root)
        def response(pr):
            def gh(args):
                return pr if args[0] == "pr" else main_sha
            return gh
        def fetch(repo, number, expected_main, expected_head, gitdir):
            subprocess.run(["git", "--git-dir", str(gitdir), "fetch", "--no-tags", str(root),
                            "refs/heads/main:refs/r18/main", "refs/pull/7/head:refs/r18/head"],
                           check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        normal = adapter.evaluate("owner/repo", 7, head_sha, response(prdata(head_sha)), fetch)
        core = normal["core"]
        ok &= normal["status"] == "pass" and core["status"] == "pass"
        ok &= core["head"]["status"] == core["trial"]["status"] == core["blobs"]["status"] == core["stale"]["status"] == "pass"
        ok &= all(item["status"] == "match" for item in core["blobs"]["items"])
        ok &= len(core["stale"]["items"]) == 1 and core["stale"]["items"][0]["actual_sha256"] == core["stale"]["items"][0]["expected_sha256"]
        print("normal real-core items+aggregate:", "ok" if ok else "FAIL", json.dumps(normal, sort_keys=True))

        def broken(_args): raise adapter.SnapshotError("secret must not leak")
        api_error = adapter.evaluate("owner/repo", 7, head_sha, broken, fetch)
        ok &= api_error["status"] == "unknown" and api_error["error"] == "github_snapshot_unknown"
        api_output = io.StringIO()
        with redirect_stdout(api_output):
            api_exit = adapter.main(["owner/repo", "7", head_sha], broken, fetch)
        ok &= api_exit == 1 and "secret" not in api_output.getvalue()
        ok &= "secret" not in json.dumps(api_error)
        print("API error unknown/nonzero without secret:", api_error["status"] == "unknown" and "secret" not in api_output.getvalue())

        missing = prdata(head_sha); del missing["isDraft"]
        malformed = adapter.evaluate("owner/repo", 7, head_sha, response(missing), fetch)
        observed = malformed.get("snapshot", {}).get("evidence", {}).get("observed", {})
        ok &= malformed["status"] == "unknown" and malformed["draft"]["status"] == "unknown"
        ok &= malformed["reviewed_head_check"]["status"] == "pass"
        ok &= observed.get("head_sha") == head_sha and observed.get("main_sha") == main_sha
        ok &= malformed["core"]["status"] == "unknown"
        print("missing draft retains head/main, marks draft unknown:", observed.get("head_sha") == head_sha and observed.get("main_sha") == main_sha and malformed["draft"]["status"] == "unknown")

        merged = adapter.evaluate("owner/repo", 7, head_sha,
                                  response(prdata(head_sha, state="MERGED")), fetch)
        merged_observed = merged.get("snapshot", {}).get("evidence", {}).get("observed", {})
        ok &= merged_observed.get("state") == "MERGED" and merged["pr_state"]["status"] == "fail"
        ok &= merged["status"] == "fail"
        print("MERGED observed then fails PR state:", merged_observed.get("state") == "MERGED" and merged["status"] == "fail")

        mismatch = adapter.evaluate("owner/repo", 7, "0" * 40, response(prdata(head_sha)), fetch)
        ok &= mismatch["status"] == "fail" and mismatch["reviewed_head_check"]["status"] == "fail"
        ok &= mismatch["core"]["status"] == "unknown"
        print("reviewed HEAD mismatch:", mismatch["status"] == "fail")

        def raced(_repo, _number, expected_main, expected_head, gitdir):
            subprocess.run(["git", "--git-dir", str(gitdir), "fetch", "--no-tags", str(root),
                            "refs/heads/main:refs/r18/main", "refs/pull/7/head:refs/r18/head"],
                           check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            adapter.verify_snapshot_refs(gitdir, expected_main, expected_head)
        fake_head = "0" * 40
        race = adapter.evaluate("owner/repo", 7, fake_head, response(prdata(fake_head)), raced)
        ok &= race["status"] == "unknown" and race["core"]["status"] == "unknown"
        print("ref race unknown:", race["status"] == "unknown")

        draft = adapter.evaluate("owner/repo", 7, head_sha, response(prdata(head_sha, draft=True)), fetch)
        ok &= draft["status"] == "fail" and draft["draft"]["status"] == "fail"
        dirty = adapter.evaluate("owner/repo", 7, head_sha, response(prdata(head_sha, merge="DIRTY")), fetch)
        ok &= dirty["status"] == "fail" and dirty["merge_state"]["status"] == "fail"
        ok &= adapter.main(["owner/repo", "7", head_sha], response(prdata(head_sha, merge="DIRTY")), fetch) == 1
        ok &= adapter.main(["owner/repo", "7", head_sha], response(prdata(head_sha, merge="UNKNOWN")), fetch) == 1
        print("draft/dirty fail + unknown nonzero:", draft["status"], dirty["status"])
    print("selftest:", "OK" if ok else "FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
