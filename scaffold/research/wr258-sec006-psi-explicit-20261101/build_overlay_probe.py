#!/usr/bin/env python3
"""Build disposable, source-projected four-layer WR258 checker inputs.

This is measurement material only. It never edits canonical L4/L5/L8/L9 files.
"""
import argparse
import copy
import json
from pathlib import Path

P = Path('docs/helix-security')

def load(layer, folder):
    return json.loads((P / folder / 'project-scope-isolation.json').read_text())

def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    out = Path(a.out)
    if out.exists():
        raise FileExistsError(f'overlay_output_must_be_new:{out}')
    l4 = load('4', 'L4-basic-design')
    l5 = load('5', 'L5-detail-design')
    l8 = load('8', 'L8-unit-verification')
    l9 = load('9', 'L9-integration-verification')
    cand = json.loads((Path('scaffold/research/wr258-sec006-psi-explicit-20261101') / 'integration-candidate.json').read_text())
    r1 = json.loads((Path('scaffold/research/wr250-sec006-psi-l5l8-20261031') / 'rowwise-comparison-r1.json').read_text())

    l4['negative_equivalence_classes'] = {'source_rows': 'failure_classifications'}
    l5['negative_equivalence_classes'] = {'source_rows': 'failure_rules'}

    l4_by_id = {x['class_id']: x for x in l4['failure_classifications']}
    l5_by_class = {x['class_id']: x for x in l5['failure_rules']}
    # Candidate contract-owned rules for the six new L4 classes. The owner is
    # the already declared L5 F01/F02 contract selected by the L4 parent.
    # These rows exist only in the disposable overlay.
    l5_contract_by_requirement = {x['requirement_ref']: x['id'] for x in l5['contracts']}
    l3_by_l4 = {
        'HELIXSECURITY-L4-003-F01': 'HELIXSECURITY-L3-003-F01',
        'HELIXSECURITY-L4-003-F02': 'HELIXSECURITY-L3-003-F02',
    }
    for class_id, cls in l4_by_id.items():
        if class_id in l5_by_class:
            continue
        l4_contract = cls['design_ref']
        l5_contract_id = l5_contract_by_requirement[l3_by_l4[l4_contract]]
        l5['failure_rules'].append({
            'id': class_id,
            'class_id': class_id,
            'contract_ref': l5_contract_id,
            'l4_class_ref': class_id,
            'code': cls['code'],
            'expected_classification': cls['expected_classification'],
            'expected': copy.deepcopy(cls['expected']),
            'expected_axis': cls['expected_axis'],
            'expected_state': cls['expected_state'],
            'backflow_owner': cls['backflow_owner'],
            'side_effect_count': cls['side_effect_count'],
        })
    l5_by_class = {x['class_id']: x for x in l5['failure_rules']}
    # L8 class rows use existing L5 rules where present; WR258's six unassigned
    # class candidates are included only as proposed projections from the L4 draft.
    l8_classes = []
    for rule in l5['failure_rules']:
        l8_classes.append({
            'class_id': rule['class_id'],
            'expected_classification': rule['code'],
            'expected': copy.deepcopy(rule['expected']),
            'expected_axis': rule['expected_axis'],
            'expected_state': rule['expected_state'],
            'backflow_owner': rule['backflow_owner'],
            'side_effect_count': rule['side_effect_count'],
        })
    for class_id in [x['class_id'] for x in l4['failure_classifications'] if x['class_id'] not in l5_by_class]:
        cls = l4_by_id[class_id]
        l8_classes.append({
            'class_id': cls['class_id'],
            'expected_classification': cls['code'],
            'expected': copy.deepcopy(cls['expected']),
            'expected_axis': cls['expected_axis'],
            'expected_state': cls['expected_state'],
            'backflow_owner': cls['backflow_owner'],
            'side_effect_count': cls['side_effect_count'],
        })
    l8['negative_equivalence_classes'] = l8_classes

    l9_class_ids = sorted(l4_by_id)
    l9['negative_equivalence_classes'] = []
    for class_id in l9_class_ids:
        cls = l4_by_id[class_id]
        l9['negative_equivalence_classes'].append({
            'class_id': cls['class_id'],
            'expected_classification': cls['code'],
            'expected': copy.deepcopy(cls['expected']),
            'expected_axis': cls['expected_axis'],
            'expected_state': cls['expected_state'],
            'backflow_owner': cls['backflow_owner'],
            'side_effect_count': cls['side_effect_count'],
        })

    # Candidate case links use the exact L8 read projection only to identify
    # which observation is being paired. L8/L9 expected values are both
    # independently projected from the L4 class and its L3/L10 source links.
    l8_rows = []
    l8_case_ref_by_id = {}
    l9_by_id = {row['id']: row for case in l9['cases'] for row in case['negative_cases']}
    for case in l8['cases']:
        for row in case['negative_cases']:
            arow = row.get('negative_class_assignment', {})
            candidate_match = next((x for x in cand['nine_l8_rows'] if x['id'] == row['id']), None)
            class_id = (candidate_match or {}).get('candidate_l4_class_id') or arow.get('class_id') or arow.get('rule_ref')
            cls = l4_by_id.get(class_id, {})
            result = row.get('expected_result', {})
            findings = result.get('findings', [])
            l8_row = {
                'case_id': row['id'],
                'population_state': 'negative',
                'negative_class_ref': class_id,
                'condition': cls.get('condition'),
                'expected': copy.deepcopy(cls.get('expected')),
                'expected_preserved': copy.deepcopy(cls.get('expected_preserved')),
                'expected_axis': cls.get('expected_axis'),
                'expected_state': cls.get('expected_state'),
                'side_effect_count': cls.get('side_effect_count', 0),
                'expected_property': {
                    'condition': cls.get('code'),
                    'finding_codes': copy.deepcopy(cls.get('expected', {}).get('finding_codes', [])),
                },
                'function_ref': row.get('function_ref'),
            }
            if row['id'] == 'SEC003-L8-FALLBACK-OTHER':
                l8_row['integration_case_ref'] = 'SEC003-OTHER-PROJECT-FALLBACK'
            if class_id in l5_by_class:
                l8_row['rule_ref'] = class_id
                l8_row['contract_ref'] = l5_by_class[class_id].get('contract_ref')
            l8_rows.append(l8_row)
            l8_case_ref_by_id[row['id']] = l8_row

    # Add the 91 retained, noncanonical L8 candidate designs with their
    # rowwise R1 L9 references. These are hypotheses (not unit-test evidence).
    candidate_by_id = {x['id']: x for x in l8['candidate_unit_cases']}
    retained = [x for x in r1['l9_rows'] if x['disposition'] == 'retained_candidate']
    for match in retained:
        candidate = candidate_by_id[match['candidate_id']]
        class_id = candidate['negative_class_ref']
        cls = l4_by_id[class_id]
        unit = {
            'case_id': candidate['id'],
            'population_state': 'negative',
            'negative_class_ref': class_id,
            'integration_case_ref': match['l9_case_id'],
            'condition': cls['condition'],
            'expected': copy.deepcopy(cls['expected']),
            'expected_preserved': copy.deepcopy(cls['expected_preserved']),
            'expected_property': {
                'condition': cls['code'],
                'finding_codes': copy.deepcopy(cls['expected']['finding_codes']),
            },
            'expected_axis': cls['expected_axis'],
            'expected_state': cls['expected_state'],
            'side_effect_count': cls['side_effect_count'],
            'rule_ref': class_id,
            'function_ref': candidate['function_ref'],
            'contract_ref': l5_by_class[class_id]['contract_ref'],
        }
        l8_rows.append(unit)
        l8_case_ref_by_id[candidate['id']] = unit
    l8['unit_cases'] = l8_rows

    l9_rows = []
    for case in l9['cases']:
        for row in case['negative_cases']:
            arow = row.get('negative_class_assignment', {})
            class_id = arow.get('class_id')
            cls = l4_by_id.get(class_id, {})
            obs = row.get('expected_observation', {})
            l9_rows.append({
                'id': row['id'],
                'population_state': 'negative',
                'negative_class_ref': class_id,
                'condition': cls.get('condition'),
                'expected': copy.deepcopy(cls.get('expected')),
                'expected_preserved': copy.deepcopy(cls.get('expected_preserved')),
                'expected_axis': cls.get('expected_axis'),
                'expected_state': cls.get('expected_state'),
                'side_effect_count': cls.get('side_effect_count', 0),
                'compact_whole_observation': {
                    'condition': cls.get('expected', {}).get('condition'),
                    'ordered_findings': [
                        {'code': code, 'return_owner': cls.get('backflow_owner')}
                        for code in cls.get('expected', {}).get('finding_codes', [])
                    ],
                },
            })

    # Fifty previously unmatched canonical unit rows receive source-derived
    # L9 case candidates. They retain L3/L10/L4 expectation provenance; the
    # new case is not represented as an executed oracles-backed fixture.
    rowwise = json.loads((Path('scaffold/research/wr258-sec006-psi-explicit-20261101') / 'rowwise-integration-design.json').read_text())
    new_candidates = rowwise['candidate_l9_skeletons_for_50_unmatched_l8_rows']
    for item in new_candidates:
        cls = l4_by_id[item['l4_class_id']]
        l8_case_ref_by_id[item['intended_l8_case_ref']]['integration_case_ref'] = item['candidate_id']
        l9_rows.append({
            'id': item['candidate_id'],
            'population_state': 'negative',
            'negative_class_ref': cls['class_id'],
            'condition': cls['condition'],
            'expected': copy.deepcopy(cls['expected']),
            'expected_preserved': copy.deepcopy(cls['expected_preserved']),
            'expected_axis': cls['expected_axis'],
            'expected_state': cls['expected_state'],
            'side_effect_count': cls['side_effect_count'],
            'compact_whole_observation': {
                'condition': cls['expected']['condition'],
                'ordered_findings': [
                    {'code': code, 'return_owner': cls['backflow_owner']}
                    for code in cls['expected']['finding_codes']
                ],
            },
            'candidate_state': 'not_executed_source_derived_expected_case',
        })
    l9['integration_cases'] = l9_rows

    for name, data in [('l4', l4), ('l5', l5), ('l8', l8), ('l9', l9)]:
        write(out / f'{name}.json', data)
    print(json.dumps({'out': str(out), 'case_rows': {'L8': len(l8_rows), 'L9': len(l9_rows)}, 'class_rows': {'L4': len(l4['failure_classifications']), 'L5': len(l5['failure_rules']), 'L8': len(l8_classes), 'L9': len(l9['negative_equivalence_classes'])}, 'retained_l8_candidates_mapped': len(retained), 'canonical_l8_rows_unmapped': sum('integration_case_ref' not in x for x in l8_rows[:52]), 'l9_legacy_assignment_classifications_preserved': True}, ensure_ascii=False))

if __name__ == '__main__':
    main()
