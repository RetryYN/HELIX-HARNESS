---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "Technology Environment Reconciliation Authority要件"
layer: L3
kind: add-design
status: draft
created: 2026-08-29
updated: 2026-08-29
owner: PO / TL
plan: PLAN-L3-72-technology-environment-reconciliation
refines:
  - TECH-STACK-FR-001
  - WCC-FR-01
  - WCC-FR-05
extends:
  - HR-FR-P4-01
  - HR-FR-P7-01
  - OPS-FR-004
  - OPS-FR-005
  - OPS-FR-006
governed_by:
  - HR-NFR-P8-01
  - HR-NFR-P3-01
pair_artifact: docs/test-design/helix/technology-environment-reconciliation-acceptance.md
next_pair_freeze: L10
---

# Technology Environment Reconciliation Authority要件

## 0. 目的とauthority境界

HELIX外部で独立更新されるAI provider、CLI、SDK、IDE、MCP、GitHub Actions／runner、Node／Python、OS、container、cloud、DB、protocolについて、version差だけでなく設定schema、default、permission、persistent state、hook、sandbox、network、credential、API behaviorの意味変化を継続検出し、HELIXのRequirement、Definition、Contract、安全境界へ再束縛する。

本capabilityは自動最新版追従器ではない。外部技術をHELIXの意味authorityへ昇格せず、provider固有処理はtyped adapterへ隔離する。観測は正本を直接変更せず、Evidence、候補、影響分類、再freeze、再検証を経てbaselineへ昇格する。既存IDとの`refines`／`extends`／`governed_by` edgeはexact解決し、dangling edgeと文書名だけの束縛を拒否する。

## 1. Feature契約

### TER-FR-001 外部技術inventoryと実効baseline

- `TER-R-01 Technology Environment Contract`: stable ID、kind、provider、current/candidate version、support/EOL、source、artifact/config-schema digest、default behavior、HELIX/native responsibility、forbidden overlap、adapter、last verified、trigger、rollback targetを保持する。version/source/support/owner未解決をfail-closeする。
- `TER-R-02 Effective Configuration Attestation`: project/user/managed/env/runtime defaultを含むdeclared config、effective config、runtime probeを分離し、memory、rules、hooks、permission、approval、sandbox、filesystem、network、MCP、credential、session persistence、fallbackをreceiptへ束縛する。HELIXと同一責務のnative機能は隔離までworker admissionを拒否する。

### TER-FR-002 変更検出と定期再検証

- `TER-R-03 Event-driven Detection`: version、schema、default、deprecation、EOL、permission、hook、memory、sandbox、network、credential、API、support policy変化でReconciliation episodeを起動する。changelog文字列だけを証拠にしない。
- `TER-R-04 Periodic Full Reconciliation`: release wave、期間、provider admission更新、障害再発、unknown/stale attestation増加をtriggerに全inventoryを再検証する。周期だけで自動更新しない。

current GitHub Actionsのmutable tag、runner alias、unpinned OS packageは初期reconciliation対象である。是正実装#1185は#270のGitHub Security Admissionと本authorityを共同前提とし、Action full SHA、runner/toolchain effective identity、同一environment再現性を証明する。mutable environmentで得た別世代greenを同一候補の再現証拠へ流用しない。

### TER-FR-003 Semantic DiffとHELIX invariant影響解析

- `TER-R-05 Semantic Diff`: 設定意味、default、permission、persistence、I/O、failure mode、sandbox、network、cost、performance、reproducibility、security、privacy、compatibilityを比較し、version不変のbehavior driftも検出する。
- `TER-R-06 Invariant Impact Graph`: diffをRequirement、Definition、Contract、Workflow、WCC、Security、Memory、CI、Release、Deployment、Runbookへstable IDで接続し、blast radius、stale target、oracle、rollback、human decisionを算出する。名称一致や単一logで確定しない。

### TER-FR-004 候補評価・昇格・巻き戻し

- `TER-R-07 Candidate Lifecycle`: `detected → diffed → classified → attested → shadow_verified → canary_verified → approved → promoted → read_after_verified`を正規遷移とし、`blocked/deferred/rejected/rolled_back`を分離する。段階飛越、artifact/config digest差替え、未検証環境への昇格を拒否する。
- `TER-R-08 Adoption Decision`: `retain/upgrade/pin/replace/deprecate/retire`をsecurity、compatibility、behavior、cost、performance、support、migration、rollback、HELIX invariantの比較Evidenceで決める。high-impact、不可逆、credential、production変更はaction-binding approvalへ止める。

### TER-FR-005 変更分類・戻り先・再Forward

- `TER-R-09 Change Class and Route`: `implementation_ops/definition_review/requirement_change`とworkflow routeを別fieldにする。局所対応は`RETROFIT/REFACTOR/RECOVERY`、責務境界変更は`DESIGN_REFACTOR/REDESIGN`、能力・受入変更はRequirement Discovery/`REDESIGN`へEvidence付きで送る。
- `TER-R-10 Re-entry Contract`: affected layer、base revision、stale target、再freeze条件、Forward再入条件をtyped化する。Requirement変更はL1/L2再整理からL3 compile/freeze、Definition変更は該当L3〜L5とV-pair stale化を経る。旧下流greenで相殺しない。

### TER-FR-006 Maintenance、doctor、完了証拠

- `TER-R-11 Maintenance Obligation`: next review、support/deprecation期限、再attestation条件、owner、Evidenceを生成し、期限切れ、unknown config surface、schema drift、native fallback再出現をdoctorでsurfaceする。
- `TER-R-12 Completion Evidence`: effective config、runtime probe、shadow/canary、全影響oracle、independent review、rollback readiness、main/DB/provider runtime read-after一致後だけbaselineを更新する。secret、PII、個人absolute path、raw credentialを保存しない。

## 2. 標準循環

```text
Inventory / Current Baseline
  → Change Detected or Periodic Review
  → Semantic Diff
  → HELIX Invariant Impact
  → Change Class + Workflow Route
  → Candidate Attestation
  → Shadow / Canary
  → Approval
  → Promotion
  → Runtime Read-after
  → New Baseline

重大なcurrent drift
  → RECOVERY / INCIDENT
  → containment / diagnosis
  → typed re-entry
  → re-freeze
  → Forward
```

## 3. 責務分割

| Slice | Issue | 責務 |
|---|---:|---|
| TER-01 | #1175 | 技術環境契約／inventory／状態機械 |
| TER-02 | #1176 | Claude/Codex Effective Configuration Attestation。#1172を統合 |
| TER-03 | #1177 | event検出／定期reconciliation／semantic diff |
| TER-04 | #1178 | invariant影響／変更分類／route／re-entry |
| TER-05 | #1179 | shadow／canary／昇格／rollback計画 |
| TER-06 | #1180 | MaintenanceObligation／doctor／read-after証拠 |
| TER-07 | #1181 | HELIX self-dogfood E2E |

依存順はTER-01→02→03→04→05→06→07とする。既存Technology Stack Authority、WCC、Product Lifecycle Operations、System Synthesisを再利用し、別DB正本、別workflow分類、provider固有Coreを作らない。

#1185はTERの新しいCore sliceではなく、confirmed security requirementとcurrent workflowの矛盾を閉じる初期consumerである。Bootstrap Trust Root #1186、Repository Authority DR #1187、retention/purge #1188は#1184が所有し、本authorityへ混載しない。

## 4. 非対象

- 最新版の無条件自動導入。
- provider公式control plane、monitoring、package managerの再実装。
- credential値、個人環境全体、raw telemetry収集。
- 観測やAI提案によるRequirement／Definition直接変更。
- 本要件だけを根拠にしたproduction更新、cloud変更、secret rotation、publish/cutover。
