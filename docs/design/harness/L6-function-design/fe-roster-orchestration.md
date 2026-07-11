---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-66-fe-roster-orchestration.md
---

> **L6 contract marker**: `verifyFeRosterTopology(input: FeRosterEvidence) => FeRosterResult` と
> `verifyFeModelGeneration(input: FeModelEvidence) => FeModelResult` はunit-test粒度のcontract。
> pre: agent frontmatter、runtime allowlist、model policy、tier table、pricing keyを正本exportから読む。
> post: `U-FEROSTER-001/002`が全greenのときだけ合格。invariant: Fableはadvisory-only、
> 現行routeは`MODEL_IDS.claude.sonnet`へ解決し、legacy pricing keyはrouteへ復帰しない。

# FE ロスター・モデル世代オーケストレーション機能設計

## 1. 目的

FE 実装の責任分界と model generation SSoT を、agent proseの慣習ではなく検証可能な機能契約として固定する。
本設計は `PLAN-L7-309-fe-roster-orchestration` の実装意味を正規 L6 へ降ろす。

## 2. FE topology 契約

- `fe-lead` は Opus の lead/reviewerであり、設計・分割・受入判断を主導する。
- `fe-ui` は Sonnet 5 の実装workerであり、`fe-lead` が確定した境界に従う。
- `fe-lead` / `fe-ui` は runtime allowlist と shared instruction allowlistの双方へ登録する。
- UX/ユーザビリティ判断は `advisor-fable` へ相談できるが、Fableはadvisory-onlyで実装しない。
- 実装責任は常に `fe-lead` / `fe-ui` に残り、advisor経由へ迂回しない。

## 3. model generation SSoT 契約

- `MODEL_IDS.claude.sonnet` を現行Sonnet世代の単一正本とする。
- sonnet agent frontmatter、team model policy、tier routeは同じmodel IDへ解決する。
- 外部pricing由来の別正本`CLAUDE_PRICING`は、現行Sonnet keyとの整合を必ず持つ。
- 旧 `claude-sonnet-4-6` pricing keyは履歴再計算のため保持し、現行routeへ戻さない。

## 4. fail-close境界

agent model、allowlist、advisory-only文言、team policy、pricingのいずれかが分岐した場合、
`U-FEROSTER-001/002`をredにする。PLAN固有Vペア解消は`U-FEROSTER-003`でauthority tombstone、
resolution PLAN、target PLANの結合を検証する。

## 4.1 DbC

| contract | precondition | postcondition | invariant |
|---|---|---|---|
| `verifyFeRosterTopology` | agent frontmatterとexported allowlistをparse可能 | lead/worker modelとallowlist membershipがexact、advisor toolsにEdit/Writeなし | 実装責任はfe-lead/fe-uiに残る |
| `verifyFeModelGeneration` | `MODEL_IDS`、`TIER_TABLE`、`selectTeamModel`、`CLAUDE_PRICING`を読める | 現行Sonnet IDがagent/team/tier/pricingで一致 | `claude-sonnet-4-6`はpricing履歴のみ |

## 5. Vペア

- 右腕正本: `docs/test-design/harness/L8-unit-test-design.md`
- 実装oracle: `tests/fe-roster-orchestration.test.ts`
- case: `U-FEROSTER-001..003`
