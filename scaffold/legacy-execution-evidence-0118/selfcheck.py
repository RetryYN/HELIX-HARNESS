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
NEGATIVE_CASES_RUN = 0
OBSERVATION_CASES_RUN = 0


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
    global NEGATIVE_CASES_RUN
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
    NEGATIVE_CASES_RUN += 1
    print(f"PASS {label}: {code}")
    shutil.rmtree(bundle.parent, ignore_errors=True)


def expect_corrupt(label: str, filename: str, contents: str, code: str, *, sync_output_digest: bool = False) -> None:
    global NEGATIVE_CASES_RUN
    bundle = clone()
    try:
        target = bundle / filename
        target.write_text(contents)
        if sync_output_digest:
            inventory = json.loads((bundle / "inventory.json").read_text())
            inventory["output_sha256"] = tagged(target.read_bytes())
            (bundle / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n")
        proc = subprocess.run([sys.executable, "-B", str(VALIDATOR), "--bundle", str(bundle)], text=True, capture_output=True)
        if proc.returncode == 0 or code not in proc.stderr:
            raise AssertionError(f"{label}: expected {code}, got exit={proc.returncode} stderr={proc.stderr!r}")
        NEGATIVE_CASES_RUN += 1
        print(f"PASS {label}: {code}")
    finally:
        shutil.rmtree(bundle.parent, ignore_errors=True)


def expect_direct(label: str, action, code: str) -> None:
    global NEGATIVE_CASES_RUN
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
        NEGATIVE_CASES_RUN += 1
        return
    raise AssertionError(f"{label}: expected {code}, action returned without failure")


def load_module(path: Path, name: str):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise AssertionError(f"{name}: module import failed")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def expect_observation(label: str, data: bytes, verdict, reason: str, failure_status: str) -> None:
    global OBSERVATION_CASES_RUN
    validator = load_module(VALIDATOR, f"scf_b_0118_oracle_{label}")
    common = load_module(BUNDLE / "common.py", f"scf_b_0118_common_{label}")
    anchors = [{"line": 1}]
    oracle = validator.oracle_source_observation(data, anchors)
    generated = common.source_observation(data, anchors)
    for source, observed in (("oracle", oracle), ("shared", generated)):
        execution, failure, result = observed
        if execution["unit_level_verdict"] is not None or result["verdict"] != verdict or result["reason"] != reason or failure["status"] != failure_status:
            raise AssertionError(f"{label}/{source}: unexpected observation {observed!r}")
    if oracle != generated:
        raise AssertionError(f"{label}: two implementations of the same observation specification diverged")
    OBSERVATION_CASES_RUN += 1
    print(f"PASS {label}: verdict={verdict!r}, failure={failure_status}")


def observation_cases() -> None:
    def summary(*, suite_total=1, suite_passed=1, suite_failed=0, suite_pending=0, suite_todo=0, total=2, passed=1, failed=0, pending=1, todo=0, omit=()):
        value = {
            "numTotalTestSuites": suite_total, "numPassedTestSuites": suite_passed,
            "numFailedTestSuites": suite_failed, "numPendingTestSuites": suite_pending,
            "numTodoTestSuites": suite_todo,
            "numTotalTests": total, "numPassedTests": passed, "numFailedTests": failed,
            "numPendingTests": pending, "numTodoTests": todo,
        }
        for key in omit:
            value.pop(key, None)
        return (json.dumps(value, separators=(",", ":")) + "\n").encode()

    expect_observation("O01 json success0 fail2", summary(suite_passed=0, suite_failed=1, total=2, passed=0, failed=2, pending=0), None, "explicit failure count prevents a pass verdict", "observed_asset_level")
    expect_observation("O02 json contradictory success/failure", summary(suite_total=2, suite_passed=1, suite_failed=1, total=2, passed=1, failed=1, pending=0), None, "contradictory success and failure counts prevent a pass verdict", "observed_asset_level")
    expect_observation("O03 json missing test counts", summary(pending=0, omit=("numPendingTests", "numTodoTests")), None, "required test counts are missing or invalid; result is unknown", "not_observed_in_asset")
    expect_observation("O04 json missing suite counts", summary(pending=0, omit=("numPassedTestSuites",)), None, "required test counts are missing or invalid; result is unknown", "not_observed_in_asset")
    expect_observation("O05 json inconsistent suite counts", summary(suite_total=2, suite_passed=1, total=1, passed=1, pending=0), None, "required test counts are missing or invalid; result is unknown", "not_observed_in_asset")
    expect_observation("O06 json zero total", summary(suite_total=0, suite_passed=0, total=0, passed=0, pending=0), None, "no positive successful test count is present; result is unknown", "not_observed_in_asset")
    expect_observation("O07 json pending", summary(pending=1), "pass_with_pending", "explicit pending or todo count prevents a complete pass verdict", "not_observed_in_asset")
    expect_observation("O08 text zero passed failed2", b"Test Files 0 passed (0)\nTests 0 passed (0)\n2 failed\n", None, "explicit failure/error text prevents a pass verdict", "observed_asset_level")
    expect_observation("O09 text contradictory pass/failure", b"Tests 2 passed (2)\n1 failed\n", None, "contradictory pass summary and failure marker prevent a pass verdict", "observed_asset_level")
    expect_observation("O10 text pass exit2", b"Test Files 1 passed (1)\nTests 1 passed (1)\nvitest exit=2\n", None, "contradictory pass summary and nonzero exit code prevent a pass verdict", "observed_asset_level")
    expect_observation("O11 text normal pass", b"Test Files 1 passed (1)\nTests 1 passed (1)\nvitest exit=0\n", "pass_observed", "text pass summary has no failure marker or nonzero exit, and remains asset-level only", "not_observed_in_asset")
    expect_observation("O12 text zero failed is not failure", b"Tests 1 passed (1)\n0 failed\nvitest exit=0\n", "pass_observed", "text pass summary has no failure marker or nonzero exit, and remains asset-level only", "not_observed_in_asset")
    expect_observation("O13 text pass missing exit", b"Tests 1 passed (1)\n", None, "text pass summary has no explicit exit code 0; result is unknown", "not_observed_in_asset")
    expect_observation("O14 text negative exit", b"Tests 1 passed (1)\nexited with code -1\n", None, "contradictory pass summary and nonzero exit code prevent a pass verdict", "observed_asset_level")
    expect_observation("O15 text hexadecimal exit is not parsed", b"Tests 1 passed (1)\nvitest exit=0x1\n", None, "text pass summary has no explicit exit code 0; result is unknown", "not_observed_in_asset")
    expect_observation("O16 text Exit code zero", b"Tests 1 passed (1)\nExit code: 0\n", "pass_observed", "text pass summary has no failure marker or nonzero exit, and remains asset-level only", "not_observed_in_asset")
    expect_observation("O17 text exited with code zero", b"Tests 1 passed (1)\nexited with code 0\n", "pass_observed", "text pass summary has no failure marker or nonzero exit, and remains asset-level only", "not_observed_in_asset")
    expect_observation("O18 text zero errors", b"Tests 1 passed (1)\n0 errors\nvitest exit=0\n", "pass_observed", "text pass summary has no failure marker or nonzero exit, and remains asset-level only", "not_observed_in_asset")
    expect_observation("O19 text error word boundary", b"Tests 1 passed (1)\nterrorism marker\nvitest exit=0\n", "pass_observed", "text pass summary has no failure marker or nonzero exit, and remains asset-level only", "not_observed_in_asset")
    expect_observation("O20 text prose is not a summary", b"prose says Tests 1 passed (1)\nvitest exit=0\n", None, "no positive test pass summary is present", "not_observed_in_asset")
    expect_observation("O21 identity only", b'{"head_sha":"abc","base_sha":"def","tested_merge_head":"abc"}\n', None, "head/base/tested merge identity is recorded without a test verdict or acceptance verdict", "not_observed_in_asset")
    expect_observation("O22 text bare FAIL marker", b"Tests 1 passed (1)\nFAIL src/x.test.ts\nvitest exit=0\n", None, "contradictory pass summary and failure marker prevent a pass verdict", "observed_asset_level")
    expect_observation("O23 text bare failed marker", b"failed\n", None, "explicit failure/error text prevents a pass verdict", "observed_asset_level")
    expect_observation("O24 text segmentation fault marker", b"Segmentation fault\n", None, "explicit failure/error text prevents a pass verdict", "observed_asset_level")
    expect_observation("O25 text mixed FAIL and zero errors", b"FAIL src/x.test.ts 0 errors\n", None, "explicit failure/error text prevents a pass verdict", "observed_asset_level")
    expect_observation("O26 text npm ERR marker", b"npm ERR! code 1\n", None, "explicit failure/error text prevents a pass verdict", "observed_asset_level")
    expect_observation("O27 text path error word with pass and exit zero", b"Tests 1 passed (1)\nsrc/error-handling.test.ts\nvitest exit=0\n", "pass_observed", "text pass summary has no failure marker or nonzero exit, and remains asset-level only", "not_observed_in_asset")
    expect_observation("O28 text hyphen compound words with pass and exit zero", b"Tests 1 passed (1)\nerror-handling fail-safe failed-check fatal-error segmentation-fault npm-ERR!\nvitest exit=0\n", "pass_observed", "text pass summary has no failure marker or nonzero exit, and remains asset-level only", "not_observed_in_asset")
    expect_observation("O29 text mixed exit codes on one line", b"Tests 3 passed\nvitest exit=0; vitest exit=2\n", None, "contradictory pass summary and nonzero exit code prevent a pass verdict", "observed_asset_level")
    expect_observation("O30 json consistent todo counts", summary(suite_total=2, suite_passed=1, suite_todo=1, total=2, passed=1, pending=0, todo=1), "pass_with_pending", "explicit pending or todo count prevents a complete pass verdict", "not_observed_in_asset")



def main() -> int:
    observation_cases()
    expect("N01 unit link forgery", lambda inv, rows: rows[0]["product_unit_binding"].update(status="bound", unit_candidate_ids=["FAKE-UNIT"]), "E_UNIT_BINDING")
    expect("N02 requirement link forgery", lambda inv, rows: rows[0]["requirement_binding"].update(status="bound", requirement_ids=["FAKE-REQ"]), "E_REQUIREMENT_BINDING")
    expect("N03 acceptance verdict forgery", lambda inv, rows: rows[0]["acceptance_binding"].update(status="accepted", verdict="passed"), "E_ACCEPTANCE_BINDING")
    expect("N04 ledger nested consumer tamper", lambda inv, rows: rows[0]["ledger_record"].update(consumer_refs=["FAKE-CONSUMER"]), "E_LEDGER_RECORD")
    expect("N05 source blob tamper", lambda inv, rows: rows[0]["source_exact"].update(blob="0" * 40), "E_SOURCE_EVIDENCE")
    expect("N06 asset result promoted to unit verdict", lambda inv, rows: rows[0]["execution_observation"].update(unit_level_verdict="passed"), "E_OBSERVATION")
    expect("N07 legacy implementation promotion", lambda inv, rows: rows[0]["implementation"].update(status="implemented"), "E_STATUS_PROMOTION")
    expect("N08 duplicate asset row", lambda inv, rows: rows.__setitem__(1, copy.deepcopy(rows[0])), "E_ASSET_SET")
    expect("N09 missing asset row", lambda inv, rows: rows.pop(), "E_ASSET_SET")
    expect("N10 input digest tamper", lambda inv, rows: inv["input_digests"][0].update(sha256="sha256:" + "0" * 64), "E_INPUT_DIGEST")
    expect("N11 base pin tamper", lambda inv, rows: inv.update(base_revision="0" * 40), "E_BASE_PIN")
    expect("N12 scope denominator tamper", lambda inv, rows: inv["scope"].update(product_units=217), "E_SCOPE")
    expect("N13 selection rule tamper", lambda inv, rows: inv["selection"].update(source_path_regex=".*"), "E_EXPLORATION")
    expect("N14 unknown evidence field", lambda inv, rows: rows[0].update(fabricated_field=True), "E_SCHEMA")
    expect("N15 authority boundary tamper", lambda inv, rows: inv["authority_boundary"].update(authority_effect="implementation"), "E_AUTHORITY_BOUNDARY")
    expect("N16 record authority effect", lambda inv, rows: rows[0].update(authority_effect="implementation"), "E_AUTHORITY_BOUNDARY")
    expect("N17 record asset role", lambda inv, rows: rows[0].update(asset_role="formal_implementation"), "E_AUTHORITY_BOUNDARY")
    expect("N18 inventory schema revision", lambda inv, rows: inv.update(schema_revision=2), "E_SCHEMA")
    expect("N19 inventory binding id", lambda inv, rows: inv.update(binding_id="SCF-B-9999"), "E_SCHEMA")
    expect("N20 anchor rule tamper", lambda inv, rows: inv["anchor_rule"].update(regex=".*"), "E_EXPLORATION")
    expect("N21 exploration tamper", lambda inv, rows: inv["exploration"]["negative_findings"].update(selected_assets_in_wave_edges=1), "E_EXPLORATION")
    expect_corrupt("N22 broken inventory JSON", "inventory.json", "{\n", "E_SCHEMA")
    expect_corrupt("N23 broken evidence JSONL", "evidence.jsonl", "not-json\n", "E_SCHEMA", sync_output_digest=True)
    expect("N24 history/counter tamper", lambda inv, rows: rows[0]["counter_evidence"].clear(), "E_HISTORY_OR_COUNTER")
    expect("N25 input path set tamper", lambda inv, rows: inv["input_digests"].pop(), "E_INPUT_SET")
    expect("N26 output digest omission", lambda inv, rows: rows[0].update(asset_role="tampered"), "E_OUTPUT_DIGEST", digest_output=False)
    root_commit = subprocess.check_output(["git", "rev-list", "--max-parents=0", "HEAD"], text=True).strip().splitlines()[0]
    expect("N27 fixed BASE non-ancestor", lambda inv, rows: None, "E_BASE_NOT_ANCESTOR", env={"SCF_VALIDATION_HEAD": root_commit})
    expect_direct("N28 missing fixed-base source object", lambda module: module.git_bytes("__scf_missing_base_source__"), "E_BASE_SOURCE")
    def history_probe(module):
        selected = [row for _, row in module.base_rows(module.DISPOSITION) if module.re.search(module.SELECTION_REGEX, row.get("source_path", ""), module.re.IGNORECASE)]
        decision_asset = module.base_rows(module.DECISIONS)[0][1]["asset_id"]
        probe = dict(selected[0])
        probe["asset_id"] = decision_asset
        module.expected_records([probe])
    expect_direct("N29 unexpected history binding", history_probe, "E_HISTORY_BINDING")
    expect("N30 bundle kind tamper", lambda inv, rows: inv.update(bundle_kind="fabricated_bundle_kind"), "E_SCHEMA")
    expect("N31 expected asset count tamper", lambda inv, rows: inv.update(expected_asset_count=27), "E_SCOPE")
    expect("N32 inventory top-level key tamper", lambda inv, rows: inv.update(fabricated_field=True), "E_SCHEMA")
    print(f"PASS SCF-B-0118 selfcheck: {NEGATIVE_CASES_RUN} negative cases plus {OBSERVATION_CASES_RUN} observation-state cases")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
