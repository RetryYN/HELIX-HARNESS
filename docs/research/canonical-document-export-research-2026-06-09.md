---
artifact_type: research_memo
status: confirmed
created: 2026-06-09
updated: 2026-06-09
related_audit: .ut-tdd/audit/A-126-canonical-document-export.md
related_requirements: docs/governance/helix-harness-requirements_v1.2.md#6811-canonical-document-export-a-126-2026-06-09
---

# Canonical Document Export 調査メモ

## 対象範囲

このメモは A-126 の Web 調査根拠を記録する調査成果物であり、実装の source of truth ではない。正本の範囲は requirements、physical-data、ADR、PLAN、test-design artifacts に残す。

調査観点:

- concept、requirements、detailed design、PLAN、ADR、test-design docs などの canonical HELIX documents を、人間 review 用の spreadsheet / Excel / PPTX outputs へどう変換すべきか。
- どの output を built-in とし、どの output を optional renderer とすべきか。
- generated files が source of truth にならないようにしつつ、source Markdown/doc artifacts への traceability をどう保つか。

## Source 確認

2026-06-09 に確認した。

| Source | URL | 関連する確認結果 | HELIX 判断 |
|---|---|---|---|
| ExcelJS | https://github.com/exceljs/exceljs | 公式 project は spreadsheet data の read / manipulate / write を行う Excel workbook manager と説明している。TypeScript definitions も提供されている。 | package readiness が証明された場合、structured document matrices、trace tables、multi-sheet design exports の optional XLSX renderer candidate とする。 |
| SheetJS Community Edition | https://docs.sheetjs.com/ | 公式 docs は Excel と他の spreadsheet formats にまたがる JavaScript interface と、幅広い runtime support を説明している。 | file-format compatibility の広さが重要な場合の optional spreadsheet parser/writer candidate とする。 |
| PptxGenJS | https://github.com/beautifulai/PptxGenJS and https://gitbrent.github.io/PptxGenJS/ | 公式 project は JavaScript/TypeScript examples、tables、charts、images、export APIs を使って OOXML PowerPoint presentations を生成する。 | concept、requirements、detailed design、gate、handover deck の optional PPTX renderer candidate とする。 |
| D2 exports | https://www.d2lang.com/tour/exports/ | D2 CLI は PPTX を含む format へ diagrams を export できる。 | architecture/design visuals 向けの optional diagram-to-deck bridge とし、general presentation generator にはしない。 |

## Document 変換マトリクス

| Source document family | Spreadsheet / XLSX view | PPTX view | 備考 |
|---|---|---|---|
| Concept / 企画 | objective、audience、value、constraints、KPI、risks、decisions | executive story、scope、value、roadmap、decision points | stakeholder review に有効。source section IDs を保持する。 |
| Requirements / 要件定義 | FR/AC/AT tables、priority、status、owner、trace targets、acceptance gaps | requirement summary、scope boundaries、risk/decision slides | FR/AC IDs と acceptance text を失ってはならない。 |
| L4-L6 design / 詳細設計 | module/function/API/DB/contract matrices、dependency rows、unresolved carry | architecture/design walkthrough with diagrams and key decisions | source docs と PLANs への backlink を必須にする。 |
| PLAN / workflow | plan metadata、dependencies、DoD、evidence、blockers | plan brief、schedule、risks、gate state | PM/TL review と handover に有効。 |
| ADR / decision docs | decision matrix、alternatives、consequences、follow-ups | decision narrative and tradeoff slides | decision status と date を visible にする。 |
| Test-design / evidence | oracle matrix、GWT rows、green definitions、missing coverage | quality/readiness summary slides | quantitative evidence と qualitative review は separate fields のままにする。 |

## 選定マトリクス

| Export profile | Trigger / 用途 | 価値 | default state | 必須条件 |
|---|---|---|---|---|
| `doc-csv-matrix` | requirements/design/PLAN/test-design table extraction | dependency なしで sort できる baseline。 | built-in、enabled。 | deterministic columns、escaped cells、source path/section per row。 |
| `doc-markdown-summary` | GitHub-readable conversion summary | Office tooling なしで人間が読める。 | built-in、enabled。 | stable section order と source links。 |
| `doc-xlsx-workbook` | multi-sheet requirements/design/trace workbook | filters、frozen headings、source links、review columns を持つ Excel-readable workbook。 | package 宣言まで optional renderer・disabled。 | renderer readiness、bounded sheet names、source digest、redaction profile、artifact hash。 |
| `doc-pptx-deck` | concept/requirements/design/ADR/gate deck | source document structure から narrative slides を生成する。 | package 宣言まで optional renderer・disabled。 | renderer readiness、deck template policy、source digest、redaction profile、artifact hash。 |
| `doc-d2-pptx-diagram` | architecture / relation graph / workflow diagrams in PPTX | presentation output に diagram sources を再利用できる。 | optional renderer。 | D2 readiness、graph/doc snapshot freshness、raw evidence payload の除外。 |

## Workflow 統合

1. canonical documents を source path、section ID、heading、table rows、decisions、trace IDs、status、evidence links を持つ document structure projection へ parse する。
2. その document structure から spreadsheet/deck datasets を build し、generated Office files を scrape して truth へ戻さない。
3. rendering 前に redaction を行う。
4. CSV と Markdown summary exports を built-in baseline outputs とする。
5. XLSX と PPTX renderers は optional adapters とし、availability missing は finding を返す。
6. generated files は source digest と redaction profile 付きで `document_export_artifacts` に記録する。

## 安全・品質ルール

- 将来 human-approved policy が redacted attachment profile を明示的に許可しない限り、raw provider transcripts、credentials、secrets、PII、raw MCP payloads、screenshots、browser traces は export しない。
- すべての export artifact は source document paths、section IDs、renderer、format、path、hash、evidence path を記録する。
- source section IDs / FR IDs / PLAN IDs / ADR IDs は generated spreadsheet/deck output でも見える状態を保つ。
- 大きな exports は silent truncation せず、document family または section で sheets/slides を分ける。
- Office-format generation は packages を implicit install してはならない。
- generated spreadsheets と decks は derived artifacts である。canonical Markdown/docs は source of truth のままにする。

## 残作業

- A-126 requirements、physical-data projection、ADR/backlog/audit、workflow triggers、L6/L7/Reverse route を追加する。
- TDD Red 後に将来の canonical-doc parser/export dataset builders を実装する。
- 後続の L7 PLAN が source changes を承認した場合、ExcelJS / SheetJS / PptxGenJS / D2 PPTX の renderer readiness probes を追加する。
