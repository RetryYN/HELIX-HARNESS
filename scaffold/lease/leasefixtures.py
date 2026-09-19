"""leasefixtures — negative caseの土台になる、admissionが成立するsnapshotを組み立てる。

caseは cases/*.json に置き、ここで作った土台へpatchを当てて期待する拒否理由を確かめる。
値はすべて架空であり、実在のlogin・commit・commentを指さない。
"""
import copy, json

import leasecore as C

NOW = 1790000000                     # 2026-09-21頃のepoch（固定）
DAY = 86400
B = "b" * 40                         # 検査したmain HEAD（=review済みbase）
H = "c" * 40                         # review済みcontent HEAD
PO, AI = "po-human", "helix-app[bot]"   # AI側identityはGitHub App
CREATOR = {"runtime": "claude-code", "model": "opus", "provider": "anthropic", "session": "creator-1"}
REVIEWERS = [{"runtime": "claude-agent", "model": "opus", "provider": "anthropic", "session": "reviewer-opus-1"},
             {"runtime": "codex", "model": "gpt-5.6-sol", "provider": "openai", "session": "reviewer-sol-1"}]


def sha(ch):
    return ch * 64


def canon(o):
    return json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def block(o):
    return "```helix-lease\n%s\n```" % json.dumps(o, ensure_ascii=False, sort_keys=True)


def lease_record():
    return {
        "lease_id": C.LEASE_ID, "independence": "accept_bootstrap_risk",
        "activated_at": "2026-09-21T00:00:00+09:00", "expires_at": "2026-12-31T23:59:59+09:00",
        "revoked_at": None,
        "identity": {"po": PO, "ai": AI, "creator": AI, "executor": AI, "recovery": AI, "reviewers": [{"login": AI}],
                     "apps": ["helix-app"]},
        "baseline": {"branch_protection": {"allow_force_pushes": False, "allow_deletions": False, "enforce_admins": True},
                     "rulesets": []},
        "origin_main": B, "status_issue": 3000,
        "probe": {"test_pr": 3001,
                  "test_reviews": [{"id": 9001, "state": "APPROVED"}, {"id": 9002, "state": "CHANGES_REQUESTED"}],
                  "activation_results": [60001, 60002],
                  "activation_test_reviews": [{"id": 9001, "state": "APPROVED"}, {"id": 9002, "state": "CHANGES_REQUESTED"}]},   # 有効化前の実測結果（40日前。現在の実測の鮮度には数えない）
        "probe_paths": ["scaffold/lease/leaseprobe.py"],
        "audit": {}, "audit_records": [],
        "tool_inputs": ["docs/governance/candidates/legacy-rule-derived-requirements.md"],
        "projection": {"mapping": {}},
    }


def probe_comments(logins, tests, result="denied", age=DAY, cid0=70000):
    out, cid = [], cid0
    for l in logins:
        for t in tests:
            cid += 1
            o = {"kind": "lease_probe_result", "login": l, "review_id": t["id"], "review_state": t["state"], "result": result}
            ts = "2026-09-20T00:00:%02dZ" % (cid % 60)
            out.append({"id": cid, "user": l, "created_at": ts, "updated_at": ts, "created_epoch": NOW - age, "body": block(o)})
    return out


def review_comments(pr, pr_class, basis=None, op_inputs=None, extra=None):
    """依頼2件・receipt 2件・応答2件を、依頼→receipt→応答の時刻順で作る。"""
    out, t = [], 0

    def ts():
        nonlocal t
        t += 1
        return "2026-09-20T01:%02d:00Z" % t
    for i, rv in enumerate(REVIEWERS):
        rid = "RR-%d-%d" % (pr, i + 1)
        payload = {"pr_class": pr_class, "authority_basis": basis or [], "operation_inputs": op_inputs or {},
                   "creator": CREATOR, "reviewer_target": rv["runtime"], "request_text": "exact pairを読みfindingを返す"}
        req = {"kind": "review_request", "review_request_id": rid, "pr": pr, "base": B, "head": H,
               "payload": payload, "payload_sha256": C.sha256_text(canon(payload))}
        s = ts()
        req_c = {"id": 50000 + i * 10, "user": AI, "created_at": s, "updated_at": s, "body": block(req)}
        rc = {"kind": "review_request_delivery_receipt", "receipt_id": "RC-%s" % rid, "review_request_id": rid, "pr": pr,
              "base": B, "head": H, "payload_sha256": req["payload_sha256"], "request_comment_id": req_c["id"],
              "remote_body_sha256": C.sha256_text(req_c["body"]), "delivery_result": "delivered"}
        s = ts()
        rc_c = {"id": 50001 + i * 10, "user": AI, "created_at": s, "updated_at": s, "body": block(rc)}
        out += [req_c, rc_c]
    for i, rv in enumerate(REVIEWERS):
        rid = "RR-%d-%d" % (pr, i + 1)
        resp = {"kind": "review_response", "review_request_id": rid, "pr": pr, "base": B, "head": H, "reviewer": rv,
                "counts": {"blocker": 0, "major": 0, "minor": 0}, "authority_basis_sufficient": "yes",
                "new_authority_created": "no", "transcribed": False}
        resp.update(extra or {})
        s = ts()
        out.append({"id": 50002 + i * 10, "user": AI, "created_at": s, "updated_at": s,
                    "body": block(resp) + "\n\n応答全文（架空）"})
    return out


def common(pr, pr_class, files, main_files, merge_files):
    lease = lease_record()
    return {
        "now_epoch": NOW,
        "lease": dict(lease, expires_epoch=NOW + 90 * DAY, activated_epoch=NOW - 30 * DAY),
        "pr": {"repo": C.REPO, "number": pr, "base_ref": "main", "state": "OPEN", "draft": False, "head_sha": H,
               "mergeable": True, "auto_merge": None, "body": "## PRの目的\n\n架空\n\n## PR区分\n\n%s\n" % pr_class},
        "pair_base": B, "pair_head": H, "main_head": B, "executor_context": "executor-1",
        "diff": {"files": files}, "main_files": main_files, "merge_files": merge_files,
        "main_records": {}, "merge_texts": {}, "decision_shas": [], "upstream_shas": [], "binding_upstreams": [
            "docs/governance/candidates/legacy-rule-derived-requirements.md"],
        "reviews": [], "observed_review_ids": [], "events_review_ids": None,
        "status_comments": probe_comments([AI], lease["probe"]["test_reviews"])
        + probe_comments([AI], lease["probe"]["test_reviews"], age=40 * DAY, cid0=60000),
        "test_review_ids_present": [9001, 9002],
        "suspended_local": False, "suspended_issue": False, "unaudited_merges": 0,
        "protection": copy.deepcopy(lease["baseline"]),
        "roles": {}, "app_permissions": [{"slug": "helix-app", "app_slug": "helix-app", "repository_selection": "selected", "permissions": {
            "contents": "write", "pull_requests": "write", "issues": "write", "metadata": "read", "administration": "read"}}],
        "activity": {"reached_origin": True, "items": []}, "activity_origin": B,
    }


def base_rf():
    """repository_foundation。authority面にも保護面にも触れない1 file。"""
    files = [{"path": "docs/governance/notes/example.md", "status": "M", "before_sha": sha("1"),
              "added": ["説明を足す"], "removed": ["説明"]}]
    s = common(2001, "repository_foundation", files, {"docs/governance/notes/example.md": sha("1")},
               {"docs/governance/notes/example.md": sha("2")})
    s["comments"] = review_comments(2001, "repository_foundation")
    return s


BASIS_PATH = "docs/governance/decisions/example-approval.md"


def basis_record(scope, targets=None, decision="approve"):
    at = targets or []
    lines = ["---", "decision: %s" % decision, "decider_role: PO"]
    if at:
        lines.append("approved_targets:")
        for t in at:
            lines += ["  - path: %s" % t["path"], "    from_sha256: %s" % t["from_sha256"], "    sha256: %s" % t["sha256"]]
    else:
        lines.append("approved_targets: []")
    lines.append("scope_paths:")
    lines += ["  - %s" % p for p in scope]
    lines += ["---", "", "# 架空の判断record", ""]
    return "\n".join(lines)


def base_oc():
    """operation_change。操作authorityのrecordを根拠にし、必須入力5件をmerge commitに持つ。"""
    inputs = {k: {"path": "docs/governance/audits/op/%s.md" % k, "sha256": sha("%x" % (i + 3))}
              for i, k in enumerate(C.OP_INPUTS) if k != "operation_authority"}
    inputs["operation_authority"] = {"path": BASIS_PATH, "sha256": sha("a")}
    files = [{"path": v["path"], "status": "A", "before_sha": None, "added": ["記録"], "removed": []}
             for k, v in inputs.items() if k != "operation_authority"]
    merge_files = {v["path"]: v["sha256"] for v in inputs.values()}
    s = common(2002, "operation_change", files, {BASIS_PATH: sha("a")}, merge_files)
    text = basis_record([v["path"] for v in inputs.values()])
    s["main_records"] = {BASIS_PATH: {"sha256": sha("a"), "text": text, "carried_by_lease": True}}
    basis = [{"id": "HDEC-EX-01", "path": BASIS_PATH, "sha256": sha("a")}]
    s["comments"] = review_comments(2002, "operation_change", basis, inputs, {"operation_admission": "pass"})
    return s


REC = "docs/governance/decisions/example-decision-2026.md"
TARGET = "docs/concept/example.md"


def base_dr():
    """decision_record。record 1件と、recordが承認した対象file 1件。最新のPO reviewがapprove。"""
    rec_text = basis_record([REC, TARGET], [{"path": TARGET, "from_sha256": sha("5"), "sha256": sha("6")}])
    files = [{"path": REC, "status": "A", "before_sha": None, "added": rec_text.split("\n"), "removed": []},
             {"path": TARGET, "status": "M", "before_sha": sha("5"), "added": ["承認対象の本文"], "removed": ["旧本文"]}]
    s = common(2003, "decision_record", files, {TARGET: sha("5")}, {TARGET: sha("6"), REC: C.sha256_text(rec_text)})
    s["merge_texts"] = {REC: rec_text}
    s["reviews"] = [{"id": 8001, "user": PO, "state": "APPROVED", "commit_id": H, "submitted_at": "2026-09-20T02:00:00Z",
                     "body": "decision: approve", "last_edited_at": None}]
    s["comments"] = review_comments(2003, "decision_record", extra={"transcription_faithful": "yes"})
    return s


BASES = {"rf": base_rf, "oc": base_oc, "dr": base_dr}


def resign(s):
    """payloadを書き換えた後に、依頼のpayload_sha256とreceiptのremote_body_sha256を作り直す（形は正しいままにする）。"""
    reqs = {}
    for c in s.get("comments") or []:
        blk = C.lease_block(c["body"])
        if blk and blk[0].get("kind") == "review_request":
            o = blk[0]
            o["payload_sha256"] = C.sha256_text(canon(o["payload"]))
            c["body"] = block(o)
            reqs[o["review_request_id"]] = c
    for c in s.get("comments") or []:
        blk = C.lease_block(c["body"])
        if blk and blk[0].get("kind") == "review_request_delivery_receipt":
            o = blk[0]
            rq = reqs.get(o["review_request_id"])
            if rq:
                o["payload_sha256"] = C.lease_block(rq["body"])[0]["payload_sha256"]
                o["remote_body_sha256"] = C.sha256_text(rq["body"])
                c["body"] = block(o)
    return s


def _walk(o, path):
    """pathは"a.b.0"か、keyに"."を含むときは["a", "b.md", 0]のようなlist。"""
    keys = path if isinstance(path, list) else path.split(".")
    for k in keys[:-1]:
        o = o[int(k)] if isinstance(o, list) else o[k]
    return o, (int(keys[-1]) if isinstance(o, list) else keys[-1])


def comment_obj(s, idx):
    return C.lease_block(s["comments"][idx]["body"])[0]


def apply_patch(s, ops):
    """patch: set（dot path）／del／append／block_set（comment番号のhelix-lease blockの欄）／resign。"""
    s = copy.deepcopy(s)
    for op in ops:
        kind = op["op"]
        if kind == "set":
            o, k = _walk(s, op["path"]); o[k] = op["value"]
        elif kind == "del":
            o, k = _walk(s, op["path"]); del o[k]
        elif kind == "append":
            o, k = _walk(s, op["path"]); o[k].append(op["value"])
        elif kind == "block_set":
            c = s["comments"][op["comment"]]
            o = C.lease_block(c["body"])[0]
            t, k = _walk(o, op["path"]); t[k] = op["value"]
            rest = c["body"].split("```", 2)[2] if c["body"].count("```") >= 2 else ""
            c["body"] = block(o) + rest[len("\n"):] if rest.startswith("\n") else block(o) + rest
        elif kind == "resign":
            resign(s)
        else:
            raise ValueError("unknown op %s" % kind)
    return s
