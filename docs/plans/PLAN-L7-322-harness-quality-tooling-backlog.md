---
plan_id: PLAN-L7-322-harness-quality-tooling-backlog
title: "PLAN-L7-322 (impl): 上流 PR ブランチ harness-quality-tooling 採用 backlog — completeness pass で確定した欠落群を粒度ごとに独立着地"
kind: impl
layer: L7
drive: agent
status: draft
created: 2026-07-04
updated: 2026-07-04
owner: Claude (Opus) / Codex
parent_design: docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md
related_l0: docs/governance/helix-agent-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE — 各欠落 capability を上流 PLAN を参考に HELIX 式で最小 diff 実装 (1 項目ずつ)"
  - role: tl
    slot_label: "TL — 各項目の LOCAL 構造接地・partial 項目 (scope-integrity/probe/mutation) の gate 化要否判断・優先度付け"
generates:
  - artifact_path: docs/plans/PLAN-L7-322-harness-quality-tooling-backlog.md
    artifact_type: markdown_doc
dependencies:
  parent: null
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md
    - docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
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
- **scope integrity gate（L7-315）**: スコープ無宣言縮小を fail-close（LOCAL は概念のみ・機械 gate 欠落＝partial、要 gate 化判断）。
- **write encoding guard（L7-317）**: 書込直後 UTF-8 検査を PostToolUse で強制。
- **bundle split gate（L7-305）**: 隠れ束 PLAN の宣言強制と着手時分割。
- **detector self-trigger 回避 lint（L7-346）**: 検出パターンの literal wrap で自己発火回避。
- **mutation 検証（L7-274）**: テストが欠陥を検出できるかの定常検証（LOCAL 2 hit＝partial、要確認）。

### observability / lifecycle 系
- **telemetry retention + logs rotation（L7-301）**: harness.db 無制限成長の抑制。
- **digest commit-anchor verification + digest-migrate planner（L7-303）**: green-command digest の経年腐敗根絶。
- **PLAN reference freshness analyzer + doctor advisory（L7-312/314）**: PLAN 参照の鮮度追跡。
- **PLAN archive 経路（L7-308）**: completed 台帳の可逆退避。
- **probe harness（L7-311）**: guard/gate/hook の実走検証常設化（LOCAL 15 hit＝要確認、常設 fixture 欠落の可能性）。
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
- partial 項目（scope-integrity / probe / mutation）は着手前に LOCAL 現状を精査し gate 化要否を確定。
- 項目ごとに targeted test green、doctor / lint / typecheck / plan lint green。confirmed 前に review evidence 記録。

## スケジュール
- mode: serial（項目ごとに独立着地。優先度は TL が付与）。
- Step 1: 品質 gate 系（route-cert → write-encoding → bundle-split → detector-self-trigger → scope-integrity 判断 → mutation 判断）。
- Step 2: observability/lifecycle 系（digest-anchor → plan-ref-freshness → telemetry-retention → plan-archive → probe 判断 → vendor-surface → hot-zone）。
- Step 3: orchestration/mode 系（wave-runner → deprecation mode → github ops-guard〔release 部は escalation〕）。
- Step 4: 各項目 review → confirmed。

## 壊さない / 再発させない
- 一括 import 禁止（粒度を合わせ 1 項目ずつ、上流 diff を verbatim にしない）。
- refactor-only / already-have を再取り込みしない（本 PLAN §非対象を厳守）。
- distribution / release surface の実切替は PLAN-M-02 承認前に行わない。

## レビュー / 次工程
- 実装は Codex in-flight 着地後に harness workflow で行う。基準点は HEAD。
- 出典: [[upstream-helix-reconciliation]] completeness pass（L7-202..362 全 skim）。
