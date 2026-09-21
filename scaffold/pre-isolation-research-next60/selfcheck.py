#!/usr/bin/env python3
"""RDP-001 research-premise次候補60 pathの否定例を検証するread-only selfcheck。"""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
VALIDATOR = HERE / "validate.py"
MANIFEST = HERE / "rdp001-preiso-research-next60.json"
INVENTORY = HERE / "rdp001-preiso-research-next60-semantic-diff-inventory.json"


def run_case(label: str, mutate_manifest=None, mutate_inventory=None, expected: str = "") -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    if mutate_manifest:
        mutate_manifest(manifest)
    if mutate_inventory:
        mutate_inventory(inventory)
    with tempfile.TemporaryDirectory(prefix="rdp001-research60-selfcheck-") as tmp:
        manifest_path = Path(tmp) / "manifest.json"
        inventory_path = Path(tmp) / "inventory.json"
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        inventory_path.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        result = subprocess.run(
            [sys.executable, str(VALIDATOR), "--manifest", str(manifest_path), "--inventory", str(inventory_path)],
            cwd=ROOT, capture_output=True, text=True, check=False,
        )
    if result.returncode == 0 or (expected and expected not in result.stdout):
        raise SystemExit(f"FAIL selfcheck: {label}\n{result.stdout}{result.stderr}")
    print(f"PASS {label}")


def main() -> int:
    run_case(
        "baseline file digest drift",
        mutate_manifest=lambda m: m["paths"][0].update(baseline_file_sha256="0" * 64),
        expected="PREISO-REV-000085 holding field不一致: baseline_file_sha256",
    )
    run_case(
        "phase implementation promotion",
        mutate_manifest=lambda m: m["paths"][0]["phase_classification"].update(legacy_implementation_status="implemented"),
        expected="PREISO-REV-000085 phase_classification不一致: legacy_implementation_status",
    )
    run_case(
        "owner promotion",
        mutate_manifest=lambda m: m["paths"][0].update(product_owner_candidate="HELIX-HARNESS"),
        expected="PREISO-REV-000085 owner候補不一致",
    )
    run_case(
        "research candidate promotion",
        mutate_manifest=lambda m: m.update(candidate_kind="adopted_requirement"),
        expected="manifest candidate_kindが固定候補境界と不一致",
    )
    run_case(
        "old execution promotion",
        mutate_manifest=lambda m: m["comparison"].update(old_runtime_test_ci_execution=True),
        expected="old_runtime_test_ci_executionはfalseに固定する",
    )
    run_case(
        "source input digest drift",
        mutate_manifest=lambda m: m["source_input_digests"].update({"docs/governance/pre-isolation-revision-delta-source-holding.jsonl": "0" * 64}),
        expected="manifest source input digest不一致",
    )
    run_case(
        "main freshness gate promotion",
        mutate_manifest=lambda m: m["comparison"].update(base_freshness_gate=True),
        expected="comparison base_freshness_gate不一致",
    )
    run_case(
        "PR1949 overlap scope drift",
        mutate_manifest=lambda m: m["scope"].update(pr1949_unmerged_candidate_source_revision_item_ids=["PREISO-REV-000085"]),
        expected="manifest scope不一致",
    )
    run_case(
        "PR1949 provenance drift",
        mutate_manifest=lambda m: m["comparison"]["pr1949_unmerged_candidate_scope"].update(status="integrated_in_latest_main"),
        expected="prior selected scope不一致",
    )
    run_case(
        "hunk coverage deletion",
        mutate_inventory=lambda i: i["fragments"].pop(),
        expected="fragments件数不一致",
    )
    run_case(
        "hunk span drift",
        mutate_inventory=lambda i: i["fragments"][0]["pre_isolation"].update(end_line=i["fragments"][0]["pre_isolation"]["end_line"] + 1),
        expected="Git diff hunkとinventory spanの集合不一致",
    )
    run_case(
        "hunk classification promotion",
        mutate_inventory=lambda i: i["fragments"][0].update(classification="semantic_atom"),
        expected="RDP001-RESEARCH60-DIFF-001 path／classification不一致",
    )
    run_case(
        "semantic atomization completion claim",
        mutate_inventory=lambda i: i["semantic_atomization"].update(semantic_atomization_complete=True),
        expected="semantic_atomization semantic_atomization_complete不一致",
    )
    run_case(
        "review-only subunit owner promotion",
        mutate_inventory=lambda i: i["fragments"][4]["semantic_subunits"][0].update(owner_candidate="HELIX-HARNESS"),
        expected="RDP001-RESEARCH60-DIFF-005 review-only subunit境界不一致",
    )
    run_case(
        "counterevidence deletion",
        mutate_inventory=lambda i: i["fragments"][0].update(counterevidence=[]),
        expected="RDP001-RESEARCH60-DIFF-001 review boundary／counterevidence欠落",
    )
    print("PASS RDP-001 research-premise next60 selfcheck: 15 negative cases")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
