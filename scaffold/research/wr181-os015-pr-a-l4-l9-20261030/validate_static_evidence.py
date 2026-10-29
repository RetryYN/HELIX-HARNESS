#!/usr/bin/env python3
"""L4/L9限定の静的証拠照合。L4 comparatorや期待を算出しない。"""
from __future__ import annotations
import hashlib, json, subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]
BASE='821a655ad6949b2a7a5344b26e3c170cccc353a6'
EVIDENCE='scaffold/research/wr181-os015-pr-a-l4-l9-20261030/case-evidence.json'
L3='docs/helix-os/L3-requirements/functional-requirements.json'
L4='docs/helix-os/L4-basic-design/management-authority-source-record.json'
L7='docs/helix-os/L7-function-verification/management-authority-source-record.json'
L9='docs/helix-os/L9-integration-verification/management-authority-source-record.json'
CLASS_IDS={
 'OS015-NEG-COMPOSITE-07c9fd844a293140f5dc77476ab8ed90116889361788956739abfdcf65b874c4',
 'OS015-NEG-COMPOSITE-4e0c28b06920d3a9665cbe4beeaf48cea44d7b0d350dddfaec9c8471de1e86b5'
}
SELECTED=[*(f'HELIXOS-L9-015-C{i:04d}' for i in range(45,62)),*(f'HELIXOS-L9-015-C{i:04d}' for i in range(102,114))]


def sha(raw): return hashlib.sha256(raw).hexdigest()
def load(path): return json.loads((ROOT/path).read_text(encoding='utf-8'))
def git_raw(revision,path): return subprocess.check_output(['git','show',f'{revision}:{path}'],cwd=ROOT)
def resolve(doc,pointer):
 assert pointer.startswith('/')
 value=doc
 for token in pointer[1:].split('/'):
  token=token.replace('~1','/').replace('~0','~')
  value=value[int(token)] if isinstance(value,list) else value[token]
 return value
def canonical_sha(value):
 raw=json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode('utf-8')
 return sha(raw)
def strip_links(row):
 clone=json.loads(json.dumps(row))
 for key in ('material_ref','negative_class_ref'): clone.pop(key,None)
 return clone

def main():
 ev=load(EVIDENCE); l3,l4,l7,l9=(load(x) for x in (L3,L4,L7,L9))
 assert ev['base_revision']==BASE and ev['case_count']==29
 assert [x['case_id'] for x in ev['case_assignments']]==SELECTED
 assert set(ev['source_pins'])=={L3,L4,L7,L9}
 docs={L3:l3,L4:l4,L7:l7,L9:l9}
 for path,pin in ev['source_pins'].items():
  assert sha(git_raw(BASE,path))==pin['base_sha256'],path
  assert sha((ROOT/path).read_bytes())==pin['candidate_sha256']==sha((ROOT/path).read_bytes()),path

 l3_req=resolve(l3,'/requirements/25')
 assert l3_req['id']=='HELIXOS-L3-015-F02'
 l4_rows={x['class_id']:x for x in l4['failure_classifications'] if x.get('class_id') in CLASS_IDS}
 l9_rows={x['class_id']:x for x in l9['negative_equivalence_classes'] if x.get('class_id') in CLASS_IDS}
 assert set(l4_rows)==set(l9_rows)==set(ev['class_definitions'])==CLASS_IDS
 f02=next(row for row in l4['contracts'] if row['id']=='HELIXOS-L4-015-F02')
 assert CLASS_IDS.issubset(set(f02['negative_class_refs']))
 for cid,definition in ev['class_definitions'].items():
  l4row=l4_rows[cid]; l9row=l9_rows[cid]
  assert definition['l4_pointer']==f"/failure_classifications/{l4['failure_classifications'].index(l4row)}"
  assert l4row['expected']['finding_codes']==definition['finding_codes']
  assert l4row['expected_axis']==definition['axis'] and l4row['expected_state']==definition['state']
  assert l4row['backflow_owner']==definition['owner']
  for field in ('expected_classification','expected','expected_axis','expected_state','backflow_owner','side_effect_count'):
   assert l9row[field]==l4row[field],(cid,field)
  assert cid.startswith('OS015-NEG-COMPOSITE-') and len(cid.rsplit('-',1)[1])==64
  for source in l4row['source_pointers']:
   assert source['path'] in (L3,L4)
   for pointer in source['pointers']: resolve(docs[source['path']],pointer)
  for source in l9row['source_pointers']:
   assert source['path'] in (L4,L7), (cid,source['path'])
   for pointer in source['pointers']: resolve(docs[source['path']],pointer)

 l7cases=l7['connection_materials']['OS015']['case']['cases']
 fixtures=l7['connection_materials']['OS015']['case']['fixture_inputs']
 fixture=fixtures['inspect']; ids={row['id']:i for i,row in enumerate(l7cases)}
 assignments=ev['case_assignments']; l9cases=l9['integration_cases']
 assert len(l9cases)==583
 covered={cid:set() for cid in CLASS_IDS}
 for a in assignments:
  cid=a['class_id']; assert cid in CLASS_IDS
  idx=ids[a['case_id']]; input_pointer=f'/connection_materials/OS015/case/cases/{idx}/given/input'
  assert a['l7_input_pointer']==input_pointer
  compact=resolve(l7,input_pointer); assert compact['base_ref']=='inspect'
  assert len(compact['replacements'])==1
  expanded=json.loads(json.dumps(fixture)); rep=compact['replacements'][0]; cur=expanded
  for token in rep['path'][:-1]: cur=cur[token]
  cur[rep['path'][-1]]=rep['value']
  assert canonical_sha(expanded)==compact['expanded_input_sha256']==a['expanded_input_sha256']
  assert a['stimulus_path']=='/'+('/'.join(str(t).replace('~','~0').replace('/','~1') for t in rep['path']))
  assert a['stimulus_value']==rep['value']
  assert [f['code'] for f in a['l4_findings']]==ev['class_definitions'][cid]['finding_codes']
  for finding in a['l4_findings']: resolve(expanded,finding['pointer'])
  row=next(r for r in l9cases if r['id']==a['case_id'])
  assert row['negative_class_ref']==cid
  assert row['material_ref']=={'path':L7,'pointer':input_pointer}
  assert a['l9_case_pointer']==f"/integration_cases/{l9cases.index(row)}"
  covered[cid].add(input_pointer)

 for cid,row in l9_rows.items():
  pointers={ptr for s in row['source_pointers'] if s['path']==L7 for ptr in s['pointers']}
  assert pointers=={'/connection_materials/OS015/case/fixture_inputs/inspect'}|covered[cid]

 base_l9=json.loads(git_raw(BASE,L9)); base_rows=base_l9['integration_cases']
 assert len(base_rows)==len(l9cases)==583
 for i,(before,after) in enumerate(zip(base_rows,l9cases)):
  assert before['id']==after['id']
  assert strip_links(before)==strip_links(after),i
 print(json.dumps({'status':'PASS','case_count':29,'class_count':2,'l9_rows_expected_preserved':583,'source_pointer_scope':'L4: L3/L4; L9: L4/L7 only','base_revision':BASE},ensure_ascii=False))

if __name__=='__main__': main()
