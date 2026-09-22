#!/usr/bin/env python3
"""Mutation self-checks for SCF-B-0118 fail-closed invariants."""
from __future__ import annotations

import copy
import importlib.util
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

BUNDLE = Path(__file__).resolve().parent
VALIDATOR = BUNDLE / "validate.py"


def tagged(data: bytes) -> str:
    import hashlib

    return "sha256:" + hashlib.sha256(data).hexdigest()


def clone() -> Path:
    root = Path(tempfile.mkdtemp(prefix="scf-b-0118-selfcheck-"))
    dst = root / BUNDLE.name
    shutil.copytree(BUNDLE, dst)
    return dst


def load(bundle: Path) -> tuple[dict, list[dict]]:
    return json.loads((bundle / "inventory.json").read_text()), [json.loads(x) for x in (bundle / "evidence.jsonl").read_text().splitlines() if x.strip()]


def save(bundle: Path, inventory: dict, rows: list[dict], digest_output: bool = True) -> None:
    evidence = bundle / "evidence.jsonl"
    evidence.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows))
    if digest_output:
        inventory["output_sha256"] = tagged(evidence.read_bytes())
    (bundle / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n")


def expect(label: str, mutate, code: str, *, digest_output: bool = True, env: dict[str, str] | None = None) -> None:
    bundle = clone()
    inventory, rows = load(bundle)
    mutate(inventory, rows)
    save(bundle, inventory, rows, digest_output=digest_output)
    process_env = os.environ.copy()
    if env:
        process_env.update(env)
    proc = subprocess.run([sys.executable, "-B", str(VALIDATOR), "--bundle", str(bundle)], text=True, capture_output=True, env=process_env)
    if proc.returncode == 0 or code not in proc.stderr:
        raise AssertionError(f"{label}: expected {code}, got exit={proc.returncode} stderr={proc.stderr!r}")
    print(f"PASS {label}: {code}")
    shutil.rmtree(bundle.parent, ignore_errors=True)


def expect_direct(label: str, action, code: str) -> None:
    spec = importlib.util.spec_from_file_location("scf_b_0118_validate_probe", VALIDATOR)
    if spec is None or spec.loader is None:
        raise AssertionError(f"{label}: validator import failed")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    try:
        action(module)
    except AssertionError as exc:
        if code not in str(exc):
            raise AssertionError(f"{label}: expected {code}, got {exc}") from exc
        print(f"PASS {label}: {code}")
        return
    raise AssertionError(f"{label}: expected {code}, action returned without failure")


def main() -> int:
    expect("unit link forgery", lambda inv, rows: rows[0]["product_unit_binding"].update(status="bound", unit_candidate_ids=["FAKE-UNIT"]), "E_UNIT_BINDING")
    expect("requirement link forgery", lambda inv, rows: rows[0]["requirement_binding"].update(status="bound", requirement_ids=["FAKE-REQ"]), "E_REQUIREMENT_BINDING")
    expect("acceptance verdict forgery", lambda inv, rows: rows[0]["acceptance_binding"].update(status="accepted", verdict="passed"), "E_ACCEPTANCE_BINDING")
    expect("ledger nested consumer tamper", lambda inv, rows: rows[0]["ledger_record"].update(consumer_refs=["FAKE-CONSUMER"]), "E_LEDGER_RECORD")
    expect("source blob tamper", lambda inv, rows: rows[0]["source_exact"].update(blob="0" * 40), "E_SOURCE_EVIDENCE")
    expect("asset result promoted to unit verdict", lambda inv, rows: rows[0]["execution_observation"].update(unit_level_verdict="passed"), "E_OBSERVATION")
    expect("legacy implementation promotion", lambda inv, rows: rows[0]["implementation"].update(status="implemented"), "E_STATUS_PROMOTION")
    expect("duplicate asset row", lambda inv, rows: rows.__setitem__(1, copy.deepcopy(rows[0])), "E_ASSET_SET")
    expect("missing asset row", lambda inv, rows: rows.pop(), "E_ASSET_SET")
    expect("input digest tamper", lambda inv, rows: inv["input_digests"][0].update(sha256="sha256:" + "0" * 64), "E_INPUT_DIGEST")
    expect("base pin tamper", lambda inv, rows: inv.update(base_revision="0" * 40), "E_BASE_PIN")
    expect("scope denominator tamper", lambda inv, rows: inv["scope"].update(product_units=217), "E_SCOPE")
    expect("selection rule tamper", lambda inv, rows: inv["selection"].update(source_path_regex=".*"), "E_EXPLORATION")
    expect("unknown evidence field", lambda inv, rows: rows[0].update(fabricated_field=True), "E_SCHEMA")
    expect("authority boundary tamper", lambda inv, rows: inv["authority_boundary"].update(authority_effect="implementation"), "E_AUTHORITY_BOUNDARY")
    expect("history/counter tamper", lambda inv, rows: rows[0]["counter_evidence"].clear(), "E_HISTORY_OR_COUNTER")
    expect("input path set tamper", lambda inv, rows: inv["input_digests"].pop(), "E_INPUT_SET")
    expect("output digest omission", lambda inv, rows: rows[0].update(asset_role="tampered"), "E_OUTPUT_DIGEST", digest_output=False)
    root_commit = subprocess.check_output(["git", "rev-list", "--max-parents=0", "HEAD"], text=True).strip().splitlines()[0]
    expect("fixed BASE non-ancestor", lambda inv, rows: None, "E_BASE_NOT_ANCESTOR", env={"SCF_VALIDATION_HEAD": root_commit})
    expect_direct("missing fixed-base source object", lambda module: module.git_bytes("__scf_missing_base_source__"), "E_BASE_SOURCE")
    def history_probe(module):
        selected = [row for _, row in module.base_rows(module.DISPOSITION) if module.re.search(module.SELECTION_REGEX, row.get("source_path", ""), module.re.IGNORECASE)]
        decision_asset = module.base_rows(module.DECISIONS)[0][1]["asset_id"]
        probe = dict(selected[0])
        probe["asset_id"] = decision_asset
        module.expected_records([probe])
    expect_direct("unexpected history binding", history_probe, "E_HISTORY_BINDING")
    print("PASS SCF-B-0118 selfcheck: 21 negative cases")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
