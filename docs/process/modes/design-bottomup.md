---
title: "Design elicitation specialist workflow"
status: confirmed
kind: design
authority: docs/governance/helix-harness-requirements_v1.3.md
registry_version: 1.1.4
specialist_workflow: SCREEN_DESIGN
legacy_input: design-bottomup
---

<!-- HELIX:workflow-model-process-authority:v1 axis=specialist_workflow id=SCREEN_DESIGN -->
> **current authority**: `docs/governance/helix-harness-requirements_v1.3.md` (requirements v1.3.13) → registry v1.1.5 → generated projection。`design-bottomup`はcompatibility-only inputであり、workflow modelへ昇格しない。
> **evidence boundary**: screen designのidentity、prototype/no-UI receipt、owner、pair、CIを束縛し、L1-L12へForward再入する。

# Design elicitation specialist workflow（画面設計ヒアリング）

## 1. 目的と境界

既存backend、API、domain event、権限、失敗契約から、未定義のFE要求、screen、interaction、
state、content、analytics obligationを抽出し、Forward設計へ戻す。Add-feature Route Bの
実装先行とは異なり、design-bottomupは設計事実のelicitationを所有し、L7実装を終点にしない。

## 2. 経路

`backend棚卸し → FE要求抽出 → 画面mock → L3/L5/L6へのbackfill
→ 必要時Discovery S0-S4 → Forward降下`

- 体験意味が確定していればL2/L3/L5/L6へ接着する。
- 体験意味、利用者価値、成功条件が不確実ならDiscoveryへ送る。
- UI対象はL2 prototype agreement、非UI対象はcurrent no-UI receiptを要求する。
- L6設計だけ、mockだけ、既存backendの画面化だけでは完了を主張しない。

## 3. 承認境界

inventory、要求候補、設計、oracle draftはAIが自律実行する。PO判断はDiscovery S4または
L2 prototype agreementで体験意味を確定するactionだけに束縛し、通常の設計PR・review・CIを止めない。

## 4. exit条件

1. FE requirementがstable IDでL3へ接着されている。
2. screen mockとprototype agreement、またはcurrent no-UI receiptがある。
3. L2↔L11、L3↔L10、影響するL5↔L8、L6↔L7への次工程が明示されている。
4. 未確定意味はDiscoveryへ、実装deltaはAdd-featureへ明示routingされている。
