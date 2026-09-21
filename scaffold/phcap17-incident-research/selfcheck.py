#!/usr/bin/env python3
"""Meaningful negative checks for PHCAP-17 research candidate."""
import copy, importlib.util, json
from pathlib import Path
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("validator", HERE/"validate.py")
mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
base=json.loads((HERE/"inventory.json").read_text(encoding="utf-8"))
def must_fail(label, mutate):
    candidate=copy.deepcopy(base); mutate(candidate)
    if not mod.validate(candidate): raise SystemExit("FAIL selfcheck: "+label)
    print("PASS",label)
must_fail("authority promotion", lambda x:x.update(authority_effect="adopted"))
must_fail("HARNESS direct evidence invention", lambda x:x["gap_interpretation"].update(harness_direct_current_evidence=["docs/helix-harness/L2-requirements/product-requirements.md"]))
must_fail("source line tamper", lambda x:x["legacy_assets"][0]["source_spans"][0].update(exact_text="tampered\n"))
must_fail("source digest tamper", lambda x:x["legacy_assets"][0].update(source_sha256="0"*64))
must_fail("legacy implementation promotion", lambda x:x["legacy_assets"][0]["ledger_record"].update(implementation_status="implemented"))
must_fail("consumer closure promotion", lambda x:x["legacy_assets"][0]["ledger_record"].update(consumer_refs=["HELIX-OS"]))
must_fail("decision history invention", lambda x:x["legacy_assets"][0]["decision_history"].update(matching_decision_record_count=1))
must_fail("old execution", lambda x:x.update(old_runtime_test_ci_execution=True))
must_fail("remove contradiction", lambda x:x["contradictions_preserved"].pop())
must_fail("current ref digest tamper", lambda x:x["current_refs"][0].update(sha256="0"*64))
must_fail("asset failure evidence loss", lambda x:x["legacy_assets"][0].update(failure_evidence=[]))
must_fail("asset consumer evidence loss", lambda x:x["legacy_assets"][0].update(consumer_evidence=[]))
print("PASS PHCAP-17 selfcheck: 12 negative cases")
