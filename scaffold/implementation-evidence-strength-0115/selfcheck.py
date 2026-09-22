#!/usr/bin/env python3
"""SCF-B-0115 validatorの意味ある負例と期待error codeを確認する。"""
from __future__ import annotations

import copy
import json
import subprocess
import tempfile
from pathlib import Path


BUNDLE = Path(__file__).resolve().parent
ROOT = BUNDLE.parents[2]
VALIDATE = BUNDLE / "validate.py"


def run_case(name: str, expected_code: str, mutate, mutate_inventory=None) -> None:
    with tempfile.TemporaryDirectory(prefix=f"scf-b-0115-{name}-") as tmp:
        target = Path(tmp)
        inventory = json.loads((BUNDLE / "inventory.json").read_text(encoding="utf-8"))
        if mutate_inventory:
            mutate_inventory(inventory)
        rows = [json.loads(line) for line in (BUNDLE / "evidence.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
        mutate(rows)
        (target / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False) + "\n", encoding="utf-8")
        (target / "evidence.jsonl").write_text(
            "".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in rows),
            encoding="utf-8",
        )
        result = subprocess.run(
            ["python3", str(VALIDATE), "--bundle", str(target), "--repo", str(ROOT)],
            text=True, capture_output=True, check=False,
        )
        output = result.stdout + result.stderr
        if result.returncode == 0 or expected_code not in output:
            raise SystemExit(f"{name}: expected {expected_code}, got rc={result.returncode}\n{output}")
        print(f"PASS {name}: {expected_code}")


def main() -> None:
    def wrong_asset_blob(rows):
        rows[0]["old_asset_evidence"]["assets"][0]["source"]["git_blob_oid_at_base"] = "0" * 40

    def wrong_anchor(rows):
        rows[0]["semantic_review_edges"][0]["anchor_resolution"]["references"][0]["base_excerpt_sha256"] = "sha256:" + "0" * 64

    def missing_edge(rows):
        rows[0]["semantic_review_edges"].pop()

    def duplicated_edge(rows):
        rows[0]["semantic_review_edges"].append(copy.deepcopy(rows[0]["semantic_review_edges"][0]))

    def removed_asset(rows):
        rows[0]["old_asset_evidence"]["assets"].pop()

    def duplicated_asset(rows):
        rows[0]["old_asset_evidence"]["assets"].append(copy.deepcopy(rows[0]["old_asset_evidence"]["assets"][0]))

    def tampered_ledger(rows):
        rows[0]["old_asset_evidence"]["assets"][0]["ledger_record"]["consumer_refs"] = ["FAKE-CONSUMER"]

    def tampered_candidate(rows):
        row = next(row for row in rows if row["source_requirement"]["representative_asset_candidates"])
        row["source_requirement"]["representative_asset_candidates"][0]["confidence"] = "confirmed_implementation_evidence"

    def tampered_implementation(rows):
        row = next(row for row in rows if row["implementation_evidence"]["records"])
        row["implementation_evidence"]["records"][0]["evidence_role"] = "implementation_proof"

    def tampered_degradation(rows):
        row = next(row for row in rows if row["degradation_evidence"]["phase_transition_evidence"])
        row["degradation_evidence"]["phase_transition_evidence"][0]["transition_assessment"] = "unit_degradation_confirmed"

    def tampered_failure(rows):
        rows[0]["failure_evidence"]["records"][0]["coverage_failure"] = "fabricated_failure_receipt"

    def tampered_consumer(rows):
        rows[0]["consumer_evidence"]["records"][0]["consumer_closure_status"] = "closed"

    def tampered_current(rows):
        rows[0]["current_implementation_evidence"]["status"] = "implemented"

    def claimed_unimplemented(rows):
        rows[0]["unimplemented_assessment"]["explicit_non_implementation_claim"] = True

    def tampered_inventory_scope(inventory):
        inventory["scope"]["unique_old_asset_count"] = 99999

    def tampered_partition(inventory):
        inventory["partition_contract"]["failure"] = "failure_receipt"

    def tampered_old_wrapper(rows):
        rows[0]["old_asset_evidence"]["not_implementation_proof"] = False

    def extra_old_wrapper_key(rows):
        rows[0]["old_asset_evidence"]["implementation_proven"] = True

    def tampered_strength_assessment(rows):
        rows[0]["strength_assessment"]["old_implementation"]["unit_status"] = "implemented"

    def tampered_novel_evidence(rows):
        rows[0]["novel_evidence"]["missing_for_unit_level_judgment"] = []

    def tampered_unit_schema(rows):
        rows[0]["schema"] = "implementation-evidence-strength-0115/v1/tampered"

    def tampered_unit_top_level(rows):
        rows[0]["unexpected"] = True

    def tampered_negative_case_codes(inventory):
        inventory["negative_case_codes"] = inventory["negative_case_codes"][:-1]

    def tampered_novel_inventory(inventory):
        inventory["novel_evidence_counts"]["source_test_body_asset_count"] = 999

    def tampered_base_declaration(inventory):
        inventory["base"]["branch"] = "research"

    def wrong_input_digest(inventory):
        inventory["input_snapshot"][0]["sha256"] = "0" * 64

    def wrong_base(inventory):
        inventory["base"]["commit"] = "0" * 40

    def tampered_selection(inventory):
        inventory["selection"]["selected_unit_ids"] = inventory["selection"]["selected_unit_ids"] + ["IRCONN-HIL-BR-09-HARNESS-OS"]

    def tampered_selection_score(inventory):
        inventory["selection"]["selected_metrics"][inventory["selection"]["selected_unit_ids"][0]]["selection_score"] += 1

    run_case("wrong-asset-blob", "E_OLD_ASSET_SOURCE", wrong_asset_blob)
    run_case("wrong-anchor", "E_SOURCE_ANCHOR", wrong_anchor)
    run_case("missing-edge", "E_REVIEW_EDGE_SET", missing_edge)
    run_case("duplicated-edge", "E_REVIEW_EDGE_SET", duplicated_edge)
    run_case("removed-asset", "E_OLD_ASSET_UNIT_SET", removed_asset)
    run_case("duplicated-asset", "E_OLD_ASSET_UNIT_SET", duplicated_asset)
    run_case("tampered-ledger", "E_OLD_LEDGER_RECORD", tampered_ledger)
    run_case("tampered-candidate", "E_REPRESENTATIVE_ASSET", tampered_candidate)
    run_case("tampered-implementation", "E_IMPLEMENTATION_EVIDENCE", tampered_implementation)
    run_case("tampered-degradation", "E_DEGRADATION_EVIDENCE", tampered_degradation)
    run_case("tampered-failure", "E_FAILURE_EVIDENCE", tampered_failure)
    run_case("tampered-consumer", "E_CONSUMER_EVIDENCE", tampered_consumer)
    run_case("tampered-current", "E_CURRENT_STATUS", tampered_current)
    run_case("claimed-unimplemented", "E_UNIMPLEMENTED_CLAIM", claimed_unimplemented)
    run_case("tampered-old-wrapper", "E_OLD_ASSET_EVIDENCE", tampered_old_wrapper)
    run_case("extra-old-wrapper-key", "E_OLD_ASSET_EVIDENCE", extra_old_wrapper_key)
    run_case("tampered-strength-assessment", "E_STRENGTH_ASSESSMENT", tampered_strength_assessment)
    run_case("tampered-novel-evidence", "E_NOVEL_EVIDENCE", tampered_novel_evidence)
    run_case("tampered-unit-schema", "E_UNIT_SCHEMA", tampered_unit_schema)
    run_case("tampered-unit-top-level", "E_UNIT_SCHEMA", tampered_unit_top_level)
    run_case("tampered-inventory-scope", "E_INVENTORY_DECLARATION", lambda rows: None, tampered_inventory_scope)
    run_case("tampered-partition", "E_INVENTORY_DECLARATION", lambda rows: None, tampered_partition)
    run_case("tampered-negative-case-codes", "E_INVENTORY_DECLARATION", lambda rows: None, tampered_negative_case_codes)
    run_case("tampered-novel-inventory", "E_INVENTORY_DECLARATION", lambda rows: None, tampered_novel_inventory)
    run_case("wrong-input-digest", "E_INPUT_DIGEST", lambda rows: None, wrong_input_digest)
    run_case("wrong-base", "E_BASE_COMMIT", lambda rows: None, wrong_base)
    run_case("tampered-base-declaration", "E_BASE_COMMIT", lambda rows: None, tampered_base_declaration)
    run_case("tampered-selection", "E_SELECTION_RULE", lambda rows: None, tampered_selection)
    run_case("tampered-selection-score", "E_SELECTION_RULE", lambda rows: None, tampered_selection_score)
    print("SCF-B-0115 selfcheck: PASS (29 negative cases; expected error codes matched)")


if __name__ == "__main__":
    main()
