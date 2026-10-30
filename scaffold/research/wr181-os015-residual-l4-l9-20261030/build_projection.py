#!/usr/bin/env python3
"""Apply manually sourced WR181 case-class projection; no L4 predicate is executed."""
from __future__ import annotations
import hashlib, json, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
MANIFEST=ROOT/'scaffold/research/wr181-os015-residual-l4-l9-20261030/projection-manifest.json'
BASE='64d3cf379335e0a4b034f7295a9a225a2d755986'
L3='docs/helix-os/L3-requirements/functional-requirements.json'
L4='docs/helix-os/L4-basic-design/management-authority-source-record.json'
L5='docs/helix-os/L5-detail-design/management-authority-source-record.json'
L7='docs/helix-os/L7-function-verification/management-authority-source-record.json'
L8='docs/helix-os/L8-unit-verification/management-authority-source-record.json'
L9='docs/helix-os/L9-integration-verification/management-authority-source-record.json'

def sha(b:bytes)->str:return hashlib.sha256(b).hexdigest()
def base_bytes(path:str)->bytes:return subprocess.check_output(['git','show',f'{BASE}:{path}'],cwd=ROOT)
def jload(b:bytes):return json.loads(b)
def dump(doc):return (json.dumps(doc,ensure_ascii=False,indent=2)+'\n').encode()
def pointer(doc,ptr):
    assert ptr=='' or ptr.startswith('/')
    v=doc
    for raw in ptr[1:].split('/') if ptr else []:
        t=raw.replace('~1','/').replace('~0','~')
        v=v[int(t)] if isinstance(v,list) else v[t]
    return v

def main():
    m=json.loads(MANIFEST.read_text(encoding='utf-8'))
    l3=jload(base_bytes(L3)); l4=jload(base_bytes(L4)); l5=jload(base_bytes(L5)); l7=jload(base_bytes(L7)); l8=jload(base_bytes(L8)); l9=jload(base_bytes(L9))
    assert sha(base_bytes(L4))==m['source_revisions']['L4_sha256']
    assert sha(base_bytes(L5))==m['source_revisions']['L5_sha256']
    assert sha(base_bytes(L7))==m['source_revisions']['L7_sha256']
    assert sha(base_bytes(L8))==m['source_revisions']['L8_sha256']
    assert sha(base_bytes(L9))==m['source_revisions']['L9_sha256']
    classes=m['classes']
    assert len(classes)==20 and sum(bool(c['is_new']) for c in classes)==18
    all_cases=[cid for c in classes for cid in c['case_ids']]
    assert len(all_cases)==112 and len(set(all_cases))==112
    existing={x['class_id']:x for x in l4['failure_classifications']}
    l4_template=existing['OS015-NEG-COMPOSITE-4e0c28b06920d3a9665cbe4beeaf48cea44d7b0d350dddfaec9c8471de1e86b5']
    l4_new=[]
    code_index={x['code']:i for i,x in enumerate(l4['diagnostic_contract']['codes'])}
    assert len(code_index)==len(l4['diagnostic_contract']['codes'])
    for c in sorted((x for x in classes if x['is_new']),key=lambda x:x['class_id']):
        key=c['key']; keybytes=json.dumps(key,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
        cid='OS015-NEG-COMPOSITE-'+hashlib.sha256(keybytes).hexdigest()
        assert cid==c['class_id']
        assert cid not in existing
        codepaths=[f'/diagnostic_contract/codes/{code_index[code]}' for code in dict.fromkeys(key['finding_codes'])]
        normative=['/contracts/2','/diagnostic_contract/composite_class_formation','/diagnostic_contract/algorithm_dependencies/phases']
        family=key['expected_axis']
        if family=='original_event': normative += ['/diagnostic_contract/event_fields','/diagnostic_contract/comparison_facets','/diagnostic_contract/mutation_rule']
        elif family=='classification': normative += ['/diagnostic_contract/classification_fields','/diagnostic_contract/raw_retention','/diagnostic_contract/new_classification_absence_reporting']
        elif family=='source': normative += ['/diagnostic_contract/source_fields','/diagnostic_contract/comparison_facets']
        elif family=='authority': normative += ['/diagnostic_contract/algorithm_python_document_text']
        normative += ['/diagnostic_contract/facets','/diagnostic_contract/aggregation','/diagnostic_contract/condition_values','/diagnostic_contract/return_owner','/diagnostic_contract/algorithm_python_document_text']
        l4ptrs=[{'path':L3,'pointers':['/requirements/25']},{'path':L4,'pointers':list(dict.fromkeys(normative+codepaths))}]
        for item in l4ptrs:
            for p in item['pointers']: pointer(l3 if item['path']==L3 else l4,p)
        row={
          'class_id':cid,'code':key['expected_classification'],'design_ref':l4_template['design_ref'],
          'condition':c['condition'],'expected_classification':key['expected_classification'],
          'expected':{'finding_codes':key['finding_codes']},
          'expected_preserved':l4_template['expected_preserved'],
          'expected_axis':key['expected_axis'],'expected_state':key['expected_state'],
          'backflow_owner':key['backflow_owner'],'side_effect_count':0,'source_pointers':l4ptrs}
        l4_new.append(row)
    # L4 taxonomy is formed from the manifest, which records independent manual findings;
    # no L8/L9 row or expected field participates in this construction.
    l4['failure_classifications'].extend(l4_new)
    l4_parent=next(c for c in l4['contracts'] if c['id']=='HELIXOS-L4-015-F02')
    parent_refs=l4_parent['negative_class_refs']
    new_ids=[r['class_id'] for r in l4_new]
    assert not (set(parent_refs)&set(new_ids))
    l4_parent['negative_class_refs'].extend(new_ids)
    l4_indices={r['class_id']:i for i,r in enumerate(l4['failure_classifications'])}
    l7cases=l7['connection_materials']['OS015']['case']['cases']
    l7byid={r['id']:(i,r) for i,r in enumerate(l7cases)}
    l9_new=[]
    for c in sorted((x for x in classes if x['is_new']),key=lambda x:x['class_id']):
        idx=l4_indices[c['class_id']]
        l4_row=l4['failure_classifications'][idx]
        rawptrs=[]
        for item in c['l7_raw_inputs']:
            cid=item['case_id']; l7row_index,l7row=l7byid[cid]
            assert item['l7_input_pointer']==f'/connection_materials/OS015/case/cases/{l7row_index}/given/input'
            assert l7row['given']['input']['expanded_input_sha256']==item['expanded_input_sha256']
            rawptrs.append(item['l7_input_pointer'])
        l4pointers=[f'/failure_classifications/{idx}']
        for p in l4pointers: pointer(l4,p)
        l9_new.append({
          'class_id':l4_row['class_id'],'expected_classification':l4_row['expected_classification'],
          'expected':l4_row['expected'],
          'expected_axis':l4_row['expected_axis'],'expected_state':l4_row['expected_state'],
          'backflow_owner':l4_row['backflow_owner'],'side_effect_count':l4_row['side_effect_count'],
          'source_pointers':[{'path':L4,'pointers':l4pointers},{'path':L7,'pointers':rawptrs}]})
    l9base=jload(base_bytes(L9))
    existing_l9_ids={r['class_id'] for r in l9base['negative_equivalence_classes']}
    assert not (existing_l9_ids & {r['class_id'] for r in l9_new})
    l9base['negative_equivalence_classes'].extend(l9_new)
    l9cases={r['id']:r for r in l9base['integration_cases']}
    for c in classes:
        if c['is_new']: cid=c['class_id']
        elif c['existing_class_id']: cid=c['existing_class_id']
        else: raise AssertionError(c)
        for item in c['l7_raw_inputs']:
            l7row_index,l7row=l7byid[item['case_id']]
            assert l7row['given']['input']['expanded_input_sha256']==item['expanded_input_sha256']
            row=l9cases[item['case_id']]
            # An existing class ref is absent at this base; no expected/condition data is read.
            assert 'negative_class_ref' not in row
            row['negative_class_ref']=cid
            row['material_ref']={'path':L7,'pointer':item['l7_input_pointer']}
    # Exact layer-preservation checks are structural and never use a lower-layer expectation as input.
    out_l4=dump(l4); out_l9=dump(l9base)
    (ROOT/L4).write_bytes(out_l4); (ROOT/L9).write_bytes(out_l9)
    print(json.dumps({'status':'BUILT','base':BASE,'new_l4_classes':len(l4_new),'new_l9_classes':len(l9_new),'new_l9_case_links':len(all_cases),'l4_sha256':sha(out_l4),'l9_sha256':sha(out_l9)},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
