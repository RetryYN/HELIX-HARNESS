#!/usr/bin/env python3
"""leaserecover — 非常用command（packet「非常経路」「再bootstrap」）。executorの`decision_record`経路だけを取り出した固定のcommand。

  python3 scaffold/lease/leaserecover.py PR --context ID --mode review [--degraded-activity REASON] [--apply]
  python3 scaffold/lease/leaserecover.py PR --context ID --mode comment --comment-id N --choice C --head SHA [--apply]

`review`はPO reviewを出所とする非常経路、`comment`は再bootstrap mode（判断の出所を人間判断者loginのissue commentに代え、
削除不能の実測規則を適用しない）である。POが実行環境で与える許可は、対象PR（comment modeでは判断comment ID・選択・HEADも）を
引数に固定する。運ぶのは`decision_record` 1件だけで、書き込むのはmainへの通常push、対象PRへの`merge_result`、状態Issueへの
`lease_state: suspended`（非常経路であることとread-afterの結果を含む）だけである。merge自体がleaseを`suspended`にする。
既定はdry-runである。
"""
import argparse, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import leasecore as C   # noqa: E402
import leasegh as G     # noqa: E402
import leasectl as L    # noqa: E402


def rebootstrap_decision(gh, s, a):
    """人間判断者loginのそのPRへのcommentのうち、内容を問わず最新の1件を判断とする。"""
    lease = s.get("lease") or {}
    po = (lease.get("identity") or {}).get("po")
    if po and (po in C.ai_logins(lease) or po.endswith("[bot]")):
        return {"ok": False, "reason": "人間判断者loginがAI側login"}
    mine = [c for c in s["comments"] if c.get("user") == po]
    if not po or not mine:
        return {"ok": False, "reason": "人間判断者loginのcommentが無い"}
    for rid in (G.read_state().get("observed_comment_ids") or {}).get(str(s["pr"]["number"]), []):
        if rid not in {c["id"] for c in mine}:
            return {"ok": False, "reason": "観測済みの判断comment %s が一覧に無い（削除）" % rid}
    c = max(mine, key=lambda x: (x["created_at"], x["id"]))
    if c["id"] != a.comment_id:
        return {"ok": False, "reason": "最新の判断commentのIDが許可の引数と一致しない"}
    if c["updated_at"] != c["created_at"]:
        return {"ok": False, "reason": "判断commentが編集されている"}
    lines = [l for l in c["body"].splitlines() if l.startswith("decision:")]   # 書式不正の行も数える
    if len(lines) != 1:
        return {"ok": False, "reason": "判断行が%d行" % len(lines)}
    parts = lines[0].split()
    if len(parts) != 4 or parts[0] != "decision:" or parts[2] != "head:":
        return {"ok": False, "reason": "判断行の書式不正"}
    choice, head = parts[1], parts[3]
    if choice != a.choice or head != a.head or head != s["pair_head"]:
        return {"ok": False, "reason": "選択・HEADが許可の引数または現在のheadと一致しない"}
    return {"ok": True, "source": "comment", "choice": choice, "head": head, "comment_id": c["id"], "user": c["user"],
            "body": c["body"]}


def degraded_chain(gh, s):
    """activity APIを失った場合の代替: 起点からmain HEADまでの第1親の連鎖上のcommitが、すべてlease mergeまたは非常mergeか。"""
    origin = s.get("activity_origin")
    lease_origin = (s.get("lease") or {}).get("origin_main")
    for sha in gh.git("rev-list", "--first-parent", "%s..%s" % (origin, s["main_head"])).stdout.decode().split():
        msg = gh.git("log", "-1", "--format=%B", sha).stdout.decode("utf-8", "replace")
        parents = gh.git("log", "-1", "--format=%P", sha).stdout.decode().split()
        if len(parents) != 2:
            return False
        if C.merge_message_kind(msg) in ("lease", "recovery"):
            continue
        # 起点の直後の有効化merge（lease記録を未有効から有効へ変えたmerge）だけは例外
        if parents[0] == lease_origin and not (G.load_lease(gh, parents[0]) or {}).get("activated_at") \
                and (G.load_lease(gh, sha) or {}).get("activated_at"):
            continue
        return False
    return True


def main(argv=None):
    ap = argparse.ArgumentParser(prog="leaserecover")
    ap.add_argument("pr", type=int); ap.add_argument("--context", required=True)
    ap.add_argument("--mode", choices=("review", "comment"), required=True)
    ap.add_argument("--comment-id", type=int); ap.add_argument("--choice"); ap.add_argument("--head")
    ap.add_argument("--degraded-activity"); ap.add_argument("--apply", action="store_true")
    a = ap.parse_args(argv)
    if a.mode == "comment" and not (a.comment_id and a.choice and a.head):
        print("入力不正: comment modeは--comment-id・--choice・--headを要する", file=sys.stderr)
        return 2
    gh = G.GH()
    bad = G.verify_self(gh)
    if bad:
        print("拒否: 実行中の非常用commandのbytesがorigin/mainと一致しない: %s" % ", ".join(bad), file=sys.stderr)
        return 2
    s = G.snapshot(gh, a.pr, a.context)
    degraded = None
    if a.degraded_activity:
        if not degraded_chain(gh, s):
            print("拒否: 第1親の連鎖にlease merge以外がある", file=sys.stderr)
            return 1
        s["activity"] = {"degraded": True}
        degraded = "activity_api_unavailable: %s（第1親連鎖の代替。更新主体は証明しない）" % a.degraded_activity
    if a.mode == "comment":
        s["rebootstrap_decision"] = rebootstrap_decision(gh, s, a)
        po = ((s.get("lease") or {}).get("identity") or {}).get("po")
        L.observe(s, "observed_comment_ids", [c["id"] for c in s["comments"] if po and c.get("user") == po])
    res = L.judge(gh, s, recovery=a.mode)
    report = {"pr": a.pr, "mode": a.mode, "reasons": res["reasons"], "checks": s.get("checks"), "degraded": degraded}
    if not a.apply or res["reasons"]:
        print(json.dumps(dict(report, apply=a.apply, result="refused" if res["reasons"] else "admissible"), ensure_ascii=False, indent=1))
        return 1 if res["reasons"] else 0
    lease = s.get("lease") or {}
    si = lease.get("status_issue")
    gh.w = G.Writes({("push_main", "main"), ("comment", a.pr), ("comment", si)})
    args = {"pr": a.pr, "comment_id": a.comment_id, "choice": a.choice, "head": a.head} if a.mode == "comment" else None
    msg = C.receipt_message(s, res, s.get("checks"), a.context, recovery=True, degraded=degraded, rebootstrap_args=args)
    sha = gh.git("commit-tree", s["merge_tree"], "-p", s["main_head"], "-p", s["pair_head"], "-F", "-",
                 input=msg.encode("utf-8")).stdout.decode().strip()
    p = gh.push_main(sha)
    if p.returncode != 0:
        print(json.dumps(dict(report, result="push_rejected"), ensure_ascii=False, indent=1))
        return 1
    after, merged = L.read_after(gh, s, sha, s["merge_tree"], a.pr)
    after["recovery_mode"] = True
    ra = C.evaluate_after(after, sha, s["merge_tree"], (s["main_head"], s["pair_head"]), merged, True)
    ra += L.post_merge_result(gh, s, sha, ra, recovery=True)   # read-afterの後に、その結果を含めて置く
    # 非常経路のmerge自体がleaseをsuspendedにする（read-afterの全項目を含める）
    L.suspend(gh, s, [C.R("post_merge_mismatch", "非常経路のmerge（lease_recovery: %d）" % a.pr)] + ra,
              "非常経路のmerge %s。read-after: %s" % (sha, json.dumps(ra or "全項目一致", ensure_ascii=False)))
    print(json.dumps(dict(report, result="merged", merge_commit=sha, read_after=ra), ensure_ascii=False, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
