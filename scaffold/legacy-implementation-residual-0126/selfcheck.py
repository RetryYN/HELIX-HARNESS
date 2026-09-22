#!/usr/bin/env python3
"""Expected-code negative selfcheck for SCF-B-0126; no archive code runs."""
from __future__ import annotations

import copy
import importlib.util
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("scf0126_validate", HERE / "validate.py")
if spec is None or spec.loader is None:
    raise RuntimeError("cannot load validator")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
BASE_LEDGER = [json.loads(x) for x in (HERE / "classification-research.jsonl").read_text().splitlines()]
BASE_INV = json.loads((HERE / "inventory.json").read_text())


def run_case(name: str, code: str, mutate_rows=None, mutate_inv=None):
    with tempfile.TemporaryDirectory(prefix="scf-b-0126-") as td:
        root = Path(td)
        ledger = root / "classification-research.jsonl"
        inv = root / "inventory.json"
        rows = copy.deepcopy(BASE_LEDGER)
        inventory = copy.deepcopy(BASE_INV)
        if mutate_rows:
            mutate_rows(rows)
        if mutate_inv:
            mutate_inv(inventory)
        ledger.write_text("".join(json.dumps(r, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for r in rows))
        inv.write_text(json.dumps(inventory, ensure_ascii=False, sort_keys=True, indent=2) + "\n")
        old = (validator.BUNDLE, validator.LEDGER, validator.INVENTORY)
        validator.BUNDLE, validator.LEDGER, validator.INVENTORY = root, ledger, inv
        try:
            try:
                validator.check()
            except AssertionError as exc:
                actual = str(exc).split(":", 1)[0]
                if actual != code:
                    raise AssertionError(f"{name}: expected {code}, got {actual}: {exc}")
            else:
                raise AssertionError(f"{name}: validator unexpectedly passed")
        finally:
            validator.BUNDLE, validator.LEDGER, validator.INVENTORY = old


def remove_row(rows): rows.pop()
def duplicate_row(rows): rows.append(copy.deepcopy(rows[-1]))
def source_blob(rows): rows[0]["source_exact"]["blob"] = "0" * 40
def source_anchor(rows): rows[0]["source_exact"]["semantic_anchor"]["line_text_sha256"] = "sha256:" + "0" * 64
def category(rows): rows[0]["classification"]["category"] = "insufficient_basis"
def product(rows): rows[0]["classification"]["candidate_products"] = ["HELIX-Web"]
def wave_edge(rows): rows[0]["wave_semantic_links"] = [{"wave": 1}]
def phase_status(rows): rows[0]["phase_evidence"]["product_classification_status"] = "approved"
def asset_ledger(rows): rows[0]["legacy_asset_evidence"]["row_sha256"] = "sha256:" + "0" * 64
def legacy_status(rows): rows[0]["legacy_asset_evidence"]["implementation_status"] = "implemented"
def disposition_product(rows):
    rows[0]["legacy_asset_evidence"]["disposition"] = "accepted"
    rows[0]["legacy_asset_evidence"]["product_target"] = "HELIX-OS"
def legacy_consumer(rows): rows[0]["legacy_asset_evidence"]["consumer_refs"] = ["FAKE-CONSUMER"]
def history(rows): rows[0]["legacy_history_failure_consumer"]["failure_consumer_static"]["failure"]["blob"] = "0" * 40
def history_closure(rows): rows[0]["legacy_history_failure_consumer"]["closure_status"] = "closed"
def implementation_evidence(rows): rows[0]["legacy_implementation_shrinkage_evidence"]["implementation_evidence_state"] = "promoted"
def boundary(rows): rows[0]["boundary_evidence"]["product_boundary"]["blob"] = "0" * 40
def authority(rows): rows[0]["authority_effect"] = "approved"
def read_mode(rows): rows[0]["source_exact"]["read_mode"] = "live_worktree"
def input_missing(inv): inv["input_digests"].pop()
def input_duplicate(inv): inv["input_digests"].append(copy.deepcopy(inv["input_digests"][0]))
def input_schema(inv): inv["input_digests"][0]["fabricated"] = True
def scope(inv): inv["scope"] = "filename-only"
def base_pin(inv): inv["base_revision"] = "0" * 40
def output(inv): inv["output_sha256"] = "sha256:" + "0" * 64
def formal_update(inv): inv["formal_update"]["formal_asset_classification_updated"] = True
def inventory_schema(inv): inv["schema_revision"] = 2
def inventory_source_paths(inv): inv["expected_sets"]["source_paths"][0] = "archive/fabricated-source.ts"


CASES = [
    ("target missing", "E_TARGET_SET", remove_row, None),
    ("target duplicate", "E_TARGET_SET", duplicate_row, None),
    ("source blob", "E_OLD_ASSET_SOURCE", source_blob, None),
    ("source anchor", "E_SOURCE_ANCHOR", source_anchor, None),
    ("classification category", "E_CLASSIFICATION", category, None),
    ("classification product", "E_CLASSIFICATION", product, None),
    ("wave edge injection", "E_WAVE_EDGE_SET", wave_edge, None),
    ("phase status", "E_PHASE_STATUS", phase_status, None),
    ("asset ledger", "E_OLD_LEDGER_RECORD", asset_ledger, None),
    ("legacy status promotion", "E_OLD_LEDGER_RECORD", legacy_status, None),
    ("legacy disposition/product resolution", "E_OLD_LEDGER_RECORD", disposition_product, None),
    ("legacy consumer tamper", "E_OLD_LEDGER_RECORD", legacy_consumer, None),
    ("history", "E_HISTORY", history, None),
    ("history consumer closure", "E_HISTORY", history_closure, None),
    ("implementation evidence", "E_IMPLEMENTATION_EVIDENCE", implementation_evidence, None),
    ("boundary blob", "E_BOUNDARY_ANCHOR", boundary, None),
    ("authority promotion", "E_AUTHORITY_PROMOTION", authority, None),
    ("formal update reversal", "E_AUTHORITY_PROMOTION", None, formal_update),
    ("inventory schema", "E_INVENTORY_DECLARATION", None, inventory_schema),
    ("inventory source paths", "E_INVENTORY_DECLARATION", None, inventory_source_paths),
    ("read mode", "E_READ_MODE", read_mode, None),
    ("input missing", "E_INPUT_DIGEST", None, input_missing),
    ("input duplicate", "E_INPUT_DIGEST", None, input_duplicate),
    ("input digest schema", "E_INPUT_DIGEST", None, input_schema),
    ("inventory scope", "E_INVENTORY_DECLARATION", None, scope),
    ("fixed BASE pin", "E_BASE_PIN", None, base_pin),
    ("output digest", "E_OUTPUT_DIGEST", None, output),
]
for name, code, rows, inventory in CASES:
    run_case(name, code, rows, inventory)
print(f"SCF-B-0126 selfcheck: PASS negative_cases={len(CASES)}")
