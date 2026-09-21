#!/usr/bin/env python3
"""Meaningful negative checks for the PHCAP-15 static research candidate."""
from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("phcap15_validate", HERE / "validate.py")
validator = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(validator)
base = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))


def expect_failure(label, mutate) -> None:
    candidate = copy.deepcopy(base)
    mutate(candidate)
    if validator.validate(candidate):
        print("PASS", label)
    else:
        raise SystemExit("FAIL selfcheck: " + label)


expect_failure("authority promotion", lambda x: x.update(authority_effect="adopted"))
expect_failure("meaning change promotion", lambda x: x.update(meaning_change_applied=True))
expect_failure("successor invention", lambda x: x.update(successor_requirement_ids=["REQ-NEW"]))
expect_failure("human decision invention", lambda x: x.update(human_decision_ref="DEC-NEW"))
expect_failure("equivalence claim", lambda x: x.update(equivalence_claim="equivalent"))
expect_failure("old execution promotion", lambda x: x.update(old_runtime_test_ci_execution=True))
expect_failure("base origin drift", lambda x: x["base"].update(origin_main_commit="0" * 40))
expect_failure("rebaseline drift", lambda x: x["rebaseline"].update(origin_main_at_final="0" * 40))
expect_failure("phase inventory digest tamper", lambda x: x["task"].update(inventory_sha256="0" * 64))
expect_failure("phase task mutation", lambda x: x["task"].update(phase="implementation"))
expect_failure("asset ledger digest tamper", lambda x: x["ledger_provenance"].update(asset_ledger_sha256="0" * 64))
expect_failure("asset ledger count tamper", lambda x: x["ledger_provenance"].update(asset_ledger_record_count=4021))
expect_failure("product expansion", lambda x: x["scope"].update(product_targets=validator.PRODUCTS + ["WEB"] ))
expect_failure("candidate unit implementation promotion", lambda x: x["scope"]["candidate_units"][0].update(current_implementation_status="implemented"))
expect_failure("candidate edge authority promotion", lambda x: x["scope"]["candidate_edges"][0].update(authority_effect="adopted"))
expect_failure("candidate edge deletion", lambda x: x["scope"]["candidate_edges"].pop())
expect_failure("phase join promotion", lambda x: x["scope"]["candidate_phase_joins"][0].update(status="admitted"))
expect_failure("Web direct evidence invention", lambda x: x["product_boundary_candidates"]["products"][2].update(current_evidence_status="direct_current_ref"))
expect_failure("product owner candidate invention", lambda x: x["product_boundary_candidates"]["products"][0].update(authority_status="owner_assigned"))
expect_failure("current implementation promotion", lambda x: x["current_evidence"].update(implementation_status="implemented"))
expect_failure("current acceptance promotion", lambda x: x["current_evidence"].update(acceptance_status="passed"))
expect_failure("current ref digest tamper", lambda x: x["current_evidence"]["refs"][0].update(sha256="0" * 64))
expect_failure("current ref exact text tamper", lambda x: x["current_evidence"]["refs"][0].update(exact_text="tampered"))
expect_failure("legacy source revision drift", lambda x: x["legacy_phase_assessment"]["assets"][0].update(source_revision="current"))
expect_failure("legacy source digest tamper", lambda x: x["legacy_phase_assessment"]["assets"][0].update(source_sha256="0" * 64))
expect_failure("archive path tamper", lambda x: x["legacy_phase_assessment"]["assets"][0].update(archive_path="archive/other.md"))
expect_failure("source span tamper", lambda x: x["legacy_phase_assessment"]["assets"][0]["source_anchors"][0].update(exact_text="tampered"))
expect_failure("ledger implementation promotion", lambda x: x["legacy_phase_assessment"]["assets"][0]["ledger_snapshot"].update(implementation_status="implemented"))
expect_failure("phase execution promotion", lambda x: x["legacy_phase_assessment"]["assets"][0]["phase_classification_snapshot"].update(legacy_execution_performed=True))
expect_failure("decision history invention", lambda x: x["decisions"].update(matching_append_only_decision_record_count=1))
expect_failure("failure receipt invention", lambda x: x["failure_residual"].update(execution_receipts=1))
expect_failure("consumer closure promotion", lambda x: x["consumer_residual"].update(consumer_closed_assets=1, consumer_closure_status="closed"))
expect_failure("consumer ref injection", lambda x: x["legacy_phase_assessment"]["assets"][0]["consumer_evidence"].update(consumer_refs=["fake"]))
expect_failure("unknown gap deletion", lambda x: x["gaps"].pop())
expect_failure("count tamper", lambda x: x["counts"].update(source_anchors=11))

print("PASS PHCAP-15 selfcheck: 34 negative cases")
