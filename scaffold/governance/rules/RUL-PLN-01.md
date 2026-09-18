---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 386e4083f1a47c2d09ea75ea774772421a44b6f5dd9eaa331d6ea773cd683ffa
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: 97a9e0a4cfd5999f5178ec13f758ef71c334191aac51ed43c3bb9570bd762784
rule_id: RUL-PLN-01
group: 企画・探索
product: HARNESS
atoms_primary: 5
atoms_secondary: 7
issue_projection: none
---

# RUL-PLN-01（企画・探索／HARNESS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

企画と探索の仮説を検証する。市場や利用者の仮説、機会の比較、利用者調査、探索活動の検証計画と成立条件を示す。

## 主として対応づいた規則（5件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-267` | marketing scoutは市場claimを証拠で裏付け、不確実性を明示し、各仮説に最小検証stepとdecision criteriaを付ける。 | evidence_claim | prose | n/a | — | `RUL-FRM-04` | .claude/agents/pdm-marketing-innovation.md:15-16; .claude/agents/pdm-marketing-innovation.md:24-24 | A／gpt-6-astra |
| `RA-311` | marketing scoutはtarget segment・pain・urgency・差別化・導入摩擦・検証costで市場optionを比較する。 | behavior_discipline | prose | n/a | — | — | .claude/agents/pdm-marketing-innovation.md:22-24 | A／gpt-6-astra |
| `RB06-192` | カタログ設計者は成果物の要否をharness自身のCLI形状ではなく、他製品を開発する土台のmissionで判断する。 | behavior_discipline | prose | n/a | — | — | docs/governance/document-system-map.md:83-83 | B06／claude_review |
| `RD09-098` | proposal-document-coverageは、ux-research-usabilityを期待するシナリオでusability_test_planまたはux_findings_traceがrequired_evidenceにない場合、失敗させる。 | evidence_claim | lint | fail_close | ux-research-usabilityの2必須証跡 | `RUL-OSA-06` | src/lint/proposal-document-coverage-policy.ts:49-49; src/lint/proposal-document-coverage.ts:157-166 | D09／gpt-6-astra |
| `RD09-117` | proposal-document-coverageは、discoveryを期待するシナリオでhypothesisがrequired_evidenceにない場合、失敗させる。 | evidence_claim | lint | fail_close | hypothesis | `RUL-OSA-06` | src/lint/proposal-document-coverage-policy.ts:63-63; src/lint/proposal-document-coverage.ts:157-166 | D09／gpt-6-astra |

## 副として対応づいた規則（7件）

`RB04-055`、`RE01-008`、`RE01-047`、`RE01-173`、`RG19-005`、`RG19-007`、`RG19-009`
