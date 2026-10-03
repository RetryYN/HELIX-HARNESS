# 要求段階の現在状況

PO候補一覧は[2026-10-03の固定snapshot](audits/requirements-stage/requirements-stage-closure-2026-10-03.md)にある。現在の基準mainは`7294112e39d8309d4ec43201953bbd706a92b325`（#2553統合後）。snapshot後の384候補のうち未記録だった4件は[末尾4件のPO判断](decisions/po-decision-2026-10-03-pending4-bun.md)で対象revisionを固定しました。OS132は003へ訂正し、HELIXの開発・実行・検証・配布でBunを今後も使わない保証を加えます。以下は本判断記録がmainへ統合された時点で有効となる分類です。固定snapshotのHARNESS-088保留表示は誤記であり、下記の判断記録に従って現在一覧を訂正します。

8機構のMPR latest requirement-candidate identityは384件。台帳の物理行は候補数を表さず、source holding・候補の履歴revision・参照訂正を含む。legacy IR 153件も別の母集団である。

## 台帳行数と要求候補数の読み分け

要求段階終了資料の「物理714行」は、終了基準main `633bf12ea8f948db8ba3d6600179c4a9507377a7`での値として保存する。参照訂正後のmain `0c693b271bae23eb9c7cb7c65f79c9c155c18103`では台帳は1,075行であり、#2556の264行と#2557の97行は参照訂正の後継revision追記で、要求候補の追加ではない。

#2559の訂正HEAD `70b04b870387a8ae6f5e736fc472b539943d693b`では、移動後locatorを指す`MPR-SH-OUTSIDE67-003`をさらに1行追記し、1,076行となる。この1行もsource holdingの参照訂正であり、要求の意味・採否を変更しない。3時点の台帳をidentityで照合した要求候補数はいずれも384件である。governance分割では同じholdingのsnapshot参照を`MPR-SH-OUTSIDE67-004`の後継1行で移動先へ訂正するため、本整理後は1,077行となる。これも候補追加ではなく、要求候補384件は変わらない。時点の終了資料は書き換えず、現在の行数と状態は[登録台帳](management-provisional-requirement-register.jsonl)を読む。


| 機構 | latest候補 | 採択 | 保留 | 現revision不採択 | 判断未記録 |
|---|---:|---:|---:|---:|---:|
| HELIX-HARNESS | 71 | 68 | 2 | 1 | 0 |
| HELIX-OS | 74 | 69 | 3 | 2 | 0 |
| HELIX-BRAIN | 43 | 43 | 0 | 0 | 0 |
| HELIX-LABO | 64 | 64 | 0 | 0 | 0 |
| HELIX-INTELLIGENCE | 62 | 60 | 0 | 2 | 0 |
| HELIX-SECURITY | 35 | 35 | 0 | 0 | 0 |
| HELIX-INFRASTRUCTURE | 26 | 26 | 0 | 0 | 0 |
| HELIX-CONNECT | 9 | 9 | 0 | 0 | 0 |
| **合計** | **384** | **374** | **5** | **5** | **0** |

## 末尾4件の判断記録

[今回の判断記録](decisions/po-decision-2026-10-03-pending4-bun.md)はHARNESS067002、OS125002、OS131002、および訂正OS132003のexact L2/L11を採択対象にします。OS132002は履歴として保持し、003の恒久不使用保証へ旧承認を継承せず今回の明示判断を結びます。原資料管理はOS、振る舞いの意味はHARNESS、125/131の適用対象は選択Worker操作のままです。

技術方式、内部契約、閾値、fixtureは今回の判断に含めません。旧sourceの技術詳細はreceiptの下流材料として保持し、source holdingと正式successorは解除しません。

IR153件の[route locator projection](audits/requirements-stage/ir153-destination-projection-2026-10-03.md)では153/153行に行き先があり、未割当は0件です。これは参照先の有無だけを示します。[要求粒度の限定照合追補](audits/requirements-stage/ir153-requirements-bounded-join-2026-10-03.json)では既存receiptと監査を153行へ接続し、具体不足だけを補完しています。BR01、BR09、BR16、FR11〜13、FR40、FR44、NFR07の9行は利用者要望と確認の粒度で追補し、引用を現行本文と照合しました。他の行のgenericな親引用を直接保証の証明とは数えません。BR09は採択済みHARNESS-047/054、NFR07は採択済みHARNESS-035の計測追補で利用者保証を確認しました。作成側照合では新しい要求欠落を確定しませんでした。限定照合追補は#2553のexact HEAD `1b7dee67c043b73eda90ff7a04c6bb4deeda9069` をClaudeが独立reviewし、F1/F2訂正後の指摘0件で統合済みです。全153行の全条件再監査やL3以下の完成を要求整理の終了条件には加えません。4件のPO判断は今回の記録に固定しました。固定projectionのHIL-BR-19の002 locatorは履歴であり、現在は同じidentityの003と今回の判断記録へ接続します。

## 既決採否の訂正（HARNESS-088）

`MPR-RC-HARNESS-L2-088-001` は[追加10件の判断記録](decisions/po-decision-2026-10-03-additions10.md:46)で採択済みです。機能比較はHARNESS、source authorityの観測・来歴管理はOS（配置A）、明示選択したsourceへ再利用する範囲（適用範囲B）です。今回の旧資産照合では指定された現行HELIX・ZIP・前身repository exact 2件の全sourceを保持し、全利用案件へその4 sourceを必須にしません。旧routing訂正とsource holding解除は別であり、この採択から生成しません。

固定snapshotの保留表示から、同候補を再びPO判断待ちにしません。OS-129-002も同じ判断記録42行で採択済みであり、保留表示を訂正します。主Workerを含む明示選択されたruntime一般（適用範囲B）に、上限到達を無視せず保留または代替runtime提案へ退避する内容Aを適用します。代替案から自動切替・実行許可を生成しません。HAC-23cの別条件の保留を候補全体の保留へ広げません。現在集計は本記録統合後に採択374・保留5・現revision不採択5・判断未記録0です。元の固定snapshotは当時の照合証拠として残します。

## 締めで確認する粒度

旧工程文書[ユーザー視点の要望とシステム仕様の区別](../../archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:101)と[AP-6](../../archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:262)を起点に、旧要望・配置・意味を変える適用範囲・利用者確認だけを既存receiptと監査から限定照合します。要求段階にシステム仕様を混ぜない点を保持し、登録済み候補は作り直しません。技術詳細の未確認はL3以下の材料として参照を残し、その完成を要求段階の終了条件に加えません。


## 要求整理の終了確認

8機構のL1固定・L2/L11合意は[作業入口](new-generation-start-here.md)の2026-09-28判断一覧を起点にし、後続候補のexact採否を各判断記録へ結びます。今回の記録が統合された場合、latest384件は採択374・保留5・現revision不採択5に全件振り分けられ、IR153は行き先153・未割当0です。保留5件の解除や不採択5件の作り直しを終了条件に加えません。

終了確認の範囲は利用者要望・配置・意味scope・人の確認と行き先の整理です。既存receipt/監査の限定joinと#2553の独立reviewを証拠にし、全原文条件・consumerの再監査、旧source回収完了、L3以下の完成は主張しません。本PRの独立review・統合・read-afterを閉じてから要求整理完了を報告します。L3承認・実装許可・releaseは別の境界です。
