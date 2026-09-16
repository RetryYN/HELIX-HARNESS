---
feature_ticket_id: FT-HARNESS-DESIGNTPL-001
title: "HARNESS Design Template semantic coreとseed pack"
product_target: HELIX-HARNESS
state: proposed_upstream_waiting
priority_order: 5
created: 2026-09-15
authority_effect: work_projection_only
github_projection:
  issue: 1802
  url: https://github.com/RetryYN/HELIX-HARNESS/issues/1802
  projection_receipt_ref: docs/governance/audits/source-rebaseline/github-feature-ticket-projection-2026-09-15.md
  read_after_state: OPEN
parent_requirements:
  - HARNESS-L2-009
acceptance_source: docs/helix-harness/L11-acceptance/product-acceptance.md
depends_on:
  - FT-HARNESS-SEMEXTRACT-001
  - FT-HARNESS-REQENG-001
blocks:
  - FT-OS-DESIGNTPL-001
---

# FT-HARNESS-DESIGNTPL-001: HARNESS Design Template semantic coreとseed pack

## 目的

要求kind、対象、構成、risk、domainから適用templateと設計義務を導き、必要な要求入力の不足を要求エンジンへ
backflowするDesign Template semantic coreと初期seed packを具体化する。

## 成果候補

- versioned template、applicability、必須input／section／field、relation、negative oracle、measurement、completion contract。
- unit、connection、composite別の設計義務と、要求・設計成果・対検証のtrace。
- `required`／`conditional`／`N/A`／`unresolved`の適用判定と再評価条件。
- missing design inputから質問・矛盾・derived requirement candidateを返すbackflow contract。
- archiveと実例から個別採否した最小seed packと、適用範囲・限界・failure fixture。
- applicability、義務生成、backflow、semantic impactのPython core境界。

## 停止条件

- HARNESS-L2-009、要求エンジンsemantic contract、semantic atom抽出結果が未承認。
- templateから要求意味や人間合意を自動生成する。
- unit templateでconnection／compositeの設計完了を代替する。
- 旧Design Template JSON、旧#290、旧test／CIをcurrent authorityや完成証拠にする。

現在はticket発行だけを行い、template schema、seed採択、Python実装、生成器、CIを起動しない。
