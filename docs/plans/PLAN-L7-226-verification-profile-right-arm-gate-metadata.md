---
plan_id: PLAN-L7-226-verification-profile-right-arm-gate-metadata
title: "PLAN-L7-226 (add-impl): verification profile right-arm gate metadata"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-02
updated: 2026-07-02
owner: Codex
parent_design: docs/process/forward/L08-L14-verification-phase.md
agent_slots:
  - role: tl
    slot_label: "TL - right-arm verification profile semantic gate"
generates:
  - artifact_path: docs/plans/PLAN-L7-226-verification-profile-right-arm-gate-metadata.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-226-verification-profile-right-arm-gate-metadata.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L08-L14-verification-phase.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/verification-profile-types.ts
    artifact_type: source_module
  - artifact_path: src/lint/verification-profile-catalog.ts
    artifact_type: source_module
  - artifact_path: src/lint/verification-profile.ts
    artifact_type: source_module
  - artifact_path: tests/verification-profile.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-168-verification-profile-type-split.md
  requires:
    - docs/plans/PLAN-REVERSE-226-verification-profile-right-arm-gate-metadata.md
    - docs/process/forward/L08-L14-verification-phase.md
    - docs/test-design/harness/L7-unit-test-design.md
    - docs/plans/PLAN-L7-59-detector-hardening.md
    - docs/plans/PLAN-L7-168-verification-profile-type-split.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-02T02:32:14+09:00"
    tests_green_at: "2026-07-02T02:32:00+09:00"
    verdict: approve
    scope: "verification-profile now carries right-arm G8-G14 / drive metadata and doctor hard-gates G10 browser profile coverage for always-L10 drives. Regression tests cover live coverage and fail-closed removal of all G10 browser mappings."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/verification-profile.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-02T02:28:03+09:00"
        evidence_path: tests/verification-profile.test.ts
        output_digest: "sha256:91c13afb2897fa5cf331af4832764c82f25796024663d61b3a04f9ae1f7ef6ac"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T02:29:00+09:00"
        evidence_path: src/lint/verification-profile.ts
        output_digest: "sha256:eb8d3db6abe93e485ca7b586e8e61968596212016e523f0e90e3ab2edd63ea11"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T02:29:00+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:28f379e9d0fcb4d236f441ed22ff1a150f9bcb8559123f2f8e3bf21dfb2b3e3a"
---

# PLAN-L7-226: verification profile right-arm gate metadata

## 目的

`verification-profile` が変更ファイルから profile を推薦するだけで、右腕 verification の `G8-G14` と
drive 別 L10 要否に意味接続していなかった gap を閉じる。doctor green が「profile はあるが、どの gate を
支えるか不明」という状態を通さないようにする。

## 公式 source ledger (checked 2026-07-02)

| source | 採用根拠 |
|---|---|
| <https://playwright.dev/docs/browser-contexts> | browser context isolation を G10/G11 browser evidence の前提にする。 |
| <https://playwright.dev/docs/accessibility-testing> | accessibility finding を G10/G11 evidence に含める。 |
| <https://vitest.dev/guide/browser/> | Vitest Browser Mode + Playwright provider を test-foundation browser profile にする。 |
| <https://node.testcontainers.org/> | Testcontainers を DB/integration profile にする。 |
| <https://mswjs.io/docs/> | MSW を API mock / contract-adjacent profile にする。 |
| <https://sre.google/sre-book/release-engineering/> | release evidence を G12 以降の profile 接続根拠にする。 |
| <https://sre.google/workbook/canarying-releases/> | post-deploy / canary evidence を G13/G14 profile 接続根拠にする。 |
| <https://csrc.nist.gov/pubs/sp/800/218/final> | secure software evidence traceability を G8-G14 全体の根拠にする。 |

## スコープ

- `VerificationProfile` に `recommendedGates` / `recommendedDrives` を追加する。
- catalog の browser / integration / API mock / GitHub / doctor profile を G8-G14 と drive に接続する。
- `analyzeRightArmVerificationProfileCoverage` を追加し、G8-G14 の profile 欠落と `fe` / `fullstack` /
  `agent` の G10 browser profile 欠落を fail-close する。
- `analyzeVerificationProfileGate` の doctor hard gate に right-arm coverage findings を合流する。
- U-MCPPROFILE-015/016 を unit test design と `tests/verification-profile.test.ts` に追加する。

## 非スコープ

- 新規外部ツールのインストール、MCP server 実行、`.vscode/mcp.json` の書き込み。
- 右腕 G8-G14 の実 execution manifest 作成。これは既存の G8 workflow / child PLAN 側の責務。
- 不可逆 rename / state migration / production release 操作。

## 受入条件

- catalog の profile は G8-G14 / drive metadata を持つ。
- `fe` / `fullstack` / `agent` から全 G10 browser profile metadata を外した fixture は
  `missing-drive-g10-profile` で fail する。
- doctor の `verification-profile` hard gate が right-arm coverage finding を含む。
- `bun run vitest run tests/verification-profile.test.ts`、typecheck、lint、DB rebuild、doctor が通る。
