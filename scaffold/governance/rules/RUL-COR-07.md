---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-COR-07
group: コア
product: HARNESS／OS
atoms_primary: 17
atoms_secondary: 11
issue_projection: none
---

# RUL-COR-07（コア／HARNESS／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

成果物と判断に恒久の識別子を持たせ、改名・移動・分割・統合をしても義務と意味と履歴を保存する。指示の原文は来歴付きで追記のみで保全し、設計判断の後継と廃止を管理する。

## 主として対応づいた規則（17件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RB05-096` | 要求台帳作成者はchatをZIP・旧UTより上位の一次要求sourceとし、独立要求をHC-CHATとして採番して要約から落とさない。 | memory_context | prose | n/a | HC-CHAT要求台帳のsource優先順 | — | docs/governance/infinity-loop-source-capability-ledger.md:25-26 | B05／gpt-6-astra |
| `RB05-099` | chat記録者は同義の再指示も別occurrenceとして原文を残し、非公開のnative event IDやtimestampを台帳sequenceで代用しない。 | memory_context | prose | n/a | CHAT-U occurrence台帳 | — | docs/governance/infinity-loop-source-capability-ledger.md:30-31; docs/governance/infinity-loop-source-capability-ledger.md:86-88 | B05／gpt-6-astra |
| `RB05-197` | user directiveはdisposition前にappend-only intakeへ原文を収載し、原記録のUPDATEを拒否する。 | memory_context | prose | fail_close | 未実装directive custody | — | docs/governance/infinity-loop-system-assertion-cases.md:153-154; docs/governance/infinity-loop-system-assertion-cases.md:159-159 | B05／gpt-6-astra |
| `RB05-297` | stable IDは表示名から手採番せずnamespaceと不変digestから導出し、semantic signatureには入力・出力・副作用・failure・state transitionを含める。 | tooling_runtime | prose | n/a | HSS／HSE／HSA／HSD hash ID | — | docs/governance/infinity-loop-source-atomization-contract.md:191-202 | B05／gpt-6-astra |
| `RB06-019` | 変更者は改名・移動時にimmutable asset_idを維持し、path履歴と参照を更新して移動前後の意味同一性を検証する。 | process_gate | prose | fail_close | asset_id、alias/location history | — | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:206-210 | B06／gpt-6-astra |
| `RB06-020` | 変更者は分割時に親を保持し、全authority・AC・traceを子へ配分して未配分をゼロにし、親をsuperseded_by_splitとして残す。 | process_gate | prose | fail_close | superseded_by_split | — | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:212-215 | B06／gpt-6-astra |
| `RB06-021` | 変更者は統合時に全入力要件・authority・acceptance oracleを保持し、旧assetをsuperseded_by_mergeとして残して同義統合と意図削除を区別する。 | process_gate | prose | fail_close | superseded_by_merge | — | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:217-220 | B06／gpt-6-astra |
| `RB06-041` | 変更者はADRの判断史を保持し、supersede範囲を冒頭または該当decisionへ明記する。 | memory_context | prose | n/a | ADR-010への移行 | — | docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md:236-236 | B06／gpt-6-astra |
| `RB06-073` | 変更者はsplitで全source atomを子へ配分し、mergeで全入力atomとacceptance oracleの包含証拠を残す。 | process_gate | prose | fail_close | — | — | docs/governance/infinity-loop-requirement-definition-ledger.md:29-29 | B06／gpt-6-astra |
| `RB06-150` | 内部renameはstable oracle IDを維持する。 | evidence_claim | prose | fail_close | 未実装DomainModelCatalog | — | docs/governance/infinity-loop-assertion-coverage-ledger.md:108-108 | B06／gpt-6-astra |
| `RB08-098` | ADRを置換する担当者は旧ADRをSupersededにして後継リンクを付け、適用外とする場合は理由を記録する。 | doc_language | prose | n/a | ADR status | — | docs/skills/tech-selection.md:63-64; docs/skills/tech-selection.md:87-87 | B08／gpt-6-astra |
| `RC00-087` | 文書差分検査は、既存文書のdigestが変わったのに新たな改版履歴行がない場合に警告する。 | evidence_claim | gate | warn | 改版・revision・version historyに一致する行を履歴と判定 | `RUL-OSA-06` | src/runtime/document-semantic-diff.ts:112-115; src/runtime/document-semantic-diff.ts:147-155 | C00／gpt-6-astra |
| `RD06-018` | design-coverage lintは、itemのsourceがzip-に2桁または3桁の数字を続ける形式でない場合、失敗させる。 | evidence_claim | lint | fail_close | vmodel-docgen ZIPの文書番号 | — | src/lint/design-coverage.ts:281-286 | D06／gpt-6-astra |
| `RE01-224` | 文書変更者はrename・split等でもimmutable IDとrevisionを管理し、authority・AC・oracle・履歴を保持する。 | memory_context | gate | fail_close | authoring identity lifecycle | — | docs/governance/helix-harness-requirements_v1.3.md:356-356 | E01／claude-opus |
| `RG09-002` | Authoring assetの変更処理は、rename・move・split・merge・supersedeの際に履歴とtyped edgeを失ってはならない。 | memory_context | prose | n/a | Authoring assetのtyped edge | — | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:279-282 | G09／claude-opus |
| `RG10-012` | 文書作成者はbareな未登録IDトークンを本文へ直接記載してはならない。 | behavior_discipline | prose／lint | n/a | upstream-coverage／g3-traceの孤児検出 | `RUL-FRM-08` | docs/governance/gate-design.md:188-188 | G10／claude-opus |
| `RG18-018` | 変更担当者はpublic CLI flagまたは.helix/のfieldをrenameする際、callerと設計文書を更新せずに進めてはならない。 | behavior_discipline | prose | n/a | .helix/ field | `RUL-FRM-06` | docs/skills/refactoring.md:97-98 | G18／claude-opus |

## 副として対応づいた規則（11件）

`RB08-236`、`RE01-017`、`RE01-043`、`RE01-163`、`RE01-199`、`RG08-006`、`RG09-020`、`RG12-006`、`RG14-006`、`RG17-006`、`RG19-008`
