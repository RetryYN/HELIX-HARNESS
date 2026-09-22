#!/usr/bin/env python3
"""Fail-close selfcheck for bounded semantic atoms and preserved unknowns."""
from __future__ import annotations
import copy, importlib.util, json
from pathlib import Path
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('validator',HERE/'validate.py');v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
base=json.loads((HERE/'inventory.json').read_text(encoding='utf-8'))
atoms=[json.loads(x) for x in (HERE/'semantic-atoms.jsonl').read_text(encoding='utf-8').splitlines() if x.strip()]
legacy=[json.loads(x) for x in (HERE/'legacy-links.jsonl').read_text(encoding='utf-8').splitlines() if x.strip()]
def expect(label,mutate,expected):
    i=copy.deepcopy(base);a=copy.deepcopy(atoms);l=copy.deepcopy(legacy);mutate(i,a,l)
    try:v.validate(i,a,l)
    except AssertionError as e:
        if not str(e).startswith(expected):raise AssertionError(f'{label}: expected {expected}, got {e}')
        return
    raise AssertionError(f'{label}: mutation accepted')
v.validate(base,atoms,legacy)
cases=[
 ('base_digest',lambda i,a,l:i['scope'].__setitem__('parent_span_file_sha256','0'*64),'E_PARENT_DIGEST'),
 ('parent_denominator',lambda i,a,l:i['scope'].__setitem__('unprocessed_parent_span_count',18),'E_PARENT_COUNTS'),
 ('source_text',lambda i,a,l:a[0].__setitem__('exact_source_text','tampered'),'E_ATOM_TEXT'),
 ('connectives',lambda i,a,l:a[0].__setitem__('connective_tokens',['and']),'E_ATOM_META'),
 ('role_swap',lambda i,a,l:a[0].__setitem__('candidate_product','HELIX-Web-OS'),'E_ATOM_META'),
 ('atom_promotion',lambda i,a,l:a[0].__setitem__('atomization_status','composite_unresolved'),'E_ATOM_META'),
 ('composite_reason',lambda i,a,l:a[9].__setitem__('composite_reason',None),'E_COMPOSITE_REASON'),
 ('formal_count',lambda i,a,l:i.__setitem__('formal_requirement_unit_count',15),'E_BOUNDARY'),
 ('legacy_source',lambda i,a,l:l[0].__setitem__('source_sha256','0'*64),'E_LEGACY_SOURCE'),
 ('legacy_decision',lambda i,a,l:l[0]['decision_evidence'].__setitem__('status','decided'),'E_LEGACY_EVIDENCE'),
 ('legacy_current_impl',lambda i,a,l:l[0].__setitem__('current_implementation_status','implemented'),'E_LEGACY_BOUNDARY'),
 ('nested_atom_key',lambda i,a,l:a[0].__setitem__('unknown','x'),'E_ATOM_KEYS'),
 ('nested_legacy_key',lambda i,a,l:l[0].__setitem__('unknown','x'),'E_LEGACY_KEYS'),
 ('product_authority',lambda i,a,l:i['candidate_products'][0].__setitem__('authority_status','approved'),'E_PRODUCT_BOUNDARY'),
 ('residual',lambda i,a,l:i['residuals'].__setitem__('semantic_equivalence','closed'),'E_RESIDUAL_PROMOTION'),
 ('inference_record',lambda i,a,l:i['prohibited_inference'][0].__setitem__('extra','x'),'E_INV_RECORD_KEYS'),
]
for c in cases:expect(*c)
print(f'PASS selfcheck: baseline + {len(cases)} negative cases')
