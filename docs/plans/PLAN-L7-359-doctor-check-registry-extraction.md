---
plan_id: PLAN-L7-359-doctor-check-registry-extraction
title: "PLAN-L7-359: doctor check registry / timing / setup-smoke extraction"
kind: refactor
layer: L7
drive: agent
status: confirmed
created: 2026-07-07
updated: 2026-07-07
route_mode: refactor
entry_signals:
  - "po_directive:2026-07-07:helix-harness-upstream-full-branch-reconciliation"
backprop_decision: not_required
backprop_decision_reason: "doctor の挙動不変な構造分割と lightweight scope 追加。既存 gate の pass/fail 意味を変更しない。"
owner: Codex
parent_design: docs/process/modes/refactor.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - doctor check definition registry と timing collector 抽出"
  - role: qa
    slot_label: "QA - full doctor 挙動不変 / consumer profile 退行なし / timing JSON 検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-359-doctor-check-registry-extraction.md
    artifact_type: markdown_doc
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/doctor/check-registry.ts
    artifact_type: source_module
  - artifact_path: src/doctor/result.ts
    artifact_type: source_module
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/process/modes/refactor.md
  requires:
    - PLAN-L7-349-cli-split-slice
  references:
    - docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-08T01:30:00+09:00"
    tests_green_at: "2026-07-08T01:30:00+09:00"
    verdict: approve
    scope: "PLAN-L7-359 doctor registry / timing / setup-smoke extraction。full doctor の判定意味を変えず、registry collector と lightweight scope を追加した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "CI=true bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-08T01:08:24+09:00"
        evidence_path: tests/doctor.test.ts
        output_digest: "sha256:ccd95547fc1dd132b06cf68d38e241485a023159af73daae5690b0ccec4c87d6"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-08T01:08:24+09:00"
        evidence_path: src/doctor/check-registry.ts
        output_digest: "sha256:a064c5ca6f271f8e407856676e678001ff2d1d6e387aca212a2cda27aea05140"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-08T01:08:24+09:00"
        evidence_path: docs/plans/PLAN-L7-359-doctor-check-registry-extraction.md
        output_digest: "sha256:dd21c5fe1cebda9e48277036bde16ca73a2e1ad68154f997bcbdfc00c14918ce"
---

# PLAN-L7-359: doctor check registry / timing / setup-smoke 抽出

## 目的

`src/doctor/index.ts` の monolith を段階的に分割し、AI agent が失敗箇所を狭めやすい
doctor registry / timing / lightweight scope を作る。挙動変更ではなく、検証 feedback loop を短くする refactor。

## スコープ

- doctor check を `{ id, profiles, requires, run }` の registry へ抽出する。
- `collectDoctorCheckRun` 相当の collector を作り、check result と timing を同時に返す。
- `--timing` を追加し、JSON では timings field、text では遅い check の概要を出す。
- `--scope full|toolchain` を追加し、toolchain scope は formatter / lockfile / toolchain pin などの前提確認へ限定する。
- `--setup-smoke` は fresh consumer setup 向け smoke として full doctor から切り離す。
- 既存 `--profile consumer` との関係を明示し、互換を壊さない。

## 対象外

- 各 lint / gate の判定基準変更。
- doctor の fail を握りつぶす fail-open 化。
- 既存 accepted / confirmed PLAN の status 書き換え。

## 受入条件

- full doctor の check id と message は分割前後で意味が変わらない。
- `--timing --json` が per-check timing を返す。
- invalid scope は exit 1。
- registry が `src/doctor/index.ts` から import され、index は aggregation に寄る。

## 検証予定

- `bun test tests/doctor.test.ts tests/cli-surface.test.ts --timeout 300000`
- `bun run typecheck`
- `bunx biome check src/doctor src/cli.ts tests/doctor.test.ts tests/cli-surface.test.ts`
- `bun run src/cli.ts doctor --timing --json`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-359-doctor-check-registry-extraction.md`

## 実装記録

2026-07-07:

- `src/doctor/result.ts` を追加し、`DoctorScope` / `DoctorOptions` / `DoctorTiming` /
  `DoctorResult` を doctor surface の共有型として分離した。
- `src/doctor/check-registry.ts` を追加し、`{ id, profiles, run }` の check definition registry と
  `collectDoctorCheckRun` timing collector を導入した。
- 既存 full doctor は `runFullDoctor` として挙動を保持し、公開 `runDoctor` は registry collector 経由で
  full / toolchain / setup-smoke を集約するよう変更した。
- `helix doctor --scope full|toolchain --timing --json` と `helix doctor --setup-smoke` を追加した。
  invalid scope は exit 1 で fail-close する。`--profile consumer` は従来通り consumer profile を直接実行する。

Green commands:

- `bun test tests/doctor.test.ts tests/cli-surface.test.ts --timeout 300000` -> 99 pass / 0 fail
- `bun run typecheck` -> exit 0
- `bunx biome check src/doctor/index.ts src/doctor/check-registry.ts src/doctor/result.ts src/cli.ts tests/doctor.test.ts tests/cli-surface.test.ts` -> exit 0
- `bun run src/cli.ts doctor --scope toolchain --timing --json` -> exit 0; `timings[0].id=toolchain-pin`
