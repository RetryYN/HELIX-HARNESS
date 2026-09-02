---
canonical_vmodel: L1-L12
candidate_layer: L1
canonical_pair: L12
title: "authority語彙分離要求"
layer: L1
kind: redesign
status: draft_candidate
created: 2026-09-02
updated: 2026-09-02
owner: PO / Codex TL
plan: PLAN-L3-82-authority-vocabulary-separation
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
next_pair_freeze: L12_after_plan_specific_approval
---

# authority語彙分離要求

- 文書ID: `HELIX-AVS-BRQ-001`
- 状態: `draft_candidate / plan固有承認前`
- Behavior Contract: `AUTHORITY-VOCABULARY-SEPARATION-001`

## 要求

### AVS-BR-001 人間authorityを会話解釈から生成しない

相談、質問、仮説、叱責、不満、実況、比喩、作業依頼を、文字列や口調だけで`PO指示`、`PO判断`、承認済みdecisionへ昇格しない。AIの解釈へhuman provenanceを付与しない。

### AVS-BR-002 decisionを半永続authorityへ限定する

`decision`は、将来のarchitecture、authority、責務境界を半永続的に拘束し、ADRまたはversioned decision recordが所有する判断に限定する。

### AVS-BR-003 異なる意味を別identityで保持する

要求・設計・route・model・test・artifactの採択は`selection`、L3 freeze・検収・不可逆actionの認可は`approval`、Issue・PR・finding・proposal・S4の処理結果は`disposition`、validatorやAIの一時的技術評価は`runtime_judgment`として保持する。

### AVS-BR-004 directiveを思考停止の根拠にしない

明示的なrequest／directiveも作業入力であり、requirements、design、ADR、approvalの代替authorityではない。AIは目的、正本、受入条件、可逆性、安全境界、代替案を評価し、`指示だから`を理由に検証を省略しない。

directiveは許可された作業scopeや優先度を与え得るが、実装方式、技術的正しさ、完了、安全性を自動的に確定しない。AIは独立した技術理由と反証可能な検証結果を保持し、指示への服従をrationale、review verdict、completion evidenceとして再利用しない。

### AVS-BR-005 agent間連絡と長期authorityを分離する

harness memoryはTTL付きagent coordination envelopeとtyped pointerだけを運ぶ。decision本文、approval本文、project要求・設計、利用者profileを保存せず、長期authorityは各正本へ置く。

本candidateはplan固有承認とcanonical promotionまでcurrent authority、runtime出力、memory admissionへ加算しない。
