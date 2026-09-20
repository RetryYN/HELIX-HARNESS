#!/usr/bin/env python3
"""wave 4 direct semantic reviewをarchive実行なしで静的検証する。"""
import hashlib, json, re, subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]; GOV=ROOT/'docs/governance'; ARCH=ROOT/'archive/legacy-generation-2026-09-14/root'
LEDGER=GOV/'legacy-requirement-direct-semantic-review-wave4.jsonl'; META=GOV/'legacy-requirement-direct-semantic-review-wave4.meta.json'
STATUS=GOV/'audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave4-status-2026-09-21.md'
CATALOG=GOV/'legacy-asset-phase-product-classification-bootstrap.jsonl'; CROSS=GOV/'legacy-requirement-implementation-crosswalk-bootstrap.jsonl'
DECOMP=GOV/'legacy-ir-product-unit-decomposition-bootstrap.jsonl'; MANIFEST=ROOT/'archive/legacy-generation-2026-09-14/MANIFEST.sha256'
PHASE=GOV/'phase-capability-inventory.json'; PRIOR=[(GOV/f'legacy-requirement-direct-semantic-review-wave{n}.jsonl',GOV/f'legacy-requirement-direct-semantic-review-wave{n}.meta.json') for n in (1,2,3)]

ATOMS={
'IRUNIT-HIL-BR-10-HELIX-OS':[
 {'atom_id':'BR10-OS-A01','kind':'causality_member_set','text':'Issueからmemoryまでの指定event集合を保持する','source_fragments':['Issue・Reverse・Redesign・development-style PLAN・commit・PR・CI・audit・memory'],'shared_with_units':[],'boundary_review_state':'product_boundary_pending_human_decision'},
 {'atom_id':'BR10-OS-A02','kind':'causality_join','text':'指定eventを同一causality chainとしてharness.dbへ収束する','source_fragments':['同一causality chainとしてharness.dbへ収束する'],'shared_with_units':[],'boundary_review_state':'product_boundary_pending_human_decision'},
 {'atom_id':'BR10-OS-A03','kind':'broken_join_incomplete','text':'join切れを未完了として扱う','source_fragments':['join切れは未完了とする'],'shared_with_units':[],'boundary_review_state':'product_boundary_pending_human_decision'}],
'IRUNIT-HIL-BR-06-HELIX-OS':[
 {'atom_id':'BR06-OS-A01','kind':'ordered_gate_chain','text':'AdmissionからClosureまでの各gate通過を要求する','source_fragments':['IssueはAdmission、Reverse Evidence、Redesign、Scope、Implementation Entry、Closureの各gateを通過しない限り'],'shared_with_units':['IRUNIT-HIL-BR-06-HELIX-HARNESS'],'boundary_review_state':'product_boundary_pending_human_decision'},
 {'atom_id':'BR06-OS-A02','kind':'transition_prohibition','text':'未通過時にready、implement、merge、closeへ遷移させない','source_fragments':['ready/implement/merge/closeへ遷移しない'],'shared_with_units':['IRUNIT-HIL-BR-06-HELIX-HARNESS'],'boundary_review_state':'product_boundary_pending_human_decision'}],
'IRUNIT-HIL-BR-33-HELIX-OS':[
 {'atom_id':'BR33-OS-A01','kind':'distribution_cutover_approval_boundary','text':'配布surfaceの実切替を既存cutover承認境界に従わせる','source_fragments':['配布surfaceの実切替は既存cutover承認境界に従う'],'shared_with_units':[],'boundary_review_state':'product_boundary_pending_human_decision'}]}
QUERIES={
'IRUNIT-HIL-BR-10-HELIX-OS':['HIL-BR-10','同一causality chain','EVENT_CAUSATION_UNRESOLVED','EVENT_CORRELATION_MISMATCH','evaluateCausalOrder','evaluateIdempotentIngest'],
'IRUNIT-HIL-BR-06-HELIX-OS':['HIL-BR-06','ready/implement/merge/close','IssueTransitionGate','evaluateGitHubCrossReviewAdmission','current_head_review_receipt_missing','evaluateReviewedMergeReadAfter'],
'IRUNIT-HIL-BR-33-HELIX-OS':['HIL-BR-33','配布surfaceの実切替','cutover承認境界','ADR-008','planReleaseAutomationDecision','applyAuthorized']}
DECISIONS={
('IRUNIT-HIL-BR-10-HELIX-OS','LEGACY-ASSET-719D5EC9C06FC4AAD0FF'):('confirmed','same_requirement_id_exact_source_contract_not_implementation',('BR10-OS-A01','BR10-OS-A02','BR10-OS-A03')),
('IRUNIT-HIL-BR-10-HELIX-OS','LEGACY-ASSET-33C30050BD9B4A523E60'):('unresolved','design_contract_evidence',('BR10-OS-A02','BR10-OS-A03')),
('IRUNIT-HIL-BR-10-HELIX-OS','LEGACY-ASSET-3705801CEFFE5E9A650A'):('unresolved','partial_implementation_behavior_evidence_unexecuted',('BR10-OS-A02',)),
('IRUNIT-HIL-BR-06-HELIX-OS','LEGACY-ASSET-719D5EC9C06FC4AAD0FF'):('confirmed','same_requirement_id_exact_source_contract_not_implementation',('BR06-OS-A01','BR06-OS-A02')),
('IRUNIT-HIL-BR-06-HELIX-OS','LEGACY-ASSET-D9345A55829519760D5D'):('unresolved','design_contract_evidence',('BR06-OS-A01','BR06-OS-A02')),
('IRUNIT-HIL-BR-06-HELIX-OS','LEGACY-ASSET-EA1DFC00D984068C2444'):('unresolved','partial_implementation_behavior_evidence_unexecuted',('BR06-OS-A02',)),
('IRUNIT-HIL-BR-33-HELIX-OS','LEGACY-ASSET-719D5EC9C06FC4AAD0FF'):('confirmed','same_requirement_id_exact_source_contract_not_implementation',('BR33-OS-A01',)),
('IRUNIT-HIL-BR-33-HELIX-OS','LEGACY-ASSET-FF94651B242236F07668'):('unresolved','design_contract_evidence',('BR33-OS-A01',)),
('IRUNIT-HIL-BR-33-HELIX-OS','LEGACY-ASSET-4C97F9E72F120F6B664E'):('unresolved','partial_implementation_behavior_evidence_unexecuted',('BR33-OS-A01',))}

def require(v,m):
 if not v: raise ValueError(m)
def load(p): return [json.loads(x) for x in p.read_text().splitlines() if x.strip()]
def digest(b): return 'sha256:'+hashlib.sha256(b).hexdigest()
def canon(v): return digest(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def git_blob(rev,path): return subprocess.run(['git','show',f'{rev}:{path}'],cwd=ROOT,check=True,capture_output=True).stdout
def manifest():
 out={}
 for line in MANIFEST.read_text().splitlines():
  if line.strip(): h,p=line.split('  ',1); out[p]=h
 return out
def search(uid,catalog):
 return sorted(aid for aid,a in catalog.items() if any(q in (ARCH/a['source_path']).read_text(errors='replace') for q in QUERIES[uid]))
def coverage(uid,records):
 inv=ATOMS[uid]; ids=[x['atom_id'] for x in inv]; rr=[r for r in records if r['unit_candidate_id']==uid]
 contract=sorted({a for r in rr if r['artifact_evidence_kind']=='requirement' and r['semantic_link_status']=='confirmed' for a in r['covered_requirement_atom_ids']})
 design=sorted({a for r in rr if r['artifact_evidence_kind']=='design' for a in r['covered_requirement_atom_ids']})
 implc=sorted({a for r in rr if r['artifact_evidence_kind']=='implementation_source' and r['semantic_link_status']=='confirmed' for a in r['covered_requirement_atom_ids']})
 implu=sorted({a for r in rr if r['artifact_evidence_kind']=='implementation_source' and r['semantic_link_status']=='unresolved' for a in r['covered_requirement_atom_ids']}-set(implc))
 shared=sorted(x['atom_id'] for x in inv if x['shared_with_units']); exclusive=sorted(set(ids)-set(shared)); uncovered=sorted(set(ids)-set(implc)-set(implu)); noe=sorted(set(ids)-set(design)-set(implc)-set(implu))
 result={'atom_inventory':inv,'connective_fragments':[],'contract_confirmed_atom_ids':contract,'design_partial_atom_ids':design,'implementation_confirmed_atom_ids':implc,'implementation_unresolved_atom_ids':implu,'implementation_uncovered_atom_ids':uncovered,'no_evidence_atom_ids':noe,'shared_atom_ids':shared,'product_exclusive_atom_ids':exclusive}
 for k in list(result): result[k+'_sha256']=canon(result[k])
 result.update(contract_semantic_edge_coverage_complete=set(contract)==set(ids),semantic_edge_coverage_complete=not implu and not uncovered,no_shared_source_span=not shared,product_boundary_decision_complete=False,product_exclusive_contract_coverage_complete=bool(exclusive) and set(exclusive)<=set(contract))
 return result

def main():
 records=load(LEDGER); meta=json.loads(META.read_text()); catalog={x['asset_id']:x for x in load(CATALOG)}; cross={x['unit_candidate_id']:x for x in load(CROSS)}; decomp={u['unit_candidate_id']:u for d in load(DECOMP) for u in d['candidate_units']}; mani=manifest()
 meta_fields={'schema_revision','status','authority_effect','source_revision','batch_id','parent_revision','legacy_execution_performed','consumer_closure_status','new_build_allowed','record_count','output_sha256','inputs','prior_review_batches','reviewed_edges','reviewed_unit_ids','cumulative_reviewed_edge_count','cumulative_reviewed_unit_count','semantic_link_counts','bounded_search_receipts','unit_aggregates'}
 require(set(meta)==meta_fields,'meta field集合不一致')
 require(meta['schema_revision']==6 and meta['status']=='research_premise_candidate','schema/status不一致')
 require(meta['parent_revision']=='04ec8370bfadc8a88aeede3e248499f5507107e6','parent revision不一致')
 require(meta['authority_effect']=='none' and not meta['legacy_execution_performed'] and not meta['new_build_allowed'] and meta['consumer_closure_status']=='pending','authority/実行/closure過大主張')
 require(len(records)==meta['record_count']==9 and digest(LEDGER.read_bytes())==meta['output_sha256'],'ledger件数/digest不一致')
 paths=[MANIFEST,CATALOG,CROSS,DECOMP,PHASE]+[p for pair in PRIOR for p in pair]
 inputs={str(p.relative_to(ROOT)):digest(p.read_bytes()) for p in paths}; require(meta['inputs']==inputs,'入力digest不一致')
 for path,sha in inputs.items(): require(digest(git_blob(meta['parent_revision'],path))==sha,f'親revision入力不一致: {path}')
 edges={(r['unit_candidate_id'],r['asset_id']) for r in records}; require(edges==set(DECISIONS) and len(edges)==9,'edge exact set不一致')
 require({(x['unit_candidate_id'],x['asset_id']) for x in meta['reviewed_edges']}==edges and set(meta['reviewed_unit_ids'])==set(ATOMS),'meta対象集合不一致')
 amap={u:{a['atom_id']:a for a in xs} for u,xs in ATOMS.items()}; searches={u:search(u,catalog) for u in ATOMS}
 for r in records:
  uid=r['unit_candidate_id']; rid=r['review_id']; a=catalog[r['asset_id']]; unit=cross[uid]
  record_fields={'artifact_evidence_kind','asset_id','authority_effect','batch_id','bounded_search_query','candidate_membership_semantics','candidate_phase_targets','candidate_product_targets','catalog_legacy_implementation_status','classification_id','consumer_closure_evidence','consumer_closure_status','counterevidence','coverage','covered_requirement_atom_ids','covered_requirement_atoms','current_requirement_implementation_status','evidence_atom_bindings','evidence_refs','legacy_asset_evidence_state','legacy_execution_status','legacy_requirement_implementation_contribution','new_build_allowed','observed_consumer_refs','phase_authority_status','phase_candidates','product_alignment_status','product_scope','review_id','review_scope','schema_revision','selection_route','semantic_link_status','semantic_relation','source_path','source_requirement_id','source_sha256','source_statement_semantic_digest','source_text_spans','unit_candidate_id','unresolved'}
  require(set(r)==record_fields,f'record field集合不一致: {rid}')
  require((r['semantic_link_status'],r['semantic_relation'],tuple(r['covered_requirement_atom_ids']))==DECISIONS[(uid,r['asset_id'])],f'判定不一致: {rid}')
  require(r['schema_revision']==6 and r['selection_route']=='bounded_global_search' and r['candidate_membership_semantics']=='bounded_global_search_candidate_only_not_semantic_evidence',f'schema/search authority不一致: {rid}')
  require(r['bounded_search_query']=={'match_mode':'archive_file_contains_any_utf8_anchor','anchors':QUERIES[uid]} and r['asset_id'] in searches[uid],f'bounded search不一致: {rid}')
  require(r['phase_candidates']==unit['direct_phase_candidates'] and r['phase_candidates'] and r['phase_authority_status']=='candidate_unchanged',f'phase authority不一致: {rid}')
  for k in ('source_requirement_id','source_statement_semantic_digest','source_text_spans','product_scope'): require(r[k]==unit[k],f'unit転記不一致 {k}: {rid}')
  mapping={'classification_id':'classification_id','source_path':'source_path','source_sha256':'source_sha256','artifact_evidence_kind':'artifact_evidence_kind','legacy_asset_evidence_state':'implementation_evidence_state','catalog_legacy_implementation_status':'legacy_implementation_status','candidate_phase_targets':'candidate_phase_targets','candidate_product_targets':'candidate_product_targets','observed_consumer_refs':'consumer_refs'}
  for out,src in mapping.items(): require(r[out]==a[src],f'catalog join不一致 {out}: {rid}')
  require(hashlib.sha256((ARCH/r['source_path']).read_bytes()).hexdigest()==r['source_sha256']==mani[r['source_path']],f'archive digest不一致: {rid}')
  require(r['legacy_execution_status']=='not_run' and r['current_requirement_implementation_status']=='not_established' and r['consumer_closure_status']=='pending' and not r['consumer_closure_evidence'] and not r['new_build_allowed'],f'実装/closure過大主張: {rid}')
  ids=r['covered_requirement_atom_ids']; require(len(ids)==len(set(ids)) and r['covered_requirement_atoms']==[amap[uid][x] for x in ids],f'atom binding不一致: {rid}')
  excerpts=[]; relations=set()
  for e in r['evidence_refs']:
   require(e['archive_path']==str((ARCH/r['source_path']).relative_to(ROOT)),f'evidence path不一致: {rid}')
   lines=(ROOT/e['archive_path']).read_text().splitlines(); text='\n'.join(lines[e['line_start']-1:e['line_end']])+'\n'; require(digest(text.encode())==e['excerpt_sha256'],f'引用digest不一致: {rid}'); excerpts.append(text); relations.add(e['source_requirement_relation'])
  expected={'same_requirement_id_exact_source_contract_not_implementation':'same_requirement_id_exact_restatement','design_contract_evidence':'design_contract_evidence','partial_implementation_behavior_evidence_unexecuted':'partial_implementation_behavior_evidence_unexecuted'}[r['semantic_relation']]
  require(relations=={expected},f'evidence relation不一致: {rid}')
  if expected=='same_requirement_id_exact_restatement': require(r['artifact_evidence_kind']=='requirement' and r['semantic_link_status']=='confirmed','要求snapshot境界不一致')
  if expected=='design_contract_evidence': require(r['artifact_evidence_kind']=='design' and r['semantic_link_status']=='unresolved','designを実装算入')
  if expected=='partial_implementation_behavior_evidence_unexecuted': require(r['artifact_evidence_kind']=='implementation_source' and r['semantic_link_status']=='unresolved','未確定sourceを実装確定')
  contribution={'same_requirement_id_exact_source_contract_not_implementation':'contract_only_no_implementation_claim','design_contract_evidence':'design_contract_only_no_implementation_claim','partial_implementation_behavior_evidence_unexecuted':'partial_static_implementation_candidate_unresolved_no_implementation_claim'}[r['semantic_relation']]
  require(r['legacy_requirement_implementation_contribution']==contribution,f'実装contribution不一致: {rid}')
  bound=[]
  for b in r['evidence_atom_bindings']:
   require(b['atom_id'] in ids and b['evidence_ref_indexes'] and all(0<=i<len(excerpts) for i in b['evidence_ref_indexes']),f'binding index不一致: {rid}')
   joined='\n'.join(excerpts[i] for i in b['evidence_ref_indexes']); require(all(t in joined for t in b['required_terms']),f'required term欠落: {rid}/{b["atom_id"]}')
   if b['match_mode']=='literal_source_fragment': require(all(f in joined for f in amap[uid][b['atom_id']]['source_fragments']),f'literal atom欠落: {rid}')
   else: require(b['match_mode']=='controlled_term_set_partial' and all(x in ''.join(amap[uid][b['atom_id']]['source_fragments']) for x in b['source_fragment_anchors']),f'partial anchor不一致: {rid}')
   bound.append(b['atom_id'])
  require(sorted(bound)==sorted(ids),f'covered atom/binding不一致: {rid}')
 for uid,inv in ATOMS.items():
  statement=' '.join(cross[uid]['source_text_spans']); require(all(f in statement for a in inv for f in a['source_fragments']),f'atom source span外: {uid}')
  # Atom fragmentを除去した残りは日本語助詞・区切りだけでなければならない。
  remain=statement
  for a in inv:
   for f in a['source_fragments']: remain=remain.replace(f,'')
  remain=re.sub(r'[\s。、・]','',remain); require(remain in {'','を'},f'atom無損失被覆不一致: {uid}: {remain}')
  overlaps=decomp[uid].get('shared_source_overlaps',[])
  for atom in inv:
   peers=set(atom['shared_with_units']); containers=[x for x in overlaps if all(f in x['source_text'] for f in atom['source_fragments'])]
   if peers:
    require(containers and all(x['review_state']==atom['boundary_review_state'] for x in containers),f'shared span不一致: {uid}')
    actual={u for u,d in decomp.items() if u!=uid and any(any(f in x['source_text'] for x in d.get('shared_source_overlaps',[])) for f in atom['source_fragments'])}; require(peers==actual,f'shared peer不一致: {uid}')
   else: require(not containers,f'exclusive atomがshared span: {uid}')
  selected=sorted(a for u,a in edges if u==uid); remaining=sorted(set(searches[uid])-set(selected)); expected={'query':{'match_mode':'archive_file_contains_any_utf8_anchor','anchors':QUERIES[uid]},'catalog_record_count':len(catalog),'candidate_asset_count':len(searches[uid]),'candidate_asset_ids_sha256':canon(searches[uid]),'selected_asset_ids':selected,'unreviewed_asset_count':len(remaining),'unreviewed_asset_ids_sha256':canon(remaining)}
  require(meta['bounded_search_receipts'][uid]==expected,f'bounded search receipt不一致: {uid}')
 aggregates={x['unit_candidate_id']:x for x in meta['unit_aggregates']}; require(set(aggregates)==set(ATOMS),'aggregate unit不一致')
 for uid,a in aggregates.items():
  aggregate_fields={'unit_candidate_id','product_scope','reviewed_edge_count','semantic_link_counts','atom_coverage_receipt','phase_authority_status','phase_capability_assessments','current_requirement_implementation_status','legacy_requirement_implementation_status','degradation_assessment','direct_confirmed_implementation_asset_ids','consumer_closure_status','new_build_allowed'}
  require(set(a)==aggregate_fields,f'aggregate field集合不一致: {uid}')
  rr=[r for r in records if r['unit_candidate_id']==uid]; require(a['atom_coverage_receipt']==coverage(uid,records),f'coverage receipt不一致: {uid}')
  require(a['phase_authority_status']=='candidate_unchanged','phase authority status不一致')
  expected_phase=[{k:x[k] for k in ('phase_id','current_status','legacy_capability_status','transition_assessment')} for x in cross[uid]['phase_capability_evidence']]
  require(a['phase_capability_assessments']==expected_phase and {x['phase_id'] for x in expected_phase}==set(cross[uid]['direct_phase_candidates']),f'phase状態転記不一致: {uid}')
  c=a['atom_coverage_receipt']; require(c['no_shared_source_span']==(not c['shared_atom_ids']) and not c['product_boundary_decision_complete'],f'製品境界過大主張: {uid}')
  require(a['semantic_link_counts']=={s:sum(r['semantic_link_status']==s for r in rr) for s in ('confirmed','rejected','unresolved')},f'unit count不一致: {uid}')
  require(a['current_requirement_implementation_status']=='not_established' and a['legacy_requirement_implementation_status'].startswith('unknown_') and not a['direct_confirmed_implementation_asset_ids'] and a['consumer_closure_status']=='pending' and not a['new_build_allowed'],'aggregate実装過大主張')
  require(a['degradation_assessment']=='unresolved_legacy_implementation_unknown',f'unknown状態で縮退先断定: {uid}')
 counts={s:sum(r['semantic_link_status']==s for r in records) for s in ('confirmed','rejected','unresolved')}; require(meta['semantic_link_counts']==counts=={'confirmed':3,'rejected':0,'unresolved':6},'batch count不一致')
 prior_edges=set(); prior_units=set(); batches=[]
 for lp,mp in PRIOR:
  m=json.loads(mp.read_text()); prior_edges|={(x['unit_candidate_id'],x['asset_id']) for x in m['reviewed_edges']}; prior_units|=set(m['reviewed_unit_ids']); batches.append({'batch_id':m['batch_id'],'ledger_sha256':digest(lp.read_bytes()),'meta_sha256':digest(mp.read_bytes())})
 require(not edges&prior_edges and meta['prior_review_batches']==batches,'prior wave束縛/edge重複')
 require(meta['cumulative_reviewed_edge_count']==len(prior_edges|edges)==33 and meta['cumulative_reviewed_unit_count']==len(prior_units|set(ATOMS))==11,'累積件数不一致')
 text=STATUS.read_text(); batch=re.search(r'218要求unitのうち新たに(\d+) unit、候補edge (\d+)件',text); cumulative=re.search(r'wave 1〜3と合わせて(\d+) unit、(\d+) edge',text); remaining=re.search(r'残る(\d+) unitは未着手',text)
 require(batch and [int(x) for x in batch.groups()]==[3,9] and cumulative and [int(x) for x in cumulative.groups()]==[11,33] and remaining and int(remaining.group(1))==207,'status件数不一致')
 forbidden={'implemented','tested','operational'}; require(not forbidden&set(re.findall(r'`([^`\n]+)`',text)),'status過大状態語')
 table=[[c.strip().strip('`') for c in line.strip('|').split('|')] for line in text.splitlines() if line.startswith('|')]
 for uid,a in aggregates.items():
  state=[r for r in table if len(r)==6 and r[1]==uid]; require(len(state)==1 and state[0][3:]==[a['legacy_requirement_implementation_status'],a['current_requirement_implementation_status'],a['degradation_assessment']],f'status状態行不一致: {uid}')
  atom=[r for r in table if len(r)==8 and r[0]==uid]; require(len(atom)==1,'status atom行不一致')
  c=a['atom_coverage_receipt']; expected=[len(c[k]) for k in ('atom_inventory','contract_confirmed_atom_ids','design_partial_atom_ids','implementation_confirmed_atom_ids','implementation_unresolved_atom_ids','implementation_uncovered_atom_ids','no_evidence_atom_ids')]; require([int(x) for x in atom[0][1:]]==expected,f'status atom件数不一致: {uid}')
 print('legacy requirement direct semantic review wave4: schema6 / 9 edges / 6 atoms / bounded search + phase candidates verified')
if __name__=='__main__': main()
