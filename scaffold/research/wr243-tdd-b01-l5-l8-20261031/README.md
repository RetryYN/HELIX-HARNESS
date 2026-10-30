# WR243 HARNESS-015 B01 L5/L8候補

## 状態と範囲

- Issue #3510、依頼 `WR243-TDD-F03F04B01-L5L8`
- base `988765e9be335f2a1d376721c1b11f808fd03372`、実作業開始時の最新main `e0438a372065626ea752c31dc6c86b92d3198a9d`
- 対象は HARNESS-015 B01 のL5/L8候補だけ。L4/L9は編集しない。
- 固定blindは別担当が比較前に固定した共有artifact SHA-256 `846907d5802170ed775fbf08664c0b85f42e7b6ac0a9623e8584452f81ead813`、Issue #3510 comment 6534177643。固定bytesを書き換えない。
- 状態は `authority_effect=none` の候補で、承認・実行・formal oracle・受入・4way成立を示さない。

## 比較と候補境界

[`comparison.json`](comparison.json) は固定blindの二条件をL3 `/requirements/7`、L10 `/cases/7` と許可されたL4 behavior/output/failure proseへ結び、既存L4/L9の4負例を全行記録する。各L4/L9行のconditionは一致する。source-only条件1は `os_only` と `cheap_quality_failure`、条件2は `omission_erased` と `metric_as_accepted` と意味上比較した。これはmany-to-oneの候補比較であり、row oracle割当ではない。既存code/axis/state/owner/effectは比較資料だけである。

L5には日本語の2条件だけをcandidateとして記録した。L8候補の `target_ref` はL5契約 `HARNESS-L5-015-B01`、L9 row pointerは別の `source_trace_ref`。契約oracleはL10 B01。各U-IDのrow oracleとtest citationは見つからず、作成していない。現行`docs/helix-harness`にL7 test-design文書はなく、`HARNESS-L9-015-B01-*`／`HARNESS-L10-015-B01`のtest-source検索（現行*.py/*.ts/*.js、archive除外）でもcitation対象を見つけなかった。L8へfixture、seed、COPY、全返却、hashを追加していない。canonical L8 ID/rowsとF03/F04の証拠は保持する。

## 旧HELIXと同種の失敗

- `LEGACY-ASSET-5E22432B0A5A8F7CC8B3`（旧 `root/docs/governance/ddd-tdd-rules.md:3-6`）は契約先行・検証契約・1 behavior contract/1 ownerを起点にする。旧規則を実行・複製せず、現行L3/L10とL4許可proseから意味を再導出した。
- `LEGACY-ASSET-BD0E4DCE9725CA3612B2`（旧 `root/docs/plans/PLAN-REVERSE-28-red-first-tdd-evidence.md:step 1`）はRed-first evidenceが機械的に強制されなかった失敗。これは履行証拠と候補expectationを混同しない根拠として参照した。
- 現行の同種失敗として、PR #3759 R1-m1のL3義務要素欠落とPR #3835 R1のcasewise重複・checker粒度誤りをQA定義 §2.3が記録する。これらはB01の個別operator/quality意味を追加しない。

## 検証

`validate_b01_candidate.py` は固定blind SHA、L3/L10 source record、L4/L9全行比較、L5/L8対象ref、欠落oracle/citation、F03/F04保持、L4/L9不変を静的に確認する。F03 validatorはcf312403 mergeのGit blobからL5/L8 raw SHAを厳密検証する。F04 validatorはe0438a3 mergeのL5/L8 raw SHAとGit blob OIDをGit objectへ照合し、F03/F04 candidate本体の不変を確認する。0204の旧L5 pin a7fd79… at cf312403、0208の旧L5 pin b4b120… at e0438a3を履歴として残した。新世代checkerはdocument pair/static checksに限定。旧runtime/test/CI、L4 algorithm、新旧test/CIは実行しない。実測結果は `verification-summary.json` に記録する。
