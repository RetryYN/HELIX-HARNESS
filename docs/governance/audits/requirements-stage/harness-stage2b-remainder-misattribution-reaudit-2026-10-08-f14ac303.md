# HARNESS Stage 2b残5親の帰属再照合・現行本文インベントリ

- 記録種別: 調査スナップショット。権限効果なし。
- 基準: `origin/main` `f14ac303d265b6d23ecb1847b5dfd52901a442c6`。専用worktree `/home/tenni/.helix-worktrees/harness-stage2b-misattribution-inventory`、branch `codex/harness-stage2b-misattribution-inventory`。
- 範囲: Stage 2b残5親 `017/018/019/020/024` の既存判断帰属、現行6本文、固定L2/L11、旧source照合。
- 本記録作成時点で本文・既存判断記録・既存監査は変更していない。旧workflow/runtime/test/CIは実行していない。

## 帰属の訂正を示す原資料

PR #2613の実際のOpus所見は comment [6039142042](https://github.com/RetryYN/HELIX-HARNESS/pull/2613#issuecomment-6039142042) である。2026-10-07 13:37Z、raw body 2225 UTF-8 bytes、SHA-256 `9d20653bebacb5890ef3fdcb63aaaf14f662c239b0ac1b79e6772582a1dd150a`。このOpusは旧本文revision `3aa88a697dbc8e726bdf23c27c8bb364867bb173` / HEAD `9981f376c50691c80f7cdeb1893588748aa4714d` を対象に固定sourceと6本文を独立読了し、Major 0・未確認0とした。

comment [6003038860](https://github.com/RetryYN/HELIX-HARNESS/pull/2613#issuecomment-6003038860) はFable 5.1によるもので、本文に「承認してよい」とある。raw body 3166 bytes、SHA-256 `67e59bfb59f0bc561b7825c38eae54123928c89faa6595bef9f1536ca99de7d6`。従来の判断記録はこのFable commentをOpusの所見として引用していた。実際のOpus commentは6039142042である。過去のdecision/auditはappend-onlyのまま保持し、本記録は帰属差を記録するだけで、旧判断を修正・再生成しない。

## 旧承認本文と現在の本文

旧判断記録は対象を `3aa88a697dbc8e726bdf23c27c8bb364867bb173`、HEAD `9981f376c50691c80f7cdeb1893588748aa4714d`、固定scope `017/018/019/020/024` とし、Opus・Fable一致の委任条件を記録する。旧判断記録の本文SHAと現行main `f14ac303d265b6d23ecb1847b5dfd52901a442c6` のSHAを比較すると、**6本文すべて全文SHAが異なる**。よって旧承認は現行6本文へ継承できない。

一方、各文書のStage 2b節は内容行が一致する。比較した対象sectionの全byte SHAはJSONに記録した。現行節だけ末尾にLFが1 byte多く、raw spanはbyte同一ではない。terminal LF 1 byteを除いた内容bytesが旧節と同一であることを6文書で確認した。全文一致とstage span不変を混同しない。

| 文書 | 旧全文 SHA-256 | 現行全文 SHA-256 | 旧節 SHA-256 | 現行節 SHA-256 | 節本文 |
|---|---|---|---|---|---|
| `docs/helix-harness/L3-requirements/business-requirements.md` | `a1c0ed86d63a523ebad07105ceb6dbbca602bb1bd3c6a76af5c8a9e10fbab4b2` | `781e337ff60f8765467b216edefdeca14416c2b8c1fd3889b8afa5d6f4d7cb33` | `b6ea82680f800ce2b0569bb4987cb79283005fc0d93ec72a9a47f40e9c34dca2` | `3608967db129b66b2670bdf64d1f18be7cb3915ab6abda34e6084492ebdf6031` | 内容同一、現行末尾LF+1 byte |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `9734e536774f62ba6d53a8804ca16649e00dda307ae60114431f61ad21daa3b4` | `e3b18c538d2903e7adfd3d800bc82f6eb7190a6de870e72ac2e4913b733de885` | `3306d3242ac47c2d70b65b39f1c011aaf95c8073aa9d30ea5b76e5a8def99eba` | `8e9fb46121c60dc8b6690ce6dd5c30d7973410cbd6c150f436137b90f963c23b` | 内容同一、現行末尾LF+1 byte |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `ab37418cb9d3004d6ba0467b4c82bfe4d75f90eb8f4c136902f691e8e3c876b6` | `ed08243e009b629aba5167786bf47d946f27e2e1ff8526d61480d826cd3a8317` | `ff64bb5f2e245ecfbfffb73453146aef79617b9a8fc869e50e4d30a7d0804256` | `d3e4d261ca743397107632661d930ee570a649435fc52041ec1dde8158ff0143` | 内容同一、現行末尾LF+1 byte |
| `docs/helix-harness/L10-verification/business-verification.md` | `788c690368c3be1721410f65d5970dad1731b8e79a0a5b7b80c26e3475698309` | `84f68583915cc9c206d44d08e188508f73b0b9ea69ae73b82b61ceec8196f1a4` | `8d218e2ea02794e328c446516828e95a06f78adeeee96fe1ec7edcba34e96eb7` | `bad59c1d18626e27de2dd4990e8f16f56b955832670adfc8739b7a3b3b19c938` | 内容同一、現行末尾LF+1 byte |
| `docs/helix-harness/L10-verification/functional-verification.md` | `0a7fb5d4cc88d6fec1576260d5b3bd2adf71d0ed6939b1168cf4ee621dd538dc` | `0cb0d7a9fc0fc23d38c809dd47cca770f860c47905cd60e7d7f59222d3a07f9c` | `ee358f64a85ce39d694c800c256777b01907e5873260b02a9d1d7c28281eee61` | `dea6989e31e19a0b7125721937505e52f42b67808600a2f3d99a422795689485` | 内容同一、現行末尾LF+1 byte |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `245f1c655276338ac163ba35ded36e8453769197638412a305a2b0aec658fd82` | `def2277503ef06c49fef4868dce7eab2322f761c9ff31e630b217f133325a53e` | `84353058bbde34ff232f810b9b7a2248c5dc057d62faea12148651dcf6fb4fa2` | `c4b0e3ed5e67fd9316e1260f5d4e943491497c37c684758c255a5c9b279ed8ff` | 内容同一、現行末尾LF+1 byte |

## 固定親と旧source

PO roster（`docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md` lines 46–49, 53）とStage2b decisionの5親は一致する。固定L2はrevision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の `product-requirements.md`、固定L11も同revisionの`product-acceptance.md`。L2/L11のlocatorと全ファイルSHAはJSONの`fixed_sources`に固定した。L3の旧source disposition表（functional-requirements.md lines 449–453）とそこで挙げる各旧source全文・semantic span SHAを照合した。

| 親 | L3 FR/AC | 旧source起点と扱い |
|---|---|---|
| 017 | FR-017 / AC-017-01..03 | release bundle composition FRとacceptance。再現性・rollback観測を再導出し、旧Module/Bundle schema、固定set、SemVer/channel、DevOS gate等を置換。 |
| 018 | FR-018 / AC-018-01..03 | product lifecycle operations FRとacceptance。lifecycle/state分離と観測欠落を再導出し、旧schema/permission/固定基準を置換。 |
| 019 | FR-019 / AC-019-01..03 | universal improvement loop FR/acceptance と Reverse workflow。partial input/unknown/result traceを再導出し、旧state machine/DB/runtime/R0-R4 route等を置換。 |
| 020 | FR-020 / AC-020-01..03 | 017のRLS-R-13と旧L5 integrationは近接類例に限る。L2-020からhandoff意味を再導出し、旧bundle/version graphを置換。 |
| 024 | FR-024 / AC-024-01..06 | requirement discovery FR/acceptance、screen applicability prototype test。質問優先・矛盾/重複・収束を再導出。旧直近2 iteration最低数やJSON/schema/runtime/gateを置換し、prototype testは条件付き観測に限定。 |

旧sourceの正確なpath・line・asset・全ファイルSHA・該当span SHAはJSONの`old_source_reuse_rederive_replace`に記録した。固定sourceの本文から逸脱する親やStageは追加していない。

## 次の判断に必要なこと

この調査で現在revisionのL3/L10承認は作られない。current six full-body SHAに結び付いたfresh OpusとFableの独立再レビューが必要である。本文、判断、承認の変更は行っていない。対象は調査とsnapshot作成だけで、commit/push/PR comment/mergeは未実施。

静的確認: 旧全文SHA一致、現行全文SHA再計算、6全文SHA差、各Stage2b sectionの正規化後内容一致、固定親scope照合、旧source pin照合、`git diff --check`を確認した。検証結果の機械可読版は本MDと同名JSONに記録する。
