#!/usr/bin/env python3
"""Meaningful negative checks for the PHCAP-04/05 static candidate."""
from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("phcap0405_validate", HERE / "validate.py")
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
expect_failure("task phase record tamper", lambda x: x["tasks"][0]["phase_record_snapshot"].update(new_build_allowed=True))
expect_failure("task status promotion", lambda x: x["tasks"][1].update(current_status="accepted"))
expect_failure("ledger digest tamper", lambda x: x["ledger_provenance"].update(asset_ledger_sha256="0" * 64))
expect_failure("ledger count tamper", lambda x: x["ledger_provenance"].update(decision_ledger_record_count=59))
expect_failure("product expansion", lambda x: x["scope"].update(product_targets=validator.PRODUCTS + ["WEB"] ))
expect_failure("unit implementation promotion", lambda x: x["scope"]["candidate_units"][0].update(implementation_status="implemented"))
expect_failure("unit acceptance promotion", lambda x: x["scope"]["candidate_units"][1].update(acceptance_status="passed"))
expect_failure("edge authority promotion", lambda x: x["scope"]["candidate_edges"][0].update(authority_effect="adopted"))
expect_failure("edge deletion", lambda x: x["scope"]["candidate_edges"].pop())
expect_failure("phase join admission", lambda x: x["scope"]["candidate_phase_joins"][0].update(status="admitted"))
expect_failure("current L2 promotion", lambda x: x["current_evidence"].update(l2_status="accepted"))
expect_failure("current L11 promotion", lambda x: x["current_evidence"].update(l11_status="passed"))
expect_failure("current implementation promotion", lambda x: x["current_evidence"].update(implementation_status="implemented"))
expect_failure("current acceptance promotion", lambda x: x["current_evidence"].update(acceptance_status="passed"))
expect_failure("current ref digest tamper", lambda x: x["current_evidence"]["refs"][0].update(sha256="0" * 64))
expect_failure("current ref span tamper", lambda x: x["current_evidence"]["refs"][0].update(exact_text="tampered"))
expect_failure("legacy source revision drift", lambda x: x["legacy_assessment"]["assets"][0].update(source_revision="current"))
expect_failure("legacy archive path tamper", lambda x: x["legacy_assessment"]["assets"][0].update(archive_path="archive/other.md"))
expect_failure("legacy source digest tamper", lambda x: x["legacy_assessment"]["assets"][0].update(source_sha256="0" * 64))
expect_failure("source anchor tamper", lambda x: x["legacy_assessment"]["assets"][0]["source_anchors"][0].update(exact_text="tampered"))
expect_failure("ledger implementation promotion", lambda x: x["legacy_assessment"]["assets"][1]["ledger_snapshot"].update(implementation_status="implemented"))
expect_failure("phase execution promotion", lambda x: x["legacy_assessment"]["assets"][5]["phase_classification_snapshot"].update(legacy_execution_performed=True))
expect_failure("decision record removal", lambda x: x["legacy_assessment"]["assets"][0]["decision_evidence"]["matching_records"].pop())
expect_failure("decision adoption invention", lambda x: x["decisions"].update(decision_effect="requirement_adopted"))
expect_failure("failure receipt invention", lambda x: x["failure_residual"].update(execution_receipts=1))
expect_failure("consumer runtime injection", lambda x: x["consumer_residual"]["runtime_consumer_refs_by_asset"].__setitem__(validator.ASSET_IDS[0], ["runtime"]))
expect_failure("consumer closure promotion", lambda x: x["consumer_residual"].update(consumer_closed_assets=1))
expect_failure("unknown gap deletion", lambda x: x["gaps"].pop())
expect_failure("count tamper", lambda x: x["counts"].update(source_anchors=22))

print("PASS PHCAP-04/05 selfcheck: 36 negative cases")
