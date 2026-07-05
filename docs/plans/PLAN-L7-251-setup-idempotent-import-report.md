---
plan_id: PLAN-L7-251-setup-idempotent-import-report
title: "PLAN-L7-251: setup import report の idempotent rerun 分類"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "HELIX project setup の brownfield import report 内で、consumer-owned conflict と同一 generated artifact rerun を分類し直す限定修正。L1/L3 の要求意味は変えない。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L7-250-consumer-doctor-version-up-matrix.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - setup idempotent import report"
generates:
  - artifact_path: docs/plans/PLAN-L7-251-setup-idempotent-import-report.md
    artifact_type: markdown_doc
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-250-consumer-doctor-version-up-matrix.md
  requires:
    - src/setup/index.ts
    - tests/setup.test.ts
    - docs/design/harness/L6-function-design/setup-solo-team.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T12:37:13+09:00"
    tests_green_at: "2026-07-03T12:37:13+09:00"
    verdict: approve
    scope: "実 consumer repo smoke で、fresh setup 後の再実行が brownfield conflict と誤判定される regression を検出した。consumer-owned non-mergeable path は review route のまま維持し、同一 generated artifact rerun は identicalManagedPaths として ready / skipped=[] / written=0 になることを unit と temp consumer smoke で確認した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/cli-surface.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T12:37:13+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:2f2eb29d657561e8ce4c7c27c0028ad3e315869661e493ce793f4bdc5c166c35"
      - kind: unit_test
        command: "bun test tests/doctor.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T12:37:13+09:00"
        evidence_path: tests/doctor.test.ts
        output_digest: "sha256:fb3faffc6acd03dcea39063bb710d31e566d6b8a34e307af591a4e7f4808a9c9"
      - kind: unit_test
        command: "bun test tests/design-language.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T12:37:13+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:7f70ca8fcf5a203e1428719ae149b5dde8515f13e8f22e75f0f41fa06ade7605"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T12:37:13+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:44220009afe0690be55eb18f2b4b35dee3d3bb863b32a1b2318af0386a4f54fe"
      - kind: smoke
        command: "temp consumer repo: unmanaged dry/apply setup remains review_import_report; fresh setup apply twice returns ready/skipped=[]/written=0; consumer doctor --profile consumer ok"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T12:37:13+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:f64c429042309d57baf042bee8797a9fead36e6a6ecad87a5a37a3a15eab9b8a"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-03T12:37:13+09:00"
        evidence_path: docs/plans/PLAN-L7-251-setup-idempotent-import-report.md
        output_digest: "sha256:c31541548a310106e71e4c31e898d3087d3d74f948d751f5f2b92f720664c805"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T12:37:13+09:00"
        evidence_path: docs/plans/PLAN-L7-251-setup-idempotent-import-report.md
        output_digest: "sha256:31567a7d7bab1153ee97a70c3e2d2355824c3e87ec7257a81ba305fc815b0039"
---

# PLAN-L7-251: setup import report の idempotent rerun 分類

## 目的

実 consumer smoke で、fresh setup 済み repo に `helix setup project` を再実行すると、
生成済みの `.vscode/tasks.json` や `.helix/teams/default-hybrid.yaml` まで brownfield conflict として
`review_import_report` へ送られることを検出した。

これは「既存 consumer-owned file を守る」要求自体は正しいが、前回 HELIX が生成した同一内容の managed artifact
まで同じ conflict と解釈していたため、setup の idempotency と post-setup route の意味がずれていた。

## 変更

- `emitSetup` は既存内容が render 結果と完全一致する managed path を prompt / write せず skip する。
- `HelixProjectImportReport` に `identicalManagedPaths` を追加し、同一 generated artifact を
  `skippedExistingPaths` から除外する。
- `runHelixProjectSetup` は emit 前に同一 path を分類し、import report に渡す。
- `tests/setup.test.ts` に、fresh setup 後の再実行が `ready`、`skippedExistingPaths=[]`、prompt なし、
  managed block 重複なしになる unit test を追加する。
- L6 design / L7 test-design に、consumer-owned conflict と idempotent rerun を別 scenario として追記する。

## 採用判断

- 採用: byte-for-byte 一致する generated artifact を `identicalManagedPaths` として扱う。
- 採用: non-mergeable かつ差分のある existing path は従来どおり `skippedExistingPaths` / review route に残す。
- 採用: mergeable adapter docs は既存の managed block merge 境界を維持する。
- 不採用: 差分のある `.vscode/tasks.json` を自動 merge する。VS Code task は JSON 構造の consumer-owned config であり、
  意味 merge には別設計が必要なため、今回は review route のままにする。
- 不採用: `.helix` から `.helix` への実 cutover。PLAN-M-02 の cutover/action-binding approval が未承認のため、今回も apply しない。

## 完了条件

- generated HELIX project への setup 再実行で `importReport.identicalManagedPaths` が同一 path を持つ。
- 同一 generated artifact rerun では `skippedExistingPaths=[]`、`requiresReview=false`、`nextRoute=ready` になる。
- consumer-owned `.vscode/tasks.json` を置いた brownfield conflict は従来どおり `review_import_report` になる。
- `tests/setup.test.ts`、consumer doctor 関連 targeted test、typecheck、design-language、plan lint、db rebuild、doctor が green。
- temp consumer smoke で fresh apply 2 回目が review route に落ちない。
