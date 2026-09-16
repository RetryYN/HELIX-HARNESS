# 旧資産完全一致再利用 GitHub Claudeレビュー

review_route: GitHub PR comment
pr: `#1797`
reviewed_head: `5dd1f685c2acda99caf0bcc07069368b60ce2629`
review_comment: `https://github.com/RetryYN/HELIX-HARNESS/pull/1797#issuecomment-5666319345`
review_scope: upstream semantics only
legacy_ci_run: false
authority_effect: finding_only

## 所見と処置

| ID | severity | 所見 | 処置 |
|---|---|---|---|
| B3 | blocker | `LICENSE`の同一digest観測をarchiveからのcopy実績として記録 | copy実績を撤回し、隔離対象外の現行fileとarchive内の写しが同内容という観測へ変更 |
| B4 | blocker | historical archive READMEのcopy禁止と新世代統制の優先関係が不明 | 現行root READMEで新世代統制を優先し、承認済み非実行資産だけを例外化。archive snapshotは改変しない |
| B5 | blocker | 旧CI、runtime、prompt等が追加条件付きで完全一致copy可能に見える | 旧CI／workflow、runtime／CLI、hook、adapter、AI instruction／prompt、実行設定を完全一致再利用の対象外classへ固定 |
| M5 | major | 旧8値と新7値のdisposition語彙が二重 | Concept・policyを新7値へ統一し、旧語彙からの対応を記録 |
| M6 | major | 個別親要求なしの類型へ`semantic_rederive`を付与 | 個別行のないmanifest 4020件をすべて`unresolved`へ固定 |
| M7 | major | CodeQL一時停止の許可scope・期限・復旧条件が不足 | 後続reviewで会話からの許可推定とrepository-wide実作用の不一致を確認したため、許可記録を無効化し変更前相当へ復元 |
| M8 | major | 完全一致再利用のL11 bulletに親L2 IDがない | HARNESS-L2-004／005／006、HELIXOS-L2-002／006／007を明記 |
| m4 | minor | archive隔離記録の「文書」とfile数が混在 | 68／74とも「ファイル」へ統一 |
| m5 | minor | 未合意台帳が`active_inventory` | `draft_inventory`へ変更 |

本記録はfindingと修正対応であり、修正後HEADのpass、人間承認、canonical化、copy許可、mergeを生成しない。
