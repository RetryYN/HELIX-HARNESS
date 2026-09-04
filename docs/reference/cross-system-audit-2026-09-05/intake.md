# 外部横断監査の取り込み台帳

- 状態: 取り込み候補。要求・承認・実装完了の正本ではない。
- 配置根拠: `docs/governance/repository-structure.md` §2の横断参照資料。外部所見を意味正本へ昇格させない。
- `.helix/`は現行`.gitignore`で原則除外されるため、旧配置説明を根拠にforce-addせず、追跡可能な参照領域へ保存する。
- 所有Issue: #1500。修復は下表の既存責務へ接続する。
- 外部監査基準: `b5178c34fe34c956a70713ad942b1f5b8f64e0ab`。
- F07のみの外部監査基準: PR #1533 `593f55a60b0b7d723d68a194a7113d32789afa62`。
- 取り込み作業基準: `b69d911a7fb52d4cd234c0e51cee9314e8b444bc`。

## 是正優先度と所有先

| 所見 | 優先度 | 所有Issue | 是正対象 |
|---|---|---|---|
| F01 | P0 | #1411 | checklistのstrict入力検査 |
| F02 | P0 | #1430 / #145 | 検証義務exact setと実証跡の照合 |
| F03 | P0 | #1431 | 承認要否のtyped化とplaceholder拒否 |
| F04 | P1 | #1416 | 旧loopの終端verdict誤読 |
| F05 | P1 | #1442 | READYの世代束縛とPLAN関係の厳密化 |
| F06 | P1 | #1397 / #1218 | DB検査pathと実I/Oの一致 |
| F07 | P1 | #865 / #863 | 旧実行経路inventoryの自己増額拒否 |
| F08 | P1 | #1422 | self-pairの例外境界 |
| F09 | P1 | #1415 | reviewerの書込権限境界 |
| F10 | P2 | #1399 / #864 / #873 | 旧slot近似統計とcapacityの分離 |
| F11 | P1 | #1393 / #1443 | tracked文書のsecret検査漏れ |
| F12 | P2 | #1393 | Unix個人pathの検出境界 |
| F13 | P2 | #1397 | DB backup出力先の許可境界 |
| F14 | P1 | #1336 | event別CI generationと検証義務引継ぎ |

P0を先に扱い、F05/F06の状態取り違え、F14の検収阻害を並行候補とする。
Issue番号の順序や所見数だけで実装順を固定しない。所有先の重複表記は別実装の許可ではなく、
修復sliceの主ownerを確定するための関連付けである。

## 責務衝突の移行境界

| ID | 対象 | 維持すべき境界 |
|---|---|---|
| C01 | Ticket / Issue / PLAN | scope別cutoverまでは既存Issue契約を維持。仕事契約・設計工程・実行割当を分離 |
| C02 | memory / Learning / ADR / 承認 | 連絡はTTL付きpointer、知識はLearning、半永続判断はADR、承認はtyped receipt |
| C03 | 旧engine / resident | KEEP・MOVE・COMPATIBILITY_ONLY・REMOVEを区別。ratchet成功はconsumer-zeroではない |
| C04 | 旧mode / typed分類 | 旧exportの存在とcurrent CLI到達性を区別し、新規consumerへの逆流を拒否 |
| C05 | 反復Bench / blind選抜 | Experiment・replicateと重複成果物を区別。独立性検査を削除しない |
| C06 | no_harness / 安全境界 | treatmentによるcontext差と共通sandboxを分離。比較のためにguardを解除しない |
| C07 | DB正本 / projection | DB全体でなくtable・ledgerごとにowner、replay元、保持方針を定義 |
| C08 | Bench / 資格 / 配車 | Benchは実測と助言、Registryは資格、Routingは配車。実行前に未取得結果を要求しない |
| C09 | Capability / Slice / Module / Bundle | 機能実装・構成・consumer検収・公開を単一完了flagへ畳まない |
| C10 | canonical pair / 旧例外 | L2↔L11を維持し、self例外の用途・層・根拠をF08と同じownerで検査 |
| C11 | 承認 / candidate / 実装 | draftから未承認を推測せず、main存在から実装完了も推測しない |

## 修正済み対照を再計上しない

以下は外部監査の固定HEADで確認された対照であり、全経路検収済みの宣言ではない。

| ID | 対照 | 残余検査との区別 |
|---|---|---|
| X01 | review_evidenceは構造化entry抽出へ移行済み | 本文に語があるだけの旧欠陥を再計上しない |
| X02 | supersedesはYAML解析とback-reference照合済み | malformed fieldや循環の全網羅とは別 |
| X03 | v48のNULL拒否と重複receipt退避 | 既存全DBへの適用・運用終端とは別 |
| X04 | migrationのSAVEPOINT / rollback / release | backup出力先のF13とは別 |
| X05 | route eval CLIはtyped evaluatorへ接続済み | 旧export consumerの到達性監査とは別 |

## 証拠の限界

### 本体入口での追加再現

次は外部の抽出probeとは別に、HEAD `68c7bb1398a9bba79bdb7765ecaba71be4643df2`、
Node 24.15.0で公開TS関数を直接importした再現である。各リンクの記録を再取得して照合した。
これは修復完了・current mainでの再検収ではない。

| 所見 | 本体で観測した結果 | 証拠・限界 |
|---|---|---|
| F04 | 引用内pass＋最終failをpassと解釈。JSON fail＋stderr診断はpending | [#1416実測](https://github.com/RetryYN/HELIX-HARNESS/issues/1416#issuecomment-5546711962)。合成文字列のみ、provider起動なし |
| F05 | 古いpassed＋現HEAD failedでready。PLAN-10のfindingがPLAN-1をblock | [#1442実測](https://github.com/RetryYN/HELIX-HARNESS/issues/1442#issuecomment-5546703484)。実SQLiteだが合成schema、全migration／配車E2Eではない |
| F06 | repoRoot側でなくcwd側にDBを作成。read-only入口も誤ったcwd側DBを開く | [#1397実測](https://github.com/RetryYN/HELIX-HARNESS/issues/1397#issuecomment-5546693245)。一時領域のみ、運用DB変更なし |

F05は最新時刻だけを選ぶ修正では不足する。subjectのexact relation、HEAD、phase、required gate集合、
有効generationへの束縛を受入対象にする。F06は一度解決したpathをguard／mkdir／exists／open／返却で
共用する修正と、physical identity／backup出力先の検査を分離する。

ZIPは30再現ケースを持つが対照を含み、30件のバグではない。
F08/F09/F10/F11/F13/F14には同梱の実行反例がない。
抽出スクリプトのexit 0は危険挙動の再現であり、安全性合格ではない。
修復テストでは安全側oracleへ反転する。

取り込み時の検査では、F/C/X計30レコードのID重複0、source参照切れ0、
probe参照切れ0、記載blob SHA 20件は固定HEADのGit実体と一致した。
これは参照整合の証拠であり、全ソース精読・全runtime検収の証拠ではない。

## 未完了と削除条件

入力とZIP内14ファイルのサイズ・SHA-256は
同ディレクトリの `inputs.json` に固定する。
展開保存先`docs/archive/cross-system-audit-2026-09-05/source/`の14ファイルについて元サイズ・SHA-256との一致を確認した。
`source-map.json`は元名との一対一対応であり、ライセンスもbyte一致で保存した。
これはremote保全・全secret/PII検査・参照更新・追跡PRへの接続完了の証拠ではない。

- C01〜C11の責務衝突、X01〜X05の修正済み対照、未検証範囲を保持する。
- ローカルに展開内容を保存済み。元ZIP自体は再配置せず、入力ハッシュと内容の対応を保持する。
- remote保全・独立検収・参照更新は未完了。
- 修復PRの局所green、main到達、独立検収、read-afterを別状態として追跡する。
- 元入力の削除は保存・参照更新・追跡の検査後に行う。現時点では削除しない。
- 本台帳を作成しただけで所見を解決済みとして扱わない。
