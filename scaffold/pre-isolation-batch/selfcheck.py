#!/usr/bin/env python3
"""RDP-001 PREISOLATION 次候補のmanifest／inventory否定例。"""
from __future__ import annotations
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "scaffold/pre-isolation-batch/rdp001-preiso-batch-12path.json"
INVENTORY = ROOT / "scaffold/pre-isolation-batch/rdp001-preiso-batch-semantic-diff-inventory.json"
VALIDATOR = ROOT / "scaffold/pre-isolation-batch/validate.py"

def run_case(name, mutate_manifest=None, mutate_inventory=None, expected_text=""):
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")); inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    if mutate_manifest: mutate_manifest(manifest)
    if mutate_inventory: mutate_inventory(inventory)
    with tempfile.TemporaryDirectory(prefix="rdp001-preiso-batch-selfcheck-") as directory:
        d = Path(directory); mp = d / "manifest.json"; ip = d / "inventory.json"
        mp.write_text(json.dumps(manifest, ensure_ascii=False), encoding="utf-8"); ip.write_text(json.dumps(inventory, ensure_ascii=False), encoding="utf-8")
        result = subprocess.run([sys.executable, str(VALIDATOR), "--manifest", str(mp), "--inventory", str(ip)], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, check=False)
    if result.returncode == 0 or expected_text not in result.stdout: raise SystemExit(f"FAIL: {name}\n{result.stdout}")
    print(f"PASS: {name}")

def main() -> int:
    run_case("baseline digest drift", mutate_manifest=lambda d: d["paths"][0].update({"baseline_file_sha256": "0" * 64}), expected_text="PREISO-REV-000009 holding field不一致: baseline_file_sha256")
    run_case("phase implementation promotion", mutate_manifest=lambda d: d["paths"][2]["phase_classification"].update({"legacy_implementation_status": "implemented"}), expected_text="PREISO-REV-000011 phase_classification不一致: legacy_implementation_status")
    run_case("owner collapse", mutate_manifest=lambda d: d["paths"][4].update({"product_owner_candidate": "HELIX-HARNESS"}), expected_text="PREISO-REV-000013 owner候補不一致")
    run_case("authority promotion", mutate_manifest=lambda d: d.update({"authority_effect": "current"}), expected_text="manifest authority_effectが固定候補境界と不一致")
    run_case("legacy execution drift", mutate_manifest=lambda d: d["comparison"].update({"old_runtime_test_ci_execution": True}), expected_text="old_runtime_test_ci_executionはfalseに固定する")
    run_case("missing diff fragment", mutate_inventory=lambda d: d["fragments"].pop(), expected_text="fragments件数不一致")
    run_case("diff hunk span drift", mutate_inventory=lambda d: d["fragments"][0]["pre_isolation"].update({"start_line": 1}), expected_text="Git diff hunkとinventory spanの集合不一致")
    run_case("classification drift", mutate_inventory=lambda d: d["fragments"][0].update({"classification": "provenance", "candidate_kind": "metadata"}), expected_text="RDP001-BATCH-DIFF-001 path／classification不一致")
    run_case("semantic atomization completion claim", mutate_inventory=lambda d: d["semantic_atomization"].update({"semantic_atomization_complete": True}), expected_text="semantic_atomization semantic_atomization_complete不一致")
    run_case("subunit owner promotion", mutate_inventory=lambda d: next(f for f in d["fragments"] if f["fragment_id"] == "RDP001-BATCH-DIFF-002")["semantic_subunits"][0].update({"owner_candidate": "HELIX-HARNESS"}), expected_text="RDP001-BATCH-DIFF-002 review-only subunit境界不一致")
    return 0

if __name__ == "__main__": raise SystemExit(main())
