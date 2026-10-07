# HARNESS Stage 2b review01 M1修正監査（草案）

- 作業基点: `cf3cc158b6e9363e04e6c9fe9bd876aff34c831b`、worktree `/home/tenni/.helix-worktrees/harness-stage2b-misattribution-inventory`、branch `codex/harness-stage2b-misattribution-inventory`。
- authority / approval effect: `none`。これはM1修正草案であり、Fableの旧「承認してよい」を継承せず、新しい委任承認を生成しない。
- 正式review: [#2669 comment 6042075113](https://github.com/RetryYN/HELIX-HARNESS/pull/2669#issuecomment-6042075113)、UTF-8 5956 bytes、SHA-256 `16d07c72725f620038b352508b6dd78a5d561d81d7af83285bdf2a6c45a9fff4`。全文は隣接JSONの`formal_review.raw_body`に固定。
- 所見: OpusのM1（弱いoracle）は固定L2-024:507/514に合致する。既存R074は確認候補の提示だけを観測し、packet内の5要素が入力値・identityを保つかを見ず、各単独欠落CASEもなかった。L2:514は形成情報不足と、人の確認・合意待ち候補を分ける。

## 固定親と旧source

L2は`f6dad2a33`の`docs/helix-harness/L2-requirements/product-requirements.md:499–525`、全file SHA `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、span SHA `ec4ece6e411152941c16cd8dc25a1c43613dff5e6b5c3051ef675c66c8b9b2cc`。出力の五要素を列挙する507行SHA (LF込み) `32f54341020f48b67934cf9e057d4f4c28b3a4c37b12371cca93d02862da5bc6`、完備情報のときだけ確認・合意待ち候補を許す514行SHA `08110cfb896dcb027dd232da9841b7f247613e5a804b03f72dcf5178692aecae`。

L11は`f6dad2a33`の`docs/helix-harness/L11-acceptance/product-acceptance.md:240–260`、全file SHA `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`、span SHA `362e8cb3266bb14daa4139361d51dbebf1de259acd853d9f50af578c04bf639f`。正常なpacketを扱う247行SHA `e065c7c12b9ac96c164d9b3fa92e20214a8781c5e79a10b7bec11ba229f2f086`。レビューが併記したL11基本表212–215も同じrevisionに照合し、span SHA `d62ac4baf51ed8e9b6609d3124433c4ac313b86fcd3a5058380df73c39857473`（全file SHA `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`）。これは親017–020の基準表の文脈で、024のpacket意味根拠はL11:247とL2:507/514から取る。

旧sourceは`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/requirement-discovery-json-authority.md` (`LEGACY-ASSET-E78B8D68CC327AA00991`)、全file SHA `361a9ef773f7cf36cc0953f70cad205184ca952f2cb672431e5b929121ef1f61`、行48–52 span SHA `f0c7ae10f8b5a615dc6d427800bc5989a31a6af9f9d784f9307d05f37a76b758`。対の受入設計`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/requirement-discovery-json-authority-acceptance.md` (`LEGACY-ASSET-AD746F4F3487103519F9`)、全file SHA `3462b3da8269668c848799b07305f2fe135d8902de02121c2048d5686d98dc0e`、行22–26 span SHA `ddb5b49d8af9cf01a9b070d052ca8b626f04b035ca798fb2edab5894fee692fd`。旧FR003/007とAC003/007は質問優先・収束条件・人間合意境界の起点。五つのpacket要素そのものは旧sourceに同一の列挙がないため、固定L2:507を要件根拠にする。旧minimum 2 iterations、runtime/schemaは持ち込まない。

## 本文差分

R074を正常packetの値・identity・source/revision/scope保持fixtureへ明確化し、AC-024-03へ五要素が完備することと各単独欠落時の形成不足扱いを同期した。R096〜R100を新設し、原文、選択肢、推奨案、影響候補、判断ownerを一要素ずつ欠落させる。他の四要素、入力identity/revision/scope、他の必須形成条件は正常値のまま固定する。各欠落は形成資料不足として返し、人の確認・合意待ち候補として提示せず、人の決定値やownerを補完しない。既存CASEは削除・置換していない。

| CASE | 単独欠落 | paired AC |
|---|---|---|
| `CASE-HARNESS-L10-024-R096` | original-missing | `AC-HARNESS-L3-024-03` |
| `CASE-HARNESS-L10-024-R097` | options-missing | `AC-HARNESS-L3-024-03` |
| `CASE-HARNESS-L10-024-R098` | recommendation-missing | `AC-HARNESS-L3-024-03` |
| `CASE-HARNESS-L10-024-R099` | impact-candidates-missing | `AC-HARNESS-L3-024-03` |
| `CASE-HARNESS-L10-024-R100` | decision-owner-missing | `AC-HARNESS-L3-024-03` |

R074は完備packetを提示するpositive baselineとして保持する。FVのAC対応traceもR074/R096–R100を列挙するよう更新し、固定L2:507/514、旧RDJ-FR-003/007・AC-003/007を参照する。対象外CASEやStage2bのheader/scopeは変更していない。

## 6本文SHA

| 文書 | before SHA | after SHA | 変更 |
|---|---|---|---|
| `docs/helix-harness/L3-requirements/business-requirements.md` | `9fb531a55c61c4836ae614cadbd850f3967119cb1f0f2eb36dad1e39ebab75e2` | `9fb531a55c61c4836ae614cadbd850f3967119cb1f0f2eb36dad1e39ebab75e2` | なし |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `bd038522d001d95229fb2e96e7f88f2adfe82a30b927224a42246b74aa378c0c` | `c97255103e145d88774bef297be593281ff09336161a41f7a4fceffdcd7fb3f4` | あり |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `ee84bc87ff324eea929d266934c0debb856018aca25c0044f68b11c141c3263d` | `ee84bc87ff324eea929d266934c0debb856018aca25c0044f68b11c141c3263d` | なし |
| `docs/helix-harness/L10-verification/business-verification.md` | `864b0034aa84c4e9b29ec2ebb7bf2151a97dfdca0028c85ba2e0cee655d965ad` | `864b0034aa84c4e9b29ec2ebb7bf2151a97dfdca0028c85ba2e0cee655d965ad` | なし |
| `docs/helix-harness/L10-verification/functional-verification.md` | `191dcb11cb400c10516e2a437314ffea60de97cb7432091ff6ee47f964640e9a` | `eb37f40f850147597f5a205a1c0a63e69aa843636f3d0733f8d0d9fb624c6b90` | あり |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `b8a2ac27f92d9023dd3c24f7f3e16f6647e18e9272f2b3d94b7ced721b427386` | `17ee1dc8ab6786416680e496ba8fb83a714756dd8f853830afe036ddcc9b36e9` | あり |
正式reviewが示す未返却Minorと未確認範囲はそのままJSONに保持した。Fableの「承認してよい」とOpus M1は一致しないため、今回の修正後に両条件を再実施する必要がある。Fable未確認範囲は解消したと主張しない。

検証は文書ID/AC対応、単独変異のfixture構成、6本文before/after SHA、固定親と旧sourceの実blob/span SHAによる静的確認に限る。旧runtime/test/CIは起動していない。

Root検収でNFRVの024 planned fixture範囲もR001–R100へ同期し、追加5単独欠落を測定母集団に含めた。新しい閾値は設定しない。
