# INTELLIGENCE Stage 4 review01 M1 修正監査

対象は `f4ccb9efa1d20dcda9a270c9d16f1b77f0eb8134` のINTELLIGENCE Stage 4、固定親 `HELIXINTELLIGENCE-L2-017` と `HELIXINTELLIGENCE-L2-036` のみ。正式comment #2670 review01（6042291257）の全文・SHA-256・raw spanは対応JSONに固定した。authority effect / decision effect は `none`。この証拠は承認、PO事後確認、merge admissionを生成しない。

固定L2の017はpermissionを含む各結果を同一target revision/scopeへ束ねる。036は操作candidateと対象scope/revisionを入力し、SECURITYのpermission/constraint/revocation照合を返す。固定L11の基本行92/99とR2187行266/273も照合した。これらのsourceは別revisionのpermission対象を一致扱いしてよいとは定めていない。旧L3/paired acceptanceの形式起点と旧BBR-R02/R04、旧security capability authority/acceptanceを読んだ。既存のsource inventoryと各旧asset path・行はJSONのraw spanおよびsource SHAに記録した。

## 修正

- `AC-INT-036-01` と正常CASE-INT-036-01にpermissionのtarget revisionとoperation candidateのtarget revisionの一致を追加。
- `CASE-INT-036-02p` はpermission自身のrevision・状態とactor/action/target/scopeを正常固定し、permission target revisionだけを変異。operationを実行可能にせずSECURITY permission/isolation ownerへ戻す。
- `CASE-INT-017-02p` は他receiptとpermission自身のrevision・状態を正常固定し、permission target revisionだけを統合target revisionと不一致にする。permission証拠を完了から除外し、operationを実行可能にせずSECURITY ownerへ戻す。
- 017/036のAC列挙、BR/BV親別fixture索引、NFRVのNFR-INT-017-01/036-01分母へ同じIDを同期した。既存CASEは削除・置換していない。

6本文のbefore/after SHA-256、固定L2/L11の対象revision付き原文span、旧source full-file SHAと対象spanはJSONに記録した。NFR grade本文は変更していない。

## レビュー状態と限界

Formal commentのOpus Major 1を修正対象とした。Fableの同一HEAD見解は文脈として保存したが、Opusと見解が一致していないため承認状態へ変換しない。commentに記載された非返却Minor 5件はこの修正で解消したと主張しない。Opus未確認と記録された旧asset実blob、packの全内容、BR/BV/nfr-grade本文のCASE ID集合以外、類型5の直近25 commit外も解消済みとは主張しない。

## 検証

`git diff --check`、CASE ID定義の一意性、FR AC・FV定義・BR/BV索引・NFRV分母の同期を静的に確認した。CASEは実行していない。変更は未commit・未pushで、Root検収待ち。
