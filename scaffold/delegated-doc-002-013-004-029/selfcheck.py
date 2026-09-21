#!/usr/bin/env python3
"""In-memory negative checks for RDP-001 delegated pair candidate."""
import copy, importlib.util, os
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("rdp_validator", os.path.join(HERE, "validate.py"))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
base = mod.load_inventory()
def must_fail(label, mutate):
    candidate = copy.deepcopy(base)
    mutate(candidate)
    if not mod.validate_inventory(candidate):
        raise SystemExit("FAIL selfcheck: " + label)
    print("PASS", label)
must_fail("authority promotion", lambda x: x.update(authority_effect="adopted"))
must_fail("source digest drift", lambda x: x["source_documents"][0].update(sha256="0" * 64))
must_fail("reference target drift", lambda x: x["reference_edges"][0].update(target_sha256="0" * 64))
must_fail("coverage gap", lambda x: x["source_documents"][0]["coverage_spans"][0].update(start_line=2))
must_fail("atom exact text drift", lambda x: x["atoms"][0]["source_span"].update(exact_source_text="changed\n"))
must_fail("owner adoption", lambda x: x["atoms"][0].update(candidate_target="HELIX-HARNESS"))
must_fail("legacy implementation promotion", lambda x: x["atoms"][0]["legacy_state"].update(legacy_implementation_status="implemented"))
must_fail("consumer closure", lambda x: x["atoms"][0]["legacy_state"].update(consumer_status="closed"))
must_fail("phase authority", lambda x: x["atoms"][0]["legacy_state"].update(phase_authority_status="confirmed"))
must_fail("holding closure", lambda x: x["closure_guard"].update(holding_closure="closed"))
print("PASS RDP-001 selfcheck: 10 negative cases")
