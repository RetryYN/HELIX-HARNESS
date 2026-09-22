#!/usr/bin/env python3
"""Mutation checks for SCF-B-0122 fail-closed evidence boundaries."""
from __future__ import annotations

import copy
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

BUNDLE = Path(__file__).resolve().parent
VALIDATOR = BUNDLE / "validate.py"


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def clone() -> Path:
    root = Path(tempfile.mkdtemp(prefix="scf-b-0122-selfcheck-"))
    dst = root / BUNDLE.name
    shutil.copytree(BUNDLE, dst)
    return dst


def load(bundle: Path) -> tuple[dict, list[dict]]:
    return json.loads((bundle / "inventory.json").read_text()), [json.loads(x) for x in (bundle / "evidence.jsonl").read_text().splitlines() if x.strip()]


def save(bundle: Path, inventory: dict, rows: list[dict], recalc_digest: bool = True) -> None:
    evidence = bundle / "evidence.jsonl"
    evidence.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows))
    if recalc_digest:
        inventory["output_sha256"] = tagged(evidence.read_bytes())
    (bundle / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n")


def expect(label: str, mutate, code: str, *, recalc_digest: bool = True) -> None:
    bundle = clone()
    inventory, rows = load(bundle)
    mutate(inventory, rows)
    save(bundle, inventory, rows, recalc_digest=recalc_digest)
    proc = subprocess.run([sys.executable, "-B", str(VALIDATOR), "--bundle", str(bundle)], text=True, capture_output=True)
    if proc.returncode == 0 or code not in proc.stderr:
        raise AssertionError(f"{label}: expected {code}, got exit={proc.returncode} stderr={proc.stderr!r}")
    print(f"PASS {label}: {code}")
    shutil.rmtree(bundle.parent, ignore_errors=True)


def main() -> int:
    expect("nested ledger consumer tamper", lambda inv, rs: rs[0]["ledger_record"].update(consumer_refs=["FAKE-CONSUMER"]), "E_LEDGER_RECORD")
    expect("phase history tamper", lambda inv, rs: rs[0]["history_evidence"]["phase_record"].update(candidate_product_targets=["FAKE-PRODUCT"]), "E_HISTORY_RECORD")
    expect("decision history tamper", lambda inv, rs: rs[0]["history_evidence"]["decision_records"][0].update(decision_id="FAKE-DECISION"), "E_HISTORY_RECORD")
    expect("read-after history tamper", lambda inv, rs: rs[0]["history_evidence"]["read_after_record"].update(consumer_refs_observed=["FAKE-CONSUMER"]), "E_HISTORY_RECORD")
    expect("archive blob tamper", lambda inv, rs: rs[0]["source_exact"].update(archive_blob="0" * 40), "E_SOURCE_EVIDENCE")
    expect("current target digest tamper", lambda inv, rs: rs[0]["source_exact"].update(target_sha256="sha256:" + "0" * 64), "E_SOURCE_EVIDENCE")
    expect("wave edge tamper", lambda inv, rs: rs[2]["unit_binding"]["wave_edge_refs"][0]["record"].update(semantic_link_status="confirmed-fabricated"), "E_UNIT_BINDING")
    expect("representative record tamper", lambda inv, rs: rs[0]["unit_binding"]["representative_link_refs"][0]["record"].update(direct_requirement_semantic_link=True), "E_UNIT_BINDING")
    expect("candidate pool link tamper", lambda inv, rs: rs[0]["unit_binding"]["candidate_pool_rows"][0].update(unit_candidate_id="FAKE-UNIT"), "E_UNIT_BINDING")
    expect("unit binding promotion", lambda inv, rs: rs[0]["unit_binding"].update(status="bound", unit_candidate_ids=["FAKE-UNIT"]), "E_UNIT_BINDING")
    expect("old implementation promotion", lambda inv, rs: rs[0]["legacy_implementation_evidence"].update(status="implemented"), "E_IMPLEMENTATION_EVIDENCE")
    expect("degradation promotion", lambda inv, rs: rs[0]["degradation_evidence"].update(status="degraded"), "E_DEGRADATION_EVIDENCE")
    expect("unimplemented promotion", lambda inv, rs: rs[0]["unimplemented_evidence"].update(status="unimplemented"), "E_UNIMPLEMENTED_EVIDENCE")
    expect("failure promotion", lambda inv, rs: rs[0]["failure_evidence"].update(status="failed"), "E_FAILURE_EVIDENCE")
    expect("acceptance verdict forgery", lambda inv, rs: rs[0]["acceptance_evidence"].update(status="accepted", verdict="passed"), "E_ACCEPTANCE_EVIDENCE")
    expect("unknown top-level field", lambda inv, rs: rs[0].update(fabricated_field=True), "E_SCHEMA")
    expect("duplicate asset row", lambda inv, rs: rs.__setitem__(1, copy.deepcopy(rs[0])), "E_ASSET_SET")
    expect("missing asset row", lambda inv, rs: rs.pop(), "E_ASSET_SET")
    expect("input digest tamper", lambda inv, rs: inv["input_digests"][0].update(sha256="sha256:" + "0" * 64), "E_INPUT_DIGEST")
    expect("input path omission", lambda inv, rs: inv["input_digests"].pop(), "E_INPUT_SET")
    expect("input path duplicate", lambda inv, rs: inv["input_digests"].__setitem__(1, copy.deepcopy(inv["input_digests"][0])), "E_INPUT_SET")
    expect("base pin tamper", lambda inv, rs: inv.update(base_revision="0" * 40), "E_BASE_PIN")
    expect("scope denominator tamper", lambda inv, rs: inv["scope"].update(selected_assets=28), "E_SCOPE")
    expect("expected asset count tamper", lambda inv, rs: inv.update(expected_asset_count=28), "E_SCOPE")
    expect("negative case declaration tamper", lambda inv, rs: inv["negative_case_codes"].pop(), "E_SCOPE")
    expect("selection set tamper", lambda inv, rs: inv["selection"].update(selected_asset_ids_sha256="sha256:" + "0" * 64), "E_SELECTION")
    expect("binding id tamper", lambda inv, rs: inv.update(binding_id="SCF-B-9999"), "E_SCHEMA")
    expect("inventory bundle kind tamper", lambda inv, rs: inv.update(bundle_kind="formal_implementation"), "E_SCHEMA")
    expect("inventory anchor rule tamper", lambda inv, rs: inv["anchor_rule"].update(limit=0), "E_ANCHOR")
    expect("inventory search boundary tamper", lambda inv, rs: inv["search_boundaries"].update(all_ledger_rows=0), "E_BOUNDARY")
    expect("authority boundary tamper", lambda inv, rs: inv["authority_boundary"].update(formal_implementation_claim_updated=True), "E_AUTHORITY_BOUNDARY")
    expect("output digest tamper", lambda inv, rs: inv.update(output_sha256="sha256:" + "0" * 64), "E_OUTPUT_DIGEST", recalc_digest=False)
    expect("inventory top-level key omission", lambda inv, rs: inv.pop("bundle_kind"), "E_SCHEMA")
    expect("inventory top-level key addition", lambda inv, rs: inv.update(fabricated_field=True), "E_SCHEMA")
    print("PASS SCF-B-0122 selfcheck: 34 negative cases")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
