---
plan_id: PLAN-L7-317-skill-scaffold-generator
title: "PLAN-L7-317 (impl): skill-engine scaffold — skill authoring generator (LOCAL は recommend のみで scaffold 不在)"
kind: impl
layer: L7
drive: agent
status: draft
created: 2026-07-04
updated: 2026-07-04
owner: Claude (Opus) / Codex
parent_design: docs/design/helix/L0-charter/helix-charter_v0.1.md
related_l0: docs/governance/helix-agent-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE — skill.v1 scaffold generator (name/category/layers/driveModels/domainTags → content+path+self-lint) を pure 関数で実装、file write は CLI 所掌"
  - role: tl
    slot_label: "TL — skill-assignment.ts の VALID_* 定数再利用・生成物と既存 skill schema の整合レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-317-skill-scaffold-generator.md
    artifact_type: markdown_doc
  # draft のため generates は実在する自 doc のみ。生成予定 (skill-engine/scaffold + test) は本文 §スコープ参照。実装着地時に generates へ追加する。
dependencies:
  parent: null
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
---

# PLAN-L7-317 (impl): skill-engine scaffold 生成器

## Objective

LOCAL は skill *recommendation*（`skill suggest` / `metrics skill`）は持つが skill *authoring* generator が無い。
上流 `src/skill-engine/scaffold.ts`（skill.v1 の name/category/layers/driveModels/domainTags から file content /
path / self-lint を返す pure generator。file write は CLI が所掌）は LOCAL の `skill-assignment.ts` の
`VALID_SKILL_CATEGORIES` / `VALID_SKILL_LAYERS` / `VALID_SKILL_DRIVE_MODELS` を再利用でき配線安価。HELIX 式に実装。

## スコープ

### IN
- `src/skill-engine/scaffold.ts`: 入力（name/category/layers/driveModels/domainTags）から skill.v1 の
  content + 配置 path + self-lint 結果を返す **pure 関数**（filesystem 副作用なし）。
- 既存 `src/lint/skill-assignment.ts` の VALID_* 定数を SSoT として再利用。
- file write は CLI コマンド側（例: `skill create`）が所掌（generator は content を返すだけ）。

### OUT
- generator 内で filesystem へ書かない（純粋・testable）。
- skill recommendation / telemetry ロジックは変更しない。

## 受入条件
- 不正 category/layer/driveModel を self-lint で reject し、valid 入力で正しい content/path を返す。
- targeted test green、doctor / lint / typecheck / plan lint green。confirmed 前に review evidence 記録。

## スケジュール
- mode: serial。
- Step 1: skill.v1 schema と VALID_* 定数の再利用点を確認（TL）。
- Step 2: pure generator + self-lint を実装（Red→Green）。
- Step 3: CLI 側の file-write コマンド結線を最小で用意し test。
- Step 4: 検証 → review → confirmed。

## 壊さない / 再発させない
- generator を pure に保つ（副作用は CLI 境界へ）。
- VALID_* を二重定義せず skill-assignment.ts を SSoT として参照。

## レビュー / 次工程
- 実装は Codex in-flight 着地後に harness workflow で行う。基準点は HEAD。
- 出典: [[upstream-helix-reconciliation]] audit §5 Tier2-#6。
