#!/usr/bin/env python3
"""SCF-B-0102 validatorの意味ある負例と期待error codeを確認する。"""
from __future__ import annotations

import copy
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


BUNDLE = Path(__file__).resolve().parent
ROOT = BUNDLE.parents[1]
VALIDATE = BUNDLE / "validate.py"


def run_case(name: str, expected_code: str, mutate, mutate_inventory=None) -> None:
    with tempfile.TemporaryDirectory(prefix=f"scf-b-0102-{name}-") as tmp:
        target = Path(tmp)
        inventory = json.loads((BUNDLE / "inventory.json").read_text(encoding="utf-8"))
        if mutate_inventory:
            mutate_inventory(inventory)
        (target / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, sort_keys=True) + "\n", encoding="utf-8")
        rows = [json.loads(line) for line in (BUNDLE / "evidence.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
        mutate(rows)
        (target / "evidence.jsonl").write_text(
            "".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows), encoding="utf-8"
        )
        result = subprocess.run(
            [sys.executable, str(VALIDATE), "--bundle", str(target), "--repo", str(ROOT)],
            text=True, capture_output=True, check=False,
        )
        output = result.stdout + result.stderr
        if result.returncode == 0 or expected_code not in output:
            raise SystemExit(f"{name}: expected {expected_code}, got rc={result.returncode}\n{output}")
        print(f"PASS {name}: {expected_code}")


def main() -> None:
    def wrong_blob(rows):
        rows[0]["old_asset_evidence"]["assets"][0]["git_blob_oid_at_base"] = "0" * 40

    def wrong_current_span(rows):
        rows[0]["current_implementation_evidence"]["current_refs"][0]["span_sha256"] = "sha256:" + "0" * 64

    def missing_edge(rows):
        rows[0]["semantic_review_edges"].pop()

    def claimed_current_impl(rows):
        rows[0]["current_implementation_evidence"]["status"] = "implemented"

    def claimed_failure(rows):
        rows[0]["legacy_failure_evidence"]["observed_failure_status"] = "observed"

    def tampered_ledger_consumer(rows):
        rows[0]["old_asset_evidence"]["assets"][0]["ledger_record"]["consumer_refs"] = ["FAKE-CONSUMER"]

    def tampered_consumer_status(rows):
        rows[0]["legacy_consumer_evidence"]["closure_status"] = "closed"

    def tampered_consumer_refs(rows):
        rows[0]["legacy_consumer_evidence"]["review_observed_consumer_refs"].append("FAKE-CONSUMER")

    def missing_counter_evidence(rows):
        rows[0]["counter_evidence"] = {}

    def missing_unresolved(rows):
        rows[0]["unresolved"] = []

    def wrong_input_digest(inventory):
        first = sorted(inventory["input_digests"])[0]
        inventory["input_digests"][first] = "0" * 64

    run_case("wrong-blob", "E_OLD_BLOB", wrong_blob)
    run_case("wrong-current-span", "E_CURRENT_SPAN", wrong_current_span)
    run_case("missing-edge", "E_REVIEW_EDGE_SET", missing_edge)
    run_case("claimed-current-implementation", "E_CURRENT_STATUS", claimed_current_impl)
    run_case("claimed-old-failure", "E_OLD_FAILURE_CLAIM", claimed_failure)
    run_case("tampered-ledger-consumer", "E_OLD_LEDGER_RECORD", tampered_ledger_consumer)
    run_case("tampered-consumer-status", "E_CONSUMER_EVIDENCE", tampered_consumer_status)
    run_case("tampered-consumer-refs", "E_CONSUMER_EVIDENCE", tampered_consumer_refs)
    run_case("missing-counter-evidence", "E_COUNTER_EVIDENCE", missing_counter_evidence)
    run_case("missing-unresolved", "E_UNRESOLVED", missing_unresolved)
    run_case("wrong-input-digest", "E_INPUT_DIGEST", lambda rows: None, wrong_input_digest)
    print("SCF-B-0102 selfcheck: PASS (11 negative cases; expected error codes matched)")


if __name__ == "__main__":
    main()
