---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "System Synthesis capability family要件"
layer: L3
kind: add-design
status: confirmed
created: 2026-08-26
updated: 2026-08-26
owner: PO / Codex TL
plan: PLAN-L3-66-system-synthesis-requirements
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/system-synthesis-acceptance.md
next_pair_freeze: L10
refines:
  - HR-FR-HIL-02
  - HR-FR-HIL-05
  - HR-FR-HIL-06
  - HR-FR-HIL-08
---

# System Synthesis capability family要件

> 2026-08-26、POの「新構想でブレイクスルーを起こしてくれ」という採用・推進指示により、
> G-REQ.L3をconfirmedへ昇格した。FUTURE parking解除と外部副作用のaction-binding approvalは別境界として維持する。

## §0 authority境界

System Synthesisは、既存のRequirement IR、Design Registry、Contract Portfolio、Universal Workflow、
verification、Impact CI、event journalを意味接続するarchitecture composition capability familyである。
新しいroute、development style、execution mode、専門職drive、DB authorityではない。`harness.db`は
repo-owned authorityから再構築可能なprojectionに限定する。

`REFACTORING`だけを新しい`specialist_workflow`候補として扱い、既存の`REFACTOR`、
`DESIGN_REFACTOR`、`PERFORMANCE_REFACTOR`、`REDESIGN`、`RETROFIT`、`ADD_FEATURE`、`VERSION_UP`を
同一identityへ畳み込まない。既存#179、#188、#204、#233、#234、#235の契約を再利用し、重複実装しない。

## SYN-FR-001 安定した意味接続graph

要求、検証証拠、設計、workflow、verification、CI、finding、改善候補をstable identityで接続する。

#### SYN-R-01 接続identity

各node／edgeはstable ID、revision、content digest、authority source、trace direction、lifecycleを保持する。
曖昧、欠落、unknown、digest driftをLLM推測で補わずfail-closeする。通知、生成文書、DB rowを意味正本にしない。

#### SYN-R-02 決定的部分合成

次のprojectionを同一入力から決定的に再生成できなければならない。

- requirement → validation candidate
- requirement＋evidence → 設計portfolio候補
- design graph → workflow候補
- workflow＋verification → CI capability集合
- finding → Reverse／Redesign候補
- new capability → replacement候補

LLMは候補と根拠を提案できるが、要求変更、required design／verification／CIの省略、capability retirement、
merge／completionを確定しない。

#### SYN-R-03 project observationとrule promotion

実projectの観測を`observation → candidate → human review → second project → counterexample →
mutation/benchmark → rule candidate → human approval`で昇格する。単一project成功やagent自己評価を
general ruleへ昇格しない。

## SYN-FR-002 REFACTORING専門workflow

#### SYN-R-04 scopeと工程

Refactoring scopeは`object`、`design`、`contract`、`data`、`code_clean`、`verification`、`ci`、
`secure`、`performance`の直交集合とする。正規工程はRF0 inventory、RF1 eligibility、RF2 replacement design、
RF3 atomic execution、RF4 parity/no-degradation、RF5 migration/retirement、RF6 read-afterとする。

#### SYN-R-05 置換lifecycle

capability追加時は比較対象、機能parity、trace、migration、rollbackを評価し、`retain`、`coexist`、
`superseding`、`deprecated`、`retired`のいずれかを証拠付きで選ぶ。年齢、LOC、名称、AIの意見だけで削除しない。

#### SYN-R-06 V-pairとScrumへの束縛

replacementとno-degradation evidenceをL1↔L12からL6↔L7までの該当pairへ束縛する。Production Scrumの
DoDへRefactoring Eligibilityを投影し、非自明なrefactorをfeature PRへ混載しない。

## SYN-FR-003 Impact CI compositionと測定

#### SYN-R-07 影響profile

changed path、requirement、design、workflow、verification、refactor scopeから、固定registryに存在するCI
capability exact setを合成する。unknown／high-riskはfullへfallbackし、main、nightly、release candidateは
full verificationを必須とする。legacy greenでcurrent failureを相殺しない。

#### SYN-R-08 完了測定

completionはLOC減少だけで判定せず、trace completeness、required verification coverage、mutation detection、
rework、rollback readiness、lead time、defect escape、rule promotion精度を測定する。

## SYN-FR-004 将来の合成frontier

#### SYN-R-09 shadow限定の全体計画

whole-system synthesis manifest、minimum necessary optimization、incremental resynthesis、invalidation、semantic diffは
shadow／parked capabilityとする。現行authorityと並走して精度、counterexample、rollbackを測定し、L3人間承認まで
自動変更を行わない。

#### SYN-R-10 HELIX Development Modelの昇格条件

小型判断modelは、rule-based baselineを上回る再現可能なbenchmark、複数project evidence、誤判定分類、
fallback、versioned receiptが揃った後だけ別L3要求として提案できる。model出力を正本や暗黙fallbackにしない。

## §1 非対象

- #188のswitching／routing／allocation本体の再実装。
- #819 resident lane／Notification Fabricの再設計。
- #659 distribution packへの混載。
- current route catalogの再分類。
- requirements／design／verificationを省略するone-shot自動生成。

## §2 実装owner

親Issue #1033の下で#1034〜#1041へ原子的に分割する。FUTUREの#1037はparkedを維持し、NOW childの
main read-afterと測定baselineが揃うまで実装開始しない。
