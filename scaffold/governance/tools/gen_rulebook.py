#!/usr/bin/env python3
"""旧ルール群の要求候補57本と規則atom 7,113件を、仮のルール集（rulebook）へ機械的に写す。

入力（正本。ここでは読むだけ）:
  docs/governance/candidates/legacy-rule-derived-requirements.md   要求候補の本文
  docs/governance/legacy-rule-atom-inventory.jsonl                  規則atom台帳
出力（scaffold/governance/ 配下だけ）:
  rules/<要求ID>.md  要求1本につき1 file。主として対応づいた全atomと、副として対応づいたatomのIDを持つ
  rules/LEGACY-ONLY.md  旧実装に固有とした規則（除外理由付き）
  index.md           一覧と件数
決定的に生成する。同じ入力からは同じbytesが出る。govcheck が再生成結果と一致することを確かめる。
"""
import collections, hashlib, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GOV = os.path.dirname(HERE)
ROOT = os.environ.get("GOVCHECK_ROOT") or os.path.dirname(os.path.dirname(GOV))
GOV = os.path.join(ROOT, "scaffold", "governance")
CAND = "docs/governance/candidates/legacy-rule-derived-requirements.md"
INV = "docs/governance/legacy-rule-atom-inventory.jsonl"
ATOMS_TOTAL = 7113   # 台帳の母数。変わったら正本側の判断として本値と binding を更新する
REQ_TOTAL = 57
GROUP_ISSUE = {"枠": 1858, "サービス④開発": 1854, "フルリバース": 1852, "サービス⑥リリース": 1856,
               "サービス⑦運用保守": 1857, "OS推進": 1859, "OS検収": 1860, "OS改善": 1861}


def sha256(rel):
    with open(os.path.join(ROOT, rel), "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def load():
    text = open(os.path.join(ROOT, CAND), encoding="utf-8").read()
    reqs = []
    group = None
    lines = text.split("\n")
    for i, line in enumerate(lines):
        m = re.match(r"^### (.+)$", line)
        if m:
            group = m.group(1); continue
        m = re.match(r"^#### `(RUL-[A-Z]{3}-\d\d)`（(.+?)）　(\d+)／(\d+)件$", line)
        if m:
            # 構造の前提: 見出しの次行が空行、その次の行が要求文（1段落）、その次が空行。崩れていれば text=None として拒否する
            ok = (i + 3 < len(lines) and lines[i + 1] == "" and lines[i + 2].strip() and not lines[i + 2].startswith(("-", "#", "|", ">"))
                  and lines[i + 3] == "")
            reqs.append({"id": m.group(1), "product": m.group(2), "group": group, "text": lines[i + 2].strip() if ok else None,
                         "n_primary": int(m.group(3)), "n_secondary": int(m.group(4))})
    atoms = [json.loads(l) for l in open(os.path.join(ROOT, INV), encoding="utf-8") if l.strip()]
    return reqs, atoms


def esc(s):
    return str(s).replace("|", "\\|").replace("\n", " ")


def row(a):
    """台帳の1 atomの全fieldを1行に写す（rule_id、rule_text、kind、enforced_by、fail_mode、legacy_binding、requirement_secondary、sources、mapped_by／extraction_pass）。"""
    src = "; ".join("%s:%s" % (s["path"].replace("archive/legacy-generation-2026-09-14/root/", ""), s["lines"]) for s in a["sources"])
    return "| `%s` | %s | %s | %s | %s | %s | %s | %s | %s |" % (
        a["rule_id"], esc(a["rule_text"]), a["kind"], "／".join(a["enforced_by"]), a.get("fail_mode", "n/a"), esc(a.get("legacy_binding", "")) or "—",
        "、".join("`%s`" % x for x in a["requirement_secondary"]) or "—", esc(src), "%s／%s" % (a.get("extraction_pass", ""), a.get("mapped_by", "")))


def build(reqs, atoms):
    byp = collections.defaultdict(list); bys = collections.defaultdict(list)
    for a in atoms:
        byp[a["requirement_primary"]].append(a)
        for x in a["requirement_secondary"]:
            bys[x].append(a["rule_id"])
    files = {}
    head = ("---\nstatus: scaffold\nauthority_effect: none\ngenerated_by: scaffold/governance/tools/gen_rulebook.py\n"
            "source_candidate: %s\nsource_candidate_sha256: %s\nsource_inventory: %s\nsource_inventory_sha256: %s\n"
            % (CAND, sha256(CAND), INV, sha256(INV)))
    for r in reqs:
        o = [head + "rule_id: %s\ngroup: %s\nproduct: %s\natoms_primary: %d\natoms_secondary: %d\nissue_projection: %s\n---\n"
             % (r["id"], r["group"], r["product"], len(byp[r["id"]]), len(bys[r["id"]]),
                ("#%d" % GROUP_ISSUE[r["group"]]) if r["group"] in GROUP_ISSUE else "none")]
        o.append("# %s（%s／%s）\n" % (r["id"], r["group"], r["product"]))
        o.append("仮のルール。正本は[要求候補](../../../%s)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。\n" % CAND)
        o.append("## 要求\n\n%s\n" % r["text"])
        o.append("## 主として対応づいた規則（%d件）\n" % len(byp[r["id"]]))
        o.append("| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |\n|---|---|---|---|---|---|---|---|---|")
        for a in sorted(byp[r["id"]], key=lambda a: a["rule_id"]):
            o.append(row(a))
        o.append("\n## 副として対応づいた規則（%d件）\n" % len(bys[r["id"]]))
        o.append("、".join("`%s`" % x for x in sorted(bys[r["id"]])) if bys[r["id"]] else "なし")
        files["rules/%s.md" % r["id"]] = "\n".join(o) + "\n"
    lo = [head + "rule_id: LEGACY-ONLY\natoms_primary: %d\n---\n" % len(byp["LEGACY-ONLY"]),
          "# LEGACY-ONLY（旧実装に固有とした規則）\n",
          "要求にはしないが、落とさずここに保持する。各行の除外理由は台帳の`legacy_only_reason`の写しである。\n",
          "| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 除外理由 | 出どころ | 由来 |\n|---|---|---|---|---|---|---|---|---|"]
    for a in sorted(byp["LEGACY-ONLY"], key=lambda a: a["rule_id"]):
        lo.append("| `%s` | %s | %s | %s | %s | %s | %s | %s | %s |" % (
            a["rule_id"], esc(a["rule_text"]), a["kind"], "／".join(a["enforced_by"]), a.get("fail_mode", "n/a"), esc(a.get("legacy_binding", "")) or "—",
            esc(a.get("legacy_only_reason", "")), esc("; ".join("%s:%s" % (s["path"].replace("archive/legacy-generation-2026-09-14/root/", ""), s["lines"]) for s in a["sources"])),
            "%s／%s" % (a.get("extraction_pass", ""), a.get("mapped_by", ""))))
    files["rules/LEGACY-ONLY.md"] = "\n".join(lo) + "\n"
    ix = [head + "rule_id: index\natoms_total: %d\nrequirements: %d\n---\n" % (len(atoms), len(reqs)),
          "# 仮のルール集 索引\n",
          "要求候補%d本と規則atom %d件（LEGACY-ONLY %d件を含む）。全atomはちょうど1つのfileに主として現れる。\n" % (len(reqs), len(atoms), len(byp["LEGACY-ONLY"])),
          "| 要求 | 群 | 製品 | 主 | 副 | Issue |\n|---|---|---|---:|---:|---|"]
    for r in reqs:
        ix.append("| [`%s`](rules/%s.md) | %s | %s | %d | %d | %s |" % (r["id"], r["id"], r["group"], r["product"], len(byp[r["id"]]), len(bys[r["id"]]),
                  ("#%d" % GROUP_ISSUE[r["group"]]) if r["group"] in GROUP_ISSUE else "—"))
    ix.append("| [`LEGACY-ONLY`](rules/LEGACY-ONLY.md) | — | — | %d | 0 | — |" % len(byp["LEGACY-ONLY"]))
    files["index.md"] = "\n".join(ix) + "\n"
    return files


def main(argv):
    reqs, atoms = load()
    bad = [r["id"] for r in reqs if r["text"] is None]
    if bad:
        print("E_REQ: 要求文を読めない（見出し→空行→要求文→空行の構造が崩れている） %s" % bad); return 1
    files = build(reqs, atoms)
    if "--check" in argv:
        bad = []
        for rel, content in files.items():
            p = os.path.join(GOV, rel)
            cur = open(p, encoding="utf-8").read() if os.path.isfile(p) else None
            if cur != content:
                bad.append(rel)
        extra = [f for f in os.listdir(os.path.join(GOV, "rules")) if "rules/" + f not in files]
        if bad or extra:
            print("E_REGEN: 生成結果と一致しない %s 余分 %s" % (bad, extra)); return 1
        print("regen ok files=%d" % len(files)); return 0
    for rel, content in files.items():
        p = os.path.join(GOV, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as f: f.write(content)
    print("wrote %d files, %d atoms, %d requirements" % (len(files), len(atoms), len(reqs)))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
