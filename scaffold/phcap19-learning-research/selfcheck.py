#!/usr/bin/env python3
"""Meaningful negative checks for PHCAP-19 candidate."""
import copy,importlib.util,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('v',HERE/'validate.py'); v=importlib.util.module_from_spec(spec); spec.loader.exec_module(v)
base=json.loads((HERE/'inventory.json').read_text(encoding='utf-8'))
def fail(label,fn):
 x=copy.deepcopy(base); fn(x)
 errors=v.validate(x)
 if errors: print('PASS',label)
 else: raise SystemExit('FAIL selfcheck: '+label)
fail('authority promotion',lambda x:x.update(authority_effect='adopted'))
fail('missing product becomes implemented',lambda x:x['gap_interpretation'].update(missing_status='implemented'))
fail('direct current ref invention',lambda x:x['gap_interpretation'].update(direct_current_evidence_products=['HELIX-OS','HELIX-Web']))
fail('source text tamper',lambda x:x['legacy_assets'][0]['source_spans'][0].update(exact_text='tampered\n'))
fail('source digest tamper',lambda x:x['legacy_assets'][0].update(source_sha256='0'*64))
fail('legacy implementation promotion',lambda x:x['legacy_assets'][0]['ledger_record'].update(implementation_status='implemented'))
fail('consumer closure promotion',lambda x:x['legacy_assets'][0]['ledger_record'].update(consumer_refs=['HELIX-OS']))
fail('decision history invention',lambda x:x['legacy_assets'][0]['decision_history'].update(matching_decision_record_count=1))
fail('base revision metadata tamper',lambda x:x['base'].update(commit='not-a-revision'))
fail('old execution',lambda x:x.update(old_runtime_test_ci_execution=True))
fail('atom loss',lambda x:x['atoms'].pop())
fail('contradiction meaning promotion',lambda x:x['contradictions_preserved'][0].update(resolution='current authority granted'))
fail('contradiction disguised promotion',lambda x:x['contradictions_preserved'][0].update(resolution='preserved but current authority granted'))
fail('contradiction empty object',lambda x:x['contradictions_preserved'].__setitem__(0,{}))
fail('unresolved item empty',lambda x:x['unresolved'].__setitem__(0,''))
fail('contradiction deletion',lambda x:x['contradictions_preserved'].pop())
print('PASS PHCAP-19 selfcheck: 16 negative cases')
