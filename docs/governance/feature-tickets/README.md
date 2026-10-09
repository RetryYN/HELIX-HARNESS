# 新世代Feature Ticket

このdirectoryは、上流から設計・実装へ降ろす作業のFeature Ticketを置く。2026-10-09の[開発repositoryのチケット方針](../decisions/dev-repo-ticket-policy-po-decision-2026-10-09.md)により、ticketは次のとおり扱う。

- ticketは作業種別と作業内容だけを持つ作業指示であり、要求・設計の正本ではない。正本は設計書と判断記録に置き、ticketを破棄しても設計書から作業を再構成できる状態を保つ。
- ticketは書き換えない。作業内容を変えるときは新しいticketを発行する。状態、PR番号、Issue番号、merge結果をticketへ書き戻さない。
- ticketに依存関係を持たせず、ticketの依存や状態をCI・review・merge・作業開始の条件にしない。実装へ進めるかは、対象の上流のauthority状態で判断する。
- GitHub IssueはticketのGitHub上の写しであり、remote状態から要求、承認、完了を逆生成しない。

GitHubへ送ったexact source commit、file SHA-256、remote revision、read-afterは、ticketの外のappend-onlyのprojection receiptへ記録する。ticket本文へ、その本文を含むGit commit SHAを埋め込まない。これにより、ticketの内包SHAが必ずstaleになる自己参照を避ける。

下表の11件は方針の前に発行したticketである。書き換えず、各ticketの状態・依存の記載と表の「発行時の状態」は、発行時の記録として残す。これらの記載を、作業開始やmergeの条件として使わない。

| 順序 | Ticket | 対象 | 発行時の状態 | GitHub projection |
|---:|---|---|---|---|
| 1 | [FT-OS-REQREG-001](FT-OS-REQREG-001.md) | HELIX-OS 要求候補自動登録 | proposed_upstream_waiting | [#1798](https://github.com/RetryYN/HELIX-HARNESS/issues/1798) |
| 2 | [FT-HARNESS-SEMEXTRACT-001](FT-HARNESS-SEMEXTRACT-001.md) | 旧実装semantic atomのPython core抽出 | proposed_upstream_waiting | [#1801](https://github.com/RetryYN/HELIX-HARNESS/issues/1801) |
| 3 | [FT-HARNESS-REQENG-001](FT-HARNESS-REQENG-001.md) | HARNESS 要求エンジンPython core | proposed_upstream_waiting | [#1799](https://github.com/RetryYN/HELIX-HARNESS/issues/1799) |
| 4 | [FT-OS-REQCLASS-001](FT-OS-REQCLASS-001.md) | HELIX-OS 要求分類projection | proposed_upstream_waiting | [#1800](https://github.com/RetryYN/HELIX-HARNESS/issues/1800) |
| 5 | [FT-HARNESS-DESIGNTPL-001](FT-HARNESS-DESIGNTPL-001.md) | HARNESS Design Template semantic coreとseed | proposed_upstream_waiting | [#1802](https://github.com/RetryYN/HELIX-HARNESS/issues/1802) |
| 6 | [FT-OS-DESIGNTPL-001](FT-OS-DESIGNTPL-001.md) | HELIX-OS Design Template lifecycle管理 | proposed_upstream_waiting | [#1803](https://github.com/RetryYN/HELIX-HARNESS/issues/1803) |
| 7 | [FT-HARNESS-TICKETCONTRACT-001](FT-HARNESS-TICKETCONTRACT-001.md) | HARNESS PoC／UI prototype／Feature ticket contract | proposed_upstream_waiting | [#1804](https://github.com/RetryYN/HELIX-HARNESS/issues/1804) |
| 8 | [FT-OS-TICKETISSUER-001](FT-OS-TICKETISSUER-001.md) | HELIX-OS推進によるtyped ticket／workflow生成・Issue projection | proposed_upstream_waiting | [#1805](https://github.com/RetryYN/HELIX-HARNESS/issues/1805) |
| 9 | [FT-OS-GITHUBSYNC-001](FT-OS-GITHUBSYNC-001.md) | HELIX-OS GitHub一方向projection・read-after同期adapter | proposed_upstream_waiting | [#1812](https://github.com/RetryYN/HELIX-HARNESS/issues/1812) |
| 10 | [FT-OS-REQGUARD-001](FT-OS-REQGUARD-001.md) | HELIX-OS 要求登録bot・監査crawler・admission CI | proposed_upstream_waiting | [#1837](https://github.com/RetryYN/HELIX-HARNESS/issues/1837) |
| 11 | [FT-OS-REVIEWHANDOFF-001](FT-OS-REVIEWHANDOFF-001.md) | 共通ルール参照とVS Code GUIレーン間通知 | proposed_upstream_waiting（仮組みは別identity SCF-B-0003） | [#1884](https://github.com/RetryYN/HELIX-HARNESS/issues/1884)、親 #1864。[投影receipt](../audits/source-rebaseline/github-review-handoff-projection-2026-09-20.md) |

開発repository専用CIの[FT-OS-LOCALCI-001](FT-OS-LOCALCI-001.md)も発行時の本文を保持する。現在の作業内容・順序・前提の正本は[Stage 1実装・CI解禁判断](../decisions/stage1-implementation-and-ci-unlock-po-decision-2026-10-09.md)とlocal CI設計であり、同ticketの発行時の状態や依存をgateにしない。

[FT-OS-LOCALCI-002](FT-OS-LOCALCI-002.md)は、現行local CI設計に従う実装と検証の作業指示である。

[FT-GOV-L3STATUS-001](FT-GOV-L3STATUS-001.md)は、L3／L10／L11正本に残る起草時の状態表示を現行のauthority状態へ揃える作業指示である。
