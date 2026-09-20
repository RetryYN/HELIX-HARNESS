#!/usr/bin/env python3
"""wave 3 direct semantic reviewをarchive実行なしで静的検証する。"""
import hashlib, json, re, subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]; GOV=ROOT/'docs/governance'; ARCH=ROOT/'archive/legacy-generation-2026-09-14/root'
LEDGER=GOV/'legacy-requirement-direct-semantic-review-wave3.jsonl'; META=GOV/'legacy-requirement-direct-semantic-review-wave3.meta.json'
STATUS=GOV/'audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave3-status-2026-09-21.md'
CATALOG=GOV/'legacy-asset-phase-product-classification-bootstrap.jsonl'; CROSS=GOV/'legacy-requirement-implementation-crosswalk-bootstrap.jsonl'
DECOMP=GOV/'legacy-ir-product-unit-decomposition-bootstrap.jsonl'; MANIFEST=ROOT/'archive/legacy-generation-2026-09-14/MANIFEST.sha256'
PHASE=GOV/'phase-capability-inventory.json'; PRIOR=[(GOV/f'legacy-requirement-direct-semantic-review-wave{n}.jsonl',GOV/f'legacy-requirement-direct-semantic-review-wave{n}.meta.json') for n in (1,2)]

ATOMS={
'IRUNIT-HIL-FR-33-HELIX-HARNESS':[
 {'atom_id':'FR33-HARNESS-A01','kind':'coverage_scope','text':'Bun Dependency Coverage Gateが指定された全active surfaceからBun依存を抽出する','source_fragments':['Bun Dependency Coverage Gateはactive source/import/command/script/test/package/lockfile/CI/hook/template/setup/distributionからBun依存を抽出する'],'shared_with_units':[],'boundary_review_state':'product_boundary_pending_human_decision'},
 {'atom_id':'FR33-HARNESS-A02','kind':'allowlist_boundary','text':'historical/archiveだけを理由付きallowlist可能とする','source_fragments':['historical/archiveだけを理由付きallowlist可能とする'],'shared_with_units':[],'boundary_review_state':'product_boundary_pending_human_decision'},
 {'atom_id':'FR33-HARNESS-A03','kind':'ledger_output','text':'classified dependency ledgerを出力する','source_fragments':['classified dependency ledger'],'shared_with_units':[],'boundary_review_state':'product_boundary_pending_human_decision'}],
'IRUNIT-HIL-NFR-02-HELIX-HARNESS':[
 {'atom_id':'NFR02-HARNESS-A01','kind':'role_separation','text':'worker、verifier、knowledge promoterを分離する','source_fragments':['worker≠verifier≠knowledge promoterを維持し'],'shared_with_units':[],'boundary_review_state':'product_boundary_pending_human_decision'}],
'IRUNIT-HIL-NFR-03-HELIX-HARNESS':[
 {'atom_id':'NFR03-HARNESS-A01','kind':'reverse_workload','text':'全IssueのReverse処理量を省略しない','source_fragments':['全IssueのReverse処理量を省略しない'],'shared_with_units':[],'boundary_review_state':'product_boundary_pending_human_decision'},
 {'atom_id':'NFR03-HARNESS-A02','kind':'exemption_prohibition','text':'none/not-required/exempt指定を禁止する','source_fragments':['`none/not-required/exempt`'],'shared_with_units':[],'boundary_review_state':'product_boundary_pending_human_decision'},
 {'atom_id':'NFR03-HARNESS-A03','kind':'phase_skip_prohibition','text':'phase skipを禁止する','source_fragments':['phase skipを禁止し'],'shared_with_units':[],'boundary_review_state':'product_boundary_pending_human_decision'},
 {'atom_id':'NFR03-HARNESS-A04','kind':'budget_non_waiver','text':'budget到達で未完obligationを免除しない','source_fragments':['budget到達は未完obligationを免除せず'],'shared_with_units':['IRUNIT-HIL-NFR-03-HELIX-OS'],'boundary_review_state':'product_boundary_pending_human_decision'}]}
CONNECTIVES={u:[] for u in ATOMS}; CONNECTIVES['IRUNIT-HIL-NFR-03-HELIX-HARNESS']=['と']
QUERIES={
'IRUNIT-HIL-FR-33-HELIX-HARNESS':['HIL-FR-33','Bun Dependency Coverage Gate','BunDependencyClassifier','HIL_BUN_COVERAGE_INCOMPLETE','sqlite-driver-authority','legacy-runtime-marker'],
'IRUNIT-HIL-NFR-02-HELIX-HARNESS':['HIL-NFR-02','worker≠verifier≠knowledge promoter','KnowledgePromoter','HIL_MEMORY_PROMOTER_NOT_INDEPENDENT','memoryPromotionNudge'],
'IRUNIT-HIL-NFR-03-HELIX-HARNESS':['HIL-NFR-03','全IssueのReverse処理量','HIL_REVERSE_OBLIGATION_MISSING','HIL_REVERSE_BUDGET_INCOMPLETE','HIL_REVERSE_PHASE_SKIP','collectReverseCandidates']}
DECISIONS={
('IRUNIT-HIL-FR-33-HELIX-HARNESS','LEGACY-ASSET-719D5EC9C06FC4AAD0FF'):('confirmed','same_requirement_id_exact_source_contract_not_implementation',('FR33-HARNESS-A01','FR33-HARNESS-A02','FR33-HARNESS-A03')),
('IRUNIT-HIL-FR-33-HELIX-HARNESS','LEGACY-ASSET-B6DC14C1DA937E3AC96C'):('unresolved','design_contract_evidence',('FR33-HARNESS-A01','FR33-HARNESS-A02','FR33-HARNESS-A03')),
('IRUNIT-HIL-FR-33-HELIX-HARNESS','LEGACY-ASSET-0BF6DB7D19D1B4CD3FD1'):('unresolved','partial_implementation_behavior_evidence_unexecuted',('FR33-HARNESS-A01',)),
('IRUNIT-HIL-NFR-02-HELIX-HARNESS','LEGACY-ASSET-719D5EC9C06FC4AAD0FF'):('confirmed','same_requirement_id_exact_source_contract_not_implementation',('NFR02-HARNESS-A01',)),
('IRUNIT-HIL-NFR-02-HELIX-HARNESS','LEGACY-ASSET-D65FB82C21C5EDBDFCE4'):('unresolved','design_contract_evidence',('NFR02-HARNESS-A01',)),
('IRUNIT-HIL-NFR-02-HELIX-HARNESS','LEGACY-ASSET-CF2CB803B354FE85E408'):('rejected','adjacent_implementation_nonmatching',()),
('IRUNIT-HIL-NFR-03-HELIX-HARNESS','LEGACY-ASSET-719D5EC9C06FC4AAD0FF'):('confirmed','same_requirement_id_exact_source_contract_not_implementation',('NFR03-HARNESS-A01','NFR03-HARNESS-A02','NFR03-HARNESS-A03','NFR03-HARNESS-A04')),
('IRUNIT-HIL-NFR-03-HELIX-HARNESS','LEGACY-ASSET-859CC5A61C21B67A3A96'):('unresolved','design_contract_evidence',('NFR03-HARNESS-A01','NFR03-HARNESS-A02','NFR03-HARNESS-A03','NFR03-HARNESS-A04')),
('IRUNIT-HIL-NFR-03-HELIX-HARNESS','LEGACY-ASSET-7AC1A074F37F1F3CD3D7'):('rejected','adjacent_implementation_nonmatching',())}

def require(v,m):
 if not v: raise ValueError(m)
def load(p): return [json.loads(x) for x in p.read_text().splitlines() if x.strip()]
def digest(b): return 'sha256:'+hashlib.sha256(b).hexdigest()
def canon(v): return digest(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def git_blob(rev,path): return subprocess.run(['git','show',f'{rev}:{path}'],cwd=ROOT,check=True,capture_output=True).stdout
def meaningful_uncovered(text,fragments):
 hit=[False]*len(text)
 for fragment in fragments:
  start=0
  while (i:=text.find(fragment,start))>=0:
   hit[i:i+len(fragment)]=[True]*len(fragment); start=i+1
 out=''.join(' ' if hit[i] or ch.isspace() or ch in '。、|`' else ch for i,ch in enumerate(text))
 return re.findall(r'\S+',out)
def manifest():
 result={}
 for line in MANIFEST.read_text().splitlines():
  if line.strip(): h,p=line.split('  ',1); result[p]=h
 return result
def search(uid,catalog):
 out=[]
 for aid,a in catalog.items():
  text=(ARCH/a['source_path']).read_text(errors='replace')
  if any(term in text for term in QUERIES[uid]): out.append(aid)
 return sorted(out)
def coverage(uid,records):
 inv=ATOMS[uid]; ids=[x['atom_id'] for x in inv]; rr=[r for r in records if r['unit_candidate_id']==uid]
 contract=sorted({a for r in rr if r['artifact_evidence_kind']=='requirement' and r['semantic_link_status']=='confirmed' for a in r['covered_requirement_atom_ids']})
 design=sorted({a for r in rr if r['artifact_evidence_kind']=='design' for a in r['covered_requirement_atom_ids']})
 implc=sorted({a for r in rr if r['artifact_evidence_kind']=='implementation_source' and r['semantic_link_status']=='confirmed' for a in r['covered_requirement_atom_ids']})
 implu=sorted({a for r in rr if r['artifact_evidence_kind']=='implementation_source' and r['semantic_link_status']=='unresolved' for a in r['covered_requirement_atom_ids']})
 uncovered=sorted(set(ids)-set(implc)-set(implu)); noe=sorted(set(ids)-set(design)-set(implc)-set(implu)); shared=sorted(x['atom_id'] for x in inv if x['shared_with_units']); exclusive=sorted(set(ids)-set(shared))
 result={'atom_inventory':inv,'connective_fragments':CONNECTIVES[uid],'contract_confirmed_atom_ids':contract,'design_partial_atom_ids':design,'implementation_confirmed_atom_ids':implc,'implementation_unresolved_atom_ids':implu,'implementation_uncovered_atom_ids':uncovered,'no_evidence_atom_ids':noe,'shared_atom_ids':shared,'product_exclusive_atom_ids':exclusive}
 for k in list(result): result[k+'_sha256']=canon(result[k])
 result.update(contract_semantic_edge_coverage_complete=set(contract)==set(ids),semantic_edge_coverage_complete=not implu and not uncovered,product_boundary_resolution_complete=not any(x['boundary_review_state']=='product_boundary_pending_human_decision' for x in inv),product_exclusive_contract_coverage_complete=bool(exclusive) and set(exclusive)<=set(contract))
 return result

def main():
 records=load(LEDGER); meta=json.loads(META.read_text()); catalog={x['asset_id']:x for x in load(CATALOG)}; cross={x['unit_candidate_id']:x for x in load(CROSS)}; decomp={u['unit_candidate_id']:u for d in load(DECOMP) for u in d['candidate_units']}; mani=manifest()
 meta_fields={'schema_revision','status','authority_effect','source_revision','batch_id','parent_revision','legacy_execution_performed','consumer_closure_status','new_build_allowed','record_count','output_sha256','inputs','prior_review_batches','reviewed_edges','reviewed_unit_ids','cumulative_reviewed_edge_count','cumulative_reviewed_unit_count','semantic_link_counts','bounded_search_receipts','unit_aggregates'}
 require(set(meta)==meta_fields,'meta field集合不一致')
 require(meta['schema_revision']==5 and meta['status']=='research_premise_candidate','schema/status不一致')
 require(meta['authority_effect']=='none' and not meta['legacy_execution_performed'] and not meta['new_build_allowed'] and meta['consumer_closure_status']=='pending','authority/実行/closure過大主張')
 require(len(records)==meta['record_count']==9 and digest(LEDGER.read_bytes())==meta['output_sha256'],'ledger件数/digest不一致')
 paths=[MANIFEST,CATALOG,CROSS,DECOMP,PHASE]+[p for pair in PRIOR for p in pair]
 inputs={str(p.relative_to(ROOT)):digest(p.read_bytes()) for p in paths}; require(meta['inputs']==inputs,'入力digest不一致')
 for path,sha in inputs.items(): require(digest(git_blob(meta['parent_revision'],path))==sha,f'親revision入力不一致: {path}')
 edges={(r['unit_candidate_id'],r['asset_id']) for r in records}; require(edges==set(DECISIONS) and len(edges)==9,'edge exact set不一致')
 require({(x['unit_candidate_id'],x['asset_id']) for x in meta['reviewed_edges']}==edges and set(meta['reviewed_unit_ids'])==set(ATOMS),'meta対象集合不一致')
 amap={u:{a['atom_id']:a for a in atoms} for u,atoms in ATOMS.items()}
 searches={u:search(u,catalog) for u in ATOMS}
 for r in records:
  uid=r['unit_candidate_id']; rid=r['review_id']; a=catalog[r['asset_id']]; unit=cross[uid]
  record_fields={'artifact_evidence_kind','asset_id','authority_effect','batch_id','bounded_search_query','candidate_membership_semantics','candidate_phase_targets','candidate_product_targets','catalog_legacy_implementation_status','classification_id','consumer_closure_evidence','consumer_closure_status','counterevidence','coverage','covered_requirement_atom_ids','covered_requirement_atoms','current_requirement_implementation_status','evidence_atom_bindings','evidence_refs','legacy_asset_evidence_state','legacy_execution_status','legacy_requirement_implementation_contribution','new_build_allowed','observed_consumer_refs','phase_authority_status','phase_candidates','product_alignment_status','product_scope','review_id','review_scope','schema_revision','selection_route','semantic_link_status','semantic_relation','source_path','source_requirement_id','source_sha256','source_statement_semantic_digest','source_text_spans','unit_candidate_id','unresolved'}
  require(set(r)==record_fields,f'record field集合不一致: {rid}')
  require((r['semantic_link_status'],r['semantic_relation'],tuple(r['covered_requirement_atom_ids']))==DECISIONS[(uid,r['asset_id'])],f'判定不一致: {rid}')
  require(r['schema_revision']==5 and r['selection_route']=='bounded_global_search' and r['review_scope']=='unit_asset_edge',f'schema/route不一致: {rid}')
  require(r['bounded_search_query']=={'match_mode':'archive_file_contains_any_utf8_anchor','anchors':QUERIES[uid]} and r['asset_id'] in searches[uid],f'bounded search不一致: {rid}')
  require(r['phase_candidates']==unit['direct_phase_candidates']==[] and r['phase_authority_status']=='unresolved_no_direct_phase_candidate',f'phase authority偽装: {rid}')
  require(unit['candidate_asset_pool']['phase_candidate_asset_ids']==[],'crosswalk phase pool非空')
  require(r['candidate_membership_semantics']=='bounded_global_search_candidate_only_not_semantic_evidence','search membership過大主張')
  for k in ('source_requirement_id','source_statement_semantic_digest','source_text_spans','product_scope'): require(r[k]==unit[k],f'unit転記不一致 {k}: {rid}')
  mapping={'classification_id':'classification_id','source_path':'source_path','source_sha256':'source_sha256','artifact_evidence_kind':'artifact_evidence_kind','legacy_asset_evidence_state':'implementation_evidence_state','catalog_legacy_implementation_status':'legacy_implementation_status','candidate_phase_targets':'candidate_phase_targets','candidate_product_targets':'candidate_product_targets','observed_consumer_refs':'consumer_refs'}
  for out,src in mapping.items(): require(r[out]==a[src],f'catalog join不一致 {out}: {rid}')
  require(hashlib.sha256((ARCH/r['source_path']).read_bytes()).hexdigest()==r['source_sha256']==mani[r['source_path']],f'archive digest不一致: {rid}')
  require(r['legacy_execution_status']=='not_run' and r['current_requirement_implementation_status']=='not_established' and r['consumer_closure_status']=='pending' and not r['consumer_closure_evidence'] and not r['new_build_allowed'],f'実装/closure過大主張: {rid}')
  ids=r['covered_requirement_atom_ids']; require(len(ids)==len(set(ids)) and r['covered_requirement_atoms']==[amap[uid][x] for x in ids],f'atom binding不一致: {rid}')
  if r['semantic_link_status']=='rejected': require(not ids and not r['evidence_atom_bindings'] and r['counterevidence'],f'rejected境界不一致: {rid}')
  excerpts=[]; relations=set()
  for e in r['evidence_refs']:
   require(e['archive_path']==str((ARCH/r['source_path']).relative_to(ROOT)),f'evidence path不一致: {rid}')
   lines=(ROOT/e['archive_path']).read_text().splitlines(); require(1<=e['line_start']<=e['line_end']<=len(lines),f'引用range不一致: {rid}')
   text='\n'.join(lines[e['line_start']-1:e['line_end']])+'\n'; require(digest(text.encode())==e['excerpt_sha256'],f'引用digest不一致: {rid}'); excerpts.append(text); relations.add(e['source_requirement_relation'])
  expected_relation={'same_requirement_id_exact_source_contract_not_implementation':'same_requirement_id_exact_restatement','design_contract_evidence':'design_contract_evidence','partial_implementation_behavior_evidence_unexecuted':'partial_implementation_behavior_evidence_unexecuted','adjacent_implementation_nonmatching':'adjacent_implementation_nonmatching'}[r['semantic_relation']]
  require(relations=={expected_relation},f'evidence relation不一致: {rid}')
  if expected_relation=='same_requirement_id_exact_restatement': require(r['artifact_evidence_kind']=='requirement' and r['semantic_link_status']=='confirmed',f'要求artifact境界不一致: {rid}')
  if expected_relation=='design_contract_evidence': require(r['artifact_evidence_kind']=='design' and r['semantic_link_status']=='unresolved',f'designを実装算入: {rid}')
  if expected_relation in {'partial_implementation_behavior_evidence_unexecuted','adjacent_implementation_nonmatching'}: require(r['artifact_evidence_kind']=='implementation_source',f'実装relation artifact不一致: {rid}')
  bound=[]
  for b in r['evidence_atom_bindings']:
   require(b['atom_id'] in ids and b['evidence_ref_indexes'] and all(0<=i<len(excerpts) for i in b['evidence_ref_indexes']),f'binding index不一致: {rid}')
   joined='\n'.join(excerpts[i] for i in b['evidence_ref_indexes']); require(all(t in joined for t in b['required_terms']),f'required term欠落: {rid}/{b["atom_id"]}')
   require(b['match_mode'] in {'literal_source_fragment','controlled_term_set_partial'},f'match mode不一致: {rid}')
   if b['match_mode']=='literal_source_fragment': require(all(f in joined for f in amap[uid][b['atom_id']]['source_fragments']),f'literal atom欠落: {rid}')
   else:
    anchors=b.get('source_fragment_anchors',[]); fragments=''.join(amap[uid][b['atom_id']]['source_fragments']); require(anchors and all(x in fragments and any(x in t for t in b['required_terms']) for x in anchors),f'partial anchor不一致: {rid}')
   bound.append(b['atom_id'])
  require(sorted(bound)==sorted(ids),f'covered atom/binding不一致: {rid}')
 for uid,atoms in ATOMS.items():
  statement=' '.join(cross[uid]['source_text_spans']); fragments=[f for a in atoms for f in a['source_fragments']]+CONNECTIVES[uid]
  require(not meaningful_uncovered(statement,fragments),f'atom無損失被覆不一致: {uid}: {meaningful_uncovered(statement,fragments)}')
  overlap={x['source_text']:x for x in decomp[uid].get('shared_source_overlaps',[])}
  for atom in atoms:
   if atom['shared_with_units']:
    f=atom['source_fragments'][0]; require(f in overlap and overlap[f]['review_state']==atom['boundary_review_state'],'shared span不一致')
    peers={u for u,d in decomp.items() if u!=uid and any(x['source_text']==f for x in d.get('shared_source_overlaps',[]))}; require(set(atom['shared_with_units'])==peers,'shared peer不一致')
   else: require(all(f not in overlap for f in atom['source_fragments']),'exclusive atomがshared span')
  receipt=meta['bounded_search_receipts'][uid]; selected=sorted(a for u,a in edges if u==uid); remaining=sorted(set(searches[uid])-set(selected))
  expected={'query':{'match_mode':'archive_file_contains_any_utf8_anchor','anchors':QUERIES[uid]},'catalog_record_count':len(catalog),'candidate_asset_count':len(searches[uid]),'candidate_asset_ids_sha256':canon(searches[uid]),'selected_asset_ids':selected,'unreviewed_asset_count':len(remaining),'unreviewed_asset_ids_sha256':canon(remaining)}
  require(receipt==expected,f'bounded search receipt不一致: {uid}')
 aggregates={x['unit_candidate_id']:x for x in meta['unit_aggregates']}; require(set(aggregates)==set(ATOMS),'aggregate unit不一致')
 for uid,a in aggregates.items():
  require(set(a)=={'unit_candidate_id','product_scope','reviewed_edge_count','semantic_link_counts','atom_coverage_receipt','phase_authority_status','phase_capability_assessments','current_requirement_implementation_status','legacy_requirement_implementation_status','degradation_assessment','direct_confirmed_implementation_asset_ids','consumer_closure_status','new_build_allowed'},f'aggregate field集合不一致: {uid}')
  rr=[r for r in records if r['unit_candidate_id']==uid]; require(a['atom_coverage_receipt']==coverage(uid,records),f'coverage receipt不一致: {uid}')
  require(a['semantic_link_counts']=={s:sum(r['semantic_link_status']==s for r in rr) for s in ('confirmed','rejected','unresolved')},f'unit count不一致: {uid}')
  require(a['phase_authority_status']=='unresolved_no_direct_phase_candidate' and a['phase_capability_assessments']==[] and a['current_requirement_implementation_status']=='not_established' and a['legacy_requirement_implementation_status'].startswith('unknown_') and not a['direct_confirmed_implementation_asset_ids'] and a['consumer_closure_status']=='pending' and not a['new_build_allowed'],f'aggregate過大主張: {uid}')
 counts={s:sum(r['semantic_link_status']==s for r in records) for s in ('confirmed','rejected','unresolved')}; require(meta['semantic_link_counts']==counts=={'confirmed':3,'rejected':2,'unresolved':4},'batch count不一致')
 prior_edges=set(); prior_units=set(); batches=[]
 for n,(lp,mp) in enumerate(PRIOR,1):
  m=json.loads(mp.read_text()); prior_edges|={(x['unit_candidate_id'],x['asset_id']) for x in m['reviewed_edges']}; prior_units|=set(m['reviewed_unit_ids']); batches.append({'batch_id':m['batch_id'],'ledger_sha256':digest(lp.read_bytes()),'meta_sha256':digest(mp.read_bytes())})
 require(not edges&prior_edges and meta['prior_review_batches']==batches,'prior wave束縛/edge重複')
 require(meta['cumulative_reviewed_edge_count']==len(prior_edges|edges)==24 and meta['cumulative_reviewed_unit_count']==len(prior_units|set(ATOMS))==8,'累積件数不一致')
 text=STATUS.read_text(); require('218要求unitのうち新たに3 unit、候補edge 9件' in text and 'wave 1・2と合わせて8 unit、24 edge' in text and '残る210 unitは未着手' in text,'status累積文不一致')
 table=[]
 for line in text.splitlines():
  if line.startswith('|'): table.append([c.strip().strip('`') for c in line.strip('|').split('|')])
 for uid,a in aggregates.items():
  state=[r for r in table if len(r)==6 and r[1]==uid]; require(len(state)==1 and state[0][3]==a['legacy_requirement_implementation_status'] and state[0][4]==a['current_requirement_implementation_status'] and state[0][5]==a['degradation_assessment'],f'status状態行不一致: {uid}')
  atom=[r for r in table if len(r)==8 and r[0]==uid]; require(len(atom)==1,'status atom行不一致')
  c=a['atom_coverage_receipt']; expected=[len(c[k]) for k in ('atom_inventory','contract_confirmed_atom_ids','design_partial_atom_ids','implementation_confirmed_atom_ids','implementation_unresolved_atom_ids','implementation_uncovered_atom_ids','no_evidence_atom_ids')]; require([int(x) for x in atom[0][1:]]==expected,f'status atom件数不一致: {uid}')
 print('legacy requirement direct semantic review wave3: schema5 / 9 edges / 8 atoms / bounded search verified')
if __name__=='__main__': main()
