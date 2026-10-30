#!/usr/bin/env python3
"""Static checks for the WR250 PR #4000 R1 scaffold addendum."""
import hashlib, json, pathlib, subprocess, sys
ROOT=pathlib.Path(__file__).resolve().parents[3]
BASE=ROOT/'scaffold/research/wr250-sec006-psi-l5l8-20261031'
L8=ROOT/'docs/helix-security/L8-unit-verification/project-scope-isolation.json'
L5=ROOT/'docs/helix-security/L5-detail-design/project-scope-isolation.json'
L4=ROOT/'docs/helix-security/L4-basic-design/project-scope-isolation.json'
L9=ROOT/'docs/helix-security/L9-integration-verification/project-scope-isolation.json'
BIND=ROOT/'scaffold/bindings/SCF-B-0201.json'
def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def check(cond,msg):
 if not cond: raise AssertionError(msg)
l8,l5,l4,l9=map(load,[L8,L5,L4,L9]); audit=load(BASE/'rowwise-comparison-r1.json'); add=load(BASE/'pr4000-r1-addendum.json'); bind=load(BIND)
neg=[r for c in l8['cases'] for r in c['negative_cases']]
check(len(neg)==52 and len(audit['l8_rows'])==52,'L8 row count must be 52')
no=[r for r in neg if r['negative_class_assignment'].get('status')=='no_receiving_l4_class']
assigned=[r for r in neg if r not in no]
check(len(no)==9 and len(assigned)==43,'expected 9 no-class and 43 assigned rows')
reasons=[r['negative_class_assignment']['reason'] for r in assigned]
check(len(set(reasons))==43,'remaining assignment reasons are not unique')
check('candidate_negative_class_assignment' not in l8,'duplicate root candidate assignment rows remain')
# Verify the exact nine no-class row ids and keep classification fields absent.
expected_no={'SEC003-L8-OPERATION-UNKNOWN','SEC003-L8-OPERATION-DEFER','SEC003-L8-FALLBACK-UNKNOWN','SEC003-L8-FALLBACK-NULL','SEC003-L8-SIDE-UNKNOWN-SIDE','SEC003-L8-ASSET-UNKNOWN-KIND','SEC003-L8-OWNERS-STALE-OS','SEC003-L8-OWNERS-STALE-INFRA','SEC003-L8-OWNERS-STALE-CONNECT'}
check({r['id'] for r in no}==expected_no,'no-class rows differ from R1 F1 list')
for r in no:
 a=r['negative_class_assignment']; check(not any(k in a for k in ['classification','rule_ref','expected_classification']),'no-class row still has receiving classification')
# Exactly the 13 corrected functions, including seven removed rows, are represented in rowwise audit.
expected_functions={**{f'SEC003-L8-CAND-{i:03}':'HELIXSECURITY-L5-003-compare_fallback' for i in [72,73,84,87,90,93,96]},**{f'SEC003-L8-CAND-{i:03}':'HELIXSECURITY-L5-003-compare_asset_scope' for i in [74,85,88,91,94,97]}}
rows={r['candidate_id']:r for r in audit['l9_rows']}
for cid,fn in expected_functions.items(): check(rows[cid].get('function_ref')==fn,f'{cid} function ref mismatch')
# The 98 L9 rows partition into 7 exact fallback duplicates and 91 retained candidate designs.
check(len(audit['l9_rows'])==98 and len(rows)==98,'L9 rows must map uniquely')
removed=[r for r in audit['l9_rows'] if r['disposition']=='candidate_removed_confirmed_existing_l8_case']
retained=[r for r in audit['l9_rows'] if r['disposition']=='retained_candidate']
check(len(removed)==7 and len(retained)==91,'expected 7 exact fallback removals and 91 retained designs')
for r in removed:
 check(r['function_ref']=='HELIXSECURITY-L5-003-compare_fallback' and r['function_read_fields']==['/request/fallback'],'removed duplicate not based on compare_fallback input')
 check(r['input_projection'][0]['state']=='present','removed fallback input must be present')
 check(r.get('input_values_and_states_equal') is True and all(x['equal'] for x in r['field_by_field_input_comparison']),'removed candidate read-field projection does not exactly match existing L8')
 check(r.get('expected_finding_code_and_pointer_equal') is True,'removed candidate expected finding/pointer does not match existing L8')
for r in retained:
 check(r['oracle_id'] is None and r['test_citation'] is None and r['execution_state']=='not_executed','candidate evidence state changed')
 if r['function_ref']=='HELIXSECURITY-L5-003-compare_operation_scope':
  states={x['path']:x['state'] for x in r['input_projection']}
  check(states.get('/request/connection_state')=='omitted','operation row omits connection_state distinction')
# Current L5 pins in invocation contract.
cur_l5=sha(L5); pins=[]
def walk(x):
 if isinstance(x,dict):
  if x.get('revision')=='current_candidate' and x.get('document')=='docs/helix-security/L5-detail-design/project-scope-isolation.json':pins.append(x)
  for v in x.values():walk(v)
 elif isinstance(x,list):
  for v in x:walk(v)
walk(l8['same_frame_invocation_contract'])
check(len(pins)==32 and all(x.get('file_sha256')==cur_l5 for x in pins),'current-candidate L5 pin mismatch')
upstream={x['path']:x['sha256'] for x in bind['upstream']}
check(upstream.get('docs/helix-security/L5-detail-design/project-scope-isolation.json')==cur_l5,'SCF-B-0201 current L5 upstream hash mismatch')
check(upstream.get('docs/helix-security/L8-unit-verification/project-scope-isolation.json')==sha(L8),'SCF-B-0201 current L8 upstream hash mismatch')
for rel in ['scaffold/research/wr250-sec006-psi-l5l8-20261031/rowwise-comparison-r1.json','scaffold/research/wr250-sec006-psi-l5l8-20261031/pr4000-r1-addendum.json','scaffold/research/wr250-sec006-psi-l5l8-20261031/validate_pr4000_r1.py']:
 check(rel in bind['artifacts'],f'SCF-B-0201 missing R1 artifact: {rel}')
# Preserve F5 comparison shape identity.
cands={x['id']:x for x in l8['candidate_unit_cases']}
check(cands['SEC003-L8-CAND-065'].get('comparison_shape_id')=='cross_scope','CAND-065 shape lost')
check(cands['SEC003-L8-CAND-083'].get('comparison_shape_id')=='same_scope_tenant','CAND-083 shape lost')
# L4/L9 remain byte-identical to reviewed head; residual stays 16.
for p in [L4,L9]:
 old=subprocess.check_output(['git','-C',str(ROOT),'show',f'{add["reviewed_head"]}:{p.relative_to(ROOT).as_posix()}'])
 check(hashlib.sha256(old).hexdigest()==sha(p),f'{p.name} differs from reviewed head')
check(l9['multi_contract_residual']['negative_case_count']==16,'L9 residual negative count must remain 16')
# Frozen commit-time artifacts remain byte-identical to reviewed head and matrix hash pointers.
for rel,h in audit['frozen_commit_time_artifacts'].items():
 p=ROOT/rel; old=subprocess.check_output(['git','-C',str(ROOT),'show',f'{add["reviewed_head"]}:{rel}'])
 check(sha(p)==h and hashlib.sha256(old).hexdigest()==h,f'frozen artifact changed: {rel}')
# Shape audit verifies source fields and expected output's stated comparison scope.
for cid,shape in [('SEC003-L8-CAND-065','cross_scope'),('SEC003-L8-CAND-083','same_scope_tenant')]:
 r=rows[cid]; check(r['comparison_shape_id']==shape,f'{cid} row audit shape mismatch')
print('PASS WR250 PR4000 R1 static validator: L8=52 (no-class=9, assigned=43 unique reasons); L9=98 (7 exact fallback matches, 91 retained); corrected refs=13; current L5 pins=32; L4/L9 unchanged; residual=16; frozen artifacts unchanged.')
