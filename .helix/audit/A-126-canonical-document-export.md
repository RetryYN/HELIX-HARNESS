# A-126 canonical document export の audit

日付: 2026-06-09
Context: ユーザーは、必要な scope が requirements、planning/concept、detailed design、PLAN、ADR、test-design docs などの canonical documents を、人間 review 用の spreadsheet / Excel / PPTX outputs へ変換することだと明確化した。

## Current state の整理

A-124 と A-125 は relation graphs、diagram exports、MCP/test profiles、normalized evidence を scope している。一方で、canonical HELIX documents を spreadsheet/Excel/PPTX formats へ変換することはまだ定義していない。

現在の canonical documents は Markdown と structured project docs のままである。これは source of truth として正しいが、sortable requirement matrices、detailed design workbooks、presentation decks を必要とする人間には弱い。

## Research evidence の記録

詳細な source URLs と selection matrix は `docs/research/canonical-document-export-research-2026-06-09.md` に記録済み。

Primary/official sources は以下を確認した:

- ExcelJS: TypeScript definitions 付きで Node/browser の Excel workbook read/write/manipulation を扱う。
- SheetJS CE: broad JavaScript spreadsheet format support を提供する。
- PptxGenJS: JavaScript/TypeScript OOXML PowerPoint generation を扱う。
- D2 exports: PPTX を含む diagram export を扱う。

## Decision

Canonical document export は in scope だが、生成される Office/spreadsheet files は **derived artifacts** であり、source-of-truth documents ではない。

core path は以下:

1. canonical docs を structured document projection へ parse する。
2. source path、section ID、FR/AC/AT/PLAN/ADR IDs、status、trace、evidence links を保持する。
3. その structure から spreadsheet/deck datasets を build する。
4. Redact before rendering.
5. 既定では built-in CSV / Markdown summary outputs を render する。
6. XLSX / PPTX は readiness evidence を持つ optional adapter profiles 経由でのみ render する。
7. generated artifacts を source digest と redaction profile 付きで DB projection rows に記録する。

## Back-propagation decision の記録

`backprop_decision`: `requires_requirement_backprop`

Reason: この request は requirements、concept/planning、detailed design、PLAN、ADR、test-design documents の accepted conversion surfaces を変える。requirements、DB projection、workflow triggers、L6 function contracts、L7 oracles、future gate/handover usage に影響する。

## Changes

- canonical document export のため requirements §6.8.11 を追加。
- physical-data §9.7 projection tables と invariants を追加。
- Add ADR-002 A-126 addendum.
- IMP-126 backlog row を追加。
- A-126 を existing FR bundle extension として L1/L3 functional requirements へ back-propagate。
- future implementation のため L6/L7/Reverse PLAN route を追加。

## 残作業

future implementation は、以下の source changes 前に L7 TDD Red を作成する必要がある:

- `helix export docs --kind requirements|concept|design|plan|adr|test-design --format csv|md|xlsx|pptx`
- canonical document parser / export dataset builder を作成する
- document conversion の redaction policy
- optional ExcelJS / SheetJS / PptxGenJS / D2 PPTX renderer probes を整備する
- `document_export_*` projection rows の DB collector/rebuild
