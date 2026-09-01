---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "REFACTORING Trigger Policy／RF0 Admission要件"
layer: L3
kind: add-design
status: draft
created: 2026-09-02
updated: 2026-09-02
owner: PO / TL
plan: PLAN-L3-77-refactoring-trigger-authority
parent_design: docs/design/helix/L3-requirements/system-synthesis-requirements.md
pair_artifact: docs/test-design/helix/refactoring-trigger-admission-acceptance.md
next_pair_freeze: L10
refines:
  - SYN-R-03
  - SYN-R-04
  - SYN-R-06
extends:
  - UIL-R-03
  - UIL-R-04
  - UIL-R-07
---

# REFACTORING Trigger Policy／RF0 Admission要件

> 2026-09-02、POの取り込み・最適化指示を受けてdraftを起草した。これはPLAN-L3-77に対する
> G-REQ.L3承認ではない。runtime completion、authority自動write、merge／publish／release／cutoverは別境界に残す。

## 0. authority境界

本capabilityは「何をrefactorするか」ではなく、観測からいつ、どの根拠でRF0 inventoryへ上げるかを閉じる。
UILはsource、normalization、finding、candidateを、System SynthesisはscopeとRF0〜RF6を所有し、最終routeは
Universal Workflow authorityを通す。新route、DB authority、event bus、queueを作らない。

### RTG-R-01 versioned trigger policyの版管理

UILで正規化されたeventとfindingからRF0候補を導出する規則を、version、authority digest、source／detector identity、
baseline revision、比較演算、threshold source、観測window、minimum sample、hysteresis、cooldown、expiry、severity、
counterevidence、unknown dispositionへ束縛する。source registryの定義を複製せず、policy値をruntimeへ重複hardcodeしない。

### RTG-R-02 trigger分類と測定境界

invariant違反、再発、metric budget超過、悪化傾向、structural drift、release boundary、provider change、
scheduled safety-netを別trigger identityとして扱う。LOC、file size、Issue数、AI評価、単一瞬間値だけでは候補をadmitしない。
蓄積評価はversioned windowとminimum sampleを満たし、lifecycle boundaryは評価契機であって悪化証拠なしにrefactorを強制しない。
scheduled safety-net単独ではsubstantive findingを作らず、評価実施receiptだけを残す。

### RTG-R-03 RF0のadmission境界

UIL candidateからRF0へ渡すadmissionはcandidate／finding／trigger evidenceのexact identityとdigest、source registry、
trigger policy、baseline、primary scopeはexactly one、related scope、semantic parity、route candidate、suppression、
required verification、expiryを保持する。意味変更はREFACTORINGへadmitせずREDESIGN／Requirement Re-entryへ、
実装故障はRECOVERYへ、外部技術driftはTechnology Environment Reconciliationへ送る。unknownを推測配車しない。

### RTG-R-04 scope mappingとauthority pending

現行9 scopeをexact setとし、primary scopeはexactly one、関連影響はrelated scopesへ分離する。複数ownerを一原子変更で
閉じられない候補は分割するかSystem Synthesisへ昇格する。`requirement`／`definition` scopeはIssue #1170のL3/L10が
mainで再freezeされるまで`authority_pending`とし、現行exact setへ暗黙追加しない。

### RTG-R-05 anti-starvationの被覆

current scopeごとにlast evaluated revision、source exact set、policy digest、finding countを持つcoverage receiptを生成する。
期限超過、source欠落、partial scan、stale policyを全scope評価済みとして扱わない。異常なしはterminal `no_action`と混同せず、
「評価済み・substantive findingなし」として候補未生成の事実を保持する。

### RTG-R-06 shadow導入と効果測定

UIL-04〜06がcurrent mainへ到達するまではtrigger evidence、finding、shadow admission projectionに限定し、RF0自動実行、
Issue自動起票、PLAN生成、authority writeを行わない。導入前後でmissed-trigger proxy、false-positive、duplicate candidate、
coverage、finding→RF0 lead time、rework／rollback、CI costを測定し、悪化時はadoptionを確定しない。

## 1. 非対象

- 新しい`REFACTOR_TRIGGER` route、cron自動コード変更、Issue無制限起票、PLAN自動confirm、merge／publish。
- #1037 whole-system plannerのparking解除。
- required verification削除、timeout緩和、threshold操作による見かけ上の改善。
- current9 scopeと#1170提案scopeの無承認統合。
