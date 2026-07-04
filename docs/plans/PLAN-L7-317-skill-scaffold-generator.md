---
plan_id: PLAN-L7-317-skill-scaffold-generator
title: "PLAN-L7-317 (impl): skill-engine scaffold — skill authoring generator (LOCAL は recommend のみで scaffold 不在)"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-05
backprop_decision: not_required
backprop_decision_reason: "上流突合 Tier2-#6 の LOCAL 実装欠落を L7 の pure generator と CLI 境界で閉じる追加実装であり、新規 product requirement や上位設計の意味変更を追加しない。skill assignment の既存 SSoT を再利用し、L7 の実装・oracle 証跡で完結する。"
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
  - artifact_path: src/skill-engine/scaffold.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/skill-scaffold.test.ts
    artifact_type: test_code
  - artifact_path: tests/skill-scaffold-cli.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T01:54:49+09:00"
    tests_green_at: "2026-07-05T01:54:49+09:00"
    verdict: approve
    scope: "skill.v1 scaffold の pure generator と `skill create` CLI 境界が実装済みであることを確認し、PLAN-L7-317 を terminal evidence 付きで confirmed 化した。generator は filesystem 副作用を持たず、CLI は dry-run JSON / --write / overwrite refusal を test で固定する。rename cutover、既存 skill recommendation、telemetry logic は変更していない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/skill-scaffold.test.ts tests/skill-scaffold-cli.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T01:54:49+09:00"
        evidence_path: tests/skill-scaffold.test.ts
        output_digest: "sha256:cea81a8b214cb43aa3eddc37aa69386803c74265de66d506470d7519e52a1022"
      - kind: unit_test
        command: "bun test tests/design-language.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T01:54:49+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:c19def4deedbba5683830fae299d9b2f7fce31166b81711806476257ea54f322"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T01:54:49+09:00"
        evidence_path: src/skill-engine/scaffold.ts
        output_digest: "sha256:df57819223d2b7596334f7fca65885dbd75aadf2e1a98026b04cb1c89a16b538"
      - kind: doctor
        command: "./scripts/ut-tdd doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T01:54:49+09:00"
        evidence_path: tests/skill-scaffold-cli.test.ts
        output_digest: "sha256:484a7d614945e1be7bef59465b9154f41159aa4993f738ea71f19d857ca493b4"
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
- Step 1: skill.v1 schema と VALID_* 定数の再利用点を確認（TL）→ 完了。
- Step 2: pure generator + self-lint を実装（Red→Green）→ `src/skill-engine/scaffold.ts` へ着地済み。
- Step 3: CLI 側の file-write コマンド結線を最小で用意し test → `skill create` へ着地済み。
- Step 4: 検証 → review → confirmed → 本 PLAN で confirmed。

## 壊さない / 再発させない
- generator を pure に保つ（副作用は CLI 境界へ）。
- VALID_* を二重定義せず skill-assignment.ts を SSoT として参照。

## 着地結果

- `scaffoldSkill` は `src/lint/skill-assignment.ts` の `VALID_SKILL_TYPES` / `VALID_SKILL_LAYERS` /
  `VALID_SKILL_DRIVE_MODELS` を再利用し、`skill.v1` frontmatter、配置 path、metadata、self-lint finding を返す。
- generator 本体は filesystem に書き込まない。`tests/skill-scaffold.test.ts` が deterministic path、content、
  invalid category/layer/drive model の reject、allowed values の SSoT 参照を固定する。
- CLI 境界は `skill create` として実装され、JSON dry-run は file write なし、`--write` は scaffold を作成、
  既存ファイルは `--force` なしで拒否する。`tests/skill-scaffold-cli.test.ts` がこの契約を固定する。
- 着地 commit は `34795b6`（pure generator）と `af07d76`（CLI wiring）。

## 名称 / rename 境界

- 生成 content は HELIX Agent Harness の現行 skill authoring 用 scaffold として扱う。
- `.ut-tdd` / `ut-tdd` / `area=harness` の物理 rename、ファイル名 rename、distribution cutover は
  PLAN-M-02 の承認対象であり、本 PLAN では実施しない。

## レビュー / 次工程
- 実装・test・doctor は green。PLAN-L7-317 は confirmed。
- 出典: [[upstream-helix-reconciliation]] audit §5 Tier2-#6。
