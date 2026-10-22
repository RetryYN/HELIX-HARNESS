#!/usr/bin/env python3
"""Mock GitHub transport and exercise the adapter with the real local admission core."""
import hashlib
import io
import importlib.util
import json
from functools import partial
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
    git(root, "checkout", "-qb", "dev"); (root / "dev-only.txt").write_text("dev\n")
    commit(root, "dev branch")
    git(root, "checkout", "-q", "main")
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
        fetch = partial(adapter.fetch_refs, remote_url=str(root))
        normal = adapter.evaluate("owner/repo", 7, head_sha, response(prdata(head_sha)), fetch)
        core = normal.get("core", {})
        ok &= normal["status"] == "pass" and core.get("status") == "pass"
        ok &= all(core.get(key, {}).get("status") == "pass" for key in ("head", "trial", "blobs", "stale"))
        ok &= all(item.get("status") == "match" for item in core.get("blobs", {}).get("items", []))
        stale_items = core.get("stale", {}).get("items", [])
        ok &= len(stale_items) == 1 and stale_items[0].get("actual_sha256") == stale_items[0].get("expected_sha256")
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
        fields = malformed.get("snapshot", {}).get("evidence", {}).get("fields", {})
        ok &= malformed["status"] == "unknown" and malformed["draft"]["status"] == "unknown"
        ok &= malformed["reviewed_head_check"]["status"] == "pass"
        ok &= fields.get("head_sha", {}).get("value") == head_sha
        ok &= fields.get("main_sha", {}).get("value") == main_sha
        ok &= fields.get("draft", {}).get("status") == "unknown"
        ok &= malformed["core"]["status"] == "unknown"
        print("missing draft retains head/main, marks draft unknown:", fields.get("head_sha", {}).get("value") == head_sha and fields.get("main_sha", {}).get("value") == main_sha and fields.get("draft", {}).get("status") == "unknown")

        merged = adapter.evaluate("owner/repo", 7, head_sha,
                                  response(prdata(head_sha, state="MERGED")), fetch)
        merged_state = merged.get("snapshot", {}).get("evidence", {}).get("fields", {}).get("state", {}).get("value")
        ok &= merged_state == "MERGED" and merged["pr_state"]["status"] == "fail"
        ok &= merged["status"] == "fail"
        print("MERGED observed then fails PR state:", merged_state == "MERGED" and merged["status"] == "fail")

        mismatch = adapter.evaluate("owner/repo", 7, "0" * 40, response(prdata(head_sha)), fetch)
        ok &= mismatch["status"] == "fail" and mismatch["reviewed_head_check"]["status"] == "fail"
        ok &= mismatch["core"]["status"] == "unknown"
        print("reviewed HEAD mismatch:", mismatch["status"] == "fail")

        fake_head = "0" * 40
        head_race = adapter.evaluate("owner/repo", 7, fake_head, response(prdata(fake_head)), fetch)
        ok &= head_race["status"] == "unknown" and head_race["core"]["status"] == "unknown"
        print("head ref race unknown:", head_race["status"] == "unknown")

        git(root, "checkout", "-q", "main")
        (root / "main-only.txt").write_text("advanced main\n"); commit(root, "advance main")
        git(root, "checkout", "-q", "pr")
        main_race = adapter.evaluate("owner/repo", 7, head_sha, response(prdata(head_sha)), fetch)
        ok &= main_race["status"] == "unknown" and main_race["core"]["status"] == "unknown"
        print("main ref race unknown:", main_race["status"] == "unknown")

        draft = adapter.evaluate("owner/repo", 7, head_sha, response(prdata(head_sha, draft=True)), fetch)
        ok &= draft["status"] == "fail" and draft["draft"]["status"] == "fail"
        dirty = adapter.evaluate("owner/repo", 7, head_sha, response(prdata(head_sha, merge="DIRTY")), fetch)
        ok &= dirty["status"] == "fail" and dirty["merge_state"]["status"] == "fail"
        ok &= adapter.main(["owner/repo", "7", head_sha], response(prdata(head_sha, merge="DIRTY")), fetch) == 1
        blocked = adapter.evaluate("owner/repo", 7, head_sha,
                                   response(prdata(head_sha, merge="BLOCKED")), fetch)
        ok &= blocked["status"] == "unknown" and blocked["merge_state"]["status"] == "unknown"
        ok &= adapter.main(["owner/repo", "7", head_sha], response(prdata(head_sha, merge="BLOCKED")), fetch) == 1
        dev = adapter.evaluate("owner/repo", 7, head_sha, response(prdata(head_sha, base="dev")), fetch)
        ok &= dev["status"] == "fail" and dev["pr_state"]["status"] == "fail"
        ok &= adapter.main(["owner/repo", "7", head_sha], response(prdata(head_sha, merge="UNKNOWN")), fetch) == 1
        print("draft/dirty fail, blocked unknown, dev base fail:", draft["status"], dirty["status"], blocked["status"], dev["status"])
    print("selftest:", "OK" if ok else "FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
