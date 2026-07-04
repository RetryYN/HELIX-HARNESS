---
plan_id: PLAN-L7-323-workflow-document-parity
title: "PLAN-L7-323 (impl): 上流突合 workflow & document parity — CI hardening ステップ + 欠落 reference/template/mode doc"
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
    slot_label: "SE — harness-check.yml へ branch-type guard + audit-quality gate ステップ追加、欠落 reference/template/mode doc を HELIX 式で新設"
  - role: tl
    slot_label: "TL — CI ステップの github-ops-guard(PLAN-322) 依存整合・distribution surface(pack CI template) の escalation 判断・doc 正本性レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-323-workflow-document-parity.md
    artifact_type: markdown_doc
  # draft のため generates は実在する自 doc のみ。対象 (CI yml 改修 + 新設 doc) は本文 §スコープ参照。実装着地時に generates へ追加する。
dependencies:
  parent: null
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md
    - docs/plans/PLAN-L7-322-harness-quality-tooling-backlog.md
---

# PLAN-L7-323 (impl): workflow & document parity

## Objective

completeness pass の workflow/document 差分確認で、上流 PR ブランチが持つ CI hardening と
reference/template/mode doc を LOCAL が欠くと確定した。共有 doc の内容 drift は既捕捉の src capability
（route_mode / audit→recovery / memory / L10-L14 gate / methodology docs）の設計 side 文書化であり
新規 capability は増えないため、本 PLAN は **CI ステップと欠落 doc の parity** に限定する。各項目は独立着地。

## スコープ

### IN — CI hardening（`.github/workflows/harness-check.yml`）
- **branch-type guard** ステップ追加: `bun src/cli.ts github guard --head-ref --base-ref --pr-title --pr-body-file --commit-file`（commitlint / poc-no-main / hotfix-postmortem）。github-ops-guard 実装（PLAN-L7-322）に依存。
- **audit quality gate** ステップ追加: `bun src/cli.ts audit quality --include-tests --limit N`（secret / 個人パス / TODO smell の CI gate 化、上流 L7-197）。
- （db rebuild ステップの有無は LOCAL 現行 CI と突合して要否判断。）
- LOCAL 固有の `escalation-stale.yml` は保持（LOCAL 先行、削除しない）。

### IN — 欠落 doc（LOCAL match=0 確認済）
- `docs/reference/setup-guide.md`: consumer setup / onboarding reference。
- `docs/templates/design/L6-function-spec-template.md`: L6 function-spec 設計テンプレート（design-doc IR §S-grade と対）。
- `docs/process/modes/design-bottomup.md`: design-bottomup **mode doc**（LOCAL は src/PLAN に概念在るが modes/ 文書化欠落）。
- `docs/templates/github/common/pack-harness-check.yml`: pack CI profile template（distribution surface＝escalation 判断）。

### IN — doc 是正
- `docs/process/modes/retrofit.md` 等の cited command 実在性（上流 L7-238 retrofit preflight command 修正）を LOCAL で確認・是正。
- screen 設計連鎖（`screen-functional` L3 / `ui-detail` L5 / `screen-spec` L6）: LOCAL は L2 mock 止まりで testable screen 契約が無い（design methodology gap、設計層で採否判断）。

### OUT
- 上流の ut-tdd→helix リネーム由来で upstream-only に見える正本 doc（concept/requirements/ADR 等）は LOCAL に helix 名で実在＝対象外。
- governance methodology 概念（audit-lens-catalog / design-doc-IR / quality-uplift / scope-integrity / evasion-taxonomy）は completeness addendum §3 で設計層採否判断（本 PLAN では新設しない）。
- distribution/pack surface の実切替は PLAN-M-02 承認前に行わない。

## 受入条件
- CI 2 ステップ（branch-type guard / audit-quality）が harness-check.yml に入り、既存ジョブを回帰させない（guard は PLAN-322 着地後）。
- 欠落 doc が HELIX 式（日本語・helix 命名）で新設され、参照が実在（relation-graph stale-edge を作らない）。
- retrofit 等 cited command の実在性を確認・是正。
- doctor / lint / plan lint green。confirmed 前に review evidence 記録。

## スケジュール
- mode: serial（項目ごとに独立着地）。
- Step 1: 欠落 doc 新設（setup-guide → L6-function-spec-template → design-bottomup mode doc）。
- Step 2: cited command 是正（retrofit 等）。
- Step 3: CI hardening（audit-quality → branch-type guard〔PLAN-322 github-ops-guard 着地後〕）。
- Step 4: pack CI template（distribution、escalation 確認後）。
- Step 5: 各項目 review → confirmed。

## 壊さない / 再発させない
- LOCAL 先行の CI（escalation-stale.yml）と日本語 doc を回帰させない。
- 新設 doc は generates 実在物のみ規約を守り stale-edge を作らない。
- distribution surface の不可逆操作は PLAN-M-02 承認前に行わない。

## レビュー / 次工程
- 実装は Codex in-flight 着地後に harness workflow で行う。基準点は HEAD。
- 出典: [[upstream-helix-reconciliation]] completeness pass（workflow & document 差分確認）。
</content>
