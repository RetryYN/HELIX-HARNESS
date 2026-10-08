#!/usr/bin/env python3
"""l3l10check の自己検査（scaffold）。

1. 回帰コーパス（corpus/major-corpus.json、過去のreviewで返されたMajor 13件）の各要素について、
   bad_head上で該当する型の検査が同じ箇所でviolation（境界の削除はadvisory）を出し、
   fixed_head上では同じ箇所でviolation（advisory）を出さないことを確かめる。
   機械検出困難とされた要素は対象外として記録する（passにしない）。
2. pin再計算・registered／evaluated照合・入力欠損時のunknownを、実在pinと改変した写しで確かめる。

各実行は登録した全検査を評価し、registered＝evaluatedも毎回確かめる。
git objectは読み取りだけ。旧CI・旧testは実行しない。--recordで scaffold/evidence/ に結果を書く。
終了code: 0 期待どおり、1 期待と異なる。
"""
import argparse, copy, datetime, json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import l3l10check as C  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
EVIDENCE = os.path.join(ROOT, "scaffold", "evidence", "l3l10-checks-selftest-2026-10-08.json")
CORPUS = os.path.join(HERE, "corpus", "major-corpus.json")

# コーパス要素ごとの検査対象。親番号は各要素のsummary・bad_textに書かれたCASE ID／L2 IDから読んだ。
TARGETS = {
    (2676, "M1"): {"check": "fixed_quote", "mech": "helix-security", "parent": "012", "basis": "SECURITY-CASE-012-01／固定L11:36"},
    (2677, "M1"): {"check": "fixed_quote", "mech": "helix-connect", "parent": "001", "basis": "HELIXCONNECT-L2-001の出力セル／固定L2:63"},
    (2689, "M1"): {"check": "fixed_quote", "mech": "helix-security", "parent": "028", "basis": "SECURITY-CASE-028-01の括弧引用／固定L11:52"},
    (2679, "M1"): {"check": "count_ids", "mech": "helix-harness", "parent": "039", "basis": "親039の「表の全143定義行」",
                   "partial": "件数の部分（:1555）だけを対象にする。同じ指摘のclaim_overreach（M5節の古い現在形主張）は意味判断であり本検査器の対象外"},
    (2685, "M1"): {"check": "count_ids", "mech": "helix-labo", "parent": "060", "basis": "HELIXLABO-L2-060節の「CASE定義IDは51件」"},
    (2694, "M1"): {"check": "count_ids", "mech": "helix-labo", "parent": "063", "basis": "L10-LABO-063の「L10の69件の定義」"},
    (2680, "M1"): {"check": "boundary_removed", "mech": "helix-os", "parent": "036", "basis": "base nfr-grade:91の「通常operationへ拡張しない。」の消失",
                   "advisory": True},
    (2680, "M2"): {"check": "return_vocab", "mech": "helix-os", "parent": "036", "basis": "CASE-OS-L10-036-08b／固定L2:1053"},
    (2688, "M1"): {"check": "return_vocab", "mech": "helix-os", "parent": "029", "basis": "CASE-OS-029-08a〜e／固定L2:876"},
    (2689, "M2"): {"check": "return_vocab", "mech": "helix-security", "parent": "028", "basis": "SECURITY-CASE-028-01／固定L2:349"},
}
PIN_FIXTURE = {
    "path": "docs/governance/audits/requirements-stage/connect-stage1-parent001-review02-delegated-decision-pin-2026-10-08.json",
    "head": "db12a6c372",  # このpin fileを含むmain（作業開始時のorigin/main）
    "pin_rev": "617801a9e66fe6ff30bfddc8c1e72a3c43c2a722",  # pinのreview.reviewed_head
}


def line_range(spec):
    a, _, b = str(spec).partition("-")
    return int(a), int(b or a)


def at_location(f, item, kind):
    if f.get("path") != item["path"]:
        return False
    lo, hi = line_range(item["line"])
    if kind == "boundary_removed":
        ref = (f.get("evidence") or {}).get("line_ref", "")
        return ref.startswith("base:") and lo <= int(ref[5:]) <= hi
    ln = f.get("line")
    return isinstance(ln, int) and lo <= ln <= hi


def run_full(git, head, base, fixed_rev, mech, parent, pins=None, pin_rev=None, only=None):
    ctx = {"git": git, "head": head, "base": base, "fixed_rev": fixed_rev, "pin_rev": pin_rev, "mech": mech,
           "parents": [parent] if parent else [], "pins": pins or [], "online": False, "gh_repo": None}
    return C.run_checks(ctx, only=only)


def corpus_cases(git):
    items = json.load(open(CORPUS, encoding="utf-8"))
    rows, fails = [], []
    for it in items:
        key = (it["pr"], it["major_id"])
        row = {"pr": it["pr"], "major_id": it["major_id"], "types": it["types"], "path": it["path"], "line": it["line"],
               "bad_head": it["bad_head"], "fixed_head": it["fixed_head"], "base": it["base"],
               "corpus_detectability": it["detectability"]}
        t = TARGETS.get(key)
        if t is None:
            row.update(status="excluded", reason="機械検出困難（%s）。対象外として記録し、passにしない" % it["detectability_reason"])
            rows.append(row)
            continue
        fixed_rev = (it.get("fixed_source") or {}).get("revision", "").split(" ")[0] or None
        if fixed_rev and not git.resolve(fixed_rev):
            fixed_rev = None
        row.update(check=t["check"], mech=t["mech"], parent=t["parent"], basis=t["basis"], fixed_rev=fixed_rev)
        if "partial" in t:
            row["partial"] = t["partial"]
        expect = "advisory" if t.get("advisory") else "violation"
        per = {}
        for side in ("bad_head", "fixed_head"):
            head = it[side]
            if not git.resolve(head):
                per[side] = {"status": "unknown", "reason": "git objectが無い"}
                continue
            reg, ev, res, overall, _ = run_full(git, head, it["base"], fixed_rev, t["mech"], t["parent"])
            r = res[t["check"]]
            hits = [f for f in r["findings"] if f["result"] == expect and at_location(f, it, t["check"])]
            elsewhere = sum(1 for f in r["findings"] if f["result"] == "violation" and not at_location(f, it, t["check"]))
            per[side] = {"check_result": r["result"], "hits_at_location": len(hits),
                         "hit_lines": [h.get("line") if t["check"] != "boundary_removed" else h["evidence"]["line_ref"] for h in hits],
                         "hit_details": [h["detail"] for h in hits][:3],
                         "violations_elsewhere_same_check": elsewhere,
                         "registry_match": reg == ev, "registered": len(reg), "evaluated": len(ev), "overall": overall}
            if reg != ev:
                fails.append("%s %s %s: registered≠evaluated" % (it["pr"], it["major_id"], side))
        row["bad_head_result"], row["fixed_head_result"] = per.get("bad_head"), per.get("fixed_head")
        detected = per.get("bad_head", {}).get("hits_at_location", 0) > 0
        clean = per.get("fixed_head", {}).get("hits_at_location", 1) == 0
        row["detected_on_bad_head"] = detected
        row["no_finding_at_location_on_fixed_head"] = clean
        row["detection_mode"] = expect
        row["status"] = ("detected" if detected and clean else
                         "detected_but_fixed_head_also_flagged" if detected else "not_detected")
        if row["status"] != "detected":
            fails.append("%s %s: %s" % (it["pr"], it["major_id"], row["status"]))
        rows.append(row)
    return rows, fails


def synthetic_cases(git):
    """pin再計算、registry照合、入力欠損のunknownを確かめる合成case。"""
    out, fails = [], []
    raw = git.text(git.resolve(PIN_FIXTURE["head"]), PIN_FIXTURE["path"])

    def pin_case(name, text, expect, label=None):
        pins = [((label or PIN_FIXTURE["path"]), text)]
        reg, ev, res, overall, _ = run_full(git, PIN_FIXTURE["head"], None, None, None, None, pins=pins, pin_rev=PIN_FIXTURE["pin_rev"])
        got = res["pin_recompute"]["result"]
        ok = got == expect
        out.append({"case": name, "check": "pin_recompute", "expected": expect, "got": got, "ok": ok,
                    "registry_match": reg == ev,
                    "counts": {k: sum(1 for f in res["pin_recompute"]["findings"] if f["result"] == k) for k in ("pass", "violation", "unknown")}})
        if not ok:
            fails.append("synthetic %s: expected %s got %s" % (name, expect, got))

    if raw is None:
        out.append({"case": "pin_fixture", "ok": False, "got": "unknown", "reason": "pin fixtureを読めない"})
        fails.append("pin fixtureを読めない")
    else:
        doc = json.loads(raw)
        pin_case("pin_real_record_matches", raw, "pass")
        d1 = copy.deepcopy(doc)
        d1["six_body_pins"][1]["sha256"] = "0" * 64
        pin_case("pin_body_sha_altered", json.dumps(d1, ensure_ascii=False), "violation")
        d2 = copy.deepcopy(doc)
        d2["six_body_pins"][2]["bytes"] += 1
        pin_case("pin_body_bytes_altered", json.dumps(d2, ensure_ascii=False), "violation")
        d3 = copy.deepcopy(doc)
        d3["fixed_parent_source"][0]["span_sha256"] = "f" * 64
        pin_case("pin_span_sha_altered", json.dumps(d3, ensure_ascii=False), "violation")
        d4 = copy.deepcopy(doc)
        d4["review"]["formal_body_raw"] = d4["review"]["formal_body_raw"].replace("Major", "Majar", 1)
        pin_case("formal_body_raw_altered", json.dumps(d4, ensure_ascii=False), "violation")
        pin_case("pin_unparsable_json", "{not json", "unknown")
        pin_case("pin_without_any_pin", json.dumps({"note": "no pins"}), "unknown")
    # pin入力が無い → unknown（passにしない）
    reg, ev, res, overall, _ = run_full(git, PIN_FIXTURE["head"], None, None, None, None)
    for cid in ("pin_recompute", "count_ids", "fixed_quote", "return_vocab", "boundary_removed"):
        got = res[cid]["result"]
        ok = got == "unknown"
        out.append({"case": "missing_inputs_%s" % cid, "check": cid, "expected": "unknown", "got": got, "ok": ok})
        if not ok:
            fails.append("missing inputs %s: %s" % (cid, got))
    ok = overall == "unknown"
    out.append({"case": "missing_inputs_overall", "expected": "unknown", "got": overall, "ok": ok})
    if not ok:
        fails.append("missing inputs overall: %s" % overall)
    # 登録した検査の一部だけを評価 → 全体unknown（配線漏れを合格へ縮退させない）
    it = json.load(open(CORPUS, encoding="utf-8"))
    bad = [x for x in it if (x["pr"], x["major_id"]) == (2685, "M1")][0]
    reg, ev, res, overall, reason = run_full(git, bad["bad_head"], bad["base"], None, "helix-labo", "060", only={"count_ids"})
    ok = overall == "unknown" and len(reg) == 5 and len(ev) == 1
    out.append({"case": "registry_partial_evaluation", "expected": "overall unknown (registered 5, evaluated 1)",
                "got": "%s (registered %d, evaluated %d)" % (overall, len(reg), len(ev)), "reason": reason, "ok": ok})
    if not ok:
        fails.append("registry partial evaluation: %s" % overall)
    # receiptの出力先：scaffold/外・symlink経由・.json以外を拒否し、許可先だけへ書く（SCF-B-0157の書込境界）
    with tempfile.TemporaryDirectory() as tmp:
        rdir = os.path.join(tmp, "scaffold", "l3l10-checks", "receipts")
        os.makedirs(rdir)
        os.makedirs(os.path.join(tmp, "docs"))
        os.makedirs(os.path.join(tmp, "outside"))
        os.symlink(os.path.join(tmp, "outside"), os.path.join(rdir, "linkdir"))
        os.symlink(os.path.join(tmp, "docs", "x.json"), os.path.join(rdir, "link.json"))
        rejects = {
            "receipt_reject_outside_relative": "docs/x.json",
            "receipt_reject_outside_absolute": os.path.join(tmp, "outside", "x.json"),
            "receipt_reject_traversal": "scaffold/l3l10-checks/receipts/../../../docs/x.json",
            "receipt_reject_symlink_dir": "scaffold/l3l10-checks/receipts/linkdir/x.json",
            "receipt_reject_symlink_file": "scaffold/l3l10-checks/receipts/link.json",
            "receipt_reject_non_json": "scaffold/l3l10-checks/receipts/x.txt",
        }
        for case, path in rejects.items():
            real, why = C.resolve_receipt_path(tmp, path)
            ok = real is None
            out.append({"case": case, "expected": "rejected", "got": "rejected: %s" % why if real is None else real, "ok": ok})
            if not ok:
                fails.append("%s: accepted %s" % (case, real))
        rc = C.main(["--repo-root", tmp, "--receipt", "docs/x.json"])
        ok = rc == 2 and not os.path.exists(os.path.join(tmp, "docs", "x.json"))
        out.append({"case": "receipt_reject_main_exit2_no_write", "expected": "exit 2, no file", "got": "exit %s" % rc, "ok": ok})
        if not ok:
            fails.append("main receipt outside: exit %s" % rc)
        real, why = C.resolve_receipt_path(tmp, "scaffold/l3l10-checks/receipts/r.json")
        if real:
            C.write_receipt(real, "{}\n")
        ok = real is not None and os.path.isfile(real)
        out.append({"case": "receipt_accept_allowed", "expected": "written", "got": "written" if ok else "rejected: %s" % why, "ok": ok})
        if not ok:
            fails.append("receipt allowed path rejected: %s" % why)
    return out, fails


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo-root", default=ROOT)
    ap.add_argument("--record", action="store_true")
    args = ap.parse_args(argv)
    git = C.Git(args.repo_root)
    rows, f1 = corpus_cases(git)
    syn, f2 = synthetic_cases(git)
    tally = {
        "corpus_items": len(rows),
        "targeted": sum(1 for r in rows if r["status"] != "excluded"),
        "detected_violation": sum(1 for r in rows if r["status"] == "detected" and r["detection_mode"] == "violation"),
        "detected_advisory": sum(1 for r in rows if r["status"] == "detected" and r["detection_mode"] == "advisory"),
        "not_detected": sum(1 for r in rows if r["status"] == "not_detected"),
        "fixed_head_flagged_at_location": sum(1 for r in rows if r["status"] == "detected_but_fixed_head_also_flagged"),
        "excluded_difficult": sum(1 for r in rows if r["status"] == "excluded"),
        "partial_scope": [("%d %s" % (r["pr"], r["major_id"])) for r in rows if r.get("partial")],
        "synthetic_cases": len(syn), "synthetic_ok": sum(1 for s in syn if s.get("ok")),
    }
    for r in rows:
        if r["status"] == "excluded":
            print("excluded  #%d %s  %s" % (r["pr"], r["major_id"], r["types"]))
        else:
            print("%-9s #%d %s  %-16s bad=%s fixed=%s" % (r["status"][:9], r["pr"], r["major_id"], r["check"],
                  r["bad_head_result"].get("hit_lines"), r["fixed_head_result"].get("hits_at_location")))
    for s in syn:
        print("%-9s %s" % ("ok" if s.get("ok") else "FAIL", s["case"]))
    fails = f1 + f2
    print("tally: %s" % json.dumps(tally, ensure_ascii=False))
    print("selftest: %s" % ("ok" if not fails else "FAIL " + "; ".join(fails)))
    if args.record:
        rc = subprocess.run(["git", "-C", ROOT, "rev-parse", "HEAD"], capture_output=True, text=True)
        payload = {
            "record_type": "l3l10_checks_selftest",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "binding": "scaffold/bindings/SCF-B-0157.json",
            "note": "仮の検証の記録。正式なCI／検証／受入の成立を意味しない。検出器の回帰確認であり、L3／L10の承認・合格・merge admissionを生成しない",
            "source_commit": rc.stdout.strip(),
            "source_commit_note": "記録時のworktreeのHEAD。検査器自体の版はchecker_source_digests（各fileのSHA-256）で特定する",
            "recorded_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "checker_source_digests": C.source_digests(),
            "registered_checks": [c for c, _, _ in C.REGISTRY],
            "command": ["python3", "-B", "scaffold/l3l10-checks/selftest.py", "--record"],
            "result": "ok" if not fails else "fail",
            "failures": fails,
            "tally": tally,
            "corpus": rows,
            "synthetic": syn,
            "limits": [
                "fixed_headで同じ箇所に出ないことだけを確かめる。fixed_headの他の箇所に残る違反候補はviolations_elsewhere_same_checkに件数を記録した（既存の差分や検出器の誤検出を含みうる）",
                "pin_sha_mismatch型のMajorはコーパスに0件のため、pin再計算は実在pinとその改変写しの合成caseで確かめた",
                "#2680 M1（boundary_removed）は仕様によりadvisoryで検出する。violationとしては数えない",
            ],
        }
        os.makedirs(os.path.dirname(EVIDENCE), exist_ok=True)
        with open(EVIDENCE, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=1)
            f.write("\n")
        print("recorded: %s" % os.path.relpath(EVIDENCE, ROOT))
    return 0 if not fails else 1


if __name__ == "__main__":
    sys.exit(main())
