---
title: "L1〜L12 Vモデル＋Scrum 再ベースライン要件"
layer: L3
kind: add-design
status: confirmed
created: 2026-07-18
updated: 2026-07-18
owner: PO / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
pair_artifact: docs/test-design/helix/l12-scrum-rebaseline-acceptance.md
---

# L1〜L12 Vモデル＋Scrum 再ベースライン要件

本書はgovernance正本の機械pair入口であり、要件本文を複製しない。

| ID | 拘束 |
|---|---|
| L12R-FR-001 | canonical工程はL1〜L12 exactly onceとし、V-pairはL1↔L12、L2↔L11、L3↔L10、L4↔L9、L5↔L8、L6↔L7の6組とする |
| L12R-FR-002 | 要求確定度、複雑性、実装規模、継続成長/feedback頻度、段階release、risk/規制/migration影響から、Full V、Production Scrum、V設計＋Scrum実装Hybrid、Discovery/PoCへrouteする |
| L12R-FR-003 | Production Scrumの各sliceはTDD、Scrum Reverse、release、operation evidenceを保持し、最終要求・設計・検証contractをVモデル正本へ還流する |
| L12R-FR-004 | UI案件はprototype receipt、非UI案件は理由付きN/A receiptなしにL3 freezeできない |
| L12R-FR-005 | legacy L0〜L14はcompatibility inputに限定し、canonical outputへ混在させない |
| L12R-FR-006 | Core Reads、schema、PLAN lint、DB projection、template、tag、current-locationを同一authority epochへ収束させる |
| L12R-FR-007 | VモデルとProduction Scrumを同格の一線級delivery engineとして選択可能にし、Scrumを簡易版・縮退版として扱わない。両engineは同じ品質属性、二主体review、trace、DB追従、release evidenceを満たす |
| L12R-FR-008 | Scrum ReverseはScrumの格下げや終了条件の代替ではなく、sliceの実測知見をcanonical V設計資産へ同期する対等な接続契約とする |
| L12R-FR-009 | 小規模かつ継続成長・高feedbackで一般的Scrumが適するproductはProduction Scrum、要求確定または複雑なbatch/systemはFull Vを選ぶ |
| L12R-FR-010 | 大規模・複雑でも段階releaseが適するproductはL1〜L5をVモデルで先行凍結し、設計境界内をScrum実装してrelease candidateごとにV-pair全体へ再収束する |
