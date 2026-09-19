#!/usr/bin/env python3
"""leaseprobe — 削除不能の実測command（packet「削除への対処」(i)）。

  python3 scaffold/lease/leaseprobe.py --login LOGIN --review-id ID [--lease-pr N] [--apply]

実行時に認証されているloginが`--login`と一致することを確かめ、lease記録に固定した試験PRの試験review（ID）に対して
GraphQLの`deletePullRequestReview`を試み、結果を状態Issueへcommentする。書き込めるのは、その試験reviewへの削除の試行と、
状態Issueへの結果commentだけである。結果は denied／unavailable／deleted に分け、どれにも当たらないもの（一時的な失敗、
未知のerror）は数えず、commentも置かない（packet 残存risk節の既定）。既定はdry-runで、試行しない。
"""
import argparse, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import leasecore as C   # noqa: E402
import leasegh as G     # noqa: E402

DENIED = ("FORBIDDEN", "not have permission", "Resource not accessible", "must have admin", "not authorized")   # 権限の欠如の目印
UNAVAILABLE = ("undefinedField", "doesn't exist on type 'Mutation'")


def classify(p, still_present):
    out = (p.stdout + p.stderr).decode("utf-8", "replace")
    try:
        d = json.loads(p.stdout.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        d = {}
    if not still_present:
        return "deleted", out
    if p.returncode == 0 and (d.get("data") or {}).get("deletePullRequestReview"):
        return "deleted", out
    if any(x in out for x in UNAVAILABLE):
        return "unavailable", out
    if any(x in out for x in DENIED):
        return "denied", out
    return None, out


def main(argv=None):
    ap = argparse.ArgumentParser(prog="leaseprobe")
    ap.add_argument("--login", required=True); ap.add_argument("--review-id", type=int, required=True)
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--lease-pr", type=int, help="有効化前: lease記録を埋めた後続operation_change PRのheadのlease記録で実測する")
    a = ap.parse_args(argv)
    gh = G.GH()
    try:
        lease = G.lease_at(gh, a.lease_pr)   # packet: 実測は有効化の条件。有効化前はPRのlease記録に対して行う
    except RuntimeError as e:
        print("拒否: %s" % e, file=sys.stderr)
        return 2
    # 有効化前（--lease-pr）はmainに実測commandがまだ無いため、そのPRのheadの版と照合する
    bad = G.self_integrity(gh, "refs/lease/pr-%d" % a.lease_pr if a.lease_pr else "origin/main")
    if bad:
        print("拒否: 実測commandの起動条件を満たさない: %s" % "、".join(bad), file=sys.stderr)
        return 2
    probe = lease.get("probe") or {}
    tests = {t.get("id"): t.get("state") for t in probe.get("test_reviews") or []}
    if a.review_id not in tests or not probe.get("test_pr") or not lease.get("status_issue"):
        print("拒否: lease記録に固定した試験reviewでない", file=sys.stderr)
        return 2
    if a.login not in C.ai_logins(lease):
        print("拒否: identity表のAI側loginでない", file=sys.stderr)
        return 2
    if a.login.endswith("[bot]"):
        # installation tokenは`GET /user`を使えない。本repositoryを対象とするinstallation tokenであることを確かめ、
        # どのAppかは結果commentの投稿者（executorが`--login`と照合する）で確かめる
        try:
            repos = gh.api("installation/repositories?per_page=100") or {}
        except RuntimeError as e:
            print("拒否: installation tokenで認証されていない（%s）" % str(e)[:200], file=sys.stderr)
            return 2
        if [r.get("full_name") for r in repos.get("repositories") or []] != [gh.repo]:
            print("拒否: installation tokenの対象が本repositoryだけでない", file=sys.stderr)
            return 2
    else:
        me = (gh.api("user") or {}).get("login")
        if me != a.login:
            print("拒否: 認証中のlogin %s が --login と一致しない" % me, file=sys.stderr)
            return 2
    tp = gh.api("repos/%s/pulls/%d" % (gh.repo, probe["test_pr"])) or {}
    if not tp.get("draft"):
        print("拒否: 試験PRがdraftでない", file=sys.stderr)
        return 2
    rv = {r["id"]: r for r in G.reviews_of(gh, probe["test_pr"])}
    target = rv.get(a.review_id)
    if target and (target.get("user") != (lease.get("identity") or {}).get("po") or C.decision_lines(target.get("body"))):
        print("拒否: 試験reviewは人間判断者loginが提出し、本文に`decision:`行を持たないものに限る", file=sys.stderr)
        return 2
    if target and target.get("state") != tests[a.review_id]:
        print("拒否: 試験reviewの状態が%sで、lease記録の%sでない（その状態の削除不能を実測できない）"
              % (target.get("state"), tests[a.review_id]), file=sys.stderr)
        return 2
    if not target:
        print("試験reviewが試験PRに無い（deletedとして扱う）", file=sys.stderr)
    if not a.apply:
        print(json.dumps({"mode": "dry-run", "login": a.login, "review_id": a.review_id, "node_id": (target or {}).get("node_id")},
                         ensure_ascii=False))
        return 0
    gh.w = G.Writes({("graphql_delete_review", (target or {}).get("node_id")), ("comment", lease["status_issue"])})
    if not target:
        result, out = "deleted", "試験reviewが試行前から一覧に無い"
    else:
        p = gh.delete_review(target["node_id"])
        still = a.review_id in {r["id"] for r in G.reviews_of(gh, probe["test_pr"])}
        result, out = classify(p, still)
    if result is None:
        print(json.dumps({"result": "uncounted", "detail": out[:500]}, ensure_ascii=False))
        return 1
    o = {"kind": "lease_probe_result", "lease_id": C.LEASE_ID, "login": a.login, "review_id": a.review_id,
         "review_state": tests[a.review_id], "result": result, "response": out[:1000]}
    gh.comment(lease["status_issue"], "```helix-lease\n%s\n```" % json.dumps(o, ensure_ascii=False, sort_keys=True))
    print(json.dumps({"result": result}, ensure_ascii=False))
    return 0 if result in ("denied", "unavailable") else 1


if __name__ == "__main__":
    sys.exit(main())
