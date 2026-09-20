#!/usr/bin/env python3
"""leaseboot — 有効化の準備のうち機械作業だけを行うcommand（packet「有効化」。POの手作業を、越える必要のある境界だけに絞る）。

  leaseboot.py prepare  --lease-pr N --po LOGIN [--apply]   状態Issueと試験PRを作り、lease記録の候補を標準出力へ出す
  leaseboot.py probe    --lease-pr N [--apply]              全login×2 reviewの実測を回し、結果IDを入れた候補を出す
  leaseboot.py verify   --lease-pr N                        READMEの「未検証」項目を実物で確かめる（読取りだけ）

結果は標準出力のJSONだけで返し、fileは書かない（実行userの領域へ書かせない）。作成側はその候補を本PRのlease記録へ入れる。

判断は生成しない。人間が越えるのは、GitHub Appの作成・installの認可、rootでの`install.sh`の1回、試験reviewの提出、
最終exact HEADの承認だけである。書き込むのは、状態Issueの作成、`lease/`配下のbranchへのpush、試験PRの作成、
実測commandが置く結果commentだけで、mainへは押せない（`push_main`は許可リストに入れない）。既定はdry-runである。
"""
import argparse, json, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))


def _stray(here):
    """copyの既知でないentry（`__pycache__`のpyc、標準libraryを覆うmodule・package、拡張module）。標準libraryだけで調べる。"""
    known = {"README.md", "cases", "lease.json", "leaseboot.py", "leasecore.py", "leasectl.py", "leasefixtures.py",
             "leasegh.py", "leasepost.py", "leaseprobe.py", "leaserecover.py"}
    stray = [n for n in os.listdir(here) if n not in known]
    cd = os.path.join(here, "cases")
    stray += ["cases/" + n for n in (os.listdir(cd) if os.path.isdir(cd) else [])
              if not n.endswith(".json") or not os.path.isfile(os.path.join(cd, n))]
    return sorted(stray)


def _preflight(here):
    """HEREをsys.pathへ入れてcommand群をimportする前に、既知でないentryがあれば止める（`-I`で起動したときだけ。bytesの照合は起動条件で行う）。"""
    stray = _stray(here)
    if sys.flags.isolated and stray:
        print("拒否: copyに既知でないentryがある（importの前に止める）: %s" % ", ".join(stray), file=sys.stderr)
        sys.exit(2)


_preflight(HERE)
sys.path.insert(0, HERE)
import leasecore as C   # noqa: E402
import leasegh as G     # noqa: E402
import leaseprobe as P  # noqa: E402

TEST_BRANCH = "lease/probe-test"
TEST_PATH = "docs/governance/notes/capability-lease-probe-test.md"
TEST_TEXT = """# Capability Lease 削除不能の実測用（判断ではない）

このPRは、AI側identityがPO reviewを削除できないことを実測するためだけに置く。PRの内容に意味は無く、mergeしない。
POはこのPRへ、本文に判断行を書かないreviewを、Approveで1件、Request changesで1件提出する（packet「削除への対処」(i)）。
"""
ISSUE_TITLE = "Capability Lease（CAPLEASE-BOOT-01）状態Issue"
ISSUE_BODY = """Capability Leaseの状態・停止・削除不能の実測の結果を、executorとAI側の実測commandがcommentとして置くIssue。

- 人間が本文やcommentを判断として使うためのものではない（判断はPR reviewで行う）。
- `lease_state`、`lease_probe_result`、`merge_result`のblockだけを機械が読む。
"""


def app_login():
    """executor userのhomeに置いたGitHub Appの設定から、AI側のlogin（`<slug>[bot]`）とslugを読む。"""
    app = G.app_config()
    return app["slug"], "%s[bot]" % app["slug"]


def gate(gh, a):
    """起動条件（置き場所・-I・bytes）と、対象PRの固定、mainのlease記録が未有効であることを確かめる。"""
    miss = G.target_pr_mismatch(a.lease_pr)
    if miss:
        return miss
    bad = G.self_integrity(gh, None)
    if bad:
        return "起動条件を満たさない: %s" % "、".join(bad)
    lease = G.lease_at(gh, a.lease_pr)   # main上のlease記録が有効ならここで止まる
    bad = G.self_integrity(gh, "refs/lease/pr-%d" % a.lease_pr)
    return "起動条件を満たさない: %s" % "、".join(bad) if bad else lease


def cmd_prepare(a, gh):
    lease = gate(gh, a)
    if isinstance(lease, str):
        print("拒否: %s" % lease, file=sys.stderr)
        return 2
    slug, login = app_login()
    if a.po == login or a.po.endswith("[bot]"):
        print("拒否: --po はAI側のloginにできない", file=sys.stderr)
        return 2
    base = G.protection(gh)
    if base.get("unavailable"):
        print("拒否: 保護設定・rulesetを取得できない（基準値を空の一致にしない）", file=sys.stderr)
        return 2
    plan = {"status_issue": "作成する", "test_pr": "作成する", "branch": TEST_BRANCH, "identity": login, "po": a.po}
    if not a.apply:
        print(json.dumps({"mode": "dry-run", "plan": plan, "baseline": base}, ensure_ascii=False, indent=1))
        return 0
    gh.w = G.Writes({("create_issue", "issue"), ("push_branch", TEST_BRANCH), ("create_pr", TEST_BRANCH)})
    issue = gh.create_issue(ISSUE_TITLE, ISSUE_BODY)
    main_sha = gh.git("rev-parse", "origin/main").stdout.decode().strip()
    blob = gh.git("hash-object", "-w", "--stdin", input=TEST_TEXT.encode("utf-8")).stdout.decode().strip()
    sha = create_commit(gh, main_sha, blob)
    p = gh.push_branch(sha, TEST_BRANCH)
    if p.returncode != 0:
        print("拒否: 試験branchへpushできない: %s" % p.stderr.decode("utf-8", "replace")[:300], file=sys.stderr)
        return 1
    pr = gh.create_pr("Capability Lease 削除不能の実測用（mergeしない）", TEST_BRANCH, TEST_TEXT)
    out = dict(lease)
    out["identity"] = {"po": a.po, "ai": login, "creator": login, "executor": login, "recovery": login,
                       "reviewers": [{"login": login}], "apps": [slug]}
    out["baseline"] = base
    out["status_issue"] = issue["number"]
    probe = dict(out.get("probe") or {})
    probe["test_pr"] = pr["number"]
    out["probe"] = probe
    for k in C.DERIVED_LEASE_KEYS:
        out.pop(k, None)
    print(json.dumps({"status_issue": issue["number"], "test_pr": pr["number"], "test_pr_url": pr.get("html_url"),
                      "next": "POはこの試験PRへ、判断行を書かないreviewをApproveで1件、Request changesで1件提出する",
                      "lease": out}, ensure_ascii=False, indent=1))
    return 0


def create_commit(gh, parent, blob):
    """mainのtreeへ試験用の1 fileだけを足したcommitを作る（AI側の作業treeを使わない）。"""
    tree = insert_path(gh, parent + "^{tree}", TEST_PATH.split("/"), blob)
    msg = "test(lease): 削除不能の実測用の試験PR（mergeしない）\n"
    return gh.git("commit-tree", tree, "-p", parent, "-F", "-", input=msg.encode("utf-8")).stdout.decode().strip()


def insert_path(gh, tree, parts, blob):
    """treeのpathへblobを足した新しいtreeを作る（1階層ずつmktreeで組み直す）。"""
    ents = [e for e in gh.git("ls-tree", "-z", tree).stdout.decode("utf-8").split("\0") if e]
    name = parts[0]
    if len(parts) == 1:
        ents = [e for e in ents if e.split("\t", 1)[1] != name] + ["100644 blob %s\t%s" % (blob, name)]
    else:
        sub = None
        for e in ents:
            meta, n = e.split("\t", 1)
            if n == name and meta.split()[1] == "tree":
                sub = meta.split()[2]
        new = insert_path(gh, sub, parts[1:], blob) if sub else insert_path_empty(gh, parts[1:], blob)
        ents = [e for e in ents if e.split("\t", 1)[1] != name] + ["040000 tree %s\t%s" % (new, name)]
    return gh.git("mktree", input=("\n".join(sorted(ents)) + "\n").encode("utf-8")).stdout.decode().strip()


def insert_path_empty(gh, parts, blob):
    if len(parts) == 1:
        ent = "100644 blob %s\t%s" % (blob, parts[0])
    else:
        ent = "040000 tree %s\t%s" % (insert_path_empty(gh, parts[1:], blob), parts[0])
    return gh.git("mktree", input=(ent + "\n").encode("utf-8")).stdout.decode().strip()


def cmd_probe(a, gh):
    lease = gate(gh, a)
    if isinstance(lease, str):
        print("拒否: %s" % lease, file=sys.stderr)
        return 2
    probe = lease.get("probe") or {}
    tests = probe.get("test_reviews") or []
    if not probe.get("test_pr") or not lease.get("status_issue") or len([t for t in tests if t.get("id")]) != 2:
        print("拒否: lease記録に状態Issue・試験PR・試験review 2件が揃っていない（prepareとPOの試験reviewが先）", file=sys.stderr)
        return 2
    logins = C.ai_logins(lease)
    before = {c["id"] for c in G.comments_of(gh, lease["status_issue"])}
    runs, rcs = [], []
    for l in logins:
        for t in tests:
            argv = ["--login", l, "--review-id", str(t["id"]), "--lease-pr", str(a.lease_pr)] + (["--apply"] if a.apply else [])
            rc = P.main(argv)
            runs.append({"login": l, "review_id": t["id"], "rc": rc})
            rcs.append(rc)
    if not a.apply:
        print(json.dumps({"mode": "dry-run", "runs": runs}, ensure_ascii=False, indent=1))
        return 0 if not [r for r in rcs if r] else 1
    fresh = [c for c in G.comments_of(gh, lease["status_issue"]) if c["id"] not in before]
    ids = probe_result_ids(fresh, C.ai_logins(lease))
    out = dict(lease)
    pr_ = dict(out.get("probe") or {})
    pr_["activation_results"] = ids
    pr_["activation_test_reviews"] = [{"id": t["id"], "state": t["state"]} for t in tests]
    out["probe"] = pr_
    for k in C.DERIVED_LEASE_KEYS:
        out.pop(k, None)
    snap = G.probe_snapshot(gh, dict(out, activated_epoch=time.time() + 1))
    errs = C.activation_evidence_errors(snap)
    print(json.dumps({"runs": runs, "activation_results": ids, "evidence": errs or "ok", "lease": out},
                     ensure_ascii=False, indent=1))
    return 0 if not errs and not [r for r in rcs if r] else 1


def cmd_verify(a, gh):
    """READMEの「未検証」を実物で確かめる（読取りだけ。結果はevidenceとして残す）。"""
    lease = gate(gh, a)
    if isinstance(lease, str):
        print("拒否: %s" % lease, file=sys.stderr)
        return 2
    slug, login = app_login()
    out, main_sha = {}, gh.git("rev-parse", "origin/main").stdout.decode().strip()
    def rec(k, fn):
        try:
            out[k] = fn()
        except Exception as e:                                  # noqa: BLE001 実測なので理由をそのまま残す
            out[k] = {"ok": False, "detail": str(e)[:300]}
    rec("activity_api", lambda: verdict_activity(G.activity(gh, activity_origin(gh, main_sha))))
    rec("role_name", lambda: role_values(gh, lease))
    rec("protection_with_installation_token", lambda: protection_check(gh))
    rec("app_installation_permissions", lambda: verdict_app(G.app_permissions(gh, {"identity": {"apps": [slug]}}), slug))
    rec("installation_repositories", lambda: {"ok": [r.get("full_name") for r in
                                                     (gh.api("installation/repositories?per_page=100") or {}).get("repositories") or []] == [gh.repo]})
    rec("bot_login", lambda: bot_login(gh, lease, login))
    rec("credential_helper_push", lambda: branch_pushed(gh, lease))
    rec("merge_tree", lambda: merge_tree_check(gh, lease, main_sha))
    # 判定できなかった項目（okがTrueでない）は、すべて不成立として数える
    rec("delete_review_error", lambda: delete_error(gh, lease))
    rec("user_content_edits", lambda: content_edits(gh, lease))
    ng = sorted(k for k, v in out.items() if not (isinstance(v, dict) and v.get("ok") is True))
    print(json.dumps({"checked": sorted(out), "ng": ng or "none", "results": out}, ensure_ascii=False, indent=1))
    return 1 if ng else 0


def role_values(gh, lease):
    """collaborator permission APIの`role_name`が実際に返る値（AI側のloginはAppなので対象外。POのloginで確かめる）。"""
    po = (lease.get("identity") or {}).get("po")
    r = gh.api("repos/%s/collaborators/%s/permission" % (gh.repo, po)) or {} if po else {}
    return {"ok": isinstance(r.get("role_name"), str) and bool(r.get("role_name")), "login": po,
            "role_name": r.get("role_name"), "permission": r.get("permission")}


def branch_pushed(gh, lease):
    """installation tokenでのpush（credential helper経由）が成立したこと: 試験PRのheadが試験branchとして存在する。"""
    ref = gh.api("repos/%s/git/ref/heads/%s" % (gh.repo, TEST_BRANCH)) or {}
    pr = (lease.get("probe") or {}).get("test_pr")
    info = gh.api("repos/%s/pulls/%d" % (gh.repo, pr)) or {} if pr else {}
    sha = (ref.get("object") or {}).get("sha")
    return {"ok": bool(sha) and sha == (info.get("head") or {}).get("sha"), "ref": ref.get("ref"), "sha": sha}


def content_edits(gh, lease):
    """Issueの`userContentEdits`が取得できること（編集履歴の照合に使う。errorsだけの応答は不可とする）。"""
    d = gh.graphql("query($o:String!,$n:String!,$i:Int!){repository(owner:$o,name:$n){issue(number:$i){"
                   "userContentEdits(first:5){nodes{editedAt diff}}}}}",
                   o=gh.repo.split("/")[0], n=gh.repo.split("/")[1], i=lease.get("status_issue") or 0)
    nodes = (((d.get("data") or {}).get("repository") or {}).get("issue") or {}).get("userContentEdits")
    return {"ok": not d.get("errors") and isinstance((nodes or {}).get("nodes"), list),
            "errors": [e.get("message") for e in d.get("errors") or []][:3], "nodes": (nodes or {}).get("nodes")}


def activity_origin(gh, main_sha):
    """activity APIの実測に使う起点。現在のmainを起点にすると更新が0件になるため、少し前のcommitを起点にする。"""
    p = gh.git("rev-parse", "%s~20" % main_sha, check=False)
    return p.stdout.decode().strip() if p.returncode == 0 else \
        gh.git("rev-list", "--max-parents=0", main_sha).stdout.decode().split()[0]


def protection_check(gh):
    """保護設定・rulesetを1回の取得で判定する（判定と証拠を同じ観測から作る）。"""
    v = G.protection(gh)
    return {"ok": not v.get("unavailable") and isinstance(v.get("branch_protection"), dict), "value": v}


def probe_result_ids(comments, ai_logins):
    """実測の結果commentのうち、AI側identityが書いたものだけ（第三者のcommentを有効化の証拠に混ぜない）。"""
    return sorted(c["id"] for c in comments
                  if c.get("user") in (ai_logins or [])
                  and (C.lease_block(c.get("body")) or [{}])[0].get("kind") == "lease_probe_result")


def verdict_activity(act):
    """activity APIが起点まで届き、照合に要る欄（before・after・activity_type・actor）を返すこと。"""
    items = act.get("items") or []
    keys = sorted({k for it in items for k in it})
    need = {"before", "after", "activity_type", "actor"}
    return {"ok": act.get("reached_origin") is True and bool(items) and need <= set(keys),
            "keys": keys, "count": len(items), "reached_origin": act.get("reached_origin")}


def verdict_app(perms, slug):
    """installation権限が、取得できたうえで許可集合とちょうど一致し、対象repositoryを選んだinstallationであること。"""
    got = [a for a in perms or [] if a.get("slug") == slug]
    a = got[0] if got else {}
    ok = bool(got) and not a.get("unavailable") and a.get("app_slug") == slug \
        and a.get("permissions") == C.APP_PERMISSIONS_ALLOWED and a.get("repository_selection") == "selected"
    return {"ok": ok, "value": a}


def verdict_merge_tree(local_rc, local_tree, remote_tree):
    """`git merge-tree --write-tree`の結果が、GitHubが作る試験merge（`refs/pull/N/merge`）のtreeと一致すること。"""
    return {"ok": local_rc == 0 and bool(local_tree) and local_tree == remote_tree,
            "local": local_tree, "remote": remote_tree}


def bot_login(gh, lease, login):
    users = {c.get("user") for c in G.comments_of(gh, lease.get("status_issue") or 0)}
    return {"ok": login in users, "logins": sorted(u for u in users if u)}


def merge_tree_check(gh, lease, main_sha):
    pr = (lease.get("probe") or {}).get("test_pr")
    info = gh.api("repos/%s/pulls/%d" % (gh.repo, pr)) or {}
    head = (info.get("head") or {}).get("sha")
    gh.git("fetch", "-q", "origin", "+refs/pull/%d/head:refs/lease/pr-%d" % (pr, pr))
    local = gh.git("merge-tree", "--write-tree", main_sha, head, check=False)
    # GitHubが作る試験merge commit（refs/pull/N/merge）のtreeと比べる（mergeはしない）
    gh.git("fetch", "-q", "origin", "+refs/pull/%d/merge:refs/lease/prmerge-%d" % (pr, pr), check=False)
    remote = gh.git("rev-parse", "refs/lease/prmerge-%d^{tree}" % pr, check=False)
    v = verdict_merge_tree(local.returncode, local.stdout.decode().split("\n")[0][:40],
                           remote.stdout.decode().strip() if remote.returncode == 0 else None)
    v.update({"mergeable": info.get("mergeable"), "mergeable_state": info.get("mergeable_state")})
    return v


def delete_error(gh, lease):
    ids = (lease.get("probe") or {}).get("activation_results") or []
    kinds = []
    for c in G.comments_of(gh, lease.get("status_issue") or 0):
        blk = C.lease_block(c.get("body"))
        if c["id"] in ids and blk and blk[0].get("kind") == "lease_probe_result":
            kinds.append(blk[0].get("result"))
    return {"ok": bool(kinds) and set(kinds) <= {"denied", "unavailable"}, "results": sorted(set(kinds))}


def main(argv=None):
    ap = argparse.ArgumentParser(prog="leaseboot", allow_abbrev=False)
    sp = ap.add_subparsers(dest="cmd", required=True)
    for name in ("prepare", "probe", "verify"):
        p = sp.add_parser(name, allow_abbrev=False)
        p.add_argument("--lease-pr", type=int, required=True)
        p.add_argument("--apply", action="store_true")
        if name == "prepare":
            p.add_argument("--po", required=True)
    dup = G.duplicate_options(argv if argv is not None else sys.argv[1:])
    if dup:
        print("拒否: 同じoptionが2回以上ある（許可の引数を固定できない）: %s" % "、".join(dup), file=sys.stderr)
        return 2
    a = ap.parse_args(argv)
    gh = G.GH()
    try:
        return {"prepare": cmd_prepare, "probe": cmd_probe, "verify": cmd_verify}[a.cmd](a, gh)
    except G.WriteRefused as e:
        print("拒否: %s" % e, file=sys.stderr)
        return 2
    except (RuntimeError, KeyError, ValueError, OSError) as e:
        print("入力不正・内部エラー: %s" % str(e)[:300], file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
