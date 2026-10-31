# WR256 CONNECT005 L8 候補U-ID表

## 対象と境界

Issue #3510 の依頼 WR256-CONNECT-TRACE-L8-SLIMに基づき、CONNECT005 のL8正本を候補U-ID表へ縮約する。変更対象は `docs/helix-connect/L8-unit-verification/technical-trace-handoff-custody.json` だけ。対象revisionはmain `c14adddf2678c7a69d76420c451df3f05b1251ab`。

L5の公開関数3本とfailure_rules 27行、L9の基本枝90件、既存L8追加probeのlocal 61件・independent 68件に、独立したcross-field制約5件を加え、元のID・順序・対象・短い行固有反例と期待・契約oracle・固定source pointer付きで224行へ対応づけた。cross-field 5件はL9の90 wholeとは別系列の条件probeとして個別行に保持する。L5の27 ruleは固定sourceの期待failure emissionとarea/field/result/owner・when条件の証拠が一致する行だけを候補参照として保持する。candidate linksは224行中184件で、正常例へfailure ruleを結ばない。row oracleとtest citationは元資料に存在しないためnullとし、未作成を明記した。全行のexecution_stateは`not_executed`を維持し、新しいcaseの実行・承認状態は生成しない。

L8のmethodは固定sourceとの候補U-ID対応を説明し、L5 AST評価・test実行・pass/fail判定をしない。各L8行はsource条件に対応する短い固有期待だけを記し、共通の責務・未検証・副作用境界は文書上部で一度だけ示す。L3/L4/L5/L10から導いたF01/F02/N01の主要状態・非生成境界も一度だけ記す（F01のgap/conflictはtrace unknown、F02のhandoffは未完保持かつbusiness completionなし、N01は値なし参照とcustody権限をCONNECTが作らない）。5つのtyped cross-field枝は共通のno-exception/unknown-stop-link条件を一度記し、各行は型別の非強制変換期待を記す。行別の意味監査は初回時点の `source-semantic-audit.json` と最新追補 `evidence/records/wr256-rule-link-32794-append-only-r2/source-semantic-audit.json` に分けて保持する。最新追補は全224行の固定source/expected pointer、projection hash、短い行期待、failure所見、27 ruleのcondition witnessとemit findingを保持し、反復full projectionとmodal baselineは含めない。過去版のcommit/blob/hashは `evidence/evidence-history.json` と `evidence/evidence-history-addendum-20261101-r2.json` に固定する。validatorは固定sourceから再生成し最新追補と比較する。最新recordのsource audit SHA-256は`2a5689d33cb6e5a7d202c0380535727fbdf64dcc659a5378bf0a924e136ef180`、summary SHA-256は`a9f127a5cb74634c260a9f2e74d6ae392480c70c8be141f38f04e1ff16a24087`。L8へfull returnや再構成baselineを残さない。

L8から撤去した展開fixture、入力patch、full return、重複probe payload、source packet hashは、同じpathの固定main revisionから辿れる。`removed_materials`はdecision_ref、git_commit、path、meaning、removed_key_rule、use_boundaryの6キー。DT-VT-105に従い、撤去sourceをL7 fixture/test/oracle/citationに流用しない。

## 旧HELIXとの対応・失敗起点

旧HELIXとの対応はL5 `legacy_comparison` と `legacy_asset_ledger_refs` に固定されている。参照資産は `LEGACY-ASSET-C3DE79BA9451172F3E43`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/product-data-connector.md` §4、行111–117・147–173）と `LEGACY-ASSET-DD66C1B6B7BE234B37E6`（L6 `product-data-connector.md` 行207–209、ledger 704）である。保持点は値を複製せずdigest/owner/policy/versionで追跡し、pendingと元operationを残して過去eventを上書きしないこと。変更点は旧Node DB/clock/seal/projection transactionを実装方式として採用せず、採択CONNECT005と承認F01/F02/N01の技術trace・未完・owner参照へ再導出すること。旧sourceは参照だけで、旧runtime/test/CI/algorithmは起動しない。

失敗起点はIssue #3510 comment 6408252809のL8/L9巨大化、PR #4002 R1 F1の共通値重複、PR #4003 R1の件数減少38→35である。PR #3998 namingとPR #4002 R2 (CONNECT009) は、U-ID表と撤去記録の近接先例として依頼に指定された。いずれの派生repo運用も現行の要求意味へ移植せず、CONNECT005の既決要求・L5文書に固定された意味の範囲に限る。

## 消費側・validator・pin調査

main HEADで固定対象pathを検索し、直接の文書参照はCONNECT監査記録、crosswalk、L5正本に限られた。監査・crosswalkの過去時点記録は変更せず保持する。L5の現行文面に削除対象のL8 nodeを指すpointerは見つからず、現行L4/L5/L9のbytesは変更しない。JSONの一般validatorは `scaffold/tools/design_verification_checker.py check-child`、Bindingのconsumerは `scaffold/tools/scfctl.py stale/validate`。case参照を固定revisionへ結び、撤去nodeの現行参照を残さない。初回の `verification-summary.json` と `source-semantic-audit.json` は初回commitのbytesへ復元済み。最新の照合結果は `evidence/records/wr256-rule-link-32794-append-only-r2/` に固定し、validatorの通常実行は両ファイルをbyte-for-byte比較するだけで書き込まない。`--record --record-id <unique-id>` は未使用pathだけへexclusive createする。過去の全上書き時点のcommit/blob/SHA-256はappend-only checkpointとhistory addendumに記録する。

## 検証の限界

全照合は文書bytes、ID、JSON Pointer、責務・参照境界に限る。行の意味の独立reviewは残る。L9の90件と追加probe134件は意味を統合・削除せず、source順・IDごとに別行で記録した。旧候補で欠けていたcross-field probe 5 IDも連番U-IDへ割り当て、型別入力差（`null`、`false`、`0`、空文字、空object）、`stop_event_ref=null`、例外なし、`stop_link_result=unknown_original_information`、未実行を照合する。

再現コマンドは `python3 scaffold/research/wr256-connect-trace-l8-slim-20261031/validate_uid_table.py`。対象固有照合は224行、L5 failure rule 27件についてwhen/emitと候補行ごとのsource condition witness・局所期待failure emission・owner等を突合し、最新の不変追補artifactと比較する。現行固定sourceで対応が確認できたのは27/27 rule、184 row-ruleリンク。U-CONNECT005-001にはfailure emissionがないためrule 3/9を結ばない。validatorはL8のrow refsとrule coverageの両方がこの全量照合結果に一致することを検査する。L10 contract oracle ID、固定source pointer、method境界、L3/L4/L5/L10契約状態、各rowの短い期待とscaffold側行別projection/hash、capも機械確認する。scaffold監査の比較用projectionは4 groupで計110 baseline path値と834 row差分（最大14件/行）。L8本文の期待文字列は最大159文字。最新source auditは1,014,510 bytesから413,421 bytesへ縮約し、全224行の固定pointer・hash・短い期待・failure所見・27 rule witnessを保持した。除いた反復projectionの各時点bytesはcheckpointのcommit/blob/SHAに保持する。cross-field 5型枝は各型入力差をcounterexampleと固有期待に残す。`design_verification_checker.py check-child` も試行したが、L5/L8 pairと4-wayは `empty_pair_entities` / 0件で `not_evaluated` となった。この汎用validatorのfalse結果は合格にも意味上の所見にもせず、未検証として残す。ruleの静的対応はsource期待の照合に限り、L5条件の実装動作を実行・証明しない。validatorが理解するpairは既存のL5/L8文書形と異なる。L9全体のcap違反も同コマンドに出るが、本作業のL9は変更しておらず、L8候補のcap判定は対象固有照合で独立に0件を確認した。

候補L8の承認、L5/L8意味整合、L7 test/oracle、実行、CI、L11受入や設計閉包は生成しない。
