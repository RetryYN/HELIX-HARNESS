#!/usr/bin/env python3
"""govcheck の否定例。repositoryの写しを一時directoryに作り、壊してから govcheck が拒否することを確かめる。
書き込みは一時directoryだけ。終了code: 0 合格 / 1 不合格。"""
import json, os, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
CAND = "docs/governance/candidates/legacy-rule-derived-requirements.md"
INV = "docs/governance/legacy-rule-atom-inventory.jsonl"


def fresh():
    d = tempfile.mkdtemp(prefix="govcheck-")
    for rel in ("scaffold/governance", "scaffold/bindings"):
        shutil.copytree(os.path.join(ROOT, rel), os.path.join(d, rel))
    os.makedirs(os.path.join(d, "docs/governance/candidates"))
    for rel in (CAND, INV, "docs/governance/legacy-rule-atom-source-files.jsonl"):
        shutil.copy(os.path.join(ROOT, rel), os.path.join(d, rel))
    return d


def run(d):
    r = subprocess.run([sys.executable, os.path.join(HERE, "govcheck.py")], capture_output=True, text=True, env=dict(os.environ, GOVCHECK_ROOT=d))
    return r.returncode, r.stdout


def case(name, mutate, code):
    d = fresh()
    try:
        mutate(d)
        rc, out = run(d)
        ok = rc == 1 and code in out
        print("%s %s -> %s" % ("ok  " if ok else "NG  ", name, code))
        if not ok: print(out)
        return ok
    finally:
        shutil.rmtree(d)


def drop_atom(d):  # 台帳から1件消す → ルール集に余分（E_EXTRA）と件数不一致
    p = os.path.join(d, INV); lines = open(p, encoding="utf-8").read().split("\n")
    open(p, "w", encoding="utf-8").write("\n".join(lines[1:]))


def drop_row(d):  # ルール集から1行消す → E_LOSS
    p = os.path.join(d, "scaffold/governance/rules/RUL-FRM-01.md"); s = open(p, encoding="utf-8").read()
    i = s.index("| `R"); j = s.index("\n", i)
    open(p, "w", encoding="utf-8").write(s[:i] + s[j + 1:])


def dup_row(d):  # 1行を別fileへ複製 → E_DUP
    p = os.path.join(d, "scaffold/governance/rules/RUL-FRM-01.md"); s = open(p, encoding="utf-8").read()
    i = s.index("| `R"); j = s.index("\n", i); row = s[i:j]
    q = os.path.join(d, "scaffold/governance/rules/RUL-FRM-02.md"); t = open(q, encoding="utf-8").read()
    k = t.index("| `R"); open(q, "w", encoding="utf-8").write(t[:k] + row + "\n" + t[k:])


def edit_req(d):  # 要求文を書き換える → E_REQ（本文と不一致）／E_STALE
    p = os.path.join(d, CAND); s = open(p, encoding="utf-8").read()
    open(p, "w", encoding="utf-8").write(s.replace("工程の順序とV-pairを守る", "工程の順序を守る", 1))


def hand_edit(d):  # ルール集を手で書き換える → E_REGEN
    p = os.path.join(d, "scaffold/governance/rules/RUL-FRM-01.md"); s = open(p, encoding="utf-8").read()
    open(p, "w", encoding="utf-8").write(s + "\n手で足した行\n")


def touch_source(d):  # 正本を変える（内容は同じ意味）→ E_STALE
    p = os.path.join(d, INV); open(p, "a", encoding="utf-8").write("\n")


def binding_stale(d):  # bindingの上流sha256を変える → E_STALE（SCF-B-0002）
    p = os.path.join(d, "scaffold/bindings/SCF-B-0002.json"); b = json.load(open(p, encoding="utf-8"))
    b["upstream"][0]["sha256"] = "0" * 64
    json.dump(b, open(p, "w", encoding="utf-8"), ensure_ascii=False)


def main():
    rc, out = run(ROOT)
    print("%s baseline -> %s" % ("ok  " if rc == 0 else "NG  ", out.strip().split("\n")[-1]))
    ok = rc == 0
    for name, m, code in (("drop_atom", drop_atom, "E_EXTRA"), ("drop_row", drop_row, "E_LOSS"), ("dup_row", dup_row, "E_DUP"),
                          ("edit_req", edit_req, "E_REQ"), ("hand_edit", hand_edit, "E_REGEN"), ("touch_source", touch_source, "E_STALE"),
                          ("binding_stale", binding_stale, "E_STALE: SCF-B-0002")):
        ok &= case(name, m, code)
    print("govcheck_selftest: %s" % ("ok" if ok else "FAIL"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
