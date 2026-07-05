---
title: "HELIX L3 要件 back-fill — P2 runtime bridge (tick→実 adapter 配線 + helix loop entrypoint)"
layer: L3
kind: reverse-backfill
status: confirmed
created: 2026-06-28
updated: 2026-06-28
owner: AIM + TL
plan: PLAN-REVERSE-177-helix-orchestration-runtime-bridge
backfills: PLAN-L7-177-helix-orchestration-runtime-bridge
pair_artifact: docs/test-design/helix/L3-pillar-acceptance-test-design.md
---

# HELIX L3 要件 back-fill — P2 runtime bridge

> Add-feature route B（bottom-up）の Reverse back-fill。先行 build した PLAN-L7-177（runtime bridge）から
> L3 要件を後追いで明文化する（forward_routing=L3）。純粋契約コア（PLAN-L7-175/176 の tick/TickDeps）を
> **実ランタイム（Codex/Claude adapter）へ配線して実起動可能**にした差分を要件化する。

## HR-BR-13R — tick の実ランタイム配線（nodeTickDeps）

- `nodeTickDeps` は `TickDeps` の実体を返し、`runWorker`/`runVerifier` を**既存 adapter 実行面**
  （`buildAdapterPlan` + provider CLI 実行）へ接続する。実 child-process spawn は注入 fn `execAdapter` の背後に
  隔離し（既定 `defaultExecAdapter` = `spawnSync`, `shell:false`）、unit-test では fake exec を注入可能に保つ。
- **worker≠verifier の provider 選択は tick 内の `selectVerifier` が担う**（bridge は再実装せず、tick が
  渡した verifier provider を実行）。hybrid 不在時の fail-close は tick 側既存契約（HR-BR-07R）を継承。
- adapter 実行 env は CLI execute 経路と**共有**（`adapterExecutionEnv`）。legacy runtime 名の override env は
  child へ漏らさない（既存 scrub を共通化）。
- verifier verdict は出力の `VERDICT: pass|fail|error|pending` 行（または JSON `{verdict}`）から解釈し、
  非 0 終了は `error`。worker 失敗は detail 付き throw（silent 継続しない）。
- 受入 = U-ORCH-BRIDGE-01。

## HR-BR-14R — loop 実行 entrypoint（helix loop run）

- `helix loop run --plan <id>` は loop-store から `LoopState` を読み、`canResume` の間 `tick` を駆動し、
  各 iteration を永続（`.helix/state/loop/<planId>.json` + `<planId>.iterations.jsonl`）。
- `--once` は 1 tick のみ、`--dry-run` は dispatch せず worker/verifier provider の配線（availability）を表示。
- state 不在/不正・worker provider 不正は非 0 終了 + stderr（fail-close）。
- 受入 = U-ORCH-BRIDGE-02（実 CLI を fake provider 付きで spawn し、dry-run 非 dispatch / 実 tick 駆動 /
  iteration 永続 / iterations.jsonl の verifier provider を end-to-end 検証）。

## carry（P9 観測強化、別 add-impl）

- harness.db への loop_iterations projection、doctor `verifier-provider-mismatch` 観測 gate は PLAN-L7-176 §4 と同じ carry。
- budget time-cap / fresh-session 再入（HBR-P1 continuous-run engine）は後続 add-impl。
