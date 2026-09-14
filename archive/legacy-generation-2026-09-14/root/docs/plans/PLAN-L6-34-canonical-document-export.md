---
plan_id: PLAN-L6-34-canonical-document-export
title: "PLAN-L6-34 (add-design): canonical document export"
kind: add-design
layer: L6
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-11
owner: Codex TL / PO
review_evidence:
  - reviewer: codex-intra-runtime-review
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-11"
    tests_green_at: "2026-06-11"
    verdict: pass
    scope: "PLAN-L6-34 close: canonical document export function contracts, U-DOCEXPORT oracles, PLAN-L7-35 implementation entry, and REVERSE-35 back-fill are present; doctor/review-evidence green."
    worker_model: codex-gpt-5
    reviewer_model: codex-gpt-5-intra-runtime-review
agent_slots:
  - role: tl
    slot_label: "TL - canonical document export design"
generates:
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-00-master.md
  requires:
    - .helix/audit/A-126-canonical-document-export.md
    - docs/research/canonical-document-export-research-2026-06-09.md
    - docs/governance/helix-harness-requirements_v1.2.md
---

# PLAN-L6-34 (add-design): canonical document export（正本ドキュメント export）

## §0 Position

この PLAN は、正本 HELIX documents を spreadsheet / Excel / PPTX outputs へ変換するための L6 entry である。汎用 report-export plan ではない。input scope は concept/planning、requirements、detailed design、PLAN、ADR、test-design documents とする。

## §1 Scope

次の function contracts を設計する:

- source path と section anchors を持つ canonical document structure の parse;
- FR/AC/AT/PLAN/ADR IDs、status、trace、evidence links の保持;
- deterministic な CSV/Markdown/XLSX/PPTX datasets の構築;
- CSV/Markdown の built-in outputs としての render;
- readiness findings による XLSX/PPTX/D2 renderers の gate;
- generated artifacts の derived `document_export_*` projection rows としての記録。

## §2 Inputs

- Requirements §6.8.11.
- Physical-data §9.7.
- ADR-002 A-126 addendum.
- A-126 audit と research memo。

## §3 関数契約

function contracts は `function-spec.md` の "Canonical Document Export Addendum" に記録する:

- `parseCanonicalDocumentStructure`
- `buildDocumentExportDataset`
- `renderDocumentExport`
- `recordDocumentExportArtifact`

## §4 テスト設計

L7 pair artifact は U-DOCEXPORT-001..012 を追加する。これらの oracles は、supported document families、source anchor preservation、deterministic dataset generation、redaction、built-in CSV/Markdown render、optional XLSX/PPTX readiness、projection rows、generated artifact boundary、stale source detection を対象にする。

## §5 ワークフローガード

PLAN-L7-35 が TDD Red entry を持ち、PLAN-REVERSE-35 を要求するまで、document export の source implementation は承認されない。

## §8 DoD

- [x] L6 function signatures を記録済み。
- [x] U-DOCEXPORT unit oracles を L7 unit test design に追加済み。
- [x] L7 implementation PLAN references this PLAN.
- [x] implementation back-fill 用の Reverse pairing PLAN が存在する。

Status は `confirmed`: L6 entry、L7 oracle coverage、confirmed L7 implementation route、Reverse pairing が存在する。Office-format rendering は引き続き renderer readiness と later workflow evidence によって gate される。
