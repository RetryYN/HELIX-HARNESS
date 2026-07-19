---
plan_id: PLAN-L7-303-distribution-package-surface-readiness
title: "PLAN-L7-303: distribution package surface readiness の fail-close"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-04
backprop_decision: not_required
backprop_decision_reason: "consumer setup readiness の gate 強化。公開配布 repo への release apply、外部 API 書込、PLAN-M-02 rename/cutover、D-API/D-DB 変更は行わない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
pair_artifact: tests/setup.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - distribution package surface gate 設計"
  - role: qa
    slot_label: "QA - stale 配布 tag false-green 回帰"
generates:
  - artifact_path: docs/plans/PLAN-L7-303-distribution-package-surface-readiness.md
    artifact_type: markdown_doc
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: tests/distribution-acceptance.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/design/harness/L6-function-design/setup-solo-team.md
  requires:
    - docs/design/harness/L6-function-design/setup-solo-team.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-04T00:00:00+09:00"
    tests_green_at: "2026-07-04T00:00:00+09:00"
    verdict: approve
    scope: "公開配布 tag の stale CLI surface を consumer readiness へ fail-close で反映する L7 gate 強化。version-up release apply、外部 API 書込、PLAN-M-02 cutover は実行していない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T00:00:00+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:f2471e488c93f7413ebf3f5d0c301116fd99c3ea4bcc1cda0822bb242524c89f"
      - kind: integration_test
        command: "bun test tests/distribution-acceptance.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T00:00:00+09:00"
        evidence_path: tests/distribution-acceptance.test.ts
        output_digest: "sha256:a2de39ac328fbffccd1c42dd26a177ef4618363bf49833dd884ee8557549ded7"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-04T00:00:00+09:00"
        evidence_path: package.json
        output_digest: "sha256:02074e3546a575a65f7d28671ede367b7fc60dafef8625bc0952ef8b19ad36e1"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-04T00:00:00+09:00"
        evidence_path: docs/plans/PLAN-L7-303-distribution-package-surface-readiness.md
        output_digest: "sha256:11325bc719c7513ef369c127f79f1d45a214eac2fb89c3221d6c0c2674a858b5"
---

# PLAN-L7-303: distribution package surface readiness の fail-close

## 目的

HELIX project setup が生成する consumer CI / VSCode task の command surface を、公開配布 tag の install 成功だけで green にしない。`bun run helix setup project --dry-run --json` など、生成された package-local command が実際に動く証跡を readiness gate にする。

## 問題

- 生成 `harness-check.yml` は package-local `bun run helix ...` command を要求する。
- 公開配布 tag の `v0.1.0` / `v0.1.4` は 2026-07-04 実測で `setup project --dry-run --json` が `unknown option '--json'` になった。
- これを `consumerReadiness.ok` に反映しないと、package.json / lockfile / VSCode task が揃っただけで first-run ready と誤認する。

## 実装方針

- `ConsumerReadinessPlan.ci.distributionPackageSurface` を追加する。
- `distribution-package-surface` check を blocking にし、probe 未実行または失敗時は `consumerReadiness.ok=false` にする。
- `runHelixProjectSetup` と `distribution plan` は `bun run helix setup project --help` を packageRoot で probe し、`--dry-run` と `--json` の公開を package-local command surface 証跡にする。
- 実行 smoke は clean distribution acceptance が linked bin で `helix setup project --dry-run --json` を実行して固定する。
- 公開配布 tag が stale の場合は、current clean artifact link smoke または version-up activation 後の配布 tag smoke まで `fix_consumer_readiness` に戻す。

## 受入条件

- U-SETUP-012: `buildConsumerReadinessPlan` は surface 証跡ありの正常系 (happy path) と、stale released 配布 tag の fail-close path を区別する。
- U-SETUP-013: clean distribution acceptance は local-link した現行 clean artifact (current clean artifact) の package-local command surface を `ci.distributionPackageSurface` として確認する。
- U-SETUP-039: `runHelixProjectSetup.consumerReadiness` は package-local setup help surface probe が成功した場合だけ ready へ進む。
- `consumerReadiness.ok=true` は whole-program / L14 completion claim ではなく、`objectiveBoundary.completionClaimAllowed=false` を維持する。

## 範囲外

- 公開配布 repository への tag push / release 更新。
- `.helix` から `.helix` への不可逆 rename/cutover。
- 認証、secret、PII、外部 API 書込、production infrastructure 変更。

## 検証予定

- `bun test tests/setup.test.ts --timeout 300000`
- `bun test tests/distribution-acceptance.test.ts --timeout 300000`
- `bun run typecheck`
- `bun test tests/design-language.test.ts tests/rule-drift.test.ts --timeout 300000`
- `bun run src/cli.ts plan lint --gate governance`
- `bun run src/cli.ts db rebuild`
- `bun run src/cli.ts doctor`
