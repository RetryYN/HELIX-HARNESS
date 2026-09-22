#!/usr/bin/env python3
"""Negative self-checks for the PHCAP-15 static research candidate."""

from __future__ import annotations

import copy
import importlib.util
import json
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
VALIDATOR_PATH = HERE / "validate.py"
spec = importlib.util.spec_from_file_location("phcap15_gap_validate", VALIDATOR_PATH)
if spec is None or spec.loader is None:
    raise RuntimeError("cannot load validator")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)


def load() -> dict:
    return json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))


def expect_error(name: str, mutate) -> None:
    data = load()
    mutate(data)
    errors = validator.validate_inventory(data)
    if not errors:
        raise AssertionError(f"{name}: mutation was accepted")
    print(f"PASS {name}: {errors[0]}")


def main() -> int:
    baseline = load()
    if validator.validate_inventory(baseline):
        print("FAIL baseline inventory is not valid", file=sys.stderr)
        return 1
    if validator.validate_inventory(copy.deepcopy(baseline)):
        print("FAIL no-op copy changed validation", file=sys.stderr)
        return 1
    print("PASS baseline/no-op")

    expect_error("authority promotion", lambda d: d["capture"].update(authority_effect="implementation"))
    expect_error("phase degradation promotion", lambda d: d["phase"].update(transition_assessment="implemented"))
    expect_error("pool denominator shrink", lambda d: d["denominator"].update(phcap15_classification_pool_rows=7))
    expect_error("product removal", lambda d: d["products"].pop())
    expect_error("archive digest drift", lambda d: d["assets"][0].update(source_file_sha256="0" * 64))
    expect_error("archive anchor drift", lambda d: d["assets"][1]["anchors"][0].update(span_sha256="f" * 64))
    expect_error("legacy implementation promotion", lambda d: d["assets"][2].update(legacy_implementation_status="implemented"))
    expect_error("current implementation promotion", lambda d: d["assets"][3]["current_interpretation"].update(implementation="implemented"))
    expect_error("failure receipt promotion", lambda d: d["evidence_gaps"]["failure"].update(selected_failure_receipts=1))
    expect_error("consumer closure promotion", lambda d: d["assets"][4].update(consumer_closure_status="closed"))
    expect_error("decision match promotion", lambda d: d["assets"][5].update(decision_matches=1))
    expect_error("requirement-link inference", lambda d: d["prohibited_inference"].pop())
    expect_error("unknown top-level key", lambda d: d.update(inferred_requirement_ids=[]))
    expect_error("anchor meaning mutation", lambda d: d["assets"][0]["anchors"][0].update(meaning="invented meaning"))
    expect_error("anchor count deletion", lambda d: d["assets"][1]["anchors"].pop())
    expect_error("evidence gap interpretation mutation", lambda d: d["evidence_gaps"]["failure"].update(interpretation="observed failure"))
    expect_error("product unit boundary mutation", lambda d: d["products"][0].update(unit_boundary="owner assigned"))
    expect_error("product evidence status mutation", lambda d: d["products"][1].update(current_evidence_status="implemented"))
    expect_error("capture scope mutation", lambda d: d["capture"].update(scope="all deploy requirements"))
    expect_error("archive read mode mutation", lambda d: d["capture"].update(archive_read_mode="execute"))
    expect_error("prohibited inference body mutation", lambda d: d["prohibited_inference"].__setitem__(0, "pool is a requirement link"))
    expect_error("required commands mutation", lambda d: d["verification_contract"]["required_commands"].pop())
    expect_error("negative case body mutation", lambda d: d["verification_contract"]["negative_cases"].append("invented negative"))
    expect_error("asset nested key injection", lambda d: d["assets"][0].update(unexpected_key=True))
    expect_error("anchor nested key injection", lambda d: d["assets"][0]["anchors"][0].update(unexpected_key=True))
    expect_error("product nested key injection", lambda d: d["products"][0].update(unexpected_key=True))
    expect_error("ref nested key injection", lambda d: d["products"][0]["refs"][0].update(unexpected_key=True))
    expect_error("capture nested key injection", lambda d: d["capture"].update(unexpected_key=True))
    expect_error("evidence gap nested key injection", lambda d: d["evidence_gaps"]["consumer"].update(unexpected_key=True))
    expect_error("verification nested key injection", lambda d: d["verification_contract"].update(unexpected_key=True))
    print("PHCAP-15 deploy gap selfcheck: PASS (baseline plus 29 negative cases)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
