# LABO Stage 5 parent 061 R12補強とR1/R3/R5再照合

- 現行mainの確認点: `ce70628e53ff5f78c1321accf57429c740ea585d`。
- 追加補強の作業基点: `d88801887`を含み、統合済みmainを取り込んだWT HEAD `a30d1c81fc7e22bee501c46e0e9a2b4ab125045d`。
- 対象はLABO Stage 5 parent061のみ。approval/authority/execution effectはない。固定親、旧source、本文だけの静的照合であり、実験・L10実行・旧runtime/test/CIは行っていない。
- この追補は先行するR4監査を変更せず、同監査の古い件数を今回時点へ読み替える補助記録である。

## 固定意味と自己検収

固定sourceは`318ec4a04abb3c1cc17111b3d939f913facd5fd3`。L2-061は457–469、L11-061は205–215。今回のR12はL11-061:213「旧runtimeは起動しない」に直接対応する。既存CASE83は当時runtime情報の欠落を扱うが、archive runtimeを再起動して履歴をreplayする要求を単独変異として拒否していなかった。追加CASE119は保存済みhistorical resultと当時source/revision/scopeを固定し、旧runtime replay要求だけを変異させる。oracleは起動拒否、歴史的記録の保持、replayを新規実測/current performance/比較成功へ読み替えないこと。

CASE-118を含むR4補強が固定059を拡張していないことも再照合した。固定L2-061:459は後発061を固定L2-059 revisionへ遡及適用しないと明記する。CASE-118は過去の状態を変えない境界をfixture化する。CASE-117はreceiptのみでcandidate採択を生成しない。固定L2-059の対象変更・採用・assignment等を追加せず、061の条件を059へ持ち込まない。

R5 locatorはFRの固定L2引用を`467–469`から`465–467`へ改めた。R1/R3はFVの現行実数を旧a4由来132 ID + CASE115–118 + CASE119 = 137 unique table rowsとして同期した。FVのnormal一覧に既存CASE24を加え、CASE102は通常Worker履歴という意味を維持したまま、選択task field-missing分母外の非適用対照と表示する。CASE102を選択taskのnegative分母やnormal fixture数へ混ぜない。

## 旧source起点

旧`LEGACY-ASSET-28FB139B26CD61CC51EE`のR04/R08（旧Bench評価要求）を、task snapshot、隔離、役割分離、当時条件を保持する意味再導出の起点として再読した。`LEGACY-ASSET-A952A3A175EB82A4781B`のAC005/006/012/013はpaired acceptance consumerとして読み、直接の要求authorityとは区別する。旧runtime、test、CIは参照・実行していない。固定sourceと旧sourceのfile/span SHAはJSONに記録した。

## 六本文と静的検証

六本文の修正前SHAは補足WT開始HEAD `a30d1c81fc7e22bee501c46e0e9a2b4ab125045d` の実blob bytesから、修正後SHAはこの作業treeの実bytesから算出し、同名JSONへ記録した。CASE ID/row件数、CASE115–119のAC、CASE24/102表示、FR locator、BR/BV範囲、NFR/NFRV count文言を静的照合する。先行R4 immutable監査はそのまま保持する。

## 残余分類記録の永続参照

CASE115–119/R1/R3/R5の確認起点にした `/tmp/root-labo-stage5-decision-residual-review-f0e210b3.md` と `.json` を、同一bytesの監査snapshotとしてこの監査と同じディレクトリへ保存した。JSON側の050固定親locatorも読み、`f6dad2a33e24f000b87d7f09b8d40288257e74cc` のL2:298–303/L11:120–126表記を確認した。snapshot本文は変更せず、今回以降の状態を追記・上書きしない。各ファイルのrepo相対path、byte数、SHA-256は同名JSONの`residual_classification_source_snapshot`に記録する。

authority_effect / approval_effect / execution_effect: `none`。
