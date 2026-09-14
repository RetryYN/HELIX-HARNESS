# 新世代Feature Ticket

このdirectoryは、承認済み上流から設計・実装へ降ろす機能単位のrepo-owned作業契約を保持する。
Feature Ticketは要求正本ではなく、親Concept／L1／L2、対受入、依存、許可、停止条件を参照する実行候補である。
GitHub Issue／Projectへ同期する場合も本ticketへのprojectionとし、remote状態から要求、承認、完了を逆生成しない。

現在は要求整理中のため、全ticketを`proposed_upstream_waiting`とする。文書具体化以外の実装、runtime、DB、CIを起動しない。

| 順序 | Ticket | 対象 | 状態 |
|---:|---|---|---|
| 1 | [FT-OS-REQREG-001](FT-OS-REQREG-001.md) | HELIX-OS 要求候補自動登録 | proposed_upstream_waiting |
| 2 | [FT-HARNESS-REQENG-001](FT-HARNESS-REQENG-001.md) | HARNESS 要求エンジンPython core | proposed_upstream_waiting |
| 3 | [FT-OS-REQCLASS-001](FT-OS-REQCLASS-001.md) | HELIX-OS 要求分類projection | proposed_upstream_waiting |
