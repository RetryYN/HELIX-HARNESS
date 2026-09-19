"""leasegh — GitHubとgitからsnapshotを集め、許可された書込みだけを行う。

書込みは`Writes`の許可リストを通したものだけが実行される。許可リストはcommandごとに固定し
（packet 規則の意味6、二重境界）、リストに無い書込みは例外で止める。dry-runでは許可リストが空である。
"""
import atexit, base64, urllib.request, datetime, hashlib, json, os, re, shutil, subprocess, tempfile, time, urllib.parse

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
        if env is None:   # 呼出し元の環境からcommit時刻・author・committerの上書きを受け取らない
            env = {k: v for k, v in os.environ.items() if not k.startswith(("GIT_COMMITTER_", "GIT_AUTHOR_"))}
        p = subprocess.run(args, input=input, cwd=cwd or ROOT, env=env, capture_output=True)
        if check and p.returncode != 0:
            raise RuntimeError("%s: %s" % (" ".join(args[:4]), p.stderr.decode("utf-8", "replace")[:500]))
        return p


def isolated_git_env():
    """executorのgit環境: 呼出し元のGIT_*を受け取らず、system・globalの設定とreplace objectsを読まない。"""
    env = {k: v for k, v in os.environ.items() if not k.startswith("GIT_")}
    env.update({"GIT_CONFIG_NOSYSTEM": "1", "GIT_CONFIG_GLOBAL": os.devnull, "GIT_NO_REPLACE_OBJECTS": "1",
                "GIT_TERMINAL_PROMPT": "0"})
    return env


class GH:
    def __init__(self, runner=None, writes=None, repo=C.REPO, isolated=None):
        self.r = runner or Runner()
        self.w = writes or Writes()
        self.repo = repo
        # 実際のrunnerでは、共有の作業treeと.gitを使わず、実行ごとの使い捨てbare repositoryへ明示したURLからfetchする
        # （AI側contextが書ける`git replace`・.git/config・info/attributes・未commitのbytesを判定に入れない）
        self.isolated = (runner is None) if isolated is None else isolated
        self._gd = None

    def _git_dir(self):
        if self._gd is None:
            self._gd = tempfile.mkdtemp(prefix="lease-git-")
            atexit.register(shutil.rmtree, self._gd, True)   # 自分がmkdtempで作った使い捨てdirectoryだけを消す
            env = isolated_git_env()
            for args in (["init", "-q", "--bare"], ["remote", "add", "origin", "https://github.com/%s.git" % self.repo]):
                self.r.run(["git", "--git-dir", self._gd] + args, env=env, cwd=self._gd)
        return self._gd

    # ----- 読取り -----
    def api(self, path, paginate=False, method="GET"):
        args = ["gh", "api", "-X", method, path]
        if paginate:
            args[2:2] = ["--paginate", "--slurp"]   # 全pageを配列の配列で受け取り、本文を書き換えずに連結する
        out = self.r.run(args).stdout.decode("utf-8")
        if not out.strip():
            return None
        d = json.loads(out)
        if paginate:
            return [x for page in d for x in (page if isinstance(page, list) else [page])]
        return d

    def graphql(self, query, **vars):
        args = ["gh", "api", "graphql", "-f", "query=%s" % query]
        for k, v in vars.items():
            args += ["-F" if isinstance(v, int) else "-f", "%s=%s" % (k, v)]
        return json.loads(self.r.run(args).stdout.decode("utf-8"))

    def git(self, *args, input=None, check=True):
        # core.quotepath=falseと-z（呼出し側）で、非ASCIIのpathを引用符付き8進表記にしない
        if not self.isolated:
            return self.r.run(["git", "-c", "core.quotepath=false"] + list(args), input=input, check=check)
        gd = self._git_dir()
        return self.r.run(["git", "--git-dir", gd, "--no-replace-objects", "-c", "core.quotepath=false",
                           "-c", "credential.helper=", "-c", "credential.helper=!gh auth git-credential"] + list(args),
                          input=input, check=check, env=isolated_git_env(), cwd=gd)

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
    p = gh.git("ls-tree", "-r", "-z", "--name-only", rev, "--", prefix, check=False)
    return [l for l in p.stdout.decode("utf-8").split("\0") if l]


def diff_files(gh, base, tree):
    """name-status。renameとcopyは検出せず（--no-renames）、旧pathの削除と新pathの追加として並べる。pathは-zのNUL区切りで
    引用符なしに読む。行は -U0 --text --no-textconv --no-ext-diff、pathspecはliteral。"""
    raw = gh.git("diff", "-z", "--no-renames", "--name-status", base, tree).stdout.decode("utf-8").split("\0")
    files = []
    for st, path in zip(raw[0::2], raw[1::2]):
        if st:
            files.append({"path": path, "status": st[0]})
    for f in files:
        f["before_sha"] = blob_sha256(gh, base, f["path"])
        d = gh.git("diff", "-U0", "--no-renames", "--text", "--no-textconv", "--no-ext-diff", base, tree, "--",
                   ":(literal)" + f["path"]).stdout.decode("utf-8", "replace")
        f["added"] = [l[1:] for l in d.splitlines() if l.startswith("+") and not l.startswith("+++")]
        f["removed"] = [l[1:] for l in d.splitlines() if l.startswith("-") and not l.startswith("---")]
    return files


def lease_record_committed_epoch(gh, rev):
    p = gh.git("log", "-1", "--first-parent", "--format=%ct", rev, "--", C.LEASE_RECORD, check=False)
    t = p.stdout.decode().strip()
    return float(t) if t else None


def load_lease(gh, rev):
    t = blob_text(gh, rev, C.LEASE_RECORD)
    try:
        lease = json.loads(t) if t else {}
    except json.JSONDecodeError:
        return {}
    if lease.get("expires_at"):
        lease["expires_epoch"] = epoch(lease["expires_at"])
    if isinstance(lease, dict) and lease:
        lease["record_committed_epoch"] = lease_record_committed_epoch(gh, rev)
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


def local_suspended(st, lease):
    """状態領域の停止のうち、lease記録の直近の解除判断（last_resume_at）より後のもの（packet「状態の保存」）。"""
    sp = (st or {}).get("suspended")
    if not sp:
        return False
    lr = C.resume_epoch(lease, epoch)
    return not (lr and (epoch(sp.get("at")) or 0) <= lr)


def binding_state(gh, rev):
    """leaseを担うScaffold（SCF-B-0004）のstate。retireされた時点でleaseは失効する（packet「期限」）。"""
    try:
        return (json.loads(blob_text(gh, rev, C.LEASE_BINDING) or "{}") or {}).get("state")
    except json.JSONDecodeError:
        return None


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
    """branch protectionとrulesetを取得する。取得できない、または`bypass_actors`が返らない場合は`unavailable`とし、
    判定側で基準値と一致しない（停止）として扱う（空の一致にしない）。"""
    try:
        bp = gh.api("repos/%s/branches/main/protection" % gh.repo)
        rules = []
        for r in gh.api("repos/%s/rulesets?per_page=100" % gh.repo, paginate=True) or []:
            full = gh.api("repos/%s/rulesets/%d" % (gh.repo, r["id"])) or {}
            if "bypass_actors" not in full:
                return {"unavailable": True, "detail": "ruleset %s のbypass_actorsが返らない" % r["id"]}
            rules.append({"id": r["id"], "name": r.get("name"), "enforcement": full.get("enforcement"),
                          "bypass_actors": full.get("bypass_actors")})
    except RuntimeError as e:
        return {"unavailable": True, "detail": str(e)[:200]}
    if not isinstance(bp, dict):
        return {"unavailable": True, "detail": "branch protectionが返らない"}
    norm = {"allow_force_pushes": (bp.get("allow_force_pushes") or {}).get("enabled"),
            "allow_deletions": (bp.get("allow_deletions") or {}).get("enabled"),
            "enforce_admins": (bp.get("enforce_admins") or {}).get("enabled")}
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
        row = {"before": it.get("before"), "after": it.get("after"), "activity_type": it.get("activity_type"),
               "actor": (it.get("actor") or {}).get("login"), "commit_message": msg, "is_merge": len(parents) == 2,
               "first_parent": parents[0] if parents else None}
        # bootstrap: lease記録を未有効から有効へ変えたmerge（packet: 後続operation_change PRは既存規則でmergeする）
        if row["is_merge"] and row["first_parent"] == row["before"]:
            row["activates_lease"] = (not (load_lease(gh, row["before"]) or {}).get("activated_at")
                                      and bool((load_lease(gh, row["after"]) or {}).get("activated_at")))
        out.append(row)
    return {"reached_origin": True, "items": out}


def roles_of(gh, lease):
    """identity表のAI側loginの実効repository role。GitHub Appのlogin（`<slug>[bot]`）はapp権限で照合するため取得しない。"""
    apps = set(((lease or {}).get("identity") or {}).get("apps") or [])
    out = {}
    for l in C.ai_logins(lease or {}):
        if l.endswith("[bot]") and l[:-len("[bot]")] in apps:
            continue
        try:
            out[l] = (gh.api("repos/%s/collaborators/%s/permission" % (gh.repo, urllib.parse.quote(l))) or {}).get("role_name")
        except RuntimeError:
            out[l] = None
    return out


def recovery_merge_results(gh, lease, main):
    """起点以降のfirst-parent上の非常mergeと、その`merge_result`のread-after結果（再開recordの列挙照合に使う）。"""
    origin = (lease or {}).get("origin_main")
    out = []
    for sha in gh.git("rev-list", "--first-parent", "%s..%s" % (origin, main), check=False).stdout.decode().split() if origin else []:
        v = verified_lease_merge(gh, sha, lease, recovery_ok=True)
        if v and v["kind"] == "recovery":
            for c in comments_of(gh, v["pr"]):
                blk = C.lease_block(c.get("body"))
                if blk and blk[0].get("kind") == "merge_result" and blk[0].get("merge_commit") == sha:
                    out.append({"merge_commit": sha, "read_after": blk[0].get("read_after")})
                    break
            else:
                out.append({"merge_commit": sha, "read_after": None})
    return out


def b64url(b):
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode("ascii")


def app_jwt(app_id, key_path, now=None):
    """GitHub AppのJWT（RS256）。署名はopensslで行い、秘密鍵はexecutorの実行環境の`HELIX_LEASE_APP_KEY_DIR/<slug>.pem`に置く。"""
    now = int(now or time.time())
    head = b64url(json.dumps({"alg": "RS256", "typ": "JWT"}, separators=(",", ":")).encode())
    body = b64url(json.dumps({"iat": now - 60, "exp": now + 540, "iss": str(app_id)}, separators=(",", ":")).encode())
    sig = subprocess.run(["openssl", "dgst", "-sha256", "-sign", key_path], input=("%s.%s" % (head, body)).encode(),
                         capture_output=True, check=True).stdout
    return "%s.%s.%s" % (head, body, b64url(sig))


def app_permissions(gh, lease):
    """identity表の`apps`ごとに、本repositoryへのinstallationの実際の権限を、AppのJWTで`GET /repos/{repo}/installation`から
    取得する（Appの定義（`GET /apps/{slug}`）ではなく、installationの権限）。取得できなければunavailableとして返し、判定側で停止原因にする。"""
    out = []
    kdir = os.environ.get("HELIX_LEASE_APP_KEY_DIR")
    for slug in ((lease or {}).get("identity") or {}).get("apps") or []:
        try:
            app_id = (gh.api("apps/%s" % urllib.parse.quote(slug)) or {}).get("id")
            key = os.path.join(kdir, "%s.pem" % slug) if kdir else None
            if not app_id or not key or not os.path.isfile(key):
                raise RuntimeError("app idまたは秘密鍵が無い")
            req = urllib.request.Request("https://api.github.com/repos/%s/installation" % gh.repo, headers={
                "Authorization": "Bearer %s" % app_jwt(app_id, key), "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28"})
            with urllib.request.urlopen(req, timeout=30) as r:
                inst = json.loads(r.read().decode("utf-8"))
            out.append({"slug": slug, "app_slug": inst.get("app_slug"), "permissions": inst.get("permissions"),
                        "repository_selection": inst.get("repository_selection")})
        except (RuntimeError, OSError, ValueError, subprocess.CalledProcessError) as e:
            out.append({"slug": slug, "unavailable": True, "detail": str(e)[:200]})
    return out


def verified_lease_merge(gh, sha, lease, recovery_ok=False, comments_fn=None):
    """shaが、executor（または非常経路）の書いたlease mergeか。messageの部分一致では決めず、次をすべて確かめる。
    (1) 親が2つ (2) messageの1行目・3行目がreceipt_messageの固定の形 (3) 対象PRに、executor側login（accept_bootstrap_riskでは
    AI側login）が投稿した`merge_result`があり、その`merge_commit`がshaである。人間のUI mergeや第三者はこれを満たせない。"""
    parents = gh.git("log", "-1", "--format=%P", sha, check=False).stdout.decode().split()
    if len(parents) != 2:
        return None
    lines = gh.git("log", "-1", "--format=%B", sha, check=False).stdout.decode("utf-8", "replace").split("\n")
    m = re.match(r"^Merge pull request #(\d+) via Capability Lease$", lines[0] if lines else "")
    if not m or len(lines) < 3:
        return None
    pr = int(m.group(1))
    if lines[2] == "lease_receipt: %s" % C.LEASE_ID:
        kind = "lease"
    elif recovery_ok and lines[2] == "lease_recovery: %d" % pr:
        kind = "recovery"
    else:
        return None
    if "pr: %d" % pr not in lines:
        return None
    idt = (lease or {}).get("identity") or {}
    if lease.get("independence") == "accept_bootstrap_risk":
        writers = {idt.get("ai")}
    else:
        writers = {idt.get("executor")} | ({idt.get("recovery")} if kind == "recovery" else set())
    writers.discard(None)
    try:
        cs = (comments_fn or (lambda n: comments_of(gh, n)))(pr)
    except RuntimeError:
        return None
    for c in cs:
        blk = C.lease_block(c.get("body"))
        if c.get("user") in writers and blk and blk[0].get("kind") == "merge_result" and blk[0].get("merge_commit") == sha:
            return {"kind": kind, "pr": pr, "lines": lines}
    return None


def verify_self(gh):
    """実行中のexecutor command群のbytesが、origin/mainの`scaffold/lease/`の版と一致するか（未commitの書換えで判定を変えない）。
    これだけでは循環するため、POが許可する実行場所はAI側contextから書けないread-onlyのcopyに限る（README「有効化」）。"""
    gh.git("fetch", "-q", "origin", "main")
    bad = []
    for f in sorted(os.listdir(HERE)):
        if f.endswith(".py"):
            with open(os.path.join(HERE, f), "rb") as fh:
                local = hashlib.sha256(fh.read()).hexdigest()
            if local != blob_sha256(gh, "origin/main", "scaffold/lease/%s" % f):
                bad.append(f)
    return bad


def lease_at(gh, lease_pr=None):
    """lease記録を読む。lease_prを渡すと、そのPRのheadのlease記録（有効化を運ぶ後続operation_change PRの、merge前の実測用）。
    lease_prは、main上のlease記録が未有効の間だけ受け付ける（有効化後はmain上の保護面の記録だけを使う）。"""
    gh.git("fetch", "-q", "origin", "main")
    main_lease = load_lease(gh, "origin/main")
    if not lease_pr:
        return main_lease
    if main_lease.get("activated_at"):
        raise RuntimeError("main上のlease記録は有効化済み。--lease-prは有効化前だけ使える")
    gh.git("fetch", "-q", "origin", "+refs/pull/%d/head:refs/lease/pr-%d" % (lease_pr, lease_pr))
    return load_lease(gh, "refs/lease/pr-%d" % lease_pr)


def probe_snapshot(gh, lease):
    """実測の状態（probe_status）の判定に使う観測。"""
    si, tp = lease.get("status_issue"), (lease.get("probe") or {}).get("test_pr")
    po = (lease.get("identity") or {}).get("po")
    return {"lease": lease, "now_epoch": time.time(), "status_comments": comments_of(gh, si) if si else [],
            "test_review_ids_present": [r["id"] for r in reviews_of(gh, tp) if r.get("user") == po] if tp else [],
            "test_review_states": {r["id"]: r.get("state") for r in reviews_of(gh, tp) if r.get("user") == po} if tp else {}}


def lease_carried(gh, main, path, origin, lease=None, comments_fn=None):
    """recordをmainへ入れたfirst-parent上のcommitが、lease有効化の起点より後の、PO判断の記録を持つ検証済みのlease merge
    （または非常経路のmerge）か。起点以前（有効化前の既存規則でのmerge）のcommitは当たらない（packet 根拠に使えるrecord）。"""
    if not origin:
        return False
    p = gh.git("log", "--first-parent", "--diff-filter=A", "--format=%H", main, "--", ":(literal)" + path, check=False)
    shas = p.stdout.decode().split()
    if not shas:
        return False
    after_origin = set(gh.git("rev-list", "--first-parent", "%s..%s" % (origin, main), check=False).stdout.decode().split())
    if shas[-1] not in after_origin:
        return False
    v = verified_lease_merge(gh, shas[-1], lease or {}, recovery_ok=True, comments_fn=comments_fn)
    return bool(v) and ("decision_source: review" in v["lines"] or "decision_source: comment" in v["lines"])


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
        recs[p] = {"sha256": blob_sha256(gh, main, p), "text": t,
                   "carried_by_lease": lease_carried(gh, main, p, lease.get("origin_main"), lease)}
    s["main_records"] = recs
    # 判断recordの本文に現れるSHA-256（packet authority面の検出: 変更前bytesのSHA-256がrecordに現れる）
    s["decision_shas"] = sorted({h for r in recs.values() for h in C.sha256_mentions(r.get("text"))})
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
    trs = [r for r in reviews_of(gh, tp) if r.get("user") == po] if tp else []
    s["test_review_ids_present"] = [r["id"] for r in trs]
    s["test_review_states"] = {r["id"]: r.get("state") for r in trs}
    s["suspended_local"] = local_suspended(st, lease)
    s["lease_binding_state"] = binding_state(gh, main)
    s["suspended_issue"] = C.suspended_in_status_issue(s["status_comments"], lease, epoch)
    audited = (lease.get("audit") or {}).get("last_audited_main") or lease.get("origin_main")
    n = 0
    if audited:
        for sha in gh.git("rev-list", "--first-parent", "%s..%s" % (audited, main), check=False).stdout.decode().split():
            if verified_lease_merge(gh, sha, lease):
                n += 1
    s["unaudited_merges"] = n
    s["protection"] = protection(gh)
    s["roles"] = {}
    s["roles"] = roles_of(gh, lease)
    s["app_permissions"] = app_permissions(gh, lease)
    s["recovery_merge_results"] = recovery_merge_results(gh, lease, main)
    origin = lease.get("origin_main")
    last = None
    for sha in gh.git("rev-list", "--first-parent", "%s..%s" % (origin, main), check=False).stdout.decode().split() if origin else []:
        v = verified_lease_merge(gh, sha, lease)   # 非常mergeは起点にしない（executor以外の更新として検出する）
        if v and v["kind"] == "lease":
            last = sha
            break
    s["activity_origin"] = last or origin
    s["activity"] = activity(gh, s["activity_origin"]) if s["activity_origin"] else {"reached_origin": False, "items": []}
    new_origin = (s.get("lease_record_after") or {}).get("origin_main")
    if new_origin and new_origin != origin:   # 起点を付け直すrecordを運ぶmergeは、新しい起点から照合する
        s["activity_by_origin"] = {new_origin: activity(gh, new_origin)}
    return s


# ---------- 検査（隔離環境） ----------
# user・network・mount名前空間を切り、展開したtreeを/mntへbindしてから、HOME（GitHubの資格情報）・/tmp・executorの状態領域・
# 実行中のworking treeを空のtmpfsで覆う（packet 検査(a)(b)「資格情報・状態領域・networkに触れられない使い捨ての環境」）。
ISOLATE = ('mount --bind "$1" /mnt || exit 97; n=$2; shift 2; i=0; '
           'while [ $i -lt $n ]; do mount -t tmpfs lease-hide "$1" || exit 97; shift; i=$((i+1)); done; '
           'cd /mnt && exec "$@"')


def run_checks(gh, tree, overlay_main=None, protected=None, extra_hidden=None):
    """treeを使い捨てdirectoryへ展開し、隔離した名前空間で、資格情報を持たない環境でscfctl／govcheckを実行する。
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
        env = {"PATH": "/usr/bin:/bin", "HOME": "/tmp", "LANG": "C.UTF-8", "PYTHONNOUSERSITE": "1"}   # /tmpは空のtmpfs
        top = ROOT   # executorのcodeを置いたcheckout（検査からは見せない）
        cand = sorted({os.path.realpath(x) for x in [os.path.expanduser("~"), "/tmp", os.path.dirname(state_path()), top]
                       + list(extra_hidden or ()) if x and os.path.isdir(x)})
        # 既に覆うdirectoryの配下は覆えない（覆った後は存在しない）ため、祖先だけを残す
        hide = [x for x in cand if not any(x != y and x.startswith(y.rstrip("/") + "/") for y in cand)]
        outs, ok, stale = [], True, None
        py = ["python3", "-s", "-E"]   # user site（usercustomize・.pth）とPYTHON*環境変数を読まない
        cmds = [py + ["scaffold/tools/scfctl.py", c] for c in ("validate", "stale", "residuals", "selftest")]
        cmds.append(py + ["scaffold/governance/tools/govcheck.py"])
        for cmd in cmds:
            p = subprocess.run(["unshare", "-rnm", "--pid", "--fork", "--mount-proc", "--", "sh", "-c", ISOLATE, "sh", d,
                                str(len(hide))] + hide + cmd,
                               cwd="/", env=env, capture_output=True)
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
         "protection": protection(gh), "app_permissions": app_permissions(gh, s.get("health_lease") or s.get("lease") or {}),
         "activity_origin": s.get("activity_origin"),
         "health_lease": s.get("health_lease")}
    a["roles"] = roles_of(gh, s.get("health_lease") or s.get("lease") or {})   # 付け直し後は新しいidentity表で照合する
    a["activity"] = activity(gh, s.get("activity_origin")) if s.get("activity_origin") else {"reached_origin": False, "items": []}
    ho = (s.get("health_lease") or {}).get("origin_main")
    if s.get("health_lease") and ho and ho != s.get("activity_origin"):
        a["activity_by_origin"] = {ho: activity(gh, ho)}
        a["activity"] = a["activity_by_origin"][ho]
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
    trs = [r for r in reviews_of(gh, tp) if r.get("user") == ((lease.get("identity") or {}).get("po"))] if tp else []
    snap["test_review_ids_present"] = [r["id"] for r in trs]
    snap["test_review_states"] = {r["id"]: r.get("state") for r in trs}
    st = read_state()
    snap["suspended_local"] = local_suspended(st, lease)
    snap["lease_binding_state"] = binding_state(gh, main)
    snap["suspended_issue"] = C.suspended_in_status_issue(snap["status_comments"], lease, epoch)   # 停止は両lease共通
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
