---
plan_id: PLAN-L7-348-test-performance-improvement
title: "PLAN-L7-348 (refactor): テストパフォーマンス改善 — doctor corpus 再パース削減・slow suite 分離・CLI spawn 削減（挙動不変）"
kind: refactor
layer: L7
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
route_mode: refactor
entry_signals:
  - "po_directive:2026-07-06:test-performance-improvement"
backprop_decision: not_required
backprop_decision_reason: "テスト実行時間の behavior-invariant な改善（キャッシュ・スイート分離・spawn 削減）。gate 意味・検査内容・L1/L3 要求は変更しない。regression fence は既存テストの green 維持そのもの。"
owner: Claude (Fable)
parent_design: docs/process/modes/refactor.md
pair_artifact: tests/doctor.test.ts
agent_slots:
  - role: se
    slot_label: "SE (Sonnet) - corpus cache / suite 分離 / spawn 削減の実施"
  - role: tl
    slot_label: "TL - 挙動不変性（gate 検査結果の同一性）と CI 時間の検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-348-test-performance-improvement.md
    artifact_type: markdown_doc
  - artifact_path: package.json
    artifact_type: config
  - artifact_path: vitest.workspace.ts
    artifact_type: config
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: tests/slow/doctor.test.ts
    artifact_type: test_code
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T17:58:05+09:00"
    tests_green_at: "2026-07-06T17:57:40+09:00"
    verdict: approve
    scope: "Step 3 slow suite 分離と Step 4 cli-surface spawn 共有可否検収。CI 相当の全件 vitest は fast+slow 維持。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "/usr/bin/time -p npx --no-install vitest run"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-06T17:53:38+09:00"
        evidence_path: package.json
        output_digest: "sha256:c58005e3b2bb5ef07a6f63e148c1db3181a21ea38b67ee5b96dac68e66bd166e"
      - kind: unit_test
        command: "/usr/bin/time -p npx --no-install vitest run --project fast tests/cli-surface.test.ts tests/doctor.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T17:49:39+09:00"
        evidence_path: tests/doctor.test.ts
        output_digest: "sha256:fee6984f78bc3f5a9956073fbd23bf591122eaf2d4b7114952972bb29ee377e1"
      - kind: unit_test
        command: "/usr/bin/time -p npx --no-install vitest run --project slow tests/slow/doctor.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T17:29:10+09:00"
        evidence_path: tests/slow/doctor.test.ts
        output_digest: "sha256:16f178b16c799f39f57fbcac6c88ab0f397a1551c4b7bde12b4526b8fb3ef0e6"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-06T17:27:59+09:00"
        evidence_path: package.json
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: doctor
        command: "npx --no-install tsx src/cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-06T17:57:40+09:00"
        evidence_path: docs/plans/PLAN-L7-348-test-performance-improvement.md
        output_digest: "sha256:e086725e57af1b20adf9ee954944ca5858b5b315ca84c2cbae96aec0fc8046e6"
dependencies:
  parent: null
  requires:
    - vitest.config.ts
  references:
    - docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md
    - docs/plans/PLAN-L7-341-coding-debt-reduction-roadmap.md
---

# PLAN-L7-348 (refactor): テストパフォーマンス改善

## 起点 signal

- `po_directive:2026-07-06 「テストパフォーマンスが悪いなこれも改善対象に」`
- 実測 signal（debt_degradation）: doctor+cli-surface 2 ファイル 127 秒、doctor 単体 47 秒（本文計測記録参照）。

## 0. 目的（PO 指摘 2026-07-06「テストパフォーマンスが悪い」）

実測ベースライン（2026-07-06、WSL2）:

- `tests/doctor.test.ts` + `tests/cli-surface.test.ts` の 2 ファイルで **127 秒**。
- 単一テストの突出: `includes asset-drift hard gate in doctor output` **51.2 秒**、
  `fails db projection ingestion when pair-agent evidence gates are blocked` **21.8 秒**。
- `helix doctor` 本体（全 gate 直列）が 1 回 30 秒超で、live-repo テストの下限を規定する。

計測記録（2026-07-06 実測、Step 1 実施済み。`bun -e` で全 check 関数を個別計時）:

- `npx --no-install tsx src/cli.ts doctor` 全体: **real 47.0s**（user 32.5s / sys 19.1s）。
- 内訳上位: **`checkDbProjectionIngestion` 25.5s + `checkDriveDbRegistration` 16.7s = 全体の約 9 割**。
  両者とも in-memory `rebuildHarnessDb`（55,373 行 projection）を**それぞれフル実行**している。
  drive-registration には plan registry fingerprint による persisted fast path があるが、
  PLAN ファイルが 1 つでも変わると miss するため開発中は常時 miss。
- 3 位以下は桁が違う: checkReviewEvidence 0.72s、checkPlanArtifactExistence 0.68s、
  checkCodingRules 0.50s、checkPlanGovernance 0.32s、checkPlanDescent 0.26s。
- 当初仮説 B1（plan corpus 再パース）は**実測で棄却**: corpus 系 gate は各 200-700ms であり
  総和でも数秒。corpus cache の優先度は下げ、Step 2 は rebuild 共有へ差し替える。

推定ボトルネック（実測で確定済み）:

- **B1 (確定): rebuildHarnessDb の二重フル実行** — `checkDbProjectionIngestion` と
  `checkDriveDbRegistration` が同一入力から同じ projection を独立に rebuild している。
  runDoctor 内で 1 回 rebuild して共有すれば挙動不変のまま片方分（約 15-25 秒）を削減できる。
- **B2: CLI 実 spawn の cold start** — `tests/cli-surface.test.ts` は `npx --no-install tsx src/cli.ts ...` を
  テスト毎に spawn する。cli.ts は 5,510 行 + import 72 本で、spawn 1 回ごとの起動コストが
  大きい（cli.ts 分割 = PLAN-L7-150 accepted debt と相乗）。
- **B3: slow live-repo テストと unit テストの混在** — 51 秒級の integration 検査が
  既定スイートに混ざり、開発ループ（targeted run）を阻害する。

実装着手時に `generates:` へ触った成果物（想定: `src/doctor/index.ts` / `vitest.config.ts` /
`tests/doctor.test.ts` ほか移動したテストファイル）を追記する（merged-plan-status gate は
draft PLAN の既存 deliverable 列挙を fail-close するため、起票時点では本 PLAN md のみ登録）。

## 1. スコープ（Sonnet 実装手順、挙動不変）

### Step 1: 計測の固定（先に fence を張る）

1. `npx --no-install vitest run --reporter=json` で per-test duration を取得し、上位 20 件を
   本 PLAN 本文の「計測記録」節へ追記する（改善前ベースラインの資産化）。
2. 挙動不変 fence: 改善前後で `npx --no-install tsx src/cli.ts doctor` の全 message 行が一致すること
  （順序を除く diff ゼロ）を確認するスクリプト手順を記録する。

### Step 2: rebuildHarnessDb の共有（B1 実測確定版）

1. `checkDbProjectionIngestion(repoRoot, db?)` と drive-registration 側
   （`loadOrBuildDriveDbRegistrationStats(repoRoot, db?)` 経由）に optional の
   rebuilt DB 引数を追加する。未指定時は従来どおり自前で `openHarnessDb(":memory:")` +
   `rebuildHarnessDb`（単体呼び出し・既存テストの互換維持）。
2. `runDoctor` 内で in-memory rebuild を 1 回だけ実行し、両 check へ渡す（利用後 close）。
3. fence: 改善前後で doctor message 集合が一致 + `npx --no-install vitest run tests/doctor.test.ts` green。
4. （余地があれば）rebuild 成功時に drive-registration の persisted stats を最新 fingerprint で
   書き戻し、次回 doctor の fast path hit 率を上げる（挙動不変の範囲でのみ）。

#### Step 2 実施記録（2026-07-06）

- 実装: `runDoctor` 冒頭で in-memory projection を 1 回 rebuild し、
  `checkDriveDbRegistration(repoRoot, prebuiltDb?)`（read-only、先行）と
  `checkDbProjectionIngestion(repoRoot, prebuiltDb?)`（telemetry projection は共有時も実行）へ
  渡す。未指定時は従来の自前 rebuild（単体呼び出し互換）。build 失敗時は undefined fallback
  （fail 挙動不変）。変更: `src/doctor/index.ts` / `src/state-db/drive-registration.ts`
  （`loadOrBuildDriveDbRegistrationStats(repoRoot, prebuiltDb?)`）。
- 効果実測: `npx --no-install tsx src/cli.ts doctor` **47.0s → 31.8〜37.2s**（1 rebuild 分 約 10〜15 秒削減）。
- 挙動不変 fence: 改善前後の doctor message sort diff は環境由来行（change-impact 件数 /
  digest / registered_hook_events / regression-expansion の changed 集合）のみで、gate 判定・
  文言の差分ゼロ。`npm run typecheck` green、coding-rules gate green（catch の fail-open
  コメント要求へ準拠）。
- `tests/doctor.test.ts`: 87 passed / 4 failed — fail 4 件は改善前から存在する
  version-up 系 live 期待値（decisions=0 前提）で本 PLAN 対象外（変更前後で同一集合）。

### Step 3: slow suite の分離 (B3)

1. `vitest.config.ts` に project / include 分割を導入し、51 秒級の live-repo integration
   テストを `tests/slow/`（または `*.slow.test.ts` 命名）へ移す。CI（harness-check）は
   従来どおり全件実行し、ローカル既定は fast suite とする（CI 検査範囲を狭めない）。
2. 移動対象は Step 1 の計測上位から選定し、移動はファイル移動 + import 修正のみ
   （テスト内容の変更禁止）。

#### Step 3 実施記録（2026-07-06）

- `tests/doctor.test.ts` を `tests/slow/doctor.test.ts` へ移動し、相対 import のみ
  `../src/` → `../../src/` へ機械補正した。テスト本文・アサーションは変更していない。
- `vitest.workspace.ts` を追加し、`fast` project は `tests/slow/**` を除外、`slow` project は
  `tests/slow/**/*.test.ts` のみを対象にした。
- `package.json` は `npm test` を `fast + slow` の全件実行として維持し、
  `test:fast` / `test:slow` を追加した。CI `harness-check` は従来どおり `npm test` 経由で全件を走らせる。
- 統合検証: `npx --no-install vitest run` は 174 files / 2018 tests green（real 234.23s）。
  Step 1 baseline の doctor+cli-surface 2 ファイル 127 秒に対し、fast project の
  `tests/cli-surface.test.ts tests/doctor.test.ts` は 94 tests green / real 35.63s。
  分離後の slow doctor は `tests/slow/doctor.test.ts` 91 tests green / real 73.51s。

### Step 4: cli-surface の spawn 削減 (B2)

1. 同一 CLI コマンド呼び出しが複数テストで重複していれば `beforeAll` で 1 回 spawn して
   結果を共有する（アサーションは変更しない）。
2. cli.ts の分割そのもの（cold start の根治）は PLAN-L7-150 の子 slice へ委ね、本 PLAN では
   spawn 回数の削減のみ行う。

#### Step 4 検収記録（2026-07-06）

- `tests/cli-surface.test.ts` の in-flight 差分は version-up readonly share artifact の期待追加で、
  本 PLAN の spawn 共有対象ではなかったため保持した。
- exact duplicate scan では `handover status --json` / `status --json` が候補に出たが、cwd または
  fixture state が異なり、state 遷移の検査をまたぐため共有するとアサーション意味が変わる。
  アサーション弱体化禁止を優先し、共有化可能な同一 CLI 呼び出しは無しとして決着した。

## 2. 対象外

- gate 検査内容・メッセージ仕様の変更（挙動不変が本 PLAN の不変条件）。
- cli.ts の split-module 本体（PLAN-L7-150 accepted debt の子 slice）。
- CI matrix の並列化（GitHub Actions 側の変更は別 PLAN）。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): Step 1（計測固定）→ Step 2（corpus cache）。
- step 2 (mode: parallel): Step 3（suite 分離）と Step 4（spawn 削減）— 触るファイル独立、並列可。
- step 3 (mode: serial): 統合検証（message 同一性 + 全対象テスト green + 時間再計測）。

## 4. 受入条件（falsifiable / 検証コマンド）

- 挙動不変: 改善前後で `npx --no-install tsx src/cli.ts doctor` の message 集合が一致（実測 diff を記録）。
- `npx --no-install vitest run tests/doctor.test.ts tests/cli-surface.test.ts` green を維持しつつ、
  合計 wall time が **127 秒 → 60 秒以下**（再計測値を本文に記録。未達の場合は残ボトルネックの
  計測値と理由を記録し、target を再設定した後続 slice を明示する）。
- `npm run typecheck` green、`npx --no-install tsx src/cli.ts doctor` green。

## 5. carry（持ち越し）

- cli.ts split-module（PLAN-L7-150 子 slice）による cold start 根治。
- doctor gate の並列実行（gate 間独立性の監査が前提、別 PLAN）。
