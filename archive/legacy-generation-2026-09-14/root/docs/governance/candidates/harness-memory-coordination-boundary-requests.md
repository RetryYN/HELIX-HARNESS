---
document_id: HELIX-HARNESS-MEMORY-COORDINATION-L1-CANDIDATE
version: 0.1.0
status: draft_candidate
canonical_vmodel: L1-L12
canonical_layer: L1
title: "harness memory coordination-only境界 利用者要求候補"
owner_issue: 1448
plan_id: PLAN-L3-86-harness-memory-coordination-boundary
---

# harness memory coordination-only境界 利用者要求候補

## 位置づけ

本書はPLAN-L3-86の人間承認が記録済みで、独立検収・正本化待ちのL1候補である。harness memoryをエージェント間の有期限な連絡・受渡し・再開通知へ限定する要求を
提案する。要求、要件、設計、受入条件、ADR、長期知識、個人設定、進捗の正本をmemoryへ移す提案ではない。

## 利用者要求

### HMC-BR-001 連絡経路としての共有

利用者は、Codex、Claude、Grok、Cursorその他のruntime間で、assignment、review request、handover、heartbeat、
確認待ちなどの有期限なcoordination情報を、providerに依存しない共有経路で受け渡せなければならない。

### HMC-BR-002 正本への再取得

受信runtimeは通知本文を作業正本として使わず、Issue、PLAN、PR、assignment、lease、HEADなどのtyped pointerから
HELIXの現在値を再取得できなければならない。pointerがstaleまたは不一致の場合は通知を受理してはならない。

### HMC-BR-003 責務境界の保全

利用者は、memoryがproject固有の要求・設計・受入条件・運用規則・ユーザー嗜好・provider native memoryを正本として
保持または投影しないことを確認できなければならない。長期知識は専用のLearning／Skill authorityへ送る。

### HMC-BR-004 誤った権威化の防止

利用者は、相談、質問、仮説、叱責、作業依頼、AIの解釈を、PO authority、ADR decision、human approval、completion
claimへ自動昇格させないことを確認できなければならない。用語の分類は#1449のauthority vocabularyへ従属する。

### HMC-BR-005 再開可能性と履歴保全

利用者は、coordination eventの重複配送、再送、消費、期限切れ、訂正、クラッシュ後の再開を再現できなければならない。
無効記録は監査履歴として保持できるが、current guidanceへ再浮上してはならない。

### HMC-BR-006 provider独立性

利用者は、providerごとのnative memory／session history／user設定がHELIXの共有coordination memoryやauthorityへ
暗黙に混入しないことを確認できなければならない。provider設定の詳細検証は別のProvider Configuration責務へ委ねる。

## 軸の分離

`memory`はknowledge、requirements、design、approval、decision、progress、lease、assignmentの正本の別名ではない。
assignmentやleaseを通知する場合も、正本はharness.db／GitHub／PLANであり、memoryは期限付きpointerを運ぶだけとする。

`lifecycle_disposition`、`input_policy`、`decision`、`selection`、`approval`、`runtime_judgment`の分類は本書で再定義
せず、既存のauthority vocabularyと各正本へ委譲する。

## 非対象

- #1449のauthority語彙そのものの再定義。
- #1188のretention／purge期間の決定。
- #1420のJSON key ordering冪等性の再実装。
- provider native configurationの全項目実装。
- Requirement、Design、ADR、Skill、Knowledge、Release、Assignmentの新しい正本やDBを作ること。
- 独立検収・正本化前の候補をcurrent output、runtime、DB、CLI、SessionStartへ先行投影すること。
