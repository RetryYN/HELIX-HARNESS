---
plan_id: PLAN-L7-319-upstream-adoption-small-items
title: "PLAN-L7-319 (impl): 上流突合 小項目 roundup — team prompt provider routing / provisional lint 確認 / Agent-Task matcher portability"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-05
backprop_decision: not_required
backprop_decision_reason: "上流突合の小項目を L7 実装証跡として棚卸・分割する closure PLAN であり、新規 product requirement や上位設計の意味変更を追加しない。setup/update-check advisory と personal-path hard gate 化は未実装として別 slice へ分離し、この PLAN では完了主張しない。"
owner: Claude (Opus) / Codex
parent_design: docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE — 小さく独立した採用項目 (provider 1行 / update-check advisory / matcher portability) を各々最小 diff で実装"
  - role: tl
    slot_label: "TL — provisional lint (github-ci-policy/personal-path/toolchain-pin) の LOCAL 等価物確認 grep・配布 surface に触れる項目の escalation 判断"
generates:
  - artifact_path: docs/plans/PLAN-L7-319-upstream-adoption-small-items.md
    artifact_type: markdown_doc
  - artifact_path: src/team/run.ts
    artifact_type: source_module
  - artifact_path: tests/team-run.test.ts
    artifact_type: test_code
  - artifact_path: src/runtime/agent-guard-policy.ts
    artifact_type: source_module
  - artifact_path: tests/agent-guard.test.ts
    artifact_type: test_code
  - artifact_path: src/lint/toolchain-pin.ts
    artifact_type: source_module
  - artifact_path: tests/toolchain-pin.test.ts
    artifact_type: test_code
  - artifact_path: src/audit/quality.ts
    artifact_type: source_module
  - artifact_path: tests/quality-audit.test.ts
    artifact_type: test_code
  - artifact_path: src/lint/runtime-portability.ts
    artifact_type: source_module
  - artifact_path: tests/runtime-portability.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
review_evidence:
  - reviewer: mencius-subagent-and-codex
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T02:46:33+09:00"
    tests_green_at: "2026-07-05T02:46:33+09:00"
    verdict: approve
    scope: "PLAN-L7-319 の小項目 roundup を既存実装確認と分離済み PLAN-L7-324 証跡へ正規化した。team prompt provider routing と Agent/Task matcher portability は実装・test 済み、github-ci-policy は consumer CI contract、toolchain-pin は PLAN-L7-324、personal-path は既存の部分等価物までと記録した。setup/update-check advisory と personal-path hard gate 化は未実装として後続 slice に分離し、README / READE は gate・証跡・完了条件に紐づけていない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime-subagent
    green_commands:
      - kind: unit_test
        command: "bun test tests/team-run.test.ts tests/agent-guard.test.ts tests/toolchain-pin.test.ts tests/quality-audit.test.ts tests/runtime-portability.test.ts tests/project-hook.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T02:44:35+09:00"
        evidence_path: tests/team-run.test.ts
        output_digest: "sha256:186aee73e13ac285c865fc77ecf6cde964fe77a039dcf3e8286c748a17535003"
      - kind: unit_test
        command: "bun test tests/design-language.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T02:44:35+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:c19def4deedbba5683830fae299d9b2f7fce31166b81711806476257ea54f322"
      - kind: lint
        command: "./scripts/ut-tdd plan lint docs/plans/PLAN-L7-319-upstream-adoption-small-items.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T02:44:35+09:00"
        evidence_path: docs/plans/PLAN-L7-319-upstream-adoption-small-items.md
        output_digest: "sha256:42de5cd663e4a97c9d9beb69651406fdad81f9426876c50adfa240a397c400fd"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T02:44:35+09:00"
        evidence_path: src/team/run.ts
        output_digest: "sha256:7e6e40725ff66c596356c4d5f8aa37181555b026f91ced528226b98736a40929"
      - kind: doctor
        command: "./scripts/ut-tdd db rebuild --json >/tmp/helix-db-rebuild-plan-l7-319-final.json && ./scripts/ut-tdd doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T02:46:33+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:eff33be45091a0a9101d7423921f07662e3da3c4f243d6c825a73b8b514df268"
---

# PLAN-L7-319 (impl): 上流突合 小項目 roundup

## Objective

上流突合 audit の Tier2/Tier3 の小さく独立した項目を集約起票する。各項目は最小 diff・低リスクだが、
coherent task boundary を保つため実装時は本 PLAN 配下で 1 項目ずつ着地させる（一括 import しない）。

## スコープ

### IN（確認済み・この PLAN で完了主張する範囲）
- **team prompt provider routing**: `src/team/run.ts buildMemberPrompt()` は effective provider を prompt に出し、
  `tests/team-run.test.ts` が `provider: codex` / `provider: claude` を検証する。
- **provisional lint 確認（既存等価物の棚卸）**:
  - `github-ci-policy`: `src/setup/index.ts` の consumer CI workflow contract と `tests/setup.test.ts` /
    `tests/doctor.test.ts` / `tests/distribution-acceptance.test.ts` が、`pull_request_target` 禁止、
    read-only permissions、`persist-credentials: false`、固定 smoke command を検査する。
  - `toolchain-pin`: `PLAN-L7-324` で独立実装済み。`src/lint/toolchain-pin.ts` と
    `tests/toolchain-pin.test.ts` が doctor hard gate 到達性を固定する。
  - `personal-path`: `src/audit/quality.ts` の `hardcoded_absolute_path`、`src/lint/runtime-portability.ts` の
    `local-absolute-path`、`tests/project-hook.test.ts` の project hook 拒否が既存の部分等価物である。
- **Agent/Task matcher portability**: `src/runtime/agent-guard-policy.ts` は `"Agent"` / `"Task"` の両方を
  guard 対象にし、`tests/agent-guard.test.ts` が `"Task"` の fail-close と allowlist 経路を検証する。

### OUT
- 各項目を一括 import しない（1 項目ずつ boundary を切って着地）。
- 配布 surface の実切替（PLAN-M-02 の承認対象）には踏み込まない。
- `setup/update-check` advisory はこの PLAN の完了範囲から外す。外部 version source、24h cache、
  distribution surface の扱いを伴うため、別 slice で承認境界を切る。
- `personal-path` の source-wide / doctor hard gate 化はこの PLAN では完了主張しない。現時点では既存の部分等価物の
  棚卸結果として記録し、hard gate 化が必要なら後続の独立 PLAN で扱う。
- README / READE は gate、証跡、完了条件に紐づけない。

## 受入条件
- 着手した各項目が最小 diff で回帰なし、provisional lint は確認結果（追加/skip/後続切り出し）を evidence 化。
- targeted test green、doctor / lint / typecheck / plan lint green。confirmed 前に review evidence 記録。

## スケジュール
- mode: serial（項目ごとに独立着地）。
- Step 1: team prompt provider の既存実装・test を確認。
- Step 2: provisional lint の LOCAL 等価物確認 grep → `toolchain-pin` は `PLAN-L7-324` に分離済み、
  `github-ci-policy` は setup/doctor contract で既存、`personal-path` は部分等価物までと判断。
- Step 3: `setup/update-check` advisory は配布 surface 触りのため後続 slice へ送る。
- Step 4: `Agent` / `Task` matcher の portability を確認。
- Step 5: 各項目 review → confirmed。

## 壊さない / 再発させない
- 一括 import 禁止（粒度を合わせ 1 項目ずつ）。
- 配布 surface の実切替は PLAN-M-02 承認前に行わない。

## レビュー / 次工程
- この PLAN は既存実装と分離済み `PLAN-L7-324` の棚卸を正本化する。追加の実装 diff は持たない。
- `setup/update-check` advisory と `personal-path` hard gate 化は、必要時に別 PLAN で trace / oracle /
  review evidence を持たせる。
- 出典: [[upstream-helix-reconciliation]] audit §5 Tier2/Tier3。
