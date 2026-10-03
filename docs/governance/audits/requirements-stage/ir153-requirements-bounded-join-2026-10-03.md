# 要求段階の限定照合追補（2026-10-03）

基準main: `28baa6e7c36a1cfbf6117d0bc43d7e917ac5f3ea`。旧IR153件の行き先は153件、未割当0件。今回は既存receipt・監査を限定joinし、具体不足だけを要求粒度で補完した。登録済み候補・要求本文を作り直していない。根拠と旧原文参照は[JSON](ir153-requirements-bounded-join-2026-10-03.json)にある。

## 利用者の要望と確認で補完した箇所

| 旧ID | 保持する利用者保証 | 現行の置き場 | 下流へ残す材料 |
|---|---|---|---|
| BR09 | 工程・taskに必要な専門Worker契約を特定runtimeに依存せず生成し、実割当と分けて確認する | HARNESS-047/054、OSの割当・projection | 旧teamの構造、layer×drive表、provider固有射影方式 |
| BR16 | 変更対象の必要検証を満たしてから進み、古い対象の合格を流用しない | HARNESS-005、OS-020。動的CIの既決方針を保持 | 旧固定3段構成・SHA/tree lineage・predecessor binding |
| FR11 | task/domainに合う能力と適用範囲を確認する | INTELLIGENCE-001/002/010、OS-018 | catalogの各field、生成定義の構造 |
| FR12 | agent操作が許可範囲を越えず、逸脱や不明を成功としない | OS-018、INTELLIGENCE-002/014。OS-131は未採択補強候補として区別 | adapter生成・drift検査・内部schema |
| FR13 | 適したWorker配置案と、作成から独立したreviewを確認する | INTELLIGENCE-010、OS-018、HARNESS-047 | 2段選択algorithm・TeamDefinition |
| FR40 | 設計objectの役割と、rename後も対象・検証の同一性が分かる | HARNESS-048、BRAIN-031 | catalog属性schema・edge実装方式 |
| FR44 | templateで表現できない義務を改善候補として示し、評価前に強制反映しない | HARNESS-084/009、BRAIN-007/009 | shadow比較・計量・migration・promotion手順 |
| NFR07 | 機能数だけでなく複雑さ・公開面・運用負債を測り、受入への寄与と最小必要性を確認する | HARNESS-035の採択済み計測追補 | 方法・数式・閾値。旧原文にない数値は補わない |

他の行は既存監査・receiptの限定根拠を使う。genericな親行引用は直接保証の証明ではない。作成側の照合では新しい要望欠落を確定しなかったが、これは独立review結果ではない。旧source全条件のcoverage、正式successor、consumer閉包、実行済み受入を完了としない。

## 既決採否の表示訂正

固定snapshotが保留と表示したHARNESS-088-001とOS-129-002は、[追加10件の判断](../../decisions/po-decision-2026-10-03-additions10.md:42)で採択済み。旧routing訂正およびHAC-23cの別条件の保留を、候補全体へ広げた分類誤記を直す。判断記録を変更しない。現在は384候補＝採択370・保留5・現revision不採択5・判断未記録4（物理register713行）。

## 残るPO判断と終点

判断未記録はHARNESS-067-002、OS-125-002、OS-131-002、OS-132-002。原文・配置・意味を変える適用範囲・推奨は[現在一覧](../../requirements-stage-closure.md)と、そこから参照する固定判断材料へ接続する。既決の保留5件は振分け済みで、保留解除を要求整理の終了条件にしない。

8機構のL2/L11合意と登録候補すべての採用・保留・不採用への振分けが終点。AC、機械契約、依存tuple、schema、fixture、WBSの完成やL3承認はこの終点に加えない。
