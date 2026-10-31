#!/usr/bin/env python3
"""PR #4007 R2: static checks for L9 authority direction and evidence refs."""
from __future__ import annotations
import argparse, hashlib, json, re, subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]
L3='docs/helix-security/L3-requirements/functional-requirements.json'
L10='docs/helix-security/L10-verification/functional-verification.json'
L4='docs/helix-security/L4-basic-design/project-scope-isolation.json'
L8='docs/helix-security/L8-unit-verification/project-scope-isolation.json'
L9='docs/helix-security/L9-integration-verification/project-scope-isolation.json'
BIND='scaffold/bindings/SCF-B-0218.json'
MAPPING='scaffold/research/wr258-sec006-psi-explicit-20261101/pr-b-l8-integration-case-ref-candidate-r2.json'
ROWWISE='scaffold/research/wr258-sec006-psi-explicit-20261101/rowwise-integration-design.json'
ROWWISE_COMMIT='f32812ea08cc88545ea228e71146738553ae1e35'
ROWWISE_SHA='567ba03eff6607c3603b10c9bb443bf06c890364c0aa2106299cc92a81583004'
PRE_R1='cf983f81ff09cd90fb3f8f781bdb7c7445923ee6'
PRE_R2='d3b0b1777f3cf35d604d20ad18a177cc9f85caa3'
REMOVED_FIELDS=('input_condition','source_derived_condition','case_input_ref','rowwise_candidate_ref','candidate_disposition','expected_observation')

def load(path): return json.loads((ROOT/path).read_text())
def git_json(rev,path): return json.loads(subprocess.check_output(['git','show',f'{rev}:{path}'],cwd=ROOT))
def json_pointer(data,pointer):
    cur=data
    for segment in pointer.lstrip('/').split('/') if pointer else []:
        segment=segment.replace('~1','/').replace('~0','~')
        cur=cur[int(segment)] if isinstance(cur,list) else cur[segment]
    return cur

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--record',type=Path); a=ap.parse_args(); failures=[]
    def check(ok,label):
        if not ok: failures.append(label)
    l3,l10,l4,l8,l9,binding,mapping=(load(x) for x in (L3,L10,L4,L8,L9,BIND,MAPPING))
    l4classes={x['class_id']:x for x in l4['failure_classifications']}
    l9rows={r['id']:r for c in l9['cases'] for r in c['negative_cases']}
    oldrows={r['id']:r for c in git_json(PRE_R1,L9)['cases'] for r in c['negative_cases']}
    pre_r2={r['id']:r for c in git_json(PRE_R2,L9)['cases'] for r in c['negative_cases']}
    added=[r for r in l9rows.values() if r['id'].startswith('SEC003-WR258-L9-ORACLE-')]
    check(len(l4classes)==15,'L4 class count is 15')
    check(len(oldrows)==98,'frozen pre-R1 L9 row count is 98')
    check(len(added)==50,'R1 additions remain 50 rows')
    check(len(l9rows)==148,'L9 total row count is 148')
    check([len(c['negative_cases']) for c in l9['cases']]==[93,55],'F01/F02 row counts are 93/55')
    check(all(r.get('negative_class_ref') in l4classes for r in l9rows.values()),'all L9 rows resolve class refs')
    check(set(l4classes)=={r.get('negative_class_ref') for r in l9rows.values()},'all 15 classes have L9 row coverage')
    for case_id,original in oldrows.items():
        current=l9rows.get(case_id); expected=dict(original); expected['negative_class_ref']=(original.get('negative_class_assignment') or {}).get('class_id')
        check(current==expected,f'old row preserved except direct class ref: {case_id}')
    condition_set=set(); repr_count=0
    for row in added:
        rid=row['id']; prior=pre_r2.get(rid)
        check(prior is not None,f'R1 source row exists: {rid}')
        if prior:
            reduced=dict(prior)
            for field in REMOVED_FIELDS: reduced.pop(field,None)
            check(row==reduced,f'R2 row changes only by removing duplicated/directional metadata: {rid}')
        condition=row.get('condition')
        check(isinstance(condition,str) and bool(condition.strip()),f'case-specific condition present: {rid}')
        check(condition not in condition_set,f'case-specific condition unique: {rid}')
        condition_set.add(condition)
        check(not any(k in row for k in REMOVED_FIELDS),f'L8-direction/candidate/duplicate fields removed: {rid}')
        check(row.get('execution_state')=='not_executed' and row.get('actual_observation')=='not_observed',f'case remains unexecuted: {rid}')
        cls=l4classes.get(row.get('negative_class_ref'))
        check(cls is not None,f'L4 class resolves: {rid}')
        if cls:
            check(row.get('expected')==cls['expected'],f'expected derives from L4 class: {rid}')
            check(row.get('expected_preserved')==cls['expected_preserved'],f'expected_preserved derives from L4 class: {rid}')
            check(row.get('expected_classification')==cls['code'],f'classification derives from L4 class: {rid}')
            check(row.get('expected_axis')==cls['expected_axis'] and row.get('expected_state')==cls['expected_state'],f'axis/state derive from L4 class: {rid}')
        pointers=row.get('source_pointers',[])
        check({x.get('path') for x in pointers}=={L3,L10,L4},f'only L3/L10/L4 expectation sources: {rid}')
        for item in pointers:
            try: json_pointer(load(item['path']),item['pointer'])
            except Exception: check(False,f'source pointer resolves {rid}: {item}')
        rendered=json.dumps({k:row.get(k) for k in ('condition','expected','expected_preserved')},ensure_ascii=False)
        repr_count += len(re.findall(r"(?<![A-Za-z0-9_])(?:b|bytearray)\s*['\"]",rendered))
    check(len(condition_set)==50,'50 conditions remain unique')
    check(repr_count==0,'zero Python reprs in case condition/expectation material')
    # The large rowwise artifact is not checked in at current HEAD. Verify its fixed Git source and the compact PR-B candidate derived from it.
    blob=subprocess.check_output(['git','show',f'{ROWWISE_COMMIT}:{ROWWISE}'],cwd=ROOT)
    check(hashlib.sha256(blob).hexdigest()==ROWWISE_SHA,'f328 rowwise source blob hash matches disposition')
    historical=json.loads(blob)
    expected_pairs={x['candidate_id']:(x['intended_l8_case_ref'],f"SEC003-WR258-L9-ORACLE-{x['candidate_id'].rsplit('-',1)[1]}") for x in historical['candidate_l9_skeletons_for_50_unmatched_l8_rows']}
    mapped={x['candidate_id']:(x['l8_case_id'],x['l9_integration_case_ref']) for x in mapping.get('rows',[])}
    check(len(mapped)==50 and mapped==expected_pairs,'PR-B candidate mapping is exactly the fixed rowwise pair set')
    check(mapping.get('counts')=={'rows':50,'unique_l8_ids':50,'unique_l9_refs':50},'PR-B candidate has 50 unique L8 and L9 refs')
    for row in mapping.get('rows',[]):
        check(row.get('status')=='candidate_not_applied','PR-B mapping remains unapplied')
        target=l9rows.get(row.get('l9_integration_case_ref'))
        check(target is not None,f'PR-B L9 reference resolves: {row.get("candidate_id")}')
        if target: check(row.get('l4_class_id')==target['negative_class_ref'],f'PR-B class correspondence: {row.get("candidate_id")}')
    check(all('integration_case_ref' not in r for c in l8['cases'] for r in c['negative_cases']),'canonical L8 remains unchanged in PR-A')
    current_l9_sha=hashlib.sha256((ROOT/L9).read_bytes()).hexdigest()
    pin=next((x.get('sha256') for x in binding['upstream'] if x.get('path')==L9),None)
    check(pin==current_l9_sha,'SCF-B-0218 current L9 pin matches bytes')
    result={'schema':'wr258-pr4007-r2-static-validation.v1','evidence_kind':'scaffold','authority_effect':'none','passed':not failures,'baseline_revisions':{'pre_r1':PRE_R1,'pre_r2':PRE_R2,'rowwise_fixed_commit':ROWWISE_COMMIT},'counts':{'l4_classes':len(l4classes),'l9_old_rows':len(oldrows),'l9_r1_additions':len(added),'l9_total_rows':len(l9rows),'unique_conditions':len(condition_set),'python_repr_occurrences':repr_count,'prb_candidate_rows':len(mapping.get('rows',[]))},'sha256':{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in (L3,L10,L4,L8,L9,MAPPING,BIND)},'rowwise_rebuild_source':{'git_blob':subprocess.check_output(['git','rev-parse',f'{ROWWISE_COMMIT}:{ROWWISE}'],cwd=ROOT,text=True).strip(),'sha256':ROWWISE_SHA,'current_path_absent':not (ROOT/ROWWISE).exists()},'failures':failures}
    encoded=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
    if a.record:
        target=a.record if a.record.is_absolute() else ROOT/a.record
        with target.open('x',encoding='utf-8') as f:f.write(encoded)
    print(encoded,end=''); return 0 if result['passed'] else 1
if __name__=='__main__': raise SystemExit(main())
