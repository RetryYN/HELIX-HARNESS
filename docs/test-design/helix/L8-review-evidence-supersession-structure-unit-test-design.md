---
layer: L8
artifact_type: test_design
status: confirmed
pair_artifact: docs/design/harness/L6-function-design/review-evidence.md
created: 2026-09-02
plan: docs/plans/PLAN-RECOVERY-89-review-evidence-supersession-structure.md
---

# Review evidence／supersession構造境界 L7検証設計

対応PLAN: `PLAN-RECOVERY-89-review-evidence-supersession-structure`

## 検証責務

PLAN本文の文字列をevidenceまたはsupersession edgeとして誤認せず、leading frontmatterの
typed YAML fieldだけをexact照合する。

| Oracle | 対象 | 期待結果 |
| --- | --- | --- |
| U-REVIEW-001 | `hasReviewEvidence` | 本文・例・引用だけに`review_evidence:`とreviewer文字列があってもfalse。leading frontmatterのentryだけがtrue |
| U-SUPER-001 | `parseSupersedes` | block／flow styleのYAML配列を同じplan_id集合へ正規化し、pathと`.md`を除去する |
| U-SUPER-002 | `analyzePlanSupersession` | 後継`supersedes`と先行`superseded_by`がexact plan_idで双方向ならgreen。逆edge欠落・target不在はfail-close |
| U-SUPER-003 | `analyzePlanSupersession` | 先行PLAN本文やdependenciesの後継PLAN IDを逆edgeとして受理しない |
| U-SUPER-004 | `parseSupersedePlan` / `analyzePlanSupersession` | frontmatter不在・malformed YAMLをsilent skipせずparse violationにする。CRLFは同じ有効構造として受理する |
| U-BRANCH-SUPER-001 | `isSupersessionMetadataOnly` / branch-kind guard | base/current差分がnon-empty string-array `superseded_by`だけならRecovery migrationとして許可する。他field変更との混載は拒否する |
| U-L3APP-014 | `isNonSemanticL3MetadataMigrationLine` | `superseded_by`／`supersession_metadata_only`だけを非意味変更metadataとして許可し、status・title・本文変更はL3再承認対象として保持する |

## Mutation境界

- evidence presenceを全文正規表現へ戻すとU-REVIEW-001がredになる。
- supersedesをblock-list専用line parserへ戻すとU-SUPER-001がredになる。
- back-referenceを全文文字列検索へ戻すとU-SUPER-003がredになる。
- Recovery branchで既存PLAN kindを無条件許可するとU-BRANCH-SUPER-001がredになる。
