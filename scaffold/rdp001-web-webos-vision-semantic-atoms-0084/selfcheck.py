#!/usr/bin/env python3
"""Fail-close selfcheck for the next bounded semantic atom subset."""
from __future__ import annotations
import copy, importlib.util, json
from pathlib import Path
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('validator',HERE/'validate.py'); v=importlib.util.module_from_spec(spec); spec.loader.exec_module(v)
base=json.loads((HERE/'inventory.json').read_text(encoding='utf-8'))
atoms=[json.loads(x) for x in (HERE/'semantic-atoms.jsonl').read_text(encoding='utf-8').splitlines() if x.strip()]
legacy=[]
def expect(label,mutate,expected):
    i=copy.deepcopy(base); a=copy.deepcopy(atoms); l=copy.deepcopy(legacy); mutate(i,a,l)
    try: v.validate(i,a,l)
    except AssertionError as e:
        if not str(e).startswith(expected): raise AssertionError(f'{label}: expected {expected}, got {e}')
        return
    raise AssertionError(f'{label}: mutation accepted')
def swap_composite_reasons(i,a,l):
    left=a[0]['composite_reason']; a[0]['composite_reason']=a[1]['composite_reason']; a[1]['composite_reason']=left
v.validate(base,atoms,legacy)
cases=[
 ('parent_digest',lambda i,a,l:i['scope'].__setitem__('parent_inventory_sha256','0'*64),'E_PARENT_DIGEST'),
 ('parent_denominator',lambda i,a,l:i['scope'].__setitem__('unprocessed_parent_span_count',8),'E_PARENT_DENOM'),
 ('source_text',lambda i,a,l:a[0].__setitem__('exact_source_text','tampered'),'E_ATOM_TEXT'),
 ('wrong_parent',lambda i,a,l:a[0].__setitem__('parent_span_id','VISION-SEC-6.1'),'E_PARENT_CONTAINMENT'),
 ('prior_span_list',lambda i,a,l:i['scope']['selected_parent_span_ids'].__setitem__(0,'VISION-SEC-6.1'),'E_PARENT_COUNTS'),
 ('role_swap',lambda i,a,l:a[0].__setitem__('candidate_product','HELIX-Web-OS'),'E_ATOM_META'),
 ('composite_reason_replacement',lambda i,a,l:a[0].__setitem__('composite_reason','ZZZ'),'E_COMPOSITE_REASON'),
 ('composite_reason_swap',swap_composite_reasons,'E_COMPOSITE_REASON'),
 ('formal_count',lambda i,a,l:i.__setitem__('formal_requirement_unit_count',10),'E_BOUNDARY'),
 ('nested_atom_key',lambda i,a,l:a[0].__setitem__('unknown','x'),'E_ATOM_KEYS'),
]
for case in cases: expect(*case)
print(f'PASS selfcheck: baseline + {len(cases)} negative cases')
