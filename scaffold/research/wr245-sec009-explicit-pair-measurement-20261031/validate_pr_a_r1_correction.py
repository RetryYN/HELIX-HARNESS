#!/usr/bin/env python3
"""Validate PR #3996 R1 SEC009 composite-class correction against c50 history."""
from __future__ import annotations
import hashlib,json,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
EV=ROOT/'scaffold/research/wr245-sec009-explicit-pair-measurement-20261031'
BASE='c50eb21b34f034262ced3f8052d2502fb84c57c9'
OLD='4ba3f600df75aa6e860e0ddf53db68644e1edf98'
OLD_L9='docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json'
L4='docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json'
L9='docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json'
L5='docs/helix-security/L5-detail-design/revoke-quarantine-propagation.json'
L8='docs/helix-security/L8-unit-verification/revoke-quarantine-propagation.json'
AMB={
 'SEC009-COMPOUND-OS-UNKNOWN-CREDENTIAL-UNAPPLIED-WORKER-CONTINUES':('SEC009_F01_RECIPIENT_COMPOSITE_FINDINGS','/cases/1/negative_cases/205'),
 'SEC009-RECOVERY-PRIOR-SOURCE-MISSING':('SEC009_F02_ISOLATION_RECOVERY_BINDING_UNRESOLVED','/cases/2/negative_cases/40')}
IMMUTABLE=['measurement.json','wr245-casewise-blind-fixed.json','wr245-unlabeled-inputs-fixed.json','wr245-phase-reference-inputs-fixed.json','wr245-input-source-index.json','wr245-reference-source-index.json','wr245-postfreeze-comparison.json','multi-contract-residual-audit.json','r1-correction.json','pr-a-r2-static-source-measurement.json','checker-trials/reports/pr-a-r2-check-child-report.json','checker-trials/inputs/l4-proposed-pr-a.json','checker-trials/inputs/l9-proposed-pr-a.json','checker-trials/inputs/l5-probe-pr-b.json','checker-trials/inputs/l8-probe-pr-b.json','checker-trials/inputs/l9-probe-pr-b.json','validate_pr_a_r2_measurement.py','validate_r2_ambiguous_source_first_design.py']
def die(s): raise ValueError(s)
def sha(b): return hashlib.sha256(b).hexdigest()
def canon(x): return sha(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def source(rev,path): return subprocess.check_output(['git','-C',str(ROOT),'show',f'{rev}:{path}'])
def read(path): return json.loads(Path(path).read_text())
def resolve(doc,p):
 if not p.startswith('/'): die('invalid RFC6901 pointer '+p)
 x=doc
 for t in p[1:].split('/'):
  t=t.replace('~1','/').replace('~0','~'); x=x[int(t)] if isinstance(x,list) else x[t]
 return x
def consumer_refs(doc):
 out=[]
 def walk(x):
  if isinstance(x,dict):
   if x.get('path')==L4 and isinstance(x.get('pointer'),str) and x['pointer'].startswith('/contracts/') and '/negative_classifications' in x['pointer']:out.append(x['pointer'])
   for v in x.values():walk(v)
  elif isinstance(x,list):
   for v in x:walk(v)
 walk(doc);return out
def main():
 corr=read(EV/'pr3996-r1-correction.json')
 if corr['historical_point']['revision']!=BASE:die('c50 historical revision mismatch')
 b4=json.loads(source(BASE,L4));b9=json.loads(source(BASE,L9));b5=json.loads(source(BASE,L5));b8=json.loads(source(BASE,L8))
 l4=read(ROOT/L4);l9=read(ROOT/L9);l5=read(ROOT/L5);l8=read(ROOT/L8)
 for name,item in corr['source_pins'].items():
  raw=source(item['revision'],item['path'])
  if sha(raw)!=item['sha256']:die('source pin mismatch '+name)
 if l5!=b5 or l8!=b8:die('PR-A changed L5/L8')
 if l4.get('negative_equivalence_classes')!={'source_rows':'failure_classifications'} or len(l4['failure_classifications'])!=32:die('L4 explicit marker/class count')
 current_hashes={L4:sha((ROOT/L4).read_bytes()),L9:sha((ROOT/L9).read_bytes())}
 if current_hashes!={L4:corr['r1_verification']['current_proposal_sha256']['L4'],L9:corr['r1_verification']['current_proposal_sha256']['L9']}:die('current proposal hash mismatch')
 readme=(EV/'README.md').read_text()
 if '6535373957' not in readme or 'PR作成側が' not in readme or '独立reviewerによる承認を意味しない' not in readme:die('README R1 decision attribution missing')
 if 'L8から308件・L9から308件' not in readme or 'RFC6901' not in readme or '別変更に限る' not in readme:die('README nested retirement condition missing')
 if len(l9['negative_equivalence_classes'])!=32 or len(l9['integration_cases'])!=285:die('L9 explicit class/integration count')
 by4={x['class_id']:x for x in l4['failure_classifications']}; old4={x['class_id']:x for x in b4['failure_classifications']}
 if not set(old4).issubset(by4):die('old L4 class IDs not preserved')
 for cid,row in old4.items():
  if {k:v for k,v in by4[cid].items() if k!='code'}!={k:v for k,v in row.items() if k!='code'}:die('old L4 class changed outside code '+cid)
  if by4[cid]['code']!=by4[cid]['expected_classification']:die('L4 code projection changed '+cid)
 rule=l4['diagnostic_contract']['composite_class_formation']
 if any(k not in rule for k in ('finding_sequence','axis_projection','overall_classification','expected_state','class_reuse')):die('composite formation rule incomplete')
 classes=corr['f1_design']['classes']
 for index,spec in enumerate(classes):
  row=by4.get(spec['class_id'])
  if row is None:die('new L4 class absent '+spec['class_id'])
  if row['expected']['finding_codes']!=spec['ordered_finding_codes'] or row['expected_axis']!=spec['expected_axis'] or row['expected_classification']!=spec['expected_classification'] or row['expected_state']!=spec['expected_state']:die('R1 class projection differs '+spec['class_id'])
  if spec['ordered_finding_codes']!=sorted(spec['ordered_finding_codes']):die('finding codes are not in L4 scalar sort order '+spec['class_id'])
  if [x['axis'] for x in spec['axis_state_basis']]!=spec['expected_axis'] or [x['state'] for x in spec['axis_state_basis']]!=spec['axis_states']:die('R1 axis-state basis order mismatch '+spec['class_id'])
  if spec['expected_state']!=spec['axis_states'][0] or spec['expected_state_basis']!=spec['axis_state_basis'][0]['source_pointer']:die('R1 scalar expected_state is not copied from first ordered axis '+spec['class_id'])
  for basis in spec['axis_state_basis']:
   path,pointer=basis['source_pointer'].split('#',1); source_doc=json.loads(source(BASE,path)); old_class=resolve(source_doc,pointer)
   if old_class.get('expected_axis')!=basis['axis'] or old_class.get('expected_state')!=basis['state']:die('R1 axis/state not derived from existing L4 class '+spec['class_id']+'/'+basis['axis'])
  for pointer in row['source_pointers']:
   if 'L9-integration-verification' in pointer['path']:die('L9 comparison target misrepresented as source authority '+spec['class_id'])
   source_doc=json.loads((ROOT/pointer['path']).read_text())
   resolve(source_doc,pointer['pointer'])
  for pointer in row['expectation_comparison_refs']:
   if not pointer['path'].endswith('L9-integration-verification/revoke-quarantine-propagation.json'):die('non-L9 expectation comparison ref '+spec['class_id'])
   resolve(json.loads((ROOT/pointer['path']).read_text()),pointer['pointer'])
  contract=next(x for x in l4['contracts'] if x['id']==row['design_ref'])
  if contract['negative_class_refs'].count(spec['class_id'])!=1:die('L4 reverse ref missing/duplicate '+spec['class_id'])
 if len(l4['contracts'][1]['negative_class_refs'])!=15 or len(l4['contracts'][2]['negative_class_refs'])!=13:die('L4 F01/F02 reverse reference totals')
 rule_text=' '.join(str(v) for v in l4['diagnostic_contract']['composite_class_formation'].values())
 if any(s not in rule_text for s in ('code, pointer, return_owner','重複','result.condition','expected_state','再利用可能')) or 'severity_order' in rule_text or 'severity ' in rule_text:die('L4 composite formation rule missing ordering/state/reuse or adds an unsupported severity rule')
 reuse=l4['diagnostic_contract']['composite_class_formation']['class_reuse']
 if any(k not in reuse for k in ('expected_classification','finding_codes','backflow_owner','expected_axis','expected_state','owner_ref')):die('class reuse must include every QA key component')
 os015=json.loads(source(BASE,'docs/helix-os/L4-basic-design/management-authority-source-record.json'))
 if os015['diagnostic_contract']['composite_class_formation']['purpose']=='' or sum(x.get('class_id','').startswith('OS015-NEG-COMPOSITE') for x in os015['failure_classifications'])!=22:die('OS015 composite precedent changed')
 old_fixture=json.loads(source(OLD,OLD_L9))
 for example in corr['f1_design']['source_input_examples']:
  case=resolve(old_fixture,example['input_pointer'])
  if canon(case)!=example['canonical_input_sha256']:die('historical source input digest mismatch '+example['case_id'])
  for ptr,value in example['observations'].items():
   if resolve(case,ptr)!=value:die('historical source input fact mismatch '+example['case_id']+ptr)
 if l9['negative_class_assignment_audit']!=b9['negative_class_assignment_audit']:die('historical L9 assignment audit rewritten')
 addon=l9.get('negative_class_assignment_audit_r1_addendum',{})
 if addon.get('prior_audit_preserved_exactly') is not True or addon.get('effective_counts_after_r1',{}).get('assigned_single_contract_negative_case_count')!=277:die('R1 audit addendum incomplete')
 if l9['multi_contract_residual']!=b9['multi_contract_residual']:die('71 multi-contract residual changed')
 rows=0
 for oldc,newc in zip(b9['cases'],l9['cases']):
  for key in ('positive_cases','negative_cases'):
   if len(oldc[key])!=len(newc[key]):die('nested L9 case count changed')
   for a,b in zip(oldc[key],newc[key]):
    if any(a[k]!=b[k] for k in ('id','given','when','expected_proposal')):die('L9 existing expected semantics changed '+a['id'])
    rows+=1
 if rows!=285:die('expected 285 nested L9 cases')
 for cid,(class_id,pointer) in AMB.items():
  nested=resolve(l9,pointer)
  if nested['id']!=cid or nested.get('negative_class_assignment',{}).get('classification')!=class_id:die('nested assignment missing/mismatch '+cid)
  spec=next(x for x in corr['f1_design']['classes'] if x['class_id']==class_id)
  proposal=nested['expected_proposal']
  if proposal['condition']!=spec['expected_classification'] or [f['code'] for f in proposal['findings']]!=spec['ordered_finding_codes']:die('L9 expected proposal differs from source-derived class '+cid)
  if cid=='SEC009-COMPOUND-OS-UNKNOWN-CREDENTIAL-UNAPPLIED-WORKER-CONTINUES':
   axis_states=[proposal['recipient_correspondence'][name] for name in ('worker_execution','credential_use','os_assignment')]
  else: axis_states=[proposal['isolation_correspondence'],proposal['recovery_correspondence']]
  if axis_states!=spec['axis_states']:die('L9 expected axes/states differ from source-derived class '+cid)
  ref=next(r for r in l9['integration_cases'] if r['id']==cid)
  if ref.get('negative_class_ref')!=class_id:die('integration class ref mismatch '+cid)
  if class_id not in {r['class_id'] for r in l9['negative_equivalence_classes']}:die('L9 class row missing '+cid)
  for pointer_ref in nested['negative_class_assignment']['source_pointers']:
   resolve(read(pointer_ref['path']),pointer_ref['pointer'])
  case_ref=next(r for c in l9['cases'] for r in c['source_case_refs'] if r['id']==cid)
  if case_ref.get('negative_classification_ref')!=class_id or 'unassigned_classification_reason' in case_ref:die('nested source index not updated '+cid)
 # Current binding pins must follow the new source bytes while preserving each prior revision/hash and consumer role.
 for bid in ('SCF-B-0196','SCF-B-0197','SCF-B-0209'):
  oldbind=json.loads(source(BASE,f'scaffold/bindings/{bid}.json'));newbind=read(f'scaffold/bindings/{bid}.json')
  if newbind.get('role')!=oldbind.get('role') or newbind.get('connections',{}).get('consumers')!=oldbind.get('connections',{}).get('consumers'):die('binding role/consumer changed '+bid)
  for path in (L4,L9):
   oldpin=next(x for x in oldbind['upstream'] if x['path']==path)['sha256'];current=next(x for x in newbind['upstream'] if x['path']==path)
   if current['sha256']!=current_hashes[path] or BASE not in current.get('note','') or oldpin not in current.get('note',''):die('binding current/history pin mismatch '+bid+'/'+path)
   history=current.get('note','')
   old_note=next(x for x in oldbind['upstream'] if x['path']==path).get('note','')
   if not old_note or old_note not in history:die('prior binding note/history not retained '+bid+'/'+path)
 #
 for f in IMMUTABLE:
  path=EV/f
  if path.read_bytes()!=source(BASE,f'scaffold/research/wr245-sec009-explicit-pair-measurement-20261031/{f}'):die('R2 fixed evidence changed '+f)
 for layer,path,doc in [('L8',L8,l8),('L9',L9,l9)]:
  refs=consumer_refs(doc)
  if len(refs)!=308:die(f'{layer} consumer refs not 308 ({len(refs)})')
  for pointer in refs:
   before=resolve(b4,pointer);after=resolve(l4,pointer)
   if type(before)is not type(after) or before!=after:die(f'{layer} nested consumer target changed {pointer}')
 report=read(EV/'checker-trials/reports/pr-a-r1-correction-check-child-report.json')['negative_4way']
 if report['passed'] or report['matched_case_count']!=0 or len(report['failures'])!=448:die('R1 partial checker result mismatch')
 summary=corr['r1_verification']['current_checker']
 if any(summary.get(k)!=v for k,v in {'exit_code':1,'passed':False,'failure_count':448,'matched_case_count':0}.items()):die('R1 correction checker summary mismatch')
 print('PASS: c50 historical validators/artifacts, 32-class source projection, 285 L9 rows, two assignments, 71 residuals, L5/L8 unchanged, 308/308 nested pointers, 448-Failure partial checker')
if __name__=='__main__':
 try:main()
 except (KeyError,IndexError,TypeError,ValueError,subprocess.CalledProcessError) as e:print('FAIL:',e,file=sys.stderr);sys.exit(1)
