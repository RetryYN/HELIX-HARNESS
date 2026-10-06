# LABO070 review05 postbody時点監査

PR #2648 / body `eed7918a2bf81952826f382af509bf0c446097dd` / base `0acbed34bfda48e32092feb63db61d2eff6d5ec4` / fixed L2/L11 `ea6f756f96a7370de78e412d737c7a7ed472114a`

Root適用後のread-only実blob監査。Worktree status: `## l3-labo-stage5-parent070...origin/l3-labo-stage5-parent070 [ahead 1]`。canonical本文は変更していない。

## 6本文の実blob・base prefix・候補との差分

| path | bytes / SHA-256 | base prefix | append delta | v2候補after一致 |
|---|---|---|---|---|
| `docs/helix-labo/L3-requirements/business-requirements.md` | 19207 / `532d6eec38aa509dc7b0a830bb8bc24452b67a80abb778a70eb0c4cb2b9c0263` | exact_base_blob_prefix (`6eb0e6094202a519d34b84670c7c9fa9143ced0c8e25883bddc22c9a395feae7`) | 1851 / `b024185f2edda81a134a748e8a5eb8ae3f1c0ee17be5693659188b37a9dd25b4` | yes |
| `docs/helix-labo/L3-requirements/functional-requirements.md` | 324054 / `82e48300ecbfbf034a610cf23a90d1ae4839b5708440ae4823154b6fe71d2600` | exact_base_blob_prefix (`24dff56c5e90120360fe446c38e1e3b4b4b58db569fa8eb40d2be8b338161426`) | 9299 / `414569837e7a633f7c946f58594660daf45d4d51ef279841d031383a26c25bca` | Root correction |
| `docs/helix-labo/L3-requirements/nfr-grade.md` | 74907 / `6b253edcec8dfcc2057a30f19298b1fd1ce5251faf15758645339b813c161b29` | exact_base_blob_prefix (`e39aadaf35521a2c9c49001581c2d6e7770156749a0705666105b579b4387be7`) | 3958 / `ce81933f6dc46f091bd95365f8a46e4644af315ef057529fb12ec09e30ed9938` | yes |
| `docs/helix-labo/L10-verification/business-verification.md` | 18009 / `b2fab1b0d29357de15c8db368fadd0c0a5f9389230e3400e7360763b5b9e8a20` | exact_base_blob_prefix (`43115cad1beeeb4aa887c80206936d2ecec6ef507447a559b4544222f8ccb089`) | 2678 / `02944f48239f672110b6bb6bb003334051ec6353dca91ea7ac44ee84f216daa6` | yes |
| `docs/helix-labo/L10-verification/functional-verification.md` | 565340 / `6cf32d195633f43eacb9ba2d909da450e505e1ef834d01ccb04e528f21402d18` | exact_base_blob_prefix (`2d0d893deb6ce95836b5b1b1f3b6a01511db36ce956a881788b5de1c26f5783b`) | 77343 / `b15f797a1187a367d234b430ccf2b1c68a80587e12c0cdcff76f6618518acb83` | Root correction |
| `docs/helix-labo/L10-verification/nfr-verification.md` | 65667 / `2c4164c87133454ce6ac0e5bb439398297cbd5db30584d96774a63659ae17c96` | exact_base_blob_prefix (`d2c9c508465305c3edf9af1f6d2d247cd19f07617aefeca25f320eeaba56ceca`) | 4866 / `336d7f7e1c96e7d56a7a72b8fec76868effbcc9af3649cdf9dc7bb363a3d25a5` | yes |

v2候補afterと異なる2文書についてはJSONにactual-vs-v2の全文unified diffを保存した。Rootが示したFR本文の「既存CASEとCASE-110〜123で」補正、およびFV新行句読点補正として記録し、意味・状態集合・authority範囲の追加変更を確認していない。

## CASEと文書整合

- 現行matrix: 126 unique ID、126行、全行6列。旧109 ID保持、新規17 ID: CASE-110〜126。CASE-109→110は空行なく連続。
- CASE-119〜122はtarget_revision、target identity、source_revision、event_identityの各1 fieldだけを変異し、それ以外の関連値をbaselineで固定。
- CASE-01はsource receipt provenance実値との一致を正常oracleに含み、CASE-125/126がprovenance出力fieldの欠落/別値をそれぞれ拒否する。
- NV追加行は既存の3列表内に3セルで配置。FRはreview時点の件数説明を含まず、BRのL10単独出力fixture要件を保持。
- 正式reviewは「17マス」と述べる一方、表の太字×は14セル。14セル+時計不正1+M2 provenance2を追加17行へ対応させ、未特定3セルは推測追加していない。

## 固定親・履歴

- L2-070 actual span SHA `07d9114fe55ed6bea2522756652cadec23f89397c619429360062256dc94e533`、L11-070 `c6268c5f97bfa3d87a1075d9aa6eac2eca20593e611c9aadcd92ee1025e9beb1`。revision `ea6f756f96a7370de78e412d737c7a7ed472114a`。旧0abb2894とspan bytes一致。
- PO live26 row 49: `b7a22604f813c40a97dfabf06a360b4bc1ce4d2856ab98edf953486463e0335c`。旧source execution-ticket-requirements.md:399 line SHA `aa9dacc58969d896bbfbe38ce9c2ed6b55f47476b4cd3a411041d62bebf70468`。
- 旧84 raw literal/25 source pin historyはv2側の固定source/history objectに保持。旧84 actual checkpointは84 unique ID・raw hashes validate。R1–14 formal raw、過去のX1 immutable audit参照をこの監査JSONにも保持。

## 検証の範囲

六blob SHA/bytes、base prefix/suffix、v2比較差分、ID/列/連続性、CASE-119〜122、NV表セル数、固定source pinsを読み取りで再計算した。Root報告のgovcheck atoms=7622・requirements=57・files=58、および本文差分の`git diff --check` PASSを記録し、ここでは再実行していない。過去のX1 immutable例外は別記録として保持する。fixture実行、独立review、Fable判断、PO承認は成立していない。
