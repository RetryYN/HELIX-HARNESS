#!/usr/bin/env python3
"""PR #4007 R1: verify 50 row-specific L9 case conditions and source refs."""
from __future__ import annotations
import argparse, hashlib, json, re, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
L3='docs/helix-security/L3-requirements/functional-requirements.json'
L10='docs/helix-security/L10-verification/functional-verification.json'
L4='docs/helix-security/L4-basic-design/project-scope-isolation.json'
L8='docs/helix-security/L8-unit-verification/project-scope-isolation.json'
L9='docs/helix-security/L9-integration-verification/project-scope-isolation.json'
ROWWISE='scaffold/research/wr258-sec006-psi-explicit-20261101/rowwise-integration-design.json'
PRE='cf983f81ff09cd90fb3f8f781bdb7c7445923ee6'

def load(p): return json.loads((ROOT/p).read_text())
def pointer(doc, ref):
    cur=doc
    if ref=='': return cur
    for seg in ref.lstrip('/').split('/'):
        seg=seg.replace('~1','/').replace('~0','~')
        cur=cur[int(seg)] if isinstance(cur,list) else cur[seg]
    return cur

def expected_condition(l8id, raw):
    if '-SIDE-' in l8id:
        side=raw.get('side','origin'); req=raw.get('request',{}); ctx=raw.get('context',{})
        m=re.search(r'SIDE-(?:NULL|CONFLICT)-([A-Z]+)$',l8id)
        if m:
            field=m.group(1).lower(); actual=req.get(side,{}); expected=ctx.get('expected_'+side,{})
            value=actual.get(field,'__ABSENT__') if isinstance(actual,dict) else '__NO_SIDE__'
            target=expected.get(field,'__ABSENT__') if isinstance(expected,dict) else '__NO_EXPECTED_SIDE__'
            if value is None: return f'{side}側の{field}が明示nullであり、必須のidentity対応を確定できない。'
            if value=='__ABSENT__': return f'{side}側の{field}が入力に存在せず、必須のidentity対応を確定できない。'
            if value!=target: return f'{side}側の{field}が独立した期待値と不一致であり、他軸で補完せずscope対応を扱う。'
            raise ValueError(f'not a null/conflict case: {l8id}')
        special={
          'SEC003-L8-SIDE-INVENTED':'origin側tenantが非適用と示される一方、request originにはtenant値が存在する。',
          'SEC003-L8-SIDE-UNKNOWN-VALUES':'origin_tenant_applicableが明示nullであり、tenant適用性を確定できない。',
          'SEC003-L8-SIDE-NONAPPLICABLE-ABSENT':'origin tenantが非適用と示され、request originからtenant memberが省略されている。',
          'SEC003-L8-SIDE-UNKNOWN-SIDE':'side selectorがorigin/target以外の値であり、比較する側を選べない。',
          'SEC003-L8-SIDE-EXPECTED-NULL':'request originは存在するが、independent expected originのproject memberが明示nullである。',
          'SEC003-L8-SIDE-TARGET-NULL':'request targetのproject memberが明示nullである。',
          'SEC003-L8-SIDE-ORIGIN-MULTITARGET':'request originが単一recordでなく複数候補の配列として与えられる。'}
        if l8id in special:return special[l8id]
    if '-ASSET-CONFLICT-' in l8id:return f"asset_scope.{l8id.rsplit('-',1)[1].lower()}が比較対象のexpected targetと不一致であり、state assetのscopeを別軸から補完しない。"
    if l8id.endswith('-ASSET-UNKNOWN-KIND'):return 'asset_kindが既知のasset種別に解決せず、asset scope判定を未解決に保つ。'
    if '-OWNERS-STALE-' in l8id:return f"{l8id.rsplit('-',1)[1]} owner materialだけがstaleであり、他ownerのcurrent状態から当該materialを補完しない。"
    if l8id.endswith('-CONNECTION-ABSENT'):return 'connection_stateがabsentであり、全体system判定では明示接続不在として扱う。'
    if l8id.endswith('-CONNECTION-UNKNOWN'):return 'connection_stateがunknownであり、接続materialを確定できない状態を保持する。'
    if l8id.endswith('-CONNECTION-ENUM'):return 'connection_stateに未知のenum値が入り、既知状態へ読み替えない。'
    if '-CONNECTION-CONTENT-' in l8id:return f"request connectionの{l8id.rsplit('-',1)[1].lower()} memberがindependent expected connectionの同memberと不一致であり、join結果を未解決/矛盾として保持する。"
    if '-CONNECTION-JOIN-' in l8id:return f"request {l8id.rsplit('-',1)[1].lower()} scopeとconnection同側scopeが一致せず、connection joinを成立扱いにしない。"
    if l8id.endswith('-CONNECTION-IDENTITY-ABSENT'):return 'request connectionのidentity memberが欠落し、独立expected connectionへの同一性を解決できない。'
    if '-OPERATION-' in l8id:
        name=l8id.rsplit('-',1)[1].lower()
        if name=='empty': return 'connection allowed_operationsが空であり、requested readを許可集合に含むと扱わない。'
        if name=='invalid-list': return 'allowed_operationsに不正なnull memberが含まれ、集合内容を既知として比較しない。'
        if name=='defer': return 'operation=readに対してconnection_state=absentであり、局所deferをsystem許可へ拡張しない。'
        if name=='unknown': return 'operation値が未知であり、既知operationへ読み替えてscopeを確定しない。'
        return f'requested operation={name.lower()}はallowed_operationsに含まれず、read許可を当該operationへ拡張しない。'
    if '-FALLBACK-' in l8id:return 'fallbackが明示nullであり、既定先で補完しない。' if l8id.endswith('-NULL') else 'fallback値が未知であり、既知のfallback先へ読み替えない。'
    raise ValueError(f'unhandled L8 id: {l8id}')

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--record',type=Path); args=ap.parse_args()
    l3,l10,l4,l8,l9=(load(x) for x in (L3,L10,L4,L8,L9)); design=load(ROWWISE)
    issues=[]
    def check(ok,msg):
        if not ok: issues.append(msg)
    l4cls={x['class_id']:x for x in l4['failure_classifications']}
    l8map={x['id']:(ci,ri,x) for ci,c in enumerate(l8['cases']) for ri,x in enumerate(c['negative_cases'])}
    l9map={x['id']:x for c in l9['cases'] for x in c['negative_cases']}
    prior=subprocess.check_output(['git','show',f'{PRE}:{L9}'],cwd=ROOT)
    old=json.loads(prior); oldids={x['id']:x for c in old['cases'] for x in c['negative_cases']}
    additions=[x for x in l9map.values() if x['id'].startswith('SEC003-WR258-L9-ORACLE-')]
    check(len(additions)==50,'50 L9 additions')
    check(len(oldids)==98,'pre-fix L9 baseline has 98 rows')
    check(len(l9map)==148,'L9 total negative rows is 148')
    check([len(c['negative_cases']) for c in l9['cases']]==[93,55],'F01/F02 counts are 93/55')
    for cid,orig in oldids.items():
        cur=l9map.get(cid); exp=dict(orig); exp['negative_class_ref']=(orig.get('negative_class_assignment') or {}).get('class_id')
        check(cur==exp,'preserved old row '+cid)
    canonical_map={x['l8_case_id']:x for x in design['canonical_l8_to_l9_projection_audit']}
    seen_conditions=set(); seen_refs=set(); matches=[]
    candidate_rows=[x for x in additions if x.get('rowwise_candidate_ref')]
    by_candidate={x['rowwise_candidate_ref']:x for x in candidate_rows}
    check(len(by_candidate)==50 and len(candidate_rows)==50,'50 explicit unique candidate-to-L9 links')
    for item in design['candidate_l9_skeletons_for_50_unmatched_l8_rows']:
        l9id=next((x['id'] for x in candidate_rows if x.get('rowwise_candidate_ref')==item['candidate_id']),None); l8id=item['intended_l8_case_ref']; row=by_candidate.get(item['candidate_id']); cls=l4cls.get(row.get('negative_class_ref')) if row else None
        check(row is not None,f'rowwise candidate reference resolves {item["candidate_id"]}')
        check(row is not None,f'L9 row exists {l9id}')
        if not row: continue
        check(row.get('rowwise_candidate_ref')==item['candidate_id'],f'explicit rowwise candidate link {l9id}')
        check(item['l4_class_id']==row['negative_class_ref'] or (l9id.endswith('046') and row['negative_class_ref']=='SEC003-F02-EXPLICIT-CONNECTION-ABSENT'),f'rowwise candidate/class alignment {l9id}')
        ref=row.get('case_input_ref',{}); expected_ref={'path':L8,'pointer':None,'case_id':l8id}
        target=l8map.get(l8id)
        check(target is not None,f'L8 target exists {l8id}')
        if not target: continue
        ci,ri,l8row=target; pointer_value=f'/cases/{ci}/negative_cases/{ri}'
        check(ref.get('path')==L8 and ref.get('pointer')==pointer_value and ref.get('case_id')==l8id,f'L8 case pointer resolves {l9id}')
        canonical=canonical_map.get(l8id)
        check(canonical is not None,f'rowwise canonical mapping exists {l8id}')
        if canonical:
            check(canonical.get('function_ref')==l8row.get('function_ref'),f'function agrees with recorded rowwise mapping {l9id}')
            check(canonical.get('l4_class_id')==item.get('l4_class_id'),f'rowwise mapping class agrees {l9id}')
        check(l8id not in seen_refs,f'L8 target used once {l8id}'); seen_refs.add(l8id)
        raw=json.loads(l8row['raw_utf8']); expected_cond=expected_condition(l8id,raw)
        condition=row.get('input_condition')
        check(row.get('condition')==condition,f'row-specific condition equals recorded input condition {l9id}')
        baseline_l9=json.loads(subprocess.check_output(['git','show',f'689fcb7b237693803f487df662228d493820126f:{L9}'],cwd=ROOT))
        baseline_row=next(x for c in baseline_l9['cases'] for x in c['negative_cases'] if x['id']==l9id)
        check(row.get('source_derived_condition')==baseline_row.get('condition'),f'prior source-derived condition preserved {l9id}')
        check(condition==expected_cond,f'condition matches abstracted L8 input dimension {l9id}')
        check(condition not in seen_conditions,f'condition is row-unique {l9id}'); seen_conditions.add(condition)
        if cls:
            check(row.get('expected')==cls['expected'],f'expected derives from L4 class {l9id}')
            check(row.get('expected_preserved')==cls['expected_preserved'],f'expected_preserved derives from L4 class {l9id}')
            check(row.get('expected_classification')==cls['code'],f'classification derives from L4 class {l9id}')
            check(row.get('expected_axis')==cls['expected_axis'] and row.get('expected_state')==cls['expected_state'],f'axis/state derives from L4 class {l9id}')
        else: check(False,f'L4 class resolves {l9id}')
        ptrs=row.get('source_pointers',[])
        check(any(x.get('path')==L3 for x in ptrs) and any(x.get('path')==L10 for x in ptrs) and any(x.get('path')==L4 for x in ptrs),f'L3/L10/L4 source pointers present {l9id}')
        for p in ptrs:
            check(p.get('path') in {L3,L10,L4},f'only authorized expectation sources {l9id}')
            try: pointer(load(p['path']),p['pointer'])
            except Exception: check(False,f'source pointer resolves {l9id}:{p}')
        matches.append({'l9_id':l9id,'l8_id':l8id,'l8_pointer':pointer_value,'class_id':row['negative_class_ref'],'condition':condition})
    check(len(seen_conditions)==50,'all 50 conditions unique')
    check(len(seen_refs)==50,'50 distinct L8 case targets')
    result={'schema':'wr258-pr4007-r1-oracle-uniqueness-check.v1','evidence_kind':'scaffold','authority_effect':'none','passed':not issues,'baseline_revision':PRE,'counts':{'old_rows':len(oldids),'new_rows':len(additions),'total_l9_rows':len(l9map),'unique_input_conditions':len(seen_conditions),'unique_l8_targets':len(seen_refs)},'source_sha256':{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in (L3,L10,L4,L8,L9,ROWWISE)},'row_mapping':matches,'failures':issues}
    encoded=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
    if args.record:
        target=args.record if args.record.is_absolute() else ROOT/args.record
        with target.open('x',encoding='utf-8') as f:f.write(encoded)
    print(encoded,end=''); return 0 if result['passed'] else 1
if __name__=='__main__': raise SystemExit(main())
