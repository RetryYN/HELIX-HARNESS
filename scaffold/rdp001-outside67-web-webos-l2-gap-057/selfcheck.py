#!/usr/bin/env python3
"""no-op baselineと境界改変のfail-close selfcheck。"""
from __future__ import annotations
import copy, hashlib, importlib.util, json, sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('validator',HERE/'validate.py'); v=importlib.util.module_from_spec(spec); spec.loader.exec_module(v)
base=json.loads((HERE/'inventory.json').read_text(encoding='utf-8'))
base_atoms=[json.loads(x) for x in (HERE/'semantic-atoms.jsonl').read_text(encoding='utf-8').splitlines() if x.strip()]
base_diffs=json.loads((HERE/'source-diffs.json').read_text(encoding='utf-8'))

def expect(label, mutate, expected):
    inv=copy.deepcopy(base); atoms=copy.deepcopy(base_atoms); diffs=copy.deepcopy(base_diffs); mutate(inv,atoms,diffs)
    try: v.validate(inv,atoms,diffs)
    except AssertionError as e:
        got=str(e)
        if not got.startswith(expected): raise AssertionError(f'{label}: expected {expected}, got {got}')
        return
    raise AssertionError(f'{label}: mutation accepted')

v.validate(base,base_atoms,base_diffs)
cases=[
 ('denominator',lambda i,a,d:i['scope'].__setitem__('holding_path_revision_pair_denominator',68),'E_DENOMINATOR'),
 ('holding_digest',lambda i,a,d:i['scope'].__setitem__('holding_sha256','0'*64),'E_LEDGER_DIGEST'),
 ('base_drift',lambda i,a,d:i['scope'].__setitem__('base_origin_main','0'*40),'E_BASE_DRIFT'),
 ('rebaseline_record',lambda i,a,d:i['scope'].__setitem__('base_rebaseline_count',1),'E_REBASELINE_RECORD'),
 ('selected_doc',lambda i,a,d:i['documents'][0].__setitem__('source_item_id','OUTSIDE67-PATH-010'),'E_SELECTED_DOCS'),
 ('snapshot_or_revision_digest',lambda i,a,d:i['documents'][0]['pre_isolation'].__setitem__('sha256','0'*64),'E_REVISION'),
 ('span_text',lambda i,a,d:a[0]['revision_pair']['pre_isolation'].__setitem__('exact_source_text','tampered'),'E_SPAN_TEXT'),
 ('atom_product',lambda i,a,d:a[13].__setitem__('candidate_product','HELIX-HARNESS'),'E_SEMANTIC_PRODUCT'),
 ('atom_successor',lambda i,a,d:a[13].__setitem__('successor_requirement_ids',['REQ-1']),'E_ATOM_PROMOTION'),
 ('diff_text',lambda i,a,d:d['OUTSIDE67-PATH-011'].__setitem__('unified_diff',['tampered']),'E_DIFF_TEXT'),
 ('authority',lambda i,a,d:i.__setitem__('authority_effect','adopted'),'E_AUTHORITY_BOUNDARY'),
 ('old_execution',lambda i,a,d:i.__setitem__('old_runtime_test_ci_execution',True),'E_AUTHORITY_BOUNDARY'),
 ('unit_phase',lambda i,a,d:i['product_units'][0].__setitem__('phase_status','classified'),'E_UNIT_UNKNOWN'),
 ('connection_decision',lambda i,a,d:i['connections'][0].__setitem__('decision_status','closed'),'E_CONNECTION_BOUNDARY'),
 ('connection_edge_duplicate',lambda i,a,d:i['connections'][1].__setitem__('connection_id',i['connections'][0]['connection_id']),'E_CONNECTION_EDGE'),
 ('old_current_status',lambda i,a,d:i['product_units'][0].__setitem__('legacy_implementation_status','implemented'),'E_UNIT_OLD_CURRENT'),
 ('residual_promotion',lambda i,a,d:i['residuals'].__setitem__('failure','closed'),'E_RESIDUAL_BOUNDARY'),
 ('fragment_anchor',lambda i,a,d:a[5]['source_fragment'].__setitem__('text','tampered'),'E_FRAGMENT_TEXT'),
 ('atomized_count_promotion',lambda i,a,d:i['semantic_atoms'].__setitem__('atomized_complete_count',110),'E_ATOMIZATION_COUNT'),
 ('successor',lambda i,a,d:i['product_units'][0].__setitem__('successor_requirement_ids',['REQ-1']),'E_UNIT_BOUNDARY'),
 ('generated_condition',lambda i,a,d:next(x for x in a if x['atom_id'].endswith('011-ATOM-007-S03')).__setitem__('semantic_condition','互換性未確認を対応済み表示しない'),'E_SOURCE_FIELD_INFERENCE'),
 ('generated_guard',lambda i,a,d:next(x for x in a if x['atom_id'].endswith('011-ATOM-007-S03')).__setitem__('negative_or_guard','互換性未確認を対応済み表示しない'),'E_SOURCE_FIELD_INFERENCE'),
 ('source_support_tamper',lambda i,a,d:next(x for x in a if x['atom_id'].endswith('011-ATOM-007-S03'))['source_support']['guard'].__setitem__('text','互換性未確認を対応済み表示しない'),'E_SOURCE_SUPPORT'),
 ('unsupported_guard_classification',lambda i,a,d:(next(x for x in a if x['atom_id'].endswith('011-ATOM-007-S03'))['source_support']['guard'].update(status='exact',text='互換性')),'E_SOURCE_SUPPORT'),
 ('inference_partition',lambda i,a,d:next(x for x in a if x['atom_id'].endswith('011-ATOM-007-S03')).__setitem__('candidate_inference',[]),'E_INFERENCE_PARTITION'),
 ('composite_promotion',lambda i,a,d:a[0].__setitem__('normalized_statement_status','candidate_inference'),'E_INFERENCE_PARTITION'),
 ('inherited_predicate_text',lambda i,a,d:next(x for x in a if x['atom_id'].endswith('011-ATOM-007-S03'))['inherited_predicate'].__setitem__('text','改変された述語'),'E_INHERITED_PREDICATE'),
 ('inherited_predicate_position',lambda i,a,d:next(x for x in a if x['atom_id'].endswith('011-ATOM-007-S03'))['inherited_predicate']['source_span']['pre_isolation'].__setitem__('character_start',0),'E_INHERITED_PREDICATE'),
 ('inherited_support_link',lambda i,a,d:next(x for x in a if x['atom_id'].endswith('011-ATOM-007-S03'))['source_support']['action'].__setitem__('predicate_text','改変された述語'),'E_SOURCE_SUPPORT'),
 ('inherited_action_promotion',lambda i,a,d:next(x for x in a if x['atom_id'].endswith('011-ATOM-007-S03')).__setitem__('semantic_action','互換性未確認を対応済み表示しない'),'E_SOURCE_FIELD_INFERENCE'),
 ('generated_guard_candidate',lambda i,a,d:next(x for x in a if x['atom_id'].endswith('011-ATOM-007-S03'))['candidate_inference'].append({'field':'negative_or_guard','value':'互換性未確認を対応済み表示しない','reason':'tampered'}),'E_GUARD_INFERENCE'),
]
for c in cases: expect(*c)
print(f'PASS outside67 Web/Web-OS L2 gap selfcheck: baseline + {len(cases)} negative cases')
