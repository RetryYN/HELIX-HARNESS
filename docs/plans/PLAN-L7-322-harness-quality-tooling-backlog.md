---
plan_id: PLAN-L7-322-harness-quality-tooling-backlog
title: "PLAN-L7-322 (impl): 上流 PR ブランチ harness-quality-tooling 採用 backlog — completeness pass で確定した欠落群を粒度ごとに独立着地"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-05
backprop_decision: not_required
backprop_decision_reason: "completeness pass で確定した harness-quality-tooling 欠落群を backlog として集約する L7 計画であり、個別 capability の上位要求意味を新規変更しない。各 item の実装は後続の独立 PLAN で trace / oracle / review evidence を持たせる。"
owner: Claude (Opus) / Codex
parent_design: docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE — 各欠落 capability を上流 PLAN を参考に HELIX 式で最小 diff 実装 (1 項目ずつ)"
  - role: tl
    slot_label: "TL — 各項目の LOCAL 構造接地・優先度付け (scope-integrity/probe/mutation は確定欠落として採用済)"
generates:
  - artifact_path: docs/plans/PLAN-L7-322-harness-quality-tooling-backlog.md
    artifact_type: markdown_doc
dependencies:
  parent: null
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md
    - docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T01:58:46+09:00"
    tests_green_at: "2026-07-05T01:58:46+09:00"
    verdict: approve
    scope: "PLAN-L7-322 を harness-quality-tooling 欠落群の採用 backlog として confirmed 化した。scope-integrity / probe harness / mutation-oracle などの個別 item は実装完了扱いにせず、後続の独立 PLAN で最小 diff、targeted test、doctor、review evidence を要求する。distribution / release surface と PLAN-M-02 rename cutover は承認前に実行しない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/design-language.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T01:58:46+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:c19def4deedbba5683830fae299d9b2f7fce31166b81711806476257ea54f322"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T01:58:46+09:00"
        evidence_path: src/lint/toolchain-pin.ts
        output_digest: "sha256:a2a4344d05239450eacff43b857257d3c7928cc66973b8c03092a3e40273053f"
      - kind: doctor
        command: "./scripts/helix doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T01:58:46+09:00"
        evidence_path: docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md
        output_digest: "sha256:790a4e2334e5321795006e9bf3d4329979e603be19b3776158be827297b007de"
---

# PLAN-L7-322 (impl): harness-quality-tooling 採用 backlog

## Objective

completeness pass（PO 問い「本当に漏れなく？」）で、上流 PR ブランチ（L7-202..362、~160 PLAN）に
LOCAL が持たない **harness-quality-tooling capability が多数**あると確定した。初回 audit の
「LOCAL 先行」は設計密度・charter の話であり、**純 harness ツーリング面では上流が先行**していた。
本 PLAN はその欠落群を **backlog として集約起票**する。各項目は独立に着地させる（一括 import しない）。

## スコープ（確定欠落 = grep で LOCAL 0 hit、上流 PLAN 参照付き）

### 品質 gate 系
- **route_mode-kind consistency lint + route certificate（上流 L7-263）**: 新規 PLAN の route certificate を fail-close。
- **scope integrity gate（L7-315）**: スコープ無宣言縮小を fail-close（**確定欠落** 2026-07-04 検証: LOCAL src hit は無関係 1 件のみ、概念 doc hit は自ファイル由来の false positive。上流は `src/plan/lint.ts` の `checkScopeIntegrity`＝scope_digest 付き PLAN の DoD 削除/scope hash 不一致を fail-close ＋ `- [~] (waived: reason/approver/date)` 記法）。
- **write encoding guard（L7-317）**: 書込直後 UTF-8 検査を PostToolUse で強制。
- **bundle split gate（L7-305）**: 隠れ束 PLAN の宣言強制と着手時分割。
- **detector self-trigger 回避 lint（L7-346）**: 検出パターンの literal wrap で自己発火回避。
- **mutation-oracle hardening（L7-274）**: テストが欠陥を検出できるかの検証（**確定欠落** 2026-07-04 検証: LOCAL の mutation hit は無関係な語一致のみ。上流は `src/lint/ddd-tdd-rules.ts` に mutation-oracle 硬化を追加）。

### observability / lifecycle 系
- **telemetry retention + logs rotation（L7-301）**: harness.db 無制限成長の抑制。
- **digest commit-anchor verification + digest-migrate planner（L7-303）**: green-command digest の経年腐敗根絶。
- **PLAN reference freshness analyzer + doctor advisory（L7-312/314）**: PLAN 参照の鮮度追跡。
- **PLAN archive 経路（L7-308）**: completed 台帳の可逆退避。
- **probe harness（L7-311）**: guard/gate/hook の実走検証常設化（**確定欠落** 2026-07-04 検証: LOCAL の `helix probe` は verification-profile の疎通確認という別物。上流は fixture 駆動で違反/正常 fixture を隔離実行し guard/gate/hook の実発火を検証する `helix probe run` runner＋`.helix/evidence/probes/` 証跡）。
- **vendor surface 契約 doctor（L7-344）**: CLI flag の実機突合。
- **hot-zone intent registry（L7-350）**: 作業域 intent の宣言・surface。

### orchestration / mode 系
- **wave-runner（L7-356）**: PLAN 束から team 定義生成＋並列レーン実行（LOCAL team run の上位）。
- **deprecation drive mode（L7-269）**: 機能退役の工程・signal（LOCAL modes に無し）。
- **github ops-guard（L7-197/258）**: PR head/base/commit-subject 検証・PoC→main merge 阻止・release publication plan（distribution surface は escalation）。

## 非対象
- 上流 doctor/cli の extraction refactor 群（L7-217..286 の多く）= refactor-only、LOCAL monolith が capability 保持。取り込まない。
- distribution/pack 詳細（L7-232..282 の多く）= LOCAL distribution 既存または PLAN-M-02 承認対象。
- 既に個別 PLAN 化済（adapter=320 / telemetry=316 / skill-injection・route_mode・graph=321 / doc-router=315 /
  toolchain-pin・personal-path・github-ci-policy・provider・update-check=319 / gate G9-G10=313 / D-CONTRACT=312 /
  L14=314 / model-override=318）。
- 既に保持（already-have）: memory、model-id SSoT、advisor routing、codex spawn guard、design-language。
- 既に保持（続き）: pending decision、aging、oracle ratchet、test_results ingest、design-bottomup mode、
  git-command guard。

## 受入条件
- 各項目着手時、上流 PLAN を参照し LOCAL 構造へ接地して最小 diff 実装、回帰なし。
- scope-integrity / probe / mutation は completeness pass で **確定欠落**と判定済（partial 解消）。着手時は上流実装（scope-integrity=plan/lint.ts、probe=probe runner+fixture、mutation=ddd-tdd-rules.ts）を参照し LOCAL 構造へ接地。
- 項目ごとに targeted test green、doctor / lint / typecheck / plan lint green。confirmed 前に review evidence 記録。

## スケジュール
- mode: serial（項目ごとに独立着地。優先度は TL が付与）。
- Step 1: 品質 gate 系（route-cert → write-encoding → bundle-split → detector-self-trigger → scope-integrity → mutation-oracle）を個別 PLAN 化して着地。
- Step 2: observability/lifecycle 系（digest-anchor → plan-ref-freshness → telemetry-retention → plan-archive → probe harness → vendor-surface → hot-zone）を個別 PLAN 化して着地。
- Step 3: orchestration/mode 系（wave-runner → deprecation mode → github ops-guard〔release 部は escalation〕）を個別 PLAN 化して着地。
- Step 4: 各 item は個別 review → confirmed。本 PLAN は欠落群の採用 backlog として confirmed。

## 壊さない / 再発させない
- 一括 import 禁止（粒度を合わせ 1 項目ずつ、上流 diff を verbatim にしない）。
- refactor-only / already-have を再取り込みしない（本 PLAN §非対象を厳守）。
- distribution / release surface の実切替は PLAN-M-02 承認前に行わない。

## 着地結果

- 本 PLAN は completeness pass で確定した harness-quality-tooling 欠落群を、実装完了ではなく採用 backlog として
  confirmed 化する。
- scope-integrity / probe harness / mutation-oracle は「確定欠落」として残し、各 item 着手時に上流 PLAN と
  LOCAL 構造を照合して独立 PLAN、targeted test、doctor、review evidence を持たせる。
- refactor-only / already-have / distribution cutover / rename cutover は本 PLAN の外に置き、誤採用と未承認実行を避ける。
- 2026-07-05 時点の確認では、`plan lint`、`design-language`、`typecheck`、`doctor` が green。

## 名称 / rename 境界

- current prose は HELIX 採用 backlog として扱い、上流突合 docs 参照は `upstream-helix-*` にそろえている。
- `.helix` / `helix` / `area=helix` の物理 rename、ファイル名 rename、distribution cutover は
  PLAN-M-02 の cutover approval と action-binding approval がそろうまで実行しない。

## レビュー / 次工程
- backlog は confirmed。次工程は item ごとの個別 PLAN 起票・実装・review evidence 収集。
- 出典: [[upstream-helix-reconciliation]] completeness pass（L7-202..362 全 skim）。

## 2026-07-06 追記（上流全体照会の再確認、PLAN-L7-352 接続）

2026-07-06 の HELIX upstream 全体照会（main HEAD、Pack 系統、pmo-tech-fork 調査）で
本 backlog の現在地を再確認した。confirmed 済み claim の変更ではなく、進捗接続の追記である。

- **route certificate（route_mode-kind consistency lint）**: 未着手を再確認。実行設計を
  `PLAN-L6-55-plan-entry-routing`（L6 設計）+ `PLAN-L7-352-plan-entry-routing-impl`（実装）として
  起票し、上流様式（`src/schema/mode-catalog.ts` の `workflowModeForPlan` フォールバック連鎖 /
  `src/schema/route-map.ts` の `ROUTE_SIGNAL_MAP`）を採用した。本 backlog 項目は同 PLAN 群へ接続する。
- **scope-integrity gate / probe 実発火 harness / mutation-oracle hardening**: いずれも未着手を
  再確認（`grep` 0 hit、`helix probe` は疎通確認レベル）。順序は本 backlog Step 1 のまま。
- **申し送り（分類訂正の可能性）**: design-bottomup mode は概念（PLAN-DISCOVERY-07 /
  PLAN-REVERSE-342）は存在するが、`docs/process/modes/README.md` §2 台帳の row と
  `docs/process/modes/design-bottomup.md` 単独 doc が欠落している（上流には両方あり）。
  「既に保持」分類の訂正候補として次の mode doc 整備時に row + doc を追加する。
