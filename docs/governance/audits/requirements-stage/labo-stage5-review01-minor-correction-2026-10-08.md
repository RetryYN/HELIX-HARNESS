# LABO Stage 5 review01 Minor 1–4 訂正追補

この追補は、#2691 review01（comment `6046547648`）のMinor 1–4に対する本文訂正と出典を記録する。対象はLABO Stage 5の069/070/071に限る。正式comment本文はGitHub APIから取得し、UTF-8 5,020 bytes、SHA-256 `9695f60b77ef7f99d9ea133a3c9b0da6434aa9a82cf7c4a05599e98c180788b3`。対象review HEADは`faf298d280c91c96f1eb320ed77d4d65f281055a`、baseは`e7a695d4b2de64aec69a1a123de2fde33be724cf`。作業時にremote main `e77d62dcd`を取り込み、remote main `d629e25254a7c1d505543a0ce6ca3183c3fc4d67`を統合し、その後のHEAD `51f697dd5a187edd98cc5835476678a45f851c87`上で差分を作成した。

## 訂正内容

- **Minor 1（070のrate禁止根拠）**：固定L2-068の原文は対象率を「定義しない」とする。既存の`FR-LABO-068-03`がその意味を出力fieldの生成禁止へ導いている。070側のAC-04、NFR、L10 NFRV、CASE-131/132にこの導出経路を記した。あわせて、固定L2-070の9 atom範囲とL11-070の「分子・分母の適用可能性が証明できない場合はrateを出さない」境界を明記した。成功率の分母、oracle、閾値、ownerは追加していない。
- **Minor 2（AC-05 trace）**：AC-05へCASE-131/132を加え、rate誤出力を除去しても正常な067/068併記fieldを保持することを照合対象にした。両CASEのFR参照もAC-04とAC-05を示す。
- **Minor 3（071 r06 owner identity）**：baselineと期待結果の両方を「個別owner identityの値またはunknown状態をbaseline入力どおり保持」と揃えた。
- **Minor 4（監査参照path）**：既存の同時点監査、pin訂正、index/output訂正を同じ監査ディレクトリ内の相対pathで指す。既存記録は変更していない。

固定親L2/L11の本文revision、行span、full/span SHA、および旧sourceのrevision・path・full/span SHAは、併設JSONの`fixed_parent_pins`と`legacy_source_pins`に固定した。既存の旧semantic audit JSON自体は全CASE行を再照合していないというreview上の限界を引き継ぐ。

## 既存監査への相対参照

このファイルと同じ`docs/governance/audits/requirements-stage/`内の記録：

- `root-labo-stage5-semantic-audit-068-071-6f9462f1.md` と `.json` — 元の時点監査。SHA-256はそれぞれ`23ce55b8b04c0d77ec0b37964df1b4c18b5d2aa328c0108591c037500fa86ba6`、`caa8163f1de17567f477f042614e6852e546bf8f2530c14c3aae6d35ab954bc9`。
- `root-labo-stage5-main-pin-correction-2026-10-08.md` と `.json` — 39桁main pinの歴史的誤記訂正。
- `root-labo-stage5-index-output-repair-0d8fcb67.md` と `.json` — 069/070/071の修正記録とsource pins。

上記の以前のJSONに記載された`/tmp/...`は当時の出力場所としての歴史的記録である。この追補では、同一内容を保管するrepository内pathを示した。元監査と過去追補の内容は書き換えていない。

## 6本文のSHA

下表はreview対象HEADの本文をbefore、作業後の実ファイルをafterとして計測したSHA-256とbyte数である。L3/L10の全6本文を追補JSONに格納した。変更なしの本文も含めて固定した。

| 本文 | before SHA-256 | after SHA-256 | 変更 |
|---|---|---|---|
| BR | `057caceeb0d2269cfc58bec6011ea26233c4272cef71ec90fbaabc497f78d183` | `057caceeb0d2269cfc58bec6011ea26233c4272cef71ec90fbaabc497f78d183` | なし |
| FR | `25cf7d6ce217c68a9b5203fbd467b4ef1bdd15598782f82dfe1c83da55d420fa` | `4fca0d09872fd19fc03c1d3f7b78219fdb20fcf6e2d605b6f1818c79d30fa000` | あり |
| NFR | `a064f87616d83d2eac51e58b6ecaf2d1355798ae7deb711a208c05e7d9885772` | `4f81dc21e2256d8a484cf0d604c71d6fdb4d55875ae1d54225ab1c28a3f0d03a` | あり |
| BV | `f5a3000d0bec14e1eae44f3961d0ebc37acf94778efc92e035bf2eb6d25b84b5` | `f5a3000d0bec14e1eae44f3961d0ebc37acf94778efc92e035bf2eb6d25b84b5` | なし |
| FV | `98702111105905e2a7bbf562493652aa8378b7ce47804fda427054927bb77af4` | `41a9057a87c5f2bc1ca4f4b663ebb0ca0e3aa3eeb43326831c0362419e1583a8` | あり |
| NFRV | `f131998c58e45325d2b0888746ea648aa1ab13686ecc33d84c20e163b7ba3a88` | `c4a94cd1b91649d9f9e5f3b8ec8708c8c07bde2194689a905af1e9567fac3b78` | あり |

## 確認範囲と効力

`git diff --check`、追補JSONのparse、対象本文間のCASE/AC traceとowner identity表現の静的確認を実施する。fixture実行、旧runtime/CI/CLI実行はしていない。semantic-audit JSONの全CASE行SHA再照合、PO採択原記録本文の独立読了、274親全件の意味検収はこの追補の範囲外である。

この記録は本文訂正の証拠であり、承認、条件3、merge admission、PO事後確認、実行結果を生成しない。旧記録は不変のまま保持する。
