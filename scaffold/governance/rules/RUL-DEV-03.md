---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-DEV-03
group: サービス④開発
product: HARNESS
atoms_primary: 13
atoms_secondary: 3
issue_projection: #1854
---

# RUL-DEV-03（サービス④開発／HARNESS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

追加する前に、不要にできないか、再利用できないか、代替案は無いかを確かめる。複雑さが増える変更は根拠と撤去条件を示す。

## 主として対応づいた規則（13件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RB0-131` | 提案者は採用案に最低一つの対案とtrade-off比較を付ける。 | behavior_discipline | prose | docs/skills/judgment-core.md:58-59 |
| `RB07-199` | 実装者はコードを書く前に要求削除・運用・既存機能・設定・共通化・採用・実装の順に検討し、どこで止まったかをPLANまたは提案冒頭へ一行記録する。 | behavior_discipline | prose | docs/skills/code-minimalism.md:36-56; docs/skills/code-minimalism.md:105-106 |
| `RB08-282` | detector追加者は異なる2件以上の再発、既存gateで検出不能、複雑度の正当化、除去triggerが揃う場合だけ新detectorを追加する。 | process_gate | prose | docs/governance/operations-rule-audit-2026-07-26.md:71-72 |
| `RC01-177` | runtime-portabilityは、許可wrapperが空行・コメント以外で12行を超える、src/cli.ts参照がない、またはdist/helix参照がない場合、不合格にする。 | tooling_runtime | lint | src/lint/runtime-portability.ts:160-165; src/lint/runtime-portability.ts:209-222 |
| `RD00-046` | atomic slice評価は、選択した案より前の却下案について、必要件数の重複しない有効digestがない場合、拒否する。 | evidence_claim | gate | src/runtime/atomic-slice-admission.ts:179-184; src/runtime/atomic-slice-admission.ts:292-292 |
| `RD05-202` | ddd-tdd-rulesは、policy文書にno-code-firstがない場合、違反にする。 | behavior_discipline | lint | src/lint/ddd-tdd-rules.ts:101-101; src/lint/ddd-tdd-rules.ts:354-362 |
| `RD05-216` | ddd-tdd-rulesは、対象PLANのno_code_decisionが許可集合外の場合、違反にする。 | behavior_discipline | lint | src/lint/ddd-tdd-rules.ts:450-457; src/lint/ddd-tdd-rules.ts:557-565 |
| `RD05-218` | ddd-tdd-rulesは、対象PLANのcomplexity_effectがnet_negative・net_neutral・justified_positive以外の場合、違反にする。 | behavior_discipline | lint | src/lint/ddd-tdd-rules.ts:470-470; src/lint/ddd-tdd-rules.ts:575-583 |
| `RD05-219` | ddd-tdd-rulesは、add_codeまたはjustified_positiveを選んだPLANでcomplexity_justificationまたはremoval_triggerに実質的な値がない場合、違反にする。 | behavior_discipline | lint | src/lint/ddd-tdd-rules.ts:584-596 |
| `RE01-152` | 実装者は実装前に既存機能を検索し、再実装より再利用を優先する。専用検索が使えない場合はgrepや設計検索へfallbackし、その事実を記録する。 | behavior_discipline | prose／gate | docs/governance/helix-harness-requirements_v1.2.md:2124-2186 |
| `RE01-271` | 解決策の検討者は、変更しない・削除・設定・再利用・既存修正・追加実装の順に評価してからコードを増やす。 | behavior_discipline | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:550-555 |
| `RE01-274` | 変更者はcodeやCIの純増に理由と削除条件を付け、反復する欠陥または既存検査のgapがないdetector・gateを追加しない。 | behavior_discipline | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:550-555 |
| `RG18-006` | 実装提案者は提案の冒頭で「書く前の7段の問い」のどこで止まったかを1行で宣言する。 | behavior_discipline | prose | docs/skills/judgment-core.md:77-78 |

## 副として対応づいた規則（3件）

`RB06-286`、`RE01-058`、`RE01-273`
