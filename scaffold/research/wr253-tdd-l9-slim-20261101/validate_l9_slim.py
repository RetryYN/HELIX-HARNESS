#!/usr/bin/env python3
"""Static comparison of compact L9 against the fixed pre-removal revision."""
import copy
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
PATH = 'docs/helix-harness/L9-integration-verification/tdd-development-flow.json'
BASE = '6c1ceb0172c0dcb95b843739bee2c15905dd735f'


def main():
    raw = subprocess.check_output(['git', 'show', f'{BASE}:{PATH}'], cwd=ROOT)
    old = json.loads(raw)
    current = json.loads((ROOT / PATH).read_text(encoding='utf-8'))
    expected = copy.deepcopy(old)
    checked = []

    def strip(node, pointer=''):
        if isinstance(node, dict):
            for key in list(node):
                child = f'{pointer}/{key}'
                if key == 'byte_sha256' and pointer.endswith('/source_packet'):
                    assert isinstance(node.get('original_bytes_utf8'), str), child
                    assert hashlib.sha256(node['original_bytes_utf8'].encode('utf-8')).hexdigest() == node[key], child
                    checked.append(child)
                    del node[key]
                else:
                    strip(node[key], child)
        elif isinstance(node, list):
            for index, value in enumerate(node):
                strip(value, f'{pointer}/{index}')

    strip(expected)
    record = current.pop('removed_materials')
    assert record['git_commit'] == BASE and record['path'] == PATH
    assert all(record.get(key) for key in ('decision_ref', 'meaning', 'removed_key_rule', 'use_boundary'))
    assert len(checked) == 35 and len(set(checked)) == 35
    assert current == expected, 'Unexpected L9 change beyond the 35 removed hashes'
    print('PASS: 35 historical source hashes verified; only those fields removed; all remaining L9 JSON unchanged')


if __name__ == '__main__':
    main()
