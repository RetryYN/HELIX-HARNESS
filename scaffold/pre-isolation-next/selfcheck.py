#!/usr/bin/env python3
"""RDP-001 PREISOLATION 次候補の一時コピー否定例。"""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "scaffold/pre-isolation-next/rdp001-preiso-next-6path.json"
INVENTORY = ROOT / "scaffold/pre-isolation-next/rdp001-preiso-next-semantic-diff-inventory.json"
VALIDATOR = ROOT / "scaffold/pre-isolation-next/validate.py"


def run_case(name, mutate_manifest=None, mutate_inventory=None, expected_text=""):
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    if mutate_manifest:
        mutate_manifest(manifest)
    if mutate_inventory:
        mutate_inventory(inventory)
    with tempfile.TemporaryDirectory(prefix="rdp001-preiso-next-selfcheck-") as directory:
        directory = Path(directory)
        manifest_path = directory / "manifest.json"
        inventory_path = directory / "inventory.json"
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False), encoding="utf-8")
        inventory_path.write_text(json.dumps(inventory, ensure_ascii=False), encoding="utf-8")
        result = subprocess.run(
            [sys.executable, str(VALIDATOR), "--manifest", str(manifest_path), "--inventory", str(inventory_path)],
            cwd=ROOT,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            check=False,
        )
    if result.returncode == 0 or expected_text not in result.stdout:
        raise SystemExit(f"FAIL: {name}\n{result.stdout}")
    print(f"PASS: {name}")


def main() -> int:
    run_case(
        "baseline digest drift",
        mutate_manifest=lambda d: d["paths"][0].update({"baseline_file_sha256": "0" * 64}),
        expected_text="PREISO-REV-000003 holding field不一致: baseline_file_sha256",
    )
    run_case(
        "phase implementation promotion",
        mutate_manifest=lambda d: d["paths"][0]["phase_classification"].update({"legacy_implementation_status": "implemented"}),
        expected_text="PREISO-REV-000003 phase snapshot不一致: legacy_implementation_status",
    )
    run_case(
        "owner collapse",
        mutate_manifest=lambda d: d["paths"][4].update({"product_owner_candidate": "HELIX-HARNESS"}),
        expected_text="PREISO-REV-000007 owner候補不一致",
    )
    run_case(
        "authority promotion",
        mutate_manifest=lambda d: d.update({"authority_effect": "current"}),
        expected_text="manifest authority_effectが固定候補境界と不一致",
    )
    run_case(
        "legacy execution drift",
        mutate_manifest=lambda d: d["comparison"].update({"old_runtime_test_ci_execution": True}),
        expected_text="old_runtime_test_ci_executionはfalseに固定する",
    )
    run_case(
        "missing diff fragment",
        mutate_inventory=lambda d: d["fragments"].pop(),
        expected_text="fragmentsは24件でなければならない",
    )
    run_case(
        "diff hunk span drift",
        mutate_inventory=lambda d: d["fragments"][0]["pre_isolation"].update({"start_line": 43}),
        expected_text="Git diff hunkとinventory spanの集合不一致",
    )
    run_case(
        "classification drift",
        mutate_inventory=lambda d: d["fragments"][0].update({"classification": "provenance", "candidate_kind": "metadata"}),
        expected_text="RDP001-NEXT-DIFF-001 classification／owner不一致",
    )
    run_case(
        "semantic atomization completion claim",
        mutate_inventory=lambda d: d["semantic_atomization"].update({"semantic_atomization_complete": True}),
        expected_text="semantic_atomization semantic_atomization_completeが固定境界と不一致",
    )
    run_case(
        "hunk classification boundary drift",
        mutate_inventory=lambda d: d["fragments"][0].update({"hunk_level_classification_only": False}),
        expected_text="RDP001-NEXT-DIFF-001 hunk_level_classification_onlyはtrue",
    )
    run_case(
        "semantic subunit owner promotion",
        mutate_inventory=lambda d: next(
            f for f in d["fragments"] if f["fragment_id"] == "RDP001-NEXT-DIFF-015"
        )["semantic_subunits"][0].update({"owner_candidate": "HELIX-HARNESS"}),
        expected_text="RDP001-NEXT-SU-015-P0 owner_candidateはunresolved",
    )
    run_case(
        "semantic subunit source grounding drift",
        mutate_inventory=lambda d: next(
            f for f in d["fragments"] if f["fragment_id"] == "RDP001-NEXT-DIFF-022"
        )["semantic_subunits"][0]["source_span"].update({"exact_text": "改竄\n"}),
        expected_text="RDP001-NEXT-SU-022-P6 semantic subunit source grounding exact_text不一致",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
