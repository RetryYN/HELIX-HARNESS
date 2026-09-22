#!/usr/bin/env python3
"""SCF-B-0125: fixed-base static partition of 13 legacy status candidates."""
from __future__ import annotations
import hashlib, json, re, subprocess
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-status-evidence-0125"
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
WAVE_PATHS = {n: (f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl" if n <= 36 else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl") for n in range(1,51)}
GLOBAL_INPUTS = [DISPOSITION,CROSSWALK,DECOMPOSITION,DECISIONS,READ_AFTER,PHASE,FAILURE_SOURCE,CONSUMER_SOURCE,
 "docs/governance/legacy-asset-decision-log.md","docs/governance/legacy-asset-reuse-control.md",
 "docs/governance/legacy-requirement-carry-forward-policy.md","docs/governance/legacy-ir-document-source-relation.jsonl",
 "docs/governance/new-generation-start-here.md","archive/legacy-generation-2026-09-14/MANIFEST.sha256",
 "docs/concept/product-boundary.md","docs/helix-harness/L1-planning/product-intent.md",
 "docs/helix-os/L1-planning/system-intent.md","docs/helix-web/L1-planning/product-intent.md","docs/helix-web-os/L1-planning/system-intent.md"]
SELECTED_IDS = [
 "LEGACY-ASSET-FC00E18B0184CD15033E","LEGACY-ASSET-14C0516250418981B156","LEGACY-ASSET-21039705931BB982EE0E",
 "LEGACY-ASSET-961D6EFEE6F94569D113","LEGACY-ASSET-BDFA744FAF7312826672","LEGACY-ASSET-EEEAD0B3DFB1D12AC571",
 "LEGACY-ASSET-61BA713A6C7588D8AA85","LEGACY-ASSET-7ED36EDFF34D5A6F2A41","LEGACY-ASSET-86214CFBCCC55483170C",
 "LEGACY-ASSET-046F2B43CDD5A827CC95","LEGACY-ASSET-5094F36916F00C37F385","LEGACY-ASSET-61D85EE372040EBCB68B",
 "LEGACY-ASSET-0C8803AA14C9967096DF"]
CLAIM_RULES = {
 SELECTED_IDS[0]: ("old_implementation", r"IMP-104|implemented|unimplemented|validate-only|delegat|drive"),
 SELECTED_IDS[1]: ("old_implementation", r"IMP-107|implemented|unimplemented|placeholder_deps|doctor rule"),
 SELECTED_IDS[2]: ("old_implementation", r"IMP-110|implemented|unimplemented|DB rebuild|migration"),
 SELECTED_IDS[3]: ("old_implementation", r"BR-07|BR-12|NFR-03|green|unimplemented|implementation"),
 SELECTED_IDS[4]: ("degradation", r"HOT-P6|HOT-P8|partial|not-implemented|GAP"),
 SELECTED_IDS[5]: ("old_failure", r"U-IHIER-021|failed|failure|unimplemented|mutation"),
 SELECTED_IDS[6]: ("old_failure", r"CI failure|failure|consumer|stub|read-after|exit"),
 SELECTED_IDS[7]: ("old_failure", r"runtime receipt|implementation verified|unimplemented|assertion|0/"),
 SELECTED_IDS[8]: ("consumer", r"consumer|acceptance|failure|U-LORET|closure"),
 SELECTED_IDS[9]: ("consumer", r"consumer|role|precondition|closure|ledger"),
 SELECTED_IDS[10]: ("consumer", r"consumer|role|precondition|closure|revision"),
 SELECTED_IDS[11]: ("consumer", r"consumer|role|precondition|hidden|validator"),
 SELECTED_IDS[12]: ("failure", r"selected_it_ids|partial|passed|exit_code|exit_criteria"),
}
TOP_LEVEL_KEYS = {"acceptance_evidence","asset_id","asset_role","authority_effect","counter_evidence","current_implementation",
 "degradation_evidence","failure_evidence","history_evidence","unimplemented_evidence","legacy_implementation_evidence",
 "legacy_status","ledger_record","product_phase_candidates","requirement_binding","source_exact","unit_binding","consumer_evidence",
 "status_claims","unresolved"}
NEGATIVE_CASE_CODES = ["E_SCHEMA","E_BASE_PIN","E_BASE_NOT_ANCESTOR","E_INPUT_SET","E_INPUT_DIGEST","E_OUTPUT_DIGEST","E_SCOPE","E_SELECTION","E_LEDGER_RECORD","E_SOURCE_EVIDENCE","E_CLAIM_ANCHOR","E_UNIT_BINDING","E_REQUIREMENT_BINDING","E_IMPLEMENTATION_EVIDENCE","E_DEGRADATION_EVIDENCE","E_FAILURE_EVIDENCE","E_CONSUMER_EVIDENCE","E_CURRENT_STATUS","E_ACCEPTANCE_EVIDENCE","E_AUTHORITY_BOUNDARY","E_ASSET_SET"]

def tagged(data: bytes) -> str: return "sha256:" + hashlib.sha256(data).hexdigest()
def git_bytes(path: str) -> bytes: return subprocess.check_output(["git","show",f"{BASE_REVISION}:{path}"],cwd=ROOT)
def git_blob(path: str) -> str: return subprocess.check_output(["git","rev-parse",f"{BASE_REVISION}:{path}"],cwd=ROOT,text=True).strip()
def base_rows(path: str) -> list[tuple[int,dict]]: return [(n,json.loads(line)) for n,line in enumerate(git_bytes(path).decode().splitlines(),1) if line.strip()]
def rows(path: str) -> list[dict]: return [r for _,r in base_rows(path)]
def line_map(path: str, key: str) -> dict[str,int]: return {r.get(key): n for n,r in base_rows(path) if r.get(key)}
def input_paths(): return [*WAVE_PATHS.values(), *GLOBAL_INPUTS, *[ARCHIVE_PREFIX+r["source_path"] for r in selected_rows()]]
def selected_rows():
 by_id = {r["asset_id"]: r for r in rows(DISPOSITION)}
 if set(by_id) & set(SELECTED_IDS) != set(SELECTED_IDS): raise ValueError("selected asset missing at BASE")
 return [by_id[a] for a in SELECTED_IDS]
def crosswalk_relations(ids: set[str]):
 pool, rep, direct = defaultdict(list), defaultdict(list), defaultdict(list)
 for n,r in base_rows(CROSSWALK):
  for aid in r.get("candidate_asset_pool",{}).get("phase_and_product_candidate_asset_ids",[]):
   if aid in ids: pool[aid].append({"line":n,"unit_candidate_id":r.get("unit_candidate_id")})
  for field,dest in (("representative_legacy_assets",rep),("direct_legacy_asset_links",direct)):
   for item in r.get(field,[]):
    aid=item if isinstance(item,str) else item.get("asset_id")
    if aid in ids: dest[aid].append({"line":n,"unit_candidate_id":r.get("unit_candidate_id"),"record":item})
 return pool,rep,direct
def wave_relations(ids: set[str]):
 out=defaultdict(list)
 for n,p in WAVE_PATHS.items():
  for line,r in base_rows(p):
   if r.get("asset_id") in ids: out[r["asset_id"]].append({"wave":n,"path":p,"line":line,"record":r})
 return out
def source_claims(asset_id: str, data: bytes):
 text=data.decode(errors="replace"); lines=text.splitlines(); kind,pattern=CLAIM_RULES[asset_id]; rx=re.compile(pattern,re.I)
 hit=[n for n,line in enumerate(lines,1) if rx.search(line)][:16]
 if not hit: hit=[n for n,line in enumerate(lines,1) if line.strip()][:1] or [1]
 refs=[{"line":n,"line_text_sha256":tagged(lines[n-1].encode()),"line_preview":lines[n-1][:280]} for n in hit]
 timestamps=[]
 for line in lines:
  m=re.search(r"\b20\d{2}-\d\d-\d\d(?:T[^ ,、]+)?",line)
  if m: timestamps.append(m.group(0))
 return {"claim_dimension":kind,"claim_pattern":pattern,"scope":"asset_level_historical_or_observed_statement","observed_at":timestamps[0] if timestamps else None,"source_refs":refs,"unit_ids":[],"requirement_ids":[],"interpretation":"候補asset本文の主張／観測を保存するが、unitの実装・縮退・failure・consumer closureを証明しない"}
def source_exact(ledger):
 archive=ARCHIVE_PREFIX+ledger["source_path"]; data=git_bytes(archive)
 if tagged(data)!="sha256:"+ledger["source_sha256"]: raise ValueError(f"source digest mismatch {ledger['asset_id']}")
 return {"archive_path":archive,"blob":git_blob(archive),"bytes":len(data),"line_count":len(data.decode(errors='replace').splitlines()),"sha256":tagged(data),"ledger_source_sha256":"sha256:"+ledger["source_sha256"],"target_path":None,"target_blob":None,"target_bytes":None,"target_sha256":None,"ledger_target_sha256":None,"read_mode":"fixed_base_git_object_static_read_only","claims":source_claims(ledger["asset_id"],data)}
def build_record(ledger,phase,decisions,read_after,pool,rep,direct,wave):
 aid=ledger["asset_id"]; exact=source_exact(ledger); claims=exact["claims"]; kind=claims["claim_dimension"]
 refs=claims["source_refs"]
 status_claims={"old_implementation":[],"old_unimplemented":[],"degradation":[],"failure":[],"consumer":[]}; status_claims[kind]=refs
 return {"acceptance_evidence":{"status":"unknown","verdict":None,"evidence_refs":[],"scope":"unit_acceptance_absent","reason":"asset-level source/receipt contains no directly bound current acceptance verdict"},"asset_id":aid,"asset_role":"historical_status_candidate_static_only","authority_effect":"none","counter_evidence":[{"kind":"no_direct_unit_binding","wave_edge_count":len(wave[aid]),"direct_crosswalk_count":len(direct[aid]),"representative_crosswalk_count":len(rep[aid]),"reason":"candidate pool or asset statement is not a direct unit implementation binding"},{"kind":"ledger_status","implementation_status":ledger.get("implementation_status"),"disposition":ledger.get("disposition"),"reason":"fixed-base ledger status remains unknown/unresolved"}],"current_implementation":{"status":"unknown","evidence_refs":[],"scope":"current_unit_absent","reason":"selected legacy asset has no directly linked current implementation evidence"},"degradation_evidence":{"status":"unknown","asset_claim_status":"asset_level_claim" if kind=="degradation" else "none","evidence_refs":refs if kind=="degradation" else [],"unit_status":"unknown","reason":"partial/degraded wording is retained as asset-level historical claim; no unit receipt"},"failure_evidence":{"status":"unknown","asset_claim_status":"asset_level_claim" if kind=="old_failure" or aid==SELECTED_IDS[-1] else "none","evidence_refs":refs if kind=="old_failure" or aid==SELECTED_IDS[-1] else [],"unit_status":"unknown","reason":"failure marker/receipt is static asset evidence; no direct unit failure verdict"},"history_evidence":{"phase_record":phase.get(aid),"decision_records":decisions.get(aid,[]),"read_after_records":read_after.get(aid,[]),"consumer_refs":ledger.get("consumer_refs",[]),"interpretation":"history is preserved as source/history evidence and does not establish implementation or acceptance"},"unimplemented_evidence":{"status":"unknown","asset_claim_status":"asset_level_claim" if kind=="old_implementation" else "none","evidence_refs":refs if kind=="old_implementation" else [],"unit_status":"unknown","reason":"historical unimplemented wording is not sufficient to classify the requirement unit"},"legacy_implementation_evidence":{"status":"unknown","asset_claim_status":"asset_level_claim" if kind=="old_implementation" else "none","evidence_refs":refs if kind=="old_implementation" else [],"unit_status":"unknown","reason":"plan/source claim may describe a historical transition; implementation existence is not proven without direct unit binding and acceptance"},"legacy_status":{"old_implementation":"unknown","old_unimplemented":"unknown","old_degradation":"unknown","old_failure":"unknown","consumer_closure":"pending","current_implementation":"unknown","acceptance":"unknown","unknown_reasons":["asset-level claim or receipt only","no direct unit/requirement acceptance binding","old runtime/test/CI not executed"]},"ledger_record":ledger,"product_phase_candidates":{"candidate_product_targets":(phase.get(aid) or {}).get("candidate_product_targets",[]),"candidate_phase_targets":(phase.get(aid) or {}).get("candidate_phase_targets",[]),"phase_classification_status":(phase.get(aid) or {}).get("phase_classification_status"),"product_classification_status":(phase.get(aid) or {}).get("product_classification_status"),"interpretation":"candidate product/phase only; no authority or successor assignment"},"requirement_binding":{"status":"candidate_source_relation_only" if pool[aid] or wave[aid] else "absent","candidate_pool_rows":pool[aid],"wave_edge_refs":wave[aid],"direct_refs":direct[aid],"requirement_ids":sorted({x["record"].get("source_requirement_id") for x in wave[aid] if x["record"].get("source_requirement_id")}),"reason":"relation search is preserved separately from direct implementation/acceptance binding"},"source_exact":exact,"unit_binding":{"status":"absent","unit_candidate_ids":[],"candidate_pool_unit_ids":sorted({x["unit_candidate_id"] for x in pool[aid]}),"candidate_pool_rows":pool[aid],"wave_edge_refs":wave[aid],"direct_crosswalk_refs":direct[aid],"representative_refs":rep[aid],"semantics":"search candidate only; not a direct unit link"},"consumer_evidence":{"status":"asset_level_definition_only" if kind=="consumer" else "unknown","closure_status":"pending","asset_refs":refs if kind=="consumer" else [],"unit_status":"unknown","ledger_consumer_refs":ledger.get("consumer_refs",[]),"decision_count":len(decisions.get(aid,[])),"read_after_count":len(read_after.get(aid,[])),"reason":"consumer role/ledger/config is retained as asset-level evidence; closure receipt and unit binding are absent"},"status_claims":status_claims,"unresolved":["unit implementation status unknown","unit unimplemented status unknown","unit degradation/failure status unknown","consumer closure pending","current implementation and acceptance unknown","direct requirement-to-unit binding absent"]}
def build():
 disposition=selected_rows(); ids=set(SELECTED_IDS); phase={r["asset_id"]:r for r in rows(PHASE)}; decisions=defaultdict(list)
 for r in rows(DECISIONS):
  if r.get("asset_id") in ids: decisions[r["asset_id"]].append(r)
 read_after=defaultdict(list)
 for r in rows(READ_AFTER):
  if r.get("asset_id") in ids: read_after[r["asset_id"]].append(r)
 pool,rep,direct=crosswalk_relations(ids); wave=wave_relations(ids)
 evidence=[build_record(l,phase,decisions,read_after,pool,rep,direct,wave) for l in disposition]
 allwaves=[r for p in WAVE_PATHS.values() for r in rows(p)]
 decomposition=rows(DECOMPOSITION)
 inventory={"schema_revision":1,"binding_id":"SCF-B-0125","bundle_kind":"research_scaffold_legacy_status_evidence_partition","base_revision":BASE_REVISION,"base_source_mode":"all input and selected legacy evidence bytes from fixed BASE Git objects","authority_boundary":{"authority_effect":"none","formal_implementation_claim_updated":False,"formal_degradation_claim_updated":False,"formal_unimplemented_claim_updated":False,"formal_current_implementation_claim_updated":False,"acceptance_verdict_created":False,"new_build_allowed":False,"status_rule":"unknown_when_direct_unit_evidence_is_missing"},"scope":{"product_units":sum(len(r.get("candidate_units",[])) for r in decomposition),"source_ids":len(decomposition),"wave_files":50,"wave_edges":len(allwaves),"wave_unique_assets":len({r.get("asset_id") for r in allwaves}),"legacy_asset_ledger_rows":len(rows(DISPOSITION)),"selected_assets":len(evidence),"selected_wave_edges":sum(len(wave[a]) for a in ids),"selected_candidate_pool_rows":sum(len(pool[a]) for a in ids),"selected_representative_links":sum(len(rep[a]) for a in ids),"selected_direct_links":sum(len(direct[a]) for a in ids)},"selection":{"source":DISPOSITION,"source_row_order":"explicit fixed-base candidate ID order","selected_asset_ids":SELECTED_IDS,"selected_asset_ids_sha256":tagged("\n".join(SELECTED_IDS).encode()),"selection_reason":"13 assets with explicit historical status transition/partial/failure/consumer statements selected from prior static search; exact IDs are fixed for review","excluded_scope":"all ledger rows outside the explicit 13-ID research slice; this is not a complete status census"},"anchor_rule":{"method":"claim-specific regex; first 16 matching source lines; exact decoded line digest","claim_rules":{k:v[1] for k,v in CLAIM_RULES.items()}},"search_boundaries":{"all_product_units":218,"all_source_ids":153,"all_wave_edges":len(allwaves),"all_wave_unique_assets":len({r.get("asset_id") for r in allwaves}),"all_ledger_rows":len(rows(DISPOSITION)),"crosswalk_fields":["candidate_asset_pool.phase_and_product_candidate_asset_ids","representative_legacy_assets","direct_legacy_asset_links"],"history_fields":[DECISIONS,READ_AFTER,PHASE],"failure_consumer_sources":[FAILURE_SOURCE,CONSUMER_SOURCE],"negative_boundary":"asset-level status statement/receipt, candidate relation, source/config role, and plan history do not establish unit implementation, degradation, unimplementation, failure, consumer closure, current implementation, or acceptance"},"input_digests":[{"path":p,"blob":git_blob(p),"bytes":len(git_bytes(p)),"sha256":tagged(git_bytes(p))} for p in input_paths()],"expected_asset_count":13,"negative_case_codes":NEGATIVE_CASE_CODES,"output_sha256":""}
 BUNDLE.mkdir(parents=True,exist_ok=True); ep=BUNDLE/"evidence.jsonl"; ep.write_text("".join(json.dumps(r,ensure_ascii=False,sort_keys=True)+"\n" for r in evidence)); inventory["output_sha256"]=tagged(ep.read_bytes()); (BUNDLE/"inventory.json").write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+"\n")
if __name__=="__main__": build()
