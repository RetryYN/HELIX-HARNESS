---
canonical_vmodel: L1-L12
candidate_layer: L1
canonical_pair: L12
title: "責務中心Learning System要求"
layer: L1
kind: redesign
status: draft_candidate
authority_status: approved_pending_canonical_promotion
approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1384#issuecomment-5544537975"
created: 2026-09-02
updated: 2026-09-06
owner: PO / Codex TL
plan: PLAN-L3-80-responsibility-centric-learning-system
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
next_pair_freeze: L12_after_po_approval
---

# 責務中心Learning System要求

- 文書ID: `HELIX-RCLS-BRQ-001`
- Behavior Contract: `RESPONSIBILITY-CENTRIC-LEARNING-001`
- 主Issue: `#1384`

## 要求

### RCLS-BR-001 責務を学習主体にする

Requirement、Design、Runtime、GitHub、CI、Security、Release、Provider、Recovery等のstableな`responsibility_id`が、経験、反例、検証済み知識のprimary ownerになる。folder、文書、agent persona、skill名をownerにしない。

### RCLS-BR-002 Vモデルと運用事実を学習入力にする

学習入力を`CASE`、`SCENE`、`PATTERN`、`LOG`と横断検証`VERIFY`へ分離し、artifact class、責務、case、revisionへ束縛する。相関を因果へ、自己評価を独立検証へ昇格しない。

### RCLS-BR-003 必要最小限の知識だけを供給する

Assignmentごとに責務、案件、scene、risk、provider、task class、context budgetへ適合する最小packetを決定的にcompileする。全Skill、全memory、全failure logを一括注入しない。

### RCLS-BR-004 知恵を段階的に仕組みへ昇格する

project-local knowledgeから独立検証、cross-project検証、shadow enforcementを経たものだけをMechanismへ昇格する。機械化後は同じ規則をSkill proseへ重複保持しない。

### RCLS-BR-005 学習の失効と隔離を保証する

反例、authority revision、provider/model/version変更、expiry、security／license条件によりqualificationをstale、contradicted、revoked、revalidation requiredへ戻せる。

### RCLS-BR-006 既存authorityを奪わない

Learning SystemはRequirement、Design、merge、releaseを直接変更せず、proposal、evidence、retrieval packetを提供する。Requirement Discovery、UIL、System Synthesis、Pattern Promotion、HELIX-Bench、Resident Laneを再実装しない。

本candidateはplan固有承認とcanonical promotionまでcurrent authorityへ加算しない。
