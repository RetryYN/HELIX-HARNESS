#!/usr/bin/env python3
"""Meaningful negative checks for PHCAP-20 candidate."""
import copy,importlib.util,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('v',HERE/'validate.py'); v=importlib.util.module_from_spec(spec); spec.loader.exec_module(v)
base=json.loads((HERE/'inventory.json').read_text(encoding='utf-8'))
def fail(label,fn):
 x=copy.deepcopy(base); fn(x); errors=v.validate(x)
 if errors: print('PASS',label)
 else: raise SystemExit('FAIL selfcheck: '+label)
fail('authority promotion',lambda x:x.update(authority_effect='adopted'))
fail('current implementation promotion',lambda x:x['gap_interpretation'].update(current_implementation_status='implemented'))
fail('current operation promotion',lambda x:x['gap_interpretation'].update(current_operations_status='operating'))
fail('direct non-target evidence invention',lambda x:x['gap_interpretation'].update(direct_current_evidence_products=['HELIX-OS','HELIX-Web']))
fail('product target expansion',lambda x:x['scope'].update(product_targets=['HELIX-OS','HELIX-Web']))
fail('source text tamper',lambda x:x['legacy_assets'][0]['source_spans'][0].update(exact_text='tampered\n'))
fail('legacy implementation promotion',lambda x:x['legacy_assets'][0]['ledger_record'].update(implementation_status='implemented'))
fail('consumer closure promotion',lambda x:x['legacy_assets'][0]['ledger_record'].update(consumer_refs=['HELIX-OS']))
fail('decision history invention',lambda x:x['legacy_assets'][0]['decision_history'].update(matching_decision_record_count=1))
fail('current direct ref invention',lambda x:x['current_refs'][7].update(classification='direct_current_ref'))
fail('atom loss',lambda x:x['atoms'].pop())
fail('unresolved item empty',lambda x:x['unresolved'].__setitem__(0,''))
fail('disguised contradiction authority promotion',lambda x:x['contradictions_preserved'][0].update(resolution='historical record is preserved; current authority is granted by owner approval'))
fail('contradiction empty object',lambda x:x['contradictions_preserved'].__setitem__(0,{}))
fail('contradiction non-dict',lambda x:x['contradictions_preserved'].__setitem__(0,'not-an-object'))
fail('contradiction deletion',lambda x:x['contradictions_preserved'].pop())
fail('contradiction duplicate id',lambda x:x['contradictions_preserved'][1].update(id=x['contradictions_preserved'][0]['id']))
fail('contradiction status promotion',lambda x:x['contradictions_preserved'][0].update(status='resolved'))
fail('contradictions malformed container',lambda x:x.update(contradictions_preserved=None))
fail('contradiction malformed id',lambda x:x['contradictions_preserved'][0].update(id=[]))
print('PASS PHCAP-20 selfcheck: 20 negative cases')
