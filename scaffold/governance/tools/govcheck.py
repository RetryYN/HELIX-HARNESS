#!/usr/bin/env python3
"""govcheck — 仮のルール集が旧ルール群を1件も落としていないことを機械で確かめる。

確かめること:
  1. 台帳の全atomが、ルール集のどれか1 fileにちょうど1回、主として現れる（欠落0、重複0、余分0）
  2. 台帳の副の対応づけが、該当fileの「副」節にすべて現れる
  3. 要求候補の57本すべてにfileがあり、本文の要求文と一致する。件数（主／副）が本文と一致する
  4. ルール集が生成器の出力と一致する（手で書き換えていない）
  5. ルール集のfrontmatterが記録する正本のsha256が現物と一致する（違えば stale）
  6. Scaffold Binding（SCF-B-0002）の上流sha256が現物と一致する
書き込みはしない。終了code: 0 合格 / 1 不合格。
"""
import collections, hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GOV = os.path.dirname(HERE)
ROOT = os.environ.get("GOVCHECK_ROOT") or os.path.dirname(os.path.dirname(GOV))
GOV = os.path.join(ROOT, "scaffold", "governance")
sys.path.insert(0, HERE)
import gen_rulebook as g  # noqa: E402

BINDING = os.path.join(ROOT, "scaffold", "bindings", "SCF-B-0002.json")


def main():
    e = []
    reqs, atoms = g.load()
    # 1, 2
    seen = collections.Counter(); sec_seen = collections.defaultdict(set)
    for f in os.listdir(os.path.join(GOV, "rules")):
        rid = f[:-3]
        txt = open(os.path.join(GOV, "rules", f), encoding="utf-8").read()
        body = txt.split("## 主として対応づいた規則")[1] if "## 主として対応づいた規則" in txt else txt.split("| atom |")[1]
        prim = body.split("## 副として対応づいた規則")[0]
        for m in re.finditer(r"^\| `([A-Z0-9-]+)` \|", prim, re.M):
            seen[(m.group(1), rid)] += 1
        if "## 副として対応づいた規則" in txt:
            for m in re.finditer(r"`([A-Z0-9-]+)`", txt.split("## 副として対応づいた規則")[1]):
                sec_seen[rid].add(m.group(1))
    per_atom = collections.Counter()
    for (aid, rid), n in seen.items():
        per_atom[aid] += n
    ids = {a["rule_id"] for a in atoms}
    missing = [a["rule_id"] for a in atoms if per_atom[a["rule_id"]] == 0]
    dup = [aid for aid, n in per_atom.items() if n > 1]
    extra = [aid for aid in per_atom if aid not in ids]
    wrong = [a["rule_id"] for a in atoms if seen[(a["rule_id"], a["requirement_primary"])] != 1]
    if missing: e.append("E_LOSS: ルール集に無いatom %d件 例 %s" % (len(missing), missing[:5]))
    if dup: e.append("E_DUP: 複数fileに主として現れるatom %d件 例 %s" % (len(dup), dup[:5]))
    if extra: e.append("E_EXTRA: 台帳に無いatom %d件 例 %s" % (len(extra), extra[:5]))
    if wrong: e.append("E_PLACE: 主の要求と違うfileにあるatom %d件 例 %s" % (len(wrong), wrong[:5]))
    for a in atoms:
        for x in a["requirement_secondary"]:
            if a["rule_id"] not in sec_seen.get(x, set()):
                e.append("E_LOSS_SECONDARY: %s が %s の副に無い" % (a["rule_id"], x)); break
    # 3
    byp = collections.Counter(a["requirement_primary"] for a in atoms)
    bys = collections.Counter(x for a in atoms for x in a["requirement_secondary"])
    for r in reqs:
        p = os.path.join(GOV, "rules", r["id"] + ".md")
        if not os.path.isfile(p): e.append("E_REQ: %s のfileが無い" % r["id"]); continue
        txt = open(p, encoding="utf-8").read()
        if r["text"] not in txt: e.append("E_REQ: %s の要求文が本文と一致しない" % r["id"])
        if (r["n_primary"], r["n_secondary"]) != (byp[r["id"]], bys[r["id"]]):
            e.append("E_COUNT: %s 本文%d／%d 台帳%d／%d" % (r["id"], r["n_primary"], r["n_secondary"], byp[r["id"]], bys[r["id"]]))
    if len(reqs) != 57: e.append("E_REQ: 要求候補が57本でない（%d）" % len(reqs))
    # 4
    rc = subprocess.run([sys.executable, os.path.join(HERE, "gen_rulebook.py"), "--check"], capture_output=True, text=True, env=dict(os.environ, GOVCHECK_ROOT=ROOT))
    if rc.returncode != 0: e.append("E_REGEN: " + rc.stdout.strip())
    # 5
    ix = open(os.path.join(GOV, "index.md"), encoding="utf-8").read()
    for key, rel in (("source_candidate_sha256", g.CAND), ("source_inventory_sha256", g.INV)):
        m = re.search(r"^%s: ([0-9a-f]{64})$" % key, ix, re.M)
        if not m or m.group(1) != g.sha256(rel): e.append("E_STALE: %s の正本が変わっている（ルール集を再生成する）" % rel)
    # 6
    if os.path.isfile(BINDING):
        b = json.load(open(BINDING, encoding="utf-8"))
        for u in b["upstream"]:
            if g.sha256(u["path"]) != u["sha256"]: e.append("E_STALE: SCF-B-0002 の上流 %s が変わっている" % u["path"])
    else:
        e.append("E_BINDING: scaffold/bindings/SCF-B-0002.json が無い")
    for x in e: print("  - " + x)
    print("govcheck: %s atoms=%d requirements=%d files=%d" % ("FAIL" if e else "ok", len(atoms), len(reqs), len(os.listdir(os.path.join(GOV, "rules")))))
    return 1 if e else 0


if __name__ == "__main__":
    sys.exit(main())
