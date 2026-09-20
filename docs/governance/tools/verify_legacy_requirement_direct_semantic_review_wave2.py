#!/usr/bin/env python3
"""旧要求unit×assetのdirect semantic review wave 2を独立検証する。"""
from __future__ import annotations
import hashlib,json,re,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]; GOV=ROOT/'docs/governance'
LEDGER=GOV/'legacy-requirement-direct-semantic-review-wave2.jsonl'; META=GOV/'legacy-requirement-direct-semantic-review-wave2.meta.json'
PRIOR_LEDGER=GOV/'legacy-requirement-direct-semantic-review-wave1.jsonl'; PRIOR_META=GOV/'legacy-requirement-direct-semantic-review-wave1.meta.json'
STATUS=GOV/'audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave2-status-2026-09-21.md'
CROSSWALK=GOV/'legacy-requirement-implementation-crosswalk-bootstrap.jsonl'; CATALOG=GOV/'legacy-asset-phase-product-classification-bootstrap.jsonl'; MANIFEST=ROOT/'archive/legacy-generation-2026-09-14/MANIFEST.sha256'
ARCHIVE_PREFIX='archive/legacy-generation-2026-09-14/root/'
EXPECTED_ATOMS={
 'IRUNIT-HIL-FR-06-HELIX-HARNESS':[
  {'atom_id':'FR06-HARNESS-A01','kind':'scope_authority','text':'Scope Gateの変更許可・non-goal・PO-bound capability budget','source_fragments':['Scope Gateはallowed changes、non-goals、PO-bound capability budget']},
  {'atom_id':'FR06-HARNESS-A02','kind':'diff_trace','text':'requirement→symbol→test traceを実diffと照合する','source_fragments':['requirement→symbol→test traceを実diffと照合する']},
  {'atom_id':'FR06-HARNESS-A03','kind':'derivation_guard','text':'derived HIL IDに親oracleへのderivationとminimum-necessary proofを要求する','source_fragments':['derived HIL IDは自己正当化に使えず、chat/L0/PO-approved parent oracleへのderivationとminimum-necessary proofを要求する']},
  {'atom_id':'FR06-HARNESS-A04','kind':'inherited_scope_authority','text':'子Issueが同じscope authorityを継承する','source_fragments':['子Issueも同じscope authorityを継承する']},
  {'atom_id':'FR06-HARNESS-A05','kind':'violation_output','text':'scope violationとunjustified capability一覧を出力する','source_fragments':['scope violation、unjustified capability一覧']}],
 'IRUNIT-HIL-FR-06-HELIX-OS':[
  {'atom_id':'FR06-OS-A01','kind':'scope_authority','text':'Scope Gateの変更許可・non-goal・PO-bound capability budget','source_fragments':['Scope Gateはallowed changes、non-goals、PO-bound capability budget']},
  {'atom_id':'FR06-OS-A02','kind':'diff_trace','text':'requirement→symbol→test traceを実diffと照合する','source_fragments':['requirement→symbol→test traceを実diffと照合する']},
  {'atom_id':'FR06-OS-A03','kind':'inherited_scope_authority','text':'子Issueが同じscope authorityを継承する','source_fragments':['子Issueも同じscope authorityを継承する']}],
 'IRUNIT-HIL-BR-12-HELIX-OS':[
  {'atom_id':'BR12-OS-A01','kind':'intake_source','text':'GitHub Issueを入力に含める','source_fragments':['GitHub由来のIssue']},
  {'atom_id':'BR12-OS-A02','kind':'intake_source','text':'GitHub PRを入力に含める','source_fragments':['/PR']},
  {'atom_id':'BR12-OS-A03','kind':'intake_source','text':'GitHub CI eventを入力に含める','source_fragments':['/CI event']},
  {'atom_id':'BR12-OS-A04','kind':'intake_source','text':'ユーザー差し込みIssueを入力に含める','source_fragments':['とユーザー差し込みIssue']},
  {'atom_id':'BR12-OS-A05','kind':'intake_source','text':'ユーザー差し込みPLANを入力に含める','source_fragments':['/PLAN']},
  {'atom_id':'BR12-OS-A06','kind':'normalization','text':'全入力を同じintake契約へ正規化する','source_fragments':['を同じintake契約へ正規化し']}]
}
IGNORABLE_COVERAGE_CHARS=set(" \t\r\n、。，．・；;:：|（）()「」『』［］[]【】<>＜＞`'\"")
EXPECTED_DECISIONS={
 ('IRUNIT-HIL-FR-06-HELIX-HARNESS','LEGACY-ASSET-719D5EC9C06FC4AAD0FF'):('confirmed','same_requirement_id_exact_source_contract_not_implementation',('FR06-HARNESS-A01','FR06-HARNESS-A02','FR06-HARNESS-A03','FR06-HARNESS-A04','FR06-HARNESS-A05')),
 ('IRUNIT-HIL-FR-06-HELIX-HARNESS','LEGACY-ASSET-D6339A02201B20481C3F'):('rejected','canonical_shadow_promotion_not_fr06_scope_gate',()),
 ('IRUNIT-HIL-FR-06-HELIX-HARNESS','LEGACY-ASSET-F17ABDB90E1340D09746'):('unresolved','human_agreement_l3_gate_partial_scope_authority_only',('FR06-HARNESS-A01',)),
 ('IRUNIT-HIL-FR-06-HELIX-OS','LEGACY-ASSET-719D5EC9C06FC4AAD0FF'):('confirmed','same_requirement_id_exact_source_contract_not_implementation',('FR06-OS-A01','FR06-OS-A02','FR06-OS-A03')),
 ('IRUNIT-HIL-FR-06-HELIX-OS','LEGACY-ASSET-D6339A02201B20481C3F'):('rejected','canonical_shadow_promotion_not_fr06_scope_gate',()),
 ('IRUNIT-HIL-FR-06-HELIX-OS','LEGACY-ASSET-F17ABDB90E1340D09746'):('unresolved','human_agreement_l3_gate_partial_scope_authority_only',('FR06-OS-A01',)),
 ('IRUNIT-HIL-BR-12-HELIX-OS','LEGACY-ASSET-9229DCA8DB22144E2B96'):('unresolved','github_issue_pr_to_common_contract_partial_missing_ci_and_user_issue_plan',('BR12-OS-A01','BR12-OS-A02','BR12-OS-A06')),
 ('IRUNIT-HIL-BR-12-HELIX-OS','LEGACY-ASSET-B461238F0E82243729AD'):('rejected','post_intake_discovery_event_schema_not_ingress_normalization',()),
 ('IRUNIT-HIL-BR-12-HELIX-OS','LEGACY-ASSET-2F4C154611460DD55358'):('rejected','screen_registry_adapter_lifecycle_not_ingress_normalization',())}
EXPECTED_EDGES=set(EXPECTED_DECISIONS)
def require(ok,msg):
 if not ok: raise ValueError(msg)
def load_jsonl(p): return [json.loads(x) for x in p.read_text().splitlines() if x.strip()]
def digest_bytes(b): return 'sha256:'+hashlib.sha256(b).hexdigest()
def digest_file(p): return digest_bytes(p.read_bytes())
def canon_digest(v): return digest_bytes(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def git_blob(parent,path): return subprocess.run(['git','show',f'{parent}:{path}'],cwd=ROOT,check=True,capture_output=True).stdout
def manifest_entries():
 out={}
 for line in MANIFEST.read_text().splitlines():
  if line.strip(): d,p=line.split('  ',1); out[p]=d
 return out
def uncovered_meaningful_runs(statement,fragments):
 covered=[False]*len(statement)
 for fragment in fragments:
  start=0
  while True:
   index=statement.find(fragment,start)
   if index<0: break
   for position in range(index,index+len(fragment)): covered[position]=True
   start=index+1
 uncovered=''.join(' ' if covered[i] or c in IGNORABLE_COVERAGE_CHARS else c for i,c in enumerate(statement))
 return re.findall(r'\S+',uncovered)
def coverage_receipt(uid,records):
 inventory=EXPECTED_ATOMS[uid]; ids=[x['atom_id'] for x in inventory]
 rows=[r for r in records if r['unit_candidate_id']==uid]
 contract=sorted({a for r in rows if r['semantic_link_status']=='confirmed' and r['artifact_evidence_kind']=='requirement' and all(e['source_requirement_relation']=='same_requirement_id_exact_restatement' for e in r['evidence_refs']) for a in r['covered_requirement_atom_ids']})
 impl_confirmed=sorted({a for r in rows if r['semantic_link_status']=='confirmed' and r['artifact_evidence_kind']=='implementation_source' and all(e['source_requirement_relation']=='implementation_behavior_evidence' for e in r['evidence_refs']) for a in r['covered_requirement_atom_ids']})
 impl_unresolved=sorted({a for r in rows if r['semantic_link_status']=='unresolved' and r['artifact_evidence_kind']=='implementation_source' for a in r['covered_requirement_atom_ids']}-set(impl_confirmed))
 impl_uncovered=sorted(set(ids)-set(impl_confirmed)-set(impl_unresolved))
 return {'atom_inventory':inventory,'atom_inventory_sha256':canon_digest(inventory),'contract_confirmed_atom_ids':contract,'contract_confirmed_atom_ids_sha256':canon_digest(contract),'implementation_confirmed_atom_ids':impl_confirmed,'implementation_confirmed_atom_ids_sha256':canon_digest(impl_confirmed),'implementation_unresolved_atom_ids':impl_unresolved,'implementation_unresolved_atom_ids_sha256':canon_digest(impl_unresolved),'implementation_uncovered_atom_ids':impl_uncovered,'implementation_uncovered_atom_ids_sha256':canon_digest(impl_uncovered),'contract_semantic_edge_coverage_complete':set(contract)==set(ids),'semantic_edge_coverage_complete':not impl_unresolved and not impl_uncovered}
def main():
 records=load_jsonl(LEDGER); meta=json.loads(META.read_text()); cross={x['unit_candidate_id']:x for x in load_jsonl(CROSSWALK)}; catalog={x['asset_id']:x for x in load_jsonl(CATALOG)}; manifest=manifest_entries()
 require(meta['schema_revision']==4 and meta['status']=='research_premise_candidate','metadata schema/status不一致')
 require(meta['authority_effect']=='none' and not meta['legacy_execution_performed'] and not meta['new_build_allowed'],'authorityまたは実行を生成')
 require(meta['consumer_closure_status']=='pending','consumer closure過大主張')
 require(len(records)==meta['record_count']==9,'record数不一致'); require(digest_file(LEDGER)==meta['output_sha256'],'ledger digest不一致')
 inputs={str(p.relative_to(ROOT)):digest_file(p) for p in (MANIFEST,CATALOG,CROSSWALK,PRIOR_LEDGER,PRIOR_META)}
 require(meta['inputs']==inputs,'入力digest不一致')
 for path,digest in inputs.items(): require(digest_bytes(git_blob(meta['parent_revision'],path))==digest,f'親revision入力不一致: {path}')
 edges={(r['unit_candidate_id'],r['asset_id']) for r in records}; require(edges==EXPECTED_EDGES and len(edges)==len(records),'edge exact set不一致')
 require({(x['unit_candidate_id'],x['asset_id']) for x in meta['reviewed_edges']}==EXPECTED_EDGES,'meta edge exact set不一致')
 require(set(meta['reviewed_unit_ids'])==set(EXPECTED_ATOMS),'unit exact set不一致')
 atom_maps={u:{x['atom_id']:x for x in xs} for u,xs in EXPECTED_ATOMS.items()}
 for r in records:
  rid=r['review_id']; uid=r['unit_candidate_id']; edge=(uid,r['asset_id']); unit=cross[uid]; asset=catalog[r['asset_id']]
  require(r['schema_revision']==4 and r['authority_effect']=='none' and r['review_scope']=='unit_asset_edge',f'schema/scope不一致: {rid}')
  require((r['semantic_link_status'],r['semantic_relation'],tuple(r['covered_requirement_atom_ids']))==EXPECTED_DECISIONS[edge],f'decision exact set不一致: {rid}')
  require(r['phase_authority_status']=='candidate_unchanged' and r['candidate_membership_semantics']=='search_candidate_only_not_semantic_evidence',f'候補をauthority化: {rid}')
  require(r['legacy_execution_status']=='not_run' and r['current_requirement_implementation_status']=='not_established',f'実行/現行実装過大主張: {rid}')
  require(r['consumer_closure_status']=='pending' and not r['consumer_closure_evidence'] and not r['new_build_allowed'],f'closure/build許可: {rid}')
  for key in ('source_requirement_id','source_statement_semantic_digest','source_text_spans','product_scope'): require(r[key]==unit[key],f'unit source不一致 {key}: {rid}')
  require(r['phase_candidates']==unit['direct_phase_candidates'] and r['asset_id'] in unit['candidate_asset_pool']['phase_candidate_asset_ids'],f'phase pool不一致: {rid}')
  mapping={'classification_id':'classification_id','source_path':'source_path','source_sha256':'source_sha256','artifact_evidence_kind':'artifact_evidence_kind','legacy_asset_evidence_state':'implementation_evidence_state','catalog_legacy_implementation_status':'legacy_implementation_status','candidate_phase_targets':'candidate_phase_targets','candidate_product_targets':'candidate_product_targets','observed_consumer_refs':'consumer_refs'}
  for out,src in mapping.items(): require(r[out]==asset[src],f'catalog不一致 {out}: {rid}')
  source=ROOT/ARCHIVE_PREFIX/r['source_path']; actual=hashlib.sha256(source.read_bytes()).hexdigest(); require(actual==r['source_sha256']==manifest.get(r['source_path']),f'archive digest不一致: {rid}')
  atom_ids=r['covered_requirement_atom_ids']; require(len(atom_ids)==len(set(atom_ids)),'covered atom重複')
  require(r['covered_requirement_atoms']==[atom_maps[uid][x] for x in atom_ids],f'atom本文不一致: {rid}')
  if r['semantic_link_status']=='confirmed': require(atom_ids and r['evidence_refs'],f'confirmed根拠欠落: {rid}')
  if r['semantic_link_status']=='rejected': require(not atom_ids and not r['evidence_atom_bindings'] and r['counterevidence'],f'rejected境界不一致: {rid}')
  excerpts=[]
  for e in r['evidence_refs']:
   require(e['archive_path']==ARCHIVE_PREFIX+r['source_path'],f'evidence sourceずれ: {rid}')
   require(e['source_requirement_relation'] in {'same_requirement_id_exact_restatement','different_function_nonmatching','implementation_behavior_evidence','design_contract_evidence'},f'evidence relation不正: {rid}')
   lines=(ROOT/e['archive_path']).read_text().splitlines(); a,b=e['line_start'],e['line_end']; require(1<=a<=b<=len(lines),f'evidence range不正: {rid}')
   text='\n'.join(lines[a-1:b])+'\n'; require(digest_bytes(text.encode())==e['excerpt_sha256'],f'evidence digest不一致: {rid}'); excerpts.append(text)
  relations={e['source_requirement_relation'] for e in r['evidence_refs']}
  if 'same_requirement_id_exact_restatement' in relations: require(r['artifact_evidence_kind']=='requirement' and relations=={'same_requirement_id_exact_restatement'},f'要求契約relationのartifact種別不一致: {rid}')
  if 'implementation_behavior_evidence' in relations: require(r['artifact_evidence_kind']=='implementation_source',f'実装relationのartifact種別不一致: {rid}')
  if 'design_contract_evidence' in relations: require(r['artifact_evidence_kind']=='design' and r['semantic_link_status']=='unresolved' and relations=={'design_contract_evidence'},f'設計契約relationの境界不一致: {rid}')
  if r['semantic_link_status']=='rejected': require(relations=={'different_function_nonmatching'},f'rejected relation不一致: {rid}')
  bound=[]
  for binding in r['evidence_atom_bindings']:
   aid=binding['atom_id']; require(aid in atom_ids,f'binding atomがcoverage外: {rid}')
   idxs=binding['evidence_ref_indexes']; require(idxs and all(isinstance(i,int) and 0<=i<len(excerpts) for i in idxs),f'binding index不正: {rid}')
   joined='\n'.join(excerpts[i] for i in idxs)
   terms=binding['required_terms']; require(terms and all(term in joined for term in terms),f'引用本文にrequired termなし: {rid}/{aid}')
   require(binding['match_mode'] in {'literal_source_fragment','controlled_term_set','controlled_term_set_partial'},f'match mode不正: {rid}')
   if r['semantic_link_status']=='confirmed': require(binding['match_mode'] in {'literal_source_fragment','controlled_term_set'},f'confirmedにpartial match: {rid}/{aid}')
   if r['semantic_link_status']=='unresolved': require(binding['match_mode']=='controlled_term_set_partial',f'unresolvedに確定match: {rid}/{aid}')
   if binding['match_mode']=='literal_source_fragment': require(all(f in joined for f in atom_maps[uid][aid]['source_fragments']),f'literal atom不一致: {rid}/{aid}')
   bound.append(aid)
  require(sorted(bound)==sorted(atom_ids),f'covered atomとbinding不一致: {rid}')
  if r['asset_id']=='LEGACY-ASSET-719D5EC9C06FC4AAD0FF':
   require(all(e['source_requirement_relation']=='same_requirement_id_exact_restatement' for e in r['evidence_refs']),'同一requirement relation欠落')
   require(all('HIL-FR-06' in excerpts[i] for i in range(len(excerpts))),'同一requirement ID引用欠落')
  if r['legacy_requirement_implementation_contribution']=='partial_static_implementation_evidence_unexecuted': require(r['artifact_evidence_kind']=='implementation_source' and r['semantic_link_status']=='confirmed',f'実装証拠過大主張: {rid}')
  require('implemented' not in r['current_requirement_implementation_status'],'current implemented claim')
 for uid,inventory in EXPECTED_ATOMS.items():
  fragments=[f for atom in inventory for f in atom['source_fragments']]
  statement=' '.join(cross[uid]['source_text_spans'])
  require(not uncovered_meaningful_runs(statement,fragments),f'atom inventory無損失被覆不一致: {uid}: {uncovered_meaningful_runs(statement,fragments)}')
 counts={s:sum(r['semantic_link_status']==s for r in records) for s in ('confirmed','rejected','unresolved')}; require(meta['semantic_link_counts']==counts=={'confirmed':2,'rejected':4,'unresolved':3},'status集計不一致')
 aggregates={x['unit_candidate_id']:x for x in meta['unit_aggregates']}; require(set(aggregates)==set(EXPECTED_ATOMS),'aggregate unit不一致')
 for uid,a in aggregates.items():
  rows=[r for r in records if r['unit_candidate_id']==uid]; require(a['atom_coverage_receipt']==coverage_receipt(uid,records),f'atom coverage receipt不一致: {uid}')
  direct=sorted(r['asset_id'] for r in rows if r['semantic_link_status']=='confirmed' and r['artifact_evidence_kind']=='implementation_source'); require(a['direct_confirmed_implementation_asset_ids']==direct,f'direct実装asset集計不一致: {uid}')
  require(a['semantic_link_counts']=={s:sum(r['semantic_link_status']==s for r in rows) for s in ('confirmed','rejected','unresolved')},f'unit status集計不一致: {uid}')
  require(a['current_requirement_implementation_status']=='not_established' and a['consumer_closure_status']=='pending' and a['phase_authority_status']=='candidate_unchanged' and not a['new_build_allowed'],f'aggregate過大主張: {uid}')
  if a['legacy_requirement_implementation_status'].startswith('unknown_'): require(not a['atom_coverage_receipt']['semantic_edge_coverage_complete'],f'unknown旧実装を完全被覆化: {uid}')
  expected_phase=[{'phase_id':x['phase_id'],'current_status':x['current_status'],'legacy_capability_status':x['legacy_capability_status'],'transition_assessment':x['transition_assessment']} for x in cross[uid]['phase_capability_evidence']]
  require(a['phase_capability_assessments']==expected_phase,f'phase状態転記不一致: {uid}')
  require(a['direct_confirmed_implementation_asset_ids']==[] and a['legacy_requirement_implementation_status'].startswith('unknown_'),f'旧実装過大主張: {uid}')
 prior_meta=json.loads(PRIOR_META.read_text()); prior_edges={(x['unit_candidate_id'],x['asset_id']) for x in prior_meta['reviewed_edges']}
 require(not (edges & prior_edges),'wave1とのedge重複')
 require(meta['prior_review_batch']=={'batch_id':prior_meta['batch_id'],'ledger_sha256':digest_file(PRIOR_LEDGER),'meta_sha256':digest_file(PRIOR_META)},'prior batch束縛不一致')
 require(meta['cumulative_reviewed_edge_count']==len(prior_edges|edges),'累積edge数不一致')
 require(meta['cumulative_reviewed_unit_count']==len(set(prior_meta['reviewed_unit_ids'])|set(EXPECTED_ATOMS)),'累積unit数不一致')
 status_text=STATUS.read_text()
 status_rows=[]
 for line in status_text.splitlines():
  if line.startswith('|'):
   status_rows.append([cell.strip().strip('`') for cell in line.strip().strip('|').split('|')])
 for uid,a in aggregates.items():
  result_rows=[cells for cells in status_rows if len(cells)==6 and cells[1]==uid]
  require(len(result_rows)==1,f'status doc結果行不一致: {uid}')
  require(result_rows[0][3]==a['legacy_requirement_implementation_status'] and result_rows[0][4]==a['current_requirement_implementation_status'],f'status doc実装状態不一致: {uid}')
  coverage_rows=[cells for cells in status_rows if len(cells)==6 and cells[0]==uid]
  require(len(coverage_rows)==1,f'status doc atom行不一致: {uid}')
  receipt=a['atom_coverage_receipt']; expected_counts=[len(receipt['atom_inventory']),len(receipt['contract_confirmed_atom_ids']),len(receipt['implementation_confirmed_atom_ids']),len(receipt['implementation_unresolved_atom_ids']),len(receipt['implementation_uncovered_atom_ids'])]
  try: observed_counts=[int(value) for value in coverage_rows[0][1:]]
  except ValueError: raise ValueError(f'status doc atom件数が整数でない: {uid}')
  require(observed_counts==expected_counts,f'status doc atom件数不一致: {uid}')
 expected_phase_rows={(uid,x['phase_id'],x['current_status'],x['legacy_capability_status'],x['transition_assessment']) for uid,a in aggregates.items() for x in a['phase_capability_assessments']}
 observed_phase_rows={tuple(cells) for cells in status_rows if len(cells)==5 and cells[0] in aggregates and cells[1].startswith('PHCAP-')}
 require(observed_phase_rows==expected_phase_rows,'status doc phase状態不一致')
 require('wave 1と合わせて5 unit、15 edge' in status_text and '残る213 unitは未着手' in status_text,'status doc累積件数不一致')
 code_tokens=re.findall(r'`([^`\n]+)`',status_text)
 forbidden_states={'implemented','tested','operational'}
 require(not (forbidden_states & set(code_tokens)),f'status docに過大な実装状態語: {sorted(set(code_tokens)&forbidden_states)}')
 for uid in EXPECTED_ATOMS:
  reviewed={a for u,a in edges if u==uid}; remaining=sorted(set(cross[uid]['candidate_asset_pool']['phase_candidate_asset_ids'])-reviewed); rec=meta['unreviewed_candidate_edges'][uid]
  require(rec['source_pool']=='phase_candidate_asset_ids' and rec['count']==len(remaining) and rec['asset_ids_sha256']==canon_digest(remaining),f'unreviewed set不一致: {uid}')
 print('legacy requirement direct semantic review wave2: schema4 / 9 edges / 14 atoms verified')
if __name__=='__main__': main()
