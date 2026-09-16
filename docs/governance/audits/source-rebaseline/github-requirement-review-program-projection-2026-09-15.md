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

## RDP-001のsource holding追加後の再投影

archive隔離前revision差分333 pathを九つ目の生存中`source_holding`へ追加したため、RDP-001の入力母集団記述を
Issue #1813へ再投影した。local source commitは`408fe7830aad3606d097ee4cadb626e826f632e6`、source file SHA-256は
`c163e6e9115e03ac3391a84ac89fb2280aba082c285e026b96d0723a98ae5ece`、remote body SHA-256は
`19388bcb9fee1d8c78a67d4928ec855e14798880016fbc5a664d6defcd739495`である。2026-09-15T16:04:34Zの
read-afterでOPEN、`state:proposed-upstream-waiting`、exact source revision、九集合の本文を確認した。

この再投影は基準revisionと隔離revisionの意味同値、要求追加、採否、successor、実装開始を生成しない。

## file-blob holding追加後の#1813再投影

receipt_id: `RDPPROJ-1813-20260916-002`

旧v1.3が委ねる未行分解18文書とScrum Reverse対受入1文書を十番目の生存中`source_holding`へ追加し、
RDP-001の母集団と処理境界をIssue #1813へ再投影した。file blob／path holdingは要求判断の分母にせず、
対象文書を扱う後続要求整理PRで無損失atom化と別holdingへの仮登録を先行させる。

| 項目 | read-after値 |
|---|---|
| local source commit | `cb31f86e8b23bb2215a04503df0b3417d395a4a3` |
| local file SHA-256 | `9121ccd9b10668fc5427af4bb0025e023c63531a2d32d1b28277fe238ff27b85` |
| remote revision | `updatedAt:2026-09-15T16:20:42Z+body_sha256:150afc70e29883c23ad129300a0b165f2662db8056e254ef3b75334cb7db3718` |
| state／label | `OPEN`／`state:proposed-upstream-waiting` |
| authority effect | `none` |

Issue本文は要約であることとlocal正本の参照行区間を明示し、自動登録入口の実装完了を要求reviewの前提から外した。
`remote body SHA-256`はGitHub APIが返す本文文字列を、末尾改行を追加せずUTF-8 bytesへ変換して計算した。

## 4 key限定の委任文書relation closure補正履歴

receipt_id: `RDPPROJ-1813-20260916-003`

旧v1.3の直接委任だけでなく、委任先がfrontmatterで宣言する`pair_artifact`、`related_l3`、`related_l12`、
`parent_design`を再帰的に辿った。当時はclosure 40文書、既存Scrum Reverse行台帳3文書、file-blob holding 37文書と
記録したが、後続`RDPPROJ-1813-20260916-004`でrelation key不足を訂正した。本節の件数をcurrent分母に使わない。

| 項目 | read-after値 |
|---|---|
| correction source commit | `68f8b40b95d62415e52bab88e94e5bd5e75b26bd` |
| correction source file SHA-256 | `5ef003a8dbb1db87545f271e5f621fc034334dfd506adf4916be8c1c0b33c6ef` |
| previous remote revision | `updatedAt:2026-09-15T16:20:42Z+body_sha256:150afc70e29883c23ad129300a0b165f2662db8056e254ef3b75334cb7db3718` |
| corrected remote revision | `updatedAt:2026-09-15T17:34:10Z+body_sha256:e4182e824d96a246061ccc89a3fd4600633c186d22de4965bf31685d75f44fe5` |
| state／label | `OPEN`／`state:proposed-upstream-waiting` |
| authority effect | `none` |

この補正は要求の追加、採否、統合、配置、successor、実装開始を生成しない。file blobは要求atomとして数えず、
対象文書とrelation closureを無損失atom化して別holdingへ仮登録するまで、個別要求の要否判断を開始しない。

## 意味relation全key・本文参照holding追加後の#1813再投影

receipt_id: `RDPPROJ-1813-20260916-004`

旧補正は`pair_artifact`、`related_l3`、`related_l12`、`parent_design`の4 keyに限られ、
`pair_group.members`、`tailoring_profile`、`definition_ledger`、`legacy_source`等から到達する文書を保持していなかった。
意味を持つfrontmatter relationを再帰的に辿り直し、closure 117文書、265 edgeで収束した。114 file blobと既存
Scrum Reverse行台帳3文書へ全件を保持し、同じ117文書のfrontmatter・本文参照788件も別holdingへ仮登録した。

| 項目 | read-after値 |
|---|---|
| correction source commit | `8ce1be6a6695140f0bcd3247b65fd6d3a3e19049` |
| correction source file SHA-256 | `8e8a4ad8f8cb2f67bba34906f1b943946665fbdd69d3b35ddd2add180f51fab9` |
| previous remote revision | `updatedAt:2026-09-15T17:34:10Z+body_sha256:e4182e824d96a246061ccc89a3fd4600633c186d22de4965bf31685d75f44fe5` |
| corrected remote revision | `updatedAt:2026-09-15T18:16:53Z+body_sha256:44db8f3edded3f2d89bcdff9323c8779ed12830ec617500dfdb51eca0a92da2c` |
| state／label | `OPEN`／`state:proposed-upstream-waiting` |
| authority effect | `none` |

参照先241文書のうち意味closure外124文書は、要求ではないと決定せず分類待ちとして残す。
`coding-rules.md`、L3 functional文書、PLAN、process、migration、skill等の参照元行と対象blob digestを保持し、
利用・縮退・retireする後続要求PRでatom化と別仮登録を要求する。この補正も要求追加、採否、配置、successor、
実装開始を生成しない。

3件のIssue本文はlocal program ID、source path、exact source commit、file SHA-256、状態、`authority_effect: none`を持つ。
RDP-001は全要求の要否・再配置を親作業として追跡し、RDP-002は責務・機能重複、RDP-003は技術代替可能性を
別判断面として扱う。HELIX-DBはRDP-003の一論点であり、専用実装の要否と永続・排他・再開等の意味機能を分ける。

## 残る境界

Concept v4.1と対象別L1は未承認であり、個別要求の判断、successor、L3、実装、DB、CI、物理削除は未開始である。
親・子Issueのcloseやcheckboxから、個別要求の処理完了を生成しない。
