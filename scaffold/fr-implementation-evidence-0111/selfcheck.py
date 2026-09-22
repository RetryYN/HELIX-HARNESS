#!/usr/bin/env python3
"""SCF-B-0111 validatorの意味ある負例と期待error codeを確認する。"""
from __future__ import annotations

import copy
import json
import subprocess
import tempfile
from pathlib import Path


BUNDLE = Path(__file__).resolve().parent
ROOT = BUNDLE.parents[1]
VALIDATE = BUNDLE / "validate.py"


def run_case(name: str, expected_code: str, mutate, mutate_inventory=None) -> None:
    with tempfile.TemporaryDirectory(prefix=f"scf-b-0111-{name}-") as tmp:
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

    def tampered_history(rows):
        rows[0]["old_asset_evidence"]["assets"][0]["history"]["asset_class"] = "Tampered"

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

    def tampered_context(rows):
        rows[0]["current_context"][0]["implementation_claim"] = True

    def extra_unit_key(rows):
        rows[0]["unexpected_authority_field"] = True

    def claimed_unimplemented(rows):
        rows[0]["unimplemented_assessment"]["explicit_non_implementation_claim"] = True

    def tampered_inventory_scope(inventory):
        inventory["scope"]["unique_old_asset_count"] = 99999

    def tampered_partition(inventory):
        inventory["partition_contract"]["failure"] = "failure_receipt"

    def extra_inventory_key(inventory):
        inventory["unexpected_authority_field"] = True

    def wrong_input_digest(inventory):
        inventory["input_snapshot"][0]["sha256"] = "0" * 64

    def wrong_base(inventory):
        inventory["base"]["commit"] = "0" * 40

    def wrong_base_declaration(inventory):
        inventory["base"]["repository"] = "OTHER"
        inventory["base"]["branch"] = "research"

    def wrong_unit_schema(rows):
        rows[0]["schema"] = "fr-implementation-evidence-0111/v0/unit"

    run_case("wrong-asset-blob", "E_OLD_ASSET_SOURCE", wrong_asset_blob)
    run_case("wrong-anchor", "E_SOURCE_ANCHOR", wrong_anchor)
    run_case("missing-edge", "E_REVIEW_EDGE_SET", missing_edge)
    run_case("duplicated-edge", "E_REVIEW_EDGE_SET", duplicated_edge)
    run_case("removed-asset", "E_OLD_ASSET_UNIT_SET", removed_asset)
    run_case("duplicated-asset", "E_OLD_ASSET_UNIT_SET", duplicated_asset)
    run_case("tampered-ledger", "E_OLD_LEDGER_RECORD", tampered_ledger)
    run_case("tampered-history", "E_OLD_ASSET_HISTORY", tampered_history)
    run_case("tampered-candidate", "E_REPRESENTATIVE_ASSET", tampered_candidate)
    run_case("tampered-implementation", "E_IMPLEMENTATION_EVIDENCE", tampered_implementation)
    run_case("tampered-degradation", "E_DEGRADATION_EVIDENCE", tampered_degradation)
    run_case("tampered-failure", "E_FAILURE_EVIDENCE", tampered_failure)
    run_case("tampered-consumer", "E_CONSUMER_EVIDENCE", tampered_consumer)
    run_case("tampered-current", "E_CURRENT_STATUS", tampered_current)
    run_case("tampered-context", "E_CURRENT_STATUS", tampered_context)
    run_case("extra-unit-key", "E_INVENTORY_DECLARATION", extra_unit_key)
    run_case("claimed-unimplemented", "E_UNIMPLEMENTED_CLAIM", claimed_unimplemented)
    run_case("tampered-inventory-scope", "E_INVENTORY_DECLARATION", lambda rows: None, tampered_inventory_scope)
    run_case("tampered-partition", "E_INVENTORY_DECLARATION", lambda rows: None, tampered_partition)
    run_case("extra-inventory-key", "E_INVENTORY_DECLARATION", lambda rows: None, extra_inventory_key)
    run_case("wrong-input-digest", "E_INPUT_DIGEST", lambda rows: None, wrong_input_digest)
    run_case("wrong-base", "E_BASE_COMMIT", lambda rows: None, wrong_base)
    run_case("wrong-base-repository-branch", "E_BASE_COMMIT", lambda rows: None, wrong_base_declaration)
    run_case("wrong-unit-schema", "E_UNIT_SCHEMA", wrong_unit_schema)
    print("SCF-B-0111 selfcheck: PASS (24 negative executions; expected error codes matched)")


if __name__ == "__main__":
    main()
