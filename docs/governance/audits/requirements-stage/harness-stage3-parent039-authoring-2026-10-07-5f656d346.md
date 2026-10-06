# HARNESS Stage 3 親039 作成側補正・根拠pin候補

**状態:** 作成側の時点監査候補。canonical未保存。Rootのpin再計算・意味検収と独立reviewを待つ。承認、所見closure、Ready、merge admissionは生成しない。候補配置先は `docs/governance/audits/requirements-stage/harness-stage3-parent039-authoring-2026-10-07-5f656d346.json`。

本文revisionは `5f656d34659913103e317598bc48508db836b800`、authoring baseは `3795bf0dcb731231a0b5ca1faa3cb67bdfeda22a`、最新review baseは `286a938442f7ff9a05004478d7a25d0feedc34d8`、現在context HEADは `5531e5441f67c7a2bf5fc05fb22c03de0a242b6b`。6正本はreview baseがauthoring baseと同じbytesであり、本文revisionはその全bytesをprefixとして保持する。現在context HEADは本文revisionのbytesと一致する。変更対象は親039の6文書のみ。

## 固定sourceと旧source

- L2-039: `318ec4a` `product-requirements.md:891–929`。L11-039: `product-acceptance.md:638–676`。全文literal/raw-LF SHAはJSONに保存。
- PO57の `po-decision-2026-09-29-57candidates.md:44` は `MPR-RC-HARNESS-L2-039-003` と固定L2/L11 digestを採択。固定L2:893とL11:640は未採択と記すが、ここではPOの明示decisionを採択根拠として併記し、固定文書自体は変更していない。現在registerの004は同一candidate/source digestのlocator-only後継で、採択を撤回しない。
- 旧sourceは `LEGACY-ASSET-02319C2481B9E01698D5`、v1.3 `§4.5:265–277`、`§4.9:385–392`（DHR-001〜006と状態境界）、`650–660`。paired consumerはHAT-HIL-09/15、HST-HIL-011/012/018/024を指定spanで記録。HAT-15/HST-012/024はscreen applicability/prototype walkthrough関連、HAT-09/HST-011/018はsource/reverse closure関連であり、039 UX意味の直接証明には用いない。

## 対応所見と残余

- M6: `r03-all-devices` の一律全device総当たりを拒否し、risk/factor責務をL2-005へ戻す。
- m1: `implemented`のV-pair関係と`ux_verified`のL10–L12 evidence/human evaluationを区別。
- m3: FR AC-04で自己承認/採択/完了を拒否し、candidate形成は既存008/024に残す。
- m5: applicability/prototype→024、要求意味→008、design→026/025、verification/oracle→005/022、source意味/互換性→識別可能な選択source ownerへ原因別に返す。source identityが不明ならunknownを保つ。
- m19: 旧20組合せの完全ID索引を保持。未回答からの要求内容生成、source-backed candidateの採択、PoC仮説採択、requirement adoption/L3 freezeを別stateにする。索引・件数を意味完全性の証明にしない。
- M5: 固定L2:929/L11:676は適用性unknownや証拠scope/revision違いでUX完了を拒否する。既存fixtureは個々の軸状態・walkthrough scope/revisionを持つが全cross-productは独立fixture化していない。これを意味上の残余候補として記録し、列挙完全性だけを理由に追加CASEを強制しない。独立reviewによるclosureは主張しない。
- Rootの4行補正: AC-04を第3列に明示し、正常baseline→単独変異→固定oracleの列順に再整列。即時前の未commit worker snapshotはGit objectではないため、最終literal/raw-LF pinと処置だけを記録する。

## 静的確認

本文commitの親との差分に対する `git diff --check` は成功。旧CASE IDは134/134保持し、追加・削除0。全定義行は6列で、参照danglingは0、AC-01〜05を参照した。Rootが報告したgovcheck成功はJSON上でRoot報告と明記し、Workerが再実行したとはしていない。旧runtime/test/CI/Bunは実行していない。

全6本文SHA/suffix、旧134件と新134件のraw-LF literal/AC対応、固定親・PO・旧source/paired consumer span、正式review19全文、review方法変更comment全文、所見と最終CASE literalは対応JSONへ格納した。

## Root公開時点

本文全206行と4行補正をRead。限定source/body/formal30、旧/現CASE268、register/ledger7 pinを再計算し一致した。govcheck/diff check成功。上記候補時点記載は経緯として保持し、現在はこの監査を公開する。独立レビュー・承認・実測は未成立。

公開JSON SHA `e5440af9ab5b3d72ddfd5d1a0c14e8ecf48e9593459489e39525220eb6e44816`。
