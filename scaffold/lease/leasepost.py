#!/usr/bin/env python3
"""leasepost — review依頼・delivery receipt・応答commentを、対象PRへだけ投稿する投稿command（packet 規則の意味6）。

  python3 scaffold/lease/leasepost.py request  --pr N --class C --reviewer-target RUNTIME --request-file F
          --creator RUNTIME,MODEL,PROVIDER,SESSION [--basis F.json] [--op-inputs F.json] [--apply]
  python3 scaffold/lease/leasepost.py response --pr N --request-id RID --reviewer RUNTIME,MODEL,PROVIDER,SESSION
          --counts B,M,m --authority-basis-sufficient yes|no --new-authority-created no|yes
          [--operation-admission pass|fail] [--transcription-faithful yes|no] [--transcribed] --text-file F [--apply]

依頼は、投稿後に本文をread-afterし、一致したときだけdelivery receiptを続けて投稿する（運用モデルの依頼送信・read-after・receipt
appendの手順）。書き込めるのは`--pr`で指定したPRへのcomment作成だけで、編集・削除・他のPR／Issueへの書込みはしない。
既定はdry-runで、投稿する本文を表示するだけである。
"""
import argparse, json, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))


def _preflight(here):
    """HEREをsys.pathへ入れてcommand群をimportする前に、copyに既知のentry以外（`__pycache__`のpyc、標準libraryを覆うmodule・
    package、拡張module）が無いことを標準libraryだけで確かめる（`-I`で起動したときだけ。bytesの照合は起動条件で行う）。"""
    known = {"README.md", "cases", "lease.json", "leasecore.py", "leasectl.py", "leasefixtures.py", "leasegh.py",
             "leasepost.py", "leaseprobe.py", "leaserecover.py"}
    stray = [n for n in os.listdir(here) if n not in known]
    cd = os.path.join(here, "cases")
    stray += ["cases/" + n for n in (os.listdir(cd) if os.path.isdir(cd) else []) if not n.endswith(".json")]
    if sys.flags.isolated and stray:
        print("拒否: copyに既知でないentryがある（importの前に止める）: %s" % ", ".join(sorted(stray)), file=sys.stderr)
        sys.exit(2)


_preflight(HERE)
sys.path.insert(0, HERE)
import leasecore as C   # noqa: E402
import leasegh as G     # noqa: E402


def ctx(v):
    parts = v.split(",")
    if len(parts) != 4 or not all(parts):
        raise ValueError("contextはRUNTIME,MODEL,PROVIDER,SESSIONの4つ")
    return dict(zip(("runtime", "model", "provider", "session"), parts))


def block(o):
    return "```helix-lease\n%s\n```" % json.dumps(o, ensure_ascii=False, sort_keys=True)


def canon(o):
    return json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def current_pair(gh, pr):
    gh.git("fetch", "-q", "origin", "main")
    main = gh.git("rev-parse", "origin/main").stdout.decode().strip()
    p = gh.api("repos/%s/pulls/%d" % (gh.repo, pr))
    if p.get("state") != "open":
        raise ValueError("PR #%d はopenでない" % pr)
    return main, p["head"]["sha"]


def cmd_request(a, gh):
    base, head = current_pair(gh, a.pr)
    payload = {"pr_class": a.pr_class, "authority_basis": json.load(open(a.basis, encoding="utf-8")) if a.basis else [],
               "operation_inputs": json.load(open(a.op_inputs, encoding="utf-8")) if a.op_inputs else {},
               "creator": ctx(a.creator), "reviewer_target": a.reviewer_target,
               "request_text": open(a.request_file, encoding="utf-8").read()}
    rid = "RR-%d-%s" % (a.pr, time.strftime("%Y%m%dT%H%M%SZ", time.gmtime()))
    req = {"kind": "review_request", "review_request_id": rid, "pr": a.pr, "base": base, "head": head,
           "payload": payload, "payload_sha256": C.sha256_text(canon(payload))}
    body = block(req) + "\n\n" + payload["request_text"]
    if not a.apply:
        print(body)
        return 0
    c = gh.comment(a.pr, body)
    got = gh.api("repos/%s/issues/comments/%d" % (gh.repo, c["id"])) or {}
    remote = got.get("body") or ""
    delivered = remote == body and C.sha256_text(remote) == C.sha256_text(body)
    rc = {"kind": "review_request_delivery_receipt", "receipt_id": "RC-%s" % rid, "review_request_id": rid, "pr": a.pr,
          "base": base, "head": head, "payload_sha256": req["payload_sha256"], "request_comment_id": c["id"],
          "remote_body_sha256": C.sha256_text(remote), "read_after_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
          "delivery_result": "delivered" if delivered else "failed"}
    gh.comment(a.pr, block(rc))
    print(json.dumps({"review_request_id": rid, "request_comment_id": c["id"], "delivery_result": rc["delivery_result"]},
                     ensure_ascii=False))
    return 0 if delivered else 1


def cmd_response(a, gh):
    base, head = current_pair(gh, a.pr)
    b, M, m = (int(x) for x in a.counts.split(","))
    resp = {"kind": "review_response", "review_request_id": a.request_id, "pr": a.pr, "base": base, "head": head,
            "reviewer": ctx(a.reviewer), "counts": {"blocker": b, "major": M, "minor": m},
            "authority_basis_sufficient": a.authority_basis_sufficient, "new_authority_created": a.new_authority_created,
            "transcribed": bool(a.transcribed)}
    if a.operation_admission:
        resp["operation_admission"] = a.operation_admission
    if a.transcription_faithful:
        resp["transcription_faithful"] = a.transcription_faithful
    text = open(a.text_file, encoding="utf-8").read()
    body = block(resp) + "\n\n" + ("（reviewer出力の全文転記）\n\n" if a.transcribed else "") + text
    if not a.apply:
        print(body)
        return 0
    c = gh.comment(a.pr, body)
    print(json.dumps({"response_comment_id": c["id"]}, ensure_ascii=False))
    return 0


def main(argv=None):
    ap = argparse.ArgumentParser(prog="leasepost")
    sp = ap.add_subparsers(dest="cmd", required=True)
    p = sp.add_parser("request")
    p.add_argument("--pr", type=int, required=True); p.add_argument("--class", dest="pr_class", required=True)
    p.add_argument("--reviewer-target", required=True); p.add_argument("--request-file", required=True)
    p.add_argument("--creator", required=True); p.add_argument("--basis"); p.add_argument("--op-inputs")
    p.add_argument("--apply", action="store_true")
    p = sp.add_parser("response")
    p.add_argument("--pr", type=int, required=True); p.add_argument("--request-id", required=True)
    p.add_argument("--reviewer", required=True); p.add_argument("--counts", required=True)
    p.add_argument("--authority-basis-sufficient", choices=("yes", "no"), required=True)
    p.add_argument("--new-authority-created", choices=("yes", "no"), required=True)
    p.add_argument("--operation-admission", choices=("pass", "fail")); p.add_argument("--transcription-faithful", choices=("yes", "no"))
    p.add_argument("--transcribed", action="store_true"); p.add_argument("--text-file", required=True)
    p.add_argument("--apply", action="store_true")
    a = ap.parse_args(argv)
    gh = G.GH(writes=G.Writes({("comment", a.pr)} if a.apply else ()))
    if a.apply:   # 投稿commandも、executorと同じ起動条件（-I・rootが所有する置き場所・origin/mainとのbytes照合）で動く
        bad = G.self_integrity(gh)
        if bad:
            print("拒否: 投稿commandの起動条件を満たさない: %s" % "、".join(bad), file=sys.stderr)
            return 2
    try:
        return {"request": cmd_request, "response": cmd_response}[a.cmd](a, gh)
    except G.WriteRefused as e:
        print("拒否: %s" % e, file=sys.stderr)
        return 2
    except (RuntimeError, ValueError, OSError) as e:
        print("入力不正・内部エラー: %s" % e, file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
