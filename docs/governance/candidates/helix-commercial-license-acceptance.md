# HELIX全体の商用ライセンス受入候補

状態: draft candidate。L3の[要求候補](helix-commercial-license-requirements.md)と対にするL10候補。
以下は必要な検証の定義であり、実行済みのテスト結果ではない。

| ID | 対象 | 合格条件と反例 |
| --- | --- | --- |
| CL-AC-01 | CL-R-01 | 本体、Module/Slice、Bundle、Lite/Full、CLI、文書、スキル、学習資産を全件分類する。将来Web/APIの適用方針も追跡する。Liteだけの台帳、未所属・二重所有を見逃さない |
| CL-AC-02 | CL-R-02 | 通常有償と明示評価を区別できる。評価対象・期限・用途の欠落から無償許諾を導出しない |
| CL-AC-03 | CL-R-03 | 通常内部利用の契約からOEM、再配布、SaaS提供権を誤って導出する反例を拒否する |
| CL-AC-04 | CL-R-04 | HELIXで生成した利用者アプリをRetryYN所有とする反例、同梱HELIX/Package/Release Pack/Geneを利用者へ所有権移転したとする反例、Gene化で利用者データを無許可再利用する反例を拒否する。由来未確認と第三者通知欠落を個別検出し、第三者条件を独自商用条件で相殺しない |
| CL-AC-05 | CL-R-05 | wrong HEAD、wrong license digest、exact set混入を個別に検出する。既存MIT版が新有償版として再解釈されない |
| CL-AC-06 | CL-R-06 | 配布artifact内LICENSE/metadata/README/manifest/通知と配布先をread-after照合する。有償限定版のOSS/AGPL表示を検出する |
| CL-AC-07 | CL-R-07 | 同じ契約を参照する複数Moduleを重複契約として数えない。契約改版とengine改版を混同せず、影響対象だけを追跡できる |
| CL-AC-08 | CL-R-08 | 権利未確認の対象assetは発効・publish不可となり、独立した既存開発テストは継続できる。全repo停止で代用しない |
| CL-AC-09 | CL-R-09 | clean consumer install/upgrade/rollbackで各artifact digestと許諾版が一致する。旧版へのrollbackで新契約を捏造しない |
| CL-AC-10 | CL-R-10 | 最終条文・権利者・開始版・公開承認が欠ける場合、発効済みと表示しない。候補mergeと配布完了を分離する |

## 任意紹介の確認

紹介依頼を断る・表示を削除する場合でも利用条件が変わらず、生成アプリに自動挿入されないことを確認する。
紹介依頼への同意を、顧客名・画面・導入事例の公開許可へ転用する反例を拒否する。

## L12運用確認

実配布後に、契約と提供された機能範囲、更新時の告知、既存版の許諾保存、問い合わせ先を確認する。
契約情報の収集を理由にcredentialや個人情報を公開receiptへ出力しない。

## 現時点の検証範囲

本PRで確認するのは要求10件と受入10件の対応、参照解決、現行LICENSEを無断変更していないこと。
権利棚卸し、実契約、consumer E2E、発効・公開は後続であり未完了。
