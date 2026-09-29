# 旧Requirement Authority Materialization候補 metadata 10行の分類修正提案

## 概要

- 基準main: `d4f1c4739fb920abdc5f951646e43a5c3e501af5`（#2380 merge後）。分類基準は#2353の全4,755 `row_records`（commit `97672630b7de70fd4433827730c390cbabd90a99`、JSON SHA-256 `2c025c878ce1b63d93531ee980b08c785ba9273d6db6f751cf3237ce31d6696c`）。
- authority effect: `none`。本書と対応JSONはboundedなclassification proposalで、旧source本文・carry-forward台帳・router・#2380 route auditを変更しない。
- #2380 R2380-02が分類再確認候補としてflagした10 exact source IDだけを対象にする。各行を`explanation / subtypeなし / not_condition`へ提案する。10件は#2380で既にroute判定された行なので、その歴史的なroute結果を書き換えない。
- 件数は適用前後を区別する。overlay適用を仮定するとproduct/unknown poolは488→478、監査済みunionとの交差は298→288、未監査poolは190のまま。これは条件付き提案算術で、現時点のeffective classificationを宣言しない。

## 旧source・inventory-first根拠

- `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirements-authority-materialization-requests.md` — asset `LEGACY-ASSET-76608A4341AF0CF64422`、file SHA-256 `5d3393f7f733249ff8c248a0f6b8563a8974712d9832acdccc93feda1d42b502`。
- `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirements-authority-materialization-requirements.md` — asset `LEGACY-ASSET-34FCBDC6DA5E5ECDC5C5`、file SHA-256 `7d9aa41c2ea2da9b29b92717bfeab94c35c28849be63b70301ddfc961cb21578`。
- asset ID・path・file digestは`docs/governance/legacy-asset-disposition.jsonl`、source ID・物理行・line digestは`docs/governance/legacy-migration/candidate/legacy-candidate-source-line-carry-forward.jsonl`と照合した。
- 旧sourceと保持する点: 旧文書の識別情報、status、Behavior Contract ID、fixture/Issue参照は原文のまま保持する。提案する変更は、それらの単独行をrequirement atomとして数える分類だけである。

## 分類根拠とprecedent

- #2356の`legacy-candidate-source-metadata-reclassification`は、文書ID・単純なstatus・Behavior Contract ID・Issue/receipt参照を、独立した規範的述語がない場合に`explanation`とするexact-ID overlay precedentである。本文の実要求とauthority/process条件は別source IDで保持する。
- #2372 execution-ticket-family route auditは13行をclassification-review候補として記録し、そのroute audit内ではclassificationを変えず、別のclassification reassessmentへ引き渡した。本proposalも#2380のflagを分類決定と混同せず、別overlayとして記録する。
- 003940–003942と003984–003986は、文書ID、文書状態、Behavior Contract ID、主Issue番号を記すheader metadataであり、単独では製品動作、受入条件、authority遷移を述べない。
- 003961–003964は「初期監査fixture」節にあるIssue参照行である。各行はfixture名と参照先を識別するが、各Issue ID自体に独立のroute述語があるとは推定しない。参照対象の意味・採択・successorはこのoverlayから生成しない。
- 隣接する003965「#1358/#1363系列は初期fixtureへ含めない。authority collision監査のC-01/C-02を本gateのepoch／freeze oracleとして扱う」は規範的なfixture境界・oracle条件であるため、対象外にし、`condition / product_requirement_atom / unknown`を維持する。

## 対象ID・原文hash

全行のeffective baselineは#2353で`condition / product_requirement_atom / unknown`。source-line SHA-256は改行を除いた本文、physical-line bytes SHA-256は末尾改行を含む行bytesのhashである。

| Source ID | 旧source path:line | 提案分類 | source-line SHA-256 | physical-line bytes SHA-256 |
|---|---|---|---|---|
| `LEGACY-CAND-LINE-003940` | `...requirements-authority-materialization-requests.md:19` | explanation | `3d041e4a6093cfb8ac2d850982e702a241c91e951e0e01c82721c27a9c097b0f` | `bd6bc2e515be09181aaae87f9b3725a335f76600c607d38bfa168cf8cd8a39f6` |
| `LEGACY-CAND-LINE-003941` | 同:20 | explanation | `ca3d7c54a81ae24ec5232e843cc90410b2ea737d802be6bdaac8eb200bbc84f4` | `08afbfaeb02bc4c4ca7c73f3c58565992d7e0bc85c1b340b2a3b6ae377e6667e` |
| `LEGACY-CAND-LINE-003942` | 同:21 | explanation | `9a694a58f289d245935ba55a4c570270e7faca09303a2477646ec3139a4fd896` | `89e3c79c79d3a515964a92f12c5e558194c3e8123246aa9b791e9322f9240472` |
| `LEGACY-CAND-LINE-003961` | 同:57 | explanation | `e4161c4266d233ce8efae663e5c425f660e0fc1266eeea81094053244734d085` | `a737144ef9af0149b5c7ecbed4f4281070fe77052bf4edd771f7be84776550f3` |
| `LEGACY-CAND-LINE-003962` | 同:58 | explanation | `1c6715241b7170e54385b77ff58d516bfa2416842784c0e1c9727cc9b510fa2f` | `ce7fd2ad31b414c4c98fd1ba15273272f573ee9eff895663602e547d0ebfe386` |
| `LEGACY-CAND-LINE-003963` | 同:59 | explanation | `7fa2ca9d9f261a28bc398afca4f43d876d3b2a6ab12a0808bb158560eead546f` | `e9db9713023cc561627ebbd5b803fdf294d5b4ec8cca8cdac0cd1a558e743dd0` |
| `LEGACY-CAND-LINE-003964` | 同:60 | explanation | `f288ae0fa8a2e47e3df7cba33eaad60f859b9445de899d9e0fd6879c463de5e5` | `2f8fd425564cbd29ec88b7306956fc126694f3dd201be3e1dbf7aae82dc937a7` |
| `LEGACY-CAND-LINE-003984` | `...requirements-authority-materialization-requirements.md:20` | explanation | `ae762b71c42d2d7d1622a154a5fdb80158816e2196d62a2a7986eae0022ef5d8` | `bdb1d0b5b0f47cf319c25aac3c17c4969c9c2ccb3477624da475b34e71d5262d` |
| `LEGACY-CAND-LINE-003985` | 同:21 | explanation | `ca3d7c54a81ae24ec5232e843cc90410b2ea737d802be6bdaac8eb200bbc84f4` | `08afbfaeb02bc4c4ca7c73f3c58565992d7e0bc85c1b340b2a3b6ae377e6667e` |
| `LEGACY-CAND-LINE-003986` | 同:22 | explanation | `392077288bc189f0b59cd1da4265d6c1ed4b89b12794598d6c9de823c0f7926b` | `4783e029b60b806560d95e501dad9762782cd6ea896ec72a0e3f2975151eb9c8` |

### 意味上のリスク

003961–003964のfixture列挙全体に独立した規範的な集合意味を持たせる解釈なら、各参照行を単独atomにしない形でsource spanを再評価する必要がある。本proposalは各Issue IDを別個の要求として扱わず、隣の003965にある明示的なfixture除外・oracle規範も保持する。旧source本文は変更せず、曖昧さはこの分類理由に限定して記録した。

## overlayと件数の適用順

適用順は、#2353全量row-record baseline → #2356/#2360/#2363/#2366/#2367/#2368/#2369の既存提案overlay → 本10-ID proposal overlayである。既存7 overlayとのexact-ID交差はすべて0。#2380のselected 27 ID集合とは10 IDが交差するため、後続のroute選定ではこのoverlay後のpoolを使用し、#2380の過去route記録は編集しない。

| 指標 | 適用前 | 本overlay適用を仮定 | 差分 |
|---|---:|---:|---:|
| product / unknown proposal pool | 488 | 478 | -10 |
| #2378までのprior route union | 290 | 290 | 0 |
| #2380 selected IDs | 27 | 27 | 0 |
| 累積route audited union | 317 | 317 | 0 |
| poolとaudited unionの交差 | 298 | 288 | -10 |
| 未監査pool | 190 | 190 | 0 |

算式: `488 - 10 = 478`; `290 + 27 = 317`; `298 - 10 = 288`; `478 - 288 = 190`。10件はすでに監査済みunion内にあるため、pool件数と監査済みpool交差がともに10減り、未監査件数は変わらない。

## 限界

- このclassification proposalは旧要求の採択、successor割当、coverage、解決、受入、実装、retire、完了を示さない。
- #2380の10 route行は当時の入力・判断を示す履歴記録として保持する。ここでその本文・件数・partial/unknown集計は書き換えない。
- 旧workflow、CLI、hook、adapter、runtime、test、CIは実行していない。source ID、archive bytes、line/file digest、asset、baseline row、overlay交差を静的照合した。
