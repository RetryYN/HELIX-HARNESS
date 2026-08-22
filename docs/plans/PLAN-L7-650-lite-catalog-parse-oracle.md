---
plan_id: PLAN-L7-650-lite-catalog-parse-oracle
title: "PLAN-L7-650 (impl): Lite catalog の parse 失敗 2 経路を oracle で固定する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-08-22
updated: 2026-08-22
owner: Claude / TL
github_issue_id: 882
behavior_contract_id: DISTRIBUTION-LITE-CATALOG-PARSE-ORACLE-001
responsibility_owner: distribution-lite-profile-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: characterize
legacy_retirement_state: not_applicable
no_code_decision: no_change
ddd_modeling_decision: none
contract_preconditions: "設計 ## 機能契約 が名指しする fail-close 境界 5 つのうち parse 失敗だけ oracle が束縛されておらず、failure code 変異で catalog_invalid だけが survive する"
contract_postconditions: "schema parse 失敗と file 読込／JSON parse 失敗の 2 経路を原因別 fixture で分離し、それぞれ exact failure code catalog_invalid で固定する"
contract_invariants: "実装の振る舞いは変更しない。欠けているのは oracle であって振る舞いではないため src/setup/distribution-profile.ts は無変更とする"
contract_failures: "schema 経路／load 経路の code 差し替え、repoRoot 束縛の脱落、parse 失敗の握りつぶしを U-DISTLITE-005 が red にする"
tdd_red_required: false
tdd_red_waiver_reason: "PR #858 HEAD 36e4a8cb での failure code 変異実測（killed=6 survived=1、Issue #882 本文）を既存 Red とし、未記録 timestamp を捏造しない"
complexity_effect: net_neutral
complexity_justification: "test のみの追加で production code は無変更。設計が名指しする境界に oracle を 1 つ足す"
removal_trigger: "catalog parse 経路が単一化され 2 経路の区別が不要になった時点で fixture を統合する"
parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-manifest.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-profile-manifest-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Forward レーンで回収されない Issue を本レーンで回収する（Issue #882 の Required correction）"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-manifest.md, oracle_id: U-DISTLITE-005, test_path: tests/distribution-profile.test.ts }
agent_slots:
  - { role: qa, slot_label: "QA — 4 mutation の kill と survive 1 件の性質確認" }
  - { role: tl, slot_label: "TL — src 無変更で境界被覆が成立するかの確認" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-650-lite-catalog-parse-oracle.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-lite-profile-manifest-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/distribution-profile.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-642-distribution-lite-profile-manifest.md
  requires:
    - docs/plans/PLAN-L7-642-distribution-lite-profile-manifest.md
  blocks:
    - issue:882
---

# Lite catalog の parse 失敗 2 経路を oracle で固定する

## §背景（実測）

Issue #882 で PR #858 HEAD `36e4a8cb` に対し failure code 7 種の変異を注入した結果。

```
catalog_invalid                : *** SURVIVED ***
profile_duplicate 他 6 種       : KILLED
killed=6 survived=1
```

`catalog_invalid` は 2 経路ある。

```
src/setup/distribution-profile.ts:70   schema parse 失敗（validateDistributionProfileCatalog）
src/setup/distribution-profile.ts:103  file 読込／JSON parse 失敗（loadDistributionProfileCatalog）
```

どちらも実装は正しく fail-close する。**欠けているのは oracle であって振る舞いではない**ため、
本 PLAN は production code を変更しない。

## §工程表 schedule

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | schema 経路の負例 fixture を分離 | null／非 object／必須欠落が exact code で拒否される |
| 2 | 正しい catalog の過検知否定を追加 | 正常入力が `catalog_invalid` を出さない |
| 3 | load 経路の負例 fixture を分離 | catalog 不在／非 JSON／schema 不正の 3 形が拒否される |
| 4 | 変異で検出力を実測 | code 差し替え・束縛脱落・握りつぶしが red になる |
| 5 | L8 へ oracle と実測表を追記 | 設計の fail-close 境界 5 つすべてが束縛される |

## §境界

- `src/setup/distribution-profile.ts` は無変更。振る舞いは既に正しい。
- Lite profile の allowlist / exclusion 内容そのものは扱わない。
- 読込失敗を「schema 不正な catalog」へ差し替える変異は survive するが、結果として
  `catalog_invalid` のままで fail-close が保たれるため oracle の欠落ではない。この区別は
  L8 の実測表へ明記し、5/5 killed と誇張しない。
