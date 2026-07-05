# A-127 external tooling / document export scope completion の audit

日付: 2026-06-09
Status: scoped-complete / implementation-pending の状態

## Scope の整理

この audit は cross-artifact graphing、diagram generation、external MCP/test tooling、workflow triggers、Playwright/UI verification、canonical document conversion の scoping request を close する。

最新のユーザー correction を authoritative とする。必要な document conversion は generic review report export ではない。concept/planning、requirements、detailed design、PLAN、ADR、test-design などの canonical HELIX documents を、人間 review 用の spreadsheet / Excel / PPTX derived artifacts へ変換することである。

この audit は source implementation を許可しない。Runtime implementation には、対応する L7 PLAN、TDD Red evidence、Reverse closure が必要である。

## Requirement breakdown の一覧

| ID | 要件 | Status | Evidence |
|---|---|---|---|
| R1 | Cross-artifact dependency / relation graph scope が定義済み。 | scoped | A-124、requirements section 6.8.9、physical-data section 9.5、ADR-002 A-124、PLAN-L6-31 / PLAN-L7-32 / PLAN-REVERSE-32 |
| R2 | Diagram / visualization output が含まれる。 | scoped | A-124 research、physical-data `diagram_artifacts`、module-drift `exportRelationDiagram`、tool adapter probe route PLAN-L6-33 / PLAN-L7-34 / PLAN-REVERSE-34 |
| R3 | Development plugins/tools は Web evidence 付きで research 済みで、optional adapters として扱う。 | scoped | `docs/research/cross-artifact-graph-tooling-research-2026-06-09.md`、A-124 adapter matrix、tool adapter workflow docs |
| R4 | MCP servers と external test foundations は research 済みで scoped。 | scoped | A-125、`docs/research/mcp-external-verification-profile-research-2026-06-09.md`、requirements section 6.8.10、physical-data section 9.6 |
| R5 | Trigger automation と workflow entry points が定義済み。 | scoped | process docs の `MCP-VERIFICATION-PROFILE-WORKFLOW`、`TOOL-ADAPTER-WORKFLOW`、`CANONICAL-DOCUMENT-EXPORT-WORKFLOW`、requirements trigger tables |
| R6 | Playwright/UI verification が明示的に含まれる。 | scoped | requirements section 6.8.10 は exploratory browser inspection に Microsoft Playwright MCP、deterministic browser tests に Playwright provider 付き Vitest Browser Mode を推奨 |
| R7 | Safety boundaries が定義済み。 | scoped | A-124/A-125/A-126 safety sections、implicit package install なし、readiness evidence まで optional adapters は disabled、raw external outputs は gate truth ではない |
| R8 | 適切な Forward / Reverse route が存在し、unauthorized L7 source implementation は追加していない。 | scoped | A-124/A-125/A-126 の PLAN-L6/L7/REVERSE routes、PLAN-RECOVERY-03 / PLAN-REVERSE-31 overstep recovery |
| R9 | Canonical document conversion は concept/planning、requirements、detailed design、PLAN、ADR、test-design docs を対象に scoped。 | scoped | A-126、research memo、requirements section 6.8.11、physical-data section 9.7、function-spec Canonical Document Export Addendum、L7 U-DOCEXPORT、L8 IT-DOCEXPORT |

## Document export の clarification

Canonical document export は以下を対象にする:

- Concept / planning documents。
- Requirements documents と FR / AC / AT matrices。
- API / DB / contract / module design views を含む detailed design documents。
- PLAN documents と handover-relevant workflow data。
- ADR decision documents。
- Test-design documents と evidence summaries。

生成される CSV / Markdown / XLSX / PPTX files は derived artifacts である。source paths、section IDs、FR / AC / AT IDs、PLAN IDs、ADR IDs、status fields、trace rows、evidence links を保持しなければならない。source of truth になってはならない。

## Completion boundary の整理

上記 evidence が存在する時点で scoping は complete とする。Implementation は pending のまま:

- `helix export docs --kind ... --format ...`
- canonical document parser と export dataset builder
- optional ExcelJS / SheetJS / PptxGenJS / D2 PPTX renderer readiness probes を整備する
- `document_export_*` rows の DB collector
- runtime relation graph と diagram generation
- approved first slice を超える external MCP/test profile execution

この boundary は recovery decision を保つ。design と workflow scope は現時点で強化してよいが、新しい runtime implementation は TDD Red と Reverse closure を伴って L7 へ戻さなければならない。
