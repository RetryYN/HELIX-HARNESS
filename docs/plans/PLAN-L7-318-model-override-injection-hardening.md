---
plan_id: PLAN-L7-318-model-override-injection-hardening
title: "PLAN-L7-318 (impl): model-override injection hardening (security) — prefix-only schema + shell:true の注入面を確定・封鎖"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: PO (人間) / Claude (Opus) / Codex
parent_design: docs/design/harness/L5-detailed-design/if-detail.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
pair_artifact: tests/model-override-injection.test.ts
agent_slots:
  - role: se
    slot_label: "SE — modelOverrideSchema を allowlist/strict pattern 化、adapter の shell:true を排除または引数を厳格 escape"
  - role: tl
    slot_label: "TL/security — model override → shell:true 起動への data-flow 実到達性を確定 (security-audit)、安全境界レビュー"
  - role: qa
    slot_label: "QA — injection payload (末尾任意文字・shell metachar) の fail-close 回帰"
generates:
  - artifact_path: docs/plans/PLAN-L7-318-model-override-injection-hardening.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
    artifact_type: markdown_doc
  - artifact_path: src/schema/team.ts
    artifact_type: source_module
  - artifact_path: src/runtime/adapter.ts
    artifact_type: source_module
  - artifact_path: tests/team-schema.test.ts
    artifact_type: test_code
  - artifact_path: tests/runtime-adapter.test.ts
    artifact_type: test_code
  - artifact_path: tests/model-override-injection.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
review_evidence:
  - reviewer: codex-hilbert
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-04T22:11:47+09:00"
    tests_green_at: "2026-07-04T22:11:47+09:00"
    verdict: approve
    scope: "PLAN-L7-318: modelOverrideSchema strict pattern + Windows command-script shell wrapping unsafe argv fail-close。High/Medium findings なし。残リスクは Windows .cmd/.bat 互換のため shell:true 自体を残す点で、PLAN-L7-320 の別 hardening 対象。"
    worker_model: codex
    reviewer_model: codex-hilbert
    green_commands:
      - kind: unit_test
        command: "npm test tests/design-language.test.ts tests/readability.test.ts tests/model-override-injection.test.ts tests/runtime-adapter.test.ts tests/team-schema.test.ts tests/semantic-frontier-consistency.test.ts tests/goal-evidence-audit.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T22:11:47+09:00"
        evidence_path: tests/model-override-injection.test.ts
        output_digest: "sha256:03255406098ffdfe467062f19a3a7dc3b5560d939d74d5c76d7994d884a9c5a6"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T22:11:47+09:00"
        evidence_path: src/runtime/adapter.ts
        output_digest: "sha256:03255406098ffdfe467062f19a3a7dc3b5560d939d74d5c76d7994d884a9c5a6"
---

# PLAN-L7-318 (impl): model override 注入面の追加 hardening

## Objective

上流突合の security 確認（audit §4）で、上流が Security-HIGH で park していた model-override injection 面が
LOCAL にも構造的に存在すると判明した。旧 `modelOverrideSchema` は prefix-only で末尾任意文字を許容し、
Windows `.cmd` / `.bat` 解決時の `buildProviderInvocation()` は `shell: true` で argv を cmd 文字列へ畳む。
`members[].model` から provider argv の `-m` / `--model` まで到達する data-flow があるため、安全境界
（コマンド実行）として PO escalation 済みのうえで schema と adapter 境界の二段で封鎖する。

## スコープ

### IN
- data-flow 検証: model override 文字列が `shell: true` 起動へ到達する経路の実在を security-audit で確定。
- `modelOverrideSchema` を allowlist または strict pattern（末尾含め厳格）へ硬化。
- `adapter.ts` の Windows command-script shell wrapping 境界で、危険 argv を shell 文字列へ畳む前に fail-close。
- injection payload（末尾任意文字・shell metachar）の fail-close 回帰 test。

### OUT
- 認証・認可・決済・PII・production infra は変更しない（本 PLAN は command-exec 安全境界のみ）。
- Windows `.cmd` / `.bat` 互換のため、`shell: true` の完全撤去は本 PLAN では行わない。

## 受入条件
- security-audit で data-flow 実到達性を確定（到達する/しないを evidence 付きで記録）。
- 硬化後、injection payload が fail-close し、正当な model id/alias は通る。
- schema を迂回した危険 argv も、Windows `.cmd` / `.bat` shell wrapper 境界で fail-close する。
- targeted test green、doctor / lint / typecheck / plan lint green。confirmed 前に review evidence 記録。

## スケジュール
- mode: serial。
- Step 1: security-audit で model override → shell:true の data-flow 実到達性を確定（TL/security、PO escalation 下）。完了。
- Step 2: modelOverrideSchema を allowlist/strict 化（Red→Green）。完了。
- Step 3: adapter の shell wrapping 境界で危険 argv を fail-close。完了。
- Step 4: injection payload 回帰 test → review → confirmed。

## 壊さない / 再発させない
- 安全境界変更のため PO escalation を前提とし、推測で修正を confirmed 化しない。
- 正当な model id/alias（gpt-*/claude-*/codex-*/family alias）を誤 reject しない。
- プロンプト本文は引き続き stdin で渡し、cmd.exe shell 文字列へ載せない。

## レビュー / 次工程
- security 事項のため、別 agent review と targeted green command を confirmed の前提とする。基準点は HEAD。
- 出典: [[upstream-helix-reconciliation]] audit §4 / §5 Tier3。
