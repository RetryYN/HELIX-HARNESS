#!/usr/bin/env python3
"""#3545: 固定revisionのHARNESS/OS/BRAINを読む監査補助。書込・凍結判定なし。"""
import argparse
import bisect
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = 'ba4ac1cdd76fdd0d907e684c035b059e8029b9da'
AUDIT = 'docs/governance/audits/prerequisite-l3-l10-definition-audit-2026-10-12.json'
LAYERS = (4, 9, 5, 8)
CONTAINERS = {'contracts', 'functions', 'cases', 'unit_oracles',
              'verification_obligations', 'function_oracles', 'vectors',
              'normal_function_oracles', 'additional_unit_cases'}
REF_KEYS = {'requirement_ref', 'l3_ref', 'system_oracle_ref', 'l10_ref',
            'oracle_ref', 'function_ref', 'detail_ref', 'root_id', 'l4_ref', 'l9_ref'}

# 子参照の抽出範囲。OS L9 primary_traceだけ明示nested例外を保つ。
# 範囲外の文字列出現は別内訳で示し、子対応へ自動昇格しない。
PROFILES = {
    'HELIX-HARNESS': {
        'root': 'docs/helix-harness', 'parent_prefix': 'HARNESS',
        'document_prefixes': ('HARNESS',),
        'recursive': {'containers': CONTAINERS, 'ref_keys': REF_KEYS},
        'fields': {}, 'nested_fields': {}, 'bridge': {},
        'oracle_keys': ('system_oracle_ref', 'l10_ref', 'oracle_ref'),
        'oracle_mode': 'first_present',
        'bridge_lookup': False,
        'occurrence_breakdown': False, 'report_mode': 'harness',
        'counts': (126, 18, 72),
    },
    'HELIX-OS': {
        'root': 'docs/helix-os', 'parent_prefix': 'HELIXOS',
        'document_prefixes': ('HELIXOS', 'OS'),
        'recursive': None, 'occurrence_breakdown': True, 'report_mode': 'scoped',
        'counts': (79, 12, 48), 'oracle_mode': 'allowed_keys',
        'bridge_lookup': True,
        'fields': {
            4: {'contracts': {'requirement_ref'}},
            9: {'cases': {'requirement_ref'}},
            5: {'contracts': {'requirement_ref', 'requirement_id'},
                'contract_trace': {'requirement_ref'}, 'l4_contracts': {'requirement_ref'}},
            8: {'cases': {'requirement_ref'},
                'contracts': {'requirement_ref', 'requirement_id', 'l3_requirement_ref'},
                'case_bindings': {'requirement_ref'}},
        },
        'nested_fields': {9: {'cases': {'primary_trace': {'requirement_ref'}}}},
        'bridge': {},  # 固定79組でfallback bridgeの採用行はない。
        'oracle_keys': ('system_oracle_ref', 'oracle_ref'),
    },
    'HELIX-BRAIN': {
        'root': 'docs/helix-brain', 'parent_prefix': 'HELIXBRAIN',
        'document_prefixes': ('HELIXBRAIN',),
        'recursive': None, 'occurrence_breakdown': True, 'report_mode': 'scoped',
        'counts': (70, 16, 64), 'oracle_mode': 'allowed_keys',
        'bridge_lookup': True,
        'fields': {
            4: {'contracts': {'requirement_ref'}},
            9: {'verification_obligations': {'requirement_ref'}, 'cases': {'requirement_ref'}},
            5: {'functions': {'requirement_ref'}, 'function_contracts': {'l3_ref'},
                'contracts': {'requirement_ref'}, 'l4_contracts': {'requirement_ref'},
                'l4_contract_bindings': {'l3', 'requirement_id', 'requirement_ref'}},
            8: {'cases': {'requirement_ref', 'l3_ref'}, 'typed_cases': {'requirement_ref'},
                'contracts': {'requirement_ref', 'l3_ref'}},
        },
        'bridge': {'cases': {'function_ref', 'formal_function_ref', 'l9_ref'},
                   'contracts': {'l9_ref'}},
        'oracle_keys': ('system_oracle_ref',),
    },
}

TOKEN = re.compile(r'"(?:\\.|[^"\\])*"|[{}\[\]:,]|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null')


def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args])


def escape(key):
    return str(key).replace('~', '~0').replace('/', '~1')


def walk(value, pointer=''):
    yield pointer, value
    if isinstance(value, (dict, list)):
        children = value.items() if isinstance(value, dict) else enumerate(value)
        for key, child in children:
            yield from walk(child, pointer + '/' + escape(key))


def pointer_value(value, pointer):
    for part in pointer.split('/')[1:]:
        key = part.replace('~1', '/').replace('~0', '~')
        value = value[int(key)] if isinstance(value, list) else value[key]
    return value


def positions(text, wanted):
    """JSON tokenを一度だけ走査し、要求したPointerのvalue開始行を返す。fallbackなし。"""
    json.loads(text)  # token scannerをJSONの妥当性判定には用いない。
    tokens = iter(TOKEN.finditer(text))
    newlines = [m.start() for m in re.finditer('\n', text)]
    result = {}

    def consume(pointer, first=None):
        token = first if first is not None else next(tokens)
        if pointer in wanted:
            result[pointer] = bisect.bisect_left(newlines, token.start()) + 1
        opening = token.group()
        if opening not in ('{', '['):
            return
        delimiter = next(tokens)
        if delimiter.group() == ('}' if opening == '{' else ']'):
            return
        index = 0
        while True:
            if opening == '{':
                key = json.loads(delimiter.group())
                assert next(tokens).group() == ':'
                consume(pointer + '/' + escape(key))
            else:
                consume(pointer + '/' + str(index), delimiter)
                index += 1
            delimiter = next(tokens)
            if delimiter.group() != ',':
                assert delimiter.group() == ('}' if opening == '{' else ']')
                break
            delimiter = next(tokens)

    consume('')
    assert set(result) == set(wanted), ('Pointer unresolved', set(wanted) - result.keys())
    return result


class Source:
    def __init__(self, path, layer=None, profile=PROFILES['HELIX-HARNESS']):
        self.path = path
        self.text = git('show', BASE + ':' + path).decode()
        self.data = json.loads(self.text)
        self.wanted = set()
        self.lines = None
        self.refs, self.bridge_refs = {}, {}
        recursive = profile['recursive']
        if recursive:
            for container in recursive['containers'] & self.data.keys():
                for pointer, node in walk(self.data[container], '/' + container):
                    if not isinstance(node, dict):
                        continue
                    for key in recursive['ref_keys'] & node.keys():
                        if isinstance(node[key], str):
                            self.refs.setdefault(node[key], []).append(pointer + '/' + key)
        else:
            for container, keys in profile['fields'][layer].items():
                self._index_direct_entries(container, keys, self.refs)
            for container, paths in profile.get('nested_fields', {}).get(layer, {}).items():
                for index, entry in enumerate(self.data.get(container, [])):
                    if not isinstance(entry, dict):
                        continue
                    for nested, keys in paths.items():
                        node = entry.get(nested)
                        if not isinstance(node, dict):
                            continue
                        for key in keys & node.keys():
                            value = node[key]
                            if isinstance(value, str):
                                pointer = f'/{container}/{index}/{escape(nested)}/{escape(key)}'
                                self.refs.setdefault(value, []).append(pointer)
            if layer == 8:
                for container, keys in profile['bridge'].items():
                    self._index_direct_entries(container, keys, self.bridge_refs)
        for mapping in (self.refs, self.bridge_refs):
            for paths in mapping.values():
                paths.sort(key=lambda p: (p.count('/'), tuple((0, int(s)) if s.isdecimal()
                                                             else (1, s) for s in p.split('/')), p))

    def _index_direct_entries(self, container, keys, target):
        entries = self.data.get(container)
        if not isinstance(entries, list):
            return
        for index, entry in enumerate(entries):
            if not isinstance(entry, dict):
                continue
            for key in keys & entry.keys():
                value = entry[key]
                if isinstance(value, str):
                    target.setdefault(value, []).append(f'/{container}/{index}/{escape(key)}')

    def reference(self, identity, bridge=False):
        paths = (self.bridge_refs if bridge else self.refs).get(identity, [])
        return paths[0] if paths else None

    def request(self, pointer):
        pointer_value(self.data, pointer)
        self.wanted.add(pointer)
        return (self, pointer)


def inventory(owner='HELIX-HARNESS'):
    profile = PROFILES[owner]
    paths = git('ls-tree', '-r', '--name-only', BASE, profile['root']).decode().splitlines()
    result = {layer: {} for layer in LAYERS}
    for path in paths:
        match = re.search(r'/L([4589])-[^/]+/[^/]+\.json$', path)
        if not match:
            continue
        layer = int(match[1])
        source = Source(path, layer, profile)
        parent = source.data.get('parent')
        pattern = r'^(?:' + '|'.join(profile['document_prefixes']) + r')-L' + str(layer) + r'-(\d{3})(?:-|$)'
        identity = re.match(pattern, source.data.get('document_id') or '')
        by_id = profile['parent_prefix'] + '-L2-' + identity[1] if identity else None
        assert not parent or not by_id or parent == by_id, ('parent/document-ID mismatch', path)
        parent = parent or by_id
        assert parent and parent not in result[layer], ('parent missing/duplicate', path)
        result[layer][parent] = source
    return result


def entry_identity(source, pointer):
    entry = '/'.join(pointer.split('/')[:3])
    value = pointer_value(source.data, entry)
    return entry + '/id' if isinstance(value, dict) and isinstance(value.get('id'), str) else None


def occurrence_breakdown(data, identities):
    """文字列値の出現所在だけを集約。ref/fixture/snapshotの意味は判定しない。"""
    hits = {identity: {} for identity in identities}
    for pointer, value in walk(data):
        if not isinstance(value, str) or value not in hits:
            continue
        container = pointer.split('/')[1] if pointer else '(root)'
        hits[value].setdefault(container, []).append(pointer)
    result = {}
    for identity, containers in hits.items():
        result[identity] = {}
        for container, pointers in sorted(containers.items()):
            pointers.sort(key=lambda p: tuple((0, int(x)) if x.isdecimal() else (1, x)
                                               for x in p.split('/')))
            result[identity][container] = (len(pointers), pointers[0])
    return result


def oracle_link(source, pointer, oracle, profile=PROFILES['HELIX-HARNESS']):
    entry = '/'.join(pointer.split('/')[:3])
    value = pointer_value(source.data, entry)
    keys = profile['oracle_keys']
    if profile['oracle_mode'] == 'first_present':
        for key in keys:
            if key in value:
                return key + ':' + ('一致' if value[key] == oracle else '不一致'), source.request(entry + '/' + key)
        return 'L10直接参照未記載', None
    if pointer.startswith(entry + '/primary_trace/'):
        entry += '/primary_trace'  # 選択した実traceと同じobjectに限定する。
    locations = [(key, entry + '/' + escape(key)) for key in keys]
    for key, ref in locations:
        try:
            linked_value = pointer_value(source.data, ref)
        except (KeyError, IndexError, ValueError):
            continue
        if isinstance(linked_value, str):
            return key + ':' + ('一致' if linked_value == oracle else '不一致'), source.request(ref)
        return key + ':指定key値は文字列でなく未確認', source.request(ref)
    return '指定keyでL10参照未確認', None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--owner', choices=tuple(PROFILES), default='HELIX-HARNESS')
    owner = parser.parse_args().owner
    profile = PROFILES[owner]
    label = owner.removeprefix('HELIX-')
    audit_text = git('show', BASE + ':' + AUDIT).decode()
    audit = json.loads(audit_text)
    pairs = [(i, pair) for i, pair in enumerate(audit['pairs'])
             if pair['requirement']['owner'] == owner]
    parents = {pair['requirement']['parent'] for _, pair in pairs}
    assert (len(pairs), len(parents)) == profile['counts'][:2]
    audit_lines = positions(audit_text, {f'/pairs/{i}/{side}/entry/id'
                                        for i, _ in pairs for side in ('requirement', 'oracle')})
    docs, rows = inventory(owner), []
    for index, pair in pairs:
        parent = pair['requirement']['parent']
        req, oracle = pair['requirement']['entry']['id'], pair['oracle']['entry']['id']
        refs = []
        for layer in LAYERS:
            source = docs[layer].get(parent)
            pointer = source.reference(req) if source else None
            refs.append([source.request(pointer)] if pointer else [])
        if not refs[3] and parent in docs[8]:
            target = docs[8][parent]
            for previous in (1, 2):  # L9 root_id、またはL5 function_refへの実参照。
                if not refs[previous]:
                    continue
                source, pointer = refs[previous][0]
                identity_pointer = entry_identity(source, pointer)
                identity = pointer_value(source.data, identity_pointer) if identity_pointer else None
                linked = target.reference(identity, bridge=profile['bridge_lookup']) if identity else None
                if linked:
                    refs[3] = [target.request(linked), source.request(identity_pointer)]
                    break
        oracle_status = 'L9子対応未確認'
        if refs[1]:
            oracle_status, link = oracle_link(*refs[1][0], oracle, profile)
            if link:
                refs[1].append(link)
        rows.append((index, parent, req, oracle, refs, oracle_status))
    occurrences = {}
    if profile['occurrence_breakdown']:
        unresolved = {}
        for _, parent, req, _, refs, _ in rows:
            for offset, layer in enumerate(LAYERS):
                if not refs[offset]:
                    source = docs[layer][parent]
                    unresolved.setdefault(source, set()).add(req)
        for source, identities in unresolved.items():
            occurrences[source] = occurrence_breakdown(source.data, identities)
            for containers in occurrences[source].values():
                for _, pointer in containers.values():
                    source.request(pointer)
    sources = [docs[layer][p] for p in sorted(parents) for layer in LAYERS if p in docs[layer]]
    assert len(sources) == profile['counts'][2]
    for source in sources:
        if 'status' in source.data:
            source.request('/status')
        for field in ('pair', 'paired_document'):
            if field in source.data:
                source.request('/' + field)
        source.lines = positions(source.text, source.wanted)
    if profile['report_mode'] == 'harness':
        print('# HARNESS下流設計の参照抽出（#3545 A、分類前の監査素材）\n')
        print(f'source revision: `{BASE}`。18親126組。全405組の完了、意味適合、凍結成立を生成しない。\n')
        print(f'input: `{AUDIT}`。末列は `/pairs/{{index}}/requirement/entry/id` と `/oracle/entry/id` の行番号。')
        print('sourceは固定revisionの全HARNESS L4/L9/L5/L8 JSON。approved snapshotだけの一致はchild対応に使わない。')
        print('抽出は9 container内の指定keyの文字列値のみ。container外・配列値・id自体・subdir JSONは探索外。代表の(+N)は同IDの追加候補数。')
        print('L8の間接参照はL9 root／L5 functionの実IDへの参照と、そのID出典を併記する。契約適合や全edgeの証明ではない。')
        print('未確認はartifact不存在ではない。これは参照抽出であり、5分類と凍結根拠はA2で個別照合する。\n')
    else:
        print(f'# {label}下流設計の参照抽出（#3545 B0、分類前の監査素材）\n')
        print(f'source revision: `{BASE}`。{len(parents)}親{len(pairs)}組。凍結・意味適合・全405組完了を生成しない。\n')
        print(f'input: `{AUDIT}`。末列は `/pairs/{{index}}/requirement/entry/id` と `/oracle/entry/id` の行番号。')
        print('owner/層別profileのcontainer直下entryの指定keyだけを抽出。OS L9はcases内primary_traceの明示keyも含む。')
        print('他のnested/approved snapshot/trace root/fixture・negative内/配列値/id自体/subdirectory JSONは探索外。')
        print('代表参照(+N)とL8 bridgeの両側Pointerを示す。未確認はartifact不存在・設計不適合を意味しない。\n')
    aliases = {id(s): f'S{i + 1}' for i, s in enumerate(sources)}
    print('| source | path | status位置 | document pair |\n|---|---|---|---|')
    for source in sources:
        pair = ', '.join(f'{k}={source.data[k]} @ {source.lines["/" + k]}'
                         for k in ('pair', 'paired_document') if k in source.data)
        print(f'| {aliases[id(source)]} | `{source.path}` | /status:{source.lines.get("/status", "未記載")} | {pair or "記録未確認"} |')
    print('\n| audit /pairs index | parent | L3 | L10 | L4 | L9 | L5 | L8 | audit L3/L10行 |\n|---|---|---|---|---|---|---|---|---|')
    for index, parent, req, oracle, refs, oracle_status in rows:
        evidence = []
        for links in refs:
            if not links:
                evidence.append('子対応未確認')
            else:
                citations = []
                for source, pointer in links:
                    value = pointer_value(source.data, pointer)
                    hits = (source.refs.get(value) or source.bridge_refs.get(value, []))
                    count = f'(+{len(hits) - 1})' if pointer in hits and len(hits) > 1 else ''
                    citations.append(f'{aliases[id(source)]}:{source.lines[pointer]} `{pointer}`{count}')
                evidence.append(' ← '.join(citations))
        evidence[1] += f' [{oracle_status}]'
        audit_ref = '/'.join(str(audit_lines[f'/pairs/{index}/{side}/entry/id'])
                             for side in ('requirement', 'oracle'))
        print('| ' + ' | '.join([str(index), parent, req, oracle, *evidence, audit_ref]) + ' |')

    if profile['occurrence_breakdown']:
        print('\n## 未確認参照の機械的な出現内訳（文字列値の所在。子対応の証拠ではない）')
        print('snapshot/fixture/配列/nestedも含む同一文字列値を数える。意味はB1/B2で照合する。')
        print('OS L8 primary_traceも所在内訳へ含め、機構別allowlistは追加しない。')
        for offset, layer in enumerate(LAYERS):
            misses = [(parent, req) for _, parent, req, _, refs, _ in rows if not refs[offset]]
            present = sum(bool(occurrences[docs[layer][parent]][req]) for parent, req in misses)
            print(f'- L{layer}: 未確認{len(misses)}/{len(pairs)}、allowlist外出現あり{present}、文書内出現なし{len(misses) - present}')
            for parent, req in misses:
                source = docs[layer][parent]
                containers = occurrences[source][req]
                detail = '; '.join(f'{container}: {count}件 {aliases[id(source)]}:{source.lines[pointer]} `{pointer}`'
                                   for container, (count, pointer) in containers.items()) or '文書内出現なし'
                print(f'  - {req}: {detail}')


if __name__ == '__main__':
    main()
