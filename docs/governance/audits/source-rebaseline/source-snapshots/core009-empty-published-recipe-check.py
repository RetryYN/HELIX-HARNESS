#!/usr/bin/env python3
"""CORE009 F02-qualified-empty公開JSON recipeの固定監査用source snapshot。

repository rootから実行し、短いJSON記録を標準出力へ返す。
標準JSON操作と明示UTF8/hash/parseだけ。製品/domain/旧runtime/CIは実行しない。
seedの意味状態は条件付き期待のままで、正しさ・実資格・配送・保存を証明しない。
他caseや一般JSON Patch適合性を検査する汎用engineではない。
"""
import copy
import hashlib
import json
import subprocess
from pathlib import Path

def enc(v, sort=False):
    return json.dumps(v, ensure_ascii=False, separators=(',', ':'), allow_nan=False, sort_keys=sort).encode()

def wit(v):
    return {k: {'sha256': hashlib.sha256(b).hexdigest(), 'byte_length': len(b)} for k, b in [('canonical', enc(v, True)), ('ordered', enc(v))]}

def ts(ptr):
    assert ptr.startswith('/')
    return [s.replace('~1', '/').replace('~0', '~') for s in ptr[1:].split('/')]

def get(o, ptr):
    for t in ts(ptr):
        o = o[int(t)] if isinstance(o, list) else o[t]
    return o

def ops(o, rows):
    for row in rows:
        op = row['op']
        t = ts(row['path'])
        parent = o
        for s in t[:-1]:
            parent = parent[int(s)] if isinstance(parent, list) else parent[s]
        k = t[-1]
        idx = len(parent) if isinstance(parent, list) and k == '-' else int(k) if isinstance(parent, list) else k
        if op == 'remove':
            del parent[idx]
            continue
        v = copy.deepcopy(get(o, row['from']) if op == 'copy' else row['value'])
        if isinstance(parent, list):
            if op == 'replace':
                assert 0 <= idx < len(parent)
                parent[idx] = v
            else:
                assert op in ('copy', 'add') and 0 <= idx <= len(parent)
                parent.insert(idx, v)
        else:
            if op == 'replace':
                assert idx in parent
            parent[idx] = v
    return o

def strict(text):

    def pairs(items):
        result = {}
        for k, v in items:
            if k in result:
                raise ValueError('duplicate decoded key')
            result[k] = v
        return result

    def reject(value):
        raise ValueError('non-JSON numeric constant')
    return json.loads(text, object_pairs_hook=pairs, parse_constant=reject)

def wit_stream(value):
    result = {}
    for name, sort in [('canonical', True), ('ordered', False)]:
        h = hashlib.sha256()
        length = 0
        encoder = json.JSONEncoder(ensure_ascii=False, separators=(',', ':'), allow_nan=False, sort_keys=sort)
        for chunk in encoder.iterencode(value):
            raw = chunk.encode()
            h.update(raw)
            length += len(raw)
        result[name] = {'sha256': h.hexdigest(), 'byte_length': length}
    return result

def check_comparisons():
    p = Path('docs/helix-harness/L8-unit-verification/product-template-application/general-proposal-exchange-fixtures.json')
    d = json.loads(p.read_text())
    part = d['parts']['empty_input']
    n = d['parts']['empty_native']
    sources = {}
    for s in part['fixed_sources']:
        key = (s['revision'], s['path'])
        raw = subprocess.check_output(['git', 'show', s['revision'] + ':' + s['path']])
        assert hashlib.sha256(raw).hexdigest() == s['raw_sha256']
        obj = json.loads(raw)
        sources[key] = obj
        for v in s['selected_objects']:
            observed = wit(get(obj, v['pointer']))
            assert all((observed[k] == v[k] for k in ('canonical', 'ordered')))
    w = copy.deepcopy(part['workspace_seed'])
    for m in part['fixed_source_mounts']:
        w[m['workspace_pointer'][1:]] = sources[m['revision'], m['path']]
    ops(w, part['standard_input_authoring_ops'])
    w['prepared_source_packets'] = []
    for spec in part['explicit_source_preparation']['source_packets']:
        idx = spec['source_index']
        source = w['raw']['sources'][idx]
        records = []
        for ptr in spec['raw_record_locations']:
            value = get(w, ptr)
            payload = {k: v for k, v in value.items() if k != 'source_ref'}
            records.append({'collection': ts(ptr)[1], 'ref': value['ref'], 'payload': payload})
        body = copy.deepcopy(source['body'])
        body['records'] = records
        b = enc(body)
        sha = hashlib.sha256(b).hexdigest()
        assert sha == spec['utf8_sha256'] and len(b) == spec['utf8_byte_length']
        w['prepared_source_packets'].append({'body': body, 'content_bytes': b.decode(), 'sha256': sha})
    ops(w, part['standard_prepared_packet_completion_ops'])
    I = w['caller_inputs']
    assert wit(I) == part['whole_input']
    x = copy.deepcopy(n['comparison_workspace_seed'])
    x['fixed_l8'] = sources[part['fixed_source_mounts'][0]['revision'], part['fixed_source_mounts'][0]['path']]
    x['independent_I'] = I
    ops(x, n['standard_comparison_authoring_ops'])
    observed = wit(x['comparisons'])
    expected = n['whole_witnesses']['comparisons']
    assert expected == d['cases'][1]['whole_witnesses']['native']['comparisons']
    assert observed == expected, {'observed': observed, 'expected': expected}
    result = {'base': subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip(), 'source': str(p), 'source_sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'scope': 'input plus empty_comparisons static JSON recipe only', 'fixed_l8': part['fixed_source_mounts'][0], 'input_witness_rechecked': wit(I), 'comparison_ops': len(n['standard_comparison_authoring_ops']), 'comparisons_witness': observed, 'comparison_summary': [{'producer_symbol': c.get('producer_symbol'), 'candidate_member_refs': c.get('material', {}).get('candidate_member_refs'), 'original_axes_count': len(c.get('original_axes', [])), 'findings_count': len(c.get('findings', []))} for c in x['comparisons']], 'expected_match': True, 'not_proved': ['domain comparison execution', 'caller/native/detail/General/publication/receiver/kernel recipe replay', 'case-wide independent reconstruction']}
    return {'recipe': d, 'input': I, 'comparisons': x['comparisons'], 'comparison_workspace': x, 'metadata': result}

def check_native(ctx):
    d, n, I, comparisons = (ctx['recipe'], ctx['recipe']['parts']['empty_native'], ctx['input'], ctx['comparisons'])
    fixed = []
    for s in n['fixed_sources']:
        raw = subprocess.check_output(['git', 'show', s['revision'] + ':' + s['path']])
        assert hashlib.sha256(raw).hexdigest() == s['raw_sha256']
        obj = json.loads(raw)
        selected = get(obj, s['pointer'])
        assert wit(selected) == {k: s[k] for k in ('canonical', 'ordered')}
        fixed.append(obj)
    c = copy.deepcopy(get(fixed[0], n['caller_assembly']['seed_source_pointer']))
    c['assets'] = {'raw': copy.deepcopy(I['validation_input']['raw']), 'comparisons': copy.deepcopy(comparisons)}
    pinfo = n['caller_assembly']['normal_base_patch_selected_range']
    ops(c, get(fixed[0], pinfo['pointer'])[pinfo['first_inclusive']:pinfo['last_exclusive']])
    ops(c, get(fixed[0], n['caller_assembly']['normal_input_refresh_patch_pointer']))
    assert wit(c['input']['caller_inputs']) == wit(I)
    c['expected']['proposal'] = copy.deepcopy(get(fixed[0], n['proposal_assembly']['seed_source_pointer']))
    ops(c, n['proposal_assembly']['standard_ops'])
    native = copy.deepcopy(get(fixed[1], n['native_assembly']['seed_source_pointer']))
    native['native_reconstructed'] = c
    ops(native, n['native_assembly']['standard_seed_ops'])
    ops(native, n['native_assembly']['standard_completion_ops'])
    values = {'input': I, 'comparisons': comparisons, 'validation': c['input']['caller_return']['validation'], 'caller_return': c['input']['caller_return'], 'proposal_return': c['expected'], 'native_return': native['expected']}
    observed = {}
    for key, v in values.items():
        observed[key] = wit(v)
        expected = n['whole_witnesses'][key]
        assert observed[key] == expected, {'key': key, 'observed': observed[key], 'expected': expected}
        assert expected == d['cases'][1]['whole_witnesses']['native'][key]
    return {'caller': c, 'native': native}

def check_private(ctx, native_stage):
    d = ctx['recipe']
    p = d['parts']['empty_private_export']
    a = copy.deepcopy(p['workspace_seed'])
    for imp in p['imports']:
        source = {'empty_caller': native_stage['caller'], 'empty_native': native_stage['native']}[imp['source']['workspace']]
        a[imp['workspace_pointer'][1:]] = get(source, imp['source']['materialized_pointer'])
    ops(a, p['standard_completion_ops'])
    values = {'input': a['input'], 'native_detail_expected': a['expected'], 'f02_detail': a['expected']['universe_observation']['value']}
    witnesses = {}
    for k, v in values.items():
        witnesses[k] = wit(v)
        assert witnesses[k] == p['whole_witnesses'][k]
        assert p['whole_witnesses'][k] == d['cases'][1]['whole_witnesses']['detail'][k]
    return a

def check_general(ctx, native_stage, private_stage):
    d = ctx['recipe']
    part = d['parts']['empty_general']
    pin = part['fixed_original_provider_source']
    raw = subprocess.check_output(['git', 'show', pin['revision'] + ':' + pin['path']])
    assert hashlib.sha256(raw).hexdigest() == pin['raw_sha256']
    provider = get(json.loads(raw), pin['pointer'])
    case = provider['cases'][pin['case_index']]
    recipe = case['input_recipe']
    ws = {'case': case, 'raw_source_json_utf8_literals': provider['raw_source_json_utf8_literals'], 'input': None}
    ops(ws, [recipe['create_input_from_request_seed']])
    ops(ws, recipe['materialize_raw_source_strings'])
    assert wit(ws['input'])['canonical'] == {'sha256': recipe['raw_request_canonical_sha256'], 'byte_length': recipe['raw_request_canonical_byte_length']}
    v = copy.deepcopy(part['raw_source0_variant']['workspace_seed'])
    v['parsed_original_source0'] = strict(ws['input']['source_occurrences'][0]['source_json_utf8'])
    v['independent_I'] = ctx['input']
    v['request'] = ws['input']
    ops(v, part['raw_source0_variant']['standard_ops'])
    b = enc(v['raw_source0'])
    sha = hashlib.sha256(b).hexdigest()
    assert sha == part['raw_source0_variant']['utf8_sha256'] and len(b) == part['raw_source0_variant']['utf8_byte_length']
    v['preparation'] = {'source_json_utf8': b.decode(), 'source_sha256': sha}
    ops(v, part['raw_source0_variant']['standard_completion_ops'])
    g = copy.deepcopy(part['workspace_seed'])
    g['input'] = v['request']
    g['parsed_raw_bodies'] = {str(i): strict(src['source_json_utf8']) for i, src in enumerate(g['input']['source_occurrences'])}
    g['fixed_observations'] = part['expected_source_observation']
    g['fixed_N'] = native_stage['native']['expected']
    g['private_export_expected'] = private_stage['expected']
    ops(g, part['standard_completion_ops'])
    observed = {}
    for key in ('input', 'expected'):
        observed[key] = wit(g[key])
        assert observed[key] == part['whole_witnesses'][key]
        assert observed[key] == d['cases'][1]['whole_witnesses']['general'][key]
    return g

def check_publication(ctx, general_stage):
    d = ctx['recipe']
    part = d['parts']['publication']
    pub = copy.deepcopy(part['workspace_seed'])
    pub['general_view_source'] = general_stage['expected']
    pub['header_raw_return'] = copy.deepcopy(part['independent_owner_port_fixture']['header_raw_return'])
    ops(pub, part['before_wire_standard_ops'])
    b = enc({'records': [pub['publication_record']]})
    sha = hashlib.sha256(b).hexdigest()
    assert {'wire_sha256': sha, 'wire_UTF8_length_bytes': len(b)} == d['cases'][1]['wire_witness']
    pub['wire'] = {'source_json_utf8': b.decode(), 'source_sha256': sha}
    pub['authority_raw_return'] = copy.deepcopy(part['independent_owner_port_fixture']['authority_raw_return'])
    ops(pub, part['authority_fixture_digest_ops'])
    ops(pub, part['after_wire_standard_ops'])
    expected = d['cases'][1]['whole_witnesses']['connection']['publication_expected']
    witness = wit_stream(pub['expected'])
    assert witness == expected
    assert wit_stream(general_stage['input']) == d['cases'][1]['whole_witnesses']['connection']['provider_input']
    parsed = strict(pub['wire']['source_json_utf8'])
    record_witness = wit_stream(parsed['records'][0])['ordered']
    assert record_witness == {'sha256': d['cases'][1]['wire_parse_record_witness']['sha256'], 'byte_length': d['cases'][1]['wire_parse_record_witness']['byte_length']}
    return {'publication': pub, 'parsed': parsed}

def check_receiver(ctx, native_stage, private_stage, general_stage, publication_stage):
    d = ctx['recipe']
    part = d['parts']['empty_receiver']
    cache = {}
    for pin in part['fixed_sources']:
        key = (pin['revision'], pin['path'])
        if key not in cache:
            raw = subprocess.check_output(['git', 'show', pin['revision'] + ':' + pin['path']])
            assert hashlib.sha256(raw).hexdigest() == pin['file_sha256']
            cache[key] = json.loads(raw)
        selected = get(cache[key], pin['pointer'])
        assert wit(selected) == {'canonical': pin['selected_canonical'], 'ordered': pin['selected_ordered']}
    owner_part = d['parts']['independent_OS_owner_empty_selection']
    key = (owner_part['fixed_source_revision'], owner_part['fixed_source_path'])
    raw = subprocess.check_output(['git', 'show', key[0] + ':' + key[1]])
    assert hashlib.sha256(raw).hexdigest() == owner_part['fixed_source_raw_sha256']
    fixed = cache[key]
    owner = copy.deepcopy(owner_part['workspace_seed'])
    for mount in owner_part['source_mounts']:
        owner[mount['workspace_pointer'][1:]] = copy.deepcopy(get(fixed, mount['pointer']))
    ops(owner, owner_part['standard_input_authoring_ops'])
    source_body = {'records': owner['base_fixture']['sources'][1]['decoded_records']}
    b = enc(source_body)
    sha = hashlib.sha256(b).hexdigest()
    assert sha == owner_part['raw_owner_source_UTF8_SHA256'] and len(b) == owner_part['raw_owner_source_UTF8_bytes']
    owner['source_body'] = source_body
    owner['prepared'] = {'source_json_utf8': b.decode(), 'source_sha256': sha}
    ops(owner, owner_part['standard_completion_ops'])
    r = copy.deepcopy(part['workspace_seed'])
    r['publication_source'] = publication_stage['publication']['expected']
    for k in ('base_fixture', 'authored_base_records', 'authored_kernel_expected'):
        r[k] = owner[k]
    ops(r, part['input_standard_ops'])
    r['parsed_publication'] = publication_stage['parsed']
    ops(r, part['standard_completion_ops'])
    ops(r, part['two_source_variant_standard_ops'])
    values = {'receiver_input': r['input'], 'receiving_expected': r['expected'], 'kernel_input': r['kernel_input'], 'kernel_expected': r['kernel_expected']}
    observed = {}
    for k, v in values.items():
        observed[k] = wit(v)
        expected = d['cases'][1]['whole_witnesses']['connection'][k]
        assert observed[k] == expected, {'stage': k, 'observed': observed[k], 'expected': expected}
    workspaces = {'empty_caller': native_stage['caller'], 'empty_native': native_stage['native'], 'empty_comparisons': ctx['comparison_workspace'], 'empty_private_export': private_stage, 'empty_general': general_stage, 'F02-empty-publication': publication_stage['publication'], 'empty_receiver': r}
    full_binding_checks = []
    for binding in d['cases'][1]['whole_output_bindings']:
        selected = get(workspaces[binding['workspace']], binding['materialized_pointer'])
        expected = get(d, binding['witness_artifact_pointer'])
        assert wit(selected) == expected
        full_binding_checks.append({'witness': binding['witness_artifact_pointer'], 'workspace': binding['workspace'], 'pointer': binding['materialized_pointer'], 'matched': True})
    result = {'base': ctx['metadata']['base'], 'scope': 'one-case published static input-to-kernel JSON recipe reconstruction; all semantic tags remain pre-authored conditional fixture expectations', 'fixed_receiver_source_pins_checked': len(part['fixed_sources']), 'owner_source_sha256': sha, 'owner_source_bytes': len(b), 'counts': {'owner_authoring': len(owner_part['standard_input_authoring_ops']), 'owner_completion': len(owner_part['standard_completion_ops']), 'receiver_input': len(part['input_standard_ops']), 'receiver_completion': len(part['standard_completion_ops']), 'two_source_variant': len(part['two_source_variant_standard_ops'])}, 'receiver_witnesses': observed, 'whole_output_bindings': full_binding_checks, 'all_declared_output_bindings_matched': True, 'not_proved': ['product/domain/legacy-runtime execution', 'independent derivation of every seeded semantic state', 'live ownership/authority/qualification/trust', 'actual CONNECT delivery or OS storage', 'all case families/full limited basic/detail closure']}
    return result
if __name__ == '__main__':
    context = check_comparisons()
    native = check_native(context)
    detail = check_private(context, native)
    general = check_general(context, native, detail)
    publication = check_publication(context, general)
    result = check_receiver(context, native, detail, general, publication)
    print(json.dumps(result, ensure_ascii=False, indent=2))
