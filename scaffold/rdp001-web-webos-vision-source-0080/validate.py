#!/usr/bin/env python3
"""Validate the bounded Web/Web-OS Vision source relation research Scaffold."""
from __future__ import annotations
import hashlib, json, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BASE = "ea771fb2c496d40fcc429877b0fcd8cff6999526"
VISION = "archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md"
WEB = "docs/helix-web/L2-requirements/product-requirements.md"
WEBOS = "docs/helix-web-os/L2-requirements/service-governance-requirements.md"
CATALOG = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"

SPAN_KEYS = {"span_id","group","label","source_path","line_start","line_end","exact_source_text","sha256","semantic_status","connection_status","meaning_change_applied","authority_effect"}
REL_KEYS = {"relation_id","product","current_requirement_id","current_source_path","current_source_sha256","current_line_start","current_line_end","current_exact_source_text","current_span_sha256","vision_span_ids","old_vision_connection_status","relation_status","semantic_equivalence","formal_requirement_unit","owner","authority","implementation_status","degradation_status","failure_status","consumer_status","decision_status","meaning_change_applied"}
ASSET_KEYS = {"asset_id","source_path","source_revision","source_sha256","source_bytes","source_snapshot","catalog_evidence","disposition_evidence","decision_evidence","failure_evidence","read_after_evidence","consumer_evidence","semantic_connection","implementation_boundary"}
CAT_KEYS = {"candidate_phase_targets","candidate_product_targets","phase_classification_status","product_classification_status","implementation_evidence_state","legacy_implementation_status","consumer_closure_status","consumer_refs","legacy_execution_performed","unresolved"}
DISP_KEYS = {"asset_class","reuse_exclusion_class","product_target","authority_status","disposition","implementation_status","decision_record_ref","consumer_refs","source_sha256","rights_status","executability_status","external_effect_status"}
DEC_KEYS = {"status","record_count","records"}
READ_KEYS = {"status","record_count","records"}
FAIL_KEYS = {"status","asset_ids_checked","failure_paths_checked","failure_result"}
CONS_KEYS = {"catalog_consumer_refs","disposition_consumer_refs","decision_consumer_refs","closure_status","closure_result"}
SEM_KEYS = {"status","basis","direct_old_vision_requirement_link","direct_current_l2_requirement_link","pool_membership_is_not_requirement_link"}
IMPL_KEYS = {"legacy_implementation_status","current_implementation_status","legacy_degradation_status","current_degradation_status","formal_authority","meaning_change_applied"}
INV_KEYS = {"schema","candidate_id","status","authority_effect","meaning_change_applied","formal_requirement_unit_count","successor_requirement_ids","human_decision_ref","formal_register_append","old_runtime_test_ci_execution","scope","four_products","source_spans","current_source_relations","legacy_evidence","findings","unresolved_questions","prohibited_inference","verification_contract","residuals","created","updated"}
SCOPE_KEYS = {"worktree","base_origin_main","read_only","static_only","source_capture","old_archive_reference_only","old_archive_execution","vision_source_path","vision_source_sha256","vision_source_bytes","vision_source_line_count","vision_selected_unique_line_count","vision_unreviewed_line_count","vision_span_record_count","current_web_l2_path","current_web_l2_sha256","current_webos_l2_path","current_webos_l2_sha256","web_l2_count","webos_l2_count","selected_legacy_asset_count","legacy_catalog_record_count","legacy_catalog_unreviewed_count","selected_legacy_asset_scope","unreviewed_vision_lines","unreviewed_asset_denominator"}
PRODUCT_KEYS = {"product","boundary_status","owner_status","authority_status","implementation_status","degradation_status"}
GROUP_KEYS = {"path","record_count","sha256","required_groups"}
REL_GROUP_KEYS = {"path","record_count","sha256","web_record_count","webos_record_count","all_relation_status"}
ASSET_GROUP_KEYS = {"path","record_count","sha256","catalog_path","disposition_path","decision_path","failure_search_status","consumer_search_status","read_after_path","read_after_search_status"}
CONTRACT_KEYS = {"required_commands","negative_cases","archive_rule"}
RESIDUAL_KEYS = {"formal_requirement_unit","owner_authority","semantic_equivalence","legacy_failure","legacy_consumer_closure","legacy_current_implementation","legacy_degradation"}

SPAN_EXPECTED = [
 ("VISION-SEC-3","section",74,115,"§3 PackageとRelease Pack"),("VISION-SEC-4","section",120,138,"§4 成長軸と並行事業"),
 ("VISION-SEC-6.1","section",237,256,"§6.1 Web操作面とConnector"),("VISION-SEC-6.2","section",258,264,"§6.2 認証・provider・MCP"),("VISION-SEC-6.3","section",266,282,"§6.3 HDA"),
 ("VISION-SEC-7","section",287,313,"§7 利用者保守・改修"),("VISION-SEC-8","section",318,331,"§8 FACTORY"),("VISION-SEC-12","section",434,445,"§12 実行順序"),
 *[(f"VISION-U{i:02d}","user",535+(i-6),535+(i-6),f"U{i:02d}") for i in range(7,20)],
 *[(f"VISION-O{i:02d}","open",478+(i-3),478+(i-3),f"O{i:02d}") for i in range(3,11)],
]
ASSET_EXPECTED = {
 "LEGACY-ASSET-DD53551C74BB4939A325":"docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md",
 "LEGACY-ASSET-A297D67A1D8AD6EE6D6B":"docs/archive/intake/2026-09-06-concept-vision/current/HELIX_DEVELOPMENT_PACKAGE_CATALOG_v0.6.md",
 "LEGACY-ASSET-0C5F0695490FA5D87419":"docs/archive/intake/2026-09-06-concept-vision/current/HELIX_RELEASE_AND_VERSION_CATALOG_v0.6.md",
 "LEGACY-ASSET-2D2143A74E0A8E0C0BAB":"docs/archive/intake/2026-09-06-concept-vision/evidence/HELIX_EXISTING_HIERARCHY_AND_TRANSITIONS_v0.1.md",
 "LEGACY-ASSET-C3DE79BA9451172F3E43":"docs/design/helix/L5-detail/product-data-connector.md",
 "LEGACY-ASSET-DD66C1B6B7BE234B37E6":"docs/design/helix/L6-function-design/product-data-connector.md",
 "LEGACY-ASSET-54330A68064B58B22259":"docs/design/helix/L13-post-deploy/post-deploy-evidence-boundary.md",
 "LEGACY-ASSET-1251704E0BE627232E00":"docs/design/harness/L13-post-deploy/post-deploy-evidence-boundary.md",
 "LEGACY-ASSET-2EEAD7B812217BEB0D80":"docs/plans/PLAN-L7-102-web-dashboard-phase-b.md",
 "LEGACY-ASSET-189702B332643A3BFDAF":"docs/plans/PLAN-L13-00-post-deploy-verification-master.md",
 "LEGACY-ASSET-A2F6A697D7FFFD490B57":"docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md",
 "LEGACY-ASSET-320E6F0B93975C430B1D":"docs/plans/PLAN-L3-68-release-module-bundle-composition.md",
}
WEB_IDS = [f"HELIXWEB-L2-{i:03d}" for i in range(1,10)]
WEBOS_IDS = [f"HELIXWEBOS-L2-{i:03d}" for i in range(1,7)]
WEB_REFS = [
 ["VISION-SEC-6.1","VISION-U08","VISION-U09"],["VISION-SEC-3","VISION-SEC-6.1","VISION-O04"],["VISION-SEC-6.2","VISION-O04"],["VISION-SEC-6.2","VISION-O03","VISION-O04"],["VISION-SEC-7","VISION-U17","VISION-O05"],["VISION-SEC-6.3","VISION-U14","VISION-O08"],["VISION-SEC-3","VISION-O04"],["VISION-SEC-4","VISION-U10","VISION-O07"],["VISION-SEC-12","VISION-U07","VISION-U11"]]
WEBOS_REFS = [
 ["VISION-SEC-6.1","VISION-SEC-7","VISION-O03"],["VISION-SEC-3","VISION-U09","VISION-O04"],["VISION-SEC-6.2","VISION-O04"],["VISION-SEC-6.2","VISION-O03","VISION-O06"],["VISION-SEC-6.1","VISION-SEC-7","VISION-U08","VISION-U17"],["VISION-SEC-8","VISION-SEC-12","VISION-U10","VISION-O09"]]

def fail(code, detail=""):
    raise AssertionError(code + ((":" + detail) if detail else ""))
def sha(b): return hashlib.sha256(b).hexdigest()
def git_show(path):
    r=subprocess.run(["git","show",f"HEAD:{path}"],cwd=ROOT,capture_output=True)
    if r.returncode: fail("E_GIT_SOURCE",path)
    return r.stdout
def read_json(path):
    try:return json.loads(path.read_text(encoding="utf-8"))
    except Exception as e: fail("E_JSON",f"{path}:{e}")
def jsonl(path):
    out=[]
    for n,line in enumerate(path.read_text(encoding="utf-8").splitlines(),1):
        if line.strip():
            try:out.append(json.loads(line))
            except Exception as e:fail("E_JSONL",f"{path}:{n}:{e}")
    return out
def keys(o,expected,code):
    if not isinstance(o,dict) or set(o)!=set(expected): fail(code,','.join(sorted(set(o) ^ set(expected))) if isinstance(o,dict) else "not-object")
def lines(b): return b.decode("utf-8").splitlines(keepends=True)
def assert_sha_file(rel,expected,code):
    p=ROOT/rel
    if not p.is_file() or sha(p.read_bytes())!=expected: fail(code,rel)

def validate(inv,spans,rels,assets):
    keys(inv,INV_KEYS,"E_INV_KEYS")
    if inv["schema"]!="rdp001-web-webos-vision-source/v1" or inv["candidate_id"]!="RDP-001-WEB-WEBOS-VISION-SOURCE-0080":fail("E_IDENTITY")
    if inv["status"]!="findings_only" or inv["authority_effect"]!="none" or inv["meaning_change_applied"] or inv["formal_requirement_unit_count"]!="not_generated":fail("E_BOUNDARY")
    if inv["successor_requirement_ids"] or inv["human_decision_ref"] is not None or inv["formal_register_append"] or inv["old_runtime_test_ci_execution"]:fail("E_PROMOTION")
    s=inv["scope"]; keys(s,SCOPE_KEYS,"E_SCOPE_KEYS")
    if s["base_origin_main"]!=BASE or subprocess.run(["git","rev-parse","HEAD"],cwd=ROOT,text=True,capture_output=True).stdout.strip()!=BASE:fail("E_BASE")
    if not s["read_only"] or not s["static_only"] or s["old_archive_execution"]:fail("E_SCOPE_BOUNDARY")
    vb=git_show(VISION); wb=git_show(WEB); ob=git_show(WEBOS)
    if s["vision_source_path"]!=VISION or s["vision_source_sha256"]!=sha(vb) or s["vision_source_bytes"]!=len(vb) or s["vision_source_line_count"]!=583 or s["vision_selected_unique_line_count"]!=179 or s["vision_unreviewed_line_count"]!=404:fail("E_VISION_SOURCE")
    if s["current_web_l2_path"]!=WEB or s["current_web_l2_sha256"]!=sha(wb) or s["current_webos_l2_path"]!=WEBOS or s["current_webos_l2_sha256"]!=sha(ob):fail("E_CURRENT_SOURCE")
    if s["vision_span_record_count"]!=29 or s["web_l2_count"]!=9 or s["webos_l2_count"]!=6 or s["selected_legacy_asset_count"]!=12 or s["legacy_catalog_record_count"]!=4020 or s["legacy_catalog_unreviewed_count"]!=4008:fail("E_COUNTS")
    if len(inv["four_products"])!=4:fail("E_PRODUCTS_COUNT")
    for p in inv["four_products"]:
        keys(p,PRODUCT_KEYS,"E_PRODUCT_KEYS")
        if p["product"] not in {"HELIX-HARNESS","HELIX-OS","HELIX-Web","HELIX-Web-OS"} or p["boundary_status"]!="candidate_boundary_only" or p["owner_status"]!="unknown" or p["authority_status"]!="none" or p["implementation_status"]!="unknown" or p["degradation_status"]!="unknown":fail("E_PRODUCT_BOUNDARY")
    g=inv["source_spans"]; keys(g,GROUP_KEYS,"E_SPAN_GROUP_KEYS")
    if g["record_count"]!=29 or g["path"]!="scaffold/rdp001-web-webos-vision-source-0080/vision-spans.jsonl":fail("E_SPAN_GROUP")
    spath=HERE/'vision-spans.jsonl'
    if g["sha256"]!=sha(spath.read_bytes()):fail("E_SPAN_FILE_DIGEST")
    if len(spans)!=29 or [x.get("span_id") for x in spans]!=[x[0] for x in SPAN_EXPECTED]:fail("E_SPANS_ORDER")
    vl=lines(vb)
    for r,(sid,group,start,end,label) in zip(spans,SPAN_EXPECTED):
        keys(r,SPAN_KEYS,"E_SPAN_KEYS")
        if (r["span_id"],r["group"],r["line_start"],r["line_end"],r["label"])!=(sid,group,start,end,label):fail("E_SPAN_META",sid)
        if r["source_path"]!=VISION or r["semantic_status"]!="historical_source_only" or r["connection_status"]!="candidate_only" or r["meaning_change_applied"] or r["authority_effect"]!="none":fail("E_SPAN_BOUNDARY",sid)
        exact=''.join(vl[start-1:end])
        if r["exact_source_text"]!=exact or r["sha256"]!=sha(exact.encode()):fail("E_SPAN_TEXT",sid)
    cr=inv["current_source_relations"]; keys(cr,REL_GROUP_KEYS,"E_REL_GROUP_KEYS")
    if cr["record_count"]!=15 or cr["path"]!="scaffold/rdp001-web-webos-vision-source-0080/source-relations.jsonl" or cr["sha256"]!=sha((HERE/'source-relations.jsonl').read_bytes()):fail("E_REL_GROUP")
    if len(rels)!=15 or [r.get("current_requirement_id") for r in rels]!=WEB_IDS+WEBOS_IDS:fail("E_REL_ORDER")
    span_ids={r["span_id"] for r in spans}; wl=lines(wb); ol=lines(ob)
    for idx,r in enumerate(rels):
        keys(r,REL_KEYS,"E_REL_KEYS")
        isweb=idx<9; rid=(WEB_IDS+WEBOS_IDS)[idx]; expected_product="HELIX-Web" if isweb else "HELIX-Web-OS"; expected_path=WEB if isweb else WEBOS; raw=wb if isweb else ob; raw_lines=wl if isweb else ol; expected_refs=WEB_REFS[idx] if isweb else WEBOS_REFS[idx-9]
        if r["current_requirement_id"]!=rid or r["product"]!=expected_product or r["current_source_path"]!=expected_path or r["current_source_sha256"]!=sha(raw) or r["vision_span_ids"]!=expected_refs or any(x not in span_ids for x in r["vision_span_ids"]):fail("E_REL_META",rid)
        ln=r["current_line_start"]
        if r["current_line_end"]!=ln or ln<1 or ln>len(raw_lines) or r["current_exact_source_text"]!=''.join(raw_lines[ln-1:ln]) or r["current_span_sha256"]!=sha(r["current_exact_source_text"].encode()):fail("E_REL_TEXT",rid)
        if r["old_vision_connection_status"]!=("document_declared_candidate" if isweb else "candidate_semantic_connection_only") or r["relation_status"]!="candidate_only" or r["semantic_equivalence"]!="unknown" or r["formal_requirement_unit"]!="not_generated" or r["owner"]!="not_generated" or r["authority"]!="none" or r["meaning_change_applied"]:fail("E_REL_BOUNDARY",rid)
        if any(r[x]!="unknown" for x in ("implementation_status","degradation_status","failure_status","consumer_status","decision_status")):fail("E_REL_UNKNOWN",rid)
    le=inv["legacy_evidence"]; keys(le,ASSET_GROUP_KEYS,"E_ASSET_GROUP_KEYS")
    if le["record_count"]!=12 or le["path"]!="scaffold/rdp001-web-webos-vision-source-0080/legacy-evidence.jsonl" or le["sha256"]!=sha((HERE/'legacy-evidence.jsonl').read_bytes()):fail("E_ASSET_GROUP")
    if len(assets)!=12 or [x.get("asset_id") for x in assets]!=list(ASSET_EXPECTED):fail("E_ASSET_ORDER")
    cat={x["asset_id"]:x for x in jsonl_bytes(CATALOG)}; disp={x["asset_id"]:x for x in jsonl_bytes(DISPOSITION)}; dec=jsonl_bytes(DECISIONS)
    for a in assets:
        keys(a,ASSET_KEYS,"E_ASSET_KEYS"); aid=a["asset_id"]
        if aid not in ASSET_EXPECTED or a["source_path"]!=ASSET_EXPECTED[aid]:fail("E_ASSET_ID",aid)
        c=cat.get(aid); d=disp.get(aid)
        if not c or not d:fail("E_ASSET_LEDGER_MISSING",aid)
        raw=git_show("archive/legacy-generation-2026-09-14/root/"+a["source_path"]); snap=HERE/a["source_snapshot"]
        if not snap.is_file() or snap.read_bytes()!=raw or a["source_bytes"]!=len(raw) or a["source_sha256"]!=sha(raw) or a["source_sha256"]!=c["source_sha256"] or a["source_sha256"]!=d["source_sha256"]:fail("E_ASSET_SOURCE",aid)
        keys(a["catalog_evidence"],CAT_KEYS,"E_CAT_KEYS"); ce=a["catalog_evidence"]
        for k in CAT_KEYS:
            if ce[k]!=c[k]:fail("E_CAT_FIELD",aid+":"+k)
        keys(a["disposition_evidence"],DISP_KEYS,"E_DISP_KEYS"); de=a["disposition_evidence"]
        for k in DISP_KEYS:
            if de[k]!=d[k]:fail("E_DISP_FIELD",aid+":"+k)
        keys(a["decision_evidence"],DEC_KEYS,"E_DEC_KEYS"); match=[x for x in dec if x.get("asset_id")==aid]
        if a["decision_evidence"]!={"status":"no_matching_decision_record","record_count":0,"records":[]} or match:fail("E_DECISION_EVIDENCE",aid)
        keys(a["failure_evidence"],FAIL_KEYS,"E_FAIL_KEYS")
        if a["failure_evidence"]["status"]!="no_dedicated_asset_failure_record_found" or a["failure_evidence"]["asset_ids_checked"]!=[aid] or a["failure_evidence"]["failure_result"]!="unknown":fail("E_FAILURE_BOUNDARY",aid)
        keys(a["read_after_evidence"],READ_KEYS,"E_READ_AFTER_KEYS")
        if a["read_after_evidence"]!={"status":"no_matching_read_after_record","record_count":0,"records":[]}:fail("E_READ_AFTER_EVIDENCE",aid)
        keys(a["consumer_evidence"],CONS_KEYS,"E_CONS_KEYS"); co=a["consumer_evidence"]
        if co["catalog_consumer_refs"]!=c["consumer_refs"] or co["disposition_consumer_refs"]!=d["consumer_refs"] or co["decision_consumer_refs"]!=[] or co["closure_status"]!=c["consumer_closure_status"] or co["closure_result"]!="pending":fail("E_CONSUMER",aid)
        keys(a["semantic_connection"],SEM_KEYS,"E_SEM_KEYS"); se=a["semantic_connection"]
        if se!={"status":"candidate_only","basis":"path_and_static_catalog_classification_only","direct_old_vision_requirement_link":"unknown","direct_current_l2_requirement_link":"unknown","pool_membership_is_not_requirement_link":True}:fail("E_SEM_BOUNDARY",aid)
        keys(a["implementation_boundary"],IMPL_KEYS,"E_IMPL_KEYS"); ib=a["implementation_boundary"]
        if any(ib[x]!="unknown" for x in ("legacy_implementation_status","current_implementation_status","legacy_degradation_status","current_degradation_status")) or ib["formal_authority"]!="none" or ib["meaning_change_applied"]:fail("E_IMPL_BOUNDARY",aid)
    for name,items in (("findings",inv["findings"]),("unresolved_questions",inv["unresolved_questions"]),("prohibited_inference",inv["prohibited_inference"])):
        if not isinstance(items,list) or not items:fail("E_INV_RECORDS",name)
        for x in items:
            keys(x,{"id","status","text"} if name!='prohibited_inference' else {"id","text"},"E_INV_RECORD_KEYS")
            if not x.get("text"):fail("E_INV_RECORD_TEXT",name)
    keys(inv["verification_contract"],CONTRACT_KEYS,"E_CONTRACT_KEYS")
    if not inv["verification_contract"]["required_commands"] or not inv["verification_contract"]["negative_cases"]:fail("E_CONTRACT")
    keys(inv["residuals"],RESIDUAL_KEYS,"E_RESIDUAL_KEYS")
    if any(x!="pending" for x in inv["residuals"].values()):fail("E_RESIDUAL_PROMOTION")
    for p in ("source-snapshots/current-web-l2.md","source-snapshots/current-webos-l2.md"):
        expected=wb if p.endswith('web-l2.md') else ob
        if (HERE/p).read_bytes()!=expected:fail("E_CURRENT_SNAPSHOT",p)

def jsonl_bytes(rel):
    raw=git_show(rel)
    return [json.loads(x) for x in raw.decode().splitlines() if x.strip()]

def main():
    inv=read_json(HERE/'inventory.json'); spans=jsonl(HERE/'vision-spans.jsonl'); rels=jsonl(HERE/'source-relations.jsonl'); assets=jsonl(HERE/'legacy-evidence.jsonl')
    validate(inv,spans,rels,assets)
    print('PASS validate: Web/Web-OS Vision source Scaffold 29 spans + 9/6 relations + 12 legacy assets')
if __name__=='__main__':
    try: main()
    except AssertionError as e: print(f'FAIL {e}',file=sys.stderr); sys.exit(1)
