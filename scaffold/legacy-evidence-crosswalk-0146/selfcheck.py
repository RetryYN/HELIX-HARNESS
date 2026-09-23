#!/usr/bin/env python3
"""validatorのfail-closed境界を生成物の一時copyで確認する。"""

from __future__ import annotations

import copy
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from common import NEGATIVE_CASE_CODES, derive_all
import validate as validator


BUNDLE = Path(__file__).resolve().parent
VALIDATE = BUNDLE / "validate.py"
OBSERVED_FIRST_CODES = set()


def load_bundle(tmp: Path):
    inventory = json.loads((tmp / "inventory.json").read_text(encoding="utf-8"))
    records = [json.loads(line) for line in (tmp / "evidence.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    return inventory, records


def save_bundle(tmp: Path, inventory, records):
    (tmp / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    (tmp / "evidence.jsonl").write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in records), encoding="utf-8")


def run_case(name, expected_code, mutate, focused=False):
    with tempfile.TemporaryDirectory(prefix="legacy-evidence-crosswalk-0146-") as td:
        tmp = Path(td)
        shutil.copy2(BUNDLE / "inventory.json", tmp / "inventory.json")
        shutil.copy2(BUNDLE / "evidence.jsonl", tmp / "evidence.jsonl")
        shutil.copy2(BUNDLE / "focused-investigation.jsonl", tmp / "focused-investigation.jsonl")
        shutil.copy2(BUNDLE / "source-transfer-manifest.json", tmp / "source-transfer-manifest.json")
        if focused:
            rows = [json.loads(line) for line in (tmp / "focused-investigation.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
            mutate(rows)
            (tmp / "focused-investigation.jsonl").write_text(
                "".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in rows), encoding="utf-8")
            data = (tmp / "focused-investigation.jsonl").read_bytes()
            errors = validator.focused_investigation_errors(
                tmp, derive_all()[0], expected_bytes_sha256=hashlib.sha256(data).hexdigest())
            first_code = errors[0].split(":", 1)[0] if errors else ""
            if first_code != expected_code:
                raise AssertionError(f"{name}: expected {expected_code}, errors={errors}")
            OBSERVED_FIRST_CODES.add(first_code)
            print(f"PASS {name}: {expected_code}")
            return
        else:
            inventory, records = load_bundle(tmp)
            mutate(inventory, records)
            save_bundle(tmp, inventory, records)
        result = subprocess.run(
            [sys.executable, str(VALIDATE), "--bundle", str(tmp)],
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
        )
        first_code = result.stdout.splitlines()[0].split(":", 1)[0] if result.stdout.splitlines() else ""
        if result.returncode == 0 or first_code != expected_code:
            raise AssertionError(f"{name}: expected {expected_code}, rc={result.returncode}, output={result.stdout}")
        OBSERVED_FIRST_CODES.add(first_code)
        print(f"PASS {name}: {expected_code}")


def run_raw_evidence_case(name, mutate):
    with tempfile.TemporaryDirectory(prefix="legacy-evidence-crosswalk-0146-raw-") as td:
        tmp = Path(td)
        shutil.copy2(BUNDLE / "inventory.json", tmp / "inventory.json")
        shutil.copy2(BUNDLE / "evidence.jsonl", tmp / "evidence.jsonl")
        shutil.copy2(BUNDLE / "focused-investigation.jsonl", tmp / "focused-investigation.jsonl")
        shutil.copy2(BUNDLE / "source-transfer-manifest.json", tmp / "source-transfer-manifest.json")
        data = (tmp / "evidence.jsonl").read_bytes()
        (tmp / "evidence.jsonl").write_bytes(mutate(data))
        result = subprocess.run(
            [sys.executable, str(VALIDATE), "--bundle", str(tmp)],
            text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False,
        )
        first_code = result.stdout.splitlines()[0].split(":", 1)[0] if result.stdout.splitlines() else ""
        if result.returncode == 0 or first_code != "E_OUTPUT_DIGEST":
            raise AssertionError(f"{name}: expected E_OUTPUT_DIGEST first, rc={result.returncode}, output={result.stdout}")
        OBSERVED_FIRST_CODES.add(first_code)
        print(f"PASS {name}: E_OUTPUT_DIGEST")


def run_raw_focused_case(name, mutate):
    with tempfile.TemporaryDirectory(prefix="legacy-evidence-crosswalk-0146-focused-raw-") as td:
        tmp = Path(td)
        for filename in ("inventory.json", "evidence.jsonl", "focused-investigation.jsonl", "source-transfer-manifest.json"):
            shutil.copy2(BUNDLE / filename, tmp / filename)
        path = tmp / "focused-investigation.jsonl"
        path.write_bytes(mutate(path.read_bytes()))
        result = subprocess.run(
            [sys.executable, str(VALIDATE), "--bundle", str(tmp)],
            text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False,
        )
        first_code = result.stdout.splitlines()[0].split(":", 1)[0] if result.stdout.splitlines() else ""
        if result.returncode == 0 or first_code != "E_OUTPUT_DIGEST":
            raise AssertionError(f"{name}: expected E_OUTPUT_DIGEST first, rc={result.returncode}, output={result.stdout}")
        OBSERVED_FIRST_CODES.add(first_code)
        print(f"PASS {name}: E_OUTPUT_DIGEST")


def run_focused_typed_case(name, mutate, expected_code):
    with tempfile.TemporaryDirectory(prefix="legacy-evidence-crosswalk-0146-focused-type-") as td:
        tmp = Path(td)
        for filename in ("inventory.json", "evidence.jsonl", "focused-investigation.jsonl", "source-transfer-manifest.json"):
            shutil.copy2(BUNDLE / filename, tmp / filename)
        path = tmp / "focused-investigation.jsonl"
        rows = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
        mutate(rows)
        data = "".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in rows).encode("utf-8")
        path.write_bytes(data)
        original_pin = validator.FOCUSED_BYTES_SHA256
        try:
            validator.FOCUSED_BYTES_SHA256 = hashlib.sha256(data).hexdigest()
            errors = validator.focused_investigation_errors(tmp, derive_all()[0])
        finally:
            validator.FOCUSED_BYTES_SHA256 = original_pin
        first_code = errors[0].split(":", 1)[0] if errors else ""
        if first_code != expected_code:
            raise AssertionError(f"{name}: expected {expected_code} first, errors={errors}")
        OBSERVED_FIRST_CODES.add(first_code)
        print(f"PASS {name}: {expected_code}")


def run_transfer_case():
    with tempfile.TemporaryDirectory(prefix="legacy-evidence-crosswalk-0146-transfer-") as td:
        tmp = Path(td)
        for name in ("inventory.json", "evidence.jsonl", "focused-investigation.jsonl", "source-transfer-manifest.json"):
            shutil.copy2(BUNDLE / name, tmp / name)
        path = tmp / "source-transfer-manifest.json"
        transfer = json.loads(path.read_text(encoding="utf-8"))
        transfer["source_files"]["README.md"]["destination_sha256"] = "0" * 64
        path.write_text(json.dumps(transfer, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        result = subprocess.run(
            [sys.executable, str(VALIDATE), "--bundle", str(tmp)],
            text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False,
        )
        first_code = result.stdout.splitlines()[0].split(":", 1)[0] if result.stdout.splitlines() else ""
        if result.returncode == 0 or first_code != "E_TRANSFER_MANIFEST":
            raise AssertionError(f"transfer_manifest: expected E_TRANSFER_MANIFEST first, rc={result.returncode}, output={result.stdout}")
        OBSERVED_FIRST_CODES.add(first_code)
        print("PASS transfer_manifest: E_TRANSFER_MANIFEST")


def run_missing_bundle_case():
    with tempfile.TemporaryDirectory(prefix="legacy-evidence-crosswalk-0146-missing-") as td:
        result = subprocess.run(
            [sys.executable, str(VALIDATE), "--bundle", td],
            text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False,
        )
        first_code = result.stdout.splitlines()[0].split(":", 1)[0] if result.stdout.splitlines() else ""
        if result.returncode == 0 or first_code != "E_BUNDLE":
            raise AssertionError(f"missing_bundle: expected E_BUNDLE first, rc={result.returncode}, output={result.stdout}")
        OBSERVED_FIRST_CODES.add(first_code)
        print("PASS missing_bundle: E_BUNDLE")


def first(records):
    return records[0]


def main():
    cases = [
        ("record_set", "E_RECORD_SET", lambda i, r: r.pop()),
        ("edge_set", "E_EDGE_SET", lambda i, r: r[0]["coverage"]["edge_ids"].pop()),
        ("edge_duplicate", "E_EDGE_DUPLICATE", lambda i, r: r[0]["coverage"]["edge_ids"].append(r[0]["coverage"]["edge_ids"][0])),
        ("asset_set", "E_ASSET_SET", lambda i, r: r[0]["coverage"]["asset_ids"].pop()),
        ("asset_duplicate", "E_ASSET_DUPLICATE", lambda i, r: r[0]["coverage"]["asset_ids"].append(r[0]["coverage"]["asset_ids"][0])),
        ("status_partition", "E_STATUS_PARTITION", lambda i, r: r[0]["status_partition"]["old_implementation"].update(status="implemented")),
        ("required_evidence_schema", "E_REQUIRED_EVIDENCE_SCHEMA", lambda i, r: r[0]["status_partition"]["acceptance"]["required_evidence_schema"]["artifact_keys"].append("forged")),
        ("source_relation", "E_RECORD_RELATION", lambda i, r: r[0]["source_record"].update(partition_line=9999)),
        ("authority_boundary", "E_AUTHORITY_BOUNDARY", lambda i, r: r[0]["authority_boundary"].update(authority_effect="implementation")),
        ("top_level_key", "E_TOP_LEVEL_KEY", lambda i, r: r[0].update(forged_key=True)),
        ("inventory_product_denominator", "E_PRODUCT_DENOMINATOR", lambda i, r: i["counts"].update(product_units=218)),
        ("inventory_connection_denominator", "E_IRCONN_DENOMINATOR", lambda i, r: i["counts"].update(connections=0)),
        ("input_digest", "E_INPUT_DIGEST", lambda i, r: i["input_digests"][0].update(sha256="0" * 64)),
        ("source_partition_declaration", "E_INVENTORY_DECLARATION", lambda i, r: i["scope"]["source_partition_paths"].pop()),
        ("base_commit", "E_BASE_COMMIT", lambda i, r: i["base"].update(commit="0" * 40)),
        ("unimplemented_status", "E_STATUS_PARTITION", lambda i, r: r[0]["status_partition"]["unimplemented"].update(status="not_implemented")),
        ("typed_partition_line", "E_RECORD_RELATION", lambda i, r: r[0]["source_record"].update(partition_line=float(r[0]["source_record"]["partition_line"]))),
        ("typed_unit_id", "E_RECORD_SET", lambda i, r: r[0]["subject"].update(unit_candidate_id=[r[0]["subject"]["unit_candidate_id"]])),
        ("typed_edge_id", "E_EDGE_SET", lambda i, r: r[0]["coverage"]["edge_ids"].__setitem__(0, [r[0]["coverage"]["edge_ids"][0]])),
        ("typed_asset_id", "E_ASSET_SET", lambda i, r: r[0]["coverage"]["asset_ids"].__setitem__(0, [r[0]["coverage"]["asset_ids"][0]])),
        ("typed_product_denominator", "E_PRODUCT_DENOMINATOR", lambda i, r: i["counts"].update(product_units=217.0)),
        ("null_authority_boundary", "E_RECORD_RELATION", lambda i, r: r[0].update(authority_boundary=None)),
        ("extra_formal_authority", "E_AUTHORITY_BOUNDARY", lambda i, r: r[0]["authority_boundary"].update(formal_implementation=True)),
    ]
    for name, code, mutate in cases:
        run_case(name, code, mutate)
    focused_cases = [
        ("focused_record_missing", "E_RECORD_SET", lambda rows: rows.pop()),
        ("focused_record_duplicate", "E_RECORD_SET", lambda rows: rows.append(copy.deepcopy(rows[0]))),
        ("focused_acceptance_atoms", "E_RECORD_RELATION", lambda rows: rows[0]["missing_evidence_by_unit"][0].update(acceptance_atoms=[])),
        ("focused_requirement_statement", "E_RECORD_RELATION", lambda rows: rows[0]["requirement_atom"].update(statement="changed")),
        ("focused_missing_payload", "E_RECORD_RELATION", lambda rows: rows[0]["missing_evidence_by_unit"][0]["missing"].pop("failure")),
        ("focused_omitted_direct_candidate", "E_RECORD_RELATION", lambda rows: rows[0]["direct_asset_candidates"].pop()),
        ("focused_extra_valid_candidate", "E_RECORD_RELATION", lambda rows: rows[0]["direct_asset_candidates"].append(copy.deepcopy(rows[0]["direct_asset_candidates"][0]))),
        ("focused_l9_row", "E_RECORD_RELATION", lambda rows: rows[0]["system_test_design_candidates"][0].update(row="mutated")),
        ("focused_forbidden_status", "E_AUTHORITY_BOUNDARY", lambda rows: rows[0].update(formal_acceptance=True)),
    ]
    for name, code, mutate in focused_cases:
        run_case(name, code, mutate, focused=True)
    run_focused_typed_case("typed_focused_requirement_id", lambda rows: rows[0].update(requirement_id=[rows[0]["requirement_id"]]), "E_RECORD_SET")
    run_raw_evidence_case("evidence_crlf", lambda data: data.replace(b"\n", b"\r\n"))
    run_raw_evidence_case("evidence_reordered", lambda data: b"".join(reversed(data.splitlines(keepends=True))))
    run_raw_focused_case("focused_crlf", lambda data: data.replace(b"\n", b"\r\n"))
    run_raw_focused_case("focused_reordered", lambda data: b"".join(reversed(data.splitlines(keepends=True))))
    run_raw_focused_case("focused_duplicate_key", lambda data: b"\n".join(b'{"status_effect":"PROMOTED",' + line[1:] for line in data.splitlines()))
    run_transfer_case()
    run_missing_bundle_case()
    state_dependent = {"E_BASE_NOT_ANCESTOR"}
    uncovered = set(NEGATIVE_CASE_CODES) - state_dependent - OBSERVED_FIRST_CODES
    if uncovered:
        raise AssertionError(f"declared negative codes without a first-error case: {sorted(uncovered)}")
    print(f"PASS selfcheck: {len(cases) + len(focused_cases) + 8} negative cases; declared first-error codes covered, state-dependent exception={sorted(state_dependent)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
