---
layer: L8
artifact_type: test_design
status: confirmed
pair_artifact: docs/design/helix/L6-function-design/review-evidence-supersession-structure.md
created: 2026-09-02
plan: docs/plans/PLAN-RECOVERY-89-review-evidence-supersession-structure.md
---

# Review evidence／supersession構造境界 L8検証設計

| Oracle | 対象 | 期待結果 |
| --- | --- | --- |
| U-REVIEW-001 | `hasReviewEvidence` | 本文・例・引用だけならfalse、leading frontmatter entryだけtrue |
| U-SUPER-001 | `parseSupersedes` | block／flow style配列を同じplan_id集合へ正規化 |
| U-SUPER-002 | `analyzePlanSupersession` | exact双方向edgeの場合だけgreen |
| U-SUPER-003 | `analyzePlanSupersession` | 本文やdependenciesのPLAN IDを逆edgeとして受理しない |
| U-SUPER-004 | parser／analyzer | frontmatter不在・malformed YAMLをfail-closeし、CRLFを受理 |
| U-BRANCH-SUPER-001 | branch-kind guard | supersession metadataだけ許可し、他field混載を拒否 |
| U-L3APP-014 | L3 approval guard | supersession metadataだけ非意味変更として許可 |

全文検索、旧line parser、無条件Recovery許可へ戻すmutationは対応oracleを個別にredへ戻す。
