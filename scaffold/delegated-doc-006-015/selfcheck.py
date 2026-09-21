#!/usr/bin/env python3
"""DELEGATED-DOC-006/015候補の固定条件を改変し、validatorのfail-closeを確認する。"""
from __future__ import annotations
import copy, json, subprocess, sys, tempfile
from pathlib import Path

HERE=Path(__file__).resolve().parent
VALIDATOR=HERE/'validate.py'
CANDIDATE=HERE/'inventory.json'

def run_case(label, mutate, expected):
    doc=json.loads(CANDIDATE.read_text(encoding='utf-8'))
    mutate(doc)
    with tempfile.TemporaryDirectory(prefix='scf006-selfcheck-') as td:
        p=Path(td)/'inventory.json'; p.write_text(json.dumps(doc,ensure_ascii=False),encoding='utf-8')
        result=subprocess.run([sys.executable,str(VALIDATOR),'--candidate',str(p)],capture_output=True,text=True)
    output=result.stdout+result.stderr
    if result.returncode==0 or expected not in output:
        print(f'FAIL: {label}: expected={expected!r}\n{output}')
        return False
    print(f'PASS: {label}')
    return True

def main():
    cases=[
      ('source blob digest drift',lambda d:d['source_documents'][0].update({'source_blob_sha256':'sha256:'+'0'*64}),'DELEGATED-DOC-006 source blob SHA不一致'),
      ('reference target drift',lambda d:d['reference_edges'][0].update({'target_sha256':'0'*64}),'DELEGATED-REF-0308 candidate/ledger不一致'),
      ('coverage span omission',lambda d:d['coverage_spans'].pop(),'coverage span件数8不一致'),
      ('original semantic ID drift',lambda d:d['atoms'][1].update({'original_id':'GH-FR-999'}),'source/original ID不一致'),
      ('product boundary source omission',lambda d:d['product_boundary']['sources'].pop(),'product boundary source集合不一致'),
      ('negative ID forgery',lambda d:d['negative_conditions'][-1].update({'negative_id':'SCF006-NEG-099'}),'negative ID集合が不一致'),
      ('actor authority deletion',lambda d:d['atoms'][1].update({'actors':[]}),'actor/authority条件欠落'),
      ('phase confirmation forgery',lambda d:d['atoms'][1]['legacy_state'].update({'legacy_implementation_status':'implemented'}),'phase/implementation/consumer未確認欄がない'),
      ('reference linkage mutation',lambda d:d['reference_edge_linkage']['DELEGATED-REF-0308'].pop(),'reference edge linkageが双方向固定集合と不一致'),
      ('pair acceptance audit mutation',lambda d:d['pair_acceptance_reference_audit'].update({'missing_from_pair':['GH-AC-999']}),'pair_acceptance_reference_auditが固定blob再計算結果と不一致'),
    ]
    return 0 if all(run_case(*c) for c in cases) else 1
if __name__=='__main__': raise SystemExit(main())
