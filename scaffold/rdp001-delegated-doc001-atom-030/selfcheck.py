#!/usr/bin/env python3
"""候補atomが要求採用・実装完了へ昇格していないことの否定確認。"""

from __future__ import annotations

from collections import Counter
from copy import deepcopy
import json
from pathlib import Path

from validate import check


ROOT = Path(__file__).resolve().parents[2]
CANDIDATE = ROOT / "scaffold/rdp001-delegated-doc001-atom-030/inventory.json"
EXPECTED_KIND_COUNTS = {
    "requirement": 19,
    "relation": 29,
    "layout": 12,
    "metadata": 7,
    "constraint": 5,
    "acceptance": 3,
    "premise": 1,
}


def run_negative(name: str, mutate, expected: str) -> None:
    candidate = json.loads(CANDIDATE.read_text(encoding="utf-8"))
    binding_path = ROOT / "scaffold/bindings/SCF-B-0032.json"
    binding = json.loads(binding_path.read_text(encoding="utf-8"))
    mutate(candidate, binding)
    errors = check(candidate, binding=binding)
    if not any(expected in error for error in errors):
        raise SystemExit(f"FAIL: {name}: validator did not reject mutation\n" + "\n".join(errors))
    print(f"PASS: {name}")


def main() -> int:
    candidate = json.loads(CANDIDATE.read_text(encoding="utf-8"))
    errors: list[str] = []
    if candidate["source_holding"]["holding_granularity"] != "file_blob":
        errors.append("source holdingがfile_blobでない")
    if candidate["atomization"]["file_blob_is_not_single_requirement_atom"] is not True:
        errors.append("file blob単一atom禁止境界が欠落")
    if candidate["legacy_asset"]["implementation_status"] != "unknown":
        errors.append("legacy implementation statusをunknown以外へ昇格")
    if candidate["phase_product_classification"]["degraded_status"] != "unknown_not_structured_in_ledger":
        errors.append("degraded statusを構造化済みへ誤昇格")
    kind_counts = Counter(atom.get("candidate_kind") for atom in candidate["atoms"])
    if kind_counts != Counter(EXPECTED_KIND_COUNTS):
        errors.append(f"candidate_kind counts不一致: {dict(kind_counts)}")
    mutated = deepcopy(candidate)
    mutated["atoms"][0]["candidate_kind"] = "relation"
    if not any("candidate_kind counts不一致" in error for error in check(mutated)):
        errors.append("candidate_kind改変のnegative caseをvalidatorが拒否しない")
    for atom in candidate["atoms"]:
        if atom["authority_vocabulary_relation"]["current_authority_claim"] is not False:
            errors.append(f"authority claim: {atom['semantic_atom_id']}")
        if atom["successor_requirement_ids"]:
            errors.append(f"successor assigned: {atom['semantic_atom_id']}")
    if errors:
        for error in errors:
            print("FAIL", error)
        return 1
    run_negative("source holding ledger digest drift", lambda d, b: d["ledger_provenance"].update({"source_holding_sha256": "0" * 64}), "source_holding_sha256が実ledger digestと不一致")
    run_negative("source holding record count drift", lambda d, b: d["ledger_provenance"].update({"source_record_count": 113}), "source record count不一致")
    run_negative("asset ledger digest drift", lambda d, b: d["ledger_provenance"].update({"asset_ledger_sha256": "0" * 64}), "asset_ledger_sha256が実ledger digestと不一致")
    run_negative("phase ledger digest drift", lambda d, b: d["ledger_provenance"].update({"phase_ledger_sha256": "0" * 64}), "phase_ledger_sha256が実ledger digestと不一致")
    run_negative("selected report digest drift", lambda d, b: d["ledger_provenance"].update({"selected_report_sha256": "0" * 64}), "selected_report_sha256が実ledger digestと不一致")
    run_negative("source holding row digest drift", lambda d, b: d["source_holding"].update({"sha256": "0" * 64}), "candidate source_holding sha256がledgerと不一致")
    run_negative("archive source digest drift", lambda d, b: d["comparison"].update({"source_sha256": "0" * 64}), "source SHA-256不一致")
    run_negative("archive source line count drift", lambda d, b: d["comparison"].update({"source_line_count": 127}), "source bytes/lines分母不一致")
    run_negative("fixed source revision drift", lambda d, b: d["comparison"].update({"source_commit": "0" * 40}), "source commitがorigin/main revisionと不一致")
    run_negative("source span omission", lambda d, b: d["atoms"][0]["source_span"].update({"start_line": 2}), "source line coverage欠落")
    run_negative("source span duplication", lambda d, b: d["atoms"].__setitem__(1, deepcopy(d["atoms"][0])), "source line coverage欠落")
    run_negative("owner candidate Web injection", lambda d, b: d["atoms"][0]["owner_candidates"].append("HELIX-Web"), "owner候補がtargetの根拠境界と不一致")
    run_negative("candidate target Web injection", lambda d, b: d["atoms"][0].update({"candidate_target": "HELIX-Web"}), "candidate targetが語彙外")
    run_negative("consumer candidate Web injection", lambda d, b: d["atoms"][0]["consumer_product_candidates"].append("HELIX-Web"), "consumer候補が根拠境界と不一致")
    run_negative("legacy implementation promotion", lambda d, b: d["legacy_asset"].update({"implementation_status": "implemented"}), "legacy asset implementation_status不一致")
    run_negative("degraded status promotion", lambda d, b: d["phase_product_classification"].update({"degraded_status": "resolved"}), "phase/product degraded statusを確定している")
    run_negative("failure status promotion", lambda d, b: d["degraded_and_implementation_boundary"].update({"structured_failure_status": "resolved"}), "implementation boundary structured_failure_statusを確定している")
    run_negative("consumer closure promotion", lambda d, b: d["phase_product_classification"].update({"consumer_closure_status": "closed"}), "phase/product consumer closureを確定している")
    run_negative("phase candidate admission", lambda d, b: d["phase_product_classification"].update({"phase_classification_status": "approved_current"}), "phase/product phase_classification_status不一致")
    run_negative("top meaning change", lambda d, b: d.update({"meaning_change_applied": True}), "候補top-level meaning_change_appliedが境界に反する")
    run_negative("top equivalence claim", lambda d, b: d.update({"equivalence_claim": "equivalent"}), "候補top-level equivalence_claimが境界に反する")
    run_negative("top human decision", lambda d, b: d.update({"human_decision_ref": "decision-1"}), "候補top-level human_decision_refが境界に反する")
    run_negative("top successor assignment", lambda d, b: d.update({"successor_requirement_ids": ["REQ-1"]}), "候補top-level successor_requirement_idsが境界に反する")
    run_negative("atom archive path drift", lambda d, b: d["atoms"][0].update({"archive_path": "archive/other.md"}), "archive_path/source_revision不一致")
    run_negative("atom source revision drift", lambda d, b: d["atoms"][0].update({"source_revision": "0" * 40}), "archive_path/source_revision不一致")
    run_negative("atom current authority promotion", lambda d, b: d["atoms"][0]["authority_vocabulary_relation"].update({"current_authority_claim": True}), "current authority claimを許している")
    run_negative("binding state promotion", lambda d, b: b.update({"state": "active"}), "Scaffold Bindingがregistered scaffoldではない")
    run_negative("archive artifact formal registration", lambda d, b: b["artifacts"].append("archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md"), "archiveまたはcurrent正式artifactがScaffold Bindingへ登録されている")
    run_negative("replacement formal artifact registration", lambda d, b: b["replacement"].update({"formal_artifacts": ["docs/current/formal.md"]}), "正式artifactがScaffold Bindingへ登録されている")
    print("PASS DOC-001 negative boundary: no promotion, successor, implementation, degraded, or current authority claim")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
