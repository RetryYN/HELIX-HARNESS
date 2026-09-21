#!/usr/bin/env python3
"""RDP-001 PREISOLATION-002 の静的否定例。旧資産は実行しない。"""
from __future__ import annotations

import copy
import json
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
VALIDATOR = HERE / "validate.py"
MANIFEST = HERE / "rdp001-preiso002-atomization.json"
INVENTORY = HERE / "rdp001-preiso002-semantic-atom-inventory.json"

def run_case(label: str, mutate_manifest=None, mutate_inventory=None, expected: str = "") -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    if mutate_manifest:
        mutate_manifest(manifest)
    if mutate_inventory:
        mutate_inventory(inventory)
    with tempfile.TemporaryDirectory(prefix="rdp001-preiso002-selfcheck-") as tmp:
        manifest_path = Path(tmp) / "manifest.json"
        inventory_path = Path(tmp) / "inventory.json"
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        inventory_path.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        result = subprocess.run([sys.executable, str(VALIDATOR), "--manifest", str(manifest_path), "--inventory", str(inventory_path)], cwd=ROOT, capture_output=True, text=True, check=False)
    output = result.stdout + result.stderr
    if result.returncode == 0 or (expected and expected not in output):
        raise SystemExit(f"FAIL selfcheck: {label}\n{output}")
    print(f"PASS {label}")

def main() -> int:
    run_case("pre-isolation exact text drift", mutate_inventory=lambda i: i["atoms"][0]["pre_isolation"].update(exact_text="  registry_source_digest: sha256:bad\n"), expected="inventory pre-isolation exact span不一致")
    run_case("semantic atom promotion", mutate_inventory=lambda i: i["atoms"][0].update(atom_status="accepted", semantic_atom={"statement":"promoted"}), expected="atom promotionを検出")
    run_case("phase candidate promotion", mutate_manifest=lambda m: m["subunits"][0]["phase_classification_snapshot"].update(phase_classification_status="confirmed"), expected="asset／phase snapshot不一致")
    run_case("legacy implementation promotion", mutate_manifest=lambda m: m["subunits"][0].update(legacy_implementation_status="implemented"), expected="implementation／consumer snapshot不一致")
    run_case("consumer closure promotion", mutate_inventory=lambda i: i["atoms"][0].update(consumer_closure_status="closed"), expected="atom consumer_closure_status snapshot不一致")
    run_case("decision absence mutation", mutate_manifest=lambda m: m["subunits"][0]["decision_history"].update(record_count=1), expected="decision historyが該当0件境界と不一致")
    run_case("review-only coverage deletion", mutate_inventory=lambda i: i["atoms"].pop(), expected="8 subunit／atom recordsが揃っていない")
    run_case("parent selected scope drift", mutate_manifest=lambda m: m["scope"].update(selected_source_revision_item_ids=["PREISO-REV-000089"]), expected="selected source ID／path集合不一致")
    run_case("hunk and atom count conflation", mutate_inventory=lambda i: i["semantic_atomization"].update(semantic_atom_count=8), expected="semantic_atomization semantic_atom_count不一致")
    run_case("old execution promotion", mutate_manifest=lambda m: m["comparison"].update(old_runtime_test_ci_execution=True), expected="comparison old_runtime_test_ci_execution不一致")
    run_case("holding snapshot drift", mutate_manifest=lambda m: m["subunits"][0]["source_holding_snapshot"].update(meaning_change_applied=True), expected="source holding snapshot不一致")
    run_case("negative case deletion", mutate_inventory=lambda i: i["retained_negatives"].pop(), expected="negative case集合不一致")
    print("PASS RDP-001 PREISOLATION-002 selfcheck: 12 negative cases")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
