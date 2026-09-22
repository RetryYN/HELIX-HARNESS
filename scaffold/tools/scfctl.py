#!/usr/bin/env python3
"""scfctl — Scaffold Binding（仮設束縛）の仮組み検査tool。

標準libraryだけで動く。書き込むのは scaffold/ 配下だけ（retire: binding fileのstate、
check-replacement --record / selftest --record: evidence/）。要求・設計・承認・受入は生成しない。

終了code: 0 合格 / 1 不合格 / 2 入力不正
"""
import argparse, datetime, glob, hashlib, json, os, re, shlex, stat, sys, tempfile
from pathlib import Path

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
LEGACY_ROOT = "archive/legacy-generation-2026-09-14"
STATIC_READ_ONLY_NOTE = "静的read-only参照のみ"
LEGACY_EXECUTION_BOUNDARIES = {
    "execute old-generation archive source/runtime/test/hook/adapter/CI",
    "旧archiveは実行しない",
}
SHA = re.compile(r"^[0-9a-f]{64}$")
DATE = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}$")
INSTRUCTION_FORBIDDEN_TEXT = ("許可している", "承認済み", "権限を与える", "authorized", "#1888")


# ---------- 基本 ----------
def sha256_file(rel):
    p = os.path.join(ROOT, rel)
    if not os.path.isfile(p):
        return None
    with open(p, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def sha256_obj(o):
    return hashlib.sha256(json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def legacy_path_issue(path, check_filesystem=False):
    """旧archive参照を固定root内の通常ファイルに限定する。"""
    if not isinstance(path, str) or not path:
        return "pathが空または文字列でない"
    if os.path.isabs(path) or path.startswith(("/", "\\")) or re.match(r"^[A-Za-z]:[\\/]", path):
        return "absolute path"
    if "\\" in path:
        return "backslash path"
    prefix = LEGACY_ROOT + "/"
    if not path.startswith(prefix):
        return "固定legacy root外"
    parts = path.split("/")
    if any(part in ("", ".", "..") for part in parts):
        return "path normalizationまたはtraversal"
    if os.path.normpath(path) != path:
        return "path normalizationまたはtraversal"
    if not check_filesystem:
        return None

    candidate = os.path.join(ROOT, path)
    if not os.path.lexists(candidate):
        return "source file missing"
    current = ROOT
    for part in parts:
        current = os.path.join(current, part)
        if os.path.islink(current):
            return "path component is symlink"
    try:
        resolved = Path(candidate).resolve(strict=True)
        allowed_root = Path(os.path.join(ROOT, LEGACY_ROOT)).resolve(strict=True)
        if os.path.commonpath((str(resolved), str(allowed_root))) != str(allowed_root):
            return "resolved path outside fixed legacy root"
        if not stat.S_ISREG(os.stat(candidate, follow_symlinks=False).st_mode):
            return "source is not a regular file"
    except (OSError, ValueError):
        return "source path cannot be resolved"
    return None


def has_static_read_only_note(note):
    """正規句を要求し、否定形によるsubstring通過を拒否する。"""
    if not isinstance(note, str) or STATIC_READ_ONLY_NOTE not in note:
        return False
    return not any(term in note.lower() for term in ("非静的", "not static", "non-static", "not read-only"))


def has_legacy_execution_boundary(forbidden):
    """旧archive非実行の正規句だけを許可する。"""
    return isinstance(forbidden, list) and any(
        isinstance(item, str) and item.strip() in LEGACY_EXECUTION_BOUNDARIES
        for item in forbidden
    )


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
    # 入れ子も schema と同じ集合だけを許す（承認・完了の欄をどこにも持ち込めない。SCF-OS-007）
    nested = {"connections": {"consumers", "dependencies", "boundary"},
              "operations": {"allowed", "forbidden"},
              "verification": {"evidence_kind", "scope", "oracles", "negative_cases"},
              "replacement": {"role_target", "formal_artifacts", "issue", "status", "transfer", "target_revisions", "confirmation_ref", "confirmation_digest"},
              "retired": {"at", "confirmation_ref", "read_after_digest"}}
    for k, al in nested.items():
        v = b.get(k)
        if isinstance(v, dict):
            for kk in v:
                if kk not in al:
                    e.append("E_SHAPE: 未知のkey %s.%s" % (k, kk))
    if isinstance(b.get("upstream"), list):
        for u in b["upstream"]:
            if isinstance(u, dict):
                for kk in u:
                    if kk not in ("path", "sha256", "note"):
                        e.append("E_SHAPE: 未知のkey upstream[].%s" % kk)
    t = (b.get("replacement") or {}).get("transfer") if isinstance(b.get("replacement"), dict) else None
    if isinstance(t, dict):
        for kk in t:
            if kk not in ("role", "obligations", "consumers", "oracles", "negative_cases"):
                e.append("E_SHAPE: 未知のkey replacement.transfer.%s" % kk)
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
            if (not isinstance(u, dict) or not isinstance(u.get("path"), str) or not u.get("path")
                    or not isinstance(u.get("sha256"), str) or not SHA.match(u.get("sha256", ""))
                    or ("note" in u and not isinstance(u.get("note"), str))):
                e.append("E_UPSTREAM: 上流はpathとsha256を持つ（SCF-HARNESS-001）")
    if not isinstance(b["obligations"], list) or not b["obligations"]:
        e.append("E_ROLE: 義務が無い（SCF-HARNESS-002）")
    elif any(not isinstance(x, str) or not x for x in b["obligations"]):
        e.append("E_SHAPE: obligations は空でない文字列list")
    c = b["connections"]
    if not isinstance(c, dict) or any(k not in c for k in ("consumers", "dependencies", "boundary")) or not str(c.get("boundary", "")).strip():
        e.append("E_ROLE: 接続（consumers／dependencies／boundary）が無い（SCF-HARNESS-002）")
    elif (not isinstance(c["consumers"], list) or any(not isinstance(x, str) for x in c["consumers"])
          or not isinstance(c["dependencies"], list) or any(not isinstance(x, str) for x in c["dependencies"])
          or not isinstance(c["boundary"], str)):
        e.append("E_SHAPE: connections.consumers／dependencies は文字列list")
    o = b["operations"]
    if not isinstance(o, dict) or "allowed" not in o or not o.get("forbidden"):
        e.append("E_ROLE: 許可／禁止する操作が無い（SCF-HARNESS-002）")
    elif (not isinstance(o["allowed"], list) or any(not isinstance(x, str) for x in o["allowed"])
          or not isinstance(o["forbidden"], list) or any(not isinstance(x, str) or not x for x in o["forbidden"])):
        e.append("E_SHAPE: operations.allowed／forbidden は文字列list")
    if not isinstance(b["artifacts"], list) or not b["artifacts"]:
        e.append("E_ROLE: 仮artifactが無い（SCF-OS-001）")
    elif any(not isinstance(x, str) or not x for x in b["artifacts"]):
        e.append("E_SHAPE: artifacts は空でない文字列list")
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
            elif any(not isinstance(x, str) or not x for x in v[k]):
                e.append("E_SHAPE: verification.%s は空でない文字列list" % k)
    r = b["replacement"]
    if not isinstance(r, dict) or any(k not in r for k in ("role_target", "formal_artifacts", "issue", "status")):
        e.append("E_SHAPE: replacementはrole_target／formal_artifacts／issue／statusを持つ")
    else:
        if r["status"] not in ("pending", "in_progress", "confirmed"): e.append("E_SHAPE: replacement.status不正")
        if r.get("role_target") is not None and not isinstance(r.get("role_target"), str):
            e.append("E_SHAPE: replacement.role_target はstringまたはnull")
        issue = r["issue"]
        if isinstance(issue, bool) or not isinstance(issue, int):
            e.append("E_ISSUE: 差し替え台帳Issueは整数でなければならない（null／boolを拒否）")
        elif issue < 0:
            e.append("E_ISSUE: 差し替え台帳Issueは負数にできない")
        elif issue == 0 and not (b["state"] == "registered" and r["status"] == "pending"):
            e.append("E_ISSUE: issue=0はregistered+pendingの仮値だけに限る。正式置換は正整数Issueを持つ")
        if not isinstance(r.get("formal_artifacts"), list) or any(not isinstance(x, str) or not x for x in r.get("formal_artifacts", [])):
            e.append("E_SHAPE: replacement.formal_artifacts は文字列list")
        if ("target_revisions" in r and
                (not isinstance(r.get("target_revisions"), dict) or
                 any(not isinstance(k, str) or not SHA.match(str(v)) for k, v in r.get("target_revisions", {}).items()))):
            e.append("E_SHAPE: replacement.target_revisions はpath→sha256のobject")
        if r.get("confirmation_ref") is not None and not isinstance(r.get("confirmation_ref"), str):
            e.append("E_SHAPE: replacement.confirmation_ref はstringまたはnull")
        t = r.get("transfer")
        if t is not None:
            if not isinstance(t, dict):
                e.append("E_SHAPE: replacement.transfer はobjectまたはnull")
            else:
                required_transfer = ("role", "obligations", "consumers", "oracles", "negative_cases")
                if any(k not in t for k in required_transfer):
                    e.append("E_SHAPE: replacement.transfer の必須keyが欠落")
                elif (not isinstance(t["role"], str)
                      or any(not isinstance(t[k], dict) for k in required_transfer[1:])
                      or any(not isinstance(key, str) or not isinstance(value, str) for k in ("obligations", "consumers", "negative_cases") for key, value in t[k].items())
                      or any(not isinstance(key, str) or not isinstance(value, (str, dict)) for key, value in t["oracles"].items())):
                    e.append("E_SHAPE: replacement.transfer は宣言schemaの型を満たさない")
        if r.get("confirmation_digest") is not None and not SHA.match(str(r["confirmation_digest"])):
            e.append("E_SHAPE: confirmation_digest形式")
    for k in ("created", "updated"):
        if not DATE.match(str(b[k])): e.append("E_SHAPE: %s は YYYY-MM-DD" % k)
    if "overlap_reason" in b and not isinstance(b["overlap_reason"], str):
        e.append("E_SHAPE: overlap_reason はstring")
    if "retired" in b:
        retired = b["retired"]
        if not isinstance(retired, dict) or any(not isinstance(retired.get(k), str) for k in ("at", "confirmation_ref", "read_after_digest") if k in retired):
            e.append("E_SHAPE: retired の値はstring")
    return e


def check_rules(b, all_bindings, fs=True, digests=None):
    """形式以外の規則。fs=Falseはfile systemを見ない。digestsを与えると、その集合を「存在するfile」として使う（selftest用）。"""
    if digests is not None:
        if fs is False:
            raise ValueError("fs=False と digests の同時指定はできない（digestsを与えたら存在判定はdigestsで行う）")
        fs = True
    e = []
    r = b["replacement"]
    # A legacy path may be an upstream evidence input only when the binding
    # pins its digest, states the static/read-only boundary, and forbids old
    # archive execution.  The path is still rejected in artifacts, consumers,
    # oracles, and every other binding field.
    legacy_upstream_paths = set()
    for upstream in b.get("upstream", []):
        path = upstream.get("path") if isinstance(upstream, dict) else None
        if not isinstance(path, str) or not LEGACY.search(path):
            continue
        legacy_upstream_paths.add(path)
        note = upstream.get("note", "") if isinstance(upstream, dict) else ""
        forbidden = b.get("operations", {}).get("forbidden", [])
        static_note = has_static_read_only_note(note)
        execution_boundary = has_legacy_execution_boundary(forbidden)
        digest_pinned = isinstance(upstream, dict) and SHA.match(str(upstream.get("sha256", "")))
        path_issue = legacy_path_issue(path, check_filesystem=(fs and digests is None))
        if not (digest_pinned and static_note and execution_boundary) or path_issue:
            e.append("E_STATIC_UPSTREAM: legacy upstreamはsha256固定・静的read-only根拠・旧archive非実行境界が必要: %s" % path)
        elif fs:
            current_digest = digests.get(path) if digests is not None else sha256_file(path)
            if current_digest != upstream["sha256"]:
                e.append("E_STATIC_UPSTREAM: legacy upstream sha256不一致: %s" % path)

    # SCF-OS-003: 旧資産を仮設名義で使わない。binding全体を走査し、禁止事項の列挙（operations.forbidden）だけ除く
    def walk(o, path):
        if isinstance(o, dict):
            for k, v in o.items():
                if path == "operations" and k == "forbidden":
                    continue
                walk(v, path + "." + k if path else k)
        elif isinstance(o, list):
            for i, v in enumerate(o):
                walk(v, "%s[%d]" % (path, i))
        elif isinstance(o, str) and LEGACY.search(o):
            # Validated upstream evidence paths are the sole static-reference
            # exception. Invalid upstream metadata already produced
            # E_STATIC_UPSTREAM above, while all other fields stay fail-closed.
            if re.match(r"^upstream\[\d+\]\.path$", path) and o in legacy_upstream_paths:
                return
            e.append("E_LEGACY: 旧世代archiveを指す %s: %s（SCF-OS-003）" % (path, o[:80]))
    walk(b, "")
    # SCF-OS-001: 置換先の役割が未特定なら有効化不可
    if b["state"] != "registered" and not r.get("role_target"):
        e.append("E_ACTIVATE: 置換先の役割が未特定のbindingは有効にできない（登録だけ。SCF-OS-001）")
    # SCF-OS-002: orphan
    if fs:
        exists = (lambda pth: pth in digests) if digests is not None else (lambda pth: os.path.isfile(os.path.join(ROOT, pth)))
        for u in b["upstream"]:
            if not isinstance(u.get("path"), str) or not exists(u["path"]):
                e.append("E_ORPHAN: 上流が存在しない %s（SCF-OS-002）" % u["path"])
        if b["state"] != "retired" and digests is None:
            for a in b["artifacts"]:
                if not os.path.exists(os.path.join(ROOT, a)):
                    e.append("E_ARTIFACT: 仮artifactが存在しない %s" % a)
    # SCF-OS-002: 二重binding（同じroleを非退役の複数bindingが持つ）
    for o in all_bindings:
        if o is b or o.get("id") == b.get("id"):
            continue
        if o.get("state") != "retired" and b["state"] != "retired" and o.get("role") == b["role"]:
            oid = str(o.get("id")); bid = str(b.get("id"))
            ok = (oid in str(b.get("overlap_reason") or "")) or (bid in str(o.get("overlap_reason") or ""))
            if not ok:
                e.append("E_DOUBLE: 同じ役割 %r を %s も担っており、相手のidを記した根拠がどちらにも無い（SCF-OS-002）" % (b["role"], oid))
    # 状態遷移の飛び越し（SCF-OS-005）
    if b["state"] == "retired":
        if r.get("status") != "confirmed" or not b.get("retired") or not b["retired"].get("read_after_digest"):
            e.append("E_RETIRE: 置換確認とread-afterを経ずにretiredになっている（SCF-OS-005）")
    if r.get("status") == "confirmed" and b["state"] not in ("replacing", "retired"):
        e.append("E_STATE: 置換確認済みなのに状態が %s（replacing→retiredの順。SCF-OS-005／006）" % b["state"])
    return e


def check_stale(b, digests=None):
    """上流revisionの変化。fileが変わっていれば stale 候補。digestsを与えるとfile systemの代わりに使う。"""
    changed = []
    for u in b["upstream"]:
        cur = digests.get(u["path"]) if digests is not None else sha256_file(u["path"])
        if cur is None:
            changed.append((u["path"], "missing"))
        elif cur != u["sha256"]:
            changed.append((u["path"], cur))
    return changed


def check_replacement(b, fs=True, digests=None):
    """SCF-HARNESS-005／SCF-OS-004: 置換の無損失確認。digestsを与えるとfile systemの代わりに使う（selftest用）。"""
    if digests is not None:
        if fs is False:
            raise ValueError("fs=False と digests の同時指定はできない")
        fs = True
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
    formal = list(r.get("formal_artifacts") or [])
    want = r.get("target_revisions") or {}
    # A receipt that names only a subset leaves an unverified formal artifact.
    # Check this after transfer completeness so older partial-transfer cases keep
    # their precise failure, while a complete A/B transfer cannot pass with A only.
    if not e and set(want) != set(formal):
        missing = sorted(set(formal) - set(want))
        extra = sorted(set(want) - set(formal))
        e.append("E_REVISION_SET: target_revisions must cover every formal_artifact (missing=%s extra=%s)" % (missing, extra))
    # 二重owner／二重writer／二重CI: 移管先が複数の正式artifactを同一項目に持つことは表せないので、
    # 同じ移管先が別bindingの正式側と衝突していないかは residuals で見る。ここでは対象revisionを固定する。
    revs = {}
    if fs:
        for a in r.get("formal_artifacts") or []:
            s = digests.get(a) if digests is not None else sha256_file(a)
            if s is None:
                e.append("E_REPL: 正式artifactが存在しない %s" % a)
            else:
                revs[a] = s
        for a, s in revs.items():
            if a in want and want[a] != s:
                e.append("E_REVISION: 正式artifact %s のrevisionが記録と一致しない（SCF-OS-004）" % a)
        for a in want:
            if a not in revs:
                e.append("E_REVISION: target_revisionsにあるが正式artifactに無い %s" % a)
        if not want:
            e.append("E_REVISION: target_revisions（置換対象のrevision）が未記録（SCF-OS-004）")
    return e, revs


def check_receipt_revisions(binding, receipt, current_revisions):
    """Require the recorded receipt to cover and match every formal artifact."""
    formal = set(binding["replacement"].get("formal_artifacts") or [])
    recorded = receipt.get("target_revisions") if isinstance(receipt, dict) else None
    if not isinstance(recorded, dict) or set(recorded) != formal:
        return ["E_RECEIPT_REVISION_SET: confirmation receipt must record every formal_artifact revision"]
    if any(recorded.get(path) != digest for path, digest in current_revisions.items()):
        return ["E_RECEIPT_REVISION: confirmation receipt artifact revision changed"]
    return []


def operation_preflight(binding, operation, all_bindings=None):
    """Mutation/evidence entry guard: shape first, then applicable local rules.

    Operation commands receive one binding by ID.  Include only bindings that
    can conflict with the target role, so an unrelated malformed sibling cannot
    change the result while the duplicate-role rule still applies.
    """
    errors = check_shape(binding)
    if errors:
        return errors
    allowed_states = {
        "check-replacement": {"registered", "active", "replacing"},
        "retire": {"replacing"},
    }.get(operation)
    if allowed_states is not None and binding["state"] not in allowed_states:
        return ["E_STATE: %s はstate=%sでは実行できない" % (operation, binding["state"])]
    candidates = all_bindings
    if candidates is None:
        candidates = [candidate for _, candidate, _ in load_bindings() if isinstance(candidate, dict)]
    related = [candidate for candidate in candidates
               if candidate is binding or candidate.get("id") == binding.get("id")
               or candidate.get("role") == binding.get("role")]
    if not related:
        related = [binding]
    return check_rules(binding, related)


def external_hook_residuals(binding, home=None, manifest_path=None):
    """binding隣接の参照台帳を読む。利用者設定を実行・変更しない。"""
    declared_manifest = os.path.join(SCF, "external-references", binding["id"] + ".json")
    manifest = manifest_path or declared_manifest
    if not os.path.isfile(manifest):
        declared = binding.get("artifacts", []) + [u.get("path") for u in binding.get("upstream", [])]
        if os.path.relpath(declared_manifest, ROOT) in declared:
            return ["外部hook参照台帳が欠落。残留を判定できない"]
        return []
    errors = []
    try:
        with open(manifest) as stream:
            spec = json.load(stream)
        if spec["binding_id"] != binding["id"] or spec["authority_effect"] != "none":
            raise ValueError("参照台帳identity不一致")
        for relative in spec["settings_paths"]:
            if relative not in ("~/.claude/settings.json", "~/.codex/hooks.json"):
                raise ValueError("参照台帳settings対象外")
            path = os.path.join(home or os.path.expanduser("~"), relative[2:])
            if not os.path.exists(path):
                continue
            with open(path) as stream:
                settings = json.load(stream)
            count = 0
            for records in settings.get("hooks", {}).values():
                for record in records:
                    for hook in record.get("hooks", []):
                        tokens = shlex.split(hook.get("command", ""))
                        scripts = [t for t in tokens if t.endswith(spec["script_suffix"])]
                        if not scripts:
                            continue
                        count += 1
                        if any(not os.path.isfile(t) for t in scripts):
                            errors.append("外部hook参照先不在: " + relative)
            limit = spec["retired_expected_count"] if binding["state"] == "retired" else spec["maximum_per_settings_file"]
            if count > limit:
                errors.append("外部hook残留・重複: %s count=%d" % (relative, count))
        source_path = spec.get("instruction_source")
        if source_path:
            if source_path != "scaffold/review-handoff/claude-current-loader.md":
                raise ValueError("参照台帳instruction source対象外")
            with open(os.path.join(ROOT, source_path), encoding="utf-8") as stream:
                source = stream.read().strip()
            if sha256_file(source_path) != spec["instruction_source_sha256"]:
                errors.append("外部instruction source revision不一致")
            start, end = spec["instruction_start"], spec["instruction_end"]
            if source.count(start) != 1 or source.count(end) != 1:
                raise ValueError("instruction source marker不正")
            if any(term in source for term in INSTRUCTION_FORBIDDEN_TEXT):
                errors.append("外部instruction sourceに操作許可の成立宣言が含まれる")
            for relative in spec.get("instruction_paths", []):
                if relative != "~/.claude/CLAUDE.md":
                    raise ValueError("参照台帳instruction対象外")
                path = os.path.join(home or os.path.expanduser("~"), relative[2:])
                if not os.path.exists(path):
                    continue
                with open(path, encoding="utf-8") as stream:
                    value = stream.read()
                count = value.count(start)
                expected = 0 if binding["state"] == "retired" else spec["maximum_managed_blocks"]
                if count > expected or count != value.count(end):
                    errors.append("外部instruction残留・重複: %s count=%d" % (relative, count))
                elif count == 1:
                    begin = value.index(start)
                    finish = value.index(end, begin) + len(end)
                    if value[begin:finish] != source:
                        errors.append("外部instructionがHELIX sourceと不一致: " + relative)
    except (OSError, ValueError, KeyError, TypeError):
        errors.append("外部hook参照台帳・設定を検証できない")
    return errors


def residuals(bindings, fs=True):
    out = []
    for b in bindings:
        if fs:
            out.extend((b["id"], error) for error in external_hook_residuals(b))
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
def evidence_payload(name, payload):
    """記録の置き場と内容を決める。置き場は scaffold/evidence/ 直下だけ。証拠種別と authority_effect は必ず付く。"""
    # 記録名は単純なfile名だけ。path区切り・親参照を含む名前を拒否することで、scaffold/evidence/ の外へ出られない
    if os.sep in name or "/" in name or name in ("", ".", ".."):
        raise ValueError("E_EVIDENCE: 記録名にpathを含められない（scaffold/evidence/ の外へは書かない） %r" % name)
    p = os.path.join(EVIDENCE, name)
    payload = dict(payload, evidence_kind="scaffold", authority_effect="none",
                   note="仮の検証の記録。正式なCI／検証／受入の成立を意味しない")
    return p, payload


def evidence_record(name, payload):
    os.makedirs(EVIDENCE, exist_ok=True)
    p, payload = evidence_payload(name, payload)
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
        if isinstance(b, dict) and b.get("id") == bid:
            return p, b
    print("E_INPUT: binding %s が無い" % bid); sys.exit(2)


def cmd_check_replacement(args):
    p, b = find(args.id)
    preflight = operation_preflight(b, "check-replacement")
    for x in preflight: print("  - " + x)
    if preflight:
        print("check-replacement %s: FAIL (%d)" % (b.get("id", args.id), len(preflight)))
        return 1
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
    preflight = operation_preflight(b, "retire")
    for x in preflight: print("  - " + x)
    if preflight:
        print("retire %s: 拒否" % b.get("id", args.id)); return 1
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
            if rec.get("binding") != b["id"]: errs.append("E_RETIRE: 確認記録は別のbinding %s のもの" % rec.get("binding"))
            if rec.get("binding_core_digest") != binding_core_digest(b):
                errs.append("E_RETIRE: 確認後にbindingの内容が変わっている（対象revision不一致。SCF-OS-004）")
            current_revisions = {}
            for artifact in b["replacement"].get("formal_artifacts") or []:
                digest = sha256_file(artifact)
                if digest is not None:
                    current_revisions[artifact] = digest
            errs += check_receipt_revisions(b, rec, current_revisions)
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


def legacy_static_fs_case_errors(case):
    """selftest専用。旧archiveを実行せず、隔離した一時filesystemでpath境界だけを検査する。"""
    global ROOT
    bindings = case.get("bindings") or [case["binding"]]
    old_root = ROOT
    with tempfile.TemporaryDirectory(prefix="scfctl-legacy-static-") as td:
        ROOT = td
        try:
            for artifact in bindings[0].get("artifacts", []):
                artifact_path = os.path.join(ROOT, artifact)
                os.makedirs(os.path.dirname(artifact_path), exist_ok=True)
                with open(artifact_path, "w", encoding="utf-8") as f:
                    f.write("selftest artifact\n")
            fixture = case.get("filesystem") or {}
            for rel, text in (fixture.get("files") or {}).items():
                file_path = os.path.join(ROOT, rel)
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(str(text))
            for rel, target in (fixture.get("symlinks") or {}).items():
                link_path = os.path.join(ROOT, rel)
                os.makedirs(os.path.dirname(link_path), exist_ok=True)
                target_path = target if os.path.isabs(target) else os.path.join(ROOT, target)
                os.symlink(target_path, link_path)
            errs = []
            for binding in bindings:
                e1 = check_shape(binding)
                if not e1:
                    errs += check_rules(binding, bindings, fs=True)
            return errs
        finally:
            ROOT = old_root


def cmd_selftest(args):
    """checks/cases/*.json を実行する。旧archiveは実行せず、必要なfs検査は隔離fixtureだけを見る。"""
    cases = sorted(glob.glob(os.path.join(CASES, "*.json")))
    results = []; fails = 0
    for cp in cases:
        with open(cp, encoding="utf-8") as f: c = json.load(f)
        bs = c.get("bindings") or [c["binding"]]
        target = bs[0]
        cmd = c["command"]; dg = c.get("file_digests")
        if cmd == "validate":
            errs = []
            for t in bs:  # 全bindingを検査する
                e1 = check_shape(t)
                if not e1: e1 = check_rules(t, bs, fs=False)
                errs += e1
        elif cmd == "check-replacement":
            errs = check_shape(target)
            if not errs: errs = (check_replacement(target, digests=dg) if dg is not None else check_replacement(target, fs=False))[0]
        elif cmd == "residuals":
            errs = ["R: %s" % m for _, m in residuals(bs, fs=False)]
        elif cmd == "stale":
            errs = ["E_STALE: %s -> %s" % (pth, cur) for pth, cur in check_stale(target, dg or {})]
        elif cmd == "orphan":
            errs = check_shape(target)
            if not errs: errs = check_rules(target, bs, digests=dg or {})
        elif cmd == "legacy-static-fs":
            errs = legacy_static_fs_case_errors(c)
        elif cmd == "retire-precheck":
            errs = []
            if target["state"] != "replacing": errs.append("E_RETIRE: state=replacing からだけ撤去できる")
            if target["replacement"].get("status") != "confirmed": errs.append("E_RETIRE: 置換確認が完了していない")
            if c.get("read_after_digest") != c.get("confirmation_digest"): errs.append("E_RETIRE: read-after不一致")
            rec = c.get("confirmation_record") or {}
            if rec and rec.get("binding") != target["id"]: errs.append("E_RETIRE: 確認記録は別のbinding")
            if rec and rec.get("binding_core_digest") not in (None, binding_core_digest(target)):
                errs.append("E_RETIRE: 確認後にbindingの内容が変わっている")
            if rec:
                errs += check_receipt_revisions(target, rec, c.get("file_digests") or {})
            if rec: errs += check_replacement(target, digests=dg or {})[0]
        elif cmd == "evidence-scope":
            errs = []
            try:
                pth, payload = evidence_payload(c["evidence_name"], c.get("payload") or {})
                if not pth.startswith(os.path.normpath(EVIDENCE) + os.sep): errs.append("E_EVIDENCE: scaffold/evidence/ の外")
                if payload.get("evidence_kind") != "scaffold" or payload.get("authority_effect") != "none": errs.append("E_EVIDENCE: 種別が固定されていない")
            except ValueError as ex:
                errs.append(str(ex))
        else:
            print("E_INPUT: 未知のcommand %s (%s)" % (cmd, cp)); return 2
        got = "fail" if errs else "pass"
        codes = c.get("expect_codes", [])
        if c["expect"] == "fail" and not codes:
            print("E_INPUT: expect=fail のcaseは expect_codes が必須 (%s)" % cp); return 2
        # 期待したcodeがすべて出ていて、期待していないerrorが1つも無いときだけ合格
        ok = got == c["expect"] and all(any(code in x for x in errs) for code in codes) and all(any(code in x for code in codes) for x in errs)
        fails += 0 if ok else 1
        results.append({"case": os.path.basename(cp), "l11": c.get("l11"), "requirements": c.get("requirements"),
                        "expect": c["expect"], "got": got, "ok": ok, "messages": errs})
        print("%s %s  %s" % ("ok  " if ok else "NG  ", os.path.basename(cp), c.get("l11", "")))
        if not ok:
            for x in errs: print("      " + x)
    # 記録済みの selftest.json が現行toolと一致しているか（toolを変えたのに記録を更新し忘れた状態を検出する）
    rec_path = os.path.join(EVIDENCE, "selftest.json")
    cases_digest = sha256_obj({os.path.basename(cp): sha256_file(os.path.relpath(cp, ROOT)) for cp in cases})
    if not args.record:
        if not os.path.isfile(rec_path):
            fails += 1
            print("NG   evidence/selftest.json が無い（selftest --record で作る）")
        else:
            with open(rec_path, encoding="utf-8") as f: old = json.load(f)
            cur = sha256_file(os.path.relpath(os.path.abspath(__file__), ROOT))
            if old.get("tool_sha256") != cur or old.get("cases") != len(cases) or old.get("cases_sha256") != cases_digest:
                fails += 1
                print("NG   evidence/selftest.json が現行tool・case集合と一致しない（selftest --record で更新する）")
    print("cases=%d fail=%d" % (len(cases), fails))
    if args.record:
        rel, dig = evidence_record("selftest.json", {
            "checked_at": datetime.date.today().isoformat(), "cases": len(cases), "fail": fails, "results": results,
            "tool_sha256": sha256_file(os.path.relpath(os.path.abspath(__file__), ROOT)), "cases_sha256": cases_digest})
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
