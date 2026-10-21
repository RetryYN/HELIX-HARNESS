#!/usr/bin/env python3
"""既存HARNESS001 F02返却式の8固定例だけを計算する監査source。製品runnerではない。"""
import argparse
import copy
import hashlib
import json
from pathlib import Path

PATHS = {
    'L4': 'docs/helix-harness/L4-basic-design/v12-layer-contract.json',
    'L9': 'docs/helix-harness/L9-integration-verification/v12-layer-contract.json',
    'L5': 'docs/helix-harness/L5-detail-design/v12-layer-contract.json',
    'L8': 'docs/helix-harness/L8-unit-verification/v12-layer-contract.json',
}
PINS = {
    'L4': ('/contracts/1', '657c784df904f2e3f5f1ffa0f45d38c6912cb29cb71a3b0cd0db285e0f1e1ebb'),
    'L9': ('/cases/1', '77c7fd9f9ddbd2613c3b5d50df35058fb13c3315e7a0017b8076027cc0f19a6a'),
    'L5': ('/f02_return_construction/expression_language', 'bc3091d5b6af4165ada5c0db9cfa2787e2b01b05e6550e84fc5e748790b16387'),
    'L8': ('/f02_constructor_oracles/cases', '2b141d448f2e3a91bb9f591dc2a8d7c5e63ff517a2d2978f525c399924eb6984'),
}
CASE_IDS = (
    'RET-TARGETS-NOT-SUPPLIED', 'RET-TARGETS-EXPLICIT-UNKNOWN',
    'RET-TWO-LOGICAL-CONTRACT-TARGETS', 'RET-ONE-TARGET-UNKNOWN',
    'RET-OTHER-SUBJECT-TARGET', 'RET-ONE-TARGET-MISSING',
    'RET-L2-SUBJECT-MISSING', 'RET-CLOSED-INPUT-EXTRA',
)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True,
                      separators=(',', ':'), allow_nan=False)


def digest(value):
    return hashlib.sha256(canonical(value).encode('utf-8')).hexdigest()


def require(condition, message):
    if not condition:
        raise ValueError(message)


def pointer(value, path):
    require(path == '' or path.startswith('/'), 'invalid pointer')
    for token in path.split('/')[1:]:
        require(all(i + 1 < len(token) and token[i + 1] in '01'
                    for i, char in enumerate(token) if char == '~'), 'invalid pointer escape')
        token = token.replace('~1', '/').replace('~0', '~')
        if isinstance(value, list):
            require(token.isascii() and (token == '0' or token.isdecimal()
                    and not token.startswith('0')), 'invalid index')
            value = value[int(token)]
        else:
            value = value[token]
    return value


def patch(document, operations):
    """既存8例が使うadd/replaceのみ。元sourceを変更しない。"""
    result = copy.deepcopy(document)
    for operation in operations:
        parent, token = operation['path'].rsplit('/', 1)
        holder = pointer(result, parent)
        token = token.replace('~1', '/').replace('~0', '~')
        op = operation['op']
        require(op in ('add', 'replace'), 'unsupported fixture patch')
        value = copy.deepcopy(operation['value'])
        if isinstance(holder, list):
            index = len(holder) if token == '-' else int(token)
            if op == 'replace':
                require(0 <= index < len(holder), 'replace index absent')
                holder[index] = value
            else:
                require(0 <= index <= len(holder), 'add index outside array')
                holder.insert(index, value)
        else:
            require(op != 'replace' or token in holder, 'replace member absent')
            holder[token] = value
    return result


def equal(left, right):
    # 宣言のJSON等値：boolはnumberと別、numberは数値同値。
    numeric = (int, float)
    if type(left) in numeric and type(right) in numeric:
        return left == right
    if type(left) is not type(right):
        return False
    if isinstance(left, dict):
        return left.keys() == right.keys() and all(equal(left[k], right[k]) for k in left)
    if isinstance(left, list):
        return len(left) == len(right) and all(equal(a, b) for a, b in zip(left, right))
    return left == right


class FixedConstructor:
    """既存JSON演算だけを解釈する。case/expected/file/APIを参照できない。"""
    def __init__(self, definitions):
        self.definitions = definitions

    def call(self, name, arguments):
        definition = self.definitions[name]
        require(len(arguments) == len(definition['parameters']), 'call arity mismatch')
        return self.evaluate(definition['body'], dict(zip(definition['parameters'], arguments)))

    def evaluate(self, node, env):
        if 'var' in node:
            return env[node['var']]
        if 'literal' in node:
            return copy.deepcopy(node['literal'])
        if 'call' in node:
            return self.call(node['call'], [self.evaluate(v, env) for v in node['args']])
        op = node['op']
        def ev(value):
            return self.evaluate(value, env)
        def boolean(value):
            result = ev(value)
            require(type(result) is bool, 'condition is not boolean')
            return result
        if op == 'get':
            return pointer(ev(node['value']), node['pointer'])
        if op == 'object':
            return {key: ev(value) for key, value in node['fields'].items()}
        if op == 'array':
            return [ev(value) for value in node['items']]
        if op == 'equal':
            return equal(ev(node['left']), ev(node['right']))
        if op == 'not':
            return not boolean(node['value'])
        if op in ('and', 'or'):
            values = (boolean(value) for value in node['items'])
            return all(values) if op == 'and' else any(values)
        if op == 'if':
            return ev(node['then'] if boolean(node['condition']) else node['else'])
        if op == 'let':
            local = dict(env)
            for binding in node['bindings']:
                local[binding['name']] = self.evaluate(binding['value'], local)
            return self.evaluate(node['body'], local)
        if op in ('map', 'filter', 'flat_map'):
            result = []
            for item in ev(node['items']):
                local = dict(env, **{node['name']: item})
                if op == 'filter':
                    keep = self.evaluate(node['predicate'], local)
                    require(type(keep) is bool, 'filter predicate is not boolean')
                    if keep:
                        result.append(item)
                else:
                    value = self.evaluate(node['expression'], local)
                    if op == 'flat_map':
                        require(isinstance(value, list), 'flat_map result is not array')
                        result.extend(value)
                    else:
                        result.append(value)
            return result
        if op in ('length', 'first', 'unique', 'sort_canonical'):
            value = ev(node['value'])
            require(isinstance(value, list), 'array operator on non-array')
            if op == 'length':
                return len(value)
            if op == 'first':
                require(bool(value), 'first on empty array')
                return value[0]
            if op == 'sort_canonical':
                return sorted(value, key=canonical)
            result = []
            for item in value:
                if not any(equal(item, previous) for previous in result):
                    result.append(item)
            return result
        if op == 'concat':
            arrays = [ev(value) for value in node['items']]
            require(all(isinstance(value, list) for value in arrays), 'concat non-array')
            return [item for value in arrays for item in value]
        if op == 'lookup':
            return ev(node['map'])[ev(node['key'])]
        if op == 'contains':
            return any(equal(item, ev(node['value'])) for item in ev(node['items']))
        if op == 'canonical_text':
            return canonical(ev(node['value']))
        if op == 'sort_by':
            def key(value):
                local = dict(env, **{node['name']: value})
                keys = self.evaluate(node['key'], local)
                require(isinstance(keys, list) and all(type(v) is str for v in keys), 'sort key outside fixed domain')
                return keys, canonical(value)
            return sorted(ev(node['value']), key=key)
        raise ValueError('unsupported expression operator: ' + op)


def check_reader_primitives(reader):
    require(not equal(True, 1) and equal(1, 1.0), 'JSON number equality')
    require(equal({'a': 1, 'b': 2}, {'b': 2, 'a': 1}), 'object order')
    require(not equal([1, 2], [2, 1]), 'array order')
    require(reader.evaluate({'op': 'if', 'condition': {'literal': False},
                             'then': {'var': 'unbound'}, 'else': {'literal': None}}, {}) is None,
            'if must evaluate only selected branch')
    for probe in ({'op': 'not-declared'}, {'op': 'first', 'value': {'literal': []}},
                  {'op': 'get', 'value': {'literal': {}}, 'pointer': '/missing'},
                  {'op': 'get', 'value': {'literal': [0, 1]}, 'pointer': '/١'},
                  {'op': 'get', 'value': {'literal': {'a~2': 1}}, 'pointer': '/a~2'}):
        try:
            reader.evaluate(probe, {})
        except (KeyError, ValueError):
            continue
        raise ValueError('reader accepted invalid primitive')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, required=True)
    args = parser.parse_args()
    root = args.root.resolve()
    require((root / 'AGENTS.md').is_file(), 'repository root required')
    documents = {key: json.loads((root / path).read_bytes()) for key, path in PATHS.items()}
    nodes = {}
    for key, (path, expected_sha) in PINS.items():
        nodes[key] = pointer(documents[key], path)
        require(digest(nodes[key]) == expected_sha, 'selected source changed: ' + key)
    program, cases = nodes['L5'], nodes['L8']
    require(program['entry'] == 'finish(input, context, prior)', 'entry changed')
    require(tuple(case['id'] for case in cases) == CASE_IDS, 'fixed case set changed')
    reader = FixedConstructor(program['definitions'])
    check_reader_primitives(reader)
    results = []
    for case in cases:
        binding = case['argument_binding']
        # Only input/context and supplied prior enter the calculation. Never expected_result.
        arguments = {name: copy.deepcopy(pointer(documents['L8'], binding[name + '_ref'][1:]))
                     for name in ('input', 'context')}
        arguments['context'].update(copy.deepcopy(binding['context_addition']))
        arguments = patch(arguments, binding['patch'])
        require(digest(arguments) == case['arguments_canonical_sha256'], 'argument reconstruction: ' + case['id'])
        expected = case['expected_result']
        require(digest(expected) == case['expected_result_canonical_sha256'], 'frozen expectation hash')
        prior = copy.deepcopy(case['prior_stage'])
        before = canonical([arguments, prior])
        actual = reader.call('finish', [arguments['input'], arguments['context'], prior])
        require(canonical([arguments, prior]) == before, 'input mutation')
        require(equal(actual, expected), 'return mismatch: ' + case['id'])
        results.append({'id': case['id'], 'actual_canonical_sha256': digest(actual),
                        'expected_canonical_sha256': digest(expected)})
        if case['id'] == 'RET-L2-SUBJECT-MISSING':
            # A controlled oracle-strength probe, not a defect in the original design.
            mutant = copy.deepcopy(program['definitions'])
            branch = mutant['finish']['body']['else']['body']['fields']['value']['else']['fields']['agreement_state']['then']
            require(branch == {'literal': 'missing'}, 'sensitivity target changed')
            branch['literal'] = 'current'
            wrong = FixedConstructor(mutant).call('finish',
                    [arguments['input'], arguments['context'], prior])
            require(wrong['outcome'] == expected['outcome'] and not equal(wrong, expected),
                    'full-return comparison must detect agreement-state corruption')
    print(json.dumps({'status': 'PASS_FIXED_CONSTRUCTOR_CALCULATION', 'cases': results,
                      'sensitivity_control': 'same outcome but forged agreement state rejected by full-return comparison; not original design Red',
                      'scope': 'typed Context and supplied internal prior only; not full F02, authority, delivery, product execution, Design RGR, or CI'},
                     ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
