---
plan_id: PLAN-L7-48-readiness-guardrail
title: "PLAN-L7-48: harness.db automation-readiness と guardrail-ledger"
kind: impl
layer: L7
drive: db
parent_design: docs/design/harness/L6-function-design/function-spec.md
status: completed
created: 2026-06-11
updated: 2026-06-15
agent_slots:
  - role: tl
    slot_label: 'TL - automation readiness と guardrail ledger review'
  - role: qa
    slot_label: 'QA - readiness と guardrail 証跡 review'
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    worker_model: gpt-5.4
    reviewer_model: gpt-5.3-codex
    tests_green_at: "2026-06-11"
    reviewed_at: "2026-06-11"
    verdict: pass-with-fixes
    scope: "readiness/guardrail 範囲: 証跡欠落は readiness を block し、human-required は downgrade されず、self-review / signoff 欠落は guardrail finding になる。"
generates:
  - artifact_path: src/workflow/readiness.ts
    artifact_type: source_module
  - artifact_path: src/guardrail/ledger.ts
    artifact_type: source_module
  - artifact_path: tests/readiness-guardrail.test.ts
    artifact_type: test_code
pair_artifact: docs/test-design/harness/L8-integration-test-design.md
next_pair_freeze: L8
dependencies:
  parent: docs/plans/PLAN-L7-44-harness-db-master.md
  requires:
    - docs/plans/PLAN-L7-46-projection-writer.md
    - docs/design/harness/L5-detailed-design/internal-processing.md
    - docs/design/harness/L5-detailed-design/if-detail.md
    - docs/test-design/harness/L8-integration-test-design.md
  references:
    - docs/design/harness/L5-detailed-design/physical-data.md
    - .claude/CLAUDE.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-48: harness.db automation-readiness と guardrail-ledger

## 目的

- `evaluateAutomationReadiness()` を実装し、ready / blocked / human-required projection を扱って `helix automation readiness` で公開する。
- `recordGuardrailDecision()` を実装し、guardrail / review / escalation / human signoff の decision を扱って `helix guardrail status` で公開する。

## 不変条件

- 証跡が欠落した状態は ready にならない。
- human-required 境界は DB projection により downgrade されない。
- same-model self-review と signoff 欠落は block され、表面化される。
- secret らしい内容と provider transcript 本文は保存しない。

## 完了証跡

- `src/workflow/readiness.ts`、`src/guardrail/ledger.ts`、`tests/readiness-guardrail.test.ts` が存在する。
- `bun test tests/search-feedback.test.ts tests/readiness-guardrail.test.ts tests/asset-catalog.test.ts` -> 7 件 pass。
- `bunx tsc --noEmit` -> pass.
- `bun run src/cli.ts db rebuild --json` -> pass.
- CLI smoke は pass:
  - `bun run src/cli.ts automation readiness --json`
  - `bun run src/cli.ts guardrail status --json`
- `bun run src/cli.ts doctor` -> pass.

## 補足

- 並列 smoke 実行では `automation readiness` で一過性の `SQLiteError: database is locked` が 1 件発生した。直列 rerun は pass。concurrent-writer support を明示設計するまでは、DB 書込を伴う smoke command は直列実行する。

## DoD

- [x] IT-AUTOMATION-01 / GUARDRAIL-01 green.
- [x] `automation readiness` / `guardrail status` は実行可能で、不変条件を維持している。
- [x] regression slice + doctor は green で、review evidence が存在する。

## §Deferred — `recordGuardrailDecision` 本番配線 (explicit_l7_defer, auth-gated, 2026-06-15)

L7 完全実装監査 (PLAN-L7-52 C-1) で「`recordGuardrailDecision` が本番の decision source から未配線 (唯一の呼出元はテスト) で formal defer が記録されていない」と指摘された。本節でその defer を明示記録する (CLAUDE.md: 明示 defer は under-design でない)。

- **defer 対象**: `recordGuardrailDecision` の本番 decision-source 配線 — agent-guard / review_evidence / escalation / human-signoff の各 decision を ledger 経由で記録し、`normalizeDecision` の安全不変条件 (same-model→block / human-required→block / secret reject) を本番に適用する経路。
- **defer 根拠 (auth-gated、solo 確定禁止)**: この配線は **authorization / human-signoff semantics の確定 + automation-readiness gate への本番影響**を伴う。CLAUDE.md Guard Rule「認証・認可・本番影響・human-signoff は人間確認なしに仕様確定しない」に直接該当するため PM solo で確定しない。
- **現状の安全性 (active な漏洩リスクなし)**: 本番の `guardrail_decisions` 書込 (`projectIssueApprovalGuardrails`) は `SECRET_PATTERN` SSoT 経由で secret-safe (PLAN-L7-52 WBS-03)。`recordGuardrailDecision` の安全ロジックは単体テスト済 (tests/readiness-guardrail.test.ts: secret-reject 4族 / human-required 昇格・非降格)。
- **owner / condition**: owner = PO。condition = PO が配線方針 (どの decision source を ledger 経由にするか / issue 承認 vocabulary との統合または分離) を確定後、`rebuildHarnessDb` の projection に配線して本 defer を discharge する。それまで `recordGuardrailDecision` は単体テスト済の ledger library として保持。

### 再検証 (2026-06-19, PM 実体確認 — 前監査リスクの裏取り)

PO 依頼でこの defer のリスク封じ込めを実コードで再照合した (宣言でなく中身):

- **未配線は事実**: `recordGuardrailDecision(` の呼出元は定義元 (`src/guardrail/ledger.ts`) と
  `tests/readiness-guardrail.test.ts` のみ。本番 decision source からの呼出は無い (監査指摘どおり)。
- **active な漏洩リスクは無い (裏取り済)**: 本番の `guardrail_decisions` 書込は
  `projectIssueApprovalGuardrails` (`rebuildHarnessDb` に配線) 経由で、全 projection 列が
  `SECRET_PATTERN` 列ガード (`projection-writer.ts` の secret 検出) を通る = secret-safe。安全不変
  条件 (same-model→block / human-required→block / secret-reject) は `inspectGuardrailInvariants`
  (`src/state-db/guardrail-invariants.ts`) に SSoT 抽出され、write 経路 (fail-close) と projection
  advisory 経路 (`projectGuardrailInvariantAdvisories`、warn-first、`rebuildHarnessDb` に配線) が
  共有。単体テスト被覆済。
- **残るのは PO 所有の auth-gated 配線方針判断のみ**。隠れ穴は無い。CLAUDE.md の escalation 境界
  (認可・human-signoff) と `solo 確定禁止` により PM が独断配線しない方針を維持。本 defer は据え置き。
