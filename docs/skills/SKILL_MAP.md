---
schema_version: skill.v1
name: SKILL_MAP
skill_type: skill-map
applies_to:
  layers:
    - L1
  drive_models:
    - Forward
---

# SKILL_MAP（skill 索引）

`docs/skills/` の catalog index。この file は skill 本文ではなく索引である。
trigger が active なときだけ個別 pack を読む。すべての pack を一括 load しない。
各 pack は context を消費する。

## Recommendation の仕組み

`helix skill suggest --plan <path>` は、PLAN の `layer` と drive model に対して各 pack を score する
（recommender は各 pack の本文ではなく、frontmatter の `applies_to.layers` /
`applies_to.drive_models` を読む）。current task では top-scoring pack だけを読む。

## Discovery protocol（開始時 / task 到着時の発見手順）

1. `helix status` — 現在の layer、drive model、active PLAN を確認する。
2. `helix skill suggest --plan <active-plan-path>` — 推奨 pack の順位を確認する。
3. 作業開始前に top-scoring pack(s) を読む。
4. まだ PLAN が無い場合（Discovery S0 / cold start）は trigger table から選ぶ。
5. current layer / drive に合わない pack は skip する。context を消費するだけである。

## Trigger table（選択表）

| タスク / signal | Pack |
|---|---|
| design doc / ADR 作成、freeze readability の改善 | documentation-and-adrs |
| architecture / data / sequence diagram の設計 | design-doc |
| API endpoint / contract / IA boundary の設計 | api, api-contract, api-and-interface-design |
| DB schema / migration / projection の設計 | db, data-migration |
| dependency / impact analysis の実施 | dependency-map |
| sizing、two-stage (W-model) design の整理 | system-design-sizing |
| tech evaluation から ADR への整理 | tech-selection, research |
| TDD implementation（Red-first）の実装 | test-driven-development, incremental-implementation |
| test strategy / levels / fixtures の設計 | testing, spec-driven-development |
| trace-freeze / accept の code review | code-review, code-review-and-quality |
| adversarial / judgement-gate review の実施 | adversarial-review, verification |
| security / threat / hardening の確認 | security, threat-model, security-and-hardening |
| refactor（behaviour-invariant）の実施 | refactoring |
| debugging / error fix / recovery の実施 | debugging-and-error-recovery, error-fix |
| Reverse R0-R4 / RGC の分析 | reverse-analysis, reverse-r0 … reverse-r4, reverse-rgc |
| PLAN authoring / WBS / schedule steps の作成 | planning-and-task-breakdown, gate-planning |
| program / portfolio view、milestones の管理 | project-management |
| estimation / effort の見積り | estimation |
| Discovery / PoC の実施 | poc |
| tech-debt ledger の管理 | debt-register |
| subagent / team design の設計 | agent-design, agent-teams |
| cost-aware delegation の設計 | agent-cost-design |
| feature 内の LLM call / RAG / agent routing | llm-agent-routing |
| context injection / budget の設計 | context-engineering |
| handover / session continuity の維持 | context-memory, requirements-handover |
| CI gate design / deploy / rollback の設計 | ci-gate-design, ci-deploy-and-rollback |
| telemetry / harness.db observability の確認 | harness-observability |
| incident / runbook の整備 | incident-runbook |
| deprecation / cutover の設計 | deprecation-cutover |
| browser / screen (L10) verification の実施 | browser-testing-and-screen-verification |
| Git / Conventional Commits / CI の運用 | git |
| docs maintenance（README / runbook prose）の実施 | documentation |
| 実装 / レビュー / 委譲の判断規律（全工程横断） | judgment-core |

## Core operating rules（全 pack 共通）

判断規律（普遍 7 原則・モデル別調整・レビュー規律・委譲 4 点セット）の正本は
`judgment-core` pack（`docs/skills/judgment-core.md`）。agent / command の marker 同期は
doctor gate `judgment-core-coverage` が fail-close で検査する。

- 非自明な作業の前に assumptions を surface する。PLAN↔doc↔code の不整合があれば推測せず止める。
- completion は仮定せず検証する。`helix doctor` が exit 0、`helix review --uncommitted` に
  blocking findings が無い、tests が green であることを確認する。
- active PLAN scope 内に留まる。副作用として隣接 code を refactor しない。
- task が session または runtime boundary を越える場合は、`.helix/handover/` または
  `.helix/audit/` に handover / evidence を記録する。

ここに無い pack は catalog に登録されず、score 対象にならない。個別 pack file を更新する。
scored registry は `helix skill suggest` が管理する。
