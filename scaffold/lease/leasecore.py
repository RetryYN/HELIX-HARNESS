#!/usr/bin/env python3
"""leasecore — Capability Lease（CAPLEASE-BOOT-01）の判定の中核。

GitHubにもgitにも触れない純粋な関数だけを置く。入力はcollector（leasegh.py）が作るsnapshot（dict）で、
出力は型付きの拒否理由の一覧である。判定の意味の正本は
docs/governance/audits/source-rebaseline/capability-lease-bootstrap-decision-packet.md（以下 packet）。
本moduleは判断（承認・採否・処分）を生成しない。snapshotにある人間判断を照合するだけである。
"""
import hashlib, json, re

LEASE_ID = "CAPLEASE-BOOT-01"
REPO = "RetryYN/HELIX-HARNESS"
PACKET = "docs/governance/audits/source-rebaseline/capability-lease-bootstrap-decision-packet.md"
LEASE_RECORD = "scaffold/lease/lease.json"
DECISIONS = "docs/governance/decisions/"
PROFILES = ("repository_foundation", "operation_change", "decision_record")
KNOWN_CLASSES = ("repository_foundation", "concept_revision", "planning_revision", "research_premise",
                 "discovery_evidence", "requirement", "design_verification", "implementation", "operation_change",
                 "decision_record")
OP_INPUTS = ("helix_os_requirement", "operation_authority", "backup", "rollback", "read_after")
SHA40 = re.compile(r"^[0-9a-f]{40}$")
SHA64 = re.compile(r"^[0-9a-f]{64}$")

# 停止原因（packet「merge前の検査」冒頭）。これ以外の不成立はPR単位の拒否であり、leaseを止めない。
# AI側GitHub Appのinstallation権限の許可集合（packet: `write`ちょうどに相当。administration・repository rulesを含まない）
APP_PERMISSIONS_ALLOWED = {"contents": "write", "pull_requests": "write", "issues": "write", "metadata": "read",
                           "administration": "read"}   # administrationの読取りは保護設定・rulesetの再取得に要る
PROBE_WINDOW_DAYS = 30        # packet「削除への対処」(i): 30日以内（lease記録では変えない）
MAX_UNAUDITED_MERGES = 10     # packet「監査」: 10件（lease記録では変えない）
SUSPEND_CAUSES = {
    "protection_baseline_changed", "role_mismatch", "bypass_nonempty", "main_actor_mismatch",
    "activity_incomplete", "review_source_unsafe", "post_merge_mismatch", "projection_mismatch",
}


def R(code, detail=""):
    return {"code": code, "detail": detail}


def sha256_bytes(b):
    return hashlib.sha256(b).hexdigest()


LEASE_BINDING = "scaffold/bindings/SCF-B-0004.json"
SHA256_RE = re.compile(r"(?<![0-9a-f])[0-9a-f]{64}(?![0-9a-f])")


def sha256_mentions(text):
    """本文に現れる64桁のSHA-256表記の集合（大文字は小文字へ寄せる）。"""
    return set(SHA256_RE.findall((text or "").lower()))


def sha256_text(s):
    return sha256_bytes(s.encode("utf-8"))


# ---------- 機械可読blockの解析 ----------
BLOCK = re.compile(r"```helix-lease\n(.*?)\n```", re.S)


def lease_block(body):
    """comment本文から```helix-lease```のJSON blockを1つだけ取り出す。0個・2個以上・不正JSONはNone。
    返り値は(dict, blockのbytes)。payload digestはblockのbytes（fenceを含まない）に対して計算する。"""
    if not isinstance(body, str):
        return None
    ms = BLOCK.findall(body)
    if len(ms) != 1:
        return None
    try:
        obj = json.loads(ms[0])
    except json.JSONDecodeError:
        return None
    if not isinstance(obj, dict):
        return None
    return obj, ms[0].encode("utf-8")


def pr_class_from_body(body):
    """PR本文の「## PR区分」見出し直後の最初の値を返す（HTML commentと空行は飛ばす）。"""
    if not isinstance(body, str):
        return None
    lines = body.splitlines()
    for i, l in enumerate(lines):
        if l.strip() == "## PR区分":
            in_comment = False
            for m in lines[i + 1:]:
                s = m.strip()
                if s.startswith("<!--"):
                    in_comment = not s.endswith("-->")
                    continue
                if in_comment:
                    if s.endswith("-->"):
                        in_comment = False
                    continue
                if not s:
                    continue
                if s.startswith("#"):
                    return None
                m = re.match(r"`?([a-z_]+)", s)   # 欄の先頭の英小文字・下線の語を区分とする（後続の括弧書きは含めない）
                return m.group(1) if m else s
            return None
    return None


# ---------- decision recordのfrontmatter（制限したYAML） ----------
def parse_frontmatter(text):
    """`---`で囲んだfrontmatterを読む。対応するのは scalar、scalarの列、dictの列（`- key: value`＋同じindentの続き）だけ。
    書式が外れればNone（fail-closed）。"""
    if not isinstance(text, str) or not text.startswith("---\n"):
        return None
    end = text.find("\n---\n", 4)
    if end < 0:
        return None
    lines = text[4:end].split("\n")
    out, i = {}, 0

    def scalar(v):
        v = v.strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
            return v[1:-1]
        if v == "[]":
            return []
        if v in ("null", "~", ""):
            return None
        return v

    while i < len(lines):
        l = lines[i]
        if not l.strip():
            i += 1
            continue
        m = re.match(r"^([A-Za-z_][A-Za-z0-9_]*):(.*)$", l)
        if not m:
            return None
        key, rest = m.group(1), m.group(2)
        if rest.strip():
            out[key] = scalar(rest)
            i += 1
            continue
        items, i = [], i + 1
        while i < len(lines) and lines[i].startswith("  "):
            li = lines[i]
            mm = re.match(r"^  - (.*)$", li)
            if not mm:
                return None
            first = mm.group(1)
            kv = re.match(r"^([A-Za-z_][A-Za-z0-9_]*):(.*)$", first)
            if not kv:
                items.append(scalar(first))
                i += 1
                continue
            d = {kv.group(1): scalar(kv.group(2))}
            i += 1
            while i < len(lines) and re.match(r"^    [A-Za-z_]", lines[i]):
                kv2 = re.match(r"^    ([A-Za-z_][A-Za-z0-9_]*):(.*)$", lines[i])
                if not kv2:
                    return None
                d[kv2.group(1)] = scalar(kv2.group(2))
                i += 1
            items.append(d)
        out[key] = items
    return out


def record_shape_errors(fm):
    """機械可読欄の形を検査する。空なら正しい形。"""
    e = []
    if not isinstance(fm, dict):
        return ["frontmatterを読めない"]
    d = fm.get("decision")
    if not isinstance(d, str) or not re.match(r"^[a-z_]+(\+[a-z_]+)*$", d):
        e.append("decisionが無い・書式不正")
    if fm.get("decider_role") != "PO":
        e.append("decider_roleがPOでない")
    sp = fm.get("scope_paths")
    if not isinstance(sp, list) or not sp or not all(isinstance(x, str) and x for x in sp):
        e.append("scope_pathsが無い・空")
    at = fm.get("approved_targets")
    if not isinstance(at, list):
        e.append("approved_targetsが無い")
    else:
        for t in at:
            if not isinstance(t, dict) or not isinstance(t.get("path"), str):
                e.append("approved_targetsの行にpathが無い")
                continue
            f, s = t.get("from_sha256"), t.get("sha256")
            if not (f == "absent" or (isinstance(f, str) and SHA64.match(f))):
                e.append("approved_targets %s のfrom_sha256が不正" % t.get("path"))
            if not (s == "deleted" or (isinstance(s, str) and SHA64.match(s))):
                e.append("approved_targets %s のsha256が不正" % t.get("path"))
        if isinstance(d, str) and not is_approve(d) and at:
            e.append("approve以外のrecordにapproved_targetsがある")
    su = fm.get("supersedes")
    if su is not None and not (isinstance(su, list) and all(isinstance(x, str) for x in su)):
        e.append("supersedesの書式不正")
    return e


def is_approve(decision):
    return isinstance(decision, str) and decision.split("+")[0] == "approve"


# ---------- authority面・保護面 ----------
AUTH_NAME_WORDS = ("policy", "contract", "packet", "decision", "register", "carry-forward", "receipt", "lease")
AUTH_PATHS_EXACT = ("AGENTS.md", "CLAUDE.md", "scaffold/README.md",
                    "docs/governance/github-upstream-operating-model.md")
AUTH_BASENAMES = ("github-upstream-pr-packet.md", "new-generation-start-here.md", "authority-state-model.md",
                  "management-provisional-requirement-registration.md")
AUTH_PREFIXES = ("docs/governance/decisions/", "docs/concept/", "docs/governance/candidates/",
                 "docs/governance/feature-tickets/", "docs/governance/intake/", "docs/governance/requirements-source/",
                 "docs/governance/crosswalks/")
AUTH_KEYS = ("authority_effect", "authority_status", "decision_status", "decision_record", "human_disposition",
             "disposition", "ratified", "approved", "carry_status", "successor", "requirement_change_authority")
AUTH_WORDS_JA = ("承認", "追認", "採否", "却下", "処分", "有効", "無効", "失効", "取消", "停止", "再開", "完了", "置換", "撤去", "確定", "凍結")
GITATTR_PROTECTED = re.compile(r"(^|\s)[-!]?(diff|filter|merge|export-ignore|export-subst|working-tree-encoding|ident|binary)(=|\s|$)")


def _norm(s):
    return re.sub(r"[\s_\-|`\"'*]", "", s.lower())


def auth_path(p):
    if p in AUTH_PATHS_EXACT or any(p.startswith(x) for x in AUTH_PREFIXES):
        return True
    if re.match(r"^docs/helix-[^/]+/", p):
        return True
    base = p.rsplit("/", 1)[-1]
    if base in AUTH_BASENAMES:
        return True
    return any(w in base.lower() for w in AUTH_NAME_WORDS)


def auth_line(line):
    n = _norm(line)
    if any(_norm(k) in n for k in AUTH_KEYS):
        return True
    if re.match(r"^\s*[|\"']?\s*(status|state)\s*[|\"']?\s*[:=|]", line, re.I):
        return True
    return any(w in line for w in AUTH_WORDS_JA)


def protected_paths(snapshot):
    """保護面のpath集合と判定関数を返す（.gitattributesは行単位で別に判定する）。"""
    lease = snapshot.get("lease") or {}
    fixed = {PACKET, LEASE_RECORD}
    fixed |= set(lease.get("audit_records") or [])
    fixed |= set(lease.get("tool_inputs") or [])
    fixed |= set(snapshot.get("binding_upstreams") or [])   # main HEADとmerge commitの両方のbindingから

    def is_prot(p):
        if p in fixed:
            return True
        if p.startswith("scaffold/") and p != "scaffold/README.md":
            return True
        if p.startswith(".github/"):
            return True
        return False
    return is_prot


def diff_entries(snapshot):
    """name-statusを、pathごとの変更前後の状態に直す。renameは旧pathの削除と新pathの追加として扱う。"""
    out = {}
    for e in snapshot.get("diff", {}).get("files", []):
        out[e["path"]] = e
    return out


def is_gitattributes(path):
    """どの階層の`.gitattributes`も、git archive等の挙動を変えるため行単位で判定する。"""
    return path == ".gitattributes" or path.endswith("/.gitattributes")


def gitattributes_protected_change(entry):
    for l in (entry.get("added") or []) + (entry.get("removed") or []):
        s = l.strip()
        if not s or s.startswith("#"):
            continue
        parts = s.split(None, 1)
        if len(parts) == 2 and GITATTR_PROTECTED.search(" " + parts[1]):
            return True
    return False


# ---------- recordの利用可否 ----------
def usable_basis_record(snapshot, path, sha):
    """他のPRの根拠に使えるrecordか。使えない理由を返す（使えるならNone）。"""
    if not path.startswith(DECISIONS):
        return "decisions/配下でない"
    rec = (snapshot.get("main_records") or {}).get(path)
    if not rec:
        return "main HEADに無い"
    if rec.get("sha256") != sha:
        return "SHA-256がmain HEADと不一致"
    if path in diff_entries(snapshot):
        return "本PRがrecordを変更・削除する"
    fm = parse_frontmatter(rec.get("text"))
    errs = record_shape_errors(fm)
    if errs:
        return "機械可読欄を持たない（%s）" % "、".join(errs)
    if not is_approve(fm.get("decision")):
        return "approve以外のrecord"
    if not rec.get("carried_by_lease"):
        return "decision_record profile（または非常経路）でmainへ入ったrecordでない"
    for other in (snapshot.get("main_records") or {}).values():
        ofm = parse_frontmatter(other.get("text"))
        if isinstance(ofm, dict) and path in (ofm.get("supersedes") or []):
            return "後のrecordのsupersedesに挙がっている"
    return None


def state_of(files, path):
    """main HEADまたはmerge commitでのpathの状態（sha256、無ければ"absent"）。"""
    s = (files or {}).get(path)
    return s if s else "absent"


# ---------- 人間判断（PO review）の照合 ----------
DECISION_LINE = re.compile(r"^decision: ([a-z_]+(?:\+[a-z_]+)*)\s*$")


def decision_lines(body):
    """行頭の`decision:`で始まる行をすべて数える。書式に合わない行はNoneとして残し、呼出し側で不成立にする。"""
    return [(m.group(1) if m else None) for l in (body or "").splitlines() if l.startswith("decision:")
            for m in [DECISION_LINE.match(l)]]


def latest_po_review(snapshot, head):
    """最新のPO reviewを確定し、判断が成立すれば(choice, review)、不成立なら(None, 理由)を返す。"""
    po = (snapshot.get("lease") or {}).get("identity", {}).get("po")
    if po and (po in ai_logins(snapshot.get("lease") or {}) or po.endswith("[bot]")):
        return None, "人間判断者loginがAI側login"
    reviews = [r for r in snapshot.get("reviews") or [] if r.get("user") == po]
    if not po or not reviews:
        return None, "人間判断者loginのPR reviewが無い"
    # PENDINGは提出前のため提出時刻を持たないが、最新の判断の候補に含めて不成立とする（古いreviewへ戻らない。packet 条件2）
    if any(r.get("state") == "PENDING" for r in reviews):
        return None, "最新のPO reviewがPENDING"
    cur_ids = {r.get("id") for r in reviews}
    for rid in (snapshot.get("observed_review_ids") or []):
        if rid not in cur_ids:
            return None, "観測済みのPO review %s が一覧に無い（削除）" % rid
    ev = snapshot.get("events_review_ids")
    if ev is not None:
        for rid in ev:
            if rid not in cur_ids:
                return None, "eventsに現れたPO review %s が一覧に無い（削除）" % rid
    r = max(reviews, key=lambda x: (x.get("submitted_at") or "", x.get("id") or 0))
    if r.get("commit_id") != head:
        return None, "最新のPO reviewのcommit_idがreview済みHEADと不一致"
    if r.get("last_edited_at"):
        return None, "最新のPO reviewが編集されている"
    ds = decision_lines(r.get("body"))
    if len(ds) != 1 or ds[0] is None:
        return None, "最新のPO reviewの判断行が%d行、または書式不正" % len(ds)
    choice = ds[0]
    want = "APPROVED" if is_approve(choice) else "CHANGES_REQUESTED"
    if r.get("state") != want:
        return None, "最新のPO reviewの状態%sが選択%sと合わない" % (r.get("state"), choice)
    return choice, r


# ---------- 削除不能の実測 ----------
def probe_status(snapshot):
    """'ok' / 'stale' / 'unsafe' と詳細を返す（packet「削除への対処」(i)）。"""
    lease = snapshot.get("lease") or {}
    probe = lease.get("probe") or {}
    tests = probe.get("test_reviews") or []
    logins = ai_logins(lease)
    now = snapshot.get("now_epoch")
    window = PROBE_WINDOW_DAYS * 86400
    if not tests or not logins or now is None:
        return "stale", "試験reviewまたはAI側loginが未登録"
    # 多重防御: 固定した試験reviewが試験PRに現存すること
    present = set(snapshot.get("test_review_ids_present") or [])
    states = snapshot.get("test_review_states")
    if sorted(t.get("state") for t in tests) != ["APPROVED", "CHANGES_REQUESTED"]:
        return "stale", "試験reviewがAPPROVEDとCHANGES_REQUESTEDの各1件でない"
    for t in tests:
        if t.get("id") not in present:
            return "unsafe", "試験review %s が試験PRに現存しない" % t.get("id")
        st = None if states is None else states.get(t.get("id"), states.get(str(t.get("id"))))
        if states is not None and st != t.get("state"):
            # 状態が変わった（DISMISSED等）試験reviewでは、その状態の削除不能を実測できない
            return "stale", "試験review %s の状態が%sで、lease記録の%sでない" % (t.get("id"), st, t.get("state"))
    results = {}
    for c in snapshot.get("status_comments") or []:
        blk = lease_block(c.get("body"))
        if not blk or blk[0].get("kind") != "lease_probe_result":
            continue
        o = blk[0]
        if c.get("updated_at") != c.get("created_at") or c.get("user") != o.get("login"):
            continue
        t = [x for x in tests if x.get("id") == o.get("review_id") and x.get("state") == o.get("review_state")]
        if not t or o.get("login") not in logins:
            continue
        ts = c.get("created_epoch")
        if ts is None or now - ts > window:
            continue
        results.setdefault((o["login"], o["review_id"]), []).append((ts, o.get("result")))
    for login in logins:
        for t in tests:
            rs = results.get((login, t.get("id")), [])
            if any(res == "deleted" for _, res in rs):
                return "unsafe", "%s が試験review %s を削除できた" % (login, t.get("id"))
            counted = sorted([x for x in rs if x[1] in ("denied", "unavailable")])
            if not counted:
                return "stale", "%s × 試験review %s の30日以内の結果が無い" % (login, t.get("id"))
    return "ok", ""


def ai_logins(lease):
    idt = (lease or {}).get("identity") or {}
    if (lease or {}).get("independence") == "accept_bootstrap_risk":
        return [idt["ai"]] if idt.get("ai") else []
    out = []
    for k in ("creator", "executor", "recovery"):
        if idt.get(k):
            out.append(idt[k])
    out += [r.get("login") for r in idt.get("reviewers") or [] if r.get("login")]
    return out


# ---------- leaseの状態と運搬範囲 ----------
def resume_epoch(lease, to_epoch):
    """直近の解除判断の時刻。解除を記録したlease記録がmainへ入った時刻を上限にする（未来の時刻で停止を消さない）。"""
    lr = to_epoch((lease or {}).get("last_resume_at"))
    cap = (lease or {}).get("record_committed_epoch")
    if lr is None:
        return None
    return min(lr, cap) if cap is not None else lr


def suspended_in_status_issue(comments, lease, to_epoch):
    """状態Issueに、lease記録の直近の解除判断より後の`lease_state: suspended`があるか（packet「状態の保存」）。"""
    last_resume = resume_epoch(lease, to_epoch)
    for c in comments or []:
        blk = lease_block(c.get("body"))
        if blk and blk[0].get("kind") == "lease_state" and blk[0].get("lease_state") == "suspended":
            if not last_resume or (c.get("created_epoch") or 0) > last_resume:
                return True
    return False


def activation_gaps(lease):
    """有効化済みのlease記録に欠けてはならない欄。"""
    idt = (lease or {}).get("identity") or {}
    probe = (lease or {}).get("probe") or {}
    gaps = [k for k, v in (("identity.po", idt.get("po")), ("identity.ai", idt.get("ai") or idt.get("executor")),
                           ("baseline", isinstance(((lease or {}).get("baseline") or {}).get("branch_protection"), dict)
                            and isinstance(((lease or {}).get("baseline") or {}).get("rulesets"), list)),
                           ("status_issue", (lease or {}).get("status_issue")),
                           ("origin_main", (lease or {}).get("origin_main")), ("probe.test_pr", probe.get("test_pr"))) if not v]
    if idt.get("po") and (idt.get("po") in ai_logins(lease) or idt["po"].endswith("[bot]")):
        gaps.append("identity.poがAI側login")
    # POの判断: AI側identityはGitHub App（AI用のaccountは作らない）。AI側の全loginが`<identity.appsのslug>[bot]`であること
    apps = set(idt.get("apps") or [])
    if not apps:
        gaps.append("identity.apps（AI側GitHub App）")
    for l in ai_logins(lease):
        if not (l.endswith("[bot]") and l[:-len("[bot]")] in apps):
            gaps.append("AI側login %s がidentity.appsのGitHub Appでない" % l)
    if not probe.get("activation_results"):
        gaps.append("probe.activation_results（有効化前の実測結果）")
    return gaps


def activation_evidence_errors(snapshot):
    """lease記録に残した有効化前の実測結果comment（`probe.activation_results`）が状態Issueに編集されずに現存し、
    AI側の全login×固定した2つの試験reviewを`denied`または`unavailable`で覆うこと（packet: 有効化前の結果をlease記録に残す）。"""
    lease = snapshot.get("lease") or {}
    probe = lease.get("probe") or {}
    ids = set(probe.get("activation_results") or [])
    by_id = {c.get("id"): c for c in snapshot.get("status_comments") or []}
    covered, errs = set(), []
    for i in sorted(ids, key=str):
        c = by_id.get(i)
        blk = lease_block((c or {}).get("body"))
        if not c or not blk or blk[0].get("kind") != "lease_probe_result":
            errs.append("実測結果comment %s が状態Issueに無い" % i)
            continue
        o = blk[0]
        if c.get("updated_at") != c.get("created_at") or c.get("user") != o.get("login"):
            errs.append("実測結果comment %s が編集されている、または投稿者が実測loginでない" % i)
        elif o.get("result") not in ("denied", "unavailable"):
            errs.append("実測結果comment %s の結果が%s" % (i, o.get("result")))
        else:
            covered.add((o.get("login"), o.get("review_id")))
    for l in ai_logins(lease):
        for t in probe.get("test_reviews") or []:
            if (l, t.get("id")) not in covered:
                errs.append("有効化前の実測結果に %s × 試験review %s が無い" % (l, t.get("id")))
    return errs


def lease_scope(snapshot, recovery=False):
    """運搬範囲（'all' / 'decision_record' / 'probe_repair' / 'none'）と理由の一覧を返す。
    packet「運搬範囲の優先順位」: review_source_unsafe < deletion_probe_stale < 停止中・取消し後 < 有効。"""
    lease = snapshot.get("lease") or {}
    reasons = []
    if not lease.get("activated_at") or activation_gaps(lease):
        return "none", [R("lease_not_activated", "lease記録の有効化（identity表・基準値・起点）が未了%s" % activation_gaps(lease))]
    ps, pd = probe_status(snapshot)
    if ps == "unsafe":
        return "none", [R("review_source_unsafe", pd)]
    ev = activation_evidence_errors(snapshot)
    if ev:
        return "none", [R("lease_not_activated", "、".join(ev))] + ([R("deletion_probe_stale", pd)] if ps == "stale" else [])
    scope = "all"
    now = snapshot.get("now_epoch")
    if lease.get("expires_epoch") is not None and now is not None and now > lease["expires_epoch"]:
        scope = "decision_record"; reasons.append(R("lease_inactive", "期限切れ"))
    if lease.get("revoked_at"):
        scope = "decision_record"; reasons.append(R("lease_inactive", "取消し済み"))
    if snapshot.get("lease_binding_state") == "retired":
        scope = "decision_record"; reasons.append(R("lease_inactive", "SCF-B-0004がretire済み"))
    if snapshot.get("suspended_local") or snapshot.get("suspended_issue"):
        scope = "decision_record"; reasons.append(R("lease_inactive", "suspended"))
    if (snapshot.get("unaudited_merges") or 0) >= MAX_UNAUDITED_MERGES:
        scope = "decision_record"; reasons.append(R("lease_inactive", "監査の遅れ"))
    if ps == "stale":
        scope = "probe_repair"; reasons.append(R("deletion_probe_stale", pd))
    if recovery and scope == "all":
        scope = "decision_record"
    return scope, reasons


def recovery_enumeration_errors(snapshot, record_fm):
    """起点を付け直して再開するrecordは、起点以降の非常mergeごとに、`merge_result`のread-after結果を列挙する
    （`recovery_read_after`: `merge_commit`と`mismatch_items`（不一致の項目を`,`で連ねる。無ければ`none`））。
    列挙が`merge_result`と一致し、状態Issueに同じmergeの停止commentがあることを確かめる（packet 非常経路「停止」）。"""
    out = []
    listed = {e.get("merge_commit"): e for e in (record_fm or {}).get("recovery_read_after") or [] if isinstance(e, dict)}
    status_text = "\n".join(c.get("body") or "" for c in snapshot.get("status_comments") or [])
    for r in snapshot.get("recovery_merge_results") or []:
        mc = r.get("merge_commit")
        if not isinstance(r.get("read_after"), dict):
            out.append(R("recovery_enumeration_missing", "非常merge %s のmerge_result（read-after結果）が無い" % mc))
            continue
        want = ",".join(sorted({x.get("item") or x.get("code") for x in (r.get("read_after") or {}).get("mismatches") or []})) or "none"
        e = listed.get(mc)
        if not e:
            out.append(R("recovery_enumeration_missing", "非常merge %s のread-after結果を列挙していない" % mc))
            continue
        got = ",".join(sorted(x.strip() for x in (e.get("mismatch_items") or "").split(",") if x.strip())) or "none"
        if got != want:
            out.append(R("recovery_enumeration_missing", "非常merge %s の列挙%sがmerge_resultの%sと不一致" % (mc, got, want)))
        if mc not in status_text:
            out.append(R("recovery_enumeration_missing", "非常merge %s の停止commentが状態Issueに無い" % mc))
    return out


def is_probe_repair(snapshot, record_fm):
    """approved_targetsが実測commandとlease記録の実測関連の欄だけであるdecision_recordか（lease記録は欄単位で比較）。"""
    lease = snapshot.get("lease") or {}
    allowed = set(lease.get("probe_paths") or [])
    for t in record_fm.get("approved_targets") or []:
        p = t.get("path")
        if p == LEASE_RECORD:
            before, after = snapshot.get("lease_record_before"), snapshot.get("lease_record_after")
            if not isinstance(before, dict) or not isinstance(after, dict):
                return False
            keys = set(before) | set(after)
            if any(before.get(k) != after.get(k) for k in keys if k != "probe"):
                return False
        elif p not in allowed:
            return False
    return True


# ---------- review証拠 ----------
def review_evidence(snapshot, pair, profile_needs):
    """pairに束縛された依頼・receipt・応答を照合する。(理由の一覧, 依頼payload, 証拠comment一覧)を返す。"""
    reasons, evid = [], []
    lease = snapshot.get("lease") or {}
    idt = lease.get("identity") or {}
    separate = lease.get("independence") == "require_separate_identity"
    comments = snapshot.get("comments") or []
    reqs, rcpts, resps = [], [], []
    for c in comments:
        blk = lease_block(c.get("body"))
        if not blk:
            continue
        o, raw = blk
        k = o.get("kind")
        if k in ("review_request", "review_request_delivery_receipt", "review_response"):
            if o.get("pr") != snapshot["pr"]["number"] or o.get("base") != pair[0] or o.get("head") != pair[1]:
                continue   # 別pairは数えない
            if not separate and c.get("user") != idt.get("ai"):
                reasons.append(R("review_identity_mismatch", "%s %s の投稿者がAI側loginでない" % (k, c.get("id"))))
                continue   # accept_bootstrap_riskでも、AI側identity以外の投稿は証拠にしない
            (reqs if k == "review_request" else rcpts if k == "review_request_delivery_receipt" else resps).append((c, o, raw))
    if len(reqs) < 2:
        reasons.append(R("review_incomplete", "pairに束縛された依頼が%d件（2 context以上が要る）" % len(reqs)))
    payloads = []
    ctx_seen = set()
    independent = False
    for c, o, raw in reqs:
        rid = o.get("review_request_id")
        payload = o.get("payload") or {}
        payloads.append(payload)
        evid.append(c)
        if c.get("updated_at") != c.get("created_at"):
            reasons.append(R("review_comment_edited", "依頼 %s" % rid))
        if o.get("payload_sha256") != sha256_text(json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))):
            reasons.append(R("review_payload_mismatch", "依頼 %s のpayload_sha256" % rid))
        if separate and c.get("user") != idt.get("creator"):
            reasons.append(R("review_identity_mismatch", "依頼 %s の投稿者が作成側loginでない" % rid))
        rc = [x for x in rcpts if x[1].get("review_request_id") == rid and x[1].get("delivery_result") == "delivered"]
        rc = [x for x in rc if not any(y[1].get("correction_of") == x[1].get("receipt_id") for y in rcpts)]
        if not rc:
            reasons.append(R("review_incomplete", "依頼 %s にdelivery receiptが無い" % rid)); continue
        rcc, rco, _ = rc[-1]
        evid.append(rcc)
        if rcc.get("updated_at") != rcc.get("created_at"):
            reasons.append(R("review_comment_edited", "receipt %s" % rid))
        if rco.get("request_comment_id") != c.get("id") or rco.get("payload_sha256") != o.get("payload_sha256") \
                or rco.get("remote_body_sha256") != sha256_text(c.get("body") or ""):
            reasons.append(R("review_payload_mismatch", "receipt %s が依頼commentと一致しない" % rid))
        if separate and rcc.get("user") != idt.get("creator"):
            reasons.append(R("review_identity_mismatch", "receipt %s の投稿者が作成側loginでない" % rid))
        rs = [x for x in resps if x[1].get("review_request_id") == rid]
        if not rs:
            reasons.append(R("review_incomplete", "依頼 %s に応答が無い" % rid)); continue
        for rsc, rso, _ in rs:
            evid.append(rsc)
            if rsc.get("updated_at") != rsc.get("created_at"):
                reasons.append(R("review_comment_edited", "応答 %s" % rid))
            if not ((c.get("created_at"), c.get("id") or 0) < (rcc.get("created_at"), rcc.get("id") or 0)
                    < (rsc.get("created_at"), rsc.get("id") or 0)):
                reasons.append(R("review_order_invalid", "依頼→receipt→応答の順でない（%s）" % rid))
            cnt = rso.get("counts") or {}
            if any(not isinstance(cnt.get(k), int) for k in ("blocker", "major", "minor")):
                reasons.append(R("review_incomplete", "応答 %s に件数が無い" % rid))
            elif cnt["blocker"] or cnt["major"] or cnt["minor"]:
                reasons.append(R("review_findings_open", "応答 %s: %s" % (rid, cnt)))
            if rso.get("authority_basis_sufficient") != "yes" or rso.get("new_authority_created") != "no":
                reasons.append(R("authority_judgement_missing", "応答 %s" % rid))
            for key, val in profile_needs:
                if rso.get(key) != val:
                    reasons.append(R({"operation_admission": "operation_input_missing",
                                      "transcription_faithful": "transcription_unverified"}.get(key, "review_incomplete"),
                                     "応答 %s の%sが%sでない" % (rid, key, val)))
            rv = rso.get("reviewer") or {}
            if not all(rv.get(k) for k in ("runtime", "model", "provider", "session")):
                reasons.append(R("review_incomplete", "応答 %s にreviewer contextが無い" % rid))
            ctx_seen.add(rv.get("session"))
            cr = payload.get("creator") or {}
            if rv.get("runtime") and rv.get("provider") and rv.get("runtime") != cr.get("runtime") and rv.get("provider") != cr.get("provider"):
                independent = True
            if rv.get("session") == cr.get("session") or rv.get("session") == snapshot.get("executor_context"):
                reasons.append(R("review_independence_insufficient", "応答 %s のcontextが作成側またはexecutorと同じ" % rid))
            if rso.get("transcribed"):
                if separate:
                    reasons.append(R("review_transcription_forbidden", "応答 %s" % rid))
            elif separate:
                logins = [x.get("login") for x in idt.get("reviewers") or [] if x.get("session_label") in (None, rv.get("runtime"))]
                if rsc.get("user") not in logins:
                    reasons.append(R("review_identity_mismatch", "応答 %s の投稿者が登録reviewer loginでない" % rid))
    if reqs and len({s for s in ctx_seen if s}) < 2:
        reasons.append(R("review_independence_insufficient", "reviewer contextが2未満"))
    if reqs and not independent and not snapshot.get("recovery_reviewer_loss"):
        reasons.append(R("review_independence_insufficient", "runtimeとproviderの両方が作成側と異なる応答が無い"))
    if snapshot.get("executor_context") in {(p.get("creator") or {}).get("session") for p in payloads}:
        reasons.append(R("review_independence_insufficient", "executorのcontextが作成側と同じ"))
    canon = {json.dumps({k: p.get(k) for k in ("pr_class", "authority_basis", "operation_inputs")}, sort_keys=True) for p in payloads}
    if len(canon) > 1:
        reasons.append(R("review_request_inconsistent", "pairの依頼間で区分・authority_basis・operation_inputsが食い違う"))
    return reasons, (payloads[0] if payloads else {}), evid


# ---------- admission判定 ----------
def evaluate(snapshot, recovery=None):
    """merge前の判定。recovery=None（通常）/'review'（非常経路）/'comment'（再bootstrap mode）。
    返り値: {"reasons": [...], "profile": str|None, "suspend": [...], "scope": str, "run_checks": bool, "decision": dict|None}"""
    reasons = []
    pr = snapshot.get("pr") or {}
    lease = snapshot.get("lease") or {}
    pair = (snapshot.get("pair_base"), snapshot.get("pair_head"))
    main_files = snapshot.get("main_files") or {}
    merge_files = snapshot.get("merge_files") or {}

    # 対象PR
    if pr.get("repo") != REPO or pr.get("base_ref") != "main" or pr.get("state") != "OPEN":
        reasons.append(R("pr_not_eligible", "repository・base・stateが対象外"))
    if pr.get("draft"):
        reasons.append(R("pr_not_eligible", "draft"))
    if pr.get("number") == (lease.get("probe") or {}).get("test_pr"):
        reasons.append(R("pr_not_eligible", "試験PRはどのprofileでも対象にしない"))
    if pr.get("head_sha") != pair[1] or snapshot.get("main_head") != pair[0]:
        reasons.append(R("review_head_stale", "PR head・main HEADがreview済みpairと不一致"))
    if not pr.get("mergeable"):
        reasons.append(R("mergeable_false"))
    if pr.get("auto_merge"):
        reasons.append(R("auto_merge_reserved"))

    # lease状態と運搬範囲
    if recovery:
        scope = "decision_record"
        ps, pd = probe_status(snapshot)
        if recovery == "review":
            if ps == "unsafe":
                reasons.append(R("review_source_unsafe", pd + "（PO reviewを出所とする非常経路は使わない）"))
            elif ps == "stale":
                scope = "probe_repair"
        scope_reasons = []
        if not lease.get("activated_at") or activation_gaps(lease):
            scope_reasons.append(R("lease_not_activated", "、".join(activation_gaps(lease))))
    else:
        scope, scope_reasons = lease_scope(snapshot)
    reasons += [x for x in scope_reasons if x["code"] in ("lease_not_activated", "review_source_unsafe")]

    # 区分（依頼payloadの区分を先に読む。review証拠の照合は区分固有の欄を含めて下で行う）
    body_class = pr_class_from_body(pr.get("body"))
    _, payload, _ = review_evidence(snapshot, pair, [])
    req_class = payload.get("pr_class")
    profile = req_class
    if not req_class or req_class not in KNOWN_CLASSES:
        reasons.append(R("class_missing", "依頼に区分が無い"))
    elif req_class not in PROFILES:
        reasons.append(R("profile_undefined", req_class))
    if body_class != req_class:
        reasons.append(R("class_changed", "PR本文の区分%sが依頼時の%sと違う" % (body_class, req_class)))
    if scope == "none":
        reasons.append(R("lease_scope_excludes_profile", "運搬範囲なし（再bootstrapだけで進む）"))
    elif scope in ("decision_record", "probe_repair") and profile != "decision_record":
        reasons.append(R("lease_scope_excludes_profile", "運搬範囲%sで%sは運ばない" % (scope, profile)))
        reasons += [x for x in scope_reasons if x["code"] not in ("lease_not_activated", "review_source_unsafe")]
    if recovery and profile != "decision_record":
        reasons.append(R("lease_scope_excludes_profile", "非常経路はdecision_recordだけを運ぶ"))

    needs = []
    if profile == "operation_change":
        needs.append(("operation_admission", "pass"))
    if profile == "decision_record":
        needs.append(("transcription_faithful", "yes"))
    rev_reasons, payload, evid = review_evidence(snapshot, pair, needs)
    reasons += rev_reasons

    entries = diff_entries(snapshot)
    is_prot = protected_paths(snapshot)

    # decision_record profile
    decision = None
    own_record_path, own_fm, own_cover = None, None, set()
    if profile == "decision_record":
        added_records = [p for p, e in entries.items() if p.startswith(DECISIONS) and e.get("status") == "A"]
        touched_records = [p for p, e in entries.items() if p.startswith(DECISIONS) and e.get("status") != "A"]
        if len(added_records) != 1 or touched_records:
            reasons.append(R("decision_record_shape_invalid", "decisions/への新規追加1件だけでない（既存recordの変更・削除は含められない）"))
        else:
            own_record_path = added_records[0]
            own_fm = parse_frontmatter((snapshot.get("merge_texts") or {}).get(own_record_path))
            errs = record_shape_errors(own_fm)
            if errs:
                reasons.append(R("decision_record_shape_invalid", "、".join(errs)))
            else:
                tg = own_fm.get("approved_targets") or []
                tpaths = {t["path"] for t in tg}
                if set(entries) != {own_record_path} | tpaths:
                    reasons.append(R("decision_record_shape_invalid", "PR差分がrecordと対象集合に一致しない"))
                for t in tg:
                    base = t["path"].rsplit("/", 1)[-1].lower()
                    if any(w in base for w in ("receipt", "backup", "rollback", "read-after", "readafter")):
                        reasons.append(R("decision_record_shape_invalid", "対象に外部操作の記録 %s を含む" % t["path"]))
                    if state_of(main_files, t["path"]) != t.get("from_sha256"):
                        reasons.append(R("protected_from_mismatch", "%s のmain HEADの状態がfrom_sha256と不一致" % t["path"]))
                    after = merge_files.get(t["path"]) or "deleted"
                    if after != t.get("sha256"):
                        reasons.append(R("decision_record_shape_invalid", "%s のmerge後の状態が承認と不一致" % t["path"]))
                if scope == "probe_repair" and not is_probe_repair(snapshot, own_fm):
                    reasons.append(R("lease_scope_excludes_profile", "実測の期限切れ中は実測の修理だけを運ぶ"))
                    reasons += [x for x in scope_reasons if x["code"] == "deletion_probe_stale"]
                own_cover = {own_record_path} | (tpaths if is_approve(own_fm.get("decision")) else set()) | set(own_fm.get("scope_paths") or [])
                # 人間判断の出所
                if recovery == "comment":
                    dec, info = snapshot.get("rebootstrap_decision"), None
                    if not dec or not dec.get("ok"):
                        reasons.append(R("decision_review_invalid", (dec or {}).get("reason", "再bootstrapの判断commentが不成立")))
                    elif dec.get("choice") != own_fm.get("decision"):
                        reasons.append(R("decision_review_invalid", "判断commentの選択がrecordと不一致"))
                    else:
                        decision = dec
                else:
                    choice, info = latest_po_review(snapshot, pair[1])
                    if choice is None:
                        reasons.append(R("decision_review_invalid", info))
                    elif choice != own_fm.get("decision"):
                        reasons.append(R("decision_review_invalid", "最新のPO reviewの選択%sがrecordの%sと不一致" % (choice, own_fm.get("decision"))))
                    else:
                        decision = {"source": "review", "review": info, "choice": choice}
    else:
        for p in entries:
            if p.startswith(DECISIONS):
                reasons.append(R("decisions_path_outside_profile", p))

    # 根拠の照合
    basis = payload.get("authority_basis") or []
    basis_fms = []
    for b in basis:
        why = usable_basis_record(snapshot, b.get("path", ""), b.get("sha256"))
        if why:
            reasons.append(R("authority_basis_invalid", "%s: %s" % (b.get("path"), why)))
        else:
            basis_fms.append(parse_frontmatter(snapshot["main_records"][b["path"]]["text"]))
    auth = []
    record_shas = set(snapshot.get("decision_shas") or []) | set(snapshot.get("upstream_shas") or [])
    for p, e in entries.items():
        hit = auth_path(p) or (e.get("before_sha") in record_shas)
        if not hit:
            lines = (e.get("added") or []) + (e.get("removed") or [])
            for l in lines:
                if e.get("status") == "A" and l.strip() == "authority_effect: none":
                    continue
                if auth_line(l):
                    hit = True
                    break
        if hit:
            auth.append(p)
    cover = set(own_cover)
    for fm in basis_fms:
        cover |= set(fm.get("scope_paths") or []) | {t["path"] for t in fm.get("approved_targets") or []}
    for b in basis:
        cover.add(b.get("path"))
    if auth and not basis and not own_cover:
        reasons.append(R("authority_basis_missing", "authority面の差分: %s" % ", ".join(sorted(auth))))
    else:
        out = [p for p in auth if p not in cover]
        if out:
            reasons.append(R("authority_scope_exceeded", "scope_pathsの和集合の外: %s" % ", ".join(sorted(out))))

    # 保護面
    for p, e in entries.items():
        prot = is_prot(p) or (is_gitattributes(p) and gitattributes_protected_change(e))
        if not prot:
            continue
        approvers = []
        for fm in basis_fms:
            approvers += fm.get("approved_targets") or []
        if own_fm and is_approve((own_fm or {}).get("decision")) and profile == "decision_record":
            approvers += own_fm.get("approved_targets") or []
        ok = False
        for t in approvers:
            if t.get("path") != p:
                continue
            after = merge_files.get(p) or "deleted"
            if t.get("from_sha256") == state_of(main_files, p) and t.get("sha256") == after:
                ok = True
        if not ok:
            reasons.append(R("protected_surface_unapproved", p))

    # operation_change
    if profile == "operation_change":
        oi = payload.get("operation_inputs") or {}
        for k in OP_INPUTS:
            v = oi.get(k) or {}
            if not v.get("path") or merge_files.get(v.get("path")) != v.get("sha256"):
                reasons.append(R("operation_input_missing", "%s がmerge commitに同じSHA-256で無い" % k))
        oa = (oi.get("operation_authority") or {}).get("path")
        if oa and (not oa.startswith(DECISIONS) or oa not in {b.get("path") for b in basis}):
            reasons.append(R("operation_input_missing", "操作authorityがauthority_basisのdecision recordでない"))

    # lease全体の検査（停止原因）。付け直しを判断したrecordを運ぶmergeでは、recordが承認した新しい値で照合する。
    health_lease = lease
    if profile == "decision_record" and own_fm and is_approve(own_fm.get("decision")) and \
            LEASE_RECORD in {t["path"] for t in own_fm.get("approved_targets") or []} and \
            isinstance(snapshot.get("lease_record_after"), dict):
        health_lease = snapshot["lease_record_after"]
    if health_lease is not lease:
        reasons += recovery_enumeration_errors(snapshot, own_fm)
    act = snapshot.get("activity") or {}
    if act.get("temporary_failure"):
        reasons.append(R("activity_unavailable_temporary", "PR単位の拒否。再試行する"))
    reasons += evaluate_lease_health(snapshot, recovery=recovery, lease=health_lease,
                                     skip_activity=bool(act.get("temporary_failure") or (act.get("degraded") and recovery)))

    # 検査はcodeを実行しない条件がすべて成立したときだけ
    run_checks = not reasons
    chk = snapshot.get("checks")
    if chk is not None:
        for key, label in (("a", "checks_failed_a"), ("b", "checks_failed_b")):
            c = chk.get(key) or {}
            if not c.get("ok"):
                reasons.append(R(label, c.get("summary", "")))
            if c.get("stale") != 0:
                reasons.append(R("stale_nonzero", "(%s) stale=%s" % (key, c.get("stale"))))
    return {"reasons": reasons, "profile": profile, "suspend": [x for x in reasons if x["code"] in SUSPEND_CAUSES],
            "scope": scope, "run_checks": run_checks, "decision": decision, "evidence": evid, "payload": payload,
            "record": own_record_path, "health_lease": health_lease if health_lease is not lease else None}


def merge_message_kind(msg):
    """receipt_messageの固定位置（1行目と3行目）でlease merge・非常mergeを見分ける。本文中の引用には反応しない。"""
    lines = (msg or "").split("\n")
    m = re.match(r"^Merge pull request #(\d+) via Capability Lease$", lines[0] if lines else "")
    if not m or len(lines) < 3:
        return None
    if lines[2] == "lease_receipt: %s" % LEASE_ID:
        return "lease"
    if lines[2] == "lease_recovery: %s" % m.group(1):
        return "recovery"
    return None


def activity_chain_ok(snapshot, recovery=None, after=None, lease=None):
    """main更新主体の照合。activity（時系列昇順）の連鎖と主体を確かめる。"""
    act = snapshot.get("activity") or {}
    lease = lease if lease is not None else (snapshot.get("lease") or {})
    origin = snapshot.get("activity_origin")
    if lease is not snapshot.get("lease") and lease.get("origin_main") and lease["origin_main"] != origin:
        origin = lease["origin_main"]   # 起点の付け直し: 新しい起点から集めたactivityで照合する
        act = (snapshot.get("activity_by_origin") or {}).get(origin) or {}
    head = after or snapshot.get("main_head")
    if not act.get("reached_origin"):
        return False, "取得: 起点以前に達しない（保持期間外）"
    items = act.get("items") or []
    idt = lease.get("identity") or {}
    executor = idt.get("ai") if lease.get("independence") == "accept_bootstrap_risk" else idt.get("executor")
    rec = idt.get("ai") if lease.get("independence") == "accept_bootstrap_risk" else idt.get("recovery")
    prev = origin
    for it in items:
        if it.get("before") != prev:
            return False, "取得: before／afterの連鎖切れ"
        if "first_parent" in it and it.get("first_parent") != it.get("before"):
            return False, "更新後commitの第1親が更新前のHEADでない（%s）" % it.get("after")
        if it.get("activity_type") != "push":
            return False, "main更新がpush以外（%s）" % it.get("activity_type")
        kind = merge_message_kind(it.get("commit_message"))
        if it.get("actor") == executor and kind == "lease" and it.get("is_merge"):
            pass
        elif it.get("activates_lease") and it.get("is_merge") and it.get("before") == lease.get("origin_main") \
                and it.get("before") == (snapshot.get("activity_origin") or origin) and it.get("actor") in ai_logins(lease):
            pass   # 起点の直後の1件だけ: lease記録を有効にした後続operation_change PRのmerge（既存規則。packet bootstrap）
        elif it.get("actor") == rec and kind == "recovery" and it.get("is_merge"):
            if not recovery:
                return False, "非常経路のmerge（executor以外のmain更新）"
        else:
            return False, "executorのlease merge以外の更新（actor %s）" % it.get("actor")
        prev = it.get("after")
    if prev != head:
        return False, "取得: 最後の更新がmain HEADに届かない"
    return True, ""


def evaluate_after(snapshot, pushed_sha, inspected_tree, pair, merged_ok, result_posted):
    """merge後のread-after（packet「merge後」）。不一致はすべて停止原因。"""
    reasons = []

    def miss(item, detail):
        r = R("post_merge_mismatch", detail)
        r["item"] = item   # 再開recordが項目ごとに名指しする単位（packet 非常経路「停止」）
        reasons.append(r)
    if snapshot.get("main_head") != pushed_sha:
        miss("main_head", "新main HEADがpushしたmerge commitと不一致")
    if snapshot.get("main_tree") != inspected_tree:
        miss("tree", "treeが検査したtreeと不一致")
    if snapshot.get("main_parents") != [pair[0], pair[1]]:
        miss("parents", "親が検査したmain HEAD・content HEADでない")
    if snapshot.get("stale") != 0:
        miss("stale", "新mainでstale=%s" % snapshot.get("stale"))
    pre = evaluate_lease_health(snapshot, after=pushed_sha, recovery=snapshot.get("recovery_mode"),
                                lease=snapshot.get("health_lease"))
    for x in pre:
        miss(x["code"], "%s %s" % (x["code"], x["detail"]))
    if not merged_ok:
        miss("merged_display", "10分以内にPRがmergedと表示されない")
    if not result_posted:
        miss("merge_result_post", "merge_resultの投稿に失敗")
    return reasons


def evaluate_lease_health(snapshot, after=None, recovery=None, lease=None, skip_activity=False):
    """保護設定・ruleset・bypass・実効role・main更新主体（すべて停止原因）。"""
    lease = lease if lease is not None else (snapshot.get("lease") or {})
    out = []
    s = snapshot.get("protection") or {}
    base = lease.get("baseline") or {}
    if s.get("unavailable") or not isinstance(s.get("branch_protection"), dict):
        out.append(R("protection_baseline_changed", "保護設定を取得できない（%s）" % s.get("detail", "")))
    elif not isinstance(base.get("branch_protection"), dict) or not isinstance(base.get("rulesets"), list):
        out.append(R("protection_baseline_changed", "lease記録の基準値が無い"))
    elif s.get("branch_protection") != base.get("branch_protection") or s.get("rulesets") != base.get("rulesets"):
        out.append(R("protection_baseline_changed"))
    for r in s.get("rulesets") or []:
        if r.get("bypass_actors"):
            out.append(R("bypass_nonempty", str(r.get("id"))))
            break
    roles = snapshot.get("roles") or {}
    separate = lease.get("independence") == "require_separate_identity"
    reviewer_logins = {x.get("login") for x in (lease.get("identity") or {}).get("reviewers") or []}
    apps = set((lease.get("identity") or {}).get("apps") or [])
    for l in ai_logins(lease):
        if l.endswith("[bot]") and l[:-len("[bot]")] in apps:
            continue   # GitHub Appのloginはinstallation権限（下記）で照合する（packet: GitHub Appならinstallation権限）
        want = ("read", "triage") if (separate and l in reviewer_logins) else ("write",)
        if roles.get(l) not in want:
            out.append(R("role_mismatch", "%s: %s" % (l, roles.get(l))))
    got = {a.get("slug"): a for a in snapshot.get("app_permissions") or [] if not a.get("unavailable")}
    for slug in (lease.get("identity") or {}).get("apps") or []:
        a = got.get(slug)
        if not a:
            out.append(R("role_mismatch", "GitHub App %s のinstallation権限を取得できない" % slug))
            continue
        if a.get("app_slug") != slug:
            out.append(R("role_mismatch", "installationのapp %s がidentity表の %s でない" % (a.get("app_slug"), slug)))
        if not isinstance(a.get("permissions"), dict) or not a["permissions"]:
            out.append(R("role_mismatch", "GitHub App %s のinstallation権限が返らない" % slug))
            continue
        for k, v in a["permissions"].items():
            if k not in APP_PERMISSIONS_ALLOWED or (APP_PERMISSIONS_ALLOWED[k] == "read" and v != "read"):
                out.append(R("role_mismatch", "GitHub App %s のinstallation権限 %s: %s が許可集合の外" % (slug, k, v)))
    for app in snapshot.get("app_permissions") or []:
        perms = app.get("permissions") if isinstance(app.get("permissions"), dict) else app
        if perms.get("administration") == "write" or perms.get("repository_rules") == "write":
            out.append(R("role_mismatch", "GitHub Appの権限にadministrationまたはrepository rulesの書込みがある"))
    if not skip_activity:
        ok, why = activity_chain_ok(snapshot, recovery, after, lease=lease)
        if not ok:
            out.append(R("activity_incomplete" if why.startswith("取得") else "main_actor_mismatch", why))
    return out


# ---------- merge commit messageの記録 ----------
def merge_result_body(snapshot, merge_commit, read_after, recovery=None):
    """対象PRへ置く`merge_result`（packet: 結果、merge commit SHA、親、read-after結果）。read-afterの後に作る。"""
    o = {"kind": "merge_result", "lease_id": LEASE_ID, "pr": snapshot["pr"]["number"], "merge_commit": merge_commit,
         "parents": [snapshot["main_head"], snapshot["pair_head"]], "tree": snapshot.get("merge_tree"),
         "result": "merged" if not read_after else "merged_read_after_mismatch",
         "read_after": {"ok": not read_after, "mismatches": read_after}}
    if recovery:
        o["lease_recovery"] = snapshot["pr"]["number"]
    return "```helix-lease\n%s\n```" % json.dumps(o, ensure_ascii=False, sort_keys=True)


def receipt_message(snapshot, result, checks, executor_context, recovery=None, degraded=None, rebootstrap_args=None):
    pr = snapshot["pr"]
    lines = ["Merge pull request #%d via Capability Lease" % pr["number"], ""]
    if recovery:
        lines.append("lease_recovery: %d" % pr["number"])
    else:
        lines.append("lease_receipt: %s" % LEASE_ID)
    lines += ["lease_id: %s" % LEASE_ID, "pr: %d" % pr["number"], "profile: %s" % result.get("profile"),
              "pair_base: %s" % snapshot["pair_base"], "pair_head: %s" % snapshot["pair_head"],
              "inspected_main: %s" % snapshot["main_head"], "executor_context: %s" % executor_context]
    d = result.get("decision")
    if d and d.get("source") == "review":
        r = d["review"]
        lines += ["decision_source: review", "po_review_id: %s" % r.get("id"), "po_review_user: %s" % r.get("user"),
                  "po_review_state: %s" % r.get("state"), "po_review_commit_id: %s" % r.get("commit_id"),
                  "po_review_body_sha256: %s" % sha256_text(r.get("body") or "")]
    elif d and d.get("source") == "comment":
        lines += ["decision_source: comment", "po_comment_id: %s" % d.get("comment_id"), "po_comment_user: %s" % d.get("user"),
                  "po_comment_choice: %s" % d.get("choice"), "po_comment_head: %s" % d.get("head"),
                  "permission_args: %s" % json.dumps(rebootstrap_args or {}, ensure_ascii=False, sort_keys=True)]
    if degraded:
        lines.append("degraded: %s" % degraded)
    for k in ("a", "b"):
        c = (checks or {}).get(k) or {}
        lines.append("check_%s: ok=%s stale=%s summary=%s" % (k, c.get("ok"), c.get("stale"), c.get("summary", "")))
    lines.append("")
    for c in result.get("evidence") or []:
        lines += ["--- comment %s user=%s sha256=%s" % (c.get("id"), c.get("user"), sha256_text(c.get("body") or "")),
                  c.get("body") or ""]
    if d and d.get("source") == "review":
        lines += ["--- po_review %s" % d["review"].get("id"), d["review"].get("body") or ""]
    elif d and d.get("source") == "comment":
        lines += ["--- po_comment %s" % d.get("comment_id"), d.get("body") or ""]
    return "\n".join(lines) + "\n"


# ---------- projection_sync ----------
def evaluate_sync(snap):
    """projection_syncの書込み前の照合（packet lease 2）。"""
    reasons = []
    lease = snap.get("lease") or {}
    scope, sr = lease_scope(snap)
    if scope != "all":
        reasons += sr or [R("lease_inactive")]
    mp = ((lease.get("projection") or {}).get("mapping") or {})
    issue = str(snap.get("issue"))
    if issue not in mp:
        reasons.append(R("projection_mapping_missing", issue))
        return reasons
    if snap.get("source_path") != mp[issue]:
        reasons.append(R("projection_mapping_missing", "対応fileが違う"))
    last = snap.get("last_receipt")
    if not last or not last.get("on_main"):
        reasons.append(R("projection_receipt_pending", "直前のreceiptがmainに無い"))
    elif snap.get("remote_body_sha256") != last.get("written_sha256"):
        reasons.append(R("projection_mismatch", "remote本文が直前のreceiptと一致しない"))
    return reasons


def evaluate_sync_after(snap, written_sha, checked_sha, state_before, labels_before):
    r = []
    if snap.get("remote_body_sha256") != written_sha:
        r.append(R("projection_mismatch", "read-afterの本文が写したfileと一致しない"))
    if snap.get("state") != state_before or snap.get("labels") != labels_before:
        r.append(R("projection_mismatch", "state・labelが変わった"))
    if snap.get("previous_edit_sha256") != checked_sha:
        r.append(R("projection_mismatch", "編集履歴の直前の版が照合した版でない"))
    return r
