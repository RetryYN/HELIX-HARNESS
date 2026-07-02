---
plan_id: PLAN-L7-228-version-up-external-source-ledger
title: "PLAN-L7-228 (troubleshoot): version-up 外部 activation source ledger 必須行の enforcement 強化"
kind: troubleshoot
layer: L7
drive: be
status: confirmed
created: 2026-07-02
updated: 2026-07-02
backprop_decision: not_required
backprop_decision_reason: "docs/process/modes/version-up.md は Cloudflare / GitHub webhook / Access を既に source ledger に要求している。本 slice は既存設計の実装漏れを塞ぐ troubleshoot であり、新しい product requirement や外部 API/DB contract は追加しない。"
owner: TL (Codex)
parent_design: docs/process/modes/version-up.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM - version-up 外部 source ledger と要求意味の整合確認"
  - role: tl
    slot_label: "TL - version-up external source ledger enforcement"
  - role: qa
    slot_label: "QA - external activation source row regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-228-version-up-external-source-ledger.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/version-up-readiness.ts
    artifact_type: source_module
  - artifact_path: tests/version-up-readiness.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-211-version-up-readiness-gate.md
  requires:
    - docs/plans/PLAN-L7-211-version-up-readiness-gate.md
    - docs/plans/PLAN-L7-218-version-up-reapproval-triggers.md
    - docs/process/modes/version-up.md
review_evidence:
  - reviewer: TL self-review (single-runtime)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-02T04:46:00+09:00"
    tests_green_at: "2026-07-02T04:45:00+09:00"
    verdict: pass
    scope: "version-up source ledger の必須行 enforcement が SemVer/GitHub release 系だけで、外部 activation の Cloudflare Pages/Workers/D1/KV/Access と GitHub webhook HMAC を missing row として扱っていなかった穴を補修。公式 source は 2026-07-02 に Cloudflare / GitHub / NIST / SLSA / Google SRE / OWASP の一次情報を確認し、既存 ledger の採用判断と矛盾しないことを確認した。"
    worker_model: gpt-5.5
    reviewer_model: gpt-5.5
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/version-up-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-02T04:40:38+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:110e8bd9e26b1e50747d8ed204df4a8b9781459676296a86c5372db699cde249"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T04:45:00+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:bf3952366d4eac2233d6e3f017ffb7ad681b28da0f639e1660da00de1186de83"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T04:45:00+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:d70140fb130d8a9ecba8ff31a84823cfd44b12b03d5d04b281cb4cbe94636f05"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T04:45:00+09:00"
        evidence_path: docs/process/modes/version-up.md
        output_digest: "sha256:34cc5da3c58cb4b50e26dc1327ca89b3d3c8683db15b5a523a233bb37b4bd9e4"
---

# PLAN-L7-228: version-up 外部 activation source ledger 必須行の enforcement 強化

## 0. 目的

`docs/process/modes/version-up.md` は、serverless read-only share の future activation に Cloudflare
Pages/Workers/D1/KV/Access と GitHub webhook HMAC の公式 source ledger を要求している。一方で
`version-up-readiness` の必須 source row は SemVer / GitHub Releases / release automation 系に偏っており、
外部 activation の source row を削っても missing row として十分に検出できない余地があった。

本 PLAN はその実装漏れを塞ぐ。`PLAN-L7-146` の parked 状態、`version_target: future`、action-binding approval 境界、
`activationAllowed=false` は変更しない。

## 1. 実装

- `REQUIRED_SOURCE_LEDGER_ROWS` に以下の 6 行を追加する。
  - `Cloudflare Pages limits`
  - `Cloudflare Workers limits`
  - `Cloudflare D1 limits`
  - `Cloudflare Workers KV limits`
  - `Cloudflare Access policies`
  - `GitHub webhook HMAC SHA-256`
- `tests/version-up-readiness.test.ts` に、prose marker は残っていても source ledger table row が欠ける場合に
  `missingSourceLedgerRows` へ外部 activation 6 行が出る regression を追加する。

## 2. 公式 source 確認

2026-07-02 に以下の一次情報を確認した。既存 ledger の採用判断と矛盾する変更は見つからなかった。

- Cloudflare Pages / Workers / D1 / KV / Access の公式 docs。
- GitHub webhook HMAC SHA-256 検証の公式 docs。
- GitHub Actions concurrency の公式 docs。
- NIST SSDF SP 800-218 final / Rev. 1 draft の公式ページ。
- SLSA v1.2 / provenance の公式仕様。
- Google SRE release engineering の公式 guidance。
- OWASP LLM06:2025 Excessive Agency の公式 entry。

2026-07-02 再監査で、Cloudflare Access policies の現行公式 URL は
`https://developers.cloudflare.com/cloudflare-one/access-controls/policies/` と確認した。旧
`https://developers.cloudflare.com/cloudflare-one/policies/access/` は source ledger の期待 URL として扱わず、
`version-up-readiness` の URL drift で fail-close する。

## 3. 受入条件

- [x] 外部 activation の source ledger 6 行が `REQUIRED_SOURCE_LEDGER_ROWS` に含まれる。
- [x] Cloudflare / GitHub webhook row を ledger table から落とした fixture が fail する。
- [x] Cloudflare Access policies が旧 URL のままなら URL drift として fail する。
- [x] live repo の `version-up-readiness` は引き続き green。
- [x] `PLAN-L7-146` は activation されず、external infra / auth / secret / webhook 変更は行わない。
