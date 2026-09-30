# PHCAP-07 Scrum typed projection受入3条件監査

- 基準: `origin/main` `0f5050e2b25cd622640c99c5de170cca087f7d8a`
- 固定比較先: PO判断で合意されたHELIX-HARNESS L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`
- 対象: `LEGACY-ASSET-FC23AB4BB99DA8F4076A` の `SCRUM-OPS-A-02`、`A-03`、`A-06`（旧source lines 42、43、46）
- 結果: `unknown` 1件、`partial` 2件。authority effectなし、formal successor 0、coverage claimなし。
- 詳細、行/file digest、固定L2/L11、重複確認: [JSON監査記録](phcap07-scrum-typed-projection-a02-a03-a06-condition-audit-2026-09-30.json)

## 出典と対象状態

旧起点は`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L10-scrum-operation-typed-projection-acceptance.md`（SHA-256 `b74c34732e161a7a2712360221c43f7865882029fd7bfa8dff74f1bf01ff1ea7`）と、そのpair parentである旧L3要件`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/scrum-operation-typed-projection.md`（SHA-256 `a856c4be233d11b8e9d56fbb64ec1a85143ef785316b62bbd3ffffc7ef823525`）である。後者のR-02/R-03/R-06は各受入条件が参照する元の意味を確認するために読んだ。両assetは台帳上`unresolved`、実装状態`unknown`、consumer refs空である。旧受入文書の`tests/current-location.test.ts` citationは宣言上のtest consumerとしてのみ記録し、結果や実行を証明しない。

HELIX-HARNESSの比較本文はL2 SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、L11 SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。両方ともf6dad2 commit上のblobと一致する。現mainにあるPO判断記録はこのsource revisionを指定し、L2/L11一式への合意と既存L2-001..009条件の保持を記録している。

PHCAP-07はinventory上`candidate_only`かつ`not_reimplemented_formally`、`authority_effect: inventory_and_work_projection_only`、`new_build_allowed: false`である。この監査では同じ状態を維持し、L10、oracle registry、新世代CI、test implementation、受入実行を新たに成立させない。旧L3/L10/L12番号は現行pairへ直接移さない。

## 条件単位比較

| 旧受入ID / source line | 固定HARNESS L2/L11で確認した意味 | 状態 | 残差 |
|---|---|---|---|
| `SCRUM-OPS-A-02` / 42 | L2-002/L11は開発方式としてのScrum、L3後のslice化、利用記録からの改善とBackflowを扱う。見積りと実測velocityの分離・計測は定めない。 | `unknown` | typed field/schema、期間・集計、値のsource、欠損・再計算、利用consumer、condition oracleが特定されない。 |
| `SCRUM-OPS-A-03` / 43 | L2-003/L11は工程開始・凍結・差戻し・再開・完了のgateと、未合意/未検証の進行拒否を扱う。DoR/DoD固有のtyped gateまではない。 | `partial` | typed field、owner、判定入力、例外/waiver、receipt、変更後再評価、Scrum consumerへの投影先が特定されない。 |
| `SCRUM-OPS-A-06` / 46 | L2-002/003とL11にScrum checkpoint、SR0-SR4、finding reroute、再発findingやScrum Reverse checkpointからReverse ticketを導く条件がある。 | `partial` | retrospective event/result schema、再発finding identity/集約、Recovery/Reverseへのtyped relation、receipt/consumer、retro後Backflow条件が特定されない。 |

L2-002/003のScrum・gate・Reverseとの関連は各条件の欠けた型やoracleを補わない。特に旧R-06がL12と記述されていることを、新HARNESS L11に対応づけてはいない。

## 重複確認

`origin/main`にはこのasset/acceptance ID 3件を固定HARNESS L2/L11へ個別照合した監査はなかった。local integration branch `codex/stage5-local-integration`（HEAD `275b5145a763e0a805d317657ab5e28d41968c61`）にも同じ個別監査はなかった。同branchのScrum系3条件route監査は、別source pathのcandidate acceptanceにある`LEGACY-CAND-LINE-004267`（SCRUM-OPS-AC-02）、`004271`（AC-06）、`003115`（U-MSPF-002）を対象とし、本監査のL10 test-design assetのA-02/A-03/A-06とはidentityが異なる。Scrum Reverse/traceの近接意味を比べる資料として参照し、重複とは扱わなかった。

PR検索（`L10-scrum-operation-typed-projection-acceptance`、`SCRUM-OPS-A-02`）では個別条件監査PRは見つからなかった。関連検索結果の#1752、#1762、#1766はScrum typed-projectionのplan/runtime名の過去PRであり、現在の条件監査ではない。現open PR #2387–2392にもこの3 source IDの個別条件監査はない。

## 静的確認と限界

JSON構文、3 acceptance IDの一意性、旧sourceのfile/line digest、固定L2/L11のblob・SHA、PHCAP-07状態、route summaryと条件数、全体/各行`authority_effect: none`、successor未割当、coverage/Stage 5完了claimなしを確認する。旧test/runtime/CLI/CI、新世代test/CIは実行しない。本記録はこの3条件だけの意味比較であり、PHCAP-07全条件やconsumer/oracle閉包の証明ではない。
