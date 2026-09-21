#!/usr/bin/env python3
"""Meaningful in-memory negative checks for the RDP-001 scaffold."""
import copy
import importlib.util
import os

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


must_fail("top-level authority promotion", lambda x: x.update(authority_effect="adopted"))
must_fail("closure authority field", lambda x: x["closure_guard"].update(authority_effect="adopted"))
must_fail("closure meaning field", lambda x: x["closure_guard"].update(meaning_change_applied=True))
must_fail("closure successor field", lambda x: x["closure_guard"].update(successor_requirement_ids=["REQ-1"]))
must_fail("closure human decision field", lambda x: x["closure_guard"].update(human_decision_ref="DEC-1"))
must_fail("closure source carry field", lambda x: x["closure_guard"].update(source_carry_status="adopted"))
must_fail("closure reference carry field", lambda x: x["closure_guard"].update(reference_carry_status="closed"))
must_fail("closure adoption field", lambda x: x["closure_guard"].update(adoption_state="adopted"))
must_fail("closure holding field", lambda x: x["closure_guard"].update(holding_closure="closed"))
must_fail("closure prohibited inference", lambda x: x["closure_guard"]["prohibited_inference"].pop())
must_fail("equivalence claim", lambda x: x.update(equivalence_claim="equivalent"))
must_fail("source revision drift", lambda x: x["comparison"].update(fixed_source_revision="0" * 40))
must_fail("source digest drift", lambda x: x["source_documents"][0].update(sha256="0" * 64))
must_fail("reference target drift", lambda x: x["reference_edges"][0].update(target_sha256="0" * 64))
must_fail("full blob coverage gap", lambda x: x["source_documents"][0]["coverage_spans"][0].update(start_line=2))
must_fail("atom exact text drift", lambda x: x["atoms"][0]["source_span"].update(exact_source_text="changed\n"))
must_fail("owner adoption", lambda x: x["atoms"][0].update(candidate_target="HELIX-HARNESS"))
must_fail("legacy implementation promotion", lambda x: x["atoms"][0]["legacy_state"].update(legacy_implementation_status="implemented"))
must_fail("consumer closure", lambda x: x["atoms"][0]["legacy_state"].update(consumer_status="closed"))
must_fail("phase authority", lambda x: x["atoms"][0]["legacy_state"].update(phase_authority_status="confirmed"))
must_fail("delete GOP-AC-04a unresolved record", lambda x: x["comparison"]["pair_groups"][0]["unresolved_crossdoc_references"].pop())
must_fail("delete GOP-AC-04a from difference", lambda x: x["comparison"]["pair_groups"][0].update(unresolved_acceptance_difference_ids=[]))
must_fail("delete explicit L10 AC ref", lambda x: x["comparison"]["pair_groups"][0].update(l10_test_acceptance_refs=[]))
must_fail("uncovered line denominator", lambda x: x["source_documents"][0]["atom_coverage"].update(uncovered_line_count=0))
must_fail("atom covered denominator", lambda x: x["atom_denominator"].update(atom_covered_lines=0))
must_fail("holding remaining denominator", lambda x: x["comparison"]["holding_denominator"].update(remaining_reference_edges_after_prior_and_selected=766))
must_fail("delete missing crossdoc record", lambda x: x.update(unresolved_crossdoc_references=[]))
print("PASS RDP-001 selfcheck: 27 negative cases")
