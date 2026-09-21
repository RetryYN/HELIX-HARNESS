#!/usr/bin/env python3
"""Meaningful negative cases for the PHCAP-08/09 static premise validator."""
from __future__ import annotations
import copy
import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("validator", HERE / "validate.py")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
base = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
binding_base = json.loads((HERE.parents[0] / "bindings/SCF-B-0041.json").read_text(encoding="utf-8"))


def must_fail(label, mutate, expected_code=None):
    candidate = copy.deepcopy(base)
    mutate(candidate)
    errors = validator.validate(candidate, check_binding=False)
    if errors and (expected_code is None or expected_code in errors):
        print("PASS", label)
        return
    raise SystemExit("FAIL selfcheck: " + label)


def must_fail_binding(label, mutate):
    candidate = copy.deepcopy(binding_base)
    mutate(candidate)
    if validator.validate_binding(candidate):
        print("PASS", label)
        return
    raise SystemExit("FAIL selfcheck: " + label)


must_fail("authority promotion", lambda x: x.update(authority_effect="adopted"))
must_fail("meaning change promotion", lambda x: x.update(meaning_change_applied=True))
must_fail("successor generation", lambda x: x.update(successor_requirement_ids=["REQ-NEW"]))
must_fail("equivalence claim invention", lambda x: x.update(equivalence_claim="equivalent"))
must_fail("unknown root key", lambda x: x.update(unexpected_key=True))
must_fail("unknown nested key", lambda x: x["base"].update(unexpected_key=True))
must_fail("unknown array item key", lambda x: x["product_units"][0].update(unexpected_key=True))
must_fail("unresolved text deletion", lambda x: x["unresolved"].pop())
must_fail("unresolved text rewrite", lambda x: x["unresolved"].__setitem__(0, "changed"))
must_fail("unresolved text expansion", lambda x: x["unresolved"].append("extra"))
must_fail("WBS same-name promotion", lambda x: x["wbs_name_audit"].update(same_name_asset_ids=["LEGACY-ASSET-B1B5271C3933B1F0F345"], same_name_asset_count=1))
must_fail("WBS filename count tamper", lambda x: x["wbs_name_audit"].update(archive_filename_match_count=1))
must_fail("WBS text count tamper", lambda x: x["wbs_name_audit"].update(archive_content_term_match_count=43))
must_fail("WBS near-equivalent identity promotion", lambda x: x["wbs_name_audit"]["near_equivalent_candidates"][0].update(same_name_identity=True))
must_fail("WBS interpretation rewrite [E_WBS_INTERPRETATION]", lambda x: x["wbs_name_audit"].update(interpretation="同名WBS assetは0。archive本文44ファイルの語彙ヒット。"), "E_WBS_INTERPRETATION")
must_fail("WBS interpretation digest tamper [E_WBS_INTERPRETATION_DIGEST]", lambda x: x["wbs_name_audit"].update(interpretation_sha256="0" * 64), "E_WBS_INTERPRETATION_DIGEST")
must_fail("ticket path omission", lambda x: x["ticket_path_audit"].update(path_match_count=8))
must_fail("ticket catalog omission", lambda x: x["ticket_path_audit"]["asset_catalog"].pop())
must_fail("ticket interpretation rewrite [E_TICKET_INTERPRETATION]", lambda x: x["ticket_path_audit"].update(interpretation="ticket path 9件は正式issuer。"), "E_TICKET_INTERPRETATION")
must_fail("ticket interpretation digest tamper [E_TICKET_INTERPRETATION_DIGEST]", lambda x: x["ticket_path_audit"].update(interpretation_sha256="0" * 64), "E_TICKET_INTERPRETATION_DIGEST")
for join_index, phase_id in enumerate(("PHCAP-08", "PHCAP-09")):
    must_fail(
        f"{phase_id} interpretation rewrite",
        lambda x, i=join_index: x["candidate_phase_joins"][i].update(interpretation="candidate interpretation tampered"),
        "E_PHASE_JOIN_INTERPRETATION:" + phase_id,
    )
    must_fail(
        f"{phase_id} interpretation digest tamper",
        lambda x, i=join_index: x["candidate_phase_joins"][i].update(interpretation_sha256="0" * 64),
        "E_PHASE_JOIN_INTERPRETATION_DIGEST:" + phase_id,
    )
for asset_index, asset in enumerate(base["legacy_assets"]):
    asset_id = asset["asset_id"]
    must_fail(
        f"{asset_id} decision interpretation rewrite",
        lambda x, i=asset_index: x["legacy_assets"][i]["decision_history"].update(interpretation="decision interpretation tampered"),
        "E_DECISION_HISTORY_INTERPRETATION:" + asset_id,
    )
    must_fail(
        f"{asset_id} decision interpretation digest tamper",
        lambda x, i=asset_index: x["legacy_assets"][i]["decision_history"].update(interpretation_sha256="0" * 64),
        "E_DECISION_HISTORY_INTERPRETATION_DIGEST:" + asset_id,
    )
must_fail(
    "failure/consumer interpretation rewrite",
    lambda x: x["failure_consumer_boundary"].update(interpretation="failure interpretation tampered"),
    "E_FAILURE_CONSUMER_INTERPRETATION",
)
must_fail(
    "failure/consumer interpretation digest tamper",
    lambda x: x["failure_consumer_boundary"].update(interpretation_sha256="0" * 64),
    "E_FAILURE_CONSUMER_INTERPRETATION_DIGEST",
)
must_fail("source bytes tamper", lambda x: x["legacy_assets"][0].update(source_sha256="0" * 64))
must_fail("source span tamper", lambda x: x["legacy_assets"][0]["source_spans"][0].update(exact_text="tampered\n"))
must_fail("source span meaning tamper", lambda x: x["legacy_assets"][0]["source_spans"][0].update(role="meaning changed"))
must_fail("source span deletion", lambda x: x["legacy_assets"][0]["source_spans"].pop())
must_fail("failure meaning tamper", lambda x: x["legacy_assets"][0]["failure_evidence"][0].update(finding="overstated"))
must_fail("phase join tamper", lambda x: x["candidate_phase_joins"][0]["selected_asset_ids"].pop())
must_fail("legacy implementation promotion", lambda x: x["legacy_assets"][0]["ledger_record"].update(implementation_status="implemented"))
must_fail("legacy consumer closure promotion", lambda x: x["legacy_assets"][0]["ledger_record"].update(consumer_refs=["HELIX-OS"]))
must_fail("decision history invention", lambda x: x["legacy_assets"][0]["decision_history"].update(matching_decision_record_count=1))
must_fail("old execution", lambda x: x.update(old_runtime_test_ci_execution=True))
must_fail("Web direct phase evidence invention", lambda x: x["product_units"][2].update(status="direct_current_candidate", phase_evidence=["PHCAP-08"]))
must_fail("Web-OS implementation promotion", lambda x: x["product_units"][3].update(implementation_status="implemented"))
must_fail("connection authority promotion", lambda x: x["candidate_connections"][0].update(status="approved"))
must_fail("current digest tamper", lambda x: x["current_refs"][0].update(sha256="0" * 64))
must_fail("current execution promotion", lambda x: x["current_refs"][0].update(execution_status="pass"))
must_fail("failure receipt invention", lambda x: x["failure_consumer_boundary"].update(failure_receipts_observed=1))
must_fail("consumer closure invention", lambda x: x["failure_consumer_boundary"].update(consumer_closure_observed=1))
must_fail_binding("binding unknown key", lambda x: x.update(unexpected_key=True))
must_fail_binding("negative case deletion", lambda x: x["verification"]["negative_cases"].pop())
must_fail_binding("negative case expansion", lambda x: x["verification"]["negative_cases"].append("extra"))
must_fail_binding("negative case rewrite", lambda x: x["verification"]["negative_cases"].__setitem__(0, "changed"))
print("PASS PHCAP-08/09 selfcheck: 62 negative cases")
