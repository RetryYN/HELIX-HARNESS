---
schema_version: skill.v1
name: research
skill_type: process
applies_to:
  layers:
    - L1
    - L2
    - L3
  drive_models:
    - Discovery
    - Scrum
    - Forward
    - Add-feature
---

# research（調査）

UT-TDD 向けの WebSearch/WebFetch primary-source protocol (FR-L1-27 Research
workflow → ADR)。PO に確認する前に web research と subagent self-review を行う
elicitation-AI-first rule を支える。ルールは 2 つ: primary-source URL なしに主張しない。
WebFetch body confirmation なしに URL を引用しない。

## この skill を load する場面

- Discovery PLAN (S1 plan / S2 PoC) で外部技術比較が必要なとき。
- ADR の Context section で外部 evidence を引用するとき。
- task が `pmo-tech-docs` / `pmo-tech-news` subagent に route されるとき。
- PLAN が external API、library、standard に依存し、pair-freeze 前の確認が必要なとき。

## Two-tool protocol（2-tool 手順）

**Step 1 — WebSearch（候補収集）.** subject + constraint
（version、deprecation、release notes）、official-domain identifiers、year qualifier を含めて
で query する。non-primary-domain snippet は decision evidence として採用しない。

**Step 2 — WebFetch（本文確認）.** 引用するすべての URL を fetch し、
publication date / version scope、特定の claim が body に実際にあること、
compatibility や deprecation caveat を確認する。search snippet で見ただけの URL は
引用しない。snippet は source を誤って表すことがある。

## Source reliability labels（source 信頼性 label）

| Label | 定義 |
|---|---|
| primary | vendor 公式 docs、standard spec、official source repo |
| first-hand | methodology が明示された調査記事 |
| secondary | original methodology を伴わない aggregation / repost / summary |

Decision evidence は `primary` でなければならない。`first-hand` は補助として使える。
`secondary` は background のみで、ADR や PLAN の唯一の citation にしてはならない。

## Output format（PLAN / ADR / `.ut-tdd/audit/` に記録）

```
Research summary: [2-5 文]
Sources:
1. [Title](URL) — primary — retrieved YYYY-MM-DD — vX.Y / date-scoped
   Key claim: ...   WebFetch confirmed: yes
Unresolved / requires-further-investigation:
- [specific gap]
```

## Discovery / Scrum との統合

- Discovery S1: findings は `ut-tdd plan lint` 前に PLAN `evidence` へ反映する。
- Scrum S2: 選定した technology は少なくとも 1 つの `primary` source を引用する。
- Scrum S3: prior research と矛盾する PoC result は、S4 decide 前に
  `.ut-tdd/audit/` へ記録する。

## Cost-aware delegation（cost-aware 委譲）

multi-source sweep では、lightweight research role へ
`ut-tdd claude --role pmo-haiku --task "..."` で委譲する
(`--dry-run` で先に prompt を確認する)。要求事項は objective、最低 2 件の primary source、
上記の output format、URL ごとの WebFetch confirmation。authoritative として記録する前に、
返却された source の少なくとも 1 件を自分で検証する。delegated output は claim であり、
evidence ではない。

## 禁止事項

- search snippet だけを根拠に version constraint を主張する。
- 404 または redirect する URL を re-fetch せずに引用する。
- ADR decision の唯一の citation として `secondary` source を使う。
- retrieval date なしで research findings を記録する (staleness を判断できない)。
