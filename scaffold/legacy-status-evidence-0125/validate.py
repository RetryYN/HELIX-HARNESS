#!/usr/bin/env python3
"""Independent fail-closed validator for SCF-B-0125."""
from __future__ import annotations
import argparse, hashlib, json, os, subprocess, sys
from pathlib import Path

# The generator is not imported: the validator re-reads fixed BASE objects and rebuilds expected records.
ROOT = Path(__file__).resolve().parents[2]
BASE_REVISION = "bab1ca011a407112920aad1e6bfcfe5e79bc8122"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
CROSSWALK = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
FAILURE_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
WAVE_PATHS = {n:(f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl" if n<=36 else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl") for n in range(1,51)}
GLOBAL_INPUTS = [DISPOSITION,CROSSWALK,DECOMPOSITION,DECISIONS,READ_AFTER,PHASE,FAILURE_SOURCE,CONSUMER_SOURCE,"docs/governance/legacy-asset-decision-log.md","docs/governance/legacy-asset-reuse-control.md","docs/governance/legacy-requirement-carry-forward-policy.md","docs/governance/legacy-ir-document-source-relation.jsonl","docs/governance/new-generation-start-here.md","archive/legacy-generation-2026-09-14/MANIFEST.sha256","docs/concept/product-boundary.md","docs/helix-harness/L1-planning/product-intent.md","docs/helix-os/L1-planning/system-intent.md","docs/helix-web/L1-planning/product-intent.md","docs/helix-web-os/L1-planning/system-intent.md"]
SELECTED_IDS = ["LEGACY-ASSET-FC00E18B0184CD15033E","LEGACY-ASSET-14C0516250418981B156","LEGACY-ASSET-21039705931BB982EE0E","LEGACY-ASSET-961D6EFEE6F94569D113","LEGACY-ASSET-BDFA744FAF7312826672","LEGACY-ASSET-EEEAD0B3DFB1D12AC571","LEGACY-ASSET-61BA713A6C7588D8AA85","LEGACY-ASSET-7ED36EDFF34D5A6F2A41","LEGACY-ASSET-86214CFBCCC55483170C","LEGACY-ASSET-046F2B43CDD5A827CC95","LEGACY-ASSET-5094F36916F00C37F385","LEGACY-ASSET-61D85EE372040EBCB68B","LEGACY-ASSET-0C8803AA14C9967096DF"]
CLAIM_RULES = {SELECTED_IDS[0]:("old_implementation",r"IMP-104|implemented|unimplemented|validate-only|delegat|drive"),SELECTED_IDS[1]:("old_implementation",r"IMP-107|implemented|unimplemented|placeholder_deps|doctor rule"),SELECTED_IDS[2]:("old_implementation",r"IMP-110|implemented|unimplemented|DB rebuild|migration"),SELECTED_IDS[3]:("old_implementation",r"BR-07|BR-12|NFR-03|green|unimplemented|implementation"),SELECTED_IDS[4]:("degradation",r"HOT-P6|HOT-P8|partial|not-implemented|GAP"),SELECTED_IDS[5]:("old_failure",r"U-IHIER-021|failed|failure|unimplemented|mutation"),SELECTED_IDS[6]:("old_failure",r"CI failure|failure|consumer|stub|read-after|exit"),SELECTED_IDS[7]:("old_failure",r"runtime receipt|implementation verified|unimplemented|assertion|0/"),SELECTED_IDS[8]:("consumer",r"consumer|acceptance|failure|U-LORET|closure"),SELECTED_IDS[9]:("consumer",r"consumer|role|precondition|closure|ledger"),SELECTED_IDS[10]:("consumer",r"consumer|role|precondition|closure|revision"),SELECTED_IDS[11]:("consumer",r"consumer|role|precondition|hidden|validator"),SELECTED_IDS[12]:("failure",r"selected_it_ids|partial|passed|exit_code|exit_criteria")}
TOP_LEVEL_KEYS={"acceptance_evidence","asset_id","asset_role","authority_effect","counter_evidence","current_implementation","degradation_evidence","failure_evidence","history_evidence","unimplemented_evidence","legacy_implementation_evidence","legacy_status","ledger_record","product_phase_candidates","requirement_binding","source_exact","unit_binding","consumer_evidence","status_claims","unresolved"}
INVENTORY_TOP_LEVEL_KEYS={"anchor_rule","authority_boundary","base_revision","base_source_mode","binding_id","bundle_kind","expected_asset_count","input_digests","negative_case_codes","output_sha256","schema_revision","scope","search_boundaries","selection"}
EXPECTED_BUNDLE_KIND="research_scaffold_legacy_status_evidence_partition"
EXPECTED_ANCHOR_METHOD="claim-specific regex; first 16 matching source lines; exact decoded line digest"
EXPECTED_NEGATIVE_BOUNDARY="asset-level status statement/receipt, candidate relation, source/config role, and plan history do not establish unit implementation, degradation, unimplementation, failure, consumer closure, current implementation, or acceptance"
NEGATIVE_CASE_CODES=["E_SCHEMA","E_BASE_PIN","E_BASE_NOT_ANCESTOR","E_INPUT_SET","E_INPUT_DIGEST","E_OUTPUT_DIGEST","E_SCOPE","E_SELECTION","E_LEDGER_RECORD","E_SOURCE_EVIDENCE","E_CLAIM_ANCHOR","E_UNIT_BINDING","E_REQUIREMENT_BINDING","E_IMPLEMENTATION_EVIDENCE","E_DEGRADATION_EVIDENCE","E_FAILURE_EVIDENCE","E_CONSUMER_EVIDENCE","E_CURRENT_STATUS","E_ACCEPTANCE_EVIDENCE","E_AUTHORITY_BOUNDARY","E_ASSET_SET"]
def fail(c,m): raise AssertionError(f"{c}: {m}")
def tagged(d): return "sha256:"+hashlib.sha256(d).hexdigest()
def git_bytes(p):
 try:return subprocess.check_output(["git","show",f"{BASE_REVISION}:{p}"],cwd=ROOT)
 except subprocess.CalledProcessError as e: fail("E_BASE_SOURCE",f"missing fixed-base object {p}: {e}")
def git_blob(p):
 try:return subprocess.check_output(["git","rev-parse",f"{BASE_REVISION}:{p}"],cwd=ROOT,text=True).strip()
 except subprocess.CalledProcessError as e: fail("E_BASE_SOURCE",f"missing fixed-base blob {p}: {e}")
def base_rows(p): return [(n,json.loads(x)) for n,x in enumerate(git_bytes(p).decode().splitlines(),1) if x.strip()]
def rows(p): return [r for _,r in base_rows(p)]
def selected_rows():
 by={r["asset_id"]:r for r in rows(DISPOSITION)}
 if set(SELECTED_IDS)-set(by): fail("E_SELECTION","selected asset missing from fixed BASE ledger")
 return [by[x] for x in SELECTED_IDS]
def input_paths(): return [*WAVE_PATHS.values(),*GLOBAL_INPUTS,*[ARCHIVE_PREFIX+r["source_path"] for r in selected_rows()]]
def crosswalk_relations(ids):
 from collections import defaultdict
 pool,rep,direct=defaultdict(list),defaultdict(list),defaultdict(list)
 for n,r in base_rows(CROSSWALK):
  for aid in r.get("candidate_asset_pool",{}).get("phase_and_product_candidate_asset_ids",[]):
   if aid in ids: pool[aid].append({"line":n,"unit_candidate_id":r.get("unit_candidate_id")})
  for field,dest in (("representative_legacy_assets",rep),("direct_legacy_asset_links",direct)):
   for item in r.get(field,[]):
    aid=item if isinstance(item,str) else item.get("asset_id")
    if aid in ids: dest[aid].append({"line":n,"unit_candidate_id":r.get("unit_candidate_id"),"record":item})
 return pool,rep,direct
def wave_relations(ids):
 from collections import defaultdict
 out=defaultdict(list)
 for n,p in WAVE_PATHS.items():
  for line,r in base_rows(p):
   if r.get("asset_id") in ids: out[r["asset_id"]].append({"wave":n,"path":p,"line":line,"record":r})
 return out
def source_claims(aid,data):
 text=data.decode(errors="replace"); lines=text.splitlines(); kind,pat=CLAIM_RULES[aid]; rx=__import__('re').compile(pat,__import__('re').I)
 hit=[n for n,l in enumerate(lines,1) if rx.search(l)][:16]
 if not hit: hit=[n for n,l in enumerate(lines,1) if l.strip()][:1] or [1]
 refs=[{"line":n,"line_text_sha256":tagged(lines[n-1].encode()),"line_preview":lines[n-1][:280]} for n in hit]
 times=[]
 for l in lines:
  m=__import__('re').search(r"\b20\d{2}-\d\d-\d\d(?:T[^ ,、]+)?",l)
  if m: times.append(m.group(0))
 return {"claim_dimension":kind,"claim_pattern":pat,"scope":"asset_level_historical_or_observed_statement","observed_at":times[0] if times else None,"source_refs":refs,"unit_ids":[],"requirement_ids":[],"interpretation":"候補asset本文の主張／観測を保存するが、unitの実装・縮退・failure・consumer closureを証明しない"}
def source_exact(ledger):
 p=ARCHIVE_PREFIX+ledger["source_path"]; data=git_bytes(p)
 if tagged(data)!="sha256:"+ledger["source_sha256"]: fail("E_SOURCE_EVIDENCE",f"ledger/source digest mismatch {ledger['asset_id']}")
 return {"archive_path":p,"blob":git_blob(p),"bytes":len(data),"line_count":len(data.decode(errors='replace').splitlines()),"sha256":tagged(data),"ledger_source_sha256":"sha256:"+ledger["source_sha256"],"target_path":None,"target_blob":None,"target_bytes":None,"target_sha256":None,"ledger_target_sha256":None,"read_mode":"fixed_base_git_object_static_read_only","claims":source_claims(ledger["asset_id"],data)}
def expected_record(ledger,phase,decisions,read_after,pool,rep,direct,wave):
 aid=ledger["asset_id"]; exact=source_exact(ledger); claim=exact["claims"]; kind=claim["claim_dimension"]; refs=claim["source_refs"]; status={"old_implementation":[],"old_unimplemented":[],"degradation":[],"failure":[],"consumer":[]}; status[kind]=refs
 return {"acceptance_evidence":{"status":"unknown","verdict":None,"evidence_refs":[],"scope":"unit_acceptance_absent","reason":"asset-level source/receipt contains no directly bound current acceptance verdict"},"asset_id":aid,"asset_role":"historical_status_candidate_static_only","authority_effect":"none","counter_evidence":[{"kind":"no_direct_unit_binding","wave_edge_count":len(wave[aid]),"direct_crosswalk_count":len(direct[aid]),"representative_crosswalk_count":len(rep[aid]),"reason":"candidate pool or asset statement is not a direct unit implementation binding"},{"kind":"ledger_status","implementation_status":ledger.get("implementation_status"),"disposition":ledger.get("disposition"),"reason":"fixed-base ledger status remains unknown/unresolved"}],"current_implementation":{"status":"unknown","evidence_refs":[],"scope":"current_unit_absent","reason":"selected legacy asset has no directly linked current implementation evidence"},"degradation_evidence":{"status":"unknown","asset_claim_status":"asset_level_claim" if kind=="degradation" else "none","evidence_refs":refs if kind=="degradation" else [],"unit_status":"unknown","reason":"partial/degraded wording is retained as asset-level historical claim; no unit receipt"},"failure_evidence":{"status":"unknown","asset_claim_status":"asset_level_claim" if kind=="old_failure" or aid==SELECTED_IDS[-1] else "none","evidence_refs":refs if kind=="old_failure" or aid==SELECTED_IDS[-1] else [],"unit_status":"unknown","reason":"failure marker/receipt is static asset evidence; no direct unit failure verdict"},"history_evidence":{"phase_record":phase.get(aid),"decision_records":decisions.get(aid,[]),"read_after_records":read_after.get(aid,[]),"consumer_refs":ledger.get("consumer_refs",[]),"interpretation":"history is preserved as source/history evidence and does not establish implementation or acceptance"},"unimplemented_evidence":{"status":"unknown","asset_claim_status":"asset_level_claim" if kind=="old_implementation" else "none","evidence_refs":refs if kind=="old_implementation" else [],"unit_status":"unknown","reason":"historical unimplemented wording is not sufficient to classify the requirement unit"},"legacy_implementation_evidence":{"status":"unknown","asset_claim_status":"asset_level_claim" if kind=="old_implementation" else "none","evidence_refs":refs if kind=="old_implementation" else [],"unit_status":"unknown","reason":"plan/source claim may describe a historical transition; implementation existence is not proven without direct unit binding and acceptance"},"legacy_status":{"old_implementation":"unknown","old_unimplemented":"unknown","old_degradation":"unknown","old_failure":"unknown","consumer_closure":"pending","current_implementation":"unknown","acceptance":"unknown","unknown_reasons":["asset-level claim or receipt only","no direct unit/requirement acceptance binding","old runtime/test/CI not executed"]},"ledger_record":ledger,"product_phase_candidates":{"candidate_product_targets":(phase.get(aid) or {}).get("candidate_product_targets",[]),"candidate_phase_targets":(phase.get(aid) or {}).get("candidate_phase_targets",[]),"phase_classification_status":(phase.get(aid) or {}).get("phase_classification_status"),"product_classification_status":(phase.get(aid) or {}).get("product_classification_status"),"interpretation":"candidate product/phase only; no authority or successor assignment"},"requirement_binding":{"status":"candidate_source_relation_only" if pool[aid] or wave[aid] else "absent","candidate_pool_rows":pool[aid],"wave_edge_refs":wave[aid],"direct_refs":direct[aid],"requirement_ids":sorted({x["record"].get("source_requirement_id") for x in wave[aid] if x["record"].get("source_requirement_id")}),"reason":"relation search is preserved separately from direct implementation/acceptance binding"},"source_exact":exact,"unit_binding":{"status":"absent","unit_candidate_ids":[],"candidate_pool_unit_ids":sorted({x["unit_candidate_id"] for x in pool[aid]}),"candidate_pool_rows":pool[aid],"wave_edge_refs":wave[aid],"direct_crosswalk_refs":direct[aid],"representative_refs":rep[aid],"semantics":"search candidate only; not a direct unit link"},"consumer_evidence":{"status":"asset_level_definition_only" if kind=="consumer" else "unknown","closure_status":"pending","asset_refs":refs if kind=="consumer" else [],"unit_status":"unknown","ledger_consumer_refs":ledger.get("consumer_refs",[]),"decision_count":len(decisions.get(aid,[])),"read_after_count":len(read_after.get(aid,[])),"reason":"consumer role/ledger/config is retained as asset-level evidence; closure receipt and unit binding are absent"},"status_claims":status,"unresolved":["unit implementation status unknown","unit unimplemented status unknown","unit degradation/failure status unknown","consumer closure pending","current implementation and acceptance unknown","direct requirement-to-unit binding absent"]}
def local_json(p):
 try:return json.loads(p.read_text())
 except Exception as e: fail("E_SCHEMA",f"cannot read {p}: {e}")
def local_jsonl(p):
 try:return [json.loads(x) for x in p.read_text().splitlines() if x.strip()]
 except Exception as e: fail("E_SCHEMA",f"cannot read {p}: {e}")
def validate(bundle):
 head=os.environ.get("SCF_VALIDATION_HEAD","HEAD")
 if subprocess.run(["git","merge-base","--is-ancestor",BASE_REVISION,head],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode: fail("E_BASE_NOT_ANCESTOR",f"fixed BASE is not ancestor of {head}")
 inv=local_json(bundle/"inventory.json"); ep=bundle/"evidence.jsonl"; selected=selected_rows(); ids=set(SELECTED_IDS)
 if set(inv)!=INVENTORY_TOP_LEVEL_KEYS: fail("E_SCHEMA","inventory top-level key set drift")
 if inv.get("schema_revision")!=1 or inv.get("binding_id")!="SCF-B-0125": fail("E_SCHEMA","schema or binding mismatch")
 if inv.get("bundle_kind")!=EXPECTED_BUNDLE_KIND: fail("E_SCHEMA","inventory bundle_kind drift")
 if inv.get("base_revision")!=BASE_REVISION or inv.get("base_source_mode")!="all input and selected legacy evidence bytes from fixed BASE Git objects": fail("E_BASE_PIN","BASE pin drift")
 expected_auth={"authority_effect":"none","formal_implementation_claim_updated":False,"formal_degradation_claim_updated":False,"formal_unimplemented_claim_updated":False,"formal_current_implementation_claim_updated":False,"acceptance_verdict_created":False,"new_build_allowed":False,"status_rule":"unknown_when_direct_unit_evidence_is_missing"}
 if inv.get("authority_boundary")!=expected_auth: fail("E_AUTHORITY_BOUNDARY","authority boundary drift")
 paths=input_paths(); got=inv.get("input_digests")
 if not isinstance(got,list) or [x.get("path") for x in got]!=paths: fail("E_INPUT_SET","input path set drift")
 for x,p in zip(got,paths):
  data=git_bytes(p); want={"path":p,"blob":git_blob(p),"bytes":len(data),"sha256":tagged(data)}
  if x!=want: fail("E_INPUT_DIGEST",f"input digest drift {p}")
 if not ep.exists() or inv.get("output_sha256")!=tagged(ep.read_bytes()): fail("E_OUTPUT_DIGEST","output digest mismatch")
 decomp=rows(DECOMPOSITION); allwaves=[r for p in WAVE_PATHS.values() for r in rows(p)]; expected_scope={"product_units":sum(len(r.get("candidate_units",[])) for r in decomp),"source_ids":len(decomp),"wave_files":50,"wave_edges":len(allwaves),"wave_unique_assets":len({r.get("asset_id") for r in allwaves}),"legacy_asset_ledger_rows":len(rows(DISPOSITION)),"selected_assets":13}
 pool,rep,direct=crosswalk_relations(ids); wave=wave_relations(ids); expected_scope.update({"selected_wave_edges":sum(len(wave[a]) for a in ids),"selected_candidate_pool_rows":sum(len(pool[a]) for a in ids),"selected_representative_links":sum(len(rep[a]) for a in ids),"selected_direct_links":sum(len(direct[a]) for a in ids)})
 scope=inv.get("scope")
 if scope!=expected_scope or expected_scope!={"product_units":218,"source_ids":153,"wave_files":50,"wave_edges":598,"wave_unique_assets":355,"legacy_asset_ledger_rows":4020,"selected_assets":13,"selected_wave_edges":1,"selected_candidate_pool_rows":281,"selected_representative_links":0,"selected_direct_links":0}: fail("E_SCOPE",f"scope mismatch {scope} expected {expected_scope}")
 expected_anchor_rule={"method":EXPECTED_ANCHOR_METHOD,"claim_rules":{k:v[1] for k,v in CLAIM_RULES.items()}}
 if inv.get("anchor_rule")!=expected_anchor_rule: fail("E_CLAIM_ANCHOR","inventory anchor_rule drift")
 expected_search_boundaries={"all_product_units":218,"all_source_ids":153,"all_wave_edges":598,"all_wave_unique_assets":355,"all_ledger_rows":4020,"crosswalk_fields":["candidate_asset_pool.phase_and_product_candidate_asset_ids","representative_legacy_assets","direct_legacy_asset_links"],"history_fields":[DECISIONS,READ_AFTER,PHASE],"failure_consumer_sources":[FAILURE_SOURCE,CONSUMER_SOURCE],"negative_boundary":EXPECTED_NEGATIVE_BOUNDARY}
 if inv.get("search_boundaries")!=expected_search_boundaries: fail("E_SCOPE","inventory search_boundaries drift")
 selection={"source":DISPOSITION,"source_row_order":"explicit fixed-base candidate ID order","selected_asset_ids":SELECTED_IDS,"selected_asset_ids_sha256":tagged("\n".join(SELECTED_IDS).encode()),"selection_reason":"13 assets with explicit historical status transition/partial/failure/consumer statements selected from prior static search; exact IDs are fixed for review","excluded_scope":"all ledger rows outside the explicit 13-ID research slice; this is not a complete status census"}
 if inv.get("selection")!=selection: fail("E_SELECTION","selection declaration drift")
 if inv.get("expected_asset_count")!=13 or inv.get("negative_case_codes")!=NEGATIVE_CASE_CODES: fail("E_SCOPE","inventory declaration drift")
 phase={r["asset_id"]:r for r in rows(PHASE)}; from collections import defaultdict
 decisions=defaultdict(list); read_after=defaultdict(list)
 for r in rows(DECISIONS):
  if r.get("asset_id") in ids: decisions[r["asset_id"]].append(r)
 for r in rows(READ_AFTER):
  if r.get("asset_id") in ids: read_after[r["asset_id"]].append(r)
 expected=[expected_record(l,phase,decisions,read_after,pool,rep,direct,wave) for l in selected]; actual=local_jsonl(ep)
 if len(actual)!=13 or [r.get("asset_id") for r in actual]!=SELECTED_IDS or len({r.get("asset_id") for r in actual})!=13: fail("E_ASSET_SET","selected assets must be unique and in fixed order")
 field_codes={"acceptance_evidence":"E_ACCEPTANCE_EVIDENCE","asset_id":"E_ASSET_SET","asset_role":"E_CURRENT_STATUS","authority_effect":"E_AUTHORITY_BOUNDARY","counter_evidence":"E_CLAIM_ANCHOR","current_implementation":"E_CURRENT_STATUS","degradation_evidence":"E_DEGRADATION_EVIDENCE","failure_evidence":"E_FAILURE_EVIDENCE","history_evidence":"E_LEDGER_RECORD","unimplemented_evidence":"E_IMPLEMENTATION_EVIDENCE","legacy_implementation_evidence":"E_IMPLEMENTATION_EVIDENCE","legacy_status":"E_CURRENT_STATUS","ledger_record":"E_LEDGER_RECORD","product_phase_candidates":"E_REQUIREMENT_BINDING","requirement_binding":"E_REQUIREMENT_BINDING","source_exact":"E_SOURCE_EVIDENCE","unit_binding":"E_UNIT_BINDING","consumer_evidence":"E_CONSUMER_EVIDENCE","status_claims":"E_CLAIM_ANCHOR","unresolved":"E_CURRENT_STATUS"}
 for got,want in zip(actual,expected):
  aid=want["asset_id"]
  if set(got)!=TOP_LEVEL_KEYS: fail("E_SCHEMA",f"top-level key drift {aid}")
  for field,code in field_codes.items():
   if got.get(field)!=want.get(field): fail(code,aid)
  if got!=want: fail("E_SCHEMA",f"uncompared record field drift {aid}")
 print(f"PASS SCF-B-0125: {len(actual)} asset-level status partitions; direct unit status remains unknown/pending")
def main():
 p=argparse.ArgumentParser(); p.add_argument("--bundle",type=Path,default=Path(__file__).resolve().parent); a=p.parse_args()
 try: validate(a.bundle.resolve())
 except AssertionError as e: print(str(e),file=sys.stderr); return 1
 return 0
if __name__=="__main__": raise SystemExit(main())
