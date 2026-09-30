# v1.3 条件行 closure work queue

status: bounded_source_identity_work_queue
authority_effect: none
basis commit: `2bbd889545cff238452701e5901ce56b67208fc8`

## 対象範囲

本queueは、旧archive v1.3の非空521行監査から`classification=condition`の303行を、原文行identity単位で列挙する。archive sourceは[旧v1.3 requirements](../../../../archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md)、基準監査は[303条件行を含む521行監査](legacy-v13-semantic-condition-audit-2026-09-28.json)、説明は[同監査のMarkdown](legacy-v13-semantic-condition-audit-2026-09-28.md)。母集団レベルのno-loss境界は[REG-06 population audit](legacy-source-origin-reg06-population-audit-2026-09-28.json)が`not_claimed`と記録し、要求管理viewは[requirement carry-forward status](../../requirement-carry-forward-status.md)にある。由来の旧assetは`LEGACY-ASSET-02319C2481B9E01698D5`（[asset disposition row](../../legacy-asset-disposition.jsonl)）。

範囲は303行全体です。`partial` 84行と`unresolved` 171行、計255行を一次作業対象にし、既存状態の`covered` 3行、`implementation-only` 31行、`version-target` 14行も分母保持のためqueueへ含めます。48行は二次照合対象として現行statusを保持します。description 154行、heading/structure 64行、6fabd125 baseline revision atom、旧candidate 4,755行は別母集団です。

## Source identityと証拠の階層

各行は`source_item_id`に加え、source path、file SHA-256、物理行番号、line SHA-256のtupleで識別し、原文の行textも保持します。303行すべてについてarchive sourceのline textとline digestを再照合しました。同じ本文・line digestがある別revisionは、このarchive identityと統合しません。

`baseline_condition_audit`は既存監査での分類・比較理由・参照・statusを転記した記録です。`existing_individual_audit_refs`はexact ID/tuple参照を持つ局所crosswalk、限定receipt、候補packet、authority overlayを役割別に列挙します。rowの`local_audit_join_status`でexact composite tuple match、ID参照だけでtuple未検証、該当するexact identity参照なしを区別します。参照自体をcoverageやsuccessorと解釈しません。#2387–2392は別の旧candidate 4,755行母集団として`candidate_pr_hierarchy_join`に置きました。PR本文の対象source IDは`LEGACY-CAND-LINE-*`、v1.3行は`REQSRC-SUP-*`なので、PR diffとのexact source identity joinは0件です。これは意味上の無関係・非member判定ではありません。

## 既存監査status

| status | 行数 | queue上の扱い |
|---|---:|---|
| `covered` | 3 | 二次照合・既存status保持 |
| `implementation-only` | 31 | 二次照合・既存status保持 |
| `partial` | 84 | 一次対象 |
| `unresolved` | 171 | 一次対象 |
| `version-target` | 14 | 二次照合・既存status保持 |

一次作業255行は、source行を義務・例外・受入oracleのclauseへ分解し、各clauseをexactな採用済みL2と対L11、候補のみ、または未解決へ結ぶqueueです。残余clauseとsource/target revisionも保持します。テーマやfamilyの類似だけでcoverageにしません。この行分解・逆traceは[atomization review contract](../../requirement-atomization-review-contract.md)と基準監査のexact coverage ruleに沿います。二次48行は、既存status・参照とidentityを照合し、現行statusを維持します。このartifactは監査statusの再出力だけでclosure完了を宣言しません。


局所artifactとのexact identity参照は、303 source IDs中14件で完全なpath/file SHA/line/line SHA tupleが一致し、24件はsource IDへの参照だけでtupleを検証できず、265件は局所artifact内にexact source identity参照がありません。125個のartifact/object参照記録には上記3状態を保持しました。これは局所監査の参照範囲を示すだけで、残り265件の意味的非memberや未監査確定を意味しません。

## #2394でmergeされた5行監査のjoin

基点`942f2e985f3af161ea4027b1691659a436860bc2`には、[v1.3 lines 167–171 focused audit](v13-policy-lines-167-171-condition-audit-2026-09-30.md)とJSONが含まれます。archive source file SHA-256は上記sourceと一致し、`REQSRC-SUP-00127`〜`00131`の5行すべてでpath/file SHA/line/line SHA/source textのtupleをキューと再照合しました。監査JSON SHA-256は`sha256:3be27e97d0d250fbc386b33d1d3062606f5a76e4d4aa28382ba813f07d7e33d7`です。

このfocused auditは`covered: 0`、`partial: 5`、`missing: 0`で、5行全てに未解消残差があり、formal successor割当は0、`authority_effect=none`です。キューへ5つのexact tuple参照を追加し、局所joinは33→38 source IDs、exact tupleは9→14、参照記録は120→125、exact identity未参照は270→265へ更新しました。303行基準監査の既存status分類と母集団件数は変えていません。5行はclosure work上引き続き未解決です。

## PR #2387–2392: 別population join

以下は2026-09-30 08:29:04 UTCにGitHub APIから取得した各PRの最終head・stateと、そのheadのPR diffに含まれるunique candidate source ID数です。JSONにはdiff SHA-256とID集合を保存しました。更新前の観測は各`pr_snapshots[].historical_observation`に履歴として分けて保持しています。

| PR | 内容 | 現在のGitHub状態 | 最終head | 最終diff内candidate source ID数 | v1.3 exact ID hit |
|---|---|---|---|---:|---:|
| [#2387](https://github.com/RetryYN/HELIX-HARNESS/pull/2387) | docs: audit two legacy Functional Release Slice acceptance routes | `merged` / draft=false | `6bf5c0f7aeb5` | 16 | 0 |
| [#2388](https://github.com/RetryYN/HELIX-HARNESS/pull/2388) | docs: audit ten remaining World Governance candidate routes | `closed` / draft=true | `3e5e4b13a80a` | 62 | 0 |
| [#2389](https://github.com/RetryYN/HELIX-HARNESS/pull/2389) | docs: audit ten World Governance acceptance and intake routes | `closed` / draft=true | `156a22e4db2d` | 32 | 0 |
| [#2390](https://github.com/RetryYN/HELIX-HARNESS/pull/2390) | docs: audit ten World Governance request and requirement routes | `closed` / draft=true | `98240ed6a427` | 32 | 0 |
| [#2391](https://github.com/RetryYN/HELIX-HARNESS/pull/2391) | docs: classify eight FRS frontmatter refines rows | `merged` / draft=false | `eb7f69d48ecc` | 8 | 0 |
| [#2392](https://github.com/RetryYN/HELIX-HARNESS/pull/2392) | docs: classify six Concept capability delta metadata rows | `merged` / draft=false | `bde939b186da` | 15 | 0 |

各PRの数値は、その最終diff内のunique candidate source ID数です。#2392の15件には#2391でも参照される8 ID（`LEGACY-CAND-LINE-002164`〜`002171`）と、同PRの7 ID（`002607`〜`002613`）が含まれます。PR間の重複を除いた最終diff内candidate source IDは91 uniqueです。各PR diffに含まれる`REQSRC-SUP-*` IDを303行queueのsource ID集合と照合し、全PRでexact ID hitは0件でした。これは同一identityがないという結果であり、意味上の無関係・非member判定ではありません。候補監査・分類proposalのmerge/close状態からv1.3条件の意味、採択、successorを生成しません。

## 検証と主張境界

基準監査SHA-256: `sha256:cd765545e584c50b423d652674ac54a3240aced24a321c0caa6bc2dd881ad863`

archive source SHA-256: `sha256:788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`
件数: 521非空source lineのうちcondition 303行、unique source item ID 303、partial+unresolved 255行。

JSONの`static_validation`には、原文行・line SHA再照合、件数和、unique ID、PR exact join数、#2394 focused auditの5件tuple joinを記録しました。旧runtime、test、CIは実行していません。

このqueueの`authority_effect`は`none`です。正式successor割当、採択、意味変更、source condition closure、L11実行/受入、全source no-lossの主張はありません。`no_loss_full_source`はfalseのままで、既存の`legacy-source-origin-reg06-population-audit-2026-09-28.json`の`claims.no_loss_full_source=status:not_claimed`を維持します。
