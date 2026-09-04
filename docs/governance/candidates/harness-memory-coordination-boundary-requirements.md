---
document_id: HELIX-HARNESS-MEMORY-COORDINATION-L3-CANDIDATE
version: 0.1.0
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "harness memory coordination-only境界 要件候補"
owner_issue: 1448
plan_id: PLAN-L3-86-harness-memory-coordination-boundary
parent_design: docs/governance/candidates/harness-memory-coordination-boundary-requests.md
pair_artifact: docs/governance/candidates/harness-memory-coordination-boundary-acceptance.md
refines:
  - HMC-BR-001
  - HMC-BR-002
  - HMC-BR-003
  - HMC-BR-004
  - HMC-BR-005
  - HMC-BR-006
---

# harness memory coordination-only境界 要件候補

## Authority境界

本書は未承認のL3 candidateである。#1449の用語正本、#1188の保持期間責務、既存のL3 memory要件を置換しない。
承認前はruntime、schema、DB、CLI、SessionStart、Requirement IR、current generated documentの意味入力にしない。

## HMC-FR-001 型付きcoordination envelope

- `HMC-R-01`: envelopeは`message_kind`、`source_lane`、`target_lane`、`assignment_id`、`scope_authority`、
  `candidate_head`、`correlation_id`、`causation_id`、`payload_digest`、`ttl`、`ack`、`dedupe_key`、
  `next_fetch_pointer`、`sender_attestation`を持つ。未登録field、長文本文、秘密情報、absolute pathを受理しない。
- `HMC-R-02`: `scope_authority`はIssueまたはPLANのtyped pointerを必要に応じて一つだけ持ち、対象ID、revision、
  repository、digestを正本へ結び付ける。memory本文から対象を推測しない。
- `HMC-R-03`: at-least-once配送、ack、retry、dedupe、TTL、backpressure、dead-letter、消費済み状態を保持するが、
  exactly-once配送を主張しない。受信側の冪等処理を受入条件とする。

## HMC-FR-002 pointer freshnessとauthority非複製

- `HMC-R-04`: 受信側は`next_fetch_pointer`からcurrent assignment／Issue／PLAN／PR／HEAD／leaseを再取得し、
  memoryの表示本文を実行入力または作業正本にしない。
- `HMC-R-05`: pointerのHEAD、branch owner、lease／fence、assignment state、scope digestのいずれかがcurrent値と
  一致しない場合は`stale_coordination`として拒否する。unknown、取得不能、曖昧な対象は成功へ補完しない。
- `HMC-R-06`: memoryはRequirement、Design、ADR、Acceptance、Release、Assignment、PLAN status、progress、lease、
  provider設定、ユーザー嗜好、個人profile、AI解釈、human authority本文の正本にならない。必要な場合は正本へのpointerだけを保持する。

## HMC-FR-003 authority昇格とruntime provenance

- `HMC-R-07`: 相談、質問、仮説、叱責、作業依頼、AI解釈をapproval、decision、directive、completion claimへ変換しない。
  分類と用語は#1449へ接続し、本候補が独自のgeneric decisionを作らない。
- `HMC-R-08`: wrapper session、provider session、runtime、model、origin、sender laneを別fieldで束縛し、`cli-memory`等の
  文字列だけでhuman actor、human approval、cross-agent reviewを成立させない。
- `HMC-R-09`: human authorityを参照する場合は、対象authority ID、typed source locator、source revision／digest、actor、
  observed session、expiry（必要時）を持つ正規receiptへのpointerを要求し、欠落時は`unverified_human_claim`へ隔離する。

## HMC-FR-004 lifecycle、view、再生

- `HMC-R-10`: entry lifecycleは`active`、`consumed`、`expired`、`superseded`、`retracted`、`invalid`、`audit_history`を区別し、
  `superseded`／`retracted`／`invalid`はcurrent resolved view、SessionStart、DB projection、compaction、next actionへ出さない。
- `HMC-R-11`:訂正は旧entryの本文を書き換えず、typed lifecycle transitionと後続entryをappendする。active referenceを追加するだけで
  無効entryをcurrentへ戻してはならない。
- `HMC-R-12`: current resolved view、SessionStart、DB projection、JSONL compactionは、同一HEAD、schema、policy、event setに対して
  同一active exact setとdigestを返す。projection成功前にcontinuation guidanceを公開しない。
- `HMC-R-13`: 同一eventの再送、消費済みentryの再取得、クラッシュ後の再開、期限切れentry、dead-letterからの再試行を決定的に再生できる。

## HMC-FR-005 legacy隔離とprovider境界

- `HMC-R-14`: 既存harness／project memoryを`valid_coordination_pointer`、`project_authority`、`runtime_interpretation`、
  `personalization`、`wrong_plan_provenance`、`retracted`、`audit_history`へ分類し、未分類をcurrentへ流さない。
- `HMC-R-15`: `project_authority`、`personalization`、`runtime_interpretation`、`wrong_plan_provenance`は、履歴を改竄または
  発言の帰属を再解釈せず、current memory view／startup guidance／approval／merge admissionから隔離する。
- `HMC-R-16`: current-planをmemory writeへ暗黙継承しない。PLAN scoped writeは明示PLAN IDと存在／scope／revision照合を要求し、
  cross-PRまたはglobal coordinationは明示的に`plan_id: null`とする。
- `HMC-R-17`: provider native memory、session history、user settingsはshared coordination memoryの入力またはauthorityとして
  扱わない。provider adapterはeffective runtime configurationの検証を別契約へ渡し、暗黙fallbackを作らない。

## HMC-FR-006 機械強制と境界

- `HMC-R-18`: writer、SessionStart、compaction、DB projector、Claude／Codex adapter、doctorは同一のcoordination schema、
  lifecycle、pointer freshness、禁止fieldを検査する。片側だけのgreenを受入しない。
- `HMC-R-19`: memoryからRequirement、Design、ADR、Approval、Release、Assignment、current PLAN statusへ直接書き込む経路を
  作らない。memoryは既存workflowへのtyped pointerを返し、変更は正本のworkflowへrouteする。
- `HMC-R-20`: retention／purgeは#1188へ委譲し、物理削除可能な識別、audit history、backup／restore、PII／secret除去の境界を保持する。
  retention期間そのものを本候補で決定しない。

## 実装slice

| Slice | 責務 |
|---|---|
| HMC-01 | L1/L3/L10 candidate、用語／既存要件との重複監査、#397 admission |
| HMC-02 | typed coordination envelopeとpointer freshness verifier |
| HMC-03 | lifecycle transition、dedupe、TTL、ack、retry、dead-letter、replayを管理する |
| HMC-04 | legacy memory inventory、汚染分類、current view隔離 |
| HMC-05 | writer／SessionStart／DB／compactionのexact-set一致 |
| HMC-06 | Claude／Codex adapter parity、doctor、mutation、#1188接合 |

本candidateの承認前にHMC-02以降のruntime変更を開始しない。既存実装の問題は別のRecoveryとして記録し、候補の存在だけで
現在のgreen／completion claimを再評価しない。
