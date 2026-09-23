#!/usr/bin/env python3
"""Negative checks for SCF-B-0148 fixed-input and classification guards."""
import copy
import hashlib
import json
import tempfile
from pathlib import Path

import validate as v


def expect_code(label, expected, operation):
    try:
        operation()
    except v.ValidationError as exc:
        if exc.code != expected:
            raise SystemExit(f"negative case {label}: expected {expected}, got {exc.code}: {exc}")
        return
    except Exception as exc:
        raise SystemExit(f"negative case {label}: unexpected exception {type(exc).__name__}: {exc}") from exc
    raise SystemExit(f"negative case {label}: mutation was accepted")


if v.validate():
    raise SystemExit("SCF-B-0148 baseline validator failed: " + "; ".join(v.validate()))

rows = v.strict_jsonl_bytes(v.LEDGER.read_bytes(), "classification-research.jsonl")
bootstrap = v.strict_jsonl_bytes(v.git_bytes(v.BASE, v.BOOTSTRAP), "bootstrap")
selected = {row["asset_id"]: row for row in v.selected_bootstrap(bootstrap)}

# Individual semantic guards remain reachable independently of the immutable
# whole-record contract pin.
overlap = copy.deepcopy(rows[0])
candidate = overlap["classification"]["candidate_products"][0]
overlap["classification"]["other_product_assessments"].append({
    "product": candidate,
    "status": "not_assessed_no_direct_support_in_selected_span",
    "reason": "negative mutation",
})
expect_code("product basis/other-assessment overlap", "E_CLASSIFICATION", lambda: v.validate_classification(overlap, selected[overlap["asset_id"]]))

delta = next(copy.deepcopy(row) for row in rows if row["classification"]["direct_counterevidence"])
delta["classification"]["direct_counterevidence"] = []
delta["classification"]["bootstrap_candidate_comparison"]["removed_with_bounded_counterevidence"] = []
expect_code("bootstrap removal without counterevidence", "E_COUNTEREVIDENCE", lambda: v.validate_classification(delta, selected[delta["asset_id"]]))

added = copy.deepcopy(rows[0])
added["classification"]["candidate_products"].append("HELIX-Web")
expect_code("added candidate without basis", "E_CLASSIFICATION", lambda: v.validate_classification(added, selected[added["asset_id"]]))

wrong_category = copy.deepcopy(rows[0])
wrong_category["classification"]["category"] = "direct_candidate_unresolved"
expect_code("category/cardinality mismatch", "E_CLASSIFICATION", lambda: v.validate_classification(wrong_category, selected[wrong_category["asset_id"]]))

changed_union = json.loads(v.INVENTORY.read_text(encoding="utf-8"))
changed_union["current_main_comparison_inputs"]["unique_asset_ids"] = 665
expect_code("resynchronized main union assertion", "E_UNION", lambda: v.validate_main_union(changed_union, rows))

expect_code("duplicate JSON key", "E_JSON", lambda: v.strict_json_bytes(b'{"authority": false, "authority": true}', "duplicate-key-case"))
expect_code("JSONL scalar", "E_TYPE", lambda: v.strict_jsonl_bytes(b'null\n', "scalar-case"))
expect_code("blank JSONL line", "E_JSON", lambda: v.strict_jsonl_bytes(b'{}\n\n', "blank-line-case"))

# Reproduce the review's attack: alter a category, rewrite the record digest,
# manifest ledger digest, and Binding upstream digests together. Code pins must
# still reject the fully resynchronized mutable bundle before it can self-attest.
with tempfile.TemporaryDirectory(prefix="scf-b-0148-selfcheck-") as tmp:
    temp = Path(tmp)
    ledger_path = temp / "classification-research.jsonl"
    manifest_path = temp / "selection-manifest.json"
    inventory_path = temp / "inventory.json"
    binding_path = temp / "SCF-B-0148.json"
    altered = copy.deepcopy(rows)
    target = altered[0]
    target["classification"]["candidate_products"] = []
    target["classification"]["category"] = "formal_product_owner_accepted"
    target["classification"]["product_basis"] = {}
    target["parent_pair"] = None
    target["formal_owner"] = "HELIX-OS"
    ledger_bytes = b"".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")).encode("utf-8") + b"\n" for row in altered)
    manifest = json.loads(v.MANIFEST.read_text(encoding="utf-8"))
    manifest["ledger_sha256"] = hashlib.sha256(ledger_bytes).hexdigest()
    altered_by_id = {row["asset_id"]: row for row in altered}
    for manifest_row in manifest["rows"]:
        source = altered_by_id[manifest_row["asset_id"]]
        manifest_row["category"] = source["classification"]["category"]
        manifest_row["candidate_products"] = source["classification"]["candidate_products"]
        manifest_row["record_sha256"] = v.canonical_sha(source)
    manifest_bytes = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    binding = json.loads(v.BINDING.read_text(encoding="utf-8"))
    for upstream in binding["upstream"]:
        if upstream["path"].endswith("/classification-research.jsonl"):
            upstream["sha256"] = hashlib.sha256(ledger_bytes).hexdigest()
        elif upstream["path"].endswith("/selection-manifest.json"):
            upstream["sha256"] = hashlib.sha256(manifest_bytes).hexdigest()
    ledger_path.write_bytes(ledger_bytes)
    manifest_path.write_bytes(manifest_bytes)
    inventory_path.write_bytes(v.INVENTORY.read_bytes())
    binding_path.write_text(json.dumps(binding, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    errors = v.validate(ledger_path, manifest_path, inventory_path, binding_path)
    if not errors or not errors[0].startswith("E_PIN:"):
        raise SystemExit(f"digest-resynchronized classification attack did not fail on fixed contract pin: {errors}")

print("SCF-B-0148 negative self-check passed: 9 semantic/type guards plus digest-resynchronized ledger/manifest/Binding attack rejected")
