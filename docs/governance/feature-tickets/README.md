# 新世代Feature Ticket

このdirectoryは、上流から設計・実装へ降ろす機能単位のrepo-owned作業契約を保持する。人間の明示指示により
上流承認前に具体化するticketは`proposed_upstream_waiting`とし、exactな親sourceと未承認条件を保持する。
Feature Ticketは要求正本ではなく、親Concept／L1／L2、対受入、依存、許可、停止条件を参照する実行候補である。
GitHub Issue／Projectへ同期する場合も本ticketへのprojectionとし、remote状態から要求、承認、完了を逆生成しない。
`proposed_upstream_waiting`は設計・実装・Worker・CI・mergeを開始できず、親上流の承認と再導出後にだけreadyへ遷移できる。

Feature Ticket本文へ、その本文を含むGit commit SHAをprojection revisionとして埋め込まない。GitHubへ送ったexact source
commit、file SHA-256、remote revision、read-afterはappend-onlyのprojection receiptへ記録し、ticket frontmatterは
`projection_receipt_ref`だけを持つ。これによりticket更新で内包SHAが必ずstaleになる自己参照を避ける。

現在は要求整理中のため、全ticketを`proposed_upstream_waiting`とする。文書具体化以外の実装、runtime、DB、CIを起動しない。

| 順序 | Ticket | 対象 | 状態 | GitHub projection |
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
| 11 | [FT-OS-REVIEWHANDOFF-001](FT-OS-REVIEWHANDOFF-001.md) | 共通ルール参照とClaude／Codex review引継ぎ | proposed_upstream_waiting（仮組みは別identity SCF-B-0003） | 親 [#1864](https://github.com/RetryYN/HELIX-HARNESS/issues/1864)。子Issueは投影receiptへ記録 |
