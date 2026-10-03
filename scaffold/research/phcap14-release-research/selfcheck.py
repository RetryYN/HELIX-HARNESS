#!/usr/bin/env python3
"""Meaningful negative checks for PHCAP-14 release research premise."""
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
    if not validator.validate(candidate):
        raise SystemExit("FAIL selfcheck: " + label)
    print("PASS", label)


must_fail("authority promotion", lambda x: x.update(authority_effect="adopted"))
must_fail("Web direct evidence invention", lambda x: x["gap_interpretation"].update(direct_current_evidence_products=["HELIX-HARNESS", "HELIX-OS", "HELIX-Web"]))
must_fail("Web-OS direct evidence invention", lambda x: x["gap_interpretation"].update(missing_direct_current_products=["HELIX-Web"]))
must_fail("source line tamper", lambda x: x["legacy_assets"][0]["source_spans"][0].update(exact_text="tampered\n"))
must_fail("source digest tamper", lambda x: x["legacy_assets"][0].update(source_sha256="0" * 64))
must_fail("asset implementation promotion", lambda x: x["legacy_assets"][0]["ledger_record"].update(implementation_status="implemented"))
must_fail("asset consumer closure promotion", lambda x: x["legacy_assets"][0]["ledger_record"].update(consumer_refs=["HELIX-Web-OS"]))
must_fail("decision history invention", lambda x: x["legacy_assets"][0]["decision_history"].update(matching_decision_record_count=1))
must_fail("old execution", lambda x: x.update(old_runtime_test_ci_execution=True))
must_fail("remove contradiction", lambda x: x["contradictions_preserved"].pop())
must_fail("contradiction resolution authority promotion", lambda x: x["contradictions_preserved"][0].update(resolution="resolved: current authority granted"))
must_fail("contradiction status promotion", lambda x: x["contradictions_preserved"][0].update(status="resolved"))
must_fail("unresolved deletion", lambda x: x["unresolved"].pop())
must_fail("current ref digest tamper", lambda x: x["current_refs"][0].update(sha256="0" * 64))
must_fail("current direct classification invention", lambda x: x["current_refs"][5].update(classification="direct_current_ref"))
must_fail("related asset implementation promotion", lambda x: x["related_reference_assets"][0]["ledger_state"].update(implementation_status="implemented"))
must_fail("source span count promotion", lambda x: x["counts"].update(source_spans=14))
must_fail("selected asset removal", lambda x: x["scope"]["bounded_asset_ids"].pop())
print("PASS PHCAP-14 selfcheck: 18 negative cases")
