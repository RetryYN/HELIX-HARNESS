---
title: "agent/command taxonomy authority境界"
layer: L6
artifact_type: design
status: draft
created: 2026-09-10
updated: 2026-09-10
owner: Codex / TL
plan: PLAN-RECOVERY-1374-agent-command-taxonomy-slice1
pair_artifact: docs/test-design/helix/L8-agent-command-taxonomy-authority-unit-test-design.md
---

# agent/command taxonomy authority境界

## 目的

active agent/command guidanceをcurrent L1-L12、typed Requirement/NFR policy、分離されたreview・実行authorizationへ
投影する。agent本文を新しい意味正本にはせず、既存authorityのconsumerとして扱う。

## 契約

| 契約 | 対象 | 不変条件 | oracle |
|---|---|---|---|
| current layer投影 | 対象6文書 | L0-L14、G4/G6、L12 deployをcurrent authorityとして案内しない | `U-ACTA-001` |
| authorization分離 | `/ship` | review結果はmerge、release、deployment、runtime admissionを代替しない | `U-ACTA-002` |
| typed threshold | QA、security、deployment agent | 閾値はRequirement/NFR/security policyへtraceし、未定義値は`unknown`とする | `U-ACTA-003` |

## 非対象

agent roster、guard exact set、provider runtime、FE固有agent、残るcommand surfaceは本sliceで変更しない。
