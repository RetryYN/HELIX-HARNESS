#!/usr/bin/env python3
import argparse, difflib, hashlib, json, subprocess, sys
from pathlib import Path

FOUR=["HELIX-HARNESS","HELIX-OS","HELIX-Web","HELIX-Web-OS"]
IDS=["OUTSIDE67-PATH-030","OUTSIDE67-PATH-033","OUTSIDE67-PATH-043","OUTSIDE67-PATH-045","OUTSIDE67-PATH-055"]
EXISTING={"OUTSIDE67-PATH-008","OUTSIDE67-PATH-011","OUTSIDE67-PATH-059","OUTSIDE67-PATH-063","OUTSIDE67-PATH-064","OUTSIDE67-PATH-065","OUTSIDE67-PATH-066"}
PRE="2d4991042be55268bac30a8bbcdac45b3865030a"; ARCH="064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
HOLDING="docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl"; REGISTER="docs/governance/management-provisional-requirement-register.jsonl"
LEDGERS=["docs/governance/legacy-asset-disposition.jsonl","docs/governance/legacy-asset-decisions.jsonl","docs/governance/legacy-asset-copy-read-after.jsonl","docs/governance/legacy-asset-decision-log.md","docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl","docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl","docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"]
SOURCE_PATHS={"OUTSIDE67-PATH-030":"docs/governance/audits/l2-requirements/legacy-ai-consumer-relation-inventory.md","OUTSIDE67-PATH-033":"docs/governance/audits/l2-requirements/legacy-ci-consumer-relation-inventory.md","OUTSIDE67-PATH-043":"docs/governance/audits/l2-requirements/new-generation-operational-quality-source-crosswalk.md","OUTSIDE67-PATH-045":"docs/governance/audits/l2-requirements/new-generation-release-composition-source-crosswalk.md","OUTSIDE67-PATH-055":"docs/governance/candidates/legacy-asset-retirement-requirements.md"}
COUNTERPARTS={"OUTSIDE67-PATH-030":"docs/governance/audits/source-rebaseline/legacy-ai-consumer-relation-inventory.md","OUTSIDE67-PATH-033":"docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md","OUTSIDE67-PATH-043":"docs/governance/audits/source-rebaseline/new-generation-operational-quality-source-crosswalk.md","OUTSIDE67-PATH-045":"docs/governance/audits/source-rebaseline/new-generation-release-composition-source-crosswalk.md","OUTSIDE67-PATH-055":"docs/governance/candidates/legacy-asset-retirement-requirements.md"}
COUNTERPART_MATCH={"OUTSIDE67-PATH-030":True,"OUTSIDE67-PATH-033":True,"OUTSIDE67-PATH-043":True,"OUTSIDE67-PATH-045":True,"OUTSIDE67-PATH-055":False}
LINES={"OUTSIDE67-PATH-030":[15,20,22,23,24],"OUTSIDE67-PATH-033":[26,28,29,30,36],"OUTSIDE67-PATH-043":[20,28,30,31,34],"OUTSIDE67-PATH-045":[19,21,31,33,36],"OUTSIDE67-PATH-055":[26,27,35,36,38]}
UNIT_COUNT=25; ROOT_KEYS={'schema','candidate_id','status','authority_effect','meaning_change_applied','successor_requirement_ids','human_decision_ref','formal_register_append','old_runtime_test_ci_execution','scope','source_holding','selection','classification_basis','four_products','documents','product_unit_count','product_unit_ids','unknown_counts','source_diffs','evidence_scan','prohibited_inference','findings','unresolved_questions','verification_scope'}
WORKTREE='/home/tenni/.helix-worktrees/outside67-next-candidates-066'; HEAD='dbcc0f332704302d2f8181479552e7198f102db7'; PREVIOUS_HEAD='3bb146e0b67af7e4b081019375cd76bf09fe1579'
EXISTING_ORDER=['OUTSIDE67-PATH-008','OUTSIDE67-PATH-011','OUTSIDE67-PATH-059','OUTSIDE67-PATH-063','OUTSIDE67-PATH-064','OUTSIDE67-PATH-065','OUTSIDE67-PATH-066']
SCOPE_KEYS={'worktree','base_origin_main','base_origin_main_expected_before_fetch','base_drift_observed','base_drift_from','base_drift_to','base_drift_reason','read_only','static_only','holding_registration_id','holding_path','holding_sha256','holding_path_revision_pair_denominator','holding_record_count','current_live_source_holding_count','management_register_path','management_register_sha256','existing_reviewed_ids','remaining_before_candidate_selection','candidate_ids','candidate_count','remaining_after_candidate_selection','accounting_status','unexplored_scope','pre_isolation_commit','archive_commit','historical_capture_commit','source_unit','requirement_atoms_are_not_path_pairs','batch_width_observed','batch_width_policy','origin_main_rebaseline_required_after_2010_merge','binding_id'}
SCOPE_CANONICAL={'worktree':WORKTREE,'base_origin_main':HEAD,'base_origin_main_expected_before_fetch':PREVIOUS_HEAD,'base_drift_observed':True,'base_drift_from':PREVIOUS_HEAD,'base_drift_to':HEAD,'base_drift_reason':'#2010 (4a2b46f), #2013 (f369e2f), #2014 (3a257fe), and subsequent #2015 (dbcc0f3) merges observed; explicit rebaseline/materialization performed at current origin/main dbcc0f3','read_only':True,'static_only':True,'holding_registration_id':'MPR-SH-OUTSIDE67-001','holding_path':HOLDING,'holding_sha256':'d703c9bc47f95143f6b010eebf7fead4e14402c1be26ef716b2e16f0bd2cec54','holding_path_revision_pair_denominator':67,'holding_record_count':67,'current_live_source_holding_count':14,'management_register_path':REGISTER,'management_register_sha256':'b68f3acae41fcd7796bf323e8eb3036aa13970c3af8608e13c5aaa1b237258dd','existing_reviewed_ids':EXISTING_ORDER,'remaining_before_candidate_selection':60,'candidate_ids':IDS,'candidate_count':5,'remaining_after_candidate_selection':55,'accounting_status':'provisional_12_of_67_after_candidate_research_no_formal_holding_admission','unexplored_scope':'all non-reviewed outside67 path_revision_pair except this candidate research set; denominator/Binding admission remains unfinalized','pre_isolation_commit':PRE,'archive_commit':ARCH,'historical_capture_commit':'3df81ad27157c471e004083783f37a5860eaa2ee','source_unit':'path_revision_pair','requirement_atoms_are_not_path_pairs':True,'batch_width_observed':5,'batch_width_policy':'candidate set only; no safe batch upper bound; next batch requires independent source-chain review from current origin/main','origin_main_rebaseline_required_after_2010_merge':False,'binding_id':'SCF-B-0066'}
SOURCE_HOLDING_KEYS={'registration_id','selected_item_ids','existing_reviewed_ids','denominator','candidate_count','reviewed_count','combined_reviewed_and_candidate_count','remaining_after_research','accounting_status'}
SOURCE_HOLDING_CANONICAL={'registration_id':'MPR-SH-OUTSIDE67-001','selected_item_ids':IDS,'existing_reviewed_ids':EXISTING_ORDER,'denominator':67,'candidate_count':5,'reviewed_count':7,'combined_reviewed_and_candidate_count':12,'remaining_after_research':55,'accounting_status':'provisional_12_of_67_no_formal_holding_admission'}
SELECTION_REASON='diverse consumer/admission, operational failure/recovery, release composition, and retirement evidence; no source/path overlap with existing seven'
UNIT_SELECTION_REASON='製品境界・consumer／failure／decisionのsource rowを、旧実装成立と混同せず静的保持する。source fragment外のactor/action/condition/guard/sequenceは生成しない。'
SELECTION_CANONICAL={'candidate_ids':IDS,'excluded_existing_ids':EXISTING_ORDER,'reason':SELECTION_REASON}
UNIT_KEYS={'authority_effect','candidate_kind','candidate_product','consumer_status','current_degradation_status','current_implementation_status','decision_status','degradation_status','diff_observation','failure_status','implementation_status','inference_status','legacy_degradation_status','legacy_implementation_status','meaning_change_applied','normalized_statement','phase_candidate','phase_status','product_candidates','product_status','retained_meaning','selection_reason','semantic_fields','source_anchor','source_fragment','source_item_id','source_path','source_support','successor_requirement_ids','unit_id','unresolved_questions'}
NORM_KEYS={'source_ref','status','text'}; RETAINED_KEYS={'items','source_ref','status'}; UNRESOLVED_KEYS={'items','scope','status'}; DIFF_KEYS={'source_ref','status','text'}
UNRESOLVED_ITEMS=['phase_authority','implementation','degradation','failure','consumer','decision','owner','counterpart_overlap']; SEMANTIC_FIELDS={'actor':'unresolved','action':'unresolved','condition':'unresolved','guard':'unresolved','sequence':'unresolved'}
EXPECTED_KIND={'RDP-001-OUTSIDE67-030-U001':'consumer_relation','RDP-001-OUTSIDE67-030-U002':'generated_consumer','RDP-001-OUTSIDE67-030-U003':'admission_enforcement','RDP-001-OUTSIDE67-030-U004':'recovery_relation','RDP-001-OUTSIDE67-030-U005':'history_evidence','RDP-001-OUTSIDE67-033-U001':'trigger_relation','RDP-001-OUTSIDE67-033-U002':'required_check_admission','RDP-001-OUTSIDE67-033-U003':'merge_admission_consumer','RDP-001-OUTSIDE67-033-U004':'evidence_receipt','RDP-001-OUTSIDE67-033-U005':'provider_external_state','RDP-001-OUTSIDE67-043-U001':'state_boundary','RDP-001-OUTSIDE67-043-U002':'failure_applicability','RDP-001-OUTSIDE67-043-U003':'incident_consumer','RDP-001-OUTSIDE67-043-U004':'recovery_failure','RDP-001-OUTSIDE67-043-U005':'stale_guard','RDP-001-OUTSIDE67-045-U001':'composition_boundary','RDP-001-OUTSIDE67-045-U002':'consumer_recovery','RDP-001-OUTSIDE67-045-U003':'consumer_recovery_condition','RDP-001-OUTSIDE67-045-U004':'replacement_recovery','RDP-001-OUTSIDE67-045-U005':'distribution_projection','RDP-001-OUTSIDE67-055-U001':'retirement_decision','RDP-001-OUTSIDE67-055-U002':'failure_acceptance_guard','RDP-001-OUTSIDE67-055-U003':'consumer_relation','RDP-001-OUTSIDE67-055-U004':'replacement_evidence','RDP-001-OUTSIDE67-055-U005':'read_after_guard'}
EXPECTED_DIFF={'OUTSIDE67-PATH-030':'archive_relocation_observed','OUTSIDE67-PATH-033':'archive_relocation_observed','OUTSIDE67-PATH-043':'same_revision_content','OUTSIDE67-PATH-045':'same_revision_content','OUTSIDE67-PATH-055':'same_revision_content'}
EXPECTED_SOURCE_DIFF={'OUTSIDE67-PATH-030':'archive_relocation_observed','OUTSIDE67-PATH-033':'archive_relocation_observed','OUTSIDE67-PATH-043':'same','OUTSIDE67-PATH-045':'same','OUTSIDE67-PATH-055':'same'}
ANCHOR_KEYS={'commit','line','line_sha256','source_fragment'}; SOURCE_ANCHOR_KEYS={'pre_isolation','archive'}

def sha(b):
 if isinstance(b,Path): b=b.read_bytes()
 return hashlib.sha256(b).hexdigest()
def load(p,errs,code):
 try:return json.loads(p.read_text(encoding='utf8'))
 except Exception as e:errs.append(f'{code}:{e}');return None
def loadl(p,errs,code):
 try:return [json.loads(x) for x in p.read_text(encoding='utf8').splitlines()]
 except Exception as e:errs.append(f'{code}:{e}');return []
def blob(root,c,p):return subprocess.check_output(['git','-C',str(root),'show',f'{c}:{p}'])
def validate(root):
 root=Path(root).resolve(); out=root/'scaffold/rdp001-outside67-boundary-evidence-066'; e=[]; inv=load(out/'inventory.json',e,'E_INV')
 if not isinstance(inv,dict):return e
 if set(inv)!=ROOT_KEYS:e.append('E_ROOT_KEYS')
 if inv.get('schema')!='rdp001-outside67-boundary-evidence/v1' or inv.get('candidate_id')!='RDP-001-OUTSIDE67-CANDIDATE-030-033-043-045-055':e.append('E_ID_SCHEMA')
 if inv.get('authority_effect')!='none' or inv.get('status')!='findings_only' or inv.get('old_runtime_test_ci_execution') is not False:e.append('E_AUTHORITY')
 sc=inv.get('scope',{}); head=subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip()
 if subprocess.run(['git','-C',str(root),'merge-base','--is-ancestor',sc.get('base_origin_main',''),head],stderr=subprocess.DEVNULL).returncode:e.append('E_BASE_ANCESTOR')
 if set(sc)!=SCOPE_KEYS:e.append('E_SCOPE_KEYS')
 for k,v in SCOPE_CANONICAL.items():
  if sc.get(k)!=v:e.append(f'E_SCOPE_CANONICAL:{k}')
 if sc.get('holding_path')!=HOLDING or sc.get('management_register_path')!=REGISTER:e.append('E_SCOPE_PATH')
 if sc.get('holding_sha256')!=sha(root/HOLDING) or sc.get('management_register_sha256')!=sha(root/REGISTER):e.append('E_SCOPE_DIGEST')
 hrows=loadl(root/HOLDING,e,'E_HOLDING'); by={x.get('source_item_id'):x for x in hrows}
 if len(hrows)!=67 or set(inv.get('source_holding',{}).get('selected_item_ids',[]))!=set(IDS):e.append('E_DENOMINATOR_SELECTION')
 sh=inv.get('source_holding',{})
 if set(sh)!=SOURCE_HOLDING_KEYS:e.append('E_SOURCE_HOLDING_KEYS')
 for k,v in SOURCE_HOLDING_CANONICAL.items():
  if sh.get(k)!=v:e.append(f'E_SOURCE_HOLDING_CANONICAL:{k}')
 if set(inv.get('selection',{}))!=set(SELECTION_CANONICAL):e.append('E_SELECTION_KEYS')
 for k,v in SELECTION_CANONICAL.items():
  if inv.get('selection',{}).get(k)!=v:e.append(f'E_SELECTION_CANONICAL:{k}')
 if set(inv.get('source_holding',{}).get('existing_reviewed_ids',[]))!=EXISTING:e.append('E_EXISTING')
 items=loadl(out/'selected-source-items.jsonl',e,'E_ITEMS')
 if [x.get('source_item_id') for x in items]!=IDS:e.append('E_ITEMS_ORDER')
 for x in items:
  sid=x.get('source_item_id'); h=by.get(sid,{}); p=SOURCE_PATHS.get(sid)
  if not p or x.get('source_path')!=p or sid in EXISTING:e.append(f'E_ITEM:{sid}')
  if x.get('reported_holding',{}).get('legacy_catalog_record_count')!=0 or x.get('reported_holding',{}).get('human_decision_ref') is not None:e.append(f'E_LEDGER:{sid}')
  cp=x.get('archive_counterpart',{})
  if cp.get('path')!=COUNTERPARTS.get(sid) or cp.get('content_hash_matches_archive') is not COUNTERPART_MATCH[sid]:e.append(f'E_COUNTERPART:{sid}')
  current=(root/COUNTERPARTS[sid]).read_bytes() if (root/COUNTERPARTS[sid]).is_file() else b''
  if cp.get('sha256')!=sha(current) or cp.get('bytes')!=len(current):e.append(f'E_COUNTERPART_PROV:{sid}')
  for side,c in [('pre_isolation',PRE),('archive_revision',ARCH)]:
   got=x.get(side,{}); want=h.get('pre_isolation' if side=='pre_isolation' else 'archive',{})
   if got.get('commit')!=c or got.get('blob_oid')!=want.get('blob_oid') or got.get('sha256')!=want.get('sha256') or got.get('bytes')!=want.get('bytes'):e.append(f'E_REV:{sid}:{side}')
 dif=load(out/'source-diffs.json',e,'E_DIFF') or {}; db={x.get('source_item_id'):x for x in dif.get('items',[])}
 if set(db)!=set(IDS):e.append('E_DIFF_IDS')
 for sid in IDS:
  p=SOURCE_PATHS[sid]; a=blob(root,PRE,p); b=blob(root,ARCH,p); d=db.get(sid,{})
  text=''.join(difflib.unified_diff(a.decode().splitlines(True),b.decode().splitlines(True),fromfile='pre-isolation',tofile='archive-revision',n=3))
  if d.get('pre_sha256')!=sha(a) or d.get('archive_sha256')!=sha(b) or d.get('unified_diff')!=text or d.get('status')!=EXPECTED_SOURCE_DIFF[sid]:e.append(f'E_DIFF_PROV:{sid}')
  for fn,c,raw in [('pre-isolation.md',PRE,a),('archive-revision.md',ARCH,b)]:
   pth=out/'source-snapshots'/sid/fn
   if not pth.is_file() or pth.read_bytes()!=raw:e.append(f'E_SNAPSHOT:{sid}:{fn}')
 units=loadl(out/'product-units.jsonl',e,'E_UNITS')
 if len(units)!=UNIT_COUNT:e.append('E_UNIT_COUNT')
 uids=set(); seen=set()
 for u in units:
  uid=u.get('unit_id');sid=u.get('source_item_id');uids.add(uid); sa=u.get('source_anchor',{})
  if set(u)!=UNIT_KEYS:e.append(f'E_UNIT_KEYS:{uid}')
  if sid not in IDS or u.get('source_path')!=SOURCE_PATHS.get(sid) or u.get('candidate_product')!='shared-cross-product' or u.get('phase_candidate')!='upstream-governance-or-crosswalk':e.append(f'E_UNIT_CANON:{uid}')
  if u.get('product_candidates')!=FOUR or u.get('source_support')!='exact_line_anchor_only' or u.get('inference_status')!='none':e.append(f'E_UNIT_BOUNDARY:{uid}')
  if u.get('candidate_kind')!=EXPECTED_KIND.get(uid) or u.get('selection_reason')!=UNIT_SELECTION_REASON or u.get('diff_observation',{}).get('status')!=EXPECTED_DIFF.get(sid):e.append(f'E_UNIT_CANONICAL:{uid}')
  if set(u.get('normalized_statement',{}))!=NORM_KEYS or set(u.get('retained_meaning',{}))!=RETAINED_KEYS or set(u.get('unresolved_questions',{}))!=UNRESOLVED_KEYS or set(u.get('diff_observation',{}))!=DIFF_KEYS:e.append(f'E_UNIT_NESTED_KEYS:{uid}')
  if u.get('normalized_statement',{}).get('source_ref')!='source_fragment' or u.get('normalized_statement',{}).get('status')!='source_supported_exact_fragment' or u.get('retained_meaning',{}).get('source_ref')!='source_fragment' or u.get('retained_meaning',{}).get('status')!='preserved_source_meaning' or u.get('unresolved_questions')!={'items':UNRESOLVED_ITEMS,'scope':'unit','status':'open_unknowns'} or u.get('diff_observation',{}).get('source_ref')!='source-diffs.json':e.append(f'E_UNIT_CANONICAL:{uid}')
  if u.get('authority_effect')!='none' or u.get('meaning_change_applied') is not False or u.get('successor_requirement_ids')!=[] or u.get('semantic_fields')!=SEMANTIC_FIELDS or u.get('phase_status')!='unknown_path_based_candidate_only' or u.get('product_status')!='unknown_path_based_candidate_only':e.append(f'E_UNIT_STATUS:{uid}')
  if set(sa)!=SOURCE_ANCHOR_KEYS:e.append(f'E_ANCHOR_ROOT:{uid}')
  if u.get('source_fragment')!=sa.get('pre_isolation',{}).get('source_fragment') or u.get('normalized_statement',{}).get('text')!=u.get('source_fragment') or u.get('retained_meaning',{}).get('items')!=[u.get('source_fragment')]:e.append(f'E_FRAGMENT_PROVENANCE:{uid}')
  for side,c,fn in [('pre_isolation',PRE,'pre-isolation.md'),('archive',ARCH,'archive-revision.md')]:
   a=sa.get(side,{})
   if set(a)!=ANCHOR_KEYS:e.append(f'E_ANCHOR_KEYS:{uid}:{side}');continue
   line=a.get('line'); lines=(out/'source-snapshots'/sid/fn).read_text(encoding='utf8').splitlines(); frag=a.get('source_fragment')
   if line<1 or line>len(lines) or lines[line-1]!=frag or sha(frag.encode())!=a.get('line_sha256'):e.append(f'E_ANCHOR:{uid}:{side}')
  if (sid,sa.get('pre_isolation',{}).get('line')) in seen:e.append(f'E_DUP_ANCHOR:{uid}')
  seen.add((sid,sa.get('pre_isolation',{}).get('line')))
  for k in ['implementation_status','current_implementation_status','legacy_implementation_status','degradation_status','current_degradation_status','legacy_degradation_status','failure_status','consumer_status','decision_status']:
   if u.get(k)!='unknown':e.append(f'E_UNKNOWN:{uid}:{k}')
  if any(v!='unresolved' for v in u.get('semantic_fields',{}).values()):e.append(f'E_SEMANTIC:{uid}')
 if len(uids)!=UNIT_COUNT or inv.get('product_unit_count')!=UNIT_COUNT or set(inv.get('product_unit_ids',[]))!=uids:e.append('E_UNIT_INVENTORY')
 if inv.get('four_products')!=[{'product':p,'status':'candidate_boundary_only','authority_effect':'none'} for p in FOUR]:e.append('E_PRODUCTS')
 scan=load(out/'evidence-scan.json',e,'E_SCAN') or {};
 if scan.get('selected_ids')!=IDS or scan.get('existing_reviewed_ids')!=EXISTING_ORDER or scan.get('archive_relocation_ids')!=['OUTSIDE67-PATH-030','OUTSIDE67-PATH-033'] or scan.get('content_same_ids')!=['OUTSIDE67-PATH-043','OUTSIDE67-PATH-045'] or scan.get('current_counterpart_drift_ids')!=['OUTSIDE67-PATH-055']:e.append('E_SCAN_CANONICAL')
 for lf in LEDGERS:
  if scan.get('files',{}).get(lf,{}).get('sha256')!=sha(root/lf):e.append(f'E_LEDGER_DIGEST:{lf}')
 if any(scan.get('exact_ledger_hits',{}).get(sid) for sid in IDS):e.append('E_EXACT_HIT')
 if inv.get('unknown_counts',{}).get('implementation')!=5 or inv.get('unknown_counts',{}).get('consumer')!=5:e.append('E_UNKNOWN_COUNTS')
 return e
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--root');a=ap.parse_args();errs=validate(a.root or Path(__file__).resolve().parents[2]);
 if errs:print('FAIL outside67 candidate validator\n'+'\n'.join(errs));return 1
 print('PASS outside67 candidate validator: 5 source pairs / 25 exact anchors / provisional static-only') ;return 0
if __name__=='__main__':sys.exit(main())
