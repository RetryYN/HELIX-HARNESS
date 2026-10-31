#!/usr/bin/env python3
"""Build rowwise SEC006 transition evidence without changing L3/L9/L5/L8 sources."""
import json
import hashlib
from collections import defaultdict
from pathlib import Path

ROOT = Path('.')
OUT = Path('scaffold/research/wr258-sec006-psi-explicit-20261101')
load = lambda path: json.loads(Path(path).read_text())
l4 = load('docs/helix-security/L4-basic-design/project-scope-isolation.json')
l8 = load('docs/helix-security/L8-unit-verification/project-scope-isolation.json')
l9 = load('docs/helix-security/L9-integration-verification/project-scope-isolation.json')
r1 = load('scaffold/research/wr250-sec006-psi-l5l8-20261031/rowwise-comparison-r1.json')
r0 = load('scaffold/research/wr250-sec006-psi-l5l8-20261031/rowwise-comparison.json')
candidate = load(OUT / 'integration-candidate.json')
l4_by_id = {row['class_id']: row for row in l4['failure_classifications']}
l8_source = {row['id']: row for case in l8['cases'] for row in case['negative_cases']}
candidate_l8_by_id = {row['id']: row for row in l8.get('candidate_unit_cases', [])}
candidate_l4_by_canonical_l8 = {row['id']: row.get('candidate_l4_class_id')
                                for row in candidate.get('nine_l8_rows', [])}
old_candidate_by_l9 = {row['l9_case_id']: row['l8_candidate_id'] for row in r0['rows']}
l9_candidate_by_id = {row['l9_case_id']: row for row in r1['l9_rows']}
l9_source_by_id = {row['id']: row for case in l9['cases'] for row in case['negative_cases']}
l9_by_function = defaultdict(list)
for row in r1['l9_rows']:
    l9_by_function[row['function_ref']].append(row)

def projection(row):
    return {cell['path']: (cell['state'], cell.get('value')) for cell in row['input_projection']}

canonical_l8 = []
for row in r1['l8_rows']:
    left = projection(row)
    l4_class_id = row.get('receiving_class') or candidate_l4_by_canonical_l8.get(row['l8_row_id'])
    exact = [candidate_row['l9_case_id'] for candidate_row in l9_by_function.get(row['function_ref'], [])
             if all(left.get(field) == projection(candidate_row).get(field)
                    for field in row['function_read_fields'])]
    canonical_l8.append({
        'l8_case_id': row['l8_row_id'], 'l8_pointer': row['l8_pointer'],
        'function_ref': row['function_ref'], 'l4_class_id': l4_class_id,
        'assignment_state': row['disposition'], 'local_grade': row['local_grade'],
        'local_findings': row['local_findings'],
        'l4_derived_case_contract': ({
            'condition': l4_by_id[l4_class_id]['condition'],
            'expected': l4_by_id[l4_class_id]['expected'],
            'expected_preserved': l4_by_id[l4_class_id]['expected_preserved'],
            'source_pointers': l4_by_id[l4_class_id]['source_pointers'],
        } if l4_class_id in l4_by_id else None),
        'known_input_reference': {
            'path': 'docs/helix-security/L8-unit-verification/project-scope-isolation.json',
            'pointer': row['l8_pointer'],
            'meaning': 'projection照合用。L9 oracle生成には使わない。'
        },
        'exact_l9_function_projection_matches': exact,
        'link_status': 'unique_exact_match' if len(exact) == 1 else
                       'ambiguous_one_to_many' if len(exact) > 1 else 'no_exact_match'
    })

l4_indexes = {row['class_id']: i for i, row in enumerate(l4['failure_classifications'])}
new_l9_skeletons = []
for row in canonical_l8:
    if row['exact_l9_function_projection_matches']:
        continue
    source = l8_source[row['l8_case_id']]
    class_id = source.get('negative_class_assignment', {}).get('rule_ref')
    if not class_id:
        local_candidate = next((item for item in candidate['nine_l8_rows']
                                if item['id'] == row['l8_case_id']), None)
        class_id = local_candidate.get('candidate_l4_class_id') if local_candidate else None
    cls = l4_by_id.get(class_id)
    if cls is None:
        continue
    f01 = cls['design_ref'].endswith('F01')
    req_i = 3 if f01 else 4
    l5_contract = 'HELIXSECURITY-L5-003-F01' if f01 else 'HELIXSECURITY-L5-003-F02'
    new_l9_skeletons.append({
        'candidate_id': f"WR258-L9-CAND-{len(new_l9_skeletons)+1:03d}",
        'intended_l8_case_ref': row['l8_case_id'], 'l4_class_id': class_id,
        'expected_classification': cls['code'],
        'condition': cls['condition'],
        'expected': cls['expected'],
        'expected_preserved': cls['expected_preserved'],
        'known_input_basis': {
            'l8_case_id': row['l8_case_id'],
            'l8_pointer': row['l8_pointer'],
            'function_read_projection': next(x['input_projection'] for x in r1['l8_rows'] if x['l8_row_id'] == row['l8_case_id'])
        },
        'expected_finding_codes': cls['expected']['finding_codes'],
        'expected_axis': cls['expected_axis'], 'expected_state': cls['expected_state'],
        'backflow_owner': cls['backflow_owner'],
        'candidate_owner_ref': {'kind': 'contract_ref', 'id': l5_contract},
        'source_basis': [
            {'path': 'docs/helix-security/L3-requirements/functional-requirements.json', 'pointer': f'/requirements/{req_i}'},
            {'path': 'docs/helix-security/L10-verification/functional-verification.json', 'pointer': f'/cases/{req_i}'},
            {'path': 'docs/helix-security/L4-basic-design/project-scope-isolation.json', 'pointer': f"/failure_classifications/{l4_indexes[class_id]}"},
            *cls['source_pointers']
        ],
        'missing_source_material': ['L9の統合request/source traceと実行oracle。L8のrawをL9 fixtureと称して複製しない。'],
        'status': 'source_derived_expectation_with_integration_material_unresolved'
    })

l9_rows = []
for contract_i, case in enumerate(l9['cases']):
    for row_i, row in enumerate(case['negative_cases']):
        assignment = row['negative_class_assignment']
        match = l9_candidate_by_id[row['id']]
        cls = l4_by_id.get(assignment.get('class_id'))
        l9_rows.append({
            'l9_case_id': row['id'], 'pointer': f'/cases/{contract_i}/negative_cases/{row_i}',
            'legacy_nested_code_label': assignment.get('classification'),
            'current_class_id': assignment.get('class_id'),
            'current_expected_classification': assignment.get('expected_classification'),
            'current_l4_code': cls.get('code') if cls else None,
            'axis': assignment.get('expected_axis'), 'state': assignment.get('expected_state'),
            'l8_candidate_id': old_candidate_by_l9.get(row['id']),
            'l8_candidate_disposition': match['disposition'],
            'function_ref': match['function_ref'],
            'condition_equal_to_l4': match.get('l4_l9_condition_equal'),
            'finding_codes_equal_to_l4': match.get('l4_l9_finding_codes_equal'),
            'execution_state': row.get('execution_state')
            ,'l4_derived_case_contract': ({
                'condition': cls['condition'], 'expected': cls['expected'],
                'expected_preserved': cls['expected_preserved'],
                'source_pointers': cls['source_pointers']
            } if cls else None)
        })

sources = [
    'docs/helix-security/L3-requirements/functional-requirements.json',
    'docs/helix-security/L10-verification/functional-verification.json',
    'docs/helix-security/L4-basic-design/project-scope-isolation.json',
    'docs/helix-security/L5-detail-design/project-scope-isolation.json',
    'docs/helix-security/L8-unit-verification/project-scope-isolation.json',
    'docs/helix-security/L9-integration-verification/project-scope-isolation.json',
    'scaffold/research/wr250-sec006-psi-l5l8-20261031/rowwise-comparison-r1.json',
    'scaffold/research/wr250-sec006-psi-l5l8-20261031/rowwise-comparison.json'
]
exact_l8 = [row for row in canonical_l8 if row['exact_l9_function_projection_matches']]
primary_tree_ids = ['SEC003-PRIMARY-TREE-FALLBACK','SEC003-AGENT-PRIMARY-TREE-FALLBACK',
                    'SEC003-HOOK-PRIMARY-TREE-FALLBACK','SEC003-MEMORY-PRIMARY-TREE-FALLBACK',
                    'SEC003-CREDENTIAL-PRIMARY-TREE-FALLBACK','SEC003-CONFIGURATION-PRIMARY-TREE-FALLBACK']
primary_tree_audit = []
for case_id in primary_tree_ids:
    row = l9_source_by_id[case_id]
    request = row['counterexample']['request']
    primary_tree_audit.append({
        'l9_case_id': case_id,
        'l9_pointer': next(x['l9_pointer'] for x in r1['l9_rows'] if x['l9_case_id']==case_id),
        'caller_kind': request['caller_kind'],
        'fallback': request['fallback'],
        'l9_expected_condition': row['expected_observation']['condition'],
        'l9_expected_findings': row['expected_observation']['findings'],
        'l5_compare_fallback_projection': {'/request/fallback': request['fallback']},
        'l5_compare_fallback_result': {'grade': 'violation', 'findings': [{'code':'implicit_fallback','pointer':'/request/fallback','return_owner':'scope-binding-owner'}]},
        'l5_compare_caller_material_projection': {'/request/caller_kind': request['caller_kind']},
        'l5_compare_caller_material_result': {'grade':'corresponding','findings':[]},
        'l5_compose_scope_proposal_caller_part': {'grade':'corresponding','findings':[]},
        'l5_compose_scope_proposal_fallback_part': {'grade':'violation','findings':[{'code':'implicit_fallback','pointer':'/request/fallback','return_owner':'scope-binding-owner'}]},
        'l5_compose_scope_proposal_caller_kind_read': False,
        'candidate_caller_kind_provenance_input': request['caller_kind'],
        'candidate_caller_kind_provenance_expected': request['caller_kind'],
        'candidate_expected_fallback_observation': {
            'grade': 'violation',
            'finding': {'code': 'implicit_fallback', 'pointer': '/request/fallback', 'return_owner': 'scope-binding-owner'}
        }
    })
artifact = {
    'schema': 'wr258-sec006-rowwise-four-layer-transition-design.v1',
    'evidence_kind': 'scaffold', 'authority_effect': 'none',
    'source_hashes': {path: hashlib.sha256(Path(path).read_bytes()).hexdigest() for path in sources},
    'counts': {
        'canonical_l8_negative_rows': len(canonical_l8),
        'canonical_l8_rows_exactly_projecting_to_l9': len(exact_l8),
        'canonical_l8_exact_projection_pairs': sum(len(row['exact_l9_function_projection_matches']) for row in exact_l8),
        'canonical_l8_rows_without_exact_projection': len(canonical_l8)-len(exact_l8),
        'l9_negative_rows': len(l9_rows),
        'retained_noncanonical_l8_candidates': sum(row['l8_candidate_disposition']=='retained_candidate' for row in l9_rows),
        'removed_exact_duplicate_l8_candidates': sum(row['l8_candidate_disposition']=='candidate_removed_confirmed_existing_l8_case' for row in l9_rows),
        'source_derived_l9_skeletons_for_unmatched_l8': len(new_l9_skeletons)
    },
    'canonical_l8_to_l9_projection_audit': canonical_l8,
    'candidate_91_l8_to_l9_map': [
        {'l8_candidate_id': row['candidate_id'], 'l9_case_id': row['l9_case_id'],
         'class_id': row.get('l4_class_ref'), 'status': row['disposition'],
         'oracle_id': row.get('oracle_id'), 'test_citation': row.get('test_citation'),
         'execution_state': row['execution_state'],
         'l4_derived_case_contract': {
            'condition': l4_by_id[candidate_l8_by_id[row['candidate_id']]['negative_class_ref']]['condition'],
            'expected': l4_by_id[candidate_l8_by_id[row['candidate_id']]['negative_class_ref']]['expected'],
            'expected_preserved': l4_by_id[candidate_l8_by_id[row['candidate_id']]['negative_class_ref']]['expected_preserved'],
            'source_pointers': l4_by_id[candidate_l8_by_id[row['candidate_id']]['negative_class_ref']]['source_pointers']
         }}
        for row in r1['l9_rows'] if row['disposition']=='retained_candidate'
    ],
    'l9_98_rowwise_design': l9_rows,
    'candidate_l9_skeletons_for_50_unmatched_l8_rows': new_l9_skeletons,
    'fallback_one_to_many_conflict': {
        'l8_case_id': 'SEC003-L8-FALLBACK-PRIMARY',
        'l9_case_ids': ['SEC003-PRIMARY-TREE-FALLBACK','SEC003-AGENT-PRIMARY-TREE-FALLBACK',
                        'SEC003-HOOK-PRIMARY-TREE-FALLBACK','SEC003-MEMORY-PRIMARY-TREE-FALLBACK',
                        'SEC003-CREDENTIAL-PRIMARY-TREE-FALLBACK','SEC003-CONFIGURATION-PRIMARY-TREE-FALLBACK'],
        'function_ref': 'HELIXSECURITY-L5-003-compare_fallback',
        'consumed_fields': ['/request/fallback'], 'shared_projection_value': 'primary_tree',
        'caller_kind_preserved_by_l9': True, 'caller_kind_consumed_by_function': False,
        'r1_removed_six_candidate_rows_as_exact_duplicates': True,
        'conclusion': 'Under current L5 read/return contracts, one canonical L8 input/outcome maps to six distinct L9 caller rows. Five new unit IDs over the same compare_fallback projection would duplicate one observation; mapping one L8 ID to multiple L9 violates one-to-one. A separate provenance-only L5/L8 candidate can provide six distinct consumed caller values and pass them through compose_scope_proposal; this is a proposed return-contract extension, not a current-source capability.'
    },
    'other_project_fallback_unique_pair': {
        'l8_case_id': 'SEC003-L8-FALLBACK-OTHER',
        'l8_pointer': '/cases/1/negative_cases/20',
        'l9_case_id': 'SEC003-OTHER-PROJECT-FALLBACK',
        'l9_pointer': '/cases/1/negative_cases/8',
        'function_ref': 'HELIXSECURITY-L5-003-compare_fallback',
        'function_read_fields': ['/request/fallback'],
        'projection_state': 'present', 'projection_value': 'other_project',
        'l4_class_id': 'SEC003-F02-IMPLICIT-FALLBACK',
        'l8_finding': {'code': 'implicit_fallback', 'pointer': '/request/fallback', 'return_owner': 'scope-binding-owner'},
        'l9_expected_finding': {'code': 'implicit_fallback', 'pointer': '/request/fallback', 'return_owner': 'scope-binding-owner'},
        'mapping': 'unique_one_to_one_source_projection'
    },
    'operation_defer_scope_mismatch': {
        'l8_case_id': 'SEC003-L8-OPERATION-DEFER',
        'l8_pointer': '/cases/1/negative_cases/16',
        'l5_function_ref': 'HELIXSECURITY-L5-003-compare_operation_scope',
        'l5_read_fields': ['/request/operation', '/request/connection_state', '/request/connection/allowed_operations', '/context/expected_connection/allowed_operations'],
        'l5_rule': 'absent/unknown connection state returns local unknown with empty findings; connection-state finding belongs to connection function',
        'l8_expected': {'condition': 'scope_unresolved', 'finding_codes': []},
        'l9_whole_system_comparators': [
            {'id': 'SEC003-CROSS-READ-ABSENT', 'pointer': '/cases/1/negative_cases/0', 'expected': {'condition': 'isolation_violation', 'finding_codes': ['explicit_connection_absent']}, 'return_owner': 'scope-binding-owner'},
            {'id': 'SEC003-CROSS-WRITE-ABSENT', 'pointer': '/cases/1/negative_cases/1', 'expected': {'condition': 'isolation_violation', 'finding_codes': ['explicit_connection_absent']}, 'return_owner': 'scope-binding-owner'},
            {'id': 'SEC003-CROSS-EXECUTE-ABSENT', 'pointer': '/cases/1/negative_cases/2', 'expected': {'condition': 'isolation_violation', 'finding_codes': ['explicit_connection_absent']}, 'return_owner': 'scope-binding-owner'},
            {'id': 'SEC003-CROSS-NETWORK-ABSENT', 'pointer': '/cases/1/negative_cases/3', 'expected': {'condition': 'isolation_violation', 'finding_codes': ['explicit_connection_absent']}, 'return_owner': 'scope-binding-owner'},
            {'id': 'SEC003-CROSS-STATE-ABSENT', 'pointer': '/cases/1/negative_cases/4', 'expected': {'condition': 'isolation_violation', 'finding_codes': ['explicit_connection_absent']}, 'return_owner': 'scope-binding-owner'},
            {'id': 'SEC003-CROSS-CREDENTIAL-ABSENT', 'pointer': '/cases/1/negative_cases/5', 'expected': {'condition': 'isolation_violation', 'finding_codes': ['explicit_connection_absent']}, 'return_owner': 'scope-binding-owner'},
            {'id': 'SEC003-CROSS-ARTIFACT-ABSENT', 'pointer': '/cases/1/negative_cases/6', 'expected': {'condition': 'isolation_violation', 'finding_codes': ['explicit_connection_absent']}, 'return_owner': 'scope-binding-owner'},
            {'id': 'SEC003-SAME-PROJECT-NO-CONNECTION', 'pointer': '/cases/1/negative_cases/18', 'expected': {'condition': 'isolation_violation', 'finding_codes': ['explicit_connection_absent']}, 'return_owner': 'scope-binding-owner'}
        ],
        'conclusion': 'local unit defer and system-level absent-connection violation are separate source-backed observations. No L9 whole-system case with an empty fallback observation may replace the system finding.'
    },
    'current_l5_primary_tree_caller_mapping_audit': {
        'status': 'no_meaning_preserving_bijection_under_current_l5_functions',
        'l5_functions': {
            'compare_fallback': {'reads':['/request/fallback'], 'return_root_fields':['grade','findings'], 'primary_tree_expected':'violation/implicit_fallback'},
            'compare_caller_material': {'reads':['/request/caller_kind'], 'return_root_fields':['grade','findings'], 'six_known_callers_expected':'corresponding/empty findings'},
            'compose_scope_proposal': {'reads':['/caller','/fallback','/request/origin','/request/target','/context'], 'caller_input':'PartAnalysis; does not read raw /request/caller_kind'}
        },
        'six_l9_rows': primary_tree_audit,
        'conclusion': 'L5 compare_fallback projection is identical across six caller rows. compare_caller_material distinguishes caller_kind but returns the same corresponding result and has no fallback finding. compose_scope_proposal combines the two PartAnalysis values, but caller_kind has already been reduced to the same PartAnalysis and is not read there. No existing L5 function simultaneously consumes the two dimensions while retaining the fallback violation; adding such a function would extend current L5 read/return contract and is not an admissible solution derived from current source.',
        'source_derived_provenance_candidate': {
            'status': 'candidate_for_separate_l5_l8_vpair_not_canonical',
            'derivation': 'L3/L4 name the six caller categories and L4 expected_preserved requires original request identity to remain unmodified. compare_caller_material already owns caller_kind recognition; compose_scope_proposal already consumes that caller analysis and preserves findings.',
            'minimal_l5_change': 'For the six source-backed known caller values, add caller_kind_provenance to compare_caller_material result and pass that field unchanged through compose_scope_proposal. Do not alter grade/findings, permission, owner routing, or operation_effect. The representation for unknown/absent/malformed caller inputs is unresolved and is not invented in this six-row candidate.',
            'l8_unit_shape': 'Use compose_scope_proposal for six distinct input caller-analysis provenance values plus the same existing fallback PartAnalysis. Each unit case has the same implicit_fallback class/expected but a caller-specific expected_preserved.caller_kind; the consumed input and returned provenance differ, so cases are not duplicate unit observations.',
            'l9_system_shape': 'For each existing caller-specific L9 row, independently expect the exact caller_kind provenance from that row input alongside its unchanged system finding; pair to exactly one L8 caller-provenance case.',
            'rowwise_pairs': [
                {'l9_case_id': row['l9_case_id'], 'caller_kind_input': row['candidate_caller_kind_provenance_input'],
                 'l8_unit_case_id': f"SEC003-L8-FALLBACK-PRIMARY-{row['caller_kind'].upper().replace('-', '_')}",
                 'l8_expected_preserved_caller_kind': row['candidate_caller_kind_provenance_expected'],
                 'l9_expected_preserved_caller_kind': row['candidate_caller_kind_provenance_expected'],
                 'fallback_expected': row['candidate_expected_fallback_observation']}
                for row in primary_tree_audit
            ],
            'pairing_rule': 'Each caller value is a distinct consumed provenance input and output. The six rows do not duplicate one identical projection; every corresponding L9 system row still independently retains the same fallback violation.',
            'limits': ['This adds a provenance result field to existing L5 function contracts; it must be reviewed as a separate L5/L8 V-pair.', 'Current L9 expected_observation does not expose caller_kind provenance; the candidate would add it to case-level expected_preserved only, without changing the system finding/class.', 'No authority, permission, routing, or side-effect meaning changes.', 'Caller provenance return behavior for unknown/absent/malformed caller input is not specified by this six-row candidate.']
        }
    },
    'limits': [
        '50 L9候補のcondition/expected/expected_preservedは対応L4 classから導出。L8のfunction-read projectionは既知入力条件の根拠として参照するが、L9統合fixtureや実行oracleの代替にはしない。',
        '91 L8 candidate rows are noncanonical and not executed.',
        'No canonical L5/L8/L9 source file was modified.'
    ]
}
(OUT/'rowwise-integration-design.json').write_text(json.dumps(artifact, ensure_ascii=False, indent=2)+'\n')
print(json.dumps(artifact['counts'], ensure_ascii=False))
