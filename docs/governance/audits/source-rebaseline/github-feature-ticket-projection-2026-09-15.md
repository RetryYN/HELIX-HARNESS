# 新世代Feature Ticket GitHub Issue投影記録

status: projection_created
repository: `RetryYN/HELIX-HARNESS`
operation_date: 2026-09-15 JST
authority_effect: projection_only

## 目的

repo-owned Feature Ticketを作業共有用のGitHub Issueへ投影した外部操作を記録する。Issueの存在、本文、label、
open／close状態から要求、上流承認、実装許可、完了を生成しない。

## 許可と操作主体

| 項目 | 記録 |
|---|---|
| 実施runtime | Codex hosted chat runtimeからGitHub CLIを使用 |
| GitHub account | `RetryYN` |
| authorization actor | PO `RetryYN` |
| authorization basis | 本sessionでIssue作成前に示された「いまこれがチケット発行の役割をしていると思え。そしてイシューに登録される。」 |
| source authority | `docs/governance/feature-tickets/`の各Feature Ticket。GitHubはprojection |
| execution effect | Issue作成・本文更新・label更新のみ。要求採用、設計、実装、Worker、CI、mergeは未開始 |

## 投影結果

| local ticket | Issue | created_at UTC | initial source commit | read-after |
|---|---:|---|---|---|
| FT-OS-REQREG-001 | [#1798](https://github.com/RetryYN/HELIX-HARNESS/issues/1798) | 2026-09-15T16:52:06Z | `0e17dadf0bad6f8f3d1c594fab1dc4bef284a9f0` | OPEN |
| FT-HARNESS-REQENG-001 | [#1799](https://github.com/RetryYN/HELIX-HARNESS/issues/1799) | 2026-09-15T16:52:19Z | `0e17dadf0bad6f8f3d1c594fab1dc4bef284a9f0` | OPEN |
| FT-OS-REQCLASS-001 | [#1800](https://github.com/RetryYN/HELIX-HARNESS/issues/1800) | 2026-09-15T16:52:31Z | `0e17dadf0bad6f8f3d1c594fab1dc4bef284a9f0` | OPEN |
| FT-HARNESS-SEMEXTRACT-001 | [#1801](https://github.com/RetryYN/HELIX-HARNESS/issues/1801) | 2026-09-15T17:07:42Z | `0e17dadf0bad6f8f3d1c594fab1dc4bef284a9f0` | OPEN |
| FT-HARNESS-DESIGNTPL-001 | [#1802](https://github.com/RetryYN/HELIX-HARNESS/issues/1802) | 2026-09-15T17:07:54Z | `0e17dadf0bad6f8f3d1c594fab1dc4bef284a9f0` | OPEN |
| FT-OS-DESIGNTPL-001 | [#1803](https://github.com/RetryYN/HELIX-HARNESS/issues/1803) | 2026-09-15T17:08:05Z | `0e17dadf0bad6f8f3d1c594fab1dc4bef284a9f0` | OPEN |
| FT-HARNESS-TICKETCONTRACT-001 | [#1804](https://github.com/RetryYN/HELIX-HARNESS/issues/1804) | 2026-09-15T17:08:18Z | `0e17dadf0bad6f8f3d1c594fab1dc4bef284a9f0` | OPEN |
| FT-OS-TICKETISSUER-001 | [#1805](https://github.com/RetryYN/HELIX-HARNESS/issues/1805) | 2026-09-15T17:08:30Z | `0e17dadf0bad6f8f3d1c594fab1dc4bef284a9f0` | OPEN |

8件すべてに`state:proposed-upstream-waiting`を付けた。初回作成時の旧`state:backlog`は削除し、新labelを作成して
2026-09-15T17:12:00Z〜17:12:12Zにread-afterした。本文はlocal ticket ID、親要求、状態、依存、projection-only、
停止条件、source commit markerを持つ。GitHub Project itemは作成していない。

## 可逆性と残る作用

Issueは`closed / not_planned`へ変更でき、labelも削除できる。ただしIssue番号、timeline、更新履歴、通知は消去できない。
rollbackは新しい人間指示なしに行わない。local ticketの上流revisionが変わった場合は、Issueから意味を戻さず、local側を
先に改訂してから投影本文とsource commitを更新する。
