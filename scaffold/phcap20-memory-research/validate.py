#!/usr/bin/env python3
"""PHCAP-20 memory/continuation research premise validator; static checks only."""
import hashlib,json,re,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent; ROOT=HERE.parents[1]; INV=HERE/'inventory.json'
ASSET=ROOT/'docs/governance/legacy-asset-disposition.jsonl'; PHASE=ROOT/'docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl'; DEC=ROOT/'docs/governance/legacy-asset-decisions.jsonl'
PREFIX='archive/legacy-generation-2026-09-14/root/'
def dig(b): return hashlib.sha256(b).hexdigest()
def jsonl(p): return [json.loads(x) for x in p.read_text(encoding='utf-8').splitlines() if x.strip()]
def req(e,c,m):
 if not c:e.append(m)
def text(p,a,b):
 ls=p.read_text(encoding='utf-8').splitlines()
 return '\n'.join(ls[a-1:b])+'\n' if 1<=a<=b<=len(ls) else None
def nonempty(x): return isinstance(x,str) and bool(x.strip())
EXPECTED_CONTRADICTION_RESOLUTIONS={
 'CONTR-01':'preserved as phase-level historical reach versus asset-level evidence state; no current implementation or pass claim',
 'CONTR-02':'old source semantics are reference evidence only; current implementation and operations remain unknown',
 'CONTR-03':'HARNESS/Web/Web-OS remain non-target connection or boundary candidates; no PHCAP-20 target ownership is generated',
 'CONTR-04':'learning versus memory/continuation split remains unresolved; no cross-phase merge or successor is generated',
}
def validate(d):
 e=[]
 req(e,d.get('schema')=='phcap20-memory-research/v1','E_SCHEMA'); req(e,d.get('status')=='research_premise_candidate','E_STATUS'); req(e,d.get('authority_effect')=='none','E_AUTHORITY'); req(e,d.get('meaning_change_applied') is False,'E_MEANING'); req(e,d.get('successor_requirement_ids')==[] and d.get('human_decision_ref') is None,'E_DECISION'); req(e,d.get('equivalence_claim') is None,'E_EQUIVALENCE'); req(e,d.get('old_runtime_test_ci_execution') is False,'E_OLD_EXEC')
 base=d.get('base',{}); req(e,base.get('repository')=='HELIX-HARNESS' and base.get('branch')=='origin/main' and re.fullmatch(r'[0-9a-f]{40}',str(base.get('commit',''))) is not None,'E_BASE')
 req(e,d.get('scope',{}).get('product_targets')==['HELIX-OS'],'E_TARGET_SCOPE'); req(e,d.get('gap_interpretation',{}).get('inventory_product_targets')==['HELIX-OS'],'E_INVENTORY_TARGET')
 g=d.get('gap_interpretation',{}); req(e,g.get('inventory_current_evidence_products')==['HELIX-OS'],'E_CURRENT_PRODUCTS'); req(e,g.get('direct_current_evidence_products')==['HELIX-OS'],'E_DIRECT_PRODUCTS'); req(e,g.get('direct_current_evidence_refs')==['docs/helix-os/L2-requirements/governance-requirements.md','docs/helix-os/L11-acceptance/governance-acceptance.md'],'E_DIRECT_PATHS'); req(e,g.get('current_implementation_status')=='unknown','E_IMPL_UNKNOWN'); req(e,g.get('current_operations_status')=='unknown','E_OPS_UNKNOWN'); req(e,g.get('missing_status')=='unknown','E_MISSING_UNKNOWN'); req(e,set(d.get('scope',{}).get('non_target_connection_products',[]))=={'HELIX-HARNESS','HELIX-Web','HELIX-Web-OS'},'E_NON_TARGET_SCOPE')
 amap={x.get('asset_id'):x for x in jsonl(ASSET)}; pmap={x.get('asset_id'):x for x in jsonl(PHASE)}; decisions=jsonl(DEC); legacy=d.get('legacy_assets',[]); expected=set(d.get('scope',{}).get('legacy_asset_ids',[]))
 req(e,len(legacy)==5 and {x.get('asset_id') for x in legacy}==expected,'E_ASSET_SCOPE'); req(e,d.get('counts',{}).get('decision_records_found')==0,'E_DECISION_COUNT'); req(e,d.get('counts',{}).get('legacy_consumer_refs_observed')==0,'E_CONSUMER_COUNT')
 for item in legacy:
  aid=item.get('asset_id'); old=amap.get(aid); ph=pmap.get(aid); req(e,old is not None and ph is not None,'E_LEDGER:'+str(aid))
  if old:
   for k,v in {'disposition':'unresolved','implementation_status':'unknown','consumer_refs':[],'product_target':'unresolved','authority_status':'historical','decision_record_ref':None}.items(): req(e,old.get(k)==v,'E_ASSET_STATE:%s:%s'%(aid,k))
   for k,v in item.get('ledger_record',{}).items(): req(e,old.get(k)==v,'E_LEDGER_SNAPSHOT:%s:%s'%(aid,k))
  if ph:
   for k,v in {'consumer_closure_status':'pending','consumer_refs':[],'legacy_implementation_status':'unknown','legacy_execution_performed':False}.items(): req(e,ph.get(k)==v,'E_PHASE_STATE:%s:%s'%(aid,k))
   for k in ('classification_id','candidate_phase_targets','candidate_product_targets','phase_classification_status','product_classification_status','consumer_closure_status','consumer_refs','legacy_implementation_status','legacy_execution_performed','unresolved'): req(e,item.get('phase_classification_record',{}).get(k)==ph.get(k),'E_PHASE_SNAPSHOT:%s:%s'%(aid,k))
  matches=[x for x in decisions if x.get('asset_id')==aid]; req(e,len(matches)==0 and item.get('decision_history',{}).get('matching_decision_record_count')==0,'E_DECISION_MATCH:'+aid); req(e,item.get('decision_history',{}).get('status')=='no_matching_append_only_decision_record','E_DECISION_STATUS:'+aid)
  p=ROOT/item.get('archive_path',''); req(e,item.get('archive_path','').startswith(PREFIX) and p.is_file(),'E_ARCHIVE:'+aid)
  if p.is_file():
   req(e,dig(p.read_bytes())==item.get('source_sha256'),'E_SOURCE_SHA:'+aid); req(e,len(p.read_text(encoding='utf-8').splitlines())==item.get('source_line_count'),'E_SOURCE_LINES:'+aid)
   ids={s.get('span_id') for s in item.get('source_spans',[])}
   req(e,bool(item.get('source_spans')),'E_SPANS:'+aid)
   for s in item.get('source_spans',[]):
    t=text(p,s.get('start_line',0),s.get('end_line',0)); req(e,t is not None,'E_SPAN_BOUNDS:'+s.get('span_id',''))
    if t is not None: req(e,t==s.get('exact_text'),'E_SPAN_TEXT:'+s.get('span_id','')); req(e,dig(t.encode())==s.get('sha256'),'E_SPAN_SHA:'+s.get('span_id',''))
   for key in ('failure_evidence','consumer_evidence'):
    req(e,bool(item.get(key)),'E_ASSET_%s:%s'%(key.upper(),aid))
    for x in item.get(key,[]): req(e,x.get('span_id') in ids and nonempty(x.get('finding')),'E_ASSET_%s_REF:%s'%(key.upper(),aid))
 spanmap={s.get('span_id'):a.get('asset_id') for a in legacy for s in a.get('source_spans',[])}; seen=set()
 for a in d.get('atoms',[]):
  aid=a.get('atom_id'); req(e,nonempty(aid) and aid not in seen,'E_ATOM_DUP:'+str(aid)); seen.add(aid); req(e,a.get('source_span_id') in spanmap and spanmap[a.get('source_span_id')]==a.get('source_asset_id'),'E_ATOM_SPAN:'+str(aid))
  for key in ('kind','subject','actor_candidate','legacy_authority_or_enforced_by','failure_or_unresolved','consumer_candidate','product_unit_candidate','connection_candidate','evidence_status'): req(e,nonempty(a.get(key)),'E_ATOM_FIELD:%s:%s'%(aid,key))
 req(e,len(seen)==d.get('counts',{}).get('semantic_atoms'),'E_ATOM_COUNT')
 refs=d.get('current_refs',[]); req(e,len(refs)==d.get('counts',{}).get('current_refs_recorded'),'E_CURRENT_COUNT'); direct=[]
 for r in refs:
  p=ROOT/r.get('path',''); req(e,p.is_file(),'E_CURRENT_MISSING:'+str(r.get('ref_id')))
  if p.is_file():
   req(e,dig(p.read_bytes())==r.get('sha256'),'E_CURRENT_SHA:'+str(r.get('ref_id'))); t=text(p,r.get('start_line',0),r.get('end_line',0)); req(e,t==r.get('exact_text'),'E_CURRENT_TEXT:'+str(r.get('ref_id')))
   if t is not None:req(e,dig(t.encode())==r.get('line_sha256'),'E_CURRENT_LINE_SHA:'+str(r.get('ref_id')))
  req(e,r.get('classification') in {'direct_current_ref','adjacent_current_ref','boundary_candidate','direct_boundary_current_ref','non_target_boundary_ref'},'E_CURRENT_CLASS:'+str(r.get('ref_id')))
  if r.get('classification')=='direct_current_ref': direct.append(r)
 req(e,len(direct)==2 and {r.get('ref_id') for r in direct}=={'CUR-OS-L2','CUR-OS-L11'} and {r.get('product') for r in direct}=={'HELIX-OS'},'E_DIRECT_REFS')
 boundary=d.get('product_boundary_candidates',{}); req(e,boundary.get('target_unit',{}).get('product')=='HELIX-OS','E_BOUNDARY_TARGET'); req(e,{x.get('product') for x in boundary.get('connections',[])}=={'HELIX-HARNESS','HELIX-Web','HELIX-Web-OS'},'E_BOUNDARY_CONNECTIONS'); req(e,all(x.get('role')=='non_target connection candidate' and x.get('status')=='unresolved' for x in boundary.get('connections',[])),'E_BOUNDARY_CONNECTION_STATUS')
 contradictions=d.get('contradictions_preserved',[]); req(e,isinstance(contradictions,list),'E_CONTRADICTIONS_TYPE')
 if not isinstance(contradictions,list): contradictions=[]
 req(e,len(contradictions)==4,'E_CONTRADICTIONS_COUNT')
 seen_contradictions=set()
 if isinstance(contradictions,list):
  for index,c in enumerate(contradictions):
   if not isinstance(c,dict):
    e.append('E_CONTRADICTION_OBJECT:%s'%index); continue
   cid=c.get('id'); req(e,nonempty(cid),'E_CONTRADICTION_ID:%s'%index)
   if not isinstance(cid,str): continue
   req(e,cid not in seen_contradictions,'E_CONTRADICTION_DUP:%s'%cid); seen_contradictions.add(cid)
   if 'key' in c: req(e,nonempty(c.get('key')) and c.get('key')==cid,'E_CONTRADICTION_KEY:%s'%cid)
   for key in ('left','right','resolution'): req(e,nonempty(c.get(key)),'E_CONTRADICTION_FIELD:%s:%s'%(cid,key))
   req(e,c.get('status')=='unresolved_preserved','E_CONTRADICTION_STATUS:%s'%cid)
   req(e,cid in EXPECTED_CONTRADICTION_RESOLUTIONS,'E_CONTRADICTION_UNKNOWN_ID:%s'%cid)
   if cid in EXPECTED_CONTRADICTION_RESOLUTIONS: req(e,c.get('resolution')==EXPECTED_CONTRADICTION_RESOLUTIONS[cid],'E_CONTRADICTION_RESOLUTION:%s'%cid)
 req(e,seen_contradictions==set(EXPECTED_CONTRADICTION_RESOLUTIONS),'E_CONTRADICTION_IDS')
 unresolved=d.get('unresolved',[]); req(e,len(unresolved)>=8,'E_UNRESOLVED_COUNT');
 for i,x in enumerate(unresolved): req(e,nonempty(x),'E_UNRESOLVED_ITEM:%s'%i)
 return e
if __name__=='__main__':
 e=validate(json.loads(INV.read_text(encoding='utf-8')))
 if e: print('FAIL PHCAP-20 validator\n'+'\n'.join(e)); sys.exit(1)
 print('PASS PHCAP-20 validator: static source/ledger/current-boundary/unknown checks')
