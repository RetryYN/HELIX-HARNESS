#!/usr/bin/env python3
"""WR257 L8 U-ID source/pointer preservation checker; no product execution."""
from __future__ import annotations
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = '663b75324810a6f004668a1451de5b03acc542c3'
L8 = 'docs/helix-connect/L8-unit-verification/composite-edge-terminal.json'
L5 = 'docs/helix-connect/L5-detail-design/composite-edge-terminal.json'
L4 = 'docs/helix-connect/L4-basic-design/composite-edge-terminal.json'
L9 = 'docs/helix-connect/L9-integration-verification/composite-edge-terminal.json'
EVIDENCE = 'scaffold/research/wr257-connect-composite-l8-slim-20261101/static-evidence.json'


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def load(path: str):
    return json.loads((ROOT / path).read_text(encoding='utf-8'))


def base_load(path: str):
    raw = subprocess.check_output(['git', 'show', f'{BASE}:{path}'], cwd=ROOT)
    return json.loads(raw)


def resolve(doc, pointer: str):
    value = doc
    for token in pointer.strip('/').split('/'):
        token = token.replace('~1', '/').replace('~0', '~')
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def has_fixture_hash_member(value) -> bool:
    if isinstance(value, dict):
        for key, child in value.items():
            lowered = key.lower()
            if 'sha256' in lowered or 'raw_sha' in lowered or lowered == 'hash':
                return True
            if has_fixture_hash_member(child):
                return True
    elif isinstance(value, list):
        return any(has_fixture_hash_member(child) for child in value)
    return False


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--record', action='store_true', help='write scaffold-only static evidence')
    args = parser.parse_args()
    current = load(L8)
    prior = base_load(L8)
    l5, l4, l9 = load(L5), load(L4), load(L9)
    pinned_docs = {L4: l4, L9: l9}
    pin_records = {item['path']: item for item in current['source_pair_pins']}

    assert len(current['cases']['rows']) == len(prior['cases']) == 91
    assert len(current['local_probes']['rows']) == len(prior['local_probes']) == 27
    assert len(current['local_probe_source_reuse']) == len(prior['local_probe_source_reuse']) == 1
    assert len(current['pure_primitive_cases']) == len(prior['pure_primitive_cases']) == 7
    assert len(current['typed_carrier_boundary_cases']) == len(prior['typed_carrier_boundary_cases']) == 1
    assert [row[0] for row in current['cases']['rows']] == [row['id'] for row in prior['cases']]
    assert [row[0] for row in current['local_probes']['rows']] == [row['id'] for row in prior['local_probes']]
    assert [row['id'] for row in current['pure_primitive_cases']] == [row['id'] for row in prior['pure_primitive_cases']]
    assert [row['id'] for row in current['typed_carrier_boundary_cases']] == [row['id'] for row in prior['typed_carrier_boundary_cases']]

    l9_by_id = {case['id']: (oi, ci, case) for oi, ob in enumerate(l9['verification_obligations']) for ci, case in enumerate(ob['concrete_cases'])}
    case_columns = current['cases']['columns']
    cix = {name: i for i, name in enumerate(case_columns)}
    assert case_columns[-3:] == ['u_id', 'l5_function_ref', 'l5_failure_rule_refs']
    for row in current['cases']['rows']:
        cid, role, req, l4_ref, l9_ref, oracle, source_ptr, expected_ptr, basis, boundary, state, qualification = row[:12]
        oi, ci, source_case = l9_by_id[cid]
        assert source_ptr == f'/verification_obligations/{oi}/concrete_cases/{ci}/independent_source_packet/raw_utf8'
        assert expected_ptr == f'/verification_obligations/{oi}/concrete_cases/{ci}/expected_material'
        assert resolve(l9, source_ptr) == source_case['independent_source_packet']['raw_utf8']
        assert resolve(l9, expected_ptr) == source_case['expected_material']
        assert basis == source_case['basis']
        assert role in {fn['id'] for fn in l5['algorithms']}
        assert state == 'not_executed' and qualification == 'synthetic_fixture_only'

    trace = current['l5_unit_traceability']
    trace_pins = {item['path']: item for item in trace['source_pins']}
    for path, pin in trace_pins.items():
        assert sha(subprocess.check_output(['git', 'show', f"{pin['revision']}:{path}"], cwd=ROOT)) == pin['sha256']
    l5pin, l9pin = trace_pins[L5], trace_pins[L9]
    assert sha((ROOT / L5).read_bytes()) == l5pin['sha256']
    assert sha((ROOT / L9).read_bytes()) == l9pin['sha256']
    function_refs = {item['id'] for item in l5['pure_signatures']}
    assert len(trace['l5_public_functions']) == len(function_refs) == 4
    rows_by_uid = {}
    branch_case_ids = []
    for row in current['cases']['rows']:
        uid, fn, rule_refs = row[-3:]
        assert uid.startswith('U-C007-') and uid not in rows_by_uid
        assert fn in function_refs
        rows_by_uid[uid] = row
        branch_case_ids.append(row[0])
        tag = row[0].split('-')[1]
        ob_index = next(i for i, ob in enumerate(l9['verification_obligations']) if ob['id'].endswith('-' + tag))
        case_index = next(i for i, c in enumerate(l9['verification_obligations'][ob_index]['concrete_cases']) if c['id'] == row[0])
        assert resolve(l9, f'/verification_obligations/{ob_index}/concrete_cases/{case_index}')['id'] == row[0]
        exact_areas = {reason.get('area', '') for reason in resolve(l9, f'/verification_obligations/{ob_index}/concrete_cases/{case_index}/expected_material/failure_reasons')}
        expected_rule_refs = []
        for rule in l5['contract_views'][tag]['failure_rules']:
            prefix = rule.get('area', '').split('{', 1)[0]
            if any(area.startswith(prefix) for area in exact_areas):
                expected_rule_refs.append(f'{tag}:{rule["id"]}')
        assert rule_refs == expected_rule_refs, row[0]
    assert len(set(branch_case_ids)) == 91
    declared_rules = {(tag, rule['id']) for tag, view in l5['contract_views'].items() for rule in view['failure_rules']}
    assert len(declared_rules) == 26
    seen_rules = set()
    for function in trace['l5_public_functions']:
        fn = function['function_ref']
        assert fn in function_refs
        assert resolve(l5, function['source_ref']['pointer'])['id'] == fn
        assert resolve(l5, function['algorithm_ref']['pointer'])['id'] == fn
        assert len(function['case_u_ids']) > 0
        assert all(rows_by_uid[uid][-2] == fn for uid in function['case_u_ids'])
        assert len(function['case_u_ids']) == len(set(function['case_u_ids']))
    for rule in trace['l5_failure_rules']:
        tag_rule = (rule['source_ref']['pointer'].split('/')[2], rule['rule_id'])
        assert tag_rule in declared_rules and tag_rule not in seen_rules
        seen_rules.add(tag_rule)
        source = resolve(l5, rule['source_ref']['pointer'])
        assert source['id'] == rule['rule_id']
        assert rule['function_ref'] == f'FN-C007-{["F01","F02","N01","B01"].index(tag_rule[0])+1:02d}'
        if rule['case_u_ids']:
            assert rule['coverage_status'] == 'l9_oracle_witnessed'
            assert 'needed_u_id' not in rule
            for uid in rule['case_u_ids']:
                assert uid in rows_by_uid and f'{tag_rule[0]}:{rule["rule_id"]}' in rows_by_uid[uid][-1]
        else:
            assert rule['coverage_status'] == 'no_l9_oracle_witness; derived_needed_u_id'
            assert rule['needed_u_id'].startswith('U-C007-RULE-') and rule['unverified_reason']
    assert seen_rules == declared_rules
    assert len(trace['l9_basic_branches']) == 91
    for branch in trace['l9_basic_branches']:
        assert branch['u_id'] in rows_by_uid and rows_by_uid[branch['u_id']][0] == branch['source_case_id']
        assert resolve(l9, branch['source_ref']['pointer'])['id'] == branch['source_case_id']
        assert branch['execution_state'] == 'not_executed' and branch['fixture_only'] is True

    columns = current['local_probes']['columns']
    ix = {name: i for i, name in enumerate(columns)}
    for row, source in zip(current['local_probes']['rows'], prior['local_probes']):
        assert row[ix['role_id']] == source['function_ref']
        assert row[ix['source_case_id']] == source.get('source_case_id')
        assert row[ix['expected_basis']] == source.get('expected_basis')
        assert row[ix['input_patch_paths']] == [[x.get('op'), x.get('path')] for x in source.get('input_patch', [])]
        def expand(value):
            if isinstance(value, dict) and set(value) == {'source_ref'}:
                ref = value['source_ref']
                record = pin_records[ref['path']]
                assert ref['revision'] == record['revision']
                assert sha(subprocess.check_output(['git', 'show', f"{ref['revision']}:{ref['path']}"], cwd=ROOT)) == record['sha256']
                return resolve(pinned_docs[ref['path']], ref['pointer'])
            if isinstance(value, dict):
                return {key: expand(child) for key, child in value.items()}
            if isinstance(value, list):
                return [expand(child) for child in value]
            return value
        expected_delta = []
        for item in row[ix['expected_delta']]:
            actual = {'op': item['op'], 'path': item['path']}
            if 'value' in item:
                actual['value'] = expand(item['value'])
            expected_delta.append(actual)
        assert expected_delta == source.get('expected_delta_from_source_oracle', []), source['id']
        assert row[ix['execution_state']] == 'not_executed'

    assert 'unit_case_refs' not in json.dumps(l5, ensure_ascii=False)
    assert current['traceability_boundary']['l5_unit_case_refs'] == 'absent_in_source_document'
    assert set(current['removed_materials']) == {'decision_ref', 'git_commit', 'path', 'meaning', 'removed_key_rule', 'use_boundary'}
    assert 'DT-VT-105' in current['removed_materials']['use_boundary']
    assert not has_fixture_hash_member(current['cases'])
    assert not has_fixture_hash_member(current['local_probes'])
    assert not has_fixture_hash_member(current['local_probe_source_reuse'])
    assert not has_fixture_hash_member(current['pure_primitive_cases'])
    assert not has_fixture_hash_member(current['typed_carrier_boundary_cases'])

    assert sha((ROOT / L4).read_bytes()) == current['source_pair_pins'][0]['sha256']
    assert sha((ROOT / L9).read_bytes()) == current['preserved_l9_oracle']['sha256']
    assert sha((ROOT / L5).read_bytes()) == current['candidate_design_binding']['sha256_of_saved_file_bytes']
    payload = {
        'schema': 'wr257-static-index-evidence.v1',
        'evidence_kind': 'scaffold',
        'authority_effect': 'none',
        'request_id': 'WR257-CONNECT-COMPOSITE-L8-SLIM',
        'base_revision': BASE,
        'target_path': L8,
        'target_sha256': sha((ROOT / L8).read_bytes()),
        'target_bytes': (ROOT / L8).stat().st_size,
        'source_pins': {
            L4: current['source_pair_pins'][0]['sha256'],
            L5: current['candidate_design_binding']['sha256_of_saved_file_bytes'],
            L9: current['preserved_l9_oracle']['sha256'],
        },
        'inventory': current['preserved_inventory'],
        'l5_traceability': {
            'public_functions': len(trace['l5_public_functions']),
            'l9_branch_u_ids': len(trace['l9_basic_branches']),
            'failure_rules': len(trace['l5_failure_rules']),
            'l9_oracle_witnessed_rules': sum(bool(rule['case_u_ids']) for rule in trace['l5_failure_rules']),
            'rules_without_l9_oracle_witness': [f"{rule['function_ref']}:{rule['rule_id']} ({rule['needed_u_id']})" for rule in trace['l5_failure_rules'] if not rule['case_u_ids']],
        },
        'checks': [
            'all prior L8 source case IDs and order retained; exact L9 source/expected pointers and scenario basis resolve',
            'all 27 local probe IDs, roles, source cases, patch paths and independent expected deltas match prior bytes; L4/L9 source_ref revision+pointer resolve against exact pins',
            '1 source reuse, 7 primitive cases and 1 typed carrier boundary retain identity and intended oracle boundary',
            '91 L9 basic branches map to unique U-IDs and exact L9 pointers; all four L5 public functions map by source refs; all 26 L5 failure rules have oracle-witnessed U-IDs or explicit derived-needed U-IDs when no witness exists',
            'L5 has no unit_case_refs; absence is recorded without synthetic references',
            'fixture hashes are absent from case/probe inventories; retained digests are source/authority pins',
            'removed_materials has six required keys and names DT-VT-105 boundary',
        ],
        'not_established': ['product test execution', 'runtime behavior', 'source/owner qualification', 'L7 test citation', 'design or implementation readiness', 'full mutation-family coverage'],
    }
    if args.record:
        (ROOT / EVIDENCE).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(payload, ensure_ascii=False, sort_keys=True))


if __name__ == '__main__':
    main()
