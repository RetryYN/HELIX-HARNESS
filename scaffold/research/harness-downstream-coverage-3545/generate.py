#!/usr/bin/env python3
"""#3545 A: 固定revisionのHARNESS設計を読む監査補助。書込・凍結判定をしない。"""
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
    assert set(result) == set(wanted), ('Pointerの位置が解決できない', set(wanted) - result.keys())
    return result


class Source:
    def __init__(self, path):
        self.path = path
        self.text = git('show', BASE + ':' + path).decode()
        self.data = json.loads(self.text)
        self.wanted = set()
        self.lines = None
        self.refs = {}
        for container in CONTAINERS & self.data.keys():
            for pointer, node in walk(self.data[container], '/' + container):
                if not isinstance(node, dict):
                    continue
                for key in REF_KEYS & node.keys():
                    if isinstance(node[key], str):
                        self.refs.setdefault(node[key], []).append(pointer + '/' + key)
        for paths in self.refs.values():
            paths.sort(key=lambda p: (p.count('/'), tuple((0, int(s)) if s.isdecimal()
                                                        else (1, s) for s in p.split('/')), p))

    def reference(self, identity):
        paths = self.refs.get(identity, [])
        return paths[0] if paths else None

    def request(self, pointer):
        pointer_value(self.data, pointer)  # 不在をline 1や別nodeへ補完しない。
        self.wanted.add(pointer)
        return (self, pointer)


def inventory():
    paths = git('ls-tree', '-r', '--name-only', BASE, 'docs/helix-harness').decode().splitlines()
    result = {layer: {} for layer in LAYERS}
    for path in paths:
        match = re.search(r'/L([4589])-[^/]+/[^/]+\.json$', path)
        if not match:
            continue
        layer, source = int(match[1]), Source(path)
        parent = source.data.get('parent')
        identity = re.match(r'HARNESS-L' + str(layer) + r'-(\d{3})(?:-|$)', source.data.get('document_id', ''))
        by_id = 'HARNESS-L2-' + identity[1] if identity else None
        assert not parent or not by_id or parent == by_id, ('parent不一致', path)
        parent = parent or by_id
        assert parent and parent not in result[layer], ('親不明/重複', path)
        result[layer][parent] = source
    return result


def entry_identity(source, pointer):
    # actual container entryのIDだけを辿る。L3/L10承認snapshotのIDで代替しない。
    entry = '/'.join(pointer.split('/')[:3])
    value = pointer_value(source.data, entry)
    return entry + '/id' if isinstance(value, dict) and isinstance(value.get('id'), str) else None


def oracle_link(source, pointer, oracle):
    entry = '/'.join(pointer.split('/')[:3])
    value = pointer_value(source.data, entry)
    for key in ('system_oracle_ref', 'l10_ref', 'oracle_ref'):
        if key in value:
            return key + ':' + ('一致' if value[key] == oracle else '不一致'), source.request(entry + '/' + key)
    return 'L10直接参照未記載', None


def main():
    audit_text = git('show', BASE + ':' + AUDIT).decode()
    audit = json.loads(audit_text)
    pairs = [(i, pair) for i, pair in enumerate(audit['pairs'])
             if pair['requirement']['owner'] == 'HELIX-HARNESS']
    parents = {pair['requirement']['parent'] for _, pair in pairs}
    assert len(pairs) == 126 and len(parents) == 18
    audit_lines = positions(audit_text, {f'/pairs/{i}/{side}/entry/id'
                                        for i, _ in pairs for side in ('requirement', 'oracle')})
    docs, rows = inventory(), []
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
                linked = target.reference(identity) if identity else None
                if linked:
                    refs[3] = [target.request(linked), source.request(identity_pointer)]
                    break
        oracle_status = 'L9子対応未確認'
        if refs[1]:
            oracle_status, link = oracle_link(*refs[1][0], oracle)
            if link:
                refs[1].append(link)
        rows.append((index, parent, req, oracle, refs, oracle_status))
    sources = [docs[layer][p] for p in sorted(parents) for layer in LAYERS if p in docs[layer]]
    assert len(sources) == 72
    for source in sources:
        source.request('/status')
        for field in ('pair', 'paired_document'):
            if field in source.data:
                source.request('/' + field)
        source.lines = positions(source.text, source.wanted)
    print('# HARNESS下流設計の参照抽出（#3545 A、分類前の監査素材）\n')
    print(f'source revision: `{BASE}`。18親126組。全405組の完了、意味適合、凍結成立を生成しない。\n')
    print(f'input: `{AUDIT}`。末列は `/pairs/{{index}}/requirement/entry/id` と `/oracle/entry/id` の行番号。')
    print('sourceは固定revisionの全HARNESS L4/L9/L5/L8 JSON。approved snapshotだけの一致はchild対応に使わない。')
    print('抽出は9 container内の指定keyの文字列値のみ。container外・配列値・id自体・subdir JSONは探索外。代表の(+N)は同IDの追加候補数。')
    print('L8の間接参照はL9 root／L5 functionの実IDへの参照と、そのID出典を併記する。契約適合や全edgeの証明ではない。')
    print('未確認はartifact不存在ではない。これは参照抽出であり、5分類と凍結根拠はA2で個別照合する。\n')
    aliases = {id(s): f'S{i + 1}' for i, s in enumerate(sources)}
    print('| source | path | status位置 | document pair |\n|---|---|---|---|')
    for source in sources:
        pair = ', '.join(f'{k}={source.data[k]} @ {source.lines["/" + k]}'
                         for k in ('pair', 'paired_document') if k in source.data)
        print(f'| {aliases[id(source)]} | `{source.path}` | /status:{source.lines["/status"]} | {pair or "記録未確認"} |')
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
                    hits = source.refs.get(value, [])
                    count = f'(+{len(hits) - 1})' if pointer in hits and len(hits) > 1 else ''
                    citations.append(f'{aliases[id(source)]}:{source.lines[pointer]} `{pointer}`{count}')
                evidence.append(' ← '.join(citations))
        evidence[1] += f' [{oracle_status}]'
        audit_ref = '/'.join(str(audit_lines[f'/pairs/{index}/{side}/entry/id'])
                             for side in ('requirement', 'oracle'))
        print('| ' + ' | '.join([str(index), parent, req, oracle, *evidence, audit_ref]) + ' |')


if __name__ == '__main__':
    main()
