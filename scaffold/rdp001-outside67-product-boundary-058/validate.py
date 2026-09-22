#!/usr/bin/env python3
import argparse, hashlib, json, subprocess, sys
from pathlib import Path

FOUR = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
IDS = ["OUTSIDE67-PATH-059", "OUTSIDE67-PATH-063", "OUTSIDE67-PATH-064", "OUTSIDE67-PATH-065", "OUTSIDE67-PATH-066"]
PR_EXCLUDED = {"OUTSIDE67-PATH-001", "OUTSIDE67-PATH-008", "OUTSIDE67-PATH-010", "OUTSIDE67-PATH-011"}
EXPECTED_PRE = "2d4991042be55268bac30a8bbcdac45b3865030a"
EXPECTED_ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
EXPECTED_BASE = "294bfd90bf58390798733a1437f1c91b8dc7fce8"
HOLDING_REL = "docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl"
REGISTER_REL = "docs/governance/management-provisional-requirement-register.jsonl"
LEDGER_RELS = [
    "docs/governance/legacy-asset-disposition.jsonl",
    "docs/governance/legacy-asset-decisions.jsonl",
    "docs/governance/legacy-asset-copy-read-after.jsonl",
    "docs/governance/legacy-asset-decision-log.md",
    "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
    "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl",
    "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl",
]

INVENTORY_KEYS={
    'schema','candidate_id','status','authority_effect','meaning_change_applied','successor_requirement_ids','human_decision_ref','formal_register_append','old_runtime_test_ci_execution','scope','source_holding','selection','classification_basis','four_products','documents','product_unit_count','product_unit_ids','unknown_counts','source_diffs','evidence_scan','prohibited_inference','findings','unresolved_questions','verification_scope'
}
UNIT_KEYS={
    'authority_effect','candidate_kind','candidate_product','consumer_status','current_degradation_status','current_implementation_status','decision_status','degradation_status','diff_observation','failure_status','implementation_status','inference_status','legacy_degradation_status','legacy_implementation_status','meaning_change_applied','normalized_statement','phase_candidate','phase_status','product_candidates','product_status','retained_meaning','selection_reason','semantic_fields','source_anchor','source_fragment','source_item_id','source_path','source_support','successor_requirement_ids','unit_id','unresolved_questions'
}
ANCHOR_KEYS={'commit','line','line_sha256','source_fragment'}
SEMANTIC_KEYS={'action','actor','condition','guard','sequence'}
FIXED_UNIT_FIELD_KEYS={
    'normalized_statement': {'status','text','source_ref'},
    'retained_meaning': {'status','items','source_ref'},
    'unresolved_questions': {'status','items','scope'},
    'diff_observation': {'status','text','source_ref'},
}
FIXED_CATALOG_KEYS={'findings': {'id','status','text'}, 'unresolved_questions': {'id','status','text'}, 'prohibited_inference': {'id','status','text'}}
FIXED_CATALOG_COUNTS={'findings':7,'unresolved_questions':7,'prohibited_inference':7}
FIXED_CATALOG_STATUS={'findings':'observed','unresolved_questions':'open','prohibited_inference':'prohibited'}
FIXED_CATALOG_PREFIX={'findings':'F','unresolved_questions':'Q','prohibited_inference':'P'}


def digest_bytes(data):
    return hashlib.sha256(data).hexdigest()


def digest(path):
    return digest_bytes(path.read_bytes()) if path.is_file() else None


def git_blob(root, commit, path):
    return subprocess.check_output(["git", "-C", str(root), "show", f"{commit}:{path}"])


def load_json(path, errors, code):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"{code}:{exc}")
        return None


def load_jsonl(path, errors, code):
    rows = []
    try:
        for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            try:
                rows.append(json.loads(line))
            except Exception as exc:
                errors.append(f"{code}:{line_no}:{exc}")
    except Exception as exc:
        errors.append(f"{code}:{exc}")
    return rows


def add_catalog_errors(inv, errors):
    for field, expected_keys in FIXED_CATALOG_KEYS.items():
        records=inv.get(field)
        if not isinstance(records,list) or len(records)!=FIXED_CATALOG_COUNTS[field]:
            errors.append(f'E_INVENTORY_FIXED:{field}:count'); continue
        prefix=FIXED_CATALOG_PREFIX[field]; status=FIXED_CATALOG_STATUS[field]
        for i,record in enumerate(records,1):
            if not isinstance(record,dict) or set(record)!=expected_keys:
                errors.append(f'E_INVENTORY_FIXED:{field}:keys'); continue
            if record.get('id')!=f'{prefix}{i:03d}' or record.get('status')!=status or not isinstance(record.get('text'),str) or not record['text'].strip():
                errors.append(f'E_INVENTORY_FIXED:{field}:value')

def add_unit_field_errors(u, errors):
    uid=u.get('unit_id','<missing>')
    if set(u)!=UNIT_KEYS:
        errors.append(f'E_UNIT_KEYS:{uid}')
    if set(u.get('semantic_fields',{}))!=SEMANTIC_KEYS:
        errors.append(f'E_UNIT_SEMANTIC_KEYS:{uid}')
    for field, expected_keys in FIXED_UNIT_FIELD_KEYS.items():
        value=u.get(field)
        if not isinstance(value,dict) or set(value)!=expected_keys:
            errors.append(f'E_UNIT_FIXED_FIELD:{uid}:{field}'); continue
        if field=='normalized_statement':
            if value.get('status')!='source_supported_exact_fragment' or value.get('source_ref')!='source_fragment' or value.get('text')!=u.get('source_fragment'):
                errors.append(f'E_UNIT_FIXED_FIELD:{uid}:normalized_statement_value')
        elif field=='retained_meaning':
            if value.get('status')!='preserved_source_meaning' or value.get('source_ref')!='source_fragment' or value.get('items')!=[u.get('source_fragment')]:
                errors.append(f'E_UNIT_FIXED_FIELD:{uid}:retained_meaning_value')
        elif field=='unresolved_questions':
            if value.get('status')!='open_unknowns' or value.get('scope')!='unit' or value.get('items')!=['phase_authority','implementation','degradation','failure','consumer','decision','owner']:
                errors.append(f'E_UNIT_FIXED_FIELD:{uid}:unresolved_questions_value')
        elif field=='diff_observation':
            if value.get('status')!='unresolved' or value.get('source_ref')!='source-diffs.json' or not isinstance(value.get('text'),str) or not value['text'].strip():
                errors.append(f'E_UNIT_FIXED_FIELD:{uid}:diff_observation_value')
    if u.get('source_fragment')!=u.get('source_anchor',{}).get('pre_isolation',{}).get('source_fragment'):
        errors.append(f'E_UNIT_FRAGMENT_MIRROR:{uid}')
    for side in ('pre_isolation','archive'):
        anchor=u.get('source_anchor',{}).get(side,{})
        if set(anchor)!=ANCHOR_KEYS:
            errors.append(f'E_UNIT_ANCHOR_KEYS:{uid}:{side}')


def validate(root):
    root = Path(root).resolve()
    out = root / "scaffold/rdp001-outside67-product-boundary-058"
    errors = []
    inv = load_json(out / "inventory.json", errors, "E_INVENTORY_JSON")
    if not isinstance(inv, dict):
        return errors
    if set(inv)!=INVENTORY_KEYS: errors.append("E_INVENTORY_KEYS")
    if inv.get("schema") != "rdp001-outside67-product-boundary/v1": errors.append("E_SCHEMA")
    if inv.get("candidate_id") != "RDP-001-OUTSIDE67-PRODUCT-BOUNDARY-0058": errors.append("E_CANDIDATE")
    if inv.get("authority_effect") != "none" or inv.get("status") != "findings_only": errors.append("E_AUTHORITY")
    if inv.get("old_runtime_test_ci_execution") is not False: errors.append("E_EXECUTION")
    add_catalog_errors(inv, errors)
    sc = inv.get("scope", {})
    if sc.get("base_origin_main") != EXPECTED_BASE: errors.append("E_BASE")
    head=subprocess.check_output(["git","-C",str(root),"rev-parse","HEAD"],text=True).strip()
    ancestor=subprocess.run(["git","-C",str(root),"merge-base","--is-ancestor",sc.get("base_origin_main",""),head],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    if ancestor.returncode != 0: errors.append("E_BASE_NOT_ANCESTOR")
    if not sc.get("base_drift_observed") or sc.get("base_drift_from") != "b0b233f2712f69abebc18e698b8661d34bc5a804": errors.append("E_BASE_DRIFT")
    if sc.get("holding_path_revision_pair_denominator") != 67 or sc.get("holding_record_count") != 67: errors.append("E_DENOMINATOR")
    if sc.get("remaining_before_batch") != 65 or sc.get("selected_path_revision_pair_count") != 5 or sc.get("remaining_after_batch") != 60: errors.append("E_ACCOUNTING")
    if sc.get("batch_width_observed") != 5 or "上限" not in sc.get("batch_width_policy", ""): errors.append("E_BATCH_POLICY")
    hold_path = root / HOLDING_REL
    reg_path = root / REGISTER_REL
    if sc.get("holding_sha256") != digest(hold_path): errors.append("E_HOLDING_DIGEST")
    if sc.get("management_register_sha256") != digest(reg_path): errors.append("E_REGISTER_DIGEST")
    hold_rows = load_jsonl(hold_path, errors, "E_HOLDING_JSONL")
    by_id = {r.get("source_item_id"): r for r in hold_rows}
    if len(hold_rows) != 67: errors.append("E_HOLDING_COUNT")
    if any(i not in by_id for i in IDS): errors.append("E_HOLDING_SELECTION")
    if set(inv.get("source_holding", {}).get("selected_item_ids", [])) != set(IDS): errors.append("E_INVENTORY_SELECTION")
    if inv.get("source_holding", {}).get("unselected_count_after_batch") != 60: errors.append("E_REMAINING")
    if set(sc.get("previous_reviewed_ids", [])) != {"OUTSIDE67-PATH-008", "OUTSIDE67-PATH-011"}: errors.append("E_PREVIOUS_SELECTION")
    if set(sc.get("pr_2007_excluded_ids", [])) != PR_EXCLUDED: errors.append("E_PR2007_EXCLUSION")
    items = load_jsonl(out / "selected-source-items.jsonl", errors, "E_ITEMS_JSONL")
    if len(items) != 5 or [r.get("source_item_id") for r in items] != IDS: errors.append("E_ITEMS_COUNT")
    item_ids = set()
    for item in items:
        sid = item.get("source_item_id"); item_ids.add(sid)
        if sid not in by_id: errors.append(f"E_ITEM_HOLDING:{sid}"); continue
        h = by_id[sid]; scp = h.get("reported_path_scope", {})
        if item.get("source_path") != h.get("source_path"): errors.append(f"E_ITEM_PATH:{sid}")
        if item.get("candidate_product") != scp.get("product_scope") or item.get("candidate_phase") != scp.get("phase_scope"): errors.append(f"E_ITEM_SCOPE:{sid}")
        if item.get("reported_holding", {}).get("legacy_catalog_record_count") != 0 or item.get("reported_holding", {}).get("human_decision_ref") is not None: errors.append(f"E_ITEM_CATALOG:{sid}")
        if item.get("status", {}).get("authority_effect") != "none" or item.get("status", {}).get("meaning_change_applied") is not False: errors.append(f"E_ITEM_STATUS:{sid}")
        if sid in PR_EXCLUDED: errors.append(f"E_OVERLAP:{sid}")
        for key in ("implementation_status", "degradation_status", "failure_status", "consumer_status", "decision_status", "legacy_implementation_status", "current_implementation_status", "legacy_degradation_status", "current_degradation_status"):
            if item.get("status", {}).get(key) != "unknown": errors.append(f"E_UNKNOWN:{sid}:{key}")
        for rev, commit, key in (("pre_isolation", EXPECTED_PRE, "pre_isolation"), ("archive_revision", EXPECTED_ARCHIVE, "archive")):
            got = item.get(rev, {})
            want = h.get(key, {})
            if got.get("commit") != commit or got.get("blob_oid") != want.get("blob_oid") or got.get("sha256") != want.get("sha256") or got.get("bytes") != want.get("bytes"): errors.append(f"E_ITEM_REVISION:{sid}:{rev}")
    if item_ids != set(IDS): errors.append("E_ITEM_IDS")
    diffs = load_json(out / "source-diffs.json", errors, "E_DIFF_JSON") or {}
    if diffs.get("pre_isolation_commit") != EXPECTED_PRE or diffs.get("archive_commit") != EXPECTED_ARCHIVE: errors.append("E_DIFF_COMMITS")
    diff_by = {x.get("source_item_id"): x for x in diffs.get("items", [])}
    if set(diff_by) != set(IDS): errors.append("E_DIFF_ITEMS")
    for sid in IDS:
        h = by_id.get(sid, {}); p = h.get("source_path", "")
        if sid not in diff_by: continue
        d = diff_by[sid]; a = git_blob(root, EXPECTED_PRE, p); b = git_blob(root, EXPECTED_ARCHIVE, p)
        expected = "".join(difflib_unified(a, b))
        if d.get("pre_sha256") != digest_bytes(a) or d.get("archive_sha256") != digest_bytes(b) or d.get("hunk_count") != expected.count("@@"): errors.append(f"E_DIFF_PROVENANCE:{sid}")
        if d.get("status") != ("same" if a == b else "different") or d.get("unified_diff") != expected: errors.append(f"E_DIFF_TEXT:{sid}")
        for rev, filename, commit, key in (("pre_isolation", "pre-isolation.md", EXPECTED_PRE, "pre_isolation"), ("archive_revision", "archive-revision.md", EXPECTED_ARCHIVE, "archive")):
            snap = out / "source-snapshots" / sid / filename
            raw = snap.read_bytes() if snap.is_file() else b""
            obj = git_blob(root, commit, p)
            if raw != obj or digest_bytes(raw) != h.get(key, {}).get("sha256"): errors.append(f"E_SNAPSHOT:{sid}:{rev}")
    for doc in inv.get("documents",[]):
        for key in ("implementation_status","current_implementation_status","legacy_implementation_status","degradation_status","current_degradation_status","legacy_degradation_status","failure_status","consumer_status","decision_status"):
            if doc.get("status",{}).get(key) != "unknown": errors.append(f"E_DOC_UNKNOWN:{doc.get('source_item_id')}:{key}")
    units = load_jsonl(out / "product-units.jsonl", errors, "E_UNITS_JSONL")
    if len(units) != 26: errors.append("E_UNIT_COUNT")
    unit_ids = set(); anchors = set()
    for u in units:
        add_unit_field_errors(u, errors)
        uid = u.get("unit_id"); unit_ids.add(uid); sid = u.get("source_item_id"); pa = u.get("source_anchor", {}).get("pre_isolation", {}); aa = u.get("source_anchor", {}).get("archive", {})
        if sid not in IDS or uid in (None, ""): errors.append(f"E_UNIT_ID:{uid}")
        if u.get("product_candidates") != FOUR: errors.append(f"E_FOUR_PRODUCT:{uid}")
        if u.get("source_support") != "exact_line_anchor_only" or u.get("inference_status") != "none": errors.append(f"E_UNIT_SUPPORT:{uid}")
        for key in ("implementation_status", "current_implementation_status", "legacy_implementation_status", "degradation_status", "current_degradation_status", "legacy_degradation_status", "failure_status", "consumer_status", "decision_status", "phase_status", "product_status"):
            if u.get(key) not in ("unknown", "unknown_path_based_candidate_only"): errors.append(f"E_UNIT_UNKNOWN:{uid}:{key}")
        if any(v != "unresolved" for v in (u.get("semantic_fields") or {}).values()): errors.append(f"E_UNIT_SEMANTIC_INFERENCE:{uid}")
        for anchor, filename in ((pa, "pre-isolation.md"), (aa, "archive-revision.md")):
            snap = out / "source-snapshots" / sid / filename; lines = snap.read_text(encoding="utf-8").splitlines() if snap.is_file() else []
            line = anchor.get("line", 0); frag = anchor.get("source_fragment", "")
            if line < 1 or line > len(lines) or lines[line-1] != frag or digest_bytes(frag.encode()) != anchor.get("line_sha256"): errors.append(f"E_UNIT_ANCHOR:{uid}:{filename}")
        k=(sid,pa.get("line"));
        if k in anchors: errors.append(f"E_UNIT_LINE_DUP:{uid}")
        anchors.add(k)
    if len(unit_ids) != len(units): errors.append("E_UNIT_ID_DUP")
    if set(inv.get("product_unit_ids", [])) != unit_ids or inv.get("product_unit_count") != 26: errors.append("E_UNIT_INVENTORY")
    if inv.get("four_products") != [{"product": p, "status": "candidate_boundary_only", "authority_effect": "none"} for p in FOUR]: errors.append("E_INVENTORY_PRODUCTS")
    escan = load_json(out / "evidence-scan.json", errors, "E_SCAN_JSON") or {}
    if set(escan.get("selected_ids", [])) != set(IDS): errors.append("E_SCAN_IDS")
    for fp in LEDGER_RELS:
        f = root / fp
        if not f.is_file() or escan.get("files", {}).get(fp, {}).get("sha256") != digest(f): errors.append(f"E_SCAN_FILE:{fp}")
    if inv.get("unknown_counts") != {"implementation":5,"degradation":5,"failure":5,"consumer":5,"decision":5,"phase":5,"semantic_inclusion":5,"legacy_implementation":5,"current_implementation":5,"legacy_degradation":5,"current_degradation":5}: errors.append("E_UNKNOWN_COUNTS")
    return errors


def difflib_unified(a, b):
    import difflib
    return difflib.unified_diff(a.decode().splitlines(True), b.decode().splitlines(True), fromfile="pre-isolation", tofile="archive-revision", n=3)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--root", default=None); args = ap.parse_args(); root = Path(args.root).resolve() if args.root else Path(__file__).resolve().parents[2]
    errors = validate(root)
    if errors:
        print("FAIL outside67 product-boundary validator")
        print("\n".join(errors))
        return 1
    print("PASS outside67 product-boundary validator: 5 documents / 26 exact source units / 67 denominator / static-only")
    return 0

if __name__ == "__main__": sys.exit(main())
