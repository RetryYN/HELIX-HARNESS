# HARNESS Stage 2b残5親のmain統合後SHA再照合

- 統合後main: `4fdcd449fac8ffbc7c6ab18654b355497be07b91` (#2655 merge)。統合前base: `f14ac303d265b6d23ecb1847b5dfd52901a442c6`。
- 対象: Stage 2bの5親 `017/018/019/020/024`、L3/L10 6本文の現行SHAとsection continuity。
- 権限効果なし。本文・decision・既存snapshotを変更せず、新しい統合snapshotのみ追加。

## 6本文とStage 2b節

全文SHAは統合後mainから再計算した。sectionは`## Stage 2b 残件追補 — HARNESS-L2-017/018/019/020/024`から次の見出し直前までをraw bytesで比較した。6節すべて統合前f14acとraw byte一致。旧承認本文に対しては、節内容bytesは一致し、現行節に末尾LFが1 byte増えているためraw span自体は非同一。全文6文書は旧承認SHAとすべて異なり、旧承認をcurrent full-body revisionへ継承しない。

| 文書 | 旧承認全文SHA | 統合前全文SHA | 統合後全文SHA | 旧節SHA | 統合後節SHA | 統合後節と旧節 |
|---|---|---|---|---|---|---|
| `docs/helix-harness/L3-requirements/business-requirements.md` | `a1c0ed86d63a523ebad07105ceb6dbbca602bb1bd3c6a76af5c8a9e10fbab4b2` | `781e337ff60f8765467b216edefdeca14416c2b8c1fd3889b8afa5d6f4d7cb33` | `9fb531a55c61c4836ae614cadbd850f3967119cb1f0f2eb36dad1e39ebab75e2` | `b6ea82680f800ce2b0569bb4987cb79283005fc0d93ec72a9a47f40e9c34dca2` | `3608967db129b66b2670bdf64d1f18be7cb3915ab6abda34e6084492ebdf6031` | 内容一致、現行raw spanは末尾LF+1 |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `9734e536774f62ba6d53a8804ca16649e00dda307ae60114431f61ad21daa3b4` | `e3b18c538d2903e7adfd3d800bc82f6eb7190a6de870e72ac2e4913b733de885` | `bd038522d001d95229fb2e96e7f88f2adfe82a30b927224a42246b74aa378c0c` | `3306d3242ac47c2d70b65b39f1c011aaf95c8073aa9d30ea5b76e5a8def99eba` | `8e9fb46121c60dc8b6690ce6dd5c30d7973410cbd6c150f436137b90f963c23b` | 内容一致、現行raw spanは末尾LF+1 |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `ab37418cb9d3004d6ba0467b4c82bfe4d75f90eb8f4c136902f691e8e3c876b6` | `ed08243e009b629aba5167786bf47d946f27e2e1ff8526d61480d826cd3a8317` | `ee84bc87ff324eea929d266934c0debb856018aca25c0044f68b11c141c3263d` | `ff64bb5f2e245ecfbfffb73453146aef79617b9a8fc869e50e4d30a7d0804256` | `d3e4d261ca743397107632661d930ee570a649435fc52041ec1dde8158ff0143` | 内容一致、現行raw spanは末尾LF+1 |
| `docs/helix-harness/L10-verification/business-verification.md` | `788c690368c3be1721410f65d5970dad1731b8e79a0a5b7b80c26e3475698309` | `84f68583915cc9c206d44d08e188508f73b0b9ea69ae73b82b61ceec8196f1a4` | `864b0034aa84c4e9b29ec2ebb7bf2151a97dfdca0028c85ba2e0cee655d965ad` | `8d218e2ea02794e328c446516828e95a06f78adeeee96fe1ec7edcba34e96eb7` | `bad59c1d18626e27de2dd4990e8f16f56b955832670adfc8739b7a3b3b19c938` | 内容一致、現行raw spanは末尾LF+1 |
| `docs/helix-harness/L10-verification/functional-verification.md` | `0a7fb5d4cc88d6fec1576260d5b3bd2adf71d0ed6939b1168cf4ee621dd538dc` | `0cb0d7a9fc0fc23d38c809dd47cca770f860c47905cd60e7d7f59222d3a07f9c` | `191dcb11cb400c10516e2a437314ffea60de97cb7432091ff6ee47f964640e9a` | `ee358f64a85ce39d694c800c256777b01907e5873260b02a9d1d7c28281eee61` | `dea6989e31e19a0b7125721937505e52f42b67808600a2f3d99a422795689485` | 内容一致、現行raw spanは末尾LF+1 |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `245f1c655276338ac163ba35ded36e8453769197638412a305a2b0aec658fd82` | `def2277503ef06c49fef4868dce7eab2322f761c9ff31e630b217f133325a53e` | `b8a2ac27f92d9023dd3c24f7f3e16f6647e18e9272f2b3d94b7ced721b427386` | `84353058bbde34ff232f810b9b7a2248c5dc057d62faea12148651dcf6fb4fa2` | `c4b0e3ed5e67fd9316e1260f5d4e943491497c37c684758c255a5c9b279ed8ff` | 内容一致、現行raw spanは末尾LF+1 |

## 旧reviewの帰属と次の確認

過去の判断記録／pinはFable comment `6003038860`をOpusの所見として記述している。現物のformal bodyでは6003038860はClaude review_merge laneのFable 5.1で、結論は「承認してよい」。実際のOpus 5.5 independent reviewはcomment `6039142042`（旧review revision `3aa88a697...` / HEAD `9981f376...`、Major 0・未確認0）である。comment raw bytes/SHAと旧decision/pin SHAはJSONに固定した。過去記録は変更していない。

現在のreview対象は統合後HEAD `4fdcd449fac8ffbc7c6ab18654b355497be07b91`、同HEADをbaseとする完全な6本文セットである。Stage 2b節の内容が不変でも、委任判断は6本文全体revisionに束縛するため、新current revisionについてOpusとFableのfresh reviewが必要。新たなapprovalはこのsnapshotから生成しない。

検証: 六本文full SHA再計算、統合前後のStage 2b raw span比較、JSON parse、`git diff --check`を実施。旧runtime/test/CIは実行していない。commitはsnapshot filesのみ。push/PR/mergeは行っていない。
