#!/usr/bin/env python3
"""Validate source-first design notes for the two WR245 ambiguous cases."""
from __future__ import annotations
import hashlib, json, subprocess, sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
BASE='7382d9c749951074d54240c5473243841c4bc765'
OLD='4ba3f600df75aa6e860e0ddf53db68644e1edf98'
AUDIT=HERE/'r2-ambiguous-source-first-design.json'
MEAS=HERE/'measurement.json'
PATHS={
 'L3B':'docs/helix-security/L3-requirements/business-requirements.json','L3F':'docs/helix-security/L3-requirements/functional-requirements.json',
 'L4':'docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json','L5':'docs/helix-security/L5-detail-design/revoke-quarantine-propagation.json',
 'L9':'docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json',
 'L10B':'docs/helix-security/L10-verification/business-verification.json','L10F':'docs/helix-security/L10-verification/functional-verification.json'}
PINS={'L3B':'f1668180a3daccb38da15f471ade0806c64f094a77b0d7a5cef25edc9b6ce901','L3F':'e4eeb70cc303e44199c7d898281e91c22dba89b47666353b9c80a4c634e898b5','L4':'c0a31c5c663d39854ed1df13b9bf2bfc439fdb46419d089bc617607d6e6ac5b6','L5':'90c3761e88ea76fefe1222372ffa1218afcf2fc8cb4dec666ca8b7ca98bd8734','L9':'62913b58577cfc0f3c7e6682ad160d8f236157a0ceed9c88ef71822330ed60fc','L10B':'c34b8f9a99f8f240558458dd63033acd0d756dfe61ad9cd3aac0e8e1c8193f42','L10F':'e6da7eaff29a623b5d069801280c295d9dd7cc43b51d9cde25b12a8110e5072a'}
OLD_L9_SHA='ed74cdc558bd8ba9cad5d8b075eee137bafba9c65e9a4a18bb862c728b646b4f'
def die(s): raise ValueError(s)
def sha(b): return hashlib.sha256(b).hexdigest()
def canon(x): return sha(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def show(rev,path): return subprocess.check_output(['git','-C',str(ROOT),'show',f'{rev}:{path}'])
def get(o,p):
 for part in p.strip('/').split('/') if p else []: o=o[int(part)] if isinstance(o,list) else o[part]
 return o
def main():
 a=json.loads(AUDIT.read_bytes()); m=json.loads(MEAS.read_bytes()); docs={}
 for k,p in PATHS.items():
  b=show(BASE,p)
  if sha(b)!=PINS[k] or a['source_pins'][k]['sha256']!=PINS[k]: die(f'source pin mismatch {k}')
  docs[k]=json.loads(b)
 oldb=show(OLD,PATHS['L9'])
 if sha(oldb)!=OLD_L9_SHA or sha(oldb)!=a['historical_input_source']['sha256']: die('historical L9 pin mismatch')
 old=json.loads(oldb); l9=docs['L9']; cl={x['class_id']:x for x in docs['L4']['failure_classifications']}
 if len(a.get('candidates',[]))!=2: die('expected two candidate rows')
 refs={x['case_id']:x for x in m['assignment_comparison']['unassigned_ambiguous_cases']}
 for row in a['candidates']:
  cid=row['case_id']; curref=refs.get(cid)
  if curref is None: die(f'case not in ambiguous inventory: {cid}')
  current=get(l9,curref['case_pointer'])
  if current['id']!=cid: die(f'current L9 ID mismatch: {cid}')
  if row['current_case_pointer']!=PATHS['L9']+'#'+curref['case_pointer']: die(f'current pointer mismatch: {cid}')
  srcptr=row['source_input']['input_pointer']; src=get(old,srcptr); index=int(srcptr.split('/')[2]); source_case=old['cases'][index]
  if source_case['id']!=cid or canon(src)!=row['source_input']['input_sha256_canonical_json']: die(f'historical source input mismatch: {cid}')
  for fact in row['source_input']['facts']:
   value=get(src,fact['input_pointer']) if fact['present'] else None
   if fact['present']:
    if value!=fact['value']: die(f'source input fact mismatch {cid} {fact["input_pointer"]}')
   else:
    try:get(src,fact['input_pointer']);die(f'expected absent source field {cid} {fact["input_pointer"]}')
    except (KeyError,IndexError,TypeError):pass
  for cross in row['source_classification_basis']['cross_layer_contracts']:
   req=cross['L3_requirement_id']; l3k='L3B' if req.endswith('B01') else 'L3F'; l3doc=docs[l3k]
   l3i=next(i for i,x in enumerate(l3doc['requirements']) if x['id']==req); l3=l3doc['requirements'][l3i]
   l4i=next(i for i,x in enumerate(docs['L4']['contracts']) if x['requirement_ref']==req); l4c=docs['L4']['contracts'][l4i]
   o_id=l4c['system_oracle_ref']; l10k='L10B' if o_id.endswith('B01') else 'L10F'; l10doc=docs[l10k]
   o_i=next(i for i,x in enumerate(l10doc['cases']) if x['id']==o_id); oracle=l10doc['cases'][o_i]
   checks=(cross['L3_pointer']==f'{PATHS[l3k]}#/requirements/{l3i}',cross['L3_obligation']==l3['obligation'],cross['L10_oracle_id']==o_id,cross['L10_pointer']==f'{PATHS[l10k]}#/cases/{o_i}',cross['L10_failure_observation']==oracle['failure_observation'],cross['L4_contract_id']==l4c['id'],cross['L4_pointer']==f'{PATHS["L4"]}#/contracts/{l4i}',cross['L4_input_meaning']==l4c['input_meaning'],cross['L4_output_meaning']==l4c['output_meaning'])
   if not all(checks): die(f'cross-layer source mismatch: {cid}/{req}')
  for option in row['source_classification_basis']['existing_L4_class_options']:
   srcclass=cl.get(option['class_id'])
   if srcclass is None: die(f'existing class missing: {cid}/{option["class_id"]}')
   if any(option[k]!=srcclass.get(k) for k in ['condition','expected_classification','expected','expected_axis','expected_state','backflow_owner','design_ref']): die(f'existing class source mismatch: {cid}/{option["class_id"]}')
  candidate=row['candidate']
  if candidate['provisional_class_id'] in cl or candidate['collision_in_current_L4']: die(f'provisional candidate ID collision: {cid}')
  if candidate['exact_pattern_population_count_in_historical_356_cases']!=1: die(f'candidate pattern uniqueness audit changed: {cid}')
  if row['upstream_conflict']['found']: die(f'upstream conflict marked found without contradiction evidence: {cid}')
  if row['selection_note'].find('L9 expectation was not used')<0: die(f'not source-first: {cid}')
  if curref['case_id']!=cid: die(f'ambiguous source list mismatch: {cid}')
 multi=l9['multi_contract_residual']['source_case_refs']
 if len(multi)!=71 or a['carry_forward_controls']['71_multi_contract'].find('71')<0: die('71 multi-contract carry-forward mismatch')
 if m['l8_l9_pair_measurement']['consumer_reference_inventory']['L8_to_L4_contract_nested_classifications']['pointer_count']!=308: die('L8 nested pointer count changed')
 if m['l8_l9_pair_measurement']['consumer_reference_inventory']['L9_to_L4_contract_nested_classifications']['pointer_count']!=308: die('L9 nested pointer count changed')
 if a['carry_forward_controls']['formal_files_changed'] or a['carry_forward_controls']['fixed_blind_changed']: die('draft incorrectly claims formal or blind mutation')
 print('PASS: two source-first candidate rows, source pins/facts, class options, L3/L10/L4 targets, singleton population notes, 71 residual carry-forward, and nested 308-pointer controls')
 print('BOUNDARY: source-first artifact records the pre-PR-A candidate state; formal PR-A changes are checked separately')
 return 0
if __name__=='__main__':
 try: raise SystemExit(main())
 except (KeyError,IndexError,TypeError,ValueError,subprocess.CalledProcessError) as e: print('FAIL:',e,file=sys.stderr);raise SystemExit(1)
