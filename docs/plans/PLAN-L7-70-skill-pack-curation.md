---
plan_id: PLAN-L7-70-skill-pack-curation
title: "PLAN-L7-70 (impl): skill pack の HELIX substance curate (FR-L1-47 / FR-L1-12)"
kind: impl
layer: L7
drive: agent
parent_design: docs/design/harness/L5-detailed-design/module-decomposition.md
status: confirmed
created: 2026-06-17
updated: 2026-06-17
owner: PM (Opus) / PO (人間)
review_evidence:
  - reviewer: claude-opus-4-8
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-17"
    tests_green_at: "2026-06-17"
    verdict: pass
    scope: "Skill substance curation closed: 54 packs all carry HELIX substance (0 generic stubs), valid skill.v1 routing frontmatter, real helix commands only, 0 legacy terms, readability 0 markers. pmo-tech-docs subagents authored per requirement-mapped batches; PM verified via asset catalog, doctor, readability/asset-drift gates, byte-level U+FFFD scan, and full Vitest (685)."
    worker_model: sonnet
    reviewer_model: claude-opus-4-8
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T18:10:04+09:00"
    tests_green_at: "2026-07-09T18:10:04+09:00"
    verdict: pass
    scope: "current-location recovery collect_evidence: skill recommendation / assignment / asset catalog の現行回帰網で skill pack curation を再検証し、review_evidence.green_commands へ投影可能な実行証跡を追加する。"
    worker_model: codex
    reviewer_model: codex
    green_commands:
      - kind: unit_test
        command: "bunx vitest run --project fast tests/skill-recommend.test.ts tests/skill-assignment.test.ts tests/asset-catalog.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T18:10:04+09:00"
        evidence_path: tests/skill-recommend.test.ts
        output_digest: "sha256:c06b5b9291c110bd2700bf5bad8fe514ac04eb87d672dab7e964ea86df72655f"
agent_slots:
  - role: tl
    slot_label: "TL - skill pack HELIX substance curate (catalog frontmatter + body)"
generates:
  - artifact_path: docs/plans/PLAN-L7-70-skill-pack-curation.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/deprecation-cutover.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/ci-gate-design.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/harness-observability.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/data-migration.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/ci-deploy-and-rollback.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/browser-testing-and-screen-verification.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L5-06-skill.md
  requires:
    - docs/design/harness/L5-detailed-design/module-decomposition.md
    - docs/design/harness/L1-requirements/functional-requirements.md
    - docs/migration/helix-fork-completion-plan.md
  references:
    - docs/plans/PLAN-L4-12-skill-pack.md
    - docs/plans/PLAN-DISCOVERY-03-skill-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
related_l0_extra: docs/design/harness/L1-requirements/functional-requirements.md
---

# PLAN-L7-70 (impl): skill pack の HELIX substance curate

## 0. 目的

FR-L1-47（skill pack の HELIX curate）と FR-L1-12（L 単位 文脈注入）を満たすため、
`docs/skills/*.md` の各 pack に実質的な HELIX 手順を持たせる。対象は
`src/skills/recommend.ts` が読む routing frontmatter と、HELIX workflow 内での使い方を
説明する本文である。本文は実在する `helix` command、`.helix/` state、V-model layer、
drive model、gate を前提にする。HELIX vendor source は ADR-001 と fork plan §1.5 に基づく
参考資料に限定し、verbatim copy や HELIX/ai-dev-kit term は持ち込まない。

## 1. 問題（2026-06-17 検証）

4 agent survey により、fork plan §2.5 のリスクが確認された。既存の curated pack 約 47 件は、
同一の generic stub body（"This is a HELIX-HARNESS skill document … Scope …
Operating Rules"）を共有し、skill 固有の procedure を持っていなかった。
`recommendSkillsForPlan` は frontmatter の `applies_to.layers` /
`applies_to.drive_models` で scoring できるため、機械的な injection は成立していたが、
注入される内容に有用な procedure が無かった。47 pack の audit verdict は
0 KEEP-ASIS、38 NEEDS-SUBSTANCE、9 PRUNE だった。

## 2. 範囲

Requirements-driven（§1.5）として、pack は FR-L1-*、drive、mode のいずれかへ対応する場合だけ
残す。作業は次の 3 操作に分ける。

- **Add（new packs）:** HELIX に不足している §2.1 migrate-now topic を追加する。
  対象は deprecation、CI gate design、observability、data migration、deploy/rollback、
  browser verification、runbook、LLM routing などで、HELIX design から作成する。
- **Substance pass（existing）:** 38 件の NEEDS-SUBSTANCE stub body を実際の HELIX
  procedure へ書き換え、誤った frontmatter routing tag を修正する。
- **Prune（§1.5）:** HELIX-shaped、no-requirement、duplicate に該当する pack を削除する。
  対象は `ai-coding`、`api`、`code-review`、`documentation`、`project-management`、
  `quality-lv5`、`security-and-hardening`、`source-driven-development`、`testing` であり、
  削除前に各 pack を再確認する。

Command vocabulary は実在する `helix` surface に限定する。利用可能な語彙は `status`、`doctor`、
`plan lint`、`plan use`、`review`、`handover`、`skill suggest`、`team`、`codex`、`claude`、
`gate`、`vmodel lint`、`telemetry`、`metrics`、`graph`、`find`、`db`、`setup`、
`asset catalog` である。
未実装 command（`helix task classify`、`helix reverse`、`helix scrum`、`helix debt`）は
§6 P0 または pending work として扱い、live command として引用しない。必要な場合は
drive/mode と既存 lint を参照する。

## 3. バッチ

作業は multi-batch とし、pack が landed するたびに `generates` を拡張する。

- **Batch 1（this PLAN）:** 実在 command だけを参照する high-value pack を 6 件追加する。
  対象は `deprecation-cutover`、`ci-gate-design`、`harness-observability`、
  `data-migration`、`ci-deploy-and-rollback`、
  `browser-testing-and-screen-verification`。
- **Batch 2+:** 残りの new pack（`incident-runbook`、`llm-agent-routing` など）、38 stub の
  substance pass、9 件の prune を進める。

## 4. 受入条件

- landed した各 pack は有効な `skill.v1` frontmatter を持つ。`name`、`skill_type` は既存の
  7-value set、`applies_to.layers` は L0-L14、`applies_to.drive_models` は 9-value set に従う。
- landed した各 pack body は HELIX-substantive であり、実在 command、state、gate を説明する。
  generic stub ではなく、HELIX/ai-dev-kit term や `HELIX_*` env を含めない。
- `helix asset catalog`、`helix doctor`、Biome、typecheck、Vitest は green を維持する。
  新規 pack に対する readability/asset-drift lint も pass する。
- Review evidence は accept gate の前に記録する。

## 5. 状態

2026-06-17 に confirmed。substance pass は 4 batch で完了した。

- Batch 1: new pack 6 件（`deprecation-cutover`、`ci-gate-design`、`harness-observability`、
  `data-migration`、`ci-deploy-and-rollback`、`browser-testing`）と search-index SSoT fix。
- Batch 2: substance rewrite 5 件（`gate-planning`、`research`、`documentation-and-adrs`、
  `design-doc`、`agent-cost-design`）。
- Batch 3: substance rewrite 36 件（`review/security`、`test/impl`、`design/api/db`、
  `agents/context`、`planning`、`Reverse series`）。
- Batch 4: substance rewrite 4 件（`poc`、`debt-register`、`project-management`、
  `requirements-handover`）、new pack 2 件（`incident-runbook`、`llm-agent-routing`）、
  real catalog index としての SKILL_MAP rewrite、prune 4 件（`ai-coding`、`quality-lv5`、
  `source-driven-development`、`SKILL_MAP-draft`）。

結果は 54 pack すべてが HELIX substance を持ち、generic stub は 0 件である。これにより、
fork plan §8(1) の skill-curation と substance-pass component は vendor-removal gate を満たす。
