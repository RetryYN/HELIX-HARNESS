---
title: "管理Scrumとproduct Forwardの入口分離"
status: draft
canonical_layer: cross
canonical_pair: cross
plan: docs/plans/PLAN-RECOVERY-1737-management-scrum-product-forward.md
pair_artifact: docs/governance/candidates/management-scrum-product-forward-acceptance.md
---

# 管理Scrumとproduct Forwardの入口分離

管理側は、gate漏れ、admission欠落、監査所見、運用上の再発を発見した時点でIssue化し、
`S0 backlog → S1 plan → S2 poc → S3 verify → S4 decide`で小さく収束する。S4の採用判断は
Scrum内でproduct authorityを変更せず、正規Vモデルの該当層へScrum Reverseする。

product要求・設計・実装はcanonical L1〜L12のForwardで進める。管理上の緊急性を理由にVペア、
上下edge、TDD、review、acceptanceを省略しない。

## Authority境界

- Git上のRequirement／Design／PLANは意味正本とする。
- admitted event／receiptは実行事実とする。
- `harness.db`とGitHub Projectは再構築可能なread-side projectionとする。
- Project Statusから上流意味、承認、完了状態を逆書込みしない。

## 管理見落としIssueの最小契約

Issueは観測、影響範囲、再発回数、提案するgate／checklist、現在のScrum stage、Scrum Reverse先を
欠落なく保持する。同一findingを重複起票せず、既存Issueへ観測証拠を追記する。
