#!/usr/bin/env python3
"""SCF-B-0006のread-only否定例。候補JSONを一時変異しvalidatorのfail-closeを確認する。"""
from __future__ import annotations

import copy
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CANDIDATE = ROOT / "scaffold/delegated-doc-008-017/inventory.json"
VALIDATOR = ROOT / "scaffold/delegated-doc-008-017/validate.py"


def run_case(name: str, mutate, expected: str) -> None:
    document = json.loads(CANDIDATE.read_text(encoding="utf-8"))
    mutate(document)
    with tempfile.TemporaryDirectory(prefix="scf-b-0006-selfcheck-") as directory:
        candidate = Path(directory) / "inventory.json"
        candidate.write_text(json.dumps(document, ensure_ascii=False), encoding="utf-8")
        result = subprocess.run([sys.executable, str(VALIDATOR), "--candidate", str(candidate)], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, check=False)
    if result.returncode == 0 or expected not in result.stdout:
        raise SystemExit(f"FAIL: {name}\n{result.stdout}")
    print(f"PASS: {name}")


def atom(document, original_id):
    return next(x for x in document["atoms"] if x["original_id"] == original_id)


def main() -> int:
    run_case("source holding digest drift", lambda d: d["source_documents"][0].update({"sha256": "0" * 64}), "candidate/ledger sha256不一致")
    run_case("parent edge relation drift", lambda d: d["reference_edges"][0].update({"relation_key": "pair_artifact"}), "candidate/ledger record不一致")
    run_case("lossless coverage gap", lambda d: d["coverage_spans"].pop(2), "coverage_spansは9件")
    run_case("FR ID span mutation", lambda d: atom(d, "RDJ-FR-008")["source_span"].update({"exact_source_text": "RDJ-FR-008 altered"}), "RDJ-FR-008 exact_source_text不一致")
    run_case("AC ID deletion", lambda d: d["atoms"].remove(atom(d, "RDJ-AC-012")), "semantic atomsは31件")
    run_case("OS consumer promoted to owner", lambda d: atom(d, "RDJ-FR-010")["owner_candidates"].append("HELIX-OS"), "OS consumerをownerへ混入")
    run_case("phase candidate promoted", lambda d: d["legacy_asset_status"][0]["phase_product_bootstrap"].update({"phase_classification_status": "approved_current"}), "phase phase_classification_status不一致")
    run_case("negative condition deletion", lambda d: d["negative_conditions"].pop(), "negative_conditionsは14件")
    run_case("product boundary broadened", lambda d: d["product_boundary"]["product_owner_candidates"].append("HELIX-OS"), "product boundary候補境界不一致")
    run_case("parent edge boundary removed", lambda d: d["boundary_edges"]["DELEGATED-REF-0341"].update({"status": "closed"}), "REF-0341 parent boundary")
    run_case("generic boundary placeholder", lambda d: atom(d, "RDJ-AUTHORITY-008").update({"normalized_statement": "原文のmetadata／責務境界／停止条件を候補として保持し、採否・実装・完了を生成しない"}), "generic boundary placeholderを拒否")
    run_case("semantic atom ID duplicate", lambda d: atom(d, "RDJ-AC-012").update({"semantic_atom_id": atom(d, "RDJ-FR-012")["semantic_atom_id"]}), "semantic atom ID重複を検出した")
    run_case("product boundary source omission", lambda d: d["product_boundary"]["sources"].pop(), "product boundary source集合が期待3件と不一致")
    run_case("reference linkage reverse mismatch", lambda d: d["reference_edge_linkage"]["DELEGATED-REF-0342"].pop(), "reference_edge_linkageの双方向対応が不一致")
    run_case("negative ID relabel", lambda d: d["negative_conditions"][0].update({"negative_id": "SCF006-NEG-999"}), "negative ID集合不一致")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
