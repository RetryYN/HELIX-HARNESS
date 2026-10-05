# LABO Stage 2b review04 Worker追補監査

- 正式review: comment `6001942888`。raw body SHA-256 `f1104faadcf96c8143a95baf37ba1275e72ea1321ec84a44be320c20f02c69b6`、17594 bytes。Major 9、Minor 14。
- 対象親: 22親、`HELIXLABO-L2-012..030`、`034`、`035`、`058`。対象は明示された23所見のみ。
- 修正前HEAD: `8c78089b2f962180137cf41d2b860c080ccbab8b`。全6正本のmain `5acae384305b01d10e88eeb2e6406f847baf66df` prefix byte一致: 6/6。追加CASE定義は312件、ID重複なし。全個別CASE literal/spanのsha256は同梱JSONに保持。
- 旧source: 既存不変source/pair記録 `docs/governance/audits/requirement-registration/labo-stage2b-002-010-review01-repair04-2026-10-05.json` から93 full-file/span pinsを取り、正確なsource commitに対しfull SHA/span raw-LF SHAを再計算。一致: 93/93。これはarchive全consumer網羅を意味しない。
- 固定L2/L11: `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のtargeted parent spans・§24 rowsを記録。PO source spansも別pinとして保持。
- 旧監査: 修正前HEADに存在した監査1878件を全てbyte hash照合し、変更なし=1878/1878。
- 検証: `git diff --check`、6 prefix、ID/AC/index静的照合。runtime/test/CI/Bunは起動していない。統合staleはRoot検収へ委譲。

## 23 findings disposition

- **M1 (017)** — 017-C11適格性欠落、C12 system/operation条件欠落を独立単変異として追加。AC-02とscope indexに反映。
- **M2 (017)** — C13 system永続固定を追加。§24 #12に017/AC-02/C08・C13を追記し、L11反例を一律gate化せず固定意味に結び付けた。
- **M3 (019)** — 既知targetを持つC09のOS routeを拒否・unknown保持へ変更。OS routingはtarget unknown時のみと明記。
- **M4 (022/023)** — 022-C15 contract欠落、C17 contract-only stale、C18 revision-only staleを独立追加し、既存複合C06を保持。C17/C18はそれぞれOS source contractとrevisionの単独変異。023-C13 BRAIN contract欠落を追加しBRAIN ownerへ戻す。
- **M5 (024)** — 024-C17 LABO記録からINTELLIGENCE正本へ書戻す単独要求を追加し、ownerを創作せず拒否のみ。§24 #2 trace更新。
- **M6 (029)** — 029-C19 OS execution receipt不一致を欠落fixtureと分離追加。
- **M7 (034)** — 034-C11 connector欠落、C12 connector不一致を独立追加。候補送付成功にせず、固定L2接続packの個別CONNECT connector contract ownerへ未完で返す。
- **M8 (035)** — 035-C18 connector欠落、C19 connector不一致を独立追加し、固定L2接続packの個別CONNECT connector contract ownerへ未完で返す。052のrevision到達不一致と区別。
- **M9 (058)** — 058-C40 scope欠落だけのfixtureを追加し、固定L2-058に従い選択source ownerへ不足を戻す。
- **m1 (016/017/020-023/024-029)** — FVのStage2b親indexをL3個別CASE一覧から正確な明示ID集合へ更新。
- **m2 (016)** — L3固定親句traceに正常fixture016-C08を追加。
- **m3 (016)** — 016-C11 oracle欠落を独立追加しfailure AC traceへ反映。
- **m4 (020)** — 020-C02のunsupported “rule owner” wordingをsource ownerに訂正。
- **m5 (021)** — 021-C13 contract version-only stale fixtureを追加し他軸を保持。
- **m6 (029)** — L3 crosswalkの029-C16をsource/SHA columnからindividual CASE columnへ移動し、CASE rowからも参照。
- **m7 (028/029)** — 028-C13をauthority claim拒否のみへ、029-C05/C06/C09をpass拒否・unknown、C10/C11/C12を拒否のみへ訂正し、固定L2-029が定めるscope/source owner route以外を作らない。
- **m8 (028/029)** — 028-C12 oracleを有効receipt保持・result-source欠落だけの返却へ一致させ、029 source returnsを正規化。
- **m9 (024/025/026/030)** — AC-02にfact/judgment、revision stale、contract missing、identity/revision/contract不足条件を明記。個別CASE IDs維持。
- **m10 (058)** — 058-C01正常oracleでfixed L2-058選択理由の表示を照合。新negativeや閾値を作らない。
- **m11 (058)** — C06 invocation scope owner、C07 selected source owner、C15/C16 reject/unknownの戻し先を明記。
- **m12 (030/034/035)** — §24 #2 traceに030-C08、034-C10、035-C07/C08/C13/C14の代表fixtureを加え、全範囲網羅を過大主張しない。
- **m13 (035)** — §24 #9 trace rowを035の既存AC/CASEへ追加。範囲の他親は未確認保持。
- **m14 (035)** — 035-C13 oracleから固定親にないOS責務を削除し、INTELLIGENCE境界とLABO非実行に限定。

## 未確認のまま残す範囲

旧archive全consumerの意味網羅、L1全文、依存L2全文、L11 §24 #2/#9のStage 2b外すべての親、最新main統合木でのstale/residualsは確認済みと記録しない。個別source pin・固定本文spanはJSONの詳細を参照。
