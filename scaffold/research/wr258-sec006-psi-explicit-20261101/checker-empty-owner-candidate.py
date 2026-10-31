#!/usr/bin/env python3
"""Static guard check for the proposed empty-finding owner declaration."""
import copy
import json
from pathlib import Path

BASE = Path('scaffold/research/wr258-sec006-psi-explicit-20261101')
load = lambda p: json.loads(Path(p).read_text())

def accepted(observation, class_owner, l4_owner, l5_owner):
    findings = observation.get('ordered_findings')
    if not isinstance(findings, list):
        return False
    if findings:
        if 'declared_backflow_owner' in observation:
            return False
        owners = {x.get('return_owner') for x in findings if isinstance(x, dict)}
        return len(owners) == 1 and None not in owners
    declared = observation.get('declared_backflow_owner')
    return isinstance(declared, str) and bool(declared.strip()) and declared == class_owner == l4_owner == l5_owner

l4 = load('docs/helix-security/L4-basic-design/project-scope-isolation.json')
l5 = load('scaffold/research/wr258-sec006-psi-explicit-20261101/integrated-overlay-candidate/l5.json')
l8 = load('scaffold/research/wr258-sec006-psi-explicit-20261101/integrated-overlay-candidate/l8.json')
l9 = load('scaffold/research/wr258-sec006-psi-explicit-20261101/integrated-overlay-candidate/l9.json')
cls_id = 'SEC003-F02-OPERATION-CONNECTION-ABSENT-DEFERRED'
cls4 = next(x for x in l4['failure_classifications'] if x['class_id'] == cls_id)
cls5 = next(x for x in l5['failure_rules'] if x['class_id'] == cls_id)
cls8 = next(x for x in l8['negative_equivalence_classes'] if x['class_id'] == cls_id)
cls9 = next(x for x in l9['negative_equivalence_classes'] if x['class_id'] == cls_id)
unit = next(x for x in l8['unit_cases'] if x['case_id'] == 'SEC003-L8-OPERATION-DEFER')
case = next(x for x in l9['integration_cases'] if x['id'] == unit['integration_case_ref'])
obs = copy.deepcopy(case['compact_whole_observation'])
obs['declared_backflow_owner'] = cls9['backflow_owner']
owners = [cls4['backflow_owner'], cls5['backflow_owner'], cls8['backflow_owner'], cls9['backflow_owner'], l4['diagnostic_contract']['return_owner']]
assert len(set(owners)) == 1
assert cls4['expected']['finding_codes'] == []
assert unit['expected']['finding_codes'] == []
assert obs['ordered_findings'] == []
positive = accepted(obs, cls9['backflow_owner'], l4['diagnostic_contract']['return_owner'], cls5['backflow_owner'])

missing = copy.deepcopy(obs); missing.pop('declared_backflow_owner')
wrong = copy.deepcopy(obs); wrong['declared_backflow_owner'] = 'invented-owner'
nonempty_conflict = {'ordered_findings': [{'code':'implicit_fallback','return_owner':'scope-binding-owner'}], 'declared_backflow_owner':'invented-owner'}
nonempty_redundant = {'ordered_findings': [{'code':'implicit_fallback','return_owner':'scope-binding-owner'}], 'declared_backflow_owner':'scope-binding-owner'}
result = {
    'schema': 'wr258-empty-finding-owner-candidate-static-check.v1',
    'evidence_kind': 'scaffold', 'authority_effect': 'none',
    'proposal': 'compact_whole_observation.declared_backflow_owner is required only when ordered_findings is empty; otherwise owner derives from non-empty findings and a declaration is forbidden.',
    'source_row': {'l8_case_id': unit['case_id'], 'l9_candidate_id': case['id'], 'class_id': cls_id},
    'source_owner_values': owners,
    'static_cases': {
        'positive_source_matched_empty_finding': {'accepted_by_candidate_guard': positive, 'finding_count': 0, 'owner': obs['declared_backflow_owner']},
        'negative_missing_declaration': {'rejected_by_candidate_guard': not accepted(missing, cls9['backflow_owner'], l4['diagnostic_contract']['return_owner'], cls5['backflow_owner'])},
        'negative_wrong_owner': {'rejected_by_candidate_guard': not accepted(wrong, cls9['backflow_owner'], l4['diagnostic_contract']['return_owner'], cls5['backflow_owner'])},
        'negative_conflicting_nonempty_finding': {'rejected_by_candidate_guard': not accepted(nonempty_conflict, cls9['backflow_owner'], l4['diagnostic_contract']['return_owner'], cls5['backflow_owner'])}
        ,'negative_redundant_nonempty_declaration': {'rejected_by_candidate_guard': not accepted(nonempty_redundant, cls9['backflow_owner'], l4['diagnostic_contract']['return_owner'], cls5['backflow_owner'])}
    },
    'current_checker_result': 'FAIL finding_owners_not_unique when ordered_findings is empty; this helper checks the proposal only and does not change or substitute for design_verification_checker.py.'
}
assert positive and all(v.get('rejected_by_candidate_guard') for k,v in result['static_cases'].items() if k.startswith('negative_'))
(BASE/'checker-empty-finding-owner-static-check.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result['static_cases'],ensure_ascii=False))
