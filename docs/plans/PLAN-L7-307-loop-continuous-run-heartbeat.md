---
plan_id: PLAN-L7-307-loop-continuous-run-heartbeat
title: "PLAN-L7-307 (add-impl): HBR-P1 continuous-run heartbeat と fresh-session 再入"
kind: add-impl
layer: L7
drive: agent
status: archived
created: 2026-07-04
updated: 2026-07-04
owner: TBD
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/helix/L6-pillar-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-214 §4 carry (「本 PLAN は full continuous-run heartbeat engine を実装しない」) を消化する slice。HBR-P1 要求は既存で、新規 L1/L3 要求は追加しない。"
agent_slots:
  - role: tl
    slot_label: "TL - continuous-run engine 境界設計"
  - role: se
    slot_label: "SE - time-cap 到達時の session 終了と fresh-session 再入"
generates:
  - artifact_path: docs/plans/PLAN-L7-307-loop-continuous-run-heartbeat.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-214-loop-effort-budget.md
  requires:
    - docs/plans/PLAN-L7-214-loop-effort-budget.md
    - docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
    - docs/plans/PLAN-L7-305-loop-observability-projection.md
---

# PLAN-L7-307: HBR-P1 continuous-run heartbeat と fresh-session 再入

## -1. archived boundary (archive 境界)

2026-07-04 時点では登録候補のみで、実装 schedule / oracle / owner が未確定である。
active draft として残すと current completion audit に未証跡 blocker を混入させるため、本 PLAN は
着手前候補として archived にする。HBR-P1 continuous-run heartbeat / fresh-session 再入を実装する場合は、
PO/TL が scope と version target を確定したうえで新しい add-feature / version-up PLAN として起票する。

## 0. 目的 (登録のみ、実装は本 PLAN の schedule 確定後)

PLAN-L7-214 §4 carry の消化。現状 `helix loop run` は 1 起動 = `maxIterations` 到達で終了し、
「budget time-cap 到達 → session を安全に終了 → fresh session で loop state から再入」する
continuous-run engine (HBR-P1) が無いため、長時間の自律 Claude↔Codex ループが走れない。

## 1. スコープ候補 (起票時点の想定、freeze 前に TL 設計で確定する)

- time-cap 到達時の安全停止 (graceful stop): loop state を `paused` で永続し、再入条件
  (`windowOpensAt` 等) を記録する。
- fresh-session 再入: `helix loop resume` (または `loop run` の再入検出) が paused state
  から `canResume` 判定で継続する。
- heartbeat 証跡: 再入イベントを `.helix/state/loop/` に残し、PLAN-L7-305 の
  `loop_iterations` 投影・doctor 観測と接続する。
- P8 境界の維持: 常駐スケジューラ / 外部 heartbeat バイナリは不採用 (PLAN-L7-176 §2.5)。
  再入トリガは既存 session lifecycle (SessionStart hook / 明示 CLI) に限定する。

## 2. 対象外

- 常駐 daemon / cron スケジューラの導入。
- hosted API preflight (PLAN-L7-215 で既済)。

## 3. 受入条件 (freeze 時に oracle 化する)

- time-cap 到達 loop が worker/verifier を dispatch せずに paused 永続すること。
- fresh session からの再入が iteration 連番と provider 交代規約を保存すること。
- 再入 2 回を跨ぐ E2E (fake provider) が green であること。

## 4. 備考

2026-07-04 のオーケストレーション見直しで PLAN-L7-305/306 と同時に登録した。優先度は
projection/observability (305) より後段。owner は着手時に確定する (Codex worker 想定)。
