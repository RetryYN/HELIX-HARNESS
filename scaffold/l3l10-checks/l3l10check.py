#!/usr/bin/env python3
"""l3l10check — L3／L10本文PRの「機械で検出できる違反」を検出する仮組みの検査器（scaffold）。

status: scaffold / authority_effect: none / binding: scaffold/bindings/SCF-B-0157.json

これは違反の検出器であり、合格の十分条件ではない。violationが0でも「承認可」「合格」「merge可」を
出力しない。receiptから承認・合格・merge admission・要求意味を生成しない。

検査（各検査は独立に登録し、結果は pass / violation / unknown。境界の削除だけは advisory／unknown）:
  pin_recompute      判断記録・pin JSONの path・bytes・SHA-256（全file、span）、formal_body_raw を実bytesと照合
  count_ids          親ごとのFV CASE定義の行数・unique ID数と、6本文の件数記述を照合
  fixed_quote        固定L2／L11の行を引用した箇所を、固定revisionの該当行と逐語照合
  return_vocab       FVのCASE行の戻し先が、固定L2の同じ親の「失敗時／戻し先」行の語彙内にあるか
  boundary_removed   base→HEADで消えた境界語・IDを含む文を列挙（advisory。violationにしない）

Python標準libraryだけで動く。gitは読み取り（cat-file／ls-tree／diff／rev-parse）だけを使う。
GitHubへは --online のときだけ `gh api` の読み取りを行う。書き込みは --receipt で指定したfileだけ。
終了code: 0 pass、1 violation、2 入力不正、3 unknown。
"""
import argparse, datetime, hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_ROOT = os.path.dirname(os.path.dirname(HERE))
CHECKER_VERSION = "scaffold-0.1"
BODY_FILES = (
    "L3-requirements/business-requirements.md",
    "L3-requirements/functional-requirements.md",
    "L3-requirements/nfr-grade.md",
    "L10-verification/business-verification.md",
    "L10-verification/functional-verification.md",
    "L10-verification/nfr-verification.md",
)
FV_FILE = "L10-verification/functional-verification.md"
MECHS = ("HARNESS", "OS", "SECURITY", "INTELLIGENCE", "INFRASTRUCTURE", "CONNECT", "LABO", "BRAIN", "WEB")
AUTHORITY_NOTE = ("このreceiptは仮組み（scaffold）の検出器の実行記録である。違反の検出器であり合格の十分条件ではない。"
                  "violationが0でも承認可・合格・merge可を意味しない。receiptから承認、合格、merge admission、"
                  "要求意味、工程完了を生成しない。")


# ---------------------------------------------------------------- git（読み取りだけ）
class Git:
    def __init__(self, root):
        self.root = root
        self._blob = {}

    def _run(self, *args):
        r = subprocess.run(["git", "-C", self.root] + list(args), capture_output=True)
        return r.returncode, r.stdout

    def resolve(self, rev):
        if not rev:
            return None
        rc, out = self._run("rev-parse", "--verify", "--quiet", rev + "^{commit}")
        return out.decode().strip() if rc == 0 and out.strip() else None

    def blob(self, rev, path):
        key = (rev, path)
        if key not in self._blob:
            rc, out = self._run("cat-file", "blob", "%s:%s" % (rev, path))
            self._blob[key] = out if rc == 0 else None
        return self._blob[key]

    def text(self, rev, path):
        b = self.blob(rev, path)
        if b is None:
            return None
        try:
            return b.decode("utf-8")
        except UnicodeDecodeError:
            return None

    def ls(self, rev, directory):
        rc, out = self._run("ls-tree", "--name-only", rev, directory.rstrip("/") + "/")
        if rc != 0:
            return []
        return sorted(x for x in out.decode().splitlines() if x.endswith(".md"))

    def diff_hunks(self, base, head, path):
        """(-U0) hunkを返す: [(base_start, base_lines[], head_start, head_lines[])]。"""
        rc, out = self._run("diff", "-U0", "--no-color", "--no-ext-diff", base, head, "--", path)
        if rc != 0:
            return None
        hunks, cur = [], None
        for line in out.decode("utf-8", "replace").split("\n"):
            m = re.match(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@", line)
            if m:
                cur = [int(m.group(1)), [], int(m.group(3)), []]
                hunks.append(cur)
            elif cur is not None and line.startswith("-") and not line.startswith("---"):
                cur[1].append(line[1:])
            elif cur is not None and line.startswith("+") and not line.startswith("+++"):
                cur[3].append(line[1:])
        return hunks

    def changed_head_lines(self, base, head, path):
        hunks = self.diff_hunks(base, head, path) if base else None
        if hunks is None:
            return None
        s = set()
        for _, _, hs, hl in hunks:
            s.update(range(hs, hs + len(hl)))
        return s


def sha256b(b):
    return hashlib.sha256(b).hexdigest()


def lines_of(text):
    return text.split("\n")


def norm(s):
    s = s.replace("**", "").replace("`", "")
    return re.sub(r"\s+", " ", s).strip()


def finding(result, path, line, detail, **ev):
    f = {"result": result, "path": path, "line": line, "detail": detail}
    if ev:
        f["evidence"] = ev
    return f


def combine(findings, empty="unknown"):
    rs = [f["result"] for f in findings]
    if not rs:
        return empty
    if "violation" in rs:
        return "violation"
    if "unknown" in rs:
        return "unknown"
    return "pass"


# ---------------------------------------------------------------- 見出しと親
PARENT_IN_HEADING = re.compile(r"(?:L2-|親|-)(\d{3})(?![0-9])")
HEADING = re.compile(r"^(#{1,6})\s+(.*)$")


def heading_parents(text):
    """各行について、見出しの入れ子から親番号の集合を返す（最も深い、親番号を持つ見出しを採る）。"""
    stack, out = [], []
    for line in lines_of(text):
        m = HEADING.match(line)
        if m:
            level = len(m.group(1))
            while stack and stack[-1][0] >= level:
                stack.pop()
            stack.append((level, set(PARENT_IN_HEADING.findall(m.group(2))), m.group(2)))
        ctx = set()
        for _, nums, _ in reversed(stack):
            if nums:
                ctx = nums
                break
        out.append(ctx)
    return out


ID_TOKEN = re.compile(r"^\s*(?:\|\s*|[-*]\s+|#{1,6}\s+)`?([A-Za-z0-9_]+(?:-[A-Za-z0-9_]+)+)`?")


def case_id_of_parent(token, parent):
    segs = token.split("-")
    if "CASE" not in segs or "NFR" in segs:
        return False
    nums = [k for k, x in enumerate(segs) if re.fullmatch(r"\d{3}", x)]
    # 最初の3桁segmentを親番号とする（「…-049-r20-m2-infer-039-…」を親039と数えない）
    if not nums or segs[nums[0]] != parent:
        return False
    # 親番号の後ろに少なくとも1 segmentを要する（「CASE-LABO-060」のような節見出しを定義と数えない）
    return nums[0] < len(segs) - 1


def parent_case_definitions(text, parent):
    """行頭（表の第1 cell、list item、見出し）に置かれた親のCASE IDを定義行として数える。"""
    rows = []
    for i, line in enumerate(lines_of(text), 1):
        m = ID_TOKEN.match(line)
        if m and case_id_of_parent(m.group(1), parent):
            rows.append((i, m.group(1)))
    return rows


# ---------------------------------------------------------------- 1 pin再計算
PIN_KEYS = ("sha256", "full_sha256", "span_sha256", "bytes", "utf8_bytes", "full_bytes")


def span_variants(blob, start, end):
    ls = blob.split(b"\n")
    if start < 1 or end < start or end > len(ls):
        return None
    body = b"\n".join(ls[start - 1:end])
    return {"lines_joined_lf": body, "lines_each_lf_terminated": body + b"\n"}


def check_pin_recompute(ctx):
    g, fs, notes = ctx["git"], [], []
    inputs = ctx["pins"]
    if not inputs:
        return {"result": "unknown", "findings": [], "notes": ["pin入力（--pin／--pin-file）が無い。照合していない"]}
    default_rev = ctx.get("pin_rev") or ctx.get("head")
    for src_label, raw in inputs:
        if raw is None:
            fs.append(finding("unknown", src_label, None, "pin fileを読めない"))
            continue
        if src_label.endswith(".json"):
            try:
                doc = json.loads(raw)
            except ValueError as e:
                fs.append(finding("unknown", src_label, None, "JSONとして解析できない: %s" % e))
                continue
            n_before = len(fs)
            _walk_json_pins(g, doc, "$", src_label, default_rev, fs, ctx)
            if len(fs) == n_before:
                fs.append(finding("unknown", src_label, None, "path＋bytes／SHA-256のpinが1件も見つからない"))
        else:
            n_before = len(fs)
            _markdown_pins(g, raw, src_label, default_rev, fs)
            if len(fs) == n_before:
                fs.append(finding("unknown", src_label, None, "Markdownからpath＋SHA-256の対応を1件も抽出できない"))
    return {"result": combine(fs), "findings": fs, "notes": notes}


def _walk_json_pins(g, o, loc, src, default_rev, fs, ctx):
    if isinstance(o, dict):
        if "formal_body_raw" in o:
            _formal_body(o, loc, src, fs, ctx)
        if isinstance(o.get("path"), str) and any(k in o for k in PIN_KEYS):
            _json_pin(g, o, loc, src, default_rev, fs, ctx.get("head"))
        for k, v in o.items():
            _walk_json_pins(g, v, loc + "." + k, src, default_rev, fs, ctx)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            _walk_json_pins(g, v, "%s[%d]" % (loc, i), src, default_rev, fs, ctx)


def _json_pin(g, o, loc, src, default_rev, fs, head):
    path = o["path"]
    explicit = o.get("revision") or o.get("commit") or o.get("source_revision")
    rev_in = explicit if isinstance(explicit, str) and re.fullmatch(r"[0-9a-f]{7,40}", explicit or "") else None
    where = "%s %s" % (src, loc)
    if rev_in:
        tries = [(g.resolve(rev_in), "pin")]
    else:
        # revisionを持たないpinは、既定revision（--pin-rev）→ HEAD の順に、pathがあるrevisionで照合する
        tries = [(g.resolve(default_rev), "default"), (g.resolve(head), "head")]
    tries = [(r, k) for r, k in tries if r]
    if not tries:
        fs.append(finding("unknown", path, None, "pinのrevisionを解決できない（%s）" % (rev_in or default_rev), pin=where))
        return
    rev, rev_kind, blob = None, None, None
    for r, k in tries:
        blob = g.blob(r, path)
        if blob is not None:
            rev, rev_kind = r, k
            break
    if blob is None:
        res = "violation" if rev_in else "unknown"
        fs.append(finding(res, path, None, "pinされたpathがrevision %s に無い" % ",".join(r[:12] for r, _ in tries), pin=where,
                          revision_source="pin" if rev_in else "default"))
        return
    start = o.get("start_line") if isinstance(o.get("start_line"), int) else None
    end = o.get("end_line_inclusive", o.get("end_line"))
    end = end if isinstance(end, int) else None
    spans = span_variants(blob, start, end) if start and end else None
    live_full = sha256b(blob)
    checks = []
    for key in ("full_sha256", "sha256"):
        if isinstance(o.get(key), str) and re.fullmatch(r"[0-9a-f]{64}", o[key]):
            ok = o[key] == live_full
            conv = "full_file"
            if not ok and key == "sha256" and spans and "full_sha256" not in o:
                for name, sb in spans.items():
                    if sha256b(sb) == o[key]:
                        ok, conv = True, "span:" + name
            checks.append((key, o[key], live_full, ok, conv))
    if isinstance(o.get("span_sha256"), str):
        if spans is None:
            fs.append(finding("unknown", path, None, "span_sha256があるが行範囲が無い／範囲外", pin=where))
        else:
            hit = [n for n, sb in spans.items() if sha256b(sb) == o["span_sha256"]]
            checks.append(("span_sha256", o["span_sha256"], {n: sha256b(sb) for n, sb in spans.items()},
                           bool(hit), "span:" + (hit[0] if hit else "none")))
    for key in ("bytes", "utf8_bytes", "full_bytes"):
        if isinstance(o.get(key), int) and not isinstance(o.get(key), bool):
            ok, conv = o[key] == len(blob), "full_file"
            if not ok and spans and key == "bytes":
                for name, sb in spans.items():
                    if len(sb) == o[key]:
                        ok, conv = True, "span:" + name
            checks.append((key, o[key], len(blob), ok, conv))
    if not checks:
        fs.append(finding("unknown", path, None, "照合できる値（sha256／bytes）が無い", pin=where))
        return
    bad = [c for c in checks if not c[3]]
    line = "%d-%d" % (start, end) if start and end else None
    # 既定revisionに無く後続候補（HEAD）で読んだpinは、どのrevisionを指すかが確定しないため不一致をunknownに留める
    verdict = "violation" if bad and rev_kind in ("pin", "default") else ("unknown" if bad else "pass")
    fs.append(finding(verdict, path, line,
                      "pinの記録値と実bytesが一致しない" if bad else "pinの記録値と実bytesが一致",
                      pin=where, revision=rev, revision_source=rev_kind,
                      compared=[{"field": c[0], "recorded": c[1], "live": c[2], "match": c[3], "convention": c[4]} for c in checks]))


def _formal_body(o, loc, src, fs, ctx):
    raw = o.get("formal_body_raw")
    where = "%s %s" % (src, loc)
    if not isinstance(raw, str) or not raw:
        fs.append(finding("unknown", src, None, "formal_body_rawが空・非文字列", pin=where))
        return
    b = raw.encode("utf-8")
    comp = []
    if isinstance(o.get("formal_body_sha256"), str):
        comp.append(("formal_body_sha256", o["formal_body_sha256"], sha256b(b)))
    for k in ("formal_body_utf8_bytes", "formal_body_bytes"):
        if isinstance(o.get(k), int):
            comp.append((k, o[k], len(b)))
    if not comp:
        fs.append(finding("unknown", src, None, "formal_body_rawに対応する記録値（sha256／bytes）が無い", pin=where))
    else:
        bad = [c for c in comp if c[1] != c[2]]
        fs.append(finding("violation" if bad else "pass", src, None,
                          "formal_body_rawの再計算値が記録値と一致しない" if bad else "formal_body_rawの再計算値が記録値と一致",
                          pin=where, compared=[{"field": c[0], "recorded": c[1], "live": c[2], "match": c[1] == c[2]} for c in comp]))
    if not ctx.get("online"):
        return
    cid = o.get("formal_comment_id")
    if not isinstance(cid, int) or not ctx.get("gh_repo"):
        fs.append(finding("unknown", src, None, "--onlineだがcomment idまたは--gh-repoが無い", pin=where))
        return
    r = subprocess.run(["gh", "api", "repos/%s/issues/comments/%d" % (ctx["gh_repo"], cid)], capture_output=True)
    try:
        live = json.loads(r.stdout.decode("utf-8"))["body"] if r.returncode == 0 else None
    except (ValueError, KeyError, TypeError):
        live = None
    if not isinstance(live, str):
        fs.append(finding("unknown", src, None, "gh apiでcomment bodyを取得できない（%d）" % cid, pin=where))
        return
    ok = live == raw
    fs.append(finding("pass" if ok else "violation", src, None,
                      "GitHub comment bodyとformal_body_rawが一致" if ok else "GitHub comment bodyとformal_body_rawが一致しない",
                      pin=where, comment_id=cid, live_sha256=sha256b(live.encode("utf-8")), live_bytes=len(live.encode("utf-8"))))


MD_PATH = re.compile(r"(?<![\w/])((?:docs|scaffold)/[\w./\-]+\.(?:md|json|jsonl))(?::(\d+)(?:[-–](\d+))?)?")
HEX64 = re.compile(r"(?<![0-9a-f])[0-9a-f]{64}(?![0-9a-f])")
HEX40 = re.compile(r"(?<![0-9a-f])[0-9a-f]{40}(?![0-9a-f])")


def _markdown_pins(g, raw, src, default_rev, fs):
    for i, line in enumerate(raw.split("\n"), 1):
        paths, shas = MD_PATH.findall(line), HEX64.findall(line)
        if len(paths) != 1 or len(shas) != 1:
            continue
        path, a, b = paths[0]
        commits = HEX40.findall(HEX64.sub("", line))
        rev = g.resolve(commits[0] if len(commits) == 1 else default_rev)
        if not rev:
            fs.append(finding("unknown", src, i, "revisionを解決できない"))
            continue
        blob = g.blob(rev, path)
        if blob is None:
            fs.append(finding("unknown", src, i, "path %s がrevision %s に無い（Markdownの対応づけは曖昧として扱う）" % (path, rev[:12])))
            continue
        cand = {"full_file": sha256b(blob)}
        if a:
            sp = span_variants(blob, int(a), int(b or a))
            if sp:
                cand.update({"span:" + k: sha256b(v) for k, v in sp.items()})
        hit = [k for k, v in cand.items() if v == shas[0]]
        nb = re.findall(r"\|\s*(\d+)\s*\|", line) + re.findall(r"(\d+)\s*bytes", line)
        bytes_ok = None
        if len(nb) == 1 and hit == ["full_file"]:
            bytes_ok = int(nb[0]) == len(blob)
        ok = bool(hit) and bytes_ok is not False
        # Markdown内の64桁hexが全文・spanのどちらを指すかを本文から確定できないため、不一致はunknownに留める
        fs.append(finding("pass" if ok else "unknown", src, i,
                          "Markdown pinが実bytesと一致（%s）" % hit[0] if ok else
                          "Markdown pinが全文・spanのどちらとも一致しない、またはbytesが異なる（対応づけが曖昧なためunknown）",
                          pinned_path=path, revision=rev, recorded=shas[0], recorded_bytes=int(nb[0]) if len(nb) == 1 else None,
                          live_bytes=len(blob)))


# ---------------------------------------------------------------- 2 件数・ID
STRONG_COUNT = [
    re.compile(r"CASE定義ID(?:数)?(?:は|が)?\s*(\d+)\s*件"),
    re.compile(r"L10の(\d+)件(?:（[^）]*）)?の定義"),
    re.compile(r"全定義\s*(\d+)\s*件"),
    re.compile(r"全(\d+)定義行"),
    re.compile(r"(\d+)\s*件の(?:CASE)?定義"),
    re.compile(r"CASE\s*ID(?:の)?一意数(?:は)?\s*(\d+)"),
    re.compile(r"(?<!CASE)定義ID(?:は|が)?\s*(\d+)\s*件"),
]
WEAK_COUNT = re.compile(r"(\d+)\s*件")


def sentences(line):
    out, start = [], 0
    for m in re.finditer(r"。", line):
        out.append((start, line[start:m.end()]))
        start = m.end()
    if start < len(line):
        out.append((start, line[start:]))
    return out


def check_count_ids(ctx):
    g, head, mech = ctx["git"], ctx.get("head"), ctx.get("mech")
    parents = ctx.get("parents") or []
    if not head or not mech or not parents:
        return {"result": "unknown", "findings": [], "notes": ["--head／--mech／--parentのいずれかが無い"]}
    fs, notes, per = [], [], {}
    fv_path = "docs/%s/%s" % (mech, FV_FILE)
    fv = g.text(head, fv_path)
    for parent in parents:
        if fv is None:
            fs.append(finding("unknown", fv_path, None, "FVを読めない", parent=parent))
            continue
        defs = parent_case_definitions(fv, parent)
        uniq = sorted(set(t for _, t in defs))
        per[parent] = {"fv_definition_rows": len(defs), "fv_unique_ids": len(uniq)}
        if not uniq:
            fs.append(finding("unknown", fv_path, None, "親%sのCASE定義行が0件（ID形式を判別できない）" % parent, parent=parent))
            continue
        if len(defs) != len(uniq):
            dup = sorted(t for t in uniq if sum(1 for _, x in defs if x == t) > 1)
            fs.append(finding("unknown", fv_path, [i for i, t in defs if t in dup][:20],
                              "同じCASE IDが複数の定義行に現れる（索引表の再掲か二重定義かは本文から決められない）",
                              parent=parent, duplicated=dup[:20]))
        strong_seen = 0
        for rel in BODY_FILES:
            path = "docs/%s/%s" % (mech, rel)
            text = g.text(head, path)
            if text is None:
                notes.append("%s を読めない（本文が無い機構は照合しない）" % path)
                continue
            ctxs = heading_parents(text)
            changed = g.changed_head_lines(ctx.get("base"), head, path) if ctx.get("base") else None
            for i, line in enumerate(lines_of(text), 1):
                if parent not in ctxs[i - 1] or HEADING.match(line):
                    continue
                for s_off, sent in sentences(line):
                    used = set()
                    for rx in STRONG_COUNT:
                        for m in rx.finditer(sent):
                            if m.start(1) in used:
                                continue
                            used.add(m.start(1))
                            if "旧" in sent[:m.start()]:
                                notes.append("%s:%d 「%s」は旧の件数として照合から除外" % (path, i, m.group(0)))
                                continue
                            n = int(m.group(1))
                            strong_seen += 1
                            ok = n == len(uniq)
                            fs.append(finding("pass" if ok else "violation", path, i,
                                              "件数記述 %d とFVの親%s unique CASE ID数 %d が%s" % (n, parent, len(uniq), "一致" if ok else "不一致"),
                                              parent=parent, claimed=n, actual_unique=len(uniq), matched=m.group(0),
                                              introduced_in_diff=(i in changed) if changed is not None else None))
                    if ("CASE" in sent or "定義" in sent) and not used:
                        for m in WEAK_COUNT.finditer(sent):
                            n = int(m.group(1))
                            if n != len(uniq) and "旧" not in sent[:m.start()]:
                                fs.append(finding("unknown", path, i,
                                                  "件数らしき表記 %d件 が親%sのunique CASE ID数 %d と異なる（何の件数かを本文から確定できない）" % (n, parent, len(uniq)),
                                                  parent=parent, claimed=n, actual_unique=len(uniq), sentence=sent[:200]))
        if strong_seen == 0:
            fs.append(finding("unknown", None, None, "親%sについて照合できる件数記述が6本文に無い" % parent, parent=parent))
    return {"result": combine(fs), "findings": fs, "notes": notes, "per_parent": per}


# ---------------------------------------------------------------- 3 固定引用の照合
QREF = re.compile(r"(?<![A-Za-z0-9])(固定)?L(2|11)(?:-\d{3})?(?:\s*line\s*|\s*[:：]\s*)(\d+)(?:\s*[-–〜~]\s*(\d+))?")
LABEL_L11 = re.compile(r"^\s*[-*]\s*\*\*固定L11受入oracle\*\*\s*(（[^）]*）|\([^)]*\))?\s*[:：]\s*(.*)$")
TABLE_FIXED = re.compile(r"^\|\s*固定親\s*\|(.+)\|\s*$")


def balanced_quote(s, i):
    """s[i]=='「' からの括弧内（入れ子対応）を返す。閉じなければNone。"""
    depth = 0
    for j in range(i, len(s)):
        if s[j] == "「":
            depth += 1
        elif s[j] == "」":
            depth -= 1
            if depth == 0:
                return s[i + 1:j]
    return None


def fixed_dir(mech, kind):
    return "docs/%s/%s" % (mech, "L2-requirements" if kind == "2" else "L11-acceptance")


def quote_in(quote, target):
    parts = [norm(p) for p in re.split(r"…+|\.\.\.", quote) if norm(p)]
    t, pos = norm(target), 0
    for p in parts:
        k = t.find(p, pos)
        if k < 0:
            return False
        pos = k + len(p)
    return bool(parts)


def extract_bracket_quotes(line):
    """行番号つき参照のすぐ後（15字以内）に始まる「」引用を抽出する。"""
    out = []
    for m in QREF.finditer(line):
        before = line[max(0, m.start() - 14):m.start()]
        if not m.group(1) and re.search(r"[A-Z]{2,}[\s-]?$", before):
            out.append({"cross_mechanism": True, "ref": m.group(0)})
            continue
        rest = line[m.end():m.end() + 16]
        k = rest.find("「")
        if k < 0 or any(c in rest[:k] for c in "」。「"):
            continue
        q = balanced_quote(line, m.end() + k)
        if q is None:
            continue
        start = int(m.group(3))
        end = int(m.group(4)) if m.group(4) else start
        out.append({"kind": m.group(2), "start": start, "end": end, "quote": q, "ref": m.group(0)})
    return out


def l2_section(text, parent):
    """固定L2本文から親の節（見出しから次の同位以上の見出しまで）を返す: [(line_no, line)]。"""
    ls = lines_of(text)
    rx = re.compile(r"-L2-%s(?![0-9])" % re.escape(parent))
    for i, line in enumerate(ls):
        m = HEADING.match(line)
        if m and rx.search(m.group(2)):
            level, sec = len(m.group(1)), []
            for j in range(i, len(ls)):
                m2 = HEADING.match(ls[j])
                if j > i and m2 and len(m2.group(1)) <= level:
                    break
                sec.append((j + 1, ls[j]))
            return sec
    return None


def check_fixed_quote(ctx):
    g, head, mech, frev = ctx["git"], ctx.get("head"), ctx.get("mech"), ctx.get("fixed_rev")
    if not head or not mech or not frev:
        return {"result": "unknown", "findings": [], "notes": ["--head／--mech／--fixed-revのいずれかが無い"]}
    frev_r = g.resolve(frev)
    if not frev_r:
        return {"result": "unknown", "findings": [], "notes": ["固定revision %s を解決できない" % frev]}
    fs, notes = [], []
    fixed_files = {k: [(p, g.text(frev_r, p)) for p in g.ls(frev_r, fixed_dir(mech, k))] for k in ("2", "11")}
    for k, lst in fixed_files.items():
        if not lst:
            notes.append("固定L%sの本文が %s に無い" % (k, fixed_dir(mech, k)))
    extracted = 0
    for rel in BODY_FILES:
        path = "docs/%s/%s" % (mech, rel)
        text = g.text(head, path)
        if text is None:
            continue
        changed = g.changed_head_lines(ctx.get("base"), head, path) if ctx.get("base") else None
        ls = lines_of(text)
        last_case = None
        table_labels = None
        for i, line in enumerate(ls, 1):
            intro = (i in changed) if changed is not None else None
            hm = HEADING.match(line)
            if hm:
                ids = re.findall(r"[A-Z]+-CASE-(\d{3})-", hm.group(2))
                last_case = ids[0] if ids else last_case
            # 形式A: 行番号つき参照＋「」引用
            qs = extract_bracket_quotes(line)
            bracketed = False
            for q in qs:
                if q.get("cross_mechanism"):
                    notes.append("%s:%d 他機構の固定行参照 %s は照合しない" % (path, i, q["ref"]))
                    continue
                bracketed = True
                extracted += 1
                cands = [(p, t) for p, t in fixed_files[q["kind"]] if t is not None]
                hits, have_range = [], False
                for p, t in cands:
                    tl = lines_of(t)
                    if q["end"] <= len(tl):
                        have_range = True
                        if quote_in(q["quote"], "\n".join(tl[q["start"] - 1:q["end"]])):
                            hits.append(p)
                ev = dict(form="line_ref_bracket_quote", ref=q["ref"], quote=q["quote"][:300], fixed_revision=frev_r,
                          introduced_in_diff=intro)
                if hits:
                    fs.append(finding("pass", path, i, "引用が固定L%s:%d-%dに逐語で含まれる" % (q["kind"], q["start"], q["end"]), matched_file=hits[0], **ev))
                elif len(cands) == 1 and have_range:
                    fs.append(finding("violation", path, i, "引用が固定L%s %s:%d-%dに逐語で含まれない" % (q["kind"], cands[0][0], q["start"], q["end"]),
                                      fixed_line_text=lines_of(cands[0][1])[q["start"] - 1][:400], **ev))
                else:
                    fs.append(finding("unknown", path, i, "引用先fileを1つに決められない、または行範囲外", candidates=[p for p, _ in cands], **ev))
            # 形式B: 「固定L11受入oracle」ラベル行
            lm = LABEL_L11.match(line)
            if lm and not bracketed:
                extracted += 1
                paren, body = lm.group(1) or "", lm.group(2)
                pm = re.search(r"L2-(\d{3})", paren)
                parent = pm.group(1) if pm else last_case
                lref = re.search(r"L11\s*[:：]\s*(\d+)", paren)
                cands = [(p, t) for p, t in fixed_files["11"] if t is not None]
                rows = []
                if parent:
                    rr = re.compile(r"[A-Z]*-L2-%s" % parent)
                    rows = [(p, n, l) for p, t in cands for n, l in enumerate(lines_of(t), 1)
                            if l.startswith("|") and any(rr.fullmatch(c.strip().strip("`")) for c in l.split("|"))]
                ev = dict(form="fixed_l11_oracle_label", parent=parent, fixed_revision=frev_r, introduced_in_diff=intro)
                if len(rows) != 1:
                    fs.append(finding("unknown", path, i, "対応する固定L11行を1行に決められない（%d行）" % len(rows), **ev))
                    continue
                p, n, row = rows[0]
                if lref and int(lref.group(1)) != n:
                    fs.append(finding("violation", path, i, "括弧内の固定L11行番号 %s が実際の行 %d と異なる" % (lref.group(1), n), matched_file=p, **ev))
                missing = [s for _, s in sentences(body) if norm(s) and norm(s) not in norm(row)]
                if missing:
                    fs.append(finding("violation", path, i, "固定L11受入oracleの文が固定L11 %s:%dに逐語で含まれない" % (p, n),
                                      missing_sentences=[s[:300] for s in missing], fixed_line_text=row[:600], **ev))
                else:
                    fs.append(finding("pass", path, i, "固定L11受入oracleの全文が固定L11 %s:%dに逐語で含まれる" % (p, n), **ev))
            # 形式C: 「固定親」表（入力・出力など）
            tm = TABLE_FIXED.match(line)
            if tm:
                table_labels = [c.strip() for c in tm.group(1).split("|")]
                continue
            if table_labels is not None:
                if not line.startswith("|"):
                    table_labels = None
                    continue
                if re.match(r"^\|[\s\-:|]+\|\s*$", line):
                    continue
                cells = [c.strip() for c in line.strip().strip("|").split("|")]
                idm = re.search(r"([A-Z]+)-L2-(\d{3})", cells[0])
                if not idm or len(cells) != len(table_labels) + 1:
                    fs.append(finding("unknown", path, i, "固定親表の行を解析できない（ID・列数）", form="fixed_parent_table"))
                    continue
                for label, cell in zip(table_labels, cells[1:]):
                    extracted += 1
                    srcl = None
                    for p, t in fixed_files["2"]:
                        if t is None:
                            continue
                        sec = l2_section(t, idm.group(2))
                        if sec:
                            for n, l in sec:
                                mm = re.match(r"^\s*[-*]?\s*\*\*%s\*\*\s*[:：]\s*(.*)$" % re.escape(label), l)
                                if mm:
                                    srcl = (p, n, mm.group(1))
                                    break
                        if srcl:
                            break
                    ev = dict(form="fixed_parent_table", parent_id=idm.group(0), column=label, fixed_revision=frev_r, introduced_in_diff=intro)
                    if not srcl:
                        fs.append(finding("unknown", path, i, "固定L2の親%sに「%s」行が見つからない" % (idm.group(0), label), **ev))
                    elif norm(cell) == norm(srcl[2]):
                        fs.append(finding("pass", path, i, "「%s」列が固定L2 %s:%dと一致" % (label, srcl[0], srcl[1]), **ev))
                    else:
                        fs.append(finding("violation", path, i, "「%s」列が固定L2 %s:%dの原文と一致しない" % (label, srcl[0], srcl[1]),
                                          cell=cell[:400], fixed_line_text=srcl[2][:400], **ev))
    if extracted == 0:
        notes.append("照合対象の引用（行番号つき「」引用、固定L11受入oracle行、固定親表）が0件")
    return {"result": combine(fs), "findings": fs, "notes": notes}


# ---------------------------------------------------------------- 4 戻し先の語彙
RETURN_VERB = re.compile(r"へ(?:[^。、]{0,20}?)(?:戻す|返す|戻し|返し|差し戻)")
DEST_SEP = re.compile(r"(?:、|。|：|:|は|を|として|せず|なら|あれば|し|\||（|\(|「|」|；|;)")
ID_LIST = re.compile(r"L(\d+)-(\d{3})((?:/\d{3})+)")
OWNER_PHRASE = re.compile(r"([A-Za-z0-9_.\-]+(?:/[A-Za-z0-9_.\-]+)*|[一-龥ぁ-んァ-ヶー]{1,6})\s*owner")
PREFIXES = ("当該", "該当", "各", "対象の", "所定の", "選択した", "選択", "既存の", "既存")
OWNER_SYNONYMS = {"requirement": "要求", "要求意味": "要求"}  # 同じ語の日英表記だけを同一視する
SUFFIXES = ("の既存経路", "既存経路", "既存route", "経路")


def _protect_ids(s):
    return ID_LIST.sub(lambda m: "L%s-%s%s" % (m.group(1), m.group(2), m.group(3).replace("/", "+")), s)


def dest_phrases(text):
    out = []
    for m in RETURN_VERB.finditer(text):
        before = text[:m.start()]
        cut = 0
        for sm in DEST_SEP.finditer(before):
            cut = sm.end()
        out.append(before[cut:].strip())
    return out


def split_tokens(phrase):
    phrase = _protect_ids(phrase)
    toks = [t.strip() for t in re.split(r"/|／|・|および|及び|または|又は|、|と(?=[A-Z])", phrase)]
    clean = []
    for t in toks:
        for p in PREFIXES:
            if t.startswith(p):
                t = t[len(p):]
        for s in SUFFIXES:
            if t.endswith(s):
                t = t[:-len(s)]
        t = re.sub(r"\s*owner$", " owner", t.strip())
        if t:
            clean.append(t)
    # 「source/domain owner」のような共有suffixを分配する
    if clean and clean[-1].endswith(" owner"):
        for k in range(len(clean) - 1):
            if re.fullmatch(r"[a-z][a-z0-9_.\-]*", clean[k]):
                clean[k] += " owner"
    return clean


def classify(tok):
    m = re.fullmatch(r"(?:([A-Z]+)[\s-]?)?L(\d+)-(\d{3}(?:\+\d{3})*)(\s+owner)?", tok)
    if m:
        ids = ["L%s-%s" % (m.group(2), n) for n in m.group(3).split("+")]
        return ("id", m.group(1), ids)
    if tok in MECHS:
        return ("mech", tok, None)
    if tok.endswith(" owner") and tok[:-6].strip():
        subj = tok[:-6].strip()
        return ("owner", OWNER_SYNONYMS.get(subj, subj), None)
    if tok in ("Worker", "元Worker"):
        return ("misc", tok, None)
    return ("other", tok, None)


def vocabulary(text):
    v = {"ids": set(), "mechs": set(), "owners": set(), "misc": set()}
    t = _protect_ids(text)
    for m in re.finditer(r"L(\d+)-(\d{3}(?:\+\d{3})*)", t):
        for n in m.group(2).split("+"):
            v["ids"].add("L%s-%s" % (m.group(1), n))
    for mech in MECHS:
        if re.search(r"(?<![A-Za-z])%s(?![A-Za-z])" % mech, text):
            v["mechs"].add(mech)
    for m in OWNER_PHRASE.finditer(text):
        for tok in split_tokens(m.group(0)):
            kind, val, _ = classify(tok)
            if kind == "owner":
                v["owners"].add(val)
    if "元Worker" in text:
        v["misc"].add("元Worker")
    for ph in dest_phrases(text):
        for tok in split_tokens(ph):
            kind, val, ids = classify(tok)
            if kind == "other":
                v["misc"].add(val)
            elif kind == "owner":
                v["owners"].add(val)
    return v


def token_verdict(tok, vocab, own_mech):
    kind, val, ids = classify(tok)
    if kind == "id":
        if val and val != own_mech and val in vocab["mechs"]:
            return "ok"
        return "ok" if all(i in vocab["ids"] for i in ids) else "out"
    if kind == "mech":
        return "ok" if val in vocab["mechs"] else "out"
    if kind == "owner":
        if val in vocab["owners"] or val in vocab["mechs"]:
            return "ok"
        c = classify(val)
        if c[0] == "id":
            return token_verdict(val, vocab, own_mech)
        return "out"
    if val in vocab["misc"]:
        return "ok"
    return "unrecognized"


def check_return_vocab(ctx):
    g, head, mech, frev = ctx["git"], ctx.get("head"), ctx.get("mech"), ctx.get("fixed_rev")
    parents = ctx.get("parents") or []
    if not head or not mech or not frev or not parents:
        return {"result": "unknown", "findings": [], "notes": ["--head／--mech／--fixed-rev／--parentのいずれかが無い"]}
    frev_r = g.resolve(frev)
    if not frev_r:
        return {"result": "unknown", "findings": [], "notes": ["固定revision %s を解決できない" % frev]}
    own_mech = mech.replace("helix-", "").upper()
    fs, notes, vocabs = [], [], {}
    fv_path = "docs/%s/%s" % (mech, FV_FILE)
    fv = g.text(head, fv_path)
    changed = g.changed_head_lines(ctx.get("base"), head, fv_path) if ctx.get("base") else None
    l2files = [(p, g.text(frev_r, p)) for p in g.ls(frev_r, fixed_dir(mech, "2"))]
    for parent in parents:
        sec, src = None, None
        for p, t in l2files:
            if t is not None:
                sec = l2_section(t, parent)
                if sec:
                    src = p
                    break
        if not sec:
            fs.append(finding("unknown", None, None, "固定L2に親%sの節が見つからない" % parent, parent=parent))
            continue
        fail_lines = []
        for n, l in sec:
            lm = re.match(r"^\s*[-*]?\s*\*\*([^*]+)\*\*\s*[:：]\s*(.*)$", l)
            if lm and ("戻し先" in lm.group(1) or lm.group(1).startswith("失敗時")):
                fail_lines.append((n, lm.group(2)))
        if not fail_lines:
            fs.append(finding("unknown", src, None, "固定L2の親%sに「失敗時／戻し先」行が無い" % parent, parent=parent))
            continue
        vocab = vocabulary("\n".join(t for _, t in fail_lines))
        vocabs[parent] = {"source": src, "lines": [n for n, _ in fail_lines],
                          **{k: sorted(v) for k, v in vocab.items()}}
        if fv is None:
            fs.append(finding("unknown", fv_path, None, "FVを読めない", parent=parent))
            continue
        ctxs = heading_parents(fv)
        def_lines = {i for i, _ in parent_case_definitions(fv, parent)}
        case_section = False
        scanned = 0
        for i, line in enumerate(lines_of(fv), 1):
            hm = HEADING.match(line)
            if hm:
                case_section = any(case_id_of_parent(t, parent) or (("CASE" in t.split("-")) and parent in t.split("-"))
                                   for t in re.findall(r"[A-Za-z0-9_]+(?:-[A-Za-z0-9_]+)+", hm.group(2)))
                continue
            if not (i in def_lines or case_section or (parent in ctxs[i - 1] and i in def_lines)):
                continue
            phrases = dest_phrases(line)
            if not phrases:
                continue
            scanned += 1
            outs, unk = [], []
            for ph in phrases:
                for tok in split_tokens(ph):
                    v = token_verdict(tok, vocab, own_mech)
                    if v == "out":
                        outs.append(tok)
                    elif v == "unrecognized":
                        unk.append(tok)
            ev = dict(parent=parent, fixed_source="%s:%s" % (src, ",".join(str(n) for n, _ in fail_lines)),
                      phrases=phrases, introduced_in_diff=(i in changed) if changed is not None else None)
            if outs and unk:
                fs.append(finding("unknown", fv_path, i, "戻し先 %s は語彙の外だが、同じ記述に判別できない語 %s があり確信が低い" % (outs, unk),
                                  out_of_vocabulary=outs, unrecognized=unk, **ev))
            elif outs:
                fs.append(finding("violation", fv_path, i, "戻し先 %s が固定L2の親%sの戻し先語彙の外" % (outs, parent), out_of_vocabulary=outs, **ev))
            elif unk:
                fs.append(finding("unknown", fv_path, i, "戻し先の語 %s を語彙として判別できない（確信が低い）" % unk, unrecognized=unk, **ev))
            else:
                fs.append(finding("pass", fv_path, i, "戻し先が固定L2の親%sの語彙内" % parent, **ev))
        if scanned == 0:
            fs.append(finding("unknown", fv_path, None, "親%sのCASE行に戻し先の記述が見つからない" % parent, parent=parent))
    return {"result": combine(fs), "findings": fs, "notes": notes, "vocabulary": vocabs}


# ---------------------------------------------------------------- 5 境界の削除（advisory）
BOUNDARY_WORDS = re.compile(r"しない|させない|含めない|混ぜない|入れない|拒否|禁止|不合格|限る|のみ|だけ|戻す|返す|停止|保留|hold|deny|reject")
ANY_ID = re.compile(r"[A-Z][A-Z0-9]*(?:-[A-Za-z0-9]+)*-\d{2,3}|L\d+-\d{3}")


def check_boundary_removed(ctx):
    g, head, base, mech = ctx["git"], ctx.get("head"), ctx.get("base"), ctx.get("mech")
    if not head or not base or not mech:
        return {"result": "unknown", "findings": [], "notes": ["--base／--head／--mechのいずれかが無い（差分を取れない）"]}
    if not g.resolve(base) or not g.resolve(head):
        return {"result": "unknown", "findings": [], "notes": ["base／headを解決できない"]}
    fs = []
    for rel in BODY_FILES:
        path = "docs/%s/%s" % (mech, rel)
        hunks = g.diff_hunks(base, head, path)
        htext = g.text(head, path)
        if hunks is None:
            continue
        hnorm = norm(htext or "")
        for bstart, blines, _, _ in hunks:
            for k, bl in enumerate(blines):
                cells = [c for c in bl.split("|")] if bl.lstrip().startswith("|") else [bl]
                for cell in cells:
                    for _, s in sentences(cell):
                        ns = norm(s)
                        if len(ns) < 4 or ns in hnorm:
                            continue
                        words = BOUNDARY_WORDS.findall(s)
                        ids = ANY_ID.findall(s)
                        if words or ids:
                            fs.append(finding("advisory", path, bstart + k,
                                              "baseの文がHEADに残っていない（境界語・IDを含む）。意図的な削除かをreviewで確かめる",
                                              base_sentence=s.strip()[:300], boundary_words=sorted(set(words)), ids=sorted(set(ids))[:10],
                                              line_ref="base:%d" % (bstart + k)))
    return {"result": "advisory", "findings": fs,
            "notes": ["advisoryは判定ではなくreviewの注意点。violationにしない。表のcellは文単位で比較し、HEAD全文のどこかに同じ文があれば列挙しない"]}


# ---------------------------------------------------------------- 登録と実行
REGISTRY = [
    ("pin_recompute", check_pin_recompute, "hard"),
    ("count_ids", check_count_ids, "hard"),
    ("fixed_quote", check_fixed_quote, "hard"),
    ("return_vocab", check_return_vocab, "hard"),
    ("boundary_removed", check_boundary_removed, "advisory"),
]


def source_digests():
    out = {}
    for d, dirs, names in os.walk(HERE):
        dirs[:] = sorted(x for x in dirs if x != "__pycache__")
        for name in sorted(names):
            if name.endswith((".py", ".json", ".md")):
                p = os.path.join(d, name)
                with open(p, "rb") as f:
                    out["scaffold/l3l10-checks/" + os.path.relpath(p, HERE).replace(os.sep, "/")] = sha256b(f.read())
    return out


def run_checks(ctx, only=None):
    registered = [cid for cid, _, _ in REGISTRY]
    evaluated, results = [], {}
    for cid, fn, sev in REGISTRY:
        if only and cid not in only:
            continue
        try:
            r = fn(ctx)
        except Exception as e:  # 例外はunknownとして記録し、合格へ縮退させない
            r = {"result": "unknown", "findings": [], "notes": ["検査器の例外: %s: %s" % (type(e).__name__, e)]}
        r["severity"] = sev
        results[cid] = r
        evaluated.append(cid)
    hard = [c for c in evaluated if dict((a, s) for a, _, s in REGISTRY)[c] == "hard"]
    rs = [results[c]["result"] for c in hard]
    if sorted(evaluated) != sorted(registered):
        overall, reason = "unknown", "登録した検査 %d件と評価した検査 %d件が一致しない（未評価: %s）" % (
            len(registered), len(evaluated), sorted(set(registered) - set(evaluated)))
    elif "violation" in rs:
        overall, reason = "violation", "違反候補を検出"
    elif "unknown" in rs or not rs:
        overall, reason = "unknown", "unknownの検査がある"
    else:
        overall, reason = "pass", "評価した検査では違反を検出しなかった（承認・合格・merge可を意味しない）"
    return registered, evaluated, results, overall, reason


def build_receipt(ctx, registered, evaluated, results, overall, reason):
    g = ctx["git"]
    inputs = {"repo_root": os.path.abspath(g.root), "gh_repo": ctx.get("gh_repo"), "mech": ctx.get("mech"),
              "parents": ctx.get("parents"), "online": bool(ctx.get("online"))}
    for k in ("base", "head", "fixed_rev", "pin_rev"):
        inputs[k] = {"given": ctx.get(k), "resolved": g.resolve(ctx.get(k)) if ctx.get(k) else None}
    files = {}
    if ctx.get("mech") and inputs["head"]["resolved"]:
        for rel in BODY_FILES:
            p = "docs/%s/%s" % (ctx["mech"], rel)
            b = g.blob(inputs["head"]["resolved"], p)
            files[p] = {"revision": inputs["head"]["resolved"], "sha256": sha256b(b) if b is not None else None,
                        "bytes": len(b) if b is not None else None}
    if ctx.get("mech") and inputs["fixed_rev"]["resolved"]:
        fr = inputs["fixed_rev"]["resolved"]
        for k in ("2", "11"):
            for p in g.ls(fr, fixed_dir(ctx["mech"], k)):
                b = g.blob(fr, p)
                files[p + "@fixed"] = {"revision": fr, "sha256": sha256b(b) if b is not None else None, "bytes": len(b) if b is not None else None}
    inputs["pins"] = [{"source": s, "sha256": sha256b(r.encode("utf-8")) if isinstance(r, str) else None} for s, r in ctx.get("pins", [])]
    inputs["target_files"] = files
    return {
        "record_type": "l3l10_violation_check_receipt",
        "status": "scaffold",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "binding": "scaffold/bindings/SCF-B-0157.json",
        "checker": {"version": CHECKER_VERSION, "source_digests": source_digests()},
        "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "inputs": inputs,
        "registry": {"registered": registered, "evaluated": evaluated,
                     "registered_count": len(registered), "evaluated_count": len(evaluated),
                     "match": sorted(registered) == sorted(evaluated)},
        "overall": overall,
        "overall_reason": reason,
        "results": {k: {"result": v["result"], "severity": v["severity"],
                        "counts": {r: sum(1 for f in v["findings"] if f["result"] == r) for r in ("violation", "unknown", "pass", "advisory")},
                        **{kk: vv for kk, vv in v.items() if kk not in ("result", "severity")}}
                    for k, v in results.items()},
        "authority_note": AUTHORITY_NOTE,
    }


RECEIPT_DIRS = ("scaffold/l3l10-checks/receipts",)


def resolve_receipt_path(repo_root, path):
    """receiptの出力先を検査する。許可するのは --repo-root 配下の RECEIPT_DIRS の中の .json だけ。

    相対pathは --repo-root を基準にする。symlink（出力先そのもの、または途中のdirectory）を経由して
    許可先の外へ出るものと、既存の非regular fileは拒否する。拒否した場合は (None, 理由) を返す。
    """
    root = os.path.realpath(repo_root)
    allowed = [os.path.join(root, d) for d in RECEIPT_DIRS]
    cand = path if os.path.isabs(path) else os.path.join(root, path)
    cand = os.path.normpath(cand)
    if os.path.islink(cand):
        return None, "出力先がsymlinkである"
    real = os.path.realpath(cand)
    if real != cand:
        return None, "途中のdirectoryがsymlinkで、許可先の外へ解決されうる"
    if not real.endswith(".json"):
        return None, "出力先は .json に限る"
    if not any(real.startswith(a + os.sep) for a in allowed):
        return None, "出力先は %s の中に限る（scaffold/外への書込み禁止。SCF-B-0157）" % ", ".join(RECEIPT_DIRS)
    if os.path.exists(real) and not os.path.isfile(real):
        return None, "既存の出力先がregular fileでない"
    return real, None


def write_receipt(real, text):
    os.makedirs(os.path.dirname(real), exist_ok=True)
    fd = os.open(real, os.O_WRONLY | os.O_CREAT | os.O_TRUNC | getattr(os, "O_NOFOLLOW", 0), 0o644)
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(text)


def make_ctx(args, git):
    pins = []
    for p in args.pin or []:
        rev = git.resolve(args.head) if args.head else None
        pins.append((p, git.text(rev, p) if rev else None))
    for p in args.pin_file or []:
        try:
            with open(p, encoding="utf-8") as f:
                pins.append((p, f.read()))
        except OSError:
            pins.append((p, None))
    return {"git": git, "head": args.head, "base": args.base, "fixed_rev": args.fixed_rev, "pin_rev": args.pin_rev,
            "mech": args.mech, "parents": [p.zfill(3) for p in (args.parent or [])], "pins": pins,
            "online": args.online, "gh_repo": args.gh_repo}


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--repo-root", default=DEFAULT_ROOT)
    ap.add_argument("--head", help="検査するPRのcontent HEAD")
    ap.add_argument("--base", help="PRのbase（差分・introduced_in_diff・境界の削除に使う）")
    ap.add_argument("--fixed-rev", help="固定L2／L11のrevision")
    ap.add_argument("--mech", help="機構directory名（例 helix-labo）")
    ap.add_argument("--parent", action="append", help="親番号（例 060）。複数可")
    ap.add_argument("--pin", action="append", help="HEAD上のpin JSON／判断記録のpath。複数可")
    ap.add_argument("--pin-file", action="append", help="local fileのpin JSON／Markdown。複数可")
    ap.add_argument("--pin-rev", help="revisionを持たないpinの既定revision（省略時はHEAD）")
    ap.add_argument("--online", action="store_true", help="formal_body_rawをgh apiのcomment bodyと照合する（読み取りだけ）")
    ap.add_argument("--gh-repo", default="RetryYN/HELIX-HARNESS")
    ap.add_argument("--receipt", help="receipt JSONの出力先（省略時は標準出力）。--repo-root配下の %s の中の .json に限る。相対pathは --repo-root 基準" % RECEIPT_DIRS[0])
    args = ap.parse_args(argv)
    receipt_path = None
    if args.receipt:
        receipt_path, why = resolve_receipt_path(args.repo_root, args.receipt)
        if receipt_path is None:
            print("E_INPUT: --receipt %s を拒否した：%s" % (args.receipt, why), file=sys.stderr)
            return 2
    git = Git(args.repo_root)
    if args.head and not git.resolve(args.head):
        print("E_INPUT: --head %s を解決できない" % args.head, file=sys.stderr)
        return 2
    ctx = make_ctx(args, git)
    registered, evaluated, results, overall, reason = run_checks(ctx)
    receipt = build_receipt(ctx, registered, evaluated, results, overall, reason)
    out = json.dumps(receipt, ensure_ascii=False, indent=1, sort_keys=False)
    if receipt_path:
        write_receipt(receipt_path, out + "\n")
        for cid in evaluated:
            r = results[cid]
            print("%-17s %-9s %s" % (cid, r["result"], {k: sum(1 for f in r["findings"] if f["result"] == k) for k in ("violation", "unknown", "advisory")}))
        print("registered=%d evaluated=%d overall=%s（%s）" % (len(registered), len(evaluated), overall, reason))
        print("receipt: %s sha256=%s" % (os.path.relpath(receipt_path, os.path.realpath(args.repo_root)), sha256b((out + "\n").encode("utf-8"))))
    else:
        print(out)
    return {"pass": 0, "violation": 1, "unknown": 3}[overall]


if __name__ == "__main__":
    sys.exit(main())
