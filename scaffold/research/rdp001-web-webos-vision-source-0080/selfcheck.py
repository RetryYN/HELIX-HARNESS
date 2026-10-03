#!/usr/bin/env python3
"""Fail-close selfcheck for source, relation, unknown, and nested-key boundaries."""
from __future__ import annotations
import copy, importlib.util, json
from pathlib import Path
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('validator',HERE/'validate.py'); v=importlib.util.module_from_spec(spec); spec.loader.exec_module(v)
base=json.loads((HERE/'inventory.json').read_text(encoding='utf-8'))
spans=[json.loads(x) for x in (HERE/'vision-spans.jsonl').read_text(encoding='utf-8').splitlines() if x.strip()]
rels=[json.loads(x) for x in (HERE/'source-relations.jsonl').read_text(encoding='utf-8').splitlines() if x.strip()]
assets=[json.loads(x) for x in (HERE/'legacy-evidence.jsonl').read_text(encoding='utf-8').splitlines() if x.strip()]

def expect(label, mutate, expected):
    inv=copy.deepcopy(base); ss=copy.deepcopy(spans); rr=copy.deepcopy(rels); aa=copy.deepcopy(assets)
    mutate(inv,ss,rr,aa)
    try: v.validate(inv,ss,rr,aa)
    except AssertionError as e:
        got=str(e)
        if not got.startswith(expected): raise AssertionError(f'{label}: expected {expected}, got {got}')
        return
    raise AssertionError(f'{label}: mutation accepted')

v.validate(base,spans,rels,assets)
cases=[
 ('vision_digest',lambda i,s,r,a:i['scope'].__setitem__('vision_source_sha256','0'*64),'E_VISION_SOURCE'),
 ('vision_span_text',lambda i,s,r,a:s[0].__setitem__('exact_source_text','tampered'),'E_SPAN_TEXT'),
 ('vision_span_keyset',lambda i,s,r,a:s[0].__setitem__('unknown','tampered'),'E_SPAN_KEYS'),
 ('current_web_row',lambda i,s,r,a:r[0].__setitem__('current_exact_source_text','tampered'),'E_REL_TEXT'),
 ('relation_status_promotion',lambda i,s,r,a:r[0].__setitem__('relation_status','adopted'),'E_REL_BOUNDARY'),
 ('webos_product_promotion',lambda i,s,r,a:r[9].__setitem__('product','HELIX-OS'),'E_REL_META'),
 ('formal_unit_count',lambda i,s,r,a:i.__setitem__('formal_requirement_unit_count',15),'E_BOUNDARY'),
 ('legacy_source_digest',lambda i,s,r,a:a[0].__setitem__('source_sha256','0'*64),'E_ASSET_SOURCE'),
 ('legacy_catalog_promotion',lambda i,s,r,a:a[0]['catalog_evidence'].__setitem__('legacy_implementation_status','implemented'),'E_CAT_FIELD'),
 ('decision_promotion',lambda i,s,r,a:a[0]['decision_evidence'].__setitem__('status','decided'),'E_DECISION_EVIDENCE'),
 ('failure_promotion',lambda i,s,r,a:a[0]['failure_evidence'].__setitem__('failure_result','closed'),'E_FAILURE_BOUNDARY'),
 ('consumer_promotion',lambda i,s,r,a:a[0]['consumer_evidence'].__setitem__('closure_result','closed'),'E_CONSUMER'),
 ('nested_relation_key',lambda i,s,r,a:r[0].__setitem__('unknown','x'),'E_REL_KEYS'),
 ('product_boundary',lambda i,s,r,a:i['four_products'][0].__setitem__('implementation_status','implemented'),'E_PRODUCT_BOUNDARY'),
 ('residual_promotion',lambda i,s,r,a:i['residuals'].__setitem__('legacy_failure','closed'),'E_RESIDUAL_PROMOTION'),
 ('asset_semantic_link',lambda i,s,r,a:a[0]['semantic_connection'].__setitem__('direct_old_vision_requirement_link','linked'),'E_SEM_BOUNDARY'),
 ('asset_implementation',lambda i,s,r,a:a[0]['implementation_boundary'].__setitem__('current_implementation_status','implemented'),'E_IMPL_BOUNDARY'),
 ('inventory_prohibition_key',lambda i,s,r,a:i['prohibited_inference'][0].__setitem__('extra','x'),'E_INV_RECORD_KEYS'),
]
for case in cases: expect(*case)
print(f'PASS selfcheck: baseline + {len(cases)} negative cases')
