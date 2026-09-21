#!/usr/bin/env python3
"""DELEGATED-DOC/REF atom candidate のread-only否定例。"""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
CANDIDATE = ROOT / "scaffold/delegated-doc-003-028/inventory.json"
VALIDATOR = ROOT / "scaffold/delegated-doc-003-028/validate.py"


def run_case(name: str, mutate, expected_text: str) -> None:
    document = json.loads(CANDIDATE.read_text(encoding="utf-8"))
    mutate(document)
    with tempfile.TemporaryDirectory(prefix="delegated-doc-003-028-selfcheck-") as directory:
        candidate = Path(directory) / "inventory.json"
        candidate.write_text(json.dumps(document, ensure_ascii=False), encoding="utf-8")
        result = subprocess.run(
            [sys.executable, str(VALIDATOR), "--candidate", str(candidate)],
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
        "source holding digest drift",
        lambda document: document["source_documents"][0].update({"sha256": "0" * 64}),
        "DELEGATED-DOC-003 candidate/ledger sha256不一致",
    )
    run_case(
        "reference edge target drift",
        lambda document: document["reference_edges"][0].update({"target_sha256": "0" * 64}),
        "DELEGATED-REF-0303 candidate/ledger record不一致",
    )
    run_case(
        "atom span coverage gap",
        lambda document: document["coverage_spans"].pop(2),
        "coverage_spansは14件でなければならない",
    )
    run_case(
        "original semantic ID gap",
        lambda document: document["atoms"].pop(2),
        "semantic atomsは59件でなければならない",
    )
    run_case(
        "fixed owner target drift",
        lambda document: document["atoms"][0].update({"candidate_target": "HELIX-OS"}),
        "DD328-SEM-GH-FR-001 candidate_targetが固定owner境界と不一致",
    )
    run_case(
        "product boundary source omission",
        lambda document: document["product_boundary"].update({"sources": []}),
        "product boundary source集合不一致",
    )
    run_case(
        "negative ID forgery",
        lambda document: document["negative_conditions"][0].update({"negative_id": "ZZZ-NEG-FAKE"}),
        "negative ID集合不一致",
    )
    run_case(
        "reference linkage atom drift",
        lambda document: document["reference_edge_linkage"].update({"DELEGATED-REF-0303": ["DD328-SEM-GH-AC-001"]}),
        "DELEGATED-REF-0303 linkage atom集合不一致",
    )
    run_case(
        "duplicate source document ID",
        lambda document: document["source_documents"].append(dict(document["source_documents"][0])),
        "source_documentsは重複なし",
    )
    run_case(
        "source commit drift",
        lambda document: document["comparison"].update({"source_commit": "0" * 40}),
        "comparison source_commit不一致",
    )
    run_case(
        "normalized statement placeholder",
        lambda document: document["atoms"][next(index for index, atom in enumerate(document["atoms"]) if atom["original_id"] == "GH-AC-001")].update({"normalized_statement": "acceptance condition GH-AC-001"}),
        "normalized_statementがplaceholder",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
