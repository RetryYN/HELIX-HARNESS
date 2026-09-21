#!/usr/bin/env python3
"""PHCAP-19 learning/improvement research premise validator; read-only static checks."""
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
def validate(d):
 e=[]
 req(e,d.get('schema')=='phcap19-learning-research/v1','E_SCHEMA'); req(e,d.get('status')=='research_premise_candidate','E_STATUS'); req(e,d.get('authority_effect')=='none','E_AUTHORITY'); req(e,d.get('meaning_change_applied') is False,'E_MEANING'); req(e,d.get('successor_requirement_ids')==[] and d.get('human_decision_ref') is None,'E_DECISION'); req(e,d.get('equivalence_claim') is None,'E_EQUIVALENCE'); req(e,d.get('old_runtime_test_ci_execution') is False,'E_OLD_EXEC'); base=d.get('base',{}); req(e,base.get('repository')=='HELIX-HARNESS' and base.get('branch')=='origin/main' and re.fullmatch(r'[0-9a-f]{40}',str(base.get('commit',''))) is not None,'E_BASE')
 g=d.get('gap_interpretation',{}); req(e,g.get('inventory_current_evidence_products')==['HELIX-OS'],'E_CURRENT_PRODUCTS'); req(e,g.get('direct_current_evidence_products')==['HELIX-OS'],'E_DIRECT_PRODUCT_SCOPE'); req(e,g.get('direct_current_evidence_refs')==['docs/helix-os/L2-requirements/governance-requirements.md','docs/helix-os/L11-acceptance/governance-acceptance.md'],'E_DIRECT_REF_PATHS'); req(e,set(g.get('missing_direct_current_products',[]))=={'HELIX-HARNESS','HELIX-Web','HELIX-Web-OS'},'E_MISSING_PRODUCTS'); req(e,g.get('missing_status')=='unknown','E_UNKNOWN')
 amap={x.get('asset_id'):x for x in jsonl(ASSET)}; pmap={x.get('asset_id'):x for x in jsonl(PHASE)}; decisions=jsonl(DEC); legacy=d.get('legacy_assets',[]); expected=set(d.get('scope',{}).get('bounded_asset_ids',[]))
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
   for s in item.get('source_spans',[]):
    t=text(p,s.get('start_line',0),s.get('end_line',0)); req(e,t is not None,'E_SPAN_BOUNDS:'+s.get('span_id',''))
    if t is not None: req(e,t==s.get('exact_text'),'E_SPAN_TEXT:'+s.get('span_id','')); req(e,dig(t.encode())==s.get('sha256'),'E_SPAN_SHA:'+s.get('span_id',''))
   ids={s.get('span_id') for s in item.get('source_spans',[])}
   for key in ('failure_evidence','consumer_evidence'):
    req(e,bool(item.get(key)),'E_ASSET_%s:%s'%(key.upper(),aid))
    for x in item.get(key,[]): req(e,x.get('span_id') in ids and x.get('finding'),'E_ASSET_%s_REF:%s'%(key.upper(),aid))
 spanmap={s.get('span_id'):a.get('asset_id') for a in legacy for s in a.get('source_spans',[])}; seen=set()
 for a in d.get('atoms',[]):
  aid=a.get('atom_id'); req(e,aid and aid not in seen,'E_ATOM_DUP:'+str(aid)); seen.add(aid); req(e,a.get('source_span_id') in spanmap and spanmap[a.get('source_span_id')]==a.get('source_asset_id'),'E_ATOM_SPAN:'+str(aid)); req(e,a.get('actor_candidate') and a.get('legacy_authority_or_enforced_by'),'E_ATOM_ACTOR:'+str(aid)); req(e,a.get('failure_or_unresolved') and a.get('consumer_candidate'),'E_ATOM_FAILURE:'+str(aid)); req(e,a.get('product_unit_candidate') and a.get('evidence_status'),'E_ATOM_BOUNDARY:'+str(aid))
 req(e,len(seen)==d.get('counts',{}).get('semantic_atoms'),'E_ATOM_COUNT')
 refs=d.get('current_refs',[]); req(e,len(refs)==d.get('counts',{}).get('current_refs_recorded'),'E_CURRENT_COUNT'); direct=[]
 for r in refs:
  p=ROOT/r.get('path',''); req(e,p.is_file(),'E_CURRENT_MISSING:'+str(r.get('ref_id')))
  if p.is_file():
   req(e,dig(p.read_bytes())==r.get('sha256'),'E_CURRENT_SHA:'+str(r.get('ref_id'))); t=text(p,r.get('start_line',0),r.get('end_line',0)); req(e,t==r.get('exact_text'),'E_CURRENT_TEXT:'+str(r.get('ref_id')))
   if t is not None:req(e,dig(t.encode())==r.get('line_sha256'),'E_CURRENT_LINE_SHA:'+str(r.get('ref_id')))
  req(e,r.get('classification') in {'direct_current_ref','adjacent_current_ref','boundary_candidate','direct_boundary_current_ref'},'E_CURRENT_CLASS:'+str(r.get('ref_id')))
  if r.get('classification')=='direct_current_ref': direct.append(r)
 req(e,len(direct)==2 and {r.get('ref_id') for r in direct}=={'CUR-OS-L2','CUR-OS-L11'} and {r.get('product') for r in direct}=={'HELIX-OS'},'E_DIRECT_REFS'); req(e,len(d.get('contradictions_preserved',[]))>=4,'E_CONTRADICTIONS'); req(e,len(d.get('unresolved',[]))>=7,'E_UNRESOLVED')
 return e
if __name__=='__main__':
 e=validate(json.loads(INV.read_text(encoding='utf-8')))
 if e: print('FAIL PHCAP-19 validator\n'+'\n'.join(e)); sys.exit(1)
 print('PASS PHCAP-19 validator: static source/ledger/current-boundary/unknown checks')
