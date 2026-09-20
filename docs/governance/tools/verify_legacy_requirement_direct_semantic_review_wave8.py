#!/usr/bin/env python3
"""wave 8 direct semantic reviewをarchive実行なしで静的検証する。"""
import hashlib, json, re, subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]; GOV=ROOT/'docs/governance'; ARCH=ROOT/'archive/legacy-generation-2026-09-14/root'
LEDGER=GOV/'legacy-requirement-direct-semantic-review-wave8.jsonl'; META=GOV/'legacy-requirement-direct-semantic-review-wave8.meta.json'
STATUS=GOV/'audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave8-status-2026-09-21.md'
CATALOG=GOV/'legacy-asset-phase-product-classification-bootstrap.jsonl'; CROSS=GOV/'legacy-requirement-implementation-crosswalk-bootstrap.jsonl'
DECOMP=GOV/'legacy-ir-product-unit-decomposition-bootstrap.jsonl'; MANIFEST=ROOT/'archive/legacy-generation-2026-09-14/MANIFEST.sha256'
PHASE=GOV/'phase-capability-inventory.json'; PRIOR=[(GOV/f'legacy-requirement-direct-semantic-review-wave{n}.jsonl',GOV/f'legacy-requirement-direct-semantic-review-wave{n}.meta.json') for n in (1,2,3,4,5,6,7)]

ATOMS={'IRUNIT-HIL-FR-65-HELIX-OS': [{'atom_id': 'FR65-OS-A01', 'kind': 'environment_allowlist', 'text': '入れ子CLI起動時の環境変数をallow-list方式で最小化する', 'source_fragments': ['Delegation Environment Hygieneは入れ子CLI起動時の環境変数をallow-list方式で最小化し'], 'shared_with_units': [], 'boundary_review_state': 'product_boundary_pending_human_decision'}, {'atom_id': 'FR65-OS-A02', 'kind': 'stdin_prompt_transport', 'text': 'promptをstdinで渡す', 'source_fragments': ['promptをstdin渡し'], 'shared_with_units': [], 'boundary_review_state': 'product_boundary_pending_human_decision'}, {'atom_id': 'FR65-OS-A03', 'kind': 'close_and_timeout', 'text': 'stdin消費CLIを明示closeしwall-clock timeoutを必須にする', 'source_fragments': ['stdin消費CLIの明示close、wall-clock timeoutを必須とする'], 'shared_with_units': [], 'boundary_review_state': 'product_boundary_pending_human_decision'}, {'atom_id': 'FR65-OS-A04', 'kind': 'timeout_detection', 'text': 'timeoutなし委譲をlintまたはdoctorで検出する', 'source_fragments': ['timeoutなし委譲をlint/doctorで検出する'], 'shared_with_units': [], 'boundary_review_state': 'product_boundary_pending_human_decision'}, {'atom_id': 'FR65-OS-A05', 'kind': 'delegation_hygiene_evidence', 'text': '浄化済みenv manifest、timeout設定、lint/doctor findingを証拠にする', 'source_fragments': ['浄化済みenv manifest、timeout設定、lint/doctor finding'], 'shared_with_units': [], 'boundary_review_state': 'product_boundary_pending_human_decision'}], 'IRUNIT-HIL-FR-66-HELIX-OS': [{'atom_id': 'FR66-OS-A01', 'kind': 'node_output_revalidation', 'text': '全第三者worker出力をNodeがschema、digest、authority policyで再検証する', 'source_fragments': ['Proposal Revalidation Gateは全第三者worker出力（ファイル成果物含む）をNodeがschema/digest/authority policyで再検証し'], 'shared_with_units': [], 'boundary_review_state': 'product_boundary_pending_human_decision'}, {'atom_id': 'FR66-OS-A02', 'kind': 'output_nonexecution', 'text': '出力中のcommand、SQL、absolute path、codeを実行しない', 'source_fragments': ['出力中のcommand/SQL/absolute path/codeを実行しない'], 'shared_with_units': [], 'boundary_review_state': 'product_boundary_pending_human_decision'}, {'atom_id': 'FR66-OS-A03', 'kind': 'strict_validation_levels', 'text': '検証levelをstrict既定の段階制にする', 'source_fragments': ['検証levelはstrict既定の段階制とし'], 'shared_with_units': [], 'boundary_review_state': 'product_boundary_pending_human_decision'}, {'atom_id': 'FR66-OS-A04', 'kind': 'filesystem_diff_rejection', 'text': '委譲完了時のFS差分で許可path外書込と指示外install、network取得、test実行痕跡をrejectする', 'source_fragments': ['委譲完了時のFS差分検査で許可path外書込と指示外install/network取得/テスト実行痕跡をrejectする'], 'shared_with_units': [], 'boundary_review_state': 'product_boundary_pending_human_decision'}, {'atom_id': 'FR66-OS-A05', 'kind': 'revalidation_evidence', 'text': 'revalidation receipt、FS diff finding、reject decisionを証拠にする', 'source_fragments': ['revalidation receipt、FS diff finding、reject decision'], 'shared_with_units': [], 'boundary_review_state': 'product_boundary_pending_human_decision'}], 'IRUNIT-HIL-FR-67-HELIX-OS': [{'atom_id': 'FR67-OS-A01', 'kind': 'sparse_task_files', 'text': 'workerへの払い出しをtask必要ファイルだけのsparse worktreeに限定する', 'source_fragments': ['Payload Minimizationはworkerへの払い出しをtask必要ファイルのみのsparse worktreeへ限定し'], 'shared_with_units': [], 'boundary_review_state': 'product_boundary_pending_human_decision'}, {'atom_id': 'FR67-OS-A02', 'kind': 'history_exclusion', 'text': '払い出しへgit履歴を含めない', 'source_fragments': ['git履歴を含めず'], 'shared_with_units': [], 'boundary_review_state': 'product_boundary_pending_human_decision'}, {'atom_id': 'FR67-OS-A03', 'kind': 'pre_payout_secret_scan', 'text': '払い出し前のsecret scan passを必須にする', 'source_fragments': ['払い出し前secret scan passを必須とし'], 'shared_with_units': [], 'boundary_review_state': 'product_boundary_pending_human_decision'}, {'atom_id': 'FR67-OS-A04', 'kind': 'payout_manifest_audit', 'text': '払い出しmanifestのpathとdigestをaudit evidenceへ記録する', 'source_fragments': ['払い出しmanifest（path+digest）をaudit evidenceへ記録する'], 'shared_with_units': [], 'boundary_review_state': 'product_boundary_pending_human_decision'}, {'atom_id': 'FR67-OS-A05', 'kind': 'payload_evidence', 'text': 'payout manifest、secret scan receipt、履歴排除証跡を証拠にする', 'source_fragments': ['payout manifest、secret scan receipt、履歴排除証跡'], 'shared_with_units': [], 'boundary_review_state': 'product_boundary_pending_human_decision'}]}
QUERIES={'IRUNIT-HIL-FR-65-HELIX-OS': ['HIL-FR-65', 'Delegation Environment Hygiene', 'allow-list', 'Provider process環境境界', 'stdin', 'wall-clock timeout', 'timeoutなし', 'env manifest'], 'IRUNIT-HIL-FR-66-HELIX-OS': ['HIL-FR-66', 'Proposal Revalidation Gate', 'schema/digest/authority policy', 'FS diff', 'reject decision', 'absolute path', 'revalidation receipt', 'WORKER_OUTPUT_DIGEST_MISMATCH'], 'IRUNIT-HIL-FR-67-HELIX-OS': ['HIL-FR-67', 'Payload Minimization', 'sparse worktree', 'secret scan', 'payout manifest', 'path+digest', '履歴排除', 'WORKER_ISOLATION_SECRET_TASK_DENIED', 'worker_isolation_run_receipt']}
DECISIONS={('IRUNIT-HIL-FR-65-HELIX-OS', 'LEGACY-ASSET-A60CF91DD2AF6693E6F9'): ('confirmed', 'same_requirement_id_exact_source_contract_not_implementation', ('FR65-OS-A01', 'FR65-OS-A02', 'FR65-OS-A03', 'FR65-OS-A04', 'FR65-OS-A05')), ('IRUNIT-HIL-FR-66-HELIX-OS', 'LEGACY-ASSET-A60CF91DD2AF6693E6F9'): ('confirmed', 'same_requirement_id_exact_source_contract_not_implementation', ('FR66-OS-A01', 'FR66-OS-A02', 'FR66-OS-A03', 'FR66-OS-A04', 'FR66-OS-A05')), ('IRUNIT-HIL-FR-67-HELIX-OS', 'LEGACY-ASSET-A60CF91DD2AF6693E6F9'): ('confirmed', 'same_requirement_id_exact_source_contract_not_implementation', ('FR67-OS-A01', 'FR67-OS-A02', 'FR67-OS-A03', 'FR67-OS-A04', 'FR67-OS-A05')), ('IRUNIT-HIL-FR-65-HELIX-OS', 'LEGACY-ASSET-4FC9F323194389B6194C'): ('unresolved', 'design_contract_evidence', ('FR65-OS-A01',)), ('IRUNIT-HIL-FR-65-HELIX-OS', 'LEGACY-ASSET-8DF1DE5D9E214FFB8E59'): ('unresolved', 'partial_implementation_behavior_evidence_unexecuted', ('FR65-OS-A02',)), ('IRUNIT-HIL-FR-66-HELIX-OS', 'LEGACY-ASSET-9739694943846FEB80E8'): ('unresolved', 'design_contract_evidence', ('FR66-OS-A01',)), ('IRUNIT-HIL-FR-66-HELIX-OS', 'LEGACY-ASSET-012EA51D011B87B05A5D'): ('unresolved', 'partial_implementation_behavior_evidence_unexecuted', ('FR66-OS-A01',)), ('IRUNIT-HIL-FR-67-HELIX-OS', 'LEGACY-ASSET-604CADBAF8004788EB15'): ('unresolved', 'design_contract_evidence', ('FR67-OS-A02', 'FR67-OS-A03', 'FR67-OS-A04')), ('IRUNIT-HIL-FR-67-HELIX-OS', 'LEGACY-ASSET-93040CD4C281E3AC3C06'): ('unresolved', 'partial_implementation_behavior_evidence_unexecuted', ('FR67-OS-A04', 'FR67-OS-A05'))}
CONNECTIVES={u:[] for u in ATOMS}

def require(v,m):
 if not v: raise ValueError(m)
def load(p): return [json.loads(x) for x in p.read_text().splitlines() if x.strip()]
def digest(b): return 'sha256:'+hashlib.sha256(b).hexdigest()
def canon(v): return digest(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def git_blob(rev,path): return subprocess.run(['git','show',f'{rev}:{path}'],cwd=ROOT,check=True,capture_output=True).stdout
def anchor_is_exact_token(anchor,text):
 if re.fullmatch(r'[A-Za-z0-9_/-]+',anchor):
  if len(anchor)<3: return False
  for m in re.finditer(re.escape(anchor),text):
   left=m.start()==0 or re.fullmatch(r'[A-Za-z0-9]',text[m.start()-1]) is None or text[m.start()-1] in '_/-' or (text[m.start()-1].islower() and anchor[0].isupper())
   right=m.end()==len(text) or re.fullmatch(r'[A-Za-z0-9]',text[m.end()]) is None or text[m.end()] in '_/-' or (anchor[-1].islower() and text[m.end()].isupper())
   if left and right: return True
  return False
 return len(anchor)>=2 and anchor in text
def meaningful_uncovered(text,fragments):
 hit=[False]*len(text)
 for fragment in fragments:
  start=0
  while (i:=text.find(fragment,start))>=0:
   hit[i:i+len(fragment)]=[True]*len(fragment); start=i+1
 out=''.join(' ' if hit[i] or ch.isspace() or ch in '。、・|`' else ch for i,ch in enumerate(text))
 return re.findall(r'\S+',out)
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
 result={'atom_inventory':inv,'connective_fragments':CONNECTIVES[uid],'contract_confirmed_atom_ids':contract,'design_partial_atom_ids':design,'implementation_confirmed_atom_ids':implc,'implementation_unresolved_atom_ids':implu,'implementation_uncovered_atom_ids':uncovered,'no_evidence_atom_ids':noe,'shared_atom_ids':shared,'product_exclusive_atom_ids':exclusive}
 for k in list(result): result[k+'_sha256']=canon(result[k])
 result.update(contract_semantic_edge_coverage_complete=set(contract)==set(ids),semantic_edge_coverage_complete=not implu and not uncovered,no_shared_source_span=not shared,product_boundary_decision_complete=False,product_exclusive_contract_coverage_complete=bool(exclusive) and set(exclusive)<=set(contract))
 return result

def main():
 records=load(LEDGER); meta=json.loads(META.read_text()); catalog={x['asset_id']:x for x in load(CATALOG)}; cross={x['unit_candidate_id']:x for x in load(CROSS)}; decomp={u['unit_candidate_id']:u for d in load(DECOMP) for u in d['candidate_units']}; mani=manifest()
 meta_fields={'schema_revision','status','authority_effect','source_revision','batch_id','parent_revision','legacy_execution_performed','consumer_closure_status','new_build_allowed','record_count','output_sha256','inputs','prior_review_batches','reviewed_edges','reviewed_unit_ids','cumulative_reviewed_edge_count','cumulative_reviewed_unit_count','semantic_link_counts','bounded_search_receipts','unit_aggregates'}
 require(set(meta)==meta_fields,'meta field集合不一致')
 require(meta['schema_revision']==10 and meta['status']=='research_premise_candidate','schema/status不一致')
 require(meta['parent_revision']=='9f579b00657c3ca0e43a3b497612ff18711d44a2','parent revision不一致')
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
  require(r['schema_revision']==10 and r['selection_route']=='bounded_global_search' and r['candidate_membership_semantics']=='bounded_global_search_candidate_only_not_semantic_evidence',f'schema/search authority不一致: {rid}')
  require(r['bounded_search_query']=={'match_mode':'archive_file_contains_any_utf8_anchor','anchors':QUERIES[uid]} and r['asset_id'] in searches[uid],f'bounded search不一致: {rid}')
  require(r['phase_candidates']==unit['direct_phase_candidates'] and r['phase_candidates'] and r['phase_authority_status']=='candidate_unchanged',f'phase authority不一致: {rid}')
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
   lines=(ROOT/e['archive_path']).read_text().splitlines(); require(1<=e['line_start']<=e['line_end']<=len(lines),f'引用range不一致: {rid}'); text='\n'.join(lines[e['line_start']-1:e['line_end']])+'\n'; require(digest(text.encode())==e['excerpt_sha256'],f'引用digest不一致: {rid}'); excerpts.append(text); relations.add(e['source_requirement_relation'])
  expected={'same_requirement_id_exact_source_contract_not_implementation':'same_requirement_id_exact_restatement','design_contract_evidence':'design_contract_evidence','partial_implementation_behavior_evidence_unexecuted':'partial_implementation_behavior_evidence_unexecuted','adjacent_design_nonmatching':'adjacent_design_nonmatching','adjacent_implementation_nonmatching':'adjacent_implementation_nonmatching'}[r['semantic_relation']]
  require(relations=={expected},f'evidence relation不一致: {rid}')
  if expected=='same_requirement_id_exact_restatement': require(r['artifact_evidence_kind']=='requirement' and r['semantic_link_status']=='confirmed','要求snapshot境界不一致')
  if expected=='design_contract_evidence': require(r['artifact_evidence_kind']=='design' and r['semantic_link_status']=='unresolved','designを実装算入')
  if expected=='adjacent_design_nonmatching': require(r['artifact_evidence_kind']=='design' and r['semantic_link_status']=='rejected','隣接design境界不一致')
  if expected=='partial_implementation_behavior_evidence_unexecuted': require(r['artifact_evidence_kind']=='implementation_source' and r['semantic_link_status']=='unresolved','未確定sourceを実装確定')
  if expected=='adjacent_implementation_nonmatching': require(r['artifact_evidence_kind']=='implementation_source' and r['semantic_link_status']=='rejected','隣接source境界不一致')
  contribution={'same_requirement_id_exact_source_contract_not_implementation':'contract_only_no_implementation_claim','design_contract_evidence':'design_contract_only_no_implementation_claim','partial_implementation_behavior_evidence_unexecuted':'partial_static_implementation_candidate_unresolved_no_implementation_claim','adjacent_design_nonmatching':'none_rejected','adjacent_implementation_nonmatching':'none_rejected'}[r['semantic_relation']]
  require(r['legacy_requirement_implementation_contribution']==contribution,f'実装contribution不一致: {rid}')
  bound=[]
  for b in r['evidence_atom_bindings']:
   require(b['atom_id'] in ids and b['evidence_ref_indexes'] and all(0<=i<len(excerpts) for i in b['evidence_ref_indexes']),f'binding index不一致: {rid}')
   joined='\n'.join(excerpts[i] for i in b['evidence_ref_indexes']); require(all(t in joined for t in b['required_terms']),f'required term欠落: {rid}/{b["atom_id"]}')
   if b['match_mode']=='literal_source_fragment': require(all(f in joined for f in amap[uid][b['atom_id']]['source_fragments']),f'literal atom欠落: {rid}')
   else:
    anchors=b.get('source_fragment_anchors',[]); fragments=''.join(amap[uid][b['atom_id']]['source_fragments'])
    require(b['match_mode']=='controlled_term_set_partial' and anchors and all(anchor_is_exact_token(x,fragments) and any(anchor_is_exact_token(x,t) for t in b['required_terms']) for x in anchors),f'partial anchor不一致: {rid}')
   bound.append(b['atom_id'])
  require(sorted(bound)==sorted(ids),f'covered atom/binding不一致: {rid}')
 for uid,inv in ATOMS.items():
  connectives=CONNECTIVES[uid]; allowed_connectives={'/','、','と','と、','を'}
  require(len(connectives)==len(set(connectives)) and all(c in allowed_connectives and 1<=len(c)<=2 for c in connectives),f'connective allowlist不一致: {uid}')
  require(all(c not in f for c in connectives for a in inv for f in a['source_fragments']),f'connectiveがatom意味fragmentと重複: {uid}')
  require(not any(f in g or g in f for i,a in enumerate(inv) for b in inv[i+1:] for f in a['source_fragments'] for g in b['source_fragments']),f'atom間source fragment包含重複: {uid}')
  statement=' '.join(cross[uid]['source_text_spans']); fragments=[f for a in inv for f in a['source_fragments']]+connectives
  require(not meaningful_uncovered(statement,fragments),f'atom無損失被覆不一致: {uid}: {meaningful_uncovered(statement,fragments)}')
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
 require(meta['cumulative_reviewed_edge_count']==len(prior_edges|edges)==69 and meta['cumulative_reviewed_unit_count']==len(prior_units|set(ATOMS))==23,'累積件数不一致')
 text=STATUS.read_text(); batch=re.search(r'218要求unitのうち新たに(\d+) unit、候補edge (\d+)件',text); cumulative=re.search(r'wave 1〜7と合わせて(\d+) unit、(\d+) edge',text); remaining=re.search(r'残る(\d+) unitは未着手',text)
 require(batch and [int(x) for x in batch.groups()]==[len(ATOMS),len(records)],'status batch件数不一致')
 require(cumulative and [int(x) for x in cumulative.groups()]==[meta['cumulative_reviewed_unit_count'],meta['cumulative_reviewed_edge_count']],'status累積件数不一致')
 require(remaining and int(remaining.group(1))==len(cross)-meta['cumulative_reviewed_unit_count'],'status未着手件数不一致')
 require(not any(p in {'HELIX-Web','HELIX-Web-OS'} for u in cross.values() for p in u['product_scope']),'crosswalk Web/Web-OS正規unit境界の過大主張')
 require(not any(p in {'HELIX-Web','HELIX-Web-OS'} for u in decomp.values() for p in ([u.get('product_target')] if u.get('product_target') else [])+list(u.get('connected_product_targets') or [])) and '正規分解台帳にHELIX-Web／Web-OS unitは0件' in text,'decomposition Web/Web-OS正規unit境界の過大主張')
 forbidden={'implemented','tested','operational'}; require(not forbidden&set(re.findall(r'`([^`\n]+)`',text)),'status過大状態語')
 table=[[c.strip().strip('`') for c in line.strip('|').split('|')] for line in text.splitlines() if line.startswith('|')]
 observed_phase={(r[0],r[1],r[2],r[3],r[4]) for r in table if len(r)==5 and r[0] in ATOMS and r[1].startswith('PHCAP-')}
 expected_phase={(uid,x['phase_id'],x['current_status'],x['legacy_capability_status'],x['transition_assessment']) for uid,a in aggregates.items() for x in a['phase_capability_assessments']}
 require(observed_phase==expected_phase,'status phase表不一致')
 for uid,a in aggregates.items():
  state=[r for r in table if len(r)==6 and r[1]==uid]; require(len(state)==1 and state[0][3:]==[a['legacy_requirement_implementation_status'],a['current_requirement_implementation_status'],a['degradation_assessment']],f'status状態行不一致: {uid}')
  atom=[r for r in table if len(r)==8 and r[0]==uid]; require(len(atom)==1,'status atom行不一致')
  c=a['atom_coverage_receipt']; expected=[len(c[k]) for k in ('atom_inventory','contract_confirmed_atom_ids','design_partial_atom_ids','implementation_confirmed_atom_ids','implementation_unresolved_atom_ids','implementation_uncovered_atom_ids','no_evidence_atom_ids')]; require([int(x) for x in atom[0][1:]]==expected,f'status atom件数不一致: {uid}')
 print('legacy requirement direct semantic review wave8: schema10 / 9 edges / 15 atoms / bounded search + phase candidates verified')
if __name__=='__main__': main()
