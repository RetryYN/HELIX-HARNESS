# PR #1797 GitHub投影packet

status: active_draft_projection
pr: https://github.com/RetryYN/HELIX-HARNESS/pull/1797
pr_class: repository_foundation
head_branch: `docs/l2-requirements-source-audit`
base_branch: `main`

## 目的

PR #1797を、新世代repository基盤の差分共有とGitHub Claude意味reviewに限定する。PR本文、comment、review、checkはローカル上流のprojectionであり、要求、承認、完了の正本ではない。

このpacketにPR本文やreview依頼文の複製を固定しない。AIは作業開始時に[新世代入口](new-generation-start-here.md)、[GitHub上流運用モデル](github-upstream-operating-model.md)、[repository foundation readiness](repository-foundation-readiness.md)を読み、GitHubから現在のPR本文、HEAD、commentをread-afterする。過去commentのHEADは失効したreview対象として扱う。

## ローカル正本

| 判断対象 | ローカル正本 |
|---|---|
| HELIX-HARNESS／HELIX-OS／HELIX-Web／HELIX-Web-OSの責務 | [製品責務境界](../concept/product-boundary.md) |
| 新世代のauthority、PR class、Issue／ticket境界 | [GitHub上流運用モデル](github-upstream-operating-model.md) |
| archive隔離と現行実行面 | [archive-first隔離記録](archive-first-transition-record-2026-09-14.md) |
| 旧要求の保持と再配置状態 | [carry-forward管理状況](requirement-carry-forward-status.md) |
| マージ条件と現在の証拠 | [repository foundation readiness](repository-foundation-readiness.md) |

## GitHubへ投影する内容

- titleは日本語で目的が分かる形にする。機械識別子と一般的な開発用語は原語を維持できる。
- PR classは`repository_foundation`とする。
- PR本文は、repository整理、旧要求の無損失保持、責務分離、現在成立した静的証拠、未成立条件をローカル正本から要約する。
- final HEADを取得してから、そのfull SHAだけを対象にGitHub Claudeへread-only意味reviewを依頼する。
- review依頼は送信する完全な本文からpayload digestを計算し、構造化されたcomment本文として投稿する。投稿後にcomment ID、
  remote本文、target full SHA、payload digestをread-afterし、`@claude`本文の代わりにlocal file pathや`@file`文字列だけが
  投稿された場合は未配送として扱う。
- HEAD更新後は以前のreview依頼を失効とし、新しいfull SHAで依頼する。
- review結果は依頼targetと同じexact HEADを本文で示す応答だけをfindingとしてreadinessへ反映し、要求採否、人間承認、
  Ready化、mergeを自動生成しない。依頼commentの存在、mention、reaction、workflow開始だけではreview完了にしない。

## Claudeへ確認させる意味

1. HARNESSが外部提供する開発・検証contractを持ち、HELIX-OSが管理、統制、推進、Worker、ログ、学習、CI、HARNESS自身の継続改善を担うこと。
2. HELIX-WebとHELIX-Web-OSのruntime authorityを分離し、許可logによる改善loopだけでHELIX-OSへ接続すること。
3. 旧資産を非実行archiveとして保持し、新世代のbaseline、oracle、fallbackにしないこと。
4. 旧要求を削減せず、原要求identity、原文、digest、元authority状態を保持して再配置すること。
5. Concept／Vision／企画→premise／research／PoC／prototype→人間decision→要求→設計・検証→実装の順序と、上流backflowが閉じていること。
6. local ticketからGitHub Issueへ一方向投影し、GitHub状態から要求意味、採否、承認、完了を生成しないこと。

所見はBlocker、Major、Minorに分け、file、該当箇所、矛盾する上流方針、必要な修正を日本語で示すよう依頼する。承認、merge、CLI／API／IDE／HARNESS Workerへのfallbackは依頼しない。

## 外部操作記録

- [旧open PR整理](audits/source-rebaseline/github-pr-cleanup-2026-09-14.md)
- [旧Issue退役](audits/source-rebaseline/github-issue-retirement-2026-09-15.md)
- [旧Project退役](audits/source-rebaseline/github-project-retirement-2026-09-15.md)
- [Feature Ticket Issue投影](audits/source-rebaseline/github-feature-ticket-projection-2026-09-15.md)
- [CodeQL default setup変更・復元](github-codeql-default-setup-backup-2026-09-15.json)

これらの外部状態は操作とread-afterの証拠であり、上流意味の正本ではない。既存CodeQL、旧`harness-check`、旧test、旧runtimeの結果をPR #1797の合格根拠にしない。

## 現在の停止条件

[repository foundation readiness](repository-foundation-readiness.md)で未成立の条件が一つでもある間はDraftを維持する。個別要求の採否・意味変更、L3以降、新世代CI／runtime、archive資産の意味移管・物理削除へ進まない。
