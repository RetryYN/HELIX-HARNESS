#!/usr/bin/env python3
import argparse, difflib, hashlib, json, subprocess, sys
from pathlib import Path

FOUR=['HELIX-HARNESS','HELIX-OS','HELIX-Web','HELIX-Web-OS']
IDS=['OUTSIDE67-PATH-002','OUTSIDE67-PATH-005','OUTSIDE67-PATH-013','OUTSIDE67-PATH-031','OUTSIDE67-PATH-061']
EXISTING=['OUTSIDE67-PATH-008','OUTSIDE67-PATH-011','OUTSIDE67-PATH-030','OUTSIDE67-PATH-033','OUTSIDE67-PATH-034','OUTSIDE67-PATH-035','OUTSIDE67-PATH-036','OUTSIDE67-PATH-037','OUTSIDE67-PATH-043','OUTSIDE67-PATH-045','OUTSIDE67-PATH-046','OUTSIDE67-PATH-047','OUTSIDE67-PATH-052','OUTSIDE67-PATH-054','OUTSIDE67-PATH-055','OUTSIDE67-PATH-056','OUTSIDE67-PATH-057','OUTSIDE67-PATH-059','OUTSIDE67-PATH-063','OUTSIDE67-PATH-064','OUTSIDE67-PATH-065','OUTSIDE67-PATH-066','OUTSIDE67-PATH-001','OUTSIDE67-PATH-004','OUTSIDE67-PATH-007','OUTSIDE67-PATH-010','OUTSIDE67-PATH-060']
PRE='2d4991042be55268bac30a8bbcdac45b3865030a'; ARCH='064280b5c1c5c98f949e6e3be5ef87cbe4a4b658'
HEAD='b343360a104d377e545adc404a4151d70eac024e'; PREVIOUS_HEAD='b343360a104d377e545adc404a4151d70eac024e'
HOLDING='docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl'; REGISTER='docs/governance/management-provisional-requirement-register.jsonl'
LEDGERS=['docs/governance/legacy-asset-disposition.jsonl','docs/governance/legacy-asset-decisions.jsonl','docs/governance/legacy-asset-copy-read-after.jsonl','docs/governance/legacy-asset-decision-log.md','docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl','docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl','docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl']
SOURCE_PATHS={'OUTSIDE67-PATH-002':'docs/design/harness/L2-requirements/product-requirements.md','OUTSIDE67-PATH-005':'docs/design/helix-os/L2-requirements/governance-requirements.md','OUTSIDE67-PATH-013':'docs/design/helix/L2-requirements/README.md','OUTSIDE67-PATH-031':'docs/governance/audits/l2-requirements/legacy-ai-read-entry-disposition.md','OUTSIDE67-PATH-061':'docs/governance/upstream-rebaseline-and-asset-governance-policy-2026-09-14.md'}
COUNTERPARTS={'OUTSIDE67-PATH-002':'docs/helix-harness/L2-requirements/product-requirements.md','OUTSIDE67-PATH-005':'docs/helix-os/L2-requirements/governance-requirements.md','OUTSIDE67-PATH-013':'docs/governance/audits/source-rebaseline/l2-source-register.md','OUTSIDE67-PATH-031':'docs/governance/audits/source-rebaseline/legacy-ai-read-entry-disposition.md','OUTSIDE67-PATH-061':'docs/governance/upstream-rebaseline-and-asset-governance-policy-2026-09-14.md'}
COUNTERPART_MATCH={'OUTSIDE67-PATH-002':False,'OUTSIDE67-PATH-005':False,'OUTSIDE67-PATH-013':False,'OUTSIDE67-PATH-031':True,'OUTSIDE67-PATH-061':False}
LINES={'OUTSIDE67-PATH-002':[(18,18),(22,22),(25,25),(48,48),(74,74)],'OUTSIDE67-PATH-005':[(18,18),(24,24),(49,49),(52,52),(79,84)],'OUTSIDE67-PATH-013':[(3,3),(11,11),(19,19),(25,25),(48,48)],'OUTSIDE67-PATH-031':[(7,7),(13,13),(75,75),(86,86),(93,93)],'OUTSIDE67-PATH-061':[(9,9),(21,21),(29,30),(52,53),(84,89)]}
KINDS={'OUTSIDE67-PATH-002':['harness_scope_boundary','harness_vmodel_candidate','harness_external_boundary','harness_verification_contract','harness_evidence_constraint'],'OUTSIDE67-PATH-005':['os_scope_boundary','os_improvement_trace','os_requirement_trace','os_failure_improvement_candidate','os_archive_replacement_boundary'],'OUTSIDE67-PATH-013':['shared_owner_boundary','shared_parent_projection','four_product_pair_boundary','l11_nonexecution_boundary','shared_crosswalk_status'],'OUTSIDE67-PATH-031':['ai_read_source_boundary','ai_read_owner_split','ai_read_wiring_boundary','ai_closure_status_boundary','ai_replacement_evidence_boundary'],'OUTSIDE67-PATH-061':['policy_source_authority_boundary','policy_product_boundary','policy_operation_boundary','policy_review_decision_boundary','policy_static_gate_boundary']}
PHASE_CANDIDATES={'OUTSIDE67-PATH-002':'L2-requirements','OUTSIDE67-PATH-005':'L2-requirements','OUTSIDE67-PATH-013':'upstream-governance-or-crosswalk','OUTSIDE67-PATH-031':'upstream-governance-or-crosswalk','OUTSIDE67-PATH-061':'upstream-governance-or-crosswalk'}
ROOT_KEYS={'schema','candidate_id','status','authority_effect','meaning_change_applied','successor_requirement_ids','human_decision_ref','formal_register_append','old_runtime_test_ci_execution','scope','source_holding','selection','classification_basis','four_products','documents','product_unit_count','product_unit_ids','unknown_counts','source_diffs','evidence_scan','prohibited_inference','findings','unresolved_questions','verification_scope'}
SCOPE_KEYS={'worktree','base_origin_main','base_origin_main_expected_before_fetch','base_drift_observed','base_drift_from','base_drift_to','base_drift_reason','read_only','static_only','holding_registration_id','holding_path','holding_sha256','holding_path_revision_pair_denominator','holding_record_count','current_live_source_holding_count','management_register_path','management_register_sha256','existing_reviewed_ids','remaining_before_candidate_selection','candidate_ids','candidate_count','remaining_after_candidate_selection','accounting_status','unexplored_scope','pre_isolation_commit','archive_commit','historical_capture_commit','source_unit','requirement_atoms_are_not_path_pairs','batch_width_observed','batch_width_policy','origin_main_rebaseline_required_after_2016_merge','binding_reservation','binding_registration_status'}
SCOPE_CANONICAL={'base_origin_main':HEAD,'base_origin_main_expected_before_fetch':HEAD,'base_drift_observed':False,'base_drift_from':HEAD,'base_drift_to':HEAD,'read_only':True,'static_only':True,'holding_registration_id':'MPR-SH-OUTSIDE67-001','holding_path':'docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl','holding_path_revision_pair_denominator':67,'holding_record_count':67,'current_live_source_holding_count':14,'management_register_path':'docs/governance/management-provisional-requirement-register.jsonl','existing_reviewed_ids':EXISTING,'remaining_before_candidate_selection':40,'candidate_ids':IDS,'candidate_count':5,'remaining_after_candidate_selection':35,'unexplored_scope':'all outside67 path_revision_pair not in the existing 27 or this five-source research set; candidate accounting remains scaffold evidence until any later holding admission','accounting_status':'provisional_32_of_67_research_no_formal_holding_admission','pre_isolation_commit':PRE,'archive_commit':ARCH,'historical_capture_commit':'3df81ad27157c471e004083783f37a5860eaa2ee','source_unit':'path_revision_pair','requirement_atoms_are_not_path_pairs':True,'batch_width_observed':5,'origin_main_rebaseline_required_after_2016_merge':False,'binding_reservation':'SCF-B-0074','binding_registration_status':'registered'}
SOURCE_HOLDING_KEYS={'registration_id','selected_item_ids','existing_reviewed_ids','denominator','candidate_count','reviewed_count','combined_reviewed_and_candidate_count','remaining_after_research','accounting_status'}
SOURCE_HOLDING_CANONICAL={'registration_id':'MPR-SH-OUTSIDE67-001','selected_item_ids':IDS,'existing_reviewed_ids':EXISTING,'denominator':67,'candidate_count':5,'reviewed_count':27,'combined_reviewed_and_candidate_count':32,'remaining_after_research':35,'accounting_status':'provisional_32_of_67_no_formal_holding_admission'}
SELECTION_KEYS={'candidate_ids','excluded_existing_ids','reason'}
SELECTION_CANONICAL={'candidate_ids':IDS,'excluded_existing_ids':EXISTING,'reason':'L2/L11 source-chain diversity across HARNESS and HELIX-OS plus shared cross-product L2, AI-read, and upstream-policy evidence; no exact source ID/path overlap with the existing twenty-seven'}
UNIT_KEYS={'authority_effect','candidate_kind','candidate_product','consumer_status','current_degradation_status','current_implementation_status','decision_status','degradation_status','diff_observation','failure_status','implementation_status','inference_status','legacy_degradation_status','legacy_implementation_status','meaning_change_applied','normalized_statement','phase_candidate','phase_status','product_candidates','product_status','retained_meaning','selection_reason','semantic_fields','source_anchor','source_fragment','source_item_id','source_path','source_support','successor_requirement_ids','unit_id','unresolved_questions'}
NORM_KEYS={'source_ref','status','text'}; RETAINED_KEYS={'items','source_ref','status'}; UNRESOLVED_KEYS={'items','scope','status'}; DIFF_KEYS={'source_ref','status','text'}; ANCHOR_KEYS={'commit','line','line_sha256','source_fragment'}; SOURCE_ANCHOR_KEYS={'pre_isolation','archive'}
UNRESOLVED_ITEMS=['composite_line_decomposition','product_boundary_owner','phase_authority','implementation','degradation','failure','consumer','decision','current_counterpart_relation']
SEMANTIC_FIELDS={'action':'unresolved','actor':'unresolved','condition':'unresolved','guard':'unresolved','sequence':'unresolved'}
UNIT_SELECTION_REASON='四製品境界とL2/L11 source chainに関係するsource lineを候補unitとして静的保持する。fragment外のactor/action/condition/guard/sequence、旧実装・劣化・failure・consumer・decisionのclosureを生成しない。'
EXPECTED_SOURCE_DIFF={'OUTSIDE67-PATH-002':'different','OUTSIDE67-PATH-005':'different','OUTSIDE67-PATH-013':'different','OUTSIDE67-PATH-031':'different','OUTSIDE67-PATH-061':'different'}
META_KEYS={'schema','bundle_id','binding_reservation','binding_registration_status','base_origin_main','base_origin_main_previous','candidate_ids','existing_reviewed_count','candidate_count','combined_count','denominator','remaining_after_research','anchor_count','static_only','old_runtime_test_ci_execution','authority_effect'}
LEDGER_KEYS={'schema','source_holding_registration','denominator','existing_reviewed_ids','selected_ids','selected_source_count','product_unit_candidate_count','exact_ledger_hit_count','source_anchor_count','status','formal_admission'}

def sha(b):
 if isinstance(b,Path): b=b.read_bytes()
 return hashlib.sha256(b).hexdigest()
def load(p,e,c):
 try:return json.loads(p.read_text(encoding='utf8'))
 except Exception as ex:e.append(f'{c}:{ex}');return None
def loadl(p,e,c):
 try:return [json.loads(x) for x in p.read_text(encoding='utf8').splitlines()]
 except Exception as ex:e.append(f'{c}:{ex}');return []
def blob(root,commit,path):return subprocess.check_output(['git','-C',str(root),'show',f'{commit}:{path}'])
def fail(e,code,cond):
 if cond:e.append(code)
def validate(root):
 root=Path(root).resolve(); out=root/'scaffold/rdp001-outside67-boundary-followup-074'; e=[]
 inv=load(out/'inventory.json',e,'E_INV')
 if not isinstance(inv,dict):return e
 fail(e,'E_ROOT_KEYS',set(inv)!=ROOT_KEYS)
 fail(e,'E_ID_SCHEMA',inv.get('schema')!='rdp001-outside67-followup/v1' or inv.get('candidate_id')!='RDP-001-OUTSIDE67-CHAIN-FOLLOWUP-002-005-013-031-061')
 fail(e,'E_AUTHORITY',inv.get('status')!='findings_only' or inv.get('authority_effect')!='none' or inv.get('meaning_change_applied') is not False or inv.get('old_runtime_test_ci_execution') is not False)
 sc=inv.get('scope',{})
 fail(e,'E_SCOPE_KEYS',set(sc)!=SCOPE_KEYS)
 for k,v in SCOPE_CANONICAL.items(): fail(e,f'E_SCOPE_CANONICAL:{k}',sc.get(k)!=v)
 fail(e,'E_WORKTREE',sc.get('worktree')!='/home/tenni/.helix-worktrees/outside67-next-074')
 fail(e,'E_SCOPE_REASON',sc.get('base_drift_reason')!='requested exact base b343360a is origin/main; fresh isolated worktree was created directly from that revision with no rebaseline drift.')
 fail(e,'E_SCOPE_POLICY',sc.get('batch_width_policy')!='width 5 is the observed verification width for this bundle; no safe batch upper bound is asserted; next batch requires independent source-chain review from the then-current origin/main')
 fail(e,'E_SCOPE_DIGEST',sc.get('holding_sha256')!=sha(root/HOLDING) or sc.get('management_register_sha256')!=sha(root/REGISTER))
 # only ancestor gate; HEAD may be a later commit or a merge materialization.
 head=subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip()
 if subprocess.run(['git','-C',str(root),'merge-base','--is-ancestor',sc.get('base_origin_main',''),head],stderr=subprocess.DEVNULL).returncode:e.append('E_BASE_ANCESTOR')
 hrows=loadl(root/HOLDING,e,'E_HOLDING'); by={x.get('source_item_id'):x for x in hrows}
 fail(e,'E_HOLDING_COUNT',len(hrows)!=67)
 sh=inv.get('source_holding',{})
 fail(e,'E_SOURCE_HOLDING_KEYS',set(sh)!=SOURCE_HOLDING_KEYS)
 for k,v in SOURCE_HOLDING_CANONICAL.items(): fail(e,f'E_SOURCE_HOLDING_CANONICAL:{k}',sh.get(k)!=v)
 sel=inv.get('selection',{})
 fail(e,'E_SELECTION_KEYS',set(sel)!=SELECTION_KEYS)
 for k,v in SELECTION_CANONICAL.items(): fail(e,f'E_SELECTION_CANONICAL:{k}',sel.get(k)!=v)
 fail(e,'E_EXISTING_OVERLAP',set(IDS)&set(EXISTING) or set(IDS)&set(sh.get('existing_reviewed_ids',[])))
 items=loadl(out/'selected-source-items.jsonl',e,'E_ITEMS')
 fail(e,'E_ITEM_ORDER',[x.get('source_item_id') for x in items]!=IDS)
 for x in items:
  sid=x.get('source_item_id'); h=by.get(sid,{})
  fail(e,f'E_ITEM:{sid}',sid not in IDS or x.get('source_path')!=SOURCE_PATHS.get(sid) or sid in EXISTING)
  fail(e,f'E_HOLDING_ROW:{sid}',h.get('source_item_id')!=sid or h.get('semantic_disposition')!='not_started' or h.get('legacy_catalog_record_count')!=0 or h.get('human_decision_ref') is not None)
  fail(e,f'E_ITEM_KEYS:{sid}',set(x)!={'archive_counterpart','archive_revision','artifact_kind','candidate_phase','candidate_product','legacy_evidence','phase_status','pre_isolation','product_candidates','product_status','reported_holding','source_item_id','source_path','source_unit','status'})
  cp=x.get('archive_counterpart',{})
  fail(e,f'E_COUNTERPART:{sid}',cp.get('path')!=COUNTERPARTS.get(sid) or cp.get('content_hash_matches_archive') is not COUNTERPART_MATCH[sid])
  current=(root/COUNTERPARTS[sid]).read_bytes() if (root/COUNTERPARTS[sid]).is_file() else b''
  fail(e,f'E_COUNTERPART_PROV:{sid}',cp.get('sha256')!=sha(current) or cp.get('bytes')!=len(current))
  for side,c in [('pre_isolation',PRE),('archive_revision',ARCH)]:
   got=x.get(side,{}); want=h.get('pre_isolation' if side=='pre_isolation' else 'archive',{})
   fail(e,f'E_REV:{sid}:{side}',got.get('commit')!=c or got.get('blob_oid')!=want.get('blob_oid') or got.get('sha256')!=want.get('sha256') or got.get('bytes')!=want.get('bytes') or got.get('line_count')!=len(blob(root,c,SOURCE_PATHS[sid]).decode().splitlines()))
 dif=load(out/'source-diffs.json',e,'E_DIFF') or {}; db={x.get('source_item_id'):x for x in dif.get('items',[])}
 fail(e,'E_DIFF_IDS',set(db)!=set(IDS))
 for sid in IDS:
  a=blob(root,PRE,SOURCE_PATHS[sid]); b=blob(root,ARCH,SOURCE_PATHS[sid]); d=db.get(sid,{})
  text=''.join(difflib.unified_diff(a.decode().splitlines(True),b.decode().splitlines(True),fromfile='pre-isolation',tofile='archive-revision',n=3))
  for code,cond in [(f'E_DIFF_PROV:{sid}',d.get('pre_sha256')!=sha(a) or d.get('archive_sha256')!=sha(b) or d.get('pre_bytes')!=len(a) or d.get('archive_bytes')!=len(b) or d.get('unified_diff')!=text or d.get('status')!=EXPECTED_SOURCE_DIFF[sid])]:fail(e,code,cond)
  for fn,c,raw in [('pre-isolation.md',PRE,a),('archive-revision.md',ARCH,b)]:
   p=out/'source-snapshots'/sid/fn; fail(e,f'E_SNAPSHOT:{sid}:{fn}',not p.is_file() or p.read_bytes()!=raw)
 units=loadl(out/'product-units.jsonl',e,'E_UNITS'); fail(e,'E_UNIT_COUNT',len(units)!=25); uids=[]; seen=set()
 for u in units:
  uid=u.get('unit_id'); sid=u.get('source_item_id'); uids.append(uid); sa=u.get('source_anchor',{})
  fail(e,f'E_UNIT_KEYS:{uid}',set(u)!=UNIT_KEYS)
  fail(e,f'E_UNIT_BOUNDARY:{uid}',sid not in IDS or u.get('source_path')!=SOURCE_PATHS.get(sid) or u.get('candidate_product')!='shared-cross-product' or u.get('phase_candidate')!=PHASE_CANDIDATES.get(sid) or u.get('product_candidates')!=FOUR or u.get('source_support')!='exact_line_anchor_only' or u.get('inference_status')!='none')
  idx=int(uid.rsplit('U',1)[1])-1 if uid and 'U' in uid else -1
  fail(e,f'E_UNIT_KIND:{uid}',idx<0 or idx>=5 or u.get('candidate_kind')!=KINDS.get(sid,[''])[idx] or u.get('selection_reason')!=UNIT_SELECTION_REASON)
  fail(e,f'E_UNIT_NESTED_KEYS:{uid}',set(u.get('normalized_statement',{}))!=NORM_KEYS or set(u.get('retained_meaning',{}))!=RETAINED_KEYS or set(u.get('unresolved_questions',{}))!=UNRESOLVED_KEYS or set(u.get('diff_observation',{}))!=DIFF_KEYS)
  fail(e,f'E_UNIT_CANONICAL:{uid}',u.get('authority_effect')!='none' or u.get('meaning_change_applied') is not False or u.get('successor_requirement_ids')!=[] or u.get('semantic_fields')!=SEMANTIC_FIELDS or u.get('phase_status')!='unknown_path_based_candidate_only' or u.get('product_status')!='unknown_path_based_candidate_only' or u.get('normalized_statement',{}).get('source_ref')!='source_fragment' or u.get('normalized_statement',{}).get('status')!='source_supported_exact_fragment' or u.get('normalized_statement',{}).get('text')!=u.get('source_fragment') or u.get('retained_meaning',{}).get('source_ref')!='source_fragment' or u.get('retained_meaning',{}).get('status')!='preserved_source_meaning' or u.get('retained_meaning',{}).get('items')!=[u.get('source_fragment')] or u.get('unresolved_questions')!={'items':UNRESOLVED_ITEMS,'scope':'unit','status':'open_unknowns'} or u.get('diff_observation',{}).get('source_ref')!='source-diffs.json' or u.get('diff_observation',{}).get('status')!=EXPECTED_SOURCE_DIFF.get(sid))
  fail(e,f'E_ANCHOR_ROOT:{uid}',set(sa)!=SOURCE_ANCHOR_KEYS)
  fail(e,f'E_FRAGMENT_PROVENANCE:{uid}',u.get('source_fragment')!=sa.get('pre_isolation',{}).get('source_fragment'))
  for side,c,fn in [('pre_isolation',PRE,'pre-isolation.md'),('archive',ARCH,'archive-revision.md')]:
   a=sa.get(side,{}); fail(e,f'E_ANCHOR_KEYS:{uid}:{side}',set(a)!=ANCHOR_KEYS)
   if set(a)==ANCHOR_KEYS:
    p=out/'source-snapshots'/sid/fn; lines=p.read_text(encoding='utf8').splitlines() if p.is_file() else []; line=a.get('line'); frag=a.get('source_fragment')
    fail(e,f'E_ANCHOR:{uid}:{side}',not isinstance(line,int) or line<1 or line>len(lines) or lines[line-1]!=frag or sha(frag.encode())!=a.get('line_sha256') or a.get('commit')!=c)
  key=(sid,sa.get('pre_isolation',{}).get('line')); fail(e,f'E_DUP_ANCHOR:{uid}',key in seen); seen.add(key)
  fail(e,f'E_UNKNOWN:{uid}',any(u.get(k)!='unknown' for k in ['implementation_status','current_implementation_status','legacy_implementation_status','degradation_status','current_degradation_status','legacy_degradation_status','failure_status','consumer_status','decision_status']))
  fail(e,f'E_SEMANTIC:{uid}',any(v!='unresolved' for v in u.get('semantic_fields',{}).values()))
 fail(e,'E_UNIT_IDS',len(set(uids))!=25 or inv.get('product_unit_count')!=25 or inv.get('product_unit_ids')!=uids)
 fail(e,'E_PRODUCTS',inv.get('four_products')!=[{'product':p,'status':'candidate_boundary_only','authority_effect':'none'} for p in FOUR])
 fail(e,'E_DOCUMENT_PATHS',[x.get('source_item_id') for x in inv.get('documents',[])]!=IDS or any(x.get('current_counterpart_path')!=COUNTERPARTS.get(x.get('source_item_id')) for x in inv.get('documents',[])))
 fail(e,'E_CANONICAL_TEXT',inv.get('prohibited_inference')!=['pre/archive/current hash or path observations are not semantic equivalence, authority, successor, implementation, degradation, failure, consumer closure, or decision','product-specific L2/L11 or policy path is not current authority or implementation acceptance','authority register or policy entries are not approval or completion evidence','old ledger exact hit zero is not proof of absence, completion, or approval','candidate line is not a fully decomposed requirement atom when multiple duties remain'])
 scan=load(out/'evidence-scan.json',e,'E_SCAN') or {}
 fail(e,'E_SCAN_CANONICAL',scan.get('selected_ids')!=IDS or scan.get('existing_reviewed_ids')!=EXISTING or scan.get('exact_ledger_hits')!={sid:[] for sid in IDS})
 for lf in LEDGERS:
  fail(e,f'E_LEDGER_DIGEST:{lf}',scan.get('files',{}).get(lf,{}).get('sha256')!=sha(root/lf))
  text=(root/lf).read_text(encoding='utf8',errors='replace')
  fail(e,f'E_LEDGER_EXACT:{lf}',any(token in text for token in IDS+list(SOURCE_PATHS.values())))
 fail(e,'E_UNKNOWN_COUNTS',inv.get('unknown_counts')!={k:5 for k in ['implementation','degradation','failure','consumer','decision','phase','authority','legacy_implementation','current_implementation','legacy_degradation','current_degradation']})
 meta=load(out/'meta.json',e,'E_META'); fail(e,'E_META_KEYS',not isinstance(meta,dict) or set(meta)!=META_KEYS)
 if isinstance(meta,dict):
  for k,v in {'schema':'rdp001-outside67-followup-meta/v1','bundle_id':'RDP-001-OUTSIDE67-CHAIN-FOLLOWUP-002-005-013-031-061','binding_reservation':'SCF-B-0074','binding_registration_status':'registered','base_origin_main':HEAD,'base_origin_main_previous':PREVIOUS_HEAD,'candidate_ids':IDS,'existing_reviewed_count':27,'candidate_count':5,'combined_count':32,'denominator':67,'remaining_after_research':35,'anchor_count':25,'static_only':True,'old_runtime_test_ci_execution':False,'authority_effect':'none'}.items():fail(e,f'E_META:{k}',meta.get(k)!=v)
 led=load(out/'ledger.json',e,'E_LEDGER'); fail(e,'E_LEDGER_KEYS',not isinstance(led,dict) or set(led)!=LEDGER_KEYS)
 if isinstance(led,dict):
  for k,v in {'schema':'rdp001-outside67-followup-ledger/v1','source_holding_registration':'MPR-SH-OUTSIDE67-001','denominator':67,'existing_reviewed_ids':EXISTING,'selected_ids':IDS,'selected_source_count':5,'product_unit_candidate_count':25,'exact_ledger_hit_count':0,'source_anchor_count':25,'status':'findings_only','formal_admission':False}.items():fail(e,f'E_LEDGER_META:{k}',led.get(k)!=v)
 return e

def main():
 ap=argparse.ArgumentParser(); ap.add_argument('--root'); args=ap.parse_args(); errors=validate(args.root or Path(__file__).resolve().parents[2])
 if errors: print('FAIL outside67 follow-up validator\n'+'\n'.join(errors)); return 1
 print('PASS outside67 follow-up validator: 5 source pairs / 25 exact anchors / provisional 32-of-67 static-only'); return 0
if __name__=='__main__':sys.exit(main())
