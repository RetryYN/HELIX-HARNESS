#!/usr/bin/env python3
"""appsetup — Capability Leaseの有効化でPOが越えるtrust boundaryだけを扱う道具（実行userはexecutor user）。

  appsetup.py create --repo OWNER/NAME [--port N]   GitHub App manifest flowのURLを出し、認可の戻りで秘密鍵を受け取る
  appsetup.py token                                 installation tokenを1つ発行して標準出力へ出す（executor userだけ）
  appsetup.py show                                  App slug・id・installation権限を出す（秘密は出さない）

秘密鍵と設定は実行userのhomeの`.helix-lease/apps/`に0600で置く。AI側contextはこのuserになれないため読めない。
POの操作はbrowserでの作成・installの認可だけで、値の作成・転記はしない。標準libraryだけを使う。
"""
import argparse, http.server, json, os, pwd, ssl, stat, subprocess, sys, threading, time, urllib.parse, urllib.request

CA_FILE = "/etc/ssl/certs/ca-certificates.crt"
API = "https://api.github.com"
PERMISSIONS = {"contents": "write", "pull_requests": "write", "issues": "write", "metadata": "read",
               "administration": "read"}


def home():
    return pwd.getpwuid(os.getuid()).pw_dir


def app_dir():
    base = os.path.join(home(), ".helix-lease")
    for d in (base, os.path.join(base, "apps")):
        if os.path.islink(d):
            raise RuntimeError("App設定の置き場所がsymlinkです（差し替えを受け付けない）: %s" % d)
        os.makedirs(d, mode=0o700, exist_ok=True)
        if os.stat(d).st_mode & 0o077:
            raise RuntimeError("App設定の置き場所が他のuserから読めます: %s" % d)
    return os.path.join(base, "apps")


def opener():
    """呼出し元のproxy環境変数を使わず、固定のtrust storeで検証し、redirectに従わない経路。"""
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *a, **k):
            return None
    ctx = ssl.create_default_context(cafile=CA_FILE)
    return urllib.request.build_opener(urllib.request.ProxyHandler({}), urllib.request.HTTPSHandler(context=ctx), NoRedirect)


def api(path, token=None, jwt=None, method="GET", data=None):
    h = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if jwt:
        h["Authorization"] = "Bearer %s" % jwt
    elif token:
        h["Authorization"] = "token %s" % token
    req = urllib.request.Request(API + path, headers=h, method=method,
                                 data=json.dumps(data).encode("utf-8") if data is not None else None)
    with opener().open(req, timeout=30) as r:
        body = r.read().decode("utf-8")
    return json.loads(body) if body.strip() else {}


def b64url(b):
    import base64
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode("ascii")


def app_jwt(app_id, key_path, now=None):
    now = int(now or time.time())
    head = b64url(json.dumps({"alg": "RS256", "typ": "JWT"}, separators=(",", ":")).encode())
    body = b64url(json.dumps({"iat": now - 60, "exp": now + 540, "iss": str(app_id)}, separators=(",", ":")).encode())
    sig = subprocess.run(["/usr/bin/openssl", "dgst", "-sha256", "-sign", key_path],
                         input=("%s.%s" % (head, body)).encode(), capture_output=True, check=True,
                         env={"PATH": "/usr/bin:/bin"}).stdout
    return "%s.%s.%s" % (head, body, b64url(sig))


def app_file():
    """App設定のfile。symlinkなら（AI側から差し替えられる）使わない。"""
    p = os.path.join(app_dir(), "app.json")
    if os.path.islink(p):
        raise RuntimeError("App設定のfileがsymlinkです（差し替えを受け付けない）: %s" % p)
    return p


def load_app():
    p = app_file()
    if not os.path.exists(p):
        raise RuntimeError("GitHub Appがまだ作られていない（appsetup.py create を先に実行する）")
    with open(os.open(p, os.O_RDONLY | os.O_NOFOLLOW), encoding="utf-8") as f:
        return json.load(f)


def manifest(repo, redirect):
    owner, name = repo.split("/")
    return {"name": "helix-lease-%s" % name.lower()[:20], "url": "https://github.com/%s" % repo,
            "hook_attributes": {"active": False}, "redirect_url": redirect, "public": False,
            "default_permissions": PERMISSIONS, "default_events": []}


PAGE = """<!doctype html><meta charset="utf-8"><title>HELIX Capability Lease</title>
<body style="font-family:sans-serif;margin:3em">
<h1>Capability Lease: GitHub Appの作成</h1>
<p>下のbuttonでGitHubへ進み、Appの作成を認可してください。権限と名前は入力済みです。</p>
<form action="%s" method="post"><input type="hidden" name="manifest" value='%s'>
<button type="submit" style="font-size:1.2em;padding:.6em 1.2em">GitHub Appを作成する</button></form>
</body>"""

DONE = """<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;margin:3em">
<h1>%s</h1><p>%s</p></body>"""


def cmd_create(a):
    import secrets
    state = {"code": None, "nonce": secrets.token_urlsafe(16)}
    port = a.port

    class H(http.server.BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def do_GET(self):
            u = urllib.parse.urlparse(self.path)
            if u.path == "/" + state["nonce"]:
                owner = a.repo.split("/")[0]
                action = "https://github.com/organizations/%s/settings/apps/new?state=%s" % (owner, state["nonce"]) if a.org \
                    else "https://github.com/settings/apps/new?state=%s" % state["nonce"]
                page = PAGE % (action, json.dumps(manifest(a.repo, "http://127.0.0.1:%d/done/%s" % (port, state["nonce"]))).replace("'", "&#39;"))
                self.respond(page)
            elif u.path == "/done/" + state["nonce"]:
                q = urllib.parse.parse_qs(u.query)
                if q.get("state", [None])[0] != state["nonce"]:   # 同じhostの他processからの横取り・妨害を受け取らない
                    self.respond(DONE % ("stateが一致しません", "この戻りは捨てます。最初のURLからやり直してください。"), 400)
                    return
                state["code"] = q.get("code", [None])[0]
                self.respond(DONE % ("受け取りました", "端末の表示に従って、次にこのAppをこのrepositoryにだけinstallしてください。"))
            else:
                self.respond(DONE % ("不明なURL", ""), 404)

        def respond(self, body, code=200):
            b = body.encode("utf-8")
            self.send_response(code)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(b)))
            self.end_headers()
            self.wfile.write(b)

    srv = http.server.HTTPServer(("127.0.0.1", port), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    # URLのpathは推測できない値にする（同じhostの他processが受け口へ先に投げるのを防ぐ）
    print("browserで次を開き、[GitHub Appを作成する]を押してください: http://127.0.0.1:%d/%s" % (port, state["nonce"]), flush=True)
    deadline = time.time() + a.timeout
    while state["code"] is None and time.time() < deadline:
        time.sleep(0.5)
    srv.shutdown()
    if not state["code"]:
        print("拒否: 時間内に認可の戻りがなかった", file=sys.stderr)
        return 2
    conv = api("/app-manifests/%s/conversions" % urllib.parse.quote(state["code"]), method="POST")
    slug, app_id = conv.get("slug"), conv.get("id")
    key = os.path.join(app_dir(), "%s.pem" % slug)
    fd = os.open(key, os.O_WRONLY | os.O_CREAT | os.O_EXCL, stat.S_IRUSR | stat.S_IWUSR)   # 0600以外で存在する瞬間を作らない
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(conv["pem"])
    with open(os.open(app_file(), os.O_WRONLY | os.O_CREAT | os.O_TRUNC | os.O_NOFOLLOW, 0o600), "w",
              encoding="utf-8") as f:
        json.dump({"slug": slug, "id": app_id, "repo": a.repo, "html_url": conv.get("html_url")}, f, ensure_ascii=False)
    print(json.dumps({"slug": slug, "app_id": app_id, "key": key,
                      "install_url": "https://github.com/apps/%s/installations/new" % slug}, ensure_ascii=False))
    print("次にbrowserで install_url を開き、このrepositoryだけを選んでinstallしてください。", flush=True)
    return 0


def installation(app):
    jwt = app_jwt(app["id"], os.path.join(app_dir(), "%s.pem" % app["slug"]))
    return api("/repos/%s/installation" % app["repo"], jwt=jwt), jwt


def cmd_token(a):
    app = load_app()
    inst, jwt = installation(app)
    tok = api("/app/installations/%d/access_tokens" % inst["id"], jwt=jwt, method="POST")
    print(tok["token"])
    return 0


def cmd_show(a):
    app = load_app()
    inst, _ = installation(app)
    print(json.dumps({"slug": app["slug"], "app_id": app["id"], "login": "%s[bot]" % app["slug"],
                      "permissions": inst.get("permissions"), "repository_selection": inst.get("repository_selection"),
                      "installation_id": inst.get("id")}, ensure_ascii=False, sort_keys=True))
    return 0


def main(argv=None):
    ap = argparse.ArgumentParser(prog="appsetup", allow_abbrev=False)
    sp = ap.add_subparsers(dest="cmd", required=True)
    p = sp.add_parser("create", allow_abbrev=False)
    p.add_argument("--repo", required=True); p.add_argument("--port", type=int, default=8765)
    p.add_argument("--timeout", type=int, default=900); p.add_argument("--org", action="store_true")
    sp.add_parser("token", allow_abbrev=False)
    sp.add_parser("show", allow_abbrev=False)
    seen = set()
    for x in (argv if argv is not None else sys.argv[1:]):
        if x.startswith("--") and x.split("=")[0] in seen:
            print("拒否: 同じoptionが2回以上ある: %s" % x.split("=")[0], file=sys.stderr)
            return 2
        if x.startswith("--"):
            seen.add(x.split("=")[0])
    a = ap.parse_args(argv)
    try:
        return {"create": cmd_create, "token": cmd_token, "show": cmd_show}[a.cmd](a)
    except (RuntimeError, OSError, ValueError, KeyError) as e:
        print("失敗: %s" % str(e)[:300], file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
