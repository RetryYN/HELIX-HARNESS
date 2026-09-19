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
        if is_prot(f["path"]) or (f["path"] == ".gitattributes" and C.gitattributes_protected_change(f)):
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
    return res


def suspend(gh, s, reasons, note=""):
    """停止の二重保存: (1)状態領域 (2)状態Issueへのcomment。停止原因のときだけ呼ぶ。"""
    causes = [r for r in reasons if r["code"] in C.SUSPEND_CAUSES]
    if not causes:
        return
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


def cmd_admit(a, gh=None):
    gh = gh or G.GH()
    s = G.snapshot(gh, a.pr, a.context)
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
    st = G.read_state()
    st.setdefault("observed_review_ids", {})[str(a.pr)] = sorted(
        {r["id"] for r in s["reviews"] if r.get("user") == (lease.get("identity") or {}).get("po")})
    G.write_state(st)
    msg = C.receipt_message(s, res, s.get("checks"), a.context)
    sha = gh.git("commit-tree", s["merge_tree"], "-p", s["main_head"], "-p", s["pair_head"], "-F", "-",
                 input=msg.encode("utf-8")).stdout.decode().strip()
    p = gh.push_main(sha)
    if p.returncode != 0:
        print(json.dumps(dict(report, mode="apply", result="push_rejected",
                              detail=p.stderr.decode("utf-8", "replace")[:300]), ensure_ascii=False, indent=1))
        return 1   # PR単位の拒否。再試行は検査からやり直す
    posted = True
    try:
        gh.comment(a.pr, "```helix-lease\n%s\n```" % json.dumps(
            {"kind": "merge_result", "lease_id": C.LEASE_ID, "pr": a.pr, "merge_commit": sha,
             "parents": [s["main_head"], s["pair_head"]], "tree": s["merge_tree"]}, ensure_ascii=False, sort_keys=True))
    except RuntimeError:
        posted = False
    after, merged = read_after(gh, s, sha, s["merge_tree"], a.pr)
    ra = C.evaluate_after(after, sha, s["merge_tree"], (s["main_head"], s["pair_head"]), merged, posted)
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
    print(json.dumps({"issue": a.issue, "mode": "apply", "result": "synced" if not ra else "mismatch", "read_after": ra,
                      "receipt": {"lease_id": C.LEASE_ID, "source_commit": snap["source_commit"],
                                  "mapping": [a.issue, snap["source_path"]], "before_sha256": snap["remote_body_sha256"],
                                  "after_sha256": after.get("remote_body_sha256")}}, ensure_ascii=False, indent=1))
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
                              ("PJ-remote-edited", {"remote_body_sha256": "b" * 64}, "projection_mismatch")):
        r = C.evaluate_sync(dict(base, **patch))
        rows.append({"id": name, "ok": code in [x["code"] for x in r]})
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
