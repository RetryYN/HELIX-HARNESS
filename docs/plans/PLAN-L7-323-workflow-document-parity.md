---
plan_id: PLAN-L7-323-workflow-document-parity
title: "PLAN-L7-323 (impl): 上流突合 document parity — setup guide / L6 template / pack CI template"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-05
backprop_decision: not_required
backprop_decision_reason: "上流突合で見つかった reference/template doc 欠落を L7 の document parity closure として閉じる。CI hardening、design-bottomup mode doc 正本化、配布 surface 実切替は未承認・依存ありのためこの PLAN の完了範囲から外し、後続 PLAN / S4 判断 / action-binding approval に委ねる。"
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
  - artifact_path: docs/reference/setup-guide.md
    artifact_type: markdown_doc
  - artifact_path: docs/templates/design/L6-function-spec-template.md
    artifact_type: markdown_doc
  - artifact_path: docs/templates/github/common/pack-harness-check.yml
    artifact_type: yaml_config
dependencies:
  parent: null
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md
    - docs/plans/PLAN-L7-322-harness-quality-tooling-backlog.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T03:10:00+09:00"
    tests_green_at: "2026-07-05T03:10:00+09:00"
    verdict: approve
    scope: "PLAN-L7-323 を生成済み document parity closure として confirmed 化した。setup-guide、L6-function-spec-template、pack-harness-check template は HELIX 名称と日本語 prose で実在する。design-bottomup mode doc は PLAN-DISCOVERY-07 の S4 confirmed 前に正本化しない。CI hardening と distribution/pack 実切替は PLAN-L7-322 系の後続または action-binding approval 境界で扱い、この PLAN では完了主張しない。README / READE は gate・証跡・完了条件に紐づけていない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/design-language.test.ts tests/toolchain-pin.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T03:10:00+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:c19def4deedbba5683830fae299d9b2f7fce31166b81711806476257ea54f322"
      - kind: lint
        command: "./scripts/ut-tdd plan lint docs/plans/PLAN-L7-323-workflow-document-parity.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T03:10:00+09:00"
        evidence_path: docs/plans/PLAN-L7-323-workflow-document-parity.md
        output_digest: "sha256:7e8c64dcde7e7b7f08e16db2f6d9064f209831f34a797158b0f105fc30c7cb4a"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T03:10:00+09:00"
        evidence_path: docs/templates/github/common/pack-harness-check.yml
        output_digest: "sha256:a4abb8016d301001d93ba1ad9e1111d7068d9db1f227541e261f8e5335b50795"
      - kind: doctor
        command: "./scripts/ut-tdd db rebuild --json >/tmp/helix-db-rebuild-plan-l7-323-confirmed.json && ./scripts/ut-tdd doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T03:10:00+09:00"
        evidence_path: docs/reference/setup-guide.md
        output_digest: "sha256:2568646b80b46d01255fc3a3ba8bd93a6ff66dc5418accbd3406273e2681fd78"
---

# PLAN-L7-323 (impl): 文書 parity

## Objective

completeness pass の workflow/document 差分確認で、上流 PR ブランチが持つ reference/template doc を
LOCAL が欠くと確定した。共有 doc の内容 drift は既捕捉の src capability（route_mode / audit→recovery /
memory / L10-L14 gate / methodology docs）の設計 side 文書化であり、新規 capability は増えないため、
本 PLAN は **生成済み doc parity** に限定して閉じる。

## スコープ

### IN — 生成済み欠落 doc（LOCAL match=0 確認済）
- `docs/reference/setup-guide.md`: consumer setup / onboarding 向け reference。2026-07-05 追加済み。
- `docs/templates/design/L6-function-spec-template.md`: L6 function-spec 設計テンプレート（design-doc IR §S-grade と対）。2026-07-05 追加済み。
- `docs/templates/github/common/pack-harness-check.yml`: pack CI profile template（distribution surface＝escalation 判断）。2026-07-05 追加済み。

### OUT
- CI hardening（branch-type guard / audit quality gate / db rebuild step）はこの PLAN の完了範囲から外す。
  `github-ops-guard` 実装依存と distribution surface の判断を伴うため、`PLAN-L7-322` 系の後続独立 PLAN で扱う。
- `docs/process/modes/design-bottomup.md` は `PLAN-DISCOVERY-07-design-bottomup-mode` の S4 confirmed 後にだけ
  process 正本へ追加する。S4 前に未承認 mode doc として新設しない。
- `docs/process/modes/retrofit.md` 等の cited command 是正と screen 設計連鎖 gap は、この doc parity closure の
  完了範囲に含めない。必要時は L3/L6 pair-freeze chain の独立 PLAN で扱う。
- 上流の ut-tdd→helix リネーム由来で upstream-only に見える正本 doc（concept/requirements/ADR 等）は LOCAL に helix 名で実在＝対象外。
- governance methodology 概念（audit-lens-catalog / design-doc-IR / quality-uplift / scope-integrity / evasion-taxonomy）は completeness addendum §3 で設計層採否判断（本 PLAN では新設しない）。
- distribution/pack surface の実切替は PLAN-M-02 承認前に行わない。
- README / READE は gate、証跡、完了条件に紐づけない。

## 受入条件
- 欠落 doc が HELIX 式（日本語・helix 命名）で新設され、参照が実在（relation-graph stale-edge を作らない）。
- doctor / lint / plan lint green。confirmed 前に review evidence 記録。

## スケジュール
- mode: serial（項目ごとに独立着地）。
- Step 1: 欠落 doc 新設（setup-guide → L6-function-spec-template → pack-harness-check template）→ done。
- Step 2: design-bottomup mode doc は `PLAN-DISCOVERY-07` の S4 confirmed 後に process 正本へ追加する。
- Step 3: CI hardening は `PLAN-L7-322` 系の後続独立 PLAN へ送る。
- Step 4: review evidence を記録して confirmed 化する。

## 壊さない / 再発させない
- LOCAL 先行の CI（escalation-stale.yml）と日本語 doc を回帰させない。
- 新設 doc は generates 実在物のみ規約を守り stale-edge を作らない。
- distribution surface の不可逆操作は PLAN-M-02 承認前に行わない。

## レビュー / 次工程
- この PLAN は生成済み doc parity を正本化する。CI hardening、mode doc 正本化、screen 設計連鎖の gap は
  完了主張せず、後続判断に残す。
- 出典: [[upstream-helix-reconciliation]] completeness pass（workflow & document 差分確認）。
</content>
