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
L3F = 'docs/helix-connect/L3-requirements/functional-requirements.json'
L10F = 'docs/helix-connect/L10-verification/functional-verification.json'
L3B = 'docs/helix-connect/L3-requirements/business-requirements.json'
L10B = 'docs/helix-connect/L10-verification/business-verification.json'
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


def expectation_rule_label(case_id: str, tag: str, rule_id: str, l5_doc) -> str:
    rule = next(rule for rule in l5_doc['contract_views'][tag]['failure_rules'] if rule['id'] == rule_id)
    selector = rule.get('selector', {})
    literal = selector.get('zero_literal') if 'MISSING' in case_id else selector.get('many_literal') if 'DUPLICATE' in case_id else None
    trigger = literal or rule.get('when') or selector.get('kind', 'rule_trigger')
    return f"{rule_id}|{rule.get('area')}+{rule.get('field')}={trigger}@{rule.get('owner_route')}"


def derive_case_expectation(case_id: str, function_ref: str, rule_refs: list[str], scenario_basis: str, l5_doc) -> dict:
    if rule_refs:
        tag = case_id.split('-')[1]
        indexes = {rule['id']: i for i, rule in enumerate(l5_doc['contract_views'][tag]['failure_rules'])}
        return {'scenario_class': 'negative', 'condition': scenario_basis, 'decision': '列挙したL5 findingを宣言routeへ返し、terminal successを認めない。', 'findings': [expectation_rule_label(case_id, tag, ref.split(':', 1)[1], l5_doc) for ref in rule_refs], 'l5_refs': [f'/contract_views/{tag}/failure_rules/{indexes[ref.split(":", 1)[1]]}' for ref in rule_refs], 'verification_status': 'unverified'}
    if function_ref == 'FN-C007-01':
        return {'scenario_class': 'normal', 'condition': scenario_basis, 'decision': '宣言された各辺の定義・receipt一対一性・条件・mappingが揃う場合だけfixture terminal successとする。', 'findings': [], 'l5_refs': ['/contract_views/F01/terminal_predicate'], 'verification_status': 'unverified'}
    if function_ref == 'FN-C007-02':
        return {'scenario_class': 'negative', 'condition': scenario_basis, 'decision': '中間故障を停止位置として保持し、先行成功と未完義務/ownerを残し、後続attemptを実行済みにしない。', 'findings': [], 'l5_refs': ['/contract_views/F02'], 'verification_status': 'unverified'}
    if function_ref == 'FN-C007-03' and 'EXACT-DECLARED-SCOPE' in case_id:
        return {'scenario_class': 'normal', 'condition': scenario_basis, 'decision': '宣言された対象scopeの必要evidenceと同対象の境界情報が揃う場合だけfixture correspondenceとする。', 'findings': [], 'l5_refs': ['/contract_views/N01/evidence_predicate'], 'verification_status': 'unverified'}
    if function_ref == 'FN-C007-03':
        return {'scenario_class': 'negative', 'condition': scenario_basis, 'decision': 'fixture全体の完了を根拠に対象scopeを拡張せず、未選択対象や実source資格を成立させない。', 'findings': [], 'l5_refs': ['/contract_views/N01/evidence_predicate'], 'verification_status': 'unverified'}
    if function_ref == 'FN-C007-04':
        return {'scenario_class': 'normal', 'condition': scenario_basis, 'decision': '技術終端と業務未受入を分け、元business record/ownerを保ち、Acceptedを生成しない。', 'findings': [], 'l5_refs': ['/contract_views/B01/acceptance'], 'verification_status': 'unverified'}
    raise AssertionError((case_id, function_ref, rule_refs))


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
    assert sum(current['preserved_inventory'][key] for key in ('source_cases', 'local_probes', 'local_probe_source_reuse', 'pure_primitive_cases', 'typed_carrier_boundary_cases')) == 127
    assert [row[0] for row in current['cases']['rows']] == [row['id'] for row in prior['cases']]
    assert [row[0] for row in current['local_probes']['rows']] == [row['id'] for row in prior['local_probes']]
    assert [row['id'] for row in current['pure_primitive_cases']] == [row['id'] for row in prior['pure_primitive_cases']]
    assert [row['id'] for row in current['typed_carrier_boundary_cases']] == [row['id'] for row in prior['typed_carrier_boundary_cases']]

    l9_by_id = {case['id']: (oi, ci, case) for oi, ob in enumerate(l9['verification_obligations']) for ci, case in enumerate(ob['concrete_cases'])}
    case_columns = current['cases']['columns']
    cix = {name: i for i, name in enumerate(case_columns)}
    assert case_columns[-4:] == ['u_id', 'l5_function_ref', 'l5_failure_rule_refs', 'expected']
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
    assert set(trace_pins) == {L3F, L10F, L3B, L10B, L4, L5, L9}
    for path, pin in trace_pins.items():
        assert sha(subprocess.check_output(['git', 'show', f"{pin['revision']}:{path}"], cwd=ROOT)) == pin['sha256']
    l5pin, l9pin = trace_pins[L5], trace_pins[L9]
    assert sha((ROOT / L5).read_bytes()) == l5pin['sha256']
    assert sha((ROOT / L9).read_bytes()) == l9pin['sha256']
    function_refs = {item['id'] for item in l5['pure_signatures']}
    assert len(trace['l5_public_functions']) == len(function_refs) == 4
    rows_by_uid = {}
    branch_case_ids = []
    expected_class_counts = {'normal': 0, 'negative': 0}
    for row in current['cases']['rows']:
        uid, fn, rule_refs, expected = row[-4:]
        assert uid.startswith('U-C007-') and uid not in rows_by_uid
        assert fn in function_refs
        rows_by_uid[uid] = row
        assert expected == derive_case_expectation(row[0], fn, rule_refs, row[8], l5)
        assert expected['scenario_class'] in expected_class_counts
        expected_class_counts[expected['scenario_class']] += 1
        assert expected['verification_status'] == 'unverified'
        assert expected['l5_refs']
        assert all(resolve(l5, pointer) is not None for pointer in expected['l5_refs'])
        assert expected['verification_status'] == 'unverified'
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
    assert expected_class_counts == {'normal': 3, 'negative': 88}
    declared_rules = {(tag, rule['id']) for tag, view in l5['contract_views'].items() for rule in view['failure_rules']}
    assert len(declared_rules) == 26
    seen_rules = set()
    for function in trace['l5_public_functions']:
        fn = function['function_ref']
        assert fn in function_refs
        assert resolve(l5, function['source_ref']['pointer'])['id'] == fn
        assert resolve(l5, function['algorithm_ref']['pointer'])['id'] == fn
        assert len(function['case_u_ids']) > 0
        assert all(rows_by_uid[uid][-3] == fn for uid in function['case_u_ids'])
        assert len(function['case_u_ids']) == len(set(function['case_u_ids']))
    for rule in trace['l5_failure_rules']:
        tag_rule = (rule['source_ref']['pointer'].split('/')[2], rule['rule_id'])
        assert tag_rule in declared_rules and tag_rule not in seen_rules
        seen_rules.add(tag_rule)
        source = resolve(l5, rule['source_ref']['pointer'])
        assert source['id'] == rule['rule_id']
        assert rule['function_ref'] == f'FN-C007-{["F01","F02","N01","B01"].index(tag_rule[0])+1:02d}'
        for uid in rule['case_u_ids']:
            assert uid in rows_by_uid and f'{tag_rule[0]}:{rule["rule_id"]}' in rows_by_uid[uid][-2]
    assert seen_rules == declared_rules
    assert len(trace['l9_basic_branches']) == 91
    for branch in trace['l9_basic_branches']:
        assert branch['u_id'] in rows_by_uid and rows_by_uid[branch['u_id']][0] == branch['source_case_id']
        assert resolve(l9, branch['source_ref']['pointer'])['id'] == branch['source_case_id']
        assert branch['execution_state'] == 'not_executed' and branch['fixture_only'] is True

    columns = current['local_probes']['columns']
    ix = {name: i for i, name in enumerate(columns)}
    assert columns[-1] == 'u_id'
    assert len({row[ix['u_id']] for row in current['local_probes']['rows']}) == 27
    local_probe_uid_by_id = {}
    local_rule_uids = {}
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
        uid = row[ix['u_id']]
        assert uid.startswith('U-C007-LP-')
        local_probe_uid_by_id[row[ix['id']]] = uid
        tag = row[ix['id']].split('-')[2]
        reasons = []
        for change in expected_delta:
            if change['path'] == '/failure_reasons' and isinstance(change.get('value'), list):
                reasons = change['value']
        for rule in l5['contract_views'][tag]['failure_rules']:
            prefix = rule.get('area', '').split('{', 1)[0]
            if any(reason.get('area', '').startswith(prefix) for reason in reasons):
                local_rule_uids.setdefault((tag, rule['id']), []).append(uid)

    assert len(local_probe_uid_by_id) == 27
    function_by_id = {item['function_ref']: item for item in trace['l5_public_functions']}
    for fn, function in function_by_id.items():
        expected_local_uids = [row[ix['u_id']] for row in current['local_probes']['rows'] if row[ix['role_id']] == fn]
        assert function['local_probe_u_ids'] == expected_local_uids
    for rule in trace['l5_failure_rules']:
        tag = rule['source_ref']['pointer'].split('/')[2]
        key = (tag, rule['rule_id'])
        ids = [row[ix['id']] for row in current['local_probes']['rows'] if row[ix['u_id']] in local_rule_uids.get(key, [])]
        assert rule['local_probe_u_ids'] == local_rule_uids.get(key, [])
        assert rule['local_probe_ids'] == ids
        if rule['case_u_ids'] and rule['local_probe_u_ids']:
            expected_status = 'l9_and_local_probe_witnessed'
        elif rule['case_u_ids']:
            expected_status = 'l9_oracle_witnessed'
        elif rule['local_probe_u_ids']:
            expected_status = 'local_probe_witnessed'
        else:
            expected_status = 'uncovered'
        assert rule['coverage_status'] == expected_status, key
    assert all(rule['coverage_status'] != 'uncovered' for rule in trace['l5_failure_rules'])
    assert len(trace['l5_failure_rules']) == 26
    assert trace['local_probe_rule_derivations']
    expected_derivation_sources = {
        'F02:stop_position': [(L3F, '/requirements/14'), (L10F, '/cases/14'), (L4, '/contracts/1'), (L5, '/contract_views/F02/failure_rules/7')],
        'B01:technical_content': [(L3B, '/requirements/1'), (L10B, '/cases/1'), (L4, '/contracts/3'), (L5, '/contract_views/B01/failure_rules/0')],
    }
    for derivation in trace['local_probe_rule_derivations']:
        assert all(pid in local_probe_uid_by_id for pid in derivation['local_probe_ids'])
        assert derivation['local_probe_u_ids'] == [local_probe_uid_by_id[pid] for pid in derivation['local_probe_ids']]
        assert all(resolve(load(ref['path']), ref['pointer']) is not None for ref in derivation['basis_refs'])
        assert [(ref['path'], ref['pointer']) for ref in derivation['basis_refs']] == expected_derivation_sources[derivation['rule_ref']]
        expected_source_ids = {
            'F02:stop_position': [
                'HELIXCONNECT-L3-007-F02', 'HELIXCONNECT-L10-007-F02',
                'HELIXCONNECT-L4-007-F02', 'stop_position'],
            'B01:technical_content': [
                'HELIXCONNECT-L3-007-B01', 'HELIXCONNECT-L10-007-B01',
                'HELIXCONNECT-L4-007-B01', 'technical_content'],
        }[derivation['rule_ref']]
        assert [resolve(load(ref['path']), ref['pointer']).get('id') for ref in derivation['basis_refs']] == expected_source_ids
        expected_rows = {row[ix['id']]: row for row in current['local_probes']['rows']}
        if derivation['rule_ref'] == 'F02:stop_position':
            result_by_probe = {}
            for pid in derivation['local_probe_ids']:
                probe = expected_rows[pid]
                delta = probe[ix['expected_delta']]
                reasons = next(item['value'] for item in delta if item['path'] == '/failure_reasons')
                assert len(reasons) == 1 and reasons[0]['area'] == 'stop_position' and reasons[0]['return_owner'] == 'composite-owner'
                result_by_probe[pid] = reasons[0]['result']
            assert set(result_by_probe.values()) == {'missing', 'ambiguous_duplicate_not_compared'}
        elif derivation['rule_ref'] == 'B01:technical_content':
            probe = expected_rows[derivation['local_probe_ids'][0]]
            delta = probe[ix['expected_delta']]
            reason = next(item['value'] for item in delta if item['path'] == '/failure_reasons')[0]
            assert (reason['area'], reason['field'], reason['result'], reason['return_owner']) == ('technical_content', 'record', 'content_conflict', 'composite-owner')

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
        'traceability_source_pins': {path: pin['sha256'] for path, pin in trace_pins.items()},
        'inventory': current['preserved_inventory'],
        'l5_traceability': {
            'public_functions': len(trace['l5_public_functions']),
            'l9_branch_u_ids': len(trace['l9_basic_branches']),
            'predeclared_local_probe_u_ids': len(current['local_probes']['rows']),
            'failure_rules': len(trace['l5_failure_rules']),
            'covered_failure_rules': sum(rule['coverage_status'] != 'uncovered' for rule in trace['l5_failure_rules']),
            'case_expected_classes': expected_class_counts,
            'uncovered_failure_rules': [f"{rule['function_ref']}:{rule['rule_id']}" for rule in trace['l5_failure_rules'] if rule['coverage_status'] == 'uncovered'],
        },
        'checks': [
            'all prior L8 source case IDs and order retained; exact L9 source/expected pointers and scenario basis resolve',
            'all 27 local probe IDs, roles, source cases, patch paths and independent expected deltas match prior bytes; L4/L9 source_ref revision+pointer resolve against exact pins',
            '1 source reuse, 7 primitive cases and 1 typed carrier boundary retain identity and intended oracle boundary',
            '91 L9 branches and 27 predeclared local probes carry U-IDs without changing the 127 declaration count; each branch row has a short L5-derived expected decision, L5 citation, normal/negative class, and unverified state (3 normal, 88 negative)',
            'all four L5 public functions map by exact source refs; all 26 L5 failure rules are covered by fixed L9 oracle branches and/or predeclared local expected deltas',
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
