# IR153 HIL-FR-21〜25 現行条件照合

- 基準: `origin/main` exact commit `68e1e3ad54d7d4e29762a39b8ef5c590cb789d9d`。
- 範囲: 5つの旧IR identityのみ。HIL-09/10/11全契約、IR153全行、requirements-stage closureは判定しない。
- 旧L1: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`、SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。旧requirements IR file SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- latest read-after current file SHA: OS L2 `20bc628a1b46ec9c31537d7b6f05d7535827daaf2e6ed6491544ecff04fb854f`; OS L11 `e287f7ac2e82bbd7bca2a2ac1af6f263a5fe348fc6e70f29d7bc7c3c3e1d0c34`; HARNESS L2 `96a044491b0d8a8f45833a048753f89fc76966824a825982303ecc50e821ec2e`; HARNESS L11 `a286d3f9e813571485ebb7b1a9dcdd7afae996180a3d2f6c6463d2ea98f96be3`.
- hash方法: 旧L1 physical line hashはLFを除外。候補/採択section hashはheadingから次の同階層以上のheading直前まで、末尾空行を削除しLF一つで終える。
- 旧HAC/HATはfailure/acceptance設計条件として読んだ。runtime、CLI、hook、test、CIは実行していない。

## current authority / exact pair

採否はmetadataや見出しのcandidate表記ではなくdecisionと固定revisionから確認した。OS-015/016は2026-09-28 PO decisionの固定f6dad2a L2/L11 pairに含まれる。OS-033は2026-09-29 57候補判断row56で採択され、固定section digestはL2 `580778c8ef3c0e4c4676d13de203c821f990893e9aa078d8d1d2f0b8901d2dbc`、L11 `1d30394888b3bded49f8e517d7e0888a25130e123df945adf69c7db5588571b1`。現在本文のsection digestも同値。HARNESS-038は同decision row43で採択され、L2/L11固定section digest `dd5b5450801617bbd6cc1dfd2e522420399ec58fb7675a286221dd0d9415767c` / `dfa3b4c245af3987ee7738cc4a3aa758bb8f113b9d06079362d978ff63731297`。現在も同値。

OS-112は行1391以降の未採択候補で、MPR row642 `MPR-RC-HELIXOS-L2-112-001`、`authority_effect:none`。L2/L11 section digestsは`6bfc4a...` / `3796ec...`、full current file SHAは上記OS file pinと一致。親OS L1が採択済みであることは112の採択ではない。112のMPR atom setは4 IR identity（BR-15、FR-23、FR-24、NFR-17）で、HR/HAC/HAT supplementary sourcesは別holdingのまま。

## 個別条件

| ID / source pin | 条件ごとの現行対応 | 静的oracleと未充足境界 |
|---|---|---|
| **FR21** L1:111, line SHA `844dee51d5ca37917ee497c78045c2633eef0b08d6427bfc7dfcd3a805efc40f`; IR statement `f25bd049...`; record `a79bd082...` | OS-015はsource identity/revision/digest/authority、015 L11は不一致・欠落・staleを拒否。OS-016は対象要求と関係先のtrace/unknown/stale。採択HARNESS-038は選択manifestのcapability identity、分母、双方向join。ただしHIL-09のZIP+exact 2 repo、A/B advertisement、全ref→object/tree/entry、sealed mirror receipt、receipt由来ref/content/edge分母やsource/extractor driftを収集・stale化する固有capture contractではない。 | 正常時に3 source classと全authority/content/edgeがrevision-bound manifest、receipt由来分母へ結合される必要がある。remote identity/advertisement/namespace/source set/extractor drift後に旧snapshot/atomization/coverageをcurrent扱いしない。既存本文は一般source custody/closureを保持するが、HIL-09固有の実capture receipt/acceptanceは確認なし。`HAC-09a/b/c`, `HAT-09`は設計のみ。|
| **FR22** L1:112, line SHA `a25967dc2a741b6a422e72e8588a805b3fedb67a11ce3f6faf6231c37a159291`; IR statement `9d401a7...`; record `05ec985...` | 採択HARNESS-038の選択scopeに対する一意capability、disposition、根拠、要求/設計/verificationの双方向join、aggregate-only/orphan等の拒否が条件として対応する。OS-016はtrace状態を補うが個別dispositionではない。 | pending、根拠なしreject、orphan、multi-ID一括passのいずれか1件でpair-freezeを拒否する。038の採択は内容oracleでありHIL-09に対する実 ledger/receiptやformal successor割当ではない。|
| **FR23** L1:113, line SHA `85a92638e7c8e010055e880609ea9c634e205df5c61f0e80bdea3fbc9be68c92`; IR statement `641f78a...`; record `62ae71...` | 未採択OS-112はsource type、connector/schema version、credential reference、classification/read-write policy/sync/owner/enabled stateをregistryへ置き、enable/disable receiptとcredential値非保存を要求する。FR23 atomは112 MPR/receiptへ含まれる。採択015/general source recordだけではこのproduct-data meaningは定義されない。 | 正常receiptはselected contract/scope/digest/revision/owner/既存authorityを結ぶ。secret保存、authority/contract stale/unknown、scope外の変更を拒否。112の静的oracleはsource条件に対応する提案だが未採択、未実行、formal successor未確定。|
| **FR24** L1:114, line SHA `a61697f41088818ddbb852fe274453666708c8467ce3d60a538203140bbc91d4`; IR statement `b021ff4...`; record `3af36f...` | 未採択OS-112はselected full/incremental mode、snapshot/cursor/watermark、source record→canonical entity→selected consumer mapping、lineage/freshness/redaction、idempotency、tombstone/schema drift oracleを具体化する。採択HARNESS-038は本文でFR24のingestion/canonicalizationを対象外と明記する。 | schema drift/cursor regression/partial/unknown lineageではcurrent/watermarkを進めない。explicit tombstoneはmapping stale、incremental omissionは削除でない。実read/snapshot/watermark/mapping receiptは未確認。candidateの採否、owner/product scope/consumer集合/版決定は未了。|
| **FR25** L1:115, line SHA `c28b208b2be946d06c8b068c1e7ae13123e68be2630864af5a2f586edc4601d9`; IR statement `36c4ed5...`; record `8fb7a5e...` | 採択OS-033は選択scopeのengine capability（build/agent metadata/assignment/schedule/trace/impact等）をidentity/owner/version/config/compatibilityで分離し、snapshotごとのrun/artifact/output digest/exit statusとsame input rerunを比較する。旧ZIP implementation formは現行必須でない。L11 negative oracleはunknown/mismatch/partial/provenance欠落を拒否、rerun差異をquarantineする。| 条件は採択033のselected-scope契約に対応。MPR/decision atomはFR25/26及びHR/AC/HAT-HIL-10の7行で、NFR-13は明示的scope外。HIL-FR-25 carry-forward row58はsuccessor空、pending。採択はruntime/HAT acceptance、旧source holding解除、親HR全体closureではない。|

## HIL-family oracle / pending source

- FR21/22: old `HR-FR-HIL-09`, `HAC-HIL-09a/b/c`, `HAT-HIL-09`; prior detailed oracle/census evidence in `hil09-auxiliary-source-receipt-condition-audit-2026-10-01.md`.
- FR23/24: old `HR-FR-HIL-11`, `HAC-HIL-11a/b/c`, `HAT-HIL-11`; detailed projection/failure boundary in `hil11-auxiliary-product-data-projection-audit-2026-10-01.md`.
- FR25: old `HR-FR-HIL-10`, `HAC-HIL-10a/b/c`, `HAT-HIL-10`; replay/failure scope in `hil10-auxiliary-engine-detector-replay-condition-audit-2026-10-01.md`.
- Carry-forward rows 54–58 (`legacy-requirement-carry-forward.jsonl`) are `preserved_pending_rehome`; each retains no successor ID and no decision record. No source holding is cleared here. Candidate/proposal and adopted pair are separate status axes.
- Current receipt-level HIL-09 capture, Product Data actual read, engine rerun, or old HAT execution evidence was not found/claimed. This is not a claim that a runtime implementation is required at requirement stage.

## 静的検証範囲

旧L1原文、requirements IRの5 records、carry-forward rows、現行候補/採択section、PO decisions、MPR register rowを読んでsource IDs・statement/record digests・section/current full-file SHAを照合した。旧execution系は一切実行していない。JSONは同名ファイルに5件すべての原文/行SHA/現行条件比較を記録する。
