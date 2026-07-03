---
plan_id: PLAN-L7-250-consumer-doctor-version-up-matrix
title: "PLAN-L7-250: consumer doctor の version-up matrix"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-247..249 で追加した version-up dry-run 初回証跡を consumer doctor の state / adapter / subagent / slash-command 判定へ追従する限定修正。L1/L3 の要求意味は変えない。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L7-249-setup-version-up-adapter-surface.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - consumer doctor version-up matrix"
generates:
  - artifact_path: docs/plans/PLAN-L7-250-consumer-doctor-version-up-matrix.md
    artifact_type: markdown_doc
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-249-setup-version-up-adapter-surface.md
  requires:
    - docs/plans/PLAN-L7-247-setup-version-up-first-run-evidence.md
    - docs/plans/PLAN-L7-248-setup-version-up-trace-backfill.md
    - docs/plans/PLAN-L7-249-setup-version-up-adapter-surface.md
    - src/doctor/index.ts
    - src/setup/index.ts
    - docs/design/harness/L6-function-design/setup-solo-team.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T12:18:47+09:00"
    tests_green_at: "2026-07-03T12:18:47+09:00"
    verdict: approve
    scope: "実 consumer repo smoke で、setup state は version-up-dry-run を含む 9 行 matrix を保存しているのに consumer doctor 側の期待が 8 行のままになっていた regression を検出した。consumer doctor の project setup state / adapter doc / Claude subagent / slash-command 判定を version-up dry-run 必須へ揃え、wet setup 後の consumer doctor green まで確認した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/doctor.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T12:18:47+09:00"
        evidence_path: tests/doctor.test.ts
        output_digest: "sha256:4ee2c4273fad2bcb401768ce78b163f1c59859f6d80cb880284dcc8daf9e228b"
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/cli-surface.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T12:18:47+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:b8d1799995ac852d9eaf2043779652bb540b84ff943a238261178e4e8423dd8d"
      - kind: unit_test
        command: "bun test tests/design-language.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T12:18:47+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:b5b75e2f273b7255961fcbb4189ae0b09c53b791f2789e1c196af8d54540e7d9"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T12:18:47+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: smoke
        command: "temp consumer repo: setup project --dry-run --json; setup project --json; doctor --profile consumer; first-run status/completion/version-up/rename/handover/team commands"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T12:18:47+09:00"
        evidence_path: tests/doctor.test.ts
        output_digest: "sha256:6c89c4c617acc1596454c649c81642319cf26299b9356febac442ff070a2f81b"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-03T12:18:47+09:00"
        evidence_path: docs/plans/PLAN-L7-250-consumer-doctor-version-up-matrix.md
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T12:18:47+09:00"
        evidence_path: docs/plans/PLAN-L7-250-consumer-doctor-version-up-matrix.md
        output_digest: "sha256:d0758b8752e38ae26f7f6c050dab708736546774e46c94d0a08a712275243f58"
      - kind: smoke
        command: "bun run src/cli.ts db rebuild"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T12:18:47+09:00"
        evidence_path: .ut-tdd/harness.db
        output_digest: "sha256:228bd37f5ca0eb57f364969a1099dcfd8cb00a6b9971195f5f6698a60d444bbf"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T12:18:47+09:00"
        evidence_path: docs/plans/PLAN-L7-250-consumer-doctor-version-up-matrix.md
        output_digest: "sha256:cadc8f33fe8b6ffd825d88a1c60feef23b7749ad5839cbc88c45ed5b0b719d7d"
---

# PLAN-L7-250: consumer doctor の version-up matrix

## 目的

`ut-tdd setup project` の first-run workflow は version-up dry-run を含む 9 行 matrix に更新済みだった。
しかし実 consumer repo で wet setup 後に `ut-tdd doctor --profile consumer` を走らせると、
consumer doctor 側の期待 matrix が古い 8 行のままで、`version-up-dry-run` 行を持つ正しい
`.ut-tdd/state/project-setup.json` を violation にしていた。

この PLAN では、setup state、adapter docs、Claude subagent、Claude slash-command に対する consumer doctor の
fail-close 判定を version-up dry-run 付き契約へ揃える。

## 変更

- `runConsumerDoctor` の `expectedFirstRunRows` に `version-up-dry-run` 行を追加した。
- consumer adapter doc / Claude subagent / Claude slash-command 判定で
  `ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --json` を必須にした。
- `tests/doctor.test.ts` の consumer setup fixture を 9 行 matrix、8 VS Code task、version-up CI smoke へ更新した。
- L6 design と L7 test-design に、consumer doctor が `version-up-dry-run` 欠落を fail-close することを追記した。
- 誤って source repo に生成した ignored `.ut-tdd/state/project-setup.json` / `.ut-tdd/state/setup.json` を削除し、source repo の completion packet を本来の 4 frontier に戻した。

## 採用判断

- 採用: consumer doctor の期待値を setup 実体と同じ 9 行 matrix にする。
- 採用: 実 consumer repo dry/wet smoke を完了条件に入れ、unit test だけで閉じない。
- 不採用: source repo に consumer setup state を残して `CONSUMER-SETUP-BOUNDARY` を active objective に混ぜる。
  source repo と consumer repo の runtime state は別物であり、source repo の L14 blocker は既存 4 frontier のまま扱う。
- 不採用: `.ut-tdd` から `.helix` への実 cutover。PLAN-M-02 の cutover/action-binding approval が未承認のため、今回も apply しない。

## 完了条件

- `runConsumerDoctor` が first-run matrix 9 行のうち `version-up-dry-run` 欠落を fail-close する。
- wet setup 後の temp consumer repo で `ut-tdd doctor --profile consumer` が `consumer-project-setup-state - OK` を返す。
- `bun test tests/doctor.test.ts --timeout 180000` が green。
- `bun test tests/setup.test.ts tests/cli-surface.test.ts --timeout 180000` が green。
- `bun test tests/design-language.test.ts --timeout 180000`、`bun run tsc --noEmit`、`plan lint --gate governance`、`db rebuild`、`doctor` が green。
