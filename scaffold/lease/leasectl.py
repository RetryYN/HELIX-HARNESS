#!/usr/bin/env python3
"""leasectl — Capability Lease（CAPLEASE-BOOT-01）のexecutor command。

  python3 scaffold/lease/leasectl.py admit PR --context ID [--apply]   # merge_executor
  python3 scaffold/lease/leasectl.py sync ISSUE --context ID [--apply] # projection_sync
  python3 scaffold/lease/leasectl.py status                            # leaseの状態と運搬範囲
  python3 scaffold/lease/leasectl.py selftest [--record]               # negative caseと書込み境界の自己検査

既定はdry-runで、判定だけを報告しGitHubへ何も書かない。書き込むのは`--apply`を付け、拒否理由が0件のときだけである。
書込みはmainへの通常push、対象PRへの`merge_result`、状態Issueへの停止comment（停止原因のときだけ）、
projection_syncの対象Issue本文に限る。判断の意味の正本は packet（leasecore.PACKET）である。
終了code: 0 成立（dry-runでは成立見込み） / 1 拒否 / 2 入力不正・内部エラー
"""
import argparse, glob, json, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import leasecore as C   # noqa: E402
import leasegh as G     # noqa: E402

EVIDENCE = os.path.join(os.path.dirname(HERE), "evidence", "lease-selftest.json")


def protected_in_diff(s):
    is_prot = C.protected_paths(s)
    out = []
    for f in s["diff"]["files"]:
        if is_prot(f["path"]) or (C.is_gitattributes(f["path"]) and C.gitattributes_protected_change(f)):
            out.append(f["path"])
    return out


def judge(gh, s, recovery=None):
    """codeを実行しない条件を先に判定し、すべて成立したときだけ隔離環境で(a)(b)を実行して再判定する。"""
    res = C.evaluate(s, recovery=recovery)
    if res["run_checks"] and s.get("merge_tree"):
        prot = protected_in_diff(s)
        s["checks"] = {"a": G.run_checks(gh, s["merge_tree"]),
                       "b": G.run_checks(gh, s["merge_tree"], overlay_main=s["main_head"], protected=prot) if prot
                       else None}
        if s["checks"]["b"] is None:
            s["checks"]["b"] = dict(s["checks"]["a"], summary="(b)=(a)（保護面の変更なし）")
        res = C.evaluate(s, recovery=recovery)
    s["health_lease"] = res.get("health_lease")   # 付け直しを運ぶmergeは、merge後も新しい値で照合する
    return res


def observe(s, key, ids):
    """観測したID（PO review、再bootstrapの判断comment）を状態領域へ追記する。dry-runや拒否でも追記し、消さない
    （packet「削除への対処」(ii)）。"""
    if not ids:
        return
    st = G.read_state()
    cur = st.setdefault(key, {}).setdefault(str(s["pr"]["number"]), [])
    st[key][str(s["pr"]["number"])] = sorted(set(cur) | set(ids))
    G.write_state(st)


def suspend(gh, s, reasons, note=""):
    """停止の二重保存: (1)状態領域 (2)状態Issueへのcomment。停止原因のときだけ呼ぶ。"""
    causes = [r for r in reasons if r["code"] in C.SUSPEND_CAUSES]
    if not causes or not (s.get("lease") or {}).get("activated_at"):
        return   # 有効化前は基準値が無く、停止を記録しない（有効化後へ持ち越さない）
    st = G.read_state()
    st["suspended"] = {"at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "reasons": causes, "note": note}
    G.write_state(st)
    si = (s.get("lease") or {}).get("status_issue")
    if si:
        body = "```helix-lease\n%s\n```\n\n%s" % (json.dumps({"kind": "lease_state", "lease_state": "suspended",
                                                            "lease_id": C.LEASE_ID, "reasons": causes}, ensure_ascii=False,
                                                           sort_keys=True), note)
        gh.comment(si, body)


def read_after(gh, s, pushed, tree, pr, recovery=None, degraded=None, wait=600):
    """merge後のread-after。activityへの反映とmerged表示は最大10分待つ。"""
    deadline = time.time() + wait
    merged, after = False, None
    while True:
        gh.git("fetch", "-q", "origin", "main")
        after = G.snapshot_after(gh, pr, s, pushed)
        merged = after.get("pr_merged")
        chain_ok = after.get("activity_has_push")
        if (merged and chain_ok) or time.time() > deadline:
            break
        time.sleep(20)
    return after, merged


def post_merge_result(gh, s, sha, ra, recovery=None):
    """read-afterの後に`merge_result`（結果・SHA・親・read-after結果）を置く。投稿の失敗はread-after不一致として返す。"""
    try:
        gh.comment(s["pr"]["number"], C.merge_result_body(s, sha, ra, recovery=recovery))
        return []
    except RuntimeError:
        return [C.R("post_merge_mismatch", "merge_resultの投稿に失敗")]


def cmd_admit(a, gh=None):
    gh = gh or G.GH()
    s = G.snapshot(gh, a.pr, a.context)
    po = ((s.get("lease") or {}).get("identity") or {}).get("po")
    if po and (s.get("lease") or {}).get("activated_at"):
        observe(s, "observed_review_ids", [r["id"] for r in s["reviews"] if r.get("user") == po])
    res = judge(gh, s)
    report = {"pr": a.pr, "pair": [s["pair_base"], s["pair_head"]], "profile": res["profile"], "scope": res["scope"],
              "reasons": res["reasons"], "checks": s.get("checks")}
    if not a.apply:
        print(json.dumps(dict(report, mode="dry-run"), ensure_ascii=False, indent=1))
        return 1 if res["reasons"] else 0
    lease = s.get("lease") or {}
    gh.w = G.Writes({("push_main", "main"), ("comment", a.pr), ("comment", lease.get("status_issue"))})
    if res["reasons"]:
        suspend(gh, s, res["reasons"], "merge前の検査で停止原因を検出（PR #%d）" % a.pr)
        print(json.dumps(dict(report, mode="apply", result="refused"), ensure_ascii=False, indent=1))
        return 1
    msg = C.receipt_message(s, res, s.get("checks"), a.context)
    sha = gh.git("commit-tree", s["merge_tree"], "-p", s["main_head"], "-p", s["pair_head"], "-F", "-",
                 input=msg.encode("utf-8")).stdout.decode().strip()
    p = gh.push_main(sha)
    if p.returncode != 0:
        print(json.dumps(dict(report, mode="apply", result="push_rejected",
                              detail=p.stderr.decode("utf-8", "replace")[:300]), ensure_ascii=False, indent=1))
        return 1   # PR単位の拒否。再試行は検査からやり直す
    after, merged = read_after(gh, s, sha, s["merge_tree"], a.pr)
    ra = C.evaluate_after(after, sha, s["merge_tree"], (s["main_head"], s["pair_head"]), merged, True)
    ra += post_merge_result(gh, s, sha, ra)
    if ra:
        suspend(gh, s, ra, "merge後のread-after不一致（PR #%d、merge %s）" % (a.pr, sha))
    print(json.dumps(dict(report, mode="apply", result="merged" if not ra else "merged_unverified", merge_commit=sha,
                          read_after=ra), ensure_ascii=False, indent=1))
    return 0 if not ra else 1


def cmd_sync(a, gh=None):
    gh = gh or G.GH()
    snap = G.sync_snapshot(gh, a.issue)
    reasons = C.evaluate_sync(snap)
    if reasons or not a.apply:
        print(json.dumps({"issue": a.issue, "mode": "apply" if a.apply else "dry-run", "reasons": reasons},
                         ensure_ascii=False, indent=1))
        if reasons and a.apply:
            gh.w = G.Writes({("comment", (snap.get("lease") or {}).get("status_issue"))})
            suspend(gh, snap, reasons, "projection_syncの書込み前照合の不一致（Issue #%d）" % a.issue)
        return 1 if reasons else 0
    gh.w = G.Writes({("issue_body", a.issue), ("comment", (snap.get("lease") or {}).get("status_issue"))})
    gh.issue_body(a.issue, snap["source_text"])
    after = G.sync_snapshot(gh, a.issue, after=True)
    ra = C.evaluate_sync_after(after, snap["source_sha256"], snap["remote_body_sha256"], snap["state"], snap["labels"])
    if ra:
        suspend(gh, snap, ra, "projection_syncのread-after不一致（Issue #%d）" % a.issue)
    receipt = {"lease_id": C.LEASE_ID, "issue": a.issue, "source_commit": snap["source_commit"],
               "mapping": [a.issue, snap["source_path"]], "before_sha256": snap["remote_body_sha256"],
               "after_sha256": after.get("remote_body_sha256"),
               "written_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
    receipt["receipt_id"] = C.sha256_text(json.dumps(receipt, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
    # このreceiptがmainへ取り込まれるまで、同じIssueへ次の書込みをしない（packet 書込み前の照合）
    st = G.read_state()
    st.setdefault("pending_sync", {})[str(a.issue)] = receipt["receipt_id"]
    G.write_state(st)
    print(json.dumps({"issue": a.issue, "mode": "apply", "result": "synced" if not ra else "mismatch", "read_after": ra,
                      "receipt": receipt}, ensure_ascii=False, indent=1))
    return 0 if not ra else 1


def cmd_status(a, gh=None):
    gh = gh or G.GH()
    gh.git("fetch", "-q", "origin", "main")
    lease = G.load_lease(gh, "origin/main")
    print(json.dumps({"lease": {k: lease.get(k) for k in ("lease_id", "activated_at", "expires_at", "revoked_at",
                                                          "independence", "status_issue")},
                      "state_area": G.read_state()}, ensure_ascii=False, indent=1))
    return 0


# ---------- 自己検査 ----------
def run_cases():
    import leasefixtures as F
    rows, fail = [], 0
    for p in sorted(glob.glob(os.path.join(HERE, "cases", "*.json"))):
        for c in json.load(open(p, encoding="utf-8")):
            s = F.apply_patch(F.BASES[c["base"]](), c["patch"])
            r = C.evaluate(s, recovery=c.get("mode"))
            codes = [x["code"] for x in r["reasons"]]
            ok = (not codes) if not c["expect"] else all(e in codes for e in c["expect"])
            fail += 0 if ok else 1
            rows.append({"id": c["id"], "ok": ok, "expect": c["expect"], "got": codes})
    return rows, fail


def collector_tests():
    """収集層の自己検査。使い捨てのlocal git repositoryだけを使い、GitHubへ触れない。"""
    import shutil, subprocess, tempfile
    rows = []
    d = tempfile.mkdtemp(prefix="lease-selftest-")
    try:
        env = dict(os.environ, GIT_AUTHOR_NAME="t", GIT_AUTHOR_EMAIL="t@example.invalid", GIT_COMMITTER_NAME="t",
                   GIT_COMMITTER_EMAIL="t@example.invalid", GIT_CONFIG_GLOBAL="/dev/null", GIT_CONFIG_NOSYSTEM="1")

        class Local(G.Runner):
            def run(self, args, input=None, cwd=None, env_=None, check=True):
                p = subprocess.run(args, input=input, cwd=d, env=env, capture_output=True)
                if check and p.returncode != 0:
                    raise RuntimeError(p.stderr.decode("utf-8", "replace"))
                return p
        gh = G.GH(runner=Local(), writes=G.Writes())

        def put(path, text):
            os.makedirs(os.path.join(d, os.path.dirname(path)), exist_ok=True)
            with open(os.path.join(d, path), "w", encoding="utf-8") as f:
                f.write(text)

        def commit(msg):
            gh.git("add", "-A")
            gh.git("commit", "-q", "--allow-empty", "-m", msg)
            return gh.git("rev-parse", "HEAD").stdout.decode().strip()
        gh.git("init", "-q", "-b", "main")
        put("docs/old.md", "x\n")
        base = commit("base")
        put("docs/governance/decisions/承認.md", "---\ndecision: approve\ndecider_role: PO\n---\n")
        put(".github/workflows/同期.yml", "on: push\n")
        gh.git("mv", "docs/old.md", "docs/新.md")
        head = commit("change")
        fs = {f["path"]: f for f in G.diff_files(gh, base, head)}
        rows.append({"id": "CL-nonascii-path", "ok": "docs/governance/decisions/承認.md" in fs and ".github/workflows/同期.yml" in fs
                     and "decision: approve" in fs["docs/governance/decisions/承認.md"]["added"]
                     and C.auth_path("docs/governance/decisions/承認.md")})
        rows.append({"id": "CL-rename-split", "ok": fs.get("docs/old.md", {}).get("status") == "D"
                     and fs.get("docs/新.md", {}).get("status") == "A"})
        rows.append({"id": "CL-ls-tree-nonascii", "ok": G.ls_tree(gh, head, "docs/governance/decisions/")
                     == ["docs/governance/decisions/承認.md"]})
        # 起点以前に入ったrecordは、messageにlease mergeの記録を書いてもlease運搬として扱わない
        put("docs/governance/decisions/r1.md", "x\n")
        fake = commit("lease_receipt: %s\ndecision_source: review" % C.LEASE_ID)
        origin = commit("origin")
        rows.append({"id": "CL-carried-before-origin", "ok": not G.lease_carried(gh, origin, "docs/governance/decisions/r1.md", origin)})
        rows.append({"id": "CL-carried-no-origin", "ok": not G.lease_carried(gh, origin, "docs/governance/decisions/r1.md", None)})
        # 起点より後でも、親2つ・固定形のmessage・executor側loginのmerge_resultが揃わなければlease運搬として扱わない
        lease_t = {"independence": "accept_bootstrap_risk", "identity": {"ai": "helix-ai", "po": "po-human"}}
        msg = "Merge pull request #77 via Capability Lease\n\nlease_receipt: %s\nlease_id: %s\npr: 77\ndecision_source: review" % (
            C.LEASE_ID, C.LEASE_ID)
        rows.append({"id": "CL-carried-not-merge", "ok": not G.lease_carried(
            gh, origin, "docs/governance/decisions/r1.md", base, lease_t, comments_fn=lambda n: [])})
        gh.git("checkout", "-q", "-b", "side")
        put("docs/governance/decisions/r2.md", "y\n")
        commit("record")
        gh.git("checkout", "-q", "main")
        gh.git("merge", "-q", "--no-ff", "side", "-m", msg)
        m = gh.git("rev-parse", "HEAD").stdout.decode().strip()

        def res(user, sha):
            return [{"id": 1, "user": user, "body": "```helix-lease\n%s\n```" % json.dumps({"kind": "merge_result", "merge_commit": sha})}]
        r2 = "docs/governance/decisions/r2.md"
        rows.append({"id": "CL-carried-verified-merge", "ok": G.lease_carried(gh, m, r2, origin, lease_t, comments_fn=lambda n: res("helix-ai", m))})
        rows.append({"id": "CL-carried-no-merge-result", "ok": not G.lease_carried(gh, m, r2, origin, lease_t, comments_fn=lambda n: [])})
        rows.append({"id": "CL-carried-result-by-other", "ok": not G.lease_carried(gh, m, r2, origin, lease_t,
                                                                                   comments_fn=lambda n: res("po-human", m))})
        rows.append({"id": "CL-carried-before-origin-merge", "ok": not G.lease_carried(gh, m, r2, m, lease_t,
                                                                                       comments_fn=lambda n: res("helix-ai", m))})
        # 人間のUI mergeの既定messageにreceipt行が混じっても、固定位置の形でなければlease mergeでない
        gh.git("checkout", "-q", "-b", "side2")
        put("docs/governance/decisions/r3.md", "z\n")
        commit("r3")
        gh.git("checkout", "-q", "main")
        gh.git("merge", "-q", "--no-ff", "side2", "-m", "Merge pull request #78 from x/side2\n\nlease_receipt: %s\npr: 78\ndecision_source: review" % C.LEASE_ID)
        m3 = gh.git("rev-parse", "HEAD").stdout.decode().strip()
        rows.append({"id": "CL-carried-ui-merge-message", "ok": not G.lease_carried(gh, m3, "docs/governance/decisions/r3.md", origin,
                                                                                    lease_t, comments_fn=lambda n: res("helix-ai", m3))})
    finally:
        shutil.rmtree(d, ignore_errors=True)   # 自分がmkdtempで作った使い捨てdirectoryだけを消す
    rows.append({"id": "CL-sha-mentions", "ok": C.sha256_mentions("a: " + "A" * 64 + " b: " + "1" * 65) == {"a" * 64}})
    lr = {"last_resume_at": "2026-09-20T10:00:00Z"}
    rows.append({"id": "CL-local-suspend-resumed", "ok": not G.local_suspended({"suspended": {"at": "2026-09-20T09:00:00Z"}}, lr)
                 and G.local_suspended({"suspended": {"at": "2026-09-20T11:00:00Z"}}, lr)
                 and G.local_suspended({"suspended": {"at": "2026-09-20T09:00:00Z"}}, {})})
    return rows


def run_boundary_tests():
    """書込み境界の自己検査（偽のrunnerで、GitHubへ何も送らない）。"""
    import leasefixtures as F
    rows = []

    class Fake(G.Runner):
        def __init__(self):
            self.calls = []

        def run(self, args, input=None, cwd=None, env=None, check=True):
            self.calls.append(args)
            raise AssertionError("外部commandを呼んだ: %s" % args[:3])

    def expect_refused(name, fn):
        try:
            fn()
            rows.append({"id": name, "ok": False})
        except G.WriteRefused:
            rows.append({"id": name, "ok": True})
    fk = Fake()
    gh = G.GH(runner=fk, writes=G.Writes())                 # dry-runは許可リストが空
    expect_refused("BD-dryrun-push", lambda: gh.push_main("0" * 40))
    expect_refused("BD-dryrun-comment", lambda: gh.comment(2001, "x"))
    gh2 = G.GH(runner=fk, writes=G.Writes({("comment", 2001)}))   # 投稿commandは対象PRだけ
    expect_refused("BD-post-other-pr", lambda: gh2.comment(2002, "x"))
    expect_refused("BD-post-issue-body", lambda: gh2.issue_body(2001, "x"))
    expect_refused("BD-post-push", lambda: gh2.push_main("0" * 40))
    gh3 = G.GH(runner=fk, writes=G.Writes({("comment", 3000)}))   # 状態commentは状態Issueだけ
    expect_refused("BD-state-other-issue", lambda: gh3.comment(3001, "x"))
    rows.append({"id": "BD-no-external-call", "ok": not fk.calls})
    # 停止原因以外では状態commentを書かない
    wrote = []

    class G4:
        w = G.Writes({("comment", 3000)})

        def comment(self, issue, body):
            wrote.append(issue)
    st_path = os.environ.get("HELIX_LEASE_STATE")
    import tempfile
    d = tempfile.mkdtemp(prefix="lease-selftest-")
    os.environ["HELIX_LEASE_STATE"] = os.path.join(d, "state.json")
    try:
        s = F.base_rf()
        suspend(G4(), s, [C.R("review_findings_open")])
        rows.append({"id": "BD-no-state-comment-for-pr-reject", "ok": not wrote and not os.path.exists(os.environ["HELIX_LEASE_STATE"])})
        suspend(G4(), s, [C.R("protection_baseline_changed")])
        st = G.read_state()
        rows.append({"id": "BD-suspend-both-stores", "ok": wrote == [3000] and bool(st.get("suspended"))})
    finally:
        if st_path is None:
            os.environ.pop("HELIX_LEASE_STATE", None)
        else:
            os.environ["HELIX_LEASE_STATE"] = st_path
        import shutil
        shutil.rmtree(d, ignore_errors=True)
    # merge後のread-after
    s = F.base_rf()
    after = dict(s, main_head="f" * 40, main_tree="t" * 40, main_parents=[F.B, F.H], stale=0,
                 activity={"reached_origin": True, "items": [{"before": F.B, "after": "f" * 40, "activity_type": "push",
                                                               "actor": F.AI, "commit_message": "lease_receipt: %s" % C.LEASE_ID,
                                                               "is_merge": True}]})
    ok = C.evaluate_after(after, "f" * 40, "t" * 40, (F.B, F.H), True, True)
    rows.append({"id": "RA-ok", "ok": not ok})
    for name, patch, merged, posted in (
            ("RA-sha", {"main_head": "e" * 40}, True, True), ("RA-tree", {"main_tree": "u" * 40}, True, True),
            ("RA-parents", {"main_parents": [F.H, F.B]}, True, True), ("RA-stale", {"stale": 1}, True, True),
            ("RA-not-merged", {}, False, True), ("RA-result-failed", {}, True, False),
            ("RA-activity-missing", {"activity": {"reached_origin": True, "items": []}}, True, True),
            ("RA-protection", {"protection": {"branch_protection": None, "rulesets": []}}, True, True)):
        r = C.evaluate_after(dict(after, **patch), "f" * 40, "t" * 40, (F.B, F.H), merged, posted)
        rows.append({"id": name, "ok": bool(r) and all(x["code"] == "post_merge_mismatch" for x in r)})
    # projection_sync
    base = {"lease": dict(F.base_rf()["lease"], projection={"mapping": {"1813": "docs/x/1813.md"}}), "issue": 1813,
            "source_path": "docs/x/1813.md", "last_receipt": {"on_main": True, "written_sha256": "a" * 64},
            "remote_body_sha256": "a" * 64, "now_epoch": F.NOW, "status_comments": F.base_rf()["status_comments"],
            "test_review_ids_present": [9001, 9002]}
    rows.append({"id": "PJ-ok", "ok": not C.evaluate_sync(base)})
    for name, patch, code in (("PJ-mapping", {"issue": 1814}, "projection_mapping_missing"),
                              ("PJ-receipt-pending", {"last_receipt": {"on_main": False}}, "projection_receipt_pending"),
                              ("PJ-remote-edited", {"remote_body_sha256": "b" * 64}, "projection_mismatch"),
                              ("PJ-suspended-local", {"suspended_local": True}, "lease_inactive"),
                              ("PJ-suspended-issue", {"suspended_issue": True}, "lease_inactive")):
        r = C.evaluate_sync(dict(base, **patch))
        rows.append({"id": name, "ok": code in [x["code"] for x in r]})
    # 状態Issueの停止commentの解釈（admitとsyncで共有する）
    sc = base["status_comments"] + [{"id": 7777, "user": F.AI, "created_epoch": F.NOW - 10,
                                     "body": "```helix-lease\n%s\n```" % json.dumps({"kind": "lease_state", "lease_state": "suspended"})}]
    rows.append({"id": "PJ-status-issue-parse", "ok": C.suspended_in_status_issue(sc, base["lease"], lambda t: 0) and
                 not C.suspended_in_status_issue(base["status_comments"], base["lease"], lambda t: 0) and
                 not C.suspended_in_status_issue(sc, dict(base["lease"], last_resume_at="x"), lambda t: F.NOW)})
    rows += collector_tests()
    # 実測の修理はlease記録を欄単位で比べる（probe欄以外の変更を含めば修理でない）
    fm = {"approved_targets": [{"path": C.LEASE_RECORD}]}
    lb = {"probe": {"test_pr": 1}, "identity": {"po": "a"}}
    rows.append({"id": "PB-repair-field-level", "ok": C.is_probe_repair({"lease": {}, "lease_record_before": lb,
                                                                         "lease_record_after": dict(lb, probe={"test_pr": 2})}, fm)
                 and not C.is_probe_repair({"lease": {}, "lease_record_before": lb,
                                            "lease_record_after": dict(lb, probe={"test_pr": 2}, identity={"po": "b"})}, fm)})
    # activityの各更新で、更新後commitの第1親が更新前のHEADであること
    it = {"before": F.B, "after": "e" * 40, "activity_type": "push", "actor": F.AI, "is_merge": True,
          "commit_message": "lease_receipt: %s" % C.LEASE_ID}
    sn = {"lease": F.base_rf()["lease"], "main_head": "e" * 40, "activity_origin": F.B}
    rows.append({"id": "HL-first-parent", "ok": C.activity_chain_ok(dict(sn, activity={"reached_origin": True, "items": [dict(it, first_parent=F.B)]}))[0]
                 and not C.activity_chain_ok(dict(sn, activity={"reached_origin": True, "items": [dict(it, first_parent="9" * 40)]}))[0]})
    rows.append({"id": "PT-nested-gitattributes", "ok": C.is_gitattributes("docs/.gitattributes") and C.is_gitattributes(".gitattributes")
                 and not C.is_gitattributes("docs/x.gitattributes")})
    # 解除時刻はlease記録がmainへ入った時刻を上限にする
    to = lambda t: {"past": 100.0, "future": 10 ** 12}.get(t)
    rows.append({"id": "LS-resume-capped", "ok": C.resume_epoch({"last_resume_at": "future", "record_committed_epoch": 200.0}, to) == 200.0
                 and C.resume_epoch({"last_resume_at": "past", "record_committed_epoch": 200.0}, to) == 100.0
                 and C.suspended_in_status_issue([{"created_epoch": 300.0, "body": "```helix-lease\n%s\n```" % json.dumps(
                     {"kind": "lease_state", "lease_state": "suspended"})}], {"last_resume_at": "future", "record_committed_epoch": 200.0}, to)})
    # merge_resultはread-afterの後に、その結果を含めて置く
    posted = []

    class PostGH:
        def comment(self, n, body):
            posted.append((n, body))
    snapm = dict(F.base_rf(), merge_tree="t" * 40)
    mm = [C.R("post_merge_mismatch", "treeが検査したtreeと不一致")]
    extra = post_merge_result(PostGH(), snapm, "f" * 40, mm)
    blk = C.lease_block(posted[-1][1])[0] if posted else {}
    rows.append({"id": "MR-body-read-after", "ok": not extra and posted[-1][0] == snapm["pr"]["number"]
                 and blk.get("read_after") == {"ok": False, "mismatches": mm} and blk.get("parents") == [F.B, F.H]
                 and blk.get("result") == "merged_read_after_mismatch"})

    class FailGH:
        def comment(self, n, body):
            raise RuntimeError("x")
    rows.append({"id": "MR-post-failure-is-mismatch", "ok": [x["code"] for x in post_merge_result(FailGH(), snapm, "f" * 40, [])]
                 == ["post_merge_mismatch"]})
    # 起点の付け直し: 新しい起点から集めたactivityで照合する（旧起点からの連鎖が人間のpushで切れていても通る）
    ho = dict(F.base_rf()["lease"], origin_main="e" * 40)
    snap = {"lease": F.base_rf()["lease"], "main_head": "e" * 40, "activity_origin": F.B,
            "activity": {"reached_origin": True, "items": [{"before": F.B, "after": "e" * 40, "activity_type": "push",
                                                             "actor": "someone", "commit_message": "", "is_merge": False}]}}
    rows.append({"id": "HL-reorigin-new-activity", "ok": C.activity_chain_ok(
        dict(snap, activity_by_origin={"e" * 40: {"reached_origin": True, "items": []}}), lease=ho)[0]})
    rows.append({"id": "HL-reorigin-needs-new-activity", "ok": not C.activity_chain_ok(snap, lease=ho)[0]})
    rows.append({"id": "HL-old-origin-still-checked", "ok": not C.activity_chain_ok(snap)[0]})
    aft = {"remote_body_sha256": "c" * 64, "state": "OPEN", "labels": ["x"], "previous_edit_sha256": "a" * 64}
    rows.append({"id": "PJ-after-ok", "ok": not C.evaluate_sync_after(aft, "c" * 64, "a" * 64, "OPEN", ["x"])})
    rows.append({"id": "PJ-after-history", "ok": bool(C.evaluate_sync_after(dict(aft, previous_edit_sha256="d" * 64), "c" * 64, "a" * 64, "OPEN", ["x"]))})
    rows.append({"id": "PJ-after-label", "ok": bool(C.evaluate_sync_after(dict(aft, labels=[]), "c" * 64, "a" * 64, "OPEN", ["x"]))})
    return rows


def cmd_selftest(a):
    rows, fail = run_cases()
    b = run_boundary_tests()
    fail += sum(1 for r in b if not r["ok"])
    for r in rows + b:
        if not r["ok"]:
            print("NG", r["id"], r.get("expect", ""), r.get("got", ""))
    print("cases=%d boundary=%d fail=%d" % (len(rows), len(b), fail))
    if a.record:
        import hashlib
        tool = hashlib.sha256(b"".join(open(os.path.join(HERE, f), "rb").read() for f in
                                       sorted(os.listdir(HERE)) if f.endswith(".py"))).hexdigest()
        cases = hashlib.sha256(b"".join(open(p, "rb").read() for p in sorted(glob.glob(os.path.join(HERE, "cases", "*.json"))))).hexdigest()
        with open(EVIDENCE, "w", encoding="utf-8") as f:
            json.dump({"evidence_kind": "scaffold", "tool_sha256": tool, "cases_sha256": cases, "cases": len(rows),
                       "boundary": len(b), "fail": fail}, f, ensure_ascii=False, indent=1)
            f.write("\n")
    return 1 if fail else 0


def main(argv=None):
    ap = argparse.ArgumentParser(prog="leasectl")
    sp = ap.add_subparsers(dest="cmd", required=True)
    p = sp.add_parser("admit"); p.add_argument("pr", type=int); p.add_argument("--context", required=True); p.add_argument("--apply", action="store_true")
    p = sp.add_parser("sync"); p.add_argument("issue", type=int); p.add_argument("--context", required=True); p.add_argument("--apply", action="store_true")
    sp.add_parser("status")
    p = sp.add_parser("selftest"); p.add_argument("--record", action="store_true")
    a = ap.parse_args(argv)
    try:
        return {"admit": cmd_admit, "sync": cmd_sync, "status": cmd_status, "selftest": cmd_selftest}[a.cmd](a)
    except G.WriteRefused as e:
        print("拒否: %s" % e, file=sys.stderr)
        return 2
    except (RuntimeError, KeyError, ValueError) as e:
        print("入力不正・内部エラー: %s" % e, file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
