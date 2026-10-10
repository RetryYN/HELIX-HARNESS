---
title: "旧ルール群由来の要求候補57本と既存要求の重複候補cluster（RDP-002）"
status: draft
program_id: RDP-002
authority_effect: none
created: 2026-09-18
---

# 旧ルール群由来の要求候補57本と既存要求の重複候補cluster（RDP-002）

## これは何か

[旧ルール群から導いた要求候補](../../candidates/legacy-rule-derived-requirements.md)の57本（`RUL-*`）について、既存の対象別L2（HARNESS-L2-*、HELIXOS-L2-*）、既存の要求候補、旧要求（IR 153件・confirmed identity 175件）との関係を、[要求間の責務・機能重複review program](../../requirement-overlap-review-program.md)のrelation語彙で付けた。1要求1 clusterで、機械記録は[cluster台帳](legacy-rule-requirement-overlap-clusters.jsonl)にある。
関係付けはClaude Opusが行い、比較したrevisionはcluster台帳の`compared_revisions`にある。本書は重複候補の発見であり、要求の削除・統合・採否ではない。全clusterの`human_decision_ref`はnullである。

## 集計

| 主relation | 件数 |
|---|---:|
| partial_overlap | 40 |
| responsibility_split | 17 |

- 既存のどこにも関係が無い（`new_requirement_candidate`）: 3本 — `RUL-FRM-07`、`RUL-DEV-01`、`RUL-DEV-02`
- HARNESSの規範とOSの運転が混在（`responsibility_split`）: 17本 — `RUL-REL-01`、`RUL-COR-01`、`RUL-COR-02`、`RUL-COR-04`、`RUL-TKT-01`、`RUL-TKT-03`、`RUL-OSM-01`、`RUL-OSM-07`、`RUL-OSA-01`、`RUL-OSA-02`、`RUL-OSA-03`、`RUL-OSA-04`、`RUL-OSA-05`、`RUL-OSA-06`、`RUL-COR-07`、`RUL-OSA-08`、`RUL-OPS-01`。採否時にHARNESS側とOS側へ分ける候補。
- 既存要求と同一の意味（`exact_semantic_duplicate`）: 主relation・内部relationとも0本。RUL-OSA-03の旧2relationは下の原文比較によりpartial_overlapへ訂正した。旧identityと固有条件を保持する。

## 使い方

- システム群ごとのL2採否（#1852〜#1861）で、対応するclusterの`relations.existing_l2`を接続先候補、`legacy_requirements`を同一・包含の確認対象として使う。
- `responsibility_split`の要求は、HARNESS規範とOS運転へ分割する候補として人間判断へ送る。分割の実施は判断後の要求PRで行う。
- `new_requirement_candidate`の3本は、既存L2への追加候補として個別の要求PRで扱う。

## 確かめていないこと

- relationの正しさは1 model系統の判定であり、独立reviewは本PRのreviewに限る。人間判断はまだ無い。
- 旧要求との関係は分類台帳（system・層・product）に基づく候補であり、旧要求本文との逐語比較はしていない。参照IDは分類台帳のsource-qualified identityへ統一した（台帳に無い1件は`unresolved`）。
- `common_atoms`、`distinct_atoms_by_source`、`acceptance_differences`、`consumer_differences`、`unaccounted_atom_refs`は本書では未評価であり、台帳の`assessment_status`に`unassessed`と記す。空配列は「差分なし」を意味しない。programの完了条件はまだ満たしていない。

## 停止条件

- 本書とcluster台帳から、要求の削除・統合・採否・承認を生成しない。
- 主relationが`exact_semantic_duplicate`でも、原identityを消さない。

## 現在の本文比較：RUL-FRM-01（#1814、2026-10-10）

基準main `2a4882aea5e531fcd5d585b40dc4472537dafd57`。cluster台帳の`OVC-RUL-RUL-FRM-01.bounded_requirement_comparison`へ、原文span/hash、10比較軸、共通/固有条件、受入/consumer差、未比較集合を追加した。元のrelationと過去の比較revision、未評価fieldは歴史として保存する。

RUL-FRM-01の候補本文（工程順序とV-pairを閉じる）と、現行HARNESS001/003/004、NCI001/004、旧FR48/49・HBRP3・FRL103を要求粒度で照合した。双方向trace/片側欠落拒否と、未合意・未検証で進行させない方向は共通する。一方、001は現行層とL2.5区別、003は工程状態と段階証明/Backflow、004は変更影響、旧FR48/49は個別edge/oracle失敗、HBRP3はheld-out・機械/AI境界、FRL103は旧4artifact/PLAN/reportの条件を持つ。目的・入力・出力・回復・範囲が一致しないため完全重複としない。

元cluster noteの「上流未確定での下流進行禁止はL2表に明文なし」は現在の状態ではない。L11-003は未合意・未検証の進行拒否を明示する。この一般禁止を重ねる新候補は作らず、未比較の固有条件は残す。

| 比較範囲 | 結果 | 残るもの |
|---|---|---|
| 候補本文と上記要求の10軸 | 共通/固有条件を記録、partial_overlap維持 | formal successor/統合/retireは未判定 |
| 旧例3件 | 原文を読み、unique FR/placeholder/scenario、注釈regex、self-pairの差を記録 | 個別意味・consumerへの採否/同値証明 |
| underlying rule母集団 | 主294・副224のIDとinventory hashを全件保存 | 全518の個別比較、primary92sourceのconsumer閉包 |
| 全57cluster | 1clusterの候補本文比較を追加 | 他56と、このclusterのraw atom全比較 |

元の`assessment_status=unassessed`は全raw atom・consumer比較が未了であることを引き続き表す。追加した限定比較はその完了を代替しない。空配列を差分なしへ変換せず、未比較を#1814/親#1813で追跡する。rule所属は旧機械対応づけの候補であり確定ownerではない。要求意味/採否/承認、全条件被覆、holding解除、L3再開、#1814 closeを生成しない。旧実行系は全て非実行。

## 現在の本文比較：RUL-OSA-03（#1814、2026-10-10）

基準main `fb646ef29a4bdf01d46e7583210a442af4451ab7`。台帳の`bounded_requirement_comparison`へ13原文span/hashと10比較軸、変更前のrelation/noteを記録した。

旧HIL-BR-17/FR-30とRUL本文は、同責務の局所修正と独立責務の後続化では共通する。しかし旧要求の因果join、複数出力の原子的promotion、finding破棄/再流入/途中欠落の拒否と、RUL本文の一巡再審査・新独立blocker例外・対象変更staleは同一条件ではない。2本の`exact_semantic_duplicate`を`partial_overlap`へ訂正する。主relationの責務分割は保持する。

「一巡の再判定は旧要求に無く新規性がある」という旧noteも不正確で、旧AGENTS.md:327–328に同じ一巡/新独立blocker例外がある。現行HXT-FLOW-07には返却/次ticketの因果とfinding破棄/再流入/返却先欠落の負例があるが、現在の引用から旧全条件の採用や全同値を生成しない。DTK-OS-003は9/24の既決退役sourceで、歴史比較としてだけ保持し現行候補分母・successorへ復活させない。

主35・副40の全75rule IDとinventory hashを保全した。旧例3件の原文は確認したが、75ruleの個別全条件・consumer閉包・正式successorは未完である。既存の空配列と`assessment_status=unassessed`を完了へ変換しない。2clusterの本文比較があるが、他55とFRM01の518rule比較も残る。#1814/親#1813はOPENを保持し、要求統合・採否・retire・L3再開を生成しない。

## RUL-OSA-03：全75ruleのsource span比較（#1814）

`rule_source_comparison`に主35・副40の全75recordを原inventoryのまま保持し、列挙された全source spanの本文/行/hashと候補本文を一件ずつ照合した。各recordに共通する候補の句（D1〜D4）、固有又は未解決条件、原文support、consumer/正式successorの未完を記録した。以前の限定本文比較はその時点の記録として保持する。

処分先と一巡/staleの候補本文には、appeal・非終端receipt、promotion原子性、相談/継続/修正指示、lifecycle整合、時刻順序、QA doc-first、4種Backflowなどが入っていない。これらを候補本文へ縮退して被覆済みにしない。既存bug一律別PR、nonblocker一律後続、同reviewer sessionだけのblock解消、難易度別修正cycleも、現在の二分類/一巡と同じ操作又は条件ではなく、判断史・consumer・正式successorの照合へ残す。

| 原文対応の残件 | 確認した差 | 扱い |
|---|---|---|
| RE01-257 | v1.3:516にblocker一括返却はあるが、一巡/新独立blocker例外の句はない | RA-161に意味があることと、この行の直接根拠不足を区別し、inventory対応修正へ残す |
| RE01-258 | v1.3:516には局所correctness/securityがあるが、抽出文のdata loss/oracle/虚偽の列挙は当行にない | RA-162の別sourceを当行へ混ぜず、原文supportの範囲を確かめ直す |
| RG44-006 | 原文stateForにはmerge_conflict→blocked分岐があり、抽出文から落ちている | 全分岐・優先順を保持し、stateをfinding処分の二分類へ同一化しない |

原inventoryと旧sourceは変更していない。全75件についてsource spanと差分は記録したが、source隣接条件のatom境界、3件のsource対応修正、call/test/外部consumer閉包、正式successorは未完である。元assessment_statusと以前のpendingを完了へ書き換えず、未計上0を主張しない。#1814/親#1813はOPENを保持する。

## 抽出不備3件の比較用記述の訂正

3recordの`source_normalization`に、引用原文だけで成立する検索・比較用の文を記録した。RE01-257は「AI-Bはblockerを一括返却」、RE01-258は当行のlocal correctness/security修正と独立責務等の後続化、RG44-006はresolved/orphan/requested_changes/merge_conflict/その他の5分岐と優先順である。元inventory_recordと原文pinは不変で、unsupported句は削除せず保持する。一巡/新独立blocker例外はRA-161、blocker列挙と責務/scope条件はRA-162の別sourceにも残っているが、それをv1.3:516の根拠へ混ぜない。

registerのsupersedes鎖を再計算すると、現行の生存中holdingは`MPR-SH-LEGACY-RULE-005`（-004の配置訂正）である。以前の候補文書と研究記録の-004は当時のlocatorを示す。比較用記述の訂正は台帳/holdingの正式訂正を代替しない。台帳訂正には新digestを持つappend-only revisionと、直接pin 4 Binding・register consumer・生成rulebookの再照合が必要である。原inventory、register、Binding、rulebookはこの追補では変更していない。

3件の原文に忠実な比較用文は記録したが、source_holdingの訂正、consumer閉包、正式successor、atom境界は未完として#1814/親#1813へ残す。要求採否・意味のretire・holding解除・L3再開・Issue closeを生成しない。

## OSA03正式台帳の抽出訂正Draft

[訂正receipt](osa03-rule-source-extraction-correction-2026-10-10.json)に旧3recordの全field、原文pin、訂正後3record、before/after台帳digest、旧holding005とこのDraftで追記する006を固定した。RE01-257/258の過包含を引用行の直接条件へ訂正し、RG44-006のmerge_conflict分岐を回復する。7622 IDと候補routingは保持し、7619行はbytes不変。旧文を消さず、別sourceに残る一巡・blocker条件をretireしない。

registerは旧全prefixを保持してMPR-SH-LEGACY-RULE-006を一行追記する。source_preserved_unassigned/authority noneであり、要求採用やsuccessor成立ではない。仮ルール集59fileを再生成しgovcheckで7622件の保持を確認した。SCF-B-0002の入力pinを更新し、0011は47選択record全field不変＋validator、0021はfailure projection全field不変＋validatorで再照合した。0035は過去13 holding研究なので、訂正前の同一bytesを歴史snapshotへ保全し、generatorの読取先を固定して15path/13holdingのvalidatorを再照合した。

registerを直接pinする19 Bindingの固定BASE/current入力境界は再照合中である。このDraftではstaleを機械的pin更新で消さず、Ready/merge admissionを未成立とする。前の3件正規化と全75比較は訂正前の固定revisionに対する記録として保持する。正式台帳訂正の統合、残るconsumer、successor、他clusterのclosure、#1814 closeはまだ成立していない。

## register consumerの固定capture再照合（0095・0099）

[2件の再照合receipt](osa03-register-consumer-reconciliation-0095-0099-2026-10-10.json)に、現在のregister pinと実際の固定入力の違いを記録した。SCF-B-0095と0099は72b9f368の33行capture・MPR-SH-OUTSIDE67-001を使う研究である。現在のregisterでは001は002にsupersedeされており、旧001を現在の生存holdingと扱わない。同commitの全bytesを固定source snapshotへ保全し、2 Bindingの入力path/digestを当該captureへ訂正した。研究成果物・固定BASE・role・obligations・authorityは変更せず、各validator成功を確認した。

147 Bindingの構造検証はfail=0、残るregister staleは17件である。これは3件台帳訂正のmerge admission成立、要求採否・consumer closure・Issue closeを表さず、PRはDraftのまま維持する。残る研究では固定BASEとその後に更新された期待register digestの相違があるため、当時の入力revisionを別途特定してから再照合する。

## register consumerの後続input capture再照合（0057・0066）

[再照合receipt](osa03-register-consumer-reconciliation-0057-0066-2026-10-10.json)に期待digestと一致するGit revision `1c276ab2`（637行・45 live source holding）を記録した。これは研究の当初baseとは別の、その後に更新された入力digestの実revisionである。0057/0066の候補JSON/JSONLは不変のまま、register読取先とBindingを同一bytesのsnapshotへ束縛した。0066 selfcheckの成果物pathは現行research配置へ訂正した。両validatorと0057の42・0066の12 negative casesは成功した。

本文/metadataの以前の14/43 holdingと後続captureの45 holdingは現在の生存holding数を表さず、その時間的照合・研究全体のclosureは未完として各READMEに明記した。Bindingの役割・義務・authorityは変更しない。構造検証147件fail=0、残るstale Bindingは15件（0040はregisterに加えてfirst15 generator変更にも依存）であり、Draft維持・Ready/merge未成立とする。旧source/consumerの全closure、正式successor、要求採否、Issue closeは生成しない。

## register consumer 11件の固定入力再照合

[11件の再照合receipt](osa03-register-consumer-reconciliation-eleven-2026-10-10.json)に0062・0069・0071・0073・0074・0076・0079・0085・0087・0090・0092の固定入力を記録した。各期待digestに一致する1c276ab2の637行captureへ読取先とBindingを束縛し、selfcheckの成果物pathを現行research配置へ訂正した。0069の旧配置4参照は論理pathを保ったまま現行配置へ解決する。削除済みcounterpart052/056と改訂済み060は、元digestに一致するGit本文を歴史snapshotへ保全した。現在の要求・承認として復活させない。

11 validatorと既存224 negative casesは成功し、全候補JSON/JSONL・Bindingの責務/義務/接続/操作/置換は不変である。生成スクリプト3件はregister読取先のみ整合させ、syntaxと置換範囲を静的確認した。全再生成は実行していない。過去のholding数metadataと後続input更新の時間的整合、全研究の意味/consumer closureは未完として保持する。

構造検証147件fail=0、残るstaleは0040・0083・0096・0121の4件。0040はfirst15 generatorの変更にも依存する。PRはDraftを維持し、Ready/merge admission、正式successor、要求採否、holding解除、L3再開、#1814/親#1813 close、全要求ステージ完了は未成立である。
