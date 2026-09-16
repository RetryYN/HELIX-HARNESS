---
plan_id: PLAN-L7-247-setup-version-up-first-run-evidence
title: "PLAN-L7-247: setup version-up first-run evidence"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "HELIX project setup の初回 workflow に既存 version-up dry-run surface を接続する限定実装。L1/L3 の version-up 要求を変えず、consumer setup が tag bump / release pin 更新を完了や apply と誤認しない証跡を追加する。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L7-03-setup-solo-team.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - setup/version-up workflow alignment"
generates:
  - artifact_path: docs/plans/PLAN-L7-247-setup-version-up-first-run-evidence.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-03-setup-solo-team.md
    artifact_type: markdown_doc
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: src/setup/templates.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-03-setup-solo-team.md
  requires:
    - docs/design/helix/L1-requirements/pillar-requirements.md
    - docs/process/modes/version-up.md
    - src/lint/version-up-readiness.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T11:38:48+09:00"
    tests_green_at: "2026-07-03T11:38:48+09:00"
    verdict: approve
    scope: "HELIX project setup の doctorBaseline / postSetupWorkflow / VSCode task / consumer CI smoke に version-up dry-run を追加し、tag bump / release pin 更新が plan-only / no-write / mustNotApply の証跡として初回 workflow に入るようにした。consumer repo に dogfood docs を要求する activation-packet は初回必須 command にしない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/cli-surface.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T11:34:46+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:5cc060bd00a56757ae2da009f6616ce855832623f24bf8e92c5696d62ad1b9ea"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T11:38:48+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T11:38:48+09:00"
        evidence_path: docs/plans/PLAN-L7-247-setup-version-up-first-run-evidence.md
        output_digest: "sha256:36b3947cc41bf98178e0584d58c37e54f34c7cb2e16a85f4b90a40e97ee773a8"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-03T11:38:48+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T11:38:48+09:00"
        evidence_path: docs/plans/PLAN-L7-247-setup-version-up-first-run-evidence.md
        output_digest: "sha256:7a9a647293b36437675a9a068adf68c7840627265332f45917196ef1d3c38b56"
---

# PLAN-L7-247: setup の version-up 初回証跡

## 目的

HELIX 導入済み VSCode で新規 project を始める `helix setup project` は、setup 成功と L14 完了を分ける証跡を既に出している。
しかし L1 §2.7 の「setup 済み project は tag bump / release pin 更新で version-up できる」に対し、初回 workflow は
`version-up activation-packet` を objectiveBoundary に名前だけ持ち、実際に走らせる no-write verification には入れていなかった。

この PLAN では、consumer repo でも dogfood docs なしで実行できる
`helix version-up dry-run --current v0.1.0 --target v0.1.3 --json` を初回 workflow に追加する。
この dry-run は Semantic Versioning 2.0.0 に基づく差分分類、release tag check、rollback、idempotency を返すが、
`planOnly=true` / `mustNotApply=true` / `applyCommandAvailable=false` を維持する。

## 変更

- `CONSUMER_CI_RUN_COMMANDS` と generated `harness-check.yml` に version-up dry-run を追加した。
- VSCode task に `HELIX: version-up dry-run` を追加した。
- `PROJECT_DOCTOR_BASELINE` と `postSetupWorkflow.verificationMatrix` に `version-up-dry-run` phase を追加した。
- ready / review / fix の next action に version-up dry-run を入れ、tag 更新を暗黙に完了扱いしない導線へ統一した。
- `tests/setup.test.ts` と `tests/cli-surface.test.ts` で、first-run verification が 8 件から 9 件へ増えることを固定した。

## 採用判断

- 採用: `version-up dry-run` を初回 workflow に入れる。consumer repo に `docs/plans` が無くても動く no-write surface だから。
- 不採用: `version-up activation-packet --json` を consumer 初回必須 command にする。これは harness dogfood docs / parked PLAN を読む surface であり、通常 consumer repo の first-run health check には不適切。
- 不採用: `.helix` から `.helix` への実 cutover。PLAN-M-02 の cutover/action-binding approval が未承認のため、今回も `mustNotApply` 境界を維持する。

## 完了条件

- `setup project --dry-run --json` の `doctorBaseline.baselineCommands` と `postSetupWorkflow.verificationCommands` が version-up dry-run を含む。
- generated `.vscode/tasks.json` と `harness-check.yml` が version-up dry-run を含み、read-only / secret-free / manual task 契約を壊さない。
- `bun test tests/setup.test.ts tests/cli-surface.test.ts --timeout 180000` が green。
- `bun run tsc --noEmit`、`plan lint --gate governance`、`doctor` が green。
