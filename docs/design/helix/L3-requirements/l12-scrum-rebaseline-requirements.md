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
| L12R-FR-002 | 本格・high-risk systemはFull V、適格な段階release・小規模systemはProduction Scrum、非production実験はDiscovery/PoCへexactly oneでrouteする |
| L12R-FR-003 | Production Scrumの各sliceは縮約L1〜L12、TDD、Scrum Reverse、release、operation evidenceを保持する |
| L12R-FR-004 | UI案件はprototype receipt、非UI案件は理由付きN/A receiptなしにL3 freezeできない |
| L12R-FR-005 | legacy L0〜L14はcompatibility inputに限定し、canonical outputへ混在させない |
| L12R-FR-006 | Core Reads、schema、PLAN lint、DB projection、template、tag、current-locationを同一authority epochへ収束させる |
| L12R-FR-007 | VモデルとProduction Scrumを同格の一線級delivery engineとして選択可能にし、Scrumを簡易版・縮退版として扱わない。両engineは同じ品質属性、二主体review、trace、DB追従、release evidenceを満たす |
| L12R-FR-008 | Scrum ReverseはScrumの格下げや終了条件の代替ではなく、sliceの実測知見をcanonical V設計資産へ同期する対等な接続契約とする |
