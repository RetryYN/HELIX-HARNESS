# 要求段階の現在状況

PO候補一覧は[2026-10-03の固定snapshot](audits/requirements-stage/requirements-stage-closure-2026-10-03.md)にある。現在の基準mainは`28baa6e7c36a1cfbf6117d0bc43d7e917ac5f3ea`（#2552統合後）。snapshotの383候補に未採択OS132-002が加わり、未決PO判断は4件です。既存採否のjoinとfixed-pair pin照合を保持し、要求段階の完了は示しません。固定snapshotのHARNESS-088保留表示は誤記であり、下記の判断記録に従って現在一覧を訂正します。

8機構のMPR latest requirement-candidate identityは384件。MPR物理713行、履歴revision、legacy IR 153件とは分母を分ける。

| 機構 | latest候補 | 採択 | 保留 | 現revision不採択 | 判断未記録 |
|---|---:|---:|---:|---:|---:|
| HELIX-HARNESS | 71 | 67 | 2 | 1 | 1 |
| HELIX-OS | 74 | 66 | 3 | 2 | 3 |
| HELIX-BRAIN | 43 | 43 | 0 | 0 | 0 |
| HELIX-LABO | 64 | 64 | 0 | 0 | 0 |
| HELIX-INTELLIGENCE | 62 | 60 | 0 | 2 | 0 |
| HELIX-SECURITY | 35 | 35 | 0 | 0 | 0 |
| HELIX-INFRASTRUCTURE | 26 | 26 | 0 | 0 | 0 |
| HELIX-CONNECT | 9 | 9 | 0 | 0 | 0 |
| **合計** | **384** | **370** | **5** | **5** | **4** |

## PO判断が残る候補

- `HARNESS-L2-067-002`：利用者が選択したsource/read scopeのbehavior意味をHARNESS責務として置くか。OSは原資料の識別、authority、来歴を持ち続ける。
- `HELIXOS-L2-131-002`：宣言されたpack/agent使用Worker operationで、提案物だけでは権限が生じないという利用者保証。該当operationに限定し、通常operationへ広げない。
- `HELIXOS-L2-125-002`：一時backpressureだけでは失敗扱いせず、既存契約内で待機・再開して完全結果を上限・期限内に届ける。対象は選択Worker operationの結果受領。`-001`不採択は履歴で、`-002`へ継承しない。

技術方式、内部契約、閾値、fixtureはPO判断に含めない。採択済み候補のrevisionと適用条件はdecisionに固定され、一覧から再質問しない。legacy IR 153件の行き先表は別集団として追補する。


## 未採択の移行追補候補

OSの `MPR-RC-HELIXOS-L2-132-002`（HIL-BR-19）は、旧HELIXのBun依存撤去に対応するHELIX再構築の一回のrepository migrationで、activeな開発・実行・検証・配布surfaceすべてがBunなしで再現可能になったことを利用者が確認してから完了とする要望。配置はHELIX-OS、親はL1-005/007。候補はmainに統合済みですがPO判断は未記録です。`-132-001`とr1 receiptは履歴として保持し、sourceはpending、runtime・command等はr2 migration receiptに引き継ぐ。

IR153件の[route locator projection](audits/requirements-stage/ir153-destination-projection-2026-10-03.md)では153/153行に行き先があり、未割当は0件です。これは参照先の有無だけを示します。[要求粒度の限定照合追補](audits/requirements-stage/ir153-requirements-bounded-join-2026-10-03.json)では既存receiptと監査を153行へ接続し、具体不足だけを補完しています。BR01、BR09、BR16、FR11〜13、FR40、FR44、NFR07の9行は利用者要望と確認の粒度で追補し、引用を現行本文と照合しました。他の行のgenericな親引用を直接保証の証明とは数えません。BR09は採択済みHARNESS-047/054、NFR07は採択済みHARNESS-035の計測追補で利用者保証を確認しました。作成側照合では新しい要求欠落を確定しませんでした。独立reviewは未完了です。全153行の全条件再監査やL3以下の完成を要求整理の終了条件には加えません。4件のPO判断も未決です。4候補の原文・推奨・影響L2/L11・保留残件はsnapshotの判断材料表にあります。

## 既決採否の訂正（HARNESS-088）

`MPR-RC-HARNESS-L2-088-001` は[追加10件の判断記録](decisions/po-decision-2026-10-03-additions10.md:46)で採択済みです。機能比較はHARNESS、source authorityの観測・来歴管理はOS（配置A）、明示選択したsourceへ再利用する範囲（適用範囲B）です。今回の旧資産照合では指定された現行HELIX・ZIP・前身repository exact 2件の全sourceを保持し、全利用案件へその4 sourceを必須にしません。旧routing訂正とsource holding解除は別であり、この採択から生成しません。

固定snapshotの保留表示から、同候補を再びPO判断待ちにしません。OS-129-002も同じ判断記録42行で採択済みであり、保留表示を訂正します。主Workerを含む明示選択されたruntime一般（適用範囲B）に、上限到達を無視せず保留または代替runtime提案へ退避する内容Aを適用します。代替案から自動切替・実行許可を生成しません。HAC-23cの別条件の保留を候補全体の保留へ広げません。現在集計は採択370・保留5・現revision不採択5・判断未記録4です。元の固定snapshotは当時の照合証拠として残します。

## 締めで確認する粒度

旧工程文書[ユーザー視点の要望とシステム仕様の区別](../../archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:101)と[AP-6](../../archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:262)を起点に、旧要望・配置・意味を変える適用範囲・利用者確認だけを既存receiptと監査から限定照合します。要求段階にシステム仕様を混ぜない点を保持し、登録済み候補は作り直しません。技術詳細の未確認はL3以下の材料として参照を残し、その完成を要求段階の終了条件に加えません。
