# LABO Stage 5 parent 063 残余修正の時点監査

- 対象base: `f0e210b3cdf5c1f95dfcf07cfc3504a240dd2e4d`
- Branch: `codex/labo-stage5-063-ac03-revision-repair`
- 取り込み後base: `a00711ee8a0817cf6553b8a671a0abee54ce6e73`。f0e以後のmain差分はOS Stage3の別scopeであり、LABO Stage5本文6件への外部差分はなかった。監査のreviewed baseは当初の `f0e210b3...` のまま保持する。
- authority effect: `none`。本記録は要求承認、実行許可、L10実行、gateを生成しない。
- 旧P4-02要件、paired consumer HAT-P4-02、HMC-BR-003を読み、固定L2/L11を起点にした。旧sourceの保存差分と全file/span SHAは同名JSONに記録する。

## 修正範囲

- FRにLABO-063-AC-01/02/03を定義し、固定親の入力、循環、版、戻し先、knowledge/authority境界を接続した。crosswalkのL2/L11 locatorを実行と一致させた。AC-02の規範fixtureはCASE02/68、AC-03はCASE03a–d/04a–b/06/08/09/11–66。CASE12/27/40/59は各行が示すAC-03の補助negative例で、AC-02の規範IDとして重ねていない。CASE68はAC-02のみ。
- FV CASE03bは `repair-result evidence record.target_revision`のみを変異させ、観測提供主体への返却とLABO評価未完を分けた。適用条件revision変更はこのCASEに混ぜない。
- FV CASE04bはHMC-BR-003に基づき1.0の知識評価/保持をLABOへ明示する。
- FV CASE66/67/68: 単一green拒否、source-bound synthetic positive full lineage、過去評価だけで新規repairを要求しない境界を補った。
- BR/BV/NFR/NFRVとFR/FVの6本文にID、AC、件数を反映。正常候補は01/02/05/07/10/67、negative候補55、索引11、合計72。いずれも設計fixture候補で実測ではない。

## 固定source

- 固定L2: `318ec4a04abb3c1cc17111b3d939f913facd5fd3` `labo-requirements.md:480–489`（input 483、引継ぎ484、反復485、候補/warning486、依存487、戻し先488）。
- 固定L11: 同revision `labo-acceptance.md:225–231`（正常系譜228、個別反例229、未見/再評価230、knowledge/authority境界231）。
- 旧直接source `LEGACY-ASSET-EE5DBACC7F28F7D1F605`: P4-02 HR-FR-P4-02/HAC-P4-02a/b。baseline 6fabd125… rows149,230–231; pre-isolation 2d499104… rows155,239–240; selected atoms are byte-identical.
- Paired acceptance `LEGACY-ASSET-44DD86E3DEC09E65EF51`: HAT-P4-02 at `L3-pillar-acceptance-test-design.md:112`.
- HMC-BR-003: `concept-requirement-po-decisions-2026-09-24.md:66–70`; 1.0–2.x LABO evaluates and retains knowledge. Related UIL source/consumer are retained as related inputs only, not merged into P4 authority.

## 六本文pin

- BR `docs/helix-labo/L3-requirements/business-requirements.md` before SHA `9f56b674f11f9b666bc546a20e7a7492d1dfe377a24495d351392698c8389777` → after SHA `b201d0b7ebf8e3289bb914a354a3ee749f35b626852d2ab572c1b454ebcaca55` (32997 bytes).
- FR `docs/helix-labo/L3-requirements/functional-requirements.md` before SHA `0f11b654be30baae1749800ce3c184a146ceb4bce22710f762ef368f5d40e536` → after SHA `690421dd0bf5cae879e9c2f1cf18b9d046cabb8e89a1c2774a8a3b72be7f8399` (356465 bytes).
- NFR `docs/helix-labo/L3-requirements/nfr-grade.md` before SHA `d5838368f1ec9ee9e57cc143aa6e346ae1ff7f924d46c234880798098936b773` → after SHA `703ffcd721ca20a2efbead89de3648801f4071f3ee3ec58c578b8aa7f6029eda` (91447 bytes).
- BV `docs/helix-labo/L10-verification/business-verification.md` before SHA `54e42a8af0d30f7eb1c2b75810b51fab6197558633ab3bac7a50b024e581445e` → after SHA `d3d45f3162c86b29c4b2a10ee3d64fb7eb50c18f94185a5954f1b5db0b0b05de` (31603 bytes).
- FV `docs/helix-labo/L10-verification/functional-verification.md` before SHA `304aebc0edf618fd0eba2d73b745611b1d259ffd94429c0375df16ca58874bb4` → after SHA `fff8de19d9922d1c0e01226752f110044b3c694e371875666d24dd2789ec8185` (696007 bytes).
- NFRV `docs/helix-labo/L10-verification/nfr-verification.md` before SHA `922f8fccc63917178606dbb5edd165f5bdc6805de3753ead6d703b8342fdb8b7` → after SHA `0fcbc7b8b2475a88e225a08e4d0a0410cb02ec1678cb6a9d13b43947f62b9326` (82394 bytes).

## 静的検証

- `git diff --check`: PASS。
- 063 functional CASE定義: 72 unique IDs。NFR inventoryと72件が一致。分類候補は正常6、negative55、索引11。
- L3 AC-01/02/03とCASE行のAC対応、CASE03bの単一revision変異/戻し先、六本文post-change SHAを照合: PASS。AC-02はCASE02/68、AC-03はCASE03a–d/04a–b/06/08/09/11–66。CASE12/27/40/59は表のAC-03行にある補助negative例であり、AC-02 normative mappingに含めていない。
- L10実行、旧runtime/test/CIは未実行。

## 正式review原文pin

- #2630 review01 comment 6018603693: 6,873 bytes、SHA-256 `70064f1fe4e0a1f456f11934bf22da3208fa7208570e599d7712ec79ec66a5f1`.
- #2630 review02 comment 6018940116: 2,986 bytes、SHA-256 `f0bbb97da94e845dd6194d0b650cfd76c215027869515ea6aa227866a222b71f`.

## 限界

- CASEは設計候補で、実行/測定していない。旧runtime/test/CIは起動していない。
- R1/R2/R5/R7/R9/R10/R11/R15/R17を本修正の対象とし、その他の残余は過去記録どおり保持する。本文修正から承認済み状態を生成しない。
- 061 R4は別parentのため本差分へ混ぜない。
