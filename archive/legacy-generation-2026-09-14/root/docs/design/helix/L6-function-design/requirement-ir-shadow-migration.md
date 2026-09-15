---
title: "Requirement IR shadow migration機能設計"
layer: L6
kind: add-design
status: draft
created: 2026-07-30
updated: 2026-07-30
owner: Codex / TL
plan: docs/plans/PLAN-L6-89-requirement-ir-shadow-migration.md
parent_design: docs/design/helix/L5-detail/requirement-translation-obligation.md
pair_artifact: docs/test-design/helix/L8-requirement-ir-shadow-migration-unit-test-design.md
---

# Requirement IR shadow migration機能設計

## §0 位置づけ

現行Markdown正本の153要求、24 system contract、72 HAC、24 HATを、意味を追加せず
`shadow_noncanonical` JSONへ決定論的に射影する移行componentである。PR5のauthority cutoverまでは
Markdownがcurrent authorityであり、本JSON、schema、生成scriptはcanonical write authorityを持たない。

既存質問、回答、prototype、reactionの履歴がない要求へ発見証拠を捏造しない。
`actor_ids`、`task_ids`、`surface_ids`およびDesign Template JSON接続portは空配列とし、
`pending_resolution`へ未解決理由を残す。

## §1 公開契約

| API | precondition | postcondition | failure |
|---|---|---|---|
| `compileRequirementIrShadow(input)` | 4つの現行Markdown sourceを同時入力 | 153/24/72/24とroot digestを返す | 分母、ID、digest、owner、trace不一致をthrow |
| `requirement-ir-shadow-generator.ts` | repository rootから実行 | 同じ入力から同じchecked-in JSONを生成 | compile failure時はwriteしない |

出力schemaは`config/requirement-ir-shadow-schema.json`、shadow snapshotは
`generated/requirements-ir/manifest.json`と4つのstable-ID keyed shardとする。
PR5ではこのpartitionをcanonical readerへ接続し、shadow authorityだけを切り替える。

## §2 意味不変条件

- requirement ID、revision、要求行statement digest、source authority、assertionを保持する。
- 各requirementはprimary system contractをexactly oneだけ持つ。
- owner contractの3 HACと1 HATを接続する。
- schema/root/各record digestはkey順序を正規化したcanonical JSONのSHA-256とする。
- Markdown byte一致ではなく、上記semantic parityを検査する。
- JSONはDB、GitHub、filesystem、L3 canonicalへ直接writeしない。

## §3 既知12要求のowner是正

exact setは`HIL-BR-32`、`HIL-BR-33`、`HIL-FR-64..69`、`HIL-NFR-37..40`である。
範囲表記は説明だけに使い、実装では12 IDを列挙する。

- `HIL-BR-32`、`HIL-FR-64..69`、`HIL-NFR-37..40` → `HR-FR-HIL-23`
- `HIL-BR-33` → `HR-FR-HIL-24`
- `HR-FR-HIL-23`のroute issueは`#225 → #226 → #227 → #194`
- `HR-FR-HIL-24`はduplicate search完了までissueを捏造せず空配列

GitHub 5責務へownerを誤配線した場合はfail-closeする。

## §4 Design Template JSONへの接続境界

本episodeではテンプレートschema、template instance、portfolio plannerを作らない。
requirement recordへ次の空portだけを先行配置する。

- `design_template_ids`
- `design_obligation_ids`
- `required_design_artifact_kinds`

Issue #290がPR6後に起動するまで、空値を推測で補完しない。

## §5 非対象

- JSON→Markdown生成器、DB shadow射影
- canonical JSONのstable-ID storage、direct Markdown edit rejection
- G1/G3凍結、Design Template JSON、要求発見Engine実行系
