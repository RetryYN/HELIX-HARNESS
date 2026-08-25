---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "skill applicability typed identity authority要件"
layer: L3
kind: add-design
status: draft
created: 2026-08-26
updated: 2026-08-26
owner: PO / Codex TL
plan: PLAN-L3-67-skill-applicability-authority
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
pair_artifact: docs/test-design/helix/skill-applicability-authority-acceptance.md
next_pair_freeze: L10
refines:
  - HR-FR-HIL-02
  - HR-FR-HIL-06
---

# skill applicability typed identity authority要件

## §0 authority境界

skill applicabilityは、skillがどのworkflow identityで候補になれるかを表すrequirements-owned contractである。
workflowの選択、execution policy、worker allocation、skill本文を新しい意味正本として持たない。identityは
`docs/design/helix/L3-requirements/workflow-classification-registry.v1.json`の`target_axis`＋`target_id`だけを参照する。

旧`drive_models`、`applies_drive_models`、`matched_drive_models`はdevelopment style、case-driven model、
workflow modelを畳み込んだ互換入力であり、current identity、DB field、推薦理由、receipt、CLI出力として扱わない。

## SKAPP-FR-001 typed applicability集合

#### SKAPP-R-01 identity参照

各applicability itemは`target_axis`と`target_id`を必須とし、classification registryに存在するexact pairだけを
受理する。名称類似、default Forward、all扱い、別axisの同名IDを推測しない。

#### SKAPP-R-02 軸の非混同

`development_style`、`case_driven_model`、`workflow_model`、`specialist_workflow`、
`specialist_capability`、`specialist_drive`、`execution_mode`を同一enumまたは単一model fieldへ畳み込まない。
Discovery／PoCは`case_driven_model:DISCOVERY_POC`、Production Scrumは
`development_style:PRODUCTION_SCRUM`として独立に指定する。

#### SKAPP-R-03 positive／negative極性

`applicable_identities`と`excluded_identities`を別集合として保持する。同一pairの両極性指定、重複pair、空item、
unknown axis／IDはfail-closeする。未指定をall、Forward、現在選択中styleへ暗黙展開しない。

## SKAPP-FR-002 current projectionと互換隔離

#### SKAPP-R-04 current output

recommendation、DB projection、visualization、JSON／text CLI、review／completion receiptはtyped pairと
classification registry version／digestだけを返す。legacy token、旧field名、変換前identityを再出力しない。

#### SKAPP-R-05 input-only adapter

旧`drive_models`は既存artifactのcompatibility input-only adapterだけが読む。一意変換可能なtokenだけを
requirements-owned exact tableで変換し、source field、normalized token、warningをreceiptへ残す。
`Forward`、`Scrum`、unknown tokenは複数axisまたはscopeを含むため推測せずfail-closeする。

#### SKAPP-R-06 非相殺

compatibility parseの成功で、current applicability欠損、axis mismatch、unknown identity、polarity conflict、
current projection failureを相殺しない。current authoringはtyped pairを必須とする。

## §1 versioned registry

machine-readable正本は
`docs/design/helix/L3-requirements/skill-applicability-registry.v1.json`とする。このregistryはworkflow classification
registryを参照するprojection contractであり、workflow identityを複製・再定義しない。

## §2 移行順

1. 本L3↔L10 authorityとversioned registryをfreezeする。
2. #248でschema、runtime、DB、recommendation、CLI／visualizationをtyped pairへ移行する。
3. legacy adapterをinput-onlyへ隔離し、current outputから旧fieldを撤去する。
4. #322でrecommendable skill 60件をexact backfillする。
5. #243でcurrent authoringからcompletionまでread-after監査する。

## §3 非対象

- #188 switching／routing／allocation本体。
- #635 dynamic workflow guide生成。
- skill本文の品質評価またはHELIX-Bench task適性推定。
- resident lane、provider選択、execution modeの再設計。
