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
    for row in current['cases']['rows']:
        cid, role, req, l4_ref, l9_ref, oracle, source_ptr, expected_ptr, basis, boundary, state, qualification = row
        oi, ci, source_case = l9_by_id[cid]
        assert source_ptr == f'/verification_obligations/{oi}/concrete_cases/{ci}/independent_source_packet/raw_utf8'
        assert expected_ptr == f'/verification_obligations/{oi}/concrete_cases/{ci}/expected_material'
        assert resolve(l9, source_ptr) == source_case['independent_source_packet']['raw_utf8']
        assert resolve(l9, expected_ptr) == source_case['expected_material']
        assert basis == source_case['basis']
        assert role in {fn['id'] for fn in l5['algorithms']}
        assert state == 'not_executed' and qualification == 'synthetic_fixture_only'

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
        'checks': [
            'all prior L8 source case IDs and order retained; exact L9 source/expected pointers and scenario basis resolve',
            'all 27 local probe IDs, roles, source cases, patch paths and independent expected deltas match prior bytes; L4/L9 source_ref revision+pointer resolve against exact pins',
            '1 source reuse, 7 primitive cases and 1 typed carrier boundary retain identity and intended oracle boundary',
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
