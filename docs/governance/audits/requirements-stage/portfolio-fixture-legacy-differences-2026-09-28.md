# 旧設計契約portfolioとtemplate例被覆の原文照合

照合base `00d04085f75752f3f86b9fe0d8656a99066cd929`。既存HARNESS-L2-025/026と対L11の未採択候補を修正する。L1-009/005/001/004/007の設計・対検証責務に限定し、014の所有、旧runtime/schema、採択・実装権限を変更しない。

## 旧原文と所在

資産 `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`、file `sha256:db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。

- HIL-FR-54 `:144`、line `sha256:502ef00823463c0fd4218c7b554e4b6959fc28aa9006d6d6eb79f555b86b4f67`：| **HIL-FR-54** | Contract Portfolio Plannerはrequirement atomとDesign Obligation Graphを、authority、lifecycle、interface/data/state/event/failure/security/observability/operation、V-pair oracleの同値classへ分ける。各classにnormative contractを原則1件割り当て、既存契約の再利用、delta追加、新規作成、根拠付きN/Aを判定し、未被覆0かつ意味重複0となる最小portfolioを提案する。 | obligation-to-contract matrix、portfolio manifest、reuse/delta/new/N/A receipt、uncovered/duplicate finding |
- HIL-FR-55 `:145`、line `sha256:78a2e6c819e73153ce2bbd832c0f87777dba08750fa1b84fcafc916fa7cafa30`：| **HIL-FR-55** | Template Example Calibratorはactive templateの各validation ruleとapplicability branchに対し、最低限canonical positive 1件と境界negative 1件を要求する。状態遷移、failure、security、migration、multi-runtime差異はrisk分析で未被覆の場合だけ例を追加し、例の個数ではなくrule/branch/risk coverageで十分性を判定する。 | example adequacy matrix、positive/negative fixture、risk追加理由、redundancy finding |

## 保持・変更・戻し先

現025は端から端のinvariantと対oracle、現026は単体設計義務のtraceを持つ。原文FR54のclass別normative contract原則一件・reuse/delta/new/N/A・未被覆0・意味重複0は一般整合だけで充足とせず025へ追補した。FR55のactive ruleとapplicability branchごとにcanonical positive最低1件とboundary negative最低1件という数値条件を026へ保持した。risk未被覆時のみ追加、例総数ではなく被覆を見る点も保持する。

旧portfolio matrixとfixture schema/runnerを要求に固定しない。義務意味はHARNESS-L2-008、templateは009、設計unitは026、構成体は025、検証oracleは022へ戻す。旧原文2行はIRの同一identityと重複するため、独立要求数へ足し込まない。過去の空集合receipt/registerは書き換えず、本追補で原文をholdingし訂正revisionと限定receiptを追加した。候補の独立review、登録、文書SHAはPOの採択・受入実行ではない。
