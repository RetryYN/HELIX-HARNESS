---
layer: L6
artifact_type: design_doc
status: confirmed
pair_artifact: docs/test-design/harness/review-evidence-supersession-structure.md
created: 2026-09-02
plan: docs/plans/PLAN-RECOVERY-89-review-evidence-supersession-structure.md
---

# Review evidence／supersession構造境界 L6設計

## 責務

PLANのleading frontmatterを構造解析し、review evidenceとsupersession edgeを本文から分離する。
既存review evidence lint、PLAN supersession lint、branch kind admissionへ同じtyped構造を投影する。

## 契約

- `review_evidence`はfrontmatter内の有効なentryだけをpresenceとして数える。
- `supersedes`と`superseded_by`はblock／flow styleを同じexact plan ID集合へ正規化する。
- 訂正先の実在と双方向edgeを要求し、本文・dependenciesの文字列一致で代用しない。
- frontmatter不在・malformed YAML・空entry・片方向edgeはfail-closeする。
- Recovery branchで許可する既存PLAN migrationは、`superseded_by`だけの構造差分へ限定する。

## 既存設計との境界

`review-evidence.md`はreview evidence全体の既存機能設計として維持する。本設計はIssue #1446で
追加された構造解析と訂正edgeの原子責務だけを所有し、既存の広域V-pairを置換しない。
