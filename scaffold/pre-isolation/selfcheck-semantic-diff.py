#!/usr/bin/env python3
"""RDP-001 semantic diff inventory のread-only否定例。

一時inventoryだけを変更し、Git blob由来のexact span／digestと分類集計の
改変をvalidatorがfail-closeすることを確認する。repository sourceは変更しない。
"""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
INVENTORY = ROOT / "scaffold/pre-isolation/rdp001-6path-semantic-diff-inventory.json"
VALIDATOR = ROOT / "scaffold/pre-isolation/validate-semantic-diff.py"


def run_case(name: str, mutate, expected_text: str) -> None:
    document = json.loads(INVENTORY.read_text(encoding="utf-8"))
    mutate(document)
    with tempfile.TemporaryDirectory(prefix="rdp001-semantic-diff-selfcheck-") as temporary:
        candidate = Path(temporary) / "inventory.json"
        candidate.write_text(json.dumps(document, ensure_ascii=False), encoding="utf-8")
        result = subprocess.run(
            [sys.executable, str(VALIDATOR), "--inventory", str(candidate)],
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
        "changed fragment digest",
        lambda document: document["fragments"][0]["pre_isolation"].update(
            {"sha256": "sha256:" + "0" * 64}
        ),
        "RDP001-DIFF-001 pre-isolation SHA-256不一致",
    )
    run_case(
        "classification count drift",
        lambda document: document["classification_counts"].update({"provenance": 3}),
        "classification_counts不一致",
    )
    run_case(
        "retained negative span text drift",
        lambda document: document["retained_negatives"][0].update(
            {"exact_text": '    "common_route_identity": true,\n'}
        ),
        "NEG-CLASS-CATALOG-FAIL-CLOSE exact_text不一致",
    )
    run_case(
        "missing git diff hunk inventory fragment",
        lambda document: document["fragments"].pop(6),
        "Git diff hunkとinventory spanの集合不一致",
    )
    run_case(
        "diff scope drift",
        lambda document: document.update({"diff_scope": "whole_commit"}),
        "diff_scopeはselected_source_items_onlyに固定する",
    )
    run_case(
        "owner candidate drift",
        lambda document: document["fragments"][0].update({"product_owner_candidate": "HELIX-OS"}),
        "RDP001-DIFF-001 product_owner_candidateが固定候補と不一致",
    )
    run_case(
        "phase status drift",
        lambda document: document["source_items"][0].update({"phase_authority_status": "candidate_unchanged"}),
        "PREISO-REV-000001 phase_authority_statusが未確認状態と不一致",
    )
    run_case(
        "negative ID drift",
        lambda document: document["retained_negatives"][0].update({"negative_id": "NEG-FAKE"}),
        "retained negative ID集合が固定8件と不一致",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
