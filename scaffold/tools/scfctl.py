#!/usr/bin/env python3
"""scfctl — Scaffold Binding（仮設束縛）の仮組み検査tool。

標準libraryだけで動く。書き込むのは scaffold/ 配下だけ（retire: binding fileのstate、
check-replacement --record / selftest --record: evidence/）。要求・設計・承認・受入は生成しない。

終了code: 0 合格 / 1 不合格 / 2 入力不正
"""
import argparse, datetime, glob, hashlib, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SCF = os.path.dirname(HERE)                       # scaffold/
ROOT = os.path.dirname(SCF)                       # repository root
BINDINGS = os.path.join(SCF, "bindings")
EVIDENCE = os.path.join(SCF, "evidence")
CASES = os.path.join(SCF, "checks", "cases")
SCHEMA = os.path.join(SCF, "schema", "binding.schema.json")

STATES = ["registered", "active", "stale", "conflict", "orphan", "replacing", "retired"]
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
SCOPES = ["schema_interface", "deterministic_behavior", "stub_adapter_connection",
          "source_revision_stale", "negative_case", "forbidden_write_scope"]
LEGACY = re.compile(r"(^|[\s/\"'=:(])archive/legacy-generation-")
SHA = re.compile(r"^[0-9a-f]{64}$")
DATE = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}$")


# ---------- 基本 ----------
def sha256_file(rel):
    p = os.path.join(ROOT, rel)
    if not os.path.isfile(p):
        return None
    with open(p, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def sha256_obj(o):
    return hashlib.sha256(json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def binding_core_digest(b):
    """置換確認が束縛する対象。stateと置換確認の結果そのものは除く。"""
    c = {k: v for k, v in b.items() if k not in ("state", "updated", "retired")}
    r = dict(c.get("replacement", {}))
    r.pop("confirmation_ref", None); r.pop("confirmation_digest", None); r.pop("status", None)
    c["replacement"] = r
    return sha256_obj(c)


def load_bindings(paths=None):
    out = []
    for p in sorted(paths or glob.glob(os.path.join(BINDINGS, "*.json"))):
        with open(p, encoding="utf-8") as f:
            try:
                b = json.load(f)
            except json.JSONDecodeError as e:
                out.append((p, None, ["E_JSON: %s" % e]))
                continue
        out.append((p, b, []))
    return out


# ---------- 検査 ----------
def check_shape(b):
    """schema/binding.schema.json の写し。外部libraryを使わないため手書きで同じ条件を確かめる。"""
    e = []
    req = ["schema_revision", "id", "kind", "title", "product", "owner_candidate", "state", "reason", "upstream",
           "role", "obligations", "connections", "operations", "artifacts", "verification", "replacement", "created", "updated"]
    for k in req:
        if k not in b:
            e.append("E_SHAPE: 必須key欠落 %s" % k)
    if e:
        return e
    allowed = set(req) | {"overlap_reason", "retired"}
    for k in b:
        if k not in allowed:
            e.append("E_SHAPE: 未知のkey %s" % k)
    if b["schema_revision"] != 1: e.append("E_SHAPE: schema_revisionは1")
    if not re.match(r"^SCF-B-[0-9]{4}$", str(b["id"])): e.append("E_SHAPE: id形式 SCF-B-0000")
    if b["kind"] != "scaffold": e.append("E_IDENTITY: kind=%r はScaffoldではない（poc／research／featureは別identity。SCF-HARNESS-006）" % b["kind"])
    if b["product"] not in PRODUCTS: e.append("E_SHAPE: product不正")
    if b["state"] not in STATES: e.append("E_SHAPE: state不正 %r" % b["state"])
    for k in ("title", "owner_candidate", "reason", "role"):
        if not isinstance(b[k], str) or not b[k].strip():
            e.append("E_SHAPE: %s は空にできない" % k)
    if not isinstance(b["upstream"], list) or not b["upstream"]:
        e.append("E_UPSTREAM: 上流が無い（SCF-HARNESS-001）")
    else:
        for u in b["upstream"]:
            if not isinstance(u, dict) or not u.get("path") or not SHA.match(str(u.get("sha256", ""))):
                e.append("E_UPSTREAM: 上流はpathとsha256を持つ（SCF-HARNESS-001）")
    if not isinstance(b["obligations"], list) or not b["obligations"]:
        e.append("E_ROLE: 義務が無い（SCF-HARNESS-002）")
    c = b["connections"]
    if not isinstance(c, dict) or any(k not in c for k in ("consumers", "dependencies", "boundary")) or not str(c.get("boundary", "")).strip():
        e.append("E_ROLE: 接続（consumers／dependencies／boundary）が無い（SCF-HARNESS-002）")
    o = b["operations"]
    if not isinstance(o, dict) or "allowed" not in o or not o.get("forbidden"):
        e.append("E_ROLE: 許可／禁止する操作が無い（SCF-HARNESS-002）")
    if not isinstance(b["artifacts"], list) or not b["artifacts"]:
        e.append("E_ROLE: 仮artifactが無い（SCF-OS-001）")
    v = b["verification"]
    if not isinstance(v, dict) or v.get("evidence_kind") != "scaffold":
        e.append("E_EVIDENCE: evidence_kindはscaffold以外にできない（SCF-HARNESS-004）")
    else:
        for s in v.get("scope") or ["<none>"]:
            if s not in SCOPES:
                e.append("E_EVIDENCE: 仮の検証の対象外 %r（一時契約の範囲だけ。SCF-HARNESS-004）" % s)
        for k in ("oracles", "negative_cases"):
            if not isinstance(v.get(k), list):
                e.append("E_SHAPE: verification.%s はlist" % k)
    r = b["replacement"]
    if not isinstance(r, dict) or any(k not in r for k in ("role_target", "formal_artifacts", "issue", "status")):
        e.append("E_SHAPE: replacementはrole_target／formal_artifacts／issue／statusを持つ")
    else:
        if r["status"] not in ("pending", "in_progress", "confirmed"): e.append("E_SHAPE: replacement.status不正")
        if not isinstance(r["issue"], int): e.append("E_ISSUE: 差し替え台帳Issueの番号が無い（差し替え忘れ防止）")
        if r.get("confirmation_digest") is not None and not SHA.match(str(r["confirmation_digest"])):
            e.append("E_SHAPE: confirmation_digest形式")
    for k in ("created", "updated"):
        if not DATE.match(str(b[k])): e.append("E_SHAPE: %s は YYYY-MM-DD" % k)
    return e


def check_rules(b, all_bindings, fs=True):
    """形式以外の規則。fs=Falseはselftest用にfile systemを見ない。"""
    e = []
    r = b["replacement"]
    # SCF-OS-003: 旧資産を仮設名義で使わない
    for a in b["artifacts"] + list(r.get("formal_artifacts") or []) + list(b["connections"].get("dependencies") or []):
        if LEGACY.search(str(a)):
            e.append("E_LEGACY: 旧世代archiveを指す %s（SCF-OS-003）" % a)
    for op in b["operations"].get("allowed") or []:
        if LEGACY.search(str(op)):
            e.append("E_LEGACY: 旧世代archiveの実行を許可している %s（SCF-OS-003）" % op)
    # SCF-OS-001: 置換先の役割が未特定なら有効化不可
    if b["state"] in ("active", "stale", "replacing") and not r.get("role_target"):
        e.append("E_ACTIVATE: 置換先の役割が未特定のbindingは有効にできない（登録だけ。SCF-OS-001）")
    # SCF-OS-002: orphan
    if fs:
        for u in b["upstream"]:
            if not os.path.isfile(os.path.join(ROOT, u["path"])):
                e.append("E_ORPHAN: 上流が存在しない %s（SCF-OS-002）" % u["path"])
        if b["state"] != "retired":
            for a in b["artifacts"]:
                if not os.path.exists(os.path.join(ROOT, a)):
                    e.append("E_ARTIFACT: 仮artifactが存在しない %s" % a)
    # SCF-OS-002: 二重binding（同じroleを非退役の複数bindingが持つ）
    for o in all_bindings:
        if o is b or o.get("id") == b.get("id"):
            continue
        if o.get("state") != "retired" and b["state"] != "retired" and o.get("role") == b["role"]:
            if not b.get("overlap_reason"):
                e.append("E_DOUBLE: 同じ役割 %r を %s も担っており根拠が無い（SCF-OS-002）" % (b["role"], o.get("id")))
    # 状態遷移の飛び越し（SCF-OS-005）
    if b["state"] == "retired":
        if r.get("status") != "confirmed" or not b.get("retired") or not b["retired"].get("read_after_digest"):
            e.append("E_RETIRE: 置換確認とread-afterを経ずにretiredになっている（SCF-OS-005）")
    if r.get("status") == "confirmed" and b["state"] not in ("replacing", "retired"):
        e.append("E_STATE: 置換確認済みなのに状態が %s（replacing→retiredの順。SCF-OS-005／006）" % b["state"])
    return e


def check_stale(b):
    """上流revisionの変化。fileが変わっていれば stale 候補。"""
    changed = []
    for u in b["upstream"]:
        cur = sha256_file(u["path"])
        if cur is None:
            changed.append((u["path"], "missing"))
        elif cur != u["sha256"]:
            changed.append((u["path"], cur))
    return changed


def check_replacement(b, fs=True):
    """SCF-HARNESS-005／SCF-OS-004: 置換の無損失確認。"""
    e = []
    r = b["replacement"]
    t = r.get("transfer")
    if not r.get("role_target"):
        e.append("E_REPL: 置換先の役割が未特定")
    if not r.get("formal_artifacts"):
        e.append("E_REPL: 正式artifactが未指定")
    if not isinstance(t, dict):
        e.append("E_REPL: transfer（対応表）が無い")
        return e, {}
    if not t.get("role"):
        e.append("E_REPL: 役割の移管先が無い")
    for name, items in (("obligations", b["obligations"]), ("consumers", b["connections"]["consumers"]),
                        ("oracles", b["verification"]["oracles"]), ("negative_cases", b["verification"]["negative_cases"])):
        m = t.get(name) or {}
        for it in items:
            v = m.get(it)
            if v in (None, ""):
                e.append("E_REPL: %s の未移管 %r" % (name, it))
            elif name == "oracles" and isinstance(v, dict) and v.get("dropped") and not v.get("reason"):
                e.append("E_REPL: oracle %r を外すには理由が要る" % it)
        extra = set(m) - set(items)
        if extra:
            e.append("E_REPL: %s にbindingに無い項目 %s" % (name, sorted(extra)))
    # 二重owner／二重writer／二重CI: 移管先が複数の正式artifactを同一項目に持つことは表せないので、
    # 同じ移管先が別bindingの正式側と衝突していないかは residuals で見る。ここでは対象revisionを固定する。
    revs = {}
    if fs:
        for a in r.get("formal_artifacts") or []:
            s = sha256_file(a)
            if s is None:
                e.append("E_REPL: 正式artifactが存在しない %s" % a)
            else:
                revs[a] = s
        want = r.get("target_revisions") or {}
        for a, s in revs.items():
            if a in want and want[a] != s:
                e.append("E_REVISION: 正式artifact %s のrevisionが記録と一致しない（SCF-OS-004）" % a)
        for a in want:
            if a not in revs:
                e.append("E_REVISION: target_revisionsにあるが正式artifactに無い %s" % a)
        if not want:
            e.append("E_REVISION: target_revisions（置換対象のrevision）が未記録（SCF-OS-004）")
    return e, revs


def residuals(bindings, fs=True):
    out = []
    for b in bindings:
        r = b["replacement"]
        if b["state"] == "retired":
            if fs:
                left = [a for a in b["artifacts"] if os.path.exists(os.path.join(ROOT, a))]
                if left:
                    out.append((b["id"], "撤去漏れ: 退役済みだが仮artifactが残る %s（SCF-OS-006）" % left))
            continue
        if r.get("status") == "confirmed":
            out.append((b["id"], "置換確認済みだが未撤去（state=%s）" % b["state"]))
        elif r.get("formal_artifacts"):
            present = [a for a in r["formal_artifacts"] if (not fs) or os.path.exists(os.path.join(ROOT, a))]
            if present:
                out.append((b["id"], "正式artifactが存在するのに置換未完 %s（二重に役割を担っている。SCF-OS-006）" % present))
        if not isinstance(r.get("issue"), int):
            out.append((b["id"], "差し替え台帳Issueが未記載"))
        if b["state"] in ("stale", "orphan", "conflict"):
            out.append((b["id"], "state=%s のまま放置" % b["state"]))
    return out


# ---------- 記録 ----------
def evidence_record(name, payload):
    os.makedirs(EVIDENCE, exist_ok=True)
    payload = dict(payload, evidence_kind="scaffold", authority_effect="none",
                   note="仮の検証の記録。正式なCI／検証／受入の成立を意味しない")
    p = os.path.join(EVIDENCE, name)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=1, sort_keys=True)
        f.write("\n")
    return os.path.relpath(p, ROOT), sha256_file(os.path.relpath(p, ROOT))


# ---------- command ----------
def cmd_validate(args):
    rows = load_bindings()
    bs = [b for _, b, _ in rows if b]
    bad = 0
    for p, b, errs in rows:
        if b:
            errs = check_shape(b)
            if not errs:
                errs += check_rules(b, bs)
        rel = os.path.relpath(p, ROOT)
        if errs:
            bad += 1
            print("FAIL %s" % rel)
            for x in errs: print("  - " + x)
        else:
            print("ok   %s  %s [%s]" % (rel, b["id"], b["state"]))
    print("bindings=%d fail=%d" % (len(rows), bad))
    return 1 if bad else 0


def cmd_list(args):
    for _, b, errs in load_bindings():
        if not b:
            print("?    (parse error)"); continue
        r = b["replacement"]
        print("%s  %-10s  %s\n      役割: %s\n      置換先: %s  正式: %s  Issue: #%s  status: %s" % (
            b["id"], b["state"], b["title"], b["role"], r.get("role_target") or "（未特定）",
            r.get("formal_artifacts") or "（未決）", r.get("issue"), r.get("status")))
    return 0


def cmd_stale(args):
    n = 0
    for _, b, _ in load_bindings():
        if not b or b["state"] == "retired": continue
        ch = check_stale(b)
        if ch:
            n += 1
            print("STALE %s" % b["id"])
            for path, cur in ch: print("  - %s -> %s" % (path, cur))
    print("stale=%d" % n)
    return 1 if n else 0


def cmd_residuals(args):
    bs = [b for _, b, _ in load_bindings() if b]
    res = residuals(bs)
    for i, msg in res: print("%s: %s" % (i, msg))
    print("residuals=%d" % len(res))
    return 1 if res else 0


def find(bid):
    for p, b, _ in load_bindings():
        if b and b["id"] == bid:
            return p, b
    print("E_INPUT: binding %s が無い" % bid); sys.exit(2)


def cmd_check_replacement(args):
    p, b = find(args.id)
    errs, revs = check_replacement(b)
    for x in errs: print("  - " + x)
    if errs:
        print("check-replacement %s: FAIL (%d)" % (b["id"], len(errs))); return 1
    print("check-replacement %s: pass" % b["id"])
    if args.record:
        rel, dig = evidence_record("replacement-%s.json" % b["id"], {
            "binding": b["id"], "result": "pass", "checked_at": datetime.date.today().isoformat(),
            "binding_core_digest": binding_core_digest(b), "target_revisions": revs})
        print("recorded %s\nconfirmation_digest %s" % (rel, dig))
        print("次: binding の replacement.confirmation_ref／confirmation_digest／status=confirmed と state=replacing を人が記入する")
    return 0


def cmd_retire(args):
    p, b = find(args.id)
    r = b["replacement"]
    errs = []
    if b["state"] != "replacing": errs.append("E_RETIRE: state=replacing からだけ撤去できる（現在 %s）" % b["state"])
    if r.get("status") != "confirmed": errs.append("E_RETIRE: 置換確認が完了していない（SCF-OS-005）")
    ref, dig = r.get("confirmation_ref"), r.get("confirmation_digest")
    if not ref or not dig:
        errs.append("E_RETIRE: 置換確認の記録が無い")
    else:
        cur = sha256_file(ref)
        if cur is None: errs.append("E_RETIRE: 確認記録 %s を読み直せない" % ref)
        elif cur != dig: errs.append("E_RETIRE: 読み直した確認記録が記録時のdigestと一致しない（read-after不一致。SCF-OS-005）")
        else:
            with open(os.path.join(ROOT, ref), encoding="utf-8") as f: rec = json.load(f)
            if rec.get("result") != "pass": errs.append("E_RETIRE: 確認記録がpassではない")
            if rec.get("binding_core_digest") != binding_core_digest(b):
                errs.append("E_RETIRE: 確認後にbindingの内容が変わっている（対象revision不一致。SCF-OS-004）")
            e2, _ = check_replacement(b)
            errs += e2
    for x in errs: print("  - " + x)
    if errs:
        print("retire %s: 拒否" % b["id"]); return 1
    b["state"] = "retired"; b["updated"] = datetime.date.today().isoformat()
    b["retired"] = {"at": b["updated"], "confirmation_ref": ref, "read_after_digest": dig}
    with open(p, "w", encoding="utf-8") as f:
        json.dump(b, f, ensure_ascii=False, indent=1); f.write("\n")
    print("retire %s: retired。仮artifactの物理削除は別のcommitで行い、residuals で残留0を確かめる" % b["id"])
    return 0


def cmd_selftest(args):
    """checks/cases/*.json を実行する。file systemを見ない検査（fs=False）と、見る検査を分ける。"""
    cases = sorted(glob.glob(os.path.join(CASES, "*.json")))
    results = []; fails = 0
    for cp in cases:
        with open(cp, encoding="utf-8") as f: c = json.load(f)
        bs = c.get("bindings") or [c["binding"]]
        target = bs[0]
        cmd = c["command"]
        if cmd == "validate":
            errs = check_shape(target)
            if not errs: errs += check_rules(target, bs, fs=False)
        elif cmd == "check-replacement":
            errs = check_shape(target)
            if not errs: errs = check_replacement(target, fs=False)[0]
        elif cmd == "residuals":
            errs = ["R: %s" % m for _, m in residuals(bs, fs=False)]
        elif cmd == "retire-precheck":
            errs = []
            if target["state"] != "replacing": errs.append("E_RETIRE")
            if target["replacement"].get("status") != "confirmed": errs.append("E_RETIRE")
            if c.get("read_after_digest") != c.get("confirmation_digest"): errs.append("E_RETIRE: read-after不一致")
        else:
            print("E_INPUT: 未知のcommand %s (%s)" % (cmd, cp)); return 2
        got = "fail" if errs else "pass"
        ok = got == c["expect"] and all(any(code in x for x in errs) for code in c.get("expect_codes", []))
        fails += 0 if ok else 1
        results.append({"case": os.path.basename(cp), "l11": c.get("l11"), "requirements": c.get("requirements"),
                        "expect": c["expect"], "got": got, "ok": ok, "messages": errs})
        print("%s %s  %s" % ("ok  " if ok else "NG  ", os.path.basename(cp), c.get("l11", "")))
        if not ok:
            for x in errs: print("      " + x)
    print("cases=%d fail=%d" % (len(cases), fails))
    if args.record:
        rel, dig = evidence_record("selftest.json", {
            "checked_at": datetime.date.today().isoformat(), "cases": len(cases), "fail": fails, "results": results,
            "tool_sha256": sha256_file(os.path.relpath(os.path.abspath(__file__), ROOT))})
        print("recorded %s %s" % (rel, dig))
    return 1 if fails else 0


def main(argv=None):
    ap = argparse.ArgumentParser(prog="scfctl", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest="cmd", required=True)
    sp.add_parser("validate"); sp.add_parser("list"); sp.add_parser("stale"); sp.add_parser("residuals")
    x = sp.add_parser("check-replacement"); x.add_argument("id"); x.add_argument("--record", action="store_true")
    x = sp.add_parser("retire"); x.add_argument("id")
    x = sp.add_parser("selftest"); x.add_argument("--record", action="store_true")
    a = ap.parse_args(argv)
    return {"validate": cmd_validate, "list": cmd_list, "stale": cmd_stale, "residuals": cmd_residuals,
            "check-replacement": cmd_check_replacement, "retire": cmd_retire, "selftest": cmd_selftest}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())
