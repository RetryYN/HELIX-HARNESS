---
plan_id: PLAN-L7-346-test-plan-id-remediation
title: "PLAN-L7-346 (impl): missing-test-plan-id 再発是正 — 4 PLAN への test_code generates 追記と孤児 doc-lint テストのオーナー接続"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "既存 PLAN の generates frontmatter への test_code 追記と、孤児テストのオーナー PLAN 接続のみ。テスト・実装の挙動、gate 意味、L1/L3 要求は変更しない。PLAN-L7-143/144 と同型の warn remediation。"
owner: Claude (Fable)
parent_design: docs/plans/PLAN-L7-144-warn-remediation-parity-and-join.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
review_evidence:
  - reviewer: codex-cli
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T08:51:33+09:00"
    tests_green_at: "2026-07-06T08:51:33+09:00"
    verdict: pass
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "PLAN-L7-346: 4 PLAN の test_code generates 補完、孤児 doc-lint 3 テストの本 PLAN 所有登録、PLAN 規則への同時登録観点追記。db rebuild 後に missing-test-plan-id が 0 件であること、対象 PLAN lint と git diff whitespace check が green であることを確認した。"
    green_commands:
      - kind: smoke
        command: "bun run src/cli.ts db rebuild"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T08:51:33+09:00"
        evidence_path: .helix/harness.db
        output_digest: "sha256:ac896fd654918db3a54889765e8173a2d5bc2fba293e890dc34e55fd38aed6a7"
      - kind: smoke
        command: "bun src/cli.ts feedback list --emit | awk '/missing-test-plan-id/ {count++} END {print count+0}'"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T08:51:33+09:00"
        evidence_path: .helix/harness.db
        output_digest: "sha256:ac896fd654918db3a54889765e8173a2d5bc2fba293e890dc34e55fd38aed6a7"
      - kind: lint
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L7-175-helix-orchestration-memory-impl.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T08:51:33+09:00"
        evidence_path: docs/plans/PLAN-L7-175-helix-orchestration-memory-impl.md
        output_digest: "sha256:db88bd72290a44531c4ba09f052316ad87d5daad76c486ab2b107f7ea8990186"
      - kind: lint
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L7-176-helix-orchestration-memory-runtime.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T08:51:33+09:00"
        evidence_path: docs/plans/PLAN-L7-176-helix-orchestration-memory-runtime.md
        output_digest: "sha256:d4dc9a3204814d62618841ee18f0366ee2d2166fb2b5b53ebd3c2005fc6835f3"
      - kind: lint
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T08:51:33+09:00"
        evidence_path: docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
        output_digest: "sha256:0e71ecc48610d5ab481d788d4e5a864ebb9b46c3eed277e6caf2f658b96a5716"
      - kind: lint
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L7-94-outstanding-work-surface.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T08:51:33+09:00"
        evidence_path: docs/plans/PLAN-L7-94-outstanding-work-surface.md
        output_digest: "sha256:7007c462837d11d0b2863689f1b6e8320ef4db15481197d0e405dc80d964bf18"
      - kind: lint
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L7-346-test-plan-id-remediation.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T08:51:33+09:00"
        evidence_path: .claude/CLAUDE.md
        output_digest: "sha256:16af3438deb9fd26597d4365fdb94c6c3ff8c8c01a06f9cc66aa06f1763bc6e7"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-06T08:51:33+09:00"
        evidence_path: .claude/CLAUDE.md
        output_digest: "sha256:16af3438deb9fd26597d4365fdb94c6c3ff8c8c01a06f9cc66aa06f1763bc6e7"
agent_slots:
  - role: se
    slot_label: "SE (Sonnet) - generates 追記と孤児テストのオーナー特定"
  - role: qa
    slot_label: "QA - feedback actionable count の減少検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-346-test-plan-id-remediation.md
    artifact_type: markdown_doc
  - artifact_path: tests/helix-evidence-boundaries.test.ts
    artifact_type: test_code
  - artifact_path: tests/helix-related-pairs.test.ts
    artifact_type: test_code
  - artifact_path: tests/source-ledger-freshness.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-143-harness-db-warn-remediation.md
    - docs/plans/PLAN-L7-144-warn-remediation-parity-and-join.md
  references:
    - docs/plans/PLAN-L7-175-helix-orchestration-memory-impl.md
    - docs/plans/PLAN-L7-176-helix-orchestration-memory-runtime.md
    - docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
    - docs/plans/PLAN-L7-94-outstanding-work-surface.md
---

# PLAN-L7-346 (impl): missing-test-plan-id 再発是正

## 0. 目的

harness.db の actionable feedback に `missing-test-plan-id` warn が 19 件 open で残っている
（2026-07-06 実測、`bun src/cli.ts feedback list --emit`）。PLAN-L7-143/144 で過去 16 ファイル分を
0 件化した後、新規テスト追加時に同型の登録漏れが再発したもの。2026-07-06 検査で根本原因を
2 タイプに分類済み:

- **タイプ A（4 ファイル / 13 件）: オーナー PLAN はあるが `generates:` に test_code 未登録**
  | テストファイル | オーナー PLAN |
  |---|---|
  | `tests/memory/memory-store.test.ts`（5 件） | PLAN-L7-176 |
  | `tests/memory/memory.test.ts`（3 件） | PLAN-L7-175 |
  | `tests/orchestration/loop-bridge.test.ts`（2 件） | PLAN-L7-177 |
  | `tests/poc-s3-s4-boundary.test.ts`（3 件） | PLAN-L7-94 |
- **タイプ B（3 ファイル / 6 件）: どの PLAN の成果物としても登録されていない孤児 doc-lint テスト**
  `tests/helix-evidence-boundaries.test.ts`（1 件）、`tests/helix-related-pairs.test.ts`（2 件）、
  `tests/source-ledger-freshness.test.ts`（3 件）。

## 1. スコープ（Sonnet 実装手順）

### Step 1: タイプ A — generates 追記（機械的）

1. 上表 4 PLAN の frontmatter `generates:` に、対応テストファイルを
   `artifact_type: test_code` で追記する（既存エントリの順序・内容は変更しない）。
2. 各 PLAN の `updated:` を実施日に更新し、本文に 1 行の追記注記
   （「PLAN-L7-346 により test_code generates を追記」）を加える。confirmed PLAN の
   claim 本体は変更しない（silent overwrite に当たらない機械的登録補完であることを注記に明記）。

### Step 2: タイプ B — 孤児テストのオーナー特定と接続

1. 各テストファイルについて `git log --follow --diff-filter=A -- <path>` で追加コミットを特定し、
   コミットメッセージ・同コミットの PLAN 変更から実装元 PLAN を特定する。
2. 特定できた場合: その PLAN の `generates:` へ Step 1 と同様に追記。
3. 特定できない場合: 本 PLAN（PLAN-L7-346）の `generates:` に当該テストを `test_code` として
   追加登録し、本文にオーナー調査の結果（候補と判断根拠）を記録する。孤児のまま放置しない。

### Step 3: 検証と再発防止メモ

1. `bun run src/cli.ts db rebuild`（コマンド名が異なる場合は projection 再構築コマンドを
   `bun src/cli.ts --help` で特定）後、`bun src/cli.ts feedback list --emit` で
   `missing-test-plan-id` count が 19 → 0 になることを確認する。
2. 再発防止: 検出器（`src/state-db/projection-writer.ts` の missing-test-plan-id 検出）は既に
   機能している（今回も検出済み）ため検出側の変更は不要。運用側の抜けであることを
   本 PLAN 本文の結論に記録し、テスト新設時の generates 同時登録を PLAN 規則の
   チェック観点として `.claude/CLAUDE.md` PLAN 規則節に 1 行追記する。

### 補足: disposition 同期ギャップ（記録のみ・本 PLAN では実装しない）

検査で、PLAN 文書側の triage 記述（例: PLAN-L7-150 の accepted_debt / resolved 台帳）と
`feedback_events` の DB status（全件 open のまま）を機械的に突合する仕組みが無いことを確認した
（`grep -rn "attached_plan" src/` ヒットなし）。accepted debt が actionable として出続けるのは
ノイズだが、append-only 投影の設計判断に触れるため本 PLAN のスコープ外とし、
carry に記録して別 PLAN で設計判断する（doctor 側の読み合わせ除外 vs triage コマンド追加）。

## 2. 対象外

- テストコード自体の変更（登録補完のみ）。
- `missing-test-oracle-id`（telemetry 1223 件）の是正 — 規模が別次元のため別 PLAN。
- feedback disposition 同期の仕組み実装（上記補足のとおり carry）。

## 2.1 孤児 doc-lint テストの調査結果

- `tests/helix-evidence-boundaries.test.ts`: 追加コミット `708a5a59743deddf1f31a30eb34e25ca7a7f7596`（`docs: map l7 implementation evidence`）では PLAN 文書変更が無く、成果物オーナー PLAN を確定できなかったため本 PLAN の `test_code` として登録する。
- `tests/helix-related-pairs.test.ts`: 追加コミット `2ec5b0bf9467803c99046ddf4c86304d954cc1b7`（`test: pin helix adoption layer pairs`）では PLAN 文書変更が無く、成果物オーナー PLAN を確定できなかったため本 PLAN の `test_code` として登録する。
- `tests/source-ledger-freshness.test.ts`: 追加コミット `97e5729bee665c5ec199fd6ba2c3b439e41d267f`（`fix(workflow): harden decision packet source metadata`）は設計・テスト設計・実装変更にまたがり、対象 PLAN の特定がこの remediation 範囲では不確実なため本 PLAN の `test_code` として登録する。

## 3. スケジュール（schedule steps）

- step 1 (mode: parallel): Step 1（タイプ A 追記）と Step 2（タイプ B オーナー調査）— 独立、並列可。
- step 2 (mode: serial): Step 3（db rebuild → count 検証 → 再発防止追記）。

## 4. 受入条件（falsifiable / 検証コマンド）

- `bun src/cli.ts feedback list --emit` の `missing-test-plan-id` が 19 → 0
  （projection 再構築後。0 にならない場合は残件の source_id を本文に列挙し理由を記録）。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-175-helix-orchestration-memory-impl.md`
  ほか追記した全 PLAN の lint green。
- `bun run src/cli.ts doctor` に本 PLAN 起因の新規 fail なし。

## 4.1 検証結果

- `bun run src/cli.ts db rebuild` は exit 0（projection ok）。
- `bun src/cli.ts feedback list --emit | awk '/missing-test-plan-id/ {count++} END {print count+0}'` は `0` を返し、`missing-test-plan-id` は 19 件から 0 件へ解消した。
- 追記した 5 PLAN の `plan lint` と `git diff --check` は exit 0。
- 本件は検出器不備ではなく、テスト新設時に PLAN `generates:` へ `test_code` を同時登録しなかった運用漏れである。再発防止として `.claude/CLAUDE.md` の PLAN 規則節へ同時登録観点を追記した。

## 5. carry（持ち越し）

- feedback disposition（accepted_debt / resolved / attached_plan）と DB status の機械突合の設計
  （別 PLAN、要設計判断）。
- `missing-test-oracle-id` 1223 件の段階是正ロードマップ。
