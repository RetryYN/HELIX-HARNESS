#!/usr/bin/env python3
"""Static provenance, pointer, projection, and immutability checks; no product predicate."""
from __future__ import annotations
import hashlib,json,re,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
DIR=ROOT/'scaffold/research/wr181-os015-residual-l4-l9-20261030'
M=json.loads((DIR/'projection-manifest.json').read_text(encoding='utf-8'))
BASE=M['base_revision']
L3='docs/helix-os/L3-requirements/functional-requirements.json';L4='docs/helix-os/L4-basic-design/management-authority-source-record.json';L5='docs/helix-os/L5-detail-design/management-authority-source-record.json';L7='docs/helix-os/L7-function-verification/management-authority-source-record.json';L8='docs/helix-os/L8-unit-verification/management-authority-source-record.json';L9='docs/helix-os/L9-integration-verification/management-authority-source-record.json'

def sha(b):return hashlib.sha256(b).hexdigest()
def raw(rev,path):return subprocess.check_output(['git','show',f'{rev}:{path}'],cwd=ROOT)
def current(path):return (ROOT/path).read_bytes()
def obj(b):return json.loads(b)
def resolve(doc,ptr):
    assert ptr=='' or ptr.startswith('/'),ptr
    v=doc
    for part in ptr[1:].split('/') if ptr else []:
        t=part.replace('~1','/').replace('~0','~')
        v=v[int(t)] if isinstance(v,list) else v[t]
    return v
def strip_allowed_case_fields(row):
    return {k:v for k,v in row.items() if k not in ('negative_class_ref','material_ref')}

def class_key(row):return {'expected_classification':row['expected_classification'],'finding_codes':row['finding_codes'],'backflow_owner':row['backflow_owner'],'expected_axis':row['expected_axis'],'expected_state':row['expected_state'],'owner_ref':{'kind':'function_ref','id':'FN-OS015-01'}}

def candidate_id(key):return 'OS015-NEG-COMPOSITE-'+sha(json.dumps(key,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())

def audit_table_rows():
    lines=(DIR/'manual-case-audit-05614.md').read_text(encoding='utf-8').splitlines()
    start=next(i for i,l in enumerate(lines) if l.strip()=='## Candidate key一覧')
    rows=[];in_table=False
    for ln,line in enumerate(lines[start+1:],start+2):
        if line.startswith('|'): in_table=True
        elif in_table: break
        else: continue
        if line.startswith('| case |'): continue
        parts=[x.strip() for x in line.strip().strip('|').split('|')]
        if len(parts)>=5 and re.match(r'C\d{4}',parts[0]): rows.append((ln,parts))
    return rows

def expand_ids(s):
    ids=[]
    for token in s.split(','):
        token=token.strip(); m=re.fullmatch(r'C(\d{4})(?:-C(\d{4}))?',token)
        if m:
            a=int(m.group(1)); b=int(m.group(2) or m.group(1)); ids += [f'HELIXOS-L9-015-C{i:04d}' for i in range(a,b+1)]
    return ids

def main():
    base4=obj(raw(BASE,L4));base9=obj(raw(BASE,L9));base8=raw(BASE,L8);base5=raw(BASE,L5)
    cur4=obj(current(L4));cur9=obj(current(L9));cur7=obj(current(L7));cur5=obj(current(L5));cur8=current(L8);cur3=obj(current(L3))
    l7cases=cur7['connection_materials']['OS015']['case']['cases'];l7by={r['id']:(i,r) for i,r in enumerate(l7cases)}
    assert sha((DIR/'manual-case-audit-05614.md').read_bytes())==M['manual_audit_sha256']
    assert M['manual_audit_revision']=='05614def4e0427f9390c2b6535e520f5c7c26590'
    assert sha(base4 and raw('dd5787507a9ef3b69f411074e2fcbc7710ca1d62',L4))=='e2e92c62217f70203752ab4f79ed7a92831d94cb813c6947153f237c83c8576b'
    assert sha(raw('dd5787507a9ef3b69f411074e2fcbc7710ca1d62',L5))=='6d313e6faaf56c0806c1964ac2bece5da0699de1d82dcc804fc77962f679275e'
    audit4=obj(raw('dd5787507a9ef3b69f411074e2fcbc7710ca1d62',L4));audit5=obj(raw('dd5787507a9ef3b69f411074e2fcbc7710ca1d62',L5))
    assert cur4['diagnostic_contract']==audit4['diagnostic_contract']
    current_contract2=dict(cur4['contracts'][2]); audit_contract2=dict(audit4['contracts'][2])
    new_ids=[c['class_id'] for c in M['classes'] if not c['is_new']]
    prior_pr_a_ids=['OS015-NEG-COMPOSITE-07c9fd844a293140f5dc77476ab8ed90116889361788956739abfdcf65b874c4','OS015-NEG-COMPOSITE-4e0c28b06920d3a9665cbe4beeaf48cea44d7b0d350dddfaec9c8471de1e86b5']
    new_class_ids=[c['class_id'] for c in M['classes'] if c['is_new']]
    assert current_contract2['negative_class_refs'][-len(new_class_ids):]==sorted(new_class_ids)
    current_contract2['negative_class_refs']=current_contract2['negative_class_refs'][:-len(new_class_ids)]
    current_contract2['negative_class_refs']=current_contract2['negative_class_refs'][:-len(prior_pr_a_ids)]
    assert current_contract2==audit_contract2
    assert cur5['functions']==audit5['functions']
    assert cur5['failure_rules'][:len(audit5['failure_rules'])]==audit5['failure_rules']
    assert sha(raw(BASE,L7))==M['source_revisions']['L7_sha256'] and current(L7)==raw(BASE,L7)
    assert sha(base8)==M['source_revisions']['L8_sha256'] and cur8==base8
    assert sha(raw(BASE,L5))==M['source_revisions']['L5_sha256'] and base5==raw(BASE,L5)
    assert sha(raw(BASE,L4))==M['source_revisions']['L4_sha256']
    assert sha(raw(BASE,L9))==M['source_revisions']['L9_sha256']
    # Original groups are checked against the copied audit table; corrected cases
    # are independently pinned to L4/L7-only source evidence.
    table=audit_table_rows();assert len(table)==17
    byline={ln:parts for ln,parts in table}
    existing_classes=[c for c in M['classes'] if not c['is_new']]
    assert len(existing_classes)==2
    pr_a=json.loads((ROOT/'scaffold/research/wr181-os015-pr-a-l4-l9-20261030/case-evidence.json').read_text())
    prior={a['case_id']:a['class_id'] for a in pr_a['case_assignments']};assert len(prior)==29
    for c in existing_classes:
        parts=byline[c['source_reference']['line']]
        audited=set(expand_ids(parts[0])); actual=set(c['case_ids'])
        assert actual | {x for x in audited if x in prior} == audited | (set(c.get('special_case_ids',[])))
        # The 29 pre-existing assignments are evidence-pinned and must not be rewritten.
        assert all(prior.get(cid)==c['existing_class_id'] for cid in audited if cid in prior)
        assert c['class_id']==c['existing_class_id']
    newclasses=[c for c in M['classes'] if c['is_new']]
    assert len(newclasses)==18
    correction=json.loads((DIR/'class-correction-cases.json').read_text(encoding='utf-8'))
    assert correction['base_revision']=='5d541f69ff86674e585311558ad2dac1972d42e4'
    assert correction['L7_source_file_sha256']==sha(raw(BASE,L7))
    assert correction['L4_algorithm_text_sha256']==sha(cur4['diagnostic_contract']['algorithm_python_document_text'].encode())
    correction_by_case={x['case_id']:x for x in correction['cases']}
    correction_groups={x['class_id']:x for x in correction['corrected_groups']}
    correction_group_ids={c['class_id'] for c in newclasses if c['source_reference']['path']=='class-correction-cases.json'}
    correction_membership={}
    manual_line_membership={}
    for c in newclasses:
        key=c['key'];assert c['class_id']==candidate_id(key)
        assert key['owner_ref']=={'kind':'function_ref','id':'FN-OS015-01'}
        source=c['source_reference']
        if source['path']=='manual-case-audit-05614.md':
            line=source['line'];assert line in byline
            manual_line_membership.setdefault(line,set()).update(c['case_ids'])
        else:
            assert source['path']=='class-correction-cases.json'
            group=correction_groups[c['class_id']]
            assert set(c['case_ids'])==set(group['case_ids'])
            assert c['key']==group['class_key']
            assert source['manual_audit_lines']==group['manual_audit_lines']
            assert c['independent_findings']=={cid:correction_by_case[cid]['ordered_findings'] for cid in c['case_ids']}
            correction_membership.update({cid:c['class_id'] for cid in c['case_ids']})
            for line in source['manual_audit_lines']:
                manual_line_membership.setdefault(line,set()).update(c['case_ids'])
        for code in key['finding_codes']:
            assert any(code in r.get('expected',{}).get('finding_codes',[]) and r.get('function_ref')=='FN-OS015-01' for r in cur5['failure_rules'])
    for line,cases in manual_line_membership.items():
        assert cases==set(expand_ids(byline[line][0]))
    expected_corrected={
      'HELIXOS-L9-015-C0574','HELIXOS-L9-015-C0575','HELIXOS-L9-015-C0577',
      'HELIXOS-L9-015-C0578','HELIXOS-L9-015-C0580','HELIXOS-L9-015-C0581'}
    assert set(correction_membership)==expected_corrected
    assert len(correction_by_case)==10
    expected_codes={
      'HELIXOS-L9-015-C0573':['first_classification_prior_present','original_classification_mutated'],
      'HELIXOS-L9-015-C0574':['first_classification_prior_present','original_classification_mutated']+['source_unresolved']*4,
      'HELIXOS-L9-015-C0575':['first_classification_prior_present']*2+['source_unresolved']*4,
      'HELIXOS-L9-015-C0576':['first_classification_prior_unresolved','original_classification_mutated'],
      'HELIXOS-L9-015-C0577':['first_classification_prior_unresolved','original_classification_mutated']+['source_unresolved']*4,
      'HELIXOS-L9-015-C0578':['first_classification_prior_unresolved']*2+['source_unresolved']*4,
      'HELIXOS-L9-015-C0579':['first_classification_prior_unresolved','original_classification_mutated'],
      'HELIXOS-L9-015-C0580':['first_classification_prior_unresolved','original_classification_mutated']+['source_unresolved']*4,
      'HELIXOS-L9-015-C0581':['first_classification_prior_unresolved']*2+['source_unresolved']*4,
      'HELIXOS-L9-015-C0582':['first_classification_prior_present']*2,
    }
    source_unresolved_pointers=[
      '/context/records/target_a/new_classification/prior_classification_ref',
      '/context/records/target_a/new_classification/prior_classification_revision',
      '/records/target_a/new_classification/prior_classification_ref',
      '/records/target_a/new_classification/prior_classification_revision']
    assert set(correction_by_case)==set(expected_codes)
    for case_id,ledger_row in correction_by_case.items():
        assert [x['code'] for x in ledger_row['ordered_findings']]==expected_codes[case_id]
        assert ledger_row['ordered_findings']==sorted(ledger_row['ordered_findings'],key=lambda x:(x['code'],x['pointer'],x['return_owner']))
        has_unresolved='source_unresolved' in expected_codes[case_id]
        assert [x['pointer'] for x in ledger_row['ordered_findings'] if x['code']=='source_unresolved']==(source_unresolved_pointers if has_unresolved else [])
        l7_index,l7_row=l7by[case_id];given=l7_row['given']['input']
        assert ledger_row['phase']==given['base_ref']=='classify'
        fixture=json.loads(json.dumps(cur7['connection_materials']['OS015']['case']['fixture_inputs']['classify']))
        for replacement in given['replacements']:
            target=fixture
            for component in replacement['path'][:-1]:target=target[component]
            target[replacement['path'][-1]]=replacement['value']
        assert ledger_row['actual_original_classification']==fixture['records']['target_a']['original_classification']
        assert ledger_row['context_original_classification']==fixture['context']['records']['target_a']['original_classification']
        for side,locator in (('actual',('records','target_a','new_classification')),('context',('context','records','target_a','new_classification'))):
            node=fixture
            for component in locator:node=node[component]
            assert ledger_row[f'{side}_new_prior_fields']=={k:node[k] for k in ('prior_classification_ref','prior_classification_revision')}
    # All selected L7 stimuli are direct given.input references; expected_proposal is never loaded.
    assigned={}
    for c in M['classes']:
        phases=[];stimulus_targets=set()
        for inp in c['l7_raw_inputs']:
            caseid=inp['case_id'];idx,row=l7by[caseid]
            assert inp['l7_input_pointer']==f'/connection_materials/OS015/case/cases/{idx}/given/input'
            assert row['given']['input']['expanded_input_sha256']==inp['expanded_input_sha256']
            assert caseid in c['case_ids'] and caseid not in assigned
            assigned[caseid]=c['existing_class_id'] if not c['is_new'] else c['class_id']
            given=row['given']['input']
            if given['base_ref'] not in phases: phases.append(given['base_ref'])
            for replacement in given['replacements']:
                path=replacement['path']
                pointer=('/context/'+'/'.join(path[1:])) if path[0]=='context' else ('/'+'/'.join(path))
                stimulus_targets.add(pointer)
        review=c['condition_review']
        assert review['reviewed_phase_set']==phases
        assert review['reviewed_stimulus_targets']==sorted(stimulus_targets)
        assert review['raw_stimulus_input_count']==len(c['l7_raw_inputs'])
        assert all(phase in c['condition'] for phase in phases)
        if c['source_reference']['path']=='class-correction-cases.json':
            for case_id in c['case_ids']:
                ledger_row=correction_by_case[case_id]
                assert ledger_row['class_id']==c['class_id']
                assert ledger_row['input_pointer']==next(x['l7_input_pointer'] for x in c['l7_raw_inputs'] if x['case_id']==case_id)
                assert ledger_row['input_sha256']==next(x['expanded_input_sha256'] for x in c['l7_raw_inputs'] if x['case_id']==case_id)
                assert [x['code'] for x in ledger_row['ordered_findings']]==c['key']['finding_codes']
                assert ledger_row['phase']=='classify'
            assert len(c['key']['finding_codes'])==6
    assert len(assigned)==112 and len(assigned)==len(set(assigned))
    c44=M['c0044_independent_derivation'];assert c44['case_id'] in assigned and assigned[c44['case_id']]==c44['derived_class_id']
    i44,row44=l7by[c44['case_id']];gi=row44['given']['input']
    assert gi['base_ref']=='inspect' and gi['expanded_input_sha256']==c44['input_sha256']
    assert gi['replacements']==[{'path':['records','target_a','original_event','event_id'],'value':None}]
    fix=cur7['connection_materials']['OS015']['case']['fixture_inputs']['inspect']
    assert fix['records']['target_a']['original_event']['event_id']==fix['context']['records']['target_a']['original_event']['event_id']
    assert isinstance(fix['records']['target_a']['original_event']['event_id'],str)
    assert resolve(cur4,c44['supporting_pointers'][0])==cur4['contracts'][2]
    # L4 addition is append-only: every prior row, all L4 semantic contract nodes, and canonical codes remain.
    assert cur4['failure_classifications'][:len(base4['failure_classifications'])]==base4['failure_classifications']
    assert cur4['contracts'][2]['negative_class_refs'][-len(newclasses):]==sorted(c['class_id'] for c in newclasses)
    l4new=cur4['failure_classifications'][len(base4['failure_classifications']):]
    assert len(l4new)==18
    l4by={r['class_id']:r for r in cur4['failure_classifications']}
    for c in newclasses:
        row=l4by[c['class_id']]
        assert row['expected_classification']==c['key']['expected_classification']
        assert row['expected']=={'finding_codes':c['key']['finding_codes']}
        assert row['expected_axis']==c['key']['expected_axis'] and row['expected_state']==c['key']['expected_state']
        assert row['backflow_owner']==c['key']['backflow_owner'] and row['condition']==c['condition']
        for sp in row['source_pointers']:
            doc=cur3 if sp['path']==L3 else cur4
            assert sp['path'] in (L3,L4)
            for p in sp['pointers']:resolve(doc,p)
    # New L9 rows project class fields from L4 and link only to L4/L7 sources.
    assert cur9['negative_equivalence_classes'][:len(base9['negative_equivalence_classes'])]==base9['negative_equivalence_classes']
    l9new=cur9['negative_equivalence_classes'][len(base9['negative_equivalence_classes']):]
    assert len(l9new)==18
    l9by={r['class_id']:r for r in cur9['negative_equivalence_classes']}
    for c in newclasses:
        r=l9by[c['class_id']];l=l4by[c['class_id']]
        for field in ('class_id','expected_classification','expected','expected_axis','expected_state','backflow_owner','side_effect_count'):
            assert r[field]==l[field]
        assert all(sp['path'] in (L4,L7) for sp in r['source_pointers'])
        for sp in r['source_pointers']:
            doc=cur4 if sp['path']==L4 else cur7
            for p in sp['pointers']:resolve(doc,p)
    # 583 case rows are immutable except links and raw-input material references for these 112.
    assert len(base9['integration_cases'])==len(cur9['integration_cases'])==583
    oldcases={r['id']:r for r in base9['integration_cases']};newcases={r['id']:r for r in cur9['integration_cases']}
    changed=[]
    for cid,old in oldcases.items():
        new=newcases[cid]
        assert old['expected']==new['expected'] and old['condition']==new['condition'] and old['expected_preserved']==new['expected_preserved']
        if cid in assigned:
            expected_ptr=next(x['l7_input_pointer'] for c in M['classes'] for x in c['l7_raw_inputs'] if x['case_id']==cid)
            assert new['negative_class_ref']==assigned[cid]
            assert new['material_ref']=={'path':L7,'pointer':expected_ptr}
            changed.append(cid)
            assert strip_allowed_case_fields(new)==strip_allowed_case_fields(old)
        else: assert new==old
    assert set(changed)==set(assigned)
    # Previously assigned 29 rows remain byte-semantically unchanged.
    for cid,cl in prior.items():
        assert newcases[cid]==oldcases[cid]
    # Existing L9 class pointers are untouched; the new classes name only L4/L7.
    for c in newclasses:
        assert c['class_id'] in l9by
    # All bindings pinning changed layer paths are accounted for and follow candidate bytes.
    l4hash=sha(current(L4));l9hash=sha(current(L9));updated=[]
    for bid in ('SCF-B-0170','SCF-B-0173','SCF-B-0175','SCF-B-0176'):
        b=json.loads((ROOT/f'scaffold/bindings/{bid}.json').read_text())
        for p,h in ((L4,l4hash),(L9,l9hash)):
            matches=[u for u in b['upstream'] if u['path']==p]
            if matches:
                assert matches[0]['sha256']==h
                updated.append({'binding':bid,'path':p,'sha256':h})
    return {'status':'PASS','base_revision':BASE,'correction_base_revision':correction['base_revision'],'manual_audit_revision':M['manual_audit_revision'],'manual_audit_sha256':M['manual_audit_sha256'],'correction_audit_sha256':sha((DIR/'class-correction-audit-5d541.md').read_bytes()),'correction_cases_sha256':sha((DIR/'class-correction-cases.json').read_bytes()),'class_count':20,'new_l4_and_l9_classes':18,'corrected_prior_case_count':6,'corrected_case_ids':sorted(expected_corrected),'case_link_count':112,'existing_class_case_count':75,'new_class_case_count':37,'c0044_independently_derived':True,'prior_29_case_links_unchanged':True,'l9_case_rows':583,'case_expected_condition_preserved_unchanged':True,'l4_new_class_pointers_resolve':True,'l9_new_class_pointers_resolve_and_only_l4_l7':True,'l5_l8_document_bytes_unchanged':True,'current_l4_sha256':l4hash,'current_l9_sha256':l9hash,'pin_impacts':updated,'checker_or_runtime_executed':False}
if __name__=='__main__': print(json.dumps(main(),ensure_ascii=False,indent=2))
