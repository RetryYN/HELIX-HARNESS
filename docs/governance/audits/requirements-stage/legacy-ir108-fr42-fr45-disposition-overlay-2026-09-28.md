# REG-06 HIL-FR-42／45の有効分類overlay

基準mainは `d6cc00f21efcc1e3b8eb2a9cb9e6ef0ebfeaba03`（PR #2275 merge後）。機械可読なappend-only overlayは[JSON](legacy-ir108-fr42-fr45-disposition-overlay-2026-09-28.json)である。authorityへの効果はなく、既存matrixやcarry-forward台帳は編集しない。

## 適用条件

overlayを有効にするのは、matrix SHA-256、matrix pointer、ID、旧source path・行・行SHAがすべて一致するときだけである。一つでも一致しなければ有効分類を出さず、該当rowをunresolvedとして集計を停止する。matrixのsnapshot値へfallbackしない。

置き換えるmatrix fieldは `dispositions` と `remaining_condition` の2項目だけである。他のfield（`current_target_ids`、`recheck_conclusion`、evidence列等）はmatrix内の記録として残るが、本overlayでは再検証せず、有効根拠へ昇格させない。matrix本体は不変である。

## 固定根拠

- Matrix: `legacy-ir108-disposition-matrix-2026-09-28.json`、snapshot baseline `559ae3ba4bfe660d666a57f227466d7dcdd440d9`、本文SHA-256 `0e26f66e4d593f7f710e17b8c2349dffd5849467f208fc5fbdda635e31dd224d`。対象pointerはHIL-FR-42が `/items/46`、HIL-FR-45が `/items/48`。双方のsnapshotは `adopted_meaning`／`remaining_condition: null`。
- 旧要求文書はasset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、archive path `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`、file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。HIL-FR-42の132行SHAは `346e683c5f9c58018a57c29e652b84b79612466a24a3df6124d271ac0ddeddb8`、HIL-FR-45の135行SHAは `618f08eec7918d50938b2b09914da9be34524d5f9662b5bdfd1dfa43aed4b871`。
- 旧Requirements IRはasset `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、archive path `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json`、file SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。JSON pointersは `/HIL-FR-42` と `/HIL-FR-45`。
- 条件照合は[PR #2275でmergeされた監査](legacy-ir108-fr42-fr45-condition-correction-2026-09-28.md)に基づく。audit file SHA-256は `912ecbd83a8be83669a3524a892414b9ace2ece832ffa01f9c7e5c39703ec5ad`。Claudeの再reviewはexact HEAD `d2325c6143afcda466760620e4b6e179a9c627a4`を読み、新規finding 0件と記録した（[review comment](https://github.com/RetryYN/HELIX-HARNESS/pull/2275#issuecomment-5871765096)）。

## 有効分類

- **HIL-FR-42:** 採択済みのHARNESS条件は要求変更の設計・test影響、template設計義務、traceと差戻しを扱う。OS条件はsource atomのno-lossとtemplate義務・N/A・Backflow・消込追跡を扱う。残差は、未消込・孤児・placeholder・根拠のないN/A・aggregate一括消込が1件でもあればpair-freezeを拒否する明示gateである。要求PRのsource-atom gateを設計義務のpair-freeze gateとして数えない。
- **HIL-FR-45:** 採択済みOS条件はidentity/revision・source・authority・digest・relation/state、全source atomの行先、no-loss、stale/digest拒否、人間decision境界を扱う。残差は、split/merge/rename/supersede/reject/N/Aの適用operationを識別し、そのoperationに対応するbefore/after両semantic digestをoperation固有receiptに束縛してから適用する条件に限る。一般no-loss、stale、authority条件をoperation固有receiptへ重ねて要求しない。

各項目の採択済み部分と残差、全matrix target IDの条件別確認、未採択類似候補の範囲はJSONに記録した。HARNESS-L2-041、044はそれぞれ別source由来の未採択候補であり、HIL-FR-42の後継・coverageではない。

## authority境界と検証

両IR要求は `preserved_pending_rehome` のままで、formal successorは未割当である。POによる採択、要求意味変更／retire、受入実行、実装・配布許可、要求段階完了を主張しない。JSON内 `static_assertions` はID、pointer、digest、snapshot、authority境界の静的照合を記録する。旧runtime・test・CIは実行していない。

このoverlayは二つのmatrix rowだけに適用する。IR108全体のsource closure、未対応0、残差総数へ一般化しない。
