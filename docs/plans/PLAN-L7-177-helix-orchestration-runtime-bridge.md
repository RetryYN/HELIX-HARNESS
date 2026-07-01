---
plan_id: PLAN-L7-177-helix-orchestration-runtime-bridge
title: "PLAN-L7-177 (add-impl): P2 runtime bridge — tick を実 Codex/Claude へ配線 + ut-tdd loop entrypoint"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-28
updated: 2026-07-01
owner: AIM + TL
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T09:16:27+09:00"
    tests_green_at: "2026-07-01T09:16:27+09:00"
    verdict: pass
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "Continuation: pair-agent light implementation can no longer close, approve, or verdict the work. `runPairAgentTddPlan` now treats lightweight output containing closure/approval/verdict markers as `light-agent-closure-claim`, preserving the smart review agent as the only local verdict authority."
    green_commands:
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:16:27+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:e9beaca3584ff074036e3ba3aa005a78470e311d24d346cc59d995cfe8d42956"
      - kind: smoke
        command: "sha256sum src/orchestration/pair-agent.ts"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:16:27+09:00"
        evidence_path: src/orchestration/pair-agent.ts
        output_digest: "sha256:20a836d48fc1fc4b2add974d51180aef1de96b05028543cf593a4b778543b4ad"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T06:04:15+09:00"
    tests_green_at: "2026-07-01T06:04:15+09:00"
    verdict: pass
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "Continuation: pair-agent smart review closure now matches the meaning-level TDD pair contract. Smart review output must include an explicit VERDICT line, pending verdicts must include a concrete continuation directive for the next light fix cycle, and review findings alone no longer count as fix instructions for fail verdicts. L6 design and HU-PILLAR-P2-04 test design were aligned with the executable guard."
    green_commands:
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T06:04:15+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:e9beaca3584ff074036e3ba3aa005a78470e311d24d346cc59d995cfe8d42956"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T06:04:15+09:00"
        evidence_path: src/orchestration/pair-agent.ts
        output_digest: "sha256:20a836d48fc1fc4b2add974d51180aef1de96b05028543cf593a4b778543b4ad"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T06:04:15+09:00"
        evidence_path: src/orchestration/pair-agent.ts
        output_digest: "sha256:20a836d48fc1fc4b2add974d51180aef1de96b05028543cf593a4b778543b4ad"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T06:04:15+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:e9beaca3584ff074036e3ba3aa005a78470e311d24d346cc59d995cfe8d42956"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T03:31:59+09:00"
    tests_green_at: "2026-07-01T03:31:59+09:00"
    verdict: pass
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "Continuation: L3/L6/L7 pair-agent contract now requires light implementation evidence or consultation. Light implementation fail-closes without changed-files, targeted-test-command, and implementation-notes evidence unless it emits a consultation question. Consultation cannot be passed as implementation; smart review must return an implementation directive/fix response on pending or fail verdict and route the next light fix cycle through the bounded transcript."
    green_commands:
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T03:31:59+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:e9beaca3584ff074036e3ba3aa005a78470e311d24d346cc59d995cfe8d42956"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T03:31:59+09:00"
        evidence_path: src/orchestration/pair-agent.ts
        output_digest: "sha256:20a836d48fc1fc4b2add974d51180aef1de96b05028543cf593a4b778543b4ad"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T03:31:59+09:00"
        evidence_path: src/orchestration/pair-agent.ts
        output_digest: "sha256:20a836d48fc1fc4b2add974d51180aef1de96b05028543cf593a4b778543b4ad"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T02:59:10+0900"
    tests_green_at: "2026-07-01T02:59:10+0900"
    verdict: pass
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "Continuation: pair-agent TDD loop now fail-closes evidence-free local verdicts. smart_test_author must emit Red/oracle evidence before implementation, smart_review pass must include Green evidence and review findings, and fail verdicts must include fix instructions before routing back to light implementation."
    green_commands:
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts tests/projection-writer.test.ts tests/green-command-digest.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T02:59:10+0900"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:e9beaca3584ff074036e3ba3aa005a78470e311d24d346cc59d995cfe8d42956"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T02:59:10+0900"
        evidence_path: src/orchestration/pair-agent.ts
        output_digest: "sha256:20a836d48fc1fc4b2add974d51180aef1de96b05028543cf593a4b778543b4ad"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T02:59:10+0900"
        evidence_path: src/orchestration/pair-agent.ts
        output_digest: "sha256:20a836d48fc1fc4b2add974d51180aef1de96b05028543cf593a4b778543b4ad"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T04:35:00+09:00"
    tests_green_at: "2026-07-01T04:35:00+09:00"
    verdict: pass
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "Continuation: pair-agent run evidence now converges into harness.db on rebuild. .ut-tdd/evidence/pair-agent/*.json projects phase agents to model_runs, pair run gate status to gate_runs, and frontier approval to guardrail_decisions; invalid pair-agent evidence is surfaced as findings instead of remaining file-only."
    green_commands:
      - kind: unit_test
        command: "bun test tests/projection-writer.test.ts tests/pair-agent.test.ts tests/green-command-digest.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T04:35:00+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:a93799eaec55363d9bc3cebdf35f7f0054245caaba86d630ea68e75a57f4312d"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T04:35:00+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:e0046ebf2f11f466c71132ac8654955b5372b562959016d9bddd1589337a1a4f"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T03:45:00+09:00"
    tests_green_at: "2026-07-01T03:45:00+09:00"
    verdict: pass
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "Continuation: pair-agent run can persist replayable workflow evidence with --save-evidence. The saved JSON contains schema_version, recorded_at, run_id, mode, execute, plan, result, bounded transcript, and trace fields for run/span/tool/handoff/guardrail/eval/duration/cost under .ut-tdd/evidence/pair-agent/ so pair runs are not stdout-only evidence."
    green_commands:
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T03:45:00+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:e9beaca3584ff074036e3ba3aa005a78470e311d24d346cc59d995cfe8d42956"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T03:45:00+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:9f632d58472f600686eeb6531e484db3ad159301fa9f22023e26fe48ac8888c4"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T03:20:00+09:00"
    tests_green_at: "2026-07-01T03:20:00+09:00"
    verdict: pass
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "Continuation: pair-agent executable TDD loop now carries a bounded pair transcript. Smart test/oracle output and smart review fix instructions are injected into subsequent lightweight implementation prompts, so fail cycles are actual consultation/fix loops rather than repeated static prompts."
    green_commands:
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T03:20:00+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:e9beaca3584ff074036e3ba3aa005a78470e311d24d346cc59d995cfe8d42956"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T03:20:00+09:00"
        evidence_path: src/orchestration/pair-agent.ts
        output_digest: "sha256:20a836d48fc1fc4b2add974d51180aef1de96b05028543cf593a4b778543b4ad"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T02:05:00+09:00"
    tests_green_at: "2026-07-01T02:05:00+09:00"
    verdict: pass
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "Continuation: pair-agent moved from planning-only to executable TDD sequence. ut-tdd pair-agent run dry-runs by default, blocks executable T0 smart review phases without --allow-frontier, and executes smart_test_author once followed by light_implementation -> smart_review cycles until VERDICT: pass or maxFixCycles."
    green_commands:
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T02:05:00+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:e9beaca3584ff074036e3ba3aa005a78470e311d24d346cc59d995cfe8d42956"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T02:05:00+09:00"
        evidence_path: src/orchestration/pair-agent.ts
        output_digest: "sha256:20a836d48fc1fc4b2add974d51180aef1de96b05028543cf593a4b778543b4ad"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T01:35:00+09:00"
    tests_green_at: "2026-07-01T01:35:00+09:00"
    verdict: pass
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "Continuation: P2 runtime bridge now exposes a pair-agent TDD route. The smart review agent authors Red/oracle evidence first, the lightweight implementation agent performs the minimum implementation without closing authority, and the smart review agent tests/reviews/verdicts with fail routed back to implementation. CLI surface: ut-tdd pair-agent plan."
    green_commands:
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts tests/orchestration/loop-bridge.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T01:35:00+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:e9beaca3584ff074036e3ba3aa005a78470e311d24d346cc59d995cfe8d42956"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T01:35:00+09:00"
        evidence_path: src/orchestration/pair-agent.ts
        output_digest: "sha256:20a836d48fc1fc4b2add974d51180aef1de96b05028543cf593a4b778543b4ad"
  - reviewer: claude-opus-4-8
    review_kind: cross_agent
    reviewed_at: "2026-06-28T20:05:00+09:00"
    tests_green_at: "2026-06-28T20:00:00+09:00"
    verdict: pass
    worker_model: gpt-5.3-codex
    reviewer_model: claude-opus-4-8
    scope: "P2 runtime bridge: nodeTickDeps が runWorker/runVerifier を実 adapter 実行面へ配線（worker≠verifier の provider 選択は tick の selectVerifier に委譲・再実装せず、hybrid 不在 fail-close は HR-BR-07R 継承）、ut-tdd loop run --plan/--once/--dry-run。Codex(worker) 実装、Claude(reviewer) が独立に typecheck/vitest を再実行し精読確認: 契約適合・spawn shell:false・error detail throw・adapterExecutionEnv は既存 cli.ts inline scrub の正当な共有抽出（新規ハックでない）。U-ORCH-BRIDGE-02 は実 CLI を fake provider 付きで spawn する end-to-end（純関数 oracle でなく runtime 配線を実証＝gap 解消）。8 tests green。harness.db projection は P9 carry。"
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/orchestration"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-28T20:00:00+09:00"
        evidence_path: tests/orchestration/loop-bridge.test.ts
        output_digest: "sha256:69325e3eedd258df92d734cdb6fbf3becad34bad25a72505673baf52d43597c0"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-28T20:00:00+09:00"
        evidence_path: src/orchestration/loop-bridge.ts
        output_digest: "sha256:76b23b1b727fe367477232120eeb70c4e2e525d37d479af4ec73e6f4b44f9f8c"
agent_slots:
  - role: se
    slot_label: "SE — Codex 実装 worker (writable, hybrid)"
  - role: tl
    slot_label: "TL — cross-runtime review (Claude)"
generates:
  - artifact_path: docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
    artifact_type: markdown_doc
  - artifact_path: src/orchestration/loop-bridge.ts
    artifact_type: source_module
  - artifact_path: src/orchestration/pair-agent.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: tests/pair-agent.test.ts
    artifact_type: test_code
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
dependencies:
  parent: PLAN-L6-50-helix-orchestration-memory
  requires:
    - PLAN-REVERSE-177-helix-orchestration-runtime-bridge
  references:
    - docs/design/helix/L6-function-design/orchestration-memory.md
    - src/orchestration/loop-runner.ts
    - docs/plans/PLAN-L7-176-helix-orchestration-memory-runtime.md
---

# PLAN-L7-177 (add-impl): P2 runtime bridge

## §0 役割 / なぜ必要か（errata）

PLAN-L7-175/176 は `tick`/loop-runner の**契約ロジック**を実装し 9 oracle green にした。しかし
`TickDeps.runWorker`/`runVerifier` を**実ランタイム（Codex/Claude）に繋ぐ本番 wiring が 0 件**（テスト注入のみ）、
かつ **`ut-tdd loop` entrypoint が無い**ため、**自律ループ orchestration は実際には Codex を起動して回らない**
（PO 指摘 2026-06-28）。「9 oracle green」は純関数のロジック検証であって runtime 配線の証明ではない
（[[orchestration-runtime-bridge-gap]]、`実装したつもり` ギャップ）。本 add-impl はその **runtime bridge** を実装し、
P2「サブエージェントを loop で回し worker≠verifier」を**実起動可能**にする。

> 既に動く委譲面: `ut-tdd codex --execute`（単発）/ `ut-tdd team run --execute`（hybrid team）。本 bridge は
> これらの adapter 実行面を **tick ループに接続**する（新規 provider 呼出は増やさず既存 adapter を再利用）。

## §1 実装単位

| module | 内容 | oracle |
|--------|------|--------|
| `src/orchestration/loop-bridge.ts` | `nodeTickDeps(input)` = 実 `TickDeps`。`runWorker(s)` → 既存 adapter 実行面（`buildAdapterPlan`+execute、worker provider の CLI）を呼ぶ。`runVerifier(provider,s)` → **反対 provider** の adapter で review し `Verdict` を解釈（hybrid 不在は tick 側 fail-close 既存）。`providerAvailable` = adapter availability。`recordIteration` = loop-store/loop-iterations 追記。`now` = 実時計 | U-ORCH-BRIDGE-01 |
| `src/cli.ts`（改修） | `ut-tdd loop run --plan <id>`：loop-store から LoopState 読込 → `canResume` の間 `tick` を回し各 iteration を永続。`--once` で 1 tick、`--dry-run` で dispatch せず計画表示 | U-ORCH-BRIDGE-02 |
| `src/orchestration/pair-agent.ts` | `buildPairAgentTddPlan(input)` = smart review agent が test/oracle を先に作り、light implementation agent が実装し、smart review agent が test/review/verdict を出す TDD pair route を生成。`runPairAgentTddPlan(input)` = smart_test_author を一度実行し、Red/oracle evidence が無ければ実装へ進めず、light_implementation → smart_review を `maxFixCycles` まで回す。light_implementation は changed-files / targeted-test-command / implementation-notes evidence を出すか、consultation question を出す。consultation は pass ではなく smart review の implementation directive / fix response を経て次の light fix cycle に戻す。smart_review の pass verdict は Green evidence と review finding が無ければ error、fail verdict は fix instruction が無ければ error。各 phase 出力は bounded transcript に残し、smart review の fail instruction を次の light_implementation prompt へ渡す。single runtime は intra-runtime fallback として cross-agent judgement evidence にしない | HU-PILLAR-P2-04 |
| `src/cli.ts`（改修） | `ut-tdd pair-agent plan --plan-id <id> --task ...`：pair route と adapter dry-run plan を JSON/text で表示。`ut-tdd pair-agent run` は dry-run が既定、`--execute --allow-frontier` で provider adapter を順序実行し、result transcript を JSON に含める。`--save-evidence` は `.ut-tdd/evidence/pair-agent/` に plan/run/transcript と replay 用 trace fields（run/span/tool/handoff/guardrail/eval/duration/cost）を保存。T0 smart agent は `--allow-frontier` なしでは executionAuthorized=false | HU-PILLAR-P2-04 |
| `src/state-db/projection-writer.ts`（改修） | `.ut-tdd/evidence/pair-agent/*.json` を `rebuildHarnessDb` で読み、phase agent を `model_runs`、pair run gate を `gate_runs`、frontier approval を `guardrail_decisions` へ投影する。壊れた証跡は `findings` に落とし、stdout-only / file-only の証跡で完了扱いにしない | HU-PILLAR-P2-04 / HU-PILLAR-P9-01 |

## §1.1 意味トレース再監査（2026-07-01）

| 観点 | 照合結果 |
|------|----------|
| L1 機能一覧 | 本変更は `HBR-P2`（loop engineering）/ `HBR-P3`（強い検証）/ `HBR-P4`（学習・修復へ回せる evidence）に限定。`HBR-P6` の push/PR/tag、`HBR-P8` の外部連携、`HBR-P9` の DB 収束そのものは完了主張しない |
| L1 追補 | L1 §2.8 asset/progress visualization は `PLAN-DISCOVERY-10` S4 decision 待ちなので、本 PLAN の pair-agent 証跡追加へ混ぜない |
| L3 要求 | `HR-FR-P2-04` / `HAC-P2-04b` の「PLAN 駆動、simple workflow 既定、TDD pair route、replay 可能な plan/span/tool/handoff/guardrail/eval/duration/cost 証跡」を対象にする |
| L6 設計 | `HC-P2` の `buildPairAgentTddPlan` / `runPairAgentTddPlan` / `ut-tdd pair-agent plan/run` へ降ろし、`--save-evidence` は stdout ではなく `.ut-tdd/evidence/pair-agent/` の replay artifact として扱う。DB rebuild はその artifact を `model_runs` / `gate_runs` / `guardrail_decisions` に収束する |
| L7 oracle | `HU-PILLAR-P2-04` の順序契約（smart test/oracle -> light implementation -> smart review）、light agent closing authority 禁止、fail instruction carry、T0 frontier approval、requested run evidence preservation、pair-agent evidence projection をテスト対象にする |
| 境界 | `.ut-tdd -> .helix` rename は `PLAN-M-02` の irreversible cutover approval 待ちであり、本 PLAN では apply しない。pair-agent evidence の保存先は現行機械識別子 `.ut-tdd` のまま |

## §2 進め方（Codex 分散・Red→Green、dogfood）

1. U-ORCH-BRIDGE-01/02 を Red（`runWorker` が worker provider の adapter execute を呼ぶ・`loop run` が canResume の間 tick を駆動）。
2. **Codex（worker）が loop-bridge.ts + entrypoint を実装**、Claude（verifier）が cross-runtime review（自己評価禁止＝本 PLAN 自体が dogfood）。
3. dispatch は既存 adapter 実行面を再利用（child process spawn は adapter 層に閉じ込め、bridge は注入 fn 経由でテスト可能に保つ）。

## §3 DoD

- [x] `nodeTickDeps` が worker→反対 provider verifier を実 adapter で dispatch（U-ORCH-BRIDGE-01 green）。
- [x] `ut-tdd loop run --plan <id>` が LoopState を回し iteration 永続（U-ORCH-BRIDGE-02 green、`--dry-run`/`--once` 含む）。
- [x] typecheck/vitest/lint/doctor green、cross-runtime review 証跡（worker=Codex / reviewer=Claude、green_commands + 実 digest）。
- [x] Reverse(PLAN-REVERSE-177) の L3 back-fill と両 confirm（route-B dual-confirm）。
- [x] **end-to-end 証跡**: `ut-tdd loop run --dry-run` が worker/verifier provider 配線を表示（純関数 oracle ではなく runtime 配線を示す smoke）。U-ORCH-BRIDGE-02 が実 CLI spawn で被覆。

## §3.1 実装計画

| Step | 対象 | 方法 |
|------|------|------|
| 1 | oracle Red | U-ORCH-BRIDGE-01/02 を test-design へ追記し Red |
| 2 | loop-bridge.ts | Codex 実装: nodeTickDeps（adapter 実行面を注入 fn で wrap、worker≠verifier provider 選択は selectVerifier 再利用） |
| 3 | `ut-tdd loop run` | Codex 実装: loop-store 読込→tick 駆動→永続、--once/--dry-run |
| 4 | review | Claude cross-runtime review（自己評価禁止 dogfood）、証跡構造化 |

## §4 carry

- harness.db への loop_iterations 投影・観測 doctor gate は P9 観測強化（PLAN-L7-176 §4 と同じ carry）。
- budget time-cap / fresh-session 再入（HBR-P1 continuous-run engine）は後続 add-impl。
