"""leasegh — GitHubとgitからsnapshotを集め、許可された書込みだけを行う。

書込みは`Writes`の許可リストを通したものだけが実行される。許可リストはcommandごとに固定し
（packet 規則の意味6、二重境界）、リストに無い書込みは例外で止める。dry-runでは許可リストが空である。
"""
import datetime, hashlib, json, os, re, shutil, subprocess, tempfile, time, urllib.parse

import leasecore as C

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))


class WriteRefused(Exception):
    pass


class Writes:
    """許可する書込みの集合。kind: comment（issue番号）／push_main／issue_body（issue番号）／graphql_delete_review（review node id）。"""
    def __init__(self, allowed=()):
        self.allowed = set(allowed)
        self.done = []

    def check(self, kind, target):
        if (kind, target) not in self.allowed:
            raise WriteRefused("許可されていない書込み: %s %s" % (kind, target))
        self.done.append((kind, target))


class Runner:
    """外部commandの実行。selftestでは偽の実装に差し替える。"""
    def run(self, args, input=None, cwd=None, env=None, check=True):
        p = subprocess.run(args, input=input, cwd=cwd or ROOT, env=env, capture_output=True)
        if check and p.returncode != 0:
            raise RuntimeError("%s: %s" % (" ".join(args[:4]), p.stderr.decode("utf-8", "replace")[:500]))
        return p


class GH:
    def __init__(self, runner=None, writes=None, repo=C.REPO):
        self.r = runner or Runner()
        self.w = writes or Writes()
        self.repo = repo

    # ----- 読取り -----
    def api(self, path, paginate=False, method="GET"):
        args = ["gh", "api", "-X", method, path]
        if paginate:
            args.insert(2, "--paginate")
        out = self.r.run(args).stdout.decode("utf-8")
        if paginate:
            # --paginateは配列をそのまま連結して出すため、"]["を境に結合する
            out = "[" + re.sub(r"\]\s*\[", ",", out.strip())[1:] if out.strip().startswith("[") else out
        return json.loads(out) if out.strip() else None

    def graphql(self, query, **vars):
        args = ["gh", "api", "graphql", "-f", "query=%s" % query]
        for k, v in vars.items():
            args += ["-F" if isinstance(v, int) else "-f", "%s=%s" % (k, v)]
        return json.loads(self.r.run(args).stdout.decode("utf-8"))

    def git(self, *args, input=None, check=True):
        return self.r.run(["git"] + list(args), input=input, check=check)

    # ----- 書込み（許可リストを通す） -----
    def comment(self, issue, body):
        self.w.check("comment", issue)
        p = self.r.run(["gh", "api", "-X", "POST", "repos/%s/issues/%d/comments" % (self.repo, issue), "--input", "-"],
                       input=json.dumps({"body": body}).encode("utf-8"))
        return json.loads(p.stdout.decode("utf-8"))

    def issue_body(self, issue, body):
        self.w.check("issue_body", issue)
        p = self.r.run(["gh", "api", "-X", "PATCH", "repos/%s/issues/%d" % (self.repo, issue), "--input", "-"],
                       input=json.dumps({"body": body}).encode("utf-8"))
        return json.loads(p.stdout.decode("utf-8"))

    def push_main(self, sha):
        """通常のpush（force pushでない）。mainが検査後に動いていればGitHubが拒否する（compare-and-swap）。"""
        self.w.check("push_main", "main")
        return self.git("push", "origin", "%s:refs/heads/main" % sha, check=False)

    def delete_review(self, node_id):
        self.w.check("graphql_delete_review", node_id)
        q = "mutation($id:ID!){deletePullRequestReview(input:{pullRequestReviewId:$id}){pullRequestReview{id}}}"
        return self.r.run(["gh", "api", "graphql", "-f", "query=%s" % q, "-f", "id=%s" % node_id], check=False)


# ---------- 補助 ----------
def epoch(ts):
    if not ts:
        return None
    return datetime.datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp()


def blob_sha256(gh, rev, path):
    p = gh.git("cat-file", "-p", "%s:%s" % (rev, path), check=False)
    if p.returncode != 0:
        return None
    return hashlib.sha256(p.stdout).hexdigest()


def blob_text(gh, rev, path):
    p = gh.git("cat-file", "-p", "%s:%s" % (rev, path), check=False)
    return p.stdout.decode("utf-8", "replace") if p.returncode == 0 else None


def ls_tree(gh, rev, prefix):
    p = gh.git("ls-tree", "-r", "--name-only", rev, "--", prefix, check=False)
    return [l for l in p.stdout.decode("utf-8").splitlines() if l]


def diff_files(gh, base, tree):
    """name-status -M。renameは旧pathの削除と新pathの追加に分ける。行は -U0 --text --no-textconv --no-ext-diff。"""
    ns = gh.git("diff", "--name-status", "-M", base, tree).stdout.decode("utf-8").splitlines()
    files = []
    for l in ns:
        parts = l.split("\t")
        st = parts[0][0]
        if st == "R":
            files.append({"path": parts[1], "status": "D"})
            files.append({"path": parts[2], "status": "A"})
        else:
            files.append({"path": parts[1], "status": st})
    for f in files:
        f["before_sha"] = blob_sha256(gh, base, f["path"])
        d = gh.git("diff", "-U0", "--text", "--no-textconv", "--no-ext-diff", base, tree, "--", f["path"]).stdout.decode("utf-8", "replace")
        f["added"] = [l[1:] for l in d.splitlines() if l.startswith("+") and not l.startswith("+++")]
        f["removed"] = [l[1:] for l in d.splitlines() if l.startswith("-") and not l.startswith("---")]
    return files


def load_lease(gh, rev):
    t = blob_text(gh, rev, C.LEASE_RECORD)
    try:
        lease = json.loads(t) if t else {}
    except json.JSONDecodeError:
        return {}
    if lease.get("expires_at"):
        lease["expires_epoch"] = epoch(lease["expires_at"])
    return lease


# ---------- 状態領域 ----------
def state_path():
    return os.environ.get("HELIX_LEASE_STATE") or os.path.expanduser("~/.helix-lease/state.json")


def read_state():
    try:
        with open(state_path(), encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"suspended": None, "observed_review_ids": {}}


def write_state(st):
    p = state_path()
    os.makedirs(os.path.dirname(p), exist_ok=True)
    tmp = p + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(st, f, ensure_ascii=False, indent=1)
    os.replace(tmp, p)


# ---------- snapshot ----------
def comments_of(gh, issue):
    out = []
    for c in gh.api("repos/%s/issues/%d/comments?per_page=100" % (gh.repo, issue), paginate=True) or []:
        out.append({"id": c["id"], "user": (c.get("user") or {}).get("login"), "created_at": c["created_at"],
                    "updated_at": c["updated_at"], "created_epoch": epoch(c["created_at"]), "body": c.get("body") or ""})
    return out


def reviews_of(gh, pr):
    rs = gh.api("repos/%s/pulls/%d/reviews?per_page=100" % (gh.repo, pr), paginate=True) or []
    owner, name = gh.repo.split("/")
    q = ("query($o:String!,$n:String!,$p:Int!,$c:String){repository(owner:$o,name:$n){pullRequest(number:$p){"
         "reviews(first:100,after:$c){pageInfo{hasNextPage endCursor} nodes{databaseId id lastEditedAt}}}}}")
    edited, cursor = {}, None
    while True:
        vars = {"o": owner, "n": name, "p": pr}
        if cursor:
            vars["c"] = cursor
        d = gh.graphql(q, **vars)["data"]["repository"]["pullRequest"]["reviews"]
        for n in d["nodes"]:
            edited[n["databaseId"]] = (n["lastEditedAt"], n["id"])
        if not d["pageInfo"]["hasNextPage"]:
            break
        cursor = d["pageInfo"]["endCursor"]
    return [{"id": r["id"], "node_id": edited.get(r["id"], (None, None))[1], "user": (r.get("user") or {}).get("login"),
             "state": r.get("state"), "commit_id": r.get("commit_id"), "submitted_at": r.get("submitted_at"),
             "body": r.get("body") or "", "last_edited_at": edited.get(r["id"], (None, None))[0]} for r in rs]


def events_review_ids(gh, pr, po):
    try:
        evs = gh.api("repos/%s/events?per_page=100" % gh.repo, paginate=True) or []
    except RuntimeError:
        return None   # 補助。取得できなければ省く（packet「補助のAPIを失った場合」）
    out = []
    for e in evs:
        if e.get("type") == "PullRequestReviewEvent" and (e.get("actor") or {}).get("login") == po:
            pl = e.get("payload") or {}
            if (pl.get("pull_request") or {}).get("number") == pr:
                out.append((pl.get("review") or {}).get("id"))
    return [x for x in out if x]


def protection(gh):
    try:
        bp = gh.api("repos/%s/branches/main/protection" % gh.repo)
    except RuntimeError:
        bp = None
    norm = None
    if bp:
        norm = {"allow_force_pushes": (bp.get("allow_force_pushes") or {}).get("enabled"),
                "allow_deletions": (bp.get("allow_deletions") or {}).get("enabled"),
                "enforce_admins": (bp.get("enforce_admins") or {}).get("enabled")}
    rules = []
    for r in gh.api("repos/%s/rulesets?per_page=100" % gh.repo, paginate=True) or []:
        full = gh.api("repos/%s/rulesets/%d" % (gh.repo, r["id"])) or {}
        rules.append({"id": r["id"], "name": r.get("name"), "enforcement": full.get("enforcement"),
                      "bypass_actors": full.get("bypass_actors") or []})
    return {"branch_protection": norm, "rulesets": sorted(rules, key=lambda x: x["id"])}


def activity(gh, origin):
    """refs/heads/mainの更新を、起点に達するまでpaginationで取得し、時系列昇順に並べる。"""
    try:
        items = gh.api("repos/%s/activity?ref=refs/heads/main&per_page=100" % gh.repo, paginate=True) or []
    except RuntimeError as e:
        return {"temporary_failure": True, "detail": str(e)[:200]}
    items = sorted(items, key=lambda x: x.get("timestamp") or "")
    pos = None
    for i, it in enumerate(items):
        if it.get("after") == origin:
            pos = i
    if pos is None:
        return {"reached_origin": False, "items": []}   # 起点のpushが保持期間の外
    out = []
    for it in items[pos + 1:]:
        msg = gh.git("log", "-1", "--format=%B", it.get("after") or "", check=False).stdout.decode("utf-8", "replace")
        parents = gh.git("log", "-1", "--format=%P", it.get("after") or "", check=False).stdout.decode().split()
        out.append({"before": it.get("before"), "after": it.get("after"), "activity_type": it.get("activity_type"),
                    "actor": (it.get("actor") or {}).get("login"), "commit_message": msg, "is_merge": len(parents) == 2})
    return {"reached_origin": True, "items": out}


def lease_carried(gh, main, path):
    """recordをmainへ入れたfirst-parent上のcommitが、PO判断の記録を持つlease mergeか。"""
    p = gh.git("log", "--first-parent", "--diff-filter=A", "--format=%H", main, "--", path, check=False)
    shas = p.stdout.decode().split()
    if not shas:
        return False
    msg = gh.git("log", "-1", "--format=%B", shas[-1]).stdout.decode("utf-8", "replace")
    return ("lease_receipt: %s" % C.LEASE_ID in msg or "lease_recovery:" in msg) and \
        ("decision_source: review" in msg or "decision_source: comment" in msg)


def snapshot(gh, pr_number, executor_context, lease_rev="origin/main"):
    gh.git("fetch", "-q", "origin", "main", "+refs/pull/%d/head:refs/lease/pr-%d" % (pr_number, pr_number))
    main = gh.git("rev-parse", "origin/main").stdout.decode().strip()
    pr = gh.api("repos/%s/pulls/%d" % (gh.repo, pr_number))
    head = pr["head"]["sha"]
    lease = load_lease(gh, main)
    tree_p = gh.git("merge-tree", "--write-tree", main, head, check=False)
    merge_tree = tree_p.stdout.decode().split("\n")[0].strip() if tree_p.returncode == 0 else None
    files = diff_files(gh, main, merge_tree) if merge_tree else []
    st = read_state()
    idt = lease.get("identity") or {}
    po = idt.get("po")
    s = {
        "now_epoch": time.time(), "lease": lease, "executor_context": executor_context,
        "pr": {"repo": gh.repo, "number": pr_number, "base_ref": pr["base"]["ref"], "state": pr["state"].upper(),
               "draft": pr.get("draft"), "head_sha": head, "mergeable": pr.get("mergeable") is True and merge_tree is not None,
               "auto_merge": pr.get("auto_merge"), "body": pr.get("body") or ""},
        "pair_base": main, "pair_head": head, "main_head": main, "merge_tree": merge_tree,
        "diff": {"files": files},
    }
    paths = {f["path"] for f in files}
    comments = comments_of(gh, pr_number)
    s["comments"] = comments
    for c in comments:   # 操作入力のpathもmerge treeで測る
        blk = C.lease_block(c["body"])
        if blk and blk[0].get("kind") == "review_request":
            for v in ((blk[0].get("payload") or {}).get("operation_inputs") or {}).values():
                if isinstance(v, dict) and v.get("path"):
                    paths.add(v["path"])
    s["main_files"] = {p: blob_sha256(gh, main, p) for p in paths}
    s["merge_files"] = {p: blob_sha256(gh, merge_tree, p) for p in paths} if merge_tree else {}
    recs = {}
    for p in ls_tree(gh, main, C.DECISIONS):
        t = blob_text(gh, main, p)
        recs[p] = {"sha256": blob_sha256(gh, main, p), "text": t, "carried_by_lease": lease_carried(gh, main, p)}
    s["main_records"] = recs
    s["decision_shas"] = [r["sha256"] for r in recs.values()]
    ups, upshas = set(), []
    for rev in filter(None, (main, merge_tree)):
        for bp in ls_tree(gh, rev, "scaffold/bindings/"):
            try:
                b = json.loads(blob_text(gh, rev, bp) or "{}")
            except json.JSONDecodeError:
                continue
            for u in b.get("upstream") or []:
                ups.add(u.get("path"))
                upshas.append(u.get("sha256"))
    s["binding_upstreams"] = sorted(x for x in ups if x)
    s["upstream_shas"] = [x for x in upshas if x]
    s["merge_texts"] = {f["path"]: blob_text(gh, merge_tree, f["path"]) for f in files
                        if f["path"].startswith(C.DECISIONS) and f["status"] == "A"}
    s["lease_record_before"] = load_lease(gh, main) or None
    s["lease_record_after"] = load_lease(gh, merge_tree) if merge_tree else None
    s["reviews"] = reviews_of(gh, pr_number)
    s["observed_review_ids"] = (st.get("observed_review_ids") or {}).get(str(pr_number), [])
    s["events_review_ids"] = events_review_ids(gh, pr_number, po) if po else None
    si = lease.get("status_issue")
    s["status_comments"] = comments_of(gh, si) if si else []
    tp = (lease.get("probe") or {}).get("test_pr")
    s["test_review_ids_present"] = [r["id"] for r in reviews_of(gh, tp)] if tp else []
    s["suspended_local"] = bool(st.get("suspended"))
    last_resume = lease.get("last_resume_at")
    susp = False
    for c in s["status_comments"]:
        blk = C.lease_block(c["body"])
        if blk and blk[0].get("kind") == "lease_state" and blk[0].get("lease_state") == "suspended":
            if not last_resume or (c["created_epoch"] or 0) > (epoch(last_resume) or 0):
                susp = True
    s["suspended_issue"] = susp
    audited = (lease.get("audit") or {}).get("last_audited_main") or lease.get("origin_main")
    n = 0
    if audited:
        for sha in gh.git("rev-list", "--first-parent", "%s..%s" % (audited, main), check=False).stdout.decode().split():
            if "lease_receipt: %s" % C.LEASE_ID in gh.git("log", "-1", "--format=%B", sha).stdout.decode("utf-8", "replace"):
                n += 1
    s["unaudited_merges"] = n
    s["protection"] = protection(gh)
    s["roles"] = {}
    for l in C.ai_logins(lease):
        try:
            s["roles"][l] = (gh.api("repos/%s/collaborators/%s/permission" % (gh.repo, urllib.parse.quote(l))) or {}).get("role_name")
        except RuntimeError:
            s["roles"][l] = None
    s["app_permissions"] = []
    origin = lease.get("origin_main")
    last = None
    for sha in gh.git("rev-list", "--first-parent", "%s..%s" % (origin, main), check=False).stdout.decode().split() if origin else []:
        if "lease_receipt: %s" % C.LEASE_ID in gh.git("log", "-1", "--format=%B", sha).stdout.decode("utf-8", "replace"):
            last = sha
            break
    s["activity_origin"] = last or origin
    s["activity"] = activity(gh, s["activity_origin"]) if s["activity_origin"] else {"reached_origin": False, "items": []}
    return s


# ---------- 検査（隔離環境） ----------
def run_checks(gh, tree, overlay_main=None, protected=None):
    """treeを使い捨てdirectoryへ展開し、network名前空間を切り離し、資格情報を持たない環境でscfctl／govcheckを実行する。
    overlay_mainを渡すと、保護面のpathをmain HEADの版へ置き換えた(b)のtreeで実行する。"""
    d = tempfile.mkdtemp(prefix="lease-check-")
    try:
        arc = gh.git("archive", "--format=tar", tree).stdout
        subprocess.run(["tar", "-x", "-C", d], input=arc, check=True)
        if overlay_main and protected:
            for p in protected:
                dst = os.path.join(d, p)
                data = gh.git("cat-file", "-p", "%s:%s" % (overlay_main, p), check=False)
                if data.returncode == 0:
                    os.makedirs(os.path.dirname(dst), exist_ok=True)
                    with open(dst, "wb") as f:
                        f.write(data.stdout)
                elif os.path.exists(dst):
                    os.remove(dst)
        env = {"PATH": "/usr/bin:/bin", "HOME": d, "LANG": "C.UTF-8"}
        outs, ok, stale = [], True, None
        cmds = [["python3", "scaffold/tools/scfctl.py", c] for c in ("validate", "stale", "residuals", "selftest")]
        cmds.append(["python3", "scaffold/governance/tools/govcheck.py"])
        for cmd in cmds:
            p = subprocess.run(["unshare", "-rn"] + cmd, cwd=d, env=env, capture_output=True)
            text = (p.stdout + p.stderr).decode("utf-8", "replace")
            last = text.strip().splitlines()[-1] if text.strip() else ""
            outs.append("%s rc=%d %s" % (" ".join(cmd[1:]), p.returncode, last))
            if p.returncode != 0:
                ok = False
            m = re.search(r"stale=(\d+)", text)
            if cmd[-1] == "stale" and m:
                stale = int(m.group(1))
        return {"ok": ok, "stale": stale, "summary": " | ".join(outs)}
    finally:
        shutil.rmtree(d, ignore_errors=True)   # 自分がmkdtempで作った使い捨てdirectoryだけを消す


def snapshot_after(gh, pr, s, pushed):
    """merge後のread-afterに使う観測（packet「merge後」）。"""
    main = gh.git("rev-parse", "origin/main").stdout.decode().strip()
    a = {"lease": s.get("lease"), "main_head": main,
         "main_tree": gh.git("rev-parse", "%s^{tree}" % main).stdout.decode().strip(),
         "main_parents": gh.git("log", "-1", "--format=%P", main).stdout.decode().split(),
         "protection": protection(gh), "app_permissions": [], "activity_origin": s.get("activity_origin")}
    a["roles"] = {}
    for l in C.ai_logins(s.get("lease") or {}):
        try:
            a["roles"][l] = (gh.api("repos/%s/collaborators/%s/permission" % (gh.repo, urllib.parse.quote(l))) or {}).get("role_name")
        except RuntimeError:
            a["roles"][l] = None
    a["activity"] = activity(gh, s.get("activity_origin")) if s.get("activity_origin") else {"reached_origin": False, "items": []}
    a["activity_has_push"] = any(it.get("after") == pushed for it in (a["activity"].get("items") or []))
    a["stale"] = run_checks(gh, a["main_tree"]).get("stale")
    try:
        a["pr_merged"] = bool((gh.api("repos/%s/pulls/%d" % (gh.repo, pr)) or {}).get("merged"))
    except RuntimeError:
        a["pr_merged"] = False
    return a


def sync_snapshot(gh, issue, after=False):
    """projection_syncの照合に使う観測（packet lease 2）。"""
    gh.git("fetch", "-q", "origin", "main")
    main = gh.git("rev-parse", "origin/main").stdout.decode().strip()
    lease = load_lease(gh, main)
    pj = lease.get("projection") or {}
    src = (pj.get("mapping") or {}).get(str(issue))
    it = gh.api("repos/%s/issues/%d" % (gh.repo, issue)) or {}
    body = (it.get("body") or "").encode("utf-8")
    snap = {"lease": lease, "issue": issue, "now_epoch": time.time(), "source_path": src, "source_commit": main,
            "remote_body_sha256": hashlib.sha256(body).hexdigest(), "state": it.get("state"),
            "labels": sorted(l.get("name") for l in it.get("labels") or [])}
    si = lease.get("status_issue")
    snap["status_comments"] = comments_of(gh, si) if si else []
    tp = (lease.get("probe") or {}).get("test_pr")
    snap["test_review_ids_present"] = [r["id"] for r in reviews_of(gh, tp)] if tp else []
    st = read_state()
    snap["suspended_local"] = bool(st.get("suspended"))
    if src:
        t = gh.git("cat-file", "-p", "%s:%s" % (main, src), check=False)
        snap["source_text"] = t.stdout.decode("utf-8") if t.returncode == 0 else None
        snap["source_sha256"] = hashlib.sha256(t.stdout).hexdigest() if t.returncode == 0 else None
    # 直前のreceipt: mainのreceipts_dirにある、同じIssueの最新のreceipt
    rdir = pj.get("receipts_dir")
    last = None
    for p in sorted(ls_tree(gh, main, rdir)) if rdir else []:
        try:
            r = json.loads(blob_text(gh, main, p) or "{}")
        except json.JSONDecodeError:
            continue
        if r.get("issue") == issue and (last is None or (r.get("written_at") or "") > (last.get("written_at") or "")):
            last = r
    pending = ((st.get("pending_sync") or {}).get(str(issue)))
    snap["last_receipt"] = None if not last else {"on_main": not pending or pending == last.get("receipt_id"),
                                                  "written_sha256": last.get("after_sha256")}
    if after:
        owner, name = gh.repo.split("/")
        q = ("query($o:String!,$n:String!,$i:Int!){repository(owner:$o,name:$n){issue(number:$i){"
             "userContentEdits(first:2){nodes{diff editedAt}}}}}")
        try:
            nodes = gh.graphql(q, o=owner, n=name, i=issue)["data"]["repository"]["issue"]["userContentEdits"]["nodes"]
            prev = nodes[1]["diff"] if len(nodes) > 1 else None
            snap["previous_edit_sha256"] = hashlib.sha256(prev.encode("utf-8")).hexdigest() if prev is not None else None
        except (RuntimeError, KeyError, IndexError, TypeError):
            snap["previous_edit_sha256"] = None
    return snap
