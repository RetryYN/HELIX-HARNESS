#!/usr/bin/env python3
"""Validate WR245 R2 PR-A source-only evidence against pinned Git history."""
import hashlib, json, subprocess, sys
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
BASE='7382d9c749951074d54240c5473243841c4bc765'
EV=ROOT/'scaffold/research/wr245-sec009-explicit-pair-measurement-20261031'
L4='docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json'
L5='docs/helix-security/L5-detail-design/revoke-quarantine-propagation.json'
L8='docs/helix-security/L8-unit-verification/revoke-quarantine-propagation.json'
L9='docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json'
IMMUTABLE=['measurement.json','wr245-casewise-blind-fixed.json','wr245-unlabeled-inputs-fixed.json','wr245-phase-reference-inputs-fixed.json','wr245-input-source-index.json','wr245-reference-source-index.json','wr245-postfreeze-comparison.json','multi-contract-residual-audit.json','r1-correction.json','checker-trials/trial-manifest.json','checker-trials/replay_checker_trials.py','checker-trials/inputs/l4-proposed-pr-a.json','checker-trials/inputs/l9-proposed-pr-a.json','checker-trials/inputs/l5-probe-pr-b.json','checker-trials/inputs/l8-probe-pr-b.json','checker-trials/inputs/l9-probe-pr-b.json','checker-trials/reports/pr-a-check-child-report.json','checker-trials/reports/pr-b-overlay-check-child-report.json']
def fail(s): raise ValueError(s)
def read(path): return json.loads((ROOT/path).read_text())
def source(rev,path): return subprocess.check_output(['git','-C',str(ROOT),'show',f'{rev}:{path}'])
def sha(b): return hashlib.sha256(b).hexdigest()
def resolve(doc,p):
 if not p.startswith('/'): fail('invalid RFC6901 pointer '+p)
 value=doc
 for tok in p[1:].split('/'):
  tok=tok.replace('~1','/').replace('~0','~')
  value=value[int(tok)] if isinstance(value,list) else value[tok]
 return value
def refs(doc):
 found=[]
 def walk(x):
  if isinstance(x,dict):
   if x.get('path')==L4 and isinstance(x.get('pointer'),str) and x['pointer'].startswith('/contracts/') and '/negative_classifications' in x['pointer']:
    found.append(x['pointer'])
   for v in x.values():walk(v)
  elif isinstance(x,list):
   for v in x:walk(v)
 walk(doc);return found
def main():
 m=read(EV/'pr-a-r2-static-source-measurement.json')
 if m['base_revision']!=BASE: fail('base revision changed')
 b4=json.loads(source(BASE,L4));b9=json.loads(source(BASE,L9)); c4=read(Path(L4));c5=read(Path(L5));c8=read(Path(L8));c9=read(Path(L9))
 if len(c4['failure_classifications'])!=30 or c4['negative_equivalence_classes']!={'source_rows':'failure_classifications'}:fail('L4 explicit source shape')
 if len(c9['negative_equivalence_classes'])!=30 or len(c9['integration_cases'])!=283:fail('L9 explicit arrays')
 if sum(x.get('population_state')=='positive' for x in c9['integration_cases'])!=8 or sum(x.get('population_state')=='negative' for x in c9['integration_cases'])!=275:fail('L9 explicit population counts')
 old={x['class_id']:x for x in b4['failure_classifications']};new={x['class_id']:x for x in c4['failure_classifications']}
 if not set(old).issubset(new) or any({k:v for k,v in new[cid].items() if k!='code'}!={k:v for k,v in old[cid].items() if k!='code'} for cid in old):fail('existing L4 class fields other than code changed')
 if any(new[cid]['code']!=new[cid]['expected_classification'] for cid in old):fail('L4 code projection mismatch')
 if c5!=json.loads(source(BASE,L5)):fail('L5 changed')
 if c8!=json.loads(source(BASE,L8)):fail('L8 changed')
 if c9['multi_contract_residual']!=b9['multi_contract_residual']:fail('71-row multi residual changed')
 rows=0
 for old_contract,new_contract in zip(b9['cases'],c9['cases']):
  for arr in ('positive_cases','negative_cases'):
   if len(old_contract[arr])!=len(new_contract[arr]):fail('nested row count changed')
   for a,b in zip(old_contract[arr],new_contract[arr]):
    if any(a[k]!=b[k] for k in ('id','given','when','expected_proposal')):fail('L9 source/expected semantic changed '+a['id'])
    rows+=1
 if rows!=285:fail(f'expected 285 L9 nested rows, got {rows}')
 audit=c9['negative_class_assignment_audit']
 if audit['assigned_single_contract_negative_case_count']!=275 or audit['unassigned_single_contract_negative_case_count']!=2 or len(audit['unassigned_single_contract_negative_cases'])!=2:fail('ambiguous residual assignment audit mismatch')
 if any(x['id'] in {r['case_id'] for r in audit['unassigned_single_contract_negative_cases']} for x in c9['integration_cases']):fail('ambiguous case leaked into explicit integration table')
 pta=m['consumer_pointer_audit']
 for layer,path,doc in [('L8',L8,c8),('L9',L9,c9)]:
  rp=refs(doc); expected=pta[layer]['pointer_count']
  if len(rp)!=expected:fail(f'{layer} recorded pointer count mismatch {len(rp)} != {expected}')
  prior=json.loads(source(BASE,L4));required={'code','change','axis','state','backflow_owner','expected','expected_preserved','source_pointers'}
  for pointer in rp:
   before=resolve(prior,pointer);after=resolve(c4,pointer)
   if type(before)is not type(after) or before!=after:fail(f'{layer} consumer target changed at {pointer}')
   vals=before if isinstance(before,list) else [before]
   if any(not isinstance(v,dict) or not required.issubset(v) for v in vals):fail(f'{layer} required nested fields absent {pointer}')
 # Frozen historical evidence and pre-existing reports stay byte-identical to base.
 for rel in IMMUTABLE:
  if (EV/rel).read_bytes()!=source(BASE,f'scaffold/research/wr245-sec009-explicit-pair-measurement-20261031/{rel}'):
   fail('historical frozen artifact mutated: '+rel)
 report=read(EV/'checker-trials/reports/pr-a-r2-check-child-report.json')['negative_4way']
 if report['passed'] or report['matched_case_count']!=0 or len(report['failures'])!=436:fail('checker result mismatch')
 counts={f'{k[0]}:{k[1]}':v for k,v in Counter((x.get('layer'),x.get('reason')) for x in report['failures']).items()}
 if counts!=m['checker_intermediate']['failure_counts']:fail('checker failure breakdown mismatch')
 print('PASS: source pins, L4/L9 PR-A shape, L9 285 nested semantics, 283 explicit rows, 2 unassigned ambiguous cases, 71 residual, consumer pointers, frozen evidence, and 436-failure checker report')
 print('MEASURED: L8 308 references; L9 308 references (confirmed against base); explicit population 283=8 positive+275 negative, 2 ambiguous stay nested and unassigned')
if __name__=='__main__':
 try:main()
 except (KeyError,IndexError,TypeError,ValueError,subprocess.CalledProcessError) as e:print('FAIL:',e,file=sys.stderr);sys.exit(1)
