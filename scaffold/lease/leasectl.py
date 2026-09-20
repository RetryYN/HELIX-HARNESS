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
        return [dict(C.R("post_merge_mismatch", "merge_resultの投稿に失敗"), item="merge_result_post")]


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
    """leaseの状態と、削除不能の実測の判定（packet: 実測は有効化の条件）。--lease-prは有効化前にPRのlease記録を読む。"""
    gh = gh or G.GH()
    # POが有効化前の実測の確認に使う出力。起動条件（置き場所・-I等）を欠けば、照合先の取得（network）へ進まない
    if a.lease_pr:   # 有効化前に読む先も、実行環境が固定した対象PRのlease記録だけに限る
        miss = G.target_pr_mismatch(a.lease_pr)
        if miss:
            print("拒否: %s" % miss, file=sys.stderr)
            return 2
    integrity = G.self_integrity(gh, None)
    if integrity:
        print(json.dumps({"integrity": integrity, "runner": G.runner_info()}, ensure_ascii=False, indent=1))
        return 2
    lease = G.lease_at(gh, a.lease_pr)
    integrity = G.self_integrity(gh, "refs/lease/pr-%d" % a.lease_pr if a.lease_pr else "origin/main")
    psn = G.probe_snapshot(gh, lease) if lease.get("status_issue") else None
    ps, pd = C.probe_status(psn) if psn else ("unconfigured", "状態Issueが未設定")
    # 有効化の値（activated_at・activation_results等）を記入した後は、executorと同じ有効化の検査も出す（POの有効化前の確認）
    activation = (C.activation_gaps(lease) + (C.activation_evidence_errors(psn) if psn else [])) if lease.get("activated_at") else None
    if activation is not None and a.lease_pr and C.activation_pair_differs(lease):
        # 有効化前（--lease-prのlease記録）は、有効化時点の試験reviewが現在の登録と同じであるはず
        activation.append("probe.activation_test_reviewsが現在のprobe.test_reviewsと一致しない")
    print(json.dumps({"lease": {k: lease.get(k) for k in ("lease_id", "activated_at", "expires_at", "revoked_at",
                                                          "independence", "status_issue", "origin_main")},
                      "identity": lease.get("identity"), "probe_registered": {
                          k: (lease.get("probe") or {}).get(k) for k in
                          ("test_pr", "test_reviews", "activation_results", "activation_test_reviews")},
                      "baseline_diff": C.baseline_diff(lease, G.protection(gh)) or "一致",
                      "probe": {"status": ps, "detail": pd}, "integrity": integrity or "ok", "runner": G.runner_info(),
                      "activation": "not_set" if activation is None else (activation or "ok"),
                      "state_area": G.read_state()}, ensure_ascii=False, indent=1))
    return 0 if ps == "ok" and not integrity and not activation else 1


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
        # 解除時刻の上限は、lease記録を変えたfirst-parent上のcommit（merge commit）の時刻。PR側commitの時刻は使わない
        gh.git("checkout", "-q", "-b", "side3")
        put(C.LEASE_RECORD, "{}\n")
        env["GIT_COMMITTER_DATE"] = "2099-01-01T00:00:00Z"
        commit("future-dated")
        del env["GIT_COMMITTER_DATE"]
        gh.git("checkout", "-q", "main")
        gh.git("merge", "-q", "--no-ff", "side3", "-m", "merge")
        ce = G.lease_record_committed_epoch(gh, "HEAD")
        rows.append({"id": "CL-resume-cap-first-parent", "ok": ce is not None and ce < 4000000000})
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
    # executorのgit環境はreplace objectsを読まない（AI側が共有.gitに置いたgit replaceで差分を隠せない）
    d2 = tempfile.mkdtemp(prefix="lease-replace-")
    try:
        e2 = dict(os.environ, GIT_AUTHOR_NAME="t", GIT_AUTHOR_EMAIL="t@example.invalid", GIT_COMMITTER_NAME="t",
                  GIT_COMMITTER_EMAIL="t@example.invalid", GIT_CONFIG_GLOBAL=os.devnull, GIT_CONFIG_NOSYSTEM="1")
        g2 = lambda *a: subprocess.run(["git"] + list(a), cwd=d2, env=e2, capture_output=True)
        g2("init", "-q", "-b", "main")
        g2("commit", "-q", "--allow-empty", "-m", "real")
        real = g2("rev-parse", "HEAD").stdout.decode().strip()
        with open(os.path.join(d2, "p.py"), "w") as f:
            f.write("x\n")
        g2("add", "p.py")
        g2("commit", "-q", "-m", "fake")
        fake = g2("rev-parse", "HEAD").stdout.decode().strip()
        g2("replace", real, fake)
        seen = g2("diff", "--name-only", real, fake).stdout.decode().split()
        iso = subprocess.run(["git", "--no-replace-objects", "diff", "--name-only", real, fake], cwd=d2,
                             env=G.isolated_git_env(), capture_output=True).stdout.decode().split()
        rows.append({"id": "CL-no-replace-objects", "ok": seen == [] and iso == ["p.py"]
                     and G.isolated_git_env().get("GIT_NO_REPLACE_OBJECTS") == "1"
                     and not [k for k in G.isolated_git_env() if k.startswith("GIT_") and k not in (
                         "GIT_CONFIG_NOSYSTEM", "GIT_CONFIG_GLOBAL", "GIT_NO_REPLACE_OBJECTS", "GIT_TERMINAL_PROMPT",
                         "GIT_AUTHOR_NAME", "GIT_AUTHOR_EMAIL", "GIT_COMMITTER_NAME", "GIT_COMMITTER_EMAIL")]})
        # identを持たないuser（GECOS空・global設定なし）でもcommit-treeが動く
        empty = subprocess.run(["git", "commit-tree", real + "^{tree}", "-m", "x"], cwd=d2, capture_output=True,
                               env=dict(G.isolated_git_env(), HOME=d2))
        noid = subprocess.run(["git", "commit-tree", real + "^{tree}", "-m", "x"], cwd=d2, capture_output=True,
                              env={k: v for k, v in G.isolated_git_env().items() if not k.startswith(("GIT_AUTHOR", "GIT_COMMITTER"))} | {"HOME": d2})
        rows.append({"id": "CL-commit-ident", "ok": empty.returncode == 0 and noid.returncode != 0
                     and b"empty ident" in noid.stderr + noid.stdout})
        # HOME配下のXDG attributes（export-ignore）は、executorのgit呼出し（core.attributesFile=/dev/null）では効かない
        xdg = os.path.join(d2, "xdg")
        os.makedirs(os.path.join(xdg, "git"))
        with open(os.path.join(xdg, "git", "attributes"), "w") as f:
            f.write("p.py export-ignore\n")
        e3 = dict(e2, XDG_CONFIG_HOME=xdg)
        arc = lambda *pre: subprocess.run(["git"] + list(pre) + ["archive", "--format=tar", fake], cwd=d2, env=e3,
                                          capture_output=True).stdout
        names = lambda b: subprocess.run(["tar", "-t"], input=b, capture_output=True).stdout.decode().split()
        rows.append({"id": "CL-no-xdg-attributes", "ok": "p.py" not in names(arc())
                     and "p.py" in names(arc("-c", "core.attributesFile=%s" % os.devnull))})
        # 実行中のbytesとrevの版の照合（有効化前の実測ではPRのhead、自己修理では修理PRのhead）
        here = os.path.join(d2, "run")
        os.makedirs(here)
        os.makedirs(os.path.join(d2, "scaffold", "lease"))
        for base_ in (here, os.path.join(d2, "scaffold", "lease")):
            with open(os.path.join(base_, "a.py"), "w") as f:
                f.write("print(1)\n")
        g2("add", "scaffold/lease/a.py")
        g2("commit", "-q", "-m", "lease")

        class Loc(G.Runner):
            def run(self, args, input=None, cwd=None, env=None, check=True):
                return subprocess.run(args, input=input, cwd=d2, env=e2, capture_output=True)
        gl = G.GH(runner=Loc())
        same = G.verify_self(gl, "HEAD", here=here)
        with open(os.path.join(here, "a.py"), "w") as f:
            f.write("print(2)\n")
        changed = G.verify_self(gl, "HEAD", here=here)
        # copyに混ざった__pycache__（pyc）やpackage directoryは、.pyのbytesが一致していても拒否する
        with open(os.path.join(here, "a.py"), "w") as f:
            f.write("print(1)\n")
        os.makedirs(os.path.join(here, "__pycache__"))
        with open(os.path.join(here, "__pycache__", "a.cpython-312.pyc"), "wb") as f:
            f.write(b"x")
        os.makedirs(os.path.join(here, "json"))
        rows.append({"id": "CL-verify-self-rev", "ok": same == [] and changed == ["a.py"]
                     and "a.py" in G.verify_self(gl, real, here=here)
                     and G.extra_entries(gl, "HEAD", here) == ["__pycache__", "__pycache__/a.cpython-312.pyc", "json"]
                     and G.verify_self(gl, "HEAD", here=here) != []})
        # 実行者から書ける置き場所は起動条件を満たさない（interpreterの置き場所は書けない）
        # 実行者が所有する置き場所は、mode 0555に落としても信頼しない（偽のgh等）。rootが所有する置き場所は信頼する
        ro = os.path.join(d2, "ro")
        os.makedirs(ro)
        with open(os.path.join(ro, "gh"), "w") as f:
            f.write("#!/bin/sh\n")
        os.chmod(os.path.join(ro, "gh"), 0o555)
        os.chmod(ro, 0o555)
        try:
            flagged = G.untrusted_locations([os.path.join(ro, "gh")])
        finally:
            os.chmod(ro, 0o755)
        rows.append({"id": "CL-untrusted-location", "ok": os.path.join(ro, "gh") in flagged and ro in flagged
                     and here in G.untrusted_locations([os.path.join(here, "a.py")])
                     and (os.getuid() == 0 or not G.untrusted_locations(["/usr/bin/python3"]))
                     and os.path.dirname(G.GH_BIN) in ("/usr/bin", "/bin")})
    finally:
        shutil.rmtree(d2, ignore_errors=True)   # 自分がmkdtempで作った使い捨てdirectoryだけを消す
    # 外部commandへ渡す環境は許可リスト（PATH・XDG_*・GH_HOST・PYTHON*を受け取らない。GH_TOKENだけ通す）
    saved = {k: os.environ.get(k) for k in ("GH_HOST", "XDG_CONFIG_HOME", "PYTHONPATH", "GH_TOKEN")}
    try:
        os.environ.update({"GH_HOST": "evil.invalid", "XDG_CONFIG_HOME": "/tmp/x", "PYTHONPATH": "/tmp/x", "GH_TOKEN": "t"})
        be, ge = G.base_env(), G.isolated_git_env()
        rows.append({"id": "CL-env-allowlist", "ok": be["PATH"] == "/usr/bin:/bin" and be.get("GH_TOKEN") == "t"
                     and not {"GH_HOST", "XDG_CONFIG_HOME", "PYTHONPATH"} & (set(be) | set(ge))})
    finally:
        for k, v in saved.items():
            if v is None:
                os.environ.pop(k, None)
            else:
                os.environ[k] = v
    # App JWTを送る経路は呼出し元のproxy環境変数・trust storeの環境変数を使わない
    saved = {k: os.environ.get(k) for k in ("HTTPS_PROXY", "https_proxy", "SSL_CERT_FILE")}
    try:
        os.environ.update({"HTTPS_PROXY": "http://127.0.0.1:9", "https_proxy": "http://127.0.0.1:9", "SSL_CERT_FILE": "/dev/null"})
        op = G.direct_opener()
        ph = [h for h in op.handlers if isinstance(h, G.urllib.request.ProxyHandler)]   # 空のProxyHandlerは登録されない
        hs = [h for h in op.handlers if isinstance(h, G.urllib.request.HTTPSHandler)]
        rd = [h for h in op.handlers if isinstance(h, G.urllib.request.HTTPRedirectHandler)]
        rows.append({"id": "CL-app-transport-no-ambient", "ok": not ph and len(hs) == 1
                     and len(rd) == 1 and isinstance(rd[0], G.NoRedirect)
                     and hs[0]._context.cert_store_stats().get("x509_ca", 0) > 0
                     and G.app_key_dir() == os.path.join(G.home_dir(), ".helix-lease", "apps")})
    finally:
        for k, v in saved.items():
            if v is None:
                os.environ.pop(k, None)
            else:
                os.environ[k] = v
    # executorのgit呼出しは、使い捨てbare repository・replace objects無効・attributesFile無効・絶対pathのgh credential helper
    calls = []

    class Rec(G.Runner):
        def run(self, args, input=None, cwd=None, env=None, check=True):
            calls.append((list(args), env))
            return subprocess.CompletedProcess(args, 0, b"", b"")
    gi = G.GH(runner=Rec(), isolated=True)
    gi.git("fetch", "-q", "origin", "main")
    fa, fe = calls[-1]
    rows.append({"id": "CL-isolated-git-call", "ok": "--no-replace-objects" in fa and "core.attributesFile=%s" % os.devnull in fa
                 and "credential.helper=!%s auth git-credential" % G.shlex.quote(G.GH_BIN) in fa and fa[1] == "--git-dir"
                 and fe.get("GIT_CONFIG_GLOBAL") == os.devnull and fe.get("GIT_NO_REPLACE_OBJECTS") == "1"
                 and calls[1][0][-2:] == ["origin", "https://github.com/%s.git" % C.REPO]})
    rows.append({"id": "CL-sha-mentions", "ok": C.sha256_mentions("a: " + "A" * 64 + " b: " + "1" * 65) == {"a" * 64}})
    lr = {"last_resume_at": "2026-09-20T10:00:00Z"}
    rows.append({"id": "CL-local-suspend-resumed", "ok": not G.local_suspended({"suspended": {"at": "2026-09-20T09:00:00Z"}}, lr)
                 and G.local_suspended({"suspended": {"at": "2026-09-20T11:00:00Z"}}, lr)
                 and G.local_suspended({"suspended": {"at": "2026-09-20T09:00:00Z"}}, {})})
    return rows


def run_boundary_tests():
    """書込み境界の自己検査（偽のrunnerで、GitHubへ何も送らない）。"""
    import leasefixtures as F
    import pwd, subprocess as sp2
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
    st_path = G.STATE_OVERRIDE
    import tempfile
    d = tempfile.mkdtemp(prefix="lease-selftest-")
    G.STATE_OVERRIDE = os.path.join(d, "state.json")
    try:
        s = F.base_rf()
        suspend(G4(), s, [C.R("review_findings_open")])
        rows.append({"id": "BD-no-state-comment-for-pr-reject", "ok": not wrote and not os.path.exists(G.STATE_OVERRIDE)})
        suspend(G4(), s, [C.R("protection_baseline_changed")])
        st = G.read_state()
        rows.append({"id": "BD-suspend-both-stores", "ok": wrote == [3000] and bool(st.get("suspended"))})
    finally:
        G.STATE_OVERRIDE = st_path
        import shutil
        shutil.rmtree(d, ignore_errors=True)
    # merge後のread-after
    s = F.base_rf()
    after = dict(s, main_head="f" * 40, main_tree="t" * 40, main_parents=[F.B, F.H], stale=0,
                 activity={"reached_origin": True, "items": [{"before": F.B, "after": "f" * 40, "activity_type": "push",
                                                               "actor": F.AI, "commit_message": "Merge pull request #1 via Capability Lease\n\nlease_receipt: %s" % C.LEASE_ID,
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
                                            "lease_record_after": dict(lb, probe={"test_pr": 2}, identity={"po": "b"})}, fm)
                 # 有効化前の実測結果（有効化の証拠）は修理でも変えない
                 and not C.is_probe_repair({"lease": {}, "lease_record_before": dict(lb, probe={"test_pr": 1, "activation_results": [1]}),
                                            "lease_record_after": dict(lb, probe={"test_pr": 2, "activation_results": [2]})}, fm)
                 # load_leaseが足す派生欄（after側はtreeから読むためrecord_committed_epochがNone）の違いでは修理を拒否しない
                 and C.is_probe_repair({"lease": {}, "lease_record_before": dict(lb, record_committed_epoch=100.0, activated_epoch=5.0),
                                        "lease_record_after": dict(lb, probe={"test_pr": 2}, record_committed_epoch=None, activated_epoch=5.0)}, fm)
                 # 有効化前の確認: 有効化時点の試験reviewと現在の登録の照合（並び順は問わない）
                 and not C.activation_pair_differs({"probe": {"test_reviews": [{"id": 2, "state": "B"}, {"id": 1, "state": "A"}],
                                                              "activation_test_reviews": [{"id": 1, "state": "A"}, {"id": 2, "state": "B"}]}})
                 and C.activation_pair_differs({"probe": {"test_reviews": [{"id": 3, "state": "A"}], "activation_test_reviews": [{"id": 1, "state": "A"}]}})
                 and C.activation_gaps(dict(F.base_rf()["lease"], expires_at=None))
                 # 対象の無いrecord、実測関連を実際には変えないrecordは修理でない
                 and not C.is_probe_repair({"lease": {}, "lease_record_before": lb, "lease_record_after": dict(lb)}, {"approved_targets": []})
                 and not C.is_probe_repair({"lease": {}, "lease_record_before": lb, "lease_record_after": dict(lb)}, fm)
                 and C.is_probe_repair({"lease": {"probe_paths": ["p.py"]}}, {"approved_targets": [{"path": "p.py", "from_sha256": "a", "sha256": "b"}]})
                 and not C.is_probe_repair({"lease": {"probe_paths": ["p.py"]}}, {"approved_targets": [{"path": "p.py", "from_sha256": "a", "sha256": "a"}]})})
    # activityの各更新で、更新後commitの第1親が更新前のHEADであること
    it = {"before": F.B, "after": "e" * 40, "activity_type": "push", "actor": F.AI, "is_merge": True,
          "commit_message": "Merge pull request #1 via Capability Lease\n\nlease_receipt: %s" % C.LEASE_ID}
    sn = {"lease": F.base_rf()["lease"], "main_head": "e" * 40, "activity_origin": F.B}
    rows.append({"id": "HL-first-parent", "ok": C.activity_chain_ok(dict(sn, activity={"reached_origin": True, "items": [dict(it, first_parent=F.B)]}))[0]
                 and not C.activity_chain_ok(dict(sn, activity={"reached_origin": True, "items": [dict(it, first_parent="9" * 40)]}))[0]})
    boot = dict(it, actor=F.AI, commit_message="Merge pull request #1886", first_parent=F.B, activates_lease=True)
    rows.append({"id": "HL-bootstrap-activation-merge", "ok": C.activity_chain_ok(dict(sn, activity={"reached_origin": True, "items": [boot]}))[0]
                 and not C.activity_chain_ok(dict(sn, activity={"reached_origin": True, "items": [dict(boot, actor=F.PO)]}))[0]})
    # 有効化mergeは既存規則（merge API）で入るためpr_mergeでもよい。それ以外のpr_mergeは主体不一致
    rows.append({"id": "HL-activation-merge-pr-merge", "ok": C.activity_chain_ok(dict(sn, activity={"reached_origin": True, "items": [
        dict(boot, activity_type="pr_merge")]}))[0]
                 and not C.activity_chain_ok(dict(sn, activity={"reached_origin": True, "items": [dict(it, first_parent=F.B, activity_type="pr_merge")]}))[0]})
    # 自己修理: 修理PRのheadのbytes・許可の引数・recordのapproved_targetsの照合
    import leaserecover as RC
    sd = F.base_dr()
    run_h, main_h = {F.TARGET: F.sha("6"), "scaffold/lease/leasecore.py": "c" * 64}, {F.TARGET: F.sha("5"), "scaffold/lease/leasecore.py": "c" * 64}
    ok_arg = RC.manifest_sha256(run_h)
    rows.append({"id": "RC-self-repair", "ok": RC.self_repair_errors(sd, run_h, main_h, ok_arg, F.H) == []
                 and RC.self_repair_errors(sd, run_h, main_h, "0" * 64, F.H)
                 and RC.self_repair_errors(sd, run_h, main_h, ok_arg, "d" * 40)
                 and RC.self_repair_errors(sd, dict(run_h, **{F.TARGET: F.sha("7")}), main_h, RC.manifest_sha256(dict(run_h, **{F.TARGET: F.sha("7")})), F.H)
                 and RC.self_repair_errors(sd, main_h, main_h, RC.manifest_sha256(main_h), F.H)})
    rows.append({"id": "HL-activation-merge-not-at-origin", "ok": not C.activity_chain_ok(dict(
        sn, main_head="7" * 40, activity={"reached_origin": True, "items": [
            dict(it, first_parent=F.B), dict(boot, before="e" * 40, after="7" * 40, first_parent="e" * 40)]}))[0]})
    # 非常mergeの後の再開recordは、merge_resultのread-after結果を項目ごとに列挙する
    rmr = [{"merge_commit": "a1" * 20, "read_after": {"ok": False, "mismatches": [
        {"code": "post_merge_mismatch", "item": "tree", "detail": "x"}, {"code": "post_merge_mismatch", "item": "main_actor_mismatch", "detail": "y"}]}}]
    stc = [{"body": "非常経路のmerge %s" % ("a1" * 20)}]
    ok_fm = {"recovery_read_after": [{"merge_commit": "a1" * 20, "mismatch_items": "tree,main_actor_mismatch"}]}
    rows.append({"id": "RC-resume-enumeration", "ok":
                 not C.recovery_enumeration_errors({"recovery_merge_results": rmr, "status_comments": stc}, ok_fm)
                 and C.recovery_enumeration_errors({"recovery_merge_results": rmr, "status_comments": stc}, {})
                 and C.recovery_enumeration_errors({"recovery_merge_results": rmr, "status_comments": stc},
                                                   {"recovery_read_after": [{"merge_commit": "a1" * 20, "mismatch_items": "none"}]})
                 and C.recovery_enumeration_errors({"recovery_merge_results": rmr, "status_comments": stc},
                                                   {"recovery_read_after": [{"merge_commit": "a1" * 20, "mismatch_items": "tree"}]})
                 and C.recovery_enumeration_errors({"recovery_merge_results": rmr, "status_comments": stc},
                                                   {"recovery_read_after": [{"merge_commit": "a1" * 20, "mismatch_items": "post_merge_mismatch"}]})
                 and C.recovery_enumeration_errors({"recovery_merge_results": rmr, "status_comments": []}, ok_fm)
                 and C.recovery_enumeration_errors({"recovery_merge_results": [dict(rmr[0], read_after=None)], "status_comments": stc}, ok_fm)})
    # activityの主体照合は固定位置で見る（本文に引用されたreceipt行には反応しない）
    quoted = "Merge pull request #5 via Capability Lease\n\nlease_recovery: 5\n--- comment\nlease_receipt: %s" % C.LEASE_ID
    rows.append({"id": "HL-quoted-receipt-in-recovery", "ok": C.merge_message_kind(quoted) == "recovery"
                 and not C.activity_chain_ok(dict(sn, activity={"reached_origin": True, "items": [
                     dict(it, first_parent=F.B, commit_message=quoted)]}))[0]
                 and C.merge_message_kind("x\n\nlease_receipt: %s" % C.LEASE_ID) is None})
    # GitHub Appのloginはcollaborator roleでなくapp権限で照合する
    al = dict(F.base_rf()["lease"], identity=dict(F.base_rf()["lease"]["identity"], ai="helix-app[bot]", apps=["helix-app"]))
    hs = {"protection": F.base_rf()["protection"], "roles": {}, "app_permissions": [{"slug": "helix-app", "app_slug": "helix-app", "repository_selection": "selected", "permissions": dict(C.APP_PERMISSIONS_ALLOWED)}]}
    rm = lambda perms: [x for x in C.evaluate_lease_health(dict(hs, app_permissions=[{"slug": "helix-app", "app_slug": "helix-app", "repository_selection": "selected", "permissions": perms}]),
                                                           lease=al, skip_activity=True) if x["code"] == "role_mismatch"]
    rows.append({"id": "HL-app-login-role", "ok": not [x for x in C.evaluate_lease_health(hs, lease=al, skip_activity=True)
                                                     if x["code"] == "role_mismatch"]
                 and [x for x in C.evaluate_lease_health(dict(hs, app_permissions=[]), lease=al, skip_activity=True)
                      if x["code"] == "role_mismatch"]})
    # installation権限は許可集合とちょうど一致: 必須の書込みの欠落、読取りへの縮退、読取りの欠落、外の権限はどれも停止
    rows.append({"id": "HL-app-permissions-exact", "ok": bool(rm({"contents": "write"}))
                 and bool(rm(dict(C.APP_PERMISSIONS_ALLOWED, issues="read")))
                 and bool(rm({k: v for k, v in C.APP_PERMISSIONS_ALLOWED.items() if k != "administration"}))
                 and bool(rm(dict(C.APP_PERMISSIONS_ALLOWED, workflows="write")))
                 and not rm(dict(C.APP_PERMISSIONS_ALLOWED))})
    # AppのJWT: RS256の形（header.payload.signature）と、iss・有効期間
    import subprocess as sp_, tempfile as tf_
    kd = tf_.mkdtemp(prefix="lease-jwt-")
    try:
        kp = os.path.join(kd, "k.pem")
        sp_.run(["openssl", "genrsa", "-out", kp, "2048"], capture_output=True, check=True)
        tok = G.app_jwt(123, kp, now=1000)
        hd, bd, sg = tok.split(".")
        import base64 as b64_
        pl = json.loads(b64_.urlsafe_b64decode(bd + "=" * (-len(bd) % 4)))
        pub = sp_.run(["openssl", "rsa", "-in", kp, "-pubout"], capture_output=True, check=True).stdout
        with open(os.path.join(kd, "pub.pem"), "wb") as f:
            f.write(pub)
        with open(os.path.join(kd, "sig"), "wb") as f:
            f.write(b64_.urlsafe_b64decode(sg + "=" * (-len(sg) % 4)))
        v = sp_.run(["openssl", "dgst", "-sha256", "-verify", os.path.join(kd, "pub.pem"), "-signature", os.path.join(kd, "sig")],
                    input=("%s.%s" % (hd, bd)).encode(), capture_output=True)
        rows.append({"id": "APP-jwt", "ok": v.returncode == 0 and pl == {"iat": 940, "exp": 1540, "iss": "123"}})
    finally:
        shutil_ = __import__("shutil"); shutil_.rmtree(kd, ignore_errors=True)   # 自分がmkdtempで作った使い捨てdirectoryだけを消す
    # read-afterの不一致は項目ごとに残る
    ra3 = C.evaluate_after({"main_head": "x", "main_tree": "y", "main_parents": [], "stale": 0, "lease": F.base_rf()["lease"],
                            "protection": F.base_rf()["protection"], "roles": {F.AI: "write"}, "activity": {"reached_origin": False}},
                           "f" * 40, "t" * 40, (F.B, F.H), True, True)
    rows.append({"id": "RA-items", "ok": {"main_head", "tree", "parents"} <= {x.get("item") for x in ra3}
                 and all(x["code"] == "post_merge_mismatch" for x in ra3)})
    # 保護設定を取得できない、または基準値が無ければ一致としない
    lh = F.base_rf()
    pc = lambda snap, lease=None: "protection_baseline_changed" in [x["code"] for x in C.evaluate_lease_health(snap, lease=lease, skip_activity=True)]
    # 各条件だけが成り立たない組合せで試す（他の条件に隠れない）
    rows.append({"id": "HL-protection-unavailable", "ok": not pc(lh) and pc(dict(lh, protection={"unavailable": True}))
                 and pc(dict(lh, protection={"branch_protection": None, "rulesets": []}),
                        lease=dict(lh["lease"], baseline={"branch_protection": None, "rulesets": []}))})
    rows.append({"id": "HL-baseline-null", "ok": pc(lh, lease=dict(lh["lease"], baseline=None))
                 and pc(lh, lease=dict(lh["lease"], baseline={"branch_protection": lh["protection"]["branch_protection"], "rulesets": None}))})
    po_ai = dict(F.base_dr(), lease=dict(F.base_dr()["lease"], identity=dict(F.base_dr()["lease"]["identity"], po=F.AI)))
    rows.append({"id": "DR-po-is-ai-review", "ok": C.latest_po_review(dict(po_ai, reviews=[dict(r, user=F.AI) for r in po_ai["reviews"]]), F.H)[0] is None})
    # 有効化済みでも、identity・基準値・起点・状態Issue・試験PRの欠落、POのAI側loginは未有効として扱う
    lb = F.base_rf()["lease"]
    rows.append({"id": "LS-activation-gaps", "ok": not C.activation_gaps(lb) and C.activation_gaps(dict(lb, baseline=None))
                 and C.activation_gaps(dict(lb, identity=dict(lb["identity"], po=F.AI)))
                 and C.activation_gaps(dict(lb, identity=dict(lb["identity"], po="x[bot]")))
                 # identity表: AI側の各roleの欠落、accept_bootstrap_riskで別identityのrole
                 and all(C.activation_gaps(dict(lb, identity=dict(lb["identity"], **{k: None}))) for k in ("creator", "executor", "recovery"))
                 and C.activation_gaps(dict(lb, identity=dict(lb["identity"], reviewers=[])))
                 and C.activation_gaps(dict(lb, identity=dict(lb["identity"], recovery="other-app[bot]", apps=["helix-app", "other-app"])))
                 and C.lease_scope(dict(F.base_rf(), lease=dict(lb, origin_main=None)))[0] == "none"})
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
    # import前のentry確認: 4つのcommandが同じ既知集合を持ち、pyc・package・json以外のcases entryを挙げる
    import tempfile as tf2
    import leaseboot as BT0, leasepost as LP0, leaseprobe as LB0, leaserecover as LR0
    sd2 = tf2.mkdtemp(prefix="lease-stray-")
    try:
        for n in ("leasecore.py", "cases"):
            (os.makedirs if n == "cases" else (lambda q: open(q, "w").close()))(os.path.join(sd2, n))
        clean = [m._stray(sd2) for m in (sys.modules[__name__], LP0, LB0, LR0, BT0)]
        os.makedirs(os.path.join(sd2, "__pycache__"))
        os.makedirs(os.path.join(sd2, "json"))
        os.makedirs(os.path.join(sd2, "cases", "x.json"))
        open(os.path.join(sd2, "shlex.py"), "w").close()
        dirty = [m._stray(sd2) for m in (sys.modules[__name__], LP0, LB0, LR0, BT0)]
        rows.append({"id": "CMD-preflight-stray", "ok": clean == [[]] * 5
                     and dirty == [["__pycache__", "cases/x.json", "json", "shlex.py"]] * 5})
    finally:
        shutil.rmtree(sd2, ignore_errors=True)   # 自分がmkdtempで作った使い捨てdirectoryだけを消す
    # 有効化の準備の書込み境界: 許可リストに無いGitHub書込みは通らず、branch pushはlease/配下だけ
    wr = G.Writes({("create_issue", "issue"), ("push_branch", "lease/probe-test"), ("create_pr", "lease/probe-test")})

    class Quiet(G.Runner):
        def run(self, args, input=None, cwd=None, env=None, check=True):
            import subprocess as sp4
            return sp4.CompletedProcess(args, 0, b"{}", b"")
    gw = G.GH(runner=Quiet(), writes=wr, isolated=False)
    refused = []
    for fn in (lambda: gw.push_main("a" * 40), lambda: gw.issue_body(3000, "x"), lambda: gw.comment(3000, "x"),
               lambda: gw.push_branch("a" * 40, "main"), lambda: gw.push_branch("a" * 40, "topic/x"),
               lambda: gw.create_pr("t", "other/branch", "b")):
        try:
            fn()
            refused.append(False)
        except G.WriteRefused:
            refused.append(True)
    rows.append({"id": "BT-write-allowlist", "ok": refused == [True] * 6})
    # 呼出し元が渡すfileは、実行user・rootの持ちもの（Appの秘密鍵・状態領域・root所有のcopy）を開かない
    cf = tempfile.mkdtemp(prefix="lease-callerfile-")
    try:
        own = os.path.join(cf, "mine.txt")
        with open(own, "w") as f:
            f.write("x")
        blocked = []
        # 実行user自身の持ちもの（本番ではAppの秘密鍵・状態領域）、root所有、実行中のcopyの配下はどれも開かない
        for p2 in (own, "/etc/hostname", os.path.join(G.HERE, "leasecore.py")):
            try:
                G.caller_file(p2).close()
                blocked.append(False)
            except RuntimeError:
                blocked.append(True)
        rows.append({"id": "BT-caller-file", "ok": blocked == [True, True, True]})
    finally:
        shutil.rmtree(cf, ignore_errors=True)   # 自分がmkdtempで作った使い捨てdirectoryだけを消す
    # 実行環境を組むscriptとwrapperの形: AI側へinstallation tokenと秘密鍵の操作を出さない
    sh = open(os.path.join(os.path.dirname(HERE), "lease-bootstrap", "install.sh"), encoding="utf-8").read()
    wrap = sh.split("<<'WRAP'")[1].split("WRAP\n")[0]
    sud = sh.split('cat > "$SUDO_TMP" <<EOF')[1].split("EOF\n")[0]
    sud_b = sh.split('cat > "$SUDO_TMP_B" <<EOF')[1].split("EOF\n")[0]
    appsetup_lines = [l for l in wrap.splitlines() if "appsetup" in l and not l.strip().startswith("#")]
    rows.append({"id": "BT-wrapper-scope",
                 # 呼出し元が選べるcommandにappsetupが無く、appsetupはtokenの発行にだけ使われる
                 "ok": "leasectl|leasepost|leaseprobe|leaserecover|leaseboot)" in wrap
                 and not [l for l in wrap.splitlines() if l.strip().startswith("appsetup)")]
                 and len(appsetup_lines) == 1 and "GH_TOKEN=" in appsetup_lines[0] and "token" in appsetup_lines[0]
                 and "exec /usr/bin/env -i" in wrap
                 # sudoersはcommand別で、非常用commandは既定で許可しない（POが対象を引数に固定した行を足す）
                 and sorted(l.split("helix-lease-run ")[1].split(" ")[0] for l in sud.splitlines()
                            if "NOPASSWD:" in l and not l.strip().startswith("#")) == ["leasectl", "leasepost", "leaseprobe"]
                 # 準備commandは別dropinで、対象PRを引数に固定する（有効化が済めば外す）
                 and all("--lease-pr $PR" in l for l in sud_b.splitlines() if "NOPASSWD:" in l and not l.strip().startswith("#"))
                 and sorted(l.split("helix-lease-run ")[1].split(" ")[1] for l in sud_b.splitlines()
                            if "NOPASSWD:" in l and not l.strip().startswith("#")) == ["prepare", "probe", "verify"]
                 and "appsetup" not in sud.replace("# ", "") and "ALL=(ALL)" not in sud and "env_reset" in sud
                 and "self" not in wrap.lower()
                 # sudoersは検査（visudo）に通してから置く。対象PRはroot所有のfileでも固定する
                 and sh.index('visudo -cf "$SUDO_TMP"') < sh.index('install -m 0440 -o root -g root "$SUDO_TMP" /etc/sudoers.d/helix-lease')
                 and sh.index('visudo -cf "$SUDO_TMP_B"') < sh.index('install -m 0440 -o root -g root "$SUDO_TMP_B" /etc/sudoers.d/helix-lease-bootstrap')
                 and "/etc/helix-lease/target-pr" in sh and "PATH=/usr/sbin:/usr/bin:/sbin:/bin" in sh
                 # wrapperは呼出し元のPATH・HOMEを引き継がない（homeは実行userの登録内容から決め、空なら止める）
                 and "PATH=/usr/bin:/bin; export PATH" in wrap and 'HOME="$HOME"' not in wrap
                 and 'EXEC_HOME="$(getent passwd "$(id -un)" | cut -d: -f6)"' in wrap
                 and 'HOME="$EXEC_HOME"' in wrap
                 and wrap.index('[ -n "$EXEC_HOME" ]') < wrap.index("exec /usr/bin/env -i")})
    # 基準値は、記録といま取得した保護設定を突き合わせる（POの有効化前の確認）
    live = {"branch_protection": {"allow_force_pushes": False}, "rulesets": []}
    rows.append({"id": "BT-baseline-diff",
                 "ok": C.baseline_diff({"baseline": live}, live) == []
                 and C.baseline_diff({"baseline": dict(live, rulesets=[{"id": 1}])}, live) == ["rulesets"]
                 and C.baseline_diff({"baseline": live}, {"unavailable": True}) == ["取得できない"]})
    # verifyの集計: 例外で止まった項目もokでない項目も、すべてngとして数える
    boot_out = {"a": {"ok": True}, "b": {"ok": False}, "c": {"ok": None}, "d": "例外"}
    rows.append({"id": "BT-verify-ng-count",
                 "ok": sorted(k for k, v in boot_out.items() if not (isinstance(v, dict) and v.get("ok") is True)) == ["b", "c", "d"]})
    # 実行環境が固定した対象PRと違うPRでは動かない
    tp = tempfile.mkdtemp(prefix="lease-target-")
    try:
        tpf = os.path.join(tp, "target-pr")
        with open(tpf, "w") as f:
            f.write("1886\n")
        import contextlib as cl3, io as io3

        def refused_for_pr(fn, args):
            """照合先fileを試験用に差し替え、対象PR不一致で（別の理由ではなく）止まることを測る"""
            err = io3.StringIO()
            with cl3.redirect_stderr(err):
                rc = fn(args)
            return rc == 2 and "固定した対象PR" in err.getvalue()

        orig_tpf = G.TARGET_PR_FILE
        G.TARGET_PR_FILE = tpf
        try:
            pinned = [refused_for_pr(LB0.main, ["--login", "x", "--review-id", "1", "--lease-pr", "4321", "--apply"]),
                      refused_for_pr(BT0.main, ["probe", "--lease-pr", "4321", "--apply"]),
                      refused_for_pr(main, ["status", "--lease-pr", "4321"])]   # 一致する側は外部作用を起こしうるため、ここでは照合関数だけで確かめる
        finally:
            G.TARGET_PR_FILE = orig_tpf
        rows.append({"id": "BT-target-pr", "ok": G.target_pr_mismatch(1886, tpf) is None
                     and G.target_pr_mismatch(4321, tpf)
                     and G.target_pr_mismatch(1886, os.path.join(tp, "none"))
                     and all(pinned)})
    finally:
        shutil.rmtree(tp, ignore_errors=True)   # 自分がmkdtempで作った使い捨てdirectoryだけを消す
    # 「未検証」の実測は、値が揃ったときだけ成立する（取得できない・期待と違う場合は不成立）
    ok_app = [{"slug": "helix-app", "app_slug": "helix-app", "repository_selection": "selected",
               "permissions": dict(C.APP_PERMISSIONS_ALLOWED)}]
    act_ok = {"reached_origin": True, "items": [{"before": F.B, "after": "e" * 40, "activity_type": "push", "actor": F.AI}]}
    rows.append({"id": "BT-verify-fail-closed",
                 "ok": BT0.verdict_activity(act_ok)["ok"]
                 and not BT0.verdict_activity(dict(act_ok, reached_origin=False))["ok"]
                 and not BT0.verdict_activity({"reached_origin": True, "items": []})["ok"]
                 and not BT0.verdict_activity({"reached_origin": True, "items": [{"before": F.B}]})["ok"]
                 and BT0.verdict_app(ok_app, "helix-app")["ok"]
                 and not BT0.verdict_app([dict(ok_app[0], unavailable=True)], "helix-app")["ok"]
                 and not BT0.verdict_app([dict(ok_app[0], repository_selection="all")], "helix-app")["ok"]
                 and not BT0.verdict_app([dict(ok_app[0], permissions={"contents": "write"})], "helix-app")["ok"]
                 and not BT0.verdict_app([], "helix-app")["ok"]
                 and BT0.verdict_merge_tree(0, "a" * 40, "a" * 40)["ok"]
                 and not BT0.verdict_merge_tree(0, "a" * 40, None)["ok"]
                 and not BT0.verdict_merge_tree(0, "a" * 40, "b" * 40)["ok"]
                 and not BT0.verdict_merge_tree(1, "", None)["ok"]})
    # 同じoptionの重複は、実行環境の許可（sudoers）の引数固定を外すため、どのcommandも拒否する
    import contextlib as cl2, io as io2

    def dup_refused(fn, args):
        """重複で止まったことを、別の理由での停止と混ぜずに測る"""
        err = io2.StringIO()
        with cl2.redirect_stderr(err):
            rc = fn(args)
        return rc == 2 and "同じoptionが2回以上ある" in err.getvalue()

    dup_rcs = [dup_refused(BT0.main, ["probe", "--lease-pr", "1886", "--lease-pr", "999", "--apply"]),
               dup_refused(LB0.main, ["--login", "x", "--review-id", "1", "--lease-pr", "1", "--lease-pr", "2", "--apply"]),
               dup_refused(LR0.main, ["7", "--context", "c", "--mode", "review", "--mode", "comment", "--apply"]),
               dup_refused(main, ["admit", "7", "--context", "c", "--context", "d", "--apply"]),
               dup_refused(LP0.main, ["request", "--pr", "1", "--pr", "2", "--class", "x", "--reviewer-target", "t",
                                      "--request-file", "f", "--creator", "c", "--apply"])]
    # 省略形（--lease-p等）は認めない。重複検査をすり抜けさせない
    # parse段階で止まることを、後続の対象PR照合と混ぜずに独立して確かめる
    def parse_refused(fn, args):
        with cl2.redirect_stderr(io2.StringIO()):
            try:
                fn(args)
            except SystemExit as e:
                return e.code == 2
        return False
    # 省略形を受け付けるcommandが1つでも残らないよう、5つのlease commandの全subcommandを測る
    abbr = all([parse_refused(BT0.main, ["probe", "--lease-p", "1886", "--apply"]),
                parse_refused(BT0.main, ["prepare", "--lease-pr", "1886", "--lease-p", "999", "--po", "x"]),
                parse_refused(BT0.main, ["verify", "--lease-p", "1886"]),
                parse_refused(main, ["status", "--lease-p", "1886"]),
                parse_refused(main, ["admit", "7", "--cont", "c"]),
                parse_refused(main, ["sync", "7", "--cont", "c"]),
                parse_refused(LB0.main, ["--login", "x", "--review-id", "1", "--lease-p", "1"]),
                parse_refused(LR0.main, ["7", "--cont", "c", "--mode", "review"]),
                parse_refused(LP0.main, ["request", "--p", "1886", "--class", "x", "--reviewer-target", "t",
                                         "--request-file", "f", "--creator", "c"]),
                parse_refused(LP0.main, ["response", "--p", "1886", "--request-id", "r", "--reviewer", "v",
                                         "--counts", "0/0/0", "--authority-basis-sufficient", "yes",
                                         "--new-authority-created", "no", "--text-file", "f"])])
    # 上の呼出しで測れないparser（selftest等）も含め、全parserが省略形を受け付けない定義であること。
    # 文字列ではなく構文で見る（helper経由・別名変数でも拾え、この検査file自身の文字列には当たらない）
    import ast as ast2
    src_files = sorted(glob.glob(os.path.join(HERE, "*.py")) +
                       glob.glob(os.path.join(os.path.dirname(HERE), "lease-bootstrap", "*.py")))

    def tree_of(f):
        return ast2.parse(open(f, encoding="utf-8").read())

    def parser_calls(f):
        out = []
        for n in ast2.walk(tree_of(f)):
            if isinstance(n, ast2.Call):
                name = getattr(n.func, "attr", None) or getattr(n.func, "id", None)
                if name in ("ArgumentParser", "add_parser"):
                    out.append(n)
        return out

    def imports_argparse(f):
        return any((isinstance(n, ast2.Import) and any(al.name == "argparse" for al in n.names))
                   or (isinstance(n, ast2.ImportFrom) and n.module == "argparse")
                   for n in ast2.walk(tree_of(f)))

    def alias_refs(f):
        """parserの生成を別名へ束ねる書き方（AP = argparse.ArgumentParser 等）は、検査から外れるため許さない"""
        tree = tree_of(f)   # 同じ木で見ないと、生成呼出しと参照を突き合わせられない
        called = {id(n.func) for n in ast2.walk(tree) if isinstance(n, ast2.Call)
                  and (getattr(n.func, "attr", None) or getattr(n.func, "id", None))
                  in ("ArgumentParser", "add_parser")}
        out = []
        for n in ast2.walk(tree):
            nm = n.attr if isinstance(n, ast2.Attribute) else (n.id if isinstance(n, ast2.Name) else None)
            if nm in ("ArgumentParser", "add_parser") and id(n) not in called:
                out.append(n)
        return out

    # argparseを使うfileは、必ず定義を拾えること（別名・helper経由で母集合から静かに消えない）
    argp = [f for f in src_files if imports_argparse(f)]
    defs = [c for f in argp for c in parser_calls(f)]
    abbrev_src = (len(argp) >= 6 and len(defs) >= 15 and all(parser_calls(f) for f in argp)
                  and not [f for f in src_files if alias_refs(f)]
                  and all(any(k.arg == "allow_abbrev" and isinstance(k.value, ast2.Constant)
                              and k.value.value is False for k in c.keywords)
                          for c in defs))
    rows.append({"id": "BT-no-duplicate-options", "ok": all(dup_rcs) and abbr and abbrev_src
                 and G.duplicate_options(["--a", "1", "--b", "--a=2"]) == ["--a"]
                 and not G.duplicate_options(["--a", "1", "--b", "2"])})
    # install.shは、実行中の自分のbytesが--shaの版と一致しなければ止まる
    cmp_line = 'cmp -s "$SELF" "$DEST.new/scaffold/lease-bootstrap/install.sh"'
    rows.append({"id": "BT-install-self-check", "ok": cmp_line in sh
                 and sh.index(cmp_line) < sh.index("cat > /usr/local/sbin/helix-lease-run")})
    # install.shは、引数の重複を最初に拒否し、executor userのhomeがAI側から届かないことを確かめてから置く
    home_owner = '[ "$(stat -c %U "$EXEC_HOME")" = "$EXEC_USER" ]'
    # 状態領域は、AI側から差し替えられる置き場所（symlink・他から読める権限）では使わない
    sp_dir = tempfile.mkdtemp(prefix="lease-state-")
    app_tmp = []
    try:
        real = os.path.join(sp_dir, "real"); os.mkdir(real, 0o700)
        loose = os.path.join(sp_dir, "loose"); os.mkdir(loose, 0o755)
        via = os.path.join(sp_dir, "via"); os.symlink(real, via)
        keep = G.STATE_OVERRIDE
        try:
            G.STATE_OVERRIDE = os.path.join(via, "state.json")
            refused_link = False
            try:
                G.write_state({"suspended": None})
            except RuntimeError as e:
                refused_link = "symlink" in str(e)
            G.STATE_OVERRIDE = os.path.join(real, "state.json")
            G.write_state({"suspended": None, "observed_review_ids": {}})
            wrote = G.read_state().get("observed_review_ids") == {}
            made = os.path.join(sp_dir, "made")          # 無い置き場所は本人だけの権限で作る
            G.STATE_OVERRIDE = os.path.join(made, "state.json")
            G.write_state({"suspended": None})
            mode_ok = (os.stat(made).st_mode & 0o077) == 0
            G.STATE_OVERRIDE = os.path.join(real, "state.json")
            os.rename(os.path.join(real, "state.json"), os.path.join(sp_dir, "moved"))
            os.symlink(os.path.join(sp_dir, "moved"), os.path.join(real, "state.json"))
            refused_file = False
            try:
                G.write_state({"suspended": None})
            except RuntimeError as e:
                refused_file = "symlink" in str(e)
            G.STATE_OVERRIDE = os.path.join(loose, "state.json")   # 他のuserから読める置き場所
            refused_loose = False
            try:
                G.write_state({"suspended": None})
            except RuntimeError as e:
                refused_loose = "他のuserから読めます" in str(e)
            # 読む側も、symlinkと他から読める置き場所を拒否する
            read_refused = []
            G.STATE_OVERRIDE = os.path.join(loose, "state.json")
            try:
                G.read_state()
            except RuntimeError as e:
                read_refused.append("他のuserから読めます" in str(e))
            G.STATE_OVERRIDE = os.path.join(real, "state.json")   # ここは既にsymlinkに差し替えてある
            try:
                G.read_state()
            except RuntimeError as e:
                read_refused.append("symlink" in str(e))
            # 置き場所自体がsymlink（directoryでない先を指す場合も含む）
            for target in (real, os.path.join(sp_dir, "moved")):
                d2 = os.path.join(sp_dir, "dir-link-%d" % len(read_refused))
                os.symlink(target, d2)
                G.STATE_OVERRIDE = os.path.join(d2, "state.json")
                try:
                    G.read_state()
                    read_refused.append(False)
                except RuntimeError as e:
                    read_refused.append("置き場所がsymlink" in str(e))
            # 読めない状態領域（fileの代わりにdirectoryがある等）も、停止が無いものとして扱わない
            notafile = os.path.join(sp_dir, "notafile"); os.mkdir(notafile, 0o700)
            os.mkdir(os.path.join(notafile, "state.json"))
            G.STATE_OVERRIDE = os.path.join(notafile, "state.json")
            try:
                G.read_state()
                read_refused.append(False)
            except RuntimeError as e:
                read_refused.append("読めません" in str(e))
            # 壊れた状態fileは、停止が無いものとして扱わない
            broken = os.path.join(sp_dir, "broken"); os.mkdir(broken, 0o700)
            with open(os.path.join(broken, "state.json"), "w") as f:
                f.write("{壊れ")
            G.STATE_OVERRIDE = os.path.join(broken, "state.json")
            try:
                G.read_state()
                read_refused.append(False)
            except RuntimeError as e:
                read_refused.append("壊れています" in str(e))
        finally:
            G.STATE_OVERRIDE = keep
        # App設定の置き場所とfileも同じ扱い（symlinkは使わない）
        import importlib.util as iu
        spec = iu.spec_from_file_location("appsetup_t", os.path.join(os.path.dirname(HERE),
                                                                    "lease-bootstrap", "appsetup.py"))
        AS = iu.module_from_spec(spec); spec.loader.exec_module(AS)
        ah = tempfile.mkdtemp(prefix="lease-app-")
        app_tmp.append(ah)
        AS.home = lambda: ah
        app_refused = []
        os.symlink(sp_dir, os.path.join(ah, ".helix-lease"))
        try:
            AS.app_dir()
        except RuntimeError as e:
            app_refused.append("symlink" in str(e))
        os.unlink(os.path.join(ah, ".helix-lease"))
        d = AS.app_dir()                      # 無ければ本人だけのdirectoryで作る
        os.symlink("/tmp/nowhere", os.path.join(d, "app.json"))
        try:
            AS.app_file()
        except RuntimeError as e:
            app_refused.append("symlink" in str(e))
        os.unlink(os.path.join(d, "app.json"))
        keep_home = G.home_dir
        try:
            kh = tempfile.mkdtemp(prefix="lease-key-")
            app_tmp.append(kh)
            G.home_dir = lambda: kh
            os.symlink(sp_dir, os.path.join(kh, ".helix-lease"))
            try:
                G.app_key_dir()
                app_refused.append(False)
            except RuntimeError as e:
                app_refused.append("symlink" in str(e))
            os.unlink(os.path.join(kh, ".helix-lease"))
            os.makedirs(os.path.join(kh, ".helix-lease", "apps"), mode=0o755)
            try:
                G.app_key_dir()
                app_refused.append(False)
            except RuntimeError as e:
                app_refused.append("他のuserから読めます" in str(e))
        finally:
            G.home_dir = keep_home
        for bad in ("../../x", "a/b", "", ".."):      # lease記録のslugでもpathを外へ出せない
            try:
                G.app_key_file(d, bad)
                app_refused.append(False)
            except RuntimeError as e:
                app_refused.append("slugの形が不正" in str(e))
        for bad in ("../../x", "a/b", "", ".."):      # slugでpathを外へ出せない
            try:
                AS.key_file(bad)
                app_refused.append(False)
            except RuntimeError as e:
                app_refused.append("slugの形が不正" in str(e))
        os.symlink("/tmp/nowhere", os.path.join(d, "helix-app.pem"))
        try:
            AS.key_file("helix-app")
        except RuntimeError as e:
            app_refused.append("symlink" in str(e))
        os.unlink(os.path.join(d, "helix-app.pem"))
        def uses_key_file():
            import ast as ast3
            tree = ast3.parse(open(os.path.join(HERE, "leasegh.py"), encoding="utf-8").read())
            fn = next((n for n in ast3.walk(tree)
                       if isinstance(n, ast3.FunctionDef) and n.name == "app_permissions"), None)
            calls = [c for c in ast3.walk(fn) if isinstance(c, ast3.Call)] if fn else []
            joins = [c for c in calls if getattr(c.func, "attr", None) == "join"
                     and any(getattr(x, "id", None) == "kdir" for x in c.args)]
            return bool(fn) and not joins and any(getattr(c.func, "id", None) == "app_key_file"
                                                  for c in calls)

        rows.append({"id": "BT-state-no-symlink",
                     "ok": refused_link and refused_file and refused_loose and wrote and mode_ok
                     and read_refused == [True] * 6
                     and app_refused == [True] * 13
                     # 実測側も、lease記録のslugをそのままpathにしない（呼出しの有無を構文で見る）
                     and uses_key_file() and (os.stat(d).st_mode & 0o077) == 0})
    finally:
        shutil.rmtree(sp_dir, ignore_errors=True)   # 自分がmkdtempで作った使い捨てdirectoryだけを消す
        for t in app_tmp:
            shutil.rmtree(t, ignore_errors=True)
    # install.sh・checkhome.sh・appsetupの拒否を、rootを使わずに実挙動で測る
    boot_dir = os.path.join(os.path.dirname(HERE), "lease-bootstrap")

    def sh_run(args):
        r = sp2.run(args, capture_output=True, text=True)
        return r.returncode, (r.stderr or "") + (r.stdout or "")

    hp = tempfile.mkdtemp(prefix="lease-home-")
    try:
        home = os.path.join(hp, "home")
        os.mkdir(home)                      # 祖先（hp）はroot所有ではない＝拒否されるはず
        link = os.path.join(hp, "link")
        os.symlink(home, link)
        me = pwd.getpwuid(os.getuid()).pw_name
        ck = os.path.join(boot_dir, "checkhome.sh")
        rc_anc, out_anc = sh_run(["sh", ck, me, home, ""])
        rc_link, out_link = sh_run(["sh", ck, me, link, ""])
        rc_same, out_same = sh_run(["sh", ck, me, home, home])
        rc_ailink, out_ailink = sh_run(["sh", ck, me, home, link])   # 別表記で同じ場所を指すAI側home
        rc_other, out_other = sh_run(["sh", ck, "nobody", home, ""])
        wide = os.path.join(hp, "wide")
        os.mkdir(wide); os.chmod(wide, 0o777)
        rc_mode, out_mode = sh_run(["sh", ck, me, wide, ""])   # home自身が他のuserから書ける
        ent = os.path.join(home, "taken")
        os.symlink("/tmp", ent)
        rc_ent, out_ent = sh_run(["sh", ck, me, home, ""])     # 直下に置かれたsymlink
        os.unlink(ent)
        rc_dup, out_dup = sh_run(["sh", os.path.join(boot_dir, "install.sh"),
                                  "--sha", "a" * 40, "--sha=" + "b" * 40, "--repo", "x/y", "--pr", "1"])
        rc_adup, out_adup = sh_run([sys.executable, "-I", "-B", os.path.join(boot_dir, "appsetup.py"),
                                    "token", "--repo", "a", "--repo=b"])
        # 条件を満たすhomeでは止めないことも測る（常に拒否へ壊れたら気づく）。
        # rootを使わずに作れないため、root所有で他から書けない既存のdirectoryを借りる。
        # 借り先ごとに直下の中身が違うため、候補のどれか1つでも通ればよい（1つも通らなければ落とす）。
        accepted = [d for d in ("/usr", "/root", "/etc", "/usr/share", "/var/lib")
                    if os.path.isdir(d) and sh_run(["sh", ck, "root", d, ""])[0] == 0]
        ok_home = bool(accepted)
        if not ok_home:
            print("NG BT-install-args-home（合格の場合を測れるdirectoryが無い）")
        rows.append({"id": "BT-install-args-home",
                     "ok": (rc_anc, rc_link, rc_same, rc_ailink, rc_other,
                            rc_mode, rc_ent, rc_dup, rc_adup) == (2,) * 9
                     and "root所有ではありません" in out_anc and "symlinkを含みます" in out_link
                     and "homeが同じです" in out_same and "homeが同じです" in out_ailink
                     # homeの所有者と、祖先の所有者は別の理由として測る
                     and "home" in out_other and "の所有ではありません" in out_other
                     and "他のuserから書けます" in out_mode and "はsymlinkです" in out_ent
                     and "同じoptionが2回以上あります" in out_dup   # rootの確認より前に止まる
                     and "同じoptionが2回以上ある" in out_adup
                     # install.shは、この検査をwrapperを置く前に通す
                     and 'sh "$DEST.new/scaffold/lease-bootstrap/checkhome.sh" "$EXEC_USER" "$EXEC_HOME"' in sh
                     and sh.index("checkhome.sh") < sh.index("cat > /usr/local/sbin/helix-lease-run")
                     and ok_home})
    finally:
        shutil.rmtree(hp, ignore_errors=True)   # 自分がmkdtempで作った使い捨てdirectoryだけを消す
    # GraphQL側に無いreview（lastEditedAtを確かめられない）は未編集として扱わず、取得失敗にする
    import subprocess as sp3

    class RV(G.Runner):
        def run(self, args, input=None, cwd=None, env=None, check=True):
            if "graphql" in args:
                out = {"data": {"repository": {"pullRequest": {"reviews": {"pageInfo": {"hasNextPage": False}, "nodes": [
                    {"databaseId": 1, "id": "n1", "lastEditedAt": None}]}}}}}
            else:
                out = [[{"id": 1, "user": {"login": "a"}}, {"id": 2, "user": {"login": "b"}}]]
            return sp3.CompletedProcess(args, 0, json.dumps(out).encode(), b"")
    try:
        G.reviews_of(G.GH(runner=RV(), isolated=False), 5)
        raised = False
    except RuntimeError:
        raised = True
    rows.append({"id": "CL-review-missing-in-graphql", "ok": raised})
    # command単位の起動条件: 満たさなければ、書込みも照合先の取得もせずに2で終わる（偽のrunnerで、GitHubへ何も送らない）
    import contextlib, io, subprocess as sp2
    import leasepost as LP, leaseprobe as LB, leaserecover as LR
    sent = []

    class Null(G.Runner):
        def run(self, args, input=None, cwd=None, env=None, check=True):
            sent.append(list(args))
            return sp2.CompletedProcess(args, 0, b"", b"")
    real_gh, real_si, real_la, real_ul = G.GH, G.self_integrity, G.lease_at, G.untrusted_locations
    G.GH = lambda *a, **k: real_gh(runner=Null(), writes=k.get("writes"), isolated=False)
    # 置き場所の検査を必ず不合格にする（-I・root所有のcopyで実行しても、この試験を空振りさせない）
    G.untrusted_locations = lambda paths: ["(selftest)"]
    try:
        with contextlib.redirect_stderr(io.StringIO()), contextlib.redirect_stdout(io.StringIO()):
            rc_post = LP.main(["request", "--pr", "7", "--class", "repository_foundation", "--reviewer-target", "x",
                               "--request-file", "/nonexistent", "--creator", "a,b,c,d", "--apply"])
            rc_probe = LB.main(["--login", F.AI, "--review-id", "9001", "--apply"])
            rc_rec = LR.main(["7", "--context", "c", "--mode", "review", "--apply"])
            rc_rep = LR.main(["7", "--context", "c", "--mode", "review", "--self-repair", "0" * 64, "--apply"])
            rc_ctl = main(["admit", "7", "--context", "c", "--apply"])
            rc_status = main(["status", "--lease-pr", "7"])
            rc_boot = BT0.main(["prepare", "--lease-pr", "7", "--po", "po-human", "--apply"])
        writes = [a for a in sent if "POST" in a or "PATCH" in a or "push" in a or "graphql" in a]
        # 起動条件を欠けば、どのcommandも書込みも照合先の取得（fetch・API）もせずに2で止まる
        rows.append({"id": "CMD-integrity-gate", "ok": rc_post == rc_probe == rc_rec == rc_rep == rc_ctl == rc_status == rc_boot == 2
                     and not writes and not [a for a in sent if "fetch" in a or "api" in a]})
        G.untrusted_locations = real_ul
        # 実測command: 状態IssueがPR（または閉じている）なら、削除の試行も結果commentも行わない
        sent.clear()
        G.self_integrity = lambda gh, rev="origin/main": []
        G.lease_at = lambda gh, lease_pr=None: F.base_rf()["lease"]

        class Api(Null):
            def run(self, args, input=None, cwd=None, env=None, check=True):
                sent.append(list(args))
                path = args[-1] if args and "api" in args else ""
                body = {"repositories": [{"full_name": C.REPO}]} if "installation/repositories" in path else \
                    {"pull_request": {"url": "x"}, "state": "open"} if "/issues/" in path else {}
                return sp2.CompletedProcess(args, 0, json.dumps(body).encode(), b"")
        G.GH = lambda *a, **k: real_gh(runner=Api(), writes=k.get("writes"), isolated=False)
        with contextlib.redirect_stderr(io.StringIO()), contextlib.redirect_stdout(io.StringIO()):
            rc_pr = LB.main(["--login", F.AI, "--review-id", "9001", "--apply"])
        writes = [a for a in sent if "POST" in a or "graphql" in a]
        rows.append({"id": "CMD-probe-status-issue-is-pr", "ok": rc_pr == 2 and not writes})
    finally:
        G.GH, G.self_integrity, G.lease_at, G.untrusted_locations = real_gh, real_si, real_la, real_ul
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
        boot = os.path.join(os.path.dirname(HERE), "lease-bootstrap")
        bfiles = sorted(os.path.join(dp, f) for dp, _, fs in os.walk(boot) for f in fs
                        if "__pycache__" not in dp)
        bootstrap = hashlib.sha256(b"".join(open(f, "rb").read() for f in bfiles)).hexdigest()
        cases = hashlib.sha256(b"".join(open(p, "rb").read() for p in sorted(glob.glob(os.path.join(HERE, "cases", "*.json"))))).hexdigest()
        with open(EVIDENCE, "w", encoding="utf-8") as f:
            json.dump({"evidence_kind": "scaffold", "tool_sha256": tool, "bootstrap_sha256": bootstrap, "cases_sha256": cases, "cases": len(rows),
                       "boundary": len(b), "fail": fail}, f, ensure_ascii=False, indent=1)
            f.write("\n")
    return 1 if fail else 0


def main(argv=None):
    ap = argparse.ArgumentParser(prog="leasectl", allow_abbrev=False)
    sp = ap.add_subparsers(dest="cmd", required=True)
    p = sp.add_parser("admit", allow_abbrev=False); p.add_argument("pr", type=int); p.add_argument("--context", required=True); p.add_argument("--apply", action="store_true")
    p = sp.add_parser("sync", allow_abbrev=False); p.add_argument("issue", type=int); p.add_argument("--context", required=True); p.add_argument("--apply", action="store_true")
    p = sp.add_parser("status", allow_abbrev=False); p.add_argument("--lease-pr", type=int)
    p = sp.add_parser("selftest", allow_abbrev=False); p.add_argument("--record", action="store_true")
    dup = G.duplicate_options(argv if argv is not None else sys.argv[1:])
    if dup:
        print("拒否: 同じoptionが2回以上ある（許可の引数を固定できない）: %s" % "、".join(dup), file=sys.stderr)
        return 2
    a = ap.parse_args(argv)
    try:
        if a.cmd in ("admit", "sync"):
            bad = G.self_integrity(G.GH())
            if bad:
                print("拒否: executor commandの起動条件を満たさない: %s" % "、".join(bad), file=sys.stderr)
                return 2
        return {"admit": cmd_admit, "sync": cmd_sync, "status": cmd_status, "selftest": cmd_selftest}[a.cmd](a)
    except G.WriteRefused as e:
        print("拒否: %s" % e, file=sys.stderr)
        return 2
    except (RuntimeError, KeyError, ValueError) as e:
        print("入力不正・内部エラー: %s" % e, file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
