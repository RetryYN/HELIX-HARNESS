# LABO068 review13 M1 postbody時点監査

PR #2638 / `be9660ecdee7cb7458606388a0946576d7d3ef20` / base `0acbed34bfda48e32092feb63db61d2eff6d5ec4` / 作成日 2026-10-07

read-only時点監査です。canonical本文と過去の監査記録は変更していません。

## 6本文の実blob pinとbase prefix

| 文書 | 実本文 bytes / SHA-256 | base bytes / SHA-256 | base prefix一致 | append delta bytes / SHA-256 | 候補after一致 |
|---|---|---|---|---|---|
| `docs/helix-labo/L3-requirements/business-requirements.md` | 23944 / `5339b4a1fda5905f3e68713e997f0a552219b62a7ab209567042923bc30838ac` | 17356 / `6eb0e6094202a519d34b84670c7c9fa9143ced0c8e25883bddc22c9a395feae7` | yes | 6588 / `cdce88ca74574c835e427e07bfb91b4120bcd1a1e4166f0aa9c9eaf06bc09bc3` | yes |
| `docs/helix-labo/L3-requirements/functional-requirements.md` | 325290 / `f0ae56df44fe68a2860e24f52e2df742bb92e8146f3cd4de1378474f6ccd6cb6` | 314755 / `24dff56c5e90120360fe446c38e1e3b4b4b58db569fa8eb40d2be8b338161426` | yes | 10535 / `a69ee20015755ab390d40f8b2623b0ccda5f7db020b5223b12430f0060225ee6` | yes |
| `docs/helix-labo/L3-requirements/nfr-grade.md` | 78563 / `acabb4f7ec6c84fd2c530f22f4cf36118ae46f01d7418b28b6e5b36e1c712d14` | 70949 / `e39aadaf35521a2c9c49001581c2d6e7770156749a0705666105b579b4387be7` | yes | 7614 / `f79a84116a8d327ba7ccf709d5f211b1074c55f8e0a5e8f692e3dd8a99203de5` | yes |
| `docs/helix-labo/L10-verification/business-verification.md` | 21732 / `2b166aa8b0c7df3a6f9f50f84a66eaf34afc16b6f56cdecd4ad76babd6702200` | 15331 / `43115cad1beeeb4aa887c80206936d2ecec6ef507447a559b4544222f8ccb089` | yes | 6401 / `47991ddef6762a5d4f6141a7381bbcf0822cac35dc814bcd4e24a3de51027234` | yes |
| `docs/helix-labo/L10-verification/functional-verification.md` | 514388 / `409d24b38484bf70401777256560bb4518ca85528fb4d2ad5dc26cc3d205f53b` | 487997 / `2d0d893deb6ce95836b5b1b1f3b6a01511db36ce956a881788b5de1c26f5783b` | yes | 26391 / `cc28a08b9721d8e8096e24dcbf420684717e6dfb82a191ef4738fa2c4f7ae8b5` | Root count-line correction |
| `docs/helix-labo/L10-verification/nfr-verification.md` | 68087 / `a2cc22543cd838ada62fe915396c8ff398dbd3e176a3aec5979dc2dea3373060` | 60801 / `d2c9c508465305c3edf9af1f6d2d247cd19f07617aefeca25f320eeaba56ceca` | yes | 7286 / `76e9570984c22cd4d7663adbac61d1ba519dcb7b07ef9027ebfaf855be69b68d` | yes |

6文書すべてがmain base `0acbed…` のblobを完全なbyte prefixとして保持します。Rootが候補後にFVの件数説明を一文だけ修正し、CASE行自体は候補と一致します。

## CASEとM1対応

既存43 IDはすべて保持され、CASE-31/32の2 IDが追加されて、現行matrixは45行・45 unique ID・6列です。CASE-01の正常fixture行は親HEADと現bodyでbyte一致です。

| 固定親の項目 | 不明 | 矛盾 | stale |
|---|---|---|---|
| 範囲 | CASE-05 | CASE-13 | CASE-06（revision） |
| Attempt identity | CASE-03a | CASE-10 | CASE-06（record） |
| 記録の完全性 | CASE-03b（receiptなし）, CASE-17（根拠なしassertion） | CASE-31 | CASE-32 |

CASE-31はscope S0/R0/E0、A–Dのidentity集合、OS観測record、state、event/result/correctionを固定して完全性receiptの集合記載だけを矛盾させます。CASE-32は同じ正常入力のまま完全性receiptのrevision参照だけを旧revisionに変えます。両方のoracleは総数unknown/未評価、既存OS記録または観測source責務区分への返却、個体identity unknownの別記です。

## 維持した履歴・source

- 正式review13 comment 6026581399: 4940 UTF-8 bytes, SHA-256 `e827304a38f437c37ce24f3265f1cf50a87dd67ec60c28fed7bfdc032cfc0537`。R28–R30の原文を保持。
- review12 postbody audit: 1100254 bytes, SHA-256 `c34dfdeb9029a00049e32aed1bd364153b9ac36b370db1aab80816e4c07769a1`。完全JSON objectを本sidecarにも保持し、R1–R27のhistoryとold38 raw literalを継続。過去audit bytesは不変。
- 旧38 raw physical rowsを旧parent `e00bf5600f786e253e1c9940d050a66c91bda2d3` のL10 FV blobで38/38再照合。
- 固定318 L2:541–550 span SHA `7e3df32b0131722c88ae148c4cbfa9a1be20f81826099c0ceb29a674e07030e2`、L11:278–286 span SHA `3dcf068de1351b2e8c1f2d772ec9273cb7908368a32b389ee40ce51929ad8d94`。

Root報告: govcheck PASS、57/58 diff checks PASS。ここでは6本文のactual blob、base prefix、候補との差分、case/raw/pinsを再計算しました。fixture実行、独立review、Fable判断、PO承認は行われていません。

JSON sidecar includes all six hashes/bytes, exact Root one-line diff, R1–30 raw preservation, old38 rows, and source spans.
