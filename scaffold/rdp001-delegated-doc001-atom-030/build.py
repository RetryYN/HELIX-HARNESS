#!/usr/bin/env python3
"""DELEGATED-DOC-001 の静的 semantic atom candidate を再生成する。"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
ARCHIVE_REL = "archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md"
SOURCE_REL = "docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md"
SOURCE_COMMIT = "569d7373c32287bbafadeec6043472563937c5c7"
CURRENT_HEAD = "2fa9aca42ff3ffdd5dea9b2186c49ee50db7dc2c"
CURRENT_REF = "origin/main"
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
PHASES = ["PHCAP-01", "PHCAP-06", "PHCAP-16", "PHCAP-18", "PHCAP-19"]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def source_span(lines: list[str], start: int, end: int) -> dict:
    text = "".join(lines[start - 1 : end])
    return {
        "start_line": start,
        "end_line": end,
        "sha256": "sha256:" + sha(text.encode("utf-8")),
        "exact_source_text": text,
    }


def target_meta(target: str) -> tuple[list[str], list[str]]:
    if target == "HELIX-HARNESS":
        return ["HELIX-HARNESS"], ["HELIX-OS"]
    if target == "HELIX-OS":
        return ["HELIX-OS"], []
    if target == "unresolved":
        return ["HELIX-HARNESS", "HELIX-OS"], ["HELIX-OS"]
    return [], []


def build_atom(
    lines: list[str],
    atom_id: str,
    start: int,
    end: int,
    kind: str,
    target: str,
    phase_hint: str,
    normalized: str,
    original_id: str | None = None,
) -> dict:
    owner_candidates, consumers = target_meta(target)
    if target == "unresolved" and kind in {"metadata", "premise"}:
        consumers = []
    return {
        "semantic_atom_id": atom_id,
        "source_document_id": "DELEGATED-DOC-001",
        "source_path": SOURCE_REL,
        "archive_path": ARCHIVE_REL,
        "source_revision": SOURCE_COMMIT,
        "original_id": original_id,
        "source_span": source_span(lines, start, end),
        "candidate_kind": kind,
        "candidate_target": target,
        "owner_candidates": owner_candidates,
        "consumer_product_candidates": consumers,
        "candidate_granularity": "unit" if kind == "requirement" else "connection",
        "normalized_statement": normalized,
        "reference_edge_ids": ["DELEGATED-REF-0303"] if kind == "metadata" else [],
        "legacy_status_ref": "DELEGATED-DOC-001",
        "legacy_status_unconfirmed": True,
        "existing_identity_relations": ["source_holding:file_blob", "preserved_pending_atomization"],
        "retained_meaning": [
            "原文の肯定・否定・停止・証拠・数量・actor・authority条件をsource spanのまま保持する",
            "candidate targetは責務境界からの仮説であり、successor・採否・current authorityを生成しない",
        ],
        "possible_conflicts": [
            "旧文書はHARNESSのnormative contractとOSの実行・登録・projection境界を同時に含み、単一ownerへ確定できない",
            "原文のL1-L12／L3／L5-L12は旧phase候補であり、現行layerの採否を意味しない",
        ],
        "questions": [
            "このatomをHARNESS contract、HELIX-OS execution/projection、またはcross-product connectionのどれへ配置するか",
            "旧phase候補と現行4製品の意味対応を独立review・人間decisionで確定できるか",
            "旧実装・degraded/failure・consumerを要求atomへ結び付ける直接証拠があるか",
        ],
        "legacy_state": {
            "phase_candidates": PHASES,
            "phase_hint": phase_hint,
            "phase_status": "document_level_candidate_not_atom_resolved",
            "implementation_status": "unknown",
            "implementation_evidence_state": "document_present",
            "degraded_status": "unknown",
            "failure_status": "unknown",
            "consumer_status": "pending",
            "consumer_refs": [],
            "decision_status": "missing",
            "asset_disposition": "unresolved",
            "legacy_execution_performed": False,
            "unconfirmed": True,
        },
        "authority_vocabulary_relation": {
            "current_authority_claim": False,
            "status": "per_atom_unassessed",
            "current_parent_context": "Concept v4.1・4対象L1の承認revisionは親境界の証拠であり、この旧atomの採用・successorを成立させない",
        },
        "evidence": [
            "archive exact line span and UTF-8 SHA-256",
            "docs/governance/delegated-requirement-document-source-holding.jsonl:DELEGATED-DOC-001",
            "docs/governance/legacy-asset-disposition.jsonl:LEGACY-ASSET-335176749F6322C3CD8D",
            "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl:LASPH-0439",
        ],
        "successor_requirement_ids": [],
        "meaning_change_applied": False,
        "human_decision_ref": None,
    }


def parse_pipe_row(lines: list[str], line_no: int) -> tuple[str, str]:
    fields = [field.strip() for field in lines[line_no - 1].strip().strip("|").split("|")]
    return fields[0], " | ".join(fields[1:])


def main() -> None:
    archive_path = ROOT / ARCHIVE_REL
    lines = archive_path.read_text(encoding="utf-8").splitlines(keepends=True)
    asset_rows = {row["source_path"]: row for row in read_jsonl(ROOT / "docs/governance/legacy-asset-disposition.jsonl")}
    phase_rows = {row["source_path"]: row for row in read_jsonl(ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl")}
    asset = asset_rows[SOURCE_REL]
    phase = phase_rows[SOURCE_REL]

    atoms: list[dict] = []
    meta = [
        ("DD001-SEM-DOC-001-METADATA", 1, 12, "metadata", "unresolved", "L3", "旧文書frontmatter、authority、pair、confirmed statusを保持する"),
        ("DD001-SEM-DOC-001-INTRO", 13, 16, "metadata", "unresolved", "L3", "文書identityとL3要件文書であることを保持する"),
        ("DD001-SEM-DOC-001-INPUT", 17, 23, "premise", "unresolved", "PHCAP-01/L3", "source family receipt、digest、inventory、差異、裁定履歴を入力証拠として保持する"),
        ("DD001-SEM-DOC-001-DISPOSITION", 24, 34, "constraint", "unresolved", "L3", "三契約、semantic ID、gate、lifecycle、Python/Node境界、旧入力の裁定を分離して保持する"),
        ("DD001-SEM-DOC-001-FR-HEADER", 35, 38, "metadata", "unresolved", "L3", "機能要求と受入IDの表構造を保持する"),
        ("DD001-SEM-DOC-001-MAP-HEADER", 58, 62, "metadata", "unresolved", "L3", "旧HBR-DHからVDH-FRへの対応表の見出しを保持する"),
        ("DD001-SEM-DOC-001-LAYER-HEADER", 92, 96, "metadata", "unresolved", "L1-L12", "Vision Design義務とV字証拠の層別表を保持する"),
        ("DD001-SEM-DOC-001-HYBRID-HEADER", 109, 111, "metadata", "unresolved", "L3", "ハイブリッド経路の見出しを保持する"),
        ("DD001-SEM-DOC-001-COMPLETE-HEADER", 119, 121, "metadata", "unresolved", "L11/L12", "完了式の見出しと式の境界を保持する"),
    ]
    for atom_id, start, end, kind, target, hint, normalized in meta:
        atoms.append(build_atom(lines, atom_id, start, end, kind, target, hint, normalized))

    fr_targets = {
        1: "HELIX-HARNESS", 2: "HELIX-HARNESS", 3: "HELIX-HARNESS", 4: "HELIX-HARNESS",
        5: "HELIX-HARNESS", 6: "HELIX-HARNESS", 7: "HELIX-HARNESS", 8: "unresolved",
        9: "HELIX-HARNESS", 10: "unresolved", 11: "HELIX-HARNESS", 12: "HELIX-HARNESS",
        13: "unresolved", 14: "HELIX-HARNESS", 15: "HELIX-HARNESS", 16: "unresolved",
        17: "unresolved", 18: "unresolved", 19: "HELIX-HARNESS",
    }
    for number in range(1, 20):
        line_no = 38 + number
        original, body = parse_pipe_row(lines, line_no)
        atoms.append(build_atom(
            lines,
            f"DD001-SEM-{original}",
            line_no,
            line_no,
            "requirement",
            fr_targets[number],
            "L3→L5/L6-L7/L10-L12",
            body,
            original,
        ))

    mapping_targets = {
        1: "unresolved", 2: "HELIX-HARNESS", 3: "HELIX-HARNESS", 4: "HELIX-HARNESS", 5: "HELIX-HARNESS",
        6: "unresolved", 7: "unresolved", 8: "HELIX-HARNESS", 9: "HELIX-HARNESS", 10: "HELIX-HARNESS",
        11: "HELIX-HARNESS", 12: "HELIX-HARNESS", 13: "HELIX-HARNESS", 14: "HELIX-HARNESS", 15: "HELIX-HARNESS",
        16: "HELIX-HARNESS", 17: "HELIX-HARNESS", 18: "HELIX-HARNESS", 19: "HELIX-HARNESS", 20: "HELIX-HARNESS",
        21: "unresolved", 22: "unresolved", 23: "unresolved", 24: "unresolved", 25: "HELIX-HARNESS",
        26: "unresolved", 27: "unresolved", 28: "unresolved", 29: "unresolved",
    }
    for number in range(1, 30):
        line_no = 62 + number
        original, body = parse_pipe_row(lines, line_no)
        atoms.append(build_atom(
            lines,
            f"DD001-SEM-MAP-{number:03d}",
            line_no,
            line_no,
            "relation",
            mapping_targets[number],
            "L3",
            f"{original} → {body}",
            original,
        ))

    for layer in range(1, 13):
        line_no = 96 + layer
        fields = [field.strip() for field in lines[line_no - 1].strip().strip("|").split("|")]
        atoms.append(build_atom(
            lines,
            f"DD001-SEM-LAYER-{layer:02d}",
            line_no,
            line_no,
            "layout",
            "HELIX-HARNESS",
            "L1-L12",
            f"{fields[0]}: {fields[1]} ↔ {fields[2]}",
            f"L{layer}",
        ))

    hybrid = [
        ("DD001-SEM-HYBRID-001", 112, 113, "constraint", "HELIX-HARNESS", "development styleを3種からexactly one選択し、各styleのV-pairを保持する"),
        ("DD001-SEM-HYBRID-002", 114, 114, "constraint", "HELIX-HARNESS", "Discovery／PoCをstyleへ混入せずcase-driven modelとして扱う"),
        ("DD001-SEM-HYBRID-003", 115, 116, "constraint", "HELIX-HARNESS", "Design HARNESSを独立layerやstyleではなく対象へ適用するspecialist capabilityとする"),
        ("DD001-SEM-HYBRID-004", 117, 118, "constraint", "unresolved", "旧style名はmigration inputだけに保持しcurrent output・decision・evidenceへ出力しない"),
    ]
    for atom_id, start, end, kind, target, normalized in hybrid:
        atoms.append(build_atom(lines, atom_id, start, end, kind, target, "L3/L6-L12", normalized))

    completion = [
        ("DD001-SEM-COMPLETE-001", 122, 123, "acceptance", "unresolved", "L11/L12", "vision_design_completeの三契約、trace、V-pair、実装receipt、UX evidence、人間authority閉包"),
        ("DD001-SEM-COMPLETE-002", 124, 125, "acceptance", "unresolved", "L11/L12", "scrum_ui_slice_readyのdelta、SR0..SR4、vision backfill、prototype/profile/binding evidence閉包"),
        ("DD001-SEM-COMPLETE-003", 126, 126, "acceptance", "unresolved", "L3/L10", "HBR-DH-001..029のmapping、unmapped、理由付きrejectの全数閉包"),
    ]
    for atom_id, start, end, kind, target, hint, normalized in completion:
        atoms.append(build_atom(lines, atom_id, start, end, kind, target, hint, normalized))

    current_authority_paths = [
        "docs/concept/product-boundary.md",
        "docs/concept/helix-concept-v4.1.md",
        "docs/helix-harness/L1-planning/product-intent.md",
        "docs/helix-os/L1-planning/system-intent.md",
        "docs/helix-web/L1-planning/product-intent.md",
        "docs/helix-web-os/L1-planning/system-intent.md",
        "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md",
    ]
    report_path = ROOT / "scaffold/rdp001-delegated-doc003-unprocessed8/report.json"
    report = json.loads(report_path.read_text(encoding="utf-8"))
    output = {
        "schema": "helix-scaffold-delegated-doc-semantic-atom-candidate.v1",
        "candidate_id": "RDP-001-DELEGATED-DOC-001-ATOM-030",
        "status": "candidate_pending_independent_review",
        "authority_effect": "none",
        "meaning_change_applied": False,
        "successor_requirement_ids": [],
        "human_decision_ref": None,
        "equivalence_claim": None,
        "old_runtime_test_ci_execution": False,
        "comparison": {
            "source_commit": SOURCE_COMMIT,
            "current_head": CURRENT_HEAD,
            "current_ref": CURRENT_REF,
            "method": "read-only Git archive blob bytes; exact line spans and UTF-8 SHA-256",
            "source_document": "DELEGATED-DOC-001",
            "source_path": SOURCE_REL,
            "archive_path": ARCHIVE_REL,
            "source_sha256": sha(archive_path.read_bytes()),
            "source_line_count": len(lines),
            "source_byte_count": len(archive_path.read_bytes()),
            "source_report_observed": {
                "report_lines": report["documents"][0]["lines"],
                "report_bytes": report["documents"][0]["bytes"],
                "report_sha256": report["documents"][0]["source_sha256"],
                "line_count_discrepancy": report["documents"][0]["lines"] != len(lines),
                "disposition": "PR #1964でreportのDOC-001行数が126へ訂正され、archive bytes／SHA／exact line anchorsと一致している",
            },
        },
        "ledger_provenance": {
            "source_holding_path": "docs/governance/delegated-requirement-document-source-holding.jsonl",
            "source_holding_sha256": sha((ROOT / "docs/governance/delegated-requirement-document-source-holding.jsonl").read_bytes()),
            "source_registration": "MPR-SH-DELEGATED-DOC-003",
            "source_record_count": 114,
            "asset_ledger_sha256": sha((ROOT / "docs/governance/legacy-asset-disposition.jsonl").read_bytes()),
            "phase_ledger_sha256": sha((ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl").read_bytes()),
            "selected_report_path": "scaffold/rdp001-delegated-doc003-unprocessed8/report.json",
            "selected_report_sha256": sha(report_path.read_bytes()),
        },
        "source_holding": {
            "source_document_id": "DELEGATED-DOC-001",
            "source_path": SOURCE_REL,
            "archive_path": ARCHIVE_REL,
            "source_declared_status": "confirmed",
            "source_relation": "requirements_v1.3_reference_line_267",
            "holding_granularity": "file_blob",
            "carry_status": "preserved_pending_atomization",
            "meaning_change_applied": False,
            "successor_refs": [],
            "human_decision_ref": None,
        },
        "legacy_asset": {
            "asset_id": asset["asset_id"],
            "asset_class": asset["asset_class"],
            "authority_status": asset["authority_status"],
            "disposition": asset["disposition"],
            "product_target": asset["product_target"],
            "implementation_status": asset["implementation_status"],
            "executability_status": asset["executability_status"],
            "external_effect_status": asset["external_effect_status"],
            "consumer_refs": asset["consumer_refs"],
            "decision_record_ref": asset["decision_record_ref"],
            "reuse_exclusion_class": asset["reuse_exclusion_class"],
        },
        "phase_product_classification": {
            "classification_id": phase["classification_id"],
            "phase_candidates": phase["candidate_phase_targets"],
            "phase_classification_status": phase["phase_classification_status"],
            "product_candidates": phase["candidate_product_targets"],
            "product_classification_status": phase["product_classification_status"],
            "consumer_closure_status": phase["consumer_closure_status"],
            "implementation_evidence_state": phase["implementation_evidence_state"],
            "legacy_implementation_status": phase["legacy_implementation_status"],
            "legacy_execution_performed": phase["legacy_execution_performed"],
            "degraded_status": "unknown_not_structured_in_ledger",
            "unresolved": phase["unresolved"] + ["degraded_status_not_recorded"],
        },
        "product_routing": {
            "approved_product_vocabulary": PRODUCTS,
            "semantic_owner_candidates": {
                "HELIX-HARNESS": "V-model、要求・設計・検証契約、Design HARNESS、進行・完了条件の直接候補",
                "HELIX-OS": "登録・projection・Worker・CI・状態・改善運転のconsumer／connection候補",
                "HELIX-Web": "DOC-001 sourceから直接の固有利用者価値は確認できない。未割当",
                "HELIX-Web-OS": "DOC-001 sourceから直接のservice runtime責務は確認できない。未割当",
            },
            "boundary_status": "candidate_only",
            "owner_decision": "unresolved",
            "current_authority_claim": False,
        },
        "current_authority_evidence": [
            {"path": path, "sha256": sha((ROOT / path).read_bytes())} for path in current_authority_paths
        ],
        "atomization": {
            "atom_count": len(atoms),
            "requirement_atom_count": sum(atom["candidate_kind"] == "requirement" for atom in atoms),
            "relation_atom_count": sum(atom["candidate_kind"] == "relation" for atom in atoms),
            "coverage_status": "complete_source_lines_1_126",
            "coverage_spans": [[1, 12], [13, 16], [17, 23], [24, 34], [35, 38], [39, 57], [58, 91], [92, 108], [109, 118], [119, 126]],
            "unresolved_source_lines": [],
            "file_blob_is_not_single_requirement_atom": True,
        },
        "atoms": atoms,
        "degraded_and_implementation_boundary": {
            "document_lexical_counts_from_pr1964_report": report["documents"][0]["legacy"],
            "structured_implementation_status": "unknown",
            "structured_degraded_status": "unknown_not_recorded",
            "structured_failure_status": "unknown_not_recorded",
            "structured_consumer_status": "pending_no_refs",
            "interpretation": "lexical occurrences in historical prose do not establish implementation, degraded, failure, consumer, or current completion state",
        },
        "unresolved": [
            "human disposition／adoption and successor IDs",
            "atom-level product owner and phase admission",
            "legacy implementation, degraded/failure status, consumer closure",
            "pair acceptance atomization (DELEGATED-DOC-023) and L11/L10 coverage",
            "semantic equivalence with current L2/L11 and any downstream design",
        ],
    }
    out = ROOT / "scaffold/rdp001-delegated-doc001-atom-030/inventory.json"
    out.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {out} atoms={len(atoms)} lines={len(lines)}")


if __name__ == "__main__":
    main()
