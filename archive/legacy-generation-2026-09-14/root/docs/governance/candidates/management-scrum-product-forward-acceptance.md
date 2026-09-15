---
title: "管理Scrumとproduct Forward入口分離の受入設計"
status: confirmed
canonical_layer: cross
canonical_pair: cross
plan: docs/plans/PLAN-RECOVERY-1737-management-scrum-product-forward.md
pair_artifact: docs/governance/management-scrum-product-forward.md
parent_design: docs/governance/management-scrum-product-forward.md
---

# 管理Scrumとproduct Forward入口分離の受入設計

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-MSPF-001 | adapter正本 | AGENTS／CLAUDEが管理Scrum、Scrum Reverse、product Forward、Project read-sideを同時に宣言する | `tests/management-scrum-product-forward.test.ts` |
| U-MSPF-002 | governance read order | governance READMEから入口分離正本へ到達できる | `tests/management-scrum-product-forward.test.ts` |
| U-MSPF-003 | 管理見落としIssue | 観測、影響、再発、gate、Scrum段階、Reverse先の欠落をテンプレで防ぐ | `tests/management-scrum-product-forward.test.ts` |
| U-MSPF-004 | authority境界 | Project／DBを意味正本や完了正本へ昇格させない | `tests/management-scrum-product-forward.test.ts` |
