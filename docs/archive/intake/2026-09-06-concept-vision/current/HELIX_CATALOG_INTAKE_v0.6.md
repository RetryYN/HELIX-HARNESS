# HELIX v0.6 文書・提供構成の取込指示

## 目的
利用者向けPackageは開発責務に限定する。基盤も必要最小限の開発用契約だけを含め、HELIX全体統治・自己計測・改善・学習・機構創出・公開工場・世代認定は内部管理へ分離する。非配布は削除や版管理放棄ではない。

## 既存正本との接続
本資料は文書上の切出し案。既存#1074／#1494／#1073、全体整合の#1500、対応する要求／設計／品質／安全／OPS ownerへ差分を返す。これらのIssue状態は本版で再取得していない。Module/Slice/Bundleの正本、primary ownership、L1〜L12、独立review、既存安全・承認境界を変えない。

## 整備内容
1. 旧46成果のID・元文言と、325 native node・295 relation・35局所Gate・29受渡しを保持し、開発Package／開発部分のみ抽出／基盤のみ／内部保全へ全件対応する。
2. PKG-D01〜13を利用者の責務・成果・入口／出口・停止／再開・必要基盤・除外・更新／撤去の提供viewとして扱う。これは新runtime enum、別registry、別DB、別builder、別writerを増やす指示ではない。
3. Packageから既存Moduleの所有Sliceを選択する。既存Bundleが同じ公開実体ならその公開versionへ束縛し、二重のPackage版を新設しない。Profile設定版は公開版へ流用しない。Lite／Fullは選択済み開発機能の組合せで、全repoや成長機構の配布ではない。
4. DF01〜09は必要契約の検討索引。全てを必須依存にせず、利用者scope・実入口・依存閉包に基づき選択する。未所属機能をhelix-coreへ押し込まない。
5. RG09-01は供給許可済み対象knowledgeの読取り、RG16-02は対象製品runtime更新だけを抽出。一般の品質計測・CI観測・運用観測は残す。System Synthesisはnative familyを保持し、対象製品の設計／refactorだけ提供する。
6. RG10のHELIX制作・公開工場と、PKG-D09の対象製品Releaseを別にする。汎用adapter未検収を残し、HELIX／DevOS専用機能を単なるrenameで公開しない。

## 正式な提供単位を確定する順
対象の既存authority・owner照合 → 入出力と独立成果 → 正式Slice対応 → 必要／任意／競合依存と除外 → consumer入口・構成lock → static検査・独立品質／安全・更新／rollback／撤去 → version・artifact・receipt束縛 → 別途認可された公開。

全体成長や全Package完成を一律に待たない。必要な安全・authority・consumer検収は省略しない。意味変更は影響範囲の既存要求改版へ、表示だけの修正は文書差分へ分ける。全件再freeze、既存承認の創作・取消はしない。

## 必須の受入
- 旧ID・成果の欠落／二重所有がない。
- 品質判定、安全許可、出力受理、親受入、統合、公開、配備を分ける。
- 実際のimport／hook／設定／timer／DB／worker入口まで依存閉包を確認し、内部成長runtimeへの必須依存を持ち込まない。
- 成長機構を未導入・停止にしたconsumerで、必要な現行権限を守り通常開発が続く。
- 不足する必須安全・証拠は該当行為だけ止める。unknownを成功・空集合へ変換しない。
- Package成果と内部raw経験・credentials・承認履歴・hidden oracleを混在させない。
- 公開version・配布path・canonical Sliceが未確定なら未確定として表示する。

## 非対象
今回の資料取込だけによるコード移動・削除、所有権移管、成長機構の除去、新サービスの増設、runtime schemaの無承認変更、tag／publish／DevOS cutover／production apply。HELIXWebや新学習engineは実装しない。
