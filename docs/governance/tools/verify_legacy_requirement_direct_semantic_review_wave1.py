#!/usr/bin/env python3
"""旧要求unit×assetのdirect semantic review wave 1を独立検証する。"""
from __future__ import annotations
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]; GOV=ROOT/'docs/governance'
LEDGER=GOV/'legacy-requirement-direct-semantic-review-wave1.jsonl'; META=GOV/'legacy-requirement-direct-semantic-review-wave1.meta.json'
CROSSWALK=GOV/'legacy-requirement-implementation-crosswalk-bootstrap.jsonl'; CATALOG=GOV/'legacy-asset-phase-product-classification-bootstrap.jsonl'; MANIFEST=ROOT/'archive/legacy-generation-2026-09-14/MANIFEST.sha256'
ARCHIVE_PREFIX='archive/legacy-generation-2026-09-14/root/'
EXPECTED_ATOMS={
 'IRUNIT-HIL-BR-01-HELIX-HARNESS':[
  {'atom_id':'BR01-HARNESS-A01','kind':'authority_precondition','text':'人のL3承認後','source_fragments':['人のL3承認後']},
  {'atom_id':'BR01-HARNESS-A02','kind':'completion_boundary','text':'不可逆境界以外を無人完走する','source_fragments':['不可逆境界以外を無人完走する']}],
 'IRUNIT-HIL-FR-12-HELIX-OS':[
  {'atom_id':'FR12-OS-A01','kind':'behavior','text':'Claude/Codex定義を生成する','source_fragments':['Claude/Codex定義を生成し']},
  {'atom_id':'FR12-OS-A02','kind':'failure','text':'手編集driftをfail-closeする','source_fragments':['手編集drift','fail-closeする']},
  {'atom_id':'FR12-OS-A03','kind':'failure','text':'未登録agentをfail-closeする','source_fragments':['未登録agent','fail-closeする']},
  {'atom_id':'FR12-OS-A04','kind':'failure','text':'model/effort overrideをfail-closeする','source_fragments':['model/effort override','fail-closeする']},
  {'atom_id':'FR12-OS-A05','kind':'failure','text':'blind context漏洩をfail-closeする','source_fragments':['blind context漏洩','fail-closeする']},
  {'atom_id':'FR12-OS-A06','kind':'failure','text':'forbidden pathをfail-closeする','source_fragments':['forbidden path','fail-closeする']},
  {'atom_id':'FR12-OS-A07','kind':'output','text':'generated adapter','source_fragments':['generated adapter']},
  {'atom_id':'FR12-OS-A08','kind':'output','text':'drift/guard receipt','source_fragments':['drift/guard receipt']}]
}
EXPECTED_DECISIONS={
 ('IRUNIT-HIL-BR-01-HELIX-HARNESS','LEGACY-ASSET-719D5EC9C06FC4AAD0FF'):('confirmed','same_requirement_id_exact_source_contract_not_implementation',('BR01-HARNESS-A01','BR01-HARNESS-A02')),
 ('IRUNIT-HIL-BR-01-HELIX-HARNESS','LEGACY-ASSET-D6339A02201B20481C3F'):('rejected','canonical_shadow_promotion_not_br01_execution_contract',()),
 ('IRUNIT-HIL-BR-01-HELIX-HARNESS','LEGACY-ASSET-F17ABDB90E1340D09746'):('unresolved','human_l3_gate_partial_but_product_boundary_unresolved',('BR01-HARNESS-A01',)),
 ('IRUNIT-HIL-FR-12-HELIX-OS','LEGACY-ASSET-7B8261E520354DF48FD0'):('unresolved','drift_detection_report_without_definition_generation_or_uniform_fail_close',('FR12-OS-A02',)),
 ('IRUNIT-HIL-FR-12-HELIX-OS','LEGACY-ASSET-8EB0EDD06A4197FD3532'):('confirmed','direct_partial_agent_and_model_effort_guard',('FR12-OS-A03','FR12-OS-A04')),
 ('IRUNIT-HIL-FR-12-HELIX-OS','LEGACY-ASSET-447711D94AA87E82F544'):('unresolved','context_packet_and_path_boundary_without_access_enforcement',('FR12-OS-A06',))}
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
def coverage_receipt(uid,records):
 inventory=EXPECTED_ATOMS[uid]; ids=[x['atom_id'] for x in inventory]
 confirmed=sorted({a for r in records if r['unit_candidate_id']==uid and r['semantic_link_status']=='confirmed' for a in r['covered_requirement_atom_ids']})
 unresolved=sorted({a for r in records if r['unit_candidate_id']==uid and r['semantic_link_status']=='unresolved' for a in r['covered_requirement_atom_ids']}-set(confirmed))
 uncovered=sorted(set(ids)-set(confirmed)-set(unresolved))
 return {'atom_inventory':inventory,'atom_inventory_sha256':canon_digest(inventory),'confirmed_atom_ids':confirmed,'confirmed_atom_ids_sha256':canon_digest(confirmed),'unresolved_atom_ids':unresolved,'unresolved_atom_ids_sha256':canon_digest(unresolved),'uncovered_atom_ids':uncovered,'uncovered_atom_ids_sha256':canon_digest(uncovered),'semantic_edge_coverage_complete':not unresolved and not uncovered}
def main():
 records=load_jsonl(LEDGER); meta=json.loads(META.read_text()); cross={x['unit_candidate_id']:x for x in load_jsonl(CROSSWALK)}; catalog={x['asset_id']:x for x in load_jsonl(CATALOG)}; manifest=manifest_entries()
 require(meta['schema_revision']==2 and meta['status']=='research_premise_candidate','metadata schema/status不一致')
 require(meta['authority_effect']=='none' and not meta['legacy_execution_performed'] and not meta['new_build_allowed'],'authorityまたは実行を生成')
 require(meta['consumer_closure_status']=='pending','consumer closure過大主張')
 require(len(records)==meta['record_count']==6,'record数不一致'); require(digest_file(LEDGER)==meta['output_sha256'],'ledger digest不一致')
 inputs={str(CROSSWALK.relative_to(ROOT)):digest_file(CROSSWALK),str(CATALOG.relative_to(ROOT)):digest_file(CATALOG),str(MANIFEST.relative_to(ROOT)):digest_file(MANIFEST)}
 require(meta['inputs']==inputs,'入力digest不一致')
 for path,digest in inputs.items(): require(digest_bytes(git_blob(meta['parent_revision'],path))==digest,f'親revision入力不一致: {path}')
 edges={(r['unit_candidate_id'],r['asset_id']) for r in records}; require(edges==EXPECTED_EDGES and len(edges)==len(records),'edge exact set不一致')
 require({(x['unit_candidate_id'],x['asset_id']) for x in meta['reviewed_edges']}==EXPECTED_EDGES,'meta edge exact set不一致')
 require(set(meta['reviewed_unit_ids'])==set(EXPECTED_ATOMS),'unit exact set不一致')
 atom_maps={u:{x['atom_id']:x for x in xs} for u,xs in EXPECTED_ATOMS.items()}
 for r in records:
  rid=r['review_id']; uid=r['unit_candidate_id']; edge=(uid,r['asset_id']); unit=cross[uid]; asset=catalog[r['asset_id']]
  require(r['schema_revision']==2 and r['authority_effect']=='none' and r['review_scope']=='unit_asset_edge',f'schema/scope不一致: {rid}')
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
   require(e['source_requirement_relation'] in {'same_requirement_id_exact_restatement','different_function_nonmatching','implementation_behavior_evidence'},f'evidence relation不正: {rid}')
   lines=(ROOT/e['archive_path']).read_text().splitlines(); a,b=e['line_start'],e['line_end']; require(1<=a<=b<=len(lines),f'evidence range不正: {rid}')
   text='\n'.join(lines[a-1:b])+'\n'; require(digest_bytes(text.encode())==e['excerpt_sha256'],f'evidence digest不一致: {rid}'); excerpts.append(text)
  bound=[]
  for binding in r['evidence_atom_bindings']:
   aid=binding['atom_id']; require(aid in atom_ids,f'binding atomがcoverage外: {rid}')
   idxs=binding['evidence_ref_indexes']; require(idxs and all(isinstance(i,int) and 0<=i<len(excerpts) for i in idxs),f'binding index不正: {rid}')
   joined='\n'.join(excerpts[i] for i in idxs)
   terms=binding['required_terms']; require(terms and all(term in joined for term in terms),f'引用本文にrequired termなし: {rid}/{aid}')
   require(binding['match_mode'] in {'literal_source_fragment','controlled_term_set','controlled_term_set_partial'},f'match mode不正: {rid}')
   if binding['match_mode']=='literal_source_fragment': require(all(f in joined for f in atom_maps[uid][aid]['source_fragments']),f'literal atom不一致: {rid}/{aid}')
   bound.append(aid)
  require(sorted(bound)==sorted(atom_ids),f'covered atomとbinding不一致: {rid}')
  if edge==('IRUNIT-HIL-BR-01-HELIX-HARNESS','LEGACY-ASSET-719D5EC9C06FC4AAD0FF'):
   require(all(e['source_requirement_relation']=='same_requirement_id_exact_restatement' for e in r['evidence_refs']),'同一requirement relation欠落')
   require(all('HIL-BR-01' in excerpts[i] for i in range(len(excerpts))),'同一requirement ID引用欠落')
  if r['legacy_requirement_implementation_contribution']=='partial_static_implementation_evidence_unexecuted': require(r['artifact_evidence_kind']=='implementation_source' and r['semantic_link_status']=='confirmed',f'実装証拠過大主張: {rid}')
  require('implemented' not in r['current_requirement_implementation_status'],'current implemented claim')
 counts={s:sum(r['semantic_link_status']==s for r in records) for s in ('confirmed','rejected','unresolved')}; require(meta['semantic_link_counts']==counts=={'confirmed':2,'rejected':1,'unresolved':3},'status集計不一致')
 aggregates={x['unit_candidate_id']:x for x in meta['unit_aggregates']}; require(set(aggregates)==set(EXPECTED_ATOMS),'aggregate unit不一致')
 for uid,a in aggregates.items():
  rows=[r for r in records if r['unit_candidate_id']==uid]; require(a['atom_coverage_receipt']==coverage_receipt(uid,records),f'atom coverage receipt不一致: {uid}')
  direct=sorted(r['asset_id'] for r in rows if r['semantic_link_status']=='confirmed' and r['artifact_evidence_kind']=='implementation_source'); require(a['direct_confirmed_implementation_asset_ids']==direct,f'direct実装asset集計不一致: {uid}')
  require(a['semantic_link_counts']=={s:sum(r['semantic_link_status']==s for r in rows) for s in ('confirmed','rejected','unresolved')},f'unit status集計不一致: {uid}')
  require(a['current_requirement_implementation_status']=='not_established' and a['consumer_closure_status']=='pending' and a['phase_authority_status']=='candidate_unchanged' and not a['new_build_allowed'],f'aggregate過大主張: {uid}')
 require(aggregates['IRUNIT-HIL-BR-01-HELIX-HARNESS']['direct_confirmed_implementation_asset_ids']==[],'要求sourceを実装化')
 require(aggregates['IRUNIT-HIL-BR-01-HELIX-HARNESS']['legacy_requirement_implementation_status'].startswith('unknown_'),'HARNESS旧実装過大主張')
 osagg=aggregates['IRUNIT-HIL-FR-12-HELIX-OS']; require(osagg['legacy_requirement_implementation_status']=='partial_static_implementation_evidence_unexecuted','OS部分実装状態不一致'); require(not osagg['atom_coverage_receipt']['semantic_edge_coverage_complete'],'OS incomplete coverage欠落')
 for uid in EXPECTED_ATOMS:
  reviewed={a for u,a in edges if u==uid}; remaining=sorted(set(cross[uid]['candidate_asset_pool']['phase_candidate_asset_ids'])-reviewed); rec=meta['unreviewed_candidate_edges'][uid]
  require(rec['source_pool']=='phase_candidate_asset_ids' and rec['count']==len(remaining) and rec['asset_ids_sha256']==canon_digest(remaining),f'unreviewed set不一致: {uid}')
 print('legacy requirement direct semantic review wave1: schema2 / 6 edges / 10 atoms verified')
if __name__=='__main__': main()
