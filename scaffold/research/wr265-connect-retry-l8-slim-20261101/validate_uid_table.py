#!/usr/bin/env python3
"""WR265 L8 U-ID table static validator; read-only unless --record PATH is explicit."""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[3]
BASE = "b3ddf6f1d0a6cf2009e5f81a90f21c4292300185"
L8 = "docs/helix-connect/L8-unit-verification/retry-deduplication-conflict.json"
L5 = "docs/helix-connect/L5-detail-design/retry-deduplication-conflict.json"
L9 = "docs/helix-connect/L9-integration-verification/retry-deduplication-conflict.json"
HISTORY = "scaffold/research/wr265-connect-retry-l8-slim-20261101/evidence-history.json"


def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def expected_summary(case, expected):
    if "F01" in case["id"]:
        stops = expected.get("failure_reasons", [])
        reason = "; ".join(
            f"{x['area']}.{x['field']}={x['result']}→{x['return_owner']}" for x in stops
        ) if stops else "追加停止理由なし"
        return (f"{reason}；candidate_retry_receipt={expected.get('candidate_retry_receipt')}"
                f"；receiver_effect={expected.get('receiver_effect_result', expected.get('raw_effect_set_result'))}")
    if "F02" in case["id"]:
        stops = expected.get("failure_reasons", [])
        reason = "; ".join(
            f"{x['area']}.{x['field']}={x['result']}→{x['return_owner']}" for x in stops
        ) if stops else "追加停止理由なし"
        return (f"digest_relation={expected.get('digest_relation')}；action={expected.get('candidate_conflict_action')}"
                f"；effect_increment={expected.get('effect_increment_result')}；{reason}")
    stops = expected.get("stop_reasons", [])
    reason = "; ".join(
        f"{x['area']}.{x['field']}={x['result']}→{x['return_owner']}" for x in stops
    ) if stops else "停止理由なし"
    return (f"next_action={expected.get('candidate_next_action')}"
            f"；additional_attempts={expected.get('candidate_additional_attempts')}"
            f"；budget={expected.get('budget_result')}；{reason}")


def check():
    doc, l5, l9, history = load(L8), load(L5), load(L9), load(HISTORY)
    errors = []
    old_bytes = subprocess.check_output(["git", "show", f"{BASE}:{L8}"], cwd=ROOT)
    old = json.loads(old_bytes)
    old_ids = [c["id"] for c in old["cases"]]
    ids = [c.get("id") for c in doc.get("cases", [])]
    if ids != old_ids:
        errors.append("case ID/order differs from fixed pre-edit source")
    if len(ids) != 69:
        errors.append(f"case count is {len(ids)}, expected 69")
    expected_by_id = {c["id"]: c for ob in l9["verification_obligations"] for c in ob["concrete_cases"]}
    if set(ids) != set(expected_by_id):
        errors.append("L8 and L9 case ID sets differ")
    if set(doc.get("removed_materials", {})) != {"decision_ref", "git_commit", "path", "meaning", "removed_key_rule", "use_boundary"}:
        errors.append("removed_materials must contain exactly the six required keys")
    if "DT-VT-105" not in doc.get("removed_materials", {}).get("use_boundary", ""):
        errors.append("removed_materials does not name DT-VT-105")
    forbidden = {"source_packet_ref", "typed_arguments", "raw_utf8", "expected_return", "sha256", "hash_map", "COPY", "mutation_steps"}
    def walk(value, trail=""):
        if isinstance(value, dict):
            for k, v in value.items():
                if k in forbidden:
                    errors.append(f"forbidden material key at {trail}/{k}")
                walk(v, f"{trail}/{k}")
        elif isinstance(value, list):
            for i, v in enumerate(value):
                walk(v, f"{trail}/{i}")
    walk(doc)
    owner_tables = l5["branch_tables"]
    matched = 0
    for row in doc["cases"]:
        src = expected_by_id.get(row["id"])
        if src is None:
            continue
        if row.get("counterexample") != src.get("basis"):
            errors.append(f"{row['id']}: counterexample differs from fixed L9 basis")
        if row.get("expected") != expected_summary(src, src["expected_material"]):
            errors.append(f"{row['id']}: expected semantics differ from fixed L9 outcome summary")
        if row.get("oracle_id") != src.get("system_oracle_ref"):
            errors.append(f"{row['id']}: oracle identity differs")
        if row.get("expected_oracle_ref", {}).get("document") != L9:
            errors.append(f"{row['id']}: expected oracle document differs")
        ob_index = next(i for i,o in enumerate(l9['verification_obligations']) if any(c['id']==row['id'] for c in o['concrete_cases']))
        case_index = next(i for i,c in enumerate(l9['verification_obligations'][ob_index]['concrete_cases']) if c['id']==row['id'])
        if row.get("expected_oracle_ref", {}).get("pointer") != f"/verification_obligations/{ob_index}/concrete_cases/{case_index}/expected_material":
            errors.append(f"{row['id']}: oracle pointer does not resolve to its L9 expected_material")
        fn = row["id"].split("-")[1]
        fnid = {"F01":"FN-C004-01", "F02":"FN-C004-02", "F03":"FN-C004-03"}.get(fn)
        if not fnid or fnid not in l5.get("calculation_programs", {}):
            errors.append(f"{row['id']}: no matching existing L5 calculation program")
        else:
            matched += 1
        # Check that each listed failure area/owner exists in the existing L5 branch contract.
        exp = src["expected_material"]
        reasons = exp.get("failure_reasons", exp.get("stop_reasons", []))
        branches = owner_tables.get(fn, {})
        owner_by_area = branches.get("owner_by_area", {})
        for failure in reasons:
            area = failure.get("area", "")
            owner = owner_by_area.get(area)
            if fn == "F03" and area.startswith("history_target_"):
                owner = owner_by_area.get("history_target")
            if fn == "F03" and area == "retryable_result":
                # Existing L5 rule 8 makes owner conditional: business_nonretryable
                # belongs to business-owner; other/unknown result states to operation-owner.
                owner = "business-owner" if failure.get("result") == "business_nonretryable" else "operation-owner"
            if owner != failure.get("return_owner"):
                errors.append(f"{row['id']}: L5 owner mapping mismatch for {failure.get('area')}")
    source_revision = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    current_bytes = (ROOT / L8).read_bytes()
    report = {
        "schema":"wr265-static-verification.v1", "evidence_kind":"scaffold", "authority_effect":"none",
        "record_id":"WR265-RETRY-L8-CURRENT-STATIC-R1",
        "target":L8, "target_revision":source_revision, "target_sha256":hashlib.sha256(current_bytes).hexdigest(),
        "source_pins": {path: hashlib.sha256((ROOT / path).read_bytes()).hexdigest() for path in (L5,L9)},
        "historical_source":history["historical_source"],
        "before_after":{"before_bytes":len(old_bytes),"after_bytes":len(current_bytes),"reduction_bytes":len(old_bytes)-len(current_bytes),"case_count_before":len(old_ids),"case_count_after":len(ids)},
        "checks":{"case_identity_order":"evaluated","case_oracle_and_expected":"evaluated","L5_function_and_owner_links":"evaluated","removed_materials_and_forbidden_material":"evaluated"},
        "rows_checked":matched, "result":"FAIL" if errors else "PASS_STATIC_ONLY",
        "errors":errors,
        "not_evaluated":["L5 algorithm execution","product test","real receiver effect","approval or formal L8 completion","design_verification_checker child semantics"],
        "interpretation":"PASS_STATIC_ONLY is a static structure/source comparison only. It is not execution, approval, formal verification, or completion."
    }
    return report


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--record", metavar="NEW_PATH", help="write one new report path with O_EXCL; default is read-only")
    args=ap.parse_args()
    report=check()
    if args.record:
        path=Path(args.record)
        if not path.is_absolute(): path=ROOT/path
        path.parent.mkdir(parents=True,exist_ok=True)
        fd=os.open(path, os.O_WRONLY|os.O_CREAT|os.O_EXCL, 0o644)
        with os.fdopen(fd,"w",encoding="utf-8") as f:
            json.dump(report,f,ensure_ascii=False,indent=2); f.write("\n")
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if report["result"]=="PASS_STATIC_ONLY" else 1

if __name__=="__main__":
    raise SystemExit(main())
