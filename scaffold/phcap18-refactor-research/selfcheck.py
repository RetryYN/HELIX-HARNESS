#!/usr/bin/env python3
"""Meaningful negative checks for the PHCAP-18 research candidate."""
import copy
import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("validator", HERE / "validate.py")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
base = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))

def must_fail(label, mutate):
    candidate = copy.deepcopy(base)
    mutate(candidate)
    if validator.validate(candidate):
        print("PASS", label)
    else:
        raise SystemExit("FAIL selfcheck: " + label)

must_fail("authority promotion", lambda x: x.update(authority_effect="adopted"))
must_fail("Web direct evidence invention", lambda x: x["gap_interpretation"].update(direct_current_evidence_products=["HELIX-HARNESS", "HELIX-OS", "HELIX-Web"]))
must_fail("Web boundary promotion", lambda x: x["product_boundary_candidates"][2].update(status="direct_current_candidate"))
must_fail("source text tamper", lambda x: x["legacy_assets"][0]["source_spans"][0].update(exact_text="tampered\n"))
must_fail("source digest tamper", lambda x: x["legacy_assets"][0].update(source_sha256="0" * 64))
must_fail("legacy implementation promotion", lambda x: x["legacy_assets"][0]["ledger_record"].update(implementation_status="implemented"))
must_fail("consumer closure promotion", lambda x: x["legacy_assets"][0]["ledger_record"].update(consumer_refs=["HELIX-OS"]))
must_fail("decision history invention", lambda x: x["legacy_assets"][0]["decision_history"].update(matching_decision_record_count=1))
must_fail("atom loss", lambda x: x["atoms"].pop())
must_fail("old execution", lambda x: x.update(old_runtime_test_ci_execution=True))
must_fail("degradation promotion", lambda x: x["candidate_transition"].update(degradation="promoted_to_current"))
must_fail("phase capability promotion", lambda x: x["legacy_summary"].update(capability_status="implemented_current"))
must_fail("current ref digest tamper", lambda x: x["current_refs"][0].update(sha256="0" * 64))
must_fail("boundary ref promoted to direct", lambda x: x["current_refs"][1].update(classification="direct_current_ref"))
must_fail("contradiction promotion", lambda x: x["contradictions_preserved"][0].update(resolution="current authority granted"))
must_fail("contradiction deletion", lambda x: x["contradictions_preserved"].pop())
must_fail("unresolved item empty", lambda x: x["unresolved"].__setitem__(0, ""))
print("PASS PHCAP-18 selfcheck: 17 negative cases")
