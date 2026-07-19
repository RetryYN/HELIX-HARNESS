---
plan_id: PLAN-L7-71-slash-commands
title: "PLAN-L7-71 (impl): .claude/commands slash-command transplant (FR-L1-12)"
kind: impl
layer: L7
drive: agent
parent_design: docs/design/harness/L5-detailed-design/module-decomposition.md
status: confirmed
created: 2026-06-17
updated: 2026-06-19
owner: PM (Opus) / PO (人間)
review_evidence:
  - reviewer: PM (Opus) verification (intra_runtime_subagent)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-19"
    tests_green_at: "2026-06-19"
    verdict: pass
    scope: "Phase-1 slash command transplant (.claude/commands/{ship,sdd-review,sdd-plan,spec,test,build,code-simplify}.md、commit 7305fe7) の status drift (draft のまま放置) を解消し confirmed 化。AC を機械再検証: ①7 ファイル全て実在・description frontmatter 有 ②legacy-term scan (helix/HELIX_/ai-dev-kit) = 0 hit ③全ファイルが実在 helix command (review/gate/status/plan lint/doctor) を参照 ④allowlisted subagent のみ参照。typecheck/Biome/Vitest 785/doctor EXIT=0。P2 (innovation-{tech,marketing,synthesize}) は §4 で明示 defer (本 confirmed の scope 外)。"
    worker_model: claude-opus-4-8
    reviewer_model: claude-opus-4-8
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T18:19:19+09:00"
    tests_green_at: "2026-07-09T18:19:19+09:00"
    verdict: pass
    scope: "current-location recovery collect_evidence: `.claude/commands` 由来の non-src deliverable drift 検出を `merged-plan-status` 回帰網で再検証し、review_evidence.green_commands へ投影可能な実行証跡を追加する。"
    worker_model: codex
    reviewer_model: codex
    green_commands:
      - kind: unit_test
        command: "bunx vitest run --project fast tests/merged-plan-status.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T18:19:19+09:00"
        evidence_path: tests/merged-plan-status.test.ts
        output_digest: "sha256:88411fe247de3f81d85e8e4288b08131545cb1fe5dadd63429a6ac8643c3b4c8"
agent_slots:
  - role: tl
    slot_label: "TL - slash command transplant (HELIX adaptation)"
generates:
  - artifact_path: docs/plans/PLAN-L7-71-slash-commands.md
    artifact_type: markdown_doc
  - artifact_path: .claude/commands/ship.md
    artifact_type: markdown_doc
  - artifact_path: .claude/commands/sdd-review.md
    artifact_type: markdown_doc
  - artifact_path: .claude/commands/sdd-plan.md
    artifact_type: markdown_doc
  - artifact_path: .claude/commands/spec.md
    artifact_type: markdown_doc
  - artifact_path: .claude/commands/test.md
    artifact_type: markdown_doc
  - artifact_path: .claude/commands/build.md
    artifact_type: markdown_doc
  - artifact_path: .claude/commands/code-simplify.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-70-skill-pack-curation.md
  requires:
    - docs/migration/helix-fork-completion-plan.md
    - docs/skills/SKILL_MAP.md
  references:
    - .claude/CLAUDE.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-71 (impl): .claude/commands slash command 移植

## 0. 目的

fork plan §4 の `slash commands`、すなわち効果が最も高い新規 stream を実現するため、
HELIX には存在しない `.claude/commands/` を作成し、HELIX の review/spec/TDD/impl
gate を実運用へ接続する Claude Code slash command を配置する。これは FR-L1-12
layer-context injection における `recommended command` 要素である。

## 1. 適応ルール (§1.5)

各 command は HELIX 向けに再著述し、HELIX は緩い参照元にとどめる。

- **実在する** `helix` command surface (`review --uncommitted`, `gate`,
  `status`, `plan lint`, `doctor`) だけを参照し、`helix` command は参照しない。
- HELIX allowlist 済み subagent (`code-reviewer`, `security-audit`,
  `qa-test`, `pmo-*`, `pdm-*`) だけを参照する。この制約は `PreToolUse(Agent)` guard が強制する。
- `docs/skills/` の curated HELIX skill pack を参照し、legacy skill id は参照しない。
- legacy term (`helix`, `HELIX_`, ai-dev-kit path) を含めない。

## 2. スコープ (Phase-1)

- **P0:** `ship` は fan-out orchestrator から `code-reviewer` / `security-audit` /
  `qa-test` を呼び出して go/no-go を判定する。`sdd-review` は 5-axis review、
  `sdd-plan` は検証可能な task breakdown を扱う。
- **P1:** `spec` は spec-first、`test` は TDD、`build` は incremental impl、
  `code-simplify` は refactor を扱う。
- **P2 (defer):** `innovation-{tech,marketing,synthesize}` は `pdm-*` agent を呼び出す
  command 群であり、後続 batch へ defer する。

## 3. 受入条件

- `.claude/commands/*.md` が存在し、`description` frontmatter と HELIX prompt body を持つ。
- legacy term を含まず、実在する `helix` command と allowlist 済み agent だけを参照する。
- `helix doctor`、Biome、typecheck、Vitest が green を維持する。

## 4. Status

2026-06-19 に confirmed。Phase-1 commands (P0+P1: `ship`, `sdd-review`,
`sdd-plan`, `spec`, `test`, `build`, `code-simplify`) は 2026-06-17 に作成・commit 済み
(`7305fe7`) だったが、作業完了かつ command が live であるにもかかわらず PLAN status が
`draft` に drift していた。§3 の受入条件に対して再検証し、7 ファイルすべてが
`description` frontmatter を持つこと、legacy term が 0 件であること、実在する `helix`
command と allowlist 済み agent だけを参照していることを確認したうえで confirmed へ変更した。

**明示的な defer (formal carry):** P2 innovation command
(`innovation-tech`, `innovation-marketing`, `innovation-synthesize`; `pdm-*`
agent を呼び出す) は、この PLAN の scope から意図的に外す。

- owner: PM (Opus) / PO (人間)
- condition: `pdm-*` invocation contract を含む innovation-agent workflow surface を実際に扱う段階で、
  P2 innovation command を後続 batch として作成する。それまでは記録済み defer であり、
  under-design gap ではない。
