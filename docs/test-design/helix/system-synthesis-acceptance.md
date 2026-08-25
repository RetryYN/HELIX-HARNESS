---
title: "HELIX L10 受入テスト設計 — System Synthesis"
canonical_layer_scheme: L1-L12
layer: L10
paired_requirement_layer: L3
artifact_type: test_design
status: draft
created: 2026-08-26
updated: 2026-08-26
owner: QA / Codex TL
plan: PLAN-L3-66-system-synthesis-requirements
pair_artifact: docs/design/helix/L3-requirements/system-synthesis-requirements.md
---

# HELIX L10 受入テスト設計 — System Synthesis

## §0 合否境界

文書生成量や`System Synthesis`文字列の存在では合格にしない。既存authorityからの決定的接続、
identity軸の非混同、negative mutation、FUTUREの非実行を検証する。

## §1 oracle完全一致集合

| AC ID | 対応requirement | 入力／操作 | 合格条件 | negative mutation |
|---|---|---|---|---|
| `SYN-AC-001` | `SYN-R-01` | node／edgeのID、revision、digest、authorityを一件ずつ変異する | exact identityだけを接続する | lexical name一致やLLM推測で接続しない |
| `SYN-AC-002` | `SYN-R-01` | DBを削除してauthorityから再構築する | semantic graphが同じdigestで再現する | DB rowを唯一の正本にしない |
| `SYN-AC-003` | `SYN-R-02` | 同一authority入力を2回合成する | candidate exact setとdigestが一致する | 非決定出力をcurrent projectionにしない |
| `SYN-AC-004` | `SYN-R-02` | required verification／CIをLLM提案から除外する | omissionを拒否する | proposalだけで要求変更／retirementを確定しない |
| `SYN-AC-005` | `SYN-R-03` | 単一projectの成功例をrule候補へ送る | second project、counterexample、mutation、human approvalまでpendingになる | 単発成功をgeneral ruleへ昇格しない |
| `SYN-AC-006` | `SYN-R-04` | 9 scopeとRF0〜RF6を一件ずつ欠落させる | exact scope／phase contractを満たす | unknown scopeやphase skipを拒否する |
| `SYN-AC-007` | `SYN-R-04` | REFACTORINGと既存route identityを同一enumへ置く | specialist workflowとworkflow modelが分離される | route identityの吸収を拒否する |
| `SYN-AC-008` | `SYN-R-05` | 新capabilityと既存候補を比較する | parity／migration／rollback付きlifecycleを返す | age／LOC／名称／AI意見だけのretireを拒否する |
| `SYN-AC-009` | `SYN-R-06` | V-pairまたはScrum DoDからrefactor evidenceを外す | 該当pairとDoDが同じeligibilityを参照する | feature PRへの非自明refactor混載を拒否する |
| `SYN-AC-010` | `SYN-R-07` | unknown／high-risk変更を投入する | full profileへfail-safe fallbackする | empty／legacy profileでcurrent failureを相殺しない |
| `SYN-AC-011` | `SYN-R-07` | main／nightly／release candidateを評価する | full verificationが必須になる | changed-path最適化だけでfullを省略しない |
| `SYN-AC-012` | `SYN-R-08` | LOC減少だけをcompletion evidenceにする | 複数の品質・運用metricを要求する | LOC単独の完了を拒否する |
| `SYN-AC-013` | `SYN-R-09` | whole-system plannerをcurrent write pathへ接続する | shadow receiptだけを生成する | L3承認前のauthority変更を拒否する |
| `SYN-AC-014` | `SYN-R-10` | benchmark不足のmodelを選択する | rule-based baselineとfail-closeを維持する | model出力を正本／silent fallbackにしない |

## §2 量閉じ

- behavior contract: `SYN-FR-001..004` exact 4件。
- supporting requirements: `SYN-R-01..10` exact 10件。
- acceptance: `SYN-AC-001..014` exact 14件。
