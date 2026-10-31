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
L4 = "docs/helix-connect/L4-basic-design/retry-deduplication-conflict.json"
L10 = "docs/helix-connect/L10-verification/functional-verification.json"
HISTORY = "scaffold/research/wr265-connect-retry-l8-slim-20261101/evidence-history.json"


def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def counterexample(case_id, source_case):
    # Build row-specific meaning from the fixed L9 basis, oracle witnesses, and
    # true semantic claim names. No case-ID suffix is treated as evidence.
    basis = source_case.get("basis", "")
    expected = source_case["expected_material"]
    raw = json.loads(source_case["independent_source_packet"]["raw_utf8"])
    markers = [name for name, value in raw.get("claims", {}).items() if value is True]
    fn = case_id.split("-")[1]
    if fn == "F01":
        reasons = expected.get("failure_reasons", [])
        witness = "; ".join(f"{x['area']}.{x['field']}={x['result']}" for x in reasons)
        if not witness:
            witness = f"candidate_retry_receipt={expected.get('candidate_retry_receipt')}; receiver_effect={expected.get('receiver_effect_result', expected.get('raw_effect_set_result'))}"
    elif fn == "F02":
        reasons = expected.get("failure_reasons", [])
        witness = "; ".join(f"{x['area']}.{x['field']}={x['result']}" for x in reasons) if reasons else "additional_failure=none"
        witness = f"digest_relation={expected.get('digest_relation')}; action={expected.get('candidate_conflict_action')}; effect_increment={expected.get('effect_increment_result')}; {witness}"
    else:
        reasons = expected.get("stop_reasons", [])
        witness = "; ".join(f"{x['area']}.{x['field']}={x['result']}" for x in reasons)
        if not witness:
            witness = f"candidate_next_action={expected.get('candidate_next_action')}; additional_attempts={expected.get('candidate_additional_attempts')}; result_state={expected.get('retained_result_state')}"
        witness = f"budget={expected.get('budget_result')}; {witness}"
    marker_text = f"; L9 scenario markers={','.join(markers)}" if markers else ""
    return f"{basis} L9 condition/outcome witness: {witness}{marker_text}."


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
    doc, l4, l5, l9, l10, history = load(L8), load(L4), load(L5), load(L9), load(L10), load(HISTORY)
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
    owner_note = doc.get("F03_retryable_result_owner_resolution", "")
    l5_rules = l5.get("branch_tables", {}).get("F03", {}).get("failure_rules", [])
    if len(l5_rules) <= 8 or l5_rules[8].get("owner_ref") != "business_nonretryableならbusiness-owner、それ以外の未知状態ならoperation-ownerへ返す。":
        errors.append("L5 F03 conditional retryable-result owner rule changed")
    l4_contracts = {item.get("id"): item for item in l4.get("contracts", [])}
    l4_f03 = l4_contracts.get("HELIXCONNECT-L4-004-F03", {})
    l10_f03 = next((item for item in l10.get("cases", []) if item.get("id") == "HELIXCONNECT-L10-004-F03"), {})
    if not all(term in owner_note for term in ("business-owner", "operation-owner", "L5", "L9", "L4", "L10")):
        errors.append("L8 does not state the F03 conditional owner resolution and source boundaries")
    if l4_f03.get("output_meanings") != ["停止地点/元累積/局所理由と返し先", "原policy/履歴/未完と追加attempt候補"]:
        errors.append("L4 F03 owner-output boundary differs from recorded owner resolution")
    if l10_f03.get("failure_observation") != "operation owner/SEC/contract ownerの該当境界へ返す。":
        errors.append("L10 F03 owner observation differs from recorded owner resolution")
    forbidden = {"source_packet_ref", "typed_arguments", "raw_utf8", "expected_return", "sha256", "hash_map", "COPY", "mutation_steps", "l5_function_ref", "l9_basic_branches"}
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
        if row.get("counterexample") != counterexample(row["id"], src):
            errors.append(f"{row['id']}: counterexample differs from fixed L9 source/outcome witness")
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
        "source_pins": {path: hashlib.sha256((ROOT / path).read_bytes()).hexdigest() for path in (L4,L5,L9,L10)},
        "historical_source":history["historical_source"],
        "before_after":{"before_bytes":len(old_bytes),"after_bytes":len(current_bytes),"reduction_bytes":len(old_bytes)-len(current_bytes),"case_count_before":len(old_ids),"case_count_after":len(ids)},
        "checks":{"case_identity_order":"evaluated","case_oracle_and_expected":"evaluated","L5_function_and_owner_links":"evaluated","removed_materials_and_forbidden_material":"evaluated"},
        "rows_checked":matched, "result":"FAIL" if errors else "PASS_STATIC_ONLY",
        "errors":errors,
        "not_evaluated":["L5 algorithm execution","product test","real receiver effect","approval or formal L8 completion","design_verification_checker child semantics"],
        "interpretation":"PASS_STATIC_ONLY is a static structure/source comparison only. It is not execution, approval, formal verification, or completion."
    }
    commands = [
        ("scfctl_validate", [sys.executable, "-B", "scaffold/tools/scfctl.py", "validate"]),
        ("scfctl_stale", [sys.executable, "-B", "scaffold/tools/scfctl.py", "stale"]),
        ("design_verification_checker_check_child", [sys.executable, "-B", "scaffold/tools/design_verification_checker.py", "check-child", "--root", ".", "--l4", "docs/helix-connect/L4-basic-design/retry-deduplication-conflict.json", "--l9", L9, "--l5", L5, "--l8", L8]),
    ]
    overlay = {"revision": source_revision, "checks": {}}
    for name, command in commands:
        result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
        entry = {"command": " ".join(command), "exit_code": result.returncode}
        if name == "scfctl_validate":
            entry["summary"] = result.stdout.strip().splitlines()[-1] if result.stdout.strip() else result.stderr.strip()
        elif name == "scfctl_stale":
            entry["summary"] = result.stdout.strip() or result.stderr.strip()
        else:
            parsed = json.loads(result.stdout)
            entry["overall_passed"] = parsed.get("passed")
            entry["L4_L9_pair"] = {"status": parsed["L4_L9_pair"].get("status"), "not_evaluated_reason": parsed["L4_L9_pair"].get("not_evaluated_reason")}
            entry["L5_L8_pair"] = {"status": parsed["L5_L8_pair"].get("status"), "not_evaluated_reason": parsed["L5_L8_pair"].get("not_evaluated_reason")}
            entry["negative_4way"] = {"status": parsed["negative_4way"].get("status"), "not_evaluated_reason": parsed["negative_4way"].get("not_evaluated_reason"), "counts": parsed["negative_4way"].get("counts"), "matched_case_count": parsed["negative_4way"].get("matched_case_count")}
            entry["ownership_caps"] = [{"check": item.get("check"), "layer": item.get("layer"), "passed": item.get("passed"), "failure_count": len(item.get("failures", []))} for item in parsed.get("ownership_caps", [])]
            entry["pins"] = [{"file": item.get("file"), "status": item.get("status"), "passed": item.get("passed"), "not_evaluated_reason": item.get("not_evaluated_reason")} for item in parsed.get("pins", []) if item.get("file") in (L5, L8)]
        overlay["checks"][name] = entry
    report["latest_main_overlay"] = overlay
    return report


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--record", metavar="NEW_PATH", help="write one new report path with O_EXCL; default is read-only")
    ap.add_argument("--record-id", default="WR265-RETRY-L8-CURRENT-STATIC-R1", help="unique ID for the explicitly recorded summary")
    args=ap.parse_args()
    report=check()
    report["record_id"] = args.record_id
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
