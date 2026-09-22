#!/usr/bin/env python3
"""Mutation self-checks for SCF-B-0129 fail-closed boundaries."""
from __future__ import annotations

import copy
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

BUNDLE = Path(__file__).resolve().parent
ROOT = BUNDLE.parents[1]
VALIDATOR = BUNDLE / "validate.py"


def digest(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def clone() -> Path:
    root = Path(tempfile.mkdtemp(prefix="scf-b-0129-selfcheck-"))
    dst = root / BUNDLE.name
    shutil.copytree(BUNDLE, dst)
    return dst


def load(bundle: Path) -> tuple[dict, list[dict]]:
    return json.loads((bundle / "inventory.json").read_text()), [json.loads(x) for x in (bundle / "evidence.jsonl").read_text().splitlines() if x.strip()]


def save(bundle: Path, inventory: dict, rows: list[dict], update_digest: bool = True) -> None:
    evidence = bundle / "evidence.jsonl"
    evidence.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows))
    if update_digest:
        inventory["output_sha256"] = digest(evidence.read_bytes())
    (bundle / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n")


def expect(label: str, mutate, code: str, *, update_digest: bool = True, env: dict[str, str] | None = None) -> None:
    bundle = clone()
    inventory, rows = load(bundle)
    mutate(inventory, rows)
    save(bundle, inventory, rows, update_digest=update_digest)
    process_env = os.environ.copy()
    process_env["SCF_REPO_ROOT"] = str(ROOT)
    if env:
        process_env.update(env)
    proc = subprocess.run([sys.executable, "-B", str(VALIDATOR), "--bundle", str(bundle)], text=True, capture_output=True, env=process_env)
    if proc.returncode == 0 or code not in proc.stderr:
        raise AssertionError(f"{label}: expected {code}, got exit={proc.returncode} stderr={proc.stderr!r}")
    print(f"PASS {label}: {code}")
    shutil.rmtree(bundle.parent, ignore_errors=True)


def main() -> int:
    expect("input digest tamper", lambda inv, rows: inv["input_digests"][0].update(sha256="sha256:" + "0" * 64), "E_INPUT_DIGEST")
    expect("base pin tamper", lambda inv, rows: inv.update(base_revision="0" * 40), "E_BASE_PIN")
    expect("scope denominator tamper", lambda inv, rows: inv.update(expected_unit_count=9), "E_SCOPE")
    expect("selection product scope tamper", lambda inv, rows: inv["selection"].update(product_scope="HELIX-HARNESS"), "E_SELECTION")
    expect("unit duplicate", lambda inv, rows: rows.__setitem__(1, copy.deepcopy(rows[0])), "E_UNIT_SET")
    expect("crosswalk direct link forgery", lambda inv, rows: rows[0]["source_requirement"].update(direct_legacy_asset_links=["FAKE-ASSET"]), "E_SOURCE_REQUIREMENT")
    expect("current partition tamper", lambda inv, rows: rows[0]["current_evidence_partition"].__setitem__("row_sha256", "sha256:" + "0" * 64), "E_CURRENT_PARTITION")
    expect("Wave edge tamper", lambda inv, rows: rows[0]["semantic_review_edges"][0]["edge"].update(review_id="FAKE-EDGE"), "E_EDGE_SET")
    expect("unit asset duplicate", lambda inv, rows: rows[0]["asset_evidence"].__setitem__(1, copy.deepcopy(rows[0]["asset_evidence"][0])), "E_ASSET_SET")
    expect("ledger record tamper", lambda inv, rows: rows[0]["asset_evidence"][0]["ledger_record"].update(consumer_refs=["FAKE-CONSUMER"]), "E_LEDGER_RECORD")
    expect("phase record tamper", lambda inv, rows: rows[0]["asset_evidence"][0]["phase_classification_record"].update(legacy_implementation_status="implemented"), "E_PHASE_RECORD")
    expect("source anchor tamper", lambda inv, rows: rows[0]["asset_evidence"][0]["source_exact"][0].__setitem__("git_blob_oid_at_base", "0" * 40), "E_SOURCE_EVIDENCE")
    expect("old implementation promotion", lambda inv, rows: rows[0]["status_partition"]["old_implementation"].update(status="implemented"), "E_STATUS_PROMOTION")
    expect("old failure promotion", lambda inv, rows: rows[0]["status_partition"]["old_failure"].update(status="failed"), "E_STATUS_PROMOTION")
    expect("consumer closure promotion", lambda inv, rows: rows[0]["status_partition"]["old_consumer"].update(status="closed"), "E_STATUS_PROMOTION")
    expect("phase authority promotion", lambda inv, rows: rows[0]["status_partition"]["old_phase"].update(direct_authority=True), "E_STATUS_PROMOTION")
    expect("authority boundary tamper", lambda inv, rows: rows[0]["authority_boundary"].update(authority_effect="implementation"), "E_AUTHORITY_BOUNDARY")
    expect("unknown evidence field", lambda inv, rows: rows[0].update(fabricated_field=True), "E_SCHEMA")
    expect("output digest omission", lambda inv, rows: rows[0]["unresolved"].append("tampered"), "E_OUTPUT_DIGEST", update_digest=False)
    expect("input path omission", lambda inv, rows: inv["input_digests"].pop(), "E_INPUT_DIGEST")
    root_commit = subprocess.check_output(["git", "rev-list", "--max-parents=0", "HEAD"], cwd=ROOT, text=True).strip().splitlines()[0]
    expect("fixed BASE non-ancestor", lambda inv, rows: None, "E_BASE_NOT_ANCESTOR", env={"SCF_VALIDATION_HEAD": root_commit})
    print("PASS SCF-B-0129 selfcheck: 21 negative cases")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
