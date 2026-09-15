# 要求要否・重複・技術代替review programのGitHub投影記録

status: projection_created_read_after
repository: `RetryYN/HELIX-HARNESS`
authority_effect: projection_only
source_commit: `f7b3ddff0939f23a897e551b45d721a6858e52a5`

## 目的

repo-owned review programをGitHubの共有・進行用Issueへ投影した記録を保持する。Issueは要求正本、人間decision、
successor割当、要求削除、統合、技術採用、実装開始、完了を生成しない。

## 許可

POの2026-09-16指示「要求の要不要整理イシュー」「責務が被ったり機能が被ったりするもの整理してイシュー化」
「技術的代替可能も判断する」に基づき、Codex hosted chat runtimeからGitHub Issueを3件作成した。操作はIssue作成、
親子参照の本文更新、既存`state:proposed-upstream-waiting` label付与、read-afterに限定した。

## 投影とread-after

| Program | local source | source SHA-256 | Issue | remote body SHA-256 | updatedAt UTC | read-after |
|---|---|---|---:|---|---|---|
| RDP-001 | `docs/governance/requirement-disposition-review-program.md` | `c7a4d9ccdcf713394d3200b27c5d0cbba37cb77f2c639be63646bd535260fc41` | [#1813](https://github.com/RetryYN/HELIX-HARNESS/issues/1813) | `c2f2049d0a071da3e76ee705e9b902e1527d35c62ef6b1dbd87a64bc80ebce57` | `2026-09-15T15:30:34Z` | OPEN、label一致、RDP-002／003参照あり |
| RDP-002 | `docs/governance/requirement-overlap-review-program.md` | `5383815b0a1d7f2c52550df5595c7d4d0959e766d56bc7efd1160b81f55b95af` | [#1814](https://github.com/RetryYN/HELIX-HARNESS/issues/1814) | `0dd4356933398137d9ef5abf8e8e2b6feb95b1266d2da0ccb591ddf71512e227` | `2026-09-15T15:30:19Z` | OPEN、label一致、parent #1813一致 |
| RDP-003 | `docs/governance/requirement-technical-substitutability-review-program.md` | `f0b9a2ca5031c388cd85ab8176167b2d60b23e1e4a7fc054e550ac7194ee2b70` | [#1815](https://github.com/RetryYN/HELIX-HARNESS/issues/1815) | `c8c9edfd526284e5fe47ec41b23016ec55e3860b65c86925e3db5737bf4bb539` | `2026-09-15T15:30:21Z` | OPEN、label一致、parent #1813一致 |

3件のIssue本文はlocal program ID、source path、exact source commit、file SHA-256、状態、`authority_effect: none`を持つ。
RDP-001は全要求の要否・再配置を親作業として追跡し、RDP-002は責務・機能重複、RDP-003は技術代替可能性を
別判断面として扱う。HELIX-DBはRDP-003の一論点であり、専用実装の要否と永続・排他・再開等の意味機能を分ける。

## 残る境界

Concept v4.1と対象別L1は未承認であり、個別要求の判断、successor、L3、実装、DB、CI、物理削除は未開始である。
親・子Issueのcloseやcheckboxから、個別要求の処理完了を生成しない。
