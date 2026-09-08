---
title: "三社レーン動的capacity profile要件"
status: draft_candidate
authority_status: pending_canonical_promotion
version: "0.5.0-candidate"
candidate_layer: L3
owner_issue: 1358
plan_id: PLAN-L3-1358-three-lane-capacity-profile-v05
parent_design: docs/governance/candidates/three-lane-capacity-profile-requests.md
pair_artifact: docs/governance/candidates/three-lane-capacity-profile-acceptance.md
---

# 三社レーン動的capacity profile要件

## Feature契約

### 3L-R-26 Capacity identity separation

`registered_pool_capacity`、`admitted_active_wip`、`in_flight`、`review_inventory`、`merge_inventory`を別fieldで保持する。既存8-slotは製品能力上限であり、provider別pool登録数や常時active数と同一視しない。

### 3L-R-27 Provider-specific pool profile

- `codex_worker_pool`: 定常3、条件付きburst上限5
- `cursor_worker_pool`: 1→2→3の段階canary、成立後は定常3、条件付きburst上限5
- `claude_review_pool`: 定常2。別PRを並列検収し、同一PRの重複reviewを既定にしない

Codex control capacityはCodex worker poolから予約分を分離し、実装量産でfrontier／Recovery／merge admissionを枯らさない。

### 3L-R-28 Dynamic active WIP admission

active WIPはReview Queue、required CI、Merge Train、changed-path conflict、budget／runway、rework率、accepted throughputから決定的に導出する。pool上限をdispatch目標にせず、下流が詰まる場合は新規dispatchへbackpressureする。

### 3L-R-29 Staged expansion and burst

Cursorは実案件1件の正規完走と失敗時回復を確認してから2件、2件での競合・証跡・review・費用が許容範囲なら3件へ拡張する。Codex／Cursorの4〜5件目は、実測capacity、予算、独立review、CI、Merge Trainのadmission成立中だけ一時許可する。Claude第3reviewerはreview queue滞留、待ち時間、rework占有、reviewer稼働率のtyped threshold超過時だけ一時許可する。

### 3L-R-30 Review lease and rework lineage

candidate generationごとにPR単位のreview leaseをexactly once発行する。`CHANGES_REQUESTED`は同一assignment lineageとbranch ownershipへ返す。別worker processへの引継ぎは許すが、新しいassignmentとして履歴を断ち切らない。

### 3L-R-31 JIT synchronization and receipt validity

Merge Train直前のmain同期でcandidate HEADが変わった場合、変更後exact HEADの独立reviewを再取得する。PR寄与bytesの同値性を機械証明する承認済み契約が成立した場合だけreview receiptをcarry-forwardできる。競合解消を作成側または統合ownerへ返し、reviewerがworker branchを直接修正しない。

## 現行authorityとの境界

本候補は現行`3L-R-11`の初期Cursor WIP=2／条件付き3を段階導入値として維持し、その後の定常・burst profileを追加する。`4以上は別承認`という固定的な人間再承認条件は、canonical化時にtyped capacity admissionへ置換する。意味・予算・権限範囲を越える変更だけを人間境界へ戻し、既承認profile内の個別dispatchを毎回人間承認へ送らない。
