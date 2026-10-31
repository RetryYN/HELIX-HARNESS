# WR256 CONNECT005 L8 候補U-ID表

## 対象と境界

Issue #3510 の依頼 WR256-CONNECT-TRACE-L8-SLIMに基づき、CONNECT005 のL8正本を候補U-ID表へ縮約する。変更対象は `docs/helix-connect/L8-unit-verification/technical-trace-handoff-custody.json` だけ。対象revisionはmain `c14adddf2678c7a69d76420c451df3f05b1251ab`。

L5の公開関数3本とfailure_rules 27行、L9の基本枝90件、既存L8追加probeのlocal 61件・independent 68件に、独立したcross-field制約5件を加え、元のID・順序・対象・短い行固有反例と期待・契約oracle・固定source pointer付きで224行へ対応づけた。cross-field 5件はL9の90 wholeとは別系列の条件probeとして個別行に保持する。L5の27 rule pointerは候補行の参照として保持する。row oracleとtest citationは元資料に存在しないためnullとし、未作成を明記した。全行のexecution_stateは`not_executed`を維持し、新しいcaseの実行・承認状態は生成しない。

期待結果はfixture/full returnや共通状態の行ごとの文字列再掲にしない。関数別の共通期待baselineを一度だけ `expected_result_baselines` に置き、各行の `expected_result` はbaseline参照とsource projectionとの差分（set/remove）のみを持つ。validatorは固定sourceから各行の構造projectionを作り、baselineと差分を再構成して全行をsourceと照合する。結果要約は非実行の候補意味projectionであり、fixtureやfull returnを再展開しない。

L8から撤去した展開fixture、入力patch、full return、重複probe payload、source packet hashは、同じpathの固定main revisionから辿れる。`removed_materials`はdecision_ref、git_commit、path、meaning、removed_key_rule、use_boundaryの6キー。DT-VT-105に従い、撤去sourceをL7 fixture/test/oracle/citationに流用しない。

## 旧HELIXとの対応・失敗起点

旧HELIXとの対応はL5 `legacy_comparison` と `legacy_asset_ledger_refs` に固定されている。参照資産は `LEGACY-ASSET-C3DE79BA9451172F3E43`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/product-data-connector.md` §4、行111–117・147–173）と `LEGACY-ASSET-DD66C1B6B7BE234B37E6`（L6 `product-data-connector.md` 行207–209、ledger 704）である。保持点は値を複製せずdigest/owner/policy/versionで追跡し、pendingと元operationを残して過去eventを上書きしないこと。変更点は旧Node DB/clock/seal/projection transactionを実装方式として採用せず、採択CONNECT005と承認F01/F02/N01の技術trace・未完・owner参照へ再導出すること。旧sourceは参照だけで、旧runtime/test/CI/algorithmは起動しない。

失敗起点はIssue #3510 comment 6408252809のL8/L9巨大化、PR #4002 R1 F1の共通値重複、PR #4003 R1の件数減少38→35である。PR #3998 namingとPR #4002 R2 (CONNECT009) は、U-ID表と撤去記録の近接先例として依頼に指定された。いずれの派生repo運用も現行の要求意味へ移植せず、CONNECT005の既決要求・L5文書に固定された意味の範囲に限る。

## 消費側・validator・pin調査

main HEADで固定対象pathを検索し、直接の文書参照はCONNECT監査記録、crosswalk、L5正本に限られた。監査・crosswalkの過去時点記録は変更せず保持する。L5の現行文面に削除対象のL8 nodeを指すpointerは見つからず、現行L4/L5/L9のbytesは変更しない。JSONの一般validatorは `scaffold/tools/design_verification_checker.py check-child`、Bindingのconsumerは `scaffold/tools/scfctl.py stale/validate`。case参照を固定revisionへ結び、撤去nodeの現行参照を残さない。検証結果は `verification-summary.json` に記録し、再生成と照合手順は `validate_uid_table.py` に置く。

## 検証の限界

全照合は文書bytes、ID、JSON Pointer、責務・参照境界に限る。行の意味の独立reviewは残る。L9の90件と追加probe134件は意味を統合・削除せず、source順・IDごとに別行で記録した。旧候補で欠けていたcross-field probe 5 IDも連番U-IDへ割り当て、型別入力差（`null`、`false`、`0`、空文字、空object）、`stop_event_ref=null`、例外なし、`stop_link_result=unknown_original_information`、未実行を照合する。

対象固有照合は224行、L5 failure rule 27件、L10 contract oracle ID、固定source pointer、共通baselineとrow差分の復元結果、capを機械確認する。4 group (F01/F02/N01/cross-field) ではbaseline fieldを一度保持し、合計110 baseline path値、row deltaは計834 path差分（最大14件/行）。cross-field 5型枝は期待constraintを共有baselineに一度保持し、各行は型別入力差をcounterexampleに残す。`design_verification_checker.py check-child` も試行したが、L5/L8 pairと4-wayは `empty_pair_entities` / 0件で `not_evaluated` となった。この汎用validatorのfalse結果は合格にも意味上の所見にもせず、未検証として残す。validatorが理解するpairは既存のL5/L8文書形と異なる。L9全体のcap違反も同コマンドに出るが、本作業のL9は変更しておらず、L8候補のcap判定は対象固有照合で独立に0件を確認した。

候補L8の承認、L5/L8意味整合、L7 test/oracle、実行、CI、L11受入や設計閉包は生成しない。
